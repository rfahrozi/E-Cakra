import { Routes, Route } from 'react-router-dom'
import ProtectedRoutes from './protectedRoutes'
import LoginPage from '../pages/Auth/LoginPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import HomePage from '../pages/Home/HomePage'
import NotFoundPage from '../pages/NotFound/NotFoundPage'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
