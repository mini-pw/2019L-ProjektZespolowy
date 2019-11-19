from rest_framework.pagination import PageNumberPagination

class SingleResultPagination(PageNumberPagination):
    page_size = 1
    max_page_size = 1
