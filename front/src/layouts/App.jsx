import { setUser as setSentryUser } from '@sentry/react'

import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Outlet,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router'

import { getUserProfile } from '../helpers/user.js'
import { useDiscourseFeed } from '../hooks/feed.js'
import { useUserPreferences } from '../stores/preferencesStore.js'

import CommunityAlerts from '../components/CommunityAlerts.jsx'
import DevModeAlert from '../components/DevModeAlert.jsx'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import SkipLinks from '../components/SkipLinks.jsx'

/**
 * Loads user data from localStorage JWT
 * @returns {Promise<{ user: object }>}
 */
export async function loader() {
  const sessionToken = localStorage.getItem('sessionToken')
  if (sessionToken !== null && sessionToken.trim() !== '') {
    return await getUserProfile({
      sessionToken,
    })
  }
  return { user: null }
}

export default function StyloApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useLoaderData()
  const { t } = useTranslation()
  const { trackingConsent: hasTrackingConsent } = useUserPreferences()

  // Setup user session
  useEffect(() => {
    setSentryUser({ id: user?._id })

    if (hasTrackingConsent) {
      const _paq = (window._paq = window._paq || [])
      _paq.push(['setUserId', user?._id])
    }
  }, [user?._id, hasTrackingConsent])

  useEffect(() => {
    if (location.pathname.match(/\/books/i)) {
      navigate(location.pathname.replace(/\/books/i, '/corpus'))
    }

    if (location.pathname.match(/\/preview/i)) {
      navigate(location.pathname.replace(/\/preview/i, '/annotate'))
    }
  }, [location.pathname])

  // Forget tracking
  useEffect(() => {
    if (!hasTrackingConsent) {
      const _paq = (window._paq = window._paq || [])
      _paq.push(['forgetConsentGiven'])
    }
  }, [hasTrackingConsent])

  // Track location change
  useEffect(() => {
    if (hasTrackingConsent) {
      const _paq = (window._paq = window._paq || [])
      _paq.push(['setConsentGiven'])
      _paq.push(['setCustomUrl', location.pathname])
      //_paq.push(['setDocumentTitle', 'My New Title'])
      _paq.push(['trackPageView'])
    }
  }, [location.pathname, hasTrackingConsent])

  // Collect alert messages
  const { data: alerts } = useDiscourseFeed('/community/alerts.json', {
    refreshInterval: 60 * 1000,
    revalidateOnFocus: false,
  })

  const hideHeader = useMemo(
    () => location.pathname.endsWith('/annotate'),
    [location.pathname]
  )
  const hideFooter = useMemo(() => {
    return (
      location.pathname.endsWith('/annotate') ||
      location.pathname.startsWith('/article/')
    )
  }, [location.pathname])

  return (
    <>
      <SkipLinks />
      {hideHeader || <Header />}
      {import.meta.env.MODE !== 'production' && <DevModeAlert />}
      <CommunityAlerts topics={alerts.topics} />

      <main id="content" aria-label={t('main.title')} tabIndex="-1">
        <ScrollRestoration />
        <Outlet />
      </main>

      {hideFooter || <Footer />}
    </>
  )
}
