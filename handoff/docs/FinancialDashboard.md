## Financial Dashboard

The Financial Dashboard converts monthly, quarterly, and annual financial exports into actionable insights for the Zero Barriers leadership team.

### Access

- URL: `/financial`
- Entry point: `app/financial/page.tsx` rendering `components/FinancialDashboard.tsx`
- Storage: Browser `localStorage` under key pattern `financial_{period}_{date}`

### Primary Features

| Feature               | Description                                                                                             |
|-----------------------|---------------------------------------------------------------------------------------------------------|
| Period Selector       | Toggle Month / Quarter / Year; use arrows or ISO date picker to shift periods                           |
| PDF Import            | Upload a cash or accrual PDF report; PDF.js extracts text and the parser builds structured data         |
| Manual Paste Fallback | If parsing fails, paste text directly into the modal                                                    |
| Income Breakdown      | Category table with percentages of total income                                                         |
| Expense Breakdown     | Category table with percentages of total expenses                                                       |
| Gross Profit          | Displays absolute value and margin percentage                                                           |
| Receivables Aging     | Table of invoices with client, amount, dates, days outstanding, and status badge                        |
| Persistence           | Data saved per period/date combination; survives page reloads                                           |

### Data Model

```ts
interface FinancialData {
  period: 'month' | 'quarter' | 'year';
  periodDate: string;
  income: {
    total: number;
    categories: Array<{ name: string; amount: number }>;
  };
  grossProfit: {
    total: number;
    margin: number;
  };
  expenses: {
    total: number;
    categories: Array<{ name: string; amount: number }>;
  };
  receivables: Array<{
    client: string;
    amount: number;
    invoiceDate: string;
    dueDate: string;
    daysOutstanding: number;
    status: 'current' | '30-60' | '60-90' | '90+';
  }>;
}
```

### Receivables Status Rules

| Status   | Days Outstanding Range | Color Token                   |
|----------|------------------------|-------------------------------|
| current  | `<= 0`                 | Green (`text-green-600`)      |
| 1-30     | `1 – 30`               | Slate (`text-gray-600`)       |
| 30-60    | `31 – 60`              | Yellow (`text-yellow-600`)    |
| 60-90    | `61 – 90`              | Orange (`text-orange-600`)    |
| 90+      | `> 90`                 | Red (`text-red-600`)          |

### Calculated Metrics

| Metric                    | Calculation                                                                                  |
|---------------------------|----------------------------------------------------------------------------------------------|
| Total Income              | Sum of all income categories (excludes redundant “Total Income” line if present)             |
| Total Expenses            | Sum of all expense categories                                                                |
| Gross Profit              | `income.total - expenses.total`                                                              |
| Gross Margin              | `(grossProfit.total / income.total) * 100`                                                   |
| Receivables Aging Totals  | Sum of `amount` grouped by status buckets                                                    |

### Typical Workflow

1. Navigate to `/financial`.
2. Choose period type and set the period date (e.g., `2025-10-01` for October month view).
3. Click **Upload PDF Report** and select the accounting export.
4. Review extracted values; make sure categories and totals align with the source.
5. Close the modal—data is saved automatically and can be revisited later.

### Error Handling & Safeguards

- Non-PDF upload attempts trigger a user alert.
- Parser logs key matches (`Total Income`, `Total Expenses`) to the console for debugging.
- If parsing fails, the modal stays open with guidance to paste text manually.
- File input resets after each attempt to allow repeat imports of the same file.

### Complementary Guides

- `docs/FINANCIAL-DASHBOARD-GUIDE.md` – narrative workflow walkthrough
- `docs/PDF-IMPORT-GUIDE.md` – parsing troubleshooting
- `docs/RECEIVABLES-PARSING-EXPLAINED.md` – aging logic deep dive
- `docs/ACCOUNTS-RECEIVABLE-GOALS-GUIDE.md` – connecting receivables to pipeline goals

### Known Limitations & Roadmap

- Requires text-based PDFs (scanned documents need OCR first)
- Imports overwrite the selected period; no multi-file aggregation yet
- No chart visualizations; data is tabular for the MVP
- Future enhancements: CSV ingestion, exportable summaries, period-over-period comparisons

### Testing Coverage

- Parser unit tests in `__tests__/lib/storage.test.ts` and related helpers
- Receivables metric helpers covered by `__tests__/utils/calculateGoalMetrics.test.ts`
- Playwright spec (`e2e/pipeline-manager.spec.ts`) validates navigation between views

