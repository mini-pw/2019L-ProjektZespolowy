from api_client import ApiClient
from predictor_chata import ChataDemo
import sys
import numpy as np
import urllib
import cv2
from maskrcnn_benchmark.config import cfg

tables_path = '../configs/table_predict.yaml'
charts_path = '../configs/charts_predict.yaml'
output_dir = '/home/piotr/Pictures'

def main():
    charts_cfg = cfg.clone()
    tables_cfg = cfg.clone()
    charts_cfg.merge_from_file(charts_path)
    tables_cfg.merge_from_file(tables_path)
    model_charts = ChataDemo(charts_cfg, "charts")
    model_tables = ChataDemo(tables_cfg, "tables")
    
    client = ApiClient()
    client.login()
    newest_ids = client.get_new_publications()
    for pub_id in newest_ids:
        pages = client.get_pages(pub_id)
        print(pub_id)
        for id, url in pages:
            print(id)
            print(url)
            resp = urllib.request.urlopen(url)
            image = np.asarray(bytearray(resp.read()), dtype="uint8")
            image = cv2.imdecode(image, cv2.IMREAD_COLOR)
            predictions_charts = model_charts.get_predictions(image)
            predictions_tables = model_tables.get_predictions(image)
            annotations_charts = annotate(predictions_charts)
            annotations_tables = annotate(predictions_tables)
            annotations = annotations_charts+annotations_tables
            print(annotations)
            if annotations:
                client.add_annotation(id, annotations)

def annotate(predictions):
    objects = []
    for label, xmin, ymin, xmax, ymax in predictions:
        if label in ["chart", "table"]:
            data = {
                'type':label,
                'x1':xmin[0],
                'y1':ymin[0],
                'x2':xmax[0],
                'y2':ymax[0],
                'text':'',
                'subRegions':[]
                }
            objects.append(data)
    return objects
   
if __name__ == "__main__":
    main()
