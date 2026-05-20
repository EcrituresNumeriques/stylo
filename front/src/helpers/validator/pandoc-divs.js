/**
 * Minimal parser for pandoc-style fenced divs `:::{.class attr="val"}`.
 * remark-directive does not correctly handle multiple consecutive nested
 * containers at the same `:::` depth, so we parse the structure ourselves.
 * @typedef {{ type: 'div', className: string, attrs: Record<string, string>, startLine: number, endLine: number|null, children: DivNode[] }} DivNode
 */

/**
 * @param {string} attrsStr - raw content inside `{...}`
 * @returns {Record<string, string>}
 */
function parseAttrs(attrsStr) {
  const attrs = {}
  const attrRx = /([a-zA-Z0-9_-]+)="([^"]*)"/g
  let m
  while ((m = attrRx.exec(attrsStr)) !== null) {
    attrs[m[1]] = m[2]
  }
  const classMatch = attrsStr.match(/\.([a-zA-Z0-9_-]+)/)
  if (classMatch) {
    attrs._class = classMatch[1]
  }
  return attrs
}

/**
 * Parse pandoc fenced divs from raw markdown, returning a tree
 * that correctly reflects the nesting based on stack tracking.
 * @param {string} markdown
 * @returns {DivNode[]} top-level div nodes
 */
export function parsePandocFencedDivs(markdown) {
  const lines = markdown.split('\n')
  const root = { children: [] }
  const stack = [root]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    const openMatch = line.match(/^(:::+)\{([^}]*)\}\s*$/)
    if (openMatch) {
      const attrs = parseAttrs(openMatch[2])
      const node = {
        type: 'div',
        className: attrs._class ?? '',
        attrs,
        startLine: lineNum,
        endLine: null,
        children: [],
      }
      stack[stack.length - 1].children.push(node)
      stack.push(node)
      continue
    }

    const closeMatch = line.match(/^:::\s*$/)
    if (closeMatch && stack.length > 1) {
      stack.pop().endLine = lineNum
    }
  }

  while (stack.length > 1) {
    stack.pop().endLine = lines.length
  }

  return root.children
}

/**
 * Walk the div tree and call `fn` for each div node (depth-first).
 * @param {DivNode[]} nodes
 * @param {(node: DivNode) => void} fn
 */
export function walkDivs(nodes, fn) {
  for (const node of nodes) {
    fn(node)
    walkDivs(node.children, fn)
  }
}
