# Memory (cross-AI context)

Docs and rules synced from this repo for **ChatGPT**, **Cursor**, and other assistants — not application source code.

| Layer | Canonical location | In ChatGPT bundle? |
|-------|-------------------|-------------------|
| Implementation state | `AGENTS.md` (repo root) | Yes → `alona-iot/AGENTS.md` |
| ChatGPT prompt rules | `scripts/chatgpt/CHATGPT_RULES.md` | Yes → `alona-iot/CHATGPT_RULES.md` |
| Cursor rules | `.cursor/rules/` | Yes (copied) |
| Application code | `alona-os-core/` | **No** |

`CHATGPT_RULES.md` exists **only in this upload**, not at the repo root. **Cursor** does not use it.

Regenerate: `./scripts/sync-chatgpt-context.sh --zip --open`
