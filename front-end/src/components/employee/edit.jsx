import React, { useEffect } from 'react'
import { useState } from 'react'
import { fetchDepartments } from "../../utils/EmployeeHelper.jsx";
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../../utils/api'

const Edit = () => {

    const navigate = useNavigate()
    const { id } = useParams()
    const [departments, setDepartments] = useState([])
    const [employee, setEmployee] = useState({})
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const authHeader = { headers: { authorization: `Bearer ${token}` } }

    useEffect(() => {
        const loadDepartments = async () => {
            const depts = await fetchDepartments()
            if (depts) setDepartments(depts)
        }
        loadDepartments()

        const fetchEmployee = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/employee/${id}`, authHeader)
                if (response.data.success) {
                    setEmployee(response.data.employee)
                }
            } catch (error) {
                alert(error.response?.data?.error || "Failed to load employee")
            } finally {
                setLoading(false)
            }
        }
        fetchEmployee()
    }, [id])

   const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
        setEmployee((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
        setEmployee((prevData) => ({ ...prevData, [name]: value }));
    }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (employee.password && employee.password !== employee.confirmPassword) {
            alert("Passwords do not match")
            return
        }

        const formDataObj = new FormData();
        Object.keys(employee).forEach((key) => {
            if (key === 'image') {
                if (employee[key]) formDataObj.append('image', employee[key]);
            } else if (key === 'confirmPassword') {
                return;
            } else if (key === 'department') {
                const depId = employee.department?._id || employee.department;
                if (depId) formDataObj.append('department', depId);
            } else {
                formDataObj.append(key, employee[key]);
            }
        })
        try{
            const response = await axios.put(`${API_URL}/api/employee/${id}`,
             formDataObj,
             { headers: { authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
            } 
            }
            )
            if (response.data.success) {
                navigate('/admin-dashboard/employee')
            }
           
        }catch(error){
            if (error.response && !error.response.data.success) {
                alert(error.response.data.error);
              }
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
        )
    }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <button
          type="button"
          onClick={() => navigate('/admin-dashboard/employee')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Employees
        </button>

        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-blue-100 shadow-xl shadow-blue-100 flex items-center justify-center overflow-hidden p-1.5">
              <img
                src="/pics/aiics.jpg"
                alt="Company Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 text-center">
            Edit Employee
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Update employee details
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Name</label>
              <input
                type="text"
                name="name"
                value={employee.name || ""}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={employee.email || ""}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={employee.employeeId || ""}
                onChange={handleChange}
                placeholder="Employee ID"
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={employee.dob ? employee.dob.slice(0, 10) : ""}
                onChange={handleChange}
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Gender</label>
              <select
                name="gender"
                value={employee.gender || ""}
                onChange={handleChange}
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              >
                <option value="">Select a Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Marital Status</label>
              <select
                name="maritalStatus"
                value={employee.maritalStatus || ""}
                onChange={handleChange}
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              >
                <option value="">Select a Marital Status</option>
                <option value="married">Married</option>
                <option value="single">Single</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Place of Birth</label>
              <input
                type="text"
                name="placeOfBirth"
                value={employee.placeOfBirth || ""}
                onChange={handleChange}
                placeholder="Place of Birth"
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Department</label>
              <select
                name="department"
                value={employee.department?._id || employee.department || ""}
                onChange={handleChange}
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              >
                <option value="">Select a Department</option>
                {departments.map((department) => (
                    <option key={department._id} value={department._id}>{department.dep_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Salary</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">₱</span>
                <input
                  type="number"
                  name="salary"
                  value={employee.salary || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full border border-blue-100 bg-blue-50/40 rounded-xl pl-8 pr-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Role</label>
              <select
                name="role"
                value={employee.role || ""}
                onChange={handleChange}
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              >
                <option value="">Select a Role</option>
                <option value="admin">Admin</option>
                <option value="user">Employee</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Upload Photo</label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 active:scale-[0.98]"
          >
            Update Employee
          </button>
        </form>
      </div>
    </div>
  )
}

export default Edit
