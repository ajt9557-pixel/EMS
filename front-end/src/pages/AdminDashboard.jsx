import React from 'react'
import { useAuth } from '../context/authcontext'
import Adminsidebar from '../components/dashboard/Adminsidebar.jsx'
import Navbar from '../components/dashboard/Navbar.jsx'
import AdminSummary from "../components/dashboard/AdminSummary";
import DashboardLayout from '../components/DashboardLayout'

const AdminDashboard = () => {
  useAuth()
  return (
    <DashboardLayout sidebar={<Adminsidebar />}>
      <Navbar />
      <div className="p-6">
        <AdminSummary />
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard