import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { planDigest, checkValidation } from './plan-digest.mjs'
import { registerReport, listReports, registryPath } from './report-registry.mjs'
import { checkLinks } from './check-links.mjs'
import { normalizeCodex, extractCodexSession, resolveCodexTranscript } from './session-extract-codex.mjs'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = p => readFileSync(join(root,p),'utf8')
const temp = () => mkdtempSync(join(tmpdir(),'tm-v070-'))
const core = readdirSync(join(root,'skills')).filter(n => !n.startsWith('tm-') && existsSync(join(root,'skills',n,'SKILL.md')))
const references = new Set(['testing','tdd','clean-code','code-smells','architecture','data-access','domain-model','security','ui'])
const workflows = readdirSync(join(root,'workflows')).filter(n => n.endsWith('.md'))

test('generated adapters match their canonical sources for both harnesses', () => {
 const result = spawnSync('python3',['scripts/build-adapters.py','--check'],{cwd:root,encoding:'utf8'})
 assert.equal(result.status,0,result.stderr)
})
test('every command has tm prefix, a Codex entry and namespaced skill dispatch', () => {
 const names = readdirSync(join(root,'commands'))
 assert.equal(names.length,workflows.length)
 for (const name of names) {
  assert.ok(name.startsWith('tm-'),name)
  assert.ok(existsSync(join(root,'skills',name.slice(0,-3),'SKILL.md')))
  for (const [,skill] of read('commands/'+name).matchAll(/Load skill `([^`]+)`/gi)) {
   assert.ok(skill.startsWith('thasmorato-skills:'),skill)
   assert.ok(existsSync(join(root,'skills',skill.split(':')[1],'SKILL.md')),skill)
  }
 }
})
test('command-driven skills are hidden and callable, reference menu remains available', () => {
 for (const name of core) {
  const text = read(`skills/${name}/SKILL.md`)
  assert.doesNotMatch(text,/^disable-model-invocation: true$/m,name)
  if (references.has(name)) assert.doesNotMatch(text,/^user-invocable: false$/m,name)
  else assert.match(text,/^user-invocable: false$/m,name)
 }
})
test('neutral sources have valid effort and contain no harness tool coupling', () => {
 for (const name of readdirSync(join(root,'agent-specs'))) {
  const text = read('agent-specs/'+name)
  assert.match(text,/^effort: (high|medium)$/m,name)
  assert.doesNotMatch(text,/CLAUDE_PLUGIN_ROOT|Call the Skill tool|Call the Agent tool/)
  assert.match(text,/Never delegate again/)
 }
 for (const name of workflows) assert.doesNotMatch(read('workflows/'+name),/CLAUDE_PLUGIN_ROOT|Call the Skill tool|Call the Agent tool/)
})
test('stages terminate and do not invoke a second stage or nested delegation', () => {
 for (const name of core.filter(n => !references.has(n) && !['asking','visuals'].includes(n))) {
  const text = read(`skills/${name}/SKILL.md`)
  assert.match(text,/## Stage boundary/,name)
  for (const [,called] of text.matchAll(/Load skill `thasmorato-skills:([\w-]+)`/gi)) assert.ok(references.has(called) || ['asking','visuals'].includes(called),`${name} calls stage ${called}`)
  assert.doesNotMatch(text,/(?:^|\n)(?:Then )?(?:[Rr]un|[Rr]e-run) `?\/tm-/m,name)
 }
 for (const p of ['workflows/session-analyze.md','skills/retro/SKILL.md','agent-specs/session-segment-analyst.md']) {
  assert.doesNotMatch(read(p),/ask what to act on|(?:edit|patch|fix) the plugin(?:'s)? skill/i,p)
 }
})
test('plan validation rejects changed bytes, missing hash and dirty verdict', () => {
 const dir=temp(), plan=join(dir,'plan.md'), validation=join(dir,'validation.md')
 writeFileSync(plan,'SI-1: original\n')
 writeFileSync(validation,`---\nstatus: clean\nplan_sha256: ${planDigest(plan)}\n---\n`)
 assert.equal(checkValidation(plan,validation),true)
 writeFileSync(plan,'SI-1: changed\n'); assert.equal(checkValidation(plan,validation),false)
 writeFileSync(validation,'---\nstatus: clean\n---\n'); assert.equal(checkValidation(plan,validation),false)
 writeFileSync(validation,`---\nstatus: dirty\nplan_sha256: ${planDigest(plan)}\n---\n`); assert.equal(checkValidation(plan,validation),false)
})
test('registry upserts, separates harness metadata and tolerates moved repos', () => {
 const dir=temp(), repo=join(dir,'repo'), report=join(repo,'retro.md'), file=join(dir,'reports.json')
 mkdirSync(repo);writeFileSync(report,'report')
 const entry={repo,report,date:'2026-10-19',version:'0.7.0-beta.1',harness:'codex',counts:{flow:1,'repo-skill':2,'repo-code':3}}
 registerReport(file,entry);registerReport(file,{...entry,counts:{...entry.counts,flow:2}})
 assert.equal(listReports(file).length,1); assert.equal(listReports(file)[0].counts.flow,2)
 const data=JSON.parse(readFileSync(file,'utf8'));data.reports.push({...entry,report:join(repo,'gone.md')});writeFileSync(file,JSON.stringify(data))
 assert.deepEqual(listReports(file).map(r=>r.status),['available','missing'])
 assert.equal(registryPath({THASMORATO_REPORTS_FILE:'/tmp/custom'}),'/tmp/custom')
 assert.equal(registryPath({CLAUDE_PLUGIN_DATA:'/tmp/data'}),'/tmp/data/reports.json')
})
test('registry preserves corrupt data and does not overwrite concurrent writers', () => {
 const dir=temp(), file=join(dir,'reports.json'), report=join(dir,'retro.md')
 writeFileSync(report,'report');writeFileSync(file,'corrupt')
 const entry={repo:dir,report,date:'2026-10-19',version:'beta',harness:'claude',counts:{flow:0,'repo-skill':0,'repo-code':0}}
 assert.throws(()=>registerReport(file,entry));assert.equal(readFileSync(file,'utf8'),'corrupt')
 writeFileSync(file+'.lock','locked');assert.throws(()=>registerReport(file,entry));assert.equal(readFileSync(file,'utf8'),'corrupt')
})
test('relative Markdown checker rejects absent documents and anchors', () => {
 const dir=temp(), source=join(dir,'a.md');writeFileSync(join(dir,'b.md'),'# RF-3\n')
 writeFileSync(source,'[RF](b.md#rf-3)');assert.deepEqual(checkLinks(source),[])
 writeFileSync(source,'[RF](b.md#rf-4)\n[x](missing.md)');assert.equal(checkLinks(source).length,2)
})
test('new policy links resolve from every skill and source stage', () => {
 for (const dir of ['skills','workflows','agent-specs','policies']) for (const path of readdirSync(join(root,dir),{recursive:true}).filter(n=>n.endsWith('.md'))) {
  const text=read(dir+'/'+path)
  for (const [,rel] of text.matchAll(/\]\(([^)]+policies\/[^)]+\.md)\)/g)) assert.ok(existsSync(join(root,dir,dirname(path),rel)),dir+'/'+path+': '+rel)
 }
})
test('Codex extraction keeps owner evidence across compaction without tool data or injected instructions', async () => {
 const dir=temp(), transcript=join(dir,'rollout.jsonl'), outDir=join(dir,'out')
 const entries=[
  {type:'session_meta',payload:{id:'session-1',cwd:dir,source:'cli'}},
  {type:'response_item',timestamp:'t1',payload:{type:'message',role:'user',content:[{type:'input_text',text:'No, use the existing feature.'}]}},
  {type:'response_item',payload:{type:'function_call',name:'exec_command',arguments:'SECRET_ARGUMENT'}},
  {type:'response_item',payload:{type:'function_call_output',output:'SECRET_RESULT'}},
  {type:'compacted',payload:{message:'SECRET_SUMMARY'}},
  {type:'response_item',payload:{type:'message',role:'developer',content:[{type:'input_text',text:'SECRET_INSTRUCTIONS'}]}},
  {type:'response_item',payload:{type:'message',role:'user',content:[{type:'input_text',text:'<environment_context>SECRET_ENV</environment_context>'}]}},
  {type:'response_item',timestamp:'t2',payload:{type:'message',role:'user',content:[{type:'input_text',text:'I already asked for that.'}]}}
 ]
 writeFileSync(transcript,entries.map(e=>JSON.stringify(e)).join('\n')+'\nmalformed\n')
 const result=await extractCodexSession({transcript,outDir})
 assert.equal(result.segments,2);assert.equal(result.ownerTurns,2);assert.equal(result.skippedLines,1)
 const output=readFileSync(join(outDir,'seg-01.md'),'utf8')+readFileSync(join(outDir,'seg-02.md'),'utf8')
 assert.match(output,/existing feature/);assert.match(output,/exec_command/);assert.doesNotMatch(output,/SECRET/)
 assert.equal(resolveCodexTranscript({sessionsRoot:dir,cwd:dir,sessionId:'session-1'}),transcript)
 assert.equal(normalizeCodex({type:'event_msg',payload:{type:'user_message',message:'duplicate'}}),null)
})
