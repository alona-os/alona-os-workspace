# sync v0 React export → Phoenix LiveView

Run from the **repository root** (`alona-os/`) in **Agent mode**.

## Preconditions

- Baseline: `ref/alona-os-ui-design`
- Fresh v0 drop: `ref/alona-os-ui-design-new`
- Phoenix app: `alona-os-core/apps/alona_ui`

If folder names differ, stop and ask the user.

## Goal (source of truth)

**v0 is for visual parity.** Treat `ref/alona-os-ui-design` (and each new export) as the **layout, spacing, hierarchy, and component chrome** reference. Prefer matching what users *see* in the ref (including grids, section order, cards, empty states, topbar/sidebar) over “close enough” Phoenix patterns. When ref and an existing LiveView disagree, **update LiveView toward the ref** unless Phase C blocks (data/schema). Token mapping (shadcn → daisy) is implementation detail; the outcome should **read as the same screen** side-by-side.

## Phase A — Discover changes

Prefer the helper script (if present). It only answers: **“what changed between the last baseline and the new v0 zip?”** It does **not** diff against Phoenix, so **missing LiveView ports** (e.g. rich `app-topbar.tsx` while `alona_shell.html.heex` is still minimal) never show up as script output. Always run the **shell parity checklist** (Phase B) against the ref files even when the script prints “no differences.”

```bash
./scripts/v0-ui-diff.sh
```

Or manually:

```bash
diff -rq ref/alona-os-ui-design ref/alona-os-ui-design-new \
  --exclude=node_modules --exclude=.next
```

For each differing path, only process files that match **in-scope** patterns below. For each in-scope file, show `diff -u` between baseline and `-new`.

### In scope vs out of scope

| Process | Skip (unless user explicitly asks) |
| -------- | ----------------------------------- |
| `ref/alona-os-ui-design-new/app/**/*.tsx` | Diff that is only `@vercel/analytics` / production-only imports with no layout change |
| `components/app-sidebar.tsx`, `app-topbar.tsx`, `theme-provider.tsx` | `components/ui/**` (shadcn; use `core_components.ex` only when adding a real Phoenix need) |
| `components/dashboard/**` | `package.json`, `tsconfig*`, `hooks/**`, `next.config.*`, lockfiles |

Whenever **layout or any shell component** (`layout.tsx`, `app-sidebar`, `app-topbar`, `theme-provider`) appears in the diff or you are mapping shell chrome, also **open and compare** `ref/.../app/globals.css` (at least `:root`, `.dark`, and `--sidebar*` / `--background*`). Token-only changes often live there with **no** `layout.tsx` edit. Do not skip this file.

## Phase B — Map React → LiveView

Use the mapping in `.cursor/rules/v0-liveview-sync.mdc` (full table + token cheatsheet). Summary:

| React | Phoenix |
| ------ | ------- |
| `app/layout.tsx` + shell chrome | `alona_shell.html.heex`, `layouts.ex` (`nav_item`) |
| `app/page.tsx` | `live/command_center_live.ex` |
| `app/energy/page.tsx` | `live/energy_live.ex` |
| `app/water/page.tsx` | `live/water_live.ex` |
| `app/environment/page.tsx` | `live/environment_live.ex` |
| `app/tasks/page.tsx` | `live/tasks_live.ex` |
| `app/finance/page.tsx` | `live/finance_live.ex` |
| `app/timeline/page.tsx` | `live/timeline_live.ex` |
| `app/resources/page.tsx` | `live/resources_live.ex` |
| `app/food-production/page.tsx` | `live/food_production_live.ex` |
| `app/security/page.tsx` | `live/security_live.ex` |
| `app/maintenance/page.tsx` | `live/maintenance_live.ex` |
| `app/automations/page.tsx` | `live/automations_live.ex` |
| `app/protocols/page.tsx` | `live/protocols_live.ex` |
| `app/settings/page.tsx` | `live/settings_live.ex` |
| `components/dashboard/stat-card.tsx` | `DashboardUi.metric_card/1` |
| `components/dashboard/room-card.tsx` | `DashboardUi.room_card/1` |
| `components/dashboard/alert-card.tsx` | `DashboardUi.alert_banner/1` |
| `components/dashboard/task-item.tsx` | `DashboardUi.task_item/1` |
| `components/dashboard/timeline-item.tsx` | `DashboardUi.timeline_item/1` |

Router parity: `alona-os-core/apps/alona_ui/lib/alona_ui_web/router.ex`.

### Shell and theme parity (required before “no Phoenix changes”)

Do **not** treat “same flex sidebar + main column” as parity. v0 often uses **separate tokens** for the nav rail vs the main surface.

Before you say there is nothing to port for shell, explicitly check all of the following against the ref design:

| Check | v0 / React | Phoenix (typical) |
| ----- | ---------- | ----------------- |
| **Overall lightness** | `:root` / `body` / `bg-background` vs `.dark` + `ThemeProvider` / `defaultTheme` | `root.html.heex` theme script (`phx:theme`, `data-theme`, default when `localStorage` empty), Daisy `prefers-color-scheme` behavior |
| **Sidebar rail** | `bg-sidebar`, `text-sidebar-foreground`, `border-sidebar-border`, active/hover classes | Not the same as `bg-base-100`: rail is usually a **dark strip** on a light app; mirror `--sidebar*` from `globals.css` (e.g. dedicated CSS variables + `alona_shell` / `nav_item`), not generic `base-*` for the whole aside |
| **App frame** | `layout.tsx`: `flex h-screen overflow-hidden`; sidebar **`w-56`**; column `flex-1 flex-col overflow-hidden`; `main` = `flex-1 overflow-y-auto bg-background` | Shell root + section: **`overflow-hidden`**; aside **`w-56 shrink-0`**; section **`min-h-0 flex-1 flex-col overflow-hidden`**; **`main`** `min-h-0 flex-1 overflow-y-auto` (only scroller); topbar **`px-4`** (`h-14`) |
| **Main / header surfaces** | `bg-background` on `main`, topbar | `bg-base-*` / borders on `alona_shell` header and outer wrapper |
| **Topbar layout** | `AppTopbar` has **no** route title in the bar; each `page.tsx` uses its own `h1` | Do **not** show `@page_title` in `alona_shell` — use it only for `<.live_title>` in `root.html.heex` |
| **Topbar-only deltas** | `app-topbar.tsx` | Same header region in `alona_shell.html.heex` |
| **Logo row** | v0: `h-14` header strip; mark is **`w-8 h-8`** (`32px` square), typ. initial in a rounded square — not an unbounded image | If Phoenix uses `logo.svg`, cap the **bounding box** (`h-8 w-8 object-contain` or similar). **`h-* w-auto` alone often oversizes** wide SVGs vs the ref. |
| **Topbar content** | v0 `AppTopbar`: mode pill, **local** date + time (often client tick), weather placeholder, then actions (theme, alerts, **Quick Action** dropdown) | **Quick Action**-style menus with **navigate-only** items → Daisy `dropdown` + `<.link>` (UI-only). **Alerts** tied to `mock-data` → ask before wiring. Theme toggle → `root.html.heex` / existing patterns. Do not ship only a single UTC line and call it parity. |

If React and Phoenix would **look different side-by-side** (light vs dark default, light vs dark sidebar, contrast), call that out and port until behavior matches the ref’s **intended** theme (read comments in `globals.css` and actual classes on `AppSidebar` / `body`), not only the diff hunk.

## Phase C — Classify

**UI-only** — port without asking: markup/classes, copy, icons, layout grids, conditional display of **existing** assigns, shell chrome that does not need new server data.

**Business logic** — stop and use **AskQuestion** (or clear user guidance): any change under `lib/mock-data.ts` or `lib/types.ts`; new/removed routes or `page.tsx` files; new API/fetch/form submit; new chart series or aggregates needing new data; new card props implying DB/presenter work; nav items added/removed in sidebar (router + `active_nav` + possibly schema).

For each blocked file, report: what changed, why it is not UI-only, suggested next steps.

## Phase D — Apply

- Touch only mapped Phoenix files; follow `alona-os-core/AGENTS.md`.
- Do **not** wire React `mock-data` into LiveView unless the user approves presenter/schema work.
- shadcn → Daisy for **content** areas: `bg-base-*`, `text-base-content/…`, borders `border-base-300`, etc. **Exception:** `bg-sidebar` / `text-sidebar-*` are **not** “just `base-100`” — map from `globals.css` `--sidebar*` (oklch) or equivalent vars in `assets/css/app.css`, then use them on the shell aside and `nav_item` (see rule file).
- **Shell actions:** Radix/shadcn `DropdownMenu` in `app-topbar.tsx` (Quick Actions, etc.) → DaisyUI `dropdown` / `menu` + `<.link navigate={…}>` for parity. Do not skip **visible** controls just because they live under `components/ui/` in React; reimplement with primitives already in the Phoenix stack. Submenus that only **navigate** or show **static** items are UI-only. Items that POST, open modals, or need `mock-data` still go through Phase C.
- `mix format` on edited files under `alona-os-core/apps/alona_ui`; optionally `mix compile` from `alona-os-core`.

## Phase E — Commit (before promotion)

**Never commit without explicit user confirmation.**

1. `git status` and `git diff` — stage only changes from this sync (typically `alona-os-core/apps/alona_ui/**`, and `.cursor/**` if this workflow was just added).
2. Do **not** stage `ref/alona-os-ui-design-new` in this commit.
3. Match recent commit style: `git log -5 --oneline`.
4. Example message shape:

```text
sync v0 ui to liveview: <short summary>

Ports UI from ref/alona-os-ui-design-new (<files or areas touched>).
```

Use a HEREDOC for multi-line messages if the user’s git workflow expects it.

## Phase F — Promote baseline

Only after Phase E succeeds **and** the user confirms again:

```bash
rm -rf ref/alona-os-ui-design
mv ref/alona-os-ui-design-new ref/alona-os-ui-design
```

Recommend a **second commit** for the reference tree only, e.g. `chore(ref): promote alona-os-ui-design baseline from v0 export`, stage `ref/alona-os-ui-design/**` only.

Remind the user: next v0 export goes in a new `ref/alona-os-ui-design-new`.

## Output

1. Short list of diffs (in-scope only) and classification.
2. **Shell/theme parity:** state what you verified (globals + layout + Phoenix root/shell) and any visual gaps you fixed or deferred.
3. Files edited in Phoenix (or none).
4. Blockers / questions if any.
5. Commit and promote steps only after user says so.
