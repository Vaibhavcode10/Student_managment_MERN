import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserProvider';

const StudentDetails = () => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    studentId: user?.studentId || '',
    course: user?.course || '',
    year: user?.year || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({
      name: user?.name || '',
      email: user?.email || '',
      studentId: user?.studentId || '',
      course: user?.course || '',
      year: user?.year || ''
    });
  };

  const handleSave = () => {
    // Here you would typically update the user data via API
    console.log('Saving user data:', editedUser);
    setIsEditing(false);
    // You can add API call here to update user details
  };

  const handleChange = (e) => {
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Student Details</h4>
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
              <div className="row">
                <div className="col-md-4 text-center mb-3">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                       style={{width: '120px', height: '120px'}}>
                    <i className="fas fa-user fa-4x text-muted"></i>
                  </div>
                  <h5 className="mt-2">{user?.name || 'Student Name'}</h5>
                  <p className="text-muted">Student ID: {user?.studentId || 'N/A'}</p>
                </div>
                <div className="col-md-8">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label"><strong>Full Name</strong></label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={editedUser.name}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="form-control-plaintext">{user?.name || 'Not Available'}</p>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label"><strong>Email Address</strong></label>
                      {isEditing ? (
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={editedUser.email}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="form-control-plaintext">{user?.email || 'Not Available'}</p>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label"><strong>Student ID</strong></label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="studentId"
                          value={editedUser.studentId}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="form-control-plaintext">{user?.studentId || 'Not Available'}</p>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label"><strong>Course</strong></label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="course"
                          value={editedUser.course}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="form-control-plaintext">{user?.course || 'Not Available'}</p>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label"><strong>Academic Year</strong></label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="year"
                          value={editedUser.year}
                          onChange={handleChange}
                        />
                      ) : (
                        <p className="form-control-plaintext">{user?.year || 'Not Available'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              <div className="row">
                <div className="col-12">
                  <h6><strong>Additional Information</strong></h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Enrollment Status:</strong> <span className="badge bg-success">Active</span></p>
                      <p><strong>Registration Date:</strong> September 2023</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Academic Advisor:</strong> Dr. Smith</p>
                      <p><strong>Campus:</strong> Main Campus</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center">
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