import json
from xml_writer import XMLWriter
import os
import glob
from PIL import Image

class FilesReader:
    def __init__(self, plot_paths, plot_output_path, xml_output_path):
        self.plot_paths = plot_paths
        self.plot_output_path = plot_output_path
        self.xml_output_path = xml_output_path

    def extract_images(self):
        os.makedirs(self.plot_output_path, exist_ok=True)
        os.makedirs(self.xml_output_path, exist_ok=True)
        writer = XMLWriter()
        for path in self.plot_paths:
            annotation_file = open(os.path.join(path, 'annotations.json'))
            annotation = json.load(annotation_file)
            annotation_file.close()
            for png_file in glob.glob(path + '/*.png'):
                im = Image.open(png_file)
                width, height = im.size

