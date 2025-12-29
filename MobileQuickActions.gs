/**
 * ============================================================================
 * MOBILE INTERFACE & QUICK ACTIONS
 * ============================================================================
 * Mobile-optimized views and context-aware quick actions
 */

// ==================== MOBILE CONFIGURATION ====================

var MOBILE_CONFIG = {
  MAX_COLUMNS_MOBILE: 8,
  CARD_LAYOUT_ENABLED: true,
  TOUCH_TARGET_SIZE: '44px'
};

// ==================== MOBILE DASHBOARD ====================

function showMobileDashboard() {
  var stats = getMobileDashboardStats();
  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><base target="_top"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"><style>*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial;padding:0;margin:0;background:#f5f5f5}.header{background:linear-gradient(135deg,#1a73e8,#1557b0);color:white;padding:20px}.header h1{margin:0;font-size:24px}.container{padding:15px}.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px}.stat-card{background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center}.stat-value{font-size:32px;font-weight:bold;color:#1a73e8}.stat-label{font-size:13px;color:#666;text-transform:uppercase}.section-title{font-size:16px;font-weight:600;color:#333;margin:20px 0 12px;padding-left:5px}.action-btn{background:white;border:none;padding:16px;margin-bottom:10px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);width:100%;text-align:left;display:flex;align-items:center;gap:15px;font-size:15px;cursor:pointer;min-height:' + MOBILE_CONFIG.TOUCH_TARGET_SIZE + '}.action-btn:active{transform:scale(0.98)}.action-icon{font-size:24px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:#e8f0fe;border-radius:10px}.action-label{font-weight:500}.action-desc{font-size:12px;color:#666}.fab{position:fixed;bottom:20px;right:20px;width:56px;height:56px;background:#1a73e8;color:white;border:none;border-radius:50%;font-size:24px;box-shadow:0 4px 12px rgba(0,0,0,0.3);cursor:pointer}</style></head><body><div class="header"><h1>📱 509 Dashboard</h1><div style="font-size:14px;opacity:0.9">Mobile View</div></div><div class="container"><div class="stats"><div class="stat-card"><div class="stat-value">' + stats.totalGrievances + '</div><div class="stat-label">Total</div></div><div class="stat-card"><div class="stat-value">' + stats.activeGrievances + '</div><div class="stat-label">Active</div></div><div class="stat-card"><div class="stat-value">' + stats.pendingGrievances + '</div><div class="stat-label">Pending</div></div><div class="stat-card"><div class="stat-value">' + stats.overdueGrievances + '</div><div class="stat-label">Overdue</div></div></div><div class="section-title">⚡ Quick Actions</div><button class="action-btn" onclick="google.script.run.showMobileGrievanceList()"><div class="action-icon">📋</div><div><div class="action-label">View Grievances</div><div class="action-desc">Browse all grievances</div></div></button><button class="action-btn" onclick="google.script.run.showMobileUnifiedSearch()"><div class="action-icon">🔍</div><div><div class="action-label">Search</div><div class="action-desc">Find grievances or members</div></div></button><button class="action-btn" onclick="google.script.run.showMyAssignedGrievances()"><div class="action-icon">👤</div><div><div class="action-label">My Cases</div><div class="action-desc">View assigned grievances</div></div></button></div><button class="fab" onclick="location.reload()">🔄</button></body></html>'
  ).setWidth(400).setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '📱 Mobile Dashboard');
}

function getMobileDashboardStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!sheet || sheet.getLastRow() <= 1) return { totalGrievances: 0, activeGrievances: 0, pendingGrievances: 0, overdueGrievances: 0 };
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, GRIEVANCE_COLS.DAYS_TO_DEADLINE).getValues();
  var stats = { totalGrievances: data.length, activeGrievances: 0, pendingGrievances: 0, overdueGrievances: 0 };
  var today = new Date(); today.setHours(0, 0, 0, 0);
  data.forEach(function(row) {
    var status = row[GRIEVANCE_COLS.STATUS - 1];
    var daysTo = row[GRIEVANCE_COLS.DAYS_TO_DEADLINE - 1];
    if (status && status !== 'Resolved' && status !== 'Withdrawn') stats.activeGrievances++;
    if (status === 'Pending Info') stats.pendingGrievances++;
    if (daysTo !== null && daysTo !== '' && daysTo < 0 && status === 'Open') stats.overdueGrievances++;
  });
  return stats;
}

function getRecentGrievancesForMobile(limit) {
  limit = limit || 5;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, GRIEVANCE_COLS.RESOLUTION).getValues();
  return data.map(function(row, idx) {
    var filed = row[GRIEVANCE_COLS.FILED_DATE - 1];
    var deadline = row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1];
    return {
      id: row[GRIEVANCE_COLS.GRIEVANCE_ID - 1],
      memberName: row[GRIEVANCE_COLS.FIRST_NAME - 1] + ' ' + row[GRIEVANCE_COLS.LAST_NAME - 1],
      issueType: row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1],
      status: row[GRIEVANCE_COLS.STATUS - 1],
      filedDate: filed instanceof Date ? Utilities.formatDate(filed, Session.getScriptTimeZone(), 'MMM d, yyyy') : filed,
      deadline: deadline instanceof Date ? Utilities.formatDate(deadline, Session.getScriptTimeZone(), 'MMM d, yyyy') : null,
      filedDateObj: filed
    };
  }).sort(function(a, b) {
    var da = a.filedDateObj instanceof Date ? a.filedDateObj : new Date(0);
    var db = b.filedDateObj instanceof Date ? b.filedDateObj : new Date(0);
    return db - da;
  }).slice(0, limit);
}

function showMobileGrievanceList() {
  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><base target="_top"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial;margin:0;padding:0;background:#f5f5f5}.header{background:#1a73e8;color:white;padding:15px;position:sticky;top:0}.search{width:100%;padding:12px;border:none;border-radius:8px;font-size:15px;margin-top:10px}.filters{display:flex;overflow-x:auto;padding:10px;background:white;gap:10px}.filter{padding:8px 16px;border-radius:20px;background:#f0f0f0;white-space:nowrap;cursor:pointer;font-size:14px;border:none}.filter.active{background:#1a73e8;color:white}.list{padding:10px}.card{background:white;margin-bottom:12px;padding:15px;border-radius:12px;box-shadow:0 2px 4px rgba(0,0,0,0.08)}.card-header{display:flex;justify-content:space-between;margin-bottom:10px}.card-id{font-weight:bold;color:#1a73e8}.card-status{padding:4px 10px;border-radius:12px;font-size:11px;font-weight:bold}.card-row{font-size:14px;margin:5px 0;color:#666}</style></head><body><div class="header"><h2 style="margin:0">Grievances</h2><input type="text" class="search" placeholder="Search..." oninput="filter(this.value)"></div><div class="filters"><button class="filter active" onclick="filterStatus(\'all\',this)">All</button><button class="filter" onclick="filterStatus(\'Open\',this)">Open</button><button class="filter" onclick="filterStatus(\'Pending Info\',this)">Pending</button><button class="filter" onclick="filterStatus(\'Resolved\',this)">Resolved</button></div><div class="list" id="list"><div style="text-align:center;padding:40px;color:#666">Loading...</div></div><script>var all=[];google.script.run.withSuccessHandler(function(data){all=data;render(data)}).getRecentGrievancesForMobile(100);function render(data){var c=document.getElementById("list");if(!data||data.length===0){c.innerHTML="<div style=\'text-align:center;padding:40px;color:#999\'>No grievances</div>";return}c.innerHTML=data.map(function(g){return"<div class=\'card\'><div class=\'card-header\'><div class=\'card-id\'>#"+g.id+"</div><div class=\'card-status\'>"+(g.status||"Filed")+"</div></div><div class=\'card-row\'><strong>Member:</strong> "+g.memberName+"</div><div class=\'card-row\'><strong>Issue:</strong> "+(g.issueType||"N/A")+"</div><div class=\'card-row\'><strong>Filed:</strong> "+g.filedDate+"</div></div>"}).join("")}function filterStatus(s,btn){document.querySelectorAll(".filter").forEach(function(f){f.classList.remove("active")});btn.classList.add("active");render(s==="all"?all:all.filter(function(g){return g.status===s}))}function filter(q){render(all.filter(function(g){q=q.toLowerCase();return g.id.toLowerCase().indexOf(q)>=0||g.memberName.toLowerCase().indexOf(q)>=0||(g.issueType||"").toLowerCase().indexOf(q)>=0}))}</script></body></html>'
  ).setWidth(400).setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '📋 Grievance List');
}

function showMobileUnifiedSearch() {
  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><base target="_top"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial;margin:0;padding:0;background:#f5f5f5}.header{background:linear-gradient(135deg,#1a73e8,#1557b0);color:white;padding:15px}.search-container{position:relative}.search-input{width:100%;padding:14px 14px 14px 45px;border:none;border-radius:10px;font-size:16px;background:white}.search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:18px}.tabs{display:flex;background:white;border-bottom:1px solid #e0e0e0}.tab{flex:1;padding:14px;text-align:center;font-size:14px;font-weight:500;color:#666;border:none;background:none;cursor:pointer;border-bottom:3px solid transparent}.tab.active{color:#1a73e8;border-bottom-color:#1a73e8}.results{padding:10px}.result-card{background:white;margin-bottom:10px;padding:15px;border-radius:12px;box-shadow:0 2px 4px rgba(0,0,0,0.08)}.result-title{font-weight:bold;color:#1a73e8;margin-bottom:5px}.result-detail{font-size:13px;color:#666;margin:3px 0}</style></head><body><div class="header"><h2 style="margin:0 0 12px 0;font-size:20px">🔍 Search</h2><div class="search-container"><span class="search-icon">🔍</span><input type="text" class="search-input" id="q" placeholder="Search members or grievances..." oninput="search(this.value)"></div></div><div class="tabs"><button class="tab active" onclick="setTab(\'all\',this)">All</button><button class="tab" onclick="setTab(\'members\',this)">Members</button><button class="tab" onclick="setTab(\'grievances\',this)">Grievances</button></div><div class="results" id="results"><div style="text-align:center;padding:60px;color:#999">Type to search...</div></div><script>var tab="all";function setTab(t,btn){tab=t;document.querySelectorAll(".tab").forEach(function(tb){tb.classList.remove("active")});btn.classList.add("active");search(document.getElementById("q").value)}function search(q){if(!q||q.length<2){document.getElementById("results").innerHTML="<div style=\'text-align:center;padding:60px;color:#999\'>Type to search...</div>";return}google.script.run.withSuccessHandler(function(data){render(data)}).getMobileSearchData(q,tab)}function render(data){var c=document.getElementById("results");if(!data||data.length===0){c.innerHTML="<div style=\'text-align:center;padding:60px;color:#999\'>No results</div>";return}c.innerHTML=data.map(function(r){return"<div class=\'result-card\'><div class=\'result-title\'>"+(r.type==="member"?"👤 ":"📋 ")+r.title+"</div><div class=\'result-detail\'>"+r.subtitle+"</div>"+(r.detail?"<div class=\'result-detail\'>"+r.detail+"</div>":"")+"</div>"}).join("")}</script></body></html>'
  ).setWidth(420).setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, '🔍 Search');
}

function getMobileSearchData(query, tab) {
  var results = [];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  query = query.toLowerCase();
  if (tab === 'all' || tab === 'members') {
    var mSheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
    if (mSheet && mSheet.getLastRow() > 1) {
      var mData = mSheet.getRange(2, 1, mSheet.getLastRow() - 1, MEMBER_COLS.EMAIL).getValues();
      mData.forEach(function(row) {
        var id = row[MEMBER_COLS.MEMBER_ID - 1] || '';
        var name = (row[MEMBER_COLS.FIRST_NAME - 1] || '') + ' ' + (row[MEMBER_COLS.LAST_NAME - 1] || '');
        var email = row[MEMBER_COLS.EMAIL - 1] || '';
        if (id.toLowerCase().indexOf(query) >= 0 || name.toLowerCase().indexOf(query) >= 0 || email.toLowerCase().indexOf(query) >= 0) {
          results.push({ type: 'member', title: name, subtitle: id, detail: email });
        }
      });
    }
  }
  if (tab === 'all' || tab === 'grievances') {
    var gSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
    if (gSheet && gSheet.getLastRow() > 1) {
      var gData = gSheet.getRange(2, 1, gSheet.getLastRow() - 1, GRIEVANCE_COLS.STATUS).getValues();
      gData.forEach(function(row) {
        var id = row[GRIEVANCE_COLS.GRIEVANCE_ID - 1] || '';
        var name = (row[GRIEVANCE_COLS.FIRST_NAME - 1] || '') + ' ' + (row[GRIEVANCE_COLS.LAST_NAME - 1] || '');
        var status = row[GRIEVANCE_COLS.STATUS - 1] || '';
        if (id.toLowerCase().indexOf(query) >= 0 || name.toLowerCase().indexOf(query) >= 0) {
          results.push({ type: 'grievance', title: id, subtitle: name, detail: status });
        }
      });
    }
  }
  return results.slice(0, 20);
}

function showMyAssignedGrievances() {
  var email = Session.getActiveUser().getEmail();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!sheet || sheet.getLastRow() <= 1) { SpreadsheetApp.getUi().alert('No grievances found'); return; }
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, GRIEVANCE_COLS.STEWARD).getValues();
  var mine = data.filter(function(row) { var steward = row[GRIEVANCE_COLS.STEWARD - 1]; return steward && steward.indexOf(email) >= 0; });
  if (mine.length === 0) { SpreadsheetApp.getUi().alert('No grievances assigned to you'); return; }
  var msg = 'You have ' + mine.length + ' assigned grievance(s):\n\n';
  mine.slice(0, 10).forEach(function(row) { msg += '#' + row[GRIEVANCE_COLS.GRIEVANCE_ID - 1] + ' - ' + row[GRIEVANCE_COLS.FIRST_NAME - 1] + ' ' + row[GRIEVANCE_COLS.LAST_NAME - 1] + ' (' + row[GRIEVANCE_COLS.STATUS - 1] + ')\n'; });
  if (mine.length > 10) msg += '\n... and ' + (mine.length - 10) + ' more';
  SpreadsheetApp.getUi().alert('My Cases', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ==================== QUICK ACTIONS ====================

function showQuickActionsMenu() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var name = sheet.getName();
  var selection = sheet.getActiveRange();
  if (!selection) { SpreadsheetApp.getUi().alert('Please select a row first.'); return; }
  var row = selection.getRow();
  if (row < 2) { SpreadsheetApp.getUi().alert('Please select a data row, not header.'); return; }
  if (name === SHEETS.MEMBER_DIR) showMemberQuickActions(row);
  else if (name === SHEETS.GRIEVANCE_LOG) showGrievanceQuickActions(row);
  else SpreadsheetApp.getUi().alert('Quick Actions', 'Available for Member Directory and Grievance Log.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function showMemberQuickActions(row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  var data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  var memberId = data[MEMBER_COLS.MEMBER_ID - 1];
  var name = data[MEMBER_COLS.FIRST_NAME - 1] + ' ' + data[MEMBER_COLS.LAST_NAME - 1];
  var email = data[MEMBER_COLS.EMAIL - 1];
  var hasOpen = data[MEMBER_COLS.HAS_OPEN_GRIEVANCE - 1];
  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><base target="_top"><style>body{font-family:Arial;padding:20px;background:#f5f5f5}.container{background:white;padding:25px;border-radius:8px}h2{color:#1a73e8;display:flex;align-items:center;gap:10px}.info{background:#e8f4fd;padding:15px;border-radius:8px;margin-bottom:20px}.name{font-size:18px;font-weight:bold}.id{color:#666;font-size:14px}.status{margin-top:10px}.badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:bold}.open{background:#ffebee;color:#c62828}.none{background:#e8f5e9;color:#2e7d32}.actions{display:flex;flex-direction:column;gap:10px}.action-btn{display:flex;align-items:center;gap:12px;padding:15px;border:none;border-radius:8px;cursor:pointer;font-size:14px;text-align:left;background:#f8f9fa}.action-btn:hover{background:#e8f4fd}.icon{font-size:24px}.title{font-weight:bold}.desc{font-size:12px;color:#666;margin-top:2px}.close{width:100%;margin-top:15px;padding:12px;background:#6c757d;color:white;border:none;border-radius:8px;cursor:pointer}</style></head><body><div class="container"><h2>⚡ Quick Actions</h2><div class="info"><div class="name">' + name + '</div><div class="id">' + memberId + ' | ' + (email || 'No email') + '</div><div class="status">' + (hasOpen === 'Yes' ? '<span class="badge open">🔴 Has Open Grievance</span>' : '<span class="badge none">🟢 No Open Grievances</span>') + '</div></div><div class="actions"><button class="action-btn" onclick="google.script.run.openGrievanceFormForMember(' + row + ');google.script.host.close()"><span class="icon">📋</span><span><div class="title">Start New Grievance</div><div class="desc">Create a grievance for this member</div></span></button>' + (email ? '<button class="action-btn" onclick="google.script.run.composeEmailForMember(\'' + memberId + '\');google.script.host.close()"><span class="icon">📧</span><span><div class="title">Send Email</div><div class="desc">Compose email to ' + email + '</div></span></button>' : '') + '<button class="action-btn" onclick="google.script.run.showMemberGrievanceHistory(\'' + memberId + '\');google.script.host.close()"><span class="icon">📁</span><span><div class="title">View Grievance History</div><div class="desc">See all grievances for this member</div></span></button><button class="action-btn" onclick="navigator.clipboard.writeText(\'' + memberId + '\');alert(\'Copied!\')"><span class="icon">📋</span><span><div class="title">Copy Member ID</div><div class="desc">' + memberId + '</div></span></button></div><button class="close" onclick="google.script.host.close()">Close</button></div></body></html>'
  ).setWidth(400).setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, '');
}

function showGrievanceQuickActions(row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  var data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  var grievanceId = data[GRIEVANCE_COLS.GRIEVANCE_ID - 1];
  var memberId = data[GRIEVANCE_COLS.MEMBER_ID - 1];
  var name = data[GRIEVANCE_COLS.FIRST_NAME - 1] + ' ' + data[GRIEVANCE_COLS.LAST_NAME - 1];
  var status = data[GRIEVANCE_COLS.STATUS - 1];
  var step = data[GRIEVANCE_COLS.CURRENT_STEP - 1];
  var daysTo = data[GRIEVANCE_COLS.DAYS_TO_DEADLINE - 1];
  var isOpen = status === 'Open';
  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><base target="_top"><style>body{font-family:Arial;padding:20px;background:#f5f5f5}.container{background:white;padding:25px;border-radius:8px}h2{color:#DC2626}.info{background:#fff5f5;padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid #DC2626}.gid{font-size:18px;font-weight:bold}.gmem{color:#666;font-size:14px}.gstatus{margin-top:10px;display:flex;gap:10px;flex-wrap:wrap}.badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:bold}.actions{display:flex;flex-direction:column;gap:10px}.action-btn{display:flex;align-items:center;gap:12px;padding:15px;border:none;border-radius:8px;cursor:pointer;font-size:14px;text-align:left;background:#f8f9fa}.action-btn:hover{background:#fff5f5}.icon{font-size:24px}.title{font-weight:bold}.desc{font-size:12px;color:#666;margin-top:2px}.divider{height:1px;background:#e0e0e0;margin:10px 0}.status-section{margin-top:15px;padding:15px;background:#f8f9fa;border-radius:8px}.status-section h4{margin:0 0 10px}select{width:100%;padding:10px;border:2px solid #ddd;border-radius:4px;font-size:14px}.close{width:100%;margin-top:15px;padding:12px;background:#6c757d;color:white;border:none;border-radius:8px;cursor:pointer}</style></head><body><div class="container"><h2>⚡ Grievance Actions</h2><div class="info"><div class="gid">' + grievanceId + '</div><div class="gmem">' + name + ' (' + memberId + ')</div><div class="gstatus"><span class="badge">' + status + '</span><span class="badge">' + step + '</span>' + (daysTo !== null && daysTo !== '' ? '<span class="badge" style="background:' + (daysTo < 0 ? '#ffebee;color:#c62828' : '#e3f2fd;color:#1565c0') + '">' + (daysTo < 0 ? '⚠️ Overdue' : '📅 ' + daysTo + ' days') + '</span>' : '') + '</div></div><div class="actions"><button class="action-btn" onclick="google.script.run.syncSingleGrievanceToCalendar(\'' + grievanceId + '\');google.script.host.close()"><span class="icon">📅</span><span><div class="title">Sync to Calendar</div><div class="desc">Add deadlines to Google Calendar</div></span></button><button class="action-btn" onclick="google.script.run.setupDriveFolderForGrievance();google.script.host.close()"><span class="icon">📁</span><span><div class="title">Setup Drive Folder</div><div class="desc">Create document folder</div></span></button><button class="action-btn" onclick="navigator.clipboard.writeText(\'' + grievanceId + '\');alert(\'Copied!\')"><span class="icon">📋</span><span><div class="title">Copy Grievance ID</div><div class="desc">' + grievanceId + '</div></span></button></div>' + (isOpen ? '<div class="status-section"><h4>Quick Status Update</h4><select id="statusSelect"><option value="">-- Select --</option><option value="Open">Open</option><option value="Pending Info">Pending Info</option><option value="Settled">Settled</option><option value="Withdrawn">Withdrawn</option><option value="Closed">Closed</option></select><button class="action-btn" style="margin-top:10px" onclick="var s=document.getElementById(\'statusSelect\').value;if(!s){alert(\'Select status\');return}google.script.run.withSuccessHandler(function(){alert(\'Updated!\');google.script.host.close()}).quickUpdateGrievanceStatus(' + row + ',s)"><span class="icon">✓</span><span><div class="title">Update Status</div></span></button></div>' : '') + '<button class="close" onclick="google.script.host.close()">Close</button></div></body></html>'
  ).setWidth(400).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, '');
}

function quickUpdateGrievanceStatus(row, newStatus) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!sheet) throw new Error('Grievance Log not found');
  sheet.getRange(row, GRIEVANCE_COLS.STATUS).setValue(newStatus);
  if (['Closed', 'Settled', 'Withdrawn'].indexOf(newStatus) >= 0) {
    var closeCol = GRIEVANCE_COLS.DATE_CLOSED;
    if (!sheet.getRange(row, closeCol).getValue()) sheet.getRange(row, closeCol).setValue(new Date());
  }
  ss.toast('Grievance status updated to: ' + newStatus, 'Status Updated', 3);
}

function composeEmailForMember(memberId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
  if (!sheet) return;
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, MEMBER_COLS.EMAIL).getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][MEMBER_COLS.MEMBER_ID - 1] === memberId) {
      var email = data[i][MEMBER_COLS.EMAIL - 1];
      var name = data[i][MEMBER_COLS.FIRST_NAME - 1] + ' ' + data[i][MEMBER_COLS.LAST_NAME - 1];
      if (!email) { SpreadsheetApp.getUi().alert('No email on file.'); return; }
      var html = HtmlService.createHtmlOutput(
        '<!DOCTYPE html><html><head><base target="_top"><style>body{font-family:Arial;padding:20px;background:#f5f5f5}.container{background:white;padding:25px;border-radius:8px}h2{color:#1a73e8}.info{background:#e8f4fd;padding:15px;border-radius:8px;margin-bottom:20px}.form-group{margin:15px 0}label{display:block;font-weight:bold;margin-bottom:5px}input,textarea{width:100%;padding:10px;border:2px solid #ddd;border-radius:4px;font-size:14px;box-sizing:border-box}textarea{min-height:200px}input:focus,textarea:focus{outline:none;border-color:#1a73e8}.buttons{display:flex;gap:10px;margin-top:20px}button{padding:12px 24px;font-size:14px;border:none;border-radius:4px;cursor:pointer;flex:1}.primary{background:#1a73e8;color:white}.secondary{background:#6c757d;color:white}</style></head><body><div class="container"><h2>📧 Email to Member</h2><div class="info"><strong>' + name + '</strong> (' + memberId + ')<br>' + email + '</div><div class="form-group"><label>Subject:</label><input type="text" id="subject" placeholder="Email subject"></div><div class="form-group"><label>Message:</label><textarea id="message" placeholder="Type your message..."></textarea></div><div class="buttons"><button class="primary" onclick="send()">📤 Send</button><button class="secondary" onclick="google.script.host.close()">Cancel</button></div></div><script>function send(){var s=document.getElementById("subject").value.trim();var m=document.getElementById("message").value.trim();if(!s||!m){alert("Fill in subject and message");return}google.script.run.withSuccessHandler(function(){alert("Email sent!");google.script.host.close()}).withFailureHandler(function(e){alert("Error: "+e.message)}).sendQuickEmail("' + email + '",s,m,"' + memberId + '")}</script></body></html>'
      ).setWidth(600).setHeight(500);
      SpreadsheetApp.getUi().showModalDialog(html, '📧 Compose Email');
      return;
    }
  }
}

function sendQuickEmail(to, subject, body, memberId) {
  try {
    MailApp.sendEmail({ to: to, subject: subject, body: body, name: 'SEIU Local 509 Dashboard' });
    return { success: true };
  } catch (e) { throw new Error('Failed to send: ' + e.message); }
}

function showMemberGrievanceHistory(memberId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!sheet || sheet.getLastRow() <= 1) { SpreadsheetApp.getUi().alert('No grievances found.'); return; }
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, GRIEVANCE_COLS.DATE_CLOSED).getValues();
  var mine = [];
  data.forEach(function(row) {
    if (row[GRIEVANCE_COLS.MEMBER_ID - 1] === memberId) {
      mine.push({ id: row[GRIEVANCE_COLS.GRIEVANCE_ID - 1], status: row[GRIEVANCE_COLS.STATUS - 1], step: row[GRIEVANCE_COLS.CURRENT_STEP - 1], issue: row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1], filed: row[GRIEVANCE_COLS.FILED_DATE - 1], closed: row[GRIEVANCE_COLS.DATE_CLOSED - 1] });
    }
  });
  if (mine.length === 0) { SpreadsheetApp.getUi().alert('No grievances for this member.'); return; }
  var list = mine.map(function(g) {
    return '<div style="background:#f8f9fa;padding:12px;margin:8px 0;border-radius:4px;border-left:4px solid ' + (g.status === 'Open' ? '#f44336' : '#4caf50') + '"><strong>' + g.id + '</strong><br><span style="color:#666">Status: ' + g.status + ' | Step: ' + g.step + '</span><br><span style="color:#888;font-size:12px">' + g.issue + ' | Filed: ' + (g.filed ? new Date(g.filed).toLocaleDateString() : 'N/A') + '</span></div>';
  }).join('');
  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><base target="_top"><style>body{font-family:Arial;padding:20px}h2{color:#1a73e8}.summary{background:#e8f4fd;padding:15px;border-radius:8px;margin-bottom:20px}</style></head><body><h2>📁 Grievance History</h2><div class="summary"><strong>Member ID:</strong> ' + memberId + '<br><strong>Total:</strong> ' + mine.length + '<br><strong>Open:</strong> ' + mine.filter(function(g) { return g.status === 'Open'; }).length + '<br><strong>Closed:</strong> ' + mine.filter(function(g) { return g.status !== 'Open'; }).length + '</div>' + list + '</body></html>'
  ).setWidth(500).setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(html, 'Grievance History - ' + memberId);
}

function openGrievanceFormForMember(row) {
  SpreadsheetApp.getUi().alert('ℹ️ New Grievance', 'To start a new grievance for this member, navigate to the Grievance Log sheet and add a new row with their Member ID.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function syncSingleGrievanceToCalendar(grievanceId) {
  SpreadsheetApp.getActiveSpreadsheet().toast('📅 Syncing ' + grievanceId + '...', 'Calendar', 3);
  if (typeof syncDeadlinesToCalendar === 'function') syncDeadlinesToCalendar();
}
