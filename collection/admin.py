from django.contrib import admin

from .models import *


# Register your models here.

class CollectionAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('title',)}


class BookCollectionAdmin(admin.ModelAdmin):
    list_display = ['book', 'collection']
    list_filter = ['collection']


admin.site.register(Collection, CollectionAdmin)
admin.site.register(ProductCollection, BookCollectionAdmin)
