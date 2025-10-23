# SPCP 主题切换实现指南

## 📋 文档信息

- **项目名称**: SPCP - 主题切换实现指南
- **版本**: v1.0
- **创建日期**: 2025年10月21日
- **最后更新**: 2025年10月21日
- **文档类型**: 技术实现指南

## 🎯 主题切换概述

### 1.1 功能特性

- **两种主题模式**: 明亮主题、暗黑主题
- **自动检测**: 根据系统设置自动选择默认主题
- **平滑过渡**: 主题切换时的平滑动画效果
- **持久化存储**: 用户选择保存到本地存储
- **实时同步**: 系统主题变化时自动同步

### 1.2 技术实现

- **CSS变量**: 使用CSS自定义属性实现主题切换
- **媒体查询**: 检测系统主题偏好
- **本地存储**: 保存用户主题选择
- **原生JavaScript集成**: 提供原生JavaScript类和模块

## 🎨 主题色彩系统

### 2.1 明亮主题色彩

```css
:root {
  /* 主色调 */
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

  /* 功能色彩 */
  --success-500: #52c41a;
  --warning-500: #faad14;
  --error-500: #f5222d;

  /* 中性色彩 */
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

### 2.2 暗黑主题色彩

```css
[data-theme="dark"] {
  /* 主色调 - 暗黑版本 */
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

  /* 功能色彩 - 暗黑版本 */
  --success-500: #52c41a;  /* 保持不变 */
  --warning-500: #faad14;  /* 保持不变 */
  --error-500: #f5222d;    /* 保持不变 */

  /* 中性色彩 - 暗黑版本 */
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

## 🔧 核心实现

### 3.1 主题检测器

```javascript
// 主题检测器类
class ThemeDetector {
  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.listeners = [];
  }
  
  // 获取当前系统主题
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
    
    // 返回取消监听的函数
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

export const themeDetector = new ThemeDetector();
```

### 3.2 主题管理器

```javascript
// 主题管理器类
class ThemeManager {
  constructor() {
    this.currentTheme = 'auto';
    this.systemTheme = 'light';
    this.listeners = [];
    
    this.init();
  }
  
  init() {
    // 从本地存储获取主题设置
    this.currentTheme = localStorage.getItem('spcp-theme') || 'auto';
    
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
    if (this.currentTheme === 'auto') {
      return this.systemTheme;
    }
    return this.currentTheme;
  }
  
  // 设置主题
  setTheme(theme) {
    if (this.currentTheme === theme) return;
    
    this.currentTheme = theme;
    localStorage.setItem('spcp-theme', theme);
    
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
  
  // 应用主题到DOM
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

export const themeManager = new ThemeManager();
```

## 🎯 原生JavaScript组件实现

### 4.1 主题切换组件

```html
<!-- 主题切换组件 -->
<div class="theme-switcher">
  <!-- 简单切换按钮 -->
  <button 
    id="theme-toggle-btn"
    class="theme-toggle"
    title="切换主题"
    aria-label="切换主题"
  >
    <i id="theme-toggle-icon"></i>
  </button>
  
  <!-- 下拉菜单 -->
  <div id="theme-menu" class="theme-menu" style="display: none;">
    <div class="theme-menu-header">
        <span>选择主题</span>
        <button id="theme-menu-close" class="close-btn">
          <i class="icon-close"></i>
        </button>
      </div>
      
      <div class="theme-options">
        <button 
          id="theme-light-btn"
          class="theme-option"
        >
          <div class="theme-preview light-preview"></div>
          <div class="theme-info">
            <span class="theme-name">明亮主题</span>
            <span class="theme-desc">适合日间使用</span>
          </div>
        </button>
        
        <button 
          id="theme-dark-btn"
          class="theme-option"
        >
          <div class="theme-preview dark-preview"></div>
          <div class="theme-info">
            <span class="theme-name">暗黑主题</span>
            <span class="theme-desc">适合夜间使用</span>
          </div>
        </button>
        
      </div>
    </div>
  </div>
</div>

```javascript
// 主题切换组件JavaScript
import { themeManager } from './services/theme-manager.js';

class ThemeSwitcher {
  constructor() {
    this.currentTheme = 'auto';
    this.showMenu = false;
    this.init();
  }
  
  init() {
    this.initTheme();
    this.listenSystemTheme();
    this.bindEvents();
  }
  
  initTheme() {
    this.currentTheme = themeManager.getCurrentTheme();
  }
  
  setTheme(theme) {
    themeManager.setTheme(theme);
    this.currentTheme = theme;
    this.showMenu = false;
  }
  
  toggleTheme() {
    themeManager.toggleTheme();
    this.currentTheme = themeManager.getCurrentTheme();
  }
  
  getToggleTitle() {
    const titles = {
      'light': '切换到暗黑主题',
      'dark': '切换到明亮主题'
    };
    return titles[this.currentTheme];
  }
  
  getToggleIcon() {
    const icons = {
      'light': 'icon-sun',
      'dark': 'icon-moon'
    };
    return icons[this.currentTheme];
  }
    
    listenSystemTheme() {
      themeManager.addListener((current, effective) => {
        this.currentTheme = current;
      });
    }
    
    handleClickOutside(event) {
      if (!this.element.contains(event.target)) {
        this.showMenu = false;
      }
    }
    
    bindEvents() {
      // 绑定事件监听器
      document.getElementById('theme-toggle-btn').addEventListener('click', () => {
        this.toggleTheme();
      });
      
      document.getElementById('theme-light-btn').addEventListener('click', () => {
        this.setTheme('light');
      });
      
      document.getElementById('theme-dark-btn').addEventListener('click', () => {
        this.setTheme('dark');
      });
      
      document.getElementById('theme-auto-btn').addEventListener('click', () => {
        this.setTheme('auto');
      });
      
      // 点击外部关闭菜单
      document.addEventListener('click', this.handleClickOutside.bind(this));
    }
  }
}
```

```css
/* 主题切换组件样式 */
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
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 200px;
  overflow: hidden;
}

.theme-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--border-secondary);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.close-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.theme-options {
  padding: var(--spacing-2);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-3);
  border: none;
  border-radius: var(--radius-md);
  background: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: left;
}

.theme-option:hover {
  background-color: var(--bg-tertiary);
}

.theme-option.active {
  background-color: var(--primary-500);
  color: white;
}

.theme-preview {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-primary);
}

.light-preview {
  background: linear-gradient(135deg, #ffffff 50%, #f0f0f0 50%);
}

.dark-preview {
  background: linear-gradient(135deg, #141414 50%, #262626 50%);
}

.auto-preview {
  background: linear-gradient(135deg, #ffffff 33%, #141414 33%, #1890ff 66%);
}

.theme-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.theme-name {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.theme-desc {
  font-size: var(--font-size-xs);
  opacity: 0.7;
}
</style>
```

### 4.2 组合式API

```javascript
// 主题切换组合式API
// 原生JavaScript实现
import { themeManager } from '@/services/theme-manager';

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

## 🎨 样式实现

### 5.1 主题切换动画

```css
/* 全局过渡动画 */
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

### 5.2 组件主题样式

```css
/* 按钮主题样式 */
.btn {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn:hover {
  background-color: var(--bg-secondary);
}

.btn-primary {
  background-color: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

.btn-primary:hover {
  background-color: var(--primary-600);
  border-color: var(--primary-600);
}

/* 卡片主题样式 */
.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
}

.card-header {
  border-bottom: 1px solid var(--border-secondary);
  background-color: var(--bg-secondary);
}

.card-footer {
  border-top: 1px solid var(--border-secondary);
  background-color: var(--bg-tertiary);
}

/* 输入框主题样式 */
.form-input {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.form-input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}
```

## 📱 移动端适配

### 6.1 移动端主题切换

```html
<!-- 移动端主题切换 -->
<div class="mobile-theme-switcher">
  <button 
    id="mobile-theme-toggle"
    class="mobile-theme-toggle"
  >
      <i id="mobile-theme-icon"></i>
    </button>
    
    <div id="mobile-theme-menu" class="mobile-theme-menu" style="display: none;">
      <div class="mobile-theme-options">
        <button 
          id="mobile-theme-light-btn"
        >
          <i class="icon-sun"></i>
          <span>明亮</span>
        </button>
        
        <button 
          id="mobile-theme-dark-btn"
        >
          <i class="icon-moon"></i>
          <span>暗黑</span>
        </button>
        
        <button 
          id="mobile-theme-auto-btn"
        >
          <i class="icon-auto"></i>
          <span>自动</span>
        </button>
      </div>
    </div>
  </div>
</div>

```css
/* 移动端主题切换样式 */
@media (max-width: 768px) {
  .mobile-theme-switcher {
    position: relative;
  }
  
  .mobile-theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    background: none;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: var(--radius-md);
  }
  
  .mobile-theme-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--spacing-2);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    min-width: 120px;
  }
  
  .mobile-theme-options {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-2);
  }
  
  .mobile-theme-options button {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    width: 100%;
    padding: var(--spacing-3);
    border: none;
    background: none;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: all 0.2s ease-in-out;
  }
  
  .mobile-theme-options button:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }
  
  .mobile-theme-options button.active {
    background-color: var(--primary-500);
    color: white;
  }
}
```

## 🚀 集成指南

### 7.1 原生JavaScript应用集成

```javascript
// main.js
import { App } from './app.js';
import { ThemeModule } from './modules/theme.js';

// 初始化应用
const app = new App('#app');

// 初始化主题模块
const themeModule = new ThemeModule();

// 启动应用
app.init();
```

### 7.2 组件使用

```html
```html
<!--
  <div class="app">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <div class="navbar-brand">SPCP</div>
      <div class="navbar-menu">
        <a href="/dashboard">仪表盘</a>
        <a href="/projects">项目</a>
      </div>
      <div class="navbar-actions">
        <ThemeSwitcher />
        <UserMenu />
      </div>
    </nav>
    
    <!-- 主要内容 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
-->
```

```javascript
// 组件JavaScript代码
// 导入主题切换组件
// 导入用户菜单组件

// 组件类定义
class Component {
  name: 'App',
  components: {
    ThemeSwitcher,
    UserMenu
  }
}
</script>
```

### 7.3 页面组件使用

```html
```html
<!--
  <div class="dashboard-page">
    <h1>仪表盘</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>项目数量</h3>
        <p class="stat-number">{{ projectCount }}</p>
      </div>
      <div class="stat-card">
        <h3>贡献数量</h3>
        <p class="stat-number">{{ contributionCount }}</p>
      </div>
    </div>
  </div>
-->
```

```javascript
// 组件JavaScript代码
import { useTheme } from '@/composables/useTheme';

// 组件类定义
class Component {
  name: 'Dashboard',
  setup() {
    const { currentTheme, effectiveTheme } = useTheme();
    
    return {
      currentTheme,
      effectiveTheme
    };
  },
  data() {
    return {
      projectCount: 12,
      contributionCount: 45
    };
  }
}
</script>

<style scoped>
.dashboard-page {
  padding: var(--spacing-6);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-6);
}

.stat-card {
  padding: var(--spacing-4);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.stat-card h3 {
  margin: 0 0 var(--spacing-2) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.stat-number {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-500);
}
</style>
```

## 📋 最佳实践

### 8.1 主题设计原则

1. **保持对比度**: 确保文字和背景有足够的对比度
2. **语义化颜色**: 使用语义化的颜色变量名
3. **平滑过渡**: 主题切换时提供平滑的过渡动画
4. **一致性**: 所有组件使用统一的主题变量
5. **可访问性**: 支持键盘导航和屏幕阅读器

### 8.2 性能优化

1. **CSS变量**: 使用CSS变量实现高效的主题切换
2. **避免重复**: 避免在JavaScript中重复设置样式
3. **懒加载**: 按需加载主题相关的样式
4. **缓存**: 缓存用户主题选择

### 8.3 用户体验

1. **默认暗黑主题**: 默认使用暗黑主题
2. **即时预览**: 提供主题预览功能
3. **持久化**: 记住用户的选择
4. **快速切换**: 提供快速切换按钮

## 🎨 布局组件主题样式

### 9.1 智能布局系统

#### 9.1.1 主内容区域
```css
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

#### 9.1.2 下拉菜单
```css
.dropdown-toggle {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.dropdown-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 160px;
  z-index: 1000;
  display: none;
  padding: var(--spacing-2) 0;
}
```

#### 9.1.3 信息面板
```css
.info-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  height: fit-content;
}

.info-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.btn-close {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
```

### 9.2 工作区状态标识

```css
.workspace-separator {
  margin: var(--spacing-4) 0;
  text-align: center;
  color: var(--text-secondary);
}

.separator-text {
  background: var(--bg-primary);
  padding: 0 var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.status-icon {
  margin-left: var(--spacing-1);
  font-size: var(--font-size-sm);
}
```

### 9.3 编辑器页面主题样式

#### 9.3.1 编辑器主容器
```css
.editor-main-container {
  display: flex;
  gap: var(--spacing-4);
  transition: all 0.3s ease;
}

.editor-main-container.full-width .editor-section {
  width: 100%;
}

.editor-main-container.split-view .editor-section {
  width: 75%;
}

.editor-main-container.split-view .info-panel {
  width: 25%;
  display: block;
}
```

#### 9.3.2 面包屑容器
```css
.breadcrumb-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--text-secondary);
}

.breadcrumb-item.clickable {
  color: var(--primary-500);
  cursor: pointer;
  text-decoration: underline;
}

.breadcrumb-item.clickable:hover {
  color: var(--primary-600);
}

.breadcrumb-item.current {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}
```

#### 9.3.3 编辑器工具栏
```css
.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.editor-toolbar-left {
  display: flex;
  gap: var(--spacing-2);
}

.editor-toolbar-right {
  display: flex;
  gap: var(--spacing-2);
}
```

#### 9.3.4 编辑器内容区域
```css
.editor-panel {
  flex: 1;
  padding: var(--spacing-4);
}

#markdownEditor {
  width: 100%;
  height: 500px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
}

#markdownEditor:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 2px var(--primary-100);
}
```

#### 9.3.5 编辑器信息面板
```css
.editor-page .file-info-grid {
  display: grid;
  gap: var(--spacing-3);
}

.editor-page .file-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) 0;
  border-bottom: 1px solid var(--border-color);
}

.editor-page .file-info-item:last-child {
  border-bottom: none;
}

.editor-page .file-info-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.editor-page .file-info-value {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.editor-page .status-editing {
  color: var(--warning-500);
}
```

---

**文档状态**: 草稿  
**下次评审**: 2025年11月1日  
**负责人**: UI设计团队  
**审核人**: 技术团队
