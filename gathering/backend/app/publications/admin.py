from django.contrib import admin
from publications.models import *

@admin.register(ObjectType)
class ObjectTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(SubobjectType)
class SubobjectTypeAdmin(admin.ModelAdmin):
    pass


@admin.register(AnnotationTag)
class AnnotationTagAdmin(admin.ModelAdmin):
    pass
