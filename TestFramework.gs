/**
 * ------------------------------------------------------------------------====
 * TEST FRAMEWORK - Simple Testing Library for Google Apps Script
 * ------------------------------------------------------------------------====
 *
 * A lightweight testing framework that runs within the Apps Script environment.
 * Provides assertion methods, test runners, and reporting.
 *
 * Usage:
 *   1. Write test functions (see tests/*.test.gs)
 *   2. Run via menu: 🧪 Tests > Run All Tests
 *   3. View results in test report sheet
 *
 * ------------------------------------------------------------------------====
 */

// Test results storage
TEST_RESULTS = {
  passed: [],
  failed: [],
  skipped: []
};

/**
 * Code coverage tracking
 * Tracks which functions are called during test execution
 */
const CODE_COVERAGE = {
  enabled: true,
  functionsExecuted: new Set(),
  totalFunctions: 0,
  coveredFunctions: 0,
  coveragePercent: 0
};

/**
 * Test function registry - maps test names to their functions
 * This is necessary because Apps Script doesn't allow dynamic function lookup via this[name]
 * Functions are resolved at runtime when the registry is accessed
 */
function getTestFunctionRegistry() {
  return {
    // Code.test.gs - Formula calculation tests
    'testFilingDeadlineCalculation': testFilingDeadlineCalculation,
    'testStepIDeadlineCalculation': testStepIDeadlineCalculation,
    'testStepIIAppealDeadlineCalculation': testStepIIAppealDeadlineCalculation,
    'testDaysOpenCalculation': testDaysOpenCalculation,
    'testDaysOpenForClosedGrievance': testDaysOpenForClosedGrievance,
    'testNextActionDueLogic': testNextActionDueLogic,
    'testMemberDirectoryFormulas': testMemberDirectoryFormulas,

    // Code.test.gs - Data validation tests
    'testDataValidationSetup': testDataValidationSetup,
    'testConfigDropdownValues': testConfigDropdownValues,
    'testMemberValidationRules': testMemberValidationRules,
    'testGrievanceValidationRules': testGrievanceValidationRules,

    // Code.test.gs - Seeding validation tests
    'testMemberSeedingValidation': testMemberSeedingValidation,
    'testGrievanceSeedingValidation': testGrievanceSeedingValidation,
    'testMemberEmailFormat': testMemberEmailFormat,
    'testMemberIDUniqueness': testMemberIDUniqueness,
    'testGrievanceMemberLinking': testGrievanceMemberLinking,
    'testOpenRateRange': testOpenRateRange,

    // Code.test.gs - Edge case tests
    'testEmptySheetsHandling': testEmptySheetsHandling,
    'testFutureDateHandling': testFutureDateHandling,
    'testPastDeadlineHandling': testPastDeadlineHandling,

    // Code.test.gs - Column constant tests
    'testMemberColsConstants': testMemberColsConstants,
    'testGrievanceColsConstants': testGrievanceColsConstants,
    'testConfigColsConstants': testConfigColsConstants,
    'testInternalSchemaConstants': testInternalSchemaConstants,
    'testSheetsConstants': testSheetsConstants,
    'testColumnLetterConversion': testColumnLetterConversion,
    'testColumnIndexing': testColumnIndexing,

    // Code.test.gs - Input validation tests
    'testValidateRequired': testValidateRequired,
    'testValidateString': testValidateString,
    'testValidatePositiveInt': testValidatePositiveInt,
    'testValidateGrievanceId': testValidateGrievanceId,
    'testValidateMemberId': testValidateMemberId,
    'testValidateEmail': testValidateEmail,
    'testValidateEnum': testValidateEnum,
    'testSafeExecute': testSafeExecute,
    'testGrievanceStatusValidation': testGrievanceStatusValidation,
    'testGrievanceStepValidation': testGrievanceStepValidation,
    'testIssueCategoryValidation': testIssueCategoryValidation,
    'testErrorMessageContext': testErrorMessageContext,
    'testDateValidationEdgeCases': testDateValidationEdgeCases,
    'testArrayValidation': testArrayValidation,

    // Integration.test.gs - Workflow tests
    'testCompleteGrievanceWorkflow': testCompleteGrievanceWorkflow,
    'testDashboardMetricsUpdate': testDashboardMetricsUpdate,
    'testMemberGrievanceSnapshot': testMemberGrievanceSnapshot,
    'testConfigChangesPropagateToDropdowns': testConfigChangesPropagateToDropdowns,
    'testMultipleGrievancesSameMember': testMultipleGrievancesSameMember,
    'testDashboardHandlesEmptyData': testDashboardHandlesEmptyData,
    'testDashboardRefreshPerformance': testDashboardRefreshPerformance,
    'testFormulaPerformanceWithData': testFormulaPerformanceWithData,
    'testGrievanceUpdatesTriggersRecalculation': testGrievanceUpdatesTriggersRecalculation,

    // System tests
    'testErrorLogging': typeof testErrorLogging === 'function' ? testErrorLogging : null,
    'testDeadlineNotifications': typeof testDeadlineNotifications === 'function' ? testDeadlineNotifications : null
  };
}

// Lazy-initialized registry (built on first access)
var TEST_FUNCTION_REGISTRY = null;
function ensureTestRegistry() {
  if (TEST_FUNCTION_REGISTRY === null) {
    TEST_FUNCTION_REGISTRY = getTestFunctionRegistry();
  }
  return TEST_FUNCTION_REGISTRY;
}

/**
 * Tracks function execution for code coverage
 * @param {string} functionName - Name of function being executed
 */
function trackCoverage(functionName) {
  if (CODE_COVERAGE.enabled) {
    CODE_COVERAGE.functionsExecuted.add(functionName);
  }
}

/**
 * Gets list of all testable functions in the project
 * @returns {Array<string>} Array of function names
 */
function getAllFunctionNames() {
  const functionNames = [];

  // Get all global functions (this won't work perfectly in Apps Script, but provides baseline)
  try {
    // This is a best-effort approach
    // In production, you'd maintain a manual list or use static analysis
    const knownModules = [
      'CREATE_509_DASHBOARD', 'createConfigTab', 'createMemberDirectory', 'createGrievanceLog',
      'sanitizeHTML', 'isAdmin', 'requireRole', 'logAuditEvent',
      'getMemberList', 'archiveOldGrievances', 't', 'getUserLanguage'
      // Add more as needed
    ];

    return knownModules;
  } catch (error) {
    Logger.log('Error getting function names: ' + error.message);
    return [];
  }
}

/**
 * Calculates code coverage statistics
 * @returns {Object} Coverage statistics
 */
function calculateCoverage() {
  const allFunctions = getAllFunctionNames();
  CODE_COVERAGE.totalFunctions = allFunctions.length;
  CODE_COVERAGE.coveredFunctions = CODE_COVERAGE.functionsExecuted.size;

  if (CODE_COVERAGE.totalFunctions > 0) {
    CODE_COVERAGE.coveragePercent =
      (CODE_COVERAGE.coveredFunctions / CODE_COVERAGE.totalFunctions) * 100;
  }

  return {
    total: CODE_COVERAGE.totalFunctions,
    covered: CODE_COVERAGE.coveredFunctions,
    percent: CODE_COVERAGE.coveragePercent.toFixed(2),
    uncovered: allFunctions.filter(fn => !CODE_COVERAGE.functionsExecuted.has(fn))
  };
}

/**
 * Resets code coverage tracking
 */
function resetCoverage() {
  CODE_COVERAGE.functionsExecuted.clear();
  CODE_COVERAGE.totalFunctions = 0;
  CODE_COVERAGE.coveredFunctions = 0;
  CODE_COVERAGE.coveragePercent = 0;
}

/**
 * Assertion library
 */
const Assert = {
  /**
   * Assert that two values are equal
   */
  assertEquals: function(expected, actual, message) {
    if (expected !== actual) {
      throw new Error(
        (message || 'Assertion failed') +
        `\nExpected: ${JSON.stringify(expected)}` +
        `\nActual: ${JSON.stringify(actual)}`
      );
    }
  },

  /**
   * Assert that value is true
   */
  assertTrue: function(value, message) {
    if (value !== true) {
      throw new Error(
        (message || 'Expected true') +
        `\nActual: ${JSON.stringify(value)}`
      );
    }
  },

  /**
   * Assert that value is false
   */
  assertFalse: function(value, message) {
    if (value !== false) {
      throw new Error(
        (message || 'Expected false') +
        `\nActual: ${JSON.stringify(value)}`
      );
    }
  },

  /**
   * Assert that value is not null or undefined
   */
  assertNotNull: function(value, message) {
    if (value === null || value === undefined) {
      throw new Error(message || 'Value should not be null or undefined');
    }
  },

  /**
   * Assert that value is null
   */
  assertNull: function(value, message) {
    if (value !== null) {
      throw new Error(
        (message || 'Expected null') +
        `\nActual: ${JSON.stringify(value)}`
      );
    }
  },

  /**
   * Assert that array contains value
   */
  assertContains: function(array, value, message) {
    if (!Array.isArray(array)) {
      throw new Error('First argument must be an array');
    }
    if (array.indexOf(value) === -1) {
      throw new Error(
        (message || 'Array does not contain value') +
        `\nArray: ${JSON.stringify(array)}` +
        `\nValue: ${JSON.stringify(value)}`
      );
    }
  },

  /**
   * Assert that array has specific length
   */
  assertArrayLength: function(array, expectedLength, message) {
    if (!Array.isArray(array)) {
      throw new Error('First argument must be an array');
    }
    if (array.length !== expectedLength) {
      throw new Error(
        (message || 'Array length mismatch') +
        `\nExpected length: ${expectedLength}` +
        `\nActual length: ${array.length}`
      );
    }
  },

  /**
   * Assert that function throws an error
   */
  assertThrows: function(fn, message) {
    let threw = false;
    try {
      fn();
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new Error(message || 'Expected function to throw an error');
    }
  },

  /**
   * Assert that two values are approximately equal (for floating point)
   */
  assertApproximately: function(expected, actual, tolerance, message) {
    tolerance = tolerance || 0.001;
    if (Math.abs(expected - actual) > tolerance) {
      throw new Error(
        (message || 'Values not approximately equal') +
        `\nExpected: ${expected}` +
        `\nActual: ${actual}` +
        `\nTolerance: ${tolerance}`
      );
    }
  },

  /**
   * Assert that date is within range
   */
  assertDateEquals: function(expected, actual, message) {
    const expectedTime = expected instanceof Date ? expected.getTime() : new Date(expected).getTime();
    const actualTime = actual instanceof Date ? actual.getTime() : new Date(actual).getTime();

    if (expectedTime !== actualTime) {
      throw new Error(
        (message || 'Dates not equal') +
        `\nExpected: ${new Date(expectedTime).toISOString()}` +
        `\nActual: ${new Date(actualTime).toISOString()}`
      );
    }
  },

  /**
   * Assert that function does NOT throw an error
   */
  assertNotThrows: function(fn, message) {
    try {
      fn();
    } catch (e) {
      throw new Error(
        (message || 'Expected function to not throw') +
        `\nError thrown: ${e.message}`
      );
    }
  },

  /**
   * Explicitly fail a test
   */
  fail: function(message) {
    throw new Error(message || 'Test failed');
  }
};

/**
 * Maximum execution time in milliseconds (5 minutes to leave buffer before 6-minute limit)
 */
const TEST_MAX_EXECUTION_MS = 5 * 60 * 1000;

/**
 * Maximum rows before switching to "large dataset mode" for tests
 */
const TEST_LARGE_DATASET_THRESHOLD = 5000;

/**
 * Check if we have a large dataset that requires skipping slow tests
 */
function isLargeDataset() {
  try {
    const ss = SpreadsheetApp.getActive();
    const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
    if (memberDir) {
      const rowCount = memberDir.getLastRow();
      return rowCount > TEST_LARGE_DATASET_THRESHOLD;
    }
  } catch (e) {
    Logger.log('Error checking dataset size: ' + e.message);
  }
  return false;
}

/**
 * Test runner - discovers and runs all test functions
 * Includes timeout protection to avoid exceeding Apps Script limits
 */
function runAllTests() {
  const ui = SpreadsheetApp.getUi();
  const largeDataset = isLargeDataset();

  if (largeDataset) {
    ui.alert(
      '🧪 Running Tests (Large Dataset Mode)',
      'Detected 5,000+ rows in Member Directory.\n\n' +
      'Slow integration tests will be SKIPPED to avoid timeout.\n' +
      'Only fast unit tests and medium tests will run.\n\n' +
      'To run ALL tests, reduce data to <5,000 rows first.',
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      '🧪 Running All Tests',
      'This will run the complete test suite.\n\n' +
      'Note: Tests will stop automatically before the 6-minute timeout.\n' +
      'For faster results, use "Run Quick Tests" which skips slow integration tests.',
      ui.ButtonSet.OK
    );
  }

  SpreadsheetApp.getActive().toast('🧪 Running test suite...', 'Testing', -1);

  // Clear previous results
  TEST_RESULTS.passed = [];
  TEST_RESULTS.failed = [];
  TEST_RESULTS.skipped = [];

  // Reset code coverage
  resetCoverage();

  const startTime = new Date();

  // Fast unit tests first (these should complete quickly)
  const fastTests = [
    // Code.test.gs - Column constant tests (very fast, no sheet access)
    'testMemberColsConstants',
    'testGrievanceColsConstants',
    'testConfigColsConstants',
    'testInternalSchemaConstants',
    'testSheetsConstants',
    'testColumnLetterConversion',
    'testColumnIndexing',

    // Code.test.gs - Input validation tests (very fast, no sheet access)
    'testValidateRequired',
    'testValidateString',
    'testValidatePositiveInt',
    'testValidateGrievanceId',
    'testValidateMemberId',
    'testValidateEmail',
    'testValidateEnum',
    'testSafeExecute',
    'testGrievanceStatusValidation',
    'testGrievanceStepValidation',
    'testIssueCategoryValidation',
    'testErrorMessageContext',
    'testDateValidationEdgeCases',
    'testArrayValidation',

    // Code.test.gs - Edge case tests
    'testEmptySheetsHandling',
    'testFutureDateHandling',
    'testPastDeadlineHandling',
    'testOpenRateRange'
  ];

  // Medium tests (access sheets but don't create much data)
  const mediumTests = [
    // Code.test.gs - Formula calculation tests
    'testFilingDeadlineCalculation',
    'testStepIDeadlineCalculation',
    'testStepIIAppealDeadlineCalculation',
    'testDaysOpenCalculation',
    'testDaysOpenForClosedGrievance',
    'testNextActionDueLogic',

    // Code.test.gs - Seeding validation tests
    'testMemberSeedingValidation',
    'testGrievanceSeedingValidation',
    'testMemberEmailFormat',
    'testMemberIDUniqueness',
    'testGrievanceMemberLinking'
  ];

  // Slow tests (create test data, multiple sheet operations)
  const slowTests = [
    'testMemberDirectoryFormulas',
    'testDataValidationSetup',
    'testConfigDropdownValues',
    'testMemberValidationRules',
    'testGrievanceValidationRules',

    // Integration tests - slowest
    'testCompleteGrievanceWorkflow',
    'testDashboardMetricsUpdate',
    'testMemberGrievanceSnapshot',
    'testConfigChangesPropagateToDropdowns',
    'testMultipleGrievancesSameMember',
    'testDashboardHandlesEmptyData',
    'testGrievanceUpdatesTriggersRecalculation',
    'testDashboardRefreshPerformance',
    'testFormulaPerformanceWithData'
  ];

  // Skip slow tests for large datasets to avoid timeout
  let testFunctions;
  if (largeDataset) {
    Logger.log('📊 Large dataset detected - skipping slow integration tests');
    testFunctions = [...fastTests, ...mediumTests];
    // Mark slow tests as skipped
    slowTests.forEach(function(testName) {
      TEST_RESULTS.skipped.push({
        name: testName,
        reason: 'Skipped due to large dataset (>5,000 rows)'
      });
    });
  } else {
    testFunctions = [...fastTests, ...mediumTests, ...slowTests];
  }

  // Ensure test registry is initialized
  ensureTestRegistry();

  // Run each test using the test registry with timeout protection
  let timedOut = false;
  testFunctions.forEach(function(testName) {
    // Check if we're approaching timeout
    const elapsed = new Date() - startTime;
    if (elapsed > TEST_MAX_EXECUTION_MS) {
      if (!timedOut) {
        timedOut = true;
        Logger.log('⏱️ Test suite approaching timeout - skipping remaining tests');
      }
      TEST_RESULTS.skipped.push({
        name: testName,
        reason: 'Skipped due to timeout protection (5 min limit)'
      });
      return;
    }

    try {
      // Look up function in the test registry
      const testFn = TEST_FUNCTION_REGISTRY[testName];
      if (typeof testFn === 'function') {
        testFn();
        TEST_RESULTS.passed.push({
          name: testName,
          time: new Date() - startTime
        });
      } else {
        TEST_RESULTS.skipped.push({
          name: testName,
          reason: 'Function not found in TEST_FUNCTION_REGISTRY'
        });
      }
    } catch (error) {
      TEST_RESULTS.failed.push({
        name: testName,
        error: error.message,
        stack: error.stack
      });
    }
  });

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;

  // Calculate code coverage
  const coverage = calculateCoverage();

  // Generate test report
  generateTestReport(duration);

  // Show summary
  const total = TEST_RESULTS.passed.length + TEST_RESULTS.failed.length + TEST_RESULTS.skipped.length;
  const passRate = ((TEST_RESULTS.passed.length / total) * 100).toFixed(1);

  SpreadsheetApp.getActive().toast(
    `✅ ${TEST_RESULTS.passed.length} passed | ❌ ${TEST_RESULTS.failed.length} failed | ⏭️ ${TEST_RESULTS.skipped.length} skipped`,
    `Tests Complete (${passRate}% pass rate)`,
    10
  );

  // Show detailed results dialog
  ui.alert(
    '🧪 Test Suite Complete',
    `Results:\n\n` +
    `✅ Passed: ${TEST_RESULTS.passed.length}\n` +
    `❌ Failed: ${TEST_RESULTS.failed.length}\n` +
    `⏭️ Skipped: ${TEST_RESULTS.skipped.length}\n\n` +
    `Total: ${total} tests\n` +
    `Pass Rate: ${passRate}%\n` +
    `Duration: ${duration.toFixed(2)}s\n\n` +
    `View detailed results in the "Test Results" sheet.`,
    ui.ButtonSet.OK
  );
}

/**
 * Run quick tests - only fast unit tests, skips slow integration tests
 * Use this for rapid feedback during development
 */
function runQuickTests() {
  const ui = SpreadsheetApp.getUi();

  SpreadsheetApp.getActive().toast('⚡ Running quick tests...', 'Testing', -1);

  // Clear previous results
  TEST_RESULTS.passed = [];
  TEST_RESULTS.failed = [];
  TEST_RESULTS.skipped = [];

  const startTime = new Date();

  // Only fast unit tests (no sheet access or minimal sheet access)
  const quickTests = [
    // Column constant tests (very fast, no sheet access)
    'testMemberColsConstants',
    'testGrievanceColsConstants',
    'testConfigColsConstants',
    'testInternalSchemaConstants',
    'testSheetsConstants',
    'testColumnLetterConversion',
    'testColumnIndexing',

    // Input validation tests (very fast, no sheet access)
    'testValidateRequired',
    'testValidateString',
    'testValidatePositiveInt',
    'testValidateGrievanceId',
    'testValidateMemberId',
    'testValidateEmail',
    'testValidateEnum',
    'testSafeExecute',
    'testGrievanceStatusValidation',
    'testGrievanceStepValidation',
    'testIssueCategoryValidation',
    'testErrorMessageContext',
    'testDateValidationEdgeCases',
    'testArrayValidation'
  ];

  // Ensure test registry is initialized
  ensureTestRegistry();

  // Run each test
  quickTests.forEach(function(testName) {
    try {
      const testFn = TEST_FUNCTION_REGISTRY[testName];
      if (typeof testFn === 'function') {
        testFn();
        TEST_RESULTS.passed.push({
          name: testName,
          time: new Date() - startTime
        });
      } else {
        TEST_RESULTS.skipped.push({
          name: testName,
          reason: 'Function not found in TEST_FUNCTION_REGISTRY'
        });
      }
    } catch (error) {
      TEST_RESULTS.failed.push({
        name: testName,
        error: error.message,
        stack: error.stack
      });
    }
  });

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;

  // Show summary
  const total = TEST_RESULTS.passed.length + TEST_RESULTS.failed.length + TEST_RESULTS.skipped.length;
  const passRate = total > 0 ? ((TEST_RESULTS.passed.length / total) * 100).toFixed(1) : '0';

  SpreadsheetApp.getActive().toast(
    `✅ ${TEST_RESULTS.passed.length} passed | ❌ ${TEST_RESULTS.failed.length} failed`,
    `Quick Tests (${duration.toFixed(1)}s)`,
    5
  );

  ui.alert(
    '⚡ Quick Tests Complete',
    `Results:\n\n` +
    `✅ Passed: ${TEST_RESULTS.passed.length}\n` +
    `❌ Failed: ${TEST_RESULTS.failed.length}\n` +
    `⏭️ Skipped: ${TEST_RESULTS.skipped.length}\n\n` +
    `Duration: ${duration.toFixed(2)}s\n\n` +
    (TEST_RESULTS.failed.length > 0 ?
      `Failed tests:\n${TEST_RESULTS.failed.map(t => '• ' + t.name + ': ' + t.error).join('\n')}` :
      'All quick tests passed!'),
    ui.ButtonSet.OK
  );
}

/**
 * Generates a detailed test report in a new sheet
 * @param {number} [duration=0] - Test duration in seconds
 */
function generateTestReport(duration) {
  duration = duration || 0;
  const ss = SpreadsheetApp.getActive();

  // Create or clear Test Results sheet
  let reportSheet = ss.getSheetByName(SHEETS.TEST_RESULTS);
  if (!reportSheet) {
    reportSheet = ss.insertSheet(SHEETS.TEST_RESULTS);
  }
  reportSheet.clear();

  // Header
  reportSheet.getRange('A1:F1').merge()
    .setValue('🧪 TEST RESULTS')
    .setFontSize(18)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#4A5568')
    .setFontColor('#FFFFFF');

  // Summary
  const total = TEST_RESULTS.passed.length + TEST_RESULTS.failed.length + TEST_RESULTS.skipped.length;
  const passRate = ((TEST_RESULTS.passed.length / total) * 100).toFixed(1);

  // Get code coverage
  const coverage = calculateCoverage();

  const summary = [
    ['Total Tests', total],
    ['✅ Passed', TEST_RESULTS.passed.length],
    ['❌ Failed', TEST_RESULTS.failed.length],
    ['⏭️ Skipped', TEST_RESULTS.skipped.length],
    ['Pass Rate', `${passRate}%`],
    ['Duration', `${duration.toFixed(2)}s`],
    ['📊 Code Coverage', `${coverage.percent}%`],
    ['Functions Covered', `${coverage.covered}/${coverage.total}`],
    ['Timestamp', new Date().toLocaleString()]
  ];

  reportSheet.getRange(3, 1, summary.length, 2).setValues(summary);
  reportSheet.getRange(3, 1, summary.length, 1).setFontWeight('bold');

  let currentRow = 3 + summary.length + 2;

  // Passed tests
  if (TEST_RESULTS.passed.length > 0) {
    reportSheet.getRange(currentRow, 1, 1, 3).merge()
      .setValue('✅ PASSED TESTS')
      .setFontWeight('bold')
      .setBackground('#D1FAE5')
      .setFontColor('#065F46');

    currentRow++;
    reportSheet.getRange(currentRow, 1, 1, 3).setValues([['Test Name', 'Status', 'Duration (ms)']])
      .setFontWeight('bold')
      .setBackground('#F3F4F6');

    currentRow++;
    TEST_RESULTS.passed.forEach(function(test) {
      reportSheet.getRange(currentRow, 1, 1, 3).setValues([[test.name, '✅ PASS', test.time]]);
      currentRow++;
    });
    currentRow += 2;
  }

  // Failed tests
  if (TEST_RESULTS.failed.length > 0) {
    reportSheet.getRange(currentRow, 1, 1, 4).merge()
      .setValue('❌ FAILED TESTS')
      .setFontWeight('bold')
      .setBackground('#FEE2E2')
      .setFontColor('#991B1B');

    currentRow++;
    reportSheet.getRange(currentRow, 1, 1, 4).setValues([['Test Name', 'Status', 'Error', 'Stack Trace']])
      .setFontWeight('bold')
      .setBackground('#F3F4F6');

    currentRow++;
    TEST_RESULTS.failed.forEach(function(test) {
      reportSheet.getRange(currentRow, 1, 1, 4).setValues([[
        test.name,
        '❌ FAIL',
        test.error,
        test.stack || 'N/A'
      ]]);
      reportSheet.getRange(currentRow, 3).setWrap(true);
      currentRow++;
    });
    currentRow += 2;
  }

  // Skipped tests
  if (TEST_RESULTS.skipped.length > 0) {
    reportSheet.getRange(currentRow, 1, 1, 3).merge()
      .setValue('⏭️ SKIPPED TESTS')
      .setFontWeight('bold')
      .setBackground('#FEF3C7')
      .setFontColor('#92400E');

    currentRow++;
    reportSheet.getRange(currentRow, 1, 1, 3).setValues([['Test Name', 'Status', 'Reason']])
      .setFontWeight('bold')
      .setBackground('#F3F4F6');

    currentRow++;
    TEST_RESULTS.skipped.forEach(function(test) {
      reportSheet.getRange(currentRow, 1, 1, 3).setValues([[test.name, '⏭️ SKIP', test.reason]]);
      currentRow++;
    });
  }

  // Auto-resize columns
  reportSheet.autoResizeColumns(1, 4);
  reportSheet.setColumnWidth(3, 400);
  reportSheet.setColumnWidth(4, 300);

  reportSheet.setTabColor('#7C3AED');
  reportSheet.activate();
}

/**
 * Run a single test by name
 */
function runSingleTest(testName) {
  try {
    const testFn = this[testName];
    if (typeof testFn !== 'function') {
      throw new Error(`Test function '${testName}' not found`);
    }

    testFn();
    Logger.log(`✅ ${testName} PASSED`);
    return true;
  } catch (error) {
    Logger.log(`❌ ${testName} FAILED: ${error.message}`);
    Logger.log(error.stack);
    return false;
  }
}

/**
 * Test helper: Create a test member in Member Directory
 * NOTE: Dropdown fields (Job Title, Location, Unit, Supervisor, Manager, Steward) are left empty
 * because Config tab no longer has sample data (v3.11+). Tests should populate Config first
 * or use empty values to avoid data validation errors.
 */
function createTestMember(memberId) {
  const ss = SpreadsheetApp.getActive();
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);

  // Dropdown fields are left empty to avoid validation errors (Config has no sample data)
  // Array must match MEMBER_COLS exactly (31 columns A-AE)
  const testMemberData = [
    memberId || 'TEST-M001',    // Col 1 (A) - MEMBER_ID
    'Test',                     // Col 2 (B) - FIRST_NAME
    'Member',                   // Col 3 (C) - LAST_NAME
    '',                         // Col 4 (D) - JOB_TITLE (empty - user populates Config)
    '',                         // Col 5 (E) - WORK_LOCATION (empty - user populates Config)
    '',                         // Col 6 (F) - UNIT (empty - user populates Config)
    'Monday',                   // Col 7 (G) - OFFICE_DAYS
    'test.member@union.org',    // Col 8 (H) - EMAIL
    '(555) 123-4567',           // Col 9 (I) - PHONE
    'Email',                    // Col 10 (J) - PREFERRED_COMM
    'Mornings',                 // Col 11 (K) - BEST_TIME
    '',                         // Col 12 (L) - SUPERVISOR (empty - user populates Config)
    '',                         // Col 13 (M) - MANAGER (empty - user populates Config)
    'No',                       // Col 14 (N) - IS_STEWARD
    '',                         // Col 15 (O) - COMMITTEES
    '',                         // Col 16 (P) - ASSIGNED_STEWARD (empty - user populates Config)
    new Date(),                 // Col 17 (Q) - LAST_VIRTUAL_MTG
    new Date(),                 // Col 18 (R) - LAST_INPERSON_MTG
    85,                         // Col 19 (S) - OPEN_RATE
    10,                         // Col 20 (T) - VOLUNTEER_HOURS
    'Yes',                      // Col 21 (U) - INTEREST_LOCAL
    'Yes',                      // Col 22 (V) - INTEREST_CHAPTER
    'No',                       // Col 23 (W) - INTEREST_ALLIED
    '',                         // Col 24 (X) - HOME_TOWN
    new Date(),                 // Col 25 (Y) - RECENT_CONTACT_DATE
    '',                         // Col 26 (Z) - CONTACT_STEWARD
    '',                         // Col 27 (AA) - CONTACT_NOTES
    '',                         // Col 28 (AB) - HAS_OPEN_GRIEVANCE (formula populates)
    '',                         // Col 29 (AC) - GRIEVANCE_STATUS (formula populates)
    '',                         // Col 30 (AD) - NEXT_DEADLINE (formula populates)
    ''                          // Col 31 (AE) - START_GRIEVANCE
  ];

  // Ensure we never write to row 1 (preserve headers)
  const startRow = Math.max(memberDir.getLastRow() + 1, 2);
  memberDir.getRange(startRow, 1, 1, testMemberData.length).setValues([testMemberData]);
  return memberId || 'TEST-M001';
}

/**
 * Test helper: Clean up test data
 */
function cleanupTestData() {
  const ss = SpreadsheetApp.getActive();
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  // Remove all rows starting with "TEST-"
  const memberData = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, 1).getValues();
  for (let i = memberData.length - 1; i >= 0; i--) {
    if (String(memberData[i][0]).startsWith('TEST-')) {
      memberDir.deleteRow(i + 2);
    }
  }

  const grievanceData = grievanceLog.getRange(2, 1, grievanceLog.getLastRow() - 1, 1).getValues();
  for (let i = grievanceData.length - 1; i >= 0; i--) {
    if (String(grievanceData[i][0]).startsWith('TEST-')) {
      grievanceLog.deleteRow(i + 2);
    }
  }
}

/**
 * Test helper: Populate Config with test values for validation tests
 * This enables dropdowns to be created so validation tests can pass.
 * Call this before running validation-dependent tests.
 */
function populateConfigForTesting() {
  const ss = SpreadsheetApp.getActive();
  const config = ss.getSheetByName(SHEETS.CONFIG);

  if (!config) {
    Logger.log('Config sheet not found - skipping test config population');
    return false;
  }

  // Add test values to Config columns (row 3 is first data row after headers)
  // Job Titles (Column A / CONFIG_COLS.JOB_TITLES)
  const jobTitlesCol = getColumnLetter(CONFIG_COLS.JOB_TITLES);
  config.getRange(jobTitlesCol + '3:' + jobTitlesCol + '5').setValues([
    ['Test Job Title 1'],
    ['Test Job Title 2'],
    ['Test Job Title 3']
  ]);

  // Office Locations (Column B / CONFIG_COLS.OFFICE_LOCATIONS)
  const locationsCol = getColumnLetter(CONFIG_COLS.OFFICE_LOCATIONS);
  config.getRange(locationsCol + '3:' + locationsCol + '5').setValues([
    ['Test Location 1'],
    ['Test Location 2'],
    ['Test Location 3']
  ]);

  // Units (Column C / CONFIG_COLS.UNITS)
  const unitsCol = getColumnLetter(CONFIG_COLS.UNITS);
  config.getRange(unitsCol + '3:' + unitsCol + '5').setValues([
    ['Test Unit 1'],
    ['Test Unit 2'],
    ['Test Unit 3']
  ]);

  // Stewards (Column G / CONFIG_COLS.STEWARDS)
  const stewardsCol = getColumnLetter(CONFIG_COLS.STEWARDS);
  config.getRange(stewardsCol + '3:' + stewardsCol + '5').setValues([
    ['Test Steward 1'],
    ['Test Steward 2'],
    ['Test Steward 3']
  ]);

  Logger.log('✅ Config populated with test values');
  return true;
}

/**
 * Test helper: Clear test values from Config
 */
function clearConfigTestValues() {
  const ss = SpreadsheetApp.getActive();
  const config = ss.getSheetByName(SHEETS.CONFIG);

  if (!config) return;

  // Clear test values from Config columns (rows 3-5)
  const jobTitlesCol = getColumnLetter(CONFIG_COLS.JOB_TITLES);
  const locationsCol = getColumnLetter(CONFIG_COLS.OFFICE_LOCATIONS);
  const unitsCol = getColumnLetter(CONFIG_COLS.UNITS);
  const stewardsCol = getColumnLetter(CONFIG_COLS.STEWARDS);

  config.getRange(jobTitlesCol + '3:' + jobTitlesCol + '5').clearContent();
  config.getRange(locationsCol + '3:' + locationsCol + '5').clearContent();
  config.getRange(unitsCol + '3:' + unitsCol + '5').clearContent();
  config.getRange(stewardsCol + '3:' + stewardsCol + '5').clearContent();

  Logger.log('✅ Config test values cleared');
}

/* --------------------= TEST CATEGORY RUNNERS --------------------= */

/**
 * Shows test results in a dialog
 */
function showTestResults() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reportSheet = ss.getSheetByName(SHEETS.TEST_RESULTS);

  if (!reportSheet) {
    SpreadsheetApp.getUi().alert(
      'No Test Results',
      'No test results found. Run some tests first using the Testing menu.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  reportSheet.activate();
  SpreadsheetApp.getActiveSpreadsheet().toast('Showing test results', 'Test Results', 3);
}

/**
 * Run all unit tests
 */
function runUnitTests() {
  SpreadsheetApp.getActiveSpreadsheet().toast('Running unit tests...', 'Tests', -1);

  const unitTests = [
    'testFilingDeadlineCalculation',
    'testStepIDeadlineCalculation',
    'testStepIIAppealDeadlineCalculation',
    'testDaysOpenCalculation',
    'testDaysOpenForClosedGrievance',
    'testNextActionDueLogic',
    'testMemberDirectoryFormulas',
    'testOpenRateRange',
    'testEmptySheetsHandling',
    'testFutureDateHandling',
    'testPastDeadlineHandling'
  ];

  runTestCategory('Unit Tests', unitTests);
}

/**
 * Run all validation tests
 */
function runValidationTests() {
  SpreadsheetApp.getActiveSpreadsheet().toast('Running validation tests...', 'Tests', -1);

  const validationTests = [
    'testDataValidationSetup',
    'testConfigDropdownValues',
    'testMemberValidationRules',
    'testGrievanceValidationRules',
    'testMemberSeedingValidation',
    'testGrievanceSeedingValidation',
    'testMemberEmailFormat',
    'testMemberIDUniqueness',
    'testGrievanceMemberLinking'
  ];

  runTestCategory('Validation Tests', validationTests);
}

/**
 * Run all integration tests
 */
function runIntegrationTests() {
  SpreadsheetApp.getActiveSpreadsheet().toast('Running integration tests...', 'Tests', -1);

  const integrationTests = [
    'testCompleteGrievanceWorkflow',
    'testDashboardMetricsUpdate',
    'testMemberGrievanceSnapshot',
    'testConfigChangesPropagateToDropdowns',
    'testMultipleGrievancesSameMember',
    'testDashboardHandlesEmptyData',
    'testGrievanceUpdatesTriggersRecalculation'
  ];

  runTestCategory('Integration Tests', integrationTests);
}

/**
 * Run all performance tests
 */
function runPerformanceTests() {
  SpreadsheetApp.getActiveSpreadsheet().toast('Running performance tests...', 'Tests', -1);

  const performanceTests = [
    'testDashboardRefreshPerformance',
    'testFormulaPerformanceWithData'
  ];

  runTestCategory('Performance Tests', performanceTests);
}

/**
 * Run a category of tests
 * @param {string} categoryName - Name of the test category
 * @param {string[]} testNames - Array of test function names
 */
function runTestCategory(categoryName, testNames) {
  // Reset results
  TEST_RESULTS.passed = [];
  TEST_RESULTS.failed = [];
  TEST_RESULTS.skipped = [];

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  const startTime = new Date();

  // Ensure test registry is initialized
  ensureTestRegistry();

  testNames.forEach(function(testName) {
    try {
      // Look up function in the test registry
      const testFn = TEST_FUNCTION_REGISTRY[testName];
      if (typeof testFn !== 'function') {
        TEST_RESULTS.skipped.push({ name: testName, reason: 'Function not found in TEST_FUNCTION_REGISTRY' });
        skipped++;
        return;
      }

      testFn();
      TEST_RESULTS.passed.push({ name: testName, time: new Date() - startTime });
      passed++;
    } catch (error) {
      TEST_RESULTS.failed.push({
        name: testName,
        error: error.message,
        stack: error.stack
      });
      failed++;
    }
  });

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;

  // Generate report
  generateTestReport(duration);

  // Show summary
  const total = passed + failed + skipped;
  SpreadsheetApp.getUi().alert(
    categoryName + ' Complete',
    `Results:\n✅ Passed: ${passed}/${total}\n❌ Failed: ${failed}/${total}\n⏭️ Skipped: ${skipped}/${total}\n\nDuration: ${duration.toFixed(2)}s\n\nView the Test Results sheet for details.`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
