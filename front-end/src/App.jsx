import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'
import PrivateRoutes from './utils/privateRoutes.jsx'
import RoleBaseRoutes from './utils/RoleBaseRoutes.jsx'
import AdminSummary from './components/dashboard/AdminSummary.jsx'
import List from "./components/employee/List.jsx";
import  DepartmentList from "./components/department/DepartmentList.jsx";
import AddDepartment from "./components/department/addDepartment.jsx";
import EditDepartment from "./components/department/editDepartment.jsx";
import Add from "./components/employee/Add.jsx";




function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
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
               <Route path="add-employee" element={<Add/>} />
        </Route>
    </Routes>
  )
}

export default App