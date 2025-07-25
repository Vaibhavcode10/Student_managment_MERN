import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from '../context/UserProvider';
import Dashboard from './trial/Dashboard';
import ChangePassword from './trial/ChangePassword';
import StudentDetails from './trial/StudentDetails';
import NotFound from "./pages/NotFound";
import 'bootstrap/dist/css/bootstrap.min.css';
import MakeAdmin from '../tanushree/MakeAdmin';

const queryClient = new QueryClient();

const Appcomp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
        
          <div className="min-vh-100 bg-light">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/changepassword" element={<ChangePassword />} />
              <Route path="/studentdetails" element={<StudentDetails />} />
              <Route path="/admin" element={<MakeAdmin/>}/>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        
    
    </TooltipProvider>
  </QueryClientProvider>
);

export default Appcomp;