from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User,Group
from .models import Faculty, Application
import random
import string

@receiver(post_save, sender=Faculty)
def create_user_for_faculty(sender, instance, created, **kwargs):
    if created and not instance.user:
        # Generate a random password
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        
        # Create a new User
        user = User.objects.create_user(
            username=instance.name.lower().replace(" ", "") + str(instance.id)[:4],
            password=password,
            first_name=instance.name,
            email=instance.email,
        )
        # Optionally, set is_staff=True if you want faculty to access admin
        user.is_staff = True
        user.save()
        
        # Link the user to the faculty
        instance.user = user
        instance.save()
        group_name = "Faculty"  # change to your group name
        group, _ = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)
        user.save()
        # You can print or email the password to the faculty
        print(f"Created user for {instance.name} with password: {password}")


@receiver(post_save, sender=Application)
def update_student_on_accept(sender, instance, **kwargs):
    student = instance.student
    if instance.status == "Accepted":
        student.faculty = instance.faculty
        student.project = instance.project
        student.group = instance.group
        student.save()
    elif instance.status == "Rejected":
        student.faculty = None
        student.project = None
        student.group = None
        student.save()