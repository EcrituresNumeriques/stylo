import { setUser as setSentryUser } from '@sentry/react'

import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Outlet,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router'
import { ToastContainer } from 'react-toastify'

import { focusPageStart, shouldFocusPageStart } from '../../helpers/focus.js'
import { getSessionToken } from '../../helpers/sessionToken.js'
import { getUserProfile } from '../../helpers/user.js'
import { useDiscourseFeed } from '../../hooks/feed.js'
import { usePreferenceItem } from '../../hooks/user.js'
import {
  CommunityAlerts,
  DevModeAlert,
  Footer,
  Header,
  SkipLinks,
} from '../organisms/index.js'

/**
 * Loads user data from localStorage JWT
 * @returns {Promise<{ user: object }>}
 */
export async function loader() {
  if (getSessionToken()?.trim()) {
    return await getUserProfile()
  }
  return { user: null }
}

export default function StyloApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useLoaderData()
  const { t } = useTranslation()
  const { value: hasTrackingConsent } = usePreferenceItem(
    'trackingConsent',
    'user'
  )

  // Setup user session
  useEffect(() => {
    setSentryUser({ id: user?.id })

    if (hasTrackingConsent) {
      const _paq = (window._paq = window._paq || [])
      _paq.push(['setUserId', user?.id])
    }
  }, [user?.id, hasTrackingConsent])

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

  // After a page change, the focus stays on the menu link that was followed,
  // or falls back on <body> when that link is removed from the DOM: bring it
  // to the start of the new page.
  // Pages that focus an element themselves (autoFocus field, editor) keep it.
  const isFirstPage = useRef(true)
  useEffect(() => {
    if (isFirstPage.current) {
      isFirstPage.current = false
      return
    }
    if (!location.hash && shouldFocusPageStart()) {
      return focusPageStart()
    }
  }, [location.pathname])

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

  const restoreScroll = useMemo(() => location.hash !== '', [location.hash])

  return (
    <>
      <SkipLinks />
      {hideHeader || <Header />}
      {import.meta.env.MODE !== 'production' && <DevModeAlert />}
      <CommunityAlerts topics={alerts.topics} />

      <main id="content" aria-label={t('main.title')} tabIndex="-1">
        {restoreScroll && <ScrollRestoration />}
        <Outlet />
      </main>

      {hideFooter || <Footer />}

      <ToastContainer position="bottom-right" theme="colored" />
    </>
  )
}
