from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/send/', views.send, name='send'),
    path('api/create_profile/', views.create_user_profile, name='create_profile'),
    path('ajax/get_stock_list/', views.get_stock_list, name='get_stock_list'),
    path('stocks/<slug:name>/', views.stock_page, name='stock_page'),
    path('about/', views.about, name='about'),
    path('my_list/', views.my_list, name='my_list'),
    path('my_page/', views.my_page, name='my_page'),
    path('ajax/save_courtage', views.save_courtage, name='save_courtage'),
    path('ajax/get_stock_data/', views.get_stock_data, name='get_stock_data'),
    path('ajax/get_profile/', views.get_profile, name='get_profile'),
    path('ajax/save_stock_list_item/', views.save_stock_list_item, name='save_stock_list_item'),
    path('ajax/get_user_stock_list/', views.get_user_stock_list, name='get_user_stock_list'),
    path('ajax/delete_user_list_item/', views.delete_user_list_item, name='delete_user_list_item'),
]