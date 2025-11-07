# PDF Import Guide - Financial Reports to Goals

## Overview

Import financial data from PDF reports (like Monthly Cash Basis reports) directly into your Goals section.

## Quick Start

### Method 1: Paste Text from PDF (Recommended)

1. **Open your PDF** (e.g., "MonthlyReportwithCashBasis.pdf")
2. **Select All** (Cmd+A / Ctrl+A)
3. **Copy** (Cmd+C / Ctrl+C)
4. **In the app**: Click "Import from PDF" button
5. **Paste** the text into the text area
6. **Configure** period type and target date
7. **Click Import** - Goals are created automatically!

### Method 2: Manual CSV Import (Coming Soon)

For structured data extraction from PDFs.

## What Data is Extracted

The system looks for these patterns in your PDF:

### Accounts Receivable
- Looks for: "Accounts Receivable", "AR", "Receivables"
- Example: `Accounts Receivable: $50,000`

### Monthly Recurring Revenue (MRR)
- Looks for: "MRR", "Monthly Recurring Revenue", "Recurring Revenue"
- Example: `MRR: $10,000`

### Aging Receivables
- Looks for: "0-30 days", "31-60 days", "61-90 days", "90+ days"
- Example: `90+ days: $5,000`

## Step-by-Step Instructions

### Step 1: Prepare Your PDF

1. Open your PDF report (e.g., Monthly Cash Basis Report)
2. Make sure it contains financial data (AR, MRR, etc.)
3. Have the text ready to copy

### Step 2: Open Import Dialog

1. In the Pipeline Manager app
2. Click the **"Import from PDF"** button (next to "Add Goal")
3. Import dialog opens

### Step 3: Extract Text from PDF

**Option A: Copy Text from PDF**
1. Open PDF in Preview (Mac) or Adobe Reader
2. Select All (Cmd+A)
3. Copy (Cmd+C)
4. Paste into the text area

**Option B: Use PDF Text Extraction Tool**
- Online tools: SmallPDF, ILovePDF
- Command line: `pdftotext` (if installed)

### Step 4: Configure Goals

1. **Period Type**: Select Monthly, Quarterly, or Annual
2. **Target Date**: Set the deadline for these goals
3. **Review**: Check the extracted data preview

### Step 5: Import

1. Click **"Import Goals"**
2. Goals are automatically created with:
   - Starting Value = Extracted value
   - Current Value = Extracted value (update manually)
   - Target Value = 10% growth (customizable)
   - Target Date = Your selected date

## Example: Monthly Cash Basis Report

### PDF Content (example):
```
Monthly Cash Basis Report
Date: January 31, 2025

Accounts Receivable: $75,000
MRR: $12,500

Aging Receivables:
  0-30 days: $45,000
  31-60 days: $20,000
  61-90 days: $7,000
  90+ days: $3,000
```

### After Import - Goals Created:

**Goal 1: Monthly Accounts Receivable**
```
Name: "Monthly Accounts Receivable"
Category: Cash Flow
Starting Value: $75,000
Current Value: $75,000
Target Value: $82,500 (10% growth)
Target Date: [Your selected date]
```

**Goal 2: Monthly MRR**
```
Name: "Monthly MRR"
Category: MRR
Starting Value: $12,500
Current Value: $12,500
Target Value: $13,750 (10% growth)
Target Date: [Your selected date]
```

**Goal 3: Reduce 90+ Day Aging**
```
Name: "Reduce 90+ Day Aging Receivables"
Category: Custom
Starting Value: $3,000
Current Value: $3,000
Target Value: $1,500 (50% reduction)
Target Date: [Your selected date]
```

## Troubleshooting

### "No data found" error

**Problem**: PDF text doesn't match expected patterns

**Solutions**:
1. Check PDF text contains financial terms
2. Try manual entry instead
3. Verify PDF is not scanned/image-only (use OCR first)

### Wrong values extracted

**Problem**: System extracted incorrect numbers

**Solutions**:
1. Manually edit the goal after import
2. Check PDF formatting matches expected patterns
3. Use manual entry for accurate values

### PDF is image/scanned

**Problem**: Can't copy text from PDF

**Solutions**:
1. Use OCR tool: Adobe Acrobat, Google Drive, or online OCR
2. Convert scanned PDF to text first
3. Use manual entry as fallback

## Manual Entry Alternative

If PDF import doesn't work:

1. Click **"Add Goal"** manually
2. Enter values from PDF:
   - Starting Value: From PDF
   - Current Value: From PDF (update later)
   - Target Value: Your goal
   - Target Date: Deadline

## Customizing Target Values

After import, edit goals to set custom targets:

1. Click **Edit** icon on goal
2. Change **Target Value** to your desired amount
3. Click **Done**

## Best Practices

1. **Use Actual Values**: Start with real data from PDF
2. **Update Regularly**: Update Current Value weekly/monthly
3. **Set Realistic Targets**: Adjust auto-generated 10% growth if needed
4. **Track Multiple Periods**: Create separate goals for monthly/quarterly/annual

## Supported PDF Formats

- ✅ Text-based PDFs (copy/paste works)
- ✅ PDFs with financial data tables
- ⚠️ Scanned PDFs (requires OCR first)
- ❌ Image-only PDFs (use OCR)

## Future Enhancements

- Direct PDF file upload (no copy/paste needed)
- OCR integration for scanned PDFs
- Automatic monthly updates
- Integration with accounting software (QuickBooks, Xero)
- CSV/Excel import support

## Need Help?

If PDF import doesn't work for your specific PDF format:

1. **Manual Entry**: Use "Add Goal" button
2. **CSV Import**: Export PDF data to CSV, then import
3. **Contact Support**: Describe your PDF format for custom parsing

