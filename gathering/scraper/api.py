import os
import requests

# fixme: shall we generate some special user / token for scrapers?
token = os.environ['BACKEND_API_TOKEN']
auth_headers = {'Authorization': f'Token {token}'}

api_methods_urls = {
    'send-new': os.environ['BACKEND_API_ROOT'] + '/publications/add-new',
    'get-latest-date': os.environ['BACKEND_API_ROOT'] + '/publications/get-latest'
}


def auth_get(endpoint_id, data=None):
    return requests.get(api_methods_urls[endpoint_id], data=data, headers=auth_headers)


def auth_post(endpoint_id, data=None):
    return requests.post(api_methods_urls[endpoint_id], data=data, headers=auth_headers)
