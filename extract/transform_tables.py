import argparse
import glob
import os
import xml.etree.ElementTree as ET

from utils.xml_writer import XMLWriter
from multiprocessing import Pool
from PIL import Image
from sklearn.model_selection import train_test_split


class ICDAR2019Transformer:
    def __init__(self, in_path, out_path, process_num=4):
        self.in_path = in_path
        self.out_path = out_path
        self.process_num = process_num

    def writer_worker(self, files):
        for i in range(0, len(files), 2):
            img_path = os.path.join(self.in_path, files[i])
            sample_name = files[i].split('.')[0]
            im = Image.open(img_path)
            width, height = im.size
            old_annotation_path = os.path.join(self.in_path, files[i + 1])
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
            writer.create_faster_rcnn_xml_multiple(files[i],
                                                   os.path.basename(os.path.normpath(self.out_path)),
                                                   os.path.join(os.path.join(self.out_path, 'Images'),
                                                                sample_name + '.png'),
                                                   width,
                                                   height,
                                                   table_coordinates,
                                                   os.path.join(self.out_path, 'Annotations',
                                                                sample_name + '.xml'))
            path = os.path.join(self.out_path, 'JPEGImages', sample_name + '.png')
            print(f'Saving {path}')
            im.save(path, 'PNG')
        return None

    def chunks(self, l, n):
        """Yield successive n-sized chunks from l."""
        for i in range(0, len(l), n):
            yield l[i:i + n]

    def files_diff(self):
        img_path = os.path.join(self.out_path, 'JPEGImages')
        all_base_img = set([file.split('.')[0] for file in os.listdir(self.in_path)])
        trans_files = set([file.split('.')[0] for file in os.listdir(img_path)])
        diff = list(all_base_img - trans_files)
        files = []
        for elem in diff:
            for file in glob.glob(os.path.join(self.in_path, f'{elem}*')):
                files.append(os.path.basename(file))
        return sorted(files)

    def transform(self):
        if self.in_path is None or self.out_path is None:
            print('Please set the path to dataset and the name of directory where the annotations will be placed')
        if not os.path.exists(os.path.join(self.out_path, 'Annotations')):
            os.makedirs(os.path.join(self.out_path, 'Annotations'))
        if not os.path.exists(os.path.join(self.out_path, 'JPEGImages')):
            os.makedirs(os.path.join(self.out_path, 'JPEGImages'))

        files = self.files_diff()
        async_files = list(self.chunks(files, 100))
        with Pool(processes=self.process_num) as pool:
            pool.map(self.writer_worker, async_files)

        sample_names = [x.split('.')[0] for x in os.listdir(os.path.join(self.out_path, 'JPEGImages'))]
        sample_names = list(set(sample_names))
        sample_names = [x for x in sample_names if x.startswith('cTDaR_t')]
        if not os.path.exists(os.path.join(self.out_path, 'ImageSets')):
            os.makedirs(os.path.join(self.out_path, 'ImageSets'))
        if not os.path.exists(os.path.join(self.out_path, 'ImageSets', 'Main')):
            os.makedirs(os.path.join(self.out_path, 'ImageSets', 'Main'))
        train, test = train_test_split(sample_names, test_size=0.3)
        test, val = train_test_split(test, test_size=0.55)
        with open(os.path.join(self.out_path, 'ImageSets', 'Main', 'train.txt'), 'w') as test_file:
            lines = [x + '\n' for x in train]
            test_file.writelines(lines)
        with open(os.path.join(self.out_path, 'ImageSets', 'Main', 'val.txt'), 'w') as test_file:
            lines = [x + '\n' for x in test]
            test_file.writelines(lines)
        with open(os.path.join(self.out_path, 'ImageSets', 'Main', 'test.txt'), 'w') as test_file:
            lines = [x + '\n' for x in val]
            test_file.writelines(lines)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Avenue dataset transformation')
    parser.add_argument('--in_path', type=str, help='Path to ICDAR2019 dataset --- TRACKA/ground_truth/')
    parser.add_argument('--out_path', type=str, help='Destination path')
    parser.add_argument('--workers', default=4, help='Number of workers(default: 2)')
    args = parser.parse_args()
    table_processor = ICDAR2019Transformer(args.in_path, args.out_path)
    table_processor.transform()

