import fitz
import glob
import json
import os
import numpy as np


class RandomDocumentBuilder:
    def __init__(self, charts_path, document_path=None, blank_pages=None, output_path='.', min_side=0.1, seed=113):
        if document_path is None:
            self.document_path = 'nonblank_articles/article.pdf'
            self.blank_pages = [0, 1, 2, 4, 5, 9, 14, 15, 17, 19, 20, 21]
        else:
            self.document_path = document_path
            self.blank_pages = blank_pages

        self.width, self.height, self.pages_no = self.get_doc_stats()

        if self.blank_pages is None:
            self.blank_pages = self.pages_no

        self.positions = (np.arange(600) + 200) / 1000
        self.charts_path = charts_path
        self.min_half = min_side / 2

        self.results_dir = os.path.join(output_path, 'results')
        self.image_dir = os.path.join(self.results_dir, 'png')
        os.makedirs(self.image_dir, exist_ok=True)

        np.random.seed(seed)

    def get_doc_stats(self):
        try:
            doc = fitz.open(self.document_path)
            width = doc[0].rect.x1
            height = doc[0].rect.y1
            pages_no = doc.pageCount
        finally:
            doc.close()
        return width, height, pages_no

    def controlled_draw(self, margin):
        return (margin - self.min_half) * np.random.random_sample() + self.min_half

    def get_ratios(self):
        center = np.random.choice(self.positions, 2)
        margins = np.minimum(center, 1 - center)

        horizontal_reach = self.controlled_draw(margins[0])
        vertical_reach = self.controlled_draw(margins[1])

        return (
            center[0] - horizontal_reach,
            center[1] - vertical_reach,
            center[0] + horizontal_reach,
            center[1] + vertical_reach
        )

    def ratios_to_coords_transform(self, coords):
        x0, y0, x1, y1 = coords
        return (
            x0 * self.width,
            y0 * self.height,
            x1 * self.width,
            y1 * self.height,
        )

    def generate(self, doc_no=None):
        try:
            doc = fitz.open(self.document_path)
            annotations = dict()
            for i, path in enumerate(glob.glob(os.path.join(self.charts_path, '*'))):
                page_no = int(np.random.choice(self.blank_pages))
                doc_name = f'doc{i:02d}.png'
                rect_coords = self.get_ratios()
                rect = fitz.Rect(*self.ratios_to_coords_transform(rect_coords))

                with open(path, 'rb') as f:
                    one_pager = doc[page_no]
                    one_pager.insertImage(rect, stream=f.read(), keep_proportion=False)
                    one_pager.getPixmap(alpha=False).writePNG(os.path.join(self.image_dir, doc_name))

                annotations[doc_name] = rect_coords

                if doc_no is not None and i >= doc_no:
                    break
                doc.close()
                doc = fitz.open(self.document_path)
        finally:
            doc.close()
            with open(os.path.join(self.results_dir, 'annotations.json'), 'w') as fp:
                json.dump(annotations, fp)


if __name__ == '__main__':
    doc_builder = RandomDocumentBuilder('./AreaGraph')
    doc_builder.generate(doc_no=10)
