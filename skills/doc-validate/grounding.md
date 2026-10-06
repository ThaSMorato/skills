> Part of the `doc-validate` skill (see `SKILL.md`). Also read by the document writers (`prd-writer`, `hld-writer`, `fdd-writer`) and the writing skills.

# Grounding: no concept is used before the reader has it

A document loses its reader at the first place it leans on an idea the reader does not have yet. The reader does not stop to look it up; they read on with a guess, and every later sentence that builds on the guess is misread too. So every **concept** a document uses has to be **grounded** before it is used.

## Grounded, two ways
- **Prerequisite**: the reader brings it. For a design document that is
  - a term the glossary (`CONTEXT.md`) defines;
  - a concept the documents above it in the chain already introduced (brief → PRD → HLD → FDD), which its reader is expected to have read;
  - the general technical vocabulary of its audience (a transaction, an HTTP status, a queue), which needs no definition.
- **Introduced**: an earlier part of the same document establishes it, in a definition, an example, or the section that explains it. From that point on it is grounded for every later part.

**The unit is the concept, not the word.** A section that leans on "the order can be partly cancelled" leans on partial cancellation whether or not it uses that name; a term defined later under another name does not ground the earlier use.

## For the writer
Keep a running list of what is grounded as you write, top to bottom. Before a sentence leans on a concept, check the list:
- grounded → use it;
- not grounded → ground it **at its first use** (one sentence, or a pointer to the glossary entry when it should be there and is not yet: then add it to the glossary through `domain-model`), or move the part that introduces it ahead of the part that uses it.

Prefer grounding at first use over a block of definitions up front: a reader holds a definition best right before they need it. What you make a prerequisite and what you introduce is the lever: demand too much and you lose readers who lack it; introduce too much and the opening drowns in definitions.

## For the validator (`UG-N`)
Walk the target document **top to bottom**, carrying the grounded set: the prerequisites, plus each concept as it is introduced. A **load-bearing** concept (a domain term, a component, a state, a rule the design depends on) used before it is in the set is a finding:
- **Where:** the first use, and where it is introduced, if anywhere (*"used in §2 Flows, defined in §5 Data model"*).
- **Suggested resolution:** move the introducing part earlier, ground it at first use, or add it to the glossary when it is a domain term the whole chain will use.

**The ceiling:** general vocabulary of the audience is never a finding, and neither is a concept the reader can infer from the sentence it is in. Report only the uses where a reader without the concept would misread what follows.
