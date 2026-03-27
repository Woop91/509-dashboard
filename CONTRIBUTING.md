# Contributing to 509 Dashboard

This document explains the development workflow for the 509 Dashboard Google Apps Script project.

## Project Structure

```
509-dashboard/
├── Constants.gs              # All configuration constants (SHEETS, COLORS, etc.)
├── Code.gs                   # Main entry point, setup functions (48KB)
├── SeedNuke.gs               # Data seeding & clearing functions (23KB)
├── ADHDFeatures.gs           # ADHD accessibility & theming (14KB)
├── HiddenSheets.gs           # Hidden sheet architecture (76KB)
├── MobileQuickActions.gs     # Mobile interface & quick actions (28KB)
├── PerformanceUndo.gs        # Performance caching & undo/redo (16KB)
├── TestingValidation.gs      # Testing framework & validation (25KB)
├── build.js                  # Build script (generates consolidated file)
├── verify-columns.js         # Column verification tool
└── ConsolidatedDashboard.gs  # AUTO-GENERATED - DO NOT EDIT (250KB)
```

## Golden Rule: Single Source of Truth

**Each constant must be defined in exactly ONE file.** The build script will fail if duplicates are detected.

| Constant Type | Defined In |
|---------------|------------|
| `SHEETS`, `COLORS`, `MEMBER_COLS`, `GRIEVANCE_COLS` | `Constants.gs` |
| `SECURITY_ROLES`, `ADMIN_EMAILS`, `RATE_LIMITS` | `SecurityUtils.gs` |
| `ROLES` (with permissions) | `SecurityService.gs` |
| All other config (`CACHE_CONFIG`, `FEATURE_FLAGS`, etc.) | `Constants.gs` |

## Development Workflow

### 1. Make Changes in Source Modules

```bash
# Edit the appropriate source file
# Example: To change a sheet name, edit Constants.gs
# Example: To add an admin, edit SecurityUtils.gs
```

**Never edit `ConsolidatedDashboard.gs` directly!** It's auto-generated.

### 2. Run the Build

```bash
# Development build (includes tests)
node build.js

# Production build (excludes tests)
node build.js --production

# Check for duplicate declarations only
node build.js --check-duplicates

# Clean and rebuild
node build.js --clean
```

### 3. Verify the Build

The build will:
1. Check for duplicate constant declarations
2. Fail the build if duplicates are found
3. Concatenate all modules in dependency order
4. Generate `ConsolidatedDashboard.gs`

### 4. Deploy to Google Apps Script

1. Open your Google Sheet
2. Go to Extensions > Apps Script
3. Replace the content with `ConsolidatedDashboard.gs`
4. Save and run `onOpen()` to verify

## Module Responsibilities

### Core Infrastructure (Load First)

| Module | Responsibility |
|--------|----------------|
| `Constants.gs` | All configuration constants |
| `SecurityUtils.gs` | RBAC, sanitization, audit logging |
| `SecurityService.gs` | Advanced permissions, user role management |
| `Code.gs` | Main setup, menu creation, sheet setup |

### Feature Modules

Each feature module should:
- Have a single, focused responsibility
- Use constants from `Constants.gs` (never redefine them)
- Use security functions from `SecurityUtils.gs`
- Export functions that integrate with the main menu

### Test Modules

| Module | Purpose |
|--------|---------|
| `TestFramework.gs` | Assert utilities, test runner |
| `Code.test.gs` | Unit tests for core functionality |
| `Integration.test.gs` | End-to-end workflow tests |

**Important:** Tests are excluded from production builds (`--production` flag).

## Adding New Configuration

1. Determine the appropriate module for your config
2. Add the constant with `const` keyword
3. Add it to the `CRITICAL_CONSTANTS` list in `build.js` if it should be unique
4. Document it in the Configuration Reference section of `Constants.gs`

Example:
```javascript
// In Constants.gs
const MY_NEW_CONFIG = {
  setting1: 'value1',
  setting2: 'value2'
};
```

## Adding Admin Users

1. Edit `SecurityUtils.gs`
2. Add the email to `ADMIN_EMAILS` array:
   ```javascript
   const ADMIN_EMAILS = [
     'admin@seiu509.org',
     'president@seiu509.org',
     'techsupport@seiu509.org',
     'new.admin@seiu509.org'  // Add new admin here
   ];
   ```
3. Run `node build.js`

## Running Tests

Tests run via the Google Apps Script UI:
1. Deploy the development build (includes tests)
2. Open the sheet
3. Go to menu: 🧪 Tests > Run All Tests
4. View results in the generated test report sheet

## Common Issues

### "Duplicate declaration detected" build error

**Cause:** The same constant is defined in multiple files.

**Fix:**
1. Identify which file should own the constant (check the table above)
2. Remove the duplicate from other files
3. Re-run the build

### "SHEETS.XYZ is undefined" runtime error

**Cause:** You're using a sheet name that doesn't exist in `Constants.gs`.

**Fix:**
1. Add the sheet name to `SHEETS` in `Constants.gs`
2. Re-run the build

### Tests running in production

**Cause:** Using development build in production.

**Fix:**
1. Run `node build.js --production`
2. Deploy the production build

## Build Script Options

```
node build.js [options]

Options:
  --help, -h            Show help
  --verify, -v          Verify modules exist (no build)
  --clean, -c           Remove old build artifacts
  --quiet, -q           Suppress verbose output
  --production, -p      Exclude test files
  --no-tests            Same as --production
  --check-duplicates    Only check for duplicates
```

## File Naming Conventions

- `*.gs` - Google Apps Script files
- `*.test.gs` - Test files (excluded in production)
- `PascalCase.gs` - Feature modules
- `camelCase` - Function names
- `SCREAMING_SNAKE_CASE` - Constants

## Questions?

For issues or questions:
1. Check this document first
2. Review the Configuration Reference in `Constants.gs`
3. Run `node build.js --check-duplicates` to verify config integrity
