# Goals Calculation Explained

## Overview

The Goals feature tracks progress from a **Starting Value** → **Current Value** → **Target Value** by a specific date.

---

## Input Fields

### 1. **Starting Value (FROM)**
- Where you began (e.g., $10,000 MRR at start of quarter)
- Can be **negative, zero, or positive**
- ✅ **Negative values are VALID** for tracking recovery from losses (e.g., -$26,635 negative cash flow)

### 2. **Current Value**
- Where you are now (e.g., $12,500 MRR today)
- Should be between Starting and Target (or progressing toward Target)
- ✅ **Can be negative** if recovering from losses

### 3. **Target Value (TO)**
- Where you want to be by the deadline (e.g., $20,000 MRR by Dec 31)
- Must be greater than Starting Value (showing progress/improvement)
- ✅ **Can be negative** if goal is to reduce losses (e.g., -$50k → -$10k)

### 4. **Target Date**
- Deadline for achieving the goal
- Must be in the future

---

## Calculations Explained

### **Formula Breakdown:**

```javascript
Starting Value: $10,000
Current Value: $12,500
Target Value:  $20,000
Days Elapsed:  20 days
Days Remaining: 40 days
```

### 1. **Progress Percentage**
```
Total Change Needed = Target - Starting
                    = $20,000 - $10,000
                    = $10,000

Current Progress = Current - Starting
                 = $12,500 - $10,000
                 = $2,500

Progress % = (Current Progress / Total Change) × 100
           = ($2,500 / $10,000) × 100
           = 25%
```

### 2. **Remaining Amount**
```
Remaining = Target - Current
          = $20,000 - $12,500
          = $7,500
```

### 3. **Current Run Rate** (How fast you're actually going)
```
Current Run Rate = (Current Progress) / (Days Elapsed)
                 = ($2,500) / (20 days)
                 = $125/day
```

**What it means:** You've been gaining $125 per day on average since you started.

### 4. **Required Run Rate** (How fast you NEED to go)
```
Required Run Rate = (Remaining) / (Days Remaining)
                  = ($7,500) / (40 days)
                  = $187.50/day
```

**What it means:** You need to gain $187.50 per day to hit your target.

### 5. **On Track Status**
```
On Track = Current Run Rate >= Required Run Rate
         = $125/day >= $187.50/day
         = FALSE ❌ Behind
```

---

## Example Scenarios

### ✅ **Scenario 1: Revenue Growth (Positive)**
```
FROM:    $50,000  (January revenue)
CURRENT: $65,000  (March revenue - we're here now)
TO:      $100,000 (December target)
```

**Calculation:**
- Total needed: $100,000 - $50,000 = $50,000
- Progress so far: $65,000 - $50,000 = $15,000 (30%)
- Remaining: $100,000 - $65,000 = $35,000
- If 60 days elapsed, current run rate: $15,000 / 60 = $250/day
- If 200 days remaining, required run rate: $35,000 / 200 = $175/day
- Status: ✅ **ON TRACK** (running at $250/day, only need $175/day)

---

### ⚠️ **Scenario 2: Cash Flow Reduction (Negative to Positive)**

```
FROM:    -$5,000  (negative cash flow in Q1)
CURRENT: -$2,000  (improved but still negative)
TO:      $10,000  (positive cash flow goal)
```

**What ACTUALLY happens in the code:**
- Total needed: $10,000 - (-$5,000) = $15,000 ✅ Correct!
- Progress: -$2,000 - (-$5,000) = $3,000 ✅ Correct! (moved $3k closer)
- Remaining: $10,000 - (-$2,000) = $12,000 ✅ Correct!

**Result:** This actually WORKS! The math handles it correctly.

---

### ✅ **Scenario 3: Loss Reduction (ALL Negative Values)**

```
FROM:    -$100,000 (losing $100k per month)
CURRENT: -$80,000  (still losing, but only $80k - improvement!)
TO:      -$50,000  (goal: reduce loss to $50k)
```

**This IS growth** - you're improving by reducing losses, even though all values are negative!

**Calculation:**
- Total improvement needed: -$50,000 - (-$100,000) = $50,000 ✅
- Progress made: -$80,000 - (-$100,000) = $20,000 improvement ✅
- Progress %: $20,000 / $50,000 = **40%** ✅ CORRECT!
- Remaining: -$50,000 - (-$80,000) = $30,000 left to improve ✅

**Mathematical Note:** Even though -$50k < -$100k in absolute terms, mathematically -$50k > -$100k, so validation passes correctly!

---

### ❌ **Scenario 4: Debt Reduction (Problem Case)**

If you're trying to track debt reduction (going from high debt to low debt):

```
FROM:    $50,000  (starting debt)
CURRENT: $35,000  (paid down some)
TO:      $0       (fully paid off)
```

**What happens:**
- Total needed: $0 - $50,000 = -$50,000 ❌
- Progress: $35,000 - $50,000 = -$15,000 ❌
- This shows NEGATIVE progress even though you're doing well!

**Solution:** For debt reduction, track it as POSITIVE numbers:
```
FROM:    0        (no debt paid yet)
CURRENT: 15,000   ($15k paid off)
TO:      50,000   (fully paid off target)
```

---

## ✅ **Negative Numbers ARE Fully Supported**

### **Valid Use Cases (ALL values can be negative!):**

1. **Recovery from Losses**: Track progress from negative to positive (e.g., -$26k → $8k → $70k)
2. **Loss Reduction (Edge Case)**: Reduce losses while staying negative (e.g., -$100k → -$80k → -$50k)
   - This IS growth - you're improving by $50k even though still losing money!
3. **Cash Flow Improvement**: From negative cash flow to profitability (e.g., -$5k → -$2k → $10k)
4. **Profit Recovery**: From operating losses to profit targets
5. **Break-Even Goals**: Target zero from losses (e.g., -$20k → -$5k → $0)
6. **Standard Growth**: Traditional positive growth (e.g., $10k → $30k → $100k)

### **How the Math Handles It:**

The calculations correctly handle negative starting values:
- FROM: -$26,635 (loss)
- CURRENT: $8,000 (profit!)
- TO: $70,000 (target)

**Calculation:**
- Total journey: $70,000 - (-$26,635) = $96,635 (full distance)
- Progress made: $8,000 - (-$26,635) = $34,635 (moved this far)
- Progress %: $34,635 / $96,635 = 35.8% ✅ CORRECT!

This is a **valid and important business scenario**!

---

## 🎯 **Best Practices**

### ✅ **DO:**
1. Use negative values when tracking losses or recovery (-$50k → -$10k or -$26k → $70k)
2. Ensure logical progression: Starting < Current ≤ Target
3. Set realistic target dates
4. Update Current Value regularly
5. Use ALL THREE negative values for loss reduction goals

### ❌ **DON'T:**
1. Set Current Value outside the Starting→Target range
2. Set Target equal to or less than Starting (no progress/improvement)
3. Set dates in the past
4. Confuse debt tracking with loss tracking (see Scenario 4)

---

## 📊 **Visual Display**

The goal card shows:

```
┌─────────────────────────────────────────┐
│ November 2025 (MRR)                     │
│                                          │
│ FROM $10,000 → CURRENT $12,500 → TO $20,000
│                                          │
│ By 11/29/2025                           │
│                                          │
│ Progress: 25%     Remaining: $7,500     │
│ Days Left: 40     Status: Behind        │
│                                          │
│ Current run rate: $125/day | Required: $187.50/day
└─────────────────────────────────────────┘
```

---

## 🔧 **Current Implementation**

### **Validation Logic (Current Implementation)**
```typescript
// ALL values can be negative (e.g., reducing losses: -$50k → -$30k → -$10k)
// Only ensures logical progression: Starting < Target and Starting <= Current <= Target

if (targetValue <= startingValue) {
  alert('Target Value must be different from (and progress beyond) Starting Value\n\nExamples:\n- Growth: $0 → $10k → $50k\n- Loss Reduction: -$50k → -$30k → -$10k');
  return;
}

if (currentValue < startingValue || currentValue > targetValue) {
  alert('Current Value must be between Starting and Target values\n\nStarting ≤ Current ≤ Target');
  return;
}
```

### **Math Handles Negative Numbers Correctly**
```typescript
// The formulas work perfectly with negative values:
const total = target - starting;           // Works: $70k - (-$26k) = $96k
const currentProgress = current - starting; // Works: $8k - (-$26k) = $34k
const remaining = target - current;         // Works: $70k - $8k = $62k
```

---

## Summary

**Current State:**
- ✅ Math formulas work correctly for ALL numbers (negative, zero, positive)
- ✅ Negative starting values are VALID for tracking recovery from losses
- ✅ Validation ensures logical progression (Starting < Current ≤ Target)
- ✅ Run rate calculations handle negative starting values correctly

**Example: Recovery from Loss**
```
FROM: -$26,635.29 (operating at a loss)
CURRENT: $8,000 (achieved profitability!)
TO: $70,000 (growth target)

Progress: 35.8% of the journey complete ✅
Current run rate: $11,545/day
Required run rate: $2,696/day
Status: ✓ On Track (running faster than needed)
```

This is **exactly the kind of business scenario** the goals feature should support!

