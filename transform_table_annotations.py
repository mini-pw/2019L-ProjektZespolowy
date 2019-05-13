from xml_writer import XMLWriter
import xml.etree.ElementTree as ET
import os
from PIL import Image
from sklearn.model_selection import train_test_split

dataset_path = '/home/piotr/Uczelnia/ProjektZespolowy/ICDAR2019_cTDaR/training/TRACKA/ground_truth/'
transformed_dataset_path = '/home/piotr/Uczelnia/ProjektZespolowy/tables_transformed'
mode = 'train'

def main():
    if dataset_path is None or transformed_dataset_path is None:
        print('Please set the path to dataset and the name of directory where the annotations will be placed')
    files = os.listdir(dataset_path)
    sample_names  = [x.split('.')[0] for x in files]
    sample_names = list(set(sample_names))
    sample_names = [x for x in sample_names if x.startswith('cTDaR_t1')]
    if not os.path.exists(os.path.join(transformed_dataset_path, 'Annotations')):
        os.makedirs(os.path.join(transformed_dataset_path, 'Annotations'))
    if not os.path.exists(os.path.join(transformed_dataset_path, 'JPEGImages')):
        os.makedirs(os.path.join(transformed_dataset_path, 'JPEGImages'))
    for sample_name in sample_names:
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
            xs = [x[0] for x in coords]
            ys = [x[1] for x in coords]
            table_coordinates.append([min(xs), max(xs), min(ys), max(ys)])
        writer = XMLWriter()
        writer.create_faster_rcnn_xml_multiple(sample_name+'.png',
            os.path.basename(os.path.normpath(transformed_dataset_path)),
            os.path.join(os.path.join(transformed_dataset_path, 'Images'), sample_name+'.png'),
            width,
            height,
            table_coordinates,
            os.path.join(transformed_dataset_path, 'Annotations', sample_name+'.xml'))
        im.save(os.path.join(transformed_dataset_path, 'JPEGImages', sample_name+'.png'), 'PNG')
    if not os.path.exists(os.path.join(transformed_dataset_path, 'ImageSets')):
        os.makedirs(os.path.join(transformed_dataset_path, 'ImageSets'))
    if not os.path.exists(os.path.join(transformed_dataset_path, 'ImageSets', 'Main')):
        os.makedirs(os.path.join(transformed_dataset_path, 'ImageSets', 'Main'))
    train, test = train_test_split(sample_names, test_size=0.3)
    test, val = train_test_split(test, test_size=0.55)
    with open(os.path.join(transformed_dataset_path, 'ImageSets', 'Main', 'train.txt'), 'w') as test_file:
        lines = [x + '\n' for x in train]
        test_file.writelines(lines)
    with open(os.path.join(transformed_dataset_path, 'ImageSets', 'Main', 'val.txt'), 'w') as test_file:
        lines = [x + '\n' for x in test]
        test_file.writelines(lines)
    with open(os.path.join(transformed_dataset_path, 'ImageSets', 'Main', 'test.txt'), 'w') as test_file:
        lines = [x + '\n' for x in val]
        test_file.writelines(lines)
    


if __name__ == '__main__':
    main()