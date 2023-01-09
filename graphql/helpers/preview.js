const { parse, walk, generate } = require('css-tree')
const DOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')

function shouldBePrefixed ({ node, selectorName }) {
  return (
    node.type === 'Selector'
    && node.children.first.type.endsWith('Selector')
    && node.children.first.name !== selectorName
    && node.children.first.name !== 'body'
    && !(node.children.first.name === 'root' && node.children.first.type === 'PseudoClassSelector')
  )
}

/**
 * Walks all the rules from a plain text stylesheet,
 * and prefix adequate selectors with a className of our own.
 *
 * It helps "scoping" a copy/pasted stylesheet without using scoped WebComponents
 *
 * It makes it "easy" to inspect with https://astexplorer.net/
 * And by reading https://github.com/csstree/csstree/
 *
 * @param {String} selectorName
 * @param {String} css
 * @returns {String}
 */
function prefixRulesWith(selectorName, css) {
  const ast = parse(css)
  let inRule = false

  walk(ast, (node) => {
    if (node.type === 'Rule') {
        inRule = true
    }

    if (['AtRule', 'StyleSheet'].includes(node.type)) {
      inRule = false
    }

    // prefix adequate rules
    if (inRule && shouldBePrefixed({ node, selectorName })) {
        node.children.prependData({ type: 'Combinator', name: ' ' })
        node.children.prependData({ type: 'ClassSelector', name: selectorName })
    }

    // substitute body with selectorName
    if (node.type === 'TypeSelector' && node.name === 'body') {
        node.type = 'ClassSelector'
        node.name = selectorName
    }
  })

  return generate(ast)
}

function sanitizeTemplate (html) {
  const window = new JSDOM('').window
  const purify = DOMPurify(window);

  return purify.sanitize(html, {
    KEEP_CONTENT: false,
    USE_PROFILES: {
      html: true,
      svg: true,
      mathMl: true
    }
  })
}

module.exports = { prefixRulesWith, sanitizeTemplate }
