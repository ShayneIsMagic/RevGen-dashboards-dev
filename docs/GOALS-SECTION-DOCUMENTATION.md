# Goals Section - Complete Documentation

## Overview

The Goals section allows users to track progress toward specific business objectives with automatic calculations for progress, run rates, and on-track status.

## Goal Fields

### 1. **Goal Name** (`name`)
- **Type**: Text string
- **Purpose**: Descriptive name for the goal (e.g., "Q1 Revenue", "Annual MRR Target")
- **Required**: Yes
- **Example**: "Q1 Revenue Goal"

### 2. **Category** (`category`)
- **Type**: Dropdown selection
- **Options**: 
  - `Revenue` - Total revenue goals
  - `MRR` - Monthly Recurring Revenue
  - `Cash Flow` - Cash flow targets
  - `Custom` - User-defined category
- **Purpose**: Categorizes the goal for organization
- **Required**: Yes
- **Default**: "Revenue"

### 3. **Starting Value** (`startingValue`)
- **Type**: Number
- **Purpose**: The baseline value when the goal was created
- **Calculation Role**: Used as the starting point for all progress calculations
- **Required**: Yes (defaults to 0 if not provided)
- **Example**: If starting revenue was $50,000, enter `50000`

**How it's used:**
- Base for progress calculation: `(current - starting) / (target - starting)`
- Determines total distance to travel: `target - starting`
- Used in run rate calculations

### 4. **Current Value** (`currentValue`)
- **Type**: Number
- **Purpose**: The current/actual value at this moment
- **Calculation Role**: Represents progress made since starting value
- **Required**: Yes (defaults to starting value if not provided)
- **Editable**: Yes - can be updated inline
- **Example**: Current revenue is $75,000, enter `75000`

**How it's used:**
- Progress calculation: `(current - starting) / (target - starting) * 100`
- Remaining calculation: `target - current`
- Current run rate: `(current - starting) / daysElapsed`

### 5. **Target Value** (`targetValue`)
- **Type**: Number
- **Purpose**: The desired end value for this goal
- **Calculation Role**: The endpoint for all calculations
- **Required**: Yes
- **Example**: Target revenue is $100,000, enter `100000`

**How it's used:**
- Total distance: `target - starting`
- Remaining: `target - current`
- Required run rate: `remaining / daysRemaining`

### 6. **Target Date** (`targetDate`)
- **Type**: Date (YYYY-MM-DD format)
- **Purpose**: The deadline for achieving the target value
- **Calculation Role**: Used to calculate days remaining and required run rate
- **Required**: Yes
- **Example**: `2025-12-31` for end of year

**How it's used:**
- Days remaining: `targetDate - today`
- Required run rate: `remaining / daysRemaining`
- On-track status: Compares current run rate vs required run rate

### 7. **Unit** (`unit`)
- **Type**: String
- **Purpose**: Currency or measurement unit (e.g., "$", "€", "clients", "hours")
- **Default**: "$"
- **Display**: Shows before values (e.g., "$50,000")
- **Example**: Use "$" for dollars, "€" for euros, or "clients" for count-based goals

## Calculations Explained

### 1. **Progress Percentage**
```
Progress = ((Current Value - Starting Value) / (Target Value - Starting Value)) × 100
```

**Example:**
- Starting: $0
- Current: $50,000
- Target: $100,000
- Progress = (50,000 - 0) / (100,000 - 0) × 100 = **50.0%**

**Edge Cases:**
- If `target === starting`: Progress = 0.0% (no change needed)
- If `current < starting`: Progress can be negative
- If `current > target`: Progress > 100%

### 2. **Remaining Amount**
```
Remaining = Target Value - Current Value
```

**Example:**
- Target: $100,000
- Current: $50,000
- Remaining = $100,000 - $50,000 = **$50,000**

### 3. **Days Remaining**
```
Days Remaining = Target Date - Today (in days)
```

**Calculation:**
```typescript
const today = new Date();
const targetDate = new Date(goal.targetDate);
const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
```

**Example:**
- Today: November 5, 2025
- Target Date: December 31, 2025
- Days Remaining = **56 days**

**Note:** Can be negative if target date has passed

### 4. **Current Run Rate**
```
Current Run Rate = (Current Value - Starting Value) / Days Elapsed
```

**Calculation:**
```typescript
const daysElapsed = Math.max(1, Math.ceil((today.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
const currentRunRate = daysElapsed > 0 ? (current - starting) / daysElapsed : 0;
```

**Example:**
- Starting: $0 (on Jan 1)
- Current: $50,000 (on June 1)
- Days Elapsed: 151 days
- Current Run Rate = ($50,000 - $0) / 151 = **$331.13/day**

**What it means:** How much progress you're making per day on average

### 5. **Required Run Rate**
```
Required Run Rate = Remaining Amount / Days Remaining
```

**Calculation:**
```typescript
const requiredRunRate = daysRemaining > 0 ? remaining / daysRemaining : 0;
```

**Example:**
- Remaining: $50,000
- Days Remaining: 56 days
- Required Run Rate = $50,000 / 56 = **$892.86/day**

**What it means:** How much progress you need to make per day to hit the target

### 6. **On-Track Status**
```
On Track = Current Run Rate >= Required Run Rate
```

**Calculation:**
```typescript
const onTrack = currentRunRate >= requiredRunRate;
```

**Example:**
- Current Run Rate: $331.13/day
- Required Run Rate: $892.86/day
- On Track: **false** (behind target)

**Display:**
- ✅ **"✓ On Track"** (green) - If current run rate meets or exceeds required
- ⚠️ **"⚠ Behind"** (red) - If current run rate is below required

## Visual Display

### Goal Card Shows:
1. **Header Section:**
   - Goal Name (editable)
   - Category badge

2. **Progress Bar Section:**
   - Visual representation: `FROM {unit}{starting} → CURRENT {unit}{current} → TO {unit}{target}`
   - Target date displayed below

3. **Metrics Grid (4 columns):**
   - **Progress**: Percentage complete
   - **Remaining**: Amount/value left to achieve
   - **Days Left**: Time remaining
   - **Status**: On Track or Behind indicator

4. **Run Rate Section:**
   - Current run rate: `{unit}{rate}/day`
   - Required run rate: `{unit}{rate}/day`
   - Side-by-side comparison

## Use Cases

### Example 1: Revenue Goal
```
Name: "Q1 Revenue Goal"
Category: Revenue
Starting Value: $0
Current Value: $75,000
Target Value: $150,000
Target Date: 2025-03-31
Unit: "$"

Calculations:
- Progress: (75,000 - 0) / (150,000 - 0) = 50%
- Remaining: $150,000 - $75,000 = $75,000
- Days Remaining: ~115 days (from Nov 5 to Mar 31)
- Current Run Rate: $75,000 / ~60 days = $1,250/day
- Required Run Rate: $75,000 / 115 = $652.17/day
- On Track: Yes ($1,250 > $652.17)
```

### Example 2: MRR Goal
```
Name: "Monthly Recurring Revenue"
Category: MRR
Starting Value: $10,000
Current Value: $15,000
Target Value: $25,000
Target Date: 2025-12-31
Unit: "$"

Calculations:
- Progress: (15,000 - 10,000) / (25,000 - 10,000) = 33.3%
- Remaining: $25,000 - $15,000 = $10,000
- Days Remaining: ~421 days
- Current Run Rate: $5,000 / ~60 days = $83.33/day
- Required Run Rate: $10,000 / 421 = $23.75/day
- On Track: Yes ($83.33 > $23.75)
```

### Example 3: Client Count Goal
```
Name: "New Clients This Year"
Category: Custom
Starting Value: 0
Current Value: 12
Target Value: 50
Target Date: 2025-12-31
Unit: "clients"

Calculations:
- Progress: (12 - 0) / (50 - 0) = 24%
- Remaining: 50 - 12 = 38 clients
- Days Remaining: ~421 days
- Current Run Rate: 12 / ~60 days = 0.2 clients/day
- Required Run Rate: 38 / 421 = 0.09 clients/day
- On Track: Yes (0.2 > 0.09)
```

## Data Flow

### Creating a Goal:
1. User fills form (name, category, starting, current, target, date)
2. System validates required fields
3. Goal created with:
   - Unique ID (timestamp)
   - `createdAt` timestamp
   - Default `unit` = "$"
4. Saved to LocalForage
5. Metrics calculated automatically

### Updating a Goal:
1. User clicks edit icon
2. Inline editing mode activated
3. User updates any field (starting, current, target, date)
4. Changes saved immediately to LocalForage
5. Metrics recalculated in real-time

### Calculations Happen:
- **On Display**: Every time goal card is rendered
- **On Update**: Immediately when any value changes
- **Real-time**: No manual refresh needed

## Edge Cases Handled

1. **Null/Undefined Values:**
   - Defaults to 0: `goal.startingValue ?? 0`

2. **Zero Total (target === starting):**
   - Progress shows 0.0% (no division by zero)

3. **Negative Days Remaining:**
   - Allowed (past due goals still tracked)

4. **Zero Days Elapsed:**
   - Uses `Math.max(1, ...)` to prevent division by zero

5. **Current > Target:**
   - Progress can exceed 100%
   - Remaining becomes negative (shows as positive in display)

6. **Current < Starting:**
   - Progress can be negative
   - Run rate becomes negative

## Code Location

- **Type Definitions**: `types/index.ts` - `Goal` and `GoalMetrics` interfaces
- **Calculation Logic**: `lib/utils.ts` - `calculateGoalMetrics()` function
- **UI Component**: `components/PipelineManager.tsx` - Goal form and display
- **Storage**: `lib/storage.ts` - `saveGoals()` and `getGoals()`

## Testing

See test files:
- `__tests__/utils/calculateGoalMetrics.test.ts` - Calculation tests
- `__tests__/components/PipelineManager.test.tsx` - UI tests
- `__tests__/integration/data-flow.test.tsx` - Integration tests

