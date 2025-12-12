# core/utils.py
import json
import os
from openai import OpenAI

# Read API key from environment
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = (
    "You are a Django admin assistant for a VIP‑EPICS Project Portal.\n"
    "Your job is to convert a natural-language admin request into STRICT JSON.\n\n"
    "Valid models: Student, Project, Faculty.\n"
    "Output format:\n"
    "{\n"
    '  \"model\": \"Student\" | \"Project\" | \"Faculty\",\n'
    '  \"filters\": { ... Django ORM filter dict ... }\n'
    "}\n\n"
    "Examples:\n"
    "- 'show vip students' -> "
    "{\"model\": \"Student\", \"filters\": {\"group_name_iexact\": \"VIP\"}}\n"
    "- 'students of FAC2' -> "
    "{\"model\": \"Student\", \"filters\": {\"faculty_name_iexact\": \"FAC2\"}}\n"
    "- 'projects of EPICS group' -> "
    "{\"model\": \"Project\", \"filters\": {\"group_name_iexact\": \"EPICS\"}}\n\n"
    "Rules:\n"
    "- ALWAYS return ONLY a JSON object, no explanations or text around it.\n"
    "- If you cannot understand, return an empty JSON object: {}."
)


def interpret_prompt(prompt: str) -> dict | None:
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            max_tokens=150,
        )

        content = response.choices[0].message.content.strip()
        print("RAW OPENAI CONTENT:", repr(content))   # DEBUG

        data = json.loads(content)
        if not isinstance(data, dict):
            print("interpret_prompt: not a dict")
            return None
        if "model" not in data or "filters" not in data:
            print("interpret_prompt: missing keys", data)
            return None
        return data
    except Exception as e:
        print("interpret_prompt ERROR:", e)           # DEBUG
        return None

def render_html_table(queryset: list[dict]) -> str:
    """
    Convert queryset (list of dicts produced by .values()) to an HTML table.
    """
    if not queryset:
        return "<p>No results found.</p>"

    headers = queryset[0].keys()
    html = (
        "<table border='1' style='border-collapse:collapse; width:100%; "
        "font-size:13px'>"
    )
    html += "<tr>" + "".join(f"<th>{h}</th>" for h in headers) + "</tr>"

    for row in queryset:
        html += "<tr>" + "".join(f"<td>{row[h]}</td>" for h in headers) + "</tr>"

    html += "</table>"
    return html