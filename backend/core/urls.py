from django.urls import path
from .views import (
    post_student, FacultyListAPIView,
    ApplicationListCreateAPIView, ApplicationDetailAPIView, student_login,application_status,FacultyLoginAPIView
)

urlpatterns = [
    path('faculties/', FacultyListAPIView.as_view(), name="faculty-list"),
    path('student/', post_student, name="post_student"),
    path("faculty-login/", FacultyLoginAPIView.as_view(), name="faculty-login"),
    path('student-login/', student_login, name='student-login'),
    path('applications/status/', application_status),
    path('applications/', ApplicationListCreateAPIView.as_view(), name='application-list-create'),
    path('applications/<int:pk>/', ApplicationDetailAPIView.as_view(), name='application-detail'),
]
