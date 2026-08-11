import React from 'react'
import {useAuth} from '../context/authcontext.jsx'

const EmployeeDashboard = () => {
  const {user} = useAuth()
  return (
    <div>EmployeeDashboard</div>
  )
}

export default EmployeeDashboard