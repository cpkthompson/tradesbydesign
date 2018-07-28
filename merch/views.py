# Create your views here.
from django.shortcuts import render

from merch.models import Merch


def product_detail(request, merch_slug):
    merch = Merch.objects.get(slug=merch_slug)
    context = {
        'merch': merch,
    }
    return render(request, 'merch/merch_detail.html', context)
