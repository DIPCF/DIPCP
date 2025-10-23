/**
 * 用户资料页面组件
 * 显示用户的基本信息、贡献度、活跃度等公开信息
 */
class UserProfilePage extends BasePage {
	constructor(props = {}) {
		super(props);
		this.state = {
			username: props.username || null,
			userInfo: props.userInfo || null,
			userStats: props.userStats || null,
			loading: true,
			error: null,
			// 模态框实例
			modal: null
		};
	}

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

	renderHeader() {
		// 使用BasePage的renderHeader方法
		return super.renderHeader('user-profile', false, null);
	}

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

	mount(container) {
		super.mount(container);

		// 设置全局引用，供onclick使用
		window.currentPage = this;

		// 绑定事件
		this.bindEvents();

		// 加载用户数据
		this.loadUserData();
	}

	bindEvents() {
		// 绑定Header组件的事件
		this.bindHeaderEvents();
	}

	async loadUserData() {
		try {
			this.setState({ loading: true, error: null });

			// 获取用户信息和仓库信息
			const userData = localStorage.getItem('spcp-user');
			if (!userData) {
				throw new Error('用户未登录');
			}

			const user = JSON.parse(userData);
			const repoInfo = user.repositoryInfo;

			if (!repoInfo || !user.token) {
				throw new Error('仓库信息或访问令牌不可用');
			}

			// 获取目标用户的基本信息
			const userInfo = await window.GitHubService.getUserInfo(this.state.username, user.token);

			// 获取用户的贡献统计
			const userStats = await this.getUserStats(this.state.username, user.token);

			// 获取用户最近活动
			const userActivity = await this.getUserActivity(this.state.username, user.token);

			this.setState({
				loading: false,
				userInfo: userInfo,
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
	 */
	async getUserStats(username, token) {
		try {
			// 获取用户的仓库列表
			const repos = await window.GitHubService.getUserRepos(username, token);

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
	 */
	async getUserActivity(username, token) {
		try {
			// 获取用户的事件
			const events = await window.GitHubService.getUserEvents(username, token);

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
