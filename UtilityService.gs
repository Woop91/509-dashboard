/**
 * ------------------------------------------------------------------------====
 * UTILITY SERVICE - Common Helper Functions
 * ------------------------------------------------------------------------====
 *
 * Centralized utility functions for:
 * - Error handling
 * - Input sanitization
 * - Data validation
 * - HTML escaping
 * - Logging
 *
 * ------------------------------------------------------------------------====
 */

/* --------------------= ERROR HANDLING --------------------= */

/**
 * Standardized error handler with user feedback and logging
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred (e.g., "getMemberList")
 * @param {boolean} showToUser - Whether to show toast notification to user
 * @param {boolean} logToSheet - Whether to log to Diagnostics sheet
 * @returns {null} Always returns null for convenience
 */
function handleError(error, context, showToUser = true, logToSheet = true) {
  const errorMessage = error.message || error.toString();
  const timestamp = new Date();

  // Log to console
  Logger.log(`[ERROR] ${context}: ${errorMessage}`);
  Logger.log(error.stack);

  // Show user-friendly message
  if (showToUser) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `❌ Error in ${context}: ${errorMessage}`,
      'Error',
      10
    );
  }

  // Log to Diagnostics sheet
  if (logToSheet) {
    try {
      logToDiagnostics(context, errorMessage, error.stack, timestamp);
    } catch (e) {
      Logger.log('Failed to log to diagnostics: ' + e.message);
    }
  }

  return null;
}

/**
 * Logs error to Diagnostics sheet for tracking
 * @param {string} context - Function/context name
 * @param {string} errorMessage - Error message
 * @param {string} stackTrace - Stack trace
 * @param {Date} timestamp - When error occurred
 */
function logToDiagnostics(context, errorMessage, stackTrace, timestamp) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const diagnosticsSheet = ss.getSheetByName(SHEETS.DIAGNOSTICS);

  if (!diagnosticsSheet) {
    return; // Sheet doesn't exist yet
  }

  const user = Session.getActiveUser().getEmail();
  const row = [
    timestamp,
    user,
    context,
    errorMessage,
    stackTrace,
    'ERROR'
  ];

  diagnosticsSheet.appendRow(row);
}

/**
 * Wraps a function with simple try-catch error handling
 * Note: Canonical withErrorHandling() is in EnhancedErrorHandling.gs (with full logging and UI)
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context name for error messages
 * @returns {Function} Wrapped function
 */
function withSimpleErrorHandling(fn, context) {
  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      return handleError(error, context);
    }
  };
}

/* --------------------= INPUT SANITIZATION --------------------= */

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} HTML-safe text
 */
function escapeHtml(text) {
  if (text == null || text === '') return '';

  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escapes text for use in HTML attributes
 * @param {string} text - Text to escape
 * @returns {string} Attribute-safe text
 */
function escapeHtmlAttribute(text) {
  if (text == null || text === '') return '';

  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sanitizes email address
 * @param {string} email - Email to validate
 * @returns {string|null} Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
  if (!email) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = String(email).trim().toLowerCase();

  return emailRegex.test(trimmed) ? trimmed : null;
}

/**
 * Sanitizes phone number to (XXX) XXX-XXXX format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone or original if invalid
 */
function sanitizePhone(phone) {
  if (!phone) return '';

  // Remove all non-digits
  const digits = String(phone).replace(/\D/g, '');

  // Format if 10 digits
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone; // Return original if not 10 digits
}

/* --------------------= DATA VALIDATION --------------------= */

/**
 * Validates that a sheet exists
 * @param {string} sheetName - Name of sheet to check
 * @param {boolean} throwError - Whether to throw error if not found
 * @returns {boolean} True if sheet exists
 * @throws {Error} If sheet doesn't exist and throwError is true
 */
function validateSheetExists(sheetName, throwError = false) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet && throwError) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  return sheet !== null;
}

/**
 * Validates array bounds before access
 * @param {Array} array - Array to check
 * @param {number} index - Index to access
 * @param {string} context - Context for error message
 * @returns {boolean} True if access is safe
 * @throws {Error} If index out of bounds
 */
function validateArrayBounds(array, index, context = 'array access') {
  if (!Array.isArray(array)) {
    throw new Error(`${context}: Expected array but got ${typeof array}`);
  }

  if (index < 0 || index >= array.length) {
    throw new Error(`${context}: Index ${index} out of bounds (array length: ${array.length})`);
  }

  return true;
}

/**
 * Safely gets array element with default value
 * @param {Array} array - Array to access
 * @param {number} index - Index to get
 * @param {*} defaultValue - Default if index invalid
 * @returns {*} Array element or default
 */
function safeArrayGet(array, index, defaultValue = null) {
  if (!Array.isArray(array) || index < 0 || index >= array.length) {
    return defaultValue;
  }
  return array[index];
}

/**
 * Validates required fields are present
 * @param {Object} data - Object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @param {string} context - Context for error messages
 * @throws {Error} If any required field is missing
 * Note: Canonical validateRequiredFields() is in EnhancedErrorHandling.gs (returns object instead of throwing)
 */
function validateRequiredFieldsOrThrow(data, requiredFields, context = 'validation') {
  const missing = requiredFields.filter(function(field) {
    return data[field] === null || data[field] === undefined || data[field] === '';
  });

  if (missing.length > 0) {
    throw new Error(`${context}: Missing required fields: ${missing.join(', ')}`);
  }
}

/* --------------------= CONFIGURATION VALIDATION --------------------= */

/**
 * Validates that all required configuration is present and valid
 * @throws {Error} If configuration is invalid
 */
function validateConfiguration() {
  const errors = [];

  // Validate SHEETS configuration
  const requiredSheets = [
    'CONFIG', 'MEMBER_DIR', 'GRIEVANCE_LOG', 'DASHBOARD'
  ];

  requiredSheets.forEach(function(key) {
    if (!SHEETS[key]) {
      errors.push(`SHEETS.${key} is not defined`);
    }
  });

  // Validate MEMBER_COLS configuration
  const requiredMemberCols = [
    'MEMBER_ID', 'FIRST_NAME', 'LAST_NAME', 'EMAIL'
  ];

  requiredMemberCols.forEach(function(key) {
    if (!MEMBER_COLS[key]) {
      errors.push(`MEMBER_COLS.${key} is not defined`);
    }
  });

  // Validate GRIEVANCE_COLS configuration
  const requiredGrievanceCols = [
    'GRIEVANCE_ID', 'MEMBER_ID', 'STATUS', 'INCIDENT_DATE'
  ];

  requiredGrievanceCols.forEach(function(key) {
    if (!GRIEVANCE_COLS[key]) {
      errors.push(`GRIEVANCE_COLS.${key} is not defined`);
    }
  });

  // Validate grievance form configuration if present
  // NOTE: This is a warning, not an error - forms can be configured later
  if (typeof GRIEVANCE_FORM_CONFIG !== 'undefined') {
    if (GRIEVANCE_FORM_CONFIG.FORM_URL.includes('YOUR_FORM_ID')) {
      // Log warning but don't block - form URLs can be added later via Config tab
      Logger.log('INFO: Grievance Form URL not yet configured. Add your form URL to the Config tab when ready.');
    }
  }

  if (errors.length > 0) {
    throw new Error('Configuration validation failed:\n' + errors.join('\n'));
  }

  return true;
}

/**
 * Runs configuration validation on spreadsheet open
 * Shows user-friendly error if configuration invalid
 */
function validateConfigurationOnOpen() {
  try {
    validateConfiguration();
    return true;
  } catch (error) {
    // Log the error for debugging
    Logger.log('Configuration validation error: ' + error.message);

    // Try to show UI alert, but gracefully handle contexts where UI isn't available
    // (e.g., when called from time-driven triggers or CREATE_509_DASHBOARD)
    try {
      SpreadsheetApp.getUi().alert(
        '⚠️ Configuration Error',
        'The dashboard configuration has errors:\n\n' + error.message +
        '\n\nPlease contact the administrator.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } catch (uiError) {
      // UI not available in this context - just log the error
      Logger.log('validateConfigurationOnOpen: UI not available, cannot show alert. Context: ' + uiError.message);
    }
    return false;
  }
}

/* --------------------= DATA HELPERS --------------------= */

/**
 * Safely gets a sheet by name with error handling
 * @param {string} sheetName - Name of sheet
 * @param {boolean} throwIfMissing - Whether to throw if not found
 * @returns {GoogleAppsScript.Spreadsheet.Sheet|null} Sheet or null
 */
function getSheetSafely(sheetName, throwIfMissing = false) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet && throwIfMissing) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    return sheet;
  } catch (error) {
    handleError(error, 'getSheetSafely');
    return null;
  }
}

/**
 * Gets data range values with error handling
 * @param {string} sheetName - Name of sheet
 * @returns {Array<Array>|null} Data array or null on error
 */
function getSheetDataSafely(sheetName) {
  try {
    const sheet = getSheetSafely(sheetName, true);
    if (!sheet) return null;

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return []; // No data, just headers

    return sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  } catch (error) {
    handleError(error, `getSheetDataSafely(${sheetName})`);
    return null;
  }
}

/* --------------------= PERFORMANCE HELPERS --------------------= */

/**
 * Simple in-memory cache for expensive operations
 */
const SimpleCache = {
  _cache: {},
  _timestamps: {},
  _ttl: 5 * 60 * 1000, // 5 minutes default TTL

  /**
   * Gets cached value
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  get: function(key) {
    const now = Date.now();
    if (this._cache[key] && (now - this._timestamps[key]) < this._ttl) {
      return this._cache[key];
    }
    return null;
  },

  /**
   * Sets cached value
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in ms (optional)
   */
  set: function(key, value, ttl) {
    this._cache[key] = value;
    this._timestamps[key] = Date.now();
    if (ttl) {
      // Custom TTL not implemented in this simple version
    }
  },

  /**
   * Clears cache
   */
  clear: function() {
    this._cache = {};
    this._timestamps = {};
  },

  /**
   * Removes specific key
   * @param {string} key - Key to remove
   */
  remove: function(key) {
    delete this._cache[key];
    delete this._timestamps[key];
  }
};

/**
 * Wraps a function with caching
 * @param {Function} fn - Function to cache
 * @param {string} cacheKey - Key for cache
 * @param {number} ttl - Time to live in ms
 * @returns {Function} Cached function
 */
function withCache(fn, cacheKey, ttl = 5 * 60 * 1000) {
  return function(...args) {
    const key = cacheKey + JSON.stringify(args);
    const cached = SimpleCache.get(key);

    if (cached !== null) {
      return cached;
    }

    const result = fn.apply(this, args);
    SimpleCache.set(key, result, ttl);
    return result;
  };
}

/* --------------------= LOGGING HELPERS --------------------= */

/**
 * Logs info message to diagnostics
 * @param {string} context - Context/function name
 * @param {string} message - Message to log
 */
function logInfo(context, message) {
  Logger.log(`[INFO] ${context}: ${message}`);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const diagnosticsSheet = ss.getSheetByName(SHEETS.DIAGNOSTICS);

    if (diagnosticsSheet) {
      diagnosticsSheet.appendRow([
        new Date(),
        Session.getActiveUser().getEmail(),
        context,
        message,
        '',
        'INFO'
      ]);
    }
  } catch (e) {
    // Fail silently for logging
  }
}

/**
 * Logs warning message
 * @param {string} context - Context/function name
 * @param {string} message - Warning message
 */
function logWarning(context, message) {
  Logger.log(`[WARNING] ${context}: ${message}`);
}

/* --------------------= ORG CONFIGURATION HELPERS --------------------= */

/**
 * Gets organization configuration value from Config sheet with fallback to ORG_DEFAULTS
 *
 * Config sheet values take precedence over ORG_DEFAULTS.
 * This allows runtime customization without code changes.
 *
 * @param {string} key - Configuration key (e.g., 'ORG_NAME', 'CONTRACT_ARTICLE_GRIEVANCE')
 * @returns {string} Configuration value
 *
 * @example
 * const orgName = getOrgConfig('ORG_NAME'); // Returns value from Config or "SEIU Local 509"
 * const article = getOrgConfig('CONTRACT_ARTICLE_GRIEVANCE'); // Returns "Article 23A" or custom
 */
function getOrgConfig(key) {
  // Check cache first
  const cacheKey = 'ORG_CONFIG_' + key;
  const cached = SimpleCache.get(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Map key to Config column
  const keyToColMap = {
    'ORG_NAME': CONFIG_COLS.ORG_NAME,
    'LOCAL_NUMBER': CONFIG_COLS.LOCAL_NUMBER,
    'MAIN_ADDRESS': CONFIG_COLS.MAIN_ADDRESS,
    'MAIN_PHONE': CONFIG_COLS.MAIN_PHONE,
    'UNION_PARENT': CONFIG_COLS.UNION_PARENT,
    'STATE_REGION': CONFIG_COLS.STATE_REGION,
    'ORG_WEBSITE': CONFIG_COLS.ORG_WEBSITE,
    'CONTRACT_ARTICLE_GRIEVANCE': CONFIG_COLS.CONTRACT_ARTICLE_GRIEVANCE,
    'CONTRACT_ARTICLE_DISCIPLINE': CONFIG_COLS.CONTRACT_ARTICLE_DISCIPLINE,
    'CONTRACT_ARTICLE_WORKLOAD': CONFIG_COLS.CONTRACT_ARTICLE_WORKLOAD,
    'CONTRACT_NAME': CONFIG_COLS.CONTRACT_NAME,
    'GRIEVANCE_EMAIL': CONFIG_COLS.ADMIN_EMAILS, // Use first admin email as grievance email
    'FILING_DEADLINE_DAYS': CONFIG_COLS.FILING_DEADLINE_DAYS,
    'STEP1_RESPONSE_DAYS': CONFIG_COLS.STEP1_RESPONSE_DAYS,
    'STEP2_APPEAL_DAYS': CONFIG_COLS.STEP2_APPEAL_DAYS,
    'STEP2_RESPONSE_DAYS': CONFIG_COLS.STEP2_RESPONSE_DAYS
  };

  const col = keyToColMap[key];
  let value = null;

  // Try to get from Config sheet
  if (col) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const configSheet = ss.getSheetByName(SHEETS.CONFIG);

      if (configSheet) {
        const lastRow = configSheet.getLastRow();
        if (lastRow >= 2) {
          const cellValue = configSheet.getRange(2, col).getValue();
          if (cellValue && String(cellValue).trim() !== '') {
            value = String(cellValue).trim();
          }
        }
      }
    } catch (error) {
      Logger.log('getOrgConfig error reading Config sheet: ' + error.message);
    }
  }

  // Fallback to ORG_DEFAULTS
  if (value === null && ORG_DEFAULTS[key] !== undefined) {
    value = String(ORG_DEFAULTS[key]);
  }

  // Final fallback
  if (value === null) {
    value = '';
    Logger.log('getOrgConfig: Unknown key or no default for: ' + key);
  }

  // Cache the result
  SimpleCache.set(cacheKey, value);

  return value;
}

/**
 * Gets all organization config as an object
 * Useful for passing to HTML templates
 *
 * @returns {Object} Organization configuration object
 */
function getAllOrgConfig() {
  const cacheKey = 'ORG_CONFIG_ALL';
  const cached = SimpleCache.get(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const config = {
    orgName: getOrgConfig('ORG_NAME'),
    localNumber: getOrgConfig('LOCAL_NUMBER'),
    unionParent: getOrgConfig('UNION_PARENT'),
    stateRegion: getOrgConfig('STATE_REGION'),
    orgWebsite: getOrgConfig('ORG_WEBSITE'),
    mainAddress: getOrgConfig('MAIN_ADDRESS'),
    mainPhone: getOrgConfig('MAIN_PHONE'),
    grievanceEmail: getOrgConfig('GRIEVANCE_EMAIL'),
    contractName: getOrgConfig('CONTRACT_NAME'),
    articleGrievance: getOrgConfig('CONTRACT_ARTICLE_GRIEVANCE'),
    articleDiscipline: getOrgConfig('CONTRACT_ARTICLE_DISCIPLINE'),
    articleWorkload: getOrgConfig('CONTRACT_ARTICLE_WORKLOAD'),
    filingDeadlineDays: parseInt(getOrgConfig('FILING_DEADLINE_DAYS')) || 21,
    step1ResponseDays: parseInt(getOrgConfig('STEP1_RESPONSE_DAYS')) || 30,
    step2AppealDays: parseInt(getOrgConfig('STEP2_APPEAL_DAYS')) || 10,
    step2ResponseDays: parseInt(getOrgConfig('STEP2_RESPONSE_DAYS')) || 30
  };

  SimpleCache.set(cacheKey, config);
  return config;
}

/**
 * Clears org config cache (call when Config sheet is updated)
 */
function clearOrgConfigCache() {
  // Clear all org config cache keys
  const keys = [
    'ORG_CONFIG_ALL',
    'ORG_CONFIG_ORG_NAME',
    'ORG_CONFIG_LOCAL_NUMBER',
    'ORG_CONFIG_UNION_PARENT',
    'ORG_CONFIG_STATE_REGION',
    'ORG_CONFIG_ORG_WEBSITE',
    'ORG_CONFIG_MAIN_ADDRESS',
    'ORG_CONFIG_MAIN_PHONE',
    'ORG_CONFIG_GRIEVANCE_EMAIL',
    'ORG_CONFIG_CONTRACT_NAME',
    'ORG_CONFIG_CONTRACT_ARTICLE_GRIEVANCE',
    'ORG_CONFIG_CONTRACT_ARTICLE_DISCIPLINE',
    'ORG_CONFIG_CONTRACT_ARTICLE_WORKLOAD',
    'ORG_CONFIG_FILING_DEADLINE_DAYS',
    'ORG_CONFIG_STEP1_RESPONSE_DAYS',
    'ORG_CONFIG_STEP2_APPEAL_DAYS',
    'ORG_CONFIG_STEP2_RESPONSE_DAYS'
  ];

  keys.forEach(function(key) {
    SimpleCache.remove(key);
  });

  Logger.log('Org config cache cleared');
}

/* --------------------= SHEET CLEANUP UTILITIES --------------------= */

/**
 * Removes unused columns from all sheets dynamically
 * Uses sheet.getLastColumn() to detect actual content and removes empty columns beyond that
 * Call this function to clean up existing sheets that have extra columns
 */
function cleanAllSheetColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  let cleaned = 0;
  let skipped = 0;

  sheets.forEach(function(sheet) {
    const sheetName = sheet.getName();
    const lastCol = sheet.getLastColumn();
    const totalCols = sheet.getMaxColumns();

    // Only clean if there's content and extra columns exist
    if (lastCol > 0 && totalCols > lastCol) {
      try {
        sheet.deleteColumns(lastCol + 1, totalCols - lastCol);
        Logger.log('Cleaned ' + sheetName + ': removed ' + (totalCols - lastCol) + ' columns');
        cleaned++;
      } catch (e) {
        Logger.log('Error cleaning ' + sheetName + ': ' + e.message);
      }
    } else {
      skipped++;
    }
  });

  const message = '✅ Sheet cleanup complete!\n\n' +
    'Cleaned: ' + cleaned + ' sheets\n' +
    'Already clean: ' + skipped + ' sheets';

  SpreadsheetApp.getUi().alert('Column Cleanup', message, SpreadsheetApp.getUi().ButtonSet.OK);

  return { cleaned: cleaned, skipped: skipped };
}

/**
 * Cleans unused columns from a specific sheet
 * Uses dynamic detection via getLastColumn() - no hardcoded column counts
 * @param {string} sheetName - Name of the sheet to clean
 * @param {GoogleAppsScript.Spreadsheet.Sheet} [sheetObj] - Optional sheet object (avoids extra lookup)
 */
function cleanSheetColumns(sheetName, sheetObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = sheetObj || ss.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log('Sheet not found: ' + sheetName);
    return false;
  }

  const lastCol = sheet.getLastColumn();
  const totalCols = sheet.getMaxColumns();

  if (lastCol > 0 && totalCols > lastCol) {
    sheet.deleteColumns(lastCol + 1, totalCols - lastCol);
    Logger.log('Cleaned ' + sheetName + ': removed ' + (totalCols - lastCol) + ' columns');
    return true;
  }

  return false;
}

/**
 * Populates the Config sheet with default seed values for dropdown lists
 * Call this before seeding member or grievance data
 */
function populateConfigDefaults() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = ss.getSheetByName(SHEETS.CONFIG);

  if (!configSheet) {
    configSheet = ss.insertSheet(SHEETS.CONFIG);
  }

  // Row 1: Category headers
  const categoryHeaders = [
    'Employment Info', '', '', '', '',           // A-E
    'Supervision', '',                           // F-G
    'Steward Info', '',                          // H-I
    'Grievance Settings', '', '', '', '',        // J-N
    'Links & Coordinators', '', '',              // O-Q
    'Notifications', '', '',                     // R-T
    'Organization', '', '', ''                   // U-X
  ];

  // Row 2: Column headers
  const columnHeaders = [
    'Job Titles', 'Office Locations', 'Units', 'Office Days', 'Yes/No',  // A-E
    'Supervisors', 'Managers',                    // F-G
    'Stewards', 'Committees',                     // H-I
    'Grievance Status', 'Grievance Step', 'Issue Category', 'Articles Violated', 'Comm Methods', // J-N
    'Coordinators', 'Grievance Form URL', 'Contact Form URL', // O-Q
    'Admin Emails', 'Alert Days', 'Notification Recipients',  // R-T
    'Org Name', 'Local Number', 'Main Address', 'Main Phone'  // U-X
  ];

  // Default values for each column (starting from row 3)
  const defaultData = {
    // A: Job Titles
    1: ['Social Worker I', 'Social Worker II', 'Social Worker III', 'Case Manager', 'Program Coordinator', 'Administrative Assistant', 'Supervisor', 'Manager', 'Director', 'Analyst'],
    // B: Office Locations
    2: ['Boston Office', 'Cambridge Office', 'Springfield Office', 'Worcester Office', 'Remote'],
    // C: Units
    3: ['Unit 8', 'Unit 10'],
    // D: Office Days
    4: ['Monday-Friday', 'Mon/Wed/Fri', 'Tue/Thu', 'Flexible', 'Remote Only'],
    // E: Yes/No
    5: ['Yes', 'No'],
    // F: Supervisors
    6: ['Jane Smith', 'John Doe', 'Maria Garcia', 'Robert Johnson', 'Sarah Williams'],
    // G: Managers
    7: ['Michael Brown', 'Linda Davis', 'James Wilson', 'Patricia Martinez'],
    // H: Stewards
    8: ['Alex Steward', 'Chris Union', 'Pat Representative', 'Jordan Advocate', 'Taylor Helper'],
    // I: Committees
    9: ['Grievance Committee', 'Safety Committee', 'Bargaining Committee', 'Social Committee', 'Education Committee'],
    // J: Grievance Status
    10: ['Open', 'In Progress', 'Pending Response', 'Appealed', 'Resolved - Won', 'Resolved - Lost', 'Resolved - Settled', 'Withdrawn', 'Closed'],
    // K: Grievance Step
    11: ['Pre-Filing', 'Step I - Filed', 'Step I - Awaiting Decision', 'Step II - Appeal Filed', 'Step II - Awaiting Decision', 'Step III - Arbitration', 'Resolved'],
    // L: Issue Category
    12: ['Discipline', 'Discharge', 'Contract Violation', 'Working Conditions', 'Harassment', 'Discrimination', 'Safety', 'Scheduling', 'Pay/Benefits', 'Other'],
    // M: Articles Violated
    13: ['Article 12 - Discipline', 'Article 15 - Workload', 'Article 23A - Grievance Procedure', 'Article 8 - Hours of Work', 'Article 10 - Leaves', 'Article 5 - Non-Discrimination'],
    // N: Communication Methods
    14: ['Email', 'Phone', 'Text', 'In Person', 'Video Call']
  };

  // Set category headers (row 1)
  if (categoryHeaders.length > 0) {
    configSheet.getRange(1, 1, 1, categoryHeaders.length).setValues([categoryHeaders]);
    configSheet.getRange(1, 1, 1, categoryHeaders.length)
      .setFontWeight('bold')
      .setBackground('#1a73e8')
      .setFontColor('#ffffff');
  }

  // Set column headers (row 2)
  if (columnHeaders.length > 0) {
    configSheet.getRange(2, 1, 1, columnHeaders.length).setValues([columnHeaders]);
    configSheet.getRange(2, 1, 1, columnHeaders.length)
      .setFontWeight('bold')
      .setBackground('#e8f0fe');
  }

  // Populate default values for each column
  for (const colIndex in defaultData) {
    const col = parseInt(colIndex);
    const values = defaultData[col];
    if (values && values.length > 0) {
      const valueArray = values.map(function(v) { return [v]; });
      configSheet.getRange(3, col, values.length, 1).setValues(valueArray);
    }
  }

  // Freeze header rows
  configSheet.setFrozenRows(2);

  // Auto-resize columns
  configSheet.autoResizeColumns(1, 24);

  SpreadsheetApp.getUi().alert(
    '✅ Config Defaults Populated',
    'The Config sheet has been populated with default values for:\n\n' +
    '• Job Titles (10 values)\n' +
    '• Office Locations (5 values)\n' +
    '• Units (2 values)\n' +
    '• Supervisors (5 values)\n' +
    '• Managers (4 values)\n' +
    '• Stewards (5 values)\n' +
    '• Grievance Statuses & Steps\n' +
    '• Issue Categories & Articles\n\n' +
    'You can now seed member and grievance data!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  return true;
}

/* --------------------= BIDIRECTIONAL CONFIG SYNC --------------------= */

/**
 * Mapping of Member Directory columns to Config columns
 * Key: MEMBER_COLS column number, Value: CONFIG_COLS column number
 */
const MEMBER_TO_CONFIG_MAP = {
  4: 1,   // Job Title (D) → Job Titles (A)
  5: 2,   // Work Location (E) → Office Locations (B)
  6: 3,   // Unit (F) → Units (C)
  7: 4,   // Office Days (G) → Office Days (D)
  12: 6,  // Supervisor (L) → Supervisors (F)
  13: 7,  // Manager (M) → Managers (G)
  16: 8,  // Assigned Steward (P) → Stewards (H)
  24: 32  // Home Town (X) → Home Towns (AF)
};

/**
 * Mapping of Grievance Log columns to Config columns
 * Key: GRIEVANCE_COLS column number, Value: CONFIG_COLS column number
 */
const GRIEVANCE_TO_CONFIG_MAP = {
  5: 12,  // Issue Category (E) → Issue Category (L)
  6: 13,  // Articles Violated (F) → Articles Violated (M)
  9: 10,  // Status (I) → Grievance Status (J)
  10: 11, // Current Step (J) → Grievance Step (K)
  11: 8,  // Steward (K) → Stewards (H)
  27: 3,  // Unit (AA) → Units (C)
  28: 2   // Location (AB) → Office Locations (B)
};

/**
 * onEdit trigger handler for bidirectional Config sync
 * Automatically adds new values to Config when entered in Member Directory or Grievance Log
 * @param {Object} e - The edit event object
 */
function onEditSyncToConfig(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();
  const col = e.range.getColumn();
  const row = e.range.getRow();
  const newValue = e.value;

  // Skip header rows and empty values
  if (row <= 1 || !newValue || newValue.toString().trim() === '') return;

  let configCol = null;

  // Check if this is a Member Directory edit
  if (sheetName === SHEETS.MEMBER_DIR && MEMBER_TO_CONFIG_MAP[col]) {
    configCol = MEMBER_TO_CONFIG_MAP[col];
  }
  // Check if this is a Grievance Log edit
  else if (sheetName === SHEETS.GRIEVANCE_LOG && GRIEVANCE_TO_CONFIG_MAP[col]) {
    configCol = GRIEVANCE_TO_CONFIG_MAP[col];
  }

  // If not a synced column, exit
  if (!configCol) return;

  // Add the value to Config if it doesn't exist
  addValueToConfigIfNew(newValue, configCol);
}

/**
 * Adds a value to the Config sheet if it doesn't already exist
 * @param {string} value - The value to add
 * @param {number} configCol - The Config column number (1-based)
 * @returns {boolean} True if value was added, false if it already existed
 */
function addValueToConfigIfNew(value, configCol) {
  if (!value || value.toString().trim() === '') return false;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);

  if (!configSheet) {
    Logger.log('Config sheet not found for sync');
    return false;
  }

  const trimmedValue = value.toString().trim();

  // Get existing values in the Config column (starting from row 3, after headers)
  const lastRow = Math.max(configSheet.getLastRow(), 3);
  const existingRange = configSheet.getRange(3, configCol, lastRow - 2, 1);
  const existingValues = existingRange.getValues().flat().map(function(v) { return v.toString().trim().toLowerCase(); });

  // Check if value already exists (case-insensitive)
  if (existingValues.includes(trimmedValue.toLowerCase())) {
    return false; // Value already exists
  }

  // Find the first empty row in this column
  let insertRow = 3;
  for (let i = 0; i < existingValues.length; i++) {
    if (existingValues[i] !== '') {
      insertRow = i + 4; // +3 for header offset, +1 for next row
    }
  }

  // Insert the new value
  configSheet.getRange(insertRow, configCol).setValue(trimmedValue);

  Logger.log('Config sync: Added "' + trimmedValue + '" to Config column ' + configCol);
  return true;
}

/**
 * Syncs all existing values from Member Directory and Grievance Log to Config
 * Run this once to populate Config from existing data
 */
function syncAllDataToConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);

  if (!configSheet) {
    SpreadsheetApp.getUi().alert('Error', 'Config sheet not found!', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  let addedCount = 0;

  // Sync from Member Directory
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  if (memberSheet && memberSheet.getLastRow() > 1) {
    const memberData = memberSheet.getDataRange().getValues();

    for (let row = 1; row < memberData.length; row++) { // Skip header
      for (const memberCol in MEMBER_TO_CONFIG_MAP) {
        const value = memberData[row][parseInt(memberCol) - 1];
        if (value && addValueToConfigIfNew(value, MEMBER_TO_CONFIG_MAP[memberCol])) {
          addedCount++;
        }
      }
    }
  }

  // Sync from Grievance Log
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (grievanceSheet && grievanceSheet.getLastRow() > 1) {
    const grievanceData = grievanceSheet.getDataRange().getValues();

    for (let row = 1; row < grievanceData.length; row++) { // Skip header
      for (const gCol in GRIEVANCE_TO_CONFIG_MAP) {
        const value = grievanceData[row][parseInt(gCol) - 1];
        if (value && addValueToConfigIfNew(value, GRIEVANCE_TO_CONFIG_MAP[gCol])) {
          addedCount++;
        }
      }
    }
  }

  SpreadsheetApp.getUi().alert(
    '✅ Config Sync Complete',
    'Synced data from Member Directory and Grievance Log to Config.\n\n' +
    addedCount + ' new values were added to Config.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Installs the Config sync trigger
 * This should be called once during setup
 */
function installConfigSyncTrigger() {
  // Remove existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'onEditSyncToConfig') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new onEdit trigger
  ScriptApp.newTrigger('onEditSyncToConfig')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();

  Logger.log('Config sync trigger installed');
  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Config sync trigger installed', 'Setup Complete', 3);
}

/**
 * Shows help information about Config sync
 */
function showConfigSyncHelp() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
      h2 { color: #1a73e8; }
      h3 { color: #5f6368; margin-top: 20px; }
      ul { padding-left: 20px; }
      li { margin: 8px 0; }
      .highlight { background: #e8f0fe; padding: 10px; border-radius: 5px; margin: 10px 0; }
    </style>
    <h2>🔄 Bidirectional Config Sync</h2>

    <h3>How It Works</h3>
    <p>Config Sync automatically keeps your Config sheet and data sheets in sync:</p>

    <div class="highlight">
      <strong>Member Directory / Grievance Log → Config</strong><br>
      When you enter a NEW value (e.g., a new location or job title), it's automatically added to the Config dropdown list.
    </div>

    <div class="highlight">
      <strong>Config → Member Directory / Grievance Log</strong><br>
      Values in Config appear as dropdown options in your data sheets.
    </div>

    <h3>Synced Fields</h3>
    <ul>
      <li><strong>Member Directory:</strong> Job Title, Work Location, Unit, Office Days, Supervisor, Manager, Assigned Steward, Home Town</li>
      <li><strong>Grievance Log:</strong> Issue Category, Articles Violated, Status, Current Step, Steward, Unit, Location</li>
    </ul>

    <h3>Setup</h3>
    <ol>
      <li><strong>One-Time Sync:</strong> Run "Sync Data → Config" to populate Config from existing data</li>
      <li><strong>Auto-Sync:</strong> Run "Install Auto-Sync Trigger" so new values are automatically added</li>
    </ol>

    <h3>Notes</h3>
    <ul>
      <li>Duplicate values are automatically ignored (case-insensitive)</li>
      <li>Values are added to Config immediately when entered</li>
      <li>The trigger only fires on edits to synced columns</li>
    </ul>
  `)
  .setWidth(500)
  .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, '🔄 Config Sync Help');
}
