# Generated by Django 2.1.7 on 2019-05-09 19:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('publications', '0010_auto_20190508_2344'),
    ]

    operations = [
        migrations.AddField(
            model_name='annotation',
            name='visible',
            field=models.BooleanField(default=False),
        ),
    ]
