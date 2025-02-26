import React from 'react'
import { useSelector } from 'react-redux'
import { Route } from 'react-router-dom'

import Login from './Login'

function PrivateRoute({ children, component, ...rest }) {
  const loggedIn = useSelector((state) => state.loggedIn)

  return (
    <Route
      {...rest}
      render={({ location }) =>
        loggedIn ? (
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
