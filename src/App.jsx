import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ApiStatusPage } from './pages/admin/ApiStatus'
import { AdminBuildingsPage } from './pages/admin/AdminBuildings'
import { AdminSpacesPage } from './pages/admin/AdminSpaces'
import { AdminUsersPage } from './pages/admin/AdminUsers'
import { DashboardPage } from './pages/Dashboard'
import { MyBookingsPage } from './pages/MyBookings'
import { NewBookingPage } from './pages/NewBooking'
import { NotificationsPage } from './pages/Notifications'
import { SearchSpacesPage } from './pages/SearchSpaces'
import { SpaceDetailsPage } from './pages/SpaceDetails'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/espacos" element={<SearchSpacesPage />} />
        <Route path="/espacos/:spaceId" element={<SpaceDetailsPage />} />
        <Route path="/reservas/nova" element={<NewBookingPage />} />
        <Route path="/reservas" element={<MyBookingsPage />} />
        <Route path="/notificacoes" element={<NotificationsPage />} />
        <Route path="/admin/espacos" element={<AdminSpacesPage />} />
        <Route path="/admin/predios" element={<AdminBuildingsPage />} />
        <Route path="/admin/usuarios" element={<AdminUsersPage />} />
        <Route path="/configuracoes/api" element={<ApiStatusPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
