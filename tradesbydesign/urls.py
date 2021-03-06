from django.conf.urls import url, include
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from accounts.views import profile

urlpatterns = [

    url(r'^admin/', admin.site.urls),
    url(_(r'^cart/'), include('cart.urls', namespace='cart')),
    url(_(r'^orders/'), include('orders.urls', namespace='orders')),
    # url(_(r'^payment/'), include('payment.urls', namespace='payment')),
    url(_(r'^merch/'), include('merch.urls', namespace='merch')),
    url(_(r'^accounts/'), include('allauth.urls')),
    url(r'^accounts/profile/$', profile, name='profile'),
    url(r'^accounts/profile/(?P<username>[-\w]+)$', profile, name='view_profile'),
    url(r'^', include('frontend.urls', namespace='frontend')),

]
