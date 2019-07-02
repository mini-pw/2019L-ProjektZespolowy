import os
import tempfile

import requests
from django.core import files

from config.celery import app
from publications.models import Publication, Page
from services.converter import convert_pdf_to_png

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
    publication.save()

