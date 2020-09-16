import React from 'react'

import App from '../layouts/App'
import Books from '../components/Books'
import PrivateRoute from '../components/PrivateRoute'

import '../styles/general.scss'


export default () => {
  return (
    <App layout="wrapped" title="Stylo | Books">
      <PrivateRoute>
        <Books />
      </PrivateRoute>
    </App>
  )
}
