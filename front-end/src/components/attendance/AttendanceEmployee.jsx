import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import { useTheme } from '../../context/ThemeContext'
import DataTable from 'react-data-table-component'

const statusColors = {
  present: "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800/40",
  late: "text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800/40",
  absent: "text-red-700 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/40",
  "on-leave": "text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800/40",
  "half-day": "text-purple-700 bg-purple-50 border border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800/40",
}

const StatusDot = ({ status }) => {
  const colors = { present: "bg-emerald-500", late: "bg-amber-500", absent: "bg-red-500", "on-leave": "bg-blue-500", "half-day": "bg-purple-500" }
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'}`} />
}

const AttendanceEmployee = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [records, setRecords] = useState([])
  const [todayRecord, setTodayRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [msg, setMsg] = useState(null)
  const [now, setNow] = useState(new Date())
  const [filter, setFilter] = useState("")
  const [search, setSearch] = useState("")

  const getAuthHeader = () => {
    const t = localStorage.getItem("token") || sessionStorage.getItem("token")
    return { headers: { authorization: `Bearer ${t}` } }
  }

  const fetchMy = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_URL}/api/attendance/my`, getAuthHeader())
      if (res.data.success) {
        setRecords(res.data.records || [])
        setTodayRecord(res.data.todayRecord || null)
      }
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load attendance")
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchMy() }, [])
  // Update clock every 30s — avoids re-rendering the whole page every second
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const handleCheckIn = async () => {
    setActionLoading(true); setError(null); setMsg(null)
    try {
      const res = await axios.post(`${API_URL}/api/attendance/check-in`, {}, getAuthHeader())
      if (res.data.success) { setMsg(`Checked in at ${new Date(res.data.attendance.checkIn).toLocaleTimeString()} — ${res.data.attendance.status}`); fetchMy() }
    } catch (e) { setError(e.response?.data?.error || "Check-in failed") }
    finally { setActionLoading(false) }
  }
  const handleCheckOut = async () => {
    setActionLoading(true); setError(null); setMsg(null)
    try {
      const res = await axios.post(`${API_URL}/api/attendance/check-out`, {}, getAuthHeader())
      if (res.data.success) { setMsg(`Checked out! Work hours: ${res.data.attendance.workHours}h`); fetchMy() }
    } catch (e) { setError(e.response?.data?.error || "Check-out failed") }
    finally { setActionLoading(false) }
  }

  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    late: records.filter(r => r.status === 'late').length,
    absent: records.filter(r => r.status === 'absent').length,
  }

  const canCheckIn = !todayRecord?.checkIn
  const canCheckOut = todayRecord?.checkIn && !todayRecord?.checkOut

  const filtered = records.filter(r => {
    if (filter && r.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      const dateStr = new Date(r.date).toLocaleDateString().toLowerCase()
      if (!dateStr.includes(s) && !r.status.includes(s)) return false
    }
    return true
  })

  const columns = [
    { name: "#", selector: (_, i) => i + 1, width: "60px", center: true, cell: (row, idx) => <span className="text-sm text-gray-500">{records.indexOf(row) + 1}</span> },
    { name: "Date", selector: row => row.date, sortable: true, center: true, cell: row => <span className="text-sm font-medium">{new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span> },
    { name: "Check In", selector: row => row.checkIn, sortable: true, center: true, cell: row => row.checkIn ? <span className="text-sm">{new Date(row.checkIn).toLocaleTimeString()}</span> : <span className="text-xs text-gray-400">—</span> },
    { name: "Check Out", selector: row => row.checkOut, sortable: true, center: true, cell: row => row.checkOut ? <span className="text-sm">{new Date(row.checkOut).toLocaleTimeString()}</span> : <span className="text-xs text-gray-400">—</span> },
    { name: "Hours", selector: row => row.workHours, sortable: true, center: true, cell: row => <span className="text-sm font-semibold">{row.workHours ? `${row.workHours}h` : "—"}</span> },
    {
      name: "Status", selector: row => row.status, sortable: true, center: true,
      cell: row => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${statusColors[row.status] || ''}`}>
          <StatusDot status={row.status} />{row.status}
        </span>
      )
    },
  ]

  const filterBtns = [
    { key: "", label: "All", count: stats.total },
    { key: "present", label: "Present", count: stats.present },
    { key: "late", label: "Late", count: stats.late },
    { key: "absent", label: "Absent", count: stats.absent },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20"><img src="/pics/aiics.jpg" alt="" className="w-full h-full object-cover" /></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 shadow-xl flex items-center justify-center overflow-hidden p-1 shrink-0"><img src="/pics/aiics.jpg" alt="logo" className="w-full h-full object-contain rounded-full" /></div>
            <div>
              <p className="text-sm font-medium text-blue-100">My Attendance</p>
              <h2 className="text-2xl font-bold mt-1">Track your work hours</h2>
              <p className="text-sm text-blue-100 mt-1">{now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — {now.toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCheckIn} disabled={!canCheckIn || actionLoading} className={`px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-[0.98] ${canCheckIn ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-white/30 text-white/60 cursor-not-allowed'}`}>{actionLoading ? '...' : 'Check In'}</button>
            <button onClick={handleCheckOut} disabled={!canCheckOut || actionLoading} className={`px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-[0.98] ${canCheckOut ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white/20 text-white/60 cursor-not-allowed border border-white/20'}`}>{actionLoading ? '...' : 'Check Out'}</button>
          </div>
        </div>
      </div>

      {/* Today card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Today</h3>
          {todayRecord ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4"><p className="text-xs text-gray-400 uppercase">Date</p><p className="text-sm font-bold mt-1">{new Date(todayRecord.date).toLocaleDateString()}</p></div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4"><p className="text-xs text-gray-400 uppercase">Check In</p><p className="text-sm font-bold mt-1">{todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : '—'}</p></div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4"><p className="text-xs text-gray-400 uppercase">Check Out</p><p className="text-sm font-bold mt-1">{todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : '—'}</p></div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4"><p className="text-xs text-gray-400 uppercase">Status</p><p className="text-sm font-bold mt-1 capitalize flex items-center gap-2"><StatusDot status={todayRecord.status} />{todayRecord.status}</p></div>
            </div>
          ) : (
            <div className="py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl"><p className="text-sm text-gray-500">No record for today — click Check In to start</p><p className="text-xs text-gray-400 mt-1">Late after 09:15</p></div>
          )}
          {todayRecord?.workHours > 0 && <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">Work hours today: <span className="font-bold text-gray-800 dark:text-gray-200">{todayRecord.workHours}h</span></p>}
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white flex flex-col justify-between">
          <div><p className="text-sm opacity-80">This Month</p><p className="text-3xl font-bold mt-2">{stats.present + stats.late} present</p><p className="text-sm opacity-70 mt-1">{stats.late} late • {stats.absent} absent • {stats.total} records</p></div>
          <div className="mt-6 flex gap-2">
            {filterBtns.slice(1).map(b => (
              <div key={b.key} className="flex-1 bg-white/20 backdrop-blur rounded-xl p-3 text-center"><p className="text-lg font-bold">{b.count}</p><p className="text-xs opacity-80">{b.label}</p></div>
            ))}
          </div>
        </div>
      </div>

      {(error || msg) && (
        <div className={`${error ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'} border rounded-xl px-5 py-3 flex items-center gap-3`}>
          <span className="text-sm font-medium">{error || msg}</span>
          <button onClick={() => { setError(null); setMsg(null) }} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Filters + Table */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative max-w-md w-full">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search date or status..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterBtns.map(btn => (
            <button key={btn.key || 'all'} onClick={() => setFilter(btn.key)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === btn.key ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {btn.label} <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-md ${filter === btn.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>{btn.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4"><svg className="w-10 h-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><p className="text-sm text-gray-400">Loading attendance...</p></div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filtered}
              keyField="_id"
              pagination
              highlightOnHover
              responsive
              noDataComponent={<div className="py-16 text-center"><p className="text-sm text-gray-500">No attendance records</p><p className="text-xs text-gray-400 mt-1">Your history will appear here</p></div>}
              paginationComponentOptions={{ rowsPerPageText: "Rows per page:", rangeSeparatorText: "of" }}
              customStyles={{
                headCells: { style: { backgroundColor: isDark ? "#1f2937" : "#f8fafc", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: isDark ? "#9ca3af" : "#64748b", justifyContent: "center", borderBottom: isDark ? "1px solid #374151" : "1px solid #f1f5f9", padding: "16px" } },
                cells: { style: { fontSize: "13px", color: isDark ? "#d1d5db" : "#334155", justifyContent: "center", padding: "16px" } },
                rows: { style: { minHeight: "56px", borderBottom: isDark ? "1px solid #1f2937" : "1px solid #f1f5f9", "&:hover": { backgroundColor: isDark ? "#111827" : "#f8fafc" } } },
                pagination: { style: { borderTop: isDark ? "1px solid #374151" : "1px solid #e2e8f0", fontSize: "13px", color: isDark ? "#9ca3af" : "#475569", minHeight: "52px" } }
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceEmployee
