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
		};
		this.checkInterval = null;
	}

	render() {
		const header = document.createElement('header');
		header.className = 'header';
		header.innerHTML = `
            <div class="header-left">
                <h1 class="logo">${this.state.title}</h1>
                <nav class="nav-menu">
                    ${this.renderNavigationItems()}
                </nav>
            </div>
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

		// 只在第一次绑定时启动定期检查未读通知
		if (!this._pollingStarted) {
			this._pollingStarted = true;
			this.startCheckingUnreadMentions();
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

			const octokit = new window.Octokit({ auth: currentUser.token });

			// 获取main分支的最新提交SHA
			const { data: branchData } = await octokit.rest.repos.getBranch({
				owner: repoInfo.owner,
				repo: repoInfo.repo,
				branch: 'main'
			});

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

			const currentUsername = currentUser.login || currentUser.username;
			if (!currentUsername) {
				return;
			}

			const repoInfo = currentUser.repositoryInfo;
			if (!repoInfo || !repoInfo.owner || !repoInfo.repo) {
				return;
			}

			const octokit = new window.Octokit({ auth: currentUser.token });
			const username = currentUsername.toLowerCase();

			// 检查 Discussions
			try {
				const result = await octokit.graphql(`
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
				const issuesResult = await octokit.rest.issues.listForRepo({
					owner: repoInfo.owner,
					repo: repoInfo.repo,
					state: 'open',
					sort: 'updated',
					direction: 'desc',
					per_page: 20
				});

				const issues = issuesResult.data || [];
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
