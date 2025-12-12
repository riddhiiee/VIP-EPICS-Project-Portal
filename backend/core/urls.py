from django.urls import path
from .views import (
    FacultyLoginAPIView, post_student, FacultyListAPIView,
    ApplicationListCreateAPIView, ApplicationDetailAPIView
)

urlpatterns = [
    path('faculties/', FacultyListAPIView.as_view(), name="faculty-list"),
    path('student/', post_student, name="post_student"),
    path("faculty-login/", FacultyLoginAPIView.as_view(), name="faculty-login"),
    # Application endpoints
    path('applications/', ApplicationListCreateAPIView.as_view(), name='application-list-create'),
    path('applications/<int:pk>/', ApplicationDetailAPIView.as_view(), name='application-detail'),
    
]
