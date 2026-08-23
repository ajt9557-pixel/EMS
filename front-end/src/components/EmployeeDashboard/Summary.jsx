import React from 'react'
import { useAuth } from '../../context/authcontext'

const Summary = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20 bg-white" />
        <div className="absolute -bottom-20 -right-4 w-48 h-48 rounded-full opacity-10 bg-white" />

        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100">Welcome Back</p>
          <h2 className="text-3xl font-bold mt-1">
            {user ? user.name : 'Employee'}
          </h2>
          <p className="text-sm text-blue-100 mt-2">
            {user ? user.email : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide">My Profile</p>
          <p className="text-sm text-gray-700 mt-2">View and update your personal information.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Leave Status</p>
          <p className="text-sm text-gray-700 mt-2">Track your leave applications and approvals.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Salary</p>
          <p className="text-sm text-gray-700 mt-2">Check your salary history and payslips.</p>
        </div>
      </div>
    </div>
  )
}

export default Summary
