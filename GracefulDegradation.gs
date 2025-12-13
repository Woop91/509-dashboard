/****************************************************
 * GRACEFUL DEGRADATION FRAMEWORK
 * Phase 6 - High Priority
 *
 * System remains partially functional during failures
 * Provides fallback mechanisms for critical operations
 *
 * Based on ADDITIONAL_ENHANCEMENTS.md Phase 2
 ****************************************************/

/**
 * Execute operation with graceful degradation
 * Tries primary function, falls back to secondary, then minimal
 *
 * @param {Function} primaryFn - Primary function to try
 * @param {Function} fallbackFn - Fallback function if primary fails
 * @param {Function} minimalFn - Minimal function as last resort
 * @returns {*} Result from whichever function succeeds
 */
function withGracefulDegradation(primaryFn, fallbackFn, minimalFn) {
  const errors = [];

  // Validate that all parameters are functions
  if (typeof primaryFn !== 'function') {
    throw new Error('primaryFn must be a function');
  }
  if (typeof fallbackFn !== 'function') {
    throw new Error('fallbackFn must be a function');
  }
  if (typeof minimalFn !== 'function') {
    throw new Error('minimalFn must be a function');
  }

  // Try primary function
  try {
    Logger.log('Attempting primary function...');
    const result = primaryFn();
    Logger.log('✅ Primary function succeeded');
    return result;

  } catch (primaryError) {
    Logger.log(`⚠️ Primary function failed: ${primaryError.message}`);
    errors.push({ level: 'primary', error: primaryError });

    // Try fallback function
    try {
      Logger.log('Attempting fallback function...');
      const result = fallbackFn();
      Logger.log('✅ Fallback function succeeded');

      // Log that we had to use fallback
      if (typeof logError === 'function') {
        logError(primaryError, 'GracefulDegradation.primary', 'WARNING');
      }

      return result;

    } catch (fallbackError) {
      Logger.log(`⚠️ Fallback function failed: ${fallbackError.message}`);
      errors.push({ level: 'fallback', error: fallbackError });

      // Try minimal function as last resort
      try {
        Logger.log('Attempting minimal function...');
        const result = minimalFn();
        Logger.log('✅ Minimal function succeeded');

        // Log that we had to use minimal
        if (typeof logError === 'function') {
          logError(fallbackError, 'GracefulDegradation.fallback', 'ERROR');
        }

        return result;

      } catch (minimalError) {
        Logger.log(`❌ Minimal function failed: ${minimalError.message}`);
        errors.push({ level: 'minimal', error: minimalError });

        // All functions failed - log critical error
        if (typeof logError === 'function') {
          logError(
            new Error(`All degradation levels failed: ${errors.map(function(e) { return e.error.message; }).join('; ')}`),
            'GracefulDegradation.complete_failure',
            'CRITICAL'
          );
        }

        // Throw aggregate error
        throw new Error(
          `Complete failure - all degradation levels failed:\n` +
          errors.map(function(e) { return `${e.level}: ${e.error.message}`; }).join('\n')
        );
      }
    }
  }
}

/**
 * Rebuild dashboard with graceful degradation
 * Primary: Full rebuild with all charts
 * Fallback: Rebuild with minimal charts (KPIs only)
 * Minimal: Show cached dashboard or basic metrics
 */
function rebuildDashboardSafe() {
  return withGracefulDegradation(
    // Primary: Full rebuild (optimized if available)
    function() {
      if (typeof rebuildDashboardOptimized === 'function') {
        return rebuildDashboardOptimized();
      } else if (typeof rebuildDashboard === 'function') {
        return rebuildDashboard();
      }
      throw new Error('No rebuild function available');
    },

    // Fallback: Minimal rebuild (KPIs only, no charts)
    function() {
      return rebuildDashboardMinimal();
    },

    // Minimal: Show cached dashboard
    function() {
      return showCachedDashboard();
    }
  );
}

/**
 * Rebuild dashboard with minimal features (KPIs only)
 * Used as fallback when full rebuild fails
 */
function rebuildDashboardMinimal() {
  Logger.log('Building minimal dashboard (KPIs only)...');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName(SHEETS.DASHBOARD);

  // Auto-create missing sheets
  if (!dashboard) {
    Logger.log('Dashboard sheet not found - auto-creating via setupRequiredSheets()');
    setupRequiredSheets();
    dashboard = ss.getSheetByName(SHEETS.DASHBOARD);
    if (!dashboard) {
      throw new Error('Failed to create Dashboard sheet');
    }
  }

  let memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  let grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!memberSheet || !grievanceSheet) {
    Logger.log('Required sheets not found - auto-creating via setupRequiredSheets()');
    setupRequiredSheets();
    memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
    grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
    if (!memberSheet || !grievanceSheet) {
      throw new Error('Failed to create required sheets');
    }
  }

  try {
    // Clear existing content
    dashboard.clear();

    // Set basic title
    dashboard.getRange('A1').setValue('509 Dashboard - Minimal Mode');
    dashboard.getRange('A2').setValue('(Limited functionality due to system issues)');

    // Calculate basic KPIs
    const memberData = memberSheet.getDataRange().getValues();
    const grievanceData = grievanceSheet.getDataRange().getValues();

    const totalMembers = memberData.length - 1;
    const totalGrievances = grievanceData.length - 1;

    // Count open grievances using GRIEVANCE_COLS.STATUS constant
    let openGrievances = 0;
    for (let i = 1; i < grievanceData.length; i++) {
      if (grievanceData[i][GRIEVANCE_COLS.STATUS - 1] === 'Open') {
        openGrievances++;
      }
    }

    // Display KPIs
    dashboard.getRange('A4').setValue('Total Members:');
    dashboard.getRange('B4').setValue(totalMembers);

    dashboard.getRange('A5').setValue('Total Grievances:');
    dashboard.getRange('B5').setValue(totalGrievances);

    dashboard.getRange('A6').setValue('Open Grievances:');
    dashboard.getRange('B6').setValue(openGrievances);

    dashboard.getRange('A8').setValue('Last Updated:');
    dashboard.getRange('B8').setValue(new Date());

    Logger.log('✅ Minimal dashboard built successfully');

    return {
      mode: 'minimal',
      message: 'Dashboard rebuilt with minimal features',
      kpis: {
        members: totalMembers,
        grievances: totalGrievances,
        open: openGrievances
      }
    };

  } catch (error) {
    Logger.log(`❌ Minimal dashboard build failed: ${error.message}`);
    throw error;
  }
}

/**
 * Show cached dashboard data
 * Last resort fallback - displays last known good state
 */
function showCachedDashboard() {
  Logger.log('Attempting to show cached dashboard...');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName(SHEETS.DASHBOARD);

  // Auto-create Dashboard sheet if missing
  if (!dashboard) {
    Logger.log('Dashboard sheet not found - auto-creating via setupRequiredSheets()');
    setupRequiredSheets();
    dashboard = ss.getSheetByName(SHEETS.DASHBOARD);
    if (!dashboard) {
      throw new Error('Failed to create Dashboard sheet');
    }
  }

  // Check if we have cached data
  const cache = CacheService.getScriptCache();
  const cachedData = cache.get('dashboard_snapshot');

  if (!cachedData) {
    // No cached data - show error message
    dashboard.clear();
    dashboard.getRange('A1').setValue('Dashboard Unavailable');
    dashboard.getRange('A2').setValue('No cached data available. Please contact administrator.');

    return {
      mode: 'error',
      message: 'No cached dashboard data available'
    };
  }

  try {
    // Restore cached data
    const data = JSON.parse(cachedData);

    dashboard.clear();
    dashboard.getRange('A1').setValue('509 Dashboard - Cached Data');
    dashboard.getRange('A2').setValue(`(Showing data from: ${data.timestamp})`);

    // Display cached KPIs
    dashboard.getRange('A4').setValue('Total Members:');
    dashboard.getRange('B4').setValue(data.kpis.members);

    dashboard.getRange('A5').setValue('Total Grievances:');
    dashboard.getRange('B5').setValue(data.kpis.grievances);

    dashboard.getRange('A6').setValue('Open Grievances:');
    dashboard.getRange('B6').setValue(data.kpis.open);

    Logger.log('✅ Cached dashboard displayed');

    return {
      mode: 'cached',
      message: 'Displayed cached dashboard',
      timestamp: data.timestamp
    };

  } catch (error) {
    Logger.log(`❌ Failed to show cached dashboard: ${error.message}`);
    throw error;
  }
}

/**
 * Cache current dashboard state
 * Call this after successful dashboard rebuild
 */
function cacheDashboardState() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
    const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

    if (!memberSheet || !grievanceSheet) {
      return;
    }

    const memberData = memberSheet.getDataRange().getValues();
    const grievanceData = grievanceSheet.getDataRange().getValues();

    const totalMembers = memberData.length - 1;
    const totalGrievances = grievanceData.length - 1;

    let openGrievances = 0;
    for (let i = 1; i < grievanceData.length; i++) {
      if (grievanceData[i][GRIEVANCE_COLS.STATUS - 1] === 'Open') {
        openGrievances++;
      }
    }

    const snapshot = {
      timestamp: new Date().toISOString(),
      kpis: {
        members: totalMembers,
        grievances: totalGrievances,
        open: openGrievances
      }
    };

    const cache = CacheService.getScriptCache();
    cache.put('dashboard_snapshot', JSON.stringify(snapshot), 21600); // 6 hours

    Logger.log('Dashboard state cached successfully');

  } catch (error) {
    Logger.log(`Failed to cache dashboard state: ${error.message}`);
  }
}

/**
 * Recalculate members with graceful degradation
 */
function recalcMembersSafe() {
  return withGracefulDegradation(
    // Primary: Batched recalculation
    function() {
      if (typeof recalcAllMembers === 'function') {
        return recalcAllMembers();
      }
      throw new Error('recalcAllMembers not available');
    },

    // Fallback: Recalculate just grievance status fields
    function() {
      return recalcMembersGrievanceFieldsOnly();
    },

    // Minimal: Skip recalculation, return success
    function() {
      Logger.log('Skipping member recalculation (minimal mode)');
      return { mode: 'minimal', message: 'Recalculation skipped' };
    }
  );
}

/**
 * Recalculate only grievance-related fields in Member Directory
 * Used as fallback when full recalculation fails
 */
function recalcMembersGrievanceFieldsOnly() {
  Logger.log('Recalculating members (grievance fields only)...');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!memberSheet || !grievanceSheet) {
    throw new Error('Required sheets not found');
  }

  const memberData = memberSheet.getDataRange().getValues();
  const grievanceData = grievanceSheet.getDataRange().getValues();

  const updates = [];

  // For each member, find their open grievances
  for (let i = 1; i < memberData.length; i++) {
    const memberID = memberData[i][MEMBER_COLS.MEMBER_ID - 1];
    let hasOpen = 'No';
    let status = '';
    let deadline = '';

    // Find grievances for this member
    for (let j = 1; j < grievanceData.length; j++) {
      if (grievanceData[j][GRIEVANCE_COLS.MEMBER_ID - 1] === memberID &&
          grievanceData[j][GRIEVANCE_COLS.STATUS - 1] === 'Open') {
        hasOpen = 'Yes';
        status = grievanceData[j][GRIEVANCE_COLS.STATUS - 1];
        deadline = grievanceData[j][GRIEVANCE_COLS.NEXT_ACTION_DUE - 1] || '';
        break;
      }
    }

    updates.push([hasOpen, status, deadline]);
  }

  // Update Has Open Grievance (AB), Grievance Status (AC), Next Deadline (AD)
  if (updates.length > 0) {
    memberSheet.getRange(2, MEMBER_COLS.HAS_OPEN_GRIEVANCE, updates.length, 3).setValues(updates);
  }

  Logger.log(`✅ Updated grievance fields for ${updates.length} members`);

  return {
    mode: 'partial',
    updated: updates.length,
    message: 'Updated grievance fields only'
  };
}

/**
 * Seed data with graceful degradation
 */
function seedDataSafe() {
  return withGracefulDegradation(
    // Primary: Full seed with rollback protection
    function() {
      if (typeof seedAllWithRollback === 'function') {
        return seedAllWithRollback();
      }
      throw new Error('seedAllWithRollback not available');
    },

    // Fallback: Seed without rollback protection (v3.51 - uses SeedNuke.gs)
    function() {
      Logger.log('Seeding without rollback protection...');
      if (typeof SEED_MEMBERS === 'function') {
        SEED_MEMBERS(500);
      }
      if (typeof SEED_GRIEVANCES === 'function') {
        SEED_GRIEVANCES(200);
      }
      return { mode: 'no-rollback', message: 'Seeded without rollback' };
    },

    // Minimal: Skip seeding
    function() {
      return { mode: 'skipped', message: 'Seeding skipped due to errors' };
    }
  );
}

/**
 * Menu function to rebuild dashboard safely
 */
function REBUILD_DASHBOARD_SAFE() {
  const ui = SpreadsheetApp.getUi();

  try {
    ui.alert('Rebuilding dashboard with graceful degradation...');

    const result = rebuildDashboardSafe();

    let message;
    if (result.mode === 'minimal') {
      message = 'Dashboard rebuilt in MINIMAL mode.\n\n' +
                'Only basic KPIs are displayed.\n\n' +
                'Please check system logs for errors.';
    } else if (result.mode === 'cached') {
      message = 'Displaying CACHED dashboard.\n\n' +
                `Data from: ${result.timestamp}\n\n` +
                'Current rebuild failed. Please check system logs.';
    } else {
      message = 'Dashboard rebuilt successfully!';
    }

    ui.alert('Dashboard Rebuild Complete', message, ui.ButtonSet.OK);

  } catch (error) {
    ui.alert(
      'Dashboard Rebuild Failed',
      `All rebuild attempts failed:\n\n${error.message}`,
      ui.ButtonSet.OK
    );
  }
}
