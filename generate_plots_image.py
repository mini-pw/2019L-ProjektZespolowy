from document_builder import RandomDocumentBuilder
from image_document_builder import FromImageDocumentBuilder
from xml_writer import XMLWriter
from transform_files import FRCNNFileTransformer

if __name__ == '__main__':
    articles_data = [{'path': 'finance_article.pdf', 'blank': list(range(26))},
                     {'path': 'biology_article.pdf', 'blank': list(range(6))},
                     {'path': 'spanish_article.pdf', 'blank': list(range(3, 13))}]
    plots_data = ['./charts/BarChart', './charts/PieChart', './charts/LineChart', './charts/BoxChart',
                  './charts/ScatterChart']
    doc_no = 50

    for article_data in articles_data:
        for plots in plots_data:
            doc_builder = RandomDocumentBuilder(plots,
                                                document_path="./sample_articles/" + article_data['path'],
                                                blank_pages=article_data['blank'],
                                                output_path='./' + article_data['path'].split("_")[0]+plots.split("/")[-1]
                                                )
            doc_builder.generate(doc_no=doc_no)
