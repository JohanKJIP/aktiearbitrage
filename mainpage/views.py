from django.shortcuts import render
from django.http import HttpResponse
from mainpage.models import Stock, Stock_Info, Stock_Price
import json
from django.http import JsonResponse

# Main view
def home(request):
    return render(request, 'mainpage/stock_list.html')

# Stock list on home page
def get_stock_list(request):
    query = request.GET['query']
    sort = request.GET['sort']

    # default to alphabetical sort
    if sort != 'name' and sort != '-name' and sort != 'spread' and sort != '-spread':
        sort = 'name'
    stock_list = Stock.objects.filter(name__startswith=query).order_by(sort)

    # Fetch data from database and put into serializable dstructure
    data = {}
    for stock in stock_list:
        inner_data = {}
        inner_data['spread'] = stock.spread
        inner_data['name'] = stock.name

        stock_info = Stock_Info.objects.filter(stock=stock)
        type1 = stock_info[0]
        type2 = stock_info[1]

        inner_data['type1'] = {'type':type1.stock_type, 'latest_price':type1.latest_price}
        inner_data['type2'] = {'type':type2.stock_type, 'latest_price':type2.latest_price}

        data[stock.slug] = inner_data
    return JsonResponse(data)

def stock_page(request, name):
    stock = Stock.objects.get(slug=name)
    data = {'name':stock.name}
    return render(request, 'mainpage/stock_detail.html', data)

def about(request):
    return render(request, 'mainpage/about.html')

def send(request):
    """ 
    This is a dev view.
    """
    stock = Stock.objects.get(name="Handelsbanken")
    stock_info = Stock_Info.objects.filter(stock=stock)
    type1 = stock_info[0]
    type2 = stock_info[1]

    a = Stock_Price(stock_info=type1, stock_price=20, date='2019-01-29')
    a.save()
    b = Stock_Price(stock_info=type1, stock_price=30, date='2019-01-30')
    b.save()
    c = Stock_Price(stock_info=type1, stock_price=50, date='2019-01-31')
    c.save()

    a = Stock_Price(stock_info=type2, stock_price=100, date='2019-01-29')
    a.save()
    b = Stock_Price(stock_info=type2, stock_price=80, date='2019-01-30')
    b.save()
    c = Stock_Price(stock_info=type2, stock_price=45, date='2019-01-31')
    c.save()

    return HttpResponse("Complete")

def get_stock_data(request):
    data = {}
    if request.GET:
        name = request.GET['name']
        stock = Stock.objects.get(name=name)
        # get the different types e.g. A, B
        stock_infos = Stock_Info.objects.filter(stock=stock)
        type1 = stock_infos[0]
        type2 = stock_infos[1]
        data['type1'] = type1.stock_type
        data['type2'] = type2.stock_type

        # get prices for the two types
        type1_prices = Stock_Price.objects.filter(stock_info=type1)
        type2_prices = Stock_Price.objects.filter(stock_info=type2)
        data['type1_prices'] = list(type1_prices.values())
        data['type2_prices'] = list(type2_prices.values())
    return JsonResponse(data)
