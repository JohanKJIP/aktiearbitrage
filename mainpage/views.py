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
    query = request.GET['query']
    #sort = request.GET['sort']
    stock_list = Stock.objects.filter(name__contains=query)
    data = {}
    for stock in stock_list:
        inner_data = {}
        inner_data['spread'] = stock.latest_spread

        stock_info = Stock_Info.objects.filter(stock=stock)
        type1 = stock_info[0]
        type2 = stock_info[1]

        inner_data['type1'] = {'type':type1.stock_type, 'latest_price':type1.latest_price}
        inner_data['type2'] = {'type':type2.stock_type, 'latest_price':type2.latest_price}

        data[stock.name] = inner_data
    return JsonResponse(data)

def send(request):
    query_results = Stock.objects.all()
    return HttpResponse(query_results)