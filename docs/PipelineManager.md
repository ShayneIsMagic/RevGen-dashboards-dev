## Pipeline Manager

The Pipeline Manager view provides the operational cockpit for day‑to‑day revenue activities. It centralizes goals, lead generation, deal progression, and client lifecycle management.

### Access

- URL: `/`
- Entry point: `app/page.tsx` renders `components/PipelineManager.tsx`
- Data layer: `hooks/useLocalForage.ts` + `lib/storage.ts`

### Core Concepts

- **Goals** – revenue and growth targets with starting/current/target values
- **Lead Pipeline** – marketing- and sales-qualified leads before proposal stage
- **Sales Pipeline** – opportunities progressing through mutually defined stages
- **Active Clients** – won deals currently delivering value
- **Lost Deals** – archived opportunities for retrospective analysis
- **Former Clients** – churned customers with historical context

### Sales Stages

| Stage               | Meaning                                                                 | Badge Color        | Abbreviation |
|---------------------|-------------------------------------------------------------------------|--------------------|--------------|
| Mutual Discovery    | Initial conversations and fit alignment                                 | Blue (`bg-blue-100`)  | `M`          |
| Proposal            | Scope and pricing delivered                                             | Blue               | `P`          |
| Realign             | Revisions or repositioning prior to close                              | Blue               | `R`          |
| Overcome            | Objection handling / negotiation                                       | Blue               | `O`          |
| Closed Won          | Deal accepted, ready for activation                                    | Green (`bg-green-100`) | `W`       |
| Closed Lost         | Opportunity declined                                                   | Red (`bg-red-100`)    | `L`       |

Stages are stored per deal and dictate available actions (e.g., Closed Won triggers the conversion workflow).

### Key Metrics & Alerts

| Metric / Alert                | Source / Calculation                                                                     | Where Displayed                         |
|-------------------------------|-------------------------------------------------------------------------------------------|-----------------------------------------|
| Goal Progress (%)             | `(currentValue - startingValue) / (targetValue - startingValue)`                         | Goal cards                              |
| Remaining Amount              | `targetValue - currentValue`                                                             | Goal cards                              |
| Days Remaining                | `targetDate - today` (ceil)                                                              | Goal cards                              |
| Run Rate vs Required          | `currentRunRate` from elapsed days vs `requiredRunRate` to hit target                    | Goal cards (status badge)               |
| Pipeline Health Alert         | Trigger when `salesPipeline.length < 15`                                                 | Banner above goals section              |
| Pipeline Total Value          | Sum of `amount` (and `mrrAmount` where provided) for the active tab                      | Tab header subtitle                     |
| Export Snapshots              | JSON + Markdown exports stamped with ISO date                                             | Header buttons                          |

All calculations live in `lib/utils.ts` (`calculateGoalMetrics`) with unit tests under `__tests__/utils/calculateGoalMetrics.test.ts`.

### Data Persistence

- Goals, pipelines, and client lists persist via LocalForage (IndexedDB)
- Keys: `goals`, `leadPipeline`, `salesPipeline`, `activeClients`, `lostDeals`, `formerClients`
- Import/export:
  - JSON snapshot download/upload
  - Markdown report summarizing the current state

### UI Regions

1. **Header**
   - Export JSON / Export Markdown
   - Import JSON (file input) with overwrite confirmation
   - Financial Dashboard shortcut (purple button)

2. **Goals Section**
   - Alert when pipeline count < 15 leads
   - Add Goal form with validation
   - Metric cards (progress %, remaining, days left, status colorization)
   - Run-rate comparison (current vs required)

3. **Pipeline Management**
   - Tabbed navigation: Leads, Sales, Active Clients, Lost Deals, Former Clients
   - Add forms adapt to the active tab (e.g., lead intake vs deal creation)
   - Inline edit mode with save/cancel controls
   - Actions:
     - Move to Active, Lost, Former
     - Convert Closed Won deals with payment type + MRR capture
     - Delete records
     - Add interaction (lead notes, channel, date)

4. **Tables**
   - Column layout responds to current view
   - Stage badges with color mapping
   - Date formatting using locale strings

### Workflows

- **Create & Track a Goal**
  1. Click “Add Goal”
  2. Supply name, target value, and target date (required)
  3. Save. Metrics update immediately and persist to storage.

- **Add a Lead**
  1. Ensure “Lead Pipeline” tab is active
  2. Click “Add Lead”, populate prospect/company/source
  3. Save to persist. Lead count contributes to pipeline health alert.

- **Progress a Deal**
  1. Switch to “Sales Pipeline”
  2. Edit stage inline or update next steps/dates
  3. Mark Closed Won → choose payment type (MRR, Project, Hybrid) and optionally MRR amount
  4. Deal is copied to Active Clients and removed from sales queue

- **Archive a Client**
  1. Open “Active Clients”
  2. Use the box icon (📦) to move to Former Clients
  3. End date is stamped automatically

- **Import Historic Data**
  1. Click “Import JSON”
  2. Select export file produced by this app
  3. Accept overwrite prompt. App reloads to reflect imported state.

### Guardrails & Validation

- Alerts on required fields for goals and deals
- Pipeline health warning when sales pipeline falls below 15 items
- Confirmation prompts for destructive operations
- Type coercion for numeric fields to avoid NaN persistence

### Testing Coverage

- Unit tests for goal metrics (`__tests__/utils/calculateGoalMetrics.test.ts`)
- Component tests targeting form flows and table interactions (`__tests__/components/PipelineManager.test.tsx`)
- Integration tests verifying storage and alerts (`__tests__/integration/data-flow.test.tsx`)
- Playwright e2e scenario under `e2e/pipeline-manager.spec.ts`

### Known Limitations

- No multi-user sync; all storage is browser-local
- Prompt-driven interactions (window.prompt) for quick MVP
- No authentication or role-based access controls yet

