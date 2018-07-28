from django.conf.urls import url

from merch import views

app_name = 'merch'
urlpatterns = [
    url(r'^(?P<merch_slug>[-\w]+)/$', views.merch_detail, name='merch_detail'),
]
