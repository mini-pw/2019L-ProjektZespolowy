import os
import random
import numpy as np

random.seed(22)

if __name__ == "__main__":

    images = [
        image.split(".")[0]
        for root, dirs, files in os.walk("./datasets/chata/chata/Annotations")
        for image in files
    ]
    images = np.array(images)
    split = int(0.8 * len(images))

    indices = np.random.permutation(len(images))
    train_idx, valid_idx = indices[:split], indices[split:]
    train, valid = images[train_idx], images[valid_idx]
    print(f"Train samples: {len(train)}")
    print(f"Valid samples: {len(valid)}")

    for image_set, name in zip([train, valid], ["train", "val"]):
        with open(f"./datasets/chata/chata/ImageSets/Main/{name}.txt", "w") as f:
            for item in image_set:
                f.write("%s\n" % item)
