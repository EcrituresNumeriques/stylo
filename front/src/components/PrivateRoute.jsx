import React from 'react'
import { useSelector } from 'react-redux'
import { Route } from 'react-router-dom'

import Login from './Login'

function PrivateRoute ({ children, ...rest }) {
  const loggedIn = useSelector(state => state.loggedIn)

  return (
    <Route
      {...rest}
      render={({ location }) =>
        loggedIn ? (children) : (<Login from={location} />)
      } />
  )
}

export default PrivateRoute
