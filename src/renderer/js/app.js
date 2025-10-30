/**
 * DIPCP应用主入口
 * 管理整个应用的状态和生命周期
 */
class DIPCPApp {
	constructor() {
		// 路由相关属性
		this.routes = new Map();
		this.currentRoute = null;
		this.currentPage = null;
		this.lastParams = undefined;

		// 应用状态
		this.state = {
			user: null,
			currentProject: null,
			projects: [],
			isAuthenticated: false,
			userRole: null,
			permissionInfo: null
		};
		this.listeners = new Map();
	}

	/**
	 * 初始化应用程序
	 * 按顺序加载外部库、脚本、服务，然后初始化主题、认证和路由
	 * @async
	 * @returns {Promise<void>}
	 */
	async init() {
		console.log('DIPCP App initializing...');

		// 1. 等待所有服务加载完成
		await this.waitForServices();

		// 2. 初始化语言
		await this.initLanguage();

		// 3. 检查用户认证状态
		await this.checkAuthStatus();

		// 4. 初始化路由
		this.initRouter();

		// 5. 渲染初始页面
		await this.handleRouteChange();

		console.log('DIPCP App initialized successfully');
	}

	/**
	 * 等待所有必需的服务加载完成
	 * 检查 I18nService、StorageService 和 Octokit 是否可用
	 * @async
	 * @returns {Promise<void>}
	 */
	async waitForServices() {
		// 确保所有服务都已加载
		while (!window.I18nService || !window.StorageService || !window.Octokit) {
			await new Promise(resolve => setTimeout(resolve, 10));
		}
	}

	/**
	 * 初始化语言设置
	 * 从i18n服务获取当前设置并应用到DOM
	 * @async
	 * @returns {Promise<void>}
	 */
	async initLanguage() {
		// 应用语言设置（从i18n服务获取）
		if (window.I18nService && window.I18nService.currentLanguage) {
			document.documentElement.setAttribute('lang', window.I18nService.currentLanguage);
		}
	}

	/**
	 * 从localStorage获取用户信息
	 * @returns {Object} 包含user、userRole、permissionInfo的对象
	 */
	getUserFromStorage() {
		try {
			const userData = localStorage.getItem('dipcp-user');
			if (userData) {
				const user = JSON.parse(userData);
				return {
					user: user,
					userRole: user.permissionInfo?.role || 'visitor',
					permissionInfo: user.permissionInfo || { role: 'visitor', hasPermission: false }
				};
			} else {
				return {
					user: null,
					userRole: 'visitor',
					permissionInfo: { role: 'visitor', hasPermission: false }
				};
			}
		} catch (error) {
			console.error('Error getting user from storage:', error);
			return {
				user: null,
				userRole: 'visitor',
				permissionInfo: { role: 'visitor', hasPermission: false }
			};
		}
	}

	/**
	 * 检查用户认证状态
	 * 从localStorage读取用户信息并设置应用状态
	 * @async
	 * @returns {Promise<void>}
	 */
	async checkAuthStatus() {
		const userInfo = this.getUserFromStorage();
		this.state.user = userInfo.user;
		this.state.isAuthenticated = !!userInfo.user;
		this.state.userRole = userInfo.userRole;
		this.state.permissionInfo = userInfo.permissionInfo;
	}


	/**
	 * 初始化路由系统
	 * 定义所有路由规则，设置事件监听器
	 * @returns {void}
	 */
	initRouter() {
		// 定义路由
		this.routes.set('/', 'DashboardPage');
		this.routes.set('/login', 'LoginPage');
		this.routes.set('/repository-selection', 'RepositorySelectionPage');
		this.routes.set('/project-detail', 'ProjectDetailPage');
		this.routes.set('/editor', 'EditorPage');
		this.routes.set('/reviews', 'ReviewsPage');
		this.routes.set('/issues', 'IssuesPage');
		this.routes.set('/settings', 'SettingsPage');
		this.routes.set('/terms', 'TermsPage');
		this.routes.set('/privacy', 'PrivacyPage');
		this.routes.set('/discussions', 'DiscussionsPage');
		this.routes.set('/user-profile', 'UserProfilePage');
		this.routes.set('/role-management', 'RoleManagementPage');

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
	}

	/**
	 * 导航到指定路径
	 * @param {string} path - 目标路径
	 * @returns {void}
	 */
	navigateTo(path) {
		history.pushState(null, '', path);
		this.handleRouteChange();
	}

	/**
	 * 处理路由变化
	 * 根据用户认证状态决定重定向逻辑，渲染对应页面
	 * @async
	 * @returns {Promise<void>}
	 */
	async handleRouteChange() {
		const fullPath = window.location.pathname + window.location.search;
		const path = window.location.pathname;
		const route = this.matchRoute(path);

		// 如果已登录用户访问登录页面，重定向到仓库选择页面
		if (this.state.user && this.state.user.token && route === 'LoginPage') {
			this.navigateTo('/repository-selection');
			return;
		}

		// 如果未登录用户访问需要认证的页面，重定向到登录页面
		if (!this.state.user || !this.state.user.token) {
			if (route === 'RepositorySelectionPage' || route === 'ProjectDetailPage' ||
				route === 'EditorPage' || route === 'ReviewsPage' || route === 'IssuesPage' ||
				route === 'SettingsPage' || route === 'DiscussionsPage' || route === 'UserProfilePage' ||
				route === 'RoleManagementPage') {
				this.navigateTo('/login');
				return;
			}
		}

		// 处理根路径重定向
		if (path === '/' || path === '') {
			if (this.state.user && this.state.user.token) {
				// 已登录用户：检查是否有仓库信息
				if (this.state.user.repositoryInfo || this.state.user.repositoryUrl) {
					// 有仓库信息，显示仪表盘（继续后面的逻辑来渲染）
					// 不需要重定向，让路由正常处理
				} else {
					// 没有仓库信息，重定向到仓库选择页面
					this.navigateTo('/repository-selection');
					return;
				}
			} else {
				// 未登录用户重定向到登录页面
				this.navigateTo('/login');
				return;
			}
		}

		if (route && route !== this.currentRoute) {
			await this.renderPage(route, fullPath);
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
				await this.renderPage(route, completePath);
				this.lastParams = currentParams;
			}
		}
	}

	/**
	 * 匹配路由
	 * 根据路径匹配对应的页面类名
	 * @param {string} path - 要匹配的路径
	 * @returns {string} 页面类名
	 */
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

	/**
	 * 检查路径是否匹配模式
	 * 支持精确匹配和参数匹配
	 * @param {string} pattern - 匹配模式
	 * @param {string} path - 要检查的路径
	 * @returns {boolean} 是否匹配
	 */
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

	/**
	 * 渲染页面
	 * 创建页面实例，设置属性，渲染并挂载到DOM
	 * @async
	 * @param {string} pageClass - 页面类名
	 * @param {string} fullPath - 完整路径（包含查询参数）
	 * @returns {Promise<void>}
	 */
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

		// 为不同页面添加必要的参数
		let pageProps = { queryParams };
		if (pageClass === 'TermsPage' || pageClass === 'PrivacyPage') {
			pageProps = {
				...pageProps,
				onBack: () => {
					this.navigateTo('/login');
				}
			};
		} else if (pageClass === 'UserProfilePage') {
			// 为用户资料页面添加用户名参数
			pageProps = {
				...pageProps,
				username: queryParams.username || null
			};
		} else if (pageClass === 'EditorPage') {
			// 为EditorPage添加文件路径和模式参数
			pageProps = {
				...pageProps,
				filePath: queryParams.file || '',
				fileName: queryParams.file ? queryParams.file.split('/').pop() : '',
				mode: queryParams.mode || 'view'
			};
		}

		this.currentPage = new PageClass(pageProps);

		// 挂载到DOM（mount方法内部会调用render，并传递fullPath参数）
		this.mountPage(fullPath);
	}

	/**
	 * 挂载页面到DOM
	 * 将当前页面组件挂载到应用容器中
	 * @param {string} fullPath - 完整路径
	 * @returns {void}
	 */
	mountPage(fullPath) {
		const appContainer = document.getElementById('app');
		if (appContainer && this.currentPage) {
			// 清空容器
			appContainer.innerHTML = '';
			// 挂载页面组件，传递fullPath参数
			this.currentPage.mount(appContainer, fullPath);
		}
	}

	/**
	 * 设置应用状态
	 * 更新状态并通知所有监听器，持久化状态
	 * @param {Object} newState - 新的状态对象
	 * @returns {void}
	 */
	setState(newState) {
		const oldState = { ...this.state };
		this.state = { ...this.state, ...newState };

		// 通知所有监听器
		this.notifyListeners(oldState, this.state);

		// 持久化状态
		this.persistState();
	}

	/**
	 * 订阅状态变化
	 * 为指定状态键添加监听器
	 * @param {string} key - 状态键名
	 * @param {Function} callback - 回调函数
	 * @returns {void}
	 */
	subscribe(key, callback) {
		if (!this.listeners.has(key)) {
			this.listeners.set(key, []);
		}
		this.listeners.get(key).push(callback);
	}

	/**
	 * 通知所有监听器
	 * 当状态发生变化时调用所有相关的监听器
	 * @param {Object} oldState - 旧状态
	 * @param {Object} newState - 新状态
	 * @returns {void}
	 */
	notifyListeners(oldState, newState) {
		for (const [key, callbacks] of this.listeners) {
			if (oldState[key] !== newState[key]) {
				callbacks.forEach(callback => callback(newState[key], oldState[key]));
			}
		}
	}

	/**
	 * 持久化状态
	 * 将关键状态保存到localStorage
	 * @returns {void}
	 */
	persistState() {
		// 持久化关键状态到localStorage
		const persistentState = {
			user: this.state.user
		};

		localStorage.setItem('dipcp-app-state', JSON.stringify(persistentState));
	}

	/**
	 * 恢复状态
	 * 从localStorage恢复保存的状态
	 * @returns {void}
	 */
	restoreState() {
		// 从localStorage恢复状态
		const savedState = localStorage.getItem('dipcp-app-state');
		if (savedState) {
			const persistentState = JSON.parse(savedState);
			this.setState(persistentState);
		}
	}

	/**
	 * 解析GitHub URL
	 * 从GitHub URL中提取仓库所有者和仓库名
	 * @param {string} url - GitHub URL
	 * @returns {Object|null} 包含owner和repo的对象，解析失败返回null
	 */
	parseGitHubUrl(url) {
		const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
		if (match) {
			return {
				owner: match[1],
				repo: match[2].replace(/\.git$/, '')
			};
		}
		return null;
	}

	/**
	 * 获取当前页面实例
	 * @returns {Object|null} 当前页面实例
	 */
	getCurrentPage() {
		return this.currentPage;
	}

	/**
	 * 获取当前路由
	 * @returns {string|null} 当前路由名称
	 */
	getCurrentRoute() {
		return this.currentRoute;
	}

	/**
	 * 获取应用状态
	 * @returns {Object} 应用状态的副本
	 */
	getState() {
		return { ...this.state };
	}

}

// 创建全局应用实例
window.app = new DIPCPApp();
