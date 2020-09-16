import React from 'react'

import App from '../layouts/App'
import Credentials from '../components/Credentials'
import PrivateRoute from '../components/PrivateRoute'

import '../styles/general.scss'

export default () => {
  return (
    <App layout="wrapped" title="Stylo | My Credentials">
      <PrivateRoute>
        <Credentials />
      </PrivateRoute>
    </App>
  )
}
