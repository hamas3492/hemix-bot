/**
 * Hemix Bot Dashboard - Production Application JavaScript
 * Optimized: SSE status, API caching, debounced search, skeleton loaders
 */

// ═══════════════════════════════════════════════════════════════════
// Global State
// ═══════════════════════════════════════════════════════════════════
let logEventSource = null;
let statusEventSource = null;
let isLogsPaused = false;
let commandsData = [];
let commandsLoaded = false;
let settingsLoaded = false;

// API Response Cache — prevents duplicate requests
const apiCache = new Map();
const CACHE_TTL = 30000; // 30s default cache

// ═══════════════════════════════════════════════════════════════════
// API Client with JWT Auth + Caching
// ═══════════════════════════════════════════════════════════════════
async function apiCall(endpoint, method = 'GET', body = null, useCache = false) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  // Cache GET requests
  const cacheKey = `${method}:${endpoint}`;
  if (useCache && method === 'GET' && apiCache.has(cacheKey)) {
    const cached = apiCache.get(cacheKey);
    if (Date.now() - cached.time < CACHE_TTL) {
      return cached.data;
    }
    apiCache.delete(cacheKey);
  }

  try {
    const res = await fetch(endpoint, options);
    if (res.status === 401) {
      removeAuthToken();
      window.location.href = '/login.html';
      return null;
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    if (useCache && method === 'GET') {
      apiCache.set(cacheKey, { data, time: Date.now() });
    }
    return data;
  } catch (err) {
    console.error(`API Error [${method} ${endpoint}]:`, err);
    throw err;
  }
}

// Invalidate cache for a prefix
function invalidateCache(prefix = '') {
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) apiCache.delete(key);
  }
}

// ═══════════════════════════════════════════════════════════════════
// Toast Notifications
// ═══════════════════════════════════════════════════════════════════
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const iconClass = type === 'success' ? 'fa-check-circle text-emerald-400'
    : type === 'error' ? 'fa-exclamation-circle text-red-400'
    : type === 'warning' ? 'fa-exclamation-triangle text-amber-400'
    : 'fa-info-circle text-blue-400';

  toast.innerHTML = `<i class="fas ${iconClass} text-lg flex-shrink-0"></i><span class="text-xs font-medium">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ═══════════════════════════════════════════════════════════════════
// Skeleton Loader Helper
// ═══════════════════════════════════════════════════════════════════
function showSkeleton(container, count = 6) {
  if (!container) return;
  container.innerHTML = Array(count).fill(0).map(() =>
    `<div class="glass-card p-4 rounded-xl border border-slate-800/80 animate-pulse">
      <div class="h-4 bg-slate-700/40 rounded w-2/3 mb-2"></div>
      <div class="h-3 bg-slate-700/30 rounded w-1/3"></div>
    </div>`
  ).join('');
}

// ═══════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════
function formatUptime(seconds) {
  if (!seconds || isNaN(seconds)) return '0s';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Debounce helper — prevents rapid-fire API calls on search/filter
function debounce(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ═══════════════════════════════════════════════════════════════════
// Status via SSE (replaces 15s polling)
// ═══════════════════════════════════════════════════════════════════
function startStatusSSE() {
  const token = getAuthToken();
  if (!token) return;

  // Close existing
  if (statusEventSource) statusEventSource.close();

  try {
    statusEventSource = new EventSource(`/api/bot/status-stream?token=${encodeURIComponent(token)}`);

    statusEventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        updateStatusUI(data);
      } catch (e) {
        console.error('Status SSE parse error:', e);
      }
    };

    statusEventSource.onerror = () => {
      console.warn('Status SSE disconnected. Falling back to polling.');
      statusEventSource.close();
      // Fallback to polling
      if (!statusPollInterval) startPollingFallback();
    };
  } catch (e) {
    console.error('SSE init failed, using polling:', e);
    startPollingFallback();
  }
}

// Fallback polling (only if SSE fails)
let statusPollInterval = null;
let systemPollInterval = null;
function startPollingFallback() {
  if (statusPollInterval) clearInterval(statusPollInterval);
  updateBotStatus();
  statusPollInterval = setInterval(updateBotStatus, 10000);
}

function updateStatusUI(data) {
  const { state, uptime, user, phoneNumber } = data;

  const headerStatusDot = document.getElementById('header-status-dot');
  const headerStatusText = document.getElementById('header-status-text');
  const headerUptime = document.getElementById('header-uptime');
  const overviewState = document.getElementById('overview-bot-state');
  const overviewUserInfo = document.getElementById('overview-user-info');
  const mobileStatusIndicator = document.getElementById('mobile-status-indicator');

  if (headerUptime) headerUptime.textContent = formatUptime(uptime);
  if (headerStatusText) headerStatusText.textContent = state || 'DISCONNECTED';
  if (overviewState) overviewState.textContent = state || 'DISCONNECTED';

  // Status Colors
  let colorClass = 'bg-slate-500';
  let statusLabel = state || 'DISCONNECTED';
  if (state === 'CONNECTED') { colorClass = 'bg-emerald-400'; statusLabel = 'Connected'; }
  else if (state === 'CONNECTING') { colorClass = 'bg-amber-400 animate-ping'; statusLabel = 'Connecting'; }
  else if (state === 'RECONNECTING') { colorClass = 'bg-blue-400 animate-ping'; statusLabel = 'Reconnecting'; }
  else if (state === 'WAITING') { colorClass = 'bg-amber-400 animate-ping'; statusLabel = 'Waiting for QR'; }
  else if (state === 'AUTH_FAILED') { colorClass = 'bg-red-500'; statusLabel = 'Auth Failed'; }
  else if (state === 'DISCONNECTED') { colorClass = 'bg-red-500'; statusLabel = 'Disconnected'; }

  if (headerStatusDot) headerStatusDot.className = `w-2 h-2 rounded-full ${colorClass}`;

  if (mobileStatusIndicator) {
    mobileStatusIndicator.innerHTML = `<span class="w-2 h-2 rounded-full ${colorClass}"></span><span>${statusLabel}</span>`;
  }

  if (overviewUserInfo) {
    if (user && user.id) {
      const number = phoneNumber || user.id.split('@')[0];
      overviewUserInfo.innerHTML = `Connected as: <span class="font-mono text-purple-300 font-bold">${user.name || user.id}</span> (${number})`;
    } else {
      overviewUserInfo.innerHTML = `WhatsApp: <span class="font-mono text-slate-400">Not linked</span>`;
    }
  }
}

async function updateBotStatus() {
  try {
    const data = await apiCall('/api/bot/status', 'GET', null, true);
    if (data) updateStatusUI(data);
  } catch (err) {
    console.error('Failed to update status:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════
// System Metrics (loaded async, doesn't block UI)
// ═══════════════════════════════════════════════════════════════════
async function updateSystemMetrics() {
  try {
    const data = await apiCall('/api/bot/system', 'GET', null, true);
    if (!data) return;

    const { cpu, ram, processMemory, nodeVersion, botVersion, osType, osRelease, loadedPlugins, commandCount } = data;

    // Overview Tab
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setBar = (id, val) => { const el = document.getElementById(id); if (el) el.style.width = `${Math.min(100, val)}%`; };

    setEl('overview-cpu-pct', `${cpu.usage || 0}%`);
    setEl('overview-cpu-cores', `${cpu.cores || 1} Cores`);
    setBar('overview-cpu-bar', cpu.usage || 0);
    setEl('overview-ram-pct', `${ram.percentage || 0}%`);
    setEl('overview-ram-detail', `${ram.used} / ${ram.total} MB`);
    setBar('overview-ram-bar', ram.percentage || 0);
    setEl('overview-uptime', formatUptime(data.uptime));
    setEl('overview-cmd-count', commandCount || 0);

    // System Info Tab
    setEl('sys-cpu-model', cpu.model || 'Unknown');
    setEl('sys-cpu-cores', `${cpu.cores || 1} Cores`);
    setEl('sys-load-avg', cpu.loadAvg ? cpu.loadAvg.map(l => l.toFixed(2)).join(', ') : '0.00');
    setEl('sys-os-platform', osType || '-');
    setEl('sys-os-release', osRelease || '-');
    setEl('sys-node-ver', nodeVersion || '-');
    setEl('sys-bot-ver', botVersion || '-');
    setEl('sys-proc-rss', `${processMemory.rss} MB`);
    setEl('sys-proc-heap', `${processMemory.heapUsed} MB`);
    setEl('sys-ram-total', `${ram.total} MB`);

    // Plugins
    const pluginsContainer = document.getElementById('sys-plugins-container');
    if (pluginsContainer && Array.isArray(loadedPlugins)) {
      if (loadedPlugins.length === 0) {
        pluginsContainer.innerHTML = '<span class="text-xs text-slate-500">No plugins registered</span>';
      } else {
        pluginsContainer.innerHTML = loadedPlugins.map(p =>
          `<div class="px-3 py-1 rounded-xl bg-slate-900 border border-purple-500/20 text-xs font-mono text-purple-300 flex items-center gap-1.5"><i class="fas fa-plug text-[10px] text-purple-400"></i> ${p.name || p}</div>`
        ).join('');
      }
    }
  } catch (err) {
    console.error('Failed to update system metrics:', err);
  }
}

function startSystemPolling() {
  updateSystemMetrics();
  systemPollInterval = setInterval(updateSystemMetrics, 30000); // 30s (was 15s)
}

// ═══════════════════════════════════════════════════════════════════
// Bot Controls
// ═══════════════════════════════════════════════════════════════════
function setupBotControlButtons() {
  const btnStart = document.getElementById('btn-start-bot');
  const btnStop = document.getElementById('btn-stop-bot');
  const btnRestart = document.getElementById('btn-restart-bot');
  const btnDisconnect = document.getElementById('btn-disconnect-bot');
  const btnWaLogout = document.getElementById('wa-logout-btn');

  if (btnStart) btnStart.addEventListener('click', async () => {
    try {
      btnStart.disabled = true;
      showToast('Initiating bot startup...', 'info');
      const res = await apiCall('/api/bot/start', 'POST');
      if (res && res.success) showToast(res.message || 'Bot startup initiated', 'success');
    } catch (err) { showToast(err.message || 'Failed to start bot', 'error'); }
    finally { btnStart.disabled = false; }
  });

  if (btnStop) btnStop.addEventListener('click', async () => {
    try {
      btnStop.disabled = true;
      showToast('Stopping bot...', 'warning');
      const res = await apiCall('/api/bot/stop', 'POST');
      if (res && res.success) showToast('Bot stopped successfully', 'success');
    } catch (err) { showToast(err.message || 'Failed to stop bot', 'error'); }
    finally { btnStop.disabled = false; }
  });

  if (btnRestart) btnRestart.addEventListener('click', async () => {
    try {
      btnRestart.disabled = true;
      showToast('Restarting bot...', 'info');
      const res = await apiCall('/api/bot/restart', 'POST');
      if (res && res.success) showToast('Bot restart initiated', 'success');
    } catch (err) { showToast(err.message || 'Failed to restart bot', 'error'); }
    finally { btnRestart.disabled = false; }
  });

  if (btnDisconnect) btnDisconnect.addEventListener('click', async () => {
    try {
      btnDisconnect.disabled = true;
      const res = await apiCall('/api/bot/disconnect', 'POST');
      if (res && res.success) showToast('Disconnected from WhatsApp', 'success');
    } catch (err) { showToast(err.message || 'Failed to disconnect', 'error'); }
    finally { btnDisconnect.disabled = false; }
  });

  if (btnWaLogout) btnWaLogout.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to log out and clear the WhatsApp session?')) return;
    try {
      btnWaLogout.disabled = true;
      const res = await apiCall('/api/bot/logout', 'POST');
      if (res && res.success) { showToast('Session cleared and logged out', 'success'); invalidateCache('/api/bot'); }
    } catch (err) { showToast(err.message || 'Failed to logout session', 'error'); }
    finally { btnWaLogout.disabled = false; }
  });
}

// ═══════════════════════════════════════════════════════════════════
// WhatsApp Link Tab
// ═══════════════════════════════════════════════════════════════════
function setupWhatsAppTab() {
  const tabPair = document.getElementById('wa-tab-pair');
  const tabQr = document.getElementById('wa-tab-qr');
  const panelPair = document.getElementById('wa-panel-pair');
  const panelQr = document.getElementById('wa-panel-qr');

  if (tabPair && tabQr && panelPair && panelQr) {
    tabPair.addEventListener('click', () => {
      tabPair.className = 'px-5 py-2.5 font-semibold text-xs text-purple-400 border-b-2 border-purple-500 flex items-center gap-2 transition-all';
      tabQr.className = 'px-5 py-2.5 font-semibold text-xs text-slate-400 border-b-2 border-transparent hover:text-slate-200 flex items-center gap-2 transition-all';
      panelPair.classList.remove('hidden');
      panelQr.classList.add('hidden');
    });

    tabQr.addEventListener('click', () => {
      tabQr.className = 'px-5 py-2.5 font-semibold text-xs text-purple-400 border-b-2 border-purple-500 flex items-center gap-2 transition-all';
      tabPair.className = 'px-5 py-2.5 font-semibold text-xs text-slate-400 border-b-2 border-transparent hover:text-slate-200 flex items-center gap-2 transition-all';
      panelQr.classList.remove('hidden');
      panelPair.classList.add('hidden');
      fetchDashboardQR();
    });
  }

  const btnGetCode = document.getElementById('wa-get-code-btn');
  if (btnGetCode) btnGetCode.addEventListener('click', async () => {
    const phoneInput = document.getElementById('wa-phone-input');
    if (!phoneInput || !phoneInput.value.trim()) { showToast('Please enter a phone number', 'warning'); return; }
    try {
      btnGetCode.disabled = true;
      btnGetCode.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Requesting...';
      const data = await apiCall('/api/bot/pair', 'POST', { number: phoneInput.value.trim() });
      if (data && data.code) {
        const resultBox = document.getElementById('wa-pair-result-box');
        const codeDisplay = document.getElementById('wa-pair-code-display');
        if (resultBox && codeDisplay) { codeDisplay.textContent = data.code; resultBox.classList.remove('hidden'); showToast('Pairing code generated!', 'success'); }
      }
    } catch (err) { showToast(err.message || 'Failed to get pairing code', 'error'); }
    finally { btnGetCode.disabled = false; btnGetCode.innerHTML = '<i class="fas fa-key"></i> Get Pairing Code'; }
  });

  const btnRefreshQr = document.getElementById('wa-refresh-qr-btn');
  if (btnRefreshQr) btnRefreshQr.addEventListener('click', () => fetchDashboardQR());
}

async function fetchDashboardQR() {
  const qrImg = document.getElementById('wa-qr-img');
  const qrPlaceholder = document.getElementById('wa-qr-placeholder');
  try {
    const data = await apiCall('/api/bot/qr');
    if (data && data.qr) {
      if (qrImg && qrPlaceholder) { qrImg.src = data.qr; qrImg.classList.remove('hidden'); qrPlaceholder.classList.add('hidden'); }
    } else {
      if (qrPlaceholder) qrPlaceholder.innerHTML = `<i class="fas fa-info-circle text-amber-400 text-2xl mb-2"></i><p class="text-xs text-slate-400">${data?.message || 'No active QR code available'}</p>`;
    }
  } catch (err) { console.error(err); }
}

// ═══════════════════════════════════════════════════════════════════
// Commands Tab (with debounced search + skeleton loaders)
// ═══════════════════════════════════════════════════════════════════
async function loadCommands() {
  const container = document.getElementById('commands-list-container');
  if (!container) return;
  if (commandsLoaded) { renderCommandsList(); return; }

  showSkeleton(container, 8);

  try {
    const data = await apiCall('/api/settings/commands', 'GET', null, true);
    if (!data || !Array.isArray(data.commands)) return;

    commandsData = data.commands;
    commandsLoaded = true;

    const catFilter = document.getElementById('cmd-category-filter');
    if (catFilter) {
      const categories = [...new Set(commandsData.map(c => c.category))];
      catFilter.innerHTML = '<option value="all">All Categories</option>' + categories.map(c => `<option value="${c}">${c.toUpperCase()}</option>`).join('');
    }

    renderCommandsList();
  } catch (err) {
    container.innerHTML = `<div class="p-6 text-center text-red-400 text-xs col-span-full">Failed to load commands: ${err.message}</div>`;
  }
}

function renderCommandsList() {
  const container = document.getElementById('commands-list-container');
  const searchVal = (document.getElementById('cmd-search-input')?.value || '').toLowerCase().trim();
  const catVal = document.getElementById('cmd-category-filter')?.value || 'all';
  if (!container) return;

  const filtered = commandsData.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(searchVal) || cmd.category.toLowerCase().includes(searchVal);
    const matchesCat = catVal === 'all' || cmd.category === catVal;
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="p-8 text-center text-slate-500 text-xs col-span-full">No commands match your filter</div>';
    return;
  }

  container.innerHTML = filtered.map(cmd => `
    <div class="glass-card p-4 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-xs text-white font-mono">${cmd.name}</span>
          <span class="text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 font-semibold border border-slate-700">${cmd.category}</span>
        </div>
      </div>
      <label class="relative inline-flex items-center cursor-pointer shrink-0">
        <input type="checkbox" class="sr-only peer cmd-toggle-btn" data-cmd="${cmd.name}" ${cmd.enabled ? 'checked' : ''}>
        <div class="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
      </label>
    </div>
  `).join('');

  container.querySelectorAll('.cmd-toggle-btn').forEach(btn => {
    btn.addEventListener('change', async (e) => {
      const name = e.target.getAttribute('data-cmd');
      const enabled = e.target.checked;
      try {
        await apiCall(`/api/settings/commands/${name}`, 'PUT', { enabled });
        showToast(`Command '${name}' ${enabled ? 'enabled' : 'disabled'}`, 'success');
        const found = commandsData.find(c => c.name === name);
        if (found) found.enabled = enabled;
        invalidateCache('GET:/api/settings/commands');
      } catch (err) {
        showToast(`Failed to update command '${name}'`, 'error');
        e.target.checked = !enabled;
      }
    });
  });
}

// Debounced search — prevents rapid re-renders while typing
const debouncedRender = debounce(renderCommandsList, 250);

function setupCommandsFilters() {
  const searchInput = document.getElementById('cmd-search-input');
  const catFilter = document.getElementById('cmd-category-filter');
  if (searchInput) searchInput.addEventListener('input', debouncedRender);
  if (catFilter) catFilter.addEventListener('change', renderCommandsList);
}

// ═══════════════════════════════════════════════════════════════════
// Bot Settings Tab
// ═══════════════════════════════════════════════════════════════════
async function loadBotSettings() {
  if (settingsLoaded) return;
  try {
    const data = await apiCall('/api/settings', 'GET', null, true);
    if (!data || !data.settings) return;
    settingsLoaded = true;
    const s = data.settings;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal('set-prefix', s.prefix || '.');
    setVal('set-mode', s.mode || 'private');
    setVal('set-botName', s.botName || 'Hemix');
    setVal('set-ownerName', s.ownerName || 'Owner');
    setVal('set-ownerNumber', s.ownerNumber || '');
    setVal('set-timezone', s.timezone || 'Asia/Karachi');
    setVal('set-footer', s.footer || 'Powered by Hemix Bot V1.0');
  } catch (err) { showToast('Failed to load settings', 'error'); }
}

function setupSettingsForm() {
  const form = document.getElementById('settings-form');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      prefix: document.getElementById('set-prefix')?.value,
      mode: document.getElementById('set-mode')?.value,
      botName: document.getElementById('set-botName')?.value,
      ownerName: document.getElementById('set-ownerName')?.value,
      ownerNumber: document.getElementById('set-ownerNumber')?.value,
      timezone: document.getElementById('set-timezone')?.value,
      footer: document.getElementById('set-footer')?.value,
    };
    try {
      const res = await apiCall('/api/settings', 'PUT', body);
      if (res && res.success) { showToast('Settings saved successfully!', 'success'); invalidateCache('/api/settings'); settingsLoaded = false; }
    } catch (err) { showToast(err.message || 'Failed to save settings', 'error'); }
  });

  const pwdForm = document.getElementById('change-pwd-form');
  if (pwdForm) pwdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('change-curr-pwd')?.value;
    const newPassword = document.getElementById('change-new-pwd')?.value;
    try {
      const res = await apiCall('/api/auth/change-password', 'POST', { currentPassword, newPassword });
      if (res && res.success) { showToast('Password changed successfully!', 'success'); pwdForm.reset(); }
    } catch (err) { showToast(err.message || 'Failed to change password', 'error'); }
  });
}

// ═══════════════════════════════════════════════════════════════════
// AI Config Tab
// ═══════════════════════════════════════════════════════════════════
async function loadAISettings() {
  try {
    const data = await apiCall('/api/settings/ai', 'GET', null, true);
    if (!data || !data.ai) return;
    const ai = data.ai;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    if (document.getElementById('ai-enabled-toggle')) document.getElementById('ai-enabled-toggle').checked = Boolean(ai.enabled);
    const keyInput = document.getElementById('ai-api-key');
    if (keyInput) {
      if (ai.hasApiKey) {
        keyInput.value = '';
        keyInput.placeholder = ai.apiKey || '•••••••• (key is set)';
      } else {
        keyInput.value = '';
        keyInput.placeholder = 'Enter your API key';
      }
    }
    setVal('ai-base-url', ai.baseUrl || 'https://api.openai.com/v1');
    setVal('ai-model', ai.model || 'gpt-3.5-turbo');
  } catch (err) { console.error('AI settings load error:', err); }
}

function setupAIForm() {
  const form = document.getElementById('ai-config-form');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      enabled: document.getElementById('ai-enabled-toggle')?.checked,
      apiKey: document.getElementById('ai-api-key')?.value || null,
      baseUrl: document.getElementById('ai-base-url')?.value,
      model: document.getElementById('ai-model')?.value,
      provider: 'openai',
    };
    try {
      const res = await apiCall('/api/settings/ai', 'PUT', body);
      if (res && res.success) { showToast('AI configuration saved!', 'success'); invalidateCache('/api/settings/ai'); }
    } catch (err) { showToast(err.message || 'Failed to save AI config', 'error'); }
  });

  const toggleKeyBtn = document.getElementById('toggle-ai-key-btn');
  if (toggleKeyBtn) toggleKeyBtn.addEventListener('click', () => {
    const keyInput = document.getElementById('ai-api-key');
    if (keyInput) keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
  });
}

// ═══════════════════════════════════════════════════════════════════
// Anti Features Tab
// ═══════════════════════════════════════════════════════════════════
function setupAntiFeatures() {
  const saveBtn = document.getElementById('save-anti-btn');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    const groupId = document.getElementById('anti-group-jid')?.value.trim();
    if (!groupId) { showToast('Please enter a target Group JID', 'warning'); return; }
    const body = {
      antiLink: document.getElementById('anti-link-toggle')?.checked,
      antiBot: document.getElementById('anti-bot-toggle')?.checked,
      antiSpam: document.getElementById('anti-spam-toggle')?.checked,
      antiDelete: document.getElementById('anti-delete-toggle')?.checked,
      antiMedia: document.getElementById('anti-media-toggle')?.checked,
      antiBadword: document.getElementById('anti-badword-toggle')?.checked,
      warningLimit: document.getElementById('anti-warning-limit')?.value || 3,
    };
    try {
      const res = await apiCall(`/api/settings/anti/${encodeURIComponent(groupId)}`, 'PUT', body);
      if (res && res.success) showToast('Anti features saved for group!', 'success');
    } catch (err) { showToast(err.message || 'Failed to save anti features', 'error'); }
  });
}

// ═══════════════════════════════════════════════════════════════════
// Group Settings Tab
// ═══════════════════════════════════════════════════════════════════
async function loadGroupSettings() {
  const listEl = document.getElementById('group-settings-list');
  if (!listEl) return;
  try {
    const data = await apiCall('/api/settings/groups', 'GET', null, true);
    if (!data || !Array.isArray(data.groups)) return;
    if (data.groups.length === 0) { listEl.innerHTML = '<p class="text-xs text-slate-500">No custom group settings found.</p>'; return; }
    listEl.innerHTML = data.groups.map(g => `
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all select-group-item" data-jid="${g.groupId}">
        <div>
          <span class="font-mono text-xs font-bold text-purple-300 block">${g.groupId}</span>
          <span class="text-[10px] text-slate-400">${Object.keys(g.settings || {}).length} custom settings</span>
        </div>
        <i class="fas fa-chevron-right text-slate-600 text-xs"></i>
      </div>
    `).join('');
    listEl.querySelectorAll('.select-group-item').forEach(item => {
      item.addEventListener('click', () => {
        const jid = item.getAttribute('data-jid');
        if (document.getElementById('group-edit-target')) document.getElementById('group-edit-target').textContent = jid;
        if (document.getElementById('group-edit-jid')) document.getElementById('group-edit-jid').value = jid;
        if (document.getElementById('anti-group-jid')) document.getElementById('anti-group-jid').value = jid;
      });
    });
  } catch (err) { listEl.innerHTML = `<p class="text-xs text-red-400">Failed to load groups: ${err.message}</p>`; }
}

function setupGroupSettings() {
  const saveBtn = document.getElementById('save-group-settings-btn');
  if (saveBtn) saveBtn.addEventListener('click', async () => {
    const jid = document.getElementById('group-edit-jid')?.value.trim();
    const prefix = document.getElementById('group-edit-prefix')?.value.trim();
    if (!jid) { showToast('Please specify a Group JID', 'warning'); return; }
    try {
      const payload = {};
      if (prefix) payload.prefix = prefix;
      const res = await apiCall(`/api/settings/groups/${encodeURIComponent(jid)}`, 'PUT', payload);
      if (res && res.success) { showToast('Group settings updated!', 'success'); invalidateCache('/api/settings/groups'); loadGroupSettings(); }
    } catch (err) { showToast(err.message || 'Failed to update group settings', 'error'); }
  });
}

// ═══════════════════════════════════════════════════════════════════
// Welcome / Goodbye Tab
// ═══════════════════════════════════════════════════════════════════
async function loadWelcomeSettings() {
  try {
    const data = await apiCall('/api/settings/welcome', 'GET', null, true);
    if (!data || !data.welcome) return;
    const w = data.welcome;
    if (document.getElementById('welcome-enabled-toggle')) document.getElementById('welcome-enabled-toggle').checked = Boolean(w.welcomeEnabled);
    if (document.getElementById('welcome-message-text')) document.getElementById('welcome-message-text').value = w.welcomeMessage || '';
    if (document.getElementById('goodbye-enabled-toggle')) document.getElementById('goodbye-enabled-toggle').checked = Boolean(w.goodbyeEnabled);
    if (document.getElementById('goodbye-message-text')) document.getElementById('goodbye-message-text').value = w.goodbyeMessage || '';
  } catch (err) { console.error('Welcome settings error:', err); }
}

function setupWelcomeForm() {
  const form = document.getElementById('welcome-form');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      welcomeEnabled: document.getElementById('welcome-enabled-toggle')?.checked,
      welcomeMessage: document.getElementById('welcome-message-text')?.value,
      goodbyeEnabled: document.getElementById('goodbye-enabled-toggle')?.checked,
      goodbyeMessage: document.getElementById('goodbye-message-text')?.value,
    };
    try {
      const res = await apiCall('/api/settings/welcome', 'PUT', body);
      if (res && res.success) { showToast('Welcome/Goodbye configuration saved!', 'success'); invalidateCache('/api/settings/welcome'); }
    } catch (err) { showToast(err.message || 'Failed to save welcome settings', 'error'); }
  });
}

// ═══════════════════════════════════════════════════════════════════
// Sticker Settings Tab
// ═══════════════════════════════════════════════════════════════════
async function loadStickerSettings() {
  try {
    const data = await apiCall('/api/settings/sticker', 'GET', null, true);
    if (!data || !data.sticker) return;
    const st = data.sticker;
    if (document.getElementById('sticker-pack-name')) document.getElementById('sticker-pack-name').value = st.packName || '';
    if (document.getElementById('sticker-author-name')) document.getElementById('sticker-author-name').value = st.authorName || '';
  } catch (err) { console.error('Sticker settings error:', err); }
}

function setupStickerForm() {
  const form = document.getElementById('sticker-form');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = { packName: document.getElementById('sticker-pack-name')?.value, authorName: document.getElementById('sticker-author-name')?.value };
    try {
      const res = await apiCall('/api/settings/sticker', 'PUT', body);
      if (res && res.success) { showToast('Sticker settings updated!', 'success'); invalidateCache('/api/settings/sticker'); }
    } catch (err) { showToast(err.message || 'Failed to save sticker settings', 'error'); }
  });
}

// ═══════════════════════════════════════════════════════════════════
// Variables Store Tab
// ═══════════════════════════════════════════════════════════════════
async function loadVariables() {
  const tbody = document.getElementById('variables-table-body');
  if (!tbody) return;
  try {
    const data = await apiCall('/api/settings/variables', 'GET', null, true);
    if (!data || !Array.isArray(data.variables)) return;
    if (data.variables.length === 0) { tbody.innerHTML = '<tr><td colspan="3" class="py-6 text-center text-slate-500">No environment variables set.</td></tr>'; return; }
    tbody.innerHTML = data.variables.map(v => `
      <tr class="hover:bg-slate-900/40">
        <td class="py-3 px-4 font-mono text-purple-300 font-semibold">${v.key}</td>
        <td class="py-3 px-4 font-mono text-slate-300 max-w-xs truncate">${v.value}</td>
        <td class="py-3 px-4 text-right">
          <button class="delete-var-btn p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs" data-key="${v.key}" title="Delete Variable"><i class="fas fa-trash-alt"></i></button>
        </td>
      </tr>
    `).join('');
    tbody.querySelectorAll('.delete-var-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const key = btn.getAttribute('data-key');
        if (!confirm(`Delete variable '${key}'?`)) return;
        try {
          await apiCall(`/api/settings/variables/${encodeURIComponent(key)}`, 'DELETE');
          showToast(`Variable '${key}' deleted!`, 'success');
          invalidateCache('/api/settings/variables');
          loadVariables();
        } catch (err) { showToast(err.message || 'Failed to delete variable', 'error'); }
      });
    });
  } catch (err) { tbody.innerHTML = `<tr><td colspan="3" class="py-4 text-center text-red-400">Error: ${err.message}</td></tr>`; }
}

function setupVariablesForm() {
  const form = document.getElementById('add-var-form');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = document.getElementById('new-var-key')?.value.trim();
    const value = document.getElementById('new-var-val')?.value;
    if (!key) return;
    try {
      const res = await apiCall(`/api/settings/variables/${encodeURIComponent(key)}`, 'PUT', { value });
      if (res && res.success) { showToast(`Variable '${key}' set successfully!`, 'success'); form.reset(); invalidateCache('/api/settings/variables'); loadVariables(); }
    } catch (err) { showToast(err.message || 'Failed to set variable', 'error'); }
  });
}

// ═══════════════════════════════════════════════════════════════════
// Sudo Users Tab
// ═══════════════════════════════════════════════════════════════════
async function loadSudoUsers() {
  const container = document.getElementById('sudo-users-container');
  if (!container) return;
  try {
    const data = await apiCall('/api/settings/sudo', 'GET', null, true);
    if (!data || !Array.isArray(data.sudos)) return;
    if (data.sudos.length === 0) { container.innerHTML = '<p class="text-xs text-slate-500">No sudo users configured.</p>'; return; }
    container.innerHTML = data.sudos.map(jid => `
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2"><i class="fas fa-user-shield text-red-400 text-xs"></i><span class="font-mono text-xs text-slate-200">${jid}</span></div>
        <button class="remove-sudo-btn text-xs text-red-400 hover:text-red-300 p-1" data-jid="${jid}"><i class="fas fa-trash-alt"></i></button>
      </div>
    `).join('');
    container.querySelectorAll('.remove-sudo-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const jid = btn.getAttribute('data-jid');
        if (!confirm(`Remove ${jid} from sudo users?`)) return;
        try {
          await apiCall(`/api/settings/sudo/${encodeURIComponent(jid)}`, 'DELETE');
          showToast(`Removed ${jid} from sudo`, 'success');
          invalidateCache('/api/settings/sudo');
          loadSudoUsers();
        } catch (err) { showToast(err.message || 'Failed to remove sudo user', 'error'); }
      });
    });
  } catch (err) { container.innerHTML = `<p class="text-xs text-red-400">Failed to load sudo users: ${err.message}</p>`; }
}

function setupSudoForm() {
  const form = document.getElementById('add-sudo-form');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('new-sudo-jid');
    const jid = input?.value.trim();
    if (!jid) return;
    try {
      const res = await apiCall('/api/settings/sudo', 'POST', { jid });
      if (res && res.success) { showToast('Added sudo user!', 'success'); input.value = ''; invalidateCache('/api/settings/sudo'); loadSudoUsers(); }
    } catch (err) { showToast(err.message || 'Failed to add sudo user', 'error'); }
  });
}

// ═══════════════════════════════════════════════════════════════════
// Real-Time Logs Terminal (SSE)
// ═══════════════════════════════════════════════════════════════════
function initLogStream() {
  const container = document.getElementById('terminal-log-container');
  if (!container) return;
  const token = getAuthToken();
  if (!token) return;
  if (logEventSource) logEventSource.close();
  loadRecentLogs();
  try {
    logEventSource = new EventSource(`/api/logs/stream?token=${encodeURIComponent(token)}`);
    logEventSource.onmessage = (event) => {
      if (isLogsPaused) return;
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'log' && payload.data) appendLogLine(payload.data);
      } catch (e) { console.error('Log parse error:', e); }
    };
    logEventSource.onerror = () => { console.warn('SSE Log Stream disconnected'); };
  } catch (e) { console.error('SSE initialization error:', e); }
}

async function loadRecentLogs() {
  const container = document.getElementById('terminal-log-container');
  if (!container) return;
  try {
    const data = await apiCall('/api/logs?limit=50');
    if (data && Array.isArray(data.logs)) { container.innerHTML = ''; data.logs.forEach(l => appendLogLine(l)); }
  } catch (err) { console.error('Failed to load recent logs:', err); }
}

function appendLogLine(log) {
  const container = document.getElementById('terminal-log-container');
  if (!container) return;
  const line = document.createElement('div');
  const level = (log.level || 'info').toLowerCase();
  line.className = `terminal-line log-${level}`;
  const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
  line.innerHTML = `<span class="text-slate-500">[${timeStr}]</span> <span class="font-bold uppercase">[${level}]</span> ${escapeHtml(log.message || '')}`;
  container.appendChild(line);
  while (container.childNodes.length > 300) container.removeChild(container.firstChild);
  if (!isLogsPaused) container.scrollTop = container.scrollHeight;
}

function setupLogControls() {
  const btnPause = document.getElementById('btn-pause-logs');
  const btnClear = document.getElementById('btn-clear-logs');
  if (btnPause) btnPause.addEventListener('click', () => {
    isLogsPaused = !isLogsPaused;
    btnPause.innerHTML = isLogsPaused ? '<i class="fas fa-play"></i> <span>Resume</span>' : '<i class="fas fa-pause"></i> <span>Pause</span>';
    if (isLogsPaused) btnPause.classList.add('bg-amber-600/30', 'text-amber-300');
    else btnPause.classList.remove('bg-amber-600/30', 'text-amber-300');
  });
  if (btnClear) btnClear.addEventListener('click', () => {
    const container = document.getElementById('terminal-log-container');
    if (container) container.innerHTML = '<div class="text-slate-500 text-xs italic">[Logs cleared]</div>';
  });
}

// ═══════════════════════════════════════════════════════════════════
// Section / Tab Router & Navigation (lazy loads tab data)
// ═══════════════════════════════════════════════════════════════════
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.content-section');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileSidebarClose = document.getElementById('mobile-sidebar-close');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  function activateSection(secId) {
    sections.forEach(sec => { if (sec.id === secId) sec.classList.remove('hidden'); else sec.classList.add('hidden'); });
    navLinks.forEach(link => {
      if (link.getAttribute('data-section') === secId) {
        link.className = 'nav-link active flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-white bg-purple-600/20 border border-purple-500/30 shadow-sm';
      } else {
        link.className = 'nav-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all';
      }
    });

    // Lazy load data per tab (with caching — won't re-fetch if already loaded)
    if (secId === 'sec-commands' && !commandsLoaded) loadCommands();
    if (secId === 'sec-settings' && !settingsLoaded) loadBotSettings();
    if (secId === 'sec-ai') loadAISettings();
    if (secId === 'sec-group') loadGroupSettings();
    if (secId === 'sec-welcome') loadWelcomeSettings();
    if (secId === 'sec-sticker') loadStickerSettings();
    if (secId === 'sec-variables') loadVariables();
    if (secId === 'sec-sudo') loadSudoUsers();
    if (secId === 'sec-logs') initLogStream();
  }

  navLinks.forEach(link => link.addEventListener('click', (e) => {
    e.preventDefault();
    const secId = link.getAttribute('data-section');
    if (secId) activateSection(secId);
  }));

  if (mobileMenuBtn && sidebar && backdrop) mobileMenuBtn.addEventListener('click', () => { sidebar.classList.remove('-translate-x-full'); backdrop.classList.remove('hidden'); });
  if (mobileSidebarClose && sidebar && backdrop) mobileSidebarClose.addEventListener('click', () => { sidebar.classList.add('-translate-x-full'); backdrop.classList.add('hidden'); });
  if (backdrop && sidebar) backdrop.addEventListener('click', () => { sidebar.classList.add('-translate-x-full'); backdrop.classList.add('hidden'); });

  const hash = window.location.hash.replace('#', '');
  if (hash) { const candidateId = `sec-${hash}`; if (document.getElementById(candidateId)) { activateSection(candidateId); return; } }
  activateSection('sec-overview');
}

// ═══════════════════════════════════════════════════════════════════
// Application Entry Point
// ═══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupBotControlButtons();
  setupWhatsAppTab();
  setupCommandsFilters();
  setupSettingsForm();
  setupAIForm();
  setupAntiFeatures();
  setupGroupSettings();
  setupWelcomeForm();
  setupStickerForm();
  setupVariablesForm();
  setupSudoForm();
  setupLogControls();

  // Real-time status via SSE (replaces 15s polling)
  startStatusSSE();

  // System metrics: 30s polling (non-blocking, cached)
  startSystemPolling();
});
