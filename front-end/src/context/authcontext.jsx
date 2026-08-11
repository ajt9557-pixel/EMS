import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import Adminsidebar from '../components/dashboard/Adminsidebar'
import { API_URL } from '../utils/api'

const AuthContext = createContext()

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
     if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`${API_URL}/api/auth/verify`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })
        if (response.data.success) {
          setUser(response.data.user)
        }
        else {
          setUser(null);
          setLoading(false)
        }
      } catch (error) {
        setUser(null)
      }finally {
        setLoading(false)
      }
    }
    verifyUser()
  }, [])

  const login = (userData) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout ,loading}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export default AuthProvider