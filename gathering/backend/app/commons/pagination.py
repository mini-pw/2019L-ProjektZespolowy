from rest_framework.pagination import PageNumberPagination


class CustomPagination(PageNumberPagination):
    page_size_query_param = 'page-size'
    max_page_size = 100
    page_size = 50
