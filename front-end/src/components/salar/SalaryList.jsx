import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import Datatable from 'react-data-table-component'
import { useTheme } from '../../context/ThemeContext'

const baseColumns = [
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
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const isAdminRoute = location.pathname.startsWith('/admin-dashboard')
    const [salaries, setSalaries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Resolve endpoint: selfService -> /my , with id -> /:id , without id (salary-dashboard) -> / (all)
    const getEndpoint = () => {
        const base = API_URL.replace(/\/$/, '');
        if (selfService) return `${base}/api/salary/my`;
        if (id) return `${base}/api/salary/${id}`;
        return `${base}/api/salary`;
    };
    const endpoint = getEndpoint();

    useEffect(() => {
        const fetchSalaries = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) {
                    setError("No authentication token found");
                    return;
                }
                const response = await axios.get(endpoint, { headers: { authorization: `Bearer ${token}` } });
                if (response.data.success) {
                    setSalaries(response.data.salaries || []);
                } else {
                    setError(response.data.error || "Failed to load salaries");
                }
            } catch (err) {
                setError(err.response?.data?.error || err.message || "Failed to load salaries");
            } finally {
                setLoading(false);
            }
        };
        fetchSalaries();
    }, [id, selfService, endpoint])

    // When showing all salaries (no id, not selfService) also show employee columns
    const isAllView = !selfService && !id;
    const columns = isAllView ? [
        baseColumns[0],
        { name: "Employee", selector: row => row.employeeName || row.employeeId || "-", sortable: true, center: true, cell: row => row.employeeName ? `${row.employeeName} (${row.employeeId || ''})` : (row.employeeId || "-") },
        { name: "Department", selector: row => row.department || "-", sortable: true, center: true },
        ...baseColumns.slice(1)
    ] : baseColumns;

    const rows = salaries.map((s, index) => ({
        _id: s._id,
        sno: index + 1,
        employeeId: s.employeeId,
        employeeName: s.employeeName,
        department: s.department,
        basicSalary: s.basicSalary,
        allowances: s.allowances,
        deductions: s.deductions,
        netSalary: s.netSalary,
        payDate: s.payDate,
    }))

    const latest = salaries[0]
    const statCards = [
        { label: "Total Records", value: salaries.length, color: "from-blue-500 to-blue-600" },
        { label: "Average Net", value: salaries.length ? "₱" + Math.round(salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0) / salaries.length).toLocaleString() : "—", color: "from-indigo-500 to-purple-600" },
        { label: "Highest Net", value: salaries.length ? "₱" + Math.max(...salaries.map(s => s.netSalary || 0)).toLocaleString() : "—", color: "from-emerald-500 to-green-600" },
        { label: "Latest Pay Date", value: latest ? new Date(latest.payDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—", color: "from-amber-500 to-orange-600" },
    ]

    const StatCard = ({ card }) => (
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-5 group hover:shadow-md transition-shadow duration-200">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} rounded-bl-[3rem] opacity-10 group-hover:opacity-20 transition-opacity`} />
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2 truncate">{card.value}</p>
        </div>
    )

    return (
        <div className="space-y-6">
            {isAdminRoute && (
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Employees
                </button>
            )}

            <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <img src="/pics/aiics.jpg" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 shadow-xl flex items-center justify-center overflow-hidden p-1 shrink-0">
                            <img
                                src="/pics/aiics.jpg"
                                alt="Company Logo"
                                className="w-full h-full object-contain rounded-full"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-100">{selfService ? 'My Salary' : 'Salary Records'}</p>
                            <h2 className="text-2xl font-bold mt-1">Salary</h2>
                            <p className="text-sm text-blue-100 mt-1">View salary history and payslips</p>
                        </div>
                    </div>
                    {isAdminRoute && !selfService && (
                        <Link
                            to={id ? `/admin-dashboard/add-salary/${id}` : "/admin-dashboard/add-salary"}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all duration-200 active:scale-[0.98] shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Salary
                        </Link>
                    )}
                </div>
            </div>

            {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card) => <StatCard key={card.label} card={card} />)}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-16">
                    <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    {isAdminRoute && !selfService && (
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Salary Records</h4>
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2.5 py-1 rounded-full">{rows.length} record{rows.length===1?'':'s'}</span>
                            </div>
                            <Link
                                to={id ? `/admin-dashboard/add-salary/${id}` : "/admin-dashboard/add-salary"}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md transition-all duration-200 active:scale-[0.98] shrink-0"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Add Salary
                            </Link>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                    <Datatable
                        columns={columns}
                        data={rows}
                        keyField="_id"
                        pagination
                        highlightOnHover
                        responsive
                        noDataComponent={
                            <div className="py-16 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">No salary records found.</p>
                                {isAdminRoute && !selfService && (
                                    <Link to={id ? `/admin-dashboard/add-salary/${id}` : "/admin-dashboard/add-salary"} className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                        Add Salary
                                    </Link>
                                )}
                            </div>
                        }
                        paginationComponentOptions={{
                            rowsPerPageText: "Rows per page:",
                            rangeSeparatorText: "of",
                        }}
                        customStyles={{
                            headCells: {
                                style: {
                                    backgroundColor: isDark ? "#1f2937" : "#f1f5f9",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    color: isDark ? "#9ca3af" : "#475569",
                                    justifyContent: "center",
                                    paddingLeft: "16px",
                                    paddingRight: "16px",
                                    borderBottom: isDark ? "1px solid #374151" : "1px solid #e2e8f0",
                                },
                            },
                            cells: {
                                style: {
                                    fontSize: "14px",
                                    color: isDark ? "#d1d5db" : "#334155",
                                    justifyContent: "center",
                                    paddingLeft: "16px",
                                    paddingRight: "16px",
                                },
                            },
                            rows: {
                                style: {
                                    minHeight: "56px",
                                    "&:hover": {
                                        backgroundColor: isDark ? "#111827" : "#f8fafc",
                                    },
                                },
                            },
                            pagination: {
                                style: {
                                    borderTop: isDark ? "1px solid #374151" : "1px solid #e2e8f0",
                                    fontSize: "13px",
                                    color: isDark ? "#9ca3af" : "#475569",
                                    minHeight: "56px",
                                },
                            },
                        }}
                    />
                    </div>
                </div>
            )}
        </div>
    )
}

export default SalaryList
