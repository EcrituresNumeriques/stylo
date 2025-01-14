import './wdyr.js'
import 'core-js/modules/web.structured-clone'
import * as Sentry from '@sentry/react'
import React, { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter as Router,
  Route as OriginalRoute,
  Switch,
  useHistory,
} from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { Provider } from 'react-redux'
import { GeistProvider, Loading } from '@geist-ui/core'

import './i18n.js'
import './styles/general.scss'
import './styles/general.scss'
import CollaborativeEditor from './components/collaborative/CollaborativeEditor.jsx'
import App from './layouts/App'
import createStore from './createReduxStore'
import { getUserProfile } from './helpers/userProfile'

import Header from './components/Header'
import Footer from './components/Footer'
import Register from './components/Register'
import PrivateRoute from './components/PrivateRoute'
import NotFound from './components/404'
import Error from './components/Error'
import { applicationConfig } from './stores/applicationConfig.jsx'
import Story from './stories/Story.jsx'

const Route = Sentry.withSentryRouting(OriginalRoute)
const history = createBrowserHistory()

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENVIRONMENT,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.reactRouterV5BrowserTracingIntegration({ history }),
      Sentry.replayIntegration(),
      Sentry.replayCanvasIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    tracePropagationTargets: [/^\//],
  })
}

// lazy loaded routes
const Corpus = lazy(() => import('./components/corpus/Corpus'))
const Articles = lazy(() => import('./components/Articles'))
const Workspaces = lazy(() => import('./components/workspace/Workspaces'))
const Credentials = lazy(() => import('./components/Credentials'))
const UserInfos = lazy(() => import('./components/UserInfos.jsx'))
const Write = lazy(() => import('./components/Write/Write'))
const ArticlePreview = lazy(() => import('./components/ArticlePreview'))
const Privacy = lazy(() => import('./components/Privacy'))

const store = createStore()
const workspacePathsRx = /^\/workspaces\/(?<id>[a-z0-9]+)\/(?:articles|books)$/

;(async () => {
  let { sessionToken } = store.getState()
  const authToken = new URLSearchParams(location.hash).get('#auth-token')
  if (authToken) {
    store.dispatch({ type: 'UPDATE_SESSION_TOKEN', token: authToken })
    sessionToken = authToken
    window.history.replaceState({}, '', location.pathname)
  }

  try {
    const { user, token } = await getUserProfile({
      applicationConfig,
      sessionToken,
    })
    const pathname = location.pathname
    const workspacePathRxResult = pathname.match(workspacePathsRx)
    let activeWorkspaceId
    if (workspacePathRxResult) {
      activeWorkspaceId = workspacePathRxResult.groups.id
    }
    store.dispatch({ type: 'PROFILE', user, token, activeWorkspaceId })
  } catch (error) {
    console.log('User seemingly not authenticated: %s', error.message)
    store.dispatch({ type: 'PROFILE' })
  }

  // refresh session profile whenever something happens to the session token
  // maybe there is a better way to do this
  store.subscribe(() => {
    const previousValue = sessionToken
    const { sessionToken: currentValue } = store.getState()

    if (currentValue !== previousValue) {
      sessionToken = currentValue
      getUserProfile({ sessionToken }).then((response) =>
        store.dispatch({ type: 'PROFILE', ...response })
      )
    }
  })
})()

const TrackPageViews = () => {
  const history = useHistory()

  history.listen(({ pathname, search, state }, action) => {
    /* global _paq */
    const _paq = (window._paq = window._paq || [])

    //@todo do this dynamically, based on a subscription to the store
    //otherwise, we should use _paq.push(['forgetConsentGiven'])
    _paq.push(['setConsentGiven'])
    _paq.push(['setCustomUrl', pathname])
    //_paq.push(['setDocumentTitle', 'My New Title'])
    _paq.push(['trackPageView'])
  })

  return null
}

const root = createRoot(document.getElementById('root'), {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
})

root.render(
  <React.StrictMode>
    <GeistProvider>
      <Provider store={store}>
        <Suspense fallback={<Loading />}>
          <Router history={history}>
            <App>
              <TrackPageViews />
              <Header />
              <Switch>
                <Route path="/register" exact>
                  <Register />
                </Route>
                {/* Articles index */}
                <PrivateRoute
                  path={['/articles', '/', '/workspaces/:workspaceId/articles']}
                  exact
                >
                  <Articles />
                </PrivateRoute>
                {/* Books index */}
                <PrivateRoute
                  path={['/books', '/workspaces/:workspaceId/books']}
                  exact
                >
                  <Corpus />
                </PrivateRoute>
                {/* Workspaces index */}
                <PrivateRoute path={['/workspaces']} exact>
                  <Workspaces />
                </PrivateRoute>
                <PrivateRoute path="/credentials" exact>
                  <UserInfos />
                  <Credentials />
                </PrivateRoute>
                {/* Annotate a Book */}
                <Route path={[`/books/:bookId/preview`]} exact>
                  <ArticlePreview />
                </Route>
                {/* Annotate an article or its version */}
                <Route
                  path={[
                    `/article/:id/version/:version/preview`,
                    `/article/:id/preview`,
                  ]}
                  exact
                >
                  <ArticlePreview />
                </Route>
                {/* Write and Compare */}
                <PrivateRoute
                  path={[
                    `/article/:id/compare/:compareTo`,
                    `/article/:id/version/:version/compare/working-copy`,
                    `/article/:id/version/:version/compare/:compareTo`,
                  ]}
                  exact
                >
                  <Write />
                </PrivateRoute>
                {/* Write with a given version */}
                <PrivateRoute path={`/article/:id/version/:version`} exact>
                  <Write />
                </PrivateRoute>
                {/* Write and/or Preview */}
                <PrivateRoute
                  path={[`/article/:id/preview`, `/article/:id`]}
                  exact
                >
                  <Write />
                </PrivateRoute>
                {/* Collaborative editing */}
                <PrivateRoute
                  path={[`/article/:articleId/session/:sessionId`]}
                  exact
                >
                  <CollaborativeEditor />
                </PrivateRoute>
                <Route exact path="/privacy">
                  <Privacy />
                </Route>
                <Route exact path="/ux">
                  <Story />
                </Route>
                <Route exact path="/error">
                  <Error />
                </Route>
                <Route path="*">
                  <NotFound />
                </Route>
              </Switch>
              <Footer />
            </App>
          </Router>
        </Suspense>
      </Provider>
    </GeistProvider>
  </React.StrictMode>
)
