/**
 * 登录页面组件
 * 完全组件化的登录页面
 */
class LoginPage extends BasePage {
	constructor(props = {}) {
		super(props);
		this.state = {
			language: window.I18nService ? window.I18nService.currentLanguage : 'zh-CN',
			formData: {
				username: '',
				accessToken: '',
				repositoryUrl: 'https://github.com/Zela-Foundation/SPCP'
			},
			loading: false,
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
		this.rerender();
	}


	async performLogin(formData) {
		// 验证必填字段
		if (!formData || !formData.username || !formData.repositoryUrl || !formData.accessToken) {
			throw new Error(this.t('login.validation.formInvalid', '请填写所有必填字段'));
		}

		// 1. 解析仓库信息
		const repoInfo = this.parseGitHubUrl(formData.repositoryUrl);
		if (!repoInfo) {
			throw new Error(this.t('login.validation.repositoryInvalid', '无效的GitHub仓库URL，请检查仓库地址格式'));
		}

		// 2. 检查仓库类型（必须是组织仓库）- 不需要认证
		console.log('检查仓库类型...');
		const isOrgRepo = await this.checkRepositoryType(null, repoInfo.owner, repoInfo.repo);
		if (!isOrgRepo) {
			this.updateLoginButtonState('default', this.t('login.loginButton', '登录并克隆仓库'));
			return;
		}

		// 3. 验证GitHub Access Token
		console.log('验证GitHub Access Token...');
		let userInfo;

		// 使用Octokit验证用户
		const octokit = new window.Octokit({ auth: formData.accessToken });
		let data;
		try {
			const response = await octokit.rest.users.getAuthenticated();
			data = response.data;
		} catch (error) {
			if (error.status === 401) {
				throw new Error(this.t('login.validation.invalidToken', 'GitHub Access Token无效或已过期，请检查您的Token是否正确'));
			}
			throw error;
		}
		userInfo = {
			username: data.login,
			email: data.email,
			avatarUrl: data.avatar_url,
			name: data.name
		};

		// 验证用户名是否匹配
		if (userInfo.username !== formData.username) {
			throw new Error(this.t('login.validation.usernameMismatch', `用户名不匹配：Token对应的用户是"${userInfo.username}"，但您输入的是"${formData.username}"`)
				.replace('{tokenUser}', userInfo.username)
				.replace('{inputUser}', formData.username));
		}

		// 4. 检查用户对仓库的权限
		console.log('检查用户权限...');
		const permissionInfo = await this.checkUserPermissions(userInfo.username, repoInfo.owner, repoInfo.repo, formData.accessToken);

		// 5. 保存用户信息（包含token和权限信息）
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

		// 6. 检查组织权限并执行相应设置
		const hasOrgPermission = await this.checkOrganizationPermission(octokit, repoInfo.owner, userInfo.username);
		if (hasOrgPermission) {
			// 获取用户在组织中的角色
			const membership = await octokit.rest.orgs.getMembershipForUser({
				org: repoInfo.owner,
				username: userInfo.username
			});

			if (membership.data.role === 'admin') {
				// 检查设置是否已经完成（通过检查Discussions是否启用来判断）
				const { data: currentRepoInfo } = await octokit.rest.repos.get({
					owner: repoInfo.owner,
					repo: repoInfo.repo
				});

				if (!currentRepoInfo.has_discussions) {
					// 设置未完成，执行完整设置
					await this.setupRepository(repoInfo.owner, repoInfo.repo, formData.accessToken);
				}
			}
		}

		// 7. 所有用户都自动同步GitHub数据（包括访客）
		console.log('开始自动同步GitHub数据...');

		// 更新按钮状态为加载中
		this.updateLoginButtonState('loading', '正在同步项目数据，请耐心等待...');

		try {
			// 定义进度回调函数
			const progressCallback = (progress, downloaded, total, currentFile) => {
				this.updateLoginButtonState('loading', `正在下载文件... ${progress}% (${downloaded}/${total})`);
			};

			await window.StorageService.syncRepositoryData(repoInfo.owner, repoInfo.repo, formData.accessToken, progressCallback);
			console.log('GitHub数据同步完成');

			// 根据角色文件更新用户角色
			const updatedPermissionInfo = await this.determineUserRoleFromFiles(userInfo.username, repoInfo.owner, repoInfo.repo);
			if (updatedPermissionInfo && updatedPermissionInfo.role !== permissionInfo.role) {
				console.log(`角色已更新: ${permissionInfo.role} -> ${updatedPermissionInfo.role}`);

				// 更新localStorage中的用户信息
				const updatedUserInfo = {
					...fullUserInfo,
					permissionInfo: updatedPermissionInfo
				};
				localStorage.setItem('spcp-user', JSON.stringify(updatedUserInfo));

				// 更新app.js的状态
				if (window.app) {
					window.app.state.user = updatedUserInfo;
					window.app.state.isAuthenticated = true;
					window.app.state.userRole = updatedPermissionInfo.role;
					window.app.state.permissionInfo = updatedPermissionInfo;
				}
			}

			// 更新按钮状态为完成
			this.updateLoginButtonState('success', this.t('login.messages.dataSyncComplete', '数据同步完成！'));

			// 等待1秒让用户看到完成状态
			await new Promise(resolve => setTimeout(resolve, 1000));
		} catch (syncError) {
			console.error('GitHub数据同步失败:', syncError);
			// 更新按钮状态为错误
			this.updateLoginButtonState('error', this.t('login.messages.dataSyncFailedButLoginSuccess', '数据同步失败，但登录成功'));
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
			// 不区分大小写比较用户名
			if (repoInfo.owner.login.toLowerCase() === username.toLowerCase()) {
				console.log('用户是仓库所有者');
				return { role: 'owner', hasPermission: true };
			}

			// 对于非所有者，先尝试检查是否是协作者
			const { data: collaborators } = await octokit.rest.repos.listCollaborators({ owner, repo });
			const isCollaborator = collaborators.some(collab => collab.login.toLowerCase() === username.toLowerCase());

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
	 * 根据角色文件确定用户角色
	 * @param {string} username - 用户名
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @returns {Promise<Object|null>} 权限信息对象或null
	 */
	async determineUserRoleFromFiles(username, owner, repo) {
		try {
			// 从IndexedDB读取角色文件
			const roleFiles = [
				{ path: '.github/directors.txt', role: 'owner' },
				{ path: '.github/reviewers.txt', role: 'reviewer' },
				{ path: '.github/maintainers.txt', role: 'maintainer' }
			];

			for (const { path, role } of roleFiles) {
				try {
					const fileContent = await window.StorageService._execute('fileCache', 'get', path);
					if (fileContent && fileContent.content) {
						const lines = fileContent.content.split('\n');
						const usernameLower = username.toLowerCase();

						// 检查用户名是否在文件中（不区分大小写）
						for (const line of lines) {
							const trimmedLine = line.trim();
							// 跳过注释和空行
							if (trimmedLine && !trimmedLine.startsWith('#')) {
								if (trimmedLine.toLowerCase() === usernameLower) {
									console.log(`用户 ${username} 在 ${path} 中找到，角色为: ${role}`);
									return { role, hasPermission: true };
								}
							}
						}
					}
				} catch (error) {
					// 文件不存在，继续检查下一个文件
					console.log(`文件 ${path} 不存在或读取失败:`, error.message);
				}
			}

			// 如果在任何角色文件中都没找到，返回null（保持原有角色）
			console.log(`用户 ${username} 不在任何角色文件中，保持原有角色`);
			return null;
		} catch (error) {
			console.error('根据角色文件确定用户角色失败:', error);
			return null;
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
	 * 创建必要的多个工作流文件
	 */
	async setupGitHubActions(owner, repo, token) {
		console.log('检查GitHub Actions工作流...');

		// 定义需要创建的工作流列表
		const workflows = [
			{
				path: '.github/workflows/auto-approve-collaborators.yml',
				template: 'auto-approve-collaborators.yml',
				message: 'Add auto-approve collaborators workflow'
			},
			{
				path: '.github/workflows/grant-points.yml',
				template: 'grant-points.yml',
				message: 'Add grant points workflow'
			}
		];

		// 检查并创建每个工作流
		for (const workflow of workflows) {
			const exists = await this.fileExists(owner, repo, workflow.path, token);

			if (exists) {
				console.log(`✅ 工作流 ${workflow.path} 已存在，跳过创建...`);
			} else {
				console.log(`创建新的工作流: ${workflow.path}...`);
				await this.createWorkflowFile(owner, repo, token, workflow.template, workflow.path, workflow.message);
			}
		}
	}

	/**
	 * 创建工作流文件
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} token - GitHub token
	 * @param {string} templateName - 模板文件名
	 * @param {string} targetPath - 目标路径
	 * @param {string} commitMessage - 提交消息
	 */
	async createWorkflowFile(owner, repo, token, templateName, targetPath, commitMessage) {
		// 读取工作流文件内容
		const workflowContent = await this.loadFileTemplate(templateName);

		const octokit = new window.Octokit({ auth: token });

		// 将内容编码为base64
		const content = btoa(unescape(encodeURIComponent(workflowContent)));

		await octokit.rest.repos.createOrUpdateFileContents({
			owner, repo, path: targetPath,
			message: commitMessage,
			content: content
		});

		console.log(`✅ 工作流 ${targetPath} 创建成功`);
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
	 * 获取文件的sha（如果文件存在）
	 */
	async getFileSha(octokit, owner, repo, path) {
		try {
			const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
			if (Array.isArray(data)) {
				return null; // 如果是目录，返回null
			}
			return data.sha;
		} catch (error) {
			if (error.status === 404) {
				return null; // 文件不存在，返回null
			}
			throw error;
		}
	}

	/**
	 * 创建或更新文件（自动处理sha）
	 */
	async createOrUpdateFileSafe(octokit, owner, repo, path, content, message) {
		// 获取文件的sha（如果存在）
		const sha = await this.getFileSha(octokit, owner, repo, path);

		// 准备文件内容
		const fileContent = {
			message: message,
			content: btoa(unescape(encodeURIComponent(content))),
			branch: 'main'
		};

		// 如果文件已存在，添加sha
		if (sha) {
			fileContent.sha = sha;
		}

		await octokit.rest.repos.createOrUpdateFileContents({
			owner,
			repo,
			path,
			...fileContent
		});

		return sha ? 'updated' : 'created';
	}

	/**
	 * 加载文件
	 */
	async loadFileTemplate(path) {
		// 从服务器加载文件
		const response = await fetch(`/templates/${path}`);
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
	}

	/**
	 * 设置仓库权限（分支保护、CODEOWNERS、Actions权限、团队权限）
	 */
	async setupRepository(owner, repo, token) {
		const octokit = new window.Octokit({ auth: token });

		try {
			// 1. 创建GitHub Actions工作流
			this.updateLoginButtonState('loading', this.t('login.settingUp.workflows', '正在创建GitHub Actions工作流...'));
			await this.setupGitHubActions(owner, repo, token);

			// 2. 设置分支保护
			this.updateLoginButtonState('loading', this.t('login.settingUp.branchProtection', '正在设置分支保护...'));
			await this.setupBranchProtection(octokit, owner, repo);

			// 3. 设置CODEOWNERS
			this.updateLoginButtonState('loading', this.t('login.settingUp.codeOwners', '正在设置CODEOWNERS...'));
			await this.setupCodeOwners(octokit, owner, repo);

			// 4. 设置Actions权限
			this.updateLoginButtonState('loading', this.t('login.settingUp.actionsPermissions', '正在设置Actions权限...'));
			await this.setupActionsPermissions(octokit, owner, repo);

			// 5. 设置Workflow权限
			this.updateLoginButtonState('loading', this.t('login.settingUp.workflowPermissions', '正在设置Workflow权限...'));
			await this.setupWorkflowPermissions(octokit, owner, repo);

			// 6. 创建Secrets
			this.updateLoginButtonState('loading', this.t('login.settingUp.secrets', '正在创建Secrets...'));
			await this.setupSecrets(octokit, owner, repo, token);

			// 7. 设置团队权限
			this.updateLoginButtonState('loading', this.t('login.settingUp.teamPermissions', '正在设置团队权限...'));
			await this.setupTeamPermissions(octokit, owner, repo);

			// 8. 启用Discussions功能
			this.updateLoginButtonState('loading', this.t('login.settingUp.discussions', '正在启用Discussions...'));
			await this.setupDiscussions(octokit, owner, repo);

		} catch (error) {
			console.error('❌ 设置仓库权限失败:', error);
			throw error;
		}
	}

	/**
	 * 检查仓库类型
	 * @param {Object} octokit - Octokit实例（可以为null，使用公开API）
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @returns {Promise<boolean>} 是否为组织仓库
	 */
	async checkRepositoryType(octokit, owner, repo) {
		try {
			// 如果没有提供octokit，创建一个不需要认证的实例
			if (!octokit) {
				octokit = new window.Octokit();
			}

			// 检查仓库信息（公开API，不需要认证）
			const { data: repoInfo } = await octokit.rest.repos.get({
				owner,
				repo
			});

			console.log('仓库类型检查:', {
				owner: repoInfo.owner.login,
				type: repoInfo.owner.type,
				isOrg: repoInfo.owner.type === 'Organization'
			});

			// 如果是组织仓库，返回true
			if (repoInfo.owner.type === 'Organization') {
				return true;
			}

			// 如果是个人仓库，显示错误提示
			this.showError(this.t('login.errors.personalRepo.message', '此应用仅支持组织仓库。请使用组织仓库或联系仓库管理员。'));
			return false;

		} catch (error) {
			// 根据不同的错误类型显示不同的提示
			if (error.status === 404) {
				console.log('显示仓库不存在错误');
				const message = this.t('login.errors.repoNotFound.message', '仓库 {owner}/{repo} 不存在或不是公开仓库，请检查仓库地址是否正确。')
					.replace('{owner}', owner)
					.replace('{repo}', repo);
				this.showError(message);
			} else if (error.status === 401) {
				console.log('显示认证错误');
				this.showError(this.t('login.errors.unauthorized.message', '认证失败，请检查您的GitHub Access Token是否正确。'));
			} else {
				console.log('显示通用错误');
				this.showError(this.t('login.errors.repoCheck.message', '无法检查仓库类型，请检查仓库地址是否正确。'));
			}
			return false;
		}
	}

	/**
	 * 检查用户是否有组织权限
	 * @param {Object} octokit - Octokit实例
	 * @param {string} orgName - 组织名称
	 * @param {string} username - 用户名
	 * @returns {Promise<boolean>} 是否有组织权限
	 */
	async checkOrganizationPermission(octokit, orgName, username) {
		try {
			// 检查用户是否是组织成员
			const { data: membership } = await octokit.rest.orgs.getMembershipForUser({
				org: orgName,
				username: username
			});

			console.log('组织成员信息:', {
				org: orgName,
				user: username,
				role: membership.role,
				state: membership.state
			});

			// 检查用户是否有admin或member权限且状态为active
			return membership.role === 'admin' || (membership.role === 'member' && membership.state === 'active');

		} catch (error) {
			console.error('检查组织权限失败:', error);
			return false;
		}
	}

	/**
	 * 设置团队权限
	 * @param {Object} octokit - Octokit实例
	 * @param {string} owner - 组织名称
	 * @param {string} repo - 仓库名称
	 */
	async setupTeamPermissions(octokit, owner, repo) {
		try {
			// 定义需要创建的团队（根据4个角色：所有者、审核委员、维护者、贡献者）
			const teams = [
				{
					name: 'administrators',
					description: this.t('login.teams.administrators.description', '管理员团队 - 拥有仓库的完全管理权限'),
					permission: 'admin'
				},
				{
					name: 'reviewers',
					description: this.t('login.teams.reviewers.description', '审核委员团队 - 负责审核贡献质量并通过评论授予积分'),
					permission: 'push'
				},
				{
					name: 'maintainers',
					description: this.t('login.teams.maintainers.description', '维护者团队 - 负责合并PR和管理贡献，但受CODEOWNERS限制'),
					permission: 'push'
				}
			];

			for (const team of teams) {
				try {
					// 检查团队是否已存在
					let teamExists = false;
					try {
						await octokit.rest.teams.getByName({
							org: owner,
							team_slug: team.name
						});
						teamExists = true;
						console.log(`✅ 团队 ${team.name} 已存在`);
					} catch (error) {
						if (error.status !== 404) {
							throw error;
						}
						// 团队不存在，继续创建
					}

					// 如果团队不存在，创建团队
					if (!teamExists) {
						const { data: createdTeam } = await octokit.rest.teams.create({
							org: owner,
							name: team.name,
							description: team.description,
							privacy: 'closed'
						});
						console.log(`✅ 创建团队 ${team.name} 成功`);
					}

					// 设置团队仓库权限
					await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
						org: owner,
						team_slug: team.name,
						owner: owner,
						repo: repo,
						permission: team.permission
					});

					console.log(`✅ 设置团队 ${team.name} 权限为 ${team.permission}`);

				} catch (error) {
					console.warn(`⚠️ 设置团队 ${team.name} 失败:`, error);
					// 继续处理其他团队，不中断整个流程
				}
			}

			// 设置分支保护规则，只允许审核委员合并到main分支
			await this.setupBranchProtectionForTeams(octokit, owner, repo);

		} catch (error) {
			console.error('❌ 设置团队权限失败:', error);
			throw error;
		}
	}

	/**
	 * 为团队设置分支保护规则
	 * @param {Object} octokit - Octokit实例
	 * @param {string} owner - 组织名称
	 * @param {string} repo - 仓库名称
	 */
	async setupBranchProtectionForTeams(octokit, owner, repo) {
		try {
			// 设置main分支保护规则
			await octokit.rest.repos.updateBranchProtection({
				owner: owner,
				repo: repo,
				branch: 'main',
				required_status_checks: {
					strict: true,
					contexts: []
				},
				enforce_admins: false,
				required_pull_request_reviews: {
					required_approving_review_count: 1,
					dismiss_stale_reviews: true,
					require_code_owner_reviews: true
				},
				restrictions: {
					users: [],
					teams: ['reviewers'], // 只有审核委员可以合并
					apps: []
				},
				allow_force_pushes: false,
				allow_deletions: false
			});

			console.log('✅ 设置main分支保护规则成功 - 只有审核委员可以合并');

		} catch (error) {
			console.warn('⚠️ 设置分支保护规则失败:', error);
			// 不抛出错误，因为这不是关键功能
		}
	}

	/**
	 * 设置分支保护
	 * 启用CODEOWNERS审查要求，保护受保护的文件
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
				require_code_owner_reviews: true     // 要求CODEOWNERS审查（关键！）
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
	 * 根据讨论的需求，CODEOWNERS保护以下路径：
	 * - POINT/ 目录（审核委员拥有权限）
	 * - .github/reviewers.txt 等角色定义文件（所有者拥有权限）
	 */
	async setupCodeOwners(octokit, owner, repo) {
		const codeOwners = `# ${this.t('login.files.codeowners.title')}
# ${this.t('login.files.codeowners.description')}

# ${this.t('login.files.codeowners.protectPoint')}
.github/POINT/ @${owner}/reviewers

# ${this.t('login.files.codeowners.protectRoles')}
.github/reviewers.txt @${owner}/administrators
.github/maintainers.txt @${owner}/administrators
.github/directors.txt @${owner}/administrators

# ${this.t('login.files.codeowners.protectCodeowners')}
.github/CODEOWNERS @${owner}/administrators

# ${this.t('login.files.codeowners.protectWorkflows')}
.github/workflows/ @${owner}/administrators
`;

		// 创建或更新CODEOWNERS文件
		const result = await this.createOrUpdateFileSafe(
			octokit, owner, repo, '.github/CODEOWNERS',
			codeOwners,
			'Add CODEOWNERS file for permission protection'
		);
		console.log(`✅ CODEOWNERS文件${result === 'created' ? '创建' : '更新'}成功`);

		// 创建POINT目录的初始结构（如果不存在）
		const time = new Date().toISOString();

		// 用户积分一览
		const points = `user,HP,RP
${this.state.formData.username},1000,1000\n`;

		// 个人积分明细
		const user_points = `[{"time":"${time}","HP":1000,"RP":1000,"points":1000,"reviewers":"${this.state.formData.username}","reason":"创建仓库"}]`;

		// 创建POINT目录的README
		const pointReadme = `# ${this.t('login.files.pointReadme.title')}

${this.t('login.files.pointReadme.description')}

## ${this.t('login.files.pointReadme.protected')}

${this.t('login.files.pointReadme.protectedDesc')}

## ${this.t('login.files.pointReadme.structure')}

- ${this.t('login.files.pointReadme.userFile')}
- ${this.t('login.files.pointReadme.overviewFile')}

## ${this.t('login.files.pointReadme.permissions')}

- **${this.t('login.files.pointReadme.reviewer')}**
- **${this.t('login.files.pointReadme.maintainer')}**
- **${this.t('login.files.pointReadme.contributor')}**
`;

		// 创建或更新POINT目录文件
		await this.createOrUpdateFileSafe(
			octokit, owner, repo, '.github/POINT/README.md',
			pointReadme,
			'Create POINT directory with README'
		);

		await this.createOrUpdateFileSafe(
			octokit, owner, repo, `.github/POINT/${this.state.formData.username}.json`,
			user_points,
			'Initialize user points'
		);

		await this.createOrUpdateFileSafe(
			octokit, owner, repo, '.github/POINT/points.csv',
			points,
			'Initialize points overview'
		);

		const roleFiles = [
			{
				path: '.github/reviewers.txt',
				content: `# ${this.t('login.files.roles.reviewers.title')}
# ${this.t('login.files.roles.reviewers.format')}

`,
				description: this.t('login.files.roles.reviewers.description', '审核委员角色定义文件')
			},
			{
				path: '.github/maintainers.txt',
				content: `# ${this.t('login.files.roles.maintainers.title')}
# ${this.t('login.files.roles.maintainers.format')}

`,
				description: this.t('login.files.roles.maintainers.description', '维护者角色定义文件')
			},
			{
				path: '.github/directors.txt',
				content: `# ${this.t('login.files.roles.directors.title')}
# ${this.t('login.files.roles.directors.format')}

${this.state.formData.username}

`,
				description: this.t('login.files.roles.directors.description', '理事角色定义文件')
			}
		];

		for (const roleFile of roleFiles) {
			// 创建或更新文件
			const result = await this.createOrUpdateFileSafe(
				octokit, owner, repo, roleFile.path,
				roleFile.content,
				`Add ${roleFile.description}`
			);
			console.log(`✅ ${roleFile.description} ${result === 'created' ? '创建' : '更新'}成功`);
		}
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
			// 先获取当前权限设置
			const { data: currentActionsPermissions } = await octokit.request('GET /repos/{owner}/{repo}/actions/permissions', {
				owner, repo
			});
			console.log('🔍 当前Actions权限设置:', currentActionsPermissions);

			const { data: currentWorkflowPermissions } = await octokit.request('GET /repos/{owner}/{repo}/actions/permissions/workflow', {
				owner, repo
			});
			console.log('🔍 当前Workflow权限设置:', currentWorkflowPermissions);

			// 检查第一个权限（Actions）是否已正确设置
			const isActionsCorrectlySet = currentActionsPermissions.enabled && currentActionsPermissions.allowed_actions === 'all';

			if (!isActionsCorrectlySet) {
				// 需要更新，统一设置所有权限

				// 设置Actions权限
				const actionsPermissions = {
					owner, repo,
					enabled: true,
					allowed_actions: 'all'
				};
				console.log('🔄 设置Actions权限参数:', actionsPermissions);
				await octokit.request('PUT /repos/{owner}/{repo}/actions/permissions', actionsPermissions);
				console.log('✅ Actions权限设置成功');

				// 设置Workflow权限
				const workflowPermissions = {
					owner, repo,
					default_workflow_permissions: 'write',
					can_approve_pull_request_reviews: true
				};
				console.log('🔄 设置Workflow权限参数:', workflowPermissions);
				await octokit.request('PUT /repos/{owner}/{repo}/actions/permissions/workflow', workflowPermissions);
				console.log('✅ Workflow权限设置成功');
			} else {
				console.log('ℹ️ 所有权限已正确设置，跳过更新');
			}

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
				throw new Error(this.t('login.errors.libsodiumNotLoaded', 'libsodium库未加载'));
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

	/**
	 * 启用Discussions功能
	 * 使用GraphQL API检测和启用Discussions功能
	 * @param {Object} octokit - Octokit实例
	 * @param {string} owner - 组织名称
	 * @param {string} repo - 仓库名称
	 */
	async setupDiscussions(octokit, owner, repo) {
		try {
			console.log('🔧 正在启用Discussions...');

			// 获取仓库信息以获取repository ID
			const { data: repoInfo } = await octokit.rest.repos.get({
				owner,
				repo
			});

			const repositoryId = repoInfo.node_id; // node_id就是GitHub的ID格式

			if (!repositoryId) {
				console.warn('⚠️ 无法获取仓库ID，跳过Discussions启用');
				return;
			}

			// 使用GraphQL API启用Discussions
			await octokit.graphql(`
				mutation EnableDiscussions($repoId: ID!) {
					updateRepository(input: {
						repositoryId: $repoId,
						hasDiscussionsEnabled: true
					}) {
						repository {
							id
							name
							hasDiscussionsEnabled
						}
					}
				}
			`, {
				repoId: repositoryId
			});

			console.log('✅ Discussions功能启用成功');

		} catch (error) {
			console.error('❌ 启用Discussions失败:', error);
			// 不抛出错误，因为Discussions不是关键功能，不应该阻止其他设置
			console.log('⚠️ 继续执行后续设置...');
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
