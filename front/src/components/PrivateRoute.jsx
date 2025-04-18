import React from 'react'
import { Route } from 'react-router-dom'
import { useActiveUserId } from '../hooks/user.js'

import Login from './Login'

function PrivateRoute({ children, component, ...rest }) {
  const userId = useActiveUserId()

  return (
    <Route
      {...rest}
      render={({ location }) =>
        userId ? (
          component ? (
            React.createElement(component, rest, children)
          ) : (
            children
          )
        ) : (
          <Login from={location} />
        )
      }
    />
  )
}

export default PrivateRoute
