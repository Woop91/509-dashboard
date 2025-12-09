/**
 * COORDINATOR NOTIFICATION SYSTEM
 * Feature: Checkbox-based row highlighting and email notifications
 *
 * When a coordinator checks the "Coordinator Notified" checkbox (column AC):
 * 1. Highlights the entire grievance row
 * 2. Sends email to member and assigned steward with coordinator's message
 * 3. Row remains highlighted until checkbox is manually unchecked
 */

// ===========================
// INSTALLATION TRIGGER
// ===========================

/**
 * Sets up the onChange trigger for coordinator notifications
 * Run this once to install the trigger
 */
function setupCoordinatorNotificationTrigger() {
  // Remove existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onGrievanceEdit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new onChange trigger
  ScriptApp.newTrigger('onGrievanceEdit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();

  SpreadsheetApp.getUi().alert('Success',
    'Coordinator notification trigger installed!\n\n' +
    'The system will now:\n' +
    '• Monitor checkbox changes in Grievance Log\n' +
    '• Highlight rows when coordinator notified\n' +
    '• Send emails to member and steward\n' +
    '• Remove highlighting when unchecked',
    SpreadsheetApp.getUi().ButtonSet.OK);

  Logger.log('Coordinator notification trigger installed successfully');
}

// ===========================
// TRIGGER FUNCTION
// ===========================

/**
 * Triggered on any edit to the spreadsheet
 * Monitors the Coordinator Notified checkbox column
 */
function onGrievanceEdit(e) {
  try {
    // Only process if we have event data
    if (!e) return;

    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();

    // Only process Grievance Log edits
    if (sheetName !== 'Grievance Log') return;

    const row = e.range.getRow();
    const col = e.range.getColumn();

    // Only process if editing the Coordinator Notified column (AC = column 29)
    if (col !== GRIEVANCE_COLS.MESSAGE_ALERT) return;

    // Skip header row
    if (row === 1) return;

    const isChecked = e.value === 'TRUE' || e.value === true || e.value === 'Yes' || e.value === '✓';

    if (isChecked) {
      // Checkbox was checked - highlight and send notifications
      handleCoordinatorNotification(sheet, row);
    } else {
      // Checkbox was unchecked - remove highlighting
      removeRowHighlight(sheet, row);
    }

  } catch (error) {
    Logger.log(`Error in onGrievanceEdit: ${error.message}`);
    // Don't show alert to user - silent failure to avoid interrupting workflow
  }
}

// ===========================
// NOTIFICATION HANDLER
// ===========================

/**
 * Handles coordinator notification: highlights row and sends emails
 */
function handleCoordinatorNotification(sheet, row) {
  try {
    // Get grievance data dynamically based on actual column count
    const data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

    const grievanceId = data[GRIEVANCE_COLS.GRIEVANCE_ID - 1];
    const memberId = data[GRIEVANCE_COLS.MEMBER_ID - 1];
    const firstName = data[GRIEVANCE_COLS.FIRST_NAME - 1];
    const lastName = data[GRIEVANCE_COLS.LAST_NAME - 1];
    const memberEmail = data[GRIEVANCE_COLS.MEMBER_EMAIL - 1];
    const issueCategory = data[GRIEVANCE_COLS.ISSUE_CATEGORY - 1];
    const stewardName = data[GRIEVANCE_COLS.STEWARD - 1];
    const coordinatorMessage = data[GRIEVANCE_COLS.COORDINATOR_MESSAGE - 1];
    const status = data[GRIEVANCE_COLS.STATUS - 1];

    // Get steward email from Member Directory
    const stewardEmail = getStewardEmail(stewardName);

    // Highlight the row
    highlightRow(sheet, row);

    // Send email notifications if message exists
    if (coordinatorMessage && coordinatorMessage.trim() !== '') {
      sendCoordinatorEmails(
        grievanceId,
        firstName,
        lastName,
        memberEmail,
        stewardName,
        stewardEmail,
        issueCategory,
        coordinatorMessage,
        status
      );
    }

    // Log the notification
    if (typeof logDataModification === 'function') {
      logDataModification(
        'COORDINATOR_NOTIFICATION',
        'Grievance Log',
        grievanceId,
        'Coordinator Notified',
        'FALSE',
        'TRUE'
      );
    }

    Logger.log(`Coordinator notification sent for grievance ${grievanceId}`);

  } catch (error) {
    Logger.log(`Error in handleCoordinatorNotification: ${error.message}`);
    SpreadsheetApp.getUi().alert('Error',
      `Failed to send coordinator notification: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ===========================
// ROW HIGHLIGHTING
// ===========================

/**
 * Highlights a grievance row in yellow to indicate coordinator notification
 */
function highlightRow(sheet, row) {
  const numColumns = sheet.getLastColumn();
  const range = sheet.getRange(row, 1, 1, numColumns);

  // Set background to light yellow
  range.setBackground('#FEF3C7');

  // Set left border to thick orange for visibility
  range.setBorder(
    true, true, true, true, false, false,
    '#F97316', SpreadsheetApp.BorderStyle.SOLID_MEDIUM
  );

  Logger.log(`Row ${row} highlighted for coordinator notification`);
}

/**
 * Removes highlighting and records steward acknowledgment
 * When a steward unchecks the box, this logs their acknowledgment
 */
function removeRowHighlight(sheet, row) {
  const numColumns = sheet.getLastColumn();
  const range = sheet.getRange(row, 1, 1, numColumns);

  // Reset to default white background
  range.setBackground('#FFFFFF');

  // Remove borders
  range.setBorder(false, false, false, false, false, false);

  // Get current user (the steward who is acknowledging)
  const acknowledgedBy = Session.getActiveUser().getEmail();
  const acknowledgedDate = new Date();

  // Get grievance details for logging
  const grievanceId = sheet.getRange(row, GRIEVANCE_COLS.GRIEVANCE_ID).getValue();
  const coordinatorMessage = sheet.getRange(row, GRIEVANCE_COLS.COORDINATOR_MESSAGE).getValue();

  // Record who acknowledged and when
  sheet.getRange(row, GRIEVANCE_COLS.ACKNOWLEDGED_BY).setValue(acknowledgedBy);
  sheet.getRange(row, GRIEVANCE_COLS.ACKNOWLEDGED_DATE).setValue(acknowledgedDate);

  // NOTE: We DO NOT clear the Coordinator Message - it stays for record keeping

  Logger.log(`Row ${row} acknowledged by ${acknowledgedBy} at ${acknowledgedDate}`);

  // Log the acknowledgment to Audit_Log
  if (typeof logDataModification === 'function') {
    logDataModification(
      'STEWARD_ACKNOWLEDGED',
      'Grievance Log',
      grievanceId,
      'Coordinator Message Acknowledged',
      coordinatorMessage || 'N/A',
      `Acknowledged by ${acknowledgedBy} at ${acknowledgedDate.toLocaleString()}`
    );
  }
}

// ===========================
// EMAIL NOTIFICATIONS
// ===========================

/**
 * Sends email notifications to member and steward
 */
function sendCoordinatorEmails(grievanceId, firstName, lastName, memberEmail, stewardName, stewardEmail, issueCategory, message, status) {
  const coordinatorName = Session.getActiveUser().getEmail().split('@')[0]; // Extract name from email
  const subject = `Grievance Update: ${grievanceId}`;

  // Email body for member
  const memberBody = `
Dear ${firstName} ${lastName},

This is an update regarding your grievance ${grievanceId} (${issueCategory}).

**Current Status:** ${status}

**Message from Grievance Coordinator:**
${message}

Your assigned steward, ${stewardName}, has also been notified of this update.

If you have any questions or concerns, please contact your steward or the grievance coordinator.

Best regards,
SEIU Local 509 Grievance Coordinator

---
This is an automated notification from the 509 Dashboard system.
  `.trim();

  // Email body for steward
  const stewardBody = `
Dear ${stewardName},

This is an update regarding grievance ${grievanceId} for member ${firstName} ${lastName}.

**Grievance Details:**
- **ID:** ${grievanceId}
- **Member:** ${firstName} ${lastName}
- **Issue:** ${issueCategory}
- **Status:** ${status}

**Message from Grievance Coordinator:**
${message}

The member has also been notified of this update.

Please follow up as needed.

Best regards,
SEIU Local 509 Grievance Coordinator

---
This is an automated notification from the 509 Dashboard system.
  `.trim();

  // Send email to member
  if (memberEmail && isValidEmail(memberEmail)) {
    try {
      MailApp.sendEmail({
        to: memberEmail,
        subject: subject,
        body: memberBody,
        noReply: true
      });
      Logger.log(`Email sent to member: ${memberEmail}`);
    } catch (error) {
      Logger.log(`Failed to send email to member ${memberEmail}: ${error.message}`);
    }
  } else {
    Logger.log(`Invalid or missing member email: ${memberEmail}`);
  }

  // Send email to steward
  if (stewardEmail && isValidEmail(stewardEmail)) {
    try {
      MailApp.sendEmail({
        to: stewardEmail,
        subject: subject,
        body: stewardBody,
        noReply: true
      });
      Logger.log(`Email sent to steward: ${stewardEmail}`);
    } catch (error) {
      Logger.log(`Failed to send email to steward ${stewardEmail}: ${error.message}`);
    }
  } else {
    Logger.log(`Invalid or missing steward email: ${stewardEmail}`);
  }
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Gets steward email from Member Directory
 */
function getStewardEmail(stewardName) {
  if (!stewardName || stewardName.trim() === '') {
    return null;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const memberDir = ss.getSheetByName('Member Directory');

    if (!memberDir) {
      Logger.log('Member Directory sheet not found');
      return null;
    }

    const data = memberDir.getDataRange().getValues();
    const headers = data[0];
    const nameColIndex = headers.indexOf('First Name');
    const lastNameColIndex = headers.indexOf('Last Name');
    const emailColIndex = headers.indexOf('Email Address');
    const isStewardColIndex = headers.indexOf('Is Steward (Y/N)');

    // Search for steward by name
    const nameParts = stewardName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowFirstName = row[nameColIndex];
      const rowLastName = row[lastNameColIndex];
      const isSteward = row[isStewardColIndex];

      if (isSteward === 'Yes' || isSteward === 'Y') {
        if (rowFirstName === firstName && (lastName === '' || rowLastName === lastName)) {
          return row[emailColIndex];
        }
      }
    }

    Logger.log(`Steward email not found for: ${stewardName}`);
    return null;

  } catch (error) {
    Logger.log(`Error getting steward email: ${error.message}`);
    return null;
  }
}

/**
 * Validates email address format (coordinator notifications version)
 * Note: Canonical isValidEmail() is in SecurityUtils.gs
 */
function isValidEmailForCoordinator(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// ===========================
// MANUAL NOTIFICATION DIALOG
// ===========================

/**
 * Shows dialog for coordinator to add message and notify
 * Can be called from menu or directly on a row
 */
function showCoordinatorMessageDialog() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  // Check if we're on Grievance Log
  if (sheet.getName() !== 'Grievance Log') {
    ui.alert('Error', 'Please select a row in the Grievance Log sheet first.', ui.ButtonSet.OK);
    return;
  }

  const activeRow = sheet.getActiveRange().getRow();

  // Skip header row
  if (activeRow === 1) {
    ui.alert('Error', 'Please select a grievance row (not the header).', ui.ButtonSet.OK);
    return;
  }

  const grievanceId = sheet.getRange(activeRow, GRIEVANCE_COLS.GRIEVANCE_ID).getValue();
  const memberName = sheet.getRange(activeRow, GRIEVANCE_COLS.FIRST_NAME).getValue() + ' ' +
                     sheet.getRange(activeRow, GRIEVANCE_COLS.LAST_NAME).getValue();

  const response = ui.prompt(
    'Coordinator Message',
    `Enter message for grievance ${grievanceId} (${memberName}):\n\n` +
    'This will be sent to the member and assigned steward.',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const message = response.getResponseText().trim();

    if (message === '') {
      ui.alert('Error', 'Message cannot be empty.', ui.ButtonSet.OK);
      return;
    }

    // Set the message
    sheet.getRange(activeRow, GRIEVANCE_COLS.COORDINATOR_MESSAGE).setValue(message);

    // Check the checkbox to trigger notification
    sheet.getRange(activeRow, GRIEVANCE_COLS.MESSAGE_ALERT).setValue(true);

    ui.alert('Success',
      'Coordinator message saved and notifications sent!\n\n' +
      'The row will remain highlighted until you uncheck the checkbox.',
      ui.ButtonSet.OK);
  }
}

/**
 * Batch notification for multiple grievances
 */
function showBatchCoordinatorNotification() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Grievance Log');

  if (!sheet) {
    ui.alert('Error', 'Grievance Log sheet not found.', ui.ButtonSet.OK);
    return;
  }

  const response = ui.prompt(
    'Batch Coordinator Notification',
    'Enter message to send for ALL checked grievances:\n\n' +
    '(Only grievances with the checkbox already checked will receive this message)',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const message = response.getResponseText().trim();

  if (message === '') {
    ui.alert('Error', 'Message cannot be empty.', ui.ButtonSet.OK);
    return;
  }

  // Find all checked rows
  const data = sheet.getDataRange().getValues();
  let count = 0;

  for (let i = 1; i < data.length; i++) { // Skip header
    const row = i + 1;
    const isChecked = data[i][GRIEVANCE_COLS.MESSAGE_ALERT - 1];

    if (isChecked === true || isChecked === 'TRUE' || isChecked === 'Yes' || isChecked === '✓') {
      // Update message
      sheet.getRange(row, GRIEVANCE_COLS.COORDINATOR_MESSAGE).setValue(message);

      // Trigger notification by re-checking
      handleCoordinatorNotification(sheet, row);
      count++;
    }
  }

  ui.alert('Batch Notification Complete',
    `Sent coordinator message to ${count} grievance(s).`,
    ui.ButtonSet.OK);
}

/**
 * Clear all coordinator notifications (admin only)
 */
function clearAllCoordinatorNotifications() {
  const ui = SpreadsheetApp.getUi();

  // Confirm action
  const response = ui.alert(
    'Clear All Notifications',
    'This will:\n' +
    '• Uncheck all coordinator notification checkboxes\n' +
    '• Remove all row highlighting\n' +
    '• Keep coordinator messages intact\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Grievance Log');

  if (!sheet) {
    ui.alert('Error', 'Grievance Log sheet not found.', ui.ButtonSet.OK);
    return;
  }

  const lastRow = sheet.getLastRow();

  // Clear all checkboxes and highlighting (skip header)
  for (let row = 2; row <= lastRow; row++) {
    sheet.getRange(row, GRIEVANCE_COLS.MESSAGE_ALERT).setValue(false);
    removeRowHighlight(sheet, row);
  }

  ui.alert('Success', `Cleared all coordinator notifications (${lastRow - 1} rows processed).`, ui.ButtonSet.OK);
}
