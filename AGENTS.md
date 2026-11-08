# AGENTS.md

This repository holds starter templates to copy code from. Every template must meet the bar below,
whatever its language or stack.
The bar is the common ground of 19 authors on readable code: Martin, Fowler, Beck, McConnell,
Kernighan, Plauger, Pike, Ousterhout, Hunt, Thomas, Hickey, Metz, Boswell, Foucher, Dijkstra,
Knuth, Evans, Henney, Hoare and Parnas. Code that fails a check is not done.

## Clean code: the bar

Each line is a rule, then the check a reader runs on a file.

1. **Names state intent in the domain's words.** Read each name aloud. It says what the code means
   to its user, not the mechanism behind it (which cache, queue or request it touches). No `data`,
   `info`, `handle`, `process`, `util`, `manager`. Booleans start with `is`, `has` or `can`.
2. **One word per concept.** Across all files, one idea has one name, and one name has one meaning.
   A plural name is always a list of the type its singular names.
3. **One job per function, at one level of abstraction.** Say what the function does in one sentence
   without "and". Its body does not mix domain steps with formatting, storage or transport detail.
4. **The reader goes top to bottom.** A file opens with its main export. Helpers follow, in the
   order the main code calls them. Related lines sit together; blank lines separate ideas.
5. **Control flow stays flat.** Nesting depth at most 2. Guard clauses and early returns, not
   nested branches. A plain ternary for a two-way choice; never a nested ternary. Name a condition
   once instead of negating it twice.
6. **Each piece of knowledge lives in one place.** The same rule, shape or value does not appear
   twice. Literal text and numbers stay inline until they are reused.
7. **Simple beats clever.** No abstraction, generic, option or layer with one caller. No dead code
   or unused export. Choose the plainest construct that works.
8. **Modules hide decisions behind narrow interfaces.** Each module exports little. Callers never
   reach past it into its storage, driver or framework detail. Changing one decision changes one
   module.
9. **Types model the domain.** No bare string or number for an id, status or date when a
   dedicated type fits (branded, newtype, enum or union, whatever the language offers). An invalid state does not typecheck. Plain data goes in and out.
10. **State is explicit and immutable by default.** Bind once and mark data read-only wherever the
    language allows. No mutated arguments. Each variable has a small scope and one assignment.
11. **Validate at the edge; fail loudly and typed.** Parse untrusted input once, where it enters.
    No swallowed error: a failure keeps its cause, reaches a handler that acts on it, and is
    logged with that cause.
12. **The same job has the same shape.** Two files that do the same kind of work look alike, so a
    reader learns a pattern once.

## Where the authors disagree, this repo decides

- **Function length:** a function is as long as one idea needs. Extract only when the new name
  says more than the body it replaces (Ousterhout's depth test over Martin's line counts).
- **Duplication against abstraction:** duplication is cheaper than a wrong abstraction. Share
  code only when both uses change for the same reason (Metz).
- **Comments:** none. Rename or restructure until the code needs none (Martin, Pike).
- **Name length:** short in a small scope, longer for a wide one (Pike).

## Applying the bar

- Each template stands alone. Work in one template at a time, and take its names, patterns, tools
  and commands from that template and its `README.md`, never from a sibling template.
- Each template's gates (one command, named in its `README.md`) check what tools can check, such
  as types, layers and format. The bar covers what they cannot. Meet both.
- To pass a gate, change the code. Never edit a linter, type-checker or compiler config to silence
  an error.
- A template's `README.md` holds its design and the reasons for each relaxed gate.
- Keep `AGENTS.md`, `CLAUDE.md` and `.claude/` out of every template. The bench in `bench/`
  measures a template with no agent rules.
