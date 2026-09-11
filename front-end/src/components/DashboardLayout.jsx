import React, { useState } from 'react'

const DashboardLayout = ({ sidebar, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-700 flex flex-col shadow-sm transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-2 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebar && React.cloneElement(sidebar, { onClose: () => setMobileOpen(false) })}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen flex flex-col relative overflow-hidden">
        {/* Background watermark */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center p-4 sm:p-10">
          <img
            src="/pics/aiics.jpg"
            alt=""
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-plus-lighter opacity-10 dark:opacity-5"
          />
        </div>

        <div className="relative z-10 flex-1 min-h-screen bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex flex-col">
          {/* Mobile hamburger - visible only on small screens, below overlay */}
          <div className="lg:hidden sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2.5 rounded-xl bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>
            <span className="font-bold text-blue-600 dark:text-blue-400 truncate">Employee MS</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout