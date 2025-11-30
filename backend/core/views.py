from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, generics
from .models import Student, Faculty, Application, Project, ProjectGroup
from .serializer import StudentSerializer, FacultySerializer, ApplicationSerializer


@api_view(['POST'])
def post_student(request):
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FacultyListAPIView(generics.ListAPIView):
    serializer_class = FacultySerializer

    def get_queryset(self):
        queryset = Faculty.objects.all()  # fetch fresh every time
        group_name = self.request.query_params.get('group', None)
        if group_name:
            queryset = queryset.filter(group__name=group_name)
        return queryset

class ApplicationListCreateAPIView(APIView):
    def get(self, request):
        apps = Application.objects.all()
        serializer = ApplicationSerializer(apps, many=True)
        return Response(serializer.data)

    def post(self, request):
        sapid = request.data.get('student_sapid')
        if not sapid:
            return Response({"detail": "student_sapid is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = Student.objects.get(sapid=sapid)
        except Student.DoesNotExist:
            return Response({"detail": "No Student found with this sapid"}, status=status.HTTP_400_BAD_REQUEST)

        if Application.objects.filter(student=student, status='Accepted').exists():
            return Response({"detail": "Student already accepted in a project"}, status=status.HTTP_400_BAD_REQUEST)

        faculty_id = request.data.get('faculty')
        project_id = request.data.get('project')
        group_id = request.data.get('group')

        try:
            faculty = Faculty.objects.get(pk=faculty_id)
        except Faculty.DoesNotExist:
            return Response({"detail": "Invalid faculty id"}, status=status.HTTP_400_BAD_REQUEST)

        project = Project.objects.filter(pk=project_id).first() if project_id else None
        group = ProjectGroup.objects.filter(pk=group_id).first() if group_id else None

        app = Application.objects.create(
            student=student,
            faculty=faculty,
            project=project,
            group=group,
            status='Pending'
        )
        return Response(ApplicationSerializer(app).data, status=status.HTTP_201_CREATED)


class ApplicationDetailAPIView(APIView):
    def get_object(self, pk):
        return Application.objects.filter(pk=pk).first()

    def get(self, request, pk):
        app = self.get_object(pk)
        if not app:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ApplicationSerializer(app).data)

    def patch(self, request, pk):
        app = self.get_object(pk)
        if not app:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status', app.status)
        faculty_id = request.data.get('faculty')
        project_id = request.data.get('project')
        group_id = request.data.get('group')

        if faculty_id:
            app.faculty = Faculty.objects.filter(pk=faculty_id).first() or app.faculty
        if project_id:
            app.project = Project.objects.filter(pk=project_id).first()
        if group_id:
            app.group = ProjectGroup.objects.filter(pk=group_id).first()

        app.status = new_status
        app.save()

        return Response(ApplicationSerializer(app).data)

    def delete(self, request, pk):
        app = self.get_object(pk)
        if not app:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        app.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
