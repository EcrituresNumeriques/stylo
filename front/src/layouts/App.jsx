import React, { useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

export default function StyloApp({ children }) {
  const history = useHistory()
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.match(/\/books/i)) {
      history.replace(pathname.replace(/\/books/i, '/corpus'))
    }
  }, [pathname])

  return <>{children}</>
}
