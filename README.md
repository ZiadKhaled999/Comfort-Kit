# Comfort Kit - Chrome Extension

A comprehensive Chrome/Chromium browser extension designed for enhanced web experience and productivity.

## Features

- **Content Script Injection**: Automatically inject scripts into all web pages
- **Web Request Interception**: Advanced request handling with declarativeNetRequest
- **Context Menu Integration**: Quick actions via right-click menu
- **Custom New Tab Page**: Enhanced new tab experience
- **Side Panel Support**: Quick access panel for common actions
- **Full Internationalization**: Multi-language support
- **Cross-Browser Compatibility**: Works on Chrome, Edge, Brave, Opera, Vivaldi

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the Comfort Kit extension directory

## Files

- `manifest.json` - Main extension manifest (Manifest V3)
- `background.js` - Background service worker
- `content.js` - Content script for page injection
- `popup.html` / `popup.js` - Extension popup UI
- `options.html` / `options.js` - Settings page
- `sidepanel.html` / `sidepanel.js` - Side panel
- `newtab.html` - Custom new tab page
- `rules.json` - declarativeNetRequest rules
- `inject.js` / `inject.css` - Injectable utilities
- `_locales/` - Internationalization files

## Permissions

The extension requests the following permissions:

- `activeTab`, `tabs`, `scripting` - Tab and script management
- `storage` - Settings persistence
- `contextMenus` - Right-click menu
- `webNavigation`, `webRequest` - Navigation and request handling
- `declarativeNetRequest` - Request interception (Manifest V3)
- `cookies` - Cookie management
- `notifications` - Browser notifications
- `host_permissions: <all_urls>` - Access to all websites

## Development

### Testing

1. Load the extension in developer mode
2. Open the background page (chrome://extensions → Service worker link)
3. Check the console for logs

### Building

1. No build process required - uses pure JavaScript
2. Ensure all files are properly referenced in manifest.json

## Compatibility

- Chrome 100+
- Edge 100+
- Brave 1.40+
- Opera 85+
- Vivaldi 5.0+
- Any Chromium-based browser

## License

MIT License

## Author

Developer - developer@example.com
