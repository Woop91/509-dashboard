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
  for (let i = 0; i < quickStartSteps.length; i++) {
    const step = quickStartSteps[i];

    // Step number
    sheet.getRange(row, 1)
      .setValue(step[0])
      .setFontWeight("bold")
      .setFontSize(14)
      .setBackground(COLORS.INFO_LIGHT)
      .setVerticalAlignment("top")
      .setBorder(true, true, true, true, false, false);

    // Step title
    sheet.getRange(row, 2)
      .setValue(step[1])
      .setFontWeight("bold")
      .setFontSize(12)
      .setVerticalAlignment("top")
      .setBorder(true, true, true, true, false, false);

    // Step description
    sheet.getRange(row, 3, 1, 2).merge()
      .setValue(step[2])
      .setWrap(true)
      .setVerticalAlignment("top")
      .setBorder(true, true, true, true, false, false);

    sheet.setRowHeight(row, 60);
    row++;
  }

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
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];

    // Feature name
    sheet.getRange(row, 1, 1, 2).merge()
      .setValue(feature[0])
      .setFontWeight("bold")
      .setFontSize(11)
      .setVerticalAlignment("top")
      .setBorder(true, true, true, true, false, false)
      .setBackground(COLORS.LIGHT_GRAY);

    // Feature description
    sheet.getRange(row, 3, 1, 2).merge()
      .setValue(feature[1])
      .setWrap(true)
      .setVerticalAlignment("top")
      .setBorder(true, true, true, true, false, false);

    sheet.setRowHeight(row, 50);
    row++;
  }

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
  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    sheet.getRange(row, 2)
      .setValue(link[0])
      .setFontWeight("bold")
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, false, false);

    sheet.getRange(row, 3, 1, 2).merge()
      .setValue(link[1])
      .setVerticalAlignment("middle")
      .setBorder(true, true, true, true, false, false)
      .setFontColor("#1155CC");

    sheet.setRowHeight(row, 30);
    row++;
  }

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

  return sheet;
}

/**
 * Helper function to add FAQ section rows
 */
function addFAQSection(sheet, startRow, faqs) {
  let row = startRow;

  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];

    // Number
    sheet.getRange(row, 1)
      .setValue("Q" + (i + 1))
      .setFontWeight("bold")
      .setFontSize(12)
      .setBackground(COLORS.INFO_LIGHT)
      .setVerticalAlignment("top")
      .setHorizontalAlignment("center")
      .setBorder(true, true, true, true, false, false);

    // Question
    sheet.getRange(row, 2)
      .setValue(faq[0])
      .setFontWeight("bold")
      .setFontSize(11)
      .setVerticalAlignment("top")
      .setBorder(true, true, true, true, false, false)
      .setWrap(true);

    // Answer
    sheet.getRange(row, 3)
      .setValue(faq[1])
      .setWrap(true)
      .setVerticalAlignment("top")
      .setBorder(true, true, true, true, false, false);

    // Auto-adjust row height based on content
    const contentLength = faq[1].length;
    const estimatedHeight = Math.max(40, Math.min(150, Math.ceil(contentLength / 80) * 20));
    sheet.setRowHeight(row, estimatedHeight);

    row++;
  }

  return row;
}
