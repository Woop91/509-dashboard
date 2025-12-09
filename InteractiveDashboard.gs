// ------------------------------------------------------------------------====
// INTERACTIVE DASHBOARD - USER-SELECTABLE METRICS & CHARTS
// ------------------------------------------------------------------------====
//
// Features:
// - User-selectable metrics with dropdown controls
// - Dynamic chart type selection (Pie, Donut, Bar, Line, Column)
// - Side-by-side metric comparison
// - Card-based modern layout
// - Theme customization
// - Warehouse-style location charts
// - Real-time chart updates based on user selection
//
// ------------------------------------------------------------------------====

/**
 * Creates the Interactive Dashboard sheet with user-selectable controls
 * Refactored to use smaller, focused helper functions
 */
function createInteractiveDashboardSheet(ss) {
  let sheet = ss.getSheetByName(SHEETS.INTERACTIVE_DASHBOARD);
  if (!sheet) sheet = ss.insertSheet(SHEETS.INTERACTIVE_DASHBOARD);

  sheet.clear();

  // Build dashboard sections
  createDashboardHeaderSection(sheet);
  createDashboardControlPanel(sheet);
  createDashboardMetricCards(sheet);
  createDashboardChartAreas(sheet);
  createDashboardPieChartSection(sheet);
  createDashboardLocationChartSection(sheet);
  createDashboardDataTableSection(sheet);
  setDashboardDimensions(sheet);

  Logger.log("Interactive Dashboard sheet created successfully");
}

/**
 * Creates header section (rows 1-3)
 */
function createDashboardHeaderSection(sheet) {
  sheet.getRange("A1:T1").merge()
    .setValue("✨ YOUR UNION DASHBOARD - Where Data Comes Alive!")
    .setFontSize(22).setFontFamily("Roboto")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.PRIMARY_BLUE)
    .setFontColor("white");
  sheet.setRowHeight(1, 45);

  sheet.getRange("A2:T2").merge()
    .setValue("🎉 Welcome! Watch your data dance, celebrate your victories, and track your progress together!")
    .setFontSize(11).setFontFamily("Roboto")
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.LIGHT_GRAY)
    .setFontColor(COLORS.TEXT_GRAY);

  sheet.getRange("A3:T3").merge()
    .setValue("💡 Pro Tip: Select your metrics below, then watch as your dashboard springs to life with insights and celebrations!")
    .setFontSize(10).setFontFamily("Roboto")
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.WHITE)
    .setFontColor(COLORS.ACCENT_TEAL);
}

/**
 * Creates control panel section (rows 4-9)
 */
function createDashboardControlPanel(sheet) {
  sheet.getRange("A4:T4").merge()
    .setValue("🎛️ YOUR COMMAND CENTER - Make This Dashboard Your Own!")
    .setFontSize(14).setFontFamily("Roboto")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_TEAL)
    .setFontColor("white");

  const controls = [
    ["What to show (Chart 1):", "How to show it (Chart 1):", "What to show (Chart 2):", "How to show it (Chart 2):", "Color Scheme:"],
    ["", "", "", "", ""]
  ];

  sheet.getRange("A6:E6").setValues([controls[0]])
    .setFontWeight("bold")
    .setFontSize(10).setFontFamily("Roboto")
    .setBackground(COLORS.LIGHT_GRAY)
    .setHorizontalAlignment("right");

  sheet.getRange("A7:E7")
    .setBackground(COLORS.WHITE)
    .setBorder(true, true, true, true, true, true, COLORS.BORDER_GRAY, SpreadsheetApp.BorderStyle.SOLID);

  sheet.getRange("G6").setValue("Show both charts:")
    .setFontWeight("bold")
    .setFontSize(10).setFontFamily("Roboto")
    .setBackground(COLORS.LIGHT_GRAY)
    .setHorizontalAlignment("right");

  sheet.getRange("G7")
    .setBackground(COLORS.WHITE)
    .setBorder(true, true, true, true, true, true, COLORS.BORDER_GRAY, SpreadsheetApp.BorderStyle.SOLID);

  sheet.getRange("I6").setValue("Quick Action:")
    .setFontWeight("bold")
    .setFontSize(10).setFontFamily("Roboto")
    .setBackground(COLORS.LIGHT_GRAY)
    .setHorizontalAlignment("right");

  const actionDropdown = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      "Select Action...",
      "Refresh Charts",
      "Reset All Filters",
      "Show All Data",
      "Export Summary"
    ], true)
    .setAllowInvalid(false)
    .build();

  sheet.getRange("I7")
    .setValue("Select Action...")
    .setDataValidation(actionDropdown)
    .setFontSize(10).setFontFamily("Roboto")
    .setBackground(COLORS.WHITE)
    .setBorder(true, true, true, true, true, true, COLORS.BORDER_GRAY, SpreadsheetApp.BorderStyle.SOLID)
    .setHorizontalAlignment("center");
}

/**
 * Creates metric cards section (rows 10-18)
 */
function createDashboardMetricCards(sheet) {
  sheet.getRange("A10:T10").merge()
    .setValue("📈 YOUR VICTORIES AT A GLANCE - Watch These Numbers Grow!")
    .setFontSize(14).setFontFamily("Roboto")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.PRIMARY_BLUE)
    .setFontColor("white");

  const cardPositions = [
    {col: "A", endCol: "E", title: "💙 Our Growing Family", color: COLORS.ACCENT_TEAL},
    {col: "F", endCol: "J", title: "🔥 Active Cases", color: COLORS.ACCENT_ORANGE},
    {col: "K", endCol: "O", title: "🏆 Victory Rate", color: COLORS.UNION_GREEN},
    {col: "P", endCol: "T", title: "⏰ Needs Attention", color: COLORS.SOLIDARITY_RED}
  ];

  cardPositions.forEach(function(card) {
    const startRow = 12;

    sheet.getRange(`${card.col}${startRow}:${card.endCol}18`)
      .setBackground(COLORS.WHITE)
      .setBorder(true, true, true, true, false, false, COLORS.BORDER_GRAY, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    sheet.getRange(`${card.col}${startRow}:${card.endCol}${startRow}`)
      .setBorder(true, null, null, null, null, null, card.color, SpreadsheetApp.BorderStyle.SOLID_THICK);

    sheet.getRange(`${card.col}${startRow + 1}:${card.endCol}${startRow + 1}`).merge()
      .setValue(card.title)
      .setFontWeight("bold")
      .setFontSize(11).setFontFamily("Roboto")
      .setHorizontalAlignment("center")
      .setFontColor(COLORS.TEXT_GRAY);

    sheet.getRange(`${card.col}${startRow + 2}:${card.endCol}${startRow + 4}`).merge()
      .setFontSize(48)
      .setFontWeight("bold")
      .setFontFamily("Roboto")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setFontColor(card.color);

    sheet.getRange(`${card.col}${startRow + 5}:${card.endCol}${startRow + 6}`).merge()
      .setFontSize(10)
      .setFontFamily("Roboto")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setFontColor(COLORS.TEXT_GRAY)
      .setValue("📈 Growing Together");
  });

  // Add formulas to populate the metric cards with live data
  const memberIdCol = getColumnLetter(MEMBER_COLS.MEMBER_ID);
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const daysToDeadlineCol = getColumnLetter(GRIEVANCE_COLS.DAYS_TO_DEADLINE);

  // Card 1: Our Growing Family (Total Members) - with comma formatting (20,001 not 20001)
  sheet.getRange("A14:E16").merge()
    .setFormula(`=TEXT(COUNTA('Member Directory'!${memberIdCol}2:${memberIdCol}),"#,##0")`);

  // Card 2: Active Cases (Open Grievances) - with comma formatting
  sheet.getRange("F14:J16").merge()
    .setFormula(`=TEXT(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Open"),"#,##0")`);

  // Card 3: Victory Rate (Win %)
  sheet.getRange("K14:O16").merge()
    .setFormula(`=IFERROR(TEXT(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Settled")/(COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Settled")+COUNTIF('Grievance Log'!${statusCol}:${statusCol},"Denied")),"0%"),"0%")`);

  // Card 4: Needs Attention (Overdue) - with comma formatting, MAX to avoid negatives
  sheet.getRange("P14:T16").merge()
    .setFormula(`=TEXT(MAX(0,COUNTIFS('Grievance Log'!${statusCol}:${statusCol},"Open",'Grievance Log'!${daysToDeadlineCol}:${daysToDeadlineCol},"<0")),"#,##0")`);

  // Update subtitles with context
  sheet.getRange("A17:E18").merge().setValue("Union members strong together");
  sheet.getRange("F17:J18").merge().setValue("Cases currently being worked");
  sheet.getRange("K17:O18").merge().setValue("Settled vs Denied ratio");
  sheet.getRange("P17:T18").merge().setValue("Cases past deadline");
}

/**
 * Creates chart areas (rows 21-42)
 */
function createDashboardChartAreas(sheet) {
  // Chart Area 1
  sheet.getRange("A21:J21").merge()
    .setValue("📊 YOUR STORY IN CHARTS - Watch Your Data Come to Life!")
    .setFontSize(13).setFontFamily("Roboto")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_TEAL)
    .setFontColor("white");

  sheet.getRange("A22:J42")
    .setBackground(COLORS.WHITE)
    .setBorder(true, true, true, true, false, false, COLORS.BORDER_GRAY, SpreadsheetApp.BorderStyle.SOLID);

  sheet.getRange("A23:J23").merge()
    .setValue("🎨 Your chart is waiting to spring to life! Select a metric above and hit refresh")
    .setFontSize(11).setFontFamily("Roboto")
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setFontColor(COLORS.TEXT_GRAY);

  // Chart Area 2
  sheet.getRange("L21:T21").merge()
    .setValue("📊 DOUBLE THE INSIGHTS - See Two Stories Side by Side!")
    .setFontSize(13).setFontFamily("Roboto")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_PURPLE)
    .setFontColor("white");

  sheet.getRange("L22:T42")
    .setBackground(COLORS.WHITE)
    .setBorder(true, true, true, true, false, false, COLORS.BORDER_GRAY, SpreadsheetApp.BorderStyle.SOLID);

  sheet.getRange("L23:T23").merge()
    .setValue("🌟 Enable comparison mode above to see another dimension of your success!")
    .setFontSize(11).setFontFamily("Roboto")
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setFontColor(COLORS.TEXT_GRAY);
}

/**
 * Creates pie chart section (rows 45-65)
 */
function createDashboardPieChartSection(sheet) {
  sheet.getRange("A45:T45").merge()
    .setValue("🥧 COLORFUL INSIGHTS - Your Work in Living Color!")
    .setFontSize(14).setFontFamily("Roboto")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.PRIMARY_BLUE)
    .setFontColor("white");

  // Pie Chart 1 - Grievances by Status
  sheet.getRange("A47:J47").merge()
    .setValue("🎯 Status Snapshot - See Progress at a Glance")
    .setFontSize(12).setFontFamily("Roboto")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_TEAL)
    .setFontColor("white");

  sheet.getRange("A48:J65")
    .setBackground(COLORS.WHITE)
    .setBorder(true, true, true, true, false, false, COLORS.BORDER_GRAY, SpreadsheetApp.BorderStyle.SOLID);

  // Pie Chart 2 - Grievances by Location
  sheet.getRange("L47:T47").merge()
    .setValue("🗺️ Location Hotspots - Where the Action Is!")
    .setFontSize(12).setFontFamily("Roboto")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_PURPLE)
    .setFontColor("white");

  sheet.getRange("L48:T65")
    .setBackground(COLORS.WHITE)
    .setBorder(true, true, true, true, false, false, COLORS.BORDER_GRAY, SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Creates warehouse-style location chart section (rows 68-88)
 */
function createDashboardLocationChartSection(sheet) {
  sheet.getRange("A68:T68").merge()
    .setValue("🏢 UNITED ACROSS LOCATIONS - Our Collective Strength!")
    .setFontSize(14).setFontFamily("Roboto")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_PURPLE)
    .setFontColor("white");

  sheet.getRange("A70:T70").merge()
    .setValue("💪 Every City, Every Worker - Together We Stand!")
    .setFontSize(12).setFontFamily("Roboto")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_TEAL)
    .setFontColor("white");

  sheet.getRange("A71:T88")
    .setBackground(COLORS.WHITE)
    .setBorder(true, true, true, true, false, false, COLORS.BORDER_GRAY, SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Creates data table section (rows 91-110)
 */
function createDashboardDataTableSection(sheet) {
  sheet.getRange("A91:T91").merge()
    .setValue("📋 THE DETAILS THAT MATTER - Celebrating Excellence!")
    .setFontSize(14).setFontFamily("Roboto")
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.PRIMARY_BLUE)
    .setFontColor("white");

  const tableHeaders = ["Rank", "Item", "Count", "Active", "Resolved", "Win Rate", "Status"];
  sheet.getRange("A93:G93").setValues([tableHeaders])
    .setFontWeight("bold")
    .setBackground(COLORS.ACCENT_TEAL)
    .setFontColor("white")
    .setFontFamily("Roboto")
    .setHorizontalAlignment("center");

  sheet.getRange("A94:G110")
    .setBackground(COLORS.WHITE)
    .setBorder(true, true, true, true, true, true, COLORS.BORDER_GRAY, SpreadsheetApp.BorderStyle.SOLID);

  // Add data rows with formulas for top stewards/locations
  const statusCol = getColumnLetter(GRIEVANCE_COLS.STATUS);
  const locationCol = getColumnLetter(GRIEVANCE_COLS.LOCATION);

  // Get locations from Config for data table
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);
  let locations = [];

  if (configSheet) {
    const locCol = CONFIG_COLS.OFFICE_LOCATIONS;
    const lastRow = configSheet.getLastRow();
    if (lastRow > 1) {
      const values = configSheet.getRange(2, locCol, Math.min(lastRow - 1, 10), 1).getValues();
      locations = values.map(r => r[0]).filter(v => v !== '' && v !== null);
    }
  }

  // Default locations if none found
  if (locations.length === 0) {
    locations = ["Boston", "Springfield", "Worcester", "Cambridge", "Lowell"];
  }

  // Add data rows for each location
  for (let i = 0; i < Math.min(locations.length, 15); i++) {
    const dataRow = 94 + i;
    const location = locations[i];

    sheet.getRange(dataRow, 1).setValue(i + 1);  // Rank
    sheet.getRange(dataRow, 2).setValue(location);  // Item (Location)
    sheet.getRange(dataRow, 3).setFormula(`=TEXT(COUNTIF('Grievance Log'!${locationCol}:${locationCol},"${location}"),"#,##0")`);  // Count with comma formatting
    sheet.getRange(dataRow, 4).setFormula(`=TEXT(COUNTIFS('Grievance Log'!${locationCol}:${locationCol},"${location}",'Grievance Log'!${statusCol}:${statusCol},"Open"),"#,##0")`);  // Active
    sheet.getRange(dataRow, 5).setFormula(`=TEXT(COUNTIFS('Grievance Log'!${locationCol}:${locationCol},"${location}",'Grievance Log'!${statusCol}:${statusCol},"Settled")+COUNTIFS('Grievance Log'!${locationCol}:${locationCol},"${location}",'Grievance Log'!${statusCol}:${statusCol},"Closed"),"#,##0")`);  // Resolved
    sheet.getRange(dataRow, 6).setFormula(`=IFERROR(TEXT(COUNTIFS('Grievance Log'!${locationCol}:${locationCol},"${location}",'Grievance Log'!${statusCol}:${statusCol},"Settled")/(COUNTIFS('Grievance Log'!${locationCol}:${locationCol},"${location}",'Grievance Log'!${statusCol}:${statusCol},"Settled")+COUNTIFS('Grievance Log'!${locationCol}:${locationCol},"${location}",'Grievance Log'!${statusCol}:${statusCol},"Denied")),"0%"),"0%")`);  // Win Rate
    sheet.getRange(dataRow, 7).setFormula(`=IF(VALUE(SUBSTITUTE(D${dataRow},",",""))>5,"🔴 High",IF(VALUE(SUBSTITUTE(D${dataRow},",",""))>2,"🟡 Medium","🟢 Low"))`);  // Status
  }

  sheet.getRange("A94:G" + (93 + locations.length)).setHorizontalAlignment("center");
}

/**
 * Sets column widths, row heights, and frozen rows
 */
function setDashboardDimensions(sheet) {
  // Set column widths
  sheet.setColumnWidth(1, 80);   // Rank
  sheet.setColumnWidth(2, 250);  // Item
  sheet.setColumnWidth(3, 100);  // Count
  sheet.setColumnWidth(4, 100);  // Active
  sheet.setColumnWidth(5, 100);  // Resolved
  sheet.setColumnWidth(6, 100);  // Win Rate
  sheet.setColumnWidth(7, 120);  // Status

  // Set row heights
  sheet.setRowHeight(4, 35);
  sheet.setRowHeight(10, 35);
  sheet.setRowHeight(21, 35);
  sheet.setRowHeight(45, 35);
  sheet.setRowHeight(68, 35);
  sheet.setRowHeight(91, 35);

  // Freeze header rows
  sheet.setFrozenRows(2);

  // Delete unused columns beyond expected count (from SHEET_COLUMN_COUNTS)
  const expectedCols = SHEET_COLUMN_COUNTS.INTERACTIVE_DASHBOARD;
  const totalCols = sheet.getMaxColumns();
  if (totalCols > expectedCols) {
    sheet.deleteColumns(expectedCols + 1, totalCols - expectedCols);
  }

  sheet.setTabColor(COLORS.PRIMARY_BLUE);
}

/**
 * Setup data validation for Interactive Dashboard controls
 */
function setupInteractiveDashboardControls() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INTERACTIVE_DASHBOARD);
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);

  if (!sheet || !configSheet) return;

  // Available metrics for selection
  const metrics = [
    "Total Members",
    "Active Members",
    "Total Stewards",
    "Unit 8 Members",
    "Unit 10 Members",
    "Total Grievances",
    "Active Grievances",
    "Resolved Grievances",
    "Grievances Won",
    "Grievances Lost",
    "Win Rate %",
    "Overdue Grievances",
    "Due This Week",
    "In Mediation",
    "In Arbitration",
    "Grievances by Type",
    "Grievances by Location",
    "Grievances by Step",
    "Steward Workload",
    "Monthly Trends"
  ];

  // Chart types
  const chartTypes = [
    "Donut Chart",
    "Pie Chart",
    "Bar Chart",
    "Column Chart",
    "Line Chart",
    "Area Chart",
    "Table"
  ];

  // Themes
  const themes = [
    "Union Blue",
    "Solidarity Red",
    "Success Green",
    "Professional Purple",
    "Modern Dark",
    "Light & Clean"
  ];

  // Comparison options
  const comparisonOptions = ["Yes", "No"];

  // Create dropdown rules with help text
  const metricRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(metrics, true)
    .setAllowInvalid(false)
    .setHelpText('🎯 Click here to select a metric!')
    .build();

  const chartTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(chartTypes, true)
    .setAllowInvalid(false)
    .setHelpText('📊 Click here to select chart type!')
    .build();

  const themeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(themes, true)
    .setAllowInvalid(false)
    .setHelpText('🎨 Click here to select a theme!')
    .build();

  const comparisonRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(comparisonOptions, true)
    .setAllowInvalid(false)
    .setHelpText('🔄 Click here to toggle comparison mode!')
    .build();

  // Apply data validation to control cells with enhanced visual styling
  const dropdownStyle = {
    background: "#DBEAFE",  // Light blue to stand out
    border: "#3B82F6",      // Blue border
    fontWeight: "bold"
  };

  // What to show (Chart 1)
  sheet.getRange("A7")
    .setDataValidation(metricRule)
    .setValue("Total Members")
    .setBackground(dropdownStyle.background)
    .setBorder(true, true, true, true, false, false, dropdownStyle.border, SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
    .setFontWeight(dropdownStyle.fontWeight);

  // How to show it (Chart 1)
  sheet.getRange("B7")
    .setDataValidation(chartTypeRule)
    .setValue("Donut Chart")
    .setBackground(dropdownStyle.background)
    .setBorder(true, true, true, true, false, false, dropdownStyle.border, SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
    .setFontWeight(dropdownStyle.fontWeight);

  // What to show (Chart 2)
  sheet.getRange("C7")
    .setDataValidation(metricRule)
    .setValue("Active Grievances")
    .setBackground(dropdownStyle.background)
    .setBorder(true, true, true, true, false, false, dropdownStyle.border, SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
    .setFontWeight(dropdownStyle.fontWeight);

  // How to show it (Chart 2)
  sheet.getRange("D7")
    .setDataValidation(chartTypeRule)
    .setValue("Bar Chart")
    .setBackground(dropdownStyle.background)
    .setBorder(true, true, true, true, false, false, dropdownStyle.border, SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
    .setFontWeight(dropdownStyle.fontWeight);

  // Theme
  sheet.getRange("E7")
    .setDataValidation(themeRule)
    .setValue("Union Blue")
    .setBackground("#FEF3C7")  // Yellow for theme selector
    .setBorder(true, true, true, true, false, false, "#F59E0B", SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
    .setFontWeight(dropdownStyle.fontWeight);

  // Comparison toggle
  sheet.getRange("G7")
    .setDataValidation(comparisonRule)
    .setValue("Yes")
    .setBackground("#D1FAE5")  // Green for toggle
    .setBorder(true, true, true, true, false, false, "#10B981", SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
    .setFontWeight(dropdownStyle.fontWeight);

  // Add visual dropdown indicators in row 8
  sheet.getRange("A8:G8")
    .setValues([["▼ Select", "▼ Select", "▼ Select", "▼ Select", "▼ Select", "", "▼ Select"]])
    .setFontSize(8)
    .setFontColor("#6B7280")
    .setFontStyle("italic")
    .setHorizontalAlignment("center");

  Logger.log("Interactive Dashboard controls set up successfully with enhanced visibility");
}

/**
 * Rebuilds the Interactive Dashboard based on user selections
 */
function rebuildInteractiveDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INTERACTIVE_DASHBOARD);
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!sheet || !memberSheet || !grievanceSheet) {
    SpreadsheetApp.getUi().alert('Oops! We need a few more pieces to make the magic happen!\n\n🔍 We\'re looking for your Member Directory and Grievance Log sheets.\n\n💡 Make sure they\'re set up and try again!');
    return;
  }

  try {
    SpreadsheetApp.getUi().alert('✨ Bringing your dashboard to life...\n\n🎨 Painting your data with insights!\n⏱️ Just a moment while we celebrate your work...');

    // Get user selections
    const metric1 = sheet.getRange("A7").getValue() || "Total Members";
    const chartType1 = sheet.getRange("B7").getValue() || "Donut Chart";
    const metric2 = sheet.getRange("C7").getValue() || "Active Grievances";
    const chartType2 = sheet.getRange("D7").getValue() || "Bar Chart";
    const theme = sheet.getRange("E7").getValue() || "Union Blue";
    const enableComparison = sheet.getRange("G7").getValue() || "Yes";

    // Get data
    const memberData = memberSheet.getDataRange().getValues();
    const grievanceData = grievanceSheet.getDataRange().getValues();

    // Calculate metrics for cards
    const metrics = calculateAllMetrics(memberData, grievanceData);

    // Update metric cards
    updateMetricCards(sheet, metrics);

    // Create primary chart - pass data to avoid refetch
    createDynamicChart(sheet, metric1, chartType1, metrics, "A22", 10, 20, grievanceData, memberData);

    // Create comparison chart if enabled
    if (enableComparison === "Yes") {
      createDynamicChart(sheet, metric2, chartType2, metrics, "L22", 9, 20, grievanceData, memberData);
    }

    // Create pie/donut charts
    createGrievanceStatusDonut(sheet, grievanceData);
    createLocationPieChart(sheet, grievanceData);

    // Create warehouse-style location chart
    createWarehouseLocationChart(sheet, grievanceData);

    // Update data table
    updateTopItemsTable(sheet, metric1, grievanceData, memberData);

    // Apply theme
    applyDashboardTheme(sheet, theme);

    // Create victory message based on metrics
    const victoryMsg = getVictoryMessage(metrics);

    SpreadsheetApp.getUi().alert('🎉 Your dashboard is alive and celebrating!\n\n' + victoryMsg + '\n\n✨ Keep up the amazing work!');
  } catch (error) {
    SpreadsheetApp.getUi().alert('Oops! We hit a small bump...\n\n' + error.message + '\n\n💪 No worries, let\'s try again!');
    Logger.log('Error: ' + error.toString());
  }
}

/**
 * Calculate all metrics from data
 */
function calculateAllMetrics(memberData, grievanceData) {
  const metrics = {};

  // Member metrics - using MEMBER_COLS constants
  metrics.totalMembers = memberData.length - 1;
  metrics.activeMembers = memberData.slice(1).filter(function(row) { return row[MEMBER_COLS.MEMBER_ID - 1]; }).length; // Count members with IDs
  metrics.totalStewards = memberData.slice(1).filter(function(row) { return row[MEMBER_COLS.IS_STEWARD - 1] === 'Yes'; }).length;
  metrics.unit8Members = memberData.slice(1).filter(function(row) { return row[MEMBER_COLS.UNIT - 1] === 'Unit 8'; }).length;
  metrics.unit10Members = memberData.slice(1).filter(function(row) { return row[MEMBER_COLS.UNIT - 1] === 'Unit 10'; }).length;

  // Grievance metrics - using GRIEVANCE_COLS constants
  metrics.totalGrievances = grievanceData.length - 1;
  metrics.activeGrievances = grievanceData.slice(1).filter(function(row) {
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    return status && (status === 'Open' || status === 'Pending Info');
  }).length;
  metrics.resolvedGrievances = grievanceData.slice(1).filter(function(row) {
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    return status && (status === 'Settled' || status === 'Closed');
  }).length;

  const resolvedData = grievanceData.slice(1).filter(function(row) {
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    return status && (status === 'Settled' || status === 'Closed');
  });
  metrics.grievancesWon = resolvedData.filter(function(row) {
    const resolution = row[GRIEVANCE_COLS.RESOLUTION - 1];
    return resolution && resolution.includes('Won');
  }).length;
  metrics.grievancesLost = resolvedData.filter(function(row) {
    const resolution = row[GRIEVANCE_COLS.RESOLUTION - 1];
    return resolution && resolution.includes('Lost');
  }).length;

  metrics.winRate = metrics.resolvedGrievances > 0
    ? ((metrics.grievancesWon / metrics.resolvedGrievances) * 100).toFixed(1)
    : 0;

  // Overdue = Next Action Due is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  metrics.overdueGrievances = grievanceData.slice(1).filter(function(row) {
    const nextActionDue = row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1];
    if (!nextActionDue) return false;
    const daysToDeadline = Math.floor((new Date(nextActionDue) - today) / (1000 * 60 * 60 * 24));
    return daysToDeadline < 0;
  }).length;

  // Additional metrics
  metrics.inMediation = grievanceData.slice(1).filter(function(row) { return row[GRIEVANCE_COLS.CURRENT_STEP - 1] === 'Mediation'; }).length;
  metrics.inArbitration = grievanceData.slice(1).filter(function(row) { return row[GRIEVANCE_COLS.CURRENT_STEP - 1] === 'Arbitration'; }).length;

  return metrics;
}

/**
 * Update metric cards with current data and celebratory messages
 */
function updateMetricCards(sheet, metrics) {
  // Card 1: Total Members
  sheet.getRange("A15:E17").merge()
    .setValue(formatNumber(metrics.totalMembers))
    .setNumberFormat("#,##0");

  // Add celebration message for members
  const memberMsg = getMemberCelebration(metrics.totalMembers);
  sheet.getRange("A18:E18").merge()
    .setValue(memberMsg)
    .setFontSize(9)
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setFontColor(COLORS.UNION_GREEN);

  // Card 2: Active Grievances
  sheet.getRange("F15:J17").merge()
    .setValue(formatNumber(metrics.activeGrievances))
    .setNumberFormat("#,##0");

  // Add encouraging message for grievances
  const grievanceMsg = getGrievanceCelebration(metrics.activeGrievances);
  sheet.getRange("F18:J18").merge()
    .setValue(grievanceMsg)
    .setFontSize(9)
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setFontColor(COLORS.ACCENT_ORANGE);

  // Card 3: Win Rate
  sheet.getRange("K15:O17").merge()
    .setValue(metrics.winRate + "%")
    .setNumberFormat("0.0\"%\"");

  // Add victory celebration for win rate
  const winMsg = getWinRateCelebration(parseFloat(metrics.winRate));
  sheet.getRange("K18:O18").merge()
    .setValue(winMsg)
    .setFontSize(9)
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setFontColor(COLORS.UNION_GREEN);

  // Card 4: Overdue Cases
  sheet.getRange("P15:T17").merge()
    .setValue(formatNumber(metrics.overdueGrievances))
    .setNumberFormat("#,##0");

  // Add encouraging message for overdue
  const overdueMsg = getOverdueCelebration(metrics.overdueGrievances, metrics.activeGrievances);
  sheet.getRange("P18:T18").merge()
    .setValue(overdueMsg)
    .setFontSize(9)
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setFontColor(metrics.overdueGrievances === 0 ? COLORS.UNION_GREEN : COLORS.ACCENT_ORANGE);
}

/**
 * Format number with thousands separator
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Get celebration message for member count
 */
function getMemberCelebration(count) {
  if (count > 1000) return "🎊 Wow! Over 1,000 strong!";
  if (count > 500) return "💪 Growing stronger every day!";
  if (count > 100) return "⭐ Our union is thriving!";
  return "🌱 Building our movement!";
}

/**
 * Get celebration message for active grievances
 */
function getGrievanceCelebration(count) {
  if (count === 0) return "🎉 All caught up! Amazing!";
  if (count < 5) return "👍 Nice work staying on top!";
  if (count < 20) return "💼 You're handling it!";
  return "🔥 Busy defending rights!";
}

/**
 * Get victory celebration for win rate
 */
function getWinRateCelebration(rate) {
  if (rate >= 90) return "🏆 INCREDIBLE! Nearly perfect!";
  if (rate >= 80) return "🌟 Outstanding success rate!";
  if (rate >= 70) return "✨ Great work winning cases!";
  if (rate >= 60) return "👏 Making solid progress!";
  if (rate >= 50) return "💪 Keep fighting!";
  return "🎯 Every win counts!";
}

/**
 * Get encouraging message for overdue cases
 */
function getOverdueCelebration(overdue, total) {
  if (overdue === 0) return "🎊 PERFECT! Nothing overdue!";
  const percentage = (overdue / total) * 100;
  if (percentage < 5) return "👍 Almost there!";
  if (percentage < 10) return "⚡ Making progress!";
  if (percentage < 20) return "💪 You've got this!";
  return "🔔 Time to catch up!";
}

/**
 * Get overall victory message based on all metrics
 */
function getVictoryMessage(metrics) {
  const winRate = parseFloat(metrics.winRate);
  const messages = [];

  // Check for major victories
  if (winRate >= 80) {
    messages.push("🏆 Your win rate is OUTSTANDING!");
  } else if (winRate >= 70) {
    messages.push("⭐ Great job winning cases!");
  }

  if (metrics.overdueGrievances === 0) {
    messages.push("🎊 PERFECT record - nothing overdue!");
  } else if (metrics.overdueGrievances < 5) {
    messages.push("👍 Nearly perfect on deadlines!");
  }

  if (metrics.totalMembers > 500) {
    messages.push("💪 Your union is thriving with " + formatNumber(metrics.totalMembers) + " members!");
  }

  if (messages.length === 0) {
    return "📊 Your data is looking good! Every day brings progress!";
  }

  return messages.join("\n");
}

/**
 * Create dynamic chart based on user selection
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Target sheet
 * @param {string} metricName - Metric to display
 * @param {string} chartType - Type of chart (Donut, Pie, Bar, etc)
 * @param {Object} metrics - Pre-calculated metrics
 * @param {string} startCell - Starting cell for chart
 * @param {number} width - Chart width multiplier
 * @param {number} height - Chart height multiplier
 * @param {Array<Array>} grievanceData - Grievance data (to avoid refetch)
 * @param {Array<Array>} memberData - Member data (to avoid refetch)
 */
function createDynamicChart(sheet, metricName, chartType, metrics, startCell, width, height, grievanceData, memberData) {
  try {
    // Remove existing charts in this area first
    const charts = sheet.getCharts();
    charts.forEach(function(chart) {
      const anchor = chart.getContainerInfo().getAnchorRow();
      // Extract row number correctly (handles cells like "AA22" not just "A22")
      if (anchor >= parseInt(startCell.match(/\d+/)[0])) {
        sheet.removeChart(chart);
      }
    });

    // Get data based on metric selection - pass data to avoid refetch
    const chartData = getChartDataForMetric(metricName, metrics, grievanceData, memberData);

  if (!chartData || chartData.length === 0) return;

  // Create chart based on type
  let chartBuilder;
  const range = sheet.getRange(startCell);

  if (chartType === "Donut Chart") {
    chartBuilder = sheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(sheet.getRange(startCell).offset(1, 0, chartData.length, 2))
      .setPosition(range.getRow(), range.getColumn(), 0, 0)
      .setOption('title', metricName)
      .setOption('pieHole', 0.4)
      .setOption('width', width * 60)
      .setOption('height', height * 15)
      .setOption('legend', {position: 'right'})
      .setOption('colors', [
        COLORS.PRIMARY_BLUE, COLORS.UNION_GREEN, COLORS.ACCENT_ORANGE,
        COLORS.SOLIDARITY_RED, COLORS.ACCENT_PURPLE, COLORS.ACCENT_TEAL
      ]);
  } else if (chartType === "Pie Chart") {
    chartBuilder = sheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(sheet.getRange(startCell).offset(1, 0, chartData.length, 2))
      .setPosition(range.getRow(), range.getColumn(), 0, 0)
      .setOption('title', metricName)
      .setOption('width', width * 60)
      .setOption('height', height * 15)
      .setOption('legend', {position: 'right'})
      .setOption('colors', [
        COLORS.PRIMARY_BLUE, COLORS.UNION_GREEN, COLORS.ACCENT_ORANGE,
        COLORS.SOLIDARITY_RED, COLORS.ACCENT_PURPLE, COLORS.ACCENT_TEAL
      ]);
  } else if (chartType === "Bar Chart") {
    chartBuilder = sheet.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(sheet.getRange(startCell).offset(1, 0, chartData.length, 2))
      .setPosition(range.getRow(), range.getColumn(), 0, 0)
      .setOption('title', metricName)
      .setOption('width', width * 60)
      .setOption('height', height * 15)
      .setOption('legend', {position: 'none'})
      .setOption('colors', [COLORS.PRIMARY_BLUE]);
  } else if (chartType === "Column Chart") {
    chartBuilder = sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(sheet.getRange(startCell).offset(1, 0, chartData.length, 2))
      .setPosition(range.getRow(), range.getColumn(), 0, 0)
      .setOption('title', metricName)
      .setOption('width', width * 60)
      .setOption('height', height * 15)
      .setOption('legend', {position: 'none'})
      .setOption('colors', [COLORS.PRIMARY_BLUE]);
  } else if (chartType === "Line Chart") {
    chartBuilder = sheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(sheet.getRange(startCell).offset(1, 0, chartData.length, 2))
      .setPosition(range.getRow(), range.getColumn(), 0, 0)
      .setOption('title', metricName)
      .setOption('width', width * 60)
      .setOption('height', height * 15)
      .setOption('curveType', 'function')
      .setOption('legend', {position: 'none'})
      .setOption('colors', [COLORS.PRIMARY_BLUE]);
  }

    if (chartBuilder) {
      sheet.insertChart(chartBuilder.build());
    }

    // Write data to hidden area for chart
    writeChartData(sheet, startCell, chartData);
  } catch (error) {
    handleError(error, `createDynamicChart(${metricName})`, false);
  }
}

/**
 * Write chart data to sheet (hidden area)
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Target sheet
 * @param {string} startCell - Starting cell reference
 * @param {Array<Array>} data - Data to write
 */
function writeChartData(sheet, startCell, data) {
  if (!data || data.length === 0) return;

  try {
    const startRange = sheet.getRange(startCell);
    const startRow = startRange.getRow() + 1;
    const startCol = startRange.getColumn();
    const numRows = data.length;
    const numCols = 2;

    // Get ALL merged regions in the target range and break apart any that overlap
    // This properly handles the "You must select all cells in a merged range" error
    const targetRange = sheet.getRange(startRow, startCol, numRows, numCols);
    const mergedRanges = targetRange.getMergedRanges();
    for (let i = 0; i < mergedRanges.length; i++) {
      try {
        mergedRanges[i].breakApart();
      } catch (e) {
        Logger.log('Could not break apart merged range: ' + e.message);
      }
    }

    // Clear existing content
    targetRange.clearContent();

    // Write the data
    targetRange.setValues(data);

    // Hide this data area - OPTIMIZED: batch hide instead of one-by-one
    sheet.hideRows(startRow, numRows);
  } catch (error) {
    handleError(error, 'writeChartData', false);
  }
}

/**
 * Get chart data for specific metric
 */
/**
 * Gets chart data based on selected metric
 * @param {string} metricName - Name of the metric to chart
 * @param {Object} metrics - Pre-calculated metrics object
 * @param {Array<Array>} grievanceData - Grievance data (passed to avoid refetch)
 * @param {Array<Array>} memberData - Member data (passed to avoid refetch)
 * @returns {Array<Array>} Chart data as [label, value] pairs
 */
function getChartDataForMetric(metricName, metrics, grievanceData, memberData) {
  // Data validation
  if (!grievanceData || !memberData) {
    logWarning('getChartDataForMetric', 'Missing data parameters');
    return [["No Data", 0]];
  }

  switch (metricName) {
    case "Total Members":
      return [
        ["Active", metrics.activeMembers],
        ["Inactive", metrics.totalMembers - metrics.activeMembers]
      ];

    case "Active Grievances":
      // Count actual grievances by step from Grievance Log
      const stepCounts = {};
      grievanceData.slice(1).forEach(function(row) {
        const status = row[GRIEVANCE_COLS.STATUS - 1];
        const step = row[GRIEVANCE_COLS.CURRENT_STEP - 1];
        if (status && (status === 'Open' || status === 'Pending Info')) {
          stepCounts[step] = (stepCounts[step] || 0) + 1;
        }
      });

      const stepData = Object.entries(stepCounts)
        .filter(function([step]) { return step && step !== 'Current Step'; })
        .map(function([step, count]) { return [step, count]; });

      return stepData.length > 0 ? stepData : [["No Active Grievances", 0]];

    case "Win Rate %":
      return [
        ["Won", metrics.grievancesWon],
        ["Lost", metrics.grievancesLost]
      ];

    case "Grievances by Type":
      // Count grievances by type/category
      const typeCounts = {};
      grievanceData.slice(1).forEach(function(row) {
        const type = row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1];
        if (type && type !== 'Issue Category') {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
      });

      const typeData = Object.entries(typeCounts)
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 10)
        .map(function([type, count]) { return [type, count]; });

      return typeData.length > 0 ? typeData : [["No Data", 0]];

    case "Grievances by Location":
      // Count grievances by location
      const locationCounts = {};
      grievanceData.slice(1).forEach(function(row) {
        const location = row[GRIEVANCE_COLS.LOCATION - 1];
        if (location && location !== 'Work Location (Site)') {
          locationCounts[location] = (locationCounts[location] || 0) + 1;
        }
      });

      const locationData = Object.entries(locationCounts)
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 10)
        .map(function([location, count]) { return [location, count]; });

      return locationData.length > 0 ? locationData : [["No Data", 0]];

    case "Grievances by Step":
      // Count all grievances by step
      const allStepCounts = {};
      grievanceData.slice(1).forEach(function(row) {
        const step = row[GRIEVANCE_COLS.CURRENT_STEP - 1];
        if (step && step !== 'Current Step') {
          allStepCounts[step] = (allStepCounts[step] || 0) + 1;
        }
      });

      const allStepData = Object.entries(allStepCounts)
        .map(function([step, count]) { return [step, count]; });

      return allStepData.length > 0 ? allStepData : [["No Data", 0]];

    case "Unit 8 Members":
      const unit8Count = memberData.slice(1).filter(function(row) { return row[MEMBER_COLS.UNIT - 1] === 'Unit 8'; }).length;
      return [["Unit 8", unit8Count]];

    case "Unit 10 Members":
      const unit10Count = memberData.slice(1).filter(function(row) { return row[MEMBER_COLS.UNIT - 1] === 'Unit 10'; }).length;
      return [["Unit 10", unit10Count]];

    case "Total Stewards":
      return [
        ["Stewards", metrics.totalStewards],
        ["Non-Stewards", metrics.totalMembers - metrics.totalStewards]
      ];

    default:
      return [["No Data", 0]];
  }
}

/**
 * Create Grievance Status Donut Chart
 */
function createGrievanceStatusDonut(sheet, grievanceData) {
  // Count by status
  const statusCounts = {};
  grievanceData.slice(1).forEach(function(row) {
    const status = row[GRIEVANCE_COLS.STATUS - 1] || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const data = Object.entries(statusCounts).map(function([status, count]) { return [status, count]; });

  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .setPosition(48, 1, 0, 0)
    .setOption('title', 'Grievances by Status')
    .setOption('pieHole', 0.4)
    .setOption('width', 550)
    .setOption('height', 300)
    .setOption('legend', {position: 'right'})
    .setOption('colors', [
      COLORS.PRIMARY_BLUE, COLORS.UNION_GREEN, COLORS.ACCENT_ORANGE,
      COLORS.SOLIDARITY_RED, COLORS.ACCENT_PURPLE, COLORS.ACCENT_TEAL,
      COLORS.ACCENT_YELLOW, COLORS.TEXT_GRAY
    ])
    .build();

  sheet.insertChart(chart);
}

/**
 * Create Location Pie Chart
 */
function createLocationPieChart(sheet, grievanceData) {
  // Count by location
  const locationCounts = {};
  grievanceData.slice(1).forEach(function(row) {
    const location = row[GRIEVANCE_COLS.LOCATION - 1] || 'Unknown';
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  // Get top 10
  const topLocations = Object.entries(locationCounts)
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 10);

  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .setPosition(48, 12, 0, 0)
    .setOption('title', 'Top Locations by Grievances')
    .setOption('width', 550)
    .setOption('height', 300)
    .setOption('legend', {position: 'right'})
    .setOption('colors', [
      COLORS.PRIMARY_BLUE, COLORS.UNION_GREEN, COLORS.ACCENT_ORANGE,
      COLORS.SOLIDARITY_RED, COLORS.ACCENT_PURPLE, COLORS.ACCENT_TEAL,
      COLORS.ACCENT_YELLOW, COLORS.TEXT_GRAY, COLORS.HEADER_BLUE, COLORS.HEADER_GREEN
    ])
    .build();

  sheet.insertChart(chart);
}

/**
 * Create warehouse-style location bar chart
 */
function createWarehouseLocationChart(sheet, grievanceData) {
  // This would create a horizontal bar chart similar to warehouse dashboard
  const locationCounts = {};
  grievanceData.slice(1).forEach(function(row) {
    const location = row[GRIEVANCE_COLS.LOCATION - 1] || 'Unknown';
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  const topLocations = Object.entries(locationCounts)
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 15);

  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.BAR)
    .setPosition(71, 1, 0, 0)
    .setOption('title', 'Grievances by City/Location')
    .setOption('width', 1100)
    .setOption('height', 280)
    .setOption('legend', {position: 'none'})
    .setOption('colors', [COLORS.ACCENT_PURPLE])
    .setOption('hAxis', {title: 'Number of Grievances'})
    .setOption('vAxis', {title: 'Location'})
    .build();

  sheet.insertChart(chart);
}

/**
 * Update top items data table
 */
function updateTopItemsTable(sheet, metricName, grievanceData, memberData) {
  // Clear existing data
  sheet.getRange("A94:G110").clearContent();

  let tableData = [];

  // Generate table based on selected metric
  switch (metricName) {
    case "Grievances by Type":
    case "Issue Category":
      // Show top grievance types with detailed breakdown
      const typeCounts = {};
      const typeActive = {};
      const typeResolved = {};
      const typeWon = {};

      grievanceData.slice(1).forEach(function(row) {
        const type = row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1];
        const status = row[GRIEVANCE_COLS.STATUS - 1];
        const resolution = row[GRIEVANCE_COLS.RESOLUTION - 1];

        if (type && type !== 'Issue Category') {
          typeCounts[type] = (typeCounts[type] || 0) + 1;

          if (status && (status === 'Open' || status === 'Pending Info')) {
            typeActive[type] = (typeActive[type] || 0) + 1;
          } else if (status && (status === 'Settled' || status === 'Closed')) {
            typeResolved[type] = (typeResolved[type] || 0) + 1;
            if (resolution && resolution.includes('Won')) {
              typeWon[type] = (typeWon[type] || 0) + 1;
            }
          }
        }
      });

      tableData = Object.entries(typeCounts)
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 15)
        .map(function([type, total], index) {
          const active = typeActive[type] || 0;
          const resolved = typeResolved[type] || 0;
          const won = typeWon[type] || 0;
          const winRate = resolved > 0 ? ((won / resolved) * 100).toFixed(0) + "%" : "N/A";
          const status = active === 0 ? "🟢 All Clear" : active < 5 ? "🟡 Manageable" : "🔴 High Activity";

          return [index + 1, type, total, active, resolved, winRate, status];
        });
      break;

    case "Grievances by Location":
      // Show top locations with detailed breakdown
      const locationCounts = {};
      const locationActive = {};
      const locationResolved = {};
      const locationWon = {};

      grievanceData.slice(1).forEach(function(row) {
        const location = row[GRIEVANCE_COLS.LOCATION - 1];
        const status = row[GRIEVANCE_COLS.STATUS - 1];
        const resolution = row[GRIEVANCE_COLS.RESOLUTION - 1];

        if (location && location !== 'Work Location (Site)') {
          locationCounts[location] = (locationCounts[location] || 0) + 1;

          if (status && (status === 'Open' || status === 'Pending Info')) {
            locationActive[location] = (locationActive[location] || 0) + 1;
          } else if (status && (status === 'Settled' || status === 'Closed')) {
            locationResolved[location] = (locationResolved[location] || 0) + 1;
            if (resolution && resolution.includes('Won')) {
              locationWon[location] = (locationWon[location] || 0) + 1;
            }
          }
        }
      });

      tableData = Object.entries(locationCounts)
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 15)
        .map(function([location, total], index) {
          const active = locationActive[location] || 0;
          const resolved = locationResolved[location] || 0;
          const won = locationWon[location] || 0;
          const winRate = resolved > 0 ? ((won / resolved) * 100).toFixed(0) + "%" : "N/A";
          const status = active === 0 ? "🟢 All Clear" : active < 5 ? "🟡 Manageable" : "🔴 Needs Attention";

          return [index + 1, location, total, active, resolved, winRate, status];
        });
      break;

    case "Steward Workload":
      // Show steward workload breakdown
      const stewardCounts = {};
      const stewardActive = {};
      const stewardResolved = {};
      const stewardWon = {};

      grievanceData.slice(1).forEach(function(row) {
        const steward = row[GRIEVANCE_COLS.STEWARD - 1];
        const status = row[GRIEVANCE_COLS.STATUS - 1];
        const resolution = row[GRIEVANCE_COLS.RESOLUTION - 1];

        if (steward && steward !== 'Assigned Steward (Name)') {
          stewardCounts[steward] = (stewardCounts[steward] || 0) + 1;

          if (status && (status === 'Open' || status === 'Pending Info')) {
            stewardActive[steward] = (stewardActive[steward] || 0) + 1;
          } else if (status && (status === 'Settled' || status === 'Closed')) {
            stewardResolved[steward] = (stewardResolved[steward] || 0) + 1;
            if (resolution && resolution.includes('Won')) {
              stewardWon[steward] = (stewardWon[steward] || 0) + 1;
            }
          }
        }
      });

      tableData = Object.entries(stewardCounts)
        .sort(function(a, b) { return (stewardActive[b.name] || 0) - (stewardActive[a.name] || 0); })
        .slice(0, 15)
        .map(function([steward, total], index) {
          const active = stewardActive[steward] || 0;
          const resolved = stewardResolved[steward] || 0;
          const won = stewardWon[steward] || 0;
          const winRate = resolved > 0 ? ((won / resolved) * 100).toFixed(0) + "%" : "N/A";
          const status = active === 0 ? "🟢 Available" : active < 10 ? "🟡 Busy" : "🔴 Overloaded";

          return [index + 1, steward, total, active, resolved, winRate, status];
        });
      break;

    default:
      // For other metrics, show top locations by default
      const defaultLocationCounts = {};
      grievanceData.slice(1).forEach(function(row) {
        const location = row[GRIEVANCE_COLS.LOCATION - 1];
        if (location && location !== 'Work Location (Site)') {
          defaultLocationCounts[location] = (defaultLocationCounts[location] || 0) + 1;
        }
      });

      tableData = Object.entries(defaultLocationCounts)
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 15)
        .map(function([location, count], index) {
          return [index + 1, location, count, "-", "-", "-", "📊 Data"];
        });
      break;
  }

  // Write data to table
  if (tableData.length > 0) {
    sheet.getRange(94, 1, tableData.length, 7).setValues(tableData);

    // Format alternating rows for better readability
    for (let i = 0; i < tableData.length; i++) {
      const rowNumber = 94 + i;
      if (i % 2 === 0) {
        sheet.getRange(rowNumber, 1, 1, 7).setBackground("#F9FAFB");
      }
    }
  } else {
    // Show "No data available" message
    sheet.getRange(94, 1, 1, 7).merge()
      .setValue("No data available for this metric")
      .setHorizontalAlignment("center")
      .setFontStyle("italic")
      .setFontColor("#9CA3AF");
  }
}

/**
 * Apply theme to dashboard
 */
function applyDashboardTheme(sheet, themeName) {
  let primaryColor, accentColor;

  switch (themeName) {
    case "Union Blue":
      primaryColor = COLORS.PRIMARY_BLUE;
      accentColor = COLORS.ACCENT_TEAL;
      break;
    case "Solidarity Red":
      primaryColor = COLORS.SOLIDARITY_RED;
      accentColor = COLORS.ACCENT_ORANGE;
      break;
    case "Success Green":
      primaryColor = COLORS.UNION_GREEN;
      accentColor = COLORS.ACCENT_TEAL;
      break;
    case "Professional Purple":
      primaryColor = COLORS.ACCENT_PURPLE;
      accentColor = COLORS.ACCENT_TEAL;
      break;
    default:
      primaryColor = COLORS.PRIMARY_BLUE;
      accentColor = COLORS.ACCENT_TEAL;
  }

  // Apply theme colors to headers
  sheet.getRange("A1:T1").setBackground(primaryColor);
  sheet.getRange("A4:T4").setBackground(accentColor);
  sheet.getRange("A10:T10").setBackground(primaryColor);
  sheet.getRange("A21:J21").setBackground(accentColor);
  sheet.getRange("L21:T21").setBackground(COLORS.ACCENT_PURPLE);
  sheet.getRange("A45:T45").setBackground(primaryColor);
  sheet.getRange("A47:J47").setBackground(accentColor);
  sheet.getRange("L47:T47").setBackground(COLORS.ACCENT_PURPLE);
  sheet.getRange("A68:T68").setBackground(COLORS.ACCENT_PURPLE);
  sheet.getRange("A70:T70").setBackground(accentColor);
  sheet.getRange("A91:T91").setBackground(primaryColor);
}

/**
 * Helper function to open the Interactive Dashboard sheet
 */
function openInteractiveDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INTERACTIVE_DASHBOARD);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Hmm, looks like your dashboard isn\'t set up yet!\n\n✨ No worries! Just run "509 Tools > Create Dashboard" and we\'ll get you started!');
    return;
  }

  ss.setActiveSheet(sheet);
  SpreadsheetApp.getUi().alert('🎉 Welcome to your Interactive Dashboard!\n\n' +
    '✨ Here\'s how to make it dance:\n\n' +
    '1️⃣ Pick your favorite metrics from the dropdowns in Row 7\n' +
    '2️⃣ Click "509 Tools > Interactive Dashboard > Refresh Charts" to see the magic\n' +
    '3️⃣ Turn on comparison mode to see two stories at once\n' +
    '4️⃣ Choose a theme that makes you smile!\n\n' +
    '💪 Your data is ready to tell its story!');
}
