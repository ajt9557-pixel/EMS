import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/api";
import Datatable from 'react-data-table-component';
import { colums, DepartmentButtons } from '../../utils/departmenthelpers';
import { useTheme } from '../../context/ThemeContext';

function DepartmentList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [departments, setDepartments] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const authHeader = { headers: { authorization: `Bearer ${token}` } };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/department`, authHeader);
      if (response.data.success) {
       const data = response.data.departments;
       setDepartments(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("ANO DEDELETEMOOO??")) return;
    try {
      const response = await axios.delete(`${API_URL}/api/department/${id}`, authHeader);
      if (response.data.success) {
        setDepartments((prev) => prev.filter((dept) => dept._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.error || "failed ka boi");
    }
  };

  const filtered = departments.filter((dept) =>
    dept.dep_name.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filtered.map((dept, index) => ({
    _id: dept._id,
    sno: index + 1,
    dep_name: dept.dep_name,
    action: (
      <DepartmentButtons
        onEdit={() => navigate(`/admin-dashboard/department-dashboard/${dept._id}`)}
        onDelete={() => handleDelete(dept._id)}
      />
    )
  }))

  const statCards = [
    { label: "Total Departments", value: departments.length, color: "from-blue-500 to-blue-600" },
    { label: "Filtered", value: rows.length, color: "from-indigo-500 to-purple-600" },
  ]

  return (
    <div className="space-y-6">
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
              <p className="text-sm font-medium text-blue-100">Manage Departments</p>
              <h2 className="text-2xl font-bold mt-1">Departments</h2>
              <p className="text-sm text-blue-100 mt-1">Organize and manage your company departments</p>
            </div>
          </div>
          <Link
            to="/admin-dashboard/add-department"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all duration-200 active:scale-[0.98] shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add New Department
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-5 group hover:shadow-md transition-shadow duration-200">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.color} rounded-bl-[3rem] opacity-10 group-hover:opacity-20 transition-opacity`} />
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 w-full">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Dep name..."
              className="w-full border border-blue-100 dark:border-gray-600 bg-white dark:bg-gray-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
            />
          </div>
          {!loading && !error && (
            <span className="shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 px-3 py-2 rounded-xl">
              {rows.length} department{rows.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

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
          <Datatable
            columns={colums}
            data={rows}
            keyField="_id"
            pagination
            highlightOnHover
            responsive
            noDataComponent={
              <div className="py-16 text-center">
                <div className="text-4xl mb-3 text-gray-300">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No departments found.</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different search or add a new department.</p>
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
                pageButtonsStyle: {
                  borderRadius: "8px",
                  color: isDark ? "#9ca3af" : "#475569",
                  fill: isDark ? "#9ca3af" : "#475569",
                  margin: "0 2px",
                  "&:hover:not(:disabled)": {
                    backgroundColor: isDark ? "#1e3a5f" : "#eff6ff",
                    color: isDark ? "#60a5fa" : "#2563eb",
                    fill: isDark ? "#60a5fa" : "#2563eb",
                  },
                  "&:focus": {
                    outline: "none",
                    backgroundColor: isDark ? "#1e3a5f" : "#eff6ff",
                    color: isDark ? "#60a5fa" : "#2563eb",
                    fill: isDark ? "#60a5fa" : "#2563eb",
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default DepartmentList;
