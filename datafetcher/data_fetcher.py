import os
import sys
import time
with open('project_path.txt', 'r') as myfile:
  data=myfile.read().replace('\n', '')
  sys.path.append(data)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "aktiearbitrage.settings")
import django
django.setup()

# your imports, e.g. Django models
from mainpage.models import Stock, Stock_Info, Stock_Price

import gspread
from oauth2client.service_account import ServiceAccountCredentials

def connect(sheet):
    scope = ['https://spreadsheets.google.com/feeds',
         'https://www.googleapis.com/auth/drive']
    credentials = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
    gc = gspread.authorize(credentials)
    return gc.open("Aktiearbitrage").worksheet(sheet)

def add_stocks(wks, rows):
    """
    Method to add the stock names to the Stock databaser.
    Should only be run if database is totally empty.
    """
    for i in range(2, rows):
        values_list = wks.row_values(i)

        # add name to stock
        print('Adding: ' + values_list[0])
        stock_text = values_list[9]
        stock_entry = Stock(name=values_list[0], slug=values_list[6], info=stock_text)
        stock_entry.save()

        # add types to stock_info
        type1, type2 = get_stock_types(values_list[1], values_list[2], values_list[3])
        type1_url = values_list[7]
        type2_url = values_list[8]
        type1_vol = float(values_list[10].replace(',',''))
        type2_vol = float(values_list[11].replace(',',''))

        print("Type: " + type1 + " url: " + type1_url + "vol: " + str(type1_vol))
        print("Type: " + type2 + " url: " + type2_url + "vol: " + str(type2_vol))
        stock_info_entry = Stock_Info(stock=stock_entry, stock_type=type1, url=type1_url, volume=type1_vol) 
        stock_info_entry2 = Stock_Info(stock=stock_entry, stock_type=type2, url=type2_url, volume=type2_vol) 
        stock_info_entry.save()
        stock_info_entry2.save()
    
def get_stock_types(a, b, c):
    """
    Method converts stock value fields in spreadhseet to types
    | A | B | C |
    | 2 | 5 | x |

    returns A and B since these have actual values.
    """
    if ((a!="x") and (b!="x")):
        return "A", "B"
    if ((a!="x") and (c!="x")):
        return "A", "C"
    if ((b!="x") and (c!="x")):
        return "B", "C"

def get_price_from_types(a, b, c):
    if (a == "x"):
        return b, c
    if (b == "x"):
        return a, c
    if (c == "x"):
        return a, b

def fetch_prices(wks, rows):
    for i in range(2, rows):
        values_list = wks.row_values(i)
        name = values_list[0]
        stock_a_price = "x"
        stock_b_price = "x"
        stock_c_price = "x"

        print("Updating: " + name)
        try:
            stock_a_price = float(values_list[1])
        except ValueError:
            pass
        try:
            stock_b_price = float(values_list[2])
        except ValueError:
            pass
        try:
            stock_c_price = float(values_list[3])
        except ValueError:
            pass
        spread = float(values_list[4].replace('%', ""))
        price1, price2 = get_price_from_types(stock_a_price, stock_b_price, stock_c_price)

        # update latest stock spread 
        stock = Stock.objects.get(name=name)
        stock.spread = spread
        stock.save()

        stock_info = Stock_Info.objects.filter(stock=stock)
        type1 = stock_info[0]
        type1.latest_price = price1
        type1.save()

        type2 = stock_info[1]
        type2.latest_price = price2
        type2.save()

def fetch_historical_prices(wks, rows):
    time.sleep(1)
    stocks = wks.row_values(1)
    print(stocks)
    test = wks.row_values(2)
    print(test)
    test = wks.row_values(4)
    print(test)
    for i in range(3,rows):
        data = wks.row_values(i)
        for j in range(0, len(stocks), 2):
            stock_tag = stocks[j].split("_")
            stock = stock_tag[0]
            stock_type = stock_tag[1]
            stock = Stock.objects.get(slug=stock)
            stock_info = Stock_Info.objects.filter(stock=stock)

            # types are always sorted so we know stock_info[0] is a
            if (stock_type == 'a'):
                stock_info = stock_info[0]
            else:
                stock_info = stock_info[1]

            # save the data
            date = data[j]
            price = data[j+1]
            print(date)
            print(price)
            if (price != ''):
                stock_price = Stock_price(stock_info=stock_info, date=date, stock_price=price)
                stock_price.save()


if __name__ == "__main__":
    #wks1 = connect('stocks')
    #fetch_prices(wks1, 25)
    #add_stocks(wks1, 25)
    #wks2 = connect('prices')
    #fetch_historical_prices(wks2, 35)

