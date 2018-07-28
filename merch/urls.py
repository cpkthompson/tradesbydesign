from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^(?P<merch_slug>[-\w]+)/$', views.product_detail, name='product_detail'),
]
