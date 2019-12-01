from django.db import models

class SubobjectType(models.Model):
    ORIENTATION_NEUTRAL = 'neutral'
    ORIENTATION_VERTICAL = 'vertical'
    ORIENTATION_HORIZONTAL = 'horizontal'

    name = models.CharField(max_length=512)
    key = models.CharField(max_length=512)
    sortkey = models.IntegerField(default=0)
    is_text_annotation = models.BooleanField(default=False)
    orientation = models.CharField(
        max_length=32,
        choices=(
            (ORIENTATION_NEUTRAL, "Neutral"),
            (ORIENTATION_VERTICAL, "Vertical"),
            (ORIENTATION_HORIZONTAL, "Horizontal")
        ), default=ORIENTATION_NEUTRAL
    )

    def __str__(self):
        return 'Subobject type: ' + self.name

    class Meta:
        ordering = ['sortkey', 'key']


class ObjectType(models.Model):
    name = models.CharField(max_length=512)
    key = models.CharField(max_length=512)
    parent_type = models.ForeignKey('ObjectType', null=True, blank=True, on_delete=models.PROTECT)
    subtypes = models.ManyToManyField(SubobjectType)
    sortkey = models.IntegerField(default=0)

    def __str__(self):
        return 'Object type: ' + self.name

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
