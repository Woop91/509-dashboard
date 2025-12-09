/**
 * ------------------------------------------------------------------------====
 * FAQ DATABASE & KNOWLEDGE BASE
 * ------------------------------------------------------------------------====
 *
 * Searchable knowledge base for common questions and procedures
 * Features:
 * - Searchable FAQ database
 * - Category-based organization
 * - Admin interface to add/edit FAQs
 * - User feedback on helpfulness
 * - Related articles suggestions
 * - Export FAQ documentation
 * - Auto-suggest based on context
 */

/**
 * FAQ categories
 */
FAQ_CATEGORIES = {
  GETTING_STARTED: 'Getting Started',
  GRIEVANCES: 'Grievance Process',
  MEMBERS: 'Member Management',
  REPORTS: 'Reports & Analytics',
  AUTOMATION: 'Automation Features',
  TROUBLESHOOTING: 'Troubleshooting',
  BEST_PRACTICES: 'Best Practices'
};

/**
 * Creates FAQ database sheet if it doesn't exist
 * Note: Renamed from createFAQSheet to avoid collision with GettingStartedAndFAQ.gs
 */
function createFAQDatabaseSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let faqSheet = ss.getSheetByName(SHEETS.FAQ_DATABASE);

  if (faqSheet) {
    SpreadsheetApp.getUi().alert('FAQ Database sheet already exists.');
    return;
  }

  faqSheet = ss.insertSheet(SHEETS.FAQ_DATABASE);

  // Set headers
  const headers = [
    'ID',
    'Category',
    'Question',
    'Answer',
    'Tags',
    'Related FAQs',
    'Helpful Count',
    'Not Helpful Count',
    'Created Date',
    'Last Updated',
    'Created By'
  ];

  faqSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header
  faqSheet.getRange(1, 1, 1, headers.length)
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');

  // Set column widths
  faqSheet.setColumnWidth(1, 60);   // ID
  faqSheet.setColumnWidth(2, 150);  // Category
  faqSheet.setColumnWidth(3, 300);  // Question
  faqSheet.setColumnWidth(4, 500);  // Answer
  faqSheet.setColumnWidth(5, 150);  // Tags
  faqSheet.setColumnWidth(6, 120);  // Related FAQs
  faqSheet.setColumnWidth(7, 100);  // Helpful Count
  faqSheet.setColumnWidth(8, 120);  // Not Helpful Count
  faqSheet.setColumnWidth(9, 120);  // Created Date
  faqSheet.setColumnWidth(10, 120); // Last Updated
  faqSheet.setColumnWidth(11, 150); // Created By

  // Freeze header
  faqSheet.setFrozenRows(1);

  // Delete unused columns beyond the defined headers (11 columns)
  const totalCols = faqSheet.getMaxColumns();
  if (totalCols > headers.length) {
    faqSheet.deleteColumns(headers.length + 1, totalCols - headers.length);
  }

  // Add initial FAQs
  seedInitialFAQs();

  SpreadsheetApp.getUi().alert(
    '✅ FAQ Database Created',
    'The FAQ Database sheet has been created and seeded with common questions.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Seeds initial FAQs
 */
function seedInitialFAQs() {
  const initialFAQs = [
    {
      category: FAQ_CATEGORIES.GETTING_STARTED,
      question: 'How do I start a new grievance?',
      answer: 'To start a new grievance: 1) Go to menu: 📋 Grievance Tools → ➕ Start New Grievance, 2) Fill in the member information and grievance details, 3) Click Submit. The system will auto-assign a Grievance ID and calculate deadlines.',
      tags: 'grievance, new, create, start'
    },
    {
      category: FAQ_CATEGORIES.GRIEVANCES,
      question: 'What are the different grievance workflow states?',
      answer: 'Grievances flow through these states: Filed → Step 1 Pending → Step 1 Meeting → Step 2 Pending (if escalated) → Step 2 Meeting → Arbitration (if needed) → Resolved/Withdrawn. Each state has specific deadlines and required actions. Use the Workflow Visualizer (🔄 Workflow Management → 🔄 Workflow Visualizer) to see the full process.',
      tags: 'workflow, states, process, steps'
    },
    {
      category: FAQ_CATEGORIES.GRIEVANCES,
      question: 'How do I assign a steward to a grievance?',
      answer: 'You have three options: 1) Manual: Select the grievance row and enter a steward name in the "Assigned Steward" column, 2) Auto-Assign: Select the row and use 🤖 Smart Assignment → 🤖 Auto-Assign Steward (recommended - uses AI to find best match), 3) Batch: Select multiple rows and use 🤖 Smart Assignment → 📦 Batch Auto-Assign.',
      tags: 'steward, assign, assignment, auto-assign'
    },
    {
      category: FAQ_CATEGORIES.MEMBERS,
      question: 'How do I search for a member?',
      answer: "Use the Member Search tool: 1) Press Ctrl+F or go to 🔍 Search & Lookup → 🔍 Search Members, 2) Type name, ID, or email in the search box, 3) Use filters to narrow by location, unit, or steward status, 4) Click on a result to navigate to that member's row.",
      tags: 'search, member, find, lookup'
    },
    {
      category: FAQ_CATEGORIES.REPORTS,
      question: 'How do I create a custom report?',
      answer: 'Use the Custom Report Builder: 1) Go to 📊 Reports → 📊 Custom Report Builder, 2) Select your data source (Grievances or Members), 3) Choose which fields to include, 4) Add filters to narrow data, 5) Choose grouping/sorting options, 6) Generate preview, 7) Export to PDF, CSV, or Excel. You can save configurations as templates for reuse.',
      tags: 'report, custom, export, PDF, CSV, Excel'
    },
    {
      category: FAQ_CATEGORIES.AUTOMATION,
      question: 'How do I enable automated deadline notifications?',
      answer: 'To enable email notifications for approaching deadlines: 1) Go to 🤖 Automation → 📬 Notification Settings, 2) Click "Enable Notifications", 3) The system will send daily emails at 8 AM: 7-day warnings to stewards, 3-day escalations to managers, and overdue alerts. Test with "🧪 Test Now" button.',
      tags: 'automation, notifications, email, deadlines, alerts'
    },
    {
      category: FAQ_CATEGORIES.AUTOMATION,
      question: 'Can I schedule automated reports?',
      answer: 'Yes! Go to 🤖 Automation → 📊 Report Automation Settings. You can enable: 1) Monthly Reports (1st of each month, executive summary), 2) Quarterly Reports (Jan/Apr/Jul/Oct, trend analysis). Reports are automatically generated as PDFs and emailed to configured recipients.',
      tags: 'automation, reports, schedule, monthly, quarterly'
    },
    {
      category: FAQ_CATEGORIES.TROUBLESHOOTING,
      question: 'Why are my formulas not calculating?',
      answer: 'If formulas aren\'t updating: 1) Go to menu: 🔄 Refresh All (Ctrl+R), 2) If still not working, check if you have edit permissions, 3) Make sure the sheet isn\'t in protected range, 4) Try ⚡ Performance → 🗑️ Clear All Caches, then refresh. If problem persists, use ❓ Help & Support → 🔧 Diagnose Setup.',
      tags: 'formulas, not working, calculate, refresh, troubleshoot'
    },
    {
      category: FAQ_CATEGORIES.TROUBLESHOOTING,
      question: 'What if a grievance deadline is wrong?',
      answer: 'Deadlines are auto-calculated based on Filed Date (Column G) + workflow state. To fix: 1) Check the Filed Date is correct, 2) Verify the workflow state is accurate (🔄 Workflow Management → 📊 View Current State), 3) If you need to manually override, you can edit the "Next Action Due" field directly.',
      tags: 'deadline, wrong, incorrect, fix, override'
    },
    {
      category: FAQ_CATEGORIES.BEST_PRACTICES,
      question: 'What are keyboard shortcuts and how do I use them?',
      answer: 'Keyboard shortcuts make navigation 10x faster! Press Ctrl+? to see all shortcuts. Common ones: Ctrl+G (Go to Grievance Log), Ctrl+M (Go to Members), Ctrl+F (Search Members), Ctrl+N (New Grievance), Ctrl+E (Compose Email), Ctrl+B (Batch Operations). On Mac, use Cmd instead of Ctrl.',
      tags: 'keyboard, shortcuts, hotkeys, fast, navigation'
    },
    {
      category: FAQ_CATEGORIES.BEST_PRACTICES,
      question: 'How often should I back up data?',
      answer: 'Best practice is weekly backups. Use 💾 Data Management → 💾 Create Backup to generate a timestamped copy of all data. The backup is saved to Google Drive. You can also enable automated weekly backups in the backup settings. Keep at least 4 weeks of backups.',
      tags: 'backup, data, export, save, recovery'
    },
    {
      category: FAQ_CATEGORIES.BEST_PRACTICES,
      question: 'How can I improve dashboard performance?',
      answer: 'Performance tips: 1) Use caching - enable via ⚡ Performance → 🔥 Warm Up All Caches, 2) Close unused sheets/tabs, 3) Use filters instead of scrolling through all data, 4) For large datasets (20k+ members), use Search instead of browsing, 5) Batch operations instead of individual updates, 6) Keep browser updated.',
      tags: 'performance, slow, speed, fast, optimize, cache'
    }
  ];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const faqSheet = ss.getSheetByName(SHEETS.FAQ_DATABASE);

  const rows = initialFAQs.map((faq, index) => [
    index + 1,
    faq.category,
    faq.question,
    faq.answer,
    faq.tags,
    '',
    0,
    0,
    new Date(),
    new Date(),
    Session.getActiveUser().getEmail() || 'System'
  ]);

  faqSheet.getRange(2, 1, rows.length, 11).setValues(rows);
}

/**
 * Shows FAQ search dialog
 */
function showFAQSearch() {
  const html = createFAQSearchHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(900)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📚 FAQ & Knowledge Base');
}

/**
 * Creates HTML for FAQ search
 */
function createFAQSearchHTML() {
  const categories = Object.values(FAQ_CATEGORIES);

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
    .search-box {
      margin: 20px 0;
    }
    input[type="text"] {
      width: 100%;
      padding: 15px;
      font-size: 16px;
      border: 2px solid #ddd;
      border-radius: 8px;
      box-sizing: border-box;
    }
    input[type="text"]:focus {
      outline: none;
      border-color: #1a73e8;
    }
    .categories {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 20px 0;
    }
    .category-badge {
      background: #e8f0fe;
      color: #1a73e8;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      border: 2px solid transparent;
      transition: all 0.2s;
    }
    .category-badge:hover {
      background: #1a73e8;
      color: white;
    }
    .category-badge.active {
      background: #1a73e8;
      color: white;
      border-color: #1557b0;
    }
    .faq-item {
      background: #f8f9fa;
      padding: 20px;
      margin: 15px 0;
      border-radius: 8px;
      border-left: 4px solid #1a73e8;
      cursor: pointer;
      transition: all 0.2s;
    }
    .faq-item:hover {
      transform: translateX(5px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .faq-question {
      font-weight: bold;
      font-size: 16px;
      color: #333;
      margin-bottom: 10px;
    }
    .faq-answer {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      display: none;
    }
    .faq-answer.show {
      display: block;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
    }
    .faq-meta {
      display: flex;
      gap: 15px;
      margin-top: 10px;
      font-size: 12px;
      color: #999;
    }
    .category-tag {
      background: #e8f0fe;
      color: #1a73e8;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
    }
    .helpful-buttons {
      display: none;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
    }
    .helpful-buttons.show {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #1557b0;
    }
    button.secondary {
      background: #6c757d;
    }
    button.secondary:hover {
      background: #5a6268;
    }
    .no-results {
      text-align: center;
      padding: 40px;
      color: #999;
    }
    .stats {
      background: #e8f0fe;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
      border-left: 4px solid #1a73e8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>📚 FAQ & Knowledge Base</h2>

    <div class="search-box">
      <input type="text" id="searchInput" placeholder="🔍 Search for answers..." autofocus oninput="searchFAQs()">
    </div>

    <div class="categories">
      <div class="category-badge active" onclick="filterByCategory('')">All Categories</div>
      ${categories.map(function(cat) { return `
        <div class="category-badge" onclick="filterByCategory('${cat}')">${cat}</div>
      `; }).join('')}
    </div>

    <div class="stats" id="stats">
      Loading FAQs...
    </div>

    <div id="results">
      <div class="no-results">Type to search or select a category</div>
    </div>
  </div>

  <script>
    let allFAQs = [];
    let currentCategory = '';

    // Load FAQs on startup
    google.script.run
      .withSuccessHandler(onFAQsLoaded)
      .getAllFAQs();

    function onFAQsLoaded(faqs) {
      allFAQs = faqs;
      updateStats();
      showAllFAQs();
    }

    function updateStats() {
      const stats = document.getElementById('stats');
      stats.innerHTML = \`
        <strong>📊 Knowledge Base Stats:</strong>
        ${allFAQs.length} articles across ${new Set(allFAQs.map(function(f) { return f.category; })).size} categories
      \`;
    }

    function searchFAQs() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();

      if (!searchTerm && !currentCategory) {
        showAllFAQs();
        return;
      }

      let filtered = allFAQs;

      if (currentCategory) {
        filtered = filtered.filter(function(faq) { return faq.category === currentCategory; });
      }

      if (searchTerm) {
        filtered = filtered.filter(function(faq) {
          return faq.question.toLowerCase().includes(searchTerm) ||
                 faq.answer.toLowerCase().includes(searchTerm) ||
                 (faq.tags && faq.tags.toLowerCase().includes(searchTerm));
        });
      }

      displayFAQs(filtered);
    }

    function filterByCategory(category) {
      currentCategory = category;

      // Update active badge
      document.querySelectorAll('.category-badge').forEach(function(badge) {
        badge.classList.remove('active');
      });
      event.target.classList.add('active');

      searchFAQs();
    }

    function showAllFAQs() {
      displayFAQs(allFAQs);
    }

    function displayFAQs(faqs) {
      const results = document.getElementById('results');

      if (faqs.length === 0) {
        results.innerHTML = '<div class="no-results">No FAQs found. Try different search terms.</div>';
        return;
      }

      results.innerHTML = faqs.map((faq, index) => \`
        <div class="faq-item" onclick="toggleFAQ(\${index})">
          <div class="faq-question">
            ${faq.question}
          </div>
          <div class="faq-meta">
            <span class="category-tag">${faq.category}</span>
            ${faq.helpfulCount > 0 ? `<span>👍 ${faq.helpfulCount} found this helpful</span>` : ''}
          </div>
          <div class="faq-answer" id="answer\${index}">
            ${faq.answer}
          </div>
          <div class="helpful-buttons" id="buttons\${index}">
            <span>Was this helpful?</span>
            <button onclick="markHelpful(\${faq.id}, true); event.stopPropagation();">👍 Yes</button>
            <button class="secondary" onclick="markHelpful(\${faq.id}, false); event.stopPropagation();">👎 No</button>
          </div>
        </div>
      \`).join('');
    }

    function toggleFAQ(index) {
      const answer = document.getElementById('answer' + index);
      const buttons = document.getElementById('buttons' + index);

      answer.classList.toggle('show');
      buttons.classList.toggle('show');
    }

    function markHelpful(faqId, isHelpful) {
      google.script.run
        .withSuccessHandler(function() {
          // Reload FAQs to get updated counts
          google.script.run
            .withSuccessHandler(onFAQsLoaded)
            .getAllFAQs();
        })
        .updateFAQHelpfulness(faqId, isHelpful);
    }
  </script>
</body>
</html>
  `;
}

/**
 * Gets all FAQs
 * @returns {Array} FAQ array
 */
function getAllFAQs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const faqSheet = ss.getSheetByName(SHEETS.FAQ_DATABASE);

  if (!faqSheet) {
    return [];
  }

  const lastRow = faqSheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  const data = faqSheet.getRange(2, 1, lastRow - 1, 11).getValues();

  return data.map(function(row) { return {
    id: row[FAQ_COLS.ID - 1],
    category: row[FAQ_COLS.CATEGORY - 1],
    question: row[FAQ_COLS.QUESTION - 1],
    answer: row[FAQ_COLS.ANSWER - 1],
    tags: row[FAQ_COLS.TAGS - 1],
    relatedFAQs: row[FAQ_COLS.RELATED_FAQS - 1],
    helpfulCount: row[FAQ_COLS.HELPFUL_COUNT - 1] || 0,
    notHelpfulCount: row[FAQ_COLS.NOT_HELPFUL_COUNT - 1] || 0,
    createdDate: row[FAQ_COLS.CREATED_DATE - 1],
    lastUpdated: row[FAQ_COLS.LAST_UPDATED - 1],
    createdBy: row[FAQ_COLS.CREATED_BY - 1]
  };});
}

/**
 * Updates FAQ helpfulness rating
 * @param {number} faqId - FAQ ID
 * @param {boolean} isHelpful - Whether helpful or not
 */
function updateFAQHelpfulness(faqId, isHelpful) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const faqSheet = ss.getSheetByName(SHEETS.FAQ_DATABASE);

  if (!faqSheet) return;

  const lastRow = faqSheet.getLastRow();
  const data = faqSheet.getRange(2, 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][FAQ_COLS.ID - 1] === faqId) {
      const row = i + 2;
      const col = isHelpful ? FAQ_COLS.HELPFUL_COUNT : FAQ_COLS.NOT_HELPFUL_COUNT;

      const currentCount = faqSheet.getRange(row, col).getValue() || 0;
      faqSheet.getRange(row, col).setValue(currentCount + 1);

      break;
    }
  }
}

/**
 * Shows FAQ admin panel
 */
function showFAQAdmin() {
  const html = createFAQAdminHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(800)
    .setHeight(650);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '⚙️ FAQ Admin Panel');
}

/**
 * Creates HTML for FAQ admin
 */
function createFAQAdminHTML() {
  const categories = Object.values(FAQ_CATEGORIES);

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #1a73e8; margin-top: 0; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    .form-group { margin: 15px 0; }
    label { display: block; font-weight: 500; margin-bottom: 5px; color: #555; }
    input, select, textarea { width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; font-family: Arial, sans-serif; }
    textarea { min-height: 150px; resize: vertical; }
    button { background: #1a73e8; color: white; border: none; padding: 12px 24px; font-size: 14px; border-radius: 4px; cursor: pointer; margin: 10px 5px 0 0; }
    button:hover { background: #1557b0; }
    button.secondary { background: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <h2>⚙️ Add New FAQ</h2>

    <div class="form-group">
      <label>Category:</label>
      <select id="category">
        ${categories.map(function(cat) { return `<option value="${cat}">${cat}</option>`; }).join('')}
      </select>
    </div>

    <div class="form-group">
      <label>Question:</label>
      <input type="text" id="question" placeholder="Enter the question...">
    </div>

    <div class="form-group">
      <label>Answer:</label>
      <textarea id="answer" placeholder="Enter the detailed answer..."></textarea>
    </div>

    <div class="form-group">
      <label>Tags (comma-separated):</label>
      <input type="text" id="tags" placeholder="e.g., grievance, new, create, start">
    </div>

    <button onclick="saveFAQ()">💾 Save FAQ</button>
    <button class="secondary" onclick="google.script.host.close()">❌ Cancel</button>
  </div>

  <script>
    function saveFAQ() {
      const faq = {
        category: document.getElementById('category').value,
        question: document.getElementById('question').value.trim(),
        answer: document.getElementById('answer').value.trim(),
        tags: document.getElementById('tags').value.trim()
      };

      if (!faq.question || !faq.answer) {
        alert('Please fill in both question and answer');
        return;
      }

      google.script.run
        .withSuccessHandler(function() {
          alert('✅ FAQ saved successfully!');
          google.script.host.close();
        })
        .withFailureHandler(function(error) {
          alert('Error: ' + error.message);
        })
        .addNewFAQ(faq);
    }
  </script>
</body>
</html>
  `;
}

/**
 * Adds new FAQ
 * @param {Object} faq - FAQ data
 */
function addNewFAQ(faq) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let faqSheet = ss.getSheetByName(SHEETS.FAQ_DATABASE);

  if (!faqSheet) {
    createFAQDatabaseSheet();
    faqSheet = ss.getSheetByName(SHEETS.FAQ_DATABASE);
  }

  const lastRow = faqSheet.getLastRow();
  const nextId = lastRow > 1 ? faqSheet.getRange(lastRow, 1).getValue() + 1 : 1;

  const newRow = [
    nextId,
    faq.category,
    faq.question,
    faq.answer,
    faq.tags,
    '',
    0,
    0,
    new Date(),
    new Date(),
    Session.getActiveUser().getEmail() || 'User'
  ];

  faqSheet.getRange(lastRow + 1, 1, 1, 11).setValues([newRow]);
}
