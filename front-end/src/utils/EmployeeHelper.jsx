import axios from "axios";
import { useState } from "react";
import { API_URL } from "./api";
import { useNavigate } from "react-router-dom";

const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");


export const fetchDepartments = async () => {
  let departments = [];
  const token = getToken();
  
  if (!token) {
    console.warn("No authentication token found");
    return departments;
  }

  try {
    const response = await axios.get(`${API_URL}/api/department`, {
      headers: { authorization: `Bearer ${token}` },
    });
    
    if (response.data.success) {
      departments = response.data.departments;
    }
  } catch (error) {
    const message = error.response?.data?.error || "Failed to fetch departments";
    alert(message);
  }
  return departments;
};


export const getEmployees = async (id) => {
  let employees = [];
  const token = getToken();

  if (!token || !id) {
    console.warn("Missing token or department ID");
    return employees;
  }

  try {
    const response = await axios.get(`${API_URL}/api/employee/department/${id}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    
    if (response.data.success) {
      employees = response.data.employees;
    }
  } catch (error) {
    const message = error.response?.data?.error || "Failed to fetch employees";
    alert(message);
  }
  return employees;
};

const ProfileAvatar = ({ row }) => {
  const [failed, setFailed] = useState(false);

  const src = row.profilePicture?.startsWith("data:")
    ? row.profilePicture
    : row.profilePicture 
      ? `${API_URL}/uploads/${row.profilePicture}` 
      : null;

  if (!src || failed) {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-sm font-semibold text-blue-600">
        {row.name?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={row.name || "Employee"} 
      className="w-10 h-10 rounded-full object-cover border border-gray-100" 
      onError={() => setFailed(true)} 
    />
  );
};

export const columns = [
  {
    name: "Profile",
    selector: row => row.profilePicture,
    sortable: false,
    center: true,
    cell: row => <ProfileAvatar row={row} />
  },
  {
    name: "SNo.",
    selector: row => row.sno,
    sortable: true,
    center: true
  },
  {
    name: "Employee Name",
    selector: row => row.name,
    sortable: true,
    center: true
  },
  {
    name: "Email",
    selector: row => row.email,
    sortable: true,
    center: true
  },
  {
    name: "Department",
    selector: row => row.dep_name,
    sortable: true,
    center: true
  },
  {
    name: "Salary",
    selector: row => row.salary,
    sortable: true,
    center: true,
    cell: row => "₱" + Number(row.salary).toLocaleString()
  },
  {
    name: "Action",
    selector: row => row.action,
    sortable: true,
    center: true,
    minWidth: "310px",
    allowOverflow: true
  }
];


export const EmployeeButtons = ({ 
  row, 
  onView, 
  onEdit, 
  onSalary, 
  onDelete, 
  onLeave 
}) => {
  const navigate = useNavigate();
  
  const handleLeave = () => {
    if (row?.id) {
      navigate(`/admin-dashboard/employee/leave/${row.id}`);
    } else {
      console.warn("Employee ID not found");
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
 
      <button
        type="button"
        onClick={onView}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        View
      </button>

  
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
        Edit
      </button>

      
      <button
        type="button"
        onClick={onSalary}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Salary
      </button>

  
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-lg transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        Delete
      </button>

     
      {onLeave && (
        <button
          type="button"
          onClick={handleLeave}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Leave
        </button>
      )}
    </div>
  );
};