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
			userRole: userInfo.userRole,
			permissionInfo: userInfo.permissionInfo,
			userInfo: null, // 目标用户信息
			userStats: null, // 用户统计信息
			userActivity: null, // 用户活动信息
			loading: true,
			error: null,
			// 模态框实例
			modal: null
		};
	}

	/**
	 * 渲染页面内容
	 * @returns {HTMLElement} 页面容器元素
	 */
	render() {
		const container = document.createElement('div');
		container.className = 'user-profile';
		container.innerHTML = `
			${this.renderHeader()}
			<main class="user-profile-main">
				${this.renderUserInfo()}
				${this.renderUserStats()}
				${this.renderUserActivity()}
			</main>
		`;
		return container;
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
		return `
			<div class="user-info-card">
				<div class="user-avatar">
					<img src="${user.avatar_url}" alt="${user.login}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
					<span class="avatar-fallback" style="display: none;">👤</span>
				</div>
				<div class="user-details">
					<h2 class="user-name">${user.name || user.login}</h2>
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
	mount(container) {
		super.mount(container);

		// 设置全局引用，供onclick使用
		window.currentPage = this;

		// 绑定事件
		this.bindEvents();

		// 加载用户数据
		this.loadUserData();
	}

	/**
	 * 绑定事件监听器
	 */
	bindEvents() {
		// 绑定Header组件的事件
		this.bindHeaderEvents();
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

			// 获取目标用户的基本信息
			const octokit = new window.Octokit({ auth: userInfo.user.token });
			const { data: targetUserInfo } = await octokit.rest.users.getByUsername({ username: this.state.username });

			// 获取用户的贡献统计
			const userStats = await this.getUserStats(this.state.username, userInfo.user.token);

			// 获取用户最近活动
			const userActivity = await this.getUserActivity(this.state.username, userInfo.user.token);

			this.setState({
				loading: false,
				userInfo: targetUserInfo,
				userStats: userStats,
				userActivity: userActivity
			});

			this.rerender();
			this.bindEvents();

		} catch (error) {
			console.error('加载用户数据失败:', error);
			this.setState({
				loading: false,
				error: error.message
			});
			this.rerender();
			this.bindEvents();
		}
	}

	/**
	 * 获取用户统计信息
	 * @param {string} username - 用户名
	 * @param {string} token - GitHub访问令牌
	 * @returns {Promise<Object>} 用户统计信息
	 */
	async getUserStats(username, token) {
		try {
			// 获取用户的仓库列表
			const octokit = new window.Octokit({ auth: token });
			const { data: repos } = await octokit.rest.repos.listForUser({ username });

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
	 * @param {string} token - GitHub访问令牌
	 * @returns {Promise<Array>} 用户活动列表
	 */
	async getUserActivity(username, token) {
		try {
			// 获取用户的事件
			const octokit = new window.Octokit({ auth: token });
			const { data: events } = await octokit.rest.activity.listPublicEventsForUser({ username });

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
	 * 销毁组件
	 * 清理全局引用、模态框和事件监听器
	 */
	destroy() {
		// 清理全局引用
		if (window.currentPage === this) {
			window.currentPage = null;
		}

		// 清理模态框
		if (this.state.modal) {
			this.state.modal.destroy();
			this.state.modal = null;
		}

		// 调用父类的destroy方法
		super.destroy();
	}
}

// 注册组件
window.UserProfilePage = UserProfilePage;
