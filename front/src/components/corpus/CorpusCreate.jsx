import { Button, useInput } from '@geist-ui/core'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import Field from '../Field.jsx'


export default function CorpusCreate ({ onSubmit }) {
  const { t } = useTranslation()
  const { state: title, bindings: titleBindings } = useInput('')
  const titleInputRef = useRef()

  useEffect(() => {
    if (titleInputRef.current !== undefined) {
      titleInputRef.current.focus()
    }
  }, [titleInputRef])
  return (
    <section>
      <form>
        <Field
          ref={titleInputRef}
          {...titleBindings}
          label={t('corpus.createForm.titleField')}
          type="text"
        />
        <ul>
          <li>
            <Button
              type="secondary"
              title={t('corpus.createForm.buttonTitle')}>
              {t('corpus.createForm.buttonText')}
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}
