import React, { useEffect, useState } from "react";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const [status, setStatus] = useState("Not Applied"); // overall application status
  const [studentInfo, setStudentInfo] = useState(null);
  const [showSelection, setShowSelection] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState(""); // will be UUID string
  const [selectedProject, setSelectedProject] = useState("");
  const [projectList, setProjectList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [facultyDept, setFacultyDept] = useState("");
  const [deptConstraint, setDeptConstraint] = useState("");
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem("username");
  const sapid = localStorage.getItem("sapid");
  const fullnameLS = localStorage.getItem("fullname");

  useEffect(() => {
    if (!sapid) {
      setLoading(false);
      return;
    }

    let mounted = true;

    fetch(`http://127.0.0.1:8000/core/student/?sapid=${sapid}`)
      .then(res => {
        if (!res.ok) throw new Error('Student not found');
        return res.json();
      })
      .then(data => {
        console.log("STUDENT FETCH RESPONSE:", data);
        if (!mounted) return;
        
        // Handle both array and single object response
        const student = Array.isArray(data) ? data[0] : data;
        
        if (student && student.department) {
          // Successfully got full student data with department
          setStudentInfo(student);
          console.log("Student department:", student.department);
        } else {
          console.warn("Student data missing department field");
          setStudentInfo({
            fullname: fullnameLS || username || "Student",
            username: username || "",
            sapid: sapid,
            department: "" // Add empty department
          });
        }
      })
      .catch(err => {
        console.error("Student fetch error:", err);
        if (mounted) {
          setStudentInfo({
            fullname: fullnameLS || username || "Student",
            username: username || "",
            sapid: sapid,
            department: "" // Add empty department
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

  const handleGroupChange = (e) => {
    const group = e.target.value;
    setSelectedGroup(group);
    setSelectedProject("");
    setSelectedFaculty("");
    setSelectedProjectId("");
    setFacultyDept("");
    setDeptConstraint("");

    // Get student department from studentInfo
    const studentDept = studentInfo?.department;
    
    console.log("🔍 Student Department:", studentDept);
    console.log("🔍 Selected Group:", group);
    console.log("🔍 Full Faculty List:", facultyList);

    if (!studentDept) {
      console.error("❌ Student department not found!");
      alert("Error: Your department information is missing. Please contact admin.");
      setProjectList([]);
      return;
    }

    // Collect all projects from faculties in the selected group
    const allProjects = [];
    
    facultyList.forEach(f => {
      // Check if faculty is in the selected group
      if (!f.group || f.group.name !== group) {
        return;
      }

      console.log(`\n📋 Faculty: ${f.name}`);
      console.log("  Projects data:", f.projects);

      // Handle both single project object and array of projects
      let facultyProjects = [];
      if (f.projects) {
        if (Array.isArray(f.projects)) {
          facultyProjects = f.projects;
        } else {
          facultyProjects = [f.projects];
        }
      }

      console.log("  Normalized projects:", facultyProjects);

      // Filter projects that have slots for student's department
      facultyProjects.forEach(project => {
        console.log(`  \n  Project: ${project.title}`);
        console.log(`    dept_constraint:`, project.dept_constraint);
        
        if (project.dept_constraint && project.dept_constraint[studentDept] !== undefined) {
          const slots = project.dept_constraint[studentDept];
          console.log(`    Slots for ${studentDept}: ${slots}`);
          
          if (slots > 0) {
            console.log(`    ✅ ADDING PROJECT (has ${slots} slots)`);
            allProjects.push(project);
          } else {
            console.log(`    ❌ SKIPPING (no slots available)`);
          }
        } else {
          console.log(`    ❌ SKIPPING (no constraint for ${studentDept})`);
        }
      });
    });

    // Remove duplicates based on project ID
    const uniqueProjects = Array.from(
      new Map(allProjects.map(p => [p.id, p])).values()
    );

    console.log("\n🎯 Final Unique Projects:", uniqueProjects);
    setProjectList(uniqueProjects);
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    setSelectedProjectId(projectId);

    // Find the project
    const project = projectList.find(
      p => String(p.id) === String(projectId)
    );
    setDeptConstraint(project?.description || "");

    // Find faculty associated with this project
    const fac = facultyList.find(
      f => f.projects && String(f.projects.id) === String(projectId)
    );

    if (fac) {
      setSelectedFaculty(fac.id);
      setFacultyDept(fac.department);
    }
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
      alert("Select a project first!");
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
                  <label>Choose Project:</label>
                  <select value={selectedProject} onChange={handleProjectChange} disabled={!selectedGroup || !canApply}>
                    <option value="">Select project</option>
                    {projectList.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedProject && (
                <div className="info-row">
                  <p><strong>Faculty:</strong> {facultyList.find(f => f.id === selectedFaculty)?.name || "—"}</p>
                  <p><strong>Department:</strong> {facultyDept || "—"}</p>
                  <p><strong>Students required:</strong> {deptConstraint}</p>
                </div>
              )}

              <button type="button" className="action-btn" onClick={registerClicked} disabled={!canApply}>
                Register
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}