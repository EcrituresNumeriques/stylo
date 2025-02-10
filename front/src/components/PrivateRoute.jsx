import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useActiveUserId } from '../hooks/user'

export default function PrivateRoute({
  children,
  redirectTo = '/login',
  withOutlet = false,
}) {
  const activeUserId = useActiveUserId()
  const location = useLocation()

  return activeUserId ? (
    withOutlet ? (
      <Outlet />
    ) : (
      children
    )
  ) : (
    <Navigate to={redirectTo} state={{ returnTo: location }} />
  )
}
