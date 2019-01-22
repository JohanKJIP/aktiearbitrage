from django.shortcuts import render

# Main view
def home(request):
    # query database
    # 
    stocks = ['johan', 'erik', 'pontus', 'linus']
    return render(request, 'mainpage/stock_list.html', {'stocks':stocks})