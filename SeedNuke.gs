/**
 * ------------------------------------------------------------------------====
 * SEED NUKE - Remove All Seeded Data and Exit Demo Mode
 * ------------------------------------------------------------------------====
 *
 * Allows stewards to remove all test/seeded data and exit demo mode.
 * After nuking, the dashboard will be ready for production use.
 *
 * Features:
 * - Removes all seeded members and grievances
 * - Clears Config tab demo entries (Job Titles, Locations, etc.)
 * - Keeps headers and structure intact
 * - Recalculates all dashboards
 * - Hides seed menu options permanently
 * - Shows getting started reminder
 *
 * ------------------------------------------------------------------------====
 */

/**
 * Main function to nuke all seeded data
 */
function nukeSeedData() {
  const ui = SpreadsheetApp.getUi();

  // Confirmation dialog
  const response = ui.alert(
    '⚠️ WARNING: Remove All Seeded Data',
    'This will PERMANENTLY remove all test data from:\n\n' +
    '• Member Directory (all members)\n' +
    '• Grievance Log (all grievances)\n' +
    '• Steward Workload (all records)\n' +
    '• Config Tab Demo Entries:\n' +
    '   - Job Titles, Office Locations, Units\n' +
    '   - Supervisors, Managers, Stewards\n' +
    '   - Grievance Coordinators, Home Towns\n\n' +
    'Headers and sheet structure will be preserved.\n' +
    'Seed menu options will be hidden.\n\n' +
    'This action CANNOT be undone!\n\n' +
    'Are you sure you want to proceed?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    ui.alert('✅ Operation cancelled. No data was removed.');
    return;
  }

  // Double confirmation
  const finalConfirm = ui.alert(
    '🚨 FINAL CONFIRMATION',
    'This is your last chance!\n\n' +
    'ALL test data will be permanently deleted.\n' +
    'ALL seed functions will be hidden from menus.\n\n' +
    'Click YES to proceed with data removal.',
    ui.ButtonSet.YES_NO
  );

  if (finalConfirm !== ui.Button.YES) {
    ui.alert('✅ Operation cancelled. No data was removed.');
    return;
  }

  try {
    // Show progress
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ui.alert('⏳ Removing seeded data...\n\nThis may take a moment. Please wait.');

    // Step 1: Clear Member Directory (keep headers)
    clearMemberDirectory();

    // Step 2: Clear Grievance Log (keep headers)
    clearGrievanceLog();

    // Step 3: Clear Steward Workload (keep headers)
    clearStewardWorkload();

    // Step 4: Clear Config tab demo entries (keep headers)
    clearConfigDemoData();

    // Step 5: Recalculate all dashboards
    rebuildDashboard();

    // Step 6: Set flag that data has been nuked (hides seed menu)
    PropertiesService.getScriptProperties().setProperty('SEED_NUKED', 'true');

    // Step 7: Show getting started reminder
    showPostNukeGuidance();

  } catch (error) {
    ui.alert('❌ Error during data removal: ' + error.message);
    Logger.log('Error in nukeSeedData: ' + error.message);
  }
}

/**
 * Clears Member Directory while preserving headers
 */
function clearMemberDirectory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!sheet) {
    throw new Error('Member Directory not found');
  }

  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    // Delete all rows except header
    sheet.deleteRows(2, lastRow - 1);
  }

  Logger.log('Member Directory cleared: ' + (lastRow - 1) + ' members removed');
}

/**
 * Clears Grievance Log while preserving headers
 */
function clearGrievanceLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!sheet) {
    throw new Error('Grievance Log not found');
  }

  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    // Delete all rows except header
    sheet.deleteRows(2, lastRow - 1);
  }

  Logger.log('Grievance Log cleared: ' + (lastRow - 1) + ' grievances removed');
}

/**
 * Clears Steward Workload while preserving headers
 */
function clearStewardWorkload() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.STEWARD_WORKLOAD);

  if (!sheet) {
    // Sheet doesn't exist, skip
    return;
  }

  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    // Delete all rows except header
    sheet.deleteRows(2, lastRow - 1);
  }

  Logger.log('Steward Workload cleared');
}

/**
 * Clears demo/seeded data from Config tab
 * Preserves row 1 headers, clears all data below
 *
 * Columns cleared:
 * - A: Job Titles (CONFIG_COLS.JOB_TITLES)
 * - B: Office Locations (CONFIG_COLS.OFFICE_LOCATIONS)
 * - C: Units (CONFIG_COLS.UNITS)
 * - F: Supervisors (CONFIG_COLS.SUPERVISORS)
 * - G: Managers (CONFIG_COLS.MANAGERS)
 * - H: Stewards (CONFIG_COLS.STEWARDS)
 * - O: Grievance Coordinators (CONFIG_COLS.GRIEVANCE_COORDINATORS)
 * - AF: Home Towns (CONFIG_COLS.HOME_TOWNS)
 */
function clearConfigDemoData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.CONFIG);

  if (!sheet) {
    Logger.log('Config sheet not found, skipping');
    return;
  }

  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    Logger.log('Config sheet has only headers, nothing to clear');
    return;
  }

  // Define columns to clear (using CONFIG_COLS constants)
  // These columns contain demo/seeded data that should be removed
  const columnsToClear = [
    CONFIG_COLS.JOB_TITLES,           // A (1) - Job Titles
    CONFIG_COLS.OFFICE_LOCATIONS,     // B (2) - Office Locations
    CONFIG_COLS.UNITS,                // C (3) - Units
    CONFIG_COLS.SUPERVISORS,          // F (6) - Supervisors
    CONFIG_COLS.MANAGERS,             // G (7) - Managers
    CONFIG_COLS.STEWARDS,             // H (8) - Stewards
    CONFIG_COLS.GRIEVANCE_COORDINATORS, // O (15) - Grievance Coordinators
    CONFIG_COLS.HOME_TOWNS            // AF (32) - Home Towns
  ];

  // Clear each column from row 2 to lastRow (preserve header in row 1)
  const rowsToDelete = lastRow - 1;

  columnsToClear.forEach(function(col) {
    try {
      const range = sheet.getRange(2, col, rowsToDelete, 1);
      range.clearContent();
    } catch (e) {
      Logger.log('Error clearing column ' + col + ': ' + e.message);
    }
  });

  Logger.log('Config demo data cleared: ' + columnsToClear.length + ' columns, ' + rowsToDelete + ' rows each');
}

/**
 * Shows post-nuke guidance to the user
 */
function showPostNukeGuidance() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body {
      font-family: 'Roboto', Arial, sans-serif;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: 0;
    }
    .container {
      background: white;
      color: #333;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      color: #1a73e8;
      margin-top: 0;
      font-size: 28px;
      border-bottom: 3px solid #1a73e8;
      padding-bottom: 15px;
    }
    .success-icon {
      font-size: 64px;
      text-align: center;
      margin: 20px 0;
    }
    .info-box {
      background: #e8f0fe;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 5px solid #1a73e8;
    }
    .warning-box {
      background: #fff3cd;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 5px solid #ff9800;
    }
    .checklist {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .checklist h3 {
      margin-top: 0;
      color: #1a73e8;
    }
    .checklist ul {
      list-style: none;
      padding: 0;
    }
    .checklist li {
      padding: 10px 0;
      border-bottom: 1px solid #ddd;
    }
    .checklist li:last-child {
      border-bottom: none;
    }
    .checklist li::before {
      content: "☑️ ";
      margin-right: 10px;
    }
    .button-container {
      text-align: center;
      margin-top: 30px;
    }
    button {
      padding: 12px 30px;
      font-size: 16px;
      font-weight: bold;
      border: none;
      border-radius: 6px;
      background: #1a73e8;
      color: white;
      cursor: pointer;
      transition: all 0.3s;
    }
    button:hover {
      background: #1557b0;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(26,115,232,0.4);
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">🎉</div>

    <h1>Welcome to Production Mode!</h1>

    <div class="info-box">
      <strong>✅ Success!</strong><br>
      All seeded test data has been removed. Your dashboard is now ready for real member and grievance data.
    </div>

    <div class="warning-box">
      <strong>⚠️ Important Next Steps</strong><br>
      Before you start using the dashboard, please complete the setup steps below.
    </div>

    <div class="checklist">
      <h3>📋 Getting Started Checklist</h3>
      <ul>
        <li><strong>Configure Steward Contact Info</strong><br>
            Go to the <strong>⚙️ Config</strong> tab and enter your steward contact information in column U (rows 2-4).
            This will be used when starting grievances from the Member Directory.</li>

        <li><strong>Set Up Google Form (Optional)</strong><br>
            If you want to use the grievance workflow feature, create a Google Form for grievance submissions
            and update the form URL and field IDs in the script configuration.</li>

        <li><strong>Add Your First Members</strong><br>
            Go to <strong>👥 Member Directory</strong> and start adding your members.
            You can enter them manually or import from a CSV file.</li>

        <li><strong>Review Config Settings</strong><br>
            Check the <strong>⚙️ Config</strong> tab to ensure all dropdown values
            (job titles, locations, units, etc.) match your organization's needs.</li>

        <li><strong>Customize Dashboards</strong><br>
            Explore the various dashboard views and use the <strong>🎯 Interactive Dashboard</strong>
            to create custom views for your needs.</li>

        <li><strong>Set Up Triggers (Recommended)</strong><br>
            Go to <strong>509 Tools > Utilities > Setup Triggers</strong> to enable automatic
            calculations and deadline tracking.</li>
      </ul>
    </div>

    <div class="info-box">
      <strong>💡 Tip:</strong> The seed data menu options have been hidden. If you need to re-seed test data
      for training purposes, you can access the seeding functions from the script editor.
    </div>

    <div class="button-container">
      <button onclick="google.script.host.close()">Get Started!</button>
    </div>

    <div class="footer">
      SEIU Local 509 Dashboard | Ready for Production Use
    </div>
  </div>
</body>
</html>
  `).setWidth(700).setHeight(600);

  ui.showModalDialog(html, '🎉 Seeded Data Removed Successfully');
}

/**
 * Checks if seed data has been nuked
 */
function isSeedNuked() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty('SEED_NUKED') === 'true';
}

/**
 * Resets the nuke flag (for development/testing only)
 */
function resetNukeFlag() {
  PropertiesService.getScriptProperties().deleteProperty('SEED_NUKED');
  SpreadsheetApp.getUi().alert('✅ Nuke flag reset. Seed menu will be visible again.');
}

/**
 * Shows a quick reminder dialog to enter steward contact info
 */
function showStewardContactReminder() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    '👋 Quick Setup Reminder',
    'Have you entered your steward contact information in the Config tab?\n\n' +
    'This information is used when starting grievances from the Member Directory.\n\n' +
    'Go to: ⚙️ Config > Column U (Steward Contact Information)\n\n' +
    'Click YES if you\'ve already done this, or NO to be reminded later.',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    PropertiesService.getUserProperties().setProperty('STEWARD_INFO_CONFIGURED', 'true');
  }
}

/**
 * Checks if steward info is configured
 */
function isStewardInfoConfigured() {
  const props = PropertiesService.getUserProperties();
  return props.getProperty('STEWARD_INFO_CONFIGURED') === 'true';
}

/**
 * Shows getting started guide
 */
function showGettingStartedGuide() {
  const ui = SpreadsheetApp.getUi();

  const html = HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 25px;
      border-radius: 8px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #1a73e8;
      border-bottom: 3px solid #1a73e8;
      padding-bottom: 10px;
    }
    h2 {
      color: #1a73e8;
      margin-top: 30px;
    }
    .step {
      background: #f8f9fa;
      padding: 15px;
      margin: 15px 0;
      border-left: 4px solid #1a73e8;
      border-radius: 4px;
    }
    .step h3 {
      margin-top: 0;
      color: #333;
    }
    code {
      background: #e8f0fe;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
    button {
      padding: 10px 20px;
      background: #1a73e8;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 20px;
    }
    button:hover {
      background: #1557b0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📚 Getting Started Guide</h1>

    <p>Welcome to the SEIU Local 509 Dashboard! Follow these steps to get started:</p>

    <div class="step">
      <h3>1️⃣ Configure Steward Contact Information</h3>
      <p>Go to the <code>⚙️ Config</code> tab and scroll to column U.</p>
      <p>Enter:</p>
      <ul>
        <li>Steward Name (Row 2)</li>
        <li>Steward Email (Row 3)</li>
        <li>Steward Phone (Row 4)</li>
      </ul>
      <p>This information will be automatically included when starting new grievances.</p>
    </div>

    <div class="step">
      <h3>2️⃣ Add Members to the Directory</h3>
      <p>Go to the <code>👥 Member Directory</code> tab and start adding member information.</p>
      <p>You can:</p>
      <ul>
        <li>Enter members manually</li>
        <li>Import from a CSV file</li>
        <li>Copy and paste from another spreadsheet</li>
      </ul>
    </div>

    <div class="step">
      <h3>3️⃣ Review Configuration Settings</h3>
      <p>In the <code>⚙️ Config</code> tab, review the dropdown lists to ensure they match your needs:</p>
      <ul>
        <li>Job Titles</li>
        <li>Work Locations</li>
        <li>Grievance Types</li>
        <li>And more...</li>
      </ul>
    </div>

    <div class="step">
      <h3>4️⃣ Set Up Automatic Calculations</h3>
      <p>Go to <code>509 Tools > Utilities > Setup Triggers</code></p>
      <p>This enables automatic deadline calculations and dashboard updates.</p>
    </div>

    <div class="step">
      <h3>5️⃣ Explore the Dashboards</h3>
      <p>Check out the various dashboard views:</p>
      <ul>
        <li><code>📊 Main Dashboard</code> - Overview of all metrics</li>
        <li><code>🎯 Interactive Dashboard</code> - Customizable views</li>
        <li><code>👨‍⚖️ Steward Workload</code> - Track steward assignments</li>
      </ul>
    </div>

    <h2>🚀 Optional: Set Up Grievance Workflow</h2>

    <div class="step">
      <h3>Create a Google Form for Grievances</h3>
      <p>If you want to use the automated grievance workflow:</p>
      <ol>
        <li>Create a Google Form with fields for grievance information</li>
        <li>Link the form to this spreadsheet</li>
        <li>Update the form URL and field IDs in the script configuration</li>
        <li>Set up a form submission trigger</li>
      </ol>
      <p>See the documentation in <code>GrievanceWorkflow.gs</code> for details.</p>
    </div>

    <button onclick="google.script.host.close()">Let's Go!</button>
  </div>
</body>
</html>
  `).setWidth(900).setHeight(700);

  ui.showModalDialog(html, 'Getting Started Guide');
}

/**
 * Rebuilds all dashboard calculations and charts
 * Called after data is cleared/nuked to refresh metrics
 */
function rebuildDashboard() {
  try {
    // Call the main refresh function from Code.gs
    if (typeof refreshCalculations === 'function') {
      refreshCalculations();
    }

    // Rebuild interactive dashboard if it exists
    if (typeof rebuildInteractiveDashboard === 'function') {
      rebuildInteractiveDashboard();
    }

    Logger.log('Dashboard rebuilt successfully');
  } catch (error) {
    Logger.log('Error rebuilding dashboard: ' + error.message);
    // Non-critical error, continue execution
  }
}
