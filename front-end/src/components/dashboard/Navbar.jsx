import React from 'react'
import { useAuth } from "../../context/authcontext";
import {useTheme} from '../../context/ThemeContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const {theme, toggleTheme} = useTheme()

  const handleLogout = () => {
  
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    
    
    if (logout) logout()
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 shadow-sm min-h-16 flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6 py-2 sm:py-0">
      <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[60%] sm:max-w-none">
        Welcome, <span className="text-blue-600 font-bold truncate">{user?.name}</span>
      </h3>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            )}
          </button>
          <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 sm:px-4 py-2.5 rounded-xl transition-colors min-h-[44px]"
            >

              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span className="hidden xs:inline sm:inline">Logout</span>
            </button>
      </div>
      
      
    </div>
  )
}

export default Navbar