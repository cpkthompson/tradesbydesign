# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2018-07-28 11:56
from __future__ import unicode_literals

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('merch', '0002_merchtype_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='merchtype',
            name='image',
            field=models.ImageField(blank=True, upload_to='merch_type/%Y/%m/%d'),
        ),
        migrations.AlterField(
            model_name='merch',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='merch_type',
                                    to='merch.MerchType'),
        ),
        migrations.AlterField(
            model_name='merch',
            name='image',
            field=models.ImageField(blank=True, upload_to='merch/%Y/%m/%d'),
        ),
        migrations.AlterField(
            model_name='merch',
            name='owner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE,
                                    related_name='seller', to=settings.AUTH_USER_MODEL),
        ),
    ]
