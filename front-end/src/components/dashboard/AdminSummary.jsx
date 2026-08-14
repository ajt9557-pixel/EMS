import React from 'react'
import SummaryCard from './SummaryCard'


const EmployeesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
  </svg>
);

const DepartmentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zM1.5 4h13a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5z" />
  </svg>
);

const SalaryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M4 10.781c.148 1.667 1.713 2.77 3.572 2.77 1.998 0 3.53-1.165 3.53-2.828 0-1.354-1.11-2.264-2.828-2.77-1.562-.469-2.553-.894-2.553-1.86 0-.963.832-1.656 2.075-1.656 1.166 0 1.957.744 2.1 1.805h1.62c-.148-1.616-1.466-2.966-3.478-3.166V1h-1.5v1.095C4.404 2.295 3.15 3.566 3.15 5.17c0 1.656 1.435 2.578 3.15 3.047.028.008.055.016.083.023 1.538.454 2.467.906 2.467 1.79 0 .93-.862 1.63-2.21 1.63-1.356 0-2.278-.821-2.45-1.98H2.83z" />
  </svg>
);

const LeaveAppliedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
  </svg>
);

const LeaveApprovedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
  </svg>
);

const LeavePendingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
  </svg>
);

const LeaveRejectedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
  </svg>
);


const AdminSummary = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-gray-50 borfer border-gray-100  ">
       <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/pics/aiics.jpg" 
          alt="" 
          className="w-full h-full object-cover opacity-20" 
        />
      </div>
       <div className="relative z-10">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Dashboard Overview
      </h3>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard icon={EmployeesIcon} text="Total Employees" number={5} color="blue" />
        <SummaryCard icon={DepartmentsIcon} text="Total Departments" number={3} color="blue" />
        <SummaryCard icon={SalaryIcon} text="Monthly Salary" number="₱25,000" color="green" />
      </div>

   
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-bold text-gray-700 mb-4">Leave Details</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard icon={LeaveAppliedIcon} text="Leave Applied" number={2} color="blue" />
          <SummaryCard icon={LeaveApprovedIcon} text="Leave Approved" number={2} color="green" />
          <SummaryCard icon={LeavePendingIcon} text="Leave Pending" number={1} color="orange" />
          <SummaryCard icon={LeaveRejectedIcon} text="Leave Rejected" number={2} color="red" />
        </div>
      </div>
     </div>
    </div>
  )
}

export default AdminSummary