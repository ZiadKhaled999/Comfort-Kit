# 🛋️ Comfort Kit

**AI-Powered Browser Extension for Smarter Web Reading**

---

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=for-the-badge&logo=google-chrome" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Chrome-Extension-green?style=for-the-badge&logo=google-chrome" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/Version-1.0.0-orange?style=for-the-badge" alt="Version">
</p>

---

## ✨ What is Comfort Kit?

Comfort Kit is a powerful Chrome extension built with modern Manifest V3 standards that brings AI-powered tools directly to your browser. Whether you're researching, learning, or just browsing, Comfort Kit helps you interact with web content more efficiently—summarize articles, get explanations, search Wikipedia, and copy content intelligently.

Think of it as your personal reading assistant that lives right in your browser toolbar.

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **🧠 AI Summarization** | Get concise summaries of any web page content with a single click |
| **📖 Smart Explanations** | Complex concepts made simple—select text and get clear explanations |
| **🔍 Wikipedia Search** | Instant Wikipedia lookups without leaving your current page |
| **📋 Smart Copy** | Enhanced copy functionality with formatting preservation |
| **🎯 Floating Toolbar** | Quick-access toolbar that appears when you need it |
| **⚡ Quick Actions Popup** | Fast access to all features from the extension icon |
| **🎨 Customizable Settings** | Tailor the extension to your preferences |
| **🌍 Internationalized** | Full i18n support with English locale included |

---

## 📦 Installation

### Development Installation (Local)

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/yourusername/comfort-kit.git
   cd comfort-kit
Open Chrome and navigate to extensions

Visit chrome://extensions/ in your browser
Enable Developer Mode

Toggle the switch in the top-right corner
Load the unpacked extension

Click "Load unpacked"
Select the comfort-kit folder from your cloned repository
Start developing

Make changes to any file
The extension reloads automatically (or click the refresh icon)
Production Installation
📌 Coming soon to the Chrome Web Store!

For now, use the development installation method above.

📖 Usage Guide
Getting Started
Pin the extension to your browser toolbar for quick access
Click the Comfort Kit icon to open the popup with quick actions
Select text on any webpage to see the floating toolbar appear
Access settings via the extension popup or right-click context menu
Main Features
📝 Summarize Page
Click the extension icon → Select "Summarize" → Get an AI-generated summary of the page content

💡 Explain Selection
Select text on any webpage
Click "Explain" in the floating toolbar
Receive a clear, simple explanation of the selected content
📚 Wikipedia Search
Right-click any selection → Choose "Search on Wikipedia" → View relevant Wikipedia articles

🔄 Smart Copy
Select content and use the enhanced copy function for better formatting preservation

Customizing Settings
Click the gear icon ⚙️ in the extension popup
Adjust preferences:
Toolbar visibility
Keyboard shortcuts
AI model settings
Theme preferences
🏗️ Project Structure
comfort-kit/
├── 📄 manifest.json          # Manifest V3 configuration
├── 📄 background.js          # Service worker (event handling)
├── 📄 content.js             # Content script (page interaction)
├── 📄 content.css            # Content script styles
├── 📄 inject.js              # Injected script (extended functionality)
├── 📄 inject.css             # Injected styles
├── 📄 popup.html             # Extension popup UI
├── 📄 popup.js               # Popup logic
├── 📄 options.html           # Options page UI
├── 📄 options.js             # Options page logic
├── 📄 sidepanel.html         # Side panel UI
├── 📄 sidepanel.js           # Side panel logic
├── 📄 newtab.html            # Custom new tab page
├── 📄 rules.json             # Declarative Net Request rules
├── 📄 LICENSE                # MIT License
├── 📄 README.md              # This file
└── 📁 _locales/              # Internationalization files
    └── 📁 en/
        └── 📄 messages.json  # English translations
Architecture Highlights
Manifest V3: Modern Chrome extension platform with enhanced security
Service Worker: Handles background tasks and event processing
Content Scripts: Interact with web page DOM
Injected Scripts: Extended functionality with page context
i18n Support: Ready for multiple languages
🤝 Contributing
We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation.

How to Contribute
Fork the repository on GitHub
Create a feature branch
git checkout -b feature/amazing-new-feature
Make your changes and commit them
git commit -m 'Add amazing new feature'
Push to your branch
git push origin feature/amazing-new-feature
Open a Pull Request with a clear description
Contribution Guidelines
Follow the existing code style and patterns
Write clear, descriptive commit messages
Add comments for complex logic
Test your changes thoroughly
Update documentation as needed
Be respectful and constructive in discussions
Development Tips
Use Chrome's DevTools to debug content scripts and the service worker
The chrome.runtime.reload() function helps during development
Check chrome://extensions/ and enable "Allow in incognito" for testing
📄 License
This project is licensed under the MIT License—see the LICENSE file for details.

You are free to:

✅ Use this project commercially
✅ Modify and distribute the code
✅ Use in private or open-source projects
✅ Create derivative works
Under the condition that you include the original copyright notice.

🙏 Credits
Created with ❤️ by the Comfort Kit Team

Dependencies & Resources
Chrome Extension Documentation - Official MV3 guide
Chrome Web Store Policies - Distribution guidelines
Inspiration
Thanks to the Chrome extension developer community for their excellent resources and examples that helped shape this project.

📞 Support & Contact
🐛 Report Issues: GitHub Issues
💬 Feature Requests: Discussions
📧 Questions: reach out via GitHub
<p align="center"> <strong>Made with 🛋️ for better web experiences</strong> </p> ```
Instructions:

Replace the entire contents of README.md with the markdown content provided above
Preserve all formatting, including tables, code blocks, and emoji icons
Ensure proper markdown syntax is maintained
This should be a complete replacement, not an addition