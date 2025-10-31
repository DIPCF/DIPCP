/**
 * 审核页面组件
 * 完全组件化的审核页面
 */
class ReviewsPage extends BasePage {
	constructor(props = {}) {
		super(props);

		// 从 localStorage 获取用户信息
		const userInfo = window.app ? window.app.getUserFromStorage() : null;

		this.state = {
			user: userInfo ? userInfo.user : null,
			reviews: props.reviews || [],
			selectedReview: null,
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
	 * 从 GitHub 获取已合并的 Pull Requests
	 */
	async loadMergedPullRequests() {
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

			console.log('从 GitHub 获取已合并的未打分 Pull Requests...', { owner, repo });

			// 获取当前用户名
			const currentUser = this.state.user.username || this.state.user.login || '';

			// 使用 GitHub 搜索 API 直接过滤：
			// 合并两个查询结果，找到最旧的
			const queries = [
				// 未打分的 PR（没有 scored 标签），且提交者不是当前用户，且维护者不是当前用户
				`is:pr is:merged -label:scored -label:c_${currentUser} -label:m_${currentUser} repo:${owner}/${repo}`,
				// 当前用户打分的 PR（有 scored 标签且有 r_用户名 标签），且提交者不是当前用户，且维护者不是当前用户
				`is:pr is:merged label:scored label:r_${currentUser} -label:c_${currentUser} -label:m_${currentUser} repo:${owner}/${repo}`
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

			console.log(`总共找到 ${allPRs.length} 个可审核的 PR`);

			// 如果没有结果，直接返回
			if (allPRs.length === 0) {
				this.setState({
					reviews: [],
					selectedReview: null
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

			// 获取 PR 评论
			let comments = [];
			try {
				const commentsResponse = await this.state.octokit.rest.issues.listComments({
					owner,
					repo,
					issue_number: prData.number
				});
				comments = commentsResponse.data.map(comment => ({
					author: comment.user.login,
					date: new Date(comment.created_at).toLocaleString(),
					content: comment.body
				}));
			} catch (error) {
				console.warn('获取 PR 评论失败:', error);
			}

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

			const oldestPR = {
				id: prData.number.toString(),
				title: prData.title,
				author: prData.user.login,
				date: new Date(prData.created_at).toLocaleString(),
				mergedDate: prData.merged_at ? new Date(prData.merged_at).toLocaleString() : null,
				status: '已合并',
				content: prData.body || '无描述',
				comments: comments,
				files: fileList,
				pr: prData,
				baseRef: prData.base.ref, // 保存 PR 的 base 分支引用，用于获取文件内容（已合并的PR从base分支获取）
				baseOwner: prData.base.repo.owner.login,
				baseRepo: prData.base.repo.name
			};

			// 更新状态，直接显示最旧的 PR
			this.setState({
				reviews: [oldestPR],
				selectedReview: oldestPR
			});

			// 如果有选中的 PR，标记为审核中
			await this.markPRAsReviewing(oldestPR);

			this.setLoading(false);

		} catch (error) {
			console.error('加载已合并的 Pull Requests 失败:', error);
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

	render() {
		const container = document.createElement('div');
		container.className = 'dashboard';
		container.innerHTML = `
			${this.renderHeader()}
			<div class="content">
				${this.renderReviewDetail()}
			</div>
		`;
		return container;
	}

	renderHeader() {
		return super.renderHeader('reviews', false, null);
	}

	renderReviewDetail() {
		// 如果没有选中的 PR，显示空状态
		if (!this.state.selectedReview) {
			if (this.state.loading) {
				return '<div class="loading" style="color: var(--text-primary); padding: 2rem; text-align: center;">载入中...</div>';
			}
			return '<div class="empty" style="color: var(--text-secondary); padding: 2rem; text-align: center;">暂无待打分内容</div>';
		}

		const review = this.state.selectedReview;
		return `
            <div class="review-detail">
				<div class="review-detail-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h2 style="margin: 0;">待打分内容</h2>
                    <button class="btn btn-sm btn-secondary" id="refreshBtn" data-action="refresh">
                        🔄 刷新
                    </button>
                </div>
                <div class="review-detail-header">
                    <h2>${review.title}</h2>
                    <div class="review-detail-actions">
                        <button class="btn btn-success" data-action="approve-detail">
                            ✅ 通过审核
                        </button>
                        <button class="btn btn-danger" data-action="reject-detail">
                            ❌ 拒绝审核
                        </button>
                    </div>
                </div>
                <div class="review-detail-content">
                    <div class="review-info">
                        <div class="info-item">
                            <label>作者:</label>
                            <span>${review.author}</span>
                        </div>
                        <div class="info-item">
                            <label>提交时间:</label>
                            <span>${review.date}</span>
                        </div>
                        ${review.mergedDate ? `
                        <div class="info-item">
                            <label>合并时间:</label>
                            <span>${review.mergedDate}</span>
                        </div>
                        ` : ''}
                        <div class="info-item">
                            <label>状态:</label>
                            <span class="status status-${review.status}">${review.status}</span>
                        </div>
                        ${review.pr ? `
                        <div class="info-item">
                            <label>GitHub 链接:</label>
                            <a href="${review.pr.html_url}" target="_blank" rel="noopener noreferrer">
                                在 GitHub 上查看
                            </a>
                        </div>
                        ` : ''}
                    </div>
                    <div class="review-content">
                        <h3>内容预览</h3>
                        <div class="content-preview">
                            ${review.content}
                        </div>
                    </div>
                    <div class="review-comments">
                        <h3>评论</h3>
                        <div class="comments-list">
                            ${this.renderComments(review.comments || [])}
                        </div>
                        <div class="comment-form">
                            <textarea placeholder="添加评论..." id="commentText"></textarea>
                            <button class="btn btn-primary" data-action="add-comment">添加评论</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
	}

	renderComments(comments) {
		if (comments.length === 0) {
			return '<div class="empty-comments">暂无评论</div>';
		}

		return comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <div class="comment-content">
                    ${comment.content}
                </div>
            </div>
        `).join('');
	}

	async mount(container) {
		super.mount(container);

		// 绑定事件
		this.bindEvents();

		// 等待 Octokit 初始化完成
		await this.initOctokit();

		// 加载 GitHub 已合并的 Pull Requests
		if (this.state.apiConfigured) {
			await this.loadMergedPullRequests();
		} else {
			// 如果 API 未配置，设置加载完成状态
			this.setLoading(false);
		}
	}

	bindEvents() {
		// 绑定Header组件的事件
		this.bindHeaderEvents();

		// 审核操作按钮
		const actionButtons = this.element.querySelectorAll('[data-action]');
		actionButtons.forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				const action = e.currentTarget.dataset.action;
				const reviewId = e.currentTarget.dataset.reviewId;

				this.handleAction(action, reviewId);
			});
		});

		// 添加评论
		const addCommentBtn = this.element.querySelector('[data-action="add-comment"]');
		if (addCommentBtn) {
			addCommentBtn.addEventListener('click', () => {
				this.handleAddComment();
			});
		}

		// 刷新按钮
		const refreshBtn = this.element.querySelector('#refreshBtn');
		if (refreshBtn) {
			refreshBtn.addEventListener('click', () => {
				this.handleRefresh();
			});
		}
	}

	/**
	 * 处理刷新操作
	 */
	async handleRefresh() {
		if (!this.state.apiConfigured || !this.state.octokit) {
			alert(this.t('reviews.errors.apiNotConfigured', 'GitHub API 未配置'));
			return;
		}

		// 更新刷新按钮状态
		const refreshBtn = this.element.querySelector('#refreshBtn');
		if (refreshBtn) {
			refreshBtn.disabled = true;
			refreshBtn.textContent = '⏳ 刷新中...';
		}

		try {
			await this.loadMergedPullRequests();
		} catch (error) {
			console.error('刷新失败:', error);
		} finally {
			// 恢复刷新按钮状态
			if (refreshBtn) {
				refreshBtn.disabled = false;
				refreshBtn.textContent = '🔄 刷新';
			}
		}
	}

	handleAction(action, reviewId) {
		const review = this.state.reviews.find(r => r.id === reviewId) || this.state.selectedReview;

		if (!review) return;

		switch (action) {
			case 'approve':
			case 'approve-detail':
				this.handleApprove(review);
				break;
			case 'reject':
			case 'reject-detail':
				this.handleReject(review);
				break;
			case 'view':
				this.setState({ selectedReview: review });
				this.update();
				break;
		}
	}

	handleAddComment() {
		const commentText = this.element.querySelector('#commentText');
		if (!commentText || !commentText.value.trim()) return;

		// 获取当前用户名
		const currentUser = this.state.user?.username || this.state.user?.login || '当前用户';

		const comment = {
			author: currentUser,
			date: new Date().toLocaleString(),
			content: commentText.value.trim()
		};

		this.handleComment(this.state.selectedReview, comment);

		commentText.value = '';
	}

	updateReviews(reviews) {
		this.setState({ reviews });
		this.update();
	}

	/**
	 * 更新页面内容
	 */
	update() {
		const content = this.element.querySelector('.content');
		if (content) {
			content.innerHTML = `
				${this.renderReviewDetail()}
			`;
			// 重新绑定事件
			this.bindEvents();
		}
	}

	handleApprove(review) {
		console.log('审核通过', review);
		// TODO: 实现审核通过逻辑
		alert(this.t('reviews.notImplemented.approve', '审核通过功能暂未实现'));
	}

	handleReject(review) {
		console.log('审核拒绝', review);
		// TODO: 实现审核拒绝逻辑
		alert(this.t('reviews.notImplemented.reject', '审核拒绝功能暂未实现'));
	}

	handleComment(review, comment) {
		console.log('添加评论', review, comment);
		// TODO: 实现添加评论逻辑
		alert(this.t('reviews.notImplemented.comment', '添加评论功能暂未实现'));
	}

	/**
	 * 标记 PR 为审核中状态
	 * @param {Object} review - 审核项对象
	 */
	async markPRAsReviewing(review) {
		if (!this.state.apiConfigured || !this.state.octokit) {
			return;
		}

		try {
			const user = this.state.user;
			const owner = user.repositoryInfo.owner;
			const repo = user.repositoryInfo.repo;
			const prNumber = parseInt(review.id);
			const currentUser = user.username || user.login || 'reviewer';

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
			const labelsToAdd = ['scored', `r_${currentUser}`];
			if (committerName) {
				labelsToAdd.push(`c_${committerName}`);
			}

			// 添加"scored"标签、审核者名字标签（r_用户名）和提交者标签（c_用户名）
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

			console.log(`PR #${prNumber} 已标记为审核中`);
		} catch (error) {
			console.warn('标记 PR 为审核中失败:', error);
			// 不影响主流程，只记录错误
		}
	}

	setLoading(loading) {
		this.setState({ loading });
		this.update();
	}

	selectReview(review) {
		this.setState({ selectedReview: review });
		this.update();
	}
}

// 注册组件
window.ReviewsPage = ReviewsPage;
