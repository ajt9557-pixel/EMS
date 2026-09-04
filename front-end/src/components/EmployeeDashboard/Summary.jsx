import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/authcontext'
import axios from 'axios'
import { API_URL } from '../../utils/api'

const Summary = () => {
  const { user } = useAuth()
  const [leaves, setLeaves] = useState([])
  const [depName, setDepName] = useState('')
  const [latestNetSalary, setLatestNetSalary] = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const authHeader = { headers: { authorization: `Bearer ${token}` } }

  useEffect(() => {
    const load = async () => {
      try {
        const [leaveRes, profileRes, salaryRes] = await Promise.all([
          axios.get(`${API_URL}/api/leave/my-leaves`, authHeader),
          axios.get(`${API_URL}/api/employee/my-profile`, authHeader),
          axios.get(`${API_URL}/api/salary/my`, authHeader)
        ])
        if (leaveRes.data.success) setLeaves(leaveRes.data.leaves)
        if (profileRes.data.success) setDepName(profileRes.data.employee?.department?.dep_name || '')
        if (salaryRes.data.success && salaryRes.data.salaries.length > 0) {
          setLatestNetSalary(salaryRes.data.salaries[0].netSalary)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  }

  const statCards = [
    { label: "Total Leaves", value: stats.total, color: "from-blue-500 to-blue-600" },
    { label: "Pending", value: stats.pending, color: "from-amber-500 to-orange-500" },
    { label: "Approved", value: stats.approved, color: "from-emerald-500 to-green-600" },
    { label: "Rejected", value: stats.rejected, color: "from-red-500 to-rose-600" },
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
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 shadow-xl flex items-center justify-center overflow-hidden p-1 shrink-0">
            <img
              src="/pics/aiics.jpg"
              alt="Company Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-100">My Dashboard</p>
            <h2 className="text-2xl font-bold mt-1">
              Welcome, {user ? user.name.split(' ')[0] : 'Employee'}
            </h2>
            {depName && (
              <p className="text-sm text-blue-100 mt-1">{depName} Department</p>
            )}
            <p className="text-sm text-blue-100 mt-1">Track your leaves, salary and profile at a glance</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <svg className="w-10 h-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => <StatCard key={card.label} card={card} />)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-bl-[3rem] opacity-10" />
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Latest Net Salary</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">
                {latestNetSalary !== null ? "₱" + Number(latestNetSalary).toLocaleString() : "—"}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-bl-[3rem] opacity-10" />
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Profile Status</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2 capitalize">
                {user && user.role === 'admin' ? 'Admin' : 'Employee'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Summary
