/**
 * ============================================================================
 * CONTEXT-SENSITIVE HELP SYSTEM
 * ============================================================================
 *
 * Sheet-specific help with ? icons and contextual tooltips.
 *
 * Features:
 * - Sheet-specific help content
 * - ? icon help buttons in headers
 * - Task-based quick guides
 * - Searchable help index
 * - Help overlay on F1
 *
 * @module ContextSensitiveHelp
 * @version 1.0.0
 * @author SEIU Local 509 Tech Team
 */

/**
 * Sheet-specific help content
 */
const SHEET_HELP = {
  [SHEETS.MEMBER_DIR]: {
    icon: '👥',
    title: 'Member Directory',
    purpose: 'Store and manage all union member information including contact details, work information, and engagement data.',
    keyTasks: [
      { task: 'Add New Member', steps: 'Enter data in the next empty row. Member ID auto-generates.' },
      { task: 'Start Grievance', steps: 'Check the "Start Grievance" checkbox (column AE) for the member.' },
      { task: 'Search Members', steps: 'Use Ctrl+F or Dashboard menu → Search & Lookup → Search Members.' },
      { task: 'Contact Member', steps: 'Click their email to compose, or use Quick Actions menu.' }
    ],
    columns: [
      { name: 'Member ID (A)', desc: 'Unique identifier, format M000001' },
      { name: 'Name (B-C)', desc: 'First and last name' },
      { name: 'Email/Phone (H-I)', desc: 'Primary contact information' },
      { name: 'Assigned Steward (P)', desc: 'Union steward responsible for this member' },
      { name: 'Start Grievance (AE)', desc: 'Checkbox to initiate new grievance' }
    ],
    tips: [
      'Columns Q-X are hidden by default. Use Column Toggles to show engagement metrics.',
      'The last three columns (AB-AD) auto-calculate grievance status from the Grievance Log.',
      'Use the Quick Actions menu (Dashboard → Grievance Tools) for common operations.'
    ]
  },
  [SHEETS.GRIEVANCE_LOG]: {
    icon: '📋',
    title: 'Grievance Log',
    purpose: 'Track all grievances from filing to resolution with automatic deadline calculations.',
    keyTasks: [
      { task: 'Update Status', steps: 'Change the Status column (E) to reflect current state.' },
      { task: 'Record Decision', steps: 'Enter date in the appropriate "Decision Rcvd" column.' },
      { task: 'Close Grievance', steps: 'Set Status to Settled/Closed and enter Date Closed (R).' },
      { task: 'View Deadline', steps: 'Check "Next Action Due" (T) or "Days to Deadline" (U).' }
    ],
    columns: [
      { name: 'Grievance ID (A)', desc: 'Unique identifier, format G-000001-A' },
      { name: 'Status (E)', desc: 'Open, Pending Info, Settled, Withdrawn, Closed, Appealed' },
      { name: 'Current Step (F)', desc: 'Informal, Step I, Step II, Step III, Mediation, Arbitration' },
      { name: 'Filing Deadline (H)', desc: 'Auto-calculated: Incident Date + 21 days' },
      { name: 'Next Action Due (T)', desc: 'Auto-calculated next deadline based on current step' }
    ],
    tips: [
      'Yellow cells indicate approaching deadlines (< 7 days). Red cells are overdue.',
      'All deadline columns auto-calculate based on contract rules.',
      'Use the Grievance Float Toggle to highlight priority cases.',
      'Sync deadlines to Google Calendar with the Calendar Integration menu.'
    ]
  },
  'Dashboard': {
    icon: '📊',
    title: 'Main Dashboard',
    purpose: 'Real-time overview of all key metrics and upcoming deadlines.',
    keyTasks: [
      { task: 'Refresh Data', steps: 'Click Dashboard menu → Refresh All or wait for auto-refresh.' },
      { task: 'View Details', steps: 'Click any metric to navigate to the source data.' },
      { task: 'Export Report', steps: 'Dashboard menu → Reports → Export to CSV.' }
    ],
    columns: [],
    tips: [
      'All metrics update automatically when source data changes.',
      'The Upcoming Deadlines table shows grievances due in the next 14 days.',
      'Use the Interactive Dashboard for customizable visualizations.'
    ]
  },
  'Config': {
    icon: '⚙️',
    title: 'Configuration Sheet',
    purpose: 'Master lists for dropdown validations and system settings.',
    keyTasks: [
      { task: 'Add New Option', steps: 'Add the new value to the appropriate column.' },
      { task: 'Update Steward List', steps: 'Edit column H to add/remove steward names.' }
    ],
    columns: [
      { name: 'Job Titles (A)', desc: 'Valid job titles for members' },
      { name: 'Office Locations (B)', desc: 'Work locations/sites' },
      { name: 'Stewards (H)', desc: 'Active union stewards' },
      { name: 'Grievance Status (I)', desc: 'Valid grievance status values' }
    ],
    tips: [
      'Changes here immediately affect dropdowns in other sheets.',
      'Do not delete values that are in use in Member Directory or Grievance Log.',
      'Keep lists clean and consistent for better reporting.'
    ]
  }
};

/**
 * Shows context-sensitive help for the active sheet
 */
function showContextHelp() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const sheetName = activeSheet.getName();

  const help = SHEET_HELP[sheetName];

  if (!help) {
    showGeneralHelp();
    return;
  }

  const html = createContextHelpHTML(help, sheetName);
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, `${help.icon} Help: ${help.title}`);
}

/**
 * Creates HTML for context-sensitive help
 * @param {Object} help - Help content object
 * @param {string} sheetName - Sheet name
 * @returns {string} HTML content
 */
function createContextHelpHTML(help, sheetName) {
  const tasksHTML = help.keyTasks.map(t => `
    <div class="task">
      <div class="task-title">📌 ${t.task}</div>
      <div class="task-steps">${t.steps}</div>
    </div>
  `).join('');

  const columnsHTML = help.columns.length > 0 ? help.columns.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.desc}</td>
    </tr>
  `).join('') : '<tr><td colspan="2">No specific columns documented.</td></tr>';

  const tipsHTML = help.tips.map(t => `<li>${t}</li>`).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-height: 560px; overflow-y: auto; }
    h2 { color: #1a73e8; margin-top: 0; display: flex; align-items: center; gap: 10px; }
    .purpose { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #1a73e8; }
    h3 { color: #333; margin-top: 25px; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
    .task { background: #f8f9fa; padding: 12px; margin: 10px 0; border-radius: 4px; }
    .task-title { font-weight: bold; color: #1a73e8; margin-bottom: 5px; }
    .task-steps { color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border: 1px solid #e0e0e0; }
    th { background: #f5f5f5; }
    .tips { background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff9800; }
    .tips ul { margin: 10px 0; padding-left: 20px; }
    .tips li { margin: 8px 0; }
    .search-box { width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; margin-bottom: 15px; box-sizing: border-box; }
    .footer { margin-top: 20px; padding-top: 15px; border-top: 2px solid #e0e0e0; text-align: center; }
    button { padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
    button.secondary { background: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <h2>${help.icon} ${help.title} Help</h2>

    <div class="purpose">
      <strong>Purpose:</strong> ${help.purpose}
    </div>

    <h3>🎯 Key Tasks</h3>
    ${tasksHTML}

    ${help.columns.length > 0 ? `
    <h3>📋 Important Columns</h3>
    <table>
      <tr>
        <th>Column</th>
        <th>Description</th>
      </tr>
      ${columnsHTML}
    </table>
    ` : ''}

    <h3>💡 Tips</h3>
    <div class="tips">
      <ul>${tipsHTML}</ul>
    </div>

    <div class="footer">
      <button onclick="showTutorial()">📚 Take Tutorial</button>
      <button onclick="showFAQ()">❓ View FAQ</button>
      <button class="secondary" onclick="google.script.host.close()">Close</button>
    </div>
  </div>

  <script>
    function showTutorial() {
      google.script.run.showInteractiveTutorial();
      google.script.host.close();
    }
    function showFAQ() {
      google.script.run.showFAQSearch();
      google.script.host.close();
    }
  </script>
</body>
</html>
  `;
}

/**
 * Shows general help when no specific help is available
 */
function showGeneralHelp() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
    h2 { color: #1a73e8; margin-top: 0; }
    .section { margin: 20px 0; }
    .section h3 { color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
    .item { padding: 12px; margin: 10px 0; background: #f8f9fa; border-radius: 4px; cursor: pointer; }
    .item:hover { background: #e8f4fd; }
    .item-title { font-weight: bold; color: #1a73e8; }
    .item-desc { color: #666; font-size: 13px; margin-top: 5px; }
  </style>
</head>
<body>
  <h2>❓ 509 Dashboard Help</h2>

  <div class="section">
    <h3>🚀 Getting Started</h3>
    <div class="item" onclick="google.script.run.showQuickStartGuide()">
      <div class="item-title">Quick Start Guide</div>
      <div class="item-desc">Learn the basics in 5 minutes</div>
    </div>
    <div class="item" onclick="google.script.run.showInteractiveTutorial()">
      <div class="item-title">Interactive Tutorial</div>
      <div class="item-desc">Step-by-step guided tour</div>
    </div>
    <div class="item" onclick="google.script.run.showVideoTutorials()">
      <div class="item-title">Video Tutorials</div>
      <div class="item-desc">Watch video walkthroughs</div>
    </div>
  </div>

  <div class="section">
    <h3>📚 Resources</h3>
    <div class="item" onclick="google.script.run.showFAQSearch()">
      <div class="item-title">FAQ & Knowledge Base</div>
      <div class="item-desc">Search frequently asked questions</div>
    </div>
    <div class="item" onclick="google.script.run.showKeyboardShortcuts()">
      <div class="item-title">Keyboard Shortcuts</div>
      <div class="item-desc">Speed up your work with shortcuts</div>
    </div>
    <div class="item" onclick="google.script.run.showReleaseNotes()">
      <div class="item-title">Release Notes</div>
      <div class="item-desc">See what's new in this version</div>
    </div>
  </div>

  <div class="section">
    <h3>🔧 Troubleshooting</h3>
    <div class="item" onclick="google.script.run.showErrorDashboard()">
      <div class="item-title">Error Dashboard</div>
      <div class="item-desc">View and resolve errors</div>
    </div>
    <div class="item" onclick="google.script.run.DIAGNOSE_SETUP()">
      <div class="item-title">Diagnose Setup</div>
      <div class="item-desc">Check system health</div>
    </div>
  </div>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(450)
    .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '❓ Help');
}

/**
 * Adds help icons to sheet headers
 * @param {string} sheetName - Optional specific sheet
 */
function addHelpIconsToHeaders(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheetsToProcess = sheetName
    ? [ss.getSheetByName(sheetName)]
    : Object.keys(SHEET_HELP).map(name => ss.getSheetByName(name));

  sheetsToProcess.forEach(sheet => {
    if (!sheet) return;

    const name = sheet.getName();
    const help = SHEET_HELP[name];
    if (!help) return;

    // Add help note to first cell
    const firstCell = sheet.getRange(1, 1);
    const currentValue = firstCell.getValue();

    if (!currentValue.toString().includes('❓')) {
      firstCell.setNote(
        `${help.icon} ${help.title}\n\n` +
        `${help.purpose}\n\n` +
        `Press F1 or go to Help menu for full documentation.`
      );
    }
  });

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Help icons added to sheet headers',
    'Done',
    3
  );
}

/**
 * Shows help for a specific column
 * @param {string} sheetName - Sheet name
 * @param {number} colNum - Column number
 */
function showColumnHelp(sheetName, colNum) {
  const help = SHEET_HELP[sheetName];
  if (!help) {
    showGeneralHelp();
    return;
  }

  // Find column in help data
  const colLetter = getColumnLetter(colNum);
  let columnHelp = null;

  for (const col of help.columns) {
    if (col.name.includes(`(${colLetter})`)) {
      columnHelp = col;
      break;
    }
  }

  if (!columnHelp) {
    SpreadsheetApp.getUi().alert(
      `Column ${colLetter} Help`,
      'No specific help available for this column.\n\n' +
      'Press F1 for general sheet help.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  SpreadsheetApp.getUi().alert(
    `${help.icon} ${columnHelp.name}`,
    columnHelp.desc,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Shows task-specific help
 * @param {string} taskName - Name of the task
 */
function showTaskHelp(taskName) {
  const taskHelp = {
    'start_grievance': {
      title: 'Starting a New Grievance',
      steps: [
        '1. Go to Member Directory',
        '2. Find the member who filed the grievance',
        '3. Check the "Start Grievance" checkbox in column AE',
        '4. Fill in the grievance details in the popup form',
        '5. Click Submit - a new row will be added to Grievance Log'
      ],
      tips: 'You can also start from Dashboard menu → Grievance Tools → Start New Grievance'
    },
    'update_status': {
      title: 'Updating Grievance Status',
      steps: [
        '1. Go to Grievance Log',
        '2. Find the grievance row',
        '3. Change the Status column (E) dropdown',
        '4. If closing, also set the Date Closed column (R)'
      ],
      tips: 'Status changes trigger automatic recalculation of deadlines'
    },
    'send_email': {
      title: 'Sending Email to Member',
      steps: [
        '1. Go to Dashboard menu → Communications → Compose Email',
        '2. Or use Quick Actions on a member/grievance row',
        '3. Select a template or compose custom message',
        '4. Click Send - email is logged automatically'
      ],
      tips: 'Email templates with placeholders save time on common messages'
    }
  };

  const help = taskHelp[taskName];
  if (!help) {
    showGeneralHelp();
    return;
  }

  SpreadsheetApp.getUi().alert(
    `📋 ${help.title}`,
    help.steps.join('\n') + '\n\n💡 Tip: ' + help.tips,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Searches help content
 * @param {string} query - Search query
 * @returns {Array} Matching help items
 */
function searchHelp(query) {
  const results = [];
  const lowerQuery = query.toLowerCase();

  Object.entries(SHEET_HELP).forEach(([sheetName, help]) => {
    // Search in purpose
    if (help.purpose.toLowerCase().includes(lowerQuery)) {
      results.push({
        sheet: sheetName,
        type: 'Purpose',
        content: help.purpose,
        icon: help.icon
      });
    }

    // Search in tasks
    help.keyTasks.forEach(task => {
      if (task.task.toLowerCase().includes(lowerQuery) ||
          task.steps.toLowerCase().includes(lowerQuery)) {
        results.push({
          sheet: sheetName,
          type: 'Task',
          content: `${task.task}: ${task.steps}`,
          icon: '📌'
        });
      }
    });

    // Search in columns
    help.columns.forEach(col => {
      if (col.name.toLowerCase().includes(lowerQuery) ||
          col.desc.toLowerCase().includes(lowerQuery)) {
        results.push({
          sheet: sheetName,
          type: 'Column',
          content: `${col.name}: ${col.desc}`,
          icon: '📋'
        });
      }
    });

    // Search in tips
    help.tips.forEach(tip => {
      if (tip.toLowerCase().includes(lowerQuery)) {
        results.push({
          sheet: sheetName,
          type: 'Tip',
          content: tip,
          icon: '💡'
        });
      }
    });
  });

  return results;
}

/**
 * Shows help search dialog
 */
function showHelpSearch() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
    h2 { color: #1a73e8; margin-top: 0; }
    .search-box { width: 100%; padding: 12px; border: 2px solid #1a73e8; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
    .search-box:focus { outline: none; border-color: #1557b0; }
    .results { margin-top: 20px; max-height: 400px; overflow-y: auto; }
    .result { padding: 12px; margin: 10px 0; background: #f8f9fa; border-radius: 4px; border-left: 4px solid #1a73e8; }
    .result-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .result-sheet { font-weight: bold; color: #1a73e8; }
    .result-type { font-size: 12px; color: #666; background: #e0e0e0; padding: 2px 8px; border-radius: 10px; }
    .result-content { color: #333; font-size: 14px; }
    .no-results { text-align: center; padding: 40px; color: #666; }
  </style>
</head>
<body>
  <h2>🔍 Search Help</h2>

  <input type="text" class="search-box" id="searchQuery" placeholder="Type to search help..." oninput="search()">

  <div class="results" id="results">
    <div class="no-results">Enter a search term to find help topics</div>
  </div>

  <script>
    let searchTimeout;

    function search() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(doSearch, 300);
    }

    function doSearch() {
      const query = document.getElementById('searchQuery').value.trim();

      if (query.length < 2) {
        document.getElementById('results').innerHTML =
          '<div class="no-results">Enter at least 2 characters to search</div>';
        return;
      }

      google.script.run
        .withSuccessHandler(showResults)
        .searchHelp(query);
    }

    function showResults(results) {
      const container = document.getElementById('results');

      if (results.length === 0) {
        container.innerHTML = '<div class="no-results">No results found</div>';
        return;
      }

      container.innerHTML = results.map(r => \`
        <div class="result">
          <div class="result-header">
            <span class="result-sheet">\${r.icon} \${r.sheet}</span>
            <span class="result-type">\${r.type}</span>
          </div>
          <div class="result-content">\${r.content}</div>
        </div>
      \`).join('');
    }
  </script>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '🔍 Search Help');
}
