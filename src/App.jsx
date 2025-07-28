import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./context/UserProvider";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./Dashboard";
import TryModule from "./Allfiles/TryModule";
// Pages
import Login from "./Login";
import Register from "./Register";
import ChangePasswordCard from "./Allfiles/Changepassword";
import CrudStudents from "./Admin_section/Crudstudents";
import MakeAdmin from "./tanushree/MakeAdmin";
import StudentDetails from "./Allfiles/StudentDetails";
import Mymcq from './Allfiles/Mymcq'
import Mytest from "./Allfiles/Mytest";
import Edinotes from './Allfiles/Editnotes'
import InterviewPrep from "./Allfiles/InterviewPrep";
import Cards from "./cards"; // 👈 import this for index route
import ComplaintCard from "./Allfiles/ComplaintCard";
import Notes from "./Allfiles/Notes";

const AppRoutes = () => {
  const { user } = useUser();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/dashboard" />}
      />

      {/* Protected Layout Route with Nested Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        {/* Nested Routes - rendered inside Dashboard's <Outlet /> */}
        <Route index element={<Cards />} />
        <Route path="changepassword" element={<ChangePasswordCard />} />
        <Route path="students" element={<CrudStudents />} />
        <Route path="updatedetails" element={<StudentDetails />} />
        <Route path="roles" element={<MakeAdmin />} />
        <Route path="complaints" element={<ComplaintCard />} />
        <Route path="interview" element={<InterviewPrep />} />
        <Route path="mcq" element={<Mymcq />} />
        <Route path="test" element={<Mytest />} />
         <Route path="notes" element={<Notes/>} />
         <Route path="editnotes" element={<Edinotes/>} />
            <Route path="testapi" element={<TryModule/>} />
         
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
