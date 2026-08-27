> Part of the `code-smells` skill (see `../SKILL.md`).

# Primitive Obsession

**Tell:** a raw `String`/`int`/`decimal` carries a domain concept — money, email, CPF, a status code, a date range — instead of a dedicated type.

The primitive travels naked: no validation, no behavior. The rules that belong to that concept (format, validate, compare) get scattered across every site that touches the primitive, and the type name says nothing about what it means. Type codes like `TYPE_BOOK = 1` and hashes-as-records are the same smell.

**Fix:** Replace Data Value with Object — extract a Value Object (`Money`, `Email`) that validates in its constructor and concentrates the associated rules. Promote type codes to enums.
