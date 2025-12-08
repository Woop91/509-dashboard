/**
 * ------------------------------------------------------------------------====
 * WORKFLOW STATE MACHINE
 * ------------------------------------------------------------------------====
 *
 * Structured grievance workflow with defined states and transitions
 * Features:
 * - Predefined workflow states
 * - Valid state transitions
 * - Automatic deadline calculations per state
 * - Required fields per state
 * - State change validation
 * - Workflow visualization
 * - Audit trail of state changes
 */

/**
 * Workflow state definitions
 */
WORKFLOW_STATES = {
  FILED: {
    name: 'Filed',
    description: 'Grievance has been filed and is awaiting initial review',
    color: '#ffa500',
    deadlineDays: 3,
    requiredFields: ['grievanceId', 'memberId', 'issueType', 'filedDate'],
    allowedNextStates: ['STEP1_PENDING', 'WITHDRAWN'],
    actions: ['Assign Steward', 'Review Details', 'Gather Evidence']
  },
  STEP1_PENDING: {
    name: 'Step 1 Pending',
    description: 'Awaiting Step 1 meeting with supervisor',
    color: '#ffeb3b',
    deadlineDays: 21,
    requiredFields: ['assignedSteward', 'supervisor'],
    allowedNextStates: ['STEP1_MEETING', 'WITHDRAWN'],
    actions: ['Schedule Meeting', 'Prepare Documents', 'Notify Member']
  },
  STEP1_MEETING: {
    name: 'Step 1 Meeting',
    description: 'Step 1 meeting in progress or completed',
    color: '#2196f3',
    deadlineDays: 7,
    requiredFields: ['meetingDate'],
    allowedNextStates: ['RESOLVED', 'STEP2_PENDING', 'WITHDRAWN'],
    actions: ['Conduct Meeting', 'Document Outcome', 'Update Member']
  },
  STEP2_PENDING: {
    name: 'Step 2 Pending',
    description: 'Escalated to Step 2, awaiting higher-level review',
    color: '#ff9800',
    deadlineDays: 14,
    requiredFields: ['escalationReason', 'manager'],
    allowedNextStates: ['STEP2_MEETING', 'WITHDRAWN'],
    actions: ['Prepare Case File', 'Schedule Step 2', 'Notify Union Rep']
  },
  STEP2_MEETING: {
    name: 'Step 2 Meeting',
    description: 'Step 2 meeting in progress or completed',
    color: '#9c27b0',
    deadlineDays: 7,
    requiredFields: ['step2MeetingDate'],
    allowedNextStates: ['RESOLVED', 'ARBITRATION_PENDING', 'WITHDRAWN'],
    actions: ['Conduct Meeting', 'Document Outcome', 'Consider Arbitration']
  },
  ARBITRATION_PENDING: {
    name: 'Arbitration Pending',
    description: 'Case sent to arbitration',
    color: '#f44336',
    deadlineDays: 60,
    requiredFields: ['arbitrationFiled'],
    allowedNextStates: ['ARBITRATION_HEARING', 'WITHDRAWN'],
    actions: ['Select Arbitrator', 'Prepare Case', 'Gather All Evidence']
  },
  ARBITRATION_HEARING: {
    name: 'Arbitration Hearing',
    description: 'Arbitration hearing scheduled or in progress',
    color: '#d32f2f',
    deadlineDays: 30,
    requiredFields: ['hearingDate', 'arbitrator'],
    allowedNextStates: ['RESOLVED', 'WITHDRAWN'],
    actions: ['Attend Hearing', 'Present Case', 'Await Decision']
  },
  RESOLVED: {
    name: 'Resolved',
    description: 'Grievance has been resolved',
    color: '#4caf50',
    deadlineDays: null,
    requiredFields: ['resolutionDetails', 'dateClosed'],
    allowedNextStates: ['REOPENED'],
    actions: ['Document Resolution', 'Notify Member', 'Close Case']
  },
  WITHDRAWN: {
    name: 'Withdrawn',
    description: 'Grievance withdrawn by member',
    color: '#9e9e9e',
    deadlineDays: null,
    requiredFields: ['withdrawalReason', 'dateClosed'],
    allowedNextStates: [],
    actions: ['Document Withdrawal', 'Notify Parties', 'Archive']
  },
  REOPENED: {
    name: 'Reopened',
    description: 'Previously closed case reopened',
    color: '#ff5722',
    deadlineDays: 7,
    requiredFields: ['reopenReason'],
    allowedNextStates: ['STEP1_PENDING', 'STEP2_PENDING', 'RESOLVED', 'WITHDRAWN'],
    actions: ['Review Original Case', 'Assess New Information', 'Determine Next Step']
  }
};

/**
 * Shows workflow state machine visualizer
 */
function showWorkflowVisualizer() {
  const html = createWorkflowVisualizerHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(900)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '🔄 Grievance Workflow Visualizer');
}

/**
 * Creates HTML for workflow visualizer
 */
function createWorkflowVisualizerHTML() {
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
    }
    h2 {
      color: #1a73e8;
      margin-top: 0;
      border-bottom: 3px solid #1a73e8;
      padding-bottom: 10px;
    }
    .workflow-diagram {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin: 20px 0;
    }
    .workflow-stage {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 5px solid;
      cursor: pointer;
      transition: all 0.2s;
    }
    .workflow-stage:hover {
      transform: translateX(5px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .stage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .stage-name {
      font-weight: bold;
      font-size: 16px;
      color: #333;
    }
    .stage-deadline {
      background: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .stage-desc {
      color: #666;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .stage-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .action-tag {
      background: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      color: #555;
      border: 1px solid #ddd;
    }
    .next-states {
      margin-top: 10px;
      font-size: 13px;
      color: #666;
    }
    .arrow {
      text-align: center;
      color: #999;
      font-size: 20px;
      margin: 5px 0;
    }
    .legend {
      background: #e8f0fe;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      border-left: 4px solid #1a73e8;
    }
    .legend h3 {
      margin-top: 0;
      color: #1a73e8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔄 Grievance Workflow</h2>

    <div class="legend">
      <h3>Workflow Overview</h3>
      <p>The grievance process follows a structured workflow with defined states and transitions.
      Each state has specific deadlines, required fields, and allowed next states.</p>
    </div>

    <div class="workflow-diagram">
      ${Object.entries(WORKFLOW_STATES).map(([key, state]) => `
        <div class="workflow-stage" style="border-left-color: ${state.color}">
          <div class="stage-header">
            <div class="stage-name">${state.name}</div>
            ${state.deadlineDays
              ? `<div class="stage-deadline">${state.deadlineDays} days</div>`
              : '<div class="stage-deadline">Final State</div>'}
          </div>
          <div class="stage-desc">${state.description}</div>
          <div class="stage-actions">
            ${state.actions.map(function(action) { return `<span class="action-tag">✓ ${action}</span>`; }).join('')}
          </div>
          ${state.allowedNextStates.length > 0
            ? `<div class="next-states">
                <strong>Can transition to:</strong> ${state.allowedNextStates.map(function(s) { return WORKFLOW_STATES[s].name; }).join(', ')}
              </div>`
            : ''}
        </div>
        ${state.allowedNextStates.length > 0 ? '<div class="arrow">↓</div>' : ''}
      `).join('')}
    </div>

    <div class="legend">
      <h3>📋 Required Fields by State</h3>
      <ul>
        ${Object.entries(WORKFLOW_STATES).map(([key, state]) => `
          <li><strong>${state.name}:</strong> ${state.requiredFields.join(', ')}</li>
        `).join('')}
      </ul>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Validates state transition
 * @param {string} currentState - Current workflow state
 * @param {string} newState - Proposed new state
 * @returns {Object} Validation result
 */
function validateStateTransition(currentState, newState) {
  const current = WORKFLOW_STATES[currentState];
  const next = WORKFLOW_STATES[newState];

  if (!current) {
    return {
      valid: false,
      error: `Invalid current state: ${currentState}`
    };
  }

  if (!next) {
    return {
      valid: false,
      error: `Invalid new state: ${newState}`
    };
  }

  if (!current.allowedNextStates.includes(newState)) {
    return {
      valid: false,
      error: `Cannot transition from ${current.name} to ${next.name}. Allowed transitions: ${current.allowedNextStates.map(function(s) { return WORKFLOW_STATES[s].name; }).join(', ')}`
    };
  }

  return {
    valid: true,
    message: `Valid transition from ${current.name} to ${next.name}`
  };
}

/**
 * Changes grievance workflow state with validation
 */
function changeWorkflowState() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();

  if (activeSheet.getName() !== SHEETS.GRIEVANCE_LOG) {
    ui.alert(
      '⚠️ Wrong Sheet',
      'Please select a grievance row in the Grievance Log sheet.',
      ui.ButtonSet.OK
    );
    return;
  }

  const activeRow = activeSheet.getActiveCell().getRow();

  if (activeRow < 2) {
    ui.alert(
      '⚠️ Invalid Selection',
      'Please select a grievance row (not the header).',
      ui.ButtonSet.OK
    );
    return;
  }

  const grievanceId = activeSheet.getRange(activeRow, GRIEVANCE_COLS.GRIEVANCE_ID).getValue();
  const currentStatus = activeSheet.getRange(activeRow, GRIEVANCE_COLS.STATUS).getValue();

  if (!grievanceId) {
    ui.alert('⚠️ No Grievance ID found.');
    return;
  }

  // Map current status to workflow state
  const currentState = mapStatusToState(currentStatus);

  if (!currentState) {
    ui.alert(
      '⚠️ Unknown Status',
      `Current status "${currentStatus}" is not mapped to a workflow state.`,
      ui.ButtonSet.OK
    );
    return;
  }

  const allowedStates = WORKFLOW_STATES[currentState].allowedNextStates;

  if (allowedStates.length === 0) {
    ui.alert(
      'ℹ️ Final State',
      `Grievance is in "${WORKFLOW_STATES[currentState].name}" state, which is a final state.`,
      ui.ButtonSet.OK
    );
    return;
  }

  const stateOptions = allowedStates
    .map(function(s) { return WORKFLOW_STATES[s].name; })
    .join('\n');

  const response = ui.prompt(
    '🔄 Change Workflow State',
    `Current State: ${WORKFLOW_STATES[currentState].name}\n\n` +
    `Allowed next states:\n${stateOptions}\n\n` +
    'Enter new state:',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const newStateName = response.getResponseText().trim();
  const newStateKey = Object.keys(WORKFLOW_STATES).find(
    function(key) { return WORKFLOW_STATES[key].name === newStateName; }
  );

  if (!newStateKey) {
    ui.alert('⚠️ Invalid state name.');
    return;
  }

  const validation = validateStateTransition(currentState, newStateKey);

  if (!validation.valid) {
    ui.alert('❌ Invalid Transition', validation.error, ui.ButtonSet.OK);
    return;
  }

  // Update status
  const newState = WORKFLOW_STATES[newStateKey];
  activeSheet.getRange(activeRow, GRIEVANCE_COLS.STATUS).setValue(newState.name);

  // Calculate new deadline if applicable
  if (newState.deadlineDays) {
    const newDeadline = new Date();
    newDeadline.setDate(newDeadline.getDate() + newState.deadlineDays);
    activeSheet.getRange(activeRow, GRIEVANCE_COLS.NEXT_ACTION_DUE).setValue(newDeadline);
  }

  // Log state change
  logStateChange(grievanceId, currentState, newStateKey);

  ui.alert(
    '✅ State Changed',
    `Workflow state updated to: ${newState.name}\n\n` +
    (newState.deadlineDays ? `New deadline: ${newState.deadlineDays} days from now\n\n` : '') +
    `Required actions:\n${newState.actions.join('\n')}`,
    ui.ButtonSet.OK
  );
}

/**
 * Maps status string to workflow state key
 * @param {string} status - Status string
 * @returns {string} Workflow state key
 */
function mapStatusToState(status) {
  const mapping = {
    'Filed': 'FILED',
    'Step 1 Pending': 'STEP1_PENDING',
    'Step 1 Meeting': 'STEP1_MEETING',
    'Step 2 Pending': 'STEP2_PENDING',
    'Step 2 Meeting': 'STEP2_MEETING',
    'Arbitration Pending': 'ARBITRATION_PENDING',
    'Arbitration Hearing': 'ARBITRATION_HEARING',
    'Resolved': 'RESOLVED',
    'Withdrawn': 'WITHDRAWN',
    'Reopened': 'REOPENED',
    'Open': 'FILED',
    'In Progress': 'STEP1_PENDING',
    'Closed': 'RESOLVED'
  };

  return mapping[status] || null;
}

/**
 * Logs workflow state change
 * @param {string} grievanceId - Grievance ID
 * @param {string} fromState - Previous state
 * @param {string} toState - New state
 */
function logStateChange(grievanceId, fromState, toState) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let stateLog = ss.getSheetByName('🔄 State Change Log');

  if (!stateLog) {
    stateLog = createStateChangeLogSheet();
  }

  const timestamp = new Date();
  const user = Session.getActiveUser().getEmail() || 'System';
  const fromStateName = WORKFLOW_STATES[fromState].name;
  const toStateName = WORKFLOW_STATES[toState].name;

  const lastRow = stateLog.getLastRow();
  const newRow = [
    timestamp,
    grievanceId,
    fromStateName,
    toStateName,
    user
  ];

  stateLog.getRange(lastRow + 1, 1, 1, 5).setValues([newRow]);
}

/**
 * Creates State Change Log sheet
 * @returns {Sheet} State change log sheet
 */
function createStateChangeLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.insertSheet('🔄 State Change Log');

  // Set headers
  const headers = [
    'Timestamp',
    'Grievance ID',
    'From State',
    'To State',
    'Changed By'
  ];

  sheet.getRange(1, 1, 1, 5).setValues([headers]);

  // Format header
  sheet.getRange(1, 1, 1, 5)
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Set column widths
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 120); // Grievance ID
  sheet.setColumnWidth(3, 150); // From State
  sheet.setColumnWidth(4, 150); // To State
  sheet.setColumnWidth(5, 200); // Changed By

  // Freeze header
  sheet.setFrozenRows(1);

  // Delete unused columns beyond the defined headers (5 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > 5) {
    sheet.deleteColumns(6, totalCols - 5);
  }

  return sheet;
}

/**
 * Shows workflow state for selected grievance
 */
function showCurrentWorkflowState() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();

  if (activeSheet.getName() !== SHEETS.GRIEVANCE_LOG) {
    ui.alert(
      '⚠️ Wrong Sheet',
      'Please select a grievance row in the Grievance Log sheet.',
      ui.ButtonSet.OK
    );
    return;
  }

  const activeRow = activeSheet.getActiveCell().getRow();

  if (activeRow < 2) {
    ui.alert('⚠️ Invalid Selection');
    return;
  }

  const grievanceId = activeSheet.getRange(activeRow, GRIEVANCE_COLS.GRIEVANCE_ID).getValue();
  const currentStatus = activeSheet.getRange(activeRow, GRIEVANCE_COLS.STATUS).getValue();
  const currentState = mapStatusToState(currentStatus);

  if (!currentState) {
    ui.alert('⚠️ Unknown workflow state.');
    return;
  }

  const state = WORKFLOW_STATES[currentState];
  const allowedTransitions = state.allowedNextStates
    .map(function(s) { return WORKFLOW_STATES[s].name; })
    .join('\n• ');

  const message = `
Grievance: ${grievanceId}
Current State: ${state.name}

${state.description}

Deadline: ${state.deadlineDays ? state.deadlineDays + ' days' : 'None (final state)'}

Required Actions:
• ${state.actions.join('\n• ')}

Allowed Transitions:
${allowedTransitions ? '• ' + allowedTransitions : 'None (final state)'}
  `;

  ui.alert('🔄 Workflow State', message, ui.ButtonSet.OK);
}

/**
 * Bulk updates workflow states for selected grievances
 */
function batchUpdateWorkflowState() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();

  if (activeSheet.getName() !== SHEETS.GRIEVANCE_LOG) {
    ui.alert('⚠️ Wrong Sheet');
    return;
  }

  const selection = activeSheet.getActiveRange();
  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  if (startRow === 1 || numRows === 0) {
    ui.alert('⚠️ Please select grievance rows (not the header).');
    return;
  }

  const rows = Array.from({ length: numRows }, function(_, i) { return startRow + i; });

  const response = ui.prompt(
    '🔄 Batch Update Workflow State',
    `Selected ${rows.length} grievance(s).\n\n` +
    'Enter new state (e.g., "Step 1 Pending"):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  const newStateName = response.getResponseText().trim();
  const newStateKey = Object.keys(WORKFLOW_STATES).find(
    function(key) { return WORKFLOW_STATES[key].name === newStateName; }
  );

  if (!newStateKey) {
    ui.alert('⚠️ Invalid state name.');
    return;
  }

  const confirmResponse = ui.alert(
    '⚠️ Confirm Batch Update',
    `This will change ${rows.length} grievance(s) to "${newStateName}".\n\nContinue?`,
    ui.ButtonSet.YES_NO
  );

  if (confirmResponse !== ui.Button.YES) {
    return;
  }

  const newState = WORKFLOW_STATES[newStateKey];
  let updated = 0;
  let errors = 0;

  rows.forEach(function(row) {
    const grievanceId = activeSheet.getRange(row, GRIEVANCE_COLS.GRIEVANCE_ID).getValue();
    const currentStatus = activeSheet.getRange(row, GRIEVANCE_COLS.STATUS).getValue();
    const currentState = mapStatusToState(currentStatus);

    if (!currentState) {
      errors++;
      return;
    }

    const validation = validateStateTransition(currentState, newStateKey);

    if (!validation.valid) {
      errors++;
      Logger.log(`Error updating ${grievanceId}: ${validation.error}`);
      return;
    }

    // Update status
    activeSheet.getRange(row, GRIEVANCE_COLS.STATUS).setValue(newState.name);

    // Calculate new deadline if applicable
    if (newState.deadlineDays) {
      const newDeadline = new Date();
      newDeadline.setDate(newDeadline.getDate() + newState.deadlineDays);
      activeSheet.getRange(row, GRIEVANCE_COLS.NEXT_ACTION_DUE).setValue(newDeadline);
    }

    // Log state change
    logStateChange(grievanceId, currentState, newStateKey);

    updated++;
  });

  ui.alert(
    '✅ Batch Update Complete',
    `Successfully updated: ${updated}\nErrors (invalid transitions): ${errors}`,
    ui.ButtonSet.OK
  );
}
