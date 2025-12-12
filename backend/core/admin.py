from django.contrib import admin
from .models import Faculty, Student, Project, Application, ProjectGroup

admin.site.register(Faculty)
admin.site.register(ProjectGroup)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['student', 'faculty', 'project', 'status', 'applied_at']
    list_filter = ['status', 'faculty']
    actions = ["accept_application", "reject_application"]

    def accept_application(self, request, queryset):
        count = 0
        for app in queryset:  # Loop through each application
            app.status = "Accepted"
            app.save()  #This triggers the signal!
            count += 1
        self.message_user(request, f'{count} application(s) accepted successfully.')
    accept_application.short_description = "Mark selected applications as Accepted"

    def reject_application(self, request, queryset):
        count = 0
        for app in queryset:  # Loop through each application
            app.status = "Rejected"
            app.save()  #This triggers the signal!
            count += 1
        self.message_user(request, f'{count} application(s) rejected successfully.')
    reject_application.short_description = "Mark selected applications as Rejected"


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('fullname', 'sapid', 'faculty', 'project', 'group')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        try:
            faculty = Faculty.objects.get(user=request.user)
            return qs.filter(faculty=faculty)
        except Faculty.DoesNotExist:
            return qs.none()


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, 'faculty'):
            return qs.filter(faculty=request.user.faculty)
        return qs.none()    