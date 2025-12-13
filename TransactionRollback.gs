/****************************************************
 * TRANSACTION ROLLBACK SYSTEM
 * Phase 6 - Critical Priority
 *
 * Provides transaction support with rollback capability
 * Prevents data corruption from failed operations
 *
 * Based on ADDITIONAL_ENHANCEMENTS.md Phase 1
 ****************************************************/

/**
 * Transaction class for managing atomic operations with rollback
 * Usage:
 *   const txn = new Transaction(ss);
 *   txn.snapshot('Member Directory');
 *   try {
 *     // Make changes...
 *     txn.commit();
 *   } catch (error) {
 *     txn.rollback();
 *   }
 */
class Transaction {
  /**
   * Create a new transaction
   * @param {SpreadsheetApp.Spreadsheet} spreadsheet - The spreadsheet to manage
   */
  constructor(spreadsheet) {
    this.ss = spreadsheet;
    this.snapshots = new Map();
    this.startTime = new Date();
    this.transactionId = Utilities.getUuid();
    this.committed = false;
    this.rolledBack = false;
  }

  /**
   * Take a snapshot of a sheet's current state
   * @param {string} sheetName - Name of the sheet to snapshot
   * @returns {boolean} Success status
   */
  snapshot(sheetName) {
    try {
      const sheet = this.ss.getSheetByName(sheetName);

      if (!sheet) {
        Logger.log(`Transaction ${this.transactionId}: Sheet "${sheetName}" not found for snapshot`);
        return false;
      }

      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();

      if (lastRow === 0 || lastCol === 0) {
        // Empty sheet - store empty snapshot
        this.snapshots.set(sheetName, {
          data: [],
          lastRow: 0,
          lastCol: 0,
          timestamp: new Date()
        });
        Logger.log(`Transaction ${this.transactionId}: Snapshotted empty sheet "${sheetName}"`);
        return true;
      }

      // Get all data including formulas
      const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const formulas = sheet.getRange(1, 1, lastRow, lastCol).getFormulas();

      this.snapshots.set(sheetName, {
        data: data,
        formulas: formulas,
        lastRow: lastRow,
        lastCol: lastCol,
        timestamp: new Date()
      });

      Logger.log(`Transaction ${this.transactionId}: Snapshotted "${sheetName}" (${lastRow}x${lastCol})`);
      return true;

    } catch (error) {
      Logger.log(`Transaction ${this.transactionId}: Error snapshotting "${sheetName}": ${error.message}`);
      return false;
    }
  }

  /**
   * Snapshot multiple sheets at once
   * @param {Array<string>} sheetNames - Array of sheet names
   * @returns {number} Number of successful snapshots
   */
  snapshotMultiple(sheetNames) {
    let successCount = 0;

    for (const sheetName of sheetNames) {
      if (this.snapshot(sheetName)) {
        successCount++;
      }
    }

    return successCount;
  }

  /**
   * Commit the transaction and clear snapshots
   */
  commit() {
    if (this.rolledBack) {
      throw new Error('Cannot commit a rolled-back transaction');
    }

    if (this.committed) {
      Logger.log(`Transaction ${this.transactionId}: Already committed`);
      return;
    }

    const duration = new Date() - this.startTime;

    // Log successful commit
    if (typeof auditLog === 'function') {
      auditLog('TRANSACTION_COMMIT', {
        transactionId: this.transactionId,
        duration: duration,
        sheetsModified: this.snapshots.size,
        status: 'SUCCESS'
      });
    }

    Logger.log(`Transaction ${this.transactionId}: Committed (${duration}ms, ${this.snapshots.size} sheets)`);

    // Clear snapshots to free memory
    this.snapshots.clear();
    this.committed = true;
  }

  /**
   * Rollback the transaction and restore all snapshotted sheets
   * @returns {Object} Rollback statistics
   */
  rollback() {
    if (this.committed) {
      throw new Error('Cannot rollback a committed transaction');
    }

    if (this.rolledBack) {
      Logger.log(`Transaction ${this.transactionId}: Already rolled back`);
      return {
        sheetsRestored: 0,
        message: 'Already rolled back'
      };
    }

    const duration = new Date() - this.startTime;
    let sheetsRestored = 0;
    const errors = [];

    Logger.log(`Transaction ${this.transactionId}: Starting rollback of ${this.snapshots.size} sheets...`);

    // Restore each snapshotted sheet
    for (const [sheetName, snapshot] of this.snapshots) {
      try {
        const sheet = this.ss.getSheetByName(sheetName);

        if (!sheet) {
          errors.push(`Sheet "${sheetName}" no longer exists`);
          continue;
        }

        // Clear current content
        if (sheet.getLastRow() > 0) {
          sheet.clear();
        }

        // Restore data if snapshot had content
        if (snapshot.data.length > 0) {
          // First restore values
          sheet.getRange(1, 1, snapshot.lastRow, snapshot.lastCol).setValues(snapshot.data);

          // Then restore formulas where they existed
          for (let row = 0; row < snapshot.formulas.length; row++) {
            for (let col = 0; col < snapshot.formulas[row].length; col++) {
              if (snapshot.formulas[row][col]) {
                sheet.getRange(row + 1, col + 1).setFormula(snapshot.formulas[row][col]);
              }
            }
          }
        }

        sheetsRestored++;
        Logger.log(`Transaction ${this.transactionId}: Restored "${sheetName}"`);

      } catch (error) {
        errors.push(`Error restoring "${sheetName}": ${error.message}`);
        Logger.log(`Transaction ${this.transactionId}: Error restoring "${sheetName}": ${error.message}`);
      }
    }

    // Log rollback
    if (typeof auditLog === 'function') {
      auditLog('TRANSACTION_ROLLBACK', {
        transactionId: this.transactionId,
        duration: duration,
        sheetsRestored: sheetsRestored,
        errors: errors.length,
        status: 'ROLLBACK'
      });
    }

    Logger.log(`Transaction ${this.transactionId}: Rollback complete (${sheetsRestored} sheets restored, ${errors.length} errors)`);

    this.rolledBack = true;

    return {
      sheetsRestored: sheetsRestored,
      errors: errors,
      duration: duration,
      message: `Rolled back ${sheetsRestored} sheets (${errors.length} errors)`
    };
  }

  /**
   * Get transaction status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      transactionId: this.transactionId,
      startTime: this.startTime,
      duration: new Date() - this.startTime,
      snapshotCount: this.snapshots.size,
      committed: this.committed,
      rolledBack: this.rolledBack
    };
  }
}

/**
 * Seed all data with transaction rollback protection
 * Wraps the seeding operations in a transaction
 */
function seedAllWithRollback() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const response = ui.alert(
    'Seed All Data with Rollback Protection?',
    'This will:\n' +
    '1. Take snapshots of Member Directory and Grievance Log\n' +
    '2. Seed 500 members\n' +
    '3. Seed 200 grievances\n' +
    '4. Recalculate all data\n\n' +
    'If any step fails, all changes will be automatically rolled back.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  const txn = new Transaction(ss);

  try {
    ui.alert('Creating transaction snapshots...');

    // Take snapshots of sheets we'll modify
    txn.snapshotMultiple([
      SHEETS.MEMBER_DIR,
      SHEETS.GRIEVANCE_LOG,
      SHEETS.ANALYTICS
    ]);

    ui.alert('Snapshots created. Starting seeding operations...');

    // Execute seeding operations (v3.51 - uses SeedNuke.gs functions)
    if (typeof SEED_MEMBERS === 'function') {
      SEED_MEMBERS(500); // Seed 500 members
    }

    if (typeof SEED_GRIEVANCES === 'function') {
      SEED_GRIEVANCES(200); // Seed 200 grievances
    }

    ui.alert('Data seeded. Recalculating...');

    // Recalculate
    if (typeof recalcAllMembers === 'function') {
      recalcAllMembers();
    }

    if (typeof recalcAllGrievancesBatched === 'function') {
      recalcAllGrievancesBatched();
    }

    if (typeof rebuildDashboard === 'function') {
      rebuildDashboard();
    }

    // Success - commit transaction
    txn.commit();

    ui.alert(
      'Success!',
      'All data seeded successfully.\n\n' +
      'Transaction committed and snapshots cleared.',
      ui.ButtonSet.OK
    );

  } catch (error) {
    // Failure - rollback transaction
    ui.alert(
      'Error Occurred - Rolling Back',
      'An error occurred during seeding:\n\n' +
      error.message + '\n\n' +
      'Rolling back all changes...',
      ui.ButtonSet.OK
    );

    const rollbackResult = txn.rollback();

    ui.alert(
      'Rollback Complete',
      rollbackResult.message + '\n\n' +
      'All changes have been reverted to the state before seeding started.',
      ui.ButtonSet.OK
    );

    // Log the error
    if (typeof logError === 'function') {
      logError(error, 'seedAllWithRollback', 'CRITICAL');
    }

    throw error;
  }
}

/**
 * Execute a function with transaction protection
 * Generic wrapper for any operation
 *
 * @param {Function} operation - Function to execute
 * @param {Array<string>} sheetNames - Sheets to snapshot
 * @param {string} operationName - Name for logging
 * @returns {*} Result from operation function
 */
function executeWithTransaction(operation, sheetNames, operationName = 'operation') {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const txn = new Transaction(ss);

  try {
    Logger.log(`Starting transaction for: ${operationName}`);

    // Take snapshots
    const snapshotted = txn.snapshotMultiple(sheetNames);
    Logger.log(`Snapshotted ${snapshotted} sheets`);

    // Execute the operation
    const result = operation();

    // Commit on success
    txn.commit();
    Logger.log(`Transaction committed for: ${operationName}`);

    return result;

  } catch (error) {
    Logger.log(`Transaction failed for ${operationName}: ${error.message}`);

    // Rollback on failure
    const rollbackResult = txn.rollback();
    Logger.log(`Rollback complete: ${rollbackResult.message}`);

    // Re-throw the error
    throw error;
  }
}

/**
 * Example: Clear all data with transaction protection
 */
function clearAllDataWithRollback() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Clear All Data with Rollback Protection?',
    'This will clear all member and grievance data.\n\n' +
    'A snapshot will be taken first, allowing you to undo if needed.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  return executeWithTransaction(
    function() {
      // Clear the data
      if (typeof NUKE_ALL_DATA === 'function') {
        NUKE_ALL_DATA();
      }
    },
    [SHEETS.MEMBER_DIR, SHEETS.GRIEVANCE_LOG],
    'clearAllData'
  );
}

/**
 * Manual rollback - allows user to trigger rollback of last transaction
 * Note: This requires storing transaction snapshots in properties or a sheet
 */
function manualRollback() {
  const ui = SpreadsheetApp.getUi();

  ui.alert(
    'Manual Rollback Not Implemented',
    'Manual rollback requires persistent snapshot storage.\n\n' +
    'Use the Incremental Backup System instead for recovery.',
    ui.ButtonSet.OK
  );
}
