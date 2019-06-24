from pdf2image import convert_from_path
import os

def convert_pdf_to_png(path, path_to_pages):
    pages = convert_from_path(path)
    _, filename = os.path.split(path)

    pages_paths = []
    for idx, page in enumerate(pages):
        png_path = os.path.join(path_to_pages, filename.split('.')[0] + '_page_{}.png'.format(idx + 1))
        pages_paths.append(png_path)
        page.save(png_path, 'PNG')

    return pages_paths