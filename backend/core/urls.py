from django.urls import path
from . import views

urlpatterns = [
    path('blogs/', view=views.get_blogs, name="get_blogs"),]