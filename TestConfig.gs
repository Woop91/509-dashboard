/**
 * ============================================================================
 * TEST CONFIGURATION - Separate Test Environment
 * ============================================================================
 *
 * Configuration for running tests in an isolated test spreadsheet.
 * Prevents test data from polluting production data.
 *
 * @module TestConfig
 * @version 2.1.0
 * ============================================================================
 */

/**
 * Test environment configuration
 * @const {Object}
 */
const TEST_CONFIG = {
  // Test spreadsheet ID
  // To set up:
  // 1. Create a new Google Sheet for testing
  // 2. Copy the spreadsheet ID from the URL
  // 3. Replace the ID below
  TEST_SPREADSHEET_ID: '',  // Replace with actual test spreadsheet ID

  // Use test spreadsheet when running tests
  USE_TEST_SPREADSHEET: true,

  // Auto-clear test data after tests complete
  AUTO_CLEAR_AFTER_TESTS: true,

  // Create fresh test data before each test run
  SEED_TEST_DATA: true,

  // Test data sizes (smaller than production for faster tests)
  TEST_MEMBERS_COUNT: 100,
  TEST_GRIEVANCES_COUNT: 50,

  // Test user emails
  TEST_ADMIN_EMAIL: 'testadmin@seiu509.org',
  TEST_STEWARD_EMAIL: 'teststeward@seiu509.org',
  TEST_MEMBER_EMAIL: 'testmember@seiu509.org',

  // Enable verbose logging during tests
  VERBOSE_LOGGING: true
};

/**
 * Gets the spreadsheet to use for tests
 * Returns test spreadsheet if configured, otherwise active spreadsheet
 *
 * @returns {SpreadsheetApp.Spreadsheet} Test or active spreadsheet
 */
function getTestSpreadsheet() {
  if (TEST_CONFIG.USE_TEST_SPREADSHEET && TEST_CONFIG.TEST_SPREADSHEET_ID) {
    try {
      return SpreadsheetApp.openById(TEST_CONFIG.TEST_SPREADSHEET_ID);
    } catch (error) {
      Logger.log('ERROR: Cannot open test spreadsheet: ' + error.message);
      Logger.log('Falling back to active spreadsheet');
      return SpreadsheetApp.getActiveSpreadsheet();
    }
  }

  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Sets up test environment
 * Creates all necessary sheets and seeds test data
 */
function setupTestEnvironment() {
  const testSpreadsheet = getTestSpreadsheet();

  Logger.log('Setting up test environment...');

  // Save current active spreadsheet
  const originalSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // Temporarily set test spreadsheet as active (for functions that use getActive())
    SpreadsheetApp.setActiveSpreadsheet(testSpreadsheet);

    // Create all sheets
    Logger.log('Creating test sheets...');
    CREATE_509_DASHBOARD();

    // Seed test data
    if (TEST_CONFIG.SEED_TEST_DATA) {
      Logger.log('Seeding test data...');
      seedTestData();
    }

    Logger.log('Test environment ready');

  } finally {
    // Restore original active spreadsheet
    SpreadsheetApp.setActiveSpreadsheet(originalSpreadsheet);
  }
}

/**
 * Seeds smaller dataset for testing
 * NOTE: As of v3.11, dropdown fields (Job Title, Location, Unit, Supervisor, Manager, Steward)
 * are left empty because Config tab no longer has sample data. Tests requiring these values
 * should first populate the Config tab or use empty values to avoid validation errors.
 */
function seedTestData() {
  const testSpreadsheet = getTestSpreadsheet();
  const memberSheet = testSpreadsheet.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceSheet = testSpreadsheet.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!memberSheet || !grievanceSheet) {
    throw new Error('Test sheets not found. Run setupTestEnvironment() first.');
  }

  Logger.log(`Seeding ${TEST_CONFIG.TEST_MEMBERS_COUNT} test members...`);

  // Generate test members (simplified version of SEED_20K_MEMBERS)
  // NOTE: Dropdown fields left empty to avoid validation errors (Config has no sample data v3.11+)
  const memberData = [];
  for (let i = 1; i <= TEST_CONFIG.TEST_MEMBERS_COUNT; i++) {
    memberData.push([
      `M${String(i).padStart(6, '0')}`,  // Member ID
      `TestFirst${i}`,                    // First Name
      `TestLast${i}`,                     // Last Name
      '',                                 // Job Title - empty (user populates Config)
      '',                                 // Location - empty (user populates Config)
      '',                                 // Unit - empty (user populates Config)
      'Monday',                           // Office Days
      `test${i}@seiu509.org`,            // Email
      `(555) ${String(i).padStart(3, '0')}-${String(i).padStart(4, '0')}`, // Phone
      i % 10 === 0 ? 'Yes' : 'No',       // Is Steward
      '',                                 // Supervisor - empty (user populates Config)
      '',                                 // Manager - empty (user populates Config)
      '',                                 // Assigned Steward - empty (user populates Config)
      new Date(),                         // Last Virtual Mtg
      new Date(),                         // Last In-Person Mtg
      new Date(),                         // Last Survey
      new Date(),                         // Last Email Open
      Math.floor(Math.random() * 100),   // Open Rate
      Math.floor(Math.random() * 50),    // Volunteer Hours
      'Yes',                              // Interest Local
      'Yes',                              // Interest Chapter
      'No',                               // Interest Allied
      new Date(),                         // Timestamp
      'Email',                            // Preferred Comm
      'Anytime',                          // Best Time
      '',                                 // Has Open Grievance (formula)
      '',                                 // Grievance Status (formula)
      '',                                 // Next Deadline (formula)
      '',                                 // Recent Contact Date
      '',                                 // Contact Steward
      ''                                  // Contact Notes
    ]);
  }

  memberSheet.getRange(2, 1, memberData.length, memberData[0].length).setValues(memberData);
  SpreadsheetApp.flush();

  Logger.log(`Seeding ${TEST_CONFIG.TEST_GRIEVANCES_COUNT} test grievances...`);

  // Generate test grievances
  // NOTE: Dropdown fields left empty to avoid validation errors (Config has no sample data v3.11+)
  const grievanceData = [];
  for (let i = 1; i <= TEST_CONFIG.TEST_GRIEVANCES_COUNT; i++) {
    const memberId = `M${String(i).padStart(6, '0')}`;
    const incidentDate = new Date();
    incidentDate.setDate(incidentDate.getDate() - Math.floor(Math.random() * 90));

    grievanceData.push([
      `G-${String(i).padStart(6, '0')}`,  // Grievance ID
      memberId,                            // Member ID
      `TestFirst${i}`,                     // First Name
      `TestLast${i}`,                      // Last Name
      'Open',                              // Status
      'Step I',                            // Current Step
      incidentDate,                        // Incident Date
      '',                                  // Filing Deadline (formula)
      new Date(),                          // Date Filed
      '',                                  // Step I Due (formula)
      '',                                  // Step I Rcvd
      '',                                  // Step II Appeal Due (formula)
      '',                                  // Step II Appeal Filed
      '',                                  // Step II Decision Due (formula)
      '',                                  // Step II Decision Rcvd
      '',                                  // Step III Appeal Due (formula)
      '',                                  // Step III Appeal Filed
      '',                                  // Date Closed
      '',                                  // Days Open (formula)
      '',                                  // Next Action Due (formula)
      '',                                  // Days to Deadline (formula)
      'Art. 1 - Recognition',             // Articles Violated
      'Discipline',                        // Issue Category
      `test${i}@seiu509.org`,             // Member Email
      '',                                  // Unit - empty (user populates Config)
      '',                                  // Location - empty (user populates Config)
      '',                                  // Steward - empty (user populates Config)
      ''                                   // Resolution
    ]);
  }

  grievanceSheet.getRange(2, 1, grievanceData.length, grievanceData[0].length).setValues(grievanceData);
  SpreadsheetApp.flush();

  Logger.log('Test data seeded successfully');
}

/**
 * Clears all test data
 */
function clearTestData() {
  const testSpreadsheet = getTestSpreadsheet();

  const sheets = [
    SHEETS.MEMBER_DIR,
    SHEETS.GRIEVANCE_LOG,
    SHEETS.MEMBER_SATISFACTION,
    SHEETS.FEEDBACK
  ];

  sheets.forEach(sheetName => {
    const sheet = testSpreadsheet.getSheetByName(sheetName);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        // Clear all data except header
        sheet.getRange(2, 1, lastRow - 1, sheet.getMaxColumns()).clearContent();
      }
    }
  });

  Logger.log('Test data cleared');
}

/**
 * Validates test environment is set up correctly
 * @returns {Object} Validation result
 */
function validateTestEnvironment() {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Check if test spreadsheet ID is configured
  if (TEST_CONFIG.USE_TEST_SPREADSHEET && !TEST_CONFIG.TEST_SPREADSHEET_ID) {
    result.valid = false;
    result.errors.push('TEST_SPREADSHEET_ID not configured in TestConfig.gs');
  }

  // Check if test spreadsheet is accessible
  if (TEST_CONFIG.TEST_SPREADSHEET_ID) {
    try {
      const testSpreadsheet = SpreadsheetApp.openById(TEST_CONFIG.TEST_SPREADSHEET_ID);
      const requiredSheets = [SHEETS.CONFIG, SHEETS.MEMBER_DIR, SHEETS.GRIEVANCE_LOG];

      requiredSheets.forEach(sheetName => {
        if (!testSpreadsheet.getSheetByName(sheetName)) {
          result.warnings.push(`Sheet "${sheetName}" not found in test spreadsheet`);
        }
      });

    } catch (error) {
      result.valid = false;
      result.errors.push(`Cannot access test spreadsheet: ${error.message}`);
    }
  }

  return result;
}

/**
 * Shows test environment setup dialog
 */
function showTestEnvironmentSetup() {
  const ui = SpreadsheetApp.getUi();

  const validation = validateTestEnvironment();

  let message = '🧪 TEST ENVIRONMENT SETUP\n\n';

  if (!TEST_CONFIG.TEST_SPREADSHEET_ID) {
    message += '⚠️ No test spreadsheet configured\n\n';
    message += 'To set up a test environment:\n';
    message += '1. Create a new Google Sheet\n';
    message += '2. Copy the spreadsheet ID from the URL\n';
    message += '3. Open TestConfig.gs\n';
    message += '4. Set TEST_SPREADSHEET_ID to your spreadsheet ID\n';
    message += '5. Run this setup again\n';
  } else if (!validation.valid) {
    message += '❌ Test Environment Issues:\n\n';
    validation.errors.forEach(err => {
      message += `• ${err}\n`;
    });
  } else {
    message += '✅ Test environment configured\n\n';
    if (validation.warnings.length > 0) {
      message += 'Warnings:\n';
      validation.warnings.forEach(warn => {
        message += `• ${warn}\n`;
      });
      message += '\n';
    }
    message += 'Ready to set up test sheets and seed data?';

    const response = ui.alert('Test Environment Setup', message, ui.ButtonSet.YES_NO);

    if (response === ui.Button.YES) {
      setupTestEnvironment();
      ui.alert('✅ Test environment set up successfully!');
      return;
    }
  }

  ui.alert('Test Environment Setup', message, ui.ButtonSet.OK);
}
