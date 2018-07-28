from categories.models import Category
from django import template

from collection.models import Collection

register = template.Library()
from cart.cart import Cart


@register.simple_tag
def categories():
    categories = Category.objects.all()
    return categories


@register.simple_tag
def collections():
    collections = Collection.objects.all()
    return collections


@register.simple_tag
def cart(request):
    cart = Cart(request)
    return cart.__len__()
