from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from publications.models import Annotation


class CustomUserAdmin(UserAdmin):
    fieldsets = (
        ('Info', {'fields': ('username', 'first_name', 'last_name',)}),
        ('Statistics', {'fields': ('annotations_count', 'used_annotations_count')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
    )
    list_display = (
        'username', 'first_name', 'last_name', 'is_staff', 'is_superuser',
        'annotations_count', 'used_annotations_count'
    )
    list_filter = ('is_staff', 'is_superuser', 'groups')
    search_fields = ('username', 'first_name', 'last_name')

    readonly_fields = ('username', 'annotations_count', 'used_annotations_count', 'last_login', 'date_joined')

    def annotations_count(self, user):
        return Annotation.objects.filter(user=user).count()

    def used_annotations_count(self, user):
        return Annotation.objects.filter(user=user, is_used=True).count()


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
