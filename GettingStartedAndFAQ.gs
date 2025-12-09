/**
 * ------------------------------------------------------------------------====
 * GETTING STARTED AND FAQ SHEETS
 * ------------------------------------------------------------------------====
 *
 * Creates informational sheets with getting started guide and FAQ
 * Includes GitHub repository information
 *
 * ------------------------------------------------------------------------====
 */

/**
 * Creates the Getting Started sheet
 */
function createGettingStartedSheet(ss) {
  let sheet = ss.getSheetByName("📚 Getting Started");
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  sheet = ss.insertSheet("📚 Getting Started");

  sheet.clear();

  // Set up the sheet with a clean, professional design
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidths(2, 3, 600);

  // Header
  sheet.getRange("A1:D1").merge()
    .setValue("📚 Getting Started with SEIU Local 509 Dashboard")
    .setFontSize(24)
    .setFontWeight("bold")
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor("white")
    .setFontFamily("Roboto")
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center");
  sheet.setRowHeight(1, 60);

  // GitHub Repository Information Section
  let row = 3;
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue("📦 GitHub Repository")
    .setFontSize(18)
    .setFontWeight("bold")
    .setBackground(COLORS.ACCENT_TEAL)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 40);

  row++;
  sheet.getRange(row, 2, 1, 3).merge()
    .setValue("Repository: https://github.com/Woop91/509-Dashboard")
    .setFontSize(12)
    .setWrap(true);
  sheet.setRowHeight(row, 30);

  row++;
  sheet.getRange(row, 2, 1, 3).merge()
    .setValue("For bug reports, feature requests, and contributions, please visit the GitHub repository.")
    .setFontStyle("italic")
    .setWrap(true);
  sheet.setRowHeight(row, 30);

  row++;
  sheet.getRange(row, 2, 1, 3).merge()
    .setValue("Documentation and guides are available in the repository's README and guides folder.")
    .setFontStyle("italic")
    .setWrap(true);
  sheet.setRowHeight(row, 30);

  // Creator & License Section
  row += 2;
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue("👤 Creator & License")
    .setFontSize(18)
    .setFontWeight("bold")
    .setBackground(COLORS.ACCENT_PURPLE)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 40);

  row++;
  sheet.getRange(row, 2, 1, 3).merge()
    .setValue("Created by: Wardis N. Vizcaino, Steward at SEIU Local 509")
    .setFontSize(12)
    .setFontWeight("bold")
    .setWrap(true);
  sheet.setRowHeight(row, 30);

  row++;
  sheet.getRange(row, 2, 1, 3).merge()
    .setValue("Contact: wardis@pm.me")
    .setFontSize(12)
    .setWrap(true);
  sheet.setRowHeight(row, 30);

  row++;
  sheet.getRange(row, 2, 1, 3).merge()
    .setValue("License: Free for use by non-profit collective bargaining groups and unions. No license required.")
    .setFontSize(12)
    .setFontStyle("italic")
    .setWrap(true);
  sheet.setRowHeight(row, 30);

  // Quick Start Section
  row += 2;
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue("🚀 Quick Start Guide")
    .setFontSize(18)
    .setFontWeight("bold")
    .setBackground(COLORS.UNION_GREEN)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 40);

  const quickStartSteps = [
    ["Step 1", "Configure Steward Contact Info", "Go to the ⚙️ Config tab, scroll to column U, and enter your steward contact information (Name, Email, Phone). This information is used when starting new grievances."],
    ["Step 2", "Add Members", "Navigate to 👥 Member Directory and start adding your union members. You can enter them manually, import from CSV, or use the seed data function for testing."],
    ["Step 3", "Review Configuration", "Check the ⚙️ Config tab to ensure all dropdown values (job titles, work locations, grievance types, etc.) match your organization's needs. Customize as needed."],
    ["Step 4", "Set Up Triggers", "Go to 509 Tools > Utilities > Setup Triggers to enable automatic calculations and deadline tracking."],
    ["Step 5", "Explore Dashboards", "Visit the various dashboard views: 📊 Main Dashboard for overview metrics, 🎯 Interactive Dashboard for customizable views, and 👨‍⚖️ Steward Workload for assignment tracking."]
  ];

  row++;
  // OPTIMIZED: Batch operations for quick start steps
  const numSteps = quickStartSteps.length;
  const stepStartRow = row;

  // Set all values at once (steps 1-2 in columns 1-2, description in column 3)
  const stepData = quickStartSteps.map(step => [step[0], step[1], step[2], ""]);
  sheet.getRange(stepStartRow, 1, numSteps, 4).setValues(stepData);

  // Merge column 3-4 for descriptions
  for (let i = 0; i < numSteps; i++) {
    sheet.getRange(stepStartRow + i, 3, 1, 2).merge();
  }

  // Format column 1 (step numbers) - batch
  sheet.getRange(stepStartRow, 1, numSteps, 1)
    .setFontWeight("bold")
    .setFontSize(14)
    .setBackground(COLORS.INFO_LIGHT)
    .setVerticalAlignment("top")
    .setBorder(true, true, true, true, false, false);

  // Format column 2 (step titles) - batch
  sheet.getRange(stepStartRow, 2, numSteps, 1)
    .setFontWeight("bold")
    .setFontSize(12)
    .setVerticalAlignment("top")
    .setBorder(true, true, true, true, false, false);

  // Format columns 3-4 (descriptions) - batch
  sheet.getRange(stepStartRow, 3, numSteps, 2)
    .setWrap(true)
    .setVerticalAlignment("top")
    .setBorder(true, true, true, true, false, false);

  // Set row heights
  for (let i = 0; i < numSteps; i++) {
    sheet.setRowHeight(stepStartRow + i, 60);
  }
  row = stepStartRow + numSteps;

  // Key Features Section
  row += 2;
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue("⭐ Key Features")
    .setFontSize(18)
    .setFontWeight("bold")
    .setBackground(COLORS.SOLIDARITY_RED)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 40);

  const features = [
    ["🚀 Grievance Workflow", "Start grievances from Member Directory with pre-filled forms, automatic log entry, PDF generation, and email delivery."],
    ["📊 Interactive Dashboards", "User-selectable metrics, dynamic chart types, side-by-side comparison, and 6 professional themes with real-time updates."],
    ["⚖️ CBA Compliance", "Automatic deadline tracking based on Article 23A (21-day filing, 30-day decisions, 10-day appeals) with color-coded alerts."],
    ["👥 Member Management", "Comprehensive member directory with auto-calculated grievance metrics, engagement tracking, and committee participation."],
    ["📈 Advanced Analytics", "Four dedicated analytical tabs: Trends & Timeline, Performance Metrics, Location Analytics, and Type Analysis."],
    ["🧠 ADHD-Friendly Design", "Soft colors, no gridlines, emoji icons, large numbers, and minimal visual clutter for easy scanning."],
    ["👨‍⚖️ Steward Workload", "Automatic calculation of cases per steward, active case breakdown, overdue highlights, and win rates."]
  ];

  row++;
  // OPTIMIZED: Batch operations for features
  const numFeatures = features.length;
  const featureStartRow = row;

  // Set all values at once
  const featureData = features.map(f => [f[0], "", f[1], ""]);
  sheet.getRange(featureStartRow, 1, numFeatures, 4).setValues(featureData);

  // Merge cells for each row
  for (let i = 0; i < numFeatures; i++) {
    sheet.getRange(featureStartRow + i, 1, 1, 2).merge();
    sheet.getRange(featureStartRow + i, 3, 1, 2).merge();
  }

  // Format feature names (columns 1-2) - batch
  sheet.getRange(featureStartRow, 1, numFeatures, 2)
    .setFontWeight("bold")
    .setFontSize(11)
    .setVerticalAlignment("top")
    .setBorder(true, true, true, true, false, false)
    .setBackground(COLORS.LIGHT_GRAY);

  // Format descriptions (columns 3-4) - batch
  sheet.getRange(featureStartRow, 3, numFeatures, 2)
    .setWrap(true)
    .setVerticalAlignment("top")
    .setBorder(true, true, true, true, false, false);

  // Set row heights
  for (let i = 0; i < numFeatures; i++) {
    sheet.setRowHeight(featureStartRow + i, 50);
  }
  row = featureStartRow + numFeatures;

  // Important Links Section
  row += 2;
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue("🔗 Important Links & Resources")
    .setFontSize(18)
    .setFontWeight("bold")
    .setBackground(COLORS.ACCENT_PURPLE)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 40);

  const links = [
    ["GitHub Repository", "https://github.com/Woop91/509-Dashboard"],
    ["Grievance Workflow Guide", "See GRIEVANCE_WORKFLOW_GUIDE.md in the repository"],
    ["ADHD-Friendly Guide", "See ADHD_FRIENDLY_GUIDE.md in the repository"],
    ["Steward Excellence Guide", "See STEWARD_GUIDE.md in the repository"],
    ["Seed Nuke Guide", "See SEED_NUKE_GUIDE.md in the repository"]
  ];

  row++;
  // OPTIMIZED: Batch operations for links
  const numLinks = links.length;
  const linkStartRow = row;

  // Set all values at once
  const linkData = links.map(l => ["", l[0], l[1], ""]);
  sheet.getRange(linkStartRow, 1, numLinks, 4).setValues(linkData);

  // Merge column 3-4 for URLs
  for (let i = 0; i < numLinks; i++) {
    sheet.getRange(linkStartRow + i, 3, 1, 2).merge();
  }

  // Format link names (column 2) - batch
  sheet.getRange(linkStartRow, 2, numLinks, 1)
    .setFontWeight("bold")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false);

  // Format URLs (columns 3-4) - batch
  sheet.getRange(linkStartRow, 3, numLinks, 2)
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, false, false)
    .setFontColor("#1155CC");

  // Set row heights
  for (let i = 0; i < numLinks; i++) {
    sheet.setRowHeight(linkStartRow + i, 30);
  }
  row = linkStartRow + numLinks;

  // Support Section
  row += 2;
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue("📞 Support & Help")
    .setFontSize(18)
    .setFontWeight("bold")
    .setBackground(COLORS.ACCENT_ORANGE)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 40);

  row++;
  sheet.getRange(row, 2, 1, 3).merge()
    .setValue("For questions, issues, or feature requests:\n• Visit the GitHub Issues page: https://github.com/Woop91/509-Dashboard/issues\n• Check the FAQ tab in this spreadsheet\n• Review the comprehensive guides in the repository\n• Contact your system administrator")
    .setWrap(true)
    .setVerticalAlignment("top");
  sheet.setRowHeight(row, 80);

  // Freeze header row
  sheet.setFrozenRows(1);

  // Delete unused columns - detect last used column dynamically
  const lastCol = sheet.getLastColumn();
  const totalCols = sheet.getMaxColumns();
  if (lastCol > 0 && totalCols > lastCol) {
    sheet.deleteColumns(lastCol + 1, totalCols - lastCol);
  }

  return sheet;
}

/**
 * Creates the FAQ sheet
 */
function createFAQSheet(ss) {
  let sheet = ss.getSheetByName("❓ FAQ");
  if (sheet) {
    ss.deleteSheet(sheet);
  }
  sheet = ss.insertSheet("❓ FAQ");

  sheet.clear();

  // Set up the sheet with a clean, professional design
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidths(3, 1, 700);

  // Header
  sheet.getRange("A1:C1").merge()
    .setValue("❓ Frequently Asked Questions (FAQ)")
    .setFontSize(24)
    .setFontWeight("bold")
    .setBackground(COLORS.PRIMARY_PURPLE)
    .setFontColor("white")
    .setFontFamily("Roboto")
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center");
  sheet.setRowHeight(1, 60);

  // FAQ Categories and Questions
  let row = 3;

  // General Questions
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue("📋 General Questions")
    .setFontSize(16)
    .setFontWeight("bold")
    .setBackground(COLORS.UNION_GREEN)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 35);

  const generalFAQs = [
    ["What is the 509 Dashboard?", "The 509 Dashboard is a comprehensive Google Sheets-based system for SEIU Local 509 (Units 8 & 10) to track member information, manage grievances, monitor CBA deadlines, and analyze trends. It's specifically designed for Massachusetts state employees and ensures compliance with Article 23A grievance procedures."],
    ["Who should use this dashboard?", "This dashboard is designed for union stewards, representatives, and administrators who need to manage member data, track grievances, and ensure compliance with collective bargaining agreement deadlines."],
    ["Where can I find the source code?", "The source code is available on GitHub at https://github.com/Woop91/509-Dashboard. You can report issues, request features, and contribute to the project there."],
    ["How do I get started?", "Check the 📚 Getting Started tab for a step-by-step guide. In brief: configure steward contact info in the Config tab, add members to the Member Directory, review configuration settings, set up triggers, and explore the dashboards."]
  ];

  row++;
  row = addFAQSection(sheet, row, generalFAQs);

  // Data Entry Questions
  row += 2;
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue("✍️ Data Entry Questions")
    .setFontSize(16)
    .setFontWeight("bold")
    .setBackground(COLORS.UNION_GREEN)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 35);

  const dataFAQs = [
    ["How do I add a new member?", "Go to the 👥 Member Directory sheet and add a new row. Fill in the basic information (First Name, Last Name, Job Title, Work Location, Unit, Email, Phone). The system will automatically calculate grievance metrics. Leave auto-calculated columns (highlighted in green/orange) blank."],
    ["How do I add a new grievance?", "Go to the 📋 Grievance Log sheet and add a new row. Enter the Member ID, name, status, current step, Incident Date, and grievance details. The system will automatically calculate all CBA-compliant deadlines based on Article 23A."],
    ["Which columns should I not edit manually?", "Never manually edit columns highlighted in green or orange. These are auto-calculated fields including: Member metrics (Total Grievances, Win Rate, etc.), Deadline columns (Filing Deadline, Step I/II/III Due Dates), and Derived fields (Days Open, Priority Score, etc.)."],
    ["Can I import data from another spreadsheet?", "Yes! You can copy and paste data from another spreadsheet. Just ensure your data matches the column structure. Use File > Import to bring in CSV files, or copy/paste directly from another sheet."]
  ];

  row++;
  row = addFAQSection(sheet, row, dataFAQs);

  // Features & Functionality
  row += 2;
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue("⚙️ Features & Functionality")
    .setFontSize(16)
    .setFontWeight("bold")
    .setBackground(COLORS.UNION_GREEN)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 35);

  const featureFAQs = [
    ["How does the grievance workflow feature work?", "Click on any member in the Member Directory, then go to 509 Tools > Grievance Tools > Start New Grievance. This opens a pre-filled Google Form with the member's information automatically populated. When submitted, the grievance is automatically added to the Grievance Log."],
    ["What are the Level 2 columns?", "Level 2 columns are advanced engagement tracking fields including: Last Virtual/In-Person Meeting dates, Survey dates, Email open rates, Volunteer hours, Interest in various actions, Communication preferences, Best contact times, and Steward contact notes. Use the menu toggle to show/hide these columns."],
    ["How do I hide/show grievance columns?", "Go to 509 Tools > View Options > Toggle Grievance Columns to show or hide grievance-related columns in the Member Directory. This helps focus on specific data when needed."],
    ["What is the Interactive Dashboard?", "The Interactive Dashboard (🎯 tab) lets you choose which metrics to display, select chart types (pie, donut, bar, line, column, area, or table), compare metrics side-by-side, and apply professional themes. It's fully customizable to your needs."]
  ];

  row++;
  row = addFAQSection(sheet, row, featureFAQs);

  // Troubleshooting
  row += 2;
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue("🔧 Troubleshooting")
    .setFontSize(16)
    .setFontWeight("bold")
    .setBackground(COLORS.SOLIDARITY_RED)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 35);

  const troubleshootingFAQs = [
    ["Charts are not showing data", "Solution: Add at least one member to Member Directory and one grievance to Grievance Log, then run 509 Tools > Data Management > Rebuild Dashboard."],
    ["Deadlines are not calculating", "Solution: Ensure you entered the Incident Date (Column G) and Date Filed (Column I) in the Grievance Log. Then run 509 Tools > Data Management > Recalc All Grievances."],
    ["Member metrics are not updating", "Solution: Verify that Member IDs match between Member Directory and Grievance Log exactly. Then run 509 Tools > Data Management > Recalc All Members."],
    ["Dropdowns are not working", "Solution: Check that the ⚙️ Config sheet exists and has data. If needed, run 509 Tools > Create Dashboard to rebuild, or go to 509 Tools > Utilities > Setup Triggers."],
    ["I'm getting permission errors", "Solution: Go to Extensions > Apps Script, click Run (▶️) > select any function, click Review Permissions, choose your Google account, click Advanced > Go to [Project Name], then click Allow."]
  ];

  row++;
  row = addFAQSection(sheet, row, troubleshootingFAQs);

  // CBA Compliance
  row += 2;
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue("⚖️ CBA Compliance & Deadlines")
    .setFontSize(16)
    .setFontWeight("bold")
    .setBackground(COLORS.ACCENT_PURPLE)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 35);

  const cbaFAQs = [
    ["What deadlines does the system track?", "The system automatically tracks all Article 23A deadlines: 21 days from incident to file grievance, 30 days for Step I decision, 10 days to appeal to Step II, 30 days for Step II decision, 10 days to appeal to Step III, and 30 days for Step III decision."],
    ["What do the color codes mean?", "Green = More than 7 days until deadline (on track), Yellow = 0-7 days until deadline (due soon), Red = Past deadline (overdue), Dark Red = 30+ days overdue (urgent)."],
    ["How are grievance priorities determined?", "The system automatically assigns priorities: Step III = highest priority (1), Step II = priority 2, Step I = priority 3, then sorted by due date within each step."],
    ["Can I customize the deadlines?", "The deadlines are based on the CBA Article 23A and are set in the Config sheet's Timeline Rules Table. You can view them in the ⚙️ Config tab starting at column O. To change them, you'd need to modify the CBA_DEADLINES constants in the script."]
  ];

  row++;
  row = addFAQSection(sheet, row, cbaFAQs);

  // GitHub & Development
  row += 2;
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue("💻 GitHub & Development")
    .setFontSize(16)
    .setFontWeight("bold")
    .setBackground(COLORS.ACCENT_TEAL)
    .setFontColor("white")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 35);

  const githubFAQs = [
    ["Where is the GitHub repository?", "The repository is at https://github.com/Woop91/509-Dashboard. This is where you'll find the source code, documentation, guides, and can report issues or request features."],
    ["How do I report a bug or request a feature?", "Go to https://github.com/Woop91/509-Dashboard/issues and click 'New Issue'. Provide a clear description of the bug or feature request, including steps to reproduce if it's a bug."],
    ["Can I contribute to the project?", "Yes! The project is open for contributions. Visit the GitHub repository, fork it, make your changes, and submit a pull request. Please follow the contribution guidelines in the repository."],
    ["How do I update to the latest version?", "Check the GitHub repository's Releases page for the latest version. Download the updated .gs files and replace them in your Apps Script project via Extensions > Apps Script."]
  ];

  row++;
  row = addFAQSection(sheet, row, githubFAQs);

  // Additional Help
  row += 2;
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue("Need more help?")
    .setFontSize(14)
    .setFontWeight("bold")
    .setBackground(COLORS.INFO_LIGHT)
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center");
  sheet.setRowHeight(row, 30);

  row++;
  sheet.getRange(row, 1, 1, 3).merge()
    .setValue("Check the 📚 Getting Started tab for step-by-step guides, visit the GitHub repository for comprehensive documentation, or review the README.md file in the repository for detailed information about all features.")
    .setWrap(true)
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center")
    .setFontStyle("italic");
  sheet.setRowHeight(row, 60);

  // Freeze header row
  sheet.setFrozenRows(1);

  // Delete unused columns - detect last used column dynamically
  const lastColFAQ = sheet.getLastColumn();
  const totalColsFAQ = sheet.getMaxColumns();
  if (lastColFAQ > 0 && totalColsFAQ > lastColFAQ) {
    sheet.deleteColumns(lastColFAQ + 1, totalColsFAQ - lastColFAQ);
  }

  return sheet;
}

/**
 * Helper function to add FAQ section rows - OPTIMIZED for batch operations
 * Reduces API calls from 4+ per FAQ to batch operations
 */
function addFAQSection(sheet, startRow, faqs) {
  const numFaqs = faqs.length;
  if (numFaqs === 0) return startRow;

  // Build all data at once
  const data = faqs.map((faq, i) => ["Q" + (i + 1), faq[0], faq[1]]);

  // Set all values in one batch call
  const dataRange = sheet.getRange(startRow, 1, numFaqs, 3);
  dataRange.setValues(data);

  // Apply formatting to entire columns at once (batch operations)
  // Column 1 (Q numbers) - format entire column range at once
  const col1Range = sheet.getRange(startRow, 1, numFaqs, 1);
  col1Range
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground(COLORS.INFO_LIGHT)
    .setVerticalAlignment("top")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, false, false);

  // Column 2 (Questions) - format entire column range at once
  const col2Range = sheet.getRange(startRow, 2, numFaqs, 1);
  col2Range
    .setFontWeight("bold")
    .setFontSize(11)
    .setVerticalAlignment("top")
    .setBorder(true, true, true, true, false, false)
    .setWrap(true);

  // Column 3 (Answers) - format entire column range at once
  const col3Range = sheet.getRange(startRow, 3, numFaqs, 1);
  col3Range
    .setWrap(true)
    .setVerticalAlignment("top")
    .setBorder(true, true, true, true, false, false);

  // Set row heights based on content (unfortunately must be done per row)
  // But batch the height calculations first to minimize switching
  for (let i = 0; i < numFaqs; i++) {
    const contentLength = faqs[i][1].length;
    const estimatedHeight = Math.max(40, Math.min(150, Math.ceil(contentLength / 80) * 20));
    sheet.setRowHeight(startRow + i, estimatedHeight);
  }

  return startRow + numFaqs;
}
