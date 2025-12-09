/**
 * ------------------------------------------------------------------------====
 * GRIEVANCE FLOAT/SORT TOGGLE
 * ------------------------------------------------------------------------====
 *
 * Float Feature:
 * - When enabled, sends closed/settled/inactive grievances to bottom
 * - Prioritizes by step: Step 3 > Step 2 > Step 1 (most to least important)
 * - Within each step, prioritizes by soonest due date
 *
 * Features:
 * - Toggle on/off via button or menu
 * - Smart sorting algorithm
 * - Preserves original data
 * - Visual feedback
 */

/**
 * Gets the grievance float toggle state from user settings
 * @returns {boolean} True if float is enabled
 */
function getGrievanceFloatState() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settingsSheet = ss.getSheetByName(SHEETS.USER_SETTINGS);

    if (!settingsSheet) {
      return false;
    }

    // Check for saved setting in User Settings sheet
    const settingsData = settingsSheet.getDataRange().getValues();
    for (let i = 0; i < settingsData.length; i++) {
      if (settingsData[i][0] === 'grievanceFloatEnabled') {
        return settingsData[i][1] === true || settingsData[i][1] === 'TRUE' || settingsData[i][1] === 'true';
      }
    }

    return false;
  } catch (error) {
    Logger.log('Error getting float state: ' + error);
    return false;
  }
}

/**
 * Sets the grievance float toggle state
 * @param {boolean} enabled - Whether float is enabled
 */
function setGrievanceFloatState(enabled) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let settingsSheet = ss.getSheetByName(SHEETS.USER_SETTINGS);

    if (!settingsSheet) {
      // Create settings sheet if it doesn't exist
      settingsSheet = ss.insertSheet(SHEETS.USER_SETTINGS);
      settingsSheet.getRange('A1:B1').setValues([['Setting', 'Value']])
        .setFontWeight('bold')
        .setBackground('#4A5568')
        .setFontColor('#FFFFFF');
      settingsSheet.hideSheet();
    }

    // Find and update or add setting
    const settingsData = settingsSheet.getDataRange().getValues();
    let found = false;

    for (let i = 0; i < settingsData.length; i++) {
      if (settingsData[i][0] === 'grievanceFloatEnabled') {
        settingsSheet.getRange(i + 1, 2).setValue(enabled);
        found = true;
        break;
      }
    }

    if (!found) {
      const lastRow = settingsSheet.getLastRow();
      settingsSheet.getRange(lastRow + 1, 1, 1, 2).setValues([['grievanceFloatEnabled', enabled]]);
    }
  } catch (error) {
    Logger.log('Error setting float state: ' + error);
  }
}

/**
 * Toggles the grievance float feature on/off
 */
function toggleGrievanceFloat() {
  const ui = SpreadsheetApp.getUi();
  const currentState = getGrievanceFloatState();
  const newState = !currentState;

  const response = ui.alert(
    '🔄 Grievance Float Toggle',
    `Do you want to ${newState ? 'enable' : 'disable'} the Grievance Float feature?\n\n` +
    `When enabled, this will:\n` +
    `• Send closed/settled/inactive grievances to the bottom\n` +
    `• Prioritize Step 3 > Step 2 > Step 1\n` +
    `• Sort by soonest due date within each step`,
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    setGrievanceFloatState(newState);

    if (newState) {
      // Apply float immediately
      applyGrievanceFloat();
      ui.alert(
        '✅ Float Enabled',
        'Grievance float has been enabled and applied.\n\n' +
        'Grievances are now sorted by priority.',
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '✅ Float Disabled',
        'Grievance float has been disabled.\n\n' +
        'To restore original order, you may need to manually re-sort.',
        ui.ButtonSet.OK
      );
    }
  }
}

/**
 * Applies the grievance float sorting
 */
function applyGrievanceFloat() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!grievanceSheet) {
    throw new Error('Grievance Log sheet not found');
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('🔄 Sorting grievances...', 'Please wait', -1);

  const lastRow = grievanceSheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getActiveSpreadsheet().toast('No grievances to sort', '', 2);
    return;
  }

  // Get all data including headers
  const numCols = grievanceSheet.getLastColumn();
  const allData = grievanceSheet.getRange(1, 1, lastRow, numCols).getValues();
  const headers = allData[0];
  const dataRows = allData.slice(1);

  // Sort the data
  const sortedData = sortGrievancesByPriority(dataRows);

  // Write back the sorted data
  grievanceSheet.getRange(2, 1, sortedData.length, numCols).setValues(sortedData);

  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Grievances sorted!', '', 2);
}

/**
 * Sorts grievances by priority
 * Priority order:
 * 1. Active grievances before inactive/closed/settled
 * 2. Step 3 > Step 2 > Step 1
 * 3. Soonest due date within each step
 *
 * @param {Array} dataRows - Array of data rows (without headers)
 * @returns {Array} Sorted array of data rows
 */
function sortGrievancesByPriority(dataRows) {
  return dataRows.sort(function(a, b) {
    const statusA = String(a[GRIEVANCE_COLS.STATUS - 1] || '').toLowerCase();
    const statusB = String(b[GRIEVANCE_COLS.STATUS - 1] || '').toLowerCase();
    const stepA = String(a[GRIEVANCE_COLS.CURRENT_STEP - 1] || '');
    const stepB = String(b[GRIEVANCE_COLS.CURRENT_STEP - 1] || '');
    const dueDateA = a[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1];
    const dueDateB = b[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1];

    // Inactive statuses go to bottom
    const inactiveStatuses = ['closed', 'settled', 'inactive', 'withdrawn', 'denied'];
    const aIsInactive = inactiveStatuses.some(function(status) { return statusA.includes(status); });
    const bIsInactive = inactiveStatuses.some(function(status) { return statusB.includes(status); });

    if (aIsInactive && !bIsInactive) return 1;
    if (!aIsInactive && bIsInactive) return -1;

    // If both are active or both inactive, sort by step (3 > 2 > 1)
    const stepPriorityA = getStepPriority(stepA);
    const stepPriorityB = getStepPriority(stepB);

    if (stepPriorityA !== stepPriorityB) {
      return stepPriorityB - stepPriorityA; // Higher priority first
    }

    // Same step, sort by due date (soonest first)
    if (dueDateA && dueDateB) {
      const dateA = new Date(dueDateA);
      const dateB = new Date(dueDateB);

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB; // Earlier date first
      }
    } else if (dueDateA && !dueDateB) {
      return -1; // Has due date comes before no due date
    } else if (!dueDateA && dueDateB) {
      return 1;
    }

    // If all else equal, maintain current order
    return 0;
  });
}

/**
 * Gets the priority value for a step
 * @param {string} step - Step string (e.g., "Step 1", "Step 2", "Step 3")
 * @returns {number} Priority value (3 = highest, 1 = lowest, 0 = no step)
 */
function getStepPriority(step) {
  const stepStr = String(step).toLowerCase();

  if (stepStr.includes('step iii') || stepStr.includes('step 3')) {
    return 3;
  } else if (stepStr.includes('step ii') || stepStr.includes('step 2')) {
    return 2;
  } else if (stepStr.includes('step i') || stepStr.includes('step 1')) {
    return 1;
  }

  return 0;
}

/**
 * Shows the grievance float control panel
 */
function showGrievanceFloatPanel() {
  const ui = SpreadsheetApp.getUi();
  const isEnabled = getGrievanceFloatState();

  const html = HtmlService.createHtmlOutput(`
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
        .status {
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
          font-weight: bold;
        }
        .status.enabled {
          background: #d1fae5;
          border-left: 4px solid #10b981;
          color: #065f46;
        }
        .status.disabled {
          background: #fee2e2;
          border-left: 4px solid #ef4444;
          color: #991b1b;
        }
        .info-box {
          background: #e8f0fe;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
          border-left: 4px solid #1a73e8;
        }
        .info-box h3 {
          margin-top: 0;
          color: #1557b0;
        }
        .info-box ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .info-box li {
          margin: 8px 0;
          color: #1557b0;
        }
        .button {
          background: #1a73e8;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          margin: 10px 5px;
        }
        .button:hover {
          background: #1557b0;
        }
        .button.secondary {
          background: #6b7280;
        }
        .button.secondary:hover {
          background: #4b5563;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🔄 Grievance Float Control Panel</h2>

        <div class="status ${isEnabled ? 'enabled' : 'disabled'}">
          Status: ${isEnabled ? '✅ ENABLED' : '❌ DISABLED'}
        </div>

        <div class="info-box">
          <h3>How Grievance Float Works:</h3>
          <ul>
            <li><strong>Inactive grievances sink to bottom</strong><br>
              Closed, settled, or inactive grievances automatically move to the bottom of the list</li>
            <li><strong>Priority by step</strong><br>
              Step 3 grievances appear first, then Step 2, then Step 1</li>
            <li><strong>Sorted by due date</strong><br>
              Within each step, grievances with the soonest due dates appear first</li>
          </ul>
        </div>

        <button class="button" onclick="google.script.run.withSuccessHandler(onSuccess).toggleGrievanceFloat()">
          ${isEnabled ? 'Disable' : 'Enable'} Float
        </button>

        ${isEnabled ? '<button class="button secondary" onclick="google.script.run.withSuccessHandler(onSuccess).applyGrievanceFloat()">Re-Apply Sort Now</button>' : ''}

        <button class="button secondary" onclick="google.script.host.close()">Close</button>
      </div>

      <script>
        function onSuccess() {
          google.script.host.close();
        }
      </script>
    </body>
    </html>
  `)
    .setWidth(600)
    .setHeight(500);

  ui.showModalDialog(html, '🔄 Grievance Float Toggle');
}

/**
 * Auto-sorts grievances when status changes to Closed/Settled/Withdrawn
 * This function should be called from an onEdit trigger
 * @param {Object} e - The edit event object
 */
function onEditGrievanceAutoSort(e) {
  try {
    if (!e || !e.range) return;

    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();

    // Only process edits to Grievance Log
    if (sheetName !== SHEETS.GRIEVANCE_LOG) return;

    const editedCol = e.range.getColumn();
    const editedRow = e.range.getRow();

    // Only process status column edits (column E = 5)
    if (editedCol !== GRIEVANCE_COLS.STATUS) return;

    // Skip header row
    if (editedRow < 2) return;

    const newValue = String(e.value || '').toLowerCase();

    // Check if status changed to one that should sink to bottom
    const closedStatuses = ['closed', 'settled', 'withdrawn'];
    const shouldSort = closedStatuses.some(status => newValue.includes(status));

    if (shouldSort) {
      // Small delay to let other onEdit handlers complete
      Utilities.sleep(500);
      applyGrievanceFloat();
    }
  } catch (error) {
    Logger.log('Error in onEditGrievanceAutoSort: ' + error);
  }
}

/**
 * Installs the auto-sort trigger for grievance status changes
 */
function installGrievanceAutoSortTrigger() {
  // Remove existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onEditGrievanceAutoSort') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new onEdit trigger
  ScriptApp.newTrigger('onEditGrievanceAutoSort')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();

  SpreadsheetApp.getActive().toast('✅ Grievance auto-sort trigger installed', 'Success', 3);
}

/**
 * Removes the auto-sort trigger
 */
function removeGrievanceAutoSortTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onEditGrievanceAutoSort') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  if (removed > 0) {
    SpreadsheetApp.getActive().toast(`✅ Removed ${removed} auto-sort trigger(s)`, 'Success', 3);
  } else {
    SpreadsheetApp.getActive().toast('No auto-sort triggers found', 'Info', 3);
  }
}
