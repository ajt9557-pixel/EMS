import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'
import PrivateRoutes from './utils/privateRoutes.jsx'
import RoleBaseRoutes from './utils/RoleBaseRoutes.jsx'

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
        } />
      <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
    </Routes>
  )
}

export default App