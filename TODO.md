# TODO / Feature Roadmap

Future feature ideas and enhancements for the 509 Dashboard.

**Status Summary:** 33 of 50 features have been implemented. 17 remain pending (including 2 new high-priority features).

**Last Updated:** 2025-12-07 (Version 3.3)

---

## Recently Implemented Features (Version 2.6)

### HIGH PRIORITY (6 items - All Completed!)

#### 1. Email Unsubscribe / Opt-Out System ✅
**Complexity:** Medium | **Status:** COMPLETED

Implemented in `EmailUnsubscribeSystem.gs`:
- Checkbox column in Member Directory for opt-out status
- Light red row highlighting when opted out (`#FFCDD2`)
- Export prefixes email with `(UNSUBSCRIBED)` to prevent accidental sends
- Filter opted-out members from bulk emails
- Bulk opt-out/opt-in operations
- Opt-out statistics and management panel

---

#### 4. Create Quick Actions Menu ✅
**Complexity:** Moderate | **Status:** COMPLETED

Implemented in `QuickActionsMenu.gs`:
- Right-click context menu for Member Directory and Grievance Log
- Start Grievance, View History, Email member
- Quick status updates for grievances
- Copy ID to clipboard functionality
- View Drive folder and sync to calendar

---

#### 7. PII Protection ✅
**Complexity:** Complex | **Status:** COMPLETED

Implemented in `PIIProtection.gs`:
- Field-level data masking (emails, phones, SSNs)
- GDPR/CCPA compliance helpers
- Data portability export (JSON format)
- Right to erasure request processing
- Anonymization for inactive members
- PII audit reports and data subject request form

---

#### 8. Interactive Tutorial ✅
**Complexity:** Moderate | **Status:** COMPLETED

Implemented in `InteractiveTutorial.gs`:
- Welcome wizard for first-time users
- 9-step guided tour with progress tracking
- Video tutorial library with 8 categorized videos
- Quick Start Guide for rapid onboarding
- Keyboard navigation support

---

#### 11. Context-Sensitive Help ✅
**Complexity:** Simple | **Status:** COMPLETED

Implemented in `ContextSensitiveHelp.gs`:
- Sheet-specific help with ? icons
- Purpose description and key tasks
- Column documentation
- Tips and best practices
- Searchable help index
- F1 shortcut for context help

---

#### Email & Phone Validation Enhancements ✅
**Complexity:** Simple | **Status:** COMPLETED

Implemented in `EnhancedValidation.gs`:
- Real-time email format validation with typo detection
- Phone number validation and auto-formatting
- Duplicate ID detection with warnings
- Bulk validation tool with detailed reports
- Visual indicators (backgrounds, notes)

---

### REMAINING PENDING FEATURES (17 items)

### HIGH PRIORITY (4 items)

#### Smart Member Import Feature
**Complexity:** Complex | **Status:** Planned

Create an import feature that smartly imports member log information from another uploaded document.
- Support CSV and Excel file formats
- Intelligent field mapping UI
- Duplicate detection during import
- Preview before final import
- Handle partial matches and data conflicts

---

#### Nuke Safety Mode - Data Protection
**Complexity:** Moderate | **Status:** Planned

When nuke is enabled and data cleaned: prevent bulk data deletion or alteration in Grievance Log and Member Directory.
- Add NUKE_SAFETY_MODE flag in Config
- Block batch delete/edit operations after nuke
- Allow single-row new data entry
- Protect production data from accidental mass changes
- Exclude new data entry from restrictions

---

#### 2. Extend Auto-Formula Coverage
**Complexity:** Simple | **Status:** Planned

Extend formulas from 100 rows to 1000+ using ARRAYFORMULA.
- Replace individual `setFormula` calls with ARRAYFORMULA implementations

---

#### 3. Optimize Seed Data Performance
**Complexity:** Moderate | **Status:** Planned

Improve batch processing for 20k member seeding (currently 2-3 minutes).
- Use `SpreadsheetApp.flush()` strategically
- Add progress toasts every 500 rows

---

### MEDIUM PRIORITY (3 items)

#### 9. Optimize QUERY Formulas
**Complexity:** Simple | **Status:** Planned

Consolidate multiple QUERY calls to reduce calculation time.
- Use virtual tables and GROUP BY instead of multiple COUNTIF calls

---

#### 10. Slack/Teams Integration
**Complexity:** Moderate | **Status:** Planned

Real-time notifications with bot commands:
- Post updates to channels
- Notify on deadlines
- Allow status updates from chat

---

### LOW PRIORITY (10 items)

#### 12. Template System
**Complexity:** Moderate | **Status:** Planned

Pre-built grievance templates for common issue types with auto-fill.

---

#### 13. Benchmark Comparisons
**Complexity:** Moderate | **Status:** Planned

Compare performance against industry standards with percentile rankings.

---

#### 14. Real-Time Dashboard Updates
**Complexity:** Moderate | **Status:** Planned

Live data refresh with auto-update every 5 minutes via triggers.

---

#### 15. API Layer
**Complexity:** Complex | **Status:** Planned

RESTful API for external access:
- Google Apps Script Web App
- GET/POST/PUT endpoints
- API key authentication

---

#### 16. Zapier/Make.com Integration
**Complexity:** Moderate | **Status:** Planned

Connect to 1000+ apps via webhooks.

---

#### 17. Progressive Web App (PWA)
**Complexity:** Complex | **Status:** Planned

Install as app on mobile devices for native experience.

---

#### 18. Offline Mode
**Complexity:** Very Complex | **Status:** Planned

Work without internet:
- Local storage cache
- Sync when online
- Conflict resolution

---

#### 19. SMS Notifications
**Complexity:** Moderate | **Status:** Planned

Text alerts for critical items via Twilio integration.

---

#### 20. Session Management
**Complexity:** Moderate | **Status:** Planned

Track active users:
- Show current viewers
- Lock rows being edited
- Session timeout

---

## Implemented Features (33 items)

The following features have been completed:

| Category | Feature | Implementation |
|----------|---------|----------------|
| **Performance** | Data Pagination | DataPagination.gs |
| | Caching Layer | DataCachingLayer.gs |
| **UX** | Member Search | MemberSearch.gs |
| | Keyboard Shortcuts | KeyboardShortcuts.gs |
| | Undo/Redo | UndoRedoSystem.gs |
| | ADHD Features | EnhancedADHDFeatures.gs |
| | Mobile Views | MobileOptimization.gs |
| | Dark Mode | DarkModeThemes.gs |
| | **Quick Actions Menu** | QuickActionsMenu.gs |
| | **Interactive Tutorial** | InteractiveTutorial.gs |
| | **Video Tutorials** | InteractiveTutorial.gs |
| **Data Integrity** | Email/Phone Validation | EnhancedValidation.gs |
| | Duplicate Detection | DataIntegrityEnhancements.gs |
| | Data Quality Dashboard | DataIntegrityEnhancements.gs |
| | Referential Integrity | DataIntegrityEnhancements.gs |
| | **Bulk Validation** | EnhancedValidation.gs |
| **Automation** | Deadline Notifications | AutomatedNotifications.gs |
| | Batch Operations | BatchOperations.gs |
| | Automated Reports | AutomatedReports.gs |
| | Workflow State Machine | WorkflowStateMachine.gs |
| | Smart Auto-Assignment | SmartAutoAssignment.gs |
| **Analytics** | Predictive Analytics | PredictiveAnalytics.gs |
| | Custom Report Builder | CustomReportBuilder.gs |
| | Root Cause Analysis | RootCauseAnalysis.gs |
| **Integration** | Google Calendar | CalendarIntegration.gs |
| | Gmail | GmailIntegration.gs |
| | Google Drive | GoogleDriveIntegration.gs |
| **Security** | RBAC | SecurityService.gs |
| | Audit Logging | AuditLoggingRBAC.gs |
| | Data Backup | DataBackupRecovery.gs |
| | **PII Protection** | PIIProtection.gs |
| | **Email Opt-Out** | EmailUnsubscribeSystem.gs |
| **Docs** | FAQ Database | FAQKnowledgeBase.gs |
| | **Context-Sensitive Help** | ContextSensitiveHelp.gs |
| | **Release Notes** | ReleaseNotes.gs |

---

## Notes

- Feature requests can be added to this file
- Prioritize based on user impact and implementation complexity
- Update status as work progresses: Planned -> In Progress -> Completed
- Video Tutorials are now integrated into InteractiveTutorial.gs
