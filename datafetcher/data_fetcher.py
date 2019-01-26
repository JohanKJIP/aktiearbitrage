import os
import sys
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

def connect():
    scope = ['https://spreadsheets.google.com/feeds',
         'https://www.googleapis.com/auth/drive']
    credentials = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
    gc = gspread.authorize(credentials)
    return gc.open("Aktiearbitrage").sheet1

def add_stocks(wks, rows):
    """
    Method to add the stock names to the Stock databaser.
    Should only be run if database is totally empty.
    """
    for i in range(2, rows):
        values_list = wks.row_values(i)

        # add name to stock
        print('Adding: ' + values_list[0])
        stock_entry = Stock(name=values_list[0])
        stock_entry.save()

        # add types to stock_info
        type1, type2 = get_stock_types(values_list[1], values_list[2], values_list[3])
        print("Type: " + type1)
        print("Type: " + type2)
        stock_info_entry = Stock_Info(stock=stock_entry, stock_type=type1) 
        stock_info_entry2 = Stock_Info(stock=stock_entry, stock_type=type2) 
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
        stock.latest_spread = spread
        stock.save()

        stock_info = Stock_Info.objects.filter(stock=stock)
        type1 = stock_info[0]
        type1.latest_price = price1
        type1.save()

        type2 = stock_info[1]
        type2.latest_price = price2
        type2.save()

if __name__ == "__main__":
    wks = connect()
    fetch_prices(wks, 25)
    #add_stocks(wks, 25)

