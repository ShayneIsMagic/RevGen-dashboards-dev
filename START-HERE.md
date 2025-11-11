# RevGen Dashboards - Quick Start Guide

## ✅ What's Built

You now have **THREE separate dashboards**:

1. **Pipeline Manager** - `/` (http://localhost:3000/)
2. **Government Contracts Tracker** - `/contracts` (http://localhost:3000/contracts)
3. **Financial Dashboard** - `/financial` (http://localhost:3000/financial)

All three work independently and are fully functional.

---

## 🚀 How to Start

### Step 1: Open Terminal
Navigate to your project:
```bash
cd /Users/skroy/RevGen-dashboards-repo/RevGen-dashboards-dev
```

### Step 2: Start the Server
```bash
npm run dev
```

Wait for the message: `✓ Ready in...`

### Step 3: Open in Browser
- **Pipeline Manager**: http://localhost:3000/
- **Government Contracts**: http://localhost:3000/contracts
- **Financial Dashboard**: http://localhost:3000/financial

---

## 📋 Government Contracts Tracker

Your new dashboard includes:

### Features
- ✅ Track Federal, State, Local, Emergency opportunities
- ✅ Priority levels (CRITICAL, HIGH, MEDIUM, LOW)
- ✅ Capability match tracking (0-100%)
- ✅ Deadline alerts (7 days, overdue)
- ✅ 8-stage status workflow
- ✅ Action items with due dates
- ✅ Document tracking
- ✅ Value estimation
- ✅ Import/Export (JSON & Markdown)

### Quick Add Example
Based on your BidMatch report, here's your first opportunity:

```
Opportunity #16 - Illinois Inventory Management District 1

- Agency: Illinois Department of Central Management Services
- Type: Emergency
- Priority: CRITICAL
- Capability Match: 95%
- Estimated Value: $500,000 - $5,000,000
- Portal: https://www.bidbuy.illinois.gov/
- Status: new
- Action Items:
  • Visit BidBuy Illinois portal NOW
  • Check due date (emergency = 5-15 days)
  • Download all documents immediately
  • Start capability statement TODAY
```

---

## 📖 Documentation

- **`GOV-CONTRACTS-GUIDE.md`** - Complete user guide
- **`GOVERNMENT-CONTRACTS-FEATURE-SUMMARY.md`** - Technical details
- **`GOALS-CALCULATION-EXPLAINED.md`** - Goals feature documentation
- **`README.md`** - Project overview

---

## 🎯 All Three Dashboards

### Pipeline Manager (http://localhost:3000/)
- Goal tracking with run-rate analytics
- Leads pipeline
- Sales pipeline
- Active clients
- Lost deals & former clients
- Import/Export

### Government Contracts (http://localhost:3000/contracts)
- **NEW!** Track government contract opportunities
- Priority & deadline management
- Action items tracking
- Multi-stage workflow
- Federal, State, Local, Emergency types

### Financial Dashboard (http://localhost:3000/financial)
- Period selector (month/quarter/year)
- PDF import for financial reports
- Income & expense tracking
- Gross profit calculation
- Receivables aging

---

## 💡 Tips

1. **Each dashboard is independent** - No need to navigate between them
2. **Use browser bookmarks** - Save all three URLs
3. **Data is stored locally** - All data stays in your browser
4. **Export regularly** - Use JSON export for backups
5. **Start with Gov Contracts** - Add your BidMatch opportunities first

---

## 🆘 Troubleshooting

### If the server won't start:
```bash
# Kill any existing process
lsof -ti:3000 | xargs kill -9

# Clear cache
rm -rf .next

# Reinstall if needed
npm install

# Start fresh
npm run dev
```

### If you see a parsing error:
The cache might need clearing:
```bash
rm -rf .next
npm run dev
```

---

## 🎉 You're Ready!

Simply run:
```bash
npm run dev
```

Then open **http://localhost:3000/contracts** to start tracking government opportunities!

---

**Created:** November 11, 2025  
**Branch:** bid-match-dashboard  
**Status:** ✅ Ready to use

