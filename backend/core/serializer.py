from rest_framework import serializers
from .models import Student,Faculty, Project,ProjectGroup,Application

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class ProjectGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectGroup
        fields = ['id', 'name']

class FacultySerializer(serializers.ModelSerializer):
    projects = ProjectSerializer(read_only=True)  # projects linked to faculty
    group = ProjectGroupSerializer(read_only=True)                  # nested group info

    class Meta:
        model = Faculty
        fields = ['id','name', 'department', 'group', 'projects']

    def get_group(self, obj):
        if obj.group:
            return {'id': obj.group.id, 'name': obj.group.name}
        return None
    
class ApplicationSerializer(serializers.ModelSerializer):
    # Accept sapid in POST in place of student id
    student_sapid = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Application
        # note: we don't include 'student' in writable fields; we'll assign it in view
        fields = ['id', 'student', 'student_sapid', 'faculty', 'project', 'group', 'status', 'applied_at']
        read_only_fields = ['id', 'student', 'applied_at']

    def to_representation(self, instance):
        # default representation plus student sapid for convenience
        data = super().to_representation(instance)
        data['student_sapid'] = instance.student.sapid if instance.student else None
        return data