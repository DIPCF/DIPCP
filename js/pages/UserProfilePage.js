/**
 * 用户资料页面组件
 * 显示用户的基本信息、贡献度、活跃度等公开信息
 * @class UserProfilePage
 * @extends {BasePage}
 */
class UserProfilePage extends BasePage {
	/**
	 * 构造函数
	 * @param {Object} props - 组件属性
	 * @param {string} [props.username] - 用户名
	 */
	constructor(props = {}) {
		super(props);

		// 从 localStorage 获取用户信息
		const userInfo = window.app.getUserFromStorage();

		this.state = {
			username: props.username || null,
			user: userInfo.user,
			userRoles: userInfo.userRoles, // 保存用户角色数组
			permissionInfo: userInfo.permissionInfo,
			userInfo: null, // 目标用户信息
			userStats: null, // 用户统计信息
			userActivity: null, // 用户活动信息
			loading: true,
			error: null,
			// 模态框实例
			modal: null
		};

		// 事件绑定标记
		this._eventsBound = false;
	}

	/**
	 * 渲染页面内容
	 * @param {string} [path] - 路由路径
	 * @returns {HTMLElement} 渲染后的DOM元素
	 */
	render(path) {
		// 渲染页面内容
		const container = document.createElement('div');
		container.className = 'user-profile';
		const headerHTML = this.renderHeader();
		const userInfoHTML = this.renderUserInfo();
		const userStatsHTML = this.renderUserStats();
		const userActivityHTML = this.renderUserActivity();

		container.innerHTML = `
			${headerHTML}
			<main class="user-profile-main">
				${userInfoHTML}
				${userStatsHTML}
				${userActivityHTML}
			</main>
		`;
		return container;
	}

	/**
	 * 根据权限更新菜单按钮显示状态
	 * @param {Object} userPermissions - 用户权限对象
	 */
	updateMenuVisibility(userPermissions = { isMaintainer: false, isReviewer: false, isDirector: false }) {
		const inviteMenu = this.element.querySelector('#inviteMenu');
		if (!inviteMenu) return;

		// 更新邀请按钮的显示状态（只显示没有的权限）
		const inviteMaintainer = inviteMenu.querySelector('[data-action="invite"][data-role="maintainer"]');
		const inviteReviewer = inviteMenu.querySelector('[data-action="invite"][data-role="reviewer"]');
		const inviteDirector = inviteMenu.querySelector('[data-action="invite"][data-role="director"]');

		if (inviteMaintainer) inviteMaintainer.style.display = userPermissions.isMaintainer ? 'none' : 'block';
		if (inviteReviewer) inviteReviewer.style.display = userPermissions.isReviewer ? 'none' : 'block';
		if (inviteDirector) inviteDirector.style.display = userPermissions.isDirector ? 'none' : 'block';

		// 更新移除按钮的显示状态（只显示已有的权限）
		const removeMaintainer = inviteMenu.querySelector('[data-action="remove"][data-role="maintainer"]');
		const removeReviewer = inviteMenu.querySelector('[data-action="remove"][data-role="reviewer"]');
		const removeDirector = inviteMenu.querySelector('[data-action="remove"][data-role="director"]');

		if (removeMaintainer) removeMaintainer.style.display = userPermissions.isMaintainer ? 'block' : 'none';
		if (removeReviewer) removeReviewer.style.display = userPermissions.isReviewer ? 'block' : 'none';
		if (removeDirector) removeDirector.style.display = userPermissions.isDirector ? 'block' : 'none';
	}

	/**
	 * 渲染页面头部
	 * @returns {string} 头部HTML字符串
	 */
	renderHeader() {
		// 使用BasePage的renderHeader方法
		return super.renderHeader('user-profile', false, null);
	}

	/**
	 * 渲染用户基本信息卡片
	 * @returns {string} 用户信息HTML字符串
	 */
	renderUserInfo() {
		if (this.state.loading) {
			return `
				<div class="user-info-card">
					<div class="loading">${this.t('common.loading', '载入中...')}</div>
				</div>
			`;
		}

		if (this.state.error) {
			return `
				<div class="user-info-card">
					<div class="error-message">
						<h3>${this.t('userProfile.loadError', '加载失败')}</h3>
						<p>${this.state.error}</p>
						<button class="btn btn-primary" onclick="window.currentPage.loadUserData()">
							${this.t('userProfile.retry', '重试')}
						</button>
					</div>
				</div>
			`;
		}

		const user = this.state.userInfo;
		const isAdmin = this.checkAdminPermission();
		// 检查目标用户是否是当前登录用户自己
		const currentUsername = (this.state.user?.username || this.state.user?.login || '').toLowerCase();
		const targetUsername = (user.login || user.username || '').toLowerCase();
		const isViewingSelf = currentUsername === targetUsername;

		return `
			<div class="user-info-card">
				<div class="user-avatar">
					<img src="${user.avatar_url}" alt="${user.login}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
					<span class="avatar-fallback" style="display: none;">📝</span>
				</div>
				<div class="user-details">
					<div class="breadcrumb-container" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
						<h2 class="user-name" style="margin: 0;">${user.name || user.login}</h2>
						${isAdmin && !isViewingSelf ? `
							<div class="dropdown">
								<button class="dropdown-toggle" id="inviteMenuBtn">⋯</button>
								<div class="dropdown-menu" id="inviteMenu">
									<a href="#" class="dropdown-item" data-action="invite" data-role="maintainer" style="display: none;">📝 ${this.t('userProfile.inviteMaintainer', '邀请成为维护者')}</a>
									<a href="#" class="dropdown-item" data-action="invite" data-role="reviewer" style="display: none;">✨ ${this.t('userProfile.inviteReviewer', '邀请成为审核委员')}</a>
									<a href="#" class="dropdown-item" data-action="invite" data-role="director" style="display: none;">👑 ${this.t('userProfile.inviteDirector', '邀请成为理事')}</a>
									<a href="#" class="dropdown-item dropdown-item-danger" data-action="remove" data-role="maintainer" style="display: none;">🗑️ ${this.t('userProfile.removeMaintainer', '移除维护权限')}</a>
									<a href="#" class="dropdown-item dropdown-item-danger" data-action="remove" data-role="reviewer" style="display: none;">🗑️ ${this.t('userProfile.removeReviewer', '移除审核权限')}</a>
									<a href="#" class="dropdown-item dropdown-item-danger" data-action="remove" data-role="director" style="display: none;">🗑️ ${this.t('userProfile.removeDirector', '移除理事权限')}</a>
								</div>
							</div>
						` : ''}
					</div>
					<p class="user-username">@${user.login}</p>
					${user.bio ? `<p class="user-bio">${user.bio}</p>` : ''}
					<div class="user-meta">
						${user.location ? `<span class="meta-item">📍 ${user.location}</span>` : ''}
						${user.company ? `<span class="meta-item">🏢 ${user.company}</span>` : ''}
						${user.blog ? `<span class="meta-item">🌐 <a href="${user.blog}" target="_blank">${user.blog}</a></span>` : ''}
					</div>
					<div class="user-stats-basic">
						<div class="stat-item">
							<span class="stat-number">${user.public_repos || 0}</span>
							<span class="stat-label">${this.t('userProfile.repositories', '仓库')}</span>
						</div>
						<div class="stat-item">
							<span class="stat-number">${user.followers || 0}</span>
							<span class="stat-label">${this.t('userProfile.followers', '关注者')}</span>
						</div>
						<div class="stat-item">
							<span class="stat-number">${user.following || 0}</span>
							<span class="stat-label">${this.t('userProfile.following', '关注中')}</span>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * 渲染用户统计信息卡片
	 * @returns {string} 统计信息HTML字符串
	 */
	renderUserStats() {
		if (this.state.loading || this.state.error) {
			return '';
		}

		const stats = this.state.userStats;
		return `
			<div class="user-stats-card">
				<h3>${this.t('userProfile.contributionStats', '贡献统计')}</h3>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-icon">📊</div>
						<div class="stat-content">
							<h4>${this.t('userProfile.totalContributions', '总贡献')}</h4>
							<p class="stat-number">${stats.totalContributions || 0}</p>
						</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">🔥</div>
						<div class="stat-content">
							<h4>${this.t('userProfile.contributionStreak', '连续贡献')}</h4>
							<p class="stat-number">${stats.contributionStreak || 0} ${this.t('userProfile.days', '天')}</p>
						</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">⭐</div>
						<div class="stat-content">
							<h4>${this.t('userProfile.starsReceived', '获得星标')}</h4>
							<p class="stat-number">${stats.starsReceived || 0}</p>
						</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">🍴</div>
						<div class="stat-content">
							<h4>${this.t('userProfile.forksReceived', '获得分叉')}</h4>
							<p class="stat-number">${stats.forksReceived || 0}</p>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * 渲染用户活动列表
	 * @returns {string} 活动列表HTML字符串
	 */
	renderUserActivity() {
		if (this.state.loading || this.state.error) {
			return '';
		}

		const activity = this.state.userActivity || [];
		return `
			<div class="user-activity-card">
				<h3>${this.t('userProfile.recentActivity', '最近活动')}</h3>
				<div class="activity-list">
					${activity.length > 0 ? activity.map(item => `
						<div class="activity-item">
							<div class="activity-icon">${item.icon}</div>
							<div class="activity-content">
								<p>${item.description}</p>
								<span class="activity-time">${item.time}</span>
							</div>
						</div>
					`).join('') : `
						<div class="empty-state">
							<p>${this.t('userProfile.noRecentActivity', '暂无最近活动')}</p>
						</div>
					`}
				</div>
			</div>
		`;
	}

	/**
	 * 挂载组件到容器
	 * @param {HTMLElement} container - 容器元素
	 */
	async mount(container) {
		// 调用父类的mount方法，它会调用render()并挂载
		super.mount(container);

		// 设置全局引用，供onclick使用
		window.currentPage = this;

		// 绑定事件（异步）
		await this.bindEvents();

		// 加载用户数据
		this.loadUserData();
	}

	/**
	 * 绑定事件监听器
	 */
	async bindEvents() {
		// 绑定Header组件的事件
		this.bindHeaderEvents();

		// 绑定邀请菜单
		await this.bindInviteMenuEvents();

		// 绑定StorageService的事件监听
		this.bindStorageServiceEvents();
	}

	/**
	 * 绑定StorageService的事件监听
	 */
	bindStorageServiceEvents() {
		// 先调用父类方法（绑定导航菜单更新逻辑）
		super.bindStorageServiceEvents();

		// 权限变更事件监听 - 添加UserProfilePage特定的处理
		if (window.StorageService && window.StorageService.on) {
			// UserProfilePage特定的权限变更处理
			const oldHandler = this._permissionChangedHandler;
			this._permissionChangedHandler = async (data) => {
				console.log('收到权限变更事件:', data);
				// 先执行父类的菜单更新逻辑
				if (oldHandler) {
					oldHandler(data);
				}
				// 再执行UserProfilePage特定的逻辑：如果当前正在显示邀请菜单，更新菜单可见性
				if (this.state.userInfo && this._eventsBound) {
					const userPermissions = await this.getUserPermissions(this.state.userInfo.login);
					this.updateMenuVisibility(userPermissions);
				}
			};

			// 重新注册更新后的处理器
			window.StorageService.off('permission-changed', oldHandler);
			window.StorageService.on('permission-changed', this._permissionChangedHandler);
		}
	}

	/**
	 * 检查当前用户是否是理事（Admin权限）
	 * @returns {boolean} 是否是理事
	 */
	checkAdminPermission() {
		// 使用userRoles数组检查权限（支持多重角色）
		const roles = this.state.userRoles || (this.state.permissionInfo?.roles || []);
		return roles.includes('director');
	}

	/**
	 * 获取用户的权限信息
	 * @param {string} username - 用户名
	 * @returns {Promise<Object>} 用户权限信息
	 */
	async getUserPermissions(username) {
		try {
			// 使用app.js的buildUserRolesMap方法从角色文件中读取用户权限
			const userRolesMap = await window.app.buildUserRolesMap();
			const roles = userRolesMap.get(username.toLowerCase()) || [];

			return {
				isMaintainer: roles.includes('maintainer'),
				isReviewer: roles.includes('reviewer'),
				isDirector: roles.includes('director')
			};
		} catch (error) {
			console.error('获取用户权限失败:', error);
			return {
				isMaintainer: false,
				isReviewer: false,
				isDirector: false
			};
		}
	}

	/**
	 * 处理邀请操作
	 * @param {string} role - 角色类型：maintainer/reviewer/director
	 */
	async handleInvite(role) {
		const targetUser = this.state.userInfo;
		const currentUser = this.state.user;
		const repoInfo = this.state.user.repositoryInfo;

		// 检查是否试图邀请自己
		const currentUsernameCheck = (currentUser.username || currentUser.login || '').toLowerCase();
		const targetUsernameCheck = (targetUser.login || targetUser.username || '').toLowerCase();
		if (currentUsernameCheck === targetUsernameCheck) {
			this.showModal(
				this.t('userProfile.errors.cannotInviteSelf', '不能邀请自己成为角色成员'),
				''
			);
			return;
		}

		// 根据角色确定权限级别和编号
		const roleInfo = {
			maintainer: {
				permission: 'push',
				label: this.t('roles.maintainer', '维护者'),
				emoji: '📝',
				code: '#1'
			},
			reviewer: {
				permission: 'triage',
				label: this.t('roles.reviewer', '审核委员'),
				emoji: '✨',
				code: '#2'
			},
			director: {
				permission: 'admin',
				label: this.t('roles.director', '理事'),
				emoji: '👑',
				code: '#3'
			}
		};

		const info = roleInfo[role];
		const targetUsername = targetUser.login || targetUser.username || '';

		// 显示确认模态框
		if (!this.state.modal) {
			this.state.modal = new window.Modal();
		}

		this.state.modal.showConfirm(
			`${info.emoji} ${this.t('userProfile.confirmInvite', '确认邀请')}`,
			this.t('userProfile.confirmInviteMessage', '确定要邀请 @{username} 成为{role}吗？邀请将通过GitHub Issues发送，对方需要回复 ACCEPT 接受邀请。')
				.replace('{username}', targetUsername)
				.replace('{role}', info.label),
			async (confirmed) => {
				if (confirmed) {
					// 用户确认，执行邀请操作
					try {
						// 获取当前用户的用户名（用于Issue内容，保持原始格式）
						const currentUsername = currentUser.username || currentUser.login || '';

						// 创建邀请Issue
						await this.createInviteIssue({
							username: targetUsername,
							role: info.label,
							emoji: info.emoji,
							roleCode: info.code,
							currentUser: currentUsername,
							owner: repoInfo.owner,
							repo: repoInfo.repo
						});

						// 邀请成功后不显示提示，静默处理
						// 可选：更新菜单可见性，以便立即反映变化
						if (this.state.userInfo && this._eventsBound) {
							try {
								const userPermissions = await this.getUserPermissions(this.state.userInfo.login);
								this.updateMenuVisibility(userPermissions);
							} catch (error) {
								console.warn('更新菜单可见性失败:', error);
							}
						}
					} catch (error) {
						// 只有出错时才显示错误提示
						this.showModal(
							this.t('userProfile.errors.inviteFailed', '发送邀请失败：{error}').replace('{error}', error.message),
							''
						);
					}
				}
				// 如果用户取消，不执行任何操作
			}
		);
	}

	/**
	 * 创建邀请Issue
	 * @param {Object} params - 邀请参数
	 */
	async createInviteIssue(params) {
		const { username, role, emoji, roleCode, currentUser, owner, repo } = params;

		// 初始化 GitHubService
		await window.GitHubService.initFromUser(this.state.user);

		// Issue标题格式：邀请 @username 成为role (roleCode)
		const issueTitle = `${emoji} 邀请 @${username} 成为${role} ${roleCode}`;
		const issueBody = `
您好 @${username}！

我们希望能邀请您成为 **${repo}** 项目的${role}。

**邀请者：** @${currentUser}
**角色：** ${role} ${roleCode}
**权限：** ${this.getRolePermission(role)}

请回复 **ACCEPT** 接受邀请，或回复 **REJECT** 拒绝邀请。

期待您的加入！🙌

---

*此邀请通过GitHub Issues发送，您将收到通知。*
		`;

		try {
			// 使用 GitHubService 创建 Issue
			const issue = await window.GitHubService.createIssue(owner, repo, {
				title: issueTitle,
				body: issueBody,
				labels: ['role-invitation']
			});

			return issue;
		} catch (error) {
			throw new Error(`创建Issue失败: ${error.message}`);
		}
	}

	/**
	 * 获取角色对应的权限描述
	 */
	getRolePermission(role) {
		const permissions = {
			maintainer: '审核内容、提出修改建议、合并到仓库主分支',
			reviewer: '为创作者授予积分，管理和裁决积分相关的申诉',
			director: '管理用户权限，制定社区发展策略'
		};
		return permissions[role] || '协同创作权限';
	}

	/**
	 * 处理移除权限操作
	 * @param {string} role - 角色类型：maintainer/reviewer/director
	 */
	async handleRemovePermission(role) {
		const targetUser = this.state.userInfo;
		const currentUser = this.state.user;
		const repoInfo = this.state.user.repositoryInfo;

		// 检查是否试图移除自己的权限
		const currentUsernameCheck = (currentUser.username || currentUser.login || '').toLowerCase();
		const targetUsernameCheck = (targetUser.login || targetUser.username || '').toLowerCase();
		if (currentUsernameCheck === targetUsernameCheck) {
			this.showModal(
				this.t('userProfile.errors.cannotRemoveSelf', '不能移除自己的权限'),
				''
			);
			return;
		}

		// 根据角色确定权限级别和编号
		const roleInfo = {
			maintainer: {
				label: this.t('roles.maintainer', '维护者'),
				emoji: '📝',
				code: '#1'
			},
			reviewer: {
				label: this.t('roles.reviewer', '审核委员'),
				emoji: '✨',
				code: '#2'
			},
			director: {
				label: this.t('roles.director', '理事'),
				emoji: '👑',
				code: '#3'
			}
		};

		const info = roleInfo[role];
		const targetUsername = targetUser.login || targetUser.username || '';

		// 显示确认模态框
		if (!this.state.modal) {
			this.state.modal = new window.Modal();
		}

		this.state.modal.showConfirm(
			`${info.emoji} ${this.t('userProfile.confirmRemovePermission', '确认移除权限')}`,
			this.t('userProfile.confirmRemovePermissionMessage', '确定要移除 @{username} 的{role}权限吗？此操作将通过GitHub Actions自动处理。')
				.replace('{username}', targetUsername)
				.replace('{role}', info.label),
			async (confirmed) => {
				if (confirmed) {
					// 用户确认，执行移除操作
					try {
						// 获取当前用户的用户名（用于Issue内容，保持原始格式）
						const currentUsername = currentUser.username || currentUser.login || '';

						// 创建移除权限Issue（将自动触发工作流处理）
						await this.createRemovePermissionIssue({
							username: targetUsername,
							role: info.label,
							emoji: info.emoji,
							roleCode: info.code,
							currentUser: currentUsername,
							owner: repoInfo.owner,
							repo: repoInfo.repo
						});

						// 移除成功后不显示提示，静默处理
						// 可选：更新菜单可见性，以便立即反映变化
						if (this.state.userInfo && this._eventsBound) {
							try {
								const userPermissions = await this.getUserPermissions(this.state.userInfo.login);
								this.updateMenuVisibility(userPermissions);
							} catch (error) {
								console.warn('更新菜单可见性失败:', error);
							}
						}
					} catch (error) {
						// 只有出错时才显示错误提示
						this.showModal(
							this.t('userProfile.errors.removePermissionFailed', '发送移除权限请求失败：{error}').replace('{error}', error.message),
							''
						);
					}
				}
				// 如果用户取消，不执行任何操作
			}
		);
	}

	/**
	 * 创建移除权限Issue
	 * @param {Object} params - 移除权限参数
	 */
	async createRemovePermissionIssue(params) {
		const { username, role, emoji, roleCode, currentUser, owner, repo } = params;

		// 初始化 GitHubService
		await window.GitHubService.initFromUser(this.state.user);

		// Issue标题格式：移除 @username 的role权限 (roleCode)
		const issueTitle = `${emoji} 移除 @${username} 的${role}权限 ${roleCode}`;
		const issueBody = `
此Issue将自动触发工作流，移除 @${username} 的${role}权限。

**操作者：** @${currentUser}
**目标用户：** @${username}
**角色：** ${role} ${roleCode}
**权限描述：** ${this.getRolePermission(role)}

---

*此操作将通过GitHub Actions自动处理，无需手动操作。*
		`;

		try {
			// 使用 GitHubService 创建 Issue，创建后会自动触发工作流
			const issue = await window.GitHubService.createIssue(owner, repo, {
				title: issueTitle,
				body: issueBody,
				labels: ['role-removal']
			});

			return issue;
		} catch (error) {
			throw new Error(`创建Issue失败: ${error.message}`);
		}
	}

	/**
	 * 加载用户数据
	 * 从GitHub API获取目标用户的基本信息、统计数据和活动记录
	 * @async
	 */
	async loadUserData() {
		try {
			this.setState({ loading: true, error: null });

			// 获取当前用户信息
			const userInfo = window.app.getUserFromStorage();
			if (!userInfo.user || !userInfo.user.token) {
				throw new Error(this.t('userProfile.errors.userNotLoggedInOrTokenUnavailable', '用户未登录或访问令牌不可用'));
			}

			// 初始化 GitHubService（即使获取用户信息不需要 token，也初始化以便后续使用）
			await window.GitHubService.initFromUser(userInfo.user);

			// 获取目标用户的基本信息（使用公开 API，不需要 token）
			const targetUserInfo = await window.GitHubService.getUserByUsername(this.state.username);

			// 获取用户的贡献统计
			const userStats = await this.getUserStats(this.state.username);

			// 获取用户最近活动
			const userActivity = await this.getUserActivity(this.state.username);

			this.setState({
				loading: false,
				userInfo: targetUserInfo,
				userStats: userStats,
				userActivity: userActivity
			});

			// 只更新用户信息部分，不重新绑定事件
			await this.updateUserInfoDisplay();

		} catch (error) {
			console.error('加载用户数据失败:', error);
			this.setState({
				loading: false,
				error: error.message
			});

			// 只更新错误显示部分
			await this.updateUserInfoDisplay();
		}
	}

	/**
	 * 获取用户统计信息
	 * @param {string} username - 用户名
	 * @returns {Promise<Object>} 用户统计信息
	 */
	async getUserStats(username) {
		try {
			// 获取用户的仓库列表
			const repos = await window.GitHubService.listUserRepos(username);

			// 计算统计信息
			const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
			const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);

			return {
				totalContributions: repos.length,
				contributionStreak: 0, // 这个需要更复杂的计算
				starsReceived: totalStars,
				forksReceived: totalForks
			};
		} catch (error) {
			console.error('获取用户统计失败:', error);
			return {
				totalContributions: 0,
				contributionStreak: 0,
				starsReceived: 0,
				forksReceived: 0
			};
		}
	}

	/**
	 * 获取用户最近活动
	 * @param {string} username - 用户名
	 * @returns {Promise<Array>} 用户活动列表
	 */
	async getUserActivity(username) {
		try {
			// 获取用户的事件
			const events = await window.GitHubService.listUserPublicEvents(username);

			// 处理事件并转换为活动列表
			const activities = events.slice(0, 10).map(event => {
				const icon = this.getActivityIcon(event.type);
				const description = this.getActivityDescription(event);
				const time = this.formatTime(event.created_at);

				return {
					icon,
					description,
					time
				};
			});

			return activities;
		} catch (error) {
			console.error('获取用户活动失败:', error);
			return [];
		}
	}

	/**
	 * 获取活动图标
	 * @param {string} type - 活动类型
	 * @returns {string} 对应的图标
	 */
	getActivityIcon(type) {
		const iconMap = {
			'PushEvent': '📝',
			'CreateEvent': '🆕',
			'IssuesEvent': '🐛',
			'PullRequestEvent': '🔀',
			'WatchEvent': '⭐',
			'ForkEvent': '🍴'
		};
		return iconMap[type] || '📋';
	}

	/**
	 * 获取活动描述
	 * @param {Object} event - GitHub事件对象
	 * @returns {string} 活动描述文本
	 */
	getActivityDescription(event) {
		const type = event.type;
		const repo = event.repo?.name || 'repository';

		switch (type) {
			case 'PushEvent':
				return `推送了代码到 ${repo}`;
			case 'CreateEvent':
				return `创建了仓库 ${repo}`;
			case 'IssuesEvent':
				return `在 ${repo} 中处理了问题`;
			case 'PullRequestEvent':
				return `在 ${repo} 中处理了拉取请求`;
			case 'WatchEvent':
				return `关注了仓库 ${repo}`;
			case 'ForkEvent':
				return `分叉了仓库 ${repo}`;
			default:
				return `在 ${repo} 中进行了活动`;
		}
	}

	/**
	 * 更新用户信息显示（局部更新）
	 */
	async updateUserInfoDisplay() {
		if (!this.element) return;

		// 更新用户基本信息
		const mainContent = this.element.querySelector('main.user-profile-main');
		if (mainContent) {
			mainContent.innerHTML = `
				${this.renderUserInfo()}
				${this.renderUserStats()}
				${this.renderUserActivity()}
			`;
			// 需要重新绑定邀请菜单事件
			await this.bindInviteMenuEvents();
		}
	}

	/**
	 * 绑定邀请菜单事件
	 */
	async bindInviteMenuEvents() {
		// 如果已经绑定过事件，直接更新菜单显示状态即可
		if (this._eventsBound) {
			if (this.state.userInfo) {
				const userPermissions = await this.getUserPermissions(this.state.userInfo.login);
				this.updateMenuVisibility(userPermissions);
			}
			return;
		}

		const inviteMenuBtn = this.element.querySelector('#inviteMenuBtn');
		const inviteMenu = this.element.querySelector('#inviteMenu');

		if (inviteMenuBtn && inviteMenu) {
			// 异步加载用户权限并显示/隐藏对应的选项
			if (this.state.userInfo) {
				const userPermissions = await this.getUserPermissions(this.state.userInfo.login);
				this.updateMenuVisibility(userPermissions);
			}

			inviteMenuBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				inviteMenu.classList.toggle('show');
			});

			// 下拉菜单项点击事件
			const dropdownItems = inviteMenu.querySelectorAll('.dropdown-item');
			dropdownItems.forEach(item => {
				item.addEventListener('click', async (e) => {
					e.preventDefault();
					const action = e.currentTarget.dataset.action;
					const role = e.currentTarget.dataset.role;

					// 关闭下拉菜单
					inviteMenu.classList.remove('show');

					// 根据操作类型处理
					if (action === 'invite') {
						await this.handleInvite(role);
					} else if (action === 'remove') {
						await this.handleRemovePermission(role);
					}
				});
			});

			// 点击其他地方关闭下拉菜单
			const handleDocumentClick = (e) => {
				if (!inviteMenuBtn.contains(e.target) && !inviteMenu.contains(e.target)) {
					inviteMenu.classList.remove('show');
				}
			};
			document.addEventListener('click', handleDocumentClick);

			// 保存document事件处理器的引用，以便后续可以移除
			this._documentClickHandler = handleDocumentClick;
			this._eventsBound = true;
		}
	}

	/**
	 * 格式化时间
	 * @param {string} dateString - 日期字符串
	 * @returns {string} 格式化后的时间文本
	 */
	formatTime(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now - date;

		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 60) {
			return `${minutes}分钟前`;
		} else if (hours < 24) {
			return `${hours}小时前`;
		} else if (days < 7) {
			return `${days}天前`;
		} else {
			return date.toLocaleDateString();
		}
	}

	/**
	 * 显示模态框
	 * @param {string} title - 标题
	 * @param {string} message - 消息内容
	 * @param {Object} [options] - 可选配置
	 */
	showModal(title, message, options = {}) {
		// 如果没有创建过modal，创建一个新的
		if (!this.state.modal) {
			this.state.modal = new window.Modal();
		}
		// 默认不显示取消按钮（信息提示只需要关闭按钮）
		this.state.modal.showInfo(title, message, { showCancel: false, ...options });
	}

	/**
	 * 销毁组件
	 * 清理全局引用、模态框和事件监听器
	 */
	destroy() {
		// 清理全局引用
		if (window.currentPage === this) {
			window.currentPage = null;
		}

		// 移除StorageService的事件监听
		if (window.StorageService && window.StorageService.off) {
			if (this._permissionChangedHandler) {
				window.StorageService.off('permission-changed', this._permissionChangedHandler);
				this._permissionChangedHandler = null;
			}
		}

		// 清理模态框
		if (this.state.modal) {
			this.state.modal.destroy();
			this.state.modal = null;
		}

		// 移除document点击事件监听器
		if (this._documentClickHandler) {
			document.removeEventListener('click', this._documentClickHandler);
			this._documentClickHandler = null;
		}

		// 调用父类的destroy方法
		super.destroy();
	}
}

// 注册组件
window.UserProfilePage = UserProfilePage;
