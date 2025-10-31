# DIPCP - Decentralized Intellectual Property Collaboration Platform

[中文说明](README_zh-CN.md)

## Project Introduction

DIPCP is a decentralized IP collaboration platform operated by the DIPCF Foundation and based on GitHub. It aims to provide content management and collaboration features for IP creators worldwide.
However, the value of this platform goes far beyond this. It has successfully explored a viable path for operating network projects with zero cost without the need to set up your own server. Those in need can modify it on this basis to create applications suitable for themselves.

## Core Features

- 🏠 **No Server Required**: Fully static JS pages, directly deployed on GitHub Pages, with zero operational costs
- 🔄 **GitHub Integration**: Based on GitHub's plain text storage and version management
- ✏️ **Offline Editing**: Supports offline editing and creating new pages
- 🌿 **Auto Branching**: Automatic branch creation, local caching, and submission review
- 👥 **Review Mechanism**: Professional content review team responsible for merge decisions
- 🏆 **Points System**: Contribution-based points reward mechanism
- 👤 **User Management**: Group authorization and permission control
- ⚡ **Native JavaScript**: Developed with native JS, simple and easy to debug

## Quick Start

### Requirements

- Python 3.6+ (for development server)
- Modern browser (Chrome, Firefox, Edge, etc.)
- Git (for version control)

### Start Development Environment

1. **Windows Users**:
   ```
   Double-click start-dev.bat
   ```

2. **Access Application**:
   ```
   Open in browser: http://localhost:8000
   ```

### Development Notes

- **No Node.js Required**: The project uses a single-page native JavaScript architecture, no npm or Node.js needed
- **Easy Debugging**: Simply modify HTML/CSS/JS files, browser auto-refreshes
- **Modular Design**: Each page is a functionally independent JS file, easy to maintain

### Essential Reading for Project Owners

- **Access to GitHub**: This is a necessary condition, as GitHub cannot be stably accessed from China now
- **Register Account**: Register a GitHub account using email or Google/Apple accounts
- **Upgrade Account to Organization**: You must use an organization's repository to use the permission grouping feature, this is very important
- **Enable Two-Factor Authentication**: Organization accounts must use two-factor authentication. Since Chinese phone numbers cannot be used for authentication, you must download the GitHub APP and another identity authentication APP, such as Microsoft Authenticator
- **Huawei Android Phones**: Since Huawei and Android phones in China cannot directly download apps from the Google Play Store, you also need to install an app called ApkPure first, through which to install the above two apps and complete two-factor authentication
- **Generate Personal Access Token**: Visit (https://github.com/settings/tokens), generate a "Generate new token (classic)" token, set the expiration to never, select all permissions, and save it after generation

## Contributing

Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) to learn how to participate in project development.

## License

[MIT License](LICENSE)
