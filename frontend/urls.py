from django.conf.urls import url
from django.utils.translation import gettext_lazy as _

from frontend import views

app_name = 'frontend'
urlpatterns = [
    url(_(r''), views.index, name='index'),
    url(r'^recent/$', views.recently_added, name='recent'),
]
