/**
 * ============================================================================
 * GOOGLE DRIVE, CALENDAR & EMAIL INTEGRATION
 * ============================================================================
 * File management, deadline sync, and notifications
 */

// ==================== GOOGLE DRIVE INTEGRATION ====================

function extractFolderIdFromUrl(url) {
  if (!url) return null;
  var match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]+$/.test(url)) return url;
  return null;
}

function createRootFolder() {
  var folderName = '509 Dashboard - Grievance Files';
  var existing = DriveApp.getFoldersByName(folderName);
  if (existing.hasNext()) return existing.next();
  return DriveApp.createFolder(folderName);
}

function createGrievanceFolder(grievanceId, grievantName) {
  var root = createRootFolder();
  var folderName = 'Grievance_' + grievanceId + (grievantName ? '_' + grievantName : '');
  var existing = root.getFoldersByName(folderName);
  if (existing.hasNext()) return existing.next();
  var folder = root.createFolder(folderName);
  folder.createFolder('Evidence');
  folder.createFolder('Correspondence');
  folder.createFolder('Forms');
  folder.createFolder('Other');
  return folder;
}

function linkFolderToGrievance(grievanceId, folderId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!sheet) throw new Error('Grievance Log not found');
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === grievanceId) {
      var row = i + 2;
      sheet.getRange(row, GRIEVANCE_COLS.DRIVE_FOLDER_ID).setValue(folderId);
      sheet.getRange(row, GRIEVANCE_COLS.DRIVE_FOLDER_URL).setValue('https://drive.google.com/drive/folders/' + folderId);
      return;
    }
  }
  throw new Error('Grievance ' + grievanceId + ' not found');
}

function setupDriveFolderForGrievance() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  if (sheet.getName() !== SHEETS.GRIEVANCE_LOG) {
    ui.alert('⚠️ Please select a grievance row in Grievance Log.');
    return;
  }
  var row = sheet.getActiveCell().getRow();
  if (row < 2) { ui.alert('⚠️ Select a data row, not header.'); return; }
  var grievanceId = sheet.getRange(row, GRIEVANCE_COLS.GRIEVANCE_ID).getValue();
  if (!grievanceId) { ui.alert('⚠️ No Grievance ID in selected row.'); return; }
  var resp = ui.alert('📁 Setup Drive Folder', 'Create folder for ' + grievanceId + '?', ui.ButtonSet.YES_NO);
  if (resp !== ui.Button.YES) return;
  try {
    ss.toast('📁 Creating folder...', 'Please wait', -1);
    var folder = createGrievanceFolder(grievanceId);
    linkFolderToGrievance(grievanceId, folder.getId());
    ui.alert('✅ Folder created for ' + grievanceId);
  } catch (e) { ui.alert('❌ Error: ' + e.message); }
}

function listFolderFiles(folder, path) {
  path = path || '';
  var files = [];
  var fileIt = folder.getFiles();
  while (fileIt.hasNext()) {
    var f = fileIt.next();
    files.push({ name: f.getName(), url: f.getUrl(), size: formatFileSize(f.getSize()), modified: f.getLastUpdated().toLocaleString(), path: path, type: f.getMimeType() });
  }
  var folderIt = folder.getFolders();
  while (folderIt.hasNext()) {
    var sub = folderIt.next();
    var subFiles = listFolderFiles(sub, path ? path + '/' + sub.getName() : sub.getName());
    files = files.concat(subFiles);
  }
  return files;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  var k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(mimeType) {
  if (mimeType.indexOf('image') >= 0) return '🖼️';
  if (mimeType.indexOf('pdf') >= 0) return '📄';
  if (mimeType.indexOf('word') >= 0 || mimeType.indexOf('document') >= 0) return '📝';
  if (mimeType.indexOf('sheet') >= 0 || mimeType.indexOf('excel') >= 0) return '📊';
  return '📎';
}

function showGrievanceFiles() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  if (sheet.getName() !== SHEETS.GRIEVANCE_LOG) { ui.alert('⚠️ Select a grievance row in Grievance Log.'); return; }
  var row = sheet.getActiveCell().getRow();
  if (row < 2) { ui.alert('⚠️ Select a data row.'); return; }
  var grievanceId = sheet.getRange(row, GRIEVANCE_COLS.GRIEVANCE_ID).getValue();
  var folderId = sheet.getRange(row, GRIEVANCE_COLS.DRIVE_FOLDER_ID).getValue();
  if (!folderId) { ui.alert('ℹ️ No folder linked. Use "Setup Drive Folder" first.'); return; }
  try {
    var folder = DriveApp.getFolderById(folderId);
    var files = listFolderFiles(folder);
    if (files.length === 0) { ui.alert('ℹ️ No files uploaded yet.'); return; }
    var list = files.map(function(f) { return '• ' + f.name + ' (' + f.size + ')'; }).join('\n');
    ui.alert('📁 Files - ' + grievanceId, files.length + ' file(s):\n\n' + list, ui.ButtonSet.OK);
  } catch (e) { ui.alert('❌ Error: ' + e.message); }
}

function batchCreateGrievanceFolders() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.alert('📁 Batch Create', 'Create folders for all grievances without one?', ui.ButtonSet.YES_NO);
  if (resp !== ui.Button.YES) return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { ui.alert('No grievances found.'); return; }
  ss.toast('📁 Creating folders...', 'Please wait', -1);
  var data = sheet.getRange(2, 1, lastRow - 1, GRIEVANCE_COLS.DRIVE_FOLDER_URL).getValues();
  var created = 0, skipped = 0;
  data.forEach(function(row) {
    var id = row[0], existing = row[GRIEVANCE_COLS.DRIVE_FOLDER_ID - 1];
    if (!id || existing) { skipped++; return; }
    try {
      var folder = createGrievanceFolder(id);
      linkFolderToGrievance(id, folder.getId());
      created++;
    } catch (e) { Logger.log('Error for ' + id + ': ' + e.message); }
  });
  ui.alert('✅ Complete', 'Created: ' + created + '\nSkipped: ' + skipped, ui.ButtonSet.OK);
}

// ==================== CALENDAR INTEGRATION ====================

function syncDeadlinesToCalendar() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.alert('📅 Sync Deadlines', 'Create calendar events for all grievance deadlines?', ui.ButtonSet.YES_NO);
  if (resp !== ui.Button.YES) return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!sheet || sheet.getLastRow() < 2) { ui.alert('No grievances found.'); return; }
  ss.toast('📅 Syncing...', 'Please wait', -1);
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, GRIEVANCE_COLS.RESOLUTION).getValues();
  var calendar = CalendarApp.getDefaultCalendar();
  var created = 0, skipped = 0;
  var today = new Date();
  data.forEach(function(row) {
    var id = row[GRIEVANCE_COLS.GRIEVANCE_ID - 1];
    var memberName = row[GRIEVANCE_COLS.FIRST_NAME - 1] + ' ' + row[GRIEVANCE_COLS.LAST_NAME - 1];
    var status = row[GRIEVANCE_COLS.STATUS - 1];
    var deadline = row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1];
    var daysTo = row[GRIEVANCE_COLS.DAYS_TO_DEADLINE - 1];
    if (status !== 'Open' || !deadline) { skipped++; return; }
    if (checkCalendarEventExists(calendar, id)) { skipped++; return; }
    var color = CalendarApp.EventColor.BLUE;
    var priority = 'Normal';
    if (daysTo < 0) { color = CalendarApp.EventColor.RED; priority = 'OVERDUE'; }
    else if (daysTo <= 3) { color = CalendarApp.EventColor.ORANGE; priority = 'Urgent'; }
    else if (daysTo <= 7) { color = CalendarApp.EventColor.YELLOW; priority = 'Soon'; }
    try {
      var event = calendar.createAllDayEvent('⚖️ ' + priority + ': ' + id + ' - ' + memberName, new Date(deadline), {
        description: 'Grievance Deadline\nID: ' + id + '\nMember: ' + memberName + '\nDays: ' + daysTo,
        location: '509 Dashboard'
      });
      event.setColor(color);
      event.setTag('509Dashboard', id);
      created++;
    } catch (e) { Logger.log('Error for ' + id + ': ' + e.message); }
  });
  ss.toast('✅ Created ' + created + ' events (' + skipped + ' skipped)', 'Complete', 5);
  ui.alert('✅ Calendar Sync Complete', 'Created: ' + created + '\nSkipped: ' + skipped, ui.ButtonSet.OK);
}

function checkCalendarEventExists(calendar, grievanceId) {
  var now = new Date();
  var future = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  var events = calendar.getEvents(now, future);
  for (var i = 0; i < events.length; i++) {
    if (events[i].getTag('509Dashboard') === grievanceId) return events[i];
  }
  return null;
}

function clearAllCalendarEvents() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.alert('⚠️ Clear All', 'Remove ALL grievance events from calendar?', ui.ButtonSet.YES_NO);
  if (resp !== ui.Button.YES) return;
  var calendar = CalendarApp.getDefaultCalendar();
  var now = new Date();
  var future = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  var events = calendar.getEvents(now, future);
  var removed = 0;
  events.forEach(function(e) {
    if (e.getTag('509Dashboard')) { e.deleteEvent(); removed++; }
  });
  ui.alert('✅ Removed ' + removed + ' events');
}

function showUpcomingDeadlinesFromCalendar() {
  var calendar = CalendarApp.getDefaultCalendar();
  var now = new Date();
  var week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  var events = calendar.getEvents(now, week).filter(function(e) { return e.getTag('509Dashboard'); });
  if (events.length === 0) {
    SpreadsheetApp.getUi().alert('ℹ️ No deadlines in next 7 days');
    return;
  }
  var list = events.slice(0, 10).map(function(e) { return '• ' + e.getTitle() + ' - ' + e.getAllDayStartDate().toLocaleDateString(); }).join('\n');
  SpreadsheetApp.getUi().alert('📅 Upcoming Deadlines', events.length + ' deadline(s):\n\n' + list, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ==================== EMAIL NOTIFICATIONS ====================

function setupDailyDeadlineNotifications() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'checkDeadlinesAndNotify') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('checkDeadlinesAndNotify').timeBased().atHour(8).everyDays(1).create();
  SpreadsheetApp.getActiveSpreadsheet().toast('✅ Daily notifications enabled (8 AM)', 'Automation', 5);
}

function disableDailyDeadlineNotifications() {
  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'checkDeadlinesAndNotify') { ScriptApp.deleteTrigger(t); removed++; }
  });
  SpreadsheetApp.getActiveSpreadsheet().toast('🔕 Removed ' + removed + ' trigger(s)', 'Disabled', 5);
}

function checkDeadlinesAndNotify() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
  if (!sheet || sheet.getLastRow() < 2) return;
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, GRIEVANCE_COLS.RESOLUTION).getValues();
  var notifications = { overdue: [], urgent: [], upcoming: [] };
  data.forEach(function(row, idx) {
    var id = row[GRIEVANCE_COLS.GRIEVANCE_ID - 1];
    var firstName = row[GRIEVANCE_COLS.FIRST_NAME - 1];
    var lastName = row[GRIEVANCE_COLS.LAST_NAME - 1];
    var status = row[GRIEVANCE_COLS.STATUS - 1];
    var deadline = row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1];
    var daysTo = row[GRIEVANCE_COLS.DAYS_TO_DEADLINE - 1];
    var steward = row[GRIEVANCE_COLS.STEWARD - 1];
    if (status !== 'Open' || !deadline || !steward) return;
    var info = { id: id, memberName: firstName + ' ' + lastName, deadline: deadline, daysRemaining: daysTo, steward: steward, row: idx + 2 };
    if (daysTo < 0) notifications.overdue.push(info);
    else if (daysTo <= 3) notifications.urgent.push(info);
    else if (daysTo <= 7) notifications.upcoming.push(info);
  });
  var sent = 0;
  notifications.overdue.forEach(function(g) { sendDeadlineNotification(g, 'OVERDUE'); sent++; });
  notifications.urgent.forEach(function(g) { sendDeadlineNotification(g, 'URGENT'); sent++; });
  notifications.upcoming.forEach(function(g) { sendDeadlineNotification(g, 'UPCOMING'); sent++; });
  Logger.log('Deadline check: ' + sent + ' notifications sent');
}

function sendDeadlineNotification(grievance, priority) {
  try {
    var recipients = getNotificationRecipients(grievance, priority);
    if (recipients.length === 0) return;
    var subject = createEmailSubject(grievance, priority);
    var body = createEmailBody(grievance, priority);
    MailApp.sendEmail({ to: recipients.join(','), subject: subject, body: body, name: 'SEIU Local 509 Dashboard' });
    Logger.log('Sent ' + priority + ' notification for ' + grievance.id);
  } catch (e) { Logger.log('Error sending for ' + grievance.id + ': ' + e.message); }
}

function getNotificationRecipients(grievance, priority) {
  var recipients = [];
  if (grievance.steward && isValidEmailForNotifications(grievance.steward)) recipients.push(grievance.steward);
  if ((priority === 'URGENT' || priority === 'OVERDUE') && grievance.manager && isValidEmailForNotifications(grievance.manager)) {
    recipients.push(grievance.manager);
  }
  return recipients;
}

function isValidEmailForNotifications(email) {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.toString().trim());
}

function createEmailSubject(grievance, priority) {
  var prefix = { OVERDUE: '🚨 OVERDUE', URGENT: '⚠️ URGENT', UPCOMING: '📅 Deadline Reminder' }[priority];
  return prefix + ': Grievance ' + grievance.id + ' - ' + grievance.memberName;
}

function createEmailBody(grievance, priority) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var urgency = '';
  if (priority === 'OVERDUE') urgency = '⚠️ THIS GRIEVANCE IS OVERDUE BY ' + Math.abs(grievance.daysRemaining) + ' DAY(S)!';
  else if (priority === 'URGENT') urgency = '⏰ Deadline in ' + grievance.daysRemaining + ' day(s). Please prioritize.';
  else urgency = 'Reminder: deadline approaching in ' + grievance.daysRemaining + ' day(s).';
  return 'SEIU Local 509 - Grievance Deadline Notification\n\n' + urgency + '\n\n' +
    'Grievance ID: ' + grievance.id + '\n' +
    'Member: ' + grievance.memberName + '\n' +
    'Steward: ' + grievance.steward + '\n' +
    'Deadline: ' + Utilities.formatDate(new Date(grievance.deadline), Session.getScriptTimeZone(), 'MMMM dd, yyyy') + '\n' +
    'Days Remaining: ' + grievance.daysRemaining + '\n\n' +
    'View in Dashboard: ' + ss.getUrl() + '\n\n' +
    'This is an automated notification from SEIU Local 509 Dashboard.';
}

function showNotificationSettings() {
  var triggers = ScriptApp.getProjectTriggers();
  var enabled = triggers.some(function(t) { return t.getHandlerFunction() === 'checkDeadlinesAndNotify'; });
  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><base target="_top"><style>body{font-family:Arial;padding:20px;background:#f5f5f5}.container{background:white;padding:25px;border-radius:8px}h2{color:#1a73e8}.status{padding:15px;border-radius:4px;margin:20px 0;font-weight:bold}.enabled{background:#d4edda;color:#155724}.disabled{background:#f8d7da;color:#721c24}button{background:#1a73e8;color:white;border:none;padding:12px 24px;border-radius:4px;cursor:pointer;margin:5px}button.danger{background:#dc3545}</style></head><body><div class="container"><h2>📬 Notification Settings</h2><div class="status ' + (enabled ? 'enabled">✅ Enabled' : 'disabled">🔕 Disabled') + '</div><p><strong>Schedule:</strong> Daily at 8 AM</p><p><strong>7-Day Warning:</strong> Email to steward</p><p><strong>3-Day Warning:</strong> Email to steward + manager</p><p><strong>Overdue:</strong> Immediate notification</p><button onclick="google.script.run.withSuccessHandler(function(){google.script.host.close()}).setupDailyDeadlineNotifications()">' + (enabled ? '🔄 Refresh' : '✅ Enable') + '</button>' + (enabled ? '<button class="danger" onclick="google.script.run.withSuccessHandler(function(){google.script.host.close()}).disableDailyDeadlineNotifications()">🔕 Disable</button>' : '') + '<button onclick="google.script.run.checkDeadlinesAndNotify();google.script.host.close()">🧪 Test Now</button></div></body></html>'
  ).setWidth(500).setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, '📬 Notification Settings');
}

function testDeadlineNotifications() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.alert('🧪 Test Notifications', 'Run deadline check and send real emails?', ui.ButtonSet.YES_NO);
  if (resp !== ui.Button.YES) return;
  SpreadsheetApp.getActiveSpreadsheet().toast('🧪 Running check...', 'Testing', -1);
  try {
    checkDeadlinesAndNotify();
    ui.alert('✅ Test complete. Check logs for details.');
  } catch (e) { ui.alert('❌ Error: ' + e.message); }
}
