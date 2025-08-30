import React, { useState, useMemo } from 'react';
import { useUser } from '../context/UserProvider';
import { useNavigate } from 'react-router-dom';

const CrudStudents = () => {
  const { students, isStudentsLoading, studentsError, fetchStudents, theme } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState(null);
  const navigate = useNavigate();

  // 🧠 Filter students by name/email
  const filteredStudents = useMemo(() =>
    students.filter(s =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [students, searchTerm]);

  const handleDelete = async (s, e) => {
    e?.preventDefault();
    const email = s.email;

    if (!email || typeof email !== 'string') {
      return alert("Invalid email, cannot delete student.");
    }

    try {
      const res = await fetch(`https://api-e5q6islzdq-uc.a.run.app/student/${email}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error("Delete failed");

      await fetchStudents();
      setSelectedStudent(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete student');
    }
  };

  const handleUpdateStudent = async (updatedStudent) => {
    const email = updatedStudent.email;
    if (!email) return alert("Missing email, can't update student.");

    try {
      const res = await fetch(`https://api-e5q6islzdq-uc.a.run.app/student/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent),
      });
      if (!res.ok) throw new Error("Update failed");

      await fetchStudents();
      setSelectedStudent(null);
      alert("✅ Student updated successfully!");
    } catch (err) {
      console.error(err);
      alert('Failed to update student');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();

    const requiredFields = ['name', 'email', 'password', 'role', 'roll', 'marks', 'percentage', 'grade'];

    for (const field of requiredFields) {
      if (!newStudent?.[field]) {
        return alert(`Missing required field: ${field}`);
      }
    }

    try {
      const res = await fetch('https://api-e5q6islzdq-uc.a.run.app/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });

      if (!res.ok) throw new Error('Failed to add student');
      alert("✅ Student added successfully!");
      setNewStudent(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("❌ Error adding student.");
    }
  };

  // 🎨 Theme styling with Tailwind
  const styles = theme === 'dark' ? {
    bg: 'bg-white text-white',
    card: 'bg-gray-800 border border-gray-700',
    input: 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500',
    icon: 'text-gray-300 hover:text-white',
    th: 'text-white',
    td: 'text-white',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    error: 'text-red-400',
  } : {
    bg: 'bg-gray-100 text-gray-900',
    card: 'bg-white border border-gray-200',
    input: 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500',
    icon: 'text-gray-700 hover:text-black',
    th: 'text-gray-800',
    td: 'text-gray-900',
    button: 'bg-blue-500 hover:bg-blue-600 text-white',
    error: 'text-red-600',
  };

  // 🚥 States
  if (isStudentsLoading) return <div className={`${styles.bg} w-full h-screen flex items-center justify-center`}>Loading...</div>;
  if (studentsError) return <div className={`${styles.bg} w-full h-screen flex items-center justify-center ${styles.error}`}>{studentsError}</div>;

  return (
 <>
    <div className={`${styles.bg} w-full min-h-screen flex flex-col`}>
      <div className="w-full max-w-9xl mx-auto flex-grow p-1">
        {/* Back Button */}
        
 

        {/* 🔍 Search + Add */}
        <div className={`${styles.card} p-4 rounded-lg mb-1 flex flex-col sm:flex-row items-center gap-1 `}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`${styles.input} w-full sm:w-2/3 p-2 rounded-md outline-none border transition-all duration-200`}
          />
          <button
            onClick={() => setNewStudent({
              name: '',
              email: '',
              password: '',
              role: 'student',
              roll: '',
              marks: 0,
              percentage: 0,
              grade: ''
            })}
            className={`${styles.button} px-4 py-2 rounded-lg shadow transition-all duration-200`}
          >
            ➕ Add Student
          </button>
        </div>

        {/* 📋 Table + Detail View */}
        <div className={`grid grid-cols-1 ${selectedStudent ? 'lg:grid-cols-2' : ''} gap-1`}>
          {/* 👥 Student Table */}
          <div className="col-span-1">
            <div className={`${styles.card} rounded-lg overflow-x-auto`}>
              <table className="w-full text-sm   ">
                <thead>
                  <tr>
                    <th className={`p-3 text-left font-semibold ${styles.th}`}>Name</th>
                    <th className={`p-3 text-center font-semibold hidden sm:table-cell ${styles.th}`}>Email</th>
                    <th className={`p-3 text-center font-semibold ${styles.th}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.email} className="border-t border-gray-400/20">
                      <td className={`p-3 text-left ${styles.td}`}>{s.name || 'No Name'}</td>
                      <td className={`p-3 hidden sm:table-cell text-center ${styles.td}`}>{s.email || 'No Email'}</td>
                      <td className={`p-3 text-center space-x-3 ${styles.td}`}>
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className={`${styles.icon} transition-all duration-200 btn btn-primary`}
                          title="Select"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s)}
                          className={`${styles.icon} transition-all duration-200 btn btn-danger `}
                          title="Delete"
                        >
                          Delet
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 🎯 Student Detail View (as side panel) */}
          {selectedStudent && (
            <div className="col-span-1">
              <div className={`${styles.card} p-6 rounded-lg`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">✏️ Student Profile</h2>
                  <button onClick={() => setSelectedStudent(null)} className={styles.icon}>❌</button>
                </div>

                <div onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateStudent(selectedStudent);
                }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {['name', 'email', 'roll', 'marks', 'percentage'].map(key => (
                      key !== 'email' ? (
                        <label key={key} className="flex flex-col">
                          <span className="text-gray-500 capitalize">{key}</span>
                          <input
                            type={key === 'marks' || key === 'percentage' ? 'number' : 'text'}
                            value={selectedStudent[key] || ''}
                            onChange={e => setSelectedStudent(prev => ({
                              ...prev,
                              [key]: key === 'marks' || key === 'percentage'
                                ? Number(e.target.value)
                                : e.target.value
                            }))}
                            className={`${styles.input} p-2 rounded-md border transition-all duration-200`}
                          />
                        </label>
                      ) : (
                        <div key={key} className="flex flex-col">
                          <span className="text-gray-500 capitalize">{key}</span>
                          <span className="font-medium break-all">{selectedStudent[key]}</span>
                        </div>
                      )
                    ))}

                    {/* Render other unknown fields dynamically */}
                    {Object.entries(selectedStudent)
                      .filter(([k]) =>
                        !['password', 'confirmpassword', 'passwordupdatedat', 'name', 'email', 'role', 'roll', 'marks', 'percentage']
                          .includes(k.toLowerCase())
                      )
                      .map(([key, value]) => (
                        <label key={key} className="flex flex-col">
                          <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <input
                            type="text"
                            value={typeof value === 'object' ? JSON.stringify(value) : value || ''}
                            onChange={e => setSelectedStudent(prev => ({
                              ...prev,
                              [key]: e.target.value
                            }))}
                            className={`${styles.input} p-2 rounded-md border transition-all duration-200`}
                          />
                        </label>
                      ))}
                  </div>

                  <div className="mt-6 text-right space-x-2">
                    <button
                      onClick={() => handleUpdateStudent(selectedStudent)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded transition-all duration-200"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedStudent)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded transition-all duration-200"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className={`${styles.button} px-4 py-1.5 rounded transition-all duration-200`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🎯 Add Student Form */}
        {newStudent && (
          <div className={`${styles.card} p-6 rounded-lg mt-4`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">➕ Add New Student</h2>
              <button onClick={() => setNewStudent(null)} className={styles.icon}>❌</button>
            </div>

            <div onSubmit={handleAddStudent}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {['name', 'email', 'password', 'roll', 'marks', 'percentage', 'grade'].map(key => (
                  <label key={key} className="flex flex-col">
                    <span className="text-gray-500 capitalize">{key}</span>
                    <input
                      type={key === 'marks' || key === 'percentage' ? 'number' : 'text'}
                      value={newStudent[key] || ''}
                      onChange={e => setNewStudent(prev => ({
                        ...prev,
                        [key]: key === 'marks' || key === 'percentage'
                          ? Number(e.target.value)
                          : e.target.value
                      }))}
                      className={`${styles.input} p-2 rounded-md border transition-all duration-200`}
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 text-right space-x-2">
                <button
                  onClick={handleAddStudent}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded transition-all duration-200"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setNewStudent(null)}
                  className={`${styles.button} px-4 py-1.5 rounded transition-all duration-200`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div></>
  );
};

export default CrudStudents;