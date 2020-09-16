import React from 'react'
import { Router, Location } from '@reach/router'
import App from '../layouts/App'
import WriteBook from '../components/WriteBook'
import PrivateRoute from '../components/PrivateRoute'

export default () => (
  <Location>
    {({ location }) => (
      <Router location={location} className="router">
        <BookID path="/book/:id/chapter/:chapter" />
        <BookID path="/book/:id" />
      </Router>
    )}
  </Location>
)

const BookID = (props) => {
  return (
    <App layout="fullPage">
      <PrivateRoute>
        <WriteBook {...props} />
      </PrivateRoute>
    </App>
  )
}
