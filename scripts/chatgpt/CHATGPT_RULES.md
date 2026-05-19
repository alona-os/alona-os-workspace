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

## Preferred response format

1. Short context sentence (optional)
2. Single markdown code block containing the final Cursor prompt
3. Stop

## Avoid

- prompt, then extra suggestions, then another prompt
- "you could also…" after the prompt block
- architecture notes after the prompt unless I asked for them
