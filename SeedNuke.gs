/**
 * ============================================================================
 * SEED & NUKE - Data Seeding and Clearing Functions
 * ============================================================================
 *
 * Provides functions to:
 * - Seed Config with sample dropdown values
 * - Seed Member Directory with sample members
 * - Seed Grievance Log with sample grievances
 * - Clear all data (nuke)
 *
 * Version: 3.51
 *
 * IMPORTANT: Config fields (Job Titles, Office Locations, Units, Supervisors,
 * Managers, Stewards) are ONLY populated by these seed functions or manually.
 * They are intentionally left empty on dashboard creation.
 */

/* ============================================================================
 * SAMPLE DATA DEFINITIONS
 * ============================================================================ */

const SEED_DATA = {
  // Config dropdown values - these populate the Config sheet
  JOB_TITLES: [
    'Social Worker I', 'Social Worker II', 'Social Worker III', 'Social Worker IV',
    'Case Manager', 'Senior Case Manager', 'Program Coordinator', 'Program Director',
    'Administrative Assistant', 'Administrative Coordinator', 'Office Manager',
    'Clinical Supervisor', 'Quality Assurance Specialist', 'Data Analyst',
    'Community Outreach Worker', 'Family Support Specialist', 'Intake Coordinator',
    'Benefits Counselor', 'Housing Specialist', 'Employment Specialist'
  ],

  OFFICE_LOCATIONS: [
    'Boston - Downtown', 'Boston - South End', 'Cambridge', 'Somerville',
    'Worcester', 'Springfield', 'Lowell', 'Brockton', 'New Bedford', 'Fall River',
    'Lynn', 'Quincy', 'Lawrence', 'Framingham', 'Haverhill', 'Malden',
    'Medford', 'Taunton', 'Weymouth', 'Remote'
  ],

  UNITS: [
    'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5',
    'Unit 6', 'Unit 7', 'Unit 8', 'Unit 9', 'Unit 10'
  ],

  SUPERVISORS: [
    'Patricia Williams', 'Michael Johnson', 'Jennifer Davis', 'Robert Martinez',
    'Linda Anderson', 'William Taylor', 'Barbara Thomas', 'Richard Jackson',
    'Susan White', 'Joseph Harris', 'Margaret Martin', 'Charles Thompson'
  ],

  MANAGERS: [
    'James Rodriguez', 'Mary Garcia', 'David Wilson', 'Elizabeth Brown',
    'John Lee', 'Sarah Kim', 'Christopher Patel', 'Jessica Nguyen'
  ],

  STEWARDS: [
    'Alex Rivera', 'Jordan Mitchell', 'Casey Thompson', 'Morgan Chen',
    'Taylor Brooks', 'Riley Johnson', 'Quinn Williams', 'Avery Davis',
    'Parker Wilson', 'Cameron Lee', 'Drew Martinez', 'Jamie Garcia'
  ],

  FIRST_NAMES: [
    'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
    'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa'
  ],

  LAST_NAMES: [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
    'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell'
  ],

  HOME_TOWNS: [
    'Boston', 'Cambridge', 'Somerville', 'Brookline', 'Newton', 'Quincy',
    'Worcester', 'Springfield', 'Lowell', 'Brockton', 'New Bedford', 'Fall River',
    'Lynn', 'Lawrence', 'Framingham', 'Haverhill', 'Malden', 'Medford', 'Waltham'
  ],

  ISSUE_CATEGORIES: [
    'Discipline', 'Discharge', 'Contract Violation', 'Working Conditions',
    'Harassment', 'Discrimination', 'Safety', 'Scheduling', 'Pay/Benefits', 'Workload'
  ],

  ARTICLES: [
    'Article 12 - Discipline', 'Article 15 - Workload', 'Article 23A - Grievance Procedure',
    'Article 8 - Hours of Work', 'Article 10 - Leaves', 'Article 5 - Non-Discrimination',
    'Article 18 - Safety', 'Article 20 - Benefits', 'Article 22 - Scheduling'
  ],

  STATUSES: ['Open', 'Pending Info', 'Appealed', 'In Arbitration', 'Settled', 'Withdrawn', 'Closed'],

  STEPS: ['Informal', 'Step I', 'Step II', 'Step III', 'Arbitration'],

  COMMITTEES: [
    'Grievance Committee', 'Bargaining Committee', 'Health & Safety Committee',
    'Political Action Committee', 'Membership Committee', 'Executive Board'
  ]
};

/* ============================================================================
 * MAIN SEED FUNCTIONS
 * ============================================================================ */

/**
 * Seeds all sample data - Config, Members, and Grievances
 * This is the main function to populate the dashboard with demo data
 */
function SEED_SAMPLE_DATA() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Seed Sample Data',
    'This will populate:\n\n' +
    '1. Config - Job Titles, Locations, Units, etc.\n' +
    '2. Member Directory - 50 sample members\n' +
    '3. Grievance Log - 25 sample grievances\n\n' +
    'Existing data will be preserved. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    ui.alert('Cancelled', 'No data was seeded.', ui.ButtonSet.OK);
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    ss.toast('Seeding Config...', 'Step 1/3', -1);
    seedConfigData();
    SpreadsheetApp.flush();

    ss.toast('Seeding Members...', 'Step 2/3', -1);
    SEED_MEMBERS(50);
    SpreadsheetApp.flush();

    ss.toast('Seeding Grievances...', 'Step 3/3', -1);
    SEED_GRIEVANCES(25);
    SpreadsheetApp.flush();

    // Refresh formulas and sync
    ss.toast('Refreshing formulas...', 'Finalizing', -1);
    if (typeof refreshAllFormulas === 'function') {
      refreshAllFormulas();
    }

    ss.toast('Sample data seeded successfully!', 'Complete', 5);

    ui.alert(
      'Seed Complete',
      'Successfully seeded:\n\n' +
      '- Config dropdown values\n' +
      '- 50 sample members\n' +
      '- 25 sample grievances\n\n' +
      'The dashboard is now populated with demo data.',
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log('SEED_SAMPLE_DATA error: ' + error.toString());
    ui.alert('Error', 'Failed to seed data: ' + error.message, ui.ButtonSet.OK);
  }
}

/**
 * Seeds only Config dropdown values
 * Populates: Job Titles, Office Locations, Units, Supervisors, Managers, Stewards
 */
function seedConfigData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);

  if (!configSheet) {
    throw new Error('Config sheet not found. Run CREATE_509_DASHBOARD first.');
  }

  // Column mappings for Config sheet
  const configColumns = {
    JOB_TITLES: 1,      // A
    OFFICE_LOCATIONS: 2, // B
    UNITS: 3,           // C
    SUPERVISORS: 6,     // F
    MANAGERS: 7,        // G
    STEWARDS: 8,        // H
    HOME_TOWNS: 32      // AF (if it exists)
  };

  // Seed each column
  seedConfigColumn(configSheet, configColumns.JOB_TITLES, SEED_DATA.JOB_TITLES);
  seedConfigColumn(configSheet, configColumns.OFFICE_LOCATIONS, SEED_DATA.OFFICE_LOCATIONS);
  seedConfigColumn(configSheet, configColumns.UNITS, SEED_DATA.UNITS);
  seedConfigColumn(configSheet, configColumns.SUPERVISORS, SEED_DATA.SUPERVISORS);
  seedConfigColumn(configSheet, configColumns.MANAGERS, SEED_DATA.MANAGERS);
  seedConfigColumn(configSheet, configColumns.STEWARDS, SEED_DATA.STEWARDS);

  // Try to seed Home Towns if column exists
  try {
    seedConfigColumn(configSheet, configColumns.HOME_TOWNS, SEED_DATA.HOME_TOWNS);
  } catch (e) {
    // Home Towns column may not exist in older versions
    Logger.log('Home Towns column not found, skipping');
  }

  Logger.log('Config data seeded successfully');
}

/**
 * Helper function to seed a single Config column
 */
function seedConfigColumn(sheet, colIndex, values) {
  if (!values || values.length === 0) return;

  // Start from row 2 (after header)
  const startRow = 2;
  const valueArray = values.map(function(v) { return [v]; });

  // Clear existing values in this column first (rows 2-100)
  sheet.getRange(startRow, colIndex, 100, 1).clearContent();

  // Write new values
  sheet.getRange(startRow, colIndex, valueArray.length, 1).setValues(valueArray);
}

/**
 * Seeds Member Directory with sample members
 * @param {number} count - Number of members to create (default 50)
 */
function SEED_MEMBERS(count) {
  count = count || 50;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet) {
    throw new Error('Member Directory not found. Run CREATE_509_DASHBOARD first.');
  }

  // Get config values for dropdowns - fall back to SEED_DATA if empty
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);
  const jobTitles = getConfigColumnValues(configSheet, 1);
  const locations = getConfigColumnValues(configSheet, 2);
  const units = getConfigColumnValues(configSheet, 3);
  const supervisors = getConfigColumnValues(configSheet, 6);
  const managers = getConfigColumnValues(configSheet, 7);
  const stewards = getConfigColumnValues(configSheet, 8);

  // Use SEED_DATA as fallback for ALL fields
  const useJobTitles = (jobTitles && jobTitles.length > 0) ? jobTitles : SEED_DATA.JOB_TITLES;
  const useLocations = (locations && locations.length > 0) ? locations : SEED_DATA.OFFICE_LOCATIONS;
  const useUnits = (units && units.length > 0) ? units : SEED_DATA.UNITS;
  const useSupervisors = (supervisors && supervisors.length > 0) ? supervisors : SEED_DATA.SUPERVISORS;
  const useManagers = (managers && managers.length > 0) ? managers : SEED_DATA.MANAGERS;
  const useStewards = (stewards && stewards.length > 0) ? stewards : SEED_DATA.STEWARDS;

  const memberData = [];
  const usedEmails = new Set();

  // Find the starting ID based on existing data
  const lastRow = memberSheet.getLastRow();
  const startId = lastRow > 1 ? lastRow : 1;

  for (let i = 1; i <= count; i++) {
    const memberId = startId + i - 1;
    const firstName = randomChoice(SEED_DATA.FIRST_NAMES);
    const lastName = randomChoice(SEED_DATA.LAST_NAMES);
    const isSteward = (i % 10) === 0; // Every 10th member is a steward

    // Generate unique email
    let email = generateEmail(firstName, lastName);
    let emailAttempts = 0;
    while (usedEmails.has(email) && emailAttempts < 10) {
      email = generateEmail(firstName, lastName, memberId);
      emailAttempts++;
    }
    usedEmails.add(email);

    // Generate random dates for contact tracking
    const recentContactDate = randomPastDate(60);
    const contactSteward = randomChoice(useStewards);

    // Generate member row (34 columns to match MEMBER_COLS) - ALL FIELDS POPULATED
    const memberRow = [
      'M' + String(memberId).padStart(6, '0'),     // A: Member ID
      firstName,                                    // B: First Name
      lastName,                                     // C: Last Name
      randomChoice(useJobTitles),                   // D: Job Title
      randomChoice(useLocations),                   // E: Work Location
      randomChoice(useUnits),                       // F: Unit
      randomChoice(['Monday-Friday', 'Mon/Wed/Fri', 'Tue/Thu', 'Flexible']), // G: Office Days
      email,                                        // H: Email
      generatePhone(),                              // I: Phone
      randomChoice(['Email', 'Phone', 'Text', 'Email, Text', 'Phone, Text']), // J: Preferred Comm
      randomChoice(['Morning (8am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)', 'Anytime']), // K: Best Time
      randomChoice(useSupervisors),                 // L: Supervisor
      randomChoice(useManagers),                    // M: Manager
      isSteward ? 'Yes' : 'No',                    // N: Is Steward
      isSteward ? randomChoice(SEED_DATA.COMMITTEES) : randomChoice(SEED_DATA.COMMITTEES), // O: Committees (all get one)
      randomChoice(useStewards),                    // P: Assigned Steward (everyone gets one)
      randomPastDate(180),                          // Q: Last Virtual Mtg
      randomPastDate(90),                           // R: Last In-Person Mtg
      Math.floor(Math.random() * 60) + 40,         // S: Open Rate (40-100%)
      Math.floor(Math.random() * 100),             // T: Volunteer Hours (0-100)
      randomChoice(['Yes', 'No', 'Maybe']),        // U: Interest Local
      randomChoice(['Yes', 'No', 'Maybe']),        // V: Interest Chapter
      randomChoice(['Yes', 'No']),                 // W: Interest Allied
      randomChoice(SEED_DATA.HOME_TOWNS),           // X: Home Town
      recentContactDate,                            // Y: Recent Contact Date
      contactSteward,                               // Z: Contact Steward
      generateContactNote(firstName),               // AA: Contact Notes
      '',                                           // AB: Has Open Grievance (formula - leave empty)
      '',                                           // AC: Grievance Status (formula - leave empty)
      '',                                           // AD: Next Deadline (formula - leave empty)
      false,                                        // AE: Start Grievance (checkbox)
      '',                                           // AF: Total Grievance Count (formula - leave empty)
      '',                                           // AG: Grievance Win Rate (formula - leave empty)
      ''                                            // AH: Last Grievance Date (formula - leave empty)
    ];

    memberData.push(memberRow);
  }

  // Find the next empty row
  const startRow = Math.max(lastRow + 1, 2);

  // Write all member data
  memberSheet.getRange(startRow, 1, memberData.length, memberData[0].length).setValues(memberData);

  Logger.log('Seeded ' + count + ' members starting at row ' + startRow);
}

/**
 * Seeds Grievance Log with sample grievances
 * @param {number} count - Number of grievances to create (default 25)
 */
function SEED_GRIEVANCES(count) {
  count = count || 25;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!grievanceSheet) {
    throw new Error('Grievance Log not found. Run CREATE_509_DASHBOARD first.');
  }

  // Get existing members
  const memberLastRow = memberSheet ? memberSheet.getLastRow() : 1;
  let members = [];

  if (memberLastRow > 1) {
    const memberData = memberSheet.getRange(2, 1, memberLastRow - 1, 8).getValues();
    members = memberData.filter(function(row) { return row[0] && row[0].toString().trim() !== ''; });
  }

  // Get config values - fall back to SEED_DATA
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);
  const locations = getConfigColumnValues(configSheet, 2);
  const units = getConfigColumnValues(configSheet, 3);
  const stewards = getConfigColumnValues(configSheet, 8);

  const useLocations = (locations && locations.length > 0) ? locations : SEED_DATA.OFFICE_LOCATIONS;
  const useUnits = (units && units.length > 0) ? units : SEED_DATA.UNITS;
  const useStewards = (stewards && stewards.length > 0) ? stewards : SEED_DATA.STEWARDS;

  const grievanceData = [];

  // Find starting ID
  const lastRow = grievanceSheet.getLastRow();
  const startId = lastRow > 1 ? lastRow : 1;

  for (let i = 1; i <= count; i++) {
    const grievanceId = startId + i - 1;

    // Use existing member or generate one
    let memberId, firstName, lastName, memberEmail;

    if (members.length > 0) {
      const member = members[(i - 1) % members.length];
      memberId = member[0];
      firstName = member[1];
      lastName = member[2];
      memberEmail = member[7];
    } else {
      memberId = 'M' + String(i).padStart(6, '0');
      firstName = randomChoice(SEED_DATA.FIRST_NAMES);
      lastName = randomChoice(SEED_DATA.LAST_NAMES);
      memberEmail = generateEmail(firstName, lastName);
    }

    const incidentDate = randomPastDate(120);
    const dateFiled = addDays(incidentDate, Math.floor(Math.random() * 14) + 1);
    const status = randomChoice(SEED_DATA.STATUSES);
    const currentStep = randomChoice(SEED_DATA.STEPS);
    const isClosed = ['Settled', 'Withdrawn', 'Closed'].includes(status);
    const isAdvanced = ['Step II', 'Step III', 'Arbitration'].includes(currentStep);

    // Calculate realistic dates based on step
    const step1Rcvd = addDays(dateFiled, Math.floor(Math.random() * 25) + 5);
    const step2AppealFiled = isAdvanced ? addDays(step1Rcvd, Math.floor(Math.random() * 8) + 2) : '';
    const step2Rcvd = isAdvanced ? addDays(step2AppealFiled, Math.floor(Math.random() * 25) + 5) : '';
    const step3AppealFiled = currentStep === 'Step III' || currentStep === 'Arbitration' ? addDays(step2Rcvd, Math.floor(Math.random() * 25) + 5) : '';
    const dateClosed = isClosed ? addDays(dateFiled, Math.floor(Math.random() * 90) + 10) : '';

    // Generate resolution notes for closed cases
    const resolutionNotes = isClosed ? generateResolutionNote(status) : generatePendingNote(currentStep);

    // Generate coordinator message for some grievances
    const hasCoordinatorMessage = Math.random() > 0.7;
    const coordinatorMessage = hasCoordinatorMessage ? generateCoordinatorMessage() : '';
    const acknowledgedBy = hasCoordinatorMessage && Math.random() > 0.5 ? randomChoice(useStewards) : '';
    const acknowledgedDate = acknowledgedBy ? randomPastDate(14) : '';

    // Generate grievance row (34 columns to match GRIEVANCE_COLS) - ALL FIELDS POPULATED
    const grievanceRow = [
      'G-' + String(grievanceId).padStart(6, '0'), // A: Grievance ID
      memberId,                                     // B: Member ID
      firstName,                                    // C: First Name
      lastName,                                     // D: Last Name
      status,                                       // E: Status
      currentStep,                                  // F: Current Step
      incidentDate,                                 // G: Incident Date
      '',                                           // H: Filing Deadline (formula - leave empty)
      dateFiled,                                    // I: Date Filed
      '',                                           // J: Step I Due (formula - leave empty)
      step1Rcvd,                                    // K: Step I Rcvd
      '',                                           // L: Step II Appeal Due (formula - leave empty)
      step2AppealFiled,                             // M: Step II Appeal Filed
      '',                                           // N: Step II Decision Due (formula - leave empty)
      step2Rcvd,                                    // O: Step II Decision Rcvd
      '',                                           // P: Step III Appeal Due (formula - leave empty)
      step3AppealFiled,                             // Q: Step III Appeal Filed
      dateClosed,                                   // R: Date Closed
      '',                                           // S: Days Open (formula - leave empty)
      '',                                           // T: Next Action Due (formula - leave empty)
      '',                                           // U: Days to Deadline (formula - leave empty)
      randomChoice(SEED_DATA.ARTICLES),             // V: Articles Violated
      randomChoice(SEED_DATA.ISSUE_CATEGORIES),     // W: Issue Category
      memberEmail,                                  // X: Member Email
      randomChoice(useUnits),                       // Y: Unit
      randomChoice(useLocations),                   // Z: Location
      randomChoice(useStewards),                    // AA: Steward
      resolutionNotes,                              // AB: Resolution/Notes
      hasCoordinatorMessage,                        // AC: Message Alert
      coordinatorMessage,                           // AD: Coordinator Message
      acknowledgedBy,                               // AE: Acknowledged By
      acknowledgedDate,                             // AF: Acknowledged Date
      '',                                           // AG: Drive Folder ID (leave empty - created on demand)
      ''                                            // AH: Drive Folder URL (leave empty - created on demand)
    ];

    grievanceData.push(grievanceRow);
  }

  // Find the next empty row
  const startRow = Math.max(lastRow + 1, 2);

  // Write all grievance data
  grievanceSheet.getRange(startRow, 1, grievanceData.length, grievanceData[0].length).setValues(grievanceData);

  Logger.log('Seeded ' + count + ' grievances starting at row ' + startRow);
}

/* ============================================================================
 * NUKE FUNCTIONS
 * ============================================================================ */

/**
 * Clears ALL data from Member Directory and Grievance Log
 * Config organization info is preserved
 */
function NUKE_ALL_DATA() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'NUKE ALL DATA',
    'WARNING: This will permanently delete:\n\n' +
    '- All members from Member Directory\n' +
    '- All grievances from Grievance Log\n' +
    '- Config dropdown values (Job Titles, Locations, etc.)\n\n' +
    'Organization info in Config will be preserved.\n\n' +
    'This cannot be undone. Are you sure?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    ui.alert('Cancelled', 'No data was deleted.', ui.ButtonSet.OK);
    return;
  }

  // Double confirmation
  const confirm = ui.alert(
    'FINAL WARNING',
    'Type "DELETE" in the next prompt to confirm deletion.',
    ui.ButtonSet.OK_CANCEL
  );

  if (confirm !== ui.Button.OK) {
    ui.alert('Cancelled', 'No data was deleted.', ui.ButtonSet.OK);
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    ss.toast('Clearing data...', 'Nuking', -1);

    // Clear Member Directory (preserve header row)
    const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
    if (memberSheet) {
      const memberLastRow = memberSheet.getLastRow();
      if (memberLastRow > 1) {
        memberSheet.getRange(2, 1, memberLastRow - 1, memberSheet.getLastColumn()).clearContent();
      }
    }

    // Clear Grievance Log (preserve header row)
    const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
    if (grievanceSheet) {
      const grievanceLastRow = grievanceSheet.getLastRow();
      if (grievanceLastRow > 1) {
        grievanceSheet.getRange(2, 1, grievanceLastRow - 1, grievanceSheet.getLastColumn()).clearContent();
      }
    }

    // Clear Config dropdown values (preserve org info in cols 21-24 and 37-43)
    const configSheet = ss.getSheetByName(SHEETS.CONFIG);
    if (configSheet) {
      // Clear columns A-H (Job Titles through Stewards)
      const configLastRow = configSheet.getLastRow();
      if (configLastRow > 1) {
        configSheet.getRange(2, 1, configLastRow - 1, 8).clearContent();
      }
    }

    SpreadsheetApp.flush();
    ss.toast('All data cleared!', 'Complete', 5);

    ui.alert(
      'Nuke Complete',
      'All data has been cleared:\n\n' +
      '- Member Directory: Cleared\n' +
      '- Grievance Log: Cleared\n' +
      '- Config dropdowns: Cleared\n\n' +
      'Organization info was preserved.',
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log('NUKE_ALL_DATA error: ' + error.toString());
    ui.alert('Error', 'Failed to clear data: ' + error.message, ui.ButtonSet.OK);
  }
}

/**
 * Clears only Config dropdown values (Job Titles, Locations, Units, Supervisors, Managers, Stewards)
 */
function NUKE_CONFIG_DROPDOWNS() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Clear Config Dropdowns',
    'This will clear:\n\n' +
    '- Job Titles\n' +
    '- Office Locations\n' +
    '- Units\n' +
    '- Supervisors\n' +
    '- Managers\n' +
    '- Stewards\n\n' +
    'Organization info will be preserved. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);

  if (configSheet) {
    const lastRow = configSheet.getLastRow();
    if (lastRow > 1) {
      // Clear columns A-H (1-8)
      configSheet.getRange(2, 1, lastRow - 1, 8).clearContent();
    }
  }

  ss.toast('Config dropdowns cleared!', 'Complete', 3);
}

/* ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================ */

/**
 * Gets values from a Config column
 */
function getConfigColumnValues(sheet, colIndex) {
  if (!sheet) return null;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const values = sheet.getRange(2, colIndex, lastRow - 1, 1).getValues();
  return values
    .map(function(row) { return row[0]; })
    .filter(function(val) { return val && val.toString().trim() !== ''; });
}

/**
 * Returns a random element from an array
 */
function randomChoice(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates a random email address
 */
function generateEmail(firstName, lastName, suffix) {
  const domain = 'seiu509.org';
  const base = (firstName.charAt(0) + lastName).toLowerCase().replace(/[^a-z]/g, '');
  if (suffix) {
    return base + suffix + '@' + domain;
  }
  return base + '@' + domain;
}

/**
 * Generates a random phone number
 */
function generatePhone() {
  const area = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const line = Math.floor(Math.random() * 9000) + 1000;
  return '(' + area + ') ' + prefix + '-' + line;
}

/**
 * Returns a random date in the past N days
 */
function randomPastDate(maxDaysAgo) {
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

/**
 * Adds days to a date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generates a contact note for a member
 */
function generateContactNote(firstName) {
  const notes = [
    'Discussed upcoming contract negotiations',
    'Followed up on workplace concerns',
    'Provided information about union benefits',
    'Discussed grievance process',
    'Check-in call - member satisfied',
    'Addressed scheduling conflict',
    'Discussed volunteer opportunities',
    'Provided update on open grievance',
    'Member expressed interest in becoming a steward',
    'Followed up on safety concerns',
    'Discussed health insurance questions',
    'Provided information about training opportunities',
    'Member requested information about FMLA',
    'Discussed workload concerns',
    'Check-in - no issues reported'
  ];
  return randomChoice(notes);
}

/**
 * Generates a resolution note for closed grievances
 */
function generateResolutionNote(status) {
  const notes = {
    'Settled': [
      'Settled at Step I - management agreed to corrective action',
      'Settled at Step II - member received back pay',
      'Settlement reached - policy clarification provided',
      'Resolved through mediation - satisfactory outcome',
      'Management agreed to modify scheduling',
      'Settled with written warning removed from file'
    ],
    'Withdrawn': [
      'Withdrawn by member - issue resolved informally',
      'Member transferred to different department',
      'Withdrawn - member found alternative solution',
      'Withdrawn at member\'s request after discussion with supervisor',
      'Issue addressed through other channels'
    ],
    'Closed': [
      'Closed - insufficient evidence to proceed',
      'Closed after arbitration decision',
      'Closed - time limits expired',
      'Closed - member no longer employed',
      'Closed per CBA requirements'
    ]
  };
  return randomChoice(notes[status] || notes['Closed']);
}

/**
 * Generates a pending note for open grievances
 */
function generatePendingNote(currentStep) {
  const notes = {
    'Informal': [
      'Attempting informal resolution with supervisor',
      'Scheduled meeting with management',
      'Gathering documentation'
    ],
    'Step I': [
      'Awaiting Step I response from management',
      'Step I meeting scheduled',
      'Preparing Step I documentation'
    ],
    'Step II': [
      'Appealed to Step II - awaiting hearing date',
      'Step II hearing scheduled',
      'Preparing for Step II presentation'
    ],
    'Step III': [
      'Appealed to Step III',
      'Awaiting arbitration date',
      'Compiling evidence for arbitration'
    ],
    'Arbitration': [
      'Arbitration hearing scheduled',
      'Awaiting arbitrator decision',
      'Post-hearing brief submitted'
    ]
  };
  return randomChoice(notes[currentStep] || ['In progress']);
}

/**
 * Generates a coordinator message
 */
function generateCoordinatorMessage() {
  const messages = [
    'Please prioritize this case - approaching deadline',
    'Member has requested status update',
    'Need additional documentation ASAP',
    'Management has requested meeting - please confirm availability',
    'Important: Review attached policy before next hearing',
    'Please contact member to discuss settlement offer',
    'Reminder: Step deadline approaching in 3 days',
    'Please update case notes after your meeting',
    'New evidence received - please review',
    'Union attorney has reviewed - see attached notes'
  ];
  return randomChoice(messages);
}

/* ============================================================================
 * PRESET SEED FUNCTIONS (for common use cases)
 * ============================================================================ */

/**
 * Seeds 2000 members with all fields populated
 */
function SEED_2K_MEMBERS() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Seed 2,000 Members',
    'This will create 2,000 sample members with ALL fields populated.\n\n' +
    'This may take 3-5 minutes. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Seeding 2,000 members... Please wait.', 'Processing', -1);

  try {
    // Seed in batches of 50 to avoid timeout
    const batchSize = 50;
    const totalBatches = 40;

    for (let batch = 0; batch < totalBatches; batch++) {
      SEED_MEMBERS(batchSize);
      SpreadsheetApp.flush();

      // Progress update every 10 batches
      if ((batch + 1) % 10 === 0) {
        ss.toast('Progress: ' + ((batch + 1) * batchSize) + ' of 2,000 members...', 'Processing', -1);
      }

      // Pause to let API recover and prevent timeout
      Utilities.sleep(1000);
    }

    ss.toast('Successfully created 2,000 members!', 'Complete', 5);
    ui.alert('Success', '2,000 members have been created with all fields populated.', ui.ButtonSet.OK);
  } catch (error) {
    Logger.log('SEED_2K_MEMBERS error: ' + error.toString());
    ui.alert('Error', 'Failed to seed members: ' + error.message, ui.ButtonSet.OK);
  }
}

/**
 * Seeds 300 grievances with all fields populated
 */
function SEED_300_GRIEVANCES() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Seed 300 Grievances',
    'This will create 300 sample grievances with ALL fields populated.\n\n' +
    'Make sure you have members in the Member Directory first!\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Seeding 300 grievances... Please wait.', 'Processing', -1);

  try {
    // Seed in batches of 25 to avoid timeout
    const batchSize = 25;
    const totalBatches = 12;

    for (let batch = 0; batch < totalBatches; batch++) {
      SEED_GRIEVANCES(batchSize);
      SpreadsheetApp.flush();
      ss.toast('Progress: ' + ((batch + 1) * batchSize) + ' of 300 grievances...', 'Processing', -1);

      // Pause to let API recover and prevent timeout
      Utilities.sleep(1000);
    }

    ss.toast('Successfully created 300 grievances!', 'Complete', 5);
    ui.alert('Success', '300 grievances have been created with all fields populated.', ui.ButtonSet.OK);
  } catch (error) {
    Logger.log('SEED_300_GRIEVANCES error: ' + error.toString());
    ui.alert('Error', 'Failed to seed grievances: ' + error.message, ui.ButtonSet.OK);
  }
}

/**
 * Seeds full demo dataset: 2K members + 300 grievances
 */
function SEED_FULL_DEMO() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Seed Full Demo Dataset',
    'This will create:\n\n' +
    '• 2,000 members\n' +
    '• 300 grievances\n' +
    '• Config dropdown values\n\n' +
    'ALL fields will be populated with realistic data.\n\n' +
    'This may take 5-8 minutes. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // Step 1: Seed Config
    ss.toast('Step 1/3: Seeding Config...', 'Processing', -1);
    seedConfigData();
    SpreadsheetApp.flush();
    Utilities.sleep(500);

    // Step 2: Seed Members (in batches of 50)
    ss.toast('Step 2/3: Seeding 2,000 members...', 'Processing', -1);
    for (let batch = 0; batch < 40; batch++) {
      SEED_MEMBERS(50);
      SpreadsheetApp.flush();
      if ((batch + 1) % 10 === 0) {
        ss.toast('Members: ' + ((batch + 1) * 50) + ' of 2,000...', 'Processing', -1);
      }
      Utilities.sleep(1000);
    }

    // Step 3: Seed Grievances (in batches of 25)
    ss.toast('Step 3/3: Seeding 300 grievances...', 'Processing', -1);
    for (let batch = 0; batch < 12; batch++) {
      SEED_GRIEVANCES(25);
      SpreadsheetApp.flush();
      ss.toast('Grievances: ' + ((batch + 1) * 25) + ' of 300...', 'Processing', -1);
      Utilities.sleep(1000);
    }

    // Refresh formulas
    ss.toast('Finalizing...', 'Processing', -1);
    if (typeof refreshAllFormulas === 'function') {
      refreshAllFormulas();
    }

    ss.toast('Full demo dataset created!', 'Complete', 5);
    ui.alert(
      'Success',
      'Full demo dataset created:\n\n' +
      '• 2,000 members\n' +
      '• 300 grievances\n' +
      '• Config populated\n\n' +
      'All fields have realistic data.',
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log('SEED_FULL_DEMO error: ' + error.toString());
    ui.alert('Error', 'Failed to seed data: ' + error.message, ui.ButtonSet.OK);
  }
}

/* ============================================================================
 * MENU WRAPPERS (for UI access)
 * ============================================================================ */

/**
 * Menu wrapper for seeding with custom count
 */
function SEED_MEMBERS_DIALOG() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Seed Members',
    'How many members do you want to create? (max 5000)',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const count = parseInt(response.getResponseText()) || 50;
    if (count > 0 && count <= 5000) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      ss.toast('Seeding ' + count + ' members...', 'Processing', -1);

      // Seed in batches of 50 to avoid timeout
      const batchSize = 50;
      const batches = Math.ceil(count / batchSize);

      for (let i = 0; i < batches; i++) {
        const batchCount = Math.min(batchSize, count - (i * batchSize));
        SEED_MEMBERS(batchCount);
        SpreadsheetApp.flush();
        if (batches > 1 && (i + 1) % 10 === 0) {
          ss.toast('Progress: ' + ((i + 1) * batchSize) + ' of ' + count + '...', 'Processing', -1);
        }
        Utilities.sleep(1000);
      }

      ss.toast('Created ' + count + ' members', 'Complete', 5);
    } else {
      ui.alert('Invalid Count', 'Please enter a number between 1 and 5000.', ui.ButtonSet.OK);
    }
  }
}

/**
 * Menu wrapper for seeding grievances with custom count
 */
function SEED_GRIEVANCES_DIALOG() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Seed Grievances',
    'How many grievances do you want to create? (max 1000)',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const count = parseInt(response.getResponseText()) || 25;
    if (count > 0 && count <= 1000) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      ss.toast('Seeding ' + count + ' grievances...', 'Processing', -1);

      // Seed in batches of 25 to avoid timeout
      const batchSize = 25;
      const batches = Math.ceil(count / batchSize);

      for (let i = 0; i < batches; i++) {
        const batchCount = Math.min(batchSize, count - (i * batchSize));
        SEED_GRIEVANCES(batchCount);
        SpreadsheetApp.flush();
        if (batches > 1) {
          ss.toast('Progress: ' + ((i + 1) * batchSize) + ' of ' + count + '...', 'Processing', -1);
        }
        Utilities.sleep(1000);
      }

      ss.toast('Created ' + count + ' grievances', 'Complete', 5);
    } else {
      ui.alert('Invalid Count', 'Please enter a number between 1 and 1000.', ui.ButtonSet.OK);
    }
  }
}
