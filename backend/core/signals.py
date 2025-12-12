from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Group
from .models import Faculty, Application
import random
import string
from django.core.mail import send_mail
from django.conf import settings


@receiver(post_save, sender=Faculty)
def create_user_for_faculty(sender, instance, created, **kwargs):
    """
    Automatically create a Django User account when a new Faculty is created.
    Assigns a random password and adds them to the Faculty group.
    """
    if created and not instance.user:
        # Generate a random 8-character password
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        
        # Create a new User
        user = User.objects.create_user(
            username=instance.name.lower().replace(" ", "") + str(instance.id)[:4],
            password=password,
            first_name=instance.name,
            email=instance.email,
        )
        user.is_staff = True
        user.save()
        
        # Link the user to the faculty
        instance.user = user
        instance.save()
        
        # Add to Faculty group
        group_name = "Faculty"
        group, _ = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)
        user.save()
        
        # Print password (In production, send via email instead)
        print(f"Created user for {instance.name} with password: {password}")


@receiver(post_save, sender=Application)
def update_student_on_accept(sender, instance, created, **kwargs):
    """
    Automatically update Student when Application status changes:
    - If Accepted: Assign faculty, project, and group to student
    - If Rejected: Clear faculty, project, and group from student
    """
    student = instance.student
    
    if instance.status == "Accepted":
        student.faculty = instance.faculty
        student.project = instance.project
        student.group = instance.group
        student.save()
        send_mail(
                subject="Your Project Application is Accepted",
                message=f"Hello {student.fullname},\n\n"
                        f"Congratulations! Your application for the project under {instance.faculty.name} has been ACCEPTED.\n\n"
                        "Regards,\nUniversity Portal",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[student.email],
                fail_silently=False,
            )   
        
    elif instance.status == "Rejected":
        student.faculty = None
        student.project = None
        student.group = None
        student.save()
        send_mail(
            subject="Your Project Application is Rejected",
            message=f"Hello {student.fullname},\n\n"
                    f"Your application for the project under {instance.faculty.name} has been REJECTED.\n\n"
                    "You can apply again from the student portal.\n\n"
                    "Regards,\nUniversity Portal",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[student.email],
            fail_silently=False,
        )

