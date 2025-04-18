import debounce from 'lodash.debounce'
import { useEffect, useRef, useState } from 'react'
import { BibliographyCompletionProvider } from '../components/Write/providers/monaco/support.js'
import { validate } from '../helpers/bibtex.js'

export const validationResultInitialState = (text) => {
  const empty = text.trim().length === 0
  return {
    entries: {},
    loading: !empty,
    empty,
    errors: [],
    warnings: [],
    text,
  }
}

export default function useBibliography({ initialText }) {
  const [validationResult, setValidationResult] = useState(
    validationResultInitialState(initialText)
  )

  const validateBibTeX = debounce(async (bibtex, callback) => {
    const result = await validate(bibtex)
    const validationResult = {
      ...result,
      loading: false,
      text: bibtex,
    }
    setValidationResult(validationResult)
    callback && callback(validationResult)
  }, 700)

  const updateText = async function (bibtex, callback) {
    setValidationResult(validationResultInitialState(bibtex))
    await validateBibTeX(bibtex, callback)
  }

  useEffect(() => {
    ;(async () => {
      await updateText(initialText)
    })()
  }, [initialText])

  return {
    updateText,
    references: validationResult.entries,
    isValid:
      validationResult.errors.length === 0 &&
      validationResult.warnings.length === 0,
    isLoading: validationResult.loading,
    errors: validationResult.errors,
    warnings: validationResult.warnings,
  }
}

export function useBibliographyCompletion() {
  const bibliographyCompletionProvider = useRef(
    new BibliographyCompletionProvider([])
  )

  return {
    provider: bibliographyCompletionProvider.current,
  }
}
