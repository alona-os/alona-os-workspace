# Alona OS — Implementation State

Last updated: **2026-05-19**

Shared context for Cursor, ChatGPT, and humans. Describes what is **actually implemented**, not the long-term vision. Update this file when a feature crosses from stub → real (see `.cursor/rules/alona-os-agents-state.mdc`).

Shared with **ChatGPT web** via the memory bundle (`memory/chatgpt/alona-iot/`); **Cursor** reads this file in the repo directly. ChatGPT-only prompt rules live in the bundle as `CHATGPT_RULES.md` (source: `scripts/chatgpt/CHATGPT_RULES.md`) — not at repo root.

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

Ship **one end-to-end MQTT ingest path** (local Mosquitto → `alona_ingest` → `Measurements.ingest_point/1`) for the Living Room ESP32 node (`env_living_temp_c`, `env_living_rh`) before expanding automations or placeholder pages.

**Current constraints:**

- Single **default** property in seeds (`default-site`); schema supports multi-property via `property_id` scoping
- Local-first (Postgres + Mosquitto on Pi; no cloud dependency)
- Envelope ingest path exists in `alona_ingest`; MQTT broker client **not started** in OTP release path
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
| `alona_ingest` | Telemetry envelope ingest + MQTT/adapters (transport stubs); depends on `alona_core` only |
| `alona_ui` | Phoenix endpoint + LiveViews; depends on `alona_core` only (not ingest) |

**Key paths:** `apps/alona_core/`, `apps/alona_ingest/`, `apps/alona_ui/`, `config/`, migrations under `apps/alona_core/priv/repo/migrations/` (initial MVP + `add_properties_scope`).

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

**Status:** **PARTIAL** — transport-agnostic envelope ingest only; **not live MQTT ingestion** (no broker subscriber, no device wire path in production yet).

**Implemented:**

- `AlonaIngest.Telemetry.Envelope` — v1 internal JSON/map → `AlonaCore.Telemetry.Point` (`decode/1`, `parse/1`; quality integer 0..100, default 100)
- `AlonaIngest.Ingest` — `parse/1`, `ingest/1` → `Measurements.ingest_point/1` (transport-agnostic)
- `AlonaIngest` — delegates to `Ingest`
- Tests: envelope unit + ingest integration (`apps/alona_ingest/test/`, fixtures, no broker)

**Still stub (Phase B — MQTT / device adapters):**

- `AlonaIngest.Mqtt.Client` — `connect/0` → `{:error, :not_implemented}`
- `AlonaIngest.Mqtt.TopicRouter` — `route/2` → `{:ok, :ignored}`
- `AlonaIngest.Adapters.VictronAdapter` / `Esp32Adapter` — `normalize/1` → `{:error, :not_implemented}`
- `AlonaIngest.Workers.MeasurementWriter` — `enqueue/1` → `:ok`
- `AlonaIngest.Normalizers.MeasurementNormalizer` — `normalize/1` delegates to `Ingest.parse/1`; prefer `Ingest.ingest/1` for persistence

**Notes:**

- `AlonaIngest.Application` supervisor has **zero children** (no MQTT process yet)
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

- Schemas: `Property`, `Domain`, `Location`, `Entity`, `EntityLink`
- Migration: hierarchical `locations`, `entities` with `property_id`, `primary_domain_id`, `location_id`, `parent_entity_id`
- Scoped uniqueness: `entities(property_id, name)`
- Context: `AlonaCore.Topology` — list/get helpers, `get_property_by_slug/1`, `default_property/0`
- Seeds: `default-site` property, domains, house + rooms + well, entities (battery, PV, tanks, climate “sensors”, etc.)

**Missing:**

- Multi-property UI / operator property switcher
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

- Schemas: `DataSource`, `MetricDefinition`, `Device`, `Sensor`, `MeasurementStream`, `Measurement`, `CurrentValue` (all scoped by `property_id` where applicable)
- Canonical struct: `AlonaCore.Telemetry.Point` — validated normalized reading before persistence
- Context: `Measurements.streams_for_slugs/2` (optional `property_slug`, defaults to `default-site`), `ingest_point/1`, `ingest_points/1`, `record_measurement_and_current!/1` (shared persist path; transaction + dashboard broadcast)
- Seeds: metric definitions, streams with stable **slugs**, demo `measurements` + `current_values`, ESP32 `living-room-esp32` data source + device + sensors on Living Room; `env_living_temp_c` / `env_living_rh` linked to ESP32 source
- Tests: `measurements_ingest_test.exs` (ingest, property isolation, batch partial results)
- UI reads via slugs unchanged (e.g. `energy_battery_soc`, `env_living_temp_c`)

**Missing:**

- Binding registry: external topic/key → `stream_id` / slug (v1 envelope uses `stream_slug` directly)
- Retention, rollups, partitioning

**Current assumptions:**

- Each logical metric has a unique **`measurement_streams.slug` per property** (`property_id` + `slug`)
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

**Status:** **NOT IMPLEMENTED** (broker client / subscriber in application code)

**Notes:**

- Mosquitto config in `alona-os-infra` (port 1883, anonymous on LAN by default)
- `ALONA_MQTT_HOST` / `ALONA_MQTT_PORT` in `alona-os-infra/env/alona.env.example` for future ingest
- No MQTT client dependency or supervised subscriber in `alona_ingest` yet
- **Not live MQTT ingestion:** Mosquitto on the Pi is host-only for now; the app has no subscriber. Envelope ingest (`AlonaIngest.Ingest.ingest/1`) works without a broker for IEx, tests, and future adapters (see `AlonaIngest.Telemetry.Envelope` moduledoc).

---

## ESP32

**Status:** **NOT IMPLEMENTED** (wire path)

**Notes:**

- `alona-os-firmware` — README only, **no nodes flashed, no repo source**
- Backend seeds: Living Room ESP32 `data_source`, `device`, `sensors`; target streams `env_living_temp_c`, `env_living_rh`
- `AlonaIngest.Adapters.Esp32Adapter` stub — Phase B should decode transport payload and call `AlonaIngest.Ingest.ingest/1`
- No live MQTT subscriber yet

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

**Current canonical telemetry struct:** **IMPLEMENTED** — `AlonaCore.Telemetry.Point`

Adapters and scripts build `%Point{}` and call `Measurements.ingest_point/1` (property + stream resolution, value-type check, persist, broadcast).

**Current ingest flow (actual):**

```text
Payload (v1 envelope map / JSON) → AlonaIngest.Telemetry.Envelope.parse/1
  → AlonaCore.Telemetry.Point
  → AlonaIngest.Ingest.ingest/1 → Measurements.ingest_point/1
  → measurements + current_values → Broadcast → LiveViews

Target (next transport layer):
  device → Mosquitto → AlonaIngest.Mqtt.Client → TopicRouter → adapter
  → AlonaIngest.Ingest.ingest/1 (same envelope path)
```

**Current risks:**

- Hardcoded slugs in UI and seeds
- No binding registry (external key → stream)
- v1 envelope is internal/dev-oriented; ESP32 MQTT topic layout still TBD
- Synchronous DB write + global dashboard broadcast per point

**Planned next step:**

MQTT subscriber + topic routing → `Ingest.ingest/1` for `env_living_temp_c` / `env_living_rh`; verify LiveView refresh on local Mosquitto (no binding table required yet).

---

# 8. Known architectural risks

- Multi-property operator UX not built (schema scoped; UI still assumes `default-site`)
- `alona_ingest` not supervised or in release — production is UI-only for app OTP
- UI ahead of contracts (slugs, no `alona_contracts` package)
- `measurements` table unbounded — no retention/partitioning strategy
- Stringly-typed statuses/types (`entity_type`, `event_type`, `severity`) — drift risk
- Cross-context coupling: Tasks/Finance → Events; all use coarse `broadcast_dashboard`
- Single monolithic migration — harder to evolve schema in parallel branches
- Envelope ingest covered by `alona_ingest` tests; MQTT transport tests still missing
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

**MQTT transport for Living Room ESP32 (two streams) on dev:**

1. Add MQTT client dep + supervised subscriber under `AlonaIngest.Application`.
2. `TopicRouter` + `Esp32Adapter` decode topic/payload → v1 envelope (or call `Ingest.ingest/1` directly).
3. Route topics to `env_living_temp_c` / `env_living_rh` via config (no binding table required yet).
4. Confirm LiveView updates via existing PubSub + slug reads on local Mosquitto.

Envelope → Point → `ingest_point/1` is **done** (no broker). Do **not** treat “finish all placeholder pages” or “full Victron mapping” as this milestone.

---

# Appendix — quick reference

| Item | Location |
|------|----------|
| Energy slugs | `energy_battery_soc`, `energy_pv_kw`, `energy_house_load_kw`, `energy_battery_flow_kw`, `energy_generator_status` |
| Water slugs | `water_tank_percent`, `water_tank_liters`, `water_daily_liters_estimate`, `water_well_status`, `water_pump_status` |
| Env slugs | `env_*_temp_c`, `env_*_rh` (living, bedroom, bathroom) |
| Default property | `default-site` (`properties.slug`) |
| Ingest API | `AlonaIngest.Ingest.ingest/1`, `AlonaCore.Measurements.ingest_point/1`, `ingest_points/1` |
| Envelope v1 | `AlonaIngest.Telemetry.Envelope` |
| Telemetry struct | `AlonaCore.Telemetry.Point` |
| Low-level write | `AlonaCore.Measurements.record_measurement_and_current!/1` |
| Dev setup | `alona-os-core/setup.sh`, `mix phx.server` — see `.cursor/rules/alona-os-setup.mdc` |
| Pi setup | `alona-os-infra/scripts/setup-pi.sh` |
