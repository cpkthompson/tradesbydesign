from django.conf.urls import url

from frontend import views

app_name = 'frontend'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^recent/$', views.recently_added, name='recent'),
]
