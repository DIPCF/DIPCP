# GitHub Actions 工作流安全设置指南

## 🔒 工作流文件保护设置


### 1. CODEOWNERS 文件设置

#### 创建 `.github/CODEOWNERS` 文件：

```bash
# 全局所有者 - 组织管理员
* @DIPCF/owners
```
#### 创建 `.github/workflows/cla-submission-simplified.yml` 文件：
将cla-submission-simplified.yml中的内容复制粘贴。


### 2. 分支保护规则设置

#### 在 `DIPCF/Projects` 仓库中设置：

> **注意**：以下设置选项与GitHub实际界面完全对应，请按照界面中的确切选项名称进行配置。

1. **进入仓库设置**
   - 访问 `https://github.com/DIPCF/Projects/settings`
   - 点击左侧菜单 "Branches"

2. **添加分支保护规则**
   - 点击 "Add rule" 或 "Add branch protection rule"
   - Branch name pattern: `main` (或您的主分支名称)

3. **配置保护规则**
   ```
   ✅ Require a pull request before merging
     ✅ Require approvals (设置至少1个审批)
     ✅ Dismiss stale pull request approvals when new commits are pushed
     ✅ Require review from Code Owners
   
   ✅ Require status checks to pass before merging
     ✅ Require branches to be up to date before merging
   
   ✅ Require conversation resolution before merging
   
   ✅ Do not allow bypassing the above settings (重要：管理员也需要遵循规则)
   
   ❌ Allow force pushes (禁用强制推送)
   ❌ Allow deletions (禁用分支删除)
   ```

4. **限制推送权限**
   ```
   ✅ Restrict who can push to matching branches
     指定允许推送到匹配分支的人员、团队或应用
     - 建议只允许 @DIPCF/owners 团队
     - 或者使用 GitHub App/Bot 账户
   ```

5. **其他可选设置**
   ```
   ❌ Require signed commits (可选：要求签名提交)
   ❌ Require linear history (可选：要求线性历史)
   ❌ Require merge queue (可选：要求合并队列)
   ❌ Lock branch (可选：锁定分支为只读)
   ```

### 第3步：添加
1. Settings -> Secrets and variables -> Actions
2. New repository secret
3. 添加 CLA_REPOSITORY_TOKEN 内容用所有者的令牌
