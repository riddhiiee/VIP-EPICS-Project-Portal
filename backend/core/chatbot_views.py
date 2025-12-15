import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Student, Project, Faculty, ProjectGroup
from .utils import render_html_table


# -------------------------------
#  NLP → MODEL + FILTERS
# -------------------------------
def interpret_prompt(prompt: str):
    prompt = prompt.lower()

    # detect keywords
    wants_students = any(x in prompt for x in ["student", "students"])
    wants_projects = any(x in prompt for x in ["project", "projects"])
    wants_faculty = any(x in prompt for x in ["faculty", "faculties"])
    wants_group = any(x in prompt for x in ["group", "vip", "epics"])

    # --------------------
    # STUDENTS
    # --------------------
    if wants_students:
        filters = {}

        # FILTER: By Group
        if "vip" in prompt:
            filters["group__name__icontains"] = "vip"
        if "epics" in prompt:
            filters["group__name__icontains"] = "epics"

        # FILTER: By Project Title
        if "project" in prompt:
            for word in prompt.split():
                if word not in ["show", "students", "project", "of", "in", "under"]:
                    filters["project__title__icontains"] = word

        # FILTER: By Faculty Name
        if "under" in prompt or "by" in prompt:
            # detect faculty name (last word after "under/by")
            words = prompt.split()
            if words[-1].isalpha():
                filters["faculty__name__icontains"] = words[-1]

        return {
            "model": "Student",
            "filters": filters
        }

    # --------------------
    # PROJECTS
    # --------------------
    if wants_projects:
        filters = {}
        if "vip" in prompt:
            filters["group__name__icontains"] = "vip"
        if "epics" in prompt:
            filters["group__name__icontains"] = "epics"

        return {"model": "Project", "filters": filters}

    # --------------------
    # FACULTY
    # --------------------
    if wants_faculty:
        filters = {}
        if "vip" in prompt:
            filters["group__name__icontains"] = "vip"
        if "epics" in prompt:
            filters["group__name__icontains"] = "epics"

        return {"model": "Faculty", "filters": filters}

    return None


# -------------------------------
#  BOT VIEW
# -------------------------------
MODEL_MAP = {
    "Student": Student,
    "Project": Project,
    "Faculty": Faculty,
}

# Define which fields to show for each model
MODEL_FIELDS = {
    "Student": ["fullname", "sapid", "email", "group__name", "faculty__name", "project__title", "year", "semester", "department"],
    "Project": ["title", "faculty__name", "group__name"],
    "Faculty": ["name", "email", "department", "group__name"],
}


@csrf_exempt
def admin_chatbot(request):
    if request.method != "POST":
        return JsonResponse({"response": "POST request required"}, status=400)

    try:
        data = json.loads(request.body)
        prompt = data.get("prompt", "")
    except:
        return JsonResponse({"response": "Invalid JSON"}, status=400)

    # 1️⃣ Interpret prompt
    query = interpret_prompt(prompt)
    if not query:
        return JsonResponse({"response": "I could not understand the query."})

    model_name = query["model"]
    filters = query["filters"]

    Model = MODEL_MAP.get(model_name)
    fields = MODEL_FIELDS.get(model_name)

    try:
        # Only select the important fields
        qs = list(Model.objects.filter(**filters).values(*fields))
    except Exception as e:
        return JsonResponse({"response": f"Query error: {str(e)}"})

    # 2️⃣ Convert results to HTML table
    html = render_html_table(qs)
    return JsonResponse({"response": html})
