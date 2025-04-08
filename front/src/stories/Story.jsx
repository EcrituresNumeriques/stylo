import React from 'react'

import CollaborativeEditorWebSocketStatus from '../components/collaborative/CollaborativeEditorWebSocketStatus.jsx'
import Alert from '../components/molecules/Alert.jsx'
import Loading from '../components/molecules/Loading.jsx'
import Version from '../components/molecules/Version.jsx'
import ButtonStory from './Button.story.jsx'
import FormStory from './Form.story.jsx'
import SidebarStory from './Sidebar.story.jsx'

import i18n from '../i18n.js'

import buttonStyles from '../components/button.module.scss'
import styles from '../layout.module.scss'
import storyStyles from './story.module.scss'

export default function Story() {
  return (
    <div className={styles.container}>
      <section aria-label="Typographie">
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>

        <p className={styles.hero}>
          Stylo est un éditeur de texte sémantique, créé pour écrire des textes
          scientifiques
        </p>

        <p>
          C&apos;est également un projet de recherche réalisé par l’équipe de la
          Chaire de recherche du Canada sur les écritures numériques
        </p>

        <p>
          regular <span>span</span> <small>small</small>
          <sup>script</sup> and <sub>subscript</sub>
        </p>

        <p>
          <a href="#">hyperlink</a>
        </p>

        <table>
          <caption>table caption</caption>
          <thead>
            <tr>
              <th scope="col">header 1</th>
              <th scope="col">header 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>cell 1</td>
              <td>cell 2</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>footer 1</td>
              <td>footer 2</td>
            </tr>
          </tfoot>
        </table>

        <p>
          <img src="/android-chrome-192x192.png" alt="" />
        </p>

        <p>
          <figure>
            <figcaption>caption</figcaption>
            <img src="/android-chrome-192x192.png" alt="" />
          </figure>
        </p>

        <ul>
          <li>item a</li>
          <li>item b</li>
        </ul>

        <ol>
          <li>item 1</li>
          <li>item 2</li>
        </ol>

        <div className={styles.container}>
          <section className={styles.sectionPrimary}>
            <h1>Section</h1>
            <p className={styles.hero}>Texte en exergue.</p>

            <p>Paragraphe ordinaire.</p>

            <p>Autre paragraphe.</p>
          </section>

          <section className={styles.sectionAlternate}>
            <h1>Section (alternative)</h1>

            <p>
              Projet de recherche et outil prototype adapté pour les revues en
              Sciences Humaines et Sociales.
            </p>
          </section>

          <section className={styles.sectionPrimary}>
            <h1>Actualités</h1>

            <h2>Publications</h2>

            <div className={styles.desktopGridOf3}>
              <article className={styles.article}>
                <h3>
                  Stylo en 2023 : de nouvelles fonctionnalités pour
                  l&apos;écriture et l&apos;édition scientifique
                </h3>

                <ul className={styles.articleMetadata}>
                  <li>
                    <time>2023-06</time>
                  </li>
                </ul>

                <a className={buttonStyles.linkSecondary} href="#">
                  Plus d&apos;infos
                </a>
              </article>
              <article className={styles.article}>
                <h3>
                  Stylo en 2023 : de nouvelles fonctionnalités pour
                  l&apos;écriture et l&apos;édition scientifique
                </h3>

                <ul className={styles.articleMetadata}>
                  <li>
                    <time>2023-06</time>
                  </li>
                </ul>

                <a className={buttonStyles.linkSecondary} href="#">
                  Plus d&apos;infos
                </a>
              </article>
            </div>
          </section>
        </div>

        <fieldset>
          <legend>fieldset legend</legend>

          <p>some paragraph</p>
        </fieldset>

        <details open>
          <summary>details summary</summary>

          <p>some paragraph</p>
        </details>
      </section>

      <section aria-label="Boutons">
        <ButtonStory />
      </section>

      <section aria-label="États">
        <h4>Loading</h4>
        <Loading />
        <Loading size={'1.5rem'} />
        <Loading size={'2rem'} />
        <Loading label={''} />
        <h4>Alert</h4>
        <Alert type={'warning'} message={'Warning'} />
        <Alert type={'error'} message={'Error'} />
        <Alert type={'info'} message={'Info'} />
        <Alert type={'success'} message={'Success'} />
        <Alert type={'success'} message={'Success'} showIcon={false} />
      </section>

      <section aria-label="Formulaires">
        <FormStory />
      </section>

      <section aria-label="Barre latérale">
        <SidebarStory />
      </section>

      <section aria-label="Éditeur de texte">
        <h4>Status</h4>
        <h5>Connected</h5>
        <CollaborativeEditorWebSocketStatus status={'connected'} />
        <h5>Connecting</h5>
        <CollaborativeEditorWebSocketStatus status={'connecting'} />
        <h5>Disconnected</h5>
        <CollaborativeEditorWebSocketStatus
          status={'disconnected'}
          state={'started'}
        />
      </section>

      <section className={storyStyles.versions} aria-label="Versions">
        <Version
          type="workingCopy"
          description=""
          title={'Version de travail'}
          creator={'ggrossetie'}
          date={new Date('2025-04-07T03:24:00')}
        />
        <Version
          description={
            'Cohérence des titres de section et mise à jour de la table des matières.'
          }
          title={'Version 1.2'}
          creator={'ggrossetie'}
          date={new Date('2025-04-06T03:24:00')}
        />
        <div className={storyStyles.yearGroup}>
          {new Intl.DateTimeFormat(i18n.language, {
            month: 'long',
            year: 'numeric',
          }).format(new Date('2025-03-23T03:24:00'))}
        </div>
        <Version
          description=""
          type="editingSessionEnded"
          title={'Session d’édition terminée'}
          creator={'ggrossetie'}
          date={new Date('2025-03-23T03:24:00')}
        />
      </section>
    </div>
  )
}
