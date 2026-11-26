/** @type {import('../../../molecules/monaco.js').LanguageConfig} */
export default {
  id: 'bibtex',
  load(monaco) {
    monaco.languages.register({ id: 'bibtex' })
    // Taken from https://github.com/koka-lang/madoko/blob/master/styles/lang/bibtex.json
    monaco.languages.setMonarchTokensProvider(
      'bibtex',
      import('./bibtex.json').then((module) => module.default)
    )
  },
}
