from django.contrib import admin
from django.urls import path, include

from frontend import views

app_name = 'frontend'
urlpatterns = [
    path('', views.index, name='index'),

]
