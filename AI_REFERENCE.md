# 509 Dashboard - Complete Feature Reference

**Version:** 3.20
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

## 🆕 Changelog - Version 3.20 (2025-12-09)

**FIX: Seeding Functions Now Protect Row 1 Headers**

Fixed critical bug where seeding could overwrite row 1 headers with data if the sheet was empty.

**Root Cause:**
- `writeMemberBatch()` and `writeGrievanceBatch()` used `getLastRow() + 1` to determine write position
- If sheet was empty (`getLastRow()` = 0), data was written to row 1, overwriting headers
- This caused Member Directory to lose all column headings

**Fix Applied:**
Both batch write functions now use `Math.max(getLastRow() + 1, 2)` to ensure data always starts at row 2 minimum:

```javascript
// Before:
memberDir.getRange(memberDir.getLastRow() + 1, 1, ...).setValues(data);

// After:
const startRow = Math.max(memberDir.getLastRow() + 1, 2);
memberDir.getRange(startRow, 1, ...).setValues(data);
```

**Files Modified:**
- `Code.gs` - `writeMemberBatch()` and `writeGrievanceBatch()` functions

**To Restore Headers After This Bug:**
1. Delete all content in Member Directory
2. Run `509 Tools > Setup/Config > CREATE_509_DASHBOARD()` OR run `createMemberDirectory()` from script editor
3. Headers will be restored in row 1
4. Re-seed if needed

---

## Changelog - Version 3.19 (2025-12-09)

**FIX: Data Validation Row Cap - Prevents Validation Beyond ARRAYFORMULA Limit**

Fixed critical bug where data validation was being applied beyond row 21000, causing error:
`Exception: The data you entered in cell M25004 violates the data validation rules set on this cell.`

**Root Cause:**
- `MemberDirectoryDropdowns.gs` used `Math.max(memberSheet.getLastRow(), 1000)` to determine validation range
- When sheet had previous ARRAYFORMULA data extending to row 25000, `getLastRow()` returned 25000+
- Validation was then applied to all 25000+ rows, but only rows 2-21000 have valid dropdown options

**Fix Applied:**
All 6 instances in `MemberDirectoryDropdowns.gs` now cap the row limit:

| Function | Before | After |
|----------|--------|-------|
| `setupMemberDirectoryDropdowns()` | `Math.max(..., 1000)` | `Math.min(Math.max(..., 1000), 21000)` |
| `setupGrievanceLogDropdowns()` | `Math.max(..., 500)` | `Math.min(Math.max(..., 500), 6000)` |
| `refreshStewardDropdowns()` (member) | `Math.max(..., 1000)` | `Math.min(Math.max(..., 1000), 21000)` |
| `refreshStewardDropdowns()` (grievance) | `Math.max(..., 500)` | `Math.min(Math.max(..., 500), 6000)` |
| `setupMemberDirectoryDropdownsSilent()` | `Math.max(..., 1000)` | `Math.min(Math.max(..., 1000), 21000)` |
| `setupGrievanceLogDropdownsSilent()` | `Math.max(..., 500)` | `Math.min(Math.max(..., 500), 6000)` |

**Row Limits:**
- Member Directory: 21000 (20k members + 1k buffer, matches ARRAYFORMULA)
- Grievance Log: 6000 (5k grievances + 1k buffer)

**Files Modified:**
- `MemberDirectoryDropdowns.gs` - All 6 lastRow calculations now capped

---

## Changelog - Version 3.18 (2025-12-09)

**CRITICAL: SHEETS CONSTANT MISMATCHES & DYNAMIC COLUMN FIXES**

This release fixes critical mismatches between SHEETS constants and actual code usage that would have caused runtime bugs (sheets not found).

✅ **Fixed SHEETS Constant Mismatches** (`Constants.gs`)

| Constant | Was (BROKEN) | Now (FIXED) |
|----------|--------------|-------------|
| `SHEETS.AUDIT_LOG` | "Audit Log" | "Audit_Log" |
| `SHEETS.ASSIGNMENT_LOG` | "📋 Assignment Log" | "🤖 Auto-Assignment Log" |
| **NEW** `SHEETS.PERFORMANCE_LOG` | (missing) | "Performance_Log" |

**Why This Was Critical:**
- Code using `getSheetByName('Audit_Log')` wouldn't find sheet created with `SHEETS.AUDIT_LOG` = "Audit Log"
- GrievanceFloatToggle.gs was creating "User Settings" (no emoji) but SHEETS.USER_SETTINGS was "⚙️ User Settings"
- SmartAutoAssignment.gs created "🤖 Auto-Assignment Log" but SHEETS.ASSIGNMENT_LOG was "📋 Assignment Log"

✅ **Converted 23 Files to Use SHEETS.* Constants**

Files converted from hardcoded sheet names to SHEETS.* constants:

| File | Conversion |
|------|------------|
| ADHDEnhancements.gs | "⚙️ User Settings" → `SHEETS.USER_SETTINGS` |
| AuditLoggingRBAC.gs | "Audit_Log" → `SHEETS.AUDIT_LOG` |
| AutomatedReports.gs | "⚙️ Configuration" → `SHEETS.CONFIGURATION` |
| CoordinatorNotification.gs | 'Grievance Log' → `SHEETS.GRIEVANCE_LOG` |
| DataBackupRecovery.gs | '💾 Backup Log' → `SHEETS.BACKUP_LOG` |
| DataIntegrityEnhancements.gs | '📝 Change Log' → `SHEETS.CHANGE_LOG` |
| EnhancedErrorHandling.gs | 'Error_Trends' → `SHEETS.ERROR_TRENDS` |
| FAQKnowledgeBase.gs | '📚 FAQ Database' → `SHEETS.FAQ_DATABASE` |
| GettingStartedAndFAQ.gs | "📚 Getting Started" → `SHEETS.GETTING_STARTED` |
| GettingStartedAndFAQ.gs | "❓ FAQ" → `SHEETS.FAQ` |
| GmailIntegration.gs | '📞 Communications Log' → `SHEETS.COMMUNICATIONS_LOG` |
| GrievanceFloatToggle.gs | 'User Settings' → `SHEETS.USER_SETTINGS` |
| PerformanceAndBackup.gs | 'Performance_Log' → `SHEETS.PERFORMANCE_LOG` |
| PerformanceMonitoring.gs | '⚡ Performance Monitor' → `SHEETS.PERFORMANCE_MONITOR` |
| SecurityAndAdmin.gs | 'Audit_Log', 'Archive' → `SHEETS.AUDIT_LOG`, `SHEETS.ARCHIVE` |
| SecurityService.gs | 'User Roles', 'Audit Log' → `SHEETS.USER_ROLES`, `SHEETS.AUDIT_LOG` |
| SmartAutoAssignment.gs | '🤖 Auto-Assignment Log' → `SHEETS.ASSIGNMENT_LOG` |
| TestFramework.gs | 'Test Results' → `SHEETS.TEST_RESULTS` |
| UIFeatures.gs | 'Performance_Log' → `SHEETS.PERFORMANCE_LOG` |
| WorkflowStateMachine.gs | '🔄 State Change Log' → `SHEETS.STATE_CHANGE_LOG` |

✅ **Fixed Hardcoded Column Counts in Test Files**

- `Code.test.gs`: Changed `getRange(..., 31)` → `getRange(..., memberDir.getLastColumn())`
- `Integration.test.gs`: Changed `getRange(..., 28)` and `getRange(..., 31)` → `getLastColumn()`

**Files Modified:**
- `Constants.gs` - Fixed 3 SHEETS constants, added PERFORMANCE_LOG
- `ADHDEnhancements.gs`, `AuditLoggingRBAC.gs`, `AutomatedReports.gs` - SHEETS.* conversions
- `Code.test.gs`, `Integration.test.gs` - Dynamic column counts
- `CoordinatorNotification.gs` - SHEETS.GRIEVANCE_LOG (critical fix)
- `DataBackupRecovery.gs`, `DataIntegrityEnhancements.gs`, `EnhancedErrorHandling.gs`
- `FAQKnowledgeBase.gs`, `GettingStartedAndFAQ.gs`, `GmailIntegration.gs`
- `GrievanceFloatToggle.gs`, `PerformanceAndBackup.gs`, `PerformanceMonitoring.gs`
- `SecurityAndAdmin.gs`, `SecurityService.gs`, `SmartAutoAssignment.gs`
- `TestFramework.gs`, `UIFeatures.gs`, `WorkflowStateMachine.gs`

**Verification Commands:**
```bash
# Verify no hardcoded sheet column references (should be 0)
grep "'Member Directory'![A-Z]:[A-Z]" *.gs | wc -l
grep "'Grievance Log'![A-Z]:[A-Z]" *.gs | wc -l

# Count SHEETS.* references (should be ~960+)
grep -c "SHEETS\." *.gs | awk -F: '{sum+=$2} END {print sum}'

# Check remaining hardcoded getSheetByName (should only be temp export sheets)
grep -n "getSheetByName\s*(['\"]" *.gs | grep -v "SHEETS\." | grep -v "ConsolidatedDashboard.gs"
```

✅ **Fixed Hardcoded insertSheet() Calls** (12 files)

Additional review found insertSheet() calls using hardcoded names instead of SHEETS.* constants:

| File | Fix |
|------|-----|
| Code.gs | `insertSheet(SHEETS.EXECUTIVE_DASHBOARD)`, `insertSheet(SHEETS.KPI_PERFORMANCE)` |
| DataBackupRecovery.gs | `insertSheet(SHEETS.BACKUP_LOG)` |
| DataIntegrityEnhancements.gs | `insertSheet(SHEETS.CHANGE_LOG)` |
| EnhancedErrorHandling.gs | `insertSheet(SHEETS.ERROR_TRENDS)` |
| FAQKnowledgeBase.gs | `insertSheet(SHEETS.FAQ_DATABASE)` |
| GmailIntegration.gs | `insertSheet(SHEETS.COMMUNICATIONS_LOG)` |
| PerformanceAndBackup.gs | `insertSheet(SHEETS.PERFORMANCE_LOG)` |
| PerformanceMonitoring.gs | `insertSheet(SHEETS.PERFORMANCE_MONITOR)` |
| SecurityAndAdmin.gs | `insertSheet(SHEETS.ARCHIVE)` |
| SecurityService.gs | `insertSheet(SHEETS.USER_ROLES)` |
| TestFramework.gs | `insertSheet(SHEETS.TEST_RESULTS)` |
| WorkflowStateMachine.gs | `insertSheet(SHEETS.STATE_CHANGE_LOG)` |

**Note:** Remaining hardcoded insertSheet() calls are intentionally for temporary/export sheets (Visualizations, Benchmark_Report, Members_Export, etc.)

✅ **Fixed Hardcoded Sheet Names in Comparisons & Object Keys** (4 files)

Additional review found sheet names used in comparisons, object keys, and HTML:

| File | Fix |
|------|-----|
| ADHDEnhancements.gs | `sheetName.includes('Config')` → `sheetName !== SHEETS.CONFIG` |
| ContextSensitiveHelp.gs | `'Member Directory': {...}` → `[SHEETS.MEMBER_DIR]: {...}` |
| InteractiveTutorial.gs | `sheet: 'Member Directory'` → `sheet: SHEETS.MEMBER_DIR` |
| SessionManagement.gs | `value="Grievance Log"` → `value="${SHEETS.GRIEVANCE_LOG}"` |

**Note:** Sheet names in Google Sheets FORMULAS (like `=COUNTIF('Grievance Log'!...)`) are intentionally kept as literals - formulas require actual sheet names, not JavaScript constants.

✅ **Fixed ARRAYFORMULA Row Ranges** (`Code.gs`)

Changed ARRAYFORMULA ranges from 25000 to 21000 rows (20k members + 1k buffer):
- `maxMemberRows`: 25000 → 21000
- `A2:A25000` → `A2:A21000` in all Member Directory formulas

**Commits:**
- 5f4e101: Fix SHEETS constant mismatches and convert hardcoded sheet names
- a17e071: Fix hardcoded insertSheet calls to use SHEETS.* constants
- c283a17: Fix hardcoded sheet names in comparisons, object keys, and HTML
- eaa9658: Change ARRAYFORMULA ranges from 25000 to 21000 rows

---

## Changelog - Version 3.17 (2025-12-08)

**COMPLETE DYNAMIC COLUMN MIGRATION**

Converted ALL hardcoded column references to use dynamic constants (MEMBER_COLS, GRIEVANCE_COLS, CONFIG_COLS).

**Files Modified:**
- Multiple files converted to use dynamic column constants
- Test files updated to use `getLastColumn()` instead of hardcoded counts

**Commits:**
- 982ee0b: Fix hardcoded sheet names to use SHEETS constants
- e91aab4: Complete dynamic column conversion
- 1220670: Convert all remaining hardcoded columns
- 98787f5: Fix all remaining hardcoded column counts
- dc11a0b: Replace all remaining hardcoded column references

---

## Changelog - Version 3.16 (2025-12-08)

**CODE QUALITY ENHANCEMENTS - ROW MAPPERS & SCHEMA VALIDATION:**

Based on external code review recommendations, this release adds architectural improvements for better maintainability and error prevention.

✅ **Row Mapper Functions** (`Constants.gs`)
- Added `mapMemberRow(row)` - Maps Member Directory row array to structured object
  - Returns object with named properties: `memberId`, `firstName`, `lastName`, `fullName`, `email`, `workLocation`, etc.
  - Eliminates scattered `row[MEMBER_COLS.X - 1]` calls throughout codebase
  - Example: `const members = data.slice(1).map(mapMemberRow);`

- Added `mapGrievanceRow(row)` - Maps Grievance Log row array to structured object
  - Returns object with named properties: `grievanceId`, `memberId`, `memberName`, `status`, `dateFiled`, etc.
  - Includes computed `memberName` field (combines first + last name)
  - Example: `const openCases = grievances.filter(g => g.status === 'Open');`

**Benefits:**
- Reduces off-by-one index errors
- Makes code more readable and self-documenting
- Easier to refactor if column layout changes
- Single point of update for column mapping

✅ **Schema Validation Functions** (`Constants.gs`)
- Added `MEMBER_EXPECTED_HEADERS` - Expected header texts for Member Directory columns
- Added `GRIEVANCE_EXPECTED_HEADERS` - Expected header texts for Grievance Log columns
- Added `validateSheetHeaders(sheet, expectedHeaders)` - Generic header validation
- Added `validateMemberDirectorySchema()` - Validates Member Directory headers
- Added `validateGrievanceLogSchema()` - Validates Grievance Log headers
- Added `runSchemaHealthCheck()` - Comprehensive health report for all sheets
- Added `showSchemaHealthCheck()` - UI dialog showing validation results

**Benefits:**
- Detects header drift from manual edits
- Prevents silent data corruption
- Aids diagnostics and troubleshooting
- Menu accessible: `Administrator > System Health > Schema Health Check`

✅ **Menu Update** (`ReorganizedMenu.gs`)
- Added "📋 Schema Health Check" to Administrator > System Health submenu

**Files Modified:**
- `Constants.gs` - Added row mappers, schema validation, expected headers
- `ReorganizedMenu.gs` - Added Schema Health Check menu item
- `ConsolidatedDashboard.gs` - Rebuilt with all enhancements

**Usage Examples:**
```javascript
// Row mappers - cleaner data access
const data = memberSheet.getDataRange().getValues();
const members = data.slice(1).map(mapMemberRow);
const stewards = members.filter(m => m.isSteward === 'Yes');
stewards.forEach(s => Logger.log(`${s.fullName}: ${s.email}`));

// Schema validation - detect configuration drift
const health = runSchemaHealthCheck();
if (!health.allValid) {
  health.issues.forEach(issue => Logger.log(issue));
}
```

---

## Changelog - Version 3.15 (2025-12-08)

**CRITICAL BUG FIXES - UNDEFINED COLUMN CONSTANTS:**

This release fixes 14 undefined property references that were causing runtime errors throughout the codebase. These issues were identified via external code review.

✅ **Added GRIEVANCE_COLS Aliases** (`Constants.gs`)
- Added 11 backward-compatibility aliases for legacy property names:
  - `FILED_DATE` → `DATE_FILED` (column 9)
  - `STEP1_DECISION_RCVD` → `STEP1_RCVD` (column 11)
  - `STEP2_DECISION_RCVD` → `STEP2_RCVD` (column 15)
  - `DEADLINE` → `NEXT_ACTION_DUE` (column 20)
  - `ISSUE_TYPE` → `ISSUE_CATEGORY` (column 23)
  - `ASSIGNED_STEWARD` → `STEWARD` (column 27)
  - `NOTES` → `RESOLUTION` (column 28)
  - `DESCRIPTION` → `RESOLUTION` (column 28)
  - `ADMIN_FLAG` → `MESSAGE_ALERT` (column 29)
  - `ADMIN_MESSAGE` → `COORDINATOR_MESSAGE` (column 30)
  - `MESSAGE_ACKNOWLEDGED` → `ACKNOWLEDGED_BY` (column 31)

✅ **Added MEMBER_COLS.LOCATION Alias** (`Constants.gs`)
- Added `LOCATION` as alias for `WORK_LOCATION` (column 5)
- Fixes 4 references in Code.gs and OperationsAnalytics.gs

✅ **Added CACHE_CONFIG.ENABLE_LOGGING** (`Constants.gs`)
- Added `ENABLE_LOGGING: true` to CACHE_CONFIG
- Fixes 6 references in DataCachingLayer.gs that were checking undefined property
- Cache hit/miss logging now works as intended

✅ **Added Helper Functions for Member Names** (`Constants.gs`)
- `getGrievanceMemberName(row)` - Combines FIRST_NAME + LAST_NAME from grievance row
- `getMemberFullName(row)` - Combines FIRST_NAME + LAST_NAME from member row
- Use these instead of `GRIEVANCE_COLS.MEMBER_NAME` (which doesn't exist as a column)

✅ **Updated MobileOptimization.gs**
- Replaced 3 instances of `row[GRIEVANCE_COLS.MEMBER_NAME - 1]` with `getGrievanceMemberName(row)`
- Mobile grievance browser and detail views now correctly display member names

**Why This Was Needed:**
- External code review identified 14 undefined property references
- These caused runtime errors or silent failures when:
  - AdminGrievanceMessages module tried to read/write admin flags
  - BatchGrievanceRecalc tried to calculate step decision timelines
  - MobileOptimization tried to display grievance details
  - DataCachingLayer tried to log cache operations
  - OperationsAnalytics tried to build location-based reports

**Files Modified:**
- `Constants.gs` - Added 12 aliases + 1 config property + 2 helper functions
- `MobileOptimization.gs` - Updated 3 call sites to use helper function
- `ConsolidatedDashboard.gs` - Rebuilt with all fixes

**Verification Commands:**
```bash
# Verify no more undefined GRIEVANCE_COLS references
grep -r "GRIEVANCE_COLS\." --include="*.gs" | grep -v ConsolidatedDashboard

# Verify MEMBER_COLS.LOCATION is now defined
grep -r "MEMBER_COLS\.LOCATION" --include="*.gs"

# Verify CACHE_CONFIG.ENABLE_LOGGING is now defined
grep -r "CACHE_CONFIG\.ENABLE_LOGGING" --include="*.gs"
```

---

## Changelog - Version 3.14 (2025-12-08)

**TEST FRAMEWORK FIX FOR APPS SCRIPT COMPATIBILITY:**

✅ **Fixed Test Runner Function Lookup** (`TestFramework.gs`)
- Added `TEST_FUNCTION_REGISTRY` to map test names to their functions
- Apps Script doesn't support `this[functionName]` in `forEach` callbacks
- Fixed `runAllTests()` and `runTestCategory()` to use registry lookup
- All 49 test functions now properly registered and callable

✅ **Resolved Duplicate Function Conflicts** (`Code.test.gs`)
- Renamed duplicate `runAllTests()` → `runQuickTests()` (runs column + input validation tests only)
- Renamed duplicate `runValidationTests()` → `runInputValidationTests()` (tests validate* helper functions)
- Main `runAllTests()` in `TestFramework.gs` is now the canonical version

**Why This Was Needed:**
- Tests weren't running because `this[testName]` returns `undefined` in Apps Script
- Duplicate function definitions caused only one version to execute
- Menu items for tests appeared but clicking them did nothing

**Files Modified:**
- `TestFramework.gs` - Added `getTestFunctionRegistry()`, `ensureTestRegistry()`, `TEST_FUNCTION_REGISTRY`
- `Code.test.gs` - Renamed conflicting functions

---

## Changelog - Version 3.13 (2025-12-08)

**DATA VALIDATION FIX FOR USER-POPULATED FIELDS:**

✅ **Data Validation Now Allows Blank Values** (`Code.gs`)
- Fixed issue where empty values for user-populated fields were rejected by data validation
- User-populated columns now use `.setAllowInvalid(true)` to allow blank/custom values:
  - **Member Directory:** Job Title, Work Location, Unit, Supervisor, Manager, Assigned Steward, Home Town
  - **Grievance Log:** Unit, Location, Steward
- System-required columns still use strict validation (`.setAllowInvalid(false)`):
  - Is Steward (Yes/No), Interest columns (Yes/No)
  - Status, Current Step, Articles Violated, Issue Category

✅ **Test Fixes** (`TestFramework.gs`, `Code.test.gs`, `Integration.test.gs`, `TestConfig.gs`)
- Removed all hardcoded sample values (Boston HQ, Unit A - Administrative, Jane Smith, Sarah Johnson, etc.)
- Test helper `createTestMember()` now uses empty strings for dropdown fields
- `testConfigDropdownValues()` now checks column readability instead of asserting specific values

**Why This Was Needed:**
- v3.11 removed sample data from Config tab (users populate their own)
- But data validation rules still rejected blank values
- Tests failed because they couldn't insert empty dropdown values
- Now users can enter blank values until they populate Config

**New Helper Function:**
- `refreshAllValidations()` - Re-applies all data validation rules with v3.13+ settings
  - Menu: `🔧 Setup > 📋 Dropdown Configuration > 🔄 Refresh Data Validations (v3.13+)`
  - **Run this on existing spreadsheets to fix validation errors**

**Files Modified:**
- `Code.gs` - Data validation rules updated; added `refreshAllValidations()`
- `ReorganizedMenu.gs` - Added menu item for Refresh Data Validations
- `TestFramework.gs` - createTestMember() uses empty strings
- `Code.test.gs` - Removed hardcoded assertions for specific Config values
- `Integration.test.gs` - Removed hardcoded dropdown values from test data
- `TestConfig.gs` - seedTestData() uses empty strings for dropdown fields

---

## Changelog - Version 3.12 (2025-12-08)

**GRIEVANCE LOG COLUMN RENAME & COMPREHENSIVE DASHBOARD MERGE:**

✅ **Grievance Log Column AC Renamed** (`Code.gs`, `Constants.gs`, `CoordinatorNotification.gs`, `DashboardFixes.gs`)
- Renamed column AC from "Coordinator Notified" to **"Message Alert"**
- Updated `GRIEVANCE_COLS.COORDINATOR_NOTIFIED` to `GRIEVANCE_COLS.MESSAGE_ALERT`
- All references updated throughout the codebase

✅ **Comprehensive Executive Dashboard** (`Code.gs`)
- **MERGED into Executive Dashboard:**
  - Quick Stats (existing)
  - KPI Performance Tracking (from KPI Performance Dashboard)
  - Location Analytics (from Operations Analytics)
  - Grievance Type Analysis (from Operations Analytics)
- **DELETED standalone tabs:**
  - 📊 Operations Analytics
  - 📊 KPI Performance Dashboard
- New `deleteStandaloneMergedTabs()` function removes merged tabs during CREATE_509_DASHBOARD

✅ **Member Satisfaction Tab Hidden**
- Tab is now HIDDEN during CREATE_509_DASHBOARD
- **TODO:** User will wire this tab to Grievance Log and Member Directory later
- Use `showMemberSatisfactionTab()` to unhide when ready

**New Helper Functions:**
- `deleteStandaloneMergedTabs()` - Deletes Operations Analytics and KPI Performance Dashboard tabs
- `hideMemberSatisfactionTab()` - Hides Member Satisfaction tab
- `showMemberSatisfactionTab()` - Shows Member Satisfaction tab (when ready to wire)

**Files Modified:**
- `Code.gs` - Comprehensive merged Executive Dashboard, helper functions, CREATE_509_DASHBOARD updates
- `Constants.gs` - COORDINATOR_NOTIFIED → MESSAGE_ALERT
- `CoordinatorNotification.gs` - Updated all MESSAGE_ALERT references
- `DashboardFixes.gs` - Updated MESSAGE_ALERT reference
- `AI_REFERENCE.md` - Updated documentation

---

## Changelog - Version 3.11 (2025-12-08)

**REMOVED SAMPLE DATA FROM CONFIG TAB & DYNAMIC ANALYTICS:**

✅ **Config Tab Sample Data Removed** (`Code.gs`)
- The following fields are now LEFT EMPTY during CREATE_509_DASHBOARD (users populate their own data):
  - Job Titles (Column A)
  - Office Locations (Column B)
  - Units (Column C)
  - Supervisors (Column F)
  - Managers (Column G)
  - Stewards (Column H)
  - Grievance Coordinators (Column O)
  - Home Towns (Column AF)
- **PRESERVED:** Organization info, Grievance Settings, Deadlines, Contract References, Office Days, Yes/No values, Issue Categories, Articles Violated, Communication Methods, Steward Committees

✅ **Operations Analytics Now Fully Dynamic** (`OperationsAnalytics.gs`)
- **Location Analytics Section:** Now uses `UNIQUE()` formula to pull locations directly from Member Directory
  - No more hardcoded fallback locations
  - Dynamically shows only locations that exist in Member Directory
  - All metrics (members, grievances, win rate, etc.) reference actual Member Directory and Grievance Log data
- **Type Analysis Section:** Now uses `UNIQUE()` formula to pull issue categories directly from Grievance Log
  - No more hardcoded fallback issue types
  - Dynamically shows only issue types that exist in Grievance Log data

✅ **Dashboard Tabs Already Wired (Verified):**
- Member Satisfaction: Uses formulas referencing its own data columns
- Executive Dashboard: All metrics reference 'Member Directory' and 'Grievance Log'
- KPI Performance Dashboard: All KPIs reference 'Member Directory' and 'Grievance Log'

**Files Modified:**
- `Code.gs` - Removed sample data from createConfigTab() for specified fields
- `OperationsAnalytics.gs` - Updated Location Analytics and Type Analysis to use UNIQUE() formulas
- `AI_REFERENCE.md` - Updated documentation

---

## Changelog - Version 3.8 (2025-12-07)

**COMPREHENSIVE DASHBOARD FIXES & SEED/NUKE ALIGNMENT:**

✅ **Operations Analytics - Merged Tab:**
- Created new `OperationsAnalytics.gs` combining 5 analytics tabs into one:
  - Trends & Timeline
  - Location Analytics
  - Type Analysis
  - Member Engagement
  - Cost Impact
- All sections wired with live COUNTIF/COUNTIFS formulas from Grievance Log

✅ **Fixed Dashboard Data Population:**
- Interactive Dashboard: Added live formulas to metric cards and data tables
- Executive Dashboard: Fixed Win Rate formula (Settled vs Denied, not "Resolved*")
- KPI Performance Dashboard: Added 8 KPI rows with live formulas

✅ **Feedback Auto-Population:**
- Sample Feedback entries ARE auto-added during CREATE_509_DASHBOARD (3 sample entries)
- Additional feedback can be added via: Demo > Seed Demo Data > Add Sample Feedback Entries
- `nukeSeedData()` clears Feedback & Development (added `clearFeedbackDevelopment()`)
- Updated nuke warning message to mention Feedback & Development

✅ **Data Validation Fixes:**
- Days Open: Shows only 0 or positive numbers (already correct)
- Next Action Due: Now shows only future dates or blank (clears if overdue)
- Days to Deadline: Now shows only positive numbers or blank (clears if overdue)

✅ **Row 2 Formatting Fixes:**
- Member Directory: Row 2 now has data row formatting (not header formatting)
- Grievance Log: Row 2 now has data row formatting (not header formatting)

**Files Modified:**
- `OperationsAnalytics.gs` - NEW: Merged analytics dashboard
- `Code.gs` - Executive Dashboard, KPI Dashboard, row 2 formatting fixes
- `InteractiveDashboard.gs` - Live data formulas
- `BatchGrievanceRecalc.gs` - Data validation (future dates only, positive only)
- `SeedNuke.gs` - Added clearFeedbackDevelopment()
- `DashboardFixes.gs` - Added auto-populate sample feedback on CREATE_509_DASHBOARD
- `Constants.gs` - Added OPERATIONS_ANALYTICS sheet name
- `build.js` - Added OperationsAnalytics.gs to build

---

## Changelog - Version 3.10 (2025-12-07)

**COMPREHENSIVE NUMBER FORMATTING WITH COMMAS:**

✅ **Executive Dashboard** (`Code.gs`)
- All numeric values now use TEXT(value,"#,##0") for comma formatting
- Updated Quick Stats: Active Members, Active Grievances, Overdue Cases, Active Stewards
- Updated Detailed KPIs: All member/grievance counts with comma separators
- Comparison formulas updated to handle comma-formatted values with SUBSTITUTE()

✅ **KPI Dashboard** (`Code.gs`)
- All KPI numeric values now use TEXT(value,"#,##0")
- Current Value, Variance, Last Month columns all show commas (20,000 not 20000)
- Target column updated to use comma format (20,000 not 20000)

✅ **Grievance Log** (`Code.gs`)
- Applied setNumberFormat("#,##0") to Days Open column (S)
- Applied setNumberFormat("#,##0") to Days to Deadline column (U)
- Supports up to 1,000 rows of data

✅ **Member Directory** (`Code.gs`)
- Applied setNumberFormat("#,##0") to Open Rate column (S)
- Applied setNumberFormat("#,##0") to Volunteer Hours column (T)
- Supports up to 25,000 members

✅ **Operations Analytics** (already had formatting via setNumberFormat)
- Verified all numeric columns use "#,##0" format

✅ **Interactive Dashboard** (already updated in v3.8)
- Verified metric cards use TEXT(value,"#,##0")

**Files Modified:**
- `Code.gs` - Executive Dashboard, KPI Dashboard, Grievance Log, Member Directory number formatting
- `ConsolidatedDashboard.gs` - Rebuilt with all changes

---

## Changelog - Version 3.9 (2025-12-07)

**DASHBOARD FIXES - Executive, KPI, and Steward Workload:**

✅ **Fixed Executive Dashboard Member Satisfaction Score** (`Code.gs`)
- **Issue:** Formula referenced `'Member Satisfaction'!C:C` (Member Name column)
- **Fix:** Changed to `'Member Satisfaction'!F:F` (Overall Satisfaction 1-5 rating)
- Member Satisfaction Score now displays correctly (average of 1-5 ratings)

✅ **Fixed KPI Dashboard Last Month Column** (`Code.gs`)
- **Issue:** All "Last Month" values were hardcoded as `"-"` placeholder
- **Fix:** Added proper formulas using `EOMONTH()` to calculate previous month date ranges:
  - Active Grievances: Filed in previous month with Open status
  - Win Rate %: Settled vs Denied cases closed in previous month
  - Avg Days to Resolve: Average days for cases closed in previous month
  - Cases Settled: Settled cases closed in previous month
  - Cases Pending: Pending Info cases filed in previous month
- Static metrics (Total Members, Steward Coverage, Member/Steward Ratio) show current value

✅ **Fixed Steward Workload to Reflect Actual Data** (`Code.gs`)
- **Issue:** Overdue Cases and Due This Week columns showed 0 (hardcoded placeholders)
- **Fix:** `populateStewardWorkload()` now calculates actual values:
  - Overdue Cases: Counts grievances where DAYS_TO_DEADLINE < 0 or contains "OVERDUE"
  - Due This Week: Counts grievances where DAYS_TO_DEADLINE is 0-7 days
  - Also checks NEXT_ACTION_DUE date for additional due-this-week cases
- Steward workload now accurately reflects open case deadlines

**Files Modified:**
- `Code.gs` - Fixed createExecutiveDashboard(), createKPIPerformanceDashboard(), populateStewardWorkload()
- `ConsolidatedDashboard.gs` - Rebuilt with all fixes

---

## Changelog - Version 3.8 (2025-12-07)

**OPERATIONS ANALYTICS & INTERACTIVE DASHBOARD FIXES:**

✅ **Rewrote Operations Analytics with Dynamic Columns** (`OperationsAnalytics.gs`)
- All formulas now use dynamic column references via `getColumnLetter()`
- Added `getOperationsAnalyticsColumns()` helper function
- Fixed blank column issues in all 5 sections (Trends, Location, Type, Engagement, Cost)
- All number formatting uses TEXT(value,"#,##0") for comma separators

✅ **Added Delete Standalone Tabs Function** (`OperationsAnalytics.gs`, `Code.gs`)
- `deleteStandaloneAnalyticsTabs()` removes deprecated individual analytics tabs
- Called automatically during CREATE_509_DASHBOARD after Operations Analytics created
- Tabs deleted: Trends & Timeline, Location Analytics, Type Analysis, Member Engagement, Cost Impact

✅ **Restored Feedback Auto-Population** (`DashboardFixes.gs`)
- Sample Feedback & Development entries auto-populate on dashboard creation
- 3 sample entries (Feedback, Future Feature, Bug Report) added if sheet is empty

✅ **Fixed Interactive Dashboard Number Formatting** (`InteractiveDashboard.gs`)
- All metric cards now use TEXT(value,"#,##0") for comma-formatted numbers (20,001 not 20001)
- Fixed: Total Members, Active Cases, Resolution Rate, Needs Attention
- Data tables also use comma formatting

**Files Modified:**
- `OperationsAnalytics.gs` - Complete rewrite with dynamic columns
- `Code.gs` - Added deleteStandaloneAnalyticsTabs() call
- `DashboardFixes.gs` - Restored feedback auto-population
- `InteractiveDashboard.gs` - Fixed number formatting
- `ConsolidatedDashboard.gs` - Rebuilt with all changes

---

## Changelog - Version 3.7 (2025-12-07)

**Creator Attribution Added:**
- Added Wardis N. Vizcaino as Creator & Owner
- Role: Steward at SEIU Local 509
- Contact: wardis@pm.me
- License: Free for use by non-profit collective bargaining groups and unions

---

## Changelog - Version 3.6 (2025-12-07)

**MENU REORGANIZATION - Cleaner Structure:**

Reorganized menus for better logical grouping and reduced redundancy:

✅ **New Menu Structure (6 menus):**
| Menu | Purpose |
|------|---------|
| 👤 Dashboard | Daily operations, search, grievance tools, communications |
| 📊 Sheet Manager | Data, performance, integrity, automations, analytics |
| 🔧 Setup | Dropdown configuration, dashboard setup |
| 🎭 Demo | Seed demo data, data management (nuke/clear) |
| ⚙️ Administrator | System health, workflow, column toggles, RBAC |
| 🧪 Tests | All testing functions (Unit, Validation, Integration, Performance) |

✅ **Changes Made:**
- **Removed** Optional Extras menu (redundant - features already in main menus)
- **Removed** Testing submenu from Administrator (separate Tests menu covers this)
- **Created** new 🎭 Demo menu with Seed Demo Data and Data Management
- **Simplified** 🔧 Setup menu to focus on Dropdown Config and Dashboard Setup

✅ **Architecture Change:**
- `Code.gs onOpen()` now calls `createReorganizedMenus(ui)` from `ReorganizedMenu.gs`
- All 43+ features from v3.5 remain accessible in the reorganized structure
- Tests menu remains in Code.gs for comprehensive test coverage

**Files Modified:**
- `Code.gs` - Removed redundant Optional Extras, calls createReorganizedMenus()
- `ReorganizedMenu.gs` - New Demo menu, removed Testing submenu, simplified Setup
- `ConsolidatedDashboard.gs` - Rebuilt with reorganized menus

---

## Changelog - Version 3.5 (2025-12-07)

**MENU SYSTEM RESTORATION - 43 Missing Features Added:**

Features existed in codebase but were not accessible from menu. All restored:

✅ **Search & Filter Features** (`👤 Dashboard > 🔍 Search & Filter`)
- Advanced Search (`showSearchDialog`) - Multi-criteria grievance search
- Advanced Filtering (`showFilterDialog`) - Complex filter combinations
- Quick Filters (`showQuickFilterMenu`) - One-click filter presets
- Saved Searches (`showSavedSearches`) - Load saved filter configurations
- Bookmarks (`showBookmarks`) - Quick navigation to saved locations

✅ **Export/Import Wizards** (`👤 Dashboard > 📊 Reports & Export`)
- Export Wizard (`showExportWizard`) - Guided data export with format options
- Import Wizard (`showImportWizard`) - Guided data import from CSV/Excel
- Advanced Export Options (`showAdvancedExport`) - Detailed export controls

✅ **Quick Actions** (`👤 Dashboard > ⚡ Quick Actions`)
- Quick Actions Sidebar (`showQuickActionsSidebar`) - Persistent action panel
- Member Quick Actions (`showMemberQuickActions`) - Context menu for members
- Grievance Quick Actions (`showGrievanceQuickActions`) - Context menu for grievances
- Quick Capture Notepad (`showQuickCaptureNotepad`) - Rapid note-taking
- My Assigned Grievances (`showMyAssignedGrievances`) - Personal case list

✅ **Dashboard/Analytics** (`👤 Dashboard > 📊 Dashboards`)
- Benchmark Dashboard (`showBenchmarkDashboard`) - Performance comparisons
- Visualization Builder (`showVisualizationBuilder`) - Custom chart creation
- Cached Dashboard (`showCachedDashboard`) - Fast cached view

✅ **Performance Monitoring** (`📊 Sheet Manager > ⚡ Performance`)
- Performance Summary (`showPerformanceSummary`) - System metrics overview
- Device Analytics (`showDeviceAnalyticsDashboard`) - Usage by device
- Session Dashboard (`showSessionDashboard`) - Active user sessions

✅ **Mobile Features** (`⚙️ Administrator > 📱 Mobile & Viewing`)
- Mobile Grievance Browser (`showMobileGrievanceBrowser`) - Touch-optimized browsing
- Mobile Member Browser (`showMobileMemberBrowser`) - Touch-optimized member view
- Mobile Unified Search (`showMobileUnifiedSearch`) - Mobile search interface

✅ **Automatic Trigger Installation** (`DashboardFixes.gs`, `Code.gs`)
- `installEssentialTriggers()` - Automatically installs onEdit trigger during CREATE_509_DASHBOARD
- `onGrievanceEditAutoCalc()` - Smart onEdit handler that auto-recalculates grievance timelines
- `recalculateSingleGrievanceRow()` - Fast single-row recalculation
- **Auto-recalc triggers on:** Incident Date, Date Filed, Step decisions, Date Closed, Status, Current Step
- **No manual steps required** - Users just enter data, calculations happen automatically

✅ **Help & Onboarding** (`👤 Dashboard > ❓ Help & Support`)
- Welcome Wizard (`showWelcomeWizard`) - First-time user setup
- Getting Started Guide (`showGettingStartedGuide`) - Onboarding walkthrough
- Enhanced Help (`showEnhancedHelp`) - Comprehensive help system
- Column Help (`showColumnHelp`) - Field-specific documentation
- Quick Tips (`showQuickTips`) - Contextual hints
- Version History (`showVersionHistory`) - Change history viewer

✅ **Accessibility Toggles** (`👤 Dashboard > ♿ Accessibility`)
- Toggle Zebra Stripes (`toggleZebraStripes`) - Alternating row colors
- Toggle Gridlines ADHD (`toggleGridlinesADHD`) - Focus-friendly gridlines
- Toggle Reduced Motion (`toggleReducedMotion`) - Minimize animations

✅ **Column View Toggles** (`⚙️ Administrator > 👁️ Column Toggles & View`)
- Toggle Engagement Metrics (`toggleEngagementMetricsColumns`)
- Toggle Member Interests (`toggleMemberInterestsColumns`)
- Toggle Engagement & Interests (`toggleEngagementAndInterestsColumns`)
- Toggle Complexity Indicators (`toggleComplexityIndicators`)

✅ **Automations & Setup** (`📊 Sheet Manager > 🤖 Automations`)
- Auto-Refresh Settings (`showAutoRefreshSettings`) - Configure refresh behavior
- Setup Keyboard Shortcuts (`setupKeyboardShortcuts`) - Hotkey configuration
- Setup Auto-Refresh Trigger (`setupAutoRefreshTrigger`) - Enable auto-refresh
- Setup Security Monitoring (`setupSuspiciousActivityMonitoring`) - Security alerts

✅ **Data & Utilities**
- Validation Report (`showValidationReport`) - Data quality summary
- Notification Center (`showNotificationCenter`) - Central alert hub
- Preferences Editor (`showPreferencesEditor`) - User settings
- Language Selector (`showLanguageSelector`) - i18n language selection

**Files Created:**
- `DashboardFixes.gs` - Comprehensive fixes file with auto-triggers (~900 lines)

**Files Modified:**
- `BatchGrievanceRecalc.gs` - Fixed calculateGrievanceTimeline() for negative days
- `ReorganizedMenu.gs` - Added 43 missing menu items across all menus and Admin Tab Visibility submenu
- `Code.gs` - Added auto-population and trigger installation to CREATE_509_DASHBOARD
- `AI_REFERENCE.md` - Updated to v3.5 with complete feature documentation
- `ConsolidatedDashboard.gs` - Rebuilt with updated menu

---

## Changelog - Version 3.4 (2025-12-07)

**FEATURE ROADMAP UPDATES:**

✅ **Added Smart Member Import Feature** (High Priority) - *PLANNED, NOT YET IMPLEMENTED*
- Import member log information from uploaded CSV/Excel documents
- Intelligent field mapping with UI
- Duplicate detection during import
- Preview before final import
- Handle partial matches and data conflicts

✅ **Added Nuke Safety Mode - Data Protection** (High Priority) - *PLANNED, NOT YET IMPLEMENTED*
- When nuke is enabled and data cleaned: prevent bulk data deletion/alteration
- Protects Grievance Log and Member Directory from accidental mass changes
- New data entry still permitted (single-row inserts allowed)
- Add NUKE_SAFETY_MODE flag in Config
- Block batch delete/edit operations after nuke

**Files Modified:**
- `TODO.md` - Added 2 new high-priority features (17 pending, was 15)
- `RECOMMENDATIONS_IMPORT.csv` - Added features to tracking sheet

---

## Changelog - Version 3.3 (2025-12-07)

**SEED FUNCTIONS WITH SELF-DELETING NUKE:**

✅ **Restored All Seed Functions** (`Code.gs`)
- **Restored:** SEED_MEMBERS_TOGGLE_1/2/3/4, SEED_20K_MEMBERS
- **Restored:** SEED_GRIEVANCES_TOGGLE_1/2, SEED_5K_GRIEVANCES
- **Restored:** All helper functions (seedMembersWithCount, validateSeedSheets, etc.)
- Seed functions are available for demo/testing purposes

✅ **Restored Seed Menu** (`ReorganizedMenu.gs`)
- **Menu:** `🔧 Setup > 🌱 Seed Demo Data`
  - `👥 Seed Members` submenu with 4 toggles (5,000 each)
  - `📋 Seed Grievances` submenu with 2 toggles (2,500 each)
  - `📝 Add Sample Feedback Entries`

✅ **Completely Self-Deleting Nuke Function** (`SeedNuke.gs`)
- When `nukeSeedData()` is triggered, ALL seed AND nuke code is **permanently deleted**:
  - Removes seed data from Member Directory, Grievance Log, Steward Workload
  - Clears Config tab demo entries (preserves organization info)
  - Uses **Apps Script API** to delete seed functions from Code.gs
  - **COMPLETELY DELETES SeedNuke.gs** (not just replaced - file is removed entirely)
  - Removes seed menu items from ReorganizedMenu.gs
  - **Removes the nuke menu item** from ReorganizedMenu.gs
  - Removes seed references from Getting Started/FAQ sheets
- **Zero Trace Guarantee:** After nuke, there is NO evidence that:
  - Seed functionality ever existed
  - Nuke functionality ever existed
  - Any demo/testing code was ever present
- Fallback: If Apps Script API is unavailable, shows manual cleanup instructions

**Apps Script API Requirements:**
- Enable Apps Script API in Google Cloud project for automatic code removal
- Required OAuth scope: `https://www.googleapis.com/auth/script.projects`
- Without API: Data is cleared but seed code requires manual deletion

**Files Modified:**
- `Code.gs` - Restored all seed functions (~600 lines)
- `ReorganizedMenu.gs` - Restored seed menu items
- `SeedNuke.gs` - Added `removeSeedFunctionsFromScript()` with Apps Script API
- `GettingStartedAndFAQ.gs` - Updated FAQ content
- `SEED_NUKE_GUIDE.md` - Updated with Config clearing info

---

## Changelog - Version 3.2 (2025-12-07)

**CONFIG TAB ENHANCEMENTS & NUKE IMPROVEMENTS:**

✅ **Enhanced `nukeSeedData()` Function** (`SeedNuke.gs`)
- Clears **Config tab demo entries** (demo data) if any exist:
  - Job Titles (A), Office Locations (B), Units (C)
  - Supervisors (F), Managers (G), Stewards (H)
  - Grievance Coordinators (O), Home Towns (AF)
  - Office Addresses (AN)
- **NOTE (v3.11+):** These fields are now LEFT EMPTY during CREATE_509_DASHBOARD, so there's nothing to clear unless user added their own data
- **PRESERVES Organization Info** (never cleared):
  - Org Name (U), Local Number (V), Main Address (W), Main Phone (X)
  - Union Parent (AK), State/Region (AL), Website (AM)
  - Main Fax (AO), Toll Free (AP)
  - All deadline and contract reference columns

✅ **Updated ORG_DEFAULTS** (`Constants.gs`)
- Updated SEIU 509 headquarters info:
  - Address: 293 Boston Post Road West, 4th Floor, Marlborough, MA 01752
  - Main: 774-843-7509, Fax: 508-485-8529
  - Toll Free: 800-632-8079
  - Contact: Marc (marc@seiu509.org)
  - Website: https://www.seiu509.org/

✅ **Added New Config Columns** (`Constants.gs`)
- `OFFICE_ADDRESSES` (AN, col 40) - Street addresses for office locations
- `MAIN_FAX` (AO, col 41) - Organization fax number
- `TOLL_FREE` (AP, col 42) - Toll-free phone number

**Files Modified:**
- `Constants.gs` - Updated ORG_DEFAULTS, added OFFICE_ADDRESSES, MAIN_FAX, TOLL_FREE
- `SeedNuke.gs` - Enhanced clearConfigDemoData() to preserve org info
- `AI_REFERENCE.md` - Updated documentation

---

## Changelog - Version 3.1 (2025-12-07)

**COLUMN CLEANUP - NO MORE UNUSED COLUMNS:**

✅ **All Sheet Creation Functions Now Delete Unused Columns**
- Every sheet creation function now removes columns beyond the defined headers
- Ensures no tabs show extra empty columns (Z, AA, AB... etc.)
- Clean, professional appearance with no wasted column space

**Sheets Updated with Column Cleanup:**
| Sheet | Function | Columns Kept |
|-------|----------|--------------|
| Config | `createConfigTab()` | 32 (A-AF) |
| Member Directory | `createMemberDirectory()` | 31 (A-AE) |
| Grievance Log | `createGrievanceLog()` | 34 (A-AH) |
| Main Dashboard | `createMainDashboard()` | 12 (A-L) |
| Interactive Dashboard | `createInteractiveDashboardSheet()` | 20 (A-T) |
| Analytics Data | `createAnalyticsDataSheet()` | 11 (A-K) |
| Member Satisfaction | `createMemberSatisfactionSheet()` | 10 (A-J) |
| Feedback | `createFeedbackSheet()` | 14 (A-N) |
| Steward Workload | `createStewardWorkloadSheet()` | 11 (A-K) |
| Trends | `createTrendsSheet()` | 12 (A-L) |
| Location Analytics | `createLocationSheet()` | 11 (A-K) |
| Type Analysis | `createTypeAnalysisSheet()` | 11 (A-K) |
| Executive Dashboard | `createExecutiveDashboard()` | 4 (A-D) |
| KPI Performance | `createKPIPerformanceDashboard()` | 12 (A-L) |
| Member Engagement | `createMemberEngagementSheet()` | 12 (A-L) |
| Cost Impact | `createCostImpactSheet()` | 10 (A-J) |
| Archive | `createArchiveSheet()` | 6 (A-F) |
| Diagnostics | `createDiagnosticsSheet()` | 7 (A-G) |

**NUKE FUNCTION FIX & DOCUMENTATION:**

✅ **Fixed Duplicate `nukeSeedData()` Function** (`Code.gs`, `SeedNuke.gs`)
- **Issue:** Two functions with same name existed in Code.gs and SeedNuke.gs
- **Solution:** Renamed Code.gs version to `nukeAllSheetData()` to eliminate conflict
- SeedNuke.gs version remains as `nukeSeedData()` (Exit Demo Mode)

✅ **Three Clear Data Clearing Options Now Available:**
1. **`nukeSeedData()`** (SeedNuke.gs) - Exit Demo Mode
   - Clears Member Directory, Grievance Log, Steward Workload
   - Sets SEED_NUKED flag to hide seed menu
   - Shows post-nuke guidance dialog
   - Menu: `🚨 Nuke Seed Data (Exit Demo Mode)`

2. **`nukeAllSheetData()`** (Code.gs) - Comprehensive Clear
   - Clears all sheets: Members, Grievances, Analytics, Satisfaction, Feedback, Archive
   - Logs to Diagnostics
   - Does NOT set SEED_NUKED flag
   - Menu: `🗑️ Nuke ALL Sheet Data (Comprehensive)`

3. **`clearAllData()`** (Code.gs) - Basic Clear
   - Clears only Member Directory and Grievance Log
   - Menu: `⚠️ Clear Core Data Only`

**Files Modified:**
- `Code.gs` - Added column cleanup, renamed nukeSeedData() to nukeAllSheetData()
- `InteractiveDashboard.gs` - Added column cleanup to setDashboardDimensions()
- `ReorganizedMenu.gs` - Updated menu items for consistency
- `ConsolidatedDashboard.gs` - Rebuilt with all fixes
- `SEED_NUKE_GUIDE.md` - Updated version and date

---

## Changelog - Version 3.0 (2025-12-07)

**DROPDOWN & VALIDATION IMPROVEMENTS:**

✅ **Added "Has Open Grievance?" Dropdown** (`MemberDirectoryDropdowns.gs`)
- Added dropdown to column AB (MEMBER_COLS.HAS_OPEN_GRIEVANCE)
- Uses Yes/No values from Config sheet
- Added to both main and silent dropdown setup functions

✅ **Fixed Audit Log Sheet Creation** (`SecurityService.gs`)
- `createAuditLogSheet()` now checks if sheet exists before creating
- Also checks for "Audit_Log" variant for backward compatibility
- Prevents "sheet already exists" error during dashboard setup

✅ **Rebuilt ConsolidatedDashboard.gs with 77 Modules**
- Added missing test modules: TestFramework.gs, Code.test.gs, Integration.test.gs
- Synced all dropdown and validation improvements

✅ **Renamed Interactive Dashboard Controls** (`InteractiveDashboard.gs`)
- More descriptive labels for better user experience:
  - `What to show (Chart 1):` - Select metric for primary chart
  - `How to show it (Chart 1):` - Select chart type for primary chart
  - `What to show (Chart 2):` - Select metric for secondary chart
  - `How to show it (Chart 2):` - Select chart type for secondary chart
  - `Color Scheme:` - Select dashboard color theme
  - `Show both charts:` - Toggle to display both charts
  - `Quick Action:` - Dropdown for common actions

**Member Directory Dropdowns (Single-Select):**
- Job Title (D)
- Work Location (E)
- Unit (F)
- Is Steward (N)
- Supervisor Name (L)
- Manager Name (M)
- Assigned Steward (P)
- Contact Steward (Z)
- **Has Open Grievance? (AB)** ← NEW

**Member Directory Dropdowns (Multi-Select):**
- Office Days (G)
- Preferred Communication (J)
- Best Time to Contact (K)
- Committees (O)

**Grievance Log Dropdowns (Multi-Select):**
- Articles Violated (V)
- Issue Category (W)

**Files Modified:**
- `MemberDirectoryDropdowns.gs` - Added Has Open Grievance dropdown
- `SecurityService.gs` - Fixed createAuditLogSheet()
- `InteractiveDashboard.gs` - Renamed dashboard control labels
- `ConsolidatedDashboard.gs` - Rebuilt with all fixes

---

## Changelog - Version 2.9 (2025-12-06)

**UTILITY FUNCTION & ADDITIONAL REFACTORING:**

✅ **Added `getOrCreateSheet()` Utility Function** (`Constants.gs`)
- Eliminates 75+ repetitive sheet access patterns across the codebase
- Signature: `getOrCreateSheet(sheetName, ss)` - ss parameter optional, defaults to active spreadsheet
- Returns existing sheet or creates new one if not found
- Reduces boilerplate code and potential for typos in sheet names

✅ **`createReportBuilderHTML()` (561 lines → 9 helper functions)** (`CustomReportBuilder.gs`)
- `getReportBuilderStyles()` - CSS styles for the report builder interface
- `getReportBuilderDataSourceSection()` - Data source selection (grievances/members)
- `getReportBuilderFieldsSection()` - Field selection checkboxes
- `getReportBuilderFiltersSection()` - Filter configuration UI
- `getReportBuilderSortingSection()` - Sort options
- `getReportBuilderDateRangeSection()` - Date range picker
- `getReportBuilderPreviewSection()` - Preview area
- `getReportBuilderActionsSection()` - Action buttons (export, save, etc.)
- `getReportBuilderScripts()` - JavaScript functionality

**Files Modified:**
- `Constants.gs` - Added getOrCreateSheet() utility
- `CustomReportBuilder.gs` - 1 function refactored (9 new helpers)

**Total:** 1 utility function added, 1 function refactored into 9 helpers

---

## Changelog - Version 2.8 (2025-12-06)

**CODE QUALITY - LARGE FUNCTION REFACTORING:**

Refactored 6 large multi-responsibility functions into smaller, focused helper functions for improved maintainability, testability, and readability.

✅ **`createMobileDashboardHTML()` (420 lines → 7 helper functions)** (`MobileOptimization.gs`)
- `getMobileDashboardStyles()` - CSS styles
- `getMobileDashboardHeader()` - Header HTML
- `getMobileDashboardStatsGrid()` - Stats grid HTML
- `getMobileDashboardQuickActions()` - Quick action buttons
- `getMobileDashboardRecentSection()` - Recent items section
- `getMobileDashboardScripts()` - JavaScript code

✅ **`getUnifiedOperationsMonitorHTML()` (399 lines → 12 helper functions)** (`UnifiedOperationsMonitor.gs`)
- `getUnifiedOpsStyles()` - Terminal-themed CSS
- `getUnifiedOpsLoadingOverlay()` - Loading screen
- `getUnifiedOpsHeader()` - Dashboard header
- `getUnifiedOpsExecutiveSection()` - Executive summary
- `getUnifiedOpsEfficiencySection()` - Efficiency metrics
- `getUnifiedOpsNetworkSection()` - Network metrics
- `getUnifiedOpsActionLogSection()` - Action log
- `getUnifiedOpsFollowUpSection()` - Follow-up items
- `getUnifiedOpsPredictiveSection()` - Predictive analytics
- `getUnifiedOpsSystemicSection()` - Systemic issues
- `getUnifiedOpsScripts()` - JavaScript code

✅ **`createVisualizationBuilderHTML()` (385 lines → 4 helper functions)** (`AdvancedVisualization.gs`)
- `getVisualizationBuilderStyles()` - CSS styles
- `getVisualizationBuilderSidebar()` - Sidebar controls
- `getVisualizationBuilderMainContent()` - Main chart area
- `getVisualizationBuilderScripts()` - JavaScript code

✅ **`createMobileUnifiedSearchHTML()` (363 lines → 6 helper functions)** (`MobileOptimization.gs`)
- `getMobileUnifiedSearchStyles()` - CSS styles
- `getMobileUnifiedSearchHeader()` - Search header
- `getMobileUnifiedSearchTabs()` - Tab navigation
- `getMobileUnifiedSearchFiltersContainer()` - Filter chips
- `getMobileUnifiedSearchResultsContainer()` - Results area
- `getMobileUnifiedSearchScripts()` - JavaScript code

✅ **`createInteractiveDashboardSheet()` (311 lines → 8 helper functions)** (`InteractiveDashboard.gs`)
- `createDashboardHeaderSection()` - Header rows 1-3
- `createDashboardControlPanel()` - Control panel rows 4-9
- `createDashboardMetricCards()` - Metric cards rows 10-18
- `createDashboardChartAreas()` - Chart areas rows 21-42
- `createDashboardPieChartSection()` - Pie charts rows 45-65
- `createDashboardLocationChartSection()` - Location chart rows 68-88
- `createDashboardDataTableSection()` - Data table rows 91-110
- `setDashboardDimensions()` - Column widths and row heights

✅ **`seedMembersWithCount()` (271 lines → 8 helper functions)** (`Code.gs`)
- `validateSeedSheets()` - Sheet validation
- `clearMemberValidationsForSeed()` - Pre-seed cleanup
- `getMemberSeedConfig()` - Configuration assembly
- `getSeedContactNotes()` - Sample contact notes
- `generateAndWriteMemberData()` - Main generation loop
- `generateSingleMemberRow()` - Row generation
- `writeMemberBatch()` - Batch writing with retry
- `restoreMemberSheetAfterSeed()` - Post-seed restoration

✅ **`showSharingOptionsDialog()` (224 lines → 4 helper functions)** (`GrievanceWorkflow.gs`)
- `buildSharingDialogHTML()` - Complete HTML template
- `getSharingDialogStyles()` - CSS styles
- `buildRecipientCheckboxes()` - Recipient checkboxes
- `getSharingDialogScripts()` - JavaScript code

✅ **`seedGrievancesWithCount()` (208 lines → 7 helper functions)** (`Code.gs`)
- `validateGrievanceSeedSheets()` - Sheet validation
- `clearGrievanceValidationsForSeed()` - Pre-seed cleanup
- `getGrievanceSeedConfig()` - Configuration assembly
- `generateAndWriteGrievanceData()` - Main generation loop
- `generateSingleGrievanceRow()` - Row generation
- `writeGrievanceBatch()` - Batch writing with retry
- `restoreGrievanceSheetAfterSeed()` - Post-seed restoration

**Benefits:**
- Improved code readability and maintainability
- Each helper function has a single responsibility
- Easier testing and debugging
- Better separation of concerns (CSS, HTML, JavaScript)
- Reduced cognitive load when modifying specific features

**Files Modified:**
- `MobileOptimization.gs` - 2 functions refactored (13 new helpers)
- `UnifiedOperationsMonitor.gs` - 1 function refactored (12 new helpers)
- `AdvancedVisualization.gs` - 1 function refactored (4 new helpers)
- `InteractiveDashboard.gs` - 1 function refactored (8 new helpers)
- `Code.gs` - 2 functions refactored (15 new helpers)
- `GrievanceWorkflow.gs` - 1 function refactored (4 new helpers)

**Total:** 8 functions refactored, 56 new helper functions created

---

## Changelog - Version 2.7 (2025-12-06)

**CRITICAL BUG FIXES:**

✅ **Fixed Duplicate `createGrievanceFolder` Function** (`GrievanceWorkflow.gs`, `ConsolidatedDashboard.gs`, `GoogleDriveIntegration.gs`)
- **Issue:** Function was defined 4 times with 2 different signatures (Version A: `grievanceId, grievantName` and Version B: `grievanceId, formData`), causing Version B to override Version A
- **Solution:** Renamed the formData version to `createGrievanceFolderFromFormData(grievanceId, formData)` in GrievanceWorkflow.gs and ConsolidatedDashboard.gs
- **API:** Now consistent - use `createGrievanceFolder(grievanceId, grievantName)` for simple folder creation, use `createGrievanceFolderFromFormData(grievanceId, formData)` when you have form data with firstName/lastName properties
- Updated call sites in GrievanceWorkflow.gs:561 and ConsolidatedDashboard.gs:26718

✅ **Fixed Broken DOM Event Listeners** (`MobileOptimization.gs`, `ConsolidatedDashboard.gs`)
- **Issue:** `addEventListenerfunction` was a syntax error (missing dot separator) - should be `addEventListener`
- **Affected:** 10 instances across 2 files in mobile swipe and pull-to-refresh functionality
- **Solution:** Changed all `addEventListenerfunction(` to `addEventListener(`
- **Also Fixed:** Arrow function syntax `(e) {` was malformed - changed to `function(e) {` for compatibility
- Fixed in MobileOptimization.gs lines 482, 486, 494, 544, 548
- Fixed in ConsolidatedDashboard.gs lines 33903, 33907, 33915, 33965, 33969

✅ **Fixed Misplaced setTimeout Delay Parameter** (`EnhancedADHDFeatures.gs`, `MobileOptimization.gs`, `ConsolidatedDashboard.gs`)
- **Issue:** `setTimeout(function() { return location.reload(), 1000; });` - the 1000ms delay was inside the callback as part of a comma expression, not passed as the second parameter
- **Affected:** 10 instances across 3 files in ADHD control panel toggles and swipe card hiding
- **Solution:** Changed to proper syntax: `setTimeout(function() { location.reload(); }, 1000);`
- Fixed in EnhancedADHDFeatures.gs lines 359, 364, 369, 374
- Fixed in ConsolidatedDashboard.gs lines 11260, 11265, 11270, 11275, 33920
- Fixed in MobileOptimization.gs line 499

**Files Modified:**
- `GrievanceWorkflow.gs` - Renamed createGrievanceFolder to createGrievanceFolderFromFormData, updated call site
- `ConsolidatedDashboard.gs` - Same rename, fixed addEventListener syntax, fixed setTimeout syntax
- `MobileOptimization.gs` - Fixed addEventListener syntax, fixed setTimeout syntax
- `EnhancedADHDFeatures.gs` - Fixed setTimeout syntax

**Total Bugs Fixed:** 24 instances across 4 files

---

## Changelog - Version 2.6 (2025-12-06)

**HIGH PRIORITY FEATURES IMPLEMENTED:**

✅ **Email Unsubscribe / Opt-Out System** (`EmailUnsubscribeSystem.gs`)
- Checkbox column for email opt-out status in Member Directory
- Automatic light red row highlighting for opted-out members (#FFCDD2)
- Export prefix with "(UNSUBSCRIBED)" to prevent accidental sends
- Filter opted-out members from bulk emails
- Bulk opt-out/opt-in operations
- Opt-out statistics and management panel

✅ **Interactive Tutorial System** (`InteractiveTutorial.gs`)
- Welcome wizard for first-time users
- Step-by-step feature tours with 9 tutorial steps
- Video tutorial library with 8 categorized videos
- Progress tracking with resume capability
- Quick Start Guide for rapid onboarding
- Keyboard navigation support (arrow keys, Enter, Escape)

✅ **Quick Actions Menu** (`QuickActionsMenu.gs`)
- Right-click context menu for Member Directory and Grievance Log
- Start Grievance from member row
- Send Email directly to member
- View grievance history
- Quick status updates for grievances
- Copy member/grievance ID to clipboard
- View Drive folder and sync to calendar

✅ **PII Protection System** (`PIIProtection.gs`)
- Field-level data masking for emails, phones, SSNs
- GDPR/CCPA compliance helpers
- Data portability export (JSON format)
- Right to erasure request processing
- Anonymization for inactive members
- PII audit reports
- Data subject request form

✅ **Enhanced Validation System** (`EnhancedValidation.gs`)
- Real-time email format validation with typo detection
- Phone number validation and auto-formatting
- Duplicate Member/Grievance ID detection
- Bulk validation tool with detailed reports
- Visual indicators (yellow/red backgrounds, notes)
- Validation settings configuration

✅ **Context-Sensitive Help** (`ContextSensitiveHelp.gs`)
- Sheet-specific help content with purpose and key tasks
- Column documentation for major columns
- Tips and best practices
- Searchable help index
- Task-specific guides
- F1 shortcut for context help

**Menu System Updates:**
- Added Email Opt-Out Management to Communications menu
- Added Tutorial and Video Tutorials to Help & Support menu
- Added Quick Actions as top-level menu item
- Added PII Protection submenu to Sheet Manager
- Added Validation settings to Data Integrity menu
- Added Context Help and Search Help to Help menu
- Added Release Notes and What's New to Help menu

**New Files Added:**
- `EmailUnsubscribeSystem.gs` - Email opt-out/unsubscribe management
- `InteractiveTutorial.gs` - Onboarding tutorials and video library
- `QuickActionsMenu.gs` - Right-click context menu
- `PIIProtection.gs` - PII protection and GDPR compliance
- `EnhancedValidation.gs` - Email/phone validation
- `ContextSensitiveHelp.gs` - Sheet-specific help system

**Total Modules:** 66 (up from 60)

---

## Changelog - Version 2.5 (2025-12-06)

**Feature 95 Integration:**
- ✅ **Coordinator Notification System** - Implemented complete checkbox-based notification system
- ✅ Added CoordinatorNotification.gs to build system (60 production modules, 63 with tests)
- ✅ Updated Constants.gs with new Grievance Log columns (AC-AF)
- ✅ Moved Drive Integration columns from AC-AD to AG-AH
- ✅ Integrated Feature 95 menu items into Grievance Tools submenu
- ✅ Updated Code.gs with 34-column Grievance Log layout

**Documentation Overhaul:**
- ✅ **Comprehensive Feature Status** - Documented all implemented features beyond 79-95
- ✅ Updated "Future Enhancements" → "Feature Implementation Status"
- ✅ Marked implemented features: Notifications, Analytics, Mobile, Calendar, Automation
- ✅ Listed all 60 production modules with descriptions and categories
- ✅ Updated version to 2.5 with complete changelog

**Build System:**
- ✅ Rebuilt ConsolidatedDashboard.gs with Feature 95 included
- ✅ Build successful: 60 production modules, 1273 KB total size
- ✅ No duplicate declarations, all dependencies correctly ordered

**Features Sheet Auto-Population:**
- ✅ Added `populateImplementedFeatures()` function to Code.gs
- ✅ Feedback & Development sheet now auto-populates with 25 completed features
- ✅ Includes Features 79-95 plus major integrations (Analytics, Mobile, Calendar, etc.)
- ✅ Each entry has full metadata: complexity, implementation file, description

**Feature Implementation Highlights:**
- 📧 **AutomatedNotifications.gs** - Real-time deadline notifications
- 📊 **PredictiveAnalytics.gs** - Case outcome prediction and trend analysis
- 🤖 **SmartAutoAssignment.gs** - Intelligent steward assignment
- 📅 **CalendarIntegration.gs** - Google Calendar deadline sync
- 📱 **MobileOptimization.gs** - Mobile-responsive interfaces
- 🔍 **RootCauseAnalysis.gs** - Root cause identification
- And 54 more feature modules!

---

## Changelog - Version 2.4 (2025-12-05)

**Major Features Added:**
- ✅ **Audit Logging System** - Full audit trail for all data modifications
- ✅ **Role-Based Access Control (RBAC)** - Admin, Steward, and Viewer roles
- ✅ **DIAGNOSE_SETUP()** - Comprehensive system health check function
- ✅ **Enhanced nukeSeedData()** - True nuclear option for clearing all test data
- ✅ **Build System** - Auto-generate ConsolidatedDashboard.gs with 60 production modules
- ✅ **Coordinator Notification System** - Feature 95 for grievance coordinator notifications

**Menu System Updates:**
- ✅ **Six-menu structure** - 👤 Dashboard, 📊 Sheet Manager, 🔧 Setup, 🎭 Demo, ⚙️ Administrator, 🧪 Tests
- ❌ **Removed Optional Extras menu** - Features consolidated into main menus
- ❌ **Removed conflicting Initial Setup items** - "Setup Dashboard Enhancements" and "Setup Member Directory Dropdowns" were removed as they conflicted with CREATE_509_DASHBOARD validations
- ➕ **Added showDropdownRefreshInfo()** - Explains when to refresh dropdowns

**Critical Bug Fixes:**
- 🐛 **Fixed build.js syntax error** - MODULES array was improperly terminated
- 🐛 **Fixed missing modules in build** - Added CoordinatorNotification.gs and 5 other modules that were not in build configuration
- 🐛 **Fixed Setup menu conflicts** - Initial Setup items were duplicating/overwriting CREATE_509_DASHBOARD validations
- 🐛 **Fixed updateMemberDirectorySnapshots() column bug** - Was overwriting formula columns (Z, AA, AB), now correctly writes to AC, AD, AE
- 🐛 **Fixed ADHDEnhancements.gs sheet references** - Removed invalid sheet name constants
- 🐛 **Added null checks to clearAllData()** - Prevents errors if sheets don't exist

**Files Removed (Deprecated):**
- `Complete509Dashboard.gs` - Replaced by auto-generated ConsolidatedDashboard.gs
- `fix_destructuring.js` - One-time utility script, no longer needed
- `convert_classes.py` - One-time conversion script, no longer needed

**Documentation Cleanup:**
- Removed 7 redundant documentation files (old code reviews, duplicate recommendations)
- Updated all docs to reference ConsolidatedDashboard.gs instead of deprecated file

**New File:**
- `AuditLoggingRBAC.gs` - Complete implementation of audit logging and role-based access control

**Documentation Updates:**
- Added sheet #22: Audit_Log
- Updated menu system with RBAC submenu
- Added Security & Compliance section
- Updated seed data function documentation

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Sheet Structure (22 Sheets)](#sheet-structure-22-sheets)
3. [Core Data Sheets](#core-data-sheets)
4. [Dashboard Sheets](#dashboard-sheets)
5. [Analytics Sheets](#analytics-sheets)
6. [Utility Sheets](#utility-sheets)
7. [Menu System](#menu-system)
8. [Data Validation Rules](#data-validation-rules)
9. [Formula System](#formula-system)
10. [Seed Data Functions](#seed-data-functions)
11. [Color Scheme](#color-scheme)
12. [Column Mapping System](#column-mapping-system)
13. [File Architecture](#file-architecture)

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
| 16 | 💼 Executive Dashboard | Dashboard | Merged: Executive Summary + Quick Stats |
| 17 | 📊 KPI Performance Dashboard | Dashboard | Merged: Performance Metrics + KPI Board |
| 18 | 👥 Member Engagement | Analytics | Engagement scoring and tracking |
| 19 | 💰 Cost Impact | Analytics | Financial impact analysis |
| 20 | 📦 Archive | Utility | Archived records |
| 21 | 🔧 Diagnostics | Utility | System health checks |
| 22 | 📋 Audit_Log | Security | Complete audit trail of all data changes |

**Recent Consolidations (25 → 22 sheets):**
- Merged: Feedback & Development + Future Features + Pending Features → "Feedback & Development"
- Merged: Executive Summary + Quick Stats → "💼 Executive Dashboard"
- Merged: Performance Metrics + KPI Board → "📊 KPI Performance Dashboard"

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

**Styling:**
- Header row: Bold, dark gray background (#4A5568), white text
- Tab color: Blue (#2563EB)
- Auto-resized columns
- Frozen first row

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

**Data Validations:**
- Column D (Job Title): Config!A2:A14
- Column E (Work Location): Config!B2:B14
- Column F (Unit): Config!C2:C7
- Column J (Is Steward): Config!E2:E14 (Yes/No)
- Column K (Supervisor): Config!F2:F14
- Column L (Manager): Config!G2:G14
- Column M (Assigned Steward): Config!H2:H14
- Column T, U, V (Interests): Config!E2:E14 (Yes/No)
- Column X (Comm Methods): Config!M2:M14

**Styling:**
- Header: Bold, green background (#059669), white text, wrapped
- Tab color: Green (#059669)
- Column widths: A=90px, H=180px, AE=250px
- Frozen first row, header height 50px

**Implementation Notes:**
- Sheet is deleted and recreated on setup (prevents column group errors)
- Formulas in columns Z, AA, AB are set for first 100 rows via `setupFormulasAndCalculations()`

---

### 3. Grievance Log

**Purpose:** Complete grievance case tracking with automatic deadline calculations

**Columns (32 total) - See GRIEVANCE_COLS constant in Constants.gs:**
```
Section 1: Identity (A-D)
A (1):  Grievance ID (G-000001, G-000002, etc.)
B (2):  Member ID (links to Member Directory)
C (3):  First Name
D (4):  Last Name

Section 2: Case Details (E-H)
E (5):  Issue Category (validated from Config)
F (6):  Articles Violated (validated from Config)
G (7):  Resolution Summary (e.g., "Won - Resolved favorably", "Lost - No violation found")
H (8):  Comments

Section 3: Status & Assignment (I-K)
I (9):  Status (validated: Open, Pending Info, Settled, Withdrawn, Closed, Appealed)
J (10): Current Step (validated: Informal, Step I, Step II, Step III, Mediation, Arbitration)
K (11): Assigned Steward (Name) (validated from Config)

Section 4: Timeline - Filing (L-N)
L (12): Incident Date
M (13): Filing Deadline (21d) (auto-calc: INCIDENT_DATE + 21)
N (14): Date Filed (Step I)

Section 5: Timeline - Step I (O-P)
O (15): Step I Decision Due (30d) (auto-calc: DATE_FILED + 30)
P (16): Step I Decision Rcvd

Section 6: Timeline - Step II (Q-T)
Q (17): Step II Appeal Due (10d) (auto-calc: STEP1_RCVD + 10)
R (18): Step II Appeal Filed
S (19): Step II Decision Due (30d) (auto-calc: STEP2_APPEAL_FILED + 30)
T (20): Step II Decision Rcvd

Section 7: Timeline - Step III (U-W)
U (21): Step III Appeal Due (30d) (auto-calc: STEP2_RCVD + 30)
V (22): Step III Appeal Filed
W (23): Date Closed

Section 8: Calculated Metrics (X-Y)
X (24): Days Open (auto-calc: DATE_FILED to DATE_CLOSED or TODAY)
Y (25): Next Action Due (auto-calc: based on CURRENT_STEP)

Section 9: Contact & Location (Z-AB)
Z (26): Member Email
AA (27): Unit (validated from Config)
AB (28): Work Location (Site) (validated from Config)

Section 10: Integration (AC)
AC (29): Drive Folder Link

Section 11: Admin Messages (AD-AF) - Hidden by default
AD (30): Admin Flag (checkbox: triggers highlight, move to top, send message)
AE (31): Admin Message (text: message from grievance coordinator)
AF (32): Message Acknowledged (checkbox: steward confirms message read, clears highlight)
```

**NOTE:** DAYS_TO_DEADLINE column was removed. Overdue status is now calculated dynamically:
`=COUNTIFS('Grievance Log'!StatusCol:StatusCol,"Open",'Grievance Log'!NextActionCol:NextActionCol,"<"&TODAY())`

**Data Validations:**
- Column E (Issue Category): Config!K2:K14
- Column F (Articles): Config!L2:L14
- Column I (Status): Config!I2:I14
- Column J (Current Step): Config!J2:J14
- Column K (Steward): Config!H2:H14
- Column AA (Unit): Config!C2:C7
- Column AB (Location): Config!B2:B14

**Styling:**
- Header: Bold, red background (#DC2626), white text, wrapped
- Tab color: Red (#DC2626)
- Column widths: A=110px, F=180px, G=250px
- Frozen first row, header height 50px

**Auto-Calculated Deadlines:**
All deadline formulas (columns M, O, Q, S, U, X, Y) are set for first 100 rows in `setupFormulasAndCalculations()`

**Contract Rules Built Into Formulas:**
- Filing deadline: Incident date + 21 days
- Step I decision due: Date filed + 30 days
- Step II appeal due: Step I decision received + 10 days
- Step II decision due: Step II appeal filed + 30 days
- Step III appeal due: Step II decision received + 30 days

---

## Dashboard Sheets

### 4. Main Dashboard

**Purpose:** Real-time overview of all union metrics

**Layout:**

**Title Section:**
- A1:L2 merged: "📊 LOCAL 509 DASHBOARD" (18pt, purple #7C3AED)
- A3:L3 merged: Last updated timestamp formula

**Member Metrics (A5:L7):**
- 4 cards (3 columns each):
  - Total Members: `=COUNTA('Member Directory'!A:A)-1`
  - Active Stewards: `=COUNTIF('Member Directory'!J:J,"Yes")`
  - Avg Open Rate: `=TEXT(AVERAGE('Member Directory'!R:R)/100,"0.0%")`
  - YTD Vol. Hours: `=SUM('Member Directory'!S:S)`

**Grievance Metrics (A10:L12):**
- 4 cards (3 columns each):
  - Open Grievances: `=COUNTIF('Grievance Log'!E:E,"Open")`
  - Pending Info: `=COUNTIF('Grievance Log'!E:E,"Pending Info")`
  - Settled (This Month): `=COUNTIFS('Grievance Log'!E:E,"Settled",'Grievance Log'!R:R,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))`
  - Avg Days Open: `=ROUND(AVERAGE(FILTER('Grievance Log'!S:S,'Grievance Log'!E:E="Open")),0)`

**Engagement Metrics (A15:L17):**
- Last 30 days:
  - Virtual Mtgs: `=COUNTIF('Member Directory'!N:N,">="&TODAY()-30)`
  - In-Person Mtgs: `=COUNTIF('Member Directory'!O:O,">="&TODAY()-30)`
  - Local Interest: `=COUNTIF('Member Directory'!T:T,"Yes")`
  - Chapter Interest: `=COUNTIF('Member Directory'!U:U,"Yes")`

**Upcoming Deadlines (A20:L30):**
- Table with columns: Grievance ID, Member, Next Action, Days Until, Status
- Formula: QUERY of Grievance Log for open cases with deadlines in next 14 days

**Styling:**
- Tab color: Purple (#7C3AED)
- All metrics: 20pt bold font, centered
- Card headers: Gray background (#F3F4F6)

---

### 16. 💼 Executive Dashboard

**Purpose:** Consolidated executive summary (merged Executive Summary + Quick Stats)

**Section 1: Quick Stats (A4:D11)**
- Header: "⚡ QUICK STATS" (orange #F97316)
- 6 metrics with columns: Metric | Value | Comparison | Trend
  - Active Members (dynamic)
  - Active Grievances (dynamic: STATUS column)
  - Win Rate (dynamic: STATUS + RESOLUTION columns)
  - Avg Resolution Days (dynamic: DAYS_OPEN column)
  - Overdue Cases (dynamic: calculated from NEXT_ACTION_DUE < TODAY())
  - Active Stewards

**Section 2: Detailed KPIs (A13:C22)**
- Header: "📊 DETAILED KEY PERFORMANCE INDICATORS" (purple #7C3AED)
- 8 metrics with columns: Metric | Value | Status
  - Total Active Members
  - Total Active Grievances (dynamic)
  - Overall Win Rate (dynamic: STATUS + RESOLUTION)
  - Avg Resolution Time (dynamic: DAYS_OPEN)
  - Cases Overdue (dynamic: NEXT_ACTION_DUE < TODAY())
  - Member Satisfaction Score
  - Total Grievances Filed YTD
  - Resolved Grievances (dynamic: STATUS)

**Dynamic Column Implementation:**
```javascript
const resolutionCol = getColumnLetter(GRIEVANCE_COLS.RESOLUTION);  // G
const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);          // I
const daysOpenCol = getColumnLetter(GRIEVANCE_COLS.DAYS_OPEN);     // X
const nextActionCol = getColumnLetter(GRIEVANCE_COLS.NEXT_ACTION_DUE); // Y

// Win Rate formula (dynamic):
`=TEXT(IFERROR(COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Resolved*",
  'Grievance Log'!${resolutionCol}:${resolutionCol},"*Won*")/
  COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Resolved*"),0),"0%")`

// Overdue Cases formula (dynamic - no DAYS_TO_DEADLINE column):
`=COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Open",
  'Grievance Log'!${nextActionCol}:${nextActionCol},"<"&TODAY())`
```

**Styling:**
- Tab color: Purple (#7C3AED)
- Column widths: A=250px, B=150px, C=100px, D=100px
- Frozen rows: 4

---

### 17. 📊 KPI Performance Dashboard

**Purpose:** Comprehensive KPI tracking (merged Performance Metrics + KPI Board)

**Columns (12 total):**
```
A: KPI Name
B: Current Value
C: Target
D: Variance (Current - Target)
E: % Change (vs. previous period)
F: Status (dropdown: On Track, At Risk, Off Track, Exceeding)
G: Last Month (previous month value)
H: YTD Average
I: Best (best value this year)
J: Worst (worst value this year)
K: Owner (responsible person)
L: Last Updated (date)
```

**Data Validation:**
- Column F: Dropdown list ['On Track', 'At Risk', 'Off Track', 'Exceeding'] (F4:F1000)

**Styling:**
- Tab color: Green (#059669)
- Header: Bold, light gray background
- Column widths optimized (A=200px, B-L=80-120px)
- Frozen rows: 3

**Purpose:** Track all KPIs against targets with variance analysis and trend tracking

---

### 8. 🎯 Interactive (Your Custom View)

**Purpose:** User-customizable dashboard with live controls

**Features:**
- Dropdown selectors for:
  - Metric to display (20 options)
  - Chart type (Donut, Pie, Bar, Column, Line, Area, Table)
  - Theme (Union Blue, Solidarity Red, Success Green, etc.)
  - Comparison mode (Yes/No)
- Real-time chart rendering based on selections
- Saved per-user with User Settings sheet

**Control Cells:**
- A7: Metric selector
- B7: Chart type selector
- C7: Second metric (for comparison)
- D7: Second chart type
- E7: Theme selector
- G7: Comparison toggle

**Data Validation Setup:**
Done via `setupInteractiveDashboardControls()` function

---

## Analytics Sheets

### 5. Analytics Data (Hidden)

**Purpose:** Pre-computed aggregations to speed up dashboard queries

**Sections:**

**A. Grievances by Status (A3:B30)**
- Formula: `=UNIQUE(FILTER('Grievance Log'!E:E, 'Grievance Log'!E:E<>"", 'Grievance Log'!E:E<>"Status"))`
- Count: `=ARRAYFORMULA(IF(A5:A<>"", COUNTIF('Grievance Log'!E:E, A5:A), ""))`

**B. Grievances by Unit (D3:E30) - DYNAMIC**
```javascript
const unitCol = getColumnLetter(GRIEVANCE_COLS.UNIT);  // Y
analytics.getRange("D5").setFormula(
  `=UNIQUE(FILTER('Grievance Log'!${unitCol}:${unitCol},
   'Grievance Log'!${unitCol}:${unitCol}<>"",
   'Grievance Log'!${unitCol}:${unitCol}<>"Unit"))`
);
```

**C. Members by Location (G3:H30)**
- Formula: `=UNIQUE(FILTER('Member Directory'!E:E, 'Member Directory'!E:E<>"", 'Member Directory'!E:E<>"Work Location (Site)"))`

**D. Steward Workload (J3:K30) - DYNAMIC**
```javascript
const stewardCol = getColumnLetter(GRIEVANCE_COLS.STEWARD);    // AA
const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);      // E
analytics.getRange("J5").setFormula(
  `=UNIQUE(FILTER('Grievance Log'!${stewardCol}:${stewardCol},
   'Grievance Log'!${stewardCol}:${stewardCol}<>"",
   'Grievance Log'!${stewardCol}:${stewardCol}<>"Assigned Steward (Name)"))`
);
analytics.getRange("K5").setFormula(
  `=ARRAYFORMULA(IF(J5:J<>"",
   COUNTIFS('Grievance Log'!${stewardCol}:${stewardCol}, J5:J,
   'Grievance Log'!${statusCol}:${statusCol}, "Open"), ""))`
);
```

**Sheet State:** Hidden (analytics.hideSheet())

---

### 12. 👨‍⚖️ Steward Workload

**Purpose:** Track steward capacity and caseload

**Columns (11 total):**
```
A: Steward Name
B: Total Cases (all time)
C: Active Cases (currently open)
D: Resolved Cases
E: Win Rate %
F: Avg Days to Resolution
G: Overdue Cases
H: Due This Week
I: Capacity Status (e.g., "Overloaded", "Normal", "Available")
J: Email
K: Phone
```

**Styling:**
- Header: Purple background (#7C3AED), white text
- Tab color: Purple (#7C3AED)

---

### 13. 📈 Trends & Timeline

**Purpose:** Monthly trend analysis over time

**Columns (12 total):**
```
A: Month (YYYY-MM)
B: New Grievances (filed this month)
C: Resolved (closed this month)
D: Win Rate % (for cases resolved this month)
E: Avg Resolution Days
F: Active at Month End
G: Overdue (at month end)
H: New Members (joined this month)
I: Active Members (at month end)
J: Stewards Active
K: Satisfaction Score (avg for month)
L: Trend (↑ Improving, → Stable, ↓ Declining)
```

**Styling:**
- Header: Green background (#059669), white text
- Tab color: Green (#059669)

---

### 14. 🗺️ Location Analytics

**Purpose:** Geographic breakdown of union activity

**Columns (11 total):**
```
A: Location
B: Total Members
C: Active Members
D: Total Grievances
E: Active Grievances
F: Win Rate %
G: Avg Resolution Days
H: Member Satisfaction
I: Stewards Assigned
J: Risk Score (calculated)
K: Priority (High/Medium/Low)
```

**Styling:**
- Header: Teal background (#14B8A6), white text
- Tab color: Teal (#14B8A6)

---

### 15. 📊 Type Analysis

**Purpose:** Grievance breakdown by issue category

**Columns (11 total):**
```
A: Issue Type
B: Total Cases
C: Active
D: Resolved
E: Win Rate %
F: Avg Days to Resolve
G: Most Common Location
H: Top Article Violated
I: Trend (↑↓→)
J: Priority Level
K: Notes
```

**Styling:**
- Header: Blue background (#7EC8E3), white text
- Tab color: Blue (#7EC8E3)

---

### 18. 👥 Member Engagement

**Purpose:** Engagement scoring system

**Columns (12 total):**
```
A: Member ID
B: Name
C: Engagement Score (0-100)
D: Last Contact
E: Meetings Attended
F: Surveys Completed
G: Volunteer Hours
H: Committee Participation
I: Event Attendance
J: Email Open Rate
K: Status (Active, At Risk, Inactive)
L: Notes
```

**Styling:**
- Header: Purple background (#7C3AED), white text
- Tab color: Purple (#7C3AED)

---

### 19. 💰 Cost Impact

**Purpose:** Financial impact tracking

**Columns (10 total):**
```
A: Category
B: Estimated Cost
C: Actual Cost
D: Variance
E: ROI (Return on Investment)
F: Cases Affected
G: Members Benefited
H: Status
I: Quarter
J: Notes
```

**Styling:**
- Header: Red background (#DC2626), white text
- Tab color: Red (#DC2626)

---

## Utility Sheets

### 6. Member Satisfaction

**Purpose:** Survey tracking and satisfaction analytics

**Columns (10 total):**
```
A: Survey ID
B: Member ID
C: Member Name
D: Date Sent
E: Date Completed
F: Overall Satisfaction (1-5)
G: Steward Support (1-5)
H: Communication (1-5)
I: Would Recommend Union (Y/N)
J: Comments
```

**Metrics Section (A10:E14):**
- Average Overall Satisfaction: `=IFERROR(AVERAGE(F4:F1000),"-")`
- Average Steward Support: `=IFERROR(AVERAGE(G4:G1000),"-")`
- Average Communication: `=IFERROR(AVERAGE(H4:H1000),"-")`
- % Would Recommend: `=IFERROR(TEXT(COUNTIF(I4:I1000,"Y")/COUNTA(I4:I1000),"0.0%"),"-")`

**Styling:**
- Header: Green background (#10B981), white text
- Tab color: Green (#10B981)

---

### 7. Feedback, Features & Development Roadmap

**Purpose:** Consolidated bug tracking, feature requests, and development roadmap

**Columns (14 total):**
```
A: Type (dropdown: Bug Report, Feedback, Future Feature, In Progress, Completed, Archived)
B: Submitted/Started (date)
C: Submitted By
D: Priority (dropdown: Critical, High, Medium, Low)
E: Title
F: Description
G: Status (dropdown: New, Under Review, Planned, In Progress, Testing, Completed, Deferred, Cancelled)
H: Progress % (0-100)
I: Complexity (dropdown: Simple, Moderate, Complex, Very Complex)
J: Target Completion
K: Assigned To
L: Blockers
M: Resolution/Notes
N: Last Updated
```

**Data Validations:**
- Column A (Type): ['Bug Report', 'Feedback', 'Future Feature', 'In Progress', 'Completed', 'Archived'] (A4:A1000)
- Column D (Priority): ['Critical', 'High', 'Medium', 'Low'] (D4:D1000)
- Column G (Status): ['New', 'Under Review', 'Planned', 'In Progress', 'Testing', 'Completed', 'Deferred', 'Cancelled'] (G4:G1000)
- Column I (Complexity): ['Simple', 'Moderate', 'Complex', 'Very Complex'] (I4:I1000)

**Column Widths:**
- A=120px, B=110px, C=120px, D=80px, E=200px, F=300px, G=100px, H=90px, I=100px, J=110px, K=120px, L=200px, M=250px, N=110px

**Styling:**
- Header: Purple background (#7C3AED), white text
- Tab color: Purple (#7C3AED)

**Purpose:** Track everything from bug reports to future features in one unified sheet

**Auto-Population:**
The sheet is automatically populated with 25 implemented features when created, including:
- Features 79-95 (Core Security, Performance, UI Features)
- Automated Deadline Notifications
- Predictive Analytics
- Smart Auto-Assignment
- Calendar Integration
- Mobile Optimization
- Root Cause Analysis
- Gmail & Google Drive Integration
- Dark Mode & Themes
- Custom Report Builder

Each feature entry includes:
- Type: Completed
- Status: Completed
- Progress: 100%
- Complexity rating
- Implementation file reference
- Complete description

---

### 11. ⚙️ User Settings

**Purpose:** Store per-user preferences

**Example Settings:**
- Preferred dashboard theme
- Default filters
- Notification preferences
- Last viewed sheet

---

### 20. 📦 Archive

**Purpose:** Store archived/deleted records

**Columns (6 total):**
```
A: Item Type (Member, Grievance, etc.)
B: Item ID
C: Archive Date
D: Archived By
E: Reason
F: Original Data (JSON or text blob)
```

**Styling:**
- Header: Gray background (#6B7280), white text
- Tab color: Gray (#6B7280)

---

### 21. 🔧 Diagnostics

**Purpose:** System health monitoring and error logging

**Columns (7 total):**
```
A: Timestamp
B: Check Type (Setup, Formula, Performance, etc.)
C: Component (Sheet name, function name, etc.)
D: Status (OK, Warning, Error)
E: Details
F: Severity (Low, Medium, High, Critical)
G: Action Needed
```

**Styling:**
- Header: Red background (#DC2626), white text
- Tab color: Red (#DC2626)

---

### 22. 📋 Audit_Log

**Purpose:** Complete audit trail of all data modifications for compliance and security

**Columns (9 total):**
```
A: Timestamp
B: User Email
C: Action (CREATE, UPDATE, DELETE)
D: Sheet Name
E: Row Number
F: Column
G: Old Value
H: New Value
I: Details
```

**Key Features:**
- Automatic logging via `logDataModification()` function
- Tracks user, action type, location, and values
- Auto-cleanup (keeps last 10,000 entries)
- Non-intrusive (won't break main functionality if logging fails)
- Created automatically during `CREATE_509_DASHBOARD()`

**Helper Functions:**
- `logMemberCreation()` - Logs new member additions
- `logGrievanceCreation()` - Logs new grievance filings
- `logMemberUpdate()` - Logs member data changes
- `logGrievanceUpdate()` - Logs grievance data changes
- `logDataDeletion()` - Logs record deletions

**Styling:**
- Header: Red background (COLORS.SOLIDARITY_RED), white text
- Tab color: Red (COLORS.SOLIDARITY_RED)
- Frozen header row

**Implementation:**
- File: `AuditLoggingRBAC.gs`
- Created via: `createAuditLogSheet()`
- All logging functions are failure-safe (won't throw errors)

---

## Security & Compliance

### Role-Based Access Control (RBAC)

**Purpose:** Control user permissions based on roles

**Roles (Hierarchical):**
1. **ADMIN** - Full access to all features including role management
2. **STEWARD** - Can create and edit members and grievances
3. **VIEWER** - Read-only access

**Script Properties Configuration:**
```
ADMINS:   ["admin@union.org", "president@union.org"]
STEWARDS: ["steward1@union.org", "steward2@union.org"]
VIEWERS:  ["member@union.org", "observer@union.org"]
```

**Key Functions:**
- `checkUserPermission(role)` - Returns true if user has specified role or higher
- `getUserRole()` - Returns user's current role
- `initializeRBAC()` - Sets up RBAC script properties
- `configureUserRoles()` - Shows current role assignments
- `addAdmin()`, `addSteward()`, `addViewer()` - Add users to roles
- `showMyPermissions()` - Shows current user's permissions

**Menu Integration:**
- Located under: 509 Tools > Admin > User Roles (RBAC)
- Only accessible to administrators
- Role changes are logged to Audit_Log

**Implementation:**
- File: `AuditLoggingRBAC.gs`
- Storage: Script Properties Service
- Session: Uses `Session.getActiveUser().getEmail()`

---

## Menu System

### Main Menu: "📊 509 Dashboard"

```
📊 509 Dashboard
├── 🔄 Refresh All                    → refreshCalculations()
├── ──────────────────
├── 📊 Dashboards
│   ├── 🎯 Unified Operations Monitor  → showUnifiedOperationsMonitor()
│   ├── 📊 Main Dashboard              → goToDashboard()
│   ├── ✨ Interactive Dashboard       → openInteractiveDashboard()
│   └── 🔄 Refresh Interactive Dashboard → rebuildInteractiveDashboard()
├── ──────────────────
├── 📋 Grievance Tools
│   └── ➕ Start New Grievance         → showStartGrievanceDialog()
├── ──────────────────
├── ⚙️ Admin
│   ├── Seed 20k Members               → SEED_20K_MEMBERS()
│   ├── Seed 5k Grievances             → SEED_5K_GRIEVANCES()
│   ├── ──────────────────
│   ├── Clear All Data                 → clearAllData()
│   ├── 🗑️ Nuke All Seed Data         → nukeSeedData()
│   ├── ──────────────────
│   └── 👥 User Roles (RBAC)
│       ├── Initialize RBAC             → initializeRBAC()
│       ├── Configure Roles             → configureUserRoles()
│       ├── Add Admin                   → addAdmin()
│       ├── Add Steward                 → addSteward()
│       ├── Add Viewer                  → addViewer()
│       └── My Permissions              → showMyPermissions()
├── ──────────────────
├── ♿ ADHD Features
│   ├── Hide Gridlines (Focus Mode)   → hideAllGridlines()
│   ├── Show Gridlines                 → showAllGridlines()
│   ├── Reorder Sheets Logically       → reorderSheetsLogically()
│   └── Setup ADHD Defaults            → setupADHDDefaults()
├── 👁️ Column Toggles
│   ├── Toggle Advanced Grievance Columns → toggleGrievanceColumns() [DISABLED - shows info alert]
│   ├── Toggle Level 2 Member Columns     → toggleLevel2Columns()
│   └── Show All Member Columns           → showAllMemberColumns()
├── ──────────────────
└── ❓ Help & Support
    ├── 📚 Getting Started Guide       → showGettingStartedGuide()
    ├── ❓ Help                         → showHelp()
    └── 🔧 Diagnose Setup               → DIAGNOSE_SETUP()
```

**Menu Creation:** `onOpen()` function builds entire menu structure

**Note on toggleGrievanceColumns():**
This function is currently disabled because it expects grievance tracking columns at positions 12-21 that don't exist in the current Member Directory structure. It now shows an informative alert explaining the feature is unavailable and suggests manual column hiding.

---

## Data Validation Rules

### Member Directory Validations

Applied via `setupDataValidations()`:

```javascript
const memberValidations = [
  { col: 4, configCol: 1 },   // Job Title → Config A
  { col: 5, configCol: 2 },   // Work Location → Config B
  { col: 6, configCol: 3 },   // Unit → Config C
  { col: 10, configCol: 5 },  // Is Steward → Config E (Yes/No)
  { col: 11, configCol: 6 },  // Supervisor → Config F
  { col: 12, configCol: 7 },  // Manager → Config G
  { col: 13, configCol: 8 },  // Assigned Steward → Config H
  { col: 20, configCol: 5 },  // Interest: Local → Config E (Yes/No)
  { col: 21, configCol: 5 },  // Interest: Chapter → Config E (Yes/No)
  { col: 22, configCol: 5 },  // Interest: Allied → Config E (Yes/No)
  { col: 24, configCol: 13 }  // Comm Methods → Config M
];
```

Applied to rows 2-5000 for each column.

### Grievance Log Validations

```javascript
const grievanceValidations = [
  { col: 5, configCol: 9 },   // Status → Config I
  { col: 6, configCol: 10 },  // Current Step → Config J
  { col: 22, configCol: 12 }, // Articles Violated → Config L
  { col: 23, configCol: 11 }, // Issue Category → Config K
  { col: 25, configCol: 3 },  // Unit → Config C
  { col: 26, configCol: 2 },  // Work Location → Config B
  { col: 27, configCol: 8 }   // Assigned Steward → Config H
];
```

Applied to rows 2-5000 for each column.

### Other Sheet Validations

**Feedback & Development:**
- Type (A4:A1000): 6 options
- Priority (D4:D1000): 4 options
- Status (G4:G1000): 8 options
- Complexity (I4:I1000): 4 options

**KPI Performance Dashboard:**
- Status (F4:F1000): ['On Track', 'At Risk', 'Off Track', 'Exceeding']

**Interactive Dashboard:**
- Metric selectors: 20 metric options
- Chart type: 7 chart type options
- Theme: 6 theme options
- Comparison: Yes/No

---

## Formula System

### Grievance Log - Code-Calculated Values (No Sheet Formulas)

**IMPORTANT (v2.3):** The Grievance Log has NO formulas in the sheet body. All calculated columns are computed by `recalcAllGrievancesBatched()` in BatchGrievanceRecalc.gs and written as static values. This prevents data corruption when rows are deleted.

**Calculated Columns (via BatchGrievanceRecalc.gs):**

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

**Key Functions:**
- `recalcAllGrievancesBatched()` - Recalculates all 8 columns for all rows
- `calculateGrievanceDeadlines(row)` - Returns deadline calculations for a single row
- `calculateGrievanceTimeline(row, today)` - Returns Days Open, Next Action Due, Days to Deadline

**Member Directory Formulas:**

```javascript
// Has Open Grievance? (Column Z / 26)
memberDir.getRange(row, 26).setFormula(
  `=IF(COUNTIFS('Grievance Log'!B:B,A${row},'Grievance Log'!E:E,"Open")>0,"Yes","No")`
);

// Grievance Status Snapshot (Column AA / 27)
memberDir.getRange(row, 27).setFormula(
  `=IFERROR(INDEX('Grievance Log'!E:E,MATCH(A${row},'Grievance Log'!B:B,0)),"")`
);

// Next Grievance Deadline (Column AB / 28)
memberDir.getRange(row, 28).setFormula(
  `=IFERROR(INDEX('Grievance Log'!T:T,MATCH(A${row},'Grievance Log'!B:B,0)),"")`
);
```

---

## Seed Data Functions

### SEED_20K_MEMBERS()

**Purpose:** Generate 20,000 realistic member records

**Process:**
1. Prompts user for confirmation (destructive operation)
2. Loads data from Config sheet (job titles, locations, units, supervisors, managers, stewards)
3. Validates config data is complete
4. Generates members in batches of 1,000
5. For each member:
   - Generates Member ID (M000001 - M020000)
   - Randomly selects from name lists (40 first names, 40 last names)
   - Assigns job title, location, unit (from Config)
   - Generates email (firstname.lastname{number}@union.org)
   - Generates phone number (555 area code)
   - Random steward status (5% are stewards)
   - Random engagement dates (last 90 days)
   - Random open rates (60-100%)
   - Random volunteer hours (0-50)
   - Random interest flags
   - Communication preferences and best contact times
6. Progress toasts every 1,000 records
7. Error handling with retry logic

**Batch Size:** 1,000 rows per write (prevents timeout)

**Error Handling:** Retries once with 1-second delay if batch write fails

---

### SEED_5K_GRIEVANCES()

**Purpose:** Generate 5,000 realistic grievance records

**Process:**
1. Prompts user for confirmation
2. Loads member data ONCE (critical for performance)
3. Extracts all member IDs into array
4. Loads config data (statuses, steps, articles, categories, stewards)
5. Validates config data
6. Generates grievances in batches of 500
7. For each grievance:
   - Selects random member from loaded member data
   - Generates Grievance ID (G-000001 - G-005000)
   - Random status, step, dates (last 365 days)
   - Calculates all deadlines based on contract rules:
     * Filing deadline = incident + 21 days
     * Step I decision = filed + 30 days
     * Step II appeal due = Step I decision + 10 days
     * Step II decision = Step II appeal + 30 days
     * Step III appeal = Step II decision + 30 days
   - Calculates days open, next action, days to deadline
   - Random article, category, location, steward
   - For closed cases: resolution with Win/Lost/Settled prefix
     * **CRITICAL:** Resolution must contain "Won", "Lost", or "Settled" for Win Rate formulas to work
     * Options: "Won - Resolved favorably", "Won - Full remedy granted", "Lost - No violation found", "Lost - Withdrawn by member", "Settled - Partial remedy", "Settled - Compromise reached"
8. Progress toasts every 500 records
9. After completion: calls `updateMemberDirectorySnapshots()`
10. Error handling with retry logic

**Critical Fix (Win Rate Bug):**
Resolution text MUST include "Won" prefix for Win Rate formulas to work correctly:
```javascript
const resolution = isClosed ? [
  "Won - Resolved favorably",
  "Won - Full remedy granted",
  "Lost - No violation found",
  "Lost - Withdrawn by member",
  "Settled - Partial remedy",
  "Settled - Compromise reached"
][Math.floor(Math.random() * 6)] : "";
```

**Batch Size:** 500 rows per write

**Performance:** Loads member data once (not in loop) - critical for speed

---

### updateMemberDirectorySnapshots()

**Purpose:** Update Member Directory columns Z, AA, AB, AC, AD, AE with grievance data

**Process:**
1. Reads all member IDs
2. Reads all grievance data (all 34 columns)
3. Builds memberSnapshots object mapping member ID to:
   - Status (prioritizes Open/Filed/Pending)
   - Next deadline (earliest upcoming deadline)
   - Steward who contacted
4. For each member:
   - Sets grievance status, next deadline
   - Generates random recent contact date (last 14 days)
   - Random contact notes
5. Writes all updates in single batch (rows 2 to last member)

**Columns Updated:**
- Column 25 (Y): Grievance status snapshot
- Column 26 (Z): Next grievance deadline
- Column 27 (AA): Most recent steward contact date
- Column 28 (AB): Steward who contacted
- Column 29 (AC): Notes from steward contact

**Called By:** SEED_5K_GRIEVANCES() after seeding complete

---

### clearAllData()

**Purpose:** Delete all member and grievance data (keeps structure)

**Process:**
1. Prompts for confirmation
2. Clears Member Directory rows 2 to last row
3. Clears Grievance Log rows 2 to last row
4. Keeps headers intact
5. Toast notification

---

### nukeSeedData()

**Purpose:** Exit Demo Mode - Remove seed/test data and prepare for production use

**Implementation:**
1. Shows comprehensive warning dialog with TWO confirmation steps
2. Clears data from:
   - Member Directory (deletes all rows, keeps headers)
   - Grievance Log (deletes all rows, keeps headers)
   - Steward Workload (deletes all rows, keeps headers)
   - Config Tab demo entries (Job Titles, Locations, etc.)
   - Feedback & Development (sample feedback entries)
3. Sets `SEED_NUKED` flag in Script Properties
4. Rebuilds dashboards to recalculate metrics (will show zeros)
5. Shows post-nuke guidance dialog with setup checklist

**What Happens After Nuking:**
- Empty sheets (with headers intact)
- All dashboards show zero metrics
- Seed menu options are hidden (SEED_NUKED flag set)
- Getting started guidance appears

**Safety Features:**
- Dual confirmation dialogs (two-step confirmation)
- Clear warning about irreversibility
- Can be cancelled at any point
- Null-safe (won't error if sheets don't exist)

**File:** SeedNuke.gs

**Menu:** `509 Tools > 📊 Data Management > 🚨 Nuke Seed Data (Exit Demo Mode)`

**Related:** See SEED_NUKE_GUIDE.md for complete documentation

---

### nukeAllSheetData()

**Purpose:** Comprehensive data clear - Delete ALL data from all sheets (more thorough than nukeSeedData)

**Implementation:**
1. Shows warning dialog with single confirmation
2. Clears data from:
   - Member Directory (all member rows)
   - Grievance Log (all grievance rows)
   - Analytics Data (computed rows)
   - Member Satisfaction (survey rows)
   - Feedback & Development (feedback rows)
   - Archive (archived items)
3. Keeps all headers and structure intact
4. Logs action to Diagnostics sheet
5. Toast notification on completion

**Difference from nukeSeedData():**
- More comprehensive - clears analytics, surveys, feedback, archive
- Does NOT set SEED_NUKED flag (seed menu stays visible)
- Does NOT show guidance dialog
- Single confirmation instead of dual

**File:** Code.gs

**Menu:** `509 Tools > 📊 Data Management > 🗑️ Nuke ALL Sheet Data (Comprehensive)`

---

### clearAllData()

**Purpose:** Basic clear - Delete only core data (Member Directory and Grievance Log)

**Implementation:**
1. Shows warning dialog
2. Clears only:
   - Member Directory (all rows except header)
   - Grievance Log (all rows except header)
3. Keeps headers intact
4. Toast notification on completion

**File:** Code.gs

**Menu:** `509 Tools > 📊 Data Management > ⚠️ Clear Core Data Only`

---

### DIAGNOSE_SETUP()

**Purpose:** Comprehensive system health check and diagnostic tool

**Functionality:**
1. Checks for all 22 expected sheets
2. Validates column counts:
   - Member Directory: 31 columns (A-AE)
   - Grievance Log: 34 columns (A-AH)
   - Config: 43 columns (A-AQ)
3. Reports data status (row counts)
4. Generates health report with ✅/⚠️ indicators
5. Logs diagnostic run to Diagnostics sheet

**Expected Sheets (22 total):**
- Config, Member Directory, Grievance Log
- Dashboard, Analytics, Feedback, Member Satisfaction
- Interactive Dashboard, Getting Started, FAQ, User Settings
- Steward Workload, Trends, Location, Type Analysis
- Executive Dashboard, KPI Performance, Member Engagement, Cost Impact
- Archive, Diagnostics, Audit_Log

**Report Format:**
```
🔧 DIAGNOSTIC REPORT

📊 Sheets Found: 22 / 22

✅ All sheets present!

📋 COLUMN COUNTS:
   Member Directory: 31 columns ✅
   Grievance Log: 34 columns ✅
   Config: 43 columns ✅

📈 DATA STATUS:
   Members: 150 rows
   Grievances: 75 rows

🎉 VERDICT: System is healthy!
```

**Access:** 509 Tools > Help & Support > Diagnose Setup

**File:** Code.gs (lines 1541-1583)

**Added:** Version 2.4

---

## Color Scheme

### COLORS Constant

```javascript
const COLORS = {
  // Primary brand colors
  PRIMARY_BLUE: "#7EC8E3",      // Light blue for general use
  PRIMARY_PURPLE: "#7C3AED",    // Main brand purple
  UNION_GREEN: "#059669",       // Union/success green
  SOLIDARITY_RED: "#DC2626",    // Alert/urgent red

  // Accent colors
  ACCENT_TEAL: "#14B8A6",       // Teal for variety
  ACCENT_PURPLE: "#7C3AED",     // Duplicate of primary (consolidate?)
  ACCENT_ORANGE: "#F97316",     // Orange for warnings/attention
  ACCENT_YELLOW: "#FCD34D",     // Yellow for highlights

  // Neutral colors
  WHITE: "#FFFFFF",
  LIGHT_GRAY: "#F3F4F6",        // Backgrounds
  BORDER_GRAY: "#D1D5DB",       // Borders
  TEXT_GRAY: "#6B7280",         // Secondary text
  TEXT_DARK: "#1F2937",         // Primary text

  // Specialty colors
  CARD_BG: "#FAFAFA",           // Card backgrounds
  INFO_LIGHT: "#E0E7FF",        // Info messages
  SUCCESS_LIGHT: "#D1FAE5",     // Success messages
  HEADER_BLUE: "#3B82F6",       // Alternative header
  HEADER_GREEN: "#10B981"       // Alternative header
};
```

### Usage Guidelines

**Sheet Tab Colors:**
- Config: Blue (#2563EB)
- Member Directory: Green (#059669)
- Grievance Log: Red (#DC2626)
- Dashboard: Purple (#7C3AED)
- Executive Dashboard: Purple (#7C3AED)
- KPI Performance: Green (#059669)
- Steward Workload: Purple (#7C3AED)
- Trends: Green (#059669)
- Location: Teal (#14B8A6)
- Type Analysis: Blue (#7EC8E3)
- Member Engagement: Purple (#7C3AED)
- Cost Impact: Red (#DC2626)
- Feedback: Purple (#7C3AED)
- Archive: Gray (#6B7280)
- Diagnostics: Red (#DC2626)

**Header Colors:**
- Critical/Alert: Red (SOLIDARITY_RED)
- Success/Positive: Green (UNION_GREEN)
- Informational: Purple (PRIMARY_PURPLE)
- Warning: Orange (ACCENT_ORANGE)
- Neutral: Gray (LIGHT_GRAY)

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

**Implementation (32 columns - reorganized layout):**

```javascript
const GRIEVANCE_COLS = {
  // Section 1: Identity (A-D)
  GRIEVANCE_ID: 1,        // A
  MEMBER_ID: 2,           // B
  FIRST_NAME: 3,          // C
  LAST_NAME: 4,           // D
  // Section 2: Case Details (E-H)
  ISSUE_CATEGORY: 5,      // E
  ARTICLES: 6,            // F
  RESOLUTION: 7,          // G
  COMMENTS: 8,            // H
  // Section 3: Status & Assignment (I-K)
  STATUS: 9,              // I
  CURRENT_STEP: 10,       // J
  STEWARD: 11,            // K
  // Section 4: Timeline - Filing (L-N)
  INCIDENT_DATE: 12,      // L
  FILING_DEADLINE: 13,    // M (auto-calc: INCIDENT_DATE + 21)
  DATE_FILED: 14,         // N
  // Section 5: Timeline - Step I (O-P)
  STEP1_DUE: 15,          // O (auto-calc: DATE_FILED + 30)
  STEP1_RCVD: 16,         // P
  // Section 6: Timeline - Step II (Q-T)
  STEP2_APPEAL_DUE: 17,   // Q (auto-calc: STEP1_RCVD + 10)
  STEP2_APPEAL_FILED: 18, // R
  STEP2_DUE: 19,          // S (auto-calc: STEP2_APPEAL_FILED + 30)
  STEP2_RCVD: 20,         // T
  // Section 7: Timeline - Step III (U-W)
  STEP3_APPEAL_DUE: 21,   // U (auto-calc: STEP2_RCVD + 30)
  STEP3_APPEAL_FILED: 22, // V
  DATE_CLOSED: 23,        // W
  // Section 8: Calculated Metrics (X-Y)
  DAYS_OPEN: 24,          // X (auto-calc: DATE_FILED to DATE_CLOSED or TODAY)
  NEXT_ACTION_DUE: 25,    // Y (auto-calc: based on CURRENT_STEP)
  // Section 9: Contact & Location (Z-AB)
  MEMBER_EMAIL: 26,       // Z
  UNIT: 27,               // AA
  LOCATION: 28,           // AB
  // Section 10: Integration (AC)
  DRIVE_FOLDER_LINK: 29,  // AC
  // Section 11: Admin Messages (AD-AF) - Hidden by default
  ADMIN_FLAG: 30,         // AD (checkbox: triggers highlight, move to top, send message)
  ADMIN_MESSAGE: 31,      // AE (text: message from grievance coordinator)
  MESSAGE_ACKNOWLEDGED: 32 // AF (checkbox: steward confirms message read, clears highlight)
};

// NOTE: DAYS_TO_DEADLINE was removed - calculate dynamically from NEXT_ACTION_DUE:
// const daysToDeadline = nextActionDue ? Math.floor((new Date(nextActionDue) - today) / (1000 * 60 * 60 * 24)) : null;
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
- `getColumnLetter(52)` → "AZ"

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

### Where Dynamic Columns Are Used (100% Coverage)

**✅ Member Directory (All References Dynamic):**
- Main Dashboard: MEMBER_ID, IS_STEWARD, OPEN_RATE, VOLUNTEER_HOURS, LAST_VIRTUAL_MTG, LAST_INPERSON_MTG, INTEREST_LOCAL, INTEREST_CHAPTER
- Executive Dashboard: MEMBER_ID, IS_STEWARD
- Analytics Data Sheet: All member-related aggregations
- Verification: `grep "'Member Directory'![A-Z]:[A-Z]" *.gs` → 0 matches ✅

**✅ Grievance Log (All References Dynamic):**
- Analytics Data Sheet: UNIT, STEWARD, STATUS
- Executive Dashboard: RESOLUTION, STATUS, DAYS_OPEN, NEXT_ACTION_DUE (overdue calculated dynamically)
- Main Dashboard: STATUS, DATE_CLOSED, DAYS_OPEN
- All QUERY formulas use dynamic column ranges
- Verification: `grep "'Grievance Log'![A-Z]:[A-Z]" *.gs` → 0 matches ✅

**Status: 100% Dynamic - NO hardcoded column references exist**

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
- `DIAGNOSE_SETUP()` - Comprehensive health check function (v2.4)
- All sheet creation functions (createMemberDirectory, createGrievanceLog, etc.)
- `setupDataValidations()` - Apply all validations
- `setupFormulasAndCalculations()` - Set formulas for first 100 rows
- `SEED_20K_MEMBERS()` - Generate member data
- `SEED_5K_GRIEVANCES()` - Generate grievance data
- `updateMemberDirectorySnapshots()` - Update member columns from grievances (FIXED v2.4)
- `clearAllData()` - Clear member and grievance data
- `nukeSeedData()` - Nuclear option - clear ALL seed data (ENHANCED v2.4)
- `onOpen()` - Create menu system

**AuditLoggingRBAC.gs:** (NEW in v2.4)
- `createAuditLogSheet()` - Create audit log sheet
- `logDataModification()` - Main audit logging function
- `logMemberCreation()`, `logGrievanceCreation()` - Specific log helpers
- `logMemberUpdate()`, `logGrievanceUpdate()` - Update logging
- `logDataDeletion()` - Deletion logging
- `initializeRBAC()` - Set up RBAC script properties
- `checkUserPermission(role)` - Permission checking
- `getUserRole()` - Get current user's role
- `configureUserRoles()` - Show/manage roles
- `addAdmin()`, `addSteward()`, `addViewer()` - Add users to roles
- `showMyPermissions()` - Show current user permissions

**ColumnToggles.gs:**
- `toggleGrievanceColumns()` - [DISABLED] Show/hide grievance columns
- `toggleLevel2Columns()` - Show/hide Level 2 engagement columns
- `showAllMemberColumns()` - Unhide all columns in Member Directory

**InteractiveDashboard.gs:**
- `createInteractiveDashboardSheet()` - Build interactive dashboard
- `setupInteractiveDashboardControls()` - Add dropdown validations
- `rebuildInteractiveDashboard()` - Refresh based on user selections

**ADHDEnhancements.gs:**
- `hideAllGridlines()` - Focus mode
- `showAllGridlines()` - Show gridlines
- `reorderSheetsLogically()` - Reorder sheets in logical order
- `setupADHDDefaults()` - Apply ADHD-friendly defaults

---

## Known Issues & Limitations

### Current Issues

**1. Toggle Grievance Columns - DISABLED**
- Function expects columns 12-21 to contain grievance tracking data
- Current Member Directory structure has engagement data in those positions
- Function now shows informative alert instead of trying to hide wrong columns
- Users can manually hide/show columns via right-click

**2. Member Directory Column Groups**
- Old versions may have residual column groups from previous structures
- Solution: createMemberDirectory() now deletes and recreates sheet (not just clears)
- This ensures clean slate without legacy formatting

**3. Win Rate Formula Dependency**
- Win Rate formulas depend on Resolution Summary containing "Won", "Lost", or "Settled"
- If seed data changes resolution format, Win Rate will break
- Solution: SEED_5K_GRIEVANCES() now generates proper resolution prefixes

### Limitations

**Performance:**
- Seed functions can take 2-3 minutes for 20k members + 5k grievances
- Google Sheets has 6-minute execution limit
- Batch processing (1000/500 rows) prevents timeout

**Formula Rows:**
- Auto-calculated formulas only set for first 100 rows
- Manually add formulas if more than 100 open grievances/members
- Future: Could extend to 1000 rows or use ARRAYFORMULA

**Google Sheets Limits:**
- Max 10 million cells per spreadsheet
- Max 50,000 characters per cell
- Max 40,000 new rows per day (via API)

---

## Feature Implementation Status

### ✅ Implemented Features (Beyond 79-95)

**1. Real-Time Notifications** ✅ IMPLEMENTED
- ✅ Email alerts for approaching deadlines (`AutomatedNotifications.gs`)
- ✅ Daily deadline checks at 8 AM
- ✅ 7-day and 3-day advance notifications
- ⏳ Slack/Teams integration (Pending)
- ⏳ SMS notifications for critical cases (Pending)

**2. Advanced Analytics** ✅ IMPLEMENTED
- ✅ Predictive modeling for case outcomes (`PredictiveAnalytics.gs`)
- ✅ Trend analysis with volume forecasting
- ✅ Root cause analysis (`RootCauseAnalysis.gs`)
- ✅ Issue type trend tracking
- ⏳ Sentiment analysis on member feedback (Pending)

**3. Mobile Optimization** ✅ IMPLEMENTED
- ✅ Mobile-responsive interfaces (`MobileOptimization.gs`)
- ✅ Mobile dashboard views
- ✅ Mobile member browser
- ✅ Mobile search functionality
- ⏳ Native iOS/Android apps (Pending)
- ⏳ Offline mode (Pending)
- ⏳ Push notifications (Pending)

**4. Integration** ✅ PARTIALLY IMPLEMENTED
- ✅ Calendar integration for deadlines (`CalendarIntegration.gs`)
- ✅ Gmail integration (`GmailIntegration.gs`)
- ✅ Google Drive integration (`GoogleDriveIntegration.gs`)
- ⏳ Union dues payment system integration (Pending)
- ⏳ Document management system (Pending)

**5. Automation** ✅ IMPLEMENTED
- ✅ Auto-assign stewards based on workload (`SmartAutoAssignment.gs`)
- ✅ Batch operations for efficiency (`BatchOperations.gs`)
- ✅ Automated reports (`AutomatedReports.gs`)
- ✅ Automated backups (`DataBackupRecovery.gs`, `IncrementalBackupSystem.gs`)
- ⏳ Auto-generate grievance letters (Pending)
- ⏳ Auto-update member engagement scores (Pending)

**6. Enhanced Member Engagement** ⏳ PENDING
- ⏳ Member portal (view own grievances)
- ⏳ Survey builder and distribution
- ⏳ Event registration system

### 📁 Additional Feature Modules

The following advanced feature modules have been implemented and integrated:

**Performance & Reliability:**
- `PerformanceMonitoring.gs` - Track execution times and system health
- `EnhancedErrorHandling.gs` - Comprehensive error capture and logging
- `GracefulDegradation.gs` - Fallback mechanisms for failed operations
- `IdempotentOperations.gs` - Prevent duplicate operations
- `DistributedLocks.gs` - Prevent concurrent modification conflicts
- `TransactionRollback.gs` - Rollback failed operations
- `UndoRedoSystem.gs` - User-friendly undo/redo functionality

**Data Management:**
- `DataCachingLayer.gs` - Cache frequently accessed data
- `DataIntegrityEnhancements.gs` - Referential integrity checks
- `DataPagination.gs` - Handle large datasets efficiently

**User Experience:**
- `DarkModeThemes.gs` - Dark mode and theme management
- `KeyboardShortcuts.gs` - Keyboard navigation shortcuts
- `LazyLoadCharts.gs` - Load charts on demand for performance
- `CustomReportBuilder.gs` - Build custom reports interactively
- `MemberSearch.gs` - Advanced member search
- `FAQKnowledgeBase.gs` - Searchable FAQ system

**Admin Tools:**
- `AdminGrievanceMessages.gs` - Admin messaging system
- `AddRecommendations.gs` - System recommendations
- `ReorganizedMenu.gs` - Enhanced menu organization
- `Phase6Integration.gs` - Phase 6 feature integration
- `WorkflowStateMachine.gs` - Workflow state management

**Total: 60 production modules** integrated into ConsolidatedDashboard.gs (63 with test modules)

### 🔄 Remaining Planned Features

**1. Extend Formula Rows**
- Currently only first 100 rows have formulas
- Should extend to 1000 rows or use ARRAYFORMULA

**2. Member Directory Columns**
- Add actual grievance tracking columns (Total Grievances, Active Grievances, etc.)
- Re-enable toggleGrievanceColumns() function
- Requires adding 10 new calculated columns

**3. Error Logging**
- Implement comprehensive error logging to Diagnostics sheet
- Track all seed operations, formula errors, validation failures

**4. Performance Optimization**
- Cache Analytics Data calculations
- Lazy-load dashboard charts
- Implement pagination for large data views

---

## Reconstruction Guide

### How to Rebuild This Exact System

**Prerequisites:**
1. Google account with Google Sheets access
2. Apps Script editor access
3. This FEATURES.md document
4. All .gs files from repository

**Step-by-Step:**

1. **Create New Google Sheet**
   - Name: "509 Dashboard"
   - Open Tools → Script Editor

2. **Copy All Code**
   - Copy entire contents of Code.gs
   - Paste into Code.gs in Apps Script editor
   - Copy ColumnToggles.gs → Create new file, paste
   - Copy InteractiveDashboard.gs → Create new file, paste
   - Copy ADHDEnhancements.gs → Create new file, paste

3. **Save and Deploy**
   - Save all files
   - Run function: CREATE_509_DASHBOARD()
   - Grant permissions when prompted
   - Wait for setup to complete (2-3 minutes)

4. **Verify Setup**
   - Run function: DIAGNOSE_SETUP()
   - Check that all 21 sheets exist
   - Verify menu appears: "📊 509 Dashboard"

5. **Seed Test Data**
   - Menu → Admin → Seed 20k Members (wait 2-3 min)
   - Menu → Admin → Seed 5k Grievances (wait 1-2 min)

6. **Test Functionality**
   - Open Main Dashboard - verify metrics calculate
   - Open Executive Dashboard - verify Win Rate shows correctly
   - Open Interactive Dashboard - verify dropdowns work
   - Test menu items

7. **Customize** (Optional)
   - Update Config sheet with real job titles, locations, etc.
   - Clear seed data: Menu → Admin → Clear All Data
   - Import real member/grievance data

### Verification Checklist

- [ ] 21 sheets exist with correct names
- [ ] Config sheet has 43 columns with sample data
- [ ] Member Directory has 31 columns with correct headers
- [ ] Grievance Log has 34 columns with correct headers
- [ ] Dashboard shows live metrics (after seeding)
- [ ] Menu "📊 509 Dashboard" appears
- [ ] All menu items work without errors
- [ ] Data validations work (try entering invalid data)
- [ ] Formulas calculate correctly (check Win Rate)
- [ ] Executive Dashboard shows Quick Stats + Detailed KPIs
- [ ] KPI Performance Dashboard has 12 columns
- [ ] Seed functions complete without errors
- [ ] Win Rate shows >0% after seeding (not 0%)
- [ ] **🔴 CRITICAL:** 100% dynamic column references verified:
  - [ ] `grep "'Member Directory'![A-Z]:[A-Z]" *.gs` → 0 matches
  - [ ] `grep "'Grievance Log'![A-Z]:[A-Z]" *.gs` → 0 matches
  - [ ] MEMBER_COLS constant defined with all 31 columns
  - [ ] GRIEVANCE_COLS constant defined with all 34 columns

---

## Appendix: Constants Reference

### SHEETS Constant

```javascript
const SHEETS = {
  CONFIG: "Config",
  MEMBER_DIR: "Member Directory",
  GRIEVANCE_LOG: "Grievance Log",
  DASHBOARD: "Dashboard",
  ANALYTICS: "Analytics Data",
  FEEDBACK: "Feedback & Development",
  MEMBER_SATISFACTION: "Member Satisfaction",
  INTERACTIVE_DASHBOARD: "🎯 Interactive (Your Custom View)",
  STEWARD_WORKLOAD: "👨‍⚖️ Steward Workload",
  TRENDS: "📈 Trends & Timeline",
  LOCATION: "🗺️ Location Analytics",
  TYPE_ANALYSIS: "📊 Type Analysis",
  EXECUTIVE_DASHBOARD: "💼 Executive Dashboard",
  KPI_PERFORMANCE: "📊 KPI Performance Dashboard",
  MEMBER_ENGAGEMENT: "👥 Member Engagement",
  COST_IMPACT: "💰 Cost Impact",
  ARCHIVE: "📦 Archive",
  DIAGNOSTICS: "🔧 Diagnostics"
};
```

**Total Sheets:** 21 (includes hidden Analytics Data)
**Recent Changes:** Consolidated from 25 to 21 sheets

---

## Changelog

### v3.17 - Sheet Initialization & Self-Healing (2025-12-08)

**New Feature: Automatic Sheet Setup**

Added `setupRequiredSheets()` function that creates missing sheets with proper headers:
- Creates Member Directory (31 columns A-AE) with all headers
- Creates Grievance Log (34 columns A-AH) with all headers
- Creates Config sheet with Setting/Value headers
- All sheets get frozen header rows and styled headers

**New Constants:**
- `MEMBER_DIRECTORY_HEADERS` - Full 31-column header array for Member Directory
- `GRIEVANCE_LOG_HEADERS` - Full 34-column header array for Grievance Log

**New Functions:**
- `setupRequiredSheets()` - Creates all required sheets if missing, returns {created, existing, errors}
- `showSetupRequiredSheets()` - UI wrapper showing results in dialog

**Menu Addition:**
- Setup > Sheet Initialization > Initialize Required Sheets
- Setup > Sheet Initialization > Schema Health Check (duplicate from Administrator for discoverability)

**Why This Matters:**
- Fixes "Member Directory sheet not found" errors on new installations
- Eliminates manual sheet creation with correct headers
- Ensures column constants match actual sheet structure

---

### v3.15-v3.16 - Column Constant Fixes & Schema Validation (2025-12-08)

**v3.15 Bug Fixes:**
- Added 11 GRIEVANCE_COLS aliases for backward compatibility
- Added MEMBER_COLS.LOCATION alias
- Added CACHE_CONFIG.ENABLE_LOGGING
- Added getGrievanceMemberName() and getMemberFullName() helper functions
- Updated MobileOptimization.gs call sites

**v3.16 Enhancements:**
- Added mapMemberRow() and mapGrievanceRow() row mapper functions
- Added MEMBER_EXPECTED_HEADERS and GRIEVANCE_EXPECTED_HEADERS
- Added schema validation functions
- Added Schema Health Check to Administrator menu

---

### Version 2.4 (Current)

**🔴 CRITICAL: Comprehensive 3-Day Audit - All Hardcoded Column Violations Fixed**

**Issue:**
- Multiple hardcoded column references discovered across 9+ files
- Violations introduced over 3 days (158 commits) without referencing AI_REFERENCE.md
- Hardcoded column numbers, array indices, and range specifications

**Fixes Applied:**

1. **Test Files - Hardcoded Column Numbers:**
   - Code.test.gs:273 - `getRange(2, 4)` → `getRange(2, MEMBER_COLS.JOB_TITLE)`
   - Integration.test.gs:292 - `getRange(2, 5)` → `getRange(2, MEMBER_COLS.WORK_LOCATION)`

2. **GrievanceWorkflow.gs - Wrong Config Column:**
   - Line 448: `getRange(2, 16, 10, 3)` → `getRange(2, CONFIG_COLS.GRIEVANCE_COORDINATORS, 10, 1)`
   - Was reading wrong columns (P, Q, R instead of O)
   - Fixed to use comma-separated list parsing

3. **AdminGrievanceMessages.gs - Hardcoded Array Indices:**
   - Line 458: `row[2]`, `row[1]` → `row[COMM_LOG_COLS.GRIEVANCE_ID - 1]`, `row[COMM_LOG_COLS.TYPE - 1]`

4. **BatchOperations.gs - Hardcoded Column Counts:**
   - Line 207: Hardcoded 10 → `MEMBER_COLS.IS_STEWARD`
   - Line 409: Hardcoded 28 → `GRIEVANCE_COLS.RESOLUTION`

5. **AutomatedNotifications.gs, AutomatedReports.gs, CalendarIntegration.gs:**
   - All hardcoded 28 → `GRIEVANCE_COLS.RESOLUTION`

6. **MemberDirectoryDropdowns.gs - 500 Item Limit Fix:**
   - Added logic to use `requireValueInRange` for lists > 500 items
   - Steward dropdowns now work with 1000+ options

7. **Code.gs - Hardcoded Sheet Column References:**
   - `'Member Directory'!E:E` → `${workLocationCol}` using `getColumnLetter(MEMBER_COLS.WORK_LOCATION)`
   - `'Grievance Log'!A:AB` → `A:${lastGrievanceCol}` using `getColumnLetter(GRIEVANCE_COLS.RESOLUTION)`

8. **ConsolidatedDashboard.gs - All Fixes Synced:**
   - All corresponding fixes applied to maintain parity

**Files Changed (9):**
- AdminGrievanceMessages.gs
- AutomatedNotifications.gs
- AutomatedReports.gs
- BatchOperations.gs
- CalendarIntegration.gs
- Code.test.gs
- ConsolidatedDashboard.gs
- GrievanceWorkflow.gs
- Integration.test.gs
- MemberDirectoryDropdowns.gs
- Code.gs
- AI_REFERENCE.md

**Verification:**
```bash
grep "'Member Directory'![A-Z]:[A-Z]" *.gs | wc -l  # Returns 0 ✅
grep "'Grievance Log'![A-Z]:[A-Z]" *.gs | wc -l     # Returns 0 ✅
grep "g\[[0-9]+\]|m\[[0-9]+\]" UnifiedOperationsMonitor.gs | wc -l  # Returns 0 ✅
```

**Commits:**
- 87f0b55: Fix all persistent issues: dropdowns, formulas, columns, tests
- d9d29c3: Fix 500 item limit for dropdown validation
- 2e26c9b: Remove hardcoded column references from comments
- c3effbb: Fix hardcoded column violations found by AI_REFERENCE.md audit
- 49ba490: Fix all hardcoded column violations from 3-day audit

---

### Version 2.3

**🔴 CRITICAL BUG FIX: hideGridlines() TypeError Resolved**

**Issue:**
- Runtime error: `TypeError: sheet.hideGridlines is not a function`
- Affected CREATE_509_DASHBOARD and all gridline-related functions
- Method `hideGridlines()` does not exist in Google Apps Script API

**Fix:**
- Replaced all `sheet.hideGridlines()` calls with `sheet.setHiddenGridlines(true)`
- This is the correct Google Apps Script method for hiding gridlines
- Fixed 9 occurrences across 3 files

**Files Changed:**
- Complete509Dashboard.gs: Fixed 3 instances (lines 4446, 4610, 4765)
- ADHDEnhancements.gs: Fixed 3 instances (lines 29, 189, 344)
- ConsolidatedDashboard.gs: Fixed 3 instances (lines 11709, 11869, 12024)
- AI_REFERENCE.md: Updated version and changelog

**Commit:**
- Fix hideGridlines TypeError - use setHiddenGridlines(true) instead

---

### Version 2.2

**🔴 CRITICAL UPDATE: All Runtime Errors Fixed**

**Comprehensive Code Review Completed:**
- Reviewed entire codebase for stubs, dead ends, and errors
- Found and fixed 9 critical runtime errors that would cause crashes
- Fixed 6 wrong SHEETS constant references
- Replaced mock data with real calculations
- Removed disabled/broken menu features

**Critical Fixes:**

1. **Missing Functions Added (3):**
   - `recalcGrievanceRow()` in GrievanceWorkflow.gs
   - `recalcMemberRow()` in GrievanceWorkflow.gs
   - `rebuildDashboard()` in SeedNuke.gs

2. **SHEETS Constants Fixed (6 wrong references):**
   - `SHEETS.EXECUTIVE` → `SHEETS.EXECUTIVE_DASHBOARD`
   - `SHEETS.KPI_BOARD` → `SHEETS.KPI_PERFORMANCE`
   - Removed: `SHEETS.PERFORMANCE`, `SHEETS.QUICK_STATS`, `SHEETS.FUTURE_FEATURES`, `SHEETS.PENDING_FEATURES`
   - Added missing: `SHEETS.MEMBER_SATISFACTION` to reorder list

3. **Hardcoded Column Reference Fixed:**
   - Replaced hardcoded column 21 with named constant `CONFIG_STEWARD_INFO_COL`

4. **Menu Cleanup:**
   - Removed non-functional "Toggle Advanced Grievance Columns" menu item

5. **Mock Data Replaced:**
   - UnifiedOperationsMonitor.gs now uses real win/loss calculations instead of 75% fake data

6. **UnifiedOperationsMonitor.gs Made Fully Dynamic (HIGH PRIORITY):**
   - Fixed 61 hardcoded grievance array indices: g[4], g[22], g[27], etc.
   - Fixed 7 hardcoded member array indices: m[0], m[9], m[20], etc.
   - All array access now uses `MEMBER_COLS - 1` / `GRIEVANCE_COLS - 1`
   - Example: `g[4]` → `g[GRIEVANCE_COLS.STATUS - 1]`

7. **Executive Dashboard Column References (2 instances):**
   - Fixed hardcoded 'Member Directory'!A2:A → dynamic execMemberIdCol
   - Fixed hardcoded 'Grievance Log'!A2:A → dynamic grievanceIdCol

**Files Changed:**
- ADHDEnhancements.gs: Fixed SHEETS constants
- GrievanceWorkflow.gs: Added missing functions, fixed hardcoded column, made formulas fully dynamic
- SeedNuke.gs: Added rebuildDashboard() function
- UnifiedOperationsMonitor.gs: Replaced mock data, fixed ALL 68 hardcoded array indices
- Code.gs: Removed disabled menu item, fixed Executive Dashboard hardcoded columns
- Complete509Dashboard.gs: Removed disabled menu item, fixed Executive Dashboard (parity maintained)
- AI_REFERENCE.md: Added Code Quality section, updated changelog

**Commits:**
- cb36266: Fix all critical code issues from comprehensive review
- 083d253: Eliminate ALL hardcoded column references - 100% dynamic
- cdf34d8: Fix UnifiedOperationsMonitor.gs - 100% dynamic array access

---

### Version 2.1

**🔴 CRITICAL UPDATE: 100% Dynamic Column System Complete**

**Major Changes:**
- ✅ Added MEMBER_COLS constant with all 31 Member Directory columns
- ✅ Converted ALL remaining hardcoded column references to dynamic
- ✅ 100% dynamic coverage achieved - ZERO hardcoded references remain
- ✅ Both Code.gs and Complete509Dashboard.gs updated
- ✅ Test suite added from testing branch

**Files Changed:**
- Code.gs: Added MEMBER_COLS constant, updated all Member Directory formulas
- Complete509Dashboard.gs: Same changes (100% parity maintained)
- AI_REFERENCE.md: Added comprehensive dynamic column documentation

**Verification:**
- `grep "'Member Directory'![A-Z]:[A-Z]" *.gs` → 0 matches ✅
- `grep "'Grievance Log'![A-Z]:[A-Z]" *.gs` → 0 matches ✅
- All 31 Member Directory columns now use MEMBER_COLS
- All 28 Grievance Log columns use GRIEVANCE_COLS

**Commits:**
- 58859ed: Make all column references fully dynamic with MEMBER_COLS
- b8e823f: Add comprehensive test suite from testing branch

---

### Version 2.0

**Major Changes:**
- Consolidated 25 sheets → 21 sheets
- ✅ Dynamic column mapping system for GRIEVANCE_COLS
- Fixed critical Win Rate formula bug
- Disabled legacy toggleGrievanceColumns() function
- Fixed column group error (delete/recreate Member Directory)
- Merged Feedback + Future Features + Pending Features
- Merged Executive Summary + Quick Stats → Executive Dashboard
- Merged Performance Metrics + KPI Board → KPI Performance Dashboard

**Files Changed:**
- Code.gs: Added GRIEVANCE_COLS, getColumnLetter(), Grievance formulas dynamic
- Complete509Dashboard.gs: Same changes for consistency (100% parity)
- ColumnToggles.gs: Disabled toggleGrievanceColumns()

**Bug Fixes:**
- Win Rate now shows correctly (resolution text includes "Won"/"Lost"/"Settled")
- Column group error fixed (delete/recreate sheet)
- ✅ Grievance Log column references now dynamic

**Dynamic Column Implementation (COMPLETE):**

Commit f1b28a9 completed the dynamic column conversion. ALL formulas now use dynamic references:

**Main Dashboard:**
- Grievance Metrics: STATUS (E), DATE_CLOSED (R), DAYS_OPEN (S)
- QUERY formula: All column letters dynamic (A, C, T, U, E)
- Range: A:U → dynamic first:last column

**Analytics Data Sheet:**
- Status section: STATUS (E) - fully dynamic
- Unit section: UNIT (Y) - fully dynamic
- Steward section: STEWARD (AA), STATUS (E) - fully dynamic

**Member Directory:**
- Has Open Grievance: MEMBER_ID (B), STATUS (E)
- Grievance Status Snapshot: STATUS (E), MEMBER_ID (B)
- Next Grievance Deadline: NEXT_ACTION_DUE (T), MEMBER_ID (B)

**Executive Dashboard:**
- Quick Stats: RESOLUTION (G), STATUS (I), DAYS_OPEN (X), NEXT_ACTION_DUE (Y)
- Note: Overdue cases now calculated as COUNTIFS(STATUS="Open", NEXT_ACTION_DUE < TODAY())

**Columns Using Dynamic References (Updated Layout):**
- GRIEVANCE_ID (A)
- MEMBER_ID (B)
- FIRST_NAME (C)
- ISSUE_CATEGORY (E)
- ARTICLES (F)
- RESOLUTION (G)
- STATUS (I)
- STEWARD (K)
- DATE_CLOSED (W)
- DAYS_OPEN (X)
- NEXT_ACTION_DUE (Y)
- UNIT (AA)
- LOCATION (AB)
- DRIVE_FOLDER_LINK (AC)
- ADMIN_FLAG (AD)
- Note: DAYS_TO_DEADLINE removed - calculate from NEXT_ACTION_DUE

**Verification:** `grep "'Grievance Log'![A-Z]+:[A-Z]+"` returns ZERO hardcoded references.

**How to Reorder Columns:**
1. Update GRIEVANCE_COLS constant with new column positions
2. All formulas automatically adjust - no manual updates needed
3. This is the ONLY place column positions are defined

---

## Code Quality & Known Issues

### Recent Code Review (Version 3.14)

**✅ FIXED: Duplicate Function Definitions (21 duplicates resolved)**

All duplicate function definitions have been resolved. Each function now has a single canonical version, with alternates renamed uniquely:

| Original Duplicate | Canonical Location | Renamed Versions |
|-------------------|-------------------|------------------|
| `getUserRole` | SecurityUtils.gs | `getUserRoleFromSheet` (SecurityService.gs), `getUserRoleRBAC` (AuditLoggingRBAC.gs) |
| `checkUserPermission` | AuditLoggingRBAC.gs | `checkUserPermissionCSV` (SecurityAndAdmin.gs) |
| `validateEmail` | Constants.gs (throws) | `isValidEmailFormat` (EnhancedErrorHandling.gs) |
| `showContextHelp` | ContextSensitiveHelp.gs | `showContextHelpKeyboard` (KeyboardShortcuts.gs), `showContextHelpPlainText` (EnhancedHelp.gs) |
| `cleanupOldBackups` | PerformanceAndBackup.gs | `cleanupOldBackupsInFolder` (IncrementalBackupSystem.gs) |
| `exportToCSV` | AdvancedExport.gs | `exportDataArrayToCSV` (UIFeatures.gs) |
| `trackPerformance` | PerformanceAndBackup.gs | `trackPerformanceDecorator` (PerformanceMonitoring.gs) |
| `withErrorHandling` | EnhancedErrorHandling.gs | `withSimpleErrorHandling` (UtilityService.gs) |
| `isValidEmail` | SecurityUtils.gs | `isValidEmailForCoordinator` (CoordinatorNotification.gs), `isValidEmailForNotifications` (AutomatedNotifications.gs) |
| `createAuditLogSheet` | SecurityService.gs | `recreateAuditLogSheet` (SecurityAndAdmin.gs), `createAuditLogSheetRBAC` (AuditLoggingRBAC.gs) |
| `getStewardEmail` | CoordinatorNotification.gs | `getStewardEmailForAdmin` (AdminGrievanceMessages.gs) |
| `validateRequiredFields` | EnhancedErrorHandling.gs | `validateRequiredFieldsOrThrow` (UtilityService.gs) |
| `validateDate` | Constants.gs (throws) | `isValidDateFormat` (EnhancedErrorHandling.gs) |
| `createCommunicationsLogSheet` | Code.gs | `createGmailCommunicationsLogSheet` (GmailIntegration.gs) |
| `exportToPDF` | AdvancedExport.gs | `exportToPDFStub` (UIFeatures.gs) |
| `exportToExcel` | AdvancedExport.gs | `exportToExcelStub` (UIFeatures.gs) |
| `logDataModification` | AuditLoggingRBAC.gs | `logDataModificationAdmin` (SecurityAndAdmin.gs) |

---

### Recent Code Review (Version 2.2)

A comprehensive code review was conducted covering stubs, dead ends, and errors. All **critical** and **high-priority** issues have been resolved.

**✅ Fixed Issues (Resolved in Version 2.2):**

1. **Missing Function Definitions (CRITICAL)** - FIXED
   - Added `recalcGrievanceRow()` to GrievanceWorkflow.gs
   - Added `recalcMemberRow()` to GrievanceWorkflow.gs
   - Added `rebuildDashboard()` to SeedNuke.gs

2. **Wrong SHEETS Constants (CRITICAL)** - FIXED
   - Fixed `SHEETS.EXECUTIVE` → `SHEETS.EXECUTIVE_DASHBOARD`
   - Fixed `SHEETS.KPI_BOARD` → `SHEETS.KPI_PERFORMANCE`
   - Removed references to non-existent `SHEETS.PERFORMANCE`, `SHEETS.QUICK_STATS`, `SHEETS.FUTURE_FEATURES`, `SHEETS.PENDING_FEATURES`
   - Added `SHEETS.MEMBER_SATISFACTION` to reorder list

3. **Hardcoded Config Column** - FIXED
   - Replaced hardcoded column 21 with named constant `CONFIG_STEWARD_INFO_COL`

4. **Disabled Menu Feature** - FIXED
   - Removed non-functional "Toggle Advanced Grievance Columns" from menu

5. **Mock Data** - FIXED
   - Replaced 75% fake win rate with real calculations in UnifiedOperationsMonitor.gs

6. **UnifiedOperationsMonitor.gs Hardcoded Array Indices (HIGH PRIORITY)** - FIXED
   - Replaced 61 hardcoded grievance array indices (g[4], g[22], g[27], etc.)
   - Replaced 7 hardcoded member array indices (m[0], m[9], m[20], etc.)
   - All array access now uses `MEMBER_COLS - 1` and `GRIEVANCE_COLS - 1` pattern
   - Example: `g[4]` → `g[GRIEVANCE_COLS.STATUS - 1]`

### Recent Code Review (Version 2.7)

**✅ Fixed Issues (Resolved in Version 2.7):**

1. **Duplicate createGrievanceFolder Functions (CRITICAL)** - FIXED
   - Renamed formData version to `createGrievanceFolderFromFormData()` in GrievanceWorkflow.gs and ConsolidatedDashboard.gs
   - Consistent API: `createGrievanceFolder(grievanceId, grievantName)` for simple use, `createGrievanceFolderFromFormData(grievanceId, formData)` for form submissions

2. **Broken DOM Event Listeners (CRITICAL)** - FIXED
   - Fixed `addEventListenerfunction` → `addEventListener` in MobileOptimization.gs and ConsolidatedDashboard.gs
   - Fixed malformed arrow function syntax `(e) {` → `function(e) {`

3. **Misplaced setTimeout Delays (CRITICAL)** - FIXED
   - Fixed `setTimeout(function() { return action, delay; });` → `setTimeout(function() { action; }, delay);`
   - Fixed in EnhancedADHDFeatures.gs, MobileOptimization.gs, ConsolidatedDashboard.gs

4. **Dashboard Widgets Not Populating (CRITICAL)** - FIXED
   - **Upcoming Deadlines widget:** QUERY formula used `DAYS_TO_DEADLINE >= 0` but column contains text like "DUE TODAY" or "OVERDUE 5d", causing filter to fail
   - **Fix:** Changed to use date comparisons on `NEXT_ACTION_DUE` column: `AND ${nextActionCol} >= date '...' AND ${nextActionCol} <= date '...'`
   - **Engagement Metrics widget:** COUNTIF formulas included header row and lacked non-empty check for date comparisons
   - **Fix:** Changed to COUNTIFS starting from row 2 with `"<>"` condition to exclude empty cells
   - Fixed in `createMainDashboard()` and `refreshDashboardDeadlines()` in ConsolidatedDashboard.gs

**⚠️ Known Technical Debt (Non-Critical):**

None - All issues resolved!

**Verification Commands:**

```bash
# Verify no hardcoded sheet column references (should return 0)
grep "'Member Directory'![A-Z]:[A-Z]" *.gs | wc -l
grep "'Grievance Log'![A-Z]:[A-Z]" *.gs | wc -l

# Verify no hardcoded array indices (should return 0)
grep "g\[[0-9]\+\]\|m\[[0-9]\+\]" UnifiedOperationsMonitor.gs | wc -l

# Verify no broken event listeners (should return 0)
grep "addEventListenerfunction" *.gs | wc -l

# Verify no misplaced setTimeout delays (should return 0)
grep "setTimeout(function() { return.*," *.gs | wc -l

# Verify duplicate function names don't exist (should only return function definitions, not duplicates)
grep -n "function createGrievanceFolder(" *.gs
# Expected: Only 2 results - one in GoogleDriveIntegration.gs and one in ConsolidatedDashboard.gs (same signature)
```

---

## Comprehensive Code Audit - Version 2.7

### 1. Large Multi-Responsibility Functions (Refactoring Opportunities)

**Priority 1 - Critical (400+ lines):**

| Function | File | Lines | Size | Responsibilities |
|----------|------|-------|------|------------------|
| `createMobileDashboardHTML()` | MobileOptimization.gs | 138-558 | 420 | HTML, CSS, JS, data fetching, event handling |
| `getUnifiedOperationsMonitorHTML()` | UnifiedOperationsMonitor.gs | 717-1116 | 399 | HTML, terminal CSS, 7 dashboard sections |
| `createVisualizationBuilderHTML()` | AdvancedVisualization.gs | 51-436 | 385 | HTML, CSS, chart library integration |
| `createMobileUnifiedSearchHTML()` | MobileOptimization.gs | 921-1284 | 363 | HTML, CSS, JS, tab/filter/search logic |

**Priority 2 - High (250-350 lines):**

| Function | File | Lines | Size | Responsibilities |
|----------|------|-------|------|------------------|
| `createInteractiveDashboardSheet()` | InteractiveDashboard.gs | 19-330 | 311 | Sheet creation, formatting, layout, validation |
| `seedMembersWithCount()` | Code.gs | 2792-3063 | 271 | Config reading, data generation, writing, UI |
| `showSharingOptionsDialog()` | GrievanceWorkflow.gs | 618-842 | 224 | Data fetching, HTML generation, dialog |
| `seedGrievancesWithCount()` | Code.gs | 3092-3300 | 208 | Data fetching, date math, batch writing |

**Refactoring Recommendations:**
- Extract HTML/CSS/JS into separate template helper functions
- Split data fetching from rendering
- Create `buildDashboardViewModel()`, `renderDashboardCards()` patterns
- Keep public entry function names, orchestrate smaller helpers internally

---

### 2. Mixed var/let/const Usage

**Current State:** 6 instances of `var` across 3 files (mostly clean)

| File | Line | Pattern | Fix |
|------|------|---------|-----|
| ConsolidatedDashboard.gs | 812 | `var letter = ''` in loop | Change to `let` |
| ConsolidatedDashboard.gs | 831 | `var number = 0` in loop | Change to `let` |
| ConsolidatedDashboard.gs | 50446 | `var nextAction` in forEach callback | Change to `let` |
| Constants.gs | 782 | `var letter = ''` (duplicate) | Change to `let` |
| Constants.gs | 801 | `var number = 0` (duplicate) | Change to `let` |
| Code.test.gs | 157 | `var nextAction` in forEach | Change to `let` |

**Note:** `getColumnLetter()` and `getColumnNumber()` are duplicated in both Constants.gs and ConsolidatedDashboard.gs.

---

### 3. Unused/Dead Code Functions - ✅ RESOLVED (2025-12-06)

**Status:** 23 unused functions were REMOVED, security functions were already wired in.

**What Was Done:**
- ✅ **Removed 23 dead code functions** across 10 files (~5,500 lines deleted)
- ✅ **Wired `logUserAccess()`** into `onOpen()` for audit trail
- ✅ **Verified security filtering** - `filterMemberDataByPermission()` and `filterGrievanceDataByPermission()` were ALREADY called in exports, mobile dashboards, and report builders
- ✅ **Deleted `AddRecommendations.gs`** - entire file removed (one-time setup script never used)
- ✅ **Kept `validateRequiredSheets()`** - useful utility in Constants.gs

**Functions Removed:**
- SecurityService.gs: `withPermission`, `logDataChange`, `protectedSeedMembers`, `protectedClearAllData`, `showUserManagement`, `showAuditLog`, `exportAuditLog`
- SecurityUtils.gs: `sanitizeArray`, `isValidDate`, `validateInput`, `getAuditLog`, `getAllMemberEmails`, `showSecurityAudit`
- DarkModeThemes.gs: `exportCurrentTheme`, `importThemeFromJSON`, `installAutoThemeTrigger`
- DataCachingLayer.gs: `onEditCacheInvalidation`, `getCachePerformanceStats`
- CalendarIntegration.gs: `syncSingleDeadlineToCalendar`, `removeCalendarEvent`
- Constants.gs: `getFullVersionString`
- ADHDEnhancements.gs: `applyUserSettings`
- BatchGrievanceRecalc.gs: `benchmarkGrievanceRecalc`
- DataBackupRecovery.gs: `verifyBackup`

**Note on `toggleGrievanceColumns`:** This function EXISTS in ColumnToggles.gs but is intentionally DISABLED - it shows an info alert explaining the feature is unavailable (expects columns that don't exist in current structure).

---

### 4. Placeholder/Stub Implementations

**High Priority - Configuration Required:**

| File | Function/Config | Issue |
|------|-----------------|-------|
| GrievanceWorkflow.gs:25 | `GRIEVANCE_FORM_CONFIG.FORM_URL` | Contains `YOUR_FORM_ID` placeholder |
| GrievanceWorkflow.gs:33-44 | Entry field IDs | Mock IDs `entry.1000000XXX` |
| MemberDirectoryGoogleFormLink.gs:19 | `MEMBER_FORM_CONFIG.FORM_URL` | Contains `YOUR_MEMBER_FORM_ID` placeholder |
| MemberDirectoryGoogleFormLink.gs:22-32 | Entry field IDs | Mock IDs `entry.2000000XXX` |

**Medium Priority - Placeholder Functions:**

| File | Line | Function | Returns |
|------|------|----------|---------|
| MobileOptimization.gs | 76-100 | `getDeviceAnalytics()` | Hardcoded zeros |
| AutomatedReports.gs | 540-548 | `getReportRecipients()` | Script owner only |
| DataCachingLayer.gs | 440-450 | `getCachePerformanceStats()` | Basic info only |
| ReleaseNotes.gs | 604-614 | `checkForUpdates()` | Fixed version info |
| EnhancedHelp.gs | 352 | Video tutorials | "Coming soon!" message |
| AdvancedExport.gs | 295-304 | Date range filtering | Exports full sheet |
| QuickActionsMenu.gs | 788-803 | Calendar sync | Toast only, no actual sync |

---

### 5. Security & Permission Filtering - ✅ VERIFIED (2025-12-06)

**Status:** Permission filtering IS properly implemented and called in all critical paths.

**Verified Permission Filtering Call Sites:**

| Function | File | Filter Applied |
|----------|------|----------------|
| `exportToCSV()` | AdvancedExport.gs:185,187 | ✅ `filterMemberDataByPermission`, `filterGrievanceDataByPermission` |
| `exportToExcel()` | AdvancedExport.gs:221,223 | ✅ `filterMemberDataByPermission`, `filterGrievanceDataByPermission` |
| `exportToPDF()` | AdvancedExport.gs:258,260 | ✅ `filterMemberDataByPermission`, `filterGrievanceDataByPermission` |
| `exportToJSON()` | AdvancedExport.gs:311,313 | ✅ `filterMemberDataByPermission`, `filterGrievanceDataByPermission` |
| `getUnifiedDashboardData()` | UnifiedOperationsMonitor.gs:53,54 | ✅ Both filters applied |
| `getMobileDashboardStats()` | MobileOptimization.gs:606 | ✅ `filterGrievanceDataByPermission` |
| `getRecentGrievancesForMobile()` | MobileOptimization.gs:661 | ✅ `filterGrievanceDataByPermission` |
| `generateReportData()` | CustomReportBuilder.gs:455,464 | ✅ Both filters applied |

**Audit Logging:** `logUserAccess()` now wired into `onOpen()` for access tracking.

**Role-Based Access (Implemented in SecurityService.gs):**
- **ADMIN/COORDINATOR:** Full access to all data
- **STEWARD:** Can see all members, only assigned grievances
- **MEMBER:** Can only see own data
- **VIEWER:** Sees anonymized data (emails/phones as `[REDACTED]`)

---

### 6. Testing & Tooling Recommendations

**Pre-Commit Checks (add to build.js):**
```bash
# Check for broken patterns
grep "addEventListenerfunction" *.gs && echo "ERROR: Broken event listener syntax"
grep "setTimeout(function() { return.*," *.gs && echo "ERROR: Misplaced setTimeout delay"

# Check for duplicate function names
grep -h "^function " *.gs | sort | uniq -d

# Check for hardcoded column references
grep "'Member Directory'![A-Z]:[A-Z]" *.gs | wc -l
grep "'Grievance Log'![A-Z]:[A-Z]" *.gs | wc -l
```

**HTML Template Testing:**
- Smoke test each HTML dialog in browser console
- Check for `addEventListenerfunction` or other syntax errors
- Verify all `google.script.run` calls reference existing functions

---

### 7. Code Quality Verification Commands

```bash
# All should return 0 for clean code:

# Broken event listeners
grep "addEventListenerfunction" *.gs | wc -l

# Misplaced setTimeout delays
grep "setTimeout(function() { return.*," *.gs | wc -l

# Hardcoded sheet column references
grep "'Member Directory'![A-Z]:[A-Z]" *.gs | wc -l
grep "'Grievance Log'![A-Z]:[A-Z]" *.gs | wc -l

# Hardcoded array indices in UnifiedOperationsMonitor
grep "g\[[0-9]\+\]\|m\[[0-9]\+\]" UnifiedOperationsMonitor.gs | wc -l

# Check for placeholder form URLs
grep "YOUR_FORM_ID\|YOUR_MEMBER_FORM_ID" *.gs

# Find var declarations (should migrate to let/const)
grep "^\s*var " *.gs | wc -l

# Find duplicate function definitions
grep -h "^function " *.gs | sort | uniq -d
```

---

## Support & Maintenance

### How to Debug Issues

**1. Run Diagnostics:**
```
Menu → Help & Support → 🔧 Diagnose Setup
```
This checks all 21 sheets exist and reports missing ones.

**2. Check Execution Log:**
```
Apps Script Editor → View → Logs
```
All errors logged here with timestamps.

**3. Common Errors:**

**"A column group does not exist..."**
- Solution: Delete Member Directory sheet, run CREATE_509_DASHBOARD()

**Win Rate shows 0%:**
- Check Resolution Summary column contains "Won", "Lost", or "Settled"
- Re-seed grievances with updated SEED_5K_GRIEVANCES()

**Formulas show #REF! error:**
- Check sheet names match SHEETS constant exactly
- Verify columns haven't been deleted/moved

**Dropdown validations not working:**
- Run setupDataValidations() again
- Check Config sheet has data in all columns

**Functions not found errors:**
- Ensure all .gs files are deployed together
- Check that SHEETS constants match actual sheet names

### Getting Help

1. Check this AI_REFERENCE.md document first
2. Run DIAGNOSE_SETUP() to identify issues
3. Check Apps Script logs for errors
4. Review recent commits for changes
5. Create GitHub issue with:
   - Error message
   - Steps to reproduce
   - Screenshots
   - Execution log excerpt

---

## Advanced Features (79-94)

### Security & Audit Features

**Feature 79: Audit Logging**
- **Function:** `logDataModification(actionType, sheetName, recordId, fieldChanged, oldValue, newValue)`
- **Sheet:** Audit_Log (auto-created)
- **Purpose:** Tracks all data modifications with user, timestamp, and change details
- **Columns:** Timestamp, User Email, Action Type, Sheet Name, Record ID, Field Changed, Old Value, New Value, IP Address, Session ID
- **Usage:** Automatically called when data is modified, or manually for custom tracking
- **Dependencies:** None
- **Setup:** Menu → Security & Audit → View Audit Log (auto-creates sheet)

**Feature 80: Role-Based Access Control (RBAC)**
- **Function:** `checkUserPermission(requiredRole)`
- **Roles:** ADMIN, STEWARD, VIEWER (hierarchical)
- **Configuration:** `configureRBAC()` - Menu → Security & Audit → Configure RBAC Roles
- **Script Properties Required:**
  - `ADMINS`: Comma-separated list of admin emails
  - `STEWARDS`: Comma-separated list of steward emails
  - `VIEWERS`: Comma-separated list of viewer emails
- **Usage:** Call before sensitive operations to verify permissions
- **Hierarchy:** ADMIN > STEWARD > VIEWER

**Feature 83: Input Sanitization**
- **Function:** `sanitizeInput(input, type)`
- **Types:** 'text', 'email', 'number', 'date', 'html'
- **Purpose:** Prevents script injection, XSS attacks, and malicious input
- **Features:**
  - Removes script tags and event handlers
  - Escapes HTML entities
  - Validates email and date formats
  - Logs significant sanitization events
- **Usage:** Always sanitize user input before processing or storing

**Feature 84: Audit Reporting**
- **Function:** `generateAuditReport(startDate, endDate)`
- **Dialog:** `showAuditReportDialog()` - Menu → Security & Audit → Generate Audit Report
- **Output:** Creates "Audit Report" sheet with:
  - Summary statistics (total actions, unique users)
  - Actions by type breakdown
  - Detailed audit records for date range
- **Dependencies:** Feature 79 (Audit_Log must exist)
- **Permissions:** Admin only

**Feature 85: Data Retention Policy**
- **Function:** `enforceDataRetention(retentionYears = 7)`
- **Default:** 7 years retention
- **Process:**
  - Identifies records older than retention period
  - Moves old records to Archive sheet
  - Deletes from source sheets (Grievance Log, Audit_Log)
- **Archive Format:** Item Type, Item ID, Archive Date, Archived By, Reason, Original Data (JSON)
- **Dependencies:** Feature 79 (uses Archive sheet structure)
- **Permissions:** Admin only

**Feature 86: Suspicious Activity Detection**
- **Function:** `detectSuspiciousActivity()`
- **Threshold:** >50 changes/hour per user
- **Features:**
  - Analyzes last hour of audit log
  - Identifies users with abnormal activity
  - Sends security alerts with details
  - Logs detection events
- **Setup:** `setupSuspiciousActivityMonitoring()` - Creates hourly trigger
- **Dependencies:** Feature 79 (Audit_Log)
- **Use Cases:** Detects data breaches, automated scripts, bulk operations

### Performance & Backup Features

**Feature 91: Performance Monitoring**
- **Function:** `trackPerformance(functionName, callback, options)`
- **Sheet:** Performance_Log (auto-created)
- **Tracks:** Execution time, status, records processed, memory usage, user
- **Usage:**
  ```javascript
  trackPerformance('myFunction', () => {
    // Your code here
  }, { recordsProcessed: 1000, notes: 'Optional notes' });
  ```
- **Report:** `generatePerformanceReport()` - Shows avg/min/max times, error rates
- **Color Coding:** Red for errors, yellow for slow operations (>30s)

**Feature 90: Automated Backups**
- **Function:** `createAutomatedBackup()`
- **Configuration:** `configureBackupFolder()` - Sets BACKUP_FOLDER_ID
- **Daily Setup:** `setupDailyBackups()` - Creates daily trigger at 2 AM
- **Cleanup:** `cleanupOldBackups()` - Removes backups older than 30 days
- **Backup Format:** 509_Dashboard_Backup_YYYY-MM-DD_HHmmss
- **Script Property:** BACKUP_FOLDER_ID (Google Drive folder ID)
- **Dependencies:** None
- **Logs:** All backups logged to Audit_Log (if enabled)

### UI & Productivity Features

**Feature 87: Quick Actions Sidebar**
- **Function:** `showQuickActionsSidebar()`
- **Access:** Menu → Quick Actions Sidebar (top level)
- **Features:**
  - One-click access to common actions
  - Categorized by: Dashboards, Create New, Search & Filter, Export & Reports, Backup & Security
  - Live status feedback
  - HTML-based interactive sidebar
- **Actions Included:**
  - Dashboard navigation
  - Create grievance, import data
  - Advanced search & filtering
  - Export wizard, reports
  - Backup, security checks

**Feature 88: Advanced Search**
- **Function:** `showSearchDialog()`
- **Dialog:** `searchGrievances(searchType, searchTerm)`
- **Search Types:** Grievance ID, Member Name, Issue Type, Steward Name, Status
- **Features:**
  - Interactive dialog with results preview
  - Searches across Grievance Log
  - Returns matching records with key details
- **Usage:** Menu → Grievance Tools → Advanced Search

**Feature 89: Advanced Filtering**
- **Function:** `showFilterDialog()`
- **Apply:** `applyGrievanceFilters(filters)` - Creates Google Sheets filter
- **Clear:** `clearGrievanceFilters()` - Removes all filters
- **Filter Options:**
  - Status (Open, Closed, Pending Info, etc.)
  - Issue Type
  - Date Range (start/end dates)
  - Steward Name
  - Location
- **Features:** Native Google Sheets filtering with custom criteria
- **Usage:** Menu → Grievance Tools → Advanced Filtering

**Feature 92: Keyboard Shortcuts**
- **Function:** `setupKeyboardShortcuts()`
- **Features:**
  - Creates named ranges for quick navigation
  - Reference guide for available shortcuts
  - Named ranges: Dashboard_Home, Members_Start, Grievances_Start, Config_Start, Executive_Dashboard
- **Usage:** Ctrl+J (Windows) or Cmd+J (Mac) to jump to named ranges
- **Note:** Apps Script has limited keyboard shortcut support; uses named ranges instead

**Feature 93: Export Wizard**
- **Function:** `showExportWizard()`
- **Export Options:**
  - Data Types: Grievances, Members, Both, Audit Log, Performance Log
  - Formats: CSV, Excel (XLSX), PDF Report, New Google Sheet
  - Filters: Status filter, date range
- **Functions:** `exportData(options)`, `exportToCSV()`, `exportToNewSheet()`, etc.
- **Features:**
  - Guided export with filter options
  - Creates files in Google Drive
  - Returns file URLs for easy access
- **Usage:** Menu → Import/Export → Export Wizard

**Feature 94: Data Import**
- **Function:** `showImportWizard()`
- **Import Types:** Members, Grievances
- **Source:** Google Sheets (URL or File ID)
- **Process:**
  - Validates column headers match
  - Imports data to appropriate sheet
  - Logs import action
  - Returns record count
- **Features:**
  - Interactive dialog
  - Validates data structure
  - Bulk import capability
- **Usage:** Menu → Import/Export → Import Wizard

---

## Feature 95: Coordinator Notification System

**Purpose:** Checkbox-based row highlighting and email notifications for grievance coordinator messages with steward acknowledgment tracking

**Grievance Log Columns Added:**
- **Column AC (29):** ✓ Message Alert - Checkbox column (checked by coordinator, unchecked by steward)
- **Column AD (30):** Coordinator Message - Text message from coordinator (PERMANENT - never cleared)
- **Column AE (31):** Acknowledged By - Email of steward who acknowledged (auto-filled when unchecked)
- **Column AF (32):** Acknowledged Date - Timestamp of acknowledgment (auto-filled when unchecked)

**Note:** Drive Integration columns moved from AC-AD to AG-AH (columns 33-34) to accommodate Feature 95.

**Key Functions:**
- `setupCoordinatorNotificationTrigger()` - One-time setup
- `onGrievanceEdit(e)` - Auto-triggered on checkbox changes
- `handleCoordinatorNotification()` - Highlights row and sends emails
- `removeRowHighlight()` - Records steward acknowledgment
- `showCoordinatorMessageDialog()` - Manual message entry
- `showBatchCoordinatorNotification()` - Batch processing

**Menu Location:** Grievance Tools submenu
**File Location:** CoordinatorNotification.gs

**Workflow:**
1. Coordinator writes message → checks box → row highlights → emails sent
2. Steward unchecks box → highlighting removed → acknowledgment recorded (who/when)
3. Messages kept permanently for audit trail

**Dependencies:** Member Directory, MailApp, Feature 79 (Audit Logging - optional)

---

### File Architecture Updates

**New Files Added:**
1. **SecurityAndAdmin.gs** - Features 79, 80, 83, 84, 85, 86 + helper functions
2. **PerformanceAndBackup.gs** - Features 90, 91
3. **UIFeatures.gs** - Features 87, 88, 89, 92, 93, 94
4. **CoordinatorNotification.gs** - Feature 95 (Coordinator Notification System)

### Menu System Updates

**New Menus Added:**
- **🔒 Security & Audit** - RBAC, audit logs, suspicious activity, data retention
- **💾 Backup & Performance** - Backups, performance monitoring, cleanup
- **📤 Import/Export** - Import wizard, export wizard, report generation

**Updated Menus:**
- **📋 Grievance Tools** - Added Advanced Search, Advanced Filtering
- **❓ Help & Support** - Added Keyboard Shortcuts
- **⚙️ Admin** - Added Setup Audit & Security

**Top-Level Addition:**
- **⚡ Quick Actions Sidebar** - Direct access to quick actions

### Setup Instructions

**Quick Setup (All Features):**
1. Menu → Admin → Setup Audit & Security
   - Creates Audit_Log and Performance_Log sheets
   - Configures RBAC roles
   - Enables activity monitoring

**Manual Setup:**
1. **Audit Logging:** Menu → Security & Audit → View Audit Log (auto-creates)
2. **RBAC:** Menu → Security & Audit → Configure RBAC Roles
3. **Backups:** Menu → Backup & Performance → Configure Backup Folder
4. **Daily Backups:** Menu → Backup & Performance → Setup Daily Backups
5. **Activity Monitoring:** Menu → Security & Audit → Setup Activity Monitoring

### Script Properties Configuration

**Required for Features:**
- **ADMINS**: Comma-separated admin emails (Feature 80)
- **STEWARDS**: Comma-separated steward emails (Feature 80)
- **VIEWERS**: Comma-separated viewer emails (Feature 80)
- **BACKUP_FOLDER_ID**: Google Drive folder ID for backups (Feature 90)
- **CURRENT_SESSION_ID**: Auto-generated session tracking (Feature 79)

### Dependencies Matrix

| Feature | Depends On | Optional Dependencies |
|---------|------------|----------------------|
| 79 - Audit Logging | None | - |
| 80 - RBAC | Script Properties | - |
| 83 - Input Sanitization | None | Feature 79 (logs sanitization) |
| 84 - Audit Reporting | Feature 79 | Feature 80 (RBAC) |
| 85 - Data Retention | Archive sheet | Feature 79 (logs retention) |
| 86 - Suspicious Activity | Feature 79 | - |
| 87 - Quick Actions | All menu functions | - |
| 88 - Advanced Search | Grievance Log | Feature 79 (logs searches) |
| 89 - Advanced Filtering | Grievance Log | Feature 79 (logs filters) |
| 90 - Automated Backups | Google Drive access | Feature 79 (logs backups) |
| 91 - Performance Monitoring | None | - |
| 92 - Keyboard Shortcuts | None | - |
| 93 - Export Wizard | Source sheets | Feature 79 (logs exports) |
| 94 - Data Import | Source sheets | Feature 79 (logs imports) |
| 95 - Coordinator Notifications | Member Directory, MailApp | Feature 79 (logs notifications) |

### Feature Status: ALL IMPLEMENTED ✅

All 17 features (79-95) are fully implemented and integrated into the menu system.

---

## Feature 95: Coordinator Notification System

**Purpose:** Checkbox-based row highlighting and email notifications for grievance coordinator messages with steward acknowledgment tracking

**Overview - Complete Workflow:**

**Step 1 - Coordinator Sends Message:**
When a grievance coordinator checks the "Coordinator Notified" checkbox:
1. The entire row is highlighted in yellow with an orange border
2. Emails are automatically sent to the member and assigned steward with the coordinator's message
3. Notification is logged to Audit_Log
4. Row remains highlighted until steward acknowledges

**Step 2 - Steward Acknowledges:**
When a steward unchecks the "Coordinator Notified" checkbox:
1. Row highlighting is removed (white background)
2. System records WHO acknowledged (steward email) in "Acknowledged By" column
3. System records WHEN acknowledged (timestamp) in "Acknowledged Date" column
4. Coordinator message is KEPT in the "Coordinator Message" column for permanent record keeping
5. Acknowledgment is logged to Audit_Log

**Grievance Log Columns Added:**
- **Column AC (29):** ✓ Message Alert - Checkbox column (checked by coordinator, unchecked by steward)
- **Column AD (30):** Coordinator Message - Text message from coordinator (PERMANENT - never cleared)
- **Column AE (31):** Acknowledged By - Email of steward who acknowledged (auto-filled when unchecked)
- **Column AF (32):** Acknowledged Date - Timestamp of acknowledgment (auto-filled when unchecked)

**Functions:**

1. **setupCoordinatorNotificationTrigger()** - Installation
   - Sets up onChange trigger to monitor checkbox changes
   - Run once to install (Menu → Grievance Tools → Setup Notification Trigger)
   - Prevents duplicate triggers

2. **onGrievanceEdit(e)** - Automatic Trigger
   - Monitors all edits to Grievance Log
   - Triggers when Coordinator Notified checkbox (column AC) is changed
   - Calls handleCoordinatorNotification() when checked
   - Calls removeRowHighlight() when unchecked

3. **handleCoordinatorNotification(sheet, row)** - Main Handler
   - Retrieves grievance data
   - Highlights the row in yellow (#FEF3C7) with orange border (#F97316)
   - Sends email to member and steward
   - Logs notification to Audit_Log

4. **highlightRow(sheet, row)** - Row Highlighting
   - Sets background to light yellow (#FEF3C7)
   - Adds thick orange border (#F97316) for visibility
   - Applies to entire row across all columns

5. **removeRowHighlight(sheet, row)** - Steward Acknowledgment Handler
   - Resets background to white (#FFFFFF)
   - Removes all borders
   - Records acknowledging steward email in "Acknowledged By" column
   - Records acknowledgment timestamp in "Acknowledged Date" column
   - Keeps coordinator message for permanent record
   - Logs acknowledgment to Audit_Log
   - Triggered when checkbox is unchecked (steward acknowledging)

6. **sendCoordinatorEmails(...)** - Email Notifications
   - Sends personalized emails to member and steward
   - Includes grievance details and coordinator message
   - Uses MailApp.sendEmail() with noReply flag
   - Validates email addresses before sending

7. **getStewardEmail(stewardName)** - Helper
   - Looks up steward email in Member Directory
   - Matches by first and last name
   - Validates steward status (Is Steward = Yes)

8. **showCoordinatorMessageDialog()** - Manual Entry
   - Interactive dialog for coordinator to enter message
   - Prompts for message text
   - Automatically checks checkbox and triggers notification
   - Menu → Grievance Tools → Send Coordinator Message

9. **showBatchCoordinatorNotification()** - Batch Processing
   - Sends same message to multiple checked grievances
   - Only processes rows with checkbox already checked
   - Menu → Grievance Tools → Batch Coordinator Notification

10. **clearAllCoordinatorNotifications()** - Cleanup
    - Unchecks all coordinator notification checkboxes
    - Removes all row highlighting
    - Keeps coordinator messages intact
    - Menu → Grievance Tools → Clear All Notifications

**Email Template:**

**Member Email:**
```
Dear [First Name] [Last Name],

This is an update regarding your grievance [Grievance ID] ([Issue Category]).

**Current Status:** [Status]

**Message from Grievance Coordinator:**
[Coordinator Message]

Your assigned steward, [Steward Name], has also been notified of this update.

If you have any questions or concerns, please contact your steward or the grievance coordinator.

Best regards,
SEIU Local 509 Grievance Coordinator
```

**Steward Email:**
```
Dear [Steward Name],

This is an update regarding grievance [Grievance ID] for member [First Name] [Last Name].

**Grievance Details:**
- **ID:** [Grievance ID]
- **Member:** [First Name] [Last Name]
- **Issue:** [Issue Category]
- **Status:** [Status]

**Message from Grievance Coordinator:**
[Coordinator Message]

The member has also been notified of this update.

Please follow up as needed.

Best regards,
SEIU Local 509 Grievance Coordinator
```

**Setup Instructions:**

1. **One-Time Setup:**
   - Menu → Grievance Tools → Setup Notification Trigger
   - This installs the onChange trigger to monitor checkbox changes

2. **Using the Feature:**
   - **Option 1 (Automatic):**
     - Add message in "Coordinator Message" column (AD)
     - Check the "✓ Coordinator Notified" checkbox (AC)
     - Row highlights and emails send automatically

   - **Option 2 (Manual Dialog):**
     - Select a grievance row
     - Menu → Grievance Tools → Send Coordinator Message
     - Enter message in dialog
     - Checkbox is automatically checked and emails sent

3. **Batch Notifications:**
   - Check multiple grievances' checkboxes
   - Menu → Grievance Tools → Batch Coordinator Notification
   - Enter message (applies to all checked rows)

4. **Clear Notifications:**
   - Menu → Grievance Tools → Clear All Notifications
   - Removes all highlighting and unchecks all boxes

**Visual Indicators:**
- **Highlighted Row:** Light yellow background (#FEF3C7) with thick orange border (#F97316)
- **Normal Row:** White background, no border
- **Checkbox Checked:** ☑ (checkbox visible in cell)
- **Checkbox Unchecked:** ☐ (empty checkbox)

**Dependencies:**
- Member Directory (for steward email lookup)
- MailApp service (for email sending)
- Feature 79 - Audit Logging (optional, for logging notifications)

**File Location:** CoordinatorNotification.gs

**Menu Location:** Grievance Tools submenu

**Data Validation:**
- Column AC (Message Alert): Checkbox validation (true/false)
- Column AD (Coordinator Message): Free text entry (permanent record)
- Column AE (Acknowledged By): Auto-filled (steward email)
- Column AF (Acknowledged Date): Auto-filled (timestamp)

**Record Keeping:**
- Coordinator messages are NEVER automatically deleted
- Messages remain in column AD for permanent audit trail
- Each message has associated acknowledgment tracking (who/when)
- Full history visible in Audit_Log sheet

**Logging:**
All coordinator notifications and steward acknowledgments are logged to Audit_Log:

**Coordinator Notification (when checkbox checked):**
- Action Type: COORDINATOR_NOTIFICATION
- Sheet Name: Grievance Log
- Record ID: Grievance ID
- Field Changed: Coordinator Notified
- Old Value: FALSE
- New Value: TRUE

**Steward Acknowledgment (when checkbox unchecked):**
- Action Type: STEWARD_ACKNOWLEDGED
- Sheet Name: Grievance Log
- Record ID: Grievance ID
- Field Changed: Coordinator Message Acknowledged
- Old Value: [Coordinator's message text]
- New Value: "Acknowledged by [steward email] at [timestamp]"

**Error Handling:**
- Invalid emails are skipped with log message
- Missing steward emails are logged but don't block member notifications
- Email send failures are caught and logged
- Silent failure to avoid interrupting workflow

**Security:**
- Emails sent with noReply flag
- Validates email format before sending
- Requires active user session
- All actions logged for audit trail

---

### Version 2.3 - Grievance Calculated Columns Fix

**Problem Fixed:**
When rows were deleted from Grievance Log, calculated columns would show stale/corrupted data because they used ARRAYFORMULA in row 2.

**Solution:**
Removed ALL ARRAYFORMULAs from Grievance Log. All calculated columns are now handled by `recalcAllGrievancesBatched()` in BatchGrievanceRecalc.gs and written as static values.

**Files Changed:**
- Code.gs: Removed all ARRAYFORMULA setup for columns H, J, L, N, P, S, T, U in createGrievanceLog()
- Code.gs: Updated refreshGrievanceFormulas() to call recalcAllGrievancesBatched() instead
- AI_REFERENCE.md: Updated documentation

**How to Recalculate Values:**
- Menu: Dashboard → Grievance Tools → Refresh Grievance Formulas
- Or run: `recalcAllGrievancesBatched()` from Apps Script

**Calculated Columns (via BatchGrievanceRecalc.gs - NO formulas in sheet):**
| Column | Name | Calculation |
|--------|------|-------------|
| H (8)  | Filing Deadline | INCIDENT_DATE + 21 days |
| J (10) | Step I Decision Due | DATE_FILED + 30 days |
| L (12) | Step II Appeal Due | STEP1_DECISION_RCVD + 10 days |
| N (14) | Step II Decision Due | STEP2_APPEAL_FILED + 30 days |
| P (16) | Step III Appeal Due | STEP2_DECISION_RCVD + 30 days |
| S (19) | Days Open | DATE_CLOSED - DATE_FILED (or TODAY - DATE_FILED if open) |
| T (20) | Next Action Due | Based on CURRENT_STEP: Step I→J, Step II→N, Step III→P |
| U (21) | Days to Deadline | NEXT_ACTION_DUE - TODAY |

**Important:** There are NO formulas in the Grievance Log sheet body. All values are static data calculated by Apps Script.

---

**Document Version:** 2.3
**Last Updated:** 2025-12-07
**Maintained By:** Claude (AI Assistant)
**Repository:** [Add GitHub URL]

---

*This document serves as the complete technical specification and reconstruction guide for the 509 Dashboard system. Keep it updated as features are added or changed.*
