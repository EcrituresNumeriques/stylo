import { Loading } from '@geist-ui/core'
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLoaderData, useLocation, useNavigate } from 'react-router'
import { getUserProfile } from '../helpers/userProfile.js'

import styles from './app.module.scss'

import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import createReduxStore from '../createReduxStore.js'

export async function loader() {
  const store = createReduxStore()
  const { sessionToken } = store.getState()

  const { user } = await getUserProfile({ sessionToken })
  return user
}

export default function StyloApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const hasBooted = useSelector((state) => state.hasBooted)
  const user = useLoaderData()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch({ type: 'PROFILE', user, hasBooted: true })
  }, [user])

  useEffect(() => {
    if (location.pathname.match(/\/books/i)) {
      navigate(location.pathname.replace(/\/books/i, '/corpus'))
    }
  }, [location.pathname])

  useEffect(() => {
    /* global _paq */
    const _paq = (window._paq = window._paq || [])

    //@todo do this dynamically, based on a subscription to the store
    //otherwise, we should use _paq.push(['forgetConsentGiven'])
    _paq.push(['setConsentGiven'])
    _paq.push(['setCustomUrl', location.pathname])
    //_paq.push(['setDocumentTitle', 'My New Title'])
    _paq.push(['trackPageView'])
  }, [location])

  const isFullDisplay = useMemo(
    () =>
      !(location.pathname.endsWith('/preview') ||
        location.pathname.startsWith('/article'))[location.pathname]
  )

  if (!hasBooted) {
    return <Loading />
  }

  return (
    <>
      {isFullDisplay && <Header />}
      <main className={styles.app}>
        <Outlet />
      </main>
      {isFullDisplay && <Footer />}
    </>
  )
}
