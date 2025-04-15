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
import { GeistProvider } from '@geist-ui/core'

import './i18n.js'
import './styles/general.scss'
import './styles/general.scss'
import CollaborativeEditor from './components/collaborative/CollaborativeEditor.jsx'
import Loading from './components/molecules/Loading.jsx'
import App from './layouts/App'
import createStore from './createReduxStore'
import { getUserProfile } from './helpers/userProfile'

import Header from './components/Header'
import Footer from './components/Footer'
import Login from './components/Login'
import PrivateRoute from './components/PrivateRoute'
import NotFound from './components/404'
import Error from './components/Error'
import AuthCallback from './components/AuthCallback'
import { applicationConfig } from './config.js'
import { Helmet } from 'react-helmet'

const Route = Sentry.withSentryRouting(OriginalRoute)
const history = createBrowserHistory()

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    release: `stylo-front@${APP_VERSION}`,
    environment: APP_ENVIRONMENT,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.reactRouterV5BrowserTracingIntegration({ history }),
      Sentry.replayIntegration(),
      Sentry.replayCanvasIntegration(),
      Sentry.captureConsoleIntegration({ levels: ['warn', 'error', 'assert'] }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    tracePropagationTargets: [/^\//],
  })
}

// lazy loaded routes
const Home = lazy(() => import('./components/Home.jsx'))
const Register = lazy(() => import('./components/Register.jsx'))
const Corpus = lazy(() => import('./components/corpus/Corpus.jsx'))
const Articles = lazy(() => import('./components/Articles.jsx'))
const Workspaces = lazy(() => import('./components/workspace/Workspaces.jsx'))
const Credentials = lazy(() => import('./components/Credentials.jsx'))
const UserInfos = lazy(() => import('./components/UserInfos.jsx'))
const Write = lazy(() => import('./components/Write/Write.jsx'))
const Preview = lazy(() => import('./components/Preview.jsx'))
const Privacy = lazy(() => import('./components/Privacy.jsx'))
const Story = lazy(() => import('./stories/Story.jsx'))

const store = createStore()
const workspacePathsRx = /^\/workspaces\/(?<id>[a-z0-9]+)\/(?:articles|corpus)$/

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
    <Helmet defaultTitle="Stylo" titleTemplate="%s - Stylo" />
    <GeistProvider>
      <Provider store={store}>
        <Suspense fallback={<Loading />}>
          <Router history={history}>
            <App>
              <TrackPageViews />
              <Header />
              <Switch>
                <Route path="/" component={Home} exact />
                <Route path="/register" component={Register} exact />
                <Route path="/login" component={Login} exact />
                {/* Articles index */}
                <PrivateRoute
                  path={['/articles', '/', '/workspaces/:workspaceId/articles']}
                  component={Articles}
                  exact
                />
                {/* Corpus index */}
                <PrivateRoute
                  path={['/corpus', '/workspaces/:workspaceId/corpus']}
                  component={Corpus}
                  exact
                />
                {/* Workspaces index */}
                <PrivateRoute
                  path={['/workspaces']}
                  component={Workspaces}
                  exact
                />
                <PrivateRoute path="/credentials" exact>
                  <UserInfos />
                  <Credentials />
                </PrivateRoute>
                <PrivateRoute
                  exact
                  path="/credentials/auth-callback/:service"
                  component={AuthCallback}
                />
                {/* Annotate a corpus */}
                <Route
                  path={[
                    '/workspaces/:workspaceId/corpus/:id/preview',
                    '/corpus/:id/preview',
                  ]}
                  exact
                >
                  <Preview strategy="corpus" />
                </Route>
                {/* Annotate an article or its version */}
                <Route
                  path={[
                    `/article/:id/version/:version/preview`,
                    `/article/:id/preview`,
                  ]}
                  exact
                >
                  <Preview strategy="article" />
                </Route>
                {/* Write and compare */}
                <PrivateRoute
                  path={[
                    `/legacy/article/:id/compare/:compareTo`,
                    `/legacy/article/:id/version/:version/compare/working-copy`,
                    `/legacy/article/:id/version/:version/compare/:compareTo`,
                  ]}
                  component={Write}
                  exact
                />
                {/* Legacy write and/or preview */}
                <PrivateRoute
                  path={[`/legacy/article/:id/preview`, `/legacy/article/:id`]}
                  component={Write}
                  exact
                />
                {/* Collaborative editing */}
                <PrivateRoute
                  path={[
                    `/article/:articleId`,
                    `/article/:articleId/compare/:compareTo`,
                    `/article/:articleId/version/:versionId`,
                    `/article/:articleId/version/:versionId/compare/:compareTo`,
                    // the following route can be removed after the migration since we don't use session anymore
                    `/article/:articleId/session/:sessionId`,
                  ]}
                  component={CollaborativeEditor}
                  exact
                />
                <Route exact path="/privacy" component={Privacy} />
                <Route exact path="/ux" component={Story} />
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
