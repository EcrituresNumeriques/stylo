import './wdyr.js'
import 'core-js/modules/web.structured-clone'
import React, { lazy } from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom'
import { Provider } from 'react-redux'
import { GeistProvider } from '@geist-ui/core'

import './i18n.js'
import './styles/general.scss'
import './styles/general.scss'
import App from './layouts/App'
import createStore from './createReduxStore'
import { getUserProfile } from './helpers/userProfile'
import { getApplicationConfig } from './helpers/applicationConfig'

import Header from './components/Header'
import Footer from './components/Footer'
import Register from './components/Register'
import PrivateRoute from './components/PrivateRoute'
import NotFound from './components/404'
import Error from './components/Error'
import Button from './components/Button'
import Field from './components/Field'
import { Check, Copy, Search } from 'react-feather'
import buttonStyles from './components/button.module.scss'
import Select from './components/Select'

// lazy loaded routes
const Books = lazy(() => import('./components/Books'))
const Articles = lazy(() => import('./components/Articles'))
const Workspaces = lazy(() => import('./components/workspace/Workspaces'))
const Credentials = lazy(() => import('./components/Credentials'))
const Write = lazy(() => import('./components/Write/Write'))
const ArticlePreview = lazy(() => import('./components/ArticlePreview'))
const Privacy = lazy(() => import('./components/Privacy'))

const store = createStore()

;(async () => {
  let { applicationConfig: defaultApplicationConfig, sessionToken } = store.getState()
  const authToken = new URLSearchParams(location.hash).get('#auth-token')
  if (authToken) {
    store.dispatch({ type: 'UPDATE_SESSION_TOKEN', token: authToken })
    sessionToken = authToken
    window.history.replaceState({}, '', location.pathname)
  }

  const applicationConfig = await getApplicationConfig(defaultApplicationConfig)
  store.dispatch({ type: 'APPLICATION_CONFIG', applicationConfig })

  try {
    const { user, token } = await getUserProfile({ applicationConfig, sessionToken })
    store.dispatch({ type: 'PROFILE', user, token })
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
      getUserProfile({ applicationConfig, sessionToken })
        .then((response) => store.dispatch({ type: 'PROFILE', ...response }))
    }
  })
})()


const TrackPageViews = () => {
  const history = useHistory()

  history.listen(({ pathname, search, state }, action) => {
    /* global _paq */
    const _paq = window._paq = window._paq || []

    //@todo do this dynamically, based on a subscription to the store
    //otherwise, we should use _paq.push(['forgetConsentGiven'])
    _paq.push(['setConsentGiven'])
    _paq.push(['setCustomUrl', pathname])
    //_paq.push(['setDocumentTitle', 'My New Title'])
    _paq.push(['trackPageView'])
  })

  return null
}

render(
  <React.StrictMode>
    <GeistProvider>
      <Provider store={store}>
        <Router>
          <TrackPageViews/>
          <Header/>
          <App>
            <Switch>
              <Route path="/register" exact>
                <Register/>
              </Route>
              {/* Articles index */}
              <PrivateRoute path={['/articles', '/']} exact>
                <Articles/>
              </PrivateRoute>
              {/* Books index */}
              <PrivateRoute path="/books" exact>
                <Books/>
              </PrivateRoute>
              {/* Workspaces index */}
              <PrivateRoute path={['/workspaces', '/']} exact>
                <Workspaces/>
              </PrivateRoute>
              <PrivateRoute path="/credentials" exact>
                <Credentials/>
              </PrivateRoute>
              {/* Annotate a Book */}
              <Route path={[`/books/:bookId/preview`]} exact>
                <ArticlePreview/>
              </Route>
              {/* Annotate an article or its version */}
              <Route path={[`/article/:id/version/:version/preview`, `/article/:id/preview`]} exact>
                <ArticlePreview/>
              </Route>
              {/* Write and Compare */}
              <PrivateRoute
                path={[`/article/:id/compare/:compareTo`, `/article/:id/version/:version/compare/:compareTo`]} exact>
                <Write/>
              </PrivateRoute>
              {/* Write with a given version */}
              <PrivateRoute path={`/article/:id/version/:version`} exact>
                <Write/>
              </PrivateRoute>
              {/* Write and/or Preview */}
              <PrivateRoute path={[`/article/:id/preview`, `/article/:id`]} exact>
                <Write/>
              </PrivateRoute>
              <Route exact path="/privacy">
                <Privacy/>
              </Route>
              <Route exact path="/ux">
                <h2>Buttons</h2>
                <h4>Primary</h4>
                <Button primary={true}>Create New Article</Button>
                <h4>Secondary</h4>
                <Button>Manage Tags</Button>
                <h4>With Icon</h4>
                <Button><Check/> Save</Button>
                <h4>Icon Only</h4>
                <Button icon={true}><Copy/></Button>
                <h2>Fields</h2>
                <h4>Search</h4>
                <Field placeholder="Search" icon={Search}/>
                <h4>Textarea</h4>
                <div style={{ 'max-width': '50%' }}>
                  <textarea className={buttonStyles.textarea} rows="10">Du texte</textarea>
                </div>
                <h4>Select</h4>
                <Select>
                  <option>Tome de Savoie</option>
                  <option>Reblochon</option>
                  <option>St Marcellin</option>
                </Select>
                <h4>Tabs</h4>
                <h4>Form actions</h4>
              </Route>
              <Route exact path="/error">
                <Error/>
              </Route>
              <Route path="*">
                <NotFound/>
              </Route>
            </Switch>
          </App>

          <Footer/>
        </Router>
      </Provider>
    </GeistProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
