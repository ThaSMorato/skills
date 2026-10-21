// The reference skills: knowledge any stage, agent or the model itself may load (the testing standard,
// the security catalog, how to ask). They stay open to model invocation in both harnesses. Every
// other skill is a stage's body: closed to the model, reached only by the owner typing its command.
export const KNOWLEDGE_SKILLS = [
  'architecture', 'asking', 'clean-code', 'code-smells', 'data-access', 'domain-model', 'security', 'tdd', 'testing', 'ui',
  'visuals',
]

// A command reads its stage skill as a plain file, where `${CLAUDE_PLUGIN_ROOT}` is not substituted.
// Every stage skill opens with this line so the paths it cites still resolve.
export const STAGE_ROOT_NOTE =
  '> Read by path, not loaded: `${CLAUDE_PLUGIN_ROOT}` in this file is the plugin root, the folder that holds the `skills/` this file is in.'
