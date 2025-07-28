import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserProvider";

const BASE_URL = "https://api-e5q6islzdq-uc.a.run.app";

const MakeAdmin = () => {
  const { email: superEmail } = useUser();
  const [users, setUsers] = useState([]);
  const [superPassword, setSuperPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/students`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        console.error("Fetch error:", data.error);
      }
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetEmail, newRole) => {
    if (!superPassword) {
      alert("Please enter the superadmin password first.");
      return;
    }

    const endpoint = newRole === "admin" ? "/make-admin" : "/make-student";

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
        alert("Role updated ✅");
        fetchUsers();
      } else {
        alert(`❌ Failed: ${data.message}`);
      }
    } catch (err) {
      alert("Something went wrong.");
      console.error(err);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white w-full ">
      <div className="w-full bg-white py-1">
        {/* Sticky Password and Search Inputs */}
        <div className="sticky top-0 bg-white z-10 py-2 px-2 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 mb-2">
            <input
              type="text"
              placeholder="Search by name or email"
              className="border border-gray-300 rounded-md px-3 py-1.5 w-full sm:w-72 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter Superadmin Password"
              className="border border-gray-300 rounded-md px-3 py-1.5 w-full sm:w-72 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              value={superPassword}
              onChange={(e) => setSuperPassword(e.target.value)}
            />
            <button
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-base font-medium shadow-sm"
              onClick={fetchUsers}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* User table */}
        {loading ? (
          <div className="text-center text-gray-600 text-lg">Loading users...</div>
        ) : (
          <div className="w-full ">
            <table className="w-full bg-white border border-gray-200 rounded-lg shadow-lg text-base">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-lg">Name</th>
                  <th className="px-4 py-2 text-left font-bold text-lg">Email</th>
                  <th className="px-4 py-2 text-left font-bold text-lg">Current Role</th>
                  <th className="px-4 py-2 text-center font-bold text-lg">Change Role</th>
                </tr>
              </thead>
              <tbody className="text-left">
                {filteredUsers
                  .filter((u) => u.email !== superEmail)
                  .map((user, idx) => (
                    <tr
                      key={user.email}
                      className="border-t border-gray-200"
                      style={{ animationDelay: `${idx * 0.03}s` }}
                    >
                      <td className="px-4 py-2 text-gray-800">{user.name}</td>
                      <td className="px-4 py-2 text-gray-800">{user.email}</td>
                      <td className="px-4 py-2 text-gray-800 capitalize">{user.Role}</td>
                      <td className="px-4 py-2 text-center">
                        <select
                          value={user.Role}
                          onChange={(e) => handleRoleChange(user.email, e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors duration-200 bg-white shadow-sm"
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeAdmin;