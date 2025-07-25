import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserProvider";

const BASE_URL = "https://api-e5q6islzdq-uc.a.run.app";

const MakeAdmin = () => {
  const { email: superEmail } = useUser();
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/students`);
      const data = await res.json();

      if (res.ok) {
        setStudents(data.filter((u) => u.Role === "student"));
        setAdmins(data.filter((u) => u.Role === "admin"));
      } else {
        console.error("Error fetching users:", data.error);
      }
    } catch (err) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCheckboxClick = async (targetEmail, currentRole) => {
    const superPassword = prompt("Enter Superadmin Password:");
    if (!superPassword) return;

    const endpoint = currentRole === "student" ? "/make-admin" : "/make-student";

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          superEmail,
          superPassword,
          email: targetEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          currentRole === "student"
            ? "User promoted to Admin ✅"
            : "User demoted to Student ✅"
        );
        fetchUsers(); // Refresh the lists
      } else {
        alert(`❌ Failed: ${data.message}`);
      }
    } catch (err) {
      alert("Something went wrong.");
      console.error(err);
    }
  };

  const renderTable = (title, list, role) => (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">{title}</h5>
      </div>
      <div className="card-body">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Toggle Role</th>
            </tr>
          </thead>
          <tbody>
            {list.map((user) => (
              <tr key={user.email}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.Role}</td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={role === "admin"}
                    onChange={() => handleCheckboxClick(user.email, role)}
                    disabled={user.email === superEmail} // Prevent toggling self
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Manage Admin Access</h2>
      {loading ? (
        <div className="text-center">Loading users...</div>
      ) : (
        <>
          {renderTable("👨‍🎓 Student Users", students, "student")}
          {renderTable("👩‍💼 Admin Users", admins, "admin")}
        </>
      )}
    </div>
  );
};

export default MakeAdmin;