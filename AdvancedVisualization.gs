/**
 * ============================================================================
 * ADVANCED DATA VISUALIZATION
 * ============================================================================
 *
 * Interactive charts and advanced visualization tools
 * Features:
 * - Multiple chart types (bar, line, pie, scatter, heatmap)
 * - Interactive chart builder
 * - Custom chart configurations
 * - Export charts as images
 * - Chart templates
 * - Real-time data updates
 * - Drill-down capabilities
 * - Comparison charts
 */

/**
 * Visualization configuration
 */
const VIZ_CONFIG = {
  CHART_TYPES: {
    BAR: 'Bar Chart',
    LINE: 'Line Chart',
    PIE: 'Pie Chart',
    COLUMN: 'Column Chart',
    AREA: 'Area Chart',
    SCATTER: 'Scatter Chart',
    COMBO: 'Combo Chart',
    TIMELINE: 'Timeline'
  },
  DEFAULT_COLORS: ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#46bdc6', '#7c3aed'],
  MAX_DATA_POINTS: 1000
};

/**
 * Shows visualization builder
 */
function showVisualizationBuilder() {
  const html = createVisualizationBuilderHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(1200)
    .setHeight(800);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📊 Advanced Visualization Builder');
}

/**
 * Creates HTML for visualization builder
 * Refactored to use helper functions for maintainability
 */
function createVisualizationBuilderHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
  <style>${getVisualizationBuilderStyles()}</style>
</head>
<body>
  <div class="layout">
${getVisualizationBuilderSidebar()}
${getVisualizationBuilderMainContent()}
  </div>
  <script>${getVisualizationBuilderScripts()}</script>
</body>
</html>
  `;
}

/**
 * Returns CSS styles for visualization builder
 */
function getVisualizationBuilderStyles() {
  return `
    body {
      font-family: 'Roboto', Arial, sans-serif;
      padding: 0;
      margin: 0;
      background: #f5f5f5;
    }
    .layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      height: 100vh;
    }
    .sidebar {
      background: white;
      padding: 20px;
      border-right: 1px solid #e0e0e0;
      overflow-y: auto;
    }
    .main {
      padding: 20px;
      overflow-y: auto;
    }
    h2 {
      color: #1a73e8;
      margin-top: 0;
      font-size: 20px;
    }
    h3 {
      color: #333;
      font-size: 16px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .form-group {
      margin: 15px 0;
    }
    label {
      display: block;
      font-weight: 500;
      margin-bottom: 5px;
      color: #555;
      font-size: 13px;
    }
    select, input {
      width: 100%;
      padding: 8px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      box-sizing: border-box;
    }
    button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 10px 16px;
      font-size: 13px;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
      margin: 5px 0;
    }
    button:hover {
      background: #1557b0;
    }
    button.secondary {
      background: #6c757d;
    }
    #chartContainer {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-height: 500px;
    }
    .chart-title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #1a73e8;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #1a73e8;
    }
    .stat-label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    .loading {
      text-align: center;
      padding: 60px;
      color: #666;
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #1a73e8;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .preset-btn {
      background: white;
      border: 2px solid #e0e0e0;
      color: #333;
      margin: 3px 0;
      text-align: left;
      padding: 12px;
      font-size: 13px;
    }
    .preset-btn:hover {
      border-color: #1a73e8;
      background: #f8f9fa;
    }
  `;
}

/**
 * Returns sidebar HTML for visualization builder
 */
function getVisualizationBuilderSidebar() {
  return `
    <div class="sidebar">
      <h2>📊 Chart Builder</h2>

      <div class="form-group">
        <label>Chart Type</label>
        <select id="chartType" onchange="updatePreview()">
          <option value="ColumnChart">Column Chart</option>
          <option value="BarChart">Bar Chart</option>
          <option value="LineChart">Line Chart</option>
          <option value="PieChart">Pie Chart</option>
          <option value="AreaChart">Area Chart</option>
          <option value="ScatterChart">Scatter Chart</option>
          <option value="Timeline">Timeline</option>
          <option value="ComboChart">Combo Chart</option>
        </select>
      </div>

      <div class="form-group">
        <label>Data Source</label>
        <select id="dataSource" onchange="updatePreview()">
          <option value="grievances-by-status">Grievances by Status</option>
          <option value="grievances-by-type">Grievances by Issue Type</option>
          <option value="grievances-by-location">Grievances by Location</option>
          <option value="grievances-by-month">Grievances by Month</option>
          <option value="resolution-time">Average Resolution Time</option>
          <option value="steward-workload">Steward Workload</option>
          <option value="trend-analysis">Trend Analysis</option>
        </select>
      </div>

      <div class="form-group">
        <label>Chart Title</label>
        <input type="text" id="chartTitle" value="Grievance Analysis" oninput="updatePreview()">
      </div>

      <div class="form-group">
        <label>Width (px)</label>
        <input type="number" id="chartWidth" value="900" oninput="updatePreview()">
      </div>

      <div class="form-group">
        <label>Height (px)</label>
        <input type="number" id="chartHeight" value="500" oninput="updatePreview()">
      </div>

      <h3>Quick Presets</h3>
      <button class="preset-btn" onclick="loadPreset('status-overview')">📊 Status Overview</button>
      <button class="preset-btn" onclick="loadPreset('monthly-trends')">📈 Monthly Trends</button>
      <button class="preset-btn" onclick="loadPreset('location-analysis')">🗺️ Location Analysis</button>
      <button class="preset-btn" onclick="loadPreset('type-breakdown')">📋 Type Breakdown</button>

      <h3>Actions</h3>
      <button onclick="generateChart()">🔄 Refresh Chart</button>
      <button onclick="exportChart()" class="secondary">📥 Export as Image</button>
      <button onclick="saveToSheet()" class="secondary">💾 Save to Sheet</button>
    </div>`;
}

/**
 * Returns main content HTML for visualization builder
 */
function getVisualizationBuilderMainContent() {
  return `
    <div class="main">
      <div id="statsContainer" class="stats-grid"></div>
      <div id="chartContainer">
        <div class="loading">
          <div class="spinner"></div>
          <div>Loading chart...</div>
        </div>
      </div>
    </div>`;
}

/**
 * Returns JavaScript for visualization builder
 */
function getVisualizationBuilderScripts() {
  const defaultColors = JSON.stringify(VIZ_CONFIG.DEFAULT_COLORS);
  return `
    google.charts.load('current', {'packages':['corechart', 'timeline']});
    google.charts.setOnLoadCallback(initializeChart);

    let chartData = null;
    let currentChart = null;

    function initializeChart() {
      loadChartData();
    }

    function loadChartData() {
      const dataSource = document.getElementById('dataSource').value;

      google.script.run
        .withSuccessHandler(renderChart)
        .withFailureHandler(handleError)
        .getChartData(dataSource);
    }

    function renderChart(data) {
      if (!data || !data.rows || data.rows.length === 0) {
        document.getElementById('chartContainer').innerHTML = '<div class="loading">No data available</div>';
        return;
      }

      chartData = data;

      // Render stats if available
      if (data.stats) {
        renderStats(data.stats);
      }

      const chartType = document.getElementById('chartType').value;
      const chartTitle = document.getElementById('chartTitle').value;
      const width = parseInt(document.getElementById('chartWidth').value);
      const height = parseInt(document.getElementById('chartHeight').value);

      const dataTable = google.visualization.arrayToDataTable([
        data.headers,
        ...data.rows
      ]);

      const options = {
        title: chartTitle,
        width: width,
        height: height,
        backgroundColor: '#ffffff',
        legend: { position: 'bottom' },
        chartArea: { width: '80%', height: '70%' },
        colors: ${defaultColors},
        animation: {
          startup: true,
          duration: 1000,
          easing: 'out'
        }
      };

      // Chart-specific options
      if (chartType === 'PieChart') {
        options.is3D = false;
        options.pieHole = 0.4;
      } else if (chartType === 'LineChart' || chartType === 'AreaChart') {
        options.curveType = 'function';
        options.pointSize = 5;
      }

      const container = document.getElementById('chartContainer');
      container.innerHTML = '';

      let chart;
      switch (chartType) {
        case 'ColumnChart':
          chart = new google.visualization.ColumnChart(container);
          break;
        case 'BarChart':
          chart = new google.visualization.BarChart(container);
          break;
        case 'LineChart':
          chart = new google.visualization.LineChart(container);
          break;
        case 'PieChart':
          chart = new google.visualization.PieChart(container);
          break;
        case 'AreaChart':
          chart = new google.visualization.AreaChart(container);
          break;
        case 'ScatterChart':
          chart = new google.visualization.ScatterChart(container);
          break;
        case 'ComboChart':
          chart = new google.visualization.ComboChart(container);
          options.seriesType = 'bars';
          options.series = {1: {type: 'line'}};
          break;
        default:
          chart = new google.visualization.ColumnChart(container);
      }

      currentChart = chart;
      chart.draw(dataTable, options);
    }

    function renderStats(stats) {
      let html = '';
      stats.forEach(stat => {
        html += \`
          <div class="stat-card">
            <div class="stat-value">\${stat.value}</div>
            <div class="stat-label">\${stat.label}</div>
          </div>
        \`;
      });

      document.getElementById('statsContainer').innerHTML = html;
    }

    function updatePreview() {
      loadChartData();
    }

    function generateChart() {
      loadChartData();
    }

    function loadPreset(presetName) {
      switch (presetName) {
        case 'status-overview':
          document.getElementById('dataSource').value = 'grievances-by-status';
          document.getElementById('chartType').value = 'PieChart';
          document.getElementById('chartTitle').value = 'Grievances by Status';
          break;
        case 'monthly-trends':
          document.getElementById('dataSource').value = 'grievances-by-month';
          document.getElementById('chartType').value = 'LineChart';
          document.getElementById('chartTitle').value = 'Monthly Grievance Trends';
          break;
        case 'location-analysis':
          document.getElementById('dataSource').value = 'grievances-by-location';
          document.getElementById('chartType').value = 'ColumnChart';
          document.getElementById('chartTitle').value = 'Grievances by Location';
          break;
        case 'type-breakdown':
          document.getElementById('dataSource').value = 'grievances-by-type';
          document.getElementById('chartType').value = 'BarChart';
          document.getElementById('chartTitle').value = 'Grievances by Issue Type';
          break;
      }
      updatePreview();
    }

    function exportChart() {
      alert('Export feature: Use browser screenshot tool or print to PDF');
    }

    function saveToSheet() {
      google.script.run
        .withSuccessHandler(() => {
          alert('✅ Chart saved to Visualizations sheet!');
        })
        .saveChartToSheet(document.getElementById('dataSource').value, document.getElementById('chartType').value);
    }

    function handleError(error) {
      document.getElementById('chartContainer').innerHTML = '<div class="loading">❌ Error: ' + error.message + '</div>';
    }
  `;
}

/**
 * Gets chart data based on data source
 * @param {string} dataSource - Data source identifier
 * @returns {Object} Chart data
 */
function getChartData(dataSource) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet || grievanceSheet.getLastRow() <= 1) {
    return { headers: [], rows: [], stats: [] };
  }

  const data = grievanceSheet.getRange(2, 1, grievanceSheet.getLastRow() - 1, grievanceSheet.getLastColumn()).getValues();

  switch (dataSource) {
    case 'grievances-by-status':
      return getGrievancesByStatus(data);

    case 'grievances-by-type':
      return getGrievancesByType(data);

    case 'grievances-by-location':
      return getGrievancesByLocation(data);

    case 'grievances-by-month':
      return getGrievancesByMonth(data);

    case 'resolution-time':
      return getResolutionTimeData(data);

    case 'steward-workload':
      return getStewardWorkloadData(data);

    case 'trend-analysis':
      return getTrendAnalysisData(data);

    default:
      return getGrievancesByStatus(data);
  }
}

/**
 * Gets grievances grouped by status
 * @param {Array} data - Grievance data
 * @returns {Object} Chart data
 */
function getGrievancesByStatus(data) {
  const statusCounts = {};

  data.forEach(row => {
    const status = row[GRIEVANCE_COLS.STATUS - 1] || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const rows = Object.entries(statusCounts).map(([status, count]) => [status, count]);

  const stats = [
    { label: 'Total Grievances', value: data.length },
    { label: 'Unique Statuses', value: Object.keys(statusCounts).length },
    { label: 'Most Common', value: Object.keys(statusCounts).reduce((a, b) => statusCounts[a] > statusCounts[b] ? a : b) }
  ];

  return {
    headers: ['Status', 'Count'],
    rows: rows,
    stats: stats
  };
}

/**
 * Gets grievances grouped by issue type
 * @param {Array} data - Grievance data
 * @returns {Object} Chart data
 */
function getGrievancesByType(data) {
  const typeCounts = {};

  data.forEach(row => {
    const type = row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1] || 'Unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const rows = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => [type, count]);

  const stats = [
    { label: 'Total Types', value: Object.keys(typeCounts).length },
    { label: 'Most Common Type', value: rows[0] ? rows[0][0] : 'N/A' },
    { label: 'Cases in Top Type', value: rows[0] ? rows[0][1] : 0 }
  ];

  return {
    headers: ['Issue Type', 'Count'],
    rows: rows,
    stats: stats
  };
}

/**
 * Gets grievances grouped by location
 * @param {Array} data - Grievance data
 * @returns {Object} Chart data
 */
function getGrievancesByLocation(data) {
  const locationCounts = {};

  data.forEach(row => {
    const location = row[GRIEVANCE_COLS.LOCATION - 1] || 'Unknown';
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  const rows = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)  // Top 15 locations
    .map(([location, count]) => [location, count]);

  const stats = [
    { label: 'Total Locations', value: Object.keys(locationCounts).length },
    { label: 'Top Location', value: rows[0] ? rows[0][0] : 'N/A' },
    { label: 'Cases in Top Location', value: rows[0] ? rows[0][1] : 0 }
  ];

  return {
    headers: ['Location', 'Count'],
    rows: rows,
    stats: stats
  };
}

/**
 * Gets grievances grouped by month
 * @param {Array} data - Grievance data
 * @returns {Object} Chart data
 */
function getGrievancesByMonth(data) {
  const monthCounts = {};

  data.forEach(row => {
    const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];
    if (filedDate instanceof Date) {
      const monthKey = Utilities.formatDate(filedDate, Session.getScriptTimeZone(), 'yyyy-MM');
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }
  });

  const rows = Object.entries(monthCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)  // Last 12 months
    .map(([month, count]) => [month, count]);

  const avgPerMonth = rows.length > 0 ? Math.round(rows.reduce((sum, row) => sum + row[1], 0) / rows.length) : 0;

  const stats = [
    { label: 'Months Tracked', value: rows.length },
    { label: 'Avg per Month', value: avgPerMonth },
    { label: 'Peak Month', value: rows.length > 0 ? rows.reduce((max, row) => row[1] > max[1] ? row : max)[0] : 'N/A' }
  ];

  return {
    headers: ['Month', 'Grievances'],
    rows: rows,
    stats: stats
  };
}

/**
 * Gets resolution time data
 * @param {Array} data - Grievance data
 * @returns {Object} Chart data
 */
function getResolutionTimeData(data) {
  const resolutionTimes = {};

  data.forEach(row => {
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    const daysOpen = row[GRIEVANCE_COLS.DAYS_OPEN - 1];

    if (daysOpen && typeof daysOpen === 'number') {
      if (!resolutionTimes[status]) {
        resolutionTimes[status] = [];
      }
      resolutionTimes[status].push(daysOpen);
    }
  });

  const rows = Object.entries(resolutionTimes).map(([status, times]) => {
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    return [status, Math.round(avg)];
  });

  const overallAvg = rows.length > 0 ? Math.round(rows.reduce((sum, row) => sum + row[1], 0) / rows.length) : 0;

  const stats = [
    { label: 'Avg Resolution Time', value: overallAvg + ' days' },
    { label: 'Fastest Status', value: rows.length > 0 ? rows.reduce((min, row) => row[1] < min[1] ? row : min)[0] : 'N/A' },
    { label: 'Slowest Status', value: rows.length > 0 ? rows.reduce((max, row) => row[1] > max[1] ? row : max)[0] : 'N/A' }
  ];

  return {
    headers: ['Status', 'Avg Days'],
    rows: rows,
    stats: stats
  };
}

/**
 * Gets steward workload data
 * @param {Array} data - Grievance data
 * @returns {Object} Chart data
 */
function getStewardWorkloadData(data) {
  const stewardCounts = {};

  data.forEach(row => {
    const steward = row[GRIEVANCE_COLS.STEWARD - 1] || 'Unassigned';
    const status = row[GRIEVANCE_COLS.STATUS - 1];

    if (status !== 'Resolved' && status !== 'Withdrawn') {
      stewardCounts[steward] = (stewardCounts[steward] || 0) + 1;
    }
  });

  const rows = Object.entries(stewardCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)  // Top 10 stewards
    .map(([steward, count]) => [steward, count]);

  const avgWorkload = rows.length > 0 ? Math.round(rows.reduce((sum, row) => sum + row[1], 0) / rows.length) : 0;

  const stats = [
    { label: 'Active Stewards', value: rows.length },
    { label: 'Avg Caseload', value: avgWorkload },
    { label: 'Highest Caseload', value: rows[0] ? rows[0][1] : 0 }
  ];

  return {
    headers: ['Steward', 'Active Cases'],
    rows: rows,
    stats: stats
  };
}

/**
 * Gets trend analysis data
 * @param {Array} data - Grievance data
 * @returns {Object} Chart data
 */
function getTrendAnalysisData(data) {
  const monthlyData = {};

  data.forEach(row => {
    const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];
    if (filedDate instanceof Date) {
      const monthKey = Utilities.formatDate(filedDate, Session.getScriptTimeZone(), 'yyyy-MM');

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { filed: 0, resolved: 0 };
      }

      monthlyData[monthKey].filed++;

      const closedDate = row[GRIEVANCE_COLS.DATE_CLOSED - 1];
      if (closedDate instanceof Date) {
        const closedMonth = Utilities.formatDate(closedDate, Session.getScriptTimeZone(), 'yyyy-MM');
        if (!monthlyData[closedMonth]) {
          monthlyData[closedMonth] = { filed: 0, resolved: 0 };
        }
        monthlyData[closedMonth].resolved++;
      }
    }
  });

  const rows = Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([month, counts]) => [month, counts.filed, counts.resolved]);

  const stats = [
    { label: 'Months Tracked', value: rows.length },
    { label: 'Total Filed', value: rows.reduce((sum, row) => sum + row[1], 0) },
    { label: 'Total Resolved', value: rows.reduce((sum, row) => sum + row[2], 0) }
  ];

  return {
    headers: ['Month', 'Filed', 'Resolved'],
    rows: rows,
    stats: stats
  };
}

/**
 * Saves chart to sheet
 * @param {string} dataSource - Data source
 * @param {string} chartType - Chart type
 */
function saveChartToSheet(dataSource, chartType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let vizSheet = ss.getSheetByName('Visualizations');

  if (!vizSheet) {
    vizSheet = ss.insertSheet('Visualizations');
  }

  const chartData = getChartData(dataSource);

  // Clear and add data
  vizSheet.clear();
  vizSheet.getRange(1, 1, 1, chartData.headers.length).setValues([chartData.headers]);
  if (chartData.rows.length > 0) {
    vizSheet.getRange(2, 1, chartData.rows.length, chartData.headers.length).setValues(chartData.rows);
  }

  // Create embedded chart
  const dataRange = vizSheet.getRange(1, 1, chartData.rows.length + 1, chartData.headers.length);

  let chartBuilder = vizSheet.newChart()
    .setPosition(chartData.rows.length + 3, 1, 0, 0)
    .addRange(dataRange)
    .setOption('title', dataSource.replace(/-/g, ' ').toUpperCase())
    .setOption('width', 800)
    .setOption('height', 500);

  // Set chart type
  switch (chartType) {
    case 'ColumnChart':
      chartBuilder.setChartType(Charts.ChartType.COLUMN);
      break;
    case 'BarChart':
      chartBuilder.setChartType(Charts.ChartType.BAR);
      break;
    case 'LineChart':
      chartBuilder.setChartType(Charts.ChartType.LINE);
      break;
    case 'PieChart':
      chartBuilder.setChartType(Charts.ChartType.PIE);
      break;
    case 'AreaChart':
      chartBuilder.setChartType(Charts.ChartType.AREA);
      break;
    case 'ScatterChart':
      chartBuilder.setChartType(Charts.ChartType.SCATTER);
      break;
    default:
      chartBuilder.setChartType(Charts.ChartType.COLUMN);
  }

  const chart = chartBuilder.build();
  vizSheet.insertChart(chart);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Chart saved to Visualizations sheet!',
    'Chart Saved',
    3
  );
}
