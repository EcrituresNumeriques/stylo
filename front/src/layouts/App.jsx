import { Loading } from '@geist-ui/core'
import clsx from 'clsx'
import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'

import styles from './app.module.scss'

export default function StyloApp({ children }) {
  return (
    <Suspense fallback={<Loading />}>
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
    </Suspense>
  )
}
