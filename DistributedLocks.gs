/****************************************************
 * DISTRIBUTED LOCK SERVICE
 * Phase 6 - High Priority
 *
 * Provides distributed locking for concurrent user safety
 * Prevents data corruption from simultaneous edits
 *
 * Based on ADDITIONAL_ENHANCEMENTS.md Phase 2
 ****************************************************/

/**
 * DistributedLock class for managing concurrent access
 * Uses Google Apps Script LockService for synchronization
 *
 * Usage:
 *   const lock = new DistributedLock('resource-name');
 *   lock.executeWithLock(function() {
 *     // Critical section code here
 *   });
 */
class DistributedLock {
  /**
   * Create a new distributed lock
   * @param {string} resource - Name of the resource being locked
   * @param {number} timeout - Timeout in milliseconds (default: 30000 = 30 seconds)
   */
  constructor(resource, timeout = 30000) {
    this.resource = resource;
    this.timeout = timeout;
    this.lock = LockService.getScriptLock();
    this.lockAcquired = false;
  }

  /**
   * Attempt to acquire the lock
   * @returns {boolean} True if lock acquired, false otherwise
   * @throws {Error} If unable to acquire lock after timeout
   */
  acquire() {
    try {
      const acquired = this.lock.tryLock(this.timeout);

      if (!acquired) {
        const error = new Error(
          `Failed to acquire lock for "${this.resource}" after ${this.timeout}ms. ` +
          `Another user or process may be using this resource.`
        );

        // Log the failure
        if (typeof auditLog === 'function') {
          auditLog('LOCK_FAILED', {
            resource: this.resource,
            timeout: this.timeout,
            error: error.message,
            status: 'FAILURE'
          });
        }

        throw error;
      }

      this.lockAcquired = true;
      Logger.log(`Lock acquired for "${this.resource}"`);

      // Log successful acquisition
      if (typeof auditLog === 'function') {
        auditLog('LOCK_ACQUIRED', {
          resource: this.resource,
          timeout: this.timeout,
          status: 'SUCCESS'
        });
      }

      return true;

    } catch (error) {
      Logger.log(`Error acquiring lock for "${this.resource}": ${error.message}`);
      throw error;
    }
  }

  /**
   * Release the lock
   */
  release() {
    if (this.lockAcquired) {
      try {
        this.lock.releaseLock();
        this.lockAcquired = false;
        Logger.log(`Lock released for "${this.resource}"`);

        if (typeof auditLog === 'function') {
          auditLog('LOCK_RELEASED', {
            resource: this.resource,
            status: 'SUCCESS'
          });
        }

      } catch (error) {
        Logger.log(`Error releasing lock for "${this.resource}": ${error.message}`);
      }
    }
  }

  /**
   * Execute a function while holding the lock
   * Automatically acquires lock before execution and releases after
   *
   * @param {Function} operation - Function to execute
   * @returns {*} Result from the operation
   * @throws {Error} If lock cannot be acquired or operation fails
   */
  executeWithLock(operation) {
    const startTime = new Date();

    try {
      // Acquire lock
      this.acquire();

      // Execute the operation
      const result = operation();

      // Log successful execution
      const duration = new Date() - startTime;
      Logger.log(`Operation completed successfully for "${this.resource}" (${duration}ms)`);

      return result;

    } catch (error) {
      // Log error
      const duration = new Date() - startTime;
      Logger.log(`Operation failed for "${this.resource}" after ${duration}ms: ${error.message}`);

      if (typeof logError === 'function') {
        logError(error, `DistributedLock.executeWithLock(${this.resource})`, 'ERROR');
      }

      throw error;

    } finally {
      // Always release the lock
      this.release();
    }
  }

  /**
   * Check if lock is currently held
   * @returns {boolean} True if lock is held
   */
  isLocked() {
    return this.lockAcquired;
  }
}

/**
 * Recalculate all members with thread safety
 * Prevents multiple users from running this simultaneously
 */
function recalcAllMembersThreadSafe() {
  const lock = new DistributedLock('recalc_members', 300000); // 5 minute timeout

  return lock.executeWithLock(function() {
    // Call the actual recalculation function
    if (typeof recalcAllMembers === 'function') {
      return recalcAllMembers();
    }

    throw new Error('recalcAllMembers function not found');
  });
}

/**
 * Recalculate all grievances with thread safety
 */
function recalcAllGrievancesThreadSafe() {
  const lock = new DistributedLock('recalc_grievances', 300000); // 5 minute timeout

  return lock.executeWithLock(function() {
    // Call the batched recalculation if available
    if (typeof recalcAllGrievancesBatched === 'function') {
      return recalcAllGrievancesBatched();
    }

    throw new Error('recalcAllGrievancesBatched function not found');
  });
}

/**
 * Rebuild dashboard with thread safety
 */
function rebuildDashboardThreadSafe() {
  const lock = new DistributedLock('rebuild_dashboard', 300000); // 5 minute timeout

  return lock.executeWithLock(function() {
    // Call the optimized rebuild if available, otherwise standard rebuild
    if (typeof rebuildDashboardOptimized === 'function') {
      return rebuildDashboardOptimized();
    } else if (typeof rebuildDashboard === 'function') {
      return rebuildDashboard();
    }

    throw new Error('rebuildDashboard function not found');
  });
}

/**
 * Seed data with thread safety
 * Prevents multiple seeding operations from running concurrently
 */
function seedDataThreadSafe() {
  const lock = new DistributedLock('seed_data', 600000); // 10 minute timeout

  return lock.executeWithLock(function() {
    if (typeof seedAllWithRollback === 'function') {
      return seedAllWithRollback();
    } else {
      // Fallback to standard seeding (v3.51 - uses SeedNuke.gs)
      if (typeof SEED_MEMBERS === 'function') {
        SEED_MEMBERS(500);
      }

      if (typeof SEED_GRIEVANCES === 'function') {
        SEED_GRIEVANCES(200);
      }
    }
  });
}

/**
 * Clear all data with thread safety
 */
function clearAllDataThreadSafe() {
  const lock = new DistributedLock('clear_data', 300000); // 5 minute timeout

  return lock.executeWithLock(function() {
    if (typeof NUKE_ALL_DATA === 'function') {
      return NUKE_ALL_DATA();
    }

    throw new Error('NUKE_ALL_DATA function not found');
  });
}

/**
 * Generic wrapper to make any function thread-safe
 * @param {Function} fn - Function to wrap
 * @param {string} resourceName - Name for the lock resource
 * @param {number} timeout - Lock timeout in milliseconds
 * @returns {Function} Thread-safe version of the function
 */
function makeThreadSafe(fn, resourceName, timeout = 30000) {
  return function(...args) {
    const lock = new DistributedLock(resourceName, timeout);

    return lock.executeWithLock(function() {
      return fn.apply(this, args);
    });
  };
}

/**
 * Example usage: Create thread-safe versions of critical functions
 */
function createThreadSafeFunctions() {
  // These would be used to wrap existing functions
  const examples = {
    // Recalculation operations (5 minute timeout for long operations)
    recalcAllMembersThreadSafe: makeThreadSafe(
      recalcAllMembers,
      'recalc_members',
      300000
    ),

    recalcAllGrievancesThreadSafe: makeThreadSafe(
      recalcAllGrievancesBatched,
      'recalc_grievances',
      300000
    ),

    // Dashboard operations (5 minute timeout)
    rebuildDashboardThreadSafe: makeThreadSafe(
      rebuildDashboard,
      'rebuild_dashboard',
      300000
    ),

    // Batch operations (10 minute timeout for very long operations)
    batchUpdateThreadSafe: makeThreadSafe(
      batchUpdateGrievances,
      'batch_update',
      600000
    ),

    // Backup operations (10 minute timeout)
    createBackupThreadSafe: makeThreadSafe(
      createIncrementalBackup,
      'create_backup',
      600000
    )
  };

  Logger.log('Thread-safe function wrappers created');
  return examples;
}

/**
 * Check for concurrent operations
 * Shows which resources are currently locked
 *
 * Note: LockService doesn't provide a way to query current locks,
 * so we track them in script properties
 */
function checkConcurrentOperations() {
  const props = PropertiesService.getScriptProperties();
  const locks = props.getProperty('ACTIVE_LOCKS');

  if (!locks) {
    return {
      active: false,
      locks: [],
      message: 'No operations currently in progress'
    };
  }

  const activeLocks = JSON.parse(locks);

  return {
    active: true,
    locks: activeLocks,
    message: `${activeLocks.length} operation(s) in progress: ${activeLocks.join(', ')}`
  };
}

/**
 * Force release all locks
 * Use with caution - only for emergency situations
 */
function forceReleaseAllLocks() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Force Release Locks?',
    'WARNING: This will force-release all locks.\n\n' +
    'Only use this if operations are stuck and cannot complete.\n\n' +
    'Are you sure?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    // Clear script properties tracking locks
    const props = PropertiesService.getScriptProperties();
    props.deleteProperty('ACTIVE_LOCKS');

    // Note: We cannot actually force-release LockService locks
    // They will automatically release after 30 seconds
    ui.alert(
      'Locks Cleared',
      'Lock tracking has been cleared.\n\n' +
      'Note: Active Google LockService locks will automatically release after their timeout period.',
      ui.ButtonSet.OK
    );

    if (typeof auditLog === 'function') {
      auditLog('FORCE_RELEASE_LOCKS', {
        user: Session.getActiveUser().getEmail(),
        status: 'SUCCESS'
      });
    }

  } catch (error) {
    ui.alert(
      'Error',
      `Failed to release locks: ${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Show lock status in UI
 */
function showLockStatus() {
  const ui = SpreadsheetApp.getUi();
  const status = checkConcurrentOperations();

  let message;

  if (status.active) {
    message = `Active Operations:\n\n`;

    for (const lock of status.locks) {
      message += `• ${lock}\n`;
    }

    message += `\nThese operations are currently in progress and have acquired locks.\n`;
    message += `Wait for them to complete before running similar operations.`;

  } else {
    message = 'No operations currently in progress.\n\n';
    message += 'All resources are available for use.';
  }

  ui.alert('Lock Status', message, ui.ButtonSet.OK);
}

/**
 * Menu function to check lock status
 */
function CHECK_LOCK_STATUS() {
  showLockStatus();
}

/**
 * Example of batch operation with locking
 * Shows how to protect batch updates from concurrent access
 */
function batchUpdateWithLock(updates) {
  const lock = new DistributedLock('batch_update', 600000); // 10 minutes

  return lock.executeWithLock(function() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

    // Perform batch updates
    let updateCount = 0;

    for (const update of updates) {
      // Apply each update
      const row = update.row;
      const values = update.values;

      sheet.getRange(row, 1, 1, values.length).setValues([values]);
      updateCount++;
    }

    Logger.log(`Batch update completed: ${updateCount} rows updated`);

    return {
      updated: updateCount,
      message: `Successfully updated ${updateCount} rows`
    };
  });
}
