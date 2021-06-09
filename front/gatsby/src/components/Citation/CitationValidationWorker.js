import { validate } from '../../helpers/bibtex'

onmessage = function (e) {
  validate(e.data).then((articleBibValidationResult) => {
    postMessage(articleBibValidationResult)
  })
}

