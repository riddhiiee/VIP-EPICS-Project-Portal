import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleFacultyLogin = () => {
    // open Django admin login directly
    window.location.href = "http://127.0.0.1:8000/admin/";
  };

  return (
    <div className="home-background">
      <div className="home-card">
        <h1 className="portal-title">Design Experiment</h1>
        <div className="portal-btn-group">
          <button className="portal-btn" onClick={() => navigate("/register")}>
            Register as Student
          </button>
          <button className="portal-btn" onClick={() => navigate("/login-student")}>
            Login as Student
          </button>
          <button className="portal-btn" onClick={handleFacultyLogin}>
            Login as Faculty
          </button>
        </div>
      </div>
    </div>
  );
}
