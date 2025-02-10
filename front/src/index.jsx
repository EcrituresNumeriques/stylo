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
  useLocation,
  useNavigationType,
  matchRoutes,
} from 'react-router'
import { Provider } from 'react-redux'
import { GeistProvider, Loading } from '@geist-ui/core'

import './i18n.js'
import './styles/general.scss'
import './styles/general.scss'
import CollaborativeEditor from './components/collaborative/CollaborativeEditor.jsx'
import App, { loader as AppLoader } from './layouts/App'
import createStore from './createReduxStore'

import ErrorBoundary from './components/Error.jsx'
import PageNotFound from './components/Error404.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import RequireAuth from './components/PrivateRoute.jsx'
import AuthCallback from './components/AuthCallback'
import { applicationConfig } from './config.js'
import Story from './stories/Story.jsx'
import { Helmet } from 'react-helmet'

if (import.meta.SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.SENTRY_DSN,
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
const Corpus = lazy(() => import('./components/corpus/Corpus'))
const Articles = lazy(() => import('./components/Articles'))
const Workspaces = lazy(() => import('./components/workspace/Workspaces'))
const Credentials = lazy(() => import('./components/Credentials'))
const UserInfos = lazy(() => import('./components/UserInfos.jsx'))
const Write = lazy(() => import('./components/Write/Write'))
const Preview = lazy(() => import('./components/Preview.jsx'))
const Privacy = lazy(() => import('./components/Privacy'))

const store = createStore()

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
        element={<App />}
        loader={AppLoader}
        ErrorBoundary={ErrorBoundary}
      >
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route path="articles" element={<RequireAuth />}>
          <Route index element={<Articles />} />
        </Route>

        <Route path="article/:id">
          <Route index element={<Write />} />
          <Route path="compare/:compareTo" element={<Write />} />
          <Route path="preview" element={<Preview strategy="article" />} />
          <Route path="session/:sessionId" element={<CollaborativeEditor />} />

          <Route path="version/:version">
            <Route index element={<Write />} />
            <Route path="preview" element={<Preview strategy="article" />} />
            <Route path="compare/:compareTo?" element={<Write />} />
          </Route>
        </Route>

        <Route path="corpus" element={<RequireAuth />}>
          <Route index element={<Corpus />} />
          <Route path=":id">
            <Route path="preview" element={<Preview strategy="corpus" />} />
          </Route>
        </Route>

        <Route path="workspaces" element={<RequireAuth />}>
          <Route index element={<Workspaces />} />

          <Route path=":workspaceId">
            <Route path="articles" element={<Articles />} />
            <Route path="corpus" element={<Corpus />} />
          </Route>
        </Route>

        <Route path="credentials" element={<RequireAuth />}>
          <Route path="auth-callback/:service" element={<AuthCallback />} />
          <Route index element={<Credentials />} />
        </Route>

        <Route path="privacy" element={<Privacy />} />

        <Route path="ux" element={<Story />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    )
  )
)

root.render(
  <React.StrictMode>
    <Helmet defaultTitle="Stylo" titleTemplate="%s - Stylo" />
    <GeistProvider>
      <Provider store={store}>
        <Suspense fallback={<Loading />}>
          <RouterProvider router={router} />
        </Suspense>
      </Provider>
    </GeistProvider>
  </React.StrictMode>
)
