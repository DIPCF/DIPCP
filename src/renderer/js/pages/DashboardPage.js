/**
 * 仪表盘页面组件
 * 完全组件化的仪表盘页面，提供用户信息展示、贡献申请、统计数据显示等功能
 * @class DashboardPage
 * @extends {BasePage}
 */
class DashboardPage extends BasePage {
	/**
	 * 构造函数
	 * @param {Object} props - 组件属性
	 */
	constructor(props = {}) {
		super(props);

		// 从 localStorage 获取用户信息
		const userInfo = window.app.getUserFromStorage();

		this.state = {
			user: userInfo.user,
			userRole: userInfo.userRole,
			permissionInfo: userInfo.permissionInfo,
			stats: {
				totalPoints: 150,
				myContributions: 5,
				pendingReviews: 2,
				approvedContributions: 3
			},
			activities: [
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
			applicationReason: '',
			// 模态框实例
			modal: null
		};
	}

	/**
	 * 渲染组件
	 * @returns {HTMLElement} 渲染后的DOM元素
	 */
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

	/**
	 * 渲染页面头部
	 * @returns {string} 头部HTML字符串
	 */
	renderHeader() {
		// 使用BasePage的renderHeader方法
		return super.renderHeader('dashboard', false, null);
	}

	/**
	 * 渲染欢迎区域
	 * @returns {string} 欢迎区域HTML字符串
	 */
	renderWelcome() {
		return `
            <div class="welcome">
                <h2>${this.t('dashboard.welcome', '欢迎使用 SPCP！')}</h2>
                <p>${this.t('dashboard.subtitle', '无服务器项目贡献平台')}</p>
            </div>
        `;
	}

	/**
	 * 渲染申请区域
	 * 根据用户角色显示不同的申请内容
	 * @returns {string} 申请区域HTML字符串
	 */
	renderApplicationSection() {
		// 只有访客用户显示申请区域
		if (this.state.userRole === 'visitor') {
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
		return '';
	}

	/**
	 * 初始化模态框
	 * @returns {void}
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

	/**
	 * 渲染统计网格
	 * @returns {string} 统计网格HTML字符串
	 */
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
	 * @returns {Object} 包含显示名称和CSS类名的角色信息对象
	 */
	getUserRoleInfo() {
		const role = this.state.userRole || 'visitor';

		const roleMap = {
			'owner': {
				displayName: this.t('dashboard.userRole.owner', '所有者'),
				className: 'role-owner'
			},
			'director': {
				displayName: this.t('dashboard.userRole.director', '理事'),
				className: 'role-director'
			},
			'reviewer': {
				displayName: this.t('dashboard.userRole.reviewer', '审核委员'),
				className: 'role-reviewer'
			},
			'maintainer': {
				displayName: this.t('dashboard.userRole.maintainer', '维护者'),
				className: 'role-maintainer'
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
	 * @returns {string} 用户头像URL或默认头像
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


	/**
	 * 渲染最近活动
	 * @returns {string} 最近活动HTML字符串
	 */
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

	/**
	 * 挂载组件到DOM
	 * @param {HTMLElement} container - 挂载容器
	 * @returns {void}
	 */
	mount(container) {
		super.mount(container);

		// 检查并更新用户角色（从 localStorage 读取最新状态）
		this.checkAndUpdateUserRole();

		// 绑定事件
		this.bindEvents();
	}

	/**
	 * 检查并更新用户角色
	 */
	checkAndUpdateUserRole() {
		const userInfo = window.app.getUserFromStorage();
		const user = userInfo.user;
		const currentRole = userInfo.userRole;
		const currentPermissionInfo = userInfo.permissionInfo;

		// 如果用户信息、角色或权限信息发生变化，更新状态
		if (this.state.user !== user || this.state.userRole !== currentRole || this.state.permissionInfo !== currentPermissionInfo) {
			this.setState({
				user: user,
				userRole: currentRole,
				permissionInfo: currentPermissionInfo
			});
			// 更新角色显示
			this.updateUserRoleDisplay();
		}
	}

	/**
	 * 绑定事件监听器
	 * @returns {void}
	 */
	bindEvents() {
		// 绑定Header组件的事件
		this.bindHeaderEvents();

		// 申请贡献按钮
		const applyBtn = this.element.querySelector('#apply-contribution-btn');
		if (applyBtn) {
			applyBtn.addEventListener('click', () => {
				this.handleApplicationSubmit(); // 直接提交申请，不需要理由
			});
		}

	}

	/**
	 * 显示正在审核状态
	 */
	showReviewingStatus() {
		// 更新申请板块显示正在审核状态
		const applicationSection = this.element.querySelector('.application-section');
		if (applicationSection) {
			applicationSection.innerHTML = `
				<div class="application-reviewing">
					<div class="reviewing-icon spinning">⏳</div>
					<div class="reviewing-content">
						<h3>${this.t('dashboard.application.reviewing.title', '正在审核中')}</h3>
						<p>${this.t('dashboard.application.reviewing.message', '您的申请正在处理中，大约需要15秒...')}</p>
					</div>
				</div>
			`;
		}
	}

	/**
	 * 处理申请提交
	 * @returns {Promise<void>}
	 */
	async handleApplicationSubmit() {
		try {
			// 1. 显示正在申请状态
			this.showReviewingStatus();

			// 2. 从localStorage获取用户信息
			const userData = localStorage.getItem('spcp-user');
			const user = JSON.parse(userData);

			// 3. 获取当前仓库信息
			const repoInfo = this.getRepositoryInfo();
			if (!repoInfo) {
				throw new Error(this.t('dashboard.errors.invalidRepositoryUrl', '无效的仓库地址'));
			}

			// 4. 检查用户是否已签署CLA，如果没有则先签署CLA
			if (!user.claSigned) {
				await this.showCLAAgreement(repoInfo, user, async () => {
					// CLA签署成功后的回调：继续申请流程
					await this.continueApplicationProcess(user, repoInfo);
				});
			} else {
				// 如果已签署CLA，直接继续申请流程
				await this.continueApplicationProcess(user, repoInfo);
			}

		} catch (error) {
			// 根据错误类型显示不同的消息
			if (error.message.includes('403')) {
				this.showError(this.t('dashboard.application.error.insufficientPermissions', '申请提交失败：权限不足。您的Token可能没有足够的权限在GitHub仓库中创建Issue。请检查Token权限设置。'));
			} else if (error.message.includes('401')) {
				this.showError(this.t('dashboard.application.error.authenticationFailed', '申请提交失败：认证失败。请检查您的GitHub Token是否有效。'));
			} else {
				this.showError(this.t('dashboard.application.error.general', '申请提交失败：{errorMessage}').replace('{errorMessage}', error.message));
			}
		}
	}

	/**
	 * 继续申请流程（CLA签署完成后）
	 * @param {Object} user - 用户信息
	 * @param {Object} repoInfo - 仓库信息
	 * @returns {Promise<void>}
	 */
	async continueApplicationProcess(user, repoInfo) {
		try {
			// 1. 同时申请成为仓库协作者和组织成员
			await this.applyMembership(user, 'collaborator', repoInfo);
			await this.applyMembership(user, 'member');

			// 2. 开始轮询工作流状态（检查仓库协作者权限）
			await this.pollCollaboratorInvitation(user, repoInfo);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * 成员申请成功回调
	 */
	onMembershipSuccess() {
		this.showCollaboratorSuccessStatus();
	}

	/**
	 * 更新用户角色显示
	 */
	updateUserRoleDisplay() {
		const roleElement = this.element.querySelector('.role-badge');
		if (roleElement) {
			// 根据当前角色更新显示
			const roleInfo = this.getUserRoleInfo();
			roleElement.textContent = roleInfo.displayName;
			roleElement.className = `stat-number role-badge ${roleInfo.className}`;
		}
	}

	/**
	 * 显示协作者成功状态
	 */
	showCollaboratorSuccessStatus() {
		// 更新用户状态为协作者
		this.updateUserToCollaborator();

		const applicationSection = this.element.querySelector('.application-section');
		if (applicationSection) {
			applicationSection.innerHTML = `
				<div class="application-success">
					<div class="success-content">
						<h3>✅${this.t('dashboard.application.success.title', '申请成功！')}</h3>
						<p>${this.t('dashboard.application.success.message', '恭喜！您已成为项目协作者，现在可以参与项目开发了。')}</p>
					</div>
				</div>
			`;
		}
	}

	/**
	 * 更新用户状态为协作者
	 */
	updateUserToCollaborator() {
		// 更新组件状态
		this.setState({
			userRole: 'collaborator'
		});

		// 更新localStorage中的用户信息
		const userData = localStorage.getItem('spcp-user');
		if (userData) {
			const user = JSON.parse(userData);
			user.permissionInfo = user.permissionInfo || {};
			user.permissionInfo.role = 'collaborator';
			localStorage.setItem('spcp-user', JSON.stringify(user));
		}
		this.updateUserRoleDisplay();
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

	/**
	 * 更新统计数据
	 * @param {Object} stats - 统计数据对象
	 * @returns {void}
	 */
	updateStats(stats) {
		this.setState({ stats: { ...this.state.stats, ...stats } });
		this.update();
	}

	/**
	 * 更新活动列表
	 * @param {Array} activities - 活动列表
	 * @returns {void}
	 */
	updateActivities(activities) {
		this.setState({ activities });
		this.update();
	}

	/**
	 * 更新用户信息
	 * @param {Object} user - 用户信息对象
	 * @returns {void}
	 */
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

	/**
	 * 销毁组件
	 * @returns {void}
	 */
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
	 * @returns {void}
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

/**
 * 注册组件到全局
 * @global
 */
window.DashboardPage = DashboardPage;
