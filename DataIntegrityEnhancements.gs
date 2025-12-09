/**
 * ------------------------------------------------------------------------====
 * DATA INTEGRITY ENHANCEMENTS
 * ------------------------------------------------------------------------====
 *
 * Enhancements for data quality and integrity:
 * - Duplicate ID detection
 * - Change tracking and audit log
 * - Data quality monitoring
 */

/**
 * Checks if a Member ID already exists before adding
 * @param {string} memberId - The member ID to check
 * @returns {boolean} True if ID is duplicate, false if unique
 */
function checkDuplicateMemberID(memberId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet || !memberId) return false;

  const lastRow = memberSheet.getLastRow();
  if (lastRow < 2) return false;

  const existingIds = memberSheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  return existingIds.includes(memberId);
}

/**
 * Checks if a Grievance ID already exists before adding
 * @param {string} grievanceId - The grievance ID to check
 * @returns {boolean} True if ID is duplicate, false if unique
 */
function checkDuplicateGrievanceID(grievanceId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet || !grievanceId) return false;

  const lastRow = grievanceSheet.getLastRow();
  if (lastRow < 2) return false;

  const existingIds = grievanceSheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  return existingIds.includes(grievanceId);
}

/**
 * Generates next available Member ID
 * @returns {string} Next available ID in format M000001
 */
function generateNextMemberID() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet) return 'M000001';

  const lastRow = memberSheet.getLastRow();
  if (lastRow < 2) return 'M000001';

  const existingIds = memberSheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();

  // Extract numbers and find max
  const numbers = existingIds
    .filter(function(id) { return id && id.toString().startsWith('M'); })
    .map(function(id) { return parseInt(id.toString().substring(1)); })
    .filter(function(num) { return !isNaN(num); });

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;

  return 'M' + nextNumber.toString().padStart(6, '0');
}

/**
 * Generates next available Grievance ID
 * @returns {string} Next available ID in format G-000001-A
 */
function generateNextGrievanceID() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet) return 'G-000001-A';

  const lastRow = grievanceSheet.getLastRow();
  if (lastRow < 2) return 'G-000001-A';

  const existingIds = grievanceSheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();

  let counter = 1;
  let letter = 'A';
  let newId;

  do {
    newId = `G-${String(counter).padStart(6, '0')}-${letter}`;

    if (!existingIds.includes(newId)) {
      break;
    }

    // Increment letter
    if (letter === 'Z') {
      letter = 'A';
      counter++;
    } else {
      letter = String.fromCharCode(letter.charCodeAt(0) + 1);
    }
  } while (existingIds.includes(newId));

  return newId;
}

/**
 * Shows dialog when duplicate Member ID is detected
 * @param {string} memberId - The duplicate ID
 */
function showDuplicateMemberIDWarning(memberId) {
  const ui = SpreadsheetApp.getUi();
  const nextId = generateNextMemberID();

  const response = ui.alert(
    '⚠️ Duplicate Member ID Detected',
    `The Member ID "${memberId}" already exists in the system.\n\n` +
    `Next available ID: ${nextId}\n\n` +
    'Would you like to use the next available ID instead?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    return nextId;
  }

  return null;
}

/**
 * Shows dialog when duplicate Grievance ID is detected
 * @param {string} grievanceId - The duplicate ID
 */
function showDuplicateGrievanceIDWarning(grievanceId) {
  const ui = SpreadsheetApp.getUi();
  const nextId = generateNextGrievanceID();

  const response = ui.alert(
    '⚠️ Duplicate Grievance ID Detected',
    `The Grievance ID "${grievanceId}" already exists in the system.\n\n` +
    `Next available ID: ${nextId}\n\n` +
    'Would you like to use the next available ID instead?',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    return nextId;
  }

  return null;
}

/**
 * Creates a Change Log sheet to track all data modifications
 */
function createChangeLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let changeLog = ss.getSheetByName(SHEETS.CHANGE_LOG);

  if (!changeLog) {
    changeLog = ss.insertSheet('📝 Change Log');
  } else {
    return; // Already exists
  }

  // Header
  changeLog.getRange("A1:H1").merge()
    .setValue("📝 CHANGE LOG - Audit Trail")
    .setFontSize(16)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor("white");

  const headers = [
    "Timestamp",
    "User Email",
    "Sheet",
    "Row",
    "Column",
    "Field Name",
    "Old Value",
    "New Value"
  ];

  changeLog.getRange(3, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  changeLog.setFrozenRows(3);
  changeLog.setTabColor(COLORS.ACCENT_PURPLE);

  // Set column widths
  changeLog.setColumnWidth(1, 150); // Timestamp
  changeLog.setColumnWidth(2, 200); // User
  changeLog.setColumnWidth(3, 150); // Sheet
  changeLog.setColumnWidth(4, 60);  // Row
  changeLog.setColumnWidth(5, 60);  // Column
  changeLog.setColumnWidth(6, 150); // Field Name
  changeLog.setColumnWidth(7, 200); // Old Value
  changeLog.setColumnWidth(8, 200); // New Value

  // Delete unused columns beyond the defined headers (8 columns)
  const totalCols = changeLog.getMaxColumns();
  if (totalCols > headers.length) {
    changeLog.deleteColumns(headers.length + 1, totalCols - headers.length);
  }

  SpreadsheetApp.getUi().alert(
    '✅ Change Log Created',
    'The Change Log sheet has been created.\n\n' +
    'To enable automatic change tracking, you need to:\n' +
    '1. Go to Extensions → Apps Script\n' +
    '2. Click on Triggers (clock icon)\n' +
    '3. Add trigger: onEdit → From spreadsheet → On edit\n\n' +
    'This will track all changes made to Member Directory and Grievance Log.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Logs a change to the Change Log sheet
 * @param {object} e - The edit event object
 */
function onEdit(e) {
  if (!e) return;

  const ss = e.source;
  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();

  // Handle Start Grievance checkbox in Member Directory
  if (sheetName === SHEETS.MEMBER_DIR) {
    const row = e.range.getRow();
    const col = e.range.getColumn();

    // Check if Start Grievance checkbox was clicked (column 32/AF)
    if (col === MEMBER_COLS.START_GRIEVANCE && row > 1 && e.value === true) {
      // Reset checkbox immediately to allow re-use
      e.range.setValue(false);

      // Open grievance form with prepopulated member data
      openGrievanceFormForMember(row);
      return;
    }
  }

  // Only track changes to core data sheets
  if (sheetName !== SHEETS.MEMBER_DIR && sheetName !== SHEETS.GRIEVANCE_LOG) {
    return;
  }

  const changeLog = ss.getSheetByName(SHEETS.CHANGE_LOG);
  if (!changeLog) return; // Change log not created yet

  try {
    const timestamp = new Date();
    const userEmail = Session.getActiveUser().getEmail() || 'Unknown';
    const row = e.range.getRow();
    const col = e.range.getColumn();
    const fieldName = sheet.getRange(1, col).getValue(); // Get header name
    const oldValue = e.oldValue || '';
    const newValue = e.value || '';

    // Skip header row changes
    if (row === 1) return;

    // Only log if value actually changed
    if (oldValue === newValue) return;

    // Add to change log
    const lastRow = changeLog.getLastRow();
    const logRow = [
      timestamp,
      userEmail,
      sheetName,
      row,
      col,
      fieldName,
      oldValue,
      newValue
    ];

    changeLog.getRange(lastRow + 1, 1, 1, 8).setValues([logRow]);

  } catch (error) {
    Logger.log('Error in change tracking: ' + error.message);
    // Don't show error to user to avoid interrupting workflow
  }
}

/**
 * Shows data quality dashboard
 */
function showDataQualityDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!memberSheet || !grievanceSheet) {
    SpreadsheetApp.getUi().alert('Data sheets not found!');
    return;
  }

  // Calculate data quality metrics
  const memberLastRow = memberSheet.getLastRow() - 1;
  const grievanceLastRow = grievanceSheet.getLastRow() - 1;

  // Check email completeness (uses MEMBER_COLS.EMAIL for dynamic column reference)
  const emailData = memberSheet.getRange(2, MEMBER_COLS.EMAIL, memberLastRow, 1).getValues().flat();
  const emailsComplete = emailData.filter(function(email) { return email && email.toString().trim() !== ''; }).length;
  const emailCompleteness = memberLastRow > 0 ? ((emailsComplete / memberLastRow) * 100).toFixed(1) : 0;

  // Check phone completeness (uses MEMBER_COLS.PHONE for dynamic column reference)
  const phoneData = memberSheet.getRange(2, MEMBER_COLS.PHONE, memberLastRow, 1).getValues().flat();
  const phonesComplete = phoneData.filter(function(phone) { return phone && phone.toString().trim() !== ''; }).length;
  const phoneCompleteness = memberLastRow > 0 ? ((phonesComplete / memberLastRow) * 100).toFixed(1) : 0;

  // Check steward assignment in grievances (uses GRIEVANCE_COLS.STEWARD for dynamic column reference)
  const stewardData = grievanceSheet.getRange(2, GRIEVANCE_COLS.STEWARD, grievanceLastRow, 1).getValues().flat();
  const stewardsAssigned = stewardData.filter(function(s) { return s && s.toString().trim() !== ''; }).length;
  const stewardCompleteness = grievanceLastRow > 0 ? ((stewardsAssigned / grievanceLastRow) * 100).toFixed(1) : 0;

  // Overall quality score (average of all metrics)
  const qualityScore = ((parseFloat(emailCompleteness) + parseFloat(phoneCompleteness) + parseFloat(stewardCompleteness)) / 3).toFixed(1);

  // Show dashboard
  SpreadsheetApp.getUi().alert(
    '📊 Data Quality Dashboard',
    `Overall Quality Score: ${qualityScore}%\n\n` +
    '=== Member Directory ===\n' +
    `Total Members: ${memberLastRow}\n` +
    `Email Addresses: ${emailCompleteness}% complete (${emailsComplete}/${memberLastRow})\n` +
    `Phone Numbers: ${phoneCompleteness}% complete (${phonesComplete}/${memberLastRow})\n\n` +
    '=== Grievance Log ===\n' +
    `Total Grievances: ${grievanceLastRow}\n` +
    `Steward Assignments: ${stewardCompleteness}% complete (${stewardsAssigned}/${grievanceLastRow})\n\n` +
    `${qualityScore >= 90 ? '🟢 Excellent!' : qualityScore >= 75 ? '🟡 Good' : '🔴 Needs Improvement'}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Validates referential integrity (Member IDs in grievances exist in Member Directory)
 */
function checkReferentialIntegrity() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!memberSheet || !grievanceSheet) {
    SpreadsheetApp.getUi().alert('Data sheets not found!');
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('🔍 Checking referential integrity...', 'Please wait', -1);

  // Get all member IDs
  const memberLastRow = memberSheet.getLastRow();
  const memberIds = memberSheet.getRange(2, 1, memberLastRow - 1, 1).getValues().flat();

  // Get all member IDs from grievances
  const grievanceLastRow = grievanceSheet.getLastRow();
  const grievanceMemberIds = grievanceSheet.getRange(2, 2, grievanceLastRow - 1, 1).getValues();

  // Find orphaned grievances (member ID doesn't exist)
  const orphaned = [];
  for (let i = 0; i < grievanceMemberIds.length; i++) {
    const memberId = grievanceMemberIds[i][0];
    if (memberId && !memberIds.includes(memberId)) {
      const grievanceId = grievanceSheet.getRange(i + 2, 1).getValue();
      orphaned.push({ row: i + 2, grievanceId, memberId });
    }
  }

  // Show results
  if (orphaned.length === 0) {
    SpreadsheetApp.getUi().alert(
      '✅ Referential Integrity Check Passed',
      'All grievances have valid member IDs.\n\n' +
      `Checked ${grievanceLastRow - 1} grievances against ${memberLastRow - 1} members.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } else {
    const orphanedList = orphaned.slice(0, 10).map(function(o) {
      return `  Row ${o.row}: ${o.grievanceId} (Member ID: ${o.memberId})`;
    }).join('\n');

    SpreadsheetApp.getUi().alert(
      '⚠️ Referential Integrity Issues Found',
      `Found ${orphaned.length} grievance(s) with invalid member IDs:\n\n` +
      orphanedList +
      (orphaned.length > 10 ? `\n\n  ... and ${orphaned.length - 10} more` : '') +
      '\n\nThese grievances reference members that don\'t exist in the Member Directory.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}


/**
 * Shows next available Member ID dialog
 */
function showNextMemberID() {
  const nextId = generateNextMemberID();
  SpreadsheetApp.getUi().alert(
    "🆔 Next Available Member ID",
    `Next Member ID: ${nextId}\n\n` +
    "Use this ID when adding a new member to avoid duplicates.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Shows next available Grievance ID dialog
 */
function showNextGrievanceID() {
  const nextId = generateNextGrievanceID();
  SpreadsheetApp.getUi().alert(
    "🆔 Next Available Grievance ID",
    `Next Grievance ID: ${nextId}\n\n` +
    "Use this ID when creating a new grievance to avoid duplicates.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

