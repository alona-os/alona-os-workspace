# Cursor Prompt Rules

Rules for ChatGPT (and other assistants) when producing prompts meant for **Cursor** implementation sessions. Pair with workspace `AGENTS.md` for implementation state.

---

## Single Prompt Rule

When generating prompts intended for Cursor:

- Always provide **ONE** final consolidated prompt.
- Do **NOT** append extra alternative prompts below it.
- Do **NOT** add additional implementation suggestions after the prompt.
- Do **NOT** continue with architectural commentary after the prompt unless explicitly requested.
- The prompt must be immediately copy-pasteable into Cursor.
- The prompt should already contain:
  - scope
  - constraints
  - goals
  - warnings
  - expected output
  - implementation boundaries

---

## Preferred Response Format

1. Short context sentence (optional)
2. Single markdown code block containing the final Cursor prompt
3. Stop

---

## Avoid

**Bad pattern:**

- prompt
- extra suggestions
- additional prompts
- "you could also..."
- architecture notes after the prompt

**Good pattern:**

- one complete prompt only

---

## Goal

Reduce prompt fragmentation and avoid ambiguity during Cursor implementation sessions.
