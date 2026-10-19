#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, resolve, extname } from 'node:path'
import { pathToFileURL } from 'node:url'
export function anchors(text) {
  const seen = new Map()
  return new Set([...text.replace(/```[\s\S]*?```/g,'').matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)].map(([, heading]) => {
    const base = heading.toLowerCase().replace(/<[^>]+>/g,'').replace(/[^\p{L}\p{N}_\-\s]/gu,'').replace(/\s/g,'-')
    const count = seen.get(base) ?? 0; seen.set(base, count+1)
    return count ? `${base}-${count}` : base
  }))
}
export function checkLinks(file) {
  const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g,'')
  const failures = []
  for (const [, raw] of text.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^(?:[a-z]+:|\/\/)/i.test(raw) || /[<>]/.test(raw)) continue
    const [path, fragment] = raw.split('#')
    let target, anchor
    try { target = path ? resolve(dirname(file), decodeURIComponent(path)) : file; anchor = fragment ? decodeURIComponent(fragment) : null } catch { failures.push(`${file}: malformed link ${raw}`); continue }
    if (!existsSync(target)) { failures.push(`${file}: missing ${raw}`); continue }
    if (anchor && extname(target) === '.md' && !anchors(readFileSync(target,'utf8')).has(anchor)) failures.push(`${file}: missing heading ${raw}`)
  }
  return failures
}
export function markdownFiles(path) {
  return statSync(path).isDirectory() ? readdirSync(path,{recursive:true}).filter(p => p.endsWith('.md')).map(p => resolve(path,p)) : [resolve(path)]
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length < 3) throw new Error('Usage: check-links.mjs <file-or-directory> ...')
    const failures = process.argv.slice(2).flatMap(markdownFiles).flatMap(checkLinks)
    if (failures.length) { process.stderr.write(failures.join('\n')+'\n'); process.exitCode = 1 }
  } catch(error) { process.stderr.write(error.message+'\n'); process.exitCode = 1 }
}
