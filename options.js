/**
 * Comfort Kit - Options Page Script
 * 
 * This file handles the options page functionality for the Comfort Kit extension.
 * It manages all settings, data import/export, and user preferences.
 * 
 * Options Page Responsibilities:
 * - Load and display all settings
 * - Handle setting changes and save to storage
 * - Import/export settings as JSON
 * - Reset settings to defaults
 * - Clear all stored data
 */

// Default settings configuration
const defaultSettings = {
  // General
  enabled: true,
  notifications: true,
  analytics: false,
  
  // Appearance
  theme: 'system',
  language: 'en',
  
  // Content Script
  autoHighlight: false,
  tooltips: true,
  injectIntoIframes: true,
  
  // Advanced
  debugMode: false,
  customCss: '',
  blockedDomains: ''
};

// DOM Elements
const elements = {
  // Toggles
  enabledToggle: document.getElementById('enabledToggle'),
  notificationsToggle: document.getElementById('notificationsToggle'),
  analyticsToggle: document.getElementById('analyticsToggle'),
  autoHighlightToggle: document.getElementById('autoHighlightToggle'),
  tooltipsToggle: document.getElementById('tooltipsToggle'),
  iframeToggle: document.getElementById('iframeToggle'),
  debugToggle: document.getElementById('debugToggle'),
  
  // Selects
  themeSelect: document.getElementById('themeSelect'),
  languageSelect: document.getElementById('languageSelect'),
  
  // Inputs
  customCssInput: document.getElementById('customCssInput'),
  blockedDomainsInput: document.getElementById('blockedDomainsInput'),
  
  // Buttons
  saveBtn: document.getElementById('saveBtn'),
  resetBtn: document.getElementById('resetBtn'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  clearDataBtn: document.getElementById('clearDataBtn'),
  importFile: document.getElementById('importFile'),
  
  // Status
  statusMessage: document.getElementById('statusMessage')
};

// Current settings state
let currentSettings = {};

/**
 * Initialize the options page
 */
async function initializeOptions() {
  console.log('[Comfort Kit] Options page initializing...');
  
  // Load settings from storage
  await loadSettings();
  
  // Set up event listeners
  setupEventListeners();
  
  console.log('[Comfort Kit] Options page initialized');
}

/**
 * Load settings from Chrome storage
 */
async function loadSettings() {
  try {
    const stored = await chrome.storage.sync.get(null);
    currentSettings = { ...defaultSettings, ...stored };
    
    // Apply settings to UI
    applySettingsToUI();
    
    console.log('[Comfort Kit] Settings loaded:', currentSettings);
  } catch (error) {
    console.error('[Comfort Kit] Error loading settings:', error);
    showStatus('Error loading settings', 'error');
  }
}

/**
 * Apply loaded settings to UI elements
 */
function applySettingsToUI() {
  // General toggles
  elements.enabledToggle.checked = currentSettings.enabled;
  elements.notificationsToggle.checked = currentSettings.notifications;
  elements.analyticsToggle.checked = currentSettings.analytics;
  
  // Appearance selects
  elements.themeSelect.value = currentSettings.theme;
  elements.languageSelect.value = currentSettings.language;
  
  // Content script toggles
  elements.autoHighlightToggle.checked = currentSettings.autoHighlight;
  elements.tooltipsToggle.checked = currentSettings.tooltips;
  elements.iframeToggle.checked = currentSettings.injectIntoIframes;
  
  // Advanced toggles
  elements.debugToggle.checked = currentSettings.debugMode;
  
  // Advanced inputs
  elements.customCssInput.value = currentSettings.customCss || '';
  elements.blockedDomainsInput.value = currentSettings.blockedDomains || '';
}

/**
 * Collect settings from UI elements
 */
function collectSettingsFromUI() {
  return {
    // General
    enabled: elements.enabledToggle.checked,
    notifications: elements.notificationsToggle.checked,
    analytics: elements.analyticsToggle.checked,
    
    // Appearance
    theme: elements.themeSelect.value,
    language: elements.languageSelect.value,
    
    // Content Script
    autoHighlight: elements.autoHighlightToggle.checked,
    tooltips: elements.tooltipsToggle.checked,
    injectIntoIframes: elements.iframeToggle.checked,
    
    // Advanced
    debugMode: elements.debugToggle.checked,
    customCss: elements.customCssInput.value.trim(),
    blockedDomains: elements.blockedDomainsInput.value.trim()
  };
}

/**
 * Set up event listeners for all interactive elements
 */
function setupEventListeners() {
  // Save button
  elements.saveBtn.addEventListener('click', handleSave);
  
  // Reset button
  elements.resetBtn.addEventListener('click', handleReset);
  
  // Export button
  elements.exportBtn.addEventListener('click', handleExport);
  
  // Import button
  elements.importBtn.addEventListener('click', () => {
    elements.importFile.click();
  });
  
  // Import file input change
  elements.importFile.addEventListener('change', handleImport);
  
  // Clear data button
  elements.clearDataBtn.addEventListener('click', handleClearData);
  
  // Auto-save on toggle changes (optional - can be removed if not desired)
  const toggles = [
    elements.enabledToggle,
    elements.notificationsToggle,
    elements.analyticsToggle,
    elements.autoHighlightToggle,
    elements.tooltipsToggle,
    elements.iframeToggle,
    elements.debugToggle
  ];
  
  toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      // Show unsaved indicator
      elements.saveBtn.textContent = 'Save Changes*';
      elements.saveBtn.classList.add('btn-primary');
    });
  });
  
  // Input change handlers
  const inputs = [
    elements.themeSelect,
    elements.languageSelect,
    elements.customCssInput,
    elements.blockedDomainsInput
  ];
  
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      elements.saveBtn.textContent = 'Save Changes*';
    });
  });
}

/**
 * Handle save button click
 */
async function handleSave() {
  const settings = collectSettingsFromUI();
  
  try {
    await chrome.storage.sync.set(settings);
    currentSettings = settings;
    
    // Notify background script of settings change
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        data: settings
      });
    } catch (error) {
      console.log('[Comfort Kit] Could not notify background script');
    }
    
    elements.saveBtn.textContent = 'Save Changes';
    showStatus('Settings saved successfully!', 'success');
    
    console.log('[Comfort Kit] Settings saved:', settings);
  } catch (error) {
    console.error('[Comfort Kit] Error saving settings:', error);
    showStatus('Error saving settings', 'error');
  }
}

/**
 * Handle reset to defaults
 */
async function handleReset() {
  if (!confirm('Are you sure you want to reset all settings to their default values?')) {
    return;
  }
  
  try {
    await chrome.storage.sync.clear();
    await chrome.storage.sync.set(defaultSettings);
    currentSettings = { ...defaultSettings };
    
    applySettingsToUI();
    showStatus('Settings reset to defaults', 'success');
    
    console.log('[Comfort Kit] Settings reset to defaults');
  } catch (error) {
    console.error('[Comfort Kit] Error resetting settings:', error);
    showStatus('Error resetting settings', 'error');
  }
}

/**
 * Handle export settings
 */
function handleExport() {
  const settings = collectSettingsFromUI();
  const exportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    settings: settings
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `comfort-kit-settings-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showStatus('Settings exported successfully', 'success');
  console.log('[Comfort Kit] Settings exported');
}

/**
 * Handle import settings
 */
async function handleImport(event) {
  const file = event.target.files[0];
  
  if (!file) {
    return;
  }
  
  try {
    const text = await file.text();
    const importData = JSON.parse(text);
    
    if (!importData.settings) {
      throw new Error('Invalid import file format');
    }
    
    // Validate and sanitize settings
    const sanitizedSettings = sanitizeSettings(importData.settings);
    
    // Apply settings
    await chrome.storage.sync.set(sanitizedSettings);
    currentSettings = { ...defaultSettings, ...sanitizedSettings };
    
    applySettingsToUI();
    showStatus('Settings imported successfully', 'success');
    
    console.log('[Comfort Kit] Settings imported:', sanitizedSettings);
  } catch (error) {
    console.error('[Comfort Kit] Error importing settings:', error);
    showStatus('Error importing settings: Invalid file format', 'error');
  }
  
  // Clear file input
  event.target.value = '';
}

/**
 * Sanitize imported settings
 * @param {Object} settings - Imported settings object
 * @returns {Object} Sanitized settings
 */
function sanitizeSettings(settings) {
  const sanitized = {};
  
  // Only include known settings
  const knownSettings = [
    'enabled', 'notifications', 'analytics',
    'theme', 'language',
    'autoHighlight', 'tooltips', 'injectIntoIframes',
    'debugMode', 'customCss', 'blockedDomains'
  ];
  
  knownSettings.forEach(key => {
    if (key in settings) {
      // Type validation
      if (typeof defaultSettings[key] === 'boolean') {
        sanitized[key] = Boolean(settings[key]);
      } else if (typeof defaultSettings[key] === 'string') {
        sanitized[key] = String(settings[key] || '');
      } else {
        sanitized[key] = settings[key];
      }
    }
  });
  
  return sanitized;
}

/**
 * Handle clear all data
 */
async function handleClearData() {
  if (!confirm('Are you sure you want to clear ALL data? This will remove:\n\n- All settings\n- All statistics\n- All cached data\n\nThis action CANNOT be undone!')) {
    return;
  }
  
  // Double confirmation
  if (!confirm('Final confirmation: Type "DELETE" to confirm, or click Cancel.')) {
    return;
  }
  
  try {
    // Clear all storage
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
    
    // Reset to defaults
    currentSettings = { ...defaultSettings };
    applySettingsToUI();
    
    showStatus('All data has been cleared', 'success');
    console.log('[Comfort Kit] All data cleared');
  } catch (error) {
    console.error('[Comfort Kit] Error clearing data:', error);
    showStatus('Error clearing data', 'error');
  }
}

/**
 * Show status message
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success' or 'error')
 */
function showStatus(message, type) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = `status-message ${type}`;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    elements.statusMessage.className = 'status-message';
  }, 3000);
}

// Initialize options page when DOM is ready
document.addEventListener('DOMContentLoaded', initializeOptions);
