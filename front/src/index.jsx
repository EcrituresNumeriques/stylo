import './wdyr.js'
import 'core-js/modules/web.structured-clone'
import * as Sentry from '@sentry/react'
import React, { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  createRoutesFromChildren,
  createRoutesFromElements,
  Route,
  RouterProvider,
  matchPath,
  useLocation,
  useNavigationType,
  matchRoutes
} from 'react-router'
import { Provider } from 'react-redux'
import { GeistProvider } from '@geist-ui/core'
import { Helmet } from 'react-helmet'

import './i18n.js'
import './styles/general.scss'
import './styles/general.scss'

import { applicationConfig } from './config.js'
import createStore from './createReduxStore.js'
import { getUserProfile } from './helpers/user.js'

import App, { loader as AppLoader } from './layouts/App.jsx'
import AuthCallback from './components/AuthCallback.jsx'
import RequireAuth from './components/PrivateRoute.jsx'
import ErrorBoundary from './components/Error.jsx'
import Login from './components/Login.jsx'
import LoadingPage from './components/LoadingPage.jsx'
import NotFound from './components/404.jsx'

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    release: `stylo-front@${APP_VERSION}`,
    environment: APP_ENVIRONMENT,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
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
const RegisterWithAuthProvider = lazy(
  () => import('./components/RegisterWithAuthProvider.jsx')
)
const Corpus = lazy(() => import('./components/corpus/Corpus.jsx'))
const Articles = lazy(() => import('./components/Articles.jsx'))
const Workspaces = lazy(() => import('./components/workspace/Workspaces.jsx'))
const Credentials = lazy(() => import('./components/Credentials.jsx'))
const Annotate = lazy(() => import('./components/Annotate.jsx'))
const Privacy = lazy(() => import('./components/Privacy.jsx'))
const Story = lazy(() => import('./stories/Story.jsx'))
const CollaborativeEditor = lazy(
  () => import('./components/collaborative/CollaborativeEditor.jsx')
)

let sessionToken = new URLSearchParams(location.hash).get('#auth-token')

const initialStoreData = {
  ...(sessionToken ? { sessionToken } : {}),
  activeWorkspaceId: matchPath('/workspaces/:workspaceId', location.pathname)?.params?.workspaceId
}

const store = createStore(initialStoreData)

getUserProfile({
  applicationConfig,
  sessionToken,
}).then(({ user }) => store.dispatch({ type: 'PROFILE', user }))

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

const root = createRoot(document.getElementById('root'), {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
})

const router = createBrowserRouter(Sentry.withSentryReactRouterV7Routing(createRoutesFromElements(
  <Route path="/" element={<App />} loader={AppLoader} ErrorBoundary={ErrorBoundary}>
    <Route index element={<Home />} />
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />}>
      <Route
        path=":service"
        element={<RegisterWithAuthProvider />}
      />
    </Route>

    {/* Articles */}
    <Route path="articles" element={<RequireAuth />}>
      <Route index element={<Articles />} />
    </Route>

    <Route path="article/:id">
      <Route index element={<CollaborativeEditor />} />
      <Route path="preview" element={<CollaborativeEditor mode="preview" />} />
      <Route path="annotate" element={<Annotate strategy="article" />} />
      <Route path="compare/:compareTo" element={<CollaborativeEditor mode="compare" />} />

      <Route path="version/:version">
        <Route index element={<CollaborativeEditor />} />
        <Route path="preview" element={<CollaborativeEditor mode="preview" />} />
        <Route path="annotate" element={<Annotate strategy="article" />} />
        <Route path="compare/:compareTo?" element={<CollaborativeEditor mode="compare" />} />
      </Route>
    </Route>


    {/* Corpus */}
    <Route path="corpus" element={<RequireAuth />}>
      <Route index element={<Corpus />} />
      <Route path=":id">
        <Route path="annotate" element={<Annotate strategy="corpus" />} />
      </Route>
    </Route>

    {/* Workspaces */}
    <Route path="workspaces" element={<RequireAuth />}>
      <Route index element={<Workspaces />} />

      <Route path=":workspaceId">
        <Route path="articles" element={<Articles />} />
        <Route path="corpus" element={<Corpus />} />
      </Route>
    </Route>

    {/* Credentials and auth callbacks */}
    <Route path="credentials" element={<RequireAuth />}>
      <Route index element={<Credentials />} />
      <Route path="auth-callback/:service" element={<AuthCallback />} />
    </Route>

    {/* Generic pages */}
    <Route path="privacy" element={<Privacy />} />

    <Route path="ux">
      <Route index element={<Story />} />
      {import.meta.env.DEV && (
        <Route exact path="loading" element={<LoadingPage />} />
      )}
    </Route>

    <Route path="*" element={<NotFound />} />
  </Route>
)))

root.render(
  <React.StrictMode>
    <Helmet defaultTitle="Stylo" titleTemplate="%s - Stylo" />
    <GeistProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </GeistProvider>
  </React.StrictMode>
)
