import React from 'react'
import { useAuth } from '../context/authcontext.jsx'
import { Navigate } from 'react-router-dom'

const RoleBasedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (!requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" />
  }

  return children
}

export default RoleBasedRoute