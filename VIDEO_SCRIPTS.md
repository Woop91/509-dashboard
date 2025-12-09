# 509 Dashboard - Video Tutorial Scripts

**Version:** 3.28
**Last Updated:** 2025-12-09

Complete recording scripts for creating video tutorials. Each script includes narration, screen actions, and timing suggestions.

---

## Recording Tips

**Before Recording:**
- Use seed data (20k members, 5k grievances) for realistic demonstrations
- Set screen resolution to 1920x1080 for clarity
- Use a quiet environment with clear audio
- Have the script open on a second monitor

**Recording Software Options:**
- OBS Studio (free) - Best for screen recording
- Loom (free tier) - Easy sharing
- Screencastify (Chrome extension) - Simple

**Best Practices:**
- Pause 2-3 seconds after each major action
- Use zoom/highlight features to focus attention
- Keep videos under 15 minutes
- Add chapter markers for longer videos

---

## Video 1: Getting Started with 509 Dashboard

**Duration:** 8-10 minutes
**Category:** Basics
**Audience:** First-time users

### Script

---

**[INTRO - 0:00-0:30]**

*Screen: Show Google Sheets with 509 Dashboard open*

> "Welcome to the 509 Dashboard tutorial. I'm going to show you how to get started with this powerful union management system.
>
> By the end of this video, you'll know how to navigate the dashboard, understand the main features, and be ready to manage members and grievances."

---

**[OVERVIEW - 0:30-2:00]**

*Screen: Show the sheet tabs at bottom*

> "Let's start with an overview. The 509 Dashboard has several sheet tabs at the bottom. The main ones are:
>
> - **Member Directory** - where all your union members are tracked
> - **Grievance Log** - where you track all grievances
> - **Dashboard** - your real-time overview
> - **Config** - your dropdown settings"

*Action: Click on each tab briefly*

> "You'll also notice six menus at the top. Let me show you what each one does."

*Action: Hover over each menu*

> "**Dashboard menu** - for daily operations like searching and grievance tools
> **Sheet Manager** - for data management and backups
> **Setup** - for configuration
> **Demo** - for test data (you'll remove this in production)
> **Administrator** - for system health and settings
> **Tests** - for running diagnostics"

---

**[MEMBER DIRECTORY - 2:00-4:00]**

*Screen: Navigate to Member Directory*

> "Let's look at the Member Directory. This sheet has 31 columns of member data."

*Action: Scroll right slowly to show columns*

> "You have:
> - Basic info like name, job title, and location
> - Contact information
> - Steward assignments
> - Engagement metrics like meeting attendance and volunteer hours
> - And at the end, auto-calculated grievance status fields"

*Action: Highlight the auto-calculated columns (Z-AD)*

> "These columns marked in gray are auto-calculated. Don't edit them directly - they update automatically from the Grievance Log."

---

**[GRIEVANCE LOG - 4:00-6:00]**

*Screen: Navigate to Grievance Log*

> "Now let's look at the Grievance Log. This is where you track every grievance from filing to resolution."

*Action: Show the columns*

> "The Grievance Log has 34 columns. The key thing to understand is that deadlines are calculated automatically.
>
> When you enter an incident date, the system calculates:
> - Filing deadline - 21 days from incident
> - Step I decision due - 30 days from filing
> - And all subsequent appeal deadlines"

*Action: Point to the auto-calculated deadline columns*

> "Look at these deadline columns. They're color-coded:
> - **Green** means 7 or more days remaining
> - **Yellow** means 1-7 days - due soon
> - **Red** means overdue - act immediately"

---

**[DASHBOARD OVERVIEW - 6:00-7:30]**

*Screen: Navigate to Dashboard sheet*

> "The Dashboard gives you a real-time overview of everything. At the top you see member metrics - total members, active stewards, and engagement stats.
>
> Below that are grievance metrics - how many are open, pending, and settled this month.
>
> And at the bottom, you see upcoming deadlines sorted by urgency."

*Action: Click Dashboard menu → Refresh All*

> "To update the dashboard with the latest data, go to Dashboard menu and click Refresh All."

---

**[CLOSING - 7:30-8:00]**

*Screen: Show the Help menu*

> "That's the basics! In the next videos, we'll dive deeper into adding members, filing grievances, and using the advanced features.
>
> If you need help anytime, press F1 for context-sensitive help, or check the Help menu.
>
> Thanks for watching!"

---

## Video 2: Managing Members

**Duration:** 6-8 minutes
**Category:** Members
**Audience:** Stewards, administrators

### Script

---

**[INTRO - 0:00-0:20]**

> "In this video, I'll show you how to add and manage members in the 509 Dashboard."

---

**[ADDING A MEMBER - 0:20-3:00]**

*Screen: Navigate to Member Directory*

> "To add a new member, go to the Member Directory sheet and find the first empty row."

*Action: Scroll to empty row*

> "Let me walk through the required fields:
>
> **Column A - Member ID**: Enter a unique ID like M000001
> **Column B - First Name**: Enter their first name
> **Column C - Last Name**: Their last name
> **Column D - Job Title**: Use the dropdown - these come from your Config sheet
> **Column E - Work Location**: Also a dropdown
> **Column F - Unit**: Their unit number"

*Action: Fill in each field, showing the dropdowns*

> "For contact info:
> **Column H - Email**: Their email address
> **Column I - Phone**: Phone number
> **Column J - Is Steward**: Yes or No - this is important for steward assignment"

*Action: Complete the entry*

> "That's the minimum needed. The other columns are optional but helpful for tracking engagement."

---

**[SEARCHING FOR MEMBERS - 3:00-4:30]**

*Screen: Show Dashboard menu*

> "To find a member, you have several options.
>
> The quickest is to use Ctrl+F for Google Sheets' built-in search."

*Action: Press Ctrl+F and search*

> "For more powerful search, go to Dashboard menu → Search & Lookup → Search Members."

*Action: Open the search dialog*

> "Here you can search by name, ID, location, or unit. You can also filter by steward status."

---

**[EDITING MEMBERS - 4:30-5:30]**

*Screen: Show a member row*

> "To edit a member, simply click on any editable cell and change the value.
>
> Remember - the last few columns with gray headers are auto-calculated. Don't edit those directly.
>
> All changes are saved automatically - that's the beauty of Google Sheets."

---

**[ENGAGEMENT TRACKING - 5:30-6:30]**

*Screen: Show engagement columns*

> "The engagement columns help you track member participation:
>
> - Meetings attended this year
> - Surveys completed
> - Volunteer hours
> - Interest flags for local actions, chapter activities, and allied actions
>
> Keeping these updated helps identify future leaders and members who may need re-engagement."

---

**[CLOSING - 6:30-7:00]**

> "That's member management! In the next video, we'll cover how to file and track grievances."

---

## Video 3: Grievance Workflow

**Duration:** 12-15 minutes
**Category:** Grievances
**Audience:** Stewards, grievance coordinators

### Script

---

**[INTRO - 0:00-0:30]**

> "This is the most important video in the series. I'll show you the complete grievance workflow - from filing to resolution.
>
> The 509 Dashboard automates deadline tracking so you never miss a critical date."

---

**[STARTING A GRIEVANCE - 0:30-3:00]**

*Screen: Navigate to Grievance Log*

> "To start a new grievance, go to the Grievance Log and find the first empty row."

*Action: Enter data in each field*

> "Enter the grievance details:
>
> **Column A - Grievance ID**: Use format G-000001
> **Column B - Member ID**: This must match a Member ID in the Member Directory
> **Columns C-D**: First and Last name
> **Column E - Status**: Start with 'Open'
> **Column F - Current Step**: Usually 'Step I'
> **Column G - Incident Date**: When the incident occurred"

*Pause to show the auto-calculation*

> "Watch what happens when I enter the incident date... The Filing Deadline in Column H automatically calculates - that's 21 days from the incident per Article 23.
>
> Now I'll enter the Date Filed in Column I..."

*Action: Enter filing date*

> "And now the Step I Decision Due date calculates automatically - 30 days from filing."

---

**[DEADLINE TRACKING - 3:00-5:00]**

*Screen: Show the deadline columns*

> "Let me explain the deadline system. The dashboard tracks these deadlines automatically:
>
> - **Filing deadline**: Incident + 21 days
> - **Step I decision**: Filed + 30 days
> - **Step II appeal**: Step I decision + 10 days
> - **Step II decision**: Appeal + 30 days
> - **Step III appeal**: Step II decision + 30 days
>
> Each deadline is color-coded. Green means on track, yellow means due soon, red means overdue."

*Action: Show the Days to Deadline column*

> "Column U shows 'Days to Deadline' - the most urgent deadline for this grievance. This is how the dashboard sorts what needs attention first."

---

**[UPDATING GRIEVANCE STATUS - 5:00-7:00]**

*Screen: Show the status and step columns*

> "As the grievance progresses, update these fields:
>
> When you receive the Step I decision, enter the date in Column K. This triggers the Step II appeal deadline calculation.
>
> If the member wants to appeal, change the Current Step to 'Step II' and enter the appeal date."

*Action: Demonstrate updating fields*

> "The status column has these options:
> - **Open**: Active grievance
> - **Appealed**: Moving to next step
> - **Pending Info**: Waiting for documentation
> - **Settled**: Resolved favorably
> - **Withdrawn**: Member withdrew
> - **Closed**: Resolved (any outcome)"

---

**[GRIEVANCE CLASSIFICATION - 7:00-9:00]**

*Screen: Show classification columns*

> "Now let's look at grievance classification. These columns help with reporting and pattern analysis:
>
> **Column V - Articles Violated**: Which contract articles were violated
> **Column W - Issue Category**: Type of issue - discipline, safety, scheduling, etc.
> **Column X - Description**: Brief summary of what happened"

*Action: Enter classification data*

> "Good classification helps identify systemic issues. If you see many grievances about the same article or issue, that's a pattern worth addressing at the bargaining table."

---

**[OUTCOMES AND RESOLUTION - 9:00-11:00]**

*Screen: Show outcome columns*

> "When a grievance is resolved, record the outcome:
>
> **Resolution Date**: When it was settled
> **Outcome**: Won, Lost, Settled, Withdrawn
> **Remedy Details**: What the member received
> **Settlement Amount**: If applicable"

*Action: Close a sample grievance*

> "Once resolved, change the Status to 'Settled' or 'Closed'. The dashboard will update to reflect this."

---

**[GOOGLE DRIVE INTEGRATION - 11:00-12:30]**

*Screen: Show Dashboard menu → Google Drive*

> "The dashboard can create a Google Drive folder for each grievance. This keeps all documents organized.
>
> Go to Dashboard menu → Grievance Tools → Create Grievance Folder
>
> The folder will contain:
> - A PDF summary of the grievance
> - Space for supporting documents
> - Auto-generated timeline"

---

**[CLOSING - 12:30-13:00]**

> "That's the complete grievance workflow. The key is entering data accurately - the system handles the deadline math.
>
> In the next video, we'll cover email communications and calendar integration."

---

## Video 4: Email Communications

**Duration:** 5-6 minutes
**Category:** Communication
**Audience:** Stewards, coordinators

### Script

---

**[INTRO - 0:00-0:15]**

> "Let me show you how to send emails directly from the 509 Dashboard."

---

**[EMAIL TEMPLATES - 0:15-2:00]**

*Screen: Navigate to Dashboard menu → Communications*

> "Go to Dashboard menu → Communications → Email Templates.
>
> The system includes pre-built templates for common messages:
> - Grievance filing confirmation
> - Deadline reminders
> - Meeting invitations
> - Status updates"

*Action: Show template selection*

> "Select a template, customize it with the member's information, and send. The email is logged automatically."

---

**[COMPOSING EMAILS - 2:00-3:30]**

*Screen: Show compose email dialog*

> "You can also compose custom emails. The system will:
> - Auto-fill member information
> - Attach relevant grievance PDFs
> - Log the communication
>
> All sent emails appear in the Communication Log sheet for reference."

---

**[BULK COMMUNICATIONS - 3:30-4:30]**

*Screen: Show bulk email option*

> "For announcements to multiple members, use the Bulk Communication feature.
>
> You can filter recipients by:
> - Unit
> - Location
> - Steward status
> - Engagement level
>
> The system sends individual emails so they feel personal, not mass-mailed."

---

**[CLOSING - 4:30-5:00]**

> "Email integration keeps all communications in one place. No more searching through your inbox!"

---

## Video 5: Reports & Analytics

**Duration:** 10-12 minutes
**Category:** Reporting
**Audience:** Leadership, administrators

### Script

---

**[INTRO - 0:00-0:20]**

> "In this video, I'll show you how to generate reports and understand the analytics in the 509 Dashboard."

---

**[MAIN DASHBOARD - 0:20-2:00]**

*Screen: Navigate to Dashboard sheet*

> "The main Dashboard gives you key metrics at a glance:
>
> **Member Section:**
> - Total members
> - Active stewards
> - Average engagement score
> - Volunteer hours this year
>
> **Grievance Section:**
> - Open grievances
> - Pending info
> - Settled this month
> - Average days to resolution"

---

**[OPERATIONS MONITOR - 2:00-4:00]**

*Screen: Open Dashboard menu → Dashboards → Unified Operations Monitor*

> "For deeper analysis, open the Unified Operations Monitor. This terminal-style dashboard shows:
>
> - Executive status and alerts
> - Process efficiency metrics
> - Network health
> - Active grievance log
> - Follow-up radar
> - Predictive alerts
> - Systemic risk monitor"

*Action: Navigate through sections*

> "The predictive alerts use historical data to forecast potential issues before they become crises."

---

**[INTERACTIVE DASHBOARD - 4:00-6:00]**

*Screen: Navigate to Interactive Dashboard*

> "The Interactive Dashboard lets you customize your view. You can choose:
>
> - What metrics to display
> - Chart types (pie, bar, line)
> - Color schemes
> - Time periods"

*Action: Change chart selections*

> "This is perfect for presentations to leadership or membership meetings."

---

**[STEWARD WORKLOAD - 6:00-7:30]**

*Screen: Navigate to Steward Workload sheet*

> "The Steward Workload sheet shows case distribution:
>
> - Total cases per steward
> - Active cases
> - Win rate
> - Overdue items
> - Due this week
>
> If any steward is overloaded, you can reassign cases to balance the workload."

---

**[GENERATING REPORTS - 7:30-9:30]**

*Screen: Show Sheet Manager menu → Reports*

> "To generate formal reports, go to Sheet Manager menu → Reports.
>
> Available reports include:
> - Monthly grievance summary
> - Member engagement report
> - Steward performance
> - Deadline compliance
> - Year-over-year comparison"

*Action: Generate a sample report*

> "Reports can be exported as PDF or sent directly via email to leadership."

---

**[CLOSING - 9:30-10:00]**

> "Data-driven decisions make stronger unions. Use these reports to identify patterns, celebrate wins, and address issues proactively."

---

## Video 6: Calendar Integration

**Duration:** 4-5 minutes
**Category:** Integration
**Audience:** All users

### Script

---

**[INTRO - 0:00-0:15]**

> "Never miss a deadline again! Let me show you how to sync grievance deadlines with Google Calendar."

---

**[SETTING UP CALENDAR SYNC - 0:15-2:00]**

*Screen: Navigate to Dashboard menu → Calendar Integration*

> "Go to Dashboard menu → Calendar Integration → Setup Calendar Sync.
>
> The first time you do this, you'll need to authorize access to your Google Calendar.
>
> Once authorized, you can choose:
> - Which calendar to use (create a dedicated '509 Grievances' calendar)
> - How far in advance to create events
> - Whether to include reminders"

---

**[SYNCING DEADLINES - 2:00-3:30]**

*Screen: Show the sync dialog*

> "Click 'Sync All Deadlines' to create calendar events for every upcoming deadline.
>
> Each event includes:
> - Grievance ID and member name
> - What's due (Step I decision, appeal deadline, etc.)
> - Link back to the spreadsheet row
>
> You can also sync individual grievances from the Grievance Log."

---

**[REMINDERS - 3:30-4:00]**

*Screen: Show calendar with events*

> "With deadlines in your calendar, you'll get reminders on your phone, email, or desktop.
>
> I recommend setting reminders for 7 days, 3 days, and 1 day before each deadline."

---

**[CLOSING - 4:00-4:30]**

> "Calendar integration is a game-changer for staying on top of deadlines. Set it up once and stay protected."

---

## Video 7: Batch Operations

**Duration:** 6-7 minutes
**Category:** Advanced
**Audience:** Administrators

### Script

---

**[INTRO - 0:00-0:20]**

> "When you need to update many records at once, batch operations save hours of work. Let me show you how."

---

**[BULK UPDATES - 0:20-2:30]**

*Screen: Navigate to Sheet Manager menu*

> "Go to Sheet Manager menu → Bulk Operations.
>
> You can:
> - Update multiple member locations at once (useful when offices move)
> - Reassign stewards in bulk
> - Mass update engagement levels
> - Batch close resolved grievances"

*Action: Show a bulk update example*

> "Select your criteria, preview the changes, and confirm. The system logs all bulk operations for audit purposes."

---

**[IMPORT/EXPORT - 2:30-4:00]**

*Screen: Show import/export options*

> "For large data migrations:
>
> **Export**: Download member or grievance data as CSV
> **Import**: Upload data from CSV files
>
> The import wizard validates data before committing, catching errors like:
> - Duplicate IDs
> - Missing required fields
> - Invalid dropdown values"

---

**[DATA CLEANUP - 4:00-5:30]**

*Screen: Show data validation menu*

> "The Data Validation tools help maintain data quality:
>
> - **Find duplicates**: Identify potential duplicate members
> - **Fix formatting**: Standardize phone numbers, names
> - **Fill missing data**: Identify records needing attention
>
> Run these monthly to keep your data clean."

---

**[CLOSING - 5:30-6:00]**

> "Batch operations are powerful - use them wisely! Always preview changes before confirming, and keep backups."

---

## Video 8: Steward Quick Guide

**Duration:** 8-10 minutes
**Category:** Role-Specific
**Audience:** Union stewards

### Script

---

**[INTRO - 0:00-0:30]**

> "This video is specifically for union stewards. I'll show you the features you'll use every day to support our members."

---

**[YOUR DAILY WORKFLOW - 0:30-2:30]**

*Screen: Show Dashboard*

> "Start each day by checking the Dashboard. Look at:
>
> 1. **Upcoming Deadlines** - What needs attention today?
> 2. **Your Active Cases** - Filter by your name to see your caseload
> 3. **Alerts** - Any urgent items flagged red?"

*Action: Demonstrate filtering*

> "The system prioritizes by urgency. Red items first, then yellow, then green."

---

**[HELPING A MEMBER - 2:30-5:00]**

*Screen: Show Member Directory*

> "When a member comes to you with an issue:
>
> 1. **Look them up** - Search by name or ID
> 2. **Check their history** - Have they filed before?
> 3. **Review their info** - Is contact information current?"

*Action: Find a member and review*

> "If they want to file a grievance:
> 1. Go to Grievance Log
> 2. Enter their information
> 3. The system calculates all deadlines automatically
>
> Tell them: 'I've logged your grievance. You'll hear back by [deadline date].'"

---

**[TRACKING YOUR CASES - 5:00-6:30]**

*Screen: Show Steward Workload*

> "The Steward Workload sheet shows your current cases at a glance:
>
> - How many active cases you have
> - Which ones are overdue
> - Which ones are due this week
>
> If you're overloaded, talk to your coordinator about reassigning some cases."

---

**[UPDATING PROGRESS - 6:30-8:00]**

*Screen: Show Grievance Log with updates*

> "As cases progress, update the Grievance Log:
>
> - Received a decision? Enter the date
> - Member wants to appeal? Update the step and file the appeal
> - Case resolved? Enter the outcome
>
> The member's record in Member Directory automatically updates to reflect their grievance status."

*Action: Update a grievance*

> "Good record-keeping protects both the member and you. Document everything."

---

**[CLOSING - 8:00-8:30]**

> "You're the frontline of our union. The 509 Dashboard is here to support your critical work.
>
> Thank you for everything you do for our members!"

---

## Supplementary Videos

### Video: System Administration (for admins only)

**Topics to cover:**
- Running diagnostics
- Managing user roles (RBAC)
- Setting up triggers
- Backup and recovery
- Configuring dropdowns in Config sheet

### Video: Demo Mode & Going Live

**Topics to cover:**
- Using seed data for training
- Nuking demo data (exit demo mode)
- Preparing for production
- Best practices for going live

---

## Video Checklist

Use this checklist when recording:

**Pre-Recording:**
- [ ] Script reviewed and practiced
- [ ] Seed data loaded (realistic examples)
- [ ] Screen resolution set (1920x1080)
- [ ] Microphone tested
- [ ] Notifications disabled
- [ ] Browser bookmarks hidden

**During Recording:**
- [ ] Speak clearly and at moderate pace
- [ ] Pause after major actions
- [ ] Zoom on important UI elements
- [ ] Acknowledge common mistakes
- [ ] Use consistent terminology

**Post-Recording:**
- [ ] Trim dead air at start/end
- [ ] Add chapter markers
- [ ] Include captions/subtitles
- [ ] Export at 1080p minimum
- [ ] Upload and update VIDEO_TUTORIALS URLs

---

**Version:** 3.28
**Last Updated:** 2025-12-09
