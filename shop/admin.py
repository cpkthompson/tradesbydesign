from django.contrib import admin
from django.contrib.auth.models import Group

from .models import *


class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'stock', 'available', 'created']
    list_filter = ['available', 'created', 'updated']
    list_editable = ['price', 'stock', 'available']
    prepopulated_fields = {'slug': ('title',)}


admin.site.register(Product, ProductAdmin)
admin.site.unregister(Group)
