/**
 * 路由系统
 * 管理页面路由和导航
 */
class Router {
	constructor() {
		this.routes = new Map();
		this.currentRoute = null;
		this.currentPage = null;
		this.init();
	}

	init() {
		// 定义路由
		this.routes.set('/', 'DashboardPage');
		this.routes.set('/login', 'LoginPage');
		this.routes.set('/project-detail', 'ProjectDetailPage');
		this.routes.set('/editor', 'EditorPage');
		this.routes.set('/reviews', 'ReviewsPage');
		this.routes.set('/settings', 'SettingsPage');
		this.routes.set('/terms', 'TermsPage');
		this.routes.set('/privacy', 'PrivacyPage');
		this.routes.set('/user-profile', 'UserProfilePage');

		// 监听浏览器前进后退
		window.addEventListener('popstate', () => {
			this.handleRouteChange();
		});

		// 监听链接点击
		document.addEventListener('click', (e) => {
			if (e.target.matches('[data-route]')) {
				e.preventDefault();
				this.navigateTo(e.target.dataset.route);
			}
		});

		// 处理初始路由
		this.handleRouteChange();
	}

	navigateTo(path) {
		history.pushState(null, '', path);
		this.handleRouteChange();
	}

	handleRouteChange() {
		const fullPath = window.location.pathname + window.location.search;
		const path = window.location.pathname;
		const route = this.matchRoute(path);

		if (route && route !== this.currentRoute) {
			this.renderPage(route, fullPath);
			this.currentRoute = route;
		} else if (route && route === this.currentRoute) {
			// 检查查询参数是否变化
			const currentUrl = new URL(window.location.href);
			const currentParams = Object.fromEntries(currentUrl.searchParams);

			// 比较当前参数与上次参数是否不同
			const currentParamsStr = JSON.stringify(currentParams);
			const lastParamsStr = JSON.stringify(this.lastParams || {});

			// 如果是第一次加载（lastParams未定义），且当前有参数，则不需要重新渲染
			if (this.lastParams === undefined && Object.keys(currentParams).length > 0) {
				this.lastParams = currentParams;
			} else if (currentParamsStr !== lastParamsStr) {
				// 使用完整的URL路径，包括查询参数
				const completePath = window.location.pathname + window.location.search;
				this.renderPage(route, completePath);
				this.lastParams = currentParams;
			}
		}
	}

	matchRoute(path) {
		// 精确匹配
		if (this.routes.has(path)) {
			return this.routes.get(path);
		}

		// 参数匹配 - 支持查询参数
		for (const [pattern, pageClass] of this.routes) {
			if (this.isMatch(pattern, path)) {
				return pageClass;
			}
		}

		// 默认路由
		return 'DashboardPage';
	}

	isMatch(pattern, path) {
		if (pattern === path) return true;

		// 移除查询参数进行匹配
		const pathWithoutQuery = path.split('?')[0];
		const patternWithoutQuery = pattern.split('?')[0];

		// 精确匹配（无查询参数）
		if (patternWithoutQuery === pathWithoutQuery) return true;

		// 参数匹配
		const patternParts = patternWithoutQuery.split('/');
		const pathParts = pathWithoutQuery.split('/');

		if (patternParts.length !== pathParts.length) return false;

		for (let i = 0; i < patternParts.length; i++) {
			if (patternParts[i].startsWith(':')) continue;
			if (patternParts[i] !== pathParts[i]) return false;
		}

		return true;
	}

	async renderPage(pageClass, fullPath) {
		// 销毁当前页面
		if (this.currentPage) {
			this.currentPage.destroy();
		}

		// 创建新页面
		const PageClass = window[pageClass];
		if (!PageClass) {
			console.error(`Page class ${pageClass} not found`);
			return;
		}

		// 解析查询参数
		const url = new URL(fullPath, window.location.origin);
		const queryParams = Object.fromEntries(url.searchParams);

		// 为不同页面添加回调函数
		let pageProps = { queryParams };
		if (pageClass === 'TermsPage' || pageClass === 'PrivacyPage') {
			pageProps = {
				...pageProps,
				onBack: () => {
					this.navigateTo('/login');
				}
			};
		} else if (pageClass === 'LoginPage') {
			// 为LoginPage添加登录回调
			pageProps = {
				...pageProps,
				onLogin: (formData) => {
					return window.app.handleLogin(formData);
				}
			};
		} else if (pageClass === 'UserProfilePage') {
			// 为用户资料页面添加用户名参数
			pageProps = {
				...pageProps,
				username: queryParams.username || null
			};
		} else if (pageClass === 'DashboardPage') {
			// 为DashboardPage添加退出项目回调和用户角色信息
			pageProps = {
				...pageProps,
				user: (window.app && window.app.state) ? window.app.state.user : null,
				userRole: (window.app && window.app.state) ? window.app.state.userRole : null,
				permissionInfo: (window.app && window.app.state) ? window.app.state.permissionInfo : null,
				onLogout: () => {
					this.handleLogout();
				},
				onApplyContribution: (reason) => {
					return this.handleApplyContribution(reason);
				}
			};
		} else if (pageClass === 'ProjectDetailPage') {
			// ProjectDetailPage现在直接处理所有功能，不需要回调
			pageProps = {
				...pageProps
			};
		} else if (pageClass === 'EditorPage') {
			// 为EditorPage添加文件路径
			pageProps = {
				...pageProps,
				filePath: queryParams.file || '',
				fileName: queryParams.file ? queryParams.file.split('/').pop() : ''
			};
		} else if (pageClass === 'SettingsPage') {
			// SettingsPage现在直接处理所有功能，不需要回调
			pageProps = {
				...pageProps
			};
		}

		this.currentPage = new PageClass(pageProps);

		// 渲染页面
		await this.currentPage.render(fullPath);

		// 挂载到DOM
		this.mountPage();
	}

	mountPage() {
		const appContainer = document.getElementById('app');
		if (appContainer && this.currentPage) {
			// 清空容器
			appContainer.innerHTML = '';
			// 挂载页面组件
			this.currentPage.mount(appContainer);
		}
	}

	getCurrentPage() {
		return this.currentPage;
	}

	getCurrentRoute() {
		return this.currentRoute;
	}

	// 处理文件点击事件
	handleFileClick(filePath, fileType) {
		// 如果是文件，可以显示文件信息或预览
		if (fileType === 'file') {
			// 可以在这里添加文件预览逻辑
			console.log('Opening file:', filePath);
		}
	}

	// 处理文件打开事件
	handleFileOpen(file) {
		// 导航到编辑器页面
		if (file.type === 'file') {
			const editorUrl = `/editor?file=${encodeURIComponent(file.path)}`;
			this.navigateTo(editorUrl);
		}
	}


	// 处理退出项目事件
	handleLogout() {
		// 清除本地存储的用户数据
		if (window.StorageService) {
			window.StorageService.clearUserData();
		}

		// 清除localStorage中的用户相关数据
		localStorage.removeItem('spcp-user');
		localStorage.removeItem('spcp-config');
		localStorage.removeItem('spcp-language');

		// 导航到登录页面
		this.navigateTo('/login');
	}

	// 处理申请贡献事件
	async handleApplyContribution(reason) {
		try {
			// 从localStorage获取用户信息
			const userData = localStorage.getItem('spcp-user');
			if (!userData) {
				throw new Error('用户未登录');
			}

			const user = JSON.parse(userData);
			console.log('User data in handleApplyContribution:', user);
			console.log('User token:', user.token);

			// 如果没有repositoryUrl，使用默认的测试仓库
			let repoInfo;
			if (user.repositoryUrl) {
				repoInfo = window.GitHubService.parseGitHubUrl(user.repositoryUrl);
			} else if (user.repositoryInfo) {
				repoInfo = user.repositoryInfo;
			} else {
				// 使用默认的测试仓库
				repoInfo = {
					owner: 'ZelaCreator',
					repo: 'DPCC'
				};
			}

			if (!repoInfo) {
				throw new Error('无效的仓库地址');
			}

			console.log('Creating contribution application for:', user.username);
			console.log('Repository info:', repoInfo);
			console.log('Reason:', reason);
			console.log('Token being passed:', user.token);

			const application = await window.GitHubService.createContributionApplication(
				repoInfo.owner,
				repoInfo.repo,
				user.username,
				user.email,
				reason,
				user.token // 传递用户的token
			);

			console.log('Application created:', application);
			return application;
		} catch (error) {
			console.error('Error creating contribution application:', error);
			throw error;
		}
	}

	// 处理通知设置变更事件（保留，因为可能需要全局处理）
	handleNotificationChange(notifications) {
		// 保存通知设置到localStorage
		const config = JSON.parse(localStorage.getItem('spcp-config') || '{}');
		config.notifications = notifications;
		localStorage.setItem('spcp-config', JSON.stringify(config));
	}
}

// 注册Router类到全局对象
window.Router = Router;
