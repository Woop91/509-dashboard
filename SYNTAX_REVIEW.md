# Detailed Syntax Review - Code.gs (47,779 lines)

**Date:** 2026-03-13
**Reviewer:** Automated + Manual
**Files Reviewed:** Code.gs, build.js, verify-columns.js, fix_*.py, package.json

---

## CRITICAL BUGS (Will Cause Runtime Errors or Silent Failures)

### 1. Undefined Property References in GRIEVANCE_COLS (7 occurrences)

The following properties are referenced on `GRIEVANCE_COLS` but only exist on `GRIEVANCE_COLUMNS` (0-indexed) or don't exist at all:

| Property Used | Line(s) | Should Be | Impact |
|---|---|---|---|
| `GRIEVANCE_COLS.CATEGORY` | 13613 | `GRIEVANCE_COLS.ISSUE_CATEGORY` | Category data always falls back to `'Other'` |
| `GRIEVANCE_COLS.MEMBER_NAME` | 13614 | `GRIEVANCE_COLS.FIRST_NAME` (+ LAST_NAME) | Member name always shows `'Unknown'` |
| `GRIEVANCE_COLS.ASSIGNED_STEWARD` | 26806 | `GRIEVANCE_COLS.STEWARD` | Steward always shows as `''` |
| `GRIEVANCE_COLS.STEP_1_DATE` | 13770 | `GRIEVANCE_COLS.STEP1_RCVD` | Step 1 denial rate calculation broken |
| `GRIEVANCE_COLS.STEP_2_DATE` | 13713, 13772 | `GRIEVANCE_COLS.STEP2_APPEAL_FILED` | Step 2 denial rate calculation broken |
| `GRIEVANCE_COLS.STEP_3_DATE` | 13715 | `GRIEVANCE_COLS.STEP3_APPEAL_FILED` | Step 3 tracking broken |
| `GRIEVANCE_COLS.STEP3_RCVD` | 42826 | No equivalent exists | Always undefined (Step III has no "Received" column) |

### 2. Undefined Property References in MEMBER_COLS (7 occurrences)

| Property Used | Line(s) | Should Be | Impact |
|---|---|---|---|
| `MEMBER_COLS.FULL_NAME` | 13408 | `MEMBER_COLS.FIRST_NAME` (+ LAST_NAME) | Member name shows as `undefined` minus 1 index |
| `MEMBER_COLS.LAST_UPDATED` | 13414 | No equivalent | Always undefined |
| `MEMBER_COLS.TOTAL_GRIEVANCES` | 3821, 3825 | No equivalent | Conditional check fails (safe due to falsy check) |
| `MEMBER_COLS.ACTIVE_GRIEVANCES` | 3821, 3826 | No equivalent | Conditional check fails (safe due to falsy check) |
| `MEMBER_COLS.TOTAL_CASES` | 25647 | No equivalent | Always returns `0` |
| `MEMBER_COLS.WINS` | 25648 | No equivalent | Always returns `0` |
| `MEMBER_COLS.DUES_PAYING` | 10005 | No equivalent | Array index NaN, data lost during import |

### 3. Undefined Property Reference in CONFIG_COLS (1 occurrence)

| Property Used | Line | Should Be | Impact |
|---|---|---|---|
| `CONFIG_COLS.CONTRACT_URL` | 43135 | Undefined | `getContractPdfUrl_()` always returns `'#'` |

---

## SECURITY ISSUES

### 4. XSS Vulnerabilities - Unescaped User Data in HTML (HIGH)

User-controlled data (names, emails, IDs) are interpolated directly into HTML strings without calling `escapeHtml()`. Despite having an `escapeHtml` function defined at line 94, it is only used 16 times across 47K+ lines while `createHtmlOutput()` is called 30+ times with string concatenation.

**Key vulnerable locations:**
- **Line 7374**: `name`, `memberId`, `email` injected into HTML + JavaScript string
- **Lines 7215-7218**: `memberId`, `email` injected into onclick handlers
- **Lines 7287-7289**: `grievanceId`, `memberId`, `memberEmail` in onclick handlers
- **Line 7681**: `memberId` injected into HTML

**Risk:** A member name like `<script>alert(1)</script>` stored in the spreadsheet would execute arbitrary JavaScript in the dialog. Google's HtmlService has some CSP protections, but the code should still sanitize.

### 5. Loose Equality Comparison (LOW)

- **Lines 43299, 43333**: Use `==` instead of `===` for memberId comparison. Could cause type coercion issues if numeric IDs are stored as numbers in some rows and strings in others.

---

## JSON.parse Without try/catch (MEDIUM)

### 6. Unprotected JSON.parse Calls

| Line | Context | Risk |
|---|---|---|
| 18595 | Cache deserialization | Corrupted cache causes crash |
| 18602 | Properties cache deserialization | Same |
| 18919 | Undo history deserialization | Same |
| 14211 | Dashboard data parsing | Same |

---

## ES5/ES6 MIXED SYNTAX (INFO)

### 7. Inconsistent JavaScript Dialect

The file mixes ES5 and ES6 syntax:
- **4,540** uses of `var`
- **738** uses of `const`
- **89** uses of `let`
- **35** arrow functions (`=>`)

Sections around lines 4900-5500 use `const`, `let`, and arrow functions, while the rest of the file predominantly uses `var` and `function()`. If the GAS V8 runtime is enabled, this works. If not, the ES6 sections will fail.

---

## REDUNDANT ALIASES (INFO)

### 8. Duplicate Constant Naming

- `SHEET_NAMES` = `SHEETS` (line 1964) - Redundant alias
- `GRIEVANCE_COLUMNS` (0-indexed) mirrors `GRIEVANCE_COLS` (1-indexed) but with different naming conventions - error-prone
- `GRIEVANCE_STATUS.RESOLVED` = `'Settled'` same as `GRIEVANCE_STATUS.SETTLED` - confusing alias

---

## EMPTY CATCH BLOCKS (LOW)

### 9. Silently Swallowed Errors

| Line | Context | Verdict |
|---|---|---|
| 18829 | JSON.parse of optional cache age | Acceptable |
| 43138 | Config sheet URL lookup (has fallback) | Acceptable |
| 43154 | Config sheet URL lookup (has fallback) | Acceptable |
| 15440 | Client-side goal loading | Acceptable |

---

## SUPPORT SCRIPTS

### 10. fix_remaining_es6.py - Overly Aggressive Regex (MEDIUM)

- **Line 54**: `.add()` replacement matches ALL `.add()` calls, not just Set methods
- **Line 56**: `.has()` replacement matches ALL `.has()` calls
- **Line 58**: `.size` replacement matches ALL `.size` properties
- These would break `SpreadsheetApp.getUi().add()`, `Map.has()`, etc.

### 11. fix_transaction_v2.py - Data Loss Bug (HIGH)

- **Line 26**: Slices content to 5000 chars, applies regex to the slice, then reassigns `content` to just the modified slice, losing the rest of the file.

### 12. verify-columns.js - Hardcoded Expected Values (LOW)

- Lines 46, 66: Expected column counts (31, 34) are hardcoded rather than derived from constants
- Will need manual update if columns are added

---

## SUMMARY

| Severity | Count | Description |
|---|---|---|
| CRITICAL | 15 | Undefined property references causing silent data loss |
| HIGH | 1 | XSS vulnerabilities in HTML construction |
| HIGH | 1 | fix_transaction_v2.py data loss bug |
| MEDIUM | 4 | Unprotected JSON.parse calls |
| MEDIUM | 1 | Overly aggressive regex in fix_remaining_es6.py |
| LOW | 2 | Loose equality, empty catch blocks |
| INFO | 2 | Mixed ES5/ES6 syntax, redundant aliases |
