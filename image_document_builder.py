import numpy as np
import glob
import os
import fitz
from PIL import Image
import io
import json
import random


class FromImageDocumentBuilder:

    def __init__(self, article_names, plots_dir, pages_to_skip, number_of_docs, output_dir):
        self.plots_dir = plots_dir
        self.image_rectangles = []
        self.number_of_docs = number_of_docs
        self.output_dir = output_dir
        self.image_dir = os.path.join(self.output_dir, 'png')
        os.makedirs(self.image_dir, exist_ok=True)
        for i, article in enumerate(article_names):
            doc = fitz.open(article)
            for page_no in range(doc.pageCount):
                if len(doc.getPageImageList(page_no)) != 0 and page_no not in pages_to_skip[i]:
                    img = Image.open(io.BytesIO(doc[page_no].getPixmap().getPNGData()))
                    rectangles = self._dfs_find_rectangles(np.array(img.split()[3]))
                    for rectangle in rectangles:
                        rect = fitz.Rect(rectangle[0], rectangle[1])
                        self.image_rectangles.append({'doc': doc, 'page_no': page_no, 'rect': rect})
                        print('extracted')

    def _start_dfs(self, alpha, x, y, visited, res):
        queue = [(x, y)]
        while len(queue) != 0:
            x, y = queue[0]
            queue.remove(queue[0])

            visited[x][y] = True
            if alpha[x][y] > 2:
                if len(res) == 0:
                    res.append((y, x))
                if x < alpha.shape[0] - 1 and alpha[x + 1][y] > 0:
                    x = x + 1
                    queue.append((x, y))
                else:
                    if y < alpha.shape[1] - 1 and alpha[res[0][1]][y + 1] > 0:
                        x = res[0][1]
                        y = y + 1
                        queue.append((x, y))
                    else:
                        res.append((y, x))

    def _dfs_find_rectangles(self, image):
        result = []
        visited = np.zeros(image.shape, dtype=bool)
        for i in range(image.shape[0]):
            for j in range(image.shape[1]):
                if not visited[i][j]:
                    res = []
                    self._start_dfs(image, i, j, visited, res)
                    if len(res) > 1 and res[1][0] - res[0][0] > 30 and res[1][1] - res[0][1] > 30:
                        result.append(res)
        return result

    def _paste_and_save_image(self, doc_page, f, rect, out_name):
        doc_page.insertImage(rect, stream=f.read(), keep_proportion=False)
        doc_page.getPixmap(alpha=False).writePNG(out_name)

    def _annotation_data(self, rect, doc_bound):
        return [
            rect[0] / doc_bound[2],
            rect[1] / doc_bound[3],
            rect[2] / doc_bound[2],
            rect[3] / doc_bound[3]
        ]

    def generate(self):
        annotations = dict()
        for i, path in enumerate(glob.glob(os.path.join(self.plots_dir, '*'))):
            image_data = np.random.choice(self.image_rectangles)
            doc_name = f'{path.split("/")[-2]}{i:02d}.png'
            with open(path, 'rb') as f:
                one_pager = image_data['doc'][image_data['page_no']]
                rect = image_data['rect']
                one_pager.insertImage(rect, stream=f.read(), keep_proportion=False)
                one_pager.getPixmap(alpha=False).writePNG(os.path.join(self.image_dir, doc_name))
                annotations[doc_name] = self._annotation_data(rect, one_pager.bound())
            if i >= self.number_of_docs:
                break
        with open(os.path.join(self.output_dir, 'annotations.json'), 'w') as fp:
            json.dump(annotations, fp)

    def close_docs(self):
        for image_data in self.image_rectangles:
            try:
                image_data['doc'].close()
            except ValueError:
                pass


if __name__ == '__main__':
    articles = ['article.pdf', 'art2.pdf', 'art1.pdf', 'art3.pdf', 'art4.pdf', 'art5.pdf', 'art6.pdf', 'art7.pdf']
    articles = [os.path.join('sample_articles2', article) for article in articles]
    plots_data = ['./charts/A_nochart', './charts/BarChart', './charts/BoxChart', './charts/LineChart',
                  './charts/PieChart', './charts/ScatterChart', './charts/X_others']
    for plots in plots_data:
        builder = FromImageDocumentBuilder(articles,
                                           plots,
                                           [[3, 12, 13, 22]+list(range(23, 44)), [], [], [0], [], [2, 3, 27, 30, 35, 36, 37, 40, 42], [2], [11]],
                                           3000, f'./documents_img/{plots.split("/")[-1]}/results')
        builder.generate()
        builder.close_docs()
