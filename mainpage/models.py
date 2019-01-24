from django.db import models

# Create your models here.
class Stock(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self):
        return self.name

class Stock_Info(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    stock_type = models.CharField(max_length=1, default="")

    def __str__(self):
        return self.stock_type

class Stock_Price(models.Model):
    stock_info = models.ForeignKey(Stock_Info, on_delete=models.CASCADE)
    date = models.DateField()
    stock_price = models.IntegerField()