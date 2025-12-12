import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from 'lucide-react';
import "../App.css";

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
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch faculty from API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/core/faculties/") // Django GET endpoint
      .then((response) => response.json())
      .then((data) => setFacultyList(data))
      .catch((error) => console.error("Error fetching faculty list:", error));
  }, []);

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

function handleGroupChange(event) {
  const group = event.target.value;
  setSelectedGroup(group);
  setSelectedFaculty("");
  setProjectNames([]);
  setFacultyDept("");
  setFormData(prev => ({ ...prev, group }));
}

function handleFacultyChange(event) {
  const facultyId = event.target.value;
  setSelectedFaculty(facultyId);
  setFormData(prev => ({ ...prev, faculty: facultyId }));
  const fac = facultyList.find(f => String(f.id) === String(facultyId) && f.group && f.group.name === selectedGroup);
  setFacultyDept(fac ? fac.department : "");

  const projects = fac && fac.projects ? [{ id: fac.projects.id, title: fac.projects.title }] : [];
  setProjectNames(projects.map(p => p.title));

  setFormData(prev => ({ ...prev, project: projects.length ? projects[0].id : "" }));
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
                {[...new Set(facultyList.map(f => f.group && f.group.name))].map(group => (
                  group && <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div className="select-col">
              <label>Choose Faculty:</label>
              <select value={selectedFaculty} onChange={handleFacultyChange} disabled={!selectedGroup}>
                  <option value="">Select faculty</option>
                  {filteredFacultyList.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                  ))}
              </select>

            </div>
          </div>

            {selectedFaculty && (
              <div className="info-row">
                <div><strong>Projects:</strong> {projectNames.join(", ")}</div>
                <div><strong>Department:</strong> {facultyDept}</div>
              </div>
            )}

            <button type="button" onClick={registerClicked}>Register</button>
          </form>
        </div>
      )}

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Already have an account? <a href="#">Login</a>
      </p>
    </div>
  );
}

