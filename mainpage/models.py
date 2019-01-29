from django.db import models
from datetime import datetime  

# Create your models here.
class Stock(models.Model):
    slug = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    spread = models.FloatField(default=0)

    def __str__(self):
        return self.name

class Stock_Info(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    stock_type = models.CharField(max_length=1, default="")
    latest_price = models.IntegerField(null=True)

    def __str__(self):
        return self.stock_type

class Stock_Price(models.Model):
    stock_info = models.ForeignKey(Stock_Info, on_delete=models.CASCADE)
    date = models.DateField(default=datetime.now, blank=True)
    stock_price = models.IntegerField()