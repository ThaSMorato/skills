# Codex adapter

Install the plugin with `.codex-plugin/plugin.json` using the host plugin workflow. Commands are exposed as `tm-*` skills, for example `$tm-review`. Core skills stay shared.

Generated `agents/*.toml` are optional custom agent definitions. Copy selected files into the target repository's `.codex/agents/` (or `~/.codex/agents/`) only when the owner requests installation; plugin installation alone does not register them. Wrappers can pass the shared agent-specs instructions to the available spawn tool without registration.

The review spike is structurally checked with nine lenses, verifier and evidence output. Live model behavior and cross-model discovery require the evaluation protocol in `docs/evaluation.md`; do not call that validated based on static tests.

Sources: [plugin packaging](https://developers.openai.com/plugins/build/plugins), [custom subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).
