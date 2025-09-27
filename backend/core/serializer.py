from rest_framework import serializers
from .models import Student,Faculty, Project

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'description']

class FacultySerializer(serializers.ModelSerializer):
    projects = ProjectSerializer(many=True, read_only=True)  # related_name for reverse FK

    class Meta:
        model = Faculty
        fields = ['id', 'name', 'department', 'projects']