/**
 * ------------------------------------------------------------------------====
 * DARK MODE & THEME CUSTOMIZATION
 * ------------------------------------------------------------------------====
 *
 * Comprehensive theming system with dark mode support
 * Features:
 * - Multiple theme presets (Light, Dark, OLED, Blue, Sepia)
 * - Custom theme builder
 * - Per-user theme preferences
 * - Automatic theme switching (time-based)
 * - Sheet-specific theming
 * - Quick theme toggle
 */

/**
 * Theme configuration
 */
THEME_CONFIG = {
  THEMES: {
    LIGHT: {
      name: 'Light',
      icon: '☀️',
      background: '#ffffff',
      headerBackground: '#1a73e8',
      headerText: '#ffffff',
      evenRow: '#f8f9fa',
      oddRow: '#ffffff',
      text: '#202124',
      border: '#dadce0',
      accent: '#1a73e8'
    },
    DARK: {
      name: 'Dark',
      icon: '🌙',
      background: '#202124',
      headerBackground: '#35363a',
      headerText: '#e8eaed',
      evenRow: '#292a2d',
      oddRow: '#202124',
      text: '#e8eaed',
      border: '#5f6368',
      accent: '#8ab4f8'
    },
    OLED: {
      name: 'OLED Black',
      icon: '🌑',
      background: '#000000',
      headerBackground: '#1a1a1a',
      headerText: '#ffffff',
      evenRow: '#0a0a0a',
      oddRow: '#000000',
      text: '#ffffff',
      border: '#333333',
      accent: '#bb86fc'
    },
    BLUE: {
      name: 'Ocean Blue',
      icon: '🌊',
      background: '#e3f2fd',
      headerBackground: '#1565c0',
      headerText: '#ffffff',
      evenRow: '#bbdefb',
      oddRow: '#e3f2fd',
      text: '#0d47a1',
      border: '#90caf9',
      accent: '#1976d2'
    },
    SEPIA: {
      name: 'Sepia',
      icon: '📜',
      background: '#f4ecd8',
      headerBackground: '#8b7355',
      headerText: '#ffffff',
      evenRow: '#ede1c5',
      oddRow: '#f4ecd8',
      text: '#3e2723',
      border: '#bcaaa4',
      accent: '#6d4c41'
    },
    PURPLE: {
      name: '509 Purple',
      icon: '💜',
      background: '#ffffff',
      headerBackground: '#5B4B9E',
      headerText: '#ffffff',
      evenRow: '#E8E3F3',
      oddRow: '#ffffff',
      text: '#1F2937',
      border: '#D1D5DB',
      accent: '#6B5CA5'
    },
    GREEN: {
      name: 'Union Green',
      icon: '💚',
      background: '#ffffff',
      headerBackground: '#059669',
      headerText: '#ffffff',
      evenRow: '#D1FAE5',
      oddRow: '#ffffff',
      text: '#1F2937',
      border: '#D1D5DB',
      accent: '#10B981'
    },
    ORANGE: {
      name: 'Solidarity Orange',
      icon: '🧡',
      background: '#ffffff',
      headerBackground: '#F97316',
      headerText: '#ffffff',
      evenRow: '#FFEDD5',
      oddRow: '#ffffff',
      text: '#1F2937',
      border: '#D1D5DB',
      accent: '#FB923C'
    },
    TEAL: {
      name: 'Teal Accent',
      icon: '💙',
      background: '#ffffff',
      headerBackground: '#14B8A6',
      headerText: '#ffffff',
      evenRow: '#CCFBF1',
      oddRow: '#ffffff',
      text: '#1F2937',
      border: '#D1D5DB',
      accent: '#2DD4BF'
    }
  },
  DEFAULT_THEME: 'LIGHT',
  AUTO_SWITCH_ENABLED: false,
  DARK_MODE_START_HOUR: 18,  // 6 PM
  DARK_MODE_END_HOUR: 7      // 7 AM
};

/**
 * Shows theme manager
 */
function showThemeManager() {
  const html = createThemeManagerHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(900)
    .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '🎨 Theme Manager');
}

/**
 * Creates HTML for theme manager
 */
function createThemeManagerHTML() {
  const currentTheme = getCurrentTheme();
  const autoSwitch = getAutoSwitchSettings();

  let themeCards = '';
  Object.entries(THEME_CONFIG.THEMES).forEach(function([key, theme]) {
    const isActive = currentTheme === key;
    themeCards += `
      <div class="theme-card ${isActive ? 'active' : ''}" onclick="selectTheme('${key}')">
        <div class="theme-icon">${theme.icon}</div>
        <div class="theme-name">${theme.name}</div>
        <div class="theme-preview">
          <div class="preview-bar" style="background: ${theme.headerBackground};"></div>
          <div class="preview-bar" style="background: ${theme.evenRow};"></div>
          <div class="preview-bar" style="background: ${theme.oddRow};"></div>
          <div class="preview-bar" style="background: ${theme.accent};"></div>
        </div>
        ${isActive ? '<div class="active-badge">✓ Active</div>' : ''}
      </div>
    `;
  });

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
      max-height: 650px;
      overflow-y: auto;
    }
    h2 {
      color: #1a73e8;
      margin-top: 0;
      border-bottom: 3px solid #1a73e8;
      padding-bottom: 10px;
    }
    h3 {
      color: #333;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .theme-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.3s ease;
      text-align: center;
      position: relative;
    }
    .theme-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .theme-card.active {
      border-color: #1a73e8;
      box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
    }
    .theme-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .theme-name {
      font-weight: bold;
      font-size: 16px;
      color: #333;
      margin-bottom: 15px;
    }
    .theme-preview {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-top: 10px;
    }
    .preview-bar {
      height: 15px;
      border-radius: 3px;
    }
    .active-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #4caf50;
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .settings-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #1a73e8;
    }
    .setting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .setting-row:last-child {
      border-bottom: none;
    }
    .setting-label {
      font-weight: 500;
      color: #333;
    }
    .setting-description {
      font-size: 13px;
      color: #666;
      margin-top: 4px;
    }
    button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    button:hover {
      background: #1557b0;
    }
    button.secondary {
      background: #6c757d;
    }
    button.success {
      background: #4caf50;
    }
    button.danger {
      background: #f44336;
    }
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.4s;
      border-radius: 24px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: #1a73e8;
    }
    input:checked + .slider:before {
      transform: translateX(26px);
    }
    .info-box {
      background: #e8f0fe;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
      border-left: 4px solid #1a73e8;
    }
    .quick-actions {
      margin: 20px 0;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🎨 Theme Manager</h2>

    <div class="info-box">
      <strong>💡 Personalize Your Experience:</strong> Choose a theme that's comfortable for your eyes.
      Themes are saved to your profile and persist across sessions.
    </div>

    <h3>Available Themes</h3>
    <div class="theme-grid">
      ${themeCards}
    </div>

    <h3>Theme Settings</h3>
    <div class="settings-section">
      <div class="setting-row">
        <div>
          <div class="setting-label">Auto Dark Mode</div>
          <div class="setting-description">Automatically switch to dark mode in the evening (6 PM - 7 AM)</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="autoSwitch" ${autoSwitch.enabled ? 'checked' : ''} onchange="toggleAutoSwitch()">
          <span class="slider"></span>
        </label>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Apply to All Sheets</div>
          <div class="setting-description">Apply theme to all sheets in the spreadsheet</div>
        </div>
        <button onclick="applyToAllSheets()">Apply to All</button>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Current Sheet Only</div>
          <div class="setting-description">Apply theme only to the active sheet</div>
        </div>
        <button onclick="applyToCurrentSheet()">Apply to Current</button>
      </div>
    </div>

    <div class="quick-actions">
      <button class="success" onclick="applySelectedTheme()">✅ Apply Theme</button>
      <button onclick="previewTheme()">👁️ Preview</button>
      <button class="secondary" onclick="resetTheme()">🔄 Reset to Default</button>
      <button class="secondary" onclick="google.script.host.close()">Close</button>
    </div>
  </div>

  <script>
    let selectedTheme = '${currentTheme}';

    function selectTheme(themeKey) {
      selectedTheme = themeKey;
      document.querySelectorAll('.theme-card').forEach(function(card) {
        card.classList.remove('active');
      });
      event.target.closest('.theme-card').classList.add('active');
    }

    function applySelectedTheme() {
      google.script.run
        .withSuccessHandler(function() {
          alert('✅ Theme applied successfully!');
          google.script.host.close();
        })
        .applyTheme(selectedTheme, 'all');
    }

    function applyToAllSheets() {
      google.script.run
        .withSuccessHandler(function() {
          alert('✅ Theme applied to all sheets!');
          location.reload();
        })
        .applyTheme(selectedTheme, 'all');
    }

    function applyToCurrentSheet() {
      google.script.run
        .withSuccessHandler(function() {
          alert('✅ Theme applied to current sheet!');
          location.reload();
        })
        .applyTheme(selectedTheme, 'current');
    }

    function previewTheme() {
      google.script.run
        .withSuccessHandler(function() {
          alert('👁️ Preview applied! This is temporary.');
        })
        .previewTheme(selectedTheme);
    }

    function resetTheme() {
      if (confirm('Reset to default light theme?')) {
        google.script.run
          .withSuccessHandler(function() {
            alert('✅ Theme reset!');
            location.reload();
          })
          .resetToDefaultTheme();
      }
    }

    function toggleAutoSwitch() {
      const enabled = document.getElementById('autoSwitch').checked;
      google.script.run
        .withSuccessHandler(function() {
          alert(enabled ? '✅ Auto dark mode enabled!' : '🔕 Auto dark mode disabled!');
        })
        .setAutoSwitch(enabled);
    }
  </script>
</body>
</html>
  `;
}

/**
 * Gets current theme
 * @returns {string} Theme key
 */
function getCurrentTheme() {
  const props = PropertiesService.getUserProperties();
  return props.getProperty('currentTheme') || THEME_CONFIG.DEFAULT_THEME;
}

/**
 * Gets auto-switch settings
 * @returns {Object} Settings
 */
function getAutoSwitchSettings() {
  const props = PropertiesService.getUserProperties();
  const settingsJSON = props.getProperty('autoSwitchSettings');

  if (settingsJSON) {
    return JSON.parse(settingsJSON);
  }

  return {
    enabled: false,
    darkTheme: 'DARK',
    lightTheme: 'LIGHT'
  };
}

/**
 * Applies a theme
 * @param {string} themeKey - Theme to apply
 * @param {string} scope - 'all' or 'current'
 */
function applyTheme(themeKey, scope = 'all') {
  const theme = THEME_CONFIG.THEMES[themeKey];
  if (!theme) {
    throw new Error('Invalid theme');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = scope === 'all' ? ss.getSheets() : [ss.getActiveSheet()];

  sheets.forEach(function(sheet) {
    applyThemeToSheet(sheet, theme);
  });

  // Save preference
  const props = PropertiesService.getUserProperties();
  props.setProperty('currentTheme', themeKey);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `${theme.icon} ${theme.name} theme applied!`,
    'Theme',
    3
  );
}

/**
 * Applies theme to a single sheet
 * @param {Sheet} sheet - Sheet to apply to
 * @param {Object} theme - Theme object
 */
function applyThemeToSheet(sheet, theme) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow === 0 || lastCol === 0) return;

  // Apply header styling
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange.setBackground(theme.headerBackground);
  headerRange.setFontColor(theme.headerText);
  headerRange.setFontWeight('bold');
  headerRange.setFontFamily('Roboto');

  // Apply data row styling
  if (lastRow > 1) {
    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);

    // Remove existing banding
    const bandings = sheet.getBandings();
    bandings.forEach(function(banding) { return banding.remove(); });

    // Apply new banding
    const banding = dataRange.applyRowBanding();
    banding.setFirstRowColor(theme.oddRow);
    banding.setSecondRowColor(theme.evenRow);
    banding.setHeaderRowColor(theme.headerBackground);

    // Set text color
    dataRange.setFontColor(theme.text);
  }

  // Set gridline color (approximate with sheet background)
  sheet.setTabColor(theme.accent);
}

/**
 * Previews a theme (temporary)
 * @param {string} themeKey - Theme to preview
 */
function previewTheme(themeKey) {
  const theme = THEME_CONFIG.THEMES[themeKey];
  if (!theme) {
    throw new Error('Invalid theme');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();

  applyThemeToSheet(activeSheet, theme);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `👁️ Previewing ${theme.name} theme (not saved)`,
    'Preview',
    5
  );
}

/**
 * Resets to default theme
 */
function resetToDefaultTheme() {
  applyTheme(THEME_CONFIG.DEFAULT_THEME, 'all');

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '✅ Reset to default theme',
    'Theme',
    3
  );
}

/**
 * Quick toggle between light and dark
 */
function quickToggleDarkMode() {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'LIGHT' ? 'DARK' : 'LIGHT';

  applyTheme(newTheme, 'all');
}

/**
 * Sets auto-switch settings
 * @param {boolean} enabled - Enable auto-switch
 */
function setAutoSwitch(enabled) {
  const props = PropertiesService.getUserProperties();
  const settings = getAutoSwitchSettings();

  settings.enabled = enabled;
  props.setProperty('autoSwitchSettings', JSON.stringify(settings));

  if (enabled) {
    // Check and apply appropriate theme now
    checkAndApplyAutoTheme();

    SpreadsheetApp.getActiveSpreadsheet().toast(
      '✅ Auto dark mode enabled (6 PM - 7 AM)',
      'Theme',
      3
    );
  } else {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      '🔕 Auto dark mode disabled',
      'Theme',
      3
    );
  }
}

/**
 * Checks time and applies appropriate theme
 */
function checkAndApplyAutoTheme() {
  const settings = getAutoSwitchSettings();
  if (!settings.enabled) return;

  const hour = new Date().getHours();
  const isDarkTime = hour >= THEME_CONFIG.DARK_MODE_START_HOUR || hour < THEME_CONFIG.DARK_MODE_END_HOUR;

  const targetTheme = isDarkTime ? settings.darkTheme : settings.lightTheme;
  const currentTheme = getCurrentTheme();

  if (targetTheme !== currentTheme) {
    applyTheme(targetTheme, 'all');
  }
}

/**
 * Creates a custom theme
 * @param {string} name - Theme name
 * @param {Object} colors - Color configuration
 */
function createCustomTheme(name, colors) {
  const customThemes = getCustomThemes();

  const themeKey = 'CUSTOM_' + name.toUpperCase().replace(/\s+/g, '_');

  customThemes[themeKey] = {
    name: name,
    icon: '🎨',
    ...colors
  };

  saveCustomThemes(customThemes);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `✅ Custom theme "${name}" created!`,
    'Theme',
    3
  );

  return themeKey;
}

/**
 * Gets custom themes
 * @returns {Object} Custom themes
 */
function getCustomThemes() {
  const props = PropertiesService.getScriptProperties();
  const themesJSON = props.getProperty('customThemes');

  if (themesJSON) {
    return JSON.parse(themesJSON);
  }

  return {};
}

/**
 * Saves custom themes
 * @param {Object} themes - Themes to save
 */
function saveCustomThemes(themes) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('customThemes', JSON.stringify(themes));
}
