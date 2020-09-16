import React from 'react'

import App from '../layouts/App'
import Articles from '../components/Articles'
import PrivateRoute from '../components/PrivateRoute'

import '../styles/general.scss'

export default () => {
  return (
    <App title="Stylo | Articles" layout="wrapped">
      <PrivateRoute>
        <Articles />
      </PrivateRoute>
    </App>
  )
}
