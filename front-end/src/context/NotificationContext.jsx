import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { API_URL } from '../utils/api'
import { useAuth } from './authcontext'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])
  const prevIdsRef = React.useRef(new Set())

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token || !user) return
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        const fetched = res.data.notifications || []
        setNotifications(fetched)
        setUnreadCount(res.data.unreadCount ?? fetched.filter(n=>!n.read).length ?? 0)

        // detect new unread notifications to show as toasts
        const newUnreads = fetched.filter(n => !n.read && !prevIdsRef.current.has(String(n._id)))
        if (newUnreads.length > 0 && prevIdsRef.current.size !== 0) {
          // only toast for genuinely new ones after initial load
          setToasts(prev => [...newUnreads.slice(0, 3), ...prev].slice(0, 3))
          newUnreads.slice(0, 3).forEach(n => {
            setTimeout(() => {
              setToasts(prev => prev.filter(t => String(t._id) !== String(n._id)))
            }, 5000)
          })
        }
        prevIdsRef.current = new Set(fetched.map(n => String(n._id)))
      }
    } catch (e) {
      // silent - don't spam console for 401 during logout
      if (e.response?.status !== 401) console.log('fetch notifications error:', e.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      prevIdsRef.current = new Set()
      setToasts([])
      return
    }
    const id = setInterval(fetchNotifications, 10000) // poll every 10s
    const onFocus = () => fetchNotifications()
    const onVisibility = () => { if (document.visibilityState === 'visible') fetchNotifications() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [fetchNotifications, user])

  const markRead = async (id) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    try {
      await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
        headers: { authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch (e) { console.log('markRead failed', e.message) }
  }

  const markAllRead = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    try {
      await axios.put(`${API_URL}/api/notifications/read-all`, {}, {
        headers: { authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (e) { console.log('markAllRead failed', e.message) }
  }

  const dismiss = async (id) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    // optimistic update
    setNotifications(prev => {
      const target = prev.find(n => n._id === id)
      if (target && !target.read) setUnreadCount(c => Math.max(0, c - 1))
      return prev.filter(n => n._id !== id)
    })
    // also remove toast if present
    setToasts(prev => prev.filter(t => String(t._id) !== String(id)))
    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      })
    } catch (e) {
      console.log('dismiss failed', e.message)
      fetchNotifications()
    }
  }

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => String(t._id) !== String(id)))
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, toasts, dismissToast, fetchNotifications, markRead, markAllRead, dismiss }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
