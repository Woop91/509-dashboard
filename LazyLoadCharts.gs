/****************************************************
 * LAZY LOAD CHARTS SYSTEM
 * Phase 6 - Medium Priority
 *
 * Charts only built when sheets are viewed
 * Faster initial load times
 *
 * Based on ADDITIONAL_ENHANCEMENTS.md Phase 3
 ****************************************************/

/**
 * Event handler for sheet activation
 * Builds charts only when user views the sheet
 */
function onSheetActivate(e) {
  try {
    const sheetName = e.source.getActiveSheet().getName();
    Logger.log(`Sheet activated: ${sheetName}`);

    // Build charts based on which sheet was activated
    switch(sheetName) {
      case SHEETS.DASHBOARD:
        buildDashboardChartsIfNeeded();
        break;

      case SHEETS.INTERACTIVE_DASHBOARD:
        buildInteractiveChartsIfNeeded();
        break;

      case SHEETS.TRENDS:
        buildTrendsChartsIfNeeded();
        break;

      case SHEETS.LOCATION:
        buildLocationChartsIfNeeded();
        break;

      case SHEETS.TYPE_ANALYSIS:
        buildTypeAnalysisChartsIfNeeded();
        break;
    }

  } catch (error) {
    Logger.log(`Error in onSheetActivate: ${error.message}`);
  }
}

/**
 * Build dashboard charts if needed (not built recently)
 */
function buildDashboardChartsIfNeeded() {
  const sheetName = SHEETS.DASHBOARD;

  if (shouldRebuildCharts(sheetName, 300000)) { // 5 minutes
    Logger.log('Building dashboard charts...');
    buildDashboardCharts();
    updateLastBuildTime(sheetName);
  } else {
    Logger.log('Dashboard charts are recent, skipping rebuild');
  }
}

/**
 * Build interactive dashboard charts if needed
 */
function buildInteractiveChartsIfNeeded() {
  const sheetName = SHEETS.INTERACTIVE_DASHBOARD;

  if (shouldRebuildCharts(sheetName, 300000)) { // 5 minutes
    Logger.log('Building interactive dashboard charts...');

    // Call the interactive dashboard chart builder if it exists
    if (typeof buildInteractiveDashboardCharts === 'function') {
      buildInteractiveDashboardCharts();
    }

    updateLastBuildTime(sheetName);
  }
}

/**
 * Build trends charts if needed
 */
function buildTrendsChartsIfNeeded() {
  const sheetName = SHEETS.TRENDS;

  if (shouldRebuildCharts(sheetName, 600000)) { // 10 minutes (less frequently)
    Logger.log('Building trends charts...');

    // Build trends charts (implement as needed)
    if (typeof buildTrendsCharts === 'function') {
      buildTrendsCharts();
    }

    updateLastBuildTime(sheetName);
  }
}

/**
 * Build location analytics charts if needed
 */
function buildLocationChartsIfNeeded() {
  const sheetName = SHEETS.LOCATION;

  if (shouldRebuildCharts(sheetName, 600000)) { // 10 minutes
    Logger.log('Building location charts...');

    if (typeof buildLocationCharts === 'function') {
      buildLocationCharts();
    }

    updateLastBuildTime(sheetName);
  }
}

/**
 * Build type analysis charts if needed
 */
function buildTypeAnalysisChartsIfNeeded() {
  const sheetName = SHEETS.TYPE_ANALYSIS;

  if (shouldRebuildCharts(sheetName, 600000)) { // 10 minutes
    Logger.log('Building type analysis charts...');

    if (typeof buildTypeAnalysisCharts === 'function') {
      buildTypeAnalysisCharts();
    }

    updateLastBuildTime(sheetName);
  }
}

/**
 * Check if charts should be rebuilt for a sheet
 * @param {string} sheetName - Name of the sheet
 * @param {number} maxAge - Maximum age in milliseconds before rebuild
 * @returns {boolean} True if charts should be rebuilt
 */
function shouldRebuildCharts(sheetName, maxAge) {
  const props = PropertiesService.getScriptProperties();
  const key = `CHARTS_LAST_BUILD_${sheetName}`;
  const lastBuild = props.getProperty(key);

  if (!lastBuild) {
    return true; // Never built
  }

  const age = Date.now() - parseInt(lastBuild);
  return age >= maxAge;
}

/**
 * Update the last build time for a sheet
 * @param {string} sheetName - Name of the sheet
 */
function updateLastBuildTime(sheetName) {
  const props = PropertiesService.getScriptProperties();
  const key = `CHARTS_LAST_BUILD_${sheetName}`;
  props.setProperty(key, Date.now().toString());
}

/**
 * Build dashboard charts
 * Simplified version - builds basic charts only
 */
function buildDashboardCharts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName(SHEETS.DASHBOARD);

  if (!dashboard) {
    Logger.log('Dashboard sheet not found');
    return;
  }

  // Remove existing charts
  const charts = dashboard.getCharts();
  for (const chart of charts) {
    dashboard.removeChart(chart);
  }

  // Get data
  const dataCache = buildDataCache();

  if (!dataCache.grievances) {
    Logger.log('No grievance data available for charts');
    return;
  }

  try {
    // Chart 1: Grievances by Status (Pie Chart)
    buildGrievancesByStatusChart(dashboard, dataCache);

    // Chart 2: Grievances by Month (Column Chart)
    buildGrievancesByMonthChart(dashboard, dataCache);

    Logger.log('✅ Dashboard charts built');

  } catch (error) {
    Logger.log(`Error building dashboard charts: ${error.message}`);
  }
}

/**
 * Build grievances by status pie chart
 */
function buildGrievancesByStatusChart(dashboard, dataCache) {
  const grievanceData = dataCache.grievances;

  // Count by status
  const statusCounts = {};

  for (let i = 1; i < grievanceData.length; i++) {
    const status = grievanceData[i][4]; // Column E
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  // Prepare chart data
  const chartData = [['Status', 'Count']];
  for (const [status, count] of Object.entries(statusCounts)) {
    chartData.push([status, count]);
  }

  // Write data to sheet (temporary range)
  const tempRange = dashboard.getRange(50, 10, chartData.length, 2);
  tempRange.setValues(chartData);

  // Create chart
  const chart = dashboard.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(tempRange)
    .setPosition(5, 4, 0, 0)
    .setOption('title', 'Grievances by Status')
    .setOption('width', 400)
    .setOption('height', 300)
    .build();

  dashboard.insertChart(chart);

  // Clear temporary data
  tempRange.clear();
}

/**
 * Build grievances by month column chart
 */
function buildGrievancesByMonthChart(dashboard, dataCache) {
  const grievanceData = dataCache.grievances;

  // Count by month
  const monthCounts = {};

  for (let i = 1; i < grievanceData.length; i++) {
    const dateFiled = grievanceData[i][8]; // Column I

    if (dateFiled) {
      const date = new Date(dateFiled);
      const monthKey = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM');
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }
  }

  // Sort by month
  const sortedMonths = Object.entries(monthCounts).sort();

  // Prepare chart data (last 12 months)
  const chartData = [['Month', 'Grievances']];
  const recent = sortedMonths.slice(-12);

  for (const [month, count] of recent) {
    chartData.push([month, count]);
  }

  // Write data to sheet (temporary range)
  const tempRange = dashboard.getRange(70, 10, chartData.length, 2);
  tempRange.setValues(chartData);

  // Create chart
  const chart = dashboard.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(tempRange)
    .setPosition(20, 4, 0, 0)
    .setOption('title', 'Grievances by Month (Last 12)')
    .setOption('width', 600)
    .setOption('height', 300)
    .setOption('legend', { position: 'none' })
    .build();

  dashboard.insertChart(chart);

  // Clear temporary data
  tempRange.clear();
}

/**
 * Build Interactive Dashboard charts
 * Creates charts for the Interactive Dashboard sheet
 */
function buildInteractiveDashboardCharts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.INTERACTIVE_DASHBOARD);

  if (!sheet) {
    Logger.log('Interactive Dashboard sheet not found');
    return;
  }

  // Remove existing charts
  const charts = sheet.getCharts();
  for (const chart of charts) {
    sheet.removeChart(chart);
  }

  const dataCache = buildDataCache();
  if (!dataCache.grievances || dataCache.grievances.length < 2) {
    Logger.log('No grievance data available for Interactive Dashboard charts');
    return;
  }

  try {
    // Build location breakdown chart
    buildLocationBreakdownChart(sheet, dataCache);

    // Build status distribution chart
    buildStatusDistributionChart(sheet, dataCache);

    Logger.log('✅ Interactive Dashboard charts built');
  } catch (error) {
    Logger.log(`Error building Interactive Dashboard charts: ${error.message}`);
  }
}

/**
 * Build location breakdown chart for Interactive Dashboard
 */
function buildLocationBreakdownChart(sheet, dataCache) {
  const grievanceData = dataCache.grievances;
  const locationCol = GRIEVANCE_COLS.LOCATION - 1; // 0-indexed

  // Count by location
  const locationCounts = {};
  for (let i = 1; i < grievanceData.length; i++) {
    const location = grievanceData[i][locationCol] || 'Unknown';
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  }

  // Sort by count and take top 10
  const sorted = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (sorted.length === 0) return;

  const chartData = [['Location', 'Count']];
  sorted.forEach(([loc, count]) => chartData.push([loc, count]));

  // Write to temp range
  const tempRange = sheet.getRange(100, 1, chartData.length, 2);
  tempRange.setValues(chartData);

  // Create chart
  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(tempRange)
    .setPosition(25, 1, 0, 0)
    .setOption('title', 'Grievances by Location (Top 10)')
    .setOption('width', 500)
    .setOption('height', 300)
    .setOption('legend', { position: 'none' })
    .build();

  sheet.insertChart(chart);
  tempRange.clear();
}

/**
 * Build status distribution chart for Interactive Dashboard
 */
function buildStatusDistributionChart(sheet, dataCache) {
  const grievanceData = dataCache.grievances;
  const statusCol = GRIEVANCE_COLS.STATUS - 1; // 0-indexed

  // Count by status
  const statusCounts = {};
  for (let i = 1; i < grievanceData.length; i++) {
    const status = grievanceData[i][statusCol] || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  if (Object.keys(statusCounts).length === 0) return;

  const chartData = [['Status', 'Count']];
  Object.entries(statusCounts).forEach(([status, count]) => chartData.push([status, count]));

  // Write to temp range
  const tempRange = sheet.getRange(120, 1, chartData.length, 2);
  tempRange.setValues(chartData);

  // Create chart
  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(tempRange)
    .setPosition(25, 6, 0, 0)
    .setOption('title', 'Grievance Status Distribution')
    .setOption('width', 400)
    .setOption('height', 300)
    .build();

  sheet.insertChart(chart);
  tempRange.clear();
}

/**
 * Build Trends charts (monthly trends)
 * Note: SHEETS.TRENDS is deprecated, uses Operations Analytics
 */
function buildTrendsCharts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Try the new Operations Analytics sheet first, fall back to old TRENDS sheet
  let sheet = ss.getSheetByName(SHEETS.OPERATIONS_ANALYTICS);
  if (!sheet) {
    sheet = ss.getSheetByName(SHEETS.TRENDS);
  }

  if (!sheet) {
    Logger.log('Trends/Operations Analytics sheet not found');
    return;
  }

  const dataCache = buildDataCache();
  if (!dataCache.grievances || dataCache.grievances.length < 2) {
    Logger.log('No grievance data available for Trends charts');
    return;
  }

  try {
    // Remove existing charts first
    const charts = sheet.getCharts();
    for (const chart of charts) {
      sheet.removeChart(chart);
    }

    // Build monthly trend chart
    buildMonthlyTrendChart(sheet, dataCache);

    Logger.log('✅ Trends charts built');
  } catch (error) {
    Logger.log(`Error building Trends charts: ${error.message}`);
  }
}

/**
 * Build monthly trend chart showing grievances filed over time
 */
function buildMonthlyTrendChart(sheet, dataCache) {
  const grievanceData = dataCache.grievances;
  const dateFiledCol = GRIEVANCE_COLS.DATE_FILED - 1; // 0-indexed

  // Count by month
  const monthCounts = {};
  for (let i = 1; i < grievanceData.length; i++) {
    const dateFiled = grievanceData[i][dateFiledCol];
    if (dateFiled) {
      const date = new Date(dateFiled);
      const monthKey = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM');
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }
  }

  // Sort and take last 12 months
  const sorted = Object.entries(monthCounts).sort().slice(-12);
  if (sorted.length === 0) return;

  const chartData = [['Month', 'Filed']];
  sorted.forEach(([month, count]) => chartData.push([month, count]));

  // Write to temp range (far right to avoid conflicts)
  const tempRange = sheet.getRange(50, 15, chartData.length, 2);
  tempRange.setValues(chartData);

  // Create line chart
  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(tempRange)
    .setPosition(5, 10, 0, 0)
    .setOption('title', 'Monthly Grievance Trend')
    .setOption('width', 500)
    .setOption('height', 300)
    .setOption('curveType', 'function')
    .build();

  sheet.insertChart(chart);
  tempRange.clear();
}

/**
 * Build Location Analytics charts
 * Note: SHEETS.LOCATION is deprecated, uses Operations Analytics
 */
function buildLocationCharts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.OPERATIONS_ANALYTICS);
  if (!sheet) {
    sheet = ss.getSheetByName(SHEETS.LOCATION);
  }

  if (!sheet) {
    Logger.log('Location/Operations Analytics sheet not found');
    return;
  }

  const dataCache = buildDataCache();
  if (!dataCache.grievances || dataCache.grievances.length < 2) {
    Logger.log('No grievance data available for Location charts');
    return;
  }

  try {
    // Build location pie chart
    buildLocationPieChart(sheet, dataCache);

    Logger.log('✅ Location charts built');
  } catch (error) {
    Logger.log(`Error building Location charts: ${error.message}`);
  }
}

/**
 * Build location pie chart showing distribution
 */
function buildLocationPieChart(sheet, dataCache) {
  const grievanceData = dataCache.grievances;
  const locationCol = GRIEVANCE_COLS.LOCATION - 1;

  // Count by location
  const locationCounts = {};
  for (let i = 1; i < grievanceData.length; i++) {
    const location = grievanceData[i][locationCol] || 'Unknown';
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  }

  // Top 8 locations + "Other"
  const sorted = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);
  const top8 = sorted.slice(0, 8);
  const otherCount = sorted.slice(8).reduce((sum, [, count]) => sum + count, 0);

  if (top8.length === 0) return;

  const chartData = [['Location', 'Count']];
  top8.forEach(([loc, count]) => chartData.push([loc, count]));
  if (otherCount > 0) {
    chartData.push(['Other', otherCount]);
  }

  // Write to temp range
  const tempRange = sheet.getRange(80, 15, chartData.length, 2);
  tempRange.setValues(chartData);

  // Create pie chart
  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(tempRange)
    .setPosition(30, 10, 0, 0)
    .setOption('title', 'Grievances by Location')
    .setOption('width', 450)
    .setOption('height', 300)
    .build();

  sheet.insertChart(chart);
  tempRange.clear();
}

/**
 * Build Type Analysis charts (issue category breakdown)
 * Note: SHEETS.TYPE_ANALYSIS is deprecated, uses Operations Analytics
 */
function buildTypeAnalysisCharts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.OPERATIONS_ANALYTICS);
  if (!sheet) {
    sheet = ss.getSheetByName(SHEETS.TYPE_ANALYSIS);
  }

  if (!sheet) {
    Logger.log('Type Analysis/Operations Analytics sheet not found');
    return;
  }

  const dataCache = buildDataCache();
  if (!dataCache.grievances || dataCache.grievances.length < 2) {
    Logger.log('No grievance data available for Type Analysis charts');
    return;
  }

  try {
    // Build issue category chart
    buildIssueCategoryChart(sheet, dataCache);

    Logger.log('✅ Type Analysis charts built');
  } catch (error) {
    Logger.log(`Error building Type Analysis charts: ${error.message}`);
  }
}

/**
 * Build issue category bar chart
 */
function buildIssueCategoryChart(sheet, dataCache) {
  const grievanceData = dataCache.grievances;
  const categoryCol = GRIEVANCE_COLS.ISSUE_CATEGORY - 1;

  // Count by category
  const categoryCounts = {};
  for (let i = 1; i < grievanceData.length; i++) {
    const category = grievanceData[i][categoryCol] || 'Uncategorized';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  // Sort by count
  const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return;

  const chartData = [['Category', 'Count']];
  sorted.forEach(([cat, count]) => chartData.push([cat, count]));

  // Write to temp range
  const tempRange = sheet.getRange(100, 15, chartData.length, 2);
  tempRange.setValues(chartData);

  // Create bar chart
  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(tempRange)
    .setPosition(55, 10, 0, 0)
    .setOption('title', 'Grievances by Issue Category')
    .setOption('width', 500)
    .setOption('height', 350)
    .setOption('legend', { position: 'none' })
    .build();

  sheet.insertChart(chart);
  tempRange.clear();
}

/**
 * Force rebuild all charts
 * Ignores cache and rebuilds everything
 */
function forceRebuildAllCharts() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Force Rebuild All Charts?',
    'This will rebuild charts on all sheets, ignoring cache.\n\n' +
    'This may take a few minutes.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    ui.alert('Rebuilding all charts...');

    // Clear all chart build times
    clearAllChartBuildTimes();

    // Rebuild charts for each sheet
    buildDashboardCharts();

    if (typeof buildInteractiveDashboardCharts === 'function') {
      buildInteractiveDashboardCharts();
    }

    if (typeof buildTrendsCharts === 'function') {
      buildTrendsCharts();
    }

    if (typeof buildLocationCharts === 'function') {
      buildLocationCharts();
    }

    if (typeof buildTypeAnalysisCharts === 'function') {
      buildTypeAnalysisCharts();
    }

    ui.alert(
      'Charts Rebuilt',
      'All charts have been rebuilt successfully.',
      ui.ButtonSet.OK
    );

  } catch (error) {
    ui.alert(
      'Error',
      `Failed to rebuild charts: ${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Clear all chart build times
 */
function clearAllChartBuildTimes() {
  const props = PropertiesService.getScriptProperties();

  const sheets = [
    SHEETS.DASHBOARD,
    SHEETS.INTERACTIVE_DASHBOARD,
    SHEETS.TRENDS,
    SHEETS.LOCATION,
    SHEETS.TYPE_ANALYSIS
  ];

  for (const sheet of sheets) {
    props.deleteProperty(`CHARTS_LAST_BUILD_${sheet}`);
  }

  Logger.log('All chart build times cleared');
}

/**
 * Show chart build status
 */
function showChartBuildStatus() {
  const ui = SpreadsheetApp.getUi();
  const props = PropertiesService.getScriptProperties();

  const sheets = [
    SHEETS.DASHBOARD,
    SHEETS.INTERACTIVE_DASHBOARD,
    SHEETS.TRENDS,
    SHEETS.LOCATION,
    SHEETS.TYPE_ANALYSIS
  ];

  let message = 'CHART BUILD STATUS\n\n';

  for (const sheet of sheets) {
    const key = `CHARTS_LAST_BUILD_${sheet}`;
    const lastBuild = props.getProperty(key);

    if (lastBuild) {
      const date = new Date(parseInt(lastBuild));
      const age = Date.now() - parseInt(lastBuild);
      const ageMinutes = Math.floor(age / 60000);

      message += `${sheet}:\n`;
      message += `  Last built: ${ageMinutes} minutes ago\n`;
      message += `  (${date.toLocaleString()})\n\n`;
    } else {
      message += `${sheet}: Never built\n\n`;
    }
  }

  ui.alert('Chart Build Status', message, ui.ButtonSet.OK);
}

/**
 * Menu functions
 */
function FORCE_REBUILD_ALL_CHARTS() {
  forceRebuildAllCharts();
}

function SHOW_CHART_BUILD_STATUS() {
  showChartBuildStatus();
}

function CLEAR_CHART_CACHE() {
  clearAllChartBuildTimes();

  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Chart Cache Cleared',
    'Chart build cache has been cleared.\n\n' +
    'Charts will rebuild next time you view each sheet.',
    ui.ButtonSet.OK
  );
}
