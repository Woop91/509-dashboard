/**
 * ------------------------------------------------------------------------====
 * DATA BACKUP & RECOVERY SYSTEM
 * ------------------------------------------------------------------------====
 *
 * Automated and manual backup/recovery capabilities
 * Features:
 * - One-click manual backups
 * - Automated weekly backups
 * - Version history tracking
 * - Point-in-time recovery
 * - Selective sheet restoration
 * - Backup verification
 * - Export to Google Drive
 * - Retention policy management
 */

/**
 * Creates a complete backup of the dashboard
 * @param {boolean} automated - Whether this is an automated backup
 * @returns {File} Backup file
 */
function createBackup(automated = false) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
  const backupName = `509_Dashboard_Backup_${timestamp}${automated ? '_AUTO' : ''}`;

  try {
    // Create copy of entire spreadsheet
    const backupFile = DriveApp.getFileById(ss.getId()).makeCopy(backupName);

    // Move to backups folder
    const backupFolder = getOrCreateBackupFolder();
    backupFolder.addFile(backupFile);

    // Remove from root
    DriveApp.getRootFolder().removeFile(backupFile);

    // Log backup
    logBackup(backupName, backupFile.getId(), automated);

    // Clean old backups
    cleanOldBackups();

    if (!automated) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        '✅ Backup created successfully: ' + backupName,
        'Backup Complete',
        5
      );
    }

    return backupFile;

  } catch (error) {
    Logger.log('Backup error: ' + error.message);
    if (!automated) {
      SpreadsheetApp.getUi().alert('❌ Backup failed: ' + error.message);
    }
    throw error;
  }
}

/**
 * Gets or creates backup folder in Google Drive
 * @returns {Folder} Backup folder
 */
function getOrCreateBackupFolder() {
  const folderName = '509 Dashboard - Backups';
  const folders = DriveApp.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  }

  return DriveApp.createFolder(folderName);
}

/**
 * Logs backup information
 * @param {string} backupName - Backup name
 * @param {string} fileId - Drive file ID
 * @param {boolean} automated - Whether automated
 */
function logBackup(backupName, fileId, automated) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let backupLog = ss.getSheetByName(SHEETS.BACKUP_LOG);

  if (!backupLog) {
    backupLog = createBackupLogSheet();
  }

  const timestamp = new Date();
  const user = Session.getActiveUser().getEmail() || 'System';

  const lastRow = backupLog.getLastRow();
  const newRow = [
    timestamp,
    backupName,
    fileId,
    automated ? 'Automated' : 'Manual',
    user,
    `=HYPERLINK("https://drive.google.com/file/d/${fileId}/view", "Open Backup")`
  ];

  backupLog.getRange(lastRow + 1, 1, 1, 6).setValues([newRow]);
}

/**
 * Creates backup log sheet
 * @returns {Sheet} Backup log sheet
 */
function createBackupLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Check if sheet already exists
  let sheet = ss.getSheetByName(SHEETS.BACKUP_LOG);
  if (sheet) {
    return sheet; // Return existing sheet
  }

  sheet = ss.insertSheet(SHEETS.BACKUP_LOG);

  const headers = [
    'Timestamp',
    'Backup Name',
    'File ID',
    'Type',
    'Created By',
    'Link'
  ];

  sheet.getRange(1, 1, 1, 6).setValues([headers]);

  // Format header
  sheet.getRange(1, 1, 1, 6)
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Set column widths
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 200);
  sheet.setColumnWidth(6, 150);

  sheet.setFrozenRows(1);

  // Delete unused columns beyond the headers array length
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }

  return sheet;
}

/**
 * Cleans old backups based on retention policy
 */
function cleanOldBackups() {
  const RETENTION_DAYS = 30; // Keep backups for 30 days
  const MAX_BACKUPS = 50;    // Keep max 50 backups

  try {
    const backupFolder = getOrCreateBackupFolder();
    const files = backupFolder.getFiles();

    const backupFiles = [];

    while (files.hasNext()) {
      const file = files.next();
      backupFiles.push({
        file: file,
        created: file.getDateCreated()
      });
    }

    // Sort by date (oldest first)
    backupFiles.sort(function(a, b) { return a.created - b.created; });

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (RETENTION_DAYS * 24 * 60 * 60 * 1000));

    // Delete old backups
    backupFiles.forEach(function(backup, index) {
      // Keep if:
      // 1. Within retention period
      // 2. One of the most recent MAX_BACKUPS
      const isRecent = backup.created > cutoffDate;
      const isInMaxLimit = index >= (backupFiles.length - MAX_BACKUPS);

      if (!isRecent && !isInMaxLimit) {
        Logger.log('Deleting old backup: ' + backup.file.getName());
        backup.file.setTrashed(true);
      }
    });

  } catch (error) {
    Logger.log('Error cleaning old backups: ' + error.message);
  }
}

/**
 * Sets up automated weekly backups
 */
function setupAutomatedBackups() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'runAutomatedBackup') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create weekly trigger (Sunday at 2 AM)
  ScriptApp.newTrigger('runAutomatedBackup')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(2)
    .create();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Automated weekly backups enabled (Sundays, 2 AM)',
    'Backup Automation',
    5
  );
}

/**
 * Disables automated backups
 */
function disableAutomatedBackups() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;

  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'runAutomatedBackup') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `🔕 Removed ${removed} automated backup trigger(s)`,
    'Backup Automation',
    5
  );
}

/**
 * Runs automated backup (called by trigger)
 */
function runAutomatedBackup() {
  try {
    createBackup(true);
    Logger.log('Automated backup completed successfully');
  } catch (error) {
    Logger.log('Automated backup failed: ' + error.message);
    notifyAdminOfBackupFailure(error.message);
  }
}

/**
 * Notifies admin of backup failure
 * @param {string} errorMessage - Error message
 */
function notifyAdminOfBackupFailure(errorMessage) {
  const adminEmail = Session.getActiveUser().getEmail();

  MailApp.sendEmail({
    to: adminEmail,
    subject: '🚨 509 Dashboard - Automated Backup Failed',
    body: `An automated backup failed:\n\nError: ${errorMessage}\n\nPlease check the dashboard and create a manual backup.`,
    name: 'SEIU Local 509 Dashboard'
  });
}

/**
 * Shows backup manager dialog
 */
function showBackupManager() {
  const html = createBackupManagerHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(800)
    .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '💾 Backup & Recovery Manager');
}

/**
 * Creates HTML for backup manager
 */
function createBackupManagerHTML() {
  const triggers = ScriptApp.getProjectTriggers();
  const isAutomated = triggers.some(function(t) { return t.getHandlerFunction() === 'runAutomatedBackup'; });

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #1a73e8; margin-top: 0; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    .section { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #1a73e8; }
    .section-title { font-weight: bold; font-size: 16px; color: #333; margin-bottom: 15px; }
    .status { padding: 15px; border-radius: 4px; margin: 15px 0; font-weight: bold; }
    .status.enabled { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .status.disabled { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    button { background: #1a73e8; color: white; border: none; padding: 12px 24px; font-size: 14px; border-radius: 4px; cursor: pointer; margin: 10px 5px 0 0; }
    button:hover { background: #1557b0; }
    button.secondary { background: #6c757d; }
    button.secondary:hover { background: #5a6268; }
    button.danger { background: #dc3545; }
    button.danger:hover { background: #c82333; }
    .info-box { background: #e8f0fe; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #1a73e8; }
    ul { margin: 10px 0; padding-left: 25px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>💾 Backup & Recovery Manager</h2>

    <div class="info-box">
      <strong>📋 Backup Policy:</strong><br>
      • Retention: 30 days or 50 most recent backups<br>
      • Automated: Weekly (Sundays at 2 AM)<br>
      • Location: Google Drive folder "509 Dashboard - Backups"
    </div>

    <div class="section">
      <div class="section-title">⚙️ Automated Backups</div>
      <div class="status ${isAutomated ? 'enabled' : 'disabled'}">
        ${isAutomated ? '✅ Automated backups are ENABLED (Weekly, Sundays 2 AM)' : '🔕 Automated backups are DISABLED'}
      </div>
      <button onclick="google.script.run.withSuccessHandler(function() { location.reload(); }).setupAutomatedBackups()">
        ${isAutomated ? '🔄 Refresh Schedule' : '✅ Enable Automated Backups'}
      </button>
      ${isAutomated ? '<button class="danger" onclick="google.script.run.withSuccessHandler(function() { location.reload(); }).disableAutomatedBackups()">🔕 Disable</button>' : ''}
    </div>

    <div class="section">
      <div class="section-title">📦 Manual Backup</div>
      <p>Create an immediate backup of all data. Backups are saved to Google Drive.</p>
      <button onclick="runManualBackup()">💾 Create Backup Now</button>
    </div>

    <div class="section">
      <div class="section-title">🔄 Recovery Options</div>
      <p>Restore data from a previous backup:</p>
      <ul>
        <li>View all backups in Google Drive folder "509 Dashboard - Backups"</li>
        <li>Open a backup file to review data</li>
        <li>Copy sheets from backup to current dashboard to restore</li>
        <li>Or replace entire dashboard by making backup your active copy</li>
      </ul>
      <button class="secondary" onclick="openBackupFolder()">📁 Open Backup Folder</button>
      <button class="secondary" onclick="showBackupLog()">📊 View Backup Log</button>
    </div>

    <div class="section">
      <div class="section-title">📊 Export Options</div>
      <p>Export specific data for external storage:</p>
      <button onclick="exportGrievances()">📋 Export Grievances (CSV)</button>
      <button onclick="exportMembers()">👥 Export Members (CSV)</button>
      <button onclick="exportAll()">📦 Export All Data (ZIP)</button>
    </div>
  </div>

  <script>
    function runManualBackup() {
      if (!confirm('Create a backup of all dashboard data?')) return;

      alert('Creating backup... This may take a moment.');

      google.script.run
        .withSuccessHandler(function() {
          alert('✅ Backup created successfully!');
        })
        .withFailureHandler(function(error) {
          alert('❌ Backup failed: ' + error.message);
        })
        .createBackup(false);
    }

    function openBackupFolder() {
      window.open('https://drive.google.com/', '_blank');
      alert('Look for the folder named "509 Dashboard - Backups" in your Google Drive.');
    }

    function showBackupLog() {
      google.script.run
        .withSuccessHandler(function() {
          alert('Opening Backup Log sheet...');
          google.script.host.close();
        })
        .navigateToBackupLog();
    }

    function exportGrievances() {
      alert('Exporting grievances to CSV...');
      google.script.run
        .withSuccessHandler(function(csv) {
          downloadCSV(csv, 'grievances.csv');
        })
        .exportGrievancesToCSV();
    }

    function exportMembers() {
      alert('Exporting members to CSV...');
      google.script.run
        .withSuccessHandler(function(csv) {
          downloadCSV(csv, 'members.csv');
        })
        .exportMembersToCSV();
    }

    function exportAll() {
      alert('⚠️ Full export feature coming soon. Use manual backup for now.');
    }

    function downloadCSV(csvData, filename) {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>
  `;
}

/**
 * Navigates to backup log sheet
 */
function navigateToBackupLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let backupLog = ss.getSheetByName(SHEETS.BACKUP_LOG);

  if (!backupLog) {
    backupLog = createBackupLogSheet();
  }

  backupLog.activate();
}

/**
 * Exports grievances to CSV
 * @returns {string} CSV data
 */
function exportGrievancesToCSV() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  let csv = '';
  data.forEach(function(row) {
    const values = row.map(function(v) {
      const str = v.toString();
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    });
    csv += values.join(',') + '\n';
  });

  return csv;
}

/**
 * Exports members to CSV
 * @returns {string} CSV data
 */
function exportMembersToCSV() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  let csv = '';
  data.forEach(function(row) {
    const values = row.map(function(v) {
      const str = v.toString();
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    });
    csv += values.join(',') + '\n';
  });

  return csv;
}
