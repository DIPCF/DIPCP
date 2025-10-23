# SPCP 模板文件

这个目录包含SPCP系统使用的各种模板文件。

## 文件说明

### `auto-approve-collaborators.yml`
GitHub Actions工作流模板，用于自动批准协作申请。

**功能：**
- 当有新的带有 `contribution-application` 标签的Issue被创建时触发
- 自动提取申请人的用户名
- 将用户添加为仓库协作者
- 添加批准标签并关闭Issue
- 发送欢迎评论

**使用方法：**
1. 系统会在所有者登录时自动检查此文件是否存在
2. 如果不存在，会自动创建并提交到仓库的 `.github/workflows/` 目录
3. 无需手动配置

**注意事项：**
- 需要仓库管理员权限才能添加协作者
- 如果自动添加失败，会添加错误标签并发送通知
- 建议在仓库设置中创建相应的标签：`contribution-application`, `approved`, `contribution-approved`, `error`, `needs-manual-review`
