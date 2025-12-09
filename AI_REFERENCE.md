# 509 Dashboard - Complete Feature Reference

**Version:** 3.27
**Last Updated:** 2025-12-09
**Purpose:** Union grievance tracking and member engagement system for SEIU Local 509

---

## Creator & License

**Creator & Owner:** Wardis N. Vizcaino
**Role:** Steward at SEIU Local 509
**Contact:** wardis@pm.me

**License:** Free for use by non-profit collective bargaining groups and unions. No license required.

---

## 🔴 CRITICAL: Always Reference This Document

**Before making ANY changes to the codebase:**

1. **READ AI_REFERENCE.md first** - This document is the single source of truth for the entire system
2. **Check the Changelog** - Understand recent changes and current version
3. **Review Code Quality section** - Avoid repeating fixed issues
4. **Verify dynamic column usage** - ALL column references MUST use MEMBER_COLS and GRIEVANCE_COLS
5. **Follow established patterns** - Don't introduce inconsistencies

**Why This Matters:**
- Prevents re-introducing bugs that were already fixed
- Ensures consistency across all 22 sheets and 15+ code files
- Maintains 100% dynamic column coverage (critical for system stability)
- Documents all design decisions and architectural choices

**⚠️ DO NOT:**
- Make changes without consulting this document
- Use hardcoded column references (A:A, AB:AB, etc.)
- Add features without updating this documentation
- Skip the verification commands in the Code Quality section

**✅ ALWAYS:**
- Reference MEMBER_COLS and GRIEVANCE_COLS constants
- Update changelog when making significant changes
- Run verification commands after modifications
- Edit individual modules, then run `node build.js` to regenerate ConsolidatedDashboard.gs

---

## 🚀 Quick Reference for AI

### Key Constants (from Constants.gs)

| Constant | Purpose | Columns |
|----------|---------|---------|
| `MEMBER_COLS` | Member Directory column positions | 31 columns (A-AE) |
| `GRIEVANCE_COLS` | Grievance Log column positions | 34 columns (A-AH) |
| `SHEETS.*` | Sheet name constants | 22 sheets |
| `COLORS.*` | Color scheme constants | Brand colors |

### Mandatory Rules Checklist

```
✅ Use getColumnLetter(MEMBER_COLS.X) - NOT hardcoded 'A:A'
✅ Use SHEETS.MEMBER_DIR - NOT hardcoded 'Member Directory'
✅ Use Math.max(getLastRow()+1, 2) - protects row 1 headers
✅ Use GRIEVANCE_COLS.STATUS - NOT hardcoded column numbers
✅ Run verification commands after changes
```

### Common Dynamic Column Patterns

```javascript
// ✅ CORRECT - Dynamic column reference
const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
const formula = `=COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Open")`;

// ❌ WRONG - Hardcoded column
const formula = `=COUNTIF('Grievance Log'!I:I,"Open")`;

// ✅ CORRECT - Safe row writes (protects headers)
const startRow = Math.max(sheet.getLastRow() + 1, 2);

// ✅ CORRECT - Dynamic sheet name
const sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
```

### Verification Commands

```bash
# Check for hardcoded column references (should return 0)
grep "'Member Directory'![A-Z]:[A-Z]" *.gs | wc -l
grep "'Grievance Log'![A-Z]:[A-Z]" *.gs | wc -l

# Count SHEETS.* usage (should be ~960+)
grep -c "SHEETS\." *.gs | awk -F: '{sum+=$2} END {print sum}'

# Check unprotected row writes (should only show protected ones)
grep -n "getLastRow() + 1" *.gs | grep -v "Math.max"

# Build consolidated file
node build.js --production
```

### Key Functions Quick Reference

| Function | File | Purpose |
|----------|------|---------|
| `CREATE_509_DASHBOARD()` | Code.gs | Main setup - creates all sheets |
| `onOpen()` | Code.gs | Menu creation on spreadsheet open |
| `getColumnLetter(n)` | Constants.gs | Convert column number to letter |
| `mapMemberRow(row)` | Constants.gs | Map array to member object |
| `mapGrievanceRow(row)` | Constants.gs | Map array to grievance object |
| `recalcAllGrievancesBatched()` | BatchGrievanceRecalc.gs | Recalculate all grievance timelines |
| `DIAGNOSE_SETUP()` | Code.gs | System health check |

---

## Table of Contents

1. [Quick Reference for AI](#-quick-reference-for-ai)
2. [System Overview](#system-overview)
3. [Column Mapping System](#column-mapping-system) ⭐ CRITICAL
4. [File Architecture](#file-architecture)
5. [Sheet Structure (22 Sheets)](#sheet-structure-22-sheets)
6. [Core Data Sheets](#core-data-sheets)
7. [Dashboard Sheets](#dashboard-sheets)
8. [Analytics Sheets](#analytics-sheets)
9. [Utility Sheets](#utility-sheets)
10. [Security & Compliance](#security--compliance)
11. [Menu System](#menu-system)
12. [Data Validation Rules](#data-validation-rules)
13. [Formula System](#formula-system)
14. [Seed Data Functions](#seed-data-functions)
15. [Color Scheme](#color-scheme)
16. [Known Issues & Limitations](#known-issues--limitations)
17. [Feature Implementation Status](#feature-implementation-status)
18. [Code Quality & Known Issues](#code-quality--known-issues)
19. [Appendix: Changelog](#appendix-changelog)

---

## System Overview

The 509 Dashboard is a comprehensive Google Apps Script-based union management system that tracks:
- **Members:** 20,000+ member records with engagement data
- **Grievances:** 5,000+ grievance cases with deadline tracking
- **Analytics:** Real-time KPIs, trends, and performance metrics
- **Dashboards:** Executive summaries and interactive visualizations

**Key Design Principles:**
- No fake data (CPU, memory, etc.) - all metrics track real union activity
- **⚠️ CRITICAL: ALL column references MUST be dynamic (no hardcoded column letters)**
- Dynamic column references (no hardcoded column letters)
- Consolidated sheets to reduce clutter
- Real-time formula-based calculations
- Comprehensive data validation

**🔴 MANDATORY RULE: Everything Must Be Dynamic**
- **NEVER** use hardcoded column references like `'Member Directory'!A:A` or `'Grievance Log'!AB:AB`
- **ALWAYS** use `MEMBER_COLS` and `GRIEVANCE_COLS` constants with `getColumnLetter()`
- **Example:** Use `${getColumnLetter(MEMBER_COLS.IS_STEWARD)}` instead of `J:J`
- This allows columns to be reordered without breaking formulas
- Verification: `grep "'Member Directory'![A-Z]:[A-Z]" *.gs` should return 0 matches

---

## Column Mapping System

**🔴 CRITICAL: This system is MANDATORY for ALL column references**

### MEMBER_COLS Constant

**Purpose:** Single source of truth for all Member Directory column positions (31 columns)

**Implementation:**

```javascript
const MEMBER_COLS = {
  MEMBER_ID: 1,                    // A
  FIRST_NAME: 2,                   // B
  LAST_NAME: 3,                    // C
  JOB_TITLE: 4,                    // D
  WORK_LOCATION: 5,                // E
  UNIT: 6,                         // F
  OFFICE_DAYS: 7,                  // G
  EMAIL: 8,                        // H
  PHONE: 9,                        // I
  IS_STEWARD: 10,                  // J
  SUPERVISOR: 11,                  // K
  MANAGER: 12,                     // L
  ASSIGNED_STEWARD: 13,            // M
  LAST_VIRTUAL_MTG: 14,            // N
  LAST_INPERSON_MTG: 15,           // O
  LAST_SURVEY: 16,                 // P
  LAST_EMAIL_OPEN: 17,             // Q
  OPEN_RATE: 18,                   // R
  VOLUNTEER_HOURS: 19,             // S
  INTEREST_LOCAL: 20,              // T
  INTEREST_CHAPTER: 21,            // U
  INTEREST_ALLIED: 22,             // V
  TIMESTAMP: 23,                   // W
  PREFERRED_COMM: 24,              // X
  BEST_TIME: 25,                   // Y
  HAS_OPEN_GRIEVANCE: 26,          // Z
  GRIEVANCE_STATUS: 27,            // AA
  NEXT_DEADLINE: 28,               // AB
  RECENT_CONTACT_DATE: 29,         // AC
  CONTACT_STEWARD: 30,             // AD
  CONTACT_NOTES: 31                // AE
};
```

### GRIEVANCE_COLS Constant

**Purpose:** Single source of truth for all Grievance Log column positions (34 columns)

**Why This Exists:**
- Hardcoded column letters (AB:AB, Y:Y, etc.) break if columns are reordered
- Formulas scattered throughout codebase would all need manual updates
- Dynamic system allows updating one constant to fix all formulas

**Implementation (34 columns):**

```javascript
const GRIEVANCE_COLS = {
  // Section 1: Identity (A-D)
  GRIEVANCE_ID: 1,        // A
  MEMBER_ID: 2,           // B
  FIRST_NAME: 3,          // C
  LAST_NAME: 4,           // D
  // Section 2: Case Details (E-H)
  STATUS: 5,              // E
  CURRENT_STEP: 6,        // F
  INCIDENT_DATE: 7,       // G
  FILING_DEADLINE: 8,     // H (auto-calc)
  // Section 3: Timeline (I-W)
  DATE_FILED: 9,          // I
  STEP1_DUE: 10,          // J (auto-calc)
  STEP1_RCVD: 11,         // K
  STEP2_APPEAL_DUE: 12,   // L (auto-calc)
  STEP2_APPEAL_FILED: 13, // M
  STEP2_DUE: 14,          // N (auto-calc)
  STEP2_RCVD: 15,         // O
  STEP3_APPEAL_DUE: 16,   // P (auto-calc)
  STEP3_APPEAL_FILED: 17, // Q
  DATE_CLOSED: 18,        // R
  DAYS_OPEN: 19,          // S (auto-calc)
  NEXT_ACTION_DUE: 20,    // T (auto-calc)
  DAYS_TO_DEADLINE: 21,   // U (auto-calc)
  // Section 4: Case Classification (V-X)
  ARTICLES: 22,           // V
  ISSUE_CATEGORY: 23,     // W
  DESCRIPTION: 24,        // X
  // Section 5: Assignment & Location (Y-AB)
  MEMBER_EMAIL: 25,       // Y
  UNIT: 26,               // Z
  LOCATION: 27,           // AA
  STEWARD: 28,            // AB
  // Section 6: Resolution (AC-AD)
  RESOLUTION: 29,         // AC
  MESSAGE_ALERT: 30,      // AD
  COORDINATOR_MESSAGE: 31,// AE
  ACKNOWLEDGED_BY: 32,    // AF
  ACKNOWLEDGED_DATE: 33,  // AG
  DRIVE_FOLDER_LINK: 34   // AH
};
```

### getColumnLetter() Helper Function

**Purpose:** Convert column number to letter notation

**Implementation:**
```javascript
function getColumnLetter(columnNumber) {
  let letter = '';
  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }
  return letter;
}
```

**Examples:**
- `getColumnLetter(1)` → "A"
- `getColumnLetter(26)` → "Z"
- `getColumnLetter(27)` → "AA"
- `getColumnLetter(28)` → "AB"

### Dynamic Formula Examples

**Example 1: Member Directory (Old vs New)**

**❌ Old (Hardcoded - NEVER DO THIS):**
```javascript
["Active Stewards", "=COUNTIF('Member Directory'!J:J,\"Yes\")"]
```

**✅ New (Dynamic - ALWAYS DO THIS):**
```javascript
const isStewardCol = getColumnLetter(MEMBER_COLS.IS_STEWARD);
["Active Stewards", `=COUNTIF('Member Directory'!${isStewardCol}:${isStewardCol},"Yes")`]
```

**Example 2: Grievance Log (Old vs New)**

**❌ Old (Hardcoded - NEVER DO THIS):**
```javascript
["Win Rate", "=COUNTIFS('Grievance Log'!AB:AB,\"*Won*\")"]
```

**✅ New (Dynamic - ALWAYS DO THIS):**
```javascript
const resolutionCol = getColumnLetter(GRIEVANCE_COLS.RESOLUTION);
["Win Rate", `=COUNTIFS('Grievance Log'!${resolutionCol}:${resolutionCol},"*Won*")`]
```

### Row Mapper Functions

**mapMemberRow(row)** - Maps Member Directory row array to structured object:
```javascript
const members = data.slice(1).map(mapMemberRow);
const stewards = members.filter(m => m.isSteward === 'Yes');
stewards.forEach(s => Logger.log(`${s.fullName}: ${s.email}`));
```

**mapGrievanceRow(row)** - Maps Grievance Log row array to structured object:
```javascript
const grievances = data.slice(1).map(mapGrievanceRow);
const openCases = grievances.filter(g => g.status === 'Open');
```

### Benefits

1. **Future-proof:** Add/remove/reorder ANY columns by updating MEMBER_COLS or GRIEVANCE_COLS
2. **No hunting:** All column positions in two centralized constants
3. **Self-documenting:** Clear mapping of column names to positions (MEMBER_ID vs "A")
4. **Error-proof:** No typos in column letters, compiler catches missing constants
5. **Maintainable:** Change once, fixes everywhere automatically
6. **100% Coverage:** Every single column reference uses this system (verified with grep)

---

## File Architecture

### Project Structure

```
509-dashboard/
├── Constants.gs                 # Configuration constants (SHEETS, COLORS, MEMBER_COLS, GRIEVANCE_COLS)
├── SecurityUtils.gs             # Security roles, admin emails, RBAC functions
├── SecurityService.gs           # Advanced RBAC with detailed permissions
├── Code.gs                      # Main entry point, setup functions
├── [Feature].gs                 # 59 feature modules (alphabetical)
├── TestFramework.gs             # Testing infrastructure
├── Code.test.gs                 # Unit tests
├── Integration.test.gs          # Integration tests
├── build.js                     # Build script (generates consolidated file)
├── ConsolidatedDashboard.gs     # AUTO-GENERATED - DO NOT EDIT
└── AI_REFERENCE.md              # This document
```

### Build System

**Development workflow:**
1. Edit individual module files (Code.gs, Constants.gs, etc.)
2. Run `node build.js --production` to generate ConsolidatedDashboard.gs
3. Deploy ConsolidatedDashboard.gs to Google Apps Script

**Build commands:**
```bash
node build.js                    # Development build (with tests)
node build.js --production       # Production build (no tests)
node build.js --check-duplicates # Verify no duplicate constants
```

**Important:**
- ConsolidatedDashboard.gs is auto-generated - never edit directly
- All 59 modules are concatenated in dependency order
- Duplicate constant declarations will fail the build

### Key Functions by File

**Code.gs:**
- `CREATE_509_DASHBOARD()` - Main setup function
- `DIAGNOSE_SETUP()` - Comprehensive health check function
- All sheet creation functions (createMemberDirectory, createGrievanceLog, etc.)
- `setupDataValidations()` - Apply all validations
- `setupFormulasAndCalculations()` - Set formulas for first 100 rows
- `SEED_20K_MEMBERS()` - Generate member data
- `SEED_5K_GRIEVANCES()` - Generate grievance data
- `onOpen()` - Create menu system

**Constants.gs:**
- `MEMBER_COLS` - Member Directory column constants
- `GRIEVANCE_COLS` - Grievance Log column constants
- `SHEETS` - Sheet name constants
- `COLORS` - Color scheme constants
- `getColumnLetter()` - Column number to letter converter
- `mapMemberRow()`, `mapGrievanceRow()` - Row mapper functions

**BatchGrievanceRecalc.gs:**
- `recalcAllGrievancesBatched()` - Recalculate all grievance timelines
- `calculateGrievanceDeadlines()` - Calculate deadlines for single row

---

## Sheet Structure (22 Sheets)

### Complete Sheet List

| # | Sheet Name | Type | Purpose |
|---|------------|------|---------|
| 1 | Config | Core | Master dropdown lists for validation |
| 2 | Member Directory | Core | All member data (31 columns) |
| 3 | Grievance Log | Core | All grievance cases (34 columns) |
| 4 | Dashboard | Dashboard | Main real-time metrics dashboard |
| 5 | Analytics Data | Hidden | Computed aggregations for dashboards |
| 6 | Member Satisfaction | Core | Survey tracking and satisfaction scores |
| 7 | Feedback & Development | Utility | Bug reports, features, roadmap |
| 8 | 🎯 Interactive (Your Custom View) | Dashboard | User-customizable visualization |
| 9 | 📚 Getting Started | Help | Onboarding guide |
| 10 | ❓ FAQ | Help | Frequently asked questions |
| 11 | ⚙️ User Settings | Utility | Per-user preferences |
| 12 | 👨‍⚖️ Steward Workload | Analytics | Steward capacity and caseload |
| 13 | 📈 Trends & Timeline | Analytics | Monthly trend analysis |
| 14 | 🗺️ Location Analytics | Analytics | Geographic breakdown |
| 15 | 📊 Type Analysis | Analytics | Issue category analysis |
| 16 | 💼 Executive Dashboard | Dashboard | Executive Summary + Quick Stats |
| 17 | 📊 KPI Performance Dashboard | Dashboard | Performance Metrics + KPI Board |
| 18 | 👥 Member Engagement | Analytics | Engagement scoring and tracking |
| 19 | 💰 Cost Impact | Analytics | Financial impact analysis |
| 20 | 📦 Archive | Utility | Archived records |
| 21 | 🔧 Diagnostics | Utility | System health checks |
| 22 | 📋 Audit_Log | Security | Complete audit trail of all data changes |

---

## Core Data Sheets

### 1. Config Sheet

**Purpose:** Master source for all dropdown validations

**Columns (13 total):**
```
A: Job Titles (EMPTY - user populates)
B: Office Locations (EMPTY - user populates)
C: Units (EMPTY - user populates)
D: Office Days (Monday-Sunday)
E: Yes/No (generic Y/N validation)
F: Supervisors (EMPTY - user populates)
G: Managers (EMPTY - user populates)
H: Stewards (EMPTY - user populates)
I: Grievance Status (Open, Pending Info, Settled, Withdrawn, etc.)
J: Grievance Step (Informal, Step I, Step II, Step III, Mediation, Arbitration)
K: Issue Category (Discipline, Workload, Scheduling, Pay, etc.)
L: Articles Violated (Art. 1 - Recognition, Art. 23 - Grievance Procedure, etc.)
M: Communication Methods (Email, Phone, Text, In Person)
O: Grievance Coordinators (EMPTY - user populates)
AF: Home Towns (EMPTY - user populates)
```

**NOTE:** Job Titles, Office Locations, Units, Supervisors, Managers, Stewards, Grievance Coordinators, and Home Towns are intentionally left empty during CREATE_509_DASHBOARD. Users should populate these columns with their organization's specific data.

---

### 2. Member Directory

**Purpose:** Complete member database with engagement tracking

**Columns (31 total) - FROM Constants.gs MEMBER_COLS:**
```
Section 1: Identity & Core Info (A-D)
A (1):  Member ID (M000001, M000002, etc.)
B (2):  First Name
C (3):  Last Name
D (4):  Job Title (DROPDOWN from Config col A)

Section 2: Location & Work (E-G)
E (5):  Work Location (Site) (DROPDOWN from Config col B)
F (6):  Unit (DROPDOWN from Config col C)
G (7):  Office Days (DROPDOWN from Config col D)

Section 3: Contact Information (H-K)
H (8):  Email Address
I (9):  Phone Number
J (10): Preferred Communication (MULTI-SELECT from Config col N)
K (11): Best Time to Contact (MULTI-SELECT from Config col AE)

Section 4: Organizational Structure (L-P)
L (12): Supervisor (Name) (DROPDOWN from Config col F)
M (13): Manager (Name) (DROPDOWN from Config col G)
N (14): Is Steward (Y/N) (DROPDOWN from Config col E)
O (15): Committees (MULTI-SELECT from Config col I) - for stewards
P (16): Assigned Steward (Name) (DROPDOWN from Config col H)

Section 5: Engagement Metrics (Q-T) - Hidden by default
Q (17): Last Virtual Mtg (Date)
R (18): Last In-Person Mtg (Date)
S (19): Open Rate (%)
T (20): Volunteer Hours (YTD)

Section 6: Member Interests (U-X) - Hidden by default
U (21): Interest: Local Actions (Y/N)
V (22): Interest: Chapter Actions (Y/N)
W (23): Interest: Allied Chapter Actions (Y/N)
X (24): Home Town

Section 7: Steward Contact Tracking (Y-AA)
Y (25): Most Recent Steward Contact Date
Z (26): Steward Who Contacted Member (DROPDOWN from Config col H - Stewards)
AA (27): Notes from Steward Contact

Section 8: Grievance Management (AB-AE)
AB (28): Has Open Grievance? (Formula)
AC (29): Grievance Status Snapshot (Formula)
AD (30): Next Grievance Deadline (Formula)
AE (31): Start Grievance (CHECKBOX ONLY - triggers grievance creation)
```

**CRITICAL: Column AE must be checkboxes ONLY. No text, no names.**
**CRITICAL: Columns AF, AG should NOT exist. Max is 31 columns (AE).**

---

### 3. Grievance Log

**Purpose:** Complete grievance case tracking with automatic deadline calculations

**Columns (34 total) - See GRIEVANCE_COLS constant in Constants.gs**

**Key Features:**
- Automatic deadline calculations via BatchGrievanceRecalc.gs
- Status-based color coding with conditional formatting
- Auto-sort by status priority when edited
- Multi-select dropdowns for Articles Violated and Issue Category

---

## Dashboard Sheets

### 4. Main Dashboard

**Purpose:** Real-time overview of all union metrics

**Layout:**
- Title Section: "📊 LOCAL 509 DASHBOARD"
- Member Metrics (4 cards): Total Members, Active Stewards, Avg Open Rate, YTD Vol. Hours
- Grievance Metrics (4 cards): Open Grievances, Pending Info, Settled (This Month), Avg Days Open
- Engagement Metrics (4 cards): Virtual Mtgs, In-Person Mtgs, Local Interest, Chapter Interest
- Upcoming Deadlines table

### 16. 💼 Executive Dashboard

**Purpose:** Consolidated executive summary (merged Executive Summary + Quick Stats)

**Sections:**
- Quick Stats (6 metrics with comparisons)
- Detailed KPIs (8 metrics with status indicators)

### 17. 📊 KPI Performance Dashboard

**Purpose:** Comprehensive KPI tracking (merged Performance Metrics + KPI Board)

**Columns:** KPI Name, Current Value, Target, Variance, % Change, Status, Last Month, YTD Average, Best, Worst, Owner, Last Updated

---

## Analytics Sheets

### Steward Workload
Track steward capacity and caseload with columns for Total Cases, Active Cases, Resolved, Win Rate, Avg Days, Overdue, Due This Week, Capacity Status.

### Trends & Timeline
Monthly trend analysis with New Grievances, Resolved, Win Rate, Avg Resolution Days, Active at Month End, etc.

### Location Analytics
Geographic breakdown with Members, Grievances, Win Rate, Satisfaction by location.

### Type Analysis
Issue category analysis with case counts, win rates, trends by grievance type.

---

## Utility Sheets

### Member Satisfaction
Survey tracking with Overall Satisfaction, Steward Support, Communication ratings (1-5 scale).

### Feedback & Development
Consolidated bug tracking, feature requests, and development roadmap.

### Archive
Store archived/deleted records with Item Type, Item ID, Archive Date, Reason.

### Diagnostics
System health monitoring and error logging.

### Audit_Log
Complete audit trail of all data modifications for compliance and security.

---

## Security & Compliance

### Role-Based Access Control (RBAC)

**Roles (Hierarchical):**
1. **ADMIN** - Full access to all features including role management
2. **STEWARD** - Can create and edit members and grievances
3. **VIEWER** - Read-only access

**Key Functions:**
- `checkUserPermission(role)` - Returns true if user has specified role or higher
- `getUserRole()` - Returns user's current role
- `initializeRBAC()` - Sets up RBAC script properties

---

## Menu System

### Main Menus (6 total)

| Menu | Purpose |
|------|---------|
| 👤 Dashboard | Daily operations, search, grievance tools, communications |
| 📊 Sheet Manager | Data, performance, integrity, automations, analytics |
| 🔧 Setup | Dropdown configuration, dashboard setup |
| 🎭 Demo | Seed demo data, data management (nuke/clear) |
| ⚙️ Administrator | System health, workflow, column toggles, RBAC |
| 🧪 Tests | All testing functions (Unit, Validation, Integration, Performance) |

---

## Data Validation Rules

### Member Directory Validations

Applied via `setupDataValidations()`:
- Job Title, Work Location, Unit → Config dropdowns
- Is Steward, Interests → Yes/No
- Supervisor, Manager, Assigned Steward → Config dropdowns

### Grievance Log Validations

- Status, Current Step → Config dropdowns
- Articles Violated, Issue Category → Multi-select from Config
- Unit, Work Location, Assigned Steward → Config dropdowns

---

## Formula System

### Grievance Log - Code-Calculated Values (No Sheet Formulas)

**IMPORTANT (v2.3):** The Grievance Log has NO formulas in the sheet body. All calculated columns are computed by `recalcAllGrievancesBatched()` in BatchGrievanceRecalc.gs and written as static values.

**Calculated Columns:**

| Column | Name | Calculation |
|--------|------|-------------|
| H (8)  | Filing Deadline | INCIDENT_DATE + 21 days |
| J (10) | Step I Decision Due | DATE_FILED + 30 days |
| L (12) | Step II Appeal Due | STEP1_DECISION_RCVD + 10 days |
| N (14) | Step II Decision Due | STEP2_APPEAL_FILED + 30 days |
| P (16) | Step III Appeal Due | STEP2_DECISION_RCVD + 30 days |
| S (19) | Days Open | DATE_CLOSED - DATE_FILED (or TODAY - DATE_FILED) |
| T (20) | Next Action Due | Based on Current Step |
| U (21) | Days to Deadline | NEXT_ACTION_DUE - TODAY |

**To Recalculate:**
- Menu: Dashboard → Grievance Tools → Refresh Grievance Formulas
- Or run: `recalcAllGrievancesBatched()` from Apps Script

---

## Seed Data Functions

### SEED_20K_MEMBERS()
Generate 20,000 realistic member records in batches of 1,000.

### SEED_5K_GRIEVANCES()
Generate 5,000 realistic grievance records in batches of 500.

### nukeSeedData()
Exit Demo Mode - Remove seed/test data and prepare for production use.

### DIAGNOSE_SETUP()
Comprehensive system health check - validates all 22 sheets and column counts.

---

## Color Scheme

```javascript
const COLORS = {
  PRIMARY_PURPLE: "#7C3AED",    // Main brand purple
  UNION_GREEN: "#059669",       // Union/success green
  SOLIDARITY_RED: "#DC2626",    // Alert/urgent red
  PRIMARY_BLUE: "#7EC8E3",      // Light blue
  ACCENT_ORANGE: "#F97316",     // Warnings/attention
  LIGHT_GRAY: "#F3F4F6",        // Backgrounds
  TEXT_DARK: "#1F2937"          // Primary text
};
```

---

## Known Issues & Limitations

### Current Issues

1. **Toggle Grievance Columns - DISABLED** - Function shows informative alert instead
2. **Member Directory Column Groups** - createMemberDirectory() now deletes and recreates sheet
3. **Win Rate Formula Dependency** - Resolution text must include "Won", "Lost", or "Settled"

### Limitations

- Seed functions can take 2-3 minutes for 20k members + 5k grievances
- Google Sheets has 6-minute execution limit
- Max 10 million cells per spreadsheet

---

## Feature Implementation Status

### ✅ Implemented Features

- Real-Time Notifications (email alerts, daily deadline checks)
- Advanced Analytics (predictive modeling, trend analysis)
- Mobile Optimization (responsive interfaces)
- Calendar/Gmail/Drive Integration
- Automation (auto-assign, batch operations, backups)
- 60 production modules integrated

### 🔄 Remaining Planned Features

- Extend formula rows to 1000+
- Member portal (view own grievances)
- Survey builder and distribution

---

## Code Quality & Known Issues

### Verification Commands

```bash
# Verify no hardcoded sheet column references (should return 0)
grep "'Member Directory'![A-Z]:[A-Z]" *.gs | wc -l
grep "'Grievance Log'![A-Z]:[A-Z]" *.gs | wc -l

# Verify no hardcoded array indices (should return 0)
grep "g\[[0-9]\+\]\|m\[[0-9]\+\]" UnifiedOperationsMonitor.gs | wc -l

# Verify no broken event listeners (should return 0)
grep "addEventListenerfunction" *.gs | wc -l
```

### Recent Fixes Summary

- All duplicate function definitions resolved (21 duplicates)
- All hardcoded column references converted to dynamic
- All SHEETS constant mismatches fixed
- Test framework function lookup fixed
- Row 1 header protection added to all write functions

---

## Appendix: Changelog

### Version 3.27 (2025-12-09) - LATEST

**FIX: Member Directory Formulas - SUMPRODUCT/ARRAYFORMULA Issue**

The "Has Open Grievance", "Grievance Status Snapshot", and "Next Grievance Deadline" formulas in the Member Directory were not working because SUMPRODUCT inside ARRAYFORMULA doesn't produce row-by-row results in Google Sheets.

**Solution:** Replaced ARRAYFORMULA with MAP/LAMBDA for all three formulas.

---

### Version 3.26 (2025-12-09)

**FIX: Test Framework and Integration Tests**

- Updated testMemberData array to have 31 columns (matching MEMBER_COLS)
- Updated grievance test data arrays to have 34 columns (matching GRIEVANCE_COLS)
- Added `populateConfigForTesting()` helper

---

### Version 3.25 (2025-12-09)

**FIX: Duplicate Variable Declaration in createMainDashboard()**

Fixed syntax error: `Identifier 'lastCol' has already been declared`. Renamed second declaration to `usedLastCol`.

---

### Version 3.24 (2025-12-09)

**FIX: Multi-Select Dropdown Behavior Now Works**

Added `onEdit` handler to implement multi-select behavior for Office Days, Preferred Communication, Best Time to Contact, Committees, Articles Violated, Issue Category, Assigned Steward.

---

### Version 3.23 (2025-12-09)

**FEATURE: Grievance Status Bar & Auto-Sort**

- Visual color-coded status bar (columns E-U)
- Auto-sort when Status column is edited
- Sort priority: Open → Appealed → Pending Info → Settled → Withdrawn → Closed

---

### Version 3.22 (2025-12-09)

**FEATURE: Dropdown Improvements**

All dropdowns now allow free-form text entry (`setAllowInvalid = true`).

---

### Version 3.21 (2025-12-09)

**FIX: Comprehensive Row 1 Header Protection**

All instances of `getLastRow() + 1` now use `Math.max(getLastRow() + 1, 2)`.

---

### Version 3.18 (2025-12-09)

**CRITICAL: SHEETS CONSTANT MISMATCHES & DYNAMIC COLUMN FIXES**

- Fixed SHEETS.AUDIT_LOG: "Audit Log" → "Audit_Log"
- Fixed SHEETS.ASSIGNMENT_LOG: "📋 Assignment Log" → "🤖 Auto-Assignment Log"
- Converted 23 files to use SHEETS.* constants
- Fixed hardcoded column counts in test files

---

### Version 3.17 (2025-12-08)

**COMPLETE DYNAMIC COLUMN MIGRATION**

Converted ALL hardcoded column references to use dynamic constants.

---

### Version 3.16 (2025-12-08)

**CODE QUALITY ENHANCEMENTS**

- Added `mapMemberRow()` and `mapGrievanceRow()` row mapper functions
- Added schema validation functions
- Added Schema Health Check to Administrator menu

---

### Version 3.15 (2025-12-08)

**CRITICAL BUG FIXES - UNDEFINED COLUMN CONSTANTS**

Added 11 GRIEVANCE_COLS aliases for backward compatibility, MEMBER_COLS.LOCATION alias, CACHE_CONFIG.ENABLE_LOGGING.

---

### Version 3.14 (2025-12-08)

**TEST FRAMEWORK FIX**

Added TEST_FUNCTION_REGISTRY to map test names to their functions (Apps Script doesn't support `this[functionName]`).

---

### Version 3.13 (2025-12-08)

**DATA VALIDATION FIX**

User-populated columns now use `.setAllowInvalid(true)` to allow blank/custom values.

---

### Version 3.12 (2025-12-08)

**GRIEVANCE LOG COLUMN RENAME & DASHBOARD MERGE**

- Renamed column AC from "Coordinator Notified" to "Message Alert"
- Merged KPI Performance Dashboard and Operations Analytics into Executive Dashboard

---

### Version 3.11 (2025-12-08)

**REMOVED SAMPLE DATA FROM CONFIG TAB**

Job Titles, Office Locations, Units, Supervisors, Managers, Stewards, Grievance Coordinators, Home Towns are now LEFT EMPTY during CREATE_509_DASHBOARD.

---

### Earlier Versions

See git history for complete changelog. Key milestones:
- v3.0: Dropdown & validation improvements
- v2.8-2.9: Large function refactoring
- v2.7: Comprehensive code audit
- v2.4: 3-day hardcoded column audit
- v2.2-2.3: Runtime error fixes

---

**Document Version:** 3.27
**Last Updated:** 2025-12-09
**Maintained By:** Claude (AI Assistant)

---
