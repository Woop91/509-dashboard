/**
 * ------------------------------------------------------------------------====
 * GMAIL INTEGRATION - Secure Email Communications
 * ------------------------------------------------------------------------====
 *
 * Send and receive grievance-related emails via Gmail with security controls.
 *
 * Features:
 * - Send PDFs directly from dashboard
 * - Email templates library
 * - Track communications
 * - Auto-log sent emails
 * - Compose emails with templates
 *
 * Security Features (v2.0):
 * - Role-based access control (Steward+ only)
 * - Email validation and whitelist checking
 * - Rate limiting to prevent spam
 * - HTML sanitization to prevent XSS
 * - Audit logging of all email sends
 * - Input validation
 *
 * @module GmailIntegration
 * @version 2.0.0
 * @author SEIU Local 509 Tech Team
 * ------------------------------------------------------------------------====
 */

/**
 * Column positions for the simplified Communications Log created by this module (1-indexed for spreadsheet, 0-indexed for arrays)
 *
 * NOTE: This is a simplified 5-column structure used by GmailIntegration.gs
 * It differs from the main COMM_LOG_COLS (7 columns) defined in Constants.gs
 * which is designed for a more comprehensive communication tracking system.
 *
 * This simplified structure focuses on basic email logging within grievances.
 *
 * @const {Object}
 */
const GMAIL_COMM_LOG_COLS = {
  TIMESTAMP: 0,      // Column A - When the communication occurred
  GRIEVANCE_ID: 1,   // Column B - Related grievance ID
  TYPE: 2,           // Column C - Communication type (e.g., "Email Sent")
  USER: 3,           // Column D - User who sent/logged the communication
  DETAILS: 4         // Column E - Full communication details/message body
};

/**
 * Shows email composition dialog for a grievance
 * Requires STEWARD role or higher
 *
 * @param {string} grievanceId - Optional grievance ID to pre-populate
 * @throws {Error} If user doesn't have STEWARD role
 */
function composeGrievanceEmail(grievanceId) {
  // Security: Require steward role
  try {
    requireRole('STEWARD', 'Compose Email');
  } catch (e) {
    showAccessDeniedDialog('Compose Email', 'STEWARD');
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  let grievanceData = null;

  if (grievanceId) {
    const lastRow = grievanceSheet.getLastRow();
    const data = grievanceSheet.getRange(2, 1, lastRow - 1, GRIEVANCE_COLS.MEMBER_EMAIL).getValues();

    for (let i = 0; i < data.length; i++) {
      if (data[i][GRIEVANCE_COLS.GRIEVANCE_ID - 1] === grievanceId) {
        grievanceData = {
          id: data[i][GRIEVANCE_COLS.GRIEVANCE_ID - 1],
          memberName: `${data[i][GRIEVANCE_COLS.FIRST_NAME - 1]} ${data[i][GRIEVANCE_COLS.LAST_NAME - 1]}`,
          memberEmail: data[i][GRIEVANCE_COLS.MEMBER_EMAIL - 1] || '',
          steward: data[i][GRIEVANCE_COLS.STEWARD - 1] || '',
          issueType: data[i][GRIEVANCE_COLS.ISSUE_CATEGORY - 1] || '',
          status: data[i][GRIEVANCE_COLS.STATUS - 1] || ''
        };
        break;
      }
    }
  }

  const html = createEmailComposerHTML(grievanceData);
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(800)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📧 Compose Email');
}

/**
 * Creates HTML for email composer with sanitized data
 *
 * @param {Object} grievanceData - Grievance information (will be sanitized)
 * @returns {string} HTML content with sanitized values
 */
function createEmailComposerHTML(grievanceData) {
  const templates = getEmailTemplates();

  // Security: Sanitize all grievance data before embedding in HTML
  const sanitizedGrievanceData = grievanceData ? sanitizeObject(grievanceData) : null;

  return `
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
    .form-group {
      margin: 15px 0;
    }
    label {
      display: block;
      font-weight: bold;
      margin-bottom: 5px;
      color: #333;
    }
    input[type="text"],
    input[type="email"],
    textarea,
    select {
      width: 100%;
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    input:focus,
    textarea:focus,
    select:focus {
      outline: none;
      border-color: #1a73e8;
    }
    textarea {
      min-height: 200px;
      font-family: Arial, sans-serif;
      resize: vertical;
    }
    .button-group {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }
    button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
      flex: 1;
    }
    button:hover {
      background: #1557b0;
    }
    button.secondary {
      background: #6c757d;
    }
    button.secondary:hover {
      background: #5a6268;
    }
    .template-selector {
      margin: 10px 0;
    }
    .info-box {
      background: #e8f0fe;
      padding: 12px;
      border-radius: 4px;
      margin: 15px 0;
      border-left: 4px solid #1a73e8;
    }
    .checkbox-group {
      margin: 10px 0;
    }
    .checkbox-group label {
      display: inline;
      font-weight: normal;
      margin-left: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>📧 Compose Email</h2>

    ${sanitizedGrievanceData ? `
    <div class="info-box">
      <strong>Grievance:</strong> ${sanitizedGrievanceData.id} - ${sanitizedGrievanceData.memberName}<br>
      <strong>Status:</strong> ${sanitizedGrievanceData.status} | <strong>Issue:</strong> ${sanitizedGrievanceData.issueType}
    </div>
    ` : ''}

    <div class="form-group template-selector">
      <label>Template (optional):</label>
      <select id="templateSelect" onchange="loadTemplate()">
        <option value="">-- Select a template --</option>
        ${templates.map(function(t) { return `<option value="${sanitizeHTML(t.id)}">${sanitizeHTML(t.name)}</option>`; }).join('')}
      </select>
    </div>

    <div class="form-group">
      <label>To:</label>
      <input type="email" id="toEmail" value="${sanitizedGrievanceData ? sanitizedGrievanceData.memberEmail : ''}" placeholder="recipient@example.com">
    </div>

    <div class="form-group">
      <label>CC (optional):</label>
      <input type="email" id="ccEmail" value="${sanitizedGrievanceData ? sanitizedGrievanceData.steward : ''}" placeholder="cc@example.com">
    </div>

    <div class="form-group">
      <label>Subject:</label>
      <input type="text" id="subject" value="${sanitizedGrievanceData ? `Re: Grievance ${sanitizedGrievanceData.id}` : ''}" placeholder="Email subject">
    </div>

    <div class="form-group">
      <label>Message:</label>
      <textarea id="message" placeholder="Type your message here..."></textarea>
    </div>

    <div class="checkbox-group">
      <input type="checkbox" id="attachPDF" ${grievanceData ? 'checked' : ''}>
      <label for="attachPDF">Attach grievance PDF report</label>
    </div>

    <div class="checkbox-group">
      <input type="checkbox" id="logCommunication" checked>
      <label for="logCommunication">Log this email in Communications Log</label>
    </div>

    <div class="button-group">
      <button onclick="sendEmail()">📤 Send Email</button>
      <button class="secondary" onclick="google.script.host.close()">❌ Cancel</button>
    </div>

    <div id="status" style="margin-top: 15px; padding: 10px; display: none;"></div>
  </div>

  <script>
    const grievanceData = ${JSON.stringify(grievanceData)};
    const templates = ${JSON.stringify(templates)};

    function loadTemplate() {
      const templateId = document.getElementById('templateSelect').value;
      if (!templateId) return;

      const template = templates.find(function(t) { return t.id === templateId; });
      if (!template) return;

      document.getElementById('subject').value = template.subject || '';
      document.getElementById('message').value = replacePlaceholders(template.body || '');
    }

    function replacePlaceholders(text) {
      if (!grievanceData) return text;

      return text
        .replace(/\\{GRIEVANCE_ID\\}/g, grievanceData.id || '')
        .replace(/\\{MEMBER_NAME\\}/g, grievanceData.memberName || '')
        .replace(/\\{ISSUE_TYPE\\}/g, grievanceData.issueType || '')
        .replace(/\\{STATUS\\}/g, grievanceData.status || '');
    }

    function sendEmail() {
      const to = document.getElementById('toEmail').value.trim();
      const cc = document.getElementById('ccEmail').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();
      const attachPDF = document.getElementById('attachPDF').checked;
      const logCommunication = document.getElementById('logCommunication').checked;

      if (!to || !subject || !message) {
        showStatus('Please fill in all required fields (To, Subject, Message)', 'error');
        return;
      }

      showStatus('Sending email...', 'info');

      const emailData = {
        to: to,
        cc: cc,
        subject: subject,
        message: message,
        attachPDF: attachPDF,
        logCommunication: logCommunication,
        grievanceId: grievanceData ? grievanceData.id : null
      };

      google.script.run
        .withSuccessHandler(onEmailSent)
        .withFailureHandler(onEmailError)
        .sendGrievanceEmail(emailData);
    }

    function onEmailSent(result) {
      showStatus('✅ Email sent successfully!', 'success');
      setTimeout(function() {
        google.script.host.close();
      }, 2000);
    }

    function onEmailError(error) {
      showStatus('❌ Error: ' + error.message, 'error');
    }

    function showStatus(message, type) {
      const statusDiv = document.getElementById('status');
      statusDiv.textContent = message;
      statusDiv.style.display = 'block';
      statusDiv.style.background = type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1';
      statusDiv.style.color = type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460';
      statusDiv.style.border = '1px solid ' + (type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb');
      statusDiv.style.borderRadius = '4px';
    }
  </script>
</body>
</html>
  `;
}

/**
 * Sends email with optional PDF attachment
 * Includes comprehensive security checks:
 * - Role-based access control
 * - Email validation
 * - Whitelist verification
 * - Rate limiting
 * - Content length limits
 * - Audit logging
 *
 * @param {Object} emailData - Email information
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.cc - CC email (optional)
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.message - Email body
 * @param {boolean} emailData.attachPDF - Whether to attach PDF
 * @param {boolean} emailData.logCommunication - Whether to log
 * @param {string} emailData.grievanceId - Grievance ID (optional)
 * @returns {Object} {success: boolean, message: string}
 * @throws {Error} If security checks fail or sending fails
 */
function sendGrievanceEmail(emailData) {
  try {
    // Security Check 1: Require steward role
    requireRole('STEWARD', 'Send Email');

    // Security Check 2: Validate email addresses
    if (!isValidEmail(emailData.to)) {
      throw new Error('Invalid recipient email address');
    }

    if (emailData.cc && !isValidEmail(emailData.cc)) {
      throw new Error('Invalid CC email address');
    }

    // Security Check 3: Verify recipient is registered (whitelist)
    if (!isRegisteredEmail(emailData.to)) {
      throw new Error(
        'Security Error: Can only send emails to registered members in Member Directory. ' +
        'Please add the recipient to the Member Directory first.'
      );
    }

    // Security Check 4: Rate limiting (5 seconds between emails)
    enforceRateLimit('EMAIL_SEND', RATE_LIMITS.EMAIL_MIN_INTERVAL);

    // Security Check 5: Content length limits
    const subject = String(emailData.subject || '').substring(0, EMAIL_CONFIG.MAX_SUBJECT_LENGTH);
    const message = String(emailData.message || '').substring(0, EMAIL_CONFIG.MAX_BODY_LENGTH);

    if (!subject || !message) {
      throw new Error('Subject and message are required');
    }

    // Sanitize subject and message (defense in depth)
    const sanitizedSubject = sanitizeHTML(subject);
    const sanitizedMessage = sanitizeHTML(message);

    // Build email options
    const options = {
      to: emailData.to,
      subject: sanitizedSubject,
      body: sanitizedMessage,
      name: EMAIL_CONFIG.FROM_NAME
    };

    if (emailData.cc && isRegisteredEmail(emailData.cc)) {
      options.cc = emailData.cc;
    }

    if (EMAIL_CONFIG.REPLY_TO) {
      options.replyTo = EMAIL_CONFIG.REPLY_TO;
    }

    // Attach PDF if requested
    if (emailData.attachPDF && emailData.grievanceId && EMAIL_CONFIG.ATTACHMENTS_ENABLED) {
      try {
        const pdf = exportGrievanceToPDF(emailData.grievanceId);
        if (pdf) {
          options.attachments = [pdf];
        }
      } catch (pdfError) {
        Logger.log('Error attaching PDF: ' + pdfError.message);
        // Continue sending email without attachment
      }
    }

    // Send email
    MailApp.sendEmail(options);

    // Log communication if requested
    if (emailData.logCommunication && emailData.grievanceId) {
      logCommunication(
        emailData.grievanceId,
        'Email Sent',
        `To: ${emailData.to}\nSubject: ${sanitizedSubject}\n\n${sanitizedMessage}`
      );
    }

    // Security: Audit logging
    logAuditEvent('EMAIL_SENT', {
      to: emailData.to,
      cc: emailData.cc || 'none',
      grievanceId: emailData.grievanceId || 'none',
      attachedPDF: emailData.attachPDF || false,
      subjectLength: sanitizedSubject.length,
      messageLength: sanitizedMessage.length
    }, 'INFO');

    return {
      success: true,
      message: 'Email sent successfully'
    };

  } catch (error) {
    // Log error for debugging
    Logger.log('Error sending email: ' + error.message);

    // Security: Log failed email attempts
    logAuditEvent('EMAIL_SEND_FAILED', {
      to: emailData.to || 'unknown',
      error: error.message,
      grievanceId: emailData.grievanceId || 'none'
    }, 'WARNING');

    // Re-throw error for UI handling
    throw new Error('Failed to send email: ' + error.message);
  }
}

/**
 * Logs communication in the Communications Log sheet
 * @param {string} grievanceId - Grievance ID
 * @param {string} type - Communication type
 * @param {string} details - Communication details
 */
function logCommunication(grievanceId, type, details) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let commLog = ss.getSheetByName('📞 Communications Log');

  if (!commLog) {
    commLog = createCommunicationsLogSheet();
  }

  const timestamp = new Date();
  const user = Session.getActiveUser().getEmail() || 'System';

  const lastRow = commLog.getLastRow();
  // Row structure matches GMAIL_COMM_LOG_COLS: [timestamp, grievanceId, type, user, details]
  const newRow = [
    timestamp,      // GMAIL_COMM_LOG_COLS.TIMESTAMP (Column A)
    grievanceId,    // GMAIL_COMM_LOG_COLS.GRIEVANCE_ID (Column B)
    type,           // GMAIL_COMM_LOG_COLS.TYPE (Column C)
    user,           // GMAIL_COMM_LOG_COLS.USER (Column D)
    details         // GMAIL_COMM_LOG_COLS.DETAILS (Column E)
  ];

  commLog.getRange(lastRow + 1, 1, 1, 5).setValues([newRow]);
}

/**
 * Creates Communications Log sheet (Gmail format)
 * Note: Canonical createCommunicationsLogSheet(ss) is in AdminGrievanceMessages.gs
 * Structure follows GMAIL_COMM_LOG_COLS (simplified 5-column format)
 * @returns {Sheet} Communications Log sheet
 */
function createGmailCommunicationsLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Check if sheet already exists
  let sheet = ss.getSheetByName('📞 Communications Log');
  if (sheet) {
    return sheet; // Return existing sheet
  }

  sheet = ss.insertSheet('📞 Communications Log');

  // Set headers - Structure matches GMAIL_COMM_LOG_COLS
  const headers = [
    'Timestamp',      // Column A - GMAIL_COMM_LOG_COLS.TIMESTAMP
    'Grievance ID',   // Column B - GMAIL_COMM_LOG_COLS.GRIEVANCE_ID
    'Type',           // Column C - GMAIL_COMM_LOG_COLS.TYPE
    'User',           // Column D - GMAIL_COMM_LOG_COLS.USER
    'Details'         // Column E - GMAIL_COMM_LOG_COLS.DETAILS
  ];

  sheet.getRange(1, 1, 1, 5).setValues([headers]);

  // Format header
  sheet.getRange(1, 1, 1, 5)
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Set column widths
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 120); // Grievance ID
  sheet.setColumnWidth(3, 120); // Type
  sheet.setColumnWidth(4, 200); // User
  sheet.setColumnWidth(5, 400); // Details

  // Freeze header
  sheet.setFrozenRows(1);

  // Delete unused columns beyond the defined headers
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }

  return sheet;
}

/**
 * Gets email templates from configuration
 * @returns {Array} Array of template objects
 */
function getEmailTemplates() {
  return [
    {
      id: 'initial_acknowledgment',
      name: 'Initial Acknowledgment',
      subject: 'Re: Grievance {GRIEVANCE_ID} - Acknowledgment',
      body: `Dear {MEMBER_NAME},

This email confirms that we have received your grievance (ID: {GRIEVANCE_ID}) regarding {ISSUE_TYPE}.

Your case has been assigned to a steward who will contact you within 2-3 business days to discuss next steps.

Current Status: {STATUS}

If you have any questions or additional information to provide, please don't hesitate to contact us.

In solidarity,
SEIU Local 509`
    },
    {
      id: 'status_update',
      name: 'Status Update',
      subject: 'Grievance {GRIEVANCE_ID} - Status Update',
      body: `Dear {MEMBER_NAME},

I wanted to provide you with an update on your grievance (ID: {GRIEVANCE_ID}).

Current Status: {STATUS}

[Add specific update details here]

We will continue to keep you informed of any developments.

In solidarity,
SEIU Local 509`
    },
    {
      id: 'request_information',
      name: 'Request for Information',
      subject: 'Grievance {GRIEVANCE_ID} - Additional Information Needed',
      body: `Dear {MEMBER_NAME},

To proceed with your grievance (ID: {GRIEVANCE_ID}), we need some additional information:

[List the information needed here]

Please provide this information at your earliest convenience so we can continue processing your case.

Thank you for your cooperation.

In solidarity,
SEIU Local 509`
    },
    {
      id: 'resolution_notification',
      name: 'Resolution Notification',
      subject: 'Grievance {GRIEVANCE_ID} - Resolved',
      body: `Dear {MEMBER_NAME},

I'm pleased to inform you that your grievance (ID: {GRIEVANCE_ID}) has been resolved.

Resolution Details:
[Add resolution details here]

This case is now closed. If you have any questions about the resolution, please don't hesitate to contact us.

Thank you for your patience throughout this process.

In solidarity,
SEIU Local 509`
    },
    {
      id: 'meeting_invitation',
      name: 'Meeting Invitation',
      subject: 'Grievance {GRIEVANCE_ID} - Meeting Scheduled',
      body: `Dear {MEMBER_NAME},

We have scheduled a meeting to discuss your grievance (ID: {GRIEVANCE_ID}).

Date: [DATE]
Time: [TIME]
Location: [LOCATION]

Please confirm your attendance at your earliest convenience.

In solidarity,
SEIU Local 509`
    }
  ];
}

/**
 * Shows email template manager
 */
function showEmailTemplateManager() {
  const templates = getEmailTemplates();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #1a73e8; margin-top: 0; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    .template { background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 4px; border-left: 4px solid #1a73e8; }
    .template h3 { margin-top: 0; color: #333; }
    .template-body { background: white; padding: 10px; border-radius: 4px; margin: 10px 0; font-size: 13px; white-space: pre-wrap; }
    .placeholders { background: #fff3cd; padding: 10px; border-radius: 4px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>📝 Email Template Library</h2>

    <div class="placeholders">
      <strong>Available Placeholders:</strong><br>
      {GRIEVANCE_ID}, {MEMBER_NAME}, {ISSUE_TYPE}, {STATUS}
    </div>

    ${templates.map(function(t) { return `
      <div class="template">
        <h3>${t.name}</h3>
        <strong>Subject:</strong> ${t.subject}<br><br>
        <strong>Body:</strong>
        <div class="template-body">${t.body}</div>
      </div>
    `; }).join('')}
  </div>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(700)
    .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📝 Email Templates');
}

/**
 * Shows communication log for a specific grievance
 * @param {string} grievanceId - Grievance ID
 */
function showGrievanceCommunications(grievanceId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const commLog = ss.getSheetByName('📞 Communications Log');

  if (!commLog) {
    SpreadsheetApp.getUi().alert('No communications logged yet.');
    return;
  }

  const lastRow = commLog.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No communications logged for this grievance.');
    return;
  }

  const data = commLog.getRange(2, 1, lastRow - 1, 5).getValues();
  const grievanceComms = data.filter(function(row) { return row[GMAIL_COMM_LOG_COLS.GRIEVANCE_ID] === grievanceId; });

  if (grievanceComms.length === 0) {
    SpreadsheetApp.getUi().alert('No communications logged for this grievance.');
    return;
  }

  const commsList = grievanceComms
    .map(function(row) { return `
      <div style="background: #f8f9fa; padding: 12px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #1a73e8;">
        <strong>${row[GMAIL_COMM_LOG_COLS.TYPE]}</strong> - ${row[GMAIL_COMM_LOG_COLS.TIMESTAMP].toLocaleString()}<br>
        <em>By: ${row[GMAIL_COMM_LOG_COLS.USER]}</em><br><br>
        <div style="white-space: pre-wrap; background: white; padding: 10px; border-radius: 4px;">${row[GMAIL_COMM_LOG_COLS.DETAILS]}</div>
      </div>
    `; })
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-height: 500px; overflow-y: auto; }
    h2 { color: #1a73e8; margin-top: 0; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; position: sticky; top: 0; background: white; }
  </style>
</head>
<body>
  <div class="container">
    <h2>📞 Communications Log - ${grievanceId}</h2>
    ${commsList}
  </div>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(700)
    .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, `Communications - ${grievanceId}`);
}
