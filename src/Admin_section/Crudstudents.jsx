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
      e?.preventDefault(); // 🛑 Stop the refresh if event exists
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
    //update strudent 
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
    
        await fetchStudents();           // Refresh data
        setSelectedStudent(null);        // Close modal
        alert("✅ Student updated successfully!");
      } catch (err) {
        console.error(err);
        alert('Failed to update student');
      }
    };
    //add student 
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
    


  // 🎨 Theme styling
  const styles = theme === 'dark' ? {
    bg: 'bg-gray-900 text-white',
    card: 'bg-gray-800 border border-gray-700',
    input: 'bg-gray-700 text-white border-grey-600',
    icon: 'text-gray-300 hover:text-white',
    th: 'text-white',
    td: 'text-white',
  } : {
    bg: 'bg-gray-100 text-gray-900',
    card: 'bg-white border border-gray-200',
    input: 'bg-white text-gray-900 border-gray-300',
    icon: 'text-gray-700 hover:text-black',
    th: 'text-gray-800',
    td: 'text-gray-900',
  };

  // 🚥 States
  if (isStudentsLoading) return <div className={`${styles.bg} p-6`}>Loading...</div>;
  if (studentsError) return <div className={`${styles.bg} p-6 text-red-600`}>{studentsError}</div>;

  return (
    <div className={`${styles.bg} min-h-screen p-6`}>
      <div className="max-w-5xl mx-auto">
      <div className="mb-6">
  <button
    onClick={() => navigate('/dashboard')}
    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 px-4 py-2 rounded-lg shadow-md"
  >
    <span className="text-lg">⬅</span>
    <span className="font-semibold">Back to Dashboard</span>
  </button>
</div>


        <h1 className="text-2xl font-bold mb-4">Students</h1>

        {/* 🔍 Search Bar */}
     {/* 🔍 Search + Add */}
<div className={`${styles.card} p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center gap-4 justify-between`}>
  <input
    type="text"
    placeholder="Search..."
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
    className={`${styles.input} w-full sm:w-2/3 p-2 rounded-md outline-none focus:ring-2 focus:ring-blue-500 border border-black-600`}
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
  total: null,
  per: null,
  grade: ''
})}

    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
  >
    ➕ Add Student
  </button>
</div>


        {/* 📋 Student Table */}
        <div className={`${styles.card} p-4 rounded-lg overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={`p-3 text-left font-semibold ${styles.th}`}>Name</th>
                <th className={`p-3 text-center font-semibold hidden sm:table-cell ${styles.th}`}>Email</th>
                <th className={`p-3 text-center font-semibold ${styles.th}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => (
                <tr key={s.email} className="border-t border-gray-400/20">
                  <td className={`p-3 text-left ${styles.td}`}>{s.name || 'No Name'}</td>
                  <td className={`p-3 hidden sm:table-cell ${styles.td}`}>{s.email || 'No Email'}</td>
                  <td className={`p-3 text-center space-x-3 ${styles.td}`}>
                    <button onClick={() => setSelectedStudent(s)} className={styles.icon} title="View">👁️</button>
                    <button onClick={() => setSelectedStudent(s)} className={styles.icon} title="Update">✏️</button>

                    <button
  type="button"
  onClick={() => handleDelete(s)}
  className={styles.icon}
  title="Delete"
>
  🗑️
</button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🎯 Student Detail View */}
        {selectedStudent && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className={`${styles.card} p-6 rounded-lg w-full max-w-4xl`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">✏️   Student Profile</h2>
        <button onClick={() => setSelectedStudent(null)} className={styles.icon}>❌</button>
      </div>

      {/* Form for updating */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleUpdateStudent(selectedStudent);
      }}>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar & Name View */}
          <div className="flex flex-col items-center sm:items-start sm:w-1/3 text-center sm:text-left">
            <div className="w-24 h-24 rounded-full bg-gray-400 flex items-center justify-center text-4xl text-white">
              {selectedStudent.name?.charAt(0).toUpperCase() || "👤"}
            </div>
            <h2 className="mt-3 text-lg font-bold">{selectedStudent.name || "Unnamed"}</h2>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-sm">
            {['name', 'email', 'roll', 'marks', 'percentage'].map(key => (
              key !== 'email' ? ( // email optional non-editable
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
                    className={`${styles.input} p-2 rounded-md border`}
                  />
                </label>
              ) : (
                <div key={key} className="flex flex-col">
                  <span className="text-gray-500 capitalize">{key}</span>
                  <span className="font-medium break-all">{selectedStudent[key]}</span>
                </div>
              )
            ))}
            {/* Additional dynamic fields */}
            {Object.entries(selectedStudent)
              .filter(([k]) =>
                !['password','confirmpassword','passwordupdatedat','name','email','role','roll','marks','percentage']
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
                    className={`${styles.input} p-2 rounded-md border`}
                  />
                </label>
              ))}
          </div>
        </div>

        {/* Save / Delete / Cancel */}
        <div className="mt-6 text-right space-x-2">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded">
            Save
          </button>
          <button
            type="button"
            onClick={() => handleDelete(selectedStudent)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setSelectedStudent(null)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
{/* add student  */}
{newStudent && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg w-full max-w-3xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">➕ Add New Student</h2>
        <button onClick={() => setNewStudent(null)} className="text-xl">❌</button>
      </div>

      <form onSubmit={handleAddStudent}>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
    {[
      'name',
      'email',
      'password',
      'role',
      'roll',
      'marks',
      'percentage',
      'total',
      
    ].map((key) => (
      <label key={key} className="flex flex-col">
        <span className="text-gray-500 capitalize">{key}</span>

        {key === 'role' ? (
          <select
            value={newStudent[key] || 'student'}
            onChange={(e) =>
              setNewStudent((prev) => ({
                ...prev,
                [key]: e.target.value,
              }))
            }
            className="p-2 rounded-md border"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        ) : (
          <input
            type={
              ['marks', 'percentage', 'total', 'per'].includes(key)
                ? 'number'
                : key === 'password'
                ? 'password'
                : 'text'
            }
            value={newStudent[key] ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setNewStudent((prev) => ({
                ...prev,
                [key]:
                  ['marks', 'percentage', 'total', 'per'].includes(key) && value !== ''
                    ? Number(value)
                    : value.trim(),
              }));
            }}
            required
            className="p-2 rounded-md border"
          />
        )}
      </label>
    ))}
  </div>

  <div className="mt-6 text-right space-x-2">
    <button
      type="submit"
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded"
    >
      Save
    </button>
    <button
      type="button"
      onClick={() => setNewStudent(null)}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded"
    >
      Cancel
    </button>
  </div>
</form>

    </div>
  </div>
)}





      </div>
    </div>
  );
};

export default CrudStudents;
