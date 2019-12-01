from django.db import models

class ObjectType(models.Model):
    name = models.CharField(max_length=512)
    key = models.CharField(max_length=512)
    parent_type = models.ForeignKey('ObjectType', null=True, on_delete=models.PROTECT)

    class Meta:
        ordering = ['key']


class SubobjectType(models.Model):
    name = models.CharField(max_length=512)
    key = models.CharField(max_length=512)
    valid_on = models.ManyToManyField(ObjectType)

    class Meta:
        ordering = ['key']


class AnnotationTag(models.Model):
    name = models.CharField(max_length=512)
    key = models.CharField(max_length=512)

    class Meta:
        ordering = ['key']
