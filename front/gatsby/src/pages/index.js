import React from 'react'

import App from '../layouts/App'
import PrivateRoute from '../components/PrivateRoute'
import '../styles/general.scss'

const Index = () => {
  return (
    <App layout="centered" header={false}>
      <PrivateRoute redirectTo="/articles" />
    </App>
  )
}

export default Index
