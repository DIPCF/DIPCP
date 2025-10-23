# GitHub Actions 自动批准协作申请

这个目录包含了用于自动批准协作申请的GitHub Actions工作流。

## 设置步骤

### 1. 确保标签存在
在GitHub仓库中创建以下标签：
- `contribution-application` - 用于标识协作申请
- `approved` - 用于标识已批准的申请
- `contribution-approved` - 用于标识已批准的协作申请
- `error` - 用于标识处理错误的申请
- `needs-manual-review` - 用于标识需要手动审核的申请

### 2. 工作流说明

**文件位置**: `.github/workflows/auto-approve-collaborators.yml`

**触发条件**: 
- 当有新的Issue被创建时
- 且该Issue包含`contribution-application`标签

**工作流程**:
1. 从Issue标题中提取用户名（格式：`申请成为贡献者 - username`）
2. 尝试将用户添加为仓库协作者（推送权限）
3. 如果成功：
   - 添加`approved`和`contribution-approved`标签
   - 关闭Issue
   - 添加成功评论
4. 如果失败：
   - 添加`error`和`needs-manual-review`标签
   - 添加错误评论，需要手动处理

### 3. 权限要求

工作流使用`GITHUB_TOKEN`，需要以下权限：
- `issues: write` - 修改Issue状态和标签
- `pull: write` - 添加协作者
- `contents: read` - 读取仓库内容

### 4. 测试

1. 通过SPCP提交协作申请
2. 检查GitHub Actions是否被触发
3. 查看Issue是否被自动处理
4. 确认用户是否被添加为协作者

## 故障排除

如果自动批准失败：
1. 检查GitHub Actions日志
2. 确认用户名是否正确
3. 检查仓库权限设置
4. 手动添加协作者并关闭Issue
