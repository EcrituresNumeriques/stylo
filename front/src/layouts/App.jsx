import clsx from 'clsx'
import React, { Suspense, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Route, Switch, useHistory, useLocation } from 'react-router-dom'
import Loading from '../components/molecules/Loading.jsx'

import styles from './app.module.scss'

export default function StyloApp({ children }) {
  const hasBooted = useSelector((state) => state.hasBooted)
  const history = useHistory()
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.match(/\/books/i)) {
      history.replace(pathname.replace(/\/books/i, '/corpus'))
    }
  }, [pathname])

  return (
    <Suspense fallback={<Loading />}>
      {hasBooted ? (
        <Switch>
          <Route path="/article/*">
            <main className={clsx(styles.app, styles.viewportMaxHeight)}>
              {children}
            </main>
          </Route>
          <Route path="*">
            <main className={styles.app}>{children}</main>
          </Route>
        </Switch>
      ) : (
        <Loading />
      )}
    </Suspense>
  )
}
