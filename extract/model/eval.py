model_type = "charts"
model_index = f"model_02450"
model_output_dir = "."

if model_type=="charts":
    config_file_type = "chata"
    correct_label = 2
elif model_type=="tables":
    config_file_type = "tables"
    correct_label = 1

import matplotlib.pyplot as plt
import matplotlib.pylab as pylab

import importlib
from io import BytesIO
from PIL import Image
import numpy as np
from demo.predictor_chata import ChataDemo
from demo.predictor import COCODemo

import maskrcnn_benchmark.config as config
import cv2 as cv

from maskrcnn_benchmark.data.datasets.chata import ChataDataset, TablesDataset
import imageio as imio
import os

# "train", "test", "val"
dataset = ChataDataset("/home/lubonp/ProjektZespolowy/maskrcnn-benchmark/datasets/chata/charts", "train")

def apply_filter(img):
    img = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    #plt.imshow(img, cmap='gray', vmin=0, vmax=255)
        
    threshold, img = cv.threshold(img, 0, 255, cv.THRESH_OTSU)
    #plt.imshow(img, cmap='gray', vmin=0, vmax=255)
        
    img = cv.distanceTransform(img, cv.DIST_L1, 0)
    #plt.imshow(img, cmap='gray', vmin=0, vmax=255)
        
    img = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
    img = img.astype(np.uint8)
    return img

def predict(model_index, chata_demo, dataset, dataset_type="val", img_range=(0,5)):
    
    os.makedirs(f"chata_results/{model_index}_samples", exist_ok=True)
    predictions = []
    groundtruth = []
    labels = []
    for i in range(*img_range):
        test_img = np.array(dataset.__getitem__(i)[0])
        result, top_predictions = chata_demo.run_on_opencv_image(test_img)
        #imio.imwrite(f'chata_results/{model_index}_samples/{dataset_type}_{i:2d}.jpg', result)
        predictions.append(top_predictions)
        groundtruth.append(np.array(dataset.__getitem__(i)[1].bbox)[0])
        labels.append(dataset.__getitem__(0)[1].get_field("labels"))
        
    return predictions, groundtruth, labels

config_file = f"./configs/chata/e2e_faster_rcnn_R_50_C4_1x_1_gpu_voc_chata.yaml"
config.cfg.merge_from_file(config_file)
config.cfg.merge_from_list(["MODEL.DEVICE", "cpu"])
config.cfg.merge_from_list(["OUTPUT_DIR", model_output_dir])

chata_demo = ChataDemo(
    config.cfg,
    model_type,
    min_image_size=800,
    confidence_threshold=0.5,
)

predictions, groundtruth, labels = predict(model_index, chata_demo, dataset, "train", (0,80))

#(0,0) = top_left_corner
#xyxy - top_left, bottom_right 
def get_box_area(box):
    y_diff = box[3]-box[1]
    x_diff = box[2]-box[0]
    if y_diff<=0 or x_diff<=0:
        return 0
    
    return x_diff * y_diff

def get_boxes_common_area(box1, box2):
    x1 = np.maximum(box1[0], box2[0])
    y1 = np.maximum(box1[1], box2[1])
    x2 = np.minimum(box1[2], box2[2])
    y2 = np.minimum(box1[3], box2[3])
    return get_box_area([x1,y1,x2,y2])

#(0,0) = top_left_corner
#xyxy - top_left, bottom_right 
def IoU(box, box_pred):
    common_area = get_boxes_common_area(box, box_pred)
    box_area = get_box_area(box)
    box_pred_area = get_box_area(box_pred)
    
    return common_area / (box_area+box_pred_area-common_area)

iou = []
for i in range(len(predictions)):
    image_predictions = predictions[i]
    box = groundtruth[i]
    label = labels[i]
    #if label!=correct_label:
        #continue
    if len(image_predictions.bbox) == 0:
        iou.append(-1)
    else:
        label = image_predictions.get_field("labels")
        score = image_predictions.get_field("scores")
        pred_box = image_predictions.bbox[0]
        
        #if label[0]==correct_label:
        result = IoU(box, np.array(pred_box))
        iou.append(result)
        #else:
            #iou.append(-2)


iou = np.array(iou)

def calculate_metrics(results):
    for threshold in [0.6,0.7,0.8,0.9]:
        precision = np.sum(results>=threshold) / np.sum(results>=0)
        recall = np.sum(results>=threshold) / len(results)
        f1_score = 2*precision*recall/(precision+recall)
        print(f"Threshold={threshold:.2f}; Precision={precision:.3f}; Recall={recall:.3f}; F1 score: {f1_score:.3f}")

calculate_metrics(iou)

