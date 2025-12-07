#!/usr/bin/env node

/**
 * BUILD SCRIPT FOR 509 DASHBOARD
 * ================================
 *
 * This script automatically builds the consolidated dashboard file
 * from individual modules, eliminating manual sync issues.
 *
 * Features:
 * - Concatenates all modules in dependency order
 * - Detects duplicate global declarations and fails the build
 * - Option to exclude test files for production builds
 * - Validates module existence
 *
 * Usage:
 *   node build.js                    # Full build with tests
 *   node build.js --production       # Production build (no tests)
 *   node build.js --no-tests         # Same as --production
 *   node build.js --check-duplicates # Only check for duplicates
 *
 * Output:
 *   ConsolidatedDashboard.gs - Auto-generated consolidated file
 *
 * DO NOT edit ConsolidatedDashboard.gs directly!
 * Edit individual modules and run this script to rebuild.
 */

const fs = require('fs');
const path = require('path');

/**
 * MODULE DEPENDENCY GRAPH
 * =======================
 *
 * Module loading order is critical. Dependencies must be loaded before dependents.
 *
 * Legend:
 * [CORE] = No dependencies, can be loaded first
 * [DEPENDS: X, Y] = Requires modules X and Y to be loaded first
 *
 * Dependency Hierarchy:
 *
 * Level 0 (No Dependencies):
 *   - Constants.gs
 *
 * Level 1 (Depends on Constants only):
 *   - SecurityUtils.gs
 *   - TestConfig.gs
 *   - HTMLTemplates.gs
 *   - I18n.gs
 *
 * Level 2 (Depends on Level 0-1):
 *   - Code.gs (Depends: Constants, SecurityUtils)
 *   - DataArchiving.gs (Depends: Constants, SecurityUtils, HTMLTemplates)
 *
 * Level 3+ (Depends on Level 0-2):
 *   - All feature modules (Depends: Constants, SecurityUtils, Code.gs)
 *   - Test modules (Depends: Constants, TestConfig)
 */

// Module order matters - dependencies must come first
// CORE_MODULES - All production modules (no tests)
const CORE_MODULES = [
  // ===== LEVEL 0: CORE INFRASTRUCTURE (NO DEPENDENCIES) =====
  'Constants.gs',  // [CORE] Provides: SHEETS, MEMBER_COLS, COLORS, ERROR_MESSAGES, etc.

  // ===== LEVEL 1: DEPENDS ON CONSTANTS ONLY =====
  'SecurityUtils.gs',   // [DEPENDS: Constants] Provides: sanitizeHTML, requireRole, isAdmin
  'HTMLTemplates.gs',   // [DEPENDS: Constants] Provides: createHTMLPage, createButton, etc.
  'I18n.gs',           // [DEPENDS: Constants] Provides: t(), getUserLanguage, translations
  'TestConfig.gs',     // [DEPENDS: Constants] Provides: TEST_CONFIG, getTestSpreadsheet

  // ===== LEVEL 2: MAIN SETUP & UTILITIES =====
  'Code.gs',           // [DEPENDS: Constants, SecurityUtils] Provides: CREATE_509_DASHBOARD, onOpen
  'DataArchiving.gs',  // [DEPENDS: Constants, SecurityUtils, HTMLTemplates] Provides: archiveOldGrievances

  // ===== LEVEL 3: FEATURE MODULES (ALPHABETICAL) =====
  // All feature modules depend on: Constants, SecurityUtils, Code.gs
  'ADHDEnhancements.gs',
  'AdminGrievanceMessages.gs',
  'AdvancedExport.gs',
  'AdvancedVisualization.gs',
  'AuditLoggingRBAC.gs',          // Audit logging and role-based access control
  'AutoRefresh.gs',
  'BenchmarkTools.gs',
  'EnhancedADHDFeatures.gs',
  'EnhancedHelp.gs',              // Enhanced help system
  'AutomatedNotifications.gs',
  'AutomatedReports.gs',
  'BatchGrievanceRecalc.gs',
  'BatchOperations.gs',
  'CalendarIntegration.gs',
  'ColumnToggles.gs',
  'ContextSensitiveHelp.gs',        // Context-sensitive help system
  'CoordinatorNotification.gs',      // Feature 95: Coordinator notification system
  'CustomReportBuilder.gs',
  'DarkModeThemes.gs',
  'DashboardFixes.gs',            // Dashboard fix utilities and analytics population
  'DataBackupRecovery.gs',
  'DataCachingLayer.gs',
  'DataIntegrityEnhancements.gs',
  'DataPagination.gs',
  'DistributedLocks.gs',
  'EmailUnsubscribeSystem.gs',     // Email opt-out/unsubscribe system
  'EnhancedErrorHandling.gs',
  'EnhancedValidation.gs',         // Email/phone validation system
  'FAQKnowledgeBase.gs',
  'GettingStartedAndFAQ.gs',
  'GmailIntegration.gs',
  'GoogleDriveIntegration.gs',
  'GracefulDegradation.gs',
  'GrievanceFloatToggle.gs',
  'GrievanceWorkflow.gs',
  'IdempotentOperations.gs',
  'IncrementalBackupSystem.gs',
  'InteractiveDashboard.gs',
  'InteractiveTutorial.gs',         // Interactive onboarding tutorials
  'KeyboardShortcuts.gs',
  'LazyLoadCharts.gs',
  'MemberDirectoryDropdowns.gs',
  'MemberDirectoryGoogleFormLink.gs',
  'MemberSearch.gs',
  'MobileOptimization.gs',
  'NotificationCenter.gs',
  'OperationsAnalytics.gs',       // Merged analytics dashboard (Trends, Location, Type, Member Engagement, Cost Impact)
  'OptimizedDashboardRebuild.gs',
  'PerformanceAndBackup.gs',      // Performance monitoring and backup features
  'PerformanceMonitoring.gs',
  'Phase6Integration.gs',
  'PIIProtection.gs',               // PII protection and GDPR compliance
  'PredictiveAnalytics.gs',
  'QuickActionsMenu.gs',            // Right-click context menu
  'QuickFilters.gs',
  'ReleaseNotes.gs',                // Release notes and version tracking
  'ReorganizedMenu.gs',
  'RootCauseAnalysis.gs',
  'SecurityAndAdmin.gs',          // Security and admin functions
  'SecurityService.gs',           // Advanced security service layer
  'SeedNuke.gs',
  'SessionManagement.gs',           // Session management and user tracking
  'SmartAutoAssignment.gs',
  'TransactionRollback.gs',
  'UIFeatures.gs',                // UI-specific features
  'UndoRedoSystem.gs',
  'UnifiedOperationsMonitor.gs',
  'UtilityService.gs',
  'WorkflowStateMachine.gs'
];

// TEST_MODULES - Test modules (excluded in production builds)
const TEST_MODULES = [
  'TestFramework.gs',     // [DEPENDS: Constants, TestConfig] Provides: runAllTests, Assert
  'Code.test.gs',         // [DEPENDS: TestFramework, Code.gs] Unit tests
  'Integration.test.gs'   // [DEPENDS: TestFramework, All modules] Integration tests
];

/**
 * Module dependency validation
 * Checks if all module dependencies are satisfied
 */
function validateModuleDependencies() {
  console.log('🔍 Validating module dependencies...\n');

  const ALL_MODULES = [...CORE_MODULES, ...TEST_MODULES];
  const moduleSet = new Set(ALL_MODULES);
  const warnings = [];

  // Define known dependencies
  const dependencies = {
    'SecurityUtils.gs': ['Constants.gs'],
    'HTMLTemplates.gs': ['Constants.gs'],
    'I18n.gs': ['Constants.gs'],
    'TestConfig.gs': ['Constants.gs'],
    'Code.gs': ['Constants.gs', 'SecurityUtils.gs'],
    'DataArchiving.gs': ['Constants.gs', 'SecurityUtils.gs', 'HTMLTemplates.gs'],
    'TestFramework.gs': ['Constants.gs', 'TestConfig.gs'],
    'Code.test.gs': ['TestFramework.gs', 'Code.gs'],
    'Integration.test.gs': ['TestFramework.gs']
  };

  // Check each module's dependencies
  ALL_MODULES.forEach((module, index) => {
    if (dependencies[module]) {
      dependencies[module].forEach(dep => {
        const depIndex = ALL_MODULES.indexOf(dep);

        if (depIndex === -1) {
          warnings.push(`⚠️  ${module} depends on ${dep}, but ${dep} is not in build list`);
        } else if (depIndex > index) {
          warnings.push(`⚠️  ${module} (index ${index}) depends on ${dep} (index ${depIndex}), but ${dep} is loaded later`);
        }
      });
    }
  });

  if (warnings.length > 0) {
    console.log('⚠️  DEPENDENCY WARNINGS:\n');
    warnings.forEach(w => console.log(`   ${w}`));
    console.log('');
  } else {
    console.log('✅ All module dependencies are correctly ordered\n');
  }

  return warnings.length === 0;
}

// Files to exclude from build
const EXCLUDED_FILES = [
  'ConsolidatedDashboard.gs',  // Output file
  'Complete509Dashboard.gs',   // Old version
  'build.js',                  // This script
  'fix_destructuring.js'       // Utility script
];

/**
 * Extracts VERSION_INFO from Constants.gs
 * This ensures the build header stays in sync with the actual version constants
 * @returns {Object} Version info object with MAJOR, MINOR, PATCH, BUILD, CODENAME
 */
function getVersionFromConstants() {
  const constantsPath = path.join(__dirname, 'Constants.gs');

  if (!fs.existsSync(constantsPath)) {
    console.log('⚠️  Constants.gs not found, using default version');
    return { MAJOR: 2, MINOR: 0, PATCH: 0, BUILD: 'unknown', CODENAME: 'Unknown' };
  }

  const content = fs.readFileSync(constantsPath, 'utf8');

  // Extract VERSION_INFO values using regex
  const versionInfo = {};

  const majorMatch = content.match(/MAJOR:\s*(\d+)/);
  const minorMatch = content.match(/MINOR:\s*(\d+)/);
  const patchMatch = content.match(/PATCH:\s*(\d+)/);
  const buildMatch = content.match(/BUILD:\s*['"]([^'"]+)['"]/);
  const codenameMatch = content.match(/CODENAME:\s*['"]([^'"]+)['"]/);

  versionInfo.MAJOR = majorMatch ? parseInt(majorMatch[1]) : 2;
  versionInfo.MINOR = minorMatch ? parseInt(minorMatch[1]) : 0;
  versionInfo.PATCH = patchMatch ? parseInt(patchMatch[1]) : 0;
  versionInfo.BUILD = buildMatch ? buildMatch[1] : 'unknown';
  versionInfo.CODENAME = codenameMatch ? codenameMatch[1] : 'Unknown';

  return versionInfo;
}

// Critical constants that should only be declared once
const CRITICAL_CONSTANTS = [
  'SHEETS',
  'COLORS',
  'MEMBER_COLS',
  'GRIEVANCE_COLS',
  'SECURITY_ROLES',
  'ADMIN_EMAILS',
  'ROLES',
  'GRIEVANCE_TIMELINES',
  'GRIEVANCE_STATUSES',
  'GRIEVANCE_STEPS',
  'ISSUE_CATEGORIES',
  'CONFIG_COLS',
  'CACHE_CONFIG',
  'CACHE_KEYS',
  'ERROR_CONFIG',
  'ERROR_CATEGORIES',
  'UI_CONFIG',
  'EMAIL_CONFIG',
  'PERFORMANCE_CONFIG',
  'FEATURE_FLAGS',
  'VERSION_INFO',
  'RATE_LIMITS',
  'AUDIT_LOG_SHEET'
];

/**
 * Detects duplicate global declarations across all modules
 * @param {Array<string>} modules - List of module file names to check
 * @returns {Object} - {hasDuplicates: boolean, duplicates: Array, declarations: Object}
 */
function detectDuplicateDeclarations(modules) {
  const declarations = {}; // symbol -> [{file, line, type}]
  const duplicates = [];

  // Regex patterns for different declaration types
  const patterns = [
    // const/let/var declarations
    /^(?:const|let|var)\s+([A-Z][A-Z0-9_]*)\s*=/gm,
    // Undeclared global assignments (bare identifier = value)
    /^([A-Z][A-Z0-9_]*)\s*=\s*[{\['"]/gm
  ];

  modules.forEach(moduleName => {
    const modulePath = path.join(__dirname, moduleName);

    if (!fs.existsSync(modulePath)) {
      return;
    }

    const content = fs.readFileSync(modulePath, 'utf8');
    const lines = content.split('\n');

    // Check each line for declarations
    lines.forEach((line, lineIndex) => {
      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return;
      }

      patterns.forEach(pattern => {
        pattern.lastIndex = 0; // Reset regex state
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const symbol = match[1];

          // Only track critical constants
          if (!CRITICAL_CONSTANTS.includes(symbol)) {
            continue;
          }

          if (!declarations[symbol]) {
            declarations[symbol] = [];
          }

          const declarationType = line.includes('const ') ? 'const' :
                                   line.includes('let ') ? 'let' :
                                   line.includes('var ') ? 'var' : 'global';

          declarations[symbol].push({
            file: moduleName,
            line: lineIndex + 1,
            type: declarationType
          });
        }
      });
    });
  });

  // Find duplicates
  for (const [symbol, locs] of Object.entries(declarations)) {
    if (locs.length > 1) {
      duplicates.push({
        symbol,
        locations: locs
      });
    }
  }

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
    declarations
  };
}

/**
 * Main build function
 * @param {Object} options - Build options
 * @param {boolean} options.includeTests - Whether to include test modules
 * @param {boolean} options.quiet - Suppress verbose output
 */
function build(options = {}) {
  const { includeTests = true, quiet = false } = options;

  const modules = includeTests
    ? [...CORE_MODULES, ...TEST_MODULES]
    : CORE_MODULES;

  const buildType = includeTests ? 'DEVELOPMENT' : 'PRODUCTION';

  if (!quiet) {
    console.log(`🔨 Building 509 Dashboard (${buildType})...\n`);
  }

  // Step 1: Check for duplicate declarations
  if (!quiet) {
    console.log('🔍 Checking for duplicate declarations...');
  }

  const duplicateCheck = detectDuplicateDeclarations(modules);

  if (duplicateCheck.hasDuplicates) {
    console.error('\n❌ BUILD FAILED: Duplicate declarations detected!\n');
    console.error('The following constants are declared in multiple files:\n');

    duplicateCheck.duplicates.forEach(dup => {
      console.error(`  ${dup.symbol}:`);
      dup.locations.forEach(loc => {
        console.error(`    - ${loc.file}:${loc.line} (${loc.type})`);
      });
      console.error('');
    });

    console.error('FIX: Remove duplicate declarations. Keep each constant in only ONE file.');
    console.error('     Recommended: Keep all config constants in Constants.gs\n');
    process.exit(1);
  }

  if (!quiet) {
    console.log('   ✅ No duplicate declarations found\n');
  }

  // Step 2: Build consolidated file
  const buildDate = new Date().toISOString();

  // Get version from Constants.gs to stay in sync
  const versionInfo = getVersionFromConstants();
  const buildVersion = `${versionInfo.MAJOR}.${versionInfo.MINOR}.${versionInfo.PATCH}`;

  if (!quiet) {
    console.log(`📦 Version: ${buildVersion} (${versionInfo.CODENAME})`);
    console.log(`🏷️  Build: ${versionInfo.BUILD}\n`);
  }

  let consolidated = `/**
 * ============================================================================
 * 509 DASHBOARD - CONSOLIDATED BUILD
 * ============================================================================
 *
 * This file is AUTO-GENERATED by build.js
 * DO NOT EDIT THIS FILE DIRECTLY
 *
 * To make changes:
 * 1. Edit individual module files (e.g., Constants.gs, Code.gs)
 * 2. Run: node build.js
 * 3. This file will be regenerated automatically
 *
 * Build Info:
 * - Version: ${buildVersion} (${versionInfo.CODENAME})
 * - Build ID: ${versionInfo.BUILD}
 * - Build Date: ${buildDate}
 * - Build Type: ${buildType}
 * - Modules: ${modules.length} files
 * - Tests Included: ${includeTests ? 'Yes' : 'No'}
 *
 * ============================================================================
 */

`;

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Process each module
  modules.forEach((moduleName, index) => {
    const modulePath = path.join(__dirname, moduleName);

    try {
      if (!fs.existsSync(modulePath)) {
        if (!quiet) {
          console.log(`⚠️  [${index + 1}/${modules.length}] SKIPPED: ${moduleName} (file not found)`);
        }
        return;
      }

      const content = fs.readFileSync(modulePath, 'utf8');

      // Add module header
      consolidated += `\n// ${'='.repeat(80)}\n`;
      consolidated += `// MODULE: ${moduleName}\n`;
      consolidated += `// Source: ${moduleName}\n`;
      consolidated += `// ${'='.repeat(80)}\n\n`;

      // Add module content
      consolidated += content;

      // Add spacing between modules
      consolidated += '\n\n';

      if (!quiet) {
        console.log(`✅ [${index + 1}/${modules.length}] ${moduleName} (${(content.length / 1024).toFixed(1)} KB)`);
      }
      successCount++;

    } catch (error) {
      console.error(`❌ [${index + 1}/${modules.length}] ERROR: ${moduleName}`);
      console.error(`   ${error.message}`);
      errors.push({ module: moduleName, error: error.message });
      errorCount++;
    }
  });

  // Write consolidated file
  const outputPath = path.join(__dirname, 'ConsolidatedDashboard.gs');

  try {
    fs.writeFileSync(outputPath, consolidated, 'utf8');

    if (!quiet) {
      console.log(`\n✅ BUILD SUCCESSFUL!`);
      console.log(`   Output: ${outputPath}`);
      console.log(`   Size: ${(consolidated.length / 1024).toFixed(2)} KB`);
      console.log(`   Modules: ${successCount} included, ${errorCount} errors`);

      if (errors.length > 0) {
        console.log(`\n⚠️  ERRORS ENCOUNTERED:`);
        errors.forEach(err => {
          console.log(`   - ${err.module}: ${err.error}`);
        });
      }

      console.log('\n📊 BUILD REPORT:');
      console.log(`   ✅ Successfully built: ${successCount} modules`);
      console.log(`   ⚠️  Errors: ${errorCount}`);
      console.log(`   📦 Total size: ${(consolidated.length / 1024).toFixed(2)} KB`);
      console.log(`   📅 Build date: ${buildDate}`);
      console.log(`   🏷️  Build type: ${buildType}\n`);

      console.log('🎉 Consolidated file ready for deployment!\n');
      console.log('Next steps:');
      console.log('   1. Review ConsolidatedDashboard.gs');
      console.log('   2. Deploy to Google Apps Script');
      console.log('   3. Test in your Google Sheet\n');
    }

  } catch (error) {
    console.error(`\n❌ BUILD FAILED!`);
    console.error(`   Error writing output file: ${error.message}\n`);
    process.exit(1);
  }
}

/**
 * Verify all modules exist
 * @param {boolean} includeTests - Whether to check test modules
 */
function verifyModules(includeTests = true) {
  const modules = includeTests
    ? [...CORE_MODULES, ...TEST_MODULES]
    : CORE_MODULES;

  console.log('🔍 Verifying modules...\n');

  let missing = [];
  let found = 0;

  modules.forEach(moduleName => {
    const modulePath = path.join(__dirname, moduleName);
    if (fs.existsSync(modulePath)) {
      found++;
    } else {
      missing.push(moduleName);
    }
  });

  if (missing.length > 0) {
    console.log(`⚠️  Missing modules (${missing.length}):`);
    missing.forEach(name => console.log(`   - ${name}`));
    console.log(`\n   These modules will be skipped in the build.\n`);
  }

  console.log(`✅ Found ${found}/${modules.length} modules\n`);
}

/**
 * Clean old build artifacts
 */
function clean() {
  const outputPath = path.join(__dirname, 'ConsolidatedDashboard.gs');

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
    console.log('🧹 Cleaned old build artifacts\n');
  }
}

/**
 * Check for duplicates only (no build)
 */
function checkDuplicatesOnly() {
  const modules = [...CORE_MODULES, ...TEST_MODULES];

  console.log('🔍 Checking for duplicate declarations across all modules...\n');

  const result = detectDuplicateDeclarations(modules);

  if (result.hasDuplicates) {
    console.log('❌ DUPLICATES FOUND:\n');

    result.duplicates.forEach(dup => {
      console.log(`  ${dup.symbol}:`);
      dup.locations.forEach(loc => {
        console.log(`    - ${loc.file}:${loc.line} (${loc.type})`);
      });
      console.log('');
    });

    process.exit(1);
  } else {
    console.log('✅ No duplicate declarations found!\n');

    // Show declaration summary
    console.log('📋 Constant declarations (single source of truth):');
    for (const [symbol, locs] of Object.entries(result.declarations)) {
      if (locs.length === 1) {
        console.log(`   ${symbol}: ${locs[0].file}:${locs[0].line}`);
      }
    }
    console.log('');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
509 Dashboard Build Script
==========================

Usage:
  node build.js [options]

Options:
  --help, -h            Show this help message
  --verify, -v          Verify modules exist without building
  --clean, -c           Remove old build artifacts before building
  --quiet, -q           Suppress verbose output
  --production, -p      Build without test files (production mode)
  --no-tests            Same as --production
  --check-duplicates    Only check for duplicate declarations (no build)

Examples:
  node build.js                    # Full build with tests
  node build.js --production       # Production build (no tests)
  node build.js --check-duplicates # Check for duplicate declarations
  node build.js --clean --production  # Clean and production build
`);
  process.exit(0);
}

if (args.includes('--check-duplicates')) {
  checkDuplicatesOnly();
  process.exit(0);
}

if (args.includes('--verify') || args.includes('-v')) {
  const includeTests = !args.includes('--production') && !args.includes('-p') && !args.includes('--no-tests');
  verifyModules(includeTests);
  process.exit(0);
}

if (args.includes('--clean') || args.includes('-c')) {
  clean();
}

// Determine build options
const buildOptions = {
  includeTests: !args.includes('--production') && !args.includes('-p') && !args.includes('--no-tests'),
  quiet: args.includes('--quiet') || args.includes('-q')
};

// Run the build
try {
  if (!buildOptions.quiet) {
    verifyModules(buildOptions.includeTests);
  }
  validateModuleDependencies();
  build(buildOptions);
} catch (error) {
  console.error('\n💥 FATAL ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
}
