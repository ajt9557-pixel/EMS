import React, { useEffect } from 'react'
import { useState } from 'react'
import { fetchDepartments } from "../../utils/EmployeeHelper.jsx";
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../utils/api'

const AddLeave = () => {
  const [leave,setLeave] = useState({})

    const navigate = useNavigate()
    const [departments, setDepartments] = useState([])
    const [formdata, setFormData] = useState({})
    useEffect(() =>{
         const loadDepartments = async () => {
             const depts = await fetchDepartments()
             if (depts) setDepartments(depts)
         }
         loadDepartments()
    }, [])

   const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
        setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
    };
    const handleSubmit = async (e) => {
        e.preventDefault()
       
        const formDataObj = new FormData();
        Object.keys(formdata).forEach((key) => {
            formDataObj.append(key, formdata[key]);
        })
        try{
            const response = await axios.post(`${API_URL}/api/employee/add`,
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
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <button
          type="button"
          onClick={() => navigate('/employee-dashboard/Leaves')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Manage Leaves
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
         
          <p className="text-sm text-gray-500 text-center">
            Enter your Reason to Leave.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">From Date:</label>
              <input
                type="date"
                name="dob"
                onChange={handleChange}
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">To Date:</label>
              <input
                type="date"
                name="dob"
                onChange={handleChange}
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Leace Type</label>
              <select
                name="gender"
                onChange={handleChange}
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              >
                <option value="">Select a Leave type</option>
                <option value="male">sick leave</option>
                <option value="female">casual leave</option>
                <option value="female">annual leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Reason</label>
              <input
                type="description"
                name="reason"
                onChange={handleChange} 
                className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 active:scale-[0.98]"
          >
            Add Employee
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddLeave
