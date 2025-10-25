/**
 * 登录页面组件
 * 完全组件化的登录页面
 */
class LoginPage extends BasePage {
	constructor(props = {}) {
		super(props);
		this.state = {
			language: props.language || (window.I18nService ? window.I18nService.currentLanguage : 'zh-CN'),
			formData: {
				username: props.username || 'minne100',
				repositoryUrl: props.repositoryUrl || 'https://github.com/ZelaCreator/SPCP',
				accessToken: props.accessToken || ''
			},
			loading: false,
			onLogin: props.onLogin || null
		};

		// 确保主题在LoginPage渲染时被应用
		this.initTheme();
	}

	/**
	 * 初始化主题
	 */
	initTheme() {
		// 如果ThemeService存在，初始化并应用主题
		if (window.ThemeService) {
			window.ThemeService.init();
		}
	}

	render() {
		const container = document.createElement('div');
		container.className = 'login-container';
		container.innerHTML = `
			${this.renderLogo()}
			${this.renderFeatures()}
			${this.renderLoginForm()}
			${this.renderTips()}
		`;
		return container;
	}

	renderLogo() {
		return `
            <div class="logo">
                <h1>SPCP</h1>
                <p class="subtitle">${this.t('login.subtitle')}</p>
            </div>
        `;
	}

	renderFeatures() {
		return `
            <div class="features">
                <h3>${this.t('login.whyChoose')}</h3>
                <ul>
                    <li>${this.t('login.feature1')}</li>
                    <li>${this.t('login.feature2')}</li>
                    <li>${this.t('login.feature3')}</li>
                    <li>${this.t('login.feature4')}</li>
                </ul>
            </div>
        `;
	}

	renderLoginForm() {
		return `
            <div class="login-form">
                ${this.renderLanguageSelector()}
                ${this.renderFormGroups()}
                ${this.renderLoginButton()}
            </div>
        `;
	}

	renderLanguageSelector() {
		const options = window.I18nService.supportedLanguages.map(lang => {
			const isSelected = this.state.language === lang ? 'selected' : '';
			const displayName = window.I18nService.getLanguageDisplayName(lang);
			return `<option value="${lang}" ${isSelected}>${displayName}</option>`;
		}).join('');

		return `
            <div class="form-group">
                <label for="language-select">${this.t('login.language')}</label>
                <select id="language-select" aria-label="选择语言">
                    ${options}
                </select>
            </div>
        `;
	}

	renderFormGroups() {
		return `
            <div class="form-group">
                <label for="github-username">${this.t('login.githubUsername')}</label>
                <div class="input-with-help">
                    <input type="text" id="github-username" 
                        placeholder="${this.t('login.placeholders.githubUsername')}" 
                        value="${this.state.formData.username}" required>
                    <button type="button" class="help-button" id="register-help-btn">${this.t('login.howToRegister')}</button>
                </div>
            </div>

            <div class="form-group">
                <label for="access-token">${this.t('login.accessToken')}</label>
                <div class="input-with-help">
                    <input type="password" id="access-token" 
                        placeholder="${this.t('login.placeholders.accessToken')}" 
                        value="${this.state.formData.accessToken}" required>
                    <button type="button" class="help-button" id="token-help-btn">${this.t('login.howToGetToken')}</button>
                </div>
            </div>

            <div class="form-group">
                <label for="repository-url">${this.t('login.repositoryUrl')}</label>
                <input type="url" id="repository-url" 
                    placeholder="${this.t('login.placeholders.repositoryUrl')}" 
                    value="${this.state.formData.repositoryUrl}" required>
            </div>
        `;
	}

	renderLoginButton() {
		const loadingClass = this.state.loading ? 'loading' : '';
		const disabledAttr = this.state.loading ? 'disabled' : '';

		return `
            <div class="login-button-container">
                <button id="login-btn" class="btn btn-primary ${loadingClass}" ${disabledAttr}>
                    <span class="btn-text">${this.state.loading ? this.t('login.loggingIn') : this.t('login.loginButton')}</span>
                    <span class="btn-loading" style="display: none;">${this.t('login.loggingIn')}</span>
                </button>
            </div>
        `;
	}

	renderTips() {
		return `
            <div class="tips">
                <p>${this.t('login.terms')} <a href="#" id="terms-link">${this.t('login.termsLink')}</a> ${this.t('login.and')} <a href="#" id="privacy-link">${this.t('login.privacyLink')}</a></p>
            </div>
        `;
	}

	mount(element) {
		this.element = element;
		this.element.innerHTML = '';
		this.element.appendChild(this.render());
		this.bindEvents();
	}

	bindEvents() {
		// 语言选择
		const languageSelect = this.element.querySelector('#language-select');
		if (languageSelect) {
			languageSelect.addEventListener('change', async (e) => {
				const newLanguage = e.target.value;
				console.log('LoginPage: 语言切换为', newLanguage);
				await this.setLanguage(newLanguage);
			});
		}

		// 登录按钮
		const loginBtn = this.element.querySelector('#login-btn');
		if (loginBtn) {
			loginBtn.addEventListener('click', () => {
				this.handleLogin();
			});
		}

		// 注册帮助按钮
		const registerHelpBtn = this.element.querySelector('#register-help-btn');
		if (registerHelpBtn) {
			registerHelpBtn.addEventListener('click', () => {
				this.showRegisterHelp();
			});
		}

		// Token帮助按钮
		const tokenHelpBtn = this.element.querySelector('#token-help-btn');
		if (tokenHelpBtn) {
			tokenHelpBtn.addEventListener('click', () => {
				this.showTokenHelp();
			});
		}

		// 服务条款和隐私政策链接
		const termsLink = this.element.querySelector('#terms-link');
		if (termsLink) {
			termsLink.addEventListener('click', (e) => {
				e.preventDefault();
				if (window.app && window.app.navigateTo) {
					window.app.navigateTo('/terms');
				}
			});
		}

		const privacyLink = this.element.querySelector('#privacy-link');
		if (privacyLink) {
			privacyLink.addEventListener('click', (e) => {
				e.preventDefault();
				if (window.app && window.app.navigateTo) {
					window.app.navigateTo('/privacy');
				}
			});
		}

		// 表单输入
		const inputs = this.element.querySelectorAll('input');
		inputs.forEach(input => {
			input.addEventListener('input', (e) => {
				let fieldName = e.target.id.replace('github-', '').replace('-url', 'Url');
				// 处理access-token字段
				if (e.target.id === 'access-token') {
					fieldName = 'accessToken';
				}
				this.state.formData[fieldName] = e.target.value;
			});
		});
	}

	async handleLogin() {
		if (this.state.loading) return;

		try {
			this.setState({ loading: true });
			// 立即禁用按钮
			this.updateLoginButtonState('loading', this.t('login.loggingIn', '登录中...'));

			// 确保formData存在
			const formData = this.state.formData || {};
			await this.performLogin(formData);
		} catch (error) {
			this.showError(error.message);
			// 登录失败时恢复按钮状态
			this.updateLoginButtonState('default', this.t('login.loginButton', '登录并克隆仓库'));
		} finally {
			this.setState({ loading: false });
		}
	}

	showError(message) {
		const errorDiv = document.createElement('div');
		errorDiv.className = 'error-message';
		errorDiv.textContent = message;
		errorDiv.style.cssText = 'color: red; margin-top: 10px; padding: 10px; background: #ffe6e6; border: 1px solid #ff9999; border-radius: 4px;';
		this.element.querySelector('.login-form').appendChild(errorDiv);
		setTimeout(() => errorDiv.remove(), 5000);
	}

	showRegisterHelp() {
		const modal = new window.Modal();
		modal.setState({
			show: true,
			type: 'info',
			title: this.t('login.registerHelpTitle'),
			message: this.t('login.registerHelpContent'),
			showCancel: false,
			confirmText: this.t('common.close')
		});
		const modalElement = modal.render();
		modal.element = modalElement; // 设置element引用
		document.body.appendChild(modalElement);
		modal.bindEvents();
	}

	showTokenHelp() {
		const modal = new window.Modal();
		modal.setState({
			show: true,
			type: 'info',
			title: this.t('login.tokenHelpTitle'),
			message: this.t('login.tokenHelpContent'),
			showCancel: false,
			confirmText: this.t('common.close')
		});
		const modalElement = modal.render();
		modal.element = modalElement; // 设置element引用
		document.body.appendChild(modalElement);
		modal.bindEvents();
	}

	updateFormData(data) {
		this.setState({ formData: { ...this.state.formData, ...data } });
		this.update();
	}

	async setLanguage(language) {
		// 更新本地状态
		this.setState({ language });

		// 保存语言设置到 localStorage
		localStorage.setItem('spcp-language', language);

		// 通知 i18n 服务切换语言
		if (window.I18nService) {
			await window.I18nService.changeLanguage(language);
		}

		// 重新渲染页面
		this.update();
	}


	async performLogin(formData) {
		// 验证必填字段
		if (!formData || !formData.username || !formData.repositoryUrl || !formData.accessToken) {
			throw new Error('请填写所有必填字段');
		}

		// 1. 验证GitHub Access Token
		console.log('验证GitHub Access Token...');
		let userInfo;

		// 使用Octokit验证用户
		const octokit = new window.Octokit({ auth: formData.accessToken });
		const { data } = await octokit.rest.users.getAuthenticated();
		userInfo = {
			username: data.login,
			email: data.email,
			avatarUrl: data.avatar_url,
			name: data.name
		};

		// 验证用户名是否匹配
		if (userInfo.username !== formData.username) {
			throw new Error(`用户名不匹配：Token对应的用户是"${userInfo.username}"，但您输入的是"${formData.username}"`);
		}

		// 2. 解析仓库信息
		const repoInfo = this.parseGitHubUrl(formData.repositoryUrl);
		if (!repoInfo) {
			throw new Error('无效的GitHub仓库URL，请检查仓库地址格式');
		}

		// 3. 检查用户对仓库的权限
		console.log('检查用户权限...');
		const permissionInfo = await this.checkUserPermissions(userInfo.username, repoInfo.owner, repoInfo.repo, formData.accessToken);

		// 4. 保存用户信息（包含token和权限信息）
		const fullUserInfo = {
			...userInfo,
			repositoryUrl: formData.repositoryUrl,
			repositoryInfo: repoInfo,
			token: formData.accessToken,
			permissionInfo: permissionInfo,
			loginTime: new Date().toISOString()
		};
		localStorage.setItem('spcp-user', JSON.stringify(fullUserInfo));
		console.log('用户信息已保存');

		// 5. 根据用户权限执行不同操作
		if (permissionInfo.role === 'owner') {
			// 所有者：检查并创建GitHub Actions工作流
			await this.setupGitHubActions(repoInfo.owner, repoInfo.repo, formData.accessToken);

			// 所有者：自动设置仓库权限
			await this.setupRepositoryPermissions(repoInfo.owner, repoInfo.repo, formData.accessToken);
		}

		// 7. 更新app.js的状态
		if (window.app) {
			window.app.state.user = fullUserInfo;
			window.app.state.isAuthenticated = true;
			window.app.state.userRole = permissionInfo.role;
			window.app.state.permissionInfo = permissionInfo;
			console.log('App状态已更新:', permissionInfo.role);
		}

		// 8. 所有用户都自动同步GitHub数据（包括访客）
		console.log('开始自动同步GitHub数据...');

		// 更新按钮状态为加载中
		this.updateLoginButtonState('loading', '正在同步项目数据，请耐心等待...');

		try {
			// 定义进度回调函数
			const progressCallback = (progress, downloaded, total, currentFile) => {
				this.updateLoginButtonState('loading', `正在下载文件... ${progress}% (${downloaded}/${total}) - ${currentFile}`);
			};

			await window.StorageService.syncRepositoryData(repoInfo.owner, repoInfo.repo, formData.accessToken, progressCallback);
			console.log('GitHub数据同步完成');

			// 更新按钮状态为完成
			this.updateLoginButtonState('success', '数据同步完成！');

			// 等待1秒让用户看到完成状态
			await new Promise(resolve => setTimeout(resolve, 1000));
		} catch (syncError) {
			console.error('GitHub数据同步失败:', syncError);
			// 更新按钮状态为错误
			this.updateLoginButtonState('error', '数据同步失败，但登录成功');
			// 等待1秒让用户看到错误状态
			await new Promise(resolve => setTimeout(resolve, 1000));
		}

		// 9. 所有用户都跳转到项目详情页面（因为数据已同步）
		if (window.app && window.app.navigateTo) {
			window.app.navigateTo('/project-detail');
		}
	}

	/**
	 * 检查用户权限
	 */
	async checkUserPermissions(username, owner, repo, token) {
		console.log(`检查用户权限: ${username}, 仓库: ${owner}/${repo}`);

		// 使用Octokit检查用户权限
		const octokit = new window.Octokit({ auth: token });

		try {
			// 检查用户是否是仓库所有者
			const { data: repoInfo } = await octokit.rest.repos.get({ owner, repo });
			console.log('仓库信息:', repoInfo.owner.login, 'vs', username);
			if (repoInfo.owner.login === username) {
				console.log('用户是仓库所有者');
				return { role: 'owner', hasPermission: true };
			}

			// 对于非所有者，先尝试检查是否是协作者
			const { data: collaborators } = await octokit.rest.repos.listCollaborators({ owner, repo });
			const isCollaborator = collaborators.some(collab => collab.login === username);

			if (isCollaborator) {
				return { role: 'collaborator', hasPermission: true };
			}

			// 如果能获取协作者列表但用户不在其中，也是访客
			return { role: 'visitor', hasPermission: false };
		} catch (error) {
			console.log('权限检查失败，默认为访客:', error.message);
			return { role: 'visitor', hasPermission: false };
		}
	}

	/**
	 * 解析GitHub URL
	 */
	parseGitHubUrl(url) {
		const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
		if (match) {
			return {
				owner: match[1],
				repo: match[2].replace('.git', '')
			};
		}
		return null;
	}


	/**
	 * 设置GitHub Actions工作流
	 */
	async setupGitHubActions(owner, repo, token) {
		console.log('检查GitHub Actions工作流...');

		// 检查工作流文件是否存在
		const workflowPath = '.github/workflows/auto-approve-collaborators.yml';
		const workflowExists = await this.fileExists(owner, repo, workflowPath, token);

		if (workflowExists) {
			console.log('工作流文件已存在，跳过创建...');
			return;
		}

		console.log('创建新的工作流文件...');
		await this.createWorkflowFile(owner, repo, token);
	}

	/**
	 * 删除工作流文件
	 */
	async deleteWorkflowFile(owner, repo, token) {
		const octokit = new window.Octokit({ auth: token });

		// 先获取文件SHA
		const { data: fileData } = await octokit.rest.repos.getContent({
			owner, repo, path: '.github/workflows/auto-approve-collaborators.yml'
		});

		// 删除文件
		await octokit.rest.repos.deleteFile({
			owner, repo, path: '.github/workflows/auto-approve-collaborators.yml',
			message: 'Update auto-approve collaborators workflow',
			sha: fileData.sha
		});
	}

	/**
	 * 创建工作流文件
	 */
	async createWorkflowFile(owner, repo, token) {
		// 读取工作流文件内容
		const workflowContent = await this.loadWorkflowTemplate();

		const octokit = new window.Octokit({ auth: token });

		// 将内容编码为base64
		const content = btoa(unescape(encodeURIComponent(workflowContent)));

		await octokit.rest.repos.createOrUpdateFileContents({
			owner, repo, path: '.github/workflows/auto-approve-collaborators.yml',
			message: 'Add auto-approve collaborators workflow',
			content: content
		});
	}

	/**
	 * 检查文件是否存在
	 */
	async fileExists(owner, repo, path, token) {
		try {
			const octokit = new window.Octokit({ auth: token });
			await octokit.rest.repos.getContent({ owner, repo, path });
			return true;
		} catch (error) {
			if (error.status === 404) {
				return false;
			}
			throw error;
		}
	}

	/**
	 * 加载工作流模板
	 */
	async loadWorkflowTemplate() {
		// 从服务器加载工作流模板文件
		const response = await fetch('/templates/auto-approve-collaborators.yml');
		if (response.ok) {
			return await response.text();
		} else {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
	}

	/**
	 * 清除同步信息
	 */
	clearSyncInfo(repositoryUrl) {
		// 解析仓库信息
		const repoInfo = this.parseRepositoryUrl(repositoryUrl);
		if (repoInfo) {
			// 清除同步信息
			localStorage.removeItem(`spcp-sync-${repoInfo.repo}`);
			console.log('同步信息已清除');
		}
	}

	/**
	 * 解析仓库URL
	 */
	parseRepositoryUrl(url) {
		const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
		if (match) {
			return {
				owner: match[1],
				repo: match[2].replace('.git', '')
			};
		}
		return null;
	}

	/**
	 * 更新登录按钮状态
	 */
	updateLoginButtonState(state, message) {
		const loginBtn = this.element.querySelector('#login-btn');
		if (!loginBtn) return;

		// 移除之前的状态类
		loginBtn.classList.remove('loading', 'success', 'error');

		// 添加新的状态类
		if (state !== 'default') {
			loginBtn.classList.add(state);
		}

		// 更新按钮文本和状态
		switch (state) {
			case 'loading':
				loginBtn.disabled = true;
				loginBtn.innerHTML = `⏳ ${message}`;
				break;
			case 'success':
				loginBtn.disabled = true;
				loginBtn.innerHTML = `✅ ${message}`;
				break;
			case 'error':
				loginBtn.disabled = true;
				loginBtn.innerHTML = `❌ ${message}`;
				break;
			default:
				loginBtn.disabled = false;
				loginBtn.innerHTML = `<span class="btn-text">${this.t('login.loginButton', '登录并克隆仓库')}</span>`;
		}
	}

	/**
	 * 清除本地数据
	 */
	async clearLocalData() {
		// 清除IndexedDB中的本地工作空间和文件缓存
		if (window.StorageService) {
			await window.StorageService.clearUserData();
		}
		console.log('本地数据已清除');
	}


	update() {
		if (this.element) {
			const newElement = this.render();
			this.element.innerHTML = '';
			this.element.appendChild(newElement);
			this.bindEvents();
		}
	}

	/**
	 * 设置仓库权限（分支保护、CODEOWNERS、Actions权限、团队权限）
	 */
	async setupRepositoryPermissions(owner, repo, token) {
		console.log('🔧 开始设置仓库权限...');

		const octokit = new window.Octokit({ auth: token });

		try {
			// 1. 设置分支保护
			console.log('📋 设置分支保护...');
			await this.setupBranchProtection(octokit, owner, repo);
			console.log('✅ 分支保护设置成功！');

			// 2. 设置CODEOWNERS
			console.log('👥 设置CODEOWNERS...');
			await this.setupCodeOwners(octokit, owner, repo);
			console.log('✅ CODEOWNERS设置成功！');

			// 3. 设置Actions权限
			console.log('⚙️ 设置Actions权限...');
			await this.setupActionsPermissions(octokit, owner, repo);
			console.log('✅ Actions权限设置成功！');

			// 4. 设置Workflow权限
			console.log('🔄 设置Workflow权限...');
			await this.setupWorkflowPermissions(octokit, owner, repo);
			console.log('✅ Workflow权限设置成功！');

			// 5. 创建Secrets
			console.log('🔐 创建Secrets...');
			await this.setupSecrets(octokit, owner, repo, token);
			console.log('✅ Secrets创建成功！');

			console.log('🎉 所有仓库权限设置完成！');
		} catch (error) {
			console.error('❌ 设置仓库权限失败:', error);
			throw error;
		}
	}

	/**
	 * 设置分支保护
	 */
	async setupBranchProtection(octokit, owner, repo) {
		const protectionRules = {
			required_status_checks: {
				strict: false,        // 不要求分支是最新的，允许协作者创建分支
				contexts: []          // 不要求特定的状态检查
			},
			enforce_admins: false,    // 不强制管理员也遵循规则
			required_pull_request_reviews: {
				required_approving_review_count: 1,  // 需要1个审查
				dismiss_stale_reviews: true,         // 新提交时取消过时审查
				require_code_owner_reviews: false    // 不强制代码所有者审查
			},
			restrictions: null        // 不限制推送用户，让协作者可以推送
		};

		await octokit.rest.repos.updateBranchProtection({
			owner, repo, branch: 'main',
			...protectionRules
		});
	}

	/**
	 * 设置CODEOWNERS
	 */
	async setupCodeOwners(octokit, owner, repo) {
		const codeOwnersContent = `# 全局代码所有者
* @${owner}

# 特定文件/目录
/src/ @${owner}
/docs/ @${owner}
*.js @${owner}

# 重要配置文件
package.json @${owner}
`;

		// 先尝试获取现有文件
		let sha = null;
		try {
			const { data } = await octokit.rest.repos.getContent({
				owner, repo, path: 'CODEOWNERS'
			});
			sha = data.sha;
		} catch (error) {
			// 文件不存在，sha为null
		}

		// 创建或更新文件
		const content = btoa(unescape(encodeURIComponent(codeOwnersContent)));
		const requestBody = {
			message: sha ? 'Update CODEOWNERS file' : 'Add CODEOWNERS',
			content: content,
			branch: 'main'
		};

		if (sha) {
			requestBody.sha = sha;
		}

		await octokit.rest.repos.createOrUpdateFileContents({
			owner, repo, path: 'CODEOWNERS',
			...requestBody
		});
	}

	/**
	 * 设置Actions权限
	 */
	async setupActionsPermissions(octokit, owner, repo) {
		await octokit.rest.actions.setGithubActionsPermissionsRepository({
			owner, repo,
			enabled: true,
			allowed_actions: 'all'
		});
	}

	/**
	 * 设置Workflow权限
	 */
	async setupWorkflowPermissions(octokit, owner, repo) {
		try {
			// 设置Actions权限（允许Actions运行）
			const actionsPermissions = {
				owner, repo,
				enabled: true,
				allowed_actions: 'all'
			};

			console.log('🔄 设置Actions权限参数:', actionsPermissions);
			await octokit.request('PUT /repos/{owner}/{repo}/actions/permissions', actionsPermissions);
			console.log('✅ Actions权限设置成功');

			// 设置Workflow权限（使用正确的API端点）
			const workflowPermissions = {
				owner, repo,
				default_workflow_permissions: 'write',
				can_approve_pull_request_reviews: true
			};

			console.log('🔄 设置Workflow权限参数:', workflowPermissions);
			await octokit.request('PUT /repos/{owner}/{repo}/actions/permissions/workflow', workflowPermissions);
			console.log('✅ Workflow权限设置成功');

			// 验证设置是否生效
			const { data: actionsPermissionsResult } = await octokit.request('GET /repos/{owner}/{repo}/actions/permissions', {
				owner, repo
			});
			console.log('🔍 验证Actions权限设置:', actionsPermissionsResult);

			const { data: workflowPermissionsResult } = await octokit.request('GET /repos/{owner}/{repo}/actions/permissions/workflow', {
				owner, repo
			});
			console.log('🔍 验证Workflow权限设置:', workflowPermissionsResult);

		} catch (error) {
			console.error('❌ Workflow权限设置失败:', error);
			throw error;
		}
	}

	/**
	 * 设置Secrets
	 */
	async setupSecrets(octokit, owner, repo, token) {
		try {
			// 获取公钥
			const { data: publicKeyData } = await octokit.rest.actions.getRepoPublicKey({
				owner, repo
			});

			console.log('🔑 获取到公钥:', publicKeyData.key_id);

			// 创建COLLABORATOR_TOKEN secret
			const secretValue = token; // 使用当前用户的token作为COLLABORATOR_TOKEN

			// 使用Web Crypto API进行正确的加密
			const encryptedValue = await this.encryptSecret(secretValue, publicKeyData.key);

			await octokit.rest.actions.createOrUpdateRepoSecret({
				owner, repo,
				secret_name: 'COLLABORATOR_TOKEN',
				encrypted_value: encryptedValue,
				key_id: publicKeyData.key_id
			});

			console.log('✅ COLLABORATOR_TOKEN secret创建成功');

			// 验证secret是否创建成功
			try {
				const { data: secrets } = await octokit.rest.actions.listRepoSecrets({
					owner, repo
				});
				console.log('🔍 当前仓库的secrets:', secrets.secrets.map(s => s.name));
			} catch (verifyError) {
				console.log('⚠️ 无法验证secrets列表:', verifyError.message);
			}

		} catch (error) {
			console.error('❌ Secrets创建失败:', error);
			// 不抛出错误，因为secrets创建失败不应该阻止其他设置
			console.log('⚠️ 继续执行其他设置...');
		}
	}

	/**
	 * 使用Web Crypto API加密secret（GitHub Secrets兼容）
	 */
	async encryptSecret(secretValue, publicKey) {
		try {
			// 检查是否有libsodium库
			if (typeof window.sodium !== 'undefined') {
				console.log('🔐 使用libsodium加密secret（GitHub Secrets标准）');
				await window.sodium.ready;

				// 使用标准的atob解码base64，而不是sodium.from_base64
				const keyBytes = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0));
				const messageBytes = new TextEncoder().encode(secretValue);
				const encryptedBytes = window.sodium.crypto_box_seal(messageBytes, keyBytes);
				// 使用标准的btoa编码，而不是sodium.to_base64
				const encryptedBase64 = btoa(String.fromCharCode(...encryptedBytes));

				console.log('✅ libsodium加密成功');
				return encryptedBase64;
			} else {
				throw new Error('libsodium库未加载');
			}
		} catch (error) {
			console.error('❌ libsodium加密失败:', error);
			// 如果加密失败，使用简单的base64编码作为最后的fallback
			console.log('⚠️ 使用base64编码作为最后的fallback');
			return btoa(unescape(encodeURIComponent(secretValue)));
		}
	}

	/**
	 * 使用Web Crypto API加密secret
	 */
	async encryptWithWebCrypto(secretValue, publicKey) {
		try {
			console.log('🔑 开始使用Web Crypto API加密secret');
			console.log('🔑 公钥长度:', publicKey.length);

			// 将base64公钥转换为ArrayBuffer
			const publicKeyBuffer = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0));
			console.log('🔑 公钥Buffer长度:', publicKeyBuffer.length);

			// 导入公钥 - 尝试不同的参数组合
			let cryptoKey;
			try {
				// 首先尝试RSA-OAEP with SHA-1
				cryptoKey = await window.crypto.subtle.importKey(
					'spki',
					publicKeyBuffer,
					{
						name: 'RSA-OAEP',
						hash: 'SHA-1'
					},
					false,
					['encrypt']
				);
				console.log('✅ 使用RSA-OAEP SHA-1成功导入公钥');
			} catch (error) {
				console.log('⚠️ RSA-OAEP SHA-1失败，尝试SHA-256');
				try {
					// 尝试RSA-OAEP with SHA-256
					cryptoKey = await window.crypto.subtle.importKey(
						'spki',
						publicKeyBuffer,
						{
							name: 'RSA-OAEP',
							hash: 'SHA-256'
						},
						false,
						['encrypt']
					);
					console.log('✅ 使用RSA-OAEP SHA-256成功导入公钥');
				} catch (error2) {
					console.log('⚠️ RSA-OAEP SHA-256也失败，尝试RSA-PKCS1');
					// 尝试RSA-PKCS1
					cryptoKey = await window.crypto.subtle.importKey(
						'spki',
						publicKeyBuffer,
						{
							name: 'RSA-PKCS1'
						},
						false,
						['encrypt']
					);
					console.log('✅ 使用RSA-PKCS1成功导入公钥');
				}
			}

			// 加密secret
			const secretBuffer = new TextEncoder().encode(secretValue);
			console.log('🔑 要加密的secret长度:', secretBuffer.length);

			// 检查secret长度是否超过RSA密钥的限制
			const maxLength = cryptoKey.algorithm.name === 'RSA-PKCS1' ? 245 : 190; // RSA-2048的限制
			if (secretBuffer.length > maxLength) {
				throw new Error(`Secret too long: ${secretBuffer.length} > ${maxLength}`);
			}

			const encryptedBuffer = await window.crypto.subtle.encrypt(
				{
					name: cryptoKey.algorithm.name
				},
				cryptoKey,
				secretBuffer
			);

			// 转换为base64
			const encryptedArray = new Uint8Array(encryptedBuffer);
			const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
			console.log('✅ 加密完成，结果长度:', encryptedBase64.length);

			return encryptedBase64;
		} catch (error) {
			console.error('❌ Web Crypto API加密失败:', error);
			throw error;
		}
	}

	destroy() {
		// 清理资源
		if (this.element) {
			this.element.innerHTML = '';
		}
	}
}

// 注册组件
window.LoginPage = LoginPage;
