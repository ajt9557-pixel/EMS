import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import { useAuth } from '../../context/authcontext'
import View from '../employee/view.jsx'

const MyProfile = () => {
  const { user } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imgFailed, setImgFailed] = useState(false)

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
      .catch(async (err) => {
        const msg = err.response?.data?.error || ''
        if (msg.includes('No employee profile') || err.response?.status === 404) {
          try {
            const verifyRes = await axios.get(`${API_URL}/api/auth/verify`, {
              headers: { authorization: `Bearer ${token}` },
            })
            if (verifyRes.data.success && verifyRes.data.user) {
              setAdminUser(verifyRes.data.user)
              setError(null)
              return
            }
          } catch {}
        }
        setError(msg || 'Failed to load your profile')
      })
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

  if (adminUser && !employee) {
    const adminAvatar = adminUser.profilePicture
      ? adminUser.profilePicture.startsWith('data:')
        ? adminUser.profilePicture
        : `${API_URL}/uploads/${adminUser.profilePicture}`
      : null
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <img src="/pics/aiics.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 shadow-xl flex items-center justify-center overflow-hidden shrink-0">
              {adminAvatar && !imgFailed ? (
                <img src={adminAvatar} alt={adminUser.name} className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white text-blue-600 font-bold text-xl">
                  {adminUser.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-blue-100">My Profile</p>
              <h2 className="text-2xl font-bold mt-1">Welcome, {adminUser.name?.split(' ')[0]}</h2>
              <p className="text-sm text-blue-100 mt-1">Administrator account</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-700 relative">
            <div className="absolute inset-0 bg-[url('/pics/aiics.jpg')] bg-cover bg-center opacity-10" />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6">
              <div className="relative shrink-0 -mt-10">
                {adminAvatar && !imgFailed ? (
                  <img src={adminAvatar} alt={adminUser.name} className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg bg-white" onError={() => setImgFailed(true)} />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-2xl font-bold text-blue-600">{adminUser.name?.charAt(0).toUpperCase()}</div>
                )}
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800" />
              </div>
              <div className="text-center sm:text-left pb-1">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{adminUser.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{adminUser.email}</p>
                <span className="inline-flex mt-2 items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 px-3 py-1 rounded-lg capitalize">{adminUser.role}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between gap-4 bg-gray-50/60 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Email</span><span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{adminUser.email}</span>
              </div>
              <div className="flex items-center justify-between gap-4 bg-gray-50/60 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Role</span><span className="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">{adminUser.role}</span>
              </div>
              <div className="flex items-center justify-between gap-4 bg-gray-50/60 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Profile Picture</span><span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{adminUser.profilePicture ? 'Set' : 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
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

  const avatarSrc = employee?.profilePicture
    ? employee.profilePicture.startsWith('data:')
      ? employee.profilePicture
      : `${API_URL}/uploads/${employee.profilePicture}`
    : null

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <img src="/pics/aiics.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 shadow-xl flex items-center justify-center overflow-hidden shrink-0">
            {avatarSrc && !imgFailed ? (
              <img
                src={avatarSrc}
                alt={employee.name}
                className="w-full h-full object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : avatarSrc && imgFailed ? (
              <div className="w-full h-full flex items-center justify-center bg-white text-blue-600 font-bold text-xl">
                {employee.name?.charAt(0).toUpperCase()}
              </div>
            ) : (
              <img
                src="/pics/aiics.jpg"
                alt="Company Logo"
                className="w-full h-full object-contain rounded-full bg-white p-1"
              />
            )}
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
