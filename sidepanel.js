async function initializeSidePanel() {
  await loadPageStats();
  setupScrollTracking();
  setupEventListeners();
}

async function loadPageStats() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: function() { return { links: document.querySelectorAll('a').length, images: document.querySelectorAll('img').length, forms: document.querySelectorAll('form').length }; }
      });
      if (results && results[0] && results[0].result) {
        const stats = results[0].result;
        document.getElementById('linksCount').textContent = stats.links;
        document.getElementById('imagesCount').textContent = stats.images;
        document.getElementById('formsCount').textContent = stats.forms;
      }
    }
  } catch (error) { console.error('Error:', error); }
}

function setupScrollTracking() {
  function updateScrollDepth() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    document.getElementById('scrollDepth').textContent = Math.min(100, Math.max(0, scrollPercent)) + '%';
  }
  window.addEventListener('scroll', updateScrollDepth, { passive: true });
  updateScrollDepth();
}

function setupEventListeners() {
  document.getElementById('highlightLinks').addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
        await chrome.tabs.sendMessage(tab.id, { action: 'highlightElements', selector: 'a' });
      }
    } catch (error) { console.error('Error:', error); }
  });
  document.getElementById('openOptions').addEventListener('click', () => chrome.runtime.openOptionsPage());
}

document.addEventListener('DOMContentLoaded', initializeSidePanel);
