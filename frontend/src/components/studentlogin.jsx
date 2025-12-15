import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./studentlogin.css";

export default function StudentLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [sapid, setSapid] = useState(""); // Added SAP ID input
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password || !sapid) {
      setError("Fill all fields including SAP ID");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/core/student-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, sapid }),
      });

      const data = await res.json();
      if (!res.ok) throw data;

      // Store locally
      localStorage.setItem("username", data.username);
      localStorage.setItem("sapid", sapid); // 🔹 store SAP ID
      localStorage.setItem("fullname", data.fullname);

      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      setError(err.detail || "Login failed");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h1>Student Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-row">
            <input
              className="login-inp"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className="login-inp"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              className="login-inp"
              type="text"
              placeholder="SAP ID"
              value={sapid}
              maxLength={11}
              onChange={(e) => setSapid(e.target.value)}
              required
            />
            <button className="login-btn" type="submit">
              Login
            </button>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
