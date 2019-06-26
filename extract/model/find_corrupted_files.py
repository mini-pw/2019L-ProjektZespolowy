import os
import numpy as np
import cv2 as cv

path = f"./datasets/chata/tables"

if __name__ == "__main__":
    corrupted_images = []
    for split in ["train", "val", "test"]:
        with open(f"{path}/ImageSets/Main/{split}.txt") as f:
            content = f.readlines()
        for image_path in content:
            full_img_path = f"{path}/JPEGImages/{image_path[:-1]}.png"
            img = cv.imread(full_img_path, 0)
            if img is None:
                corrupted_images.append(full_img_path)

    print(corrupted_images)
    print(f"Corrupted images number: {len(corrupted_images)}")