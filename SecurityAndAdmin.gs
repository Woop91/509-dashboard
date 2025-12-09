/**
 * SECURITY AND ADMIN FEATURES
 * Features 79-94: Audit Logging, RBAC, Security, Backups, Import/Export
 */

// ===========================
// FEATURE 79: AUDIT LOGGING
// ===========================

/**
 * Creates the Audit_Log sheet for tracking all data modifications (recreates if exists!)
 * Note: Canonical createAuditLogSheet() is in SecurityService.gs (preserves existing data)
 */
function recreateAuditLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let auditLog = ss.getSheetByName(SHEETS.AUDIT_LOG);

  // Delete existing sheet if present
  if (auditLog) {
    ss.deleteSheet(auditLog);
  }

  // Create new sheet
  auditLog = ss.insertSheet(SHEETS.AUDIT_LOG);

  // Set up headers
  const headers = [
    'Timestamp',
    'User Email',
    'Action Type',
    'Sheet Name',
    'Record ID',
    'Field Changed',
    'Old Value',
    'New Value',
    'IP Address',
    'Session ID'
  ];

  auditLog.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style headers
  auditLog.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4A5568')
    .setFontColor('#FFFFFF')
    .setWrap(true);

  // Set column widths
  auditLog.setColumnWidth(1, 150); // Timestamp
  auditLog.setColumnWidth(2, 200); // User Email
  auditLog.setColumnWidth(3, 120); // Action Type
  auditLog.setColumnWidth(4, 150); // Sheet Name
  auditLog.setColumnWidth(5, 120); // Record ID
  auditLog.setColumnWidth(6, 150); // Field Changed
  auditLog.setColumnWidth(7, 200); // Old Value
  auditLog.setColumnWidth(8, 200); // New Value
  auditLog.setColumnWidth(9, 120); // IP Address
  auditLog.setColumnWidth(10, 150); // Session ID

  // Freeze header row
  auditLog.setFrozenRows(1);

  // Set tab color
  auditLog.setTabColor('#DC2626'); // Red for security/audit

  // Delete unused columns beyond the defined headers (10 columns)
  const totalCols = auditLog.getMaxColumns();
  if (totalCols > headers.length) {
    auditLog.deleteColumns(headers.length + 1, totalCols - headers.length);
  }

  Logger.log('Audit_Log sheet created successfully');
}

/**
 * Logs a data modification to the Audit_Log sheet
 * @param {string} actionType - Type of action (CREATE, UPDATE, DELETE, EXPORT, etc.)
 * @param {string} sheetName - Name of sheet where action occurred
 * @param {string} recordId - ID of the record affected
 * @param {string} fieldChanged - Name of field that changed
 * @param {string} oldValue - Previous value
 * @param {string} newValue - New value
 */
function logDataModificationAdmin(actionType, sheetName, recordId, fieldChanged, oldValue, newValue) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let auditLog = ss.getSheetByName(SHEETS.AUDIT_LOG);

    // Create audit log sheet if it doesn't exist
    if (!auditLog) {
      createAuditLogSheet();
      auditLog = ss.getSheetByName(SHEETS.AUDIT_LOG);
    }

    // Get user info
    const userEmail = Session.getActiveUser().getEmail() || 'Unknown';
    const timestamp = new Date();

    // Generate session ID (stored in script properties for session duration)
    const scriptProps = PropertiesService.getScriptProperties();
    let sessionId = scriptProps.getProperty('CURRENT_SESSION_ID');
    if (!sessionId) {
      sessionId = Utilities.getUuid();
      scriptProps.setProperty('CURRENT_SESSION_ID', sessionId);
    }

    // IP address not available in Apps Script, using placeholder
    const ipAddress = 'N/A';

    // Prepare audit entry
    const auditEntry = [
      timestamp,
      userEmail,
      actionType,
      sheetName,
      recordId || 'N/A',
      fieldChanged || 'N/A',
      oldValue || '',
      newValue || '',
      ipAddress,
      sessionId
    ];

    // Append to audit log
    auditLog.appendRow(auditEntry);

    Logger.log(`Audit logged: ${actionType} on ${sheetName} by ${userEmail}`);

  } catch (error) {
    Logger.log(`Error logging audit: ${error.message}`);
    // Don't throw error - audit logging should not break main operations
  }
}

// ===========================
// FEATURE 80: ROLE-BASED ACCESS CONTROL
// ===========================

/**
 * Check if current user has required permission level (comma-separated format)
 * Note: Canonical checkUserPermission() is in AuditLoggingRBAC.gs (uses JSON format)
 * @param {string} requiredRole - Required role: 'ADMIN', 'STEWARD', or 'VIEWER'
 * @return {boolean} True if user has permission
 */
function checkUserPermissionCSV(requiredRole) {
  try {
    const userEmail = Session.getActiveUser().getEmail();

    if (!userEmail) {
      SpreadsheetApp.getUi().alert('Unable to identify user. Access denied.');
      return false;
    }

    const scriptProps = PropertiesService.getScriptProperties();

    // Get role lists from script properties
    const admins = (scriptProps.getProperty('ADMINS') || '').split(',').map(e => e.trim().toLowerCase());
    const stewards = (scriptProps.getProperty('STEWARDS') || '').split(',').map(e => e.trim().toLowerCase());
    const viewers = (scriptProps.getProperty('VIEWERS') || '').split(',').map(e => e.trim().toLowerCase());

    const userEmailLower = userEmail.toLowerCase();

    // Check permissions based on role hierarchy (ADMIN > STEWARD > VIEWER)
    const isAdmin = admins.includes(userEmailLower);
    const isSteward = stewards.includes(userEmailLower);
    const isViewer = viewers.includes(userEmailLower);

    switch (requiredRole.toUpperCase()) {
      case 'ADMIN':
        return isAdmin;
      case 'STEWARD':
        return isAdmin || isSteward;
      case 'VIEWER':
        return isAdmin || isSteward || isViewer;
      default:
        return false;
    }

  } catch (error) {
    Logger.log(`Error checking permissions: ${error.message}`);
    return false;
  }
}

/**
 * Configure RBAC roles (Admin only)
 */
function configureRBAC() {
  const ui = SpreadsheetApp.getUi();

  // Check if current user is admin
  if (!checkUserPermission('ADMIN')) {
    ui.alert('Access Denied', 'Only administrators can configure RBAC settings.', ui.ButtonSet.OK);
    return;
  }

  const scriptProps = PropertiesService.getScriptProperties();

  // Get current values
  const currentAdmins = scriptProps.getProperty('ADMINS') || '';
  const currentStewards = scriptProps.getProperty('STEWARDS') || '';
  const currentViewers = scriptProps.getProperty('VIEWERS') || '';

  // Prompt for new values
  const adminsResponse = ui.prompt(
    'Configure Admin Users',
    `Enter admin email addresses (comma-separated):\n\nCurrent: ${currentAdmins}`,
    ui.ButtonSet.OK_CANCEL
  );

  if (adminsResponse.getSelectedButton() === ui.Button.OK) {
    const admins = adminsResponse.getResponseText().trim();
    if (admins) scriptProps.setProperty('ADMINS', admins);
  }

  const stewardsResponse = ui.prompt(
    'Configure Steward Users',
    `Enter steward email addresses (comma-separated):\n\nCurrent: ${currentStewards}`,
    ui.ButtonSet.OK_CANCEL
  );

  if (stewardsResponse.getSelectedButton() === ui.Button.OK) {
    const stewards = stewardsResponse.getResponseText().trim();
    if (stewards) scriptProps.setProperty('STEWARDS', stewards);
  }

  const viewersResponse = ui.prompt(
    'Configure Viewer Users',
    `Enter viewer email addresses (comma-separated):\n\nCurrent: ${currentViewers}`,
    ui.ButtonSet.OK_CANCEL
  );

  if (viewersResponse.getSelectedButton() === ui.Button.OK) {
    const viewers = viewersResponse.getResponseText().trim();
    if (viewers) scriptProps.setProperty('VIEWERS', viewers);
  }

  ui.alert('Success', 'RBAC configuration updated successfully!', ui.ButtonSet.OK);

  // Log the configuration change
  logDataModification('CONFIG_CHANGE', 'Script Properties', 'RBAC', 'User Roles', 'Updated', 'Updated');
}

// ===========================
// FEATURE 83: INPUT SANITIZATION
// ===========================

/**
 * Sanitizes user input to prevent script injection and XSS attacks
 * @param {string} input - Raw user input
 * @param {string} type - Type of input: 'text', 'email', 'number', 'date', 'html'
 * @return {string} Sanitized input
 */
function sanitizeInput(input, type = 'text') {
  if (input === null || input === undefined) {
    return '';
  }

  let sanitized = String(input);

  switch (type.toLowerCase()) {
    case 'text':
      // Remove script tags and dangerous characters
      sanitized = sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
        .trim();
      break;

    case 'email':
      // Basic email sanitization
      sanitized = sanitized.toLowerCase().trim();
      // Remove anything that's not email-safe
      sanitized = sanitized.replace(/[^a-z0-9@._-]/g, '');
      break;

    case 'number':
      // Extract only numeric characters
      sanitized = sanitized.replace(/[^0-9.-]/g, '');
      break;

    case 'date':
      // Validate date format
      const date = new Date(sanitized);
      if (isNaN(date.getTime())) {
        return '';
      }
      sanitized = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      break;

    case 'html':
      // Escape HTML entities
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
      break;

    default:
      // Default to text sanitization
      sanitized = sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .trim();
  }

  // Log if significant sanitization occurred
  if (sanitized !== String(input)) {
    Logger.log(`Input sanitized: "${input}" -> "${sanitized}"`);
    logDataModification('SANITIZATION', 'Input Validation', 'N/A', type, input, sanitized);
  }

  return sanitized;
}

// ===========================
// FEATURE 84: AUDIT REPORTING
// ===========================

/**
 * Generates an audit trail report for a specified date range
 * @param {Date} startDate - Start date for report
 * @param {Date} endDate - End date for report
 */
function generateAuditReport(startDate, endDate) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const auditLog = ss.getSheetByName(SHEETS.AUDIT_LOG);

  if (!auditLog) {
    SpreadsheetApp.getUi().alert('Error', 'Audit_Log sheet not found. Please enable audit logging first.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  // Check permissions
  if (!checkUserPermission('ADMIN')) {
    SpreadsheetApp.getUi().alert('Access Denied', 'Only administrators can generate audit reports.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  // Get all audit data
  const data = auditLog.getDataRange().getValues();
  const headers = data[0];
  const records = data.slice(1);

  // Filter by date range
  const filtered = records.filter(row => {
    const timestamp = new Date(row[0]);
    return timestamp >= startDate && timestamp <= endDate;
  });

  // Create report sheet
  let reportSheet = ss.getSheetByName('Audit Report');
  if (reportSheet) {
    ss.deleteSheet(reportSheet);
  }
  reportSheet = ss.insertSheet('Audit Report');

  // Add title
  reportSheet.getRange(1, 1, 1, 6).merge();
  reportSheet.getRange(1, 1).setValue('AUDIT TRAIL REPORT');
  reportSheet.getRange(1, 1).setFontSize(16).setFontWeight('bold').setHorizontalAlignment('center');

  // Add date range
  reportSheet.getRange(2, 1, 1, 6).merge();
  reportSheet.getRange(2, 1).setValue(`Period: ${Utilities.formatDate(startDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')} to ${Utilities.formatDate(endDate, Session.getScriptTimeZone(), 'yyyy-MM-dd')}`);
  reportSheet.getRange(2, 1).setHorizontalAlignment('center');

  // Add summary stats
  reportSheet.getRange(4, 1).setValue('Total Actions:');
  reportSheet.getRange(4, 2).setValue(filtered.length);

  const uniqueUsers = [...new Set(filtered.map(row => row[1]))];
  reportSheet.getRange(5, 1).setValue('Unique Users:');
  reportSheet.getRange(5, 2).setValue(uniqueUsers.length);

  const actionTypes = filtered.reduce((acc, row) => {
    acc[row[2]] = (acc[row[2]] || 0) + 1;
    return acc;
  }, {});

  reportSheet.getRange(7, 1).setValue('Actions by Type:');
  reportSheet.getRange(7, 1).setFontWeight('bold');

  let row = 8;
  for (const [type, count] of Object.entries(actionTypes)) {
    reportSheet.getRange(row, 1).setValue(type);
    reportSheet.getRange(row, 2).setValue(count);
    row++;
  }

  // Add detailed records
  const detailStartRow = row + 2;
  reportSheet.getRange(detailStartRow, 1, 1, headers.length).setValues([headers]);
  reportSheet.getRange(detailStartRow, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4A5568')
    .setFontColor('#FFFFFF');

  if (filtered.length > 0) {
    reportSheet.getRange(detailStartRow + 1, 1, filtered.length, headers.length).setValues(filtered);
  }

  // Format
  reportSheet.setFrozenRows(detailStartRow);
  reportSheet.setTabColor('#7C3AED');

  SpreadsheetApp.getUi().alert('Success', `Audit report generated with ${filtered.length} records.`, SpreadsheetApp.getUi().ButtonSet.OK);

  // Log report generation
  logDataModification('REPORT_GENERATED', 'Audit_Log', 'Audit Report', 'Date Range',
                     startDate.toISOString(), endDate.toISOString());
}

/**
 * Shows dialog to generate audit report
 */
function showAuditReportDialog() {
  const ui = SpreadsheetApp.getUi();

  // Check permissions
  if (!checkUserPermission('ADMIN')) {
    ui.alert('Access Denied', 'Only administrators can generate audit reports.', ui.ButtonSet.OK);
    return;
  }

  const startResponse = ui.prompt(
    'Generate Audit Report',
    'Enter start date (YYYY-MM-DD):',
    ui.ButtonSet.OK_CANCEL
  );

  if (startResponse.getSelectedButton() !== ui.Button.OK) return;

  const endResponse = ui.prompt(
    'Generate Audit Report',
    'Enter end date (YYYY-MM-DD):',
    ui.ButtonSet.OK_CANCEL
  );

  if (endResponse.getSelectedButton() !== ui.Button.OK) return;

  try {
    const startDate = new Date(startResponse.getResponseText());
    const endDate = new Date(endResponse.getResponseText());

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      ui.alert('Error', 'Invalid date format. Please use YYYY-MM-DD.', ui.ButtonSet.OK);
      return;
    }

    generateAuditReport(startDate, endDate);

  } catch (error) {
    ui.alert('Error', `Failed to generate report: ${error.message}`, ui.ButtonSet.OK);
  }
}

// ===========================
// FEATURE 85: DATA RETENTION POLICY
// ===========================

/**
 * Enforces data retention policy (default: 7 years)
 * Moves old records to Archive sheet
 * @param {number} retentionYears - Number of years to retain data (default: 7)
 */
function enforceDataRetention(retentionYears = 7) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // Check permissions
  if (!checkUserPermission('ADMIN')) {
    ui.alert('Access Denied', 'Only administrators can enforce data retention policies.', ui.ButtonSet.OK);
    return;
  }

  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

  let archivedCount = 0;

  // Process Grievance Log
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (grievanceLog) {
    const data = grievanceLog.getDataRange().getValues();
    const headers = data[0];
    const dateClosedCol = headers.indexOf('Date Closed');

    if (dateClosedCol !== -1) {
      const oldGrievances = [];
      const rowsToDelete = [];

      for (let i = data.length - 1; i >= 1; i--) {
        const row = data[i];
        const dateClosed = new Date(row[dateClosedCol]);

        if (!isNaN(dateClosed.getTime()) && dateClosed < cutoffDate) {
          oldGrievances.push(row);
          rowsToDelete.push(i + 1); // +1 for 1-indexed rows
        }
      }

      // Move to archive
      if (oldGrievances.length > 0) {
        archiveRecords('Grievance', oldGrievances, headers);

        // Delete rows (from bottom to top to maintain indices)
        rowsToDelete.forEach(rowNum => {
          grievanceLog.deleteRow(rowNum);
        });

        archivedCount += oldGrievances.length;
      }
    }
  }

  // Process Audit Log
  const auditLog = ss.getSheetByName(SHEETS.AUDIT_LOG);
  if (auditLog) {
    const data = auditLog.getDataRange().getValues();
    const headers = data[0];
    const oldRecords = [];
    const rowsToDelete = [];

    for (let i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      const timestamp = new Date(row[0]);

      if (!isNaN(timestamp.getTime()) && timestamp < cutoffDate) {
        oldRecords.push(row);
        rowsToDelete.push(i + 1);
      }
    }

    if (oldRecords.length > 0) {
      archiveRecords('Audit_Log', oldRecords, headers);

      rowsToDelete.forEach(rowNum => {
        auditLog.deleteRow(rowNum);
      });

      archivedCount += oldRecords.length;
    }
  }

  ui.alert('Data Retention Complete',
          `Archived ${archivedCount} records older than ${retentionYears} years (before ${cutoffDate.toDateString()}).`,
          ui.ButtonSet.OK);

  logDataModification('RETENTION_POLICY', 'System', 'Data Retention', 'Records Archived',
                     String(archivedCount), `Cutoff: ${cutoffDate.toISOString()}`);
}

/**
 * Helper function to archive records
 */
function archiveRecords(itemType, records, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let archive = ss.getSheetByName(SHEETS.ARCHIVE);

  if (!archive) {
    archive = ss.getSheetByName(SHEETS.ARCHIVE);
  }

  if (!archive) {
    // Create archive sheet if it doesn't exist
    archive = ss.insertSheet('📦 Archive');
    archive.getRange(1, 1, 1, 6).setValues([['Item Type', 'Item ID', 'Archive Date', 'Archived By', 'Reason', 'Original Data']]);
    archive.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#6B7280').setFontColor('#FFFFFF');
  }

  const userEmail = Session.getActiveUser().getEmail();
  const archiveDate = new Date();

  records.forEach(record => {
    const archiveRow = [
      itemType,
      record[0], // ID (first column)
      archiveDate,
      userEmail,
      'Data Retention Policy',
      JSON.stringify(record)
    ];

    archive.appendRow(archiveRow);
  });
}

// ===========================
// FEATURE 86: SUSPICIOUS ACTIVITY DETECTION
// ===========================

/**
 * Detects suspicious activity patterns (>50 changes/hour)
 * @return {Object} Detection results with alerts
 */
function detectSuspiciousActivity() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const auditLog = ss.getSheetByName(SHEETS.AUDIT_LOG);

  if (!auditLog) {
    return { suspicious: false, message: 'Audit log not available' };
  }

  const data = auditLog.getDataRange().getValues();
  const records = data.slice(1); // Skip header

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Count changes by user in last hour
  const userActivity = {};

  records.forEach(row => {
    const timestamp = new Date(row[0]);
    const userEmail = row[1];

    if (timestamp >= oneHourAgo) {
      userActivity[userEmail] = (userActivity[userEmail] || 0) + 1;
    }
  });

  // Find suspicious users (>50 changes/hour)
  const suspiciousUsers = [];
  for (const [email, count] of Object.entries(userActivity)) {
    if (count > 50) {
      suspiciousUsers.push({ email, count });
    }
  }

  if (suspiciousUsers.length > 0) {
    const ui = SpreadsheetApp.getUi();
    let message = '⚠️ SUSPICIOUS ACTIVITY DETECTED\n\n';
    message += 'The following users have made >50 changes in the last hour:\n\n';

    suspiciousUsers.forEach(user => {
      message += `${user.email}: ${user.count} changes\n`;
    });

    message += '\nThis may indicate:\n';
    message += '• Automated script activity\n';
    message += '• Data breach attempt\n';
    message += '• Legitimate bulk operations\n\n';
    message += 'Please review the Audit_Log sheet for details.';

    ui.alert('Security Alert', message, ui.ButtonSet.OK);

    // Log the detection
    logDataModification('SECURITY_ALERT', 'System', 'Suspicious Activity',
                       'High Volume Changes',
                       JSON.stringify(suspiciousUsers),
                       'Alert triggered');

    return { suspicious: true, users: suspiciousUsers, message };
  }

  return { suspicious: false, message: 'No suspicious activity detected' };
}

/**
 * Sets up automatic suspicious activity monitoring (trigger-based)
 */
function setupSuspiciousActivityMonitoring() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'detectSuspiciousActivity') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create hourly trigger
  ScriptApp.newTrigger('detectSuspiciousActivity')
    .timeBased()
    .everyHours(1)
    .create();

  SpreadsheetApp.getUi().alert('Success',
    'Suspicious activity monitoring enabled. System will check every hour for unusual patterns.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Opens the Audit_Log sheet for viewing
 */
function viewAuditLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let auditLog = ss.getSheetByName(SHEETS.AUDIT_LOG);

  if (!auditLog) {
    createAuditLogSheet();
    auditLog = ss.getSheetByName(SHEETS.AUDIT_LOG);
  }

  auditLog.activate();
  SpreadsheetApp.getUi().alert('Audit Log', 'Showing Audit_Log sheet with all data modifications.', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Opens the Performance_Log sheet for viewing
 */
function viewPerformanceLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let perfLog = ss.getSheetByName(SHEETS.PERFORMANCE_LOG);

  if (!perfLog) {
    createPerformanceLogSheet();
    perfLog = ss.getSheetByName(SHEETS.PERFORMANCE_LOG);
  }

  perfLog.activate();
  SpreadsheetApp.getUi().alert('Performance Log', 'Showing Performance_Log sheet with all execution metrics.', SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * One-click setup for all audit and security features
 */
function setupAuditAndSecurity() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Setup Audit & Security',
    'This will:\n\n' +
    '• Create Audit_Log sheet\n' +
    '• Create Performance_Log sheet\n' +
    '• Configure RBAC roles\n' +
    '• Enable activity monitoring\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  // Create sheets
  createAuditLogSheet();
  createPerformanceLogSheet();

  // Configure RBAC
  ui.alert('Step 1: Configure RBAC', 'Next, configure user roles for access control.', ui.ButtonSet.OK);
  configureRBAC();

  // Setup monitoring
  setupSuspiciousActivityMonitoring();

  ui.alert('Setup Complete!',
    'Audit logging and security features are now active!\n\n' +
    'Check the Audit_Log and Performance_Log sheets to monitor activity.',
    ui.ButtonSet.OK);

  // Log the setup
  logDataModification('SETUP', 'System', 'Audit & Security', 'Initialization', 'None', 'Complete');
}
