from django.shortcuts import render, get_object_or_404

from cart.forms import CartAddProductForm
from .models import Product


# def product_categories(request):
#     genres = Category.objects.all()
#     return render(request, 'genres/genres.html', {'genres': genres})
#
#
# def product_category(request, slug):
#     genre = Product.objects.filter(product__slug=slug)
#     title = Category.objects.get(slug=slug)
#     return render(request, 'genres/genre.html', {'genre': genre, 'title': title})


def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug, available=True)
    cart_product_form = CartAddProductForm()
    return render(request,
                  'shop/product/detail.html',
                  {'product': product,
                   'cart_product_form': cart_product_form})
