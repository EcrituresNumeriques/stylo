import { Tabs } from '@geist-ui/core'
import React from 'react'
import { Search } from 'lucide-react'
import buttonStyles from '../components/button.module.scss'
import CollaborativeEditorWebSocketStatus from '../components/collaborative/CollaborativeEditorWebSocketStatus.jsx'
import Field from '../components/Field.jsx'
import Alert from '../components/molecules/Alert.jsx'
import Loading from '../components/molecules/Loading.jsx'
import Select from '../components/Select.jsx'
import ButtonStory from './Button.story.jsx'
import FormStory from './Form.story.jsx'
import SidebarStory from './Sidebar.story.jsx'

import styles from './story.module.scss'

export default function Story() {
  return (
    <div className={styles.container}>
      <Tabs initialValue="1">
        <Tabs.Item label="typography" value="1">
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>

          <p>paragraph</p>

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

          <fieldset>
            <legend>fieldset legend</legend>

            <p>some paragraph</p>
          </fieldset>

          <details open>
            <summary>details summary</summary>

            <p>some paragraph</p>
          </details>
        </Tabs.Item>

        <Tabs.Item label="buttons" value="2">
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
        <Tabs.Item label="sidebar" value="5">
          <SidebarStory />
        </Tabs.Item>
        <Tabs.Item label="Collaborative editor" value="6">
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
        </Tabs.Item>
      </Tabs>
    </div>
  )
}
