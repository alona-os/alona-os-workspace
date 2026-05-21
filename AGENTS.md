# Alona OS — Implementation State

Last updated: **2026-05-21**

Shared context for Cursor, ChatGPT, and humans. Describes what is **actually implemented**, not the long-term vision. Update this file when a feature crosses from stub → real (see `.cursor/rules/alona-os-agents-state.mdc`).

Shared with **ChatGPT web** via the memory bundle (`memory/chatgpt/alona-iot/`); **Cursor** reads this file in the repo directly. ChatGPT-only prompt rules live in the bundle as `CHATGPT_RULES.md` (source: `scripts/chatgpt/CHATGPT_RULES.md`) — not at repo root.

Phoenix/LiveView coding guidelines remain in `alona-os-core/AGENTS.md` (generated Phoenix defaults).

---

# 1. Project status summary

**Current phase:**

- [x] Architecture exploration
- [x] UI prototyping (v0 → LiveView parity in progress)
- [x] Telemetry foundation (schema + seeds + read path)
- [x] Real device integration (Living Room ESP32 gateway MQTT → ingest; ESP-IDF ESP-NOW gateway + **`examples/temp_humidity_node`** (fake temp/RH only; shared **`alona_espnow_v1_build()`**) + bench **`examples/espnow_fake_node`** in **alona-os-firmware**; production sensor driver / pairing / deep sleep not yet)
- [ ] Automation engine
- [ ] Production deployment (host bootstrap exists; app ingest not wired)

**Current priority:**

Extend **real ingest coverage** beyond the Living Room MVP (production ESP-NOW sensor nodes, then Victron adapters) without bloating unfinished UI stubs or automations.

**Current constraints:**

- Single **default** property in seeds (`default-site`); schema supports multi-property via `property_id` scoping
- Local-first (Postgres + Mosquitto on Pi; no cloud dependency)
- Envelope ingest path exists in `alona_ingest`; **ESP32 gateway MQTT subscriber** runs under `AlonaIngest.Application` when `alona_ui` starts (unless `ALONA_MQTT_ENABLED=false` or test env disables it). **Sensor nodes use ESP-NOW to gateways only** — not MQTT to the Pi (see §6–§7).
- UI structure evolves faster than backend contracts (slug lists in LiveViews)
- `alona-os-firmware` ships **ESP-IDF gateway** + **`examples/temp_humidity_node`** (structured node; fake readings only; no sensor driver yet; no deep sleep) + **`examples/espnow_fake_node`** + **`docs/gateway-setup.md`**; optional **`property.local.json`** + **`scripts/sync_property_manifest.py`** regenerate gateway + node **`alona_config.h`** from one JSON file (gitignored); contracts remain **`docs/esp32-espnow-v1.md`** + **`docs/esp32-mqtt-v1.md`**

---

# 2. Repository structure

## Repos

### alona-os-core

**Purpose:** Elixir umbrella — domain persistence, ingestion, Phoenix LiveView UI.

**Apps:**

| App            | Role                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `alona_core`   | Ecto schemas, contexts, Repo, PubSub                                                                                   |
| `alona_ingest` | Telemetry envelope ingest + MQTT (Living Room ESP32 MVP); depends on `alona_core`; **not** depended on by `alona_core` |
| `alona_ui`     | Phoenix endpoint + LiveViews; depends on `alona_core` and `alona_ingest` (OTP starts ingest with the umbrella)         |

**Key paths:** `apps/alona_core/`, `apps/alona_ingest/`, `apps/alona_ui/`, `config/`, migrations under `apps/alona_core/priv/repo/migrations/` (initial MVP + `add_properties_scope`).

### alona-os-firmware

**Purpose:** ESP32 **sensor node** and **gateway** firmware (separate git repo).

**Status:** **PARTIAL** — **ESP-IDF** gateway (`gateway/`) + shared **`components/alona_protocol`** (ESP-NOW v1 decode + MQTT v1 build + **`alona_espnow_v1_build()`** for nodes) + **`examples/temp_humidity_node`** (Living Room template; **fake** temp/RH via `read_temperature_humidity()` only; **no** real sensor driver, **no** deep sleep yet) + bench **`examples/espnow_fake_node`**; optional **`property.local.json`** → **`scripts/sync_property_manifest.py`** regenerates gateway + node **`alona_config.h`** from one operator file (Wi‑Fi/MQTT/ESP-NOW MAC+channel); **ESP-NOW v1** and **MQTT v1** documented in **`docs/esp32-espnow-v1.md`** and **`docs/esp32-mqtt-v1.md`** (MQTT aligned with `Esp32Adapter`). Operator setup: **`docs/gateway-setup.md`**. Pairing, encryption, power-managed production nodes still future.

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

**Status:** **PARTIAL** — envelope ingest and **Living Room ESP32 MQTT ingest** wired; Victron/other transports still stubs.

**Implemented:**

- `AlonaIngest.Telemetry.Envelope` — v1 internal JSON/map → `AlonaCore.Telemetry.Point` (`decode/1`, `parse/1`; quality integer 0..100, default 100)
- `AlonaIngest.Ingest` — `parse/1`, `ingest/1` → `Measurements.ingest_point/1` (transport-agnostic)
- `AlonaIngest` — delegates to `Ingest`
- Tests: envelope unit + ingest integration (`apps/alona_ingest/test/`, fixtures, no broker)
- Tests: MQTT `TopicRouter` + payload→DB route tests (no MQTT broker harness)

- `AlonaIngest.Adapters.Esp32Adapter` — `normalize/1` → v1 envelope maps from gateway JSON (living room MVP reading → slug map)

**MQTT MVP (living room telemetry topic):**

- `tortoise311` supervised `Tortoise311.Connection` from `AlonaIngest.Application` when `enabled: true`
- `AlonaIngest.Mqtt.Handler` — `handle_message/3`; joins topic levels → `TopicRouter.route/2`
- `AlonaIngest.Mqtt.Client` — `child_spec/0`, `connection_opts/0`; config under `Application` (`config/config.exs` + `config/mqtt_runtime.exs` when `Mix.env()` is `dev` or `prod`)
- `AlonaIngest.Mqtt.TopicRouter` — configured literal topic(s); `Esp32Adapter.normalize/1` → `Enum.map` `Ingest.ingest/1`; `{:partial_ingest_failed, failures}` when any envelope fails

**Still stub / follow-up:**

- `AlonaIngest.Adapters.VictronAdapter` — `normalize/1` → `{:error, :not_implemented}`
- `AlonaIngest.Workers.MeasurementWriter` — `enqueue/1` → `:ok`
- `AlonaIngest.Normalizers.MeasurementNormalizer` — `normalize/1` delegates to `Ingest.parse/1`; prefer `Ingest.ingest/1` for persistence

**Notes:**

- MQTT disabled in test (`enabled: false`); no broker fixtures in CI
- No binding registry yet (topics + adapter path are MVP literals)
- No `mix release` profile in repo yet; prod runs UI + ingest via `mix phx.server` / systemd example

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

| Route          | LiveView          | Data source                       |
| -------------- | ----------------- | --------------------------------- |
| `/`            | CommandCenterLive | `DashboardPresenter` + slugs      |
| `/energy`      | EnergyLive        | `Measurements` + `Events`         |
| `/water`       | WaterLive         | `Measurements`                    |
| `/environment` | EnvironmentLive   | `DashboardPresenter.room_cards/1` |
| `/timeline`    | TimelineLive      | `Events`                          |
| `/tasks`       | TasksLive         | `Tasks` (+ `Repo` once)           |
| `/finance`     | FinanceLive       | `Finance`                         |

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

**Status:** **PARTIAL** — **subscriber implemented** for ESP32 **gateway** Living Room MVP; no TLS/auth story; no Victron wiring.

**Notes:**

- Mosquitto config in `alona-os-infra` (port 1883, anonymous on LAN by default)
- `ALONA_MQTT_*` in `alona-os-infra/env/alona.env.example` (+ `mqtt_runtime.exs` for `:dev`/`:prod`); see `apps/alona_ingest/README.md`
- `tortoise311` connection supervised when `enabled: true`
- **Only gateway ESP32 devices** publish to the broker; sensor nodes use ESP-NOW (§ ESP32 below)
- MQTT Living Room MVP: topic **`alona/esp32/living-room/telemetry`**; gateway JSON contract in **`alona-os-firmware/docs/esp32-mqtt-v1.md`** (summary + `mosquitto_pub` in `apps/alona_ingest/README.md`)

---

## ESP32

**Status:** **PARTIAL** (live **gateway → MQTT** ingest for living room MVP → `Esp32Adapter` → `Ingest.ingest/1`; **ESP-IDF ESP-NOW gateway** + **`examples/temp_humidity_node`** + bench **`examples/espnow_fake_node`** in **`alona-os-firmware`**; **production-grade** ESP-NOW nodes — real sensors, pairing, deep sleep — not shipped yet)

**Architecture (target):**

```text
Sensor node(s)  --ESP-NOW-->  Gateway ESP32  --MQTT JSON v1-->  Mosquitto  -->  alona_ingest
```

- **Nodes** do not connect to Mosquitto or Wi-Fi for telemetry (ESP-NOW only).
- **Gateways** translate node frames into MQTT v1 and publish to location topics.
- **MVP shortcut:** one ESP32 may be node + gateway (local sensor + MQTT publish); backend contract unchanged.

**Notes:**

- **`examples/temp_humidity_node`** — first structured Living Room sensor-node firmware: boot → ESP-NOW → **`read_temperature_humidity()`** (stub returns **23.4 °C / 55.0 % RH** only) → send every **5 s**; payloads serialized only via **`alona_espnow_v1_build()`** in **`components/alona_protocol`** (no inline JSON in `main.c`). **No** MQTT on the node. **No** real sensor driver / I2C yet. **No** deep sleep yet. Default `device_id`: **`living-room-node-01`** (override in `alona_config.h`).
- **ESP-NOW v1 (node → gateway):** [`alona-os-firmware/docs/esp32-espnow-v1.md`](alona-os-firmware/docs/esp32-espnow-v1.md) — **documented**; **gateway receive + MQTT forward** implemented in **`alona-os-firmware/gateway/`** (+ **`components/alona_protocol`**); bench sender **`examples/espnow_fake_node`** (channel-only, no Wi-Fi join)
- **Operator manifest:** **`property.local.json`** (copy from **`property.local.json.example`**) + **`scripts/sync_property_manifest.py`** keeps gateway Wi‑Fi/MQTT and shared ESP‑NOW **`wifi_channel`** / **`gateway_sta_mac`** aligned across **`gateway/`** + **`examples/temp_humidity_node`** + **`examples/espnow_fake_node`** (`alona-os-firmware`). Pi **`SECRET_KEY_BASE`** / DB URLs stay in **`alona-os-infra`** only.
- **MQTT v1 (gateway → Pi):** [`alona-os-firmware/docs/esp32-mqtt-v1.md`](alona-os-firmware/docs/esp32-mqtt-v1.md) — **documented**; backend ingest **implemented**
- `alona-os-firmware` — gateway firmware + structured temp/RH node + fake node + **`docs/gateway-setup.md`**; MVP transport is **best-effort** (not reliable delivery)
- Backend seeds: Living Room ESP32 `data_source`, `device`, `sensors`; target streams `env_living_temp_c`, `env_living_rh`
- `AlonaIngest.Adapters.Esp32Adapter` — **gateway** MQTT JSON → v1 envelope maps; **`TopicRouter`** invokes normalize + ingest for configured topics

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
Sensor node(s)  --ESP-NOW-->  Gateway ESP32  --MQTT JSON v1-->
  AlonaIngest.Mqtt.Handler / TopicRouter
  → Esp32Adapter.normalize → v1 envelope maps
  → Envelope.parse (via AlonaIngest.Ingest.ingest)
  → AlonaCore.Telemetry.Point
  → Measurements.ingest_point/1
  → measurements + current_values → Broadcast → LiveViews

Backend implements only the broker → ingest leg. ESP-NOW pairing and gateway bridging are **firmware-side** (`alona-os-firmware/gateway`).

Also (transport-agnostic scripts / HTTP later):
Payload (v1 envelope map / JSON) → AlonaIngest.Ingest.ingest/1 → same path as above
```

**Wire contracts:**

| Hop            | Doc                                                               | Backend                                                                                                     |
| -------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Node → gateway | [`esp32-espnow-v1.md`](alona-os-firmware/docs/esp32-espnow-v1.md) | ESP-IDF gateway + **`examples/temp_humidity_node`** + **`examples/espnow_fake_node`** (`alona-os-firmware`) |
| Gateway → Pi   | [`esp32-mqtt-v1.md`](alona-os-firmware/docs/esp32-mqtt-v1.md)     | `Esp32Adapter` + MQTT subscriber                                                                            |

**Current risks:**

- Hardcoded slugs in UI and seeds
- No binding registry (external key → stream); ESP32 gateway MQTT uses **configured literal topics** matching `Esp32Adapter` only
- ESP-NOW node frames are not validated by `alona_ingest`; gateway must emit MQTT v1 aligned with `Esp32Adapter`
- v1 envelope is internal/dev-oriented; wildcard topic orchestration deferred
- Synchronous DB write + global dashboard broadcast per point

**Planned next step:**

Extend **`examples/temp_humidity_node`** toward production nodes — **real sensors** (implement `read_temperature_humidity()`), pairing/allowlist, power/deep sleep — harden gateway MQTT on the Pi (TLS/auth, backoff/tuning optional), then Victron/`VictronAdapter` separately. Gateway reference implementation exists under **`alona-os-firmware/gateway/`**.

---

# 8. Known architectural risks

- Multi-property operator UX not built (schema scoped; UI still assumes `default-site`)
- `alona_ingest` runs inside umbrella when `mix phx.server` boots but **OTP release packaging** (`mix release`) is still not defined — production systemd today assumes `mix` task startup
- UI ahead of contracts (slugs, no `alona_contracts` package)
- `measurements` table unbounded — no retention/partitioning strategy
- Stringly-typed statuses/types (`entity_type`, `event_type`, `severity`) — drift risk
- Cross-context coupling: Tasks/Finance → Events; all use coarse `broadcast_dashboard`
- Single monolithic migration — harder to evolve schema in parallel branches
- Envelope ingest + MQTT `TopicRouter` covered by tests; broker integration harness still deferred
- Gateway ESP-IDF exists but **MVP transport only** — **`examples/temp_humidity_node`** exercises the path with fake readings only (no sensor driver); **`examples/espnow_fake_node`** is a minimal ramping bench sender; RF pairing/encryption and reliable delivery still open
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

Ship the first production-ready read telemetry path for ESP32 devices: stable device dev workflow, real temp/RH sensor reads, and multi-node deployment across the first rooms. Keep command/actuation work out of scope until read telemetry is reliable.

# 11. Future tasks backlog

These are **planned follow-up tasks**, not current implementation state. Discuss and refine after the first two device milestones are clear.

1. **Milestone 1 — Set up the device development process**
   - Define the repeatable local workflow for ESP-IDF device work: build, flash, monitor, configure manifests, test gateway/node communication, and document the operator/dev loop.
   - Keep the process friendly for frequent iteration on `gateway/`, `examples/temp_humidity_node`, and future production node firmware.

2. **Milestone 2 — Send real sensor values from devices**
   - Replace fake `read_temperature_humidity()` values in `examples/temp_humidity_node` with real sensor reads.
   - Keep serialization through `alona_espnow_v1_build()` and preserve the existing ESP-NOW → gateway → MQTT → ingest contract.
   - Validate end-to-end that real readings update `env_living_temp_c` and `env_living_rh` in `current_values`.

3. **Milestone 3 — Deploy three temp/RH nodes across rooms**
   - Reuse the stabilized temp/RH node pattern with distinct `device_id` values and per-room stream mappings.
   - Bring the first three physical room sensors online and verify that each updates the correct dashboard/current value streams.
   - Use this milestone to validate that adding new read-only devices is mostly configuration + seeding, not custom backend work.

4. **Milestone 4 — Add the well distance sensor node**
   - Introduce the first non-temp/RH node type for well monitoring.
   - Add distance reading support (`distance_cm`) and define calibration rules for converting raw distance into useful water-level values.
   - Add or map streams such as `water_well_distance_cm` and a derived water level value when the calibration model is decided.
   - Treat this as the first real extensibility test for multiple sensor/device types.

5. **Milestone 5 — Add power management for battery nodes**
   - Add deep sleep support to production sensor nodes once the read telemetry path is stable.
   - Add battery voltage reporting and map it into telemetry streams or device health state.
   - Emit low-battery events/alerts when thresholds are defined.
   - Keep reliability simple at first: predictable wake → read → send → sleep flow before adding retries or complex offline logic.

6. **Discuss and decide the next device roadmap**
   - Decide sequencing for pairing/allowlists, encryption, retries, node identity hardening, error reporting, and additional sensor/device types.
   - Do not implement command/actuation concepts here yet; keep read telemetry production-ready first.

---

# Appendix — quick reference

| Item                                      | Location                                                                                                                                                                                                                                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Energy slugs                              | `energy_battery_soc`, `energy_pv_kw`, `energy_house_load_kw`, `energy_battery_flow_kw`, `energy_generator_status`                                                                                                                                                                                    |
| Water slugs                               | `water_tank_percent`, `water_tank_liters`, `water_daily_liters_estimate`, `water_well_status`, `water_pump_status`                                                                                                                                                                                   |
| Env slugs                                 | `env_*_temp_c`, `env_*_rh` (living, bedroom, bathroom)                                                                                                                                                                                                                                               |
| ESP32 ESP-NOW (node → gateway v1)         | [`alona-os-firmware/docs/esp32-espnow-v1.md`](alona-os-firmware/docs/esp32-espnow-v1.md); node template [`examples/temp_humidity_node`](alona-os-firmware/examples/temp_humidity_node/README.md); gateway build [`alona-os-firmware/docs/gateway-setup.md`](alona-os-firmware/docs/gateway-setup.md) |
| ESP32 MQTT (gateway → Pi, MVP topic + v1) | `alona/esp32/living-room/telemetry`; [`alona-os-firmware/docs/esp32-mqtt-v1.md`](alona-os-firmware/docs/esp32-mqtt-v1.md); operator summary `apps/alona_ingest/README.md`; `ALONA_MQTT_*` + `mqtt_runtime.exs`                                                                                       |
| Default property                          | `default-site` (`properties.slug`)                                                                                                                                                                                                                                                                   |
| Ingest API                                | `AlonaIngest.Ingest.ingest/1`, `AlonaCore.Measurements.ingest_point/1`, `ingest_points/1`                                                                                                                                                                                                            |
| Envelope v1                               | `AlonaIngest.Telemetry.Envelope`                                                                                                                                                                                                                                                                     |
| Telemetry struct                          | `AlonaCore.Telemetry.Point`                                                                                                                                                                                                                                                                          |
| Low-level write                           | `AlonaCore.Measurements.record_measurement_and_current!/1`                                                                                                                                                                                                                                           |
| Dev setup                                 | `alona-os-core/setup.sh`, `mix phx.server` — see `.cursor/rules/alona-os-setup.mdc`                                                                                                                                                                                                                  |
| Pi setup                                  | `alona-os-infra/scripts/setup-pi.sh`                                                                                                                                                                                                                                                                 |
