import React from "react";
import "./studentlogin.css"; // Use a custom CSS file for styling

export default function StudentLogin() {
  return (
    <div className="login-bg">
      <div className="login-card">
        <h1>Student Login</h1>
        <form className="login-form">
          <div className="input-row">
            <input className="login-inp" type="text" placeholder="Username" required />
            <input className="login-inp" type="password" placeholder="Password" required />
            <button className="login-btn" type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
