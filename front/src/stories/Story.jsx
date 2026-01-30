import React from 'react'

import i18n from '../i18n.js'

import {
  Button,
  CreatedByLabel,
  PageTitle,
  UpdatedAtLabel,
} from '../components/atoms/index.js'
import {
  Alert,
  Avatar,
  Combobox,
  FormActions,
  Loading,
  Modal,
  Version,
} from '../components/molecules/index.js'
import { useModal } from '../hooks/modal.js'

import CollaborativeEditorWebSocketStatus from '../components/organisms/textEditor/CollaborativeEditorWebSocketStatus.jsx'
import ButtonStory from './Button.story.jsx'
import FormStory from './Form.story.jsx'
import SidebarStory from './Sidebar.story.jsx'

import buttonStyles from '../components/atoms/Button.module.scss'
import styles from '../layout.module.scss'
import storyStyles from './story.module.scss'

export default function Story() {
  const modalText = useModal()
  const modalForm = useModal()
  return (
    <div className={styles.container}>
      <section aria-label="Typographie">
        <PageTitle title="Titre de la page" />
        <h1>Titre 1</h1>
        <h2>Titre 2</h2>
        <h3>Titre 3</h3>
        <h4>Titre 4</h4>
        <h5>Titre 5</h5>

        <p className={styles.hero}>
          Stylo est un éditeur de texte sémantique, créé pour écrire des textes
          scientifiques
        </p>

        <p>
          C&apos;est également un projet de recherche réalisé par l’équipe de la
          Chaire de recherche du Canada sur les écritures numériques
        </p>

        <p>
          texte <span>span</span> <small>small</small>
          <sup>script</sup> et <sub>subscript</sub>
        </p>

        <p>
          <a href="#">hyperlien</a>
        </p>

        <table>
          <caption>Légende tableau</caption>
          <thead>
            <tr>
              <th scope="col">Entête 1</th>
              <th scope="col">Entête 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cellule 1</td>
              <td>Cellule 2</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Pied de page 1</td>
              <td>Pied de page 2</td>
            </tr>
          </tfoot>
        </table>

        <p>
          <img src="/android-chrome-192x192.png" alt="" />
        </p>

        <p>
          <figure>
            <figcaption>Légende</figcaption>
            <img src="/android-chrome-192x192.png" alt="" />
          </figure>
        </p>

        <ul>
          <li>Élément a</li>
          <li>Élément b</li>
        </ul>

        <ol>
          <li>Élément 1</li>
          <li>Élément 2</li>
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
          <legend>Légende</legend>

          <p>Paragraphe</p>
        </fieldset>

        <details open>
          <summary>Résumé</summary>

          <p>Paragraphe</p>
        </details>
      </section>

      <section aria-label="Boutons">
        <ButtonStory />
      </section>

      <section aria-label="États">
        <h4>Chargement</h4>
        <Loading />
        <Loading size={'1.5rem'} />
        <Loading size={'2rem'} />
        <Loading label={''} />
        <h4>Alerte</h4>
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
        <h4>Statuts</h4>
        <h5>Connecté</h5>
        <CollaborativeEditorWebSocketStatus status={'connected'} />
        <h5>Connexion...</h5>
        <CollaborativeEditorWebSocketStatus status={'connecting'} />
        <h5>Déconnecté</h5>
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

      <section aria-label="Avatars">
        <Avatar text="GG" />
        <Avatar text="TP" />
        <Avatar text="Roch" />
      </section>

      <section aria-label="Objets">
        <CreatedByLabel name={"Nom de l'utilisateur"} />
        <br />
        <UpdatedAtLabel date={new Date()} />
      </section>

      <section aria-label="Dialogues">
        <Button onClick={() => modalText.show()}>
          Ouvrir un dialogue avec du texte
        </Button>
        <Modal {...modalText.bindings}>Bonjour :)</Modal>

        <Button onClick={() => modalForm.show()}>
          Ouvrir un dialogue avec un formulaire
        </Button>
        <Modal {...modalForm.bindings}>
          <Combobox
            onChange={() => {}}
            items={[
              {
                key: '1',
                name: 'Bonjour',
                index: 1,
              },
              {
                key: '2',
                name: 'Salut',
                index: 2,
              },
            ]}
          />
          <FormActions></FormActions>
        </Modal>
      </section>
    </div>
  )
}
