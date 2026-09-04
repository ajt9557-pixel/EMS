import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'
import PrivateRoutes from './privateRoutes.jsx'
import RoleBaseRoutes from './utils/RoleBaseRoutes.jsx'
import AdminSummary from './components/dashboard/AdminSummary.jsx'
import List from "./components/employee/List.jsx";
import DepartmentList from "./components/department/DepartmentList.jsx";
import AddDepartment from "./components/department/addDepartment.jsx";
import EditDepartment from "./components/department/editDepartment.jsx";
import Add from "./components/employee/Add.jsx";
import View from "./components/employee/view.jsx";
import Edit from "./components/employee/edit.jsx";
import Salary from "./components/salar/Add.jsx";
import SalaryList from "./components/salar/SalaryList.jsx";
import AddSalary from "./components/salar/Add.jsx";
import Summary from './components/EmployeeDashboard/Summary.jsx';
import LeaveList from './components/Leaves/Leavelist.jsx';
import MyProfile from './components/EmployeeDashboard/MyProfile.jsx';
import AddLeave from './components/Leaves/AddLeave.jsx';
import Settings from './components/EmployeeDashboard/Settings.jsx';
import Table from './components/Leaves/Table.jsx';
import LeaveDetails from './components/Leaves/LeaveDetails.jsx';
  
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<div className="p-8 text-center text-red-600">You are not authorized to view this page.</div>} />

      <Route path="/admin-dashboard" element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={['admin']}>
              <AdminDashboard />
            </RoleBaseRoutes>
          </PrivateRoutes>
        }>
          <Route index element={<AdminSummary />} />
          <Route path="employee" element={<List />} />
          <Route path="department-dashboard" element={<DepartmentList />} />
          <Route path="add-department" element={<AddDepartment />} />
          <Route path="department-dashboard/:id" element={<EditDepartment />} />
          <Route path="salary-dashboard" element={<Salary />} />
          <Route path="salary/:id" element={<SalaryList />} />
          <Route path="view/:id" element={<AddSalary />} />
          <Route path="addSalary/:id" element={<AddSalary />} />
          <Route path="add-employee" element={<Add/>} />
          <Route path="employee/:id/view" element={<View />} />
          <Route path="employee/edit/:id" element={<Edit/>} />
          <Route path="Leaves" element={<Table/>} />
          <Route path="leave/:id" element={<LeaveDetails />} />
        </Route>

      <Route path="/employee-dashboard" element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={['admin', 'user']}>
                <EmployeeDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }>
          <Route index element={<Summary />} />
          <Route path="Profile" element={<MyProfile />} />
          <Route path="Leaves" element={<LeaveList />} />
          <Route path="salary" element={<SalaryList selfService />} />
          <Route path="add-leave" element={<AddLeave />} />
          <Route path="Settings" element={<Settings />} />
        </Route>
    </Routes>
  )
}

export default App