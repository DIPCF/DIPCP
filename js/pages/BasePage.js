/**
 * 基础页面组件
 * 所有页面组件的基类
 */
class BasePage extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			...props
		};
	}

	async render(path) {
		// 子类需要实现此方法
		console.log(`Rendering page: ${this.constructor.name} for path: ${path}`);
	}

	mount(container, path = null) {
		super.mount(container);

		// 应用主题
		if (window.ThemeService) {
			window.ThemeService.applyTheme();
		}

		// 应用国际化
		if (window.I18nService) {
			window.I18nService.translatePage();
		}

		// 确保在页面挂载后应用导航权限控制
		// 使用多次延迟确保DOM完全渲染和Header组件的事件绑定完成
		setTimeout(() => {
			this.applyNavigationVisibility();
		}, 100);

		// 再次延迟调用，确保所有异步操作完成
		setTimeout(() => {
			this.applyNavigationVisibility();
		}, 500);
	}

	/**
	 * 绑定StorageService的事件监听
	 * 子类如果需要绑定额外的事件，应该重写此方法并在其中调用super.bindStorageServiceEvents()
	 */
	bindStorageServiceEvents() {
		// 权限变更事件监听
		if (window.StorageService && window.StorageService.on) {
			// 存储回调函数引用，以便在destroy时移除
			this._permissionChangedHandler = async (data) => {
				console.log('收到权限变更事件:', data);
				// 更新Header中的导航菜单（异步刷新权限并更新）
				await this.updateNavigationMenu();
			};

			window.StorageService.on('permission-changed', this._permissionChangedHandler);
		}
	}

	/**
	 * 更新导航菜单（根据权限变化）
	 * @async
	 */
	async updateNavigationMenu() {
		if (!this.element || !this.headerComponent) return;

		// 先刷新权限信息，确保获取最新的角色数据
		if (window.app && window.app.syncAndUpdateUserPermissions) {
			try {
				await window.app.syncAndUpdateUserPermissions();
			} catch (error) {
				console.warn('刷新权限信息失败:', error);
			}
		}

		const headerElement = this.element.querySelector('header');
		if (headerElement) {
			// 获取当前页面的参数（如果有）
			const currentPage = this._currentPage || '';
			const showUserInfo = this._showUserInfo || false;
			const user = this._user || null;
			const onBack = this._onBack || null;

			// 重新渲染Header
			headerElement.outerHTML = this.renderHeader(currentPage, showUserInfo, user, onBack);
			this.bindHeaderEvents();
		}
	}

	// 辅助方法：获取i18n文本，如果服务不可用则返回默认值
	t(key, defaultValue = '') {
		let text = defaultValue;
		if (window.I18nService && window.I18nService.t) {
			text = window.I18nService.t(key, defaultValue);
		}
		return text;
	}

	// 获取i18n文本用于HTML属性（placeholder、value等）
	tAttr(key, defaultValue = '') {
		let text = defaultValue;
		if (window.I18nService && window.I18nService.t) {
			text = window.I18nService.t(key, defaultValue);
		}
		// 使用属性转义（实际上和escapeHtml一样，但语义更清晰）
		return this.escapeHtmlAttribute(text);
	}

	// 渲染Header组件
	renderHeader(currentPage = '', showUserInfo = false, user = null, onBack = null) {
		// 保存调用参数，以便后续更新时使用
		this._currentPage = currentPage;
		this._showUserInfo = showUserInfo;
		this._user = user;
		this._onBack = onBack;

		// 获取用户权限信息（优先使用 permissionInfo.roles，确保是最新的）
		const userInfo = window.app ? window.app.getUserFromStorage() : null;
		let userRoles = ['visitor'];
		if (userInfo) {
			// 优先从 permissionInfo.roles 获取（这是最新同步的权限）
			if (userInfo.permissionInfo && userInfo.permissionInfo.roles) {
				userRoles = userInfo.permissionInfo.roles;
			} else if (userInfo.userRoles) {
				userRoles = Array.isArray(userInfo.userRoles) ? userInfo.userRoles : [userInfo.userRoles];
			} else if (userInfo.userRole) {
				userRoles = [userInfo.userRole];
			}
		}

		// 所有导航项（根据权限设置显示/隐藏）
		const navigationItems = [
			{ href: '/', key: 'navigation.dashboard', text: this.t('navigation.dashboard', '仪表盘'), requiresRole: ['maintainer', 'reviewer', 'collaborator', 'visitor'] },
			{ href: '/project-detail', key: 'navigation.projectDetail', text: this.t('navigation.projectDetail', '项目详情'), requiresRole: ['maintainer', 'reviewer', 'collaborator', 'visitor'] },
			{ href: '/reviews', key: 'navigation.reviews', text: this.t('navigation.reviews', '审核'), requiresRole: ['reviewer'] },
			{ href: '/maintainers', key: 'navigation.maintainers', text: this.t('navigation.maintainers', '维护'), requiresRole: ['maintainer'] },
			{ href: '/issues', key: 'navigation.issues', text: this.t('navigation.issues', '问题'), requiresRole: ['maintainer', 'reviewer', 'collaborator'] },
			{ href: '/discussions', key: 'navigation.discussions', text: this.t('navigation.discussions', '讨论'), requiresRole: ['maintainer', 'reviewer', 'collaborator'] },
			{ href: '/settings', key: 'navigation.settings', text: this.t('navigation.settings', '设置'), requiresRole: ['maintainer', 'reviewer', 'collaborator', 'visitor'] }
		];

		// 保存用户角色和导航项，以便后续设置显示状态
		this._userRoles = userRoles;
		this._navigationItems = navigationItems;

		// 使用Header组件
		this.headerComponent = new window.Header({
			title: 'DIPCP',
			showUserInfo: showUserInfo,
			user: user,
			currentPage: currentPage,
			onBack: onBack,
			navigationItems: navigationItems
		});

		// 渲染Header组件并返回HTML字符串
		const headerElement = this.headerComponent.render();
		return headerElement.outerHTML;
	}

	/**
	 * 根据权限设置导航项的显示/隐藏状态
	 */
	applyNavigationVisibility() {
		if (!this.element || !this._navigationItems || !this._userRoles) return;

		const headerElement = this.element.querySelector('header');
		if (!headerElement) return;

		// 遍历所有导航项，根据权限设置显示状态
		this._navigationItems.forEach((item) => {
			// 通过 data-route 属性查找对应的导航元素
			const navElement = headerElement.querySelector(`.nav-item[data-route="${item.href}"]`);
			if (!navElement) return;

			// 检查用户是否具有所需权限（所有导航项都有明确的权限要求）
			const hasPermission = item.requiresRole && item.requiresRole.some(role =>
				this._userRoles.includes(role)
			);

			// 根据权限设置显示/隐藏
			navElement.style.display = hasPermission ? '' : 'none';
		});
	}

	// 绑定Header组件的事件
	bindHeaderEvents() {
		if (this.headerComponent && this.element) {
			const headerElement = this.element.querySelector('header');
			if (headerElement) {
				this.headerComponent.element = headerElement;

				// 保存原始的 updateNavigationItems 方法
				const originalUpdateNavigationItems = this.headerComponent.updateNavigationItems.bind(this.headerComponent);

				// 覆盖 updateNavigationItems 方法，在更新后自动应用权限控制
				this.headerComponent.updateNavigationItems = () => {
					originalUpdateNavigationItems();
					// 在导航项更新后，重新应用权限控制
					setTimeout(() => {
						this.applyNavigationVisibility();
					}, 0);
				};

				this.headerComponent.bindEvents();
				// 绑定事件后，根据权限设置导航项的显示状态
				// 使用 setTimeout 确保 Header 内部的 DOM 完全渲染
				setTimeout(() => {
					this.applyNavigationVisibility();
				}, 0);
			}
		}
	}

	/**
	 * 显示CLA协议
	 * @async
	 * @param {Object} repoInfo - 仓库信息
	 * @param {Object} userInfo - 用户信息
	 * @param {Function} onSuccess - 签署成功回调
	 * @param {Function} [onCancel] - 取消回调
	 * @returns {Promise<void>}
	 */
	async showCLAAgreement(repoInfo, userInfo, onSuccess, onCancel) {
		try {
			// 根据语言加载CLA协议内容
			const claContent = await this.loadCLAContent();

			const modal = new window.Modal();
			modal.setState({
				show: true,
				type: 'cla',
				title: this.t('cla.title', '贡献者许可协议'),
				message: this.t('cla.content', '作为DIPCP平台的贡献者，您需要签署贡献者许可协议，将知识产权所有权完全转让给DIPCF基金会。由由基金会统一管理，并负责知识产权的维护和运营。请完整阅读后签署协议。'),
				claContent: claContent,
				inputLabel: this.t('cla.realNameLabel', '请输入您的真实姓名'),
				inputPlaceholder: this.t('cla.realNamePlaceholder', '请输入您的真实姓名（用于法律文件）'),
				confirmText: this.t('cla.agree', '同意并签署'),
				cancelText: this.t('cla.disagree', '不同意')
			});

			const modalElement = modal.render();
			modal.element = modalElement;
			document.body.appendChild(modalElement);
			modal.bindEvents();

			// 等待用户选择
			return new Promise((resolve, reject) => {
				modal.onConfirm = async (realName) => {
					if (!realName || realName.trim() === '') {
						alert(this.t('cla.errors.noRealName', '请输入您的真实姓名'));
						return;
					}

					try {
						await this.signCLA(repoInfo, realName.trim(), userInfo);
						if (onSuccess) {
							await onSuccess();
						}
						resolve();
					} catch (error) {
						console.error('❌ [showCLAAgreement] onConfirm 内部错误:', error);
						reject(error);
					}
				};

				modal.onCancel = async () => {
					try {
						if (onCancel) {
							await onCancel();
						}
						resolve();
					} catch (error) {
						console.error('❌ [showCLAAgreement] onCancel 内部错误:', error);
						reject(error);
					}
				};
			});
		} catch (error) {
			console.error('加载CLA协议内容失败:', error);
		}
	}

	/**
	 * 加载CLA协议内容
	 * @async
	 * @returns {Promise<string>} CLA协议内容
	 */
	async loadCLAContent() {
		const currentLanguage = this.state.language || 'zh-CN';

		// 根据语言选择CLA文件
		let claFileName;
		if (currentLanguage.startsWith('zh')) {
			claFileName = 'CLA_zh.md';
		} else {
			claFileName = 'CLA_en.md'; // 默认使用英文
		}

		try {
			// 从服务器加载CLA文件（使用app.getFullPath处理基础路径）
			const filePath = window.app ? window.app.getFullPath(`/docs/${claFileName}`) : `/docs/${claFileName}`;
			const response = await fetch(filePath);
			if (response.ok) {
				const content = await response.text();
				return content.replace(/\[PROJECT_NAME\]/g, 'DIPCP');
			} else {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
		} catch (error) {
			console.warn(`无法加载CLA文件 ${claFileName}:`, error);

			// 如果中文文件加载失败，尝试加载英文文件
			if (claFileName === 'CLA_zh.md') {
				try {
					const filePath = window.app ? window.app.getFullPath('/docs/CLA_en.md') : '/docs/CLA_en.md';
					const response = await fetch(filePath);
					if (response.ok) {
						const content = await response.text();
						return content.replace(/\[PROJECT_NAME\]/g, 'DIPCP');
					}
				} catch (fallbackError) {
					console.warn('无法加载英文CLA文件:', fallbackError);
				}
			}

			throw error;
		}
	}

	/**
	 * 签署CLA协议（通过Issue提交）
	 * @async
	 * @param {Object} repoInfo - 仓库信息
	 * @param {string} realName - 用户真实姓名
	 * @param {Object} userInfo - 用户信息
	 * @returns {Promise<Object>} 更新后的用户信息
	 */
	async signCLA(repoInfo, realName, userInfo) {
		try {
			console.log('🔵 [signCLA] 开始签署CLA协议:', { repoInfo, realName, user: userInfo && userInfo.username });

			// 获取当前语言和CLA内容
			const currentLanguage = this.state.language || 'zh-CN';
			const claContent = await this.loadCLAContent();
			console.log('🔵 [signCLA] 已加载CLA内容，长度:', claContent && claContent.length);

			// 生成完整的CLA文件内容（客户端生成，工作流只负责转存）
			const signTime = new Date().toISOString();
			const timestamp = signTime.replace(/[:.]/g, '-');
			const fileName = `CLA_${userInfo.username}_${timestamp}.md`;
			console.log('🔵 [signCLA] 生成文件名:', fileName);

			// 获取仓库描述（如果 repoInfo 中没有，尝试从GitHub API获取）
			let repoDescription = repoInfo.description || '';
			if (!repoDescription && repoInfo.owner && repoInfo.repo) {
				try {
					const repoData = await window.GitHubService.getRepo(repoInfo.owner, repoInfo.repo, false);
					repoDescription = repoData.description || '';
				} catch (e) {
					console.warn('无法获取仓库描述:', e.message);
				}
			}

			// 创建完整的CLA文件内容（使用i18n）
			const completeCLAContent = `# ${this.t('cla.signingRecord', 'CLA签署记录')}

**${this.t('cla.signer', '签署者')}：** ${realName} (GitHub: ${userInfo.username})  
**${this.t('cla.signingTime', '签署时间')}：** ${new Date(signTime).toLocaleString(currentLanguage === 'zh-CN' ? 'zh-CN' : 'en-US')}  
**${this.t('cla.repository', '仓库')}：** ${repoInfo.owner}/${repoInfo.repo}  
**${this.t('cla.description', '描述')}：** ${repoDescription || this.t('cla.noDescription', '无描述')}

---

## ${this.t('cla.agreementContent', 'CLA协议内容')}

${claContent}

---

## ${this.t('cla.signingConfirmation', '签署确认')}

${this.t('cla.signingStatement', '我，**{realName}** (GitHub用户名: {username})，确认已阅读并同意上述贡献者许可协议的所有条款。', { realName, username: userInfo.username })}

**${this.t('cla.signerRealName', '签署者真实姓名')}：** ${realName}  
**${this.t('cla.githubUsername', 'GitHub用户名')}：** ${userInfo.username}  
**${this.t('cla.signingTime', '签署时间')}：** ${new Date(signTime).toLocaleString(currentLanguage === 'zh-CN' ? 'zh-CN' : 'en-US')}  
**${this.t('cla.email', '邮箱')}：** ${userInfo.email || this.t('cla.notProvided', '未提供')}

---

*${this.t('cla.autoGenerated', '此文件由DIPCP系统自动生成')}*
			`;
			console.log('🔵 [signCLA] 生成CLA完整内容，长度:', completeCLAContent.length);

			// 创建CLA提交Issue内容，需要添加工作流提取所需的字段
			const issueTitle = `CLA Submission - ${userInfo.username}`;
			const issueBody = `${completeCLAContent}

---

**仓库：** ${repoInfo.owner}/${repoInfo.repo}
**描述：** ${repoDescription || ''}
			`;

			// 使用GitHub API创建CLA提交Issue
			console.log('🔵 [signCLA] 创建CLA提交Issue...');

			await window.GitHubService.initFromUser(userInfo);

			const issue = await window.GitHubService.createIssue(
				'DIPCF',
				'Projects',
				{
					title: issueTitle,
					body: issueBody
					// 不添加labels，因为用户可能没有权限创建标签
				}
			);

			console.log(`CLA提交Issue已创建: #${issue.number}`);

			// 更新用户信息，标记已提交CLA
			const updatedUserInfo = {
				...userInfo,
				claSigned: true,
				claSignedAt: signTime,
				claSignedIssue: issue.number,
				claSignedRepo: `${repoInfo.owner}/${repoInfo.repo}`,
				realName: realName,
				claFileName: fileName
			};

			// 保存更新后的用户信息
			localStorage.setItem('dipcp-user', JSON.stringify(updatedUserInfo));

			console.log('✅ [signCLA] CLA协议提交完成');

			return updatedUserInfo;

		} catch (error) {
			console.error('❌ [signCLA] CLA协议提交失败:', error);
			throw new Error(`CLA协议提交失败: ${error.message}`);
		}
	}

	/**
	 * 获取文件的SHA值（用于更新文件）
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} path - 文件路径
	 * @returns {Promise<string|null>} 文件的SHA值，如果文件不存在返回null
	 */
	async getFileSha(owner, repo, path) {
		try {
			const content = await window.GitHubService.getRepoContent(owner, repo, path);
			return content.sha;
		} catch (error) {
			// 如果文件不存在，返回null
			if (error.status === 404 || (error.response && error.response.status === 404)) {
				return null;
			}
			throw error;
		}
	}

	/**
	 * 获取并缓存Discussions分类列表
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 */
	async cacheDiscussionCategories(owner, repo) {
		try {
			console.log('🔧 正在获取Discussions分类列表...');

			// 获取Discussions分类列表
			const categoriesResult = await window.GitHubService.graphql(`
				query GetDiscussionCategories($owner: String!, $name: String!) {
					repository(owner: $owner, name: $name) {
						discussionCategories(first: 10) {
							edges {
								node {
									id
									name
								}
							}
						}
					}
				}
			`, {
				owner: owner,
				name: repo
			});

			const categories = categoriesResult.repository.discussionCategories.edges.map(edge => edge.node);

			if (categories.length === 0) {
				console.warn('⚠️ 未找到任何Discussions分类');
				return;
			}

			// 保存到本地存储
			const cacheKey = `dipcp-discussion-categories-${owner}-${repo}`;
			try {
				localStorage.setItem(cacheKey, JSON.stringify(categories));
				console.log(`✅ 已缓存 ${categories.length} 个Discussions分类`);
			} catch (error) {
				console.warn('⚠️ 保存分类列表到缓存失败:', error);
			}

		} catch (error) {
			console.error('❌ 获取Discussions分类列表失败:', error);
			// 不抛出错误，因为分类列表缓存不是关键功能，不应该阻止其他设置
			console.log('⚠️ 继续执行后续设置...');
		}
	}

	/**
	 * 解析GitHub URL
	 * @param {string} url - GitHub URL
	 * @returns {Object|null} 解析结果
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

	destroy() {
		// 移除StorageService的事件监听
		if (window.StorageService && window.StorageService.off) {
			if (this._permissionChangedHandler) {
				window.StorageService.off('permission-changed', this._permissionChangedHandler);
				this._permissionChangedHandler = null;
			}
		}

		super.destroy();
	}
}

// 注册组件
window.BasePage = BasePage;
