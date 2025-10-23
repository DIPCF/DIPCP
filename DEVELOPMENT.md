# SPCP 开发指南

## 快速开始

### 环境要求

- **Python 3.6+** - 用于开发服务器
- **现代浏览器** - Chrome、Firefox、Edge等
- **Git** - 用于版本控制
- **无需Node.js** - 项目使用原生JavaScript

### 1. 启动开发服务器

#### Windows用户
```bash
双击 start-dev.bat
```

#### Linux/macOS用户
```bash
cd src/renderer
python3 -m http.server 8000
```

### 2. 访问应用

浏览器打开：`http://localhost:8000`

### 3. 开发调试

- **实时编辑**：直接修改HTML/CSS/JS文件，浏览器刷新即可看到变化
- **模块化开发**：每个功能独立的HTML和JS文件
- **统一样式**：所有页面共享 `styles/main.css`

## 项目结构

```
spcp/
├── start-dev.bat       # Windows开发服务器启动脚本
├── src/
│   ├── main/           # Electron主进程
│   └── renderer/       # 原生JavaScript渲染进程
│       ├── pages/      # HTML页面文件
│       ├── js/         # JavaScript模块
│       └── styles/     # 统一CSS样式
├── docs/               # 项目文档
└── assets/             # 静态资源
```

## 技术栈

- **桌面应用**: Electron + 原生JavaScript
- **前端框架**: 原生JavaScript（ES2020+）
- **UI组件**: 原生HTML/CSS/JavaScript
- **开发服务器**: Python HTTP Server
- **数据存储**: IndexedDB + localStorage
- **版本控制**: Git + GitHub API

## 开发流程

1. **页面开发**: 在 `src/renderer/pages/` 目录下创建HTML页面
2. **逻辑开发**: 在 `src/renderer/js/` 目录下编写JavaScript模块
3. **样式开发**: 在 `src/renderer/styles/main.css` 中统一管理样式
4. **主题系统**: 使用CSS变量实现暗黑/明亮主题切换
5. **文档更新**: 在 `docs/` 目录下更新项目文档

## 文件说明

### 页面文件 (src/renderer/pages/)
- `login.html` - 登录页面
- `dashboard.html` - 仪表盘页面
- `project-detail.html` - 项目详情页面
- `editor.html` - 编辑器页面
- `settings.html` - 设置页面

### JavaScript模块 (src/renderer/js/)
- `login.js` - 登录逻辑
- `dashboard.js` - 仪表盘逻辑
- `project-detail.js` - 项目详情逻辑
- `editor.js` - 编辑器逻辑
- `settings.js` - 设置逻辑
- `theme-manager.js` - 主题管理

### 样式文件 (src/renderer/styles/)
- `main.css` - 统一样式文件，包含所有页面样式

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

## 问题反馈

如有问题，请提交Issue或联系开发团队。
