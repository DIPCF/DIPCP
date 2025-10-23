/**
 * 仪表盘页面组件
 * 完全组件化的仪表盘页面
 */
class DashboardPage extends BasePage {
	constructor(props = {}) {
		super(props);
		this.state = {
			user: props.user || null,
			userRole: props.userRole || null,
			permissionInfo: props.permissionInfo || null,
			stats: props.stats || {
				totalPoints: 150,
				myContributions: 5,
				pendingReviews: 2,
				approvedContributions: 3
			},
			activities: props.activities || [
				{
					icon: '📝',
					text: '您提交了一个新的文档：SPCP 技术设计文档 v1.1',
					time: '2小时前',
					textKey: 'dashboard.activity1',
					timeKey: 'dashboard.time1'
				},
				{
					icon: '✅',
					text: '您的贡献 \'修复登录页面\' 已被合并，获得 10 积分',
					time: '1天前',
					textKey: 'dashboard.activity2',
					timeKey: 'dashboard.time2'
				},
				{
					icon: '💬',
					text: '审核员 \'reviewer-1\' 评论了您的贡献 \'优化主题切换\'',
					time: '2天前',
					textKey: 'dashboard.activity3',
					timeKey: 'dashboard.time3'
				}
			],
			onLogout: props.onLogout || null,
			onQuickAction: props.onQuickAction || null,
			onApplyContribution: props.onApplyContribution || null,
			applicationReason: '',
			// 模态框实例
			modal: null
		};
	}

	render() {
		const container = document.createElement('div');
		container.className = 'dashboard';
		container.innerHTML = `
			${this.renderHeader()}
			<div class="content">
				${this.renderWelcome()}
				${this.renderApplicationSection()}
				${this.renderStatsGrid()}
				${this.renderRecentActivity()}
			</div>
		`;
		return container;
	}

	renderHeader() {
		// 使用BasePage的renderHeader方法，并添加退出项目按钮
		const headerHtml = super.renderHeader('dashboard', false, null);
		// 在header-right中添加退出项目按钮
		return headerHtml.replace(
			'<div class="header-right">',
			`<div class="header-right">
				<button id="exit-project-btn" class="btn danger">${this.t('dashboard.exitProject', '退出项目')}</button>`
		);
	}

	renderWelcome() {
		return `
            <div class="welcome">
                <h2>${this.t('dashboard.welcome', '欢迎使用 SPCP！')}</h2>
                <p>${this.t('dashboard.subtitle', '无服务器项目贡献平台')}</p>
            </div>
        `;
	}

	renderApplicationSection() {
		console.log('renderApplicationSection - userRole:', this.state.userRole);
		// 所有者不显示申请区域
		if (this.state.userRole === 'owner') {
			console.log('User is owner, hiding application section');
			return '';
		}

		// 协作者不显示申请区域
		if (this.state.userRole === 'collaborator') {
			console.log('User is collaborator, hiding application section');
			return '';
		}

		// 访客显示申请按钮
		return `
			<div class="application-section">
				<div class="application-card">
					<div class="application-icon">🤝</div>
					<div class="application-content">
						<h3>${this.t('dashboard.application.title', '成为贡献者')}</h3>
						<p>${this.t('dashboard.application.description', '申请成为项目贡献者，参与代码开发和项目维护。')}</p>
						<button id="apply-contribution-btn" class="btn btn-primary">
							${this.t('dashboard.application.applyButton', '申请成为贡献者')}
						</button>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * 初始化模态框
	 */
	initModal() {
		if (!this.state.modal) {
			this.state.modal = new Modal();
			const modalElement = this.state.modal.render();
			document.body.appendChild(modalElement);
			this.state.modal.element = modalElement;
			this.state.modal.bindEvents();
		} else {
			// 如果模态框已存在，确保它被正确显示
			if (this.state.modal.element && this.state.modal.element.parentNode) {
				// 模态框已经在DOM中，不需要重新添加
			} else {
				// 模态框不在DOM中，重新添加
				const modalElement = this.state.modal.render();
				document.body.appendChild(modalElement);
				this.state.modal.element = modalElement;
				this.state.modal.bindEvents();
			}
		}
	}

	renderStatsGrid() {
		const roleInfo = this.getUserRoleInfo();
		const userAvatar = this.getCachedUserAvatar();

		return `
            <div class="stats-grid">
                <div class="stat-card user-role-card">
                    <div class="stat-icon role-icon" style="background-image: url('${userAvatar}'); background-size: cover; background-position: center;">
                        ${userAvatar.startsWith('http') ? '' : userAvatar}
                    </div>
                    <div class="stat-content role-content">
                        <h3>${this.t('dashboard.userRole.title', '用户身份')}</h3>
                        <p class="stat-number role-badge ${roleInfo.className}">${roleInfo.displayName}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <h3>${this.t('dashboard.totalPoints', '总积分')}</h3>
                        <p class="stat-number" id="total-points">${this.state.stats.totalPoints}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📝</div>
                    <div class="stat-content">
                        <h3>${this.t('dashboard.myContributions', '我的贡献')}</h3>
                        <p class="stat-number" id="my-contributions">${this.state.stats.myContributions}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-content">
                        <h3>${this.t('dashboard.pendingReviews', '待审核')}</h3>
                        <p class="stat-number" id="pending-reviews">${this.state.stats.pendingReviews}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <h3>${this.t('dashboard.approvedContributions', '已通过')}</h3>
                        <p class="stat-number" id="approved-contributions">${this.state.stats.approvedContributions}</p>
                    </div>
                </div>
            </div>
        `;
	}

	/**
	 * 获取用户身份信息
	 */
	getUserRoleInfo() {
		const role = this.state.userRole || 'visitor';

		const roleMap = {
			'owner': {
				displayName: this.t('dashboard.userRole.owner', '所有者'),
				className: 'role-owner'
			},
			'admin': {
				displayName: this.t('dashboard.userRole.admin', '管理员'),
				className: 'role-admin'
			},
			'reviewer': {
				displayName: this.t('dashboard.userRole.reviewer', '审核委员'),
				className: 'role-reviewer'
			},
			'collaborator': {
				displayName: this.t('dashboard.userRole.collaborator', '贡献者'),
				className: 'role-collaborator'
			},
			'visitor': {
				displayName: this.t('dashboard.userRole.visitor', '访客'),
				className: 'role-visitor'
			}
		};

		return roleMap[role] || roleMap['visitor'];
	}

	/**
	 * 获取缓存的用户头像
	 */
	getCachedUserAvatar() {
		// 首先尝试从当前用户状态获取
		if (this.state.user?.avatarUrl) {
			return this.state.user.avatarUrl;
		}

		// 从localStorage获取缓存的用户信息
		const userData = localStorage.getItem('spcp-user');
		if (userData) {
			try {
				const user = JSON.parse(userData);
				if (user.avatarUrl) {
					return user.avatarUrl;
				}
			} catch (error) {
				console.error('解析用户数据失败:', error);
			}
		}

		// 如果都没有，返回默认头像
		return '👤';
	}


	renderRecentActivity() {
		return `
            <div class="recent-activity">
                <h3>${this.t('dashboard.recentActivity', '最近活动')}</h3>
                <div class="activity-list" id="activity-list">
                    ${this.state.activities.map(activity => `
                        <div class="activity-item">
                            <div class="activity-icon">${activity.icon}</div>
                            <div class="activity-content">
                                <p>${activity.textKey ? this.t(activity.textKey, activity.text) : activity.text}</p>
                                <span class="activity-time">${activity.timeKey ? this.t(activity.timeKey, activity.time) : activity.time}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
	}

	mount(container) {
		super.mount(container);

		// 绑定事件
		this.bindEvents();
	}

	bindEvents() {
		// 绑定Header组件的事件
		this.bindHeaderEvents();

		// 退出项目
		const exitProjectBtn = this.element.querySelector('#exit-project-btn');
		if (exitProjectBtn) {
			exitProjectBtn.addEventListener('click', () => {
				this.showLogoutModal();
			});
		}

		// 申请贡献按钮
		const applyBtn = this.element.querySelector('#apply-contribution-btn');
		if (applyBtn) {
			applyBtn.addEventListener('click', () => {
				this.showApplicationModal();
			});
		}

		// 确认审核状态按钮
		const checkStatusBtn = this.element.querySelector('#check-review-status-btn');
		if (checkStatusBtn) {
			checkStatusBtn.addEventListener('click', () => {
				this.checkReviewStatus();
			});
		}

	}

	/**
	 * 显示申请模态框
	 */
	showApplicationModal() {
		console.log('showApplicationModal called, user state:', this.state.user);
		console.log('isAuthenticated:', this.state.user ? 'yes' : 'no');
		console.log('userRole:', this.state.userRole);

		// 如果用户未认证，先进行GitHub认证
		if (!this.state.user || !this.state.user.username) {
			console.log('User not authenticated, showing GitHub auth modal');
			this.showGitHubAuthModal();
			return;
		}

		// 已认证用户直接显示申请表单
		this.initModal();
		this.state.modal.showInput(
			this.t('dashboard.application.modalTitle', '申请成为贡献者'),
			this.t('dashboard.application.reasonLabel', '申请理由（可选）'),
			this.t('dashboard.application.reasonPlaceholder', '请简要说明您希望参与项目的原因和计划...'),
			this.state.applicationReason,
			(reason) => {
				this.handleApplicationSubmit(reason);
			}
		);
	}

	/**
	 * 显示GitHub认证模态框
	 */
	showGitHubAuthModal() {
		console.log('showGitHubAuthModal called');
		this.initModal();

		const title = this.t('github.auth.title', 'GitHub身份验证');
		const message = this.t('github.auth.message', '请输入您的GitHub Personal Access Token以验证身份：');
		const instructions = this.t('github.auth.instructions');
		const placeholder = this.t('github.auth.placeholder', 'ghp_xxxxxxxxxxxxxxxxxxxx');

		this.state.modal.showInput(
			title,
			`${message}<br><br>${instructions}`,
			placeholder,
			'',
			(token) => {
				console.log('Token received:', token ? 'yes' : 'no');
				this.verifyGitHubToken(token);
			}
		);
	}

	/**
	 * 验证GitHub Token
	 */
	async verifyGitHubToken(token) {
		try {
			// 显示加载状态
			this.showLoading();

			// 验证token
			const userInfo = await window.GitHubService.verifyWithToken(token);

			// 认证成功，保存用户信息
			this.state.user = userInfo;
			this.state.isAuthenticated = true;

			// 保存到localStorage
			localStorage.setItem('spcp-user', JSON.stringify(userInfo));

			// 隐藏加载状态
			this.hideLoading();

			// 显示申请表单
			this.showApplicationModal();

		} catch (error) {
			this.hideLoading();
			this.showError('GitHub认证失败：' + error.message);
		}
	}

	/**
	 * 显示退出确认模态框
	 */
	showLogoutModal() {
		this.initModal();
		const warningMessage = `${this.t('dashboard.logout.warningTitle', '重要提醒')}\n\n${this.t('dashboard.logout.warningMessage', '退出后，所有未提交的本地数据将被永久删除，包括：')}\n\n${this.t('dashboard.logout.warningItem1', '• 本地编辑的文件内容')}\n${this.t('dashboard.logout.warningItem2', '• 新建但未提交的文件')}\n${this.t('dashboard.logout.warningItem3', '• 本地工作区的所有修改')}\n${this.t('dashboard.logout.warningItem4', '• 用户配置和缓存数据')}\n\n${this.t('dashboard.logout.warningNote', '请确保在退出前已保存所有重要修改！')}`;

		this.state.modal.showConfirm(
			this.t('dashboard.logout.confirmTitle', '确认退出项目'),
			warningMessage,
			(confirmed) => {
				if (confirmed && this.state.onLogout) {
					this.state.onLogout();
				}
			}
		);
	}

	/**
	 * 处理申请提交
	 */
	async handleApplicationSubmit(reason) {
		this.setState({ applicationReason: reason });

		if (this.state.onApplyContribution) {
			try {
				// 1. 提交申请
				const issue = await this.state.onApplyContribution(reason);
				console.log('申请已提交，Issue:', issue);

				// 2. 显示正在审核状态
				this.showReviewingStatus(issue.number);

				// 3. 开始轮询工作流状态
				await this.pollAndAcceptInvitation(issue.number);

			} catch (error) {
				console.error('申请提交失败:', error);
				// 根据错误类型显示不同的消息
				if (error.message.includes('403')) {
					this.showError('申请提交失败：权限不足。您的Token可能没有足够的权限在GitHub仓库中创建Issue。请检查Token权限设置。');
				} else if (error.message.includes('401')) {
					this.showError('申请提交失败：认证失败。请检查您的GitHub Token是否有效。');
				} else {
					this.showError('申请提交失败：' + error.message);
				}
			}
		}
	}

	/**
	 * 显示正在审核状态
	 */
	showReviewingStatus(issueNumber) {
		// 更新申请板块显示正在审核状态
		const applicationSection = this.element.querySelector('.application-section');
		if (applicationSection) {
			applicationSection.innerHTML = `
				<div class="application-reviewing">
					<div class="reviewing-icon">⏳</div>
					<div class="reviewing-content">
						<h3>${this.t('dashboard.application.reviewing.title', '正在审核中')}</h3>
						<p>${this.t('dashboard.application.reviewing.message', '您的申请正在处理中，大约需要15秒...')}</p>
						<div class="progress-bar">
							<div class="progress-fill" id="review-progress"></div>
						</div>
						<p class="reviewing-details">
							${this.t('dashboard.application.reviewing.details', 'Issue #{issueNumber} 已创建<br>GitHub Actions 正在自动处理您的申请').replace('{issueNumber}', issueNumber)}
						</p>
					</div>
				</div>
			`;
		}

		// 开始进度条动画
		this.startProgressAnimation();
	}

	/**
	 * 开始进度条动画
	 */
	startProgressAnimation() {
		const progressFill = document.getElementById('review-progress');
		if (!progressFill) return;

		let progress = 0;
		const interval = setInterval(() => {
			progress += 2; // 每100ms增加2%，50秒完成
			progressFill.style.width = Math.min(progress, 100) + '%';

			if (progress >= 100) {
				clearInterval(interval);
			}
		}, 100);
	}

	/**
	 * 轮询工作流状态并自动接受邀请
	 */
	async pollAndAcceptInvitation(issueNumber) {
		try {
			const user = this.state.user;
			if (!user || !user.token) {
				throw new Error('用户未认证');
			}

			const repoInfo = this.getRepositoryInfo();
			if (!repoInfo) {
				throw new Error('仓库信息不可用');
			}

			console.log('开始轮询工作流状态...');

			// 等待15秒后开始轮询
			await new Promise(resolve => setTimeout(resolve, 15000));

			// 轮询工作流状态
			const workflowResult = await window.GitHubService.pollWorkflowStatus(
				repoInfo.owner,
				repoInfo.repo,
				issueNumber,
				user.token
			);

			if (workflowResult.success) {
				console.log('工作流执行成功，检查协作者状态...');

				// 等待几秒让邀请生效
				await new Promise(resolve => setTimeout(resolve, 5000));

				// 直接检查是否已经是协作者（因为访客可能没有权限查看邀请）
				const isCollaborator = await window.GitHubService.checkCollaboratorStatus(
					repoInfo.owner,
					repoInfo.repo,
					user.username,
					user.token
				);

				if (isCollaborator) {
					console.log('用户已成为协作者');

					// 更新用户状态为协作者
					this.updateUserToCollaborator();

					// 显示成功消息
					this.showSuccessStatus();

				} else {
					console.log('用户尚未成为协作者，可能邀请还在处理中');

					// 尝试接受协作者邀请（如果权限允许）
					try {
						const invitationResult = await window.GitHubService.acceptCollaboratorInvitation(
							repoInfo.owner,
							repoInfo.repo,
							user.token
						);

						if (invitationResult.success) {
							console.log('协作者邀请已接受');
							this.updateUserToCollaborator();
							this.showSuccessStatus();
						} else {
							this.showError('申请已提交，GitHub Actions已执行，但协作者状态尚未生效。请稍后刷新页面检查。');
						}
					} catch (invitationError) {
						console.log('无法自动接受邀请（权限不足），但工作流已执行成功');
						this.showError('申请已提交，GitHub Actions已执行成功。由于权限限制，无法自动接受邀请。请手动检查GitHub通知或稍后刷新页面。');
					}
				}
			} else {
				throw new Error(workflowResult.error || '工作流执行失败');
			}

		} catch (error) {
			console.error('轮询或接受邀请失败:', error);
			this.showError('申请处理失败：' + error.message);
		}
	}

	/**
	 * 更新用户状态为协作者
	 */
	updateUserToCollaborator() {
		// 更新组件状态
		this.setState({
			userRole: 'collaborator',
			applicationReason: ''
		});

		// 更新localStorage中的用户信息
		const userData = localStorage.getItem('spcp-user');
		if (userData) {
			const user = JSON.parse(userData);
			user.permissionInfo.role = 'collaborator';
			user.permissionInfo.hasPermission = true;
			localStorage.setItem('spcp-user', JSON.stringify(user));
		}

		// 更新全局状态
		if (window.app && window.app.state) {
			window.app.state.userRole = 'collaborator';
		}
	}

	/**
	 * 显示成功状态
	 */
	showSuccessStatus() {
		// 隐藏申请板块
		const applicationSection = this.element.querySelector('.application-section');
		if (applicationSection) {
			applicationSection.style.display = 'none';
		}

		// 显示成功消息
		this.showInfo('申请成功', '🎉 恭喜！您已成为项目协作者，现在可以访问项目页面了。');

		// 重新渲染页面以更新UI
		this.rerender();
	}

	/**
	 * 检查审核状态
	 */
	async checkReviewStatus() {
		// 显示加载状态
		this.showLoading();

		try {
			// 查询GitHub Issues来检查审核状态
			const reviewStatus = await this.checkGitHubReviewStatus();

			this.hideLoading();

			if (reviewStatus === 'approved') {
				// 审核通过，更新用户角色
				this.setState({
					userRole: 'contributor'
				});
				// 重新渲染页面
				this.render();
				this.mount(document.querySelector('.dashboard'));
				this.showInfo('审核结果', '恭喜！您的贡献者申请已通过审核，现在可以参与项目开发了。');
			} else if (reviewStatus === 'rejected') {
				// 审核被拒绝
				this.setState({
					userRole: 'visitor'
				});
				this.render();
				this.mount(document.querySelector('.dashboard'));
				this.showInfo('审核结果', '很抱歉，您的贡献者申请未被通过。您可以重新申请。');
			} else {
				// 仍在审核中
				this.showInfo('审核状态', '您的申请仍在审核中，请耐心等待。我们会及时通知您审核结果。');
			}
		} catch (error) {
			this.hideLoading();
			console.error('检查审核状态失败:', error);
			this.showError('检查审核状态失败：' + error.message);
		}
	}

	/**
	 * 查询GitHub审核状态
	 */
	async checkGitHubReviewStatus() {
		try {
			// 获取用户信息
			const user = this.state.user;
			if (!user || !user.token) {
				throw new Error('用户未认证');
			}

			// 获取仓库信息
			const repoInfo = this.getRepositoryInfo();
			if (!repoInfo) {
				throw new Error('仓库信息不可用');
			}

			// 使用认证的API调用查询Issues
			const issues = await this.getIssuesWithAuth(repoInfo.owner, repoInfo.repo, user.token, {
				labels: 'contribution-application',
				state: 'all',
				creator: user.username
			});

			if (!issues || issues.length === 0) {
				return 'pending'; // 没有找到申请，可能还在处理中
			}

			// 查找最新的申请
			const latestApplication = issues[0];

			// 检查Issue的状态和标签
			if (latestApplication.state === 'closed') {
				// 检查是否有approved标签
				const labels = latestApplication.labels || [];
				const hasApprovedLabel = labels.some(label =>
					label.name === 'approved' || label.name === 'contribution-approved'
				);
				const hasRejectedLabel = labels.some(label =>
					label.name === 'rejected' || label.name === 'contribution-rejected'
				);

				if (hasApprovedLabel) {
					return 'approved';
				} else if (hasRejectedLabel) {
					return 'rejected';
				} else {
					return 'pending'; // 已关闭但没有明确标签
				}
			} else {
				return 'pending'; // Issue仍然开放，审核中
			}

		} catch (error) {
			console.error('查询GitHub审核状态失败:', error);
			throw error;
		}
	}

	/**
	 * 使用认证查询GitHub Issues
	 */
	async getIssuesWithAuth(owner, repo, token, options = {}) {
		try {
			let url = `https://api.github.com/repos/${owner}/${repo}/issues`;
			const params = new URLSearchParams();

			// 添加查询参数
			if (options.state) params.append('state', options.state);
			if (options.labels) params.append('labels', options.labels);
			if (options.creator) params.append('creator', options.creator);
			if (options.sort) params.append('sort', options.sort);
			if (options.direction) params.append('direction', options.direction);
			if (options.per_page) params.append('per_page', options.per_page);

			if (params.toString()) {
				url += '?' + params.toString();
			}

			const response = await fetch(url, {
				headers: {
					'Authorization': `token ${token}`,
					'Accept': 'application/vnd.github.v3+json',
					'User-Agent': 'SPCP-Client'
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch issues: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error fetching issues with auth:', error);
			throw error;
		}
	}

	/**
	 * 获取仓库信息
	 */
	getRepositoryInfo() {
		// 从用户信息中获取仓库信息
		const userData = localStorage.getItem('spcp-user');
		if (userData) {
			const user = JSON.parse(userData);
			if (user.repositoryInfo) {
				return user.repositoryInfo;
			}
		}
	}

	/**
	 * 显示加载状态
	 */
	showLoading() {
		// 可以在这里添加加载指示器
		console.log('Loading...');
	}

	/**
	 * 隐藏加载状态
	 */
	hideLoading() {
		// 可以在这里隐藏加载指示器
		console.log('Loading complete');
	}

	/**
	 * 显示错误信息
	 */
	showError(message) {
		this.initModal();
		this.state.modal.showInfo('错误', message);
	}

	/**
	 * 显示信息
	 */
	showInfo(title, message) {
		this.initModal();
		this.state.modal.showInfo(title, message);
	}

	updateStats(stats) {
		this.setState({ stats: { ...this.state.stats, ...stats } });
		this.update();
	}

	updateActivities(activities) {
		this.setState({ activities });
		this.update();
	}

	updateUser(user) {
		this.setState({ user });
		// 如果用户信息包含新的头像，更新localStorage缓存
		if (user && user.avatarUrl) {
			const userData = localStorage.getItem('spcp-user');
			if (userData) {
				try {
					const cachedUser = JSON.parse(userData);
					cachedUser.avatarUrl = user.avatarUrl;
					localStorage.setItem('spcp-user', JSON.stringify(cachedUser));
				} catch (error) {
					console.error('更新用户头像缓存失败:', error);
				}
			}
		}
		this.update();
	}

	destroy() {
		// 清理模态框
		if (this.state.modal) {
			this.state.modal.destroy();
			this.state.modal = null;
		}

		// 清理事件监听器
		if (this.element) {
			this.element.remove();
		}
	}

	/**
	 * 清理用户头像缓存
	 */
	clearAvatarCache() {
		const userData = localStorage.getItem('spcp-user');
		if (userData) {
			try {
				const user = JSON.parse(userData);
				delete user.avatarUrl;
				localStorage.setItem('spcp-user', JSON.stringify(user));
			} catch (error) {
				console.error('清理头像缓存失败:', error);
			}
		}
	}
}

// 注册组件
window.DashboardPage = DashboardPage;
