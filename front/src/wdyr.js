import * as React from 'react'
import * as ReactRedux from 'react-redux'
import whyDidYouRender from '@welldone-software/why-did-you-render'

if (import.meta.env.DEV) {

  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackExtraHooks: [
      [ReactRedux, 'useSelector'],
      [ReactRedux, 'useDispatch'],
    ]
  });
}
