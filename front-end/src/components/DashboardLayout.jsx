import React from 'react'
const DashboardLayout = ({ sidebar, children }) => {
  return (
    <div>
      {sidebar}
      <div className="ml-64 min-h-screen relative overflow-hidden">
        
  
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center p-10">
          <img 
            src="/pics/aiics.jpg" 
            alt="" 
             className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-plus-lighter opacity-10 dark:opacity-5"
          />
        </div>

         <div className="relative z-10 min-h-screen bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">
          {children}
        </div>

      </div>
    </div>
  )
}

export default DashboardLayout