import matplotlib.pyplot as plt
import requests
from io import BytesIO
from PIL import Image
import numpy as np
import imageio as imio


def load(url):
    """
    Given an url of an image, downloads the image and
    returns a PIL image
    """
    response = requests.get(url)
    pil_image = Image.open(BytesIO(response.content)).convert("RGB")
    # convert to BGR format
    image = np.array(pil_image)[:, :, [2, 1, 0]]
    return image


def imshow(img):
    plt.imshow(img[:, :, [2, 1, 0]])
    plt.axis("off")


from maskrcnn_benchmark.data.datasets.chata import ChataDataset
from server.chata_predictor import ChataPredictor
from server.chata_predictor import ChataPredictor
import maskrcnn_benchmark.config as config

config_file = "./configs/chata/e2e_faster_rcnn_R_50_C4_1x_1_gpu_voc_chata.yaml"
config.cfg.merge_from_file(config_file)
config.cfg.merge_from_list(["MODEL.DEVICE", "cpu"])
config.cfg.merge_from_list(["OUTPUT_DIR", "./server/"])

chata = ChataPredictor(config.cfg, min_image_size=800, confidence_threshold=0.7)

# Image in BGR (not RGB!)
image = load(
    "https://images.sampletemplates.com/wp-content/uploads/2016/02/18132337/Normal-Lab-Values-Chart-2015.jpeg"
)
imio.imwrite(f'server/sample.png', image)
imshow(image)
prediction = chata.predict(image)

prediction.get_field("scores").data.numpy()
prediction.get_field("labels").data.numpy()
chata.CATEGORIES[prediction.get_field("labels").data.numpy()[0]]
prediction.bbox
prediction.mode