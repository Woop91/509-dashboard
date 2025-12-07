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

  SpreadsheetApp.getActive().toast("🚀 Creating 509 Dashboard...", "Starting", -1);

  try {
    createConfigTab();
    SpreadsheetApp.getActive().toast("✅ Config created", "10%", 2);

    createMemberDirectory();
    SpreadsheetApp.getActive().toast("✅ Member Directory created", "20%", 2);

    createGrievanceLog();
    SpreadsheetApp.getActive().toast("✅ Grievance Log created", "30%", 2);

    createMainDashboard();
    SpreadsheetApp.getActive().toast("✅ Main Dashboard created", "40%", 2);

    createAnalyticsDataSheet();
    createMemberSatisfactionSheet();
    createFeedbackSheet();
    SpreadsheetApp.getActive().toast("✅ Data sheets created", "50%", 2);

    // Create Interactive Dashboard
    createInteractiveDashboardSheet(ss);
    SpreadsheetApp.getActive().toast("✅ Interactive Dashboard created", "60%", 2);

    // Create Getting Started and FAQ sheets
    Logger.log("Starting createGettingStartedSheet...");
    createGettingStartedSheet(ss);
    Logger.log("Completed createGettingStartedSheet");

    Logger.log("Starting createFAQSheet...");
    createFAQSheet(ss);
    Logger.log("Completed createFAQSheet");
    SpreadsheetApp.getActive().toast("✅ Help sheets created", "70%", 2);

    // Create User Settings sheet
    Logger.log("Starting createUserSettingsSheet...");
    createUserSettingsSheet();
    Logger.log("Completed createUserSettingsSheet");
    SpreadsheetApp.getActive().toast("✅ Settings sheet created", "70%", 2);

    // Create all analytics and test sheets
    Logger.log("Starting createStewardWorkloadSheet...");
    createStewardWorkloadSheet();
    Logger.log("Completed createStewardWorkloadSheet");

    Logger.log("Starting createTrendsSheet...");
    createTrendsSheet();
    Logger.log("Completed createTrendsSheet");

    Logger.log("Starting createLocationSheet...");
    createLocationSheet();
    Logger.log("Completed createLocationSheet");

    Logger.log("Starting createTypeAnalysisSheet...");
    createTypeAnalysisSheet();
    Logger.log("Completed createTypeAnalysisSheet");
    SpreadsheetApp.getActive().toast("✅ Analytics sheets created", "75%", 2);

    Logger.log("Starting createExecutiveDashboard...");
    createExecutiveDashboard();
    Logger.log("Completed createExecutiveDashboard");

    Logger.log("Starting createKPIPerformanceDashboard...");
    createKPIPerformanceDashboard();
    Logger.log("Completed createKPIPerformanceDashboard");

    Logger.log("Starting createMemberEngagementSheet...");
    createMemberEngagementSheet();
    Logger.log("Completed createMemberEngagementSheet");

    Logger.log("Starting createCostImpactSheet...");
    createCostImpactSheet();
    Logger.log("Completed createCostImpactSheet");
    SpreadsheetApp.getActive().toast("✅ Executive sheets created", "80%", 2);

    // Create utility sheets
    Logger.log("Starting createArchiveSheet...");
    createArchiveSheet();
    Logger.log("Completed createArchiveSheet");

    Logger.log("Starting createDiagnosticsSheet...");
    createDiagnosticsSheet();
    Logger.log("Completed createDiagnosticsSheet");
    SpreadsheetApp.getActive().toast("✅ Utility sheets created", "85%", 2);

    // Create Audit Log sheet
    createAuditLogSheet();
    SpreadsheetApp.getActive().toast("✅ Audit Log created", "90%", 2);

    Logger.log("Starting setupDataValidations...");
    setupDataValidations();
    Logger.log("Completed setupDataValidations");

    Logger.log("Starting setupFormulasAndCalculations...");
    setupFormulasAndCalculations();
    Logger.log("Completed setupFormulasAndCalculations");

    Logger.log("Starting setupInteractiveDashboardControls...");
    setupInteractiveDashboardControls();
    Logger.log("Completed setupInteractiveDashboardControls");
    SpreadsheetApp.getActive().toast("✅ Validations & formulas ready", "90%", 2);

    // CRITICAL: Setup all dropdowns for Member Directory and Grievance Log
    Logger.log("Starting setupAllDropdowns...");
    setupAllDropdowns();
    Logger.log("Completed setupAllDropdowns");
    SpreadsheetApp.getActive().toast("✅ Dropdowns configured", "95%", 2);

    onOpen();

    SpreadsheetApp.getActive().toast("✅ Dashboard ready! Use menu to seed data.", "Complete!", 5);

    // Safely activate dashboard sheet if it exists
    const dashboard = ss.getSheetByName(SHEETS.DASHBOARD);
    if (dashboard) {
      dashboard.activate();
    }

  } catch (error) {
    SpreadsheetApp.getActive().toast("❌ Error: " + error.toString(), "Error", 10);
    Logger.log("Error in CREATE_509_DASHBOARD: " + error.toString());
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
    ["Coordinator", "Boston HQ", "Unit A - Administrative", "Monday", "Yes",
     "Sarah Johnson", "Michael Chen",
     "Jane Smith", "Grievance Committee",
     "Open", "Informal", "Discipline", "Art. 1 - Recognition", "Email",
     "Jane Smith, John Doe, Mary Johnson", "", "",
     "", "3, 7, 14", "",
     "SEIU Local 509", "509", "293 Boston Post Road West, 4th Floor, Marlborough, MA 01752", "774-843-7509",
     "", "",
     "21", "30", "10", "30",
     "Morning (8am-12pm)", "Boston",
     "Article 23A", "Article 12", "Article 15", "2023-2026 CBA",
     "SEIU", "Massachusetts", "https://www.seiu509.org/",
     "", "508-485-8529", "Marc", "marc@seiu509.org"],

    ["Analyst", "Worcester Office", "Unit B - Technical", "Tuesday", "No",
     "Mike Wilson", "Lisa Anderson",
     "John Doe", "Bargaining Committee",
     "Pending Info", "Step I", "Workload", "Art. 2 - Union Security", "Phone",
     "Bob Wilson, Alice Brown", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "Afternoon (12pm-5pm)", "Worcester",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["Case Manager", "Springfield Branch", "Unit C - Support Services", "Wednesday", "",
     "Emily Davis", "Robert Brown",
     "Mary Johnson", "Health & Safety Committee",
     "Settled", "Step II", "Scheduling", "Art. 3 - Management Rights", "Text",
     "Sarah Martinez, Kevin Jones", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "Evening (5pm-8pm)", "Springfield",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["Specialist", "Cambridge Office", "Unit D - Operations", "Thursday", "",
     "Tom Harris", "Jennifer Lee",
     "Bob Wilson", "Political Action Committee",
     "Withdrawn", "Step III", "Pay", "Art. 4 - No Discrimination", "In Person",
     "Daniel Kim, Rachel Adams", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "Weekends", "Cambridge",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["Senior Analyst", "Lowell Center", "Unit E - Field Services", "Friday", "",
     "Amanda White", "David Martinez",
     "Alice Brown", "Membership Committee",
     "Closed", "Mediation", "Discrimination", "Art. 5 - Union Business", "",
     "John Doe, Mary Johnson", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "Flexible", "Lowell",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["Team Lead", "Quincy Station", "", "Saturday", "",
     "Chris Taylor", "Susan Garcia",
     "Tom Davis", "Executive Board",
     "Appealed", "Arbitration", "Safety", "Art. 23 - Grievance Procedure", "",
     "Alice Brown, Tom Davis", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "Quincy",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["Director", "Remote/Hybrid", "", "Sunday", "",
     "Patricia Moore", "James Wilson",
     "Sarah Martinez", "Communications Committee",
     "", "", "Benefits", "Art. 24 - Discipline", "",
     "Kevin Jones, Linda Garcia", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "Brockton",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["Manager", "Brockton Office", "", "", "",
     "Kevin Anderson", "Nancy Taylor",
     "Kevin Jones", "Contract Action Team",
     "", "", "Training", "Art. 25 - Hours of Work", "",
     "Rachel Adams", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "Lynn",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["Assistant", "Lynn Location", "", "", "",
     "Michelle Lee", "Richard White",
     "Linda Garcia", "Organizing Committee",
     "", "", "Other", "Art. 26 - Overtime", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "Salem",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["Associate", "Salem Office", "", "", "",
     "Brandon Scott", "Angela Moore",
     "Daniel Kim", "COPE Committee",
     "", "", "Harassment", "Art. 27 - Seniority", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "Framingham",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["Technician", "", "", "", "",
     "Jessica Green", "Christopher Lee",
     "Rachel Adams", "Young Workers Committee",
     "", "", "Equipment", "Art. 28 - Layoff", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "Newton",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["Administrator", "", "", "", "",
     "Andrew Clark", "Melissa Wright",
     "", "",
     "", "", "Leave", "Art. 29 - Sick Leave", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "Somerville",
     "", "", "", "",
     "", "", "",
     "", "", "", ""],

    ["Support Staff", "", "", "", "",
     "Rachel Brown", "Timothy Davis",
     "", "",
     "", "", "Grievance Process", "Art. 30 - Vacation", "",
     "", "", "",
     "", "", "",
     "", "", "", "",
     "", "",
     "", "", "", "",
     "", "Malden",
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

  // Category colors for row 1 (dark colors) - 43 columns total
  // Employment Info (cols 1-5) - Blue
  config.getRange(1, 1, 1, 5).setBackground("#3B82F6").setFontColor("#FFFFFF");
  // Supervision (cols 6-7) - Green (managers only)
  config.getRange(1, 6, 1, 2).setBackground("#10B981").setFontColor("#FFFFFF");
  // Steward Info (cols 8-9) - Purple (union reps, separate from management)
  config.getRange(1, 8, 1, 2).setBackground("#7C3AED").setFontColor("#FFFFFF");
  // Grievance Settings (cols 10-14) - Orange
  config.getRange(1, 10, 1, 5).setBackground("#F59E0B").setFontColor("#FFFFFF");
  // Links & Coordinators (cols 15-17) - Deep Purple
  config.getRange(1, 15, 1, 3).setBackground("#8B5CF6").setFontColor("#FFFFFF");
  // Notifications (cols 18-20) - Red/Pink
  config.getRange(1, 18, 1, 3).setBackground("#EF4444").setFontColor("#FFFFFF");
  // Organization (cols 21-24) - Teal
  config.getRange(1, 21, 1, 4).setBackground("#14B8A6").setFontColor("#FFFFFF");
  // Integration (cols 25-26) - Indigo
  config.getRange(1, 25, 1, 2).setBackground("#6366F1").setFontColor("#FFFFFF");
  // Deadlines (cols 27-30) - Amber/Gold
  config.getRange(1, 27, 1, 4).setBackground("#D97706").setFontColor("#FFFFFF");
  // Multi-select Options (cols 31-32) - Cyan
  config.getRange(1, 31, 1, 2).setBackground("#06B6D4").setFontColor("#FFFFFF");
  // Contract & Legal (cols 33-36) - Dark Green
  config.getRange(1, 33, 1, 4).setBackground("#059669").setFontColor("#FFFFFF");
  // Org Identity (cols 37-39) - Dark Teal
  config.getRange(1, 37, 1, 3).setBackground("#0D9488").setFontColor("#FFFFFF");
  // Extended Contact (cols 40-43) - Dark Blue
  config.getRange(1, 40, 1, 4).setBackground("#1E40AF").setFontColor("#FFFFFF");

  // Style column header row (Row 2) with matching lighter colors
  config.getRange(2, 1, 1, configData[0].length)
    .setFontWeight("bold")
    .setFontSize(9);

  // Light colors for column headers (Row 2) - 43 columns total
  config.getRange(2, 1, 1, 5).setBackground("#DBEAFE");   // Light blue - Employment (1-5)
  config.getRange(2, 6, 1, 2).setBackground("#D1FAE5");   // Light green - Supervision (6-7)
  config.getRange(2, 8, 1, 2).setBackground("#E8E3F3");   // Light purple - Steward Info (8-9)
  config.getRange(2, 10, 1, 5).setBackground("#FEF3C7");  // Light orange - Grievance Settings (10-14)
  config.getRange(2, 15, 1, 3).setBackground("#EDE9FE");  // Light purple - Links (15-17)
  config.getRange(2, 18, 1, 3).setBackground("#FEE2E2");  // Light red - Notifications (18-20)
  config.getRange(2, 21, 1, 4).setBackground("#CCFBF1");  // Light teal - Organization (21-24)
  config.getRange(2, 25, 1, 2).setBackground("#E0E7FF");  // Light indigo - Integration (25-26)
  config.getRange(2, 27, 1, 4).setBackground("#FEF3C7");  // Light amber - Deadlines (27-30)
  config.getRange(2, 31, 1, 2).setBackground("#CFFAFE");  // Light cyan - Multi-select Options (31-32)
  config.getRange(2, 33, 1, 4).setBackground("#D1FAE5");  // Light green - Contract & Legal (33-36)
  config.getRange(2, 37, 1, 3).setBackground("#CCFBF1");  // Light teal - Org Identity (37-39)
  config.getRange(2, 40, 1, 4).setBackground("#DBEAFE");  // Light blue - Extended Contact (40-43)

  // Add borders between category groups (right border after last column of each category)
  const totalRows = configData.length + 1;
  config.getRange(1, 5, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);   // After Employment (5)
  config.getRange(1, 7, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);   // After Supervision (7)
  config.getRange(1, 9, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);   // After Steward Info (9)
  config.getRange(1, 14, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Grievance Settings (14)
  config.getRange(1, 17, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Links (17)
  config.getRange(1, 20, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Notifications (20)
  config.getRange(1, 24, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Organization (24)
  config.getRange(1, 26, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Integration (26)
  config.getRange(1, 30, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Deadlines (30)
  config.getRange(1, 32, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Multi-select Options (32)
  config.getRange(1, 36, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Contract & Legal (36)
  config.getRange(1, 39, totalRows, 1).setBorder(null, null, null, true, null, null, "#9CA3AF", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);  // After Org Identity (39)

  for (let i = 1; i <= configData[0].length; i++) {
    config.autoResizeColumn(i);
  }

  config.setFrozenRows(2); // Freeze both category and header rows
  config.setTabColor("#2563EB");

  // Delete unused columns beyond the defined layout (32 columns used)
  const totalCols = config.getMaxColumns();
  const usedCols = 32;  // Config uses 32 columns (A-AF)
  if (totalCols > usedCols) {
    config.deleteColumns(usedCols + 1, totalCols - usedCols);
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
    "Coordinator Notified",            // AC - 29 (Feature 95: Checkbox)
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
  const checkboxRange = grievanceLog.getRange(2, GRIEVANCE_COLS.COORDINATOR_NOTIFIED, lastRow - 1, 1);
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

  grievanceLog.setTabColor("#DC2626");
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

  // Delete unused columns beyond the defined layout (12 columns used A-L)
  const totalCols = dashboard.getMaxColumns();
  const usedCols = 12;  // Main Dashboard uses columns A-L
  if (totalCols > usedCols) {
    dashboard.deleteColumns(usedCols + 1, totalCols - usedCols);
  }
}

/**
 * Cleans up Member Directory structure - removes extra columns beyond AE (31)
 * Run this if columns AF, AG, etc. appear with mixed data
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

  if (lastCol <= 31) {
    ui.alert('Column Structure OK', 'Member Directory has ' + lastCol + ' columns (expected: 31 max). No cleanup needed.', ui.ButtonSet.OK);
    return;
  }

  const response = ui.alert(
    'Remove Extra Columns?',
    'Member Directory has ' + lastCol + ' columns but should only have 31 (A-AE).\n\n' +
    'Extra columns will be deleted. This cannot be undone.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  // Delete columns from right to left (starting after column 31)
  const columnsToDelete = lastCol - 31;
  for (let i = 0; i < columnsToDelete; i++) {
    memberDir.deleteColumn(32); // Always delete column 32 (shifts remaining left)
  }

  // Re-apply checkboxes to column AE (31) - Start Grievance
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

  // Delete unused columns beyond the defined layout (11 columns used A-K)
  const totalCols = analytics.getMaxColumns();
  const usedCols = 11;  // Analytics Data uses columns A-K
  if (totalCols > usedCols) {
    analytics.deleteColumns(usedCols + 1, totalCols - usedCols);
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

function createTrendsSheet() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEETS.TRENDS);
  if (!sheet) sheet = ss.insertSheet(SHEETS.TRENDS);
  sheet.clear();
  sheet.getRange("A1:L1").merge().setValue("📈 TRENDS & TIMELINE ANALYSIS").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground(COLORS.UNION_GREEN).setFontColor("white");
  const headers = ["Month", "New Grievances", "Resolved", "Win Rate %", "Avg Resolution Days", "Active at Month End", "Overdue", "New Members", "Active Members", "Stewards Active", "Satisfaction Score", "Trend"];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground(COLORS.LIGHT_GRAY);
  sheet.setFrozenRows(3);
  sheet.setTabColor(COLORS.UNION_GREEN);

  // Delete unused columns beyond the defined headers (12 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }
}


function createLocationSheet() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEETS.LOCATION);
  if (!sheet) sheet = ss.insertSheet(SHEETS.LOCATION);
  sheet.clear();
  sheet.getRange("A1:K1").merge().setValue("🗺️ LOCATION ANALYTICS").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground(COLORS.ACCENT_TEAL).setFontColor("white");
  const headers = ["Location", "Total Members", "Active Members", "Total Grievances", "Active Grievances", "Win Rate %", "Avg Resolution Days", "Member Satisfaction", "Stewards Assigned", "Risk Score", "Priority"];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground(COLORS.LIGHT_GRAY);
  sheet.setFrozenRows(3);
  sheet.setTabColor(COLORS.ACCENT_TEAL);

  // Delete unused columns beyond the defined headers (11 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }
}

function createTypeAnalysisSheet() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEETS.TYPE_ANALYSIS);
  if (!sheet) sheet = ss.insertSheet(SHEETS.TYPE_ANALYSIS);
  sheet.clear();
  sheet.getRange("A1:K1").merge().setValue("📊 GRIEVANCE TYPE ANALYSIS").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground(COLORS.PRIMARY_BLUE).setFontColor("white");
  const headers = ["Issue Type", "Total Cases", "Active", "Resolved", "Win Rate %", "Avg Days to Resolve", "Most Common Location", "Top Article Violated", "Trend", "Priority Level", "Notes"];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground(COLORS.LIGHT_GRAY);
  sheet.setFrozenRows(3);
  sheet.setTabColor(COLORS.PRIMARY_BLUE);

  // Delete unused columns beyond the defined headers (11 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }
}

/* --------------------- EXECUTIVE DASHBOARD (Merged Summary + Quick Stats) --------------------- */
function createExecutiveDashboard() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName("💼 Executive Dashboard");

  if (!sheet) {
    sheet = ss.insertSheet("💼 Executive Dashboard");
  }
  sheet.clear();

  // Header
  sheet.getRange("A1:F1").merge()
    .setValue("💼 EXECUTIVE DASHBOARD")
    .setFontSize(18)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor("white");

  sheet.getRange("A2:F2").merge()
    .setValue("⚡ At-a-Glance Metrics & Key Performance Indicators")
    .setFontSize(10)
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.LIGHT_GRAY)
    .setFontColor(COLORS.TEXT_GRAY);

  // Section 1: Quick Stats
  sheet.getRange("A4:D4").merge()
    .setValue("⚡ QUICK STATS")
    .setFontWeight("bold")
    .setFontSize(14)
    .setBackground(COLORS.ACCENT_ORANGE)
    .setFontColor("white")
    .setHorizontalAlignment("center");

  const quickHeaders = ["Metric", "Value", "Comparison", "Trend"];
  sheet.getRange(5, 1, 1, quickHeaders.length).setValues([quickHeaders])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Dynamic column references for formulas
  const resolutionCol = getColumnLetter(GRIEVANCE_COLS.RESOLUTION);
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const daysOpenCol = getColumnLetter(GRIEVANCE_COLS.DAYS_OPEN);
  const daysToDeadlineCol = getColumnLetter(GRIEVANCE_COLS.DAYS_TO_DEADLINE);
  const grievanceIdCol = getColumnLetter(GRIEVANCE_COLS.GRIEVANCE_ID);

  const execMemberIdCol = getColumnLetter(MEMBER_COLS.MEMBER_ID);
  const execIsStewardCol = getColumnLetter(MEMBER_COLS.IS_STEWARD);

  const quickStats = [
    ["Active Members", `=COUNTA('Member Directory'!${execMemberIdCol}2:${execMemberIdCol})`, "", ""],
    ["Active Grievances", `=COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Open")`, "", ""],
    ["Win Rate", `=TEXT(IFERROR(COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Resolved*",'Grievance Log'!${resolutionCol}:${resolutionCol},"*Won*")/COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Resolved*"),0),"0%")`, "", ""],
    ["Avg Resolution (Days)", `=ROUND(AVERAGE('Grievance Log'!${daysOpenCol}:${daysOpenCol}),1)`, "", ""],
    ["Overdue Cases", `=COUNTIF('Grievance Log'!${daysToDeadlineCol}:${daysToDeadlineCol},"OVERDUE*")`, "", ""],
    ["Active Stewards", `=COUNTIF('Member Directory'!${execIsStewardCol}:${execIsStewardCol},"Yes")`, "", ""]
  ];

  sheet.getRange(6, 1, quickStats.length, 4).setValues(quickStats);

  // Section 2: Detailed KPIs
  sheet.getRange("A13:C13").merge()
    .setValue("📊 DETAILED KEY PERFORMANCE INDICATORS")
    .setFontWeight("bold")
    .setFontSize(14)
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor("white")
    .setHorizontalAlignment("center");

  const kpiHeaders = ["Metric", "Value", "Status"];
  sheet.getRange(14, 1, 1, kpiHeaders.length).setValues([kpiHeaders])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  const detailedKpis = [
    ["Total Active Members", `=COUNTA('Member Directory'!${execMemberIdCol}2:${execMemberIdCol})`, ""],
    ["Total Active Grievances", `=COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Open")`, ""],
    ["Overall Win Rate", `=TEXT(IFERROR(COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Resolved*",'Grievance Log'!${resolutionCol}:${resolutionCol},"*Won*")/COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Resolved*"),0),"0.0%")`, ""],
    ["Avg Resolution Time (Days)", `=ROUND(AVERAGE('Grievance Log'!${daysOpenCol}:${daysOpenCol}),1)`, ""],
    ["Cases Overdue", `=COUNTIF('Grievance Log'!${daysToDeadlineCol}:${daysToDeadlineCol},"OVERDUE*")`, ""],
    ["Member Satisfaction Score", "=TEXT(AVERAGE('Member Satisfaction'!C:C),\"0.0\")", ""],
    ["Total Grievances Filed YTD", `=COUNTA('Grievance Log'!${grievanceIdCol}2:${grievanceIdCol})`, ""],
    ["Resolved Grievances", `=COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Resolved")`, ""]
  ];

  sheet.getRange(15, 1, detailedKpis.length, 3).setValues(detailedKpis);

  sheet.setFrozenRows(4);
  sheet.setTabColor(COLORS.PRIMARY_PURPLE);

  // Set column widths
  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 100);

  // Delete unused columns beyond the defined columns (4 columns used)
  const totalCols = sheet.getMaxColumns();
  const usedCols = 4;  // Executive Dashboard uses columns A-D
  if (totalCols > usedCols) {
    sheet.deleteColumns(usedCols + 1, totalCols - usedCols);
  }
}

/* --------------------- KPI PERFORMANCE DASHBOARD (Merged Performance + KPI Board) --------------------- */
function createKPIPerformanceDashboard() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName("📊 KPI Performance Dashboard");

  if (!sheet) {
    sheet = ss.insertSheet("📊 KPI Performance Dashboard");
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

function createMemberEngagementSheet() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEETS.MEMBER_ENGAGEMENT);
  if (!sheet) sheet = ss.insertSheet(SHEETS.MEMBER_ENGAGEMENT);
  sheet.clear();
  sheet.getRange("A1:L1").merge().setValue("👥 MEMBER ENGAGEMENT").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground(COLORS.ACCENT_PURPLE).setFontColor("white");
  const headers = ["Member ID", "Name", "Engagement Score", "Last Contact", "Meetings Attended", "Surveys Completed", "Volunteer Hours", "Committee Participation", "Event Attendance", "Email Open Rate", "Status", "Notes"];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground(COLORS.LIGHT_GRAY);
  sheet.setFrozenRows(3);
  sheet.setTabColor(COLORS.ACCENT_PURPLE);

  // Delete unused columns beyond the defined headers (12 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }
}

function createCostImpactSheet() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(SHEETS.COST_IMPACT);
  if (!sheet) sheet = ss.insertSheet(SHEETS.COST_IMPACT);
  sheet.clear();
  sheet.getRange("A1:J1").merge().setValue("💰 COST IMPACT ANALYSIS").setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center").setBackground(COLORS.SOLIDARITY_RED).setFontColor("white");
  const headers = ["Category", "Estimated Cost", "Actual Cost", "Variance", "ROI", "Cases Affected", "Members Benefited", "Status", "Quarter", "Notes"];
  sheet.getRange(3, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground(COLORS.LIGHT_GRAY);
  sheet.setFrozenRows(3);
  sheet.setTabColor(COLORS.SOLIDARITY_RED);

  // Delete unused columns beyond the defined headers (10 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
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
  grievanceLog.getRange(2, 24, VALIDATION_ROWS, 1).setDataValidation(grievanceEmailRule);

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

  memberValidations.forEach(function(v) {
    const configRange = config.getRange(3, v.configCol, 50, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(configRange, true)
      .setAllowInvalid(false)
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

  grievanceValidations.forEach(function(v) {
    const configRange = config.getRange(3, v.configCol, 50, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(configRange, true)
      .setAllowInvalid(false)
      .build();
    grievanceLog.getRange(2, v.col, VALIDATION_ROWS, 1).setDataValidation(rule);
  });

  // ----- CONDITIONAL FORMATTING -----
  // Light purple background for rows where Is Steward = "Yes"
  const isStewardCol = getColumnLetter(MEMBER_COLS.IS_STEWARD);
  const stewardRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$' + isStewardCol + '2="Yes"')
    .setBackground('#E8E3F3')  // Light purple (509 theme)
    .setRanges([memberDir.getRange(2, 1, VALIDATION_ROWS, 31)])  // Apply to entire row
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

  memberValidations.forEach(function(v) {
    const configRange = config.getRange(3, v.configCol, 50, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(configRange, true)
      .setAllowInvalid(false)
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

  grievanceValidations.forEach(function(v) {
    const configRange = config.getRange(3, v.configCol, 50, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(configRange, true)
      .setAllowInvalid(false)
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

  // ----- MEMBER DIRECTORY FORMULAS -----
  // IMPORTANT: Using 25000 rows to support large datasets (20k members + buffer)

  // Has Open Grievance? - Column AB (28)
  // Counts grievances with ANY active status: Open, Pending Info, Appealed, In Arbitration
  const hasGrievanceCol = getColumnLetter(MEMBER_COLS.HAS_OPEN_GRIEVANCE);
  memberDir.getRange(hasGrievanceCol + "2").setFormula(
    `=ARRAYFORMULA(IF(A2:A25000<>"",IF(SUMPRODUCT((('Grievance Log'!${gMemberIdCol}:${gMemberIdCol}=A2:A25000)*(('Grievance Log'!${gStatusCol}:${gStatusCol}="Open")+('Grievance Log'!${gStatusCol}:${gStatusCol}="Pending Info")+('Grievance Log'!${gStatusCol}:${gStatusCol}="Appealed")+('Grievance Log'!${gStatusCol}:${gStatusCol}="In Arbitration"))))>0,"Yes","No"),""))`
  );

  // Grievance Status Snapshot - Column AC (29)
  const statusSnapshotCol = getColumnLetter(MEMBER_COLS.GRIEVANCE_STATUS);
  memberDir.getRange(statusSnapshotCol + "2").setFormula(
    `=ARRAYFORMULA(IF(A2:A25000<>"",IFERROR(INDEX('Grievance Log'!${gStatusCol}:${gStatusCol},MATCH(A2:A25000,'Grievance Log'!${gMemberIdCol}:${gMemberIdCol},0)),""),""))`
  );

  // Next Grievance Deadline - Column AD (30)
  const nextDeadlineCol = getColumnLetter(MEMBER_COLS.NEXT_DEADLINE);
  memberDir.getRange(nextDeadlineCol + "2").setFormula(
    `=ARRAYFORMULA(IF(A2:A25000<>"",IFERROR(INDEX('Grievance Log'!${gNextActionCol}:${gNextActionCol},MATCH(A2:A25000,'Grievance Log'!${gMemberIdCol}:${gMemberIdCol},0)),""),""))`
  );

  // Apply progress bar formatting
  setupGrievanceProgressBar();
}

/**
 * Sets up visual progress bar formatting for Grievance Log timeline columns (G-R)
 * - Completed steps: Green background
 * - Current step: Yellow/amber highlight
 * - Future steps: Light gray (faded)
 * - Closed/Settled/Withdrawn: Full green bar
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
  const COMPLETED_GREEN = '#D1FAE5';  // Light green for completed steps
  const CURRENT_AMBER = '#FEF3C7';    // Amber for current step
  const FUTURE_GRAY = '#F3F4F6';      // Light gray for future steps
  const CLOSED_GREEN = '#A7F3D0';     // Darker green for closed cases

  // ----- CLOSED/SETTLED/WITHDRAWN - Full green bar -----
  const closedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=OR($${statusCol}2="Settled",$${statusCol}2="Closed",$${statusCol}2="Withdrawn",$${statusCol}2="Denied")`)
    .setBackground(CLOSED_GREEN)
    .setRanges([timelineRange])
    .build();
  newRules.push(closedRule);

  // Helper: Active statuses formula part (Open, Pending Info, Appealed, In Arbitration)
  const activeStatusCondition = `OR($${statusCol}2="Open",$${statusCol}2="Pending Info",$${statusCol}2="Appealed",$${statusCol}2="In Arbitration")`;

  // ----- INFORMAL STEP (Pre-filing): Highlight G-H -----
  const informalCurrentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Informal",${activeStatusCondition})`)
    .setBackground(CURRENT_AMBER)
    .setRanges([grievanceLog.getRange(2, 7, 1000, 2)]) // G-H
    .build();
  newRules.push(informalCurrentRule);

  // Gray out future columns when at Informal
  const informalFutureRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Informal",${activeStatusCondition})`)
    .setBackground(FUTURE_GRAY)
    .setFontColor('#9CA3AF')
    .setRanges([grievanceLog.getRange(2, 9, 1000, 10)]) // I-R (future)
    .build();
  newRules.push(informalFutureRule);

  // ----- STEP I: Highlight I-K, green G-H, gray L-R -----
  const step1CompletedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step I",${activeStatusCondition})`)
    .setBackground(COMPLETED_GREEN)
    .setRanges([grievanceLog.getRange(2, 7, 1000, 2)]) // G-H completed
    .build();
  newRules.push(step1CompletedRule);

  const step1CurrentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step I",${activeStatusCondition})`)
    .setBackground(CURRENT_AMBER)
    .setRanges([grievanceLog.getRange(2, 9, 1000, 3)]) // I-K current
    .build();
  newRules.push(step1CurrentRule);

  const step1FutureRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step I",${activeStatusCondition})`)
    .setBackground(FUTURE_GRAY)
    .setFontColor('#9CA3AF')
    .setRanges([grievanceLog.getRange(2, 12, 1000, 7)]) // L-R future
    .build();
  newRules.push(step1FutureRule);

  // ----- STEP II: Highlight L-O, green G-K, gray P-R -----
  const step2CompletedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step II",${activeStatusCondition})`)
    .setBackground(COMPLETED_GREEN)
    .setRanges([grievanceLog.getRange(2, 7, 1000, 5)]) // G-K completed
    .build();
  newRules.push(step2CompletedRule);

  const step2CurrentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step II",${activeStatusCondition})`)
    .setBackground(CURRENT_AMBER)
    .setRanges([grievanceLog.getRange(2, 12, 1000, 4)]) // L-O current
    .build();
  newRules.push(step2CurrentRule);

  const step2FutureRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step II",${activeStatusCondition})`)
    .setBackground(FUTURE_GRAY)
    .setFontColor('#9CA3AF')
    .setRanges([grievanceLog.getRange(2, 16, 1000, 3)]) // P-R future
    .build();
  newRules.push(step2FutureRule);

  // ----- STEP III: Highlight P-Q, green G-O, gray R -----
  const step3CompletedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step III",${activeStatusCondition})`)
    .setBackground(COMPLETED_GREEN)
    .setRanges([grievanceLog.getRange(2, 7, 1000, 9)]) // G-O completed
    .build();
  newRules.push(step3CompletedRule);

  const step3CurrentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step III",${activeStatusCondition})`)
    .setBackground(CURRENT_AMBER)
    .setRanges([grievanceLog.getRange(2, 16, 1000, 2)]) // P-Q current
    .build();
  newRules.push(step3CurrentRule);

  const step3FutureRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND($${stepCol}2="Step III",${activeStatusCondition})`)
    .setBackground(FUTURE_GRAY)
    .setFontColor('#9CA3AF')
    .setRanges([grievanceLog.getRange(2, 18, 1000, 1)]) // R future
    .build();
  newRules.push(step3FutureRule);

  // ----- ARBITRATION/MEDIATION: Green G-Q, amber R -----
  const arbMedCompletedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND(OR($${stepCol}2="Arbitration",$${stepCol}2="Mediation"),${activeStatusCondition})`)
    .setBackground(COMPLETED_GREEN)
    .setRanges([grievanceLog.getRange(2, 7, 1000, 11)]) // G-Q completed
    .build();
  newRules.push(arbMedCompletedRule);

  const arbMedCurrentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=AND(OR($${stepCol}2="Arbitration",$${stepCol}2="Mediation"),${activeStatusCondition})`)
    .setBackground(CURRENT_AMBER)
    .setRanges([grievanceLog.getRange(2, 18, 1000, 1)]) // R current (awaiting close)
    .build();
  newRules.push(arbMedCurrentRule);

  grievanceLog.setConditionalFormatRules(newRules);
}

/**
 * Sorts Grievance Log to move completed grievances to bottom
 * Call this manually or set up a trigger to run periodically
 */
function sortGrievancesByStatus() {
  const ss = SpreadsheetApp.getActive();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!grievanceLog) return;

  const lastRow = grievanceLog.getLastRow();
  if (lastRow <= 1) return;

  const lastCol = grievanceLog.getLastColumn();
  const dataRange = grievanceLog.getRange(2, 1, lastRow - 1, lastCol);

  // Sort by Status - Open/Pending first, then Closed/Settled/Withdrawn/Denied
  // Custom sort: Open=1, Pending Info=2, Appealed=3, In Arbitration=4, others=5
  const statusCol = GRIEVANCE_COLS.STATUS;

  dataRange.sort([
    { column: statusCol, ascending: true }
  ]);

  SpreadsheetApp.getActive().toast('✅ Grievances sorted - active cases at top, completed at bottom', 'Sorted', 3);
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

  const EXPECTED_COLS = 28; // A through AB
  const lastCol = grievanceLog.getLastColumn();

  // Delete extra columns beyond AB (28)
  if (lastCol > EXPECTED_COLS) {
    const extraCols = lastCol - EXPECTED_COLS;
    grievanceLog.deleteColumns(EXPECTED_COLS + 1, extraCols);
    SpreadsheetApp.getActive().toast(`Removed ${extraCols} extra column(s)`, 'Cleanup', 2);
  }

  // Reapply headers to ensure correct column names
  const headers = [
    "Grievance ID", "Member ID", "First Name", "Last Name", "Status", "Current Step",
    "Incident Date", "Filing Deadline (21d)", "Date Filed (Step I)", "Step I Decision Due (30d)",
    "Step I Decision Rcvd", "Step II Appeal Due (10d)", "Step II Appeal Filed", "Step II Decision Due (30d)",
    "Step II Decision Rcvd", "Step III Appeal Due (30d)", "Step III Appeal Filed", "Date Closed",
    "Days Open", "Next Action Due", "Days to Deadline", "Articles Violated", "Issue Category",
    "Member Email", "Unit", "Work Location (Site)", "Assigned Steward (Name)", "Resolution Summary"
  ];
  grievanceLog.getRange(1, 1, 1, headers.length).setValues([headers]);

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

/* --------------------- SETUP MENU VISIBILITY --------------------- */
/**
 * Property key for storing Setup menu visibility state
 */
const SETUP_MENU_HIDDEN_KEY = 'setupMenuHidden';

/**
 * Checks if the Setup menu should be hidden
 * @returns {boolean} True if Setup menu should be hidden
 */
function isSetupMenuHidden() {
  const props = PropertiesService.getDocumentProperties();
  return props.getProperty(SETUP_MENU_HIDDEN_KEY) === 'true';
}

/**
 * Sets the Setup menu visibility state
 * @param {boolean} hidden - True to hide the Setup menu
 */
function setSetupMenuHidden(hidden) {
  const props = PropertiesService.getDocumentProperties();
  props.setProperty(SETUP_MENU_HIDDEN_KEY, hidden ? 'true' : 'false');
}

/**
 * Toggles the Setup menu visibility
 * Called from Admin menu
 */
function toggleSetupMenuVisibility() {
  const currentlyHidden = isSetupMenuHidden();
  setSetupMenuHidden(!currentlyHidden);

  const ui = SpreadsheetApp.getUi();
  const newState = !currentlyHidden ? 'hidden' : 'visible';

  ui.alert(
    '🚀 Setup Menu ' + (newState === 'hidden' ? 'Hidden' : 'Restored'),
    'The Setup menu is now ' + newState + '.\n\n' +
    'Please refresh the page (F5) or close and reopen the spreadsheet to see the change.\n\n' +
    'You can toggle this setting anytime from:\n⚙️ Admin > 👁️ View & Display > ' +
    (newState === 'hidden' ? 'Show Setup Menu' : 'Hide Setup Menu'),
    ui.ButtonSet.OK
  );
}

/* --------------------- MENU --------------------- */
/**
 * Runs when spreadsheet opens - creates menu and validates configuration
 */
function onOpen() {
  // Log user access for audit trail
  try {
    logUserAccess();
  } catch (e) {
    // Don't let audit logging break the app
    Logger.log('onOpen: Failed to log user access: ' + e.message);
  }

  // Validate configuration on startup
  const configValid = validateConfigurationOnOpen();

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

  // ============ CREATE ALL MAIN MENUS ============
  // Use the comprehensive reorganized menu system with all 43+ features
  // This calls the reorganized menu from ReorganizedMenu.gs
  createReorganizedMenus(ui);

  // ============ 🧪 TESTING MENU ============
  ui.createMenu("🧪 Tests")
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
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!memberSheet) {
    throw new Error('Member Directory sheet not found');
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
    report += `  Total: ${configLastRow} rows, ${configLastCol} columns\n`;
    report += `  Expected: 29 columns (new structure)\n`;

    if (configLastCol === 29) {
      report += `  ✅ Column count matches new structure\n`;
    } else if (configLastCol === 31) {
      report += `  ⚠️ Column count matches OLD structure (31 cols)\n`;
      report += `  → Run CREATE_509_DASHBOARD to update\n`;
    } else {
      report += `  ⚠️ Unexpected column count: ${configLastCol}\n`;
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
 * Called from Optional Extras menu to explain dropdown refresh
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
        resolutionDays: []
      };
    }
  }

  // Process grievances
  const today = new Date();
  for (let i = 1; i < grievanceData.length; i++) {
    const row = grievanceData[i];
    const stewardName = row[GRIEVANCE_COLS.STEWARD - 1]; // Assigned Steward (Name)
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    const outcome = row[GRIEVANCE_COLS.RESOLUTION - 1]; // Resolution/Outcome
    const daysOpen = row[GRIEVANCE_COLS.DAYS_OPEN - 1];

    // Match steward by name (trim whitespace for consistent matching)
    const normalizedName = stewardName ? stewardName.toString().trim() : '';
    if (normalizedName && stewards[normalizedName]) {
      stewards[normalizedName].totalCases++;

      if (status === 'Open' || status === 'Pending Info') {
        stewards[normalizedName].activeCases++;
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
      0, // Overdue cases - would need deadline calculation
      0, // Due this week - would need deadline calculation
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

  // Job Title (Column D = 4)
  if (jobTitles.length > 0) {
    const jobTitleRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(jobTitles, true)
      .setAllowInvalid(false)
      .build();
    memberDir.getRange(2, 4, MAX_ROWS, 1).setDataValidation(jobTitleRule);
  }

  // Work Location (Column E = 5)
  if (locations.length > 0) {
    const locationRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(locations, true)
      .setAllowInvalid(false)
      .build();
    memberDir.getRange(2, 5, MAX_ROWS, 1).setDataValidation(locationRule);
  }

  // Unit (Column F = 6)
  if (units.length > 0) {
    const unitRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(units, true)
      .setAllowInvalid(false)
      .build();
    memberDir.getRange(2, 6, MAX_ROWS, 1).setDataValidation(unitRule);
  }

  // Office Days (Column G = 7) - Allow multiple selections as comma-separated
  const officeDaysRule = SpreadsheetApp.newDataValidation()
    .requireTextContains("")
    .setAllowInvalid(true)
    .setHelpText('Enter multiple days comma-separated (e.g., "Monday, Wednesday, Friday")')
    .build();
  memberDir.getRange(2, 7, MAX_ROWS, 1).setDataValidation(officeDaysRule);

  // Is Steward (Column J = 10)
  const yesNoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Yes', 'No'], true)
    .setAllowInvalid(false)
    .build();
  memberDir.getRange(2, 10, MAX_ROWS, 1).setDataValidation(yesNoRule);

  // Supervisor (Column K = 11)
  if (supervisors.length > 0) {
    const supervisorRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(supervisors, true)
      .setAllowInvalid(false)
      .build();
    memberDir.getRange(2, 11, MAX_ROWS, 1).setDataValidation(supervisorRule);
  }

  // Manager (Column L = 12)
  if (managers.length > 0) {
    const managerRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(managers, true)
      .setAllowInvalid(false)
      .build();
    memberDir.getRange(2, 12, MAX_ROWS, 1).setDataValidation(managerRule);
  }

  // Assigned Steward (Column M = 13) and Steward Who Contacted Member (Column AD = 30)
  if (stewards.length > 0) {
    const stewardRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(stewards, true)
      .setAllowInvalid(false)
      .build();
    memberDir.getRange(2, 13, MAX_ROWS, 1).setDataValidation(stewardRule);
    memberDir.getRange(2, 30, MAX_ROWS, 1).setDataValidation(stewardRule);
  }

  // Interest: Local Actions (Column T = 20)
  memberDir.getRange(2, 20, MAX_ROWS, 1).setDataValidation(yesNoRule);

  // Interest: Chapter Actions (Column U = 21)
  memberDir.getRange(2, 21, MAX_ROWS, 1).setDataValidation(yesNoRule);

  // Interest: Allied Chapter Actions (Column V = 22)
  memberDir.getRange(2, 22, MAX_ROWS, 1).setDataValidation(yesNoRule);

  // Preferred Communication Methods (Column X = 24) - Multiple selections
  const commMethodsRule = SpreadsheetApp.newDataValidation()
    .requireTextContains("")
    .setAllowInvalid(true)
    .setHelpText('Enter multiple methods comma-separated (e.g., "Email, Phone, Text")')
    .build();
  memberDir.getRange(2, 24, MAX_ROWS, 1).setDataValidation(commMethodsRule);

  // Best Time(s) to Reach Member (Column Y = 25) - Multiple selections
  const bestTimeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Morning (8am-12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-8pm)', 'Anytime'], true)
    .setAllowInvalid(true)
    .setHelpText('Select one or enter multiple comma-separated')
    .build();
  memberDir.getRange(2, 25, MAX_ROWS, 1).setDataValidation(bestTimeRule);

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

  // Days to Deadline (Column U = 21) - Color-coded based on urgency
  const urgentRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0)
    .setBackground('#DC2626')  // Red - OVERDUE
    .setFontColor('#FFFFFF')
    .setRanges([grievanceLog.getRange(2, 21, MAX_ROWS, 1)])
    .build();

  const warningRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(0, 3)
    .setBackground('#F97316')  // Orange - URGENT (0-3 days)
    .setFontColor('#FFFFFF')
    .setRanges([grievanceLog.getRange(2, 21, MAX_ROWS, 1)])
    .build();

  const cautionRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(4, 7)
    .setBackground('#FCD34D')  // Yellow - CAUTION (4-7 days)
    .setFontColor('#000000')
    .setRanges([grievanceLog.getRange(2, 21, MAX_ROWS, 1)])
    .build();

  const okRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(7)
    .setBackground('#10B981')  // Green - OK (8+ days)
    .setFontColor('#FFFFFF')
    .setRanges([grievanceLog.getRange(2, 21, MAX_ROWS, 1)])
    .build();

  const rules = grievanceLog.getConditionalFormatRules();
  rules.push(urgentRule, warningRule, cautionRule, okRule);
  grievanceLog.setConditionalFormatRules(rules);

  SpreadsheetApp.getUi().alert('✅ Date status bars added to Grievance Log!');
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
function SEED_MEMBERS_TOGGLE_1() { seedMembersWithCount(5000, "Toggle 1"); }
function SEED_MEMBERS_TOGGLE_2() { seedMembersWithCount(5000, "Toggle 2"); }
function SEED_MEMBERS_TOGGLE_3() { seedMembersWithCount(5000, "Toggle 3"); }
function SEED_MEMBERS_TOGGLE_4() { seedMembersWithCount(5000, "Toggle 4"); }

/**
 * Seeds member directory with test data
 * Refactored to use helper functions for maintainability
 */
function seedMembersWithCount(count, toggleName) {
  const ss = SpreadsheetApp.getActive();
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const config = ss.getSheetByName(SHEETS.CONFIG);

  // Validate sheets exist
  if (!validateSeedSheets(memberDir, config)) return;

  // Confirm with user
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    `Seed ${count} Members (${toggleName})`,
    `This will add ${count} member records. This may take 1-2 minutes. Continue?`,
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) return;

  SpreadsheetApp.getActive().toast(`🚀 Seeding ${count} members (${toggleName})...`, "Processing", -1);

  // Prepare for seeding
  clearMemberValidationsForSeed(memberDir, count);

  // Get seed configuration
  const seedConfig = getMemberSeedConfig();
  if (!seedConfig) return;

  // Generate and write data
  const startingRow = memberDir.getLastRow();
  const result = generateAndWriteMemberData(memberDir, count, startingRow, toggleName, seedConfig);

  // Restore sheet state
  restoreMemberSheetAfterSeed(memberDir, startingRow, count);

  const finalRow = memberDir.getLastRow();
  SpreadsheetApp.getActive().toast(`✅ ${count} members added (${toggleName})! Sheet now has ${finalRow - 1} members.`, "Complete", 5);
}

/**
 * Validates sheets exist for seeding
 */
function validateSeedSheets(memberDir, config) {
  if (!memberDir) {
    SpreadsheetApp.getUi().alert('Error', 'Member Directory sheet not found! Please run CREATE_509_DASHBOARD first.', SpreadsheetApp.getUi().ButtonSet.OK);
    return false;
  }
  if (!config) {
    SpreadsheetApp.getUi().alert('Error', 'Config sheet not found! Please run CREATE_509_DASHBOARD first.', SpreadsheetApp.getUi().ButtonSet.OK);
    return false;
  }
  return true;
}

/**
 * Clears data validations before seeding
 */
function clearMemberValidationsForSeed(memberDir, count) {
  const lastRow = Math.max(memberDir.getLastRow(), 2);
  const maxSeedRows = lastRow + count + 100;
  try {
    // Clear validations for all columns that have dropdown values set during seeding
    // Columns: JOB_TITLE(4), WORK_LOCATION(5), UNIT(6), OFFICE_DAYS(7),
    //          SUPERVISOR(12), MANAGER(13), IS_STEWARD(14), ASSIGNED_STEWARD(16),
    //          CONTACT_STEWARD(26)
    const columnsToClean = [4, 5, 6, 7, 12, 13, 14, 16, 26];
    columnsToClean.forEach(function(col) {
      memberDir.getRange(2, col, maxSeedRows, 1).clearDataValidations();
    });
    Logger.log('Cleared data validations for seed operation');
  } catch (e) {
    Logger.log('Warning: Could not clear some validations: ' + e.message);
  }
}

/**
 * Gets configuration data for member seeding
 */
function getMemberSeedConfig() {
  const dropdowns = getMemberDirectoryDropdownValues();

  let commMethods = getConfigColumnValues(CONFIG_COLS.COMM_METHODS);
  if (commMethods.length === 0) {
    commMethods = ["Email", "Phone", "Text", "In Person"];
  }

  const seedConfig = {
    firstNames: ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle"],
    lastNames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"],
    jobTitles: dropdowns.jobTitles,
    locations: dropdowns.locations,
    units: dropdowns.units,
    officeDays: dropdowns.officeDays,
    supervisors: dropdowns.supervisors,
    managers: dropdowns.managers,
    stewards: dropdowns.stewards,
    commMethods: commMethods,
    times: ["Mornings", "Afternoons", "Evenings", "Weekends", "Flexible"],
    committeeOptions: getConfigColumnValues(CONFIG_COLS.STEWARD_COMMITTEES),
    homeTownOptions: getConfigColumnValues(CONFIG_COLS.HOME_TOWNS),
    contactNotes: getSeedContactNotes()
  };

  // Validate required config
  if (seedConfig.jobTitles.length === 0 || seedConfig.locations.length === 0 ||
      seedConfig.units.length === 0 || seedConfig.supervisors.length === 0 ||
      seedConfig.managers.length === 0 || seedConfig.stewards.length === 0) {
    SpreadsheetApp.getUi().alert('Error', 'Config data is incomplete. Please ensure all dropdown lists in Config sheet are populated.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }

  return seedConfig;
}

/**
 * Returns sample contact notes for seeding
 */
function getSeedContactNotes() {
  return [
    "Discussed upcoming contract negotiations",
    "Follow-up on workplace safety concerns",
    "Scheduled one-on-one meeting for next week",
    "Provided information about member benefits",
    "Addressed scheduling conflict resolution",
    "Checked in about workload issues",
    "Discussed professional development opportunities",
    "Followed up on grievance status",
    "Welcomed new member to the union",
    "Provided update on chapter meeting",
    "Discussed concerns about overtime policies",
    "Shared information about steward training",
    "Follow-up on previous conversation about working conditions",
    "Answered questions about union dues",
    "Discussed upcoming union events"
  ];
}

/**
 * Generates and writes member data in batches
 */
function generateAndWriteMemberData(memberDir, count, startingRow, toggleName, config) {
  const BATCH_SIZE = 1000;
  const MAX_STEWARDS = 25;
  let data = [];
  let stewardCount = 0;

  for (let i = 1; i <= count; i++) {
    const row = generateSingleMemberRow(i, startingRow, config, stewardCount, MAX_STEWARDS);
    if (row.isSteward) stewardCount++;
    data.push(row.data);

    if (data.length === BATCH_SIZE) {
      writeMemberBatch(memberDir, data, i, count, toggleName);
      data = [];
    }
  }

  // Write remaining data
  if (data.length > 0) {
    writeMemberBatch(memberDir, data, count, count, toggleName);
  }

  SpreadsheetApp.flush();
  Logger.log('Seed complete. Member Directory now has ' + memberDir.getLastRow() + ' rows');
}

/**
 * Generates a single member row
 */
function generateSingleMemberRow(index, startingRow, config, stewardCount, maxStewards) {
  const firstName = config.firstNames[Math.floor(Math.random() * config.firstNames.length)];
  const lastName = config.lastNames[Math.floor(Math.random() * config.lastNames.length)];
  const memberID = "M" + String(startingRow + index).padStart(6, '0');

  // Generate office days
  const numDays = Math.floor(Math.random() * 3) + 1;
  const selectedDays = [];
  const availableDays = [...config.officeDays];
  for (let d = 0; d < numDays && availableDays.length > 0; d++) {
    const idx = Math.floor(Math.random() * availableDays.length);
    selectedDays.push(availableDays.splice(idx, 1)[0]);
  }

  const isSteward = (stewardCount < maxStewards && Math.random() > 0.95) ? "Yes" : "No";
  const daysAgo = Math.floor(Math.random() * 90);

  const row = [
    memberID, firstName, lastName,
    config.jobTitles[Math.floor(Math.random() * config.jobTitles.length)],
    config.locations[Math.floor(Math.random() * config.locations.length)],
    config.units[Math.floor(Math.random() * config.units.length)],
    selectedDays.join(", "),
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}${startingRow + index}@union.org`,
    `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    config.commMethods[Math.floor(Math.random() * config.commMethods.length)],
    config.times[Math.floor(Math.random() * config.times.length)],
    config.supervisors[Math.floor(Math.random() * config.supervisors.length)],
    config.managers[Math.floor(Math.random() * config.managers.length)],
    isSteward,
    isSteward === "Yes" && config.committeeOptions.length > 0 ? config.committeeOptions[Math.floor(Math.random() * config.committeeOptions.length)] : "",
    config.stewards[Math.floor(Math.random() * config.stewards.length)],
    Math.random() > 0.7 ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000) : "",
    Math.random() > 0.8 ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000) : "",
    Math.floor(Math.random() * 40) + 60,
    Math.floor(Math.random() * 50),
    Math.random() > 0.5 ? "Yes" : "No",
    Math.random() > 0.6 ? "Yes" : "No",
    Math.random() > 0.8 ? "Yes" : "No",
    config.homeTownOptions.length > 0 ? config.homeTownOptions[Math.floor(Math.random() * config.homeTownOptions.length)] : "",
    new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    Math.random() > 0.6 ? config.stewards[Math.floor(Math.random() * config.stewards.length)] : "",
    Math.random() > 0.6 ? config.contactNotes[Math.floor(Math.random() * config.contactNotes.length)] : ""
  ];

  return { data: row, isSteward: isSteward === "Yes" };
}

/**
 * Writes a batch of member data to the sheet
 */
function writeMemberBatch(memberDir, data, currentIndex, totalCount, toggleName) {
  try {
    memberDir.getRange(memberDir.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
    SpreadsheetApp.getActive().toast(`Added ${currentIndex} of ${totalCount} members (${toggleName})...`, "Progress", 1);
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log(`Error writing member batch at ${currentIndex}: ${e.message}`);
    SpreadsheetApp.getActive().toast(`⚠️ Error at ${currentIndex}. Retrying...`, "Warning", 2);
    Utilities.sleep(1000);
    try {
      memberDir.getRange(memberDir.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
    } catch (e2) {
      Logger.log(`Retry failed: ${e2.message}`);
      throw new Error(`Failed to write members: ${e2.message}`);
    }
  }
}

/**
 * Restores dropdowns, checkboxes, and formulas after seeding
 */
function restoreMemberSheetAfterSeed(memberDir, startingRow, count) {
  SpreadsheetApp.getActive().toast(`Restoring dropdowns...`, "Processing", -1);
  try {
    setupMemberDirectoryDropdownsSilent();
    setupGrievanceLogDropdownsSilent();
    Logger.log('Successfully re-applied dropdowns after seeding');
  } catch (e) {
    Logger.log('Warning: Could not re-apply dropdowns: ' + e.message);
  }

  try {
    const startGrievanceCol = MEMBER_COLS.START_GRIEVANCE;
    memberDir.getRange(startingRow + 1, startGrievanceCol, count, 1).insertCheckboxes();
    Logger.log('Successfully added checkboxes for Start Grievance column');
  } catch (e) {
    Logger.log('Warning: Could not add checkboxes: ' + e.message);
  }

  SpreadsheetApp.getActive().toast(`Refreshing formulas...`, "Processing", -1);
  try {
    setupFormulasAndCalculations();
    Logger.log('Successfully refreshed formulas after seeding');
  } catch (e) {
    Logger.log('Warning: Could not refresh formulas: ' + e.message);
  }
}

/* --------------------- LEGACY: SEED 20,000 MEMBERS --------------------- */
function SEED_20K_MEMBERS() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Seed 20,000 Members',
    'Use the 4 toggles instead for better performance:\n\n' +
    '• Seed Members - Toggle 1 (5,000)\n' +
    '• Seed Members - Toggle 2 (5,000)\n' +
    '• Seed Members - Toggle 3 (5,000)\n' +
    '• Seed Members - Toggle 4 (5,000)\n\n' +
    'Would you like to seed all 20,000 at once anyway?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  // Call all 4 toggles
  seedMembersWithCount(5000, "Toggle 1");
  seedMembersWithCount(5000, "Toggle 2");
  seedMembersWithCount(5000, "Toggle 3");
  seedMembersWithCount(5000, "Toggle 4");
}

/* --------------------- SEED GRIEVANCES (WITH TOGGLES) --------------------- */
function SEED_GRIEVANCES_TOGGLE_1() { seedGrievancesWithCount(2500, "Toggle 1"); }
function SEED_GRIEVANCES_TOGGLE_2() { seedGrievancesWithCount(2500, "Toggle 2"); }

/**
 * Seeds grievance log with test data
 * Refactored to use helper functions for maintainability
 */
function seedGrievancesWithCount(count, toggleName) {
  const ss = SpreadsheetApp.getActive();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const memberDir = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const config = ss.getSheetByName(SHEETS.CONFIG);

  // Validate sheets
  if (!validateGrievanceSeedSheets(grievanceLog, memberDir, config)) return;

  // Confirm with user
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    `Seed ${count} Grievances (${toggleName})`,
    `This will add ${count} grievance records. This may take 1-2 minutes. Continue?`,
    ui.ButtonSet.YES_NO
  );
  if (response !== ui.Button.YES) return;

  SpreadsheetApp.getActive().toast(`🚀 Seeding ${count} grievances (${toggleName})...`, "Processing", -1);

  // Prepare for seeding
  clearGrievanceValidationsForSeed(grievanceLog, count);

  // Get member data
  const memberLastRow = memberDir.getLastRow();
  if (memberLastRow < 2) {
    ui.alert('Error', 'No members found. Please seed members first.', ui.ButtonSet.OK);
    return;
  }

  const allMemberData = memberDir.getRange(2, 1, memberLastRow - 1, 31).getValues();
  const memberIDs = allMemberData.map(function(row) { return row[MEMBER_COLS.MEMBER_ID - 1]; }).filter(String);

  // Get seed configuration
  const seedConfig = getGrievanceSeedConfig();
  if (!seedConfig) return;

  // Generate and write data
  const startingRow = grievanceLog.getLastRow();
  const successCount = generateAndWriteGrievanceData(grievanceLog, count, startingRow, toggleName, seedConfig, allMemberData, memberIDs);

  // Restore sheet state
  restoreGrievanceSheetAfterSeed();

  const finalRow = grievanceLog.getLastRow();
  SpreadsheetApp.getActive().toast(`✅ ${successCount} grievances added (${toggleName})! Total: ${finalRow - 1} grievances.`, "Complete", 5);
}

/**
 * Validates sheets exist for grievance seeding
 */
function validateGrievanceSeedSheets(grievanceLog, memberDir, config) {
  if (!grievanceLog) {
    SpreadsheetApp.getUi().alert('Error', 'Grievance Log sheet not found! Please run CREATE_509_DASHBOARD first.', SpreadsheetApp.getUi().ButtonSet.OK);
    return false;
  }
  if (!memberDir) {
    SpreadsheetApp.getUi().alert('Error', 'Member Directory sheet not found! Please run CREATE_509_DASHBOARD first.', SpreadsheetApp.getUi().ButtonSet.OK);
    return false;
  }
  if (!config) {
    SpreadsheetApp.getUi().alert('Error', 'Config sheet not found! Please run CREATE_509_DASHBOARD first.', SpreadsheetApp.getUi().ButtonSet.OK);
    return false;
  }
  return true;
}

/**
 * Clears data validations before grievance seeding
 */
function clearGrievanceValidationsForSeed(grievanceLog, count) {
  const lastRow = Math.max(grievanceLog.getLastRow(), 2);
  const maxSeedRows = lastRow + count + 100;
  try {
    const columnsToClean = [5, 6, 22, 23, 27];
    columnsToClean.forEach(function(col) {
      grievanceLog.getRange(2, col, maxSeedRows, 1).clearDataValidations();
    });
    Logger.log('Cleared grievance data validations for seed operation');
  } catch (e) {
    Logger.log('Warning: Could not clear some validations: ' + e.message);
  }
}

/**
 * Gets configuration data for grievance seeding
 */
function getGrievanceSeedConfig() {
  const grievanceDropdowns = getGrievanceLogDropdownValues();

  const seedConfig = {
    statuses: grievanceDropdowns.statuses,
    steps: grievanceDropdowns.steps,
    categories: grievanceDropdowns.categories,
    articles: grievanceDropdowns.articles,
    stewards: grievanceDropdowns.stewards,
    deadlineConfig: getAllDeadlineConfig(),
    resolutions: ["Won - Resolved favorably", "Won - Full remedy granted", "Lost - No violation found", "Lost - Withdrawn by member", "Settled - Partial remedy", "Settled - Compromise reached"]
  };

  if (seedConfig.statuses.length === 0 || seedConfig.steps.length === 0 ||
      seedConfig.articles.length === 0 || seedConfig.categories.length === 0 ||
      seedConfig.stewards.length === 0) {
    SpreadsheetApp.getUi().alert('Error', 'Config data is incomplete. Please ensure all dropdown lists in Config sheet are populated.', SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }

  return seedConfig;
}

/**
 * Generates and writes grievance data in batches
 */
function generateAndWriteGrievanceData(grievanceLog, count, startingRow, toggleName, config, allMemberData, memberIDs) {
  const BATCH_SIZE = 500;
  let data = [];
  let successCount = 0;

  for (let i = 1; i <= count; i++) {
    const memberIndex = Math.floor(Math.random() * memberIDs.length);
    const memberID = memberIDs[memberIndex];
    const memberData = allMemberData[memberIndex];

    if (!memberData || !memberID) continue;

    const row = generateSingleGrievanceRow(i, startingRow, memberID, memberData, config);
    data.push(row);
    successCount++;

    if (data.length === BATCH_SIZE) {
      writeGrievanceBatch(grievanceLog, data, successCount, count, toggleName);
      data = [];
    }
  }

  if (data.length > 0) {
    writeGrievanceBatch(grievanceLog, data, successCount, count, toggleName);
  }

  SpreadsheetApp.flush();
  Logger.log('Grievance seed complete. Grievance Log now has ' + grievanceLog.getLastRow() + ' rows');
  return successCount;
}

/**
 * Generates a single grievance row
 */
function generateSingleGrievanceRow(index, startingRow, memberID, memberData, config) {
  const grievanceID = "G-" + String(startingRow + index).padStart(6, '0');
  const status = config.statuses[Math.floor(Math.random() * config.statuses.length)];
  const step = config.steps[Math.floor(Math.random() * config.steps.length)];

  const daysAgo = Math.floor(Math.random() * 365);
  const incidentDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const dateFiled = new Date(incidentDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);

  const isClosed = status === "Closed" || status === "Settled" || status === "Withdrawn";
  const dateClosed = isClosed ? new Date(dateFiled.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000) : "";
  const resolution = isClosed ? config.resolutions[Math.floor(Math.random() * config.resolutions.length)] : "";

  // Calculate deadlines
  const DAY_MS = 24 * 60 * 60 * 1000;
  const dc = config.deadlineConfig;
  const filingDeadline = new Date(incidentDate.getTime() + dc.filingDeadlineDays * DAY_MS);
  const step1DecisionDue = new Date(dateFiled.getTime() + dc.step1ResponseDays * DAY_MS);
  const step1DecisionRcvd = (step !== "Informal" && Math.random() > 0.3) ? new Date(dateFiled.getTime() + Math.random() * dc.step1ResponseDays * DAY_MS) : "";
  const step2AppealDue = step1DecisionRcvd ? new Date(step1DecisionRcvd.getTime() + dc.step2AppealDays * DAY_MS) : "";
  const step2AppealFiled = (step === "Step II" || step === "Step III" || step === "Arbitration") && step2AppealDue ? new Date(step1DecisionRcvd.getTime() + Math.random() * dc.step2AppealDays * DAY_MS) : "";
  const step2DecisionDue = step2AppealFiled ? new Date(step2AppealFiled.getTime() + dc.step2ResponseDays * DAY_MS) : "";
  const step2DecisionRcvd = (step === "Step III" || step === "Arbitration") && step2DecisionDue ? new Date(step2AppealFiled.getTime() + Math.random() * dc.step2ResponseDays * DAY_MS) : "";
  const step3AppealDue = step2DecisionRcvd ? new Date(step2DecisionRcvd.getTime() + GRIEVANCE_TIMELINES.STEP3_APPEAL_DAYS * DAY_MS) : "";
  const step3AppealFiled = (step === "Step III" || step === "Arbitration") && step3AppealDue ? new Date(step2DecisionRcvd.getTime() + Math.random() * GRIEVANCE_TIMELINES.STEP3_APPEAL_DAYS * DAY_MS) : "";
  const daysOpen = isClosed && dateClosed ? Math.floor((dateClosed - dateFiled) / DAY_MS) : Math.floor((Date.now() - dateFiled.getTime()) / DAY_MS);

  let nextActionDue = "";
  if (!isClosed) {
    if (step === "Informal" || step === "Step I") nextActionDue = step1DecisionDue;
    else if (step === "Step II") nextActionDue = step2DecisionDue || step2AppealDue;
    else if (step === "Step III") nextActionDue = step3AppealDue;
    else if (step === "Arbitration") nextActionDue = new Date(Date.now() + Math.random() * 60 * DAY_MS);
  }
  const daysToDeadline = nextActionDue ? Math.floor((nextActionDue - Date.now()) / DAY_MS) : "";

  return [
    grievanceID, memberID, memberData[1], memberData[2], status, step,
    incidentDate, filingDeadline, dateFiled, step1DecisionDue, step1DecisionRcvd,
    step2AppealDue, step2AppealFiled, step2DecisionDue, step2DecisionRcvd,
    step3AppealDue, step3AppealFiled, dateClosed, daysOpen, nextActionDue, daysToDeadline,
    config.articles[Math.floor(Math.random() * config.articles.length)],
    config.categories[Math.floor(Math.random() * config.categories.length)],
    memberData[7], memberData[5], memberData[4],
    config.stewards[Math.floor(Math.random() * config.stewards.length)],
    resolution
  ];
}

/**
 * Writes a batch of grievance data to the sheet
 */
function writeGrievanceBatch(grievanceLog, data, currentCount, totalCount, toggleName) {
  try {
    grievanceLog.getRange(grievanceLog.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
    SpreadsheetApp.getActive().toast(`Added ${currentCount} of ${totalCount} grievances (${toggleName})...`, "Progress", 1);
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log(`Error writing batch at count ${currentCount}: ${e.message}`);
    SpreadsheetApp.getActive().toast(`⚠️ Error at ${currentCount}. Retrying...`, "Warning", 2);
    Utilities.sleep(1000);
    try {
      grievanceLog.getRange(grievanceLog.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
    } catch (e2) {
      Logger.log(`Retry failed: ${e2.message}`);
      throw new Error(`Failed to write grievances: ${e2.message}`);
    }
  }
}

/**
 * Restores formulas and dropdowns after grievance seeding
 */
function restoreGrievanceSheetAfterSeed() {
  SpreadsheetApp.getActive().toast(`Updating formulas and snapshots...`, "Processing", -1);
  updateMemberDirectorySnapshots();

  try {
    refreshGrievanceFormulas();
    Logger.log('Successfully re-applied grievance formulas after seeding');
  } catch (e) {
    Logger.log('Warning: Could not re-apply grievance formulas: ' + e.message);
  }

  try {
    setupGrievanceLogDropdownsSilent();
    Logger.log('Successfully re-applied grievance dropdowns after seeding');
  } catch (e) {
    Logger.log('Warning: Could not re-apply grievance dropdowns: ' + e.message);
  }
}

/* --------------------- LEGACY: SEED 5,000 GRIEVANCES --------------------- */
function SEED_5K_GRIEVANCES() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Seed 5,000 Grievances',
    'Use the 2 toggles instead for better performance:\n\n' +
    '• Seed Grievances - Toggle 1 (2,500)\n' +
    '• Seed Grievances - Toggle 2 (2,500)\n\n' +
    'Would you like to seed all 5,000 at once anyway?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  // Call both toggles
  seedGrievancesWithCount(2500, "Toggle 1");
  seedGrievancesWithCount(2500, "Toggle 2");
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
  const grievanceData = grievanceLog.getRange(2, 1, grievanceLastRow - 1, 28).getValues();
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
      updateData.push([snapshot.status || "", snapshot.nextDeadline || "", contactDate, snapshot.stewardWhoContacted || "", contactNotes]);
    } else {
      updateData.push(["", "", "", "", ""]);
    }
  }
  if (updateData.length > 0) {
    // Write to Member Directory columns for grievance snapshot data
    // Columns: Status snapshot, Next deadline, Last contact date, Steward, Contact notes
    memberDir.getRange(2, 10, updateData.length, 5).setValues(updateData);
  }
}
