/**
 * MyProxy Frontend - Main Application Logic
 * Handles URL input, iframe routing, and user interactions
 */

// Get DOM elements
const proxyForm = document.getElementById('proxyForm');
const urlInput = document.getElementById('urlInput');
const proxyFrame = document.getElementById('proxyFrame');
const loadingState = document.getElementById('loadingState');
const viewerStatus = document.getElementById('viewerStatus');
const viewerURL = document.getElementById('viewerURL');
const refreshBtn = document.getElementById('refreshBtn');
const stopBtn = document.getElementById('stopBtn');
const searchBtns = document.querySelectorAll('.search-btn');

// Track current URL
let currentURL = null;

/**
 * Sanitize URL for display
 * @param {string} url - URL to sanitize
 * @returns {string} - Display-friendly URL
 */
function sanitizeDisplayURL(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
}

/**
 * Show loading state
 */
function showLoading() {
  loadingState.classList.remove('hidden');
  viewerStatus.textContent = 'Loading...';
  viewerURL.textContent = '';
}

/**
 * Hide loading state
 */
function hideLoading() {
  loadingState.classList.add('hidden');
  viewerStatus.textContent = 'Ready';
}

/**
 * Load URL through proxy
 * @param {string} url - URL to proxy
 */
function loadURL(url) {
  if (!url || url.trim() === '') {
    alert('Please enter a valid URL');
    return;
  }

  // Sanitize URL
  let sanitized = url.trim();
  
  // Add protocol if missing
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    sanitized = 'https://' + sanitized;
  }

  // Update state
  currentURL = sanitized;
  showLoading();
  
  // Encode URL for query parameter
  const encodedURL = encodeURIComponent(sanitized);
  
  // Set iframe src to proxy endpoint
  const proxyURL = `/proxy?url=${encodedURL}`;
  proxyFrame.src = proxyURL;

  // Update display
  viewerURL.textContent = sanitizeDisplayURL(sanitized);
  
  console.log(`[Frontend] Loading: ${sanitized}`);
}

/**
 * Perform search
 * @param {string} query - Search query
 * @param {string} engine - Search engine (google, duckduckgo, bing, brave)
 */
function performSearch(query, engine = 'google') {
  if (!query || query.trim() === '') {
    alert('Please enter a search query');
    return;
  }

  showLoading();
  
  const encodedQuery = encodeURIComponent(query.trim());
  const searchURL = `/search?q=${encodedQuery}&engine=${engine}`;
  
  proxyFrame.src = searchURL;
  viewerStatus.textContent = `Searching on ${engine}...`;
  
  console.log(`[Frontend] Search: ${query} (engine: ${engine})`);
}

/**
 * Handle form submission
 */
proxyForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loadURL(urlInput.value);
});

/**
 * Handle search button clicks
 */
searchBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const engine = btn.getAttribute('data-engine');
    performSearch(urlInput.value, engine);
  });
});

/**
 * Refresh button
 */
refreshBtn.addEventListener('click', () => {
  if (currentURL) {
    loadURL(currentURL);
  } else {
    alert('No URL loaded yet');
  }
});

/**
 * Stop button
 */
stopBtn.addEventListener('click', () => {
  proxyFrame.src = 'about:blank';
  hideLoading();
  viewerStatus.textContent = 'Stopped';
});

/**
 * Handle iframe load events
 */
proxyFrame.addEventListener('load', () => {
  hideLoading();
  console.log('[Frontend] Page loaded successfully');
});

proxyFrame.addEventListener('error', () => {
  hideLoading();
  viewerStatus.textContent = 'Load failed';
  console.error('[Frontend] Failed to load page');
});

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + L - Focus URL bar
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
    e.preventDefault();
    urlInput.focus();
    urlInput.select();
  }
  
  // Ctrl/Cmd + R - Refresh
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    refreshBtn.click();
  }
});

/**
 * Modal functions
 */
function showHelp() {
  document.getElementById('helpModal').classList.remove('hidden');
}

function showAbout() {
  document.getElementById('aboutModal').classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.add('hidden');
  }
});

/**
 * Focus URL input on load
 */
window.addEventListener('load', () => {
  urlInput.focus();
  console.log('[Frontend] MyProxy ready');
  console.log('[Keyboard Shortcuts]');
  console.log('  Ctrl+L / Cmd+L - Focus URL bar');
  console.log('  Ctrl+R / Cmd+R - Refresh');
});

/**
 * Auto-focus URL input if user starts typing
 */
document.addEventListener('keypress', (e) => {
  if (document.activeElement !== urlInput && e.key.match(/[a-zA-Z0-9.]/)) {
    urlInput.focus();
  }
});

console.log('%c MyProxy Frontend Loaded', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('Version: 1.0.0');
console.log('Proxy Backend: Ready on /proxy');
