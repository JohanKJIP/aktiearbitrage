# Generated by Django 2.1.5 on 2019-01-29 10:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainpage', '0007_auto_20190126_2032'),
    ]

    operations = [
        migrations.AddField(
            model_name='stock',
            name='slug',
            field=models.CharField(default='', max_length=30),
            preserve_default=False,
        ),
    ]