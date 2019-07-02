import json
import time
import scrapy
import requests
from scrapy.crawler import CrawlerProcess

import api

class WhoSpyder(scrapy.Spider):
    name = "WhoSpyder"
    start_urls = [
        """https://whosearch.searchblox.com/searchblox/servlet/SearchServlet?contenttype=pdf&f.Countries.size=100&f.Lang.filter=en&f.RegionalSites.size=100&f.Topics.size=100&f.contenttype.size=100&f.doctype.size=100&facet=true&facet.field=RegionalSites&facet.field=Topics&facet.field=doctype&facet.field=Countries&facet.field=contenttype&facet.field=Lang&filter=url%3A%28%28www.who.int%5E500%29OR%28%2A%29Lang%3Aen%29&language=&oc=all&page=1&pagesize=10&q_all=%2A&q_low=&q_not=&q_phr=&query=undefined&sort=lastmodified&st=adv&tune=true&tune.0=3&tune.1=2&tune.2=2&tune.3=3&tune.4=180&tune.5=75&xsl=json"""
    ]

    _months_dict = {
        'Jan': '01',
        'Fab': '02',
        'Mar': '03',
        'Apr': '04',
        'May': '05',
        'Jun': '06',
        'Jul': '07',
        'Aug': '08',
        'Sep': '09',
        'Oct': '10',
        'Nov': '11',
        'Dec': '12'
    }

    def __init__(self, start_date=None, *a, **kw):

        self._do_shit = True
        self._date = '2019-04-20'

        super(WhoSpyder, self).__init__(*a, **kw)

    def parse(self, response):

        MAX_RETRY = 25
        num_retry = 0
        urls_to_parse = """https://whosearch.searchblox.com/searchblox/servlet/SearchServlet?contenttype=pdf&f.Countries.size=100&f.Lang.filter=en&f.RegionalSites.size=100&f.Topics.size=100&f.contenttype.size=100&f.doctype.size=100&facet=true&facet.field=RegionalSites&facet.field=Topics&facet.field=doctype&facet.field=Countries&facet.field=contenttype&facet.field=Lang&filter=url%3A%28%28www.who.int%5E500%29OR%28%2A%29Lang%3Aen%29&language=&oc=all&page={}&pagesize=10&q_all=%2A&q_low=&q_not=&q_phr=&query=undefined&sort=lastmodified&st=adv&tune=true&tune.0=3&tune.1=2&tune.2=2&tune.3=3&tune.4=180&tune.5=75&xsl=json"""

        # date_from_get = api.auth_get('get-latest-date', data={'source': 'who'})
        #
        # if date_from_get is None:
        #     raise Exception("No response from server")
        #
        # date_from_get = date_from_get.json()
        # if "publication_date" in date_from_get:
        #     date_from_get = date_from_get["publication_date"]
        # else:
        #     date_from_get = self._date
        # fixme: for now, we fix date
        date_from_get = self._date

        urls = []
        page_num = 1
        print(urls_to_parse.format(page_num))

        while True:
            try:
                body = requests.get(urls_to_parse.format(page_num)).text
            except:
                if num_retry >= MAX_RETRY:
                    break
                time.sleep(10)
                num_retry += 1

            try:
                body = json.loads(body)
                results_on_page = body['results']['result']
                double_break = False
                for page in results_on_page:

                    print(f"Page number {page_num}, current date: {page['indexdate']}")
                    if str(self._parse_date(page['indexdate'])) < date_from_get:
                        double_break = True
                        break

                    if page['contenttype'] == 'PDF' and page['Lang'] == 'en':
                        api.auth_post('send-new',
                                      self._handle_data(page['url'], page['title'], self._parse_date(page['indexdate'])))
                        urls.append(page['url'])
                if double_break:
                    break
                num_retry = 0

            finally:
                page_num += 1

            if page_num == 10:
                break

        print(urls)

    def _handle_data(self, url, name, date, source='who'):
        request_body = {
            'remote_file': url,
            'name': name,
            'publication_date': date,
            'source': source
        }
        return request_body

    def _parse_date(self, date):
        date = date.split(' ')[:3]

        date[1] = str(self._months_dict[date[1]])
        date = "-".join(date[::-1])
        return date


process = CrawlerProcess()
process.crawl(WhoSpyder)
process.start()
process.stop()
