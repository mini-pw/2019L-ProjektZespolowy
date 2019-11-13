from django.contrib.postgres.fields import JSONField, ArrayField
from django.db import models

ANNOTATION_STATUS_NEW = '0:new'
ANNOTATION_STATUS_AUTO = '1:auto_annotated'
ANNOTATION_STATUS_MANUAL = '2:annotated'
ANNOTATION_STATUS_SUPER = '3:super_annotated'


class Publication(models.Model):
    DOWNLOAD_IN_PROGRESS = 'downloading'
    DOWNLOAD_DONE = 'done'
    DOWNLOAD_FAILED = 'download_failed'

    name = models.CharField(max_length=512)
    source = models.CharField(max_length=64)
    created = models.DateTimeField(auto_now_add=True)
    publication_date = models.DateField()
    remote_file = models.URLField(unique=True)
    local_file = models.FileField(editable=False)
    download_status = models.CharField(
        max_length=32, editable=False,
        choices=(
            (DOWNLOAD_IN_PROGRESS, "Downloading"),
            (DOWNLOAD_DONE, "Done"),
            (DOWNLOAD_FAILED, "Download failed")
        ), default=DOWNLOAD_IN_PROGRESS
    )
    annotation_status = models.CharField(
        max_length=32, editable=False,
        choices=[
            (ANNOTATION_STATUS_NEW, "New"),
            (ANNOTATION_STATUS_AUTO, "Auto-annotated"),
            (ANNOTATION_STATUS_MANUAL, "Annotated"),
            (ANNOTATION_STATUS_SUPER, "Super-annotated")
        ], default=ANNOTATION_STATUS_NEW
    )

    def __repr__(self):
        return f"Publication(name={self.name})"


class Page(models.Model):
    publication = models.ForeignKey('Publication', on_delete=models.CASCADE)
    number = models.PositiveSmallIntegerField()
    image = models.ImageField()
    ocr = JSONField(null=True)

    annotation_status = models.CharField(
        max_length=32, editable=False,
        choices=[
            (ANNOTATION_STATUS_NEW, "New"),
            (ANNOTATION_STATUS_AUTO, "Auto-annotated"),
            (ANNOTATION_STATUS_MANUAL, "Annotated"),
            (ANNOTATION_STATUS_SUPER, "Super-annotated")
        ], default=ANNOTATION_STATUS_NEW
    )

    def __repr__(self):
        return f"Page(publication={self.publication.name}, number={self.number})"

    class Meta:
        ordering = ['number']


class Annotation(models.Model):
    ANNOTATED = 1

    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)
    page = models.ForeignKey('Page', on_delete=models.CASCADE)
    data = JSONField()
    is_used = models.BooleanField(default=False)
    annotations_used = models.ManyToManyField('self')
    created = models.DateTimeField(editable=False)
    visible = models.BooleanField(default=False)
    tags = ArrayField(
        models.CharField(max_length=64), null=True, blank=True
    )

    annotation_status = models.CharField(
        max_length=32, editable=False,
        choices=[
            (ANNOTATION_STATUS_NEW, "New"),
            (ANNOTATION_STATUS_AUTO, "Auto-annotated"),
            (ANNOTATION_STATUS_MANUAL, "Annotated"),
            (ANNOTATION_STATUS_SUPER, "Super-annotated")
        ], default=ANNOTATION_STATUS_NEW
    )

    def __repr__(self):
        return f"Annotation(created={self.created})"
