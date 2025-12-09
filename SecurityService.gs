/**
 * ------------------------------------------------------------------------====
 * SECURITY SERVICE - RBAC and Audit Logging
 * ------------------------------------------------------------------------====
 *
 * Provides role-based access control and comprehensive audit logging for
 * the 509 Dashboard to ensure security and compliance.
 *
 * Features:
 * - Role-based permissions (Admin, Steward, Member, Viewer)
 * - Function-level access control
 * - Comprehensive audit logging
 * - User activity tracking
 * - Change history
 *
 * ------------------------------------------------------------------------====
 */

/* --------------------= ROLE DEFINITIONS --------------------= */

/**
 * Role definitions with permissions
 * @type {Object}
 */
const ROLES = {
  ADMIN: {
    name: 'Admin',
    permissions: [
      'view', 'edit', 'delete', 'export', 'configure',
      'seed_data', 'clear_data', 'manage_users', 'view_audit_log'
    ],
    description: 'Full system access including configuration and user management'
  },
  STEWARD: {
    name: 'Steward',
    permissions: [
      'view', 'edit', 'comment', 'export', 'create_grievance',
      'update_grievance', 'view_assigned_grievances'
    ],
    description: 'Can view and edit grievances, manage assigned cases'
  },
  COORDINATOR: {
    name: 'Grievance Coordinator',
    permissions: [
      'view', 'edit', 'comment', 'export', 'create_grievance',
      'update_grievance', 'view_all_grievances', 'assign_stewards'
    ],
    description: 'Can manage all grievances and assign stewards'
  },
  MEMBER: {
    name: 'Member',
    permissions: [
      'view_own', 'view_own_grievances', 'comment'
    ],
    description: 'Can view own member data and grievances only'
  },
  VIEWER: {
    name: 'Viewer',
    permissions: [
      'view'
    ],
    description: 'Read-only access to anonymized data'
  }
};

/* --------------------= USER ROLE MANAGEMENT --------------------= */

/**
 * Gets the role for a user
 * @param {string} userEmail - User's email address (defaults to current user)
 * @returns {string} Role name (defaults to 'VIEWER')
 * Note: Canonical getUserRole() is in SecurityUtils.gs. This version looks up the User Roles sheet.
 */
function getUserRoleFromSheet(userEmail) {
  if (!userEmail) {
    userEmail = Session.getActiveUser().getEmail();
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let userRolesSheet = ss.getSheetByName(SHEETS.USER_ROLES);

    if (!userRolesSheet) {
      // If sheet doesn't exist, create it and assign current user as admin
      Logger.log('getUserRole: User Roles sheet not found. Creating and assigning ' + userEmail + ' as ADMIN');
      userRolesSheet = createUserRolesSheet();
      assignRole(userEmail, 'ADMIN');
      return 'ADMIN';
    }

    // Look up user's role
    const data = userRolesSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toLowerCase() === userEmail.toLowerCase()) {
        const role = data[i][1] || 'VIEWER';
        Logger.log('getUserRole: Found user ' + userEmail + ' with role ' + role);
        return role;
      }
    }

    // User not found, default to VIEWER (this is expected behavior, not an error)
    Logger.log('getUserRole: User ' + userEmail + ' not found in User Roles sheet. Defaulting to VIEWER');
    return 'VIEWER';
  } catch (error) {
    // Distinguish between "user not found" (handled above) and "error occurred"
    Logger.log('Error in getUserRole: Failed to retrieve role for user. UserEmail: ' + userEmail +
               ', Error: ' + error.message +
               ', Stack: ' + error.stack);
    handleError(error, 'getUserRole');
    return 'VIEWER';
  }
}

/**
 * Assigns a role to a user
 * @param {string} userEmail - User's email
 * @param {string} role - Role to assign (ADMIN, STEWARD, COORDINATOR, MEMBER, VIEWER)
 * @returns {boolean} Success status
 */
function assignRole(userEmail, role) {
  try {
    // Validate email parameter
    if (!userEmail || typeof userEmail !== 'string') {
      const error = new Error('assignRole: userEmail parameter is required and must be a string');
      Logger.log(error.message + '. Received: ' + JSON.stringify(userEmail));
      throw error;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      const error = new Error('assignRole: Invalid email format');
      Logger.log(error.message + '. Email provided: ' + userEmail);
      throw error;
    }

    // Validate role parameter
    if (!role || typeof role !== 'string') {
      const error = new Error('assignRole: role parameter is required and must be a string');
      Logger.log(error.message + '. Received: ' + JSON.stringify(role));
      throw error;
    }

    if (!ROLES[role]) {
      throw new Error(ERROR_MESSAGES.INVALID_INPUT(`role: ${role}`));
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let userRolesSheet = ss.getSheetByName(SHEETS.USER_ROLES);

    if (!userRolesSheet) {
      userRolesSheet = createUserRolesSheet();
      if (!userRolesSheet) {
        throw new Error('assignRole: Failed to create User Roles sheet');
      }
    }

    // Check if user already exists
    const data = userRolesSheet.getDataRange().getValues();
    let userRow = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toLowerCase() === userEmail.toLowerCase()) {
        userRow = i + 1;
        break;
      }
    }

    const timestamp = new Date();
    const assignedBy = Session.getActiveUser().getEmail();

    if (userRow > 0) {
      // Update existing user
      Logger.log(`assignRole: Updating existing user ${userEmail} from row ${userRow} to role ${role}`);
      userRolesSheet.getRange(userRow, 2, 1, 3).setValues([[role, timestamp, assignedBy]]);
    } else {
      // Add new user
      Logger.log(`assignRole: Adding new user ${userEmail} with role ${role}`);
      userRolesSheet.appendRow([userEmail, role, timestamp, assignedBy]);
    }

    // Log the role assignment
    logAudit('ROLE_ASSIGNMENT', `Assigned role ${role} to ${userEmail}`, {
      userEmail: userEmail,
      role: role,
      assignedBy: assignedBy,
      operation: userRow > 0 ? 'UPDATE' : 'CREATE'
    });

    return true;
  } catch (error) {
    // Provide detailed error context
    Logger.log('Error in assignRole: Failed to assign role. UserEmail: ' + (userEmail || 'undefined') +
               ', Role: ' + (role || 'undefined') +
               ', Error: ' + error.message +
               ', Stack: ' + error.stack);

    handleError(error, 'assignRole');
    return false;
  }
}

/**
 * Creates the User Roles sheet
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The created sheet
 */
function createUserRolesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.insertSheet(SHEETS.USER_ROLES);

  const headers = ['Email', 'Role', 'Assigned Date', 'Assigned By'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4A5568')
    .setFontColor('#FFFFFF');

  sheet.setFrozenRows(1);

  // Delete unused columns beyond the defined headers (4 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }

  sheet.hideSheet(); // Hide from regular users

  return sheet;
}

/* --------------------= PERMISSION CHECKING --------------------= */

/**
 * Checks if current user has a specific permission
 * @param {string} permission - Permission to check
 * @param {string} userEmail - User email (optional, defaults to current user)
 * @returns {boolean} True if user has permission
 */
function hasPermission(permission, userEmail) {
  try {
    // Validate permission parameter
    if (!permission || typeof permission !== 'string') {
      Logger.log('Error in hasPermission: permission parameter is required and must be a string. Received: ' + JSON.stringify(permission));
      return false;
    }

    const role = getUserRole(userEmail);
    const roleConfig = ROLES[role];

    if (!roleConfig) {
      // Role not found in ROLES configuration - this is unexpected
      Logger.log('Error in hasPermission: Role "' + role + '" not found in ROLES configuration. UserEmail: ' + (userEmail || 'current user'));
      return false;
    }

    const hasAccess = roleConfig.permissions.includes(permission);
    Logger.log('hasPermission: User "' + (userEmail || Session.getActiveUser().getEmail()) +
               '" with role "' + role + '" ' +
               (hasAccess ? 'HAS' : 'DOES NOT HAVE') +
               ' permission "' + permission + '"');

    return hasAccess;
  } catch (error) {
    Logger.log('Error in hasPermission: Failed to check permission. Permission: ' + (permission || 'undefined') +
               ', UserEmail: ' + (userEmail || 'undefined') +
               ', Error: ' + error.message +
               ', Stack: ' + error.stack);
    handleError(error, 'hasPermission');
    return false;
  }
}

/**
 * Checks permission and throws error if not authorized
 * @param {string} permission - Required permission
 * @param {string} action - Action being attempted (for error message)
 * @throws {Error} If user lacks permission
 */
function requirePermission(permission, action) {
  if (!hasPermission(permission)) {
    const userEmail = Session.getActiveUser().getEmail();
    const role = getUserRole(userEmail);

    logAudit('ACCESS_DENIED', `User ${userEmail} attempted ${action} without permission ${permission}`, {
      userEmail: userEmail,
      role: role,
      permission: permission,
      action: action
    });

    throw new Error(ERROR_MESSAGES.INSUFFICIENT_ROLE(permission, role) + ` to ${action}`);
  }
}

/* --------------------= AUDIT LOGGING --------------------= */

/**
 * Valid audit event types
 * @type {Array<string>}
 */
const VALID_AUDIT_EVENT_TYPES = [
  'ACCESS',
  'ACCESS_DENIED',
  'DATA_CHANGE',
  'ROLE_ASSIGNMENT',
  'SEED_DATA',
  'CLEAR_DATA',
  'EXPORT_AUDIT_LOG',
  'ERROR'
];

/**
 * Logs an audit event
 * @param {string} eventType - Type of event (ACCESS, DATA_CHANGE, ACCESS_DENIED, etc.)
 * @param {string} description - Human-readable description
 * @param {Object} metadata - Additional metadata
 */
function logAudit(eventType, description, metadata) {
  try {
    // Validate eventType parameter
    if (!eventType || typeof eventType !== 'string') {
      Logger.log('Error in logAudit: eventType is required and must be a string. Received: ' + JSON.stringify(eventType));
      return;
    }

    if (!VALID_AUDIT_EVENT_TYPES.includes(eventType)) {
      Logger.log('Warning in logAudit: Invalid eventType "' + eventType + '". Valid types: ' + VALID_AUDIT_EVENT_TYPES.join(', '));
      // Continue with logging anyway, but log the warning
    }

    // Validate description parameter
    if (!description || typeof description !== 'string') {
      Logger.log('Error in logAudit: description is required and must be a string. Received: ' + JSON.stringify(description));
      return;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let auditSheet = ss.getSheetByName(SHEETS.AUDIT_LOG);

    if (!auditSheet) {
      auditSheet = createAuditLogSheet();
    }

    const timestamp = new Date();
    const userEmail = Session.getActiveUser().getEmail();
    const ipAddress = ''; // Apps Script doesn't provide IP directly
    const metadataJson = metadata ? JSON.stringify(metadata) : '';

    auditSheet.appendRow([
      timestamp,
      userEmail,
      eventType,
      description,
      metadataJson,
      ipAddress
    ]);

    // Keep only last 10,000 rows for performance
    const lastRow = auditSheet.getLastRow();
    if (lastRow > 10000) {
      auditSheet.deleteRows(2, lastRow - 10000);
    }
  } catch (error) {
    // Don't throw error in logging to avoid breaking functionality
    // But provide better context about what failed
    Logger.log('Error in logAudit: Failed to log audit event. EventType: ' + eventType + ', Error: ' + error.message + ', Stack: ' + error.stack);
  }
}

/**
 * Creates the Audit Log sheet if it doesn't exist
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The existing or created sheet
 */
function createAuditLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Audit Log';

  // Check if sheet already exists
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    return sheet;
  }

  // Also check for underscore variant
  sheet = ss.getSheetByName(SHEETS.AUDIT_LOG);
  if (sheet) {
    return sheet;
  }

  // Create new sheet
  sheet = ss.insertSheet(sheetName);

  const headers = ['Timestamp', 'User Email', 'Event Type', 'Description', 'Metadata', 'IP Address'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#DC2626')
    .setFontColor('#FFFFFF');

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);

  // Delete unused columns beyond the defined headers (6 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }

  return sheet;
}

/**
 * Logs user login/access
 */
function logUserAccess() {
  const userEmail = Session.getActiveUser().getEmail();
  const role = getUserRole(userEmail);

  logAudit('ACCESS', `User accessed dashboard`, {
    userEmail: userEmail,
    role: role
  });
}

/* --------------------= DATA ACCESS CONTROL --------------------= */

/**
 * Filters member data based on user permissions
 * @param {Array<Array>} memberData - Full member data
 * @param {string} userEmail - User email (optional)
 * @returns {Array<Array>} Filtered data
 */
function filterMemberDataByPermission(memberData, userEmail) {
  if (!userEmail) {
    userEmail = Session.getActiveUser().getEmail();
  }

  const role = getUserRole(userEmail);

  // Admin and Coordinator can see all
  if (role === 'ADMIN' || role === 'COORDINATOR') {
    return memberData;
  }

  // Stewards can see all (but with limited edit permissions)
  if (role === 'STEWARD') {
    return memberData;
  }

  // Members can only see their own data
  if (role === 'MEMBER') {
    return memberData.filter(function(row, index) {
      if (index === 0) return true; // Keep header
      return row[MEMBER_COLS.EMAIL - 1] && row[MEMBER_COLS.EMAIL - 1].toLowerCase() === userEmail.toLowerCase();
    });
  }

  // Viewers see anonymized data (remove PII)
  if (role === 'VIEWER') {
    return memberData.map(function(row, index) {
      if (index === 0) return row; // Keep header

      // Anonymize PII
      return row.map(function(cell, colIndex) {
        // Hide email and phone
        if (colIndex === MEMBER_COLS.EMAIL - 1 || colIndex === MEMBER_COLS.PHONE - 1) {
          return '[REDACTED]';
        }
        return cell;
      });
    });
  }

  return [memberData[0]]; // Return only header for unknown roles
}

/**
 * Filters grievance data based on user permissions
 * @param {Array<Array>} grievanceData - Full grievance data
 * @param {string} userEmail - User email (optional)
 * @returns {Array<Array>} Filtered data
 */
function filterGrievanceDataByPermission(grievanceData, userEmail) {
  if (!userEmail) {
    userEmail = Session.getActiveUser().getEmail();
  }

  const role = getUserRole(userEmail);

  // Admin and Coordinator can see all
  if (role === 'ADMIN' || role === 'COORDINATOR') {
    return grievanceData;
  }

  // Stewards can only see assigned grievances
  if (role === 'STEWARD') {
    // First, get steward name from member directory
    const memberData = getSheetDataSafely(SHEETS.MEMBER_DIR);
    let stewardName = '';

    if (memberData) {
      const stewardRow = memberData.find(function(row) {
        return row[MEMBER_COLS.EMAIL - 1] && row[MEMBER_COLS.EMAIL - 1].toLowerCase() === userEmail.toLowerCase();
      });
      if (stewardRow) {
        stewardName = `${stewardRow[MEMBER_COLS.FIRST_NAME - 1]} ${stewardRow[MEMBER_COLS.LAST_NAME - 1]}`;
      }
    }

    return grievanceData.filter(function(row, index) {
      if (index === 0) return true; // Keep header
      const assignedSteward = row[GRIEVANCE_COLS.STEWARD - 1];
      return assignedSteward && assignedSteward.includes(stewardName);
    });
  }

  // Members can only see their own grievances
  if (role === 'MEMBER') {
    return grievanceData.filter(function(row, index) {
      if (index === 0) return true; // Keep header
      const memberEmail = row[GRIEVANCE_COLS.MEMBER_EMAIL - 1];
      return memberEmail && memberEmail.toLowerCase() === userEmail.toLowerCase();
    });
  }

  // Viewers see anonymized data
  if (role === 'VIEWER') {
    return grievanceData.map(function(row, index) {
      if (index === 0) return row; // Keep header

      // Anonymize PII
      return row.map(function(cell, colIndex) {
        // Hide names (2,3), email (23)
        if ([2, 3, 23].includes(colIndex)) {
          return '[REDACTED]';
        }
        return cell;
      });
    });
  }

  return [grievanceData[0]]; // Return only header for unknown roles
}
