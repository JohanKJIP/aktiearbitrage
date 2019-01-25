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
    This method just add the stock names to the Stock databaser.
    Should only be run if database is totally empty.
    """
    for i in range(2, rows):
        values_list = wks.row_values(i)
        print('Adding: ' + values_list[0])
        stock_entry = Stock(name=values_list[0])
        stock_entry.save()
    
def fetch_data(wks, rows):
    for i in range(2, rows):
        values_list = wks.row_values(i)
        name = values_list[0]
        stock_a = ""
        stock_b = ""
        stock_c = ""

        try:
            stock_a = float(values_list[1])
        except ValueError:
            pass
        try:
            stock_b = float(values_list[2])
        except ValueError:
            pass
        try:
            stock_c = float(values_list[3])
        except ValueError:
            pass
        spread = float(values_list[4].replace('%', ""))

        print("Name: {0}, stock_a: {1}, stock_b: {2}, stock_c: {3}, spread: {4}".format(name, stock_a, stock_b, stock_c, spread))

if __name__ == "__main__":
    wks = connect()
    # fetch_data(wks, 25)
    add_stocks(wks, 25)

