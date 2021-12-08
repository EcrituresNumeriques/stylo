import React from 'react';

if (import.meta.env.DEV) {
  const {default: whyDidYouRender} = await import('@welldone-software/why-did-you-render');
  const ReactRedux = await import('react-redux/lib')

  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackExtraHooks: [
      [ReactRedux, 'useSelector'],
      [ReactRedux, 'useDispatch'],
    ]
  });
}
