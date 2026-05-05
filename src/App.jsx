import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { LoadingBlock } from './components/layout/AsyncState'
import { useAuth } from './lib/authContext'
import { ApiStatusPage } from './pages/admin/ApiStatus'
import { AdminBuildingsPage } from './pages/admin/AdminBuildings'
import { AdminBuildingDetailsPage } from './pages/admin/AdminBuildingDetails'
import { AdminSpacesPage } from './pages/admin/AdminSpaces'
import { AdminUsersPage } from './pages/admin/AdminUsers'
import { DashboardPage } from './pages/Dashboard'
import { LoginPage } from './pages/Login'
import { MyBookingsPage } from './pages/MyBookings'
import { NewBookingPage } from './pages/NewBooking'
import { NotificationsPage } from './pages/Notifications'
import { ProfilePage } from './pages/Profile'
import { SearchSpacesPage } from './pages/SearchSpaces'
import { SpaceDetailsPage } from './pages/SpaceDetails'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/espacos" element={<SearchSpacesPage />} />
          <Route path="/espacos/:spaceId" element={<SpaceDetailsPage />} />
          <Route path="/reservas/nova" element={<NewBookingPage />} />
          <Route path="/reservas" element={<MyBookingsPage />} />
          <Route path="/notificacoes" element={<NotificationsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin/espacos" element={<AdminSpacesPage />} />
            <Route path="/admin/predios" element={<AdminBuildingsPage />} />
            <Route path="/admin/predios/:buildingId" element={<AdminBuildingDetailsPage />} />
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            <Route path="/configuracoes/api" element={<ApiStatusPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

function RequireAuth() {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-paper px-5 py-10">
        <LoadingBlock label="Carregando sessao..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

function RequireAdmin() {
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
