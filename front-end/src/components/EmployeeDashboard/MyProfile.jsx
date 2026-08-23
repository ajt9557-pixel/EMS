import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import View from '../employee/view.jsx'

const MyProfile = () => {
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
      <div className="flex justify-center py-16">
        <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
        {error || 'Profile not found.'}
      </div>
    )
  }

  return <View employee={employee} />
}

export default MyProfile
