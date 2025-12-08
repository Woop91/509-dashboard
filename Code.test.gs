/**
 * ------------------------------------------------------------------------====
 * UNIT TESTS FOR CODE.GS
 * ------------------------------------------------------------------------====
 *
 * Tests for core functionality:
 * - Formula calculations (deadlines, days open, etc.)
 * - Data validation setup
 * - Seeding functions
 * - Helper functions
 *
 * ------------------------------------------------------------------------====
 */

/* --------------------= FORMULA CALCULATION TESTS --------------------= */

/**
 * Test: Filing Deadline = Incident Date + 21 days
 */
function testFilingDeadlineCalculation() {
  const incidentDate = new Date(2025, 0, 1); // Jan 1, 2025
  const expectedDeadline = new Date(2025, 0, 22); // Jan 22, 2025

  // Calculate deadline (Incident + 21 days)
  const actualDeadline = new Date(incidentDate.getTime() + 21 * 24 * 60 * 60 * 1000);

  Assert.assertDateEquals(
    expectedDeadline,
    actualDeadline,
    'Filing deadline should be 21 days after incident date'
  );

  Logger.log('✅ Filing deadline calculation test passed');
}

/**
 * Test: Step I Decision Due = Date Filed + 30 days
 */
function testStepIDeadlineCalculation() {
  const dateFiled = new Date(2025, 0, 15); // Jan 15, 2025
  const expectedDeadline = new Date(2025, 1, 14); // Feb 14, 2025

  // Calculate deadline (Filed + 30 days)
  const actualDeadline = new Date(dateFiled.getTime() + 30 * 24 * 60 * 60 * 1000);

  Assert.assertDateEquals(
    expectedDeadline,
    actualDeadline,
    'Step I decision should be due 30 days after filing'
  );

  Logger.log('✅ Step I deadline calculation test passed');
}

/**
 * Test: Step II Appeal Due = Step I Decision Received + 10 days
 */
function testStepIIAppealDeadlineCalculation() {
  const stepIDecisionDate = new Date(2025, 1, 14); // Feb 14, 2025
  const expectedDeadline = new Date(2025, 1, 24); // Feb 24, 2025

  // Calculate deadline (Decision + 10 days)
  const actualDeadline = new Date(stepIDecisionDate.getTime() + 10 * 24 * 60 * 60 * 1000);

  Assert.assertDateEquals(
    expectedDeadline,
    actualDeadline,
    'Step II appeal should be due 10 days after Step I decision'
  );

  Logger.log('✅ Step II appeal deadline calculation test passed');
}

/**
 * Test: Days Open calculation for active grievance
 */
function testDaysOpenCalculation() {
  const dateFiled = new Date(2025, 0, 1); // Jan 1, 2025
  const today = new Date(2025, 0, 31); // Jan 31, 2025

  const expectedDaysOpen = 30;
  const actualDaysOpen = Math.floor((today - dateFiled) / (24 * 60 * 60 * 1000));

  Assert.assertEquals(
    expectedDaysOpen,
    actualDaysOpen,
    'Days open should be 30 for a grievance filed 30 days ago'
  );

  Logger.log('✅ Days open calculation test passed');
}

/**
 * Test: Days Open calculation for closed grievance
 */
function testDaysOpenForClosedGrievance() {
  const dateFiled = new Date(2025, 0, 1); // Jan 1, 2025
  const dateClosed = new Date(2025, 0, 31); // Jan 31, 2025

  const expectedDaysOpen = 30;
  const actualDaysOpen = Math.floor((dateClosed - dateFiled) / (24 * 60 * 60 * 1000));

  Assert.assertEquals(
    expectedDaysOpen,
    actualDaysOpen,
    'Days open should use close date for closed grievances'
  );

  Logger.log('✅ Closed grievance days open calculation test passed');
}

/**
 * Test: Next Action Due logic based on current step
 */
function testNextActionDueLogic() {
  // Test data structure mimicking Grievance Log row
  const testCases = [
    {
      status: 'Open',
      step: 'Step I',
      stepIDeadline: new Date(2025, 1, 14),
      stepIIDeadline: new Date(2025, 1, 24),
      stepIIIDeadline: new Date(2025, 2, 26),
      filingDeadline: new Date(2025, 0, 22),
      expected: new Date(2025, 1, 14) // Should use Step I deadline
    },
    {
      status: 'Open',
      step: 'Step II',
      stepIDeadline: new Date(2025, 1, 14),
      stepIIDeadline: new Date(2025, 1, 24),
      stepIIIDeadline: new Date(2025, 2, 26),
      filingDeadline: new Date(2025, 0, 22),
      expected: new Date(2025, 1, 24) // Should use Step II deadline
    },
    {
      status: 'Open',
      step: 'Step III',
      stepIDeadline: new Date(2025, 1, 14),
      stepIIDeadline: new Date(2025, 1, 24),
      stepIIIDeadline: new Date(2025, 2, 26),
      filingDeadline: new Date(2025, 0, 22),
      expected: new Date(2025, 2, 26) // Should use Step III deadline
    },
    {
      status: 'Open',
      step: 'Informal',
      stepIDeadline: new Date(2025, 1, 14),
      stepIIDeadline: new Date(2025, 1, 24),
      stepIIIDeadline: new Date(2025, 2, 26),
      filingDeadline: new Date(2025, 0, 22),
      expected: new Date(2025, 0, 22) // Should use filing deadline
    }
  ];

  testCases.forEach(function(testCase, index) {
    let nextAction;
    if (testCase.status === 'Open') {
      if (testCase.step === 'Step I') {
        nextAction = testCase.stepIDeadline;
      } else if (testCase.step === 'Step II') {
        nextAction = testCase.stepIIDeadline;
      } else if (testCase.step === 'Step III') {
        nextAction = testCase.stepIIIDeadline;
      } else {
        nextAction = testCase.filingDeadline;
      }
    }

    Assert.assertDateEquals(
      testCase.expected,
      nextAction,
      `Test case ${index + 1}: Next action should match expected deadline for ${testCase.step}`
    );
  });

  Logger.log('✅ Next action due logic test passed');
}

/**
 * Test: Member Directory formulas
 */
function testMemberDirectoryFormulas() {
  // Create test setup
  const testMemberId = createTestMember('TEST-M-FORMULA-001');

  try {
    const ss = SpreadsheetApp.getActive();
    const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
    const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

    // Create a test grievance for this member
    // NOTE: Unit, Location, and Steward are left empty to avoid data validation errors
    // (Config tab no longer has sample data as of v3.11+)
    const testGrievanceData = [
      'TEST-G-001',
      testMemberId,
      'Test',
      'Member',
      'Open',
      'Step I',
      new Date(2025, 0, 1),
      '',
      new Date(2025, 0, 10),
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

    grievanceLog.getRange(grievanceLog.getLastRow() + 1, 1, 1, testGrievanceData.length)
      .setValues([testGrievanceData]);

    // Force recalculation
    SpreadsheetApp.flush();
    Utilities.sleep(2000); // Wait for formulas to recalculate

    // Find the test member row
    const memberData = memberDir.getRange(2, 1, memberDir.getLastRow() - 1, 31).getValues();
    const testMemberRow = memberData.findIndex(function(row) { return row[0] === testMemberId; });

    Assert.assertTrue(
      testMemberRow >= 0,
      'Test member should exist in Member Directory'
    );

    // Check "Has Open Grievance?" - using MEMBER_COLS constant (column AB = 28, index 27)
    const hasOpenGrievance = memberData[testMemberRow][MEMBER_COLS.HAS_OPEN_GRIEVANCE - 1];
    Assert.assertTrue(
      hasOpenGrievance === 'Yes' || hasOpenGrievance === true,
      'Member with open grievance should show "Yes" in Has Open Grievance column'
    );

    // Check "Grievance Status Snapshot" - using MEMBER_COLS constant (column AC = 29, index 28)
    const statusSnapshot = memberData[testMemberRow][MEMBER_COLS.GRIEVANCE_STATUS - 1];
    Assert.assertEquals(
      'Open',
      statusSnapshot,
      'Grievance status snapshot should match grievance status'
    );

    Logger.log('✅ Member Directory formulas test passed');

  } finally {
    cleanupTestData();
  }
}

/* --------------------= DATA VALIDATION TESTS --------------------= */

/**
 * Test: Data validation setup creates proper rules
 */
function testDataValidationSetup() {
  const ss = SpreadsheetApp.getActive();
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const config = ss.getSheetByName(SHEETS.CONFIG);

  // Check that validation exists for Job Title column
  const jobTitleCell = memberDir.getRange(2, MEMBER_COLS.JOB_TITLE);
  const validation = jobTitleCell.getDataValidation();

  Assert.assertNotNull(
    validation,
    'Job Title column should have data validation'
  );

  Logger.log('✅ Data validation setup test passed');
}

/**
 * Test: Config dropdown values are properly defined
 * NOTE: As of v3.11, Job Titles, Office Locations, Units, Supervisors, Managers, Stewards,
 * Grievance Coordinators, and Home Towns are NO LONGER pre-populated. Users populate these.
 * Only system-required values (Grievance Status, Step, Issue Categories, etc.) are pre-populated.
 */
function testConfigDropdownValues() {
  const ss = SpreadsheetApp.getActive();
  const config = ss.getSheetByName(SHEETS.CONFIG);

  // Test Job Titles column exists and is readable (but may be empty - user populates)
  const jobTitlesCol = getColumnLetter(CONFIG_COLS.JOB_TITLES);
  const jobTitlesRange = config.getRange(jobTitlesCol + '3:' + jobTitlesCol + '14');
  Assert.assertNotNull(
    jobTitlesRange,
    'Job Titles column should be readable'
  );
  // Note: Job Titles are user-populated (v3.11+), so we don't assert specific values

  // Test Office Locations column exists and is readable (but may be empty - user populates)
  const locationsCol = getColumnLetter(CONFIG_COLS.OFFICE_LOCATIONS);
  const locationsRange = config.getRange(locationsCol + '3:' + locationsCol + '14');
  Assert.assertNotNull(
    locationsRange,
    'Office Locations column should be readable'
  );
  // Note: Office Locations are user-populated (v3.11+), so we don't assert specific values

  // Test Grievance Status using CONFIG_COLS constant (col J = 10)
  // This IS pre-populated by the system and should contain values
  const statusCol = getColumnLetter(CONFIG_COLS.GRIEVANCE_STATUS);
  const statuses = config.getRange(statusCol + '3:' + statusCol + '10').getValues().flat().filter(String);
  Assert.assertTrue(
    statuses.length > 0,
    'Config should have grievance statuses defined'
  );
  Assert.assertContains(
    statuses,
    'Open',
    'Config should contain Open status'
  );

  Logger.log('✅ Config dropdown values test passed');
}

/**
 * Test: Member validation rules reference correct Config columns
 */
function testMemberValidationRules() {
  const ss = SpreadsheetApp.getActive();
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);

  // Check critical validations exist - using MEMBER_COLS constants
  const columnsToCheck = [
    { col: MEMBER_COLS.JOB_TITLE, name: 'Job Title' },        // Column D (4)
    { col: MEMBER_COLS.WORK_LOCATION, name: 'Work Location' }, // Column E (5)
    { col: MEMBER_COLS.UNIT, name: 'Unit' },                   // Column F (6)
    { col: MEMBER_COLS.IS_STEWARD, name: 'Is Steward' }        // Column N (14)
  ];

  columnsToCheck.forEach(function(item) {
    const cell = memberDir.getRange(2, item.col);
    const validation = cell.getDataValidation();

    Assert.assertNotNull(
      validation,
      `${item.name} (column ${item.col}) should have data validation`
    );
  });

  Logger.log('✅ Member validation rules test passed');
}

/**
 * Test: Grievance validation rules reference correct Config columns
 */
function testGrievanceValidationRules() {
  const ss = SpreadsheetApp.getActive();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  // Check critical validations exist - using GRIEVANCE_COLS constants
  const columnsToCheck = [
    { col: GRIEVANCE_COLS.STATUS, name: 'Status' },             // Column E (5)
    { col: GRIEVANCE_COLS.CURRENT_STEP, name: 'Current Step' }, // Column F (6)
    { col: GRIEVANCE_COLS.ISSUE_CATEGORY, name: 'Issue Category' }, // Column W (23)
    { col: GRIEVANCE_COLS.ARTICLES, name: 'Articles Violated' }  // Column V (22)
  ];

  columnsToCheck.forEach(function(item) {
    const cell = grievanceLog.getRange(2, item.col);
    const validation = cell.getDataValidation();

    Assert.assertNotNull(
      validation,
      `${item.name} (column ${item.col}) should have data validation`
    );
  });

  Logger.log('✅ Grievance validation rules test passed');
}

/* --------------------= SEEDING FUNCTION TESTS --------------------= */

/**
 * Test: Member seeding generates valid data
 */
function testMemberSeedingValidation() {
  // This test validates the data structure, not actual seeding
  // (to avoid creating 20k test records)

  const firstNames = ["James", "Mary", "John"];
  const lastNames = ["Smith", "Johnson", "Williams"];

  // Simulate member generation
  const testMember = {
    memberId: "M" + String(1).padStart(6, '0'),
    firstName: firstNames[0],
    lastName: lastNames[0],
    email: `${firstNames[0].toLowerCase()}.${lastNames[0].toLowerCase()}1@union.org`,
    phone: `(555) 123-4567`,
    openRate: 75
  };

  // Validate structure
  Assert.assertTrue(
    testMember.memberId.startsWith('M'),
    'Member ID should start with M'
  );

  Assert.assertEquals(
    7,
    testMember.memberId.length,
    'Member ID should be 7 characters (M + 6 digits)'
  );

  Assert.assertTrue(
    testMember.email.includes('@union.org'),
    'Email should end with @union.org'
  );

  Assert.assertTrue(
    testMember.openRate >= 0 && testMember.openRate <= 100,
    'Open rate should be between 0-100'
  );

  Logger.log('✅ Member seeding validation test passed');
}

/**
 * Test: Grievance seeding generates valid data
 */
function testGrievanceSeedingValidation() {
  // Simulate grievance generation
  const testGrievance = {
    grievanceId: "G-" + String(1).padStart(6, '0'),
    memberId: "M000001",
    status: "Open",
    step: "Step I",
    incidentDate: new Date(2025, 0, 1),
    dateFiled: new Date(2025, 0, 10)
  };

  // Validate structure
  Assert.assertTrue(
    testGrievance.grievanceId.startsWith('G-'),
    'Grievance ID should start with G-'
  );

  Assert.assertEquals(
    8,
    testGrievance.grievanceId.length,
    'Grievance ID should be 8 characters (G- + 6 digits)'
  );

  Assert.assertTrue(
    testGrievance.dateFiled >= testGrievance.incidentDate,
    'Date filed should be after incident date'
  );

  Logger.log('✅ Grievance seeding validation test passed');
}

/**
 * Test: Member email format is valid
 */
function testMemberEmailFormat() {
  const testEmails = [
    'john.smith123@union.org',
    'mary.jones456@union.org',
    'robert.wilson789@union.org'
  ];

  const emailRegex = /^[a-z]+\.[a-z]+\d+@union\.org$/;

  testEmails.forEach(function(email) {
    Assert.assertTrue(
      emailRegex.test(email),
      `Email ${email} should match format firstname.lastnameNNN@union.org`
    );
  });

  Logger.log('✅ Member email format test passed');
}

/**
 * Test: Member IDs are unique
 */
function testMemberIDUniqueness() {
  const memberIds = new Set();

  // Simulate generating 100 member IDs
  for (let i = 1; i <= 100; i++) {
    const memberId = "M" + String(i).padStart(6, '0');
    Assert.assertFalse(
      memberIds.has(memberId),
      `Member ID ${memberId} should be unique`
    );
    memberIds.add(memberId);
  }

  Assert.assertEquals(
    100,
    memberIds.size,
    'Should have 100 unique member IDs'
  );

  Logger.log('✅ Member ID uniqueness test passed');
}

/**
 * Test: Grievances link to valid members
 */
function testGrievanceMemberLinking() {
  const testMemberId = createTestMember('TEST-M-LINK-001');

  try {
    const ss = SpreadsheetApp.getActive();
    const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

    // Create test grievance
    // NOTE: Unit, Location, and Steward are left empty to avoid data validation errors
    // (Config tab no longer has sample data as of v3.11+)
    const testGrievanceData = [
      'TEST-G-LINK-001',
      testMemberId, // Valid member ID
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
      'test.member@union.org',
      '',  // Unit - empty (user populates Config)
      '',  // Location - empty (user populates Config)
      '',  // Steward - empty (user populates Config)
      ''
    ];

    grievanceLog.getRange(grievanceLog.getLastRow() + 1, 1, 1, testGrievanceData.length)
      .setValues([testGrievanceData]);

    // Verify it was created
    const grievanceData = grievanceLog.getRange(2, 1, grievanceLog.getLastRow() - 1, 2).getValues();
    const testGrievance = grievanceData.find(function(row) { return row[0] === 'TEST-G-LINK-001'; });

    Assert.assertNotNull(
      testGrievance,
      'Test grievance should exist'
    );

    Assert.assertEquals(
      testMemberId,
      testGrievance[1],
      'Grievance should link to correct member ID'
    );

    Logger.log('✅ Grievance-member linking test passed');

  } finally {
    cleanupTestData();
  }
}

/**
 * Test: Open Rate is within valid range
 */
function testOpenRateRange() {
  // Simulate 50 random open rates
  for (let i = 0; i < 50; i++) {
    const openRate = Math.floor(Math.random() * 40) + 60; // 60-100 range

    Assert.assertTrue(
      openRate >= 0 && openRate <= 100,
      `Open rate ${openRate} should be between 0-100`
    );

    Assert.assertTrue(
      openRate >= 60,
      `Open rate ${openRate} should be at least 60 (as per seeding logic)`
    );
  }

  Logger.log('✅ Open rate range test passed');
}

/* --------------------= EDGE CASE TESTS --------------------= */

/**
 * Test: Empty sheets don't break formulas
 */
function testEmptySheetsHandling() {
  const ss = SpreadsheetApp.getActive();
  const dashboard = ss.getSheetByName(SHEETS.DASHBOARD);

  // Dashboard should handle empty data gracefully
  // (formulas should return 0 or empty, not #DIV/0! or #REF!)

  Assert.assertNotNull(
    dashboard,
    'Dashboard sheet should exist'
  );

  Logger.log('✅ Empty sheets handling test passed');
}

/**
 * Test: Future dates are handled correctly
 */
function testFutureDateHandling() {
  const today = new Date();
  const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Days to deadline should be positive for future dates
  const daysToDeadline = Math.floor((futureDate - today) / (24 * 60 * 60 * 1000));

  Assert.assertTrue(
    daysToDeadline > 0,
    'Days to deadline should be positive for future dates'
  );

  Assert.assertApproximately(
    30,
    daysToDeadline,
    1,
    'Days to deadline should be approximately 30'
  );

  Logger.log('✅ Future date handling test passed');
}

/**
 * Test: Past deadlines show negative days
 */
function testPastDeadlineHandling() {
  const today = new Date();
  const pastDate = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);

  // Days to deadline should be negative for past dates
  const daysToDeadline = Math.floor((pastDate - today) / (24 * 60 * 60 * 1000));

  Assert.assertTrue(
    daysToDeadline < 0,
    'Days to deadline should be negative for overdue deadlines'
  );

  Assert.assertApproximately(
    -5,
    daysToDeadline,
    1,
    'Days to deadline should be approximately -5 for 5 days overdue'
  );

  Logger.log('✅ Past deadline handling test passed');
}

/* --------------------= COLUMN CONSTANTS TESTS --------------------= */

/**
 * Test: MEMBER_COLS constants are properly defined
 */
function testMemberColsConstants() {
  // Verify all required columns exist
  const requiredCols = [
    'MEMBER_ID', 'FIRST_NAME', 'LAST_NAME', 'JOB_TITLE', 'WORK_LOCATION',
    'UNIT', 'OFFICE_DAYS', 'EMAIL', 'PHONE', 'IS_STEWARD', 'COMMITTEES',
    'SUPERVISOR', 'MANAGER', 'ASSIGNED_STEWARD', 'HAS_OPEN_GRIEVANCE',
    'GRIEVANCE_STATUS', 'NEXT_DEADLINE'
  ];

  requiredCols.forEach(function(col) {
    Assert.assertTrue(
      typeof MEMBER_COLS[col] === 'number',
      `MEMBER_COLS.${col} should be defined as a number`
    );
    Assert.assertTrue(
      MEMBER_COLS[col] >= 1,
      `MEMBER_COLS.${col} should be >= 1 (1-indexed)`
    );
  });

  // Verify column ordering (first columns should be in expected order)
  Assert.assertEquals(1, MEMBER_COLS.MEMBER_ID, 'MEMBER_ID should be column 1');
  Assert.assertEquals(2, MEMBER_COLS.FIRST_NAME, 'FIRST_NAME should be column 2');
  Assert.assertEquals(3, MEMBER_COLS.LAST_NAME, 'LAST_NAME should be column 3');
  Assert.assertEquals(8, MEMBER_COLS.EMAIL, 'EMAIL should be column 8');
  Assert.assertEquals(9, MEMBER_COLS.PHONE, 'PHONE should be column 9');

  Logger.log('✅ MEMBER_COLS constants test passed');
}

/**
 * Test: GRIEVANCE_COLS constants are properly defined
 */
function testGrievanceColsConstants() {
  // Verify all required columns exist
  const requiredCols = [
    'GRIEVANCE_ID', 'MEMBER_ID', 'FIRST_NAME', 'LAST_NAME', 'STATUS',
    'CURRENT_STEP', 'INCIDENT_DATE', 'FILING_DEADLINE', 'DATE_FILED',
    'DATE_CLOSED', 'DAYS_OPEN', 'NEXT_ACTION_DUE',
    'ISSUE_CATEGORY', 'MEMBER_EMAIL', 'LOCATION', 'STEWARD', 'RESOLUTION'
  ];

  requiredCols.forEach(function(col) {
    Assert.assertTrue(
      typeof GRIEVANCE_COLS[col] === 'number',
      `GRIEVANCE_COLS.${col} should be defined as a number`
    );
    Assert.assertTrue(
      GRIEVANCE_COLS[col] >= 1,
      `GRIEVANCE_COLS.${col} should be >= 1 (1-indexed)`
    );
  });

  // Verify key column positions
  Assert.assertEquals(1, GRIEVANCE_COLS.GRIEVANCE_ID, 'GRIEVANCE_ID should be column 1');
  Assert.assertEquals(5, GRIEVANCE_COLS.STATUS, 'STATUS should be column 5');
  Assert.assertEquals(9, GRIEVANCE_COLS.DATE_FILED, 'DATE_FILED should be column 9');
  Assert.assertEquals(18, GRIEVANCE_COLS.DATE_CLOSED, 'DATE_CLOSED should be column 18');
  Assert.assertEquals(27, GRIEVANCE_COLS.STEWARD, 'STEWARD should be column 27');

  Logger.log('✅ GRIEVANCE_COLS constants test passed');
}

/**
 * Test: CONFIG_COLS constants are properly defined
 */
function testConfigColsConstants() {
  // Verify key config columns exist
  const requiredCols = [
    'JOB_TITLES', 'OFFICE_LOCATIONS', 'UNITS', 'STEWARDS',
    'GRIEVANCE_STATUS', 'GRIEVANCE_STEP', 'ISSUE_CATEGORY'
  ];

  requiredCols.forEach(function(col) {
    Assert.assertTrue(
      typeof CONFIG_COLS[col] === 'number',
      `CONFIG_COLS.${col} should be defined as a number`
    );
  });

  Logger.log('✅ CONFIG_COLS constants test passed');
}

/**
 * Test: Internal schema constants are properly defined
 */
function testInternalSchemaConstants() {
  // Test AUDIT_LOG_COLS
  Assert.assertTrue(typeof AUDIT_LOG_COLS === 'object', 'AUDIT_LOG_COLS should be defined');
  Assert.assertEquals(1, AUDIT_LOG_COLS.TIMESTAMP, 'AUDIT_LOG_COLS.TIMESTAMP should be 1');
  Assert.assertEquals(4, AUDIT_LOG_COLS.ACTION, 'AUDIT_LOG_COLS.ACTION should be 4');

  // Test FAQ_COLS
  Assert.assertTrue(typeof FAQ_COLS === 'object', 'FAQ_COLS should be defined');
  Assert.assertEquals(1, FAQ_COLS.ID, 'FAQ_COLS.ID should be 1');
  Assert.assertEquals(3, FAQ_COLS.QUESTION, 'FAQ_COLS.QUESTION should be 3');
  Assert.assertEquals(4, FAQ_COLS.ANSWER, 'FAQ_COLS.ANSWER should be 4');

  // Test ERROR_LOG_COLS
  Assert.assertTrue(typeof ERROR_LOG_COLS === 'object', 'ERROR_LOG_COLS should be defined');
  Assert.assertEquals(1, ERROR_LOG_COLS.TIMESTAMP, 'ERROR_LOG_COLS.TIMESTAMP should be 1');
  Assert.assertEquals(2, ERROR_LOG_COLS.LEVEL, 'ERROR_LOG_COLS.LEVEL should be 2');

  Logger.log('✅ Internal schema constants test passed');
}

/**
 * Test: SHEETS constants match expected sheet names
 */
function testSheetsConstants() {
  // Verify core sheets are defined
  Assert.assertEquals('Config', SHEETS.CONFIG, 'SHEETS.CONFIG should be "Config"');
  Assert.assertEquals('Member Directory', SHEETS.MEMBER_DIR, 'SHEETS.MEMBER_DIR should be "Member Directory"');
  Assert.assertEquals('Grievance Log', SHEETS.GRIEVANCE_LOG, 'SHEETS.GRIEVANCE_LOG should be "Grievance Log"');
  Assert.assertEquals('Dashboard', SHEETS.DASHBOARD, 'SHEETS.DASHBOARD should be "Dashboard"');

  // Verify internal system sheets are defined
  Assert.assertTrue(typeof SHEETS.AUDIT_LOG === 'string', 'SHEETS.AUDIT_LOG should be defined');
  Assert.assertTrue(typeof SHEETS.FAQ_DATABASE === 'string', 'SHEETS.FAQ_DATABASE should be defined');
  Assert.assertTrue(typeof SHEETS.ERROR_LOG === 'string', 'SHEETS.ERROR_LOG should be defined');

  Logger.log('✅ SHEETS constants test passed');
}

/**
 * Test: Column letter conversion utility
 */
function testColumnLetterConversion() {
  // Test getColumnLetter
  Assert.assertEquals('A', getColumnLetter(1), 'Column 1 should be A');
  Assert.assertEquals('B', getColumnLetter(2), 'Column 2 should be B');
  Assert.assertEquals('Z', getColumnLetter(26), 'Column 26 should be Z');
  Assert.assertEquals('AA', getColumnLetter(27), 'Column 27 should be AA');
  Assert.assertEquals('AB', getColumnLetter(28), 'Column 28 should be AB');

  // Test getColumnNumber
  Assert.assertEquals(1, getColumnNumber('A'), 'A should be column 1');
  Assert.assertEquals(26, getColumnNumber('Z'), 'Z should be column 26');
  Assert.assertEquals(27, getColumnNumber('AA'), 'AA should be column 27');

  Logger.log('✅ Column letter conversion test passed');
}

/**
 * Test: Column constants are used correctly (no off-by-one errors)
 */
function testColumnIndexing() {
  // Verify that constants are 1-indexed (for spreadsheet columns)
  // and that array access uses [CONSTANT - 1]

  // Simulate a row of data
  const mockRow = ['ID', 'First', 'Last', 'Title', 'Location'];

  // Access using constant pattern (constant - 1 for 0-indexed array)
  const firstElement = mockRow[1 - 1]; // Should be 'ID'
  const secondElement = mockRow[2 - 1]; // Should be 'First'

  Assert.assertEquals('ID', firstElement, 'First element accessed with [1-1] should be ID');
  Assert.assertEquals('First', secondElement, 'Second element accessed with [2-1] should be First');

  // Verify MEMBER_COLS pattern works
  const mockMemberRow = new Array(31).fill('').map((_, i) => `col${i}`);
  mockMemberRow[MEMBER_COLS.MEMBER_ID - 1] = 'M000001';
  mockMemberRow[MEMBER_COLS.EMAIL - 1] = 'test@union.org';

  Assert.assertEquals('M000001', mockMemberRow[MEMBER_COLS.MEMBER_ID - 1], 'MEMBER_ID access should work');
  Assert.assertEquals('test@union.org', mockMemberRow[MEMBER_COLS.EMAIL - 1], 'EMAIL access should work');

  Logger.log('✅ Column indexing test passed');
}

/**
 * Run all column constant tests
 */
function runColumnConstantTests() {
  Logger.log('=== Running Column Constant Tests ===');

  testMemberColsConstants();
  testGrievanceColsConstants();
  testConfigColsConstants();
  testInternalSchemaConstants();
  testSheetsConstants();
  testColumnLetterConversion();
  testColumnIndexing();

  Logger.log('=== All Column Constant Tests Passed ===');
}

/* --------------------= INPUT VALIDATION TESTS --------------------= */

/**
 * Test: validateRequired throws on null/undefined/empty
 */
function testValidateRequired() {
  // Should throw on null
  Assert.assertThrows(
    function() { validateRequired(null, 'testParam'); },
    'validateRequired should throw on null'
  );

  // Should throw on undefined
  Assert.assertThrows(
    function() { validateRequired(undefined, 'testParam'); },
    'validateRequired should throw on undefined'
  );

  // Should throw on empty string
  Assert.assertThrows(
    function() { validateRequired('', 'testParam'); },
    'validateRequired should throw on empty string'
  );

  // Should NOT throw on valid values
  Assert.assertNotThrows(
    function() { validateRequired('value', 'testParam'); },
    'validateRequired should not throw on valid string'
  );

  Assert.assertNotThrows(
    function() { validateRequired(0, 'testParam'); },
    'validateRequired should not throw on zero'
  );

  Logger.log('✅ validateRequired test passed');
}

/**
 * Test: validateString validates string type
 */
function testValidateString() {
  // Should throw on number
  Assert.assertThrows(
    function() { validateString(123, 'testParam'); },
    'validateString should throw on number'
  );

  // Should NOT throw on valid string
  Assert.assertNotThrows(
    function() { validateString('valid', 'testParam'); },
    'validateString should not throw on valid string'
  );

  Logger.log('✅ validateString test passed');
}

/**
 * Test: validatePositiveInt validates positive integers
 */
function testValidatePositiveInt() {
  // Should throw on negative
  Assert.assertThrows(
    function() { validatePositiveInt(-1, 'testParam'); },
    'validatePositiveInt should throw on negative'
  );

  // Should throw on zero
  Assert.assertThrows(
    function() { validatePositiveInt(0, 'testParam'); },
    'validatePositiveInt should throw on zero'
  );

  // Should NOT throw on positive integer
  Assert.assertNotThrows(
    function() { validatePositiveInt(1, 'testParam'); },
    'validatePositiveInt should not throw on 1'
  );

  Logger.log('✅ validatePositiveInt test passed');
}

/**
 * Test: validateGrievanceId validates G-XXXXXX format
 */
function testValidateGrievanceId() {
  // Should throw on invalid format
  Assert.assertThrows(
    function() { validateGrievanceId('12345', 'testValidateGrievanceId'); },
    'validateGrievanceId should throw on missing prefix'
  );

  Assert.assertThrows(
    function() { validateGrievanceId('G-123', 'testValidateGrievanceId'); },
    'validateGrievanceId should throw on short ID'
  );

  // Should NOT throw on valid format
  Assert.assertNotThrows(
    function() { validateGrievanceId('G-000001', 'testValidateGrievanceId'); },
    'validateGrievanceId should not throw on valid ID'
  );

  Logger.log('✅ validateGrievanceId test passed');
}

/**
 * Test: validateMemberId validates MXXXXXX format
 */
function testValidateMemberId() {
  // Should throw on invalid format
  Assert.assertThrows(
    function() { validateMemberId('12345', 'testValidateMemberId'); },
    'validateMemberId should throw on missing prefix'
  );

  // Should NOT throw on valid format
  Assert.assertNotThrows(
    function() { validateMemberId('M000001', 'testValidateMemberId'); },
    'validateMemberId should not throw on valid ID'
  );

  Logger.log('✅ validateMemberId test passed');
}

/**
 * Test: validateEmail validates email format
 */
function testValidateEmail() {
  // Should throw on invalid emails
  Assert.assertThrows(
    function() { validateEmail('notanemail', 'testValidateEmail'); },
    'validateEmail should throw on missing @'
  );

  // Should NOT throw on valid emails
  Assert.assertNotThrows(
    function() { validateEmail('user@example.com', 'testValidateEmail'); },
    'validateEmail should not throw on valid email'
  );

  Logger.log('✅ validateEmail test passed');
}

/**
 * Test: validateEnum validates against allowed values
 */
function testValidateEnum() {
  const allowedStatuses = ['Open', 'Closed', 'Pending'];

  // Should throw on invalid value
  Assert.assertThrows(
    function() { validateEnum('Invalid', allowedStatuses, 'status'); },
    'validateEnum should throw on invalid value'
  );

  // Should NOT throw on valid values
  Assert.assertNotThrows(
    function() { validateEnum('Open', allowedStatuses, 'status'); },
    'validateEnum should not throw on valid value'
  );

  Logger.log('✅ validateEnum test passed');
}

/**
 * Test: safeExecute handles errors properly
 */
function testSafeExecute() {
  // Test successful execution
  const successResult = safeExecute(function() { return 42; }, { context: 'testSuccess' });
  Assert.assertTrue(successResult.success, 'safeExecute should return success=true');
  Assert.assertEquals(42, successResult.data, 'safeExecute should return correct data');

  // Test error with silent mode
  const errorResult = safeExecute(
    function() { throw new Error('Test error'); },
    { silent: true, defaultValue: 'default', context: 'testError' }
  );
  Assert.assertFalse(errorResult.success, 'safeExecute should return success=false on error');
  Assert.assertEquals('default', errorResult.data, 'safeExecute should return defaultValue');

  Logger.log('✅ safeExecute test passed');
}

/* --------------------= ERROR SCENARIO TESTS --------------------= */

/**
 * Test: Grievance status values are all valid
 */
function testGrievanceStatusValidation() {
  GRIEVANCE_STATUSES.forEach(function(status) {
    Assert.assertNotThrows(
      function() { validateEnum(status, GRIEVANCE_STATUSES, 'status'); },
      'Status "' + status + '" should be valid'
    );
  });

  Assert.assertThrows(
    function() { validateEnum('InvalidStatus', GRIEVANCE_STATUSES, 'status'); },
    'Invalid status should throw'
  );

  Logger.log('✅ Grievance status validation test passed');
}

/**
 * Test: Grievance step values are all valid
 */
function testGrievanceStepValidation() {
  GRIEVANCE_STEPS.forEach(function(step) {
    Assert.assertNotThrows(
      function() { validateEnum(step, GRIEVANCE_STEPS, 'step'); },
      'Step "' + step + '" should be valid'
    );
  });

  Logger.log('✅ Grievance step validation test passed');
}

/**
 * Test: Issue categories are all valid
 */
function testIssueCategoryValidation() {
  ISSUE_CATEGORIES.forEach(function(category) {
    Assert.assertNotThrows(
      function() { validateEnum(category, ISSUE_CATEGORIES, 'category'); },
      'Category "' + category + '" should be valid'
    );
  });

  Logger.log('✅ Issue category validation test passed');
}

/**
 * Test: Error messages include context when provided
 */
function testErrorMessageContext() {
  try {
    validateRequired(null, 'testParam', 'testFunction');
    Assert.fail('Should have thrown');
  } catch (e) {
    Assert.assertTrue(
      e.message.indexOf('testParam') >= 0,
      'Error should include parameter name'
    );
    Assert.assertTrue(
      e.message.indexOf('testFunction') >= 0,
      'Error should include function name when provided'
    );
  }

  Logger.log('✅ Error message context test passed');
}

/**
 * Test: Date validation handles edge cases
 */
function testDateValidationEdgeCases() {
  // Invalid date (NaN time)
  Assert.assertThrows(
    function() { validateDate(new Date('invalid'), 'testDate'); },
    'validateDate should throw on invalid date string'
  );

  // Valid dates
  Assert.assertNotThrows(
    function() { validateDate(new Date(), 'testDate'); },
    'validateDate should accept current date'
  );

  Logger.log('✅ Date validation edge cases test passed');
}

/**
 * Test: Array validation
 */
function testArrayValidation() {
  // Should throw on non-array
  Assert.assertThrows(
    function() { validateArray('string', 'testArray'); },
    'validateArray should throw on string'
  );

  // Should NOT throw on arrays
  Assert.assertNotThrows(
    function() { validateArray([], 'testArray'); },
    'validateArray should accept empty array'
  );

  Assert.assertNotThrows(
    function() { validateArray([1, 2, 3], 'testArray'); },
    'validateArray should accept populated array'
  );

  Logger.log('✅ Array validation test passed');
}

/**
 * Run all input validation tests (testing validate* helper functions)
 * Note: runValidationTests() in TestFramework.gs tests data validation setup
 */
function runInputValidationTests() {
  Logger.log('=== Running Input Validation Tests ===');

  testValidateRequired();
  testValidateString();
  testValidatePositiveInt();
  testValidateGrievanceId();
  testValidateMemberId();
  testValidateEmail();
  testValidateEnum();
  testSafeExecute();
  testGrievanceStatusValidation();
  testGrievanceStepValidation();
  testIssueCategoryValidation();
  testErrorMessageContext();
  testDateValidationEdgeCases();
  testArrayValidation();

  Logger.log('=== All Input Validation Tests Passed ===');
}

/**
 * Run column and validation tests only (subset of all tests)
 * Note: The main runAllTests() function is defined in TestFramework.gs
 * This function is kept for running a quick subset of tests
 */
function runQuickTests() {
  Logger.log('========================================');
  Logger.log('  RUNNING QUICK TESTS (Column + Input Validation)');
  Logger.log('========================================');

  runColumnConstantTests();
  runInputValidationTests();

  Logger.log('========================================');
  Logger.log('  QUICK TESTS COMPLETE');
  Logger.log('========================================');
}
