#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, openSync, closeSync, unlinkSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { homedir } from 'node:os'
import { pathToFileURL } from 'node:url'
export const registryPath = (env = process.env) => env.THASMORATO_REPORTS_FILE || (env.CLAUDE_PLUGIN_DATA ? join(env.CLAUDE_PLUGIN_DATA, 'reports.json') : join(homedir(), '.claude/thasmorato-skills/reports.json'))
export function readRegistry(file) {
  if (!existsSync(file)) return { schema: 1, reports: [] }
  const data = JSON.parse(readFileSync(file, 'utf8'))
  if (data.schema !== 1 || !Array.isArray(data.reports)) throw new Error('Unsupported report registry; original preserved')
  return data
}
export function registerReport(file, entry) {
  if (!isAbsolute(entry.repo) || !isAbsolute(entry.report)) throw new Error('Repository and report paths must be absolute')
  if (!existsSync(entry.repo) || !existsSync(entry.report)) throw new Error('Write the report before registration')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !entry.version || !['claude','codex','unknown'].includes(entry.harness)) throw new Error('Invalid report metadata')
  for (const level of ['flow','repo-skill','repo-code']) if (!Number.isInteger(entry.counts?.[level]) || entry.counts[level] < 0) throw new Error('Invalid level counts')
  mkdirSync(dirname(file), { recursive: true })
  // Fail visibly rather than losing an update from another active report writer.
  const lock = file + '.lock'
  const fd = openSync(lock, 'wx')
  const temp = file + '.' + process.pid + '.tmp'
  try {
    const data = readRegistry(file)
    const record = { repo: resolve(entry.repo), report: resolve(entry.report), date: entry.date, version: entry.version, harness: entry.harness, counts: entry.counts }
    data.reports = data.reports.filter(row => row.report !== record.report)
    data.reports.push(record)
    writeFileSync(temp, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 })
    renameSync(temp, file)
    return record
  } finally { closeSync(fd); unlinkSync(lock); if (existsSync(temp)) unlinkSync(temp) }
}
export const listReports = file => readRegistry(file).reports.map(row => ({ ...row, status: existsSync(row.repo) && existsSync(row.report) ? 'available' : 'missing' }))
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [command, ...args] = process.argv.slice(2)
    const options = {}
    for (let i = 0; i < args.length; i += 2) { if (!args[i].startsWith('--') || args[i + 1] === undefined) throw new Error('Expected --key value'); options[args[i].slice(2)] = args[i + 1] }
    const file = options.file || registryPath()
    if (command === 'list') process.stdout.write(JSON.stringify(listReports(file)) + '\n')
    else if (command === 'add') process.stdout.write(JSON.stringify(registerReport(file, { ...options, counts: JSON.parse(options.counts) })) + '\n')
    else throw new Error('Usage: report-registry.mjs add|list [--file path] [--repo path --report path --date YYYY-MM-DD --version version --harness claude|codex --counts JSON]')
  } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1 }
}
