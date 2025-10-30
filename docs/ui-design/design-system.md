# DIPCP 设计系统

## 📋 文档信息

- **项目名称**: DIPCP - 设计系统
- **版本**: v1.0
- **创建日期**: 2025年10月21日
- **最后更新**: 2025年10月21日
- **文档类型**: 设计系统文档

## 🎯 设计系统概述

### 1.1 设计理念

DIPCP设计系统基于"零门槛"理念，旨在创造直观、易用、美观的用户界面。系统遵循以下核心原则：

- **直观性**: 界面元素符合用户直觉，无需学习即可使用
- **一致性**: 所有组件保持统一的视觉语言和交互模式
- **可访问性**: 支持所有用户群体，包括残障用户
- **响应式**: 完美适配各种设备和屏幕尺寸

### 1.2 设计目标

- **降低认知负担**: 减少用户思考时间，提高操作效率
- **提升用户体验**: 创造愉悦的使用体验
- **保持品牌一致性**: 建立统一的品牌形象
- **支持快速开发**: 提供完整的组件库和设计规范

## 🎨 视觉设计

### 2.1 品牌色彩

#### 2.1.1 主色调 (明亮主题)
```css
/* 主品牌色 - 代表信任和专业 */
:root {
  --primary-50: #e6f7ff;
  --primary-100: #bae7ff;
  --primary-200: #91d5ff;
  --primary-300: #69c0ff;
  --primary-400: #40a9ff;
  --primary-500: #1890ff;  /* 主色 */
  --primary-600: #096dd9;
  --primary-700: #0050b3;
  --primary-800: #003a8c;
  --primary-900: #002766;
}
```

#### 2.1.2 主色调 (暗黑主题)
```css
/* 暗黑主题主色调 */
[data-theme="dark"] {
  --primary-50: #001529;
  --primary-100: #001d3d;
  --primary-200: #002651;
  --primary-300: #002f65;
  --primary-400: #003879;
  --primary-500: #1890ff;  /* 主色保持不变 */
  --primary-600: #40a9ff;
  --primary-700: #69c0ff;
  --primary-800: #91d5ff;
  --primary-900: #bae7ff;
}
```

#### 2.1.3 功能色彩 (明亮主题)
```css
/* 成功色 - 绿色系 */
:root {
  --success-50: #f6ffed;
  --success-100: #d9f7be;
  --success-200: #b7eb8f;
  --success-300: #95de64;
  --success-400: #73d13d;
  --success-500: #52c41a;  /* 成功色 */
  --success-600: #389e0d;
  --success-700: #237804;
  --success-800: #135200;
  --success-900: #092b00;

  /* 警告色 - 橙色系 */
  --warning-50: #fff7e6;
  --warning-100: #ffd591;
  --warning-200: #ffbb96;
  --warning-300: #ffa940;
  --warning-400: #ff9c6e;
  --warning-500: #faad14;  /* 警告色 */
  --warning-600: #d48806;
  --warning-700: #ad6800;
  --warning-800: #874d00;
  --warning-900: #613400;

  /* 错误色 - 红色系 */
  --error-50: #fff2f0;
  --error-100: #ffccc7;
  --error-200: #ffa39e;
  --error-300: #ff7875;
  --error-400: #ff4d4f;
  --error-500: #f5222d;  /* 错误色 */
  --error-600: #cf1322;
  --error-700: #a8071a;
  --error-800: #820014;
  --error-900: #5c0011;
}
```

#### 2.1.4 功能色彩 (暗黑主题)
```css
/* 暗黑主题功能色彩 */
[data-theme="dark"] {
  /* 成功色 - 暗黑主题 */
  --success-50: #0a1f0a;
  --success-100: #0f2f0f;
  --success-200: #143f14;
  --success-300: #194f19;
  --success-400: #1e5f1e;
  --success-500: #52c41a;  /* 成功色保持不变 */
  --success-600: #73d13d;
  --success-700: #95de64;
  --success-800: #b7eb8f;
  --success-900: #d9f7be;

  /* 警告色 - 暗黑主题 */
  --warning-50: #2a1f0a;
  --warning-100: #3d2f0f;
  --warning-200: #503f14;
  --warning-300: #634f19;
  --warning-400: #765f1e;
  --warning-500: #faad14;  /* 警告色保持不变 */
  --warning-600: #ff9c6e;
  --warning-700: #ffa940;
  --warning-800: #ffbb96;
  --warning-900: #ffd591;

  /* 错误色 - 暗黑主题 */
  --error-50: #2a0a0a;
  --error-100: #3d0f0f;
  --error-200: #501414;
  --error-300: #631919;
  --error-400: #761e1e;
  --error-500: #f5222d;  /* 错误色保持不变 */
  --error-600: #ff4d4f;
  --error-700: #ff7875;
  --error-800: #ffa39e;
  --error-900: #ffccc7;
}
```

#### 2.1.5 中性色彩 (明亮主题)
```css
/* 灰色系 - 用于文字和背景 */
:root {
  --gray-50: #fafafa;
  --gray-100: #f5f5f5;
  --gray-200: #f0f0f0;
  --gray-300: #d9d9d9;
  --gray-400: #bfbfbf;
  --gray-500: #8c8c8c;
  --gray-600: #595959;
  --gray-700: #434343;
  --gray-800: #262626;
  --gray-900: #1f1f1f;

  /* 语义化颜色 */
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --bg-tertiary: #f5f5f5;
  --text-primary: #262626;
  --text-secondary: #595959;
  --text-tertiary: #8c8c8c;
  --border-primary: #d9d9d9;
  --border-secondary: #f0f0f0;
}
```

#### 2.1.6 中性色彩 (暗黑主题)
```css
/* 暗黑主题中性色彩 */
[data-theme="dark"] {
  --gray-50: #1f1f1f;
  --gray-100: #262626;
  --gray-200: #434343;
  --gray-300: #595959;
  --gray-400: #8c8c8c;
  --gray-500: #bfbfbf;
  --gray-600: #d9d9d9;
  --gray-700: #f0f0f0;
  --gray-800: #f5f5f5;
  --gray-900: #fafafa;

  /* 暗黑主题语义化颜色 */
  --bg-primary: #141414;
  --bg-secondary: #1f1f1f;
  --bg-tertiary: #262626;
  --text-primary: #ffffff;
  --text-secondary: #d9d9d9;
  --text-tertiary: #8c8c8c;
  --border-primary: #434343;
  --border-secondary: #262626;
}
```

### 2.2 字体系统

#### 2.2.1 字体族
```css
/* 主字体 - 系统字体栈 */
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 
                    'Helvetica Neue', Helvetica, Arial, sans-serif;

/* 等宽字体 - 代码和数字 */
--font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', 
                    Menlo, Courier, monospace;

/* 标题字体 - 可选品牌字体 */
--font-family-heading: var(--font-family-base);
```

#### 2.2.2 字体大小
```css
/* 标题字体大小 */
--font-size-h1: 2.25rem;  /* 36px */
--font-size-h2: 1.875rem; /* 30px */
--font-size-h3: 1.5rem;   /* 24px */
--font-size-h4: 1.25rem;  /* 20px */
--font-size-h5: 1.125rem; /* 18px */
--font-size-h6: 1rem;     /* 16px */

/* 正文字体大小 */
--font-size-xl: 1.25rem;  /* 20px */
--font-size-lg: 1.125rem; /* 18px */
--font-size-base: 1rem;   /* 16px */
--font-size-sm: 0.875rem; /* 14px */
--font-size-xs: 0.75rem;  /* 12px */
```

#### 2.354 字体粗细
```css
/* 字体粗细 */
--font-weight-thin: 100;
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;
```

#### 2.2.5 行高
```css
/* 行高 */
--line-height-none: 1;
--line-height-tight: 1.25;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;
```

### 2.3 间距系统

#### 2.3.1 基础间距
```css
/* 基础间距单位 (基于8px网格) */
--spacing-0: 0;
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
--spacing-16: 4rem;    /* 64px */
--spacing-20: 5rem;    /* 80px */
--spacing-24: 6rem;    /* 96px */
```

#### 2.3.2 组件间距
```css
/* 组件内边距 */
--padding-xs: var(--spacing-1) var(--spacing-2);   /* 4px 8px */
--padding-sm: var(--spacing-2) var(--spacing-3);   /* 8px 12px */
--padding-md: var(--spacing-3) var(--spacing-4);   /* 12px 16px */
--padding-lg: var(--spacing-4) var(--spacing-6);   /* 16px 24px */
--padding-xl: var(--spacing-6) var(--spacing-8);   /* 24px 32px */

/* 组件外边距 */
--margin-xs: var(--spacing-1);
--margin-sm: var(--spacing-2);
--margin-md: var(--spacing-4);
--margin-lg: var(--spacing-6);
--margin-xl: var(--spacing-8);
```

### 2.4 圆角系统

```css
/* 圆角大小 */
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.25rem;    /* 4px */
--radius-lg: 0.375rem;   /* 6px */
--radius-xl: 0.5rem;     /* 8px */
--radius-2xl: 0.75rem;   /* 12px */
--radius-3xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* 完全圆形 */
```

### 2.5 阴影系统

```css
/* 阴影效果 */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

## 📱 响应式设计

### 3.1 断点系统

```css
/* 响应式断点 */
--breakpoint-xs: 480px;   /* 手机 */
--breakpoint-sm: 640px;   /* 大手机 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 小桌面 */
--breakpoint-xl: 1280px;  /* 大桌面 */
--breakpoint-2xl: 1536px; /* 超大桌面 */

/* 媒体查询 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### 3.2 容器系统

```css
/* 容器宽度 */
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

@media (min-width: 1536px) {
  .container { max-width: 1536px; }
}
```

## 🧩 组件库

### 4.1 布局组件

#### 4.1.1 智能布局系统
```css
/* 主内容区域布局 */
.main-content {
  display: flex;
  gap: var(--spacing-4);
  transition: all 0.3s ease;
}

.main-content.full-width .file-section {
  width: 100%;
}

.main-content.split-view .file-section {
  width: 75%;
}

.main-content.split-view .info-panel {
  width: 25%;
  display: block;
}
```

#### 4.1.2 下拉菜单组件
```html
<div class="dropdown">
  <button class="dropdown-toggle" id="menuBtn">⋯</button>
  <div class="dropdown-menu" id="menuContent">
    <a href="#" class="dropdown-item">项目信息</a>
    <a href="#" class="dropdown-item">项目成员</a>
    <a href="#" class="dropdown-item">最近活动</a>
    <a href="#" class="dropdown-item">待审核内容</a>
  </div>
</div>
```

#### 4.1.3 信息面板组件
```html
<div class="info-panel">
  <div class="info-panel-header">
    <h3>项目信息</h3>
    <button class="btn-close">×</button>
  </div>
  <div class="info-panel-content">
    <!-- 动态内容 -->
  </div>
</div>
```

#### 4.1.4 编辑器页面布局组件
```html
<!-- 编辑器页面主容器 -->
<div class="editor-main-container full-width">
  <!-- 编辑器区域 -->
  <div class="editor-section">
    <div class="editor-container">
      <div class="editor-toolbar">
        <!-- 工具栏按钮 -->
      </div>
      <div class="editor-content">
        <div class="editor-panel">
          <textarea id="markdownEditor"></textarea>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 信息面板 -->
  <div class="info-panel">
    <!-- 信息面板内容 -->
  </div>
</div>
```

#### 4.1.5 面包屑导航组件
```html
<div class="breadcrumb-container">
  <div class="breadcrumb">
    <span class="breadcrumb-item clickable" data-path="/">📁 项目名称</span>
    <span class="breadcrumb-separator">></span>
    <span class="breadcrumb-item">docs</span>
    <span class="breadcrumb-separator">></span>
    <span class="breadcrumb-item current">README.md</span>
  </div>
  <div class="dropdown">
    <button class="dropdown-toggle">⋯</button>
    <div class="dropdown-menu">
      <a href="#" class="dropdown-item">文件信息</a>
      <a href="#" class="dropdown-item">编辑历史</a>
      <a href="#" class="dropdown-item">协作信息</a>
    </div>
  </div>
</div>
```

### 4.2 按钮组件

#### 4.1.1 按钮变体
```html
```html
<!--
  <!-- 主要按钮 -->
  <button class="btn btn-primary">主要操作</button>
  
  <!-- 次要按钮 -->
  <button class="btn btn-secondary">次要操作</button>
  
  <!-- 成功按钮 -->
  <button class="btn btn-success">成功操作</button>
  
  <!-- 警告按钮 -->
  <button class="btn btn-warning">警告操作</button>
  
  <!-- 危险按钮 -->
  <button class="btn btn-danger">危险操作</button>
  
  <!-- 链接按钮 -->
  <button class="btn btn-link">链接按钮</button>
  
  <!-- 幽灵按钮 -->
  <button class="btn btn-ghost">幽灵按钮</button>
-->
```
```

#### 4.1.2 按钮大小
```html
```html
<!--
  <!-- 小按钮 -->
  <button class="btn btn-sm">小按钮</button>
  
  <!-- 默认按钮 -->
  <button class="btn">默认按钮</button>
  
  <!-- 大按钮 -->
  <button class="btn btn-lg">大按钮</button>
-->
```
```

#### 4.1.3 按钮样式
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--padding-sm);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  user-select: none;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 按钮变体 */
.btn-primary {
  background-color: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-600);
  border-color: var(--primary-600);
}

.btn-secondary {
  background-color: var(--gray-100);
  border-color: var(--gray-300);
  color: var(--gray-700);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--gray-200);
  border-color: var(--gray-400);
}

/* 按钮大小 */
.btn-sm {
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-xs);
}

.btn-lg {
  padding: var(--spacing-4) var(--spacing-6);
  font-size: var(--font-size-base);
}
```

### 4.2 表单组件

#### 4.2.1 输入框
```html
```html
<!--
  <div class="form-group">
    <label class="form-label">用户名</label>
    <input 
      class="form-input" 
      type="text" 
      placeholder="请输入用户名"
      v-model="username"
    >
    <div class="form-help">用户名长度为3-20个字符</div>
  </div>
-->
```
```

#### 4.2.2 表单样式
```css
.form-group {
  margin-bottom: var(--spacing-4);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--gray-700);
}

.form-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--gray-900);
  background-color: white;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.form-input:invalid {
  border-color: var(--error-500);
}

.form-help {
  margin-top: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.form-error {
  margin-top: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--error-500);
}
```

### 4.3 卡片组件

#### 4.3.1 基础卡片
```html
```html
<!--
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">卡片标题</h3>
      <div class="card-actions">
        <button class="btn btn-sm btn-ghost">操作</button>
      </div>
    </div>
    <div class="card-body">
      <p>卡片内容</p>
    </div>
    <div class="card-footer">
      <button class="btn btn-primary">确认</button>
    </div>
  </div>
-->
```
```

#### 4.3.2 卡片样式
```css
.card {
  background-color: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--gray-200);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-900);
  margin: 0;
}

.card-body {
  padding: var(--spacing-4);
}

.card-footer {
  padding: var(--spacing-4);
  border-top: 1px solid var(--gray-200);
  background-color: var(--gray-50);
}
```

### 4.4 导航组件

#### 4.4.1 顶部导航
```html
```html
<!--
  <nav class="navbar">
    <div class="navbar-brand">
      <img src="/logo.svg" alt="DIPCP" class="navbar-logo">
      <span class="navbar-title">DIPCP</span>
    </div>
    
    <div class="navbar-menu">
      <a href="/dashboard" class="navbar-item">仪表盘</a>
      <a href="/projects" class="navbar-item">项目</a>
      <a href="/contributions" class="navbar-item">贡献</a>
    </div>
    
    <div class="navbar-actions">
      <button class="btn btn-primary">新建项目</button>
      <div class="navbar-user">
        <img src="/avatar.jpg" alt="用户头像" class="user-avatar">
      </div>
    </div>
  </nav>
-->
```
```

#### 4.4.2 导航样式
```css
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-6);
  background-color: white;
  border-bottom: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.navbar-logo {
  width: 32px;
  height: 32px;
}

.navbar-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--gray-900);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
}

.navbar-item {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--gray-600);
  text-decoration: none;
  transition: color 0.2s ease-in-out;
}

.navbar-item:hover {
  color: var(--primary-500);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
}
```

## 🎯 交互设计

### 5.1 动画系统

#### 5.1.1 过渡动画
```css
/* 基础过渡 */
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.2s ease-in-out;
}

.transition-opacity {
  transition: opacity 0.2s ease-in-out;
}
```

#### 5.1.2 页面过渡
```css
/* 页面进入/离开动画 */
.page-enter-active, .page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter, .page-leave-to {
  opacity: 0;
}

/* 组件进入/离开动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* 滑动动画 */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter, .slide-leave-to {
  transform: translateX(100%);
}
```

#### 5.1.3 加载动画
```css
/* 旋转加载 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* 脉冲加载 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 弹跳加载 */
@keyframes bounce {
  0%, 100% { transform: translateY(-25%); }
  50% { transform: translateY(0); }
}

.bounce {
  animation: bounce 1s infinite;
}
```

### 5.2 反馈机制

#### 5.2.1 提示组件
```html
```html
<!--
  <!-- 成功提示 -->
  <div class="alert alert-success">
    <i class="icon-success"></i>
    <span>操作成功！</span>
  </div>
  
  <!-- 错误提示 -->
  <div class="alert alert-error">
    <i class="icon-error"></i>
    <span>操作失败，请重试</span>
  </div>
  
  <!-- 警告提示 -->
  <div class="alert alert-warning">
    <i class="icon-warning"></i>
    <span>请注意相关风险</span>
  </div>
  
  <!-- 信息提示 -->
  <div class="alert alert-info">
    <i class="icon-info"></i>
    <span>这是一条信息</span>
  </div>
-->
```
```

#### 5.2.2 提示样式
```css
.alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.alert-success {
  background-color: var(--success-50);
  border: 1px solid var(--success-200);
  color: var(--success-700);
}

.alert-error {
  background-color: var(--error-50);
  border: 1px solid var(--error-200);
  color: var(--error-700);
}

.alert-warning {
  background-color: var(--warning-50);
  border: 1px solid var(--warning-200);
  color: var(--warning-700);
}

.alert-info {
  background-color: var(--primary-50);
  border: 1px solid var(--primary-200);
  color: var(--primary-700);
}
```

## 📱 移动端适配

### 6.1 移动端布局

#### 6.1.1 响应式导航
```html
```html
<!--
  <nav class="navbar mobile-navbar">
    <div class="navbar-brand">
      <img src="/logo.svg" alt="DPCC" class="navbar-logo">
    </div>
    
    <button class="navbar-toggle" @click="toggleMenu">
      <i class="icon-menu"></i>
    </button>
    
    <div class="navbar-menu" :class="{ 'is-active': menuActive }">
      <a href="/dashboard" class="navbar-item">仪表盘</a>
      <a href="/projects" class="navbar-item">项目</a>
      <a href="/contributions" class="navbar-item">贡献</a>
    </div>
  </nav>
-->
```
```

#### 6.1.2 移动端样式
```css
@media (max-width: 768px) {
  .navbar {
    padding: var(--spacing-3) var(--spacing-4);
  }
  
  .navbar-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    box-shadow: var(--shadow-lg);
    transform: translateY(-100%);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 50;
  }
  
  .navbar-menu.is-active {
    transform: translateY(0);
    opacity: 1;
  }
  
  .navbar-item {
    display: block;
    padding: var(--spacing-4);
    border-bottom: 1px solid var(--gray-200);
  }
  
  .navbar-toggle {
    display: block;
    background: none;
    border: none;
    font-size: var(--font-size-lg);
    color: var(--gray-600);
    cursor: pointer;
  }
}

@media (min-width: 769px) {
  .navbar-toggle {
    display: none;
  }
}
```

### 6.2 触摸优化

#### 6.2.1 触摸目标大小
```css
/* 触摸目标最小尺寸 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* 按钮触摸优化 */
.btn {
  min-height: 44px;
  touch-action: manipulation;
}

/* 链接触摸优化 */
a {
  touch-action: manipulation;
}
```

#### 6.2.2 手势支持
```css
/* 滑动支持 */
.swipe-container {
  touch-action: pan-x;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* 下拉刷新 */
.pull-refresh {
  touch-action: pan-y;
}
```

## ♿ 可访问性设计

### 7.1 键盘导航

#### 7.1.1 焦点样式
```css
/* 焦点样式 */
.focusable:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* 跳过链接 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-500);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 6px;
}
```

#### 7.1.2 键盘导航
```css
/* 隐藏焦点轮廓（仅鼠标用户） */
.js-focus-visible :focus:not(.focus-visible) {
  outline: none;
}

/* 显示焦点轮廓（键盘用户） */
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### 7.2 屏幕阅读器支持

#### 7.2.1 ARIA标签
```html
```html
<!--
  <!-- 按钮ARIA标签 -->
  <button 
    class="btn btn-primary"
    aria-label="提交表单"
    aria-describedby="submit-help"
  >
    提交
  </button>
  
  <!-- 表单ARIA标签 -->
  <div class="form-group">
    <label for="username" class="form-label">用户名</label>
    <input 
      id="username"
      class="form-input"
      type="text"
      aria-describedby="username-help"
      aria-invalid="false"
    >
    <div id="username-help" class="form-help">用户名长度为3-20个字符</div>
  </div>
  
  <!-- 状态ARIA标签 -->
  <div 
    class="alert alert-success"
    role="alert"
    aria-live="polite"
  >
    操作成功！
  </div>
-->
```
```

#### 7.2.2 语义化HTML
```html
```html
<!--
  <!-- 使用语义化标签 -->
  <main>
    <header>
      <h1>页面标题</h1>
      <nav>
        <ul>
          <li><a href="/dashboard">仪表盘</a></li>
          <li><a href="/projects">项目</a></li>
        </ul>
      </nav>
    </header>
    
    <section>
      <h2>主要内容</h2>
      <article>
        <h3>文章标题</h3>
        <p>文章内容</p>
      </article>
    </section>
    
    <aside>
      <h2>侧边栏</h2>
      <p>侧边栏内容</p>
    </aside>
    
    <footer>
      <p>页脚内容</p>
    </footer>
  </main>
-->
```
```

## 🌙 主题切换系统

### 7.1 主题切换实现

#### 7.1.1 主题切换组件
```html
```html
<!--
  <div class="theme-switcher">
    <button 
      class="theme-toggle"
      @click="toggleTheme"
      :title="currentTheme === 'light' ? '切换到暗黑主题' : '切换到明亮主题'"
    >
      <i :class="currentTheme === 'light' ? 'icon-moon' : 'icon-sun'"></i>
    </button>
    
    <div class="theme-menu" v-if="showMenu">
      <button @click="setTheme('light')" :class="{ active: currentTheme === 'light' }">
        <i class="icon-sun"></i>
        明亮主题
      </button>
      <button @click="setTheme('dark')" :class="{ active: currentTheme === 'dark' }">
        <i class="icon-moon"></i>
        暗黑主题
      </button>
    </div>
  </div>
-->
```

```javascript
// 组件JavaScript代码
// 组件类定义
class Component {
  name: 'ThemeSwitcher',
  data() {
    return {
      currentTheme: 'auto',
      showMenu: false
    }
  },
  mounted() {
    this.initTheme();
    this.listenSystemTheme();
  },
  methods: {
    initTheme() {
      // 从本地存储获取主题设置
      const savedTheme = localStorage.getItem('dpcc-theme') || 'auto';
      this.setTheme(savedTheme);
    },
    
    setTheme(theme) {
      this.currentTheme = theme;
      localStorage.setItem('dipcp-theme', theme);
      
      if (theme === 'auto') {
        // 应用指定主题
        document.documentElement.setAttribute('data-theme', theme);
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      
      this.showMenu = false;
    },
    
    toggleTheme() {
      const themes = ['light', 'dark', 'auto'];
      const currentIndex = themes.indexOf(this.currentTheme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      this.setTheme(nextTheme);
    },
    
    listenSystemTheme() {
      // 监听系统主题变化
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (this.currentTheme === 'auto') {
          document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
      });
    }
  }
}
</script>
```

#### 7.1.2 主题切换样式
```css
.theme-switcher {
  position: relative;
  display: inline-block;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.theme-toggle:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.theme-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-2);
  padding: var(--spacing-2);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 150px;
}

.theme-menu button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  border-radius: var(--radius-md);
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: left;
}

.theme-menu button:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.theme-menu button.active {
  background-color: var(--primary-500);
  color: white;
}

.theme-menu button.active:hover {
  background-color: var(--primary-600);
}
```

#### 7.1.3 主题切换工具类
```css
/* 主题切换过渡动画 */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* 主题切换时的平滑过渡 */
.theme-transition {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* 强制主题样式 */
.theme-light {
  --bg-primary: #ffffff !important;
  --bg-secondary: #fafafa !important;
  --text-primary: #262626 !important;
  --text-secondary: #595959 !important;
}

.theme-dark {
  --bg-primary: #141414 !important;
  --bg-secondary: #1f1f1f !important;
  --text-primary: #ffffff !important;
  --text-secondary: #d9d9d9 !important;
}
```

### 7.2 主题检测与自动切换

#### 7.2.1 系统主题检测
```javascript
// 主题检测工具类
class ThemeDetector {
  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.listeners = [];
  }
  
  // 检测当前系统主题
  getSystemTheme() {
    return this.mediaQuery.matches ? 'dark' : 'light';
  }
  
  // 监听系统主题变化
  onThemeChange(callback) {
    const listener = (e) => {
      callback(e.matches ? 'dark' : 'light');
    };
    
    this.mediaQuery.addEventListener('change', listener);
    this.listeners.push(listener);
    
    return () => {
      this.mediaQuery.removeEventListener('change', listener);
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  // 清理所有监听器
  cleanup() {
    this.listeners.forEach(listener => {
      this.mediaQuery.removeEventListener('change', listener);
    });
    this.listeners = [];
  }
}

// 全局主题检测器实例
export const themeDetector = new ThemeDetector();
```

#### 7.2.2 主题管理服务
```javascript
// 主题管理服务
class ThemeManager {
  constructor() {
    this.currentTheme = 'auto';
    this.systemTheme = 'light';
    this.listeners = [];
    
    this.init();
  }
  
  init() {
    // 从本地存储获取主题设置
    this.currentTheme = localStorage.getItem('dipcp-theme') || 'auto';
    
    // 监听系统主题变化
    themeDetector.onThemeChange((theme) => {
      this.systemTheme = theme;
      if (this.currentTheme === 'auto') {
        this.applyTheme(theme);
      }
    });
    
    // 应用初始主题
    this.applyTheme(this.getEffectiveTheme());
  }
  
  // 获取有效主题
  getEffectiveTheme() {
    return this.currentTheme;
  }
  
  // 设置主题
  setTheme(theme) {
    if (this.currentTheme === theme) return;
    
    this.currentTheme = theme;
    localStorage.setItem('dipcp-theme', theme);
    
    this.applyTheme(this.getEffectiveTheme());
    this.notifyListeners();
  }
  
  // 切换主题
  toggleTheme() {
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.setTheme(nextTheme);
  }
  
  // 应用主题
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // 更新meta标签
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = theme === 'dark' ? '#141414' : '#ffffff';
    }
  }
  
  // 添加主题变化监听器
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  // 移除主题变化监听器
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  // 通知所有监听器
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.currentTheme, this.getEffectiveTheme());
    });
  }
  
  // 获取当前主题
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  // 获取有效主题
  getEffectiveTheme() {
    return this.getEffectiveTheme();
  }
}

// 全局主题管理器实例
export const themeManager = new ThemeManager();
```

### 7.3 主题切换集成

#### 7.3.1 原生JavaScript模块
```javascript
// 主题切换原生JavaScript模块
export class ThemeModule {
  constructor() {
    // 初始化主题
    // 全局主题管理器
    window.themeManager = themeManager;
  }
};
```

#### 7.3.2 原生JavaScript实现
```javascript
// 主题切换组合式API
// 原生JavaScript实现
import { themeManager } from './theme-manager';

export function useTheme() {
  const currentTheme = ref(themeManager.getCurrentTheme());
  const effectiveTheme = ref(themeManager.getEffectiveTheme());
  
  const setTheme = (theme) => {
    themeManager.setTheme(theme);
  };
  
  const toggleTheme = () => {
    themeManager.toggleTheme();
  };
  
  const onThemeChange = (callback) => {
    return themeManager.addListener(callback);
  };
  
  onMounted(() => {
    const unsubscribe = themeManager.addListener((current, effective) => {
      currentTheme.value = current;
      effectiveTheme.value = effective;
    });
    
    onUnmounted(() => {
      themeManager.removeListener(unsubscribe);
    });
  });
  
  return {
    currentTheme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    onThemeChange
  };
}
```

## 📋 设计规范

### 8.1 设计原则

1. **一致性**: 所有界面元素保持统一的视觉风格和交互模式
2. **简洁性**: 避免不必要的装饰，突出核心功能
3. **可用性**: 确保所有用户都能轻松使用
4. **可访问性**: 支持键盘导航和屏幕阅读器
5. **响应式**: 适配各种设备和屏幕尺寸
6. **性能**: 优化加载速度和交互响应

### 8.2 设计检查清单

#### 8.2.1 视觉设计
- [ ] 色彩对比度符合WCAG AA标准（4.5:1）
- [ ] 字体大小适合阅读（最小14px）
- [ ] 按钮大小适合触摸操作（最小44px）
- [ ] 图标含义清晰明确
- [ ] 间距使用统一的间距系统

#### 8.2.2 交互设计
- [ ] 导航结构清晰明了
- [ ] 错误提示友好明确
- [ ] 加载状态有明确反馈
- [ ] 操作反馈及时准确
- [ ] 撤销操作容易执行

#### 8.2.3 响应式设计
- [ ] 移动端体验流畅
- [ ] 平板端布局合理
- [ ] 桌面端功能完整
- [ ] 触摸操作优化
- [ ] 键盘导航支持

#### 8.2.4 可访问性
- [ ] 支持屏幕阅读器
- [ ] 键盘导航完整
- [ ] 焦点管理清晰
- [ ] 颜色不是唯一的信息传达方式
- [ ] 文字和背景对比度足够

---

**文档状态**: 草稿  
**下次评审**: 2025年11月1日  
**负责人**: UI设计团队  
**审核人**: 产品团队
