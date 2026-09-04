import React, { useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import { useAuth } from '../../context/authcontext'
import { useTheme } from '../../context/ThemeContext'

const LeaveDetails = ({ employee: passedEmployee }) => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { theme } = useTheme()
    const [employee, setEmployee] = useState(passedEmployee || location.state?.employee || null)
    const [loading, setLoading] = useState(!(passedEmployee || location.state?.employee))
    const [error, setError] = useState(null)
    const [imageFailed, setImageFailed] = useState(false)
    const [leave, setLeave] = useState(null) 
    const [submitting, setSubmitting] = useState(false)

    const handleApprove = async () => {
    if (!id) return
    setSubmitting(true)
    try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")
        await axios.put(`${API_URL}/api/leave/${id}`, { status: 'approved' }, {
            headers: { authorization: `Bearer ${token}` },
        })
        navigate('/admin-dashboard/Leaves')
    } catch (err) {
        setError(err.response?.data?.error || "Failed to approve leave")
        setSubmitting(false)
    }
}

 const handleReject = async () => {
    if (!id) return
    setSubmitting(true)
    try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")
        await axios.put(`${API_URL}/api/leave/${id}`, { status: 'rejected' }, {
            headers: { authorization: `Bearer ${token}` },
        })
        navigate('/admin-dashboard/Leaves')
    } catch (error) {
        setError(error.response?.data?.error || "Failed to reject leave")
        setSubmitting(false)
    }
 }
    

    React.useEffect(() => {
        if (employee) return
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")
        axios.get(`${API_URL}/api/leave/${id}`, {
            headers: { authorization: `Bearer ${token}` },
        })
            .then((response) => {
    if (response.data.success) {
        const leave = response.data.leave
        setLeave(leave || null)
        const emp = leave?.employeeId
        if (emp) {
            emp.name = emp.userId?.name
            emp.email = emp.userId?.email
            emp.profilePicture = emp.userId?.profilePicture
        }
        setEmployee(emp || null)
    }
})
           
            .catch((err) => setError(err.response?.data?.error || "Failed to load leave"))
            .finally(() => setLoading(false))
    }, [id, employee])

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
          
            <div className="flex flex-col items-center gap-4 py-16">
              
                <p className="text-sm text-gray-500 dark:text-gray-400">{error || "Employee data not available."}</p>
                <Link
                    to="/admin-dashboard/Leaves"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200"
                >
                    Back to Leaves
                </Link>
            </div>
            
        )
        
    }

    const avatarSrc = employee.profilePicture?.startsWith("data:")
        ? employee.profilePicture
        : employee.profilePicture ? `${API_URL}/uploads/${employee.profilePicture}` : null

    const formatDate = (date) => {
        if (!date) return "—"
        return new Date(date).toLocaleDateString()
    }

    const formatSalary = (salary) => "₱" + Number(salary).toLocaleString()

   const details = [
    { label: "Name", value: employee.name },
    { label: "Place of Birth", value: employee.placeOfBirth },
    { label: "Email", value: employee.email },
    { label: "Reason", value: leave?.reason},
    { label: "Leave Type", value: leave?.leaveType },
    { label: "Status", value: leave?.status },
    { label: "Department", value:  employee.department?.dep_name },
    { label: "Gender", value: employee.gender },
    { label: " From Date  ", value: formatDate(leave?.startDate) },
    { label: " To Date  ", value: formatDate(leave?.endDate) },
]

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center gap-3 mb-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 border-4 border-blue-100 dark:border-blue-800 shadow-xl flex items-center justify-center overflow-hidden p-1.5">
                        <img
                            src="/pics/aics.jpg"
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
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">Employee Details</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-700 relative">
                    <div className="absolute inset-0 bg-[url('/pics/aiics.jpg')] bg-cover bg-center opacity-10" />
                </div>

                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6">
                        <div className="relative shrink-0 -mt-10">
                            {avatarSrc && !imageFailed ? (
                                <img
                                    src={avatarSrc}
                                    alt={employee.name}
                                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg bg-white dark:bg-gray-800"
                                    onError={() => setImageFailed(true)}
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {employee.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800" />
                        </div>
                        <div className="text-center sm:text-left pb-1">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{employee.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</p>
                            <span className="inline-flex mt-2 items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-3 py-1 rounded-lg">
                                {employee.dep_name || "No department"}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {details.map((detail) => (
                            <div key={detail.label} className="flex items-center justify-between gap-4 bg-gray-50/60 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600 rounded-xl px-4 py-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">{detail.label}</span>
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{detail.value || "—"}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                        {user?.role === "admin" ? (
                            <div className="flex gap-3">
                                <Link
                                    to="/admin-dashboard/Leaves"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 active:scale-[0.98]"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    </svg>
                                    Back to Leaves
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
                                >
                                    {submitting ? "Approving..." : "Approve"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReject}
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
                                >
                                    {submitting ? "Rejecting..." : "Reject"}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                Back to Dashboard
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LeaveDetails
