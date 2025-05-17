// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedRoute() {
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const { has_agreed_terms, has_set_name } = user || {}

  const isAuthenticated = user?.id && typeof has_agreed_terms === 'boolean' && typeof has_set_name === 'boolean'

  if (!isAuthenticated) return <Navigate to="/" replace />

  // Trying to access /terms but terms already agreed
  if (location.pathname === '/terms' && has_agreed_terms) {
    return <Navigate to={has_set_name ? '/main' : '/create-account'} replace />
  }

  // Trying to access /create-account but terms not agreed
  if (location.pathname === '/create-account' && !has_agreed_terms) {
    return <Navigate to="/terms" replace />
  }

  // Trying to access /create-account but name already set
  if (location.pathname === '/create-account' && has_set_name) {
    return <Navigate to="/main" replace />
  }

  // Trying to access /main but onboarding incomplete
  if (location.pathname === '/main' && (!has_agreed_terms || !has_set_name)) {
    return <Navigate to={!has_agreed_terms ? '/terms' : '/create-account'} replace />
  }

  return <Outlet />
}
