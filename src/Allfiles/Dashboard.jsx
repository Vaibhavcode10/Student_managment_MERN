import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserProvider';

const Dashboard = () => {
  const { user } = useUser();

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4 text-center">Student Dashboard</h1>
          <div className="alert alert-info text-center">
            Welcome back, <strong>{user?.name || 'Student'}</strong>!
          </div>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-key fa-3x text-primary"></i>
              </div>
              <h5 className="card-title">Change Password</h5>
              <p className="card-text">
                Update your account password for better security
              </p>
              <Link to="/changepassword" className="btn btn-primary">
                Change Password
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-user-graduate fa-3x text-success"></i>
              </div>
              <h5 className="card-title">Student Details</h5>
              <p className="card-text">
                View and manage your personal information and academic details
              </p>
              <Link to="/studentdetails" className="btn btn-success">
                View Details
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="fas fa-chart-line fa-3x text-warning"></i>
              </div>
              <h5 className="card-title">Academic Progress</h5>
              <p className="card-text">
                Track your academic performance and progress
              </p>
              <button className="btn btn-warning" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Info</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Student ID:</strong> {user?.studentId || 'Not Available'}</p>
                  <p><strong>Course:</strong> {user?.course || 'Not Available'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Email:</strong> {user?.email || 'Not Available'}</p>
                  <p><strong>Academic Year:</strong> {user?.year || 'Not Available'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;