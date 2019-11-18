from collections import Iterable
from datetime import datetime

from django.db.models import Count
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from publications.filters import PublicationFilter, PageFilter, AnnotationFilter
from publications.models import Publication, Page, Annotation
from publications.serializers import PublicationSerializer, PageSerializer, PageOcrSerializer, AnnotationSerializer
from publications.tasks import save_file_locally
from publications.pagination import SingleResultPagination


class PublicationListView(ListAPIView):
    queryset = Publication.objects.order_by('-created')
    serializer_class = PublicationSerializer
    filterset_class = PublicationFilter


class PublicationRetrieveView(RetrieveAPIView):
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer


class AddNewPublicationView(CreateAPIView):
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer

    def perform_create(self, serializer):
        serializer.save()
        save_file_locally.delay(serializer.instance.id)


class GetLatestPublicationView(RetrieveAPIView):
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer

    def get_object(self):
        qs = self.get_queryset()
        source = self.request.query_params.get('source')
        if source:
            qs = qs.filter(source=source)
        return qs.order_by('-publication_date', '-created').first()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance:
            data = self.get_serializer(instance).data
        else:
            data = {}
        return Response(data)


class PageListView(ListAPIView):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    filterset_class = PageFilter


class AnnotationListCreateView(ListCreateAPIView):
    queryset = Annotation.objects.filter(visible=True)
    serializer_class = AnnotationSerializer
    filterset_class = AnnotationFilter

    def create(self, request, *args, **kwargs):
        if not request.data or not isinstance(request.data, Iterable):
            raise ValidationError("You must send non-empty list of annotations.")
        serializer = self.get_serializer(data=request.data, many=True)
        if len(request.data)==1 and 'page' in request.data[0] and 'data' in request.data[0] and not request.data[0]['data']:
            annotations_to_delete = Annotation.objects.filter(page=request.data[0]['page'])
            annotations_to_delete.delete()
            headers = self.get_success_headers(request.data)
            return Response(request.data, status=status.HTTP_201_CREATED, headers=headers)
        serializer.is_valid(raise_exception=True)
        if len({item['page'] for item in serializer.validated_data}) > 1:
            raise ValidationError("All annotations must relate to the same page.")
        timestamp = datetime.now()
        for item in serializer.validated_data:
            item['created'] = timestamp  # they need to have the same timestamp
        new_status = serializer.child.choose_annotation_status()
        existing_page_annotations = Annotation.objects.filter(page=serializer.validated_data[0]['page'])
        if not existing_page_annotations.filter(annotation_status__gt=new_status).exists():
            existing_page_annotations.update(visible=False)
            for item in serializer.validated_data:
                item['visible'] = True
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class GlobalStatistics(APIView):
    def get(self, request, *args, **kwargs):
        return Response({
            "publications_count": Publication.objects.count(),
            "publications_sources": list(Publication.objects.all().values('source').annotate(Count('source'))),
            "pages_count": Page.objects.count(),
            "annotated_pages_count": Page.objects.filter(annotation__isnull=False).distinct().count(),
            "annotations_count": Annotation.objects.count()
        })


class Ocr(ListAPIView):
    queryset = Page.objects.all()
    serializer_class = PageOcrSerializer
    filterset_class = PageFilter
    pagination_class = SingleResultPagination   # hard paging limit, OCR JSONs are very big


class OcrTaskRequest(APIView):
    def post(self, request, *args, **kwargs):
        return Response([])
