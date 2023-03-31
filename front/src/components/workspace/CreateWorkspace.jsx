import React, {useCallback, useState} from 'react'
import {useDispatch} from 'react-redux'
import {Check} from 'react-feather'

import Field from '../Field.jsx'
import Button from '../Button.jsx'

import styles from './createWorkspace.module.scss'
import {randomColor} from '../../helpers/colors.js'

export default function CreateWorkspace({onCancel = () => {}}) {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [color, setColor] = useState(randomColor())
  const createWorkspace = useCallback(() => dispatch({type: 'CREATE_WORKSPACE', data: {name, color}}), [name, color])

  return (
    <section className={styles.container}>
      <form onSubmit={(event) => {
        event.preventDefault()
        createWorkspace()
      }}>
        <Field
          type="text"
          placeholder="Nom de l’espace"
          autoFocus={true}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <ul className={styles.actions}>
          <li>
            <Button type="button" onClick={onCancel}>Annuler</Button>
          </li>
          <li>
            <Button primary={true} type="submit" title="Créer l'espace">
              <Check/> Créer l’espace
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}