from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt

from orders.models import Order


@csrf_exempt
def payment_done(request):
    return render(request, 'payment/done.html')


@csrf_exempt
def payment_canceled(request):
    return render(request, 'payment/canceled.html')


def payment_process(request):
    order_id = request.session.get('order_id')
    order = get_object_or_404(Order, id=order_id)
    host = request.get_host()

    form = None
    return render(request, 'payment/process.html', {'order': order,
                                                    'form': form})
