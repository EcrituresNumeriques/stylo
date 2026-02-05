import React from 'react'

import { useNakalaUserCollection } from '../../../hooks/nakala.js'
import { Alert } from '../../molecules/index.js'

import Combobox from '../../molecules/SelectCombobox.jsx'

export default function NakalaUserCollectionsCombobox({ onChange }) {
  const { records, isLoading, error } = useNakalaUserCollection('all', {
    orders: ['creDate,desc'],
  })

  if (error) return <Alert message={error.message} />

  const items =
    records?.map((r, index) => ({
      name: `${r.name} (${r.identifier})`,
      key: r.identifier,
      index,
    })) ?? []
  return (
    <Combobox
      isLoading={isLoading}
      label=""
      items={items}
      value={''}
      onChange={onChange}
    />
  )
}
