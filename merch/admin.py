# Register your models here.
from django.contrib import admin

from merch.models import Merch, MerchType


class MerchTypeAdmin(admin.ModelAdmin):
    pass


class MerchAdmin(admin.ModelAdmin):
    pass


admin.site.register(Merch, MerchAdmin)
admin.site.register(MerchType, MerchTypeAdmin)
