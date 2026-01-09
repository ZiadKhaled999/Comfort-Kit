/**
 * Comfort Kit - Popup Script
 * 
 * This file handles the popup UI interactions for the Comfort Kit extension.
 * It manages user settings, quick actions, and displays extension status.
 * 
 * Popup Script Responsibilities:
 * - Load and display current settings
 * - Handle user interactions with toggle switches and buttons
 * - Communicate with background script
 * - Update UI based on current state
 */

// DOM Elements
const elements = {
  statusBadge: document.getElementById('statusBadge'),
  statusText: document.getElementById('statusText'),
  enabledToggle: document.getElementById('enabledToggle'),
  notificationsToggle: document.getElementById('notificationsToggle'),
  action1: document.getElementById('action1'),
  action2: document.getElementById('action2'),
  optionsLink: document.getElementById('optionsLink'),
  refreshButton: document.getElementById('refreshButton'),
  pagesVisited: document.getElementById('pagesVisited'),
  linksFound: document.getElementById('linksFound'),
  actionsRun: document.getElementById('actionsRun'),
  extTitle: document.getElementById('extTitle')
};

// Session statistics
let sessionStats = {
  pages: 0,
  links: 0,
  actions: 0
};

/**
 * Initialize the popup
 */
async function initializePopup() {
  console.log('[Comfort Kit] Popup initializing...');
  
  // Load settings from storage
  await loadSettings();
  
  // Load session statistics
  await loadSessionStats();
  
  // Set up event listeners
  setupEventListeners();
  
  // Get current tab information
  await updateCurrentTabInfo();
  
  console.log('[Comfort Kit] Popup initialized');
}

/**
 * Load settings from Chrome storage
 */
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get(null);
    
    // Update toggle states
    elements.enabledToggle.checked = settings.enabled !== false;
    elements.notificationsToggle.checked = settings.notifications !== false;
    
    // Update status badge
    updateStatusBadge(settings.enabled !== false);
    
    console.log('[Comfort Kit] Settings loaded:', settings);
  } catch (error) {
    console.error('[Comfort Kit] Error loading settings:', error);
  }
}

/**
 * Load session statistics from storage
 */
async function loadSessionStats() {
  try {
    const stats = await chrome.storage.local.get('sessionStats');
    if (stats.sessionStats) {
      sessionStats = stats.sessionStats;
      updateStatsDisplay();
    }
  } catch (error) {
    console.error('[Comfort Kit] Error loading stats:', error);
  }
}

/**
 * Update session statistics display
 */
function updateStatsDisplay() {
  elements.pagesVisited.textContent = sessionStats.pages;
  elements.linksFound.textContent = sessionStats.links;
  elements.actionsRun.textContent = sessionStats.actions;
}

/**
 * Update status badge based on enabled state
 * @param {boolean} isEnabled - Whether the extension is enabled
 */
function updateStatusBadge(isEnabled) {
  if (isEnabled) {
    elements.statusBadge.className = 'status-badge enabled';
    elements.statusText.textContent = 'Enabled';
  } else {
    elements.statusBadge.className = 'status-badge disabled';
    elements.statusText.textContent = 'Disabled';
  }
}

/**
 * Get current tab information
 */
async function updateCurrentTabInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
      // Update page count
      sessionStats.pages++;
      updateStatsDisplay();
      
      // Save updated stats
      await chrome.storage.local.set({ sessionStats });
    }
  } catch (error) {
    console.error('[Comfort Kit] Error getting current tab:', error);
  }
}

/**
 * Set up event listeners for popup interactions
 */
function setupEventListeners() {
  // Enable toggle
  elements.enabledToggle.addEventListener('change', async () => {
    const isEnabled = elements.enabledToggle.checked;
    
    await chrome.storage.sync.set({ enabled: isEnabled });
    updateStatusBadge(isEnabled);
    
    // Send message to background script
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        data: { enabled: isEnabled }
      });
    } catch (error) {
      console.log('[Comfort Kit] Could not send message to background');
    }
    
    sessionStats.actions++;
    updateStatsDisplay();
    await saveSessionStats();
  });
  
  // Notifications toggle
  elements.notificationsToggle.addEventListener('change', async () => {
    const notificationsEnabled = elements.notificationsToggle.checked;
    
    await chrome.storage.sync.set({ notifications: notificationsEnabled });
    
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        data: { notifications: notificationsEnabled }
      });
    } catch (error) {
      console.log('[Comfort Kit] Could not send message to background');
    }
    
    sessionStats.actions++;
    updateStatsDisplay();
    await saveSessionStats();
  });
  
  // Quick action 1 - Highlight links
  elements.action1.addEventListener('click', async () => {
    await executeQuickAction('highlightLinks');
  });
  
  // Quick action 2 - Analyze page
  elements.action2.addEventListener('click', async () => {
    await executeQuickAction('analyzePage');
  });
  
  // Options link
  elements.optionsLink.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Refresh button
  elements.refreshButton.addEventListener('click', async () => {
    await loadSettings();
    await loadSessionStats();
    await updateCurrentTabInfo();
  });
}

/**
 * Save session statistics to storage
 */
async function saveSessionStats() {
  try {
    await chrome.storage.local.set({ sessionStats });
  } catch (error) {
    console.error('[Comfort Kit] Error saving stats:', error);
  }
}

/**
 * Execute a quick action
 * @param {string} action - The action to execute
 */
async function executeQuickAction(action) {
  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      console.error('[Comfort Kit] No active tab found');
      return;
    }
    
    // Inject content script if not already injected
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: action,
      timestamp: Date.now()
    });
    
    // Update action count
    sessionStats.actions++;
    updateStatsDisplay();
    await saveSessionStats();
    
    console.log('[Comfort Kit] Quick action executed:', action);
  } catch (error) {
    console.error('[Comfort Kit] Error executing quick action:', error);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', initializePopup);
