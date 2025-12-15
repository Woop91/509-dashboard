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

### Project Structure (9 Files)

```
509-dashboard/
├── Constants.gs           # Configuration constants (SHEETS, COLORS, MEMBER_COLS, GRIEVANCE_COLS)
├── Code.gs                # Main entry point, setup functions, sheet creation
├── SeedNuke.gs            # Demo data seeding and clearing functions
├── HiddenSheets.gs        # Self-healing hidden calculation sheets with auto-sync
├── ADHDFeatures.gs        # ADHD accessibility & theming (focus mode, themes, pomodoro)
├── DriveCalendarEmail.gs  # Google Drive, Calendar, Email notifications
├── TestingValidation.gs   # Test framework & data validation
├── PerformanceUndo.gs     # Caching layer & undo/redo system
├── MobileQuickActions.gs  # Mobile interface & quick actions menu
└── AIR.md                 # This document
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

**Code.gs** (~1000 lines)
- `onOpen()` - Creates menu system
- `CREATE_509_DASHBOARD()` - Main setup function (creates all 22 sheets)
- `DIAGNOSE_SETUP()` - System health check
- `REPAIR_DASHBOARD()` - Repair hidden sheets and triggers
- `setupDataValidations()` - Apply dropdown validations
- `setupHiddenSheets()` - Create hidden calculation sheets
- `setDropdownValidation()` - Helper: apply single dropdown
- `getOrCreateSheet()` - Helper: get or create sheet
- `rebuildDashboard()` - Rebuild main dashboard
- `refreshAllFormulas()` - Refresh all formulas and sync
- `recalcAllGrievancesBatched()` - Refresh grievance formulas
- `refreshMemberDirectoryFormulas()` - Refresh member directory
- `searchMembers()` - Search members (stub)
- `startNewGrievance()` - Start grievance (stub)
- `viewActiveGrievances()` - Navigate to Grievance Log
- Sheet creation (22 functions): `createConfigSheet()`, `createMemberDirectory()`, `createGrievanceLog()`, `createDashboard()`, `createAnalyticsData()`, `createMemberSatisfaction()`, `createFeedback()`, `createInteractiveDashboard()`, `createGettingStarted()`, `createFAQ()`, `createUserSettings()`, `createStewardWorkload()`, `createTrends()`, `createLocationAnalytics()`, `createTypeAnalysis()`, `createExecutiveDashboard()`, `createKPIDashboard()`, `createEngagement()`, `createCostImpact()`, `createArchive()`, `createDiagnostics()`, `createAuditLog()`

**SeedNuke.gs** (~500 lines)
- `SEED_SAMPLE_DATA()` - Seeds Config + 50 members + 25 grievances
- `seedConfigData()` - Populate Config dropdowns
- `SEED_MEMBERS(count)` - Seed N members (max 2000)
- `SEED_GRIEVANCES(count)` - Seed N grievances (max 300)
- `SEED_MEMBERS_DIALOG()` - Prompt for member count
- `SEED_GRIEVANCES_DIALOG()` - Prompt for grievance count
- `seed50Members()` - Shortcut: seed 50 members
- `seed25Grievances()` - Shortcut: seed 25 grievances
- `generateSingleMemberRow()` - Generate one member row (31 columns)
- `generateSingleGrievanceRow()` - Generate one grievance row (34 columns)
- `NUKE_ALL_DATA()` - Clear all data with confirmation
- `NUKE_CONFIG_DROPDOWNS()` - Clear only Config dropdowns
- `getConfigValues()` - Helper: get values from Config column
- `randomChoice()` - Helper: pick random array element
- `randomDate()` - Helper: generate random date
- `addDays()` - Helper: add days to date

**HiddenSheets.gs** (~600 lines)
- `setupAllHiddenSheets()` - Create all 6 hidden sheets
- `setupGrievanceCalcSheet()` - Hidden sheet: Grievance → Member Directory
- `setupMemberLookupSheet()` - Hidden sheet: Member → Grievance Log
- `setupStewardWorkloadCalcSheet()` - Hidden sheet: Steward workload metrics
- `setupInteractiveDashboardCalcSheet()` - Hidden sheet: Dashboard metrics
- `setupEngagementCalcSheet()` - Hidden sheet: Engagement (placeholder)
- `setupStewardContactCalcSheet()` - Hidden sheet: Steward contact (placeholder)
- `syncAllData()` - Sync all cross-sheet data
- `syncGrievanceToMemberDirectory()` - Sync grievance data to members
- `syncMemberToGrievanceLog()` - Sync member data to grievances
- `syncStewardWorkload()` - Sync steward workload data
- `onEditAutoSync()` - Auto-sync trigger handler
- `installAutoSyncTrigger()` - Install the onEdit trigger
- `removeAutoSyncTrigger()` - Remove the onEdit trigger
- `repairAllHiddenSheets()` - Self-healing repair function
- `verifyHiddenSheets()` - Verification and diagnostics
- `refreshAllHiddenFormulas()` - Force recalculation and sync

**ADHDFeatures.gs** (~400 lines) - ADHD Accessibility & Theming
- `showADHDControlPanel()` - Main ADHD settings panel
- `getADHDSettings()`, `saveADHDSettings()`, `resetADHDSettings()` - Settings management
- `applyADHDSettings()` - Apply visual settings
- `activateFocusMode()`, `deactivateFocusMode()` - Focus mode (hide non-essential sheets)
- `toggleZebraStripes()`, `applyZebraStripes()`, `removeZebraStripes()` - Row banding
- `toggleGridlinesADHD()`, `hideAllGridlines()`, `showAllGridlines()` - Gridline control
- `toggleReducedMotion()` - Animation preferences
- `showQuickCaptureNotepad()` - Quick note-taking dialog
- `startPomodoroTimer()` - Built-in pomodoro timer
- `setBreakReminders()`, `showBreakReminder()` - Break notification system
- `showThemeManager()` - Theme selection UI
- `applyTheme()`, `applyThemeToSheet()`, `previewTheme()` - Theme application
- `getCurrentTheme()`, `resetToDefaultTheme()`, `quickToggleDarkMode()` - Theme utilities
- `setupADHDDefaults()` - Initialize ADHD-friendly defaults

**DriveCalendarEmail.gs** (~500 lines) - Google Drive, Calendar & Email
- Google Drive:
  - `createRootFolder()` - Create base folder for grievance files
  - `createGrievanceFolder()` - Create folder for specific grievance
  - `linkFolderToGrievance()` - Link folder ID to grievance row
  - `setupDriveFolderForGrievance()` - Menu handler for folder creation
  - `listFolderFiles()` - List files in a folder
  - `showGrievanceFiles()` - Show files for selected grievance
  - `batchCreateGrievanceFolders()` - Create folders for all grievances
- Calendar:
  - `syncDeadlinesToCalendar()` - Sync all deadlines to Google Calendar
  - `checkCalendarEventExists()` - Check if event already exists
  - `clearAllCalendarEvents()` - Remove all dashboard calendar events
  - `showUpcomingDeadlinesFromCalendar()` - View upcoming deadlines
- Email Notifications:
  - `setupDailyDeadlineNotifications()` - Enable daily email reminders
  - `disableDailyDeadlineNotifications()` - Disable notifications
  - `checkDeadlinesAndNotify()` - Main notification check (runs daily)
  - `sendDeadlineNotification()` - Send individual notification
  - `showNotificationSettings()` - Notification configuration UI
  - `testDeadlineNotifications()` - Test notification system

**TestingValidation.gs** (~500 lines) - Testing Framework & Data Validation
- Testing Framework:
  - `Assert` - Assertion library (assertEquals, assertTrue, assertFalse, etc.)
  - `runAllTests()` - Run complete test suite
  - `runQuickTests()` - Run fast unit tests only
  - `generateTestReport()` - Create test results sheet
  - `getTestFunctionRegistry()` - Test function registry
  - Unit tests: `testMemberColsConstants()`, `testGrievanceColsConstants()`, `testColumnLetterConversion()`, etc.
- Validation Framework:
  - `VALIDATION_PATTERNS` - Regex patterns for email, phone, IDs
  - `validateEmailAddress()` - Email format validation with typo detection
  - `validatePhoneNumber()` - Phone validation with auto-formatting
  - `formatUSPhone()` - Format phone to (XXX) XXX-XXXX
  - `validateRequired()` - Required field validation
  - `checkDuplicateMemberID()`, `checkDuplicateGrievanceID()` - Duplicate detection
  - `runBulkValidation()` - Validate all data
  - `showValidationReport()` - Display validation issues
  - `showValidationSettings()` - Validation configuration UI
  - `installValidationTrigger()` - Real-time validation on edit
  - `onEditValidation()` - Validation trigger handler

**PerformanceUndo.gs** (~500 lines) - Caching Layer & Undo/Redo
- Caching:
  - `getCachedData()` - Get data from cache or load
  - `setCachedData()` - Store data in cache
  - `invalidateCache()` - Clear specific cache
  - `invalidateAllCaches()` - Clear all caches
  - `warmUpCaches()` - Pre-populate caches
  - `getCachedGrievances()`, `getCachedMembers()`, `getCachedStewards()` - Cached data getters
  - `getCachedDashboardMetrics()` - Cached dashboard metrics
  - `showCacheStatusDashboard()` - Cache status UI
- Undo/Redo:
  - `getUndoHistory()`, `saveUndoHistory()` - History management
  - `recordAction()` - Record an action for undo
  - `recordCellEdit()`, `recordRowAddition()`, `recordRowDeletion()` - Specific action recording
  - `undoLastAction()`, `redoLastAction()` - Undo/redo operations
  - `undoToIndex()`, `redoToIndex()` - Jump to specific point
  - `applyState()` - Apply state snapshot
  - `clearUndoHistory()` - Clear all history
  - `showUndoRedoPanel()` - Undo/redo UI
  - `exportUndoHistoryToSheet()` - Export history to sheet
  - `createGrievanceSnapshot()`, `restoreFromSnapshot()` - Full snapshot backup

**MobileQuickActions.gs** (~600 lines) - Mobile Interface & Quick Actions
- Mobile Interface:
  - `showMobileDashboard()` - Touch-optimized dashboard
  - `getMobileDashboardStats()` - Dashboard statistics
  - `getRecentGrievancesForMobile()` - Recent grievances (limit)
  - `showMobileGrievanceList()` - Mobile grievance list
  - `showMobileUnifiedSearch()` - Mobile search UI
  - `getMobileSearchData()` - Search handler
  - `showMyAssignedGrievances()` - View user's assigned cases
- Quick Actions:
  - `showQuickActionsMenu()` - Context-aware quick actions
  - `showMemberQuickActions()` - Quick actions for member row
  - `showGrievanceQuickActions()` - Quick actions for grievance row
  - `quickUpdateGrievanceStatus()` - One-click status update
  - `composeEmailForMember()` - Email composition dialog
  - `sendQuickEmail()` - Send email via MailApp
  - `showMemberGrievanceHistory()` - Member's grievance history
  - `openGrievanceFormForMember()` - Start grievance for member
  - `syncSingleGrievanceToCalendar()` - Sync single grievance to calendar

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

## Hidden Sheet Architecture (Self-Healing)

The system uses 6 hidden calculation sheets with auto-sync triggers for cross-sheet data population.

### Hidden Sheets

| Sheet | Source | Destination | Columns Updated |
|-------|--------|-------------|-----------------|
| `_Grievance_Calc` | Grievance Log | Member Directory | AB-AD (Has Open, Status, Deadline) |
| `_Member_Lookup` | Member Directory | Grievance Log | C-D (Name), X-AA (Email, Unit, Location, Steward) |
| `_Steward_Workload_Calc` | Grievance Log | Steward Workload | All workload metrics |
| `_Interactive_Dashboard_Calc` | Both | Interactive Dashboard | 8 key metrics |
| `_Engagement_Calc` | (Future) | Member Directory | Q-T (Engagement metrics) |
| `_Steward_Contact_Calc` | (Future) | Member Directory | Y-AA (Contact tracking) |

### Auto-Sync Trigger

The `onEditAutoSync` trigger automatically syncs data when:
- Grievance Log is edited → Updates Member Directory columns AB-AD
- Member Directory is edited → Updates Grievance Log columns C-D, X-AA

### Key Functions (HiddenSheets.gs)

| Function | Purpose |
|----------|---------|
| `setupAllHiddenSheets()` | Create all 6 hidden sheets with formulas |
| `repairAllHiddenSheets()` | Recreate sheets, install trigger, sync data |
| `installAutoSyncTrigger()` | Install the onEdit auto-sync trigger |
| `verifyHiddenSheets()` | Verify all sheets and triggers are working |
| `syncAllData()` | Manual sync of all cross-sheet data |
| `syncGrievanceToMemberDirectory()` | Sync grievance data to members |
| `syncMemberToGrievanceLog()` | Sync member data to grievances |

### Self-Healing

If hidden sheets get corrupted or deleted:
1. Run `REPAIR_DASHBOARD()` from Setup menu
2. Or run `repairAllHiddenSheets()` from Administrator menu

This recreates all formulas and reinstalls the auto-sync trigger.

---

## Changelog

### Version 1.1.0 (2025-12-14) - Hidden Sheet Architecture

Added self-healing hidden formula system:

- HiddenSheets.gs: Full implementation of 6 hidden calculation sheets
- Auto-sync onEdit trigger for automatic cross-sheet data population
- Self-healing repair functions
- Manual sync options in Administrator menu

### Version 1.0.0 (2025-12-14) - Fresh Start

Complete rebuild from AIR.md specification.

- Removed 77 legacy .gs files (~118,000 lines)
- Created 3 clean files (~1,500 lines)
- Constants.gs: Column mappings and helper functions
- Code.gs: Setup, menus, and sheet creation
- SeedNuke.gs: Demo data management
- 98.8% code reduction while maintaining core functionality
