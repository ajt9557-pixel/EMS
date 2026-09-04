import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import { useAuth } from '../../context/authcontext'

const AdminSummary = () => {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const authHeader = { headers: { authorization: `Bearer ${token}` } }

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, depRes, leaveRes] = await Promise.all([
          axios.get(`${API_URL}/api/employee`, authHeader),
          axios.get(`${API_URL}/api/department`, authHeader),
          axios.post(`${API_URL}/api/leave`, {}, authHeader)
        ])
        if (empRes.data.success) setEmployees(empRes.data.employees)
        if (depRes.data.success) setDepartments(depRes.data.departments)
        if (leaveRes.data.success) setLeaves(leaveRes.data.leaves)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalEmployees = employees.length
  const totalDepartments = departments.length
  const monthlySalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0)
  const monthlySalaryDisplay = "₱" + monthlySalary.toLocaleString()
  const approvedLeaves = leaves.filter(leave => leave.status === 'approved').length
  const pendingLeaves = leaves.filter(leave => leave.status === 'pending').length
  const rejectedLeaves = leaves.filter(leave => leave.status === 'rejected').length
  const totalLeaves = leaves.length

  const profileStatus = user && user.role === 'admin' ? 'Admin' : 'Employee'

  const mainCards = [
    { label: "Total Employees", value: totalEmployees, color: "from-blue-500 to-blue-600" },
    { label: "Total Departments", value: totalDepartments, color: "from-indigo-500 to-purple-600" },
    { label: "Monthly Salary", value: monthlySalaryDisplay, color: "from-emerald-500 to-green-600" },
    { label: "Profile Status", value: profileStatus, color: "from-purple-500 to-fuchsia-600" },
  ]

  const leaveCards = [
    { label: "Leave Applied", value: totalLeaves, color: "from-blue-500 to-blue-600" },
    { label: "Leave Approved", value: approvedLeaves, color: "from-emerald-500 to-green-600" },
    { label: "Leave Pending", value: pendingLeaves, color: "from-amber-500 to-orange-600" },
    { label: "Leave Rejected", value: rejectedLeaves, color: "from-red-500 to-rose-600" },
  ]

  const StatCard = ({ card }) => (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-5 group hover:shadow-md transition-shadow duration-200">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} rounded-bl-[3rem] opacity-10 group-hover:opacity-20 transition-opacity`} />
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{card.label}</p>
      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{card.value}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <img src="/pics/aiics.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 shadow-xl flex items-center justify-center overflow-hidden p-1 shrink-0">
              <img
                src="/pics/aiics.jpg"
                alt="Company Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">Dashboard Overview</p>
              <h2 className="text-2xl font-bold mt-1">
                Welcome, {user ? user.name.split(' ')[0] : 'Admin'}
              </h2>
              <p className="text-sm text-blue-100 mt-1">Overview of your organization's workforce and leave activity</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <svg className="w-10 h-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {mainCards.map((card) => <StatCard key={card.label} card={card} />)}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Leave Details</h4>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {leaveCards.map((card) => <StatCard key={card.label} card={card} />)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminSummary
