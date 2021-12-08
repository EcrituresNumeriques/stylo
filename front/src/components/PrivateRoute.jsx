import React from 'react'
import { useSelector } from 'react-redux'
import { Route } from 'react-router-dom'

import Login from './Login'

function PrivateRoute ({ children, ...rest }) {
  const logedIn = useSelector(state => state.logedIn)

  return (
    <Route
      {...rest}
      render={({ location }) =>
        logedIn ? (children) : (<Login from={location} />)
      } />
  )
}

export default PrivateRoute
