/**
 * SPCP应用主入口
 * 管理整个应用的状态和生命周期
 */
class SPCPApp {
	constructor() {
		this.router = new Router();
		this.currentPage = null;
		this.state = {
			user: null,
			theme: 'dark',
			language: 'zh-CN',
			currentProject: null,
			projects: [],
			isAuthenticated: false,
			userRole: null,
			permissionInfo: null
		};
		this.listeners = new Map();
	}

	async init() {
		console.log('SPCP App initializing...');

		// 1. 等待所有服务加载完成
		await this.waitForServices();

		// 2. 初始化主题
		await this.initTheme();

		// 3. 检查用户认证状态
		await this.checkAuthStatus();

		// 4. 初始化路由
		this.router.init();

		// 5. 渲染初始页面
		await this.renderInitialPage();

		console.log('SPCP App initialized successfully');
	}

	async waitForServices() {
		// 确保所有服务都已加载
		while (!window.I18nService || !window.StorageService || !window.GitHubService) {
			await new Promise(resolve => setTimeout(resolve, 10));
		}

		console.log('All services loaded');
	}

	async initTheme() {
		// 初始化主题管理器
		if (!window.themeManager) {
			window.themeManager = new ThemeManager();
		}

		// 应用主题和语言设置
		document.documentElement.setAttribute('data-theme', this.state.theme);
		document.documentElement.setAttribute('lang', this.state.language);

		console.log('Theme initialized');
	}

	async checkAuthStatus() {
		try {
			// 从localStorage获取用户信息
			const userData = localStorage.getItem('spcp-user');
			if (userData) {
				const user = JSON.parse(userData);
				console.log('从localStorage读取的用户数据:', user);
				console.log('permissionInfo:', user.permissionInfo);
				this.state.user = user;
				this.state.isAuthenticated = true;
				this.state.userRole = user.permissionInfo?.role || 'visitor';
				this.state.permissionInfo = user.permissionInfo || { role: 'visitor', hasPermission: false };
				console.log('User authenticated:', user.username, 'Role:', this.state.userRole);
			} else {
				console.log('No user data found, user is not authenticated');
				// 不重定向到登录页面，允许未认证用户访问仪表盘
				this.state.user = null;
				this.state.isAuthenticated = false;
				this.state.userRole = 'visitor';
				this.state.permissionInfo = { role: 'visitor', hasPermission: false };
			}
		} catch (error) {
			console.error('Error checking auth status:', error);
			// 出错时也不重定向，允许用户继续使用
			this.state.user = null;
			this.state.isAuthenticated = false;
			this.state.userRole = 'visitor';
			this.state.permissionInfo = { role: 'visitor', hasPermission: false };
		}
	}


	async renderInitialPage() {
		const path = window.location.pathname;
		const fullPath = window.location.pathname + window.location.search;
		const route = this.router.matchRoute(path);

		// 根据用户认证状态和权限决定重定向逻辑
		if (this.state.user && this.state.user.token && this.state.permissionInfo) {
			// 有用户信息和权限信息
			if (this.state.permissionInfo.role === 'collaborator' || this.state.permissionInfo.role === 'owner') {
				// 协作者或所有者，直接跳转到项目详情页
				if (route === 'LoginPage' || route === 'DashboardPage') {
					this.router.navigateTo('/project-detail');
					return;
				}
			} else {
				// 访客，去仪表盘
				if (route === 'LoginPage') {
					this.router.navigateTo('/');
					return;
				}
			}
		} else if (this.state.user && !this.state.user.token) {
			// 有用户名但没有Access Token，去仪表盘
			if (route === 'LoginPage') {
				this.router.navigateTo('/');
				return;
			}
		} else {
			// 没有任何用户信息，去登录页
			if (route !== 'LoginPage') {
				this.router.navigateTo('/login');
				return;
			}
		}

		await this.router.renderPage(route, fullPath);
	}

	// 状态管理
	setState(newState) {
		const oldState = { ...this.state };
		this.state = { ...this.state, ...newState };

		// 通知所有监听器
		this.notifyListeners(oldState, this.state);

		// 持久化状态
		this.persistState();
	}

	subscribe(key, callback) {
		if (!this.listeners.has(key)) {
			this.listeners.set(key, []);
		}
		this.listeners.get(key).push(callback);
	}

	notifyListeners(oldState, newState) {
		for (const [key, callbacks] of this.listeners) {
			if (oldState[key] !== newState[key]) {
				callbacks.forEach(callback => callback(newState[key], oldState[key]));
			}
		}
	}

	persistState() {
		// 持久化关键状态到localStorage
		const persistentState = {
			theme: this.state.theme,
			language: this.state.language,
			user: this.state.user
		};

		localStorage.setItem('spcp-app-state', JSON.stringify(persistentState));
	}

	restoreState() {
		// 从localStorage恢复状态
		const savedState = localStorage.getItem('spcp-app-state');
		if (savedState) {
			const persistentState = JSON.parse(savedState);
			this.setState(persistentState);
		}
	}

	// 页面事件处理
	handleLogin(formData) {
		return new Promise(async (resolve, reject) => {
			try {
				console.log('Handling login:', formData);

				// 验证用户
				const user = await window.GitHubService.verifyUser(formData.username);
				console.log('User verified:', user);

				// 克隆仓库
				await this.cloneRepository(formData.repositoryUrl);

				// 保存用户配置
				this.saveUserConfig(formData);

				// 更新应用状态
				this.setState({
					user: {
						username: formData.username,
						email: formData.email,
						avatar: `https://github.com/${formData.username}.png`,
						loginTime: new Date().toISOString()
					},
					isAuthenticated: true
				});

				// 跳转到仪表盘
				this.router.navigateTo('/');

				resolve();
			} catch (error) {
				console.error('Login error:', error);
				reject(error);
			}
		});
	}

	async cloneRepository(repositoryUrl) {
		console.log('Cloning repository:', repositoryUrl);

		// 解析GitHub URL
		const repoInfo = window.GitHubService.parseGitHubUrl(repositoryUrl);
		if (!repoInfo) {
			throw new Error('Invalid GitHub repository URL');
		}

		// 获取仓库文件列表
		const files = await window.GitHubService.getFileList(repoInfo.owner, repoInfo.repo);

		// 下载所有文件到文件缓存
		for (const file of files) {
			try {
				const content = await window.GitHubService.getFileContent(repoInfo.owner, repoInfo.repo, file.path);
				await window.StorageService.saveFileContent(file.path, {
					content: content,
					type: file.type,
					size: content.length,
					lastModified: new Date().toISOString()
				});
			} catch (error) {
				console.warn(`Failed to download file ${file.path}:`, error);
			}
		}

		console.log('Repository cloned successfully');
	}

	saveUserConfig(formData) {
		const config = {
			github: {
				username: formData.username,
				email: formData.email
			},
			repository: {
				url: formData.repositoryUrl,
				owner: window.GitHubService.parseGitHubUrl(formData.repositoryUrl)?.owner,
				repo: window.GitHubService.parseGitHubUrl(formData.repositoryUrl)?.repo
			},
			loginTime: new Date().toISOString()
		};

		// 保存用户配置
		window.StorageService.saveUserConfig(config);

		// 保存用户信息（供settings页面使用）
		const userInfo = {
			username: formData.username,
			email: formData.email,
			avatar: `https://github.com/${formData.username}.png`,
			loginTime: new Date().toISOString()
		};
		localStorage.setItem('spcp-user', JSON.stringify(userInfo));
	}

	handleLogout() {
		console.log('Handling logout');

		// 清除用户数据
		localStorage.removeItem('spcp-user');
		localStorage.removeItem('spcp-app-state');

		// 重置应用状态
		this.setState({
			user: null,
			isAuthenticated: false,
			currentProject: null,
			projects: []
		});

		// 跳转到登录页
		this.router.navigateTo('/login');
	}

	handleLanguageChange(language) {
		console.log('Language changed to:', language);
		this.setState({ language });

		// 更新i18n服务
		window.I18nService.setLanguage(language);

		// 重新翻译页面
		window.I18nService.translatePage();
	}

	handleThemeChange(theme) {
		console.log('Theme changed to:', theme);
		this.setState({ theme });

		// 更新主题管理器
		if (window.themeManager) {
			window.themeManager.setTheme(theme);
		}
	}

	// 获取当前页面
	getCurrentPage() {
		return this.router.getCurrentPage();
	}

	// 获取应用状态
	getState() {
		return { ...this.state };
	}

	// 页面事件处理方法
	handleQuickAction(action) {
		console.log('Quick action:', action);
		switch (action) {
			case 'new-contribution':
				this.router.navigateTo('/editor');
				break;
			case 'view-project-detail':
				this.router.navigateTo('/project-detail');
				break;
			case 'view-reviews':
				this.router.navigateTo('/reviews');
				break;
			case 'settings':
				this.router.navigateTo('/settings');
				break;
		}
	}

	handleFileClick(path, type) {
		console.log('File clicked:', path, type);
		// 处理文件点击逻辑
	}

	handleFileOpen(file) {
		console.log('File opened:', file);
		this.setState({ currentFile: file });
		this.router.navigateTo('/editor');
	}

	handleFileDelete(file) {
		console.log('File deleted:', file);
		// 处理文件删除逻辑
	}

	handleFileSave(content) {
		console.log('File saved:', content);
		// 处理文件保存逻辑
	}

	handlePreview() {
		console.log('Preview toggled');
		// 处理预览切换逻辑
	}

	handleSubmitReview(content) {
		console.log('Review submitted:', content);
		// 处理提交审核逻辑
	}

	handleReviewApprove(review) {
		console.log('Review approved:', review);
		// 处理审核通过逻辑
	}

	handleReviewReject(review) {
		console.log('Review rejected:', review);
		// 处理审核拒绝逻辑
	}

	handleReviewComment(review, comment) {
		console.log('Review comment added:', review, comment);
		// 处理审核评论逻辑
	}
}

// 创建全局应用实例
window.app = new SPCPApp();
