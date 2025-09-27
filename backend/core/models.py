from django.db import models
import uuid

# Create your models here.
class Faculty(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
 
    def __str__(self):
        return self.name
    
class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name="projects")

    def __str__(self):
        return self.title

class Student(models.Model):
    username = models.CharField(max_length=100, unique=True)
    fullname = models.CharField(max_length=100)
    sapid = models.CharField(max_length=11, unique=True)
    email = models.EmailField(unique=True)
    year = models.IntegerField()
    semester = models.IntegerField()
    degree = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    division = models.CharField(max_length=1)
    password = models.CharField(max_length=100)
    campus = models.CharField(max_length=100)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)


    def __str__(self):
        return self.name
    
class Application(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} → {self.project} ({self.status})"
