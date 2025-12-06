/**
 * ------------------------------------------------------------------------====
 * DATA CACHING LAYER
 * ------------------------------------------------------------------------====
 *
 * Performance optimization through intelligent caching
 * Features:
 * - In-memory cache for frequently accessed data
 * - Script properties cache for persistent storage
 * - Cache invalidation strategies
 * - Automatic cache warming
 * - Performance monitoring
 * - Configurable TTL (time-to-live)
 *
 * Configuration: Uses CACHE_CONFIG and CACHE_KEYS from Constants.gs
 * @see Constants.gs for configuration
 */

/**
 * Gets data from cache or loads from source
 * @param {string} key - Cache key
 * @param {Function} loader - Function to load data if cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {any} Cached or freshly loaded data
 */
function getCachedData(key, loader, ttl = CACHE_CONFIG.MEMORY_TTL) {
  try {
    // Try memory cache first (fastest)
    const memoryCache = CacheService.getScriptCache();
    const memoryCached = memoryCache.get(key);

    if (memoryCached) {
      logCacheHit('MEMORY', key);
      return JSON.parse(memoryCached);
    }

    // Try script properties (persistent)
    const propsCache = PropertiesService.getScriptProperties();
    const propsCached = propsCache.getProperty(key);

    if (propsCached) {
      const cachedObj = JSON.parse(propsCached);

      // Check if expired
      if (cachedObj.timestamp && (Date.now() - cachedObj.timestamp) < (ttl * 1000)) {
        logCacheHit('PROPERTIES', key);

        // Warm memory cache
        memoryCache.put(key, JSON.stringify(cachedObj.data), ttl);

        return cachedObj.data;
      }
    }

    // Cache miss - load from source
    logCacheMiss(key);
    const data = loader();

    // Store in both caches
    setCachedData(key, data, ttl);

    return data;

  } catch (error) {
    Logger.log(`Cache error for key ${key}: ${error.message}`);
    // Fallback to direct load
    return loader();
  }
}

/**
 * Sets data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds
 */
function setCachedData(key, data, ttl = CACHE_CONFIG.MEMORY_TTL) {
  try {
    const dataStr = JSON.stringify(data);
    const sizeInBytes = dataStr.length;
    const MAX_PROPERTY_SIZE = 400000; // 400KB limit (conservative, actual limit is 500KB)

    // Store in memory cache
    const memoryCache = CacheService.getScriptCache();
    memoryCache.put(key, dataStr, Math.min(ttl, 21600)); // Max 6 hours for memory

    // Only store in properties cache if size is within limits
    if (sizeInBytes < MAX_PROPERTY_SIZE) {
      const propsCache = PropertiesService.getScriptProperties();
      const cachedObj = {
        data: data,
        timestamp: Date.now()
      };
      propsCache.setProperty(key, JSON.stringify(cachedObj));
    } else {
      Logger.log(`Skipping properties cache for key ${key}: size ${sizeInBytes} bytes exceeds limit`);
    }

    logCacheSet(key);

  } catch (error) {
    Logger.log(`Error setting cache for key ${key}: ${error.message}`);
    // Silently fail - cache is optional
  }
}

/**
 * Invalidates cache for a specific key
 * @param {string} key - Cache key to invalidate
 */
function invalidateCache(key) {
  try {
    CacheService.getScriptCache().remove(key);
    PropertiesService.getScriptProperties().deleteProperty(key);
    Logger.log(`Cache invalidated: ${key}`);
  } catch (error) {
    Logger.log(`Error invalidating cache for key ${key}: ${error.message}`);
  }
}

/**
 * Invalidates all caches
 */
function invalidateAllCaches() {
  try {
    CacheService.getScriptCache().removeAll(Object.values(CACHE_KEYS));

    const propsCache = PropertiesService.getScriptProperties();
    Object.values(CACHE_KEYS).forEach(function(key) {
      propsCache.deleteProperty(key);
    });

    Logger.log('All caches invalidated');

    SpreadsheetApp.getActiveSpreadsheet().toast(
      '✅ All caches cleared',
      'Cache Management',
      3
    );

  } catch (error) {
    Logger.log(`Error invalidating all caches: ${error.message}`);
  }
}

/**
 * Warms up caches with frequently accessed data
 */
function warmUpCaches() {
  SpreadsheetApp.getActiveSpreadsheet().toast(
    '🔥 Warming up caches...',
    'Cache Management',
    -1
  );

  try {
    // Warm up key data
    getCachedGrievances();
    getCachedMembers();
    getCachedStewards();
    getCachedDashboardMetrics();

    Logger.log('Caches warmed up successfully');

    SpreadsheetApp.getActiveSpreadsheet().toast(
      '✅ Caches warmed up',
      'Cache Management',
      3
    );

  } catch (error) {
    Logger.log(`Error warming up caches: ${error.message}`);
  }
}

/**
 * Gets all grievances (cached)
 * @returns {Array} Grievances array
 */
function getCachedGrievances() {
  return getCachedData(
    CACHE_KEYS.ALL_GRIEVANCES,
    function() {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEETS.GRIEVANCE_LOG);
      const lastRow = sheet.getLastRow();

      if (lastRow < 2) return [];

      return sheet.getRange(2, 1, lastRow - 1, 28).getValues();
    },
    300 // 5 minutes
  );
}

/**
 * Gets all members (cached)
 * @returns {Array} Members array
 */
function getCachedMembers() {
  return getCachedData(
    CACHE_KEYS.ALL_MEMBERS,
    function() {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEETS.MEMBER_DIR);
      const lastRow = sheet.getLastRow();

      if (lastRow < 2) return [];

      return sheet.getRange(2, 1, lastRow - 1, 28).getValues();
    },
    600 // 10 minutes
  );
}

/**
 * Gets all stewards (cached)
 * @returns {Array} Stewards array
 */
function getCachedStewards() {
  return getCachedData(
    CACHE_KEYS.ALL_STEWARDS,
    function() {
      const members = getCachedMembers();
      return members.filter(function(row) { return row[MEMBER_COLS.IS_STEWARD - 1] === 'Yes'; }); // Column J: Is Steward?
    },
    600 // 10 minutes
  );
}

/**
 * Gets dashboard metrics (cached)
 * @returns {Object} Dashboard metrics
 */
function getCachedDashboardMetrics() {
  return getCachedData(
    CACHE_KEYS.DASHBOARD_METRICS,
    function() {
      const grievances = getCachedGrievances();

      const metrics = {
        total: grievances.length,
        open: 0,
        closed: 0,
        overdue: 0,
        byStatus: {},
        byIssueType: {},
        bySteward: {}
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      grievances.forEach(function(row) {
        const status = row[GRIEVANCE_COLS.STATUS - 1];
        const issueType = row[GRIEVANCE_COLS.ISSUE_CATEGORY - 1];
        const steward = row[GRIEVANCE_COLS.STEWARD - 1];
        const nextActionDue = row[GRIEVANCE_COLS.NEXT_ACTION_DUE - 1];
        const daysToDeadline = nextActionDue ? Math.floor((new Date(nextActionDue) - today) / (1000 * 60 * 60 * 24)) : null;

        if (status === 'Open') metrics.open++;
        if (status === 'Closed' || status === 'Resolved') metrics.closed++;
        if (daysToDeadline !== null && daysToDeadline < 0) metrics.overdue++;

        metrics.byStatus[status] = (metrics.byStatus[status] || 0) + 1;

        if (issueType) {
          metrics.byIssueType[issueType] = (metrics.byIssueType[issueType] || 0) + 1;
        }

        if (steward) {
          metrics.bySteward[steward] = (metrics.bySteward[steward] || 0) + 1;
        }
      });

      return metrics;
    },
    180 // 3 minutes
  );
}

/**
 * Logs cache hit
 * @param {string} source - Cache source (MEMORY/PROPERTIES)
 * @param {string} key - Cache key
 */
function logCacheHit(source, key) {
  if (CACHE_CONFIG.ENABLE_LOGGING) {
    Logger.log(`[CACHE HIT] ${source}: ${key}`);
  }
}

/**
 * Logs cache miss
 * @param {string} key - Cache key
 */
function logCacheMiss(key) {
  if (CACHE_CONFIG.ENABLE_LOGGING) {
    Logger.log(`[CACHE MISS] ${key}`);
  }
}

/**
 * Logs cache set
 * @param {string} key - Cache key
 */
function logCacheSet(key) {
  if (CACHE_CONFIG.ENABLE_LOGGING) {
    Logger.log(`[CACHE SET] ${key}`);
  }
}

/**
 * Shows cache status dashboard
 */
function showCacheStatusDashboard() {
  const memoryCache = CacheService.getScriptCache();
  const propsCache = PropertiesService.getScriptProperties();

  const cacheStatus = [];

  Object.entries(CACHE_KEYS).forEach(function([name, key]) {
    const inMemory = memoryCache.get(key) !== null;
    const inProps = propsCache.getProperty(key) !== null;

    let age = 'N/A';
    if (inProps) {
      const cached = JSON.parse(propsCache.getProperty(key));
      if (cached.timestamp) {
        age = Math.floor((Date.now() - cached.timestamp) / 1000) + 's';
      }
    }

    cacheStatus.push({
      name: name,
      key: key,
      inMemory: inMemory,
      inProps: inProps,
      age: age
    });
  });

  const statusRows = cacheStatus
    .map(function(s) { return `
      <tr>
        <td>${s.name}</td>
        <td>${s.inMemory ? '✅ Yes' : '❌ No'}</td>
        <td>${s.inProps ? '✅ Yes' : '❌ No'}</td>
        <td>${s.age}</td>
      </tr>
    `; })
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; margin: 0; background: #f5f5f5; }
    .container { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { color: #1a73e8; margin-top: 0; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }
    .info-box { background: #e8f0fe; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #1a73e8; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #1a73e8; color: white; padding: 12px; text-align: left; }
    td { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; }
    tr:hover { background: #f5f5f5; }
    button { background: #1a73e8; color: white; border: none; padding: 12px 24px; font-size: 14px; border-radius: 4px; cursor: pointer; margin: 10px 5px 0 0; }
    button:hover { background: #1557b0; }
    button.danger { background: #dc3545; }
    button.danger:hover { background: #c82333; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🗄️ Cache Status Dashboard</h2>

    <div class="info-box">
      <strong>ℹ️ Cache Information:</strong><br>
      • <strong>Memory Cache:</strong> Fast, in-memory storage (5-minute TTL, max 6 hours)<br>
      • <strong>Properties Cache:</strong> Persistent storage across sessions (1-hour TTL)<br>
      • Caches automatically refresh when data is modified
    </div>

    <h3>Cache Status</h3>
    <table>
      <thead>
        <tr>
          <th>Cache Name</th>
          <th>In Memory</th>
          <th>In Properties</th>
          <th>Age</th>
        </tr>
      </thead>
      <tbody>
        ${statusRows}
      </tbody>
    </table>

    <button onclick="google.script.run.withSuccessHandler(function() { location.reload(); }).warmUpCaches()">
      🔥 Warm Up All Caches
    </button>

    <button class="danger" onclick="google.script.run.withSuccessHandler(function() { location.reload(); }).invalidateAllCaches()">
      🗑️ Clear All Caches
    </button>
  </div>
</body>
</html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(700)
    .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '🗄️ Cache Status');
}
