import axios from "axios";
import { API_URL } from "./api";

export const fetchDepartments = async () => {
  let departments = [];
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await axios.get(`${API_URL}/api/department`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    if (response.data.success) {
      departments = response.data.departments;
    }
  } catch (error) {
    if (error.response && !error.response.data.success) {
      alert(error.response.data.error);
    }
  }
  return departments;
};

export const colums = [
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
        center: true
    },
    {
        name: "Action",
        selector: row => row.action,
        sortable: true,
        center: true
    }
]

export const EmployeeButtons = ({ onEdit, onDelete }) => {
    return (
        <div className="flex items-center justify-center gap-2">
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
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-lg transition-colors"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
            </button>
        </div>
    )
}