import { Search } from 'lucide-react'
import React from 'react'

import uiSchema from './form-story-ui-schema.json'
import schema from './form-story.schema.json'

import { Field, Select } from '../components/atoms/index.js'
import { Toggle } from '../components/molecules/index.js'

import SchemaForm from '../components/molecules/Form.jsx'

import buttonStyles from '../components/atoms/Button.module.scss'

export default function FormStory() {
  return (
    <>
      <h4>Recherche</h4>
      <Field placeholder="Search" icon={Search} />
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

        <Toggle />
        <Toggle disabled checked={true} />
        <Toggle id="toggle-id" name="toggle-name">
          YAML
        </Toggle>
        <Toggle disabled>YAML</Toggle>
        <Toggle
          checked={true}
          labels={{ true: 'coche activée', false: 'coche désactivée' }}
        />
        <Toggle
          checked={true}
          labels={{ true: 'coche activée', false: 'coche désactivée' }}
        >
          Texte fixe (<code>aria-label</code> dynamique)
        </Toggle>
      </fieldset>

      <fieldset>
        <legend>
          <h4>Interrupteur (dans formulaire)</h4>
        </legend>

        <Field label="Acceptez-vous de cocher cette case ?" id="example-toggle">
          <Toggle id="example-toggle" />
        </Field>
      </fieldset>

      <SchemaForm formData={{}} uiSchema={uiSchema} schema={schema} />
    </>
  )
}
