# Alona OS — Workspace

Meta repository for working on the **alona-os system** in one Cursor/IDE workspace: shared rules, UI reference exports, and helper scripts. Application, host, and firmware code live in separate repos (cloned as siblings below).

## Repositories

| Directory | GitHub | Role |
|-----------|--------|------|
| **alona-os-core** | [alona-os/alona-os-core](https://github.com/alona-os/alona-os-core) | Elixir umbrella — Phoenix UI, Postgres, ingest |
| **alona-os-infra** | [alona-os/alona-os-infra](https://github.com/alona-os/alona-os-infra) | Pi host — Postgres, Mosquitto, env, systemd |
| **alona-os-firmware** | [alona-os/alona-os-firmware](https://github.com/alona-os/alona-os-firmware) | ESP32 sensor node firmware |
| **alona-os-workspace** (this repo) | [alona-os/alona-os-workspace](https://github.com/alona-os/alona-os-workspace) | `.cursor/`, `ref/`, `scripts/` |

## Clone layout

Clone this repo, then clone the product repos **into the same parent directory** (sibling folders):

```bash
mkdir alona-os && cd alona-os
git clone git@github.com:alona-os/alona-os-workspace.git .
git clone git@github.com:alona-os/alona-os-core.git
git clone git@github.com:alona-os/alona-os-infra.git
git clone git@github.com:alona-os/alona-os-firmware.git
```

Open in Cursor so `.cursor/rules` apply across core, infra, and firmware:

- **Recommended:** **File → Open Workspace from File…** → [`alona-os.code-workspace`](alona-os.code-workspace)  
  Source Control shows each git repo (`workspace`, `core`, `infra`, `firmware`) in the repo picker.
- **Alternative:** open the **`alona-os`** folder only — you will see the meta repo in Source Control; product repos are separate clones (see [`.gitignore`](.gitignore)).

## What’s in this repo

| Path | Purpose |
|------|---------|
| **`alona-os.code-workspace`** | Multi-root workspace — all repos in one Cursor window + SCM |
| **`.cursor/rules/`** | Project context, setup, v0 → LiveView sync |
| **`.cursor/commands/`** | Agent workflows (e.g. `/sync-v0-ui-to-liveview`) |
| **`ref/`** | v0 UI design export, logos, reference PDF |
| **`scripts/`** | `v0-ui-diff.sh` — compare v0 export trees |
| **`org/`** | Org branding assets |

## Quick links

- **Local app dev:** `alona-os-core/README.md` — `./setup.sh`, `mix phx.server`
- **Pi host setup:** `alona-os-infra/README.md` — `scripts/setup-pi.sh`
- **Firmware:** `alona-os-firmware/README.md`
