import React, { useState, useEffect } from "react";
import "../App.css";
import { Eye, EyeOff } from 'lucide-react';
export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    sapid: "",
    password: "",
    confirmPassword: "",
    degree: "",
    department: "",
    division: "",
    year: "",
    semester: "",
    campus: "",
    group: "",       
    faculty: "",     
    project: ""
  });

  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [projectNames, setProjectNames] = useState([]);
  const [facultyDept, setFacultyDept] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projectList, setProjectList] = useState([]);
  const [deptConstraint, setDeptConstraint] = useState("");
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // Fetch faculty from API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/core/faculties/") // Django GET endpoint
      .then((response) => response.json())
      .then((data) => setFacultyList(data))
      .catch((error) => console.error("Error fetching faculty list:", error));
  }, []);

// added
// useEffect(() => {
//   if (formData.department && registered) {
//     fetch(`http://127.0.0.1:8000/core/projects/?department=${formData.department}`)
//       .then((response) => response.json())
//       .then((data) => setProjectList(data))
//       .catch((error) => console.error("Error fetching projects:", error));
//   }
// }, [formData.department, registered]);

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

   const passwordValidations = {
  minLength: formData.password.length >= 8,
  hasUpperCase: /[A-Z]/.test(formData.password),
  hasLowerCase: /[a-z]/.test(formData.password),
  hasNumber: /\d/.test(formData.password),
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
};

const allPasswordValid = Object.values(passwordValidations).every(Boolean);

  function handleSubmit(event) {
    event.preventDefault();
    if (
      !formData.username || !formData.fullname || !formData.email || !formData.sapid || !formData.password ||
      !formData.confirmPassword || !formData.degree || !formData.department || !formData.division ||
      !formData.year || !formData.semester || !formData.campus
    ) {
      setError("Fill all fields!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (!/^\d{11}$/.test(formData.sapid)) {
      setError("SAP ID must be 11 digits.");
      return;
    }
    if (!allPasswordValid) {
      setError("Password must be 8+ chars with uppercase, lowercase, number & special char!");
      return; 
    }
    setError("");
    const payload = { ...formData };
    delete payload.confirmPassword;

    fetch("http://127.0.0.1:8000/core/student/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => console.log("Saved:", data))
      .catch(err => console.error(err));
    setRegistered(true);
  }

  // changed
function handleGroupChange(event) {
  const group = event.target.value;
  setSelectedGroup(group);
  setSelectedProject("");
  setSelectedFaculty("");
  setFacultyDept("");

  const studentDept = formData.department;

  const projects = facultyList
    .filter(
      f =>
        f.group &&
        f.group.name === group &&
        f.projects &&
        f.projects.dept_constraint &&
        f.projects.dept_constraint[studentDept] > 0
    )
    .map(f => f.projects);

  const uniqueProjects = Array.from(
    new Map(projects.map(p => [p.id, p])).values()
  );

  setProjectList(uniqueProjects);
}



// removed this
// function handleFacultyChange(event) 

function handleProjectChange(event) {
  const projectId = event.target.value;
  setSelectedProject(projectId);

  const project = projectList.find(
    p => String(p.id) === String(projectId)
  );
  setDeptConstraint(project?.description || "");

  const fac = facultyList.find(
    f => f.projects && String(f.projects.id) === String(projectId)
  );

  if (fac) {
    setSelectedFaculty(fac.id);
    setFacultyDept(fac.department);
    setFormData(prev => ({
      ...prev,
      faculty: fac.id,
      project: projectId
    }));
  }
}


function registerClicked() {
  if (!formData.sapid) {
    alert("SAP ID missing! Fill the form first.");
    return;
  }

  const groupId = facultyList.find(f => f.group && f.group.name === selectedGroup)?.group?.id || null;

  fetch("http://127.0.0.1:8000/core/applications/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_sapid: formData.sapid,
      faculty: selectedFaculty,
      project: formData.project,
      group: groupId
    }),
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw data;
      console.log("Application submitted:", data);
      alert("Application submitted successfully! Await faculty approval.");
    })
    .catch(err => {
      console.error(err);
      alert(err.detail || "Application failed. Check console.");
    });
}

const filteredFacultyList = facultyList.filter(f => f.group && f.group.name === selectedGroup);

  return (
    <div className="container">
      <h2>Student Registration</h2>
      {!registered ? (
        <form className="register-form" onSubmit={handleSubmit}>
          <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <input name="fullname" placeholder="Fullname" value={formData.fullname} onChange={handleChange} required />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input name="sapid" placeholder="SAP ID" maxLength={11} value={formData.sapid} onChange={handleChange} required />
          <div className="password-input-wrapper">
            <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={formData.password} onChange={handleChange} required />
            <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <div className="password-input-wrapper">
            <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
            <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <select name="degree" value={formData.degree} onChange={handleChange} required>
            <option value="">Degree</option>
            <option>BTI</option>
            <option>BTech</option>
            <option>MBA Tech</option>
          </select>
          <select name="department" value={formData.department} onChange={handleChange} required>
            <option value="">Department</option>
            <option>DS</option>
            <option>IT</option>
            <option>Mech</option>
            <option>CS</option>
            <option>EXTC</option>
          </select>
          <input name="semester" placeholder="Semester" value={formData.semester} onChange={handleChange} required />
          <input name="division" placeholder="Division" value={formData.division} onChange={handleChange} required />
          <input name="year" placeholder="Year" value={formData.year} onChange={handleChange} required />
          <select name="campus" value={formData.campus} onChange={handleChange} required>
            <option value="">Campus</option>
            <option>Mumbai</option>
            <option>Shirpur</option>
            <option>Indore</option>
            <option>Hyderabad</option>
          </select>
          <button type="submit" style={{ cursor: "pointer" }}>SUBMIT</button>
          {error && <div className="error">{error}</div>}
        </form>
      ) : (
        <div>
          <h2>Select Your Project</h2>
          <form className="register-form">
            <div className="select-row">
              <div className="select-col">
                <label>Choose Group:</label>
                <select value={selectedGroup} onChange={handleGroupChange}>
                  <option value="">Select group</option>
                  {[...new Set(facultyList.map(f => f.group && f.group.name))].map(
                    group => group && <option key={group} value={group}>{group}</option>
                  )}
                </select>
              </div>

              <div className="select-col">
                <label>Choose Project:</label>
                <select value={selectedProject} onChange={handleProjectChange} disabled={!selectedGroup}>
                  <option value="">Select project</option>
                  {projectList.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>


            {selectedProject && (
              <div className="info-row">
                <div><strong>Faculty:</strong> {facultyList.find(f => f.id === selectedFaculty)?.name}</div>
                <div><strong>Department:</strong> {facultyDept}</div>
                <div><strong>Students required:</strong> {deptConstraint}</div>
                {/* <div><strong>Slots available for {formData.department}:</strong> {
  projectList.find(p => String(p.id) === String(selectedProject))
    ?.dept_constraints?.[formData.department] || 0
}</div> */}
              </div>
            )}

            <button type="button" onClick={registerClicked}>Register</button>
          </form>
        </div>
      )}
    </div>
  );
}
