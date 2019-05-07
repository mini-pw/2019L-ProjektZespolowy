import json
from xml_writer import XMLWriter
import os
import glob
from PIL import Image


class FRCNNFileTransformer:
    def __init__(self, plot_paths, classes, plot_output_path, xml_output_path, ):
        self.classes = classes
        self.plot_paths = plot_paths
        self.plot_output_path = plot_output_path
        self.xml_output_path = xml_output_path
        self.res_dir = 'results'

    def extract_images(self):
        os.makedirs(self.plot_output_path, exist_ok=True)
        os.makedirs(self.xml_output_path, exist_ok=True)
        writer = XMLWriter()
        for path, class_no in zip(self.plot_paths, self.classes):
            annotation_file = open(os.path.join(path, self.res_dir, 'annotations.json'))
            annotation = json.load(annotation_file)
            annotation_file.close()
            for png_file in glob.glob(os.path.join(path, self.res_dir, 'png', '*.png')):
                im = Image.open(png_file)
                width, height = im.size
                file_name = png_file.split('/')[-1]
                new_file_name = path.split('/')[-1] + "_" + file_name
                writer.create_faster_rcnn_xml(new_file_name,
                                              self.plot_output_path,
                                              os.path.join(self.plot_output_path, new_file_name),
                                              width,
                                              height,
                                              int(annotation[file_name][0] * width),
                                              int(annotation[file_name][1] * height),
                                              int(annotation[file_name][2] * width),
                                              int(annotation[file_name][3] * height),
                                              os.path.join(self.xml_output_path,
                                                           path.split('/')[-1] + "_" + file_name.split('.')[0] + '.xml'),
                                              class_no)
                im.save(os.path.join(self.plot_output_path, new_file_name), "PNG")


if __name__ == '__main__':
    FRCNNFileTransformer([os.path.join('documents', folder) for folder in os.listdir('documents')],
                         [0, 0, 0, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7],
                         './png',
                         'xmls'
                         ).extract_images()

    FRCNNFileTransformer([os.path.join('documents_img', folder) for folder in os.listdir('documents_img')],
                         [0, 2, 3, 4, 5, 6, 7],
                         './png',
                         'xmls'
                         ).extract_images()
