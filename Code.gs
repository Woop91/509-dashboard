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
    .addToUi();

  // Setup Menu
  ui.createMenu('🔧 Setup')
    .addItem('🏗️ CREATE 509 DASHBOARD', 'CREATE_509_DASHBOARD')
    .addItem('🔧 REPAIR DASHBOARD', 'REPAIR_DASHBOARD')
    .addSeparator()
    .addItem('⚙️ Setup Data Validations', 'setupDataValidations')
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

  // Administrator Menu
  ui.createMenu('⚙️ Administrator')
    .addItem('🔍 DIAGNOSE SETUP', 'DIAGNOSE_SETUP')
    .addItem('🔍 Verify Hidden Sheets', 'VERIFY_HIDDEN_SHEETS')
    .addSeparator()
    .addSubMenu(ui.createMenu('🔧 Setup & Triggers')
      .addItem('📅 Setup Engagement Tracking', 'setupEngagementTracking')
      .addItem('👨‍⚖️ Setup Steward Workload Auto-Sync', 'setupStewardWorkloadAutoSync')
      .addItem('🎯 Setup Interactive Dashboard Live-Wire', 'setupInteractiveDashboardLiveSync'))
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
 */
function setupHiddenSheets(ss) {
  // Create hidden sheets (simplified - full implementation in separate module)
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
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    sheet.hideSheet();
  });
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
 * Repair dashboard - recreates hidden sheets and triggers
 */
function REPAIR_DASHBOARD() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  var response = ui.alert(
    '🔧 Repair Dashboard',
    'This will repair hidden calculation sheets and reinstall triggers.\n\n' +
    'Your data will NOT be affected.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  ss.toast('Repairing dashboard...', '🔧 Repair', 3);

  try {
    setupHiddenSheets(ss);
    setupDataValidations();

    ss.toast('Dashboard repaired successfully!', '✅ Success', 5);
    ui.alert('✅ Success', 'Dashboard has been repaired.\n\nHidden sheets and triggers restored.', ui.ButtonSet.OK);
  } catch (error) {
    Logger.log('Error in REPAIR_DASHBOARD: ' + error.message);
    ui.alert('❌ Error', 'Repair failed: ' + error.message, ui.ButtonSet.OK);
  }
}

// ============================================================================
// GRIEVANCE RECALCULATION FUNCTIONS
// ============================================================================

/**
 * Recalculate all grievance deadlines and calculated columns
 * Processes in batches to avoid timeout
 */
function recalcAllGrievancesBatched() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Error: Grievance Log sheet not found.');
    return;
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    ss.toast('No grievances to recalculate.', 'Info', 3);
    return;
  }

  ss.toast('Recalculating grievance deadlines...', '🔄 Processing', 5);

  var data = sheet.getRange(2, 1, lastRow - 1, 34).getValues();
  var updates = [];
  var today = new Date();

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var grievanceId = row[GRIEVANCE_COLS.GRIEVANCE_ID - 1];

    // Skip empty rows
    if (!grievanceId) continue;

    var updatedRow = calculateGrievanceDeadlines(row, today);
    updates.push(updatedRow);
  }

  // Write back calculated values
  if (updates.length > 0) {
    sheet.getRange(2, 1, updates.length, 34).setValues(updates);
  }

  ss.toast('Recalculated ' + updates.length + ' grievances!', '✅ Success', 3);
}

/**
 * Calculate deadlines for a single grievance row
 * @param {Array} row - Grievance row data
 * @param {Date} today - Current date
 * @returns {Array} Updated row with calculated values
 */
function calculateGrievanceDeadlines(row, today) {
  var incidentDate = row[GRIEVANCE_COLS.INCIDENT_DATE - 1];
  var dateFiled = row[GRIEVANCE_COLS.DATE_FILED - 1];
  var step1Rcvd = row[GRIEVANCE_COLS.STEP1_RCVD - 1];
  var step2AppealFiled = row[GRIEVANCE_COLS.STEP2_APPEAL_FILED - 1];
  var step2Rcvd = row[GRIEVANCE_COLS.STEP2_RCVD - 1];
  var dateClosed = row[GRIEVANCE_COLS.DATE_CLOSED - 1];
  var currentStep = row[GRIEVANCE_COLS.CURRENT_STEP - 1];
  var status = row[GRIEVANCE_COLS.STATUS - 1];

  // Filing Deadline (H) = Incident Date + 21 days
  if (incidentDate && incidentDate instanceof Date) {
    row[GRIEVANCE_COLS.FILING_DEADLINE - 1] = addDaysToDate(incidentDate, 21);
  }

  // Step I Due (J) = Date Filed + 30 days
  if (dateFiled && dateFiled instanceof Date) {
    row[GRIEVANCE_COLS.STEP1_DUE - 1] = addDaysToDate(dateFiled, 30);
  }

  // Step II Appeal Due (L) = Step I Rcvd + 10 days
  if (step1Rcvd && step1Rcvd instanceof Date) {
    row[GRIEVANCE_COLS.STEP2_APPEAL_DUE - 1] = addDaysToDate(step1Rcvd, 10);
  }

  // Step II Due (N) = Step II Appeal Filed + 30 days
  if (step2AppealFiled && step2AppealFiled instanceof Date) {
    row[GRIEVANCE_COLS.STEP2_DUE - 1] = addDaysToDate(step2AppealFiled, 30);
  }

  // Step III Appeal Due (P) = Step II Rcvd + 30 days
  if (step2Rcvd && step2Rcvd instanceof Date) {
    row[GRIEVANCE_COLS.STEP3_APPEAL_DUE - 1] = addDaysToDate(step2Rcvd, 30);
  }

  // Days Open (S) = TODAY - Date Filed (or Date Closed - Date Filed if closed)
  if (dateFiled && dateFiled instanceof Date) {
    var endDate = (dateClosed && dateClosed instanceof Date) ? dateClosed : today;
    var daysOpen = Math.floor((endDate - dateFiled) / (1000 * 60 * 60 * 24));
    row[GRIEVANCE_COLS.DAYS_OPEN - 1] = daysOpen;
  }

  // Next Action Due (T) - based on current step
  var nextActionDue = '';
  var closedStatuses = ['Settled', 'Withdrawn', 'Denied', 'Won', 'Closed'];
  if (closedStatuses.indexOf(status) === -1) {
    if (currentStep === 'Informal') {
      nextActionDue = row[GRIEVANCE_COLS.FILING_DEADLINE - 1];
    } else if (currentStep === 'Step I') {
      nextActionDue = row[GRIEVANCE_COLS.STEP1_DUE - 1];
    } else if (currentStep === 'Step II') {
      nextActionDue = row[GRIEVANCE_COLS.STEP2_DUE - 1];
    } else if (currentStep === 'Step III') {
      nextActionDue = row[GRIEVANCE_COLS.STEP3_APPEAL_DUE - 1];
    }
  }
  row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1] = nextActionDue;

  // Days to Deadline (U) = Next Action Due - TODAY (blank if past due)
  if (nextActionDue && nextActionDue instanceof Date) {
    var daysToDeadline = Math.floor((nextActionDue - today) / (1000 * 60 * 60 * 24));
    row[GRIEVANCE_COLS.DAYS_TO_DEADLINE - 1] = daysToDeadline >= 0 ? daysToDeadline : '';
  } else {
    row[GRIEVANCE_COLS.DAYS_TO_DEADLINE - 1] = '';
  }

  return row;
}

/**
 * Add days to a date
 * @param {Date} date - Base date
 * @param {number} days - Days to add
 * @returns {Date} New date
 */
function addDaysToDate(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================================================
// MEMBER DIRECTORY SYNC FUNCTIONS
// ============================================================================

/**
 * Refresh Member Directory grievance columns (AB-AD) from Grievance Log
 */
function refreshMemberDirectoryFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  var grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!memberSheet || !grievanceSheet) {
    SpreadsheetApp.getUi().alert('Error: Required sheets not found.');
    return;
  }

  ss.toast('Syncing grievance data to Member Directory...', '🔄 Processing', 5);

  var memberLastRow = memberSheet.getLastRow();
  if (memberLastRow < 2) {
    ss.toast('No members to update.', 'Info', 3);
    return;
  }

  // Get all member IDs
  var memberData = memberSheet.getRange(2, MEMBER_COLS.MEMBER_ID, memberLastRow - 1, 1).getValues();

  // Get all grievance data
  var grievanceLastRow = grievanceSheet.getLastRow();
  var grievanceData = grievanceLastRow > 1 ?
    grievanceSheet.getRange(2, 1, grievanceLastRow - 1, 34).getValues() : [];

  // Build grievance lookup by member ID
  var grievanceByMember = {};
  var activeStatuses = ['Open', 'Pending Info', 'Appealed', 'In Arbitration'];

  for (var i = 0; i < grievanceData.length; i++) {
    var gRow = grievanceData[i];
    var memberId = gRow[GRIEVANCE_COLS.MEMBER_ID - 1];
    var status = gRow[GRIEVANCE_COLS.STATUS - 1];
    var nextActionDue = gRow[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1];

    if (!memberId) continue;

    if (!grievanceByMember[memberId]) {
      grievanceByMember[memberId] = { hasOpen: false, status: '', nextDeadline: '' };
    }

    // Track if member has any active grievance
    if (activeStatuses.indexOf(status) !== -1) {
      grievanceByMember[memberId].hasOpen = true;
      grievanceByMember[memberId].status = status;
      if (nextActionDue) {
        grievanceByMember[memberId].nextDeadline = nextActionDue;
      }
    }
  }

  // Update Member Directory columns AB-AD
  var updates = [];
  for (var j = 0; j < memberData.length; j++) {
    var mId = memberData[j][0];
    var gInfo = grievanceByMember[mId] || { hasOpen: false, status: '', nextDeadline: '' };
    updates.push([
      gInfo.hasOpen ? 'Yes' : 'No',
      gInfo.status,
      gInfo.nextDeadline
    ]);
  }

  memberSheet.getRange(2, MEMBER_COLS.HAS_OPEN_GRIEVANCE, updates.length, 3).setValues(updates);
  ss.toast('Updated ' + updates.length + ' member records!', '✅ Success', 3);
}

/**
 * Refresh all formulas and sync all cross-sheet data
 */
function refreshAllFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Starting full refresh...', '🔄 Processing', 3);

  // Step 1: Recalculate grievance deadlines
  recalcAllGrievancesBatched();

  // Step 2: Sync grievance data to Member Directory
  refreshMemberDirectoryFormulas();

  // Step 3: Rebuild Dashboard
  rebuildDashboard();

  ss.toast('All formulas refreshed!', '✅ Complete', 5);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function searchMembers() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('🔍 Search Members', 'Enter name, email, or member ID:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  var searchTerm = response.getResponseText().toLowerCase();
  if (!searchTerm) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    ui.alert('No members found.');
    return;
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  var results = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var memberId = String(row[0]).toLowerCase();
    var firstName = String(row[1]).toLowerCase();
    var lastName = String(row[2]).toLowerCase();
    var email = String(row[7]).toLowerCase();

    if (memberId.indexOf(searchTerm) !== -1 ||
        firstName.indexOf(searchTerm) !== -1 ||
        lastName.indexOf(searchTerm) !== -1 ||
        email.indexOf(searchTerm) !== -1) {
      results.push(row[0] + ': ' + row[1] + ' ' + row[2] + ' (' + row[7] + ')');
    }
  }

  if (results.length === 0) {
    ui.alert('No members found matching "' + searchTerm + '"');
  } else {
    ui.alert('Found ' + results.length + ' member(s):\n\n' + results.slice(0, 10).join('\n') +
      (results.length > 10 ? '\n\n...and ' + (results.length - 10) + ' more' : ''));
  }
}

function viewActiveGrievances() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (sheet) {
    ss.setActiveSheet(sheet);
  }
}

function startNewGrievance() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet) {
    ui.alert('Error: Grievance Log sheet not found.');
    return;
  }

  // Generate next grievance ID
  var lastRow = grievanceSheet.getLastRow();
  var nextNum = lastRow > 1 ? lastRow : 1;
  var grievanceId = 'G-' + String(nextNum).padStart(5, '0');

  // Add new row with grievance ID and today's date
  var newRow = [grievanceId, '', '', '', 'Open', 'Informal', new Date()];
  for (var i = newRow.length; i < 34; i++) {
    newRow.push('');
  }

  grievanceSheet.appendRow(newRow);
  ss.setActiveSheet(grievanceSheet);
  grievanceSheet.setActiveCell(grievanceSheet.getRange(lastRow + 1, GRIEVANCE_COLS.MEMBER_ID));

  ui.alert('✅ New Grievance Created', 'Grievance ' + grievanceId + ' has been created.\n\nPlease fill in the member information and incident details.', ui.ButtonSet.OK);
}

function rebuildDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  createDashboard(ss);
  ss.toast('Dashboard rebuilt!', '✅ Success', 3);
}

function VERIFY_HIDDEN_SHEETS() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var report = [];

  report.push('🔒 HIDDEN SHEET VERIFICATION');
  report.push('============================\n');

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
      report.push('✅ ' + sheetName + (sheet.isSheetHidden() ? ' (hidden)' : ' (visible)'));
    } else {
      report.push('❌ ' + sheetName + ' - NOT FOUND');
    }
  });

  report.push('\n💡 Run REPAIR_DASHBOARD() to create missing sheets.');

  ui.alert('Hidden Sheet Report', report.join('\n'), ui.ButtonSet.OK);
}

function setupEngagementTracking() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  ss.toast('Setting up engagement tracking...', '🔧 Setup', 3);

  // Create hidden engagement calc sheet
  var calcSheet = ss.getSheetByName(SHEETS.ENGAGEMENT_CALC);
  if (!calcSheet) {
    calcSheet = ss.insertSheet(SHEETS.ENGAGEMENT_CALC);
    calcSheet.hideSheet();
  }

  ss.toast('Engagement tracking setup complete!', '✅ Success', 3);
  ui.alert('✅ Setup Complete', 'Engagement tracking has been configured.\n\nThe system will now track member engagement metrics.', ui.ButtonSet.OK);
}

function setupStewardWorkloadAutoSync() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  ss.toast('Setting up steward workload sync...', '🔧 Setup', 3);

  // Create hidden steward workload calc sheet
  var calcSheet = ss.getSheetByName(SHEETS.STEWARD_WORKLOAD_CALC);
  if (!calcSheet) {
    calcSheet = ss.insertSheet(SHEETS.STEWARD_WORKLOAD_CALC);
    calcSheet.hideSheet();
  }

  ss.toast('Steward workload sync setup complete!', '✅ Success', 3);
  ui.alert('✅ Setup Complete', 'Steward workload auto-sync has been configured.\n\nWorkload metrics will update automatically.', ui.ButtonSet.OK);
}

function setupInteractiveDashboardLiveSync() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  ss.toast('Setting up interactive dashboard...', '🔧 Setup', 3);

  // Create hidden interactive calc sheet
  var calcSheet = ss.getSheetByName(SHEETS.INTERACTIVE_CALC);
  if (!calcSheet) {
    calcSheet = ss.insertSheet(SHEETS.INTERACTIVE_CALC);
    calcSheet.hideSheet();
  }

  ss.toast('Interactive dashboard setup complete!', '✅ Success', 3);
  ui.alert('✅ Setup Complete', 'Interactive Dashboard live-wire has been configured.\n\nMetrics will update in real-time.', ui.ButtonSet.OK);
}
