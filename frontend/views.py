# from categories.models import Category
from django.shortcuts import render

# Create your views here.
from merch.models import MerchType, Merch


def index(request):
    merch_types = MerchType.objects.filter(is_active=True)
    new_merch = Merch.objects.all().order_by('created')
    context = {
        'merch_types': merch_types,
        'new_merch': new_merch

    }
    return render(request, 'frontend/index.html', context)


def recently_added(request):
    return None


def merch_type(request, merch_type_slug):
    merch_type = MerchType.objects.get(slug=merch_type_slug)
    merch = Merch.objects.filter(category=merch_type)
    context = {
        'merch': merch,
        'merch_type': merch_type
    }
    return render(request, 'frontend/merch_type.html', context)
