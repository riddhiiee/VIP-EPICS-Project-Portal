import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import RegisterForm from "./components/register";
import StudentLogin from "./components/studentlogin"; // Make this new component
import StudentDashboard from "./components/StudentDashboard";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login-student" element={<StudentLogin />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/submissions" element={<Dashboard />} />

      </Routes>
    </Router>
  );
}

export default App;
