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
