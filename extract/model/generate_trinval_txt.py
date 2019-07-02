import os
import numpy as np


PATH = '/home/lubonp/ProjektZespolowy/maskrcnn-benchmark/datasets/chata/charts/Annotations'

files = os.listdir(PATH)
ids = [x.split('.')[0] for x in files]
files_no = len(ids)
train_no = np.floor(0.6 * files_no)
val_no = np.floor(0.2 * files_no)
test_no = files_no - train_no - val_no

train_ids = np.random.choice(ids, int(train_no), replace=False)
rest = [x for x in ids if x not in train_ids]
val_ids = np.random.choice(rest, int(val_no), replace=False)
test_ids = [x for x in rest if x not in val_ids]

with open('train.txt', 'w') as file:
    file.writelines([str(x)+'\n' for x in train_ids])

with open('val.txt', 'w') as file:
    file.writelines([str(x)+'\n' for x in val_ids])

with open('test.txt', 'w') as file:
    file.writelines([str(x)+'\n' for x in test_ids])
