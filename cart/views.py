from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

from cart.models import Cart
from merch.models import Merch


@login_required
def cart_add(request, product_id):
    Cart.objects.create(user=request.user, item=Merch.objects.get(id=product_id), quantity=1)
    return redirect('cart:cart_detail')


@login_required
def cart_remove(request, item_id):
    cart = Cart.objects.get(id=item_id)
    cart.delete()
    return redirect('cart:cart_detail')


@login_required
def cart_detail(request):
    cart = Cart.objects.filter(user=request.user)
    return render(request, 'cart/cart.html', {'cart': cart})
