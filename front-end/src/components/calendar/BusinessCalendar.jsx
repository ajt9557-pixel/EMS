import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import { useAuth } from '../../context/authcontext'

const typeColors = {
  business_meeting: "bg-blue-500",
  training: "bg-emerald-500",
  holiday: "bg-red-500",
  deadline: "bg-amber-500",
  other: "bg-gray-500",
  general: "bg-indigo-500",
}

const typeLabels = {
  business_meeting: "Business Meeting",
  training: "Training",
  holiday: "Holiday",
  deadline: "Deadline",
  other: "Other",
  general: "General",
}

// Local-date helpers: never use toISOString() for calendar days — it shifts
// the day in UTC+ timezones. Use local year/month/day instead.
const toDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const todayStr = () => toDateStr(new Date())
const parseDateStr = (s) => {
  const [y, m, dd] = String(s).slice(0, 10).split("-").map(Number)
  return new Date(y, m - 1, dd)
}
const dayStrOf = (v) => toDateStr(new Date(v))

const BusinessCalendar = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [current, setCurrent] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1) })
  const [meetings, setMeetings] = useState([])
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: "", description: "", date: todayStr(), startTime: "09:00", endTime: "10:00", type: "business_meeting", location: "" })
  const [loading, setLoading] = useState(false)

  const getAuthHeader = () => {
    const t = localStorage.getItem("token") || sessionStorage.getItem("token")
    return { headers: { authorization: `Bearer ${t}` } }
  }
  const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`

  const fetchAll = async () => {
    setLoading(true)
    try {
      const authHeader = getAuthHeader()
      const [meetRes, attRes, leaveRes] = await Promise.all([
        axios.get(`${API_URL}/api/meetings?month=${monthStr}`, authHeader).catch((e) => { console.log("meetings fetch failed:", e?.response?.data || e.message); return { data: { meetings: [] } } }),
        axios.get(`${API_URL}/api/attendance/my?month=${monthStr}`, authHeader).catch(() => ({ data: { records: [] } })),
        axios.get(`${API_URL}/api/leave/my-leaves`, authHeader).catch(() => ({ data: { leaves: [] } })),
      ])
      setMeetings(meetRes.data.meetings || [])
      // NOTE: /api/attendance/my 404s for admin (no employee profile) -> caught above as []
      // Admins see meetings + leaves on the calendar; per-employee attendance lives on attendance pages.
      setAttendance(attRes.data.records || [])
      // filter leaves that overlap month
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
      const l = (leaveRes.data.leaves || []).filter(lv => {
        const s = new Date(lv.startDate), e = new Date(lv.endDate)
        return e >= monthStart && s <= monthEnd && lv.status !== 'rejected'
      })
      setLeaves(l)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [monthStr])
  useEffect(() => { if (selectedDate) setForm(f => ({ ...f, date: selectedDate })) }, [selectedDate])

  const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()
  const startWeekDay = new Date(current.getFullYear(), current.getMonth(), 1).getDay()
  const cells = []
  for (let i = 0; i < startWeekDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(current.getFullYear(), current.getMonth(), d))

  const getDayEvents = (date) => {
    if (!date) return { meetings: [], hasAttendance: false, leave: null }
    const iso = toDateStr(date)
    const dayMeetings = meetings.filter(m => dayStrOf(m.date) === iso)
    const att = attendance.find(a => dayStrOf(a.date) === iso)
    const leave = leaves.find(l => {
      const s = dayStrOf(l.startDate), e = dayStrOf(l.endDate)
      return iso >= s && iso <= e
    })
    return { meetings: dayMeetings, hasAttendance: !!att, attendance: att, leave }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const authHeader = getAuthHeader()
      if (editing) {
        await axios.put(`${API_URL}/api/meetings/${editing._id}`, form, authHeader)
      } else {
        await axios.post(`${API_URL}/api/meetings/add`, form, authHeader)
      }
      setShowForm(false); setEditing(null); setForm({ title: "", description: "", date: todayStr(), startTime: "09:00", endTime: "10:00", type: "business_meeting", location: "" }); fetchAll()
    } catch (err) {
      console.log("SAVE MEETING FAILED:", err?.response?.data || err.message)
      alert(err.response?.data?.error || "Save failed") }
  }

  const handleEdit = (m) => {
    setEditing(m)
    setForm({ title: m.title, description: m.description || "", date: dayStrOf(m.date), startTime: m.startTime, endTime: m.endTime, type: m.type, location: m.location || "" })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return
    try { await axios.delete(`${API_URL}/api/meetings/${id}`, getAuthHeader()); fetchAll() } catch (err) { console.log("DELETE FAILED:", err?.response?.data || err.message); alert(err.response?.data?.error || "Delete failed") }
  }

  const selectedEvents = selectedDate ? getDayEvents(parseDateStr(selectedDate)) : null

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20"><img src="/pics/aiics.jpg" alt="" className="w-full h-full object-cover" /></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 shadow-xl flex items-center justify-center overflow-hidden p-1 shrink-0"><img src="/pics/aiics.jpg" alt="logo" className="w-full h-full object-contain rounded-full" /></div>
            <div><p className="text-sm font-medium text-blue-100">Business Calendar</p><h2 className="text-2xl font-bold mt-1">Meetings & Events</h2><p className="text-sm text-blue-100 mt-1">Business meetings, trainings, deadlines + your attendance & leaves</p></div>
          </div>
          {isAdmin && <button onClick={() => { setEditing(null); setForm({ title: "", description: "", date: selectedDate || todayStr(), startTime: "09:00", endTime: "10:00", type: "business_meeting", location: "" }); setShowForm(true) }} className="bg-white text-blue-600 px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-50">+ Add Event</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{current.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
            <div className="flex gap-2">
              <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700">‹</button>
              <button onClick={() => setCurrent(new Date())} className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Today</button>
              <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700">›</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-gray-50 dark:bg-gray-800 py-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{d}</div>
            ))}
            {cells.map((date, idx) => {
              if (!date) return <div key={idx} className="bg-white dark:bg-gray-800 min-h-[90px]" />
              const { meetings: ms, hasAttendance, leave } = getDayEvents(date)
              const isToday = new Date().toDateString() === date.toDateString()
              const isSelected = selectedDate === toDateStr(date)
              const isWeekend = date.getDay() === 0 || date.getDay() === 6
              return (
                <button key={idx} onClick={() => setSelectedDate(toDateStr(date))} className={`bg-white dark:bg-gray-800 min-h-[90px] p-2 text-left hover:bg-blue-50/60 dark:hover:bg-gray-700/40 transition-colors relative ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''} ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${isWeekend && !isToday ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`}>
                  <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}>{date.getDate()}</span>
                  <div className="mt-1 space-y-1">
                    {ms.slice(0, 2).map(m => (
                      <span key={m._id} className={`block text-[10px] leading-tight px-1.5 py-0.5 rounded-md text-white truncate ${typeColors[m.type] || 'bg-gray-500'}`}>{m.startTime} {m.title}</span>
                    ))}
                    {ms.length > 2 && <span className="block text-[10px] text-gray-500">+{ms.length - 2} more</span>}
                    {hasAttendance && <span className="block text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">Present</span>}
                    {leave && <span className="block text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold truncate">{leave.leaveType} leave</span>}
                  </div>
                  {hasAttendance && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            {Object.entries(typeLabels).map(([k, label]) => (
              <span key={k} className="inline-flex items-center gap-1.5"><span className={`w-3 h-3 rounded-full ${typeColors[k]}`} />{label}</span>
            ))}
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-300" /> Attendance</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300" /> Leave</span>
          </div>
        </div>

        {/* Detail panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
            {selectedDate ? parseDateStr(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
          </h3>
          {!selectedDate ? (
            <div className="py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl"><p className="text-sm text-gray-500">Click a date on the calendar to see events</p><p className="text-xs text-gray-400 mt-1">Meetings, attendance and leaves for that day</p></div>
          ) : (
            <div className="space-y-4">
              {selectedEvents.meetings.length === 0 && !selectedEvents.hasAttendance && !selectedEvents.leave ? (
                <div className="py-8 text-center"><p className="text-sm text-gray-500">No events for this day</p>{isAdmin && <button onClick={() => setShowForm(true)} className="mt-3 text-xs font-semibold text-blue-600 underline">Add meeting</button>}</div>
              ) : (
                <>
                  {selectedEvents.meetings.map(m => (
                    <div key={m._id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${typeColors[m.type]}`}>{typeLabels[m.type] || m.type}</span>
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-1.5">{m.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{m.startTime} – {m.endTime} {m.location && `• ${m.location}`}</p>
                          {m.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{m.description}</p>}
                          {m.department?.dep_name && <p className="text-xs text-gray-400 mt-1">Dept: {m.department.dep_name}</p>}
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => handleEdit(m)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" /></svg></button>
                            <button onClick={() => handleDelete(m._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-1 13.5a2.25 2.25 0 01-2.25 2.25H8.25A2.25 2.25 0 016 18.75l-1-13.5M10.5 9.75v6M13.5 9.75v6M9 5.25h6" /></svg></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedEvents.hasAttendance && (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Attendance</p>
                      <p className="text-sm font-semibold mt-1 capitalize">{selectedEvents.attendance.status} • {selectedEvents.attendance.workHours ? `${selectedEvents.attendance.workHours}h` : ''}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">In: {selectedEvents.attendance.checkIn ? new Date(selectedEvents.attendance.checkIn).toLocaleTimeString() : '—'} • Out: {selectedEvents.attendance.checkOut ? new Date(selectedEvents.attendance.checkOut).toLocaleTimeString() : '—'}</p>
                    </div>
                  )}
                  {selectedEvents.leave && (
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">Leave</p>
                      <p className="text-sm font-semibold mt-1 capitalize">{selectedEvents.leave.leaveType} — {selectedEvents.leave.status}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedEvents.leave.reason}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* List for month */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">All events in {current.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} ({meetings.length})</h3>
          <button onClick={fetchAll} className="text-xs font-semibold text-blue-600 border border-blue-100 dark:border-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50">Refresh</button>
        </div>
        {loading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : meetings.length === 0 ? <p className="text-sm text-gray-500 py-8 text-center">No meetings scheduled this month</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {meetings.map(m => (
              <div key={m._id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white ${typeColors[m.type]}`}>{typeLabels[m.type]}</span>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-2 truncate">{m.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{new Date(m.date).toLocaleDateString()} • {m.startTime}-{m.endTime}</p>
                {m.location && <p className="text-xs text-gray-400 mt-1">📍 {m.location}</p>}
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{m.description || 'No description'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{editing ? 'Edit Event' : 'Add Business Meeting / Event'}</h3><button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">✕</button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Title *</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Q1 Planning Meeting" className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700" /></div>
              <div className="sm:col-span-2"><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Description</label><textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Agenda, notes..." className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700" /></div>
              <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Date *</label><input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700" /></div>
              <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700">{Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Start *</label><input type="time" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700" /></div>
              <div><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">End *</label><input type="time" required value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700" /></div>
              <div className="sm:col-span-2"><label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Conference Room A / Zoom" className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700" /></div>
            </div>
            <div className="flex gap-3 justify-end"><button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700">Cancel</button><button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">{editing ? 'Update' : 'Create Event'}</button></div>
          </form>
        </div>
      )}
    </div>
  )
}

export default BusinessCalendar
