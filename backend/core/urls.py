from django.urls import path
from .views import post_student, FacultyListAPIView

urlpatterns = [
    path('faculties/', view=FacultyListAPIView.as_view(), name="faculty-list"),
    path('student/', post_student, name="post_student")
]