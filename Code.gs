/**
 * 509 Dashboard - Main Entry Point
 *
 * Core setup functions, menu system, and sheet creation.
 *
 * @version 1.0.0
 * @license Free for use by non-profit collective bargaining groups and unions
 */

// ============================================================================
// MENU SYSTEM
// ============================================================================

/**
 * Creates the menu system when the spreadsheet opens
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();

  // Main Dashboard Menu
  ui.createMenu('👤 Dashboard')
    .addItem('🔍 Search Members', 'searchMembers')
    .addItem('📋 View Active Grievances', 'viewActiveGrievances')
    .addItem('📱 Mobile Dashboard', 'showMobileDashboard')
    .addItem('⚡ Quick Actions', 'showQuickActionsMenu')
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Grievance Tools')
      .addItem('➕ Start New Grievance', 'startNewGrievance')
      .addItem('🔄 Refresh Grievance Formulas', 'recalcAllGrievancesBatched')
      .addItem('🔄 Refresh Member Directory Data', 'refreshMemberDirectoryFormulas'))
    .addToUi();

  // Sheet Manager Menu
  ui.createMenu('📊 Sheet Manager')
    .addItem('📊 Rebuild Dashboard', 'rebuildDashboard')
    .addItem('🔄 Refresh All Formulas', 'refreshAllFormulas')
    .addSeparator()
    .addSubMenu(ui.createMenu('📁 Google Drive')
      .addItem('📁 Setup Folder for Grievance', 'setupDriveFolderForGrievance')
      .addItem('📁 View Grievance Files', 'showGrievanceFiles')
      .addItem('📁 Batch Create Folders', 'batchCreateGrievanceFolders'))
    .addSubMenu(ui.createMenu('📅 Calendar')
      .addItem('📅 Sync Deadlines to Calendar', 'syncDeadlinesToCalendar')
      .addItem('📅 View Upcoming Deadlines', 'showUpcomingDeadlinesFromCalendar')
      .addItem('🗑️ Clear Calendar Events', 'clearAllCalendarEvents'))
    .addSubMenu(ui.createMenu('📬 Notifications')
      .addItem('⚙️ Notification Settings', 'showNotificationSettings')
      .addItem('🧪 Test Notifications', 'testDeadlineNotifications'))
    .addToUi();

  // Tools Menu (NEW)
  ui.createMenu('🔧 Tools')
    .addSubMenu(ui.createMenu('♿ ADHD & Accessibility')
      .addItem('♿ ADHD Control Panel', 'showADHDControlPanel')
      .addItem('🎯 Focus Mode', 'activateFocusMode')
      .addItem('🔲 Toggle Zebra Stripes', 'toggleZebraStripes')
      .addItem('📝 Quick Capture', 'showQuickCaptureNotepad')
      .addItem('🍅 Pomodoro Timer', 'startPomodoroTimer'))
    .addSubMenu(ui.createMenu('🎨 Theming')
      .addItem('🎨 Theme Manager', 'showThemeManager')
      .addItem('🌙 Toggle Dark Mode', 'quickToggleDarkMode')
      .addItem('🔄 Reset Theme', 'resetToDefaultTheme'))
    .addSeparator()
    .addSubMenu(ui.createMenu('↩️ Undo/Redo')
      .addItem('↩️ Undo Last Action', 'undoLastAction')
      .addItem('↪️ Redo Action', 'redoLastAction')
      .addItem('📋 View History', 'showUndoRedoPanel')
      .addItem('🗑️ Clear History', 'clearUndoHistory'))
    .addSubMenu(ui.createMenu('🗄️ Cache & Performance')
      .addItem('🗄️ Cache Status', 'showCacheStatusDashboard')
      .addItem('🔥 Warm Up Caches', 'warmUpCaches')
      .addItem('🗑️ Clear All Caches', 'invalidateAllCaches'))
    .addSeparator()
    .addSubMenu(ui.createMenu('✅ Validation')
      .addItem('🔍 Run Bulk Validation', 'runBulkValidation')
      .addItem('⚙️ Validation Settings', 'showValidationSettings')
      .addItem('🧹 Clear Indicators', 'clearValidationIndicators')
      .addItem('⚡ Install Validation Trigger', 'installValidationTrigger'))
    .addToUi();

  // Setup Menu
  ui.createMenu('🏗️ Setup')
    .addItem('🏗️ CREATE 509 DASHBOARD', 'CREATE_509_DASHBOARD')
    .addItem('🔧 REPAIR DASHBOARD', 'REPAIR_DASHBOARD')
    .addSeparator()
    .addItem('⚙️ Setup Data Validations', 'setupDataValidations')
    .addItem('🎨 Setup ADHD Defaults', 'setupADHDDefaults')
    .addToUi();

  // Demo Menu
  ui.createMenu('🎭 Demo')
    .addItem('🚀 Seed All Sample Data', 'SEED_SAMPLE_DATA')
    .addSeparator()
    .addSubMenu(ui.createMenu('🌱 Seed Data')
      .addItem('⚙️ Seed Config Dropdowns Only', 'seedConfigData')
      .addSeparator()
      .addItem('👥 Seed Members (Custom Count)', 'SEED_MEMBERS_DIALOG')
      .addItem('📋 Seed Grievances (Custom Count)', 'SEED_GRIEVANCES_DIALOG')
      .addSeparator()
      .addItem('👥 Seed 50 Members', 'seed50Members')
      .addItem('📋 Seed 25 Grievances', 'seed25Grievances'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🗑️ Nuke Data')
      .addItem('☢️ NUKE ALL DATA', 'NUKE_ALL_DATA')
      .addItem('🧹 Clear Config Dropdowns Only', 'NUKE_CONFIG_DROPDOWNS'))
    .addToUi();

  // Testing Menu (NEW)
  ui.createMenu('🧪 Testing')
    .addItem('🧪 Run All Tests', 'runAllTests')
    .addItem('⚡ Run Quick Tests', 'runQuickTests')
    .addSeparator()
    .addItem('📊 View Test Results', 'viewTestResults')
    .addToUi();

  // Administrator Menu
  ui.createMenu('⚙️ Administrator')
    .addItem('🔍 DIAGNOSE SETUP', 'DIAGNOSE_SETUP')
    .addItem('🔍 Verify Hidden Sheets', 'verifyHiddenSheets')
    .addSeparator()
    .addSubMenu(ui.createMenu('🔧 Setup & Triggers')
      .addItem('🔧 Setup All Hidden Sheets', 'setupAllHiddenSheets')
      .addItem('🔧 Repair All Hidden Sheets', 'repairAllHiddenSheets')
      .addItem('⚡ Install Auto-Sync Trigger', 'installAutoSyncTrigger')
      .addItem('🚫 Remove Auto-Sync Trigger', 'removeAutoSyncTrigger'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🔄 Manual Sync')
      .addItem('🔄 Sync All Data Now', 'syncAllData')
      .addItem('🔄 Sync Grievance → Members', 'syncGrievanceToMemberDirectory')
      .addItem('🔄 Sync Members → Grievances', 'syncMemberToGrievanceLog')
      .addItem('🔄 Sync Steward Workload', 'syncStewardWorkload'))
    .addToUi();
}

// ============================================================================
// MAIN SETUP FUNCTION
// ============================================================================

/**
 * Main setup function - creates the complete 509 Dashboard
 * Creates all 22 sheets with proper structure and formatting
 */
function CREATE_509_DASHBOARD() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  // Confirm with user
  var response = ui.alert(
    '🏗️ Create 509 Dashboard',
    'This will create the complete 509 Dashboard with all 22 sheets.\n\n' +
    'Existing sheets with matching names will be recreated.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    ui.alert('Setup cancelled.');
    return;
  }

  ss.toast('Starting dashboard creation...', '🏗️ Setup', 5);

  try {
    // Create sheets in order
    createConfigSheet(ss);
    ss.toast('Created Config sheet', '🏗️ Progress', 2);

    createMemberDirectory(ss);
    ss.toast('Created Member Directory', '🏗️ Progress', 2);

    createGrievanceLog(ss);
    ss.toast('Created Grievance Log', '🏗️ Progress', 2);

    createDashboard(ss);
    ss.toast('Created Dashboard', '🏗️ Progress', 2);

    createAnalyticsData(ss);
    createMemberSatisfaction(ss);
    createFeedback(ss);
    createInteractiveDashboard(ss);
    createGettingStarted(ss);
    createFAQ(ss);
    createUserSettings(ss);
    createStewardWorkload(ss);
    createTrends(ss);
    createLocationAnalytics(ss);
    createTypeAnalysis(ss);
    createExecutiveDashboard(ss);
    createKPIDashboard(ss);
    createEngagement(ss);
    createCostImpact(ss);
    createArchive(ss);
    createDiagnostics(ss);
    createAuditLog(ss);

    ss.toast('Created all sheets, setting up validations...', '🏗️ Progress', 3);

    // Setup data validations
    setupDataValidations();

    // Setup hidden calculation sheets
    setupHiddenSheets(ss);

    // Move Config to first position
    var configSheet = ss.getSheetByName(SHEETS.CONFIG);
    if (configSheet) {
      ss.setActiveSheet(configSheet);
      ss.moveActiveSheet(1);
    }

    ss.toast('Dashboard creation complete!', '✅ Success', 5);
    ui.alert('✅ Success', '509 Dashboard has been created successfully!\n\n' +
      '22 sheets created with all validations and formulas.\n\n' +
      'Use the Demo menu to seed sample data.', ui.ButtonSet.OK);

  } catch (error) {
    Logger.log('Error in CREATE_509_DASHBOARD: ' + error.message);
    ui.alert('❌ Error', 'An error occurred: ' + error.message, ui.ButtonSet.OK);
  }
}

// ============================================================================
// SHEET CREATION FUNCTIONS
// ============================================================================

/**
 * Create or recreate the Config sheet with dropdown values
 */
function createConfigSheet(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.CONFIG);
  sheet.clear();

  // Set headers
  var headers = [
    'Job Titles', 'Office Locations', 'Units', 'Office Days', 'Yes/No',
    'Supervisors', 'Managers', 'Stewards', 'Grievance Status', 'Grievance Step',
    'Issue Category', 'Articles Violated', 'Communication Methods', '', 'Grievance Coordinators'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  // Add default values for non-user-populated columns
  var col = CONFIG_COLS.OFFICE_DAYS;
  sheet.getRange(2, col, DEFAULT_CONFIG.OFFICE_DAYS.length, 1)
    .setValues(DEFAULT_CONFIG.OFFICE_DAYS.map(function(v) { return [v]; }));

  col = CONFIG_COLS.YES_NO;
  sheet.getRange(2, col, DEFAULT_CONFIG.YES_NO.length, 1)
    .setValues(DEFAULT_CONFIG.YES_NO.map(function(v) { return [v]; }));

  col = CONFIG_COLS.GRIEVANCE_STATUS;
  sheet.getRange(2, col, DEFAULT_CONFIG.GRIEVANCE_STATUS.length, 1)
    .setValues(DEFAULT_CONFIG.GRIEVANCE_STATUS.map(function(v) { return [v]; }));

  col = CONFIG_COLS.GRIEVANCE_STEP;
  sheet.getRange(2, col, DEFAULT_CONFIG.GRIEVANCE_STEP.length, 1)
    .setValues(DEFAULT_CONFIG.GRIEVANCE_STEP.map(function(v) { return [v]; }));

  col = CONFIG_COLS.ISSUE_CATEGORY;
  sheet.getRange(2, col, DEFAULT_CONFIG.ISSUE_CATEGORY.length, 1)
    .setValues(DEFAULT_CONFIG.ISSUE_CATEGORY.map(function(v) { return [v]; }));

  col = CONFIG_COLS.ARTICLES;
  sheet.getRange(2, col, DEFAULT_CONFIG.ARTICLES.length, 1)
    .setValues(DEFAULT_CONFIG.ARTICLES.map(function(v) { return [v]; }));

  col = CONFIG_COLS.COMM_METHODS;
  sheet.getRange(2, col, DEFAULT_CONFIG.COMM_METHODS.length, 1)
    .setValues(DEFAULT_CONFIG.COMM_METHODS.map(function(v) { return [v]; }));

  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create or recreate the Member Directory sheet
 */
function createMemberDirectory(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.MEMBER_DIR);
  sheet.clear();

  var headers = getMemberHeaders();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  // Freeze header row
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(MEMBER_COLS.MEMBER_ID, 100);
  sheet.setColumnWidth(MEMBER_COLS.FIRST_NAME, 120);
  sheet.setColumnWidth(MEMBER_COLS.LAST_NAME, 120);
  sheet.setColumnWidth(MEMBER_COLS.EMAIL, 200);
  sheet.setColumnWidth(MEMBER_COLS.CONTACT_NOTES, 250);

  // Add checkbox for Start Grievance column
  var checkboxRange = sheet.getRange(2, MEMBER_COLS.START_GRIEVANCE, 998, 1);
  checkboxRange.insertCheckboxes();

  // Auto-resize other columns
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create or recreate the Grievance Log sheet
 */
function createGrievanceLog(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.GRIEVANCE_LOG);
  sheet.clear();

  var headers = getGrievanceHeaders();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  // Freeze header row
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(GRIEVANCE_COLS.GRIEVANCE_ID, 100);
  sheet.setColumnWidth(GRIEVANCE_COLS.RESOLUTION, 250);
  sheet.setColumnWidth(GRIEVANCE_COLS.COORDINATOR_MESSAGE, 250);

  // Add checkbox for Message Alert column
  var checkboxRange = sheet.getRange(2, GRIEVANCE_COLS.MESSAGE_ALERT, 998, 1);
  checkboxRange.insertCheckboxes();

  // Auto-resize other columns
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create the main Dashboard sheet
 */
function createDashboard(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.DASHBOARD);
  sheet.clear();

  // Title
  sheet.getRange('A1').setValue('📊 LOCAL 509 DASHBOARD')
    .setFontSize(24)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);
  sheet.getRange('A1:H1').merge();

  // Member Metrics Section
  sheet.getRange('A3').setValue('MEMBER METRICS')
    .setFontWeight('bold')
    .setBackground(COLORS.LIGHT_GRAY);
  sheet.getRange('A3:D3').merge();

  var memberMetrics = [
    ['Total Members', 'Active Stewards', 'Avg Open Rate', 'YTD Vol. Hours'],
    [
      '=COUNTA(\'' + SHEETS.MEMBER_DIR + '\'!' + getColumnLetter(MEMBER_COLS.MEMBER_ID) + ':' + getColumnLetter(MEMBER_COLS.MEMBER_ID) + ')-1',
      '=COUNTIF(\'' + SHEETS.MEMBER_DIR + '\'!' + getColumnLetter(MEMBER_COLS.IS_STEWARD) + ':' + getColumnLetter(MEMBER_COLS.IS_STEWARD) + ',"Yes")',
      '=IFERROR(AVERAGE(\'' + SHEETS.MEMBER_DIR + '\'!' + getColumnLetter(MEMBER_COLS.OPEN_RATE) + ':' + getColumnLetter(MEMBER_COLS.OPEN_RATE) + '),0)',
      '=SUM(\'' + SHEETS.MEMBER_DIR + '\'!' + getColumnLetter(MEMBER_COLS.VOLUNTEER_HOURS) + ':' + getColumnLetter(MEMBER_COLS.VOLUNTEER_HOURS) + ')'
    ]
  ];
  sheet.getRange('A4:D5').setValues(memberMetrics);
  sheet.getRange('A4:D4').setFontWeight('bold').setBackground(COLORS.PRIMARY_BLUE);
  sheet.getRange('A5:D5').setFontSize(18).setHorizontalAlignment('center');

  // Grievance Metrics Section
  sheet.getRange('A7').setValue('GRIEVANCE METRICS')
    .setFontWeight('bold')
    .setBackground(COLORS.LIGHT_GRAY);
  sheet.getRange('A7:D7').merge();

  var statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  var grievanceMetrics = [
    ['Open Grievances', 'Pending Info', 'Settled (This Month)', 'Avg Days Open'],
    [
      '=COUNTIF(\'' + SHEETS.GRIEVANCE_LOG + '\'!' + statusCol + ':' + statusCol + ',"Open")',
      '=COUNTIF(\'' + SHEETS.GRIEVANCE_LOG + '\'!' + statusCol + ':' + statusCol + ',"Pending Info")',
      '=COUNTIFS(\'' + SHEETS.GRIEVANCE_LOG + '\'!' + statusCol + ':' + statusCol + ',"Settled",\'' + SHEETS.GRIEVANCE_LOG + '\'!' + getColumnLetter(GRIEVANCE_COLS.DATE_CLOSED) + ':' + getColumnLetter(GRIEVANCE_COLS.DATE_CLOSED) + ',">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))',
      '=IFERROR(AVERAGE(\'' + SHEETS.GRIEVANCE_LOG + '\'!' + getColumnLetter(GRIEVANCE_COLS.DAYS_OPEN) + ':' + getColumnLetter(GRIEVANCE_COLS.DAYS_OPEN) + '),0)'
    ]
  ];
  sheet.getRange('A8:D9').setValues(grievanceMetrics);
  sheet.getRange('A8:D8').setFontWeight('bold').setBackground(COLORS.PRIMARY_BLUE);
  sheet.getRange('A9:D9').setFontSize(18).setHorizontalAlignment('center');

  sheet.autoResizeColumns(1, 8);
}

/**
 * Create Analytics Data sheet (hidden)
 */
function createAnalyticsData(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.ANALYTICS_DATA);
  sheet.clear();
  sheet.getRange('A1').setValue('Analytics Data - Auto-Generated')
    .setFontWeight('bold');
  sheet.hideSheet();
}

/**
 * Create Member Satisfaction sheet
 */
function createMemberSatisfaction(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.MEMBER_SATISFACTION);
  sheet.clear();

  var headers = ['Survey Date', 'Member ID', 'Member Name', 'Overall Satisfaction', 'Steward Support', 'Communication', 'Comments'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Feedback & Development sheet
 */
function createFeedback(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.FEEDBACK);
  sheet.clear();

  var headers = ['Date', 'Type', 'Title', 'Description', 'Status', 'Priority', 'Submitted By'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Interactive Dashboard sheet
 */
function createInteractiveDashboard(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.INTERACTIVE);
  sheet.clear();

  sheet.getRange('A1').setValue('🎯 Interactive Dashboard')
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);
  sheet.getRange('A1:F1').merge();

  sheet.getRange('A3').setValue('Select metrics and chart types using the dropdowns below.');
  sheet.getRange('A3:F3').merge();

  // Dropdown labels
  sheet.getRange('A5:F5').setValues([['Metric 1', 'Chart Type 1', 'Metric 2', 'Chart Type 2', 'Theme', 'Show Comparison']]);
  sheet.getRange('A5:F5').setFontWeight('bold').setBackground(COLORS.LIGHT_GRAY);

  // Placeholder for dropdowns (will be set up by setupInteractiveDashboardLiveSync)
  sheet.getRange('A7:F7').setValues([['Total Members', 'Donut', 'Open Grievances', 'Bar', 'Default', 'Yes']]);
}

/**
 * Create Getting Started sheet
 */
function createGettingStarted(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.GETTING_STARTED);
  sheet.clear();

  sheet.getRange('A1').setValue('📚 Getting Started with 509 Dashboard')
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);

  var content = [
    [''],
    ['Welcome to the 509 Dashboard! This guide will help you get started.'],
    [''],
    ['QUICK START:'],
    ['1. Go to Config sheet and add your organization\'s Job Titles, Locations, Units, etc.'],
    ['2. Add members to the Member Directory sheet'],
    ['3. Create grievances using the Start Grievance checkbox or Dashboard menu'],
    ['4. View metrics on the Dashboard and Executive Dashboard sheets'],
    [''],
    ['For more help, see the FAQ sheet or contact your administrator.']
  ];

  sheet.getRange(2, 1, content.length, 1).setValues(content);
  sheet.setColumnWidth(1, 600);
}

/**
 * Create FAQ sheet
 */
function createFAQ(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.FAQ);
  sheet.clear();

  sheet.getRange('A1').setValue('❓ Frequently Asked Questions')
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);

  var headers = ['Category', 'Question', 'Answer'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  var faqs = [
    ['Getting Started', 'How do I start a new grievance?', 'Go to Dashboard menu → Grievance Tools → Start New Grievance, or check the "Start Grievance" checkbox in Member Directory.'],
    ['Getting Started', 'How do I add a new member?', 'Go to the Member Directory sheet and add a new row with the member\'s information.'],
    ['Grievances', 'What do the deadline colors mean?', 'Red = Overdue, Orange = Due within 3 days, Yellow = Due within 7 days, Green = On track.'],
    ['Grievances', 'How are deadlines calculated?', 'Filing Deadline = Incident Date + 21 days. Step deadlines follow CBA timelines.']
  ];
  sheet.getRange(4, 1, faqs.length, 3).setValues(faqs);

  sheet.setFrozenRows(3);
  sheet.setColumnWidth(3, 500);
  sheet.autoResizeColumns(1, 2);
}

/**
 * Create User Settings sheet
 */
function createUserSettings(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.USER_SETTINGS);
  sheet.clear();

  sheet.getRange('A1').setValue('⚙️ User Settings')
    .setFontSize(20)
    .setFontWeight('bold');

  var headers = ['User Email', 'Theme', 'Notifications', 'Default View', 'Last Login'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Steward Workload sheet
 */
function createStewardWorkload(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.STEWARD_WORKLOAD);
  sheet.clear();

  sheet.getRange('A1').setValue('👨‍⚖️ Steward Workload')
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);

  var headers = ['Steward Name', 'Total Cases', 'Active Cases', 'Resolved', 'Win Rate', 'Avg Days', 'Overdue', 'Due This Week', 'Capacity Status'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Trends & Timeline sheet
 */
function createTrends(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.TRENDS);
  sheet.clear();

  sheet.getRange('A1').setValue('📈 Trends & Timeline')
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);

  var headers = ['Month', 'New Grievances', 'Resolved', 'Win Rate', 'Avg Resolution Days', 'Active at Month End'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Location Analytics sheet
 */
function createLocationAnalytics(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.LOCATION_ANALYTICS);
  sheet.clear();

  sheet.getRange('A1').setValue('🗺️ Location Analytics')
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);

  var headers = ['Location', 'Members', 'Grievances', 'Win Rate', 'Avg Satisfaction'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Type Analysis sheet
 */
function createTypeAnalysis(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.TYPE_ANALYSIS);
  sheet.clear();

  sheet.getRange('A1').setValue('📊 Type Analysis')
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);

  var headers = ['Issue Category', 'Total Cases', 'Open', 'Resolved', 'Win Rate', 'Avg Days to Resolution'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Executive Dashboard sheet
 */
function createExecutiveDashboard(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.EXECUTIVE);
  sheet.clear();

  sheet.getRange('A1').setValue('💼 Executive Dashboard')
    .setFontSize(24)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);
  sheet.getRange('A1:F1').merge();

  // Quick Stats Section
  sheet.getRange('A3').setValue('QUICK STATS')
    .setFontWeight('bold')
    .setBackground(COLORS.UNION_GREEN)
    .setFontColor(COLORS.WHITE);
  sheet.getRange('A3:C3').merge();

  var statsLabels = [
    ['Total Members', 'Active Grievances', 'Win Rate'],
    [
      '=COUNTA(\'' + SHEETS.MEMBER_DIR + '\'!' + getColumnLetter(MEMBER_COLS.MEMBER_ID) + ':' + getColumnLetter(MEMBER_COLS.MEMBER_ID) + ')-1',
      '=COUNTIF(\'' + SHEETS.GRIEVANCE_LOG + '\'!' + getColumnLetter(GRIEVANCE_COLS.STATUS) + ':' + getColumnLetter(GRIEVANCE_COLS.STATUS) + ',"Open")+COUNTIF(\'' + SHEETS.GRIEVANCE_LOG + '\'!' + getColumnLetter(GRIEVANCE_COLS.STATUS) + ':' + getColumnLetter(GRIEVANCE_COLS.STATUS) + ',"Pending Info")',
      '=IFERROR(COUNTIF(\'' + SHEETS.GRIEVANCE_LOG + '\'!' + getColumnLetter(GRIEVANCE_COLS.RESOLUTION) + ':' + getColumnLetter(GRIEVANCE_COLS.RESOLUTION) + ',"*Won*")/COUNTIF(\'' + SHEETS.GRIEVANCE_LOG + '\'!' + getColumnLetter(GRIEVANCE_COLS.STATUS) + ':' + getColumnLetter(GRIEVANCE_COLS.STATUS) + ',"<>"),0)'
    ]
  ];
  sheet.getRange('A4:C5').setValues(statsLabels);
  sheet.getRange('A4:C4').setFontWeight('bold').setBackground(COLORS.LIGHT_GRAY);
  sheet.getRange('A5:C5').setFontSize(20).setHorizontalAlignment('center');

  sheet.autoResizeColumns(1, 6);
}

/**
 * Create KPI Performance Dashboard sheet
 */
function createKPIDashboard(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.KPI);
  sheet.clear();

  sheet.getRange('A1').setValue('📊 KPI Performance Dashboard')
    .setFontSize(24)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);
  sheet.getRange('A1:L1').merge();

  var headers = ['KPI Name', 'Current Value', 'Target', 'Variance', '% Change', 'Status', 'Last Month', 'YTD Average', 'Best', 'Worst', 'Owner', 'Last Updated'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Member Engagement sheet
 */
function createEngagement(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.ENGAGEMENT);
  sheet.clear();

  sheet.getRange('A1').setValue('👥 Member Engagement')
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);

  var headers = ['Member ID', 'Member Name', 'Engagement Score', 'Last Contact', 'Meetings Attended', 'Volunteer Hours', 'Interests', 'Status'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Cost Impact sheet
 */
function createCostImpact(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.COST_IMPACT);
  sheet.clear();

  sheet.getRange('A1').setValue('💰 Cost Impact Analysis')
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);

  var headers = ['Category', 'Grievances Won', 'Est. Value Recovered', 'Hours Invested', 'Cost per Case', 'ROI'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Archive sheet
 */
function createArchive(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.ARCHIVE);
  sheet.clear();

  var headers = ['Item Type', 'Item ID', 'Archive Date', 'Reason', 'Archived By', 'Original Data'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(1);
  sheet.setColumnWidth(6, 500);
  sheet.autoResizeColumns(1, 5);
}

/**
 * Create Diagnostics sheet
 */
function createDiagnostics(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.DIAGNOSTICS);
  sheet.clear();

  sheet.getRange('A1').setValue('🔧 System Diagnostics')
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(COLORS.PRIMARY_PURPLE);

  var headers = ['Check', 'Status', 'Details', 'Last Run'];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(3);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Create Audit Log sheet
 */
function createAuditLog(ss) {
  var sheet = getOrCreateSheet(ss, SHEETS.AUDIT_LOG);
  sheet.clear();

  var headers = ['Timestamp', 'User', 'Action', 'Sheet', 'Row', 'Column', 'Old Value', 'New Value', 'Details'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setBackground(COLORS.SOLIDARITY_RED)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold');

  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get existing sheet or create new one
 * @param {Spreadsheet} ss - Spreadsheet object
 * @param {string} name - Sheet name
 * @returns {Sheet} Sheet object
 */
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  return ss.insertSheet(name);
}

/**
 * Setup hidden calculation sheets for cross-sheet data sync
 * Calls the full implementation in HiddenSheets.gs
 */
function setupHiddenSheets(ss) {
  // Call the full hidden sheet setup from HiddenSheets.gs
  setupAllHiddenSheets();

  // Install the auto-sync trigger
  installAutoSyncTrigger();
}

// ============================================================================
// DATA VALIDATION
// ============================================================================

/**
 * Setup all data validations for Member Directory and Grievance Log
 */
function setupDataValidations() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName(SHEETS.CONFIG);
  var memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  var grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!configSheet || !memberSheet || !grievanceSheet) {
    SpreadsheetApp.getUi().alert('Error: Required sheets not found. Please run CREATE_509_DASHBOARD first.');
    return;
  }

  // Member Directory Validations
  setDropdownValidation(memberSheet, MEMBER_COLS.JOB_TITLE, configSheet, CONFIG_COLS.JOB_TITLES);
  setDropdownValidation(memberSheet, MEMBER_COLS.WORK_LOCATION, configSheet, CONFIG_COLS.OFFICE_LOCATIONS);
  setDropdownValidation(memberSheet, MEMBER_COLS.UNIT, configSheet, CONFIG_COLS.UNITS);
  setDropdownValidation(memberSheet, MEMBER_COLS.OFFICE_DAYS, configSheet, CONFIG_COLS.OFFICE_DAYS);
  setDropdownValidation(memberSheet, MEMBER_COLS.IS_STEWARD, configSheet, CONFIG_COLS.YES_NO);
  setDropdownValidation(memberSheet, MEMBER_COLS.SUPERVISOR, configSheet, CONFIG_COLS.SUPERVISORS);
  setDropdownValidation(memberSheet, MEMBER_COLS.MANAGER, configSheet, CONFIG_COLS.MANAGERS);
  setDropdownValidation(memberSheet, MEMBER_COLS.ASSIGNED_STEWARD, configSheet, CONFIG_COLS.STEWARDS);
  setDropdownValidation(memberSheet, MEMBER_COLS.INTEREST_LOCAL, configSheet, CONFIG_COLS.YES_NO);
  setDropdownValidation(memberSheet, MEMBER_COLS.INTEREST_CHAPTER, configSheet, CONFIG_COLS.YES_NO);
  setDropdownValidation(memberSheet, MEMBER_COLS.INTEREST_ALLIED, configSheet, CONFIG_COLS.YES_NO);
  setDropdownValidation(memberSheet, MEMBER_COLS.CONTACT_STEWARD, configSheet, CONFIG_COLS.STEWARDS);

  // Grievance Log Validations
  setDropdownValidation(grievanceSheet, GRIEVANCE_COLS.STATUS, configSheet, CONFIG_COLS.GRIEVANCE_STATUS);
  setDropdownValidation(grievanceSheet, GRIEVANCE_COLS.CURRENT_STEP, configSheet, CONFIG_COLS.GRIEVANCE_STEP);
  setDropdownValidation(grievanceSheet, GRIEVANCE_COLS.ISSUE_CATEGORY, configSheet, CONFIG_COLS.ISSUE_CATEGORY);
  setDropdownValidation(grievanceSheet, GRIEVANCE_COLS.ARTICLES, configSheet, CONFIG_COLS.ARTICLES);
  setDropdownValidation(grievanceSheet, GRIEVANCE_COLS.UNIT, configSheet, CONFIG_COLS.UNITS);
  setDropdownValidation(grievanceSheet, GRIEVANCE_COLS.LOCATION, configSheet, CONFIG_COLS.OFFICE_LOCATIONS);
  setDropdownValidation(grievanceSheet, GRIEVANCE_COLS.STEWARD, configSheet, CONFIG_COLS.STEWARDS);

  SpreadsheetApp.getActiveSpreadsheet().toast('Data validations applied successfully!', '✅ Success', 3);
}

/**
 * Set dropdown validation from Config sheet
 * @param {Sheet} targetSheet - Sheet to apply validation
 * @param {number} targetCol - Column number in target sheet
 * @param {Sheet} configSheet - Config sheet with source values
 * @param {number} sourceCol - Column number in Config sheet
 */
function setDropdownValidation(targetSheet, targetCol, configSheet, sourceCol) {
  var sourceRange = configSheet.getRange(2, sourceCol, 100, 1);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(sourceRange, true)
    .setAllowInvalid(false)
    .build();

  var targetRange = targetSheet.getRange(2, targetCol, 998, 1);
  targetRange.setDataValidation(rule);
}

// ============================================================================
// DIAGNOSE FUNCTION
// ============================================================================

/**
 * System health check - validates sheets and column counts
 */
function DIAGNOSE_SETUP() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var report = [];

  report.push('🔍 509 DASHBOARD DIAGNOSTIC REPORT');
  report.push('================================');
  report.push('');

  // Check all required sheets
  var requiredSheets = [
    SHEETS.CONFIG,
    SHEETS.MEMBER_DIR,
    SHEETS.GRIEVANCE_LOG,
    SHEETS.DASHBOARD
  ];

  report.push('📋 SHEET CHECK:');
  var allSheetsPresent = true;
  requiredSheets.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      report.push('  ✅ ' + sheetName);
    } else {
      report.push('  ❌ ' + sheetName + ' - MISSING');
      allSheetsPresent = false;
    }
  });

  report.push('');

  // Check column counts
  report.push('📊 COLUMN CHECK:');

  var memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  if (memberSheet) {
    var memberCols = memberSheet.getLastColumn();
    var expectedMemberCols = 31;
    if (memberCols >= expectedMemberCols) {
      report.push('  ✅ Member Directory: ' + memberCols + ' columns (expected ' + expectedMemberCols + ')');
    } else {
      report.push('  ⚠️ Member Directory: ' + memberCols + ' columns (expected ' + expectedMemberCols + ')');
    }
  }

  var grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (grievanceSheet) {
    var grievanceCols = grievanceSheet.getLastColumn();
    var expectedGrievanceCols = 34;
    if (grievanceCols >= expectedGrievanceCols) {
      report.push('  ✅ Grievance Log: ' + grievanceCols + ' columns (expected ' + expectedGrievanceCols + ')');
    } else {
      report.push('  ⚠️ Grievance Log: ' + grievanceCols + ' columns (expected ' + expectedGrievanceCols + ')');
    }
  }

  report.push('');

  // Check hidden sheets
  report.push('🔒 HIDDEN SHEETS:');
  var hiddenSheets = [
    SHEETS.GRIEVANCE_CALC,
    SHEETS.MEMBER_LOOKUP,
    SHEETS.STEWARD_CONTACT_CALC,
    SHEETS.ENGAGEMENT_CALC,
    SHEETS.STEWARD_WORKLOAD_CALC,
    SHEETS.INTERACTIVE_CALC
  ];

  hiddenSheets.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      report.push('  ✅ ' + sheetName + (sheet.isSheetHidden() ? ' (hidden)' : ' (visible)'));
    } else {
      report.push('  ⚠️ ' + sheetName + ' - not created');
    }
  });

  report.push('');
  report.push('================================');
  report.push(allSheetsPresent ? '✅ Core sheets OK' : '❌ Some sheets missing');

  // Display report
  ui.alert('Diagnostic Report', report.join('\n'), ui.ButtonSet.OK);

  // Also log it
  Logger.log(report.join('\n'));
}

// ============================================================================
// REPAIR FUNCTION
// ============================================================================

/**
 * Repair dashboard - recreates hidden sheets, triggers, and syncs data
 */
function REPAIR_DASHBOARD() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  var response = ui.alert(
    '🔧 Repair Dashboard',
    'This will:\n\n' +
    '• Recreate all 6 hidden calculation sheets with formulas\n' +
    '• Install auto-sync trigger\n' +
    '• Sync all cross-sheet data\n' +
    '• Reapply data validations\n\n' +
    'Your data will NOT be affected.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  ss.toast('Repairing dashboard...', '🔧 Repair', 3);

  try {
    // Use the full repair function from HiddenSheets.gs
    repairAllHiddenSheets();

    // Also reapply data validations
    setupDataValidations();

    // Final message handled by repairAllHiddenSheets
  } catch (error) {
    Logger.log('Error in REPAIR_DASHBOARD: ' + error.message);
    ui.alert('❌ Error', 'Repair failed: ' + error.message, ui.ButtonSet.OK);
  }
}

// ============================================================================
// MENU HANDLER FUNCTIONS
// ============================================================================

function searchMembers() {
  SpreadsheetApp.getUi().alert('Search Members feature - Coming soon!');
}

function viewActiveGrievances() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (sheet) {
    ss.setActiveSheet(sheet);
  }
}

function startNewGrievance() {
  SpreadsheetApp.getUi().alert('Start New Grievance feature - Coming soon!\n\nFor now, add grievances directly to the Grievance Log sheet.');
}

/**
 * Recalculate all grievance deadlines and sync to Member Directory
 */
function recalcAllGrievancesBatched() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Recalculating grievances and syncing...', '🔄 Refresh', 3);

  // Sync grievance data to member directory
  syncGrievanceToMemberDirectory();

  ss.toast('Grievance data refreshed!', '✅ Success', 3);
}

/**
 * Refresh Member Directory calculated columns
 */
function refreshMemberDirectoryFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Refreshing Member Directory...', '🔄 Refresh', 3);

  // Sync grievance data to member directory
  syncGrievanceToMemberDirectory();

  ss.toast('Member Directory refreshed!', '✅ Success', 3);
}

function rebuildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  createDashboard(ss);
  ss.toast('Dashboard rebuilt!', '✅ Success', 3);
}

/**
 * Refresh all formulas and sync all data
 */
function refreshAllFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Refreshing all formulas and syncing data...', '🔄 Refresh', 3);

  // Use the full refresh from HiddenSheets.gs
  refreshAllHiddenFormulas();
}

function viewTestResults() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.TEST_RESULTS);
  if (sheet) {
    ss.setActiveSheet(sheet);
  } else {
    SpreadsheetApp.getUi().alert('No test results yet. Run tests first using 🧪 Testing menu.');
  }
}
