import React, { useEffect, useState } from "react";
import "./StudentDashboard.css";
import { useNavigate } from "react-router-dom"; 

export default function StudentDashboard() {
  const [status, setStatus] = useState("Not Applied"); // overall application status
  const [studentInfo, setStudentInfo] = useState(null);
  const [showSelection, setShowSelection] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(""); // will be UUID string
  const [projectNames, setProjectNames] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [facultyDept, setFacultyDept] = useState("");
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem("username");
  const sapid = localStorage.getItem("sapid");
  const fullnameLS = localStorage.getItem("fullname");

  const navigate = useNavigate(); 

  useEffect(() => {
    if (!sapid) {
      setLoading(false);
      return;
    }

    let mounted = true;

    fetch(`http://127.0.0.1:8000/core/student/?sapid=${sapid}`)
      .then(res => {
        return res.json().catch(() => null);
      })
      .then(data => {
        console.log("STUDENT FETCH RESPONSE:", data);
        if (!mounted) return;
        const student = data ? (Array.isArray(data) ? data[0] : data) : null;
        if (student && Object.keys(student).length > 0) {
          setStudentInfo(student);
        } else {
          setStudentInfo({
            fullname: fullnameLS || username || "Student",
            username: username || "",
            sapid: sapid
          });
        }
      })
      .catch(err => {
        console.error("Student fetch error:", err);
        if (mounted) {
          setStudentInfo({
            fullname: fullnameLS || username || "Student",
            username: username || "",
            sapid: sapid
          });
        }
      });

    // 2) Fetch application status (this is the single source of truth for application state)
    fetch(`http://127.0.0.1:8000/core/applications/status/?sapid=${sapid}`)
      .then(res => res.json())
      .then(data => {
        console.log("APPLICATION STATUS RESPONSE:", data);
        if (!mounted) return;
        setStatus(data?.overall_status || "Not Applied");
      })
      .catch(err => {
        console.error("Status fetch error:", err);
        if (mounted) setStatus("Not Applied");
      });

    // 3) Fetch faculties (used for selection)
    fetch("http://127.0.0.1:8000/core/faculties/")
      .then(res => res.json())
      .then(data => {
        console.log("FACULTY LIST RESPONSE:", data);
        if (!mounted) return;
        setFacultyList(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Faculty fetch error:", err);
        if (mounted) setFacultyList([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [sapid, username, fullnameLS]);
  const groupOptions = [...new Set(facultyList.filter(f => f.group && f.group.name).map(f => f.group.name))];

  const filteredFacultyList = facultyList.filter(f => f.group && f.group.name === selectedGroup);

  const handleGroupChange = (e) => {
    const group = e.target.value;
    setSelectedGroup(group);
    setSelectedFaculty("");
    setProjectNames([]);
    setSelectedProjectId("");
    setFacultyDept("");
  };

  const handleFacultyChange = (e) => {
    const facultyId = e.target.value; // keep as string (UUID)
    setSelectedFaculty(facultyId);

    // find faculty by comparing strings (UUIDs are strings)
    const fac = facultyList.find(f => String(f.id) === String(facultyId));
    setFacultyDept(fac ? fac.department : "");
    let projects = [];
    if (fac && fac.projects) {
      if (Array.isArray(fac.projects)) {
        projects = fac.projects;
      } else {
        // single object
        projects = [fac.projects];
      }
    }

    const titles = projects.map(p => p.title);
    setProjectNames(titles);
    setSelectedProjectId(projects.length ? projects[0].id : "");
  };

  const registerClicked = async () => {
    // Block submit if already applied/accepted
    if (status && status !== "Not Applied" && status !== "Not Applied") {
      // status values are 'Not Applied' / 'Pending' / 'Accepted' / 'Rejected'
      if (status === "Pending" || status === "Accepted") {
        alert(`You have already applied (status: ${status}). You cannot apply again.`);
        return;
      }
    }

    if (!selectedFaculty) {
      alert("Select a faculty first!");
      return;
    }
    if (!sapid) {
      alert("SAP ID missing! Please login again.");
      return;
    }

    // group id lookup (backend expects PK of ProjectGroup; it's an integer id in your models)
    const groupObj = facultyList.find(f => f.group && f.group.name === selectedGroup);
    const groupId = groupObj?.group?.id || null;
    const payload = {
      student_sapid: String(sapid),
      faculty: String(selectedFaculty),
      project: selectedProjectId || null,
      group: groupId
    };

    console.log("POST /core/applications/ payload:", payload);

    try {
      const res = await fetch("http://127.0.0.1:8000/core/applications/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("APPLICATION POST RESPONSE:", res.status, data);

      if (!res.ok) {
        // show backend error message if available
        alert(data.detail || "Application failed. See console for details.");
        return;
      }

      alert("Application submitted successfully! Await faculty approval.");
      setStatus("Pending"); // update UI immediately
    } catch (err) {
      console.error("Application submit error:", err);
      alert("Application failed (network). Check console.");
    }
  };

  if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;

  if (!studentInfo) {
    // fallback safe UI
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h1>Welcome</h1>
          <p>Student info not available. Please login again.</p>
        </div>
      </div>
    );
  }

  // If already applied/accepted -> don't allow applying again
  const canApply = status === "Not Applied" || status === "Rejected";

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome, {studentInfo.fullname || username}</h1>

        <div className="status-card">
          <p>Application Status: <span className={`status ${String(status).toLowerCase()}`}>{status}</span></p>
        </div>

        <div className="student-info-card">
          <h2>Student Details</h2>
          <table>
            <tbody>
              <tr><td><strong>SAP ID:</strong></td><td>{sapid}</td></tr>
              <tr><td><strong>Username:</strong></td><td>{studentInfo.username || username}</td></tr>
            </tbody>
          </table>
        </div>

        {!showSelection ? (
          <button className="action-btn" onClick={() => setShowSelection(true)} disabled={!canApply}>
            {canApply ? "Select Project & Faculty" : `Cannot apply (${status})`}
          </button>
        ) : (
          <div className="select-project-card">
            <h2>Select Your Project</h2>
            <form className="register-form" onSubmit={(e)=>e.preventDefault()}>
              <div className="select-row">
                <div className="select-col">
                  <label>Choose Group:</label>
                  <select value={selectedGroup} onChange={handleGroupChange} disabled={!canApply}>
                    <option value="">Select group</option>
                    {groupOptions.map(g => g && <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="select-col">
                  <label>Choose Faculty:</label>
                  <select value={selectedFaculty} onChange={handleFacultyChange} disabled={!selectedGroup || !canApply}>
                    <option value="">Select faculty</option>
                    {filteredFacultyList.map(f => (
                      // value is UUID string
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedFaculty && (
                <div className="info-row">
                  <p><strong>Projects:</strong> {projectNames.length ? projectNames.join(", ") : "No projects available"}</p>
                  <p><strong>Department:</strong> {facultyDept || "—"}</p>
                </div>
              )}

              <button type="button" className="action-btn" onClick={registerClicked} disabled={!canApply}>
                Register
              </button>
            </form>
          </div>
        )}
        <button
          className="action-btn"
          type="button"
          onClick={() => navigate("/submissions")}
          style={{ marginTop: "16px" }}
        >
          Go to Assignment Submissions
        </button>
      </div>
    </div>
  );
}
