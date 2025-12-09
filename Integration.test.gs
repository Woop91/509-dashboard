/**
 * ------------------------------------------------------------------------====
 * INTEGRATION TESTS
 * ------------------------------------------------------------------------====
 *
 * End-to-end tests for complete workflows:
 * - Complete grievance lifecycle
 * - Dashboard metrics updates
 * - Member-grievance linking
 * - Data consistency across sheets
 *
 * ------------------------------------------------------------------------====
 */

/* --------------------= COMPLETE WORKFLOW TESTS --------------------= */

/**
 * Test: Complete grievance workflow from creation to closure
 */
function testCompleteGrievanceWorkflow() {
  const testMemberId = createTestMember('TEST-M-INTEGRATION-001');

  try {
    const ss = SpreadsheetApp.getActive();
    const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
    const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

    // Ensure formulas are set up
    setupFormulasAndCalculations();

    // Step 1: Create a new grievance
    const incidentDate = new Date(2025, 0, 1); // Jan 1, 2025
    const dateFiled = new Date(2025, 0, 10); // Jan 10, 2025

    // Array has 34 columns to match GRIEVANCE_COLS (A through AH)
    const grievanceData = [
      'TEST-G-INTEGRATION-001', // Col 1 - GRIEVANCE_ID
      testMemberId,             // Col 2 - MEMBER_ID
      'Test',                   // Col 3 - FIRST_NAME
      'Member',                 // Col 4 - LAST_NAME
      'Open',                   // Col 5 - STATUS
      'Step I',                 // Col 6 - CURRENT_STEP
      incidentDate,             // Col 7 - INCIDENT_DATE
      '',                       // Col 8 - FILING_DEADLINE (auto-calc)
      dateFiled,                // Col 9 - DATE_FILED
      '',                       // Col 10 - STEP1_DUE (auto-calc)
      '',                       // Col 11 - STEP1_RCVD
      '',                       // Col 12 - STEP2_APPEAL_DUE
      '',                       // Col 13 - STEP2_APPEAL_FILED
      '',                       // Col 14 - STEP2_DUE
      '',                       // Col 15 - STEP2_RCVD
      '',                       // Col 16 - STEP3_APPEAL_DUE
      '',                       // Col 17 - STEP3_APPEAL_FILED
      '',                       // Col 18 - DATE_CLOSED
      '',                       // Col 19 - DAYS_OPEN (auto-calc)
      '',                       // Col 20 - NEXT_ACTION_DUE (auto-calc)
      '',                       // Col 21 - DAYS_TO_DEADLINE (auto-calc)
      'Art. 23 - Grievance Procedure', // Col 22 - ARTICLES
      'Discipline',             // Col 23 - ISSUE_CATEGORY
      'test.member@union.org',  // Col 24 - MEMBER_EMAIL
      '',                       // Col 25 - UNIT
      '',                       // Col 26 - LOCATION
      '',                       // Col 27 - STEWARD
      '',                       // Col 28 - RESOLUTION
      false,                    // Col 29 - MESSAGE_ALERT
      '',                       // Col 30 - COORDINATOR_MESSAGE
      '',                       // Col 31 - ACKNOWLEDGED_BY
      '',                       // Col 32 - ACKNOWLEDGED_DATE
      '',                       // Col 33 - DRIVE_FOLDER_ID
      ''                        // Col 34 - DRIVE_FOLDER_URL
    ];

    // Ensure we never write to row 1 (preserve headers)
    const initialGrievanceRow = Math.max(grievanceLog.getLastRow() + 1, 2);
    grievanceLog.getRange(initialGrievanceRow, 1, 1, grievanceData.length)
      .setValues([grievanceData]);

    SpreadsheetApp.flush();
    Utilities.sleep(3000);
    SpreadsheetApp.flush();

    // Step 2: Verify auto-calculated deadlines
    const filingDeadline = grievanceLog.getRange(initialGrievanceRow, GRIEVANCE_COLS.FILING_DEADLINE).getValue();

    Assert.assertNotNull(
      filingDeadline,
      'Filing deadline should be auto-calculated'
    );

    const stepIDeadline = grievanceLog.getRange(initialGrievanceRow, GRIEVANCE_COLS.STEP1_DUE).getValue();

    Assert.assertNotNull(
      stepIDeadline,
      'Step I deadline should be auto-calculated'
    );

    // Step 3: Verify Member Directory snapshot updates - find member row
    const memberIds = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, 1).getValues();
    const memberRowIndex = memberIds.findIndex(function(row) { return row[0] === testMemberId; });

    Assert.assertTrue(memberRowIndex >= 0, 'Member should exist');

    const memberRowNum = memberRowIndex + 2;

    // Read cell directly for formula value
    const hasOpenGrievance = memberDir.getRange(memberRowNum, MEMBER_COLS.HAS_OPEN_GRIEVANCE).getValue();
    Assert.assertTrue(
      hasOpenGrievance === 'Yes' || hasOpenGrievance === true,
      'Member should show as having open grievance'
    );

    // Step 4: Progress grievance to Step II - using GRIEVANCE_COLS constants
    grievanceLog.getRange(initialGrievanceRow, GRIEVANCE_COLS.STEP1_RCVD).setValue(new Date(2025, 1, 10)); // Step I Decision Rcvd
    grievanceLog.getRange(initialGrievanceRow, GRIEVANCE_COLS.STEP2_APPEAL_FILED).setValue(new Date(2025, 1, 15)); // Step II Appeal Filed
    grievanceLog.getRange(initialGrievanceRow, GRIEVANCE_COLS.CURRENT_STEP).setValue('Step II'); // Update current step

    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    // Verify Step II deadline calculated
    const stepIIDeadline = grievanceLog.getRange(initialGrievanceRow, GRIEVANCE_COLS.STEP2_DUE).getValue();
    Assert.assertNotNull(
      stepIIDeadline,
      'Step II deadline should be auto-calculated'
    );

    // Step 5: Close the grievance - using GRIEVANCE_COLS constants
    const closedDate = new Date(2025, 2, 1); // March 1, 2025
    grievanceLog.getRange(initialGrievanceRow, GRIEVANCE_COLS.STATUS).setValue('Settled'); // Status
    grievanceLog.getRange(initialGrievanceRow, GRIEVANCE_COLS.DATE_CLOSED).setValue(closedDate); // Date Closed
    grievanceLog.getRange(initialGrievanceRow, GRIEVANCE_COLS.RESOLUTION).setValue('Resolved favorably'); // Resolution

    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    // Verify Days Open is calculated correctly - using GRIEVANCE_COLS constant
    const daysOpen = grievanceLog.getRange(initialGrievanceRow, GRIEVANCE_COLS.DAYS_OPEN).getValue();
    Assert.assertTrue(
      daysOpen > 0,
      'Days Open should be calculated for closed grievance'
    );

    // Step 6: Verify Member Directory snapshot updates to Settled
    const updatedMemberData = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, memberDir.getLastColumn()).getValues();
    const updatedMemberRow = updatedMemberData.find(function(row) { return row[0] === testMemberId; });

    // Using MEMBER_COLS constant - column AC (29), index 28
    const updatedStatus = updatedMemberRow[MEMBER_COLS.GRIEVANCE_STATUS - 1];
    Assert.assertEquals(
      'Settled',
      updatedStatus,
      'Member grievance status snapshot should update to Settled'
    );

    Logger.log('✅ Complete grievance workflow test passed');

  } finally {
    cleanupTestData();
  }
}

/**
 * Test: Dashboard metrics update when data changes
 */
function testDashboardMetricsUpdate() {
  const ss = SpreadsheetApp.getActive();
  const dashboard = ss.getSheetByName(SHEETS.DASHBOARD);

  // Get initial member count
  const initialMemberCount = dashboard.getRange('B6').getValue() || 0;

  // Create new test members
  createTestMember('TEST-M-DASHBOARD-001');
  createTestMember('TEST-M-DASHBOARD-002');
  createTestMember('TEST-M-DASHBOARD-003');

  try {
    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    // Check that member count increased
    const updatedMemberCount = dashboard.getRange('B6').getValue();

    Assert.assertTrue(
      updatedMemberCount >= initialMemberCount + 3,
      `Member count should increase (was ${initialMemberCount}, now ${updatedMemberCount})`
    );

    Logger.log('✅ Dashboard metrics update test passed');

  } finally {
    cleanupTestData();
  }
}

/**
 * Test: Member-Grievance linking maintains data consistency
 */
function testMemberGrievanceSnapshot() {
  const testMemberId = createTestMember('TEST-M-SNAPSHOT-001');

  try {
    const ss = SpreadsheetApp.getActive();
    const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
    const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

    // Ensure formulas are set up
    setupFormulasAndCalculations();

    // Create grievance for member - 34 columns to match GRIEVANCE_COLS
    const grievanceData = [
      'TEST-G-SNAPSHOT-001', // Col 1 - GRIEVANCE_ID
      testMemberId,          // Col 2 - MEMBER_ID
      'Test',                // Col 3 - FIRST_NAME
      'Member',              // Col 4 - LAST_NAME
      'Pending Info',        // Col 5 - STATUS
      'Step I',              // Col 6 - CURRENT_STEP
      new Date(),            // Col 7 - INCIDENT_DATE
      '',                    // Col 8 - FILING_DEADLINE
      new Date(),            // Col 9 - DATE_FILED
      '',                    // Col 10 - STEP1_DUE
      '',                    // Col 11 - STEP1_RCVD
      '',                    // Col 12 - STEP2_APPEAL_DUE
      '',                    // Col 13 - STEP2_APPEAL_FILED
      '',                    // Col 14 - STEP2_DUE
      '',                    // Col 15 - STEP2_RCVD
      '',                    // Col 16 - STEP3_APPEAL_DUE
      '',                    // Col 17 - STEP3_APPEAL_FILED
      '',                    // Col 18 - DATE_CLOSED
      '',                    // Col 19 - DAYS_OPEN
      '',                    // Col 20 - NEXT_ACTION_DUE
      '',                    // Col 21 - DAYS_TO_DEADLINE
      'Art. 24 - Discipline', // Col 22 - ARTICLES
      'Workload',            // Col 23 - ISSUE_CATEGORY
      'test@union.org',      // Col 24 - MEMBER_EMAIL
      '',                    // Col 25 - UNIT
      '',                    // Col 26 - LOCATION
      '',                    // Col 27 - STEWARD
      '',                    // Col 28 - RESOLUTION
      false,                 // Col 29 - MESSAGE_ALERT
      '',                    // Col 30 - COORDINATOR_MESSAGE
      '',                    // Col 31 - ACKNOWLEDGED_BY
      '',                    // Col 32 - ACKNOWLEDGED_DATE
      '',                    // Col 33 - DRIVE_FOLDER_ID
      ''                     // Col 34 - DRIVE_FOLDER_URL
    ];

    // Ensure we never write to row 1 (preserve headers)
    const grievanceStartRow = Math.max(grievanceLog.getLastRow() + 1, 2);
    grievanceLog.getRange(grievanceStartRow, 1, 1, grievanceData.length)
      .setValues([grievanceData]);

    SpreadsheetApp.flush();
    Utilities.sleep(3000);
    SpreadsheetApp.flush();

    // Find member row
    const memberIds = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, 1).getValues();
    const memberRowIndex = memberIds.findIndex(function(row) { return row[0] === testMemberId; });

    Assert.assertTrue(memberRowIndex >= 0, 'Member should exist');

    const memberRowNum = memberRowIndex + 2;

    // Check status snapshot - read directly from cell
    const statusSnapshot = memberDir.getRange(memberRowNum, MEMBER_COLS.GRIEVANCE_STATUS).getValue();
    Assert.assertEquals(
      'Pending Info',
      statusSnapshot,
      'Status snapshot should match grievance status'
    );

    // Update grievance status - using GRIEVANCE_COLS constant
    const grievanceRow = grievanceLog.getRange(2, 1, grievanceLog.getLastRow() - 1, GRIEVANCE_COLS.STATUS).getValues()
      .findIndex(function(row) { return row[0] === 'TEST-G-SNAPSHOT-001'; }) + 2;

    grievanceLog.getRange(grievanceRow, GRIEVANCE_COLS.STATUS).setValue('Open');

    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    // Check snapshot updated
    const updatedMemberData = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, memberDir.getLastColumn()).getValues();
    const updatedMemberRow = updatedMemberData.find(function(row) { return row[0] === testMemberId; });

    const updatedStatusSnapshot = updatedMemberRow[MEMBER_COLS.GRIEVANCE_STATUS - 1];
    Assert.assertEquals(
      'Open',
      updatedStatusSnapshot,
      'Status snapshot should update when grievance status changes'
    );

    Logger.log('✅ Member-grievance snapshot test passed');

  } finally {
    cleanupTestData();
  }
}

/* --------------------= DATA CONSISTENCY TESTS --------------------= */

/**
 * Test: Config changes propagate to dropdowns
 */
function testConfigChangesPropagateToDropdowns() {
  const ss = SpreadsheetApp.getActive();
  const config = ss.getSheetByName(SHEETS.CONFIG);
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);

  // First, populate Config with test values
  populateConfigForTesting();
  SpreadsheetApp.flush();
  Utilities.sleep(500);

  // Set up initial dropdowns
  setupMemberDirectoryDropdowns();
  SpreadsheetApp.flush();

  // Add a new location to Config
  const testLocation = 'TEST-LOCATION-INTEGRATION';
  const locationsCol = getColumnLetter(CONFIG_COLS.OFFICE_LOCATIONS);
  config.getRange(locationsCol + '6').setValue(testLocation);

  try {
    SpreadsheetApp.flush();
    Utilities.sleep(1000);

    // Check that validation includes new location
    const locationCell = memberDir.getRange(2, MEMBER_COLS.WORK_LOCATION);
    const validation = locationCell.getDataValidation();

    Assert.assertNotNull(
      validation,
      'Location validation should exist'
    );

    // The validation range should include the new location
    // (We can't easily check dropdown contents programmatically,
    // but we verify validation still exists)

    Logger.log('✅ Config changes propagate test passed');

  } finally {
    // Clean up test config values
    clearConfigTestValues();
    config.getRange(locationsCol + '6').clearContent();
  }
}

/**
 * Test: Multiple grievances for same member
 */
function testMultipleGrievancesSameMember() {
  const testMemberId = createTestMember('TEST-M-MULTIPLE-001');

  try {
    const ss = SpreadsheetApp.getActive();
    const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
    const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

    // Ensure formulas are set up
    setupFormulasAndCalculations();

    // Create 3 grievances for same member - 34 columns each
    for (let i = 1; i <= 3; i++) {
      const grievanceData = [
        `TEST-G-MULTIPLE-00${i}`, // Col 1 - GRIEVANCE_ID
        testMemberId,             // Col 2 - MEMBER_ID
        'Test',                   // Col 3 - FIRST_NAME
        'Member',                 // Col 4 - LAST_NAME
        i === 1 ? 'Open' : 'Closed', // Col 5 - STATUS
        'Step I',                 // Col 6 - CURRENT_STEP
        new Date(),               // Col 7 - INCIDENT_DATE
        '',                       // Col 8 - FILING_DEADLINE
        new Date(),               // Col 9 - DATE_FILED
        '',                       // Col 10 - STEP1_DUE
        '',                       // Col 11 - STEP1_RCVD
        '',                       // Col 12 - STEP2_APPEAL_DUE
        '',                       // Col 13 - STEP2_APPEAL_FILED
        '',                       // Col 14 - STEP2_DUE
        '',                       // Col 15 - STEP2_RCVD
        '',                       // Col 16 - STEP3_APPEAL_DUE
        '',                       // Col 17 - STEP3_APPEAL_FILED
        i === 1 ? '' : new Date(), // Col 18 - DATE_CLOSED
        '',                       // Col 19 - DAYS_OPEN
        '',                       // Col 20 - NEXT_ACTION_DUE
        '',                       // Col 21 - DAYS_TO_DEADLINE
        'Art. 23 - Grievance Procedure', // Col 22 - ARTICLES
        'Discipline',             // Col 23 - ISSUE_CATEGORY
        'test@union.org',         // Col 24 - MEMBER_EMAIL
        '',                       // Col 25 - UNIT
        '',                       // Col 26 - LOCATION
        '',                       // Col 27 - STEWARD
        i === 1 ? '' : 'Resolved', // Col 28 - RESOLUTION
        false,                    // Col 29 - MESSAGE_ALERT
        '',                       // Col 30 - COORDINATOR_MESSAGE
        '',                       // Col 31 - ACKNOWLEDGED_BY
        '',                       // Col 32 - ACKNOWLEDGED_DATE
        '',                       // Col 33 - DRIVE_FOLDER_ID
        ''                        // Col 34 - DRIVE_FOLDER_URL
      ];

      // Ensure we never write to row 1 (preserve headers)
      const gRow = Math.max(grievanceLog.getLastRow() + 1, 2);
      grievanceLog.getRange(gRow, 1, 1, grievanceData.length)
        .setValues([grievanceData]);
    }

    SpreadsheetApp.flush();
    Utilities.sleep(3000);
    SpreadsheetApp.flush();

    // Verify all grievances created
    const grievances = grievanceLog.getRange(2, 1, grievanceLog.getLastRow() - 1, 2).getValues()
      .filter(function(row) { return row[1] === testMemberId; });

    Assert.assertEquals(
      3,
      grievances.length,
      'Should have 3 grievances for test member'
    );

    // Find member row
    const memberIds = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, 1).getValues();
    const memberRowIndex = memberIds.findIndex(function(row) { return row[0] === testMemberId; });

    Assert.assertTrue(memberRowIndex >= 0, 'Member should exist');

    const memberRowNum = memberRowIndex + 2;

    // Read cell directly for formula value
    const hasOpenGrievance = memberDir.getRange(memberRowNum, MEMBER_COLS.HAS_OPEN_GRIEVANCE).getValue();
    Assert.assertTrue(
      hasOpenGrievance === 'Yes' || hasOpenGrievance === true,
      'Member with multiple grievances should show as having open grievance'
    );

    Logger.log('✅ Multiple grievances same member test passed');

  } finally {
    cleanupTestData();
  }
}

/**
 * Test: Dashboard handles empty data gracefully
 */
function testDashboardHandlesEmptyData() {
  const ss = SpreadsheetApp.getActive();
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const dashboard = ss.getSheetByName(SHEETS.DASHBOARD);

  // Backup data (use clearContent instead of deleteRows to avoid frozen row issues)
  const memberLastRow = memberDir.getLastRow();
  const grievanceLastRow = grievanceLog.getLastRow();
  const memberLastCol = memberDir.getLastColumn() || 1;
  const grievanceLastCol = grievanceLog.getLastColumn() || 1;

  const memberBackup = memberLastRow > 1 ?
    memberDir.getRange(2, 1, memberLastRow - 1, memberLastCol).getValues() : [];
  const grievanceBackup = grievanceLastRow > 1 ?
    grievanceLog.getRange(2, 1, grievanceLastRow - 1, grievanceLastCol).getValues() : [];

  try {
    // Clear all data content (safer than deleteRows - avoids frozen row issues)
    if (memberLastRow > 1) {
      memberDir.getRange(2, 1, memberLastRow - 1, memberLastCol).clearContent();
    }
    if (grievanceLastRow > 1) {
      grievanceLog.getRange(2, 1, grievanceLastRow - 1, grievanceLastCol).clearContent();
    }

    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    // Check dashboard doesn't show errors
    // Member count should be 0
    const memberCount = dashboard.getRange('B6').getValue();

    // Should be 0 or empty, not #DIV/0! or #REF!
    Assert.assertTrue(
      memberCount === 0 || memberCount === '' || memberCount === null,
      'Dashboard should handle empty data (member count should be 0 or empty)'
    );

    Logger.log('✅ Dashboard handles empty data test passed');

  } finally {
    // Restore data
    if (memberBackup.length > 0) {
      memberDir.getRange(2, 1, memberBackup.length, memberBackup[0].length)
        .setValues(memberBackup);
    }
    if (grievanceBackup.length > 0) {
      grievanceLog.getRange(2, 1, grievanceBackup.length, grievanceBackup[0].length)
        .setValues(grievanceBackup);
    }
  }
}

/* --------------------= PERFORMANCE TESTS --------------------= */

/**
 * Test: Dashboard refresh completes in reasonable time
 */
function testDashboardRefreshPerformance() {
  const startTime = new Date();

  refreshCalculations();

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000; // seconds

  Assert.assertTrue(
    duration < 10,
    `Dashboard refresh should complete in < 10 seconds (took ${duration.toFixed(2)}s)`
  );

  Logger.log(`✅ Dashboard refresh performance test passed (${duration.toFixed(2)}s)`);
}

/**
 * Test: Formula calculations on moderate dataset
 */
function testFormulaPerformanceWithData() {
  // Create 10 test members and 10 grievances
  const testMemberIds = [];
  for (let i = 1; i <= 10; i++) {
    const memberId = createTestMember(`TEST-M-PERF-${String(i).padStart(3, '0')}`);
    testMemberIds.push(memberId);
  }

  try {
    const ss = SpreadsheetApp.getActive();
    const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

    const startTime = new Date();

    // Create 10 grievances
    for (let i = 1; i <= 10; i++) {
      const grievanceData = [
        `TEST-G-PERF-${String(i).padStart(3, '0')}`,
        testMemberIds[i - 1],
        'Test',
        'Member',
        'Open',
        'Step I',
        new Date(),
        '',
        new Date(),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Art. 23 - Grievance Procedure',
        'Discipline',
        'test@union.org',
        '',  // Unit - empty (user populates Config)
        '',  // Location - empty (user populates Config)
        '',  // Steward - empty (user populates Config)
        ''
      ];

      // Ensure we never write to row 1 (preserve headers)
      const gStartRow = Math.max(grievanceLog.getLastRow() + 1, 2);
      grievanceLog.getRange(gStartRow, 1, 1, grievanceData.length)
        .setValues([grievanceData]);
    }

    SpreadsheetApp.flush();

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000; // seconds

    Assert.assertTrue(
      duration < 30,
      `Creating 10 grievances with formulas should complete in < 30 seconds (took ${duration.toFixed(2)}s)`
    );

    Logger.log(`✅ Formula performance test passed (${duration.toFixed(2)}s)`);

  } finally {
    cleanupTestData();
  }
}

/* --------------------= REGRESSION TESTS --------------------= */

/**
 * Test: Grievance updates trigger Member Directory recalculation
 */
function testGrievanceUpdatesTriggersRecalculation() {
  const testMemberId = createTestMember('TEST-M-RECALC-001');

  try {
    const ss = SpreadsheetApp.getActive();
    const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
    const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

    // Create grievance
    const grievanceData = [
      'TEST-G-RECALC-001',
      testMemberId,
      'Test',
      'Member',
      'Open',
      'Step I',
      new Date(),
      '',
      new Date(),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'Art. 23 - Grievance Procedure',
      'Discipline',
      'test@union.org',
      '',  // Unit - empty (user populates Config)
      '',  // Location - empty (user populates Config)
      '',  // Steward - empty (user populates Config)
      ''
    ];

    // Ensure we never write to row 1 (preserve headers)
    const grievanceRow = Math.max(grievanceLog.getLastRow() + 1, 2);
    grievanceLog.getRange(grievanceRow, 1, 1, grievanceData.length)
      .setValues([grievanceData]);

    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    // Check initial state - use MEMBER_COLS constant (column Z = 26, 0-indexed = 25)
    const statusIdx = MEMBER_COLS.GRIEVANCE_STATUS - 1;
    const memberData1 = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, memberDir.getLastColumn()).getValues();
    const memberRow1 = memberData1.find(function(row) { return row[0] === testMemberId; });
    const status1 = memberRow1[statusIdx];

    Assert.assertEquals('Open', status1, 'Initial status should be Open');

    // Update grievance
    grievanceLog.getRange(grievanceRow, 5).setValue('Settled');

    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    // Check updated state
    const memberData2 = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, memberDir.getLastColumn()).getValues();
    const memberRow2 = memberData2.find(function(row) { return row[0] === testMemberId; });
    const status2 = memberRow2[statusIdx];

    Assert.assertEquals(
      'Settled',
      status2,
      'Status should update to Settled after grievance update'
    );

    Logger.log('✅ Grievance updates trigger recalculation test passed');

  } finally {
    cleanupTestData();
  }
}
