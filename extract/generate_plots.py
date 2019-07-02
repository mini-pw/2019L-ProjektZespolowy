import os

from doc_builders.random_builder import RandomDocumentBuilder
from doc_builders.image_builder import ImageDocumentBuilder


doc_no = 1
articles_data = [{'path': 'finance_article.pdf', 'blank': list(range(26))},
                 {'path': 'biology_article.pdf', 'blank': list(range(6))},
                 {'path': 'spanish_article.pdf', 'blank': list(range(3, 13))}]
plots_data = ['./charts/A_nochart', './charts/BarChart', './charts/BoxChart', './charts/LineChart',
              './charts/PieChart', './charts/ScatterChart', './charts/X_others']

for article_data in articles_data:
    for plots in plots_data:
        doc_builder = RandomDocumentBuilder(plots,
                                            document_path="./blank_articles/" + article_data['path'],
                                            blank_pages=article_data['blank'],
                                            output_path='./blank_documents/'+plots.split("/")[-1] + article_data['path'].split("_")[0]
                                            )
        doc_builder.generate(doc_no=doc_no)

doc_no = 1
articles = ['article.pdf', 'art2.pdf', 'art1.pdf', 'art3.pdf', 'art4.pdf', 'art5.pdf', 'art6.pdf', 'art7.pdf']
articles = [os.path.join('nonblank_articles', article) for article in articles]
plots_data = ['./charts/A_nochart', './charts/BarChart', './charts/BoxChart', './charts/LineChart',
              './charts/PieChart', './charts/ScatterChart', './charts/X_others']

for plots in plots_data:
    builder = ImageDocumentBuilder(articles,
                                   plots,
                                   [[3, 12, 13, 22] + list(range(23, 44)), [], [], [0], [],
                                    [2, 3, 27, 30, 35, 36, 37, 40, 42], [2], [11]],
                                   doc_no, f'./image_documents/{plots.split("/")[-1]}/results')
    builder.generate()
    builder.close_docs()
