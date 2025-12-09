/**
 * ============================================================================
 * EMAIL UNSUBSCRIBE / OPT-OUT SYSTEM
 * ============================================================================
 *
 * Manages member email communication preferences with opt-out functionality.
 *
 * Features:
 * - Checkbox column for email opt-out status
 * - Automatic light red row highlighting for opted-out members (#FFCDD2)
 * - Export prefix with "(UNSUBSCRIBED)" to prevent accidental sends
 * - Filter opted-out members from bulk emails
 * - Audit logging for opt-out changes
 * - Bulk opt-out/opt-in operations
 *
 * @module EmailUnsubscribeSystem
 * @version 1.0.0
 * @author SEIU Local 509 Tech Team
 */

/**
 * Column for email opt-out in Member Directory
 * Added after existing columns - dynamically positioned after START_GRIEVANCE
 */
const EMAIL_OPTOUT_COL = MEMBER_COLS.START_GRIEVANCE + 1;  // AF column (32)

/**
 * Colors for opt-out highlighting
 */
const OPTOUT_COLORS = {
  OPTED_OUT_ROW: '#FFCDD2',      // Light red for opted-out rows
  OPTED_OUT_BADGE: '#F44336',     // Red badge color
  OPTED_IN_ROW: null,             // No color (default)
  HEADER: '#E57373'               // Lighter red for header
};

/**
 * Sets up the email opt-out column in Member Directory
 */
function setupEmailOptOutColumn() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet) {
    SpreadsheetApp.getUi().alert('Member Directory sheet not found!');
    return;
  }

  const lastCol = memberSheet.getLastColumn();

  // Check if column already exists by checking header
  if (lastCol >= EMAIL_OPTOUT_COL) {
    const existingHeader = memberSheet.getRange(1, EMAIL_OPTOUT_COL).getValue();
    if (existingHeader === 'Email Opt-Out') {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Email Opt-Out column already exists',
        'Info',
        3
      );
      return;
    }
  }

  // Add header
  memberSheet.getRange(1, EMAIL_OPTOUT_COL)
    .setValue('Email Opt-Out')
    .setBackground(OPTOUT_COLORS.HEADER)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setNote('Check to opt member out of bulk email communications');

  // Set column width
  memberSheet.setColumnWidth(EMAIL_OPTOUT_COL, 100);

  // Add checkboxes for all data rows
  const lastRow = memberSheet.getLastRow();
  if (lastRow > 1) {
    const checkboxRange = memberSheet.getRange(2, EMAIL_OPTOUT_COL, lastRow - 1, 1);
    checkboxRange.insertCheckboxes();
    checkboxRange.setHorizontalAlignment('center');
  }

  SpreadsheetApp.getUi().alert(
    '✅ Email Opt-Out Column Created',
    'The Email Opt-Out column has been added to the Member Directory.\n\n' +
    '- Check the box to opt a member out of bulk emails\n' +
    '- Opted-out members will have their rows highlighted in light red\n' +
    '- Exports will prefix opted-out emails with "(UNSUBSCRIBED)"\n\n' +
    'Run "Apply Opt-Out Highlighting" to update row colors.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Applies highlighting to opted-out member rows
 */
function applyOptOutHighlighting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet) {
    SpreadsheetApp.getUi().alert('Member Directory sheet not found!');
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Applying opt-out highlighting...',
    'Processing',
    -1
  );

  const lastRow = memberSheet.getLastRow();
  const lastCol = memberSheet.getLastColumn();

  if (lastRow < 2 || lastCol < EMAIL_OPTOUT_COL) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'No data or opt-out column not found',
      'Info',
      3
    );
    return;
  }

  // Get opt-out values
  const optOutData = memberSheet.getRange(2, EMAIL_OPTOUT_COL, lastRow - 1, 1).getValues();

  let optedOutCount = 0;
  let optedInCount = 0;

  // Apply highlighting row by row
  for (let i = 0; i < optOutData.length; i++) {
    const isOptedOut = optOutData[i][0] === true;
    const rowNum = i + 2;

    const rowRange = memberSheet.getRange(rowNum, 1, 1, lastCol);

    if (isOptedOut) {
      rowRange.setBackground(OPTOUT_COLORS.OPTED_OUT_ROW);
      optedOutCount++;
    } else {
      // Reset to white (or null to clear background)
      rowRange.setBackground('#FFFFFF');
      optedInCount++;
    }
  }

  SpreadsheetApp.flush();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `Highlighting applied: ${optedOutCount} opted-out, ${optedInCount} active`,
    'Complete',
    5
  );
}

/**
 * Checks if a member is opted out of emails
 * @param {string} memberId - Member ID to check
 * @returns {boolean} True if member is opted out
 */
function isMemberOptedOut(memberId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet || !memberId) return false;

  const lastRow = memberSheet.getLastRow();
  if (lastRow < 2) return false;

  const data = memberSheet.getRange(2, 1, lastRow - 1, EMAIL_OPTOUT_COL).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === memberId) {
      return data[i][EMAIL_OPTOUT_COL - 1] === true;
    }
  }

  return false;
}

/**
 * Checks if an email belongs to an opted-out member
 * @param {string} email - Email address to check
 * @returns {boolean} True if email belongs to opted-out member
 */
function isEmailOptedOut(email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet || !email) return false;

  const lastRow = memberSheet.getLastRow();
  if (lastRow < 2) return false;

  const emailCol = MEMBER_COLS.EMAIL;
  const data = memberSheet.getRange(2, 1, lastRow - 1, EMAIL_OPTOUT_COL).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][emailCol - 1] && data[i][emailCol - 1].toString().toLowerCase() === email.toLowerCase()) {
      return data[i][EMAIL_OPTOUT_COL - 1] === true;
    }
  }

  return false;
}

/**
 * Gets list of opted-out member emails
 * @returns {Array} Array of opted-out email addresses
 */
function getOptedOutEmails() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet) return [];

  const lastRow = memberSheet.getLastRow();
  if (lastRow < 2) return [];

  const emailCol = MEMBER_COLS.EMAIL;
  const data = memberSheet.getRange(2, 1, lastRow - 1, EMAIL_OPTOUT_COL).getValues();

  const optedOutEmails = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i][EMAIL_OPTOUT_COL - 1] === true) {
      const email = data[i][emailCol - 1];
      if (email) {
        optedOutEmails.push(email.toString());
      }
    }
  }

  return optedOutEmails;
}

/**
 * Gets list of active (not opted-out) member emails
 * @returns {Array} Array of active email addresses
 */
function getActiveEmails() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet) return [];

  const lastRow = memberSheet.getLastRow();
  if (lastRow < 2) return [];

  const emailCol = MEMBER_COLS.EMAIL;
  const data = memberSheet.getRange(2, 1, lastRow - 1, EMAIL_OPTOUT_COL).getValues();

  const activeEmails = [];

  for (let i = 0; i < data.length; i++) {
    // Only include if NOT opted out and has valid email
    if (data[i][EMAIL_OPTOUT_COL - 1] !== true) {
      const email = data[i][emailCol - 1];
      if (email && email.toString().includes('@')) {
        activeEmails.push(email.toString());
      }
    }
  }

  return activeEmails;
}

/**
 * Shows opt-out statistics
 */
function showOptOutStatistics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet) {
    SpreadsheetApp.getUi().alert('Member Directory sheet not found!');
    return;
  }

  const lastRow = memberSheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No member data found!');
    return;
  }

  const optOutData = memberSheet.getRange(2, EMAIL_OPTOUT_COL, lastRow - 1, 1).getValues();
  const emailData = memberSheet.getRange(2, MEMBER_COLS.EMAIL, lastRow - 1, 1).getValues();

  let totalMembers = lastRow - 1;
  let optedOut = 0;
  let hasEmail = 0;
  let noEmail = 0;

  for (let i = 0; i < optOutData.length; i++) {
    if (optOutData[i][0] === true) {
      optedOut++;
    }
    if (emailData[i][0] && emailData[i][0].toString().includes('@')) {
      hasEmail++;
    } else {
      noEmail++;
    }
  }

  const active = totalMembers - optedOut;
  const optOutRate = totalMembers > 0 ? ((optedOut / totalMembers) * 100).toFixed(1) : 0;

  SpreadsheetApp.getUi().alert(
    '📧 Email Opt-Out Statistics',
    `Total Members: ${totalMembers}\n\n` +
    `📧 Email Status:\n` +
    `  ✅ Active (can email): ${active} (${(100 - parseFloat(optOutRate)).toFixed(1)}%)\n` +
    `  🚫 Opted Out: ${optedOut} (${optOutRate}%)\n\n` +
    `📝 Email Address Status:\n` +
    `  ✉️ Has Email: ${hasEmail}\n` +
    `  ❌ No Email: ${noEmail}\n\n` +
    `📊 Effective Reach: ${hasEmail - optedOut} members`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Exports member data with opt-out handling
 * Opted-out members have their emails prefixed with "(UNSUBSCRIBED)"
 * @param {boolean} includeOptedOut - Whether to include opted-out members
 * @returns {Array} Export data array
 */
function exportMembersWithOptOutHandling(includeOptedOut) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet) return [];

  const lastRow = memberSheet.getLastRow();
  const lastCol = memberSheet.getLastColumn();

  if (lastRow < 2) return [];

  // Get all data including headers
  const allData = memberSheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = allData[0];
  const data = allData.slice(1);

  const emailColIndex = MEMBER_COLS.EMAIL - 1;
  const optOutColIndex = EMAIL_OPTOUT_COL - 1;

  const exportData = [headers];

  for (let i = 0; i < data.length; i++) {
    const row = data[i].slice(); // Clone the row
    const isOptedOut = row[optOutColIndex] === true;

    if (!includeOptedOut && isOptedOut) {
      // Skip opted-out members
      continue;
    }

    if (isOptedOut && row[emailColIndex]) {
      // Prefix email with (UNSUBSCRIBED)
      row[emailColIndex] = '(UNSUBSCRIBED) ' + row[emailColIndex];
    }

    exportData.push(row);
  }

  return exportData;
}

/**
 * Exports members to CSV with opt-out handling
 */
function exportMembersWithOptOut() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    '📤 Export Members',
    'Do you want to include opted-out members in the export?\n\n' +
    'YES = Include all members (opted-out emails will be prefixed)\n' +
    'NO = Exclude opted-out members entirely',
    ui.ButtonSet.YES_NO_CANCEL
  );

  if (response === ui.Button.CANCEL) return;

  const includeOptedOut = response === ui.Button.YES;
  const exportData = exportMembersWithOptOutHandling(includeOptedOut);

  if (exportData.length <= 1) {
    ui.alert('No data to export!');
    return;
  }

  // Create export sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let exportSheet = ss.getSheetByName('Members_Export');

  if (exportSheet) {
    exportSheet.clear();
  } else {
    exportSheet = ss.insertSheet('Members_Export');
  }

  exportSheet.getRange(1, 1, exportData.length, exportData[0].length).setValues(exportData);

  // Format header
  exportSheet.getRange(1, 1, 1, exportData[0].length)
    .setBackground('#059669')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');

  exportSheet.setFrozenRows(1);

  const exportedCount = exportData.length - 1;

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `Exported ${exportedCount} members to Members_Export sheet`,
    'Export Complete',
    5
  );

  ss.setActiveSheet(exportSheet);
}

/**
 * Bulk opt-out selected members
 */
function bulkOptOut() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  if (sheet.getName() !== SHEETS.MEMBER_DIR) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Wrong Sheet',
      'Please select rows in the Member Directory sheet first.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  const selection = sheet.getActiveRange();
  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  if (startRow < 2) {
    SpreadsheetApp.getUi().alert('Please select data rows, not the header.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '🚫 Bulk Opt-Out',
    `Are you sure you want to opt out ${numRows} member(s) from email communications?`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  // Set opt-out checkboxes
  const optOutRange = sheet.getRange(startRow, EMAIL_OPTOUT_COL, numRows, 1);
  optOutRange.check();

  // Apply highlighting
  applyOptOutHighlighting();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `Opted out ${numRows} member(s) from email communications`,
    'Complete',
    5
  );
}

/**
 * Bulk opt-in selected members
 */
function bulkOptIn() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  if (sheet.getName() !== SHEETS.MEMBER_DIR) {
    SpreadsheetApp.getUi().alert(
      '⚠️ Wrong Sheet',
      'Please select rows in the Member Directory sheet first.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  const selection = sheet.getActiveRange();
  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  if (startRow < 2) {
    SpreadsheetApp.getUi().alert('Please select data rows, not the header.');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '✅ Bulk Opt-In',
    `Are you sure you want to opt in ${numRows} member(s) to email communications?`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  // Uncheck opt-out checkboxes
  const optOutRange = sheet.getRange(startRow, EMAIL_OPTOUT_COL, numRows, 1);
  optOutRange.uncheck();

  // Apply highlighting
  applyOptOutHighlighting();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `Opted in ${numRows} member(s) to email communications`,
    'Complete',
    5
  );
}

/**
 * Shows email opt-out management panel
 */
function showOptOutManagementPanel() {
  const activeEmails = getActiveEmails();
  const optedOutEmails = getOptedOutEmails();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #1a73e8; margin-top: 0; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-card.active { border-left: 4px solid #4caf50; }
    .stat-card.opted-out { border-left: 4px solid #f44336; }
    .stat-value { font-size: 36px; font-weight: bold; color: #333; }
    .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
    .action-buttons { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
    button { background: #1a73e8; color: white; border: none; padding: 12px 20px; font-size: 14px; border-radius: 4px; cursor: pointer; flex: 1; min-width: 150px; }
    button:hover { background: #1557b0; }
    button.secondary { background: #6c757d; }
    button.danger { background: #dc3545; }
    .info-box { background: #e8f5e9; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #4caf50; }
    .warning-box { background: #fff3e0; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ff9800; }
  </style>
</head>
<body>
  <div class="container">
    <h2>📧 Email Opt-Out Management</h2>

    <div class="stats-grid">
      <div class="stat-card active">
        <div class="stat-value">${activeEmails.length}</div>
        <div class="stat-label">✅ Active Members</div>
      </div>
      <div class="stat-card opted-out">
        <div class="stat-value">${optedOutEmails.length}</div>
        <div class="stat-label">🚫 Opted Out</div>
      </div>
    </div>

    <div class="info-box">
      <strong>📊 Email Reach Rate:</strong>
      ${activeEmails.length + optedOutEmails.length > 0
        ? ((activeEmails.length / (activeEmails.length + optedOutEmails.length)) * 100).toFixed(1)
        : 0}%
    </div>

    <div class="warning-box">
      <strong>⚠️ Important:</strong> Opted-out members will:
      <ul style="margin: 10px 0 0 0; padding-left: 20px;">
        <li>Have rows highlighted in light red</li>
        <li>Be excluded from bulk email operations</li>
        <li>Have emails prefixed with "(UNSUBSCRIBED)" in exports</li>
      </ul>
    </div>

    <div class="action-buttons">
      <button onclick="setupColumn()">🔧 Setup Opt-Out Column</button>
      <button onclick="applyHighlighting()">🎨 Apply Highlighting</button>
      <button onclick="showStats()">📊 View Statistics</button>
      <button onclick="exportWithOptOut()">📤 Export Members</button>
      <button class="secondary" onclick="google.script.host.close()">Close</button>
    </div>
  </div>

  <script>
    function setupColumn() {
      google.script.run.withSuccessHandler(close).setupEmailOptOutColumn();
    }
    function applyHighlighting() {
      google.script.run.withSuccessHandler(close).applyOptOutHighlighting();
    }
    function showStats() {
      google.script.run.showOptOutStatistics();
    }
    function exportWithOptOut() {
      google.script.run.exportMembersWithOptOut();
    }
    function close() {
      google.script.host.close();
    }
  </script>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📧 Email Opt-Out Management');
}

/**
 * Validates email before sending - checks opt-out status
 * Returns true if email can be sent, false if blocked
 * @param {string} email - Email address to validate
 * @returns {Object} {canSend: boolean, reason: string}
 */
function validateEmailForSending(email) {
  if (!email) {
    return { canSend: false, reason: 'No email address provided' };
  }

  if (!email.includes('@')) {
    return { canSend: false, reason: 'Invalid email format' };
  }

  if (isEmailOptedOut(email)) {
    return {
      canSend: false,
      reason: 'Member has opted out of email communications'
    };
  }

  return { canSend: true, reason: 'Email is valid and active' };
}

/**
 * Handles opt-out change event (for onEdit trigger)
 * @param {Object} e - Edit event object
 */
function handleOptOutChange(e) {
  if (!e) return;

  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEETS.MEMBER_DIR) return;

  const col = e.range.getColumn();
  if (col !== EMAIL_OPTOUT_COL) return;

  const row = e.range.getRow();
  if (row < 2) return;

  const isOptedOut = e.value === true || e.value === 'TRUE';
  const lastCol = sheet.getLastColumn();
  const rowRange = sheet.getRange(row, 1, 1, lastCol);

  if (isOptedOut) {
    rowRange.setBackground(OPTOUT_COLORS.OPTED_OUT_ROW);
  } else {
    rowRange.setBackground('#FFFFFF');
  }

  // Log the change
  try {
    const memberId = sheet.getRange(row, 1).getValue();
    logAuditEvent(
      isOptedOut ? 'EMAIL_OPT_OUT' : 'EMAIL_OPT_IN',
      { memberId: memberId, row: row },
      'INFO'
    );
  } catch (error) {
    // Audit logging not critical, continue
    Logger.log('Error logging opt-out change: ' + error.message);
  }
}
