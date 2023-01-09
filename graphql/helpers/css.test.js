const { prefixRulesWith } = require('./css.js')

describe('prefixRulesWith', () => {
  const sample = `@page {
    size: 8.5in 11in;
    margin: 20mm 25mm;

    @footnote {
      margin: 0.6em 0 0 0;
      padding: 0.3em 0 0 0;
      max-height: 10em;
    }

    @top-center {
      vertical-align: bottom;
      padding-bottom: 10mm;
      content: string(booktitle);
    }
  }

  @page :left {
    margin: 20mm 40mm 20mm 30mm;

    @top-left {
      vertical-align: bottom;
      padding-bottom: 10mm;
      content: string(page-number, first-except);
      letter-spacing: 0.1em;
      margin-left: -1em;
      font-size: 0.9em;
   }
}

@font-face {
  font-family: 'Stix';
  font-weight: normal;
  font-style: normal;
}

:root {
  --red: #f00;
}

body {
  font: Stix, sans-serif;
}

.stylo-pagedjs-container h1 {
  string-set: booktitle content(text);
}

section { break-before: right; }

.copyright-rw { padding: 0; }

@media all and (orientation:landscape) {
  p { font-family: sans-serif; }
}
`
  const transformedCss = prefixRulesWith('stylo-pagedjs-container', sample)

  test('works with empty input', () => {
    expect(prefixRulesWith('stylo-pagedjs-container', '')).toEqual('')
  })

  test('skip non rules', () => {
    expect(transformedCss).toMatch('@page{size:8.5in 11in;margin:20mm 25mm;@footnote{')
    expect(transformedCss).toMatch('@page :left{margin:20mm 40mm 20mm 30mm;@top-left{')
    expect(transformedCss).toMatch('@font-face{font-family:"Stix";font-weight:normal;font-style:normal}')
  })

  test('prefix adequate rules', () => {
    expect(transformedCss).toMatch('}:root{--red: #f00}')
    expect(transformedCss).toMatch('}.stylo-pagedjs-container h1{string-set:booktitle content(text)}')
    expect(transformedCss).toMatch('}.stylo-pagedjs-container section{break-before:right}')
    expect(transformedCss).toMatch('}.stylo-pagedjs-container .copyright-rw{padding:0}')
    expect(transformedCss).toMatch('{.stylo-pagedjs-container p{font-family:sans-serif}')
  })

  test('substitute body with selectorName', () => {
    expect(transformedCss).toMatch('}.stylo-pagedjs-container{font:Stix,sans-serif}')
  })
})
