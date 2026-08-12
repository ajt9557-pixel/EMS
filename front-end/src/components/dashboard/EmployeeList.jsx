import React from 'react'
import DashboardLayout from '../DashboardLayout'
import Adminsidebar from './Adminsidebar.jsx'
import Navbar from './Navbar.jsx'

const EmployeeList = () => {
  return (
    <DashboardLayout sidebar={<Adminsidebar />}>
      <Navbar />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Employees</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Add Employee
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-700">John Doe</td>
                  <td className="px-4 py-3 text-gray-500">john@email.com</td>
                  <td className="px-4 py-3 text-gray-500">Employee</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Active</span>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-700">Jane Smith</td>
                  <td className="px-4 py-3 text-gray-500">jane@email.com</td>
                  <td className="px-4 py-3 text-gray-500">Admin</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EmployeeList
