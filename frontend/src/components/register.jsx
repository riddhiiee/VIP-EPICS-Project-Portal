import React, { useState } from "react";
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

  function handleChange(event) {
    setFormData({...formData, [event.target.name]:event.target.value})
  }

  function handleSubmit(event){
    event.preventDefault();
    if (!formData.username || !formData.fullname || !formData.email || !formData.sapid
      || !formData.password || !formData.confirmPassword || !formData.degree
      || !formData.department || !formData.division || !formData.year
      || !formData.semester || !formData.campus) {
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
  }

  return (
    <div className="container">
      
      <h2>Student Registration</h2>
          {!registered ? (
      <form className="register-form" onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required></input>
        <input name="fullname" placeholder="Fullname" value={formData.fullname} onChange={handleChange} required></input>
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required></input>
        <input name="sapid" placeholder="SAP ID" maxLength={11} value={formData.sapid} onChange={handleChange} required></input>
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required></input>
        <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required></input>

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

        <input name="semester" placeholder="Semester" value={formData.semester} onChange={handleChange} required></input>
        <input name="division" placeholder="Division" value={formData.division} onChange={handleChange} required></input>
        <input name="year" placeholder="Year" value={formData.year} onChange={handleChange} required></input>
        <select name="campus" value={formData.campus} onChange={handleChange} required>
          <option value="">Campus</option>
          <option>Mumbai</option>
          <option>Shirpur</option>
          <option>Indore</option>
          <option>Hyderabad</option>
        </select>

        <button type="submit" style={{ cursor: "pointer"}}>SUBMIT</button>
        {error && <div className="error">{error}</div>}
      </form>
      ):(
        <div className="success">
        <p>Registration Successful!</p> 
        </div>
      )}
      <p style={{ textAlign: "center", marginTop: "15px" }}>Already have an account? <a href="#">Login</a></p>
      
    </div>
  )
}

