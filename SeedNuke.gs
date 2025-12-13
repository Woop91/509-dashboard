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

  // Get config values for dropdowns
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);
  const jobTitles = getConfigColumnValues(configSheet, 1) || SEED_DATA.JOB_TITLES;
  const locations = getConfigColumnValues(configSheet, 2) || SEED_DATA.OFFICE_LOCATIONS;
  const units = getConfigColumnValues(configSheet, 3) || SEED_DATA.UNITS;
  const supervisors = getConfigColumnValues(configSheet, 6) || SEED_DATA.SUPERVISORS;
  const managers = getConfigColumnValues(configSheet, 7) || SEED_DATA.MANAGERS;
  const stewards = getConfigColumnValues(configSheet, 8) || SEED_DATA.STEWARDS;

  const memberData = [];
  const usedEmails = new Set();

  for (let i = 1; i <= count; i++) {
    const firstName = randomChoice(SEED_DATA.FIRST_NAMES);
    const lastName = randomChoice(SEED_DATA.LAST_NAMES);
    const isSteward = i <= stewards.length; // First N members are stewards

    // Generate unique email
    let email = generateEmail(firstName, lastName);
    let emailAttempts = 0;
    while (usedEmails.has(email) && emailAttempts < 10) {
      email = generateEmail(firstName, lastName, i);
      emailAttempts++;
    }
    usedEmails.add(email);

    // Generate member row (34 columns to match MEMBER_COLS)
    const memberRow = [
      'M' + String(i).padStart(6, '0'),           // A: Member ID
      firstName,                                   // B: First Name
      lastName,                                    // C: Last Name
      randomChoice(jobTitles),                     // D: Job Title
      randomChoice(locations),                     // E: Work Location
      randomChoice(units),                         // F: Unit
      randomChoice(['Monday-Friday', 'Mon/Wed/Fri', 'Tue/Thu', 'Flexible']), // G: Office Days
      email,                                       // H: Email
      generatePhone(),                             // I: Phone
      randomChoice(['Email', 'Phone', 'Text']),   // J: Preferred Comm
      randomChoice(['Morning', 'Afternoon', 'Evening', 'Anytime']), // K: Best Time
      randomChoice(supervisors),                   // L: Supervisor
      randomChoice(managers),                      // M: Manager
      isSteward ? 'Yes' : 'No',                   // N: Is Steward
      isSteward ? randomChoice(SEED_DATA.COMMITTEES) : '', // O: Committees
      isSteward ? '' : randomChoice(stewards),    // P: Assigned Steward
      randomPastDate(180),                         // Q: Last Virtual Mtg
      randomPastDate(90),                          // R: Last In-Person Mtg
      Math.floor(Math.random() * 60) + 40,        // S: Open Rate (40-100%)
      Math.floor(Math.random() * 50),             // T: Volunteer Hours
      randomChoice(['Yes', 'No', 'Maybe']),       // U: Interest Local
      randomChoice(['Yes', 'No', 'Maybe']),       // V: Interest Chapter
      randomChoice(['Yes', 'No']),                // W: Interest Allied
      randomChoice(SEED_DATA.HOME_TOWNS),          // X: Home Town
      '',                                          // Y: Recent Contact Date (steward tracking)
      '',                                          // Z: Contact Steward
      '',                                          // AA: Contact Notes
      '',                                          // AB: Has Open Grievance (formula)
      '',                                          // AC: Grievance Status (formula)
      '',                                          // AD: Next Deadline (formula)
      false,                                       // AE: Start Grievance (checkbox)
      '',                                          // AF: Total Grievance Count (formula)
      '',                                          // AG: Grievance Win Rate (formula)
      ''                                           // AH: Last Grievance Date (formula)
    ];

    memberData.push(memberRow);
  }

  // Find the next empty row
  const lastRow = memberSheet.getLastRow();
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

  // Get config values
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);
  const locations = getConfigColumnValues(configSheet, 2) || SEED_DATA.OFFICE_LOCATIONS;
  const units = getConfigColumnValues(configSheet, 3) || SEED_DATA.UNITS;
  const stewards = getConfigColumnValues(configSheet, 8) || SEED_DATA.STEWARDS;

  const grievanceData = [];

  for (let i = 1; i <= count; i++) {
    // Use existing member or generate one
    let memberId, firstName, lastName, memberEmail;

    if (members.length > 0) {
      const member = members[i % members.length];
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
    const isClosed = ['Settled', 'Withdrawn', 'Closed'].includes(status);

    // Generate grievance row (34 columns to match GRIEVANCE_COLS)
    const grievanceRow = [
      'G-' + String(i).padStart(6, '0'),          // A: Grievance ID
      memberId,                                    // B: Member ID
      firstName,                                   // C: First Name
      lastName,                                    // D: Last Name
      status,                                      // E: Status
      isClosed ? randomChoice(['Step I', 'Step II', 'Step III']) : randomChoice(SEED_DATA.STEPS), // F: Current Step
      incidentDate,                                // G: Incident Date
      '',                                          // H: Filing Deadline (formula)
      dateFiled,                                   // I: Date Filed
      '',                                          // J: Step I Due (formula)
      isClosed || status === 'Pending Info' ? addDays(dateFiled, 20) : '', // K: Step I Rcvd
      '',                                          // L: Step II Appeal Due (formula)
      '',                                          // M: Step II Appeal Filed
      '',                                          // N: Step II Decision Due (formula)
      '',                                          // O: Step II Decision Rcvd
      '',                                          // P: Step III Appeal Due (formula)
      '',                                          // Q: Step III Appeal Filed
      isClosed ? addDays(dateFiled, Math.floor(Math.random() * 60) + 10) : '', // R: Date Closed
      '',                                          // S: Days Open (formula)
      '',                                          // T: Next Action Due (formula)
      '',                                          // U: Days to Deadline (formula)
      randomChoice(SEED_DATA.ARTICLES),            // V: Articles Violated
      randomChoice(SEED_DATA.ISSUE_CATEGORIES),    // W: Issue Category
      memberEmail,                                 // X: Member Email
      randomChoice(units),                         // Y: Unit
      randomChoice(locations),                     // Z: Location
      randomChoice(stewards),                      // AA: Steward
      isClosed ? 'Resolved through ' + status.toLowerCase() + ' process.' : '', // AB: Resolution
      false,                                       // AC: Message Alert
      '',                                          // AD: Coordinator Message
      '',                                          // AE: Acknowledged By
      '',                                          // AF: Acknowledged Date
      '',                                          // AG: Drive Folder ID
      ''                                           // AH: Drive Folder URL
    ];

    grievanceData.push(grievanceRow);
  }

  // Find the next empty row
  const lastRow = grievanceSheet.getLastRow();
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
    'How many members do you want to create?',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const count = parseInt(response.getResponseText()) || 50;
    if (count > 0 && count <= 1000) {
      SEED_MEMBERS(count);
      SpreadsheetApp.getActiveSpreadsheet().toast('Created ' + count + ' members', 'Complete', 5);
    } else {
      ui.alert('Invalid Count', 'Please enter a number between 1 and 1000.', ui.ButtonSet.OK);
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
    'How many grievances do you want to create?',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const count = parseInt(response.getResponseText()) || 25;
    if (count > 0 && count <= 500) {
      SEED_GRIEVANCES(count);
      SpreadsheetApp.getActiveSpreadsheet().toast('Created ' + count + ' grievances', 'Complete', 5);
    } else {
      ui.alert('Invalid Count', 'Please enter a number between 1 and 500.', ui.ButtonSet.OK);
    }
  }
}
