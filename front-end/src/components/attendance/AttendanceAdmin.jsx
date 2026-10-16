import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import { useTheme } from '../../context/ThemeContext'
import DataTable from 'react-data-table-component'

const statusColors = {
  present: "text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800/40",
  late: "text-amber-700 bg-amber-50 border border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800/40",
  absent: "text-red-700 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/40",
  "on-leave": "text-blue-700 bg-blue-50 border border-blue-200 dark:text-blue-400 dark:bg-blue-900/20",
  "half-day": "text-purple-700 bg-purple-50 border border-purple-200 dark:text-purple-400 dark:bg-purple-900/20",
}
const StatusDot = ({ status }) => {
  const colors = { present: "bg-emerald-500", late: "bg-amber-500", absent: "bg-red-500", "on-leave": "bg-blue-500", "half-day": "bg-purple-500" }
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'}`} />
}

// Local "YYYY-MM-DD" — never toISOString() (UTC day shift in UTC+ zones)
const toDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const todayStr = () => toDateStr(new Date())

const ProfileCell = ({ row }) => {
  const [failed, setFailed] = React.useState(false)
  const src = row.profilePicture?.startsWith("data:") ? row.profilePicture : row.profilePicture ? `${API_URL}/uploads/${row.profilePicture}` : null
  return (
    <div className="flex items-center gap-3">
      {src && !failed ? <img src={src} alt={row.name} className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm shrink-0" onError={() => setFailed(true)} /> :
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">{row.name?.charAt(0).toUpperCase() || "?"}</div>}
      <div className="flex flex-col"><span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{row.name}</span><span className="text-xs text-gray-400 dark:text-gray-500">{row.department} • {row.employeeIdNo}</span></div>
    </div>
  )
}

const AttendanceAdmin = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [records, setRecords] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("")
  const [dateFilter, setDateFilter] = useState(todayStr())
  const [monthFilter, setMonthFilter] = useState("")
  const [summary, setSummary] = useState({ total: 0, present: 0, late: 0, absent: 0 })
  // admin mark form
  const [showMark, setShowMark] = useState(false)
  const [markForm, setMarkForm] = useState({ employeeId: "", date: todayStr(), status: "present", note: "" })
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])

  const getAuthHeader = () => {
    const t = localStorage.getItem("token") || sessionStorage.getItem("token")
    return { headers: { authorization: `Bearer ${t}` } }
  }

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)
      const authHeader = getAuthHeader()
      const params = new URLSearchParams()
      if (dateFilter && !monthFilter) params.set("date", dateFilter)
      if (monthFilter) params.set("month", monthFilter)
      const res = await axios.get(`${API_URL}/api/attendance?${params.toString()}`, authHeader)
      if (res.data.success) {
        const data = res.data.records.map(r => ({
          _id: r._id,
          name: r.userId?.name || r.employeeId?.userId?.name || "Unknown",
          profilePicture: r.userId?.profilePicture || r.employeeId?.userId?.profilePicture,
          employeeIdNo: r.employeeId?.employeeId || r.employeeId,
          department: r.employeeId?.department?.dep_name || r.department || "—",
          date: r.date,
          checkIn: r.checkIn,
          checkOut: r.checkOut,
          workHours: r.workHours,
          status: r.status,
          raw: r,
        }))
        setRecords(data); setFiltered(data); setSummary(res.data.summary || { total: data.length, present: data.filter(d => d.status === 'present').length, late: data.filter(d => d.status === 'late').length, absent: data.filter(d => d.status === 'absent').length })
      }
    } catch (e) { setError(e.response?.data?.error || "Failed to load") }
    finally { setLoading(false) }
  }

  const fetchEmpsDepts = async () => {
    try {
      const authHeader = getAuthHeader()
      const [eRes, dRes] = await Promise.all([axios.get(`${API_URL}/api/employee`, authHeader), axios.get(`${API_URL}/api/department`, authHeader)])
      if (eRes.data.success) setEmployees(eRes.data.employees || [])
      if (dRes.data.success) setDepartments(dRes.data.departments || [])
    } catch {}
  }

  // single effect (runs on mount + filter change) — avoids double-fetch
  useEffect(() => { fetchAll() }, [dateFilter, monthFilter]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fetchEmpsDepts() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let d = records
    if (search) d = d.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.department.toLowerCase().includes(search.toLowerCase()) || r.employeeIdNo?.toLowerCase().includes(search.toLowerCase()))
    if (filter) d = d.filter(r => r.status === filter)
    setFiltered(d)
  }, [search, filter, records])

  const handleMark = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API_URL}/api/attendance/mark`, markForm, getAuthHeader())
      if (res.data.success) { setShowMark(false); setMarkForm({ employeeId: "", date: todayStr(), status: "present", note: "" }); fetchAll() }
    } catch (err) { console.log("MARK FAILED:", err?.response?.data || err.message); alert(err.response?.data?.error || "Mark failed") }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this attendance record?")) return
    try { await axios.delete(`${API_URL}/api/attendance/${id}`, getAuthHeader()); fetchAll() } catch (err) { console.log("DELETE FAILED:", err?.response?.data || err.message); alert(err.response?.data?.error || "Delete failed") }
  }

  const columns = [
    { name: "Employee", selector: row => row.name, sortable: true, cell: row => <ProfileCell row={row} />, grow: 1.5 },
    { name: "Date", selector: row => row.date, sortable: true, center: true, cell: row => <span className="text-sm font-medium">{new Date(row.date).toLocaleDateString()}</span> },
    { name: "In", selector: row => row.checkIn, center: true, cell: row => row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : <span className="text-xs text-gray-400">—</span> },
    { name: "Out", selector: row => row.checkOut, center: true, cell: row => row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : <span className="text-xs text-gray-400">—</span> },
    { name: "Hours", selector: row => row.workHours, center: true, cell: row => <span className="font-semibold text-sm">{row.workHours ? `${row.workHours}h` : '—'}</span> },
    { name: "Status", selector: row => row.status, sortable: true, center: true, cell: row => <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${statusColors[row.status] || ''}`}><StatusDot status={row.status} />{row.status}</span> },
    { name: "Action", center: true, cell: row => <button onClick={() => handleDelete(row._id)} className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">Delete</button> },
  ]

  const statCards = [
    { label: "Total Records", value: summary.total, color: "from-blue-500 to-blue-600" },
    { label: "Present", value: summary.present, color: "from-emerald-500 to-green-600" },
    { label: "Late", value: summary.late, color: "from-amber-500 to-orange-500" },
    { label: "Absent", value: summary.absent, color: "from-red-500 to-rose-600" },
  ]

  const filterBtns = [
    { key: "", label: "All", count: summary.total },
    { key: "present", label: "Present", count: summary.present },
    { key: "late", label: "Late", count: summary.late },
    { key: "absent", label: "Absent", count: summary.absent },
  ]

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20"><img src="/pics/aiics.jpg" alt="" className="w-full h-full object-cover" /></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 shadow-xl flex items-center justify-center overflow-hidden p-1 shrink-0"><img src="/pics/aiics.jpg" alt="logo" className="w-full h-full object-contain rounded-full" /></div>
            <div><p className="text-sm font-medium text-blue-100">Attendance Overview</p><h2 className="text-2xl font-bold mt-1">All Attendance</h2><p className="text-sm text-blue-100 mt-1">Manage and monitor employee daily check-in/out</p></div>
          </div>
          <button onClick={() => setShowMark(!showMark)} className="bg-white text-blue-600 px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-50 transition-colors">+ Mark Attendance</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(c => (
          <div key={c.label} className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${c.color} rounded-bl-[3rem] opacity-10`} />
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pr-10">{c.label}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      {showMark && (
        <form onSubmit={handleMark} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Mark / Correct Attendance (Admin)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Employee</label>
              <select required value={markForm.employeeId} onChange={e => setMarkForm({ ...markForm, employeeId: e.target.value })} className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700">
                <option value="">Select employee</option>{employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} — {emp.employeeId}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Date</label><input type="date" required value={markForm.date} onChange={e => setMarkForm({ ...markForm, date: e.target.value })} className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700" /></div>
            <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Status</label>
              <select value={markForm.status} onChange={e => setMarkForm({ ...markForm, status: e.target.value })} className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700">
                <option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option><option value="on-leave">On Leave</option><option value="half-day">Half Day</option>
              </select>
            </div>
            <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Note</label><input type="text" placeholder="Optional" value={markForm.note} onChange={e => setMarkForm({ ...markForm, note: e.target.value })} className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700" /></div>
          </div>
          <div className="flex gap-3"><button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg">Save</button><button type="button" onClick={() => setShowMark(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700">Cancel</button></div>
        </form>
      )}

      <div className="flex flex-col lg:flex-row gap-3 justify-between">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex items-center gap-2"><label className="text-xs font-semibold text-gray-500">Date:</label><input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setMonthFilter("") }} className="border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700" /></div>
          <div className="flex items-center gap-2"><label className="text-xs font-semibold text-gray-500">Month:</label><input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-700" /></div>
          {(dateFilter || monthFilter) && <button onClick={() => { setDateFilter(todayStr()); setMonthFilter("") }} className="text-xs text-blue-600 underline">Today</button>}
          <button onClick={fetchAll} className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh</button>
        </div>
        <div className="relative max-w-xs w-full">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Search name or dept..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filterBtns.map(btn => (
          <button key={btn.key || 'all'} onClick={() => setFilter(btn.key)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === btn.key ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
            {btn.label} <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-md ${filter === btn.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>{btn.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4"><svg className="w-10 h-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><p className="text-sm text-gray-400">Loading attendance...</p></div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filtered}
              keyField="_id"
              pagination
              highlightOnHover
              responsive
              noDataComponent={<div className="py-16 text-center"><p className="text-sm text-gray-500">No attendance records for selected date</p><p className="text-xs text-gray-400 mt-1">Try a different date or mark attendance</p></div>}
              customStyles={{
                headCells: { style: { backgroundColor: isDark ? "#1f2937" : "#f8fafc", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: isDark ? "#9ca3af" : "#64748b", justifyContent: "center", padding: "16px", borderBottom: isDark ? "1px solid #374151" : "1px solid #f1f5f9" } },
                cells: { style: { fontSize: "13px", color: isDark ? "#d1d5db" : "#334155", justifyContent: "center", padding: "16px" } },
                rows: { style: { minHeight: "56px", borderBottom: isDark ? "1px solid #1f2937" : "1px solid #f1f5f9", "&:hover": { backgroundColor: isDark ? "#111827" : "#f8fafc" } } },
                pagination: { style: { borderTop: isDark ? "1px solid #374151" : "1px solid #e2e8f0", fontSize: "13px", color: isDark ? "#9ca3af" : "#475569", minHeight: "52px" } }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceAdmin
