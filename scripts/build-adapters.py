#!/usr/bin/env python3
"""Generate harness adapters from workflows/, agent-specs/ and plugin-source.json."""
import argparse,json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent

def split(text):
 match=re.match(r'^---\n(.*?)\n---\n(.*)',text,re.S)
 if not match:raise ValueError('Missing frontmatter')
 return match[1],match[2]

def scalar(front,key,default=''):
 value=re.search(r'^'+re.escape(key)+r':\s*(.*)$',front,re.M)
 return value[1].strip().strip('"\'') if value else default

def outputs():
 manifest=json.loads((ROOT/'plugin-source.json').read_text())
 core=sorted(p.parent for p in (ROOT/'skills').glob('*/SKILL.md') if not p.parent.name.startswith('tm-'))
 manifest['skills']=['./'+str(p.relative_to(ROOT)) for p in core]
 result={'.claude-plugin/plugin.json':json.dumps(manifest,indent=2)+'\n'}
 codex={k:manifest[k] for k in ['name','version','description','author','repository','license']}
 codex['skills']='./skills/'
 result['.codex-plugin/plugin.json']=json.dumps(codex,indent=2)+'\n'
 binding='''\n## Harness adapter (generated)\nIn Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.\n'''
 for p in sorted((ROOT/'workflows').glob('*.md')):
  front,body=split(p.read_text());name='tm-'+p.stem
  result['commands/'+name+'.md']='---\n'+front+'\n---\n'+body+binding
  # Codex command aliases are skills, sharing exactly the same body.
  body=body.replace('$ARGUMENTS','the owner\'s supplied arguments')
  # Source paths were relative to workflows/, wrappers are one level deeper.
  body=re.sub(r'(?<!\.)\.\./', '../../',body)
  result[f'skills/{name}/SKILL.md']='---\nname: '+name+'\n'+front+'\nuser-invocable: false\n---\n'+body+'''\n## Codex adapter (generated)\nLoad core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.\n'''
 for p in sorted((ROOT/'agent-specs').glob('*.md')):
  front,body=split(p.read_text());name=p.stem;effort=scalar(front,'effort')
  if effort not in ['high','medium']:raise ValueError(f'Invalid effort: {name}')
  result['agents/'+p.name]='---\n'+front+'\n---\n'+body+binding
  # Embed resolved source paths; agent files and source files share depth.
  result[f'agents/{name}.toml']='\n'.join([
   'name = '+json.dumps(name),
   'description = '+json.dumps(scalar(front,'description')),
   'model_reasoning_effort = '+json.dumps(effort),
   'developer_instructions = '+json.dumps(body+'\nLoad referenced plugin skills by reading skills/<name>/SKILL.md; do not call workflow stages. Plugin paths resolve relative to agent-specs/ in this plugin, not the target repo cwd.'),'' ])
 for p in core:
  front,_=split((p/'SKILL.md').read_text())
  # Claude user-invocable is menu visibility, NOT Codex implicit invocation policy.
  result[str((p/'agents/openai.yaml').relative_to(ROOT))]='interface:\n  display_name: '+json.dumps(p.name)+'\n  short_description: '+json.dumps(scalar(front,'description')[:64])+'\n'
 # Registered agents need an explicit supported location; plugin manifest does not register them.
 result['adapters/codex/README.md']='''# Codex adapter\n\nInstall the plugin with `.codex-plugin/plugin.json` using the host plugin workflow. Commands are exposed as `tm-*` skills, for example `$tm-review`. Core skills stay shared.\n\nGenerated `agents/*.toml` are optional custom agent definitions. Copy selected files into the target repository's `.codex/agents/` (or `~/.codex/agents/`) only when the owner requests installation; plugin installation alone does not register them. Wrappers can pass the shared agent-specs instructions to the available spawn tool without registration.\n\nThe review spike is structurally checked with nine lenses, verifier and evidence output. Live model behavior and cross-model discovery require the evaluation protocol in `docs/evaluation.md`; do not call that validated based on static tests.\n\nSources: [plugin packaging](https://developers.openai.com/plugins/build/plugins), [custom subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).\n'''
 return result

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args();errors=[]
 result=outputs()
 generated=[]
 for directory,pattern in [('commands','*.md'),('agents','*.md'),('agents','*.toml'),('skills','tm-*/SKILL.md'),('skills','*/agents/openai.yaml')]:
  generated.extend(ROOT.glob(directory+'/'+pattern))
 for stale in generated:
  if str(stale.relative_to(ROOT)) not in result:errors.append('Unexpected generated file: '+str(stale.relative_to(ROOT)))
 for name,text in result.items():
  p=ROOT/name
  if args.check:
   if not p.exists() or p.read_text()!=text:errors.append('Adapter drift: '+name)
  else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
 if errors:print('\n'.join(errors),file=sys.stderr);return 1
 return 0
if __name__=='__main__':sys.exit(main())
