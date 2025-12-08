/**
 * ------------------------------------------------------------------------====
 * KEYBOARD SHORTCUTS SYSTEM
 * ------------------------------------------------------------------------====
 *
 * Power user keyboard shortcuts for common actions
 * Features:
 * - Quick navigation (Ctrl+G for Grievance Log, Ctrl+M for Members)
 * - Quick actions (Ctrl+N for new grievance, Ctrl+F for search)
 * - Batch operations shortcuts
 * - Configurable key bindings
 * - Help overlay (Ctrl+?)
 */

/**
 * Shows keyboard shortcuts help overlay
 */
function showKeyboardShortcuts() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body {
      font-family: 'Roboto', 'Courier New', monospace;
      padding: 20px;
      margin: 0;
      background: #1e1e1e;
      color: #d4d4d4;
    }
    .container {
      background: #252526;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      max-width: 700px;
      margin: 0 auto;
    }
    h2 {
      color: #4ec9b0;
      margin-top: 0;
      border-bottom: 2px solid #4ec9b0;
      padding-bottom: 10px;
      font-family: 'Roboto', Arial, sans-serif;
    }
    .category {
      margin: 25px 0;
    }
    .category h3 {
      color: #569cd6;
      font-size: 16px;
      margin-bottom: 12px;
      font-family: 'Roboto', Arial, sans-serif;
    }
    .shortcut-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      margin: 5px 0;
      background: #2d2d30;
      border-radius: 4px;
      border-left: 3px solid #4ec9b0;
    }
    .shortcut-row:hover {
      background: #3e3e42;
    }
    .shortcut-desc {
      color: #d4d4d4;
      flex: 1;
    }
    .shortcut-keys {
      display: flex;
      gap: 5px;
    }
    .key {
      background: #1e1e1e;
      color: #4ec9b0;
      padding: 4px 10px;
      border-radius: 4px;
      border: 1px solid #4ec9b0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: bold;
      min-width: 30px;
      text-align: center;
    }
    .key.modifier {
      background: #264f78;
      color: #9cdcfe;
      border-color: #569cd6;
    }
    .tip {
      background: #1e3a5f;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      border-left: 4px solid #569cd6;
      color: #9cdcfe;
    }
    .tip strong {
      color: #4ec9b0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>⌨️ Keyboard Shortcuts</h2>

    <div class="tip">
      <strong>💡 Pro Tip:</strong> Use keyboard shortcuts to navigate and perform actions 10x faster!
      Press <strong>Escape</strong> to close any dialog.
    </div>

    <div class="category">
      <h3>🧭 Navigation</h3>
      <div class="shortcut-row">
        <div class="shortcut-desc">Go to Grievance Log</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key">G</span>
        </div>
      </div>
      <div class="shortcut-row">
        <div class="shortcut-desc">Go to Member Directory</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key">M</span>
        </div>
      </div>
      <div class="shortcut-row">
        <div class="shortcut-desc">Go to Dashboard</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key">D</span>
        </div>
      </div>
      <div class="shortcut-row">
        <div class="shortcut-desc">Go to Interactive Dashboard</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key">I</span>
        </div>
      </div>
    </div>

    <div class="category">
      <h3>🔍 Search & Lookup</h3>
      <div class="shortcut-row">
        <div class="shortcut-desc">Search Members</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key">F</span>
        </div>
      </div>
      <div class="shortcut-row">
        <div class="shortcut-desc">Quick Member Search</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key modifier">Shift</span>
          <span class="key">F</span>
        </div>
      </div>
    </div>

    <div class="category">
      <h3>➕ Quick Actions</h3>
      <div class="shortcut-row">
        <div class="shortcut-desc">New Grievance</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key">N</span>
        </div>
      </div>
      <div class="shortcut-row">
        <div class="shortcut-desc">Compose Email</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key">E</span>
        </div>
      </div>
      <div class="shortcut-row">
        <div class="shortcut-desc">Batch Operations Menu</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key">B</span>
        </div>
      </div>
      <div class="shortcut-row">
        <div class="shortcut-desc">Refresh All</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key">R</span>
        </div>
      </div>
    </div>

    <div class="category">
      <h3>📁 File Management</h3>
      <div class="shortcut-row">
        <div class="shortcut-desc">Setup Drive Folder</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key modifier">Shift</span>
          <span class="key">D</span>
        </div>
      </div>
      <div class="shortcut-row">
        <div class="shortcut-desc">Upload Files</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key">U</span>
        </div>
      </div>
      <div class="shortcut-row">
        <div class="shortcut-desc">Show Grievance Files</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key modifier">Shift</span>
          <span class="key">F</span>
        </div>
      </div>
    </div>

    <div class="category">
      <h3>⚙️ Automation</h3>
      <div class="shortcut-row">
        <div class="shortcut-desc">Notification Settings</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key modifier">Shift</span>
          <span class="key">N</span>
        </div>
      </div>
      <div class="shortcut-row">
        <div class="shortcut-desc">Report Settings</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key modifier">Shift</span>
          <span class="key">R</span>
        </div>
      </div>
    </div>

    <div class="category">
      <h3>❓ Help</h3>
      <div class="shortcut-row">
        <div class="shortcut-desc">Show This Help</div>
        <div class="shortcut-keys">
          <span class="key modifier">Ctrl</span>
          <span class="key">?</span>
        </div>
      </div>
      <div class="shortcut-row">
        <div class="shortcut-desc">Context Help</div>
        <div class="shortcut-keys">
          <span class="key">F1</span>
        </div>
      </div>
    </div>

    <div class="tip" style="margin-top: 30px;">
      <strong>🎯 Custom Shortcuts:</strong> Go to Settings to customize keyboard shortcuts.
      On Mac, use <strong>Cmd</strong> instead of <strong>Ctrl</strong>.
    </div>
  </div>

  <script>
    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        google.script.host.close();
      }
    });
  </script>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(750)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '⌨️ Keyboard Shortcuts');
}

/**
 * Navigation shortcuts
 */
function navigateToGrievanceLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (sheet) {
    sheet.activate();
    SpreadsheetApp.getActiveSpreadsheet().toast('📋 Grievance Log', 'Navigation', 1);
  }
}

function navigateToMemberDirectory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  if (sheet) {
    sheet.activate();
    SpreadsheetApp.getActiveSpreadsheet().toast('👥 Member Directory', 'Navigation', 1);
  }
}

function navigateToDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.DASHBOARD);
  if (sheet) {
    sheet.activate();
    SpreadsheetApp.getActiveSpreadsheet().toast('📊 Dashboard', 'Navigation', 1);
  }
}

function navigateToInteractiveDashboard() {
  openInteractiveDashboard();
}

/**
 * Quick action shortcuts
 */
function quickNewGrievance() {
  showStartGrievanceDialog();
}

function quickSearch() {
  showMemberSearch();
}

function quickEmail() {
  composeGrievanceEmail();
}

function quickBatchOps() {
  showBatchOperationsMenu();
}

function quickRefresh() {
  refreshCalculations();
}

/**
 * Keyboard shortcut registry and handler
 */
KEYBOARD_SHORTCUTS = {
  // Navigation
  'Ctrl+G': 'navigateToGrievanceLog',
  'Ctrl+M': 'navigateToMemberDirectory',
  'Ctrl+D': 'navigateToDashboard',
  'Ctrl+I': 'navigateToInteractiveDashboard',

  // Search
  'Ctrl+F': 'quickSearch',

  // Actions
  'Ctrl+N': 'quickNewGrievance',
  'Ctrl+E': 'quickEmail',
  'Ctrl+B': 'quickBatchOps',
  'Ctrl+R': 'quickRefresh',

  // Drive
  'Ctrl+Shift+D': 'setupDriveFolderForGrievance',
  'Ctrl+U': 'showFileUploadDialog',

  // Automation
  'Ctrl+Shift+N': 'showNotificationSettings',
  'Ctrl+Shift+R': 'showReportAutomationSettings',

  // Help
  'Ctrl+?': 'showKeyboardShortcuts',
  'F1': 'showContextHelp'
};

/**
 * Shows keyboard shortcuts configuration
 */
function showKeyboardShortcutsConfig() {
  const html = `
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
    }
    h2 {
      color: #1a73e8;
      margin-top: 0;
      border-bottom: 3px solid #1a73e8;
      padding-bottom: 10px;
    }
    .info-box {
      background: #e8f0fe;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
      border-left: 4px solid #1a73e8;
    }
    .warning-box {
      background: #fff3cd;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
      border-left: 4px solid #ffc107;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: #1a73e8;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 500;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    tr:hover {
      background: #f5f5f5;
    }
    .shortcut-code {
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #1a73e8;
      border: 1px solid #ddd;
    }
    button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
      margin: 10px 5px 0 0;
    }
    button:hover {
      background: #1557b0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>⚙️ Keyboard Shortcuts Configuration</h2>

    <div class="info-box">
      <strong>ℹ️ How to Use:</strong> Keyboard shortcuts work globally across all sheets.
      Press the key combination to trigger the action instantly.
    </div>

    <div class="warning-box">
      <strong>⚠️ Note:</strong> Some shortcuts may conflict with browser shortcuts.
      Use Google Sheets in full-screen mode (F11) for best experience.
    </div>

    <h3>Current Shortcuts</h3>
    <table>
      <thead>
        <tr>
          <th>Shortcut</th>
          <th>Action</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="shortcut-code">Ctrl+G</span></td>
          <td>Go to Grievance Log</td>
          <td>Navigation</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">Ctrl+M</span></td>
          <td>Go to Member Directory</td>
          <td>Navigation</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">Ctrl+D</span></td>
          <td>Go to Dashboard</td>
          <td>Navigation</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">Ctrl+I</span></td>
          <td>Go to Interactive Dashboard</td>
          <td>Navigation</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">Ctrl+F</span></td>
          <td>Search Members</td>
          <td>Search</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">Ctrl+N</span></td>
          <td>New Grievance</td>
          <td>Actions</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">Ctrl+E</span></td>
          <td>Compose Email</td>
          <td>Actions</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">Ctrl+B</span></td>
          <td>Batch Operations</td>
          <td>Actions</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">Ctrl+R</span></td>
          <td>Refresh All</td>
          <td>Actions</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">Ctrl+Shift+D</span></td>
          <td>Setup Drive Folder</td>
          <td>Files</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">Ctrl+U</span></td>
          <td>Upload Files</td>
          <td>Files</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">Ctrl+?</span></td>
          <td>Show Shortcuts Help</td>
          <td>Help</td>
        </tr>
        <tr>
          <td><span class="shortcut-code">F1</span></td>
          <td>Context Help</td>
          <td>Help</td>
        </tr>
      </tbody>
    </table>

    <button onclick="google.script.run.withSuccessHandler(function() { google.script.host.close(); }).showKeyboardShortcuts()">
      📖 View Shortcuts Guide
    </button>
  </div>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(750)
    .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '⚙️ Keyboard Shortcuts Configuration');
}

/**
 * Shows context-sensitive help based on current sheet (keyboard shortcut version)
 * Note: Canonical showContextHelp() is in ContextSensitiveHelp.gs
 */
function showContextHelpKeyboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const sheetName = activeSheet.getName();

  let helpContent = '';

  switch (sheetName) {
    case SHEETS.GRIEVANCE_LOG:
      helpContent = `
<h3>📋 Grievance Log Help</h3>
<p><strong>This sheet tracks all union grievances.</strong></p>

<h4>Common Tasks:</h4>
<ul>
  <li><strong>Add New Grievance:</strong> Use menu: 📋 Grievance Tools → ➕ Start New Grievance (or Ctrl+N)</li>
  <li><strong>Update Status:</strong> Select rows → ⚡ Batch Operations → 📊 Bulk Update Status</li>
  <li><strong>Assign Steward:</strong> Select rows → ⚡ Batch Operations → 👤 Bulk Assign Steward</li>
  <li><strong>View Files:</strong> Select row → 📁 Google Drive → 📂 Show Grievance Files</li>
  <li><strong>Send Email:</strong> Select row → 📧 Communications → 📧 Compose Email (or Ctrl+E)</li>
</ul>

<h4>Important Columns:</h4>
<ul>
  <li><strong>Column H:</strong> Step 1 Deadline (auto-calculated)</li>
  <li><strong>Column U:</strong> Days to Deadline (auto-calculated)</li>
  <li><strong>Column V:</strong> Deadline Status (auto-calculated)</li>
</ul>

<h4>Tips:</h4>
<ul>
  <li>Red rows = Overdue grievances (urgent action needed)</li>
  <li>Yellow rows = Deadline within 7 days</li>
  <li>Use filters to focus on specific statuses or stewards</li>
</ul>
      `;
      break;

    case SHEETS.MEMBER_DIR:
      helpContent = `
<h3>👥 Member Directory Help</h3>
<p><strong>This sheet contains all union member information.</strong></p>

<h4>Common Tasks:</h4>
<ul>
  <li><strong>Search Members:</strong> Use menu: 🔍 Search & Lookup → 🔍 Search Members (or Ctrl+F)</li>
  <li><strong>Add Member:</strong> Fill in a new row with required fields (ID, First Name, Last Name)</li>
  <li><strong>Update Info:</strong> Click on any cell and edit directly</li>
</ul>

<h4>Important Columns:</h4>
<ul>
  <li><strong>Column A:</strong> Member ID (must be unique, format: M######)</li>
  <li><strong>Column H:</strong> Email (validated format)</li>
  <li><strong>Column I:</strong> Phone (validated format)</li>
  <li><strong>Column J:</strong> Is Steward? (Yes/No dropdown)</li>
</ul>

<h4>Auto-Calculated Fields:</h4>
<ul>
  <li><strong>Column Z:</strong> Has Active Grievance? (auto-updated)</li>
  <li><strong>Column AA:</strong> Grievance Status Snapshot</li>
  <li><strong>Column AB:</strong> Next Grievance Deadline</li>
</ul>

<h4>Tips:</h4>
<ul>
  <li>Use 🆔 Generate Next Member ID to get the next available ID</li>
  <li>Email and phone fields validate automatically</li>
  <li>Mark stewards in Column J to enable auto-assignment</li>
</ul>
      `;
      break;

    case SHEETS.DASHBOARD:
      helpContent = `
<h3>📊 Dashboard Help</h3>
<p><strong>Real-time overview of all grievance operations.</strong></p>

<h4>Dashboard Sections:</h4>
<ul>
  <li><strong>Key Metrics:</strong> Total grievances, open cases, average resolution time</li>
  <li><strong>Status Breakdown:</strong> Grievances by current status</li>
  <li><strong>Issue Type Analysis:</strong> Most common grievance types</li>
  <li><strong>Steward Workload:</strong> Cases assigned per steward</li>
  <li><strong>Timeline:</strong> Cases filed this month vs. last month</li>
</ul>

<h4>Other Dashboards:</h4>
<ul>
  <li><strong>Interactive Dashboard:</strong> 📊 Dashboards → ✨ Interactive Dashboard</li>
  <li><strong>Unified Operations Monitor:</strong> 📊 Dashboards → 🎯 Unified Operations Monitor</li>
</ul>

<h4>Tips:</h4>
<ul>
  <li>Dashboard auto-updates when data changes</li>
  <li>Use 🔄 Refresh All to force update (Ctrl+R)</li>
  <li>Charts are interactive - click to see details</li>
</ul>
      `;
      break;

    default:
      helpContent = `
<h3>❓ 509 Dashboard Help</h3>
<p><strong>Welcome to the SEIU Local 509 Grievance Dashboard!</strong></p>

<h4>Main Sheets:</h4>
<ul>
  <li><strong>📋 Grievance Log:</strong> Track all grievances (Ctrl+G)</li>
  <li><strong>👥 Member Directory:</strong> Member information (Ctrl+M)</li>
  <li><strong>📊 Dashboard:</strong> Real-time metrics (Ctrl+D)</li>
</ul>

<h4>Quick Actions:</h4>
<ul>
  <li><strong>New Grievance:</strong> Ctrl+N</li>
  <li><strong>Search Members:</strong> Ctrl+F</li>
  <li><strong>Compose Email:</strong> Ctrl+E</li>
  <li><strong>Batch Operations:</strong> Ctrl+B</li>
</ul>

<h4>Getting Started:</h4>
<ol>
  <li>Navigate to the Grievance Log or Member Directory</li>
  <li>Press F1 for context-specific help</li>
  <li>Press Ctrl+? to see all keyboard shortcuts</li>
  <li>Use the menu: ❓ Help & Support → 📚 Getting Started Guide</li>
</ol>
      `;
  }

  const html = `
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
      max-height: 600px;
      overflow-y: auto;
    }
    h2 {
      color: #1a73e8;
      margin-top: 0;
      border-bottom: 3px solid #1a73e8;
      padding-bottom: 10px;
    }
    h3 {
      color: #1a73e8;
      margin-top: 0;
    }
    h4 {
      color: #333;
      margin: 20px 0 10px 0;
    }
    ul, ol {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 8px 0;
      line-height: 1.6;
    }
    strong {
      color: #1a73e8;
    }
    .sheet-badge {
      display: inline-block;
      background: #e8f0fe;
      color: #1a73e8;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="sheet-badge">📍 Current Sheet: ${sheetName}</div>
    ${helpContent}
  </div>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(700)
    .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, `❓ Help - ${sheetName}`);
}
