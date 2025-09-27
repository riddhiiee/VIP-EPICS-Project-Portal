from django.contrib import admin
from .models import Faculty, Student, Project, Application

# Register your models here.
admin.site.register(Faculty)
admin.site.register(Student)
admin.site.register(Project)

@admin.register(Application)

class ApplicationAdmin(admin.ModelAdmin):
    actions = ["accept_application", "reject_application"]

    def accept_application(self, request, queryset):
        queryset.update(status="Accepted")
    accept_application.short_description = "Mark selected applications as Accepted"

    def reject_application(self, request, queryset):
        queryset.update(status="Rejected")
    reject_application.short_description = "Mark selected applications as Rejected"