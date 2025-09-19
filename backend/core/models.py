from django.db import models
import uuid

# Create your models here.
class Faculty(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
 
    def __str__(self):
        return self.name
    

class Student(models.Model):
    sapid = models.CharField(max_length=11, unique=True)
    name = models.CharField(max_length=100)
    year = models.IntegerField(max_length=1)
    semester = models.IntegerField(max_length=2) 
    degree = models.CharField(max_length=100)   
    department = models.CharField(max_length=100)
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    