from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.template.loader import render_to_string

from cart.cart import Cart
from .forms import OrderCreateForm
# import weasyprint
from .models import Order, OrderItem
from .tasks import order_created


@login_required
def order_create(request):
    cart = Cart(request)
    if request.method == 'POST':
        form = OrderCreateForm(request.POST)
        if form.is_valid():
            order = form.save()
            for item in cart:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    price=item['price'],
                    quantity=item['quantity'])
                from shop.models import Book
                # print("Here: {}".format(item['product']))
                book = get_object_or_404(Book, title__contains=item['product'])
                book.stock = book.stock - item['quantity']
                if book.stock <= 0:
                    book.available = False
                # TODO: Send email than book is out of stock
                book.save()
            # clear the cart
            cart.clear()
            # launch asynchronous task
            order_created(request, order.id)
            # set the order in the session
            request.session['order_id'] = order.id
            # redirect to the payment
            # return redirect(reverse('payment:process'))
            return redirect(reverse('orders:completed'))
    else:
        form = OrderCreateForm()
    return render(request, 'orders/order/create.html', {'cart': cart,
                                                        'form': form})


def order_completed(request):
    return render(request, 'orders/order/completed.html', {})


@staff_member_required
def admin_order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    return render(request, 'admin/orders/order/detail.html', {'order': order})


@staff_member_required
def admin_order_pdf(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    html = render_to_string('orders/order/pdf.html', {'order': order})
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'filename="order_{}.pdf"'.format(order.id)
    # weasyprint.HTML(string=html).write_pdf(response,
    #                                        stylesheets=[weasyprint.CSS(settings.STATIC_ROOT + 'css/pdf.css')])
    return response
