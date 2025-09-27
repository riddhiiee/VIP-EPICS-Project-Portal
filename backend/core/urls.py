from django.urls import path
from .views import post_student

urlpatterns = [
    path('student/', post_student, name="post_student")
]