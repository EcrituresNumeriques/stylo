import { Search } from 'lucide-react'
import buttonStyles from '../components/atoms/Button.module.scss'
import { Field, Select } from '../components/atoms/index.js'
import SchemaForm from '../components/molecules/Form.jsx'
import { Combobox, Toggle } from '../components/molecules/index.js'
import schema from './form-story.schema.json'
import uiSchema from './form-story-ui-schema.json'

export default function FormStory() {
  return (
    <>
      <h4>Recherche</h4>
      <Field placeholder="Search" icon={<Search />} />
      <h4>Champ de texte</h4>
      <div style={{ 'max-width': '50%' }}>
        <textarea className={buttonStyles.textarea} rows="10">
          Du texte
        </textarea>
      </div>
      <h4>Liste déroulante</h4>
      <Select>
        <option>Tome de Savoie</option>
        <option>Reblochon</option>
        <option>St Marcellin</option>
      </Select>

      <fieldset>
        <legend>
          <h4>Interrupteur</h4>
        </legend>

        <p>
          <Toggle name="example-toggle" />
        </p>
        <p>
          <Toggle disabled checked={true} />
        </p>
        <p>
          <Toggle
            id="toggle-id"
            name="toggle-name"
            labelKey="story.ux.toggle_unique"
          />
        </p>
        <p>
          <Toggle disabled labelKey="story.ux.toggle_unique" />
        </p>
        <p>
          <Toggle checked={true} labelKey="story.ux.toggle" />
        </p>
        <p>
          <Toggle checked={true} labelKey="story.ux.toggle" />
        </p>
      </fieldset>

      <fieldset>
        <legend>
          <h4>Liste déroulante</h4>
        </legend>

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
      </fieldset>

      <SchemaForm formData={{}} uiSchema={uiSchema} schema={schema} />
    </>
  )
}
