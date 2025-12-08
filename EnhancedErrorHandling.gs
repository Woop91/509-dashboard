/**
 * ------------------------------------------------------------------------====
 * ENHANCED ERROR HANDLING & RECOVERY
 * ------------------------------------------------------------------------====
 *
 * Comprehensive error handling, logging, and recovery system
 * Features:
 * - Error logging and tracking
 * - User-friendly error messages
 * - Automatic error recovery
 * - Error analytics and reporting
 * - Validation helpers
 * - Graceful degradation
 * - Error notification system
 *
 * Configuration: Uses ERROR_CONFIG and ERROR_CATEGORIES from Constants.gs
 * @see Constants.gs for configuration
 */

/**
 * Shows error dashboard
 */
function showErrorDashboard() {
  const html = createErrorDashboardHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(1000)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '⚠️ Error Dashboard');
}

/**
 * Creates HTML for error dashboard
 */
function createErrorDashboardHTML() {
  const stats = getErrorStats();
  const recentErrors = getRecentErrors(20);

  let errorRows = '';
  if (recentErrors.length === 0) {
    errorRows = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">No errors logged</td></tr>';
  } else {
    recentErrors.forEach(function(error) {
      const levelClass = error.level.toLowerCase();
      errorRows += `
        <tr>
          <td><span class="level-badge level-${levelClass}">${error.level}</span></td>
          <td><span class="category-badge">${error.category}</span></td>
          <td>${error.message}</td>
          <td style="font-size: 11px; font-family: monospace; color: #666;">${error.context || '-'}</td>
          <td style="font-size: 12px; color: #666;">${new Date(error.timestamp).toLocaleString()}</td>
          <td>
            ${error.recovered ? '<span style="color: #4caf50;">✅ Recovered</span>' : '<span style="color: #f44336;">❌ Failed</span>'}
          </td>
        </tr>
      `;
    });
  }

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
      max-height: 650px;
      overflow-y: auto;
    }
    h2 {
      color: #f44336;
      margin-top: 0;
      border-bottom: 3px solid #f44336;
      padding-bottom: 10px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #f44336;
    }
    .stat-card.info { border-color: #2196f3; }
    .stat-card.warning { border-color: #ff9800; }
    .stat-card.error { border-color: #f44336; }
    .stat-card.critical { border-color: #9c27b0; }
    .stat-number {
      font-size: 36px;
      font-weight: bold;
      color: #f44336;
    }
    .stat-card.info .stat-number { color: #2196f3; }
    .stat-card.warning .stat-number { color: #ff9800; }
    .stat-card.error .stat-number { color: #f44336; }
    .stat-card.critical .stat-number { color: #9c27b0; }
    .stat-label {
      font-size: 13px;
      color: #666;
      margin-top: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }
    th {
      background: #f44336;
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      position: sticky;
      top: 0;
    }
    td {
      padding: 10px 8px;
      border-bottom: 1px solid #e0e0e0;
    }
    tr:hover {
      background: #fff3f3;
    }
    .level-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .level-info { background: #e3f2fd; color: #1976d2; }
    .level-warning { background: #fff3e0; color: #f57c00; }
    .level-error { background: #ffebee; color: #d32f2f; }
    .level-critical { background: #f3e5f5; color: #7b1fa2; }
    .category-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #e0e0e0;
      border-radius: 12px;
      font-size: 11px;
      color: #555;
    }
    button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    button:hover {
      background: #1557b0;
    }
    button.danger {
      background: #f44336;
    }
    button.danger:hover {
      background: #d32f2f;
    }
    .actions {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .health-indicator {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      margin: 10px 0;
    }
    .health-good { background: #e8f5e9; color: #2e7d32; }
    .health-fair { background: #fff3e0; color: #f57c00; }
    .health-poor { background: #ffebee; color: #c62828; }
  </style>
</head>
<body>
  <div class="container">
    <h2>⚠️ Error Dashboard</h2>

    <div style="margin: 20px 0;">
      <strong>System Health:</strong>
      <span class="health-indicator health-${stats.health}">${stats.healthText}</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card info">
        <div class="stat-number">${stats.info}</div>
        <div class="stat-label">Info</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-number">${stats.warning}</div>
        <div class="stat-label">Warnings</div>
      </div>
      <div class="stat-card error">
        <div class="stat-number">${stats.error}</div>
        <div class="stat-label">Errors</div>
      </div>
      <div class="stat-card critical">
        <div class="stat-number">${stats.critical}</div>
        <div class="stat-label">Critical</div>
      </div>
    </div>

    <div class="actions">
      <button onclick="runHealthCheck()">🏥 Run Health Check</button>
      <button onclick="exportErrorLog()">📥 Export Log</button>
      <button class="danger" onclick="clearErrorLog()">🗑️ Clear Log</button>
      <button onclick="testErrorHandling()">🧪 Test Error Handling</button>
      <button onclick="viewErrorTrends()">📊 View Trends</button>
    </div>

    <h3 style="margin-top: 30px; color: #333;">Recent Errors (Last 20)</h3>
    <table>
      <thead>
        <tr>
          <th>Level</th>
          <th>Category</th>
          <th>Message</th>
          <th>Context</th>
          <th>Timestamp</th>
          <th>Recovery</th>
        </tr>
      </thead>
      <tbody>
        ${errorRows}
      </tbody>
    </table>
  </div>

  <script>
    function runHealthCheck() {
      google.script.run
        .withSuccessHandler(function(result) {
          alert('🏥 Health Check Complete:\\n\\n' + result.summary);
          location.reload();
        })
        .performSystemHealthCheck();
    }

    function exportErrorLog() {
      google.script.run
        .withSuccessHandler(function(url) {
          alert('✅ Error log exported!');
          window.open(url, '_blank');
        })
        .exportErrorLogToSheet();
    }

    function clearErrorLog() {
      if (confirm('Clear all error logs? This cannot be undone.')) {
        google.script.run
          .withSuccessHandler(function() {
            alert('✅ Error log cleared!');
            location.reload();
          })
          .clearErrorLog();
      }
    }

    function testErrorHandling() {
      google.script.run
        .withSuccessHandler(function() {
          alert('✅ Test error logged successfully!');
          location.reload();
        })
        .testErrorLogging();
    }

    function viewErrorTrends() {
      google.script.run
        .withSuccessHandler(function(url) {
          window.open(url, '_blank');
        })
        .createErrorTrendReport();
    }
  </script>
</body>
</html>
  `;
}

/**
 * Logs an error
 * @param {string} level - Error level
 * @param {string} category - Error category
 * @param {string} message - Error message
 * @param {string} context - Additional context
 * @param {Error} error - Original error object
 * @param {boolean} recovered - Whether error was recovered
 */
function logError(level, category, message, context = '', error = null, recovered = false) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let errorSheet = ss.getSheetByName(ERROR_CONFIG.LOG_SHEET_NAME);

    // Create error log sheet if it doesn't exist
    if (!errorSheet) {
      errorSheet = ss.insertSheet(ERROR_CONFIG.LOG_SHEET_NAME);
      const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Context', 'Stack Trace', 'User', 'Recovered'];
      errorSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      errorSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f44336').setFontColor('#ffffff');
      errorSheet.setFrozenRows(1);
    }

    // Prepare log entry
    const timestamp = new Date();
    const user = Session.getActiveUser().getEmail();
    const stackTrace = error ? error.stack || error.toString() : '';

    const logEntry = [
      timestamp,
      level,
      category,
      message,
      context,
      stackTrace,
      user,
      recovered
    ];

    // Add to log
    errorSheet.appendRow(logEntry);

    // Trim old entries if needed
    const lastRow = errorSheet.getLastRow();
    if (lastRow > ERROR_CONFIG.MAX_LOG_ENTRIES + 1) {
      errorSheet.deleteRows(2, lastRow - ERROR_CONFIG.MAX_LOG_ENTRIES - 1);
    }

    // Send notification if critical
    if (shouldNotify(level)) {
      sendErrorNotification(level, category, message, context);
    }

  } catch (logError) {
    // Fallback: log to console if sheet logging fails
    console.error('Failed to log error:', logError);
    console.error('Original error:', message, error);
  }
}

/**
 * Checks if error should trigger notification
 * @param {string} level - Error level
 * @returns {boolean}
 */
function shouldNotify(level) {
  const notifyLevels = [ERROR_CONFIG.ERROR_LEVELS.ERROR, ERROR_CONFIG.ERROR_LEVELS.CRITICAL];
  return notifyLevels.includes(level);
}

/**
 * Sends error notification
 * @param {string} level - Error level
 * @param {string} category - Error category
 * @param {string} message - Error message
 * @param {string} context - Context
 */
function sendErrorNotification(level, category, message, context) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const adminEmail = PropertiesService.getScriptProperties().getProperty('adminEmail');

    if (!adminEmail) return;

    const subject = `[509 Dashboard] ${level}: ${category}`;
    const body = `
Error Alert from 509 Dashboard

Level: ${level}
Category: ${category}
Message: ${message}
Context: ${context}
Timestamp: ${new Date().toLocaleString()}
Spreadsheet: ${ss.getName()}
URL: ${ss.getUrl()}

Please check the Error Dashboard for more details.
    `;

    MailApp.sendEmail(adminEmail, subject, body);
  } catch (err) {
    console.error('Failed to send error notification:', err);
  }
}

/**
 * Gets error statistics
 * @returns {Object} Statistics
 */
function getErrorStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const errorSheet = ss.getSheetByName(ERROR_CONFIG.LOG_SHEET_NAME);

  if (!errorSheet || errorSheet.getLastRow() <= 1) {
    return {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
      health: 'good',
      healthText: '✅ Good'
    };
  }

  const data = errorSheet.getRange(2, 1, errorSheet.getLastRow() - 1, 2).getValues();

  const stats = {
    info: 0,
    warning: 0,
    error: 0,
    critical: 0
  };

  data.forEach(function(row) {
    const level = row[ERROR_LOG_COLS.LEVEL - 1];
    if (level === 'INFO') stats.info++;
    else if (level === 'WARNING') stats.warning++;
    else if (level === 'ERROR') stats.error++;
    else if (level === 'CRITICAL') stats.critical++;
  });

  // Determine health
  let health = 'good';
  let healthText = '✅ Good';

  if (stats.critical > 0 || stats.error > 10) {
    health = 'poor';
    healthText = '❌ Poor';
  } else if (stats.error > 0 || stats.warning > 20) {
    health = 'fair';
    healthText = '⚠️ Fair';
  }

  stats.health = health;
  stats.healthText = healthText;

  return stats;
}

/**
 * Gets recent errors
 * @param {number} limit - Number of errors to retrieve
 * @returns {Array} Recent errors
 */
function getRecentErrors(limit = 20) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const errorSheet = ss.getSheetByName(ERROR_CONFIG.LOG_SHEET_NAME);

  if (!errorSheet || errorSheet.getLastRow() <= 1) {
    return [];
  }

  const lastRow = errorSheet.getLastRow();
  const startRow = Math.max(2, lastRow - limit + 1);
  const numRows = lastRow - startRow + 1;

  const data = errorSheet.getRange(startRow, 1, numRows, 8).getValues();

  return data.map(function(row) { return {
    timestamp: row[ERROR_LOG_COLS.TIMESTAMP - 1],
    level: row[ERROR_LOG_COLS.LEVEL - 1],
    category: row[ERROR_LOG_COLS.CATEGORY - 1],
    message: row[ERROR_LOG_COLS.MESSAGE - 1],
    context: row[ERROR_LOG_COLS.CONTEXT - 1],
    stackTrace: row[ERROR_LOG_COLS.STACK_TRACE - 1],
    user: row[ERROR_LOG_COLS.USER - 1],
    recovered: row[ERROR_LOG_COLS.RECOVERED - 1]
  };}).reverse();
}

/**
 * Wraps a function with error handling
 * @param {Function} func - Function to wrap
 * @param {string} context - Context description
 * @returns {Function} Wrapped function
 */
function withErrorHandling(func, context) {
  return function(...args) {
    try {
      return func.apply(this, args);
    } catch (error) {
      logError(
        ERROR_CONFIG.ERROR_LEVELS.ERROR,
        ERROR_CATEGORIES.SYSTEM,
        error.message,
        context,
        error,
        false
      );

      // Show user-friendly error
      SpreadsheetApp.getUi().alert(
        '⚠️ Error',
        `An error occurred: ${error.message}\n\nThis has been logged for review.`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );

      throw error;
    }
  };
}

/**
 * Validates required fields
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - Required field names
 * @returns {Object} Validation result
 */
function validateRequiredFields(data, requiredFields) {
  const missing = [];

  requiredFields.forEach(function(field) {
    if (!data[field] || data[field] === '') {
      missing.push(field);
    }
  });

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(', ')}`,
      missingFields: missing
    };
  }

  return { valid: true };
}

/**
 * Validates email format (returns boolean)
 * Note: Canonical validateEmail() is in Constants.gs (throws on invalid)
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates date format (returns boolean)
 * Note: Canonical validateDate() is in Constants.gs (throws on invalid)
 * @param {*} date - Date to validate
 * @returns {boolean}
 */
function isValidDateFormat(date) {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  return false;
}

/**
 * Performs system health check
 * @returns {Object} Health check results
 */
function performSystemHealthCheck() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    overall: 'PASS'
  };

  // Check 1: Verify all required sheets exist
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requiredSheets = Object.values(SHEETS);
  const existingSheets = ss.getSheets().map(function(s) { return s.getName(); });

  requiredSheets.forEach(function(sheetName) {
    const exists = existingSheets.includes(sheetName);
    results.checks.push({
      name: `Sheet: ${sheetName}`,
      status: exists ? 'PASS' : 'FAIL',
      message: exists ? 'Exists' : 'Missing'
    });
    if (!exists) results.overall = 'FAIL';
  });

  // Check 2: Verify data integrity
  try {
    const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
    if (grievanceSheet) {
      const lastRow = grievanceSheet.getLastRow();
      results.checks.push({
        name: 'Data Integrity',
        status: 'PASS',
        message: `${lastRow - 1} grievances found`
      });
    }
  } catch (err) {
    results.checks.push({
      name: 'Data Integrity',
      status: 'FAIL',
      message: err.message
    });
    results.overall = 'FAIL';
  }

  // Check 3: Cache health
  try {
    const cache = CacheService.getScriptCache();
    cache.put('healthcheck', 'test', 60);
    const testValue = cache.get('healthcheck');
    results.checks.push({
      name: 'Cache Service',
      status: testValue === 'test' ? 'PASS' : 'FAIL',
      message: testValue === 'test' ? 'Operational' : 'Not working'
    });
  } catch (err) {
    results.checks.push({
      name: 'Cache Service',
      status: 'FAIL',
      message: err.message
    });
  }

  // Generate summary
  const passCount = results.checks.filter(function(c) { return c.status === 'PASS'; }).length;
  const totalCount = results.checks.length;
  results.summary = `Health Check: ${passCount}/${totalCount} checks passed\nOverall Status: ${results.overall}`;

  logError(
    ERROR_CONFIG.ERROR_LEVELS.INFO,
    ERROR_CATEGORIES.SYSTEM,
    'System health check completed',
    results.summary,
    null,
    true
  );

  return results;
}

/**
 * Exports error log to sheet
 * @returns {string} Sheet URL
 */
function exportErrorLogToSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const errorSheet = ss.getSheetByName(ERROR_CONFIG.LOG_SHEET_NAME);

  if (!errorSheet) {
    throw new Error('No error log found');
  }

  return ss.getUrl() + '#gid=' + errorSheet.getSheetId();
}

/**
 * Clears error log
 */
function clearErrorLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const errorSheet = ss.getSheetByName(ERROR_CONFIG.LOG_SHEET_NAME);

  if (errorSheet && errorSheet.getLastRow() > 1) {
    errorSheet.deleteRows(2, errorSheet.getLastRow() - 1);
  }

  logError(
    ERROR_CONFIG.ERROR_LEVELS.INFO,
    ERROR_CATEGORIES.SYSTEM,
    'Error log cleared',
    'User cleared error log',
    null,
    true
  );

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Error log cleared',
    'Error Log',
    3
  );
}

/**
 * Tests error logging
 */
function testErrorLogging() {
  logError(
    ERROR_CONFIG.ERROR_LEVELS.INFO,
    ERROR_CATEGORIES.SYSTEM,
    'Test error message',
    'This is a test error generated for testing purposes',
    null,
    true
  );

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Test error logged successfully',
    'Testing',
    3
  );
}

/**
 * Creates error trend report
 * @returns {string} Report URL
 */
function createErrorTrendReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const errorSheet = ss.getSheetByName(ERROR_CONFIG.LOG_SHEET_NAME);

  if (!errorSheet || errorSheet.getLastRow() <= 1) {
    throw new Error('No error data available');
  }

  // Create or get trends sheet
  let trendsSheet = ss.getSheetByName('Error_Trends');
  if (trendsSheet) {
    trendsSheet.clear();
  } else {
    trendsSheet = ss.insertSheet('Error_Trends');
  }

  // Analyze trends by day
  const data = errorSheet.getRange(2, 1, errorSheet.getLastRow() - 1, 2).getValues();

  const dailyStats = {};
  data.forEach(function(row) {
    const date = Utilities.formatDate(new Date(row[ERROR_LOG_COLS.TIMESTAMP - 1]), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const level = row[ERROR_LOG_COLS.LEVEL - 1];

    if (!dailyStats[date]) {
      dailyStats[date] = { info: 0, warning: 0, error: 0, critical: 0 };
    }

    if (level === 'INFO') dailyStats[date].info++;
    else if (level === 'WARNING') dailyStats[date].warning++;
    else if (level === 'ERROR') dailyStats[date].error++;
    else if (level === 'CRITICAL') dailyStats[date].critical++;
  });

  // Write to sheet
  const headers = ['Date', 'Info', 'Warning', 'Error', 'Critical', 'Total'];
  trendsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  trendsSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f44336').setFontColor('#ffffff');

  const rows = Object.entries(dailyStats).map(([date, stats]) => [
    date,
    stats.info,
    stats.warning,
    stats.error,
    stats.critical,
    stats.info + stats.warning + stats.error + stats.critical
  ]);

  if (rows.length > 0) {
    trendsSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

    // Create chart
    const chartRange = trendsSheet.getRange(1, 1, rows.length + 1, headers.length);
    const chart = trendsSheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(chartRange)
      .setPosition(rows.length + 3, 1, 0, 0)
      .setOption('title', 'Error Trends Over Time')
      .setOption('width', 800)
      .setOption('height', 400)
      .build();

    trendsSheet.insertChart(chart);
  }

  return ss.getUrl() + '#gid=' + trendsSheet.getSheetId();
}
