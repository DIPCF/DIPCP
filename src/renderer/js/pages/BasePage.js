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

	mount(container) {
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
		// 使用Header组件
		this.headerComponent = new window.Header({
			title: 'SPCP',
			showUserInfo: showUserInfo,
			user: user,
			currentPage: currentPage,
			onBack: onBack,
			navigationItems: [
				{ href: '/', key: 'navigation.dashboard', text: this.t('navigation.dashboard', '仪表盘') },
				{ href: '/project-detail', key: 'navigation.projectDetail', text: this.t('navigation.projectDetail', '项目详情') },
				{ href: '/reviews', key: 'navigation.reviews', text: this.t('navigation.reviews', '审核') },
				{ href: '/issues', key: 'navigation.issues', text: this.t('navigation.issues', '问题') },
				{ href: '/discussions', key: 'navigation.discussions', text: this.t('navigation.discussions', '讨论') },
				{ href: '/settings', key: 'navigation.settings', text: this.t('navigation.settings', '设置') }
			]
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
	 * 申请成为组织成员
	 * @param {Object} userInfo - 用户信息
	 * @param {string} applicationType - 申请类型 ('member' 或 'collaborator')
	 * @param {Object} targetRepo - 目标仓库信息（可选）
	 * @returns {Promise<Object>} 申请结果
	 */
	async applyMembership(userInfo, applicationType = 'member', targetRepo = null) {
		try {
			const application = await this.createMembershipApplication(
				userInfo,
				applicationType,
				targetRepo
			);
			return application;
		} catch (error) {
			console.error('Error creating membership application:', error);
			throw error;
		}
	}

	/**
	 * 创建成员申请
	 * @param {Object} userInfo - 用户信息
	 * @param {string} applicationType - 申请类型
	 * @param {Object} targetRepo - 目标仓库信息
	 * @returns {Promise<Object>} 申请结果
	 */
	async createMembershipApplication(userInfo, applicationType, targetRepo) {
		try {
			const octokit = new window.Octokit({ auth: userInfo.token });

			let issueTitle, issueBody;

			if (applicationType === 'member') {
				// 申请成为组织成员
				issueTitle = `Join Organization - ${userInfo.username}`;
				issueBody = this.generateMemberApplicationBody(userInfo);
			} else if (applicationType === 'collaborator') {
				// 申请成为仓库协作者
				issueTitle = `Become Collaborator - ${userInfo.username}`;
				issueBody = this.generateCollaboratorApplicationBody(userInfo, targetRepo);
			}

			const { data } = await octokit.rest.issues.create({
				owner: 'Zela-Foundation',
				repo: 'Members',
				title: issueTitle,
				body: issueBody
			});

			return {
				success: true,
				applicationId: data.id,
				issueNumber: data.number,
				issueUrl: data.html_url
			};
		} catch (error) {
			console.error('创建成员申请失败:', error);
			return {
				success: false,
				error: error.message
			};
		}
	}

	/**
	 * 生成组织成员申请内容
	 * @param {Object} userInfo - 用户信息
	 * @returns {string} 申请内容
	 */
	generateMemberApplicationBody(userInfo) {
		return `# 组织成员申请

**申请人信息：**
- GitHub用户名：${userInfo.username}
- 真实姓名：${userInfo.realName || '未提供'}
- 邮箱：${userInfo.email || '未提供'}
- 申请时间：${new Date().toLocaleString('zh-CN')}

**申请原因：**
申请成为Zela-Foundation组织的成员，以便参与项目开发和CLA签署流程。

**CLA签署状态：**
${userInfo.claSigned ? '✅ 已签署CLA协议' : '❌ 未签署CLA协议'}

---
*此申请由SPCP系统自动生成*`;
	}

	/**
	 * 生成仓库协作者申请内容
	 * @param {Object} userInfo - 用户信息
	 * @param {Object} targetRepo - 目标仓库信息
	 * @returns {string} 申请内容
	 */
	generateCollaboratorApplicationBody(userInfo, targetRepo) {
		return `# 仓库协作者申请

**申请人信息：**
- GitHub用户名：${userInfo.username}
- 真实姓名：${userInfo.realName || '未提供'}
- 邮箱：${userInfo.email || '未提供'}
- 申请时间：${new Date().toLocaleString('zh-CN')}

**目标仓库：**
- 仓库：${targetRepo.owner}/${targetRepo.repo}
- 仓库描述：${targetRepo.description || '未提供'}

**申请原因：**
申请成为目标仓库的协作者，以便参与项目开发和贡献。

**CLA签署状态：**
${userInfo.claSigned ? '✅ 已签署CLA协议' : '❌ 未签署CLA协议'}

---
*此申请由SPCP系统自动生成*`;
	}

	/**
	 * 轮询协作者邀请
	 * @param {Object} user - 用户信息
	 * @param {Object} repoInfo - 仓库信息（可选）
	 * @returns {Promise<void>}
	 */
	async pollCollaboratorInvitation(user, repoInfo = null) {
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
							if (!firstAccept) {
								// 不知道为什么第一次接受邀请后，需要再次提交申请，这里绝对是github的一个bug
								firstAccept = true;
								await new Promise(resolve => setTimeout(resolve, 60000));
								await this.applyMembership(user, 'member');
							} else {
								// 开始轮询检查用户权限
								if (repoInfo) {
									// 如果有仓库信息，检查仓库协作者权限
									await this.pollUserPermissions(user, 'repository', repoInfo);
								} else {
									// 否则检查组织成员权限
									await this.pollUserPermissions(user, 'organization');
								}
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
	 * @param {Object} user - 用户信息
	 * @param {string} checkType - 检查类型 ('organization' 或 'repository')
	 * @param {Object} repoInfo - 仓库信息（当checkType为'repository'时需要）
	 * @returns {Promise<void>}
	 */
	async pollUserPermissions(user, checkType = 'organization', repoInfo = null) {
		const octokit = new window.Octokit({ auth: user.token });
		const maxAttempts = 30; // 最多轮询30次，每次间隔1秒，总共30秒
		let attempts = 0;

		console.log(`开始轮询检查用户权限 (${checkType})...`);

		while (attempts < maxAttempts) {
			try {
				attempts++;

				if (checkType === 'organization') {
					// 检查用户是否已经是Zela-Foundation组织的成员
					const orgResult = await octokit.rest.orgs.checkMembershipForUser({
						org: 'Zela-Foundation',
						username: user.username
					});

					console.log('用户组织成员状态:', orgResult.status);

					if (orgResult.status === 204) {
						// 用户已经是组织成员
						this.onMembershipSuccess && this.onMembershipSuccess();
						return;
					}
				} else if (checkType === 'repository' && repoInfo) {
					// 检查用户是否已经是仓库协作者且有写入权限
					const repoResult = await octokit.rest.repos.get({
						owner: repoInfo.owner,
						repo: repoInfo.repo
					});

					const permissions = repoResult.data.permissions;
					console.log('用户仓库权限:', permissions);

					if (permissions && permissions.push) {
						// 用户已经是仓库协作者且有写入权限
						this.onMembershipSuccess && this.onMembershipSuccess();
						return;
					}
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
				message: this.t('cla.content', '您需要签署贡献者许可协议，将知识产权所有权完全转让给基金会。'),
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
						reject(error);
					}
				};

				modal.onCancel = () => {
					reject(new Error(this.t('cla.rejected', '用户拒绝签署CLA协议')));
				};
			});
		} catch (error) {
			console.error('加载CLA协议内容失败:', error);
			// 如果加载失败，使用默认内容
			const modal = new window.Modal();
			modal.setState({
				show: true,
				type: 'cla',
				title: this.t('cla.title', '贡献者许可协议'),
				message: this.t('cla.content', '您需要签署贡献者许可协议，将知识产权所有权完全转让给基金会。'),
				claContent: this.t('cla.content', '您需要签署贡献者许可协议，将知识产权所有权完全转让给基金会。'),
				inputLabel: this.t('cla.realNameLabel', '请输入您的真实姓名'),
				inputPlaceholder: this.t('cla.realNamePlaceholder', '请输入您的真实姓名（用于法律文件）'),
				confirmText: this.t('cla.agree', '同意并签署'),
				cancelText: this.t('cla.disagree', '不同意')
			});

			const modalElement = modal.render();
			modal.element = modalElement;
			document.body.appendChild(modalElement);
			modal.bindEvents();

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
						reject(error);
					}
				};

				modal.onCancel = () => {
					reject(new Error(this.t('cla.rejected', '用户拒绝签署CLA协议')));
				};
			});
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
				// 替换项目名称占位符
				return content.replace(/\[PROJECT_NAME\]/g, 'SPCP');
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
						return content.replace(/\[PROJECT_NAME\]/g, 'SPCP');
					}
				} catch (fallbackError) {
					console.warn('无法加载英文CLA文件:', fallbackError);
				}
			}

			throw error;
		}
	}

	/**
	 * 签署CLA协议
	 * @async
	 * @param {Object} repoInfo - 仓库信息
	 * @param {string} realName - 用户真实姓名
	 * @param {Object} userInfo - 用户信息
	 * @returns {Promise<Object>} 更新后的用户信息
	 */
	async signCLA(repoInfo, realName, userInfo) {
		try {
			console.log('开始签署CLA协议:', repoInfo, '真实姓名:', realName);

			// 获取当前语言和CLA内容
			const currentLanguage = this.state.language || 'zh-CN';
			const claContent = await this.loadCLAContent();

			// 创建CLA签署文件内容
			const signTime = new Date().toISOString();
			const fileName = `CLA_${userInfo.username}_${signTime.replace(/[:.]/g, '-')}.md`;

			// 创建签署文件内容
			const signedCLAContent = `# CLA签署记录

**签署者：** ${realName} (GitHub: ${userInfo.username})  
**签署时间：** ${new Date(signTime).toLocaleString('zh-CN')}  
**仓库：** ${repoInfo.owner}/${repoInfo.repo}  
**语言：** ${currentLanguage}

---

${claContent}

---

## 签署确认

我，**${realName}** (GitHub用户名: ${userInfo.username})，确认已阅读并同意上述贡献者许可协议的所有条款。

**签署者真实姓名：** ${realName}  
**GitHub用户名：** ${userInfo.username}  
**签署时间：** ${new Date(signTime).toLocaleString('zh-CN')}  
**邮箱：** ${userInfo.email || '未提供'}

---

*此文件由SPCP系统自动生成*
`;

			// 使用GitHub API创建CLA签署文件
			const octokit = new window.Octokit({ auth: userInfo.token });

			// 创建CLA目录（如果不存在）
			try {
				await octokit.rest.repos.createOrUpdateFileContents({
					owner: repoInfo.owner,
					repo: repoInfo.repo,
					path: 'CLA/.gitkeep',
					message: 'Create CLA directory',
					content: btoa(unescape(encodeURIComponent(''))),
					sha: await this.getFileSha(octokit, repoInfo.owner, repoInfo.repo, 'CLA/.gitkeep')
				});
			} catch (error) {
				// 如果文件已存在或创建失败，继续执行
				console.log('CLA目录可能已存在或创建失败:', error.message);
			}

			// 创建CLA签署文件
			await octokit.rest.repos.createOrUpdateFileContents({
				owner: repoInfo.owner,
				repo: repoInfo.repo,
				path: `CLA/${fileName}`,
				message: `CLA signed by ${realName} (${userInfo.username})`,
				content: btoa(unescape(encodeURIComponent(signedCLAContent))),
				sha: await this.getFileSha(octokit, repoInfo.owner, repoInfo.repo, `CLA/${fileName}`)
			});

			console.log(`CLA签署文件已创建: CLA/${fileName}`);

			// 更新用户信息，标记已签署CLA
			const updatedUserInfo = {
				...userInfo,
				claSigned: true,
				claSignedAt: signTime,
				claSignedFile: fileName,
				claSignedRepo: `${repoInfo.owner}/${repoInfo.repo}`,
				realName: realName
			};

			// 保存更新后的用户信息
			localStorage.setItem('spcp-user', JSON.stringify(updatedUserInfo));

			console.log('CLA协议签署完成');

			// CLA签署完成后，申请成为Zela-Foundation组织成员
			try {
				console.log('开始申请成为Zela-Foundation组织成员...');
				await this.applyMembership(updatedUserInfo, 'member');
				console.log('组织成员申请已提交');
			} catch (membershipError) {
				console.warn('组织成员申请失败，但CLA签署已完成:', membershipError.message);
				// 不抛出错误，因为CLA签署已经成功
			}

			return updatedUserInfo;

		} catch (error) {
			console.error('CLA协议签署失败:', error);
			throw new Error(`CLA协议签署失败: ${error.message}`);
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
