# BidMatch JSON Import Guide

## ✅ **Feature Complete!**

The Government Contracts dashboard now **automatically detects and imports BidMatch JSON format**!

---

## 🚀 How to Import Your 24 BidMatch Opportunities

### Step 1: Save Your BidMatch JSON
Save your BidMatch JSON data to a file (e.g., `bidmatch-opportunities.json`)

### Step 2: Open Government Contracts Dashboard
```
http://localhost:3000/contracts
```

### Step 3: Click "Import JSON (BidMatch/Dashboard)"
- Purple button in the top right
- Select your BidMatch JSON file

### Step 4: Confirm Import
You'll see:
```
🎯 BidMatch JSON Detected!

Found 24 opportunities to import.

This will ADD these opportunities to your existing data.

Continue?
```

Click **OK** to import all 24 opportunities!

---

## 🎯 **What Gets Mapped Automatically**

### Field Mappings:

| BidMatch Field | Dashboard Field | Conversion |
|----------------|-----------------|------------|
| `opp_number` | `opportunityNumber` | Adds "#" prefix |
| `match: "95% - Description"` | `capabilityMatch` | Extracts percentage (95) |
| `value: "$50K-$500K"` | `estimatedValue / estimatedValueMax` | Converts to numbers (50000 / 500000) |
| `priority: "TIER 1"` | `priority` | Maps to CRITICAL/HIGH/MEDIUM/LOW |
| `type: "State RFP"` | `opportunityType` | Maps to Federal/State/Local/Emergency |
| `status: "TRACKING"` | `status` | Maps to dashboard workflow |
| `actions: [...]` | `actionItems` | Creates action items with checkboxes |
| `due_date` | `dueDate` | Parses dates, handles "URGENT" |

### Priority Mapping:
- **"TIER 1"** / **"URGENT"** / **"EMERGENCY"** → `CRITICAL` 🔴
- **"TIER 2"** → `HIGH` 🟠
- **"TIER 3"** → `MEDIUM` 🟡
- Others → `LOW` ⚪

### Status Mapping:
- **"CRITICAL"** / **"IMMEDIATE ACTION"** → `new`
- **"TRACKING"** → `new`
- **"REGISTRATION NEEDED"** → `new`
- **"EXPLORING"** → `new`

### Value Parsing Examples:
- `"$50K-$500K"` → Min: $50,000, Max: $500,000
- `"$10M-$50M+"` → Min: $10,000,000, Max: $50,000,000
- `"$250K-$2M"` → Min: $250,000, Max: $2,000,000

---

## 📋 **What Happens After Import**

### ✅ All 24 Opportunities Created with:
1. **Opportunity Number** - #15, #16, #19, etc.
2. **Title** - Full opportunity title
3. **Agency** - Department/Organization
4. **Priority** - Color-coded badges
5. **Capability Match** - Percentage with progress bar
6. **Estimated Value** - Dollar amounts with ranges
7. **Action Items** - All action steps with checkboxes
8. **Portal URLs** - Clickable links
9. **Notes** - Includes:
   - Special notes
   - Capability alignment
   - Geographic info
   - Contact information
   - Requirements

### 📊 **Immediate Dashboard View:**
```
Total Opportunities: 24
Active Pursuits: 24
Total Estimated Value: $65M - $150M+
```

### 🚨 **Automatic Alerts:**
- **CRITICAL** alert for #16 (Illinois Emergency)
- **Due Within 7 Days** for urgent opportunities

---

## 🎯 **Your Top Opportunities Auto-Tagged:**

### CRITICAL Priority (4):
- ✅ #15 - Colorado Salesforce (100% match)
- ✅ #16 - Illinois Inventory EMERGENCY (95% match)
- ✅ #19 - Texas Payment Gateway (95% match)
- ✅ #10 - DOT CMMS (90% match)

### HIGH Priority (6):
- #3 - OPTN Healthcare IT ($10M-$50M+)
- #11 - USDA GUS Integration
- #1 - DoD Healthcare EHR ($50M+)
- #12 - DoD HCDS Follow-on
- #23 - Sound Transit Simulation
- #17 - Georgia Access Control

### Action Items Auto-Created:
Each opportunity gets its action list. For example, #16 (Illinois Emergency):
- [ ] CHECK PORTAL TODAY
- [ ] Search 'inventory management' + 'District 1'
- [ ] Verify actual due date
- [ ] Download all emergency documents
- [ ] Assess if deadline is achievable
- [ ] Begin capability statement if viable

---

## 🔄 **Import vs Replace**

### BidMatch Import:
- **ADDS** opportunities to existing data
- Safe to run multiple times
- Duplicates possible (check opp numbers)

### Dashboard Export Import:
- **REPLACES** all data
- Use for backup/restore

---

## 💡 **Pro Tips**

1. **Import Once**: Import your BidMatch JSON once, then manage in dashboard
2. **Check for Duplicates**: If you re-import, check opportunity numbers
3. **Update Action Items**: Mark tasks complete as you progress
4. **Use Filters**: Switch to "Active" view to see actionable opportunities
5. **Export Regularly**: Export dashboard format for backup

---

## 🎉 **You're Ready!**

1. Open `http://localhost:3000/contracts`
2. Click "Import JSON (BidMatch/Dashboard)"
3. Select your BidMatch JSON file
4. Confirm import
5. See all 24 opportunities instantly!

---

## 📖 **Example Import Success Message:**

```
✅ Success!

24 opportunities imported from BidMatch.

Total opportunities: 24

---

Breakdown:
- 4 CRITICAL priority
- 6 HIGH priority  
- 4 MEDIUM priority

Top Actions:
→ Check Illinois emergency opportunity TODAY
→ Register on SAM.gov (7-10 days processing)
→ Register on state portals (same day)
```

---

**Ready to import?** Start the dev server and import your opportunities! 🚀

