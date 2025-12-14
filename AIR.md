# 509 Dashboard - Architecture & Implementation Reference

**Version:** 1.0.0 (Fresh Start)
**Last Updated:** 2025-12-14
**Purpose:** Union grievance tracking and member engagement system for SEIU Local 509

---

## Creator & License

**Creator & Owner:** Wardis N. Vizcaino
**Role:** Steward at SEIU Local 509
**Contact:** wardis@pm.me

**License:** Free for use by non-profit collective bargaining groups and unions. No license required.

---

## Quick Start

1. Deploy the 3 `.gs` files to Google Apps Script
2. Run `CREATE_509_DASHBOARD()` to create all 22 sheets
3. Use `Demo > Seed All Sample Data` to populate test data
4. Customize Config sheet with your organization's values

---

## File Architecture

### Project Structure (3 Files)

```
509-dashboard/
├── Constants.gs      # Configuration constants (SHEETS, COLORS, MEMBER_COLS, GRIEVANCE_COLS)
├── Code.gs           # Main entry point, setup functions, sheet creation
├── SeedNuke.gs       # Demo data seeding and clearing functions
└── AIR.md            # This document
```

### File Descriptions

**Constants.gs** (~400 lines)
- `SHEETS` - All 22 sheet name constants
- `COLORS` - Brand color scheme
- `MEMBER_COLS` - 31 Member Directory column positions
- `GRIEVANCE_COLS` - 34 Grievance Log column positions
- `CONFIG_COLS` - Config sheet column positions
- `DEFAULT_CONFIG` - Default dropdown values
- `getColumnLetter()` - Convert column number to letter
- `getColumnNumber()` - Convert column letter to number
- `mapMemberRow()` - Map row array to member object
- `mapGrievanceRow()` - Map row array to grievance object
- `getMemberHeaders()` - Get all 31 member column headers
- `getGrievanceHeaders()` - Get all 34 grievance column headers

**Code.gs** (~900 lines)
- `onOpen()` - Creates menu system
- `CREATE_509_DASHBOARD()` - Main setup function (creates all 22 sheets)
- `createConfigSheet()` - Config sheet with dropdown values
- `createMemberDirectory()` - Member Directory (31 columns)
- `createGrievanceLog()` - Grievance Log (34 columns)
- `createDashboard()` - Main dashboard with formulas
- Sheet creation functions for all 22 sheets
- `setupDataValidations()` - Apply dropdown validations
- `setupHiddenSheets()` - Create hidden calculation sheets
- `DIAGNOSE_SETUP()` - System health check
- `REPAIR_DASHBOARD()` - Repair hidden sheets and triggers

**SeedNuke.gs** (~500 lines)
- `SEED_SAMPLE_DATA()` - Seeds Config + 50 members + 25 grievances
- `seedConfigData()` - Populate Config dropdowns
- `SEED_MEMBERS(count)` - Seed N members (max 2000)
- `SEED_GRIEVANCES(count)` - Seed N grievances (max 300)
- `generateSingleMemberRow()` - Generate one member row (31 columns)
- `generateSingleGrievanceRow()` - Generate one grievance row (34 columns)
- `NUKE_ALL_DATA()` - Clear all data with confirmation
- `NUKE_CONFIG_DROPDOWNS()` - Clear only Config dropdowns

---

## Column Mapping System

**CRITICAL: ALL column references must use these constants, never hardcoded letters.**

### MEMBER_COLS (31 columns: A-AE)

```javascript
var MEMBER_COLS = {
  // Section 1: Identity & Core Info (A-D)
  MEMBER_ID: 1,           // A
  FIRST_NAME: 2,          // B
  LAST_NAME: 3,           // C
  JOB_TITLE: 4,           // D

  // Section 2: Location & Work (E-G)
  WORK_LOCATION: 5,       // E
  UNIT: 6,                // F
  OFFICE_DAYS: 7,         // G

  // Section 3: Contact Information (H-K)
  EMAIL: 8,               // H
  PHONE: 9,               // I
  PREFERRED_COMM: 10,     // J
  BEST_TIME: 11,          // K

  // Section 4: Organizational Structure (L-P)
  SUPERVISOR: 12,         // L
  MANAGER: 13,            // M
  IS_STEWARD: 14,         // N
  COMMITTEES: 15,         // O
  ASSIGNED_STEWARD: 16,   // P

  // Section 5: Engagement Metrics (Q-T)
  LAST_VIRTUAL_MTG: 17,   // Q
  LAST_INPERSON_MTG: 18,  // R
  OPEN_RATE: 19,          // S
  VOLUNTEER_HOURS: 20,    // T

  // Section 6: Member Interests (U-X)
  INTEREST_LOCAL: 21,     // U
  INTEREST_CHAPTER: 22,   // V
  INTEREST_ALLIED: 23,    // W
  HOME_TOWN: 24,          // X

  // Section 7: Steward Contact Tracking (Y-AA)
  RECENT_CONTACT_DATE: 25, // Y
  CONTACT_STEWARD: 26,    // Z
  CONTACT_NOTES: 27,      // AA

  // Section 8: Grievance Management (AB-AE)
  HAS_OPEN_GRIEVANCE: 28, // AB
  GRIEVANCE_STATUS: 29,   // AC
  NEXT_DEADLINE: 30,      // AD
  START_GRIEVANCE: 31     // AE (checkbox)
};
```

### GRIEVANCE_COLS (34 columns: A-AH)

```javascript
var GRIEVANCE_COLS = {
  // Section 1: Identity (A-D)
  GRIEVANCE_ID: 1,        // A
  MEMBER_ID: 2,           // B
  FIRST_NAME: 3,          // C
  LAST_NAME: 4,           // D

  // Section 2: Status & Assignment (E-F)
  STATUS: 5,              // E
  CURRENT_STEP: 6,        // F

  // Section 3: Timeline - Filing (G-I)
  INCIDENT_DATE: 7,       // G
  FILING_DEADLINE: 8,     // H (auto-calc: +21 days)
  DATE_FILED: 9,          // I

  // Section 4: Timeline - Step I (J-K)
  STEP1_DUE: 10,          // J (auto-calc: +30 days)
  STEP1_RCVD: 11,         // K

  // Section 5: Timeline - Step II (L-O)
  STEP2_APPEAL_DUE: 12,   // L (auto-calc: +10 days)
  STEP2_APPEAL_FILED: 13, // M
  STEP2_DUE: 14,          // N (auto-calc: +30 days)
  STEP2_RCVD: 15,         // O

  // Section 6: Timeline - Step III (P-R)
  STEP3_APPEAL_DUE: 16,   // P (auto-calc: +30 days)
  STEP3_APPEAL_FILED: 17, // Q
  DATE_CLOSED: 18,        // R

  // Section 7: Calculated Metrics (S-U)
  DAYS_OPEN: 19,          // S (auto-calc)
  NEXT_ACTION_DUE: 20,    // T (auto-calc)
  DAYS_TO_DEADLINE: 21,   // U (auto-calc)

  // Section 8: Case Details (V-W)
  ARTICLES: 22,           // V
  ISSUE_CATEGORY: 23,     // W

  // Section 9: Contact & Location (X-AA)
  MEMBER_EMAIL: 24,       // X
  UNIT: 25,               // Y
  LOCATION: 26,           // Z
  STEWARD: 27,            // AA

  // Section 10: Resolution (AB)
  RESOLUTION: 28,         // AB

  // Section 11: Coordinator Notifications (AC-AF)
  MESSAGE_ALERT: 29,      // AC (checkbox)
  COORDINATOR_MESSAGE: 30, // AD
  ACKNOWLEDGED_BY: 31,    // AE
  ACKNOWLEDGED_DATE: 32,  // AF

  // Section 12: Drive Integration (AG-AH)
  DRIVE_FOLDER_ID: 33,    // AG
  DRIVE_FOLDER_URL: 34    // AH
};
```

---

## Sheet Structure (22 Sheets)

| # | Sheet Name | Type | Purpose |
|---|------------|------|---------|
| 1 | Config | Core | Master dropdown lists for validation |
| 2 | Member Directory | Core | All member data (31 columns) |
| 3 | Grievance Log | Core | All grievance cases (34 columns) |
| 4 | Dashboard | Dashboard | Main real-time metrics |
| 5 | Analytics Data | Hidden | Computed aggregations |
| 6 | Member Satisfaction | Core | Survey tracking |
| 7 | Feedback & Development | Utility | Bug reports, features |
| 8 | Interactive | Dashboard | User-customizable view |
| 9 | Getting Started | Help | Onboarding guide |
| 10 | FAQ | Help | Frequently asked questions |
| 11 | User Settings | Utility | Per-user preferences |
| 12 | Steward Workload | Analytics | Steward capacity |
| 13 | Trends & Timeline | Analytics | Monthly trends |
| 14 | Location Analytics | Analytics | Geographic breakdown |
| 15 | Type Analysis | Analytics | Issue category analysis |
| 16 | Executive Dashboard | Dashboard | Executive summary |
| 17 | KPI Performance | Dashboard | Performance metrics |
| 18 | Member Engagement | Analytics | Engagement scoring |
| 19 | Cost Impact | Analytics | Financial impact |
| 20 | Archive | Utility | Archived records |
| 21 | Diagnostics | Utility | System health |
| 22 | Audit_Log | Security | Complete audit trail |

---

## Menu System

```
👤 Dashboard
├── Search Members
├── View Active Grievances
└── Grievance Tools
    ├── Start New Grievance
    ├── Refresh Grievance Formulas
    └── Refresh Member Directory Data

📊 Sheet Manager
├── Rebuild Dashboard
└── Refresh All Formulas

🔧 Setup
├── CREATE 509 DASHBOARD
├── REPAIR DASHBOARD
└── Setup Data Validations

🎭 Demo
├── Seed All Sample Data
├── Seed Data (submenu)
│   ├── Seed Config Dropdowns Only
│   ├── Seed Members (Custom Count)
│   ├── Seed Grievances (Custom Count)
│   ├── Seed 50 Members
│   └── Seed 25 Grievances
└── Nuke Data (submenu)
    ├── NUKE ALL DATA
    └── Clear Config Dropdowns Only

⚙️ Administrator
├── DIAGNOSE SETUP
├── Verify Hidden Sheets
└── Setup & Triggers (submenu)
```

---

## Config Sheet Columns

| Column | Name | Content |
|--------|------|---------|
| A | Job Titles | User populates |
| B | Office Locations | User populates |
| C | Units | User populates |
| D | Office Days | Monday-Sunday (preset) |
| E | Yes/No | Yes, No (preset) |
| F | Supervisors | User populates |
| G | Managers | User populates |
| H | Stewards | User populates |
| I | Grievance Status | Open, Pending Info, Settled, etc. (preset) |
| J | Grievance Step | Informal, Step I, Step II, etc. (preset) |
| K | Issue Category | Discipline, Workload, etc. (preset) |
| L | Articles Violated | Art. 1 - Art. 26 (preset) |
| M | Communication Methods | Email, Phone, Text, In Person (preset) |
| O | Grievance Coordinators | User populates |
| AF | Home Towns | User populates |

---

## Color Scheme

```javascript
var COLORS = {
  PRIMARY_PURPLE: '#7C3AED',  // Main brand
  UNION_GREEN: '#059669',     // Success
  SOLIDARITY_RED: '#DC2626',  // Alert/urgent
  PRIMARY_BLUE: '#7EC8E3',    // Light blue
  ACCENT_ORANGE: '#F97316',   // Warnings
  LIGHT_GRAY: '#F3F4F6',      // Backgrounds
  TEXT_DARK: '#1F2937',       // Primary text
  WHITE: '#FFFFFF'
};
```

---

## Usage Patterns

### Dynamic Column References

```javascript
// CORRECT - Dynamic column reference
var statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
var formula = '=COUNTIF(\'Grievance Log\'!' + statusCol + ':' + statusCol + ',"Open")';

// WRONG - Hardcoded column (NEVER DO THIS)
var formula = '=COUNTIF(\'Grievance Log\'!E:E,"Open")';
```

### Safe Row Writes

```javascript
// CORRECT - Protects header row
var startRow = Math.max(sheet.getLastRow() + 1, 2);

// WRONG - May overwrite headers
var startRow = sheet.getLastRow() + 1;
```

### Dynamic Sheet Names

```javascript
// CORRECT
var sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

// WRONG
var sheet = ss.getSheetByName('Member Directory');
```

---

## Seed Data Limits

| Function | Max Count | Batch Size |
|----------|-----------|------------|
| SEED_MEMBERS() | 2,000 | 50 rows |
| SEED_GRIEVANCES() | 300 | 25 rows |

---

## Changelog

### Version 1.0.0 (2025-12-14) - Fresh Start

Complete rebuild from AIR.md specification.

- Removed 77 legacy .gs files (~118,000 lines)
- Created 3 clean files (~1,500 lines)
- Constants.gs: Column mappings and helper functions
- Code.gs: Setup, menus, and sheet creation
- SeedNuke.gs: Demo data management
- 98.8% code reduction while maintaining core functionality
