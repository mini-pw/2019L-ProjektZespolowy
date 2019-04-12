from xml_writer import XMLWriter
import xml.etree.ElementTree as ET
import os
from PIL import Image

dataset_path = '/home/piotr/Uczelnia/ProjektZespolowy/tables'
transformed_dataset_path = '/home/piotr/Uczelnia/ProjektZespolowy/tables_transformed'

def main():
    if dataset_path is None or transformed_dataset_path is None:
        print('Please set the path to dataset and the name of directory where the annotations will be placed')
    files = os.listdir(dataset_path)
    sample_names  = [x.split('.')[0] for x in files]
    sample_names = list(set(sample_names))
    if not os.path.exists(os.path.join(transformed_dataset_path, 'Annotations')):
        os.makedirs(os.path.join(transformed_dataset_path, 'Annotations'))
    if not os.path.exists(os.path.join(transformed_dataset_path, 'Images')):
        os.makedirs(os.path.join(transformed_dataset_path, 'Images'))
    for sample_name in sample_names:
        any_vaild = False
        img_path = os.path.join(dataset_path, sample_name+'.jpg')
        im = Image.open(img_path)
        width, height = im.size
        old_annotation_path = os.path.join(dataset_path, sample_name+'.xml')
        old_annotation = ET.parse(old_annotation_path)
        root = old_annotation.getroot()
        table_coordinates = []
        for table in root.iter('table'):
            coords = table.find('Coords').get('points').split(' ')
            coords = [(int(x.split(',')[0]), int(x.split(',')[1])) for x in coords]
            if coords[0][0] == coords[3][0] and coords[0][1] == coords[1][1] and coords[1][0] == coords[2][0] and coords[2][1] == coords[3][1]:
                table_coordinates.append([coords[0][0], coords[0],[1], coords[2][0], coords[2][1]])
                any_vaild = True
        if any_vaild:
            XMLWriter.create_faster_rcnn_xml_multiple(sample_name+'.png',
                os.path.basename(os.path.normpath(transformed_dataset_path)),
                os.path.join(os.path.join(transformed_dataset_path, Images), sample_name+'.png'),
                width,
                height,
                table_coordinates,
                os.path.join(transformed_dataset_path, 'Annotations', sample_name+'.png'))
            im.save(os.path.join(transformed_dataset_path, 'Images', sample_name+'.png'), 'PNG')
    


if __name__ == '__main__':
    main()