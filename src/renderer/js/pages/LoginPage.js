/**
 * 登录页面组件
 * 完全组件化的登录页面
 */
class LoginPage extends BasePage {
	constructor(props = {}) {
		super(props);
		this.state = {
			language: props.language || 'zh-CN',
			formData: {
				username: props.username || 'minne100',
				repositoryUrl: props.repositoryUrl || 'https://github.com/ZelaCreator/SPCP',
				accessToken: props.accessToken || ''
			},
			loading: false,
			onLogin: props.onLogin || null,
			onLanguageChange: props.onLanguageChange || null
		};
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
		return `
            <div class="form-group">
                <label for="language-select">${this.t('login.language')}</label>
                <select id="language-select" aria-label="选择语言">
                    <option value="zh-CN" ${this.state.language === 'zh-CN' ? 'selected' : ''}>中文</option>
                    <option value="en-US" ${this.state.language === 'en-US' ? 'selected' : ''}>English</option>
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
			languageSelect.addEventListener('change', (e) => {
				const newLanguage = e.target.value;
				this.setLanguage(newLanguage);
				if (this.state.onLanguageChange) {
					this.state.onLanguageChange(newLanguage);
				}
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
				if (window.app && window.app.router) {
					window.app.router.navigateTo('/terms');
				}
			});
		}

		const privacyLink = this.element.querySelector('#privacy-link');
		if (privacyLink) {
			privacyLink.addEventListener('click', (e) => {
				e.preventDefault();
				if (window.app && window.app.router) {
					window.app.router.navigateTo('/privacy');
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

	setLanguage(language) {
		this.setState({ language });
		this.update();
	}

	handleLanguageChange(newLanguage) {
		// 语言变更已经在事件处理中完成，这里不需要额外处理
	}

	async performLogin(formData) {
		// 验证必填字段
		if (!formData || !formData.username || !formData.repositoryUrl || !formData.accessToken) {
			throw new Error('请填写所有必填字段');
		}

		// 1. 验证GitHub Access Token
		console.log('验证GitHub Access Token...');
		let userInfo;
		userInfo = await window.GitHubService.verifyWithToken(formData.accessToken);

		// 验证用户名是否匹配
		if (userInfo.username !== formData.username) {
			throw new Error(`用户名不匹配：Token对应的用户是"${userInfo.username}"，但您输入的是"${formData.username}"`);
		}

		// 2. 解析仓库信息
		const repoInfo = window.GitHubService.parseGitHubUrl(formData.repositoryUrl);
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

			await window.GitHubService.syncRepositoryData(repoInfo.owner, repoInfo.repo, formData.accessToken, progressCallback);
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
		if (window.app && window.app.router) {
			window.app.router.navigateTo('/project-detail');
		}
	}

	/**
	 * 检查用户权限
	 */
	async checkUserPermissions(username, owner, repo, token) {
		console.log(`检查用户权限: ${username}, 仓库: ${owner}/${repo}`);
		// 检查用户是否是仓库所有者
		let repoInfo;
		repoInfo = await window.GitHubService.getRepository(owner, repo, token);
		console.log('仓库信息:', repoInfo.owner.login, 'vs', username);
		if (repoInfo.owner.login === username) {
			console.log('用户是仓库所有者');
			return { role: 'owner', hasPermission: true };
		}

		// 对于非所有者，先尝试检查是否是协作者
		// 如果Token权限不足，会抛出403错误，我们直接返回访客
		const collaborators = await window.GitHubService.getCollaborators(owner, repo, token);
		const isCollaborator = collaborators.some(collab => collab.login === username);

		if (isCollaborator) {
			return { role: 'collaborator', hasPermission: true };
		}

		// 如果能获取协作者列表但用户不在其中，也是访客
		return { role: 'visitor', hasPermission: false };
	}

	/**
	 * 设置GitHub Actions工作流
	 */
	async setupGitHubActions(owner, repo, token) {
		console.log('检查GitHub Actions工作流...');

		// 检查工作流文件是否存在
		const workflowPath = '.github/workflows/auto-approve-collaborators.yml';
		const workflowExists = await window.GitHubService.fileExists(owner, repo, workflowPath, token);

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
		await window.GitHubService.deleteFile(
			owner,
			repo,
			'.github/workflows/auto-approve-collaborators.yml',
			'Update auto-approve collaborators workflow',
			token
		);
	}

	/**
	 * 创建工作流文件
	 */
	async createWorkflowFile(owner, repo, token) {
		// 读取工作流文件内容
		const workflowContent = await this.loadWorkflowTemplate();

		await window.GitHubService.createFile(
			owner,
			repo,
			'.github/workflows/auto-approve-collaborators.yml',
			workflowContent,
			'Add auto-approve collaborators workflow',
			token
		);
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

	destroy() {
		// 清理资源
		if (this.element) {
			this.element.innerHTML = '';
		}
	}
}

// 注册组件
window.LoginPage = LoginPage;
