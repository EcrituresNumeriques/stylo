import { useTranslation } from 'react-i18next'

import Alert from '../../molecules/Alert.jsx'
import Combobox from '../../molecules/SelectCombobox.jsx'

/**
 * @typedef {import('../../molecules/SelectCombobox.jsx').ComboboxItem} ComboboxItem
 */

/**
 * Liste des collections Zotero du compte, récupérées en asynchrone.
 *
 * @param {object} props
 * @param {ComboboxItem[]} props.items
 * @param {string} props.value
 * @param {(string) => void} props.onChange
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.hasError]
 * @returns {React.ReactElement}
 */
export default function BibliographyZoteroCollections({
  items,
  value,
  onChange,
  isLoading = false,
  hasError = false,
}) {
  const { t } = useTranslation()

  if (hasError) {
    return <Alert message={t('bibliography.importZotero.collections.error')} />
  }

  // the loading message is displayed inside the field, so that the layout
  // does not move once the collections are loaded
  return (
    <>
      <Combobox
        label=""
        items={items}
        value={value}
        onChange={onChange}
        isLoading={isLoading}
        loadingLabel="bibliography.importZotero.collections.loading"
      />
      <span role="status" className="sr-only">
        {isLoading && t('bibliography.importZotero.collections.loading')}
      </span>
    </>
  )
}
