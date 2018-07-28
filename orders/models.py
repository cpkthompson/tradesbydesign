from django.conf import settings
from django.db import models

from shop.models import Product


class Order(models.Model):
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='order', null=True)
    address = models.CharField(max_length=250)
    postal_code = models.CharField(max_length=20)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    phone_number = models.IntegerField(null=True, blank=True)
    paid = models.BooleanField(default=False)

    class Meta:
        ordering = ('-created',)

    def __str__(self):
        return 'Order {}'.format(self.id)

    @property
    def total_cost(self):
        return sum(item.get_cost() for item in self.items.all())

    @property
    def order_customer(self):
        return self.customer.get_full_name()

    def get_total_cost(self):
        return sum(item.get_cost() for item in self.items.all())


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items')
    product = models.ForeignKey(Product, related_name='order_items')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return '{}'.format(self.id)

    def get_cost(self):
        return self.price * self.quantity
