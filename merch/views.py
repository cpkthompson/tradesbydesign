from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
from merch.models import Merch


def merch_detail(request, merch_slug):
    merch = Merch.objects.get(slug=merch_slug)
    return HttpResponse(merch.name)