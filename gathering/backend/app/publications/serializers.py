from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError

from publications.models import Publication, Page, Annotation, ANNOTATION_STATUS_AUTO, ANNOTATION_STATUS_SUPER, \
    ANNOTATION_STATUS_MANUAL
from users.serializers import UserSerializer


class PublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publication
        fields = (
            'id', 'name', 'source', 'created', 'local_file',
            'remote_file', 'publication_date', 'download_status', 'annotation_status'
        )


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ('id', 'publication', 'number', 'annotation_status', 'image')


class PageOcrSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ('id', 'ocr')


class AnnotationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    annotations_used = serializers.PrimaryKeyRelatedField(
        queryset=Annotation.objects.all(), write_only=True,
        required=False, allow_null=True, many=True
    )

    class Meta:
        model = Annotation
        fields = (
            'id', 'user', 'page', 'data', 'created', 'is_used',
            'annotations_used', 'annotation_status', 'tags'
        )

    def validate_annotation_used(self, value):
        if value and not self.context['request'].user.is_superuser:
            raise ValidationError("Only super-annotators can use other annotations.")

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        validated_data['annotation_status'] = self.choose_annotation_status()
        instance = super().create(validated_data)
        if instance.annotations_used.exists():
            for annotation_used in instance.annotations_used.all():
                annotation_used.is_used = True
                annotation_used.save(update_fields=['is_used'])

        page = instance.page
        publication = page.publication
        if instance.annotation_status > page.annotation_status:
            page.annotation_status = instance.annotation_status
            page.save(update_fields=['annotation_status'])
        if instance.annotation_status > publication.annotation_status:
            publication.annotation_status = instance.annotation_status
            publication.save(update_fields=['annotation_status'])

        return instance

    def choose_annotation_status(self):
        # It's not like we're getting paid for this code, so couple of dirty IFs should do the trick...
        user = self.context['request'].user
        if user.username == 'auto-annotator-3000':
            return ANNOTATION_STATUS_AUTO
        elif user.is_superuser:
            return ANNOTATION_STATUS_SUPER
        elif user.is_staff:
            return ANNOTATION_STATUS_MANUAL
        raise PermissionDenied
