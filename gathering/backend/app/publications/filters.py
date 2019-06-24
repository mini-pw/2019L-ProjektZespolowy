from collections import Counter

from django.db.models import Q
from django_filters import rest_framework as filters

from publications.models import Publication, Annotation, Page


class CharArrayFilter(filters.BaseCSVFilter, filters.CharFilter):
    pass


class PublicationFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    created_before = filters.DateFilter(field_name='created', lookup_expr='lt')
    created_after = filters.DateFilter(field_name='created', lookup_expr='gte')
    publication_date_before = filters.DateFilter(field_name='publication_date', lookup_expr='lt')
    publication_date_after = filters.DateFilter(field_name='publication_date', lookup_expr='gte')
    annotated_by_me = filters.BooleanFilter(method='filter_with_annotated_by_me')
    min_annotators = filters.NumberFilter(method='filter_with_min_annotators')
    max_annotators = filters.NumberFilter(method='filter_with_max_annotators')
    tags = CharArrayFilter(method='filter_with_tags')

    class Meta:
        model = Publication
        fields = (
            'name', 'created_before', 'created_after',
            'publication_date_before', 'publication_date_after',
            'source', 'download_status', 'annotation_status'
        )

    def filter_with_annotated_by_me(self, queryset, name, value):
        annotations = self.request.user.annotation_set.all().select_related('page')
        annotated_publications_ids = set(annotations.values_list('page__publication_id', flat=True))
        if value:
            return queryset.filter(id__in=annotated_publications_ids)
        else:
            return queryset.exclude(id__in=annotated_publications_ids)

    def filter_with_min_annotators(self, queryset, name, value):
        annotations = Annotation.objects.order_by('page_id', 'user_id').distinct('page_id', 'user_id')
        annotators_per_page = Counter(a.page_id for a in annotations)
        publications_ids = set(
            page['publication_id'] for page in Page.objects.values('id', 'publication_id')
            if annotators_per_page[page['id']] < value
        )
        return queryset.exclude(Q(page__isnull=True) | Q(id__in=publications_ids))

    def filter_with_max_annotators(self, queryset, name, value):
        annotations = Annotation.objects.order_by('page_id', 'user_id').distinct('page_id', 'user_id')
        annotators_per_page = Counter(a.page_id for a in annotations)
        publications_ids = set(
            page['publication_id'] for page in Page.objects.values('id', 'publication_id')
            if annotators_per_page[page['id']] > value
        )
        return queryset.exclude(Q(page__isnull=True) | Q(id__in=publications_ids))

    def filter_with_tags(self, queryset, name, value):
        tagged_annotations = Annotation.objects.filter(visible=True, tags__contains=value).select_related('page')
        publications_ids = set(tagged_annotations.values_list('page__publication_id', flat=True))
        return queryset.filter(id__in=publications_ids)


class PageFilter(filters.FilterSet):
    tags = CharArrayFilter(method='filter_with_tags')

    class Meta:
        model = Page
        fields = ('publication_id', 'annotation_status', 'tags')

    def filter_with_tags(self, queryset, name, value):
        pages_ids = Annotation.objects.filter(visible=True, tags__contains=value).values_list('page_id', flat=True)
        return queryset.filter(id__in=pages_ids)


class AnnotationFilter(filters.FilterSet):
    tags = CharArrayFilter(lookup_expr='contains')

    class Meta:
        model = Annotation
        fields = ('page_id', 'page__publication_id')
