# from categories.models import Category
from django.shortcuts import render


# Create your views here.
def index(request):
    # categories = Category.objects.filter(active=True)
    context = {
        # 'categories': categories
    }
    return render(request, 'frontend/index.html', context)


def recently_added(request):
    return None
