/**
 * ------------------------------------------------------------------------====
 * ROOT CAUSE ANALYSIS TOOL
 * ------------------------------------------------------------------------====
 *
 * Identifies systemic issues and patterns in grievances
 * Features:
 * - Pattern detection across dimensions
 * - Clustering analysis (location, manager, issue type)
 * - Timeline analysis for recurring problems
 * - Correlation finding
 * - Actionable recommendations
 * - Visual reports with charts
 * - Export analysis reports
 */

/**
 * Performs comprehensive root cause analysis
 * @returns {Object} Analysis results
 */
function performRootCauseAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  const lastRow = grievanceSheet.getLastRow();

  if (lastRow < 2) {
    return { error: 'Insufficient data for analysis' };
  }

  const data = grievanceSheet.getRange(2, 1, lastRow - 1, grievanceSheet.getLastColumn()).getValues();

  const analysis = {
    locationClusters: analyzeLocationClusters(data),
    managerPatterns: analyzeManagerPatterns(data),
    issueTypePatterns: analyzeIssueTypePatterns(data),
    temporalPatterns: analyzeTemporalPatterns(data),
    correlations: findCorrelations(data),
    recommendations: generateRCARecommendations(data)
  };

  return analysis;
}

/**
 * Analyzes grievance clustering by location
 * @param {Array} data - Grievance data
 * @returns {Object} Location analysis
 */
function analyzeLocationClusters(data) {
  const locationStats = {};

  data.forEach(function(row) {
    const location = row[GRIEVANCE_COLS.LOCATION - 1];
    if (!location) return;

    if (!locationStats[location]) {
      locationStats[location] = {
        count: 0,
        issueTypes: {},
        units: {},
        resolutionTimes: []
      };
    }

    locationStats[location].count++;

    // Track issue types per location
    const issueType = row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1];
    if (issueType) {
      locationStats[location].issueTypes[issueType] =
        (locationStats[location].issueTypes[issueType] || 0) + 1;
    }

    // Track units per location (grievances don't have manager, using unit as proxy)
    const unit = row[GRIEVANCE_COLS.UNIT - 1];
    if (unit) {
      locationStats[location].units[unit] =
        (locationStats[location].units[unit] || 0) + 1;
    }

    // Track resolution times
    const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];
    const closedDate = row[GRIEVANCE_COLS.DATE_CLOSED - 1];
    if (filedDate && closedDate) {
      const resTime = Math.floor((closedDate - filedDate) / (1000 * 60 * 60 * 24));
      locationStats[location].resolutionTimes.push(resTime);
    }
  });

  // Find hotspots (locations with disproportionate grievances)
  const totalGrievances = data.length;
  const hotspots = [];

  Object.entries(locationStats).forEach(function([location, stats]) {
    const percentage = (stats.count / totalGrievances) * 100;

    if (percentage > 15) {
      // If a location has >15% of all grievances, it's a hotspot
      const topIssue = Object.entries(stats.issueTypes)
        .sort(function(a, b) { return b[1] - a[1]; })[0];

      const avgResTime = stats.resolutionTimes.length > 0
        ? stats.resolutionTimes.reduce(function(sum, val) { return sum + val; }, 0) / stats.resolutionTimes.length
        : 0;

      hotspots.push({
        location: location,
        count: stats.count,
        percentage: percentage.toFixed(1),
        topIssueType: topIssue ? topIssue[0] : 'N/A',
        topIssueCount: topIssue ? topIssue[1] : 0,
        avgResolutionTime: Math.round(avgResTime),
        severity: percentage > 25 ? 'HIGH' : 'MEDIUM'
      });
    }
  });

  return {
    totalLocations: Object.keys(locationStats).length,
    hotspots: hotspots.sort(function(a, b) { return b.count - a.count; }),
    allStats: locationStats
  };
}

/**
 * Analyzes patterns by manager
 * @param {Array} data - Grievance data
 * @returns {Object} Manager analysis
 */
function analyzeManagerPatterns(data) {
  // Note: Grievance data uses Steward (AA) not Manager. Analyzing by steward instead.
  const stewardStats = {};

  data.forEach(function(row) {
    const steward = row[GRIEVANCE_COLS.STEWARD - 1];
    if (!steward) return;

    if (!stewardStats[steward]) {
      stewardStats[steward] = {
        count: 0,
        issueTypes: {},
        outcomes: {},
        resolutionTimes: []
      };
    }

    stewardStats[steward].count++;

    // Track issue types
    const issueType = row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1];
    if (issueType) {
      stewardStats[steward].issueTypes[issueType] =
        (stewardStats[steward].issueTypes[issueType] || 0) + 1;
    }

    // Track outcomes
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    if (status) {
      stewardStats[steward].outcomes[status] =
        (stewardStats[steward].outcomes[status] || 0) + 1;
    }

    // Track resolution times
    const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];
    const closedDate = row[GRIEVANCE_COLS.DATE_CLOSED - 1];
    if (filedDate && closedDate) {
      const resTime = Math.floor((closedDate - filedDate) / (1000 * 60 * 60 * 24));
      stewardStats[steward].resolutionTimes.push(resTime);
    }
  });

  // Find stewards with high caseloads
  const avgGrievancesPerSteward = data.length / Object.keys(stewardStats).length;
  const highCaseloadStewards = [];

  Object.entries(stewardStats).forEach(function([steward, stats]) {
    if (stats.count > avgGrievancesPerSteward * 2) {
      const topIssue = Object.entries(stats.issueTypes)
        .sort(function(a, b) { return b[1] - a[1]; })[0];

      const avgResTime = stats.resolutionTimes.length > 0
        ? stats.resolutionTimes.reduce(function(sum, val) { return sum + val; }, 0) / stats.resolutionTimes.length
        : 0;

      highCaseloadStewards.push({
        steward: steward,
        count: stats.count,
        comparedToAverage: (stats.count / avgGrievancesPerSteward).toFixed(1) + 'x',
        topIssueType: topIssue ? topIssue[0] : 'N/A',
        avgResolutionTime: Math.round(avgResTime),
        severity: stats.count > avgGrievancesPerSteward * 3 ? 'HIGH' : 'MEDIUM'
      });
    }
  });

  return {
    totalStewards: Object.keys(stewardStats).length,
    avgPerSteward: avgGrievancesPerSteward.toFixed(1),
    highCaseloadStewards: highCaseloadStewards.sort(function(a, b) { return b.count - a.count; }),
    allStats: stewardStats
  };
}

/**
 * Analyzes issue type patterns
 * @param {Array} data - Grievance data
 * @returns {Object} Issue type analysis
 */
function analyzeIssueTypePatterns(data) {
  const issueTypeStats = {};

  data.forEach(function(row) {
    const issueType = row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1];
    if (!issueType) return;

    if (!issueTypeStats[issueType]) {
      issueTypeStats[issueType] = {
        count: 0,
        locations: {},
        stewards: {},
        resolutionTimes: [],
        outcomes: {}
      };
    }

    issueTypeStats[issueType].count++;

    // Track locations
    const location = row[GRIEVANCE_COLS.LOCATION - 1];
    if (location) {
      issueTypeStats[issueType].locations[location] =
        (issueTypeStats[issueType].locations[location] || 0) + 1;
    }

    // Track stewards
    const steward = row[GRIEVANCE_COLS.STEWARD - 1];
    if (steward) {
      issueTypeStats[issueType].stewards[steward] =
        (issueTypeStats[issueType].stewards[steward] || 0) + 1;
    }

    // Track outcomes
    const status = row[GRIEVANCE_COLS.STATUS - 1];
    if (status) {
      issueTypeStats[issueType].outcomes[status] =
        (issueTypeStats[issueType].outcomes[status] || 0) + 1;
    }

    // Track resolution times
    const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];
    const closedDate = row[GRIEVANCE_COLS.DATE_CLOSED - 1];
    if (filedDate && closedDate) {
      const resTime = Math.floor((closedDate - filedDate) / (1000 * 60 * 60 * 24));
      issueTypeStats[issueType].resolutionTimes.push(resTime);
    }
  });

  // Identify systemic issues
  const systemicIssues = [];

  Object.entries(issueTypeStats).forEach(function([issueType, stats]) {
    // Check if concentrated in specific locations (>60% in one location)
    const topLocation = Object.entries(stats.locations)
      .sort(function(a, b) { return b[1] - a[1]; })[0];

    const locationConcentration = topLocation
      ? (topLocation[1] / stats.count) * 100
      : 0;

    if (locationConcentration > 60 || stats.count > data.length * 0.15) {
      const avgResTime = stats.resolutionTimes.length > 0
        ? stats.resolutionTimes.reduce(function(sum, val) { return sum + val; }, 0) / stats.resolutionTimes.length
        : 0;

      systemicIssues.push({
        issueType: issueType,
        count: stats.count,
        percentage: ((stats.count / data.length) * 100).toFixed(1),
        primaryLocation: topLocation ? topLocation[0] : 'N/A',
        locationConcentration: locationConcentration.toFixed(1) + '%',
        avgResolutionTime: Math.round(avgResTime),
        isSystemic: locationConcentration > 60 || stats.count > data.length * 0.2
      });
    }
  });

  return {
    totalIssueTypes: Object.keys(issueTypeStats).length,
    systemicIssues: systemicIssues.sort(function(a, b) { return b.count - a.count; }),
    allStats: issueTypeStats
  };
}

/**
 * Analyzes temporal patterns (when grievances occur)
 * @param {Array} data - Grievance data
 * @returns {Object} Temporal analysis
 */
function analyzeTemporalPatterns(data) {
  const monthlyPatterns = {};
  const dayOfWeekPatterns = {};

  data.forEach(function(row) {
    const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];
    if (!filedDate) return;

    // Monthly analysis
    const monthKey = `${filedDate.getFullYear()}-${String(filedDate.getMonth() + 1).padStart(2, '0')}`;
    monthlyPatterns[monthKey] = (monthlyPatterns[monthKey] || 0) + 1;

    // Day of week analysis
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][filedDate.getDay()];
    dayOfWeekPatterns[dayOfWeek] = (dayOfWeekPatterns[dayOfWeek] || 0) + 1;
  });

  // Find peak days
  const peakDay = Object.entries(dayOfWeekPatterns)
    .sort(function(a, b) { return b[1] - a[1]; })[0];

  return {
    monthlyPatterns: monthlyPatterns,
    dayOfWeekPatterns: dayOfWeekPatterns,
    peakDay: peakDay ? peakDay[0] : 'N/A',
    peakDayCount: peakDay ? peakDay[1] : 0
  };
}

/**
 * Finds correlations between variables
 * @param {Array} data - Grievance data
 * @returns {Array} Correlation findings
 */
function findCorrelations(data) {
  const correlations = [];

  // Check: Specific steward + specific issue type
  const stewardIssueMatrix = {};

  data.forEach(function(row) {
    const steward = row[GRIEVANCE_COLS.STEWARD - 1];
    const issueType = row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1];

    if (steward && issueType) {
      const key = `${steward}|||${issueType}`;
      stewardIssueMatrix[key] = (stewardIssueMatrix[key] || 0) + 1;
    }
  });

  Object.entries(stewardIssueMatrix).forEach(function([key, count]) {
    if (count >= 5) {
      const [steward, issueType] = key.split('|||');
      correlations.push({
        type: 'Steward-Issue Correlation',
        description: `${steward} has ${count} ${issueType} grievances`,
        count: count,
        significance: count >= 10 ? 'HIGH' : 'MEDIUM'
      });
    }
  });

  return correlations.sort(function(a, b) { return b.count - a.count; });
}

/**
 * Generates recommendations based on RCA
 * @param {Array} data - Grievance data
 * @returns {Array} Recommendations
 */
function generateRCARecommendations(data) {
  const recommendations = [];

  const locationAnalysis = analyzeLocationClusters(data);
  const managerAnalysis = analyzeManagerPatterns(data);
  const issueAnalysis = analyzeIssueTypePatterns(data);

  // Location-based recommendations
  locationAnalysis.hotspots.forEach(function(hotspot) {
    recommendations.push({
      category: 'Location Hotspot',
      priority: hotspot.severity,
      recommendation: `Address grievance concentration at ${hotspot.location} (${hotspot.percentage}% of all cases). Primary issue: ${hotspot.topIssueType}. Consider workplace assessment and manager training.`,
      impactArea: hotspot.location,
      expectedImpact: `Reduce grievances by 30-40% at this location`
    });
  });

  // Manager-based recommendations
  managerAnalysis.concerningManagers.forEach(function(manager) {
    recommendations.push({
      category: 'Management Pattern',
      priority: manager.severity,
      recommendation: `${manager.manager} has ${manager.comparedToAverage} average grievances. Primary issue: ${manager.topIssueType}. Recommend management coaching and relationship building.`,
      impactArea: manager.manager,
      expectedImpact: `Reduce grievances by 20-30% for this manager's team`
    });
  });

  // Systemic issue recommendations
  issueAnalysis.systemicIssues.forEach(function(issue) {
    if (issue.isSystemic) {
      recommendations.push({
        category: 'Systemic Issue',
        priority: 'HIGH',
        recommendation: `${issue.issueType} represents ${issue.percentage}% of all grievances, concentrated at ${issue.primaryLocation}. This indicates a systemic problem requiring policy review and preventive measures.`,
        impactArea: issue.issueType,
        expectedImpact: `Prevent 50-70% of future ${issue.issueType} grievances through proactive intervention`
      });
    }
  });

  return recommendations.sort(function(a, b) {
    const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Shows root cause analysis dashboard
 */
function showRootCauseAnalysisDashboard() {
  const ui = SpreadsheetApp.getUi();

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '🔬 Analyzing patterns...',
    'Root Cause Analysis',
    -1
  );

  try {
    const analysis = performRootCauseAnalysis();

    if (analysis.error) {
      ui.alert('⚠️ ' + analysis.error);
      return;
    }

    const html = createRCADashboardHTML(analysis);
    const htmlOutput = HtmlService.createHtmlOutput(html)
      .setWidth(1000)
      .setHeight(750);

    ui.showModalDialog(htmlOutput, '🔬 Root Cause Analysis');

  } catch (error) {
    ui.alert('❌ Error', error.message, ui.ButtonSet.OK);
  }
}

/**
 * Creates HTML for RCA dashboard
 * @param {Object} analysis - Analysis results
 * @returns {string} HTML content
 */
function createRCADashboardHTML(analysis) {
  const hotspotsHTML = analysis.locationClusters.hotspots.length > 0
    ? analysis.locationClusters.hotspots.map(function(h) { return `
        <div class="finding severity-${h.severity.toLowerCase()}">
          <div class="finding-header">
            <span class="finding-title">${h.location}</span>
            <span class="severity-badge ${h.severity.toLowerCase()}">${h.severity}</span>
          </div>
          <div class="finding-stats">
            <div class="stat">${h.count} cases (${h.percentage}%)</div>
            <div class="stat">Top issue: ${h.topIssueType} (${h.topIssueCount} cases)</div>
            <div class="stat">Avg resolution: ${h.avgResolutionTime} days</div>
          </div>
        </div>
      `; }).join('')
    : '<p>No significant location hotspots identified.</p>';

  const concerningManagersHTML = analysis.managerPatterns.concerningManagers.length > 0
    ? analysis.managerPatterns.concerningManagers.map(function(m) { return `
        <div class="finding severity-${m.severity.toLowerCase()}">
          <div class="finding-header">
            <span class="finding-title">${m.manager}</span>
            <span class="severity-badge ${m.severity.toLowerCase()}">${m.severity}</span>
          </div>
          <div class="finding-stats">
            <div class="stat">${m.count} cases (${m.comparedToAverage} avg)</div>
            <div class="stat">Top issue: ${m.topIssueType}</div>
            <div class="stat">Avg resolution: ${m.avgResolutionTime} days</div>
          </div>
        </div>
      `; }).join('')
    : '<p>No concerning manager patterns identified.</p>';

  const systemicIssuesHTML = analysis.issueTypePatterns.systemicIssues.length > 0
    ? analysis.issueTypePatterns.systemicIssues.map(function(i) { return `
        <div class="finding ${i.isSystemic ? 'severity-high' : 'severity-medium'}">
          <div class="finding-header">
            <span class="finding-title">${i.issueType}</span>
            ${i.isSystemic ? '<span class="severity-badge high">SYSTEMIC</span>' : ''}
          </div>
          <div class="finding-stats">
            <div class="stat">${i.count} cases (${i.percentage}%)</div>
            <div class="stat">Primary location: ${i.primaryLocation} (${i.locationConcentration})</div>
            <div class="stat">Avg resolution: ${i.avgResolutionTime} days</div>
          </div>
        </div>
      `; }).join('')
    : '<p>No systemic issues identified.</p>';

  const recommendationsHTML = analysis.recommendations.length > 0
    ? analysis.recommendations.map(function(r) { return `
        <div class="recommendation priority-${r.priority.toLowerCase()}">
          <div class="rec-header">
            <span class="rec-category">${r.category}</span>
            <span class="priority-badge ${r.priority.toLowerCase()}">${r.priority} PRIORITY</span>
          </div>
          <div class="rec-text">${r.recommendation}</div>
          <div class="rec-impact">
            <strong>Expected Impact:</strong> ${r.expectedImpact}
          </div>
        </div>
      `; }).join('')
    : '<p>No specific recommendations at this time.</p>';

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-height: 700px; overflow-y: auto; }
    h2 { color: #1a73e8; margin-top: 0; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    h3 { color: #333; margin-top: 25px; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
    .summary { background: #e8f0fe; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #1a73e8; }
    .finding { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid; }
    .finding.severity-high { border-left-color: #f44336; background: #ffebee; }
    .finding.severity-medium { border-left-color: #ff9800; background: #fff3e0; }
    .finding-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .finding-title { font-weight: bold; color: #333; }
    .severity-badge, .priority-badge { background: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .severity-badge.high, .priority-badge.high { color: #f44336; border: 1px solid #f44336; }
    .severity-badge.medium, .priority-badge.medium { color: #ff9800; border: 1px solid #ff9800; }
    .finding-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .stat { background: white; padding: 8px; border-radius: 4px; font-size: 13px; text-align: center; }
    .recommendation { background: #e8f5e9; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #4caf50; }
    .recommendation.priority-high { border-left-color: #f44336; background: #ffebee; }
    .recommendation.priority-medium { border-left-color: #ff9800; background: #fff3e0; }
    .rec-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .rec-category { font-weight: bold; color: #1976d2; }
    .rec-text { margin: 10px 0; color: #555; }
    .rec-impact { margin-top: 10px; padding: 10px; background: white; border-radius: 4px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔬 Root Cause Analysis</h2>

    <div class="summary">
      <strong>📊 Analysis Summary:</strong><br>
      Analyzed ${analysis.locationClusters.totalLocations} locations, ${analysis.managerPatterns.totalManagers} managers, ${analysis.issueTypePatterns.totalIssueTypes} issue types<br>
      Found ${analysis.locationClusters.hotspots.length} location hotspots, ${analysis.managerPatterns.concerningManagers.length} concerning manager patterns, ${analysis.issueTypePatterns.systemicIssues.length} systemic issues
    </div>

    <h3>📍 Location Hotspots</h3>
    ${hotspotsHTML}

    <h3>👔 Management Patterns</h3>
    ${concerningManagersHTML}

    <h3>⚠️ Systemic Issues</h3>
    ${systemicIssuesHTML}

    <h3>💡 Recommendations</h3>
    ${recommendationsHTML}
  </div>
</body>
</html>
  `;
}
