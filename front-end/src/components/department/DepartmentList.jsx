import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/api";

function DepartmentList() {
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
        setDepartments(response.data.departments);
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
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      const response = await axios.delete(`${API_URL}/api/department/${id}`, authHeader);
      if (response.data.success) {
        setDepartments((prev) => prev.filter((dept) => dept._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete department");
    }
  };

  const filtered = departments.filter((dept) =>
    dept.dep_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Manage Departments
      </h3>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            className="w-full border border-blue-100 bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
          />
        </div>

        <Link
          to="/admin-dashboard/add-department"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 active:scale-[0.98] shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Department
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
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-sm text-gray-500">No departments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all p-5 flex flex-col gap-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zM1.5 4h13a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5z" />
                  </svg>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {dept.dep_name}
                </h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{dept.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  Added {new Date(dept.createAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(dept._id)}
                  className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DepartmentList;
