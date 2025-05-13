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

/**
 * Scroll to top each time a path has changed
 *
 * Will be removed with React Router v7+ as there is a supported component
 * @see https://dev.to/kunalukey/scroll-to-top-when-route-changes-reactjs-react-router-3bgn
 * @see https://api.reactrouter.com/v7/functions/react_router.ScrollRestoration.html
 * @see https://github.com/EcrituresNumeriques/stylo/pull/1250
 */
export function ScrollRestoration () {
  const { /* hash, */ pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
}