import json
from xml_writer import XMLWriter
import os
import glob
from PIL import Image


class FRCNNFileTransformer:
    def __init__(self, plot_paths, plot_output_path, xml_output_path):
        self.plot_paths = plot_paths
        self.plot_output_path = plot_output_path
        self.xml_output_path = xml_output_path

    def extract_images(self):
        os.makedirs(self.plot_output_path, exist_ok=True)
        os.makedirs(self.xml_output_path, exist_ok=True)
        writer = XMLWriter()
        for path in self.plot_paths:
            annotation_file = open(os.path.join(path, 'results', 'annotations.json'))
            annotation = json.load(annotation_file)
            annotation_file.close()
            for png_file in glob.glob(path + '/results/png/*.png'):
                im = Image.open(png_file)
                width, height = im.size
                file_name = png_file.split('/')[-1]
                new_file_name = path + "_" + file_name
                writer.create_faster_rcnn_xml(new_file_name,
                                              self.plot_output_path,
                                              os.path.join(self.plot_output_path, new_file_name),
                                              width,
                                              height,
                                              int(annotation[file_name][0] * width),
                                              int(annotation[file_name][2] * width),
                                              int(annotation[file_name][1] * height),
                                              int(annotation[file_name][3] * height),
                                              os.path.join(self.xml_output_path,
                                                           path + "_" + file_name.split('.')[0] + '.xml'))
                im.save(os.path.join(self.plot_output_path, new_file_name), "PNG")


if __name__ == '__main__':
    FRCNNFileTransformer(['biologyAreaGraph', 'biologyBarGraph', 'biologyLineGraph',
                          'financeAreaGraph', 'financeBarGraph', 'financeLineGraph',
                          'spanishAreaGraph', 'spanishBarGraph', 'spanishLineGraph'],
                         'plots',
                         'xmls'
                         ).extract_images()
