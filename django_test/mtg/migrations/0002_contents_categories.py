# Generated by Django 2.1.7 on 2019-04-01 19:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mtg', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='contents',
            name='categories',
            field=models.CharField(default='', max_length=128),
        ),
    ]