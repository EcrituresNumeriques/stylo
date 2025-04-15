import React, { useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import Loading from '../components/molecules/Loading.jsx'
import { useProfile } from '../hooks/user.js'

export default function StyloApp({ children }) {
  const history = useHistory()
  const { pathname } = useLocation()
  const { isLoading } = useProfile()

  useEffect(() => {
    if (pathname.match(/\/books/i)) {
      history.replace(pathname.replace(/\/books/i, '/corpus'))
    }
  }, [pathname])

  return isLoading ? <Loading /> : <>{children}</>
}
