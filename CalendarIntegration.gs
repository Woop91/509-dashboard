/**
 * ------------------------------------------------------------------------====
 * GOOGLE CALENDAR INTEGRATION
 * ------------------------------------------------------------------------====
 *
 * Sync grievance deadlines to Google Calendar
 * Features:
 * - Create calendar events for all deadlines
 * - Color-code by priority (red for overdue, yellow for due soon)
 * - Update events when grievance status changes
 * - Delete events when grievance is closed
 */

/**
 * Syncs all grievance deadlines to Google Calendar
 */
function syncDeadlinesToCalendar() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    '📅 Sync Deadlines to Google Calendar',
    'This will create calendar events for all grievance deadlines.\n\n' +
    'Events will be created in your default Google Calendar with:\n' +
    '• Red = Overdue\n' +
    '• Orange = Due within 3 days\n' +
    '• Yellow = Due within 7 days\n' +
    '• Blue = Due later\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('📅 Syncing deadlines to calendar...', 'Please wait', -1);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const grievanceSheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);

    if (!grievanceSheet) {
      ui.alert('❌ Grievance Log sheet not found!');
      return;
    }

    const lastRow = grievanceSheet.getLastRow();
    if (lastRow < 2) {
      ui.alert('ℹ️ No grievances found to sync.');
      return;
    }

    // Get all grievance data - read all columns up to RESOLUTION (last column)
    const data = grievanceSheet.getRange(2, 1, lastRow - 1, GRIEVANCE_COLS.RESOLUTION).getValues();

    const calendar = CalendarApp.getDefaultCalendar();
    let eventsCreated = 0;
    let eventsSkipped = 0;

    data.forEach(function(row, index) {
      const grievanceId = row[GRIEVANCE_COLS.GRIEVANCE_ID - 1];
      const memberName = `${row[GRIEVANCE_COLS.FIRST_NAME - 1]} ${row[GRIEVANCE_COLS.LAST_NAME - 1]}`;
      const status = row[GRIEVANCE_COLS.STATUS - 1];
      const nextActionDue = row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1];
      const daysToDeadline = row[GRIEVANCE_COLS.DAYS_TO_DEADLINE - 1];

      // Only create events for open grievances with deadlines
      if (status !== 'Open' || !nextActionDue) {
        eventsSkipped++;
        return;
      }

      // Check if event already exists
      const existingEvent = checkCalendarEventExists(calendar, grievanceId);
      if (existingEvent) {
        eventsSkipped++;
        return;
      }

      // Determine priority and color
      let color = CalendarApp.EventColor.BLUE; // Default: Due later
      let priority = 'Normal';

      if (daysToDeadline < 0) {
        color = CalendarApp.EventColor.RED;
        priority = 'OVERDUE';
      } else if (daysToDeadline <= 3) {
        color = CalendarApp.EventColor.ORANGE;
        priority = 'Urgent';
      } else if (daysToDeadline <= 7) {
        color = CalendarApp.EventColor.YELLOW;
        priority = 'Soon';
      }

      // Create event
      const title = `⚖️ ${priority}: ${grievanceId} - ${memberName}`;
      const description =
        `Grievance Deadline\n\n` +
        `Grievance ID: ${grievanceId}\n` +
        `Member: ${memberName}\n` +
        `Status: ${status}\n` +
        `Days to Deadline: ${daysToDeadline}\n` +
        `Priority: ${priority}\n\n` +
        `Created by 509 Dashboard`;

      try {
        const event = calendar.createAllDayEvent(
          title,
          new Date(nextActionDue),
          {
            description: description,
            location: '509 Dashboard'
          }
        );

        event.setColor(color);
        event.setTag('509Dashboard', grievanceId); // Tag for identification

        eventsCreated++;
      } catch (error) {
        Logger.log(`Error creating event for ${grievanceId}: ${error.message}`);
      }
    });

    SpreadsheetApp.getActiveSpreadsheet().toast(
      `✅ Created ${eventsCreated} calendar events (${eventsSkipped} skipped)`,
      'Complete',
      5
    );

    ui.alert(
      '✅ Calendar Sync Complete',
      `Successfully synced deadlines to Google Calendar:\n\n` +
      `• Events created: ${eventsCreated}\n` +
      `• Events skipped: ${eventsSkipped} (closed or already synced)\n\n` +
      `Check your Google Calendar for the new events!`,
      ui.ButtonSet.OK
    );

  } catch (error) {
    ui.alert('❌ Error: ' + error.message);
    Logger.log('Calendar sync error: ' + error.message);
  }
}

/**
 * Checks if a calendar event already exists for a grievance
 * @param {Calendar} calendar - The Google Calendar
 * @param {string} grievanceId - The grievance ID to check
 * @returns {CalendarEvent|null} The existing event or null
 */
function checkCalendarEventExists(calendar, grievanceId) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year from now

  const events = calendar.getEvents(now, futureDate);

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const tag = event.getTag('509Dashboard');
    if (tag === grievanceId) {
      return event;
    }
  }

  return null;
}

/**
 * Clears all 509 Dashboard events from calendar
 */
function clearAllCalendarEvents() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    '⚠️ Clear All Calendar Events',
    'This will remove ALL grievance deadline events from your Google Calendar.\n\n' +
    'This action cannot be undone!\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    const calendar = CalendarApp.getDefaultCalendar();
    const now = new Date();
    const futureDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));

    const events = calendar.getEvents(now, futureDate);
    let removedCount = 0;

    events.forEach(function(event) {
      const tag = event.getTag('509Dashboard');
      if (tag) {
        event.deleteEvent();
        removedCount++;
      }
    });

    ui.alert(
      '✅ Calendar Events Cleared',
      `Removed ${removedCount} events from your calendar.`,
      ui.ButtonSet.OK
    );

  } catch (error) {
    ui.alert('❌ Error: ' + error.message);
  }
}

/**
 * Shows upcoming deadlines from calendar
 */
function showUpcomingDeadlinesFromCalendar() {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    const now = new Date();
    const nextWeek = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    const events = calendar.getEvents(now, nextWeek);
    const dashboardEvents = events.filter(function(e) { return e.getTag('509Dashboard'); });

    if (dashboardEvents.length === 0) {
      SpreadsheetApp.getUi().alert(
        'ℹ️ No Upcoming Deadlines',
        'No grievance deadlines in the next 7 days.\n\n' +
        'Run "Sync Deadlines to Calendar" to create calendar events.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      return;
    }

    const eventList = dashboardEvents
      .slice(0, 10)
      .map(function(e) { return `  • ${e.getTitle()} - ${e.getAllDayStartDate().toLocaleDateString()}`; })
      .join('\n');

    SpreadsheetApp.getUi().alert(
      '📅 Upcoming Deadlines (Next 7 Days)',
      `Found ${dashboardEvents.length} deadline(s):\n\n${eventList}` +
      (dashboardEvents.length > 10 ? `\n  ... and ${dashboardEvents.length - 10} more` : ''),
      SpreadsheetApp.getUi().ButtonSet.OK
    );

  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Error: ' + error.message);
  }
}
