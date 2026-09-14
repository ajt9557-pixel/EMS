import React, { useEffect, useState } from 'react'
import { fetchDepartments, getEmployees } from "../../utils/EmployeeHelper.jsx";
import axios from 'axios'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { API_URL } from '../../utils/api'

const Add = () => {
    const navigate = useNavigate()
    const { id: preselectedId } = useParams()
    const [departments, setDepartments] = useState([])
    const [employees, setEmployees] = useState([])
    const [formData, setFormData] = useState({})

    const getAuthHeader = () => {
        const t = localStorage.getItem('token') || sessionStorage.getItem('token');
        return { headers: { authorization: `Bearer ${t}` } };
    };

    useEffect(() => {
        const loadDepartments = async () => {
            const depts = await fetchDepartments()
            if (depts) setDepartments(depts)
        }
        loadDepartments()
    }, [])

    // If navigated via /add-salary/:id, preselect that employee's department & employee
    useEffect(() => {
        if (!preselectedId || departments.length === 0) return
        // preselectedId is mongo _id (24 hex) – we try to fetch employee via api to discover its department
        const preselect = async () => {
            const t = localStorage.getItem('token') || sessionStorage.getItem('token')
            if (!t) return
            try {
                const base = API_URL.replace(/\/$/, '')
                // Try get employee via /api/employee/:id (reusing existing endpoint)
                const res = await axios.get(`${base}/api/employee/${preselectedId}`, { headers: { authorization: `Bearer ${t}` } })
                if (res.data?.employee) {
                    const emp = res.data.employee
                    // emp.department may be id or object
                    const deptId = typeof emp.department === 'object' ? emp.department._id : emp.department
                    if (deptId) {
                        setFormData(prev => ({ ...prev, department: deptId, employeeId: preselectedId }))
                        const emps = await getEmployees(deptId)
                        setEmployees(emps)
                    } else {
                        setFormData(prev => ({ ...prev, employeeId: preselectedId }))
                    }
                } else {
                    // fallback: just set employeeId, user can pick department manually
                    setFormData(prev => ({ ...prev, employeeId: preselectedId }))
                }
            } catch (e) {
                // fallback: just set employeeId
                setFormData(prev => ({ ...prev, employeeId: preselectedId }))
            }
        }
        preselect()
    }, [preselectedId, departments])

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
        // Validate required fields client-side to avoid Vercel 400 with unclear error
        if (!formData.employeeId) return alert("Please select an employee");
        if (formData.basicSalary === undefined || formData.basicSalary === "") return alert("Basic salary is required");
        if (!formData.payDate) return alert("Pay date is required");
        try {
            const base = API_URL.replace(/\/$/, '');
            const payload = {
                employeeId: formData.employeeId,
                basicSalary: formData.basicSalary,
                allowances: formData.allowances || 0,
                deductions: formData.deductions || 0,
                payDate: formData.payDate,
            };
            const response = await axios.post(`${base}/api/salary/add`, payload, getAuthHeader())
            if (response.data.success) {
                navigate('/admin-dashboard/salary-dashboard')
            } else {
                alert(response.data.error || "Failed to add salary");
            }
        } catch (error) {
            const msg = error.response?.data?.error || error.message || "Failed to add salary";
            alert(msg);
        }
    }

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-8">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back
                </button>
                
                   

                <div className="flex flex-col items-center gap-3 mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 border-4 border-blue-100 dark:border-blue-800 shadow-xl flex items-center justify-center overflow-hidden p-1.5">
                            <img
                                src="/pics/aics.jpg"
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