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
	}

	// 辅助方法：获取i18n文本，如果服务不可用则返回默认值
	t(key, defaultValue = '') {
		if (window.I18nService && window.I18nService.t) {
			return window.I18nService.t(key, defaultValue);
		}
		return defaultValue;
	}

	// 渲染Header组件
	renderHeader(currentPage = '', showUserInfo = false, user = null, onBack = null) {
		// 获取用户权限信息
		const userInfo = window.app ? window.app.getUserFromStorage() : null;
		const userRoles = userInfo ? (userInfo.userRoles || [userInfo.userRole]) : ['visitor'];

		// 基础导航项
		const navigationItems = [
			{ href: '/', key: 'navigation.dashboard', text: this.t('navigation.dashboard', '仪表盘') },
			{ href: '/project-detail', key: 'navigation.projectDetail', text: this.t('navigation.projectDetail', '项目详情') }
		];

		// 只有具有审核权限的用户才显示审核菜单项
		if (userRoles.includes('reviewer')) {
			navigationItems.push(
				{ href: '/reviews', key: 'navigation.reviews', text: this.t('navigation.reviews', '审核') },
			);
		}

		// 只有具有维护权限的用户才显示维护菜单项
		if (userRoles.includes('maintainer')) {
			navigationItems.push(
				{ href: '/maintainers', key: 'navigation.maintainers', text: this.t('navigation.maintainers', '维护') },
			);
		}

		// 添加讨论和设置菜单项
		navigationItems.push(
			{ href: '/issues', key: 'navigation.issues', text: this.t('navigation.issues', '问题') },
			{ href: '/discussions', key: 'navigation.discussions', text: this.t('navigation.discussions', '讨论') },
			{ href: '/settings', key: 'navigation.settings', text: this.t('navigation.settings', '设置') }
		);

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

	// 绑定Header组件的事件
	bindHeaderEvents() {
		if (this.headerComponent && this.element) {
			const headerElement = this.element.querySelector('header');
			if (headerElement) {
				this.headerComponent.element = headerElement;
				this.headerComponent.bindEvents();
			}
		}
	}

	/**
	 * 显示CLA协议
	 * @async
	 * @param {Object} repoInfo - 仓库信息
	 * @param {Object} userInfo - 用户信息
	 * @param {Function} onSuccess - 签署成功回调
	 * @returns {Promise<void>}
	 */
	async showCLAAgreement(repoInfo, userInfo, onSuccess) {
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

				modal.onCancel = () => {
					reject(new Error(this.t('cla.rejected', '用户拒绝签署CLA协议')));
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
			// 从服务器加载CLA文件
			const response = await fetch(`/docs/${claFileName}`);
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
					const response = await fetch('/docs/CLA_en.md');
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
					const octokitPublic = new window.Octokit();
					const { data: repoData } = await octokitPublic.rest.repos.get({
						owner: repoInfo.owner,
						repo: repoInfo.repo
					});
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
			const octokit = new window.Octokit({ auth: userInfo.token });

			console.log('🔵 [signCLA] 创建CLA提交Issue...');
			const { data: issue } = await octokit.rest.issues.create({
				owner: 'DIPCF',
				repo: 'Projects',
				title: issueTitle,
				body: issueBody
				// 不添加labels，因为用户可能没有权限创建标签
			});

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
	 * @param {Object} octokit - GitHub API客户端
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} path - 文件路径
	 * @returns {Promise<string|null>} 文件的SHA值，如果文件不存在返回null
	 */
	async getFileSha(octokit, owner, repo, path) {
		try {
			const { data } = await octokit.rest.repos.getContent({
				owner,
				repo,
				path
			});
			return data.sha;
		} catch (error) {
			// 如果文件不存在，返回null
			if (error.status === 404) {
				return null;
			}
			throw error;
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
		super.destroy();
	}
}

// 注册组件
window.BasePage = BasePage;
