# Issues 页面线框图

## 📋 页面信息

- **页面名称**: Issues 页面
- **页面路径**: `/issues`
- **页面类型**: 问题跟踪页面
- **访问权限**: 需要登录
- **创建日期**: 2024年10月27日
- **最后更新**: 2024年10月27日
- **数据来源**: GitHub Issues API

## 🎯 页面布局

### Issues 列表视图
```
┌─────────────────────────────────────────────────────────┐
│ SPCP Logo    导航菜单                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🐛 Issues                                   [+New issue]│
│                                                          │
│  ┌──────────────────────────────────────┐               │
│  │ 🔍 Search or jump to...              │ [Filters▼]   │
│  │                                      │ [Labels▼]    │
│  │                                      │ [Sort▼]      │
│  └──────────────────────────────────────┘               │
│                                                          │
│  ○ Open  ● Closed                                       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🔒 [Bug] Unable to connect to server                 │ │
│  │   #123 opened 2 days ago by alice · 5 comments      │ │
│  │                                                       │ │
│  │   I'm experiencing connection issues when trying to │ │
│  │   connect to the server...                          │ │
│  │                                                       │ │
│  │   🏷️ bug  🔥 high-priority                          │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🎨 [Feature] Add dark mode support                  │ │
│  │   #122 opened 1 week ago by bob · 12 comments       │ │
│  │                                                       │ │
│  │   Users have been requesting dark mode functionality│ │
│  │   for better accessibility...                       │ │
│  │                                                       │ │
│  │   🏷️ enhancement  💬 discussion                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🐛 [Bug] Memory leak in data processing            │ │
│  │   #121 opened 2 weeks ago by carol · 8 comments     │ │
│  │                                                       │ │
│  │   There appears to be a memory leak when processing │ │
│  │   large datasets...                                 │ │
│  │                                                       │ │
│  │   🏷️ bug  🐝 critical                              │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  📄 Page 1 of 5                                          │
└─────────────────────────────────────────────────────────┘
```

### Issue 详情视图
```
┌─────────────────────────────────────────────────────────┐
│ SPCP Logo    导航菜单                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ← Back to Issues                                       │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🐛 [Bug] Unable to connect to server                 │ │
│  │   #123                                               │ │
│  │   opened 2 days ago by alice · 5 comments           │ │
│  │                                                       │ │
│  │   🏷️ bug  🔥 high-priority                          │ │
│  │                                                       │ │
│  │   👤 Assignees: Nobody - [assign]                    │ │
│  │   🏷️  Labels: bug, high-priority - [edit labels]    │ │
│  │   📌 Projects: None - [add to project]              │ │
│  │   🚨 Milestone: None - [add to milestone]           │ │
│  │                                                       │ │
│  │   ┌─────────────────────────────────────────────┐   │ │
│  │   │ 👤 alice                                   │   │ │
│  │   │ commented 2 days ago                       │   │ │
│  │   │                                             │   │ │
│  │   │ I'm experiencing connection issues when     │   │ │
│  │   │ trying to connect to the server. The error  │   │ │
│  │   │ message is as follows:                     │   │ │
│  │   │                                             │   │ │
│  │   │ ```                                        │   │ │
│  │   │ Connection refused: connect()              │   │ │
│  │   │ ```                                        │   │ │
│  │   │                                             │   │ │
│  │   │ Steps to reproduce:                        │   │ │
│  │   │ 1. Start the server                        │   │ │
│  │   │ 2. Try to connect                          │   │ │
│  │   │ 3. Connection is refused                   │   │ │
│  │   │                                             │   │ │
│  │   │ Expected behavior: Connection should succeed│   │ │
│  │   │ Actual behavior: Connection is refused      │   │ │
│  │   │                                             │   │ │
│  │   │ Environment:                               │   │ │
│  │   │ - OS: Windows 10                           │   │ │
│  │   │ - Version: 1.0.0                           │   │ │
│  │   └─────────────────────────────────────────────┘   │ │
│  │                                                       │ │
│  │   ┌─────────────────────────────────────────────┐   │ │
│  │   │ 👤 bob                                      │   │ │
│  │   │ commented 1 day ago                        │   │ │
│  │   │                                             │   │ │
│  │   │ I can reproduce this issue. It seems to be  │   │ │
│  │   │ related to the network configuration.       │   │ │
│  │   │                                             │   │ │
│  │   │ @alice Can you check your firewall settings?│   │ │
│  │   └─────────────────────────────────────────────┘   │ │
│  │                                                       │ │
│  │   ┌─────────────────────────────────────────────┐   │ │
│  │   │ 👤 alice                                   │   │ │
│  │   │ commented 1 day ago                        │   │ │
│  │   │                                             │   │ │
│  │   │ I've already checked the firewall settings. │   │ │
│  │   │ They seem to be correct.                    │   │ │
│  │   │                                             │   │ │
│  │   │ Maybe it's a port issue?                   │   │ │
│  │   └─────────────────────────────────────────────┘   │ │
│  │                                                       │ │
│  │   💬 Write a comment                              │ │ │
│  │   ┌─────────────────────────────────────────────┐   │ │
│  │   │                                             │   │ │
│  │   │                                             │   │ │
│  │   │                                             │   │ │
│  │   └─────────────────────────────────────────────┘   │ │
│  │                                                       │ │
│  │   [💬 Comment]  [🎨 Format]  [📎 Attach files]      │ │
│  │                                                       │ │
│  │   [Close with comment]                               │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                    Sidebar                          │ │
│  │                                                      │ │
│  │  👤 Assignees                                       │ │
│  │  Nobody - [assign yourself]                         │ │
│  │                                                      │ │
│  │  🏷️  Labels                                         │ │
│  │  🏷️ bug                                            │ │
│  │  🔥 high-priority                                   │ │
│  │  [edit]                                             │ │
│  │                                                      │ │
│  │  📌 Projects                                        │ │
│  │  None - [add to project]                            │ │
│  │                                                      │ │
│  │  🚨 Milestone                                       │ │
│  │  None - [add to milestone]                          │ │
│  │                                                      │ │
│  │  🔗 Development                                     │ │
│  │  No linked pull requests                            │ │
│  │  [create branch]                                    │ │
│  │                                                      │ │
│  │  📎 Notifications                                   │ │
│  │  ✓ Subscribed                                       │ │
│  │  [unsubscribe]                                      │ │
│  │                                                      │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🎨 主要功能

### 1. Issues 列表功能

#### 搜索和筛选
- **搜索框**: 支持搜索 issues 的标题、内容、作者等
- **过滤器**:
  - Open / Closed
  - Author (作者)
  - Assignee (负责人)
  - Labels (标签)
  - Projects (项目)
  - Milestone (里程碑)
  - Comments (评论数)
  - Created date (创建日期)
  - Updated date (更新时间)
- **排序方式**:
  - Newest (最新)
  - Oldest (最早)
  - Most commented (评论最多)
  - Least commented (评论最少)
  - Recently updated (最近更新)
  - Least recently updated (最久未更新)

#### Issue 卡片信息
- Issue 编号和标题
- 作者和创建时间
- 评论数量
- 标签（Labels）
- 负责人（Assignee）
- Issue 类型图标（Bug、Feature、Question 等）
- 优先级指示器（Critical、High、Medium、Low）
- 内容预览

### 2. Issue 详情功能

#### 基本信息
- Issue 编号和标题
- 状态（Open / Closed / Merged）
- 作者和创建时间
- 标签列表
- 负责人列表
- 所属项目
- 所属里程碑

#### 操作按钮
- **Edit** (编辑): 编辑标题和内容
- **Close** (关闭): 关闭 issue
- **Reopen** (重新打开): 重新打开已关闭的 issue
- **Delete** (删除): 删除 issue（仅管理员）
- **Lock conversation** (锁定对话): 防止新评论
- **Convert to discussion** (转换为讨论)
- **Create pull request** (创建 PR)

#### 评论功能
- 评论编辑器（Markdown 支持）
- 评论列表（按时间排序或按最新排序）
- 回复评论
- 编辑自己的评论
- 删除自己的评论
- 引用评论
- 表情反应

#### 侧边栏功能
- **Assignees** (负责人): 分配或移除负责人
- **Labels** (标签): 添加或移除标签
- **Projects** (项目): 添加到项目
- **Milestone** (里程碑): 关联到里程碑
- **Development** (开发): 关联的 Pull Requests
- **Notifications** (通知): 订阅或取消订阅
- **Participants** (参与者): 显示参与讨论的所有人员

### 3. 创建 Issue

#### 表单字段
- **Title** (标题): 简洁描述问题
- **Description** (描述): 详细描述（支持 Markdown）
  - 问题描述
  - 复现步骤
  - 期望行为
  - 实际行为
  - 环境信息
  - 截图或日志（如果适用）
- **Labels** (标签): 选择或创建标签
- **Assignees** (负责人): 指定负责人
- **Projects** (项目): 添加到项目
- **Milestone** (里程碑): 关联到里程碑

### 4. Issue 模板

提供预定义的 Issue 模板：
- 🐛 Bug Report (错误报告)
- 🎨 Feature Request (功能请求)
- 📖 Documentation (文档)
- ❓ Question (问题)
- 🔧 Configuration (配置)
- 📝 Task (任务)

## 🎯 与 Discussions 的区别

### Issues
- **用途**: 问题跟踪、任务管理、Bug 报告
- **特点**: 有明确的状态（Open/Closed）、负责人生成、标签、里程碑、项目关联
- **适用场景**: 需要跟进和解决的问题、功能请求、Bug 报告

### Discussions
- **用途**: 开放式讨论、问答、想法分享
- **特点**: 更加非正式、支持多种分类、面向社区交流
- **适用场景**: 技术讨论、经验分享、社区互动

## 📝 注意事项

1. **权限控制**: 不同角色的用户有不同权限
   - Owner/Admin: 所有操作权限
   - Maintainer: 可以关闭 issues、分配负责人、添加标签
   - Contributor: 可以创建和评论 issues
   - Visitor: 只能查看 issues

2. **通知机制**: 所有相关人员都应收到通知
   - Issue 作者
   - 负责人
   - 评论者
   - 订阅者

3. **工作流集成**: Issues 与 Pull Requests、Actions 等集成

4. **模板使用**: 鼓励使用 Issue 模板，提高信息质量

5. **标签管理**: 建立清晰的标签体系，便于分类和搜索
