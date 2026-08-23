import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import Datatable from 'react-data-table-component'

const columns = [
    {
        name: "SNo.",
        selector: row => row.sno,
        sortable: true,
        center: true
    },
    {
        name: "Basic Salary",
        selector: row => row.basicSalary,
        sortable: true,
        center: true,
        cell: row => "\u20B1" + Number(row.basicSalary).toLocaleString()
    },
    {
        name: "Allowances",
        selector: row => row.allowances,
        sortable: true,
        center: true,
        cell: row => "\u20B1" + Number(row.allowances).toLocaleString()
    },
    {
        name: "Deductions",
        selector: row => row.deductions,
        sortable: true,
        center: true,
        cell: row => "\u20B1" + Number(row.deductions).toLocaleString()
    },
    {
        name: "Net Salary",
        selector: row => row.netSalary,
        sortable: true,
        center: true,
        cell: row => "\u20B1" + Number(row.netSalary).toLocaleString()
    },
    {
        name: "Pay Date",
        selector: row => row.payDate,
        sortable: true,
        center: true,
        cell: row => new Date(row.payDate).toLocaleDateString()
    }
]

const SalaryList = ({ selfService = false }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isAdminRoute = location.pathname.startsWith('/admin-dashboard')
    const [salaries, setSalaries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const authHeader = { headers: { authorization: `Bearer ${token}` } }
    const endpoint = selfService ? `${API_URL}/api/salary/my` : `${API_URL}/api/salary/${id}`

    useEffect(() => {
        const fetchSalaries = async () => {
            try {
                const response = await axios.get(endpoint, authHeader)
                if (response.data.success) {
                    setSalaries(response.data.salaries)
                }
            } catch (err) {
                setError(err.response?.data?.error || "Failed to load salaries")
            } finally {
                setLoading(false)
            }
        }
        fetchSalaries()
    }, [id, endpoint, selfService])

    const rows = salaries.map((s, index) => ({
        _id: s._id,
        sno: index + 1,
        basicSalary: s.basicSalary,
        allowances: s.allowances,
        deductions: s.deductions,
        netSalary: s.netSalary,
        payDate: s.payDate,
    }))

    return (
        <div className="space-y-6">
            {isAdminRoute && (
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-4"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Employees
                </button>
            )}

            <div className="flex flex-col items-center gap-3 mb-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-white border-4 border-blue-100 shadow-xl shadow-blue-100 flex items-center justify-center overflow-hidden p-1.5">
                        <img
                            src="/pics/aiics.jpg"
                            alt="Company Logo"
                            className="w-full h-full object-contain rounded-full"
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 border-2 border-white flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 text-center">
                    Salary Records
                </h3>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <Datatable
                        columns={columns}
                        data={rows}
                        keyField="_id"
                        pagination
                        highlightOnHover
                        responsive
                        noDataComponent={
                            <div className="py-16 text-center">
                                <p className="text-sm text-gray-500">No salary records found.</p>
                            </div>
                        }
                        paginationComponentOptions={{
                            rowsPerPageText: "Rows per page:",
                            rangeSeparatorText: "of",
                        }}
                        customStyles={{
                            headCells: {
                                style: {
                                    backgroundColor: "#f1f5f9",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    color: "#475569",
                                    justifyContent: "center",
                                    paddingLeft: "16px",
                                    paddingRight: "16px",
                                    borderBottom: "1px solid #e2e8f0",
                                },
                            },
                            cells: {
                                style: {
                                    fontSize: "14px",
                                    color: "#334155",
                                    justifyContent: "center",
                                    paddingLeft: "16px",
                                    paddingRight: "16px",
                                },
                            },
                            rows: {
                                style: {
                                    minHeight: "56px",
                                    "&:hover": {
                                        backgroundColor: "#f8fafc",
                                    },
                                },
                            },
                            pagination: {
                                style: {
                                    borderTop: "1px solid #e2e8f0",
                                    fontSize: "13px",
                                    color: "#475569",
                                    minHeight: "56px",
                                },
                            },
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export default SalaryList
