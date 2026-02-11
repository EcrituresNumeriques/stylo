import { Navigate, Outlet, useLocation, useRouteLoaderData } from 'react-router'

export default function RedirectIfAuth() {
  const { user } = useRouteLoaderData('app')
  const location = useLocation()

  const returnTo = location.state?.returnTo ?? '/articles'
  return user ? <Navigate to={returnTo} replace /> : <Outlet />
}
