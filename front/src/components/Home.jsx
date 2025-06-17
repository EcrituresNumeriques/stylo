import clsx from 'clsx'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import styloLogo from '/images/logo.svg'

import { useFeed } from '../hooks/feed.js'
import { useActiveUserId } from '../hooks/user.js'

import Loading from './molecules/Loading.jsx'
import Publication from './publications/Publication.jsx'
import Release from './publications/Release.jsx'
import Workshop from './publications/Workshop.jsx'

import styles from '../layout.module.scss'
import buttonStyles from './button.module.scss'
import headerStyles from './header.module.scss'

export default function Home() {
  const { t } = useTranslation('home')
  const { t: tGlobal } = useTranslation()
  const userId = useActiveUserId()

  const styloFeed = useFeed('/feed/publications')
  const releaseFeed = useFeed('/feed/releases')

  return (
    <>
      <section
        className={clsx(styles.sectionPrimary, styles.centered)}
        aria-labelledby="home-title"
        aria-describedby="home-description"
      >
        <h1 id="home-title">
          <img src={styloLogo} alt="Stylo" className={headerStyles.logoAsImg} />
        </h1>

        <p className={styles.hero} id="home-description">
          {t('hero.main')}
        </p>

        <p>{t('hero.description')}</p>

        {!userId && (
          <p className={styles.horizontalActions}>
            <Link to="/register" className={buttonStyles.linkPrimary}>
              {tGlobal('credentials.login.registerLink')}
            </Link>

            <Link to="/login" className={buttonStyles.linkSecondary}>
              {tGlobal('credentials.login.confirmButton')}
            </Link>
          </p>
        )}

        <p>
          <a
            href="https://stylo-doc.ecrituresnumeriques.ca/fr/about/"
            rel="noreferrer noopener"
            target="_blank"
            className={buttonStyles.linkSecondary}
            aria-label={tGlobal('more.about.accessibleLabel', {
              about: 'Stylo',
            })}
          >
            {tGlobal('more.about')}
          </a>
        </p>
      </section>

      <section className={styles.sectionAlternate} aria-labelledby="project">
        <h1 id="project">{t('project.title')}</h1>

        <p>
          <Trans i18nKey="project.tool" ns="home" />
        </p>

        <p>
          <Trans i18nKey="project.research" ns="home" />
        </p>

        <h2>{t('project.features.title')}</h2>

        <ul className={styles.spacer}>
          <li>{t('project.features.0')}</li>
          <li>{t('project.features.1')}</li>
          <li>{t('project.features.2')}</li>
          <li>{t('project.features.3')}</li>
          <li>{t('project.features.4')}</li>
          <li>{t('project.features.5')}</li>
          <li>{t('project.features.6')}</li>
          <li>{t('project.features.7')}</li>
          <li>{t('project.features.8')}</li>
        </ul>

        {!userId && (
          <p className={styles.horizontalActions}>
            <Link to="/register" className={buttonStyles.linkPrimary}>
              {tGlobal('credentials.login.registerLink')}
            </Link>

            <Link to="/login" className={buttonStyles.linkSecondary}>
              {tGlobal('credentials.login.confirmButton')}
            </Link>
          </p>
        )}

        <p>
          <a
            href="https://stylo-doc.ecrituresnumeriques.ca/fr/about/"
            rel="noreferrer noopener"
            target="_blank"
            className={buttonStyles.linkSecondary}
            aria-label={tGlobal('more.about.accessibleLabel', {
              about: 'Stylo',
            })}
          >
            {tGlobal('more.about')}
          </a>
        </p>
      </section>

      <section className={styles.sectionPrimary} aria-labelledby="news">
        <h1 id="news">{t('news.title')}</h1>

        <h2>{t('news.workshops.title')}</h2>

        <div className={styles.desktopGridOf3}>
          {styloFeed.isLoading ? (
            <Loading />
          ) : (
            styloFeed.data
              .filter((entry) =>
                entry.querySelector('category[term="atelierstylo"]')
              )
              .map((entry, i) => <Workshop entry={entry} key={i} />)
          )}
        </div>

        <h2>{t('news.release.title')}</h2>

        <div className={styles.desktopGridOf3}>
          {releaseFeed.isLoading ? (
            <Loading />
          ) : (
            <Release
              entry={releaseFeed.data.find(
                (entry) =>
                  entry
                    .querySelector('content[type="html"]')
                    // automatic releases simply have a '<p>Release vX.Y.Z</p>' content
                    .textContent.startsWith('<p>Release') === false
              )}
            />
          )}
        </div>

        <h2>{t('news.publications.title')}</h2>

        <div className={styles.desktopGridOf3}>
          {styloFeed.isLoading ? (
            <Loading />
          ) : (
            styloFeed.data
              .filter((entry) => entry.querySelector('category[term="stylog"]'))
              .map((entry, i) => <Publication entry={entry} key={i} />)
          )}
        </div>
      </section>

      <section className={styles.sectionAlternate}>
        <h1>{t('contactus.title')}</h1>

        <p>{t('contactus.description')}</p>

        <p className={styles.spacer}>
          <a
            href="https://discussions.revue30.org/c/stylo/"
            className={buttonStyles.linkPrimary}
            rel="noreferrer noopener"
            target="_blank"
          >
            {t('contactus.join')}
          </a>
        </p>

        <p>{t('contactus.publishing')}</p>

        <p>
          <a
            href="https://stylo-doc.ecrituresnumeriques.ca/fr/contacts/"
            target="_blank"
            rel="noreferrer noopener"
            className={buttonStyles.linkSecondary}
          >
            {t('contactus.mailto')}
          </a>
        </p>
      </section>
    </>
  )
}
