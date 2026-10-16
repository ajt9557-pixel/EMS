import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import { useTheme } from '../../context/ThemeContext'

const CODE = {
  present: 'P',
  late: 'L',
  absent: 'A',
  'on-leave': 'LV',
  'half-day': 'HD',
}

const CELL_STYLE = {
  present: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  late: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  absent: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  'on-leave': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  'half-day': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
}

const toDayKey = (d) => {
  const dt = new Date(d)
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const getEmpKey = (r) => {
  // populated shape: r.employeeId = { _id, ... } OR string
  if (r.employeeId && typeof r.employeeId === 'object' && r.employeeId._id) return String(r.employeeId._id)
  return String(r.employeeId || r.employee?._id || '')
}

const AttendanceSheet = ({ selfOnly = false }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const now = new Date()
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [month, setMonth] = useState(defaultMonth)
  const [employees, setEmployees] = useState([])
  const [records, setRecords] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')

  const getAuthHeader = () => {
    const t = localStorage.getItem('token') || sessionStorage.getItem('token')
    return { headers: { authorization: `Bearer ${t}` } }
  }

  const [year, mon] = month.split('-').map(Number)
  const daysInMonth = new Date(year, mon, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const monthLabel = new Date(year, mon - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const fetchData = async (targetMonth) => {
    try {
      setLoading(true)
      setError(null)
      const authHeader = getAuthHeader()
      if (selfOnly) {
        const [myRes, profileRes] = await Promise.all([
          axios.get(`${API_URL}/api/attendance/my?month=${targetMonth}`, authHeader),
          axios.get(`${API_URL}/api/employee/my-profile`, authHeader),
        ])
        const emp = profileRes.data?.employee
        const empRow = emp ? [{
          _id: emp._id,
          name: emp.name,
          employeeId: emp.employeeId,
          dep_name: emp.department?.dep_name || emp.dep_name || '—',
          department: emp.department?._id || emp.department || '',
        }] : []
        setEmployees(empRow)
        setRecords(myRes.data?.records || [])
      } else {
        const [eRes, aRes, dRes] = await Promise.all([
          axios.get(`${API_URL}/api/employee`, authHeader),
          axios.get(`${API_URL}/api/attendance?month=${targetMonth}`, authHeader).catch((e) => { setError(e.response?.data?.error || 'Failed to load attendance'); return { data: {} } }),
          axios.get(`${API_URL}/api/department`, authHeader).catch(() => ({ data: {} })),
        ])
        if (eRes.data?.success) setEmployees(eRes.data.employees || [])
        if (aRes.data?.success) setRecords(aRes.data.records || [])
        if (dRes.data?.success) setDepartments(dRes.data.departments || [])
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load attendance sheet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData(month) }, [month]) // eslint-disable-line react-hooks/exhaustive-deps

  // employeeId (_id) -> { 'YYYY-MM-DD': record }
  const recordMap = useMemo(() => {
    const map = {}
    for (const r of records) {
      const k = getEmpKey(r)
      if (!k) continue
      if (!map[k]) map[k] = {}
      map[k][toDayKey(r.date)] = r
    }
    return map
  }, [records])

  const filteredEmployees = useMemo(() => {
    let list = [...employees]
    if (!selfOnly) {
      if (deptFilter) {
        list = list.filter((e) => {
          const depId = typeof e.department === 'object' ? e.department?._id : e.department
          return String(depId || '') === String(deptFilter) || String(e.dep_name || '') === String(departments.find((d) => String(d._id) === String(deptFilter))?.dep_name || '')
        })
      }
      if (search) {
        const s = search.toLowerCase()
        list = list.filter(
          (e) =>
            (e.name || '').toLowerCase().includes(s) ||
            (e.employeeId || '').toLowerCase().includes(s) ||
            (e.dep_name || '').toLowerCase().includes(s)
        )
      }
    }
    return list
  }, [employees, search, deptFilter, departments, selfOnly])

  const rows = useMemo(() => {
    return filteredEmployees.map((emp) => {
      const empKey = String(emp._id)
      const byDay = recordMap[empKey] || {}
      let present = 0, late = 0, absent = 0, leave = 0, half = 0, hours = 0
      const cells = days.map((d) => {
        const key = `${month}-${String(d).padStart(2, '0')}`
        const rec = byDay[key]
        if (!rec) return { day: d, status: null, rec: null }
        hours += Number(rec.workHours || 0)
        if (rec.status === 'present') present++
        else if (rec.status === 'late') late++
        else if (rec.status === 'absent') absent++
        else if (rec.status === 'on-leave') leave++
        else if (rec.status === 'half-day') half++
        return { day: d, status: rec.status, rec }
      })
      const totalMarked = present + late + absent + leave + half
      const attendancePct = daysInMonth ? Math.round(((present + late + half * 0.5) / daysInMonth) * 100) : 0
      return { emp, cells, present, late, absent, leave, half, hours: +hours.toFixed(2), totalMarked, attendancePct }
    })
  }, [filteredEmployees, recordMap, days, month, daysInMonth])

  const totals = useMemo(() => ({
    employees: rows.length,
    present: rows.reduce((s, r) => s + r.present, 0),
    late: rows.reduce((s, r) => s + r.late, 0),
    absent: rows.reduce((s, r) => s + r.absent, 0),
  }), [rows])

  const isWeekend = (d) => {
    const wd = new Date(year, mon - 1, d).getDay()
    return wd === 0 || wd === 6
  }
  const isFuture = (d) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(year, mon - 1, d) > today
  }

  const handlePrint = () => window.print()

  const handleCSV = () => {
    const header = ['Employee ID', 'Name', 'Department', ...days.map((d) => String(d)), 'P', 'L', 'A', 'LV', 'HD', 'Hours', 'Present%']
    const lines = [header.join(',')]
    for (const r of rows) {
      const dayVals = r.cells.map((c) => (c.status ? CODE[c.status] || c.status : '-'))
      const line = [
        `"${r.emp.employeeId || ''}"`,
        `"${(r.emp.name || '').replace(/"/g, '""')}"`,
        `"${(r.emp.dep_name || '').replace(/"/g, '""')}"`,
        ...dayVals,
        r.present, r.late, r.absent, r.leave, r.half, r.hours, `${r.attendancePct}%`,
      ]
      lines.push(line.join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-sheet-${month}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #attendance-sheet-print, #attendance-sheet-print * { visibility: visible !important; }
          #attendance-sheet-print { position: absolute !important; left: 0; top: 0; width: 100% !important; margin: 0 !important; padding: 16px !important; }
          .no-print { display: none !important; }
          #attendance-sheet-print table { font-size: 9px !important; }
          #attendance-sheet-print th, #attendance-sheet-print td { padding: 3px 4px !important; border: 1px solid #999 !important; }
          @page { size: landscape; margin: 8mm; }
        }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white no-print">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-100">{selfOnly ? 'My Attendance Sheet' : 'Employee Attendance Sheet'}</p>
            <h2 className="text-2xl font-bold mt-1">{monthLabel}</h2>
            <p className="text-sm text-blue-100 mt-1">
              {selfOnly ? 'Your month-view punch record with totals' : `${totals.employees} employees • ${totals.present} present • ${totals.late} late • ${totals.absent} absent marks`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="month"
              value={month}
              max={defaultMonth}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              className="bg-white/20 backdrop-blur border border-white/30 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 [&::-webkit-calendar-picker-indicator]:invert"
            />
            <button onClick={() => fetchData(month)} className="bg-white/20 border border-white/30 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white/30">Refresh</button>
            <button onClick={handleCSV} disabled={rows.length === 0} className="bg-emerald-500 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-600 disabled:opacity-50">Export CSV</button>
            <button onClick={handlePrint} disabled={rows.length === 0} className="bg-white text-blue-600 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-50 disabled:opacity-50">Print</button>
          </div>
        </div>
      </div>

      {/* Filters (admin only) */}
      {!selfOnly && (
        <div className="flex flex-col lg:flex-row gap-3 justify-between no-print">
          <div className="flex gap-3 flex-wrap items-center">
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800">
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.dep_name}</option>
              ))}
            </select>
            {(search || deptFilter) && (
              <button onClick={() => { setSearch(''); setDeptFilter('') }} className="text-xs text-blue-600 underline">Clear</button>
            )}
          </div>
          <div className="relative max-w-xs w-full">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search name, ID or dept..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-xl py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold no-print">
        {[['P', 'Present', 'bg-emerald-100 text-emerald-700'], ['L', 'Late', 'bg-amber-100 text-amber-700'], ['A', 'Absent', 'bg-red-100 text-red-600'], ['LV', 'On Leave', 'bg-blue-100 text-blue-700'], ['HD', 'Half Day', 'bg-purple-100 text-purple-700'], ['-', 'No record', 'bg-gray-100 text-gray-400']].map(([code, label, cls]) => (
          <span key={code} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cls}`}><span className="font-bold">{code}</span> {label}</span>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <svg className="w-10 h-10 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <p className="text-sm text-gray-400">Loading sheet...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-5 py-4 text-sm text-red-600 dark:text-red-400 no-print">{error}</div>
      ) : rows.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-16 text-center no-print">
          <p className="text-sm text-gray-500">No employees found</p>
          <p className="text-xs text-gray-400 mt-1">Try a different month or filter</p>
        </div>
      ) : (
        <div id="attendance-sheet-print" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Print-only title */}
          <div className="hidden print:block px-6 pt-6 pb-2 text-center" style={{ display: 'none' }}>
            <h1 className="text-lg font-bold">Employee Attendance Sheet — {monthLabel}</h1>
            <p className="text-xs text-gray-500">Generated {new Date().toLocaleString()} • P=Present L=Late A=Absent LV=Leave HD=Half-day -=No record</p>
          </div>
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between print:border-gray-300">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Attendance Sheet — {monthLabel}</h4>
            <span className="text-xs text-gray-400">{rows.length} employee{rows.length !== 1 ? 's' : ''} × {daysInMonth} days</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse" style={{ minWidth: `${220 + daysInMonth * 36 + 220}px` }}>
              <thead>
                <tr className={isDark ? 'bg-gray-700/60' : 'bg-slate-50'}>
                  <th className="sticky left-0 z-10 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-r" style={{ minWidth: 200, background: isDark ? '#374151' : '#f8fafc' }}>Employee</th>
                  {days.map((d) => (
                    <th key={d} title={new Date(year, mon - 1, d).toLocaleDateString(undefined, { weekday: 'long' })} className={`px-1 py-3 text-[11px] font-bold border-b ${isWeekend(d) ? 'text-blue-500 bg-blue-50/60 dark:bg-blue-900/10' : 'text-gray-500'}`}>
                      <div className="leading-tight">{d}</div>
                      <div className="text-[9px] font-medium opacity-70">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(year, mon - 1, d).getDay()]}</div>
                    </th>
                  ))}
                  <th className="px-2 py-3 text-[11px] font-bold uppercase text-emerald-600 border-b border-l">P</th>
                  <th className="px-2 py-3 text-[11px] font-bold uppercase text-amber-600 border-b">L</th>
                  <th className="px-2 py-3 text-[11px] font-bold uppercase text-red-500 border-b">A</th>
                  <th className="px-2 py-3 text-[11px] font-bold uppercase text-blue-600 border-b">LV</th>
                  <th className="px-2 py-3 text-[11px] font-bold uppercase text-purple-600 border-b">HD</th>
                  <th className="px-2 py-3 text-[11px] font-bold uppercase text-gray-500 border-b">Hrs</th>
                  <th className="px-2 py-3 text-[11px] font-bold uppercase text-gray-500 border-b">%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ emp, cells, present, late, absent, leave, half, hours, attendancePct }) => (
                  <tr key={emp._id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-slate-50/60 dark:hover:bg-gray-700/20">
                    <td className="sticky left-0 z-10 px-4 py-2.5 text-left border-r" style={{ background: isDark ? '#1f2937' : '#fff', minWidth: 200 }}>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{emp.name || 'Unknown'}</p>
                      <p className="text-[11px] text-gray-400 truncate">{emp.employeeId || ''} • {emp.dep_name || '—'}</p>
                    </td>
                    {cells.map((c) => (
                      <td
                        key={c.day}
                        title={c.rec ? `${new Date(c.rec.date).toLocaleDateString()} — ${c.status}${c.rec.checkIn ? ` • In ${new Date(c.rec.checkIn).toLocaleTimeString()}` : ''}${c.rec.checkOut ? ` • Out ${new Date(c.rec.checkOut).toLocaleTimeString()}` : ''}` : `${month}-${String(c.day).padStart(2, '0')} — no record`}
                        className={`px-1 py-2 text-[11px] font-bold ${c.status ? CELL_STYLE[c.status] || '' : isFuture(c.day) ? 'text-gray-200 dark:text-gray-700' : isWeekend(c.day) ? 'text-gray-300 dark:text-gray-600 bg-slate-50/50 dark:bg-gray-700/10' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        {c.status ? (CODE[c.status] || c.status) : '-'}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-xs font-bold text-emerald-600 border-l">{present}</td>
                    <td className="px-2 py-2 text-xs font-bold text-amber-600">{late}</td>
                    <td className="px-2 py-2 text-xs font-bold text-red-500">{absent}</td>
                    <td className="px-2 py-2 text-xs font-bold text-blue-600">{leave}</td>
                    <td className="px-2 py-2 text-xs font-bold text-purple-600">{half}</td>
                    <td className="px-2 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300">{hours || '—'}</td>
                    <td className="px-2 py-2 text-xs font-bold text-gray-700 dark:text-gray-200">{attendancePct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-gray-700 text-[11px] text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
            <span>P=Present</span><span>L=Late (after 09:15)</span><span>A=Absent</span><span>LV=On Leave</span><span>HD=Half Day</span><span>-=No record</span>
            <span className="ml-auto">%= (P + L + HD×0.5) ÷ days in month</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceSheet
