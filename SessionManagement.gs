/**
 * ============================================================================
 * SESSION MANAGEMENT & USER PREFERENCES
 * ============================================================================
 *
 * Advanced session tracking and user preference management
 * Features:
 * - User session tracking
 * - Activity logging
 * - User preferences and settings
 * - Recent activity history
 * - Workspace customization
 * - Quick access to recent items
 * - User-specific dashboards
 * - Session persistence
 */

/**
 * Session configuration
 */
const SESSION_CONFIG = {
  MAX_RECENT_ITEMS: 20,
  SESSION_TIMEOUT_MINUTES: 30,
  TRACK_ACTIVITIES: true,
  ACTIVITY_LOG_LIMIT: 100
};

/**
 * Activity types
 */
const ACTIVITY_TYPES = {
  GRIEVANCE_VIEWED: 'Grievance Viewed',
  GRIEVANCE_CREATED: 'Grievance Created',
  GRIEVANCE_UPDATED: 'Grievance Updated',
  MEMBER_SEARCHED: 'Member Searched',
  REPORT_GENERATED: 'Report Generated',
  DASHBOARD_VIEWED: 'Dashboard Viewed',
  EXPORT_PERFORMED: 'Export Performed',
  EMAIL_SENT: 'Email Sent',
  FILE_UPLOADED: 'File Uploaded'
};

/**
 * Shows user session dashboard
 */
function showSessionDashboard() {
  const html = createSessionDashboardHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(900)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '👤 My Session');
}

/**
 * Creates HTML for session dashboard
 */
function createSessionDashboardHTML() {
  const session = getCurrentSession();
  const recentActivities = getRecentActivities(10);
  const preferences = getUserPreferences();

  let activityRows = '';
  if (recentActivities.length === 0) {
    activityRows = '<tr><td colspan="3" style="text-align: center; padding: 40px; color: #999;">No recent activity</td></tr>';
  } else {
    recentActivities.forEach(activity => {
      const timestamp = new Date(activity.timestamp).toLocaleString();
      activityRows += `
        <tr>
          <td>${activity.type}</td>
          <td>${activity.description}</td>
          <td style="font-size: 12px; color: #666;">${timestamp}</td>
        </tr>
      `;
    });
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body {
      font-family: 'Roboto', Arial, sans-serif;
      padding: 20px;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-height: 650px;
      overflow-y: auto;
    }
    h2 {
      color: #1a73e8;
      margin-top: 0;
      border-bottom: 3px solid #1a73e8;
      padding-bottom: 10px;
    }
    h3 {
      color: #333;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .user-info {
      background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 25px;
    }
    .user-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .user-email {
      font-size: 14px;
      opacity: 0.9;
    }
    .session-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      border-left: 4px solid #1a73e8;
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
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background: #1a73e8;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .preference-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .preference-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .preference-row:last-child {
      border-bottom: none;
    }
    .preference-label {
      font-weight: 500;
      color: #333;
    }
    .preference-value {
      color: #666;
      font-size: 14px;
    }
    button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    button:hover {
      background: #1557b0;
    }
    button.secondary {
      background: #6c757d;
    }
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin: 20px 0;
    }
    .quick-action-btn {
      background: white;
      border: 2px solid #e0e0e0;
      padding: 15px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .quick-action-btn:hover {
      border-color: #1a73e8;
      background: #f8f9fa;
    }
    .quick-action-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .quick-action-label {
      font-weight: 500;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>👤 My Session</h2>

    <div class="user-info">
      <div class="user-name">${session.userName || 'User'}</div>
      <div class="user-email">${session.userEmail}</div>
      <div style="margin-top: 15px; font-size: 13px;">
        Session started: ${new Date(session.sessionStart).toLocaleString()}
      </div>
    </div>

    <div class="session-stats">
      <div class="stat-card">
        <div class="stat-value">${session.activityCount}</div>
        <div class="stat-label">Actions Today</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${session.grievancesViewed}</div>
        <div class="stat-label">Grievances Viewed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${session.reportsGenerated}</div>
        <div class="stat-label">Reports Generated</div>
      </div>
    </div>

    <h3>⚡ Quick Actions</h3>
    <div class="quick-actions">
      <div class="quick-action-btn" onclick="viewRecentGrievances()">
        <div class="quick-action-icon">📋</div>
        <div class="quick-action-label">Recent Grievances</div>
      </div>
      <div class="quick-action-btn" onclick="viewSavedSearches()">
        <div class="quick-action-icon">🔍</div>
        <div class="quick-action-label">Saved Searches</div>
      </div>
      <div class="quick-action-btn" onclick="viewBookmarks()">
        <div class="quick-action-icon">⭐</div>
        <div class="quick-action-label">Bookmarks</div>
      </div>
      <div class="quick-action-btn" onclick="editPreferences()">
        <div class="quick-action-icon">⚙️</div>
        <div class="quick-action-label">Preferences</div>
      </div>
    </div>

    <h3>📊 Recent Activity</h3>
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Description</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        ${activityRows}
      </tbody>
    </table>

    <h3>⚙️ My Preferences</h3>
    <div class="preference-section">
      <div class="preference-row">
        <span class="preference-label">Default View</span>
        <span class="preference-value">${preferences.defaultView || 'Dashboard'}</span>
      </div>
      <div class="preference-row">
        <span class="preference-label">Items Per Page</span>
        <span class="preference-value">${preferences.itemsPerPage || 100}</span>
      </div>
      <div class="preference-row">
        <span class="preference-label">Email Notifications</span>
        <span class="preference-value">${preferences.emailNotifications ? 'Enabled' : 'Disabled'}</span>
      </div>
      <div class="preference-row">
        <span class="preference-label">Default Sort</span>
        <span class="preference-value">${preferences.defaultSort || 'Filed Date (Newest)'}</span>
      </div>
      <div class="preference-row">
        <span class="preference-label">Theme</span>
        <span class="preference-value">${preferences.theme || 'Light'}</span>
      </div>
    </div>

    <div style="margin-top: 25px; padding-top: 20px; border-top: 2px solid #e0e0e0; display: flex; gap: 10px;">
      <button onclick="editPreferences()">⚙️ Edit Preferences</button>
      <button onclick="clearSession()">🔄 Clear Session</button>
      <button class="secondary" onclick="exportActivityLog()">📥 Export Activity</button>
      <button class="secondary" onclick="google.script.host.close()">Close</button>
    </div>
  </div>

  <script>
    function viewRecentGrievances() {
      google.script.run.showRecentGrievancesDialog();
    }

    function viewSavedSearches() {
      google.script.run.showSavedSearches();
    }

    function viewBookmarks() {
      google.script.run.showBookmarks();
    }

    function editPreferences() {
      google.script.run.showPreferencesEditor();
    }

    function clearSession() {
      if (confirm('Clear session data? This will reset your recent activity.')) {
        google.script.run
          .withSuccessHandler(() => {
            alert('✅ Session cleared!');
            google.script.host.close();
          })
          .clearUserSession();
      }
    }

    function exportActivityLog() {
      google.script.run
        .withSuccessHandler((url) => {
          alert('✅ Activity log exported!');
          window.open(url, '_blank');
        })
        .exportActivityLog();
    }
  </script>
</body>
</html>
  `;
}

/**
 * Gets current session information
 * @returns {Object} Session data
 */
function getCurrentSession() {
  const props = PropertiesService.getUserProperties();
  const sessionJSON = props.getProperty('currentSession');

  const userEmail = Session.getActiveUser().getEmail();
  const userName = extractUserName(userEmail);

  if (sessionJSON) {
    const session = JSON.parse(sessionJSON);

    // Check if session has timed out
    const now = new Date();
    const lastActivity = new Date(session.lastActivity);
    const minutesSinceActivity = (now - lastActivity) / (1000 * 60);

    if (minutesSinceActivity > SESSION_CONFIG.SESSION_TIMEOUT_MINUTES) {
      // Session timed out, start new one
      return createNewSession(userEmail, userName);
    }

    // Update last activity
    session.lastActivity = now.toISOString();
    props.setProperty('currentSession', JSON.stringify(session));

    return session;
  }

  return createNewSession(userEmail, userName);
}

/**
 * Creates a new session
 * @param {string} userEmail - User email
 * @param {string} userName - User name
 * @returns {Object} New session
 */
function createNewSession(userEmail, userName) {
  const now = new Date();
  const session = {
    userEmail: userEmail,
    userName: userName,
    sessionStart: now.toISOString(),
    lastActivity: now.toISOString(),
    activityCount: 0,
    grievancesViewed: 0,
    reportsGenerated: 0
  };

  const props = PropertiesService.getUserProperties();
  props.setProperty('currentSession', JSON.stringify(session));

  return session;
}

/**
 * Extracts user name from email
 * @param {string} email - Email address
 * @returns {string} User name
 */
function extractUserName(email) {
  if (!email) return 'User';

  const namePart = email.split('@')[0];
  const parts = namePart.split('.');

  return parts.map(part =>
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
}

/**
 * Logs user activity
 * @param {string} activityType - Type of activity
 * @param {string} description - Activity description
 * @param {Object} metadata - Additional metadata
 */
function logActivity(activityType, description, metadata = {}) {
  if (!SESSION_CONFIG.TRACK_ACTIVITIES) return;

  const props = PropertiesService.getUserProperties();
  const activitiesJSON = props.getProperty('activityLog');

  let activities = [];
  if (activitiesJSON) {
    activities = JSON.parse(activitiesJSON);
  }

  activities.push({
    type: activityType,
    description: description,
    timestamp: new Date().toISOString(),
    metadata: metadata
  });

  // Limit activity log size
  if (activities.length > SESSION_CONFIG.ACTIVITY_LOG_LIMIT) {
    activities = activities.slice(-SESSION_CONFIG.ACTIVITY_LOG_LIMIT);
  }

  props.setProperty('activityLog', JSON.stringify(activities));

  // Update session stats
  updateSessionStats(activityType);
}

/**
 * Updates session statistics
 * @param {string} activityType - Activity type
 */
function updateSessionStats(activityType) {
  const session = getCurrentSession();

  session.activityCount++;

  if (activityType === ACTIVITY_TYPES.GRIEVANCE_VIEWED) {
    session.grievancesViewed++;
  } else if (activityType === ACTIVITY_TYPES.REPORT_GENERATED) {
    session.reportsGenerated++;
  }

  const props = PropertiesService.getUserProperties();
  props.setProperty('currentSession', JSON.stringify(session));
}

/**
 * Gets recent activities
 * @param {number} limit - Number of activities to return
 * @returns {Array} Recent activities
 */
function getRecentActivities(limit = 20) {
  const props = PropertiesService.getUserProperties();
  const activitiesJSON = props.getProperty('activityLog');

  if (!activitiesJSON) {
    return [];
  }

  const activities = JSON.parse(activitiesJSON);
  return activities.slice(-limit).reverse();
}

/**
 * Gets user preferences
 * @returns {Object} User preferences
 */
function getUserPreferences() {
  const props = PropertiesService.getUserProperties();
  const prefsJSON = props.getProperty('userPreferences');

  if (prefsJSON) {
    return JSON.parse(prefsJSON);
  }

  // Default preferences
  return {
    defaultView: 'Dashboard',
    itemsPerPage: 100,
    emailNotifications: true,
    defaultSort: 'Filed Date (Newest)',
    theme: 'Light',
    showAdvancedColumns: false,
    autoRefresh: false,
    compactMode: false
  };
}

/**
 * Saves user preferences
 * @param {Object} preferences - Preferences to save
 */
function saveUserPreferences(preferences) {
  const props = PropertiesService.getUserProperties();
  const current = getUserPreferences();

  const updated = { ...current, ...preferences };
  props.setProperty('userPreferences', JSON.stringify(updated));

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Preferences saved!',
    'Preferences',
    3
  );
}

/**
 * Shows preferences editor
 */
function showPreferencesEditor() {
  const prefs = getUserPreferences();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
    h2 { color: #1a73e8; margin-top: 0; }
    .form-group { margin: 20px 0; }
    label { display: block; font-weight: 500; margin-bottom: 8px; color: #333; }
    select, input { width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
    button { background: #1a73e8; color: white; border: none; padding: 12px 24px; font-size: 14px; border-radius: 4px; cursor: pointer; margin: 5px; }
    button:hover { background: #1557b0; }
    button.secondary { background: #6c757d; }
    .checkbox-group { display: flex; align-items: center; gap: 10px; }
    .checkbox-group input { width: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h2>⚙️ Preferences</h2>

    <div class="form-group">
      <label>Default View</label>
      <select id="defaultView">
        <option value="${SHEETS.DASHBOARD}" ${prefs.defaultView === SHEETS.DASHBOARD ? 'selected' : ''}>Dashboard</option>
        <option value="${SHEETS.GRIEVANCE_LOG}" ${prefs.defaultView === SHEETS.GRIEVANCE_LOG ? 'selected' : ''}>Grievance Log</option>
        <option value="${SHEETS.MEMBER_DIR}" ${prefs.defaultView === SHEETS.MEMBER_DIR ? 'selected' : ''}>Member Directory</option>
        <option value="${SHEETS.INTERACTIVE_DASHBOARD}" ${prefs.defaultView === SHEETS.INTERACTIVE_DASHBOARD ? 'selected' : ''}>Interactive Dashboard</option>
      </select>
    </div>

    <div class="form-group">
      <label>Items Per Page</label>
      <select id="itemsPerPage">
        <option value="25" ${prefs.itemsPerPage === 25 ? 'selected' : ''}>25</option>
        <option value="50" ${prefs.itemsPerPage === 50 ? 'selected' : ''}>50</option>
        <option value="100" ${prefs.itemsPerPage === 100 ? 'selected' : ''}>100</option>
        <option value="200" ${prefs.itemsPerPage === 200 ? 'selected' : ''}>200</option>
      </select>
    </div>

    <div class="form-group">
      <label>Default Sort</label>
      <select id="defaultSort">
        <option value="Filed Date (Newest)" ${prefs.defaultSort === 'Filed Date (Newest)' ? 'selected' : ''}>Filed Date (Newest)</option>
        <option value="Filed Date (Oldest)" ${prefs.defaultSort === 'Filed Date (Oldest)' ? 'selected' : ''}>Filed Date (Oldest)</option>
        <option value="Deadline (Soonest)" ${prefs.defaultSort === 'Deadline (Soonest)' ? 'selected' : ''}>Deadline (Soonest)</option>
        <option value="Status" ${prefs.defaultSort === 'Status' ? 'selected' : ''}>Status</option>
      </select>
    </div>

    <div class="form-group checkbox-group">
      <input type="checkbox" id="emailNotifications" ${prefs.emailNotifications ? 'checked' : ''}>
      <label for="emailNotifications" style="margin-bottom: 0;">Enable Email Notifications</label>
    </div>

    <div class="form-group checkbox-group">
      <input type="checkbox" id="showAdvancedColumns" ${prefs.showAdvancedColumns ? 'checked' : ''}>
      <label for="showAdvancedColumns" style="margin-bottom: 0;">Show Advanced Columns</label>
    </div>

    <div class="form-group checkbox-group">
      <input type="checkbox" id="compactMode" ${prefs.compactMode ? 'checked' : ''}>
      <label for="compactMode" style="margin-bottom: 0;">Compact Mode</label>
    </div>

    <div style="margin-top: 30px; display: flex; gap: 10px;">
      <button onclick="savePreferences()">💾 Save Preferences</button>
      <button class="secondary" onclick="resetToDefaults()">🔄 Reset to Defaults</button>
      <button class="secondary" onclick="google.script.host.close()">Cancel</button>
    </div>
  </div>

  <script>
    function savePreferences() {
      const prefs = {
        defaultView: document.getElementById('defaultView').value,
        itemsPerPage: parseInt(document.getElementById('itemsPerPage').value),
        defaultSort: document.getElementById('defaultSort').value,
        emailNotifications: document.getElementById('emailNotifications').checked,
        showAdvancedColumns: document.getElementById('showAdvancedColumns').checked,
        compactMode: document.getElementById('compactMode').checked
      };

      google.script.run
        .withSuccessHandler(() => {
          alert('✅ Preferences saved!');
          google.script.host.close();
        })
        .saveUserPreferences(prefs);
    }

    function resetToDefaults() {
      if (confirm('Reset all preferences to defaults?')) {
        google.script.run
          .withSuccessHandler(() => {
            alert('✅ Preferences reset!');
            location.reload();
          })
          .resetUserPreferences();
      }
    }
  </script>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(650)
    .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '⚙️ Edit Preferences');
}

/**
 * Resets user preferences to defaults
 */
function resetUserPreferences() {
  const props = PropertiesService.getUserProperties();
  props.deleteProperty('userPreferences');

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Preferences reset to defaults',
    'Preferences',
    3
  );
}

/**
 * Clears user session
 */
function clearUserSession() {
  const props = PropertiesService.getUserProperties();
  props.deleteProperty('currentSession');
  props.deleteProperty('activityLog');

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Session cleared',
    'Session',
    3
  );
}

/**
 * Exports activity log to sheet
 * @returns {string} Sheet URL
 */
function exportActivityLog() {
  const activities = getRecentActivities(SESSION_CONFIG.ACTIVITY_LOG_LIMIT);
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let activitySheet = ss.getSheetByName('Activity_Log_Export');
  if (activitySheet) {
    activitySheet.clear();
  } else {
    activitySheet = ss.insertSheet('Activity_Log_Export');
  }

  // Headers
  const headers = ['Type', 'Description', 'Timestamp'];
  activitySheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  activitySheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1a73e8').setFontColor('#ffffff');

  // Data
  if (activities.length > 0) {
    const rows = activities.map(activity => [
      activity.type,
      activity.description,
      new Date(activity.timestamp).toLocaleString()
    ]);

    activitySheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  // Auto-resize
  for (let col = 1; col <= headers.length; col++) {
    activitySheet.autoResizeColumn(col);
  }

  return ss.getUrl() + '#gid=' + activitySheet.getSheetId();
}

/**
 * Shows recent grievances dialog
 */
function showRecentGrievancesDialog() {
  const activities = getRecentActivities(100);
  const grievanceActivities = activities.filter(a => a.type === ACTIVITY_TYPES.GRIEVANCE_VIEWED);

  if (grievanceActivities.length === 0) {
    SpreadsheetApp.getUi().alert('No recent grievances viewed');
    return;
  }

  let message = 'Recently viewed grievances:\n\n';
  grievanceActivities.slice(0, 10).forEach(activity => {
    message += `• ${activity.description} - ${new Date(activity.timestamp).toLocaleString()}\n`;
  });

  SpreadsheetApp.getUi().alert('Recent Grievances', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Shows saved searches
 */
function showSavedSearches() {
  SpreadsheetApp.getUi().alert(
    'Saved Searches',
    'Saved searches feature coming soon!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Shows bookmarks
 */
function showBookmarks() {
  SpreadsheetApp.getUi().alert(
    'Bookmarks',
    'Bookmarks feature coming soon!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
