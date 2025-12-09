/**
 * ============================================================================
 * BENCHMARK & COMPARISON TOOLS
 * ============================================================================
 *
 * Performance benchmarking and comparative analysis
 * Features:
 * - Year-over-year comparisons
 * - Period-to-period analysis
 * - Benchmark against averages
 * - Performance metrics
 * - Trend indicators
 * - Comparative reports
 */

/**
 * Shows benchmark dashboard
 */
function showBenchmarkDashboard() {
  const html = createBenchmarkDashboardHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(1000)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📊 Benchmark Dashboard');
}

/**
 * Creates HTML for benchmark dashboard
 */
function createBenchmarkDashboardHTML() {
  const benchmarks = calculateBenchmarks();

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 30px; border-radius: 12px; max-height: 650px; overflow-y: auto; }
    h2 { color: #1a73e8; margin-top: 0; }
    .benchmark-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 25px 0; }
    .benchmark-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #1a73e8; }
    .benchmark-title { font-size: 13px; color: #666; text-transform: uppercase; margin-bottom: 10px; }
    .benchmark-value { font-size: 32px; font-weight: bold; color: #1a73e8; margin: 10px 0; }
    .benchmark-comparison { font-size: 14px; color: #666; }
    .trend-up { color: #4caf50; }
    .trend-down { color: #f44336; }
    .trend-neutral { color: #ff9800; }
    .comparison-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .comparison-table th { background: #1a73e8; color: white; padding: 12px; text-align: left; }
    .comparison-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
    button { background: #1a73e8; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin: 5px; }
    button:hover { background: #1557b0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>📊 Performance Benchmarks</h2>

    <div class="benchmark-grid">
      <div class="benchmark-card">
        <div class="benchmark-title">Total Grievances</div>
        <div class="benchmark-value">${benchmarks.totalGrievances}</div>
        <div class="benchmark-comparison">
          <span class="trend-${benchmarks.grievanceTrend}">${benchmarks.grievanceChange}</span>
          vs last period
        </div>
      </div>

      <div class="benchmark-card">
        <div class="benchmark-title">Avg Resolution Time</div>
        <div class="benchmark-value">${benchmarks.avgResolutionDays} days</div>
        <div class="benchmark-comparison">
          <span class="trend-${benchmarks.resolutionTrend}">${benchmarks.resolutionChange}</span>
          vs last period
        </div>
      </div>

      <div class="benchmark-card">
        <div class="benchmark-title">Success Rate</div>
        <div class="benchmark-value">${benchmarks.successRate}%</div>
        <div class="benchmark-comparison">
          <span class="trend-${benchmarks.successTrend}">${benchmarks.successChange}</span>
          vs last period
        </div>
      </div>
    </div>

    <h3>Year-over-Year Comparison</h3>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>This Year</th>
          <th>Last Year</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        ${benchmarks.yearOverYear.map(row => `
          <tr>
            <td>${row.metric}</td>
            <td>${row.thisYear}</td>
            <td>${row.lastYear}</td>
            <td class="trend-${row.trend}">${row.change}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="margin-top: 20px;">
      <button onclick="exportBenchmarks()">📥 Export Report</button>
      <button onclick="google.script.host.close()">Close</button>
    </div>
  </div>

  <script>
    function exportBenchmarks() {
      google.script.run
        .withSuccessHandler((url) => {
          alert('✅ Benchmark report exported!');
          window.open(url, '_blank');
        })
        .exportBenchmarkReport();
    }
  </script>
</body>
</html>
  `;
}

/**
 * Calculates benchmark metrics
 * @returns {Object} Benchmark data
 */
function calculateBenchmarks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet || grievanceSheet.getLastRow() <= 1) {
    return getEmptyBenchmarks();
  }

  const data = grievanceSheet.getRange(2, 1, grievanceSheet.getLastRow() - 1, grievanceSheet.getLastColumn()).getValues();

  const now = new Date();
  const currentYear = now.getFullYear();
  const lastYear = currentYear - 1;

  const currentYearData = data.filter(row => {
    const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];
    return filedDate instanceof Date && filedDate.getFullYear() === currentYear;
  });

  const lastYearData = data.filter(row => {
    const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];
    return filedDate instanceof Date && filedDate.getFullYear() === lastYear;
  });

  // Calculate metrics
  const totalGrievances = currentYearData.length;
  const lastYearGrievances = lastYearData.length;
  const grievanceChange = totalGrievances - lastYearGrievances;
  const grievanceTrend = grievanceChange > 0 ? 'up' : grievanceChange < 0 ? 'down' : 'neutral';

  const avgResolutionDays = calculateAvgResolution(currentYearData);
  const lastYearAvgResolution = calculateAvgResolution(lastYearData);
  const resolutionChange = avgResolutionDays - lastYearAvgResolution;
  const resolutionTrend = resolutionChange < 0 ? 'up' : resolutionChange > 0 ? 'down' : 'neutral';

  const successRate = calculateSuccessRate(currentYearData);
  const lastYearSuccessRate = calculateSuccessRate(lastYearData);
  const successChange = successRate - lastYearSuccessRate;
  const successTrend = successChange > 0 ? 'up' : successChange < 0 ? 'down' : 'neutral';

  return {
    totalGrievances: totalGrievances,
    grievanceChange: (grievanceChange >= 0 ? '+' : '') + grievanceChange,
    grievanceTrend: grievanceTrend,
    avgResolutionDays: Math.round(avgResolutionDays),
    resolutionChange: (resolutionChange >= 0 ? '+' : '') + Math.round(resolutionChange) + ' days',
    resolutionTrend: resolutionTrend,
    successRate: Math.round(successRate),
    successChange: (successChange >= 0 ? '+' : '') + Math.round(successChange) + '%',
    successTrend: successTrend,
    yearOverYear: [
      {
        metric: 'Total Grievances',
        thisYear: totalGrievances,
        lastYear: lastYearGrievances,
        change: (grievanceChange >= 0 ? '+' : '') + grievanceChange,
        trend: grievanceTrend
      },
      {
        metric: 'Avg Resolution (days)',
        thisYear: Math.round(avgResolutionDays),
        lastYear: Math.round(lastYearAvgResolution),
        change: (resolutionChange >= 0 ? '+' : '') + Math.round(resolutionChange),
        trend: resolutionTrend
      },
      {
        metric: 'Success Rate (%)',
        thisYear: Math.round(successRate) + '%',
        lastYear: Math.round(lastYearSuccessRate) + '%',
        change: (successChange >= 0 ? '+' : '') + Math.round(successChange) + '%',
        trend: successTrend
      }
    ]
  };
}

/**
 * Calculates average resolution time
 * @param {Array} data - Grievance data
 * @returns {number} Average days
 */
function calculateAvgResolution(data) {
  const resolved = data.filter(row => {
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    return status === 'Resolved' || status === 'Closed';
  });

  if (resolved.length === 0) return 0;

  const totalDays = resolved.reduce((sum, row) => {
    const daysOpen = row[GRIEVANCE_COLS.DAYS_OPEN - 1];
    return sum + (typeof daysOpen === 'number' ? daysOpen : 0);
  }, 0);

  return totalDays / resolved.length;
}

/**
 * Calculates success rate
 * @param {Array} data - Grievance data
 * @returns {number} Success rate percentage
 */
function calculateSuccessRate(data) {
  const resolved = data.filter(row => {
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    return status === 'Resolved' || status === 'Closed';
  });

  if (data.length === 0) return 0;

  return (resolved.length / data.length) * 100;
}

/**
 * Gets empty benchmark data
 * @returns {Object} Empty benchmarks
 */
function getEmptyBenchmarks() {
  return {
    totalGrievances: 0,
    grievanceChange: '+0',
    grievanceTrend: 'neutral',
    avgResolutionDays: 0,
    resolutionChange: '+0 days',
    resolutionTrend: 'neutral',
    successRate: 0,
    successChange: '+0%',
    successTrend: 'neutral',
    yearOverYear: []
  };
}

/**
 * Exports benchmark report
 * @returns {string} Sheet URL
 */
function exportBenchmarkReport() {
  const benchmarks = calculateBenchmarks();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let reportSheet = ss.getSheetByName('Benchmark_Report');
  if (reportSheet) {
    reportSheet.clear();
  } else {
    reportSheet = ss.insertSheet('Benchmark_Report');
  }

  // Headers
  reportSheet.getRange('A1').setValue('PERFORMANCE BENCHMARKS');
  reportSheet.getRange('A1').setFontSize(16).setFontWeight('bold');

  reportSheet.getRange('A3').setValue('Generated: ' + new Date().toLocaleString());

  // Summary metrics
  reportSheet.getRange('A5:D5').setValues([['Metric', 'Current', 'Previous', 'Change']]);
  reportSheet.getRange('A5:D5').setFontWeight('bold').setBackground('#1a73e8').setFontColor('#ffffff');

  const summaryData = benchmarks.yearOverYear;
  if (summaryData.length > 0) {
    const rows = summaryData.map(row => [row.metric, row.thisYear, row.lastYear, row.change]);
    reportSheet.getRange(6, 1, rows.length, 4).setValues(rows);
  }

  // Auto-resize
  for (let col = 1; col <= 4; col++) {
    reportSheet.autoResizeColumn(col);
  }

  return ss.getUrl() + '#gid=' + reportSheet.getSheetId();
}
