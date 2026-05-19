# sync ChatGPT project context (alona-iot)

Run from the **repository root** (`alona-os/`) in **Agent mode**.

## Goal

Build a **docs-only** bundle into **`memory/chatgpt/alona-iot/`**: `AGENTS.md`, `CHATGPT_RULES.md` (ChatGPT web only), Cursor rules, READMEs. No repo-root `CHATGPT_RULES.md`. **Never include application source code.**

## Run

```bash
./scripts/sync-chatgpt-context.sh --zip --open
```

If the script is not executable:

```bash
chmod +x scripts/sync-chatgpt-context.sh
./scripts/sync-chatgpt-context.sh --zip --open
```

Optional dry-run:

```bash
./scripts/sync-chatgpt-context.sh --list
```

## After the script

1. Report **file count** and confirm **docs-only** (`bundle_policy` in `_SYNC_METADATA.txt`).
2. Show **git SHA** and **generated_at** from `_SYNC_METADATA.txt`.
3. Remind the user to upload into ChatGPT project **alona-iot** and **remove any older uploads that contained source code**.
4. Output paths: `memory/chatgpt/alona-iot/`, `memory/chatgpt/alona-iot.zip`. Generated files are gitignored (see `memory/README.md`).

## Do not

- Add source files to the bundle or manifest.
- Invent a ChatGPT Projects upload API.
- Upload on the user's behalf.

## Reference

`scripts/README-chatgpt-sync.md`
