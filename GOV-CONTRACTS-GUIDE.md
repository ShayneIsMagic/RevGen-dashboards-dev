# Government Contracts Tracker - User Guide

## Overview

The Government Contracts Tracker is a comprehensive feature designed to track and manage government contract opportunities (Federal, State, Local, and Emergency procurement). It follows the same pattern as the existing Leads Dashboard and integrates seamlessly with the Pipeline Manager and Financial Dashboard.

## Accessing the Feature

You can access the Government Contracts Tracker from:
- **Main URL**: `http://localhost:3000/contracts`
- **From Pipeline Manager**: Click the "🏛️ Gov Contracts" button in the header
- **From Financial Dashboard**: Click the "🏛️ Gov Contracts" button in the header

## Key Features

### 1. **Opportunity Tracking**
Track all aspects of government contract opportunities:
- Opportunity Number (e.g., #16)
- Title and Agency/Department
- Opportunity Type (Federal, State, Local, Emergency)
- Priority Level (CRITICAL, HIGH, MEDIUM, LOW)
- Capability Match percentage (0-100%)
- Estimated Contract Value (single or range)
- Important Dates:
  - Due Date
  - Release Date
  - Pre-bid Conference Date
  - Q&A Deadline

### 2. **Status Management**
Track opportunities through different stages:
- **new**: Just discovered
- **registered**: Registered in the portal
- **reviewing**: Reviewing requirements
- **preparing**: Preparing proposal
- **submitted**: Proposal submitted
- **awarded**: Contract awarded
- **declined**: Chose not to pursue
- **lost**: Did not win

### 3. **Smart Alerts**
The dashboard provides automatic alerts for:
- 🚨 **CRITICAL Opportunities**: Opportunities marked as CRITICAL priority
- ⏰ **Due Within 7 Days**: Opportunities with upcoming deadlines
- Visual indicators for overdue opportunities

### 4. **Action Items**
Each opportunity supports action items with:
- Description
- Due dates
- Completion status
- Track pending vs completed tasks

### 5. **Views & Filters**
Filter opportunities by:
- **All**: All opportunities
- **Active**: New, registered, reviewing, preparing
- **Submitted**: Proposals submitted
- **Awarded**: Won contracts
- **Declined/Lost**: Not pursued or lost

### 6. **Visual Indicators**
- Priority badges (color-coded)
- Capability match progress bars
- Days until due date counters
- Overdue warnings (red highlighting)
- Pending action items count

## Fields Reference

### Required Fields
- **Opportunity Number**: Unique identifier (e.g., #16)
- **Title**: Opportunity title
- **Agency**: Department/Agency name

### Important Fields
- **Portal URL**: Link to the procurement portal
- **Solicitation Number**: RFP/RFQ number
- **NAICS Code**: Classification code
- **Technical Requirements**: Key requirements
- **Registration Required**: Yes/No
- **Teaming Required**: Yes/No
- **Notes**: General notes and observations

## Import/Export

### Export Options
1. **Export JSON**: Full data export for backup or sharing
2. **Export Markdown**: Human-readable report format

### Import
- **Import JSON**: Restore from backup or import from another system

## Data Structure

Each contract opportunity includes:
```typescript
{
  opportunityNumber: "#16",
  title: "Illinois Inventory Management District 1",
  agency: "Illinois Department of Central Management Services",
  opportunityType: "Emergency",
  priority: "CRITICAL",
  capabilityMatch: 95,
  estimatedValue: 500000,
  dueDate: "2025-11-15",
  portalUrl: "https://www.bidbuy.illinois.gov/",
  status: "new",
  actionItems: [
    { description: "Visit BidBuy Illinois portal", dueDate: "2025-11-10", completed: false },
    { description: "Download all documents", dueDate: "2025-11-10", completed: false }
  ]
}
```

## Quick Start Example

Based on your BidMatch report, here's how to add the Illinois Inventory Management opportunity:

1. Click **"Add Opportunity"**
2. Fill in:
   - Opportunity Number: `#16`
   - Title: `Illinois Inventory Management District 1`
   - Agency: `Illinois Department of Central Management Services`
   - Type: `Emergency`
   - Priority: `CRITICAL`
   - Capability Match: `95`
   - Estimated Value: `500000`
   - Portal URL: `https://www.bidbuy.illinois.gov/`
3. Click **"Save Opportunity"**
4. Add action items for tracking tasks

## Tips for Success

1. **Use Priority Wisely**: Mark truly urgent opportunities as CRITICAL
2. **Keep Due Dates Updated**: The system will alert you 7 days before deadlines
3. **Track Capability Match**: Focus on opportunities with 70%+ match
4. **Use Action Items**: Break down complex pursuits into trackable tasks
5. **Update Status Regularly**: Keep the pipeline current for accurate reporting
6. **Export Weekly**: Create markdown reports for team reviews

## Integration with Other Dashboards

- **Pipeline Manager**: Track private sector opportunities
- **Financial Dashboard**: Track revenue and cash flow
- **Government Contracts**: Track public sector opportunities

All three dashboards work together to give you complete visibility into your business development pipeline.

## Keyboard Shortcuts & Tips

- Click the 📋 icon to view full details of any opportunity
- Click the + button to add action items quickly
- Use the status dropdown for quick status updates
- Click portal URLs to open procurement sites directly

## Dashboard Statistics

The top of the dashboard shows:
- **Total Opportunities**: All tracked opportunities
- **Active Pursuits**: Currently being pursued
- **Submitted**: Proposals submitted and pending
- **Total Estimated Value**: Combined value of all opportunities

## Next Steps

1. Import your BidMatch opportunities
2. Set up action items for critical deadlines
3. Register required portals (SAM.gov, state portals)
4. Track progress through the status pipeline
5. Export weekly reports for team meetings

---

**Built with**: Next.js 16, TypeScript, LocalForage (client-side storage)
**Data Storage**: Browser-based (no server required)
**Compatible with**: Pipeline Manager, Financial Dashboard

