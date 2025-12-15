/**
 * 509 Dashboard - Constants and Configuration
 *
 * Single source of truth for all configuration constants.
 * This file must be loaded first in the build order.
 *
 * @version 1.0.0
 * @license Free for use by non-profit collective bargaining groups and unions
 */

// ============================================================================
// SHEET NAMES
// ============================================================================

/**
 * Sheet name constants - use these instead of hardcoded strings
 * @const {Object}
 */
var SHEETS = {
  CONFIG: 'Config',
  MEMBER_DIR: 'Member Directory',
  GRIEVANCE_LOG: 'Grievance Log',
  DASHBOARD: 'Dashboard',
  ANALYTICS_DATA: 'Analytics Data',
  MEMBER_SATISFACTION: 'Member Satisfaction',
  FEEDBACK: 'Feedback & Development',
  INTERACTIVE: '🎯 Interactive (Your Custom View)',
  GETTING_STARTED: '📚 Getting Started',
  FAQ: '❓ FAQ',
  USER_SETTINGS: '⚙️ User Settings',
  STEWARD_WORKLOAD: '👨‍⚖️ Steward Workload',
  TRENDS: '📈 Trends & Timeline',
  LOCATION_ANALYTICS: '🗺️ Location Analytics',
  TYPE_ANALYSIS: '📊 Type Analysis',
  EXECUTIVE: '💼 Executive Dashboard',
  KPI: '📊 KPI Performance Dashboard',
  ENGAGEMENT: '👥 Member Engagement',
  COST_IMPACT: '💰 Cost Impact',
  ARCHIVE: '📦 Archive',
  DIAGNOSTICS: '🔧 Diagnostics',
  AUDIT_LOG: '📋 Audit_Log',
  // Hidden calculation sheets
  GRIEVANCE_CALC: '_Grievance_Calc',
  MEMBER_LOOKUP: '_Member_Lookup',
  STEWARD_CONTACT_CALC: '_Steward_Contact_Calc',
  ENGAGEMENT_CALC: '_Engagement_Calc',
  STEWARD_WORKLOAD_CALC: '_Steward_Workload_Calc',
  INTERACTIVE_CALC: '_Interactive_Dashboard_Calc',
  // Optional source sheets
  MEETING_ATTENDANCE: '📅 Meeting Attendance',
  VOLUNTEER_HOURS: '🤝 Volunteer Hours',
  // Test Results
  TEST_RESULTS: 'Test Results'
};

// ============================================================================
// COLOR SCHEME
// ============================================================================

/**
 * Color scheme constants for consistent branding
 * @const {Object}
 */
var COLORS = {
  PRIMARY_PURPLE: '#7C3AED',    // Main brand purple
  UNION_GREEN: '#059669',       // Union/success green
  SOLIDARITY_RED: '#DC2626',    // Alert/urgent red
  PRIMARY_BLUE: '#7EC8E3',      // Light blue
  ACCENT_ORANGE: '#F97316',     // Warnings/attention
  LIGHT_GRAY: '#F3F4F6',        // Backgrounds
  TEXT_DARK: '#1F2937',         // Primary text
  WHITE: '#FFFFFF',             // White
  HEADER_BG: '#7C3AED',         // Header background (same as primary)
  HEADER_TEXT: '#FFFFFF'        // Header text color
};

// ============================================================================
// MEMBER DIRECTORY COLUMNS (31 columns total: A-AE)
// ============================================================================

/**
 * Member Directory column positions (1-indexed)
 * CRITICAL: ALL column references must use these constants
 * @const {Object}
 */
var MEMBER_COLS = {
  // Section 1: Identity & Core Info (A-D)
  MEMBER_ID: 1,                    // A
  FIRST_NAME: 2,                   // B
  LAST_NAME: 3,                    // C
  JOB_TITLE: 4,                    // D

  // Section 2: Location & Work (E-G)
  WORK_LOCATION: 5,                // E
  UNIT: 6,                         // F
  OFFICE_DAYS: 7,                  // G

  // Section 3: Contact Information (H-K)
  EMAIL: 8,                        // H
  PHONE: 9,                        // I
  PREFERRED_COMM: 10,              // J - Multi-select: preferred communication methods
  BEST_TIME: 11,                   // K - Multi-select: best times to reach member

  // Section 4: Organizational Structure (L-P)
  SUPERVISOR: 12,                  // L
  MANAGER: 13,                     // M
  IS_STEWARD: 14,                  // N
  COMMITTEES: 15,                  // O - Multi-select: which committees steward is in
  ASSIGNED_STEWARD: 16,            // P

  // Section 5: Engagement Metrics (Q-T) - Hidden by default
  LAST_VIRTUAL_MTG: 17,            // Q
  LAST_INPERSON_MTG: 18,           // R
  OPEN_RATE: 19,                   // S
  VOLUNTEER_HOURS: 20,             // T

  // Section 6: Member Interests (U-X) - Hidden by default
  INTEREST_LOCAL: 21,              // U
  INTEREST_CHAPTER: 22,            // V
  INTEREST_ALLIED: 23,             // W
  HOME_TOWN: 24,                   // X - Connection building

  // Section 7: Steward Contact Tracking (Y-AA)
  RECENT_CONTACT_DATE: 25,         // Y
  CONTACT_STEWARD: 26,             // Z
  CONTACT_NOTES: 27,               // AA

  // Section 8: Grievance Management (AB-AE)
  HAS_OPEN_GRIEVANCE: 28,          // AB - Script-calculated (static value)
  GRIEVANCE_STATUS: 29,            // AC - Script-calculated (static value)
  NEXT_DEADLINE: 30,               // AD - Script-calculated (static value)
  START_GRIEVANCE: 31,             // AE - Checkbox to start grievance

  // ALIAS - For backward compatibility
  LOCATION: 5                      // Alias for WORK_LOCATION
};

// ============================================================================
// GRIEVANCE LOG COLUMNS (34 columns total: A-AH)
// ============================================================================

/**
 * Grievance Log column positions (1-indexed)
 * CRITICAL: ALL column references must use these constants
 * @const {Object}
 */
var GRIEVANCE_COLS = {
  // Section 1: Identity (A-D)
  GRIEVANCE_ID: 1,        // A - Grievance ID
  MEMBER_ID: 2,           // B - Member ID
  FIRST_NAME: 3,          // C - First Name
  LAST_NAME: 4,           // D - Last Name

  // Section 2: Status & Assignment (E-F)
  STATUS: 5,              // E - Status
  CURRENT_STEP: 6,        // F - Current Step

  // Section 3: Timeline - Filing (G-I)
  INCIDENT_DATE: 7,       // G - Incident Date
  FILING_DEADLINE: 8,     // H - Filing Deadline (21d) (auto-calc)
  DATE_FILED: 9,          // I - Date Filed (Step I)

  // Section 4: Timeline - Step I (J-K)
  STEP1_DUE: 10,          // J - Step I Decision Due (30d) (auto-calc)
  STEP1_RCVD: 11,         // K - Step I Decision Rcvd

  // Section 5: Timeline - Step II (L-O)
  STEP2_APPEAL_DUE: 12,   // L - Step II Appeal Due (10d) (auto-calc)
  STEP2_APPEAL_FILED: 13, // M - Step II Appeal Filed
  STEP2_DUE: 14,          // N - Step II Decision Due (30d) (auto-calc)
  STEP2_RCVD: 15,         // O - Step II Decision Rcvd

  // Section 6: Timeline - Step III (P-R)
  STEP3_APPEAL_DUE: 16,   // P - Step III Appeal Due (30d) (auto-calc)
  STEP3_APPEAL_FILED: 17, // Q - Step III Appeal Filed
  DATE_CLOSED: 18,        // R - Date Closed

  // Section 7: Calculated Metrics (S-U)
  DAYS_OPEN: 19,          // S - Days Open (auto-calc)
  NEXT_ACTION_DUE: 20,    // T - Next Action Due (auto-calc)
  DAYS_TO_DEADLINE: 21,   // U - Days to Deadline (auto-calc)

  // Section 8: Case Details (V-W)
  ARTICLES: 22,           // V - Articles Violated
  ISSUE_CATEGORY: 23,     // W - Issue Category

  // Section 9: Contact & Location (X-AA)
  MEMBER_EMAIL: 24,       // X - Member Email
  UNIT: 25,               // Y - Unit
  LOCATION: 26,           // Z - Work Location (Site)
  STEWARD: 27,            // AA - Assigned Steward (Name)

  // Section 10: Resolution (AB)
  RESOLUTION: 28,         // AB - Resolution Summary

  // Section 11: Coordinator Notifications (AC-AF)
  MESSAGE_ALERT: 29,      // AC - Message Alert checkbox
  COORDINATOR_MESSAGE: 30,// AD - Coordinator's message text
  ACKNOWLEDGED_BY: 31,    // AE - Steward who acknowledged
  ACKNOWLEDGED_DATE: 32,  // AF - When steward acknowledged

  // Section 12: Drive Integration (AG-AH)
  DRIVE_FOLDER_ID: 33,    // AG - Google Drive folder ID
  DRIVE_FOLDER_URL: 34    // AH - Google Drive folder URL
};

// ============================================================================
// CONFIG COLUMN MAPPING
// ============================================================================

/**
 * Config sheet column positions for dropdown sources
 * @const {Object}
 */
var CONFIG_COLS = {
  JOB_TITLES: 1,           // A
  OFFICE_LOCATIONS: 2,     // B
  UNITS: 3,                // C
  OFFICE_DAYS: 4,          // D
  YES_NO: 5,               // E
  SUPERVISORS: 6,          // F
  MANAGERS: 7,             // G
  STEWARDS: 8,             // H
  GRIEVANCE_STATUS: 9,     // I
  GRIEVANCE_STEP: 10,      // J
  ISSUE_CATEGORY: 11,      // K
  ARTICLES: 12,            // L
  COMM_METHODS: 13,        // M
  GRIEVANCE_COORDINATORS: 15, // O
  HOME_TOWNS: 32           // AF
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert column number to letter notation (e.g., 1 -> A, 27 -> AA)
 * @param {number} columnNumber - Column number (1-indexed)
 * @returns {string} Column letter(s)
 */
function getColumnLetter(columnNumber) {
  var letter = '';
  while (columnNumber > 0) {
    var remainder = (columnNumber - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }
  return letter;
}

/**
 * Convert column letter to number (e.g., A -> 1, AA -> 27)
 * @param {string} columnLetter - Column letter(s)
 * @returns {number} Column number (1-indexed)
 */
function getColumnNumber(columnLetter) {
  var result = 0;
  for (var i = 0; i < columnLetter.length; i++) {
    result = result * 26 + (columnLetter.charCodeAt(i) - 64);
  }
  return result;
}

/**
 * Map a Member Directory row array to a structured object
 * @param {Array} row - Row data array from Member Directory
 * @returns {Object} Structured member object
 */
function mapMemberRow(row) {
  return {
    memberId: row[MEMBER_COLS.MEMBER_ID - 1] || '',
    firstName: row[MEMBER_COLS.FIRST_NAME - 1] || '',
    lastName: row[MEMBER_COLS.LAST_NAME - 1] || '',
    fullName: (row[MEMBER_COLS.FIRST_NAME - 1] || '') + ' ' + (row[MEMBER_COLS.LAST_NAME - 1] || ''),
    jobTitle: row[MEMBER_COLS.JOB_TITLE - 1] || '',
    workLocation: row[MEMBER_COLS.WORK_LOCATION - 1] || '',
    unit: row[MEMBER_COLS.UNIT - 1] || '',
    officeDays: row[MEMBER_COLS.OFFICE_DAYS - 1] || '',
    email: row[MEMBER_COLS.EMAIL - 1] || '',
    phone: row[MEMBER_COLS.PHONE - 1] || '',
    preferredComm: row[MEMBER_COLS.PREFERRED_COMM - 1] || '',
    bestTime: row[MEMBER_COLS.BEST_TIME - 1] || '',
    supervisor: row[MEMBER_COLS.SUPERVISOR - 1] || '',
    manager: row[MEMBER_COLS.MANAGER - 1] || '',
    isSteward: row[MEMBER_COLS.IS_STEWARD - 1] || '',
    committees: row[MEMBER_COLS.COMMITTEES - 1] || '',
    assignedSteward: row[MEMBER_COLS.ASSIGNED_STEWARD - 1] || '',
    lastVirtualMtg: row[MEMBER_COLS.LAST_VIRTUAL_MTG - 1] || '',
    lastInPersonMtg: row[MEMBER_COLS.LAST_INPERSON_MTG - 1] || '',
    openRate: row[MEMBER_COLS.OPEN_RATE - 1] || '',
    volunteerHours: row[MEMBER_COLS.VOLUNTEER_HOURS - 1] || '',
    interestLocal: row[MEMBER_COLS.INTEREST_LOCAL - 1] || '',
    interestChapter: row[MEMBER_COLS.INTEREST_CHAPTER - 1] || '',
    interestAllied: row[MEMBER_COLS.INTEREST_ALLIED - 1] || '',
    homeTown: row[MEMBER_COLS.HOME_TOWN - 1] || '',
    recentContactDate: row[MEMBER_COLS.RECENT_CONTACT_DATE - 1] || '',
    contactSteward: row[MEMBER_COLS.CONTACT_STEWARD - 1] || '',
    contactNotes: row[MEMBER_COLS.CONTACT_NOTES - 1] || '',
    hasOpenGrievance: row[MEMBER_COLS.HAS_OPEN_GRIEVANCE - 1] || '',
    grievanceStatus: row[MEMBER_COLS.GRIEVANCE_STATUS - 1] || '',
    nextDeadline: row[MEMBER_COLS.NEXT_DEADLINE - 1] || '',
    startGrievance: row[MEMBER_COLS.START_GRIEVANCE - 1] || false
  };
}

/**
 * Map a Grievance Log row array to a structured object
 * @param {Array} row - Row data array from Grievance Log
 * @returns {Object} Structured grievance object
 */
function mapGrievanceRow(row) {
  return {
    grievanceId: row[GRIEVANCE_COLS.GRIEVANCE_ID - 1] || '',
    memberId: row[GRIEVANCE_COLS.MEMBER_ID - 1] || '',
    firstName: row[GRIEVANCE_COLS.FIRST_NAME - 1] || '',
    lastName: row[GRIEVANCE_COLS.LAST_NAME - 1] || '',
    fullName: (row[GRIEVANCE_COLS.FIRST_NAME - 1] || '') + ' ' + (row[GRIEVANCE_COLS.LAST_NAME - 1] || ''),
    status: row[GRIEVANCE_COLS.STATUS - 1] || '',
    currentStep: row[GRIEVANCE_COLS.CURRENT_STEP - 1] || '',
    incidentDate: row[GRIEVANCE_COLS.INCIDENT_DATE - 1] || '',
    filingDeadline: row[GRIEVANCE_COLS.FILING_DEADLINE - 1] || '',
    dateFiled: row[GRIEVANCE_COLS.DATE_FILED - 1] || '',
    step1Due: row[GRIEVANCE_COLS.STEP1_DUE - 1] || '',
    step1Rcvd: row[GRIEVANCE_COLS.STEP1_RCVD - 1] || '',
    step2AppealDue: row[GRIEVANCE_COLS.STEP2_APPEAL_DUE - 1] || '',
    step2AppealFiled: row[GRIEVANCE_COLS.STEP2_APPEAL_FILED - 1] || '',
    step2Due: row[GRIEVANCE_COLS.STEP2_DUE - 1] || '',
    step2Rcvd: row[GRIEVANCE_COLS.STEP2_RCVD - 1] || '',
    step3AppealDue: row[GRIEVANCE_COLS.STEP3_APPEAL_DUE - 1] || '',
    step3AppealFiled: row[GRIEVANCE_COLS.STEP3_APPEAL_FILED - 1] || '',
    dateClosed: row[GRIEVANCE_COLS.DATE_CLOSED - 1] || '',
    daysOpen: row[GRIEVANCE_COLS.DAYS_OPEN - 1] || '',
    nextActionDue: row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1] || '',
    daysToDeadline: row[GRIEVANCE_COLS.DAYS_TO_DEADLINE - 1] || '',
    articles: row[GRIEVANCE_COLS.ARTICLES - 1] || '',
    issueCategory: row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1] || '',
    memberEmail: row[GRIEVANCE_COLS.MEMBER_EMAIL - 1] || '',
    unit: row[GRIEVANCE_COLS.UNIT - 1] || '',
    location: row[GRIEVANCE_COLS.LOCATION - 1] || '',
    steward: row[GRIEVANCE_COLS.STEWARD - 1] || '',
    resolution: row[GRIEVANCE_COLS.RESOLUTION - 1] || '',
    messageAlert: row[GRIEVANCE_COLS.MESSAGE_ALERT - 1] || false,
    coordinatorMessage: row[GRIEVANCE_COLS.COORDINATOR_MESSAGE - 1] || '',
    acknowledgedBy: row[GRIEVANCE_COLS.ACKNOWLEDGED_BY - 1] || '',
    acknowledgedDate: row[GRIEVANCE_COLS.ACKNOWLEDGED_DATE - 1] || '',
    driveFolderId: row[GRIEVANCE_COLS.DRIVE_FOLDER_ID - 1] || '',
    driveFolderUrl: row[GRIEVANCE_COLS.DRIVE_FOLDER_URL - 1] || ''
  };
}

/**
 * Get all member header labels in order
 * @returns {Array} Array of header labels for Member Directory
 */
function getMemberHeaders() {
  return [
    'Member ID', 'First Name', 'Last Name', 'Job Title',
    'Work Location', 'Unit', 'Office Days',
    'Email', 'Phone', 'Preferred Communication', 'Best Time to Contact',
    'Supervisor', 'Manager', 'Is Steward', 'Committees', 'Assigned Steward',
    'Last Virtual Mtg', 'Last In-Person Mtg', 'Open Rate %', 'Volunteer Hours',
    'Interest: Local', 'Interest: Chapter', 'Interest: Allied', 'Home Town',
    'Recent Contact Date', 'Contact Steward', 'Contact Notes',
    'Has Open Grievance?', 'Grievance Status', 'Next Deadline', 'Start Grievance'
  ];
}

/**
 * Get all grievance header labels in order
 * @returns {Array} Array of header labels for Grievance Log
 */
function getGrievanceHeaders() {
  return [
    'Grievance ID', 'Member ID', 'First Name', 'Last Name',
    'Status', 'Current Step',
    'Incident Date', 'Filing Deadline', 'Date Filed',
    'Step I Due', 'Step I Rcvd',
    'Step II Appeal Due', 'Step II Appeal Filed', 'Step II Due', 'Step II Rcvd',
    'Step III Appeal Due', 'Step III Appeal Filed', 'Date Closed',
    'Days Open', 'Next Action Due', 'Days to Deadline',
    'Articles Violated', 'Issue Category',
    'Member Email', 'Unit', 'Work Location', 'Assigned Steward',
    'Resolution',
    'Message Alert', 'Coordinator Message', 'Acknowledged By', 'Acknowledged Date',
    'Drive Folder ID', 'Drive Folder URL'
  ];
}

// ============================================================================
// VALIDATION VALUES
// ============================================================================

/**
 * Default values for Config sheet dropdowns
 */
var DEFAULT_CONFIG = {
  OFFICE_DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  YES_NO: ['Yes', 'No'],
  GRIEVANCE_STATUS: ['Open', 'Pending Info', 'Settled', 'Withdrawn', 'Denied', 'Won', 'Appealed', 'In Arbitration', 'Closed'],
  GRIEVANCE_STEP: ['Informal', 'Step I', 'Step II', 'Step III', 'Mediation', 'Arbitration'],
  ISSUE_CATEGORY: ['Discipline', 'Workload', 'Scheduling', 'Pay', 'Benefits', 'Safety', 'Harassment', 'Discrimination', 'Contract Violation', 'Other'],
  ARTICLES: [
    'Art. 1 - Recognition',
    'Art. 2 - Management Rights',
    'Art. 3 - Union Rights',
    'Art. 4 - Dues Deduction',
    'Art. 5 - Non-Discrimination',
    'Art. 6 - Hours of Work',
    'Art. 7 - Overtime',
    'Art. 8 - Compensation',
    'Art. 9 - Benefits',
    'Art. 10 - Leave',
    'Art. 11 - Holidays',
    'Art. 12 - Seniority',
    'Art. 13 - Discipline',
    'Art. 14 - Safety',
    'Art. 15 - Training',
    'Art. 16 - Evaluations',
    'Art. 17 - Layoff',
    'Art. 18 - Vacancies',
    'Art. 19 - Transfers',
    'Art. 20 - Subcontracting',
    'Art. 21 - Personnel Files',
    'Art. 22 - Uniforms',
    'Art. 23 - Grievance Procedure',
    'Art. 24 - Arbitration',
    'Art. 25 - No Strike',
    'Art. 26 - Duration'
  ],
  COMM_METHODS: ['Email', 'Phone', 'Text', 'In Person']
};
