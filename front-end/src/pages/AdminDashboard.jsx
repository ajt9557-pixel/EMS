import React from 'react'
import Adminsidebar from '../components/dashboard/Adminsidebar.jsx'
import Navbar from '../components/dashboard/Navbar.jsx'
import { useAuth } from "../context/authcontext";
import AdminSummary from '../components/dashboard/AdminSummary.jsx';

const AdminDashboard = () => {

  useAuth()

  return (
    <div>
      <Adminsidebar />

      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">
          <AdminSummary />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard