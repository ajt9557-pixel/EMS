import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import { useAuth } from '../../context/authcontext'
import View from '../employee/view.jsx'

const MyProfile = () => {
  const { user } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    axios.get(`${API_URL}/api/employee/my-profile`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.data.success) {
          setEmployee(response.data.employee)
        } else {
          setError(response.data.error || 'Failed to load your profile')
        }
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load your profile'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <svg className="w-10 h-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading your profile...</p>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
        {error || 'Profile not found.'}
      </div>
    )
  }

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
            <p className="text-sm font-medium text-blue-100">My Profile</p>
            <h2 className="text-2xl font-bold mt-1">
              Welcome, {user ? user.name.split(' ')[0] : 'Employee'}
            </h2>
            <p className="text-sm text-blue-100 mt-1">View your personal information and details</p>
          </div>
        </div>
      </div>

      <View employee={employee} />
    </div>
  )
}

export default MyProfile
