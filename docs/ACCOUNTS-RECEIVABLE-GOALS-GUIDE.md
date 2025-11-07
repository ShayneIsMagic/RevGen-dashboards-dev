# Accounts Receivable & MRR Goals Setup Guide

## Understanding Starting Value vs Current Value

### For Accounts Receivable Goals

#### **Starting Value** = Beginning Balance
- **What it represents**: Total outstanding invoices at the START of your tracking period
- **Example**: On January 1st, you have $50,000 in outstanding invoices
- **Purpose**: This is your baseline - the amount you're working FROM

#### **Current Value** = Current Outstanding Balance
- **What it represents**: Total outstanding invoices RIGHT NOW (updated daily/weekly)
- **Example**: Today is January 15th, you have $65,000 in outstanding invoices
- **Purpose**: This shows your current position - how much is still owed

#### **Target Value** = Goal for End of Period
- **What it represents**: Where you want to be by the end of the period
- **Example**: Goal to have $80,000 in outstanding invoices by end of quarter
- **OR**: Goal to collect $100,000 total (reducing receivables to $0)

## Setting Up Your Goals

### 1. Accounts Receivable - Monthly Goal

**Scenario**: Track monthly receivables growth

```
Goal Name: "January Accounts Receivable"
Category: Cash Flow
Starting Value: $50,000 (outstanding on Jan 1)
Current Value: $65,000 (outstanding today - Jan 15)
Target Value: $80,000 (goal by Jan 31)
Target Date: 2025-01-31
Unit: "$"
```

**What this tracks:**
- Progress: ($65,000 - $50,000) / ($80,000 - $50,000) = 50% progress
- Remaining: $15,000 to reach target
- Run Rate: How fast receivables are growing

### 2. Accounts Receivable - Collection Goal

**Scenario**: Track collection of outstanding invoices

```
Goal Name: "Q1 Collection Goal"
Category: Cash Flow
Starting Value: $150,000 (total outstanding at start of quarter)
Current Value: $120,000 (still outstanding - $30k collected)
Target Value: $0 (goal to collect all)
Target Date: 2025-03-31
Unit: "$"
```

**What this tracks:**
- Progress: ($150,000 - $120,000) / ($150,000 - $0) = 20% collected
- Remaining: $120,000 still to collect
- Run Rate: Collection rate per day

### 3. MRR - Monthly Recurring Revenue Goal

**Scenario**: Track MRR growth

```
Goal Name: "Q1 MRR Growth"
Category: MRR
Starting Value: $10,000 (MRR on Jan 1)
Current Value: $12,500 (current MRR - Jan 15)
Target Value: $15,000 (target MRR by Mar 31)
Target Date: 2025-03-31
Unit: "$"
```

**What this tracks:**
- Progress: ($12,500 - $10,000) / ($15,000 - $10,000) = 50% progress
- Remaining: $2,500 MRR growth needed
- Run Rate: MRR growth per day

### 4. Aging Receivables - Reduction Goal

**Scenario**: Reduce aging receivables (30+ days old)

```
Goal Name: "Reduce 90+ Day Aging"
Category: Custom
Starting Value: $25,000 (invoices 90+ days old on Jan 1)
Current Value: $18,000 (still 90+ days old)
Target Value: $5,000 (goal to reduce to)
Target Date: 2025-03-31
Unit: "$"
```

**What this tracks:**
- Progress: ($25,000 - $18,000) / ($25,000 - $5,000) = 35% reduction
- Remaining: $13,000 still needs to be collected
- Run Rate: Collection rate for aging receivables

## Recommended Goal Structures

### Monthly Goals

**1. Monthly AR Collection**
```
Starting Value: Total AR at start of month
Current Value: Current total AR (decreases as collected)
Target Value: $0 (collect all) OR target AR balance
Target Date: End of month
```

**2. Monthly MRR Growth**
```
Starting Value: MRR at start of month
Current Value: Current MRR
Target Value: Target MRR for end of month
Target Date: End of month
```

### Quarterly Goals

**1. Quarterly AR Growth**
```
Starting Value: AR balance at start of quarter
Current Value: Current AR balance
Target Value: Target AR balance for end of quarter
Target Date: End of quarter
```

**2. Quarterly MRR Target**
```
Starting Value: MRR at start of quarter
Current Value: Current MRR
Target Value: Target MRR for end of quarter
Target Date: End of quarter
```

**3. Quarterly Collection Goal**
```
Starting Value: Total outstanding at start of quarter
Current Value: Still outstanding (decreases as collected)
Target Value: $0 OR target reduction amount
Target Date: End of quarter
```

### Annual Goals

**1. Annual MRR Target**
```
Starting Value: MRR on Jan 1
Current Value: Current MRR
Target Value: Target MRR for Dec 31
Target Date: 2025-12-31
```

**2. Annual AR Collection**
```
Starting Value: Total AR at start of year
Current Value: Current AR balance
Target Value: Target AR balance or $0
Target Date: 2025-12-31
```

## Best Practices

### For Accounts Receivable:

1. **Track Growth vs Collection Separately**
   - Growth Goal: Starting = lower, Target = higher (tracking growth)
   - Collection Goal: Starting = higher, Target = lower/$0 (tracking collection)

2. **Update Current Value Regularly**
   - Daily: For active collection efforts
   - Weekly: For general tracking
   - Monthly: For long-term goals

3. **Use Real Data**
   - Starting Value: Actual balance from your accounting system
   - Current Value: Current balance from your accounting system
   - Target Value: Realistic goal based on historical data

### For MRR:

1. **Track Net New MRR**
   - Starting Value: MRR at period start
   - Current Value: Current MRR (includes new customers, churn, upgrades)
   - Target Value: Realistic growth target

2. **Account for Churn**
   - MRR can decrease due to churn
   - Target should account for expected churn

### For Aging Receivables:

1. **Track by Age Bucket**
   - Create separate goals for each bucket:
     - 0-30 days
     - 31-60 days
     - 61-90 days
     - 90+ days

2. **Focus on Reduction**
   - Starting Value: Amount in aging bucket
   - Current Value: Current amount in bucket
   - Target Value: Reduced amount (often $0 or target threshold)

## Example: Complete Setup

### Monthly Goals (January 2025)

**Goal 1: January AR Collection**
```
Name: "January AR Collection"
Category: Cash Flow
Starting Value: 50000
Current Value: 35000  (updated daily as invoices are paid)
Target Value: 0
Target Date: 2025-01-31
Unit: "$"
```

**Goal 2: January MRR Growth**
```
Name: "January MRR Growth"
Category: MRR
Starting Value: 10000
Current Value: 10500  (updated when new subscriptions start)
Target Value: 11000
Target Date: 2025-01-31
Unit: "$"
```

**Goal 3: Reduce 90+ Day Aging**
```
Name: "Collect 90+ Day Aging"
Category: Custom
Starting Value: 15000
Current Value: 12000  (updated as old invoices are collected)
Target Value: 5000
Target Date: 2025-01-31
Unit: "$"
```

### Quarterly Goals (Q1 2025)

**Goal 1: Q1 AR Balance Target**
```
Name: "Q1 AR Balance Target"
Category: Cash Flow
Starting Value: 150000
Current Value: 175000  (updated weekly)
Target Value: 200000
Target Date: 2025-03-31
Unit: "$"
```

**Goal 2: Q1 MRR Target**
```
Name: "Q1 MRR Target"
Category: MRR
Starting Value: 10000
Current Value: 12500
Target Value: 15000
Target Date: 2025-03-31
Unit: "$"
```

## How to Update Current Value

### Manual Update (Recommended for now)
1. Click the edit icon on the goal
2. Update "Current Value" field
3. Click "Done"
4. Metrics recalculate automatically

### Future Enhancement Ideas
- CSV import from accounting system
- API integration with QuickBooks/Xero
- Automatic daily/weekly updates

## Understanding the Metrics

### For Collection Goals (AR decreasing):
- **Progress**: Shows % collected
- **Remaining**: Amount still to collect
- **Current Run Rate**: Collection speed per day
- **Required Run Rate**: Needed collection speed to hit target

### For Growth Goals (AR/MRR increasing):
- **Progress**: Shows % growth achieved
- **Remaining**: Amount still needed
- **Current Run Rate**: Growth rate per day
- **Required Run Rate**: Needed growth rate to hit target

## Common Questions

**Q: Should Starting Value be anticipated or actual?**
A: **Actual** - Use the real balance from your accounting system at the start of the period. This gives you accurate tracking.

**Q: What if Current Value goes above Target?**
A: That's fine! Progress will show >100%, meaning you exceeded your goal. You can either:
- Celebrate the win
- Update Target Value to reflect new stretch goal

**Q: How often should I update Current Value?**
A: Depends on your needs:
- Daily: For active collection efforts
- Weekly: For general tracking
- Monthly: For long-term goals

**Q: Can I track both AR growth AND collection?**
A: Yes! Create two separate goals:
- One for total AR balance (growth)
- One for collection (reduction)

## Quick Reference

| Goal Type | Starting Value | Current Value | Target Value |
|-----------|---------------|---------------|--------------|
| **AR Collection** | Total outstanding | Current outstanding (decreases) | $0 or target |
| **AR Growth** | Starting balance | Current balance (increases) | Target balance |
| **MRR Growth** | Starting MRR | Current MRR (increases) | Target MRR |
| **Aging Reduction** | Starting aging amount | Current aging amount (decreases) | Target reduction |

