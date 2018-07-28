from django.conf.urls import url

from frontend import views

app_name = 'frontend'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^recent/$', views.recently_added, name='recent'),
    url(r'^categories/(?P<merch_type_slug>[-\w]+)/$', views.merch_type, name='merch_type'),

]
