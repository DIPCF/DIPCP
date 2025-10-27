# SPCP 模板文件

这个目录包含SPCP系统使用的各种模板文件。

## 文件说明

### `auto-approve-collaborators.yml`
GitHub Actions工作流模板，用于自动批准协作申请。

**功能：**
- 当标题为 `Become a collaborator` 的Issue被创建时触发
- 自动提取申请人的用户名
- 将用户添加为仓库协作者
- 添加批准标签并关闭Issue
- 发送欢迎评论

### `grant-points.yml`
GitHub Actions工作流模板，用于审核委员赋分。

**功能：**
- 当审核委员评论 `/grant @username HP RP` 时触发
- 验证评论者身份（审核委员）
- 解析赋分信息（用户、HP、RP）
- 更新POINT目录中的积分文件
- 提交更改并回复评论

**使用方法：**
审核委员在Issue/PR评论：
```
/grant @username 100 HP 50 RP
```

**使用方法：**
1. 系统会在所有者登录时自动检查这些文件是否存在
2. 如果不存在，会自动创建并提交到仓库的 `.github/workflows/` 目录
3. 无需手动配置

