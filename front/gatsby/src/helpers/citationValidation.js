import debounce from 'lodash/debounce'
import { validate } from './bibtex'

const delayedValidateCitation = debounce(
  (bibTeX, setCitationValidationResult, next) =>
    validateCitation(bibTeX, setCitationValidationResult, next),
  1000
)

const validateCitation = (bibTeX, setCitationValidationResult, next) => {
  next(bibTeX)

  validate(bibTeX).then((result) => {
    if (result.warnings.length || result.errors.length) {
      setCitationValidationResult({
        valid: false,
        messages: [...result.errors, ...result.warnings],
      })
    } else {
      setCitationValidationResult({
        valid: result.empty || result.success !== 0,
      })
    }
  })
}

export default delayedValidateCitation
