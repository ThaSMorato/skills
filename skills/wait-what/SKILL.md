---
name: wait-what
description: 'The last answer did not land: re-pitch it with a little context, in simplified technical English (ASD-STE100), in the glossary''s words. Typed by the user on "/wait-what".'
disable-model-invocation: true
---

The owner did not follow your last message. Say it again, differently:

1. **Start from where they are.** One or two sentences of context: what was being done, and why this message came up. Assume they have not read what came before it.
2. **Write in simplified technical English** (ASD-STE100 style): short sentences, one instruction or one fact per sentence, active voice, the same word for the same thing every time, no idioms. When the conversation is in another language, apply the same rules in that language.
3. **Use the project's words.** Every domain term as the glossary (`CONTEXT.md`) gives it; every id resolved to what it means, as the `asking` skill says.
4. **One point at a time.** If the message carried several, give the one that matters first, then list the rest by name.
5. **End with what you need from them**, if anything: the decision, as a structured choice where it is a closed set.

Shorter than the original. If the re-pitch is longer, it is a second explanation stacked on the first, not a clearer one.
