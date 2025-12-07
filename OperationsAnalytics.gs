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
 * CRITICAL: Uses dynamic column references via getColumnLetter() and constants
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
  const sheetName = SHEETS.OPERATIONS_ANALYTICS;

  // Delete existing sheet if present
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    ss.deleteSheet(sheet);
  }

  sheet = ss.insertSheet(sheetName);
  sheet.clear();

  // Get dynamic column letters for all formulas
  const cols = getOperationsAnalyticsColumns();

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
  createTrendsSectionDynamic(sheet, 4, cols);

  // =========== SECTION 2: LOCATION ANALYTICS (Rows 21-40) ===========
  createLocationSectionDynamic(sheet, 21, cols);

  // =========== SECTION 3: TYPE ANALYSIS (Rows 43-60) ===========
  createTypeAnalysisSectionDynamic(sheet, 43, cols);

  // =========== SECTION 4: MEMBER ENGAGEMENT (Rows 63-82) ===========
  createMemberEngagementSectionDynamic(sheet, 63, cols);

  // =========== SECTION 5: COST IMPACT (Rows 85-100) ===========
  createCostImpactSectionDynamic(sheet, 85, cols);

  // Set column widths
  sheet.setColumnWidth(1, 180);  // Month/Location/Type
  sheet.setColumnWidth(2, 120);  // Count columns
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 120);
  sheet.setColumnWidth(7, 120);
  sheet.setColumnWidth(8, 120);
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

  Logger.log("Operations Analytics sheet created with dynamic columns");
}

/**
 * Gets all column letters needed for Operations Analytics formulas
 * Uses GRIEVANCE_COLS and MEMBER_COLS constants
 */
function getOperationsAnalyticsColumns() {
  return {
    // Grievance Log columns
    gGrievanceId: getColumnLetter(GRIEVANCE_COLS.GRIEVANCE_ID),
    gStatus: getColumnLetter(GRIEVANCE_COLS.STATUS),
    gCurrentStep: getColumnLetter(GRIEVANCE_COLS.CURRENT_STEP),
    gDateFiled: getColumnLetter(GRIEVANCE_COLS.DATE_FILED),
    gDateClosed: getColumnLetter(GRIEVANCE_COLS.DATE_CLOSED),
    gDaysOpen: getColumnLetter(GRIEVANCE_COLS.DAYS_OPEN),
    gNextActionDue: getColumnLetter(GRIEVANCE_COLS.NEXT_ACTION_DUE),
    gArticles: getColumnLetter(GRIEVANCE_COLS.ARTICLES),
    gIssueCategory: getColumnLetter(GRIEVANCE_COLS.ISSUE_CATEGORY),
    gLocation: getColumnLetter(GRIEVANCE_COLS.LOCATION),
    gSteward: getColumnLetter(GRIEVANCE_COLS.STEWARD),
    gResolution: getColumnLetter(GRIEVANCE_COLS.RESOLUTION),

    // Member Directory columns
    mMemberId: getColumnLetter(MEMBER_COLS.MEMBER_ID),
    mLocation: getColumnLetter(MEMBER_COLS.LOCATION),
    mIsSteward: getColumnLetter(MEMBER_COLS.IS_STEWARD),
    mLastVirtualMtg: getColumnLetter(MEMBER_COLS.LAST_VIRTUAL_MTG),
    mLastInPersonMtg: getColumnLetter(MEMBER_COLS.LAST_INPERSON_MTG),
    mOpenRate: getColumnLetter(MEMBER_COLS.OPEN_RATE),
    mVolunteerHours: getColumnLetter(MEMBER_COLS.VOLUNTEER_HOURS),
    mInterestLocal: getColumnLetter(MEMBER_COLS.INTEREST_LOCAL),
    mInterestChapter: getColumnLetter(MEMBER_COLS.INTEREST_CHAPTER),
    mInterestAllied: getColumnLetter(MEMBER_COLS.INTEREST_ALLIED),
    mRecentContactDate: getColumnLetter(MEMBER_COLS.RECENT_CONTACT_DATE),
    mHasOpenGrievance: getColumnLetter(MEMBER_COLS.HAS_OPEN_GRIEVANCE)
  };
}

/**
 * Creates the Trends & Timeline section with dynamic columns
 */
function createTrendsSectionDynamic(sheet, startRow, cols) {
  // Section header
  sheet.getRange(`A${startRow}:L${startRow}`).merge()
    .setValue("📈 TRENDS & TIMELINE")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.UNION_GREEN)
    .setFontColor("white");

  // Column headers
  const headers = ["Month", "New Grievances", "Resolved", "Win Rate %", "Avg Days",
                   "Active Cases", "Overdue", "New Members", "Total Members",
                   "Active Stewards", "Satisfaction", "Trend"];
  sheet.getRange(startRow + 1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Data rows (13 months of data)
  for (let i = 0; i < 13; i++) {
    const dataRow = startRow + 2 + i;
    const monthOffset = 12 - i;

    // Month name
    sheet.getRange(dataRow, 1).setFormula(`=TEXT(EDATE(TODAY(),-${monthOffset}),"MMM YYYY")`);

    // New Grievances this month (filed this month)
    sheet.getRange(dataRow, 2).setFormula(
      `=IFERROR(COUNTIFS('Grievance Log'!$${cols.gDateFiled}:$${cols.gDateFiled},">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$${cols.gDateFiled}:$${cols.gDateFiled},"<="&EOMONTH(TODAY(),-${monthOffset})),0)`
    );

    // Resolved this month (closed this month)
    sheet.getRange(dataRow, 3).setFormula(
      `=IFERROR(COUNTIFS('Grievance Log'!$${cols.gDateClosed}:$${cols.gDateClosed},">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$${cols.gDateClosed}:$${cols.gDateClosed},"<="&EOMONTH(TODAY(),-${monthOffset})),0)`
    );

    // Win Rate % (Settled / (Settled + Denied))
    sheet.getRange(dataRow, 4).setFormula(
      `=IFERROR(TEXT(COUNTIFS('Grievance Log'!$${cols.gDateClosed}:$${cols.gDateClosed},">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$${cols.gDateClosed}:$${cols.gDateClosed},"<="&EOMONTH(TODAY(),-${monthOffset}),'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")/(COUNTIFS('Grievance Log'!$${cols.gDateClosed}:$${cols.gDateClosed},">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$${cols.gDateClosed}:$${cols.gDateClosed},"<="&EOMONTH(TODAY(),-${monthOffset}),'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")+COUNTIFS('Grievance Log'!$${cols.gDateClosed}:$${cols.gDateClosed},">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$${cols.gDateClosed}:$${cols.gDateClosed},"<="&EOMONTH(TODAY(),-${monthOffset}),'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Denied")),"0%"),"0%")`
    );

    // Avg Resolution Days
    sheet.getRange(dataRow, 5).setFormula(
      `=IFERROR(ROUND(AVERAGEIFS('Grievance Log'!$${cols.gDaysOpen}:$${cols.gDaysOpen},'Grievance Log'!$${cols.gDateClosed}:$${cols.gDateClosed},">="&EOMONTH(TODAY(),-${monthOffset + 1})+1,'Grievance Log'!$${cols.gDateClosed}:$${cols.gDateClosed},"<="&EOMONTH(TODAY(),-${monthOffset}),'Grievance Log'!$${cols.gDaysOpen}:$${cols.gDaysOpen},">0"),0),"-")`
    );

    // Active Cases at Month End
    sheet.getRange(dataRow, 6).setFormula(
      `=IFERROR(COUNTIF('Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Open"),0)`
    );

    // Overdue (Next Action Due < today and Open)
    sheet.getRange(dataRow, 7).setFormula(
      `=IFERROR(COUNTIFS('Grievance Log'!$${cols.gNextActionDue}:$${cols.gNextActionDue},"<"&TODAY(),'Grievance Log'!$${cols.gNextActionDue}:$${cols.gNextActionDue},"<>"",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Open"),0)`
    );

    // New Members (placeholder - no join date column)
    sheet.getRange(dataRow, 8).setValue("-");

    // Total Members
    sheet.getRange(dataRow, 9).setFormula(
      `=IFERROR(TEXT(MAX(0,COUNTA('Member Directory'!$${cols.mMemberId}:$${cols.mMemberId})-1),"#,##0"),0)`
    );

    // Active Stewards
    sheet.getRange(dataRow, 10).setFormula(
      `=IFERROR(TEXT(COUNTIF('Member Directory'!$${cols.mIsSteward}:$${cols.mIsSteward},"Yes"),"#,##0"),0)`
    );

    // Satisfaction Score (placeholder)
    sheet.getRange(dataRow, 11).setValue("-");

    // Trend indicator
    if (i < 12) {
      sheet.getRange(dataRow, 12).setFormula(
        `=IF(B${dataRow}>B${dataRow + 1},"📈 Up",IF(B${dataRow}<B${dataRow + 1},"📉 Down","➡️ Stable"))`
      );
    } else {
      sheet.getRange(dataRow, 12).setValue("➡️ Stable");
    }
  }

  // Format columns
  sheet.getRange(startRow + 2, 2, 13, 10).setHorizontalAlignment("center");
  sheet.getRange(startRow + 2, 2, 13, 3).setNumberFormat("#,##0");
  sheet.getRange(startRow + 2, 5, 13, 1).setNumberFormat("#,##0");
  sheet.getRange(startRow + 2, 6, 13, 2).setNumberFormat("#,##0");
}

/**
 * Creates the Location Analytics section with dynamic columns
 */
function createLocationSectionDynamic(sheet, startRow, cols) {
  // Section header
  sheet.getRange(`A${startRow}:L${startRow}`).merge()
    .setValue("🗺️ LOCATION ANALYTICS")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_TEAL)
    .setFontColor("white");

  // Column headers
  const headers = ["Location", "Total Members", "With Grievances", "Total Cases",
                   "Open Cases", "Win Rate %", "Avg Days",
                   "Stewards", "Risk Level", "Priority", "Notes"];
  sheet.getRange(startRow + 1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Row 2 - Summary/Totals row
  const summaryRow = startRow + 2;
  sheet.getRange(summaryRow, 1).setValue("ALL LOCATIONS").setFontWeight("bold");
  sheet.getRange(summaryRow, 2).setFormula(`=IFERROR(TEXT(MAX(0,COUNTA('Member Directory'!$${cols.mMemberId}:$${cols.mMemberId})-1),"#,##0"),0)`);
  sheet.getRange(summaryRow, 3).setFormula(`=IFERROR(TEXT(COUNTIF('Member Directory'!$${cols.mHasOpenGrievance}:$${cols.mHasOpenGrievance},"Yes"),"#,##0"),0)`);
  sheet.getRange(summaryRow, 4).setFormula(`=IFERROR(TEXT(MAX(0,COUNTA('Grievance Log'!$${cols.gGrievanceId}:$${cols.gGrievanceId})-1),"#,##0"),0)`);
  sheet.getRange(summaryRow, 5).setFormula(`=IFERROR(TEXT(COUNTIF('Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Open"),"#,##0"),0)`);
  sheet.getRange(summaryRow, 6).setFormula(`=IFERROR(TEXT(COUNTIF('Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")/(COUNTIF('Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")+COUNTIF('Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Denied")),"0%"),"0%")`);
  sheet.getRange(summaryRow, 7).setFormula(`=IFERROR(ROUND(AVERAGEIF('Grievance Log'!$${cols.gDaysOpen}:$${cols.gDaysOpen},">0"),0),"-")`);
  sheet.getRange(summaryRow, 8).setFormula(`=IFERROR(TEXT(COUNTIF('Member Directory'!$${cols.mIsSteward}:$${cols.mIsSteward},"Yes"),"#,##0"),0)`);
  sheet.getRange(summaryRow, 9).setFormula(`=IF(E${summaryRow}>20,"High",IF(E${summaryRow}>10,"Medium","Low"))`);
  sheet.getRange(summaryRow, 10).setFormula(`=IF(I${summaryRow}="High","🔴 Critical",IF(I${summaryRow}="Medium","🟡 Monitor","🟢 Normal"))`);
  sheet.getRange(summaryRow, 11).setValue("Summary");
  sheet.getRange(summaryRow, 1, 1, 11).setBackground(COLORS.WARNING_LIGHT);

  // Get locations from Config sheet
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

  if (locations.length === 0) {
    locations = ["Boston HQ", "Springfield Office", "Worcester Office", "Cambridge Office", "Lowell Office"];
  }

  // Data rows for each location
  for (let i = 0; i < Math.min(locations.length, 15); i++) {
    const dataRow = startRow + 3 + i;
    const location = locations[i];

    sheet.getRange(dataRow, 1).setValue(location);
    sheet.getRange(dataRow, 2).setFormula(`=IFERROR(TEXT(COUNTIF('Member Directory'!$${cols.mLocation}:$${cols.mLocation},"${location}"),"#,##0"),0)`);
    sheet.getRange(dataRow, 3).setFormula(`=IFERROR(TEXT(COUNTIFS('Member Directory'!$${cols.mLocation}:$${cols.mLocation},"${location}",'Member Directory'!$${cols.mHasOpenGrievance}:$${cols.mHasOpenGrievance},"Yes"),"#,##0"),0)`);
    sheet.getRange(dataRow, 4).setFormula(`=IFERROR(TEXT(COUNTIF('Grievance Log'!$${cols.gLocation}:$${cols.gLocation},"${location}"),"#,##0"),0)`);
    sheet.getRange(dataRow, 5).setFormula(`=IFERROR(TEXT(COUNTIFS('Grievance Log'!$${cols.gLocation}:$${cols.gLocation},"${location}",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Open"),"#,##0"),0)`);
    sheet.getRange(dataRow, 6).setFormula(`=IFERROR(TEXT(COUNTIFS('Grievance Log'!$${cols.gLocation}:$${cols.gLocation},"${location}",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")/(COUNTIFS('Grievance Log'!$${cols.gLocation}:$${cols.gLocation},"${location}",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")+COUNTIFS('Grievance Log'!$${cols.gLocation}:$${cols.gLocation},"${location}",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Denied")),"0%"),"0%")`);
    sheet.getRange(dataRow, 7).setFormula(`=IFERROR(ROUND(AVERAGEIFS('Grievance Log'!$${cols.gDaysOpen}:$${cols.gDaysOpen},'Grievance Log'!$${cols.gLocation}:$${cols.gLocation},"${location}",'Grievance Log'!$${cols.gDaysOpen}:$${cols.gDaysOpen},">0"),0),"-")`);
    sheet.getRange(dataRow, 8).setFormula(`=IFERROR(TEXT(COUNTIFS('Member Directory'!$${cols.mLocation}:$${cols.mLocation},"${location}",'Member Directory'!$${cols.mIsSteward}:$${cols.mIsSteward},"Yes"),"#,##0"),0)`);
    sheet.getRange(dataRow, 9).setFormula(`=IF(E${dataRow}>5,"High",IF(E${dataRow}>2,"Medium","Low"))`);
    sheet.getRange(dataRow, 10).setFormula(`=IF(I${dataRow}="High","🔴",IF(I${dataRow}="Medium","🟡","🟢"))`);
    sheet.getRange(dataRow, 11).setValue("");
  }

  sheet.getRange(startRow + 2, 2, locations.length + 1, 9).setHorizontalAlignment("center");
}

/**
 * Creates the Type Analysis section with dynamic columns
 */
function createTypeAnalysisSectionDynamic(sheet, startRow, cols) {
  // Section header
  sheet.getRange(`A${startRow}:L${startRow}`).merge()
    .setValue("📊 GRIEVANCE TYPE ANALYSIS")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.PRIMARY_BLUE)
    .setFontColor("white");

  // Column headers
  const headers = ["Issue Type", "Total", "Open", "Resolved", "Win Rate %",
                   "Avg Days", "Top Location", "Top Article",
                   "Trend", "Priority", "Notes"];
  sheet.getRange(startRow + 1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Get issue categories from ISSUE_CATEGORIES constant or Config
  let issueTypes = [];
  if (typeof ISSUE_CATEGORIES !== 'undefined' && Array.isArray(ISSUE_CATEGORIES)) {
    issueTypes = ISSUE_CATEGORIES;
  } else {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = ss.getSheetByName(SHEETS.CONFIG);
    if (configSheet) {
      const catCol = CONFIG_COLS.ISSUE_CATEGORY;
      const lastRow = configSheet.getLastRow();
      if (lastRow > 1) {
        const values = configSheet.getRange(2, catCol, lastRow - 1, 1).getValues();
        issueTypes = values.map(r => r[0]).filter(v => v !== '' && v !== null);
      }
    }
  }

  if (issueTypes.length === 0) {
    issueTypes = ["Discipline", "Workload", "Scheduling", "Pay/Compensation", "Discrimination",
                  "Safety", "Benefits", "Performance Evaluation", "Job Classification", "Layoff/Recall"];
  }

  // Data rows for each issue type
  for (let i = 0; i < Math.min(issueTypes.length, 15); i++) {
    const dataRow = startRow + 2 + i;
    const issueType = issueTypes[i];

    sheet.getRange(dataRow, 1).setValue(issueType);

    // Total Cases
    sheet.getRange(dataRow, 2).setFormula(`=IFERROR(TEXT(COUNTIF('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${issueType}*"),"#,##0"),0)`);

    // Open Cases
    sheet.getRange(dataRow, 3).setFormula(`=IFERROR(TEXT(COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${issueType}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Open"),"#,##0"),0)`);

    // Resolved (Settled + Denied + Closed)
    sheet.getRange(dataRow, 4).setFormula(`=IFERROR(TEXT(COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${issueType}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")+COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${issueType}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Denied")+COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${issueType}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Closed"),"#,##0"),0)`);

    // Win Rate %
    sheet.getRange(dataRow, 5).setFormula(`=IFERROR(TEXT(COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${issueType}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")/(COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${issueType}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")+COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${issueType}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Denied")),"0%"),"N/A")`);

    // Avg Days
    sheet.getRange(dataRow, 6).setFormula(`=IFERROR(ROUND(AVERAGEIFS('Grievance Log'!$${cols.gDaysOpen}:$${cols.gDaysOpen},'Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${issueType}*",'Grievance Log'!$${cols.gDaysOpen}:$${cols.gDaysOpen},">0"),0),"N/A")`);

    // Top Location - simplified to avoid #ERROR!
    sheet.getRange(dataRow, 7).setValue("-");

    // Top Article - simplified to avoid #ERROR!
    sheet.getRange(dataRow, 8).setValue("-");

    // Trend
    sheet.getRange(dataRow, 9).setFormula(`=IF(B${dataRow}>0,"📊 Active","➖ None")`);

    // Priority Level
    sheet.getRange(dataRow, 10).setFormula(`=IF(C${dataRow}>5,"🔴 High",IF(C${dataRow}>2,"🟡 Medium","🟢 Low"))`);

    // Notes
    sheet.getRange(dataRow, 11).setValue("");
  }

  sheet.getRange(startRow + 2, 2, issueTypes.length, 9).setHorizontalAlignment("center");
}

/**
 * Creates the Member Engagement section with dynamic columns
 */
function createMemberEngagementSectionDynamic(sheet, startRow, cols) {
  // Section header
  sheet.getRange(`A${startRow}:L${startRow}`).merge()
    .setValue("👥 MEMBER ENGAGEMENT")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_PURPLE)
    .setFontColor("white");

  // Column headers
  const headers = ["Metric", "Current Value", "Target", "Status", "Trend",
                   "Last Updated", "Owner", "Notes", "", "", ""];
  sheet.getRange(startRow + 1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Engagement metrics
  const metrics = [
    {name: "Total Members", formula: `=IFERROR(TEXT(MAX(0,COUNTA('Member Directory'!$${cols.mMemberId}:$${cols.mMemberId})-1),"#,##0"),0)`, target: "20,000"},
    {name: "Active Stewards", formula: `=IFERROR(TEXT(COUNTIF('Member Directory'!$${cols.mIsSteward}:$${cols.mIsSteward},"Yes"),"#,##0"),0)`, target: "50"},
    {name: "Members with Open Grievances", formula: `=IFERROR(TEXT(COUNTIF('Member Directory'!$${cols.mHasOpenGrievance}:$${cols.mHasOpenGrievance},"Yes"),"#,##0"),0)`, target: "<100"},
    {name: "Virtual Meetings (30d)", formula: `=IFERROR(TEXT(COUNTIFS('Member Directory'!$${cols.mLastVirtualMtg}:$${cols.mLastVirtualMtg},">="&TODAY()-30,'Member Directory'!$${cols.mLastVirtualMtg}:$${cols.mLastVirtualMtg},"<>"),"#,##0"),0)`, target: "100"},
    {name: "In-Person Meetings (30d)", formula: `=IFERROR(TEXT(COUNTIFS('Member Directory'!$${cols.mLastInPersonMtg}:$${cols.mLastInPersonMtg},">="&TODAY()-30,'Member Directory'!$${cols.mLastInPersonMtg}:$${cols.mLastInPersonMtg},"<>"),"#,##0"),0)`, target: "50"},
    {name: "Avg Email Open Rate", formula: `=IFERROR(TEXT(AVERAGE('Member Directory'!$${cols.mOpenRate}:$${cols.mOpenRate}),"0%"),"-")`, target: "50%"},
    {name: "Total Volunteer Hours", formula: `=IFERROR(TEXT(SUM('Member Directory'!$${cols.mVolunteerHours}:$${cols.mVolunteerHours}),"#,##0"),0)`, target: "500"},
    {name: "Interested in Local Actions", formula: `=IFERROR(TEXT(COUNTIF('Member Directory'!$${cols.mInterestLocal}:$${cols.mInterestLocal},"Yes"),"#,##0"),0)`, target: "5,000"},
    {name: "Interested in Chapter Actions", formula: `=IFERROR(TEXT(COUNTIF('Member Directory'!$${cols.mInterestChapter}:$${cols.mInterestChapter},"Yes"),"#,##0"),0)`, target: "3,000"},
    {name: "Interested in Allied Actions", formula: `=IFERROR(TEXT(COUNTIF('Member Directory'!$${cols.mInterestAllied}:$${cols.mInterestAllied},"Yes"),"#,##0"),0)`, target: "1,000"},
    {name: "Recent Steward Contacts (7d)", formula: `=IFERROR(TEXT(COUNTIFS('Member Directory'!$${cols.mRecentContactDate}:$${cols.mRecentContactDate},">="&TODAY()-7,'Member Directory'!$${cols.mRecentContactDate}:$${cols.mRecentContactDate},"<>"),"#,##0"),0)`, target: "50"}
  ];

  for (let i = 0; i < metrics.length; i++) {
    const dataRow = startRow + 2 + i;
    const metric = metrics[i];

    sheet.getRange(dataRow, 1).setValue(metric.name);
    sheet.getRange(dataRow, 2).setFormula(metric.formula);
    sheet.getRange(dataRow, 3).setValue(metric.target);
    sheet.getRange(dataRow, 4).setFormula(`=IF(ISNUMBER(VALUE(SUBSTITUTE(SUBSTITUTE(B${dataRow},",",""),"%",""))),IF(VALUE(SUBSTITUTE(SUBSTITUTE(B${dataRow},",",""),"%",""))>=VALUE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(C${dataRow},"<",""),",",""),"%","")),"✅ On Track","⚠️ Below"),"📊 Tracking")`);
    sheet.getRange(dataRow, 5).setValue("➡️");
    sheet.getRange(dataRow, 6).setFormula(`=TEXT(NOW(),"MM/dd/yyyy")`);
    sheet.getRange(dataRow, 7).setValue("System");
    sheet.getRange(dataRow, 8).setValue("");
  }

  sheet.getRange(startRow + 2, 2, metrics.length, 6).setHorizontalAlignment("center");
}

/**
 * Creates the Cost Impact section with dynamic columns
 */
function createCostImpactSectionDynamic(sheet, startRow, cols) {
  // Section header
  sheet.getRange(`A${startRow}:L${startRow}`).merge()
    .setValue("💰 COST IMPACT ANALYSIS")
    .setFontSize(14)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBackground(COLORS.ACCENT_ORANGE)
    .setFontColor("white");

  // Column headers
  const headers = ["Category", "Total Cases", "Settled", "Value Recovered",
                   "Avg Per Case", "Members Helped", "Win Rate", "Status", "YTD Total", "Notes"];
  sheet.getRange(startRow + 1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(COLORS.LIGHT_GRAY);

  // Cost impact categories - estimate $500-$2000 per settled grievance
  const categories = [
    {name: "Pay Issues", avgValue: 1500},
    {name: "Benefits", avgValue: 2000},
    {name: "Discipline (Overturned)", avgValue: 1000},
    {name: "Workload Adjustments", avgValue: 500},
    {name: "Safety Improvements", avgValue: 750},
    {name: "Other Resolutions", avgValue: 500}
  ];

  let totalRow = startRow + 2 + categories.length;

  for (let i = 0; i < categories.length; i++) {
    const dataRow = startRow + 2 + i;
    const cat = categories[i];
    const searchTerm = cat.name.split(" ")[0]; // First word for matching

    sheet.getRange(dataRow, 1).setValue(cat.name);

    // Total Cases matching category
    sheet.getRange(dataRow, 2).setFormula(`=IFERROR(TEXT(COUNTIF('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${searchTerm}*"),"#,##0"),0)`);

    // Settled Cases
    sheet.getRange(dataRow, 3).setFormula(`=IFERROR(TEXT(COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${searchTerm}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled"),"#,##0"),0)`);

    // Value Recovered (Settled * Avg Value)
    sheet.getRange(dataRow, 4).setFormula(`=IFERROR(TEXT(COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${searchTerm}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")*${cat.avgValue},"$#,##0"),0)`);

    // Avg Per Case
    sheet.getRange(dataRow, 5).setValue(`$${cat.avgValue.toLocaleString()}`);

    // Members Helped (same as settled)
    sheet.getRange(dataRow, 6).setFormula(`=C${dataRow}`);

    // Win Rate
    sheet.getRange(dataRow, 7).setFormula(`=IFERROR(TEXT(COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${searchTerm}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")/(COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${searchTerm}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")+COUNTIFS('Grievance Log'!$${cols.gIssueCategory}:$${cols.gIssueCategory},"*${searchTerm}*",'Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Denied")),"0%"),"N/A")`);

    // Status
    sheet.getRange(dataRow, 8).setFormula(`=IF(C${dataRow}>0,"✅ Savings","➖ No Data")`);

    // YTD Total
    sheet.getRange(dataRow, 9).setFormula(`=D${dataRow}`);

    // Notes
    sheet.getRange(dataRow, 10).setValue("");
  }

  // Total row
  sheet.getRange(totalRow, 1).setValue("TOTAL IMPACT").setFontWeight("bold");
  sheet.getRange(totalRow, 2).setFormula(`=IFERROR(TEXT(SUM(B${startRow + 2}:B${totalRow - 1}),"#,##0"),0)`);
  sheet.getRange(totalRow, 3).setFormula(`=IFERROR(TEXT(SUM(C${startRow + 2}:C${totalRow - 1}),"#,##0"),0)`);
  sheet.getRange(totalRow, 4).setFormula(`=IFERROR(TEXT(SUMPRODUCT(--SUBSTITUTE(SUBSTITUTE(D${startRow + 2}:D${totalRow - 1},"$",""),",","")),"$#,##0"),0)`);
  sheet.getRange(totalRow, 5).setValue("-");
  sheet.getRange(totalRow, 6).setFormula(`=IFERROR(TEXT(SUM(F${startRow + 2}:F${totalRow - 1}),"#,##0"),0)`);
  sheet.getRange(totalRow, 7).setFormula(`=IFERROR(TEXT(COUNTIF('Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")/(COUNTIF('Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Settled")+COUNTIF('Grievance Log'!$${cols.gStatus}:$${cols.gStatus},"Denied")),"0%"),"0%")`);
  sheet.getRange(totalRow, 8).setValue("📊 YTD");
  sheet.getRange(totalRow, 9).setFormula(`=D${totalRow}`);
  sheet.getRange(totalRow, 10).setValue("");
  sheet.getRange(totalRow, 1, 1, 10).setBackground(COLORS.SUCCESS_LIGHT).setFontWeight("bold");

  sheet.getRange(startRow + 2, 2, categories.length + 1, 8).setHorizontalAlignment("center");
}

/**
 * Populates Operations Analytics with live data
 * Called after dashboard creation to refresh formulas
 */
function populateOperationsAnalytics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.OPERATIONS_ANALYTICS);

  if (!sheet) {
    Logger.log("Operations Analytics sheet not found - skipping population");
    return;
  }

  // Force formula recalculation
  SpreadsheetApp.flush();
  Logger.log("Operations Analytics populated with live data");
}

/**
 * Deletes standalone analytics tabs that are now merged into Operations Analytics
 * Call this after creating the merged Operations Analytics sheet
 */
function deleteStandaloneAnalyticsTabs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const tabsToDelete = [
    SHEETS.TRENDS,           // 📈 Trends & Timeline
    SHEETS.LOCATION,         // 🗺️ Location Analytics
    SHEETS.TYPE_ANALYSIS,    // 📊 Type Analysis
    SHEETS.MEMBER_ENGAGEMENT, // 👥 Member Engagement
    SHEETS.COST_IMPACT       // 💰 Cost Impact
  ];

  let deletedCount = 0;

  for (const tabName of tabsToDelete) {
    const sheet = ss.getSheetByName(tabName);
    if (sheet) {
      try {
        ss.deleteSheet(sheet);
        Logger.log(`Deleted standalone tab: ${tabName}`);
        deletedCount++;
      } catch (e) {
        Logger.log(`Could not delete ${tabName}: ${e.message}`);
      }
    }
  }

  Logger.log(`Deleted ${deletedCount} standalone analytics tabs`);
  return deletedCount;
}
