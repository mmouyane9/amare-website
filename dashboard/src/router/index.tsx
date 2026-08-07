import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import LoginPage from '@/pages/Login'
import DashboardPage from '@/pages/Dashboard'
import MembersPage from '@/pages/Members'
import MembershipRequestsPage from '@/pages/MembershipRequests'
import NewsPage from '@/pages/News'
import UpdatesPage from '@/pages/Updates'
import CompetitionPage from '@/pages/Competition'
import StorePage from '@/pages/Store'
import ContentEditorPage from '@/pages/ContentEditor'
import BranchesPage from '@/pages/Branches'
import RegionDetailsPage from '@/pages/Branches/RegionDetails'
import CityDetailsPage from '@/pages/Branches/CityDetails'
import NavbarPage from '@/pages/Navigation/Navbar'
import FooterPage from '@/pages/Navigation/Footer'
import PagesPage from '@/pages/Pages'
import ControlPanelPage from '@/pages/ControlPanel'
import NotFoundPage from '@/pages/NotFound'
import UnauthorizedPage from '@/pages/Unauthorized'

const appRoutes = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/members', element: <MembersPage /> },
  { path: '/membership-requests', element: <MembershipRequestsPage /> },
  { path: '/news', element: <NewsPage /> },
  { path: '/updates', element: <UpdatesPage /> },
  { path: '/competition', element: <CompetitionPage /> },
  { path: '/branches', element: <BranchesPage /> },
  { path: '/store', element: <StorePage /> },
  { path: '/content-editor', element: <ContentEditorPage /> },
  { path: '/navigation/navbar', element: <NavbarPage /> },
  { path: '/navigation/footer', element: <FooterPage /> },
  { path: '/pages', element: <PagesPage /> },
  { path: '/settings', element: <ControlPanelPage /> },
  { path: '/control-panel', element: <ControlPanelPage /> },
]

export default function AppRouter() {
  const { isAuthenticated, authLoading } = useAuth()

  return (
    <BrowserRouter>
      {authLoading ? (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
            }
          />

          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute roles={['super_admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/branches/:regionId" element={<RegionDetailsPage />} />
              <Route path="/branches/:regionId/cities/:cityId" element={<CityDetailsPage />} />
              {appRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}
