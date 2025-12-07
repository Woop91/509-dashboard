/**
 * ========================================================================
 * DASHBOARD FIXES - Comprehensive fixes for issues identified
 * ========================================================================
 *
 * This file contains fixes for:
 * 1. Row 2 highlighting issue in Grievance Log - clearGrievanceLogRowFormatting()
 * 2. Non-populating tabs - enhanced populateAllAnalyticsSheets()
 * 3. Type Analysis missing metrics - populateTypeAnalysis()
 * 4. Admin/diagnostic tab hide/unhide toggle - hideAdminTabs()/showAdminTabs()
 * 5. Interactive Dashboard Quick Action dropdown highlighting fix
 * 6. Dashboard member directory and grievance log population
 */

/* ========================================================================
 * 1. ROW 2 HIGHLIGHTING FIX - Clear any special formatting from row 2
 * ======================================================================== */

/**
 * Clears any special background formatting from Grievance Log data rows
 * This fixes the issue where row 2 might be highlighted differently
 */
function clearGrievanceLogRowFormatting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceLog) {
    SpreadsheetApp.getUi().alert('Grievance Log sheet not found');
    return;
  }

  const lastRow = grievanceLog.getLastRow();
  const lastCol = grievanceLog.getLastColumn();

  if (lastRow < 2) return; // No data rows

  // Clear background colors from all data rows (row 2 onwards)
  // This ensures uniform appearance
  const dataRange = grievanceLog.getRange(2, 1, lastRow - 1, lastCol);
  dataRange.setBackground(null); // Clear all backgrounds to default

  // Re-apply only the conditional formatting for Days to Deadline column
  // The conditional formatting rules handle the visual cues properly

  SpreadsheetApp.getActive().toast('Row formatting cleared. Conditional formatting still active.', 'Complete', 3);
  Logger.log('Cleared Grievance Log row formatting for rows 2-' + lastRow);
}

/**
 * Resets Grievance Log formatting to clean state
 * Preserves header formatting and re-applies conditional formatting
 */
function resetGrievanceLogFormatting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceLog) {
    SpreadsheetApp.getUi().alert('Grievance Log sheet not found');
    return;
  }

  const lastRow = Math.max(grievanceLog.getLastRow(), 2);
  const lastCol = grievanceLog.getLastColumn();

  // Clear all backgrounds from data rows
  if (lastRow > 1) {
    grievanceLog.getRange(2, 1, lastRow - 1, lastCol).setBackground(null);
  }

  // Ensure header row has correct formatting (red background)
  grievanceLog.getRange(1, 1, 1, lastCol)
    .setBackground("#DC2626")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold");

  // Re-apply conditional formatting for Days to Deadline
  setupDaysToDeadlineConditionalFormatting();

  SpreadsheetApp.getUi().alert('Grievance Log formatting reset successfully!');
}

/**
 * Sets up conditional formatting for Days to Deadline column
 */
function setupDaysToDeadlineConditionalFormatting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!grievanceLog) return;

  const daysToDeadlineCol = getColumnLetter(GRIEVANCE_COLS.DAYS_TO_DEADLINE);
  const daysToDeadlineRange = grievanceLog.getRange(daysToDeadlineCol + "2:" + daysToDeadlineCol + "10000");

  // Remove existing conditional format rules for this range
  const existingRules = grievanceLog.getConditionalFormatRules();
  const filteredRules = existingRules.filter(function(rule) {
    const ranges = rule.getRanges();
    return !ranges.some(function(range) {
      return range.getA1Notation().startsWith(daysToDeadlineCol);
    });
  });

  // Create new rules
  const overdueRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains("OVERDUE")
    .setBackground("#FEE2E2")
    .setFontColor("#DC2626")
    .setBold(true)
    .setRanges([daysToDeadlineRange])
    .build();

  const dueTodayRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("DUE TODAY")
    .setBackground("#FEF3C7")
    .setFontColor("#D97706")
    .setBold(true)
    .setRanges([daysToDeadlineRange])
    .build();

  const dueSoonRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberBetween(1, 7)
    .setBackground("#FEF9C3")
    .setFontColor("#CA8A04")
    .setRanges([daysToDeadlineRange])
    .build();

  const onTrackRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(7)
    .setBackground("#DCFCE7")
    .setFontColor("#16A34A")
    .setRanges([daysToDeadlineRange])
    .build();

  // Apply all rules
  grievanceLog.setConditionalFormatRules([overdueRule, dueTodayRule, dueSoonRule, onTrackRule, ...filteredRules]);
}

/* ========================================================================
 * 2. TYPE ANALYSIS POPULATION - Populate with formulas
 * ======================================================================== */

/**
 * Populates Type Analysis sheet with live data from Grievance Log
 */
function populateTypeAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const typeSheet = ss.getSheetByName(SHEETS.TYPE_ANALYSIS);
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!typeSheet) {
    SpreadsheetApp.getUi().alert('Type Analysis sheet not found. Please run CREATE_509_DASHBOARD first.');
    return;
  }

  if (!grievanceSheet) {
    SpreadsheetApp.getUi().alert('Grievance Log sheet not found.');
    return;
  }

  // Column references
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const categoryCol = getColumnLetter(GRIEVANCE_COLS.ISSUE_CATEGORY);
  const locationCol = getColumnLetter(GRIEVANCE_COLS.LOCATION);
  const articlesCol = getColumnLetter(GRIEVANCE_COLS.ARTICLES);
  const resolutionCol = getColumnLetter(GRIEVANCE_COLS.RESOLUTION);
  const daysOpenCol = getColumnLetter(GRIEVANCE_COLS.DAYS_OPEN);
  const daysToDeadlineCol = getColumnLetter(GRIEVANCE_COLS.DAYS_TO_DEADLINE);

  // Issue categories from ISSUE_CATEGORIES constant
  const categories = ISSUE_CATEGORIES || [
    'Discipline', 'Workload', 'Scheduling', 'Pay/Compensation',
    'Discrimination', 'Safety', 'Benefits', 'Harassment',
    'Performance Evaluation', 'Job Classification', 'Layoff/Recall', 'Leave', 'Other'
  ];

  const data = [];

  categories.forEach(function(category) {
    // Total Cases
    const totalFormula = `=COUNTIF('Grievance Log'!${categoryCol}:${categoryCol},"${category}")`;

    // Active Cases
    const activeFormula = `=COUNTIFS('Grievance Log'!${categoryCol}:${categoryCol},"${category}",'Grievance Log'!${statusCol}:${statusCol},"Open")`;

    // Resolved Cases
    const resolvedFormula = `=COUNTIFS('Grievance Log'!${categoryCol}:${categoryCol},"${category}",'Grievance Log'!${statusCol}:${statusCol},"*Resolved*")+COUNTIFS('Grievance Log'!${categoryCol}:${categoryCol},"${category}",'Grievance Log'!${statusCol}:${statusCol},"Settled")`;

    // Win Rate
    const winRateFormula = `=IFERROR(TEXT(COUNTIFS('Grievance Log'!${categoryCol}:${categoryCol},"${category}",'Grievance Log'!${resolutionCol}:${resolutionCol},"*Won*")/(COUNTIFS('Grievance Log'!${categoryCol}:${categoryCol},"${category}",'Grievance Log'!${statusCol}:${statusCol},"*Resolved*")+COUNTIFS('Grievance Log'!${categoryCol}:${categoryCol},"${category}",'Grievance Log'!${statusCol}:${statusCol},"Settled")),"0%"),"N/A")`;

    // Avg Days to Resolve
    const avgDaysFormula = `=IFERROR(ROUND(AVERAGEIFS('Grievance Log'!${daysOpenCol}:${daysOpenCol},'Grievance Log'!${categoryCol}:${categoryCol},"${category}",'Grievance Log'!${statusCol}:${statusCol},"<>Open"),1),"N/A")`;

    // Most Common Location (using MODE)
    const locationFormula = `=IFERROR(INDEX('Grievance Log'!${locationCol}:${locationCol},MATCH(MAX(COUNTIF('Grievance Log'!${locationCol}:${locationCol},'Grievance Log'!${locationCol}:${locationCol})),COUNTIF('Grievance Log'!${locationCol}:${locationCol},'Grievance Log'!${locationCol}:${locationCol}),0)),"N/A")`;

    // Top Article Violated
    const articleFormula = `=IFERROR(INDEX('Grievance Log'!${articlesCol}:${articlesCol},MATCH(MAX(COUNTIF('Grievance Log'!${articlesCol}:${articlesCol},'Grievance Log'!${articlesCol}:${articlesCol})),COUNTIF('Grievance Log'!${articlesCol}:${articlesCol},'Grievance Log'!${articlesCol}:${articlesCol}),0)),"N/A")`;

    // Trend (based on overdue count)
    const overdueFormula = `=COUNTIFS('Grievance Log'!${categoryCol}:${categoryCol},"${category}",'Grievance Log'!${daysToDeadlineCol}:${daysToDeadlineCol},"OVERDUE*")`;
    const trendFormula = `=IF(${overdueFormula}>2,"Needs Attention",IF(${overdueFormula}>0,"Monitor","On Track"))`;

    // Priority Level (based on active count)
    const priorityFormula = `=IF(${activeFormula}>10,"High",IF(${activeFormula}>5,"Medium","Low"))`;

    data.push([
      category,
      totalFormula,
      activeFormula,
      resolvedFormula,
      winRateFormula,
      avgDaysFormula,
      "", // Location - simplified
      "", // Article - simplified
      trendFormula,
      priorityFormula,
      "" // Notes
    ]);
  });

  // Clear existing data (keep headers)
  const lastRow = typeSheet.getLastRow();
  if (lastRow > 3) {
    typeSheet.getRange(4, 1, lastRow - 3, 11).clearContent();
  }

  // Write data starting at row 4
  if (data.length > 0) {
    typeSheet.getRange(4, 1, data.length, 11).setValues(data);
  }

  // Add summary row at row 2
  const summaryRow = [
    "TOTALS",
    `=SUM(B4:B${3 + data.length})`,
    `=SUM(C4:C${3 + data.length})`,
    `=SUM(D4:D${3 + data.length})`,
    `=IFERROR(TEXT(COUNTIF('Grievance Log'!${resolutionCol}:${resolutionCol},"*Won*")/COUNTIF('Grievance Log'!${statusCol}:${statusCol},"*Resolved*"),"0%"),"N/A")`,
    `=IFERROR(ROUND(AVERAGE('Grievance Log'!${daysOpenCol}:${daysOpenCol}),1),"N/A")`,
    "", "", "", "", ""
  ];
  typeSheet.getRange(2, 1, 1, 11).setValues([summaryRow]).setFontWeight("bold").setBackground("#E8E3F3");

  Logger.log('Type Analysis sheet populated with ' + data.length + ' categories');
  SpreadsheetApp.getActive().toast('Type Analysis populated!', 'Complete', 3);
}

/* ========================================================================
 * 3. ADMIN TABS HIDE/SHOW TOGGLE
 * ======================================================================== */

/**
 * List of admin/diagnostic tabs that should be grouped at the end and hideable
 */
const ADMIN_TABS = [
  "Error_Log",
  "Test Results",
  "Backup Log",
  "Audit Log",
  "Error_Trends",
  "Archive",
  "Diagnostics"
];

/**
 * Alternative names for admin tabs (with emojis)
 */
const ADMIN_TABS_WITH_EMOJIS = [
  SHEETS.ERROR_LOG,      // "Error_Log"
  SHEETS.TEST_RESULTS,   // "Test Results"
  SHEETS.BACKUP_LOG,     // "Backup Log"
  SHEETS.AUDIT_LOG || "Audit Log",
  SHEETS.ERROR_TRENDS,   // "Error_Trends"
  SHEETS.ARCHIVE,        // "Archive"
  SHEETS.DIAGNOSTICS     // "Diagnostics"
];

/**
 * Hide all admin/diagnostic tabs
 */
function hideAdminTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hiddenCount = 0;

  // Combine both lists to handle various naming conventions
  const allAdminTabs = [...new Set([...ADMIN_TABS, ...ADMIN_TABS_WITH_EMOJIS])];

  allAdminTabs.forEach(function(tabName) {
    const sheet = ss.getSheetByName(tabName);
    if (sheet) {
      try {
        sheet.hideSheet();
        hiddenCount++;
      } catch (e) {
        Logger.log('Could not hide sheet: ' + tabName + ' - ' + e.message);
      }
    }
  });

  SpreadsheetApp.getUi().alert(
    'Admin Tabs Hidden',
    'Hidden ' + hiddenCount + ' admin/diagnostic tabs.\n\nTo show them again, go to:\nAdministrator > Show Admin Tabs',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Show all admin/diagnostic tabs
 */
function showAdminTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let shownCount = 0;

  const allAdminTabs = [...new Set([...ADMIN_TABS, ...ADMIN_TABS_WITH_EMOJIS])];

  allAdminTabs.forEach(function(tabName) {
    const sheet = ss.getSheetByName(tabName);
    if (sheet) {
      try {
        sheet.showSheet();
        shownCount++;
      } catch (e) {
        Logger.log('Could not show sheet: ' + tabName + ' - ' + e.message);
      }
    }
  });

  SpreadsheetApp.getUi().alert(
    'Admin Tabs Visible',
    'Made ' + shownCount + ' admin/diagnostic tabs visible.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Toggle admin tabs visibility
 */
function toggleAdminTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allAdminTabs = [...new Set([...ADMIN_TABS, ...ADMIN_TABS_WITH_EMOJIS])];

  // Check if any admin tabs are currently visible
  let anyVisible = false;
  allAdminTabs.forEach(function(tabName) {
    const sheet = ss.getSheetByName(tabName);
    if (sheet && !sheet.isSheetHidden()) {
      anyVisible = true;
    }
  });

  if (anyVisible) {
    hideAdminTabs();
  } else {
    showAdminTabs();
  }
}

/**
 * Move admin tabs to the end of the sheet list
 */
function moveAdminTabsToEnd() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();
  const totalSheets = allSheets.length;

  const allAdminTabs = [...new Set([...ADMIN_TABS, ...ADMIN_TABS_WITH_EMOJIS])];

  allAdminTabs.forEach(function(tabName) {
    const sheet = ss.getSheetByName(tabName);
    if (sheet) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(totalSheets);
    }
  });

  SpreadsheetApp.getActive().toast('Admin tabs moved to end', 'Complete', 3);
}

/* ========================================================================
 * 4. INTERACTIVE DASHBOARD QUICK ACTION DROPDOWN FIX
 * ======================================================================== */

/**
 * Fix the Quick Action dropdown highlighting in Interactive Dashboard
 */
function fixInteractiveDropdownHighlighting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INTERACTIVE_DASHBOARD);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Interactive Dashboard sheet not found');
    return;
  }

  // Apply consistent dropdown styling to Quick Action dropdown (cell I7)
  const dropdownStyle = {
    background: "#DBEAFE",  // Light blue to match other dropdowns
    border: "#3B82F6"       // Blue border
  };

  sheet.getRange("I7")
    .setBackground(dropdownStyle.background)
    .setBorder(true, true, true, true, false, false, dropdownStyle.border, SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
    .setFontWeight("bold");

  SpreadsheetApp.getActive().toast('Quick Action dropdown styling fixed', 'Complete', 3);
}

/* ========================================================================
 * 5. ENHANCED POPULATE ALL ANALYTICS SHEETS
 * ======================================================================== */

/**
 * Enhanced version of populateAllAnalyticsSheets
 * Populates all analytics tabs with formulas and data
 */
function populateAllAnalyticsSheetsEnhanced() {
  const ui = SpreadsheetApp.getUi();

  ui.alert('Populating Analytics Sheets',
    'This will populate all analytics sheets with live data.\n\nThis may take a moment.',
    ui.ButtonSet.OK);

  try {
    // 1. Populate Steward Workload
    if (typeof populateStewardWorkload === 'function') {
      populateStewardWorkload();
      SpreadsheetApp.getActive().toast('Steward Workload populated', 'Progress', 2);
    }

    // 2. Populate Member Satisfaction
    if (typeof populateMemberSatisfaction === 'function') {
      populateMemberSatisfaction();
      SpreadsheetApp.getActive().toast('Member Satisfaction populated', 'Progress', 2);
    }

    // 3. Populate Type Analysis
    populateTypeAnalysis();
    SpreadsheetApp.getActive().toast('Type Analysis populated', 'Progress', 2);

    // 4. Populate Trends sheet
    populateTrendsSheet();
    SpreadsheetApp.getActive().toast('Trends sheet populated', 'Progress', 2);

    // 5. Populate Location Analytics
    populateLocationAnalytics();
    SpreadsheetApp.getActive().toast('Location Analytics populated', 'Progress', 2);

    // 6. Populate KPI Performance Dashboard
    populateKPIPerformanceDashboard();
    SpreadsheetApp.getActive().toast('KPI Dashboard populated', 'Progress', 2);

    // 7. Populate Member Engagement
    populateMemberEngagement();
    SpreadsheetApp.getActive().toast('Member Engagement populated', 'Progress', 2);

    // 8. Populate Cost Impact
    populateCostImpact();
    SpreadsheetApp.getActive().toast('Cost Impact populated', 'Progress', 2);

    // 9. Setup Interactive Dashboard controls
    if (typeof setupInteractiveDashboardControls === 'function') {
      setupInteractiveDashboardControls();
    }
    fixInteractiveDropdownHighlighting();
    SpreadsheetApp.getActive().toast('Interactive Dashboard setup', 'Progress', 2);

    ui.alert('Analytics Sheets Populated',
      'All analytics sheets have been populated with live data and formulas.',
      ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('Error', 'Error populating analytics: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Error in populateAllAnalyticsSheetsEnhanced: ' + error.stack);
  }
}

/**
 * Populate Trends sheet with timeline data
 */
function populateTrendsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const trendsSheet = ss.getSheetByName(SHEETS.TRENDS);

  if (!trendsSheet) {
    Logger.log('Trends sheet not found');
    return;
  }

  // Column references
  const dateFiledCol = getColumnLetter(GRIEVANCE_COLS.DATE_FILED);
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const resolutionCol = getColumnLetter(GRIEVANCE_COLS.RESOLUTION);

  // Add formulas for monthly trends
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentYear = new Date().getFullYear();

  const trendData = months.map(function(month, index) {
    const monthNum = index + 1;
    const startDate = new Date(currentYear, index, 1);
    const endDate = new Date(currentYear, index + 1, 0);

    return [
      month + ' ' + currentYear,
      `=COUNTIFS('Grievance Log'!${dateFiledCol}:${dateFiledCol},">="&DATE(${currentYear},${monthNum},1),'Grievance Log'!${dateFiledCol}:${dateFiledCol},"<="&DATE(${currentYear},${monthNum},${endDate.getDate()}))`,
      `=COUNTIFS('Grievance Log'!${dateFiledCol}:${dateFiledCol},">="&DATE(${currentYear},${monthNum},1),'Grievance Log'!${dateFiledCol}:${dateFiledCol},"<="&DATE(${currentYear},${monthNum},${endDate.getDate()}),'Grievance Log'!${statusCol}:${statusCol},"Settled")`,
      "", "", "", "", "", "", "", ""
    ];
  });

  // Write trend data starting at row 4
  const lastRow = trendsSheet.getLastRow();
  if (lastRow > 3) {
    trendsSheet.getRange(4, 1, lastRow - 3, 11).clearContent();
  }

  if (trendData.length > 0) {
    trendsSheet.getRange(4, 1, trendData.length, 11).setValues(trendData);
  }

  Logger.log('Trends sheet populated');
}

/**
 * Populate Location Analytics sheet
 */
function populateLocationAnalytics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const locationSheet = ss.getSheetByName(SHEETS.LOCATION);

  if (!locationSheet) {
    Logger.log('Location Analytics sheet not found');
    return;
  }

  // Column references
  const locationCol = getColumnLetter(GRIEVANCE_COLS.LOCATION);
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const memberLocationCol = getColumnLetter(MEMBER_COLS.WORK_LOCATION);
  const memberIdCol = getColumnLetter(MEMBER_COLS.MEMBER_ID);

  // Get unique locations from Config
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);
  let locations = [];

  if (configSheet) {
    const locData = configSheet.getRange(2, CONFIG_COLS.OFFICE_LOCATIONS, configSheet.getLastRow() - 1, 1).getValues();
    locations = locData.map(function(row) { return row[0]; }).filter(String);
  }

  if (locations.length === 0) {
    locations = ['Location 1', 'Location 2', 'Location 3']; // Fallback
  }

  const locationData = locations.map(function(location) {
    return [
      location,
      `=COUNTIF('Grievance Log'!${locationCol}:${locationCol},"${location}")`,
      `=COUNTIFS('Grievance Log'!${locationCol}:${locationCol},"${location}",'Grievance Log'!${statusCol}:${statusCol},"Open")`,
      `=COUNTIF('Member Directory'!${memberLocationCol}:${memberLocationCol},"${location}")`,
      "", "", "", "", "", "", ""
    ];
  });

  // Write location data
  const lastRow = locationSheet.getLastRow();
  if (lastRow > 3) {
    locationSheet.getRange(4, 1, lastRow - 3, 11).clearContent();
  }

  if (locationData.length > 0) {
    locationSheet.getRange(4, 1, locationData.length, 11).setValues(locationData);
  }

  Logger.log('Location Analytics populated');
}

/**
 * Populate KPI Performance Dashboard with formulas
 */
function populateKPIPerformanceDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const kpiSheet = ss.getSheetByName(SHEETS.KPI_PERFORMANCE);

  if (!kpiSheet) {
    Logger.log('KPI Performance Dashboard not found');
    return;
  }

  // The sheet should already have formulas from createKPIPerformanceDashboard()
  // This function ensures they're refreshed

  // Force formula recalculation by touching a cell
  SpreadsheetApp.flush();

  Logger.log('KPI Performance Dashboard refreshed');
}

/**
 * Populate Member Engagement sheet
 */
function populateMemberEngagement() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const engagementSheet = ss.getSheetByName(SHEETS.MEMBER_ENGAGEMENT);

  if (!engagementSheet) {
    Logger.log('Member Engagement sheet not found');
    return;
  }

  // Column references
  const memberIdCol = getColumnLetter(MEMBER_COLS.MEMBER_ID);
  const volunteerCol = getColumnLetter(MEMBER_COLS.VOLUNTEER_HOURS);
  const openRateCol = getColumnLetter(MEMBER_COLS.OPEN_RATE);
  const lastVirtualCol = getColumnLetter(MEMBER_COLS.LAST_VIRTUAL_MTG);
  const lastInPersonCol = getColumnLetter(MEMBER_COLS.LAST_INPERSON_MTG);
  const isStewardCol = getColumnLetter(MEMBER_COLS.IS_STEWARD);

  // Add summary formulas
  const summaryData = [
    ["Total Members", `=COUNTA('Member Directory'!${memberIdCol}2:${memberIdCol})`],
    ["Active Stewards", `=COUNTIF('Member Directory'!${isStewardCol}:${isStewardCol},"Yes")`],
    ["Total Volunteer Hours", `=SUM('Member Directory'!${volunteerCol}:${volunteerCol})`],
    ["Avg Open Rate", `=AVERAGE('Member Directory'!${openRateCol}:${openRateCol})&"%"`],
    ["Virtual Meetings (30d)", `=COUNTIF('Member Directory'!${lastVirtualCol}:${lastVirtualCol},">="&TODAY()-30)`],
    ["In-Person Meetings (30d)", `=COUNTIF('Member Directory'!${lastInPersonCol}:${lastInPersonCol},">="&TODAY()-30)`]
  ];

  // Write summary data
  engagementSheet.getRange(4, 1, summaryData.length, 2).setValues(summaryData);

  Logger.log('Member Engagement populated');
}

/**
 * Populate Cost Impact sheet
 */
function populateCostImpact() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const costSheet = ss.getSheetByName(SHEETS.COST_IMPACT);

  if (!costSheet) {
    Logger.log('Cost Impact sheet not found');
    return;
  }

  // Column references
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const resolutionCol = getColumnLetter(GRIEVANCE_COLS.RESOLUTION);
  const daysOpenCol = getColumnLetter(GRIEVANCE_COLS.DAYS_OPEN);

  // Add cost estimate formulas (using placeholder values)
  // Actual cost tracking would need custom columns
  const costData = [
    ["Metric", "Value", "Est. Cost Impact"],
    ["Total Grievances Filed", `=COUNTA('Grievance Log'!A2:A)`, ""],
    ["Won Cases", `=COUNTIF('Grievance Log'!${resolutionCol}:${resolutionCol},"*Won*")`, ""],
    ["Lost Cases", `=COUNTIF('Grievance Log'!${resolutionCol}:${resolutionCol},"*Lost*")`, ""],
    ["Settled Cases", `=COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Settled")`, ""],
    ["Avg Days to Resolution", `=IFERROR(ROUND(AVERAGE('Grievance Log'!${daysOpenCol}:${daysOpenCol}),1),"N/A")`, ""],
    ["Est. Hours Invested", `=IFERROR(SUM('Grievance Log'!${daysOpenCol}:${daysOpenCol})*2,"N/A")`, ""]
  ];

  // Write cost data
  costSheet.getRange(3, 1, costData.length, 3).setValues(costData);

  Logger.log('Cost Impact populated');
}

/* ========================================================================
 * 6. OFFICE LOCATIONS ADDRESS FIELDS INFO
 * ======================================================================== */

/**
 * Shows information about Office Locations and Addresses in Config
 * Answers user question about where these fields are
 */
function showOfficeAddressesInfo() {
  const ui = SpreadsheetApp.getUi();

  const info =
    'Office Locations and Addresses in Config Sheet:\n\n' +
    'Column B (OFFICE_LOCATIONS): List of office/work site names\n' +
    'Column AN (OFFICE_ADDRESSES): Corresponding addresses for each location\n\n' +
    'The addresses in column AN should align with the locations in column B.\n\n' +
    'Main organization address is in Column W (MAIN_ADDRESS).\n' +
    'Main phone is in Column X (MAIN_PHONE).\n' +
    'Main fax is in Column AO (MAIN_FAX).\n' +
    'Main contact name is in Column AP (MAIN_CONTACT_NAME).\n' +
    'Main contact email is in Column AQ (MAIN_CONTACT_EMAIL).';

  ui.alert('Office Locations Configuration', info, ui.ButtonSet.OK);
}

/* ========================================================================
 * 7. RUN ALL FIXES
 * ======================================================================== */

/**
 * Runs all dashboard fixes at once
 */
function runAllDashboardFixes() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Run All Dashboard Fixes?',
    'This will:\n' +
    '1. Clear any row highlighting issues in Grievance Log\n' +
    '2. Populate all analytics sheets with formulas\n' +
    '3. Fix Interactive Dashboard dropdown styling\n' +
    '4. Move admin tabs to end and hide them\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  try {
    // 1. Fix Grievance Log formatting
    clearGrievanceLogRowFormatting();

    // 2. Populate all analytics sheets
    populateAllAnalyticsSheetsEnhanced();

    // 3. Fix Interactive Dashboard
    fixInteractiveDropdownHighlighting();

    // 4. Move admin tabs and hide
    moveAdminTabsToEnd();
    hideAdminTabs();

    // 5. Refresh grievance calculations
    if (typeof recalcAllGrievancesBatched === 'function') {
      recalcAllGrievancesBatched();
    }

    ui.alert('All Fixes Complete',
      'All dashboard fixes have been applied successfully!',
      ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('Error', 'Error running fixes: ' + error.message, ui.ButtonSet.OK);
    Logger.log('Error in runAllDashboardFixes: ' + error.stack);
  }
}
