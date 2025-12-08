/**
 * ============================================================================
 * ADMIN GRIEVANCE MESSAGES - Coordinator Communication System
 * ============================================================================
 *
 * Handles admin-to-steward/grievant messaging with:
 * - Row highlighting when admin flag is checked
 * - Moving flagged rows to top of sheet
 * - Sending email notifications to steward and grievant
 * - Message acknowledgment tracking
 * - Full message trail logging
 *
 * @module AdminGrievanceMessages
 * @version 1.0.0
 * @author SEIU Local 509 Tech Team
 * ============================================================================
 */

/* ==================== CONSTANTS ==================== */

const ADMIN_MESSAGE_HIGHLIGHT_COLOR = '#FFF3CD'; // Light yellow/amber for pending
const ADMIN_MESSAGE_URGENT_COLOR = '#F8D7DA';    // Light red for urgent
const ADMIN_MESSAGE_CLEAR_COLOR = null;          // Clear/no background

/* ==================== TRIGGER HANDLER ==================== */

/**
 * Handles edits to the Grievance Log for admin message functionality
 * Called by onEdit trigger - checks for admin flag or acknowledgment changes
 * @param {Object} e - The edit event object
 */
function onGrievanceAdminEdit(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEETS.GRIEVANCE_LOG) return;

  const col = e.range.getColumn();
  const row = e.range.getRow();

  // Skip header row
  if (row < 2) return;

  // Check if admin flag column was edited
  if (col === GRIEVANCE_COLS.ADMIN_FLAG) {
    handleAdminFlagChange(sheet, row, e.value);
  }

  // Check if acknowledgment column was edited
  if (col === GRIEVANCE_COLS.MESSAGE_ACKNOWLEDGED) {
    handleAcknowledgmentChange(sheet, row, e.value);
  }
}

/* ==================== ADMIN FLAG HANDLING ==================== */

/**
 * Handles when the admin flag checkbox is checked/unchecked
 * @param {Sheet} sheet - The Grievance Log sheet
 * @param {number} row - The row number
 * @param {*} value - The new value (TRUE/FALSE)
 */
function handleAdminFlagChange(sheet, row, value) {
  const isChecked = value === true || value === 'TRUE';

  if (isChecked) {
    // Get grievance data for this row
    const rowData = getGrievanceRowData(sheet, row);

    if (!rowData.grievanceId) {
      SpreadsheetApp.getActiveSpreadsheet().toast('No grievance ID found in this row', 'Error', 3);
      return;
    }

    // Check if there's a message to send
    if (!rowData.adminMessage || rowData.adminMessage.trim() === '') {
      SpreadsheetApp.getActiveSpreadsheet().toast('Please enter a message in the Admin Message column first', 'Missing Message', 3);
      // Uncheck the flag since there's no message
      sheet.getRange(row, GRIEVANCE_COLS.ADMIN_FLAG).setValue(false);
      return;
    }

    // Highlight the row
    highlightGrievanceRow(sheet, row, ADMIN_MESSAGE_HIGHLIGHT_COLOR);

    // Send notification emails
    sendAdminMessageNotification(rowData);

    // Log the message
    logAdminMessage(rowData, 'SENT');

    // Move row to top (after header)
    moveRowToTop(sheet, row);

    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Message sent to ${rowData.steward} and ${rowData.firstName} ${rowData.lastName}`,
      'Message Sent',
      5
    );
  }
}

/**
 * Handles when the acknowledgment checkbox is checked
 * @param {Sheet} sheet - The Grievance Log sheet
 * @param {number} row - The row number
 * @param {*} value - The new value (TRUE/FALSE)
 */
function handleAcknowledgmentChange(sheet, row, value) {
  const isChecked = value === true || value === 'TRUE';

  if (isChecked) {
    // Get grievance data for logging
    const rowData = getGrievanceRowData(sheet, row);

    // Clear the highlight
    clearGrievanceRowHighlight(sheet, row);

    // Log the acknowledgment
    logAdminMessage(rowData, 'ACKNOWLEDGED');

    // Clear the admin flag (but keep the message for reference)
    sheet.getRange(row, GRIEVANCE_COLS.ADMIN_FLAG).setValue(false);

    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Message acknowledged for ${rowData.grievanceId}`,
      'Acknowledged',
      3
    );
  }
}

/* ==================== ROW DATA & MANIPULATION ==================== */

/**
 * Gets all relevant data from a grievance row
 * @param {Sheet} sheet - The Grievance Log sheet
 * @param {number} row - The row number
 * @returns {Object} Row data object
 */
function getGrievanceRowData(sheet, row) {
  const lastCol = GRIEVANCE_COLS.MESSAGE_ACKNOWLEDGED;
  const values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];

  return {
    grievanceId: values[GRIEVANCE_COLS.GRIEVANCE_ID - 1] || '',
    memberId: values[GRIEVANCE_COLS.MEMBER_ID - 1] || '',
    firstName: values[GRIEVANCE_COLS.FIRST_NAME - 1] || '',
    lastName: values[GRIEVANCE_COLS.LAST_NAME - 1] || '',
    memberEmail: values[GRIEVANCE_COLS.MEMBER_EMAIL - 1] || '',
    steward: values[GRIEVANCE_COLS.STEWARD - 1] || '',
    status: values[GRIEVANCE_COLS.STATUS - 1] || '',
    currentStep: values[GRIEVANCE_COLS.CURRENT_STEP - 1] || '',
    adminFlag: values[GRIEVANCE_COLS.ADMIN_FLAG - 1] || false,
    adminMessage: values[GRIEVANCE_COLS.ADMIN_MESSAGE - 1] || '',
    messageAcknowledged: values[GRIEVANCE_COLS.MESSAGE_ACKNOWLEDGED - 1] || false
  };
}

/**
 * Highlights a grievance row with the specified color
 * @param {Sheet} sheet - The Grievance Log sheet
 * @param {number} row - The row number
 * @param {string} color - The background color (hex)
 */
function highlightGrievanceRow(sheet, row, color) {
  const lastCol = sheet.getLastColumn();
  const range = sheet.getRange(row, 1, 1, lastCol);
  range.setBackground(color);
}

/**
 * Clears the highlight from a grievance row
 * @param {Sheet} sheet - The Grievance Log sheet
 * @param {number} row - The row number
 */
function clearGrievanceRowHighlight(sheet, row) {
  const lastCol = sheet.getLastColumn();
  const range = sheet.getRange(row, 1, 1, lastCol);
  range.setBackground(null);
}

/**
 * Moves a row to the top of the sheet (row 2, after header)
 * @param {Sheet} sheet - The Grievance Log sheet
 * @param {number} sourceRow - The row to move
 */
function moveRowToTop(sheet, sourceRow) {
  if (sourceRow <= 2) return; // Already at top or is header

  const lastCol = sheet.getLastColumn();

  // Get the row data
  const rowData = sheet.getRange(sourceRow, 1, 1, lastCol).getValues();
  const rowBackgrounds = sheet.getRange(sourceRow, 1, 1, lastCol).getBackgrounds();

  // Insert new row at position 2
  sheet.insertRowBefore(2);

  // Copy data to new row
  sheet.getRange(2, 1, 1, lastCol).setValues(rowData);
  sheet.getRange(2, 1, 1, lastCol).setBackgrounds(rowBackgrounds);

  // Delete the original row (now at sourceRow + 1 due to insertion)
  sheet.deleteRow(sourceRow + 1);
}

/* ==================== EMAIL NOTIFICATIONS ==================== */

/**
 * Sends email notification to steward and grievant
 * @param {Object} rowData - The grievance row data
 */
function sendAdminMessageNotification(rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const coordinatorEmail = Session.getActiveUser().getEmail();

  // Get steward email from Member Directory
  const stewardEmail = getStewardEmail(rowData.steward);

  // Build recipient list
  const recipients = [];
  if (stewardEmail) recipients.push(stewardEmail);
  if (rowData.memberEmail) recipients.push(rowData.memberEmail);

  if (recipients.length === 0) {
    Logger.log('No valid recipients for admin message notification');
    return;
  }

  const subject = `[Action Required] Grievance Update: ${rowData.grievanceId}`;

  const body = `
GRIEVANCE COORDINATOR UPDATE
============================

Grievance ID: ${rowData.grievanceId}
Grievant: ${rowData.firstName} ${rowData.lastName}
Current Status: ${rowData.status}
Current Step: ${rowData.currentStep}
Assigned Steward: ${rowData.steward}

MESSAGE FROM COORDINATOR:
-------------------------
${rowData.adminMessage}

-------------------------

Please review this update and acknowledge receipt in the Grievance Log.

This is an automated message from the 509 Dashboard.
Sent by: ${coordinatorEmail}
`;

  try {
    MailApp.sendEmail({
      to: recipients.join(','),
      subject: subject,
      body: body,
      replyTo: coordinatorEmail
    });
    Logger.log(`Admin message notification sent to: ${recipients.join(', ')}`);
  } catch (error) {
    Logger.log(`Failed to send admin message notification: ${error.message}`);
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'Email notification failed. Message logged but not sent.',
      'Email Error',
      5
    );
  }
}

/**
 * Gets the email address for a steward by name (Admin messages version)
 * Note: Canonical getStewardEmail() is in CoordinatorNotification.gs (with more error handling)
 * @param {string} stewardName - The steward's name
 * @returns {string|null} The steward's email or null if not found
 */
function getStewardEmailForAdmin(stewardName) {
  if (!stewardName) return null;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberDir) return null;

  const lastRow = memberDir.getLastRow();
  if (lastRow < 2) return null;

  // Get first name, last name, email, and is_steward columns
  const data = memberDir.getRange(2, 1, lastRow - 1, MEMBER_COLS.EMAIL).getValues();

  for (let i = 0; i < data.length; i++) {
    const firstName = data[i][MEMBER_COLS.FIRST_NAME - 1] || '';
    const lastName = data[i][MEMBER_COLS.LAST_NAME - 1] || '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName.toLowerCase() === stewardName.toLowerCase()) {
      return data[i][MEMBER_COLS.EMAIL - 1] || null;
    }
  }

  return null;
}

/* ==================== MESSAGE LOGGING ==================== */

/**
 * Logs an admin message to the Communications Log
 * @param {Object} rowData - The grievance row data
 * @param {string} action - The action type (SENT, ACKNOWLEDGED)
 */
function logAdminMessage(rowData, action) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName(SHEETS.COMMUNICATIONS_LOG);

  // Create log sheet if it doesn't exist
  if (!logSheet) {
    logSheet = createCommunicationsLogSheet(ss);
  }

  const timestamp = new Date();
  const sender = Session.getActiveUser().getEmail();
  const stewardEmail = getStewardEmail(rowData.steward) || 'N/A';

  const logEntry = [
    timestamp,                                    // Timestamp
    'ADMIN_MESSAGE',                              // Type
    rowData.grievanceId,                          // Grievance ID
    sender,                                       // From (Coordinator)
    `${rowData.steward}; ${rowData.firstName} ${rowData.lastName}`, // To (Recipients)
    stewardEmail + '; ' + (rowData.memberEmail || 'N/A'), // Recipient Emails
    rowData.adminMessage,                         // Message Content
    action,                                       // Action (SENT/ACKNOWLEDGED)
    action === 'ACKNOWLEDGED' ? timestamp : ''   // Acknowledged Date
  ];

  logSheet.appendRow(logEntry);
}

/**
 * Creates the Communications Log sheet with proper headers
 * @param {Spreadsheet} ss - The active spreadsheet
 * @returns {Sheet} The created sheet
 */
function createCommunicationsLogSheet(ss) {
  const sheet = ss.insertSheet(SHEETS.COMMUNICATIONS_LOG);

  const headers = [
    'Timestamp',
    'Type',
    'Grievance ID',
    'From',
    'To (Names)',
    'To (Emails)',
    'Message',
    'Status',
    'Acknowledged Date'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground(COLORS.HEADER_BLUE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(1);
  sheet.setColumnWidth(7, 400); // Message column wider

  return sheet;
}

/* ==================== ADMIN FUNCTIONS ==================== */

/**
 * Manually processes all pending admin messages (rows with flag but not acknowledged)
 * Useful for re-highlighting or fixing state
 */
function refreshAdminMessageHighlights() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Grievance Log sheet not found');
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const flagCol = GRIEVANCE_COLS.ADMIN_FLAG;
  const ackCol = GRIEVANCE_COLS.MESSAGE_ACKNOWLEDGED;

  const flagData = sheet.getRange(2, flagCol, lastRow - 1, 1).getValues();
  const ackData = sheet.getRange(2, ackCol, lastRow - 1, 1).getValues();

  let highlightedCount = 0;

  for (let i = 0; i < flagData.length; i++) {
    const row = i + 2;
    const hasFlag = flagData[i][0] === true;
    const isAcknowledged = ackData[i][0] === true;

    if (hasFlag && !isAcknowledged) {
      highlightGrievanceRow(sheet, row, ADMIN_MESSAGE_HIGHLIGHT_COLOR);
      highlightedCount++;
    } else {
      clearGrievanceRowHighlight(sheet, row);
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `Refreshed ${highlightedCount} pending admin messages`,
    'Highlights Refreshed',
    3
  );
}

/**
 * Shows a dialog to view the message trail for a specific grievance
 */
function showMessageTrail() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  // Check if we're on the Grievance Log
  if (sheet.getName() !== SHEETS.GRIEVANCE_LOG) {
    SpreadsheetApp.getUi().alert('Please select a row in the Grievance Log first');
    return;
  }

  const row = sheet.getActiveRange().getRow();
  if (row < 2) {
    SpreadsheetApp.getUi().alert('Please select a grievance row (not the header)');
    return;
  }

  const grievanceId = sheet.getRange(row, GRIEVANCE_COLS.GRIEVANCE_ID).getValue();
  if (!grievanceId) {
    SpreadsheetApp.getUi().alert('No grievance ID found in selected row');
    return;
  }

  // Get messages from Communications Log
  const logSheet = ss.getSheetByName(SHEETS.COMMUNICATIONS_LOG);
  if (!logSheet) {
    SpreadsheetApp.getUi().alert('No message history found. Communications Log does not exist.');
    return;
  }

  const lastRow = logSheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No messages found in Communications Log');
    return;
  }

  const data = logSheet.getRange(2, 1, lastRow - 1, 9).getValues();
  const messages = data.filter(function(row) {
    // Use COMM_LOG_COLS constants for array indices (subtract 1 for 0-based array)
    return row[COMM_LOG_COLS.GRIEVANCE_ID - 1] === grievanceId && row[COMM_LOG_COLS.TYPE - 1] === 'ADMIN_MESSAGE';
  });

  if (messages.length === 0) {
    SpreadsheetApp.getUi().alert(`No messages found for ${grievanceId}`);
    return;
  }

  // Build HTML for dialog
  let html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 10px; }
      h2 { color: #1a73e8; margin-bottom: 15px; }
      .message { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
      .message.sent { background: #fff3cd; }
      .message.acknowledged { background: #d4edda; }
      .meta { font-size: 12px; color: #666; margin-bottom: 5px; }
      .content { margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; }
      .status { font-weight: bold; }
      .status.sent { color: #856404; }
      .status.acknowledged { color: #155724; }
    </style>
    <h2>Message Trail: ${grievanceId}</h2>
  `;

  messages.forEach(function(msg) {
    const timestamp = msg[0] ? Utilities.formatDate(new Date(msg[0]), Session.getScriptTimeZone(), 'MMM dd, yyyy HH:mm') : 'N/A';
    const from = msg[3] || 'Unknown';
    const to = msg[4] || 'Unknown';
    const message = msg[6] || '';
    const status = msg[7] || 'UNKNOWN';
    const ackDate = msg[8] ? Utilities.formatDate(new Date(msg[8]), Session.getScriptTimeZone(), 'MMM dd, yyyy HH:mm') : '';

    const statusClass = status.toLowerCase();

    html += `
      <div class="message ${statusClass}">
        <div class="meta">
          <strong>Date:</strong> ${timestamp} |
          <strong>From:</strong> ${from} |
          <strong>To:</strong> ${to}
        </div>
        <div class="meta">
          <span class="status ${statusClass}">${status}</span>
          ${ackDate ? ' - Acknowledged: ' + ackDate : ''}
        </div>
        <div class="content">${message.replace(/\n/g, '<br>')}</div>
      </div>
    `;
  });

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(400);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Message Trail');
}

/**
 * Sets up the admin message columns with proper formatting
 * Called during initial setup or column restructure
 */
function setupAdminMessageColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Grievance Log sheet not found');
    return;
  }

  const lastRow = sheet.getLastRow();

  // Set headers
  sheet.getRange(1, GRIEVANCE_COLS.ADMIN_FLAG).setValue('Admin Flag');
  sheet.getRange(1, GRIEVANCE_COLS.ADMIN_MESSAGE).setValue('Admin Message');
  sheet.getRange(1, GRIEVANCE_COLS.MESSAGE_ACKNOWLEDGED).setValue('Acknowledged');

  // Format header row for these columns
  const headerRange = sheet.getRange(1, GRIEVANCE_COLS.ADMIN_FLAG, 1, 3);
  headerRange.setBackground(COLORS.ACCENT_ORANGE);
  headerRange.setFontColor(COLORS.WHITE);
  headerRange.setFontWeight('bold');

  // Set column widths
  sheet.setColumnWidth(GRIEVANCE_COLS.ADMIN_FLAG, 80);
  sheet.setColumnWidth(GRIEVANCE_COLS.ADMIN_MESSAGE, 300);
  sheet.setColumnWidth(GRIEVANCE_COLS.MESSAGE_ACKNOWLEDGED, 100);

  // Add checkboxes for flag and acknowledged columns (if there's data)
  if (lastRow > 1) {
    sheet.getRange(2, GRIEVANCE_COLS.ADMIN_FLAG, lastRow - 1, 1).insertCheckboxes();
    sheet.getRange(2, GRIEVANCE_COLS.MESSAGE_ACKNOWLEDGED, lastRow - 1, 1).insertCheckboxes();
  }

  // Add data validation for message column (optional - text)
  const messageRange = sheet.getRange(2, GRIEVANCE_COLS.ADMIN_MESSAGE, lastRow > 1 ? lastRow - 1 : 1, 1);
  messageRange.setWrap(true);

  // Hide columns by default
  sheet.hideColumns(GRIEVANCE_COLS.ADMIN_FLAG, 3);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Admin message columns set up and hidden. Use menu to toggle visibility.',
    'Setup Complete',
    5
  );
}

/**
 * Installs the onEdit trigger for admin message handling
 */
function installAdminMessageTrigger() {
  // Check if trigger already exists
  const triggers = ScriptApp.getProjectTriggers();
  const existingTrigger = triggers.find(function(t) {
    return t.getHandlerFunction() === 'onGrievanceAdminEdit';
  });

  if (existingTrigger) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Admin message trigger already installed', 'Info', 3);
    return;
  }

  // Create new trigger
  ScriptApp.newTrigger('onGrievanceAdminEdit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();

  SpreadsheetApp.getActiveSpreadsheet().toast('Admin message trigger installed', 'Success', 3);
}
