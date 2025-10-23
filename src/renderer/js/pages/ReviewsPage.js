/**
 * 审核页面组件
 * 完全组件化的审核页面
 */
class ReviewsPage extends BasePage {
	constructor(props = {}) {
		super(props);
		this.state = {
			reviews: props.reviews || [],
			selectedReview: null,
			loading: true,
			onReviewSelect: props.onReviewSelect || null,
			onApprove: props.onApprove || null,
			onReject: props.onReject || null,
			onComment: props.onComment || null
		};
	}

	render() {
		const container = document.createElement('div');
		container.className = 'reviews-container';
		container.innerHTML = `
			${this.renderHeader()}
			<main class="reviews-main">
				${this.renderReviewsList()}
				${this.renderReviewDetail()}
			</main>
		`;
		return container;
	}

	renderHeader() {
		return `
            <header class="header">
                <div class="header-left">
                    <h1>SPCP</h1>
                    <nav class="nav-menu">
                        <a href="#" class="nav-item" data-i18n="navigation.dashboard">仪表盘</a>
                        <a href="#" class="nav-item" data-i18n="navigation.projectDetail">项目详情</a>
                        <a href="#" class="nav-item active" data-i18n="navigation.reviews">审核</a>
                        <a href="#" class="nav-item" data-i18n="navigation.settings">设置</a>
                    </nav>
                </div>
                <div class="header-right">
                    <!-- 用户信息区域 -->
                </div>
            </header>
        `;
	}

	renderReviewsList() {
		return `
            <div class="reviews-list">
                <h2 data-i18n="reviews.pendingReviews">待审核内容</h2>
                <div class="reviews-grid">
                    ${this.renderReviewItems()}
                </div>
            </div>
        `;
	}

	renderReviewItems() {
		if (this.state.loading) {
			return '<div class="loading">载入中...</div>';
		}

		if (this.state.reviews.length === 0) {
			return '<div class="empty">暂无待审核内容</div>';
		}

		return this.state.reviews.map(review => `
            <div class="review-item ${review.id === this.state.selectedReview?.id ? 'selected' : ''}" 
                 data-review-id="${review.id}">
                <div class="review-header">
                    <h3 class="review-title">${review.title}</h3>
                    <span class="review-status status-${review.status}">${review.status}</span>
                </div>
                <div class="review-meta">
                    <span class="review-author">作者: ${review.author}</span>
                    <span class="review-date">${review.date}</span>
                </div>
                <div class="review-preview">
                    ${review.preview}
                </div>
                <div class="review-actions">
                    <button class="btn btn-sm btn-success" data-action="approve" data-review-id="${review.id}">
                        ✅ 通过
                    </button>
                    <button class="btn btn-sm btn-danger" data-action="reject" data-review-id="${review.id}">
                        ❌ 拒绝
                    </button>
                    <button class="btn btn-sm btn-primary" data-action="view" data-review-id="${review.id}">
                        👁 查看
                    </button>
                </div>
            </div>
        `).join('');
	}

	renderReviewDetail() {
		if (!this.state.selectedReview) {
			return `
                <div class="review-detail">
                    <div class="empty-detail">
                        <p>请选择一个审核项目</p>
                    </div>
                </div>
            `;
		}

		const review = this.state.selectedReview;
		return `
            <div class="review-detail">
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
                        <div class="info-item">
                            <label>状态:</label>
                            <span class="status status-${review.status}">${review.status}</span>
                        </div>
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

	mount(container) {
		super.mount(container);

		// 绑定事件
		this.bindEvents();
	}

	bindEvents() {
		// 导航菜单
		const navItems = this.element.querySelectorAll('.nav-item');
		navItems.forEach(item => {
			item.addEventListener('click', (e) => {
				e.preventDefault();

				// 获取导航项的数据属性或文本内容来确定路由
				const text = item.textContent.trim().toLowerCase();
				let route = '/';

				if (text.includes('dashboard') || text.includes('仪表盘')) {
					route = '/';
				} else if (text.includes('project') || text.includes('项目')) {
					route = '/project-detail';
				} else if (text.includes('review') || text.includes('审核')) {
					route = '/reviews';
				} else if (text.includes('setting') || text.includes('设置')) {
					route = '/settings';
				}

				// 使用路由器导航
				if (window.app && window.app.router) {
					window.app.router.navigateTo(route);
				}
			});
		});
		// 审核项目点击
		const reviewItems = this.element.querySelectorAll('.review-item');
		reviewItems.forEach(item => {
			item.addEventListener('click', (e) => {
				const reviewId = e.currentTarget.dataset.reviewId;
				const review = this.state.reviews.find(r => r.id === reviewId);

				if (review) {
					this.setState({ selectedReview: review });
					this.update();
				}
			});
		});

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

		const comment = {
			author: '当前用户',
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

	handleApprove(review) {
		console.log('审核通过', review);
		// TODO: 实现审核通过逻辑
		alert('审核通过功能暂未实现');
	}

	handleReject(review) {
		console.log('审核拒绝', review);
		// TODO: 实现审核拒绝逻辑
		alert('审核拒绝功能暂未实现');
	}

	handleComment(review, comment) {
		console.log('添加评论', review, comment);
		// TODO: 实现添加评论逻辑
		alert('添加评论功能暂未实现');
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
