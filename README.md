# College Project Registration Portal

## Project Overview
This project is a full-stack web application developed to manage college project registrations. It allows students to register for different project categories such as VIP and EPICS through a simple and user-friendly interface. The application follows a RESTful architecture using Django REST Framework (DRF) for backend APIs and React.js for the frontend. Data is stored using SQLite.

## Features
- Student registration for academic projects
- Multiple project categories (VIP, EPICS, etc.)
- Form-based project submission
- REST API based frontend and backend communication
- Modular and scalable architecture
- Easy local development setup

## Tech Stack
- **Frontend:** React.js, HTML5, CSS3, JavaScript, Axios / Fetch API  
- **Backend:** Django, Django REST Framework (DRF)  
- **Database:** SQLite  

## System Architecture
The React frontend handles user interaction and form submission. The Django backend exposes RESTful APIs using Django REST Framework, which validates and processes incoming data. The SQLite database stores student and project registration details. Frontend and backend communicate using JSON over HTTP.

## API Integration
REST APIs are created using Django REST Framework and consumed by the React frontend for submitting registration forms and storing student and project details in the database.

## Installation and Setup
Clone the repository and navigate into the project directory:

```bash
git clone https://github.com/riddhiiee/VIP-EPICS-Project-Portal.git
cd VIP-EPICS-Project-Portal
````

### Set up and run the Django backend

```bash
cd backend
python -m venv venv
# On Linux/macOS
source venv/bin/activate
# On Windows
venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Set up and run the React frontend

```bash
cd frontend
npm install
npm start
```

## Usage

Start the Django backend server, then start the React frontend. Open the application in a web browser where students can register for available project categories. All submitted data is stored securely in the SQLite database.

## Database Design

The SQLite database stores student information, project category details, and registration records required for the portal.

## Key Learnings

This project provides hands-on experience in:

* Full-stack development using Django and React
* Building REST APIs with Django REST Framework
* Integrating frontend and backend systems
* Managing databases using SQLite
* Developing scalable academic web applications

## Future Enhancements

Future improvements include:

* Adding user authentication and authorization
* Admin and faculty dashboards
* Project approval workflows
* Migrating to PostgreSQL or MySQL
* Deploying the application on the cloud

```

