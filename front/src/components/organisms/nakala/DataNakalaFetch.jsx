import { Clipboard, Rss } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'

import { Button, Field } from '../../atoms/index.js'
import { Alert } from '../../molecules/index.js'

import NakalaUserCollectionsCombobox from './NakalaUserCollectionsCombobox.jsx'

import styles from './DataNakalaFetch.module.scss'

export default function DataNakalaFetch({ initialCollectionUri, onChange }) {
  const { user } = useRouteLoaderData('app')
  const { t } = useTranslation('data', { useSuspense: false })
  const [collectionComboboxValue, setCollectionComboboxValue] =
    useState(initialCollectionUri)
  const [collectionInputValue, setCollectionInputValue] =
    useState(initialCollectionUri)
  const handleCollectionComboboxChange = useCallback(
    (value) => setCollectionComboboxValue(value),
    [setCollectionComboboxValue]
  )
  const handleCollectionInputChange = useCallback(
    (event) => setCollectionInputValue(event.target.value),
    [setCollectionInputValue]
  )
  const humanid = useMemo(() => user.authProviders?.humanid?.id, [user])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h3 className={styles.title}>
          <Rss aria-hidden /> {t('actions.fetch.fromAccount.title')}
        </h3>
        {!humanid && (
          <Alert
            message={t('actions.fetch.errors.humanid.missing')}
            type={'warning'}
          />
        )}
        {humanid && (
          <>
            {/* pour le moment, le scope share retourne aussi les collections dont l'utilisateur est propriétaire */}
            <NakalaUserCollectionsCombobox
              scope={'share'}
              value={collectionComboboxValue}
              humanid={humanid}
              onChange={handleCollectionComboboxChange}
            />
            <Button
              type="submit"
              primary
              disabled={!collectionComboboxValue}
              onClick={() => onChange(collectionComboboxValue)}
            >
              {t('actions.fetch.collection')}
            </Button>
          </>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>
          <Clipboard aria-hidden /> {t('actions.fetch.fromUrl.title')}
        </h3>
        <p>{t('actions.fetch.fromUrl.description')}</p>

        <Field
          name="url"
          value={collectionInputValue}
          onChange={handleCollectionInputChange}
          type="url"
          className={styles.field}
        />
        <Button
          type="submit"
          primary
          disabled={!collectionInputValue}
          onClick={() => onChange(collectionInputValue)}
        >
          {t('actions.fetch.collection')}
        </Button>
      </div>
    </div>
  )
}
