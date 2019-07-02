from django.apps import AppConfig


class UsersConfig(AppConfig):
    name = 'users'

    def ready(self):
        from django.contrib.auth.models import User

        # VERY dirty hack
        is_staff_field = User._meta.get_field('is_staff')
        is_staff_field.verbose_name = 'Is Annotator'
        is_staff_field.help_text = 'Designates whether the user can annotate pages and log into this admin site.'

        is_superuser_field = User._meta.get_field('is_superuser')
        is_superuser_field.verbose_name = 'Is Super Annotator'
        is_superuser_field.help_text = 'Designates that this user has super powers.'
        super().ready()
