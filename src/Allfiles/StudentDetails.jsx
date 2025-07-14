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

  // ✅ Sync editedUser when user changes
  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const [fullData, setFullData] = useState(user || {}); // full student info

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
        setUser(updatedUser); // ✅ Update context
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false); // ✅ Hide Save/Cancel
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
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Student Profile</h4>
              {!isEditing ? (
                <button className="btn btn-primary btn-sm" onClick={handleEdit}>
                  <i className="fas fa-edit"></i> Edit
                </button>
              ) : (
                <div>
                  <button className="btn btn-success btn-sm me-2" onClick={handleSave}>
                    <i className="fas fa-save"></i> Save
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="card-body">
              <div className="mb-3 text-center">
                <i className="fas fa-user-circle fa-5x text-muted"></i>
                <h5 className="mt-2">{editedUser.name}</h5>
                <p className="text-muted">Role: {user?.Role || 'Student'}</p>
              </div>

              <div className="row">
  {[
    { label: 'Full Name', name: 'name' },
    { label: 'Email Address', name: 'email' },
    { label: 'Password', name: 'password' },
    { label: 'Roll No', name: 'roll' },
    { label: 'Marks', name: 'marks' },
    { label: 'Percentage', name: 'percentage' },
    { label: 'Total', name: 'total' },
    { label: 'Per', name: 'per' },
    { label: 'Grade', name: 'grade' }
  ].map((field, idx) => (
    <div className="col-md-6 mb-3" key={idx}>
      <label className="form-label"><strong>{field.label}</strong></label>
      {isEditing && (field.name === 'name' || field.name === 'email') ? (
        <input
          type="text"
          className="form-control"
          name={field.name}
          value={editedUser[field.name] || ''}
          onChange={handleChange}
        />
      ) : (
        <p className="form-control-plaintext">
          {fullData[field.name] || 'Not Available'}
        </p>
      )}
    </div>
  ))}
</div>
       <div className="mt-4 text-center">
                <Link to="/" className="btn btn-secondary">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
