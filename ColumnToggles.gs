/**
 * ------------------------------------------------------------------------====
 * COLUMN VISIBILITY TOGGLES
 * ------------------------------------------------------------------------====
 *
 * Functions to show/hide column groups in Member Directory
 * - Engagement Metrics toggle (Q-T: Last Virtual Mtg, Last In-Person Mtg, Open Rate, Volunteer Hours)
 * - Member Interests toggle (U-X: Interest Local, Interest Chapter, Interest Allied, Home Town)
 * - Level 2 columns toggle
 *
 * ------------------------------------------------------------------------====
 */

/**
 * Toggles visibility of Engagement Metrics columns in Member Directory
 * Columns Q-T: Last Virtual Mtg, Last In-Person Mtg, Open Rate, Volunteer Hours
 */
function toggleEngagementMetricsColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('❌ Member Directory sheet not found!');
    return;
  }

  // Engagement Metrics: columns 17-20 (Q-T)
  const firstCol = MEMBER_COLS.LAST_VIRTUAL_MTG;  // 17
  const numCols = 4;  // LAST_VIRTUAL_MTG, LAST_INPERSON_MTG, OPEN_RATE, VOLUNTEER_HOURS

  const isHidden = sheet.isColumnHiddenByUser(firstCol);

  if (isHidden) {
    sheet.showColumns(firstCol, numCols);
    SpreadsheetApp.getUi().alert('✅ Engagement Metrics columns are now visible');
  } else {
    sheet.hideColumns(firstCol, numCols);
    SpreadsheetApp.getUi().alert('✅ Engagement Metrics columns are now hidden');
  }
}

/**
 * Toggles visibility of Member Interests columns in Member Directory
 * Columns U-X: Interest Local, Interest Chapter, Interest Allied, Home Town
 */
function toggleMemberInterestsColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('❌ Member Directory sheet not found!');
    return;
  }

  // Member Interests: columns 21-24 (U-X)
  const firstCol = MEMBER_COLS.INTEREST_LOCAL;  // 21
  const numCols = 4;  // INTEREST_LOCAL, INTEREST_CHAPTER, INTEREST_ALLIED, HOME_TOWN

  const isHidden = sheet.isColumnHiddenByUser(firstCol);

  if (isHidden) {
    sheet.showColumns(firstCol, numCols);
    SpreadsheetApp.getUi().alert('✅ Member Interests columns are now visible');
  } else {
    sheet.hideColumns(firstCol, numCols);
    SpreadsheetApp.getUi().alert('✅ Member Interests columns are now hidden');
  }
}

/**
 * Toggles visibility of both Engagement Metrics and Member Interests columns
 */
function toggleEngagementAndInterestsColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('❌ Member Directory sheet not found!');
    return;
  }

  // Check if Engagement Metrics columns are hidden (use first column as indicator)
  const engagementHidden = sheet.isColumnHiddenByUser(MEMBER_COLS.LAST_VIRTUAL_MTG);
  const interestsHidden = sheet.isColumnHiddenByUser(MEMBER_COLS.INTEREST_LOCAL);

  // If both are hidden, show both. Otherwise hide both.
  if (engagementHidden && interestsHidden) {
    sheet.showColumns(MEMBER_COLS.LAST_VIRTUAL_MTG, 4);
    sheet.showColumns(MEMBER_COLS.INTEREST_LOCAL, 4);
    SpreadsheetApp.getUi().alert('✅ Engagement Metrics & Member Interests columns are now visible');
  } else {
    sheet.hideColumns(MEMBER_COLS.LAST_VIRTUAL_MTG, 4);
    sheet.hideColumns(MEMBER_COLS.INTEREST_LOCAL, 4);
    SpreadsheetApp.getUi().alert('✅ Engagement Metrics & Member Interests columns are now hidden');
  }
}

/**
 * Toggles visibility of Level 2 (engagement tracking) columns in Member Directory
 */
function toggleLevel2Columns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('❌ Member Directory sheet not found!');
    return;
  }

  // Level 2 columns start after the standard Member Directory columns
  // Uses MEMBER_COLS.START_GRIEVANCE (31) + 3 for dynamic positioning
  // This gives 2 buffer columns (AF, AG) before Level 2 starts
  const firstLevel2Col = MEMBER_COLS.START_GRIEVANCE + 3;

  // Count: 14 Level 2 columns (extended engagement tracking)
  const numCols = 14;

  // Check if the Level 2 columns exist
  const lastCol = sheet.getLastColumn();
  if (lastCol < firstLevel2Col) {
    SpreadsheetApp.getUi().alert('❌ Level 2 columns have not been added yet.\n\nPlease run "Create Dashboard" to add Level 2 columns.');
    return;
  }

  // Check if columns are currently hidden
  const isHidden = sheet.isColumnHiddenByUser(firstLevel2Col);

  if (isHidden) {
    // Show columns
    sheet.showColumns(firstLevel2Col, numCols);
    SpreadsheetApp.getUi().alert('✅ Level 2 columns are now visible');
  } else {
    // Hide columns
    sheet.hideColumns(firstLevel2Col, numCols);
    SpreadsheetApp.getUi().alert('✅ Level 2 columns are now hidden');
  }
}

/**
 * Shows all hidden columns in Member Directory
 */
function showAllMemberColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('❌ Member Directory sheet not found!');
    return;
  }

  const lastCol = sheet.getLastColumn();

  // Show all columns
  for (let i = 1; i <= lastCol; i++) {
    if (sheet.isColumnHiddenByUser(i)) {
      sheet.showColumns(i);
    }
  }

  SpreadsheetApp.getUi().alert('✅ All columns are now visible');
}

/* ==================== GRIEVANCE LOG COLUMN TOGGLES ==================== */

/**
 * Toggles visibility of Admin Message columns in Grievance Log
 * Columns AD-AF: Admin Flag, Admin Message, Acknowledged
 */
function toggleAdminMessageColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Grievance Log sheet not found!');
    return;
  }

  // Admin Message columns: 30-32 (AD-AF)
  const firstCol = GRIEVANCE_COLS.ADMIN_FLAG;  // 30
  const numCols = 3;  // ADMIN_FLAG, ADMIN_MESSAGE, MESSAGE_ACKNOWLEDGED

  // Check if columns exist
  const lastCol = sheet.getLastColumn();
  if (lastCol < firstCol) {
    // Columns don't exist yet - set them up
    const response = SpreadsheetApp.getUi().alert(
      'Admin Message columns not found',
      'Would you like to set up the Admin Message columns now?',
      SpreadsheetApp.getUi().ButtonSet.YES_NO
    );

    if (response === SpreadsheetApp.getUi().Button.YES) {
      setupAdminMessageColumns();
    }
    return;
  }

  const isHidden = sheet.isColumnHiddenByUser(firstCol);

  if (isHidden) {
    sheet.showColumns(firstCol, numCols);
    SpreadsheetApp.getUi().alert('Admin Message columns are now visible (AD-AF)');
  } else {
    sheet.hideColumns(firstCol, numCols);
    SpreadsheetApp.getUi().alert('Admin Message columns are now hidden');
  }
}

/**
 * Shows all hidden columns in Grievance Log
 */
function showAllGrievanceColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  if (!sheet) {
    SpreadsheetApp.getUi().alert('Grievance Log sheet not found!');
    return;
  }

  const lastCol = sheet.getLastColumn();

  // Show all columns
  for (let i = 1; i <= lastCol; i++) {
    if (sheet.isColumnHiddenByUser(i)) {
      sheet.showColumns(i);
    }
  }

  SpreadsheetApp.getUi().alert('All Grievance Log columns are now visible');
}
