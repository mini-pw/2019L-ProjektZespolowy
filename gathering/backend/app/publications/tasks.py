import os
import tempfile

import requests
from django.core import files

from config.celery import app
from publications.models import Publication, Page
from services.converter import convert_pdf_to_png
from tesserocr import *

@app.task
def save_file_locally(publication_id):
    publication = Publication.objects.get(id=publication_id)
    try:
        if not publication.local_file:
            request = requests.get(publication.remote_file, stream=True)
            if request.status_code != requests.codes.ok:
                return
            base_name, ext = os.path.splitext(
                publication.remote_file.split("/")[-1]
            )
            file_name = f'{base_name}{ext}'

            lf = tempfile.NamedTemporaryFile()
            for block in request.iter_content(1024 * 8):
                if not block:
                    break
                lf.write(block)
            publication.local_file.save(file_name, files.File(lf))

        # fixme: move to separate task
        pages_dir = tempfile.TemporaryDirectory()
        lf = publication.local_file
        for i, file in enumerate(convert_pdf_to_png(lf.path, pages_dir.name)):
            page = Page.objects.create(number=i + 1, publication=publication)
            with open(file, "rb") as f:
                page.image.save(f'publication_{publication.id}_page_{i + 1}.jpg', files.File(f))
            page.save()
    except Exception: # yup, too broad ¯\_(ツ)_/¯
        publication.download_status = Publication.DOWNLOAD_FAILED
    else:
        publication.download_status = Publication.DOWNLOAD_DONE
        perform_ocr.delay(publication_id)
    publication.save()

@app.task
def perform_ocr(publication_id):
    publication = Publication.objects.get(id=publication_id)
    pages = Page.objects.filter(publication=publication)

    with PyTessBaseAPI() as tess:
        for page in pages:
            try:
                tess.SetImageFile(page.image.path)
                tess.Recognize()
                tsv = tess.GetTSVText(0)
                data = []
                width, height = tess.GetThresholdedImage().size

                for line in tsv.split("\n"):
                    if len(line) == 0:
                        continue
                    fields = line.split("\t")
                    if len(fields) != 12:
                        continue

                    if len(fields[-1]) == 0:     #skip empty boxes
                        continue

                    x1 = int(fields[-6])
                    y1 = int(fields[-5])
                    x2 = x1 + int(fields[-4])
                    y2 = y1 + int(fields[-3])
                    data.append({
                        "text": fields[-1],
                        "x1": x1 / width,
                        "y1": y1 / height,
                        "x2": x2 / width,
                        "y2": y2 / height
                    })

                page.ocr = data
                page.save()
            except Exception:
                page.ocr = "Error processing page."
                page.save()
