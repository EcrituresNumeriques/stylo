import React from 'react'
import { Navigate, Outlet, useRouteLoaderData } from 'react-router'

export default function RedirectIfAuth() {
  const { user } = useRouteLoaderData('app')
  return user ? <Navigate to="/articles" replace /> : <Outlet />
}
