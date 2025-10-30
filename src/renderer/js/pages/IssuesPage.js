/**
 * Issues 页面组件
 * 完全组件化的 Issues 页面，基于 GitHub Issues API
 * @class IssuesPage
 * @extends {BasePage}
 */
class IssuesPage extends BasePage {
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
			issues: [],
			selectedIssue: null,
			loading: true,
			replyText: '',
			newIssueTitle: '',
			newIssueBody: '',
			showNewIssueModal: false,
			creatingIssue: false,
			submittingComment: false,
			// 搜索和过滤
			searchQuery: '',
			filters: {
				state: 'open', // open or closed
				author: '',
				assignee: '',
				labels: [],
				milestone: '',
				sort: 'created', // created, updated, comments
				direction: 'desc' // asc or desc
			},
			// API 状态
			apiConfigured: false,
			octokit: null,
			// 邀请处理状态
			pollingInvitation: false,
			invitationPollingInterval: null
		};

		// 初始化 Octokit（如果可用）
		this.initOctokit();
	}

	/**
	 * 初始化 Octokit
	 */
	async initOctokit() {
		try {
			// 检查Octokit是否可用
			if (typeof Octokit === 'undefined') {
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
			this.state.octokit = new Octokit({ auth: token });
			this.state.apiConfigured = true;
			console.log('Octokit 初始化成功');
		} catch (error) {
			console.error('初始化 Octokit 失败:', error);
			this.state.apiConfigured = false;
		}
	}

	/**
	 * 渲染页面
	 */
	render() {
		// 检查用户是否登录
		const userInfo = window.app.getUserFromStorage();
		if (!userInfo.user) {
			const container = document.createElement('div');
			container.className = 'dashboard';
			container.innerHTML = `
				${this.renderHeader()}
				<div class="content">
					<p>请先登录</p>
				</div>
			`;
			return container;
		}

		// 创建页面容器，使用标准的 dashboard 布局
		const container = document.createElement('div');
		container.className = 'dashboard';
		container.innerHTML = `
			${this.renderHeader()}
			<div class="content">
				<div class="issues-container">
					${this.renderIssuesHeader()}
					${this.renderIssuesContent()}
				</div>
			</div>
		`;

		return container;
	}

	/**
	 * 渲染页面头部
	 * @returns {string} 头部HTML字符串
	 */
	renderHeader() {
		// 使用BasePage的renderHeader方法，保持与其他页面一致
		const userInfo = window.app.getUserFromStorage();
		return super.renderHeader('issues', true, userInfo.user);
	}

	/**
	 * 渲染 Issues 页面头部
	 */
	renderIssuesHeader() {
		return `
			<div class="issues-header">
				<h1 class="issues-title">
					<i class="icon">🐛</i>
					${this.t('issues.title', 'Issues')}
					<button class="btn btn-primary" id="newIssueBtn" style="float: right;">
						${this.t('issues.newIssue', '+ New Issue')}
					</button>
				</h1>
				
				<div class="issues-search-filters">
					<div class="search-box">
						<input 
							type="text" 
							id="searchInput" 
							class="search-input" 
							placeholder="${this.t('issues.searchPlaceholder', '🔍 Search or jump to...')}"
						/>
					</div>
					
					<div class="filters-bar">
						<button class="btn btn-secondary" id="filtersBtn">
							${this.t('issues.filters', 'Filters▼')}
						</button>
						<button class="btn btn-secondary" id="labelsBtn">
							${this.t('issues.labels', 'Labels▼')}
						</button>
						<button class="btn btn-secondary" id="sortBtn">
							${this.t('issues.sort', 'Sort▼')}
						</button>
					</div>
				</div>
				
				<div class="issues-state-tabs">
				<button class="tab-btn ${this.state.filters.state === 'open' ? 'active' : ''}" 
				        data-state="open" id="openTabBtn">
					○ ${this.t('issues.opened', 'Opened')}
				</button>
				<button class="tab-btn ${this.state.filters.state === 'closed' ? 'active' : ''}" 
				        data-state="closed" id="closedTabBtn">
					● ${this.t('issues.closed', 'Closed')}
					</button>
				</div>
			</div>
		`;
	}

	/**
	 * 渲染 Issues 内容区域
	 */
	renderIssuesContent() {
		if (this.state.loading) {
			return `<div class="issues-content"><div class="loading">${this.t("common.loading", "Loading...")}</div></div>`;
		}

		if (this.state.selectedIssue) {
			return `<div class="issues-content">${this.renderIssueDetail()}</div>`;
		}

		return `<div class="issues-content">${this.renderIssuesList()}</div>`;
	}

	/**
	 * 渲染 Issues 列表
	 */
	renderIssuesList() {
		if (this.state.issues.length === 0) {
			return `
				<div class="empty-state">
					<i class="icon">🐛</i>
					<p>${this.t('issues.noIssues', '暂无 Issues')}</p>
				</div>
			`;
		}

		const issueCards = this.state.issues.map(issue => this.renderIssueCard(issue)).join('');

		return `
			<div class="issues-list">
				${issueCards}
			</div>
			<div class="pagination">
				<span>${this.t('issues.page', '📄 Page 1')}</span>
			</div>
		`;
	}

	/**
	 * 渲染单个 Issue 卡片
	 */
	renderIssueCard(issue) {
		const labelsHtml = issue.labels.map(label => `
			<span class="label" style="background-color: #${label.color || '0366d6'}">
				🏷️ ${label.name}
			</span>
		`).join('');

		const typeIcon = issue.title.match(/\[(Bug|Feature|Documentation|Question|Configuration|Task)\]/);
		const icon = typeIcon ? typeIcon[1] === 'Bug' ? '🐛' :
			typeIcon[1] === 'Feature' ? '🎨' :
				typeIcon[1] === 'Documentation' ? '📖' :
					typeIcon[1] === 'Question' ? '❓' :
						typeIcon[1] === 'Configuration' ? '🔧' :
							typeIcon[1] === 'Task' ? '📝' : '📌' : '📌';

		return `
			<div class="issue-card" data-issue-number="${issue.number}">
				<div class="issue-icon">${icon}</div>
				<div class="issue-content">
					<div class="issue-header">
						<h3 class="issue-title">${issue.title}</h3>
						<span class="issue-meta">
							#${issue.number} ${this.t('issues.opened', 'opened')} ${this.formatTime(issue.created_at)} 
							${this.t('issues.by', 'by')} ${issue.user.login} · ${issue.comments} ${this.t('issues.comments', 'comments')}
						</span>
					</div>
					<div class="issue-body">${this.truncateText(issue.body || '', 200)}</div>
					<div class="issue-labels">${labelsHtml}</div>
				</div>
			</div>
		`;
	}

	/**
	 * 渲染 Issue 详情
	 */
	renderIssueDetail() {
		const issue = this.state.selectedIssue;

		return `
			<div class="issue-detail">
				<button class="btn btn-secondary back-btn" id="backToListBtn">
					← ${this.t('issues.backToList', 'Back to Issues')}
				</button>
				
				<div class="issue-detail-content">
					<div class="issue-detail-main">
						<h1 class="issue-detail-title">${issue.title}</h1>
						<div class="issue-detail-meta">
							<span>#${issue.number}</span>
							<span>${this.t('issues.opened', 'opened')} ${this.formatTime(issue.created_at)} ${this.t('issues.by', 'by')} ${issue.user.login} · ${issue.comments} ${this.t('issues.comments', 'comments')}</span>
						</div>
						
						<div class="issue-detail-labels">
							${issue.labels.map(label => `
								<span class="label" style="background-color: #${label.color || '0366d6'}">
									🏷️ ${label.name}
								</span>
							`).join('')}
						</div>
						
						${this.renderMarkdown(issue.body)}
						
						${this.renderInvitationActions(issue)}
						
						<div style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
							<h3>💬 ${this.t('issues.comments', 'Comments')}</h3>
						</div>
						
						${this.renderComments(issue)}
						
						${this.renderCommentEditor()}
					</div>

				</div>
			</div>
		`;
	}

	/**
	 * 渲染评论列表
	 */
	renderComments(issue) {
		// 获取评论数据
		const comments = this.state.issueComments || [];

		if (comments.length === 0) {
			return `<div class="comments-section"><p style="color: var(--text-secondary);">${this.t('issues.noComments', '暂无评论')}</p></div>`;
		}

		const commentsHtml = comments.map(comment => `
			<div class="comment">
				<div class="comment-header">
					<img src="${comment.user.avatar_url}" class="comment-avatar" />
					<span class="comment-author">${comment.user.login}</span>
					<span class="comment-time">${this.formatTime(comment.created_at)}</span>
				</div>
				<div class="comment-body">
					${this.markdownToHtml(comment.body)}
				</div>
			</div>
		`).join('');

		return `<div class="comments-section">${commentsHtml}</div>`;
	}

	/**
	 * 渲染评论编辑器
	 */
	renderCommentEditor() {
		return `
			<div class="comment-editor">
				<textarea 
					id="commentTextarea" 
					class="comment-textarea" 
					placeholder="${this.t('issues.writeComment', '💬 Write a comment')}"
				></textarea>
				<div class="comment-toolbar">
					<span class="toolbar-item">${this.t('issues.format', '🎨 Format')}</span>
					<span class="toolbar-item">${this.t('issues.attachFiles', '📎 Attach files')}</span>
				</div>
				<button class="btn btn-primary" id="submitCommentBtn">
					${this.t('issues.comment', '💬 Comment')}
				</button>
			</div>
		`;
	}

	/**
	 * 辅助方法：格式化时间
	 */
	formatTime(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now - date;
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) return this.t('issues.today', 'today');
		if (days === 1) return this.t('issues.yesterday', 'yesterday');
		if (days < 7) return `${days} ${this.t('issues.daysAgo', 'days ago')}`;
		if (days < 30) return `${Math.floor(days / 7)} ${this.t('issues.weeksAgo', 'weeks ago')}`;
		return `${Math.floor(days / 30)} ${this.t('issues.monthsAgo', 'months ago')}`;
	}

	/**
	 * 辅助方法：截断文本
	 */
	truncateText(text, maxLength) {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}

	/**
	 * 辅助方法：Markdown 转 HTML（简单实现）
	 */
	markdownToHtml(markdown) {
		if (!markdown) return '';
		// 简单的 Markdown 转换（实际应该使用专门的库）
		return markdown
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.+?)\*/g, '<em>$1</em>')
			.replace(/`(.+?)`/g, '<code>$1</code>');
	}

	/**
	 * 绑定事件
	 */
	bindEvents() {
		// 绑定 Header 事件
		this.bindHeaderEvents();

		// 绑定 Issues 列表事件
		const issueCards = this.element.querySelectorAll('.issue-card');
		issueCards.forEach(card => {
			card.addEventListener('click', () => {
				const issueNumber = card.dataset.issueNumber;
				this.selectIssue(issueNumber);
			});
		});

		// 绑定返回列表按钮
		const backBtn = this.element.querySelector('#backToListBtn');
		if (backBtn) {
			backBtn.addEventListener('click', () => {
				this.state.selectedIssue = null;
				this.state.issueComments = null;
				this.updateIssuesContent();
			});
		}

		// 绑定标签切换
		const openTabBtn = this.element.querySelector('#openTabBtn');
		const closedTabBtn = this.element.querySelector('#closedTabBtn');
		if (openTabBtn) {
			openTabBtn.addEventListener('click', () => {
				this.state.filters.state = 'open';
				this.loadIssues();
			});
		}
		if (closedTabBtn) {
			closedTabBtn.addEventListener('click', () => {
				this.state.filters.state = 'closed';
				this.loadIssues();
			});
		}

		// 绑定邀请操作按钮
		const acceptInvitationBtn = this.element.querySelector('#acceptInvitationBtn');
		if (acceptInvitationBtn) {
			acceptInvitationBtn.addEventListener('click', () => {
				this.handleAcceptInvitation();
			});
		}

		const rejectInvitationBtn = this.element.querySelector('#rejectInvitationBtn');
		if (rejectInvitationBtn) {
			rejectInvitationBtn.addEventListener('click', () => {
				this.handleRejectInvitation();
			});
		}
	}

	/**
	 * 更新 Issues 内容区域
	 */
	updateIssuesContent() {
		const container = this.element.querySelector('.issues-container');
		if (container) {
			const oldContent = container.querySelector('.issues-content');
			if (oldContent) {
				oldContent.outerHTML = this.renderIssuesContent();
				this.bindEvents();
			}
		}
	}

	/**
	 * 选择 Issue
	 */
	async selectIssue(issueNumber) {
		const issue = this.state.issues.find(i => i.number === parseInt(issueNumber));
		if (issue) {
			this.state.selectedIssue = issue;
			await this.loadIssueComments(issueNumber);
			this.updateIssuesContent();
		}
	}

	/**
	 * 加载 Issues 列表
	 */
	async loadIssues() {
		if (!this.state.apiConfigured || !this.state.octokit) {
			console.error('GitHub API 未配置');
			return;
		}

		try {
			this.state.loading = true;
			const user = this.state.user;
			if (!user || !user.repositoryInfo) {
				console.error('用户信息或仓库信息缺失');
				this.state.loading = false;
				return;
			}

			const owner = user.repositoryInfo.owner;
			const repo = user.repositoryInfo.repo;

			console.log('Fetching issues from GitHub...', { owner, repo, state: this.state.filters.state });

			const response = await this.state.octokit.rest.issues.listForRepo({
				owner,
				repo,
				state: this.state.filters.state,
				sort: this.state.filters.sort,
				direction: this.state.filters.direction
			});

			console.log('Issues loaded:', response.data.length);

			this.state.issues = response.data;
			this.state.loading = false;

			// 更新 UI
			this.updateIssuesContent();

		} catch (error) {
			console.error('加载 Issues 失败:', error);
			this.state.loading = false;
		}
	}

	/**
	 * 加载 Issue 评论
	 */
	async loadIssueComments(issueNumber) {
		if (!this.state.apiConfigured || !this.state.octokit) {
			console.error('GitHub API 未配置');
			return;
		}

		try {
			const user = this.state.user;
			if (!user || !user.repositoryInfo) {
				console.error('用户信息或仓库信息缺失');
				return;
			}

			const owner = user.repositoryInfo.owner;
			const repo = user.repositoryInfo.repo;

			const response = await this.state.octokit.rest.issues.listComments({
				owner,
				repo,
				issue_number: issueNumber
			});

			this.state.issueComments = response.data;

		} catch (error) {
			console.error('加载 Issue 评论失败:', error);
		}
	}

	/**
	 * 挂载组件
	 */
	async mount(container) {
		super.mount(container);

		console.log('IssuesPage.mount called');

		// 绑定事件
		this.bindEvents();

		// 确保Octokit初始化完成
		if (!this.state.apiConfigured) {
			console.log('Initializing Octokit...');
			await this.initOctokit();
		}

		// 异步加载数据
		console.log('Loading issues...');
		await this.loadIssues();
	}

	/**
	 * 渲染 Markdown 内容
	 */
	renderMarkdown(markdown) {
		if (!markdown) return '';

		// 简单的 Markdown 渲染
		let html = this.escapeHtml(markdown);

		// 标题
		html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
		html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
		html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

		// 粗体和斜体
		html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
		html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

		// 代码块
		html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
		html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

		// 列表
		html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
		html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

		// 换行
		html = html.replace(/\n/g, '<br>');

		return html;
	}

	/**
	 * 转义HTML
	 */
	escapeHtml(text) {
		if (!text) return '';
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	/**
	 * 渲染邀请操作按钮
	 */
	renderInvitationActions(issue) {
		// 检测是否是邀请Issue
		const isInvitation = this.isInvitationIssue(issue);

		if (!isInvitation) {
			return '';
		}

		// 检查Issue是否已关闭
		if (issue.state === 'closed') {
			return '';
		}

		// 检查当前用户是否是被邀请的人
		const isInvitedUser = this.isInvitedUser(issue);

		if (!isInvitedUser) {
			return '';
		}

		const isProcessing = this.state.pollingInvitation;
		const acceptBtnDisabled = isProcessing ? 'disabled' : '';
		const rejectBtnDisabled = isProcessing ? 'disabled' : '';

		return `
			<div class="invitation-actions" style="margin: 20px 0; padding: 20px; background: var(--bg-secondary); border-radius: 8px; border-left: 4px solid var(--primary-color);">
				<h3>🎯 ${this.t('discussions.invitation.title', '邀请操作')}</h3>
				<p>${isProcessing ? this.t('common.processing', '处理中...') : this.t('discussions.invitation.description', '你收到了角色邀请，请选择接受或拒绝')}</p>
				<div class="invitation-buttons" style="margin-top: 15px;">
					<button class="btn btn-success" id="acceptInvitationBtn" style="margin-right: 10px;" ${acceptBtnDisabled}>
						✅ ${this.t('discussions.invitation.accept', '接受邀请')}
					</button>
					<button class="btn btn-danger" id="rejectInvitationBtn" ${rejectBtnDisabled}>
						❌ ${this.t('discussions.invitation.reject', '拒绝邀请')}
					</button>
				</div>
			</div>
		`;
	}

	/**
	 * 检测是否是邀请Issue
	 */
	isInvitationIssue(issue) {
		if (!issue) return false;

		// 检查是否有role-invitation标签
		if (issue.labels && Array.isArray(issue.labels)) {
			return issue.labels.some(label => {
				if (typeof label === 'string') {
					return label === 'role-invitation';
				}
				if (label && label.name) {
					return label.name === 'role-invitation';
				}
				return false;
			});
		}

		return false;
	}

	/**
	 * 检查当前用户是否是被邀请的人
	 */
	isInvitedUser(issue) {
		if (!this.state.user) {
			return false;
		}

		const username = (this.state.user.login || this.state.user.username || '').toLowerCase();
		if (!username) {
			return false;
		}

		const title = (issue.title || '').toLowerCase();
		const body = (issue.body || '').toLowerCase();

		return title.includes(`@${username}`) || body.includes(`@${username}`);
	}

	/**
	 * 处理接受邀请
	 */
	async handleAcceptInvitation() {
		if (!this.state.selectedIssue) {
			return;
		}

		try {
			// 设置处理中状态
			this.setState({ pollingInvitation: true });
			this.updateIssuesContent();

			// 在Issue中添加评论 "ACCEPT"
			const commentText = 'ACCEPT';
			await this.addIssueComment(commentText);

			// 开始轮询检查处理状态
			this.startPollingInvitation();

		} catch (error) {
			console.error('接受邀请失败:', error);
			this.setState({ pollingInvitation: false });
			this.updateIssuesContent();
		}
	}

	/**
	 * 开始轮询邀请处理状态
	 */
	startPollingInvitation() {
		// 清除之前的轮询
		if (this.state.invitationPollingInterval) {
			clearInterval(this.state.invitationPollingInterval);
		}

		let pollCount = 0;
		const maxPolls = 60; // 最多轮询60次 (5分钟)

		this.state.invitationPollingInterval = setInterval(async () => {
			pollCount++;

			try {
				const issueNumber = this.state.selectedIssue.number;
				const updatedIssue = await this.fetchIssue(issueNumber);

				if (updatedIssue && updatedIssue.state === 'closed') {
					// Issue已关闭，处理完成
					console.log('邀请处理完成');

					// 停止轮询
					if (this.state.invitationPollingInterval) {
						clearInterval(this.state.invitationPollingInterval);
						this.setState({ invitationPollingInterval: null });
					}

					// 下载并更新权限文件
					await this.downloadAndUpdateRoleFiles();

					// 重置状态
					this.setState({
						pollingInvitation: false,
						selectedIssue: null
					});

					// 返回列表
					this.updateIssuesContent();
				}

				// 超过最大轮询次数，停止轮询
				if (pollCount >= maxPolls) {
					console.warn('邀请处理超时');
					if (this.state.invitationPollingInterval) {
						clearInterval(this.state.invitationPollingInterval);
						this.setState({ invitationPollingInterval: null });
					}
					this.setState({ pollingInvitation: false });
					this.updateIssuesContent();
				}

			} catch (error) {
				console.error('轮询邀请状态失败:', error);
			}

		}, 5000); // 每5秒轮询一次
	}

	/**
	 * 获取Issue详情
	 */
	async fetchIssue(issueNumber) {
		const user = this.state.user;
		if (!user || !user.repositoryInfo) {
			throw new Error('用户信息或仓库信息缺失');
		}

		const owner = user.repositoryInfo.owner;
		const repo = user.repositoryInfo.repo;

		const response = await this.state.octokit.rest.issues.get({
			owner,
			repo,
			issue_number: issueNumber
		});

		return response.data;
	}

	/**
	 * 下载并更新角色文件
	 */
	async downloadAndUpdateRoleFiles() {
		try {
			console.log('开始同步并更新角色文件...');

			const user = this.state.user;
			if (!user || !user.repositoryInfo) {
				throw new Error('用户信息或仓库信息缺失');
			}

			const owner = user.repositoryInfo.owner;
			const repo = user.repositoryInfo.repo;
			const username = user.login;

			// 首先同步仓库数据以确保IndexedDB中的文件是最新的
			if (window.StorageService) {
				console.log('开始同步仓库数据...');
				await window.StorageService.syncRepositoryData(
					owner,
					repo,
					user.token
				);
				console.log('仓库数据同步完成，现在从IndexedDB读取文件');
			}

			// 定义需要检查的角色文件
			const roleFiles = [
				{ path: '.github/directors.txt', role: 'director' },
				{ path: '.github/reviewers.txt', role: 'reviewer' },
				{ path: '.github/maintainers.txt', role: 'maintainer' }
			];

			// 从IndexedDB读取角色文件并检查用户是否在其中
			for (const { path, role } of roleFiles) {
				try {
					console.log(`尝试从IndexedDB读取文件: ${path}`);
					const fileContent = await window.StorageService._execute('fileCache', 'get', path);

					if (fileContent && fileContent.content) {
						console.log(`成功读取文件 ${path}，内容长度: ${fileContent.content.length}`);
						const lines = fileContent.content.split('\n');
						const usernameLower = username.toLowerCase();

						// 检查用户是否在文件中
						for (const line of lines) {
							const trimmedLine = line.trim();
							// 跳过注释和空行
							if (trimmedLine && !trimmedLine.startsWith('#')) {
								if (trimmedLine.toLowerCase() === usernameLower) {
									console.log(`在文件 ${path} 中找到用户 ${username}，角色: ${role}`);

									// 更新用户权限信息
									const updatedPermissionInfo = {
										role,
										hasPermission: true
									};

									// 更新localStorage中的用户信息
									const updatedUserInfo = {
										...user,
										permissionInfo: updatedPermissionInfo
									};
									localStorage.setItem('spcp-user', JSON.stringify(updatedUserInfo));

									// 更新app.js的状态
									if (window.app) {
										window.app.state.user = updatedUserInfo;
										window.app.state.isAuthenticated = true;
										window.app.state.userRole = role;
										window.app.state.permissionInfo = updatedPermissionInfo;
									}

									// 更新组件状态
									this.setState({
										user: updatedUserInfo,
										userRole: role
									});

									console.log('角色文件已更新');
									return; // 找到角色后立即返回
								}
							}
						}
					} else {
						console.log(`文件 ${path} 存在但内容为空`);
					}
				} catch (fileError) {
					// 文件不存在或读取失败，继续检查下一个文件
					console.log(`文件 ${path} 不存在或读取失败:`, fileError);
				}
			}

		} catch (error) {
			console.error('同步并更新角色文件失败:', error);
		}
	}

	/**
	 * 处理拒绝邀请
	 */
	async handleRejectInvitation() {
		if (!this.state.selectedIssue) {
			return;
		}

		try {
			// 在Issue中添加评论 "REJECT"
			const commentText = 'REJECT';
			await this.addIssueComment(commentText);

			// 关闭Issue并返回列表
			this.setState({ selectedIssue: null });
			this.updateIssuesContent();

		} catch (error) {
			console.error('拒绝邀请失败:', error);
		}
	}

	/**
	 * 在Issue中添加评论
	 */
	async addIssueComment(commentText) {
		if (!this.state.selectedIssue) {
			throw new Error('Issue信息无效');
		}

		const user = this.state.user;
		if (!user || !user.token) {
			throw new Error('用户未登录');
		}

		if (!user.repositoryInfo) {
			throw new Error('用户信息或仓库信息缺失');
		}

		const owner = user.repositoryInfo.owner;
		const repo = user.repositoryInfo.repo;

		// 使用 REST API 在 Issue 中添加评论
		const { data } = await this.state.octokit.rest.issues.createComment({
			owner,
			repo,
			issue_number: this.state.selectedIssue.number,
			body: commentText
		});

		return data;
	}

	/**
	 * 销毁组件
	 */
	destroy() {
		// 清除轮询
		if (this.state.invitationPollingInterval) {
			clearInterval(this.state.invitationPollingInterval);
		}
		super.destroy();
	}
}

// 注册组件
window.IssuesPage = IssuesPage;
