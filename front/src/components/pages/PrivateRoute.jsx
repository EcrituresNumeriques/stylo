import { Navigate, Outlet, useLocation, useRouteLoaderData } from 'react-router'

/**
 * @param {{redirectTo: string, withOutlet: boolean} & React.PropsWithChildren} props
 * @returns {React.ReactElement}
 */
export default function PrivateRoute({ redirectTo = '/login' }) {
  const { user } = useRouteLoaderData('app')
  const location = useLocation()

  return user ? (
    <Outlet />
  ) : (
    <Navigate to={redirectTo} state={{ returnTo: location }} replace />
  )
}
