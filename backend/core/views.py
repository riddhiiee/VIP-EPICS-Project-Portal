from django.shortcuts import render, HttpResponse
# Create your views here.
def get_blogs(request):
    return HttpResponse("<h1>Hello from Django !</h1>")