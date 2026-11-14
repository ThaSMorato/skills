// Reads the frontmatter a stage writes at the top of its artifact: flat keys whose values are numbers,
// words, inline maps (`{high: 1, low: 2}`) or inline lists (`[quality, tests]`). It reads only that
// shape, which is the only one the templates write; the body is never read for a count.
// No dependencies beyond the Node standard library.

const FRONTMATTER = /^---\n([\s\S]*?)\n---(?:\n|$)/

export function readFrontmatter(text) {
  const block = String(text).match(FRONTMATTER)?.[1]
  if (block === undefined) return null
  return Object.fromEntries(
    block
      .split('\n')
      .map((line) => line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, parseValue(value.replace(/\s+#.*$/, '').trim())]),
  )
}

function parseValue(value) {
  if (value.startsWith('{') && value.endsWith('}')) {
    return Object.fromEntries(splitItems(value.slice(1, -1)).map((item) => item.split(/:\s*/, 2)).map(([key, inner]) => [key.trim(), parseScalar(inner ?? '')]))
  }
  if (value.startsWith('[') && value.endsWith(']')) return splitItems(value.slice(1, -1)).map(parseScalar)
  return parseScalar(value)
}

function splitItems(inner) {
  return inner.split(',').map((item) => item.trim()).filter(Boolean)
}

function parseScalar(raw) {
  const value = raw.trim().replace(/^(['"])(.*)\1$/, '$2')
  return value !== '' && /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value
}
