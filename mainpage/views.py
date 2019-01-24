from django.shortcuts import render
from django.http import HttpResponse
from mainpage.models import Stock, Stock_Info, Stock_Price
import json
from django.http import JsonResponse

# Main view
def home(request):
    # query database
    # 
    return render(request, 'mainpage/stock_list.html')

def get_stock_list(request):
    data = {
        'name': 'Vitor',
        'location': 'Finland',
        'is_active': True,
        'count': 28
    }
    return JsonResponse(data)

def send(request):
    p = Stock(name='Handelsbanken')
    p.save()
    p1 = Stock_Info(stock=p, stock_type='B')
    p1.save()
    p2 = Stock_Price(stock_info=p1, stock_price=120)
    p2.save()
    return HttpResponse('OK')