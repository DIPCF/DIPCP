# SPCP - Serverless Project Contribution Platform

## 项目简介

SPCP（无服务器项目贡献平台）是一个基于GitHub的无服务器协作平台，旨在为开源项目提供内容管理和协作功能。

## 核心特性

- 🏠 **无服务器**: 用户本机运行的桌面应用程序，无需部署服务器
- 🔄 **GitHub集成**: 基于GitHub的无服务器存储和版本管理
- 📁 **文件树管理**: 内容以文件树形式组织，支持相互链接
- ✏️ **离线编辑**: 支持离线编辑和创建新页面
- 🌿 **自动分支**: 自动创建分支、本地缓存、提交审核
- 👥 **审核机制**: 专业内容审核团队负责合并决策
- 🏆 **积分系统**: 基于贡献的积分奖励机制
- 👤 **用户管理**: 分组授权和权限控制
- ⚡ **原生JavaScript**: 使用原生JS开发，简单易调试

## 项目结构

```
spcp/
├── README.md                 # 项目说明
├── start-dev.bat            # Windows开发服务器启动脚本
├── docs/                     # 文档目录
│   ├── prd.md               # 产品需求文档
│   ├── technical-design.md  # 技术设计文档
│   └── ui-design/           # UI设计文档
├── src/                     # 源代码目录
│   ├── main/                # Electron主进程
│   └── renderer/            # 渲染进程（原生JavaScript）
│       ├── pages/           # 页面HTML文件
│       ├── js/              # JavaScript模块
│       └── styles/          # 统一CSS样式
└── assets/                  # 资源文件
```

## 快速开始

### 环境要求
- Python 3.6+ （用于开发服务器）
- 现代浏览器（Chrome、Firefox、Edge等）
- Git（用于版本控制）

### 启动开发环境

1. **Windows用户**：
   ```
   双击 start-dev.bat
   ```

2. **Linux/macOS用户**：
   ```bash
   cd src/renderer
   python3 -m http.server 8000
   ```

3. **访问应用**：
   ```
   浏览器打开：http://localhost:8000
   ```

### 开发说明

- **无需Node.js**：项目使用原生JavaScript，无需npm或Node.js
- **简单调试**：直接修改HTML/CSS/JS文件即可，浏览器自动刷新
- **模块化设计**：每个功能独立的HTML和JS文件，便于维护

### 项目所有者必读

- **能够科学上网**：这是必要条件，在国内现在已经不能稳定访问github了
- **注册账号**：注册一个github账号，用邮箱或者谷歌、苹果的账号都可以
- **将账号升级为组织**：必须使用组织的仓库才能使用权限分组的功能，这很重要
- **打开两步认证**：组织账号必须使用两步认真，由于国内的手机号不能用来认证，所以必须下载Github APP和另外一个身份认证APP，例如Microsoft Authenticator
- **华为安卓手机**：鉴于国内的华为和安卓手机都无法直接从谷歌应用商店下载APP，所以还需要先安装一个叫做ApkPure的APP，通过它来安装以上两个APP，完成两步认证
- **生成个人访问令牌**：访问 (https://github.com/settings/tokens)，生成一个Generate new token (classic)令牌，将有效期设为永远，所有的权限都选中，生成后保存好
- **创建仓库**：创建一个公共仓库，注意必须要将仓库类型设置为公共，否则其他人无法访问。许可证不需要选择，在仓库所有者第一次登录时系统会自动生成
- **登陆之后**：打开根目录中各种语言版本的CLA.md文件，将你组织的名字和您的姓名、职位、地址填入相应的位置

## 贡献指南

请参考 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

## 许可证

[MIT License](LICENSE)
