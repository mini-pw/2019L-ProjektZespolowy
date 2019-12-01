from django.db import models

class ObjectType(models.Model):
    name = models.CharField(max_length=512)
    key = models.CharField(max_length=512)
    parent_type = models.ForeignKey('ObjectType', null=True, blank=True, on_delete=models.PROTECT)

    def __str__(self):
        return 'Object type: ' + self.name

    class Meta:
        ordering = ['key']


class SubobjectType(models.Model):
    name = models.CharField(max_length=512)
    key = models.CharField(max_length=512)
    valid_on = models.ManyToManyField(ObjectType)

    def __str__(self):
        return 'Subobject type: ' + self.name

    class Meta:
        ordering = ['key']


class AnnotationTag(models.Model):
    name = models.CharField(max_length=512)
    key = models.CharField(max_length=512)

    def __str__(self):
        return 'Annotation tag: ' + self.name

    class Meta:
        ordering = ['key']
