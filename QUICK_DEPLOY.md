# 🚀 Quick Deploy - SEIU 509 Dashboard

## One-File Deployment (Easiest Method)

This guide shows you how to deploy the **entire 509 Dashboard** using a **single file**.

---

## 📦 What You Get

- ✅ **All 59 modules** in one auto-generated file
- ✅ **Complete functionality** - nothing missing
- ✅ **Copy/paste deployment** - no complex setup
- ✅ **20k members + 5k grievances** capacity
- ✅ **Terminal dashboard** with 26+ real-time metrics
- ✅ **ADHD-friendly** design and features
- ✅ **Audit logging and RBAC** (v2.4)

---

## 🔧 5-Minute Setup

### **Step 1: Get the File**

**Option A: Build it yourself (recommended)**
```bash
git clone https://github.com/Woop91/509-dashboard.git
cd 509-dashboard
node build.js --production
# ConsolidatedDashboard.gs is now ready
```

**Option B: Download directly**
Download `ConsolidatedDashboard.gs` from this repository's main branch.

### **Step 2: Create a New Google Sheet**

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **"+ Blank"** to create a new spreadsheet
3. Name it **"SEIU 509 Dashboard"**

### **Step 3: Open Apps Script Editor**

1. In your Google Sheet, click **Extensions → Apps Script**
2. You'll see a default `Code.gs` file with some starter code
3. **Delete all the default code** (select all and delete)

### **Step 4: Paste the Consolidated File**

1. Open `ConsolidatedDashboard.gs` in your text editor
2. **Select ALL** (Ctrl+A / Cmd+A)
3. **Copy** (Ctrl+C / Cmd+C)
4. **Paste** into the Apps Script editor (Ctrl+V / Cmd+V)
5. **Save** the project (Ctrl+S / Cmd+S or click 💾 icon)

### **Step 5: Authorize the Script**

1. In the Apps Script editor toolbar, find the function dropdown
2. Select **`CREATE_509_DASHBOARD`** from the dropdown
3. Click the **▶️ Run** button
4. A dialog will appear asking for permissions:
   - Click **"Review permissions"**
   - Choose your Google account
   - Click **"Advanced"**
   - Click **"Go to 509 Dashboard Scripts (unsafe)"**
   - Click **"Allow"**

5. The script will run and create all sheets (~10 seconds)

### **Step 6: Close Apps Script & Refresh**

1. Close the Apps Script editor tab
2. Go back to your Google Sheet
3. **Refresh the page** (F5 or Ctrl+R / Cmd+R)
4. You should see **6 menus**: **👤 Dashboard**, **📊 Sheet Manager**, **🔧 Setup**, **🎭 Demo**, **⚙️ Administrator**, and **🧪 Tests**

> ✅ **All set!** `CREATE_509_DASHBOARD` already configured all sheets, dropdowns, and validations.

### **Step 7: Seed Test Data**

1. Click **🎭 Demo → 🌱 Seed Demo Data → 👥 Seed Members**
2. Click **"Seed Members - Toggle 1 (5,000)"** (takes ~1 minute)
3. Repeat for Toggle 2, 3, 4 to generate up to 20k members total
4. Click **🎭 Demo → 🌱 Seed Demo Data → 📋 Seed Grievances**
5. Click **"Seed Grievances - Toggle 1 (2,500)"** (takes ~1 minute)
6. Repeat for Toggle 2 to generate up to 5k grievances total

**Note:** Toggle-based approach prevents timeout issues with large datasets

### **Step 8: Open the Terminal Dashboard**

1. Click **👤 Dashboard → Dashboards → 🎯 Unified Operations Monitor**
2. The terminal-themed dashboard opens in a new dialog
3. Explore the 7 sections:
   - Executive Status & Alerts
   - Process Efficiency
   - Network Health
   - Active Grievance Log
   - Follow-up Radar
   - Predictive Alerts
   - Systemic Risk Monitor

---

## ✅ You're Done!

Your dashboard is fully operational with:
- ✅ 20,000 test members
- ✅ 5,000 test grievances
- ✅ Real-time analytics
- ✅ Terminal operations monitor
- ✅ Interactive customizable views
- ✅ All ADHD-friendly features

---

## 📚 Next Steps

### **Explore the Features:**

| Menu | What It Does |
|------|-------------|
| **👤 Dashboard** | Daily operations, search, grievances, reports, accessibility |
| **📊 Sheet Manager** | Data management, backups, automations, analytics |
| **🔧 Setup** | Dropdown configuration, dashboard setup |
| **🎭 Demo** | Seed demo data, nuke/clear data management |
| **⚙️ Administrator** | System health, workflow, column toggles, RBAC |
| **🧪 Tests** | Unit, validation, integration, performance tests |

#### Quick Access:
- **Refresh All**: 👤 Dashboard → 🔄 Refresh All
- **Operations Monitor**: 👤 Dashboard → 📊 Dashboards → 🎯 Unified Operations Monitor
- **Main Dashboard**: 👤 Dashboard → 📊 Dashboards → 📊 Main Dashboard
- **Help**: 👤 Dashboard → ❓ Help & Support
- **Clear Data**: 🎭 Demo → 🗑️ Data Management → Nuke All Data

### **Customize Your Data:**

1. Edit **Config** tab to change dropdown options
2. Manually add/edit members in **Member Directory**
3. Manually add/edit grievances in **Grievance Log**
4. Use **Interactive Dashboard** for custom views

### **Read the Documentation:**

- `README.md` - Complete feature documentation
- `ADHD_FRIENDLY_GUIDE.md` - Accessibility features
- `STEWARD_GUIDE.md` - Guide for union stewards
- `INTERACTIVE_DASHBOARD_GUIDE.md` - Custom views
- `GRIEVANCE_WORKFLOW_GUIDE.md` - Workflow automation

---

## 🛠️ Troubleshooting

### **Menus don't appear?**
- Refresh the page (F5)
- Ensure you see **six menus**: 👤 Dashboard, 📊 Sheet Manager, 🔧 Setup, 🎭 Demo, ⚙️ Administrator, 🧪 Tests
- Or manually run `onOpen()` from Apps Script editor

### **Authorization error?**
- Make sure you completed Step 5 fully
- Close and reopen the Google Sheet
- Try running any function from Apps Script editor again

### **Seeding takes forever?**
- Normal for large datasets (2-3 minutes total)
- Don't close the sheet while seeding
- Check Apps Script logs if it fails: View → Execution log

### **Dashboard shows "CONNECTION ERROR"?**
- Make sure you opened it via menu, not directly
- Refresh the sheet and try again
- Verify `getUnifiedDashboardData()` function exists in your code

### **Need help?**
- Click **📊 509 Dashboard → ❓ Help** in your sheet
- Check the GitHub issues page
- Review documentation files

---

## 📁 What's Included in ConsolidatedDashboard.gs?

The auto-generated file contains **59 modules** organized by dependency:

**Core Infrastructure:**
- Constants.gs - Configuration (SHEETS, COLORS, MEMBER_COLS, GRIEVANCE_COLS)
- SecurityUtils.gs - Security roles, RBAC, audit logging
- Code.gs - Main setup, menu creation, sheet creation

**Feature Modules (50+):**
- Unified Operations Monitor - Terminal-themed dashboard
- Interactive Dashboard - Member-customizable views
- ADHD Enhancements - Accessibility features
- Grievance Workflow - Process automation
- Google Drive Integration - Auto-folder creation
- Gmail Integration - Email templates
- Calendar Integration - Deadline syncing
- Backup & Recovery - Automated backups
- Predictive Analytics - Trend forecasting
- Root Cause Analysis - Pattern identification
- And 40+ more...

**Testing (dev builds only):**
- TestFramework.gs - Test infrastructure
- Code.test.gs - Unit tests
- Integration.test.gs - Integration tests

**Generated by:** `node build.js --production`

---

## 🎉 Success!

You now have a fully functional union management system with:
- Real-time grievance tracking
- Comprehensive analytics dashboard
- Member engagement monitoring
- ADHD-friendly interface
- Deadline management
- And much more!

**Questions?** Open an issue on GitHub or check the documentation files.

---

**Version:** 3.28
**Last Updated:** 2025-12-09
**GitHub:** https://github.com/Woop91/509-dashboard

## 🆕 What's New in v3.27
- **100% Dynamic Columns** - All column references use MEMBER_COLS and GRIEVANCE_COLS constants
- **31-Column Member Directory** - Complete member tracking with engagement metrics
- **34-Column Grievance Log** - Full grievance lifecycle with deadline tracking
- **Row mapper functions** - mapMemberRow() and mapGrievanceRow() for cleaner code
- **MAP/LAMBDA formulas** - Fixed Member Directory formulas for proper calculations
- **6-Menu System** - Dashboard, Sheet Manager, Setup, Demo, Administrator, Tests
- **Audit logging system** - Full audit trail for all data modifications
- **Role-based access control (RBAC)** - Admin, Steward, Viewer roles
- **DIAGNOSE_SETUP()** - Comprehensive system health check
- Toggle-based data seeding to prevent timeouts
- Enhanced accessibility features (ADHD controls, dark mode, focus mode)
- Advanced analytics and predictive insights
