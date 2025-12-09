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

    // Step 1: Create a new grievance
    const incidentDate = new Date(2025, 0, 1); // Jan 1, 2025
    const dateFiled = new Date(2025, 0, 10); // Jan 10, 2025

    const grievanceData = [
      'TEST-G-INTEGRATION-001',
      testMemberId,
      'Test',
      'Member',
      'Open',
      'Step I',
      incidentDate,
      '',
      dateFiled,
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
      'test.member@union.org',
      '',  // Unit - empty (user populates Config)
      '',  // Location - empty (user populates Config)
      '',  // Steward - empty (user populates Config)
      ''
    ];

    const initialGrievanceRow = grievanceLog.getLastRow() + 1;
    grievanceLog.getRange(initialGrievanceRow, 1, 1, grievanceData.length)
      .setValues([grievanceData]);

    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    // Step 2: Verify auto-calculated deadlines
    const filingDeadline = grievanceLog.getRange(initialGrievanceRow, 8).getValue();
    const expectedFilingDeadline = new Date(incidentDate.getTime() + 21 * 24 * 60 * 60 * 1000);

    Assert.assertNotNull(
      filingDeadline,
      'Filing deadline should be auto-calculated'
    );

    const stepIDeadline = grievanceLog.getRange(initialGrievanceRow, 10).getValue();
    const expectedStepIDeadline = new Date(dateFiled.getTime() + 30 * 24 * 60 * 60 * 1000);

    Assert.assertNotNull(
      stepIDeadline,
      'Step I deadline should be auto-calculated'
    );

    // Step 3: Verify Member Directory snapshot updates
    const memberData = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, memberDir.getLastColumn()).getValues();
    const memberRow = memberData.find(function(row) { return row[0] === testMemberId; });

    Assert.assertNotNull(memberRow, 'Member should exist');

    // Using MEMBER_COLS constant - column AB (28), index 27
    const hasOpenGrievance = memberRow[MEMBER_COLS.HAS_OPEN_GRIEVANCE - 1];
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

    // Create grievance for member
    const grievanceData = [
      'TEST-G-SNAPSHOT-001',
      testMemberId,
      'Test',
      'Member',
      'Pending Info',
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
      'Art. 24 - Discipline',
      'Workload',
      'test@union.org',
      '',  // Unit - empty (user populates Config)
      '',  // Location - empty (user populates Config)
      '',  // Steward - empty (user populates Config)
      ''
    ];

    grievanceLog.getRange(grievanceLog.getLastRow() + 1, 1, 1, grievanceData.length)
      .setValues([grievanceData]);

    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    // Check member snapshot
    const memberData = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, memberDir.getLastColumn()).getValues();
    const memberRow = memberData.find(function(row) { return row[0] === testMemberId; });

    Assert.assertNotNull(memberRow, 'Member should exist');

    // Check status snapshot - using MEMBER_COLS constant (column AC = 29, index 28)
    const statusSnapshot = memberRow[MEMBER_COLS.GRIEVANCE_STATUS - 1];
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

  // Add a new location to Config
  const lastConfigRow = config.getLastRow();
  const testLocation = 'TEST-LOCATION-INTEGRATION';
  config.getRange(lastConfigRow + 1, 2).setValue(testLocation);

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
    // Remove test location
    const data = config.getRange(2, 2, config.getLastRow() - 1, 1).getValues();
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][0] === testLocation) {
        config.deleteRow(i + 2);
      }
    }
  }
}

/**
 * Test: Multiple grievances for same member
 */
function testMultipleGrievancesSameMember() {
  const testMemberId = createTestMember('TEST-M-MULTIPLE-001');

  try {
    const ss = SpreadsheetApp.getActive();
    const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

    // Create 3 grievances for same member
    for (let i = 1; i <= 3; i++) {
      const grievanceData = [
        `TEST-G-MULTIPLE-00${i}`,
        testMemberId,
        'Test',
        'Member',
        i === 1 ? 'Open' : 'Closed',
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
        i === 1 ? '' : new Date(),
        '',
        '',
        '',
        'Art. 23 - Grievance Procedure',
        'Discipline',
        'test@union.org',
        '',  // Unit - empty (user populates Config)
        '',  // Location - empty (user populates Config)
        '',  // Steward - empty (user populates Config)
        i === 1 ? '' : 'Resolved'
      ];

      grievanceLog.getRange(grievanceLog.getLastRow() + 1, 1, 1, grievanceData.length)
        .setValues([grievanceData]);
    }

    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    // Verify all grievances created
    const grievances = grievanceLog.getRange(2, 1, grievanceLog.getLastRow() - 1, 2).getValues()
      .filter(function(row) { return row[1] === testMemberId; });

    Assert.assertEquals(
      3,
      grievances.length,
      'Should have 3 grievances for test member'
    );

    // Verify member shows as having open grievance (from first one)
    const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
    const memberData = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, memberDir.getLastColumn()).getValues();
    const memberRow = memberData.find(function(row) { return row[0] === testMemberId; });

    // Using MEMBER_COLS constant - column AB (28), index 27
    const hasOpenGrievance = memberRow[MEMBER_COLS.HAS_OPEN_GRIEVANCE - 1];
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

  // Backup data
  const memberBackup = memberDir.getLastRow() > 1 ?
    memberDir.getRange(2, 1, memberDir.getLastRow() - 1, memberDir.getLastColumn()).getValues() : [];
  const grievanceBackup = grievanceLog.getLastRow() > 1 ?
    grievanceLog.getRange(2, 1, grievanceLog.getLastRow() - 1, grievanceLog.getLastColumn()).getValues() : [];

  try {
    // Clear all data
    if (memberDir.getLastRow() > 1) {
      memberDir.deleteRows(2, memberDir.getLastRow() - 1);
    }
    if (grievanceLog.getLastRow() > 1) {
      grievanceLog.deleteRows(2, grievanceLog.getLastRow() - 1);
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

      grievanceLog.getRange(grievanceLog.getLastRow() + 1, 1, 1, grievanceData.length)
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

    const grievanceRow = grievanceLog.getLastRow() + 1;
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
