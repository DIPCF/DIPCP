# 自定义组件系统

这是一个基于原生JavaScript的轻量级组件系统，用于替代直接操作DOM的HTML字符串拼接方式。

## 核心特性

- 🎯 **组件化开发**: 将UI拆分为可复用的组件
- 🔄 **状态管理**: 支持组件状态更新和重新渲染
- 🎨 **生命周期**: 提供组件挂载、更新、销毁等生命周期钩子
- 📦 **组件注册**: 支持动态注册和创建组件
- 🎪 **事件处理**: 内置事件监听器管理

## 基础组件

### Component (基类)
所有组件的基类，提供基础的生命周期和状态管理功能。

```javascript
class MyComponent extends Component {
    render() {
        return this.createElement('div', {
            className: 'my-component'
        }, 'Hello World');
    }
}
```

### StatusIndicator (状态指示器)
用于显示各种状态信息，如保存状态、修改状态等。

```javascript
const statusIndicator = new StatusIndicator({
    status: 'modified',
    text: '已修改'
});

// 更新状态
statusIndicator.setModified();
statusIndicator.setSaved();
statusIndicator.setError('错误信息');
```

### InfoItem (信息项)
用于显示标签和值的配对信息。

```javascript
const infoItem = new InfoItem({
    label: '文件名:',
    value: 'README.md',
    className: 'file-info'
});

// 更新值
infoItem.setValue('NEW_FILE.md');
```

### CollaborationInfo (协作信息)
显示文件协作相关的状态信息。

```javascript
const collaborationInfo = new CollaborationInfo({
    isModified: true,
    hasUncommittedChanges: true
});

// 更新状态
collaborationInfo.setModified(false);
collaborationInfo.setUncommittedChanges(false);
```

### HistoryItem (历史项)
用于显示单个提交历史记录。

```javascript
const historyItem = new HistoryItem({
    message: '修复了登录问题',
    author: '张三',
    date: '2小时前'
});

// 更新提交信息
historyItem.updateCommit({
    message: '更新了登录逻辑',
    author: '李四',
    date: '1小时前'
});
```

### EditHistoryList (编辑历史列表)
显示文件的编辑历史记录列表。

```javascript
const editHistory = new EditHistoryList({
    commits: commitData,
    loading: false
});

// 设置提交历史
editHistory.setCommits(commits);
editHistory.setLoading(true);
editHistory.setError('加载失败');
```

### FileInfo (文件信息)
显示文件的基本信息。

```javascript
const fileInfo = new FileInfo({
    fileName: 'README.md',
    fileType: 'Markdown',
    fileSize: '2.5 KB',
    lastModified: '3天前'
});

// 更新文件信息
fileInfo.updateFileInfo({
    fileName: 'NEW_FILE.md',
    fileSize: '1.2 KB'
});
```

### StatusBar (状态栏)
显示编辑器的状态信息。

```javascript
const statusBar = new StatusBar({
    currentLine: 15,
    totalLines: 100,
    fileSize: '2.5 KB',
    status: '已修改'
});

// 更新状态
statusBar.updateStatus({
    currentLine: 20,
    status: '已保存'
});
```

### BreadcrumbItem (面包屑项)
用于显示面包屑导航中的单个路径项。

```javascript
const breadcrumbItem = new BreadcrumbItem({
    text: 'docs',
    path: '/docs',
    icon: '📁',
    clickable: true,
    onClick: (path, text) => console.log('点击了:', path)
});

// 更新项
breadcrumbItem.updateItem({
    text: 'new-docs',
    path: '/new-docs'
});
```

### Breadcrumb (面包屑导航)
显示文件路径的面包屑导航。

```javascript
const breadcrumb = new Breadcrumb({
    repoName: 'MyProject',
    filePath: 'docs/README.md',
    onItemClick: (path, text) => console.log('导航到:', path)
});

// 更新面包屑
breadcrumb.updateBreadcrumb({
    repoName: 'NewProject',
    filePath: 'src/components/Button.js'
});
```

### MemberItem (成员项)
用于显示项目成员信息。

```javascript
const memberItem = new MemberItem({
    login: 'zhangsan',
    avatarUrl: 'https://github.com/zhangsan.png',
    contributions: 25
});

// 更新成员信息
memberItem.updateMember({
    login: 'lisi',
    contributions: 30
});
```

### MembersList (成员列表)
显示项目成员列表。

```javascript
const membersList = new MembersList({
    members: contributorsData,
    loading: false
});

// 设置成员列表
membersList.setMembers(newMembers);
membersList.setLoading(true);
membersList.setError('加载失败');
```

### ActivityItem (活动项)
用于显示单个活动记录。

```javascript
const activityItem = new ActivityItem({
    message: '修复了登录问题',
    author: '张三',
    date: '2小时前'
});

// 更新活动信息
activityItem.updateActivity({
    message: '更新了登录逻辑',
    author: '李四',
    date: '1小时前'
});
```

### ActivityList (活动列表)
显示项目活动列表。

```javascript
const activityList = new ActivityList({
    activities: commitsData,
    maxItems: 10
});

// 设置活动列表
activityList.setActivities(newActivities);
activityList.setMaxItems(20);
```

### FileItem (文件项)
用于显示文件或目录项。

```javascript
const fileItem = new FileItem({
    name: 'README.md',
    type: 'file',
    isLocal: true,
    onClick: (name, type) => console.log('点击了:', name)
});

// 更新文件项
fileItem.updateFile({
    name: 'NEW_FILE.md',
    type: 'dir',
    isLocal: false
});
```

### LoadingState (加载状态)
用于显示加载中的状态。

```javascript
const loadingState = new LoadingState({
    message: '加载中...',
    showSpinner: true
});

// 更新加载消息
loadingState.setMessage('正在处理...');
```

### ErrorState (错误状态)
用于显示错误信息。

```javascript
const errorState = new ErrorState({
    message: '发生错误',
    onRetry: () => console.log('重试')
});

// 更新错误消息
errorState.setMessage('网络连接失败');
```

### StateDisplay (状态显示)
用于显示各种状态（加载、错误、空状态、成功等）。

```javascript
const stateDisplay = new StateDisplay({
    type: 'loading',
    message: '加载中...'
});

// 切换状态
stateDisplay.setLoading('正在加载数据...');
stateDisplay.setError('加载失败', () => retry());
stateDisplay.setSuccess('操作成功');
stateDisplay.setEmpty('暂无数据', () => refresh(), '刷新');
```

## 使用方法

### 1. 在HTML中引入组件文件

```html
<script src="../js/components/Component.js"></script>
<script src="../js/components/StatusIndicator.js"></script>
<script src="../js/components/InfoItem.js"></script>
<script src="../js/components/CollaborationInfo.js"></script>
<script src="../js/components/ComponentLoader.js"></script>
```

### 2. 使用组件加载器创建组件

```javascript
// 创建协作信息组件
const collaborationInfo = window.ComponentLoader.createComponent('CollaborationInfo', {
    isModified: false,
    hasUncommittedChanges: true
});

// 挂载到DOM
collaborationInfo.mount(document.getElementById('container'));
```

### 3. 直接实例化组件

```javascript
// 直接创建组件实例
const statusIndicator = new StatusIndicator({
    status: 'saved',
    text: '已保存'
});

// 挂载到DOM
statusIndicator.mount(document.getElementById('status-container'));
```

## 组件开发指南

### 创建自定义组件

1. 继承Component基类
2. 实现render方法
3. 定义组件状态和属性
4. 实现必要的更新方法

```javascript
class CustomComponent extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            // 组件状态
        };
    }

    render() {
        // 返回DOM元素
        return this.createElement('div', {
            className: 'custom-component'
        }, 'Content');
    }

    // 自定义更新方法
    updateContent(newContent) {
        this.setState({ content: newContent });
    }
}
```

### 组件生命周期

- `componentDidMount()`: 组件挂载后调用
- `componentDidUpdate(prevState, currentState)`: 组件更新后调用
- `componentWillUnmount()`: 组件销毁前调用

### 事件处理

```javascript
// 添加事件监听器
this.addEventListener('click', this.handleClick.bind(this));

// 移除事件监听器
this.removeEventListener('click', this.handleClick.bind(this));
```

## 最佳实践

1. **组件职责单一**: 每个组件只负责一个特定的UI功能
2. **状态管理**: 使用setState更新状态，避免直接修改DOM
3. **事件清理**: 在componentWillUnmount中清理事件监听器
4. **组件复用**: 通过props传递配置，提高组件复用性
5. **性能优化**: 避免在render方法中创建新对象

## 迁移指南

### 从HTML字符串到组件

**之前 (HTML字符串)**:
```javascript
renderCollaborationInfo(container) {
    container.innerHTML = `
        <div class="collaboration-info">
            <div class="collaboration-item">
                <label>当前状态:</label>
                <span class="status ${this.isModified ? 'modified' : 'saved'}">
                    ${this.isModified ? '已修改' : '已保存'}
                </span>
            </div>
        </div>
    `;
}
```

**之后 (组件化)**:
```javascript
renderCollaborationInfo(container) {
    container.innerHTML = '';
    
    this.collaborationInfoComponent = window.ComponentLoader.createComponent('CollaborationInfo', {
        isModified: this.isModified,
        hasUncommittedChanges: true
    });
    
    this.collaborationInfoComponent.mount(container);
}
```

## 扩展组件

要添加新的组件：

1. 创建组件文件 (如 `NewComponent.js`)
2. 在 `ComponentLoader.js` 中注册组件
3. 在HTML文件中引入组件文件
4. 使用 `ComponentLoader.createComponent()` 创建实例
