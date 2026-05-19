# Alona OS — Implementation State

Last updated: **2026-05-19**

Shared context for Cursor, ChatGPT, and humans. Describes what is **actually implemented**, not the long-term vision. Update this file when a feature crosses from stub → real (see `.cursor/rules/alona-os-agents-state.mdc`).

For **how ChatGPT should format Cursor prompts**, see [`CHATGPT_RULES.md`](CHATGPT_RULES.md).

Phoenix/LiveView coding guidelines remain in `alona-os-core/AGENTS.md` (generated Phoenix defaults).

---

# 1. Project status summary

**Current phase:**

- [x] Architecture exploration
- [x] UI prototyping (v0 → LiveView parity in progress)
- [x] Telemetry foundation (schema + seeds + read path)
- [ ] Real device integration
- [ ] Automation engine
- [ ] Production deployment (host bootstrap exists; app ingest not wired)

**Current priority:**

Solidify **telemetry contracts** and ship **one end-to-end ingest path** (MQTT → `alona_ingest` → `Measurements.record_measurement_and_current!/1`) before expanding automations or placeholder pages.

**Current constraints:**

- Single-property only (no `site` / `property_id` in schema)
- Local-first (Postgres + Mosquitto on Pi; no cloud dependency)
- Ingest is stubbed and **not started** in OTP release path
- UI structure evolves faster than backend contracts (slug lists in LiveViews)
- `alona-os-firmware` has **no source code** yet (README only)

---

# 2. Repository structure

## Repos

### alona-os-core

**Purpose:** Elixir umbrella — domain persistence, ingestion, Phoenix LiveView UI.

**Apps:**

| App | Role |
|-----|------|
| `alona_core` | Ecto schemas, contexts, Repo, PubSub |
| `alona_ingest` | MQTT/adapters (stubs); depends on `alona_core` only |
| `alona_ui` | Phoenix endpoint + LiveViews; depends on `alona_core` only (not ingest) |

**Key paths:** `apps/alona_core/`, `apps/alona_ingest/`, `apps/alona_ui/`, `config/`, single migration `apps/alona_core/priv/repo/migrations/20260516183000_initial_mvp.exs`.

### alona-os-firmware

**Purpose:** ESP32 node firmware (separate git repo).

**Status:** Early stage — **no firmware source** in repo; MQTT topic/payload contract **not finalized**.

### alona-os-infra

**Purpose:** Raspberry Pi host bootstrap — PostgreSQL, Mosquitto, `/etc/alona/alona.env` template, systemd example for UI.

**Does not** deploy or compile `alona-os-core`.

---

# 3. Current architecture boundaries

## alona_core

**Responsibilities:**

- Ecto schemas and one `AlonaCore.Repo`
- Context modules: `Topology`, `Measurements`, `Events`, `Tasks`, `Finance`, `Resources`, `States`
- `AlonaCore.Broadcast` — thin PubSub wrapper (`:refresh_dashboard`) without Phoenix.Endpoint dependency
- Seeds: `priv/repo/seeds.exs` (demo topology, streams, current values, tasks, expenses, events)

**Must NOT contain:**

- Phoenix / LiveView
- MQTT or protocol-specific parsing

**Status:** **PARTIAL** — domain schema and core write/read APIs exist; many tables have no context functions or seeds; cross-context side effects (e.g. Tasks → Events) exist.

---

## alona_ingest

**Responsibilities:**

- Broker connection, topic routing, vendor adapters, normalization → core measurements API

**Must NOT contain:**

- LiveView
- Direct UI assumptions

**Status:** **STUB**

**Implemented (skeleton only):**

- `AlonaIngest.Mqtt.Client` — `connect/0` → `{:error, :not_implemented}`
- `AlonaIngest.Mqtt.TopicRouter` — `route/2` → `{:ok, :ignored}`
- `AlonaIngest.Adapters.VictronAdapter` / `Esp32Adapter` — `normalize/1` → `{:error, :not_implemented}`
- `AlonaIngest.Workers.MeasurementWriter` — `enqueue/1` → `:ok`
- `AlonaIngest.Normalizers.MeasurementNormalizer` — stub

**Notes:**

- `AlonaIngest.Application` supervisor has **zero children**
- `alona_ui` does not depend on or start `alona_ingest`
- No `mix release` profile in repo yet; prod runs UI + core via `mix phx.server` / systemd example

---

## alona_ui

**Responsibilities:**

- LiveView pages, shell layout, `DashboardPresenter` (aggregates core reads for dashboards)
- Subscribes to `AlonaCore.Broadcast` for coarse full-dashboard refresh

**Must NOT contain:**

- Protocol/device-specific logic (today: **slug strings** are hardcoded — acceptable debt until binding registry exists)

**Status:** **PARTIAL**

- Data-backed pages use `AlonaCore` contexts (mostly)
- Exception: `TasksLive` uses `Repo.get/2` for one code path
- Many routes are placeholder LiveViews only

---

# 4. Implemented domains

## Topology

**Status:** **PARTIAL**

**Implemented:**

- Schemas: `Domain`, `Location`, `Entity`, `EntityLink`
- Migration: hierarchical `locations`, `entities` with `primary_domain_id`, `location_id`, `parent_entity_id`
- Context: `AlonaCore.Topology` — list/get helpers only (no create/update APIs)
- Seeds: domains (energy, water, environment, resources), house + rooms + well, entities (battery, PV, tanks, climate “sensors”, etc.)

**Missing:**

- `site` / `property` root scope (global unique `entities.name`, global unique `measurement_streams.slug`)
- Capability / endpoint model
- Context CRUD for entities/locations/links
- `EntityLink` unused in seeds/UI

**Notes:**

- `Topology.Domain` = functional **area** (energy, water), not a DDD bounded-context module — naming is confusing vs “domain-driven design”
- `entity_type` is a free string (`asset`, `sensor`, `resource_system`, `area`, …)

---

## Measurements

**Status:** **PARTIAL**

**Implemented:**

- Schemas: `DataSource`, `MetricDefinition`, `Device`, `Sensor`, `MeasurementStream`, `Measurement`, `CurrentValue`
- Context: `Measurements.streams_for_slugs/1`, `list_metric_definitions/0`, `record_measurement_and_current!/1` (transaction: insert measurement, upsert current, broadcast dashboard)
- Seeds: metric definitions, streams with stable **slugs**, demo `measurements` + `current_values`
- UI reads via slugs (e.g. `energy_battery_soc`, `water_tank_percent`, `env_living_temp_c`)

**Missing:**

- Normalized `%TelemetryPoint{}` (or equivalent) ingest contract
- Binding registry: external topic/key → `stream_id` / slug
- Retention, rollups, partitioning
- `Device` / `Sensor` / `DataSource` not wired in seeds (only a seed `DataSource` row; streams mostly omit `data_source_id`)
- Ingest does not call `record_measurement_and_current!/1` yet

**Current assumptions:**

- Each logical metric has a globally unique **`measurement_streams.slug`**
- UI and seeds hardcode slug lists; power slugs use **kW** in DB (Victron often W on wire — conversion belongs in ingest)
- Dashboard hot path = `current_values`; history = append-only `measurements`

---

## Events

**Status:** **PARTIAL**

**Implemented:**

- Schemas: `Event`, `EventLink`, `Observation`, `ObservationLink` (observations not seeded)
- Context: `list_recent_events/1`, `list_alert_events/1`, `create_event!/2` (optional entity link + dashboard broadcast)
- Seeds: sample warning + info events
- UI: Timeline, Command Center alerts, Energy page filters recent events
- Side effects: `Tasks.mark_completed!/1`, `Finance.create_expense!/1` create timeline events

**Missing:**

- Internal event bus separate from UI PubSub
- Event classification / versioned payload convention
- Idempotency for ingest-generated events
- Observations domain API

---

## Tasks

**Status:** **PARTIAL**

**Implemented:**

- Schemas: `Task`, `TaskLink`, `TaskChecklistItem` (checklist/links not used in UI)
- Context: `list_tasks/0`, `create_basic_task!/1`, `mark_completed!/1` (completion → Event)
- Seeds: three demo tasks
- UI: `TasksLive` — list pending, create task, complete task (uses `Tasks` + one `Repo.get`)

**Missing:**

- Task links to entities, checklist items, recurrence
- Dedicated task PubSub topic (uses global `:refresh_dashboard`)
- “Overdue” is a **status string** in seeds, not computed from `due_at`

---

## Finance

**Status:** **PARTIAL**

**Implemented:**

- Schemas: `ExpenseCategory`, `Expense`, `ExpenseAllocation`
- Context: `list_expenses/0`, `list_categories/0`, `create_expense!/2` (optional allocation + timeline event)
- Seeds: one category, one expense
- UI: `FinanceLive` — list + create expense

**Missing:**

- Allocations UI, reporting, multi-currency rules
- No finance-specific tests

---

## Resources

**Status:** **STUB** (schema only)

**Implemented:**

- Schemas: `ResourceType`, `ResourceStore`, `ResourceFlow`
- Context: read lists only (`list_resource_types`, `list_stores`, `list_recent_flows`)
- Migration includes `resource_flows.measured_by_stream_id` FK to streams

**Missing:**

- Seeds, UI data, write APIs, linkage to measurements ingest

---

## States

**Status:** **STUB** (schema + minimal API)

**Implemented:**

- Schemas: `EntityState`, `StateHistory`
- Context: `upsert_entity_state!/1`, `record_state_transition!/1`

**Missing:**

- Seeds, UI, automation integration

---

## Automations

**Status:** **NOT IMPLEMENTED**

**Notes:**

- `AutomationsLive` is a dashed placeholder (“rules engine + actuator hooks land after ingest…”)
- No rules DB tables, no engine, no command/actuation path
- Energy page mentions automations workshop as future UI only

---

# 5. Current UI state

**Pages with real backend data (measurements / core contexts):**

| Route | LiveView | Data source |
|-------|----------|-------------|
| `/` | CommandCenterLive | `DashboardPresenter` + slugs |
| `/energy` | EnergyLive | `Measurements` + `Events` |
| `/water` | WaterLive | `Measurements` |
| `/environment` | EnvironmentLive | `DashboardPresenter.room_cards/1` |
| `/timeline` | TimelineLive | `Events` |
| `/tasks` | TasksLive | `Tasks` (+ `Repo` once) |
| `/finance` | FinanceLive | `Finance` |

**Pages that are mostly placeholders** (shell nav only, dashed card copy):

- `/resources` — ResourcesLive
- `/food-production` — FoodProductionLive
- `/security` — SecurityLive
- `/maintenance` — MaintenanceLive
- `/automations` — AutomationsLive
- `/protocols` — ProtocolsLive
- `/settings` — SettingsLive

**UI source:**

- Visual structure synced from `ref/alona-os-ui-design*` (v0 React references)
- See `.cursor/rules/v0-liveview-sync.mdc` and `/sync-v0-ui-to-liveview` command
- Do not copy `mock-data.ts` into LiveView without explicit approval

**Important:**

- Slug lists duplicated in `dashboard_presenter.ex`, `energy_live.ex`, `water_live.ex`
- `EnvironmentLive` reloads via `command_center_binds()` (loads all command slugs, not env-only)
- Global `Broadcast.broadcast_dashboard/0` refreshes every subscribed LiveView on many writes

---

# 6. Real integrations status

## MQTT

**Status:** **NOT IMPLEMENTED** (in application code)

**Notes:**

- Mosquitto config in `alona-os-infra` (port 1883, anonymous on LAN by default)
- `ALONA_MQTT_HOST` / `ALONA_MQTT_PORT` in `alona-os-infra/env/alona.env.example` for future ingest
- No MQTT client dependency wired in `alona_ingest` yet

---

## ESP32

**Status:** **NOT IMPLEMENTED**

**Notes:**

- `alona-os-firmware` — README only, **no nodes flashed, no repo source**
- Backend: `AlonaIngest.Adapters.Esp32Adapter` stub only
- Planned nodes (room, water tank) are **not** in codebase — do not document as deployed

---

## Victron (Cerbo GX)

**Status:** **NOT IMPLEMENTED**

**Notes:**

- `AlonaIngest.Adapters.VictronAdapter` stub only
- Project docs describe Venus MQTT `N/<portalId>/...` → slug mapping — not coded
- Energy UI slugs (`energy_*`) exist for demo seeds, not live Cerbo data

---

## Modbus / Home Assistant / ESPHome

**Status:** **NOT IMPLEMENTED** — no references in codebase; future adapters should produce the same normalized point contract as MQTT ingest.

---

# 7. Telemetry architecture status

**Current canonical telemetry struct:** **NOT IMPLEMENTED**

Use a single internal struct (e.g. `%AlonaTelemetry.Point{}`) from all adapters into `Measurements.ingest_point/1` — **planned**, not in repo.

**Current ingest flow (actual):**

```text
(nothing running)

Target:
  device → Mosquitto → AlonaIngest.Mqtt.Client
         → TopicRouter → VictronAdapter | Esp32Adapter
         → MeasurementWriter → AlonaCore.Measurements.record_measurement_and_current!/1
         → measurements + current_values → Broadcast → LiveViews
```

**Current risks:**

- Hardcoded slugs in UI and seeds
- No binding registry (external key → stream)
- No versioned wire payload / shared firmware contract
- Synchronous DB write + global dashboard broadcast per point

**Planned next step:**

Define **MQTT topic + JSON envelope v1** and **one binding** (e.g. one temp/humidity stream); implement `alona_ingest` supervision + adapter → `record_measurement_and_current!/1`; verify on local Mosquitto without UI slug changes if bindings are DB-driven.

---

# 8. Known architectural risks

- Global unique `measurement_streams.slug` and `entities.name` — blocks multi-property without migration
- `alona_ingest` not supervised or in release — production is UI-only for app OTP
- UI ahead of contracts (slugs, no `alona_contracts` package)
- `measurements` table unbounded — no retention/partitioning strategy
- Stringly-typed statuses/types (`entity_type`, `event_type`, `severity`) — drift risk
- Cross-context coupling: Tasks/Finance → Events; all use coarse `broadcast_dashboard`
- Single monolithic migration — harder to evolve schema in parallel branches
- Minimal tests (placeholder `ExUnit` only) — ingest mapping regressions unguarded
- Firmware/backend contract undefined — highest integration risk
- `Topology.Domain` naming vs DDD “domain” confuses contributors

---

# 9. Current philosophy

**Alona OS is:**

- An **off-grid operating system** for a property — not only an IoT dashboard
- **Local-first** — Pi + LAN broker + Postgres; internet optional
- **Entity / event / resource** oriented operator model

**Core principles (target model):**

- Everything important is an **Entity**
- Everything measurable is a **Measurement Stream** (stable `slug`)
- Everything that happens is an **Event** (operator timeline)
- Everything actionable is a **Task** or future **Command**

**Principles not yet fully enforced in code:**

- Capabilities and commands are not first-class
- Automations and resources are schema/UI stubs
- Ingest must not bypass stream/slug abstraction

---

# 10. Current next milestone

**Implement normalized telemetry ingestion for one logical metric end-to-end on dev:**

1. Add internal point struct + `Measurements` ingest API (wrap `record_measurement_and_current!/1`).
2. Start `alona_ingest` supervisor with MQTT subscriber (local Mosquitto).
3. Map **one** topic/payload → **one** existing seed slug via config or first `integration_bindings` table row.
4. Confirm LiveView updates via PubSub without new slug literals in UI.

Do **not** treat “finish all placeholder pages” or “full Victron mapping” as this milestone.

---

# Appendix — quick reference

| Item | Location |
|------|----------|
| Energy slugs | `energy_battery_soc`, `energy_pv_kw`, `energy_house_load_kw`, `energy_battery_flow_kw`, `energy_generator_status` |
| Water slugs | `water_tank_percent`, `water_tank_liters`, `water_daily_liters_estimate`, `water_well_status`, `water_pump_status` |
| Env slugs | `env_*_temp_c`, `env_*_rh` (living, bedroom, bathroom) |
| Write API | `AlonaCore.Measurements.record_measurement_and_current!/1` |
| Dev setup | `alona-os-core/setup.sh`, `mix phx.server` — see `.cursor/rules/alona-os-setup.mdc` |
| Pi setup | `alona-os-infra/scripts/setup-pi.sh` |
