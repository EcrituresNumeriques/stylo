import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useActiveUserId } from '../hooks/user.js'

/**
 * @param {{redirectTo: string, withOutlet: boolean} & React.PropsWithChildren} props
 * @returns {React.ReactElement}
 */
export default function PrivateRoute({
  redirectTo = '/login',
}) {
  const activeUserId = useActiveUserId()
  const location = useLocation()

  return activeUserId ? (
      <Outlet />
  ) : (
    <Navigate to={redirectTo} state={{ returnTo: location }} />
  )
}