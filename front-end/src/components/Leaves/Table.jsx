import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

const ProfileCell = ({ row }) => {
  const [failed, setFailed] = useState(false)
  const src = row.profilePicture?.startsWith("data:")
    ? row.profilePicture
    : row.profilePicture ? `${API_URL}/uploads/${row.profilePicture}` : null

  return (
    <div className="flex items-center gap-3">
      {src && !failed ? (
        <img
          src={src}
          alt={row.name}
          className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm shrink-0"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
          {row.name?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{row.name}</span>
        {row.department && (
          <span className="text-xs text-gray-400 dark:text-gray-500">{row.department}</span>
        )}
      </div>
    </div>
  )
}

const Table = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [leaves, setLeaves] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("")

  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const authHeader = { headers: { authorization: `Bearer ${token}` } }

  const fetchLeaves = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/leave`, {}, authHeader)
      if (response.data.success) {
        let sno = 1
        const data = response.data.leaves.map((leave) => ({
          _id: leave._id,
          sno: sno++,
          name: leave.employeeId?.userId?.name || leave.employeeId?.name,
          profilePicture: leave.employeeId?.userId?.profilePicture,
          employeeIdNo: leave.employeeId?.employeeId,
          department: leave.employeeId?.department?.dep_name || leave.employeeId?.department,
          leaveType: leave.leaveType,
          startDate: new Date(leave.startDate).toLocaleDateString(),
          endDate: new Date(leave.endDate).toLocaleDateString(),
          status: leave.status,
          action: leave._id,
        }))
        setLeaves(data)
        setFilteredData(data)
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load leaves")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  useEffect(() => {
    let data = leaves
    if (search) {
      data = data.filter(row =>
        (row.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (row.leaveType?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (row.department?.toLowerCase() || "").includes(search.toLowerCase())
      )
    }
    if (filter) {
      data = data.filter(row => row.status === filter)
    }
    setFilteredData(data)
  }, [search, filter, leaves])

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  }

  const statCards = [
    { label: "Total Requests", value: stats.total, color: "from-blue-500 to-blue-600", iconColor: "text-blue-200" },
    { label: "Pending", value: stats.pending, color: "from-amber-500 to-orange-500", iconColor: "text-amber-200" },
    { label: "Approved", value: stats.approved, color: "from-emerald-500 to-green-600", iconColor: "text-emerald-200" },
    { label: "Rejected", value: stats.rejected, color: "from-red-500 to-rose-600", iconColor: "text-red-200" },
  ]

  const columns = [
    { name: "#", selector: row => row.sno, sortable: true, center: true, width: "60px" },
    {
      name: "Employee",
      selector: row => row.name,
      sortable: true,
      center: false,
      cell: row => <ProfileCell row={row} />,
    },
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
    { name: "From", selector: row => row.startDate, sortable: true, center: true },
    { name: "To", selector: row => row.endDate, sortable: true, center: true },
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
      name: "Action",
      selector: row => row.action,
      center: true,
      cell: row => (
        <Link
          to={`/admin-dashboard/leave/${row.action}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 px-3 py-1.5 rounded-lg transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
          </svg>
          Review
        </Link>
      ),
    },
  ]

  const filterButtons = [
    { key: "", label: "All", count: stats.total },
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "approved", label: "Approved", count: stats.approved },
    { key: "rejected", label: "Rejected", count: stats.rejected },
  ]

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
            <p className="text-sm font-medium text-blue-100">Leave Management</p>
            <h2 className="text-2xl font-bold mt-1">Leave Requests</h2>
            <p className="text-sm text-blue-100 mt-1">Review and manage employee leave requests</p>
          </div>
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

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative max-w-md w-full">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, type, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-xl py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map(btn => (
            <button
              key={btn.key || 'all'}
              type="button"
              onClick={() => setFilter(btn.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                filter === btn.key
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {btn.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                filter === btn.key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              }`}>
                {btn.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <svg className="w-10 h-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading leave records...</p>
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
          <Datatable
            columns={columns}
            data={filteredData}
            keyField="_id"
            pagination
            highlightOnHover
            responsive
            noDataComponent={
              <div className="py-20 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No leave records found</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
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

export default Table
