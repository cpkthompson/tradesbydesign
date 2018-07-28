from django.contrib import admin

# Register your models here.
from merch.models import Merch


class MerchAdmin(admin.ModelAdmin):
    pass


admin.site.register(Merch, MerchAdmin)
