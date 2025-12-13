# 509 Dashboard - Complete Feature Reference

**Version:** 3.51
**Last Updated:** 2025-12-13
**Purpose:** Union grievance tracking and member engagement system for SEIU Local 509

---

## Creator & License

**Creator & Owner:** Wardis N. Vizcaino
**Role:** Steward at SEIU Local 509
**Contact:** wardis@pm.me

**License:** Free for use by non-profit collective bargaining groups and unions. No license required.

---

## 🤖 AI Behavior Rules

**See:** `.claude/instructions.md` for AI session behavior rules (question-first workflow, communication style, git management).

---

## 🔴 CRITICAL: Always Reference This Document

**Before making ANY changes to the codebase:**

1. **READ AIR.md first** - This document is the single source of truth for the entire system
2. **Check the Changelog** - Understand recent changes and current version
3. **Run `npm run verify`** - Catches column mismatches before they break things
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

## 🛫 AI PREFLIGHT CHECKLIST

**MANDATORY: Run this checklist before ANY code changes**

This checklist exists because previous AI sessions introduced bugs by not verifying assumptions. **Do not skip this.**

### Before Making Changes:

```
□ 1. RUN: node verify-columns.js
     - Must pass before ANY changes to seed functions or column definitions
     - If it fails, fix the issue before proceeding

□ 2. READ Constants.gs (NOT this doc) for current column definitions
     - MEMBER_COLS is in Constants.gs lines 117-161
     - GRIEVANCE_COLS is in Constants.gs lines 170-240
     - This doc may be stale - Constants.gs is the source of truth

□ 3. COUNT array elements if modifying seed functions
     - generateSingleMemberRow() must return exactly 31 elements
     - generateSingleGrievanceRow() must return exactly 34 elements

□ 4. CHECK the changelog for recent changes to the area you're modifying
```

### After Making Changes:

```
□ 5. RUN: node verify-columns.js
     - Must still pass after your changes

□ 6. RUN: node build.js
     - Must complete without errors

□ 7. UPDATE this document if you changed:
     - Column definitions (update the MEMBER_COLS/GRIEVANCE_COLS sections)
     - Seed functions (document what columns they generate)
     - Any structural changes

□ 8. ADD changelog entry for significant changes
```

### Why This Exists:

On 2025-12-09, a critical bug was discovered where:
- `generateSingleMemberRow()` generated 27 columns instead of 31
- `generateSingleGrievanceRow()` generated 28 columns instead of 34
- AIR.md had completely wrong column mappings that didn't match Constants.gs

This caused data to populate in wrong columns. The bug persisted across multiple AI sessions because:
1. AI assistants trusted AIR.md instead of reading Constants.gs directly
2. No automated verification existed to catch the mismatch
3. The issue wasn't documented in Known Issues

**Never trust documentation over code. Always verify.**

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
14. [Hidden Sheet Architecture](#hidden-sheet-architecture-v340) ⭐ NEW
15. [Seed Data Functions](#seed-data-functions)
16. [Color Scheme](#color-scheme)
17. [Known Issues & Limitations](#known-issues--limitations)
18. [Feature Implementation Status](#feature-implementation-status)
19. [Code Quality & Known Issues](#code-quality--known-issues)
20. [Appendix: Changelog](#appendix-changelog)

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
  // 31 columns total - Reorganized for logical grouping
  // Section 1: Identity & Core Info (A-D)
  MEMBER_ID: 1,                    // A
  FIRST_NAME: 2,                   // B
  LAST_NAME: 3,                    // C
  JOB_TITLE: 4,                    // D
  // Section 2: Location & Work (E-G)
  WORK_LOCATION: 5,                // E
  UNIT: 6,                         // F
  OFFICE_DAYS: 7,                  // G
  // Section 3: Contact Information (H-K)
  EMAIL: 8,                        // H
  PHONE: 9,                        // I
  PREFERRED_COMM: 10,              // J - Multi-select: preferred communication methods
  BEST_TIME: 11,                   // K - Multi-select: best times to reach member
  // Section 4: Organizational Structure (L-P)
  SUPERVISOR: 12,                  // L
  MANAGER: 13,                     // M
  IS_STEWARD: 14,                  // N
  COMMITTEES: 15,                  // O - Multi-select: which committees steward is in
  ASSIGNED_STEWARD: 16,            // P
  // Section 5: Engagement Metrics (Q-T) - Hidden by default
  LAST_VIRTUAL_MTG: 17,            // Q
  LAST_INPERSON_MTG: 18,           // R
  OPEN_RATE: 19,                   // S
  VOLUNTEER_HOURS: 20,             // T
  // Section 6: Member Interests (U-X) - Hidden by default
  INTEREST_LOCAL: 21,              // U
  INTEREST_CHAPTER: 22,            // V
  INTEREST_ALLIED: 23,             // W
  HOME_TOWN: 24,                   // X - Connection building
  // Section 7: Steward Contact Tracking (Y-AA)
  RECENT_CONTACT_DATE: 25,         // Y
  CONTACT_STEWARD: 26,             // Z
  CONTACT_NOTES: 27,               // AA
  // Section 8: Grievance Management (AB-AE)
  HAS_OPEN_GRIEVANCE: 28,          // AB - Script-calculated (static value)
  GRIEVANCE_STATUS: 29,            // AC - Script-calculated (static value)
  NEXT_DEADLINE: 30,               // AD - Script-calculated (static value)
  START_GRIEVANCE: 31,             // AE - Checkbox to start grievance

  // ALIAS - For backward compatibility
  LOCATION: 5                      // Alias for WORK_LOCATION
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
  // 34 columns total - A through AH
  // Section 1: Identity (A-D)
  GRIEVANCE_ID: 1,        // A - Grievance ID
  MEMBER_ID: 2,           // B - Member ID
  FIRST_NAME: 3,          // C - First Name
  LAST_NAME: 4,           // D - Last Name
  // Section 2: Status & Assignment (E-F)
  STATUS: 5,              // E - Status
  CURRENT_STEP: 6,        // F - Current Step
  // Section 3: Timeline - Filing (G-I)
  INCIDENT_DATE: 7,       // G - Incident Date
  FILING_DEADLINE: 8,     // H - Filing Deadline (21d) (auto-calc)
  DATE_FILED: 9,          // I - Date Filed (Step I)
  // Section 4: Timeline - Step I (J-K)
  STEP1_DUE: 10,          // J - Step I Decision Due (30d) (auto-calc)
  STEP1_RCVD: 11,         // K - Step I Decision Rcvd
  // Section 5: Timeline - Step II (L-O)
  STEP2_APPEAL_DUE: 12,   // L - Step II Appeal Due (10d) (auto-calc)
  STEP2_APPEAL_FILED: 13, // M - Step II Appeal Filed
  STEP2_DUE: 14,          // N - Step II Decision Due (30d) (auto-calc)
  STEP2_RCVD: 15,         // O - Step II Decision Rcvd
  // Section 6: Timeline - Step III (P-R)
  STEP3_APPEAL_DUE: 16,   // P - Step III Appeal Due (30d) (auto-calc)
  STEP3_APPEAL_FILED: 17, // Q - Step III Appeal Filed
  DATE_CLOSED: 18,        // R - Date Closed
  // Section 7: Calculated Metrics (S-U)
  DAYS_OPEN: 19,          // S - Days Open (auto-calc)
  NEXT_ACTION_DUE: 20,    // T - Next Action Due (auto-calc)
  DAYS_TO_DEADLINE: 21,   // U - Days to Deadline (auto-calc)
  // Section 8: Case Details (V-W)
  ARTICLES: 22,           // V - Articles Violated
  ISSUE_CATEGORY: 23,     // W - Issue Category
  // Section 9: Contact & Location (X-AA)
  MEMBER_EMAIL: 24,       // X - Member Email
  UNIT: 25,               // Y - Unit
  LOCATION: 26,           // Z - Work Location (Site)
  STEWARD: 27,            // AA - Assigned Steward (Name)
  // Section 10: Resolution (AB)
  RESOLUTION: 28,         // AB - Resolution Summary
  // Section 11: Coordinator Notifications (AC-AF)
  MESSAGE_ALERT: 29,      // AC - Message Alert checkbox
  COORDINATOR_MESSAGE: 30,// AD - Coordinator's message text
  ACKNOWLEDGED_BY: 31,    // AE - Steward who acknowledged
  ACKNOWLEDGED_DATE: 32,  // AF - When steward acknowledged
  // Section 12: Drive Integration (AG-AH)
  DRIVE_FOLDER_ID: 33,    // AG - Google Drive folder ID
  DRIVE_FOLDER_URL: 34    // AH - Google Drive folder URL
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
AB (28): Has Open Grievance? (Script-calculated static value)
AC (29): Grievance Status Snapshot (Script-calculated static value)
AD (30): Next Grievance Deadline (Script-calculated static value)
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

**IMPORTANT (v3.31):** The Grievance Log has NO formulas in the sheet body. All calculated columns are computed by `recalcAllGrievancesBatched()` in BatchGrievanceRecalc.gs and written as static values.

**Calculated Columns (auto-calc):**

| Column | Name | Calculation | Shows When |
|--------|------|-------------|------------|
| H (8)  | Filing Deadline | INCIDENT_DATE + 21 days | Incident Date exists |
| J (10) | Step I Decision Due | DATE_FILED + 30 days | Date Filed exists AND at Step I+ |
| L (12) | Step II Appeal Due | STEP1_RCVD + 10 days | Step I Decision Rcvd exists |
| N (14) | Step II Decision Due | STEP2_APPEAL_FILED + 30 days | Step II Appeal Filed exists |
| P (16) | Step III Appeal Due | STEP2_RCVD + 30 days | Step II Decision Rcvd exists |
| S (19) | Days Open | DATE_CLOSED - DATE_FILED (or TODAY - DATE_FILED) | Date Filed exists |
| T (20) | Next Action Due | Based on Current Step (see below) | Not closed/settled/withdrawn/denied |
| U (21) | Days to Deadline | NEXT_ACTION_DUE - TODAY | Next Action Due exists AND not past due |

**Manual Entry Columns (never overwritten):** G, I, K, M, O, Q, R

**Next Action Due Logic (Column T):**
- Informal: Filing Deadline (H)
- Step I: Step I Decision Due (J)
- Step II: Step II Decision Due (N)
- Step III: Step III Appeal Due (P)
- Mediation/Arbitration: Blank (no automatic deadline)
- Closed/Settled/Withdrawn/Denied: Blank

**Days to Deadline Rule (Column U):**
- If deadline is in the future: Shows positive number (days remaining)
- If deadline is TODAY: Shows 0
- If deadline has PASSED: **Blank** (not negative)

**IMPORTANT:** Appeals cannot be filed after the due date. Once a deadline passes:
- **Days to Deadline (U)** shows **blank** (not negative numbers)
- **Next Action Due (T)** KEEPS the date so dashboards can identify overdue grievances
- This allows tracking of overdue cases while avoiding confusing negative numbers

**To Recalculate:**
- Menu: Dashboard → Grievance Tools → Refresh Grievance Formulas
- Or run: `recalcAllGrievancesBatched()` from Apps Script

### Member Directory - Auto-Updating from Hidden Calculation Sheet

**IMPORTANT (v3.40+):** Member Directory columns AB-AD display grievance data that auto-updates when the Grievance Log changes.

**Architecture:**
1. **Hidden Sheet:** `_Grievance_Calc` contains self-healing formulas (hidden from users)
2. **Auto-Sync Trigger:** `onEditSyncGrievanceData` syncs values when Grievance Log is edited
3. **Static Values:** Member Directory columns AB-AD contain static values (no visible formulas)

**Synced Columns (to Member Directory):**

| Column | Name | Data Source | Shows |
|--------|------|-------------|-------|
| AB (28) | Has Open Grievance? | Hidden Sheet Column B | "Yes" if active grievance exists, "No" otherwise |
| AC (29) | Grievance Status Snapshot | Hidden Sheet Column C | Status text from active grievance |
| AD (30) | Next Grievance Deadline | Hidden Sheet Column D | Next deadline date from active grievance |

**Additional Metrics Available (in hidden sheet only, v3.42+):**

| Hidden Col | Name | Description |
|------------|------|-------------|
| E | Total Count | Total grievances filed by member (any status) |
| F | Win Rate (%) | Percentage of grievances Won or Settled |
| G | Last Grievance Date | Most recent Date Filed for the member |

**Active Grievance Statuses:** Open, Pending Info, Appealed, In Arbitration

**Self-Healing:**
- `setupGrievanceCalcSheet()` - Creates/repairs the hidden sheet with formulas
- `installGrievanceSyncTrigger()` - Installs the auto-sync trigger
- `REPAIR_DASHBOARD()` - Calls both functions to restore full functionality

**How Auto-Update Works:**
1. User edits Grievance Log (Status, Member ID, or Next Action Due columns)
2. `onEditSyncGrievanceData` trigger fires
3. Trigger reads calculated values from hidden `_Grievance_Calc` sheet
4. Values are written to Member Directory columns AB-AD

**To Manual Sync:**
- Menu: Dashboard → Grievance Tools → Refresh Member Directory Data
- Or run: `refreshMemberDirectoryFormulas()` from Apps Script
- Or run: `refreshAllFormulas()` to recalculate all cross-population data

### Grievance Log - Auto-Updating from Hidden Member Lookup Sheet

**IMPORTANT (v3.41):** Grievance Log columns C, D, X, Y, Z, AA display member data that auto-updates when Member Directory changes.

**Architecture:**
1. **Hidden Sheet:** `_Member_Lookup` contains self-healing formulas (hidden from users)
2. **Auto-Sync Trigger:** `onEditSyncMemberData` syncs values when Member Directory is edited
3. **Static Values:** Grievance Log member columns contain static values (no visible formulas)

**Auto-Updated Columns:**

| Column | Name | Data Source | Updates When |
|--------|------|-------------|--------------|
| C (3) | First Name | Member Directory Col B | Member name changes |
| D (4) | Last Name | Member Directory Col C | Member name changes |
| X (24) | Member Email | Member Directory Col H | Email changes |
| Y (25) | Unit | Member Directory Col F | Unit assignment changes |
| Z (26) | Work Location | Member Directory Col E | Location changes |
| AA (27) | Assigned Steward | Member Directory Col P | Steward assignment changes |

**Self-Healing:**
- `setupMemberLookupSheet()` - Creates/repairs the hidden sheet with formulas
- `installMemberSyncTrigger()` - Installs the auto-sync trigger
- `REPAIR_DASHBOARD()` - Calls both functions to restore full functionality

**How Auto-Update Works:**
1. User edits Member Directory (Name, Email, Unit, Location, or Steward columns)
2. `onEditSyncMemberData` trigger fires
3. Trigger reads calculated values from hidden `_Member_Lookup` sheet
4. Values are written to ALL grievances for that member

**To Manual Sync:**
- Menu: Dashboard → Grievance Tools → Refresh Grievance Log Member Data
- Or run: `refreshGrievanceLogMemberData()` from Apps Script
- Or run: `refreshAllFormulas()` to recalculate all cross-population data

### Steward Contact Tracking - Auto-Updating from Communications Log (v3.42+)

**IMPORTANT (v3.42):** Member Directory columns Y-AA display steward contact data that auto-updates when the Communications Log changes.

**Architecture:**
1. **Hidden Sheet:** `_Steward_Contact_Calc` contains self-healing formulas (hidden from users)
2. **Auto-Sync Trigger:** `onEditSyncStewardContact` syncs values when Communications Log is edited
3. **Static Values:** Member Directory columns Y-AA contain static values (no visible formulas)

**Auto-Updated Columns:**

| Column | Name | Data Source | Updates When |
|--------|------|-------------|--------------|
| Y (25) | Recent Contact Date | Communications Log Timestamp | New communication logged |
| Z (26) | Contact Steward | Communications Log Sent By | New communication logged |
| AA (27) | Contact Notes | Communications Log Subject | New communication logged |

**How It Works:**
- Joins Communications Log to Member Directory via member email address
- Finds the most recent communication to each member
- Extracts timestamp, sender (steward), and subject line

**Self-Healing:**
- `setupStewardContactCalcSheet()` - Creates/repairs the hidden sheet with formulas
- `installStewardContactSyncTrigger()` - Installs the auto-sync trigger
- `REPAIR_DASHBOARD()` - Calls both functions to restore full functionality

**To Manual Sync:**
- Run: `syncStewardContactToMemberDirectory()` from Apps Script
- Or run: `refreshAllFormulas()` to recalculate all cross-population data

### Engagement Metrics - Full System (v3.43+)

**IMPORTANT (v3.43):** Member Directory columns Q-T are auto-populated from engagement source sheets.

**Architecture:**
1. **Hidden Sheet:** `_Engagement_Calc` contains formulas that reference source sheets
2. **Source Sheets:** `📅 Meeting Attendance` and `🤝 Volunteer Hours`
3. **Static Values:** Member Directory columns Q-T contain static values (no visible formulas)

**Auto-Updated Columns:**

| Column | Name | Source Sheet | Formula |
|--------|------|--------------|---------|
| Q (17) | Last Virtual Meeting | Meeting Attendance | MAXIFS where Type="Virtual" and Attended="Yes" |
| R (18) | Last In-Person Meeting | Meeting Attendance | MAXIFS where Type="In-Person" and Attended="Yes" |
| S (19) | Open Rate (%) | (Not implemented) | Placeholder for email analytics |
| T (20) | Volunteer Hours | Volunteer Hours | SUMIF total hours per member |

**Source Sheet: Meeting Attendance (📅)**
| Column | Name | Description |
|--------|------|-------------|
| A | Meeting Date | Date of the meeting |
| B | Meeting Type | Virtual, In-Person, or Hybrid |
| C | Meeting Name | Title/description of meeting |
| D | Member ID | Links to Member Directory |
| E | Member Name | For reference |
| F | Attended | Yes/No |
| G | Notes | Optional notes |

**Source Sheet: Volunteer Hours (🤝)**
| Column | Name | Description |
|--------|------|-------------|
| A | Date | Date of activity |
| B | Member ID | Links to Member Directory |
| C | Member Name | For reference |
| D | Activity | Type (Phone Banking, Door Knocking, etc.) |
| E | Hours | Number of hours |
| F | Verified By | Who approved |
| G | Notes | Optional notes |

**Auto-Sync Trigger:**
- `onEditSyncEngagementData` - Syncs when Meeting Attendance or Volunteer Hours is edited

**Self-Healing:**
- `setupEngagementCalcSheet()` - Creates/repairs hidden sheet, auto-detects source sheets
- `createMeetingAttendanceSheet()` - Creates Meeting Attendance source sheet
- `createVolunteerHoursSheet()` - Creates Volunteer Hours source sheet
- `setupEngagementTracking()` - Convenience function: creates all sheets + trigger
- `installEngagementSyncTrigger()` - Installs auto-sync trigger
- `REPAIR_DASHBOARD()` - Restores full functionality

**Menu Location:**
Administrator → Setup & Triggers → Setup Engagement Tracking

---

## Hidden Sheet Architecture (v3.40+, Extended v3.46)

The dashboard uses a sophisticated hidden sheet architecture for cross-sheet auto-population. This keeps complex formulas invisible to users while enabling automatic data synchronization.

**v3.46 Updates:** Added Interactive Dashboard live-wire with 6th hidden sheet (`_Interactive_Dashboard_Calc`) containing 20 metric formulas, auto-sync trigger, and self-healing dropdowns.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HIDDEN SHEET ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   SOURCE SHEETS              HIDDEN SHEETS              DESTINATION         │
│   ─────────────              ─────────────              ───────────         │
│                                                                             │
│   Grievance Log    ──────►   _Grievance_Calc   ──────►  Member Directory    │
│   (Status, Member,           (MAP/LAMBDA                (AB-AD: Has Open    │
│    Next Action)               formulas)                  Grievance, Status, │
│                                                          Deadline)          │
│                                                                             │
│   Member Directory ──────►   _Member_Lookup    ──────►  Grievance Log       │
│   (Name, Email,              (VLOOKUP/INDEX             (C-D: Name,         │
│    Unit, Steward)             formulas)                  X-AA: Email, Unit, │
│                                                          Location, Steward) │
│                                                                             │
│   Communications   ──────►   _Steward_Contact  ──────►  Member Directory    │
│   Log                        _Calc                      (Y-AA: Contact      │
│   (Timestamp,                (MAXIFS formulas)          Date, Steward,      │
│    Sender, Subject)                                     Notes)              │
│                                                                             │
│   Meeting Attendance ────►   _Engagement_Calc  ──────►  Member Directory    │
│   Volunteer Hours            (MAXIFS/SUMIF              (Q-T: Last Virtual, │
│                               formulas)                  In-Person, Open    │
│                                                          Rate, Vol Hours)   │
│                                                                             │
│   Grievance Log    ──────►   _Steward_Workload ──────►  Steward Workload    │
│   Member Directory           _Calc (v3.45)              Sheet               │
│   (Steward assignments)      (COUNTIFS/SUMPRODUCT       (All steward        │
│                               formulas)                  metrics)           │
│                                                                             │
│   Member Directory ──────►   _Interactive_     ──────►  Interactive         │
│   Grievance Log              Dashboard_Calc             Dashboard           │
│   (Counts, metrics,          (v3.46)                    (Metric cards,      │
│    statuses)                 (20 metric formulas)        charts)            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The 6 Hidden Calculation Sheets

| Hidden Sheet | Source | Destination | Columns Updated |
|--------------|--------|-------------|-----------------|
| `_Grievance_Calc` | Grievance Log | Member Directory | AB-AD (Has Open, Status, Deadline), AF-AH (Count, Win Rate, Last Date) |
| `_Member_Lookup` | Member Directory | Grievance Log | C (First Name), D (Last Name), X (Email), Y (Unit), Z (Location), AA (Steward) |
| `_Steward_Contact_Calc` | Communications Log | Member Directory | Y (Contact Date), Z (Contact Steward), AA (Contact Notes) |
| `_Engagement_Calc` | Meeting Attendance, Volunteer Hours | Member Directory | Q (Last Virtual), R (Last In-Person), S (Open Rate), T (Vol Hours) |
| `_Steward_Workload_Calc` (v3.45) | Grievance Log, Member Directory | Steward Workload | All 11 steward metric columns |
| `_Interactive_Dashboard_Calc` (v3.46) | Member Directory, Grievance Log | Interactive Dashboard | 20 metrics: Total Members, Active Grievances, Win Rate, etc. |

### The 6 Auto-Sync Triggers

| Trigger Function | Watches | Updates | Debounce |
|-----------------|---------|---------|----------|
| `onEditSyncGrievanceData` | Grievance Log (Status, Member ID, Next Action) | Member Directory AB-AD, AF-AH | 2 seconds |
| `onEditSyncMemberData` | Member Directory (Name, Email, Unit, Location, Steward) | Grievance Log C, D, X-AA | 2 seconds |
| `onEditSyncStewardContact` | Communications Log | Member Directory Y-AA | 2 seconds |
| `onEditSyncEngagementData` | Meeting Attendance, Volunteer Hours | Member Directory Q-T | 2 seconds |
| `onEditSyncStewardWorkload` (v3.45) | Grievance Log (Steward, Status), Member Directory (Is Steward) | Steward Workload sheet | 2 seconds |
| `onEditSyncInteractiveDashboard` (v3.46) | Member Directory, Grievance Log | Interactive Dashboard metric cards | 3 seconds |

### How Auto-Sync Works

1. **User edits** a source sheet (e.g., changes a member's email in Member Directory)
2. **onEdit trigger fires** (e.g., `onEditSyncMemberData`)
3. **Debounce check** prevents excessive syncing (2-second cache)
4. **Hidden sheet recalculates** formulas automatically (Google Sheets native behavior)
5. **Trigger reads** calculated values from hidden sheet
6. **Values written** to destination sheet as static values (no visible formulas)

### Self-Healing Functions

| Function | Purpose |
|----------|---------|
| `setupGrievanceCalcSheet()` | Creates/repairs `_Grievance_Calc` hidden sheet |
| `setupMemberLookupSheet()` | Creates/repairs `_Member_Lookup` hidden sheet |
| `setupStewardContactCalcSheet()` | Creates/repairs `_Steward_Contact_Calc` hidden sheet |
| `setupEngagementCalcSheet()` | Creates/repairs `_Engagement_Calc` hidden sheet |
| `setupStewardWorkloadCalcSheet()` (v3.45) | Creates/repairs `_Steward_Workload_Calc` hidden sheet |
| `setupInteractiveDashboardCalcSheet()` (v3.46) | Creates/repairs `_Interactive_Dashboard_Calc` hidden sheet |
| `wireDashboardDropdownsToConfig()` (v3.46) | Self-healing dropdowns for Interactive Dashboard |
| `REPAIR_DASHBOARD()` | Repairs ALL 6 hidden sheets + installs ALL 6 triggers |
| `VERIFY_HIDDEN_SHEETS()` | Diagnoses all hidden sheets and triggers |

### Source Sheets for Engagement (Optional)

| Sheet | Purpose | Columns |
|-------|---------|---------|
| `📅 Meeting Attendance` | Track member meeting participation | Date, Type (Virtual/In-Person/Hybrid), Name, Member ID, Member Name, Attended, Notes |
| `🤝 Volunteer Hours` | Track member volunteer activities | Date, Member ID, Member Name, Activity, Hours, Verified By, Notes |

### Setup Functions

| Function | Purpose |
|----------|---------|
| `setupEngagementTracking()` | One-click setup: creates Meeting Attendance, Volunteer Hours, _Engagement_Calc, and trigger |
| `createMeetingAttendanceSheet()` | Creates Meeting Attendance source sheet with validations |
| `createVolunteerHoursSheet()` | Creates Volunteer Hours source sheet with validations |
| `setupStewardWorkloadAutoSync()` (v3.45) | One-click setup: creates _Steward_Workload_Calc, Steward Workload sheet, and trigger |
| `setupInteractiveDashboardLiveSync()` (v3.46) | One-click setup: creates _Interactive_Dashboard_Calc, wires dropdowns, installs trigger |

### Menu Access

**Administrator → Setup & Triggers:**
- 🔍 Verify Hidden Sheets
- 📅 Setup Engagement Tracking
- 📅 Create Meeting Attendance Sheet
- 🤝 Create Volunteer Hours Sheet
- 👨‍⚖️ Setup Steward Workload Auto-Sync (v3.45)
- 🎯 Setup Interactive Dashboard Live-Wire (v3.46)

### Troubleshooting Hidden Sheets

| Problem | Solution |
|---------|----------|
| Columns AB-AD not updating | Run `REPAIR_DASHBOARD()` or `setupGrievanceCalcSheet()` + `installGrievanceSyncTrigger()` |
| Grievance Log names/email stale | Run `REPAIR_DASHBOARD()` or `setupMemberLookupSheet()` + `installMemberSyncTrigger()` |
| Contact tracking not working | Run `setupStewardContactCalcSheet()` + `installStewardContactSyncTrigger()` |
| Engagement columns blank | Run `setupEngagementTracking()` to create source sheets + hidden sheet + trigger |
| Interactive Dashboard stale | Run `setupInteractiveDashboardLiveSync()` to create hidden sheet + dropdowns + trigger |
| Everything broken | Run `REPAIR_DASHBOARD()` - the nuclear option |
| Need to diagnose | Run `VERIFY_HIDDEN_SHEETS()` for comprehensive report |

---

## Verification Function

**VERIFY_HIDDEN_SHEETS()** - Diagnoses the hidden sheet architecture

Checks:
- All 6 hidden sheets exist and are hidden
- All 6 auto-sync triggers are installed
- Formulas are present in hidden sheets
- Data is synced to visible sheets
- Source sheets exist (optional sheets show warnings)
- Interactive Dashboard dropdowns are configured

Run this function to diagnose any cross-population issues.

**Menu Location:** Administrator → Setup & Triggers → Verify Hidden Sheets

---

## Seed Data Functions

**⚠️ Column counts enforced by `npm run verify`**

### SEED_20K_MEMBERS()
Generate 20,000 member records. Must output **31 columns** (MEMBER_COLS).
- Cols 28-31: HAS_OPEN_GRIEVANCE, GRIEVANCE_STATUS, NEXT_DEADLINE, START_GRIEVANCE

### SEED_5K_GRIEVANCES()
Generate 5,000 grievance records. Must output **34 columns** (GRIEVANCE_COLS).
- Cols 29-34: MESSAGE_ALERT, COORDINATOR_MESSAGE, ACKNOWLEDGED_BY, ACKNOWLEDGED_DATE, DRIVE_FOLDER_ID, DRIVE_FOLDER_URL

### nukeSeedData()
Exit Demo Mode - Remove seed/test data.

### DIAGNOSE_SETUP()
System health check - validates sheets and column counts.

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

1. **Toggle Grievance Columns - DISABLED** - Shows alert instead
2. **Member Directory Column Groups** - createMemberDirectory() recreates sheet
3. **Win Rate Formula Dependency** - Resolution must include "Won", "Lost", or "Settled"

### ✅ Resolved (v3.29)

- ~~Seed column mismatch~~ - Fixed. Now enforced by `npm run verify`

### Limitations

- Seed: 2-3 min for 20k members + 5k grievances
- Google Sheets: 6-min execution limit, 10M cell max

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

## Appendix: Changelog

### Version 3.51 (2025-12-13) - LATEST

**FEATURE: Complete Seed & Nuke System**

Added `SeedNuke.gs` with comprehensive data seeding and clearing functions. All functions now accessible from the Demo menu.

**New Functions:**

| Function | Menu Location | What It Does |
|----------|--------------|--------------|
| `SEED_SAMPLE_DATA()` | Demo > Seed All Sample Data | Seeds Config + 50 members + 25 grievances |
| `seedConfigData()` | Demo > Seed Data > Seed Config Dropdowns Only | Seeds Job Titles, Locations, Units, etc. |
| `SEED_MEMBERS(count)` | Demo > Seed Data > Seed Members | Seeds N sample members |
| `SEED_GRIEVANCES(count)` | Demo > Seed Data > Seed Grievances | Seeds N sample grievances |
| `SEED_MEMBERS_DIALOG()` | Demo > Seed Data > Seed Members (Custom Count) | Prompts for count |
| `SEED_GRIEVANCES_DIALOG()` | Demo > Seed Data > Seed Grievances (Custom Count) | Prompts for count |
| `NUKE_ALL_DATA()` | Demo > Nuke Data > NUKE ALL DATA | Clears all members, grievances, and Config dropdowns |
| `NUKE_CONFIG_DROPDOWNS()` | Demo > Nuke Data > Clear Config Dropdowns Only | Clears only Config dropdown values |

**Updated Demo Menu Structure:**
```
🎭 Demo
├── 🚀 Seed All Sample Data
├── ────────────────────
├── 🌱 Seed Data
│   ├── ⚙️ Seed Config Dropdowns Only
│   ├── ────────────────────
│   ├── 👥 Seed Members (Custom Count)
│   ├── 📋 Seed Grievances (Custom Count)
│   ├── ────────────────────
│   ├── 👥 Seed 50 Members
│   └── 📋 Seed 25 Grievances
├── ────────────────────
├── 📝 Add Sample Feedback Entries
├── 📋 Populate Pending TODOs
├── ────────────────────
└── 🗑️ Nuke Data
    ├── ☢️ NUKE ALL DATA
    ├── 🧹 Clear Config Dropdowns Only
    ├── ────────────────────
    ├── 🗑️ Clear ALL Sheet Data (Legacy)
    └── ⚠️ Clear Core Data Only
```

**Config Fields Seeded:**
- Job Titles (20 values)
- Office Locations (20 values)
- Units (10 values)
- Supervisors (12 values)
- Managers (8 values)
- Stewards (12 values)
- Home Towns (19 values)

**Files Added:**
- SeedNuke.gs

**Files Changed:**
- ReorganizedMenu.gs: Updated Demo menu with seed/nuke functions

---

### Version 3.50 (2025-12-13)

**AUDIT: Complete Live-Wire Architecture Verification**

Comprehensive audit confirms ALL tabs are properly live-wired with self-healing formulas and auto-sync.

**Hidden Sheet Architecture (6 hidden calc sheets with auto-sync triggers):**

| Hidden Sheet | Target Sheet | What It Syncs | Trigger |
|-------------|--------------|---------------|---------|
| `_Grievance_Calc` | Member Directory | Grievance counts (cols U-W) | `onEditSyncGrievanceData` |
| `_Member_Lookup` | Grievance Log | Member info lookup | `onEditSyncMemberData` |
| `_Steward_Contact_Calc` | Member Directory | Steward contact (cols Y-AA) | `onEditSyncStewardContact` |
| `_Engagement_Calc` | Member Directory | Engagement metrics (cols Q-T) | `onEditSyncEngagementData` |
| `_Steward_Workload_Calc` | Steward Workload | All workload metrics | `onEditSyncStewardWorkload` |
| `_Interactive_Dashboard_Calc` | Interactive Dashboard | 20+ metrics + chart data | `onEditSyncInteractiveDashboard` |

**Direct Formula Sheets (auto-recalculate on source changes):**

| Sheet | Formula Types | Live Status |
|-------|--------------|-------------|
| Main Dashboard | COUNTA, COUNTIF, AVERAGE, SUM | Live |
| Executive Dashboard | COUNTIF, COUNTIFS, UNIQUE, FILTER | Live |
| KPI Performance Dashboard | Direct formulas | Live |
| Operations Analytics | Direct formulas, COUNTIF, QUERY | Live |
| Analytics Data (hidden) | UNIQUE, FILTER, ARRAYFORMULA | Live |

**Intentional Exception:**
- **Member Satisfaction** - Generates SAMPLE survey data for demonstration purposes (by design)

**Architecture Summary:**
- **6 hidden calc sheets** with self-healing formulas (COUNTIF, SUMIF, QUERY, VLOOKUP)
- **6 onEdit triggers** with debouncing (1-3 seconds)
- **All dashboard sheets** use live formulas referencing source data
- **No manual refresh required** - everything auto-updates

**Files Verified:**
- Code.gs: All 6 hidden sheet setup/sync functions
- DashboardFixes.gs: Populate functions use live formulas
- OperationsAnalytics.gs: Uses direct formulas
- InteractiveDashboard.gs: Uses hidden sheet sync

---

### Version 3.49 (2025-12-13)

**FEATURE: Full Dropdown Live-Wire - Charts Auto-Update on Selection Change**

All Interactive Dashboard dropdowns are now fully live-wired. Changing any dropdown automatically rebuilds charts within 1 second.

**Dropdowns Now Live-Wired:**
| Dropdown | Location | Effect |
|----------|----------|--------|
| Metric 1 | A7 | Changes primary chart data source |
| Chart Type 1 | B7 | Changes primary chart type (Donut, Pie, Bar, etc.) |
| Metric 2 | C7 | Changes comparison chart data source |
| Chart Type 2 | D7 | Changes comparison chart type |
| Theme | E7 | Changes all chart colors instantly |
| Show Comparison | G7 | Shows/hides the comparison chart |

**How It Works:**
1. User changes a dropdown value (e.g., Theme: "Union Blue" → "Solidarity Red")
2. `onEditSyncInteractiveDashboard` trigger fires (watches row 7)
3. 1-second debounce prevents rapid rebuilds
4. `syncDashboardCharts()` reads all dropdown values
5. Charts are rebuilt with new settings

**New Functions:**
- `getThemeColors(theme)` - Returns color palette for theme
- `getChartTypeEnum(chartType)` - Converts dropdown value to Charts.ChartType
- `getChartDataForMetric(metric, ...)` - Gets appropriate data range for metric

**Theme Colors:**
- Union Blue: Blues and greens
- Solidarity Red: Reds and crimson
- Success Green: Greens and emerald
- Professional Purple: Purples and violet
- Modern Dark: Grays and slate
- Light & Clean: Sky blues and cyan

**Updated Trigger:**
- `onEditSyncInteractiveDashboard` now watches:
  - Member Directory (data changes - 3s debounce)
  - Grievance Log (data changes - 3s debounce)
  - Interactive Dashboard row 7 (dropdown changes - 1s debounce)

**Files Changed:**
- Code.gs: Updated `onEditSyncInteractiveDashboard()` to watch dropdown changes
- Code.gs: Updated `syncDashboardCharts()` to use dropdown selections
- Code.gs: Added `getThemeColors()`, `getChartTypeEnum()`, `getChartDataForMetric()`

---

### Version 3.48 (2025-12-13)

**FEATURE: Interactive Dashboard Charts Now Live-Wired**

Fixed all chart sections on the Interactive Dashboard that were not populating. Charts now use the hidden sheet architecture with auto-calculated data.

**Problem Solved:**
- Charts were created without data ranges (empty charts)
- "📊 YOUR STORY IN CHARTS" sections were blank
- "🎯 Status Snapshot" and "🗺️ Location Hotspots" were empty
- "💪 Every City, Every Worker" bar chart was blank
- "📋 THE DETAILS THAT MATTER" data table was empty

**Solution - Extended Hidden Sheet Architecture:**

1. **Added Chart Data Formulas to `_Interactive_Dashboard_Calc`:**
   - Row 25-33: Status breakdown (8 status types with COUNTIF formulas)
   - Row 35-50: Location breakdown (QUERY to get top 15 locations)
   - Row 55-65: Top items data (QUERY for upcoming deadlines)

2. **Added Chart Data Sync:**
   - Status data synced to dashboard row 100-110 (hidden area)
   - Location data synced to dashboard row 115-130 (hidden area)
   - Top items data synced to dashboard row 135-150 (hidden area)

3. **New Functions:**
   - `syncDashboardCharts()` - Builds/rebuilds charts using data ranges
   - `syncDashboardDataTable()` - Updates the visible data table

4. **Charts Now Created With Proper Data Ranges:**
   - Status Donut Chart (position: row 48, col 1)
   - Location Pie Chart (position: row 48, col 11)
   - Location Bar Chart (position: row 71, col 1)
   - All charts reference data ranges that auto-update

**What's Now Live-Wired on Interactive Dashboard:**
| Section | Data Source | Auto-Updates |
|---------|-------------|--------------|
| Metric Cards (4) | Hidden sheet rows 2-21 | Yes (3s debounce) |
| Status Donut Chart | Hidden sheet rows 26-33 | Yes (on sync) |
| Location Pie Chart | Hidden sheet rows 36-50 | Yes (on sync) |
| Location Bar Chart | Hidden sheet rows 36-50 | Yes (on sync) |
| Data Table | Hidden sheet rows 56-65 | Yes (on sync) |

**Files Changed:**
- Code.gs: Extended `setupInteractiveDashboardCalcSheet()` with chart data formulas
- Code.gs: Extended `syncInteractiveDashboardFromCalc()` with chart sync
- Code.gs: Added `syncDashboardCharts()` and `syncDashboardDataTable()`

---

### Version 3.47 (2025-12-13)

**FEATURE: Reduced Script Dependency - Full Live-Wire Architecture**

Converted remaining script-dependent functions to use the hidden sheet architecture, reducing manual refresh dependency.

**Converted Functions:**

1. **populateStewardWorkload()** - Now uses hidden sheet sync
   - Previously: Calculated all metrics in JavaScript, wrote static values
   - Now: Calls `syncStewardWorkloadCalcToSheet()` to sync from `_Steward_Workload_Calc`
   - Benefit: Steward Workload auto-updates via onEdit trigger

2. **rebuildInteractiveDashboard()** - Now uses hidden sheet sync
   - Previously: Calculated all metrics in JavaScript
   - Now: Calls `syncInteractiveDashboardFromCalc()` for metrics
   - Note: Charts still require script (Google Sheets limitation)
   - Benefit: Metric cards auto-update within 3 seconds

3. **refreshAllFormulas()** - Now syncs all 6 hidden sheets
   - Previously: Only synced 5 hidden sheets
   - Now: Includes Steward Workload and Interactive Dashboard
   - Shows complete sync report for all 6 hidden sheets

**Script Dependency Reduction:**
- Steward Workload: No longer needs manual "Refresh" - auto-updates
- Interactive Dashboard metrics: Auto-update within 3 seconds
- Manual refresh only needed for: Charts, theme changes, initial setup

**Functions Now Using Hidden Sheet Architecture:**
| Function | Hidden Sheet | Auto-Updates |
|----------|--------------|--------------|
| `populateStewardWorkload()` | `_Steward_Workload_Calc` | Yes (2s debounce) |
| `rebuildInteractiveDashboard()` | `_Interactive_Dashboard_Calc` | Yes (3s debounce) |
| `refreshAllFormulas()` | All 6 sheets | Manual trigger |

**Files Changed:**
- Code.gs: Converted `populateStewardWorkload()`, updated `refreshAllFormulas()`
- InteractiveDashboard.gs: Converted `rebuildInteractiveDashboard()`

---

### Version 3.46 (2025-12-13)

**FEATURE: Interactive Dashboard Live-Wire with Hidden Sheet Architecture**

Converted the Interactive Dashboard (Your Custom View) from batch-script refresh to live-wire auto-sync using the hidden sheet architecture.

**Problem Solved:**
- Interactive Dashboard previously required manual refresh (Dashboard → Refresh Dashboard → Load Interactive Dashboard Metrics)
- Metrics were stale until user manually triggered a refresh
- No auto-sync when Member Directory or Grievance Log changed

**Solution - Live-Wire Architecture:**
1. Hidden `_Interactive_Dashboard_Calc` sheet contains 20 metric formulas
2. Formulas auto-calculate when source data changes (Google Sheets native behavior)
3. `onEditSyncInteractiveDashboard` trigger syncs values to visible dashboard
4. Dashboard metric cards auto-update within 3 seconds of source edits
5. Self-healing dropdowns auto-configure with valid options

**New Functions:**
- `setupInteractiveDashboardCalcSheet()` - Creates hidden sheet with 20 metric formulas
- `syncInteractiveDashboardFromCalc()` - Syncs calculated values to visible dashboard
- `onEditSyncInteractiveDashboard()` - onEdit trigger with 3-second debounce
- `installInteractiveDashboardSyncTrigger()` - Installs the auto-sync trigger
- `wireDashboardDropdownsToConfig()` - Self-healing dropdowns for all dashboard controls
- `setupInteractiveDashboardLiveSync()` - One-click setup: hidden sheet + dropdowns + trigger

**20 Metrics in Hidden Sheet:**
- Total Members, Active Members, Total Stewards
- Total Grievances, Active Grievances, Pending Info, Settled This Month
- Won, Lost, Win Rate %
- Avg Days Open, Overdue Count, Due This Week
- Avg Open Rate, Total Volunteer Hours
- Last Virtual Mtg (most recent), Last In-Person Mtg (most recent)
- Local Interest Count, Chapter Interest Count
- Total Contacts This Month

**Updated VERIFY_HIDDEN_SHEETS:**
- Now checks for 6 hidden sheets (was 5)
- Now verifies 6 triggers (was 5)
- Includes Interactive Dashboard in comprehensive report

**Updated REPAIR_DASHBOARD:**
- Step 4 now includes Interactive Dashboard setup
- Calls setupInteractiveDashboardCalcSheet(), wireDashboardDropdownsToConfig(), installInteractiveDashboardSyncTrigger()

**Files Changed:**
- Constants.gs: Added SHEETS.INTERACTIVE_DASHBOARD_CALC
- Code.gs: Added 6 new functions for Interactive Dashboard live-wire
- Code.gs: Updated VERIFY_HIDDEN_SHEETS and REPAIR_DASHBOARD
- ReorganizedMenu.gs: Added menu item "🎯 Setup Interactive Dashboard Live-Wire"
- AIR.md: Updated hidden sheet architecture section (5 → 6 sheets/triggers)

---

### Version 3.45 (2025-12-13)

**FEATURE: Extended Hidden Sheet Architecture**

Added 3 new Member Directory columns (AF-AH) and Steward Workload auto-sync.

**Member Directory Extended Columns (AF-AH):**
- AF: Total Grievance Count - auto-populated from _Grievance_Calc
- AG: Win Rate (%) - auto-populated from _Grievance_Calc
- AH: Last Grievance Date - auto-populated from _Grievance_Calc

**Steward Workload Auto-Sync:**
- New hidden sheet: `_Steward_Workload_Calc` with 10 metric columns
- Auto-calculates: Total Cases, Active Cases, Resolved, Won, Win Rate %, Overdue, Due This Week
- New trigger: `onEditSyncStewardWorkload` with 2-second debounce
- Menu item: Administrator → Setup & Triggers → Setup Steward Workload Auto-Sync

**Files Changed:**
- Constants.gs: Added MEMBER_COLS for AF-AH, SHEETS.STEWARD_WORKLOAD_CALC
- Code.gs: Extended syncGrievanceCalcToMemberDirectory(), added steward workload functions
- ConsolidatedDashboard.gs: Updated createMemberDirectory headers
- ReorganizedMenu.gs: Added menu item for steward workload auto-sync
- AIR.md: Updated hidden sheet architecture section (4 → 5 sheets/triggers)

---

### Version 3.44 (2025-12-13)

**DOCUMENTATION: Hidden Sheet Architecture FAQ & Reference**

Added comprehensive documentation for the hidden sheet architecture to FAQ and AIR.md.

---

### Version 3.41 (2025-12-13)

**FEATURE: Auto-Updating Member Data in Grievance Log (Hidden Sheet + Trigger)**

Implemented auto-updating member data for Grievance Log columns C, D, X, Y, Z, AA using a hidden lookup sheet with self-healing formulas and an onEdit trigger.

**Problem Solved:**
When a member's info changes (email, unit, steward, name), their grievance records were stale. Now they auto-update.

**Architecture:**
1. Hidden `_Member_Lookup` sheet contains VLOOKUP/INDEX-MATCH formulas
2. Formulas auto-calculate when Member Directory data changes
3. `onEditSyncMemberData` trigger syncs values to Grievance Log
4. Grievance Log shows static values (no visible formulas)

**New Functions:**
- `setupMemberLookupSheet()` - Creates/repairs hidden sheet with formulas (self-healing)
- `syncMemberLookupToGrievanceLog()` - Syncs calculated values to Grievance Log
- `refreshGrievanceLogMemberData()` - Full refresh function
- `onEditSyncMemberData()` - onEdit trigger for auto-sync
- `installMemberSyncTrigger()` - Installs the auto-sync trigger
- `removeMemberSyncTrigger()` - Removes the trigger

**Auto-Updated Columns:**
- C (3): First Name
- D (4): Last Name
- X (24): Member Email
- Y (25): Unit
- Z (26): Work Location
- AA (27): Assigned Steward

**Self-Healing:**
- `REPAIR_DASHBOARD()` now installs both sync triggers
- Hidden sheets are recreated if missing
- Formulas are re-applied if corrupted

**Files Changed:**
- Constants.gs: Added `SHEETS.MEMBER_LOOKUP` constant
- Code.gs: Added 6 new functions for hidden sheet + trigger
- Code.gs: Updated `REPAIR_DASHBOARD` to install member sync trigger
- Code.gs: Updated `refreshAllFormulas()` to include member data sync
- AIR.md: Updated documentation

---

### Version 3.40 (2025-12-12)

**FEATURE: Auto-Updating Grievance Data in Member Directory (Hidden Sheet + Trigger)**

Implemented auto-updating grievance data for Member Directory columns AB-AD using a hidden calculation sheet with self-healing formulas and an onEdit trigger.

**Architecture:**
1. Hidden `_Grievance_Calc` sheet contains MAP/LAMBDA formulas
2. Formulas auto-calculate when Grievance Log data changes
3. `onEditSyncGrievanceData` trigger syncs values to Member Directory
4. Member Directory shows static values (no visible formulas)

**New Functions:**
- `setupGrievanceCalcSheet()` - Creates/repairs hidden sheet with formulas (self-healing)
- `syncGrievanceCalcToMemberDirectory()` - Syncs calculated values to Member Directory
- `onEditSyncGrievanceData()` - onEdit trigger for auto-sync
- `installGrievanceSyncTrigger()` - Installs the auto-sync trigger
- `removeGrievanceSyncTrigger()` - Removes the trigger

**Self-Healing:**
- `REPAIR_DASHBOARD()` now installs the sync trigger
- Hidden sheet is recreated if missing
- Formulas are re-applied if corrupted

**Why This Architecture:**
- Formulas are in a HIDDEN sheet (not visible to users)
- Auto-updates when Grievance Log is edited
- Self-healing - REPAIR_DASHBOARD restores everything
- No formulas in visible sheets

**Files Changed:**
- Constants.gs: Added `SHEETS.GRIEVANCE_CALC` constant
- Code.gs: Added 5 new functions for hidden sheet + trigger
- Code.gs: Updated `REPAIR_DASHBOARD` to install sync trigger
- AIR.md: Updated documentation

---

### Version 3.33 (2025-12-12)

**FIX: Missing Chart Builders & Dashboard Metrics**

Fixed critical issues with charts not populating and metrics showing nothing.

**Charts Fixed:**
- Added `buildInteractiveDashboardCharts()` - Location & Status charts
- Added `buildTrendsCharts()` - Monthly trend line chart
- Added `buildLocationCharts()` - Location pie chart
- Added `buildTypeAnalysisCharts()` - Issue category bar chart
- All chart builders now work with Operations Analytics (fallback to deprecated sheets)

**Dashboard Metrics Fixed:**
- Fixed "Needs Attention" metric to use Next Action Due date comparison
- Updated overdue detection to work with new Days to Deadline logic

**Deadline Logic Clarified:**
- Days to Deadline (U): Blank when past due (not negative)
- Next Action Due (T): KEEPS the date so dashboards can identify overdue cases
- This allows tracking overdue cases while avoiding confusing negative numbers

**Files Changed:**
- LazyLoadCharts.gs: Added 4 missing chart builder functions + helper functions
- InteractiveDashboard.gs: Fixed overdue metric formula
- BatchGrievanceRecalc.gs: Keep Next Action Due for overdue tracking
- Code.gs: Updated seed function to match
- AIR.md: Updated documentation
### Version 3.39 (2025-12-11) - LATEST

**FIX: DESIGN-001 Mixed column constants/raw numeric indexes**

Code review identified raw numeric indexes in searchGrievances() function that should use GRIEVANCE_COLS constants for maintainability.

**Changes:**
- Replaced `row[0]`, `row[2]`, `row[3]`, `row[4]` with proper GRIEVANCE_COLS constants
- Updated switch statement for searchCol to use constants
- Now uses: `GRIEVANCE_COLS.GRIEVANCE_ID`, `GRIEVANCE_COLS.FIRST_NAME`, `GRIEVANCE_COLS.LAST_NAME`, `GRIEVANCE_COLS.STATUS`

**Files Changed:**
- UIFeatures.gs:363-408: Fixed searchGrievances() to use GRIEVANCE_COLS constants
- ConsolidatedDashboard.gs:49079-49125: Same fix in consolidated build

**Other Code Review Items Investigated:**
- MD-001/MD-002 (Contact sidebar, Engagement report): Functions not found in codebase
- DB-001 (Duplicate calculateAllMetrics): Two functions exist but serve different purposes (InteractiveDashboard vs OptimizedDashboard)
- TP-001/TP-003 (Diagnostics performance): runDiagnosticsBatch function not found
- CFG-001 (Placeholder URLs): Intentional design - NOTE says to update when videos recorded

---

### Version 3.38 (2025-12-11)

**FIX: Tests timeout with 10K+ member datasets**

Tests were timing out when running against sheets with 5,000+ rows.

**Solution:**
- Added `isLargeDataset()` function to detect >5,000 rows
- Tests now auto-detect large datasets and skip slow integration tests
- Fast unit tests and medium tests still run (no sheet reads)
- Shows clear message: "Large Dataset Mode - slow tests skipped"

**Files Changed:**
- TestFramework.gs:356-376: Added TEST_LARGE_DATASET_THRESHOLD and isLargeDataset()
- TestFramework.gs:382-403: Modified runAllTests() to detect large datasets
- TestFramework.gs:489-503: Skip slow tests array when large dataset detected

---

### Version 3.37 (2025-12-10)

**NEW: CREATE_509_DASHBOARD_LITE and PART2**

Split dashboard creation into two functions to avoid Google Apps Script timeout on slow connections.

**Changes:**
- `CREATE_509_DASHBOARD_LITE()` - Creates only essential sheets (Config, Member Directory, Grievance Log, Dashboard)
- `CREATE_509_DASHBOARD_PART2()` - Creates analytics and extra sheets (Interactive Dashboard, Executive Dashboard, etc.)
- Run LITE first, then PART2 for full setup

**FIX: buildDataCache timeout with large datasets**

The `buildDataCache` function was timing out when trying to read 20K+ rows.

**Solution:**
- Check row count before reading entire sheet
- For datasets >5000 rows, use "summary mode" (only reads headers and stores count)
- Dashboard formulas handle detailed calculations instead

**Files Changed:**
- Code.gs:211-301: Added CREATE_509_DASHBOARD_LITE and CREATE_509_DASHBOARD_PART2
- OptimizedDashboardRebuild.gs:71-128: Modified buildDataCache for large dataset handling
- OptimizedDashboardRebuild.gs:135-171: Modified calculateAllMetricsOptimized for large dataset mode

---

### Version 3.36 (2025-12-10)

**NEW: SEED_MEMBERS_10K Function**

Added optimized 10K member seeding function that avoids timeout issues.

**Changes:**
- New `SEED_MEMBERS_10K()` function seeds 10,000 members in 2 batches of 5,000
- Includes `SpreadsheetApp.flush()` and 2-second pause between batches
- Added to menu: 🎭 Demo > 🌱 Seed Demo Data > 👥 Seed Members > ⭐ Seed 10K Members (Recommended)

**Files Changed:**
- Code.gs:4239-4279: Added SEED_MEMBERS_10K function
- ReorganizedMenu.gs:232: Added menu item

---

### Version 3.35 (2025-12-10)

**FIX: CREATE_509_DASHBOARD "starts but nothing happens"**

The script appeared to hang with no visible progress because:
1. Toast notification with `-1` duration (indefinite) was blocking subsequent toasts
2. No `SpreadsheetApp.flush()` calls to force UI updates
3. No detailed logging to identify where script might be stalling

**Solution:** Enhanced CREATE_509_DASHBOARD with comprehensive debugging:
- Added elapsed time logging for each step (visible in View > Logs)
- Changed initial toast from `-1` to `5` seconds duration
- Added `SpreadsheetApp.flush()` after each major step to force UI refresh
- Added stack trace logging on errors
- Each toast now shows for 3 seconds instead of 2

**Files Changed:**
- Code.gs:17-202: Rewrote CREATE_509_DASHBOARD with logging and flush

**How to Debug:**
1. Run CREATE_509_DASHBOARD from menu
2. Watch toast notifications - they should appear sequentially
3. After script completes (or fails), go to View > Logs to see detailed timing
4. Log format: `[X.Xs] Step description` shows elapsed seconds

---

### Version 3.34 (2025-12-10)

**FIX: Menu Disappearing on Page Refresh**

The menus were disappearing on page refresh because `onOpen()` was calling `logUserAccess()` and `validateConfigurationOnOpen()` before creating menus. If these functions failed or timed out, menus wouldn't appear.

**Solution:** Reordered `onOpen()` to create menus FIRST before any other operations.

**Changes:**
- Menu creation now happens immediately when onOpen runs
- Wrapped menu creation in its own try-catch block
- Moved non-critical operations (logging, validation) AFTER menus
- These won't block menu creation if they fail

**Files Changed:**
- Code.gs:2468-2568: Reordered onOpen() function

---

### Version 3.33 (2025-12-10)

**FIX: Operations Analytics Sheet Deletion Bug**

Fixed bug where `deleteStandaloneMergedTabs()` was deleting the Operations Analytics sheet right after it was created, causing `populateOperationsAnalytics()` to fail with "sheet not found".

**Root Cause:** Operations Analytics IS the merged dashboard - it should NOT be deleted. Only KPI Performance Dashboard should be deleted.

**Files Changed:**
- Code.gs:1538-1545: Removed "📊 Operations Analytics" from tabsToDelete array

---

**FIX: Interactive Dashboard Quick Action Dropdown Not Working**

The Quick Action dropdown at cell I7 had no onEdit handler to respond to selections.

**Added:**
- `handleInteractiveDashboardQuickAction()` - Main handler for Quick Action selections
- `resetInteractiveDashboardFilters()` - Resets all dropdowns to defaults
- `showAllInteractiveDashboardData()` - Shows all data with comparison mode
- `exportInteractiveDashboardSummary()` - Exports metrics to new sheet

**Files Changed:**
- DataIntegrityEnhancements.gs:325-337: Added onEdit check for Interactive Dashboard I7
- InteractiveDashboard.gs:1434-1573: Added handler functions

---

**FIX: Steward Workload Showing 0 Stewards**

`populateStewardWorkload()` was finding 0 matches because grievance seed used `config.stewards` from Config sheet (empty by design), while Member Directory had stewards with randomly generated names.

**Solution:** Grievance seed now uses actual steward names from Member Directory.

**Added:**
- `getActualStewardNamesFromMemberDirectory()` - Collects real steward names
- Modified `getGrievanceSeedConfig()` to prefer actual stewards over config

**Files Changed:**
- Code.gs:4613-4701: Added function and modified seed config

---

### Version 3.32 (2025-12-09)

**FIX: Days to Deadline Cannot Show Negative (Past Due)**

Fixed logic in BatchGrievanceRecalc.gs so that past-due deadlines show blank instead of negative numbers.

**Rule Applied:**
- Appeals cannot be filed after the due date has passed
- Once a deadline passes, the window for action is closed
- Days to Deadline shows **blank** for past-due deadlines

**Days to Deadline (Column U) now shows:**
- Positive number: Days remaining until deadline
- 0: Due today
- Blank: Deadline has passed OR no deadline applies

**Files Changed:**
- BatchGrievanceRecalc.gs: Updated calculateGrievanceTimeline() logic
- AIR.md: Documented the past-due deadline rule

---

### Version 3.31 (2025-12-09)

**CRITICAL FIX: Grievance Timeline Calculation Bug**

Fixed critical bug in BatchGrievanceRecalc.gs where calculated columns were overwriting manual entry columns.

**Bug Fixed:**
- `recalcAllGrievancesBatched()` was writing 8 values to consecutive columns starting at H
- This overwrote manual entry columns I (Date Filed), K (Step I Rcvd), M (Step II Appeal Filed), O (Step II Rcvd)
- Fixed to write each calculated column individually: H, J, L, N, P, S, T, U

**Timeline Logic Improvements:**
- Closed/Settled/Withdrawn/Denied grievances now correctly show empty Next Action Due (T) and Days to Deadline (U)
- Days Open (S) still shows for closed grievances (how long it was open)
- Deadlines only populate when prerequisite dates exist (no future step deadlines)
- Step I Decision Due (J) only shows if at Step I or beyond
- Informal step now correctly shows Filing Deadline as next action

**Files Changed:**
- BatchGrievanceRecalc.gs: Fixed column writing, improved deadline logic

---

### Version 3.30 (2025-12-09)

**FEATURE: Grievance Timeline Colors, Resolution Colors & Auto-Sort**

Updated grievance log timeline visual progress bar, added resolution column color coding, and automatic sorting.

**Timeline Color Changes (Code.gs - setupGrievanceProgressBar):**
- Past/completed steps: Green (#D1FAE5)
- Current step (normal): Orange (#FED7AA)
- Current step (Pending Info): Light Blue (#BFDBFE)
- Next step: Red (#FECACA)
- Future steps: Gray (#F3F4F6)
- Closed/Settled/Withdrawn/Denied: Light Brown (#D7CCC8) - full bar

**Resolution Column Colors (Code.gs - setupResolutionColumnColors):**
- Won: Light Purple (#E9D5FF)
- Lost: Light Brown (#D7CCC8)
- Settled: Light Blue (#BFDBFE)
- Withdrawn: Light Yellow (#FEF9C3)
- Denied: Light Red (#FECACA)
- Pending: Light Orange (#FED7AA)

**Auto-Sort Feature (GrievanceFloatToggle.gs):**
- Grievances with status Closed/Settled/Withdrawn automatically move to bottom of list
- Added `onEditGrievanceAutoSort()` - onEdit trigger handler
- Added `installGrievanceAutoSortTrigger()` - installs the trigger
- Added `removeGrievanceAutoSortTrigger()` - removes the trigger
- Trigger auto-installed during CREATE_509_DASHBOARD()

**Files Changed:**
- Code.gs: Updated setupGrievanceProgressBar(), added setupResolutionColumnColors(), added trigger installation to CREATE_509_DASHBOARD()
- GrievanceFloatToggle.gs: Added auto-sort onEdit handler and trigger management functions

---

### Version 3.29 (2025-12-09)

**CRITICAL FIX: Seed Data Column Mismatch**

Fixed seed functions that were generating incomplete row data, causing data to populate in wrong columns.

**Issues Fixed:**
1. `generateSingleMemberRow()` generated 27 columns but Member Directory expects 31
2. `generateSingleGrievanceRow()` generated 28 columns but Grievance Log expects 34
3. AIR.md documentation had outdated column mappings that didn't match Constants.gs

**Changes:**
- Added missing columns 28-31 to member seed: HAS_OPEN_GRIEVANCE, GRIEVANCE_STATUS, NEXT_DEADLINE, START_GRIEVANCE
- Added missing columns 29-34 to grievance seed: MESSAGE_ALERT, COORDINATOR_MESSAGE, ACKNOWLEDGED_BY, ACKNOWLEDGED_DATE, DRIVE_FOLDER_ID, DRIVE_FOLDER_URL
- Updated MEMBER_COLS documentation in AIR.md to match actual Constants.gs structure
- Updated GRIEVANCE_COLS documentation in AIR.md to match actual Constants.gs structure

**Root Cause:** Documentation drift - AIR.md had stale column mappings that no longer matched the reorganized Constants.gs, causing AI assistants to receive incorrect information.

---

## Appendix: Changelog

### Version 3.29 (2025-12-09) - LATEST

**CRITICAL FIX: Data Field Mapping Bugs**

Multiple critical bugs causing seed data to populate wrong columns and formulas to not match expected values.

**Issue 1 - updateMemberDirectorySnapshots() Wrong Columns:**
- Was writing to columns 10-14 (J-N) instead of 25-27 (Y-AA)
- This overwrote PREFERRED_COMM, BEST_TIME, SUPERVISOR, MANAGER with grievance snapshot data
- Fixed to write only contact-related data to RECENT_CONTACT_DATE (Y), CONTACT_STEWARD (Z), CONTACT_NOTES (AA)

**Issue 2 - Member Seed Missing 4 Columns:**
- generateSingleMemberRow() generated 27 columns, schema requires 31
- Added: HAS_OPEN_GRIEVANCE (AB), GRIEVANCE_STATUS (AC), NEXT_DEADLINE (AD), START_GRIEVANCE (AE)

**Issue 3 - Grievance Seed Missing 6 Columns:**
- generateSingleGrievanceRow() generated 28 columns, schema requires 34
- Added: MESSAGE_ALERT (AC), COORDINATOR_MESSAGE (AD), ACKNOWLEDGED_BY (AE), ACKNOWLEDGED_DATE (AF), DRIVE_FOLDER_ID (AG), DRIVE_FOLDER_URL (AH)

**Issue 4 - Config Status/Step Mismatch:**
- Config defaults had statuses not recognized by formulas: "In Progress", "Pending Response", "Resolved - Won/Lost/Settled"
- Formula expects: "Open", "Pending Info", "Appealed", "In Arbitration"
- Fixed Config defaults to match formula expectations

**Issue 5 - Menu Disappearing on Refresh:**
- CREATE_509_DASHBOARD did not call installOnOpenTrigger()
- Fixed to auto-install menu trigger during dashboard creation

**Issue 6 - GRIEVANCE_STATUS Formula Inconsistency:**
- HAS_OPEN_GRIEVANCE correctly showed "Yes" for active cases
- GRIEVANCE_STATUS returned first match (could be closed) instead of active status
- Fixed both GRIEVANCE_STATUS and NEXT_DEADLINE formulas to prioritize active grievances

**Documentation Update:**
- Updated AIR.md MEMBER_COLS and GRIEVANCE_COLS to match actual Constants.gs values

---

### Version 3.28 (2025-12-09)

**FIX: Undefined STEP3_FILED Constant**

Fixed runtime error "The number of columns in the range must be at least 1" in `setupGrievanceProgressBar()`.

**Issue:** Line 2169 in Code.gs used `GRIEVANCE_COLS.STEP3_FILED` which doesn't exist.
**Fix:** Changed to `GRIEVANCE_COLS.STEP3_APPEAL_FILED` (the correct constant name).

**Root Cause:** The undefined constant caused `STEP3_END` to be `undefined`, and when used in range calculations like `CLOSE_COL - STEP3_END + 1`, it produced `NaN`, resulting in an invalid range.

**Codebase Audit Completed:** All GRIEVANCE_COLS (34 columns + 8 aliases), MEMBER_COLS (31 columns + 1 alias), and CONFIG_COLS (43 columns + 1 alias) references verified as valid.

---

### Version 3.27 (2025-12-09)

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

### Version 3.45 (2025-12-13) - LATEST

**FEATURE: Extended Hidden Sheet Architecture**

Added 3 new Member Directory columns (AF-AH) and Steward Workload auto-sync.

**Member Directory Extended Columns (AF-AH):**
- AF: Total Grievance Count - auto-populated from _Grievance_Calc
- AG: Win Rate (%) - auto-populated from _Grievance_Calc
- AH: Last Grievance Date - auto-populated from _Grievance_Calc

**Steward Workload Auto-Sync:**
- New hidden sheet: `_Steward_Workload_Calc` with 10 metric columns
- Auto-calculates: Total Cases, Active Cases, Resolved, Won, Win Rate %, Overdue, Due This Week
- New trigger: `onEditSyncStewardWorkload` with 2-second debounce
- Menu item: Administrator → Setup & Triggers → Setup Steward Workload Auto-Sync

**Files Changed:**
- Constants.gs: Added MEMBER_COLS for AF-AH, SHEETS.STEWARD_WORKLOAD_CALC
- Code.gs: Extended syncGrievanceCalcToMemberDirectory(), added steward workload functions
- ConsolidatedDashboard.gs: Updated createMemberDirectory headers
- ReorganizedMenu.gs: Added menu item for steward workload auto-sync
- AIR.md: Updated hidden sheet architecture section (4 → 5 sheets/triggers)

---

### Version 3.44 (2025-12-13)

**DOCUMENTATION: Hidden Sheet Architecture FAQ & Reference**

Added comprehensive documentation for the hidden sheet architecture to FAQ and AIR.md.

**FAQ Knowledge Base (FAQKnowledgeBase.gs):**
- Added 8 new FAQs covering hidden sheets, auto-sync triggers, troubleshooting, and repair
- Categories: Automation, Troubleshooting
- Tags for searchability

**FAQ Sheet (GettingStartedAndFAQ.gs):**
- Added new "🔧 Hidden Sheet Architecture" section
- 6 FAQs covering: What hidden sheets are, How auto-population works, Troubleshooting AB-AD columns, Verification, Repair, Engagement setup

**AIR.md:**
- Added comprehensive "Hidden Sheet Architecture (v3.40+)" section
- ASCII diagram showing data flow between sheets
- Tables for: 4 hidden sheets, 4 triggers, self-healing functions, source sheets, setup functions
- Troubleshooting guide with solutions
- Updated Table of Contents

**Files Changed:**
- FAQKnowledgeBase.gs: Added 8 hidden sheet FAQs to seedInitialFAQs()
- GettingStartedAndFAQ.gs: Added Hidden Sheet Architecture FAQ section
- AIR.md: Added Hidden Sheet Architecture section, updated TOC

---

### Version 3.43 (2025-12-13)

**ENGAGEMENT SOURCE SHEETS & VERIFICATION SYSTEM**

**New Source Sheets for Engagement Metrics:**
- `📅 Meeting Attendance` - Tracks member meeting participation
  - Columns: Date, Type (Virtual/In-Person/Hybrid), Name, Member ID, Member Name, Attended, Notes
  - Data validations for Meeting Type and Attended fields
- `🤝 Volunteer Hours` - Tracks member volunteer activities
  - Columns: Date, Member ID, Member Name, Activity, Hours, Verified By, Notes
  - Activity dropdown with common volunteer types

**Updated _Engagement_Calc Sheet:**
- Now uses real MAXIFS/SUMIF formulas when source sheets exist
- Auto-detects source sheets and uses placeholder formulas if missing
- Status notes show which sources are connected

**New Auto-Sync Trigger:**
- `onEditSyncEngagementData` - Auto-syncs when Meeting Attendance or Volunteer Hours edited
- `installEngagementSyncTrigger()` / `removeEngagementSyncTrigger()`
- `setupEngagementTracking()` - Convenience function: creates all sheets + trigger

**New VERIFY_HIDDEN_SHEETS() Function:**
- Comprehensive diagnostic for hidden sheet architecture
- Checks all 4 hidden sheets exist and are hidden
- Verifies all 4 auto-sync triggers are installed
- Confirms formulas are present in hidden sheets
- Reports data sync status for all cross-population flows

**New Menu Items (Administrator → Setup & Triggers):**
- 🔍 Verify Hidden Sheets
- 📅 Setup Engagement Tracking
- 📅 Create Meeting Attendance Sheet
- 🤝 Create Volunteer Hours Sheet

**New Constants:**
- SHEETS.MEETING_ATTENDANCE, SHEETS.VOLUNTEER_HOURS
- MEETING_COLS, VOLUNTEER_COLS column definitions

---

### Version 3.42 (2025-12-13)

**EXPANDED HIDDEN SHEET ARCHITECTURE FOR FULL MEMBER DIRECTORY AUTO-POPULATION**

**Enhanced _Grievance_Calc Sheet:**
- Added Total Grievance Count per member (Column E)
- Added Win Rate percentage (Column F)
- Added Last Grievance Date (Column G)

**New _Steward_Contact_Calc Sheet (Y-AA from Communications Log):**
- Recent Contact Date auto-populated from Communications Log timestamp
- Contact Steward auto-populated from Communications Log sender
- Contact Notes auto-populated from Communications Log subject line
- Uses email address to join member records to communications

**New _Engagement_Calc Sheet (Q-T):**
- Infrastructure ready for engagement metrics
- Placeholder formulas await Meeting Attendance Log, Email Analytics, Volunteer Tracking source sheets
- Self-healing via REPAIR_DASHBOARD()

**Updated REPAIR_DASHBOARD():**
- Now repairs all 4 hidden calculation sheets
- Installs all auto-sync triggers
- Comprehensive cross-population restoration

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

**Document Version:** 3.49
**Last Updated:** 2025-12-13
**Maintained By:** Claude (AI Assistant)

---
