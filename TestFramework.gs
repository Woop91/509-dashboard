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
 * Test runner - discovers and runs all test functions
 */
function runAllTests() {
  const ui = SpreadsheetApp.getUi();

  ui.alert(
    '🧪 Running All Tests',
    'This will run the complete test suite. This may take 2-3 minutes.\n\n' +
    'Results will be displayed in a new "Test Results" sheet.',
    ui.ButtonSet.OK
  );

  SpreadsheetApp.getActive().toast('🧪 Running test suite...', 'Testing', -1);

  // Clear previous results
  TEST_RESULTS.passed = [];
  TEST_RESULTS.failed = [];
  TEST_RESULTS.skipped = [];

  // Reset code coverage
  resetCoverage();

  const startTime = new Date();

  // Discover and run all test functions
  // Note: All tests are defined in Code.test.gs and Integration.test.gs
  const testFunctions = [
    // Code.test.gs - Formula calculation tests
    'testFilingDeadlineCalculation',
    'testStepIDeadlineCalculation',
    'testStepIIAppealDeadlineCalculation',
    'testDaysOpenCalculation',
    'testDaysOpenForClosedGrievance',
    'testNextActionDueLogic',
    'testMemberDirectoryFormulas',

    // Code.test.gs - Data validation tests
    'testDataValidationSetup',
    'testConfigDropdownValues',
    'testMemberValidationRules',
    'testGrievanceValidationRules',

    // Code.test.gs - Seeding validation tests
    'testMemberSeedingValidation',
    'testGrievanceSeedingValidation',
    'testMemberEmailFormat',
    'testMemberIDUniqueness',
    'testGrievanceMemberLinking',
    'testOpenRateRange',

    // Code.test.gs - Edge case tests
    'testEmptySheetsHandling',
    'testFutureDateHandling',
    'testPastDeadlineHandling',

    // Code.test.gs - Column constant tests
    'testMemberColsConstants',
    'testGrievanceColsConstants',
    'testConfigColsConstants',
    'testInternalSchemaConstants',
    'testSheetsConstants',
    'testColumnLetterConversion',
    'testColumnIndexing',

    // Code.test.gs - Input validation tests
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

    // Integration.test.gs - Workflow tests
    'testCompleteGrievanceWorkflow',
    'testDashboardMetricsUpdate',
    'testMemberGrievanceSnapshot',
    'testConfigChangesPropagateToDropdowns',
    'testMultipleGrievancesSameMember',
    'testDashboardHandlesEmptyData',
    'testDashboardRefreshPerformance',
    'testFormulaPerformanceWithData',
    'testGrievanceUpdatesTriggersRecalculation'
  ];

  // Ensure test registry is initialized
  ensureTestRegistry();

  // Run each test using the test registry
  testFunctions.forEach(function(testName) {
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
 * Generates a detailed test report in a new sheet
 * @param {number} [duration=0] - Test duration in seconds
 */
function generateTestReport(duration) {
  duration = duration || 0;
  const ss = SpreadsheetApp.getActive();

  // Create or clear Test Results sheet
  let reportSheet = ss.getSheetByName('Test Results');
  if (!reportSheet) {
    reportSheet = ss.insertSheet('Test Results');
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
  const testMemberData = [
    memberId || 'TEST-M001',
    'Test',
    'Member',
    '',  // Job Title - empty (user populates Config)
    '',  // Work Location - empty (user populates Config)
    '',  // Unit - empty (user populates Config)
    'Monday',
    'test.member@union.org',
    '(555) 123-4567',
    'No',
    '',  // Supervisor - empty (user populates Config)
    '',  // Manager - empty (user populates Config)
    '',  // Steward - empty (user populates Config)
    new Date(),
    new Date(),
    new Date(),
    new Date(),
    85,
    10,
    'Yes',
    'Yes',
    'No',
    new Date(),
    'Email',
    'Mornings',
    'No',
    '',
    '',
    '',
    '',
    ''
  ];

  memberDir.getRange(memberDir.getLastRow() + 1, 1, 1, testMemberData.length).setValues([testMemberData]);
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

/* --------------------= TEST CATEGORY RUNNERS --------------------= */

/**
 * Shows test results in a dialog
 */
function showTestResults() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reportSheet = ss.getSheetByName('Test Results');

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
