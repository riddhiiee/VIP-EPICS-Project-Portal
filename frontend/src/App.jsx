import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import RegisterForm from "./components/register";
import StudentLogin from "./components/studentlogin"; // Make this new component
import FacultyLogin from "./components/facultylogin"; // Make this new component
import StudentDashboard from "./components/StudentDashboard";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login-student" element={<StudentLogin />} />
        <Route path="/login-faculty" element={<FacultyLogin />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
