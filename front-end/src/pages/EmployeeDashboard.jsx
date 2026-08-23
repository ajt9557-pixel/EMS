import React from 'react'
import {useAuth} from '../context/authcontext.jsx'
import DashboardLayout from '../components/DashboardLayout'
import Navbar from '../components/dashboard/Navbar.jsx'
import Dashboard from '../components/EmployeeDashboard/Dashboard.jsx'
import { Outlet } from "react-router-dom";

const EmployeeDashboard = () => {
  const {user} = useAuth()
  return (
   <DashboardLayout sidebar={<Dashboard />}>
         <Navbar />
         <div className="p-6">
           <Outlet />
         </div>
       </DashboardLayout>
  )
}

export default EmployeeDashboard
