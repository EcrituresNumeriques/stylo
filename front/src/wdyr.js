import * as React from 'react'
import * as ReactRedux from 'react-redux'
import whyDidYouRender from '@welldone-software/why-did-you-render'

if (import.meta.env.DEV) {
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    exclude: [
      // ref: https://github.com/geist-org/geist-ui/issues/843
      /^Geist.*/, // external lib
    ],
    trackExtraHooks: [
      [ReactRedux, 'useSelector'],
      [ReactRedux, 'useDispatch'],
    ],
  })
}
