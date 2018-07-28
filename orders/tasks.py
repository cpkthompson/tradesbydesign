from celery import task

from .models import Order


@task
def order_created(request, order_id):
    """
    Task to send an e-mail notification when an order is successfully created.
    """
    order = Order.objects.get(id=order_id)
    order.customer = request.user
    order.save()
    # subject = 'Order nr. {}'.format(order.id)
    # message = 'Dear {},\n\nYou have successfully placed an order. Your order id is {}.'.format(order.first_name,
    #                                                                          order.id)
    # mail_sent = send_mail(subject, message, 'admin@myshop.com', [order.email])
    # return mail_sent
    print("Order created")
