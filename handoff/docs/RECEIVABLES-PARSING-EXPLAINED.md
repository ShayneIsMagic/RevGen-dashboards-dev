# Where Receivables Numbers Come From

## Current Implementation

The receivables are parsed from **PDF text** that you paste into the Financial Dashboard. Here's exactly how it works:

## Parsing Logic Location

**File**: `components/FinancialDashboard.tsx`  
**Function**: `parseReceivables()` (lines 223-264)

## How It Works

### Step 1: Find AR Section
```typescript
const arSection = text.match(/accounts?\s+receivable|receivables?|AR/i)?.[0];
```
Looks for text containing:
- "Accounts Receivable"
- "Receivables" 
- "AR"

### Step 2: Scan All Lines
After finding the AR section, it splits the PDF text into lines and scans each line.

### Step 3: Extract from Each Line
For each line, it looks for:

1. **Amount Pattern**: `$?([\d,]+\.?\d*)`
   - Matches: `$5,000` or `5000` or `$1,234.56`
   
2. **Date Pattern**: `(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})`
   - Matches: `01/15/2025` or `1-15-2025` or `01/15/25`

3. **Client Name**: Everything left after removing amount and date
   - Example: Line `"Acme Corp $5,000 01/15/2025"` → Client = `"Acme Corp"`

### Step 4: Create Receivable Entry
If a line has both an amount and date, it creates:
```typescript
{
  client: clientName,           // Extracted from line
  amount: parsedAmount,          // From dollar amount
  invoiceDate: dateMatch,       // From date pattern
  dueDate: invoiceDate,         // Currently same as invoice date
  daysOutstanding: calculated,   // Today - invoiceDate
  status: 'current' | '30-60' | '60-90' | '90+'  // Based on days
}
```

## Current Limitations

### ❌ What It's NOT Doing:
1. **Not reading from your accounting system** - Only from pasted PDF text
2. **Not reading from Goals section** - Separate data
3. **Not reading from Active Clients** - Different data source
4. **Not using structured data** - Just pattern matching on text

### ⚠️ What It's Looking For:
The parser expects PDF text in a format like:
```
Accounts Receivable:
Acme Corp $5,000 01/15/2025
Beta Inc $3,500 02/01/2025
Gamma LLC $10,000 12/15/2024
```

Or:
```
Receivables:
Client Name: $5,000 Date: 01/15/2025
```

## Why You Might Not See Receivables

### 1. PDF Format Doesn't Match
If your PDF has receivables in a table or different format, the parser won't find them.

### 2. No AR Section Found
The text must contain "Accounts Receivable", "Receivables", or "AR" somewhere.

### 3. Lines Don't Have Both Amount + Date
Each receivable line needs:
- A dollar amount
- A date (MM/DD/YYYY or MM-DD-YYYY format)

### 4. Client Name Extraction Fails
If the line format is unusual, the client name might not extract correctly.

## Better Solution Options

### Option 1: Use Active Clients/Pipeline Data
We could pull receivables from your existing pipeline data instead of PDF parsing.

### Option 2: Manual Entry Form
Add a form to manually enter receivables with proper fields.

### Option 3: Improved PDF Parser
Make the parser smarter to handle more PDF formats.

### Option 4: CSV/Excel Import
Import receivables from structured data files.

## Current Data Flow

```
PDF Upload
  ↓
Paste Text
  ↓
parseReceivables() function
  ↓
Scans for "Accounts Receivable" section
  ↓
Finds lines with $ amounts + dates
  ↓
Extracts client names, amounts, dates
  ↓
Calculates days outstanding
  ↓
Displays in table
```

## Where Data is Stored

- **Storage**: Browser localStorage
- **Key**: `financial_{period}_{date}` (e.g., `financial_month_2025-01-01`)
- **Format**: JSON object with `receivables` array

## To See What's Actually Being Parsed

1. Open browser DevTools (F12)
2. Go to Console tab
3. When you paste PDF text, check for any errors
4. The parsed data should be in localStorage

## Next Steps

Would you like me to:
1. **Connect to Active Clients** - Pull receivables from your pipeline data?
2. **Add Manual Entry** - Form to add receivables manually?
3. **Improve PDF Parser** - Make it handle your specific PDF format?
4. **Show Debug Info** - Add console logging to see what's being parsed?

