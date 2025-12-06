/**
 * ------------------------------------------------------------------------====
 * CUSTOM REPORT BUILDER
 * ------------------------------------------------------------------------====
 *
 * Build custom reports with filters, grouping, and export
 * Features:
 * - Interactive report builder UI
 * - Custom field selection
 * - Advanced filtering (AND/OR conditions)
 * - Grouping and aggregation
 * - Sorting options
 * - Export to PDF, CSV, Excel
 * - Save and load report templates
 * - Schedule automated reports
 */

/**
 * Shows custom report builder dialog
 */
function showCustomReportBuilder() {
  const html = createReportBuilderHTML();
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(1000)
    .setHeight(750);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📊 Custom Report Builder');
}

/**
 * Creates HTML for report builder
 * Refactored to use helper functions for maintainability
 */
function createReportBuilderHTML() {
  const grievanceFields = getGrievanceFields();
  const memberFields = getMemberFields();

  return `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>${getReportBuilderStyles()}</style>
</head>
<body>
  <div class="container">
    <h2>📊 Custom Report Builder</h2>
    <div class="info-box">
      <strong>💡 Quick Start:</strong> Select data source, choose fields, add filters, then generate your report.
      You can export to PDF, CSV, or Excel.
    </div>
${getReportBuilderDataSourceSection()}
${getReportBuilderFieldsSection(grievanceFields)}
${getReportBuilderFiltersSection(grievanceFields)}
${getReportBuilderSortingSection(grievanceFields)}
${getReportBuilderDateRangeSection()}
${getReportBuilderPreviewSection()}
${getReportBuilderActionsSection()}
  </div>
  <script>${getReportBuilderScripts(grievanceFields, memberFields)}</script>
</body>
</html>
  `;
}

/**
 * Returns CSS styles for report builder
 */
function getReportBuilderStyles() {
  return `
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #1a73e8; margin-top: 0; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    .builder-section { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #1a73e8; }
    .section-title { font-weight: bold; font-size: 16px; color: #333; margin-bottom: 15px; }
    .form-group { margin: 15px 0; }
    label { display: block; font-weight: 500; margin-bottom: 5px; color: #555; }
    select, input[type="text"], input[type="date"] { width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
    select:focus, input:focus { outline: none; border-color: #1a73e8; }
    .multi-select { height: 150px; }
    .filter-row { display: grid; grid-template-columns: 2fr 1fr 2fr auto; gap: 10px; margin: 10px 0; align-items: end; }
    button { background: #1a73e8; color: white; border: none; padding: 12px 24px; font-size: 14px; border-radius: 4px; cursor: pointer; margin: 5px 5px 5px 0; }
    button:hover { background: #1557b0; }
    button.secondary { background: #6c757d; }
    button.secondary:hover { background: #5a6268; }
    button.small { padding: 8px 16px; font-size: 13px; }
    button.danger { background: #dc3545; }
    button.danger:hover { background: #c82333; }
    .button-group { margin-top: 25px; padding-top: 20px; border-top: 2px solid #e0e0e0; }
    .info-box { background: #e8f0fe; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #1a73e8; }
    #preview { max-height: 300px; overflow-y: auto; background: white; padding: 15px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a73e8; color: white; padding: 8px; text-align: left; font-size: 11px; }
    td { padding: 6px 8px; border-bottom: 1px solid #e0e0e0; font-size: 11px; }
    .loading { text-align: center; padding: 40px; color: #666; }
  `;
}

/**
 * Returns data source section HTML
 */
function getReportBuilderDataSourceSection() {
  return `
    <div class="builder-section">
      <div class="section-title">1. Select Data Source</div>
      <div class="form-group">
        <label>Data Source:</label>
        <select id="dataSource" onchange="updateFieldOptions()">
          <option value="grievances">Grievance Log</option>
          <option value="members">Member Directory</option>
          <option value="combined">Combined (Grievances + Members)</option>
        </select>
      </div>
    </div>`;
}

/**
 * Returns field selection section HTML
 */
function getReportBuilderFieldsSection(fields) {
  const options = fields.map(function(f) { return '<option value="' + f.key + '">' + f.name + '</option>'; }).join('');
  return `
    <div class="builder-section">
      <div class="section-title">2. Select Fields to Include</div>
      <div class="form-group">
        <label>Fields (hold Ctrl/Cmd to select multiple):</label>
        <select id="fields" multiple class="multi-select">${options}</select>
      </div>
      <button class="small secondary" onclick="selectAllFields()">Select All</button>
      <button class="small secondary" onclick="clearFields()">Clear All</button>
    </div>`;
}

/**
 * Returns filters section HTML
 */
function getReportBuilderFiltersSection(fields) {
  const options = fields.map(function(f) { return '<option value="' + f.key + '">' + f.name + '</option>'; }).join('');
  return `
    <div class="builder-section">
      <div class="section-title">3. Add Filters (Optional)</div>
      <div id="filters">
        <div class="filter-row">
          <div><label>Field:</label><select id="filter0_field">${options}</select></div>
          <div><label>Operator:</label><select id="filter0_operator">
            <option value="equals">Equals</option><option value="not_equals">Not Equals</option>
            <option value="contains">Contains</option><option value="starts_with">Starts With</option>
            <option value="greater_than">Greater Than</option><option value="less_than">Less Than</option>
          </select></div>
          <div><label>Value:</label><input type="text" id="filter0_value" placeholder="Filter value"></div>
          <div><button class="small danger" onclick="removeFilter(0)" style="margin-top: 22px;">Remove</button></div>
        </div>
      </div>
      <button class="small" onclick="addFilter()">+ Add Filter</button>
    </div>`;
}

/**
 * Returns sorting section HTML
 */
function getReportBuilderSortingSection(fields) {
  const options = fields.map(function(f) { return '<option value="' + f.key + '">' + f.name + '</option>'; }).join('');
  return `
    <div class="builder-section">
      <div class="section-title">4. Grouping & Sorting</div>
      <div class="form-group"><label>Group By (optional):</label><select id="groupBy"><option value="">No Grouping</option>${options}</select></div>
      <div class="form-group"><label>Sort By:</label><select id="sortBy">${options}</select></div>
      <div class="form-group"><label>Sort Order:</label><select id="sortOrder"><option value="asc">Ascending</option><option value="desc">Descending</option></select></div>
    </div>`;
}

/**
 * Returns date range section HTML
 */
function getReportBuilderDateRangeSection() {
  return `
    <div class="builder-section">
      <div class="section-title">5. Date Range (Optional)</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div class="form-group"><label>From Date:</label><input type="date" id="dateFrom"></div>
        <div class="form-group"><label>To Date:</label><input type="date" id="dateTo"></div>
      </div>
    </div>`;
}

/**
 * Returns preview section HTML
 */
function getReportBuilderPreviewSection() {
  return `
    <div class="builder-section">
      <div class="section-title">6. Preview</div>
      <div id="preview" class="loading">Click "Generate Preview" to see your report</div>
      <button class="secondary" onclick="generatePreview()">🔍 Generate Preview</button>
    </div>`;
}

/**
 * Returns actions section HTML
 */
function getReportBuilderActionsSection() {
  return `
    <div class="button-group">
      <button onclick="exportToPDF()">📄 Export to PDF</button>
      <button onclick="exportToCSV()">📑 Export to CSV</button>
      <button onclick="exportToExcel()">📊 Export to Excel</button>
      <button class="secondary" onclick="saveTemplate()">💾 Save Template</button>
      <button class="secondary" onclick="loadTemplate()">📂 Load Template</button>
    </div>`;
}

/**
 * Returns JavaScript for report builder
 */
function getReportBuilderScripts(grievanceFields, memberFields) {
  return `
    let filterCount = 1;
    const grievanceFields = ${JSON.stringify(grievanceFields)};
    const memberFields = ${JSON.stringify(memberFields)};

    function updateFieldOptions() {
      const dataSource = document.getElementById('dataSource').value;
      const fieldsSelect = document.getElementById('fields');
      fieldsSelect.innerHTML = '';
      const fields = dataSource === 'members' ? memberFields : grievanceFields;
      fields.forEach(function(f) {
        const option = document.createElement('option');
        option.value = f.key;
        option.textContent = f.name;
        fieldsSelect.appendChild(option);
      });
    }

    function selectAllFields() {
      const fieldsSelect = document.getElementById('fields');
      for (let i = 0; i < fieldsSelect.options.length; i++) fieldsSelect.options[i].selected = true;
    }

    function clearFields() {
      const fieldsSelect = document.getElementById('fields');
      for (let i = 0; i < fieldsSelect.options.length; i++) fieldsSelect.options[i].selected = false;
    }

    function addFilter() {
      const filtersDiv = document.getElementById('filters');
      const newFilter = document.createElement('div');
      newFilter.className = 'filter-row';
      newFilter.id = 'filter' + filterCount;
      newFilter.innerHTML = '<div><label>Field:</label><select id="filter' + filterCount + '_field">' +
        grievanceFields.map(function(f) { return '<option value="' + f.key + '">' + f.name + '</option>'; }).join('') +
        '</select></div><div><label>Operator:</label><select id="filter' + filterCount + '_operator">' +
        '<option value="equals">Equals</option><option value="not_equals">Not Equals</option>' +
        '<option value="contains">Contains</option><option value="starts_with">Starts With</option>' +
        '<option value="greater_than">Greater Than</option><option value="less_than">Less Than</option>' +
        '</select></div><div><label>Value:</label><input type="text" id="filter' + filterCount + '_value" placeholder="Filter value"></div>' +
        '<div><button class="small danger" onclick="removeFilter(' + filterCount + ')" style="margin-top: 22px;">Remove</button></div>';
      filtersDiv.appendChild(newFilter);
      filterCount++;
    }

    function removeFilter(id) {
      const filter = document.getElementById('filter' + id);
      if (filter) filter.remove();
    }

    function getReportConfig() {
      const fieldsSelect = document.getElementById('fields');
      const selectedFields = Array.from(fieldsSelect.selectedOptions).map(function(opt) { return opt.value; });
      const filters = [];
      for (let i = 0; i < filterCount; i++) {
        const fieldElem = document.getElementById('filter' + i + '_field');
        if (fieldElem) {
          filters.push({
            field: fieldElem.value,
            operator: document.getElementById('filter' + i + '_operator').value,
            value: document.getElementById('filter' + i + '_value').value
          });
        }
      }
      return {
        dataSource: document.getElementById('dataSource').value,
        fields: selectedFields,
        filters: filters,
        groupBy: document.getElementById('groupBy').value,
        sortBy: document.getElementById('sortBy').value,
        sortOrder: document.getElementById('sortOrder').value,
        dateFrom: document.getElementById('dateFrom').value,
        dateTo: document.getElementById('dateTo').value
      };
    }

    function generatePreview() {
      const config = getReportConfig();
      if (config.fields.length === 0) { alert('Please select at least one field'); return; }
      document.getElementById('preview').innerHTML = '<div class="loading">Generating preview...</div>';
      google.script.run.withSuccessHandler(displayPreview).withFailureHandler(onError).generateReportData(config, 10);
    }

    function displayPreview(data) {
      const preview = document.getElementById('preview');
      if (!data || data.length === 0) { preview.innerHTML = '<div class="loading">No data matches your filters</div>'; return; }
      let html = '<table><thead><tr>';
      Object.keys(data[0]).forEach(function(key) { html += '<th>' + key + '</th>'; });
      html += '</tr></thead><tbody>';
      data.forEach(function(row) {
        html += '<tr>';
        Object.values(row).forEach(function(value) { html += '<td>' + (value || '') + '</td>'; });
        html += '</tr>';
      });
      html += '</tbody></table><div style="margin-top: 10px; color: #666; font-size: 12px;">Showing first ' + data.length + ' rows</div>';
      preview.innerHTML = html;
    }

    function onError(error) {
      alert('Error: ' + error.message);
      document.getElementById('preview').innerHTML = '<div class="loading">Error generating preview</div>';
    }

    function exportToPDF() {
      const config = getReportConfig();
      if (config.fields.length === 0) { alert('Please select at least one field'); return; }
      alert('Generating PDF report... This may take a moment.');
      google.script.run.withSuccessHandler(function() { alert('✅ PDF report generated and saved to Google Drive!'); }).withFailureHandler(onError).exportReportToPDF(config);
    }

    function exportToCSV() {
      const config = getReportConfig();
      if (config.fields.length === 0) { alert('Please select at least one field'); return; }
      google.script.run.withSuccessHandler(function(csvData) { downloadCSV(csvData); }).withFailureHandler(onError).exportReportToCSV(config);
    }

    function exportToExcel() {
      const config = getReportConfig();
      if (config.fields.length === 0) { alert('Please select at least one field'); return; }
      alert('Generating Excel report... This may take a moment.');
      google.script.run.withSuccessHandler(function() { alert('✅ Excel report generated and saved to Google Drive!'); }).withFailureHandler(onError).exportReportToExcel(config);
    }

    function downloadCSV(csvData) {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report_' + new Date().toISOString().slice(0, 10) + '.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }

    function saveTemplate() {
      const config = getReportConfig();
      const name = prompt('Enter template name:');
      if (!name) return;
      google.script.run.withSuccessHandler(function() { alert('✅ Template saved: ' + name); }).withFailureHandler(onError).saveReportTemplate(name, config);
    }

    function loadTemplate() {
      google.script.run.withSuccessHandler(showTemplateList).withFailureHandler(onError).getReportTemplates();
    }

    function showTemplateList(templates) {
      if (!templates || templates.length === 0) { alert('No saved templates found'); return; }
      const templateNames = templates.map(function(t) { return t.name; }).join('\\n');
      const selected = prompt('Available templates:\\n' + templateNames + '\\n\\nEnter template name to load:');
      if (!selected) return;
      const template = templates.find(function(t) { return t.name === selected; });
      if (template) applyTemplate(template.config);
      else alert('Template not found');
    }

    function applyTemplate(config) {
      document.getElementById('dataSource').value = config.dataSource;
      updateFieldOptions();
      const fieldsSelect = document.getElementById('fields');
      for (let i = 0; i < fieldsSelect.options.length; i++) {
        fieldsSelect.options[i].selected = config.fields.includes(fieldsSelect.options[i].value);
      }
      document.getElementById('groupBy').value = config.groupBy || '';
      document.getElementById('sortBy').value = config.sortBy || '';
      document.getElementById('sortOrder').value = config.sortOrder || 'asc';
      document.getElementById('dateFrom').value = config.dateFrom || '';
      document.getElementById('dateTo').value = config.dateTo || '';
      alert('✅ Template loaded');
    }
  `;
}

/**
 * Gets available grievance fields
 * @returns {Array} Field definitions
 */
function getGrievanceFields() {
  return [
    { key: 'grievanceId', name: 'Grievance ID' },
    { key: 'memberId', name: 'Member ID' },
    { key: 'firstName', name: 'First Name' },
    { key: 'lastName', name: 'Last Name' },
    { key: 'status', name: 'Status' },
    { key: 'issueType', name: 'Issue Type' },
    { key: 'filedDate', name: 'Filed Date' },
    { key: 'description', name: 'Description' },
    { key: 'outcome', name: 'Outcome Sought' },
    { key: 'location', name: 'Work Location' },
    { key: 'unit', name: 'Unit' },
    { key: 'manager', name: 'Manager' },
    { key: 'supervisor', name: 'Supervisor' },
    { key: 'assignedSteward', name: 'Assigned Steward' },
    { key: 'meetingDate', name: 'Meeting Date' },
    { key: 'step1Response', name: 'Step 1 Response' },
    { key: 'step1ResponseDate', name: 'Step 1 Response Date' },
    { key: 'step2EscalationDate', name: 'Step 2 Escalation Date' },
    { key: 'dateClosed', name: 'Date Closed' },
    { key: 'nextActionDue', name: 'Next Action Due' },
    { key: 'daysToDeadline', name: 'Days to Deadline' },
    { key: 'deadlineStatus', name: 'Deadline Status' },
    { key: 'notes', name: 'Notes' }
  ];
}

/**
 * Gets available member fields
 * @returns {Array} Field definitions
 */
function getMemberFields() {
  return [
    { key: 'memberId', name: 'Member ID' },
    { key: 'firstName', name: 'First Name' },
    { key: 'lastName', name: 'Last Name' },
    { key: 'title', name: 'Job Title' },
    { key: 'workLocation', name: 'Work Location' },
    { key: 'unit', name: 'Unit' },
    { key: 'hireDate', name: 'Hire Date' },
    { key: 'email', name: 'Email' },
    { key: 'phone', name: 'Phone' },
    { key: 'isSteward', name: 'Is Steward?' }
  ];
}

/**
 * Generates report data based on configuration with permission-based filtering
 * @param {Object} config - Report configuration
 * @param {number} limit - Row limit for preview
 * @returns {Array} Report data filtered by user permissions
 */
function generateReportData(config, limit = null) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sourceData;
  let fieldMapping;

  if (config.dataSource === 'grievances') {
    const sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
    // Get all data with header for permission filtering
    const rawData = sheet.getDataRange().getValues();
    // Apply permission filtering (returns data with header)
    const filteredByPermission = filterGrievanceDataByPermission(rawData);
    // Remove header for report processing
    sourceData = filteredByPermission.slice(1);
    fieldMapping = getGrievanceFieldMapping();
  } else {
    const sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
    // Get all data with header for permission filtering
    const rawData = sheet.getDataRange().getValues();
    // Apply permission filtering (returns data with header)
    const filteredByPermission = filterMemberDataByPermission(rawData);
    // Remove header for report processing
    sourceData = filteredByPermission.slice(1);
    fieldMapping = getMemberFieldMapping();
  }

  // Apply content filters
  let filteredData = sourceData.filter(function(row) {
    return applyFilters(row, config.filters, fieldMapping);
  });

  // Apply date range
  if (config.dateFrom || config.dateTo) {
    filteredData = applyDateRange(filteredData, config.dateFrom, config.dateTo, fieldMapping);
  }

  // Sort data
  if (config.sortBy) {
    filteredData = sortData(filteredData, config.sortBy, config.sortOrder, fieldMapping);
  }

  // Limit for preview
  if (limit) {
    filteredData = filteredData.slice(0, limit);
  }

  // Select fields and format
  const reportData = filteredData.map(function(row) {
    const reportRow = {};
    config.fields.forEach(function(fieldKey) {
      const field = fieldMapping[fieldKey];
      if (field) {
        reportRow[field.name] = formatValue(row[field.index], field.type);
      }
    });
    return reportRow;
  });

  return reportData;
}

/**
 * Gets field mapping for grievances
 * @returns {Object} Field mapping
 */
function getGrievanceFieldMapping() {
  return {
    grievanceId: { index: 0, name: 'Grievance ID', type: 'string' },
    memberId: { index: 1, name: 'Member ID', type: 'string' },
    firstName: { index: 2, name: 'First Name', type: 'string' },
    lastName: { index: 3, name: 'Last Name', type: 'string' },
    status: { index: 4, name: 'Status', type: 'string' },
    issueType: { index: 5, name: 'Issue Type', type: 'string' },
    filedDate: { index: 6, name: 'Filed Date', type: 'date' },
    description: { index: 7, name: 'Description', type: 'string' },
    location: { index: 9, name: 'Work Location', type: 'string' },
    assignedSteward: { index: 13, name: 'Assigned Steward', type: 'string' },
    nextActionDue: { index: 19, name: 'Next Action Due', type: 'date' },
    daysToDeadline: { index: 20, name: 'Days to Deadline', type: 'number' }
  };
}

/**
 * Gets field mapping for members
 * @returns {Object} Field mapping
 */
function getMemberFieldMapping() {
  return {
    memberId: { index: 0, name: 'Member ID', type: 'string' },
    firstName: { index: 1, name: 'First Name', type: 'string' },
    lastName: { index: 2, name: 'Last Name', type: 'string' },
    title: { index: 3, name: 'Job Title', type: 'string' },
    workLocation: { index: 4, name: 'Work Location', type: 'string' },
    email: { index: 7, name: 'Email', type: 'string' },
    phone: { index: 8, name: 'Phone', type: 'string' },
    isSteward: { index: 9, name: 'Is Steward?', type: 'string' }
  };
}

/**
 * Applies filters to data
 * @param {Array} row - Data row
 * @param {Array} filters - Filter configuration
 * @param {Object} fieldMapping - Field mapping
 * @returns {boolean} Whether row passes filters
 */
function applyFilters(row, filters, fieldMapping) {
  if (!filters || filters.length === 0) return true;

  return filters.every(function(filter) {
    if (!filter.value) return true;

    const field = fieldMapping[filter.field];
    if (!field) return true;

    const cellValue = String(row[field.index] || '').toLowerCase();
    const filterValue = String(filter.value).toLowerCase();

    switch (filter.operator) {
      case 'equals':
        return cellValue === filterValue;
      case 'not_equals':
        return cellValue !== filterValue;
      case 'contains':
        return cellValue.includes(filterValue);
      case 'starts_with':
        return cellValue.startsWith(filterValue);
      case 'greater_than':
        return parseFloat(cellValue) > parseFloat(filterValue);
      case 'less_than':
        return parseFloat(cellValue) < parseFloat(filterValue);
      default:
        return true;
    }
  });
}

/**
 * Applies date range filter
 * @param {Array} data - Data array
 * @param {string} dateFrom - Start date
 * @param {string} dateTo - End date
 * @param {Object} fieldMapping - Field mapping
 * @returns {Array} Filtered data
 */
function applyDateRange(data, dateFrom, dateTo, fieldMapping) {
  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate = dateTo ? new Date(dateTo) : null;

  return data.filter(function(row) {
    // Use DATE_FILED column for filed date filtering
    const filedDate = row[GRIEVANCE_COLS.DATE_FILED - 1];

    if (!filedDate) return true;

    if (fromDate && filedDate < fromDate) return false;
    if (toDate && filedDate > toDate) return false;

    return true;
  });
}

/**
 * Sorts data
 * @param {Array} data - Data array
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - asc or desc
 * @param {Object} fieldMapping - Field mapping
 * @returns {Array} Sorted data
 */
function sortData(data, sortBy, sortOrder, fieldMapping) {
  const field = fieldMapping[sortBy];
  if (!field) return data;

  return data.sort(function(a, b) {
    const aVal = a[field.index];
    const bVal = b[field.index];

    let comparison = 0;
    if (aVal < bVal) comparison = -1;
    if (aVal > bVal) comparison = 1;

    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

/**
 * Formats value based on type
 * @param {any} value - Value to format
 * @param {string} type - Data type
 * @returns {string} Formatted value
 */
function formatValue(value, type) {
  if (!value && value !== 0) return '';

  switch (type) {
    case 'date':
      return value instanceof Date ? Utilities.formatDate(value, Session.getScriptTimeZone(), 'MM/dd/yyyy') : value;
    case 'number':
      return typeof value === 'number' ? value.toString() : value;
    default:
      return value.toString();
  }
}

/**
 * Exports report to PDF
 * @param {Object} config - Report configuration
 * @returns {File} PDF file
 */
function exportReportToPDF(config) {
  const data = generateReportData(config);

  // Create Google Doc
  const doc = DocumentApp.create(`Custom_Report_${new Date().toISOString().slice(0, 10)}`);
  const body = doc.getBody();

  // Add title
  body.appendParagraph('SEIU Local 509 - Custom Report')
    .setHeading(DocumentApp.ParagraphHeading.HEADING1)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendParagraph(`Generated: ${new Date().toLocaleString()}`)
    .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  body.appendHorizontalRule();

  // Add table
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    const tableData = [headers];

    data.forEach(function(row) {
      tableData.push(Object.values(row).map(function(v) { return v.toString(); }));
    });

    const table = body.appendTable(tableData);
    table.getRow(0).editAsText().setBold(true);
  }

  doc.saveAndClose();

  // Convert to PDF
  const docFile = DriveApp.getFileById(doc.getId());
  const pdfBlob = docFile.getAs('application/pdf');
  const pdfFile = DriveApp.createFile(pdfBlob);

  // Delete temp doc
  docFile.setTrashed(true);

  return pdfFile;
}

/**
 * Exports report to CSV
 * @param {Object} config - Report configuration
 * @returns {string} CSV data
 */
function exportReportToCSV(config) {
  const data = generateReportData(config);

  if (data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  let csv = headers.join(',') + '\n';

  data.forEach(function(row) {
    const values = Object.values(row).map(function(v) {
      const str = v.toString();
      return str.includes(',') ? `"${str}"` : str;
    });
    csv += values.join(',') + '\n';
  });

  return csv;
}

/**
 * Exports report to Excel (Google Sheets)
 * @param {Object} config - Report configuration
 * @returns {File} Excel file
 */
function exportReportToExcel(config) {
  const data = generateReportData(config);

  // Create new spreadsheet
  const ss = SpreadsheetApp.create(`Custom_Report_${new Date().toISOString().slice(0, 10)}`);
  const sheet = ss.getActiveSheet();

  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1a73e8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');

    const rows = data.map(function(row) { return Object.values(row); });
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  return DriveApp.getFileById(ss.getId());
}

/**
 * Saves report template
 * @param {string} name - Template name
 * @param {Object} config - Report configuration
 */
function saveReportTemplate(name, config) {
  const props = PropertiesService.getUserProperties();
  const templates = JSON.parse(props.getProperty('reportTemplates') || '[]');

  // Remove existing template with same name
  const filtered = templates.filter(function(t) { return t.name !== name; });

  // Add new template
  filtered.push({ name: name, config: config });

  props.setProperty('reportTemplates', JSON.stringify(filtered));
}

/**
 * Gets saved report templates
 * @returns {Array} Templates
 */
function getReportTemplates() {
  const props = PropertiesService.getUserProperties();
  return JSON.parse(props.getProperty('reportTemplates') || '[]');
}
