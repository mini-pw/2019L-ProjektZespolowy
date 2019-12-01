from django.db import models

class ObjectType(models.Model):
    name = models.CharField(max_length=512)
    key = models.CharField(max_length=512)
    parent_type = models.ForeignKey('ObjectType', null=True, blank=True, on_delete=models.PROTECT)
    sortkey = models.IntegerField(default=0)

    def __str__(self):
        return 'Object type: ' + self.name

    class Meta:
        ordering = ['sortkey', 'key']


class SubobjectType(models.Model):
    name = models.CharField(max_length=512)
    key = models.CharField(max_length=512)
    valid_on = models.ManyToManyField(ObjectType)
    sortkey = models.IntegerField(default=0)
    is_text_annotation = models.BooleanField(default=False)

    def __str__(self):
        return 'Subobject type: ' + self.name

    class Meta:
        ordering = ['sortkey', 'key']


class AnnotationTag(models.Model):
    name = models.CharField(max_length=512)
    key = models.CharField(max_length=512)
    sortkey = models.IntegerField(default=0)

    def __str__(self):
        return 'Annotation tag: ' + self.name

    class Meta:
        ordering = ['sortkey', 'key']
