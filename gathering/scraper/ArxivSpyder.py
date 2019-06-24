import re
import scrapy
from scrapy.crawler import CrawlerProcess

import api


class ArxivSpyder(scrapy.Spider):
    name = "ArxivSpyder"
    start_urls = [
        'https://arxiv.org/search/advanced?advanced=&terms-0-operator=AND&terms-0-term=a&terms-0-field=all&classification-physics_archives=all&classification-include_cross_list=include&date-year=&date-filter_by=date_range&date-from_date={0}&date-to_date=&date-date_type=submitted_date&abstracts=hide&size=50&order=-announced_date_first',
    ]

    _months_dict = {
        'January': '01',
        'February': '02',
        'March': '03',
        'April': '04',
        'May': '05',
        'June': '06',
        'July': '07',
        'August': '08',
        'September': '09',
        'October': '10',
        'November': '11',
        'December': '12'
    }

    _default_date = '2019-04-20'

    def __init__(self, start_date=None, *a, **kw):
        if start_date is None:
            start_date = self._get_last_date()
        self.start_urls[0] = self.start_urls[0].format(start_date)
        super(ArxivSpyder, self).__init__(*a, **kw)

    def parse(self, response):
        for paper_element in response.css('li.arxiv-result'):
            self._handle_data(paper_element)

        next_page_link = response.css('a.pagination-next::attr(href)').get()
        if next_page_link is not None:
            yield scrapy.Request(response.urljoin('https://arxiv.org' + next_page_link),callback=self.parse)

    def _handle_data(self, data):
        request_body = {
            'remote_file': data.css('p.list-title > span > a:first-child::attr(href)').extract()[0],
            'name': self._parse_title(data.css('p.title::text').extract()[0]),
            'publication_date': self._parse_date(data.css('p.is-size-7::text').extract()[0].split(';')[0]),
            'source': 'arxiv'
        }

        print(request_body)
        self._send_request(request_body)

    def _parse_date(self, date_string):
        splitted_date = [val.replace(',','') for val in date_string.strip().split(' ')]
        return f'{splitted_date[2]}-{self._months_dict[splitted_date[1]]}-{splitted_date[0]}'

    def _parse_title(self, title_string):
        return re.sub('\$.+?\$', '', title_string.strip()).strip()

    def _send_request(self, request_body):
        api.auth_post('send-new', data=request_body)

    def _get_last_date(self):
        # response = api.auth_get('get-latest-date', data={'source': 'arxiv'})
        # if response is None:
        #     raise Exception("No response from server")
        #
        # response = response.json()
        # if "publication_date" in response:
        #     return response["publication_date"]
        # else:
        #     return self._default_date
        # fixme: for now, we fix date
        return self._default_date

process = CrawlerProcess()
process.crawl(ArxivSpyder)
process.start()
process.stop()
