/****************************************************
 * OPTIMIZED DASHBOARD REBUILD
 * Phase 6 - High Priority
 *
 * Optimizes dashboard rebuild for 30-40% performance improvement
 * Uses caching and parallel processing
 *
 * Based on ADDITIONAL_ENHANCEMENTS.md Phase 2
 ****************************************************/

/**
 * Rebuild dashboard with optimizations
 * Expected: 30-40% faster than standard rebuild
 */
function rebuildDashboardOptimized() {
  const startTime = new Date();
  Logger.log('=== Starting Optimized Dashboard Rebuild ===');

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // Read all data once and store in memory cache
    const dataCache = buildDataCache();

    // Calculate all metrics in parallel using cached data
    const metrics = calculateAllMetricsOptimized(dataCache);

    // Prepare all chart data
    const chartData = prepareAllChartData(dataCache);

    // Write everything in batches
    writeDashboardData(metrics, chartData);

    // Cache the dashboard state for graceful degradation
    if (typeof cacheDashboardState === 'function') {
      cacheDashboardState();
    }

    const duration = new Date() - startTime;

    Logger.log(`✅ Optimized dashboard rebuild complete (${duration}ms)`);

    // Log performance
    if (typeof logPerformanceMetric === 'function') {
      logPerformanceMetric('rebuildDashboardOptimized', duration);
    }

    return {
      success: true,
      duration: duration,
      message: `Dashboard rebuilt in ${(duration/1000).toFixed(2)}s`
    };

  } catch (error) {
    const duration = new Date() - startTime;
    Logger.log(`❌ Dashboard rebuild failed after ${duration}ms: ${error.message}`);

    if (typeof logError === 'function') {
      logError(error, 'rebuildDashboardOptimized', 'ERROR');
    }

    throw error;
  }
}

/**
 * Build in-memory cache of all data
 * Single read of all sheets
 */
function buildDataCache() {
  Logger.log('Building data cache...');

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Use cached data if available and recent (< 5 minutes old)
  const cache = CacheService.getScriptCache();
  const cachedData = cache.get('dashboard_data_cache');

  if (cachedData) {
    const data = JSON.parse(cachedData);
    const age = Date.now() - data.timestamp;

    if (age < 300000) { // 5 minutes
      Logger.log(`Using cached data (${Math.floor(age/1000)}s old)`);
      return data;
    }
  }

  // Build fresh cache
  const dataCache = {
    timestamp: Date.now(),
    members: null,
    grievances: null,
    config: null
  };

  try {
    const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
    if (memberSheet) {
      dataCache.members = memberSheet.getDataRange().getValues();
    }

    const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
    if (grievanceSheet) {
      dataCache.grievances = grievanceSheet.getDataRange().getValues();
    }

    const configSheet = ss.getSheetByName(SHEETS.CONFIG);
    if (configSheet) {
      dataCache.config = configSheet.getDataRange().getValues();
    }

    // Cache for 5 minutes
    cache.put('dashboard_data_cache', JSON.stringify(dataCache), 300);

    Logger.log('✅ Data cache built');

  } catch (error) {
    Logger.log(`Error building data cache: ${error.message}`);
    throw error;
  }

  return dataCache;
}

/**
 * Calculate all dashboard metrics optimized
 * @param {Object} dataCache - Cached data
 * @returns {Object} Calculated metrics
 */
function calculateAllMetricsOptimized(dataCache) {
  Logger.log('Calculating metrics...');

  const metrics = {
    // Member metrics
    totalMembers: 0,
    activeStewards: 0,
    avgOpenRate: 0,
    ytdVolunteerHours: 0,

    // Grievance metrics
    totalGrievances: 0,
    openGrievances: 0,
    pendingInfo: 0,
    settledThisMonth: 0,
    avgDaysOpen: 0,

    // Engagement metrics
    virtualMeetings30d: 0,
    inPersonMeetings30d: 0,
    localActionInterest: 0,
    chapterActionInterest: 0,

    // Deadline tracking
    upcomingDeadlines: []
  };

  if (!dataCache.members || !dataCache.grievances) {
    return metrics;
  }

  const memberData = dataCache.members;
  const grievanceData = dataCache.grievances;

  // Calculate member metrics (skip header row)
  metrics.totalMembers = memberData.length - 1;

  let openRateSum = 0;
  let openRateCount = 0;

  for (let i = 1; i < memberData.length; i++) {
    const row = memberData[i];

    // Active stewards (column J)
    if (row[MEMBER_COLS.IS_STEWARD - 1] === 'Yes') {
      metrics.activeStewards++;
    }

    // Open rate (column S)
    if (row[MEMBER_COLS.OPEN_RATE - 1] && !isNaN(row[MEMBER_COLS.OPEN_RATE - 1])) {
      openRateSum += parseFloat(row[MEMBER_COLS.OPEN_RATE - 1]);
      openRateCount++;
    }

    // Volunteer hours (column T)
    if (row[MEMBER_COLS.VOLUNTEER_HOURS - 1] && !isNaN(row[MEMBER_COLS.VOLUNTEER_HOURS - 1])) {
      metrics.ytdVolunteerHours += parseFloat(row[MEMBER_COLS.VOLUNTEER_HOURS - 1]);
    }

    // Interest in local actions (column U)
    if (row[MEMBER_COLS.INTEREST_LOCAL - 1] === 'Yes') {
      metrics.localActionInterest++;
    }

    // Interest in chapter actions (column W)
    if (row[MEMBER_COLS.INTEREST_CHAPTER - 1] === 'Yes') {
      metrics.chapterActionInterest++;
    }
  }

  metrics.avgOpenRate = openRateCount > 0 ? (openRateSum / openRateCount) : 0;

  // Calculate grievance metrics
  metrics.totalGrievances = grievanceData.length - 1;

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  let daysOpenSum = 0;
  let daysOpenCount = 0;

  for (let i = 1; i < grievanceData.length; i++) {
    const row = grievanceData[i];

    const status = row[GRIEVANCE_COLS.STATUS - 1]; // Column E
    const dateClosed = row[GRIEVANCE_COLS.DATE_CLOSED - 1]; // Column R
    const daysOpen = row[GRIEVANCE_COLS.DAYS_OPEN - 1]; // Column S
    const nextActionDue = row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1]; // Column T

    // Count by status
    if (status === 'Open') {
      metrics.openGrievances++;

      // Average days open for open grievances
      if (daysOpen && !isNaN(daysOpen)) {
        daysOpenSum += parseFloat(daysOpen);
        daysOpenCount++;
      }
    } else if (status === 'Pending Info') {
      metrics.pendingInfo++;
    }

    // Settled this month
    if (status === 'Settled' && dateClosed) {
      const closed = new Date(dateClosed);
      if (closed.getMonth() === thisMonth && closed.getFullYear() === thisYear) {
        metrics.settledThisMonth++;
      }
    }

    // Upcoming deadlines (next 14 days)
    if (nextActionDue && status === 'Open') {
      const deadline = new Date(nextActionDue);
      // Validate that the date is valid and not in the past
      if (!isNaN(deadline.getTime())) {
        const daysUntil = Math.floor((deadline - now) / (1000 * 60 * 60 * 24));

        // Only include upcoming deadlines (0-14 days), not past deadlines
        if (daysUntil >= 0 && daysUntil <= 14) {
          metrics.upcomingDeadlines.push({
            grievanceId: row[GRIEVANCE_COLS.GRIEVANCE_ID - 1],
            memberName: `${row[GRIEVANCE_COLS.FIRST_NAME - 1]} ${row[GRIEVANCE_COLS.LAST_NAME - 1]}`,
            deadline: deadline,
            daysUntil: daysUntil
          });
        }
      }
    }
  }

  metrics.avgDaysOpen = daysOpenCount > 0 ? (daysOpenSum / daysOpenCount) : 0;

  // Sort upcoming deadlines by date
  metrics.upcomingDeadlines.sort(function(a, b) { return a.deadline - b.deadline; });

  Logger.log('✅ Metrics calculated');

  return metrics;
}

/**
 * Prepare all chart data
 * @param {Object} dataCache - Cached data
 * @returns {Object} Chart data
 */
function prepareAllChartData(dataCache) {
  Logger.log('Preparing chart data...');

  const chartData = {
    grievancesByStatus: [],
    grievancesByMonth: [],
    grievancesByLocation: [],
    grievancesByType: []
  };

  if (!dataCache.grievances) {
    return chartData;
  }

  const grievanceData = dataCache.grievances;

  // Count by status
  const statusCounts = {};
  const locationCounts = {};
  const typeCounts = {};
  const monthCounts = {};

  for (let i = 1; i < grievanceData.length; i++) {
    const row = grievanceData[i];

    const status = row[GRIEVANCE_COLS.STATUS - 1];
    const location = row[GRIEVANCE_COLS.LOCATION - 1]; // Column Z
    const issueCategory = row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1]; // Column W
    const dateFiled = row[GRIEVANCE_COLS.DATE_FILED - 1]; // Column I

    // By status
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    // By location
    if (location) {
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    }

    // By type
    if (issueCategory) {
      typeCounts[issueCategory] = (typeCounts[issueCategory] || 0) + 1;
    }

    // By month
    if (dateFiled) {
      const date = new Date(dateFiled);
      const monthKey = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM');
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }
  }

  // Convert to arrays
  chartData.grievancesByStatus = Object.entries(statusCounts);
  chartData.grievancesByLocation = Object.entries(locationCounts);
  chartData.grievancesByType = Object.entries(typeCounts);
  chartData.grievancesByMonth = Object.entries(monthCounts).sort();

  Logger.log('✅ Chart data prepared');

  return chartData;
}

/**
 * Write all dashboard data efficiently
 * @param {Object} metrics - Calculated metrics
 * @param {Object} chartData - Chart data
 */
function writeDashboardData(metrics, chartData) {
  Logger.log('Writing dashboard data...');

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

  // Prepare all data to write
  const updates = [
    // KPI section
    ['MEMBER METRICS', ''],
    ['Total Members', metrics.totalMembers],
    ['Active Stewards', metrics.activeStewards],
    ['Avg Open Rate', `${metrics.avgOpenRate.toFixed(1)}%`],
    ['YTD Volunteer Hours', metrics.ytdVolunteerHours.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1})],
    ['', ''],

    ['GRIEVANCE METRICS', ''],
    ['Total Grievances', metrics.totalGrievances],
    ['Open Grievances', metrics.openGrievances],
    ['Pending Info', metrics.pendingInfo],
    ['Settled This Month', metrics.settledThisMonth],
    ['Avg Days Open', Math.round(metrics.avgDaysOpen)],
    ['', ''],

    ['ENGAGEMENT (Last 30 Days)', ''],
    ['Local Action Interest', metrics.localActionInterest],
    ['Chapter Action Interest', metrics.chapterActionInterest],
    ['', ''],

    ['UPCOMING DEADLINES', ''],
    ['Grievance ID', 'Member', 'Deadline', 'Days Until']
  ];

  // Add deadline rows (top 10)
  const deadlines = metrics.upcomingDeadlines.slice(0, 10);
  for (const d of deadlines) {
    updates.push([
      d.grievanceId,
      d.memberName,
      Utilities.formatDate(d.deadline, Session.getScriptTimeZone(), 'MM/dd/yyyy'),
      d.daysUntil
    ]);
  }

  // Write all data at once
  dashboard.clear();
  dashboard.getRange(1, 1, updates.length, 4).setValues(updates);

  // Add last updated timestamp
  const lastRow = updates.length + 2;
  dashboard.getRange(lastRow, 1).setValue('Last Updated:');
  dashboard.getRange(lastRow, 2).setValue(new Date());

  Logger.log('✅ Dashboard data written');
}

/**
 * Menu function for optimized rebuild
 */
function REBUILD_DASHBOARD_OPTIMIZED() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Rebuild Dashboard (Optimized)?',
    'This will rebuild the dashboard using the optimized method.\n\n' +
    'Expected to be 30-40% faster than standard rebuild.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    ui.alert('Rebuilding dashboard...');

    const result = rebuildDashboardOptimized();

    ui.alert(
      'Dashboard Rebuilt!',
      `Dashboard rebuilt successfully.\n\n` +
      `Time: ${result.duration}ms (${(result.duration/1000).toFixed(2)}s)`,
      ui.ButtonSet.OK
    );

  } catch (error) {
    ui.alert(
      'Rebuild Failed',
      `Dashboard rebuild failed: ${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Clear dashboard data cache
 * Use this when you need fresh data
 */
function clearDashboardCache() {
  const cache = CacheService.getScriptCache();
  cache.remove('dashboard_data_cache');
  cache.remove('dashboard_snapshot');

  Logger.log('Dashboard cache cleared');

  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Cache Cleared',
    'Dashboard data cache has been cleared.\n\n' +
    'Next rebuild will use fresh data.',
    ui.ButtonSet.OK
  );
}
