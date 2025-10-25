# 团队管理页面UI设计

## 1. 页面布局设计

### 1.1 整体布局
```
┌─────────────────────────────────────────────────────────────┐
│ 页面头部 (Header)                                           │
├─────────────────────────────────────────────────────────────┤
│ 团队列表区域 (左侧)    │ 团队详情区域 (右侧)                │
│ ┌─────────────────┐   │ ┌─────────────────────────────────┐ │
│ │ 创建团队按钮     │   │ │ 团队基本信息                    │ │
│ ├─────────────────┤   │ ├─────────────────────────────────┤ │
│ │ 团队搜索框       │   │ │ 成员管理                        │ │
│ ├─────────────────┤   │ ├─────────────────────────────────┤ │
│ │ 团队卡片1        │   │ │ 权限设置                        │ │
│ │ ┌─────────────┐ │   │ ├─────────────────────────────────┤ │
│ │ │ 👥 开发团队  │ │   │ │ 操作按钮                        │ │
│ │ │ 5名成员     │ │   │ └─────────────────────────────────┘ │
│ │ │ Write权限   │ │   │                                    │
│ │ └─────────────┘ │   │                                    │
│ ├─────────────────┤   │                                    │
│ │ 团队卡片2        │   │                                    │
│ │ ┌─────────────┐ │   │                                    │
│ │ │ 👥 测试团队  │ │   │                                    │
│ │ │ 3名成员     │ │   │                                    │
│ │ │ Read权限    │ │   │                                    │
│ │ └─────────────┘ │   │                                    │
│ └─────────────────┘   │                                    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 响应式设计
- **桌面端 (≥1200px)**: 左右分栏布局
- **平板端 (768px-1199px)**: 上下布局，可切换视图
- **移动端 (<768px)**: 全屏布局，支持滑动切换

## 2. 组件设计

### 2.1 页面头部组件
```html
<div class="team-management-header">
  <div class="header-left">
    <button class="btn-back" id="backBtn">
      <span class="icon">←</span>
      返回项目
    </button>
    <h1 class="page-title">团队管理</h1>
  </div>
  <div class="header-right">
    <button class="btn-refresh" id="refreshBtn">
      <span class="icon">🔄</span>
      刷新
    </button>
  </div>
</div>
```

**样式设计**:
```css
.team-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.btn-back, .btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover, .btn-refresh:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}
```

### 2.2 团队列表组件
```html
<div class="team-list-container">
  <div class="team-list-header">
    <button class="btn-create-team" id="createTeamBtn">
      <span class="icon">➕</span>
      创建团队
    </button>
    <div class="team-search">
      <input type="text" placeholder="搜索团队..." id="teamSearchInput">
      <span class="search-icon">🔍</span>
    </div>
  </div>
  <div class="team-list" id="teamList">
    <!-- 团队卡片将动态插入这里 -->
  </div>
</div>
```

### 2.3 团队卡片组件
```html
<div class="team-card" data-team-id="team1">
  <div class="team-card-header">
    <div class="team-icon">👥</div>
    <div class="team-info">
      <h3 class="team-name">开发团队</h3>
      <p class="team-description">负责项目核心开发工作</p>
    </div>
    <div class="team-actions">
      <button class="btn-icon" title="编辑团队" data-action="edit">
        <span class="icon">✏️</span>
      </button>
      <button class="btn-icon" title="删除团队" data-action="delete">
        <span class="icon">🗑️</span>
      </button>
    </div>
  </div>
  <div class="team-card-stats">
    <span class="stat">
      <span class="stat-icon">👤</span>
      成员: 5
    </span>
    <span class="stat">
      <span class="stat-icon">🔑</span>
      权限: Write
    </span>
  </div>
</div>
```

**样式设计**:
```css
.team-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.team-card:hover {
  border-color: var(--accent-color);
  box-shadow: 0 2px 8px var(--shadow-light);
}

.team-card.selected {
  border-color: var(--accent-color);
  background: var(--accent-light);
}

.team-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.team-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.team-info {
  flex: 1;
}

.team-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.team-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.team-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-hover);
  color: var(--accent-color);
}

.team-card-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 14px;
}
```

### 2.4 团队详情组件
```html
<div class="team-detail-container">
  <div class="team-detail-header">
    <h2 class="detail-title">团队详情</h2>
    <button class="btn-close" id="closeDetailBtn">
      <span class="icon">✕</span>
    </button>
  </div>
  
  <div class="team-detail-content">
    <!-- 团队基本信息 -->
    <div class="detail-section">
      <h3 class="section-title">基本信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>团队名称</label>
          <input type="text" id="teamNameInput" value="开发团队">
        </div>
        <div class="info-item">
          <label>团队描述</label>
          <textarea id="teamDescriptionInput" rows="3">负责项目核心开发工作</textarea>
        </div>
        <div class="info-item">
          <label>隐私设置</label>
          <select id="teamPrivacySelect">
            <option value="closed">私有</option>
            <option value="secret">秘密</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 成员管理 -->
    <div class="detail-section">
      <div class="section-header">
        <h3 class="section-title">成员管理</h3>
        <button class="btn-add-member" id="addMemberBtn">
          <span class="icon">➕</span>
          添加成员
        </button>
      </div>
      <div class="member-list" id="memberList">
        <!-- 成员列表将动态插入这里 -->
      </div>
    </div>

    <!-- 权限设置 -->
    <div class="detail-section">
      <h3 class="section-title">权限设置</h3>
      <div class="permission-grid">
        <div class="permission-item">
          <label>仓库权限</label>
          <select id="repositoryPermissionSelect">
            <option value="read">读取</option>
            <option value="triage">分类</option>
            <option value="write">写入</option>
            <option value="admin">管理</option>
          </select>
        </div>
        <div class="permission-item">
          <label>分支权限</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <input type="checkbox" id="canPushMain">
              <span>可推送到main分支</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="canCreateBranch">
              <span>可创建分支</span>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" id="canMergePR">
              <span>可合并PR</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="team-detail-actions">
    <button class="btn-secondary" id="cancelBtn">取消</button>
    <button class="btn-primary" id="saveBtn">保存更改</button>
  </div>
</div>
```

### 2.5 成员项组件
```html
<div class="member-item" data-username="username">
  <img class="member-avatar" src="https://github.com/username.png" alt="用户名">
  <div class="member-info">
    <span class="member-username">username</span>
    <span class="member-role">Member</span>
  </div>
  <div class="member-actions">
    <button class="btn-icon" title="编辑权限" data-action="edit-permission">
      <span class="icon">⚙️</span>
    </button>
    <button class="btn-icon" title="移除成员" data-action="remove">
      <span class="icon">❌</span>
    </button>
  </div>
</div>
```

## 3. 模态框设计

### 3.1 创建团队模态框
```html
<div class="modal-overlay" id="createTeamModal">
  <div class="modal-container">
    <div class="modal-header">
      <h3 class="modal-title">创建新团队</h3>
      <button class="btn-close" id="closeCreateModal">
        <span class="icon">✕</span>
      </button>
    </div>
    <div class="modal-content">
      <form id="createTeamForm">
        <div class="form-group">
          <label for="newTeamName">团队名称 *</label>
          <input type="text" id="newTeamName" required>
          <div class="form-hint">团队名称必须是唯一的</div>
        </div>
        <div class="form-group">
          <label for="newTeamDescription">团队描述</label>
          <textarea id="newTeamDescription" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label for="newTeamPrivacy">隐私设置</label>
          <select id="newTeamPrivacy">
            <option value="closed">私有 - 只有团队成员可见</option>
            <option value="secret">秘密 - 只有组织成员可见</option>
          </select>
        </div>
      </form>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" id="cancelCreateBtn">取消</button>
      <button class="btn-primary" id="confirmCreateBtn">创建团队</button>
    </div>
  </div>
</div>
```

### 3.2 添加成员模态框
```html
<div class="modal-overlay" id="addMemberModal">
  <div class="modal-container">
    <div class="modal-header">
      <h3 class="modal-title">添加团队成员</h3>
      <button class="btn-close" id="closeAddMemberModal">
        <span class="icon">✕</span>
      </button>
    </div>
    <div class="modal-content">
      <form id="addMemberForm">
        <div class="form-group">
          <label for="memberUsername">GitHub用户名 *</label>
          <input type="text" id="memberUsername" required>
          <div class="form-hint">输入要添加的GitHub用户名</div>
        </div>
        <div class="form-group">
          <label for="memberRole">团队角色</label>
          <select id="memberRole">
            <option value="member">成员</option>
            <option value="maintainer">维护者</option>
          </select>
        </div>
        <div class="form-group">
          <label for="memberPermission">仓库权限</label>
          <select id="memberPermission">
            <option value="read">读取</option>
            <option value="triage">分类</option>
            <option value="write">写入</option>
            <option value="admin">管理</option>
          </select>
        </div>
      </form>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" id="cancelAddMemberBtn">取消</button>
      <button class="btn-primary" id="confirmAddMemberBtn">添加成员</button>
    </div>
  </div>
</div>
```

## 4. 交互设计

### 4.1 团队选择交互
- 点击团队卡片选中团队
- 选中状态高亮显示
- 右侧显示团队详情

### 4.2 成员管理交互
- 悬停显示操作按钮
- 点击编辑权限打开权限设置
- 点击移除显示确认对话框

### 4.3 搜索和筛选
- 实时搜索团队名称
- 按权限级别筛选
- 按成员数量排序

### 4.4 拖拽排序
- 团队成员可拖拽排序
- 拖拽时显示视觉反馈
- 拖拽完成后自动保存

## 5. 状态指示

### 5.1 加载状态
```css
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

### 5.2 错误状态
```css
.error {
  border-color: var(--error-color);
  background: var(--error-light);
}

.error-message {
  color: var(--error-color);
  font-size: 12px;
  margin-top: 4px;
}
```

### 5.3 成功状态
```css
.success {
  border-color: var(--success-color);
  background: var(--success-light);
}

.success-message {
  color: var(--success-color);
  font-size: 12px;
  margin-top: 4px;
}
```

## 6. 响应式设计

### 6.1 移动端适配
```css
@media (max-width: 768px) {
  .team-management-container {
    flex-direction: column;
  }
  
  .team-list-container {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .team-detail-container {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: var(--bg-primary);
  }
}
```

### 6.2 平板端适配
```css
@media (min-width: 769px) and (max-width: 1199px) {
  .team-management-container {
    flex-direction: column;
  }
  
  .team-list-container {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .team-detail-container {
    width: 100%;
  }
}
```

## 7. 动画效果

### 7.1 页面切换动画
```css
.team-management-page {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### 7.2 卡片悬停动画
```css
.team-card {
  transition: all 0.2s ease;
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}
```

### 7.3 模态框动画
```css
.modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

**设计版本**: v1.0  
**创建日期**: 2025-10-24  
**最后更新**: 2025-10-24  
**设计者**: SPCP UI团队
