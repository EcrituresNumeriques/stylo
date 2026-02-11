
import { useNakalaSearchCollections } from '../../../hooks/nakala.js'
import { Alert } from '../../molecules/index.js'

import Combobox from '../../molecules/SelectCombobox.jsx'

export default function NakalaUserCollectionsCombobox({
  scope,
  value,
  humanid,
  onChange,
}) {
  const { records, isLoading, error } = useNakalaSearchCollections({
    scope,
    humanid,
  })

  if (error) return <Alert message={error.message} />

  const items =
    records?.map((r, index) => ({
      name: `${r.name} (${r.identifier})`,
      key: r.uri,
      index,
    })) ?? []
  return (
    <Combobox
      isLoading={isLoading}
      label=""
      items={items}
      value={value}
      onChange={onChange}
    />
  )
}
