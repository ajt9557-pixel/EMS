import React from 'react'
import { useAuth } from '../context/authcontext'
import Adminsidebar from '../components/dashboard/Adminsidebar.jsx'
import Navbar from '../components/dashboard/Navbar.jsx'
import DashboardLayout from '../components/DashboardLayout'
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
  useAuth()
  return (
    <DashboardLayout sidebar={<Adminsidebar />}>
      <Navbar />
      <div className="p-6">
        <Outlet />
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard