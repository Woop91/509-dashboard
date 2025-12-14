# 509 Dashboard - Google Apps Script v3.44

Complete union member database and grievance tracking system for Local 509.

## 🆕 What's New in v3.44

### Latest Updates (v3.40-3.44 - December 2025)

**Hidden Sheet Architecture** ⭐ NEW:
- **4 Hidden Calculation Sheets** - Auto-synchronize data between sheets invisibly
- **Auto-Population** - Member Directory columns AB-AD auto-update from Grievance Log
- **Cross-Sheet Sync** - Grievance Log columns C-D, X-AA auto-update from Member Directory
- **Engagement Tracking** - Columns Q-T auto-update from Meeting Attendance + Volunteer Hours
- **Self-Healing** - REPAIR_DASHBOARD() recreates all hidden sheets and triggers
- **Verification** - VERIFY_HIDDEN_SHEETS() diagnoses sync issues

**New Sheets:**
- 📅 Meeting Attendance - Track member meeting participation
- 🤝 Volunteer Hours - Track member volunteer activities

**New Menu Items:**
- Administrator → Setup & Triggers → 🔍 Verify Hidden Sheets
- Administrator → Setup & Triggers → 📅 Setup Engagement Tracking

---

## 🔧 What's in v3.27

### Latest Updates (v3.27 - December 2025)

**Dynamic Column System & Code Quality:**
- **100% Dynamic Columns** - All column references use MEMBER_COLS and GRIEVANCE_COLS constants
- **31-Column Member Directory** - Complete member tracking with engagement metrics
- **34-Column Grievance Log** - Full grievance lifecycle management
- **Row mapper functions** - mapMemberRow() and mapGrievanceRow() for cleaner code
- **Verification commands** - Built-in tools to verify code quality
- **MAP/LAMBDA formulas** - Fixed Member Directory formulas for proper row-by-row calculations

**Menu System (6 Menus):**
- 👤 Dashboard - Daily operations, search, grievance tools
- 📊 Sheet Manager - Data, performance, automations
- 🔧 Setup - Dropdown configuration
- 🎭 Demo - Seed data, nuke functions
- ⚙️ Administrator - System health, RBAC, column toggles
- 🧪 Tests - Unit, validation, integration tests

### Previous Updates (v2.6)

**User Experience & Onboarding:**
- **Interactive Tutorial System** - 9-step guided tour with progress tracking
- **Video Tutorial Library** - 8 categorized instructional videos
- **Quick Start Guide** - Rapid onboarding for new users
- **Context-Sensitive Help** - F1 shortcut with sheet-specific help content
- **Searchable Help Index** - Find help topics quickly

**Data Protection & Compliance:**
- **PII Protection System** - Field-level masking for emails, phones, SSNs
- **GDPR/CCPA Compliance** - Data portability export, right to erasure
- **Anonymization Tools** - Anonymize inactive member records
- **PII Audit Reports** - Track and report on PII usage

**Communication Management:**
- **Email Opt-Out System** - Checkbox-based opt-out with red row highlighting
- **Bulk Opt-Out Operations** - Manage opt-out status in bulk
- **Export Protection** - Opted-out emails prefixed with "(UNSUBSCRIBED)"

**Productivity Features:**
- **Quick Actions Menu** - Right-click context menu for common actions
- **Enhanced Validation** - Real-time email/phone validation with auto-formatting
- **Bulk Validation Tool** - Validate entire datasets with detailed reports

### Previous Updates (v2.5)
- **Coordinator Notification System** - Checkbox-based notification system
- **Documentation Overhaul** - Comprehensive feature status documentation

### Previous Updates (v2.4)
- **Audit Logging System** - Full audit trail for all data modifications
- **Role-Based Access Control (RBAC)** - Admin, Steward, and Viewer roles
- **DIAGNOSE_SETUP()** - Comprehensive system health check function
- **Three Data Clearing Options** - nukeSeedData() (Exit Demo), nukeAllSheetData() (Comprehensive), clearAllData() (Core Only)
- **Build System Fixes** - Proper module consolidation with 78 production modules

### Previous Updates (v2.0)

### Major Updates
- **Three-Tier Menu System**: Reorganized menus by role (User, Manager, Administrator)
- **Toggle-Based Data Generation**: Seed members and grievances in 5k/2.5k increments
- **Enhanced Accessibility**: ADHD-friendly controls, dark mode, focus mode, custom themes
- **Advanced Analytics**: Predictive analytics and root cause analysis tools
- **Performance Optimization**: Caching layer, lazy loading, optimized batch operations
- **Security Enhancements**: Improved input validation and error handling
- **Integration Suite**: Gmail, Google Drive, and Calendar integration
- **Mobile Optimization**: Responsive dashboards for mobile devices
- **Backup & Recovery**: Automated backup system with point-in-time restoration
- **Bug Fixes**: Resolved hideGridlines TypeError and other stability improvements

## 📋 Table of Contents
- [What's New in v2.0](#-whats-new-in-v20)
- [Overview](#-overview)
- [How It Works](#-how-it-works)
- [Features](#-features)
- [Setup Instructions](#setup-instructions)
- [Architecture](#-architecture)
- [Three-Tier Menu System](#-three-tier-menu-system)
- [Detailed Features](#-detailed-features)
- [Data Seeding](#data-seeding)
- [Key Improvements](#key-improvements)
- [Usage](#usage)
- [Usage Examples](#-usage-examples)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)
- [Data Privacy & Security](#-data-privacy--security)

## 🎯 Overview

The 509 Dashboard is a comprehensive Google Sheets-based system for managing union member data and tracking grievances. Built with Google Apps Script, it provides automated deadline calculations, real-time analytics, and centralized data management—all without requiring external databases or complex infrastructure.

**Built for**: Local 509 union organizers, stewards, and administrators
**Platform**: Google Sheets + Google Apps Script
**Data Capacity**: Tested with 20,000 members and 5,000 grievances
**Key Principle**: All metrics derived from real data—no simulated or fake statistics

## 🔧 How It Works

### Core Components

1. **Google Apps Script Engine**: JavaScript-based automation that runs within Google Sheets
2. **Sheet-Based Database**: Uses Google Sheets as a structured database with data validation
3. **Formula-Driven Calculations**: Auto-calculates deadlines, metrics, and status updates
4. **Config-Driven Dropdowns**: Centralized lists ensure data consistency across all sheets

### Data Flow

```
Config Tab (Master Lists)
    ↓
    ├→ Member Directory (31 columns of member data)
    │   ↓
    │   └→ Grievance snapshot fields auto-populate from Grievance Log
    │
    └→ Grievance Log (34 columns of grievance tracking)
        ↓
        ├→ Auto-calculates deadlines based on contract rules
        ├→ Tracks days open and days to deadline
        └→ Feeds data back to Member Directory
        ↓
Dashboard (Real-time metrics and visualizations)
```

### Automation Features

- **On-Open Trigger**: Menu loads automatically when sheet opens
- **Formula-Based Updates**: Calculations refresh automatically when data changes
- **Data Validation**: Dropdowns enforce consistent values from Config tab
- **Batch Processing**: Seeding functions use optimized batch writes for performance

## ✨ Features

### Core Functionality
✅ **Correct Member Directory** - All 31 required columns exactly as specified
✅ **Complete Grievance Log** - All 28 required columns with auto-calculated deadlines
✅ **Real Data Only** - No fake CPU/memory metrics, all analytics from actual data
✅ **Config Tab** - Centralized dropdown management for consistency
✅ **Auto-Calculations** - Deadline tracking, days open, status snapshots
✅ **Data Seeding** - Generate 20k members + 5k grievances for testing/training
✅ **Member Satisfaction Tracking** - Survey data with calculated averages
✅ **Feedback System** - Track system improvements and feature requests

### Advanced Features
✅ **Three-Tier Menu System** - Role-based menu organization (User, Manager, Admin)
✅ **Interactive Dashboard** - Real-time metrics with visual analytics
✅ **Google Drive Integration** - Auto-create folders for grievances, file management
✅ **Gmail Integration** - Email templates, communications log, bulk notifications
✅ **Calendar Integration** - Sync deadlines, deadline reminders
✅ **Accessibility Features** - ADHD-friendly controls, dark mode, focus mode, themes
✅ **Batch Operations** - Bulk steward assignment, status updates, PDF exports
✅ **Smart Assignment** - Auto-assign stewards based on workload and expertise
✅ **Predictive Analytics** - Forecast trends, identify patterns
✅ **Root Cause Analysis** - Advanced diagnostic tools for grievance patterns
✅ **Backup & Recovery** - Automated backups with point-in-time recovery
✅ **Performance Optimization** - Caching layer, lazy loading, batch processing
✅ **Workflow Management** - State machine for grievance lifecycle tracking
✅ **Knowledge Base** - FAQ system with search functionality
✅ **Mobile Optimization** - Mobile-friendly dashboards and views
✅ **Undo/Redo System** - Full history tracking with keyboard shortcuts

### v2.6 Features (NEW)
✅ **Interactive Tutorial** - 9-step guided tour with progress tracking
✅ **Video Tutorials** - 8 categorized instructional videos
✅ **Quick Actions Menu** - Right-click context menu for common tasks
✅ **PII Protection** - Field-level masking, GDPR/CCPA compliance
✅ **Email Opt-Out System** - Checkbox-based opt-out with visual highlighting
✅ **Enhanced Validation** - Real-time email/phone validation with auto-formatting
✅ **Context-Sensitive Help** - F1 shortcut, sheet-specific help content

## Setup Instructions

1. Create a new Google Sheet
2. Go to **Extensions > Apps Script**
3. Delete any existing code
4. Copy and paste the entire contents of `Code.gs`
5. Save the project
6. Refresh your Google Sheet
7. Six menus will appear: **"👤 Dashboard"**, **"📊 Sheet Manager"**, **"🔧 Setup"**, **"🎭 Demo"**, **"⚙️ Administrator"**, and **"🧪 Tests"**
8. Click **Administrator > Seed Functions > Seed Members** to generate test data

## 🏗️ Architecture

### File Structure

```
Code.gs
├── Configuration Constants (SHEETS object)
├── Main Setup Function (CREATE_509_DASHBOARD)
├── Sheet Creation Functions
│   ├── createConfigTab()
│   ├── createMemberDirectory()
│   ├── createGrievanceLog()
│   ├── createMainDashboard()
│   ├── createAnalyticsDataSheet()
│   ├── createMemberSatisfactionSheet()
│   └── createFeedbackSheet()
├── Data Management
│   ├── setupDataValidations()
│   ├── setupFormulasAndCalculations()
│   ├── SEED_FULL_DEMO() - Seeds 2K members + 300 grievances
│   └── NUKE_ALL_DATA() - Clears all data
└── User Interface
    ├── onOpen() - Menu creation
    ├── refreshCalculations()
    ├── goToDashboard()
    └── showHelp()
```

### Technical Details

**Language**: Google Apps Script (JavaScript ES6)
**Runtime**: Google Apps Script V8 Runtime
**Permissions Required**:
- Google Sheets API access
- Ability to create/modify sheets
- Ability to add custom menus

**Performance Optimizations**:
- Batch writing (1000 rows at a time for seeding)
- SpreadsheetApp.flush() for immediate updates
- Hidden analytics sheet to reduce visual clutter
- Formula-based calculations instead of script calculations where possible

### Database Design

The system uses a **normalized sheet structure**:

1. **Config** = Master reference tables
2. **Member Directory** = Member entity (1 row = 1 member)
3. **Grievance Log** = Grievance entity (1 row = 1 grievance)
4. **Relationships**: Member Directory ← Member ID → Grievance Log

This prevents data duplication and ensures consistency.

## 🎯 Three-Tier Menu System

The dashboard features a role-based menu organization for improved usability:

### 👤 Dashboard (Average User)
**For daily operations and common tasks**

Features include:
- **Dashboards**: Unified Operations Monitor, Main Dashboard, Interactive Dashboard
- **Search & Lookup**: Member search with quick lookup
- **Grievance Tools**: Start new grievances, float toggle, control panel
- **Google Drive**: Folder setup, file uploads, grievance file management
- **Communications**: Email composition, templates, communications log
- **Reports**: Custom report builder, CSV exports
- **Accessibility**: ADHD control panel, theme manager, dark mode, focus mode
- **Help & Support**: Getting started guide, help resources, keyboard shortcuts

### 📊 Sheet Manager
**For data management, performance, and integrity**

Features include:
- **Data Management**: Backup & recovery, automated backups, backup logs
- **Performance**: Cache management, cache warming, performance monitoring
- **Data Integrity**: Quality dashboard, referential integrity checks, change logs
- **Automations**: Notification settings, deadline alerts, monthly/quarterly reports
- **Google Drive Integration**: Batch folder creation
- **Calendar Integration**: Deadline syncing, upcoming deadline views
- **Analysis & Insights**: Predictive analytics, root cause analysis
- **Batch Operations**: Bulk steward assignment, status updates, PDF exports
- **Smart Assignment**: Auto-assign stewards, workload balancing
- **Knowledge Base**: FAQ management and search

### ⚙️ Administrator
**For system administration and configuration**

Features include:
- **Seed Functions**: Toggle-based member/grievance generation (5,000 increments), legacy 20k/5k functions
- **System Health**: Error dashboard, health checks, error trend analysis
- **Root Cause Analysis**: Advanced diagnostic tools
- **Workflow Management**: Workflow visualizer, state management, batch updates
- **Setup & Configuration**: Dashboard enhancements, analytics population, dropdown management
- **Column Toggles & View**: Member column visibility, diagnostics hiding, gridline control
- **History & Undo**: Undo/redo system with keyboard shortcuts
- **Mobile & Viewing**: Mobile-optimized dashboards, paginated data viewer
- **Testing**: Notification testing, report generation, diagnostics

## 📊 Detailed Features

### 1. Config Tab - Centralized Control

**Purpose**: Single source of truth for all dropdown values

**How it works**:
- Each column contains a master list (Job Titles, Locations, Units, etc.)
- Data validation rules reference these ranges
- Changes to Config automatically update all dropdowns
- Prevents typos and inconsistent data entry

**Columns**:
- Job Titles (empty - populate with your organization's job titles)
- Office Locations (empty - populate with your office locations)
- Units (empty - populate with your organizational units)
- Office Days (Monday-Sunday)
- Yes/No (Standard boolean values)
- Supervisors (empty - populate with supervisor names)
- Managers (empty - populate with manager names)
- Stewards (empty - populate with steward/organizer names)
- Grievance Status (Open, Pending Info, Settled, Withdrawn, Closed, Appealed)
- Grievance Step (Informal, Step I, Step II, Step III, Mediation, Arbitration)
- Issue Category (Discipline, Workload, Scheduling, Pay, Discrimination, Safety, Benefits, etc.)
- Articles Violated (Contract articles: Art. 1-30)
- Communication Methods (Email, Phone, Text, In Person)
- Grievance Coordinators (empty - populate with your coordinators)
- Home Towns (empty - populate with your member locations)

**Best Practices**:
- Keep lists continuous (no blank rows in middle)
- Add new values at the bottom
- Use Find & Replace if changing existing values
- Don't delete values that are in use

### 2. Member Directory - Complete Member Profiles

**Purpose**: Track all member information and engagement

**31 Columns Explained**:

| Column | Type | Purpose | Auto-Populated? |
|--------|------|---------|----------------|
| Member ID | Text | Unique identifier (e.g., M000001) | Manual |
| First Name | Text | Member's first name | Manual |
| Last Name | Text | Member's last name | Manual |
| Job Title | Dropdown | Current position | Manual (from Config) |
| Work Location (Site) | Dropdown | Primary work location | Manual (from Config) |
| Unit | Dropdown | Bargaining unit | Manual (from Config) |
| Office Days | Text | Days in office (Mon, Tue, etc.) | Manual |
| Email Address | Email | Primary contact email | Manual |
| Phone Number | Phone | Contact number | Manual |
| Is Steward (Y/N) | Dropdown | Whether member is a steward | Manual (from Config) |
| Supervisor (Name) | Dropdown | Direct supervisor | Manual (from Config) |
| Manager (Name) | Dropdown | Manager | Manual (from Config) |
| Assigned Steward (Name) | Dropdown | Primary steward for this member | Manual (from Config) |
| Last Virtual Mtg (Date) | Date | Most recent virtual meeting attendance | Manual |
| Last In-Person Mtg (Date) | Date | Most recent in-person meeting | Manual |
| Last Survey (Date) | Date | Most recent survey completion | Manual |
| Last Email Open (Date) | Date | Most recent email engagement | Manual |
| Open Rate (%) | Number | Email open rate percentage | Manual |
| Volunteer Hours (YTD) | Number | Hours volunteered year-to-date | Manual |
| Interest: Local Actions | Dropdown (Y/N) | Interested in local organizing | Manual |
| Interest: Chapter Actions | Dropdown (Y/N) | Interested in chapter activities | Manual |
| Interest: Allied Chapter Actions | Dropdown (Y/N) | Interested in allied chapter work | Manual |
| Timestamp | Date/Time | Record creation/update time | Manual |
| Preferred Communication Methods | Dropdown | How they prefer contact | Manual (from Config) |
| Best Time(s) to Reach Member | Text | Preferred contact times | Manual |
| **Has Open Grievance?** | **Formula** | **Yes if member has open grievance** | **AUTO** |
| **Grievance Status Snapshot** | **Formula** | **Status of member's grievance** | **AUTO** |
| **Next Grievance Deadline** | **Formula** | **Upcoming deadline for grievance** | **AUTO** |
| Most Recent Steward Contact Date | Date | Last contact from steward | Manual |
| Steward Who Contacted Member | Text | Name of contacting steward | Manual |
| Notes from Steward Contact | Text | Notes from conversation | Manual |

**Key Features**:
- Grievance snapshot fields (columns 26-28) automatically populate from Grievance Log
- Data validation prevents invalid entries
- All engagement metrics in one place for easy analysis

### 3. Grievance Log - Complete Grievance Tracking

**Purpose**: Track every grievance through its lifecycle with automatic deadline calculations

**34 Columns Explained** (see AIR.md for full details):

| Column | Type | Purpose | Auto-Calculated? |
|--------|------|---------|------------------|
| Grievance ID | Text | Unique ID (e.g., G-000001) | Manual |
| Member ID | Text | Links to Member Directory | Manual |
| First Name | Text | Member's first name | Manual |
| Last Name | Text | Member's last name | Manual |
| Status | Dropdown | Current status (Open, Pending, Settled, etc.) | Manual (from Config) |
| Current Step | Dropdown | Grievance step (Informal, Step I-III, etc.) | Manual (from Config) |
| Incident Date | Date | When incident occurred | Manual |
| **Filing Deadline (21d)** | **Formula** | **Incident Date + 21 days** | **AUTO** |
| Date Filed (Step I) | Date | When grievance was filed | Manual |
| **Step I Decision Due (30d)** | **Formula** | **Date Filed + 30 days** | **AUTO** |
| Step I Decision Rcvd | Date | When Step I decision received | Manual |
| **Step II Appeal Due (10d)** | **Formula** | **Step I Decision + 10 days** | **AUTO** |
| Step II Appeal Filed | Date | When appealed to Step II | Manual |
| **Step II Decision Due (30d)** | **Formula** | **Step II Appeal + 30 days** | **AUTO** |
| Step II Decision Rcvd | Date | When Step II decision received | Manual |
| **Step III Appeal Due (30d)** | **Formula** | **Step II Decision + 30 days** | **AUTO** |
| Step III Appeal Filed | Date | When appealed to Step III | Manual |
| Date Closed | Date | When grievance closed/resolved | Manual |
| **Days Open** | **Formula** | **Today - Date Filed (or Date Closed - Date Filed)** | **AUTO** |
| **Next Action Due** | **Formula** | **Next upcoming deadline based on current step** | **AUTO** |
| **Days to Deadline** | **Formula** | **Next Action Due - Today** | **AUTO** |
| Articles Violated | Dropdown | Contract articles violated | Manual (from Config) |
| Issue Category | Dropdown | Type of grievance | Manual (from Config) |
| Member Email | Email | Member's email (for reference) | Manual |
| Unit | Dropdown | Member's unit | Manual (from Config) |
| Work Location (Site) | Dropdown | Member's work location | Manual (from Config) |
| Assigned Steward (Name) | Dropdown | Steward handling case | Manual (from Config) |
| Resolution Summary | Text | How grievance was resolved | Manual |

**Deadline Calculation Rules** (Based on standard union contract):
- **Filing Deadline**: Incident Date + 21 days
- **Step I Decision**: Date Filed + 30 days
- **Step II Appeal**: Step I Decision + 10 days
- **Step II Decision**: Step II Appeal + 30 days
- **Step III Appeal**: Step II Decision + 30 days

**Key Features**:
- All deadlines auto-calculate based on contract rules
- "Next Action Due" intelligently selects the relevant deadline based on current step
- "Days to Deadline" shows urgency (negative numbers = overdue)
- Conditional formatting highlights approaching/overdue deadlines

### 4. Dashboard - Real-Time Analytics

**Purpose**: At-a-glance view of key metrics, all derived from real data

**Metrics Displayed**:

**Member Metrics**:
- Total Members: `=COUNTA('Member Directory'!A:A)-1`
- Active Stewards: `=COUNTIF('Member Directory'!J:J,"Yes")`
- Average Open Rate: `=AVERAGE('Member Directory'!R:R)`
- YTD Volunteer Hours: `=SUM('Member Directory'!S:S)`

**Grievance Metrics**:
- Open Grievances: `=COUNTIF('Grievance Log'!E:E,"Open")`
- Pending Info: `=COUNTIF('Grievance Log'!E:E,"Pending Info")`
- Settled This Month: Count of settled grievances with Date Closed in current month
- Average Days Open: `=AVERAGE(FILTER('Grievance Log'!S:S, 'Grievance Log'!E:E="Open"))`

**Engagement Metrics** (Last 30 Days):
- Virtual Meetings Attended
- In-Person Meetings Attended
- Members Interested in Local Actions
- Members Interested in Chapter Actions

**Upcoming Deadlines**:
- Table showing next 10 grievances with approaching deadlines
- Auto-sorted by date

**Key Features**:
- All formulas reference actual data (no hardcoded values)
- Updates automatically when data changes
- Timestamp shows last calculation refresh

### 5. Data Seeding Functions

**Purpose**: Generate realistic test data for training and testing

**SEED_FULL_DEMO()** - Seeds complete demo dataset (max 2K members + 300 grievances)
- Config dropdown values
- 2,000 members with ALL fields populated
- 300 grievances with ALL fields populated
- Batch writes 50 members / 25 grievances at a time

**SEED_2K_MEMBERS()** - Generates 2,000 member records
- Realistic names, job titles, locations, units
- Contact tracking (last contact, notes, followup dates)
- Committee assignments and skills
- Steward contact history
- Batch writes 50 rows at a time with 1s delay

**SEED_300_GRIEVANCES()** - Generates 300 grievance records
- Links to existing members via Member ID
- Step dates, deadlines, management responses
- Coordinator messages and resolution notes
- Batch writes 25 rows at a time with 1s delay

**NUKE_ALL_DATA()** - Clears all member and grievance data

**Limits**: Max 2,000 members, 300 grievances (prevents timeout)

### 6. Hidden Sheet Architecture (v3.40+)

**Purpose**: Automatic cross-sheet data synchronization using hidden calculation sheets

**The 4 Hidden Sheets**:

| Hidden Sheet | Source | Destination | Columns Updated |
|--------------|--------|-------------|-----------------|
| `_Grievance_Calc` | Grievance Log | Member Directory | AB-AD (Has Open Grievance, Status, Deadline) |
| `_Member_Lookup` | Member Directory | Grievance Log | C-D (Names), X-AA (Email, Unit, Location, Steward) |
| `_Steward_Contact_Calc` | Communications Log | Member Directory | Y-AA (Contact Date, Steward, Notes) |
| `_Engagement_Calc` | Meeting Attendance + Volunteer Hours | Member Directory | Q-T (Last Meetings, Vol Hours) |

**How It Works**:
1. User edits a source sheet (e.g., changes member email in Member Directory)
2. onEdit trigger fires automatically
3. Hidden sheet recalculates formulas (MAP/LAMBDA)
4. Calculated values sync to destination sheet as static values

**Key Functions**:
- `REPAIR_DASHBOARD()` - Recreates all 4 hidden sheets + installs all 4 triggers
- `VERIFY_HIDDEN_SHEETS()` - Diagnoses sync issues without changing anything
- `setupEngagementTracking()` - Creates Meeting Attendance + Volunteer Hours + _Engagement_Calc

**Menu Access**: Administrator → Setup & Triggers → Verify Hidden Sheets

---

### 7. Member Satisfaction Tracking

**Purpose**: Track and analyze member satisfaction surveys

**Columns**:
- Survey ID
- Member ID (links to Member Directory)
- Member Name
- Date Sent
- Date Completed
- Overall Satisfaction (1-5 scale)
- Steward Support (1-5 scale)
- Communication (1-5 scale)
- Would Recommend Union (Y/N)
- Comments (free text)

**Calculated Metrics**:
- Average Overall Satisfaction
- Average Steward Support
- Average Communication
- % Would Recommend (percentage of Yes responses)

### 7. Feedback & Development

**Purpose**: Track system improvements and feature requests

**Columns**:
- Timestamp
- Submitted By
- Category
- Type (Bug, Feature Request, Improvement)
- Priority (Low, Medium, High, Critical)
- Title
- Description
- Status (New, In Progress, Resolved, Won't Fix)
- Assigned To
- Resolution
- Notes

## Sheet Structure

### Config Tab
Master lists for all dropdowns:
- Job Titles
- Office Locations
- Units
- Supervisors, Managers, Stewards
- Grievance Status & Steps
- Issue Categories
- Articles Violated

### Member Directory
31 columns tracking:
- Basic info (ID, name, contact)
- Work details (job, location, unit, supervisor, manager)
- Steward assignments
- Engagement metrics (meetings, surveys, volunteer hours)
- Interests (local, chapter, allied actions)
- Grievance snapshot (auto-populated)
- Communication preferences

### Grievance Log
34 columns tracking:
- Grievance identification
- Member linkage
- Status and step tracking
- All deadlines (auto-calculated):
  - Filing deadline (incident + 21d)
  - Step I decision (filed + 30d)
  - Step II appeal (decision + 10d)
  - Step II decision (appeal + 30d)
  - Step III appeal (decision + 30d)
- Days open (auto-calculated)
- Days to deadline (auto-calculated)
- Resolution tracking

### Dashboard
Real-time metrics from actual data:
- Total members, active stewards, engagement rates
- Open grievances by status
- Upcoming deadlines
- Member satisfaction scores
- All metrics linked to actual Member Directory and Grievance Log data

### Member Satisfaction
Survey tracking with calculated averages:
- Overall satisfaction
- Steward support ratings
- Communication ratings
- Recommendation percentage

### Feedback & Development
System improvement tracking

## Data Seeding

Generate realistic test data using the toggle-based approach:

### Member Seeding
- **Toggle 1-4**: Generate 5,000 members each (20,000 total maximum)
- Each batch includes diverse names, locations, job titles, engagement history
- Access via: **⚙️ Administrator > Seed Functions > Seed Members**

### Grievance Seeding
- **Toggle 1-2**: Generate 2,500 grievances each (5,000 total maximum)
- Linked to existing members with various statuses and realistic timelines
- Access via: **⚙️ Administrator > Seed Functions > Seed Grievances**

### Benefits of Toggle-Based Approach
- Avoids Google Apps Script timeout limits
- Allows incremental data generation
- Better performance for large datasets
- Legacy functions (Seed All 20k/5k) still available for backward compatibility

### Clear Data Options
- **Nuke Seed Data (Exit Demo Mode)**: Removes core test data, sets SEED_NUKED flag, shows post-nuke guidance
  - Access via: **⚙️ Administrator > Seed Functions > 🚨 Nuke Seed Data (Exit Demo Mode)**
- **Nuke ALL Sheet Data (Comprehensive)**: Clears ALL sheets including analytics, surveys, feedback, archive
  - Access via: **⚙️ Administrator > Seed Functions > 🗑️ Nuke ALL Sheet Data (Comprehensive)**
- **Clear Core Data Only**: Clears only Member Directory and Grievance Log
  - Access via: **⚙️ Administrator > Seed Functions > ⚠️ Clear Core Data Only**

## Key Improvements

### Core Enhancements
✅ **All columns match specifications exactly**
✅ **No fake metrics** (removed CPU usage, memory, innovation index, etc.)
✅ **Real analytics** based on actual Member Directory and Grievance Log data
✅ **Auto-calculated deadlines** follow contract timelines
✅ **Linked data** between Member Directory and Grievance Log
✅ **Data validation** from Config tab prevents inconsistent entries

### Recent Enhancements (v2.0)
✅ **Three-tier menu system** - Role-based organization for improved usability
✅ **Toggle-based seeding** - Incremental data generation to avoid timeouts
✅ **Enhanced accessibility** - ADHD-friendly features, dark mode, focus mode
✅ **Advanced analytics** - Predictive analytics and root cause analysis
✅ **Workflow automation** - State machine for grievance lifecycle management
✅ **Performance optimization** - Caching, lazy loading, batch operations
✅ **Security enhancements** - Input validation, error handling, access controls
✅ **Mobile optimization** - Responsive dashboards for mobile devices
✅ **Integration ecosystem** - Gmail, Google Drive, Calendar integration
✅ **Backup & recovery** - Automated backups with point-in-time restoration

## Usage

### Quick Start
1. **Setup**: Run `CREATE_509_DASHBOARD()` from Apps Script to create all sheets
2. **Generate Test Data**: Use **Administrator > Seed Functions** to populate with sample data
3. **Add Members**: Manually enter in Member Directory or use seed functions
4. **Log Grievances**: Use **Dashboard > Grievance Tools > Start New Grievance**
5. **Track Progress**: Deadlines calculate automatically
6. **Monitor**: Access dashboards via **Dashboard > Dashboards** menu
7. **Maintain Config**: Add locations, stewards, etc. in Config tab

### Menu Navigation
- **👤 Dashboard**: Daily operations (search, grievances, reports, accessibility)
- **📊 Sheet Manager**: Data management, backups, automations, analytics
- **⚙️ Administrator**: System setup, seed functions, health monitoring

## 💡 Usage Examples

### Example 1: Adding a New Member

1. Go to **Member Directory** sheet
2. Click on the first empty row
3. Enter Member ID (e.g., M000123)
4. Fill in name, contact info
5. Use dropdowns for:
   - Job Title (from Config)
   - Work Location (from Config)
   - Unit (from Config)
   - Supervisor, Manager, Assigned Steward (from Config)
6. Fill in engagement data as available
7. Grievance columns (26-28) will auto-populate if the member has grievances

### Example 2: Logging a New Grievance

1. Go to **Grievance Log** sheet
2. Click on the first empty row
3. Enter:
   - Grievance ID (e.g., G-000456)
   - Member ID (must match Member Directory)
   - Member name
   - **Incident Date** (when it happened)
   - **Date Filed** (when you filed it)
4. Select from dropdowns:
   - Status (usually "Open")
   - Current Step (usually "Informal" or "Step I")
   - Issue Category
   - Articles Violated
   - Assigned Steward
5. Watch as the system automatically calculates:
   - Filing Deadline (Incident + 21d)
   - Step I Decision Due (Filed + 30d)
   - Days Open
   - Next Action Due
   - Days to Deadline

### Example 3: Tracking a Grievance Through Steps

**Scenario**: Grievance filed, Step I decision received, now appealing to Step II

1. Find the grievance row in **Grievance Log**
2. Enter **Step I Decision Rcvd** date (column K)
3. System automatically calculates **Step II Appeal Due** (Decision + 10d)
4. When you file Step II appeal:
   - Enter **Step II Appeal Filed** date (column M)
   - Update **Current Step** to "Step II"
   - System calculates **Step II Decision Due** (Appeal + 30d)
5. **Next Action Due** automatically updates to show Step II decision deadline
6. Member Directory grievance snapshot updates automatically

### Example 4: Closing a Grievance

1. Go to the grievance row in **Grievance Log**
2. Update **Status** to "Settled" (or "Withdrawn", "Closed")
3. Enter **Date Closed**
4. Fill in **Resolution Summary** (brief description of outcome)
5. System automatically:
   - Calculates total **Days Open** (Date Closed - Date Filed)
   - Clears **Next Action Due** (no more deadlines)
   - Updates **Member Directory** grievance snapshot
6. Dashboard "Open Grievances" count decreases automatically

### Example 5: Adding a New Location to Config

**Scenario**: Local 509 opens a new office in "Framingham"

1. Go to **Config** tab
2. Find the "Office Locations" column (Column B)
3. Scroll to the first empty cell in that column
4. Type "Framingham Office"
5. Immediately, all dropdowns in:
   - Member Directory → Work Location
   - Grievance Log → Work Location
   ...now include "Framingham Office" as an option

### Example 6: Generating Test Data

**For Training or Testing**:

1. Click **⚙️ Administrator** menu
2. Select **Seed Functions > Seed Members > Seed Members - Toggle 1 (5,000)**
3. Repeat for additional member batches if needed (Toggle 2, 3, 4 for up to 20k total)
4. Select **Seed Functions > Seed Grievances > Seed Grievances - Toggle 1 (2,500)**
5. Repeat for additional grievance batch if needed (Toggle 2 for up to 5k total)
6. Go to **Dashboard > Dashboards > Main Dashboard** to see populated metrics
7. Use **Administrator > Seed Functions > 🚨 Nuke Seed Data (Exit Demo Mode)** when done testing

**Note**: The toggle-based approach allows for incremental data generation to avoid timeouts

### Example 7: Monthly Report Generation

**Scenario**: You need member engagement stats for the monthly chapter meeting

1. Go to **Dashboard**
2. Note the metrics:
   - Total Members
   - Active Stewards
   - Open Grievances count
   - Engagement metrics (last 30 days)
3. Check **Upcoming Deadlines** table for grievances needing attention
4. Go to **Member Directory** and filter:
   - Interest: Local Actions = "Yes"
   - Last Virtual Mtg >= (30 days ago)
5. Export this filtered list for targeted outreach
6. Go to **Grievance Log** and filter by Status = "Open" to review active cases

### Example 8: Tracking Steward Workload

**Scenario**: Want to see how many open grievances each steward is handling

1. Go to **Grievance Log**
2. Click Data → Create a filter
3. Filter **Status** = "Open"
4. Filter **Assigned Steward** = specific steward name
5. Count visible rows to see their caseload
6. OR use **Analytics Data** sheet (if unhidden) which has pre-calculated steward workloads

## 🐛 Troubleshooting

### Issue: Menus "👤 Dashboard", "📊 Sheet Manager", or "⚙️ Administrator" don't appear

**Solution**:
- Close and reopen the Google Sheet
- Check that the script is saved: Extensions > Apps Script
- Run `onOpen()` manually from script editor (or `onOpen_Reorganized()` if using reorganized menu)
- Check permissions: Apps Script may need authorization on first run
- Ensure Code.gs has the correct menu structure implemented

### Issue: Formulas showing #REF! errors

**Cause**: Sheet names don't match expected names

**Solution**:
- Ensure sheets are named exactly:
  - "Member Directory" (not "Member-Directory" or "Members")
  - "Grievance Log" (not "Grievances")
  - "Config" (not "Configuration")
- Re-run `CREATE_509_DASHBOARD()` to recreate sheets with correct names

### Issue: Dropdowns not showing values from Config

**Cause**: Data validation not set up or Config tab modified

**Solution**:
1. Check **Config** tab has values in the right columns
2. Go to Apps Script editor
3. Run `setupDataValidations()` function manually
4. Or re-run full `CREATE_509_DASHBOARD()` setup

### Issue: Seeding functions timeout or fail

**Cause**: Google Apps Script execution time limit (6 minutes)

**Solution**:
- Reduce batch size in code (change BATCH_SIZE constant)
- Run in smaller chunks (modify functions to seed 5k at a time instead of 20k)
- For very large datasets, consider importing CSV data instead

### Issue: Deadline calculations not working

**Cause**: Formulas not set up in Grievance Log

**Solution**:
1. Go to Apps Script editor
2. Run `setupFormulasAndCalculations()` manually
3. Check that date columns have actual dates (not text)
4. Verify formulas exist in columns H, J, L, N, P, S, T, U

### Issue: Member Directory grievance snapshot not updating

**Cause**: Hidden sheets or triggers not installed (v3.40+ architecture)

**Solution**:
1. Run **Administrator → Setup & Triggers → 🔍 Verify Hidden Sheets**
2. If issues found, run `REPAIR_DASHBOARD()` from Apps Script
3. This recreates the `_Grievance_Calc` hidden sheet and installs the sync trigger

### Issue: Grievance Log member data (C-D, X-AA) not updating

**Cause**: Hidden `_Member_Lookup` sheet or trigger missing

**Solution**:
1. Run `VERIFY_HIDDEN_SHEETS()` to diagnose
2. Run `REPAIR_DASHBOARD()` to recreate all hidden sheets and triggers
3. Or run `setupMemberLookupSheet()` + `installMemberSyncTrigger()` individually

### Issue: Engagement columns Q-T are blank

**Cause**: Engagement source sheets or hidden sheet not created

**Solution**:
1. Run **Administrator → Setup & Triggers → 📅 Setup Engagement Tracking**
2. This creates Meeting Attendance sheet, Volunteer Hours sheet, and `_Engagement_Calc` hidden sheet
3. Enter data in the source sheets - Member Directory Q-T will auto-populate

### Issue: Dashboard showing #DIV/0! or #N/A errors

**Cause**: No data in Member Directory or Grievance Log yet

**Solution**:
- Errors are normal when sheets are empty
- Add at least one member and one grievance, or
- Run seed functions to populate with test data
- Formulas will calculate correctly once data exists

### Issue: "Cannot read property of null" script error

**Cause**: Sheet doesn't exist

**Solution**:
- Run `CREATE_509_DASHBOARD()` to create all required sheets
- Check that you haven't renamed or deleted any sheets
- Sheet names are case-sensitive

### Issue: Data validation allows invalid values

**Cause**: User typed instead of using dropdown, or validation rule removed

**Solution**:
1. Re-run `setupDataValidations()` from Apps Script
2. Educate users to always use dropdowns, not typing
3. Regularly audit data with filters to find inconsistent values

### Issue: Performance is slow with large datasets

**Optimization tips**:
- Avoid opening all sheets at once
- Use filters instead of scrolling through thousands of rows
- Hide unused sheets
- Clear formatting from unused cells
- Consider archiving old closed grievances to a separate sheet

### Issue: Want to customize deadline timelines (not 21/30/10 days)

**Solution**:
1. Go to Apps Script editor
2. Find `setupFormulasAndCalculations()` function
3. Modify the formulas:
   - Line with `G${row}+21` → change 21 to your filing deadline days
   - Line with `I${row}+30` → change 30 to your Step I decision days
   - Line with `K${row}+10` → change 10 to your Step II appeal days
   - etc.
4. Save and run the function to update all formulas

## 📌 Best Practices

1. **Always use dropdowns** - Don't type values that should come from Config
2. **Keep Config clean** - Remove unused values, fix typos in Config (not in data sheets)
3. **Use consistent Member IDs** - Stick to a format (e.g., M000001, M000002)
4. **Enter dates promptly** - Grievance calculations depend on accurate dates
5. **Review deadlines weekly** - Check Dashboard "Upcoming Deadlines" regularly
6. **Archive old data** - Move closed grievances older than 2 years to archive sheet
7. **Back up regularly** - File > Make a copy periodically
8. **Train users** - Ensure all stewards understand the system before using
9. **Test before production** - Use seed functions to test, then clear before real use
10. **Document customizations** - If you modify Config lists or formulas, document changes

## 🔒 Data Privacy & Security

- **Access Control**: Use Google Sheets sharing settings to control who can view/edit
- **Member Data**: Contains PII (names, emails, phone numbers) - restrict access appropriately
- **Grievance Confidentiality**: Limit access to union staff and authorized stewards only
- **Backup Strategy**: Regular backups recommended (Google Sheets has version history)
- **Export Restrictions**: Be cautious about exporting member lists to CSV/Excel

## 📝 Notes

- Dashboard metrics refresh automatically when data changes
- Grievance deadlines calculated based on contract rules (21/30/10 day timelines)
- Member grievance status auto-populates from Grievance Log
- All dropdowns controlled centrally via Config tab
- No fake data - everything traces back to actual records
- System supports up to ~100,000 rows per sheet (Google Sheets limit: 10M cells total)

## 📞 Support

For issues with the 509 Dashboard:
1. Check this README's Troubleshooting section
2. Review formulas in Apps Script code
3. Test with fresh setup using `CREATE_509_DASHBOARD()`
4. Document bugs in the Feedback & Development sheet

## 🚧 Pending Features

The following features are partially implemented and need completion:

### Grievance Workflow Enhancement
The grievance workflow now includes:
- ✅ Google Drive folder creation for each grievance
- ✅ Sharing dialog with multiple recipient selection options:
  - Member email
  - Steward email
  - Grievance Coordinator 1, 2, 3
  - Grievance email address

**Remaining Tasks:**

### ⚙️ Configuration Required:
1. **Configure Grievance Coordinator Email Addresses**
   - Current State: Config sheet has coordinator names only
   - Action Needed: Add email address column mapping for each coordinator
   - Location: Config sheet columns P, Q, R (currently storing names)
   - Suggested: Add columns S, T, U for coordinator emails or create separate section

2. **Set Up Grievance Email Address**
   - Current State: Placeholder email `grievances@seiu509.org`
   - Action Needed: Configure actual union grievance inbox email
   - Location: `GrievanceWorkflow.gs` line 543

3. **Enable Folder Sharing**
   - Current State: Commented out in `shareGrievanceWithRecipients()` function
   - Action Needed: Uncomment `folder.addEditor(email)` line 769
   - Prerequisites: Valid email addresses configured for all coordinators

4. **Enable Email Notifications**
   - Current State: Email sending commented out (lines 792-796)
   - Action Needed: Uncomment `GmailApp.sendEmail()` calls
   - Prerequisites: Valid email addresses and Gmail API permissions

### 🔧 Technical Tasks:
5. Add grievance folder URL column to Grievance Log sheet for tracking
6. Update `addGrievanceToLog()` to store folder URL in new column
7. Test complete workflow from member selection through folder sharing
8. Verify email delivery and folder permissions work correctly

### ✅ Implementation Status:
- **Committed**: Branch `claude/add-grievance-coordinator-fields-01KQXAdQS7vbxqQm6hD8RkMo`
- **Status**: Ready for pull request creation
- **Foundation**: Complete - folder creation, UI, and sharing infrastructure in place

## 🔮 Future Features

### Fillable PDF Grievance Form
**Goal:** Auto-populate a fillable PDF grievance form from Google Form submissions

**Description:**
- Create a template fillable PDF with form fields
- Map Google Form responses to PDF form fields
- Auto-fill PDF when grievance is submitted
- Save filled PDF to grievance folder
- Include in sharing options alongside the generated summary PDF

**Implementation Notes:**
- Could use PDF libraries like PDFLib or third-party services
- Needs PDF template designed with fillable fields
- Would complement existing PDF generation (not replace it)
- Both PDFs (summary and fillable form) would be available in folder

## 📄 License

Created for Local 509. Modify as needed for your union's requirements.
