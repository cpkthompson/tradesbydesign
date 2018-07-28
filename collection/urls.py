from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.collections, name='collections'),
    url(r'^(?P<slug>[-\w]+)/$', views.collection, name='collection'),
]
