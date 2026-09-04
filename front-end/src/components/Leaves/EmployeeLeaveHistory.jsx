import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import Datatable from 'react-data-table-component'
import { useTheme } from '../../context/ThemeContext'

const statusColors = {
  pending: "text-yellow-700 bg-yellow-50 border border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800/40",
  approved: "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800/40",
  rejected: "text-red-700 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/40"
}

const StatusDot = ({ status }) => {
  const colors = {
    pending: "bg-yellow-400",
    approved: "bg-emerald-400",
    rejected: "bg-red-400"
  }
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'}`} />
  )
}

const EmployeeLeaveHistory = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { id } = useParams()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const employeeName = leaves[0]?.employeeId?.userId?.name || 'Employee'

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const authHeader = { headers: { authorization: `Bearer ${token}` } }

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/leave/employee/${id}`, authHeader)
        if (response.data.success) {
          setLeaves(response.data.leaves)
        }
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load leave records")
      } finally {
        setLoading(false)
      }
    }
    fetchLeaves()
  }, [id])

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  }

  const statCards = [
    { label: "Total Applied", value: stats.total, color: "from-blue-500 to-blue-600" },
    { label: "Pending", value: stats.pending, color: "from-amber-500 to-orange-500" },
    { label: "Approved", value: stats.approved, color: "from-emerald-500 to-green-600" },
    { label: "Rejected", value: stats.rejected, color: "from-red-500 to-rose-600" },
  ]

  const rows = leaves.map((l, index) => ({
    _id: l._id,
    sno: index + 1,
    leaveType: l.leaveType,
    startDate: l.startDate,
    endDate: l.endDate,
    status: l.status,
    reason: l.reason,
  }))

  const columns = [
    { name: "#", selector: row => row.sno, sortable: true, center: true, width: "60px" },
    {
      name: "Leave Type",
      selector: row => row.leaveType,
      sortable: true,
      center: true,
      cell: row => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
          {row.leaveType}
        </span>
      )
    },
    {
      name: "From",
      selector: row => row.startDate,
      sortable: true,
      center: true,
      cell: row => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {new Date(row.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    {
      name: "To",
      selector: row => row.endDate,
      sortable: true,
      center: true,
      cell: row => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {new Date(row.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      center: true,
      cell: row => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${statusColors[row.status] || ''}`}>
          <StatusDot status={row.status} />
          {row.status}
        </span>
      )
    },
    {
      name: "Reason",
      selector: row => row.reason,
      sortable: false,
      center: false,
      cell: row => (
        <span className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate block" title={row.reason}>
          {row.reason || "—"}
        </span>
      )
    },
  ]

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
              <p className="text-sm font-medium text-blue-100">Leave History</p>
              <h2 className="text-2xl font-bold mt-1">
                Welcome, {employeeName.split(' ')[0]}
              </h2>
              <p className="text-sm text-blue-100 mt-1">Leave requests of this employee</p>
            </div>
          </div>
          <Link
            to="/admin-dashboard/employee"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all duration-200 active:scale-[0.98] shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Employees
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-5 group hover:shadow-md transition-shadow duration-200">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} rounded-bl-[3rem] opacity-10 group-hover:opacity-20 transition-opacity`} />
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <svg className="w-10 h-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading your leave records...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-5 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Leave History</h4>
          </div>
          <Datatable
            columns={columns}
            data={rows}
            keyField="_id"
            pagination
            highlightOnHover
            responsive
            noDataComponent={
              <div className="py-20 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No leave records yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This employee has not submitted any leave requests</p>
              </div>
            }
            paginationComponentOptions={{
              rowsPerPageText: "Rows per page:",
              rangeSeparatorText: "of",
            }}
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: isDark ? "#1f2937" : "#f8fafc",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: isDark ? "#9ca3af" : "#64748b",
                  justifyContent: "center",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  borderBottom: isDark ? "1px solid #374151" : "1px solid #f1f5f9",
                },
              },
              cells: {
                style: {
                  fontSize: "14px",
                  color: isDark ? "#d1d5db" : "#334155",
                  justifyContent: "center",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                },
              },
              rows: {
                style: {
                  minHeight: "60px",
                  borderBottom: isDark ? "1px solid #1f2937" : "1px solid #f1f5f9",
                  "&:hover": {
                    backgroundColor: isDark ? "#111827" : "#f8fafc",
                  },
                },
              },
              pagination: {
                style: {
                  borderTop: isDark ? "1px solid #374151" : "1px solid #e2e8f0",
                  fontSize: "13px",
                  color: isDark ? "#9ca3af" : "#475569",
                  minHeight: "56px",
                },
              },
            }}
          />
        </div>
      )}
    </div>
  )
}

export default EmployeeLeaveHistory
