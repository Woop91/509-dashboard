/****************************************************
 * INCREMENTAL BACKUP SYSTEM
 * Phase 6 - Critical Priority
 *
 * Automated backup system with 30-day retention
 * Complete disaster recovery capability
 *
 * Based on ADDITIONAL_ENHANCEMENTS.md Phase 1
 ****************************************************/

/**
 * Create an incremental backup of the entire spreadsheet
 * Backs up to a specified Google Drive folder
 * @returns {string} Backup file ID
 */
function createIncrementalBackup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();

  // Get or create backup folder ID
  let backupFolderId = props.getProperty('BACKUP_FOLDER_ID');

  if (!backupFolderId) {
    // Create backup folder if it doesn't exist
    backupFolderId = createBackupFolder();
    props.setProperty('BACKUP_FOLDER_ID', backupFolderId);
  }

  try {
    const folder = DriveApp.getFolderById(backupFolderId);
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
    const backupName = `509-Dashboard-Backup-${timestamp}`;

    Logger.log(`Creating backup: ${backupName}`);

    // Create backup copy
    const backup = ss.copy(backupName);

    // Move to backup folder
    const backupFile = DriveApp.getFileById(backup.getId());
    folder.addFile(backupFile);

    // Remove from root folder
    try {
      DriveApp.getRootFolder().removeFile(backupFile);
    } catch (e) {
      // File might not be in root, ignore error
      Logger.log('File not in root folder, skipping removal');
    }

    // Add metadata
    backupFile.setDescription(
      `Automated backup created at ${new Date().toISOString()}\n` +
      `Original file: ${ss.getName()}\n` +
      `Backup system: 509 Dashboard Incremental Backup`
    );

    Logger.log(`Backup created successfully: ${backup.getId()}`);

    // Clean up old backups
    cleanupOldBackups(folder);

    // Log to audit if available
    if (typeof auditLog === 'function') {
      auditLog('INCREMENTAL_BACKUP', {
        backupId: backup.getId(),
        backupName: backupName,
        timestamp: timestamp,
        folderId: backupFolderId,
        status: 'SUCCESS'
      });
    }

    // Update last backup timestamp
    props.setProperty('LAST_BACKUP_TIMESTAMP', new Date().getTime().toString());

    return backup.getId();

  } catch (error) {
    Logger.log(`Backup failed: ${error.message}`);

    if (typeof logError === 'function') {
      logError(error, 'createIncrementalBackup', 'CRITICAL');
    }

    throw error;
  }
}

/**
 * Create the backup folder in Google Drive
 * @returns {string} Folder ID
 */
function createBackupFolder() {
  const folderName = '509 Dashboard Backups';

  // Check if folder already exists
  const folders = DriveApp.getFoldersByName(folderName);

  if (folders.hasNext()) {
    const folder = folders.next();
    Logger.log(`Using existing backup folder: ${folder.getId()}`);
    return folder.getId();
  }

  // Create new folder
  const folder = DriveApp.createFolder(folderName);
  folder.setDescription('Automated backups of 509 Dashboard system');

  Logger.log(`Created backup folder: ${folder.getId()}`);
  return folder.getId();
}

/**
 * Clean up backups older than 30 days in specified folder
 * Note: Canonical cleanupOldBackups() is in PerformanceAndBackup.gs (no param, uses script props)
 * @param {Folder} folder - Google Drive folder containing backups
 * @returns {number} Number of backups deleted
 */
function cleanupOldBackupsInFolder(folder) {
  const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
  let deletedCount = 0;

  try {
    const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);

    while (files.hasNext()) {
      const file = files.next();
      const created = file.getDateCreated();

      if (created < thirtyDaysAgo) {
        Logger.log(`Deleting old backup: ${file.getName()} (created ${created})`);
        file.setTrashed(true);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      Logger.log(`Cleaned up ${deletedCount} old backup(s)`);

      if (typeof auditLog === 'function') {
        auditLog('BACKUP_CLEANUP', {
          deletedCount: deletedCount,
          retentionDays: 30,
          status: 'SUCCESS'
        });
      }
    }

  } catch (error) {
    Logger.log(`Error during backup cleanup: ${error.message}`);
  }

  return deletedCount;
}

/**
 * Scheduled backup function to run daily
 * Set up a time-driven trigger to call this daily
 */
function scheduledBackup() {
  try {
    Logger.log('=== Starting Scheduled Backup ===');

    const backupId = createIncrementalBackup();

    Logger.log(`✅ Backup created successfully: ${backupId}`);
    Logger.log('=== Scheduled Backup Complete ===');

  } catch (error) {
    Logger.log(`❌ Scheduled backup failed: ${error.message}`);

    // Send email notification on failure
    notifyBackupFailure(error);
  }
}

/**
 * Send email notification when backup fails
 * @param {Error} error - The error that occurred
 */
function notifyBackupFailure(error) {
  const props = PropertiesService.getScriptProperties();
  const adminEmail = props.getProperty('ADMINS');

  if (!adminEmail) {
    Logger.log('No admin email configured for backup failure notification');
    return;
  }

  const subject = '❌ 509 Dashboard Backup Failed';
  const body = `The automated backup of the 509 Dashboard failed at ${new Date()}.\n\n` +
               `Error: ${error.message}\n\n` +
               `Stack trace:\n${error.stack || 'Not available'}\n\n` +
               `Please check the backup system and ensure it runs successfully.`;

  try {
    MailApp.sendEmail(adminEmail, subject, body);
    Logger.log(`Backup failure notification sent to ${adminEmail}`);
  } catch (emailError) {
    Logger.log(`Failed to send backup failure email: ${emailError.message}`);
  }
}

/**
 * List all available backups
 * @returns {Array} Array of backup information
 */
function listBackups() {
  const props = PropertiesService.getScriptProperties();
  const backupFolderId = props.getProperty('BACKUP_FOLDER_ID');

  if (!backupFolderId) {
    Logger.log('No backup folder configured');
    return [];
  }

  try {
    const folder = DriveApp.getFolderById(backupFolderId);
    const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
    const backups = [];

    while (files.hasNext()) {
      const file = files.next();
      backups.push({
        id: file.getId(),
        name: file.getName(),
        created: file.getDateCreated(),
        size: file.getSize(),
        url: file.getUrl()
      });
    }

    // Sort by creation date (newest first)
    backups.sort(function(a, b) { return b.created - a.created; });

    return backups;

  } catch (error) {
    Logger.log(`Error listing backups: ${error.message}`);
    return [];
  }
}

/**
 * Show backup information in UI
 */
function showBackupInfo() {
  const ui = SpreadsheetApp.getUi();
  const backups = listBackups();

  if (backups.length === 0) {
    ui.alert(
      'No Backups Found',
      'No backups have been created yet.\n\n' +
      'Create your first backup by selecting:\n' +
      '📊 509 Dashboard > Admin > Create Backup',
      ui.ButtonSet.OK
    );
    return;
  }

  let message = `Total Backups: ${backups.length}\n\n`;
  message += 'Recent Backups:\n';
  message += '─────────────────────────────────────\n';

  // Show most recent 10 backups
  const recentBackups = backups.slice(0, 10);

  for (const backup of recentBackups) {
    const dateStr = Utilities.formatDate(
      backup.created,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm:ss'
    );
    const sizeMB = (backup.size / (1024 * 1024)).toFixed(2);

    message += `${dateStr} - ${sizeMB} MB\n`;
  }

  if (backups.length > 10) {
    message += `\n... and ${backups.length - 10} more\n`;
  }

  message += '\n─────────────────────────────────────\n';
  message += `Retention: 30 days\n`;
  message += `Folder: 509 Dashboard Backups\n`;

  const props = PropertiesService.getScriptProperties();
  const lastBackup = props.getProperty('LAST_BACKUP_TIMESTAMP');

  if (lastBackup) {
    const lastDate = new Date(parseInt(lastBackup));
    const lastDateStr = Utilities.formatDate(
      lastDate,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm:ss'
    );
    message += `Last Backup: ${lastDateStr}\n`;
  }

  ui.alert('Backup Information', message, ui.ButtonSet.OK);
}

/**
 * Menu function to create backup manually
 */
function CREATE_BACKUP() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Create Backup?',
    'This will create a complete backup of the entire spreadsheet.\n\n' +
    'The backup will be saved to Google Drive and kept for 30 days.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    ui.alert('Creating backup...');

    const backupId = createIncrementalBackup();

    const backupFile = DriveApp.getFileById(backupId);

    ui.alert(
      'Backup Created!',
      `Backup created successfully.\n\n` +
      `Name: ${backupFile.getName()}\n` +
      `Size: ${(backupFile.getSize() / (1024 * 1024)).toFixed(2)} MB\n` +
      `Created: ${backupFile.getDateCreated()}\n\n` +
      `The backup is stored in: 509 Dashboard Backups`,
      ui.ButtonSet.OK
    );

  } catch (error) {
    ui.alert(
      'Backup Failed',
      `Failed to create backup: ${error.message}\n\n` +
      `Please check the error log for details.`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Restore from a specific backup
 * Note: This requires manual user selection of which backup to restore
 * @param {string} backupId - ID of the backup file to restore from
 */
function restoreFromBackup(backupId) {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Restore from Backup?',
    'WARNING: This will replace ALL current data with the backup.\n\n' +
    'This action cannot be undone.\n\n' +
    'Are you sure you want to continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    const currentSs = SpreadsheetApp.getActiveSpreadsheet();
    const backupSs = SpreadsheetApp.openById(backupId);

    // Copy all sheets from backup to current
    const backupSheets = backupSs.getSheets();

    // First, create backup of current state (just in case)
    const emergencyBackup = createIncrementalBackup();
    Logger.log(`Emergency backup created before restore: ${emergencyBackup}`);

    ui.alert('Restoring data...');

    // Delete existing sheets and copy from backup
    const currentSheets = currentSs.getSheets();

    // Copy sheets from backup
    for (const sheet of backupSheets) {
      const sheetName = sheet.getName();

      // Delete if exists
      const existing = currentSs.getSheetByName(sheetName);
      if (existing) {
        currentSs.deleteSheet(existing);
      }

      // Copy from backup
      sheet.copyTo(currentSs).setName(sheetName);
    }

    ui.alert(
      'Restore Complete',
      `Data restored successfully from backup.\n\n` +
      `Backup ID: ${backupId}\n\n` +
      `An emergency backup of the pre-restore state was also created: ${emergencyBackup}`,
      ui.ButtonSet.OK
    );

    if (typeof auditLog === 'function') {
      auditLog('BACKUP_RESTORE', {
        backupId: backupId,
        emergencyBackupId: emergencyBackup,
        status: 'SUCCESS'
      });
    }

  } catch (error) {
    ui.alert(
      'Restore Failed',
      `Failed to restore from backup: ${error.message}`,
      ui.ButtonSet.OK
    );

    if (typeof logError === 'function') {
      logError(error, 'restoreFromBackup', 'CRITICAL');
    }
  }
}

/**
 * Set up automated daily backup trigger
 */
function setupDailyBackupTrigger() {
  // Delete existing triggers for this function to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();

  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'scheduledBackup') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Create new trigger - runs daily at 2 AM
  ScriptApp.newTrigger('scheduledBackup')
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .create();

  Logger.log('Daily backup trigger created (runs at 2 AM)');

  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Automated Backup Enabled',
    'Daily automated backups have been configured.\n\n' +
    'Backups will run every day at 2:00 AM.\n' +
    'Retention period: 30 days',
    ui.ButtonSet.OK
  );
}
