/****************************************************
 * PERFORMANCE MONITORING DASHBOARD
 * Phase 6 - Medium Priority
 *
 * Real-time performance visibility and tracking
 * Identifies regressions and optimization opportunities
 *
 * Based on ADDITIONAL_ENHANCEMENTS.md Phase 3
 ****************************************************/

/**
 * Log performance metric for a function call
 * @param {string} funcName - Name of the function
 * @param {number} duration - Duration in milliseconds
 * @param {boolean} error - Whether an error occurred
 */
function logPerformanceMetric(funcName, duration, error = false) {
  const props = PropertiesService.getScriptProperties();
  const perfLog = JSON.parse(props.getProperty('PERFORMANCE_LOG') || '{}');

  if (!perfLog[funcName]) {
    perfLog[funcName] = {
      avgTime: 0,
      minTime: Infinity,
      maxTime: 0,
      callCount: 0,
      errorCount: 0,
      lastRun: null,
      errorRate: 0
    };
  }

  const data = perfLog[funcName];

  // Update metrics
  data.callCount++;
  data.minTime = Math.min(data.minTime, duration);
  data.maxTime = Math.max(data.maxTime, duration);
  data.avgTime = ((data.avgTime * (data.callCount - 1)) + duration) / data.callCount;
  data.lastRun = Date.now();

  if (error) {
    data.errorCount++;
  }

  data.errorRate = (data.errorCount / data.callCount) * 100;

  // Keep log size manageable (max 100 functions)
  const keys = Object.keys(perfLog);
  if (keys.length > 100) {
    // Remove oldest entries
    const sorted = keys.sort(function(a, b) { return (perfLog[a].lastRun || 0) - (perfLog[b].lastRun || 0); });
    delete perfLog[sorted[0]];
  }

  props.setProperty('PERFORMANCE_LOG', JSON.stringify(perfLog));
}

/**
 * Create or update the performance monitoring sheet
 */
function createPerformanceMonitoringSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let perfSheet = ss.getSheetByName(SHEETS.PERFORMANCE_MONITOR);

  if (!perfSheet) {
    perfSheet = ss.insertSheet(SHEETS.PERFORMANCE_MONITOR);
  }

  perfSheet.clear();

  // Headers
  const headers = [
    ['Function', 'Avg Time (ms)', 'Min Time (ms)', 'Max Time (ms)',
     'Call Count', 'Error Rate (%)', 'Last Run']
  ];

  perfSheet.getRange('A1:G1').setValues(headers);

  // Style headers
  perfSheet.getRange('A1:G1')
    .setBackground(COLORS.PRIMARY_BLUE)
    .setFontColor(COLORS.WHITE)
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Get performance data
  const props = PropertiesService.getScriptProperties();
  const perfLog = JSON.parse(props.getProperty('PERFORMANCE_LOG') || '{}');

  const rows = [];

  for (const [funcName, data] of Object.entries(perfLog)) {
    const lastRun = data.lastRun ? new Date(data.lastRun) : '';

    rows.push([
      funcName,
      Math.round(data.avgTime),
      Math.round(data.minTime === Infinity ? 0 : data.minTime),
      Math.round(data.maxTime),
      data.callCount,
      data.errorRate.toFixed(2),
      lastRun
    ]);
  }

  // Sort by average time (descending) to show slowest functions first
  rows.sort(function(a, b) { return b[1] - a[1]; });

  if (rows.length > 0) {
    perfSheet.getRange(2, 1, rows.length, 7).setValues(rows);

    // Add conditional formatting for slow functions
    const avgTimeRange = perfSheet.getRange(2, 2, rows.length, 1);

    // Slow (> 5 seconds = 5000ms) - Red
    const slowRule = SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(5000)
      .setBackground('#ffcccc')
      .setRanges([avgTimeRange])
      .build();

    // Moderate (> 1 second = 1000ms) - Yellow
    const moderateRule = SpreadsheetApp.newConditionalFormatRule()
      .whenNumberBetween(1000, 5000)
      .setBackground('#fff4cc')
      .setRanges([avgTimeRange])
      .build();

    // Fast (< 1 second) - Green
    const fastRule = SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThan(1000)
      .setBackground('#d1fae5')
      .setRanges([avgTimeRange])
      .build();

    perfSheet.setConditionalFormatRules([slowRule, moderateRule, fastRule]);

    // Add conditional formatting for error rates
    const errorRateRange = perfSheet.getRange(2, 6, rows.length, 1);

    // High error rate (> 10%) - Red
    const highErrorRule = SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(10)
      .setBackground('#ffcccc')
      .setRanges([errorRateRange])
      .build();

    // Some errors (> 0%) - Yellow
    const someErrorsRule = SpreadsheetApp.newConditionalFormatRule()
      .whenNumberBetween(0.01, 10)
      .setBackground('#fff4cc')
      .setRanges([errorRateRange])
      .build();

    perfSheet.setConditionalFormatRules([slowRule, moderateRule, fastRule, highErrorRule, someErrorsRule]);
  }

  // Add summary statistics
  const summaryRow = rows.length + 3;

  perfSheet.getRange(summaryRow, 1).setValue('SUMMARY');
  perfSheet.getRange(summaryRow, 1).setFontWeight('bold');

  perfSheet.getRange(summaryRow + 1, 1).setValue('Total Functions Tracked:');
  perfSheet.getRange(summaryRow + 1, 2).setValue(rows.length);

  perfSheet.getRange(summaryRow + 2, 1).setValue('Total Calls:');
  perfSheet.getRange(summaryRow + 2, 2).setValue(
    rows.reduce(function(sum, row) { return sum + row[4]; }, 0)
  );

  perfSheet.getRange(summaryRow + 3, 1).setValue('Last Updated:');
  perfSheet.getRange(summaryRow + 3, 2).setValue(new Date());

  // Auto-resize columns
  perfSheet.autoResizeColumns(1, 7);

  // Delete unused columns beyond the headers array length
  const headerCount = headers[0].length;
  const totalCols = perfSheet.getMaxColumns();
  if (totalCols > headerCount) {
    perfSheet.deleteColumns(headerCount + 1, totalCols - headerCount);
  }

  Logger.log('✅ Performance monitoring sheet created/updated');

  return perfSheet;
}

/**
 * Wrapper to track performance of any function (decorator pattern)
 * Note: Canonical trackPerformance() is in PerformanceAndBackup.gs (executes callback directly)
 * @param {string} funcName - Name for tracking
 * @param {Function} func - Function to track
 * @returns {Function} Wrapped function with performance tracking
 */
function trackPerformanceDecorator(funcName, func) {
  return function(...args) {
    const startTime = Date.now();

    try {
      const result = func.apply(this, args);
      const duration = Date.now() - startTime;

      logPerformanceMetric(funcName, duration, false);

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      logPerformanceMetric(funcName, duration, true);

      throw error;
    }
  };
}

/**
 * Menu function to view performance dashboard
 */
function VIEW_PERFORMANCE_DASHBOARD() {
  const ui = SpreadsheetApp.getUi();

  try {
    const sheet = createPerformanceMonitoringSheet();
    SpreadsheetApp.setActiveSheet(sheet);

    ui.alert(
      'Performance Dashboard',
      'Performance monitoring sheet has been created/updated.\n\n' +
      'Features:\n' +
      '• Average, min, max execution times\n' +
      '• Call counts and error rates\n' +
      '• Color-coded performance indicators\n\n' +
      'Slow functions (> 5s) are highlighted in red.\n' +
      'Moderate functions (1-5s) are highlighted in yellow.\n' +
      'Fast functions (< 1s) are highlighted in green.',
      ui.ButtonSet.OK
    );

  } catch (error) {
    ui.alert(
      'Error',
      `Failed to create performance dashboard: ${error.message}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Clear performance logs
 */
function clearPerformanceLogs() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Clear Performance Logs?',
    'This will delete all performance tracking data.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  const props = PropertiesService.getScriptProperties();
  props.deleteProperty('PERFORMANCE_LOG');

  Logger.log('Performance logs cleared');

  ui.alert(
    'Logs Cleared',
    'All performance tracking data has been cleared.',
    ui.ButtonSet.OK
  );
}

/**
 * Export performance data to CSV
 * @returns {string} CSV content
 */
function exportPerformanceDataCSV() {
  const props = PropertiesService.getScriptProperties();
  const perfLog = JSON.parse(props.getProperty('PERFORMANCE_LOG') || '{}');

  let csv = 'Function,Avg Time (ms),Min Time (ms),Max Time (ms),Call Count,Error Rate (%),Last Run\n';

  for (const [funcName, data] of Object.entries(perfLog)) {
    const lastRun = data.lastRun ? new Date(data.lastRun).toISOString() : '';

    csv += `${funcName},`;
    csv += `${data.avgTime.toFixed(2)},`;
    csv += `${data.minTime},`;
    csv += `${data.maxTime},`;
    csv += `${data.callCount},`;
    csv += `${data.errorRate.toFixed(2)},`;
    csv += `${lastRun}\n`;
  }

  return csv;
}

/**
 * Get performance summary
 * @returns {Object} Performance summary
 */
function getPerformanceSummary() {
  const props = PropertiesService.getScriptProperties();
  const perfLog = JSON.parse(props.getProperty('PERFORMANCE_LOG') || '{}');

  const summary = {
    totalFunctions: 0,
    totalCalls: 0,
    totalErrors: 0,
    avgExecutionTime: 0,
    slowestFunction: null,
    fastestFunction: null,
    mostCalledFunction: null
  };

  let slowestTime = 0;
  let fastestTime = Infinity;
  let mostCalls = 0;
  let totalTime = 0;

  for (const [funcName, data] of Object.entries(perfLog)) {
    summary.totalFunctions++;
    summary.totalCalls += data.callCount;
    summary.totalErrors += data.errorCount;

    totalTime += data.avgTime * data.callCount;

    if (data.avgTime > slowestTime) {
      slowestTime = data.avgTime;
      summary.slowestFunction = { name: funcName, time: data.avgTime };
    }

    if (data.avgTime < fastestTime) {
      fastestTime = data.avgTime;
      summary.fastestFunction = { name: funcName, time: data.avgTime };
    }

    if (data.callCount > mostCalls) {
      mostCalls = data.callCount;
      summary.mostCalledFunction = { name: funcName, calls: data.callCount };
    }
  }

  if (summary.totalCalls > 0) {
    summary.avgExecutionTime = totalTime / summary.totalCalls;
  }

  return summary;
}

/**
 * Show performance summary in UI
 */
function showPerformanceSummary() {
  const ui = SpreadsheetApp.getUi();
  const summary = getPerformanceSummary();

  let message = 'PERFORMANCE SUMMARY\n\n';
  message += `Total Functions Tracked: ${summary.totalFunctions}\n`;
  message += `Total Function Calls: ${summary.totalCalls}\n`;
  message += `Total Errors: ${summary.totalErrors}\n`;
  message += `Average Execution Time: ${summary.avgExecutionTime.toFixed(2)}ms\n\n`;

  if (summary.slowestFunction) {
    message += `Slowest Function: ${summary.slowestFunction.name} (${summary.slowestFunction.time.toFixed(2)}ms)\n`;
  }

  if (summary.fastestFunction) {
    message += `Fastest Function: ${summary.fastestFunction.name} (${summary.fastestFunction.time.toFixed(2)}ms)\n`;
  }

  if (summary.mostCalledFunction) {
    message += `Most Called: ${summary.mostCalledFunction.name} (${summary.mostCalledFunction.calls} calls)\n`;
  }

  ui.alert('Performance Summary', message, ui.ButtonSet.OK);
}

// Create tracked versions of critical functions
// These can be used instead of the original functions to automatically track performance

const recalcAllMembersTracked = trackPerformance('recalcAllMembers', recalcAllMembers);
const recalcAllGrievancesTracked = trackPerformance('recalcAllGrievancesBatched', recalcAllGrievancesBatched);
const rebuildDashboardTracked = trackPerformance('rebuildDashboardOptimized', rebuildDashboardOptimized);
