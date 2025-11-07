# Financial Dashboard Guide

## Overview

The Financial Dashboard provides a comprehensive view of your financial data including income, expenses, gross profit, and accounts receivable. You can view data by month, quarter, or year, and import data directly from PDF reports.

## Accessing the Dashboard

1. From the main Pipeline Manager page, click **"Financial Dashboard"** button (purple button in header)
2. Or navigate directly to: `http://localhost:3000/financial`

## Features

### Period Selection

- **Month**: View monthly financial data
- **Quarter**: View quarterly financial data  
- **Year**: View annual financial data

Use the arrow buttons (← →) or date picker to navigate between periods.

### PDF Upload

1. Click **"Upload PDF Report"** button
2. Select your PDF file (or paste text from PDF)
3. Paste text content in the modal
4. Click **"Parse & Import"**
5. Data is automatically extracted and displayed

### What Gets Extracted

#### Income Categories
- Looks for: Revenue, Sales, Income, Service Revenue, Product Sales
- Extracts category names and amounts
- Shows total income and breakdown by category

#### Gross Profit
- Calculated as: Income - Expenses
- Shows gross profit amount and margin percentage

#### Total Expenses
- Looks for: Expense, Cost, Operating categories
- Extracts expense categories and amounts
- Shows total expenses and breakdown

#### Accounts Receivable
- Extracts client names and invoice amounts
- Calculates days outstanding
- Categorizes by aging status:
  - **Current** (0-30 days) - Green
  - **30-60 days** - Yellow
  - **60-90 days** - Orange
  - **90+ days** - Red

## Dashboard Sections

### 1. Summary Cards

Three cards showing:
- **Total Income** (with top 3 categories)
- **Total Expenses** (with top 3 categories)
- **Gross Profit** (with margin %)

### 2. Income by Category Table

Detailed breakdown of all income categories:
- Category name
- Amount
- Percentage of total income

### 3. Expenses by Category Table

Detailed breakdown of all expense categories:
- Category name
- Amount
- Percentage of total expenses

### 4. Accounts Receivable Table

Similar to Active Clients view, showing:
- Client name
- Invoice amount
- Invoice date
- Due date
- Days outstanding
- Status badge (color-coded by aging)

## Data Persistence

- Financial data is saved to browser localStorage
- Each period (month/quarter/year) has separate data
- Data persists across browser sessions
- Key format: `financial_{period}_{date}`

## Example Workflow

### Monthly Financial Review

1. **Upload PDF**: Upload your monthly cash basis report
2. **Select Period**: Choose "Month" and select the month date
3. **Review Data**: 
   - Check income vs expenses
   - Review gross profit margin
   - Review receivables aging
4. **Navigate Periods**: Use arrows to view previous/next months

### Quarterly Review

1. Select "Quarter" period type
2. Choose quarter start date
3. Upload quarterly report
4. Compare across quarters

## Tips for PDF Import

### Best Results

1. **Use text-based PDFs**: Scanned PDFs need OCR first
2. **Copy all text**: Select All (Cmd+A) before copying
3. **Include headers**: Make sure category names are included
4. **Verify amounts**: Check extracted values match PDF

### Common Patterns Recognized

The parser looks for these patterns:
- `Revenue: $50,000`
- `Total Income: $75,000`
- `Expenses: $25,000`
- `Accounts Receivable: $30,000`
- `Client Name: $5,000`
- Date patterns: `MM/DD/YYYY` or `MM-DD-YYYY`

### Manual Entry

If PDF import doesn't work:
1. Upload PDF anyway (for reference)
2. Manually create goals in Goals section
3. Use Financial Dashboard for visualization only

## Navigation

- **Main Dashboard**: Click "Pipeline Manager" in header or go to `/`
- **Financial Dashboard**: Click "Financial Dashboard" or go to `/financial`
- Switch between views easily

## Future Enhancements

- Direct PDF file parsing (no copy/paste)
- Excel/CSV import
- Chart visualizations
- Period-over-period comparisons
- Export financial reports
- Integration with accounting software

