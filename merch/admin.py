# Register your models here.
from django.contrib import admin

from merch.models import Merch


class MerchAdmin(admin.ModelAdmin):
    pass


admin.site.register(Merch, MerchAdmin)
