/**
 * ============================================================================
 * OPERATIONS ANALYTICS - MERGED ANALYTICS DASHBOARD
 * ============================================================================
 *
 * Combines 5 analytics tabs into one comprehensive operations view:
 * 1. Trends & Timeline (rows 4-18)
 * 2. Location Analytics (rows 21-40)
 * 3. Type Analysis (rows 43-60)
 * 4. Member Engagement (rows 63-82)
 * 5. Cost Impact (rows 85-100)
 *
 * Creator: Wardis N. Vizcaino, Steward at SEIU 509
 * Contact: wardis@pm.me
 * License: Free for non-profit collective bargaining groups/unions
 * ============================================================================
 */

/**
 * Creates the merged Operations Analytics sheet
 */
function createOperationsAnalyticsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = "📊 Operations Analytics";

  // Delete existing sheet if present
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    ss.deleteSheet(sheet);
  }

  sheet = ss.insertSheet(sheetName);
  sheet.clear();

  // Main header
  sheet.getRange("A1:L1").merge()
    .setValue("📊 OPERATIONS ANALYTICS DASHBOARD")
    .setFontSize(20)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor("white");

  sheet.getRange("A2:L2").merge()
    .setValue("Comprehensive analytics combining trends, locations, types, engagement, and cost impact")
    .setFontSize(10)
    .setFontStyle("italic")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.LIGHT_GRAY)
    .setFontColor(COLORS.TEXT_GRAY);

  // =========== SECTION 1: TRENDS & TIMELINE (Rows 4-18) ===========
  createTrendsSection(sheet, 4);

  // =========== SECTION 2: LOCATION ANALYTICS (Rows 21-40) ===========
  createLocationSection(sheet, 21);

  // =========== SECTION 3: TYPE ANALYSIS (Rows 43-60) ===========
  createTypeAnalysisSection(sheet, 43);

  // =========== SECTION 4: MEMBER ENGAGEMENT (Rows 63-82) ===========
  createMemberEngagementSection(sheet, 63);

  // =========== SECTION 5: COST IMPACT (Rows 85-100) ===========
  createCostImpactSection(sheet, 85);

  // Set column widths
  sheet.setColumnWidth(1, 150);  // Month/Location/Type
  sheet.setColumnWidth(2, 100);  // Count columns
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 100);
  sheet.setColumnWidth(8, 100);
  sheet.setColumnWidth(9, 100);
  sheet.setColumnWidth(10, 100);
  sheet.setColumnWidth(11, 100);
  sheet.setColumnWidth(12, 200);  // Notes

  // Freeze header rows
  sheet.setFrozenRows(2);
  sheet.setTabColor(COLORS.PRIMARY_PURPLE);

  // Delete unused columns beyond L (12 columns)
  const totalCols = sheet.getMaxColumns();
  if (totalCols > 12) {
    sheet.deleteColumns(13, totalCols - 12);
  }

  Logger.log("Operations Analytics sheet created");
}

/**
 * Creates the Trends & Timeline section
 */
function createTrendsSection(sheet, startRow) {
  // Section header
  sheet.getRange(`A${startRow}:L${startRow}`).merge()
    .setValue("📈 TRENDS & TIMELINE")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.UNION_GREEN)
    .setFontColor("white");

  // Column headers
  const headers = ["Month", "New Grievances", "Resolved", "Win Rate %", "Avg Resolution Days",
                   "Active at Month End", "Overdue", "New Members", "Active Members",
                   "Stewards Active", "Satisfaction Score", "Trend"];
  sheet.getRange(startRow + 1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Data rows (13 months of data - rows startRow+2 to startRow+14)
  for (let i = 0; i < 13; i++) {
    const dataRow = startRow + 2 + i;
    const monthOffset = 12 - i;

    // Month name formula
    sheet.getRange(dataRow, 1).setFormula(`=TEXT(EDATE(TODAY(),-${monthOffset}),"MMM YYYY")`);

    // New Grievances this month
    sheet.getRange(dataRow, 2).setFormula(
      `=COUNTIFS('Grievance Log'!$I:$I,">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$I:$I,"<="&EOMONTH(TODAY(),-${monthOffset}))`
    );

    // Resolved this month
    sheet.getRange(dataRow, 3).setFormula(
      `=COUNTIFS('Grievance Log'!$R:$R,">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$R:$R,"<="&EOMONTH(TODAY(),-${monthOffset}))`
    );

    // Win Rate % (Settled / (Settled + Denied))
    sheet.getRange(dataRow, 4).setFormula(
      `=IFERROR(COUNTIFS('Grievance Log'!$R:$R,">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$R:$R,"<="&EOMONTH(TODAY(),-${monthOffset}),'Grievance Log'!$E:$E,"Settled")/(COUNTIFS('Grievance Log'!$R:$R,">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$R:$R,"<="&EOMONTH(TODAY(),-${monthOffset}),'Grievance Log'!$E:$E,"Settled")+COUNTIFS('Grievance Log'!$R:$R,">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$R:$R,"<="&EOMONTH(TODAY(),-${monthOffset}),'Grievance Log'!$E:$E,"Denied"))*100,0)&"%"`
    );

    // Avg Resolution Days
    sheet.getRange(dataRow, 5).setFormula(
      `=IFERROR(ROUND(AVERAGEIFS('Grievance Log'!$S:$S,'Grievance Log'!$R:$R,">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$R:$R,"<="&EOMONTH(TODAY(),-${monthOffset})),1),"-")`
    );

    // Active at Month End (filed before month end, not closed by month end)
    sheet.getRange(dataRow, 6).setFormula(
      `=COUNTIFS('Grievance Log'!$I:$I,"<="&EOMONTH(TODAY(),-${monthOffset}),'Grievance Log'!$E:$E,"<>Closed",'Grievance Log'!$E:$E,"<>Settled",'Grievance Log'!$E:$E,"<>Denied",'Grievance Log'!$E:$E,"<>Withdrawn")`
    );

    // Overdue (Next Action Due < end of month)
    sheet.getRange(dataRow, 7).setFormula(
      `=COUNTIFS('Grievance Log'!$T:$T,"<"&EOMONTH(TODAY(),-${monthOffset}),'Grievance Log'!$T:$T,"<>"&"",'Grievance Log'!$E:$E,"Open")`
    );

    // New Members (placeholder - would need member join date)
    sheet.getRange(dataRow, 8).setValue("-");

    // Active Members
    sheet.getRange(dataRow, 9).setFormula(`=COUNTA('Member Directory'!$A:$A)-1`);

    // Stewards Active
    sheet.getRange(dataRow, 10).setFormula(`=COUNTIF('Member Directory'!$N:$N,"Yes")`);

    // Satisfaction Score (placeholder)
    sheet.getRange(dataRow, 11).setValue("-");

    // Trend indicator
    sheet.getRange(dataRow, 12).setFormula(
      `=IF(B${dataRow}>B${dataRow + 1},"📈 Up",IF(B${dataRow}<B${dataRow + 1},"📉 Down","➡️ Stable"))`
    );
  }

  // Format percentages and numbers
  sheet.getRange(startRow + 2, 2, 13, 10).setHorizontalAlignment("center");
}

/**
 * Creates the Location Analytics section
 */
function createLocationSection(sheet, startRow) {
  // Section header
  sheet.getRange(`A${startRow}:L${startRow}`).merge()
    .setValue("🗺️ LOCATION ANALYTICS")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_TEAL)
    .setFontColor("white");

  // Column headers
  const headers = ["Location", "Total Members", "Active Members", "Total Grievances",
                   "Active Grievances", "Win Rate %", "Avg Resolution Days",
                   "Member Satisfaction", "Stewards Assigned", "Risk Score", "Priority"];
  sheet.getRange(startRow + 1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Row 2 (startRow + 2) - Summary row
  const summaryRow = startRow + 2;
  sheet.getRange(summaryRow, 1).setValue("ALL LOCATIONS").setFontWeight("bold");
  sheet.getRange(summaryRow, 2).setFormula(`=COUNTA('Member Directory'!$A:$A)-1`);
  sheet.getRange(summaryRow, 3).setFormula(`=COUNTIF('Member Directory'!$AB:$AB,"Yes")`);
  sheet.getRange(summaryRow, 4).setFormula(`=COUNTA('Grievance Log'!$A:$A)-1`);
  sheet.getRange(summaryRow, 5).setFormula(`=COUNTIF('Grievance Log'!$E:$E,"Open")`);
  sheet.getRange(summaryRow, 6).setFormula(`=IFERROR(ROUND(COUNTIF('Grievance Log'!$E:$E,"Settled")/(COUNTIF('Grievance Log'!$E:$E,"Settled")+COUNTIF('Grievance Log'!$E:$E,"Denied"))*100,1)&"%","0%")`);
  sheet.getRange(summaryRow, 7).setFormula(`=IFERROR(ROUND(AVERAGE('Grievance Log'!$S:$S),1),"-")`);
  sheet.getRange(summaryRow, 8).setValue("N/A");
  sheet.getRange(summaryRow, 9).setFormula(`=COUNTIF('Member Directory'!$N:$N,"Yes")`);
  sheet.getRange(summaryRow, 10).setFormula(`=IF(E${summaryRow}>10,"High",IF(E${summaryRow}>5,"Medium","Low"))`);
  sheet.getRange(summaryRow, 11).setFormula(`=IF(J${summaryRow}="High","🔴 Critical",IF(J${summaryRow}="Medium","🟡 Monitor","🟢 Normal"))`);
  sheet.getRange(summaryRow, 1, 1, 11).setBackground(COLORS.WARNING_LIGHT);

  // Get locations from Config sheet dynamically
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);
  let locations = [];

  if (configSheet) {
    const locationCol = CONFIG_COLS.OFFICE_LOCATIONS;
    const lastRow = configSheet.getLastRow();
    if (lastRow > 1) {
      const values = configSheet.getRange(2, locationCol, lastRow - 1, 1).getValues();
      locations = values.map(r => r[0]).filter(v => v !== '' && v !== null);
    }
  }

  // Default locations if none found
  if (locations.length === 0) {
    locations = ["Boston", "Springfield", "Worcester", "Cambridge", "Lowell"];
  }

  // Data rows for each location
  for (let i = 0; i < Math.min(locations.length, 15); i++) {
    const dataRow = startRow + 3 + i;
    const location = locations[i];

    sheet.getRange(dataRow, 1).setValue(location);
    sheet.getRange(dataRow, 2).setFormula(`=COUNTIF('Member Directory'!$E:$E,"${location}")`);
    sheet.getRange(dataRow, 3).setFormula(`=COUNTIFS('Member Directory'!$E:$E,"${location}",'Member Directory'!$AB:$AB,"Yes")`);
    sheet.getRange(dataRow, 4).setFormula(`=COUNTIF('Grievance Log'!$Z:$Z,"${location}")`);
    sheet.getRange(dataRow, 5).setFormula(`=COUNTIFS('Grievance Log'!$Z:$Z,"${location}",'Grievance Log'!$E:$E,"Open")`);
    sheet.getRange(dataRow, 6).setFormula(`=IFERROR(ROUND(COUNTIFS('Grievance Log'!$Z:$Z,"${location}",'Grievance Log'!$E:$E,"Settled")/(COUNTIFS('Grievance Log'!$Z:$Z,"${location}",'Grievance Log'!$E:$E,"Settled")+COUNTIFS('Grievance Log'!$Z:$Z,"${location}",'Grievance Log'!$E:$E,"Denied"))*100,1)&"%","0%")`);
    sheet.getRange(dataRow, 7).setFormula(`=IFERROR(ROUND(AVERAGEIF('Grievance Log'!$Z:$Z,"${location}",'Grievance Log'!$S:$S),1),"-")`);
    sheet.getRange(dataRow, 8).setValue("N/A");
    sheet.getRange(dataRow, 9).setFormula(`=COUNTIFS('Member Directory'!$E:$E,"${location}",'Member Directory'!$N:$N,"Yes")`);
    sheet.getRange(dataRow, 10).setFormula(`=IF(E${dataRow}>5,"High",IF(E${dataRow}>2,"Medium","Low"))`);
    sheet.getRange(dataRow, 11).setFormula(`=IF(J${dataRow}="High","🔴",IF(J${dataRow}="Medium","🟡","🟢"))`);
  }

  sheet.getRange(startRow + 2, 2, locations.length + 1, 10).setHorizontalAlignment("center");
}

/**
 * Creates the Type Analysis section
 */
function createTypeAnalysisSection(sheet, startRow) {
  // Section header
  sheet.getRange(`A${startRow}:L${startRow}`).merge()
    .setValue("📊 GRIEVANCE TYPE ANALYSIS")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.PRIMARY_BLUE)
    .setFontColor("white");

  // Column headers
  const headers = ["Issue Type", "Total Cases", "Active", "Resolved", "Win Rate %",
                   "Avg Days to Resolve", "Most Common Location", "Top Article Violated",
                   "Trend", "Priority Level", "Notes"];
  sheet.getRange(startRow + 1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Get issue categories from Config
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);
  let issueTypes = [];

  if (configSheet) {
    const catCol = CONFIG_COLS.ISSUE_CATEGORY;
    const lastRow = configSheet.getLastRow();
    if (lastRow > 1) {
      const values = configSheet.getRange(2, catCol, lastRow - 1, 1).getValues();
      issueTypes = values.map(r => r[0]).filter(v => v !== '' && v !== null);
    }
  }

  // Default issue types if none found
  if (issueTypes.length === 0) {
    issueTypes = ["Discipline", "Workload", "Scheduling", "Pay", "Discrimination",
                  "Safety", "Benefits", "Training", "Leave", "Other"];
  }

  // Data rows for each issue type
  for (let i = 0; i < Math.min(issueTypes.length, 15); i++) {
    const dataRow = startRow + 2 + i;
    const issueType = issueTypes[i];

    sheet.getRange(dataRow, 1).setValue(issueType);
    sheet.getRange(dataRow, 2).setFormula(`=COUNTIF('Grievance Log'!$W:$W,"*${issueType}*")`);
    sheet.getRange(dataRow, 3).setFormula(`=COUNTIFS('Grievance Log'!$W:$W,"*${issueType}*",'Grievance Log'!$E:$E,"Open")`);
    sheet.getRange(dataRow, 4).setFormula(`=COUNTIFS('Grievance Log'!$W:$W,"*${issueType}*",'Grievance Log'!$E:$E,"Settled")+COUNTIFS('Grievance Log'!$W:$W,"*${issueType}*",'Grievance Log'!$E:$E,"Denied")+COUNTIFS('Grievance Log'!$W:$W,"*${issueType}*",'Grievance Log'!$E:$E,"Closed")`);
    sheet.getRange(dataRow, 5).setFormula(`=IFERROR(ROUND(COUNTIFS('Grievance Log'!$W:$W,"*${issueType}*",'Grievance Log'!$E:$E,"Settled")/(COUNTIFS('Grievance Log'!$W:$W,"*${issueType}*",'Grievance Log'!$E:$E,"Settled")+COUNTIFS('Grievance Log'!$W:$W,"*${issueType}*",'Grievance Log'!$E:$E,"Denied"))*100,1)&"%","0%")`);
    sheet.getRange(dataRow, 6).setFormula(`=IFERROR(ROUND(AVERAGEIFS('Grievance Log'!$S:$S,'Grievance Log'!$W:$W,"*${issueType}*"),1),"-")`);

    // Most Common Location (using MODE or placeholder)
    sheet.getRange(dataRow, 7).setFormula(`=IFERROR(INDEX('Grievance Log'!$Z:$Z,MATCH(MAX(COUNTIFS('Grievance Log'!$W:$W,"*${issueType}*",'Grievance Log'!$Z:$Z,'Grievance Log'!$Z:$Z)),COUNTIFS('Grievance Log'!$W:$W,"*${issueType}*",'Grievance Log'!$Z:$Z,'Grievance Log'!$Z:$Z),0)),"-")`);

    // Top Article (placeholder - would need more complex formula)
    sheet.getRange(dataRow, 8).setValue("-");

    // Trend (compare current month to previous)
    sheet.getRange(dataRow, 9).setFormula(`=IF(B${dataRow}>0,"📊 Active","➖ None")`);

    // Priority Level
    sheet.getRange(dataRow, 10).setFormula(`=IF(C${dataRow}>5,"🔴 High",IF(C${dataRow}>2,"🟡 Medium","🟢 Low"))`);

    // Notes (placeholder)
    sheet.getRange(dataRow, 11).setValue("");
  }

  sheet.getRange(startRow + 2, 2, issueTypes.length, 9).setHorizontalAlignment("center");
}

/**
 * Creates the Member Engagement section
 */
function createMemberEngagementSection(sheet, startRow) {
  // Section header
  sheet.getRange(`A${startRow}:L${startRow}`).merge()
    .setValue("👥 MEMBER ENGAGEMENT")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_PURPLE)
    .setFontColor("white");

  // Column headers
  const headers = ["Metric", "Value", "Target", "Status", "Trend",
                   "Last Updated", "Owner", "Notes", "", "", ""];
  sheet.getRange(startRow + 1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Engagement metrics
  const metrics = [
    {name: "Total Members", formula: `=COUNTA('Member Directory'!$A:$A)-1`, target: "20000"},
    {name: "Active Stewards", formula: `=COUNTIF('Member Directory'!$N:$N,"Yes")`, target: "50"},
    {name: "Members with Open Grievances", formula: `=COUNTIF('Member Directory'!$AB:$AB,"Yes")`, target: "<100"},
    {name: "Virtual Meetings (Last 30 Days)", formula: `=COUNTIFS('Member Directory'!$Q:$Q,">="&TODAY()-30,'Member Directory'!$Q:$Q,"<>"&"")`, target: "100"},
    {name: "In-Person Meetings (Last 30 Days)", formula: `=COUNTIFS('Member Directory'!$R:$R,">="&TODAY()-30,'Member Directory'!$R:$R,"<>"&"")`, target: "50"},
    {name: "Avg Email Open Rate", formula: `=IFERROR(ROUND(AVERAGE('Member Directory'!$S:$S)*100,1)&"%","-")`, target: "50%"},
    {name: "Total Volunteer Hours", formula: `=IFERROR(SUM('Member Directory'!$T:$T),0)`, target: "500"},
    {name: "Members Interested in Local", formula: `=COUNTIF('Member Directory'!$U:$U,"Yes")`, target: "5000"},
    {name: "Members Interested in Chapter", formula: `=COUNTIF('Member Directory'!$V:$V,"Yes")`, target: "3000"},
    {name: "Members Interested in Allied", formula: `=COUNTIF('Member Directory'!$W:$W,"Yes")`, target: "1000"},
    {name: "Recent Contacts (Last 7 Days)", formula: `=COUNTIFS('Member Directory'!$Y:$Y,">="&TODAY()-7,'Member Directory'!$Y:$Y,"<>"&"")`, target: "50"}
  ];

  for (let i = 0; i < metrics.length; i++) {
    const dataRow = startRow + 2 + i;
    const metric = metrics[i];

    sheet.getRange(dataRow, 1).setValue(metric.name);
    sheet.getRange(dataRow, 2).setFormula(metric.formula);
    sheet.getRange(dataRow, 3).setValue(metric.target);
    sheet.getRange(dataRow, 4).setFormula(`=IF(ISNUMBER(B${dataRow}),IF(B${dataRow}>=VALUE(SUBSTITUTE(C${dataRow},"<","")),"✅ On Track","⚠️ Below Target"),"📊 Tracking")`);
    sheet.getRange(dataRow, 5).setValue("➡️ Stable");
    sheet.getRange(dataRow, 6).setFormula(`=TEXT(NOW(),"MM/dd/yyyy")`);
    sheet.getRange(dataRow, 7).setValue("System");
    sheet.getRange(dataRow, 8).setValue("");
  }

  sheet.getRange(startRow + 2, 2, metrics.length, 6).setHorizontalAlignment("center");
}

/**
 * Creates the Cost Impact section
 */
function createCostImpactSection(sheet, startRow) {
  // Section header
  sheet.getRange(`A${startRow}:L${startRow}`).merge()
    .setValue("💰 COST IMPACT ANALYSIS")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_ORANGE)
    .setFontColor("white");

  // Column headers
  const headers = ["Category", "Total Cases", "Est. Cost Impact", "Variance", "ROI",
                   "Cases Affected", "Members Benefited", "Status", "Quarter", "Notes"];
  sheet.getRange(startRow + 1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Cost categories based on issue types
  const categories = [
    {name: "Discipline Cases", costPer: 5000},
    {name: "Pay Disputes", costPer: 2500},
    {name: "Workload Issues", costPer: 1500},
    {name: "Scheduling Conflicts", costPer: 1000},
    {name: "Benefits Issues", costPer: 3000},
    {name: "Safety Violations", costPer: 4000},
    {name: "Discrimination Claims", costPer: 10000},
    {name: "Other", costPer: 1500}
  ];

  for (let i = 0; i < categories.length; i++) {
    const dataRow = startRow + 2 + i;
    const cat = categories[i];
    const issueType = cat.name.replace(" Cases", "").replace(" Disputes", "").replace(" Issues", "").replace(" Conflicts", "").replace(" Violations", "").replace(" Claims", "");

    sheet.getRange(dataRow, 1).setValue(cat.name);
    sheet.getRange(dataRow, 2).setFormula(`=COUNTIF('Grievance Log'!$W:$W,"*${issueType}*")`);
    sheet.getRange(dataRow, 3).setFormula(`=B${dataRow}*${cat.costPer}`);
    sheet.getRange(dataRow, 3).setNumberFormat("$#,##0");
    sheet.getRange(dataRow, 4).setValue("N/A");
    sheet.getRange(dataRow, 5).setFormula(`=IFERROR(ROUND(COUNTIFS('Grievance Log'!$W:$W,"*${issueType}*",'Grievance Log'!$E:$E,"Settled")/B${dataRow}*100,0)&"%","0%")`);
    sheet.getRange(dataRow, 6).setFormula(`=B${dataRow}`);
    sheet.getRange(dataRow, 7).setFormula(`=COUNTIFS('Grievance Log'!$W:$W,"*${issueType}*",'Grievance Log'!$E:$E,"Settled")`);
    sheet.getRange(dataRow, 8).setFormula(`=IF(B${dataRow}>0,"Active","None")`);
    sheet.getRange(dataRow, 9).setFormula(`="Q"&ROUNDUP(MONTH(TODAY())/3,0)&" "&YEAR(TODAY())`);
    sheet.getRange(dataRow, 10).setValue("");
  }

  // Summary row
  const summaryRow = startRow + 2 + categories.length;
  sheet.getRange(summaryRow, 1).setValue("TOTAL").setFontWeight("bold");
  sheet.getRange(summaryRow, 2).setFormula(`=SUM(B${startRow + 2}:B${summaryRow - 1})`).setFontWeight("bold");
  sheet.getRange(summaryRow, 3).setFormula(`=SUM(C${startRow + 2}:C${summaryRow - 1})`).setFontWeight("bold").setNumberFormat("$#,##0");
  sheet.getRange(summaryRow, 6).setFormula(`=SUM(F${startRow + 2}:F${summaryRow - 1})`).setFontWeight("bold");
  sheet.getRange(summaryRow, 7).setFormula(`=SUM(G${startRow + 2}:G${summaryRow - 1})`).setFontWeight("bold");
  sheet.getRange(summaryRow, 1, 1, 10).setBackground(COLORS.WARNING_LIGHT);

  sheet.getRange(startRow + 2, 2, categories.length + 1, 8).setHorizontalAlignment("center");
}

/**
 * Populates the Operations Analytics sheet with live data
 * Called after creation to ensure formulas are working
 */
function populateOperationsAnalytics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("📊 Operations Analytics");

  if (!sheet) {
    Logger.log("Operations Analytics sheet not found - creating it");
    createOperationsAnalyticsSheet();
    return;
  }

  // Force recalculation of all formulas
  SpreadsheetApp.flush();

  Logger.log("Operations Analytics populated with live data");
}
