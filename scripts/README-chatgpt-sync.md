# Syncing memory to ChatGPT project "alona-iot"

Builds a **docs-only** bundle under [`memory/chatgpt/`](../memory/README.md) — cross-AI context for ChatGPT (Cursor uses the repo and `.cursor/rules/` directly).

ChatGPT **Projects** have no public upload API. Workflow:

1. Run the bundler locally (**no source code**).
2. Upload from `memory/chatgpt/` in the project **Files** UI.

## Quick start

**From Cursor:** run slash command **`/sync-chatgpt-context`** (Agent mode).

**From terminal** — `alona-os` workspace root:

```bash
chmod +x scripts/sync-chatgpt-context.sh   # once
./scripts/sync-chatgpt-context.sh --zip --open
```

- **`memory/chatgpt/alona-iot/`** — folder to drag into the project.
- **`memory/chatgpt/alona-iot.zip`** — single archive if the UI prefers one upload.

Other tools can use sibling folders under `memory/` later.
- **`_SYNC_METADATA.txt`** — timestamp, git revision, `bundle_policy: docs-only`.

Dry-run:

```bash
./scripts/sync-chatgpt-context.sh --list
```

## What gets included (default)

| Included | Not included |
|----------|----------------|
| `AGENTS.md`, `CHATGPT_RULES.md` (from `scripts/chatgpt/`), `.cursor/rules/*.mdc` | `.ex`, `.exs`, tests, migrations, seeds |
| `.cursor/rules/*.mdc` | `config/*.exs`, shell scripts, `priv/` |
| Repo **README.md** files only | `_build`, `deps`, static assets |

Edit [`chatgpt-context.manifest`](chatgpt-context.manifest) to add or remove **markdown / `.mdc` paths only**. The script rejects any other file type even if listed in the manifest.

## ChatGPT project instructions (suggested)

- **`AGENTS.md`** — implementation state (source of truth).
- **`CHATGPT_RULES.md`** — prompt-format rules for ChatGPT web only (not in repo root; source under `scripts/chatgpt/`).

Implementation work stays in **Cursor** with the full repo; ChatGPT is for planning and prompt drafting from docs.

## Refresh cadence

Re-run after `AGENTS.md`, milestone, or Cursor rules change — not after every code edit.

## Remove an old code-heavy upload

If you previously uploaded a bundle that contained source, **delete those files** in the ChatGPT project and upload a fresh zip from this script.
