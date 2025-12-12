import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css"; // Use a separate CSS file for styles

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-background">
      <div className="home-card">
        {/* Optional: Add your portal's logo */}
        <h1 className="portal-title">VIP-EPICS Project Portal</h1>
        <div className="portal-btn-group">
          <button className="portal-btn" onClick={() => navigate("/register")}>
            Register as Student
          </button>
          <button className="portal-btn" onClick={() => navigate("/login-student")}>
            Login as Student
          </button>
          <button className="portal-btn" onClick={() => navigate("/login-faculty")}>
            Login as Faculty
          </button>
        </div>
      </div>
    </div>
  );
}
