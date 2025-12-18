# New Features Summary

This document summarizes the new features added to the 509 Dashboard.

## 1. Google Drive Folder Auto-Creation

**Files Modified:**
- `GoogleDriveIntegration.gs` - Updated `createGrievanceFolder()` to accept grievant name
- `GrievanceWorkflow.gs` - Updated `addGrievanceToLog()` to auto-create folders

**Description:**
Automatically creates a Google Drive folder with subfolders when a new grievance is created.
Folder is named with format: `Grievance_{ID}_{FirstName_LastName}`

**Subfolders Created:**
- Evidence
- Correspondence
- Forms
- Other

**Menu Location:**
- Existing: Sheet Manager > Google Drive Integration > Batch Create All Folders

## 3. Member Directory Dropdowns

**File:** `MemberDirectoryDropdowns.gs`

**Description:**
Adds data validation dropdowns to Member Directory for consistent data entry across all specified fields.

**Dropdowns Added:**
- Job Title / Position (Column D)
- Department / Unit
- Worksite / Office Location (Column E)
- Work Schedule / Office Days (Column G) - Multiple selections
- Unit (8 or 10) (Column F)
- Is Steward (Y/N) (Column J)
- Assigned Steward (Column M) - Populated from stewards list
- Immediate Supervisor (Column K)
- Manager / Program Director (Column L)
- Engagement Level
- Committee Member - Multiple selections
- Interest: Local Actions (Column T/20) - Y/N
- Interest: Chapter Actions (Column U/21) - Y/N
- Interest: Allied Chapter Actions (Column V/22) - Y/N
- Preferred Communication Methods (Column X/24) - Multiple selections
- Best Time(s) to Reach Member (Column Y/25) - Multiple selections
- Steward Who Contacted Member (Column AD/30) - Populated from stewards list

**Functions:**
- `setupMemberDirectoryDropdowns()` - Sets up all dropdowns
- `refreshStewardDropdowns()` - Refreshes steward lists
- `removeEmergencyContactColumns()` - Removes emergency contact columns

**Menu Location:**
- Administrator > Setup & Configuration > Setup Member Directory Dropdowns
- Administrator > Setup & Configuration > Refresh Steward Dropdowns
- Administrator > Setup & Configuration > Remove Emergency Contact Columns

## 4. Member Directory Google Form Link

**File:** `MemberDirectoryGoogleFormLink.gs`

**Description:**
Adds a feature to open a Google Form with auto-populated member information. This feature is configurable and can be wired to various use cases.

**Functions:**
- `openMemberGoogleForm()` - Opens the form for selected member
- `generatePreFilledMemberForm()` - Generates pre-filled form URL
- `addMemberFormLinkToPendingFeatures()` - Adds to pending features list

**Configuration Required:**
Update `MEMBER_FORM_CONFIG` object with your Google Form URL and field IDs.

**Menu Location:**
- Administrator > Setup & Configuration > Open Member Google Form

## 5. Reorganized Menu System

**File:** `ReorganizedMenu.gs`

**Description:**
Reorganizes the dashboard menus into three categories for better organization and user experience.

**Three Menu Categories:**

### Average User Menu ("👤 Dashboard")
- Dashboards
- Search & Lookup
- Grievance Tools (includes new Float Toggle)
- Google Drive
- Communications
- Reports
- Accessibility
- Help & Support

### Sheet Manager Menu ("📊 Sheet Manager")
- Data Management
- Performance
- Data Integrity
- Automations
- Google Drive Integration
- Calendar Integration
- Analysis & Insights
- Batch Operations
- Smart Assignment
- Knowledge Base

### Administrator Menu ("⚙️ Administrator")
- Seed Functions
- System Health
- Root Cause Analysis
- Workflow Management
- Setup & Configuration
- Column Toggles & View
- History & Undo
- Mobile & Viewing
- Testing

**To Activate:**
Rename `onOpen_Reorganized()` to `onOpen()` in ReorganizedMenu.gs, and rename the existing `onOpen()` to `onOpen_OLD()`.

## 6. Interest Columns

**Note:** The following columns already exist in the Member Directory:
- Interest: Local Actions (Column T/20)
- Interest: Chapter Actions (Column U/21)
- Interest: Allied Chapter Actions (Column V/22)

Dropdowns have been added for these columns via `setupMemberDirectoryDropdowns()`.

---

## Version 2.6 Features (December 2025)

### 7. Email Unsubscribe / Opt-Out System

**File:** `EmailUnsubscribeSystem.gs`

**Description:**
Complete email opt-out management system for GDPR/CAN-SPAM compliance.

**Features:**
- Checkbox column for opt-out status in Member Directory
- Automatic light red row highlighting (#FFCDD2) for opted-out members
- Export prefix "(UNSUBSCRIBED)" to prevent accidental sends
- Filter opted-out members from bulk emails
- Bulk opt-out/opt-in operations
- Opt-out statistics and management panel

**Functions:**
- `setupEmailOptOutColumn()` - Add opt-out column to Member Directory
- `applyOptOutHighlighting()` - Apply red highlighting to opted-out rows
- `isMemberOptedOut()` - Check if specific member is opted out
- `showOptOutManagementPanel()` - Management interface
- `showOptOutStatistics()` - View opt-out metrics
- `exportMembersWithOptOutHandling()` - Safe export with warnings

**Menu Location:**
- Dashboard > Communications > Email Opt-Out Management
- Dashboard > Communications > Opt-Out Statistics

### 8. Interactive Tutorial System

**File:** `InteractiveTutorial.gs`

**Description:**
Comprehensive onboarding system for new users with guided tours and video tutorials.

**Features:**
- Welcome wizard for first-time users
- 9-step guided tour with progress tracking
- Video tutorial library with 8 categorized videos
- Quick Start Guide for rapid onboarding
- Keyboard navigation support (arrow keys, Enter, Escape)
- Progress persistence using PropertiesService

**Functions:**
- `showInteractiveTutorial()` - Launch guided tour
- `showTutorialStep()` - Show specific tutorial step
- `showVideoTutorials()` - Open video library
- `showQuickStartGuide()` - Quick reference guide
- `showWelcomeWizard()` - First-time user welcome

**Menu Location:**
- Dashboard > Help & Support > Interactive Tutorial
- Dashboard > Help & Support > Video Tutorials
- Dashboard > Help & Support > Quick Start Guide

### 9. Quick Actions Menu

**File:** `QuickActionsMenu.gs`

**Description:**
Right-click context menu for quick access to common operations.

**Features:**
- Context-sensitive actions for Member Directory and Grievance Log
- Start Grievance from member row
- Send Email directly to member
- View grievance history
- Quick status updates for grievances
- Copy member/grievance ID to clipboard
- View Drive folder and sync to calendar

**Functions:**
- `showQuickActionsMenu()` - Main quick actions launcher
- `showMemberQuickActions()` - Member-specific actions
- `showGrievanceQuickActions()` - Grievance-specific actions
- `quickUpdateGrievanceStatus()` - Fast status change
- `showMemberGrievanceHistory()` - View member's grievance history

**Menu Location:**
- Dashboard > Quick Actions

### 10. PII Protection System

**File:** `PIIProtection.gs`

**Description:**
Comprehensive PII protection for GDPR/CCPA compliance.

**Features:**
- Field-level data masking for emails, phones, SSNs, addresses
- Data portability export (JSON format)
- Right to erasure request processing
- Anonymization for inactive members
- PII audit reports
- Data subject request form

**Functions:**
- `maskEmail()` - Mask email addresses (j***@example.com)
- `maskPhone()` - Mask phone numbers (***-***-1234)
- `showPIIProtectionDashboard()` - Main PII management interface
- `exportMembersWithMaskedPII()` - Export with masked data
- `processMemberErasure()` - Handle deletion requests
- `generateMemberDataExport()` - GDPR data portability export
- `anonymizeInactiveMembers()` - Anonymize old records
- `showPIIAuditReport()` - View PII usage report
- `showDataSubjectRequestForm()` - Handle GDPR requests

**Menu Location:**
- Sheet Manager > PII Protection > PII Protection Dashboard
- Sheet Manager > PII Protection > Export with Masked PII
- Sheet Manager > PII Protection > PII Audit Report
- Sheet Manager > PII Protection > Data Subject Request
- Sheet Manager > PII Protection > Anonymize Inactive Members

### 11. Enhanced Validation System

**File:** `EnhancedValidation.gs`

**Description:**
Real-time validation for email and phone fields with auto-formatting.

**Features:**
- Real-time email format validation with typo detection
- Phone number validation and auto-formatting to (XXX) XXX-XXXX
- Duplicate Member/Grievance ID detection with warnings
- Bulk validation tool with detailed reports
- Visual indicators (yellow/red backgrounds, cell notes)
- Validation settings configuration

**Functions:**
- `validateEmailAddress()` - Validate and check for typos
- `validatePhoneNumber()` - Validate phone format
- `formatUSPhone()` - Auto-format to US phone standard
- `runBulkValidation()` - Validate entire dataset
- `showValidationReport()` - Display validation results
- `showValidationSettings()` - Configure validation rules

**Menu Location:**
- Sheet Manager > Data Integrity > Run Bulk Validation
- Sheet Manager > Data Integrity > Validation Settings

### 12. Context-Sensitive Help

**File:** `ContextSensitiveHelp.gs`

**Description:**
Sheet-specific help system with searchable content.

**Features:**
- Sheet-specific help content for all major sheets
- Column documentation for major columns
- Purpose descriptions and key tasks
- Tips and best practices
- Searchable help index
- F1 keyboard shortcut support

**Functions:**
- `showContextHelp()` - Show help for current sheet (F1)
- `showGeneralHelp()` - General dashboard help
- `showColumnHelp()` - Help for specific column
- `showTaskHelp()` - Task-specific guidance
- `searchHelp()` - Search help content
- `showHelpSearch()` - Help search interface

**Menu Location:**
- Dashboard > Help & Support > Context Help (F1)
- Dashboard > Help & Support > Search Help

---

## Building & Deploying

ConsolidatedDashboard.gs is **auto-generated** by the build system. No manual sync required!

### To Rebuild ConsolidatedDashboard.gs:

```bash
# Production build (excludes tests)
node build.js --production

# Development build (includes tests)
node build.js

# Check for duplicate declarations
node build.js --check-duplicates
```

### Build Process Includes:
- All 78 modules concatenated in dependency order
- Duplicate declaration detection
- All feature files automatically included:
  - MemberDirectoryDropdowns.gs
  - MemberDirectoryGoogleFormLink.gs
  - ReorganizedMenu.gs
  - EmailUnsubscribeSystem.gs
  - InteractiveTutorial.gs
  - QuickActionsMenu.gs
  - PIIProtection.gs
  - EnhancedValidation.gs
  - ContextSensitiveHelp.gs
  - And 68 other modules

### Important Notes:
- **Never edit ConsolidatedDashboard.gs directly** - it will be overwritten on rebuild
- Make changes to individual module files (e.g., Code.gs, Constants.gs)
- Complete509Dashboard.gs has been **removed** (was deprecated legacy version)

## Testing Checklist

- [ ] Run `node build.js --production` to generate fresh ConsolidatedDashboard.gs
- [ ] Deploy to Google Apps Script
- [ ] Test Grievance Float Toggle (enable/disable/sort)
- [ ] Test Google Drive folder auto-creation on new grievance
- [ ] Test Member Directory dropdowns (all fields)
- [ ] Test steward dropdown auto-population
- [ ] Test emergency contact column removal
- [ ] Test Member Google Form link (requires form configuration)
- [ ] Test reorganized menu navigation
- [ ] Run DIAGNOSE_SETUP() to verify system health

## Pending Features Added

The following features have been added to the Feedback & Development sheet:

1. **Grievance Float/Sort Toggle** - Status: Completed
2. **Member Directory Google Form Link** - Status: Planned

Use the following functions to add these to your Feedback sheet:
- `addGrievanceFloatToPendingFeatures()`
- `addMemberFormLinkToPendingFeatures()`
