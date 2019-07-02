import http.client
import json

class ApiClient():

    username = 'auto-annotator-3000'
    pwd  = 'beets-bears-battlestar-galactica'

    def __init__(self, url='3.122.251.13'):
        self.base_url = url
        self.token = None
        self.connection = None

    def connect(self):
        self.connection = http.client.HTTPConnection(self.base_url)
    
    def login(self):
        self.connect()
        body_dict = {'username':self.username, 'password':self.pwd}
        self.connection.request('POST', '/api/users/login', json.dumps(body_dict), headers={'Content-Type':'application/json'})
        response = self.connection.getresponse().read().decode()
        self.token = json.loads(response)['token']

    def get_latest(self):
        self.connect()
        self.connection.request('GET', '/api/publications/get-latest', headers={'Authorization':'Token '+self.token})
        response = self.connection.getresponse().read().decode()
        return json.loads(response)['id']

    def get_pages(self, id):
        self.connect()
        self.connection.request('GET', '/api/publications/pages?publication_id='+str(id),
            headers={'Authorization':'Token '+self.token})
        response = self.connection.getresponse().read().decode()
        data = json.loads(response)
        results = []
        for page in data['results']:
            results.append((page['id'], page['image']))
        return results

    def get_new_publications(self):
        self.connect()
        self.connection.request('GET', '/api/publications/?annotation_status=0%3Anew&download_status=done&page=2',
                                           headers={'Authorization':'Token '+self.token})
        response = self.connection.getresponse().read().decode()
        data = json.loads(response)
        ids = []
        for publication in data['results']:
            ids.append(publication['id'])
        return ids

    def add_annotation(self, id, annotation):
        self.connect()
        body = [{'page':id, 'data':annotation}]
        self.connection.request('POST', '/api/publications/annotations',
            json.dumps(body),
            headers={'Authorization':'Token '+self.token, 'Content-Type':'application/json'}
        )

    
