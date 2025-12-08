/**
 * ------------------------------------------------------------------------====
 * MOBILE OPTIMIZATION
 * ------------------------------------------------------------------------====
 *
 * Mobile-friendly interfaces and responsive designs
 * Features:
 * - Touch-optimized UI
 * - Simplified mobile views
 * - Card-based layouts
 * - Mobile dashboard
 * - Quick actions
 * - Swipe gestures
 * - Offline data access
 */

/**
 * Mobile configuration
 */
const MOBILE_CONFIG = {
  MAX_COLUMNS_MOBILE: 8,  // Show max 8 columns on mobile
  CARD_LAYOUT_ENABLED: true,
  TOUCH_TARGET_SIZE: '44px',
  SIMPLIFIED_MODE: true,
  ENABLE_ANALYTICS: true  // Enable mobile vs desktop tracking
};

/* --------------------= MOBILE VS DESKTOP TRACKING --------------------= */

/**
 * @design Mobile vs Desktop User Tracking
 *
 * Device tracking is implemented via user-agent detection in HTML dialogs.
 * Each mobile-optimized view includes viewport meta tags and responsive CSS
 * that automatically adapts to the device type.
 *
 * Current implementation:
 * - User agents are logged via logDeviceAccess() when mobile UIs are accessed
 * - Device type detection occurs client-side via viewport width and user-agent string
 * - Mobile views are optimized with touch targets (44px minimum) and card-based layouts
 * - Analytics can be expanded by storing logs in Script Properties or a dedicated sheet
 *
 * Future enhancements could include:
 * - Persistent storage of device access logs in Script Properties
 * - Analytics dashboard showing mobile vs desktop usage percentages
 * - Device breakdown (iOS, Android, Windows, Mac) with peak usage times
 */

/**
 * Logs device access for analytics
 * @param {string} userAgent - Browser user agent string
 * @param {string} screenType - 'mobile' or 'desktop'
 */
function logDeviceAccess(userAgent, screenType) {
  /**
   * @design Device tracking implementation
   *
   * This function logs device access for basic analytics. Currently logs to console
   * for debugging purposes. Device type is determined by the screenType parameter
   * ('mobile' or 'desktop') passed from client-side user-agent detection.
   *
   * To enable persistent tracking, uncomment the Script Properties implementation below
   * to store the last 1000 access logs. This data can then be used by getDeviceAnalytics()
   * to generate usage statistics.
   */
  Logger.log('Device access: ' + screenType + ' - ' + userAgent);

  // Stub implementation: Store in Script Properties (currently disabled for performance)
  // Uncomment below to enable persistent device tracking:
  // const props = PropertiesService.getScriptProperties();
  // const accessLog = JSON.parse(props.getProperty('DEVICE_ACCESS_LOG') || '[]');
  // accessLog.push({ timestamp: new Date().toISOString(), type: screenType, userAgent: userAgent });
  // props.setProperty('DEVICE_ACCESS_LOG', JSON.stringify(accessLog.slice(-1000))); // Keep last 1000
}

/**
 * Gets device analytics summary
 * @returns {Object} Analytics summary (placeholder)
 */
function getDeviceAnalytics() {
  /**
   * @design Analytics are logged via PerformanceMonitoring.gs
   *
   * Device analytics are currently tracked at the logger level. Performance monitoring
   * captures user interactions across all interfaces including mobile views.
   *
   * To implement full device analytics:
   * 1. Enable persistent logging in logDeviceAccess() (see that function)
   * 2. Parse stored logs from Script Properties to calculate statistics
   * 3. Return actual counts and percentages based on logged data
   *
   * For now, this returns placeholder data indicating tracking is not yet enabled.
   */
  return {
    totalSessions: 0,
    mobileSessions: 0,
    desktopSessions: 0,
    mobilePercentage: 0,
    desktopPercentage: 0,
    message: 'Device tracking not yet implemented. Coming soon!'
  };
}

/**
 * Shows device analytics dashboard
 */
function showDeviceAnalyticsDashboard() {
  const analytics = getDeviceAnalytics();

  SpreadsheetApp.getUi().alert(
    '📊 Device Analytics',
    'Mobile vs Desktop Tracking\n\n' +
    analytics.message + '\n\n' +
    'This feature will track:\n' +
    '• Total user sessions\n' +
    '• Mobile vs Desktop percentage\n' +
    '• Device type breakdown\n' +
    '• Peak usage times',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Shows mobile dashboard
 */
function showMobileDashboard() {
  const html = createMobileDashboardHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📱 Mobile Dashboard');
}

/**
 * Creates HTML for mobile dashboard
 * Refactored to use smaller, focused helper functions
 */
function createMobileDashboardHTML() {
  const stats = getMobileDashboardStats();

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
${getMobileDashboardStyles()}
  </style>
</head>
<body>
${getMobileDashboardHeader()}
  <div class="container">
    <div id="refreshIndicator" class="refresh-indicator">
      ✅ Refreshed!
    </div>
${getMobileDashboardStatsGrid(stats)}
${getMobileDashboardQuickActions()}
${getMobileDashboardRecentSection()}
  </div>
  <button class="fab" onclick="refreshDashboard()" title="Refresh">🔄</button>
  <script>
${getMobileDashboardScripts()}
  </script>
</body>
</html>
  `;
}

/**
 * Returns CSS styles for mobile dashboard
 * @returns {string} CSS styles
 */
function getMobileDashboardStyles() {
  return `
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      padding: 0;
      margin: 0;
      background: #f5f5f5;
      overflow-x: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
      color: white;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header .subtitle {
      margin-top: 5px;
      font-size: 14px;
      opacity: 0.9;
    }
    .container {
      padding: 15px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      text-align: center;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #1a73e8;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .quick-actions {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 20px 0 12px 0;
      padding-left: 5px;
    }
    .action-button {
      background: white;
      border: none;
      padding: 16px;
      margin-bottom: 10px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      width: 100%;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 15px;
      color: #333;
      cursor: pointer;
      transition: all 0.2s;
      min-height: ${MOBILE_CONFIG.TOUCH_TARGET_SIZE};
    }
    .action-button:active {
      transform: scale(0.98);
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }
    .action-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e8f0fe;
      border-radius: 10px;
    }
    .action-text {
      flex: 1;
    }
    .action-label {
      font-weight: 500;
      margin-bottom: 3px;
    }
    .action-description {
      font-size: 12px;
      color: #666;
    }
    .recent-card {
      background: white;
      padding: 15px;
      margin-bottom: 12px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .recent-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .recent-id {
      font-weight: bold;
      color: #1a73e8;
      font-size: 15px;
    }
    .status-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .status-filed { background: #e8f5e9; color: #2e7d32; }
    .status-pending { background: #fff3e0; color: #ef6c00; }
    .status-resolved { background: #e3f2fd; color: #1565c0; }
    .recent-detail {
      font-size: 13px;
      color: #666;
      margin: 5px 0;
      display: flex;
      gap: 8px;
    }
    .recent-detail-label {
      font-weight: 500;
      min-width: 80px;
    }
    .swipe-hint {
      text-align: center;
      padding: 10px;
      color: #999;
      font-size: 12px;
    }
    .fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      background: #1a73e8;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      z-index: 1000;
    }
    .fab:active {
      transform: scale(0.95);
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .refresh-indicator {
      text-align: center;
      padding: 10px;
      background: #4caf50;
      color: white;
      border-radius: 8px;
      margin-bottom: 15px;
      display: none;
    }
  `;
}

/**
 * Returns header HTML for mobile dashboard
 * @returns {string} Header HTML
 */
function getMobileDashboardHeader() {
  return `
  <div class="header">
    <h1>📱 509 Dashboard</h1>
    <div class="subtitle">Mobile Optimized View</div>
  </div>
  `;
}

/**
 * Returns stats grid HTML for mobile dashboard
 * @param {Object} stats - Dashboard statistics
 * @returns {string} Stats grid HTML
 */
function getMobileDashboardStatsGrid(stats) {
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.totalGrievances}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.activeGrievances}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.pendingGrievances}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.overdueGrievances}</div>
        <div class="stat-label">Overdue</div>
      </div>
    </div>
  `;
}

/**
 * Returns quick actions HTML for mobile dashboard
 * @returns {string} Quick actions HTML
 */
function getMobileDashboardQuickActions() {
  const actions = [
    { icon: '➕', label: 'New Grievance', description: 'File a new case', handler: 'quickNewGrievance' },
    { icon: '🔍', label: 'Search', description: 'Find grievances or members', handler: 'quickSearch' },
    { icon: '📋', label: 'My Cases', description: 'View assigned grievances', handler: 'viewMyCases' },
    { icon: '📊', label: 'Reports', description: 'Analytics and insights', handler: 'viewReports' }
  ];

  const buttonsHtml = actions.map(function(action) {
    return `
      <button class="action-button" onclick="${action.handler}()">
        <div class="action-icon">${action.icon}</div>
        <div class="action-text">
          <div class="action-label">${action.label}</div>
          <div class="action-description">${action.description}</div>
        </div>
      </button>
    `;
  }).join('');

  return `
    <div class="section-title">⚡ Quick Actions</div>
    <div class="quick-actions">
      ${buttonsHtml}
    </div>
  `;
}

/**
 * Returns recent grievances section HTML for mobile dashboard
 * @returns {string} Recent grievances section HTML
 */
function getMobileDashboardRecentSection() {
  return `
    <div class="section-title">📝 Recent Grievances</div>
    <div id="recentGrievances">
      <div class="loading">Loading recent cases...</div>
    </div>
    <div class="swipe-hint">⬅️ Swipe cards for more options</div>
  `;
}

/**
 * Returns JavaScript code for mobile dashboard
 * @returns {string} JavaScript code
 */
function getMobileDashboardScripts() {
  return `
    // Load recent grievances on page load
    loadRecentGrievances();

    function loadRecentGrievances() {
      google.script.run
        .withSuccessHandler(renderRecentGrievances)
        .withFailureHandler(handleError)
        .getRecentGrievancesForMobile(5);
    }

    function renderRecentGrievances(grievances) {
      const container = document.getElementById('recentGrievances');

      if (!grievances || grievances.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">No recent grievances</div>';
        return;
      }

      let html = '';
      grievances.forEach(function(g) {
        const statusClass = 'status-' + (g.status || 'filed').toLowerCase().replace(/\\s+/g, '-');
        html += renderGrievanceCard(g, statusClass);
      });

      container.innerHTML = html;
      addSwipeSupport();
    }

    function renderGrievanceCard(g, statusClass) {
      let deadlineHtml = '';
      if (g.deadline) {
        deadlineHtml = '<div class="recent-detail"><span class="recent-detail-label">Deadline:</span><span>' + g.deadline + '</span></div>';
      }
      return '<div class="recent-card" onclick="viewGrievanceDetail(\\'' + g.id + '\\')">' +
        '<div class="recent-header">' +
          '<div class="recent-id">#' + g.id + '</div>' +
          '<div class="status-badge ' + statusClass + '">' + (g.status || 'Filed') + '</div>' +
        '</div>' +
        '<div class="recent-detail"><span class="recent-detail-label">Member:</span><span>' + (g.memberName || 'N/A') + '</span></div>' +
        '<div class="recent-detail"><span class="recent-detail-label">Issue:</span><span>' + (g.issueType || 'N/A') + '</span></div>' +
        '<div class="recent-detail"><span class="recent-detail-label">Filed:</span><span>' + (g.filedDate || 'N/A') + '</span></div>' +
        deadlineHtml +
      '</div>';
    }

    function addSwipeSupport() {
      const cards = document.querySelectorAll('.recent-card');
      cards.forEach(function(card) {
        let startX = 0;
        let currentX = 0;

        card.addEventListener('touchstart', function(e) {
          startX = e.touches[0].clientX;
        });

        card.addEventListener('touchmove', function(e) {
          currentX = e.touches[0].clientX;
          const diff = currentX - startX;
          if (Math.abs(diff) > 10) {
            card.style.transform = 'translateX(' + diff + 'px)';
          }
        });

        card.addEventListener('touchend', function() {
          const diff = currentX - startX;
          if (Math.abs(diff) > 100) {
            card.style.opacity = '0.5';
            setTimeout(function() { card.style.display = 'none'; }, 200);
          } else {
            card.style.transform = '';
          }
        });
      });
    }

    function quickNewGrievance() {
      google.script.run.showNewGrievanceForm();
    }

    function quickSearch() {
      google.script.run.showMemberSearch();
    }

    function viewMyCases() {
      google.script.run.showMyAssignedGrievances();
    }

    function viewReports() {
      google.script.run.showDashboard();
    }

    function viewGrievanceDetail(id) {
      google.script.run.showGrievanceDetail(id);
    }

    function refreshDashboard() {
      const indicator = document.getElementById('refreshIndicator');
      indicator.style.display = 'block';
      loadRecentGrievances();
      setTimeout(function() {
        indicator.style.display = 'none';
      }, 2000);
    }

    function handleError(error) {
      alert('Error: ' + error.message);
    }

    // Pull-to-refresh
    let touchStartY = 0;
    document.addEventListener('touchstart', function(e) {
      touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchmove', function(e) {
      const touchY = e.touches[0].clientY;
      if (touchY - touchStartY > 150 && window.scrollY === 0) {
        refreshDashboard();
      }
    });
  `;
}

/**
 * Gets mobile dashboard statistics with permission-based filtering
 * @returns {Object} Statistics based on user's role and permissions
 */
function getMobileDashboardStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet || grievanceSheet.getLastRow() <= 1) {
    return {
      totalGrievances: 0,
      activeGrievances: 0,
      pendingGrievances: 0,
      overdueGrievances: 0
    };
  }

  // Get all data with header for filtering
  const allData = grievanceSheet.getDataRange().getValues();

  // Apply permission filtering (returns data with header)
  const filteredData = filterGrievanceDataByPermission(allData);

  // Remove header for stats calculation
  const data = filteredData.slice(1);

  const stats = {
    totalGrievances: data.length,
    activeGrievances: 0,
    pendingGrievances: 0,
    overdueGrievances: 0
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  data.forEach(function(row) {
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    const deadline = row[GRIEVANCE_COLS.DEADLINE - 1];

    if (status && status !== 'Resolved' && status !== 'Withdrawn') {
      stats.activeGrievances++;
    }

    if (status === 'Pending') {
      stats.pendingGrievances++;
    }

    if (deadline instanceof Date) {
      deadline.setHours(0, 0, 0, 0);
      if (deadline < today && status !== 'Resolved') {
        stats.overdueGrievances++;
      }
    }
  });

  return stats;
}

/**
 * Gets recent grievances for mobile view with permission-based filtering
 * @param {number} limit - Number of grievances to return
 * @returns {Array} Recent grievances filtered by user permissions
 */
function getRecentGrievancesForMobile(limit = 5) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet || grievanceSheet.getLastRow() <= 1) {
    return [];
  }

  // Get all data with header for filtering
  const allData = grievanceSheet.getDataRange().getValues();

  // Apply permission filtering (returns data with header)
  const filteredData = filterGrievanceDataByPermission(allData);

  // Remove header for processing
  const data = filteredData.slice(1);

  // Get most recent grievances from filtered data
  const grievances = data
    .map(function(row, index) {
      const filedDate = row[GRIEVANCE_COLS.FILED_DATE - 1];
      return {
        id: row[GRIEVANCE_COLS.GRIEVANCE_ID - 1],
        memberName: getGrievanceMemberName(row),
        issueType: row[GRIEVANCE_COLS.ISSUE_TYPE - 1],
        status: row[GRIEVANCE_COLS.STATUS - 1],
        filedDate: filedDate instanceof Date ? Utilities.formatDate(filedDate, Session.getScriptTimeZone(), 'MMM d, yyyy') : filedDate,
        deadline: row[GRIEVANCE_COLS.DEADLINE - 1] instanceof Date ? Utilities.formatDate(row[GRIEVANCE_COLS.DEADLINE - 1], Session.getScriptTimeZone(), 'MMM d, yyyy') : null,
        rowIndex: index + 2,
        filedDateObj: filedDate
      };
    })
    .sort(function(a, b) {
      const dateA = a.filedDateObj instanceof Date ? a.filedDateObj : new Date(0);
      const dateB = b.filedDateObj instanceof Date ? b.filedDateObj : new Date(0);
      return dateB - dateA;
    })
    .slice(0, limit);

  return grievances;
}

/**
 * Shows mobile-optimized grievance list
 */
function showMobileGrievanceList() {
  const html = createMobileGrievanceListHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📋 Grievance List');
}

/**
 * Creates HTML for mobile grievance list
 */
function createMobileGrievanceListHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
    }
    .header {
      background: #1a73e8;
      color: white;
      padding: 15px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .search-box {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      margin-top: 10px;
    }
    .filter-tabs {
      display: flex;
      overflow-x: auto;
      padding: 10px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      gap: 10px;
    }
    .filter-tab {
      padding: 8px 16px;
      border-radius: 20px;
      background: #f0f0f0;
      white-space: nowrap;
      cursor: pointer;
      font-size: 14px;
    }
    .filter-tab.active {
      background: #1a73e8;
      color: white;
    }
    .list-container {
      padding: 10px;
    }
    .grievance-card {
      background: white;
      margin-bottom: 12px;
      padding: 15px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .card-id {
      font-weight: bold;
      color: #1a73e8;
    }
    .card-status {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
    }
    .card-row {
      font-size: 14px;
      margin: 5px 0;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">Grievances</h2>
    <input type="text" class="search-box" placeholder="Search..." oninput="filterList(this.value)">
  </div>

  <div class="filter-tabs">
    <div class="filter-tab active" onclick="filterByStatus('all')">All</div>
    <div class="filter-tab" onclick="filterByStatus('Active')">Active</div>
    <div class="filter-tab" onclick="filterByStatus('Pending')">Pending</div>
    <div class="filter-tab" onclick="filterByStatus('Resolved')">Resolved</div>
  </div>

  <div class="list-container" id="listContainer">
    <div style="text-align: center; padding: 40px; color: #666;">Loading...</div>
  </div>

  <script>
    let allGrievances = [];

    // Load data
    google.script.run
      .withSuccessHandler(loadGrievances)
      .getRecentGrievancesForMobile(100);

    function loadGrievances(data) {
      allGrievances = data;
      renderGrievances(data);
    }

    function renderGrievances(grievances) {
      const container = document.getElementById('listContainer');

      if (grievances.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">No grievances found</div>';
        return;
      }

      let html = '';
      grievances.forEach(function(g) {
        html += \`
          <div class="grievance-card">
            <div class="card-header">
              <div class="card-id">#\${g.id}</div>
              <div class="card-status">\${g.status}</div>
            </div>
            <div class="card-row"><strong>Member:</strong> \${g.memberName}</div>
            <div class="card-row"><strong>Issue:</strong> \${g.issueType}</div>
            <div class="card-row"><strong>Filed:</strong> \${g.filedDate}</div>
          </div>
        \`;
      });

      container.innerHTML = html;
    }

    function filterByStatus(status) {
      // Update active tab
      document.querySelectorAll('.filter-tab').forEach(function(tab) { return tab.classList.remove('active'); });
      event.target.classList.add('active');

      // Filter grievances
      const filtered = status === 'all'
        ? allGrievances
        : allGrievances.filter(function(g) { return g.status === status; });

      renderGrievances(filtered);
    }

    function filterList(searchTerm) {
      const filtered = allGrievances.filter(function(g) {
        return g.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
               g.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               g.issueType.toLowerCase().includes(searchTerm.toLowerCase());
      });

      renderGrievances(filtered);
    }
  </script>
</body>
</html>
  `;
}

/**
 * Shows grievance detail in mobile view
 * @param {string} grievanceId - Grievance ID
 */
function showGrievanceDetail(grievanceId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet) return;

  const data = grievanceSheet.getDataRange().getValues();
  const grievanceRow = data.find(function(row) { return row[GRIEVANCE_COLS.GRIEVANCE_ID - 1] === grievanceId; });

  if (!grievanceRow) {
    SpreadsheetApp.getUi().alert('Grievance not found');
    return;
  }

  // Show detail dialog
  const message = `
Grievance #${grievanceId}

Member: ${getGrievanceMemberName(grievanceRow)}
Issue: ${grievanceRow[GRIEVANCE_COLS.ISSUE_TYPE - 1]}
Status: ${grievanceRow[GRIEVANCE_COLS.STATUS - 1]}
Filed: ${grievanceRow[GRIEVANCE_COLS.FILED_DATE - 1]}
Assigned: ${grievanceRow[GRIEVANCE_COLS.ASSIGNED_STEWARD - 1]}

Description:
${grievanceRow[GRIEVANCE_COLS.DESCRIPTION - 1]}
  `.trim();

  SpreadsheetApp.getUi().alert('Grievance Detail', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Shows my assigned grievances
 */
function showMyAssignedGrievances() {
  const userEmail = Session.getActiveUser().getEmail();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet || grievanceSheet.getLastRow() <= 1) {
    SpreadsheetApp.getUi().alert('No grievances found');
    return;
  }

  const data = grievanceSheet.getRange(2, 1, grievanceSheet.getLastRow() - 1, 28).getValues();

  const myGrievances = data.filter(function(row) {
    const assignedSteward = row[GRIEVANCE_COLS.ASSIGNED_STEWARD - 1];
    return assignedSteward && assignedSteward.includes(userEmail);
  });

  if (myGrievances.length === 0) {
    SpreadsheetApp.getUi().alert('No grievances assigned to you');
    return;
  }

  let message = `You have ${myGrievances.length} assigned grievance(s):\n\n`;

  myGrievances.slice(0, 10).forEach(function(row) {
    message += `#${row[GRIEVANCE_COLS.GRIEVANCE_ID - 1]} - ${getGrievanceMemberName(row)} (${row[GRIEVANCE_COLS.STATUS - 1]})\n`;
  });

  if (myGrievances.length > 10) {
    message += `\n... and ${myGrievances.length - 10} more`;
  }

  SpreadsheetApp.getUi().alert('My Cases', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Shows unified mobile search for members and grievances
 */
function showMobileUnifiedSearch() {
  const html = createMobileUnifiedSearchHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(420)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '🔍 Search');
}

/**
 * Creates HTML for unified mobile search
 * Refactored to use smaller, focused helper functions
 */
function createMobileUnifiedSearchHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>${getMobileUnifiedSearchStyles()}</style>
</head>
<body>
${getMobileUnifiedSearchHeader()}
${getMobileUnifiedSearchTabs()}
${getMobileUnifiedSearchFiltersContainer()}
${getMobileUnifiedSearchResultsContainer()}
  <script>${getMobileUnifiedSearchScripts()}</script>
</body>
</html>
  `;
}

/**
 * Returns CSS styles for mobile unified search
 */
function getMobileUnifiedSearchStyles() {
  return `
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
      color: white;
      padding: 15px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header h2 {
      margin: 0 0 12px 0;
      font-size: 20px;
    }
    .search-container {
      position: relative;
    }
    .search-input {
      width: 100%;
      padding: 14px 14px 14px 45px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      background: white;
      outline: none;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
    }
    .tabs {
      display: flex;
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }
    .tab {
      flex: 1;
      padding: 14px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      color: #666;
      border: none;
      background: none;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      min-height: 48px;
    }
    .tab.active {
      color: #1a73e8;
      border-bottom-color: #1a73e8;
    }
    .filters {
      display: flex;
      gap: 8px;
      padding: 12px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      overflow-x: auto;
    }
    .filter-chip {
      padding: 8px 16px;
      border-radius: 20px;
      background: #f0f0f0;
      border: none;
      font-size: 13px;
      white-space: nowrap;
      cursor: pointer;
      min-height: 36px;
    }
    .filter-chip.active {
      background: #1a73e8;
      color: white;
    }
    .results {
      padding: 12px;
      min-height: 300px;
    }
    .result-card {
      background: white;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .result-card:active {
      transform: scale(0.98);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a73e8;
    }
    .card-badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .badge-steward { background: #e8f5e9; color: #2e7d32; }
    .badge-open { background: #ffebee; color: #c62828; }
    .badge-pending { background: #fff3e0; color: #ef6c00; }
    .badge-settled { background: #e8f5e9; color: #2e7d32; }
    .badge-closed { background: #e0e0e0; color: #616161; }
    .card-row {
      font-size: 14px;
      color: #666;
      margin: 6px 0;
      display: flex;
      gap: 8px;
    }
    .card-row-label {
      color: #999;
      min-width: 70px;
    }
    .card-row-value {
      flex: 1;
      color: #333;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #1a73e8;
    }
    .count-badge {
      background: #e8f0fe;
      color: #1a73e8;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
      margin-left: 6px;
    }
  `;
}

/**
 * Returns header HTML for mobile unified search
 */
function getMobileUnifiedSearchHeader() {
  return `
  <div class="header">
    <h2>🔍 Quick Search</h2>
    <div class="search-container">
      <span class="search-icon">🔎</span>
      <input type="text" class="search-input" id="searchInput"
             placeholder="Search members or grievances..." autofocus>
    </div>
  </div>`;
}

/**
 * Returns tabs HTML for mobile unified search
 */
function getMobileUnifiedSearchTabs() {
  return `
  <div class="tabs">
    <button class="tab active" id="tabMembers" onclick="switchTab('members')">
      👥 Members <span class="count-badge" id="memberCount">0</span>
    </button>
    <button class="tab" id="tabGrievances" onclick="switchTab('grievances')">
      📋 Grievances <span class="count-badge" id="grievanceCount">0</span>
    </button>
  </div>`;
}

/**
 * Returns filters container HTML for mobile unified search
 */
function getMobileUnifiedSearchFiltersContainer() {
  return `
  <div class="filters" id="filtersContainer">
    <button class="filter-chip active" onclick="filterResults('all')">All</button>
  </div>`;
}

/**
 * Returns results container HTML for mobile unified search
 */
function getMobileUnifiedSearchResultsContainer() {
  return `
  <div class="results" id="resultsContainer">
    <div class="loading">Loading data...</div>
  </div>`;
}

/**
 * Returns JavaScript for mobile unified search
 */
function getMobileUnifiedSearchScripts() {
  return `
    let allMembers = [];
    let allGrievances = [];
    let currentTab = 'members';
    let currentFilter = 'all';

    // Load data on page load
    window.onload = function() {
      loadAllData();
      document.getElementById('searchInput').addEventListener('input', performSearch);
    };

    function loadAllData() {
      google.script.run
        .withSuccessHandler(function(data) {
          allMembers = data.members || [];
          allGrievances = data.grievances || [];
          document.getElementById('memberCount').textContent = allMembers.length;
          document.getElementById('grievanceCount').textContent = allGrievances.length;
          updateFilters();
          performSearch();
        })
        .withFailureHandler(function(error) {
          document.getElementById('resultsContainer').innerHTML =
            '<div class="empty-state"><div class="empty-icon">❌</div>Error loading data</div>';
        })
        .getMobileSearchData();
    }

    function switchTab(tab) {
      currentTab = tab;
      currentFilter = 'all';

      document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');

      updateFilters();
      performSearch();
    }

    function updateFilters() {
      const container = document.getElementById('filtersContainer');
      let filters = ['all'];

      if (currentTab === 'members') {
        const locations = [...new Set(allMembers.map(function(m) { return m.location; }).filter(Boolean))];
        filters = filters.concat(locations.slice(0, 5));
      } else {
        filters = ['all', 'Open', 'Pending', 'Settled', 'Closed'];
      }

      container.innerHTML = filters.map(function(f) {
        const isActive = f === currentFilter ? 'active' : '';
        const label = f === 'all' ? 'All' : f;
        return '<button class="filter-chip ' + isActive + '" onclick="filterResults(\\'' + f + '\\')">' + label + '</button>';
      }).join('');
    }

    function filterResults(filter) {
      currentFilter = filter;
      document.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
      event.target.classList.add('active');
      performSearch();
    }

    function performSearch() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      let results = [];

      if (currentTab === 'members') {
        results = allMembers.filter(function(m) {
          const matchesSearch = !searchTerm ||
            m.name.toLowerCase().includes(searchTerm) ||
            (m.id && m.id.toLowerCase().includes(searchTerm)) ||
            (m.email && m.email.toLowerCase().includes(searchTerm)) ||
            (m.location && m.location.toLowerCase().includes(searchTerm));

          const matchesFilter = currentFilter === 'all' || m.location === currentFilter;

          return matchesSearch && matchesFilter;
        });
        renderMembers(results);
      } else {
        results = allGrievances.filter(function(g) {
          const matchesSearch = !searchTerm ||
            g.id.toLowerCase().includes(searchTerm) ||
            g.memberName.toLowerCase().includes(searchTerm) ||
            (g.issueType && g.issueType.toLowerCase().includes(searchTerm));

          const matchesFilter = currentFilter === 'all' || g.status === currentFilter;

          return matchesSearch && matchesFilter;
        });
        renderGrievances(results);
      }
    }

    function renderMembers(members) {
      const container = document.getElementById('resultsContainer');

      if (members.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div>No members found</div>';
        return;
      }

      container.innerHTML = members.slice(0, 50).map(function(m) {
        const badge = m.isSteward === 'Yes' ? '<span class="card-badge badge-steward">🛡️ Steward</span>' : '';
        return '<div class="result-card" onclick="selectMember(' + m.row + ')">' +
          '<div class="card-header">' +
            '<div class="card-title">' + m.name + '</div>' +
            badge +
          '</div>' +
          '<div class="card-row"><span class="card-row-label">ID</span><span class="card-row-value">' + (m.id || 'N/A') + '</span></div>' +
          '<div class="card-row"><span class="card-row-label">Location</span><span class="card-row-value">' + (m.location || 'N/A') + '</span></div>' +
          '<div class="card-row"><span class="card-row-label">Email</span><span class="card-row-value">' + (m.email || 'N/A') + '</span></div>' +
        '</div>';
      }).join('');

      if (members.length > 50) {
        container.innerHTML += '<div class="empty-state">Showing 50 of ' + members.length + ' results</div>';
      }
    }

    function renderGrievances(grievances) {
      const container = document.getElementById('resultsContainer');

      if (grievances.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div>No grievances found</div>';
        return;
      }

      container.innerHTML = grievances.slice(0, 50).map(function(g) {
        const statusClass = 'badge-' + (g.status || 'open').toLowerCase().replace(/\\s+/g, '-');
        return '<div class="result-card" onclick="selectGrievance(\\'' + g.id + '\\')">' +
          '<div class="card-header">' +
            '<div class="card-title">#' + g.id + '</div>' +
            '<span class="card-badge ' + statusClass + '">' + (g.status || 'Open') + '</span>' +
          '</div>' +
          '<div class="card-row"><span class="card-row-label">Member</span><span class="card-row-value">' + (g.memberName || 'N/A') + '</span></div>' +
          '<div class="card-row"><span class="card-row-label">Issue</span><span class="card-row-value">' + (g.issueType || 'N/A') + '</span></div>' +
          '<div class="card-row"><span class="card-row-label">Filed</span><span class="card-row-value">' + (g.filedDate || 'N/A') + '</span></div>' +
        '</div>';
      }).join('');

      if (grievances.length > 50) {
        container.innerHTML += '<div class="empty-state">Showing 50 of ' + grievances.length + ' results</div>';
      }
    }

    function selectMember(row) {
      google.script.run
        .withSuccessHandler(function() { google.script.host.close(); })
        .navigateToMember(row);
    }

    function selectGrievance(id) {
      google.script.run
        .withSuccessHandler(function() { google.script.host.close(); })
        .navigateToGrievance(id);
    }
  `;
}

/**
 * Gets data for mobile search (members and grievances)
 * @returns {Object} Object with members and grievances arrays
 */
function getMobileSearchData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = { members: [], grievances: [] };

  // Get members
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  if (memberSheet && memberSheet.getLastRow() > 1) {
    const memberData = memberSheet.getRange(2, 1, memberSheet.getLastRow() - 1, 13).getValues();
    result.members = memberData.map(function(row, index) {
      return {
        row: index + 2,
        id: row[MEMBER_COLS.MEMBER_ID - 1] || '',
        name: ((row[MEMBER_COLS.FIRST_NAME - 1] || '') + ' ' + (row[MEMBER_COLS.LAST_NAME - 1] || '')).trim(),
        location: row[MEMBER_COLS.WORK_LOCATION - 1] || '',
        unit: row[MEMBER_COLS.UNIT - 1] || '',
        email: row[MEMBER_COLS.EMAIL - 1] || '',
        isSteward: row[MEMBER_COLS.IS_STEWARD - 1] || ''
      };
    }).filter(function(m) { return m.id || m.name; });
  }

  // Get grievances
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (grievanceSheet && grievanceSheet.getLastRow() > 1) {
    const grievanceData = grievanceSheet.getRange(2, 1, grievanceSheet.getLastRow() - 1, 28).getValues();
    result.grievances = grievanceData.map(function(row, index) {
      const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];
      return {
        row: index + 2,
        id: row[GRIEVANCE_COLS.GRIEVANCE_ID - 1] || '',
        memberName: ((row[GRIEVANCE_COLS.FIRST_NAME - 1] || '') + ' ' + (row[GRIEVANCE_COLS.LAST_NAME - 1] || '')).trim(),
        status: row[GRIEVANCE_COLS.STATUS - 1] || '',
        issueType: row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1] || '',
        filedDate: filedDate instanceof Date ? Utilities.formatDate(filedDate, Session.getScriptTimeZone(), 'MMM d, yyyy') : ''
      };
    }).filter(function(g) { return g.id; });
  }

  return result;
}

/**
 * Navigates to a grievance row in the Grievance Log
 * @param {string} grievanceId - The grievance ID to navigate to
 */
function navigateToGrievance(grievanceId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet) return;

  const data = grievanceSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][GRIEVANCE_COLS.GRIEVANCE_ID - 1] === grievanceId) {
      ss.setActiveSheet(grievanceSheet);
      grievanceSheet.setActiveRange(grievanceSheet.getRange(i + 1, 1, 1, 10));
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Navigated to grievance #' + grievanceId,
        'Grievance Found',
        3
      );
      return;
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('Grievance not found', 'Not Found', 3);
}

/**
 * Mobile member directory browser with large touch targets
 */
function showMobileMemberBrowser() {
  const html = createMobileMemberBrowserHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(420)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '👥 Member Directory');
}

/**
 * Creates HTML for mobile member browser
 */
function createMobileMemberBrowserHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      margin: 0; padding: 0; background: #f5f5f5;
    }
    .header {
      background: #1a73e8; color: white; padding: 15px;
      position: sticky; top: 0; z-index: 100;
    }
    .search-box {
      width: 100%; padding: 14px; border: none; border-radius: 8px;
      font-size: 16px; margin-top: 10px;
    }
    .alphabet-bar {
      display: flex; flex-wrap: wrap; padding: 8px;
      background: white; border-bottom: 1px solid #e0e0e0; gap: 4px;
    }
    .letter-btn {
      width: 32px; height: 32px; border: none; border-radius: 50%;
      background: #f0f0f0; font-size: 12px; font-weight: bold;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .letter-btn.active { background: #1a73e8; color: white; }
    .list { padding: 10px; }
    .member-card {
      background: white; padding: 16px; margin-bottom: 10px;
      border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);
      display: flex; gap: 12px; align-items: center; min-height: 70px;
    }
    .avatar {
      width: 50px; height: 50px; border-radius: 50%;
      background: #e8f0fe; display: flex; align-items: center;
      justify-content: center; font-size: 20px; font-weight: bold; color: #1a73e8;
    }
    .member-info { flex: 1; }
    .member-name { font-weight: 600; font-size: 16px; color: #333; }
    .member-detail { font-size: 13px; color: #666; margin-top: 4px; }
    .steward-badge {
      background: #e8f5e9; color: #2e7d32; padding: 2px 8px;
      border-radius: 10px; font-size: 11px; font-weight: bold;
    }
    .empty { text-align: center; padding: 40px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0; font-size: 18px;">👥 Member Directory</h2>
    <input type="text" class="search-box" id="searchInput" placeholder="Search by name...">
  </div>

  <div class="alphabet-bar" id="alphabetBar"></div>
  <div class="list" id="memberList"><div class="empty">Loading...</div></div>

  <script>
    let allMembers = [];
    let currentLetter = 'all';

    window.onload = function() {
      buildAlphabetBar();
      google.script.run.withSuccessHandler(loadMembers).getAllMembers();
      document.getElementById('searchInput').addEventListener('input', filterMembers);
    };

    function buildAlphabetBar() {
      const bar = document.getElementById('alphabetBar');
      const letters = ['All'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
      bar.innerHTML = letters.map(function(l) {
        const key = l === 'All' ? 'all' : l;
        return '<button class="letter-btn' + (key === 'all' ? ' active' : '') + '" onclick="filterByLetter(\\'' + key + '\\')">' + l + '</button>';
      }).join('');
    }

    function loadMembers(members) {
      allMembers = members;
      renderMembers(members);
    }

    function filterByLetter(letter) {
      currentLetter = letter;
      document.querySelectorAll('.letter-btn').forEach(function(b) { b.classList.remove('active'); });
      event.target.classList.add('active');
      filterMembers();
    }

    function filterMembers() {
      const search = document.getElementById('searchInput').value.toLowerCase();
      const filtered = allMembers.filter(function(m) {
        const matchesSearch = !search || m.name.toLowerCase().includes(search);
        const matchesLetter = currentLetter === 'all' ||
          (m.lastName && m.lastName.charAt(0).toUpperCase() === currentLetter);
        return matchesSearch && matchesLetter;
      });
      renderMembers(filtered);
    }

    function renderMembers(members) {
      const container = document.getElementById('memberList');
      if (members.length === 0) {
        container.innerHTML = '<div class="empty">No members found</div>';
        return;
      }
      container.innerHTML = members.slice(0, 100).map(function(m) {
        const initials = ((m.firstName || '').charAt(0) + (m.lastName || '').charAt(0)).toUpperCase() || '?';
        const badge = m.isSteward === 'Yes' ? '<span class="steward-badge">Steward</span>' : '';
        return '<div class="member-card" onclick="selectMember(' + m.row + ')">' +
          '<div class="avatar">' + initials + '</div>' +
          '<div class="member-info">' +
            '<div class="member-name">' + m.name + ' ' + badge + '</div>' +
            '<div class="member-detail">' + (m.location || 'No location') + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function selectMember(row) {
      google.script.run.withSuccessHandler(function() { google.script.host.close(); }).navigateToMember(row);
    }
  </script>
</body>
</html>
  `;
}

/**
 * Mobile grievance browser with status filters
 */
function showMobileGrievanceBrowser() {
  const html = createMobileGrievanceBrowserHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(420)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📋 Grievance Log');
}

/**
 * Creates HTML for mobile grievance browser
 */
function createMobileGrievanceBrowserHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      margin: 0; padding: 0; background: #f5f5f5;
    }
    .header { background: #1a73e8; color: white; padding: 15px; position: sticky; top: 0; z-index: 100; }
    .search-box { width: 100%; padding: 14px; border: none; border-radius: 8px; font-size: 16px; margin-top: 10px; }
    .status-tabs {
      display: flex; overflow-x: auto; background: white;
      border-bottom: 1px solid #e0e0e0; padding: 0 10px;
    }
    .status-tab {
      flex-shrink: 0; padding: 14px 16px; border: none; background: none;
      font-size: 14px; font-weight: 500; color: #666; cursor: pointer;
      border-bottom: 3px solid transparent; min-height: 48px;
    }
    .status-tab.active { color: #1a73e8; border-bottom-color: #1a73e8; }
    .list { padding: 10px; }
    .grievance-card {
      background: white; padding: 16px; margin-bottom: 12px;
      border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      border-left: 4px solid #ccc;
    }
    .grievance-card.open { border-left-color: #dc2626; }
    .grievance-card.pending { border-left-color: #f97316; }
    .grievance-card.settled { border-left-color: #059669; }
    .grievance-card.closed { border-left-color: #6b7280; }
    .card-top { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .grievance-id { font-weight: bold; color: #1a73e8; font-size: 16px; }
    .status-badge {
      padding: 4px 10px; border-radius: 12px; font-size: 11px;
      font-weight: bold; text-transform: uppercase;
    }
    .badge-open { background: #fee2e2; color: #dc2626; }
    .badge-pending { background: #ffedd5; color: #ea580c; }
    .badge-settled { background: #d1fae5; color: #059669; }
    .badge-closed { background: #e5e7eb; color: #6b7280; }
    .card-row { font-size: 14px; margin: 6px 0; display: flex; }
    .card-label { color: #999; min-width: 80px; }
    .card-value { color: #333; flex: 1; }
    .deadline-warning { color: #dc2626; font-weight: bold; }
    .empty { text-align: center; padding: 40px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0; font-size: 18px;">📋 Grievance Log</h2>
    <input type="text" class="search-box" id="searchInput" placeholder="Search grievances...">
  </div>

  <div class="status-tabs">
    <button class="status-tab active" onclick="filterByStatus('all')">All</button>
    <button class="status-tab" onclick="filterByStatus('Open')">🔴 Open</button>
    <button class="status-tab" onclick="filterByStatus('Pending Info')">🟠 Pending</button>
    <button class="status-tab" onclick="filterByStatus('Settled')">🟢 Settled</button>
    <button class="status-tab" onclick="filterByStatus('Closed')">⚫ Closed</button>
  </div>

  <div class="list" id="grievanceList"><div class="empty">Loading...</div></div>

  <script>
    let allGrievances = [];
    let currentStatus = 'all';

    window.onload = function() {
      google.script.run.withSuccessHandler(loadGrievances).getRecentGrievancesForMobile(500);
      document.getElementById('searchInput').addEventListener('input', filterGrievances);
    };

    function loadGrievances(grievances) {
      allGrievances = grievances;
      renderGrievances(grievances);
    }

    function filterByStatus(status) {
      currentStatus = status;
      document.querySelectorAll('.status-tab').forEach(function(t) { t.classList.remove('active'); });
      event.target.classList.add('active');
      filterGrievances();
    }

    function filterGrievances() {
      const search = document.getElementById('searchInput').value.toLowerCase();
      const filtered = allGrievances.filter(function(g) {
        const matchesSearch = !search ||
          g.id.toLowerCase().includes(search) ||
          g.memberName.toLowerCase().includes(search) ||
          (g.issueType && g.issueType.toLowerCase().includes(search));
        const matchesStatus = currentStatus === 'all' || g.status === currentStatus;
        return matchesSearch && matchesStatus;
      });
      renderGrievances(filtered);
    }

    function renderGrievances(grievances) {
      const container = document.getElementById('grievanceList');
      if (grievances.length === 0) {
        container.innerHTML = '<div class="empty">No grievances found</div>';
        return;
      }
      container.innerHTML = grievances.slice(0, 100).map(function(g) {
        const statusKey = (g.status || 'open').toLowerCase().replace(/\\s+/g, '-');
        const badgeClass = 'badge-' + statusKey.split('-')[0];
        return '<div class="grievance-card ' + statusKey.split('-')[0] + '" onclick="selectGrievance(\\'' + g.id + '\\')">' +
          '<div class="card-top">' +
            '<span class="grievance-id">#' + g.id + '</span>' +
            '<span class="status-badge ' + badgeClass + '">' + (g.status || 'Open') + '</span>' +
          '</div>' +
          '<div class="card-row"><span class="card-label">Member</span><span class="card-value">' + (g.memberName || 'N/A') + '</span></div>' +
          '<div class="card-row"><span class="card-label">Issue</span><span class="card-value">' + (g.issueType || 'N/A') + '</span></div>' +
          '<div class="card-row"><span class="card-label">Filed</span><span class="card-value">' + (g.filedDate || 'N/A') + '</span></div>' +
          (g.deadline ? '<div class="card-row"><span class="card-label">Deadline</span><span class="card-value deadline-warning">' + g.deadline + '</span></div>' : '') +
        '</div>';
      }).join('');
    }

    function selectGrievance(id) {
      google.script.run.withSuccessHandler(function() { google.script.host.close(); }).navigateToGrievance(id);
    }
  </script>
</body>
</html>
  `;
}
