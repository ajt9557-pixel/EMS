import React from 'react'
import { useAuth } from "../../context/authcontext";

const Navbar = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
  
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    
    
    if (logout) logout()
  }

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm h-16 flex justify-between items-center px-6">
      <h3 className="text-lg font-semibold text-gray-700">
        Welcome, <span className="text-blue-600 font-bold">{user?.name}</span>
      </h3>
      
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
      >

        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        Logout
      </button>
    </div>
  )
}

export default Navbar