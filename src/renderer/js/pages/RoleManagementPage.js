/**
 * 项目权限设置页面组件
 * 完全组件化的权限管理页面，提供分支保护规则、代码所有者配置、团队权限分配等功能
 * @class RoleManagementPage
 * @extends {BasePage}
 */
class RoleManagementPage extends BasePage {
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
			// 代码所有者配置状态
			codeOwners: {
				global: [],
				rules: []
			},
			// 团队权限分配状态（从GitHub获取）
			teamPermissions: [],
			// 可用团队列表（用于添加团队时的选择）
			availableTeams: [],
			// 模态框状态
			showAddTeamModal: false,
			// 设置状态
			settingsStatus: 'saved', // 'saved', 'unsaved', 'error', 'loading'
			// 模态框实例
			modal: null,
			// 加载状态
			loading: true
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
				${this.renderPageHeader()}
				${this.renderCodeOwners()}
				${this.renderTeamPermissions()}
				${this.renderActionButtons()}
			</div>
			${this.renderModals()}
		`;
		return container;
	}

	/**
	 * 渲染页面头部
	 * @returns {string} 头部HTML字符串
	 */
	renderHeader() {
		// 使用BasePage的renderHeader方法
		return super.renderHeader('role-management', false, null);
	}

	/**
	 * 渲染页面标题和操作按钮
	 * @returns {string} 页面头部HTML字符串
	 */
	renderPageHeader() {
		return `
			<div class="page-header">
				<h1>${this.t('roleManagement.title', '项目权限设置')}</h1>
			</div>
		`;
	}

	/**
	 * 渲染代码所有者配置模块
	 * @returns {string} 代码所有者配置HTML字符串
	 */
	renderCodeOwners() {
		return `
			<div class="module-section">
				<h2>${this.t('roleManagement.codeOwners.title', '代码所有者配置 (CODEOWNERS)')}</h2>
				<div class="module-content">
					<div class="form-group">
						<label>${this.t('roleManagement.codeOwners.globalOwners', '全局所有者')}:</label>
						<div class="owner-input-group">
							${this.state.codeOwners.global.map(owner => `
								<span class="owner-tag">${owner} <button class="remove-owner" data-owner="${owner}">×</button></span>
							`).join('')}
							<input type="text" id="newGlobalOwnerInput" placeholder="@username">
							<button class="btn btn-sm" id="addGlobalOwnerBtn">${this.t('common.add', '添加')}</button>
						</div>
					</div>

					<div class="rules-section">
						<h3>${this.t('roleManagement.codeOwners.specificRules', '特定文件/目录规则')}:</h3>
						<div class="rules-table">
							<div class="rules-header">
								<div class="rule-path">${this.t('roleManagement.codeOwners.pathPattern', '路径模式')}</div>
								<div class="rule-owners">${this.t('roleManagement.codeOwners.owners', '所有者')}</div>
								<div class="rule-actions">${this.t('common.actions', '操作')}</div>
							</div>
							${this.state.codeOwners.rules.map((rule, index) => `
								<div class="rule-row" data-index="${index}">
									<div class="rule-path">
										<input type="text" value="${rule.path}" class="rule-path-input">
									</div>
									<div class="rule-owners">
										${rule.owners.map(owner => `
											<span class="owner-tag">${owner} <button class="remove-rule-owner" data-owner="${owner}" data-rule-index="${index}">×</button></span>
										`).join('')}
										<input type="text" class="rule-owner-input" placeholder="@username">
									</div>
									<div class="rule-actions">
										<button class="btn btn-sm btn-danger" onclick="this.removeRule(${index})">${this.t('common.remove', '移除')}</button>
									</div>
								</div>
							`).join('')}
							<div class="add-rule-row">
								<button class="btn btn-sm" id="addRuleBtn">+ ${this.t('roleManagement.codeOwners.addRule', '添加规则')}</button>
							</div>
						</div>
					</div>

					<div class="preview-section">
						<h3>${this.t('roleManagement.codeOwners.previewFile', '预览 CODEOWNERS 文件')}:</h3>
						<pre class="codeowners-preview" id="codeownersPreview">${this.generateCodeOwnersPreview()}</pre>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * 渲染团队权限分配模块
	 * @returns {string} 团队权限分配HTML字符串
	 */
	renderTeamPermissions() {
		return `
			<div class="module-section">
				<h2>${this.t('roleManagement.teamPermissions.title', '团队权限分配')}</h2>
				<div class="module-content">
					<div class="teams-table">
						<div class="teams-header">
							<div class="team-name">${this.t('roleManagement.teamPermissions.teamName', '团队名称')}</div>
							<div class="team-permission">${this.t('roleManagement.teamPermissions.permissionLevel', '权限级别')}</div>
							<div class="team-actions">${this.t('common.actions', '操作')}</div>
						</div>
						${this.state.teamPermissions.length === 0 ? `
							<div class="empty-team-message">${this.state.loading ? this.t('common.loading', '载入中...') : this.t('roleManagement.teamPermissions.noTeams', '暂无团队')}</div>
						` : this.state.teamPermissions.map(team => `
							<div class="team-row" data-team-id="${team.id}">
								<div class="team-name">${team.name}</div>
								<div class="team-permission">
									<select class="permission-select" data-team-id="${team.id}" data-team-slug="${team.slug}">
										<option value="pull" ${team.permission === 'pull' ? 'selected' : ''}>${this.t('roleManagement.teamPermissions.read', 'Read')}</option>
										<option value="triage" ${team.permission === 'triage' ? 'selected' : ''}>${this.t('roleManagement.teamPermissions.triage', 'Triage')}</option>
										<option value="push" ${team.permission === 'push' ? 'selected' : ''}>${this.t('roleManagement.teamPermissions.write', 'Write')}</option>
										<option value="maintain" ${team.permission === 'maintain' ? 'selected' : ''}>${this.t('roleManagement.teamPermissions.maintain', 'Maintain')}</option>
										<option value="admin" ${team.permission === 'admin' ? 'selected' : ''}>${this.t('roleManagement.teamPermissions.admin', 'Admin')}</option>
									</select>
								</div>
								<div class="team-actions">
									<button class="btn btn-sm btn-danger" onclick="this.removeTeam(${team.id})">${this.t('common.remove', '移除')}</button>
								</div>
							</div>
						`).join('')}
					</div>

					<div class="add-team-section">
						<button class="btn btn-primary" id="addTeamBtn">+ ${this.t('roleManagement.teamPermissions.addTeam', '添加团队')}</button>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * 渲染操作按钮
	 * @returns {string} 操作按钮HTML字符串
	 */
	renderActionButtons() {
		return `
			<div class="action-buttons">
				<button class="btn btn-primary" id="saveSettingsBtn">${this.t('common.save', '保存设置')}</button>
			</div>
		`;
	}

	/**
	 * 渲染模态框
	 * @returns {string} 模态框HTML字符串
	 */
	renderModals() {
		return `
			<div class="modal" id="addTeamModal" style="display: none;">
				<div class="modal-content">
					<div class="modal-header">
						<h3>${this.t('roleManagement.modals.addTeam.title', '添加团队权限')}</h3>
						<button class="btn-close" id="closeAddTeamModal">×</button>
					</div>
					<div class="modal-body">
						<div class="form-group">
							<label>${this.t('roleManagement.modals.addTeam.selectTeam', '选择团队')}:</label>
							<select id="teamSelect">
								${this.state.availableTeams.filter(team =>
			!this.state.teamPermissions.find(tp => tp.id === team.id)
		).map(team => `
									<option value="${team.id}" data-slug="${team.slug}" data-name="${team.name}">${team.name}${team.description ? ' - ' + team.description : ''}</option>
								`).join('')}
							</select>
						</div>
						<div class="form-group">
							<label>${this.t('roleManagement.modals.addTeam.permissionLevel', '权限级别')}:</label>
							<select id="permissionSelect">
								<option value="pull">${this.t('roleManagement.modals.addTeam.read', 'Read')}</option>
								<option value="triage">${this.t('roleManagement.modals.addTeam.triage', 'Triage')}</option>
								<option value="push">${this.t('roleManagement.modals.addTeam.write', 'Write')}</option>
								<option value="maintain">${this.t('roleManagement.modals.addTeam.maintain', 'Maintain')}</option>
								<option value="admin">${this.t('roleManagement.modals.addTeam.admin', 'Admin')}</option>
							</select>
						</div>
						<div class="permission-description">
							<h4>${this.t('roleManagement.modals.addTeam.permissionDescription', '权限说明')}:</h4>
							<ul>
								<li><strong>Read:</strong> ${this.t('roleManagement.modals.addTeam.readDesc', '只能查看代码，不能修改')}</li>
								<li><strong>Triage:</strong> ${this.t('roleManagement.modals.addTeam.triageDesc', '可以管理Issues和PRs，但不能推送代码')}</li>
								<li><strong>Write:</strong> ${this.t('roleManagement.modals.addTeam.writeDesc', '可以推送代码，创建分支，管理Issues和PRs')}</li>
								<li><strong>Maintain:</strong> ${this.t('roleManagement.modals.addTeam.maintainDesc', '可以管理仓库，但不能修改敏感设置')}</li>
								<li><strong>Admin:</strong> ${this.t('roleManagement.modals.addTeam.adminDesc', '拥有完全管理权限，可以修改仓库设置')}</li>
							</ul>
						</div>
					</div>
					<div class="modal-footer">
						<button class="btn btn-secondary" id="cancelAddTeamBtn">${this.t('common.cancel', '取消')}</button>
						<button class="btn btn-primary" id="confirmAddTeamBtn">${this.t('roleManagement.modals.addTeam.addTeam', '添加团队')}</button>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * 生成CODEOWNERS文件预览
	 * @returns {string} CODEOWNERS文件内容
	 */
	generateCodeOwnersPreview() {
		let content = '# 全局代码所有者\n';
		content += '* ' + this.state.codeOwners.global.join(' ') + '\n\n';
		content += '# 特定文件/目录\n';
		this.state.codeOwners.rules.forEach(rule => {
			content += rule.path + ' ' + rule.owners.join(' ') + '\n';
		});
		return content;
	}

	/**
	 * 从GitHub加载团队列表
	 * @returns {Promise<void>}
	 */
	async loadTeams() {
		try {
			// 获取GitHub token和仓库信息
			const userInfo = window.app.getUserFromStorage();
			if (!userInfo || !userInfo.user || !userInfo.user.token) {
				console.error('未找到GitHub token');
				this.setState({ loading: false });
				return;
			}

			// 从用户数据中获取仓库信息
			const repositoryInfo = userInfo.user.repositoryInfo;
			if (!repositoryInfo || !repositoryInfo.owner || !repositoryInfo.repo) {
				console.error('未找到仓库信息');
				this.setState({ loading: false });
				return;
			}

			// 创建Octokit实例
			const octokit = new window.Octokit({
				auth: userInfo.user.token
			});

			const owner = repositoryInfo.owner;
			const repo = repositoryInfo.repo;

			console.log('正在加载团队列表，仓库:', `${owner}/${repo}`);

			// 获取仓库的所有团队
			const { data: teams } = await octokit.rest.repos.listTeams({
				owner,
				repo
			});

			console.log('仓库团队数量:', teams.length);

			// 转换团队数据格式
			const teamPermissions = teams.map(team => ({
				id: team.id.toString(),
				name: team.name,
				slug: team.slug,
				permission: team.permission || 'pull', // GitHub返回的权限级别
				description: team.description || ''
			}));

			// 获取组织下的所有团队（用于添加团队时的选择）
			let availableTeams = [];
			try {
				console.log('正在获取组织团队列表，组织:', owner);

				// 首先检查是否为组织仓库
				const { data: orgInfo } = await octokit.rest.orgs.get({
					org: owner
				});

				if (orgInfo && orgInfo.type === 'Organization') {
					// 使用正确的API调用格式获取组织团队
					const { data: orgTeams } = await octokit.rest.teams.listInOrg({
						org: owner
					});

					console.log('组织团队数量:', orgTeams.length);

					availableTeams = orgTeams.map(team => ({
						id: team.id.toString(),
						name: team.name,
						slug: team.slug,
						description: team.description || ''
					}));
				} else {
					console.log('这是个人仓库，无法获取组织团队');
					availableTeams = teamPermissions;
				}
			} catch (error) {
				console.log('错误详情:', {
					status: error.status,
					message: error.message,
					response: error.response?.data
				});

				// 如果是404错误，说明可能是个人仓库
				if (error.status === 404) {
					console.log('可能是个人仓库，使用仓库团队列表');
					availableTeams = teamPermissions;
				} else {
					// 其他错误，也使用仓库团队列表作为备选
					availableTeams = teamPermissions;
				}
			}

			// 更新状态
			this.setState({
				teamPermissions,
				availableTeams,
				loading: false
			});

			// 更新UI
			this.update();

			console.log('已加载团队列表:', {
				仓库团队: teamPermissions.length,
				可用团队: availableTeams.length
			});
		} catch (error) {
			console.error('加载团队列表失败:', error);
			console.log('错误详情:', {
				status: error.status,
				message: error.message,
				response: error.response?.data
			});
			this.setState({ loading: false });
		}
	}

	/**
	 * 从GitHub加载CODEOWNERS文件
	 * @returns {Promise<void>}
	 */
	async loadCodeOwners() {
		try {
			// 获取GitHub token和仓库信息
			const userInfo = window.app.getUserFromStorage();
			if (!userInfo || !userInfo.user || !userInfo.user.token) {
				console.error('未找到GitHub token');
				return;
			}

			// 从用户数据中获取仓库信息
			const repositoryInfo = userInfo.user.repositoryInfo;
			if (!repositoryInfo || !repositoryInfo.owner || !repositoryInfo.repo) {
				console.error('未找到仓库信息');
				return;
			}

			// 创建Octokit实例
			const octokit = new window.Octokit({
				auth: userInfo.user.token
			});

			const owner = repositoryInfo.owner;
			const repo = repositoryInfo.repo;

			// 获取CODEOWNERS文件内容
			// CODEOWNERS文件可能位于仓库根目录或.github目录下
			const codeownersPaths = [
				'CODEOWNERS',
				'.github/CODEOWNERS'
			];

			let codeownersContent = null;

			for (const path of codeownersPaths) {
				try {
					const response = await octokit.repos.getContent({
						owner,
						repo,
						path
					});

					if (response.data.type === 'file') {
						codeownersContent = atob(response.data.content);
						break;
					}
				} catch (error) {
					// 文件不存在，继续尝试下一个路径
					if (error.status === 404) {
						continue;
					}
					throw error;
				}
			}

			if (!codeownersContent) {
				console.log('未找到CODEOWNERS文件');
				return;
			}

			// 解析CODEOWNERS文件内容
			const lines = codeownersContent.split('\n');
			const globalOwners = [];
			const rules = [];

			for (const line of lines) {
				// 跳过注释和空行
				const trimmedLine = line.trim();
				if (!trimmedLine || trimmedLine.startsWith('#')) {
					continue;
				}

				// 解析全局所有者（以*开头的行）
				if (trimmedLine.startsWith('* ')) {
					const owners = trimmedLine.substring(2).split(/\s+/).filter(o => o);
					globalOwners.push(...owners);
				} else {
					// 解析特定规则
					const parts = trimmedLine.split(/\s+/);
					if (parts.length >= 2) {
						const path = parts[0];
						const owners = parts.slice(1).filter(o => o);
						if (path && owners.length > 0) {
							rules.push({ path, owners });
						}
					}
				}
			}

			// 更新状态
			this.setState({
				codeOwners: {
					global: globalOwners.length > 0 ? globalOwners : this.state.codeOwners.global,
					rules: rules.length > 0 ? rules : this.state.codeOwners.rules
				}
			});

			// 更新UI
			this.update();

			console.log('已加载CODEOWNERS文件，全局所有者:', globalOwners);
		} catch (error) {
			console.error('加载CODEOWNERS文件失败:', error);
		}
	}

	/**
	 * 挂载组件到DOM
	 * @param {HTMLElement} container - 挂载容器
	 * @returns {void}
	 */
	mount(container) {
		super.mount(container);

		// 绑定事件
		this.bindEvents();

		// 加载团队列表
		this.loadTeams();

		// 加载CODEOWNERS文件
		this.loadCodeOwners();
	}

	/**
	 * 绑定事件监听器
	 * @returns {void}
	 */
	bindEvents() {
		// 绑定Header组件的事件
		this.bindHeaderEvents();

		// 代码所有者配置事件
		this.bindCodeOwnersEvents();

		// 团队权限分配事件
		this.bindTeamPermissionsEvents();

		// 操作按钮事件
		this.bindActionButtonEvents();

		// 模态框事件
		this.bindModalEvents();
	}

	/**
	 * 绑定代码所有者配置事件
	 * @returns {void}
	 */
	bindCodeOwnersEvents() {
		// 添加全局所有者
		const addGlobalOwnerBtn = this.element.querySelector('#addGlobalOwnerBtn');
		const newGlobalOwnerInput = this.element.querySelector('#newGlobalOwnerInput');
		if (addGlobalOwnerBtn && newGlobalOwnerInput) {
			addGlobalOwnerBtn.addEventListener('click', () => {
				const owner = newGlobalOwnerInput.value.trim();
				if (owner && !this.state.codeOwners.global.includes(owner)) {
					this.addGlobalOwner(owner);
					newGlobalOwnerInput.value = '';
				}
			});
		}

		// 移除全局所有者
		this.element.addEventListener('click', (e) => {
			if (e.target.classList.contains('remove-owner')) {
				const owner = e.target.dataset.owner;
				this.removeGlobalOwner(owner);
			}
		});

		// 添加规则
		const addRuleBtn = this.element.querySelector('#addRuleBtn');
		if (addRuleBtn) {
			addRuleBtn.addEventListener('click', () => {
				this.addCodeOwnerRule();
			});
		}

		// 移除规则所有者
		this.element.addEventListener('click', (e) => {
			if (e.target.classList.contains('remove-rule-owner')) {
				const owner = e.target.dataset.owner;
				const ruleIndex = parseInt(e.target.dataset.ruleIndex);
				this.removeRuleOwner(ruleIndex, owner);
			}
		});

		// 移除规则
		this.element.addEventListener('click', (e) => {
			if (e.target.classList.contains('remove-rule')) {
				const ruleIndex = parseInt(e.target.closest('.rule-row').dataset.index);
				this.removeCodeOwnerRule(ruleIndex);
			}
		});

		// 更新规则路径和所有者（实时更新预览）
		this.element.addEventListener('input', (e) => {
			if (e.target.classList.contains('rule-path-input') || e.target.classList.contains('rule-owner-input')) {
				this.updateCodeOwnersPreview();
			}
		});
	}

	/**
	 * 绑定团队权限分配事件
	 * @returns {void}
	 */
	bindTeamPermissionsEvents() {
		// 添加团队按钮
		const addTeamBtn = this.element.querySelector('#addTeamBtn');
		if (addTeamBtn) {
			addTeamBtn.addEventListener('click', () => {
				this.showAddTeamModal();
			});
		}

		// 权限选择器变化
		this.element.addEventListener('change', (e) => {
			if (e.target.classList.contains('permission-select')) {
				const teamId = e.target.dataset.teamId;
				const permission = e.target.value;
				this.updateTeamPermission(teamId, permission);
			}
		});
	}

	/**
	 * 绑定操作按钮事件
	 * @returns {void}
	 */
	bindActionButtonEvents() {
		// 保存设置
		const saveSettingsBtn = this.element.querySelector('#saveSettingsBtn');
		if (saveSettingsBtn) {
			saveSettingsBtn.addEventListener('click', () => {
				this.handleSaveSettings();
			});
		}
	}

	/**
	 * 绑定模态框事件
	 * @returns {void}
	 */
	bindModalEvents() {
		// 添加团队模态框
		const addTeamModal = this.element.querySelector('#addTeamModal');
		const closeAddTeamModal = this.element.querySelector('#closeAddTeamModal');
		const cancelAddTeamBtn = this.element.querySelector('#cancelAddTeamBtn');
		const confirmAddTeamBtn = this.element.querySelector('#confirmAddTeamBtn');

		if (closeAddTeamModal) {
			closeAddTeamModal.addEventListener('click', () => {
				this.hideAddTeamModal();
			});
		}

		if (cancelAddTeamBtn) {
			cancelAddTeamBtn.addEventListener('click', () => {
				this.hideAddTeamModal();
			});
		}

		if (confirmAddTeamBtn) {
			confirmAddTeamBtn.addEventListener('click', () => {
				this.handleConfirmAddTeam();
			});
		}

		// 点击模态框外部关闭
		if (addTeamModal) {
			addTeamModal.addEventListener('click', (e) => {
				if (e.target === addTeamModal) {
					this.hideAddTeamModal();
				}
			});
		}
	}

	/**
	 * 添加全局所有者
	 * @param {string} owner - 所有者名称
	 * @returns {void}
	 */
	addGlobalOwner(owner) {
		const newGlobal = [...this.state.codeOwners.global, owner];
		this.setState({
			codeOwners: {
				...this.state.codeOwners,
				global: newGlobal
			},
			settingsStatus: 'unsaved'
		});
		this.updateCodeOwnersPreview();
	}

	/**
	 * 移除全局所有者
	 * @param {string} owner - 所有者名称
	 * @returns {void}
	 */
	removeGlobalOwner(owner) {
		const newGlobal = this.state.codeOwners.global.filter(o => o !== owner);
		this.setState({
			codeOwners: {
				...this.state.codeOwners,
				global: newGlobal
			},
			settingsStatus: 'unsaved'
		});
		this.updateCodeOwnersPreview();
	}

	/**
	 * 添加代码所有者规则
	 * @returns {void}
	 */
	addCodeOwnerRule() {
		const newRule = { path: '', owners: [] };
		const newRules = [...this.state.codeOwners.rules, newRule];
		this.setState({
			codeOwners: {
				...this.state.codeOwners,
				rules: newRules
			},
			settingsStatus: 'unsaved'
		});
		this.update();
	}

	/**
	 * 移除代码所有者规则
	 * @param {number} ruleIndex - 规则索引
	 * @returns {void}
	 */
	removeCodeOwnerRule(ruleIndex) {
		const newRules = this.state.codeOwners.rules.filter((_, index) => index !== ruleIndex);
		this.setState({
			codeOwners: {
				...this.state.codeOwners,
				rules: newRules
			},
			settingsStatus: 'unsaved'
		});
		this.updateCodeOwnersPreview();
	}

	/**
	 * 移除规则所有者
	 * @param {number} ruleIndex - 规则索引
	 * @param {string} owner - 所有者名称
	 * @returns {void}
	 */
	removeRuleOwner(ruleIndex, owner) {
		const rules = [...this.state.codeOwners.rules];
		rules[ruleIndex].owners = rules[ruleIndex].owners.filter(o => o !== owner);
		this.setState({
			codeOwners: {
				...this.state.codeOwners,
				rules: rules
			},
			settingsStatus: 'unsaved'
		});
		this.updateCodeOwnersPreview();
	}

	/**
	 * 更新代码所有者预览
	 * @returns {void}
	 */
	updateCodeOwnersPreview() {
		const preview = this.element.querySelector('#codeownersPreview');
		if (preview) {
			preview.textContent = this.generateCodeOwnersPreview();
		}
		this.setState({ settingsStatus: 'unsaved' });
	}

	/**
	 * 显示添加团队模态框
	 * @returns {void}
	 */
	showAddTeamModal() {
		const modal = this.element.querySelector('#addTeamModal');
		if (modal) {
			modal.style.display = 'flex';
		}
	}

	/**
	 * 隐藏添加团队模态框
	 * @returns {void}
	 */
	hideAddTeamModal() {
		const modal = this.element.querySelector('#addTeamModal');
		if (modal) {
			modal.style.display = 'none';
		}
	}

	/**
	 * 处理确认添加团队
	 * @returns {Promise<void>}
	 */
	async handleConfirmAddTeam() {
		const teamSelect = this.element.querySelector('#teamSelect');
		const permissionSelect = this.element.querySelector('#permissionSelect');

		if (!teamSelect.value) {
			alert(this.t('roleManagement.errors.selectTeam', '请选择团队'));
			return;
		}

		const teamId = teamSelect.value;
		const teamSlug = teamSelect.options[teamSelect.selectedIndex].dataset.slug;
		const teamName = teamSelect.options[teamSelect.selectedIndex].dataset.name;
		const permission = permissionSelect.value;

		// 调用GitHub API添加团队到仓库
		try {
			const userInfo = window.app.getUserFromStorage();
			if (!userInfo || !userInfo.user || !userInfo.user.token) {
				throw new Error('未找到GitHub token');
			}

			const repositoryInfo = userInfo.user.repositoryInfo;
			const octokit = new window.Octokit({ auth: userInfo.user.token });
			const owner = repositoryInfo.owner;
			const repo = repositoryInfo.repo;

			// 使用slug添加团队
			await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
				org: owner,
				team_slug: teamSlug,
				owner,
				repo,
				permission: permission
			});

			// 更新本地状态
			const newTeam = {
				id: teamId,
				name: teamName,
				slug: teamSlug,
				permission: permission,
				description: ''
			};

			this.setState({
				teamPermissions: [...this.state.teamPermissions, newTeam],
				settingsStatus: 'unsaved'
			});
			this.hideAddTeamModal();
			this.update();
		} catch (error) {
			console.error('添加团队失败:', error);
			alert(this.t('roleManagement.errors.addTeamFailed', '添加团队失败：{error}').replace('{error}', error.message));
		}
	}

	/**
	 * 更新团队权限
	 * @param {string} teamId - 团队ID
	 * @param {string} permission - 权限级别
	 * @returns {Promise<void>}
	 */
	async updateTeamPermission(teamId, permission) {
		// 找到要更新的团队
		const team = this.state.teamPermissions.find(t => t.id === teamId);
		if (!team) {
			console.error('未找到要更新的团队');
			return;
		}

		// 调用GitHub API更新团队权限
		try {
			const userInfo = window.app.getUserFromStorage();
			if (!userInfo || !userInfo.user || !userInfo.user.token) {
				throw new Error('未找到GitHub token');
			}

			const repositoryInfo = userInfo.user.repositoryInfo;
			const octokit = new window.Octokit({ auth: userInfo.user.token });
			const owner = repositoryInfo.owner;
			const repo = repositoryInfo.repo;

			// 更新团队权限
			await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
				org: owner,
				team_slug: team.slug,
				owner,
				repo,
				permission: permission
			});

			// 更新本地状态
			const newTeams = this.state.teamPermissions.map(t => {
				if (t.id === teamId) {
					return { ...t, permission };
				}
				return t;
			});

			this.setState({
				teamPermissions: newTeams,
				settingsStatus: 'unsaved'
			});
		} catch (error) {
			console.error('更新团队权限失败:', error);
			alert(this.t('roleManagement.errors.updatePermissionFailed', '更新权限失败：{error}').replace('{error}', error.message));
		}
	}

	/**
	 * 移除团队
	 * @param {string} teamId - 团队ID
	 * @returns {Promise<void>}
	 */
	async removeTeam(teamId) {
		if (!confirm(this.t('roleManagement.confirm.removeTeam', '确定要移除该团队吗？'))) {
			return;
		}

		// 找到要移除的团队
		const team = this.state.teamPermissions.find(t => t.id === teamId.toString());
		if (!team) {
			console.error('未找到要移除的团队');
			return;
		}

		// 调用GitHub API移除团队
		try {
			const userInfo = window.app.getUserFromStorage();
			if (!userInfo || !userInfo.user || !userInfo.user.token) {
				throw new Error('未找到GitHub token');
			}

			const repositoryInfo = userInfo.user.repositoryInfo;
			const octokit = new window.Octokit({ auth: userInfo.user.token });
			const owner = repositoryInfo.owner;
			const repo = repositoryInfo.repo;

			// 从仓库中移除团队
			await octokit.rest.teams.removeRepoInOrg({
				org: owner,
				team_slug: team.slug,
				owner,
				repo
			});

			// 更新本地状态
			const newTeams = this.state.teamPermissions.filter(t => t.id !== teamId.toString());
			this.setState({
				teamPermissions: newTeams,
				settingsStatus: 'unsaved'
			});
			this.update();
		} catch (error) {
			console.error('移除团队失败:', error);
			alert(this.t('roleManagement.errors.removeTeamFailed', '移除团队失败：{error}').replace('{error}', error.message));
		}
	}

	/**
	 * 处理保存设置
	 * @returns {Promise<void>}
	 */
	async handleSaveSettings() {
		this.setState({ settingsStatus: 'loading' });
		this.update();

		try {
			// TODO: 实现实际的保存逻辑（调用GitHub API）
			await new Promise(resolve => setTimeout(resolve, 1000));

			this.setState({ settingsStatus: 'saved' });
			this.update();

			// 显示成功消息
			alert(this.t('roleManagement.messages.saveSuccess', '设置已成功保存'));
		} catch (error) {
			console.error('保存设置失败:', error);
			this.setState({ settingsStatus: 'error' });
			this.update();
			alert(this.t('roleManagement.messages.saveError', '保存失败：{error}').replace('{error}', error.message));
		}
	}

	/**
	 * 更新组件DOM
	 * @returns {void}
	 */
	update() {
		if (!this.element) return;

		const container = this.element.querySelector('.content');
		if (container) {
			container.innerHTML = `
			${this.renderPageHeader()}
			${this.renderCodeOwners()}
			${this.renderTeamPermissions()}
			${this.renderActionButtons()}
		`;

			// 重新绑定事件
			this.bindCodeOwnersEvents();
			this.bindTeamPermissionsEvents();
			this.bindActionButtonEvents();
		}
	}

	/**
	 * 销毁组件
	 * @returns {void}
	 */
	destroy() {
		// 清理事件监听器
		if (this.element) {
			this.element.remove();
		}
	}
}

// 注册组件
window.RoleManagementPage = RoleManagementPage;