/**
 * ============================================================================
 * INTERACTIVE TUTORIAL SYSTEM
 * ============================================================================
 *
 * Guided onboarding tour for first-time users with step-by-step walkthrough.
 *
 * Features:
 * - Welcome wizard for new users
 * - Step-by-step feature tours
 * - Video tutorial integration
 * - Progress tracking
 * - Skip/resume capability
 * - Context-sensitive help links
 * - Keyboard navigation
 *
 * @module InteractiveTutorial
 * @version 1.0.0
 * @author SEIU Local 509 Tech Team
 */

/**
 * Tutorial configuration
 */
const TUTORIAL_CONFIG = {
  SHOW_ON_FIRST_OPEN: true,
  HIGHLIGHT_COLOR: '#FFEB3B',
  PROGRESS_KEY: 'tutorial_progress',
  COMPLETED_KEY: 'tutorial_completed',
  SKIPPED_KEY: 'tutorial_skipped'
};

/**
 * Tutorial steps for the main walkthrough
 */
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to 509 Dashboard',
    content: 'This is your complete union management system for tracking members and grievances. Let\'s take a quick tour!',
    sheet: null,
    position: 'center',
    icon: '👋',
    duration: 0
  },
  {
    id: 'member_directory',
    title: 'Member Directory',
    content: 'The Member Directory contains all your union members. You can search, filter, and manage member information here.\n\n✅ 31 columns of member data\n✅ Automatic grievance status tracking\n✅ Steward contact history',
    sheet: SHEETS.MEMBER_DIR,
    position: 'sheet',
    icon: '👥',
    videoUrl: 'https://example.com/tutorials/member-directory'
  },
  {
    id: 'grievance_log',
    title: 'Grievance Log',
    content: 'Track all grievances from filing to resolution. The system automatically calculates deadlines and tracks the workflow.\n\n✅ Automatic deadline calculations\n✅ Step-by-step workflow tracking\n✅ Integration with Google Drive & Calendar',
    sheet: SHEETS.GRIEVANCE_LOG,
    position: 'sheet',
    icon: '📋',
    videoUrl: 'https://example.com/tutorials/grievance-log'
  },
  {
    id: 'dashboard',
    title: 'Main Dashboard',
    content: 'Get a real-time overview of all union metrics. See open grievances, member counts, and upcoming deadlines at a glance.',
    sheet: SHEETS.DASHBOARD,
    position: 'sheet',
    icon: '📊',
    videoUrl: 'https://example.com/tutorials/dashboard'
  },
  {
    id: 'menus',
    title: 'Navigation Menus',
    content: 'The menu bar gives you access to all features:\n\n👤 Dashboard - Daily operations\n📊 Sheet Manager - Data management\n🔧 Setup - Configuration\n⚙️ Administrator - System settings',
    sheet: null,
    position: 'center',
    icon: '🧭'
  },
  {
    id: 'start_grievance',
    title: 'Starting a Grievance',
    content: 'To start a new grievance:\n\n1. Go to Member Directory\n2. Find the member\n3. Check the "Start Grievance" checkbox (column AE)\n4. Fill out the grievance form\n\nOr use: Dashboard menu → Grievance Tools → Start New Grievance',
    sheet: SHEETS.MEMBER_DIR,
    position: 'sheet',
    icon: '➕'
  },
  {
    id: 'email_integration',
    title: 'Email Integration',
    content: 'Send emails directly from the dashboard:\n\n📧 Use email templates for common messages\n📝 Track all communications in the log\n📎 Attach grievance PDFs automatically',
    sheet: null,
    position: 'center',
    icon: '📧'
  },
  {
    id: 'keyboard_shortcuts',
    title: 'Keyboard Shortcuts',
    content: 'Speed up your work with keyboard shortcuts:\n\n• Ctrl+Shift+S: Quick search\n• Ctrl+Z: Undo last action\n• Ctrl+Y: Redo\n• F1: Context help\n\nView all shortcuts: Help menu → Keyboard Shortcuts',
    sheet: null,
    position: 'center',
    icon: '⌨️'
  },
  {
    id: 'hidden_sheets',
    title: 'Auto-Updating Data',
    content: 'The dashboard uses hidden sheets to keep data synchronized:\n\n✅ Member Directory columns AB-AD auto-update from Grievance Log\n✅ Grievance Log columns C-D, X-AA auto-update from Member Directory\n✅ Engagement columns Q-T update from Meeting/Volunteer sheets\n\n🔧 If data stops syncing, run:\nAdministrator → Setup & Triggers → Verify Hidden Sheets',
    sheet: null,
    position: 'center',
    icon: '🔄'
  },
  {
    id: 'complete',
    title: 'You\'re Ready!',
    content: 'You\'ve completed the basic tour. Here are some next steps:\n\n📚 Explore the FAQ & Help sections\n🎥 Watch video tutorials for detailed guidance\n📧 Contact support if you need help\n\nGood luck with your union work!',
    sheet: null,
    position: 'center',
    icon: '🎉'
  }
];

/**
 * Video tutorial library
 *
 * NOTE: Update URLs once videos are recorded. See VIDEO_SCRIPTS.md for
 * detailed recording scripts for each tutorial.
 *
 * Recommended hosting: YouTube (unlisted), Vimeo, or Google Drive
 */
const VIDEO_TUTORIALS = [
  {
    id: 'getting_started',
    title: 'Getting Started with 509 Dashboard',
    description: 'Navigate the dashboard, understand the 6 menus, explore Member Directory, Grievance Log, and Dashboard sheets',
    duration: '8-10 min',
    category: 'Basics',
    url: 'https://example.com/tutorials/getting-started',
    thumbnail: '🎬',
    scriptRef: 'VIDEO_SCRIPTS.md#video-1-getting-started-with-509-dashboard'
  },
  {
    id: 'member_management',
    title: 'Managing Members',
    description: 'Add new members (31 columns), search and filter, update contact info, track engagement metrics',
    duration: '6-8 min',
    category: 'Members',
    url: 'https://example.com/tutorials/members',
    thumbnail: '👥',
    scriptRef: 'VIDEO_SCRIPTS.md#video-2-managing-members'
  },
  {
    id: 'grievance_workflow',
    title: 'Grievance Workflow',
    description: 'Complete grievance lifecycle: filing, automatic deadline calculations (Article 23), status updates, outcomes, Google Drive folders',
    duration: '12-15 min',
    category: 'Grievances',
    url: 'https://example.com/tutorials/grievances',
    thumbnail: '📋',
    scriptRef: 'VIDEO_SCRIPTS.md#video-3-grievance-workflow'
  },
  {
    id: 'email_communications',
    title: 'Email Communications',
    description: 'Email templates, compose custom emails, bulk communications, automatic logging',
    duration: '5-6 min',
    category: 'Communication',
    url: 'https://example.com/tutorials/email',
    thumbnail: '📧',
    scriptRef: 'VIDEO_SCRIPTS.md#video-4-email-communications'
  },
  {
    id: 'reports_analytics',
    title: 'Reports & Analytics',
    description: 'Main Dashboard metrics, Unified Operations Monitor, Interactive Dashboard customization, Steward Workload analysis, report generation',
    duration: '10-12 min',
    category: 'Reporting',
    url: 'https://example.com/tutorials/reports',
    thumbnail: '📊',
    scriptRef: 'VIDEO_SCRIPTS.md#video-5-reports--analytics'
  },
  {
    id: 'calendar_integration',
    title: 'Calendar Integration',
    description: 'Sync grievance deadlines with Google Calendar, set up reminders, never miss a deadline',
    duration: '4-5 min',
    category: 'Integration',
    url: 'https://example.com/tutorials/calendar',
    thumbnail: '📅',
    scriptRef: 'VIDEO_SCRIPTS.md#video-6-calendar-integration'
  },
  {
    id: 'batch_operations',
    title: 'Batch Operations',
    description: 'Bulk updates, import/export CSV data, data cleanup and validation tools',
    duration: '6-7 min',
    category: 'Advanced',
    url: 'https://example.com/tutorials/batch',
    thumbnail: '⚡',
    scriptRef: 'VIDEO_SCRIPTS.md#video-7-batch-operations'
  },
  {
    id: 'steward_guide',
    title: 'Steward Quick Guide',
    description: 'Daily workflow for stewards: checking deadlines, helping members file, tracking your cases, updating progress',
    duration: '8-10 min',
    category: 'Role-Specific',
    url: 'https://example.com/tutorials/steward',
    thumbnail: '👨‍⚖️',
    scriptRef: 'VIDEO_SCRIPTS.md#video-8-steward-quick-guide'
  },
  {
    id: 'hidden_sheets',
    title: 'Hidden Sheet Architecture',
    description: 'Understand auto-updating columns: how grievance data syncs to Member Directory, how member data syncs to Grievance Log, troubleshooting sync issues',
    duration: '5-6 min',
    category: 'Advanced',
    url: 'https://example.com/tutorials/hidden-sheets',
    thumbnail: '🔄',
    scriptRef: 'VIDEO_SCRIPTS.md#video-9-hidden-sheet-architecture'
  }
];

/**
 * Shows the interactive tutorial for first-time users
 */
function showInteractiveTutorial() {
  // Check if tutorial was completed or skipped
  const props = PropertiesService.getUserProperties();
  const completed = props.getProperty(TUTORIAL_CONFIG.COMPLETED_KEY);

  if (completed === 'true') {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '📚 Tutorial',
      'You\'ve already completed the tutorial. Would you like to take it again?',
      ui.ButtonSet.YES_NO
    );

    if (response !== ui.Button.YES) return;
  }

  // Reset progress
  props.setProperty(TUTORIAL_CONFIG.PROGRESS_KEY, '0');

  // Show tutorial
  showTutorialStep(0);
}

/**
 * Shows a specific tutorial step
 * @param {number} stepIndex - Index of the step to show
 */
function showTutorialStep(stepIndex) {
  if (stepIndex >= TUTORIAL_STEPS.length) {
    completeTutorial();
    return;
  }

  const step = TUTORIAL_STEPS[stepIndex];

  // Navigate to sheet if specified
  if (step.sheet) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(step.sheet);
    if (sheet) {
      ss.setActiveSheet(sheet);
    }
  }

  const html = createTutorialStepHTML(step, stepIndex);
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    `${step.icon} Tutorial (${stepIndex + 1}/${TUTORIAL_STEPS.length})`
  );

  // Save progress
  const props = PropertiesService.getUserProperties();
  props.setProperty(TUTORIAL_CONFIG.PROGRESS_KEY, stepIndex.toString());
}

/**
 * Creates HTML for a tutorial step
 * @param {Object} step - Tutorial step object
 * @param {number} stepIndex - Current step index
 * @returns {string} HTML content
 */
function createTutorialStepHTML(step, stepIndex) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TUTORIAL_STEPS.length - 1;
  const progress = ((stepIndex + 1) / TUTORIAL_STEPS.length) * 100;

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body {
      font-family: 'Roboto', Arial, sans-serif;
      padding: 0;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100%;
    }
    .container {
      padding: 30px;
      text-align: center;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 15px;
    }
    h2 {
      color: white;
      margin: 0 0 20px 0;
      font-size: 24px;
    }
    .content {
      background: white;
      padding: 25px;
      border-radius: 12px;
      text-align: left;
      white-space: pre-line;
      line-height: 1.8;
      font-size: 14px;
      color: #333;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .progress-bar {
      background: rgba(255,255,255,0.3);
      border-radius: 10px;
      height: 8px;
      margin: 20px 0;
      overflow: hidden;
    }
    .progress-fill {
      background: #4CAF50;
      height: 100%;
      width: ${progress}%;
      border-radius: 10px;
      transition: width 0.3s;
    }
    .progress-text {
      color: rgba(255,255,255,0.9);
      font-size: 12px;
      margin-top: 5px;
    }
    .buttons {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 20px;
    }
    button {
      padding: 12px 24px;
      font-size: 14px;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: white;
      color: #764ba2;
      font-weight: bold;
    }
    .btn-primary:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.2);
      color: white;
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.3);
    }
    .btn-skip {
      background: transparent;
      color: rgba(255,255,255,0.7);
      font-size: 12px;
      padding: 8px 16px;
    }
    .video-link {
      display: inline-block;
      margin-top: 15px;
      padding: 8px 16px;
      background: #f0f0f0;
      color: #1a73e8;
      text-decoration: none;
      border-radius: 20px;
      font-size: 13px;
    }
    .video-link:hover {
      background: #e0e0e0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${step.icon}</div>
    <h2>${step.title}</h2>

    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <div class="progress-text">Step ${stepIndex + 1} of ${TUTORIAL_STEPS.length}</div>

    <div class="content">
      ${step.content}
      ${step.videoUrl ? `<a class="video-link" href="${step.videoUrl}" target="_blank">🎥 Watch Video Tutorial</a>` : ''}
    </div>

    <div class="buttons">
      ${!isFirst ? '<button class="btn-secondary" onclick="prevStep()">← Previous</button>' : ''}
      <button class="btn-primary" onclick="nextStep()">
        ${isLast ? '✅ Complete Tutorial' : 'Next →'}
      </button>
    </div>

    ${!isLast ? '<button class="btn-skip" onclick="skipTutorial()">Skip Tutorial</button>' : ''}
  </div>

  <script>
    function nextStep() {
      google.script.run.showTutorialStep(${stepIndex + 1});
      google.script.host.close();
    }

    function prevStep() {
      google.script.run.showTutorialStep(${stepIndex - 1});
      google.script.host.close();
    }

    function skipTutorial() {
      if (confirm('Are you sure you want to skip the tutorial? You can restart it anytime from the Help menu.')) {
        google.script.run.skipTutorial();
        google.script.host.close();
      }
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft' && ${stepIndex} > 0) {
        prevStep();
      } else if (e.key === 'Escape') {
        skipTutorial();
      }
    });
  </script>
</body>
</html>
  `;
}

/**
 * Completes the tutorial
 */
function completeTutorial() {
  const props = PropertiesService.getUserProperties();
  props.setProperty(TUTORIAL_CONFIG.COMPLETED_KEY, 'true');
  props.setProperty(TUTORIAL_CONFIG.PROGRESS_KEY, TUTORIAL_STEPS.length.toString());

  SpreadsheetApp.getUi().alert(
    '🎉 Tutorial Complete!',
    'Congratulations! You\'ve completed the 509 Dashboard tutorial.\n\n' +
    'You can always:\n' +
    '• Restart the tutorial from Help menu\n' +
    '• Watch video tutorials for more details\n' +
    '• Check the FAQ for common questions\n\n' +
    'Good luck with your union work!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Skips the tutorial
 */
function skipTutorial() {
  const props = PropertiesService.getUserProperties();
  props.setProperty(TUTORIAL_CONFIG.SKIPPED_KEY, 'true');

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Tutorial skipped. You can restart it anytime from the Help menu.',
    'Tutorial Skipped',
    5
  );
}

/**
 * Resets tutorial progress
 */
function resetTutorialProgress() {
  const props = PropertiesService.getUserProperties();
  props.deleteProperty(TUTORIAL_CONFIG.COMPLETED_KEY);
  props.deleteProperty(TUTORIAL_CONFIG.SKIPPED_KEY);
  props.deleteProperty(TUTORIAL_CONFIG.PROGRESS_KEY);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    'Tutorial progress has been reset. Start the tutorial again from the Help menu.',
    'Reset Complete',
    3
  );
}

/**
 * Shows video tutorial library
 */
function showVideoTutorials() {
  const categories = [...new Set(VIDEO_TUTORIALS.map(v => v.category))];

  let categorySections = '';
  categories.forEach(category => {
    const tutorials = VIDEO_TUTORIALS.filter(v => v.category === category);
    categorySections += `
      <div class="category">
        <h3>${category}</h3>
        ${tutorials.map(t => `
          <div class="video-card" onclick="openVideo('${t.url}')">
            <div class="thumbnail">${t.thumbnail}</div>
            <div class="video-info">
              <div class="video-title">${t.title}</div>
              <div class="video-desc">${t.description}</div>
              <div class="video-duration">⏱️ ${t.duration}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; }
    h2 { color: #1a73e8; margin-top: 0; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    h3 { color: #333; margin-top: 25px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e0e0e0; }
    .video-card {
      background: white;
      border-radius: 8px;
      padding: 15px;
      margin: 10px 0;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .video-card:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .thumbnail {
      font-size: 40px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f0f0;
      border-radius: 8px;
      margin-right: 15px;
    }
    .video-info { flex: 1; }
    .video-title { font-weight: bold; color: #1a73e8; margin-bottom: 5px; }
    .video-desc { color: #666; font-size: 13px; margin-bottom: 5px; }
    .video-duration { color: #999; font-size: 12px; }
    .search-box {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
      box-sizing: border-box;
    }
    .search-box:focus {
      outline: none;
      border-color: #1a73e8;
    }
    .no-results {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🎥 Video Tutorial Library</h2>

    <input type="text" class="search-box" placeholder="🔍 Search tutorials..." oninput="filterTutorials(this.value)">

    <div id="tutorials">
      ${categorySections}
    </div>

    <div id="no-results" class="no-results" style="display: none;">
      No tutorials found matching your search.
    </div>
  </div>

  <script>
    const tutorials = ${JSON.stringify(VIDEO_TUTORIALS)};

    function openVideo(url) {
      window.open(url, '_blank');
    }

    function filterTutorials(query) {
      const cards = document.querySelectorAll('.video-card');
      const categories = document.querySelectorAll('.category');
      let found = 0;

      query = query.toLowerCase();

      cards.forEach(card => {
        const title = card.querySelector('.video-title').textContent.toLowerCase();
        const desc = card.querySelector('.video-desc').textContent.toLowerCase();

        if (title.includes(query) || desc.includes(query) || query === '') {
          card.style.display = 'flex';
          found++;
        } else {
          card.style.display = 'none';
        }
      });

      categories.forEach(cat => {
        const visibleCards = cat.querySelectorAll('.video-card[style="display: flex;"]');
        cat.style.display = visibleCards.length > 0 || query === '' ? 'block' : 'none';
      });

      document.getElementById('no-results').style.display = found === 0 && query !== '' ? 'block' : 'none';
    }
  </script>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(700)
    .setHeight(600);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '🎥 Video Tutorials');
}

/**
 * Shows quick start guide dialog
 */
function showQuickStartGuide() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 25px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #1a73e8; margin-top: 0; }
    .step { display: flex; align-items: flex-start; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
    .step-number { background: #1a73e8; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
    .step-content h4 { margin: 0 0 5px 0; color: #333; }
    .step-content p { margin: 0; color: #666; font-size: 14px; }
    .tip { background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50; margin-top: 20px; }
    .tip-title { font-weight: bold; color: #2e7d32; margin-bottom: 5px; }
    button { background: #1a73e8; color: white; border: none; padding: 12px 24px; font-size: 14px; border-radius: 4px; cursor: pointer; margin-top: 15px; margin-right: 10px; }
    button:hover { background: #1557b0; }
    button.secondary { background: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🚀 Quick Start Guide</h2>

    <div class="step">
      <div class="step-number">1</div>
      <div class="step-content">
        <h4>Navigate to Member Directory</h4>
        <p>Click on the "Member Directory" tab to view and manage all union members.</p>
      </div>
    </div>

    <div class="step">
      <div class="step-number">2</div>
      <div class="step-content">
        <h4>Find a Member</h4>
        <p>Use Ctrl+F to search, or go to Dashboard → Search & Lookup → Search Members.</p>
      </div>
    </div>

    <div class="step">
      <div class="step-number">3</div>
      <div class="step-content">
        <h4>Start a Grievance</h4>
        <p>Check the "Start Grievance" checkbox in column AE, or use the Grievance Tools menu.</p>
      </div>
    </div>

    <div class="step">
      <div class="step-number">4</div>
      <div class="step-content">
        <h4>Track Deadlines</h4>
        <p>The Dashboard shows upcoming deadlines. Sync with Google Calendar for reminders.</p>
      </div>
    </div>

    <div class="step">
      <div class="step-number">5</div>
      <div class="step-content">
        <h4>Communicate</h4>
        <p>Use Dashboard → Communications → Compose Email to send member communications.</p>
      </div>
    </div>

    <div class="tip">
      <div class="tip-title">💡 Pro Tip</div>
      Press F1 anywhere for context-sensitive help, or use Ctrl+Shift+S for quick search!
    </div>

    <button onclick="startTutorial()">📚 Take Full Tutorial</button>
    <button onclick="watchVideo()">🎥 Watch Video</button>
    <button class="secondary" onclick="google.script.host.close()">Close</button>
  </div>

  <script>
    function startTutorial() {
      google.script.run.showInteractiveTutorial();
      google.script.host.close();
    }
    function watchVideo() {
      google.script.run.showVideoTutorials();
      google.script.host.close();
    }
  </script>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(500)
    .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '🚀 Quick Start Guide');
}

/**
 * Checks if user should see tutorial on first open
 * Called from onOpen trigger
 */
function checkFirstTimeUser() {
  if (!TUTORIAL_CONFIG.SHOW_ON_FIRST_OPEN) return;

  const props = PropertiesService.getUserProperties();
  const completed = props.getProperty(TUTORIAL_CONFIG.COMPLETED_KEY);
  const skipped = props.getProperty(TUTORIAL_CONFIG.SKIPPED_KEY);

  // Don't show if already completed or skipped
  if (completed === 'true' || skipped === 'true') return;

  // Check if this is first visit
  const lastVisit = props.getProperty('last_visit');
  if (!lastVisit) {
    // First time user - show welcome
    props.setProperty('last_visit', new Date().toISOString());

    // Show after a short delay to let the spreadsheet load
    Utilities.sleep(1000);
    showWelcomeWizard();
  }
}

/**
 * Shows welcome wizard for first-time users
 */
function showWelcomeWizard() {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body {
      font-family: 'Roboto', Arial, sans-serif;
      padding: 0;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 40px;
      max-width: 500px;
    }
    .logo { font-size: 80px; margin-bottom: 20px; }
    h1 { color: white; font-size: 32px; margin: 0 0 10px 0; }
    .subtitle { color: rgba(255,255,255,0.9); font-size: 18px; margin-bottom: 30px; }
    .options {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 30px;
    }
    button {
      padding: 15px 30px;
      font-size: 16px;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: white;
      color: #764ba2;
      font-weight: bold;
    }
    .btn-primary:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.2);
      color: white;
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.3);
    }
    .btn-tertiary {
      background: transparent;
      color: rgba(255,255,255,0.7);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">👋</div>
    <h1>Welcome to 509 Dashboard!</h1>
    <div class="subtitle">Your complete union management system</div>

    <div class="options">
      <button class="btn-primary" onclick="startTutorial()">
        📚 Take the Guided Tour (Recommended)
      </button>
      <button class="btn-secondary" onclick="quickStart()">
        🚀 Quick Start Guide
      </button>
      <button class="btn-secondary" onclick="watchVideos()">
        🎥 Watch Video Tutorials
      </button>
      <button class="btn-tertiary" onclick="skipWelcome()">
        Skip for now - I'll explore on my own
      </button>
    </div>
  </div>

  <script>
    function startTutorial() {
      google.script.run.showInteractiveTutorial();
      google.script.host.close();
    }
    function quickStart() {
      google.script.run.showQuickStartGuide();
      google.script.host.close();
    }
    function watchVideos() {
      google.script.run.showVideoTutorials();
      google.script.host.close();
    }
    function skipWelcome() {
      google.script.run.skipTutorial();
      google.script.host.close();
    }
  </script>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(550)
    .setHeight(450);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Welcome');
}

/**
 * Gets tutorial progress for user
 * @returns {Object} Progress information
 */
function getTutorialProgress() {
  const props = PropertiesService.getUserProperties();

  return {
    currentStep: parseInt(props.getProperty(TUTORIAL_CONFIG.PROGRESS_KEY) || '0'),
    totalSteps: TUTORIAL_STEPS.length,
    completed: props.getProperty(TUTORIAL_CONFIG.COMPLETED_KEY) === 'true',
    skipped: props.getProperty(TUTORIAL_CONFIG.SKIPPED_KEY) === 'true'
  };
}
