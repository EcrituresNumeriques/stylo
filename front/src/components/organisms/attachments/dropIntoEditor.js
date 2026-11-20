import i18n from 'i18next'
import * as vscode from 'monaco-editor'
import { toast } from 'react-toastify'

import { applicationConfig } from '../../../config.js'

function replacePlaceholder(editor, placeholder, text) {
  const [match] = editor.getModel().findMatches(placeholder) ?? []
  if (match) {
    editor.executeEdits('replace-uploading-placeholder', [
      { range: match.range, text, forceMoveMarkers: true },
    ])
  }
}

/**
 * Uploads dropped images to the storage account of the user.
 *
 * @param {import('monaco-editor').editor.IStandaloneCodeEditor} editor
 * @param {() => { articleId: string, sessionToken: string }} getContext
 */
export function onDropIntoEditor(editor, getContext) {
  return async ({ position, event }) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const { lineNumber } = position
    let column = position.column
    const placeholderOf = (file) => `<!-- Uploading ${file.name} -->`

    for (const file of files) {
      const placeholder = placeholderOf(file)
      editor.executeEdits('insert-uploading-placeholder', [
        {
          range: new vscode.Range(lineNumber, column, lineNumber, column),
          text: `${placeholder} `,
          forceMoveMarkers: true,
        },
      ])
      column = column + placeholder.length + 1
      editor.setPosition({ lineNumber, column })
    }

    const { articleId, sessionToken } = getContext()

    // sequential upload
    for (const file of files) {
      const placeholder = placeholderOf(file)
      try {
        const response = await fetch(
          `${applicationConfig.backendEndpoint}/graphql/attachments?${new URLSearchParams({ articleId, name: file.name })}`,
          {
            method: 'POST',
            headers: {
              'content-type': file.type,
              authorization: `Bearer ${sessionToken}`,
            },
            body: file,
          }
        )
        const result = await response.json()

        if (response.ok) {
          replacePlaceholder(editor, placeholder, result.markdown)
          continue
        }

        replacePlaceholder(editor, placeholder, '')

        if (result.error === 'NO_STORAGE') {
          toast(i18n.t('attachments.noStorage', { ns: 'editor' }), {
            type: 'warning',
            onClick: () => window.location.assign('/credentials'),
          })
          break
        }

        throw new Error(result.message)
      } catch (error) {
        replacePlaceholder(editor, placeholder, '')
        console.error(`Error while uploading file: ${file.name}`, error)
        toast(
          i18n.t('attachments.uploadError', { ns: 'editor', name: file.name }),
          {
            type: 'error',
          }
        )
      }
    }
  }
}
