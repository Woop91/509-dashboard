/**
 * ============================================================================
 * AUDIT LOGGING & ROLE-BASED ACCESS CONTROL (RBAC)
 * ============================================================================
 *
 * Features:
 * - Audit logging for all data modifications
 * - Role-based access control (Admin, Steward, Viewer)
 * - Automatic Audit_Log sheet creation
 * - Script properties configuration for roles
 *
 * ============================================================================
 */

/* ===================== AUDIT LOGGING ===================== */

/**
 * Creates the Audit_Log sheet if it doesn't exist (RBAC version)
 * Note: Canonical createAuditLogSheet() is in SecurityService.gs
 */
function createAuditLogSheetRBAC() {
  const ss = SpreadsheetApp.getActive();
  let auditLog = ss.getSheetByName(SHEETS.AUDIT_LOG);

  if (!auditLog) {
    auditLog = ss.insertSheet(SHEETS.AUDIT_LOG);

    // Set up headers
    const headers = [
      "Timestamp",
      "User Email",
      "Action",
      "Sheet Name",
      "Row Number",
      "Column",
      "Old Value",
      "New Value",
      "Details"
    ];

    auditLog.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight("bold")
      .setBackground(COLORS.SOLIDARITY_RED)
      .setFontColor("#FFFFFF");

    auditLog.setFrozenRows(1);
    auditLog.setTabColor(COLORS.SOLIDARITY_RED);

    // Set column widths
    auditLog.setColumnWidth(1, 150); // Timestamp
    auditLog.setColumnWidth(2, 200); // User Email
    auditLog.setColumnWidth(3, 120); // Action
    auditLog.setColumnWidth(4, 150); // Sheet Name
    auditLog.setColumnWidth(5, 80);  // Row Number
    auditLog.setColumnWidth(6, 100); // Column
    auditLog.setColumnWidth(7, 150); // Old Value
    auditLog.setColumnWidth(8, 150); // New Value
    auditLog.setColumnWidth(9, 300); // Details

    // Delete unused columns beyond the defined headers (9 columns)
    const totalCols = auditLog.getMaxColumns();
    if (totalCols > headers.length) {
      auditLog.deleteColumns(headers.length + 1, totalCols - headers.length);
    }
  }

  return auditLog;
}

/**
 * Logs a data modification to the Audit_Log sheet
 * @param {string} action - Type of action (CREATE, UPDATE, DELETE)
 * @param {string} sheetName - Name of the sheet where modification occurred
 * @param {number} rowNumber - Row number that was modified
 * @param {string} column - Column name or letter
 * @param {string} oldValue - Previous value (empty for CREATE)
 * @param {string} newValue - New value (empty for DELETE)
 * @param {string} details - Additional details about the modification
 */
function logDataModification(action, sheetName, rowNumber, column, oldValue, newValue, details) {
  try {
    const auditLog = createAuditLogSheet();
    const userEmail = Session.getActiveUser().getEmail() || "Unknown User";
    const timestamp = new Date();

    // Truncate long values
    const maxLength = 100;
    const truncatedOldValue = oldValue && oldValue.toString().length > maxLength
      ? oldValue.toString().substring(0, maxLength) + "..."
      : oldValue;
    const truncatedNewValue = newValue && newValue.toString().length > maxLength
      ? newValue.toString().substring(0, maxLength) + "..."
      : newValue;

    const logEntry = [
      timestamp,
      userEmail,
      action,
      sheetName,
      rowNumber,
      column,
      truncatedOldValue || "",
      truncatedNewValue || "",
      details || ""
    ];

    auditLog.appendRow(logEntry);

    // Keep only last 10,000 entries (performance)
    if (auditLog.getLastRow() > 10000) {
      auditLog.deleteRows(2, 100); // Delete oldest 100 rows
    }

  } catch (error) {
    Logger.log("Audit logging error: " + error.toString());
    // Don't throw error - audit logging should not break main functionality
  }
}

/**
 * Logs member creation
 */
function logMemberCreation(memberID, firstName, lastName) {
  logDataModification(
    "CREATE",
    SHEETS.MEMBER_DIR,
    null,
    "Member",
    "",
    memberID,
    `New member created: ${firstName} ${lastName}`
  );
}

/**
 * Logs grievance creation
 */
function logGrievanceCreation(grievanceID, memberID, issueCategory) {
  logDataModification(
    "CREATE",
    SHEETS.GRIEVANCE_LOG,
    null,
    "Grievance",
    "",
    grievanceID,
    `New grievance filed for ${memberID}: ${issueCategory}`
  );
}

/**
 * Logs member update
 */
function logMemberUpdate(memberID, column, oldValue, newValue) {
  logDataModification(
    "UPDATE",
    SHEETS.MEMBER_DIR,
    null,
    column,
    oldValue,
    newValue,
    `Member ${memberID} updated`
  );
}

/**
 * Logs grievance update
 */
function logGrievanceUpdate(grievanceID, column, oldValue, newValue) {
  logDataModification(
    "UPDATE",
    SHEETS.GRIEVANCE_LOG,
    null,
    column,
    oldValue,
    newValue,
    `Grievance ${grievanceID} updated`
  );
}

/**
 * Logs data deletion
 */
function logDataDeletion(sheetName, itemID, details) {
  logDataModification(
    "DELETE",
    sheetName,
    null,
    "Record",
    itemID,
    "",
    details
  );
}

/* ===================== ROLE-BASED ACCESS CONTROL ===================== */

/**
 * Initialize RBAC script properties
 * Call this once to set up the roles
 */
function initializeRBAC() {
  const scriptProperties = PropertiesService.getScriptProperties();

  // Set default empty arrays if not already set
  if (!scriptProperties.getProperty('ADMINS')) {
    scriptProperties.setProperty('ADMINS', '[]');
  }
  if (!scriptProperties.getProperty('STEWARDS')) {
    scriptProperties.setProperty('STEWARDS', '[]');
  }
  if (!scriptProperties.getProperty('VIEWERS')) {
    scriptProperties.setProperty('VIEWERS', '[]');
  }

  SpreadsheetApp.getUi().alert(
    '✅ RBAC Initialized',
    'Role-Based Access Control has been initialized.\n\n' +
    'To configure roles, go to:\n' +
    '509 Tools > Admin > Configure User Roles\n\n' +
    'You can assign users to three roles:\n' +
    '• ADMINS - Full access (can modify everything)\n' +
    '• STEWARDS - Can create/edit grievances and members\n' +
    '• VIEWERS - Read-only access',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Check if user has required permission
 * @param {string} requiredRole - "ADMIN", "STEWARD", or "VIEWER"
 * @returns {boolean} True if user has permission
 */
function checkUserPermission(requiredRole) {
  const userEmail = Session.getActiveUser().getEmail();
  const scriptProperties = PropertiesService.getScriptProperties();

  // If RBAC not initialized, allow all access
  const adminsJSON = scriptProperties.getProperty('ADMINS');
  if (!adminsJSON) {
    return true; // RBAC not configured, allow access
  }

  // Parse role lists
  const admins = JSON.parse(adminsJSON || '[]');
  const stewards = JSON.parse(scriptProperties.getProperty('STEWARDS') || '[]');
  const viewers = JSON.parse(scriptProperties.getProperty('VIEWERS') || '[]');

  // Check permission hierarchy
  const isAdmin = admins.includes(userEmail);
  const isSteward = stewards.includes(userEmail);
  const isViewer = viewers.includes(userEmail);

  switch (requiredRole.toUpperCase()) {
    case "ADMIN":
      return isAdmin;
    case "STEWARD":
      return isAdmin || isSteward;
    case "VIEWER":
      return isAdmin || isSteward || isViewer;
    default:
      return false;
  }
}

/**
 * Get user's current role using RBAC permission checks
 * Note: Canonical getUserRole() is in SecurityUtils.gs. This version uses checkUserPermission().
 * @returns {string} "ADMIN", "STEWARD", "VIEWER", or "NONE"
 */
function getUserRoleRBAC() {
  if (checkUserPermission("ADMIN")) return "ADMIN";
  if (checkUserPermission("STEWARD")) return "STEWARD";
  if (checkUserPermission("VIEWER")) return "VIEWER";
  return "NONE";
}

/**
 * Show role configuration dialog
 */
function configureUserRoles() {
  if (!checkUserPermission("ADMIN")) {
    SpreadsheetApp.getUi().alert(
      '❌ Access Denied',
      'Only administrators can configure user roles.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  const scriptProperties = PropertiesService.getScriptProperties();
  const admins = JSON.parse(scriptProperties.getProperty('ADMINS') || '[]');
  const stewards = JSON.parse(scriptProperties.getProperty('STEWARDS') || '[]');
  const viewers = JSON.parse(scriptProperties.getProperty('VIEWERS') || '[]');

  const ui = SpreadsheetApp.getUi();

  const message =
    '👥 CURRENT ROLE ASSIGNMENTS\n\n' +
    `ADMINS (${admins.length}):\n${admins.length > 0 ? admins.join('\n') : '  (none)'}\n\n` +
    `STEWARDS (${stewards.length}):\n${stewards.length > 0 ? stewards.join('\n') : '  (none)'}\n\n` +
    `VIEWERS (${viewers.length}):\n${viewers.length > 0 ? viewers.join('\n') : '  (none)'}\n\n` +
    'To modify roles, use:\n' +
    '• 509 Tools > Admin > Add Admin\n' +
    '• 509 Tools > Admin > Add Steward\n' +
    '• 509 Tools > Admin > Add Viewer\n' +
    '• 509 Tools > Admin > Remove User Role';

  ui.alert('👥 User Roles Configuration', message, ui.ButtonSet.OK);
}

/**
 * Add user to role
 */
function addUserToRole(role) {
  if (!checkUserPermission("ADMIN")) {
    SpreadsheetApp.getUi().alert('❌ Access Denied', 'Only administrators can modify roles.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    `Add ${role}`,
    `Enter the email address to add as ${role}:`,
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText().trim().toLowerCase();
  if (!email || !email.includes('@')) {
    ui.alert('❌ Invalid Email', 'Please enter a valid email address.', ui.ButtonSet.OK);
    return;
  }

  const scriptProperties = PropertiesService.getScriptProperties();
  const propertyName = role.toUpperCase() + 'S';
  const roleList = JSON.parse(scriptProperties.getProperty(propertyName) || '[]');

  if (roleList.includes(email)) {
    ui.alert('⚠️ Already Exists', `${email} is already a ${role}.`, ui.ButtonSet.OK);
    return;
  }

  roleList.push(email);
  scriptProperties.setProperty(propertyName, JSON.stringify(roleList));

  // Log the change
  logDataModification(
    "UPDATE",
    "RBAC",
    null,
    propertyName,
    "",
    email,
    `Added ${email} to ${role} role`
  );

  ui.alert('✅ Success', `${email} has been added as ${role}.`, ui.ButtonSet.OK);
}

/**
 * Menu functions for adding users to roles
 */
function addAdmin() {
  addUserToRole("ADMIN");
}

function addSteward() {
  addUserToRole("STEWARD");
}

function addViewer() {
  addUserToRole("VIEWER");
}

/**
 * Show user's current permissions
 */
function showMyPermissions() {
  const userEmail = Session.getActiveUser().getEmail();
  const role = getUserRole();

  const permissions = {
    "ADMIN": "✅ Full access - Can modify all data and configure roles",
    "STEWARD": "✅ Can create and edit members and grievances",
    "VIEWER": "👁️ Read-only access",
    "NONE": "❌ No role assigned - RBAC may not be configured"
  };

  SpreadsheetApp.getUi().alert(
    '👤 My Permissions',
    `Email: ${userEmail}\n\nRole: ${role}\n\n${permissions[role]}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
