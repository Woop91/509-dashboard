/**
 * ------------------------------------------------------------------------====
 * SMART AUTO-ASSIGNMENT SYSTEM
 * ------------------------------------------------------------------------====
 *
 * Intelligently assigns stewards to grievances based on multiple factors
 * Features:
 * - Workload balancing (assign to least busy steward)
 * - Location matching (same worksite/unit)
 * - Expertise matching (issue type experience)
 * - Availability checking
 * - Manual override capability
 * - Assignment history tracking
 * - Performance metrics
 */

/**
 * Assignment algorithm weights
 */
ASSIGNMENT_WEIGHTS = {
  WORKLOAD: 0.4,        // 40% - Balance caseload
  LOCATION: 0.3,        // 30% - Same location preference
  EXPERTISE: 0.2,       // 20% - Issue type experience
  AVAILABILITY: 0.1     // 10% - Current availability
};

/**
 * Auto-assigns a steward to a grievance
 * @param {string} grievanceId - Grievance ID
 * @param {Object} preferences - Assignment preferences
 * @returns {Object} Assignment result
 */
function autoAssignSteward(grievanceId, preferences = {}) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  // Get grievance details
  const grievance = getGrievanceDetails(grievanceId);

  if (!grievance) {
    return {
      success: false,
      error: `Grievance ${grievanceId} not found`
    };
  }

  // Get all available stewards
  const stewards = getAllStewards();

  if (stewards.length === 0) {
    return {
      success: false,
      error: 'No stewards available in the system'
    };
  }

  // Score each steward
  const scoredStewards = stewards.map(function(steward) { return {
    ...steward,
    score: calculateAssignmentScore(steward, grievance, preferences)
  };});

  // Sort by score (descending)
  scoredStewards.sort(function(a, b) { return b.score - a.score; });

  // Get top candidate
  const selectedSteward = scoredStewards[0];

  // Assign steward
  const assignmentResult = assignStewardToGrievance(grievanceId, selectedSteward);

  // Log assignment
  logAssignment(grievanceId, selectedSteward, scoredStewards.slice(0, 3));

  return {
    success: true,
    assignedSteward: selectedSteward.name,
    score: selectedSteward.score,
    reasoning: generateAssignmentReasoning(selectedSteward, grievance),
    alternates: scoredStewards.slice(1, 4).map(function(s) { return {
      name: s.name,
      score: s.score
    };})
  };
}

/**
 * Gets grievance details
 * @param {string} grievanceId - Grievance ID
 * @returns {Object} Grievance details
 */
function getGrievanceDetails(grievanceId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const lastRow = grievanceSheet.getLastRow();

  if (lastRow < 2) return null;

  const data = grievanceSheet.getRange(2, 1, lastRow - 1, grievanceSheet.getLastColumn()).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][GRIEVANCE_COLS.GRIEVANCE_ID - 1] === grievanceId) {
      return {
        id: data[i][GRIEVANCE_COLS.GRIEVANCE_ID - 1],
        memberId: data[i][GRIEVANCE_COLS.MEMBER_ID - 1],
        memberName: `${data[i][GRIEVANCE_COLS.FIRST_NAME - 1]} ${data[i][GRIEVANCE_COLS.LAST_NAME - 1]}`,
        issueType: data[i][GRIEVANCE_COLS.ISSUE_CATEGORY - 1],
        location: data[i][GRIEVANCE_COLS.LOCATION - 1] || '',
        unit: data[i][GRIEVANCE_COLS.UNIT - 1] || '',
        row: i + 2
      };
    }
  }

  return null;
}

/**
 * Gets all stewards from Member Directory
 * @returns {Array} Array of steward objects
 */
function getAllStewards() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const lastRow = memberSheet.getLastRow();

  if (lastRow < 2) return [];

  const data = memberSheet.getRange(2, 1, lastRow - 1, memberSheet.getLastColumn()).getValues();

  const stewards = [];

  data.forEach(function(row, index) {
    const isSteward = row[MEMBER_COLS.IS_STEWARD - 1];

    if (isSteward === 'Yes') {
      stewards.push({
        id: row[MEMBER_COLS.MEMBER_ID - 1],
        name: `${row[MEMBER_COLS.FIRST_NAME - 1]} ${row[MEMBER_COLS.LAST_NAME - 1]}`,
        email: row[MEMBER_COLS.EMAIL - 1],
        location: row[MEMBER_COLS.WORK_LOCATION - 1] || '',
        unit: row[MEMBER_COLS.UNIT - 1] || '',
        row: index + 2,
        currentCaseload: getCurrentCaseload(row[MEMBER_COLS.MEMBER_ID - 1]),
        expertise: getStewardExpertise(row[MEMBER_COLS.MEMBER_ID - 1])
      });
    }
  });

  return stewards;
}

/**
 * Gets current caseload for a steward
 * @param {string} memberId - Member ID
 * @returns {number} Number of open grievances
 */
function getCurrentCaseload(memberId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const lastRow = grievanceSheet.getLastRow();

  if (lastRow < 2) return 0;

  const data = grievanceSheet.getRange(2, 1, lastRow - 1, grievanceSheet.getLastColumn()).getValues();

  let count = 0;

  data.forEach(function(row) {
    const assignedSteward = row[GRIEVANCE_COLS.STEWARD - 1];
    const status = row[GRIEVANCE_COLS.STATUS - 1];

    if (assignedSteward && assignedSteward.includes(memberId) && status === 'Open') {
      count++;
    }
  });

  return count;
}

/**
 * Gets steward's expertise (issue types they've handled)
 * @param {string} memberId - Member ID
 * @returns {Object} Issue type counts
 */
function getStewardExpertise(memberId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const lastRow = grievanceSheet.getLastRow();

  if (lastRow < 2) return {};

  const data = grievanceSheet.getRange(2, 1, lastRow - 1, grievanceSheet.getLastColumn()).getValues();

  const expertise = {};

  data.forEach(function(row) {
    const assignedSteward = row[GRIEVANCE_COLS.STEWARD - 1];
    const issueType = row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1];

    if (assignedSteward && assignedSteward.includes(memberId) && issueType) {
      expertise[issueType] = (expertise[issueType] || 0) + 1;
    }
  });

  return expertise;
}

/**
 * Calculates assignment score for a steward
 * @param {Object} steward - Steward details
 * @param {Object} grievance - Grievance details
 * @param {Object} preferences - Assignment preferences
 * @returns {number} Score (0-100)
 */
function calculateAssignmentScore(steward, grievance, preferences) {
  const weights = { ...ASSIGNMENT_WEIGHTS, ...preferences };

  // Workload score (inverse - lower caseload = higher score)
  const maxCaseload = 20; // Assume max reasonable caseload
  const workloadScore = Math.max(0, (maxCaseload - steward.currentCaseload) / maxCaseload) * 100;

  // Location score
  const locationScore = steward.location === grievance.location ? 100 : 0;

  // Expertise score
  const expertiseCount = steward.expertise[grievance.issueType] || 0;
  const maxExpertise = Math.max(...Object.values(steward.expertise), 1);
  const expertiseScore = (expertiseCount / maxExpertise) * 100;

  // Availability score (for now, always 100 - can be enhanced)
  const availabilityScore = 100;

  // Calculate weighted average
  const finalScore =
    (workloadScore * weights.WORKLOAD) +
    (locationScore * weights.LOCATION) +
    (expertiseScore * weights.EXPERTISE) +
    (availabilityScore * weights.AVAILABILITY);

  return Math.round(finalScore);
}

/**
 * Assigns steward to grievance
 * @param {string} grievanceId - Grievance ID
 * @param {Object} steward - Steward object
 * @returns {boolean} Success
 */
function assignStewardToGrievance(grievanceId, steward) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  const grievance = getGrievanceDetails(grievanceId);

  if (!grievance) return false;

  // Update assigned steward
  grievanceSheet.getRange(grievance.row, GRIEVANCE_COLS.STEWARD).setValue(steward.name);

  // Update steward email if available
  if (steward.email) {
    grievanceSheet.getRange(grievance.row, GRIEVANCE_COLS.STEWARD + 1).setValue(steward.email);
  }

  return true;
}

/**
 * Generates reasoning for assignment
 * @param {Object} steward - Selected steward
 * @param {Object} grievance - Grievance details
 * @returns {string} Reasoning text
 */
function generateAssignmentReasoning(steward, grievance) {
  const reasons = [];

  if (steward.location === grievance.location) {
    reasons.push(`Same location (${steward.location})`);
  }

  const expertiseCount = steward.expertise[grievance.issueType] || 0;
  if (expertiseCount > 0) {
    reasons.push(`Has handled ${expertiseCount} similar ${grievance.issueType} case(s)`);
  }

  reasons.push(`Current caseload: ${steward.currentCaseload} case(s)`);

  if (steward.currentCaseload < 5) {
    reasons.push('Low caseload - has capacity');
  } else if (steward.currentCaseload < 10) {
    reasons.push('Moderate caseload');
  } else {
    reasons.push('High caseload - may need support');
  }

  return reasons.join('\n• ');
}

/**
 * Logs assignment for tracking
 * @param {string} grievanceId - Grievance ID
 * @param {Object} selectedSteward - Selected steward
 * @param {Array} topCandidates - Top 3 candidates
 */
function logAssignment(grievanceId, selectedSteward, topCandidates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let assignmentLog = ss.getSheetByName('🤖 Auto-Assignment Log');

  if (!assignmentLog) {
    assignmentLog = createAutoAssignmentLogSheet();
  }

  const timestamp = new Date();
  const user = Session.getActiveUser().getEmail() || 'System';

  const lastRow = assignmentLog.getLastRow();
  const newRow = [
    timestamp,
    grievanceId,
    selectedSteward.name,
    selectedSteward.score,
    selectedSteward.currentCaseload,
    topCandidates.map(function(s) { return `${s.name} (${s.score})`; }).join(', '),
    user
  ];

  assignmentLog.getRange(lastRow + 1, 1, 1, 7).setValues([newRow]);
}

/**
 * Creates Auto-Assignment Log sheet
 * @returns {Sheet} Assignment log sheet
 */
function createAutoAssignmentLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.insertSheet('🤖 Auto-Assignment Log');

  // Set headers
  const headers = [
    'Timestamp',
    'Grievance ID',
    'Assigned Steward',
    'Score',
    'Caseload',
    'Top Candidates',
    'Assigned By'
  ];

  sheet.getRange(1, 1, 1, 7).setValues([headers]);

  // Format header
  sheet.getRange(1, 1, 1, 7)
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Set column widths
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 120); // Grievance ID
  sheet.setColumnWidth(3, 150); // Assigned Steward
  sheet.setColumnWidth(4, 80);  // Score
  sheet.setColumnWidth(5, 80);  // Caseload
  sheet.setColumnWidth(6, 300); // Top Candidates
  sheet.setColumnWidth(7, 200); // Assigned By

  // Freeze header
  sheet.setFrozenRows(1);

  // Delete unused columns beyond the headers array length
  const totalCols = sheet.getMaxColumns();
  if (totalCols > headers.length) {
    sheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }

  return sheet;
}

/**
 * Shows auto-assignment dialog for a grievance
 */
function showAutoAssignDialog() {
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

  if (!grievanceId) {
    ui.alert('⚠️ No Grievance ID found.');
    return;
  }

  // Check if already assigned
  const currentAssignment = activeSheet.getRange(activeRow, GRIEVANCE_COLS.STEWARD).getValue();

  if (currentAssignment) {
    const confirmResponse = ui.alert(
      '⚠️ Already Assigned',
      `This grievance is already assigned to: ${currentAssignment}\n\nReassign automatically?`,
      ui.ButtonSet.YES_NO
    );

    if (confirmResponse !== ui.Button.YES) {
      return;
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('🤖 Analyzing stewards...', 'Please wait', -1);

  try {
    const result = autoAssignSteward(grievanceId);

    if (!result.success) {
      ui.alert('❌ Assignment Failed', result.error, ui.ButtonSet.OK);
      return;
    }

    const alternatesText = result.alternates
      .map(function(a) { return `  ${a.name} (score: ${a.score})`; })
      .join('\n');

    ui.alert(
      '✅ Auto-Assignment Complete',
      `Assigned to: ${result.assignedSteward}\n` +
      `Assignment Score: ${result.score}/100\n\n` +
      `Reasoning:\n• ${result.reasoning}\n\n` +
      `Alternative Candidates:\n${alternatesText}`,
      ui.ButtonSet.OK
    );

  } catch (error) {
    ui.alert('❌ Error', error.message, ui.ButtonSet.OK);
  }
}

/**
 * Batch auto-assigns stewards to selected grievances
 */
function batchAutoAssign() {
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
    ui.alert('⚠️ Please select grievance rows.');
    return;
  }

  const rows = Array.from({ length: numRows }, function(_, i) { return startRow + i; });

  // Count unassigned
  let unassigned = 0;
  rows.forEach(function(row) {
    const assigned = activeSheet.getRange(row, GRIEVANCE_COLS.STEWARD).getValue();
    if (!assigned) {
      unassigned++;
    }
  });

  const confirmResponse = ui.alert(
    '🤖 Batch Auto-Assignment',
    `Selected: ${rows.length} grievance(s)\n` +
    `Unassigned: ${unassigned}\n\n` +
    'Auto-assign stewards to all selected grievances?',
    ui.ButtonSet.YES_NO
  );

  if (confirmResponse !== ui.Button.YES) {
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('🤖 Auto-assigning...', 'Please wait', -1);

  let assigned = 0;
  let skipped = 0;
  let errors = 0;

  rows.forEach(function(row) {
    const grievanceId = activeSheet.getRange(row, GRIEVANCE_COLS.GRIEVANCE_ID).getValue();
    const currentAssignment = activeSheet.getRange(row, GRIEVANCE_COLS.STEWARD).getValue();

    if (!grievanceId) {
      skipped++;
      return;
    }

    if (currentAssignment) {
      skipped++;
      return;
    }

    try {
      const result = autoAssignSteward(grievanceId);

      if (result.success) {
        assigned++;
      } else {
        errors++;
        Logger.log(`Error assigning ${grievanceId}: ${result.error}`);
      }

    } catch (error) {
      errors++;
      Logger.log(`Error assigning ${grievanceId}: ${error.message}`);
    }
  });

  ui.alert(
    '✅ Batch Auto-Assignment Complete',
    `Successfully assigned: ${assigned}\n` +
    `Skipped (already assigned): ${skipped}\n` +
    `Errors: ${errors}`,
    ui.ButtonSet.OK
  );
}

/**
 * Shows steward workload dashboard
 */
function showStewardWorkloadDashboard() {
  const stewards = getAllStewards();

  if (stewards.length === 0) {
    SpreadsheetApp.getUi().alert('No stewards found in the system.');
    return;
  }

  // Sort by caseload (descending)
  stewards.sort(function(a, b) { return b.currentCaseload - a.currentCaseload; });

  const stewardsList = stewards
    .map(function(s) { return `
      <div class="steward-item" style="border-left-color: ${getCaseloadColor(s.currentCaseload)}">
        <div class="steward-name">${s.name}</div>
        <div class="steward-details">
          <strong>Caseload:</strong> ${s.currentCaseload} open case(s) |
          <strong>Location:</strong> ${s.location || 'N/A'} |
          <strong>Unit:</strong> ${s.unit || 'N/A'}
        </div>
        <div class="steward-expertise">
          <strong>Expertise:</strong> ${Object.keys(s.expertise).length > 0
            ? Object.entries(s.expertise)
                .sort(function(a, b) { return b[1] - a[1]; })
                .slice(0, 3)
                .map(function([type, count]) { return `${type} (${count})`; })
                .join(', ')
            : 'No cases yet'}
        </div>
      </div>
    `; })
    .join('');

  const avgCaseload = stewards.reduce(function(sum, s) { return sum + s.currentCaseload; }, 0) / stewards.length;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #1a73e8; margin-top: 0; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    .summary { background: #e8f0fe; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #1a73e8; }
    .steward-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 5px solid; }
    .steward-name { font-weight: bold; font-size: 16px; color: #333; margin-bottom: 5px; }
    .steward-details { font-size: 13px; color: #666; margin: 5px 0; }
    .steward-expertise { font-size: 12px; color: #888; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>👥 Steward Workload Dashboard</h2>

    <div class="summary">
      <strong>Total Stewards:</strong> ${stewards.length}<br>
      <strong>Average Caseload:</strong> ${avgCaseload.toFixed(1)} cases/steward<br>
      <strong>Total Open Cases:</strong> ${stewards.reduce(function(sum, s) { return sum + s.currentCaseload; }, 0)}
    </div>

    <div style="max-height: 500px; overflow-y: auto;">
      ${stewardsList}
    </div>
  </div>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(750)
    .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '👥 Steward Workload Dashboard');
}

/**
 * Gets color for caseload visualization
 * @param {number} caseload - Number of cases
 * @returns {string} Color code
 */
function getCaseloadColor(caseload) {
  if (caseload === 0) return '#9e9e9e';
  if (caseload < 5) return '#4caf50';
  if (caseload < 10) return '#ffeb3b';
  if (caseload < 15) return '#ff9800';
  return '#f44336';
}
