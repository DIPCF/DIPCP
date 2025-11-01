/**
 * 页面头部组件
 * 包含Logo、导航菜单
 */
class Header extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			title: props.title || 'DIPCP',
			currentPage: props.currentPage || '',
			navigationItems: props.navigationItems || [],
			menuOpen: false, // 移动端菜单开关状态
		};
		this.checkInterval = null;
		this.overlayElement = null; // 遮罩层元素引用
		this.overlayTimeout = null; // 遮罩层隐藏的延迟定时器
		this.overlayClickHandler = null; // 遮罩层点击事件处理器引用
		this._toggleButtonHandler = null; // 菜单切换按钮事件处理器引用
		this._navItemHandlers = new Map(); // 导航项事件处理器映射
	}

	render() {
		const header = document.createElement('header');
		header.className = 'header';
		header.innerHTML = `
            <div class="header-left">
                <h1 class="logo">${this.state.title}</h1>
                <nav class="nav-menu ${this.state.menuOpen ? 'nav-menu-open' : ''}">
                    ${this.renderNavigationItems()}
                </nav>
            </div>
            <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">
                <span class="nav-toggle-icon"></span>
                <span class="nav-toggle-icon"></span>
                <span class="nav-toggle-icon"></span>
            </button>
        `;
		return header;
	}

	renderNavigationItems() {
		// 检查是否有未读的讨论和Issues通知（每次都重新检查，因为localStorage可能变化）
		const hasUnreadDiscussions = this.hasUnreadDiscussions();
		const hasUnreadIssues = this.hasUnreadIssues();

		return this.state.navigationItems.map(item => {
			const isActive = item.href.includes(this.state.currentPage) ? 'active' : '';
			// 使用I18nService获取翻译文本
			const translatedText = window.I18nService && window.I18nService.t ?
				window.I18nService.t(item.key, item.text) : item.text;

			// 如果是讨论或Issues按钮，添加通知徽章
			const notificationBadge = ((item.href === '/discussions' && hasUnreadDiscussions) ||
				(item.href === '/issues' && hasUnreadIssues))
				? '<span class="nav-notification-badge"></span>' : '';

			return `
                <a href="${item.href}" class="nav-item ${isActive}" data-route="${item.href}" style="position: relative;">
                    ${translatedText}
                    ${notificationBadge}
                </a>
            `;
		}).join('');
	}

	/**
	 * 更新导航项（用于刷新通知徽章）
	 */
	updateNavigationItems() {
		const navMenu = this.element.querySelector('.nav-menu');
		if (navMenu) {
			navMenu.innerHTML = this.renderNavigationItems();
			this.bindEvents();
			// 更新菜单的显示状态
			this.updateMenuVisibility();
		}
	}

	/**
	 * 检查是否有未读的讨论通知
	 * @returns {boolean} 是否有未读通知
	 */
	hasUnreadDiscussions() {
		try {
			const saved = localStorage.getItem('discussions_unread_mentions');
			if (saved) {
				const unreadList = JSON.parse(saved);
				return Array.isArray(unreadList) && unreadList.length > 0;
			}
		} catch (error) {
			// 静默处理错误
		}
		return false;
	}

	/**
	 * 检查是否有未读的Issues通知
	 * @returns {boolean} 是否有未读通知
	 */
	hasUnreadIssues() {
		try {
			const saved = localStorage.getItem('issues_unread_mentions');
			if (saved) {
				const unreadList = JSON.parse(saved);
				return Array.isArray(unreadList) && unreadList.length > 0;
			}
		} catch (error) {
			// 静默处理错误
		}
		return false;
	}

	bindEvents() {
		// 导航菜单事件由 app.js 统一处理（通过 data-route 属性）
		// 这里只绑定退出登录事件
		if (this.state.onLogout) {
			const logoutBtn = this.element.querySelector('#logout-btn');
			if (logoutBtn) {
				logoutBtn.addEventListener('click', this.state.onLogout);
			}
		}

		// 绑定移动端菜单切换按钮（先移除旧的事件监听器，防止重复绑定）
		const navToggle = this.element.querySelector('#nav-toggle');
		if (navToggle) {
			// 如果已经绑定过，先移除
			if (this._toggleButtonHandler) {
				navToggle.removeEventListener('click', this._toggleButtonHandler);
			}
			// 创建新的事件处理器并保存引用
			this._toggleButtonHandler = () => {
				this.toggleMenu();
			};
			navToggle.addEventListener('click', this._toggleButtonHandler);
		}

		// 点击导航项后关闭菜单（移动端）
		const navItems = this.element.querySelectorAll('.nav-item');
		navItems.forEach((item, index) => {
			// 如果已经绑定过，先移除
			if (this._navItemHandlers.has(index)) {
				item.removeEventListener('click', this._navItemHandlers.get(index));
			}
			// 创建新的事件处理器并保存引用
			const handler = () => {
				// 使用媒体查询判断是否为移动端，而不是直接检查窗口宽度
				if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
					this.setState({ menuOpen: false });
					this.updateMenuVisibility(false);
				}
			};
			this._navItemHandlers.set(index, handler);
			item.addEventListener('click', handler);
		});

		// 清理已不存在的导航项的事件处理器引用
		const existingIndices = new Set(Array.from({ length: navItems.length }, (_, i) => i));
		for (const [index] of this._navItemHandlers) {
			if (!existingIndices.has(index)) {
				this._navItemHandlers.delete(index);
			}
		}

		// 遮罩层的事件在 updateMenuVisibility() 中绑定，这里不需要重复绑定

		// 只在第一次绑定时启动定期检查未读通知
		if (!this._pollingStarted) {
			this._pollingStarted = true;
			this.startCheckingUnreadMentions();
		}
	}

	/**
	 * 切换移动端菜单显示/隐藏
	 */
	toggleMenu() {
		const wasOpen = this.state.menuOpen;
		const newMenuOpen = !wasOpen;
		this.setState({ menuOpen: newMenuOpen });
		// 使用新状态值更新菜单可见性
		this.updateMenuVisibility(newMenuOpen);

		// 如果菜单打开，添加 body 点击监听；如果关闭，移除监听
		if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
			if (newMenuOpen) {
				// 菜单刚打开，添加遮罩层点击监听
				setTimeout(() => {
					const handleBodyClick = (e) => {
						const navMenu = this.element?.querySelector('.nav-menu');
						const navToggle = this.element?.querySelector('.nav-toggle');

						// 如果点击的不是菜单或按钮，关闭菜单
						if (navMenu && navMenu.classList.contains('nav-menu-open')) {
							if (!navMenu.contains(e.target) &&
								!navToggle?.contains(e.target)) {
								this.setState({ menuOpen: false });
								this.updateMenuVisibility(false);
								document.body.removeEventListener('click', handleBodyClick, true);
								this._bodyClickHandler = null;
							}
						}
					};

					document.body.addEventListener('click', handleBodyClick, true);
					this._bodyClickHandler = handleBodyClick;
				}, 100);
			} else if (this._bodyClickHandler) {
				// 菜单关闭，移除监听
				document.body.removeEventListener('click', this._bodyClickHandler, true);
				this._bodyClickHandler = null;
			}
		}
	}

	/**
	 * 更新菜单的显示/隐藏状态（通过CSS类控制，不重新渲染）
	 * @param {boolean} menuOpen - 菜单是否打开（可选，默认使用 this.state.menuOpen）
	 */
	updateMenuVisibility(menuOpen = null) {
		if (!this.element) return;

		// 使用传入的值，如果没有传入则使用 state 中的值
		const shouldMenuOpen = menuOpen !== null ? menuOpen : this.state.menuOpen;

		// 清除之前的延迟隐藏定时器
		if (this.overlayTimeout) {
			clearTimeout(this.overlayTimeout);
			this.overlayTimeout = null;
		}

		const navMenu = this.element.querySelector('.nav-menu');

		// 更新菜单显示状态
		if (navMenu) {
			if (shouldMenuOpen) {
				navMenu.classList.add('nav-menu-open');
			} else {
				navMenu.classList.remove('nav-menu-open');
			}
		}

		// 每次都从 DOM 中查找遮罩层，确保使用正确的引用
		// 同时清理可能存在的重复遮罩层
		const existingOverlays = document.querySelectorAll('.nav-menu-overlay');

		// 如果存在多个遮罩层，只保留第一个，删除其他的
		if (existingOverlays.length > 1) {
			for (let i = 1; i < existingOverlays.length; i++) {
				existingOverlays[i].remove();
			}
		}

		// 使用第一个（也是唯一的）遮罩层
		this.overlayElement = existingOverlays.length > 0 ? existingOverlays[0] : null;

		// 更新遮罩层显示状态（无动画，直接显示/隐藏）
		if (shouldMenuOpen) {
			// 如果需要显示，确保遮罩层存在
			if (!this.overlayElement) {
				this.overlayElement = document.createElement('div');
				this.overlayElement.className = 'nav-menu-overlay';
				document.body.appendChild(this.overlayElement);

				// 绑定点击事件（只在创建时绑定一次）
				this.overlayClickHandler = () => {
					if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
						this.setState({ menuOpen: false });
						this.updateMenuVisibility(false);
					}
				};
				this.overlayElement.addEventListener('click', this.overlayClickHandler);
			}

			// 清除之前的隐藏定时器（如果存在）
			if (this.overlayTimeout) {
				clearTimeout(this.overlayTimeout);
				this.overlayTimeout = null;
			}

			// 直接显示遮罩层
			this.overlayElement.style.display = 'block';
			this.overlayElement.classList.add('active');
		} else {
			// 清除之前的隐藏定时器（如果存在）
			if (this.overlayTimeout) {
				clearTimeout(this.overlayTimeout);
				this.overlayTimeout = null;
			}

			// 直接隐藏遮罩层（如果存在）
			if (this.overlayElement) {
				this.overlayElement.style.display = 'none';
				this.overlayElement.classList.remove('active');
			}
		}
	}

	/**
	 * 开始定期检查未读@mention
	 */
	startCheckingUnreadMentions() {
		// 如果已经有定时器在运行，先清除
		if (this.checkInterval) {
			clearTimeout(this.checkInterval);
			this.checkInterval = null;
		}

		// 延迟检查，确保页面完全加载
		setTimeout(() => {
			// 立即检查一次
			this.checkUnreadMentions();

			// 开始递归检查
			this.scheduleNextCheck();

			// 立即检查一次代码更新
			this.checkAndSyncMainBranch();
		}, 1000);
	}

	/**
	 * 安排下一次检查
	 */
	scheduleNextCheck() {
		// 获取同步时间间隔（从localStorage读取，默认30秒）
		const syncInterval = parseInt(localStorage.getItem('dipcp-sync-interval')) || 30;

		// 设置下一次检查
		this.checkInterval = setTimeout(() => {
			// 执行检查
			this.checkUnreadMentions();
			// 检查代码更新（静默）
			this.checkAndSyncMainBranch();

			// 安排下一次检查
			this.scheduleNextCheck();
		}, syncInterval * 1000); // 转换为毫秒
	}

	/**
	 * 检查并静默同步main分支（如果有更新）
	 */
	async checkAndSyncMainBranch() {
		try {
			const user = window.app && window.app.getUserFromStorage ? window.app.getUserFromStorage() : null;
			if (!user || !user.user || !user.user.token) {
				return;
			}

			const currentUser = user.user;
			const repoInfo = currentUser.repositoryInfo;
			if (!repoInfo || !repoInfo.owner || !repoInfo.repo) {
				return;
			}

			// 初始化 GitHubService
			await window.GitHubService.initFromUser(currentUser);

			// 获取main分支的最新提交SHA
			const branchData = await window.GitHubService.getBranch(repoInfo.owner, repoInfo.repo, 'main', true);

			const latestCommitSha = branchData.commit.sha;

			// 检查本地同步信息
			const syncInfo = localStorage.getItem(`dipcp-sync-${repoInfo.repo}`);
			const lastSyncCommit = syncInfo ? JSON.parse(syncInfo).lastCommit : null;

			// 如果没有上次同步记录，说明是第一次，保存当前提交并跳过
			if (!lastSyncCommit) {
				const newSyncInfo = {
					lastSync: new Date().toISOString(),
					lastCommit: latestCommitSha,
					repo: `${repoInfo.owner}/${repoInfo.repo}`
				};
				localStorage.setItem(`dipcp-sync-${repoInfo.repo}`, JSON.stringify(newSyncInfo));
				return;
			}

			// 如果有更新，静默同步
			if (lastSyncCommit !== latestCommitSha) {
				// 使用StorageService同步仓库数据
				if (window.StorageService) {
					await window.StorageService.syncRepositoryData(
						repoInfo.owner,
						repoInfo.repo,
						currentUser.token
					);
				}

				// 同步后检查权限文件是否更新
				await this.checkAndUpdateUserPermissions(currentUser, repoInfo);

				// 更新同步信息
				const newSyncInfo = {
					lastSync: new Date().toISOString(),
					lastCommit: latestCommitSha,
					repo: `${repoInfo.owner}/${repoInfo.repo}`
				};
				localStorage.setItem(`dipcp-sync-${repoInfo.repo}`, JSON.stringify(newSyncInfo));
			}

		} catch (error) {
			// 静默处理错误
		}
	}

	/**
	 * 检查并更新用户权限（如果权限文件更新）
	 * 使用app.js的统一权限检查方法
	 * @param {Object} currentUser - 当前用户信息
	 * @param {Object} repoInfo - 仓库信息
	 */
	async checkAndUpdateUserPermissions(currentUser, repoInfo) {
		// 使用app.js的统一权限检查方法
		if (window.app && window.app.syncAndUpdateUserPermissions) {
			await window.app.syncAndUpdateUserPermissions();
		}
	}

	/**
	 * 检查并更新未读@mention列表
	 */
	async checkUnreadMentions() {
		try {
			const user = window.app && window.app.getUserFromStorage ? window.app.getUserFromStorage() : null;
			if (!user || !user.user || !user.user.token) {
				return;
			}

			const currentUser = user.user;

			// 检查是否有有效的用户信息（login 或 username）
			if (!currentUser) {
				return;
			}

			const currentUsername = currentUser.username;
			if (!currentUsername) {
				return;
			}

			const repoInfo = currentUser.repositoryInfo;
			if (!repoInfo || !repoInfo.owner || !repoInfo.repo) {
				return;
			}

			// 初始化 GitHubService
			await window.GitHubService.initFromUser(currentUser);

			const username = currentUsername.toLowerCase();

			// 检查 Discussions
			try {
				const result = await window.GitHubService.graphql(`
				query GetRecentDiscussions($owner: String!, $name: String!) {
					repository(owner: $owner, name: $name) {
						discussions(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
							edges {
								node {
									number
									title
									body
									author {
										login
									}
								}
							}
						}
					}
				}
			`, {
					owner: repoInfo.owner,
					name: repoInfo.repo
				});

				const discussions = result.repository?.discussions?.edges || [];
				const unreadDiscussions = [];

				discussions.forEach(edge => {
					const discussion = edge.node;
					if (!discussion) return;

					// 检查作者是否是当前用户（如果是，则不显示红点）
					const authorLogin = discussion.author?.login?.toLowerCase();
					if (authorLogin === username) {
						return; // 自己是作者，不显示红点
					}

					// 检查讨论标题或内容中是否@了当前用户
					const title = (discussion.title || '').toLowerCase();
					const body = (discussion.body || '').toLowerCase();
					const mentionPattern = new RegExp(`@${username}\\b`);

					if (mentionPattern.test(title) || mentionPattern.test(body)) {
						unreadDiscussions.push(discussion.number);
					}
				});

				// 更新localStorage
				if (unreadDiscussions.length > 0) {
					localStorage.setItem('discussions_unread_mentions', JSON.stringify(unreadDiscussions));
				} else {
					localStorage.removeItem('discussions_unread_mentions');
				}
			} catch (error) {
				// 静默处理错误
			}

			// 检查 Issues
			try {
				const issues = await window.GitHubService.listIssues(repoInfo.owner, repoInfo.repo, {
					state: 'open',
					sort: 'updated',
					direction: 'desc',
					per_page: 20
				}, true);
				const unreadIssues = [];

				issues.forEach(issue => {
					if (!issue) return;

					// 检查作者是否是当前用户（如果是，则不显示红点）
					const authorLogin = (issue.user?.login || '').toLowerCase();
					if (authorLogin === username) {
						return; // 自己是作者，不显示红点
					}

					// 检查Issue标题或内容中是否@了当前用户
					const title = (issue.title || '').toLowerCase();
					const body = (issue.body || '').toLowerCase();
					const mentionPattern = new RegExp(`@${username}\\b`);

					if (mentionPattern.test(title) || mentionPattern.test(body)) {
						unreadIssues.push(issue.number);
					}
				});

				// 更新localStorage
				if (unreadIssues.length > 0) {
					localStorage.setItem('issues_unread_mentions', JSON.stringify(unreadIssues));
				} else {
					localStorage.removeItem('issues_unread_mentions');
				}
			} catch (error) {
				// 静默处理错误
			}

			// 更新导航项显示
			this.updateNavigationItems();

		} catch (error) {
			// 静默处理错误
		}
	}

	/**
	 * 停止检查未读通知
	 */
	stopCheckingUnreadMentions() {
		if (this.checkInterval) {
			clearTimeout(this.checkInterval);
			this.checkInterval = null;
		}
	}

	setCurrentPage(page) {
		this.setState({ currentPage: page });
		this.bindEvents();
	}
}

// 导出组件
window.Header = Header;
