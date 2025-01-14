import React from 'react'
import { Route } from 'react-router-dom'
import { useActiveUser } from '../stores/authStore.jsx'

import Login from './Login'

function PrivateRoute({ children, ...rest }) {
  const activeUser = useActiveUser()
  return (
    <Route
      {...rest}
      render={({ location }) =>
        activeUser ? children : <Login from={location} />
      }
    />
  )
}

export default PrivateRoute
