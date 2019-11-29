from pdf2image import convert_from_path
import os

def convert_pdf_to_png(path, path_to_pages):
    if not os.path.exists(path_to_pages):
        os.mkdir(path_to_pages)
    pages_paths = convert_from_path(path, dpi=400, output_folder=path_to_pages, fmt='png', paths_only=True)

    return pages_paths
