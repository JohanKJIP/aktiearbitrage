from django.shortcuts import render
from mainpage.models import Stock
from mainpage.models import Stock_Info
from mainpage.models import Stock_Price

# Main view
def home(request):
    # query database
    # 
    stocks = ['johan', 'erik', 'pontus', 'linus']
    return render(request, 'mainpage/stock_list.html', {'stocks':stocks})

def send(request):
    p = Stock(name='Handelsbanken')
    p1 = Stock_Info(stock='Handelsbanken', stock_type='B')
    p2 = Stock_Price(stock_info=p1.pk, stock_price=120)
    p.save()
    p1.save()
    p2.save()