/**
 * Comfort Kit - Background Service Worker
 * 
 * This file handles background tasks, event listeners, and coordination
 * between different parts of the extension.
 * 
 * Handles tool actions: Wikipedia search, OpenRouter API calls
 */

// Extension state management
const extensionState = {
    isEnabled: true,
    settings: {},
    lastUpdated: null
};

/**
 * Initialize the background service worker
 */
async function initializeBackground() {
    console.log('[Comfort Kit] Background service worker initializing...');
    
    // Load saved settings from storage
    try {
        const storedSettings = await chrome.storage.local.get('mimo_research_v3');
        if (storedSettings.mimo_research_v3) {
            extensionState.settings = JSON.parse(storedSettings.mimo_research_v3);
        }
    } catch (error) {
        console.error('[Comfort Kit] Error loading settings:', error);
        extensionState.settings = {};
    }
    
    // Set up context menus
    setupContextMenus();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('[Comfort Kit] Background service worker initialized');
}

/**
 * Set up context menu items
 */
function setupContextMenus() {
    // Remove existing menus first
    chrome.contextMenus.removeAll();
    
    // Create main context menu item
    chrome.contextMenus.create({
        id: 'comfort-kit-main',
        title: 'Comfort Zone',
        contexts: ['selection']
    });
    
    // Tool sub-items
    chrome.contextMenus.create({
        id: 'comfort-summarize',
        parentId: 'comfort-kit-main',
        title: 'Summarize',
        contexts: ['selection']
    });
    
    chrome.contextMenus.create({
        id: 'comfort-explain',
        parentId: 'comfort-kit-main',
        title: 'Deep Explain',
        contexts: ['selection']
    });
    
    chrome.contextMenus.create({
        id: 'comfort-wiki',
        parentId: 'comfort-kit-main',
        title: 'Wikipedia Search',
        contexts: ['selection']
    });
    
    chrome.contextMenus.create({
        id: 'comfort-copy',
        parentId: 'comfort-kit-main',
        title: 'Copy Text',
        contexts: ['selection']
    });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Context menu click handler
    chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
    
    // Tab update handler
    chrome.tabs.onUpdated.addListener(handleTabUpdate);
    
    // Tab activation handler
    chrome.tabs.onActivated.addListener(handleTabActivation);
    
    // Extension installation handler
    chrome.runtime.onInstalled.addListener(handleInstallation);
    
    // Extension startup handler
    chrome.runtime.onStartup.addListener(handleStartup);
    
    // Message passing handler
    chrome.runtime.onMessage.addListener(handleMessage);
}

/**
 * Handle context menu item clicks
 */
async function handleContextMenuClick(info, tab) {
    console.log('[Comfort Kit] Context menu clicked:', info.menuItemId);
    
    const toolId = info.menuItemId.replace('comfort-', '');
    
    if (info.selectionText) {
        await handleToolAction(toolId, info.selectionText, tab?.id);
    }
}

/**
 * Handle tool action from content script or context menu
 */
async function handleToolAction(toolId, text, tabId) {
    console.log('[Comfort Kit] Handling tool action:', toolId);
    
    // Get settings
    const stored = await chrome.storage.local.get('mimo_research_v3');
    const state = stored.mimo_research_v3 ? JSON.parse(stored.mimo_research_v3) : { config: {} };
    const config = state.config || {};
    
    if (toolId === 'copy') {
        // Copy to clipboard
        if (tabId) {
            await chrome.tabs.sendMessage(tabId, {
                action: 'showNotification',
                message: 'Copied to clipboard!'
            });
        }
        return;
    }
    
    if (toolId === 'wiki') {
        // Wikipedia search
        await handleWikipediaSearch(text, tabId);
    } else {
        // OpenRouter API call (summarize, explain)
        await handleOpenRouterAction(toolId, text, config, tabId);
    }
}

/**
 * Handle Wikipedia search
 */
async function handleWikipediaSearch(query, tabId) {
    try {
        // Search Wikipedia
        const searchResp = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=10&format=json&origin=*`);
        const searchData = await searchResp.json();
        const items = searchData.query?.search || [];
        
        if (items.length === 0) {
            if (tabId) {
                await chrome.tabs.sendMessage(tabId, {
                    action: 'showNotification',
                    message: 'No Wikipedia results found'
                });
            }
            return;
        }
        
        // Get page images
        const titles = items.map(i => i.title).join('|');
        const imgResp = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=pageimages&pithumbsize=400&format=json&origin=*`);
        const imgData = await imgResp.json();
        const pages = imgData.query?.pages || {};
        
        const results = items.map(item => {
            const pageEntry = Object.values(pages).find(p => p.title === item.title);
            return {
                title: item.title,
                snippet: item.snippet,
                image: pageEntry?.thumbnail?.source || null
            };
        });
        
        // Send results to content script
        if (tabId) {
            await chrome.tabs.sendMessage(tabId, {
                action: 'showWikiResults',
                results: results
            });
        }
    } catch (error) {
        console.error('[Comfort Kit] Wikipedia search error:', error);
        if (tabId) {
            await chrome.tabs.sendMessage(tabId, {
                action: 'showNotification',
                message: 'Wikipedia search failed'
            });
        }
    }
}

/**
 * Handle OpenRouter API action
 */
async function handleOpenRouterAction(action, text, config, tabId) {
    const apiKey = config.openrouterKey;
    
    if (!apiKey) {
        if (tabId) {
            await chrome.tabs.sendMessage(tabId, {
                action: 'showNotification',
                message: 'Please add your OpenRouter API key in settings'
            });
        }
        return;
    }
    
    try {
        const model = config.model || 'xiaomi/mimo-v2-flash:free';
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': chrome.runtime.getManifest().homepage_url || 'chrome-extension://' + chrome.runtime.id
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: `${action}: ${text}` }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const resultText = data.choices?.[0]?.message?.content || 'No response';
        
        if (tabId) {
            await chrome.tabs.sendMessage(tabId, {
                action: 'showAIResult',
                mode: action,
                text: resultText
            });
        }
    } catch (error) {
        console.error('[Comfort Kit] OpenRouter error:', error);
        if (tabId) {
            await chrome.tabs.sendMessage(tabId, {
                action: 'showNotification',
                message: `Error: ${error.message}`
            });
        }
    }
}

/**
 * Handle messages from content scripts
 */
async function handleMessage(message, sender, sendResponse) {
    console.log('[Comfort Kit] Message received:', message.action);
    
    switch (message.action) {
        case 'handleToolAction':
            await handleToolAction(message.toolId, message.text, sender.tab?.id);
            sendResponse({ success: true });
            break;
        case 'getSettings':
            const stored = await chrome.storage.local.get('mimo_research_v3');
            sendResponse({ settings: stored.mimo_research_v3 ? JSON.parse(stored.mimo_research_v3) : {} });
            break;
        case 'saveSettings':
            await chrome.storage.local.set({ mimo_research_v3: JSON.stringify(message.state) });
            sendResponse({ success: true });
            break;
        default:
            console.log('[Comfort Kit] Unknown message:', message.action);
            sendResponse({ error: 'Unknown action' });
    }
    
    return true;
}

/**
 * Handle tab updates
 */
function handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        extensionState.lastUpdated = Date.now();
    }
}

/**
 * Handle tab activation
 */
function handleTabActivation(activeInfo) {
    updateExtensionBadge(activeInfo.tabId);
}

/**
 * Update the extension badge
 */
async function updateExtensionBadge(tabId) {
    try {
        chrome.action.setBadgeText({
            text: extensionState.isEnabled ? '' : 'OFF',
            tabId: tabId
        });
        chrome.action.setBadgeBackgroundColor({
            color: extensionState.isEnabled ? '#f94706' : '#f44336',
            tabId: tabId
        });
    } catch (error) {
        console.error('[Comfort Kit] Error updating badge:', error);
    }
}

/**
 * Handle extension installation
 */
async function handleInstallation(details) {
    console.log('[Comfort Kit] Extension installed:', details.reason);
    
    if (details.reason === 'install') {
        // Set default settings
        const defaultState = {
            config: { openrouterKey: "", model: "xiaomi/mimo-v2-flash:free", isDark: false },
            tools: [
                { id: 'summarize', label: 'Summarize', icon: 'auto_awesome', active: true, group: 'ai', color: 'text-amber-400' },
                { id: 'explain', label: 'Deep Explain', icon: 'psychology', active: true, group: 'ai', color: 'text-indigo-400' },
                { id: 'wiki', label: 'Wikipedia', icon: 'menu_book', active: true, group: 'search', color: 'text-sky-400' },
                { id: 'copy', label: 'Smart Copy', icon: 'content_copy', active: true, group: 'util', color: 'text-emerald-400' }
            ]
        };
        
        await chrome.storage.local.set({ mimo_research_v3: JSON.stringify(defaultState) });
        
        // Open options page
        chrome.tabs.create({ url: 'options.html' });
    }
}

/**
 * Handle browser startup
 */
function handleStartup() {
    initializeBackground();
}

// Initialize
initializeBackground();
