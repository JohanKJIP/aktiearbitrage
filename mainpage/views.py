from django.shortcuts import render
from django.http import HttpResponse
from mainpage.models import Stock, Stock_Info, Stock_Price

# Main view
def home(request):
    # query database
    # 
    stocks = Stock.objects.all()
    #print(stocks[0])
    #stock_info = Stock_Info.objects.get(stock=stocks[0])
    #print(stocks)
    return render(request, 'mainpage/stock_list.html', {'stocks':stocks})

def send(request):
    p = Stock(name='Handelsbanken')
    p.save()
    p1 = Stock_Info(stock=p, stock_type='B')
    p1.save()
    p2 = Stock_Price(stock_info=p1, stock_price=120)
    p2.save()
    return HttpResponse('OK')