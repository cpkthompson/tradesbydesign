# from categories.models import Category
from django.shortcuts import render

# Create your views here.
from merch.models import MerchType


def index(request):
    categories = MerchType.objects.filter(is_active=True)
    context = {
        'categories': categories
    }
    return render(request, 'frontend/index.html', context)


def recently_added(request):
    return None
