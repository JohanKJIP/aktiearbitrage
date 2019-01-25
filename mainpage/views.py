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
        data[stock.name] = "test"
    return JsonResponse(data)

def send(request):
    query_results = Stock.objects.all()
    return HttpResponse(query_results)