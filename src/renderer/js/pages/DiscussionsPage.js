/**
 * 讨论页面组件
 * 完全组件化的讨论页面，基于 GitHub Discussions API
 * @class DiscussionsPage
 * @extends {BasePage}
 */
class DiscussionsPage extends BasePage {
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
			categories: [
				{
					id: 'general',
					name: 'General',
					emoji: '💬',
					description: this.t('discussions.category.general', '一般讨论'),
					collapsed: false
				},
				{
					id: 'ideas',
					name: 'Ideas',
					emoji: '💡',
					description: this.t('discussions.category.ideas', '想法和建议'),
					collapsed: false
				},
				{
					id: 'polls',
					name: 'Polls',
					emoji: '📦',
					description: this.t('discussions.category.polls', '投票'),
					collapsed: false
				},
				{
					id: 'qna',
					name: 'Q&A',
					emoji: '❓',
					description: this.t('discussions.category.qna', '问答'),
					collapsed: false
				},
				{
					id: 'show-and-tell',
					name: 'Show and tell',
					emoji: '🎨',
					description: this.t('discussions.category.showAndTell', '展示和分享'),
					collapsed: false
				},
				{
					id: 'announcements',
					name: 'Announcements',
					emoji: '📢',
					description: this.t('discussions.category.announcements', '公告'),
					collapsed: false
				}
			],
			discussions: [],
			selectedDiscussion: null,
			selectedCategory: 'general',
			loading: true,
			replyText: '',
			newDiscussionTitle: '',
			newDiscussionBody: '',
			newDiscussionCategory: 'general',
			showNewDiscussionModal: false,
			creatingDiscussion: false,
			submittingReply: false,
			// 已点赞的评论ID集合（从localStorage恢复）
			likedComments: this.loadLikedComments(),
			// 搜索和过滤
			searchQuery: '',
			sortBy: 'latest', // latest, hottest, replies
			// API 状态
			apiConfigured: false,
			octokit: null
		};

		// 初始化 Octokit（如果可用）
		this.initOctokit();
	}

	/**
	 * 从localStorage加载已点赞的评论
	 */
	loadLikedComments() {
		try {
			const saved = localStorage.getItem('discussions_liked_comments');
			if (saved) {
				const commentIds = JSON.parse(saved);
				return new Set(commentIds);
			}
		} catch (error) {
			console.error('加载已点赞评论失败:', error);
		}
		return new Set();
	}

	/**
	 * 保存已点赞的评论到localStorage
	 */
	saveLikedComments() {
		try {
			const commentIds = Array.from(this.state.likedComments);
			localStorage.setItem('discussions_liked_comments', JSON.stringify(commentIds));
		} catch (error) {
			console.error('保存已点赞评论失败:', error);
		}
	}

	/**
	 * 初始化 Octokit
	 */
	initOctokit() {
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
	 * 渲染组件
	 * @returns {HTMLElement} 渲染后的DOM元素
	 */
	render() {
		const container = document.createElement('div');
		container.className = 'dashboard';

		// 如果选择了讨论，显示详情页
		if (this.state.selectedDiscussion) {
			container.innerHTML = `
				${this.renderHeader()}
				<main class="discussions-main">
					<div class="discussion-detail-wrapper">
						${this.renderDiscussionDetail()}
					</div>
				</main>
				${this.renderNewDiscussionModal()}
			`;
		} else {
			// 否则显示讨论列表
			container.innerHTML = `
				${this.renderHeader()}
				<main class="discussions-main">
					${this.renderToolbar()}
					<div class="discussions-content">
						${this.renderCategoriesList()}
						${this.renderDiscussionsList()}
					</div>
				</main>
				${this.renderNewDiscussionModal()}
			`;
		}

		return container;
	}

	/**
	 * 渲染页面头部
	 * @returns {string} 头部HTML字符串
	 */
	renderHeader() {
		// 使用BasePage的renderHeader方法
		return super.renderHeader('discussions', true, this.state.user);
	}

	/**
	 * 渲染工具栏
	 * @returns {string} 工具栏HTML字符串
	 */
	renderToolbar() {
		const canCreateDiscussion = this.state.userRole !== 'visitor';

		return `
			<div class="discussions-toolbar">
				<div>
					<h2 class="discussions-title">${this.t('discussions.title', '💬 讨论')}</h2>
				</div>
				<div class="toolbar-actions">
					<input type="text" 
						class="search-input" 
						placeholder="${this.t('discussions.searchPlaceholder', '搜索讨论...')}" 
						id="discussionsSearch"
						value="${this.state.searchQuery}">
					<select class="sort-select" id="discussionsSort">
						<option value="latest" ${this.state.sortBy === 'latest' ? 'selected' : ''}>
							${this.t('discussions.sort.latest', '最新')}
						</option>
						<option value="hottest" ${this.state.sortBy === 'hottest' ? 'selected' : ''}>
							${this.t('discussions.sort.hottest', '最热')}
						</option>
						<option value="replies" ${this.state.sortBy === 'replies' ? 'selected' : ''}>
							${this.t('discussions.sort.replies', '最多回复')}
						</option>
					</select>
					${canCreateDiscussion ? `
						<button class="btn btn-primary" id="newDiscussionBtn">
							➕ ${this.t('discussions.newDiscussion', '新讨论')}
						</button>
					` : ''}
				</div>
			</div>
		`;
	}

	/**
	 * 渲染分类列表
	 * @returns {string} 分类列表HTML字符串
	 */
	renderCategoriesList() {
		return `
			<div class="discussions-categories">
				${this.state.categories.map(category => `
					<div class="category-section" data-category="${category.id}">
						<div class="category-header">
							<span class="category-icon">${category.emoji}</span>
							<h3 class="category-name">${category.description}</h3>
							<span class="category-toggle ${category.collapsed ? 'collapsed' : ''}" 
								data-category="${category.id}">
								${category.collapsed ? '▼' : '▲'}
							</span>
						</div>
						${category.collapsed ? '' : this.renderDiscussionsByCategory(category.id)}
					</div>
				`).join('')}
			</div>
		`;
	}

	/**
	 * 渲染特定分类下的讨论
	 * @param {string} categoryId - 分类ID
	 * @returns {string} 讨论列表HTML字符串
	 */
	renderDiscussionsByCategory(categoryId) {
		const categoryDiscussions = this.getDiscussionsByCategory(categoryId);

		if (categoryDiscussions.length === 0) {
			return `
				<div class="empty-category">
					<p>${this.t('discussions.noDiscussions', '该分类下暂无讨论')}</p>
				</div>
			`;
		}

		return `
			<div class="discussions-list" data-category="${categoryId}">
				${categoryDiscussions.map(discussion => this.renderDiscussionCard(discussion)).join('')}
			</div>
		`;
	}

	/**
	 * 获取特定分类下的讨论
	 * @param {string} categoryId - 分类ID
	 * @returns {Array} 讨论数组
	 */
	getDiscussionsByCategory(categoryId) {
		let discussions = this.state.discussions.filter(
			d => d.category === categoryId
		);

		// 应用搜索过滤
		if (this.state.searchQuery) {
			const query = this.state.searchQuery.toLowerCase();
			discussions = discussions.filter(d =>
				d.title.toLowerCase().includes(query) ||
				d.body.toLowerCase().includes(query)
			);
		}

		// 应用排序
		switch (this.state.sortBy) {
			case 'hottest':
				discussions.sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0));
				break;
			case 'replies':
				discussions.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
				break;
			case 'latest':
			default:
				discussions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
				break;
		}

		return discussions;
	}

	/**
	 * 渲染讨论列表
	 * @returns {string} 讨论列表HTML字符串
	 */
	renderDiscussionsList() {
		if (this.state.loading) {
			return `
				<div class="discussions-list-container">
					<div class="loading-state">
						<p>${this.t('common.loading', '载入中...')}</p>
					</div>
				</div>
			`;
		}

		if (this.state.discussions.length === 0) {
			return `
				<div class="discussions-list-container">
					<div class="empty-state">
						<p>${this.t('discussions.empty', '暂无讨论')}</p>
					</div>
				</div>
			`;
		}

		return `<div class="discussions-list-container"></div>`;
	}

	/**
	 * 渲染讨论卡片
	 * @param {Object} discussion - 讨论对象
	 * @returns {string} 讨论卡片HTML字符串
	 */
	renderDiscussionCard(discussion) {
		const timeAgo = this.getTimeAgo(discussion.created_at);
		const author = discussion.author || { login: 'Unknown' };

		// 检查是否有未读的@mention
		const hasUnreadMention = this.hasUnreadMentionForDiscussion(discussion);

		return `
			<div class="discussion-card ${discussion.pinned ? 'pinned' : ''} ${hasUnreadMention ? 'has-mention' : ''}" 
				data-discussion-id="${discussion.number || discussion.id}" 
				style="position: relative;">
				${discussion.pinned ? '<span class="pin-badge">📌</span>' : ''}
				${hasUnreadMention ? '<span class="mention-badge"></span>' : ''}
				<h4 class="discussion-title">${this.escapeHtml(discussion.title)}</h4>
				<div class="discussion-meta">
					<span class="discussion-author">
						👤 ${this.escapeHtml(author.login)}
					</span>
					<span class="discussion-time">${timeAgo}</span>
					<span class="discussion-replies">
						💬 ${discussion.comments_count || 0}
					</span>
				</div>
				<div class="discussion-preview">
					${this.truncateText(discussion.body || '', 100)}
				</div>
				${discussion.labels && discussion.labels.length > 0 ? `
					<div class="discussion-labels">
						${discussion.labels.map(label => `
							<span class="discussion-label">🏷️ ${this.escapeHtml(label)}</span>
						`).join('')}
					</div>
				` : ''}
			</div>
		`;
	}

	/**
	 * 检查讨论是否有该用户的未读@mention
	 * @param {Object} discussion - 讨论对象
	 * @returns {boolean} 是否有未读@mention
	 */
	hasUnreadMentionForDiscussion(discussion) {
		if (!this.state.user || !this.state.user.login) {
			return false;
		}

		try {
			const saved = localStorage.getItem('discussions_unread_mentions');
			if (saved) {
				const unreadList = JSON.parse(saved);
				return unreadList.includes(discussion.number || discussion.id);
			}
		} catch (error) {
			console.error('检查未读@mention失败:', error);
		}

		return false;
	}

	/**
	 * 渲染讨论详情
	 * @returns {string} 讨论详情HTML字符串
	 */
	renderDiscussionDetail() {
		if (!this.state.selectedDiscussion) {
			return `
				<div class="discussion-detail-container" style="display: none;">
					<div class="discussion-detail-empty">
						<p>${this.t('discussions.selectDiscussion', '请选择一个讨论查看详情')}</p>
					</div>
				</div>
			`;
		}

		const discussion = this.state.selectedDiscussion;
		const timeAgo = this.getTimeAgo(discussion.created_at);
		const author = discussion.author || { login: 'Unknown' };
		const isAuthor = this.state.user && author.login === this.state.user.login;
		// 检查是否有关闭权限（发起者或所有者）
		const canClose = isAuthor || (this.state.user && this.state.user.permissionInfo &&
			(this.state.user.permissionInfo.role === 'owner' || this.state.user.permissionInfo.role === 'director'));

		return `
			<div class="discussion-detail-container">
				<div class="discussion-detail-header">
					<button class="btn btn-sm" id="backToListBtn">
						← ${this.t('discussions.backToList', '返回讨论列表')}
					</button>
					${isAuthor ? `
						<div class="discussion-actions">
							<button class="btn btn-sm" id="editDiscussionBtn">
								✏️ ${this.t('discussions.edit', '编辑')}
							</button>
							<button class="btn btn-sm btn-danger" id="deleteDiscussionBtn">
								🗑️ ${this.t('discussions.delete', '删除')}
							</button>
						</div>
					` : ''}
					${canClose && discussion.locked !== true ? `
						<div class="discussion-actions">
							<button class="btn btn-sm btn-warning" id="closeDiscussionBtn">
								🔒 ${this.t('discussions.close', '关闭讨论')}
							</button>
						</div>
					` : ''}
					${discussion.locked ? `
						<div class="discussion-status-badge">
							<span class="badge badge-closed">🔒 ${this.t('discussions.closed', '已关闭')}</span>
						</div>
					` : ''}
				</div>
				<div class="discussion-detail-content">
					<h2 class="discussion-detail-title">
						${discussion.pinned ? '📌 ' : ''}${this.escapeHtml(discussion.title)}
					</h2>
					<div class="discussion-detail-meta">
						<span class="discussion-author">
							👤 ${this.escapeHtml(author.login)}
						</span>
						<span class="discussion-time">📅 ${timeAgo}</span>
						${discussion.upvote_count > 0 ? `
							<span class="discussion-upvotes">
								👍 ${discussion.upvote_count}
							</span>
						` : ''}
						${discussion.labels && discussion.labels.length > 0 ? `
							<div class="discussion-labels">
								${discussion.labels.map(label => `
									<span class="discussion-label">🏷️ ${this.escapeHtml(label)}</span>
								`).join('')}
							</div>
						` : ''}
						${!this.state.likedComments.has(discussion.id) ? `
							<button class="btn btn-sm" id="likeDiscussionBtn">
								👍 ${this.t('discussions.like', '点赞')}
							</button>
						` : ''}
					</div>
					<div class="discussion-detail-body">
						${this.renderMarkdown(discussion.body)}
					</div>
					<div class="discussion-detail-divider"></div>
					<div class="discussion-comments-section">
						<h3>💬 ${this.t('discussions.replies', '回复')} (${discussion.comments_count || 0})</h3>
						<div class="discussion-comments" id="discussionComments">
							${this.renderComments(discussion.comments || [])}
						</div>
						<div class="discussion-comment-form">
							<textarea 
								class="comment-input" 
								id="replyTextInput"
								placeholder="${this.t('discussions.addReply', '添加回复...')}"
								rows="4"
								${this.state.submittingReply ? 'disabled' : ''}>${this.state.replyText}</textarea>
							<button class="btn btn-primary" id="submitReplyBtn" ${this.state.submittingReply ? 'disabled' : ''}>
								${this.state.submittingReply ? this.t('common.submitting', '提交中...') : this.t('discussions.submitReply', '提交回复')}
							</button>
						</div>
					</div>
				</div>
			</div>
		`;
	}



	/**
	 * 渲染评论列表
	 * @param {Array} comments - 评论数组
	 * @returns {string} 评论列表HTML字符串
	 */
	renderComments(comments) {
		if (comments.length === 0) {
			return `
				<div class="empty-comments">
					<p>${this.t('discussions.noReplies', '暂无回复')}</p>
				</div>
			`;
		}

		return comments.map(comment => this.renderCommentCard(comment)).join('');
	}

	/**
	 * 渲染评论卡片
	 * @param {Object} comment - 评论对象
	 * @returns {string} 评论卡片HTML字符串
	 */
	renderCommentCard(comment) {
		const timeAgo = this.getTimeAgo(comment.created_at);
		const author = comment.author || comment.user || { login: 'Unknown' };
		const isAuthor = this.state.user && author.login === this.state.user.login;

		return `
			<div class="comment-card" data-comment-id="${comment.id}">
				<div class="comment-header">
					<span class="comment-author">
						👤 ${this.escapeHtml(author.login)}
					</span>
					<span class="comment-time">📅 ${timeAgo}</span>
					${isAuthor ? `
						<div class="comment-actions">
							<button class="btn btn-xs" data-action="edit-comment" data-comment-id="${comment.id}">
								✏️ ${this.t('discussions.edit', '编辑')}
							</button>
							<button class="btn btn-xs btn-danger" data-action="delete-comment" data-comment-id="${comment.id}">
								🗑️ ${this.t('discussions.delete', '删除')}
							</button>
						</div>
					` : ''}
				</div>
				<div class="comment-body">
					${this.renderMarkdown(comment.body)}
				</div>
				<div class="comment-reactions">
					${this.renderReactions(comment.reactions)}
				</div>
			</div>
		`;
	}

	/**
	 * 渲染反应统计
	 * @param {Object} reactions - 反应对象
	 * @returns {string} 反应统计HTML字符串
	 */
	renderReactions(reactions) {
		if (!reactions || Object.keys(reactions).length === 0) {
			return '';
		}

		const reactionEmojis = {
			'+1': '👍',
			'-1': '👎',
			'laugh': '😄',
			'confused': '😕',
			'heart': '❤️',
			'hooray': '🎉',
			'rocket': '🚀',
			'eyes': '👀'
		};

		const parts = [];
		for (const [type, count] of Object.entries(reactions)) {
			if (count > 0) {
				parts.push(`${reactionEmojis[type] || type} ${count}`);
			}
		}

		return parts.join(' ');
	}

	/**
	 * 渲染新讨论模态框
	 * @returns {string} 模态框HTML字符串
	 */
	renderNewDiscussionModal() {
		if (!this.state.showNewDiscussionModal) {
			return '';
		}

		return `
			<div class="modal-overlay" id="newDiscussionModal">
				<div class="modal-content">
					<div class="modal-header">
						<h3>${this.t('discussions.createNew', '创建新讨论')}</h3>
						<button class="btn-close" id="closeNewDiscussionModal">×</button>
					</div>
					<div class="modal-body">
						<div class="form-group">
							<label>${this.t('discussions.titleLabel', '标题')}</label>
							<input type="text" 
								class="form-control" 
								id="newDiscussionTitleInput"
								value="${this.escapeHtml(this.state.newDiscussionTitle)}"
								placeholder="${this.t('discussions.titlePlaceholder', '输入讨论标题...')}">
						</div>
						<div class="form-group">
							<label>${this.t('discussions.categoryLabel', '分类')}</label>
							<select class="form-control" id="newDiscussionCategoryInput">
								${this.state.categories.map(cat => `
									<option value="${cat.id}" ${cat.id === this.state.newDiscussionCategory ? 'selected' : ''}>
										${cat.emoji} ${cat.description}
									</option>
								`).join('')}
							</select>
						</div>
						<div class="form-group">
							<label>${this.t('discussions.contentLabel', '内容')}</label>
							<textarea class="form-control" 
								id="newDiscussionBodyInput"
								rows="8"
								placeholder="${this.t('discussions.contentPlaceholder', '输入讨论内容（支持Markdown格式）...')}">${this.escapeHtml(this.state.newDiscussionBody)}</textarea>
						</div>
					</div>
					<div class="modal-footer">
						<button class="btn" id="cancelNewDiscussionBtn" ${this.state.creatingDiscussion ? 'disabled' : ''}>
							${this.t('common.cancel', '取消')}
						</button>
						<button class="btn btn-primary" id="submitNewDiscussionBtn" ${this.state.creatingDiscussion ? 'disabled' : ''}>
							${this.state.creatingDiscussion ? this.t('common.submitting', '提交中...') : this.t('common.submit', '提交')}
						</button>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * 渲染 Markdown 内容
	 * @param {string} markdown - Markdown 文本
	 * @returns {string} HTML字符串
	 */
	renderMarkdown(markdown) {
		// 简单的 Markdown 渲染（可以后续集成专业的 Markdown 渲染库）
		if (!markdown) return '';

		// 转义HTML
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
	 * 挂载组件
	 * @param {HTMLElement} container - 容器元素
	 */
	mount(container) {
		super.mount(container);

		// 绑定事件
		this.bindEvents();

		// 加载讨论数据
		this.loadDiscussions();
	}

	/**
	 * 重新渲染组件（已废弃，使用局部更新方法）
	 */
	rerender() {
		console.warn('rerender() method is deprecated. Use partial update methods instead.');
		// 不再执行任何操作，防止事件监听器丢失
		return;
	}

	/**
	 * 更新讨论列表
	 */
	updateDiscussionsList() {
		const discussionsContent = this.element.querySelector('.discussions-content');
		if (discussionsContent) {
			discussionsContent.innerHTML = `
				${this.renderCategoriesList()}
				${this.renderDiscussionsList()}
			`;
			this.bindDiscussionsEvents();
		}
	}

	/**
	 * 切换到详情视图
	 */
	switchToDetailView() {
		if (!this.element) return;

		const main = this.element.querySelector('main.discussions-main');
		if (main) {
			main.innerHTML = `
				<div class="discussion-detail-wrapper">
					${this.renderDiscussionDetail()}
				</div>
			`;
		}
		this.bindEvents();
	}

	/**
	 * 切换到列表视图
	 */
	switchToListView() {
		if (!this.element) return;

		const main = this.element.querySelector('main.discussions-main');
		if (main) {
			main.innerHTML = `
				${this.renderToolbar()}
				<div class="discussions-content">
					${this.renderCategoriesList()}
					${this.renderDiscussionsList()}
				</div>
			`;
		}
		this.bindEvents();
	}

	/**
	 * 更新讨论详情
	 * 注意：现在使用完整的rerender，因为我们根据selectedDiscussion条件渲染不同的视图
	 */
	updateDiscussionDetail() {
		this.switchToDetailView();
	}

	/**
	 * 更新模态框
	 */
	updateModal() {
		let modal = this.element.querySelector('#newDiscussionModal');

		if (this.state.showNewDiscussionModal) {
			if (!modal) {
				const mainElement = this.element.querySelector('main');
				if (mainElement) {
					mainElement.insertAdjacentHTML('afterend', this.renderNewDiscussionModal());
				}
			} else {
				// 模态框已存在，更新其内容
				modal.outerHTML = this.renderNewDiscussionModal();
			}
			this.bindModalEvents();
		} else {
			if (modal) {
				modal.remove();
			}
		}
	}

	/**
	 * 绑定讨论相关事件（卡片点击等）
	 */
	bindDiscussionsEvents() {
		// 讨论卡片点击
		const discussionCards = this.element.querySelectorAll('.discussion-card');
		discussionCards.forEach(card => {
			card.addEventListener('click', (e) => {
				const discussionId = card.dataset.discussionId;
				this.selectDiscussion(discussionId);
			});
		});

		// 分类折叠/展开
		const categoryToggles = this.element.querySelectorAll('.category-toggle');
		categoryToggles.forEach(toggle => {
			toggle.addEventListener('click', (e) => {
				const categoryId = e.target.closest('.category-toggle').dataset.category;
				this.toggleCategory(categoryId);
			});
		});
	}

	/**
	 * 绑定模态框事件
	 */
	bindModalEvents() {
		// 模态框关闭
		const closeNewDiscussionModal = this.element.querySelector('#closeNewDiscussionModal');
		if (closeNewDiscussionModal) {
			closeNewDiscussionModal.addEventListener('click', () => {
				this.setState({ showNewDiscussionModal: false });
				this.updateModal();
			});
		}

		const cancelNewDiscussionBtn = this.element.querySelector('#cancelNewDiscussionBtn');
		if (cancelNewDiscussionBtn) {
			cancelNewDiscussionBtn.addEventListener('click', () => {
				this.setState({
					showNewDiscussionModal: false,
					newDiscussionTitle: '',
					newDiscussionBody: '',
					newDiscussionCategory: 'general'
				});
				this.updateModal();
			});
		}

		// 提交新讨论
		const submitNewDiscussionBtn = this.element.querySelector('#submitNewDiscussionBtn');
		if (submitNewDiscussionBtn) {
			submitNewDiscussionBtn.addEventListener('click', () => {
				this.handleCreateDiscussion();
			});
		}
	}

	/**
	 * 绑定事件
	 */
	bindEvents() {
		// 导航菜单
		this.bindHeaderEvents();

		// 工具栏
		const searchInput = this.element.querySelector('#discussionsSearch');
		if (searchInput) {
			searchInput.addEventListener('input', (e) => {
				this.setState({ searchQuery: e.target.value });
				this.updateDiscussionsList();
			});
		}

		const sortSelect = this.element.querySelector('#discussionsSort');
		if (sortSelect) {
			sortSelect.addEventListener('change', (e) => {
				this.setState({ sortBy: e.target.value });
				this.updateDiscussionsList();
			});
		}

		// 新讨论按钮
		const newDiscussionBtn = this.element.querySelector('#newDiscussionBtn');
		if (newDiscussionBtn) {
			newDiscussionBtn.addEventListener('click', () => {
				this.setState({ showNewDiscussionModal: true });
				this.updateModal();
			});
		}

		// 返回列表按钮
		const backToListBtn = this.element.querySelector('#backToListBtn');
		if (backToListBtn) {
			backToListBtn.addEventListener('click', () => {
				this.setState({ selectedDiscussion: null });
				// 切换到列表视图
				this.switchToListView();
			});
		}

		// 点赞讨论按钮
		const likeDiscussionBtn = this.element.querySelector('#likeDiscussionBtn');
		if (likeDiscussionBtn) {
			likeDiscussionBtn.addEventListener('click', () => {
				if (this.state.selectedDiscussion) {
					this.handleLikeDiscussion(this.state.selectedDiscussion.id);
				}
			});
		}

		// 关闭讨论按钮
		const closeDiscussionBtn = this.element.querySelector('#closeDiscussionBtn');
		if (closeDiscussionBtn) {
			closeDiscussionBtn.addEventListener('click', () => {
				if (this.state.selectedDiscussion) {
					this.handleCloseDiscussion();
				}
			});
		}

		// 回复提交
		const submitReplyBtn = this.element.querySelector('#submitReplyBtn');
		if (submitReplyBtn) {
			submitReplyBtn.addEventListener('click', () => {
				this.handleSubmitReply();
			});
		}


		// 评论操作
		const commentActions = this.element.querySelectorAll('[data-action]');
		commentActions.forEach(btn => {
			btn.addEventListener('click', (e) => {
				const action = btn.dataset.action;
				const commentId = btn.dataset.commentId;
				this.handleLikeComment(action, commentId);
			});
		});

		// 绑定讨论和模态框事件
		this.bindDiscussionsEvents();
	}

	/**
	 * 加载讨论数据
	 */
	async loadDiscussions() {
		// 如果用户未登录，跳转到登录页
		if (!this.state.user || !this.state.user.token) {
			console.warn('用户未登录，跳转到登录页');
			if (window.app && window.app.navigateTo) {
				window.app.navigateTo('/login');
			}
			return;
		}

		try {
			this.setState({ loading: true });

			if (!this.state.apiConfigured || !this.state.octokit) {
				throw new Error('GitHub API 未配置');
			}

			// 使用 GitHub API 加载讨论
			await this.loadDiscussionsFromGitHub();
		} catch (error) {
			console.error('加载讨论失败:', error);
			this.setState({ discussions: [], loading: false });
			this.updateDiscussionsList();
		}
	}

	/**
	 * 从 GitHub 加载讨论
	 */
	async loadDiscussionsFromGitHub() {
		try {
			// 从用户信息获取仓库信息
			const user = this.state.user;
			if (!user || !user.repositoryInfo) {
				console.warn('未配置仓库信息或用户信息');
				this.setState({ discussions: [], loading: false });
				this.updateDiscussionsList();
				return;
			}

			const owner = user.repositoryInfo.owner;
			const repo = user.repositoryInfo.repo;

			if (!owner || !repo) {
				console.warn('未配置仓库信息');
				this.setState({ discussions: [], loading: false });
				this.updateDiscussionsList();
				return;
			}

			// 使用GraphQL获取讨论列表
			const result = await this.state.octokit.graphql(`
				query GetDiscussions($owner: String!, $name: String!) {
					repository(owner: $owner, name: $name) {
						discussions(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
							edges {
								node {
									id
									number
									title
									body
									createdAt
									updatedAt
									upvoteCount
									locked
									category {
										name
									}
									author {
										login
										avatarUrl
									}
									comments {
										totalCount
									}
								}
							}
						}
					}
				}
			`, {
				owner: owner,
				name: repo
			});

			const discussions = result.repository?.discussions?.edges || [];

			// 处理GitHub返回的讨论数据
			const processedDiscussions = discussions.map(edge => {
				const discussion = edge.node;
				return {
					number: discussion.number,
					id: discussion.id,
					nodeId: discussion.id, // 保存GraphQL node ID用于mutation操作
					title: discussion.title,
					body: discussion.body,
					category: this.mapCategoryFromGitHub({ name: discussion.category?.name }),
					author: {
						login: discussion.author?.login || 'Unknown',
						avatar_url: discussion.author?.avatarUrl || ''
					},
					created_at: discussion.createdAt,
					updated_at: discussion.updatedAt,
					comments_count: discussion.comments?.totalCount || 0,
					upvote_count: discussion.upvoteCount || 0,
					locked: discussion.locked || false,
					pinned: false, // GraphQL API不支持isPinned字段
					labels: []
				};
			});

			console.log('从GitHub加载了', processedDiscussions.length, '个讨论');
			this.setState({ discussions: processedDiscussions, loading: false });
			this.updateDiscussionsList();
		} catch (error) {
			console.error('从 GitHub 加载讨论失败:', error);
			this.setState({ discussions: [], loading: false });
			this.updateDiscussionsList();
		}
	}

	/**
	 * 标记讨论为已读（从未读列表中移除）
	 * @param {Object} discussion - 讨论对象
	 */
	markDiscussionAsRead(discussion) {
		try {
			const saved = localStorage.getItem('discussions_unread_mentions');
			if (saved) {
				const unreadList = JSON.parse(saved);
				const discussionId = discussion.number || discussion.id;
				const newUnreadList = unreadList.filter(id => id !== discussionId);

				if (newUnreadList.length > 0) {
					localStorage.setItem('discussions_unread_mentions', JSON.stringify(newUnreadList));
				} else {
					localStorage.removeItem('discussions_unread_mentions');
				}

				// 更新Header的通知徽章
				if (this.headerComponent && this.headerComponent.updateNavigationItems) {
					this.headerComponent.updateNavigationItems();
				}
			}
		} catch (error) {
			console.error('标记讨论为已读失败:', error);
		}
	}

	/**
	 * 将GitHub的分类映射到我们的分类系统
	 * @param {Object} githubCategory - GitHub返回的分类对象
	 * @returns {string} 我们的分类ID
	 */
	mapCategoryFromGitHub(githubCategory) {
		if (!githubCategory) return 'general';

		// GitHub分类可能包含emoji或id
		const categoryMap = {
			'💬': 'general',
			'💡': 'ideas',
			'📦': 'polls',
			'❓': 'qna',
			'🎨': 'show-and-tell',
			'📢': 'announcements'
		};

		// 如果GitHub返回分类emoji
		if (githubCategory.emoji && categoryMap[githubCategory.emoji]) {
			return categoryMap[githubCategory.emoji];
		}

		// 如果GitHub返回分类ID
		if (githubCategory.id) {
			const idMap = {
				'general': 'general',
				'ideas': 'ideas',
				'polls': 'polls',
				'qna': 'qna',
				'show_and_tell': 'show-and-tell',
				'announcements': 'announcements'
			};
			if (idMap[githubCategory.id]) {
				return idMap[githubCategory.id];
			}
		}

		// 如果GitHub返回分类名称
		if (githubCategory.name) {
			const nameLower = githubCategory.name.toLowerCase();
			if (nameLower.includes('general')) return 'general';
			if (nameLower.includes('idea')) return 'ideas';
			if (nameLower.includes('poll')) return 'polls';
			if (nameLower.includes('q') || nameLower.includes('question')) return 'qna';
			if (nameLower.includes('show') && nameLower.includes('tell')) return 'show-and-tell';
			if (nameLower.includes('announce')) return 'announcements';
		}

		// 默认返回general
		return 'general';
	}

	/**
	 * 选择讨论
	 * @param {string|number} discussionId - 讨论ID
	 */
	async selectDiscussion(discussionId) {
		try {
			this.setState({ loading: true });

			// 查找讨论
			let discussion = this.state.discussions.find(d =>
				d.number == discussionId || d.id === discussionId
			);

			if (!discussion) {
				console.error('讨论不存在');
				return;
			}

			// 从 GitHub 加载完整讨论详情
			if (this.state.apiConfigured && this.state.octokit) {
				await this.loadDiscussionDetails(discussion);
			}

			this.setState({
				selectedDiscussion: discussion,
				loading: false
			});

			// 清除该讨论的未读标记
			this.markDiscussionAsRead(discussion);

			// 更新视图，切换到详情视图
			this.switchToDetailView();
		} catch (error) {
			console.error('选择讨论失败:', error);
			this.setState({ loading: false });
		}
	}

	/**
	 * 加载讨论详情
	 * @param {Object} discussion - 讨论对象
	 */
	async loadDiscussionDetails(discussion) {
		try {
			// 从用户信息获取仓库信息
			const user = this.state.user;
			if (!user || !user.repositoryInfo) return;

			const owner = user.repositoryInfo.owner;
			const repo = user.repositoryInfo.repo;

			if (!owner || !repo) return;

			// 使用GraphQL获取讨论详情和评论
			const result = await this.state.octokit.graphql(`
				query GetDiscussion($owner: String!, $name: String!, $number: Int!) {
					repository(owner: $owner, name: $name) {
						discussion(number: $number) {
							id
							number
							title
							body
							createdAt
							updatedAt
							upvoteCount
							locked
							category {
								name
							}
							author {
								login
								avatarUrl
							}
							comments(first: 100) {
								totalCount
								edges {
									node {
										id
										body
										createdAt
										author {
											login
											avatarUrl
										}
									}
								}
							}
						}
					}
				}
			`, {
				owner: owner,
				name: repo,
				number: discussion.number
			});

			const discussionData = result.repository?.discussion;

			if (discussionData) {
				// 保存 GraphQL nodeId（用于后续的mutation操作）
				discussion.nodeId = discussionData.id;

				// 处理评论数据
				const processedComments = discussionData.comments.edges.map(edge => ({
					id: edge.node.id,
					author: {
						login: edge.node.author?.login || 'Unknown',
						avatar_url: edge.node.author?.avatarUrl || ''
					},
					created_at: edge.node.createdAt,
					body: edge.node.body,
					reactions: {}
				}));

				discussion.comments = processedComments;
				// 更新回复数量
				discussion.comments_count = discussionData.comments.totalCount || processedComments.length;
				// 更新锁定状态
				discussion.locked = discussionData.locked || false;
			}
		} catch (error) {
			console.error('加载讨论详情失败:', error);
		}
	}


	/**
	 * 提交回复
	 */
	async handleSubmitReply() {
		const replyText = this.element.querySelector('#replyTextInput')?.value;

		if (!replyText || !replyText.trim()) {
			alert(this.t('discussions.replyEmpty', '回复内容不能为空'));
			return;
		}

		if (!this.state.selectedDiscussion) {
			return;
		}

		// 防止重复提交
		if (this.state.submittingReply) {
			return;
		}

		try {
			if (!this.state.apiConfigured || !this.state.octokit) {
				throw new Error('GitHub API 未配置');
			}

			// 设置提交中状态
			this.setState({ submittingReply: true });
			this.updateDiscussionDetail();

			await this.submitReplyToGitHub(replyText);

			// 清空输入框并重置状态
			this.setState({ replyText: '', submittingReply: false });

			// 重新加载讨论详情
			await this.selectDiscussion(this.state.selectedDiscussion.number || this.state.selectedDiscussion.id);
		} catch (error) {
			console.error('提交回复失败:', error);
			alert(this.t('discussions.replyFailed', '提交回复失败'));
			// 重置提交状态
			this.setState({ submittingReply: false });
			this.updateDiscussionDetail();
		}
	}

	/**
	 * 提交回复到 GitHub
	 * @param {string} body - 回复内容
	 */
	async submitReplyToGitHub(body) {
		// 从用户信息获取仓库信息
		const user = this.state.user;
		if (!user || !user.repositoryInfo) {
			throw new Error('未配置仓库信息');
		}

		const owner = user.repositoryInfo.owner;
		const repo = user.repositoryInfo.repo;
		const discussionId = this.state.selectedDiscussion.id;
		const discussionNumber = this.state.selectedDiscussion.number;

		// 使用GraphQL提交回复
		await this.state.octokit.graphql(`
			mutation AddDiscussionComment($discussionId: ID!, $body: String!) {
				addDiscussionComment(input: {
					discussionId: $discussionId
					body: $body
				}) {
					comment {
						id
						body
						createdAt
						author {
							login
							avatarUrl
						}
					}
				}
			}
		`, {
			discussionId: discussionId,
			body: body
		});
	}


	/**
	 * 创建新讨论
	 */
	async handleCreateDiscussion() {
		const title = this.element.querySelector('#newDiscussionTitleInput')?.value;
		const body = this.element.querySelector('#newDiscussionBodyInput')?.value;
		const category = this.element.querySelector('#newDiscussionCategoryInput')?.value;

		if (!title || !title.trim()) {
			alert(this.t('discussions.titleRequired', '标题不能为空'));
			return;
		}

		if (!body || !body.trim()) {
			alert(this.t('discussions.contentRequired', '内容不能为空'));
			return;
		}

		// 防止重复提交
		if (this.state.creatingDiscussion) {
			return;
		}

		try {
			// 设置创建中状态并更新按钮
			this.setState({ creatingDiscussion: true });
			this.updateModalButtons();

			if (!this.state.apiConfigured || !this.state.octokit) {
				throw new Error('GitHub API 未配置');
			}

			await this.createDiscussionInGitHub(title, body, category);

			// 关闭模态框并重置状态
			this.setState({
				showNewDiscussionModal: false,
				newDiscussionTitle: '',
				newDiscussionBody: '',
				newDiscussionCategory: 'general',
				creatingDiscussion: false
			});
			this.updateModal();

			// 重新加载讨论列表
			await this.loadDiscussions();
		} catch (error) {
			console.error('创建讨论失败:', error);
			alert(this.t('discussions.createFailed', '创建讨论失败'));
			// 重置创建状态并更新按钮
			this.setState({ creatingDiscussion: false });
			this.updateModalButtons();
		}
	}

	/**
	 * 更新模态框按钮状态（不刷新整个模态框）
	 */
	updateModalButtons() {
		const submitBtn = this.element.querySelector('#submitNewDiscussionBtn');
		const cancelBtn = this.element.querySelector('#cancelNewDiscussionBtn');

		if (submitBtn) {
			if (this.state.creatingDiscussion) {
				submitBtn.disabled = true;
				submitBtn.textContent = this.t('common.submitting', '提交中...');
			} else {
				submitBtn.disabled = false;
				submitBtn.textContent = this.t('common.submit', '提交');
			}
		}

		if (cancelBtn) {
			cancelBtn.disabled = this.state.creatingDiscussion;
		}
	}

	/**
	 * 在 GitHub 中创建讨论
	 * @param {string} title - 标题
	 * @param {string} body - 内容
	 * @param {string} category - 分类
	 */
	async createDiscussionInGitHub(title, body, category) {
		// 从用户信息获取仓库信息
		const user = this.state.user;
		if (!user || !user.repositoryInfo) {
			throw new Error('未配置仓库信息');
		}

		const owner = user.repositoryInfo.owner;
		const repo = user.repositoryInfo.repo;

		// 使用GraphQL创建讨论，因为REST API的discussions端点返回404
		// 首先需要获取仓库ID和分类ID
		try {
			// 获取仓库信息以获取repository ID
			const { data: repoInfo } = await this.state.octokit.rest.repos.get({
				owner,
				repo
			});

			const repositoryId = repoInfo.node_id;

			// 获取Discussions分类列表
			const categories = await this.getDiscussionCategories();

			// 找到对应的分类
			let categoryId = null;
			const categoryNameMap = {
				'general': 'General',
				'ideas': 'Ideas',
				'polls': 'Polls',
				'qna': 'Q&A',
				'show-and-tell': 'Show and tell',
				'announcements': 'Announcements'
			};

			const targetCategoryName = categoryNameMap[category] || 'General';
			const targetCategory = categories.find(c => c.name === targetCategoryName);
			categoryId = targetCategory ? targetCategory.id : categories[0].id;

			// 使用GraphQL创建讨论
			const discussion = await this.state.octokit.graphql(`
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
				title: title,
				body: body
			});

			return discussion;

		} catch (error) {
			console.error('使用GraphQL创建讨论失败:', error);
			throw new Error(`创建讨论失败: ${error.message}`);
		}
	}

	/**
	 * 获取Discussions分类列表
	 */
	async getDiscussionCategories() {
		const user = this.state.user;
		if (!user || !user.repositoryInfo) {
			throw new Error('未配置仓库信息');
		}

		const owner = user.repositoryInfo.owner;
		const repo = user.repositoryInfo.repo;

		// 使用GraphQL获取分类列表
		const result = await this.state.octokit.graphql(`
			query GetRepository($owner: String!, $name: String!) {
				repository(owner: $owner, name: $name) {
					id
					discussionCategories(first: 10) {
						edges {
							node {
								id
								name
								emoji
								description
							}
						}
					}
				}
			}
		`, {
			owner: owner,
			name: repo
		});

		return result.repository.discussionCategories.edges.map(edge => edge.node);
	}


	/**
	 * 切换分类折叠状态
	 * @param {string} categoryId - 分类ID
	 */
	toggleCategory(categoryId) {
		const categories = this.state.categories.map(cat => {
			if (cat.id === categoryId) {
				return { ...cat, collapsed: !cat.collapsed };
			}
			return cat;
		});
		this.setState({ categories });
		// 只更新该分类区域
		const categorySection = this.element.querySelector(`[data-category="${categoryId}"]`);
		if (categorySection) {
			const category = categories.find(c => c.id === categoryId);
			if (category) {
				const categoryToggle = categorySection.querySelector('.category-toggle');
				if (categoryToggle) {
					categoryToggle.textContent = category.collapsed ? '▼' : '▲';
					categoryToggle.classList.toggle('collapsed', category.collapsed);
				}
				// 更新讨论列表
				const discussionsContainer = categorySection.querySelector('.category-discussions');
				if (discussionsContainer) {
					if (category.collapsed) {
						discussionsContainer.style.display = 'none';
					} else {
						discussionsContainer.style.display = '';
						discussionsContainer.innerHTML = this.renderDiscussionsByCategory(categoryId);
						this.bindDiscussionsEvents();
					}
				}
			}
		}
	}

	/**
	 * 关闭讨论
	 */
	async handleCloseDiscussion() {
		// 使用Modal组件显示确认对话框
		const modal = new window.Modal();

		// 先将模态框挂载到body
		modal.mount(document.body);

		modal.showConfirm(
			this.t('discussions.close', '关闭讨论'),
			this.t('discussions.confirmClose', '确定要关闭这条讨论吗？'),
			async (confirmed) => {
				if (!confirmed) {
					modal.destroy();
					return;
				}

				try {
					const user = this.state.user;
					if (!user || !user.repositoryInfo) {
						throw new Error('未配置仓库信息');
					}

					const owner = user.repositoryInfo.owner;
					const repo = user.repositoryInfo.repo;
					const discussionId = this.state.selectedDiscussion.id;
					const discussionNumber = this.state.selectedDiscussion.number;

					// 使用GraphQL锁定讨论
					const result = await this.state.octokit.graphql(`
					mutation LockDiscussion($discussionId: ID!) {
						lockLockable(input: {
							lockableId: $discussionId
						}) {
							lockedRecord {
								... on Discussion {
									id
									locked
								}
							}
						}
					}
				`, {
						discussionId: discussionId
					});

					// 更新讨论状态
					const updatedDiscussion = {
						...this.state.selectedDiscussion,
						locked: true
					};

					this.setState({ selectedDiscussion: updatedDiscussion });
					this.updateDiscussionDetail();

				} catch (error) {
					console.error('关闭讨论失败:', error);
				} finally {
					// 无论成功还是失败，都销毁模态框
					modal.destroy();
				}
			}
		);
	}

	/**
	 * 点赞讨论
	 * @param {string} discussionId - 讨论ID
	 */
	async handleLikeDiscussion(discussionId) {
		try {

			if (!this.state.selectedDiscussion) {
				return;
			}

			// 使用GraphQL添加reaction到讨论
			await this.state.octokit.graphql(`
			mutation AddReaction($subjectId: ID!) {
				addReaction(input: {
					subjectId: $subjectId
					content: THUMBS_UP
				}) {
					reaction {
						content
					}
					subject {
						... on Discussion {
							id
							upvoteCount
						}
					}
				}
			}
		`, {
				subjectId: discussionId
			});

			// 更新讨论的点赞数
			const updatedDiscussion = { ...this.state.selectedDiscussion };
			updatedDiscussion.upvote_count = (updatedDiscussion.upvote_count || 0) + 1;

			// 将讨论ID添加到已点赞集合中
			const newLikedComments = new Set(this.state.likedComments);
			newLikedComments.add(discussionId);

			this.setState({
				selectedDiscussion: updatedDiscussion,
				likedComments: newLikedComments
			});

			// 保存到localStorage
			this.saveLikedComments();

			this.updateDiscussionDetail();

		} catch (error) {
			console.error('点赞失败:', error);
			alert('点赞失败');
		}
	}

	/**
	 * 点赞评论
	 * @param {string} commentId - 评论ID
	 */
	async handleLikeComment(commentId) {
		try {
			// 检查是否已经登录并配置了API
			if (!this.state.apiConfigured || !this.state.octokit) {
				alert(this.t('discussions.featureNotImplemented', '该功能尚未实现'));
				return;
			}

			if (!this.state.selectedDiscussion) {
				return;
			}

			// GitHub Discussions的评论支持添加reaction
			// 使用GraphQL添加THUMBS_UP reaction到评论
			await this.state.octokit.graphql(`
				mutation AddReactionToDiscussionComment($commentId: ID!) {
					addReaction(input: {
						subjectId: $commentId
						content: THUMBS_UP
					}) {
						reaction {
							content
						}
					}
				}
			`, {
				commentId: commentId
			});

			// 查找评论并更新其reactions
			const comments = this.state.selectedDiscussion.comments || [];
			const updatedComments = comments.map(comment => {
				if (comment.id === commentId) {
					const reactions = comment.reactions || {};
					const thumbsUpCount = reactions['+1'] || 0;
					return {
						...comment,
						reactions: {
							...reactions,
							'+1': thumbsUpCount + 1
						}
					};
				}
				return comment;
			});

			const updatedDiscussion = {
				...this.state.selectedDiscussion,
				comments: updatedComments
			};

			// 将评论ID添加到已点赞集合中
			const newLikedComments = new Set(this.state.likedComments);
			newLikedComments.add(commentId);

			this.setState({
				selectedDiscussion: updatedDiscussion,
				likedComments: newLikedComments
			});

			// 保存到localStorage
			this.saveLikedComments();

			this.updateDiscussionDetail();

		} catch (error) {
			console.error('点赞失败:', error);
			// 如果API不支持，显示提示
			alert('该评论暂不支持点赞功能');
		}
	}



	/**
	 * 删除评论
	 * @param {string} commentId - 评论ID
	 */
	handleDeleteComment(commentId) {
		// 使用Modal组件显示确认对话框
		const modal = new window.Modal();

		// 先将模态框挂载到body
		modal.mount(document.body);

		modal.showConfirm(
			this.t('discussions.delete', '删除评论'),
			this.t('discussions.confirmDeleteComment', '确定要删除这条评论吗？'),
			(confirmed) => {
				if (!confirmed) {
					modal.destroy();
					return;
				}
				alert(this.t('discussions.featureNotImplemented', '该功能尚未实现'));
				modal.destroy();
			}
		);
	}

	/**
	 * 工具方法：获取时间差
	 * @param {string} dateString - 日期字符串
	 * @returns {string} 人性化的时间字符串
	 */
	getTimeAgo(dateString) {
		const now = new Date();
		const date = new Date(dateString);
		const diff = now - date;

		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);
		const weeks = Math.floor(diff / 604800000);
		const months = Math.floor(diff / 2592000000);

		if (minutes < 1) {
			return '刚刚';
		} else if (minutes < 60) {
			return `${minutes}分钟前`;
		} else if (hours < 24) {
			return `${hours}小时前`;
		} else if (days < 7) {
			return `${days}天前`;
		} else if (weeks < 4) {
			return `${weeks}周前`;
		} else if (months < 12) {
			return `${months}个月前`;
		} else {
			return date.toLocaleDateString();
		}
	}

	/**
	 * 工具方法：转义HTML
	 * @param {string} text - 原始文本
	 * @returns {string} 转义后的文本
	 */
	escapeHtml(text) {
		if (!text) return '';
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	/**
	 * 工具方法：截断文本
	 * @param {string} text - 原始文本
	 * @param {number} maxLength - 最大长度
	 * @returns {string} 截断后的文本
	 */
	truncateText(text, maxLength = 100) {
		if (!text) return '';
		if (text.length <= maxLength) return this.escapeHtml(text);
		return this.escapeHtml(text.substring(0, maxLength)) + '...';
	}
}

// 注册组件
window.DiscussionsPage = DiscussionsPage;
