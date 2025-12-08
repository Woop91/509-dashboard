/**
 * ============================================================================
 * ENHANCED HELP & CONTEXT-SENSITIVE GUIDANCE
 * ============================================================================
 *
 * Advanced help system with searchable documentation
 * Features:
 * - Searchable help articles
 * - Context-sensitive tooltips
 * - Interactive tutorials
 * - Video guides (links)
 * - Quick tips
 * - Keyboard shortcut reference
 * - Troubleshooting wizard
 */

/**
 * Help article database
 */
const HELP_ARTICLES = [
  {
    id: 'getting-started',
    category: 'Getting Started',
    title: 'Getting Started with 509 Dashboard',
    keywords: 'start begin setup introduction',
    content: `
# Getting Started

Welcome to the 509 Dashboard! This guide will help you get started.

## First Steps
1. Review the Dashboard sheet for an overview
2. Navigate to Member Directory to see all members
3. Check the Grievance Log for active cases
4. Use the menu (📊 509 Dashboard) to access all features

## Key Features
- **Member Management**: Track 20,000+ members
- **Grievance Tracking**: Full lifecycle management
- **Analytics**: Real-time dashboards and reports
- **Automation**: Email notifications and scheduled reports
- **Collaboration**: Shared access and workflows

## Need Help?
Use the search function to find specific features or browse the FAQ.
    `
  },
  {
    id: 'grievance-workflow',
    category: 'Grievances',
    title: 'Grievance Workflow Guide',
    keywords: 'grievance process workflow steps stages',
    content: `
# Grievance Workflow

Understanding the grievance process from filing to resolution.

## Workflow States
1. **Filed**: Initial submission
2. **Step 1 Pending**: Awaiting first level review
3. **Step 2 Appeal**: Second level escalation
4. **Step 3 Appeal**: Final internal appeal
5. **Mediation**: External mediation process
6. **Arbitration**: Formal arbitration
7. **Resolved**: Case closed with outcome
8. **Withdrawn**: Cancelled by member

## State Transitions
Use Workflow Management menu to:
- View current state
- Change states (with validation)
- Batch update multiple grievances
- View workflow visualizer

## Deadlines
Deadlines are automatically calculated based on:
- Contract terms
- State-specific timelines
- Calendar events
    `
  },
  {
    id: 'batch-operations',
    category: 'Operations',
    title: 'Using Batch Operations',
    keywords: 'batch bulk operations multiple mass',
    content: `
# Batch Operations

Efficiently manage multiple grievances at once.

## Available Operations
1. **Bulk Assign Steward**: Assign multiple cases to one steward
2. **Bulk Update Status**: Change status for selected grievances
3. **Bulk Export PDF**: Generate PDFs for multiple cases
4. **Bulk Email**: Send notifications to multiple stakeholders
5. **Bulk Add Notes**: Add notes to multiple grievances

## How to Use
1. Select rows in Grievance Log
2. Go to ⚡ Batch Operations menu
3. Choose operation
4. Follow prompts
5. Review confirmation

## Tips
- Select consecutive rows for better performance
- Review selection before executing
- Use filters to narrow down cases first
    `
  },
  {
    id: 'reports-analytics',
    category: 'Reports',
    title: 'Reports and Analytics',
    keywords: 'reports analytics charts data visualization',
    content: `
# Reports and Analytics

Generate insights from your grievance data.

## Dashboard Views
- **Main Dashboard**: Executive summary
- **Interactive Dashboard**: Customizable views
- **Steward Workload**: Caseload distribution
- **Trends**: Historical analysis
- **Location Analytics**: Geographic patterns

## Custom Reports
Use the Custom Report Builder:
1. Select fields to include
2. Apply filters
3. Choose sort order
4. Generate report
5. Export to PDF/CSV/Excel

## Advanced Visualization
- Interactive charts with Google Charts
- Multiple chart types (bar, line, pie, etc.)
- Drill-down capabilities
- Export charts as images
    `
  },
  {
    id: 'automation',
    category: 'Automation',
    title: 'Automation Features',
    keywords: 'automation scheduled triggers email notifications',
    content: `
# Automation

Set up automated tasks to save time.

## Email Notifications
- Daily deadline reminders (8 AM)
- Overdue case alerts
- Status change notifications
- Customizable recipients

## Scheduled Reports
- Monthly executive summary
- Quarterly trend analysis
- Weekly steward workload
- Custom report schedules

## Calendar Integration
- Sync deadlines to Google Calendar
- Auto-create calendar events
- Deadline reminders
- Team calendar sharing

## Setup
1. Go to 🤖 Automation menu
2. Enable desired features
3. Configure settings
4. Test before deploying
    `
  }
];

/**
 * Shows enhanced help center
 */
function showEnhancedHelp() {
  const html = createEnhancedHelpHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(1000)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '❓ Help Center');
}

/**
 * Creates HTML for help center
 */
function createEnhancedHelpHTML() {
  let articleList = '';
  const categories = [...new Set(HELP_ARTICLES.map(a => a.category))];

  categories.forEach(category => {
    const articles = HELP_ARTICLES.filter(a => a.category === category);
    articleList += `<div class="category-section">
      <div class="category-title">${category}</div>
      ${articles.map(article => `
        <div class="article-link" onclick="showArticle('${article.id}')">
          📄 ${article.title}
        </div>
      `).join('')}
    </div>`;
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .layout { display: grid; grid-template-columns: 300px 1fr; height: 100vh; }
    .sidebar { background: white; padding: 20px; border-right: 1px solid #e0e0e0; overflow-y: auto; }
    .main { padding: 30px; overflow-y: auto; background: white; }
    h1 { color: #1a73e8; margin-top: 0; font-size: 28px; }
    h2 { color: #333; font-size: 20px; margin-top: 25px; }
    .search-box { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; margin-bottom: 20px; }
    .category-section { margin: 20px 0; }
    .category-title { font-weight: bold; color: #1a73e8; margin-bottom: 10px; font-size: 14px; }
    .article-link { padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
    .article-link:hover { background: #e8f0fe; transform: translateX(5px); }
    .article-content { line-height: 1.8; color: #555; }
    .article-content h1 { color: #1a73e8; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    .article-content h2 { color: #333; margin-top: 30px; }
    .article-content ul, .article-content ol { padding-left: 25px; }
    .article-content li { margin: 10px 0; }
    .article-content code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    .quick-links { background: #e8f0fe; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .quick-links h3 { margin-top: 0; color: #1a73e8; }
    .quick-link-btn { display: inline-block; background: #1a73e8; color: white; padding: 8px 16px; border-radius: 6px; margin: 5px; text-decoration: none; cursor: pointer; font-size: 13px; }
    .quick-link-btn:hover { background: #1557b0; }
    button { background: #1a73e8; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin: 5px; }
    button:hover { background: #1557b0; }
  </style>
</head>
<body>
  <div class="layout">
    <div class="sidebar">
      <h2 style="margin-top: 0;">❓ Help Center</h2>
      <input type="text" class="search-box" placeholder="Search help..." oninput="searchArticles(this.value)">

      <div id="articleList">
        ${articleList}
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
        <button onclick="showKeyboardShortcuts()" style="width: 100%;">⌨️ Keyboard Shortcuts</button>
        <button onclick="showVideoTutorials()" style="width: 100%; background: #6c757d;">🎥 Video Tutorials</button>
      </div>
    </div>

    <div class="main">
      <div id="articleContent">
        <h1>Welcome to Help Center</h1>
        <p>Select an article from the sidebar or use the search function to find what you need.</p>

        <div class="quick-links">
          <h3>🚀 Quick Start</h3>
          <span class="quick-link-btn" onclick="showArticle('getting-started')">Getting Started Guide</span>
          <span class="quick-link-btn" onclick="showArticle('grievance-workflow')">Grievance Workflow</span>
          <span class="quick-link-btn" onclick="showArticle('batch-operations')">Batch Operations</span>
        </div>

        <h2>Popular Topics</h2>
        <ul>
          <li>How to file a new grievance</li>
          <li>Managing member directory</li>
          <li>Generating custom reports</li>
          <li>Setting up automation</li>
          <li>Using keyboard shortcuts</li>
        </ul>

        <h2>Need More Help?</h2>
        <p>Can't find what you're looking for? Try:</p>
        <ul>
          <li>Searching with different keywords</li>
          <li>Browsing the FAQ Knowledge Base</li>
          <li>Checking the release notes for new features</li>
          <li>Contacting system administrator</li>
        </ul>
      </div>
    </div>
  </div>

  <script>
    const articles = ${JSON.stringify(HELP_ARTICLES)};

    function showArticle(articleId) {
      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      // Convert markdown-like content to HTML
      let html = article.content
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^\*\* (.+)$/gm, '<strong>$1</strong>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

      // Wrap consecutive list items in ul
      html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

      document.getElementById('articleContent').innerHTML = '<div class="article-content">' + html + '</div>';
    }

    function searchArticles(query) {
      if (!query) {
        location.reload();
        return;
      }

      const results = articles.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.keywords.toLowerCase().includes(query.toLowerCase()) ||
        a.content.toLowerCase().includes(query.toLowerCase())
      );

      if (results.length === 0) {
        document.getElementById('articleContent').innerHTML = '<h1>No Results</h1><p>No articles match your search.</p>';
        document.getElementById('articleList').innerHTML = '<p style="text-align: center; color: #999;">No matching articles</p>';
        return;
      }

      let html = results.map(article => \`
        <div class="article-link" onclick="showArticle('\${article.id}')">
          📄 \${article.title}
        </div>
      \`).join('');

      document.getElementById('articleList').innerHTML = html;

      // Show first result
      if (results.length > 0) {
        showArticle(results[0].id);
      }
    }

    function showKeyboardShortcuts() {
      google.script.run.showKeyboardShortcuts();
    }

    function showVideoTutorials() {
      alert('Video Tutorials:\\n\\n🎥 Coming soon!\\n\\nVideo tutorials will be available at:\\nhttps://docs.509dashboard.org/videos');
    }
  </script>
</body>
</html>
  `;
}

/**
 * Shows context help based on current sheet (plain text version)
 * Note: Canonical showContextHelp() is in ContextSensitiveHelp.gs
 */
function showContextHelpPlainText() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const sheetName = activeSheet.getName();

  let helpText = '';
  let title = 'Context Help';

  switch (sheetName) {
    case SHEETS.GRIEVANCE_LOG:
      title = 'Grievance Log Help';
      helpText = `
GRIEVANCE LOG

This sheet tracks all grievances from filing to resolution.

KEY COLUMNS:
• Grievance ID: Unique identifier
• Status: Current state of grievance
• Current Step: Workflow stage
• Dates: Filing, deadlines, resolutions
• Days Open: Auto-calculated
• Next Action Due: Auto-calculated deadline

QUICK ACTIONS:
• Use Grievance Tools menu to start new grievance
• Batch Operations for bulk updates
• Right-click row for quick actions

TIPS:
• Deadlines are calculated automatically
• Use filters to find specific cases
• Export to PDF for sharing
      `;
      break;

    case SHEETS.MEMBER_DIR:
      title = 'Member Directory Help';
      helpText = `
MEMBER DIRECTORY

Comprehensive database of all union members.

KEY COLUMNS:
• Member ID: Unique identifier (M000001 format)
• Contact Info: Email, phone
• Assignment: Location, unit, steward
• Engagement: Event attendance, volunteer hours

QUICK ACTIONS:
• Search Members (🔍) for fast lookup
• Use filters to segment members
• Export for mail merges

TIPS:
• 20,000+ members supported
• Steward assignments auto-link to grievances
• Track engagement metrics
      `;
      break;

    case SHEETS.DASHBOARD:
      title = 'Dashboard Help';
      helpText = `
DASHBOARD

Real-time overview of key metrics and KPIs.

SECTIONS:
• Executive Summary: High-level stats
• Active Grievances: Current caseload
• Deadlines: Upcoming and overdue
• Trends: Historical analysis

FEATURES:
• Auto-refreshes on data changes
• Click metrics for drill-down
• Export charts and reports

TIPS:
• Use 🔄 Refresh All to update
• Interactive Dashboard for customization
• Multiple dashboard views available
      `;
      break;

    default:
      title = 'Help';
      helpText = `
509 DASHBOARD

For detailed help on this sheet, use:
• Help Center (❓ Help & Support menu)
• Search help articles
• View getting started guide

Common Actions:
• 📊 Dashboards: View analytics
• 🔍 Search: Find members/grievances
• ⚡ Batch Operations: Bulk updates
• 📊 Reports: Generate reports
      `;
  }

  SpreadsheetApp.getUi().alert(title, helpText, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Shows quick tips
 */
function showQuickTips() {
  const tips = [
    '💡 Use Ctrl+Z to undo recent actions',
    '💡 Press F1 for context-sensitive help',
    '💡 Enable dark mode in Accessibility menu',
    '💡 Set up automation to save time',
    '💡 Use batch operations for multiple grievances',
    '💡 Customize your dashboard in Interactive View',
    '💡 Track session activity in My Session',
    '💡 Export data to PDF, CSV, or Excel',
    '💡 Mobile dashboard available for touch devices',
    '💡 Create custom reports with Report Builder'
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  SpreadsheetApp.getActiveSpreadsheet().toast(
    randomTip,
    'Quick Tip',
    5
  );
}
