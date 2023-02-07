import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Switch, Route, Link } from 'react-router-dom'

import styles from './header.module.scss'
import { HelpCircle } from "react-feather";

function Footer () {
  const dispatch = useDispatch()
  const userHasConsent = useSelector(state => state.userPreferences.trackingConsent)
  const toggleConsent = useCallback(() => dispatch({ type: 'USER_PREFERENCES_TOGGLE', key: 'trackingConsent' }), [])

  return (<Switch>
    <Route path="*/preview" />
    <Route path="*">
      <footer className={styles.footerContainer}>
        <ul className={styles.footerList}>
          <li>Stylo {APP_VERSION}</li>
          <li><a
            href="http://stylo-doc.ecrituresnumeriques.ca"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HelpCircle className={styles.linkIcon} size={14} />
            Documentation
          </a></li>
          <li>
            <a href="https://github.com/EcrituresNumeriques/stylo/releases" rel="noopener noreferrer" target="_blank">
              Changelog
            </a>
          </li>
          <li><Link to="/privacy">Privacy</Link></li>
          { import.meta.env.SNOWPACK_MATOMO_URL && (<li>
            <label className={styles.consentLabel}>
              <input type="checkbox" checked={userHasConsent} onChange={toggleConsent} disabled={true} />
              I accept to share my navigation stats
            </label>
          </li>) }
        </ul>
      </footer>
    </Route>
  </Switch>)
}

export default Footer
