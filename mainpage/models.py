from django.db import models
from datetime import datetime 
from django.contrib.auth.models import User 

# Create your models here.
class Stock(models.Model):
    slug = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    spread = models.FloatField(default=0)
    info = models.TextField(default="")

    def __str__(self):
        return self.name

class Stock_Info(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    stock_type = models.CharField(max_length=1, default="")
    latest_price = models.FloatField(null=True)
    url = models.CharField(max_length=120, default="")
    volume = models.IntegerField(default=0)

    def __str__(self):
        return self.stock_type

class Stock_Price(models.Model):
    stock_info = models.ForeignKey(Stock_Info, on_delete=models.CASCADE)
    date = models.DateField(default=datetime.now, blank=True)
    stock_price = models.IntegerField()

class UserProfile(models.Model):  
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    minimum_fee = models.FloatField(default=0)
    variable_fee = models.FloatField(default=0)

class User_Stock(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    name = models.ForeignKey(Stock_Info, on_delete=models.PROTECT)
    buy_price = models.FloatField(default=0)
    amount = models.IntegerField(default=0)