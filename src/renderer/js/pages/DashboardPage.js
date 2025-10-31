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
					text: '您提交了一个新的文档：DIPCP 技术设计文档 v1.1',
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
				${this.renderUserRoles()}
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
                <h2>${this.t('dashboard.welcome', '欢迎使用 DIPCP！')}</h2>
                <p>${this.t('dashboard.subtitle', '去中心化IP协作平台')}</p>
            </div>
        `;
	}

	/**
	 * 渲染申请区域
	 * 根据用户角色显示不同的申请内容
	 * @returns {string} 申请区域HTML字符串
	 */
	renderApplicationSection() {
		// 检查是否是访客用户（没有实际角色）
		const userRoles = this.state.permissionInfo?.roles || (this.state.userRole ? [this.state.userRole] : ['visitor']);
		const actualRoles = userRoles.filter(role => role !== 'visitor');

		// 只有没有实际角色的用户才显示申请区域
		if (actualRoles.length === 0) {
			return `
				<div class="application-section">
					<div class="application-card">
						<div class="application-icon">🤝</div>
						<div class="application-content">
							<h3>${this.t('dashboard.application.title', '成为贡献者')}</h3>
							<p>${this.t('dashboard.application.description', '申请成为项目贡献者，参与内容创作和项目维护。')}</p>
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
	 * 渲染用户角色展示区域
	 * @returns {string} 用户角色展示区域HTML字符串
	 */
	renderUserRoles() {
		const userAvatar = this.getCachedUserAvatar();
		const userRoles = this.state.permissionInfo?.roles || (this.state.userRole ? [this.state.userRole] : ['visitor']);

		// 过滤掉visitor角色，只显示实际角色
		const actualRoles = userRoles.filter(role => role !== 'visitor');

		if (actualRoles.length === 0) {
			return ''; // 如果没有任何实际角色，不显示此区域
		}

		const roleBadges = actualRoles.map(role => {
			const roleInfo = this.getRoleInfo(role);
			return `<span class="role-badge ${roleInfo.className}">${roleInfo.displayName}</span>`;
		}).join('');

		return `
            <div class="user-roles-section">
                <div class="user-roles-card">
                    <div class="user-avatar">
                        <div class="stat-icon role-icon" style="background-image: url('${userAvatar}'); background-size: cover; background-position: center;">
                            ${userAvatar.startsWith('http') ? '' : userAvatar}
                        </div>
                    </div>
                    <div class="user-roles-content">
                        <h3>${this.state.user.username}</h3>
                        <div class="user-roles-badges">
                            ${roleBadges}
                        </div>
                    </div>
                </div>
            </div>
        `;
	}

	/**
	 * 渲染统计网格
	 * @returns {string} 统计网格HTML字符串
	 */
	renderStatsGrid() {
		return `
            <div class="stats-grid">
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
	 * 获取角色信息
	 * @param {string} role - 角色名称
	 * @returns {Object} 包含显示名称和CSS类名的角色信息对象
	 */
	getRoleInfo(role) {
		const roleMap = {
			'owner': {
				displayName: '💼' + this.t('dashboard.userRole.owner', '所有者'),
				className: 'role-owner'
			},
			'director': {
				displayName: '👑' + this.t('dashboard.userRole.director', '理事'),
				className: 'role-director'
			},
			'reviewer': {
				displayName: '✨' + this.t('dashboard.userRole.reviewer', '审核委员'),
				className: 'role-reviewer'
			},
			'maintainer': {
				displayName: '📝' + this.t('dashboard.userRole.maintainer', '维护者'),
				className: 'role-maintainer'
			},
			'collaborator': {
				displayName: '🖋' + this.t('dashboard.userRole.collaborator', '贡献者'),
				className: 'role-collaborator'
			},
			'visitor': {
				displayName: '👤' + this.t('dashboard.userRole.visitor', '访客'),
				className: 'role-visitor'
			}
		};

		return roleMap[role] || roleMap['visitor'];
	}

	/**
	 * 获取用户身份信息（向后兼容）
	 * @returns {Object} 包含显示名称和CSS类名的角色信息对象
	 */
	getUserRoleInfo() {
		const role = this.state.userRole || 'visitor';
		return this.getRoleInfo(role);
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
		const userData = localStorage.getItem('dipcp-user');
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
	 * 用于app.js调用的方法，检查并更新用户角色（外部调用）
	 */
	checkAndUpdateUserInfo() {
		this.checkAndUpdateUserRole();
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
		const user = this.state.user;
		const repoInfo = this.parseGitHubUrl(user.repositoryUrl);
		// 1. 显示正在申请·状态
		this.showReviewingStatus();
		await this.showCLAAgreement(repoInfo, user,
			async () => {
				console.log('✅ [CLA Callback] CLA签署成功，开始创建仓库...');
				try {
					// 2. 提交申请
					await this.applyContribution();
					// 3. 开始轮询工作流状态
					await this.pollCollaboratorInvitation();
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
			},
			async () => {
				console.log('❌ [CLA Callback] 用户拒绝了CLA协议');
				// 拒绝时重新显示申请区域
				const applicationSection = this.element.querySelector('.application-section');
				if (applicationSection) {
					applicationSection.innerHTML = this.renderApplicationSection();
					// 重新绑定申请按钮事件
					const applyBtn = this.element.querySelector('#apply-contribution-btn');
					if (applyBtn) {
						applyBtn.addEventListener('click', () => {
							this.handleApplicationSubmit();
						});
					}
				}
			}
		);
	}

	/**
	 * 申请贡献
	 */
	async applyContribution() {
		try {
			const user = this.state.user;

			// 解析仓库信息
			let repoInfo;
			if (user.repositoryUrl) {
				repoInfo = this.parseGitHubUrl(user.repositoryUrl);
			} else if (user.repositoryInfo) {
				repoInfo = user.repositoryInfo;
			}

			if (!repoInfo) {
				throw new Error(this.t('dashboard.errors.invalidRepositoryUrl', '无效的仓库地址'));
			}

			// 调用createContributionApplication方法
			const application = await this.createContributionApplication(
				repoInfo.owner,
				repoInfo.repo,
				user.username,
				user.email,
				user.token
			);

			return application;
		} catch (error) {
			console.error('Error creating contribution application:', error);
			throw error;
		}
	}

	/**
	 * 创建贡献申请
	 */
	async createContributionApplication(owner, repo, username, email, token) {
		try {
			const octokit = new window.Octokit({ auth: token });

			// 创建issue作为贡献申请
			const issueTitle = `Become a collaborator - ${username}`;

			// 创建issue
			const { data } = await octokit.rest.issues.create({
				owner, repo,
				title: issueTitle,
				body: ''
			});
			const issue = data;

			return {
				success: true,
				applicationId: issue.id,
				issueNumber: issue.number,
				issueUrl: issue.html_url
			};
		} catch (error) {
			console.error('创建贡献申请失败:', error);
			return {
				success: false,
				error: error.message
			};
		}
	}

	/**
	 * 轮询协作者邀请
	 */
	async pollCollaboratorInvitation() {
		const user = this.state.user;

		const octokit = new window.Octokit({ auth: user.token });
		const maxAttempts = 60; // 最多轮询60次，每次间隔5秒，总共5分钟
		let attempts = 0;
		const headers = {
			'X-GitHub-Api-Version': '2022-11-28'
		}

		let acceptResult;
		let firstAccept = false;

		while (attempts < maxAttempts) {
			try {
				attempts++;
				console.log(`第 ${attempts} 次检查协作者邀请...`);

				// 使用 octokit.request 获取特定仓库的邀请列表
				const response = await octokit.request('GET /user/repository_invitations', {
					headers: headers
				});
				const invitations = response.data;

				// 由于查询时已经限定了特定仓库，直接获取最新的邀请
				const repoInvitation = invitations && invitations.length > 0 ? invitations[invitations.length - 1] : null;

				if (repoInvitation) {
					// 接受邀请 
					console.log(`正在接受邀请 ID: ${repoInvitation.id}`);

					try {
						// 使用官方推荐的 octokit.request 方法
						acceptResult = await octokit.request('PATCH /user/repository_invitations/{invitation_id}', {
							invitation_id: repoInvitation.id,
							headers: headers
						});
						if (acceptResult.status === 204) {
							console.log('接受邀请成功，状态码:', acceptResult.status);
							await this.pollUserPermissions();
							return;
							//之前的处理流程有BUG需要提交两次，后来莫名其妙好了，所以代码暂时保留
							if (!firstAccept) {
								firstAccept = true;
								await new Promise(resolve => setTimeout(resolve, 60000));
								await this.applyContribution();
							} else {
								// 开始轮询检查用户权限
								await this.pollUserPermissions();
								return;
							}
						}
					} catch (acceptError) {
						console.log('接受邀请失败:', acceptError.message);
						throw acceptError;
					}
				} else {
					console.log('暂无协作者邀请，继续等待...');
				}

				// 等待5秒后再次检查（除了最后一次）
				if (attempts < maxAttempts) {
					console.log('等待5秒后再次检查...');
					await new Promise(resolve => setTimeout(resolve, 5000));
				}

			} catch (error) {
				console.error('轮询协作者邀请时出错:', error);
			}
		}
	}

	/**
	 * 轮询检查用户权限
	 */
	async pollUserPermissions() {
		const user = this.state.user;
		const repoInfo = this.getRepositoryInfo();

		const octokit = new window.Octokit({ auth: user.token });
		const maxAttempts = 30; // 最多轮询30次，每次间隔1秒，总共30秒
		let attempts = 0;

		console.log('开始轮询检查用户权限...');

		while (attempts < maxAttempts) {
			try {
				attempts++;

				// 检查用户是否已经是协作者且有写入权限
				const repoResult = await octokit.rest.repos.get({
					owner: repoInfo.owner,
					repo: repoInfo.repo
				});

				const permissions = repoResult.data.permissions;
				console.log('用户权限:', permissions);

				if (permissions && permissions.push) {
					// 权限确认后，同步仓库数据以获取最新的 collaborators.txt
					console.log('权限已确认，开始同步仓库数据...');
					try {
						if (window.StorageService) {
							await window.StorageService.syncRepositoryData(
								repoInfo.owner,
								repoInfo.repo,
								user.token
							);
							console.log('仓库数据同步完成');
						}
					} catch (syncError) {
						console.warn('同步仓库数据失败:', syncError);
						// 即使同步失败，也继续显示成功状态
					}
					this.showCollaboratorSuccessStatus();
					return;
				}

				// 等待1秒后再次检查（除了最后一次）
				if (attempts < maxAttempts) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}

			} catch (error) {
				console.log('检查权限时出错:', error.message);
				// 继续轮询，不中断
			}
		}
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
			userRole: 'collaborator',
			permissionInfo: {
				roles: ['collaborator'],
				hasPermission: true
			}
		});

		// 更新localStorage中的用户信息
		const userData = localStorage.getItem('dipcp-user');
		if (userData) {
			const user = JSON.parse(userData);
			user.permissionInfo = {
				roles: ['collaborator'],
				hasPermission: true
			};
			localStorage.setItem('dipcp-user', JSON.stringify(user));
		}

		// 更新app.js的状态
		if (window.app) {
			window.app.state.userRole = 'collaborator';
			window.app.state.userRoles = ['collaborator'];
			window.app.state.permissionInfo = {
				roles: ['collaborator'],
				hasPermission: true
			};
		}

		this.updateUserRoleDisplay();
	}

	/**
	 * 获取仓库信息
	 */
	getRepositoryInfo() {
		// 从用户信息中获取仓库信息
		const userData = localStorage.getItem('dipcp-user');
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
			const userData = localStorage.getItem('dipcp-user');
			if (userData) {
				try {
					const cachedUser = JSON.parse(userData);
					cachedUser.avatarUrl = user.avatarUrl;
					localStorage.setItem('dipcp-user', JSON.stringify(cachedUser));
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
		const userData = localStorage.getItem('dipcp-user');
		if (userData) {
			try {
				const user = JSON.parse(userData);
				delete user.avatarUrl;
				localStorage.setItem('dipcp-user', JSON.stringify(user));
			} catch (error) {
				console.error('清理头像缓存失败:', error);
			}
		}
	}

	/**
	 * 解析GitHub URL
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
}

/**
 * 注册组件到全局
 * @global
 */
window.DashboardPage = DashboardPage;
