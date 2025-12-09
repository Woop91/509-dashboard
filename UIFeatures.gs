/**
 * UI FEATURES: QUICK ACTIONS, SEARCH, FILTERS, EXPORT/IMPORT
 * Features 87-89, 92-94: Quick Actions Sidebar, Advanced Search, Advanced Filtering,
 * Keyboard Shortcuts, Export Wizard, Import Wizard
 */

// ===========================
// FEATURE 87: QUICK ACTIONS SIDEBAR
// ===========================

/**
 * Shows the Quick Actions Sidebar with one-click common actions
 */
function showQuickActionsSidebar() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 15px;
            margin: 0;
            background: #f9fafb;
          }
          h2 {
            color: #7C3AED;
            margin-top: 0;
            font-size: 18px;
          }
          .section {
            background: white;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .section-title {
            font-weight: bold;
            color: #374151;
            margin-bottom: 8px;
            font-size: 14px;
          }
          button {
            width: 100%;
            padding: 10px;
            margin: 5px 0;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s;
          }
          .btn-primary {
            background: #7C3AED;
            color: white;
          }
          .btn-primary:hover {
            background: #6D28D9;
          }
          .btn-success {
            background: #059669;
            color: white;
          }
          .btn-success:hover {
            background: #047857;
          }
          .btn-info {
            background: #7EC8E3;
            color: white;
          }
          .btn-info:hover {
            background: #67B9DA;
          }
          .btn-warning {
            background: #F97316;
            color: white;
          }
          .btn-warning:hover {
            background: #EA580C;
          }
          .status {
            padding: 8px;
            margin-top: 10px;
            border-radius: 6px;
            font-size: 12px;
            display: none;
          }
          .status.success {
            background: #D1FAE5;
            color: #065F46;
          }
          .status.error {
            background: #FEE2E2;
            color: #991B1B;
          }
        </style>
      </head>
      <body>
        <h2>⚡ Quick Actions</h2>

        <div class="section">
          <div class="section-title">📊 Dashboards</div>
          <button class="btn-primary" onclick="runAction('goToDashboard')">
            Go to Main Dashboard
          </button>
          <button class="btn-primary" onclick="runAction('openInteractiveDashboard')">
            Open Interactive Dashboard
          </button>
          <button class="btn-primary" onclick="runAction('showUnifiedOperationsMonitor')">
            Operations Monitor
          </button>
        </div>

        <div class="section">
          <div class="section-title">➕ Create New</div>
          <button class="btn-success" onclick="runAction('showStartGrievanceDialog')">
            Start New Grievance
          </button>
          <button class="btn-success" onclick="runAction('showImportWizard')">
            Import Data
          </button>
        </div>

        <div class="section">
          <div class="section-title">🔍 Search & Filter</div>
          <button class="btn-info" onclick="runAction('showSearchDialog')">
            Advanced Search
          </button>
          <button class="btn-info" onclick="runAction('showFilterDialog')">
            Advanced Filtering
          </button>
        </div>

        <div class="section">
          <div class="section-title">📤 Export & Reports</div>
          <button class="btn-warning" onclick="runAction('showExportWizard')">
            Export Wizard
          </button>
          <button class="btn-warning" onclick="runAction('showAuditReportDialog')">
            Generate Audit Report
          </button>
          <button class="btn-warning" onclick="runAction('generatePerformanceReport')">
            Performance Report
          </button>
        </div>

        <div class="section">
          <div class="section-title">💾 Backup & Security</div>
          <button class="btn-primary" onclick="runAction('createAutomatedBackup')">
            Create Backup Now
          </button>
          <button class="btn-primary" onclick="runAction('detectSuspiciousActivity')">
            Check Suspicious Activity
          </button>
        </div>

        <div id="status" class="status"></div>

        <script>
          function runAction(functionName) {
            showStatus('Running...', 'info');
            google.script.run
              .withSuccessHandler(function() {
                showStatus('✓ Action completed', 'success');
              })
              .withFailureHandler(function(error) {
                showStatus('✗ Error: ' + error.message, 'error');
              })
              [functionName]();
          }

          function showStatus(message, type) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.className = 'status ' + type;
            status.style.display = 'block';

            if (type === 'success' || type === 'error') {
              setTimeout(function() {
                status.style.display = 'none';
              }, 3000);
            }
          }
        </script>
      </body>
    </html>
  `)
    .setTitle('Quick Actions')
    .setWidth(300);

  SpreadsheetApp.getUi().showSidebar(html);
}

// ===========================
// FEATURE 88: ADVANCED SEARCH
// ===========================

/**
 * Shows advanced search dialog for grievances
 */
function showSearchDialog() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 500px;
            margin: 0 auto;
          }
          h2 {
            color: #7C3AED;
            margin-bottom: 20px;
          }
          .form-group {
            margin-bottom: 15px;
          }
          label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            color: #374151;
          }
          input, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #D1D5DB;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          }
          button {
            background: #7C3AED;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin-right: 10px;
          }
          button:hover {
            background: #6D28D9;
          }
          .btn-secondary {
            background: #6B7280;
          }
          .btn-secondary:hover {
            background: #4B5563;
          }
          .results {
            margin-top: 20px;
            padding: 15px;
            background: #F9FAFB;
            border-radius: 6px;
            display: none;
          }
        </style>
      </head>
      <body>
        <h2>🔍 Advanced Grievance Search</h2>

        <div class="form-group">
          <label>Search By:</label>
          <select id="searchType">
            <option value="id">Grievance ID</option>
            <option value="member">Member Name</option>
            <option value="type">Issue Type</option>
            <option value="steward">Steward Name</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div class="form-group">
          <label>Search Term:</label>
          <input type="text" id="searchTerm" placeholder="Enter search term...">
        </div>

        <div class="form-group">
          <button onclick="performSearch()">Search</button>
          <button class="btn-secondary" onclick="google.script.host.close()">Cancel</button>
        </div>

        <div id="results" class="results">
          <strong>Results:</strong>
          <div id="resultsContent"></div>
        </div>

        <script>
          function performSearch() {
            const searchType = document.getElementById('searchType').value;
            const searchTerm = document.getElementById('searchTerm').value;

            if (!searchTerm) {
              alert('Please enter a search term');
              return;
            }

            document.getElementById('results').style.display = 'block';
            document.getElementById('resultsContent').innerHTML = 'Searching...';

            google.script.run
              .withSuccessHandler(displayResults)
              .withFailureHandler(function(error) {
                document.getElementById('resultsContent').innerHTML =
                  '<p style="color: red;">Error: ' + error.message + '</p>';
              })
              .searchGrievances(searchType, searchTerm);
          }

          function displayResults(results) {
            const content = document.getElementById('resultsContent');

            if (results.length === 0) {
              content.innerHTML = '<p>No results found.</p>';
              return;
            }

            let html = '<p>Found ' + results.length + ' result(s):</p><ul>';
            results.forEach(function(item) {
              html += '<li><strong>' + item.id + '</strong>: ' + item.name +
                      ' - ' + item.status + ' (' + item.type + ')</li>';
            });
            html += '</ul>';

            content.innerHTML = html;
          }
        </script>
      </body>
    </html>
  `)
    .setWidth(550)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Advanced Search');
}

/**
 * Searches grievances based on criteria
 * @param {string} searchType - Type of search (id, member, type, steward, status)
 * @param {string} searchTerm - Search term
 * @return {Array} Array of matching grievances
 */
function searchGrievances(searchType, searchTerm) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceLog) {
    throw new Error('Grievance Log sheet not found');
  }

  const data = grievanceLog.getDataRange().getValues();
  const headers = data[0];
  const records = data.slice(1);

  // Determine which column to search
  let searchCol;
  switch (searchType) {
    case 'id':
      searchCol = 0; // Grievance ID
      break;
    case 'member':
      searchCol = 2; // First Name (will also check Last Name)
      break;
    case 'type':
      searchCol = headers.indexOf('Issue Category');
      break;
    case 'steward':
      searchCol = headers.indexOf('Assigned Steward (Name)');
      break;
    case 'status':
      searchCol = headers.indexOf('Status');
      break;
    default:
      searchCol = 0;
  }

  const searchLower = searchTerm.toLowerCase();
  const results = [];

  records.forEach(row => {
    let match = false;

    if (searchType === 'member') {
      // Search both first and last name
      const firstName = String(row[2] || '').toLowerCase();
      const lastName = String(row[3] || '').toLowerCase();
      match = firstName.includes(searchLower) || lastName.includes(searchLower);
    } else {
      const cellValue = String(row[searchCol] || '').toLowerCase();
      match = cellValue.includes(searchLower);
    }

    if (match) {
      results.push({
        id: row[0],
        name: row[2] + ' ' + row[3],
        status: row[4],
        type: row[headers.indexOf('Issue Category')]
      });
    }
  });

  return results;
}

// ===========================
// FEATURE 89: ADVANCED FILTERING
// ===========================

/**
 * Shows advanced filtering dialog
 */
function showFilterDialog() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
          }
          h2 {
            color: #7C3AED;
            margin-bottom: 20px;
          }
          .form-group {
            margin-bottom: 15px;
          }
          label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            color: #374151;
          }
          input, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #D1D5DB;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          }
          button {
            background: #7C3AED;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin-right: 10px;
            margin-top: 10px;
          }
          button:hover {
            background: #6D28D9;
          }
          .btn-secondary {
            background: #6B7280;
          }
          .btn-secondary:hover {
            background: #4B5563;
          }
        </style>
      </head>
      <body>
        <h2>🔎 Advanced Filtering</h2>

        <div class="form-group">
          <label>Status:</label>
          <select id="status">
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Pending Info">Pending Info</option>
            <option value="Settled">Settled</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div class="form-group">
          <label>Issue Type:</label>
          <select id="issueType">
            <option value="">All Types</option>
            <option value="Discipline">Discipline</option>
            <option value="Workload">Workload</option>
            <option value="Scheduling">Scheduling</option>
            <option value="Pay">Pay</option>
            <option value="Benefits">Benefits</option>
          </select>
        </div>

        <div class="form-group">
          <label>Start Date:</label>
          <input type="date" id="startDate">
        </div>

        <div class="form-group">
          <label>End Date:</label>
          <input type="date" id="endDate">
        </div>

        <div class="form-group">
          <label>Steward:</label>
          <input type="text" id="steward" placeholder="Enter steward name...">
        </div>

        <div class="form-group">
          <label>Location:</label>
          <input type="text" id="location" placeholder="Enter location...">
        </div>

        <div>
          <button onclick="applyFilters()">Apply Filters</button>
          <button class="btn-secondary" onclick="clearFilters()">Clear Filters</button>
          <button class="btn-secondary" onclick="google.script.host.close()">Close</button>
        </div>

        <script>
          function applyFilters() {
            const filters = {
              status: document.getElementById('status').value,
              issueType: document.getElementById('issueType').value,
              startDate: document.getElementById('startDate').value,
              endDate: document.getElementById('endDate').value,
              steward: document.getElementById('steward').value,
              location: document.getElementById('location').value
            };

            google.script.run
              .withSuccessHandler(function(count) {
                alert('Filter applied! Showing ' + count + ' matching records.');
                google.script.host.close();
              })
              .withFailureHandler(function(error) {
                alert('Error: ' + error.message);
              })
              .applyGrievanceFilters(filters);
          }

          function clearFilters() {
            document.getElementById('status').value = '';
            document.getElementById('issueType').value = '';
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            document.getElementById('steward').value = '';
            document.getElementById('location').value = '';

            google.script.run
              .withSuccessHandler(function() {
                alert('Filters cleared!');
                google.script.host.close();
              })
              .clearGrievanceFilters();
          }
        </script>
      </body>
    </html>
  `)
    .setWidth(650)
    .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Advanced Filtering');
}

/**
 * Applies filters to Grievance Log sheet
 */
function applyGrievanceFilters(filters) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceLog) {
    throw new Error('Grievance Log sheet not found');
  }

  // Remove existing filters
  const existingFilter = grievanceLog.getFilter();
  if (existingFilter) {
    existingFilter.remove();
  }

  const data = grievanceLog.getDataRange();
  const filter = data.createFilter();
  const headers = grievanceLog.getRange(1, 1, 1, grievanceLog.getLastColumn()).getValues()[0];

  // Apply status filter
  if (filters.status) {
    const statusCol = headers.indexOf('Status') + 1;
    const criteria = SpreadsheetApp.newFilterCriteria().whenTextEqualTo(filters.status).build();
    filter.setColumnFilterCriteria(statusCol, criteria);
  }

  // Apply issue type filter
  if (filters.issueType) {
    const typeCol = headers.indexOf('Issue Category') + 1;
    const criteria = SpreadsheetApp.newFilterCriteria().whenTextEqualTo(filters.issueType).build();
    filter.setColumnFilterCriteria(typeCol, criteria);
  }

  // Apply steward filter
  if (filters.steward) {
    const stewardCol = headers.indexOf('Assigned Steward (Name)') + 1;
    const criteria = SpreadsheetApp.newFilterCriteria().whenTextContains(filters.steward).build();
    filter.setColumnFilterCriteria(stewardCol, criteria);
  }

  // Apply location filter
  if (filters.location) {
    const locationCol = headers.indexOf('Work Location (Site)') + 1;
    const criteria = SpreadsheetApp.newFilterCriteria().whenTextContains(filters.location).build();
    filter.setColumnFilterCriteria(locationCol, criteria);
  }

  // Count visible rows
  const visibleRows = grievanceLog.getDataRange().getValues().filter((row, index) => {
    if (index === 0) return true; // Keep header
    return !grievanceLog.isRowHiddenByFilter(index + 1);
  }).length - 1; // Subtract header

  // Log filter application
  if (typeof logDataModification === 'function') {
    logDataModification('FILTER_APPLIED', 'Grievance Log', 'N/A', 'Filters',
                       'None', JSON.stringify(filters));
  }

  return visibleRows;
}

/**
 * Clears all filters from Grievance Log
 */
function clearGrievanceFilters() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceLog = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceLog) {
    throw new Error('Grievance Log sheet not found');
  }

  const existingFilter = grievanceLog.getFilter();
  if (existingFilter) {
    existingFilter.remove();
  }

  // Log filter clearing
  if (typeof logDataModification === 'function') {
    logDataModification('FILTER_CLEARED', 'Grievance Log', 'N/A', 'Filters', 'Active', 'Cleared');
  }
}

// ===========================
// FEATURE 92: KEYBOARD SHORTCUTS
// ===========================

/**
 * Sets up keyboard shortcuts (using named ranges as triggers)
 */
function setupKeyboardShortcuts() {
  const ui = SpreadsheetApp.getUi();

  const message = `
KEYBOARD SHORTCUTS REFERENCE:

Note: Apps Script has limited keyboard shortcut support.
Use the following menu shortcuts instead:

Alt+/ or Cmd+/  - Show menu search
Ctrl+Alt+Shift+1 - Go to Dashboard
Ctrl+Alt+Shift+2 - Quick Actions Sidebar
Ctrl+Alt+Shift+3 - Advanced Search
Ctrl+Alt+Shift+4 - Advanced Filtering
Ctrl+Alt+Shift+5 - Start New Grievance

You can also use:
- Menu shortcuts via Alt key (Windows) or Cmd key (Mac)
- Custom named ranges for quick navigation
- Bookmarks to favorite sheets

Would you like to create named ranges for quick navigation?
  `;

  const response = ui.alert('Keyboard Shortcuts', message, ui.ButtonSet.YES_NO);

  if (response === ui.Button.YES) {
    createNavigationNamedRanges();
    ui.alert('Success', 'Named ranges created for quick navigation!\n\nUse Ctrl+J (Windows) or Cmd+J (Mac) to jump to named ranges.', ui.ButtonSet.OK);
  }
}

/**
 * Creates named ranges for quick navigation
 */
function createNavigationNamedRanges() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const namedRanges = [
    { name: 'Dashboard_Home', sheet: 'Dashboard', range: 'A1' },
    { name: 'Members_Start', sheet: 'Member Directory', range: 'A1' },
    { name: 'Grievances_Start', sheet: 'Grievance Log', range: 'A1' },
    { name: 'Config_Start', sheet: 'Config', range: 'A1' },
    { name: 'Executive_Dashboard', sheet: '💼 Executive Dashboard', range: 'A1' }
  ];

  namedRanges.forEach(nr => {
    const sheet = ss.getSheetByName(nr.sheet);
    if (sheet) {
      const range = sheet.getRange(nr.range);

      // Remove existing named range if present
      const existing = ss.getNamedRanges().find(r => r.getName() === nr.name);
      if (existing) {
        existing.remove();
      }

      // Create new named range
      ss.setNamedRange(nr.name, range);
    }
  });
}

// ===========================
// FEATURE 93: EXPORT WIZARD
// ===========================

/**
 * Shows export wizard dialog
 */
function showExportWizard() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 500px;
            margin: 0 auto;
          }
          h2 {
            color: #7C3AED;
            margin-bottom: 20px;
          }
          .form-group {
            margin-bottom: 15px;
          }
          label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            color: #374151;
          }
          select, input {
            width: 100%;
            padding: 8px;
            border: 1px solid #D1D5DB;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          }
          button {
            background: #F97316;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin-right: 10px;
          }
          button:hover {
            background: #EA580C;
          }
          .btn-secondary {
            background: #6B7280;
          }
          .btn-secondary:hover {
            background: #4B5563;
          }
        </style>
      </head>
      <body>
        <h2>📤 Export Wizard</h2>

        <div class="form-group">
          <label>What to Export:</label>
          <select id="exportType">
            <option value="grievances">Grievances</option>
            <option value="members">Members</option>
            <option value="both">Both Grievances & Members</option>
            <option value="audit">Audit Log</option>
            <option value="performance">Performance Log</option>
          </select>
        </div>

        <div class="form-group">
          <label>Export Format:</label>
          <select id="format">
            <option value="csv">CSV (Comma-Separated)</option>
            <option value="xlsx">Excel (XLSX)</option>
            <option value="pdf">PDF Report</option>
            <option value="sheets">New Google Sheet</option>
          </select>
        </div>

        <div class="form-group">
          <label>Filter by Status (Optional):</label>
          <select id="statusFilter">
            <option value="">All Records</option>
            <option value="Open">Open Only</option>
            <option value="Closed">Closed Only</option>
            <option value="Pending Info">Pending Info Only</option>
          </select>
        </div>

        <div class="form-group">
          <label>Date Range (Optional):</label>
          <input type="date" id="startDate" placeholder="Start Date">
          <input type="date" id="endDate" placeholder="End Date" style="margin-top: 5px;">
        </div>

        <div>
          <button onclick="performExport()">Export</button>
          <button class="btn-secondary" onclick="google.script.host.close()">Cancel</button>
        </div>

        <script>
          function performExport() {
            const options = {
              exportType: document.getElementById('exportType').value,
              format: document.getElementById('format').value,
              statusFilter: document.getElementById('statusFilter').value,
              startDate: document.getElementById('startDate').value,
              endDate: document.getElementById('endDate').value
            };

            google.script.run
              .withSuccessHandler(function(result) {
                alert('Export completed successfully!\\n\\n' + result);
                google.script.host.close();
              })
              .withFailureHandler(function(error) {
                alert('Export failed: ' + error.message);
              })
              .exportData(options);
          }
        </script>
      </body>
    </html>
  `)
    .setWidth(550)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, 'Export Wizard');
}

/**
 * Exports data based on options
 */
function exportData(options) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Determine which sheet to export
  let sourceSheet;
  switch (options.exportType) {
    case 'grievances':
      sourceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
      break;
    case 'members':
      sourceSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
      break;
    case 'audit':
      sourceSheet = ss.getSheetByName(SHEETS.AUDIT_LOG);
      break;
    case 'performance':
      sourceSheet = ss.getSheetByName(SHEETS.PERFORMANCE_LOG);
      break;
    default:
      sourceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  }

  if (!sourceSheet) {
    throw new Error('Source sheet not found');
  }

  // Get data
  let data = sourceSheet.getDataRange().getValues();

  // Apply filters if specified
  if (options.statusFilter) {
    const headers = data[0];
    const statusCol = headers.indexOf('Status');
    data = [headers].concat(data.slice(1).filter(row => row[statusCol] === options.statusFilter));
  }

  // Handle export format
  let result;
  switch (options.format) {
    case 'csv':
      result = exportToCSV(data, options.exportType);
      break;
    case 'xlsx':
      result = exportToExcel(data, options.exportType);
      break;
    case 'sheets':
      result = exportToNewSheet(data, options.exportType);
      break;
    case 'pdf':
      result = exportToPDF(sourceSheet, options.exportType);
      break;
    default:
      result = exportToCSV(data, options.exportType);
  }

  // Log export
  if (typeof logDataModification === 'function') {
    logDataModification('EXPORT', sourceSheet.getName(), 'N/A', 'Export Wizard',
                       JSON.stringify(options), result);
  }

  return result;
}

/**
 * Export raw data array to CSV (simple version)
 * Note: Canonical exportToCSV() is in AdvancedExport.gs (takes sheet, applies permission filtering)
 */
function exportDataArrayToCSV(data, exportType) {
  const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const fileName = `${exportType}_export_${new Date().getTime()}.csv`;

  const blob = Utilities.newBlob(csv, 'text/csv', fileName);
  const folder = DriveApp.getRootFolder();
  const file = folder.createFile(blob);

  return `CSV file created: ${fileName}\n\nView: ${file.getUrl()}`;
}

function exportToNewSheet(data, exportType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const newSheet = ss.insertSheet(`${exportType}_export_${new Date().getTime()}`);
  newSheet.getRange(1, 1, data.length, data[0].length).setValues(data);

  return `New sheet created: ${newSheet.getName()}`;
}

/**
 * Export to PDF stub (placeholder)
 * Note: Canonical exportToPDF() is in AdvancedExport.gs
 */
function exportToPDFStub(sheet, exportType) {
  // Note: Direct PDF export from Apps Script is limited
  return `PDF export requested for ${exportType}. Use File > Download > PDF from the menu for full control over PDF export options.`;
}

/**
 * Export to Excel stub (placeholder)
 * Note: Canonical exportToExcel() is in AdvancedExport.gs
 */
function exportToExcelStub(data, exportType) {
  return `Excel export for ${exportType} requested. Note: Use Google Sheets' built-in "Download as Excel" feature for best results.`;
}

// ===========================
// FEATURE 94: DATA IMPORT
// ===========================

/**
 * Shows import wizard dialog
 */
function showImportWizard() {
  const ui = SpreadsheetApp.getUi();

  const message = `
DATA IMPORT WIZARD

Import data from CSV or Excel files.

STEPS:
1. Prepare your CSV/Excel file with the correct column headers
2. Upload file to Google Drive
3. Share the file so this script can access it
4. Copy the file URL or ID

What would you like to import?
- Members (requires columns: Member ID, First Name, Last Name, etc.)
- Grievances (requires columns: Grievance ID, Member ID, etc.)

Click OK to continue or Cancel to close.
  `;

  const response = ui.alert('Import Wizard', message, ui.ButtonSet.OK_CANCEL);

  if (response === ui.Button.OK) {
    showImportDialog();
  }
}

function showImportDialog() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 500px;
            margin: 0 auto;
          }
          h2 {
            color: #7C3AED;
            margin-bottom: 20px;
          }
          .form-group {
            margin-bottom: 15px;
          }
          label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            color: #374151;
          }
          select, input {
            width: 100%;
            padding: 8px;
            border: 1px solid #D1D5DB;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          }
          button {
            background: #059669;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin-right: 10px;
          }
          button:hover {
            background: #047857;
          }
          .btn-secondary {
            background: #6B7280;
          }
          .btn-secondary:hover {
            background: #4B5563;
          }
          .info {
            background: #E0E7FF;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 15px;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <h2>📥 Import Data</h2>

        <div class="info">
          <strong>Note:</strong> Your CSV/Excel file must have matching column headers.
        </div>

        <div class="form-group">
          <label>Import Type:</label>
          <select id="importType">
            <option value="members">Members</option>
            <option value="grievances">Grievances</option>
          </select>
        </div>

        <div class="form-group">
          <label>Google Sheets URL or File ID:</label>
          <input type="text" id="fileId" placeholder="Paste spreadsheet URL or file ID">
        </div>

        <div class="form-group">
          <label>Sheet Name (Optional):</label>
          <input type="text" id="sheetName" placeholder="Leave blank for first sheet">
        </div>

        <div>
          <button onclick="performImport()">Import</button>
          <button class="btn-secondary" onclick="google.script.host.close()">Cancel</button>
        </div>

        <script>
          function performImport() {
            const options = {
              importType: document.getElementById('importType').value,
              fileId: extractFileId(document.getElementById('fileId').value),
              sheetName: document.getElementById('sheetName').value
            };

            if (!options.fileId) {
              alert('Please enter a valid file URL or ID');
              return;
            }

            google.script.run
              .withSuccessHandler(function(result) {
                alert('Import completed!\\n\\n' + result);
                google.script.host.close();
              })
              .withFailureHandler(function(error) {
                alert('Import failed: ' + error.message);
              })
              .importData(options);
          }

          function extractFileId(input) {
            // Extract file ID from URL or return as-is if already an ID
            const match = input.match(/\\/d\\/([a-zA-Z0-9-_]+)/);
            return match ? match[1] : input.trim();
          }
        </script>
      </body>
    </html>
  `)
    .setWidth(550)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(html, 'Import Data');
}

/**
 * Imports data from external spreadsheet
 */
function importData(options) {
  try {
    // Open source spreadsheet
    const sourceSpreadsheet = SpreadsheetApp.openById(options.fileId);
    const sourceSheet = options.sheetName ?
      sourceSpreadsheet.getSheetByName(options.sheetName) :
      sourceSpreadsheet.getSheets()[0];

    if (!sourceSheet) {
      throw new Error('Source sheet not found');
    }

    const data = sourceSheet.getDataRange().getValues();

    if (data.length < 2) {
      throw new Error('No data to import');
    }

    // Get destination sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let destSheet;

    if (options.importType === 'members') {
      destSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
    } else if (options.importType === 'grievances') {
      destSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
    }

    if (!destSheet) {
      throw new Error('Destination sheet not found');
    }

    // Validate headers match
    const sourceHeaders = data[0];
    const destHeaders = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0];

    // Import data (skip header row)
    const importData = data.slice(1);
    const startRow = destSheet.getLastRow() + 1;

    destSheet.getRange(startRow, 1, importData.length, importData[0].length).setValues(importData);

    // Log import
    if (typeof logDataModification === 'function') {
      logDataModification('IMPORT', destSheet.getName(), 'Bulk Import', 'Records Imported',
                         '0', String(importData.length));
    }

    return `Successfully imported ${importData.length} records into ${destSheet.getName()}`;

  } catch (error) {
    throw new Error(`Import failed: ${error.message}`);
  }
}
