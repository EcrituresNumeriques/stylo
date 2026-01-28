import './wdyr.js'

import 'core-js/modules/web.structured-clone'

import * as Sentry from '@sentry/react'

import React, { lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { Provider as ReduxProvider } from 'react-redux'
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromChildren,
  createRoutesFromElements,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router'

import './i18n.js'
import './styles/general.scss'

import createStore from './createReduxStore.js'
import { getUserProfile } from './helpers/user.js'

import AuthCallback from './components/AuthCallback.jsx'
import LoadingPage from './components/LoadingPage.jsx'
import Login, { Logout } from './components/Login.jsx'
import RequireAuth from './components/PrivateRoute.jsx'
import CollaborativeEditor, {
  loader as ArticleLoader,
} from './components/collaborative/CollaborativeEditor.jsx'
import RedirectIfAuth from './components/pages/auth/RedirectIfAuth.jsx'
import NotFound from './components/pages/errors/404.jsx'
import ErrorBoundary from './components/pages/errors/AppError.jsx'
import App, { loader as AppLoader } from './layouts/App.jsx'

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
const Corpus = lazy(() => import('./components/pages/Corpus.jsx'))
const Articles = lazy(() => import('./components/pages/Articles.jsx'))
const Workspaces = lazy(() => import('./components/workspace/Workspaces.jsx'))
const Credentials = lazy(() => import('./components/Credentials.jsx'))
const Annotate = lazy(() => import('./components/Annotate.jsx'))
const Privacy = lazy(() => import('./components/Privacy.jsx'))
const Story = lazy(() => import('./stories/Story.jsx'))

const store = createStore()

// refresh session profile whenever something happens to the session token
// maybe there is a better way to do this
let previousValue = ''
store.subscribe(() => {
  const { sessionToken } = store.getState()

  if (sessionToken !== null && sessionToken !== previousValue) {
    previousValue = sessionToken
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

const router = createBrowserRouter(
  Sentry.withSentryReactRouterV7Routing(
    createRoutesFromElements(
      <Route
        path="/"
        id="app"
        element={<App />}
        loader={AppLoader}
        HydrateFallback={LoadingPage}
        ErrorBoundary={ErrorBoundary}
      >
        <Route index element={<Home />} />
        <Route path="login" element={<RedirectIfAuth />}>
          <Route index element={<Login />} />
        </Route>
        <Route path="logout" element={<Logout />} />
        <Route path="register" element={<RedirectIfAuth />}>
          <Route index element={<Register />} />
        </Route>
        <Route
          path="register/:service"
          element={<RegisterWithAuthProvider />}
        />

        {/* Annotations */}
        <Route
          path="article/:id/annotate"
          element={<Annotate strategy="article" />}
        />
        <Route
          path="article/:id/version/:version/annotate"
          element={<Annotate strategy="article" />}
        />
        <Route
          path="corpus/:id/annotate"
          element={<Annotate strategy="corpus" />}
        />

        {/* Articles */}
        <Route path="articles" element={<RequireAuth />}>
          <Route index element={<Articles />} />
        </Route>

        <Route
          path="article/:id"
          loader={ArticleLoader}
          id="article"
          element={<RequireAuth />}
        >
          <Route index element={<CollaborativeEditor />} />
          <Route
            path="compare/:compareTo"
            element={<CollaborativeEditor mode="compare" />}
          />

          <Route path="version/:version">
            <Route index element={<CollaborativeEditor />} />
            <Route
              path="compare/:compareTo?"
              element={<CollaborativeEditor mode="compare" />}
            />
          </Route>
        </Route>

        {/* Corpus */}
        <Route path="corpus" element={<RequireAuth />}>
          <Route index element={<Corpus />} />
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
    )
  )
)

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Helmet defaultTitle="Stylo" titleTemplate="%s - Stylo" />
      <ReduxProvider store={store}>
        <RouterProvider router={router} />
      </ReduxProvider>
    </HelmetProvider>
  </React.StrictMode>
)
