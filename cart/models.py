# Create your models here.
from django.conf import settings
from django.db import models

from merch.models import Merch


class Cart(models.Model):
    quantity = models.IntegerField(default=1)
    item = models.ForeignKey(Merch, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='buyer', blank=True, null=True)
    available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
