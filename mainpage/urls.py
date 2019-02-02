from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/send/', views.send, name='send'),
    path('ajax/get_stock_list/', views.get_stock_list, name='get_stock_list'),
    path('stocks/<slug:name>/', views.stock_page, name='stock_page'),
    path('about/', views.about, name='about'),
    path('my_list/', views.my_list, name='my_list'),
    path('my_page/', views.my_page, name='my_page'),
    path('ajax/get_stock_data/', views.get_stock_data, name='get_stock_data'),
]