(function() {
  'use strict';
  window.ComfortKit = window.ComfortKit || {};
  
  ComfortKit.highlight = function(selector, color) {
    const elements = document.querySelectorAll(selector);
    const highlightColor = color || '#4CAF50';
    elements.forEach((element, index) => {
      element.style.outline = '2px solid ' + highlightColor;
      element.style.outlineOffset = '2px';
      element.dataset.comfortKitHighlight = index.toString();
    });
    return elements.length;
  };
  
  ComfortKit.clearHighlights = function() {
    document.querySelectorAll('[data-comfort-kit-highlight]').forEach((element) => {
      element.style.outline = '';
      element.style.outlineOffset = '';
      delete element.dataset.comfortKitHighlight;
    });
  };
  
  ComfortKit.getPageInfo = function() {
    return { url: window.location.href, title: document.title, domain: window.location.hostname, links: document.querySelectorAll('a').length, images: document.querySelectorAll('img').length, forms: document.querySelectorAll('form').length };
  };
  
  ComfortKit.copyText = async function(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const textarea = document.createElement('textarea'); textarea.value = text; textarea.style.position = 'fixed'; document.body.appendChild(textarea); textarea.select(); const success = document.execCommand('copy'); document.body.removeChild(textarea); return success;
    }
  };
  
  ComfortKit.showToast = function(message, duration) {
    const existing = document.getElementById('comfort-kit-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'comfort-kit-toast'; toast.textContent = message;
    toast.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 12px 24px; border-radius: 8px; font-family: sans-serif; font-size: 14px; z-index: 2147483647;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration || 3000);
  };
})();
