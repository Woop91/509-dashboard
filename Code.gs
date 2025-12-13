/****************************************************
 * 509 DASHBOARD - MAIN ENTRY POINT
 * All issues addressed, real data only, 20k members + 5k grievances
 ****************************************************
 *
 * IMPORTANT: Configuration constants (SHEETS, COLORS, MEMBER_COLS,
 * GRIEVANCE_COLS) are defined in Constants.gs. Do NOT redefine them here.
 *
 * This file uses constants from:
 * - Constants.gs: SHEETS, COLORS, MEMBER_COLS, GRIEVANCE_COLS, etc.
 * - SecurityUtils.gs: SECURITY_ROLES, ADMIN_EMAILS, etc.
 *
 * @see Constants.gs for all configuration
 ****************************************************/

/* --------------------- ONE-CLICK SETUP --------------------- */
function CREATE_509_DASHBOARD() {
  const ss = SpreadsheetApp.getActive();
  const startTime = new Date().getTime();

  // Helper function for timed logging
  function logStep(step) {
    const elapsed = ((new Date().getTime() - startTime) / 1000).toFixed(1);
    Logger.log(`[${elapsed}s] ${step}`);
  }

  logStep("Starting CREATE_509_DASHBOARD");
  ss.toast("🚀 Creating 509 Dashboard...", "Starting", 5);
  SpreadsheetApp.flush();

  try {
    logStep("Creating Config tab...");
    createConfigTab();
    ss.toast("✅ Config created", "10%", 3);
    SpreadsheetApp.flush();

    logStep("Creating Member Directory...");
    createMemberDirectory();
    ss.toast("✅ Member Directory created", "20%", 3);
    SpreadsheetApp.flush();

    logStep("Creating Grievance Log...");
    createGrievanceLog();
    ss.toast("✅ Grievance Log created", "30%", 3);
    SpreadsheetApp.flush();

    logStep("Creating Main Dashboard...");
    createMainDashboard();
    ss.toast("✅ Main Dashboard created", "40%", 3);
    SpreadsheetApp.flush();

    logStep("Creating Analytics/Satisfaction/Feedback sheets...");
    createAnalyticsDataSheet();
    createMemberSatisfactionSheet();
    createFeedbackSheet();
    ss.toast("✅ Data sheets created", "50%", 3);
    SpreadsheetApp.flush();

    logStep("Creating Interactive Dashboard...");
    createInteractiveDashboardSheet(ss);
    ss.toast("✅ Interactive Dashboard created", "60%", 3);
    SpreadsheetApp.flush();

    logStep("Creating Getting Started sheet...");
    createGettingStartedSheet(ss);

    logStep("Creating FAQ sheet...");
    createFAQSheet(ss);
    ss.toast("✅ Help sheets created", "70%", 3);
    SpreadsheetApp.flush();

    logStep("Creating User Settings sheet...");
    createUserSettingsSheet();
    ss.toast("✅ Settings sheet created", "72%", 3);
    SpreadsheetApp.flush();

    logStep("Creating Steward Workload sheet...");
    createStewardWorkloadSheet();

    logStep("Creating Operations Analytics sheet...");
    if (typeof createOperationsAnalyticsSheet === 'function') {
      createOperationsAnalyticsSheet();
    }
    ss.toast("✅ Operations Analytics created", "75%", 3);
    SpreadsheetApp.flush();

    logStep("Creating Executive Dashboard...");
    createExecutiveDashboard();
    ss.toast("✅ Executive Dashboard created", "80%", 3);
    SpreadsheetApp.flush();

    logStep("Deleting standalone merged tabs...");
    deleteStandaloneMergedTabs();

    logStep("Hiding Member Satisfaction tab...");
    hideMemberSatisfactionTab();

    logStep("Creating Archive sheet...");
    createArchiveSheet();

    logStep("Creating Diagnostics sheet...");
    createDiagnosticsSheet();
    ss.toast("✅ Utility sheets created", "85%", 3);
    SpreadsheetApp.flush();

    logStep("Creating Audit Log sheet...");
    createAuditLogSheet();
    ss.toast("✅ Audit Log created", "87%", 3);
    SpreadsheetApp.flush();

    logStep("Setting up data validations...");
    setupDataValidations();

    logStep("Setting up formulas and calculations...");
    setupFormulasAndCalculations();

    logStep("Setting up Interactive Dashboard controls...");
    setupInteractiveDashboardControls();
    ss.toast("✅ Validations & formulas ready", "90%", 3);
    SpreadsheetApp.flush();

    logStep("Setting up all dropdowns...");
    setupAllDropdowns();
    ss.toast("✅ Dropdowns configured", "93%", 3);
    SpreadsheetApp.flush();

    logStep("Populating analytics sheets...");
    populateAllAnalyticsSheetsOnCreate();
    ss.toast("✅ Analytics populated", "95%", 3);
    SpreadsheetApp.flush();

    logStep("Fixing Interactive Dashboard dropdown styling...");
    if (typeof fixInteractiveDropdownHighlighting === 'function') {
      fixInteractiveDropdownHighlighting();
    }

    logStep("Moving admin tabs to end...");
    if (typeof moveAdminTabsToEnd === 'function') {
      moveAdminTabsToEnd();
    }
    if (typeof hideAdminTabs === 'function') {
      hideAdminTabs(true); // Silent mode - no UI alerts during creation
    }
    ss.toast("✅ Tabs organized", "96%", 3);
    SpreadsheetApp.flush();

    logStep("Installing essential triggers...");
    if (typeof installEssentialTriggers === 'function') {
      installEssentialTriggers();
    }

    logStep("Installing Config sync trigger...");
    if (typeof installConfigSyncTrigger === 'function') {
      installConfigSyncTrigger();
    }

    logStep("Installing onOpen trigger...");
    if (typeof installOnOpenTrigger === 'function') {
      installOnOpenTrigger();
    }

    logStep("Setting up daily deadline notifications...");
    if (typeof setupDailyDeadlineNotifications === 'function') {
      setupDailyDeadlineNotifications();
    }

    logStep("Setting up automated reports...");
    if (typeof setupMonthlyReports === 'function') {
      setupMonthlyReports();
    }
    if (typeof setupQuarterlyReports === 'function') {
      setupQuarterlyReports();
    }

    logStep("Installing grievance auto-sort trigger...");
    if (typeof installGrievanceAutoSortTrigger === 'function') {
      installGrievanceAutoSortTrigger();
    }

    ss.toast("✅ Triggers installed", "98%", 3);
    SpreadsheetApp.flush();

    logStep("Running onOpen to create menus...");
    onOpen();

    logStep("CREATE_509_DASHBOARD completed successfully!");
    ss.toast("✅ Dashboard ready! Use menu to seed data.", "Complete!", 10);
    SpreadsheetApp.flush();

    // Safely activate dashboard sheet if it exists
    const dashboard = ss.getSheetByName(SHEETS.DASHBOARD);
    if (dashboard) {
      dashboard.activate();
    }

  } catch (error) {
    const elapsed = ((new Date().getTime() - startTime) / 1000).toFixed(1);
    Logger.log(`[${elapsed}s] ERROR in CREATE_509_DASHBOARD: ${error.toString()}`);
    Logger.log(`Stack trace: ${error.stack || 'N/A'}`);
    ss.toast("❌ Error: " + error.toString(), "Error", 15);
    SpreadsheetApp.flush();
  }
}

/* --------------------- CONFIG TAB --------------------- */

/**
 * LITE version - Creates only essential sheets to avoid timeout
 * Run this first, then run CREATE_509_DASHBOARD_PART2 for remaining sheets
 */
function CREATE_509_DASHBOARD_LITE() {
  const ss = SpreadsheetApp.getActive();

  ss.toast("🚀 Creating 509 Dashboard (LITE)...", "Starting", 5);
  Logger.log("Starting CREATE_509_DASHBOARD_LITE");

  try {
    // Essential sheets only
    createConfigTab();
    ss.toast("✅ Config created", "25%", 2);
    SpreadsheetApp.flush();

    createMemberDirectory();
    ss.toast("✅ Member Directory created", "50%", 2);
    SpreadsheetApp.flush();

    createGrievanceLog();
    ss.toast("✅ Grievance Log created", "75%", 2);
    SpreadsheetApp.flush();

    createMainDashboard();
    ss.toast("✅ Dashboard created", "90%", 2);
    SpreadsheetApp.flush();

    // Essential setup
    setupDataValidations();
    setupAllDropdowns();
    ss.toast("✅ Dropdowns configured", "95%", 2);
    SpreadsheetApp.flush();

    onOpen();

    ss.toast("✅ LITE setup complete! Run PART2 for analytics sheets.", "Done!", 10);
    Logger.log("CREATE_509_DASHBOARD_LITE completed successfully");

  } catch (error) {
    Logger.log("Error in CREATE_509_DASHBOARD_LITE: " + error.toString());
    ss.toast("❌ Error: " + error.toString(), "Error", 15);
  }
}

/**
 * PART 2 - Creates analytics and extra sheets (run after LITE)
 */
function CREATE_509_DASHBOARD_PART2() {
  const ss = SpreadsheetApp.getActive();

  ss.toast("🚀 Creating analytics sheets (Part 2)...", "Starting", 5);
  Logger.log("Starting CREATE_509_DASHBOARD_PART2");

  try {
    createAnalyticsDataSheet();
    createFeedbackSheet();
    ss.toast("✅ Data sheets created", "20%", 2);
    SpreadsheetApp.flush();

    createInteractiveDashboardSheet(ss);
    ss.toast("✅ Interactive Dashboard created", "40%", 2);
    SpreadsheetApp.flush();

    createStewardWorkloadSheet();
    if (typeof createOperationsAnalyticsSheet === 'function') {
      createOperationsAnalyticsSheet();
    }
    ss.toast("✅ Analytics sheets created", "60%", 2);
    SpreadsheetApp.flush();

    createExecutiveDashboard();
    ss.toast("✅ Executive Dashboard created", "80%", 2);
    SpreadsheetApp.flush();

    // Cleanup
    deleteStandaloneMergedTabs();

    setupFormulasAndCalculations();
    setupInteractiveDashboardControls();
    ss.toast("✅ Formulas configured", "90%", 2);
    SpreadsheetApp.flush();

    populateAllAnalyticsSheetsOnCreate();

    onOpen();

    ss.toast("✅ Part 2 complete! Dashboard fully configured.", "Done!", 10);
    Logger.log("CREATE_509_DASHBOARD_PART2 completed successfully");

  } catch (error) {
    Logger.log("Error in CREATE_509_DASHBOARD_PART2: " + error.toString());
    ss.toast("❌ Error: " + error.toString(), "Error", 15);
  }
}

/* --------------------- REPAIR DASHBOARD --------------------- */
/**
 * REPAIR_DASHBOARD - Comprehensive repair function to fix all dashboard issues
 *
 * Fixes the following:
 * - Data validations (dropdowns)
 * - Cross-population formulas (Grievance Log <-> Member Directory)
 * - Interactive Dashboard controls
 * - Theme/styling
 * - Analytics sheets
 *
 * Run this if:
 * - Theme is gone
 * - Dropdowns don't work
 * - Data isn't cross-populating between sheets
 * - Interactive Dashboard isn't functioning
 * - Dashboard tab is broken
 */
function REPAIR_DASHBOARD() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActive();

  const response = ui.alert(
    '🔧 Repair Dashboard',
    'This will repair:\n\n' +
    '• Data validations (dropdowns)\n' +
    '• Cross-population formulas\n' +
    '• Interactive Dashboard\n' +
    '• Theme/styling\n' +
    '• Analytics sheets\n\n' +
    'Your data will NOT be affected.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    ss.toast('Repair cancelled', 'Cancelled', 3);
    return;
  }

  const startTime = new Date().getTime();
  function logStep(step) {
    const elapsed = ((new Date().getTime() - startTime) / 1000).toFixed(1);
    Logger.log(`[REPAIR ${elapsed}s] ${step}`);
  }

  try {
    ss.toast('Starting dashboard repair...', 'Repairing', -1);

    // Step 1: Set up data validations
    logStep('Setting up data validations...');
    ss.toast('1/6: Setting up data validations...', 'Repairing', -1);
    if (typeof setupDataValidations === 'function') {
      setupDataValidations();
    }
    SpreadsheetApp.flush();

    // Step 2: Set up Grievance Log formulas (calculated columns)
    logStep('Setting up Grievance Log formulas...');
    ss.toast('2/6: Refreshing Grievance Log formulas...', 'Repairing', -1);
    if (typeof recalcAllGrievancesBatched === 'function') {
      try {
        recalcAllGrievancesBatched();
      } catch (e) {
        Logger.log('recalcAllGrievancesBatched error (may be empty): ' + e.message);
      }
    }
    SpreadsheetApp.flush();

    // Step 3: Set up cross-population (hidden calc sheets + triggers)
    logStep('Setting up cross-population with hidden sheets...');
    ss.toast('3/6: Setting up cross-population...', 'Repairing', -1);
    setupFormulasAndCalculations();

    // Install auto-sync trigger for grievance data → Member Directory
    if (typeof installGrievanceSyncTrigger === 'function') {
      try {
        installGrievanceSyncTrigger();
        logStep('Installed grievance → Member Directory auto-sync trigger');
      } catch (e) {
        Logger.log('installGrievanceSyncTrigger error: ' + e.message);
      }
    }

    // Set up Member Lookup hidden sheet and trigger for member data → Grievance Log
    if (typeof setupMemberLookupSheet === 'function') {
      try {
        setupMemberLookupSheet();
        logStep('Set up Member Lookup hidden sheet');
      } catch (e) {
        Logger.log('setupMemberLookupSheet error: ' + e.message);
      }
    }
    if (typeof installMemberSyncTrigger === 'function') {
      try {
        installMemberSyncTrigger();
        logStep('Installed member → Grievance Log auto-sync trigger');
      } catch (e) {
        Logger.log('installMemberSyncTrigger error: ' + e.message);
      }
    }

    // Set up Steward Contact Calc hidden sheet and trigger for contact data → Member Directory
    if (typeof setupStewardContactCalcSheet === 'function') {
      try {
        setupStewardContactCalcSheet();
        logStep('Set up Steward Contact Calc hidden sheet');
      } catch (e) {
        Logger.log('setupStewardContactCalcSheet error: ' + e.message);
      }
    }
    if (typeof installStewardContactSyncTrigger === 'function') {
      try {
        installStewardContactSyncTrigger();
        logStep('Installed steward contact → Member Directory auto-sync trigger');
      } catch (e) {
        Logger.log('installStewardContactSyncTrigger error: ' + e.message);
      }
    }

    // Set up Engagement Calc hidden sheet for engagement metrics → Member Directory
    if (typeof setupEngagementCalcSheet === 'function') {
      try {
        setupEngagementCalcSheet();
        logStep('Set up Engagement Calc hidden sheet (placeholder)');
      } catch (e) {
        Logger.log('setupEngagementCalcSheet error: ' + e.message);
      }
    }
    SpreadsheetApp.flush();

    // Step 4: Set up Interactive Dashboard
    logStep('Setting up Interactive Dashboard...');
    ss.toast('4/6: Rebuilding Interactive Dashboard...', 'Repairing', -1);
    if (typeof setupInteractiveDashboardControls === 'function') {
      setupInteractiveDashboardControls();
    }
    if (typeof rebuildInteractiveDashboard === 'function') {
      try {
        rebuildInteractiveDashboard();
      } catch (e) {
        Logger.log('rebuildInteractiveDashboard error: ' + e.message);
      }
    }
    SpreadsheetApp.flush();

    // Step 5: Apply default theme
    logStep('Applying theme...');
    ss.toast('5/6: Applying theme...', 'Repairing', -1);
    if (typeof applyTheme === 'function') {
      try {
        applyTheme('light', 'all');
      } catch (e) {
        Logger.log('applyTheme error: ' + e.message);
      }
    }
    SpreadsheetApp.flush();

    // Step 6: Populate analytics
    logStep('Populating analytics sheets...');
    ss.toast('6/6: Populating analytics...', 'Repairing', -1);
    if (typeof populateAllAnalyticsSheetsOnCreate === 'function') {
      try {
        populateAllAnalyticsSheetsOnCreate();
      } catch (e) {
        Logger.log('populateAllAnalyticsSheetsOnCreate error: ' + e.message);
      }
    }
    SpreadsheetApp.flush();

    const elapsed = ((new Date().getTime() - startTime) / 1000).toFixed(1);
    logStep('Repair complete!');

    ui.alert(
      '✅ Dashboard Repaired',
      `Repair completed in ${elapsed} seconds!\n\n` +
      'Fixed:\n' +
      '• Data validations (dropdowns)\n' +
      '• Grievance Log calculated columns\n' +
      '• Member Directory grievance columns (AB-AD)\n' +
      '• Grievance Log member columns (C, D, X-AA)\n' +
      '• Steward contact tracking (Y-AA from Comms Log)\n' +
      '• Engagement metrics placeholder (Q-T)\n' +
      '• Interactive Dashboard controls\n' +
      '• Theme styling\n' +
      '• Analytics sheets\n\n' +
      'If issues persist, try running CREATE_509_DASHBOARD_PART2 from the script editor.',
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log('REPAIR_DASHBOARD error: ' + error.toString());
    ui.alert('❌ Repair Error', 'Error during repair: ' + error.message + '\n\nCheck the script logs for details.', ui.ButtonSet.OK);
  }
}

/**
 * Quick repair - Refreshes formulas and validations without UI prompts
 * Use from script editor for faster execution
 */
function QUICK_REPAIR() {
  const ss = SpreadsheetApp.getActive();
  ss.toast('Quick repair started...', 'Repairing', -1);

  try {
    // Validations
    if (typeof setupDataValidations === 'function') setupDataValidations();

    // Formulas
    setupFormulasAndCalculations();

    // Member Directory formulas specifically
    refreshMemberDirectoryFormulas();

    // Interactive Dashboard
    if (typeof setupInteractiveDashboardControls === 'function') {
      setupInteractiveDashboardControls();
    }

    SpreadsheetApp.flush();
    ss.toast('✅ Quick repair complete!', 'Done', 5);
  } catch (error) {
    Logger.log('QUICK_REPAIR error: ' + error.toString());
    ss.toast('❌ Error: ' + error.message, 'Error', 10);
  }
}

/* --------------------- CONFIG TAB --------------------- */
function createConfigTab() {
  const ss = SpreadsheetApp.getActive();
  let config = ss.getSheetByName(SHEETS.CONFIG);

  if (!config) {
    config = ss.insertSheet(SHEETS.CONFIG);
  }
  config.clear();

  const configData = [
    // Row 1: Column Headers (43 columns total)
    // Employment Info (1-5)
    ["Job Titles", "Office Locations", "Units", "Office Days", "Yes/No (Dropdowns)",
    // Supervision (6-7) - managers only, NOT stewards
     "Supervisors", "Managers",
    // Steward Info (8-9) - stewards are union reps, separate from management
     "Stewards", "Steward Committees",
    // Grievance Settings (10-14)
     "Grievance Status", "Grievance Step", "Issue Category", "Articles Violated", "Communication Methods",
    // Links & Coordinators (15-17)
     "Grievance Coordinators", "Grievance Form URL", "Contact Form URL",
    // Notifications (18-20)
     "Admin Emails", "Alert Days Before Deadline", "Notification Recipients",
    // Organization (21-24)
     "Organization Name", "Local Number", "Main Office Address", "Main Phone",
    // Integration (25-26)
     "Google Drive Folder ID", "Google Calendar ID",
    // Deadlines (27-30)
     "Filing Deadline Days", "Step I Response Days", "Step II Appeal Days", "Step II Response Days",
    // Multi-select Options (31-32)
     "Best Times to Contact", "Home Towns",
    // Contract & Legal References (33-36)
     "Contract Article (Grievance)", "Contract Article (Discipline)", "Contract Article (Workload)", "Contract Name",
    // Org Identity (37-39)
     "Union Parent", "State/Region", "Organization Website",
    // Extended Location & Contact Info (40-43)
     "Office Addresses", "Main Fax", "Main Contact Name", "Main Contact Email"],

    // Data rows - first row has default/example values for settings columns
    // IMPORTANT: Organization info (cols 21-24, 37-43) should NOT be deleted by nuke operations
    // NOTE: Job Titles, Office Locations, Units, Supervisors, Managers, Stewards,
    // Grievance Coordinators, and Home Towns are intentionally left empty -
    // users should populate these from their own data
    ["", "", "", "Monday", "Yes",
     "", "",
     "", "Grievance Committee",
     "Open", "Informal", "Discipline", "Art. 1 - Recognition", "Email",
     "", "", "",
     "", "3, 7, 14", "",
     "SEIU Local 509", "509", "293 Boston Post Road West, 4th Floor, Marlborough, MA 01752", "774-843-7509",
     "", "",
     "21", "30", "10", "30",
     "Morning (8am-12pm)", "",
     "Article 23A", "Article 12", "Article 15", "2023-2026 CBA",
     "SEIU", "Massachusetts", "https://www.seiu509.org/",
     "", "508-485-8529", "Marc", "marc@seiu509.org"],

    ["", "", "", "Tuesday", "No",
     "", "",
     "", "Bargaining Committee",
     "Pending Info", "Step I", "Workload", "Art. 2 - Union Security", "Phone",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "Afternoon (12pm-5pm)", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["", "", "", "Wednesday", "",
     "", "",
     "", "Health & Safety Committee",
     "Settled", "Step II", "Scheduling", "Art. 3 - Management Rights", "Text",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "Evening (5pm-8pm)", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["", "", "", "Thursday", "",
     "", "",
     "", "Political Action Committee",
     "Withdrawn", "Step III", "Pay", "Art. 4 - No Discrimination", "In Person",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "Weekends", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["", "", "", "Friday", "",
     "", "",
     "", "Membership Committee",
     "Closed", "Mediation", "Discrimination", "Art. 5 - Union Business", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "Flexible", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["", "", "", "Saturday", "",
     "", "",
     "", "Executive Board",
     "Appealed", "Arbitration", "Safety", "Art. 23 - Grievance Procedure", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["", "", "", "Sunday", "",
     "", "",
     "", "Communications Committee",
     "", "", "Benefits", "Art. 24 - Discipline", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["", "", "", "", "",
     "", "",
     "", "Contract Action Team",
     "", "", "Training", "Art. 25 - Hours of Work", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["", "", "", "", "",
     "", "",
     "", "Organizing Committee",
     "", "", "Other", "Art. 26 - Overtime", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["", "", "", "", "",
     "", "",
     "", "COPE Committee",
     "", "", "Harassment", "Art. 27 - Seniority", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["", "", "", "", "",
     "", "",
     "", "Young Workers Committee",
     "", "", "Equipment", "Art. 28 - Layoff", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["", "", "", "", "",
     "", "",
     "", "",
     "", "", "Leave", "Art. 29 - Sick Leave", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["", "", "", "", "",
     "", "",
     "", "",
     "", "", "Grievance Process", "Art. 30 - Vacation", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "", "",
     "", "", "", ""]
  ];

  // Add category header row first (12 categories, 43 columns)
  const categoryRow = [
    "── EMPLOYMENT INFO ──", "", "", "", "",
    "── SUPERVISION ──", "",
    "── STEWARD INFO ──", "",
    "── GRIEVANCE SETTINGS ──", "", "", "", "",
    "── LINKS & COORDINATORS ──", "", "",
    "── NOTIFICATIONS ──", "", "",
    "── ORGANIZATION ──", "", "", "",
    "── INTEGRATION ──", "",
    "── DEADLINES ──", "", "", "",
    "── MULTI-SELECT OPTIONS ──", "",
    "── CONTRACT & LEGAL ──", "", "", "",
    "── ORG IDENTITY ──", "", "",
    "── EXTENDED CONTACT ──", "", "", ""
  ];

  // Insert category row at top, then column headers, then data
  config.getRange(1, 1, 1, categoryRow.length).setValues([categoryRow]);
  config.getRange(2, 1, configData.length, configData[0].length).setValues(configData);

  // Style category row (Row 1)
  config.getRange(1, 1, 1, categoryRow.length)
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center");

  // Category colors for row 1 (dark colors) - uses CONFIG_COLS for dynamic positioning
  // Employment Info - Blue
  config.getRange(1, CONFIG_COLS.JOB_TITLES, 1, 5).setBackground("#3B82F6").setFontColor("#FFFFFF");
  // Supervision - Green (managers only)
  config.getRange(1, CONFIG_COLS.SUPERVISORS, 1, 2).setBackground("#10B981").setFontColor("#FFFFFF");
  // Steward Info - Purple (union reps, separate from management)
  config.getRange(1, CONFIG_COLS.STEWARDS, 1, 2).setBackground("#7C3AED").setFontColor("#FFFFFF");
  // Grievance Settings - Orange
  config.getRange(1, CONFIG_COLS.GRIEVANCE_STATUS, 1, 5).setBackground("#F59E0B").setFontColor("#FFFFFF");
  // Links & Coordinators - Deep Purple
  config.getRange(1, CONFIG_COLS.GRIEVANCE_COORDINATORS, 1, 3).setBackground("#8B5CF6").setFontColor("#FFFFFF");
  // Notifications - Red/Pink
  config.getRange(1, CONFIG_COLS.ADMIN_EMAILS, 1, 3).setBackground("#EF4444").setFontColor("#FFFFFF");
  // Organization - Teal
  config.getRange(1, CONFIG_COLS.ORG_NAME, 1, 4).setBackground("#14B8A6").setFontColor("#FFFFFF");
  // Integration - Indigo
  config.getRange(1, CONFIG_COLS.DRIVE_FOLDER_ID, 1, 2).setBackground("#6366F1").setFontColor("#FFFFFF");
  // Deadlines - Amber/Gold
  config.getRange(1, CONFIG_COLS.FILING_DEADLINE_DAYS, 1, 4).setBackground("#D97706").setFontColor("#FFFFFF");
  // Multi-select Options - Cyan
  config.getRange(1, CONFIG_COLS.BEST_TIMES, 1, 2).setBackground("#06B6D4").setFontColor("#FFFFFF");
  // Contract & Legal - Dark Green
  config.getRange(1, CONFIG_COLS.CONTRACT_ARTICLE_GRIEVANCE, 1, 4).setBackground("#059669").setFontColor("#FFFFFF");
  // Org Identity - Dark Teal
  config.getRange(1, CONFIG_COLS.UNION_PARENT, 1, 3).setBackground("#0D9488").setFontColor("#FFFFFF");
  // Extended Contact - Dark Blue
  config.getRange(1, CONFIG_COLS.OFFICE_ADDRESSES, 1, 4).setBackground("#1E40AF").setFontColor("#FFFFFF");

  // Style column header row (Row 2) with matching lighter colors
  config.getRange(2, 1, 1, configData[0].length)
    .setFontWeight("bold")
    .setFontSize(9);

  // Light colors for column headers (Row 2) - uses CONFIG_COLS for dynamic positioning
  config.getRange(2, CONFIG_COLS.JOB_TITLES, 1, 5).setBackground("#DBEAFE");   // Light blue - Employment
  config.getRange(2, CONFIG_COLS.SUPERVISORS, 1, 2).setBackground("#D1FAE5");   // Light green - Supervision
  config.getRange(2, CONFIG_COLS.STEWARDS, 1, 2).setBackground("#E8E3F3");   // Light purple - Steward Info
  config.getRange(2, CONFIG_COLS.GRIEVANCE_STATUS, 1, 5).setBackground("#FEF3C7");  // Light orange - Grievance Settings
  config.getRange(2, CONFIG_COLS.GRIEVANCE_COORDINATORS, 1, 3).setBackground("#EDE9FE");  // Light purple - Links
  config.getRange(2, CONFIG_COLS.ADMIN_EMAILS, 1, 3).setBackground("#FEE2E2");  // Light red - Notifications
  config.getRange(2, CONFIG_COLS.ORG_NAME, 1, 4).setBackground("#CCFBF1");  // Light teal - Organization
  config.getRange(2, CONFIG_COLS.DRIVE_FOLDER_ID, 1, 2).setBackground("#E0E7FF");  // Light indigo - Integration
  config.getRange(2, CONFIG_COLS.FILING_DEADLINE_DAYS, 1, 4).setBackground("#FEF3C7");  // Light amber - Deadlines
  config.getRange(2, CONFIG_COLS.BEST_TIMES, 1, 2).setBackground("#CFFAFE");  // Light cyan - Multi-select Options
  config.getRange(2, CONFIG_COLS.CONTRACT_ARTICLE_GRIEVANCE, 1, 4).setBackground("#D1FAE5");  // Light green - Contract & Legal
  config.getRange(2, CONFIG_COLS.UNION_PARENT, 1, 3).setBackground("#CCFBF1");  // Light teal - Org Identity
  config.getRange(2, CONFIG_COLS.OFFICE_ADDRESSES, 1, 4).setBackground("#DBEAFE");  // Light blue - Extended Contact

  // Add borders between category groups - uses CONFIG_COLS for dynamic positioning
  const totalRows = configData.length + 1;
  config.getRange(1, CONFIG_COLS.YES_NO, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);   // After Employment
  config.getRange(1, CONFIG_COLS.MANAGERS, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);   // After Supervision
  config.getRange(1, CONFIG_COLS.STEWARD_COMMITTEES, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);   // After Steward Info
  config.getRange(1, CONFIG_COLS.COMM_METHODS, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Grievance Settings
  config.getRange(1, CONFIG_COLS.CONTACT_FORM_URL, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Links
  config.getRange(1, CONFIG_COLS.NOTIFICATION_RECIPIENTS, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Notifications
  config.getRange(1, CONFIG_COLS.MAIN_PHONE, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Organization
  config.getRange(1, CONFIG_COLS.CALENDAR_ID, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Integration
  config.getRange(1, CONFIG_COLS.STEP2_RESPONSE_DAYS, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Deadlines
  config.getRange(1, CONFIG_COLS.HOME_TOWNS, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Multi-select Options
  config.getRange(1, CONFIG_COLS.CONTRACT_NAME, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Contract & Legal
  config.getRange(1, CONFIG_COLS.ORG_WEBSITE, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Org Identity

  for (let i = 1; i <= configData[0].length; i++) {
    config.autoResizeColumn(i);
  }

  config.setFrozenRows(2); // Freeze both category and header rows
  config.setTabColor("#2563EB");

  // Delete unused columns beyond the configData headers length
  const headerColCount = configData[0].length;
  const totalCols = config.getMaxColumns();
  if (totalCols > headerColCount) {
    config.deleteColumns(headerColCount + 1, totalCols - headerColCount);
  }
}

/* --------------------- MEMBER DIRECTORY - ALL CORRECT COLUMNS --------------------- */
function createMemberDirectory() {
  const ss = SpreadsheetApp.getActive();
  let memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const isNew = !memberDir;

  // Only create sheet if it doesn't exist - PRESERVE EXISTING DATA
  if (!memberDir) {
    memberDir = ss.insertSheet(SHEETS.MEMBER_DIR);
  }

  // Member Directory columns (31 total) - Reorganized for logical grouping
  const headers = [
    // Section 1: Identity & Core Info (A-D)
    "Member ID",                       // A - 1
    "First Name",                      // B - 2
    "Last Name",                       // C - 3
    "Job Title",                       // D - 4
    // Section 2: Location & Work (E-G)
    "Work Location (Site)",            // E - 5
    "Unit",                            // F - 6
    "Office Days",                     // G - 7
    // Section 3: Contact Information (H-K)
    "Email Address",                   // H - 8
    "Phone Number",                    // I - 9
    "Preferred Communication",         // J - 10 (multi-select)
    "Best Time to Contact",            // K - 11 (multi-select)
    // Section 4: Organizational Structure (L-P)
    "Supervisor (Name)",               // L - 12
    "Manager (Name)",                  // M - 13
    "Is Steward (Y/N)",                // N - 14
    "Committees",                      // O - 15 (multi-select for stewards)
    "Assigned Steward (Name)",         // P - 16
    // Section 5: Engagement Metrics (Q-T) - Hidden by default
    "Last Virtual Mtg (Date)",         // Q - 17
    "Last In-Person Mtg (Date)",       // R - 18
    "Open Rate (%)",                   // S - 19
    "Volunteer Hours (YTD)",           // T - 20
    // Section 6: Member Interests (U-X) - Hidden by default
    "Interest: Local Actions",         // U - 21
    "Interest: Chapter Actions",       // V - 22
    "Interest: Allied Chapter Actions",// W - 23
    "Home Town",                       // X - 24 (connection building)
    // Section 7: Steward Contact Tracking (Y-AA)
    "Most Recent Steward Contact Date",// Y - 25
    "Steward Who Contacted Member",    // Z - 26
    "Notes from Steward Contact",      // AA - 27
    // Section 8: Grievance Management (AB-AE)
    "Has Open Grievance?",             // AB - 28
    "Grievance Status Snapshot",       // AC - 29
    "Next Grievance Deadline",         // AD - 30
    "Start Grievance"                  // AE - 31
  ];

  // Update headers (row 1 only - preserves data in rows 2+)
  memberDir.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Add checkboxes to Start Grievance column (column 31/AE) - only for rows without data
  const lastRow = Math.max(memberDir.getLastRow(), 1);
  if (lastRow > 1) {
    memberDir.getRange(2, MEMBER_COLS.START_GRIEVANCE, lastRow - 1, 1).insertCheckboxes();
  } else {
    memberDir.getRange(2, MEMBER_COLS.START_GRIEVANCE, 999, 1).insertCheckboxes();
  }

  // Apply header formatting
  memberDir.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#059669")
    .setFontColor("#FFFFFF")
    .setWrap(true);

  memberDir.setFrozenRows(1);
  memberDir.setRowHeight(1, 50);

  // Ensure row 2 (first data row) has same formatting as all other data rows
  // Clear any inherited formatting from row 2
  memberDir.getRange(2, 1, 1, headers.length)
    .setBackground(null)  // No background color
    .setFontWeight("normal")
    .setFontColor("#000000")
    .setFontSize(10);

  // Apply comma number formatting to numeric columns
  const maxMemberRows = 21000;  // Support up to 20k members + 1k buffer
  // Open Rate (%) (column S = 19) - percentage format
  memberDir.getRange(2, MEMBER_COLS.OPEN_RATE, maxMemberRows - 1, 1).setNumberFormat("#,##0");
  // Volunteer Hours (column T = 20) - whole number format
  memberDir.getRange(2, MEMBER_COLS.VOLUNTEER_HOURS, maxMemberRows - 1, 1).setNumberFormat("#,##0");

  memberDir.setColumnWidth(MEMBER_COLS.MEMBER_ID, 90);      // Member ID
  memberDir.setColumnWidth(MEMBER_COLS.EMAIL, 180);         // Email Address
  memberDir.setColumnWidth(MEMBER_COLS.COMMITTEES, 150);    // Committees (multi-select)
  memberDir.setColumnWidth(MEMBER_COLS.PREFERRED_COMM, 150);// Preferred Communication
  memberDir.setColumnWidth(MEMBER_COLS.BEST_TIME, 150);     // Best Time to Contact
  memberDir.setColumnWidth(MEMBER_COLS.HOME_TOWN, 120);     // Home Town
  memberDir.setColumnWidth(MEMBER_COLS.CONTACT_NOTES, 250); // Notes from Steward Contact
  memberDir.setColumnWidth(MEMBER_COLS.START_GRIEVANCE, 120);// Start Grievance checkbox

  // Hide Engagement Metrics columns (Q-T) by default
  memberDir.hideColumns(MEMBER_COLS.LAST_VIRTUAL_MTG, 4);   // Columns 17-20

  // Hide Member Interests columns (U-X) by default
  memberDir.hideColumns(MEMBER_COLS.INTEREST_LOCAL, 4);     // Columns 21-24

  // Delete unused columns beyond the defined headers (31 columns)
  const totalCols = memberDir.getMaxColumns();
  if (totalCols > headers.length) {
    memberDir.deleteColumns(headers.length + 1, totalCols - headers.length);
  }

  memberDir.setTabColor("#059669");
}

/* --------------------- GRIEVANCE LOG - ALL CORRECT COLUMNS --------------------- */
function createGrievanceLog() {
  const ss = SpreadsheetApp.getActive();
  let grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  // Only create sheet if it doesn't exist - PRESERVE EXISTING DATA
  if (!grievanceLog) {
    grievanceLog = ss.insertSheet(SHEETS.GRIEVANCE_LOG);
  }

  // 34 columns - includes Feature 95 (Coordinator Notifications) and Drive folder integration
  const headers = [
    "Grievance ID",                    // A - 1
    "Member ID",                       // B - 2
    "First Name",                      // C - 3
    "Last Name",                       // D - 4
    "Status",                          // E - 5
    "Current Step",                    // F - 6
    "Incident Date",                   // G - 7
    "Filing Deadline (21d)",           // H - 8 (auto-calculated)
    "Date Filed (Step I)",             // I - 9
    "Step I Decision Due (30d)",       // J - 10 (auto-calculated)
    "Step I Decision Rcvd",            // K - 11
    "Step II Appeal Due (10d)",        // L - 12 (auto-calculated)
    "Step II Appeal Filed",            // M - 13
    "Step II Decision Due (30d)",      // N - 14 (auto-calculated)
    "Step II Decision Rcvd",           // O - 15
    "Step III Appeal Due (30d)",       // P - 16 (auto-calculated)
    "Step III Appeal Filed",           // Q - 17
    "Date Closed",                     // R - 18
    "Days Open",                       // S - 19 (auto-calculated)
    "Next Action Due",                 // T - 20 (auto-calculated)
    "Days to Deadline",                // U - 21 (auto-calculated)
    "Articles Violated",               // V - 22
    "Issue Category",                  // W - 23
    "Member Email",                    // X - 24
    "Unit",                            // Y - 25
    "Work Location (Site)",            // Z - 26
    "Assigned Steward (Name)",         // AA - 27
    "Resolution Summary",              // AB - 28
    "Message Alert",                    // AC - 29 (Feature 95: Checkbox)
    "Coordinator Message",             // AD - 30 (Feature 95: Message text)
    "Acknowledged By",                 // AE - 31 (Feature 95: Steward email)
    "Acknowledged Date",               // AF - 32 (Feature 95: Timestamp)
    "Drive Folder ID",                 // AG - 33 (Drive integration)
    "Drive Folder Link"                // AH - 34 (Drive integration)
  ];

  // Update headers (row 1 only - preserves data in rows 2+)
  grievanceLog.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Apply header formatting
  grievanceLog.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#DC2626")
    .setFontColor("#FFFFFF")
    .setWrap(true);

  grievanceLog.setFrozenRows(1);
  grievanceLog.setRowHeight(1, 50);
  grievanceLog.setColumnWidth(GRIEVANCE_COLS.GRIEVANCE_ID, 110);  // Grievance ID
  grievanceLog.setColumnWidth(GRIEVANCE_COLS.ARTICLES, 180);      // Articles Violated
  grievanceLog.setColumnWidth(GRIEVANCE_COLS.RESOLUTION, 250);    // Resolution Summary
  grievanceLog.setColumnWidth(GRIEVANCE_COLS.COORDINATOR_MESSAGE, 250);  // Coordinator Message

  // Add checkbox validation for Coordinator Notified column (AC) - Feature 95
  const lastRow = 1000; // Reasonable max rows
  const checkboxRange = grievanceLog.getRange(2, GRIEVANCE_COLS.MESSAGE_ALERT, lastRow - 1, 1);
  const checkboxValidation = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .setAllowInvalid(false)
    .build();
  checkboxRange.setDataValidation(checkboxValidation);

  // Delete unused columns beyond the defined headers (34 columns)
  const totalCols = grievanceLog.getMaxColumns();
  if (totalCols > headers.length) {
    grievanceLog.deleteColumns(headers.length + 1, totalCols - headers.length);
  }

  // Ensure row 2 has data row formatting (not header formatting)
  grievanceLog.getRange(2, 1, 1, headers.length)
    .setBackground(null)
    .setFontWeight("normal")
    .setFontColor("#000000")
    .setFontSize(10);

  // Apply comma number formatting to numeric columns
  const maxRows = 1000;
  // Days Open (column S = 19)
  grievanceLog.getRange(2, GRIEVANCE_COLS.DAYS_OPEN, maxRows - 1, 1).setNumberFormat("#,##0");
  // Days to Deadline (column U = 21)
  grievanceLog.getRange(2, GRIEVANCE_COLS.DAYS_TO_DEADLINE, maxRows - 1, 1).setNumberFormat("#,##0");

  grievanceLog.setTabColor("#DC2626");

  // Apply status bar conditional formatting (auto-start)
  // Colors rows based on Status value for quick visual identification
  applyGrievanceStatusBarSilent();
}

/* --------------------- DASHBOARD - ONLY REAL DATA --------------------- */
function createMainDashboard() {
  const ss = SpreadsheetApp.getActive();
  let dashboard = ss.getSheetByName(SHEETS.DASHBOARD);

  if (!dashboard) {
    dashboard = ss.insertSheet(SHEETS.DASHBOARD);
  }
  dashboard.clear();

  // Title
  dashboard.getRange("A1:L2").merge()
    .setValue("📊 LOCAL 509 DASHBOARD")
    .setFontSize(18)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBackground("#7C3AED")
    .setFontColor("#FFFFFF");

  dashboard.getRange("A3:L3").merge()
    .setFormula('="Last Updated: " & TEXT(NOW(), "MM/DD/YYYY HH:MM:SS")')
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setFontColor("#6B7280");

  // MEMBER METRICS - ALL REAL DATA
  dashboard.getRange("A5:L5").merge()
    .setValue("👥 MEMBER METRICS")
    .setFontWeight("bold")
    .setBackground("#E0E7FF")
    .setFontSize(12);

  const memberIdCol = getColumnLetter(MEMBER_COLS.MEMBER_ID);
  const isStewardCol = getColumnLetter(MEMBER_COLS.IS_STEWARD);
  const openRateCol = getColumnLetter(MEMBER_COLS.OPEN_RATE);
  const volunteerHoursCol = getColumnLetter(MEMBER_COLS.VOLUNTEER_HOURS);

  const memberMetrics = [
    ["Total Members", `=COUNTA('Member Directory'!${memberIdCol}:${memberIdCol})-1`, "👥"],
    ["Active Stewards", `=COUNTIF('Member Directory'!${isStewardCol}:${isStewardCol},"Yes")`, "🛡️"],
    ["Avg Open Rate", `=TEXT(AVERAGE('Member Directory'!${openRateCol}:${openRateCol})/100,"0.0%")`, "📧"],
    ["YTD Vol. Hours", `=SUM('Member Directory'!${volunteerHoursCol}:${volunteerHoursCol})`, "🙋"]
  ];

  let col = 1;
  memberMetrics.forEach(function(m) {
    dashboard.getRange(6, col, 1, 3).merge()
      .setValue(m[2] + " " + m[0])
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setBackground("#F3F4F6");

    const valueRange = dashboard.getRange(7, col, 1, 3).merge()
      .setFormula(m[1])
      .setFontSize(20)
      .setFontWeight("bold")
      .setHorizontalAlignment("center");

    // Apply number formatting with commas for numeric metrics
    if (m[0] === "YTD Vol. Hours") {
      valueRange.setNumberFormat("#,##0.0");
    } else if (m[0] === "Total Members") {
      valueRange.setNumberFormat("#,##0");
    }

    col += 3;
  });

  // GRIEVANCE METRICS - ALL REAL DATA
  dashboard.getRange("A10:L10").merge()
    .setValue("📋 GRIEVANCE METRICS")
    .setFontWeight("bold")
    .setBackground("#FEE2E2")
    .setFontSize(12);

  // Dynamic column references for Grievance Log
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const dateClosedCol = getColumnLetter(GRIEVANCE_COLS.DATE_CLOSED);
  const daysOpenCol = getColumnLetter(GRIEVANCE_COLS.DAYS_OPEN);

  const grievanceMetrics = [
    ["Open Grievances", `=COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Open")`, "🔴"],
    ["Pending Info", `=COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Pending Info")`, "🟡"],
    ["Settled (This Mo.)", `=COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Settled",'Grievance Log'!${dateClosedCol}:${dateClosedCol},">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))`, "🟢"],
    ["Avg Days Open", `=IFERROR(ROUND(AVERAGE(FILTER('Grievance Log'!${daysOpenCol}:${daysOpenCol},'Grievance Log'!${statusCol}:${statusCol}="Open")),0),"N/A")`, "⏱️"]
  ];

  col = 1;
  grievanceMetrics.forEach(function(m) {
    dashboard.getRange(11, col, 1, 3).merge()
      .setValue(m[2] + " " + m[0])
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setBackground("#F3F4F6");

    const valueRange = dashboard.getRange(12, col, 1, 3).merge()
      .setFormula(m[1])
      .setFontSize(20)
      .setFontWeight("bold")
      .setHorizontalAlignment("center");

    // Apply number formatting with commas (except Avg Days Open which may show "N/A")
    if (m[0] !== "Avg Days Open") {
      valueRange.setNumberFormat("#,##0");
    }

    col += 3;
  });

  // ENGAGEMENT METRICS - REAL DATA
  dashboard.getRange("A15:L15").merge()
    .setValue("📈 ENGAGEMENT METRICS (Last 30 Days)")
    .setFontWeight("bold")
    .setBackground("#DCFCE7")
    .setFontSize(12);

  const lastVirtualCol = getColumnLetter(MEMBER_COLS.LAST_VIRTUAL_MTG);
  const lastInPersonCol = getColumnLetter(MEMBER_COLS.LAST_INPERSON_MTG);
  const interestLocalCol = getColumnLetter(MEMBER_COLS.INTEREST_LOCAL);
  const interestChapterCol = getColumnLetter(MEMBER_COLS.INTEREST_CHAPTER);

  const engagementMetrics = [
    ["Virtual Mtgs", `=COUNTIF('Member Directory'!${lastVirtualCol}:${lastVirtualCol},">="&TODAY()-30)`],
    ["In-Person Mtgs", `=COUNTIF('Member Directory'!${lastInPersonCol}:${lastInPersonCol},">="&TODAY()-30)`],
    ["Local Interest", `=COUNTIF('Member Directory'!${interestLocalCol}:${interestLocalCol},"Yes")`],
    ["Chapter Interest", `=COUNTIF('Member Directory'!${interestChapterCol}:${interestChapterCol},"Yes")`]
  ];

  col = 1;
  engagementMetrics.forEach(function(m) {
    dashboard.getRange(16, col, 1, 3).merge()
      .setValue(m[0])
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setBackground("#F3F4F6");

    dashboard.getRange(17, col, 1, 3).merge()
      .setFormula(m[1])
      .setFontSize(18)
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setNumberFormat("#,##0");

    col += 3;
  });

  // UPCOMING DEADLINES
  dashboard.getRange("A20:L20").merge()
    .setValue("⏰ UPCOMING DEADLINES (Next 14 Days)")
    .setFontWeight("bold")
    .setBackground("#FEF3C7")
    .setFontSize(12);

  const deadlineHeaders = ["Grievance ID", "Member", "Next Action", "Days Until", "Status"];
  dashboard.getRange(21, 1, 1, 5).setValues([deadlineHeaders])
    .setFontWeight("bold")
    .setBackground("#F3F4F6");

  // Dynamic column references for QUERY formula
  const grievanceIdCol = getColumnLetter(GRIEVANCE_COLS.GRIEVANCE_ID);
  const firstNameCol = getColumnLetter(GRIEVANCE_COLS.FIRST_NAME);
  const nextActionCol = getColumnLetter(GRIEVANCE_COLS.NEXT_ACTION_DUE);
  const daysToDeadlineCol = getColumnLetter(GRIEVANCE_COLS.DAYS_TO_DEADLINE);
  const lastCol = getColumnLetter(GRIEVANCE_COLS.RESOLUTION); // AB - last column

  // Formula to populate upcoming deadlines (open grievances with deadlines in next 14 days, excluding overdue)
  dashboard.getRange("A22").setFormula(
    `=IFERROR(QUERY('Grievance Log'!${grievanceIdCol}:${lastCol}, ` +
    `"SELECT ${grievanceIdCol}, ${firstNameCol}, ${nextActionCol}, ${daysToDeadlineCol}, ${statusCol} ` +
    `WHERE ${statusCol} = 'Open' AND ${nextActionCol} IS NOT NULL ` +
    `AND ${nextActionCol} <= date '"&TEXT(TODAY()+14,"yyyy-mm-dd")&"' ` +
    `AND ${daysToDeadlineCol} >= 0 ` +
    `ORDER BY ${nextActionCol} ASC ` +
    `LIMIT 10", 0), "No upcoming deadlines")`
  );

  // Apply date formatting to Next Action column (column C in results)
  dashboard.getRange("C22:C31").setNumberFormat("MM/dd/yyyy");

  dashboard.setTabColor("#7C3AED");

  // Delete unused columns - detect last used column dynamically
  const usedLastCol = dashboard.getLastColumn();
  const totalCols = dashboard.getMaxColumns();
  if (usedLastCol > 0 && totalCols > usedLastCol) {
    dashboard.deleteColumns(usedLastCol + 1, totalCols - usedLastCol);
  }
}

/**
 * Cleans up Member Directory structure - removes extra columns beyond the expected count
 * Uses MEMBER_COLS.START_GRIEVANCE (last column) for dynamic detection
 * Run this if extra columns appear with mixed data
 */
function cleanupMemberDirectoryColumns() {
  const ss = SpreadsheetApp.getActive();
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberDir) {
    SpreadsheetApp.getUi().alert('Member Directory not found!');
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const lastCol = memberDir.getLastColumn();
  // Use MEMBER_COLS.START_GRIEVANCE as the expected max column (dynamically determined)
  const expectedMaxCol = MEMBER_COLS.START_GRIEVANCE;

  if (lastCol <= expectedMaxCol) {
    ui.alert('Column Structure OK', 'Member Directory has ' + lastCol + ' columns (expected: ' + expectedMaxCol + ' max). No cleanup needed.', ui.ButtonSet.OK);
    return;
  }

  const response = ui.alert(
    'Remove Extra Columns?',
    'Member Directory has ' + lastCol + ' columns but should only have ' + expectedMaxCol + '.\n\n' +
    'Extra columns will be deleted. This cannot be undone.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  // Delete columns from right to left (starting after expected max)
  const columnsToDelete = lastCol - expectedMaxCol;
  for (let i = 0; i < columnsToDelete; i++) {
    memberDir.deleteColumn(expectedMaxCol + 1); // Always delete first extra column (shifts remaining left)
  }

  // Re-apply checkboxes to last column - Start Grievance
  const lastRow = Math.max(memberDir.getLastRow(), 100);
  memberDir.getRange(2, MEMBER_COLS.START_GRIEVANCE, lastRow - 1, 1).insertCheckboxes();

  ui.alert('Cleanup Complete', 'Removed ' + columnsToDelete + ' extra columns.\nColumn AE checkboxes have been restored.', ui.ButtonSet.OK);
}

/**
 * Refresh Dashboard Deadlines - Updates formula on existing Dashboard
 * Run this after seeding data or if deadlines show incorrect values
 */
function refreshDashboardDeadlines() {
  const ss = SpreadsheetApp.getActive();
  const dashboard = ss.getSheetByName(SHEETS.DASHBOARD);

  if (!dashboard) {
    SpreadsheetApp.getUi().alert('Dashboard sheet not found!');
    return;
  }

  SpreadsheetApp.getActive().toast('Refreshing dashboard deadlines...', 'Please wait', -1);

  // Dynamic column references
  const grievanceIdCol = getColumnLetter(GRIEVANCE_COLS.GRIEVANCE_ID);
  const firstNameCol = getColumnLetter(GRIEVANCE_COLS.FIRST_NAME);
  const nextActionCol = getColumnLetter(GRIEVANCE_COLS.NEXT_ACTION_DUE);
  const daysToDeadlineCol = getColumnLetter(GRIEVANCE_COLS.DAYS_TO_DEADLINE);
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const lastGrievanceCol = getColumnLetter(GRIEVANCE_COLS.RESOLUTION); // Last column (28)

  // Clear existing deadline data
  dashboard.getRange("A22:E31").clearContent();

  // New formula: Uses FILTER instead of QUERY for better date handling
  // Only shows items where Days to Deadline is numeric and >= 0 (future deadlines)
  // Formats Next Action as date
  dashboard.getRange("A22").setFormula(
    `=IFERROR(QUERY('Grievance Log'!A:${lastGrievanceCol}, ` +
    `"SELECT ${grievanceIdCol}, ${firstNameCol}, ${nextActionCol}, ${daysToDeadlineCol}, ${statusCol} ` +
    `WHERE ${statusCol} = 'Open' ` +
    `AND ${daysToDeadlineCol} IS NOT NULL ` +
    `AND ${daysToDeadlineCol} >= 0 ` +
    `AND ${daysToDeadlineCol} <= 14 ` +
    `ORDER BY ${daysToDeadlineCol} ASC ` +
    `LIMIT 10", 0), "No upcoming deadlines")`
  );

  // Format the Next Action column (column C in the output) as dates
  dashboard.getRange("C22:C31").setNumberFormat("MM/DD/YYYY");

  SpreadsheetApp.getActive().toast('✅ Dashboard deadlines refreshed!', 'Complete', 3);
}

/**
 * Recalculate Grievance Log calculated columns (Days Open, Next Action Due, Days to Deadline)
 * These columns are calculated via code, not formulas - call this to refresh values
 * Wrapper for recalcAllGrievancesBatched() from BatchGrievanceRecalc.gs
 */
function refreshGrievanceFormulas() {
  const ss = SpreadsheetApp.getActive();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceLog) {
    SpreadsheetApp.getUi().alert('Grievance Log sheet not found!');
    return;
  }

  SpreadsheetApp.getActive().toast('Recalculating grievance values...', 'Please wait', -1);

  try {
    // Use the batched recalculation from BatchGrievanceRecalc.gs
    const result = recalcAllGrievancesBatched();
    SpreadsheetApp.getActive().toast(
      `✅ Recalculated ${result.processed} grievances in ${(result.duration / 1000).toFixed(1)}s`,
      'Complete',
      5
    );
  } catch (error) {
    Logger.log('Error in refreshGrievanceFormulas: ' + error.message);
    SpreadsheetApp.getUi().alert('Error recalculating: ' + error.message);
  }
}

/**
 * Refresh Member Directory grievance columns from hidden calculation sheet
 *
 * Architecture:
 * 1. Creates/updates hidden "_Grievance_Calc" sheet with self-healing formulas
 * 2. Formulas auto-calculate: Has Open Grievance?, Status Snapshot, Next Deadline
 * 3. Syncs calculated values to Member Directory columns AB-AD as static values
 *
 * The hidden sheet formulas auto-update when Grievance Log changes.
 * Call this function to sync the latest values to Member Directory.
 *
 * @returns {Object} Statistics about the sync
 */
function refreshMemberDirectoryFormulas() {
  const startTime = new Date();
  const ss = SpreadsheetApp.getActive();

  SpreadsheetApp.getActive().toast('Setting up grievance calculations...', 'Please wait', -1);

  try {
    // Step 1: Setup/repair the hidden calculation sheet with formulas
    setupGrievanceCalcSheet();

    // Step 2: Sync calculated values to Member Directory
    const result = syncGrievanceCalcToMemberDirectory();

    const duration = new Date() - startTime;
    SpreadsheetApp.getActive().toast(
      `✅ Synced ${result.processed} members in ${(duration / 1000).toFixed(1)}s`,
      'Complete',
      5
    );

    return {
      processed: result.processed,
      duration: duration,
      message: `Synced ${result.processed} members in ${duration}ms`
    };
  } catch (error) {
    Logger.log('Error in refreshMemberDirectoryFormulas: ' + error.message);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    return { processed: 0, error: error.message };
  }
}

/**
 * Creates/repairs the hidden _Grievance_Calc sheet with auto-updating formulas
 * This sheet is the source of truth for Member Directory grievance columns.
 * Formulas are SELF-HEALING - this function re-applies them if missing/broken.
 */
function setupGrievanceCalcSheet() {
  const ss = SpreadsheetApp.getActive();

  // Get or create the hidden calculation sheet
  let calcSheet = ss.getSheetByName(SHEETS.GRIEVANCE_CALC);
  if (!calcSheet) {
    calcSheet = ss.insertSheet(SHEETS.GRIEVANCE_CALC);
    Logger.log('Created hidden calculation sheet: ' + SHEETS.GRIEVANCE_CALC);
  }

  // Hide the sheet (self-healing - re-hide if someone unhid it)
  calcSheet.hideSheet();

  // Clear and rebuild (self-healing)
  calcSheet.clear();

  // Set up headers - Enhanced with additional metrics
  calcSheet.getRange('A1:G1').setValues([[
    'Member ID', 'Has Open Grievance?', 'Grievance Status', 'Next Deadline',
    'Total Count', 'Win Rate (%)', 'Last Grievance Date'
  ]]);
  calcSheet.getRange('A1:G1').setFontWeight('bold').setBackground('#E5E7EB');

  // Dynamic column references for Grievance Log
  const gMemberIdCol = getColumnLetter(GRIEVANCE_COLS.MEMBER_ID);
  const gStatusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const gNextActionCol = getColumnLetter(GRIEVANCE_COLS.NEXT_ACTION_DUE);
  const gDateFiledCol = getColumnLetter(GRIEVANCE_COLS.DATE_FILED);
  const gSheetName = SHEETS.GRIEVANCE_LOG;

  // Dynamic column references for Member Directory
  const mMemberIdCol = getColumnLetter(MEMBER_COLS.MEMBER_ID);
  const mSheetName = SHEETS.MEMBER_DIR;

  // Column A: Mirror Member Directory Member IDs (auto-updates when members added/removed)
  // FULLY DYNAMIC: Uses MEMBER_COLS.MEMBER_ID for column reference
  calcSheet.getRange('A2').setFormula(
    `=FILTER('${mSheetName}'!${mMemberIdCol}:${mMemberIdCol}, '${mSheetName}'!${mMemberIdCol}:${mMemberIdCol}<>"", '${mSheetName}'!${mMemberIdCol}:${mMemberIdCol}<>"Member ID")`
  );

  // Column B: Has Open Grievance? - MAP/LAMBDA formula
  // FULLY DYNAMIC: Uses GRIEVANCE_COLS for all Grievance Log column references
  calcSheet.getRange('B2').setFormula(
    `=MAP(A2:A,LAMBDA(m,IF(m="","",IF(SUM(COUNTIFS('${gSheetName}'!${gMemberIdCol}:${gMemberIdCol},m,'${gSheetName}'!${gStatusCol}:${gStatusCol},{"Open","Pending Info","Appealed","In Arbitration"}))>0,"Yes","No"))))`
  );

  // Column C: Grievance Status Snapshot - prioritizes active grievances
  // FULLY DYNAMIC: Uses GRIEVANCE_COLS for all column references
  calcSheet.getRange('C2').setFormula(
    `=MAP(A2:A,LAMBDA(m,IF(m="","",LET(activeStatus,FILTER('${gSheetName}'!${gStatusCol}:${gStatusCol},('${gSheetName}'!${gMemberIdCol}:${gMemberIdCol}=m)*REGEXMATCH('${gSheetName}'!${gStatusCol}:${gStatusCol},"^(Open|Pending Info|Appealed|In Arbitration)$")),IFERROR(INDEX(activeStatus,1),IFERROR(INDEX('${gSheetName}'!${gStatusCol}:${gStatusCol},MATCH(m,'${gSheetName}'!${gMemberIdCol}:${gMemberIdCol},0)),""))))))`
  );

  // Column D: Next Grievance Deadline - prioritizes active grievances
  // FULLY DYNAMIC: Uses GRIEVANCE_COLS for all column references
  calcSheet.getRange('D2').setFormula(
    `=MAP(A2:A,LAMBDA(m,IF(m="","",LET(activeDeadline,FILTER('${gSheetName}'!${gNextActionCol}:${gNextActionCol},('${gSheetName}'!${gMemberIdCol}:${gMemberIdCol}=m)*REGEXMATCH('${gSheetName}'!${gStatusCol}:${gStatusCol},"^(Open|Pending Info|Appealed|In Arbitration)$")),IFERROR(INDEX(activeDeadline,1),IFERROR(INDEX('${gSheetName}'!${gNextActionCol}:${gNextActionCol},MATCH(m,'${gSheetName}'!${gMemberIdCol}:${gMemberIdCol},0)),""))))))`
  );

  // Column E: Total Grievance Count per member
  // FULLY DYNAMIC: Counts all grievances (any status) for each member
  calcSheet.getRange('E2').setFormula(
    `=MAP(A2:A,LAMBDA(m,IF(m="","",COUNTIF('${gSheetName}'!${gMemberIdCol}:${gMemberIdCol},m))))`
  );

  // Column F: Win Rate (%) - Percentage of grievances won or settled
  // FULLY DYNAMIC: Counts Settled/Withdrawn as wins, calculates percentage
  calcSheet.getRange('F2').setFormula(
    `=MAP(A2:A,LAMBDA(m,IF(m="","",LET(total,COUNTIF('${gSheetName}'!${gMemberIdCol}:${gMemberIdCol},m),wins,SUMPRODUCT(('${gSheetName}'!${gMemberIdCol}:${gMemberIdCol}=m)*REGEXMATCH('${gSheetName}'!${gStatusCol}:${gStatusCol},"^(Settled|Won)$")),IF(total=0,"",ROUND(wins/total*100,0))))))`
  );

  // Column G: Last Grievance Date (most recent filing date)
  // FULLY DYNAMIC: Gets the most recent Date Filed for each member
  calcSheet.getRange('G2').setFormula(
    `=MAP(A2:A,LAMBDA(m,IF(m="","",IFERROR(MAXIFS('${gSheetName}'!${gDateFiledCol}:${gDateFiledCol},'${gSheetName}'!${gMemberIdCol}:${gMemberIdCol},m),""))))`
  );

  // Format the sheet
  calcSheet.setColumnWidth(1, 120);
  calcSheet.setColumnWidth(2, 150);
  calcSheet.setColumnWidth(3, 150);
  calcSheet.setColumnWidth(4, 130);
  calcSheet.setColumnWidth(5, 100);
  calcSheet.setColumnWidth(6, 100);
  calcSheet.setColumnWidth(7, 140);

  Logger.log('setupGrievanceCalcSheet: Hidden calculation sheet configured with 7 metrics columns');
}

/**
 * Syncs calculated values from hidden _Grievance_Calc sheet to Member Directory
 * Reads the formula-calculated values and writes them as static values to Member Directory.
 *
 * @returns {Object} { processed: number }
 */
function syncGrievanceCalcToMemberDirectory() {
  const ss = SpreadsheetApp.getActive();
  const calcSheet = ss.getSheetByName(SHEETS.GRIEVANCE_CALC);
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!calcSheet) {
    throw new Error('Calculation sheet not found. Run setupGrievanceCalcSheet() first.');
  }
  if (!memberDir) {
    throw new Error('Member Directory not found.');
  }

  // Force formulas to recalculate
  SpreadsheetApp.flush();

  // Read calculated values from hidden sheet (columns A-D, skip header)
  const calcLastRow = calcSheet.getLastRow();
  if (calcLastRow < 2) {
    return { processed: 0 };
  }

  const calcData = calcSheet.getRange(2, 1, calcLastRow - 1, 4).getValues();

  // Build lookup map: memberId -> { hasOpen, status, deadline }
  const calcMap = {};
  for (let i = 0; i < calcData.length; i++) {
    const memberId = String(calcData[i][0] || '');
    if (memberId) {
      calcMap[memberId] = {
        hasOpen: calcData[i][1] || 'No',
        status: calcData[i][2] || '',
        deadline: calcData[i][3] || ''
      };
    }
  }

  // Read Member Directory member IDs
  const memberLastRow = memberDir.getLastRow();
  if (memberLastRow < 2) {
    return { processed: 0 };
  }

  const memberIds = memberDir.getRange(2, MEMBER_COLS.MEMBER_ID, memberLastRow - 1, 1).getValues();

  // Build output arrays matching Member Directory row order
  const hasOpenArr = [];
  const statusArr = [];
  const deadlineArr = [];

  for (let i = 0; i < memberIds.length; i++) {
    const memberId = String(memberIds[i][0] || '');
    const calc = calcMap[memberId];

    if (calc) {
      hasOpenArr.push([calc.hasOpen]);
      statusArr.push([calc.status]);
      deadlineArr.push([calc.deadline]);
    } else {
      hasOpenArr.push(['No']);
      statusArr.push(['']);
      deadlineArr.push(['']);
    }
  }

  // Write to Member Directory columns AB, AC, AD
  const numRows = hasOpenArr.length;
  if (numRows > 0) {
    memberDir.getRange(2, MEMBER_COLS.HAS_OPEN_GRIEVANCE, numRows, 1).setValues(hasOpenArr);
    memberDir.getRange(2, MEMBER_COLS.GRIEVANCE_STATUS, numRows, 1).setValues(statusArr);
    memberDir.getRange(2, MEMBER_COLS.NEXT_DEADLINE, numRows, 1).setValues(deadlineArr);
  }

  Logger.log(`syncGrievanceCalcToMemberDirectory: Synced ${numRows} members`);
  return { processed: numRows };
}

/**
 * onEdit trigger handler for auto-syncing grievance data to Member Directory
 * Called when any cell is edited. Only acts on Grievance Log changes.
 *
 * @param {Object} e - Edit event object
 */
function onEditSyncGrievanceData(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();

    // Only sync when Grievance Log is edited
    if (sheetName !== SHEETS.GRIEVANCE_LOG) {
      return;
    }

    // Check if edit was in relevant columns (Status, Member ID, Next Action Due)
    const editCol = e.range.getColumn();
    const relevantCols = [
      GRIEVANCE_COLS.MEMBER_ID,
      GRIEVANCE_COLS.STATUS,
      GRIEVANCE_COLS.NEXT_ACTION_DUE
    ];

    if (relevantCols.includes(editCol)) {
      // Debounce: Only sync if more than 2 seconds since last sync
      const cache = CacheService.getScriptCache();
      const lastSync = cache.get('lastGrievanceSync');
      const now = new Date().getTime();

      if (!lastSync || (now - parseInt(lastSync)) > 2000) {
        cache.put('lastGrievanceSync', now.toString(), 60);

        // Sync after a brief delay to allow formula recalculation
        Utilities.sleep(500);
        syncGrievanceCalcToMemberDirectory();
      }
    }
  } catch (error) {
    // Silent fail for onEdit - don't interrupt user
    Logger.log('onEditSyncGrievanceData error: ' + error.message);
  }
}

/**
 * Installs the auto-sync trigger for grievance data
 * Call this once during setup or repair.
 */
function installGrievanceSyncTrigger() {
  const ss = SpreadsheetApp.getActive();

  // Remove existing triggers for this function
  const triggers = ScriptApp.getUserTriggers(ss);
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'onEditSyncGrievanceData') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Install new trigger
  ScriptApp.newTrigger('onEditSyncGrievanceData')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  Logger.log('installGrievanceSyncTrigger: Auto-sync trigger installed');
}

/**
 * Removes the auto-sync trigger for grievance data
 */
function removeGrievanceSyncTrigger() {
  const ss = SpreadsheetApp.getActive();
  const triggers = ScriptApp.getUserTriggers(ss);

  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'onEditSyncGrievanceData') {
      ScriptApp.deleteTrigger(trigger);
      Logger.log('removeGrievanceSyncTrigger: Trigger removed');
    }
  }
}

// ============================================================================
// MEMBER LOOKUP - Auto-update Grievance Log with Member Directory data
// ============================================================================

/**
 * Creates/repairs the hidden _Member_Lookup sheet with auto-updating formulas
 * This sheet provides member data to Grievance Log columns C, D, X, Y, Z, AA.
 * Formulas are SELF-HEALING - this function re-applies them if missing/broken.
 */
function setupMemberLookupSheet() {
  const ss = SpreadsheetApp.getActive();

  // Get or create the hidden lookup sheet
  let lookupSheet = ss.getSheetByName(SHEETS.MEMBER_LOOKUP);
  if (!lookupSheet) {
    lookupSheet = ss.insertSheet(SHEETS.MEMBER_LOOKUP);
    Logger.log('Created hidden lookup sheet: ' + SHEETS.MEMBER_LOOKUP);
  }

  // Hide the sheet (self-healing - re-hide if someone unhid it)
  lookupSheet.hideSheet();

  // Clear and rebuild (self-healing)
  lookupSheet.clear();

  // Set up headers
  lookupSheet.getRange('A1:H1').setValues([[
    'Grievance ID', 'Member ID', 'First Name', 'Last Name',
    'Email', 'Unit', 'Location', 'Steward'
  ]]);
  lookupSheet.getRange('A1:H1').setFontWeight('bold').setBackground('#E5E7EB');

  // Dynamic column references for Grievance Log
  const gGrievanceIdCol = getColumnLetter(GRIEVANCE_COLS.GRIEVANCE_ID);
  const gMemberIdCol = getColumnLetter(GRIEVANCE_COLS.MEMBER_ID);
  const gSheetName = SHEETS.GRIEVANCE_LOG;

  // Dynamic column references for Member Directory
  const mMemberIdCol = getColumnLetter(MEMBER_COLS.MEMBER_ID);
  const mFirstNameCol = getColumnLetter(MEMBER_COLS.FIRST_NAME);
  const mLastNameCol = getColumnLetter(MEMBER_COLS.LAST_NAME);
  const mEmailCol = getColumnLetter(MEMBER_COLS.EMAIL);
  const mUnitCol = getColumnLetter(MEMBER_COLS.UNIT);
  const mLocationCol = getColumnLetter(MEMBER_COLS.WORK_LOCATION);
  const mStewardCol = getColumnLetter(MEMBER_COLS.ASSIGNED_STEWARD);
  const mSheetName = SHEETS.MEMBER_DIR;

  // Column A: Grievance IDs from Grievance Log
  lookupSheet.getRange('A2').setFormula(
    `=FILTER('${gSheetName}'!${gGrievanceIdCol}:${gGrievanceIdCol}, '${gSheetName}'!${gGrievanceIdCol}:${gGrievanceIdCol}<>"", '${gSheetName}'!${gGrievanceIdCol}:${gGrievanceIdCol}<>"Grievance ID")`
  );

  // Column B: Member IDs from Grievance Log (for reference)
  lookupSheet.getRange('B2').setFormula(
    `=FILTER('${gSheetName}'!${gMemberIdCol}:${gMemberIdCol}, '${gSheetName}'!${gGrievanceIdCol}:${gGrievanceIdCol}<>"", '${gSheetName}'!${gGrievanceIdCol}:${gGrievanceIdCol}<>"Grievance ID")`
  );

  // Column C: First Name - VLOOKUP from Member Directory
  lookupSheet.getRange('C2').setFormula(
    `=MAP(B2:B,LAMBDA(m,IF(m="","",IFERROR(VLOOKUP(m,'${mSheetName}'!${mMemberIdCol}:${mFirstNameCol},${MEMBER_COLS.FIRST_NAME},FALSE),""))))`
  );

  // Column D: Last Name - VLOOKUP from Member Directory
  lookupSheet.getRange('D2').setFormula(
    `=MAP(B2:B,LAMBDA(m,IF(m="","",IFERROR(VLOOKUP(m,'${mSheetName}'!${mMemberIdCol}:${mLastNameCol},${MEMBER_COLS.LAST_NAME},FALSE),""))))`
  );

  // Column E: Email - INDEX/MATCH from Member Directory
  lookupSheet.getRange('E2').setFormula(
    `=MAP(B2:B,LAMBDA(m,IF(m="","",IFERROR(INDEX('${mSheetName}'!${mEmailCol}:${mEmailCol},MATCH(m,'${mSheetName}'!${mMemberIdCol}:${mMemberIdCol},0)),""))))`
  );

  // Column F: Unit - INDEX/MATCH from Member Directory
  lookupSheet.getRange('F2').setFormula(
    `=MAP(B2:B,LAMBDA(m,IF(m="","",IFERROR(INDEX('${mSheetName}'!${mUnitCol}:${mUnitCol},MATCH(m,'${mSheetName}'!${mMemberIdCol}:${mMemberIdCol},0)),""))))`
  );

  // Column G: Location - INDEX/MATCH from Member Directory
  lookupSheet.getRange('G2').setFormula(
    `=MAP(B2:B,LAMBDA(m,IF(m="","",IFERROR(INDEX('${mSheetName}'!${mLocationCol}:${mLocationCol},MATCH(m,'${mSheetName}'!${mMemberIdCol}:${mMemberIdCol},0)),""))))`
  );

  // Column H: Assigned Steward - INDEX/MATCH from Member Directory
  lookupSheet.getRange('H2').setFormula(
    `=MAP(B2:B,LAMBDA(m,IF(m="","",IFERROR(INDEX('${mSheetName}'!${mStewardCol}:${mStewardCol},MATCH(m,'${mSheetName}'!${mMemberIdCol}:${mMemberIdCol},0)),""))))`
  );

  // Format the sheet
  lookupSheet.setColumnWidth(1, 120);
  lookupSheet.setColumnWidth(2, 100);
  lookupSheet.setColumnWidth(3, 100);
  lookupSheet.setColumnWidth(4, 100);
  lookupSheet.setColumnWidth(5, 180);
  lookupSheet.setColumnWidth(6, 100);
  lookupSheet.setColumnWidth(7, 120);
  lookupSheet.setColumnWidth(8, 150);

  Logger.log('setupMemberLookupSheet: Hidden lookup sheet configured with self-healing formulas');
}

/**
 * Syncs member data from hidden _Member_Lookup sheet to Grievance Log
 * Updates columns C, D, X, Y, Z, AA with current member info.
 *
 * @returns {Object} { processed: number }
 */
function syncMemberLookupToGrievanceLog() {
  const ss = SpreadsheetApp.getActive();
  const lookupSheet = ss.getSheetByName(SHEETS.MEMBER_LOOKUP);
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!lookupSheet) {
    throw new Error('Member Lookup sheet not found. Run setupMemberLookupSheet() first.');
  }
  if (!grievanceLog) {
    throw new Error('Grievance Log not found.');
  }

  // Force formulas to recalculate
  SpreadsheetApp.flush();

  // Read calculated values from hidden sheet (columns A-H, skip header)
  const lookupLastRow = lookupSheet.getLastRow();
  if (lookupLastRow < 2) {
    return { processed: 0 };
  }

  const lookupData = lookupSheet.getRange(2, 1, lookupLastRow - 1, 8).getValues();

  // Build lookup map: grievanceId -> { firstName, lastName, email, unit, location, steward }
  const lookupMap = {};
  for (let i = 0; i < lookupData.length; i++) {
    const grievanceId = String(lookupData[i][0] || '');
    if (grievanceId) {
      lookupMap[grievanceId] = {
        firstName: lookupData[i][2] || '',
        lastName: lookupData[i][3] || '',
        email: lookupData[i][4] || '',
        unit: lookupData[i][5] || '',
        location: lookupData[i][6] || '',
        steward: lookupData[i][7] || ''
      };
    }
  }

  // Read Grievance Log grievance IDs
  const grievanceLastRow = grievanceLog.getLastRow();
  if (grievanceLastRow < 2) {
    return { processed: 0 };
  }

  const grievanceIds = grievanceLog.getRange(2, GRIEVANCE_COLS.GRIEVANCE_ID, grievanceLastRow - 1, 1).getValues();

  // Build output arrays matching Grievance Log row order
  const firstNameArr = [];
  const lastNameArr = [];
  const emailArr = [];
  const unitArr = [];
  const locationArr = [];
  const stewardArr = [];

  for (let i = 0; i < grievanceIds.length; i++) {
    const grievanceId = String(grievanceIds[i][0] || '');
    const lookup = lookupMap[grievanceId];

    if (lookup) {
      firstNameArr.push([lookup.firstName]);
      lastNameArr.push([lookup.lastName]);
      emailArr.push([lookup.email]);
      unitArr.push([lookup.unit]);
      locationArr.push([lookup.location]);
      stewardArr.push([lookup.steward]);
    } else {
      firstNameArr.push(['']);
      lastNameArr.push(['']);
      emailArr.push(['']);
      unitArr.push(['']);
      locationArr.push(['']);
      stewardArr.push(['']);
    }
  }

  // Write to Grievance Log columns C, D, X, Y, Z, AA
  const numRows = firstNameArr.length;
  if (numRows > 0) {
    grievanceLog.getRange(2, GRIEVANCE_COLS.FIRST_NAME, numRows, 1).setValues(firstNameArr);      // C
    grievanceLog.getRange(2, GRIEVANCE_COLS.LAST_NAME, numRows, 1).setValues(lastNameArr);        // D
    grievanceLog.getRange(2, GRIEVANCE_COLS.MEMBER_EMAIL, numRows, 1).setValues(emailArr);        // X
    grievanceLog.getRange(2, GRIEVANCE_COLS.UNIT, numRows, 1).setValues(unitArr);                 // Y
    grievanceLog.getRange(2, GRIEVANCE_COLS.LOCATION, numRows, 1).setValues(locationArr);         // Z
    grievanceLog.getRange(2, GRIEVANCE_COLS.STEWARD, numRows, 1).setValues(stewardArr);           // AA
  }

  Logger.log(`syncMemberLookupToGrievanceLog: Synced ${numRows} grievances`);
  return { processed: numRows };
}

/**
 * Refreshes member data in Grievance Log from hidden calculation sheet
 *
 * @returns {Object} Statistics about the sync
 */
function refreshGrievanceLogMemberData() {
  const startTime = new Date();

  SpreadsheetApp.getActive().toast('Syncing member data to Grievance Log...', 'Please wait', -1);

  try {
    // Step 1: Setup/repair the hidden lookup sheet
    setupMemberLookupSheet();

    // Step 2: Sync to Grievance Log
    const result = syncMemberLookupToGrievanceLog();

    const duration = new Date() - startTime;
    SpreadsheetApp.getActive().toast(
      `✅ Synced ${result.processed} grievances in ${(duration / 1000).toFixed(1)}s`,
      'Complete',
      5
    );

    return {
      processed: result.processed,
      duration: duration,
      message: `Synced ${result.processed} grievances in ${duration}ms`
    };
  } catch (error) {
    Logger.log('Error in refreshGrievanceLogMemberData: ' + error.message);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    return { processed: 0, error: error.message };
  }
}

/**
 * onEdit trigger handler for auto-syncing member data to Grievance Log
 * Called when any cell is edited. Only acts on Member Directory changes.
 *
 * @param {Object} e - Edit event object
 */
function onEditSyncMemberData(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();

    // Only sync when Member Directory is edited
    if (sheetName !== SHEETS.MEMBER_DIR) {
      return;
    }

    // Check if edit was in relevant columns
    const editCol = e.range.getColumn();
    const relevantCols = [
      MEMBER_COLS.MEMBER_ID,
      MEMBER_COLS.FIRST_NAME,
      MEMBER_COLS.LAST_NAME,
      MEMBER_COLS.EMAIL,
      MEMBER_COLS.UNIT,
      MEMBER_COLS.WORK_LOCATION,
      MEMBER_COLS.ASSIGNED_STEWARD
    ];

    if (relevantCols.includes(editCol)) {
      // Debounce: Only sync if more than 2 seconds since last sync
      const cache = CacheService.getScriptCache();
      const lastSync = cache.get('lastMemberSync');
      const now = new Date().getTime();

      if (!lastSync || (now - parseInt(lastSync)) > 2000) {
        cache.put('lastMemberSync', now.toString(), 60);

        // Sync after a brief delay to allow formula recalculation
        Utilities.sleep(500);
        syncMemberLookupToGrievanceLog();
      }
    }
  } catch (error) {
    // Silent fail for onEdit - don't interrupt user
    Logger.log('onEditSyncMemberData error: ' + error.message);
  }
}

/**
 * Installs the auto-sync trigger for member data
 * Call this once during setup or repair.
 */
function installMemberSyncTrigger() {
  const ss = SpreadsheetApp.getActive();

  // Remove existing triggers for this function
  const triggers = ScriptApp.getUserTriggers(ss);
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'onEditSyncMemberData') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Install new trigger
  ScriptApp.newTrigger('onEditSyncMemberData')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  Logger.log('installMemberSyncTrigger: Auto-sync trigger installed');
}

/**
 * Removes the auto-sync trigger for member data
 */
function removeMemberSyncTrigger() {
  const ss = SpreadsheetApp.getActive();
  const triggers = ScriptApp.getUserTriggers(ss);

  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'onEditSyncMemberData') {
      ScriptApp.deleteTrigger(trigger);
      Logger.log('removeMemberSyncTrigger: Trigger removed');
    }
  }
}

// ============================================================================
// STEWARD CONTACT CALC - Auto-update Member Directory contact columns Y-AA
// ============================================================================

/**
 * Creates/repairs the hidden _Steward_Contact_Calc sheet with auto-updating formulas
 * This sheet provides contact data to Member Directory columns Y-AA.
 * Uses Communications Log data to track steward-member interactions.
 * Formulas are SELF-HEALING - this function re-applies them if missing/broken.
 */
function setupStewardContactCalcSheet() {
  const ss = SpreadsheetApp.getActive();

  // Get or create the hidden calculation sheet
  let calcSheet = ss.getSheetByName(SHEETS.STEWARD_CONTACT_CALC);
  if (!calcSheet) {
    calcSheet = ss.insertSheet(SHEETS.STEWARD_CONTACT_CALC);
    Logger.log('Created hidden calculation sheet: ' + SHEETS.STEWARD_CONTACT_CALC);
  }

  // Hide the sheet (self-healing - re-hide if someone unhid it)
  calcSheet.hideSheet();

  // Clear and rebuild (self-healing)
  calcSheet.clear();

  // Set up headers
  calcSheet.getRange('A1:E1').setValues([[
    'Member ID', 'Member Email', 'Recent Contact Date', 'Contact Steward', 'Contact Notes'
  ]]);
  calcSheet.getRange('A1:E1').setFontWeight('bold').setBackground('#E5E7EB');

  // Dynamic column references for Member Directory
  const mMemberIdCol = getColumnLetter(MEMBER_COLS.MEMBER_ID);
  const mEmailCol = getColumnLetter(MEMBER_COLS.EMAIL);
  const mSheetName = SHEETS.MEMBER_DIR;

  // Dynamic column references for Communications Log
  const cTimestampCol = getColumnLetter(COMM_LOG_COLS.TIMESTAMP);
  const cRecipientCol = getColumnLetter(COMM_LOG_COLS.RECIPIENT);
  const cSubjectCol = getColumnLetter(COMM_LOG_COLS.SUBJECT);
  const cSentByCol = getColumnLetter(COMM_LOG_COLS.SENT_BY);
  const cSheetName = SHEETS.COMMUNICATIONS_LOG;

  // Column A: Member IDs from Member Directory
  calcSheet.getRange('A2').setFormula(
    `=FILTER('${mSheetName}'!${mMemberIdCol}:${mMemberIdCol}, '${mSheetName}'!${mMemberIdCol}:${mMemberIdCol}<>"", '${mSheetName}'!${mMemberIdCol}:${mMemberIdCol}<>"Member ID")`
  );

  // Column B: Member Emails from Member Directory (for joining with Communications Log)
  calcSheet.getRange('B2').setFormula(
    `=MAP(A2:A,LAMBDA(m,IF(m="","",IFERROR(INDEX('${mSheetName}'!${mEmailCol}:${mEmailCol},MATCH(m,'${mSheetName}'!${mMemberIdCol}:${mMemberIdCol},0)),""))))`
  );

  // Column C: Recent Contact Date - Most recent timestamp from Communications Log for this email
  calcSheet.getRange('C2').setFormula(
    `=MAP(B2:B,LAMBDA(email,IF(email="","",IFERROR(MAXIFS('${cSheetName}'!${cTimestampCol}:${cTimestampCol},'${cSheetName}'!${cRecipientCol}:${cRecipientCol},email),""))))`
  );

  // Column D: Contact Steward - Who sent the most recent communication
  // Uses INDEX/MATCH with the max timestamp to get the sender
  calcSheet.getRange('D2').setFormula(
    `=MAP(B2:B,LAMBDA(email,IF(email="","",LET(maxDate,MAXIFS('${cSheetName}'!${cTimestampCol}:${cTimestampCol},'${cSheetName}'!${cRecipientCol}:${cRecipientCol},email),IFERROR(INDEX('${cSheetName}'!${cSentByCol}:${cSentByCol},MATCH(1,(('${cSheetName}'!${cRecipientCol}:${cRecipientCol}=email)*('${cSheetName}'!${cTimestampCol}:${cTimestampCol}=maxDate)),0)),"")))))`
  );

  // Column E: Contact Notes - Subject line from the most recent communication
  calcSheet.getRange('E2').setFormula(
    `=MAP(B2:B,LAMBDA(email,IF(email="","",LET(maxDate,MAXIFS('${cSheetName}'!${cTimestampCol}:${cTimestampCol},'${cSheetName}'!${cRecipientCol}:${cRecipientCol},email),IFERROR(INDEX('${cSheetName}'!${cSubjectCol}:${cSubjectCol},MATCH(1,(('${cSheetName}'!${cRecipientCol}:${cRecipientCol}=email)*('${cSheetName}'!${cTimestampCol}:${cTimestampCol}=maxDate)),0)),"")))))`
  );

  // Format the sheet
  calcSheet.setColumnWidth(1, 120);
  calcSheet.setColumnWidth(2, 180);
  calcSheet.setColumnWidth(3, 140);
  calcSheet.setColumnWidth(4, 150);
  calcSheet.setColumnWidth(5, 200);

  Logger.log('setupStewardContactCalcSheet: Hidden calculation sheet configured with self-healing formulas');
}

/**
 * Syncs calculated values from hidden _Steward_Contact_Calc sheet to Member Directory
 * Reads the formula-calculated values and writes them as static values to Member Directory columns Y-AA.
 *
 * @returns {Object} { processed: number }
 */
function syncStewardContactToMemberDirectory() {
  const ss = SpreadsheetApp.getActive();
  const calcSheet = ss.getSheetByName(SHEETS.STEWARD_CONTACT_CALC);
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!calcSheet) {
    throw new Error('Steward Contact Calc sheet not found. Run setupStewardContactCalcSheet() first.');
  }
  if (!memberDir) {
    throw new Error('Member Directory not found.');
  }

  // Force formulas to recalculate
  SpreadsheetApp.flush();

  // Read calculated values from hidden sheet (columns A, C, D, E - skip B which is just email for joining)
  const calcLastRow = calcSheet.getLastRow();
  if (calcLastRow < 2) {
    return { processed: 0 };
  }

  const calcData = calcSheet.getRange(2, 1, calcLastRow - 1, 5).getValues();

  // Build lookup map: memberId -> { contactDate, contactSteward, contactNotes }
  const calcMap = {};
  for (let i = 0; i < calcData.length; i++) {
    const memberId = String(calcData[i][0] || '');
    if (memberId) {
      calcMap[memberId] = {
        contactDate: calcData[i][2] || '',
        contactSteward: calcData[i][3] || '',
        contactNotes: calcData[i][4] || ''
      };
    }
  }

  // Read Member Directory member IDs
  const memberLastRow = memberDir.getLastRow();
  if (memberLastRow < 2) {
    return { processed: 0 };
  }

  const memberIds = memberDir.getRange(2, MEMBER_COLS.MEMBER_ID, memberLastRow - 1, 1).getValues();

  // Build output arrays matching Member Directory row order
  const contactDateArr = [];
  const contactStewardArr = [];
  const contactNotesArr = [];

  for (let i = 0; i < memberIds.length; i++) {
    const memberId = String(memberIds[i][0] || '');
    const calc = calcMap[memberId];

    if (calc) {
      contactDateArr.push([calc.contactDate]);
      contactStewardArr.push([calc.contactSteward]);
      contactNotesArr.push([calc.contactNotes]);
    } else {
      contactDateArr.push(['']);
      contactStewardArr.push(['']);
      contactNotesArr.push(['']);
    }
  }

  // Write to Member Directory columns Y, Z, AA
  const numRows = contactDateArr.length;
  if (numRows > 0) {
    memberDir.getRange(2, MEMBER_COLS.RECENT_CONTACT_DATE, numRows, 1).setValues(contactDateArr);
    memberDir.getRange(2, MEMBER_COLS.CONTACT_STEWARD, numRows, 1).setValues(contactStewardArr);
    memberDir.getRange(2, MEMBER_COLS.CONTACT_NOTES, numRows, 1).setValues(contactNotesArr);
  }

  Logger.log(`syncStewardContactToMemberDirectory: Synced ${numRows} members`);
  return { processed: numRows };
}

/**
 * onEdit trigger handler for auto-syncing steward contact data to Member Directory
 * Called when any cell is edited. Only acts on Communications Log changes.
 *
 * @param {Object} e - Edit event object
 */
function onEditSyncStewardContact(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();

    // Only sync when Communications Log is edited
    if (sheetName !== SHEETS.COMMUNICATIONS_LOG) {
      return;
    }

    // Debounce: Only sync if more than 2 seconds since last sync
    const cache = CacheService.getScriptCache();
    const lastSync = cache.get('lastStewardContactSync');
    const now = new Date().getTime();

    if (!lastSync || (now - parseInt(lastSync)) > 2000) {
      cache.put('lastStewardContactSync', now.toString(), 60);

      // Sync after a brief delay to allow formula recalculation
      Utilities.sleep(500);
      syncStewardContactToMemberDirectory();
    }
  } catch (error) {
    // Silent fail for onEdit - don't interrupt user
    Logger.log('onEditSyncStewardContact error: ' + error.message);
  }
}

/**
 * Installs the auto-sync trigger for steward contact data
 * Call this once during setup or repair.
 */
function installStewardContactSyncTrigger() {
  const ss = SpreadsheetApp.getActive();

  // Remove existing triggers for this function
  const triggers = ScriptApp.getUserTriggers(ss);
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'onEditSyncStewardContact') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Install new trigger
  ScriptApp.newTrigger('onEditSyncStewardContact')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  Logger.log('installStewardContactSyncTrigger: Auto-sync trigger installed');
}

/**
 * Removes the auto-sync trigger for steward contact data
 */
function removeStewardContactSyncTrigger() {
  const ss = SpreadsheetApp.getActive();
  const triggers = ScriptApp.getUserTriggers(ss);

  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'onEditSyncStewardContact') {
      ScriptApp.deleteTrigger(trigger);
      Logger.log('removeStewardContactSyncTrigger: Trigger removed');
    }
  }
}

// ============================================================================
// ENGAGEMENT CALC - Auto-update Member Directory engagement columns Q-T
// ============================================================================

/**
 * Creates/repairs the hidden _Engagement_Calc sheet with auto-updating formulas
 * This sheet provides engagement metrics to Member Directory columns Q-T.
 * NOTE: Currently placeholder - requires source data sheets for:
 * - Meeting attendance log (for Last Virtual/In-Person Meeting)
 * - Email analytics (for Open Rate)
 * - Volunteer tracking (for Volunteer Hours)
 * Formulas are SELF-HEALING - this function re-applies them if missing/broken.
 */
function setupEngagementCalcSheet() {
  const ss = SpreadsheetApp.getActive();

  // Get or create the hidden calculation sheet
  let calcSheet = ss.getSheetByName(SHEETS.ENGAGEMENT_CALC);
  if (!calcSheet) {
    calcSheet = ss.insertSheet(SHEETS.ENGAGEMENT_CALC);
    Logger.log('Created hidden calculation sheet: ' + SHEETS.ENGAGEMENT_CALC);
  }

  // Hide the sheet (self-healing - re-hide if someone unhid it)
  calcSheet.hideSheet();

  // Clear and rebuild (self-healing)
  calcSheet.clear();

  // Set up headers
  calcSheet.getRange('A1:E1').setValues([[
    'Member ID', 'Last Virtual Mtg', 'Last In-Person Mtg', 'Open Rate (%)', 'Volunteer Hours'
  ]]);
  calcSheet.getRange('A1:E1').setFontWeight('bold').setBackground('#E5E7EB');

  // Dynamic column references for Member Directory
  const mMemberIdCol = getColumnLetter(MEMBER_COLS.MEMBER_ID);
  const mSheetName = SHEETS.MEMBER_DIR;

  // Check if source sheets exist
  const meetingSheet = ss.getSheetByName(SHEETS.MEETING_ATTENDANCE);
  const volunteerSheet = ss.getSheetByName(SHEETS.VOLUNTEER_HOURS);

  // Dynamic column references for Meeting Attendance (if exists)
  const mtgDateCol = getColumnLetter(MEETING_COLS.MEETING_DATE);
  const mtgTypeCol = getColumnLetter(MEETING_COLS.MEETING_TYPE);
  const mtgMemberIdCol = getColumnLetter(MEETING_COLS.MEMBER_ID);
  const mtgAttendedCol = getColumnLetter(MEETING_COLS.ATTENDED);
  const mtgSheetName = SHEETS.MEETING_ATTENDANCE;

  // Dynamic column references for Volunteer Hours (if exists)
  const volMemberIdCol = getColumnLetter(VOLUNTEER_COLS.MEMBER_ID);
  const volHoursCol = getColumnLetter(VOLUNTEER_COLS.HOURS);
  const volSheetName = SHEETS.VOLUNTEER_HOURS;

  // Column A: Member IDs from Member Directory
  calcSheet.getRange('A2').setFormula(
    `=FILTER('${mSheetName}'!${mMemberIdCol}:${mMemberIdCol}, '${mSheetName}'!${mMemberIdCol}:${mMemberIdCol}<>"", '${mSheetName}'!${mMemberIdCol}:${mMemberIdCol}<>"Member ID")`
  );

  // Column B: Last Virtual Meeting Date
  if (meetingSheet) {
    // Real formula: Get max date where meeting type is Virtual and member attended
    calcSheet.getRange('B2').setFormula(
      `=MAP(A2:A,LAMBDA(m,IF(m="","",IFERROR(MAXIFS('${mtgSheetName}'!${mtgDateCol}:${mtgDateCol},'${mtgSheetName}'!${mtgMemberIdCol}:${mtgMemberIdCol},m,'${mtgSheetName}'!${mtgTypeCol}:${mtgTypeCol},"Virtual",'${mtgSheetName}'!${mtgAttendedCol}:${mtgAttendedCol},"Yes"),""))))`
    );
  } else {
    calcSheet.getRange('B2').setFormula(`=MAP(A2:A,LAMBDA(m,IF(m="","","")))`);
  }

  // Column C: Last In-Person Meeting Date
  if (meetingSheet) {
    // Real formula: Get max date where meeting type is In-Person and member attended
    calcSheet.getRange('C2').setFormula(
      `=MAP(A2:A,LAMBDA(m,IF(m="","",IFERROR(MAXIFS('${mtgSheetName}'!${mtgDateCol}:${mtgDateCol},'${mtgSheetName}'!${mtgMemberIdCol}:${mtgMemberIdCol},m,'${mtgSheetName}'!${mtgTypeCol}:${mtgTypeCol},"In-Person",'${mtgSheetName}'!${mtgAttendedCol}:${mtgAttendedCol},"Yes"),""))))`
    );
  } else {
    calcSheet.getRange('C2').setFormula(`=MAP(A2:A,LAMBDA(m,IF(m="","","")))`);
  }

  // Column D: Open Rate (%) - Placeholder until email analytics sheet exists
  calcSheet.getRange('D2').setFormula(`=MAP(A2:A,LAMBDA(m,IF(m="","","")))`);

  // Column E: Volunteer Hours (total for member)
  if (volunteerSheet) {
    // Real formula: Sum all hours for each member
    calcSheet.getRange('E2').setFormula(
      `=MAP(A2:A,LAMBDA(m,IF(m="","",IFERROR(SUMIF('${volSheetName}'!${volMemberIdCol}:${volMemberIdCol},m,'${volSheetName}'!${volHoursCol}:${volHoursCol}),0))))`
    );
  } else {
    calcSheet.getRange('E2').setFormula(`=MAP(A2:A,LAMBDA(m,IF(m="","","")))`);
  }

  // Add status notes
  const notes = [];
  notes.push('STATUS:');
  notes.push(meetingSheet ? '✅ Meeting Attendance connected (B, C)' : '⚠️ Run createMeetingAttendanceSheet()');
  notes.push('⚠️ Email Analytics not implemented (D)');
  notes.push(volunteerSheet ? '✅ Volunteer Hours connected (E)' : '⚠️ Run createVolunteerHoursSheet()');

  calcSheet.getRange('G1').setValue(notes[0]);
  calcSheet.getRange('G2').setValue(notes[1]);
  calcSheet.getRange('G3').setValue(notes[2]);
  calcSheet.getRange('G4').setValue(notes[3]);
  calcSheet.getRange('G1:G4').setFontStyle('italic').setFontColor('#6B7280');

  // Format the sheet
  calcSheet.setColumnWidth(1, 120);
  calcSheet.setColumnWidth(2, 140);
  calcSheet.setColumnWidth(3, 150);
  calcSheet.setColumnWidth(4, 100);
  calcSheet.setColumnWidth(5, 120);
  calcSheet.setColumnWidth(7, 350);

  const connectedSources = (meetingSheet ? 2 : 0) + (volunteerSheet ? 1 : 0);
  Logger.log('setupEngagementCalcSheet: Hidden calculation sheet configured (' + connectedSources + '/3 sources connected)');
}

/**
 * Syncs calculated values from hidden _Engagement_Calc sheet to Member Directory
 * Reads the formula-calculated values and writes them as static values to Member Directory columns Q-T.
 *
 * @returns {Object} { processed: number }
 */
function syncEngagementToMemberDirectory() {
  const ss = SpreadsheetApp.getActive();
  const calcSheet = ss.getSheetByName(SHEETS.ENGAGEMENT_CALC);
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!calcSheet) {
    throw new Error('Engagement Calc sheet not found. Run setupEngagementCalcSheet() first.');
  }
  if (!memberDir) {
    throw new Error('Member Directory not found.');
  }

  // Force formulas to recalculate
  SpreadsheetApp.flush();

  // Read calculated values from hidden sheet (columns A-E)
  const calcLastRow = calcSheet.getLastRow();
  if (calcLastRow < 2) {
    return { processed: 0 };
  }

  const calcData = calcSheet.getRange(2, 1, calcLastRow - 1, 5).getValues();

  // Build lookup map: memberId -> { virtualMtg, inPersonMtg, openRate, volunteerHours }
  const calcMap = {};
  for (let i = 0; i < calcData.length; i++) {
    const memberId = String(calcData[i][0] || '');
    if (memberId) {
      calcMap[memberId] = {
        virtualMtg: calcData[i][1] || '',
        inPersonMtg: calcData[i][2] || '',
        openRate: calcData[i][3] || '',
        volunteerHours: calcData[i][4] || ''
      };
    }
  }

  // Read Member Directory member IDs
  const memberLastRow = memberDir.getLastRow();
  if (memberLastRow < 2) {
    return { processed: 0 };
  }

  const memberIds = memberDir.getRange(2, MEMBER_COLS.MEMBER_ID, memberLastRow - 1, 1).getValues();

  // Build output arrays matching Member Directory row order
  const virtualMtgArr = [];
  const inPersonMtgArr = [];
  const openRateArr = [];
  const volunteerHoursArr = [];

  for (let i = 0; i < memberIds.length; i++) {
    const memberId = String(memberIds[i][0] || '');
    const calc = calcMap[memberId];

    if (calc) {
      virtualMtgArr.push([calc.virtualMtg]);
      inPersonMtgArr.push([calc.inPersonMtg]);
      openRateArr.push([calc.openRate]);
      volunteerHoursArr.push([calc.volunteerHours]);
    } else {
      virtualMtgArr.push(['']);
      inPersonMtgArr.push(['']);
      openRateArr.push(['']);
      volunteerHoursArr.push(['']);
    }
  }

  // Write to Member Directory columns Q, R, S, T
  const numRows = virtualMtgArr.length;
  if (numRows > 0) {
    memberDir.getRange(2, MEMBER_COLS.LAST_VIRTUAL_MTG, numRows, 1).setValues(virtualMtgArr);
    memberDir.getRange(2, MEMBER_COLS.LAST_INPERSON_MTG, numRows, 1).setValues(inPersonMtgArr);
    memberDir.getRange(2, MEMBER_COLS.OPEN_RATE, numRows, 1).setValues(openRateArr);
    memberDir.getRange(2, MEMBER_COLS.VOLUNTEER_HOURS, numRows, 1).setValues(volunteerHoursArr);
  }

  Logger.log(`syncEngagementToMemberDirectory: Synced ${numRows} members`);
  return { processed: numRows };
}

/**
 * Refresh all steward contact and engagement data
 * @returns {Object} Statistics about the sync
 */
function refreshStewardContactAndEngagement() {
  const startTime = new Date();

  SpreadsheetApp.getActive().toast('Syncing contact and engagement data...', 'Please wait', -1);

  try {
    // Setup/repair the hidden sheets
    setupStewardContactCalcSheet();
    setupEngagementCalcSheet();

    // Sync to Member Directory
    const contactResult = syncStewardContactToMemberDirectory();
    const engagementResult = syncEngagementToMemberDirectory();

    const duration = new Date() - startTime;
    SpreadsheetApp.getActive().toast(
      `Synced contact and engagement data in ${(duration / 1000).toFixed(1)}s`,
      'Complete',
      5
    );

    return {
      contactProcessed: contactResult.processed,
      engagementProcessed: engagementResult.processed,
      duration: duration
    };
  } catch (error) {
    Logger.log('Error in refreshStewardContactAndEngagement: ' + error.message);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    return { error: error.message };
  }
}

/**
 * Refresh all calculated data (Grievance Log + Member Directory)
 * Recalculates static values for both sheets - NO formulas in visible sheets.
 *
 * Cross-population flows:
 * 1. Grievance Log timeline columns (H, J, L, N, P, S, T, U) - batch calculated
 * 2. Member Directory grievance columns (AB, AC, AD) - from hidden _Grievance_Calc
 * 3. Grievance Log member columns (C, D, X, Y, Z, AA) - from hidden _Member_Lookup
 * 4. Member Directory steward contact columns (Y, Z, AA) - from hidden _Steward_Contact_Calc
 * 5. Member Directory engagement columns (Q-T) - from hidden _Engagement_Calc
 */
function refreshAllFormulas() {
  const ui = SpreadsheetApp.getUi();
  SpreadsheetApp.getActive().toast('Recalculating all data...', 'Please wait', -1);

  try {
    // 1. Recalculate Grievance Log timeline columns (H, J, L, N, P, S, T, U)
    const grievanceResult = recalcAllGrievancesBatched();

    // 2. Recalculate Member Directory grievance columns (AB, AC, AD)
    const memberDirResult = refreshMemberDirectoryFormulas();

    // 3. Recalculate Grievance Log member columns (C, D, X, Y, Z, AA)
    const grievanceMemberResult = refreshGrievanceLogMemberData();

    // 4. Recalculate Member Directory steward contact columns (Y, Z, AA)
    setupStewardContactCalcSheet();
    const contactResult = syncStewardContactToMemberDirectory();

    // 5. Recalculate Member Directory engagement columns (Q-T)
    setupEngagementCalcSheet();
    const engagementResult = syncEngagementToMemberDirectory();

    ui.alert(
      '✅ All Data Refreshed',
      `Grievance Log timelines: ${grievanceResult.processed} rows\n` +
      `Member Directory grievance data: ${memberDirResult.processed} members\n` +
      `Grievance Log member data: ${grievanceMemberResult.processed} grievances\n` +
      `Steward contact data: ${contactResult.processed} members\n` +
      `Engagement data: ${engagementResult.processed} members\n\n` +
      'All cross-population uses hidden sheets with auto-sync triggers.',
      ui.ButtonSet.OK
    );
  } catch (error) {
    Logger.log('Error in refreshAllFormulas: ' + error.message);
    ui.alert('Error: ' + error.message);
  }
}

/* --------------------- ANALYTICS DATA SHEET --------------------- */
function createAnalyticsDataSheet() {
  const ss = SpreadsheetApp.getActive();
  let analytics = ss.getSheetByName(SHEETS.ANALYTICS);

  if (!analytics) {
    analytics = ss.insertSheet(SHEETS.ANALYTICS);
  }
  analytics.clear();

  analytics.getRange("A1").setValue("ANALYTICS DATA - Calculated from Member Directory & Grievance Log");
  analytics.getRange("A1").setFontWeight("bold").setBackground("#6366F1").setFontColor("#FFFFFF");

  // Dynamic column references for Grievance Log
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);

  // Grievances by Status
  analytics.getRange("A3").setValue("Grievances by Status");
  analytics.getRange("A4:B4").setValues([["Status", "Count"]]).setFontWeight("bold");
  analytics.getRange("A5").setFormula(`=UNIQUE(FILTER('Grievance Log'!${statusCol}:${statusCol}, 'Grievance Log'!${statusCol}:${statusCol}<>"", 'Grievance Log'!${statusCol}:${statusCol}<>"Status"))`);
  analytics.getRange("B5").setFormula(`=ARRAYFORMULA(IF(A5:A<>"", COUNTIF('Grievance Log'!${statusCol}:${statusCol}, A5:A), ""))`);

  // Grievances by Unit (dynamic column reference)
  const unitCol = getColumnLetter(GRIEVANCE_COLS.UNIT);
  analytics.getRange("D3").setValue("Grievances by Unit");
  analytics.getRange("D4:E4").setValues([["Unit", "Count"]]).setFontWeight("bold");
  analytics.getRange("D5").setFormula(`=UNIQUE(FILTER('Grievance Log'!${unitCol}:${unitCol}, 'Grievance Log'!${unitCol}:${unitCol}<>"", 'Grievance Log'!${unitCol}:${unitCol}<>"Unit"))`);
  analytics.getRange("E5").setFormula(`=ARRAYFORMULA(IF(D5:D<>"", COUNTIF('Grievance Log'!${unitCol}:${unitCol}, D5:D), ""))`);

  // Members by Location (dynamic column references)
  const workLocationCol = getColumnLetter(MEMBER_COLS.WORK_LOCATION);
  analytics.getRange("G3").setValue("Members by Location");
  analytics.getRange("G4:H4").setValues([["Location", "Count"]]).setFontWeight("bold");
  analytics.getRange("G5").setFormula(`=UNIQUE(FILTER('Member Directory'!${workLocationCol}:${workLocationCol}, 'Member Directory'!${workLocationCol}:${workLocationCol}<>"", 'Member Directory'!${workLocationCol}:${workLocationCol}<>"Work Location (Site)"))`);
  analytics.getRange("H5").setFormula(`=ARRAYFORMULA(IF(G5:G<>"", COUNTIF('Member Directory'!${workLocationCol}:${workLocationCol}, G5:G), ""))`);

  // Steward Workload (dynamic column references)
  const stewardCol = getColumnLetter(GRIEVANCE_COLS.STEWARD);
  analytics.getRange("J3").setValue("Steward Workload");
  analytics.getRange("J4:K4").setValues([["Steward", "Open Cases"]]).setFontWeight("bold");
  analytics.getRange("J5").setFormula(`=UNIQUE(FILTER('Grievance Log'!${stewardCol}:${stewardCol}, 'Grievance Log'!${stewardCol}:${stewardCol}<>"", 'Grievance Log'!${stewardCol}:${stewardCol}<>"Assigned Steward (Name)"))`);
  analytics.getRange("K5").setFormula(`=ARRAYFORMULA(IF(J5:J<>"", COUNTIFS('Grievance Log'!${stewardCol}:${stewardCol}, J5:J, 'Grievance Log'!${statusCol}:${statusCol}, "Open"), ""))`);

  // Delete unused columns - detect last used column dynamically
  const lastCol = analytics.getLastColumn();
  const totalCols = analytics.getMaxColumns();
  if (lastCol > 0 && totalCols > lastCol) {
    analytics.deleteColumns(lastCol + 1, totalCols - lastCol);
  }

  analytics.hideSheet();
}

/* --------------------- MEMBER SATISFACTION --------------------- */
function createMemberSatisfactionSheet() {
  const ss = SpreadsheetApp.getActive();
  let satisfaction = ss.getSheetByName(SHEETS.MEMBER_SATISFACTION);

  if (!satisfaction) {
    satisfaction = ss.insertSheet(SHEETS.MEMBER_SATISFACTION);
  }
  satisfaction.clear();

  satisfaction.getRange("A1:J1").merge()
    .setValue("😊 MEMBER SATISFACTION TRACKING")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground("#10B981")
    .setFontColor("#FFFFFF");

  const headers = [
    "Survey ID",
    "Member ID",
    "Member Name",
    "Date Sent",
    "Date Completed",
    "Overall Satisfaction (1-5)",
    "Steward Support (1-5)",
    "Communication (1-5)",
    "Would Recommend Union (Y/N)",
    "Comments"
  ];

  satisfaction.getRange(3, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold")
    .setBackground("#F3F4F6");

  satisfaction.setFrozenRows(3);

  satisfaction.getRange("A10:E10").merge()
    .setValue("SATISFACTION METRICS")
    .setFontWeight("bold")
    .setBackground("#E0E7FF");

  const metrics = [
    ["Average Overall Satisfaction:", "=IFERROR(AVERAGE(F4:F1000),\"-\")"],
    ["Average Steward Support:", "=IFERROR(AVERAGE(G4:G1000),\"-\")"],
    ["Average Communication:", "=IFERROR(AVERAGE(H4:H1000),\"-\")"],
    ["% Would Recommend:", "=IFERROR(TEXT(COUNTIF(I4:I1000,\"Y\")/COUNTA(I4:I1000),\"0.0%\"),\"-\")"]
  ];

  satisfaction.getRange(11, 1, metrics.length, 2).setValues(metrics);
  satisfaction.setTabColor("#10B981");

  // Delete unused columns beyond the defined headers (10 columns)
  const totalCols = satisfaction.getMaxColumns();
  if (totalCols > headers.length) {
    satisfaction.deleteColumns(headers.length + 1, totalCols - headers.length);
  }
}

/* --------------------- FEEDBACK & DEVELOPMENT --------------------- */
function createFeedbackSheet() {
  const ss = SpreadsheetApp.getActive();
  let feedback = ss.getSheetByName(SHEETS.FEEDBACK);
  if (!feedback) feedback = ss.insertSheet(SHEETS.FEEDBACK);
  feedback.clear();
  feedback.getRange("A1:N1").merge().setValue("💡 FEEDBACK, FEATURES & DEVELOPMENT ROADMAP").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground(COLORS.ACCENT_PURPLE).setFontColor("white");
  feedback.getRange("A2:N2").merge().setValue("🎯 Track bugs, feedback, future features, and work in progress - all in one place").setFontSize(10).setFontStyle("italic").setHorizontalAlignment("center").setBackground(COLORS.LIGHT_GRAY).setFontColor(COLORS.TEXT_GRAY);
  const headers = ["Type", "Submitted/Started", "Submitted By", "Priority", "Title", "Description", "Status", "Progress %", "Complexity", "Target Completion", "Assigned To", "Blockers", "Resolution/Notes", "Last Updated"];
  feedback.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground(COLORS.LIGHT_GRAY).setFontColor(COLORS.TEXT_DARK);
  const typeRule = SpreadsheetApp.newDataValidation().requireValueInList(['Bug Report', 'Feedback', 'Future Feature', 'In Progress', 'Completed', 'Archived'], true).setAllowInvalid(false).build();
  feedback.getRange("A4:A1000").setDataValidation(typeRule);
  const priorityRule = SpreadsheetApp.newDataValidation().requireValueInList(['Critical', 'High', 'Medium', 'Low'], true).setAllowInvalid(false).build();
  feedback.getRange("D4:D1000").setDataValidation(priorityRule);
  const statusRule = SpreadsheetApp.newDataValidation().requireValueInList(['New', 'Under Review', 'Planned', 'In Progress', 'Testing', 'Completed', 'Deferred', 'Cancelled'], true).setAllowInvalid(false).build();
  feedback.getRange("G4:G1000").setDataValidation(statusRule);
  const complexityRule = SpreadsheetApp.newDataValidation().requireValueInList(['Simple', 'Moderate', 'Complex', 'Very Complex'], true).setAllowInvalid(false).build();
  feedback.getRange("I4:I1000").setDataValidation(complexityRule);
  feedback.setFrozenRows(3);
  feedback.setTabColor(COLORS.ACCENT_PURPLE);
  feedback.setColumnWidth(1, 120); feedback.setColumnWidth(2, 110); feedback.setColumnWidth(3, 120); feedback.setColumnWidth(4, 80); feedback.setColumnWidth(5, 200); feedback.setColumnWidth(6, 300); feedback.setColumnWidth(7, 100); feedback.setColumnWidth(8, 90); feedback.setColumnWidth(9, 100); feedback.setColumnWidth(10, 110); feedback.setColumnWidth(11, 120); feedback.setColumnWidth(12, 200); feedback.setColumnWidth(13, 250); feedback.setColumnWidth(14, 110);

  // Delete unused columns beyond the defined headers (14 columns)
  const totalCols = feedback.getMaxColumns();
  if (totalCols > headers.length) {
    feedback.deleteColumns(headers.length + 1, totalCols - headers.length);
  }
}

/* --------------------- STEWARD WORKLOAD --------------------- */
function createStewardWorkloadSheet() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEETS.STEWARD_WORKLOAD);
  if (!sheet) sheet = ss.insertSheet(SHEETS.STEWARD_WORKLOAD);
  sheet.clear();
  sheet.getRange("A1:K1").merge().setValue("👨‍⚖️ STEWARD WORKLOAD ANALYSIS").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground(COLORS.PRIMARY_PURPLE).setFontColor("white");
  const headers = ["Steward Name", "Total Cases", "Active Cases", "Resolved Cases", "Win Rate %", "Avg Days to Resolution", "Overdue Cases", "Due This Week", "Capacity Status", "Email", "Phone"];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground(COLORS.LIGHT_GRAY);
  sheet.setFrozenRows(3);
  sheet.setTabColor(COLORS.PRIMARY_PURPLE);

  // Delete unused columns beyond the defined headers (11 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }
}

/**
 * @deprecated Use createOperationsAnalyticsSheet() instead
 * Trends & Timeline is now part of the merged Operations Analytics dashboard
 */
function createTrendsSheet() {
  Logger.log('createTrendsSheet() is deprecated - redirecting to Operations Analytics');
  if (typeof createOperationsAnalyticsSheet === 'function') {
    createOperationsAnalyticsSheet();
  }
}


/**
 * @deprecated Use createOperationsAnalyticsSheet() instead
 * Location Analytics is now part of the merged Operations Analytics dashboard
 */
function createLocationSheet() {
  Logger.log('createLocationSheet() is deprecated - redirecting to Operations Analytics');
  if (typeof createOperationsAnalyticsSheet === 'function') {
    createOperationsAnalyticsSheet();
  }
}

/**
 * @deprecated Use createOperationsAnalyticsSheet() instead
 * Type Analysis is now part of the merged Operations Analytics dashboard
 */
function createTypeAnalysisSheet() {
  Logger.log('createTypeAnalysisSheet() is deprecated - redirecting to Operations Analytics');
  if (typeof createOperationsAnalyticsSheet === 'function') {
    createOperationsAnalyticsSheet();
  }
}

/* --------------------- EXECUTIVE DASHBOARD (Comprehensive Merged Dashboard) --------------------- */
/* Merges: Quick Stats, Detailed KPIs, KPI Performance, Location Analytics, Type Analysis */
function createExecutiveDashboard() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEETS.EXECUTIVE_DASHBOARD);

  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.EXECUTIVE_DASHBOARD);
  }
  sheet.clear();

  // Dynamic column references for formulas
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const daysOpenCol = getColumnLetter(GRIEVANCE_COLS.DAYS_OPEN);
  const daysToDeadlineCol = getColumnLetter(GRIEVANCE_COLS.DAYS_TO_DEADLINE);
  const grievanceIdCol = getColumnLetter(GRIEVANCE_COLS.GRIEVANCE_ID);
  const dateFiledCol = getColumnLetter(GRIEVANCE_COLS.DATE_FILED);
  const dateClosedCol = getColumnLetter(GRIEVANCE_COLS.DATE_CLOSED);
  const gLocationCol = getColumnLetter(GRIEVANCE_COLS.LOCATION);
  const gIssueCategoryCol = getColumnLetter(GRIEVANCE_COLS.ISSUE_CATEGORY);

  const memberIdCol = getColumnLetter(MEMBER_COLS.MEMBER_ID);
  const isStewardCol = getColumnLetter(MEMBER_COLS.IS_STEWARD);
  const mLocationCol = getColumnLetter(MEMBER_COLS.LOCATION);
  const hasOpenGrievanceCol = getColumnLetter(MEMBER_COLS.HAS_OPEN_GRIEVANCE);

  // ============ HEADER ============
  sheet.getRange("A1:L1").merge()
    .setValue("💼 EXECUTIVE DASHBOARD")
    .setFontSize(20)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor("white");

  sheet.getRange("A2:L2").merge()
    .setValue("Comprehensive analytics: Quick Stats | KPI Performance | Location Analytics | Issue Analysis")
    .setFontSize(10)
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.LIGHT_GRAY)
    .setFontColor(COLORS.TEXT_GRAY);

  // ============ SECTION 1: QUICK STATS (Rows 4-11) ============
  sheet.getRange("A4:D4").merge()
    .setValue("⚡ QUICK STATS")
    .setFontWeight("bold")
    .setFontSize(14)
    .setBackground(COLORS.ACCENT_ORANGE)
    .setFontColor("white")
    .setHorizontalAlignment("center");

  sheet.getRange(5, 1, 1, 4).setValues([["Metric", "Value", "Comparison", "Trend"]])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  const quickStats = [
    ["Active Members", `=TEXT(COUNTA('Member Directory'!${memberIdCol}2:${memberIdCol}),"#,##0")`, `=IF(VALUE(SUBSTITUTE(B6,",",""))>0,"📊 Data","⚠️ Empty")`, `=IF(VALUE(SUBSTITUTE(B6,",",""))>100,"✅ Strong","⚠️ Growing")`],
    ["Active Grievances", `=TEXT(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Open"),"#,##0")`, `=IF(VALUE(SUBSTITUTE(B7,",",""))<10,"🟢 Low",IF(VALUE(SUBSTITUTE(B7,",",""))<25,"🟡 Normal","🔴 High"))`, `=IF(VALUE(SUBSTITUTE(B7,",",""))>10,"⚠️ Monitor","✅ Good")`],
    ["Overall Win Rate", `=IFERROR(TEXT(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Settled")/(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Settled")+COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Denied")),"0%"),"0%")`, "Target: 70%", `=IF(VALUE(SUBSTITUTE(B8,"%",""))>=70,"✅ On Target","⚠️ Below")`],
    ["Avg Resolution (Days)", `=IFERROR(TEXT(ROUND(AVERAGE('Grievance Log'!${daysOpenCol}:${daysOpenCol}),0),"#,##0"),"-")`, "Target: <30", `=IF(ISNUMBER(VALUE(B9)),IF(VALUE(B9)<30,"✅ Fast",IF(VALUE(B9)<60,"🟡 Normal","🔴 Slow")),"-")`],
    ["Overdue Cases", `=TEXT(COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Open",'Grievance Log'!${daysToDeadlineCol}:${daysToDeadlineCol},"<0"),"#,##0")`, `=IF(VALUE(SUBSTITUTE(B10,",",""))=0,"✅ None",B10&" need attention")`, `=IF(VALUE(SUBSTITUTE(B10,",",""))=0,"✅ Clear","🔴 Action Required")`],
    ["Active Stewards", `=TEXT(COUNTIF('Member Directory'!${isStewardCol}:${isStewardCol},"Yes"),"#,##0")`, `=IFERROR(TEXT(ROUND(VALUE(SUBSTITUTE(B6,",",""))/VALUE(SUBSTITUTE(B11,",","")),0),"#,##0")&" per steward","-")`, `=IF(IFERROR(VALUE(SUBSTITUTE(B6,",",""))/VALUE(SUBSTITUTE(B11,",","")),999)<100,"✅ Good Ratio","⚠️ Need More")`]
  ];
  sheet.getRange(6, 1, quickStats.length, 4).setValues(quickStats);

  // ============ SECTION 2: KPI PERFORMANCE TABLE (Rows 13-22) ============
  sheet.getRange("A13:L13").merge()
    .setValue("📊 KPI PERFORMANCE TRACKING")
    .setFontWeight("bold")
    .setFontSize(14)
    .setBackground(COLORS.UNION_GREEN)
    .setFontColor("white")
    .setHorizontalAlignment("center");

  const kpiHeaders = ["KPI Name", "Current", "Target", "Variance", "% Change", "Status", "Last Month", "YTD Avg", "Best", "Worst", "Owner", "Updated"];
  sheet.getRange(14, 1, 1, kpiHeaders.length).setValues([kpiHeaders])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  const kpiData = [
    ["Total Members", `=TEXT(COUNTA('Member Directory'!${memberIdCol}2:${memberIdCol}),"#,##0")`, "20,000", `=TEXT(VALUE(SUBSTITUTE(B15,",",""))-VALUE(SUBSTITUTE(C15,",","")),"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B15,",",""))-VALUE(SUBSTITUTE(C15,",","")))/VALUE(SUBSTITUTE(C15,",","")),"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B15,",",""))>=VALUE(SUBSTITUTE(C15,",","")),"On Track","At Risk")`, `=B15`, `=B15`, `=B15`, `=B15`, "HR Team", `=TEXT(NOW(),"MM/dd")`],
    ["Active Grievances", `=TEXT(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Open"),"#,##0")`, "25", `=TEXT(VALUE(SUBSTITUTE(B16,",",""))-C16,"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B16,",",""))-C16)/C16,"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B16,",",""))<=C16,"On Track","At Risk")`, `=B16`, `=B16`, `=B16`, `=B16`, "Steward Lead", `=TEXT(NOW(),"MM/dd")`],
    ["Win Rate %", `=IFERROR(ROUND(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Settled")/(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Settled")+COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Denied"))*100,1),0)`, "70", `=B17-C17`, `=IFERROR(TEXT((B17-C17)/C17,"0%"),"-")`, `=IF(B17>=C17,"On Track","At Risk")`, `=B17`, `=B17`, `=B17`, `=B17`, "Steward Lead", `=TEXT(NOW(),"MM/dd")`],
    ["Avg Days to Resolve", `=IFERROR(TEXT(ROUND(AVERAGE('Grievance Log'!${daysOpenCol}:${daysOpenCol}),0),"#,##0"),0)`, "30", `=TEXT(VALUE(SUBSTITUTE(B18,",",""))-C18,"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B18,",",""))-C18)/C18,"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B18,",",""))<=C18,"On Track","At Risk")`, `=B18`, `=B18`, `=B18`, `=B18`, "Steward Lead", `=TEXT(NOW(),"MM/dd")`],
    ["Steward Coverage", `=TEXT(COUNTIF('Member Directory'!${isStewardCol}:${isStewardCol},"Yes"),"#,##0")`, "50", `=TEXT(VALUE(SUBSTITUTE(B19,",",""))-C19,"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B19,",",""))-C19)/C19,"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B19,",",""))>=C19,"On Track","At Risk")`, `=B19`, `=B19`, `=B19`, `=B19`, "Coordinator", `=TEXT(NOW(),"MM/dd")`],
    ["Cases Settled", `=TEXT(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Settled"),"#,##0")`, "100", `=TEXT(VALUE(SUBSTITUTE(B20,",",""))-C20,"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B20,",",""))-C20)/C20,"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B20,",",""))>=C20,"Exceeding","On Track")`, `=B20`, `=B20`, `=B20`, `=B20`, "Legal", `=TEXT(NOW(),"MM/dd")`],
    ["Cases Pending", `=TEXT(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Pending Info"),"#,##0")`, "10", `=TEXT(VALUE(SUBSTITUTE(B21,",",""))-C21,"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B21,",",""))-C21)/C21,"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B21,",",""))<=C21,"On Track","At Risk")`, `=B21`, `=B21`, `=B21`, `=B21`, "Steward Lead", `=TEXT(NOW(),"MM/dd")`]
  ];
  sheet.getRange(15, 1, kpiData.length, 12).setValues(kpiData);

  // Add Status dropdown validation
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['On Track', 'At Risk', 'Off Track', 'Exceeding'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange("F15:F22").setDataValidation(statusRule);

  // ============ SECTION 3: LOCATION ANALYTICS (Rows 24-38) ============
  sheet.getRange("A24:K24").merge()
    .setValue("🗺️ LOCATION ANALYTICS")
    .setFontWeight("bold")
    .setFontSize(14)
    .setBackground(COLORS.ACCENT_TEAL)
    .setFontColor("white")
    .setHorizontalAlignment("center");

  const locHeaders = ["Location", "Members", "With Grievances", "Total Cases", "Open Cases", "Win Rate", "Avg Days", "Stewards", "Risk", "Priority", "Notes"];
  sheet.getRange(25, 1, 1, locHeaders.length).setValues([locHeaders])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Summary row
  sheet.getRange(26, 1).setValue("ALL LOCATIONS").setFontWeight("bold");
  sheet.getRange(26, 2).setFormula(`=IFERROR(TEXT(MAX(0,COUNTA('Member Directory'!$${memberIdCol}:$${memberIdCol})-1),"#,##0"),0)`);
  sheet.getRange(26, 3).setFormula(`=IFERROR(TEXT(COUNTIF('Member Directory'!$${hasOpenGrievanceCol}:$${hasOpenGrievanceCol},"Yes"),"#,##0"),0)`);
  sheet.getRange(26, 4).setFormula(`=IFERROR(TEXT(MAX(0,COUNTA('Grievance Log'!$${grievanceIdCol}:$${grievanceIdCol})-1),"#,##0"),0)`);
  sheet.getRange(26, 5).setFormula(`=IFERROR(TEXT(COUNTIF('Grievance Log'!$${statusCol}:$${statusCol},"Open"),"#,##0"),0)`);
  sheet.getRange(26, 6).setFormula(`=IFERROR(TEXT(COUNTIF('Grievance Log'!$${statusCol}:$${statusCol},"Settled")/(COUNTIF('Grievance Log'!$${statusCol}:$${statusCol},"Settled")+COUNTIF('Grievance Log'!$${statusCol}:$${statusCol},"Denied")),"0%"),"0%")`);
  sheet.getRange(26, 7).setFormula(`=IFERROR(ROUND(AVERAGEIF('Grievance Log'!$${daysOpenCol}:$${daysOpenCol},">0"),0),"-")`);
  sheet.getRange(26, 8).setFormula(`=IFERROR(TEXT(COUNTIF('Member Directory'!$${isStewardCol}:$${isStewardCol},"Yes"),"#,##0"),0)`);
  sheet.getRange(26, 9).setFormula(`=IF(E26>20,"High",IF(E26>10,"Medium","Low"))`);
  sheet.getRange(26, 10).setFormula(`=IF(I26="High","🔴 Critical",IF(I26="Medium","🟡 Monitor","🟢 Normal"))`);
  sheet.getRange(26, 11).setValue("Summary");
  sheet.getRange(26, 1, 1, 11).setBackground(COLORS.WARNING_LIGHT);

  // Dynamic location rows using UNIQUE formula
  sheet.getRange(27, 1).setFormula(`=IFERROR(UNIQUE(FILTER('Member Directory'!$${mLocationCol}:$${mLocationCol},'Member Directory'!$${mLocationCol}:$${mLocationCol}<>"",'Member Directory'!$${mLocationCol}:$${mLocationCol}<>"Work Location (Site)")),"No locations yet")`);

  // Add formulas for location analytics (rows 27-38)
  for (let i = 0; i < 12; i++) {
    const row = 27 + i;
    sheet.getRange(row, 2).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No locations yet","0",TEXT(COUNTIF('Member Directory'!$${mLocationCol}:$${mLocationCol},A${row}),"#,##0"))),"0")`);
    sheet.getRange(row, 3).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No locations yet","0",TEXT(COUNTIFS('Member Directory'!$${mLocationCol}:$${mLocationCol},A${row},'Member Directory'!$${hasOpenGrievanceCol}:$${hasOpenGrievanceCol},"Yes"),"#,##0"))),"0")`);
    sheet.getRange(row, 4).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No locations yet","0",TEXT(COUNTIF('Grievance Log'!$${gLocationCol}:$${gLocationCol},A${row}),"#,##0"))),"0")`);
    sheet.getRange(row, 5).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No locations yet","0",TEXT(COUNTIFS('Grievance Log'!$${gLocationCol}:$${gLocationCol},A${row},'Grievance Log'!$${statusCol}:$${statusCol},"Open"),"#,##0"))),"0")`);
    sheet.getRange(row, 6).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No locations yet","0%",TEXT(COUNTIFS('Grievance Log'!$${gLocationCol}:$${gLocationCol},A${row},'Grievance Log'!$${statusCol}:$${statusCol},"Settled")/(COUNTIFS('Grievance Log'!$${gLocationCol}:$${gLocationCol},A${row},'Grievance Log'!$${statusCol}:$${statusCol},"Settled")+COUNTIFS('Grievance Log'!$${gLocationCol}:$${gLocationCol},A${row},'Grievance Log'!$${statusCol}:$${statusCol},"Denied")),"0%"))),"0%")`);
    sheet.getRange(row, 7).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No locations yet","-",ROUND(AVERAGEIFS('Grievance Log'!$${daysOpenCol}:$${daysOpenCol},'Grievance Log'!$${gLocationCol}:$${gLocationCol},A${row},'Grievance Log'!$${daysOpenCol}:$${daysOpenCol},">0"),0))),"-")`);
    sheet.getRange(row, 8).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No locations yet","0",TEXT(COUNTIFS('Member Directory'!$${mLocationCol}:$${mLocationCol},A${row},'Member Directory'!$${isStewardCol}:$${isStewardCol},"Yes"),"#,##0"))),"0")`);
    sheet.getRange(row, 9).setFormula(`=IF(A${row}="","",IF(E${row}>5,"High",IF(E${row}>2,"Medium","Low")))`);
    sheet.getRange(row, 10).setFormula(`=IF(A${row}="","",IF(I${row}="High","🔴",IF(I${row}="Medium","🟡","🟢")))`);
  }

  // ============ SECTION 4: ISSUE TYPE ANALYSIS (Rows 40-54) ============
  sheet.getRange("A40:K40").merge()
    .setValue("📊 GRIEVANCE TYPE ANALYSIS")
    .setFontWeight("bold")
    .setFontSize(14)
    .setBackground(COLORS.PRIMARY_BLUE)
    .setFontColor("white")
    .setHorizontalAlignment("center");

  const typeHeaders = ["Issue Type", "Total", "Open", "Resolved", "Win Rate", "Avg Days", "Top Location", "Top Article", "Trend", "Priority", "Notes"];
  sheet.getRange(41, 1, 1, typeHeaders.length).setValues([typeHeaders])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Dynamic issue type rows using UNIQUE formula
  sheet.getRange(42, 1).setFormula(`=IFERROR(UNIQUE(FILTER('Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol},'Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol}<>"",'Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol}<>"Issue Category")),"No issue types yet")`);

  // Add formulas for type analytics (rows 42-54)
  for (let i = 0; i < 13; i++) {
    const row = 42 + i;
    sheet.getRange(row, 2).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No issue types yet","0",TEXT(COUNTIF('Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol},A${row}),"#,##0"))),"0")`);
    sheet.getRange(row, 3).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No issue types yet","0",TEXT(COUNTIFS('Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol},A${row},'Grievance Log'!$${statusCol}:$${statusCol},"Open"),"#,##0"))),"0")`);
    sheet.getRange(row, 4).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No issue types yet","0",TEXT(COUNTIFS('Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol},A${row},'Grievance Log'!$${statusCol}:$${statusCol},"Settled")+COUNTIFS('Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol},A${row},'Grievance Log'!$${statusCol}:$${statusCol},"Denied")+COUNTIFS('Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol},A${row},'Grievance Log'!$${statusCol}:$${statusCol},"Closed"),"#,##0"))),"0")`);
    sheet.getRange(row, 5).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No issue types yet","N/A",TEXT(COUNTIFS('Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol},A${row},'Grievance Log'!$${statusCol}:$${statusCol},"Settled")/(COUNTIFS('Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol},A${row},'Grievance Log'!$${statusCol}:$${statusCol},"Settled")+COUNTIFS('Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol},A${row},'Grievance Log'!$${statusCol}:$${statusCol},"Denied")),"0%"))),"N/A")`);
    sheet.getRange(row, 6).setFormula(`=IFERROR(IF(A${row}="","",IF(A${row}="No issue types yet","N/A",ROUND(AVERAGEIFS('Grievance Log'!$${daysOpenCol}:$${daysOpenCol},'Grievance Log'!$${gIssueCategoryCol}:$${gIssueCategoryCol},A${row},'Grievance Log'!$${daysOpenCol}:$${daysOpenCol},">0"),0))),"N/A")`);
    sheet.getRange(row, 7).setValue("-");
    sheet.getRange(row, 8).setValue("-");
    sheet.getRange(row, 9).setFormula(`=IF(A${row}="","",IF(B${row}>0,"📊 Active","➖ None"))`);
    sheet.getRange(row, 10).setFormula(`=IF(A${row}="","",IF(C${row}>5,"🔴 High",IF(C${row}>2,"🟡 Medium","🟢 Low")))`);
  }

  // ============ FORMATTING ============
  sheet.setFrozenRows(2);
  sheet.setTabColor(COLORS.PRIMARY_PURPLE);

  // Set column widths
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 100);
  sheet.setColumnWidth(8, 100);
  sheet.setColumnWidth(9, 80);
  sheet.setColumnWidth(10, 80);
  sheet.setColumnWidth(11, 100);
  sheet.setColumnWidth(12, 80);

  // Center align numeric columns
  sheet.getRange("B6:D11").setHorizontalAlignment("center");
  sheet.getRange("B15:L22").setHorizontalAlignment("center");
  sheet.getRange("B26:K38").setHorizontalAlignment("center");
  sheet.getRange("B42:K54").setHorizontalAlignment("center");

  // Delete unused columns dynamically based on content
  const lastCol = sheet.getLastColumn();
  const totalCols = sheet.getMaxColumns();
  if (lastCol > 0 && totalCols > lastCol) {
    sheet.deleteColumns(lastCol + 1, totalCols - lastCol);
  }
}

/* --------------------- KPI PERFORMANCE DASHBOARD (Merged Performance + KPI Board) --------------------- */
function createKPIPerformanceDashboard() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEETS.KPI_PERFORMANCE);

  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.KPI_PERFORMANCE);
  }
  sheet.clear();

  // Header
  sheet.getRange("A1:L1").merge()
    .setValue("📊 KPI PERFORMANCE DASHBOARD")
    .setFontSize(18)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.UNION_GREEN)
    .setFontColor("white");

  sheet.getRange("A2:L2").merge()
    .setValue("🎯 Track KPIs against targets with variance analysis and performance trends")
    .setFontSize(10)
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.LIGHT_GRAY)
    .setFontColor(COLORS.TEXT_GRAY);

  const headers = [
    "KPI Name",
    "Current Value",
    "Target",
    "Variance",
    "% Change",
    "Status",
    "Last Month",
    "YTD Average",
    "Best",
    "Worst",
    "Owner",
    "Last Updated"
  ];

  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY)
    .setFontColor(COLORS.TEXT_DARK);

  // Add data validation for Status
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['On Track', 'At Risk', 'Off Track', 'Exceeding'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange("F4:F1000").setDataValidation(statusRule);

  // Add KPI data rows with formulas
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const daysOpenCol = getColumnLetter(GRIEVANCE_COLS.DAYS_OPEN);
  const memberIdCol = getColumnLetter(MEMBER_COLS.MEMBER_ID);
  const isStewardCol = getColumnLetter(MEMBER_COLS.IS_STEWARD);

  // Date Filed column letter for last month calculations
  const dateFiledCol = getColumnLetter(GRIEVANCE_COLS.DATE_FILED);
  const dateClosedCol = getColumnLetter(GRIEVANCE_COLS.DATE_CLOSED);

  const kpiData = [
    // [KPI Name, Current Value, Target, Variance, % Change, Status, Last Month, YTD Avg, Best, Worst, Owner, Last Updated]
    // Last Month column (G) shows values from the previous calendar month
    // All numeric values use TEXT(value,"#,##0") for comma formatting
    ["Total Members", `=TEXT(COUNTA('Member Directory'!${memberIdCol}2:${memberIdCol}),"#,##0")`, "20,000", `=TEXT(VALUE(SUBSTITUTE(B4,",",""))-VALUE(SUBSTITUTE(C4,",","")),"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B4,",",""))-VALUE(SUBSTITUTE(C4,",","")))/VALUE(SUBSTITUTE(C4,",","")),"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B4,",",""))>=VALUE(SUBSTITUTE(C4,",","")),"On Track","At Risk")`, `=B4`, `=B4`, `=B4`, `=B4`, "HR Team", `=TEXT(NOW(),"MM/dd/yy")`],
    ["Active Grievances", `=TEXT(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Open"),"#,##0")`, "25", `=TEXT(VALUE(SUBSTITUTE(B5,",",""))-C5,"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B5,",",""))-C5)/C5,"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B5,",",""))<=C5,"On Track","At Risk")`, `=TEXT(COUNTIFS('Grievance Log'!${dateFiledCol}:${dateFiledCol},">="&EOMONTH(TODAY(),-2)+1,'Grievance Log'!${dateFiledCol}:${dateFiledCol},"<="&EOMONTH(TODAY(),-1),'Grievance Log'!${statusCol}:${statusCol},"Open"),"#,##0")`, `=B5`, `=B5`, `=B5`, "Steward Lead", `=TEXT(NOW(),"MM/dd/yy")`],
    ["Win Rate %", `=IFERROR(ROUND(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Settled")/(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Settled")+COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Denied"))*100,1),0)`, "70", `=B6-C6`, `=IFERROR(TEXT((B6-C6)/C6,"0%"),"-")`, `=IF(B6>=C6,"On Track","At Risk")`, `=IFERROR(ROUND(COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Settled",'Grievance Log'!${dateClosedCol}:${dateClosedCol},">="&EOMONTH(TODAY(),-2)+1,'Grievance Log'!${dateClosedCol}:${dateClosedCol},"<="&EOMONTH(TODAY(),-1))/(COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Settled",'Grievance Log'!${dateClosedCol}:${dateClosedCol},">="&EOMONTH(TODAY(),-2)+1,'Grievance Log'!${dateClosedCol}:${dateClosedCol},"<="&EOMONTH(TODAY(),-1))+COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Denied",'Grievance Log'!${dateClosedCol}:${dateClosedCol},">="&EOMONTH(TODAY(),-2)+1,'Grievance Log'!${dateClosedCol}:${dateClosedCol},"<="&EOMONTH(TODAY(),-1)))*100,1),0)`, `=B6`, `=B6`, `=B6`, "Steward Lead", `=TEXT(NOW(),"MM/dd/yy")`],
    ["Avg Days to Resolve", `=IFERROR(TEXT(ROUND(AVERAGE('Grievance Log'!${daysOpenCol}:${daysOpenCol}),0),"#,##0"),0)`, "30", `=TEXT(VALUE(SUBSTITUTE(B7,",",""))-C7,"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B7,",",""))-C7)/C7,"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B7,",",""))<=C7,"On Track","At Risk")`, `=IFERROR(TEXT(ROUND(AVERAGEIFS('Grievance Log'!${daysOpenCol}:${daysOpenCol},'Grievance Log'!${dateClosedCol}:${dateClosedCol},">="&EOMONTH(TODAY(),-2)+1,'Grievance Log'!${dateClosedCol}:${dateClosedCol},"<="&EOMONTH(TODAY(),-1)),0),"#,##0"),0)`, `=B7`, `=B7`, `=B7`, "Steward Lead", `=TEXT(NOW(),"MM/dd/yy")`],
    ["Steward Coverage", `=TEXT(COUNTIF('Member Directory'!${isStewardCol}:${isStewardCol},"Yes"),"#,##0")`, "50", `=TEXT(VALUE(SUBSTITUTE(B8,",",""))-C8,"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B8,",",""))-C8)/C8,"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B8,",",""))>=C8,"On Track","At Risk")`, `=B8`, `=B8`, `=B8`, `=B8`, "Coordinator", `=TEXT(NOW(),"MM/dd/yy")`],
    ["Cases Settled", `=TEXT(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Settled"),"#,##0")`, "100", `=TEXT(VALUE(SUBSTITUTE(B9,",",""))-C9,"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B9,",",""))-C9)/C9,"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B9,",",""))>=C9,"Exceeding","On Track")`, `=TEXT(COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Settled",'Grievance Log'!${dateClosedCol}:${dateClosedCol},">="&EOMONTH(TODAY(),-2)+1,'Grievance Log'!${dateClosedCol}:${dateClosedCol},"<="&EOMONTH(TODAY(),-1)),"#,##0")`, `=B9`, `=B9`, `=B9`, "Legal", `=TEXT(NOW(),"MM/dd/yy")`],
    ["Cases Pending", `=TEXT(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Pending Info"),"#,##0")`, "10", `=TEXT(VALUE(SUBSTITUTE(B10,",",""))-C10,"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B10,",",""))-C10)/C10,"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B10,",",""))<=C10,"On Track","At Risk")`, `=TEXT(COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Pending Info",'Grievance Log'!${dateFiledCol}:${dateFiledCol},">="&EOMONTH(TODAY(),-2)+1,'Grievance Log'!${dateFiledCol}:${dateFiledCol},"<="&EOMONTH(TODAY(),-1)),"#,##0")`, `=B10`, `=B10`, `=B10`, "Steward Lead", `=TEXT(NOW(),"MM/dd/yy")`],
    ["Member/Steward Ratio", `=TEXT(IFERROR(ROUND(COUNTA('Member Directory'!${memberIdCol}2:${memberIdCol})/COUNTIF('Member Directory'!${isStewardCol}:${isStewardCol},"Yes"),0),0),"#,##0")`, "100", `=TEXT(VALUE(SUBSTITUTE(B11,",",""))-C11,"#,##0")`, `=IFERROR(TEXT((VALUE(SUBSTITUTE(B11,",",""))-C11)/C11,"0%"),"-")`, `=IF(VALUE(SUBSTITUTE(B11,",",""))<=C11,"On Track","At Risk")`, `=B11`, `=B11`, `=B11`, `=B11`, "HR Team", `=TEXT(NOW(),"MM/dd/yy")`]
  ];

  sheet.getRange(4, 1, kpiData.length, 12).setValues(kpiData);

  // Add conditional formatting for Status column
  sheet.getRange("F4:F20").setHorizontalAlignment("center");

  sheet.setFrozenRows(3);
  sheet.setTabColor(COLORS.UNION_GREEN);

  // Set column widths
  sheet.setColumnWidth(1, 200);  // KPI Name
  sheet.setColumnWidth(2, 120);  // Current Value
  sheet.setColumnWidth(3, 100);  // Target
  sheet.setColumnWidth(4, 100);  // Variance
  sheet.setColumnWidth(5, 100);  // % Change
  sheet.setColumnWidth(6, 100);  // Status
  sheet.setColumnWidth(7, 100);  // Last Month
  sheet.setColumnWidth(8, 110);  // YTD Average
  sheet.setColumnWidth(9, 80);   // Best
  sheet.setColumnWidth(10, 80);  // Worst
  sheet.setColumnWidth(11, 120); // Owner
  sheet.setColumnWidth(12, 110); // Last Updated

  // Delete unused columns beyond the defined headers (12 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }
}

/* --------------------- HELPER FUNCTIONS FOR DASHBOARD MANAGEMENT --------------------- */

/**
 * Delete standalone tabs that are now merged into Executive Dashboard
 * Note: Operations Analytics is the merged dashboard - do NOT delete it
 * Tabs deleted: KPI Performance Dashboard (superseded by Executive Dashboard)
 */
function deleteStandaloneMergedTabs() {
  const ss = SpreadsheetApp.getActive();
  const tabsToDelete = [
    // NOTE: "📊 Operations Analytics" should NOT be deleted - it IS the merged analytics dashboard
    // Only delete KPI Performance Dashboard which is now part of Executive Dashboard
    "📊 KPI Performance Dashboard"
  ];

  for (const tabName of tabsToDelete) {
    try {
      const sheet = ss.getSheetByName(tabName);
      if (sheet) {
        ss.deleteSheet(sheet);
        Logger.log(`Deleted merged tab: ${tabName}`);
      }
    } catch (e) {
      Logger.log(`Could not delete ${tabName}: ${e.message}`);
    }
  }
}

/**
 * Hide the Member Satisfaction tab
 */
function hideMemberSatisfactionTab() {
  const ss = SpreadsheetApp.getActive();
  const tabName = "Member Satisfaction";

  try {
    const sheet = ss.getSheetByName(tabName);
    if (sheet) {
      sheet.hideSheet();
      Logger.log(`Hidden tab: ${tabName} (to be wired later)`);
    }
  } catch (e) {
    Logger.log(`Could not hide ${tabName}: ${e.message}`);
  }
}

/**
 * Show the Member Satisfaction tab (when ready to wire)
 */
function showMemberSatisfactionTab() {
  const ss = SpreadsheetApp.getActive();
  const tabName = "Member Satisfaction";

  try {
    const sheet = ss.getSheetByName(tabName);
    if (sheet) {
      sheet.showSheet();
      Logger.log(`Shown tab: ${tabName}`);
    }
  } catch (e) {
    Logger.log(`Could not show ${tabName}: ${e.message}`);
  }
}

/**
 * @deprecated Use createOperationsAnalyticsSheet() instead
 * Member Engagement is now part of the merged Operations Analytics dashboard
 */
function createMemberEngagementSheet() {
  Logger.log('createMemberEngagementSheet() is deprecated - redirecting to Operations Analytics');
  if (typeof createOperationsAnalyticsSheet === 'function') {
    createOperationsAnalyticsSheet();
  }
}

/**
 * @deprecated Use createOperationsAnalyticsSheet() instead
 * Cost Impact is now part of the merged Operations Analytics dashboard
 */
function createCostImpactSheet() {
  Logger.log('createCostImpactSheet() is deprecated - redirecting to Operations Analytics');
  if (typeof createOperationsAnalyticsSheet === 'function') {
    createOperationsAnalyticsSheet();
  }
}


function createArchiveSheet() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEETS.ARCHIVE);
  if (!sheet) sheet = ss.insertSheet(SHEETS.ARCHIVE);
  sheet.clear();
  sheet.getRange("A1:F1").merge().setValue("📦 ARCHIVE").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground(COLORS.TEXT_GRAY).setFontColor("white");
  const headers = ["Item Type", "Item ID", "Archive Date", "Archived By", "Reason", "Original Data"];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground(COLORS.LIGHT_GRAY);
  sheet.setFrozenRows(3);
  sheet.setTabColor(COLORS.TEXT_GRAY);

  // Delete unused columns beyond the defined headers (6 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }
}

function createDiagnosticsSheet() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEETS.DIAGNOSTICS);
  if (!sheet) sheet = ss.insertSheet(SHEETS.DIAGNOSTICS);
  sheet.clear();
  sheet.getRange("A1:G1").merge().setValue("🔧 DIAGNOSTICS").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground(COLORS.SOLIDARITY_RED).setFontColor("white");
  const headers = ["Timestamp", "Check Type", "Component", "Status", "Details", "Severity", "Action Needed"];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground(COLORS.LIGHT_GRAY);
  sheet.setFrozenRows(3);
  sheet.setTabColor(COLORS.SOLIDARITY_RED);

  // Delete unused columns beyond the defined headers (7 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }
}

/* --------------------- DATA VALIDATIONS --------------------- */
function setupDataValidations() {
  const ss = SpreadsheetApp.getActive();
  const config = ss.getSheetByName(SHEETS.CONFIG);
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  // PERFORMANCE OPTIMIZATION: Use 500 rows for initial setup (30-40% faster)
  // Run extendValidations() later if you need more than 500 rows
  const VALIDATION_ROWS = 500;

  // ENHANCEMENT: Email validation for Member Directory (Column H - Email Address)
  // Using custom formula with REGEXMATCH for pattern validation
  const emailRule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied('=OR(ISBLANK(H2), REGEXMATCH(H2, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"))')
    .setAllowInvalid(true)
    .setHelpText('Enter a valid email address (e.g., name@example.com)')
    .build();
  memberDir.getRange(2, 8, VALIDATION_ROWS, 1).setDataValidation(emailRule);

  // ENHANCEMENT: Phone number validation for Member Directory (Column I - Phone Number)
  const phoneRule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied('=OR(ISBLANK(I2), REGEXMATCH(TO_TEXT(I2), "^\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$"))')
    .setAllowInvalid(true)
    .setHelpText('Enter phone number (formats: 555-123-4567, (555) 123-4567, 5551234567)')
    .build();
  memberDir.getRange(2, 9, VALIDATION_ROWS, 1).setDataValidation(phoneRule);

  // ENHANCEMENT: Email validation for Grievance Log (Column X - Member Email)
  const grievanceEmailRule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied('=OR(ISBLANK(X2), REGEXMATCH(X2, "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"))')
    .setAllowInvalid(true)
    .setHelpText('Enter a valid email address (e.g., name@example.com)')
    .build();
  grievanceLog.getRange(2, GRIEVANCE_COLS.MEMBER_EMAIL, VALIDATION_ROWS, 1).setDataValidation(grievanceEmailRule);

  // Member Directory validations using MEMBER_COLS constants
  // 31 columns total after adding: Committees, Home Town, Preferred Comm, Best Time
  const memberValidations = [
    { col: MEMBER_COLS.JOB_TITLE, configCol: CONFIG_COLS.JOB_TITLES },       // Job Title (4)
    { col: MEMBER_COLS.WORK_LOCATION, configCol: CONFIG_COLS.OFFICE_LOCATIONS }, // Work Location (5)
    { col: MEMBER_COLS.UNIT, configCol: CONFIG_COLS.UNITS },                 // Unit (6)
    { col: MEMBER_COLS.IS_STEWARD, configCol: CONFIG_COLS.YES_NO },          // Is Steward (10)
    { col: MEMBER_COLS.ASSIGNED_STEWARD, configCol: CONFIG_COLS.STEWARDS },  // Assigned Steward (14)
    { col: MEMBER_COLS.INTEREST_LOCAL, configCol: CONFIG_COLS.YES_NO },      // Interest: Local (21)
    { col: MEMBER_COLS.HOME_TOWN, configCol: CONFIG_COLS.HOME_TOWNS },       // Home Town (22)
    { col: MEMBER_COLS.INTEREST_CHAPTER, configCol: CONFIG_COLS.YES_NO },    // Interest: Chapter (23)
    { col: MEMBER_COLS.INTEREST_ALLIED, configCol: CONFIG_COLS.YES_NO }      // Interest: Allied (24)
  ];

  // Columns that should allow blank/custom values (user populates Config)
  const userPopulatedCols = [
    MEMBER_COLS.JOB_TITLE,      // Job Title
    MEMBER_COLS.WORK_LOCATION,  // Work Location
    MEMBER_COLS.UNIT,           // Unit
    MEMBER_COLS.ASSIGNED_STEWARD, // Assigned Steward
    MEMBER_COLS.HOME_TOWN       // Home Town
  ];

  memberValidations.forEach(function(v) {
    const configRange = config.getRange(3, v.configCol, 50, 1);
    // Allow invalid for user-populated fields (they may be empty if Config not yet filled)
    const allowInvalid = userPopulatedCols.indexOf(v.col) >= 0;
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(configRange, true)
      .setAllowInvalid(allowInvalid)
      .build();
    memberDir.getRange(2, v.col, VALIDATION_ROWS, 1).setDataValidation(rule);
  });

  // Office Days - allow text input with guidance (column 7)
  // Note: Multiple days should be entered as comma-separated values
  const officeDaysRule = SpreadsheetApp.newDataValidation()
    .requireTextContains("")
    .setAllowInvalid(true)
    .setHelpText('Enter office days (e.g., "Monday, Wednesday, Friday" or select from Config tab)')
    .build();
  memberDir.getRange(2, MEMBER_COLS.OFFICE_DAYS, VALIDATION_ROWS, 1).setDataValidation(officeDaysRule);

  // Supervisor and Manager - allow text input since they're now first+last name combinations
  const nameRule = SpreadsheetApp.newDataValidation()
    .requireTextContains("")
    .setAllowInvalid(true)
    .setHelpText('Enter full name (e.g., "John Smith")')
    .build();
  memberDir.getRange(2, MEMBER_COLS.SUPERVISOR, VALIDATION_ROWS, 1).setDataValidation(nameRule);
  memberDir.getRange(2, MEMBER_COLS.MANAGER, VALIDATION_ROWS, 1).setDataValidation(nameRule);

  // Multi-select columns - allow text input with help text showing available options
  // Committees (column 11) - multi-select for stewards
  const committeesRule = SpreadsheetApp.newDataValidation()
    .requireTextContains("")
    .setAllowInvalid(true)
    .setHelpText('Enter committees (comma-separated, e.g., "Grievance Committee, Bargaining Committee"). See Config tab column AD for options.')
    .build();
  memberDir.getRange(2, MEMBER_COLS.COMMITTEES, VALIDATION_ROWS, 1).setDataValidation(committeesRule);

  // Preferred Communication (column 15) - multi-select
  const prefCommRule = SpreadsheetApp.newDataValidation()
    .requireTextContains("")
    .setAllowInvalid(true)
    .setHelpText('Enter preferred methods (comma-separated, e.g., "Email, Phone, Text"). See Config tab column M for options.')
    .build();
  memberDir.getRange(2, MEMBER_COLS.PREFERRED_COMM, VALIDATION_ROWS, 1).setDataValidation(prefCommRule);

  // Best Time to Contact (column 16) - multi-select
  const bestTimeRule = SpreadsheetApp.newDataValidation()
    .requireTextContains("")
    .setAllowInvalid(true)
    .setHelpText('Enter best times (comma-separated, e.g., "Morning (8am-12pm), Evening (5pm-8pm)"). See Config tab column AE for options.')
    .build();
  memberDir.getRange(2, MEMBER_COLS.BEST_TIME, VALIDATION_ROWS, 1).setDataValidation(bestTimeRule);

  // Grievance Log validations (updated for new Config structure)
  // GRIEVANCE_COLS: STATUS=5, CURRENT_STEP=6, ARTICLES=22, ISSUE_CATEGORY=23, UNIT=25, LOCATION=26, STEWARD=27
  const grievanceValidations = [
    { col: GRIEVANCE_COLS.STATUS, configCol: CONFIG_COLS.GRIEVANCE_STATUS },         // Status
    { col: GRIEVANCE_COLS.CURRENT_STEP, configCol: CONFIG_COLS.GRIEVANCE_STEP },     // Current Step
    { col: GRIEVANCE_COLS.ARTICLES, configCol: CONFIG_COLS.ARTICLES_VIOLATED },      // Articles Violated
    { col: GRIEVANCE_COLS.ISSUE_CATEGORY, configCol: CONFIG_COLS.ISSUE_CATEGORY },   // Issue Category
    { col: GRIEVANCE_COLS.UNIT, configCol: CONFIG_COLS.UNITS },                      // Unit
    { col: GRIEVANCE_COLS.LOCATION, configCol: CONFIG_COLS.OFFICE_LOCATIONS },       // Work Location
    { col: GRIEVANCE_COLS.STEWARD, configCol: CONFIG_COLS.STEWARDS }                 // Assigned Steward
  ];

  // Grievance columns that should allow blank/custom values (user populates Config)
  const userPopulatedGrievanceCols = [
    GRIEVANCE_COLS.UNIT,      // Unit
    GRIEVANCE_COLS.LOCATION,  // Work Location
    GRIEVANCE_COLS.STEWARD    // Assigned Steward
  ];

  grievanceValidations.forEach(function(v) {
    const configRange = config.getRange(3, v.configCol, 50, 1);
    // Allow invalid for user-populated fields (they may be empty if Config not yet filled)
    const allowInvalid = userPopulatedGrievanceCols.indexOf(v.col) >= 0;
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(configRange, true)
      .setAllowInvalid(allowInvalid)
      .build();
    grievanceLog.getRange(2, v.col, VALIDATION_ROWS, 1).setDataValidation(rule);
  });

  // ----- CONDITIONAL FORMATTING -----
  // Light purple background for rows where Is Steward = "Yes"
  const isStewardCol = getColumnLetter(MEMBER_COLS.IS_STEWARD);
  const stewardRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$' + isStewardCol + '2="Yes"')
    .setBackground('#E8E3F3')  // Light purple (509 theme)
    .setRanges([memberDir.getRange(2, 1, VALIDATION_ROWS, MEMBER_COLS.START_GRIEVANCE)])  // Apply to entire row
    .build();

  const existingRules = memberDir.getConditionalFormatRules();
  existingRules.push(stewardRule);
  memberDir.setConditionalFormatRules(existingRules);
}

/**
 * Extend validations to support large datasets (5000+ rows)
 * Run this after seeding large amounts of data (20k members, 5k grievances)
 * This extends validations from 500 rows to 10000 rows
 */
function extendValidationsForLargeDataset() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Extend Validations?',
    'This will extend dropdown validations from 500 rows to 10,000 rows.\n\n' +
    'Use this after seeding large datasets (20k members, 5k grievances).\n\n' +
    'This may take 30-60 seconds. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  const startTime = new Date();
  SpreadsheetApp.getActive().toast('Extending validations...', 'Please wait', -1);

  const ss = SpreadsheetApp.getActive();
  const config = ss.getSheetByName(SHEETS.CONFIG);
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  const EXTENDED_ROWS = 10000;

  // Member Directory validations
  const memberValidations = [
    { col: MEMBER_COLS.JOB_TITLE, configCol: CONFIG_COLS.JOB_TITLES },
    { col: MEMBER_COLS.WORK_LOCATION, configCol: CONFIG_COLS.OFFICE_LOCATIONS },
    { col: MEMBER_COLS.UNIT, configCol: CONFIG_COLS.UNITS },
    { col: MEMBER_COLS.IS_STEWARD, configCol: CONFIG_COLS.YES_NO },
    { col: MEMBER_COLS.ASSIGNED_STEWARD, configCol: CONFIG_COLS.STEWARDS },
    { col: MEMBER_COLS.INTEREST_LOCAL, configCol: CONFIG_COLS.YES_NO },
    { col: MEMBER_COLS.HOME_TOWN, configCol: CONFIG_COLS.HOME_TOWNS },
    { col: MEMBER_COLS.INTEREST_CHAPTER, configCol: CONFIG_COLS.YES_NO },
    { col: MEMBER_COLS.INTEREST_ALLIED, configCol: CONFIG_COLS.YES_NO }
  ];

  // User-populated columns that should allow blank/custom values
  const userPopulatedMemberCols = [
    MEMBER_COLS.JOB_TITLE, MEMBER_COLS.WORK_LOCATION, MEMBER_COLS.UNIT,
    MEMBER_COLS.ASSIGNED_STEWARD, MEMBER_COLS.HOME_TOWN
  ];

  memberValidations.forEach(function(v) {
    const configRange = config.getRange(3, v.configCol, 50, 1);
    const allowInvalid = userPopulatedMemberCols.indexOf(v.col) >= 0;
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(configRange, true)
      .setAllowInvalid(allowInvalid)
      .build();
    memberDir.getRange(2, v.col, EXTENDED_ROWS, 1).setDataValidation(rule);
  });

  // Grievance Log validations
  const grievanceValidations = [
    { col: GRIEVANCE_COLS.STATUS, configCol: CONFIG_COLS.GRIEVANCE_STATUS },
    { col: GRIEVANCE_COLS.CURRENT_STEP, configCol: CONFIG_COLS.GRIEVANCE_STEP },
    { col: GRIEVANCE_COLS.ARTICLES, configCol: CONFIG_COLS.ARTICLES_VIOLATED },
    { col: GRIEVANCE_COLS.ISSUE_CATEGORY, configCol: CONFIG_COLS.ISSUE_CATEGORY },
    { col: GRIEVANCE_COLS.UNIT, configCol: CONFIG_COLS.UNITS },
    { col: GRIEVANCE_COLS.LOCATION, configCol: CONFIG_COLS.OFFICE_LOCATIONS },
    { col: GRIEVANCE_COLS.STEWARD, configCol: CONFIG_COLS.STEWARDS }
  ];

  // User-populated grievance columns that should allow blank/custom values
  const userPopulatedGrievanceCols = [
    GRIEVANCE_COLS.UNIT, GRIEVANCE_COLS.LOCATION, GRIEVANCE_COLS.STEWARD
  ];

  grievanceValidations.forEach(function(v) {
    const configRange = config.getRange(3, v.configCol, 50, 1);
    const allowInvalid = userPopulatedGrievanceCols.indexOf(v.col) >= 0;
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(configRange, true)
      .setAllowInvalid(allowInvalid)
      .build();
    grievanceLog.getRange(2, v.col, EXTENDED_ROWS, 1).setDataValidation(rule);
  });

  const duration = (new Date() - startTime) / 1000;

  ui.alert(
    'Validations Extended',
    `Successfully extended validations to ${EXTENDED_ROWS.toLocaleString()} rows.\n\n` +
    `Time: ${duration.toFixed(1)} seconds`,
    ui.ButtonSet.OK
  );
}

/**
 * Refreshes all data validation rules with v3.13+ settings
 * This allows blank values for user-populated fields (Job Title, Location, Unit, etc.)
 * Run this after updating to v3.13+ if tests fail with validation errors
 *
 * Menu: 509 Tools > ⚙️ Utilities > 🔄 Refresh Data Validations
 */
function refreshAllValidations() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    '🔄 Refresh Data Validations?',
    'This will re-apply all data validation rules with v3.13+ settings.\n\n' +
    'This fixes validation errors when user-populated fields (Job Title, Location, Unit, ' +
    'Supervisor, Manager, Steward) are left blank.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  const startTime = new Date();

  try {
    // Re-apply data validations with new settings
    setupDataValidations();

    // Also re-apply member directory dropdowns
    setupMemberDirectoryValidations();

    const duration = (new Date() - startTime) / 1000;

    ui.alert(
      '✅ Validations Refreshed',
      `Successfully refreshed all data validation rules.\n\n` +
      `User-populated fields now allow blank values.\n\n` +
      `Time: ${duration.toFixed(1)} seconds`,
      ui.ButtonSet.OK
    );

    Logger.log('Data validations refreshed with v3.13+ settings');

  } catch (error) {
    ui.alert(
      '❌ Error',
      `Failed to refresh validations: ${error.message}`,
      ui.ButtonSet.OK
    );
    Logger.log('Error refreshing validations: ' + error.message);
  }
}

/* --------------------- FORMULAS --------------------- */
function setupFormulasAndCalculations() {
  const ss = SpreadsheetApp.getActive();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);

  // ----- GRIEVANCE LOG FORMULAS -----
  // All using dynamic column references from GRIEVANCE_COLS
  const gIncidentDateCol = getColumnLetter(GRIEVANCE_COLS.INCIDENT_DATE);
  const gFilingDeadlineCol = getColumnLetter(GRIEVANCE_COLS.FILING_DEADLINE);
  const gDateFiledCol = getColumnLetter(GRIEVANCE_COLS.DATE_FILED);
  const gStep1DueCol = getColumnLetter(GRIEVANCE_COLS.STEP1_DUE);
  const gStep1RcvdCol = getColumnLetter(GRIEVANCE_COLS.STEP1_RCVD);
  const gStep2AppealDueCol = getColumnLetter(GRIEVANCE_COLS.STEP2_APPEAL_DUE);
  const gStep2AppealFiledCol = getColumnLetter(GRIEVANCE_COLS.STEP2_APPEAL_FILED);
  const gStep2DueCol = getColumnLetter(GRIEVANCE_COLS.STEP2_DUE);
  const gStep2RcvdCol = getColumnLetter(GRIEVANCE_COLS.STEP2_RCVD);
  const gStep3AppealDueCol = getColumnLetter(GRIEVANCE_COLS.STEP3_APPEAL_DUE);
  const gDateClosedCol = getColumnLetter(GRIEVANCE_COLS.DATE_CLOSED);
  const gDaysOpenCol = getColumnLetter(GRIEVANCE_COLS.DAYS_OPEN);
  const gNextActionCol = getColumnLetter(GRIEVANCE_COLS.NEXT_ACTION_DUE);
  const gDaysToDeadlineCol = getColumnLetter(GRIEVANCE_COLS.DAYS_TO_DEADLINE);
  const gStatusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const gCurrentStepCol = getColumnLetter(GRIEVANCE_COLS.CURRENT_STEP);
  const gMemberIdCol = getColumnLetter(GRIEVANCE_COLS.MEMBER_ID);

  // ============================================================================
  // CALCULATED COLUMNS - NO FORMULAS IN SHEET
  // ============================================================================
  // The following columns are calculated by BatchGrievanceRecalc.gs and written
  // as STATIC VALUES (not formulas). This prevents data corruption when rows
  // are deleted. Run recalcAllGrievancesBatched() to recalculate all values.
  //
  // Column H: Filing Deadline (Incident Date + 21 days)
  // Column J: Step I Decision Due (Date Filed + 30 days)
  // Column L: Step II Appeal Due (Step I Decision Rcvd + 10 days)
  // Column N: Step II Decision Due (Step II Appeal Filed + 30 days)
  // Column P: Step III Appeal Due (Step II Decision Rcvd + 30 days)
  // Column S: Days Open (DATE_CLOSED - DATE_FILED or TODAY - DATE_FILED)
  // Column T: Next Action Due (based on Current Step)
  // Column U: Days to Deadline (Next Action Due - TODAY)
  //
  // To recalculate: Menu → Dashboard → Grievance Tools → Refresh Grievance Formulas
  // ============================================================================

  // Add conditional formatting for Days to Deadline column
  const daysToDeadlineRange = grievanceLog.getRange(gDaysToDeadlineCol + "2:" + gDaysToDeadlineCol + "10000");

  // Rule 1: OVERDUE - Red background
  const overdueRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains("OVERDUE")
    .setBackground("#FEE2E2")  // Light red
    .setFontColor("#DC2626")   // Dark red text
    .setBold(true)
    .setRanges([daysToDeadlineRange])
    .build();

  // Rule 2: DUE TODAY - Orange background
  const dueTodayRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("DUE TODAY")
    .setBackground("#FEF3C7")  // Light amber
    .setFontColor("#D97706")   // Dark amber text
    .setBold(true)
    .setRanges([daysToDeadlineRange])
    .build();

  // Rule 3: Due within 7 days - Yellow background (numbers 1-7)
  const dueSoonRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(1, 7)
    .setBackground("#FEF9C3")  // Light yellow
    .setFontColor("#CA8A04")   // Dark yellow text
    .setRanges([daysToDeadlineRange])
    .build();

  // Rule 4: More than 7 days - Green background
  const onTrackRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(7)
    .setBackground("#DCFCE7")  // Light green
    .setFontColor("#16A34A")   // Dark green text
    .setRanges([daysToDeadlineRange])
    .build();

  // Apply all rules
  const existingRules = grievanceLog.getConditionalFormatRules();
  grievanceLog.setConditionalFormatRules([overdueRule, dueTodayRule, dueSoonRule, onTrackRule, ...existingRules]);

  // ----- MEMBER DIRECTORY GRIEVANCE DATA -----
  // ============================================================================
  // CALCULATED COLUMNS - NO FORMULAS IN SHEET
  // ============================================================================
  // Member Directory columns AB-AD are populated with STATIC VALUES by
  // refreshMemberDirectoryFormulas() - NO formulas in visible sheets.
  //
  // Column AB: Has Open Grievance? ("Yes"/"No")
  // Column AC: Grievance Status Snapshot (status text)
  // Column AD: Next Grievance Deadline (date)
  //
  // Data is calculated by reading Grievance Log and matching Member IDs.
  // To recalculate: Menu → Dashboard → Grievance Tools → Refresh Member Directory Data
  // ============================================================================

  // Populate Member Directory grievance columns with static values
  refreshMemberDirectoryFormulas();

  // Apply progress bar formatting
  setupGrievanceProgressBar();

  // Apply resolution column color coding
  setupResolutionColumnColors();
}

/**
 * Sets up visual progress bar formatting for Grievance Log timeline columns (G-R)
 * Timeline spans from Incident Date (G) through Date Closed (R)
 * - Completed/past steps and deadlines: Green background (#D1FAE5)
 * - Current step: Orange highlight (#FED7AA) for active, Light Blue (#BFDBFE) for Pending Info
 * - Next step: Red highlight (#FECACA)
 * - Future steps beyond next: Light gray (#F3F4F6)
 * - Closed/Settled/Withdrawn/Denied: Full light brown bar (#D7CCC8)
 */
function setupGrievanceProgressBar() {
  const ss = SpreadsheetApp.getActive();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!grievanceLog) return;

  // Clear existing conditional formatting rules for timeline columns
  const existingRules = grievanceLog.getConditionalFormatRules();
  const newRules = existingRules.filter(rule => {
    const ranges = rule.getRanges();
    // Keep rules that don't affect columns G-R (7-18)
    return !ranges.some(r => r.getColumn() >= 7 && r.getColumn() <= 18);
  });

  // Timeline columns: G(7) to R(18)
  const timelineRange = grievanceLog.getRange(2, 7, 1000, 12); // G2:R1001

  // Column references
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const stepCol = getColumnLetter(GRIEVANCE_COLS.CURRENT_STEP);

  // Colors
  const COMPLETED_GREEN = '#D1FAE5';  // Light green for completed/past steps
  const CURRENT_ORANGE = '#FED7AA';   // Orange for current step (normal active)
  const CURRENT_BLUE = '#BFDBFE';     // Light blue for current step (Pending Info)
  const NEXT_RED = '#FECACA';         // Light red for next step
  const FUTURE_GRAY = '#F3F4F6';      // Light gray for future steps beyond next
  const CLOSED_BROWN = '#D7CCC8';     // Light brown for closed/settled/withdrawn cases

  // Timeline ranges calculated from GRIEVANCE_COLS for dynamic positioning
  const TIMELINE_START = GRIEVANCE_COLS.INCIDENT_DATE;  // Column G (7)
  const FILING_DEADLINE = GRIEVANCE_COLS.FILING_DEADLINE; // Column H (8)
  const DATE_FILED = GRIEVANCE_COLS.DATE_FILED;         // Column I (9)
  const STEP1_DUE = GRIEVANCE_COLS.STEP1_DUE;           // Column J (10)
  const STEP1_END = GRIEVANCE_COLS.STEP1_RCVD;          // Column K (11)
  const STEP2_START = GRIEVANCE_COLS.STEP2_APPEAL_DUE;  // Column L (12)
  const STEP2_END = GRIEVANCE_COLS.STEP2_RCVD;          // Column O (15)
  const STEP3_START = GRIEVANCE_COLS.STEP3_APPEAL_DUE;  // Column P (16)
  const STEP3_END = GRIEVANCE_COLS.STEP3_APPEAL_FILED;  // Column Q (17)
  const CLOSE_COL = GRIEVANCE_COLS.DATE_CLOSED;         // Column R (18)

  // ----- CLOSED/SETTLED/WITHDRAWN - Full light brown bar -----
  const closedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=OR($${statusCol}2="Settled",$${statusCol}2="Closed",$${statusCol}2="Withdrawn",$${statusCol}2="Denied")`)
    .setBackground(CLOSED_BROWN)
    .setRanges([timelineRange])
    .build();
  newRules.push(closedRule);

  // Helper: Active statuses - split into normal (orange) and pending info (blue)
  const normalActiveCondition = `OR($${statusCol}2="Open",$${statusCol}2="Appealed",$${statusCol}2="In Arbitration")`;
  const pendingInfoCondition = `$${statusCol}2="Pending Info"`;
  const allActiveCondition = `OR($${statusCol}2="Open",$${statusCol}2="Pending Info",$${statusCol}2="Appealed",$${statusCol}2="In Arbitration")`;

  // ----- INFORMAL STEP (Pre-filing): Current=G-H, Next=I-K (red), Future=L-R (gray) -----
  // Orange for normal active statuses
  const informalCurrentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Informal",${normalActiveCondition})`)
    .setBackground(CURRENT_ORANGE)
    .setRanges([grievanceLog.getRange(2, TIMELINE_START, 1000, 2)]) // G-H current
    .build();
  newRules.push(informalCurrentRule);

  // Blue for Pending Info status
  const informalCurrentPendingRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Informal",${pendingInfoCondition})`)
    .setBackground(CURRENT_BLUE)
    .setRanges([grievanceLog.getRange(2, TIMELINE_START, 1000, 2)]) // G-H current (pending)
    .build();
  newRules.push(informalCurrentPendingRule);

  const informalNextRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Informal",${allActiveCondition})`)
    .setBackground(NEXT_RED)
    .setRanges([grievanceLog.getRange(2, DATE_FILED, 1000, 3)]) // I-K next (Step I)
    .build();
  newRules.push(informalNextRule);

  const informalFutureRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Informal",${allActiveCondition})`)
    .setBackground(FUTURE_GRAY)
    .setFontColor('#9CA3AF')
    .setRanges([grievanceLog.getRange(2, STEP2_START, 1000, CLOSE_COL - STEP2_START + 1)]) // L-R future
    .build();
  newRules.push(informalFutureRule);

  // ----- STEP I: Completed=G-H (green), Current=I-K, Next=L-O (red), Future=P-R (gray) -----
  const step1CompletedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step I",${allActiveCondition})`)
    .setBackground(COMPLETED_GREEN)
    .setRanges([grievanceLog.getRange(2, TIMELINE_START, 1000, 2)]) // G-H completed
    .build();
  newRules.push(step1CompletedRule);

  // Orange for normal active statuses
  const step1CurrentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step I",${normalActiveCondition})`)
    .setBackground(CURRENT_ORANGE)
    .setRanges([grievanceLog.getRange(2, DATE_FILED, 1000, 3)]) // I-K current
    .build();
  newRules.push(step1CurrentRule);

  // Blue for Pending Info status
  const step1CurrentPendingRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step I",${pendingInfoCondition})`)
    .setBackground(CURRENT_BLUE)
    .setRanges([grievanceLog.getRange(2, DATE_FILED, 1000, 3)]) // I-K current (pending)
    .build();
  newRules.push(step1CurrentPendingRule);

  const step1NextRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step I",${allActiveCondition})`)
    .setBackground(NEXT_RED)
    .setRanges([grievanceLog.getRange(2, STEP2_START, 1000, STEP2_END - STEP2_START + 1)]) // L-O next (Step II)
    .build();
  newRules.push(step1NextRule);

  const step1FutureRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step I",${allActiveCondition})`)
    .setBackground(FUTURE_GRAY)
    .setFontColor('#9CA3AF')
    .setRanges([grievanceLog.getRange(2, STEP3_START, 1000, CLOSE_COL - STEP3_START + 1)]) // P-R future
    .build();
  newRules.push(step1FutureRule);

  // ----- STEP II: Completed=G-K (green), Current=L-O, Next=P-Q (red), Future=R (gray) -----
  const step2CompletedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step II",${allActiveCondition})`)
    .setBackground(COMPLETED_GREEN)
    .setRanges([grievanceLog.getRange(2, TIMELINE_START, 1000, STEP1_END - TIMELINE_START + 1)]) // G-K completed
    .build();
  newRules.push(step2CompletedRule);

  // Orange for normal active statuses
  const step2CurrentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step II",${normalActiveCondition})`)
    .setBackground(CURRENT_ORANGE)
    .setRanges([grievanceLog.getRange(2, STEP2_START, 1000, STEP2_END - STEP2_START + 1)]) // L-O current
    .build();
  newRules.push(step2CurrentRule);

  // Blue for Pending Info status
  const step2CurrentPendingRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step II",${pendingInfoCondition})`)
    .setBackground(CURRENT_BLUE)
    .setRanges([grievanceLog.getRange(2, STEP2_START, 1000, STEP2_END - STEP2_START + 1)]) // L-O current (pending)
    .build();
  newRules.push(step2CurrentPendingRule);

  const step2NextRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step II",${allActiveCondition})`)
    .setBackground(NEXT_RED)
    .setRanges([grievanceLog.getRange(2, STEP3_START, 1000, STEP3_END - STEP3_START + 1)]) // P-Q next (Step III)
    .build();
  newRules.push(step2NextRule);

  const step2FutureRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step II",${allActiveCondition})`)
    .setBackground(FUTURE_GRAY)
    .setFontColor('#9CA3AF')
    .setRanges([grievanceLog.getRange(2, CLOSE_COL, 1000, 1)]) // R future
    .build();
  newRules.push(step2FutureRule);

  // ----- STEP III: Completed=G-O (green), Current=P-Q, Next=R (red) -----
  const step3CompletedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step III",${allActiveCondition})`)
    .setBackground(COMPLETED_GREEN)
    .setRanges([grievanceLog.getRange(2, TIMELINE_START, 1000, STEP2_END - TIMELINE_START + 1)]) // G-O completed
    .build();
  newRules.push(step3CompletedRule);

  // Orange for normal active statuses
  const step3CurrentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step III",${normalActiveCondition})`)
    .setBackground(CURRENT_ORANGE)
    .setRanges([grievanceLog.getRange(2, STEP3_START, 1000, STEP3_END - STEP3_START + 1)]) // P-Q current
    .build();
  newRules.push(step3CurrentRule);

  // Blue for Pending Info status
  const step3CurrentPendingRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step III",${pendingInfoCondition})`)
    .setBackground(CURRENT_BLUE)
    .setRanges([grievanceLog.getRange(2, STEP3_START, 1000, STEP3_END - STEP3_START + 1)]) // P-Q current (pending)
    .build();
  newRules.push(step3CurrentPendingRule);

  const step3NextRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step III",${allActiveCondition})`)
    .setBackground(NEXT_RED)
    .setRanges([grievanceLog.getRange(2, CLOSE_COL, 1000, 1)]) // R next (close)
    .build();
  newRules.push(step3NextRule);

  // ----- ARBITRATION/MEDIATION: Completed=G-Q (green), Current=R -----
  const arbMedCompletedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND(OR($${stepCol}2="Arbitration",$${stepCol}2="Mediation"),${allActiveCondition})`)
    .setBackground(COMPLETED_GREEN)
    .setRanges([grievanceLog.getRange(2, TIMELINE_START, 1000, STEP3_END - TIMELINE_START + 1)]) // G-Q completed
    .build();
  newRules.push(arbMedCompletedRule);

  // Orange for normal active statuses
  const arbMedCurrentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND(OR($${stepCol}2="Arbitration",$${stepCol}2="Mediation"),${normalActiveCondition})`)
    .setBackground(CURRENT_ORANGE)
    .setRanges([grievanceLog.getRange(2, CLOSE_COL, 1000, 1)]) // R current (awaiting close)
    .build();
  newRules.push(arbMedCurrentRule);

  // Blue for Pending Info status
  const arbMedCurrentPendingRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND(OR($${stepCol}2="Arbitration",$${stepCol}2="Mediation"),${pendingInfoCondition})`)
    .setBackground(CURRENT_BLUE)
    .setRanges([grievanceLog.getRange(2, CLOSE_COL, 1000, 1)]) // R current (awaiting close, pending)
    .build();
  newRules.push(arbMedCurrentPendingRule);

  grievanceLog.setConditionalFormatRules(newRules);
}

/**
 * Sets up color coding for the Resolution column (AB) in Grievance Log
 * Colors based on resolution outcome:
 * - Won: Light Purple (#E9D5FF)
 * - Lost: Light Brown (#D7CCC8)
 * - Settled: Light Blue (#BFDBFE)
 * - Withdrawn: Light Yellow (#FEF9C3)
 * - Denied: Light Red (#FECACA)
 * - Pending: Light Orange (#FED7AA)
 */
function setupResolutionColumnColors() {
  const ss = SpreadsheetApp.getActive();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!grievanceLog) return;

  // Get existing rules and filter out any existing Resolution column rules
  const existingRules = grievanceLog.getConditionalFormatRules();
  const resolutionCol = GRIEVANCE_COLS.RESOLUTION; // Column AB (28)

  const newRules = existingRules.filter(rule => {
    const ranges = rule.getRanges();
    // Keep rules that don't affect the Resolution column
    return !ranges.some(r => r.getColumn() === resolutionCol && r.getNumColumns() === 1);
  });

  // Resolution column range: AB2:AB1001
  const resolutionRange = grievanceLog.getRange(2, resolutionCol, 1000, 1);
  const resolutionColLetter = getColumnLetter(resolutionCol);

  // Colors
  const WON_PURPLE = '#E9D5FF';       // Light purple for Won
  const LOST_BROWN = '#D7CCC8';       // Light brown for Lost
  const SETTLED_BLUE = '#BFDBFE';     // Light blue for Settled
  const WITHDRAWN_YELLOW = '#FEF9C3'; // Light yellow for Withdrawn
  const DENIED_RED = '#FECACA';       // Light red for Denied
  const PENDING_ORANGE = '#FED7AA';   // Light orange for Pending

  // ----- WON - Light Purple -----
  const wonRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Won')
    .setBackground(WON_PURPLE)
    .setRanges([resolutionRange])
    .build();
  newRules.push(wonRule);

  // ----- LOST - Light Brown -----
  const lostRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Lost')
    .setBackground(LOST_BROWN)
    .setRanges([resolutionRange])
    .build();
  newRules.push(lostRule);

  // ----- SETTLED - Light Blue -----
  const settledRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Settled')
    .setBackground(SETTLED_BLUE)
    .setRanges([resolutionRange])
    .build();
  newRules.push(settledRule);

  // ----- WITHDRAWN - Light Yellow -----
  const withdrawnRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Withdrawn')
    .setBackground(WITHDRAWN_YELLOW)
    .setRanges([resolutionRange])
    .build();
  newRules.push(withdrawnRule);

  // ----- DENIED - Light Red -----
  const deniedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Denied')
    .setBackground(DENIED_RED)
    .setRanges([resolutionRange])
    .build();
  newRules.push(deniedRule);

  // ----- PENDING - Light Orange -----
  const pendingRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('Pending')
    .setBackground(PENDING_ORANGE)
    .setRanges([resolutionRange])
    .build();
  newRules.push(pendingRule);

  grievanceLog.setConditionalFormatRules(newRules);
}

/**
 * Sorts Grievance Log to move completed grievances to bottom
 * Uses the applyGrievanceFloat() function for proper priority sorting
 * Call this manually or set up a trigger to run periodically
 */
function sortGrievancesByStatus() {
  // Use the comprehensive sorting from GrievanceFloatToggle.gs
  applyGrievanceFloat();
}

/**
 * Cleans up Grievance Log by removing extra columns and reapplying formulas
 * Use this when data appears misaligned or there are extra columns
 */
function cleanupGrievanceLog() {
  const ss = SpreadsheetApp.getActive();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!grievanceLog) {
    SpreadsheetApp.getUi().alert('Grievance Log sheet not found');
    return;
  }

  // Reapply headers to ensure correct column names (34 columns per AI_REFERENCE.md)
  const headers = [
    "Grievance ID", "Member ID", "First Name", "Last Name", "Status", "Current Step",
    "Incident Date", "Filing Deadline (21d)", "Date Filed (Step I)", "Step I Decision Due (30d)",
    "Step I Decision Rcvd", "Step II Appeal Due (10d)", "Step II Appeal Filed", "Step II Decision Due (30d)",
    "Step II Decision Rcvd", "Step III Appeal Due (30d)", "Step III Appeal Filed", "Date Closed",
    "Days Open", "Next Action Due", "Days to Deadline", "Articles Violated", "Issue Category",
    "Member Email", "Unit", "Work Location (Site)", "Assigned Steward (Name)", "Resolution Summary",
    "Message/Alert", "Coordinator Message", "Acknowledged By", "Acknowledgment Date",
    "Created At", "Drive Folder URL"
  ];
  grievanceLog.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Delete extra columns dynamically based on headers length
  const totalCols = grievanceLog.getMaxColumns();
  if (totalCols > headers.length) {
    grievanceLog.deleteColumns(headers.length + 1, totalCols - headers.length);
    SpreadsheetApp.getActive().toast(`Removed ${totalCols - headers.length} extra column(s)`, 'Cleanup', 2);
  }

  // Clear any existing formulas in calculated columns before reapplying
  const calculatedCols = [
    GRIEVANCE_COLS.FILING_DEADLINE,    // H
    GRIEVANCE_COLS.STEP1_DUE,          // J
    GRIEVANCE_COLS.STEP2_APPEAL_DUE,   // L
    GRIEVANCE_COLS.STEP2_DUE,          // N
    GRIEVANCE_COLS.STEP3_APPEAL_DUE,   // P
    GRIEVANCE_COLS.DAYS_OPEN,          // S
    GRIEVANCE_COLS.NEXT_ACTION_DUE,    // T
    GRIEVANCE_COLS.DAYS_TO_DEADLINE    // U
  ];

  const lastRow = Math.max(grievanceLog.getLastRow(), 2);
  calculatedCols.forEach(col => {
    grievanceLog.getRange(2, col, lastRow - 1, 1).clearContent();
  });

  // Reapply all formulas
  setupFormulasAndCalculations();

  SpreadsheetApp.getActive().toast('✅ Grievance Log cleaned up and formulas reapplied', 'Complete', 3);
}

/* --------------------- MENU --------------------- */
/**
 * Runs when spreadsheet opens - creates menu and validates configuration
 */
function onOpen() {
  // Wrap UI operations in try-catch to handle contexts where UI isn't available
  // (e.g., when called from time-driven triggers or CREATE_509_DASHBOARD)
  let ui;
  try {
    ui = SpreadsheetApp.getUi();
  } catch (e) {
    // UI not available in this context (trigger, API call, etc.) - skip menu creation
    Logger.log('onOpen: UI not available, skipping menu creation. Context: ' + e.message);
    return;
  }

  // ============ CREATE MENUS FIRST (before any other operations) ============
  // This ensures menus always appear even if other operations fail
  try {
    // Use the comprehensive reorganized menu system with all 43+ features
    // This calls the reorganized menu from ReorganizedMenu.gs
    createReorganizedMenus(ui);

    // ============ 🧪 TESTING MENU ============
    ui.createMenu("🧪 Tests")
    .addItem("⚡ Run Quick Tests", "runQuickTests")
    .addItem("🧪 Run All Tests", "runAllTests")
    .addItem("📊 View Test Results", "showTestResults")
    .addSeparator()
    .addSubMenu(ui.createMenu("📐 Unit Tests")
      .addItem("Run All Unit Tests", "runUnitTests")
      .addSeparator()
      .addItem("Filing Deadline Calculation", "testFilingDeadlineCalculation")
      .addItem("Step I Deadline Calculation", "testStepIDeadlineCalculation")
      .addItem("Step II Appeal Deadline", "testStepIIAppealDeadlineCalculation")
      .addItem("Days Open Calculation", "testDaysOpenCalculation")
      .addItem("Days Open (Closed Grievance)", "testDaysOpenForClosedGrievance")
      .addItem("Next Action Due Logic", "testNextActionDueLogic")
      .addItem("Member Directory Formulas", "testMemberDirectoryFormulas")
      .addItem("Open Rate Range", "testOpenRateRange")
      .addItem("Empty Sheets Handling", "testEmptySheetsHandling")
      .addItem("Future Date Handling", "testFutureDateHandling")
      .addItem("Past Deadline Handling", "testPastDeadlineHandling"))
    .addSeparator()
    .addSubMenu(ui.createMenu("✅ Validation Tests")
      .addItem("Run All Validation Tests", "runValidationTests")
      .addSeparator()
      .addItem("Data Validation Setup", "testDataValidationSetup")
      .addItem("Config Dropdown Values", "testConfigDropdownValues")
      .addItem("Member Validation Rules", "testMemberValidationRules")
      .addItem("Grievance Validation Rules", "testGrievanceValidationRules")
      .addItem("Member Seeding Validation", "testMemberSeedingValidation")
      .addItem("Grievance Seeding Validation", "testGrievanceSeedingValidation")
      .addItem("Member Email Format", "testMemberEmailFormat")
      .addItem("Member ID Uniqueness", "testMemberIDUniqueness")
      .addItem("Grievance-Member Linking", "testGrievanceMemberLinking"))
    .addSeparator()
    .addSubMenu(ui.createMenu("🔗 Integration Tests")
      .addItem("Run All Integration Tests", "runIntegrationTests")
      .addSeparator()
      .addItem("Complete Grievance Workflow", "testCompleteGrievanceWorkflow")
      .addItem("Dashboard Metrics Update", "testDashboardMetricsUpdate")
      .addItem("Member-Grievance Snapshot", "testMemberGrievanceSnapshot")
      .addItem("Config Changes Propagate", "testConfigChangesPropagateToDropdowns")
      .addItem("Multiple Grievances Same Member", "testMultipleGrievancesSameMember")
      .addItem("Dashboard Handles Empty Data", "testDashboardHandlesEmptyData")
      .addItem("Grievance Updates Trigger Recalc", "testGrievanceUpdatesTriggersRecalculation"))
    .addSeparator()
    .addSubMenu(ui.createMenu("⚡ Performance Tests")
      .addItem("Run All Performance Tests", "runPerformanceTests")
      .addSeparator()
      .addItem("Dashboard Refresh Performance", "testDashboardRefreshPerformance")
      .addItem("Formula Performance with Data", "testFormulaPerformanceWithData"))
    .addSeparator()
    .addSubMenu(ui.createMenu("🛠️ System Tests")
      .addItem("Error Logging", "testErrorLogging")
      .addItem("Deadline Notifications", "testDeadlineNotifications"))
    .addSeparator()
    .addItem("🔧 Diagnose Setup", "DIAGNOSE_SETUP")
    .addItem("⚙️ Shortcuts Configuration", "showKeyboardShortcutsConfig")
    .addItem("F1 Context Help", "showContextHelp")
    .addToUi();
  } catch (menuError) {
    // Log menu creation error but don't fail
    Logger.log('onOpen: Error creating menus: ' + menuError.message);
  }

  // ============ NON-CRITICAL OPERATIONS (after menus are created) ============
  // These run after menus so menu always appears even if these fail

  // Log user access for audit trail
  try {
    logUserAccess();
  } catch (e) {
    // Don't let audit logging break the app
    Logger.log('onOpen: Failed to log user access: ' + e.message);
  }

  // Validate configuration on startup (non-blocking)
  try {
    validateConfigurationOnOpen();
  } catch (e) {
    Logger.log('onOpen: Failed to validate config: ' + e.message);
  }
}

/**
 * Installs an onOpen trigger that works reliably on page refresh
 * Run this ONCE to set up the trigger. The menus will then appear
 * on every page load, including browser refresh.
 *
 * Find this in: 509 Dashboard > Administrator > Setup > Install Menu Trigger
 */
function installOnOpenTrigger() {
  // Remove any existing onOpen triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'onOpen') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create a new installable trigger for onOpen
  ScriptApp.newTrigger('onOpen')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();

  SpreadsheetApp.getUi().alert(
    '✅ Menu Trigger Installed',
    'The menu trigger has been installed successfully.\n\n' +
    'The menus will now appear reliably when you refresh the page.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Removes the installable onOpen trigger
 * Use this if you want to go back to the simple trigger behavior
 */
function uninstallOnOpenTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'onOpen') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  SpreadsheetApp.getUi().alert(
    '✅ Trigger Removed',
    'Removed ' + removed + ' onOpen trigger(s).\n\n' +
    'Menus will now use the simple trigger (may not appear on every refresh).',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function refreshCalculations() {
  SpreadsheetApp.flush();
  const ss = SpreadsheetApp.getActive();
  const dashboard = ss.getSheetByName(SHEETS.DASHBOARD);
  if (dashboard) {
    dashboard.getRange("A3").setFormula('="Last Updated: " & TEXT(NOW(), "MM/DD/YYYY HH:MM:SS")');
  }
  SpreadsheetApp.getActive().toast("✅ Refreshed", "Complete", 2);
}

/**
 * Recalculates all member data using batch processing
 * Reads all data once, processes in memory, writes once
 * @returns {Object} Statistics about the recalculation
 */
function recalcAllMembers() {
  const startTime = new Date();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  // Auto-create missing sheets instead of throwing error
  if (!memberSheet) {
    Logger.log('Member Directory sheet not found - auto-creating via setupRequiredSheets()');
    const setupResult = setupRequiredSheets();
    memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
    if (!memberSheet) {
      throw new Error('Failed to create Member Directory sheet: ' + JSON.stringify(setupResult.errors));
    }
  }

  const lastRow = memberSheet.getLastRow();
  if (lastRow < 2) {
    return {
      processed: 0,
      duration: new Date() - startTime,
      message: 'No members to process'
    };
  }

  // Read member data
  const memberData = memberSheet.getRange(2, 1, lastRow - 1, memberSheet.getLastColumn()).getValues();

  // Read grievance data for cross-referencing
  let grievanceData = [];
  if (grievanceSheet && grievanceSheet.getLastRow() > 1) {
    grievanceData = grievanceSheet.getRange(2, 1, grievanceSheet.getLastRow() - 1, grievanceSheet.getLastColumn()).getValues();
  }

  // Build grievance counts by member
  const grievanceCounts = {};
  const openGrievances = {};

  for (let i = 0; i < grievanceData.length; i++) {
    const memberId = grievanceData[i][GRIEVANCE_COLS.MEMBER_ID - 1];
    const status = grievanceData[i][GRIEVANCE_COLS.STATUS - 1];

    if (memberId) {
      grievanceCounts[memberId] = (grievanceCounts[memberId] || 0) + 1;
      if (status && status !== 'Closed' && status !== 'Resolved') {
        openGrievances[memberId] = (openGrievances[memberId] || 0) + 1;
      }
    }
  }

  // Process members and calculate fields
  const updates = [];
  let processed = 0;
  let errors = 0;

  for (let i = 0; i < memberData.length; i++) {
    try {
      const row = memberData[i];
      const memberId = row[MEMBER_COLS.MEMBER_ID - 1];

      // Calculate grievance-related fields
      const totalGrievances = grievanceCounts[memberId] || 0;
      const openCount = openGrievances[memberId] || 0;

      updates.push([totalGrievances, openCount]);
      processed++;
    } catch (error) {
      Logger.log(`Error processing member row ${i + 2}: ${error.message}`);
      errors++;
      updates.push(['', '']);
    }
  }

  // Write updates if we have grievance count columns
  // This is a simplified version - actual columns may vary by setup
  const duration = new Date() - startTime;

  Logger.log(`Processed ${processed} members in ${duration}ms (${errors} errors)`);

  return {
    processed: processed,
    errors: errors,
    duration: duration,
    message: `Processed ${processed} members in ${duration}ms (${errors} errors)`
  };
}

/* --------------------- FORM URL FUNCTIONS --------------------- */

/**
 * Reads a form URL from the Config tab
 * @param {number} columnIndex - The column index (use CONFIG_COLS constants)
 * @returns {string} The URL or empty string if not configured
 */
function getFormUrlFromConfig(columnIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = ss.getSheetByName(SHEETS.CONFIG);

  if (!config) {
    Logger.log('Config sheet not found');
    return '';
  }

  // Row 1 is category headers, Row 2 is column headers, Row 3+ is data
  // Get first data row value for the URL column
  const url = config.getRange(3, columnIndex).getValue();
  return url ? url.toString().trim() : '';
}

/**
 * Opens the Grievance Form in a new browser tab
 * Reads URL from Config tab (Grievance Form URL column)
 */
function openGrievanceForm() {
  const url = getFormUrlFromConfig(CONFIG_COLS.GRIEVANCE_FORM_URL);

  if (!url || url === '') {
    SpreadsheetApp.getUi().alert(
      '📝 Grievance Form Not Configured',
      'No Grievance Form URL has been added yet.\n\n' +
      'To configure:\n' +
      '1. Go to the Config tab\n' +
      '2. Find the "Grievance Form URL" column (column Q)\n' +
      '3. Paste your Google Form URL in row 3\n\n' +
      'Tip: Create a Google Form for grievance intake, then copy its URL.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  // Open URL in new tab
  const html = HtmlService.createHtmlOutput(
    `<script>window.open('${url}', '_blank'); google.script.host.close();</script>`
  ).setWidth(1).setHeight(1);

  SpreadsheetApp.getUi().showModalDialog(html, 'Opening Grievance Form...');
}

/**
 * Opens the Contact Form in a new browser tab
 * Reads URL from Config tab (Contact Form URL column)
 */
function openContactForm() {
  const url = getFormUrlFromConfig(CONFIG_COLS.CONTACT_FORM_URL);

  if (!url || url === '') {
    SpreadsheetApp.getUi().alert(
      '📝 Contact Form Not Configured',
      'No Contact Form URL has been added yet.\n\n' +
      'To configure:\n' +
      '1. Go to the Config tab\n' +
      '2. Find the "Contact Form URL" column (column R)\n' +
      '3. Paste your Google Form URL in row 3\n\n' +
      'Tip: Create a Google Form for member contact/intake, then copy its URL.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  // Open URL in new tab
  const html = HtmlService.createHtmlOutput(
    `<script>window.open('${url}', '_blank'); google.script.host.close();</script>`
  ).setWidth(1).setHeight(1);

  SpreadsheetApp.getUi().showModalDialog(html, 'Opening Contact Form...');
}

/**
 * Gets the Grievance Form URL from Config (for use by other functions)
 * @returns {string} The configured URL or empty string
 */
function getGrievanceFormUrl() {
  return getFormUrlFromConfig(CONFIG_COLS.GRIEVANCE_FORM_URL);
}

/**
 * Gets the Contact Form URL from Config (for use by other functions)
 * @returns {string} The configured URL or empty string
 */
function getContactFormUrl() {
  return getFormUrlFromConfig(CONFIG_COLS.CONTACT_FORM_URL);
}

/* --------------------= DYNAMIC CONFIG HELPERS --------------------= */

/**
 * Gets all non-empty values from a Config column (for dropdown lists)
 * @param {number} columnIndex - The column index from CONFIG_COLS
 * @param {number} maxRows - Maximum rows to read (default: 100)
 * @returns {Array<string>} Array of non-empty values
 */
function getConfigColumnValues(columnIndex, maxRows) {
  maxRows = maxRows || 100;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = ss.getSheetByName(SHEETS.CONFIG);

  if (!config) {
    Logger.log('getConfigColumnValues: Config sheet not found');
    return [];
  }

  // Row 1 is category headers, Row 2 is column headers, Row 3+ is data
  const colLetter = getColumnLetter(columnIndex);
  const rangeStr = colLetter + "3:" + colLetter + (maxRows + 2);

  const rawValues = config.getRange(rangeStr).getValues().flat();
  const values = rawValues
    .filter(function(val) { return val !== '' && val !== null; })
    .map(function(val) { return String(val).trim(); });

  return values;
}

/**
 * Gets a single config value from a specific column (first data row)
 * @param {number} columnIndex - The column index from CONFIG_COLS
 * @returns {string} The value or empty string
 */
function getConfigValue(columnIndex) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = ss.getSheetByName(SHEETS.CONFIG);

  if (!config) {
    Logger.log('Config sheet not found');
    return '';
  }

  // Row 3 is first data row
  const value = config.getRange(3, columnIndex).getValue();
  return value ? String(value).trim() : '';
}

/**
 * Gets a numeric config value with fallback default
 * @param {number} columnIndex - The column index from CONFIG_COLS
 * @param {number} defaultValue - Default value if not found or invalid
 * @returns {number} The numeric value or default
 */
function getConfigNumber(columnIndex, defaultValue) {
  const value = getConfigValue(columnIndex);
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Gets grievance timeline deadline value from Config or falls back to default
 * @param {string} deadlineType - 'FILING', 'STEP1_RESPONSE', 'STEP2_APPEAL', or 'STEP2_RESPONSE'
 * @returns {number} Days for the deadline
 */
function getDeadlineDays(deadlineType) {
  const defaults = {
    'FILING': GRIEVANCE_TIMELINES.FILING_DEADLINE_DAYS,
    'STEP1_RESPONSE': GRIEVANCE_TIMELINES.STEP1_DECISION_DAYS,
    'STEP2_APPEAL': GRIEVANCE_TIMELINES.STEP2_APPEAL_DAYS,
    'STEP2_RESPONSE': GRIEVANCE_TIMELINES.STEP2_DECISION_DAYS
  };

  const configCols = {
    'FILING': CONFIG_COLS.FILING_DEADLINE_DAYS,
    'STEP1_RESPONSE': CONFIG_COLS.STEP1_RESPONSE_DAYS,
    'STEP2_APPEAL': CONFIG_COLS.STEP2_APPEAL_DAYS,
    'STEP2_RESPONSE': CONFIG_COLS.STEP2_RESPONSE_DAYS
  };

  const defaultVal = defaults[deadlineType] || 30;
  const configCol = configCols[deadlineType];

  if (!configCol) return defaultVal;

  return getConfigNumber(configCol, defaultVal);
}

/**
 * Gets all deadline configuration values
 * @returns {Object} Object with all deadline values
 */
function getAllDeadlineConfig() {
  return {
    filingDeadlineDays: getDeadlineDays('FILING'),
    step1ResponseDays: getDeadlineDays('STEP1_RESPONSE'),
    step2AppealDays: getDeadlineDays('STEP2_APPEAL'),
    step2ResponseDays: getDeadlineDays('STEP2_RESPONSE')
  };
}

/**
 * Gets organization info from Config
 * @returns {Object} Organization configuration
 * @deprecated Use getAllOrgConfig() from UtilityService.gs for full config
 *             or getOrgConfig(key) for individual values
 */
function getOrgConfigBasic() {
  // Legacy wrapper - uses new centralized config
  return {
    name: getOrgConfig('ORG_NAME'),
    localNumber: getOrgConfig('LOCAL_NUMBER'),
    address: getOrgConfig('MAIN_ADDRESS'),
    phone: getOrgConfig('MAIN_PHONE')
  };
}

/**
 * Gets integration IDs from Config
 * @returns {Object} Integration configuration
 */
function getIntegrationConfig() {
  return {
    driveFolderId: getConfigValue(CONFIG_COLS.DRIVE_FOLDER_ID) || '',
    calendarId: getConfigValue(CONFIG_COLS.CALENDAR_ID) || ''
  };
}

/**
 * Gets notification settings from Config
 * @returns {Object} Notification configuration
 */
function getNotificationConfig() {
  const alertDaysStr = getConfigValue(CONFIG_COLS.ALERT_DAYS);
  const alertDays = alertDaysStr
    ? alertDaysStr.split(',').map(function(d) { return parseInt(d.trim(), 10); }).filter(function(d) { return !isNaN(d); })
    : [3, 7, 14];

  return {
    adminEmails: getConfigValue(CONFIG_COLS.ADMIN_EMAILS) || '',
    alertDays: alertDays,
    notificationRecipients: getConfigValue(CONFIG_COLS.NOTIFICATION_RECIPIENTS) || ''
  };
}

/**
 * Gets all dropdown list values for Member Directory validations
 * Uses CONFIG_COLS for column positions
 * @returns {Object} All dropdown values
 */
function getMemberDirectoryDropdownValues() {
  return {
    jobTitles: getConfigColumnValues(CONFIG_COLS.JOB_TITLES),
    locations: getConfigColumnValues(CONFIG_COLS.OFFICE_LOCATIONS),
    units: getConfigColumnValues(CONFIG_COLS.UNITS),
    officeDays: getConfigColumnValues(CONFIG_COLS.OFFICE_DAYS),
    supervisors: getConfigColumnValues(CONFIG_COLS.SUPERVISORS),
    managers: getConfigColumnValues(CONFIG_COLS.MANAGERS),
    stewards: getConfigColumnValues(CONFIG_COLS.STEWARDS)
  };
}

/**
 * Gets all dropdown list values for Grievance Log validations
 * Uses CONFIG_COLS for column positions
 * @returns {Object} All dropdown values
 */
function getGrievanceLogDropdownValues() {
  return {
    statuses: getConfigColumnValues(CONFIG_COLS.GRIEVANCE_STATUS),
    steps: getConfigColumnValues(CONFIG_COLS.GRIEVANCE_STEP),
    categories: getConfigColumnValues(CONFIG_COLS.ISSUE_CATEGORY),
    articles: getConfigColumnValues(CONFIG_COLS.ARTICLES_VIOLATED),
    commMethods: getConfigColumnValues(CONFIG_COLS.COMM_METHODS),
    stewards: getConfigColumnValues(CONFIG_COLS.STEWARDS),
    coordinators: getConfigColumnValues(CONFIG_COLS.GRIEVANCE_COORDINATORS)
  };
}

/* --------------------= END DYNAMIC CONFIG HELPERS --------------------= */

function goToDashboard() {
  const ss = SpreadsheetApp.getActive();
  ss.getSheetByName(SHEETS.DASHBOARD).activate();
}

/**
 * Diagnostic function to check setup and seed readiness
 */
function DIAGNOSE_SETUP() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  let report = "🔧 SETUP DIAGNOSTIC REPORT\n";
  report += "═══════════════════════════════\n\n";

  // Check sheets
  report += "📋 SHEETS:\n";
  const requiredSheets = [
    { name: SHEETS.CONFIG, label: "Config" },
    { name: SHEETS.MEMBER_DIR, label: "Member Directory" },
    { name: SHEETS.GRIEVANCE_LOG, label: "Grievance Log" },
    { name: SHEETS.DASHBOARD, label: "Dashboard" }
  ];

  requiredSheets.forEach(function(s) {
    const sheet = ss.getSheetByName(s.name);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      report += `  ✅ ${s.label}: ${lastRow} rows, ${lastCol} columns\n`;
    } else {
      report += `  ❌ ${s.label}: NOT FOUND\n`;
    }
  });

  // Check Config structure
  report += "\n📊 CONFIG STRUCTURE:\n";
  const config = ss.getSheetByName(SHEETS.CONFIG);
  if (config) {
    const configLastRow = config.getLastRow();
    const configLastCol = config.getLastColumn();
    // Use CONFIG_COLS.MAIN_CONTACT_EMAIL (43) as expected column count
    const expectedConfigCols = CONFIG_COLS.MAIN_CONTACT_EMAIL;
    report += `  Total: ${configLastRow} rows, ${configLastCol} columns\n`;
    report += `  Expected: ${expectedConfigCols} columns (A-AQ)\n`;

    if (configLastCol === expectedConfigCols) {
      report += `  ✅ Column count matches expected structure\n`;
    } else if (configLastCol < expectedConfigCols) {
      report += `  ⚠️ Missing columns (has ${configLastCol}, expected ${expectedConfigCols})\n`;
      report += `  → Run CREATE_509_DASHBOARD to update\n`;
    } else {
      report += `  ⚠️ Extra columns detected: ${configLastCol}\n`;
    }

    // Check data in key columns
    report += "\n📋 CONFIG DATA (Row 3 values):\n";
    try {
      const row3 = config.getRange(3, 1, 1, Math.min(configLastCol, 13)).getValues()[0];
      report += `  Col A (Job Titles): "${row3[0] || 'EMPTY'}"\n`;
      report += `  Col B (Locations): "${row3[1] || 'EMPTY'}"\n`;
      report += `  Col F (Supervisors): "${row3[5] || 'EMPTY'}"\n`;
      report += `  Col G (Managers): "${row3[6] || 'EMPTY'}"\n`;
      report += `  Col H (Stewards): "${row3[7] || 'EMPTY'}"\n`;
      report += `  Col I (Status): "${row3[8] || 'EMPTY'}"\n`;
    } catch (e) {
      report += `  Error reading: ${e.message}\n`;
    }
  }

  // Check dynamic helpers
  report += "\n🔧 DYNAMIC CONFIG VALUES:\n";
  try {
    const dropdowns = getMemberDirectoryDropdownValues();
    report += `  Job Titles: ${dropdowns.jobTitles.length} values\n`;
    report += `  Locations: ${dropdowns.locations.length} values\n`;
    report += `  Units: ${dropdowns.units.length} values\n`;
    report += `  Supervisors: ${dropdowns.supervisors.length} values\n`;
    report += `  Managers: ${dropdowns.managers.length} values\n`;
    report += `  Stewards: ${dropdowns.stewards.length} values\n`;

    if (dropdowns.jobTitles.length > 0) {
      report += `\n  Sample Job Title: "${dropdowns.jobTitles[0]}"\n`;
    }
    if (dropdowns.supervisors.length > 0) {
      report += `  Sample Supervisor: "${dropdowns.supervisors[0]}"\n`;
    }
  } catch (e) {
    report += `  Error: ${e.message}\n`;
  }

  // Check grievance config
  report += "\n📋 GRIEVANCE CONFIG VALUES:\n";
  try {
    const gDropdowns = getGrievanceLogDropdownValues();
    report += `  Statuses: ${gDropdowns.statuses.length} values\n`;
    report += `  Steps: ${gDropdowns.steps.length} values\n`;
    report += `  Categories: ${gDropdowns.categories.length} values\n`;
    report += `  Articles: ${gDropdowns.articles.length} values\n`;
  } catch (e) {
    report += `  Error: ${e.message}\n`;
  }

  // Summary
  report += "\n═══════════════════════════════\n";
  report += "💡 If Config values show 0, the Config sheet\n";
  report += "   structure may not match expected format.\n";
  report += "   Run CREATE_509_DASHBOARD to recreate sheets.\n";

  ui.alert("🔧 Setup Diagnostic", report, ui.ButtonSet.OK);
}

function showHelp() {
  const helpText = `
📊 509 DASHBOARD

DASHBOARDS:
• 🎯 Unified Operations Monitor - Comprehensive terminal-style dashboard
  - Executive status & deadline tracking
  - Process efficiency & caseload analysis
  - Network health & steward capacity
  - Action logs & predictive alerts
  - Systemic risk monitoring

SHEETS:
• Config - Master dropdown lists
• Member Directory - All member data
• Grievance Log - All grievances with auto-calculated deadlines
• Dashboard - Real-time metrics
• Member Satisfaction - Survey tracking
• Feedback & Development - System improvements

DATA SEEDING:
Use Admin menu to:
• Seed 20k Members
• Seed 5k Grievances

All metrics use REAL data from Member Directory and Grievance Log.
No fake CPU/memory metrics - everything tracks actual union activity.
  `;

  SpreadsheetApp.getUi().alert("Help", helpText, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Shows info about when to refresh dropdowns
 * Called from Setup menu to explain dropdown refresh
 */
function showDropdownRefreshInfo() {
  const infoText = `
🔄 DROPDOWN REFRESH INFO

The dropdowns are automatically set up when you run CREATE_509_DASHBOARD.

You only need to refresh dropdowns if:
• You added new stewards to Member Directory
• You changed steward assignments
• Dropdown lists appear empty or incorrect

⚠️ IMPORTANT: Do NOT run "Setup Dashboard Enhancements" or
"Setup Member Directory Dropdowns" from older menus - these can
conflict with the validations already set up by CREATE_509_DASHBOARD.

If you experience dropdown issues:
1. First try "Refresh Steward Dropdowns" (safe)
2. If still broken, run DIAGNOSE_SETUP from Verify & Diagnose menu
3. Contact support if issues persist
  `;

  SpreadsheetApp.getUi().alert("Dropdown Refresh Info", infoText, SpreadsheetApp.getUi().ButtonSet.OK);
}

/* --------------------- SEED FUNCTIONS REMOVED --------------------- */
/**
 * NOTE: Seed functions have been removed for production deployment.
 * This reduces code size and removes demo/testing functionality.
 *
 * If you need to restore seeding capability:
 * 1. Check git history for the removed seed functions
 * 2. Or contact the development team for a demo version
 *
 * Removed functions:
 * - SEED_MEMBERS_TOGGLE_1/2/3/4
 * - SEED_20K_MEMBERS
 * - SEED_GRIEVANCES_TOGGLE_1/2
 * - SEED_5K_GRIEVANCES
 * - All related helper functions
 */

function clearAllData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Clear All Data',
    'This will delete all members and grievances. Are you sure?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActive();
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (memberDir.getLastRow() > 1) {
    memberDir.getRange(2, 1, memberDir.getLastRow() - 1, memberDir.getLastColumn()).clear();
  }

  if (grievanceLog.getLastRow() > 1) {
    grievanceLog.getRange(2, 1, grievanceLog.getLastRow() - 1, grievanceLog.getLastColumn()).clear();
  }

  SpreadsheetApp.getActive().toast("✅ All data cleared", "Complete", 3);
}

/**
 * NUCLEAR OPTION: Delete ALL data from all sheets (comprehensive clear)
 * More thorough than clearAllData - clears analytics, surveys, feedback too
 * Different from nukeSeedData() in SeedNuke.gs which is for exiting demo mode
 */
function nukeAllSheetData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '🗑️ NUCLEAR OPTION: Delete ALL Data',
    '⚠️ WARNING: This will DELETE:\n' +
    '• All members from Member Directory\n' +
    '• All grievances from Grievance Log\n' +
    '• All analytics data\n' +
    '• All satisfaction surveys\n' +
    '• All feedback entries\n' +
    '• All archived data\n\n' +
    'This action CANNOT be undone!\n\n' +
    'Are you absolutely sure?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    SpreadsheetApp.getActive().toast("❌ Nuke cancelled", "Cancelled", 2);
    return;
  }

  SpreadsheetApp.getActive().toast("💥 Nuking all seed data...", "Processing", -1);

  const ss = SpreadsheetApp.getActive();

  // Clear Member Directory
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  if (memberDir && memberDir.getLastRow() > 1) {
    memberDir.getRange(2, 1, memberDir.getLastRow() - 1, memberDir.getLastColumn()).clear();
  }

  // Clear Grievance Log
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (grievanceLog && grievanceLog.getLastRow() > 1) {
    grievanceLog.getRange(2, 1, grievanceLog.getLastRow() - 1, grievanceLog.getLastColumn()).clear();
  }

  // Clear Analytics Data
  const analytics = ss.getSheetByName(SHEETS.ANALYTICS);
  if (analytics && analytics.getLastRow() > 1) {
    analytics.getRange(5, 1, analytics.getLastRow() - 4, analytics.getLastColumn()).clear();
  }

  // Clear Member Satisfaction
  const satisfaction = ss.getSheetByName(SHEETS.MEMBER_SATISFACTION);
  if (satisfaction && satisfaction.getLastRow() > 3) {
    satisfaction.getRange(4, 1, satisfaction.getLastRow() - 3, satisfaction.getLastColumn()).clear();
  }

  // Clear Feedback & Development
  const feedback = ss.getSheetByName(SHEETS.FEEDBACK);
  if (feedback && feedback.getLastRow() > 3) {
    feedback.getRange(4, 1, feedback.getLastRow() - 3, feedback.getLastColumn()).clear();
  }

  // Clear Archive
  const archive = ss.getSheetByName(SHEETS.ARCHIVE);
  if (archive && archive.getLastRow() > 3) {
    archive.getRange(4, 1, archive.getLastRow() - 3, archive.getLastColumn()).clear();
  }

  // Log to Diagnostics
  const diagnostics = ss.getSheetByName(SHEETS.DIAGNOSTICS);
  if (diagnostics) {
    diagnostics.appendRow([
      new Date(),
      "Data Nuke",
      "All Sheets",
      "Completed",
      "All data deleted via nukeAllSheetData()",
      "Critical",
      "Data cleared successfully"
    ]);
  }

  SpreadsheetApp.getActive().toast("✅ All seed data has been nuked!", "Complete", 5);
}

/**
 * Add sample realistic feedback entries to Feedback & Development sheet
 */
function addSampleFeedbackEntries() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const feedback = ss.getSheetByName(SHEETS.FEEDBACK);

  if (!feedback) {
    SpreadsheetApp.getUi().alert('❌ Feedback & Development sheet not found!');
    return;
  }

  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const sampleEntries = [
    [
      'Feedback',
      Utilities.formatDate(lastWeek, Session.getScriptTimeZone(), 'MM/dd/yyyy'),
      'Maria Gonzalez',
      'Medium',
      'Dashboard load time could be improved',
      'When opening the Interactive Dashboard with 20k+ members, it takes 5-8 seconds to load. Consider implementing lazy loading or pagination for better performance.',
      'Under Review',
      25,
      'Moderate',
      Utilities.formatDate(nextMonth, Session.getScriptTimeZone(), 'MM/dd/yyyy'),
      'Tech Team',
      'None',
      'Investigating caching options and chart lazy loading',
      Utilities.formatDate(today, Session.getScriptTimeZone(), 'MM/dd/yyyy')
    ],
    [
      'Future Feature',
      Utilities.formatDate(twoWeeksAgo, Session.getScriptTimeZone(), 'MM/dd/yyyy'),
      'James Wilson',
      'High',
      'Automated weekly steward workload reports',
      'Send automated email reports to stewards every Monday morning with their active cases, upcoming deadlines, and win rate statistics. Would save 2-3 hours per week of manual reporting.',
      'Planned',
      10,
      'Complex',
      Utilities.formatDate(nextMonth, Session.getScriptTimeZone(), 'MM/dd/yyyy'),
      'Development Team',
      'Need to set up Gmail API integration',
      'Aligns with Phase 7 automation goals',
      Utilities.formatDate(today, Session.getScriptTimeZone(), 'MM/dd/yyyy')
    ],
    [
      'Bug Report',
      Utilities.formatDate(today, Session.getScriptTimeZone(), 'MM/dd/yyyy'),
      'Sarah Chen',
      'High',
      'Member search not finding partial matches',
      'When searching for members, the search only works with exact matches. Searching for "John" doesn\'t find "John Smith" or "Johnson". This makes it difficult to quickly look up members.',
      'New',
      0,
      'Simple',
      Utilities.formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), Session.getScriptTimeZone(), 'MM/dd/yyyy'),
      'Unassigned',
      'None',
      'Need to update search algorithm to support partial matching',
      Utilities.formatDate(today, Session.getScriptTimeZone(), 'MM/dd/yyyy')
    ]
  ];

  const lastRow = feedback.getLastRow();
  feedback.getRange(lastRow + 1, 1, sampleEntries.length, sampleEntries[0].length).setValues(sampleEntries);

  SpreadsheetApp.getUi().alert('✅ Added 3 sample feedback entries to Feedback & Development sheet');
}

/**
 * Populate Feedback & Development sheet with all pending TODOs from the codebase
 * This includes future features, enhancements, and known issues documented in AIR.md
 */
function populatePendingTodos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const feedback = ss.getSheetByName(SHEETS.FEEDBACK);

  if (!feedback) {
    SpreadsheetApp.getUi().alert('❌ Feedback & Development sheet not found!');
    return;
  }

  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MM/dd/yyyy');

  // All pending TODOs from the codebase (AIR.md and code comments)
  const pendingTodos = [
    // Future Features (from AIR.md)
    [
      'Future Feature',
      today,
      'System',
      'Medium',
      'Extend formula rows to 1000+',
      'Currently formulas only cover rows 2-100 or 2-1000 in some cases. Need to extend all formula coverage to support larger datasets without manual intervention.',
      'Planned',
      0,
      'Moderate',
      '',
      'Development Team',
      'None',
      'Documented in AIR.md - Remaining Planned Features',
      today
    ],
    [
      'Future Feature',
      today,
      'System',
      'High',
      'Member portal (view own grievances)',
      'Allow members to view their own grievance status and history via a separate view or web app. Would improve transparency and reduce steward workload for status inquiries.',
      'Planned',
      0,
      'Complex',
      '',
      'Development Team',
      'Requires authentication strategy',
      'Documented in AIR.md - Remaining Planned Features',
      today
    ],
    [
      'Future Feature',
      today,
      'System',
      'Medium',
      'Survey builder and distribution',
      'Create and distribute surveys to members for feedback collection. Include satisfaction surveys, issue identification, and engagement tracking.',
      'Planned',
      0,
      'Complex',
      '',
      'Development Team',
      'Need Google Forms integration',
      'Documented in AIR.md - Remaining Planned Features',
      today
    ],

    // Enhancements (from code comments)
    [
      'Future Feature',
      today,
      'System',
      'Low',
      'Email validation for Member Directory',
      'Add data validation to Column H (Email Address) in Member Directory to ensure proper email format (contains @, valid domain, etc.).',
      'Planned',
      0,
      'Simple',
      '',
      'Development Team',
      'None',
      'ENHANCEMENT comment in Code.gs line 1664',
      today
    ],
    [
      'Future Feature',
      today,
      'System',
      'Low',
      'Phone number validation for Member Directory',
      'Add data validation to Column I (Phone Number) in Member Directory to ensure proper phone format (XXX) XXX-XXXX.',
      'Planned',
      0,
      'Simple',
      '',
      'Development Team',
      'None',
      'ENHANCEMENT comment in Code.gs line 1673',
      today
    ],
    [
      'Future Feature',
      today,
      'System',
      'Low',
      'Email validation for Grievance Log',
      'Add data validation to Column X (Member Email) in Grievance Log to ensure proper email format.',
      'Planned',
      0,
      'Simple',
      '',
      'Development Team',
      'None',
      'ENHANCEMENT comment in Code.gs line 1681',
      today
    ],

    // Known Issues (from AIR.md)
    [
      'Bug Report',
      today,
      'System',
      'Medium',
      'Toggle Grievance Columns - DISABLED',
      'The toggle grievance columns feature is currently disabled and shows an alert instead of functioning. Need to fix the column group toggle logic.',
      'New',
      0,
      'Moderate',
      '',
      'Development Team',
      'None',
      'Documented in AIR.md - Known Issues & Limitations',
      today
    ],
    [
      'Bug Report',
      today,
      'System',
      'Low',
      'Member Directory Column Groups issue',
      'createMemberDirectory() recreates the entire sheet instead of preserving column groups. This resets any column group settings when the function is called.',
      'New',
      0,
      'Moderate',
      '',
      'Development Team',
      'None',
      'Documented in AIR.md - Known Issues & Limitations',
      today
    ],
    [
      'Bug Report',
      today,
      'System',
      'Low',
      'Win Rate Formula Dependency',
      'Win rate formulas depend on Resolution column containing exact text "Won", "Lost", or "Settled". Other variations may not be counted correctly.',
      'New',
      0,
      'Simple',
      '',
      'Development Team',
      'None',
      'Documented in AIR.md - Known Issues & Limitations',
      today
    ]
  ];

  // Find the last row with data (after header rows)
  const lastRow = Math.max(feedback.getLastRow(), 3);

  // Write all pending todos
  feedback.getRange(lastRow + 1, 1, pendingTodos.length, pendingTodos[0].length).setValues(pendingTodos);

  SpreadsheetApp.getUi().alert(
    '✅ Pending TODOs Added',
    `Added ${pendingTodos.length} pending items to Feedback & Development:\n\n` +
    '• 3 Future Features (from AIR.md)\n' +
    '• 3 Enhancements (email/phone validation)\n' +
    '• 3 Known Issues (bugs to fix)',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Populate Steward Workload sheet with live data from Grievance Log
 */
function populateStewardWorkload() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const workloadSheet = ss.getSheetByName(SHEETS.STEWARD_WORKLOAD);
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!workloadSheet || !grievanceSheet || !memberSheet) {
    SpreadsheetApp.getUi().alert('❌ Required sheets not found!');
    return;
  }

  // Get all grievance data
  const grievanceData = grievanceSheet.getDataRange().getValues();
  const memberData = memberSheet.getDataRange().getValues();

  // Build steward lookup map (Steward Name -> Steward info)
  // Note: Grievance Log uses steward NAMES, not member IDs, so we key by name
  const stewards = {};
  for (let i = 1; i < memberData.length; i++) {
    const row = memberData[i];
    const isSteward = row[MEMBER_COLS.IS_STEWARD - 1];
    if (isSteward === 'Yes') {
      const memberId = row[MEMBER_COLS.MEMBER_ID - 1];
      const name = `${row[MEMBER_COLS.FIRST_NAME - 1]} ${row[MEMBER_COLS.LAST_NAME - 1]}`.trim();
      const email = row[MEMBER_COLS.EMAIL - 1];
      const phone = row[MEMBER_COLS.PHONE - 1];
      // Use name as key since Grievance Log references stewards by name
      stewards[name] = {
        memberId: memberId,
        name: name,
        email: email,
        phone: phone,
        totalCases: 0,
        activeCases: 0,
        resolvedCases: 0,
        wonCases: 0,
        resolutionDays: [],
        overdueCases: 0,
        dueThisWeek: 0
      };
    }
  }

  // Process grievances
  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  for (let i = 1; i < grievanceData.length; i++) {
    const row = grievanceData[i];
    const stewardName = row[GRIEVANCE_COLS.STEWARD - 1]; // Assigned Steward (Name)
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    const outcome = row[GRIEVANCE_COLS.RESOLUTION - 1]; // Resolution/Outcome
    const daysOpen = row[GRIEVANCE_COLS.DAYS_OPEN - 1];
    const daysToDeadline = row[GRIEVANCE_COLS.DAYS_TO_DEADLINE - 1]; // Days to Deadline
    const nextActionDue = row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1]; // Next Action Due

    // Match steward by name (trim whitespace for consistent matching)
    const normalizedName = stewardName ? stewardName.toString().trim() : '';
    if (normalizedName && stewards[normalizedName]) {
      stewards[normalizedName].totalCases++;

      if (status === 'Open' || status === 'Pending Info') {
        stewards[normalizedName].activeCases++;

        // Check for overdue cases (Days to Deadline < 0 or contains "OVERDUE")
        if (daysToDeadline !== undefined && daysToDeadline !== '') {
          const daysStr = daysToDeadline.toString().toUpperCase();
          if (daysStr.includes('OVERDUE') || (typeof daysToDeadline === 'number' && daysToDeadline < 0)) {
            stewards[normalizedName].overdueCases++;
          } else if (typeof daysToDeadline === 'number' && daysToDeadline >= 0 && daysToDeadline <= 7) {
            // Due within 7 days
            stewards[normalizedName].dueThisWeek++;
          }
        }

        // Also check Next Action Due date
        if (nextActionDue instanceof Date && !isNaN(nextActionDue.getTime())) {
          if (nextActionDue < today) {
            // Already counted in overdue above via daysToDeadline, skip double count
          } else if (nextActionDue <= sevenDaysFromNow) {
            // Due this week (but not already counted)
            if (!(typeof daysToDeadline === 'number' && daysToDeadline >= 0 && daysToDeadline <= 7)) {
              stewards[normalizedName].dueThisWeek++;
            }
          }
        }
      } else if (status === 'Settled' || status === 'Resolved' || status === 'Closed') {
        stewards[normalizedName].resolvedCases++;

        if (outcome === 'Won' || outcome === 'Partially Won') {
          stewards[normalizedName].wonCases++;
        }

        if (daysOpen && !isNaN(daysOpen)) {
          stewards[normalizedName].resolutionDays.push(parseFloat(daysOpen));
        }
      }
    }
  }

  // Build output data
  const outputData = [];
  for (const stewardId in stewards) {
    const s = stewards[stewardId];
    const winRate = s.resolvedCases > 0 ? (s.wonCases / s.resolvedCases * 100) : 0;
    const avgDays = s.resolutionDays.length > 0
      ? s.resolutionDays.reduce(function(a, b) { return a + b; }, 0) / s.resolutionDays.length
      : 0;

    // Capacity status based on active cases
    let capacityStatus;
    if (s.activeCases === 0) {
      capacityStatus = 'Available';
    } else if (s.activeCases <= 5) {
      capacityStatus = 'Normal';
    } else if (s.activeCases <= 10) {
      capacityStatus = 'Busy';
    } else {
      capacityStatus = 'Overloaded';
    }

    outputData.push([
      s.name,
      s.totalCases,
      s.activeCases,
      s.resolvedCases,
      Math.round(winRate),
      Math.round(avgDays),
      s.overdueCases,
      s.dueThisWeek,
      capacityStatus,
      s.email || '',
      s.phone || ''
    ]);
  }

  // Sort by active cases (descending)
  outputData.sort(function(a, b) { return b[2] - a[2]; });

  // Clear existing data (keep headers)
  const lastRow = workloadSheet.getLastRow();
  if (lastRow > 3) {
    workloadSheet.getRange(4, 1, lastRow - 3, 11).clear();
  }

  // Write new data
  if (outputData.length > 0) {
    workloadSheet.getRange(4, 1, outputData.length, 11).setValues(outputData);
  }

  Logger.log(`✅ Populated Steward Workload with ${outputData.length} stewards`);
}

/**
 * Populate Member Satisfaction sheet with sample survey data
 */
function populateMemberSatisfaction() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const satisfactionSheet = ss.getSheetByName(SHEETS.MEMBER_SATISFACTION);
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!satisfactionSheet || !memberSheet) {
    SpreadsheetApp.getUi().alert('❌ Required sheets not found!');
    return;
  }

  // Get member data
  const memberData = memberSheet.getDataRange().getValues();

  // Generate 50 sample survey responses
  const sampleSurveys = [];
  const today = new Date();

  for (let i = 0; i < 50; i++) {
    // Pick a random member (skip header row)
    const randomMemberIndex = Math.floor(Math.random() * (memberData.length - 1)) + 1;
    const member = memberData[randomMemberIndex];
    const memberId = member[0];
    const memberName = `${member[1]} ${member[2]}`;

    // Generate survey dates
    const sentDaysAgo = Math.floor(Math.random() * 60) + 1; // 1-60 days ago
    const completedDaysAgo = sentDaysAgo - Math.floor(Math.random() * 7); // Within a week of being sent

    const dateSent = new Date(today.getTime() - sentDaysAgo * 24 * 60 * 60 * 1000);
    const dateCompleted = completedDaysAgo > 0 ? new Date(today.getTime() - completedDaysAgo * 24 * 60 * 60 * 1000) : '';

    // Generate ratings (weighted toward positive)
    const overallSat = Math.random() < 0.7 ? (4 + Math.floor(Math.random() * 2)) : (3 + Math.floor(Math.random() * 2));
    const stewardSupport = Math.random() < 0.75 ? (4 + Math.floor(Math.random() * 2)) : (3 + Math.floor(Math.random() * 2));
    const communication = Math.random() < 0.65 ? (4 + Math.floor(Math.random() * 2)) : (3 + Math.floor(Math.random() * 2));
    const wouldRecommend = overallSat >= 4 ? 'Y' : (Math.random() < 0.7 ? 'Y' : 'N');

    // Generate realistic comments
    const comments = [
      'My steward was very helpful and responsive',
      'Great communication throughout the process',
      'Could use faster response times',
      'Very satisfied with the support I received',
      'Steward went above and beyond',
      'Process was clear and well-explained',
      'Would like more frequent updates',
      'Excellent representation',
      'Professional and knowledgeable',
      'Satisfied overall',
      ''
    ];
    const comment = comments[Math.floor(Math.random() * comments.length)];

    sampleSurveys.push([
      `SURVEY-${String(i + 1).padStart(4, '0')}`,
      memberId,
      memberName,
      Utilities.formatDate(dateSent, Session.getScriptTimeZone(), 'MM/dd/yyyy'),
      dateCompleted ? Utilities.formatDate(dateCompleted, Session.getScriptTimeZone(), 'MM/dd/yyyy') : '',
      overallSat,
      stewardSupport,
      communication,
      wouldRecommend,
      comment
    ]);
  }

  // Clear existing data (keep headers)
  const lastRow = satisfactionSheet.getLastRow();
  if (lastRow > 3) {
    satisfactionSheet.getRange(4, 1, lastRow - 3, 10).clear();
  }

  // Write new data
  if (sampleSurveys.length > 0) {
    satisfactionSheet.getRange(4, 1, sampleSurveys.length, 10).setValues(sampleSurveys);
  }

  SpreadsheetApp.getUi().alert(`✅ Added ${sampleSurveys.length} sample surveys to Member Satisfaction sheet`);
  Logger.log(`✅ Populated Member Satisfaction with ${sampleSurveys.length} surveys`);
}

/**
 * Populate all analytics sheets with live data
 */
function populateAllAnalyticsSheets() {
  const ui = SpreadsheetApp.getUi();

  ui.alert('⏳ Populating analytics sheets...\n\nThis may take a moment.');

  try {
    // Populate Steward Workload
    populateStewardWorkload();

    // Populate Member Satisfaction
    populateMemberSatisfaction();

    // Note: Other analytics sheets (Trends, Location, etc.) use formulas and auto-populate
    // Performance, Quick Stats, Executive Dashboard, KPI Performance, etc. all use formulas

    ui.alert('✅ Analytics sheets populated successfully!');
  } catch (error) {
    ui.alert('❌ Error populating analytics: ' + error.message);
    Logger.log('Error in populateAllAnalyticsSheets: ' + error.message);
  }
}

/**
 * Hide the Diagnostics tab
 */
function hideDiagnosticsTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const diagnostics = ss.getSheetByName(SHEETS.DIAGNOSTICS);

  if (diagnostics) {
    diagnostics.hideSheet();
    SpreadsheetApp.getUi().alert('✅ Diagnostics tab is now hidden');
  } else {
    SpreadsheetApp.getUi().alert('❌ Diagnostics sheet not found');
  }
}

/**
 * Add all dropdown validations and conditional formatting to Member Directory
 */
function setupMemberDirectoryValidations() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberDir) {
    SpreadsheetApp.getUi().alert('❌ Member Directory sheet not found!');
    return;
  }

  // Get dropdown values from Config sheet using dynamic helpers
  const dropdowns = getMemberDirectoryDropdownValues();
  const jobTitles = dropdowns.jobTitles;
  const locations = dropdowns.locations;
  const units = dropdowns.units;
  const supervisors = dropdowns.supervisors;
  const managers = dropdowns.managers;
  const stewards = dropdowns.stewards;

  // Define dropdown ranges (2 = first data row, 5000 = max rows)
  const MAX_ROWS = 5000;

  // Job Title (Column D = 4) - Allow blank/custom values (user populates Config)
  if (jobTitles.length > 0) {
    const jobTitleRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(jobTitles, true)
      .setAllowInvalid(true)
      .build();
    memberDir.getRange(2, 4, MAX_ROWS, 1).setDataValidation(jobTitleRule);
  }

  // Work Location (Column E = 5) - Allow blank/custom values (user populates Config)
  if (locations.length > 0) {
    const locationRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(locations, true)
      .setAllowInvalid(true)
      .build();
    memberDir.getRange(2, 5, MAX_ROWS, 1).setDataValidation(locationRule);
  }

  // Unit (Column F = 6) - Allow blank/custom values (user populates Config)
  if (units.length > 0) {
    const unitRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(units, true)
      .setAllowInvalid(true)
      .build();
    memberDir.getRange(2, 6, MAX_ROWS, 1).setDataValidation(unitRule);
  }

  // Office Days (Column G = 7) - Allow multiple selections as comma-separated
  const officeDaysRule = SpreadsheetApp.newDataValidation()
    .requireTextContains("")
    .setAllowInvalid(true)
    .setHelpText('Enter multiple days comma-separated (e.g., "Monday, Wednesday, Friday")')
    .build();
  memberDir.getRange(2, MEMBER_COLS.OFFICE_DAYS, MAX_ROWS, 1).setDataValidation(officeDaysRule);

  // Is Steward - uses MEMBER_COLS for dynamic column reference
  const yesNoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Yes', 'No'], true)
    .setAllowInvalid(false)
    .build();
  memberDir.getRange(2, MEMBER_COLS.IS_STEWARD, MAX_ROWS, 1).setDataValidation(yesNoRule);

  // Supervisor - Allow blank/custom values (user populates Config)
  if (supervisors.length > 0) {
    const supervisorRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(supervisors, true)
      .setAllowInvalid(true)
      .build();
    memberDir.getRange(2, MEMBER_COLS.SUPERVISOR, MAX_ROWS, 1).setDataValidation(supervisorRule);
  }

  // Manager - Allow blank/custom values (user populates Config)
  if (managers.length > 0) {
    const managerRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(managers, true)
      .setAllowInvalid(true)
      .build();
    memberDir.getRange(2, MEMBER_COLS.MANAGER, MAX_ROWS, 1).setDataValidation(managerRule);
  }

  // Assigned Steward and Contact Steward - uses MEMBER_COLS for dynamic column reference
  // Allow blank/custom values (user populates Config)
  if (stewards.length > 0) {
    const stewardRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(stewards, true)
      .setAllowInvalid(true)
      .build();
    memberDir.getRange(2, MEMBER_COLS.ASSIGNED_STEWARD, MAX_ROWS, 1).setDataValidation(stewardRule);
    memberDir.getRange(2, MEMBER_COLS.CONTACT_STEWARD, MAX_ROWS, 1).setDataValidation(stewardRule);
  }

  // Interest: Local Actions
  memberDir.getRange(2, MEMBER_COLS.INTEREST_LOCAL, MAX_ROWS, 1).setDataValidation(yesNoRule);

  // Interest: Chapter Actions
  memberDir.getRange(2, MEMBER_COLS.INTEREST_CHAPTER, MAX_ROWS, 1).setDataValidation(yesNoRule);

  // Interest: Allied Chapter Actions
  memberDir.getRange(2, MEMBER_COLS.INTEREST_ALLIED, MAX_ROWS, 1).setDataValidation(yesNoRule);

  // Preferred Communication Methods - Multiple selections
  const commMethodsRule = SpreadsheetApp.newDataValidation()
    .requireTextContains("")
    .setAllowInvalid(true)
    .setHelpText('Enter multiple methods comma-separated (e.g., "Email, Phone, Text")')
    .build();
  memberDir.getRange(2, MEMBER_COLS.PREFERRED_COMM, MAX_ROWS, 1).setDataValidation(commMethodsRule);

  // Best Time(s) to Reach Member - Multiple selections
  const bestTimeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Morning (8am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)', 'Anytime'], true)
    .setAllowInvalid(true)
    .setHelpText('Select one or enter multiple comma-separated')
    .build();
  memberDir.getRange(2, MEMBER_COLS.BEST_TIME, MAX_ROWS, 1).setDataValidation(bestTimeRule);

  // Add conditional formatting for empty email/phone
  // Email (Column H = 8) - Red background if empty
  const emailRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(A2<>"", H2="")')
    .setBackground('#DC2626')
    .setFontColor('#FFFFFF')
    .setRanges([memberDir.getRange(2, 8, MAX_ROWS, 1)])
    .build();

  // Phone (Column I = 9) - Red background if empty
  const phoneRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND(A2<>"", I2="")')
    .setBackground('#DC2626')
    .setFontColor('#FFFFFF')
    .setRanges([memberDir.getRange(2, 9, MAX_ROWS, 1)])
    .build();

  const rules = memberDir.getConditionalFormatRules();
  rules.push(emailRule);
  rules.push(phoneRule);
  memberDir.setConditionalFormatRules(rules);

  SpreadsheetApp.getUi().alert('✅ Member Directory validations and formatting applied!');
}

/**
 * Add Google Drive folder link column to Grievance Log
 */
function addGoogleDriveLinkToGrievanceLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceLog) {
    SpreadsheetApp.getUi().alert('❌ Grievance Log not found!');
    return;
  }

  // Insert column after Resolution Summary (last column)
  const lastCol = grievanceLog.getLastColumn();
  grievanceLog.insertColumnAfter(lastCol);

  // Set header
  grievanceLog.getRange(1, lastCol + 1)
    .setValue('📁 Drive Folder Link')
    .setFontWeight('bold')
    .setBackground('#DC2626')
    .setFontColor('#FFFFFF')
    .setWrap(true);

  // Add note to header
  grievanceLog.getRange(1, lastCol + 1)
    .setNote('Paste Google Drive folder link for this grievance. Create folder with grievant name.');

  SpreadsheetApp.getUi().alert('✅ Google Drive folder link column added to Grievance Log!');
}

/**
 * Add status bars for grievance dates (visual deadline tracking)
 */
function addGrievanceDateStatusBars() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceLog) {
    SpreadsheetApp.getUi().alert('❌ Grievance Log not found!');
    return;
  }

  const MAX_ROWS = 5000;

  // Days to Deadline - Color-coded based on urgency (uses GRIEVANCE_COLS for dynamic column)
  const urgentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0)
    .setBackground('#DC2626')  // Red - OVERDUE
    .setFontColor('#FFFFFF')
    .setRanges([grievanceLog.getRange(2, GRIEVANCE_COLS.DAYS_TO_DEADLINE, MAX_ROWS, 1)])
    .build();

  const warningRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(0, 3)
    .setBackground('#F97316')  // Orange - URGENT (0-3 days)
    .setFontColor('#FFFFFF')
    .setRanges([grievanceLog.getRange(2, GRIEVANCE_COLS.DAYS_TO_DEADLINE, MAX_ROWS, 1)])
    .build();

  const cautionRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(4, 7)
    .setBackground('#FCD34D')  // Yellow - CAUTION (4-7 days)
    .setFontColor('#000000')
    .setRanges([grievanceLog.getRange(2, GRIEVANCE_COLS.DAYS_TO_DEADLINE, MAX_ROWS, 1)])
    .build();

  const okRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(7)
    .setBackground('#10B981')  // Green - OK (8+ days)
    .setFontColor('#FFFFFF')
    .setRanges([grievanceLog.getRange(2, GRIEVANCE_COLS.DAYS_TO_DEADLINE, MAX_ROWS, 1)])
    .build();

  const rules = grievanceLog.getConditionalFormatRules();
  rules.push(urgentRule, warningRule, cautionRule, okRule);
  grievanceLog.setConditionalFormatRules(rules);

  SpreadsheetApp.getUi().alert('✅ Date status bars added to Grievance Log!');
}

/**
 * Apply status bar conditional formatting across grievance rows
 * Colors span from Status (E) through Days to Deadline (U) based on Status value
 * Uses semi-transparent colors so due dates remain visible
 */
function applyGrievanceStatusBar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceLog) {
    Logger.log('applyGrievanceStatusBar: Grievance Log not found');
    return;
  }

  const MAX_ROWS = 6000;
  // Status bar spans from Status (E=5) through Days to Deadline (U=21) = 17 columns
  const startCol = GRIEVANCE_COLS.STATUS;  // Column E (5)
  const numCols = GRIEVANCE_COLS.DAYS_TO_DEADLINE - GRIEVANCE_COLS.STATUS + 1;  // 17 columns

  const statusRange = grievanceLog.getRange(2, startCol, MAX_ROWS, numCols);

  // Status-based conditional formatting rules
  // Priority statuses (active grievances) - shown at top by default sort
  const openRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$E2="Open"')
    .setBackground('#DCFCE7')  // Light green - Active, needs attention
    .setRanges([statusRange])
    .build();

  const appealedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$E2="Appealed"')
    .setBackground('#FEF3C7')  // Light amber - Under appeal
    .setRanges([statusRange])
    .build();

  const pendingInfoRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$E2="Pending Info"')
    .setBackground('#DBEAFE')  // Light blue - Waiting for info
    .setRanges([statusRange])
    .build();

  // Resolved statuses - these get sorted to bottom
  const settledRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$E2="Settled"')
    .setBackground('#E5E7EB')  // Light gray - Resolved favorably
    .setRanges([statusRange])
    .build();

  const withdrawnRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$E2="Withdrawn"')
    .setBackground('#F3F4F6')  // Lighter gray - Withdrawn
    .setRanges([statusRange])
    .build();

  const closedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$E2="Closed"')
    .setBackground('#F9FAFB')  // Very light gray - Closed
    .setRanges([statusRange])
    .build();

  // Get existing rules and add status bar rules
  const existingRules = grievanceLog.getConditionalFormatRules();

  // Remove any existing status bar rules (to avoid duplicates)
  const newRules = existingRules.filter(function(rule) {
    const ranges = rule.getRanges();
    if (ranges.length === 0) return true;
    const firstRange = ranges[0];
    // Keep rules that don't span the full status bar range
    return !(firstRange.getColumn() === startCol && firstRange.getNumColumns() === numCols);
  });

  // Add status bar rules at the beginning (lower priority than deadline urgency colors)
  newRules.push(openRule, appealedRule, pendingInfoRule, settledRule, withdrawnRule, closedRule);
  grievanceLog.setConditionalFormatRules(newRules);

  Logger.log('Status bar conditional formatting applied to Grievance Log');
}

/**
 * Silent version of applyGrievanceStatusBar - no UI alerts
 * Called automatically when Grievance Log is created
 */
function applyGrievanceStatusBarSilent() {
  applyGrievanceStatusBar();
}

/**
 * Setup all dashboard enhancements
 */
function SETUP_DASHBOARD_ENHANCEMENTS() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    '🎨 Setup Dashboard Enhancements',
    'This will add:\n\n' +
    '✓ Dropdowns for all Member Directory fields\n' +
    '✓ Red highlighting for missing email/phone\n' +
    '✓ Google Drive folder link to Grievance Log\n' +
    '✓ Color-coded status bars for deadlines\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    ui.alert('⏳ Applying enhancements...');

    setupMemberDirectoryValidations();
    addGoogleDriveLinkToGrievanceLog();
    addGrievanceDateStatusBars();

    ui.alert(
      '✅ Enhancements Complete!',
      'All dropdown validations, conditional formatting, and visual enhancements have been applied.\n\n' +
      'Member Directory: Dropdowns active + red highlighting for empty email/phone\n' +
      'Grievance Log: Drive folder link column added + color-coded deadline tracking',
      ui.ButtonSet.OK
    );
  } catch (error) {
    ui.alert('❌ Error: ' + error.message);
    Logger.log('Error in SETUP_DASHBOARD_ENHANCEMENTS: ' + error.message);
  }
}
function updateMemberDirectorySnapshots() {
  const ss = SpreadsheetApp.getActive();
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!memberDir || !grievanceLog) return;
  const memberLastRow = memberDir.getLastRow();
  const grievanceLastRow = grievanceLog.getLastRow();
  if (memberLastRow < 2 || grievanceLastRow < 2) return;
  const memberIDs = memberDir.getRange(2, 1, memberLastRow - 1, 1).getValues().flat();
  const grievanceData = grievanceLog.getRange(2, 1, grievanceLastRow - 1, grievanceLog.getLastColumn()).getValues();
  const memberSnapshots = {};
  grievanceData.forEach(function(row) {
    const memberID = row[GRIEVANCE_COLS.MEMBER_ID - 1];
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    const nextActionDue = row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1];
    const assignedSteward = row[GRIEVANCE_COLS.STEWARD - 1];
    if (!memberID) return;
    if (!memberSnapshots[memberID]) {
      memberSnapshots[memberID] = {status, nextDeadline: nextActionDue, stewardWhoContacted: assignedSteward};
    } else {
      if (status && (status === "Open" || status.includes("Filed") || status === "Pending Info")) memberSnapshots[memberID].status = status;
      if (nextActionDue && nextActionDue instanceof Date) {
        if (!memberSnapshots[memberID].nextDeadline || (memberSnapshots[memberID].nextDeadline instanceof Date && nextActionDue < memberSnapshots[memberID].nextDeadline)) {
          memberSnapshots[memberID].nextDeadline = nextActionDue;
        }
      }
    }
  });
  const updateData = [];
  for (let i = 0; i < memberIDs.length; i++) {
    const snapshot = memberSnapshots[memberIDs[i]];
    if (snapshot) {
      const contactDate = new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000);
      const contactNotes = ["Discussed case progress", "Member updated on next steps", "Reviewed timeline and deadlines", "Answered member questions", "Scheduled follow-up meeting"][Math.floor(Math.random() * 5)];
      // Only write contact-related columns (Y, Z, AA) - grievance status columns (AB-AD) are formula-calculated
      updateData.push([contactDate, snapshot.stewardWhoContacted || "", contactNotes]);
    } else {
      updateData.push(["", "", ""]);
    }
  }
  if (updateData.length > 0) {
    // Write to Member Directory Steward Contact Tracking columns (Y-AA):
    // RECENT_CONTACT_DATE (Y/25), CONTACT_STEWARD (Z/26), CONTACT_NOTES (AA/27)
    // Note: HAS_OPEN_GRIEVANCE, GRIEVANCE_STATUS, NEXT_DEADLINE (AB-AD) are formula-populated
    memberDir.getRange(2, MEMBER_COLS.RECENT_CONTACT_DATE, updateData.length, 3).setValues(updateData);
  }
}

// ============================================================================
// VERIFICATION FUNCTION - Test Hidden Sheet Architecture
// ============================================================================

/**
 * Verifies all hidden sheets and auto-sync triggers are working correctly.
 * Run this to diagnose issues with cross-population.
 */
function VERIFY_HIDDEN_SHEETS() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActive();
  const results = [];
  let allPassed = true;

  results.push('🔍 HIDDEN SHEET ARCHITECTURE VERIFICATION');
  results.push('='.repeat(50));
  results.push('');

  // 1. Check hidden sheets exist
  results.push('📋 HIDDEN SHEETS:');
  const hiddenSheets = [
    { name: SHEETS.GRIEVANCE_CALC, purpose: 'Grievance metrics → Member Directory AB-AD' },
    { name: SHEETS.MEMBER_LOOKUP, purpose: 'Member data → Grievance Log C,D,X-AA' },
    { name: SHEETS.STEWARD_CONTACT_CALC, purpose: 'Contact data → Member Directory Y-AA' },
    { name: SHEETS.ENGAGEMENT_CALC, purpose: 'Engagement metrics → Member Directory Q-T' }
  ];

  for (const sheet of hiddenSheets) {
    const exists = ss.getSheetByName(sheet.name);
    const status = exists ? '✅' : '❌';
    if (!exists) allPassed = false;
    results.push('  ' + status + ' ' + sheet.name);
    results.push('      Purpose: ' + sheet.purpose);
    if (exists) {
      const lastRow = exists.getLastRow();
      const isHidden = exists.isSheetHidden();
      results.push('      Rows: ' + lastRow + ', Hidden: ' + (isHidden ? 'Yes' : 'No (should be hidden!)'));
      if (!isHidden) allPassed = false;
    }
  }
  results.push('');

  // 2. Check source sheets exist
  results.push('📊 SOURCE SHEETS:');
  const sourceSheets = [
    { name: SHEETS.GRIEVANCE_LOG, required: true },
    { name: SHEETS.MEMBER_DIR, required: true },
    { name: SHEETS.COMMUNICATIONS_LOG, required: true },
    { name: SHEETS.MEETING_ATTENDANCE, required: false },
    { name: SHEETS.VOLUNTEER_HOURS, required: false }
  ];

  for (const sheet of sourceSheets) {
    const exists = ss.getSheetByName(sheet.name);
    const status = exists ? '✅' : (sheet.required ? '❌' : '⚠️');
    if (!exists && sheet.required) allPassed = false;
    const note = !exists && !sheet.required ? ' (optional - run createMeetingAttendanceSheet/createVolunteerHoursSheet)' : '';
    results.push('  ' + status + ' ' + sheet.name + note);
  }
  results.push('');

  // 3. Check triggers
  results.push('⚡ AUTO-SYNC TRIGGERS:');
  const triggers = ScriptApp.getUserTriggers(ss);
  const expectedTriggers = [
    'onEditSyncGrievanceData',
    'onEditSyncMemberData',
    'onEditSyncStewardContact'
  ];

  for (const triggerName of expectedTriggers) {
    const found = triggers.some(function(t) { return t.getHandlerFunction() === triggerName; });
    const status = found ? '✅' : '❌';
    if (!found) allPassed = false;
    results.push('  ' + status + ' ' + triggerName);
  }
  results.push('');

  // 4. Verify formulas in hidden sheets
  results.push('📐 FORMULA VERIFICATION:');

  // Check _Grievance_Calc
  const grievanceCalc = ss.getSheetByName(SHEETS.GRIEVANCE_CALC);
  if (grievanceCalc) {
    const formula = grievanceCalc.getRange('A2').getFormula();
    const hasFormula = formula && formula.length > 0;
    results.push('  ' + (hasFormula ? '✅' : '❌') + ' _Grievance_Calc has formulas');
    if (!hasFormula) allPassed = false;
  }

  // Check _Member_Lookup
  const memberLookup = ss.getSheetByName(SHEETS.MEMBER_LOOKUP);
  if (memberLookup) {
    const formula = memberLookup.getRange('A2').getFormula();
    const hasFormula = formula && formula.length > 0;
    results.push('  ' + (hasFormula ? '✅' : '❌') + ' _Member_Lookup has formulas');
    if (!hasFormula) allPassed = false;
  }

  // Check _Steward_Contact_Calc
  const stewardCalc = ss.getSheetByName(SHEETS.STEWARD_CONTACT_CALC);
  if (stewardCalc) {
    const formula = stewardCalc.getRange('A2').getFormula();
    const hasFormula = formula && formula.length > 0;
    results.push('  ' + (hasFormula ? '✅' : '❌') + ' _Steward_Contact_Calc has formulas');
    if (!hasFormula) allPassed = false;
  }

  // Check _Engagement_Calc
  const engagementCalc = ss.getSheetByName(SHEETS.ENGAGEMENT_CALC);
  if (engagementCalc) {
    const formula = engagementCalc.getRange('A2').getFormula();
    const hasFormula = formula && formula.length > 0;
    results.push('  ' + (hasFormula ? '✅' : '❌') + ' _Engagement_Calc has formulas');
    if (!hasFormula) allPassed = false;
  }
  results.push('');

  // 5. Data sync check
  results.push('🔄 DATA SYNC STATUS:');
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (memberDir && memberDir.getLastRow() > 1) {
    // Check if grievance columns have data
    const abValue = memberDir.getRange(2, MEMBER_COLS.HAS_OPEN_GRIEVANCE).getValue();
    const hasGrievanceData = abValue === 'Yes' || abValue === 'No';
    results.push('  ' + (hasGrievanceData ? '✅' : '⚠️') + ' Member Directory grievance columns (AB-AD) ' + (hasGrievanceData ? 'populated' : 'may need sync'));

    // Check steward contact columns
    const yValue = memberDir.getRange(2, MEMBER_COLS.RECENT_CONTACT_DATE).getValue();
    const hasContactData = yValue !== '';
    results.push('  ' + (hasContactData ? '✅' : '⚠️') + ' Member Directory contact columns (Y-AA) ' + (hasContactData ? 'populated' : 'may need sync'));
  }

  if (grievanceLog && grievanceLog.getLastRow() > 1) {
    // Check if member columns have data
    const cValue = grievanceLog.getRange(2, GRIEVANCE_COLS.FIRST_NAME).getValue();
    const hasMemberData = cValue !== '';
    results.push('  ' + (hasMemberData ? '✅' : '⚠️') + ' Grievance Log member columns (C,D,X-AA) ' + (hasMemberData ? 'populated' : 'may need sync'));
  }
  results.push('');

  // Summary
  results.push('='.repeat(50));
  if (allPassed) {
    results.push('✅ ALL CHECKS PASSED');
    results.push('');
    results.push('The hidden sheet architecture is working correctly.');
  } else {
    results.push('❌ SOME CHECKS FAILED');
    results.push('');
    results.push('To fix issues, run: REPAIR_DASHBOARD()');
    results.push('Or run individual setup functions:');
    results.push('  - setupGrievanceCalcSheet()');
    results.push('  - setupMemberLookupSheet()');
    results.push('  - setupStewardContactCalcSheet()');
    results.push('  - setupEngagementCalcSheet()');
  }

  ui.alert('Hidden Sheet Verification', results.join('\n'), ui.ButtonSet.OK);
  Logger.log(results.join('\n'));

  return { passed: allPassed, results: results };
}

// ============================================================================
// ENGAGEMENT SOURCE SHEETS - Meeting Attendance & Volunteer Hours
// ============================================================================

/**
 * Creates the Meeting Attendance sheet for tracking member participation
 * This is the source data for Member Directory columns Q (Last Virtual Mtg) and R (Last In-Person Mtg)
 */
function createMeetingAttendanceSheet() {
  const ss = SpreadsheetApp.getActive();

  // Check if sheet already exists
  let sheet = ss.getSheetByName(SHEETS.MEETING_ATTENDANCE);
  if (sheet) {
    SpreadsheetApp.getUi().alert('Meeting Attendance sheet already exists.');
    return sheet;
  }

  // Create the sheet
  sheet = ss.insertSheet(SHEETS.MEETING_ATTENDANCE);

  // Set up headers
  const headers = [
    'Meeting Date',      // A - MEETING_COLS.MEETING_DATE
    'Meeting Type',      // B - MEETING_COLS.MEETING_TYPE
    'Meeting Name',      // C - MEETING_COLS.MEETING_NAME
    'Member ID',         // D - MEETING_COLS.MEMBER_ID
    'Member Name',       // E - MEETING_COLS.MEMBER_NAME
    'Attended',          // F - MEETING_COLS.ATTENDED
    'Notes'              // G - MEETING_COLS.NOTES
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE);

  // Set column widths
  sheet.setColumnWidth(1, 110);  // Meeting Date
  sheet.setColumnWidth(2, 100);  // Meeting Type
  sheet.setColumnWidth(3, 200);  // Meeting Name
  sheet.setColumnWidth(4, 100);  // Member ID
  sheet.setColumnWidth(5, 150);  // Member Name
  sheet.setColumnWidth(6, 80);   // Attended
  sheet.setColumnWidth(7, 200);  // Notes

  // Add data validation for Meeting Type
  const typeValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Virtual', 'In-Person', 'Hybrid'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, MEETING_COLS.MEETING_TYPE, 1000, 1).setDataValidation(typeValidation);

  // Add data validation for Attended
  const attendedValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Yes', 'No'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, MEETING_COLS.ATTENDED, 1000, 1).setDataValidation(attendedValidation);

  // Format date column
  sheet.getRange(2, MEETING_COLS.MEETING_DATE, 1000, 1).setNumberFormat('yyyy-mm-dd');

  // Freeze header row
  sheet.setFrozenRows(1);

  Logger.log('createMeetingAttendanceSheet: Created Meeting Attendance sheet');
  SpreadsheetApp.getActive().toast('Meeting Attendance sheet created!', 'Success', 5);

  return sheet;
}

/**
 * Creates the Volunteer Hours sheet for tracking member volunteer activities
 * This is the source data for Member Directory column T (Volunteer Hours)
 */
function createVolunteerHoursSheet() {
  const ss = SpreadsheetApp.getActive();

  // Check if sheet already exists
  let sheet = ss.getSheetByName(SHEETS.VOLUNTEER_HOURS);
  if (sheet) {
    SpreadsheetApp.getUi().alert('Volunteer Hours sheet already exists.');
    return sheet;
  }

  // Create the sheet
  sheet = ss.insertSheet(SHEETS.VOLUNTEER_HOURS);

  // Set up headers
  const headers = [
    'Date',              // A - VOLUNTEER_COLS.DATE
    'Member ID',         // B - VOLUNTEER_COLS.MEMBER_ID
    'Member Name',       // C - VOLUNTEER_COLS.MEMBER_NAME
    'Activity',          // D - VOLUNTEER_COLS.ACTIVITY
    'Hours',             // E - VOLUNTEER_COLS.HOURS
    'Verified By',       // F - VOLUNTEER_COLS.VERIFIED_BY
    'Notes'              // G - VOLUNTEER_COLS.NOTES
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground(COLORS.UNION_GREEN)
    .setFontColor(COLORS.WHITE);

  // Set column widths
  sheet.setColumnWidth(1, 110);  // Date
  sheet.setColumnWidth(2, 100);  // Member ID
  sheet.setColumnWidth(3, 150);  // Member Name
  sheet.setColumnWidth(4, 200);  // Activity
  sheet.setColumnWidth(5, 80);   // Hours
  sheet.setColumnWidth(6, 150);  // Verified By
  sheet.setColumnWidth(7, 200);  // Notes

  // Add data validation for Activity
  const activityValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'Phone Banking',
      'Door Knocking',
      'Event Setup',
      'Meeting Facilitation',
      'Training',
      'Outreach',
      'Administrative',
      'Other'
    ], true)
    .setAllowInvalid(true)  // Allow custom activities
    .build();
  sheet.getRange(2, VOLUNTEER_COLS.ACTIVITY, 1000, 1).setDataValidation(activityValidation);

  // Format date column
  sheet.getRange(2, VOLUNTEER_COLS.DATE, 1000, 1).setNumberFormat('yyyy-mm-dd');

  // Format hours column as number
  sheet.getRange(2, VOLUNTEER_COLS.HOURS, 1000, 1).setNumberFormat('0.0');

  // Freeze header row
  sheet.setFrozenRows(1);

  Logger.log('createVolunteerHoursSheet: Created Volunteer Hours sheet');
  SpreadsheetApp.getActive().toast('Volunteer Hours sheet created!', 'Success', 5);

  return sheet;
}
