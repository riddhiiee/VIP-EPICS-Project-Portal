import React, { useState, useEffect } from "react";
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
    campus: ""
  });

  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [projectName, setProjectName] = useState("");
  const [facultyDept, setFacultyDept] = useState("");

  // Dummy group list, replace later with backend values if needed
  const groupOptions = ["VIP", "EPICS", "Group3", "Group4", "Group5"];

  // Fetch faculty from API (simulated for now)
  useEffect(() => {
    // Example fetch:
    // axios.get("/core/faculties/").then(res => setFacultyList(res.data));
    // For now use dummy data
    setFacultyList([
      { id: 1, name: "ABC", department: "CS", group: "VIP", project: "VIP AI" },
      { id: 2, name: "XYZ", department: "IT", group: "EPICS", project: "EPICS Health" }
      // More dummy or fetched objects...
    ]);
  }, []);

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (
      !formData.username ||  !formData.fullname ||  !formData.email ||  !formData.sapid ||  !formData.password ||
      !formData.confirmPassword ||  !formData.degree ||  !formData.department ||  !formData.division ||
      !formData.year ||  !formData.semester ||  !formData.campus
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
    setError("");
    setRegistered(true);
  }

  // Filter faculties by selected group (for dropdown)
  const filteredFacultyList = facultyList.filter(fac =>
    fac.group === selectedGroup
  );

  function handleGroupChange(event) {
    setSelectedGroup(event.target.value);
    setSelectedFaculty("");
    setProjectName("");
    setFacultyDept("");
  }
  function handleFacultyChange(event) {
    setSelectedFaculty(event.target.value);
    const fac = facultyList.find(f => f.name === event.target.value && f.group === selectedGroup);
    setProjectName(fac ? fac.project : "");
    setFacultyDept(fac ? fac.department : "");
  }
  function registerClicked() {
    alert("Registered!");
  }

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
  

  return (
    <div className="container">
      <h2>Student Registration</h2>
      {!registered ? (
        <form className="register-form" onSubmit={handleSubmit}>
          <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <input name="fullname" placeholder="Fullname" value={formData.fullname} onChange={handleChange} required />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input name="sapid" placeholder="SAP ID" maxLength={11} value={formData.sapid} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
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
                <label>Choose a Project Group:</label>
                <select value={selectedGroup} onChange={handleGroupChange}>
                  <option value="">Select group</option>
                  {groupOptions.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              <div className="select-col">
                <label>Choose Faculty:</label>
                <select value={selectedFaculty} onChange={handleFacultyChange} disabled={!selectedGroup}>
                  <option value="">Select faculty</option>
                  {filteredFacultyList.map(faculty => (
                    <option key={faculty.id} value={faculty.name}>{faculty.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {selectedFaculty && (
              <div className="info-row">
                <div><strong>Project:</strong> {projectName}</div>
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