/**
 * Comfort Kit - Content Script
 * 
 * This file handles text selection and displays the floating toolbar
 * similar to the original index.html functionality.
 */

(function() {
    'use strict';

    // State
    let state = {
        config: { openrouterKey: "", model: "xiaomi/mimo-v2-flash:free", isDark: false },
        tools: [
            { id: 'summarize', label: 'Summarize', icon: 'auto_awesome', active: true, group: 'ai', color: 'text-amber-400' },
            { id: 'explain', label: 'Deep Explain', icon: 'psychology', active: true, group: 'ai', color: 'text-indigo-400' },
            { id: 'wiki', label: 'Wikipedia', icon: 'menu_book', active: true, group: 'search', color: 'text-sky-400' },
            { id: 'copy', label: 'Smart Copy', icon: 'content_copy', active: true, group: 'util', color: 'text-emerald-400' }
        ]
    };

    let selectedText = "";
    let popupElement = null;

    // Initialize
    async function init() {
        // Load settings
        try {
            const saved = await chrome.storage.local.get('mimo_research_v3');
            if (saved.mimo_research_v3) {
                state = JSON.parse(saved.mimo_research_v3);
            }
        } catch (error) {
            console.error('[Comfort Kit] Error loading settings:', error);
        }

        // Create and inject the popup element
        createPopupElement();
        
        // Set up selection listener
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('mousedown', handleMouseDown);
        
        console.log('[Comfort Kit] Content script initialized');
    }

    // Create floating popup element
    function createPopupElement() {
        if (popupElement) return;

        popupElement = document.createElement('div');
        popupElement.id = 'comfort-kit-selection-popup';
        popupElement.className = 'fixed hidden animate-pop z-[99999]';
        popupElement.innerHTML = `
            <div id="comfort-kit-menu-bar" class="glass rounded-full shadow-2xl flex items-center px-2 py-1.5 text-white">
                <div class="flex items-center px-1 cursor-grab active:cursor-grabbing mr-1">
                    <span class="material-symbols-outlined text-slate-400 text-lg">drag_indicator</span>
                </div>
                <div id="comfort-kit-tool-container" class="flex items-center"></div>
                <div class="flex items-center gap-1 px-1 border-l border-white/10 ml-1 pl-2">
                    <button onclick="window.comfortKitToggleSettings()" class="p-2 rounded-full hover:bg-white/10 transition-all active:scale-90">
                        <span class="material-symbols-outlined text-[20px] text-slate-300">tune</span>
                    </button>
                    <button onclick="window.comfortKitHidePopup()" class="p-2 rounded-full text-slate-400 hover:text-white hover:bg-red-500/80 transition-all active:scale-90 ml-1">
                        <span class="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>
            <div class="flex justify-center mt-1">
                <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-900/90"></div>
            </div>
        `;

        // Inject Material Symbols font
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        // Inject styles
        const style = document.createElement('style');
        style.textContent = `
            .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; display: inline-block; vertical-align: middle; }
            .tool-tip { visibility: hidden; opacity: 0; transition: opacity 0.2s ease, transform 0.2s ease; transform: translateY(5px); pointer-events: none; }
            .comfort-kit-group:hover .tool-tip { visibility: visible; opacity: 1; transform: translateY(0); }
            @keyframes comfortKitPopIn { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
            .animate-pop { animation: comfortKitPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            .glass { background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
        `;
        document.head.appendChild(style);

        document.body.appendChild(popupElement);

        // Global functions for button clicks
        window.comfortKitHidePopup = hidePopup;
        window.comfortKitToggleSettings = toggleSettings;
        window.comfortKitHandleAction = handleAction;

        renderMenuBar();
    }

    // Render menu bar tools
    function renderMenuBar() {
        const toolContainer = document.getElementById('comfort-kit-tool-container');
        if (!toolContainer) return;

        let html = '';
        let currentGroup = '';
        state.tools.filter(t => t.active).forEach(tool => {
            if (currentGroup && currentGroup !== tool.group) html += '<div class="w-px h-4 bg-white/10 mx-1"></div>';
            currentGroup = tool.group;
            html += `
                <div class="relative comfort-kit-group">
                    <button onclick="window.comfortKitHandleAction('${tool.id}')" class="p-2.5 rounded-full hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[22px] ${tool.color}">${tool.icon}</span>
                    </button>
                    <div class="tool-tip absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap uppercase tracking-widest shadow-xl border border-white/10">
                        ${tool.label}
                    </div>
                </div>`;
        });
        toolContainer.innerHTML = html;
    }

    // Handle text selection
    function handleSelection(e) {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        // Check if clicked inside popup
        if (popupElement && (popupElement.contains(e.target) || e.target.closest('#comfort-kit-menu-bar'))) {
            return;
        }

        if (text.length > 0) {
            selectedText = text;
            
            // Store selected text for popup to access
            chrome.storage.local.set({ selectedText: text });
            
            showPopup(e);
        } else if (!popupElement || !popupElement.contains(e.target)) {
            hidePopup();
        }
    }

    // Handle mouse down
    function handleMouseDown(e) {
        if (popupElement && !popupElement.contains(e.target)) {
            const selection = window.getSelection();
            if (!selection.toString().trim()) {
                hidePopup();
            }
        }
    }

    // Show popup at position
    function showPopup(e) {
        if (!popupElement) return;
        
        popupElement.classList.remove('hidden');
        
        let x = e.clientX - (popupElement.offsetWidth / 2);
        let y = e.clientY - 95;
        
        // Keep within viewport
        x = Math.max(10, Math.min(x, window.innerWidth - popupElement.offsetWidth - 10));
        y = Math.max(10, y);
        
        popupElement.style.left = `${x}px`;
        popupElement.style.top = `${y}px`;
    }

    // Hide popup
    function hidePopup() {
        if (popupElement) {
            popupElement.classList.add('hidden');
        }
    }

    // Toggle settings
    function toggleSettings() {
        hidePopup();
        chrome.runtime.openOptionsPage ? chrome.runtime.openOptionsPage() : window.open('options.html');
    }

    // Handle tool action
    async function handleAction(id) {
        hidePopup();
        
        // Store selected text
        await chrome.storage.local.set({ selectedText: selectedText });
        
        // Track selection count
        const result = await chrome.storage.local.get('selectionCount');
        let count = result.selectionCount || 0;
        await chrome.storage.local.set({ selectionCount: count + 1 });

        if (id === 'copy') {
            try {
                await navigator.clipboard.writeText(selectedText);
                showNotification('Copied to clipboard!');
            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = selectedText;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Copied to clipboard!');
            }
            return;
        }

        // Open sidepanel or trigger action
        if (chrome.sidePanel) {
            chrome.sidePanel.open();
        }
        
        // Send message to background to handle the action
        chrome.runtime.sendMessage({
            action: 'handleToolAction',
            toolId: id,
            text: selectedText,
            config: state.config
        });
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl animate-pop z-[100000]';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, 20px)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Listen for settings updates
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'updateState') {
            state = message.state;
            renderMenuBar();
        }
        return false;
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
