import React, { useEffect, useState } from 'react'
import { fetchDepartments, getEmployees } from "../../utils/EmployeeHelper.jsx";
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../utils/api'

const Add = () => {
    const navigate = useNavigate()
    const [departments, setDepartments] = useState([])
    const [employees, setEmployees] = useState([])
    const [formData, setFormData] = useState({})

    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const authHeader = { headers: { authorization: `Bearer ${token}` } }

    useEffect(() => {
        const loadDepartments = async () => {
            const depts = await fetchDepartments()
            if (depts) setDepartments(depts)
        }
        loadDepartments()
    }, [])

    const handleDepartmentChange = async (e) => {
        const departmentId = e.target.value
        setFormData((prev) => ({ ...prev, department: departmentId }))
        const emps = await getEmployees(departmentId)
        setEmployees(emps)
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(`${API_URL}/api/salary/add`, formData, authHeader)
            if (response.data.success) {
                navigate('/admin-dashboard/employee')
            }
        } catch (error) {
            if (error.response && !error.response.data.success) {
                alert(error.response.data.error);
            }
        }
    }

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
                
                   

                <div className="flex flex-col items-center gap-3 mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 border-4 border-blue-100 dark:border-blue-800 shadow-xl flex items-center justify-center overflow-hidden p-1.5">
                            <img
                                src="/pics/aiics.jpg"
                                alt="Company Logo"
                                className="w-full h-full object-contain rounded-full"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
                        Add Salary
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Record a new salary entry
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Department</label>
                            <select
                                name="department"
                                value={formData.department || ""}
                                onChange={handleDepartmentChange}
                                className="w-full border border-blue-100 dark:border-gray-600 bg-blue-50/40 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                                required
                            >
                                <option className="dark:bg-gray-700 dark:text-gray-200" value="">Select a Department</option>
                                {departments.map((department) => (
                                    <option className="dark:bg-gray-700 dark:text-gray-200" key={department._id} value={department._id}>{department.dep_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Employee</label>
                            <select
                                name="employeeId"
                                value={formData.employeeId || ""}
                                onChange={handleChange}
                                className="w-full border border-blue-100 dark:border-gray-600 bg-blue-50/40 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                                required
                            >
                                <option className="dark:bg-gray-700 dark:text-gray-200" value="">Select an Employee</option>
                                {employees.map((emp) => (
                                    <option className="dark:bg-gray-700 dark:text-gray-200" key={emp._id} value={emp._id}>{emp.name} - {emp.employeeId}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Basic Salary</label>
                            <input
                                type="number"
                                name="basicSalary"
                                onChange={handleChange}
                                placeholder="Basic salary"
                                className="w-full border border-blue-100 dark:border-gray-600 bg-blue-50/40 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Allowances</label>
                            <input
                                type="number"
                                name="allowances"
                                onChange={handleChange}
                                placeholder="Allowances"
                                className="w-full border border-blue-100 dark:border-gray-600 bg-blue-50/40 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Deductions</label>
                            <input
                                type="number"
                                name="deductions"
                                onChange={handleChange}
                                placeholder="Deductions"
                                className="w-full border border-blue-100 dark:border-gray-600 bg-blue-50/40 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Pay Date</label>
                            <input
                                type="date"
                                name="payDate"
                                onChange={handleChange}
                                className="w-full border border-blue-100 dark:border-gray-600 bg-blue-50/40 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 active:scale-[0.98]"
                    >
                        Add Salary
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Add