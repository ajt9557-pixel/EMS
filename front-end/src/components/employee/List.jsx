import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/api";
import Datatable from 'react-data-table-component';
import { colums, EmployeeButtons } from '../../utils/EmployeeHelper';

function List() {
  const navigate = useNavigate();
  const [employees, setEmployees] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const authHeader = { headers: { authorization: `Bearer ${token}` } };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/employee`, authHeader);
      if (response.data.success) {
        setEmployees(response.data.employees);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const response = await axios.delete(`${API_URL}/api/employee/${id}`, authHeader);
      if (response.data.success) {
        setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete employee");
    }
  };

  const filtered = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filtered.map((emp, index) => ({
    _id: emp._id,
    sno: index + 1,
    name: emp.name,
    email: emp.email,
    profilePicture: emp.profilePicture,
    dep_name: emp.dep_name,
    salary: emp.salary,
    action: (
      <EmployeeButtons
        onEdit={() => navigate(`/admin-dashboard/employee/${emp._id}`)}
        onDelete={() => handleDelete(emp._id)}
      />
    )
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white border-4 border-blue-100 shadow-xl shadow-blue-100 flex items-center justify-center overflow-hidden p-1.5">
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
          Manage Employees
        </h3>
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
              placeholder="Search by Employee name..."
              className="w-full border border-blue-100 bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
            />
          </div>
          {!loading && !error && (
            <span className="shrink-0 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
              {rows.length} employee{rows.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <Link
          to="/admin-dashboard/add-employee"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 active:scale-[0.98] shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Employee
        </Link>
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
                <p className="text-sm text-gray-500">No employees found.</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search or add a new employee.</p>
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
                pageButtonsStyle: {
                  borderRadius: "8px",
                  color: "#475569",
                  fill: "#475569",
                  margin: "0 2px",
                  "&:hover:not(:disabled)": {
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    fill: "#2563eb",
                  },
                  "&:focus": {
                    outline: "none",
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    fill: "#2563eb",
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

export default List;
