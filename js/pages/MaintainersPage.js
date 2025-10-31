/**
 * 维护页面组件
 * 完全组件化的维护页面
 * 从 GitHub 获取 Pull Requests 并显示
 */
class MaintainersPage extends BasePage {
	/**
	 * 构造函数
	 * @param {Object} props - 组件属性
	 * @param {Array} [props.maintainers] - 初始维护者列表
	 */
	constructor(props = {}) {
		super(props);

		// 从 localStorage 获取用户信息
		const userInfo = window.app ? window.app.getUserFromStorage() : null;

		this.state = {
			user: userInfo ? userInfo.user : null,
			maintainers: props.maintainers || [],
			selectedMaintainer: null,
			loading: true,
			// API 状态
			apiConfigured: false,
			octokit: null,
		};
	}

	/**
	 * 初始化 Octokit
	 */
	async initOctokit() {
		try {
			// 检查Octokit是否可用
			if (typeof window.Octokit === 'undefined') {
				console.warn('Octokit 未加载');
				this.state.apiConfigured = false;
				return;
			}

			// 从用户信息获取token
			if (!this.state.user || !this.state.user.token) {
				console.warn('用户未登录或没有token');
				this.state.apiConfigured = false;
				return;
			}

			const token = this.state.user.token;

			// 创建Octokit实例
			this.state.octokit = new window.Octokit({ auth: token });
			this.state.apiConfigured = true;
			console.log('Octokit 初始化成功');
		} catch (error) {
			console.error('初始化 Octokit 失败:', error);
			this.state.apiConfigured = false;
		}
	}

	/**
	 * 从 GitHub 获取 Pull Requests
	 */
	async loadPullRequests() {
		if (!this.state.apiConfigured || !this.state.octokit) {
			console.error('GitHub API 未配置');
			this.setLoading(false);
			return;
		}

		try {
			this.setLoading(true);
			const user = this.state.user;
			if (!user || !user.repositoryInfo) {
				console.error('用户信息或仓库信息缺失');
				this.setLoading(false);
				return;
			}

			const owner = user.repositoryInfo.owner;
			const repo = user.repositoryInfo.repo;

			console.log('从 GitHub 获取未维护的 Pull Requests...', { owner, repo });

			// 获取当前用户名
			const currentUser = this.state.user.username || this.state.user.login || '';

			// 使用 GitHub 搜索 API 直接过滤：
			// 合并两个查询结果，找到最旧的
			const queries = [
				// 未维护的 PR（没有 maintaining 标签），且提交者不是当前用户
				`is:pr is:open -label:maintaining -label:c_${currentUser} repo:${owner}/${repo}`,
				// 当前用户维护的 PR（有 maintaining 标签且有 m_用户名 标签），且提交者不是当前用户
				`is:pr is:open label:maintaining label:m_${currentUser} -label:c_${currentUser} repo:${owner}/${repo}`
			];

			const searchPromises = queries.map(query =>
				this.state.octokit.rest.search.issuesAndPullRequests({
					q: query,
					sort: 'created',
					order: 'asc',
					per_page: 1 // 每个查询只取最旧的1个
				})
			);

			const searchResponses = await Promise.all(searchPromises);

			// 合并所有搜索结果
			const allPRs = [];
			searchResponses.forEach((response, index) => {
				if (response.data.items.length > 0) {
					allPRs.push(...response.data.items);
				}
				console.log(`查询 ${index + 1} 找到 ${response.data.items.length} 个 PR`);
			});

			console.log(`总共找到 ${allPRs.length} 个可维护的 PR`);

			// 如果没有结果，直接返回
			if (allPRs.length === 0) {
				this.setState({
					maintainers: [],
					selectedMaintainer: null
				});
				this.setLoading(false);
				return;
			}

			// 找到创建时间最旧的 PR
			const item = allPRs.reduce((oldest, current) => {
				const oldestDate = new Date(oldest.created_at);
				const currentDate = new Date(current.created_at);
				return currentDate < oldestDate ? current : oldest;
			});
			// 搜索 API 返回的是 issue 对象，需要获取完整的 PR 信息
			const pr = await this.state.octokit.rest.pulls.get({
				owner,
				repo,
				pull_number: item.number
			});
			const prData = pr.data;

			// 获取 PR 中修改的文件列表（保存完整路径）
			let fileList = [];
			try {
				const { data: prFiles } = await this.state.octokit.rest.pulls.listFiles({
					owner,
					repo,
					pull_number: prData.number
				});
				fileList = prFiles
					.filter(file => file.status !== 'removed')
					.map(file => ({
						path: file.filename,
						name: file.filename.split('/').pop()
					}));
			} catch (error) {
				console.warn(`获取 PR #${prData.number} 的文件列表失败:`, error);
			}

			// 生成显示标题：使用文件列表或原始标题
			let displayTitle;
			if (fileList.length > 0) {
				// 一行显示一个文件名，超过5个用...表示
				const displayFiles = fileList.slice(0, 5);
				displayTitle = displayFiles.join('\n');
				if (fileList.length > 5) {
					displayTitle += '\n...';
				}
			} else {
				// 如果没有获取到文件列表，使用原始标题
				displayTitle = prData.title;
			}

			const oldestPR = {
				id: prData.number.toString(),
				title: displayTitle,
				author: prData.user.login,
				date: new Date(prData.created_at).toLocaleString(),
				status: prData.state === 'open' ? '待处理' : prData.state,
				content: prData.body || '无描述',
				files: fileList,
				pr: prData,
				headRef: prData.head.ref, // 保存 PR 的 head 分支引用，用于获取文件内容
				headOwner: prData.head.repo.owner.login,
				headRepo: prData.head.repo.name
			};

			// 更新状态，直接显示最旧的 PR
			this.setState({
				maintainers: [oldestPR],
				selectedMaintainer: oldestPR
			});

			// 如果有选中的 PR，标记为维护中
			await this.markPRAsMaintaining(oldestPR);

			this.setLoading(false);

		} catch (error) {
			console.error('加载 Pull Requests 失败:', error);
			this.setLoading(false);
			// 显示错误信息
			if (this.element) {
				const content = this.element.querySelector('.content');
				if (content) {
					const errorDiv = document.createElement('div');
					errorDiv.className = 'error-message';
					errorDiv.textContent = `加载失败: ${error.message}`;
					errorDiv.style.cssText = 'color: red; padding: 2rem; text-align: center; background: var(--bg-primary); border: 1px solid var(--border-primary); border-radius: 4px;';
					content.innerHTML = '';
					content.appendChild(errorDiv);
				}
			}
		}
	}

	/**
	 * 渲染页面内容
	 * @returns {HTMLElement} 包含页面内容的容器元素
	 */
	render() {
		const container = document.createElement('div');
		container.className = 'dashboard';
		container.innerHTML = `
			${this.renderHeader()}
			<div class="content">
				${this.renderMaintainerDetail()}
			</div>
		`;
		return container;
	}

	/**
	 * 渲染页面头部
	 * @returns {string} 头部HTML字符串
	 */
	renderHeader() {
		return super.renderHeader('maintainers', false, null);
	}

	/**
	 * 渲染维护者详情视图
	 * 根据当前状态显示空状态、加载状态或维护者详情
	 * @returns {string} 详情视图HTML字符串
	 */
	renderMaintainerDetail() {
		// 如果没有选中的 PR，显示空状态
		if (!this.state.selectedMaintainer) {
			if (this.state.loading) {
				return '<div class="loading" style="color: var(--text-primary); padding: 2rem; text-align: center;">载入中...</div>';
			}
			return `
				<div style="color: var(--text-secondary); padding: 2rem; text-align: center;">
					<div>${this.t('maintainers.noMaintainers', '暂无维护内容')}</div>
					<button class="btn btn-sm btn-secondary" id="refreshBtn" data-action="refresh" style="margin-top: 1rem;">
						🔄 ${this.t('common.refresh', '刷新')}
					</button>
				</div>
			`;
		}

		const maintainer = this.state.selectedMaintainer;
		return `
            <div class="maintainer-detail">
				<div class="maintainer-detail-header" style="margin-bottom: 1rem;">
                    <h2 style="margin: 0;">${maintainer.author} - ${maintainer.date}</h2>
                </div>
                <div class="maintainer-detail-content">
                    <div class="maintainer-content" style="margin-bottom: 1rem;">
                        <div class="content-preview" style="white-space: pre-wrap; color: var(--text-primary); padding: 0.75rem; background: var(--bg-secondary, var(--bg-primary)); border: 1px solid var(--border-primary); border-radius: 4px;">
                            ${maintainer.content}
                        </div>
                    </div>
                    ${maintainer.files && maintainer.files.length > 0 ? `
                    <div class="maintainer-files" style="margin-bottom: 1rem;">
                        <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">文件列表</h3>
                        <div class="files-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${maintainer.files.map((file, index) => `
                                <button class="file-item-btn" data-file-path="${file.path}" data-file-index="${index}" style="text-align: left; padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); cursor: pointer;">
                                    ${file.name}
                                </button>
                            `).join('')}
                        </div>
                        <div id="fileContentDisplay" style="display: none; margin-top: 0.5rem; padding: 0.75rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-secondary, var(--bg-primary));">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <strong id="fileContentTitle" style="color: var(--text-primary);"></strong>
                                <button id="closeFileContent" style="padding: 0.25rem 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); cursor: pointer;">关闭</button>
                            </div>
                            <pre id="fileContentText" style="white-space: pre-wrap; word-wrap: break-word; color: var(--text-primary); margin: 0; max-height: 400px; overflow-y: auto;"></pre>
                        </div>
                    </div>
                    ` : ''}
                    <div class="maintainer-comments">
                        <div class="comment-form" style="margin-bottom: 1rem;">
                            <textarea id="commentText" placeholder="${this.t('maintainers.commentPlaceholder', '添加评论...')}" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); min-height: 80px; resize: vertical; font-family: inherit; margin-bottom: 0.5rem;"></textarea>
                        </div>
                        <div class="maintainer-detail-actions" style="display: flex; align-items: center; gap: 0.5rem;">
                            <select id="commitSize" class="form-select" style="padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary);">
                                <option value="">${this.t('maintainers.selectCommitSize', '提交规模')}</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                            </select>
                            <select id="impactMultiplier" class="form-select" style="padding: 0.5rem; border: 1px solid var(--border-primary); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary);">
                                <option value="">${this.t('maintainers.selectImpactMultiplier', '影响力乘数')}</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                            </select>
                            <button class="btn btn-success" data-action="approve-detail">
                                ✅ ${this.t('maintainers.allowMerge', '允许合并')}
                            </button>
                            <button class="btn btn-danger" data-action="reject-detail">
                                ❌ ${this.t('maintainers.rejectMerge', '拒绝合并')}
                            </button>
                        </div>
                        <div id="rejectError" class="error-message" style="display: none; color: var(--error-color, #dc3545); margin-top: 0.5rem; padding: 0.5rem; background: var(--bg-secondary, rgba(220, 53, 69, 0.1)); border-radius: 4px; font-size: 0.9rem;"></div>
                        <div id="approveError" class="error-message" style="display: none; color: var(--error-color, #dc3545); margin-top: 0.5rem; padding: 0.5rem; background: var(--bg-secondary, rgba(220, 53, 69, 0.1)); border-radius: 4px; font-size: 0.9rem;"></div>
                    </div>
                </div>
            </div>
        `;
	}

	/**
	 * 挂载页面组件到DOM容器
	 * 初始化Octokit并加载Pull Requests
	 * @param {HTMLElement} container - DOM容器元素
	 * @async
	 */
	async mount(container) {
		super.mount(container);

		// 绑定事件
		this.bindEvents();

		// 等待 Octokit 初始化完成
		await this.initOctokit();

		// 加载 GitHub Pull Requests
		if (this.state.apiConfigured) {
			await this.loadPullRequests();
		} else {
			// 如果 API 未配置，设置加载完成状态
			this.setLoading(false);
		}
	}

	/**
	 * 绑定页面事件监听器
	 * 包括操作按钮、刷新按钮、文件点击、评论输入等事件
	 */
	bindEvents() {
		// 绑定Header组件的事件
		this.bindHeaderEvents();
		// 审核操作按钮（在详情页面的按钮）
		const actionButtons = this.element.querySelectorAll('[data-action]');
		actionButtons.forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				const action = e.currentTarget.dataset.action;
				const maintainerId = e.currentTarget.dataset.maintainerId;

				this.handleAction(action, maintainerId);
			});
		});

		// 刷新按钮（只在没有内容时显示）
		const refreshBtn = this.element.querySelector('#refreshBtn');
		if (refreshBtn) {
			refreshBtn.addEventListener('click', () => {
				this.handleRefresh();
			});
		}

		// 文件点击事件
		const fileButtons = this.element.querySelectorAll('.file-item-btn');
		fileButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				const filePath = btn.dataset.filePath;
				this.handleFileClick(filePath);
			});
		});

		// 关闭文件内容按钮
		const closeFileContentBtn = this.element.querySelector('#closeFileContent');
		if (closeFileContentBtn) {
			closeFileContentBtn.addEventListener('click', () => {
				const fileContentDisplay = this.element.querySelector('#fileContentDisplay');
				if (fileContentDisplay) {
					fileContentDisplay.style.display = 'none';
				}
			});
		}

		// 评论框输入事件，清除错误提示
		const commentText = this.element.querySelector('#commentText');
		if (commentText) {
			commentText.addEventListener('input', () => {
				this.hideRejectError();
				this.hideApproveError();
			});
		}

		// 下拉列表变化事件，清除错误提示
		const commitSizeSelect = this.element.querySelector('#commitSize');
		const impactMultiplierSelect = this.element.querySelector('#impactMultiplier');
		if (commitSizeSelect) {
			commitSizeSelect.addEventListener('change', () => {
				this.hideApproveError();
			});
		}
		if (impactMultiplierSelect) {
			impactMultiplierSelect.addEventListener('change', () => {
				this.hideApproveError();
			});
		}
	}

	/**
	 * 处理用户操作
	 * 根据操作类型调用相应的处理方法
	 * @param {string} action - 操作类型（approve, reject, view, refresh等）
	 * @param {string} [maintainerId] - 维护者ID（可选）
	 */
	handleAction(action, maintainerId) {
		const maintainer = this.state.maintainers.find(m => m.id === maintainerId) || this.state.selectedMaintainer;

		if (!maintainer) return;

		switch (action) {
			case 'approve':
			case 'approve-detail':
				this.handleApprove(maintainer);
				break;
			case 'reject':
			case 'reject-detail':
				this.handleReject(maintainer);
				break;
			case 'view':
				this.setState({ selectedMaintainer: maintainer });
				this.update();
				break;
			case 'refresh':
				this.handleRefresh();
				break;
		}
	}

	/**
	 * 处理刷新操作
	 */
	async handleRefresh() {
		if (!this.state.apiConfigured || !this.state.octokit) {
			alert(this.t('maintainers.errors.apiNotConfigured', 'GitHub API 未配置'));
			return;
		}

		// 更新刷新按钮状态
		const refreshBtn = this.element.querySelector('#refreshBtn');
		if (refreshBtn) {
			refreshBtn.disabled = true;
			refreshBtn.textContent = `⏳ ${this.t('common.refreshing', '刷新中...')}`;
		}

		try {
			await this.loadPullRequests();
		} catch (error) {
			console.error('刷新失败:', error);
		} finally {
			// 恢复刷新按钮状态
			if (refreshBtn) {
				refreshBtn.disabled = false;
				refreshBtn.textContent = `🔄 ${this.t('common.refresh', '刷新')}`;
			}
		}
	}

	/**
	 * 处理批准合并操作
	 * 验证必填字段，合并PR，创建讨论主题
	 * @param {Object} maintainer - 维护者对象
	 * @async
	 */
	async handleApprove(maintainer) {
		if (!this.state.apiConfigured || !this.state.octokit) {
			this.showApproveError(this.t('maintainers.errors.apiNotConfigured', 'GitHub API 未配置'));
			return;
		}

		// 检查评论框中是否有内容
		const commentText = this.element.querySelector('#commentText');
		if (!commentText || !commentText.value.trim()) {
			this.showApproveError(this.t('maintainers.errors.commentRequired', '请先输入评论内容'));
			return;
		}

		// 获取下拉列表的值
		const commitSize = this.element.querySelector('#commitSize')?.value || '';
		const impactMultiplier = this.element.querySelector('#impactMultiplier')?.value || '';

		// 检查两个下拉列表是否都已选择
		const missingFields = [];
		if (!commitSize) {
			missingFields.push(this.t('maintainers.selectCommitSize', '提交规模'));
		}
		if (!impactMultiplier) {
			missingFields.push(this.t('maintainers.selectImpactMultiplier', '影响力乘数'));
		}

		if (missingFields.length > 0) {
			this.showApproveError(this.t('maintainers.errors.fieldsRequired', `请选择：{fields}`).replace('{fields}', missingFields.join('、')));
			return;
		}

		// 清除错误提示
		this.hideApproveError();

		// 设置按钮为处理中状态
		this.setButtonsProcessing(true);

		const comment = commentText.value.trim();
		const author = maintainer.author;

		try {
			const user = this.state.user;
			const owner = user.repositoryInfo.owner;
			const repo = user.repositoryInfo.repo;
			const prNumber = parseInt(maintainer.id);
			const maintainerName = user.username || user.login || '维护者';

			// 合并 PR，将所有信息写入 commit_message
			const commitMessage = `✅ maintainer：\n\n@${author}\n\n**Size：** ${commitSize}\n**Impact：** ${impactMultiplier}\n\n**Comment：**\n${comment}`;

			await this.state.octokit.rest.pulls.merge({
				owner,
				repo,
				pull_number: prNumber,
				commit_title: `Merge: ${maintainer.title}`,
				commit_message: commitMessage
			});

			// 在Discussions的Announcements中创建讨论主题
			const discussionBody = `@${author} ✅ **${this.t('maintainers.discussion.approvedTitle', '合并审核已通过')}**\n\n**${this.t('maintainers.discussion.maintainer', '维护者：')}** @${maintainerName}\n**${this.t('maintainers.discussion.commitSize', '提交规模：')}** ${commitSize}\n**${this.t('maintainers.discussion.impactMultiplier', '影响力乘数：')}** ${impactMultiplier}\n\n**${this.t('maintainers.discussion.reviewComment', '审核意见：')}**\n${comment}\n\n**${this.t('maintainers.discussion.relatedPR', '相关PR：')}** #${prNumber}`;
			const approvedTitle = this.t('maintainers.discussion.approvedTitle', '✅');
			await this.createDiscussion(owner, repo, author, discussionBody, prNumber, approvedTitle);

			// 清空评论框
			commentText.value = '';

			// 重新加载 PR 列表
			await this.loadPullRequests();
		} catch (error) {
			console.error('合并 PR 失败:', error);
			this.showApproveError(this.t('maintainers.errors.approveFailed', `合并失败: ${error.message}`));
		} finally {
			// 恢复按钮状态
			this.setButtonsProcessing(false);
		}
	}

	/**
	 * 处理拒绝合并操作
	 * 验证拒绝理由，关闭PR，创建讨论主题
	 * @param {Object} maintainer - 维护者对象
	 * @async
	 */
	async handleReject(maintainer) {
		// 检查评论框中是否有内容
		const commentText = this.element.querySelector('#commentText');
		if (!commentText || !commentText.value.trim()) {
			this.showRejectError(this.t('maintainers.errors.commentRequired', '请先输入拒绝理由'));
			return;
		}

		// 清除错误提示
		this.hideRejectError();

		// 设置按钮为处理中状态
		this.setButtonsProcessing(true);

		const reason = commentText.value.trim();
		const author = maintainer.author;

		try {
			const user = this.state.user;
			const owner = user.repositoryInfo.owner;
			const repo = user.repositoryInfo.repo;
			const prNumber = parseInt(maintainer.id);
			const maintainerName = user.username || user.login || '维护者';

			// 关闭 PR
			await this.state.octokit.rest.pulls.update({
				owner,
				repo,
				pull_number: prNumber,
				state: 'closed'
			});

			// 在Discussions的Announcements中创建讨论主题
			const discussionBody = `@${author} ${this.t('maintainers.discussion.rejectedTitle', '合并审核未通过')}\n\n**${this.t('maintainers.discussion.maintainer', '维护者：')}** @${maintainerName}\n**${this.t('maintainers.discussion.rejectionReason', '拒绝原因：')}**\n${reason}\n\n**${this.t('maintainers.discussion.relatedPR', '相关PR：')}** #${prNumber}`;
			await this.createDiscussion(owner, repo, author, discussionBody, prNumber);

			// 清空评论框
			commentText.value = '';

			// 重新加载 PR 列表
			await this.loadPullRequests();
		} catch (error) {
			console.error('拒绝 PR 失败:', error);
			this.showRejectError(this.t('maintainers.errors.rejectFailed', `拒绝失败: ${error.message}`));
		} finally {
			// 恢复按钮状态
			this.setButtonsProcessing(false);
		}
	}

	/**
	 * 显示拒绝错误提示
	 * @param {string} message - 错误消息
	 */
	showRejectError(message) {
		const errorDiv = this.element.querySelector('#rejectError');
		if (errorDiv) {
			errorDiv.textContent = message;
			errorDiv.style.display = 'block';
		}
	}

	/**
	 * 隐藏拒绝错误提示
	 */
	hideRejectError() {
		const errorDiv = this.element.querySelector('#rejectError');
		if (errorDiv) {
			errorDiv.style.display = 'none';
			errorDiv.textContent = '';
		}
	}

	/**
	 * 显示通过审核错误提示
	 * @param {string} message - 错误消息
	 */
	showApproveError(message) {
		const errorDiv = this.element.querySelector('#approveError');
		if (errorDiv) {
			errorDiv.textContent = message;
			errorDiv.style.display = 'block';
		}
	}

	/**
	 * 隐藏通过审核错误提示
	 */
	hideApproveError() {
		const errorDiv = this.element.querySelector('#approveError');
		if (errorDiv) {
			errorDiv.style.display = 'none';
			errorDiv.textContent = '';
		}
	}

	/**
	 * 设置按钮为处理中状态或恢复正常状态
	 * @param {boolean} processing - 是否处理中
	 */
	setButtonsProcessing(processing) {
		const approveBtn = this.element.querySelector('[data-action="approve-detail"]');
		const rejectBtn = this.element.querySelector('[data-action="reject-detail"]');

		if (approveBtn) {
			approveBtn.disabled = processing;
			approveBtn.textContent = processing
				? this.t('common.processing', '处理中...')
				: `✅ ${this.t('maintainers.allowMerge', '允许合并')}`;
		}

		if (rejectBtn) {
			rejectBtn.disabled = processing;
			rejectBtn.textContent = processing
				? this.t('common.processing', '处理中...')
				: `❌ ${this.t('maintainers.rejectMerge', '拒绝合并')}`;
		}
	}

	/**
	 * 在Discussions的Announcements中创建讨论主题
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} author - PR作者（用于日志，body中应已包含@作者）
	 * @param {string} body - 讨论内容（已经格式化好的内容）
	 * @param {number} prNumber - PR编号
	 * @param {string} [titlePrefix='维护审核未通过'] - 标题前缀，默认是"维护审核未通过"
	 */
	async createDiscussion(owner, repo, author, body, prNumber, titlePrefix = '❌') {
		try {
			// 获取仓库ID
			const { data: repoInfo } = await this.state.octokit.rest.repos.get({
				owner,
				repo
			});
			const repositoryId = repoInfo.node_id;

			// 从本地存储获取categories列表（全局共享的缓存）
			const cacheKey = `dipcp-discussion-categories-${owner}-${repo}`;
			let categories = null;

			try {
				const cached = localStorage.getItem(cacheKey);
				if (cached) {
					categories = JSON.parse(cached);
					console.log('从缓存中获取Discussions分类列表');
				}
			} catch (error) {
				console.warn('读取分类列表缓存失败:', error);
			}

			// 如果缓存中没有，则查询并保存（向后兼容：如果仓库设置时未缓存）
			if (!categories) {
				console.log('缓存中未找到分类列表，正在查询...');
				// 获取Discussions分类列表
				const categoriesResult = await this.state.octokit.graphql(`
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

				categories = categoriesResult.repository.discussionCategories.edges.map(edge => edge.node);

				// 保存到本地存储（供其他页面使用）
				try {
					localStorage.setItem(cacheKey, JSON.stringify(categories));
					console.log('已保存Discussions分类列表到缓存');
				} catch (error) {
					console.warn('保存分类列表到缓存失败:', error);
				}
			}

			// 找到Announcements分类
			let categoryId = null;
			const announcementsCategory = categories.find(cat => cat.name === 'Announcements');
			if (announcementsCategory) {
				categoryId = announcementsCategory.id;
			} else if (categories.length > 0) {
				// 如果没有找到Announcements分类，使用第一个分类作为后备
				categoryId = categories[0].id;
				console.warn('未找到Announcements分类，使用默认分类');
			}

			if (!categoryId) {
				console.warn('无法获取讨论分类，跳过创建讨论主题');
				return;
			}

			// 创建讨论主题
			const discussionTitle = `${titlePrefix}：PR #${prNumber}`;

			await this.state.octokit.graphql(`
				mutation CreateDiscussion($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
					createDiscussion(input: {
						repositoryId: $repoId
						categoryId: $categoryId
						title: $title
						body: $body
					}) {
						discussion {
							id
							number
							title
							url
						}
					}
				}
			`, {
				repoId: repositoryId,
				categoryId: categoryId,
				title: discussionTitle,
				body: body
			});

			console.log(`已在Announcements中创建讨论主题，PR #${prNumber}`);
		} catch (error) {
			console.error('创建拒绝讨论主题失败:', error);
			// 不抛出错误，因为讨论主题创建失败不应该影响PR的拒绝操作
		}
	}

	/**
	 * 处理文件点击事件，获取并显示文件内容
	 * @param {string} filePath - 文件路径
	 */
	async handleFileClick(filePath) {
		if (!this.state.apiConfigured || !this.state.octokit) {
			alert(this.t('maintainers.errors.apiNotConfigured', 'GitHub API 未配置'));
			return;
		}

		const maintainer = this.state.selectedMaintainer;
		if (!maintainer || !maintainer.headRef) {
			console.error('无法获取文件内容：缺少 PR 信息');
			return;
		}

		try {
			// 显示加载状态
			const fileContentDisplay = this.element.querySelector('#fileContentDisplay');
			const fileContentTitle = this.element.querySelector('#fileContentTitle');
			const fileContentText = this.element.querySelector('#fileContentText');

			if (fileContentDisplay && fileContentTitle && fileContentText) {
				fileContentDisplay.style.display = 'block';
				fileContentTitle.textContent = `加载中: ${filePath}`;
				fileContentText.textContent = '正在加载文件内容...';
			}

			// 从 PR 的 head 分支获取文件内容
			const { data: fileData } = await this.state.octokit.rest.repos.getContent({
				owner: maintainer.headOwner,
				repo: maintainer.headRepo,
				path: filePath,
				ref: maintainer.headRef
			});

			// 解码 Base64 内容
			if (fileData && !Array.isArray(fileData) && fileData.content) {
				const content = decodeURIComponent(escape(atob(fileData.content.replace(/\s/g, ''))));

				if (fileContentDisplay && fileContentTitle && fileContentText) {
					fileContentTitle.textContent = filePath;
					fileContentText.textContent = content;
				}
			} else {
				throw new Error('无法获取文件内容');
			}
		} catch (error) {
			console.error('获取文件内容失败:', error);
			const fileContentTitle = this.element.querySelector('#fileContentTitle');
			const fileContentText = this.element.querySelector('#fileContentText');
			if (fileContentTitle && fileContentText) {
				fileContentTitle.textContent = `错误: ${filePath}`;
				fileContentText.textContent = `加载失败: ${error.message}`;
			}
		}
	}

	/**
	 * 标记 PR 为维护中状态
	 * @param {Object} maintainer - 维护项对象
	 */
	async markPRAsMaintaining(maintainer) {
		if (!this.state.apiConfigured || !this.state.octokit) {
			return;
		}

		try {
			const user = this.state.user;
			const owner = user.repositoryInfo.owner;
			const repo = user.repositoryInfo.repo;
			const prNumber = parseInt(maintainer.id);
			const currentUser = user.username || user.login || 'maintainer';

			// 获取PR作者（提交者）信息，如果没有提交者标签则添加
			let committerName = null;
			try {
				const pr = await this.state.octokit.rest.pulls.get({
					owner,
					repo,
					pull_number: prNumber
				});
				committerName = pr.data.user.login;
			} catch (error) {
				console.warn('获取PR信息失败:', error);
			}

			// 准备要添加的标签列表
			const labelsToAdd = ['maintaining', `m_${currentUser}`];
			if (committerName) {
				labelsToAdd.push(`c_${committerName}`);
			}

			// 添加"maintaining"标签、维护者名字标签（m_用户名）和提交者标签（c_用户名）
			try {
				await this.state.octokit.rest.issues.addLabels({
					owner,
					repo,
					issue_number: prNumber,
					labels: labelsToAdd
				});
			} catch (labelError) {
				// 如果标签不存在或添加失败，只记录警告，继续执行
				console.warn('添加标签失败（标签可能不存在）:', labelError);
			}

			console.log(`PR #${prNumber} 已标记为维护中`);
		} catch (error) {
			console.warn('标记 PR 为维护中失败:', error);
			// 不影响主流程，只记录错误
		}
	}

	/**
	 * 更新页面内容
	 */
	update() {
		const content = this.element.querySelector('.content');
		if (content) {
			content.innerHTML = `
				${this.renderMaintainerDetail()}
			`;
			// 重新绑定事件
			this.bindEvents();
		}
	}

	/**
	 * 设置加载状态
	 * @param {boolean} loading - 是否加载中
	 */
	setLoading(loading) {
		this.setState({ loading });
		this.update();
	}

}

// 注册组件
window.MaintainersPage = MaintainersPage;
