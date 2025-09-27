from django.urls import path
from .views import post_student, FacultyListAPIView

urlpatterns = [
    path('student/', view=post_student, name="post_student"),
    path('faculties/', view=FacultyListAPIView.as_view(), name="faculty-list"),
]