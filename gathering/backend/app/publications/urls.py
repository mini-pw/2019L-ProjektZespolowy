from django.urls import path

from publications.api import PublicationListView, AddNewPublicationView, GetLatestPublicationView, PageListView, \
    AnnotationListCreateView, PublicationRetrieveView, GlobalStatistics, Ocr, OcrTaskRequest

urlpatterns = [
    path('', PublicationListView.as_view(), name='publications_list'),
    path('<int:pk>', PublicationRetrieveView.as_view(), name='publications_retrieve'),
    path('add-new', AddNewPublicationView.as_view(), name='add_new_publication'),
    path('get-latest', GetLatestPublicationView.as_view(), name='get_latest_publication'),
    path('pages', PageListView.as_view(), name='pages_list'),
    path('annotations', AnnotationListCreateView.as_view(), name='annotations_list_create'),
    path('statistics', GlobalStatistics.as_view(), name='publications_statistics'),
    path('ocr', Ocr.as_view(), name='publications_ocr'),
    path('ocr-task-request', OcrTaskRequest.as_view(), name='publications_ocr_task_request')
]
