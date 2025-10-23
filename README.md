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

### 仓库所有者必读
- 首先需要访问：https://github.com/settings/tokens
生成步骤
• 点击 Generate new token → Generate new token (classic)
• 填写Note（备注）：SPCP应用
• 选择Expiration（过期时间）：建议选择"Never"（永远）
• 重要：勾选所有权限选项（全选）
• 点击 Generate token
复制Token
• 立即复制Token并保存（只显示一次）请务必保存好！

进入仓库的 Settings → Actions → General
在 "Workflow permissions" 部分
选择 "Read and write permissions"
勾选 "Allow GitHub Actions to create and approve pull requests"

进入仓库的 Settings → Secrets and variables → Actions
添加一个新的secret，名称为COLLABORATOR_TOKEN
值使用刚才创建的的Personal Access Token

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

## 贡献指南

请参考 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

## 许可证

[MIT License](LICENSE)
