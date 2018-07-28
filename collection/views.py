from django.shortcuts import render, redirect, resolve_url

from .models import *


def collection(request, slug):
    collection = Book.objects.filter(bookcollection__collection__slug=slug, available=True)
    title = Collection.objects.get(slug=slug)

    return render(request, 'collection/collection.html', {'collection': collection, 'title': title})


def collections(request):
    return redirect(resolve_url('shop:genres'))
