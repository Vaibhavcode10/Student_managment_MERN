import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserProvider';

const StudentDetails = () => {
  const { user, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [fullData, setFullData] = useState(user || {});

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await fetch(`https://api-e5q6islzdq-uc.a.run.app/student/${user.email}`);
        const data = await res.json();
        if (res.ok) {
          setFullData(data);
          setEditedUser({
            name: data.name || '',
            email: data.email || '',
          });
        } else {
          console.error('Error fetching student:', data.error);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    if (user?.email) fetchStudentData();
  }, [user]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({
      name: user?.name || '',
      email: user?.email || '',
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`https://api-e5q6islzdq-uc.a.run.app/student/${user.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Profile updated successfully ✅');
        const updatedUser = { ...user, ...editedUser };
        setUser(updatedUser);
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
      } else {
        alert(data.error || 'Update failed ❌');
      }
    } catch (error) {
      alert('Server error ❌');
      console.error('Update error:', error);
    }
    setUser(prev => ({ ...prev, ...editedUser }));
    setFullData(prev => ({ ...prev, ...editedUser }));
  };

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center text-left w-full">
      <div className="w-full bg-white p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 "></h2>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center text-gray-500 text-2xl font-bold">
            {editedUser.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="mt-3 text-xl font-medium text-gray-800">{editedUser.name}</h3>
          <p className="text-gray-500 text-sm">Role: {user?.Role || 'Student'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', name: 'name' },
            { label: 'Email Address', name: 'email' },
            { label: 'Password', name: 'password' },
            { label: 'Roll No', name: 'roll' },
            { label: 'Marks', name: 'marks' },
            { label: 'Percentage', name: 'percentage' },
            { label: 'Total', name: 'total' },
            { label: 'Per', name: 'per' },
            { label: 'Grade', name: 'grade' },
          ].map((field, idx) => (
            <div key={idx} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {isEditing && (field.name === 'name' || field.name === 'email') ? (
                <input
                  type="text"
                  name={field.name}
                  value={editedUser[field.name] || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                />
              ) : (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-md px-3 py-2">
                  {fullData[field.name] || 'Not Available'}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;