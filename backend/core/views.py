from rest_framework.decorators import api_view
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, generics
from .models import Student, Faculty, Application, Project, ProjectGroup
from .serializer import StudentSerializer, FacultySerializer, ApplicationSerializer, ProjectSerializer
from django.contrib.auth import authenticate, login
from django.core.mail import send_mail


@api_view(['POST'])
def student_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"detail": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        student = Student.objects.get(username=username)
    except Student.DoesNotExist:
        return Response({"detail": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)

    if student.password == password:
        return Response({"success": True, "username": student.username})
    else:
        return Response({"detail": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','POST'])
def post_student(request):
    if request.method == 'GET':
        sapid = request.query_params.get('sapid')
        if not sapid:
            return Response({"detail": "sapid parameter required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            student = Student.objects.get(sapid=sapid)
            serializer = StudentSerializer(student)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
    elif request.method == 'POST':
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


# NEW: Project List API with department filtering
class ProjectListAPIView(generics.ListAPIView):
    """
    List projects filtered by student's department.
    Only shows projects that have available slots for the student's department.
    Usage: GET /api/projects/?department=IT
    """
    serializer_class = ProjectSerializer

    def get_queryset(self):
        # Get student's department from query params
        student_dept = self.request.query_params.get('department', None)
        
        if not student_dept:
            # Return all projects if no department specified
            return Project.objects.all()
        
        # Get all projects
        projects = Project.objects.all()
        
        # Filter projects that have slots available for this department
        available_projects = []
        for project in projects:
            if project.dept_constraint:
                # Check if department exists in constraints and has slots > 0
                if student_dept in project.dept_constraint:
                    if project.dept_constraint[student_dept] > 0:
                        available_projects.append(project.id)
        
        # Return only projects with available slots
        return Project.objects.filter(id__in=available_projects)


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

        existing_app = Application.objects.filter(student=student).first()

        # Case 1: Student never applied → ALLOW
        if existing_app is None:
            pass  # continue

        # Case 2: Pending → BLOCK
        elif existing_app.status == "Pending":
            return Response({"detail": "Your previous application is still pending. You cannot apply again."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Case 3: Accepted → BLOCK
        elif existing_app.status == "Accepted":
            return Response({"detail": "You are already accepted in a project. Cannot apply again."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Case 4: Rejected → ALLOW re-apply
        elif existing_app.status == "Rejected":
            existing_app.delete()  # remove old rejected application

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
        old_status = app.status # track of current status
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
                    
        app._old_status = old_status 
        app.status = new_status
        app.save()

        # Send email if status changed
        student_email = app.student.email
        student_name = app.student.fullname
        faculty_name = app.faculty.name

        # Only send email when status actually changes
        if new_status != old_status:

            # Accepted Email
            if new_status == "Accepted":
                print("Sending accected email to:", student_email) 
                send_mail(
                    subject="Your Project Application is Accepted",
                    message=f"Hello {student_name},\n\n"
                            f"Good news! Your application for the project under {faculty_name} has been ACCEPTED.\n\n"
                            "You can now proceed with your next steps.\n\n"
                            "Regards,\nUniversity Portal",
                    from_email=None,  # uses DEFAULT_FROM_EMAIL
                    recipient_list=[student_email],
                    fail_silently=False
                )

            # Rejected Email
            elif new_status == "Rejected":
                print("Sending rejection email to:", student_email) 
                send_mail(
                    subject="Your Project Application is Rejected",
                    message=f"Hello {student_name},\n\n"
                            f"Your application for the project under {faculty_name} has been REJECTED.\n\n"
                            "You may apply again from the student portal.\n\n"
                            "Regards,\nUniversity Portal",
                    from_email=None,
                    recipient_list=[student_email],
                    fail_silently=True
              )
        return Response(ApplicationSerializer(app).data)

    def delete(self, request, pk):
        app = self.get_object(pk)
        if not app:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)
        app.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FacultyLoginAPIView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)
        if user is None or not user.is_staff:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        login(request, user)  # creates session cookie
        return Response({"detail": "ok"}, status=status.HTTP_200_OK)


@api_view(['GET'])
def application_status(request):
    sapid = request.query_params.get('sapid')

    if not sapid:
        return Response({"detail": "sapid is required"}, status=400)

    try:
        student = Student.objects.get(sapid=sapid)
    except Student.DoesNotExist:
        return Response({"detail": "No student found"}, status=404)

    app = Application.objects.filter(student=student).first()

    if not app:
        return Response({
            "overall_status": "Not Applied",
            "faculty_status": "Pending",
            "hod_status": "Pending"
        })

    return Response({
        "overall_status": app.status,
        "faculty_status": app.faculty_status if hasattr(app, "faculty_status") else app.status,
        "hod_status": app.hod_status if hasattr(app, "hod_status") else "Pending"
    })