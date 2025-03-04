import { Tabs } from '@geist-ui/core'
import React from 'react'
import { Search } from 'react-feather'
import buttonStyles from '../components/button.module.scss'
import Field from '../components/Field.jsx'
import Alert from '../components/molecules/Alert.jsx'
import Loading from '../components/molecules/Loading.jsx'
import Select from '../components/Select.jsx'
import ButtonStory from './Button.story.jsx'
import FormStory from './Form.story.jsx'

import styles from './story.module.scss'

export default function Story() {
  return (
    <div className={styles.container}>
      <Tabs initialValue="1">
        <Tabs.Item label="buttons" value="1">
          <ButtonStory />
        </Tabs.Item>
        <Tabs.Item label="state" value="2">
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
        </Tabs.Item>
        <Tabs.Item label="form" value="3">
          <FormStory />
        </Tabs.Item>
        <Tabs.Item label="fields" value="4">
          <h2>Fields</h2>
          <h4>Search</h4>
          <Field placeholder="Search" icon={Search} />
          <h4>Textarea</h4>
          <div style={{ 'max-width': '50%' }}>
            <textarea className={buttonStyles.textarea} rows="10">
              Du texte
            </textarea>
          </div>
          <h4>Select</h4>
          <Select>
            <option>Tome de Savoie</option>
            <option>Reblochon</option>
            <option>St Marcellin</option>
          </Select>
        </Tabs.Item>
      </Tabs>
    </div>
  )
}
