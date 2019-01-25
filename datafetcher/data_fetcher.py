import gspread
from oauth2client.service_account import ServiceAccountCredentials

def connect():
    scope = ['https://spreadsheets.google.com/feeds',
         'https://www.googleapis.com/auth/drive']
    credentials = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
    gc = gspread.authorize(credentials)
    return gc.open("Aktiearbitrage").sheet1
    
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
    fetch_data(wks, 25)

