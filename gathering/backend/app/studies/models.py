from django.contrib.postgres.fields import JSONField
from django.db import models


class Study(models.Model):
    name = models.CharField(max_length=256)
    owner = models.ForeignKey(
        'auth.User', on_delete=models.SET_NULL, null=True, related_name='owned_studies'
    )
    participants = models.ManyToManyField(
        'auth.User', related_name='studies_participating'
    )
    description = models.TextField()
    annotations = models.ManyToManyField('publications.Annotation')
    created = models.DateTimeField(auto_now_add=True)


class Score(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)
    study = models.ForeignKey('Study', on_delete=models.CASCADE)
    data = JSONField()
    annotation_1 = models.ForeignKey(
        'publications.Annotation', on_delete=models.PROTECT, related_name='+'
    )
    annotation_2 = models.ForeignKey(
        'publications.Annotation', on_delete=models.PROTECT, related_name='+'
    )
    created = models.DateTimeField(auto_now_add=True)
