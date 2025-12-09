/**
 * ------------------------------------------------------------------------====
 * MEMBER DIRECTORY DROPDOWNS
 * ------------------------------------------------------------------------====
 *
 * Adds data validation dropdowns to Member Directory for consistent data entry.
 * All dropdown values are pulled from the Config sheet for easy customization.
 *
 * SINGLE-SELECT DROPDOWNS (allow free-form text entry):
 * - Job Title (D)
 * - Work Location (E)
 * - Unit (F)
 * - Is Steward (N)
 * - Supervisor Name (L)
 * - Manager Name (M)
 * - Assigned Steward (P)
 * - Contact Steward (Z)
 * - Has Open Grievance? (AB)
 *
 * MULTI-SELECT DROPDOWNS (comma-separated values allowed, free-form text):
 * - Office Days (G)
 * - Preferred Communication (J)
 * - Best Time to Contact (K)
 * - Committees (O)
 *
 * NOTE: All dropdowns allow free-form text entry (setAllowInvalid = true)
 * to support custom values not in the Config list.
 *
 * DATE FIELDS:
 * - Recent Contact Date (Y) - Date validation only
 *
 * ------------------------------------------------------------------------====
 */

/**
 * Sets up all dropdowns for the Member Directory
 * Pulls values from Config sheet where available
 */
function setupMemberDirectoryDropdowns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);

  if (!memberSheet) {
    SpreadsheetApp.getUi().alert('Member Directory sheet not found!');
    return;
  }

  if (!configSheet) {
    SpreadsheetApp.getUi().alert('Config sheet not found! Dropdowns require a Config sheet.');
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('Setting up dropdowns...', 'Please wait', -1);

  try {
    // Cap at 21000 to match ARRAYFORMULA limit (prevents validation beyond data range)
    const lastRow = Math.min(Math.max(memberSheet.getLastRow(), 1000), 21000);

    // ==================== SINGLE-SELECT DROPDOWNS (allow free-form text) ====================

    // Job Title (Column D / MEMBER_COLS.JOB_TITLE)
    const jobTitles = getConfigValuesFromSheet(configSheet, CONFIG_COLS.JOB_TITLES);
    if (jobTitles.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.JOB_TITLE, lastRow, jobTitles, 'Job Title', false);
    }

    // Work Location (Column E / MEMBER_COLS.WORK_LOCATION)
    const locations = getConfigValuesFromSheet(configSheet, CONFIG_COLS.OFFICE_LOCATIONS);
    if (locations.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.WORK_LOCATION, lastRow, locations, 'Work Location', false);
    }

    // Unit (Column F / MEMBER_COLS.UNIT)
    const units = getConfigValuesFromSheet(configSheet, CONFIG_COLS.UNITS);
    if (units.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.UNIT, lastRow, units, 'Unit', false);
    }

    // Is Steward (Column N / MEMBER_COLS.IS_STEWARD)
    const yesNo = getConfigValuesFromSheet(configSheet, CONFIG_COLS.YES_NO);
    if (yesNo.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.IS_STEWARD, lastRow, yesNo, 'Is Steward', false);
    }

    // Supervisor Name (Column L / MEMBER_COLS.SUPERVISOR)
    const supervisors = getConfigValuesFromSheet(configSheet, CONFIG_COLS.SUPERVISORS);
    if (supervisors.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.SUPERVISOR, lastRow, supervisors, 'Supervisor', false);
    }

    // Manager Name (Column M / MEMBER_COLS.MANAGER)
    const managers = getConfigValuesFromSheet(configSheet, CONFIG_COLS.MANAGERS);
    if (managers.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.MANAGER, lastRow, managers, 'Manager', false);
    }

    // Assigned Steward (Column P / MEMBER_COLS.ASSIGNED_STEWARD)
    const stewards = getStewardsList();
    if (stewards.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.ASSIGNED_STEWARD, lastRow, stewards, 'Assigned Steward', false);
    }

    // Contact Steward (Column Z / MEMBER_COLS.CONTACT_STEWARD)
    if (stewards.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.CONTACT_STEWARD, lastRow, stewards, 'Contact Steward', false);
    }

    // Has Open Grievance? (Column AB / MEMBER_COLS.HAS_OPEN_GRIEVANCE)
    if (yesNo.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.HAS_OPEN_GRIEVANCE, lastRow, yesNo, 'Has Open Grievance?', false);
    }

    // ==================== MULTI-SELECT DROPDOWNS ====================
    // These allow comma-separated values (setAllowInvalid = true)

    // Office Days (Column G / MEMBER_COLS.OFFICE_DAYS) - MULTI-SELECT
    const officeDays = getConfigValuesFromSheet(configSheet, CONFIG_COLS.OFFICE_DAYS);
    if (officeDays.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.OFFICE_DAYS, lastRow, officeDays, 'Office Days', false);
    }

    // Preferred Communication (Column J / MEMBER_COLS.PREFERRED_COMM) - MULTI-SELECT
    const commMethods = getConfigValuesFromSheet(configSheet, CONFIG_COLS.COMM_METHODS);
    if (commMethods.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.PREFERRED_COMM, lastRow, commMethods, 'Preferred Communication', false);
    }

    // Best Time to Contact (Column K / MEMBER_COLS.BEST_TIME) - MULTI-SELECT
    const bestTimes = getConfigValuesFromSheet(configSheet, CONFIG_COLS.BEST_TIMES);
    if (bestTimes.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.BEST_TIME, lastRow, bestTimes, 'Best Time to Contact', false);
    }

    // Committees (Column O / MEMBER_COLS.COMMITTEES) - MULTI-SELECT
    const committees = getConfigValuesFromSheet(configSheet, CONFIG_COLS.STEWARD_COMMITTEES);
    if (committees.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.COMMITTEES, lastRow, committees, 'Committees', false);
    }

    // ==================== DATE VALIDATION ====================

    // Recent Contact Date (Column Y / MEMBER_COLS.RECENT_CONTACT_DATE) - DATE ONLY
    setDateValidation(memberSheet, MEMBER_COLS.RECENT_CONTACT_DATE, lastRow, 'Recent Contact Date');

    SpreadsheetApp.getActiveSpreadsheet().toast('Dropdowns set up successfully!', 'Complete', 3);

    SpreadsheetApp.getUi().alert(
      'Dropdowns Setup Complete',
      'Data validation dropdowns have been added to the Member Directory.\n\n' +
      'Single-select fields: Job Title, Work Location, Unit, Is Steward, Supervisor, Manager, Assigned Steward, Contact Steward, Has Open Grievance?\n\n' +
      'Multi-select fields (comma-separated): Office Days, Preferred Communication, Best Time to Contact, Committees\n\n' +
      'Date fields: Recent Contact Date\n\n' +
      'To customize dropdown options, edit the Config sheet.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );

  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    Logger.log('Error setting up dropdowns: ' + error);
  }
}

/**
 * Sets up dropdowns for the Grievance Log
 * Includes Issue Category, Articles Violated, Status, Step, etc.
 */
function setupGrievanceLogDropdowns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);

  if (!grievanceSheet) {
    SpreadsheetApp.getUi().alert('Grievance Log sheet not found!');
    return;
  }

  if (!configSheet) {
    SpreadsheetApp.getUi().alert('Config sheet not found!');
    return;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('Setting up Grievance Log dropdowns...', 'Please wait', -1);

  try {
    // Cap at 6000 to match grievance capacity (5k grievances + buffer)
    const lastRow = Math.min(Math.max(grievanceSheet.getLastRow(), 500), 6000);

    // Status (Column E / GRIEVANCE_COLS.STATUS = 5) - SINGLE-SELECT (allow free-form)
    const statuses = getConfigValuesFromSheet(configSheet, CONFIG_COLS.GRIEVANCE_STATUS);
    if (statuses.length > 0) {
      setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.STATUS, lastRow, statuses, 'Status', false);
    }

    // Current Step (Column F / GRIEVANCE_COLS.CURRENT_STEP = 6) - SINGLE-SELECT (allow free-form)
    const steps = getConfigValuesFromSheet(configSheet, CONFIG_COLS.GRIEVANCE_STEP);
    if (steps.length > 0) {
      setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.CURRENT_STEP, lastRow, steps, 'Current Step', false);
    }

    // Articles Violated (Column V / GRIEVANCE_COLS.ARTICLES = 22) - MULTI-SELECT
    const articles = getConfigValuesFromSheet(configSheet, CONFIG_COLS.ARTICLES_VIOLATED);
    if (articles.length > 0) {
      setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.ARTICLES, lastRow, articles, 'Articles Violated', false);
    }

    // Issue Category (Column W / GRIEVANCE_COLS.ISSUE_CATEGORY = 23) - MULTI-SELECT
    const issueCategories = getConfigValuesFromSheet(configSheet, CONFIG_COLS.ISSUE_CATEGORY);
    if (issueCategories.length > 0) {
      setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.ISSUE_CATEGORY, lastRow, issueCategories, 'Issue Category', false);
    }

    // Steward (Column AA / GRIEVANCE_COLS.STEWARD = 27) - MULTI-SELECT (can have multiple stewards)
    const stewards = getStewardsList();
    if (stewards.length > 0) {
      setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.STEWARD, lastRow, stewards, 'Assigned Steward', false);
    }

    SpreadsheetApp.getActiveSpreadsheet().toast('Grievance Log dropdowns set up!', 'Complete', 3);

  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    Logger.log('Error setting up Grievance Log dropdowns: ' + error);
  }
}

/**
 * Gets values from a column in the Config sheet (sheet-based version)
 * NOTE: This is different from getConfigColumnValues in Code.gs which takes columnIndex only.
 * @param {Sheet} configSheet - The Config sheet
 * @param {number} colNum - Column number (1-indexed)
 * @returns {Array} Array of non-empty values
 */
function getConfigValuesFromSheet(configSheet, colNum) {
  try {
    const lastRow = configSheet.getLastRow();
    if (lastRow < 2) return [];

    const values = configSheet.getRange(2, colNum, lastRow - 1, 1).getValues();
    return values
      .map(function(row) { return row[0]; })
      .filter(function(val) { return val !== '' && val !== null && val !== undefined; })
      .map(function(val) { return String(val).trim(); });
  } catch (error) {
    Logger.log('Error getting config values from column ' + colNum + ': ' + error.message);
    return [];
  }
}

/**
 * Sets a dropdown validation rule on a column using MEMBER_COLS/GRIEVANCE_COLS constant
 * @param {Sheet} sheet - The sheet to apply the dropdown to
 * @param {number} colNum - Column number (1-indexed, from constants)
 * @param {number} lastRow - Last row to apply validation
 * @param {Array} values - Array of values for dropdown
 * @param {string} name - Name for logging
 * @param {boolean} strictValidation - If true, only allow list values; if false, allow other values (for multi-select)
 */
function setDropdownByCol(sheet, colNum, lastRow, values, name, strictValidation) {
  try {
    const colLetter = getColumnLetter(colNum);
    const range = sheet.getRange(`${colLetter}2:${colLetter}${lastRow}`);

    // Google Sheets has a 500 item limit for requireValueInList
    // For larger lists, use requireValueInRange with a helper column in Config
    if (values.length > 500) {
      Logger.log(`${name} has ${values.length} items (>500 limit). Using range reference instead.`);

      // Write values to a dynamic range in Config sheet and use range reference
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const configSheet = ss.getSheetByName(SHEETS.CONFIG);

      if (configSheet) {
        // Use CONFIG_COLS.STEWARDS for steward-related dropdowns
        const targetCol = CONFIG_COLS.STEWARDS;

        // Clear existing values and write new ones (starting from row 2 to preserve header)
        const existingLastRow = configSheet.getLastRow();
        if (existingLastRow > 1) {
          configSheet.getRange(2, targetCol, Math.max(existingLastRow - 1, 1), 1).clearContent();
        }

        // Limit values for large lists to prevent API errors
        // Google Sheets has limits on data validation and cell writes
        const MAX_DROPDOWN_VALUES = 2000;
        let valuesToUse = values;
        if (values.length > MAX_DROPDOWN_VALUES) {
          Logger.log(`${name} has ${values.length} items - limiting to ${MAX_DROPDOWN_VALUES} for dropdown`);
          valuesToUse = values.slice(0, MAX_DROPDOWN_VALUES);
          valuesToUse.push('(More options available)');
        }

        // Write values in batches to avoid "Argument too large" error
        const BATCH_SIZE = 500;
        const valuesToWrite = valuesToUse.map(function(v) { return [v]; });

        for (let i = 0; i < valuesToWrite.length; i += BATCH_SIZE) {
          const batchEnd = Math.min(i + BATCH_SIZE, valuesToWrite.length);
          const batch = valuesToWrite.slice(i, batchEnd);
          configSheet.getRange(2 + i, targetCol, batch.length, 1).setValues(batch);

          // Flush periodically for large writes
          if (valuesToWrite.length > 1000 && i > 0 && i % 1000 === 0) {
            SpreadsheetApp.flush();
          }
        }

        // Create validation using range reference
        const configRange = configSheet.getRange(2, targetCol, valuesToUse.length, 1);
        const rule = SpreadsheetApp.newDataValidation()
          .requireValueInRange(configRange, true)
          .setAllowInvalid(!strictValidation)
          .build();

        range.setDataValidation(rule);
        Logger.log(`Set dropdown for ${name} (column ${colLetter}): ${valuesToUse.length} options via range reference, strict=${strictValidation}`);
      } else {
        // Fallback: use text validation with help text
        const rule = SpreadsheetApp.newDataValidation()
          .requireTextContains('')
          .setAllowInvalid(true)
          .setHelpText(`Select a ${name}. ${values.length} options available.`)
          .build();
        range.setDataValidation(rule);
        Logger.log(`Set text validation for ${name} (column ${colLetter}): ${values.length} options (no dropdown due to limit)`);
      }
    } else {
      // Standard approach for <= 500 items
      const rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(values, true)
        .setAllowInvalid(!strictValidation)
        .build();

      range.setDataValidation(rule);
      Logger.log(`Set dropdown for ${name} (column ${colLetter}): ${values.length} options, strict=${strictValidation}`);
    }
  } catch (error) {
    Logger.log(`Error setting dropdown for ${name}: ${error.message}`);
  }
}

/**
 * Sets date validation on a column
 * @param {Sheet} sheet - The sheet to apply validation to
 * @param {number} colNum - Column number (1-indexed)
 * @param {number} lastRow - Last row to apply validation
 * @param {string} name - Name for logging
 */
function setDateValidation(sheet, colNum, lastRow, name) {
  try {
    const colLetter = getColumnLetter(colNum);
    const range = sheet.getRange(`${colLetter}2:${colLetter}${lastRow}`);

    const rule = SpreadsheetApp.newDataValidation()
      .requireDate()
      .setAllowInvalid(false)
      .setHelpText('Please enter a valid date')
      .build();

    range.setDataValidation(rule);

    // Also set the number format to date
    range.setNumberFormat('MM/dd/yyyy');

    Logger.log(`Set date validation for ${name} (column ${colLetter})`);
  } catch (error) {
    Logger.log(`Error setting date validation for ${name}: ${error.message}`);
  }
}

/**
 * Gets list of stewards from Member Directory
 * @returns {Array} Array of steward names
 */
function getStewardsList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);

  if (!memberSheet) return [];

  try {
    const lastRow = memberSheet.getLastRow();
    if (lastRow < 2) return [];

    // Get first name, last name, and is_steward columns
    const firstNameCol = MEMBER_COLS.FIRST_NAME;
    const lastNameCol = MEMBER_COLS.LAST_NAME;
    const isStewardCol = MEMBER_COLS.IS_STEWARD;

    const maxCol = Math.max(firstNameCol, lastNameCol, isStewardCol);
    const data = memberSheet.getRange(2, 1, lastRow - 1, maxCol).getValues();

    const stewards = data
      .filter(function(row) {
        const isSteward = row[isStewardCol - 1];
        return isSteward === 'Yes' || isSteward === 'Y' || isSteward === true;
      })
      .map(function(row) {
        const firstName = row[firstNameCol - 1] || '';
        const lastName = row[lastNameCol - 1] || '';
        return `${firstName} ${lastName}`.trim();
      })
      .filter(function(name) { return name !== '' && name !== ' '; });

    // Sort alphabetically
    stewards.sort();

    // Add "Other" option at the end
    if (stewards.length > 0) {
      stewards.push('Other');
    } else {
      return ['No stewards found', 'Other'];
    }

    return stewards;

  } catch (error) {
    Logger.log('Error getting stewards list: ' + error.message);
    return ['Error loading stewards', 'Other'];
  }
}

/**
 * Refreshes the steward dropdowns based on current steward list
 */
function refreshStewardDropdowns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

  const stewards = getStewardsList();

  if (stewards.length === 0) {
    SpreadsheetApp.getUi().alert('No stewards found in Member Directory!');
    return;
  }

  let updated = 0;

  // Update Member Directory steward dropdowns
  if (memberSheet) {
    // Cap at 21000 to match ARRAYFORMULA limit
    const lastRow = Math.min(Math.max(memberSheet.getLastRow(), 1000), 21000);

    // Assigned Steward (allow free-form)
    setDropdownByCol(memberSheet, MEMBER_COLS.ASSIGNED_STEWARD, lastRow, stewards, 'Assigned Steward', false);
    updated++;

    // Contact Steward (allow free-form)
    setDropdownByCol(memberSheet, MEMBER_COLS.CONTACT_STEWARD, lastRow, stewards, 'Contact Steward', false);
    updated++;
  }

  // Update Grievance Log steward dropdown (multi-select)
  if (grievanceSheet) {
    // Cap at 6000 to match grievance capacity
    const lastRow = Math.min(Math.max(grievanceSheet.getLastRow(), 500), 6000);
    setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.STEWARD, lastRow, stewards, 'Grievance Steward', false);
    updated++;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `Refreshed ${updated} steward dropdown(s) with ${stewards.length - 1} stewards`,
    'Steward Dropdowns Updated',
    3
  );
}

/**
 * Sets up all dropdowns for both Member Directory and Grievance Log
 */
function setupAllDropdowns() {
  setupMemberDirectoryDropdowns();
  setupGrievanceLogDropdowns();

  SpreadsheetApp.getUi().alert(
    'All Dropdowns Setup Complete',
    'Dropdowns have been configured for both Member Directory and Grievance Log sheets.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Silent version of setupMemberDirectoryDropdowns - no alerts
 * Used after seeding to re-apply dropdowns
 */
function setupMemberDirectoryDropdownsSilent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const memberSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);

  if (!memberSheet || !configSheet) {
    Logger.log('Silent Member dropdown setup: Sheet not found');
    return;
  }

  try {
    // Cap at 21000 to match ARRAYFORMULA limit
    const lastRow = Math.min(Math.max(memberSheet.getLastRow(), 1000), 21000);

    // Job Title (allow free-form)
    const jobTitles = getConfigValuesFromSheet(configSheet, CONFIG_COLS.JOB_TITLES);
    if (jobTitles.length > 0) setDropdownByCol(memberSheet, MEMBER_COLS.JOB_TITLE, lastRow, jobTitles, 'Job Title', false);

    // Work Location (allow free-form)
    const locations = getConfigValuesFromSheet(configSheet, CONFIG_COLS.OFFICE_LOCATIONS);
    if (locations.length > 0) setDropdownByCol(memberSheet, MEMBER_COLS.WORK_LOCATION, lastRow, locations, 'Work Location', false);

    // Unit (allow free-form)
    const units = getConfigValuesFromSheet(configSheet, CONFIG_COLS.UNITS);
    if (units.length > 0) setDropdownByCol(memberSheet, MEMBER_COLS.UNIT, lastRow, units, 'Unit', false);

    // Is Steward (allow free-form)
    const yesNo = getConfigValuesFromSheet(configSheet, CONFIG_COLS.YES_NO);
    if (yesNo.length > 0) setDropdownByCol(memberSheet, MEMBER_COLS.IS_STEWARD, lastRow, yesNo, 'Is Steward', false);

    // Supervisor (allow free-form)
    const supervisors = getConfigValuesFromSheet(configSheet, CONFIG_COLS.SUPERVISORS);
    if (supervisors.length > 0) setDropdownByCol(memberSheet, MEMBER_COLS.SUPERVISOR, lastRow, supervisors, 'Supervisor', false);

    // Manager (allow free-form)
    const managers = getConfigValuesFromSheet(configSheet, CONFIG_COLS.MANAGERS);
    if (managers.length > 0) setDropdownByCol(memberSheet, MEMBER_COLS.MANAGER, lastRow, managers, 'Manager', false);

    // Assigned Steward (allow free-form)
    const stewards = getStewardsList();
    if (stewards.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.ASSIGNED_STEWARD, lastRow, stewards, 'Assigned Steward', false);
      setDropdownByCol(memberSheet, MEMBER_COLS.CONTACT_STEWARD, lastRow, stewards, 'Contact Steward', false);
    }

    // Has Open Grievance? (allow free-form)
    if (yesNo.length > 0) {
      setDropdownByCol(memberSheet, MEMBER_COLS.HAS_OPEN_GRIEVANCE, lastRow, yesNo, 'Has Open Grievance?', false);
    }

    // Office Days (multi-select)
    const officeDays = getConfigValuesFromSheet(configSheet, CONFIG_COLS.OFFICE_DAYS);
    if (officeDays.length > 0) setDropdownByCol(memberSheet, MEMBER_COLS.OFFICE_DAYS, lastRow, officeDays, 'Office Days', false);

    Logger.log('Silent Member Directory dropdown setup complete');

  } catch (error) {
    Logger.log('Error in silent member dropdown setup: ' + error.message);
  }
}

/**
 * Silent version of setupGrievanceLogDropdowns - no alerts
 * Used after seeding to re-apply dropdowns
 */
function setupGrievanceLogDropdownsSilent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const configSheet = ss.getSheetByName(SHEETS.CONFIG);

  if (!grievanceSheet || !configSheet) {
    Logger.log('Silent Grievance dropdown setup: Sheet not found');
    return;
  }

  try {
    // Cap at 6000 to match grievance capacity
    const lastRow = Math.min(Math.max(grievanceSheet.getLastRow(), 500), 6000);

    // Status (allow free-form)
    const statuses = getConfigValuesFromSheet(configSheet, CONFIG_COLS.GRIEVANCE_STATUS);
    if (statuses.length > 0) setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.STATUS, lastRow, statuses, 'Status', false);

    // Current Step (allow free-form)
    const steps = getConfigValuesFromSheet(configSheet, CONFIG_COLS.GRIEVANCE_STEP);
    if (steps.length > 0) setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.CURRENT_STEP, lastRow, steps, 'Current Step', false);

    // Articles Violated (multi-select)
    const articles = getConfigValuesFromSheet(configSheet, CONFIG_COLS.ARTICLES_VIOLATED);
    if (articles.length > 0) setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.ARTICLES, lastRow, articles, 'Articles Violated', false);

    // Issue Category (multi-select)
    const categories = getConfigValuesFromSheet(configSheet, CONFIG_COLS.ISSUE_CATEGORY);
    if (categories.length > 0) setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.ISSUE_CATEGORY, lastRow, categories, 'Issue Category', false);

    // Unit (allow free-form)
    const units = getConfigValuesFromSheet(configSheet, CONFIG_COLS.UNITS);
    if (units.length > 0) setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.UNIT, lastRow, units, 'Unit', false);

    // Work Location (allow free-form)
    const locations = getConfigValuesFromSheet(configSheet, CONFIG_COLS.OFFICE_LOCATIONS);
    if (locations.length > 0) setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.LOCATION, lastRow, locations, 'Work Location', false);

    // Assigned Steward (multi-select)
    const stewards = getStewardsList();
    if (stewards.length > 0) setDropdownByCol(grievanceSheet, GRIEVANCE_COLS.STEWARD, lastRow, stewards, 'Assigned Steward', false);

    Logger.log('Silent Grievance Log dropdown setup complete');

  } catch (error) {
    Logger.log('Error in silent grievance dropdown setup: ' + error.message);
  }
}
