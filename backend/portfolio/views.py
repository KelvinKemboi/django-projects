from django.shortcuts import render
from django.template import loader

# Create your views here.
from django.http import HttpResponse

def home(request):
    home_page=loader.get_template("home.html")
    return HttpResponse(home_page.render())
