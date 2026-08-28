import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/app.store'
import MainLayout from '@/app/layouts/MainLayout'
import AuthLayout from '@/app/layouts/AuthLayout'
import LoginPage from '@/pages/login/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import HearingListPage from '@/pages/hearings/HearingListPage'
import HearingCreatePage from '@/pages/hearings/HearingCreatePage'
import HearingDetailPage from '@/pages/hearings/HearingDetailPage'
import HearingEditPage from '@/pages/hearings/HearingEditPage'
import UserListPage from '@/pages/users/UserListPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import SettingsPage from '@/pages/settings/SettingsPage'
import WaitingRoomPage from '@/pages/waiting-room/WaitingRoomPage'
import AuditLogPage from '@/pages/audit-log/AuditLogPage'
import LandingPage from '@/pages/public/LandingPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/hearings" element={<HearingListPage />} />
        <Route path="/hearings/new" element={<HearingCreatePage />} />
        <Route path="/hearings/:id" element={<HearingDetailPage />} />
        <Route path="/hearings/:id/edit" element={<HearingEditPage />} />
        <Route path="/hearings/:id/waiting-room" element={<WaitingRoomPage />} />
        <Route path="/audit-logs" element={<AuditLogPage />} />
        <Route path="/users" element={<UserListPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
