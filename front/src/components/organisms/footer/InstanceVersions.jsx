import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import useComponentVisible from '../../../hooks/componentVisible.js'
import { useInstanceVersions } from '../../../hooks/instance.js'

import styles from './InstanceVersions.module.scss'

/**
 * Bouton qui déplie les versions du service d'export et de pandoc-api
 * utilisées par l'instance. Rien n'est affiché quand aucune n'est connue.
 *
 * @returns {JSX.Element | null}
 */
export default function InstanceVersions() {
  const { t } = useTranslation()
  const { exportVersion, pandocApiVersion } = useInstanceVersions()
  const { id, ref, isComponentVisible, toggleComponentIsVisible } =
    useComponentVisible({ trapNavigation: false })

  if (!exportVersion && !pandocApiVersion) {
    return null
  }

  return (
    <span className={styles.container} ref={ref}>
      <button
        type="button"
        className={styles.button}
        aria-label={t('footer.instanceVersions.button')}
        title={t('footer.instanceVersions.button')}
        aria-expanded={isComponentVisible}
        aria-controls={id}
        onClick={toggleComponentIsVisible}
      >
        <Info aria-hidden size="1em" />
      </button>

      <dl id={id} className={styles.versions} hidden={!isComponentVisible}>
        {exportVersion && (
          <div>
            <dt>{t('footer.instanceVersions.export')}</dt>
            <dd>{exportVersion}</dd>
          </div>
        )}
        {pandocApiVersion && (
          <div>
            <dt>{t('footer.instanceVersions.pandocApi')}</dt>
            <dd>{pandocApiVersion}</dd>
          </div>
        )}
      </dl>
    </span>
  )
}
