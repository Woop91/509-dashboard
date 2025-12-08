/**
 * ------------------------------------------------------------------------====
 * AUTOMATED DEADLINE NOTIFICATIONS
 * ------------------------------------------------------------------------====
 *
 * Automated email alerts for approaching grievance deadlines
 * Features:
 * - Daily checks at 8 AM
 * - Email stewards 7 days before deadline
 * - Escalate to managers 3 days before
 * - Mark overdue grievances
 * - Customizable notification templates
 */

/**
 * Sets up time-driven trigger for daily deadline checks
 */
function setupDailyDeadlineNotifications() {
  // Delete existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'checkDeadlinesAndNotify') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new trigger for 8 AM daily
  ScriptApp.newTrigger('checkDeadlinesAndNotify')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Daily deadline notifications enabled (8 AM)',
    'Automation Active',
    5
  );
}

/**
 * Removes the daily deadline notification trigger
 */
function disableDailyDeadlineNotifications() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;

  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'checkDeadlinesAndNotify') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `🔕 Removed ${removed} deadline notification trigger(s)`,
    'Automation Disabled',
    5
  );
}

/**
 * Main function that checks deadlines and sends notifications
 * Runs daily at 8 AM via trigger
 */
function checkDeadlinesAndNotify() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet) {
    Logger.log('Grievance Log sheet not found');
    return;
  }

  const lastRow = grievanceSheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('No grievances to check');
    return;
  }

  // Get all grievance data - read all columns up to RESOLUTION (last column)
  const data = grievanceSheet.getRange(2, 1, lastRow - 1, GRIEVANCE_COLS.RESOLUTION).getValues();

  const notifications = {
    overdue: [],
    urgent: [],      // 3 days or less
    upcoming: []     // 7 days or less
  };

  // Categorize grievances by deadline urgency
  data.forEach(function(row, index) {
    const grievanceId = row[GRIEVANCE_COLS.GRIEVANCE_ID - 1];
    const memberFirstName = row[GRIEVANCE_COLS.FIRST_NAME - 1];
    const memberLastName = row[GRIEVANCE_COLS.LAST_NAME - 1];
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    const issueType = row[GRIEVANCE_COLS.CURRENT_STEP - 1];
    const nextActionDue = row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1];
    const daysToDeadline = row[GRIEVANCE_COLS.DAYS_TO_DEADLINE - 1];
    const steward = row[GRIEVANCE_COLS.STEWARD - 1];
    const manager = row[GRIEVANCE_COLS.STEP2_APPEAL_DUE - 1];

    // Only check open grievances with deadlines
    if (status !== 'Open' || !nextActionDue || !steward) {
      return;
    }

    const grievanceInfo = {
      id: grievanceId,
      memberName: `${memberFirstName} ${memberLastName}`,
      issueType: issueType,
      deadline: nextActionDue,
      daysRemaining: daysToDeadline,
      steward: steward,
      manager: manager || '',
      row: index + 2
    };

    if (daysToDeadline < 0) {
      notifications.overdue.push(grievanceInfo);
    } else if (daysToDeadline <= 3) {
      notifications.urgent.push(grievanceInfo);
    } else if (daysToDeadline <= 7) {
      notifications.upcoming.push(grievanceInfo);
    }
  });

  // Send notifications
  let emailsSent = 0;

  // Send overdue notifications
  notifications.overdue.forEach(function(grievance) {
    sendDeadlineNotification(grievance, 'OVERDUE');
    emailsSent++;
  });

  // Send urgent notifications (escalate to manager)
  notifications.urgent.forEach(function(grievance) {
    sendDeadlineNotification(grievance, 'URGENT');
    emailsSent++;
  });

  // Send upcoming notifications
  notifications.upcoming.forEach(function(grievance) {
    sendDeadlineNotification(grievance, 'UPCOMING');
    emailsSent++;
  });

  // Log summary
  Logger.log(`Deadline check complete: ${emailsSent} notifications sent`);
  Logger.log(`  Overdue: ${notifications.overdue.length}`);
  Logger.log(`  Urgent: ${notifications.urgent.length}`);
  Logger.log(`  Upcoming: ${notifications.upcoming.length}`);
}

/**
 * Sends email notification for a grievance deadline
 * @param {Object} grievance - Grievance information
 * @param {string} priority - OVERDUE, URGENT, or UPCOMING
 */
function sendDeadlineNotification(grievance, priority) {
  try {
    const recipients = getNotificationRecipients(grievance, priority);

    if (recipients.length === 0) {
      Logger.log(`No valid recipients for ${grievance.id}`);
      return;
    }

    const subject = createEmailSubject(grievance, priority);
    const body = createEmailBody(grievance, priority);

    // Send email
    MailApp.sendEmail({
      to: recipients.join(','),
      subject: subject,
      body: body,
      name: 'SEIU Local 509 Dashboard'
    });

    Logger.log(`Sent ${priority} notification for ${grievance.id} to ${recipients.join(', ')}`);

  } catch (error) {
    Logger.log(`Error sending notification for ${grievance.id}: ${error.message}`);
  }
}

/**
 * Determines who should receive the notification
 * @param {Object} grievance - Grievance information
 * @param {string} priority - OVERDUE, URGENT, or UPCOMING
 * @returns {Array} Array of email addresses
 */
function getNotificationRecipients(grievance, priority) {
  const recipients = [];

  // Always notify the steward
  if (grievance.steward && isValidEmail(grievance.steward)) {
    recipients.push(grievance.steward);
  }

  // Escalate to manager for urgent and overdue
  if ((priority === 'URGENT' || priority === 'OVERDUE') &&
      grievance.manager &&
      isValidEmail(grievance.manager)) {
    recipients.push(grievance.manager);
  }

  return recipients;
}

/**
 * Creates email subject line
 * @param {Object} grievance - Grievance information
 * @param {string} priority - OVERDUE, URGENT, or UPCOMING
 * @returns {string} Email subject
 */
function createEmailSubject(grievance, priority) {
  const prefix = {
    'OVERDUE': '🚨 OVERDUE',
    'URGENT': '⚠️ URGENT',
    'UPCOMING': '📅 Deadline Reminder'
  }[priority];

  return `${prefix}: Grievance ${grievance.id} - ${grievance.memberName}`;
}

/**
 * Creates email body content
 * @param {Object} grievance - Grievance information
 * @param {string} priority - OVERDUE, URGENT, or UPCOMING
 * @returns {string} Email body
 */
function createEmailBody(grievance, priority) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const spreadsheetUrl = ss.getUrl();

  let urgencyMessage = '';

  if (priority === 'OVERDUE') {
    urgencyMessage = `⚠️ THIS GRIEVANCE IS OVERDUE BY ${Math.abs(grievance.daysRemaining)} DAY(S)!\n\nImmediate action is required.`;
  } else if (priority === 'URGENT') {
    urgencyMessage = `⏰ This grievance deadline is in ${grievance.daysRemaining} day(s).\n\nPlease prioritize this case.`;
  } else {
    urgencyMessage = `This is a reminder that a grievance deadline is approaching in ${grievance.daysRemaining} day(s).`;
  }

  return `
SEIU Local 509 - Grievance Deadline Notification

${urgencyMessage}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Grievance Details:

  • Grievance ID: ${grievance.id}
  • Member: ${grievance.memberName}
  • Issue Type: ${grievance.issueType}
  • Assigned Steward: ${grievance.steward}
  • Deadline: ${Utilities.formatDate(new Date(grievance.deadline), Session.getScriptTimeZone(), 'MMMM dd, yyyy')}
  • Days Remaining: ${grievance.daysRemaining}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Action Required:

${priority === 'OVERDUE'
  ? '1. Review the grievance immediately\n2. Take necessary action today\n3. Update the status in the dashboard\n4. Notify leadership if needed'
  : priority === 'URGENT'
  ? '1. Review the grievance\n2. Complete any pending actions\n3. Prepare for next steps\n4. Update the dashboard'
  : '1. Review the grievance timeline\n2. Plan your next actions\n3. Gather any needed documentation\n4. Update progress in the dashboard'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View in Dashboard:
${spreadsheetUrl}

Need Help?
Contact your union representative or refer to the Grievance Workflow guide.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated notification from the SEIU Local 509 Dashboard.
To adjust notification settings, contact your system administrator.
`;
}

/**
 * Validates email address format (automated notifications version)
 * Note: Canonical isValidEmail() is in SecurityUtils.gs
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email
 */
function isValidEmailForNotifications(email) {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.toString().trim());
}

/**
 * Manual test function to check notifications without waiting for trigger
 */
function testDeadlineNotifications() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    '🧪 Test Deadline Notifications',
    'This will run the deadline check immediately and send real emails.\n\n' +
    'Emails will be sent to stewards with approaching deadlines.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('🧪 Running deadline check...', 'Testing', -1);

  try {
    checkDeadlinesAndNotify();

    ui.alert(
      '✅ Test Complete',
      'Deadline check completed successfully.\n\n' +
      'Check the execution log (View > Logs) for details on notifications sent.',
      ui.ButtonSet.OK
    );
  } catch (error) {
    ui.alert('❌ Error: ' + error.message);
  }
}

/**
 * Shows notification settings dialog
 */
function showNotificationSettings() {
  const triggers = ScriptApp.getProjectTriggers();
  const isEnabled = triggers.some(function(t) { return t.getHandlerFunction() === 'checkDeadlinesAndNotify'; });

  const html = HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body {
      font-family: 'Roboto', Arial, sans-serif;
      padding: 20px;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h2 {
      color: #1a73e8;
      margin-top: 0;
      border-bottom: 3px solid #1a73e8;
      padding-bottom: 10px;
    }
    .status {
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
    }
    .status.enabled {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .status.disabled {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .settings {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .settings h3 {
      margin-top: 0;
      color: #333;
    }
    .settings ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .settings li {
      margin: 8px 0;
      color: #666;
    }
    button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
      margin: 10px 5px 0 0;
    }
    button:hover {
      background: #1557b0;
    }
    button.danger {
      background: #dc3545;
    }
    button.danger:hover {
      background: #c82333;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>📬 Notification Settings</h2>

    <div class="status ${isEnabled ? 'enabled' : 'disabled'}">
      ${isEnabled ? '✅ Automated notifications are ENABLED' : '🔕 Automated notifications are DISABLED'}
    </div>

    <div class="settings">
      <h3>Current Configuration</h3>
      <ul>
        <li><strong>Schedule:</strong> Daily at 8:00 AM</li>
        <li><strong>7-Day Warning:</strong> Email sent to assigned steward</li>
        <li><strong>3-Day Warning:</strong> Email sent to steward + manager (escalation)</li>
        <li><strong>Overdue:</strong> Immediate notification to steward + manager</li>
      </ul>
    </div>

    <div class="settings">
      <h3>Email Template Includes</h3>
      <ul>
        <li>Grievance ID and member name</li>
        <li>Days remaining until deadline</li>
        <li>Direct link to dashboard</li>
        <li>Action items based on urgency</li>
      </ul>
    </div>

    <button onclick="google.script.run.withSuccessHandler(function() { google.script.host.close(); }).setupDailyDeadlineNotifications()">
      ${isEnabled ? '🔄 Refresh Trigger' : '✅ Enable Notifications'}
    </button>

    ${isEnabled ? '<button class="danger" onclick="google.script.run.withSuccessHandler(function() { google.script.host.close(); }).disableDailyDeadlineNotifications()">🔕 Disable Notifications</button>' : ''}

    <button onclick="google.script.run.withSuccessHandler(function() { google.script.host.close(); }).testDeadlineNotifications()">
      🧪 Test Now
    </button>
  </div>
</body>
</html>
  `)
    .setWidth(600)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, '📬 Notification Settings');
}
