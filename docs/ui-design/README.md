# DIPCP UI设计文档

## 📋 文档信息

- **项目名称**: DIPCP - UI设计文档
- **版本**: v1.0
- **创建日期**: 2025年10月21日
- **最后更新**: 2025年10月21日
- **文档类型**: UI设计文档

## 🎯 设计理念

### 1.1 核心设计原则

- **零门槛**: 界面直观易懂，无需学习即可使用
- **零学习成本**: 符合用户直觉，降低认知负担
- **完全透明**: 所有操作和状态都清晰可见
- **多平台一致**: 桌面、移动、网页版保持一致的体验

### 1.2 设计目标

- **易用性**: 新用户5分钟内上手
- **直观性**: 操作流程清晰，无需说明书
- **一致性**: 跨平台体验统一
- **美观性**: 现代化设计，符合当前审美趋势

## 🎨 设计系统

### 2.1 色彩系统

#### 2.1.1 主色调
```css
/* 主品牌色 */
--primary-color: #1890ff;        /* 主蓝色 */
--primary-hover: #40a9ff;       /* 悬停蓝色 */
--primary-active: #096dd9;      /* 激活蓝色 */

/* 辅助色 */
--success-color: #52c41a;       /* 成功绿色 */
--warning-color: #faad14;       /* 警告橙色 */
--error-color: #f5222d;         /* 错误红色 */
--info-color: #1890ff;          /* 信息蓝色 */
```

#### 2.1.2 中性色
```css
/* 文字颜色 */
--text-primary: #262626;        /* 主要文字 */
--text-secondary: #595959;      /* 次要文字 */
--text-disabled: #bfbfbf;       /* 禁用文字 */

/* 背景颜色 */
--bg-primary: #ffffff;          /* 主背景 */
--bg-secondary: #fafafa;        /* 次背景 */
--bg-disabled: #f5f5f5;         /* 禁用背景 */

/* 边框颜色 */
--border-primary: #d9d9d9;      /* 主边框 */
--border-secondary: #f0f0f0;    /* 次边框 */
```

### 2.2 字体系统

#### 2.2.1 字体族
```css
/* 主字体 */
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 
               'Helvetica Neue', Helvetica, Arial, sans-serif;

/* 等宽字体 */
--font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', 
                    Menlo, Courier, monospace;
```

#### 2.2.2 字体大小
```css
/* 标题字体 */
--font-size-h1: 32px;
--font-size-h2: 24px;
--font-size-h3: 20px;
--font-size-h4: 16px;

/* 正文字体 */
--font-size-base: 14px;
--font-size-lg: 16px;
--font-size-sm: 12px;

/* 行高 */
--line-height-base: 1.5715;
--line-height-lg: 1.5;
--line-height-sm: 1.66;
```

### 2.3 间距系统

#### 2.3.1 基础间距
```css
/* 基础间距单位 */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-xxl: 48px;
```

#### 2.3.2 组件间距
```css
/* 组件内边距 */
--padding-xs: 4px 8px;
--padding-sm: 8px 12px;
--padding-md: 12px 16px;
--padding-lg: 16px 24px;

/* 组件外边距 */
--margin-xs: 4px;
--margin-sm: 8px;
--margin-md: 16px;
--margin-lg: 24px;
```

### 2.4 圆角系统

```css
/* 圆角大小 */
--border-radius-xs: 2px;
--border-radius-sm: 4px;
--border-radius-md: 6px;
--border-radius-lg: 8px;
--border-radius-xl: 12px;
```

### 2.5 阴影系统

```css
/* 阴影效果 */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

## 📱 响应式设计

### 3.1 断点系统

```css
/* 响应式断点 */
--breakpoint-xs: 480px;         /* 手机 */
--breakpoint-sm: 576px;         /* 大手机 */
--breakpoint-md: 768px;         /* 平板 */
--breakpoint-lg: 992px;         /* 小桌面 */
--breakpoint-xl: 1200px;        /* 大桌面 */
--breakpoint-xxl: 1600px;       /* 超大桌面 */
```

### 3.2 布局系统

#### 3.2.1 网格系统
```css
/* 12列网格系统 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 calc(var(--spacing-md) / -2);
}

.col {
  flex: 1;
  padding: 0 calc(var(--spacing-md) / 2);
}
```

#### 3.2.2 弹性布局
```css
/* 常用弹性布局 */
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

## 🎯 组件设计

### 4.1 按钮组件

#### 4.1.1 按钮类型
```html
<!-- 主要按钮 -->
<button class="btn btn-primary">主要操作</button>

<!-- 次要按钮 -->
<button class="btn btn-secondary">次要操作</button>

<!-- 危险按钮 -->
<button class="btn btn-danger">危险操作</button>

<!-- 链接按钮 -->
<button class="btn btn-link">链接按钮</button>
```

#### 4.1.2 按钮样式
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--padding-sm);
  border: 1px solid transparent;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  line-height: var(--line-height-base);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}
```

### 4.2 表单组件

#### 4.2.1 输入框
```html
<!-- 基础输入框 -->
<div class="form-group">
  <label class="form-label">用户名</label>
  <input class="form-input" type="text" placeholder="请输入用户名">
</div>

<!-- 带图标的输入框 -->
<div class="form-group">
  <label class="form-label">邮箱</label>
  <div class="form-input-wrapper">
    <input class="form-input" type="email" placeholder="请输入邮箱">
    <span class="form-input-icon">@</span>
  </div>
</div>
```

#### 4.2.2 表单样式
```css
.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: var(--padding-sm);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}
```

### 4.3 导航组件

#### 4.3.1 顶部导航
```html
<nav class="navbar">
  <div class="navbar-brand">
    <img src="/logo.svg" alt="DPCC" class="navbar-logo">
    <span class="navbar-title">DPCC</span>
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
```

#### 4.3.2 侧边导航
```html
<aside class="sidebar">
  <div class="sidebar-header">
    <h3>项目导航</h3>
  </div>
  <nav class="sidebar-nav">
    <a href="/dashboard" class="sidebar-item">
      <i class="icon-dashboard"></i>
      <span>仪表盘</span>
    </a>
    <a href="/projects" class="sidebar-item">
      <i class="icon-projects"></i>
      <span>项目列表</span>
    </a>
    <a href="/contributions" class="sidebar-item">
      <i class="icon-contributions"></i>
      <span>我的贡献</span>
    </a>
  </nav>
</aside>
```

## 📄 页面设计

### 5.1 登录页面

#### 5.1.1 页面布局
```html
```html
<!--
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <img src="/logo.svg" alt="DIPCP" class="login-logo">
        <h1 class="login-title">欢迎使用 DIPCP</h1>
        <p class="login-subtitle">无服务器项目贡献平台</p>
      </div>
      
      <div class="login-form">
        <button class="btn btn-primary btn-large" @click="loginWithGitHub">
          <i class="icon-github"></i>
          使用 GitHub 账号登录
        </button>
        
        <div class="login-features">
          <h3>为什么选择 DIPCP？</h3>
          <ul>
            <li>✅ 零运维成本，完全无服务器</li>
            <li>✅ 零学习成本，下载即用</li>
            <li>✅ 零门槛参与，只需 GitHub 账号</li>
            <li>✅ 完全透明，全程可追溯</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
-->
```
```

### 5.2 仪表盘页面

#### 5.2.1 页面布局
```html
```html
<!--
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h1>欢迎回来，{{ user.name }}</h1>
      <p>您有 {{ pendingReviews }} 个待审核项目</p>
    </div>
    
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="icon-projects"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ userStats.projects }}</div>
          <div class="stat-label">参与项目</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="icon-contributions"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ userStats.contributions }}</div>
          <div class="stat-label">贡献数量</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="icon-points"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ userStats.points }}</div>
          <div class="stat-label">总积分</div>
        </div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="dashboard-section">
        <h2>最近活动</h2>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-section">
        <h2>我的项目</h2>
        <div class="project-list">
          <div v-for="project in userProjects" :key="project.id" class="project-card">
            <div class="project-header">
              <h3>{{ project.name }}</h3>
              <span class="project-status" :class="project.status">{{ project.statusText }}</span>
            </div>
            <p class="project-description">{{ project.description }}</p>
            <div class="project-meta">
              <span class="project-contributors">{{ project.contributors }} 贡献者</span>
              <span class="project-updated">{{ project.lastUpdated }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
-->
```
```

## 🎨 图标系统

### 6.1 图标库

#### 6.1.1 基础图标
```css
/* 使用原生CSS图标 */
.icon-dashboard::before { content: '\e6b8'; }
.icon-projects::before { content: '\e6b9'; }
.icon-contributions::before { content: '\e6ba'; }
.icon-reviews::before { content: '\e6bb'; }
.icon-settings::before { content: '\e6bc'; }
.icon-user::before { content: '\e6bd'; }
.icon-github::before { content: '\e6be'; }
.icon-edit::before { content: '\e6bf'; }
.icon-save::before { content: '\e6c0'; }
.icon-delete::before { content: '\e6c1'; }
```

#### 6.1.2 状态图标
```css
.icon-success::before { content: '\e6c2'; color: var(--success-color); }
.icon-warning::before { content: '\e6c3'; color: var(--warning-color); }
.icon-error::before { content: '\e6c4'; color: var(--error-color); }
.icon-info::before { content: '\e6c5'; color: var(--info-color); }
```

## 📱 移动端适配

### 7.1 移动端布局

#### 7.1.1 响应式导航
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

#### 7.1.2 移动端样式
```css
@media (max-width: 768px) {
  .navbar {
    padding: var(--spacing-sm);
  }
  
  .navbar-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    box-shadow: var(--shadow-md);
    transform: translateY(-100%);
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .navbar-menu.is-active {
    transform: translateY(0);
    opacity: 1;
  }
  
  .navbar-item {
    display: block;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-secondary);
  }
}
```

## 🎯 交互设计

### 8.1 动画效果

#### 8.1.1 过渡动画
```css
/* 页面过渡 */
.page-enter-active, .page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter, .page-leave-to {
  opacity: 0;
}

/* 组件过渡 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
```

#### 8.1.2 加载动画
```html
```html
<!--
  <div class="loading-spinner">
    <div class="spinner"></div>
    <p>加载中...</p>
  </div>
-->
```

<style>
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-secondary);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

### 8.2 反馈机制

#### 8.2.1 成功反馈
```html
```html
<!--
  <div class="toast toast-success">
    <i class="icon-success"></i>
    <span>操作成功！</span>
  </div>
-->
```
```

#### 8.2.2 错误反馈
```html
```html
<!--
  <div class="toast toast-error">
    <i class="icon-error"></i>
    <span>操作失败，请重试</span>
  </div>
-->
```
```

## 📋 设计规范

### 9.1 设计原则

1. **一致性**: 所有界面元素保持一致的视觉风格
2. **简洁性**: 避免不必要的装饰，突出核心功能
3. **可用性**: 确保所有用户都能轻松使用
4. **可访问性**: 支持键盘导航和屏幕阅读器
5. **响应式**: 适配各种设备和屏幕尺寸

### 9.2 设计检查清单

- [ ] 色彩对比度符合WCAG标准
- [ ] 字体大小适合阅读
- [ ] 按钮大小适合触摸操作
- [ ] 导航结构清晰明了
- [ ] 错误提示友好明确
- [ ] 加载状态有明确反馈
- [ ] 移动端体验流畅

---

**文档状态**: 草稿  
**下次评审**: 2025年11月1日  
**负责人**: UI设计团队  
**审核人**: 产品团队
