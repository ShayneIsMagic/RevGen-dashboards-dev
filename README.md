## Zero Barriers Pipeline Dashboard

An internal dashboard for managing the Zero Barriers sales pipeline and financial health. The product bundles three views—Pipeline Manager, Government Contracts Tracker, and Financial Dashboard—into a single Next.js 16 application optimized for local-first workflows.

### Highlights

- Client-side storage via LocalForage and `localStorage` (no external API requirement)
- Goal tracking with run-rate analytics and pipeline health alerts
- Lead intake workflow including interaction history and status tracking
- Deal progression, conversion to active clients, and churn management
- **Government contract opportunity tracking** with priority alerts and deadline management
- Financial report parsing from PDF exports with receivables aging
- Markdown/JSON export utilities for snapshot reporting

---

## Project Structure

```
pipeline-manager-nextjs/
├── app/
│   ├── page.tsx             # Pipeline Manager shell
│   ├── contracts/page.tsx   # Government Contracts Tracker shell
│   └── financial/page.tsx   # Financial Dashboard shell
├── components/              # UI modules shared across views
│   ├── PipelineManager.tsx
│   ├── GovContractManager.tsx
│   └── FinancialDashboard.tsx
├── hooks/                   # LocalForage integration
├── lib/                     # Storage helpers, PDF parsing, utilities
├── types/                   # TypeScript type definitions
└── ...
```

Refer to `GOV-CONTRACTS-GUIDE.md` for Government Contracts documentation.

---

## Getting Started

### Prerequisites

- Node.js 18+ (Next.js 16 requirement)
- npm 9+ (or yarn/pnpm if configured)

### Install & Run

```bash
npm install
npm run dev
```

The dev server defaults to `http://localhost:3000`. If the port is taken, Next.js automatically increments (watch the terminal output).

### Build & Preview

```bash
npm run build
npm run start
```

The production build remains fully client-side; no backend services are required.

---

## Feature Overview

| View                        | Primary Features                                                                                                      |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Pipeline Manager            | Goal creation & analytics, lead intake, sales pipeline, active clients, lost deals, former clients, data export       |
| Government Contracts Tracker| Federal/State/Local/Emergency opportunity tracking, priority alerts, deadline management, action items, status workflow|
| Financial Dashboard         | Period selector (month/quarter/year), PDF import, income & expense breakdowns, gross profit, receivables aging        |

All three views offer import/export tooling and rely on browser storage so teams can test scenarios without provisioning infrastructure.

### Accessing the Dashboards

- **Pipeline Manager**: `http://localhost:3000/` (main page)
- **Government Contracts**: `http://localhost:3000/contracts`
- **Financial Dashboard**: `http://localhost:3000/financial`

All dashboards have navigation links to switch between views seamlessly.

---

## Testing

- Unit & integration coverage via Jest and React Testing Library (`npm run test`)
- Playwright end-to-end spec under `e2e/` (`npx playwright test`)

Refer to `docs/TESTING-GUIDE.md` if you need extra setup notes.

---

## Additional Documentation

- `GOV-CONTRACTS-GUIDE.md` - Complete guide for Government Contracts Tracker
- `GOALS-CALCULATION-EXPLAINED.md` - Detailed explanation of goal tracking and calculations
- `docs/PipelineManager.md`
- `docs/FinancialDashboard.md`
- `docs/ACCOUNTS-RECEIVABLE-GOALS-GUIDE.md`
- `docs/FINANCIAL-DASHBOARD-GUIDE.md`
- `docs/MIGRATION-COMPLETE.md`

These files capture user workflows, data contracts, and migration context.

---

## Deployment Notes

The app is static-host friendly. Once `npm run build` finishes, deploy the `.next` output through your preferred CDN (Vercel, Netlify, S3 + CloudFront, etc.). Because it persists to browser storage, zero server configuration is needed for the MVP.

---

## License

Internal use only unless explicitly relicensed.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
