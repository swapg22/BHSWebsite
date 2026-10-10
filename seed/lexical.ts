/**
 * Converts simple markdown-like text into Payload's Lexical rich text JSON for seeding.
 * Supports: "## " / "### " headings, "- " bullet lists, "> " quotes, **bold**, blank-line paragraphs.
 */

type Node = Record<string, unknown>

function textNodes(line: string): Node[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((p) => {
    const bold = p.startsWith('**') && p.endsWith('**')
    return { type: 'text', text: bold ? p.slice(2, -2) : p, format: bold ? 1 : 0, detail: 0, mode: 'normal', style: '', version: 1 }
  })
}

const block = (type: string, children: Node[], extra: Node = {}): Node => ({
  type,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  ...extra,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lexical(md: string): any {
  const children: Node[] = []
  const chunks = md.trim().split(/\n\s*\n/)
  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim())
    if (lines.every((l) => l.startsWith('- '))) {
      children.push(
        block(
          'list',
          lines.map((l, i) => block('listitem', textNodes(l.slice(2)), { value: i + 1 })),
          { listType: 'bullet', start: 1, tag: 'ul' },
        ),
      )
    } else if (lines[0].startsWith('### ')) {
      children.push(block('heading', textNodes(lines[0].slice(4)), { tag: 'h3' }))
      if (lines.length > 1) children.push(block('paragraph', textNodes(lines.slice(1).join(' ')), { textFormat: 0, textStyle: '' }))
    } else if (lines[0].startsWith('## ')) {
      children.push(block('heading', textNodes(lines[0].slice(3)), { tag: 'h2' }))
      if (lines.length > 1) children.push(block('paragraph', textNodes(lines.slice(1).join(' ')), { textFormat: 0, textStyle: '' }))
    } else if (lines[0].startsWith('> ')) {
      children.push(block('quote', textNodes(lines.map((l) => l.replace(/^> ?/, '')).join(' '))))
    } else {
      children.push(block('paragraph', textNodes(lines.join(' ')), { textFormat: 0, textStyle: '' }))
    }
  }
  return { root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 } }
}
