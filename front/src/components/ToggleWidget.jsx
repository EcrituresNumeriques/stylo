import { Translation } from 'react-i18next'

import { Toggle } from './molecules/index.js'

import styles from './ToggleWidget.module.scss'

export default function ToggleWidget(props) {
  const title = props.uiSchema['ui:title']
  return (
    <Translation ns="form" useSuspense={false}>
      {(t) => (
        <Toggle
          checked={props.value === 'checked'}
          title={t(title)}
          onChange={() => props.onChange(!props.value)}
          className={styles.toggle}
        >
          {t(title)}
        </Toggle>
      )}
    </Translation>
  )
}
