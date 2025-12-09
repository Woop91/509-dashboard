/**
 * ------------------------------------------------------------------------====
 * AUTOMATED REPORT GENERATION
 * ------------------------------------------------------------------------====
 *
 * Schedule automated reports with email distribution
 * Features:
 * - Monthly executive summaries
 * - Quarterly trend reports
 * - Custom report scheduling
 * - PDF export and email distribution
 * - Configurable recipients
 */

/**
 * Sets up monthly report trigger (1st of each month at 9 AM)
 */
function setupMonthlyReports() {
  // Delete existing monthly triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'generateMonthlyReport') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new monthly trigger
  ScriptApp.newTrigger('generateMonthlyReport')
    .timeBased()
    .onMonthDay(1)
    .atHour(9)
    .create();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Monthly reports enabled (1st of month, 9 AM)',
    'Automation Active',
    5
  );
}

/**
 * Sets up quarterly report trigger
 */
function setupQuarterlyReports() {
  // Delete existing quarterly triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'generateQuarterlyReport') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create triggers for 1st day of Jan, Apr, Jul, Oct
  [1, 4, 7, 10].forEach(function(month) {
    ScriptApp.newTrigger('generateQuarterlyReport')
      .timeBased()
      .onMonthDay(1)
      .atHour(10)
      .inTimezone(Session.getScriptTimeZone())
      .create();
  });

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Quarterly reports enabled (Jan/Apr/Jul/Oct, 10 AM)',
    'Automation Active',
    5
  );
}

/**
 * Disables automated reports
 */
function disableAutomatedReports() {
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;

  triggers.forEach(function(trigger) {
    const func = trigger.getHandlerFunction();
    if (func === 'generateMonthlyReport' || func === 'generateQuarterlyReport') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `🔕 Removed ${removed} report automation trigger(s)`,
    'Automation Disabled',
    5
  );
}

/**
 * Generates monthly executive summary report
 */
function generateMonthlyReport() {
  try {
    const reportData = gatherMonthlyData();
    const doc = createMonthlyReportDoc(reportData);
    const pdf = convertToPDF(doc);

    // Email to leadership
    emailReport(pdf, 'Monthly Executive Summary', getReportRecipients('monthly'));

    Logger.log('Monthly report generated and emailed successfully');

  } catch (error) {
    Logger.log('Error generating monthly report: ' + error.message);
    notifyAdminOfError('Monthly Report Generation Failed', error.message);
  }
}

/**
 * Generates quarterly trend analysis report
 */
function generateQuarterlyReport() {
  try {
    const reportData = gatherQuarterlyData();
    const doc = createQuarterlyReportDoc(reportData);
    const pdf = convertToPDF(doc);

    // Email to leadership
    emailReport(pdf, 'Quarterly Trend Analysis', getReportRecipients('quarterly'));

    Logger.log('Quarterly report generated and emailed successfully');

  } catch (error) {
    Logger.log('Error generating quarterly report: ' + error.message);
    notifyAdminOfError('Quarterly Report Generation Failed', error.message);
  }
}

/**
 * Gathers data for monthly report
 * @returns {Object} Monthly statistics
 */
function gatherMonthlyData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const lastRow = grievanceSheet.getLastRow();
  if (lastRow < 2) {
    return {
      month: Utilities.formatDate(now, Session.getScriptTimeZone(), 'MMMM yyyy'),
      totalGrievances: 0,
      newGrievances: 0,
      closedGrievances: 0,
      openGrievances: 0,
      avgResolutionTime: 0,
      byIssueType: {},
      bySteward: {},
      overdueCount: 0
    };
  }

  const data = grievanceSheet.getRange(2, 1, lastRow - 1, GRIEVANCE_COLS.RESOLUTION).getValues();

  let totalGrievances = 0;
  let newGrievances = 0;
  let closedGrievances = 0;
  let openGrievances = 0;
  const resolutionTimes = [];
  const byIssueType = {};
  const bySteward = {};
  let overdueCount = 0;

  data.forEach(function(row) {
    const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];
    const closedDate = row[GRIEVANCE_COLS.DATE_CLOSED - 1];
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    const issueType = row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1];
    const steward = row[GRIEVANCE_COLS.STEWARD - 1];
    const daysToDeadline = row[GRIEVANCE_COLS.DAYS_TO_DEADLINE - 1];

    totalGrievances++;

    // Count new grievances filed this month
    if (filedDate && filedDate >= firstDayOfMonth && filedDate <= lastDayOfMonth) {
      newGrievances++;
    }

    // Count closed grievances this month
    if (closedDate && closedDate >= firstDayOfMonth && closedDate <= lastDayOfMonth) {
      closedGrievances++;

      // Calculate resolution time
      if (filedDate) {
        const resTime = Math.floor((closedDate - filedDate) / (1000 * 60 * 60 * 24));
        resolutionTimes.push(resTime);
      }
    }

    // Count currently open
    if (status === 'Open') {
      openGrievances++;
    }

    // Count by issue type
    if (issueType) {
      byIssueType[issueType] = (byIssueType[issueType] || 0) + 1;
    }

    // Count by steward
    if (steward) {
      bySteward[steward] = (bySteward[steward] || 0) + 1;
    }

    // Count overdue
    if (daysToDeadline < 0) {
      overdueCount++;
    }
  });

  const avgResolutionTime = resolutionTimes.length > 0
    ? Math.round(resolutionTimes.reduce(function(a, b) { return a + b; }, 0) / resolutionTimes.length)
    : 0;

  return {
    month: Utilities.formatDate(now, Session.getScriptTimeZone(), 'MMMM yyyy'),
    totalGrievances,
    newGrievances,
    closedGrievances,
    openGrievances,
    avgResolutionTime,
    byIssueType,
    bySteward,
    overdueCount
  };
}

/**
 * Gathers data for quarterly report
 * @returns {Object} Quarterly statistics
 */
function gatherQuarterlyData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const startMonth = quarter * 3;
  const firstDayOfQuarter = new Date(now.getFullYear(), startMonth, 1);
  const lastDayOfQuarter = new Date(now.getFullYear(), startMonth + 3, 0);

  const lastRow = grievanceSheet.getLastRow();
  if (lastRow < 2) {
    return {
      quarter: `Q${quarter + 1} ${now.getFullYear()}`,
      monthlyTrends: [],
      totalGrievances: 0,
      trend: 'stable'
    };
  }

  const data = grievanceSheet.getRange(2, 1, lastRow - 1, GRIEVANCE_COLS.RESOLUTION).getValues();

  const monthlyTrends = [0, 0, 0]; // Three months in a quarter
  let totalGrievances = 0;

  data.forEach(function(row) {
    const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];

    if (filedDate && filedDate >= firstDayOfQuarter && filedDate <= lastDayOfQuarter) {
      totalGrievances++;

      const monthIndex = filedDate.getMonth() - startMonth;
      if (monthIndex >= 0 && monthIndex < 3) {
        monthlyTrends[monthIndex]++;
      }
    }
  });

  // Determine trend
  let trend = 'stable';
  if (monthlyTrends[2] > monthlyTrends[0] * 1.2) {
    trend = 'increasing';
  } else if (monthlyTrends[2] < monthlyTrends[0] * 0.8) {
    trend = 'decreasing';
  }

  return {
    quarter: `Q${quarter + 1} ${now.getFullYear()}`,
    monthlyTrends,
    totalGrievances,
    trend,
    ...gatherMonthlyData() // Include current month details
  };
}

/**
 * Creates monthly report document
 * @param {Object} data - Report data
 * @returns {Document} Google Doc
 */
function createMonthlyReportDoc(data) {
  const doc = DocumentApp.create(`Monthly_Report_${data.month.replace(' ', '_')}`);
  const body = doc.getBody();

  // Title
  body.appendParagraph('SEIU Local 509')
    .setHeading(DocumentApp.ParagraphHeading.HEADING1)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendParagraph('Monthly Grievance Report')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendParagraph(data.month)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendHorizontalRule();

  // Executive Summary
  body.appendParagraph('Executive Summary')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const summaryTable = [
    ['Metric', 'Value'],
    ['New Grievances Filed', data.newGrievances.toString()],
    ['Grievances Closed', data.closedGrievances.toString()],
    ['Currently Open', data.openGrievances.toString()],
    ['Overdue Grievances', data.overdueCount.toString()],
    ['Average Resolution Time', `${data.avgResolutionTime} days`],
    ['Total Active Grievances', data.totalGrievances.toString()]
  ];

  const table = body.appendTable(summaryTable);
  table.getRow(0).editAsText().setBold(true);

  body.appendParagraph(''); // Spacing

  // Grievances by Issue Type
  body.appendParagraph('Grievances by Issue Type')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const issueTypes = Object.entries(data.byIssueType)
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 10);

  const issueTable = [['Issue Type', 'Count']];
  issueTypes.forEach(function([type, count]) {
    issueTable.push([type, count.toString()]);
  });

  const issueTableObj = body.appendTable(issueTable);
  issueTableObj.getRow(0).editAsText().setBold(true);

  body.appendParagraph(''); // Spacing

  // Grievances by Steward
  body.appendParagraph('Workload by Steward')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const stewards = Object.entries(data.bySteward)
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 10);

  const stewardTable = [['Steward', 'Active Grievances']];
  stewards.forEach(function([steward, count]) {
    stewardTable.push([steward, count.toString()]);
  });

  const stewardTableObj = body.appendTable(stewardTable);
  stewardTableObj.getRow(0).editAsText().setBold(true);

  body.appendParagraph(''); // Spacing

  // Key Insights
  body.appendParagraph('Key Insights')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const insights = [];

  if (data.overdueCount > 0) {
    insights.push(`⚠️ ${data.overdueCount} grievance(s) are currently overdue and require immediate attention.`);
  }

  if (data.avgResolutionTime > 30) {
    insights.push(`⏰ Average resolution time is ${data.avgResolutionTime} days, which exceeds the 30-day target.`);
  }

  if (data.newGrievances > data.closedGrievances) {
    insights.push(`📈 Grievances filed (${data.newGrievances}) exceeded closures (${data.closedGrievances}) this month.`);
  } else {
    insights.push(`✅ More grievances were closed (${data.closedGrievances}) than filed (${data.newGrievances}) this month.`);
  }

  if (insights.length === 0) {
    body.appendParagraph('No significant issues identified. Operations are running smoothly.');
  } else {
    insights.forEach(function(insight) {
      body.appendListItem(insight);
    });
  }

  body.appendParagraph(''); // Spacing
  body.appendHorizontalRule();

  body.appendParagraph(`Report generated: ${new Date().toLocaleString()}`)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER)
    .setItalic(true);

  doc.saveAndClose();
  return doc;
}

/**
 * Creates quarterly report document
 * @param {Object} data - Report data
 * @returns {Document} Google Doc
 */
function createQuarterlyReportDoc(data) {
  const doc = DocumentApp.create(`Quarterly_Report_${data.quarter.replace(' ', '_')}`);
  const body = doc.getBody();

  // Title
  body.appendParagraph('SEIU Local 509')
    .setHeading(DocumentApp.ParagraphHeading.HEADING1)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendParagraph('Quarterly Trend Analysis')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendParagraph(data.quarter)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendHorizontalRule();

  // Trend Summary
  body.appendParagraph('Trend Summary')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const trendEmoji = {
    'increasing': '📈 Increasing',
    'decreasing': '📉 Decreasing',
    'stable': '➡️ Stable'
  }[data.trend];

  body.appendParagraph(`Overall Trend: ${trendEmoji}`)
    .setBold(true);

  body.appendParagraph(`Total Grievances This Quarter: ${data.totalGrievances}`);

  body.appendParagraph(''); // Spacing

  // Monthly Breakdown
  body.appendParagraph('Monthly Breakdown')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  const monthNames = ['Month 1', 'Month 2', 'Month 3'];
  const monthTable = [['Month', 'Grievances Filed']];

  data.monthlyTrends.forEach(function(count, index) {
    monthTable.push([monthNames[index], count.toString()]);
  });

  const monthTableObj = body.appendTable(monthTable);
  monthTableObj.getRow(0).editAsText().setBold(true);

  // Include monthly details (reuse monthly report data)
  body.appendPageBreak();

  body.appendParagraph('Current Month Details')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendParagraph(`Average Resolution Time: ${data.avgResolutionTime} days`);
  body.appendParagraph(`Currently Open: ${data.openGrievances}`);
  body.appendParagraph(`Overdue: ${data.overdueCount}`);

  doc.saveAndClose();
  return doc;
}

/**
 * Converts Google Doc to PDF
 * @param {Document} doc - Google Doc object
 * @returns {File} PDF file
 */
function convertToPDF(doc) {
  const docFile = DriveApp.getFileById(doc.getId());
  const pdfBlob = docFile.getAs('application/pdf');
  const pdfFile = DriveApp.createFile(pdfBlob);

  // Delete the temporary doc
  docFile.setTrashed(true);

  return pdfFile;
}

/**
 * Emails report to recipients
 * @param {File} pdf - PDF file
 * @param {string} reportType - Report type name
 * @param {Array} recipients - Email addresses
 */
function emailReport(pdf, reportType, recipients) {
  if (recipients.length === 0) {
    Logger.log('No recipients configured for reports');
    return;
  }

  const subject = `SEIU Local 509 - ${reportType}`;
  const body = `
Dear Leadership,

Please find attached the ${reportType} for SEIU Local 509.

This report was automatically generated by the 509 Dashboard.

Best regards,
SEIU Local 509 Dashboard (Automated System)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View Dashboard: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
Report Generated: ${new Date().toLocaleString()}
  `;

  MailApp.sendEmail({
    to: recipients.join(','),
    subject: subject,
    body: body,
    attachments: [pdf],
    name: 'SEIU Local 509 Dashboard'
  });

  Logger.log(`Report emailed to: ${recipients.join(', ')}`);
}

/**
 * Gets report recipients from configuration
 * @param {string} reportType - 'monthly' or 'quarterly'
 * @returns {Array} Email addresses
 */
function getReportRecipients(reportType) {
  // This would be stored in a configuration sheet
  // For now, return a placeholder
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(SHEETS.CONFIGURATION);

  if (!configSheet) {
    // Default to script owner
    return [Session.getActiveUser().getEmail()];
  }

  // Look for recipients in config sheet
  // Format: Report Type | Email Addresses (comma-separated)
  const data = configSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === `${reportType}_recipients`) {
      const emails = data[i][1].toString().split(',').map(function(e) { return e.trim(); }).filter(function(e) { return e; });
      return emails;
    }
  }

  // Default
  return [Session.getActiveUser().getEmail()];
}

/**
 * Notifies admin of report generation error
 * @param {string} title - Error title
 * @param {string} message - Error message
 */
function notifyAdminOfError(title, message) {
  const adminEmail = Session.getActiveUser().getEmail();

  MailApp.sendEmail({
    to: adminEmail,
    subject: `🚨 ${title}`,
    body: `An error occurred in the 509 Dashboard automated reports:\n\n${message}\n\nPlease check the execution log for details.`,
    name: 'SEIU Local 509 Dashboard'
  });
}

/**
 * Shows report automation settings dialog
 */
function showReportAutomationSettings() {
  const ui = SpreadsheetApp.getUi();

  const triggers = ScriptApp.getProjectTriggers();
  const monthlyEnabled = triggers.some(function(t) { return t.getHandlerFunction() === 'generateMonthlyReport'; });
  const quarterlyEnabled = triggers.some(function(t) { return t.getHandlerFunction() === 'generateQuarterlyReport'; });

  const html = HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #1a73e8; margin-top: 0; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    .status { padding: 15px; border-radius: 4px; margin: 20px 0; font-weight: bold; }
    .status.enabled { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .status.disabled { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    button { background: #1a73e8; color: white; border: none; padding: 12px 24px; font-size: 14px; border-radius: 4px; cursor: pointer; margin: 10px 5px 0 0; }
    button:hover { background: #1557b0; }
    button.danger { background: #dc3545; }
    button.danger:hover { background: #c82333; }
  </style>
</head>
<body>
  <div class="container">
    <h2>📊 Report Automation Settings</h2>

    <h3>Monthly Reports</h3>
    <div class="status ${monthlyEnabled ? 'enabled' : 'disabled'}">
      ${monthlyEnabled ? '✅ Monthly reports ENABLED (1st of month, 9 AM)' : '🔕 Monthly reports DISABLED'}
    </div>
    <button onclick="google.script.run.withSuccessHandler(function() { google.script.host.close(); }).setupMonthlyReports()">
      ${monthlyEnabled ? '🔄 Refresh Monthly Trigger' : '✅ Enable Monthly Reports'}
    </button>

    <h3>Quarterly Reports</h3>
    <div class="status ${quarterlyEnabled ? 'enabled' : 'disabled'}">
      ${quarterlyEnabled ? '✅ Quarterly reports ENABLED (Jan/Apr/Jul/Oct, 10 AM)' : '🔕 Quarterly reports DISABLED'}
    </div>
    <button onclick="google.script.run.withSuccessHandler(function() { google.script.host.close(); }).setupQuarterlyReports()">
      ${quarterlyEnabled ? '🔄 Refresh Quarterly Trigger' : '✅ Enable Quarterly Reports'}
    </button>

    <hr style="margin: 30px 0;">

    <button onclick="google.script.run.withSuccessHandler(function() { google.script.host.close(); }).generateMonthlyReport()">
      🧪 Test Monthly Report
    </button>

    <button onclick="google.script.run.withSuccessHandler(function() { google.script.host.close(); }).generateQuarterlyReport()">
      🧪 Test Quarterly Report
    </button>

    <button class="danger" onclick="google.script.run.withSuccessHandler(function() { google.script.host.close(); }).disableAutomatedReports()">
      🔕 Disable All Reports
    </button>
  </div>
</body>
</html>
  `)
    .setWidth(700)
    .setHeight(550);

  ui.showModalDialog(html, '📊 Report Automation');
}
