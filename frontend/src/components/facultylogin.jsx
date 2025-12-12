import React, { useState } from "react";
import axios from "axios";

export default function FacultyLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post(
        "http://127.0.0.1:8000/core/faculty-login/",   // Django view URL
        { username, password },
        { withCredentials: true }                      // keep Django session cookie
      );
      // after successful login, open Django (admin or faculty dashboard)
      window.location.href = "http://127.0.0.1:8000/admin/";
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="container">
      <h2>Faculty Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
