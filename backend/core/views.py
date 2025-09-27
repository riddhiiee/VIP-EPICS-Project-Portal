from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Student
from .serializer import StudentSerializer

# from json to python
# we write our endpoints here
# we will build API endpoints here
# get all students in the DB

@api_view(['POST'])

def post_student(request):
    data=request.data
    serializer=StudentSerializer(data=data) # json to python
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)