import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authcontext.jsx'
import { API_URL } from '../../utils/api'

const AddLeave = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formdata, setFormData] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        `${API_URL}/api/leave/add`,
        { ...formdata, userId: user?._id },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          },
        }
      )
      if (response.data.success) {
        navigate('/employee-dashboard/Leaves')
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error)
      }
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
        <button
          type="button"
          onClick={() => navigate('/employee-dashboard/Leaves')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Manage Leaves
        </button>

        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 border-4 border-blue-100 dark:border-blue-800 shadow-xl flex items-center justify-center overflow-hidden p-1.5">
              <img
                src="/pics/aiics.jpg"
                alt="Company Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Enter your Reason to Leave.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">From Date:</label>
              <input
                type="date"
                name="startDate"
                onChange={handleChange}
                className="w-full border border-blue-100 dark:border-gray-600 bg-blue-50/40 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">To Date:</label>
              <input
                type="date"
                name="endDate"
                onChange={handleChange}
                className="w-full border border-blue-100 dark:border-gray-600 bg-blue-50/40 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Leave Type</label>
              <select
                name="leaveType"
                onChange={handleChange}
                className="w-full border border-blue-100 dark:border-gray-600 bg-blue-50/40 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              >
                <option className="dark:bg-gray-700 dark:text-gray-200" value="">Select a Leave type</option>
                <option className="dark:bg-gray-700 dark:text-gray-200" value="sick">Sick leave</option>
                <option className="dark:bg-gray-700 dark:text-gray-200" value="casual">Casual leave</option>
                <option className="dark:bg-gray-700 dark:text-gray-200" value="annual">Annual leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Reason</label>
              <input
                type="text"
                name="reason"
                onChange={handleChange}
                className="w-full border border-blue-100 dark:border-gray-600 bg-blue-50/40 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 active:scale-[0.98]"
          >
            Add Leave
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddLeave