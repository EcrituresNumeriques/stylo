import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import {
  Building2,
  CalendarDays,
  CircleUser,
  MapPin,
  Newspaper,
  Star,
} from 'lucide-react'
import styloLogo from '/images/logo.svg'

import styles from '../layout.module.scss'
import headerStyles from './header.module.scss'
import buttonStyles from './button.module.scss'
import clsx from 'clsx'

export default function Home() {
  const { t } = useTranslation('home')
  const { t: tGlobal } = useTranslation()

  return (
    <>
      <section className={clsx(styles.sectionPrimary, styles.centered)}>
        <h1>
          <img src={styloLogo} alt="Stylo" className={headerStyles.logoAsImg} />
        </h1>

        <p className={styles.hero}>{t('hero.main')}</p>

        <p>{t('hero.description')}</p>

        <p>
          <Link to="/register" className={buttonStyles.linkPrimary}>
            {tGlobal('credentials.login.registerLink')}
          </Link>
        </p>

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

      <section className={styles.sectionAlternate}>
        <h1>{t('project.title')}</h1>

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

        <p>
          <Link to="/register" className={buttonStyles.linkPrimary}>
            {tGlobal('credentials.login.registerLink')}
          </Link>
        </p>

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

      <section className={styles.sectionPrimary}>
        <h1>{t('news.title')}</h1>

        <h2>{t('news.workshops.title')}</h2>

        <div className={styles.desktopGridOf3}>
          <article className={styles.article}>
            <h3>Formation Stylo à l’Urfist de Lyon</h3>

            <ul className={styles.articleMetadata}>
              <li>
                <MapPin className="icon" aria-label="Lieu :" /> Lyon
              </li>
              <li>
                <CalendarDays className="icon" aria-label="Date :" /> 12 mars
                2025
              </li>
              <li>
                <Building2 className="icon" aria-label="Organisateur :" />{' '}
                Urfist
              </li>
            </ul>

            <a
              href="https://www.arthurperret.fr/evenements/2025-03-12-formation-stylo-urfist-lyon.html"
              target="_blank"
              rel="noreferrer noopener"
              className={buttonStyles.linkSecondary}
            >
              {tGlobal('more.about')}
            </a>
          </article>
        </div>

        <h2>{t('news.release.title')}</h2>
        {/* https://github.com/EcrituresNumeriques/stylo/releases.atom */}

        <div className={styles.desktopGridOf3}>
          <article className={styles.article} lang="fr">
            <h3>Stylo 3.4</h3>

            <ul className={styles.articleMetadata}>
              <li>
                <CalendarDays className="icon" aria-label="Date :" /> 16 mars
                2025
              </li>
            </ul>

            <p>
              <details className={buttonStyles.secondary}>
                <summary>Contenu de la mise à jour</summary>

                <h2>Fonctionnalités</h2>
                <ul>
                  <li>
                    Traduction de la page d'accueil by{' '}
                    <a
                      class="user-mention notranslate"
                      data-hovercard-type="user"
                      data-hovercard-url="/users/thom4parisot/hovercard"
                      data-octo-click="hovercard-link-click"
                      data-octo-dimensions="link_type:self"
                      href="https://github.com/thom4parisot"
                    >
                      @thom4parisot
                    </a>{' '}
                    in{' '}
                    <a
                      class="issue-link js-issue-link"
                      data-error-text="Failed to load title"
                      data-id="2914662095"
                      data-permission-text="Title is private"
                      data-url="https://github.com/EcrituresNumeriques/stylo/issues/1330"
                      data-hovercard-type="pull_request"
                      data-hovercard-url="/EcrituresNumeriques/stylo/pull/1330/hovercard"
                      href="https://github.com/EcrituresNumeriques/stylo/pull/1330"
                    >
                      #1330
                    </a>
                  </li>
                  <li>
                    Montée en version du module d'export pour une meilleure
                    compatibilité des exports PDF, y compris pour des textes en
                    grec ancien by{' '}
                    <a
                      class="user-mention notranslate"
                      data-hovercard-type="user"
                      data-hovercard-url="/users/thom4parisot/hovercard"
                      data-octo-click="hovercard-link-click"
                      data-octo-dimensions="link_type:self"
                      href="https://github.com/thom4parisot"
                    >
                      @thom4parisot
                    </a>{' '}
                    in{' '}
                    <a
                      class="issue-link js-issue-link"
                      data-error-text="Failed to load title"
                      data-id="2916120197"
                      data-permission-text="Title is private"
                      data-url="https://github.com/EcrituresNumeriques/stylo/issues/1331"
                      data-hovercard-type="pull_request"
                      data-hovercard-url="/EcrituresNumeriques/stylo/pull/1331/hovercard"
                      href="https://github.com/EcrituresNumeriques/stylo/pull/1331"
                    >
                      #1331
                    </a>
                  </li>
                  <li>
                    Formulaire de mise à jour d'étiquette by{' '}
                    <a
                      class="user-mention notranslate"
                      data-hovercard-type="user"
                      data-hovercard-url="/users/thom4parisot/hovercard"
                      data-octo-click="hovercard-link-click"
                      data-octo-dimensions="link_type:self"
                      href="https://github.com/thom4parisot"
                    >
                      @thom4parisot
                    </a>{' '}
                    in{' '}
                    <a
                      class="issue-link js-issue-link"
                      data-error-text="Failed to load title"
                      data-id="2885103896"
                      data-permission-text="Title is private"
                      data-url="https://github.com/EcrituresNumeriques/stylo/issues/1311"
                      data-hovercard-type="pull_request"
                      data-hovercard-url="/EcrituresNumeriques/stylo/pull/1311/hovercard"
                      href="https://github.com/EcrituresNumeriques/stylo/pull/1311"
                    >
                      #1311
                    </a>
                  </li>
                </ul>
                <h2>Correctifs</h2>
                <ul>
                  <li>
                    Désactive les suggestions de mots dans l'éditeur de texte by{' '}
                    <a
                      class="user-mention notranslate"
                      data-hovercard-type="user"
                      data-hovercard-url="/users/thom4parisot/hovercard"
                      data-octo-click="hovercard-link-click"
                      data-octo-dimensions="link_type:self"
                      href="https://github.com/thom4parisot"
                    >
                      @thom4parisot
                    </a>{' '}
                    in{' '}
                    <a
                      class="issue-link js-issue-link"
                      data-error-text="Failed to load title"
                      data-id="2917703214"
                      data-permission-text="Title is private"
                      data-url="https://github.com/EcrituresNumeriques/stylo/issues/1341"
                      data-hovercard-type="pull_request"
                      data-hovercard-url="/EcrituresNumeriques/stylo/pull/1341/hovercard"
                      href="https://github.com/EcrituresNumeriques/stylo/pull/1341"
                    >
                      #1341
                    </a>
                  </li>
                  <li>
                    Redirige les anciennes URLs de preview vers les nouvelles by{' '}
                    <a
                      class="user-mention notranslate"
                      data-hovercard-type="user"
                      data-hovercard-url="/users/thom4parisot/hovercard"
                      data-octo-click="hovercard-link-click"
                      data-octo-dimensions="link_type:self"
                      href="https://github.com/thom4parisot"
                    >
                      @thom4parisot
                    </a>{' '}
                    in{' '}
                    <a
                      class="issue-link js-issue-link"
                      data-error-text="Failed to load title"
                      data-id="2920644183"
                      data-permission-text="Title is private"
                      data-url="https://github.com/EcrituresNumeriques/stylo/issues/1344"
                      data-hovercard-type="pull_request"
                      data-hovercard-url="/EcrituresNumeriques/stylo/pull/1344/hovercard"
                      href="https://github.com/EcrituresNumeriques/stylo/pull/1344"
                    >
                      #1344
                    </a>
                  </li>
                </ul>
                <h2>Maintenance</h2>
                <ul>
                  <li>
                    Supprime l'action TAG_CREATED (plus utilisée) by{' '}
                    <a
                      class="user-mention notranslate"
                      data-hovercard-type="user"
                      data-hovercard-url="/users/ggrossetie/hovercard"
                      data-octo-click="hovercard-link-click"
                      data-octo-dimensions="link_type:self"
                      href="https://github.com/ggrossetie"
                    >
                      @ggrossetie
                    </a>{' '}
                    in{' '}
                    <a
                      class="issue-link js-issue-link"
                      data-error-text="Failed to load title"
                      data-id="2921323811"
                      data-permission-text="Title is private"
                      data-url="https://github.com/EcrituresNumeriques/stylo/issues/1346"
                      data-hovercard-type="pull_request"
                      data-hovercard-url="/EcrituresNumeriques/stylo/pull/1346/hovercard"
                      href="https://github.com/EcrituresNumeriques/stylo/pull/1346"
                    >
                      #1346
                    </a>
                  </li>
                  <li>
                    Mise à jour vers MongoDB 5 by{' '}
                    <a
                      class="user-mention notranslate"
                      data-hovercard-type="user"
                      data-hovercard-url="/users/thom4parisot/hovercard"
                      data-octo-click="hovercard-link-click"
                      data-octo-dimensions="link_type:self"
                      href="https://github.com/thom4parisot"
                    >
                      @thom4parisot
                    </a>{' '}
                    in{' '}
                    <a
                      class="issue-link js-issue-link"
                      data-error-text="Failed to load title"
                      data-id="2896837461"
                      data-permission-text="Title is private"
                      data-url="https://github.com/EcrituresNumeriques/stylo/issues/1320"
                      data-hovercard-type="pull_request"
                      data-hovercard-url="/EcrituresNumeriques/stylo/pull/1320/hovercard"
                      href="https://github.com/EcrituresNumeriques/stylo/pull/1320"
                    >
                      #1320
                    </a>
                  </li>
                  <li>
                    Mise à jour de @monaco-editor/react en version 4.7.0 by{' '}
                    <a
                      class="user-mention notranslate"
                      data-hovercard-type="user"
                      data-hovercard-url="/users/ggrossetie/hovercard"
                      data-octo-click="hovercard-link-click"
                      data-octo-dimensions="link_type:self"
                      href="https://github.com/ggrossetie"
                    >
                      @ggrossetie
                    </a>{' '}
                    in{' '}
                    <a
                      class="issue-link js-issue-link"
                      data-error-text="Failed to load title"
                      data-id="2881784265"
                      data-permission-text="Title is private"
                      data-url="https://github.com/EcrituresNumeriques/stylo/issues/1301"
                      data-hovercard-type="pull_request"
                      data-hovercard-url="/EcrituresNumeriques/stylo/pull/1301/hovercard"
                      href="https://github.com/EcrituresNumeriques/stylo/pull/1301"
                    >
                      #1301
                    </a>
                  </li>
                </ul>
              </details>
            </p>

            <p>
              <a
                href="https://github.com/EcrituresNumeriques/stylo/releases"
                target="_blank"
                rel="noreferrer noopener"
                className={buttonStyles.linkSecondary}
              >
                {tGlobal('more.about')}
              </a>
            </p>
          </article>
        </div>

        <h2>{t('news.publications.title')}</h2>
        {/* https://api.zotero.org/groups/322999/items/top?direction=desc&format=atom&qmode=titleCreatorYear&sort=date&tag=Stylo,_nettoy%C3%A9 */}

        <div className={styles.desktopGridOf3}>
          <article className={styles.article}>
            <h3>
              [Revue 3.0] Atelier « Recherche et IA »: Séance du 27 février 2025
            </h3>

            <ul className={styles.articleMetadata}>
              <li>
                <CircleUser className="icon" aria-label="Auteurice" />{' '}
                Vitali-Rosati
              </li>
              <li>
                <CalendarDays className="icon" aria-label="Date :" /> 2025/2/28
              </li>
              <li>
                <Star className="icon" aria-label="Type de publication :" />{' '}
                Video Recording
              </li>
            </ul>

            <a
              href="https://nakala.fr/10.34847/nkl.7b4c3o39"
              target="_blank"
              rel="noreferrer noopener"
              className={buttonStyles.linkSecondary}
            >
              Plus d'infos
            </a>
          </article>

          <article className={styles.article}>
            <h3>
              Balado Skholé, épisode 7 (saison 2): Le worldmaking – Enrico
              Agostini-Marchese
            </h3>

            <ul className={styles.articleMetadata}>
              <li>
                <CircleUser className="icon" aria-label="Auteurice" />{' '}
                Vitali-Rosati
              </li>
              <li>
                <CalendarDays className="icon" aria-label="Date :" /> 2025-02-06
              </li>
              <li>
                <Star className="icon" aria-label="Type de publication :" />{' '}
                Audio Recording
              </li>
            </ul>

            <a
              href="https://open.spotify.com/episode/4VIFzp2IJefDiZ9lj5mG4h"
              target="_blank"
              rel="noreferrer noopener"
              className={buttonStyles.linkSecondary}
            >
              {tGlobal('more.about')}
            </a>
          </article>

          <article className={styles.article}>
            <h3>#dérive : lire Montréal</h3>

            <ul className={styles.articleMetadata}>
              <li>
                <CircleUser className="icon" aria-label="Auteurice" />{' '}
                Emmanuelle Lescouet
              </li>
              <li>
                <Newspaper className="icon" aria-label="Publication :" />{' '}
                Flamme/1
              </li>
              <li>
                <CalendarDays className="icon" aria-label="Date :" /> 2022
              </li>
              <li>
                <Star className="icon" aria-label="Type de publication :" />{' '}
                Journal Article
              </li>
            </ul>

            <a
              href="https://papyrus.bib.umontreal.ca/xmlui/handle/1866/27708"
              target="_blank"
              rel="noreferrer noopener"
              className={buttonStyles.linkSecondary}
            >
              {tGlobal('more.about')}
            </a>
          </article>
        </div>
      </section>

      <section className={styles.sectionAlternate}>
        <h1>{t('contactus.title')}</h1>

        <p>{t('contactus.description')}</p>

        <p className={styles.spacer}>
          <a href="#" className={buttonStyles.linkPrimary} target="_blank">
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
