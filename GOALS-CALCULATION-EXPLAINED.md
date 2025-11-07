# Goals Calculation Explained

## Overview

The Goals feature tracks progress from a **Starting Value** → **Current Value** → **Target Value** by a specific date.

---

## Input Fields

### 1. **Starting Value (FROM)**
- Where you began (e.g., $10,000 MRR at start of quarter)
- Can be **0** or positive
- ⚠️ **Negative numbers ARE technically accepted but NOT recommended**

### 2. **Current Value**
- Where you are now (e.g., $12,500 MRR today)
- Should be between Starting and Target
- ⚠️ **Negative numbers ARE technically accepted but will break calculations**

### 3. **Target Value (TO)**
- Where you want to be by the deadline (e.g., $20,000 MRR by Dec 31)
- Should be greater than Starting Value
- ⚠️ **Negative numbers ARE technically accepted but will break calculations**

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

### ❌ **Scenario 3: Debt Reduction (Problem Case)**

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

## ⚠️ **Current Issues with Negative Numbers**

### **Problems:**

1. **No Input Validation**: Fields allow negative numbers but shouldn't
2. **Confusing for Debt**: Negative targets don't show progress correctly
3. **Run Rate Display**: Negative run rates show as "negative dollars per day" which is confusing

### **What Should Be Fixed:**

```javascript
// Add to input fields:
<input
  type="number"
  min="0"  // ← PREVENT negative numbers
  step="0.01"
  ...
/>
```

---

## 🎯 **Best Practices**

### ✅ **DO:**
1. Use positive numbers for all three values
2. Make sure: Starting < Current < Target (for growth)
3. Set realistic target dates
4. Update Current Value regularly

### ❌ **DON'T:**
1. Use negative numbers (even though system allows it)
2. Set Current Value higher than Target
3. Set Starting Value higher than Target
4. Set dates in the past

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

## 🔧 **Recommended Improvements**

### 1. **Add Input Validation**
```tsx
<input
  type="number"
  min="0"
  placeholder="Starting Value"
  required
/>
```

### 2. **Add Validation Logic**
```typescript
if (targetValue <= startingValue) {
  alert('Target must be greater than Starting Value');
  return;
}

if (currentValue < startingValue || currentValue > targetValue) {
  alert('Current must be between Starting and Target');
  return;
}
```

### 3. **Better Negative Number Handling**
```typescript
// In calculateGoalMetrics:
const currentRunRate = Math.abs(daysElapsed > 0 ? currentProgress / daysElapsed : 0);
const requiredRunRate = Math.abs(daysRemaining > 0 ? remaining / daysRemaining : 0);
```

---

## Summary

**Current State:**
- ✅ Math formulas are correct for positive numbers
- ✅ Math ALSO works for negative starting values (e.g., -$5k to $10k)
- ⚠️ No validation prevents bad inputs
- ❌ Debt reduction tracking is confusing

**Recommendation:**
- Add `min="0"` to all number inputs
- Add validation to ensure: Starting < Current ≤ Target
- Consider adding a "Debt Reduction" goal type that handles the inverse math

