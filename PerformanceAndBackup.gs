/**
 * PERFORMANCE MONITORING AND BACKUP FEATURES
 * Features 90, 91: Automated Backups, Performance Monitoring
 */

// ===========================
// FEATURE 91: PERFORMANCE MONITORING
// ===========================

/**
 * Creates the Performance_Log sheet for tracking script execution times
 */
function createPerformanceLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let perfLog = ss.getSheetByName(SHEETS.PERFORMANCE_LOG);

  // Delete existing sheet if present
  if (perfLog) {
    ss.deleteSheet(perfLog);
  }

  // Create new sheet
  perfLog = ss.insertSheet('Performance_Log');

  // Set up headers
  const headers = [
    'Timestamp',
    'Function Name',
    'Execution Time (ms)',
    'Status',
    'Records Processed',
    'Memory Usage (estimate)',
    'User Email',
    'Notes'
  ];

  perfLog.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style headers
  perfLog.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4A5568')
    .setFontColor('#FFFFFF')
    .setWrap(true);

  // Set column widths
  perfLog.setColumnWidth(1, 150); // Timestamp
  perfLog.setColumnWidth(2, 200); // Function Name
  perfLog.setColumnWidth(3, 120); // Execution Time
  perfLog.setColumnWidth(4, 100); // Status
  perfLog.setColumnWidth(5, 150); // Records Processed
  perfLog.setColumnWidth(6, 150); // Memory Usage
  perfLog.setColumnWidth(7, 200); // User Email
  perfLog.setColumnWidth(8, 250); // Notes

  // Freeze header row
  perfLog.setFrozenRows(1);

  // Set tab color
  perfLog.setTabColor('#059669'); // Green for monitoring

  // Delete unused columns beyond the defined headers (8 columns)
  const totalCols = perfLog.getMaxColumns();
  if (totalCols > headers.length) {
    perfLog.deleteColumns(headers.length + 1, totalCols - headers.length);
  }

  Logger.log('Performance_Log sheet created successfully');
}

/**
 * Tracks performance of a function
 * @param {string} functionName - Name of function being tracked
 * @param {Function} callback - Function to execute and track
 * @param {Object} options - Optional configuration {recordsProcessed, notes}
 * @return {*} Result of callback function
 */
function trackPerformance(functionName, callback, options = {}) {
  const startTime = Date.now();
  const startMemory = (typeof MemoryInfo !== 'undefined') ? MemoryInfo.getCurrentUsage() : 'N/A';

  let result;
  let status = 'SUCCESS';
  let errorMessage = '';

  try {
    result = callback();
  } catch (error) {
    status = 'ERROR';
    errorMessage = error.message;
    Logger.log(`Error in ${functionName}: ${error.message}`);
    throw error; // Re-throw to maintain original behavior
  } finally {
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    const endMemory = (typeof MemoryInfo !== 'undefined') ? MemoryInfo.getCurrentUsage() : 'N/A';

    // Log to Performance_Log sheet
    logPerformance(functionName, executionTime, status, options.recordsProcessed || 'N/A',
                  endMemory, errorMessage || options.notes || '');
  }

  return result;
}

/**
 * Logs performance data to Performance_Log sheet
 */
function logPerformance(functionName, executionTime, status, recordsProcessed, memoryUsage, notes) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let perfLog = ss.getSheetByName(SHEETS.PERFORMANCE_LOG);

    // Create performance log sheet if it doesn't exist
    if (!perfLog) {
      createPerformanceLogSheet();
      perfLog = ss.getSheetByName(SHEETS.PERFORMANCE_LOG);
    }

    const userEmail = Session.getActiveUser().getEmail() || 'Unknown';
    const timestamp = new Date();

    const perfEntry = [
      timestamp,
      functionName,
      executionTime,
      status,
      recordsProcessed,
      memoryUsage,
      userEmail,
      notes
    ];

    perfLog.appendRow(perfEntry);

    // Color code based on status
    const lastRow = perfLog.getLastRow();
    if (status === 'ERROR') {
      perfLog.getRange(lastRow, 1, 1, 8).setBackground('#FEE2E2'); // Light red
    } else if (executionTime > 30000) { // >30 seconds
      perfLog.getRange(lastRow, 1, 1, 8).setBackground('#FEF3C7'); // Light yellow (slow)
    }

  } catch (error) {
    Logger.log(`Error logging performance: ${error.message}`);
    // Don't throw - performance logging should not break main operations
  }
}

/**
 * Generates performance summary report
 */
function generatePerformanceReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const perfLog = ss.getSheetByName(SHEETS.PERFORMANCE_LOG);

  if (!perfLog) {
    SpreadsheetApp.getUi().alert('Error', 'Performance_Log sheet not found. No performance data available.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const data = perfLog.getDataRange().getValues();
  const records = data.slice(1); // Skip header

  if (records.length === 0) {
    SpreadsheetApp.getUi().alert('No Data', 'No performance data available yet.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  // Calculate statistics
  const functionStats = {};
  records.forEach(row => {
    const funcName = row[1];
    const execTime = row[2];
    const status = row[3];

    if (!functionStats[funcName]) {
      functionStats[funcName] = {
        calls: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0
      };
    }

    functionStats[funcName].calls++;
    functionStats[funcName].totalTime += execTime;
    functionStats[funcName].minTime = Math.min(functionStats[funcName].minTime, execTime);
    functionStats[funcName].maxTime = Math.max(functionStats[funcName].maxTime, execTime);
    if (status === 'ERROR') functionStats[funcName].errors++;
  });

  // Create report sheet
  let reportSheet = ss.getSheetByName('Performance Report');
  if (reportSheet) {
    ss.deleteSheet(reportSheet);
  }
  reportSheet = ss.insertSheet('Performance Report');

  // Add title
  reportSheet.getRange(1, 1, 1, 7).merge();
  reportSheet.getRange(1, 1).setValue('PERFORMANCE SUMMARY REPORT');
  reportSheet.getRange(1, 1).setFontSize(16).setFontWeight('bold').setHorizontalAlignment('center');

  // Add headers
  const headers = ['Function Name', 'Total Calls', 'Avg Time (ms)', 'Min Time (ms)', 'Max Time (ms)', 'Errors', 'Success Rate'];
  reportSheet.getRange(3, 1, 1, 7).setValues([headers]);
  reportSheet.getRange(3, 1, 1, 7)
    .setFontWeight('bold')
    .setBackground('#4A5568')
    .setFontColor('#FFFFFF');

  // Add data
  let row = 4;
  for (const [funcName, stats] of Object.entries(functionStats)) {
    const avgTime = Math.round(stats.totalTime / stats.calls);
    const successRate = ((stats.calls - stats.errors) / stats.calls * 100).toFixed(1) + '%';

    reportSheet.getRange(row, 1, 1, 7).setValues([[
      funcName,
      stats.calls,
      avgTime,
      stats.minTime === Infinity ? 0 : stats.minTime,
      stats.maxTime,
      stats.errors,
      successRate
    ]]);

    // Highlight slow functions (avg > 5 seconds)
    if (avgTime > 5000) {
      reportSheet.getRange(row, 1, 1, 7).setBackground('#FEF3C7');
    }

    row++;
  }

  // Format
  reportSheet.setFrozenRows(3);
  reportSheet.setTabColor('#059669');
  reportSheet.autoResizeColumns(1, 7);

  SpreadsheetApp.getUi().alert('Success', 'Performance report generated successfully!', SpreadsheetApp.getUi().ButtonSet.OK);
}

// ===========================
// FEATURE 90: AUTOMATED BACKUPS
// ===========================

/**
 * Creates an automated backup of the spreadsheet to Google Drive
 * @return {string} URL of backup file
 */
function createAutomatedBackup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scriptProps = PropertiesService.getScriptProperties();

  // Get backup folder ID from script properties
  let backupFolderId = scriptProps.getProperty('BACKUP_FOLDER_ID');

  if (!backupFolderId) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.prompt(
      'Configure Backup Location',
      'Enter Google Drive Folder ID for backups:\n\n(Right-click folder in Drive → Get link → Copy ID from URL)',
      ui.ButtonSet.OK_CANCEL
    );

    if (response.getSelectedButton() !== ui.Button.OK) {
      return null;
    }

    backupFolderId = response.getResponseText().trim();
    scriptProps.setProperty('BACKUP_FOLDER_ID', backupFolderId);
  }

  try {
    const backupFolder = DriveApp.getFolderById(backupFolderId);

    // Create backup with timestamp
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
    const backupName = `509_Dashboard_Backup_${timestamp}`;

    // Make a copy
    const backupFile = DriveApp.getFileById(ss.getId()).makeCopy(backupName, backupFolder);

    Logger.log(`Backup created: ${backupName}`);

    // Log the backup
    if (typeof logDataModification === 'function') {
      logDataModification('BACKUP_CREATED', 'System', backupFile.getId(), 'Automated Backup',
                         'N/A', backupName);
    }

    SpreadsheetApp.getUi().alert('Backup Complete',
      `Backup created successfully!\n\nFile: ${backupName}\n\nView in Drive: ${backupFile.getUrl()}`,
      SpreadsheetApp.getUi().ButtonSet.OK);

    return backupFile.getUrl();

  } catch (error) {
    Logger.log(`Backup failed: ${error.message}`);
    SpreadsheetApp.getUi().alert('Backup Failed',
      `Failed to create backup: ${error.message}\n\nPlease verify the folder ID is correct.`,
      SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
}

/**
 * Sets up daily automated backups
 */
function setupDailyBackups() {
  const ui = SpreadsheetApp.getUi();

  // Check if backup folder is configured
  const scriptProps = PropertiesService.getScriptProperties();
  if (!scriptProps.getProperty('BACKUP_FOLDER_ID')) {
    const response = ui.prompt(
      'Configure Backup Location',
      'Enter Google Drive Folder ID for backups:\n\n(Right-click folder in Drive → Get link → Copy ID from URL)',
      ui.ButtonSet.OK_CANCEL
    );

    if (response.getSelectedButton() !== ui.Button.OK) {
      return;
    }

    const folderId = response.getResponseText().trim();
    scriptProps.setProperty('BACKUP_FOLDER_ID', folderId);
  }

  // Delete existing backup triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'createAutomatedBackup') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create daily trigger (runs at 2 AM)
  ScriptApp.newTrigger('createAutomatedBackup')
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .create();

  ui.alert('Success',
    'Daily automated backups enabled!\n\nBackups will be created every day at 2:00 AM.',
    ui.ButtonSet.OK);
}

/**
 * Configures backup folder ID
 */
function configureBackupFolder() {
  const ui = SpreadsheetApp.getUi();
  const scriptProps = PropertiesService.getScriptProperties();

  const currentFolder = scriptProps.getProperty('BACKUP_FOLDER_ID') || 'Not configured';

  const response = ui.prompt(
    'Configure Backup Folder',
    `Current Folder ID: ${currentFolder}\n\nEnter new Google Drive Folder ID:\n\n(Right-click folder in Drive → Get link → Copy ID from URL)`,
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() === ui.Button.OK) {
    const folderId = response.getResponseText().trim();

    // Validate folder ID
    try {
      DriveApp.getFolderById(folderId);
      scriptProps.setProperty('BACKUP_FOLDER_ID', folderId);
      ui.alert('Success', 'Backup folder configured successfully!', ui.ButtonSet.OK);

      // Log configuration change
      if (typeof logDataModification === 'function') {
        logDataModification('CONFIG_CHANGE', 'Script Properties', 'BACKUP_FOLDER_ID',
                           'Folder ID', currentFolder, folderId);
      }

    } catch (error) {
      ui.alert('Error', `Invalid folder ID: ${error.message}`, ui.ButtonSet.OK);
    }
  }
}

/**
 * Cleans up old backups (keeps last 30 days)
 */
function cleanupOldBackups() {
  const scriptProps = PropertiesService.getScriptProperties();
  const backupFolderId = scriptProps.getProperty('BACKUP_FOLDER_ID');

  if (!backupFolderId) {
    SpreadsheetApp.getUi().alert('Error', 'Backup folder not configured.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  try {
    const backupFolder = DriveApp.getFolderById(backupFolderId);
    const files = backupFolder.getFilesByType(MimeType.GOOGLE_SHEETS);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

    let deletedCount = 0;

    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();

      // Only process backup files
      if (fileName.startsWith('509_Dashboard_Backup_')) {
        const fileDate = file.getDateCreated();

        if (fileDate < cutoffDate) {
          file.setTrashed(true);
          deletedCount++;
          Logger.log(`Deleted old backup: ${fileName}`);
        }
      }
    }

    SpreadsheetApp.getUi().alert('Cleanup Complete',
      `Deleted ${deletedCount} backup(s) older than 30 days.`,
      SpreadsheetApp.getUi().ButtonSet.OK);

  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', `Cleanup failed: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}
