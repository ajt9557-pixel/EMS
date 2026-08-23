import React from 'react'
import { Link } from 'react-router-dom'

const Leavelist = () => {
  return (
    <div className='p-6 space-y-6'>
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800">Manage leaves</h3>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <input
          type="text"
          placeholder="Search By Dep Name"
          className="w-full max-w-md border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
        />
        <Link
          to="/employee-dashboard/Add-leave"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 active:scale-[0.98] shrink-0"
        >
          Add Leave
        </Link>
      </div>
    </div>
  )
}

export default Leavelist