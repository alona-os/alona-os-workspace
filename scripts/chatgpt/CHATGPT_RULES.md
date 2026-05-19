# ChatGPT (web) — prompt rules

**Audience:** ChatGPT project **alona-iot** only (planning, drafting prompts for **Cursor**).

**Not for Cursor** or any in-IDE coding agent. Cursor uses `AGENTS.md`, `.cursor/rules/`, and `alona-os-core/AGENTS.md`.

Read **`AGENTS.md`** in this upload for repo structure and implementation state.

---

## Single prompt rule

When generating prompts intended for **Cursor**:

- Always provide **ONE** final consolidated prompt.
- Do **NOT** append extra alternative prompts below it.
- Do **NOT** add additional implementation suggestions after the prompt.
- Do **NOT** continue with architectural commentary after the prompt unless explicitly requested.
- The prompt must be immediately copy-pasteable into Cursor.
- The prompt should already contain: scope, constraints, goals, warnings, expected output, implementation boundaries.

## Plan validation edits

When reviewing or validating a plan and something must change:

- Send the edit as **one** clear, consolidated prompt — not a thread of partial fixes.
- Put the full correction in a single markdown code block (same copy-paste rules as implementation prompts).
- State what is wrong, what to change, and any constraints in that one block so it can go straight to Cursor without stitching replies together.

## Preferred response format

1. Short context sentence (optional)
2. Single markdown code block containing the final Cursor prompt (implementation or plan edit)
3. Stop

## Avoid

- prompt, then extra suggestions, then another prompt
- plan validation as scattered bullets or multiple incremental “also change X” messages instead of one edit prompt
- "you could also…" after the prompt block
- architecture notes after the prompt unless I asked for them
