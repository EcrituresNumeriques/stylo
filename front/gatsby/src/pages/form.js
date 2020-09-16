import React from 'react'

import App from '../layouts/App'
import Form from '../components/Form'

export default () => {
  return (
    <App layout="centered" header={false}>
      <Form />
    </App>
  )
}
