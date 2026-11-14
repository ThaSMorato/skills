> Part of the `doc-validate` skill (see `<plugin root>/agent-references/skills/doc-validate/index.md`). Read through [`<plugin root>/agent-references/skills/doc-validate/living.md`](living.md) by the writers of the living documents, and directly by `adr-generator`, `adr-linker` and `$thasmorato-skills:tm-tickets`.

# Links between documents

A document that names `RF-3` or `ADR-0007` in plain text makes its reader search for it. A link makes the reference one click, in GitHub and in Obsidian, and in Obsidian it also gives the backlinks (who cites this requirement, who depends on this ADR) and the graph of the chain brief → PRD → HLD → FDD → tickets.

## The form
- **A relative Markdown link to the file**, written from the folder of the document you are writing: `[RF-003](../../product/prd.md)`, `[ADR-0007](../../adr/0007-sessions-in-redis.md)`, `[F3](../README.md)`. Both GitHub and Obsidian follow it.
- **The id is the link text.** The reader still sees `RF-003`; the link says where it lives.
- **To the file, not to a heading.** GitHub and Obsidian build heading anchors differently, and most ids sit in list items or table rows that have no anchor at all. A link to the file works in both; the id in the text says where to look in it.
- **Never a `[[wikilink]]`:** GitHub shows it as plain text.
- **Code stays in backticks, unlinked.** A symbol (`Payments.charge`) is not a document; a link to a source file breaks at the first move, and the living documents name symbols, not paths.

## What gets a link
Every reference to an id another document defines: requirements (`RF`, `RNF`, `GS`), features (`F`), components (to `components.md`), ADRs, product criteria (`PAC`) and feature criteria (`AC`, from a ticket's trace), and a document named as a source. The first mention in a section is enough: a table that cites `RF-003` in every row links it in each row, since a row is read alone.

## For the owner
Obsidian follows these links with **Settings → Files and links → Use [[Wikilinks]] off** and **New link format: Relative path to file**, so a link it creates has the same form as the ones the agents write.

## For the validator (`LK-N`)
Resolve every relative link in the target from the target's folder. A file that does not exist is a finding, with the link text, where it is, and the file it should probably point to. A `[[wikilink]]` is a finding too. A link to a heading that does not exist is reported only when the file exists and the anchor is plainly wrong; anchors are not the form the agents write.
