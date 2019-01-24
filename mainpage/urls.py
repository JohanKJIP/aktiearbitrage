from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/send/', views.send, name='send'),
    path('ajax/get_stock_list/', views.get_stock_list, name='get stock list'),
]