# resources.py
from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget
from .models import Project, Faculty, ProjectGroup
import re
class ProjectResource(resources.ModelResource):
    faculty = fields.Field(
        column_name='faculty',  # column name in your Excel
        attribute='faculty',
        widget=ForeignKeyWidget(Faculty, 'name')
    )
    group = fields.Field(
        column_name='group',  # column name in your Excel
        attribute='group',
        widget=ForeignKeyWidget(ProjectGroup, 'name')
    )

    def before_save_instance(self, instance, row, **kwargs):
        constraints = {}

        if instance.description:
            pairs = re.findall(r'([A-Za-z]+)\s*:\s*(\d+)', instance.description)
            for dept, count in pairs:
                constraints[dept.upper()] = int(count)

        instance.dept_constraint = constraints or None

    class Meta:
        model = Project
        # title is unique, can be used to match existing rows
        import_id_fields = ['title']
        fields = ('title', 'description', 'faculty', 'group')
