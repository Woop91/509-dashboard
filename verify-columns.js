#!/usr/bin/env node
/**
 * verify-columns.js
 *
 * Automated verification that seed functions generate correct column counts.
 * Run this before every commit: node verify-columns.js
 *
 * This script parses the actual code to ensure:
 * 1. MEMBER_COLS has the expected number of columns
 * 2. GRIEVANCE_COLS has the expected number of columns
 * 3. generateSingleMemberRow() returns an array with MEMBER_COLS count
 * 4. generateSingleGrievanceRow() returns an array with GRIEVANCE_COLS count
 */

const fs = require('fs');
const path = require('path');

const CONSTANTS_FILE = path.join(__dirname, 'Constants.gs');
const CODE_FILE = path.join(__dirname, 'Code.gs');

let errors = [];
let warnings = [];

console.log('🔍 COLUMN VERIFICATION CHECK\n');

// Read files
const constantsContent = fs.readFileSync(CONSTANTS_FILE, 'utf8');
const codeContent = fs.readFileSync(CODE_FILE, 'utf8');

// === CHECK 1: Count MEMBER_COLS entries ===
console.log('1️⃣  Checking MEMBER_COLS...');

const memberColsMatch = constantsContent.match(/const MEMBER_COLS\s*=\s*\{([^}]+)\}/s);
if (memberColsMatch) {
  const memberColsBody = memberColsMatch[1];
  // Count actual column assignments (not aliases, not comments)
  const memberEntries = memberColsBody.match(/^\s*[A-Z_]+:\s*\d+/gm) || [];
  // Find the highest column number
  const memberNumbers = memberColsBody.match(/:\s*(\d+)/g).map(m => parseInt(m.replace(/:\s*/, '')));
  const maxMemberCol = Math.max(...memberNumbers);

  console.log(`   Found ${memberEntries.length} entries, max column: ${maxMemberCol}`);

  if (maxMemberCol !== 31) {
    errors.push(`MEMBER_COLS max column is ${maxMemberCol}, expected 31`);
  } else {
    console.log('   ✅ MEMBER_COLS has 31 columns');
  }
} else {
  errors.push('Could not find MEMBER_COLS definition');
}

// === CHECK 2: Count GRIEVANCE_COLS entries ===
console.log('\n2️⃣  Checking GRIEVANCE_COLS...');

const grievanceColsMatch = constantsContent.match(/const GRIEVANCE_COLS\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);
if (grievanceColsMatch) {
  const grievanceColsBody = grievanceColsMatch[1];
  const grievanceNumbers = grievanceColsBody.match(/:\s*(\d+)/g).map(m => parseInt(m.replace(/:\s*/, '')));
  const maxGrievanceCol = Math.max(...grievanceNumbers);

  console.log(`   Max column number: ${maxGrievanceCol}`);

  if (maxGrievanceCol !== 34) {
    errors.push(`GRIEVANCE_COLS max column is ${maxGrievanceCol}, expected 34`);
  } else {
    console.log('   ✅ GRIEVANCE_COLS has 34 columns');
  }
} else {
  errors.push('Could not find GRIEVANCE_COLS definition');
}

// === CHECK 3: Count elements in generateSingleMemberRow return array ===
console.log('\n3️⃣  Checking generateSingleMemberRow()...');

const memberRowMatch = codeContent.match(/function generateSingleMemberRow[\s\S]*?const row\s*=\s*\[([\s\S]*?)\];\s*\n\s*return/);
if (memberRowMatch) {
  const arrayContent = memberRowMatch[1];
  // Count array elements by counting commas at the top level + 1
  // This is approximate - counts lines that look like array elements
  const lines = arrayContent.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('//') && trimmed !== '';
  });

  // Better approach: count actual elements by tracking brackets
  let depth = 0;
  let elementCount = 1; // Start at 1 for the first element
  for (const char of arrayContent) {
    if (char === '[' || char === '(' || char === '{') depth++;
    else if (char === ']' || char === ')' || char === '}') depth--;
    else if (char === ',' && depth === 0) elementCount++;
  }

  console.log(`   Array has ~${elementCount} elements`);

  if (elementCount < 31) {
    errors.push(`generateSingleMemberRow() returns ${elementCount} elements, expected 31`);
  } else if (elementCount > 31) {
    warnings.push(`generateSingleMemberRow() returns ${elementCount} elements, expected 31 (may have extra)`);
  } else {
    console.log('   ✅ generateSingleMemberRow() returns 31 elements');
  }
} else {
  errors.push('Could not find generateSingleMemberRow() function');
}

// === CHECK 4: Count elements in generateSingleGrievanceRow return array ===
console.log('\n4️⃣  Checking generateSingleGrievanceRow()...');

const grievanceRowMatch = codeContent.match(/function generateSingleGrievanceRow[\s\S]*?return\s*\[([\s\S]*?)\];\s*\n\}/);
if (grievanceRowMatch) {
  const arrayContent = grievanceRowMatch[1];

  let depth = 0;
  let elementCount = 1;
  for (const char of arrayContent) {
    if (char === '[' || char === '(' || char === '{') depth++;
    else if (char === ']' || char === ')' || char === '}') depth--;
    else if (char === ',' && depth === 0) elementCount++;
  }

  console.log(`   Array has ~${elementCount} elements`);

  if (elementCount < 34) {
    errors.push(`generateSingleGrievanceRow() returns ${elementCount} elements, expected 34`);
  } else if (elementCount > 34) {
    warnings.push(`generateSingleGrievanceRow() returns ${elementCount} elements, expected 34 (may have extra)`);
  } else {
    console.log('   ✅ generateSingleGrievanceRow() returns 34 elements');
  }
} else {
  errors.push('Could not find generateSingleGrievanceRow() function');
}

// === CHECK 5: Verify AIR.md references match ===
console.log('\n5️⃣  Checking AIR.md documentation...');

const airPath = path.join(__dirname, 'AIR.md');
if (fs.existsSync(airPath)) {
  const airContent = fs.readFileSync(airPath, 'utf8');

  // Check if START_GRIEVANCE: 31 exists (should be last member column)
  if (airContent.includes('START_GRIEVANCE: 31')) {
    console.log('   ✅ AIR.md has START_GRIEVANCE: 31');
  } else {
    warnings.push('AIR.md may have outdated MEMBER_COLS (missing START_GRIEVANCE: 31)');
  }

  // Check if DRIVE_FOLDER_URL: 34 exists (should be last grievance column)
  if (airContent.includes('DRIVE_FOLDER_URL: 34')) {
    console.log('   ✅ AIR.md has DRIVE_FOLDER_URL: 34');
  } else {
    warnings.push('AIR.md may have outdated GRIEVANCE_COLS (missing DRIVE_FOLDER_URL: 34)');
  }
} else {
  warnings.push('AIR.md not found');
}

// === RESULTS ===
console.log('\n' + '='.repeat(50));

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(w => console.log(`   - ${w}`));
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS:');
  errors.forEach(e => console.log(`   - ${e}`));
  console.log('\n❌ VERIFICATION FAILED\n');
  process.exit(1);
} else {
  console.log('\n✅ ALL CHECKS PASSED\n');
  process.exit(0);
}
