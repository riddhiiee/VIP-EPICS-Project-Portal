from django.contrib import admin
from .models import Faculty, Student, Project, Application, ProjectGroup

admin.site.register(Faculty)
admin.site.register(ProjectGroup)

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    actions = ["accept_application", "reject_application"]

    def accept_application(self, request, queryset):
        queryset.update(status="Accepted")
    accept_application.short_description = "Mark selected applications as Accepted"

    def reject_application(self, request, queryset):
        queryset.update(status="Rejected")
    reject_application.short_description = "Mark selected applications as Rejected"


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('fullname', 'sapid', 'faculty', 'project')

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
