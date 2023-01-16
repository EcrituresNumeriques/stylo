import React, { Suspense, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Loading from '../components/Loading'
import { useHistory } from "react-router-dom";

export default function StyloApp ({ children }) {
  const hasBooted = useSelector(state => state.hasBooted)
  const dispatch = useDispatch()
  const { replace, location } = useHistory()
  const setSessionToken = useCallback((token) => dispatch({ type: 'UPDATE_SESSION_TOKEN', token }), [])
  const authToken = new URLSearchParams(location.hash).get('#auth-token')

  useEffect(() => {
    if (authToken) {
      setSessionToken(authToken)
      replace(location.pathname)
    }
  }, [authToken])

  return (
    <main>
      <Suspense fallback={<Loading />}>
        {hasBooted ? (children) : <Loading />}
      </Suspense>
    </main>
  )
}
