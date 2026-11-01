import type { Register } from 'claude-code'

// A topic tag opens a block of a reply as **`#tag`**. The app draws code spans
// grey, so each tag is drawn here as a chip highlighted in its own color.

// The colors a tag nobody named gets, picked by its name so it keeps one.
const PALETTE = ['#3B82F6', '#EAB308', '#22C55E', '#A855F7', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1', '#EF4444']

const TAG_LINE = /^\*\*`#([A-Za-z0-9_-]+)`\*\*[ \t]*(.*)$/
const HEX = /^#[0-9A-Fa-f]{6}$/

// "nodes=#3B82F6, viewport=#EAB308" -> { nodes: '#3B82F6', viewport: '#EAB308' }; a malformed pair is skipped.
export function parseColors(text: string): Record<string, string> {
  const colors: Record<string, string> = {}
  for (const pair of text.split(',')) {
    const [tag, color] = pair.split('=').map(s => s.trim())
    if (tag && color && HEX.test(color)) colors[tag.replace(/^#/, '').toLowerCase()] = color
  }
  return colors
}

export function colorOf(tag: string, own: Record<string, string>): string {
  const key = tag.toLowerCase()
  if (own[key]) return own[key]
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

// Dark letters on a light chip, white on a dark one.
export function lettersOn(color: string): string {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? '#1F2937' : '#FFFFFF'
}

type Block = { tag: string | null; lines: string[] }

// Splits a reply into blocks, a new one at each line that opens with a tag;
// lines inside a code fence never open one.
function split(text: string): Block[] {
  const blocks: Block[] = [{ tag: null, lines: [] }]
  let inFence = false
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    const m = inFence ? null : TAG_LINE.exec(line)
    if (m) blocks.push({ tag: m[1], lines: m[2] ? [m[2]] : [] })
    else blocks[blocks.length - 1].lines.push(line)
  }
  return blocks.filter(b => b.tag !== null || b.lines.join('').trim() !== '')
}

export const register: Register = (on, options) => {
  const own = parseColors(typeof options.colors === 'string' ? options.colors : '')

  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) => {
    if (e.props.isSummary || !/^\*\*`#[A-Za-z0-9_-]+`\*\*/m.test(e.props.text)) {
      return next(e)
    }
    const { Box, Text, Markdown } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {split(e.props.text).map((b, i) => {
          const body = b.lines.join('\n').trim()
          if (b.tag === null) return <Markdown key={`m${i}`} text={body} />
          const color = colorOf(b.tag, own)
          return (
            <Box key={`t${i}`} flexDirection="column">
              {/* A row, so the chip is as wide as its tag: in the column it stretched across the line. */}
              <Box flexDirection="row">
                <Text backgroundColor={color} color={lettersOn(color)} bold>
                  {` #${b.tag} `}
                </Text>
              </Box>
              {body ? <Markdown text={body} /> : null}
            </Box>
          )
        })}
      </Box>
    )
  })
}
