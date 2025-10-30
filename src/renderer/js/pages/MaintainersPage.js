/**
 * 维护页面组件
 * 完全组件化的维护页面
 */
class MaintainersPage extends BasePage {
	constructor(props = {}) {
		super(props);
		this.state = {
			maintainers: props.maintainers || [],
			selectedMaintainer: null,
			loading: true,
		};
	}

	render() {
		const container = document.createElement('div');
		container.className = 'dashboard';
		container.innerHTML = `
			${this.renderHeader()}
			<div class="content">
				${this.renderMaintainersList()}
				${this.renderMaintainerDetail()}
			</div>
		`;
		return container;
	}

	renderHeader() {
		return super.renderHeader('maintainers', false, null);
	}

	renderMaintainersList() {
		return `
            <div class="maintainers-list">
                <h2 data-i18n="maintainers.pendingMaintainers">待维护内容</h2>
                <div class="maintainers-grid">
                    ${this.renderMaintainerItems()}
                </div>
            </div>
        `;
	}

	renderMaintainerItems() {
		if (this.state.loading) {
			return '<div class="loading">载入中...</div>';
		}

		if (this.state.maintainers.length === 0) {
			return '<div class="empty">暂无待维护内容</div>';
		}

		return this.state.maintainers.map(maintainer => `
            <div class="maintainer-item ${maintainer.id === this.state.selectedMaintainer?.id ? 'selected' : ''}" 
                 data-maintainer-id="${maintainer.id}">
                <div class="maintainer-header">
                    <h3 class="maintainer-title">${maintainer.title}</h3>
                    <span class="maintainer-status status-${maintainer.status}">${maintainer.status}</span>
                </div>
                <div class="maintainer-actions">
                    <button class="btn btn-sm btn-primary" data-action="view" data-maintainer-id="${maintainer.id}">
                        👁 查看
                    </button>
                </div>
            </div>
        `).join('');
	}
	renderMaintainerDetail() {
		if (!this.state.selectedMaintainer) {
			return `
                <div class="review-detail">
                    <div class="empty-detail">
                        <p>请选择一个审核项目</p>
                    </div>
                </div>
            `;
		}

		const maintainer = this.state.selectedMaintainer;
		return `
            <div class="maintainer-detail">
                <div class="maintainer-detail-header">
                    <h2>${maintainer.title}</h2>
                    <div class="maintainer-detail-actions">
                        <button class="btn btn-success" data-action="approve-detail">
                            ✅ 通过审核
                        </button>
                        <button class="btn btn-danger" data-action="reject-detail">
                            ❌ 拒绝审核
                        </button>
                    </div>
                </div>
                <div class="maintainer-detail-content">
                    <div class="maintainer-info">
                        <div class="info-item">
                            <label>作者:</label>
                            <span>${maintainer.author}</span>
                        </div>
                        <div class="info-item">
                            <label>提交时间:</label>
                            <span>${maintainer.date}</span>
                        </div>
                        <div class="info-item">
                            <label>状态:</label>
                            <span class="status status-${maintainer.status}">${maintainer.status}</span>
                        </div>
                    </div>
                    <div class="maintainer-content">
                        <h3>内容预览</h3>
                        <div class="content-preview">
                            ${maintainer.content}
                        </div>
                    </div>
                    <div class="maintainer-comments">
                        <h3>评论</h3>
                        <div class="comments-list">
                            ${this.renderComments(maintainer.comments || [])}
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
				if (window.app && window.app.navigateTo) {
					window.app.navigateTo(route);
				}
			});
		});
		// 维护项目点击
		const maintainerItems = this.element.querySelectorAll('.maintainer-item');
		maintainerItems.forEach(item => {
			item.addEventListener('click', (e) => {
				const maintainerId = e.currentTarget.dataset.maintainerId;
				const maintainer = this.state.maintainers.find(m => m.id === maintainerId);

				if (maintainer) {
					this.setState({ selectedMaintainer: maintainer });
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
				const maintainerId = e.currentTarget.dataset.maintainerId;

				this.handleAction(action, maintainerId);
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

		this.handleComment(this.state.selectedMaintainer, comment);

		commentText.value = '';
	}

	updateMaintainers(maintainers) {
		this.setState({ maintainers });
		this.update();
	}

	handleApprove(maintainer) {
		console.log('维护通过', maintainer);
		// TODO: 实现审核通过逻辑
		alert(this.t('maintainers.notImplemented.approve', '维护通过功能暂未实现'));
	}

	handleReject(maintainer) {
		console.log('维护拒绝', maintainer);
		// TODO: 实现审核拒绝逻辑
		alert(this.t('maintainers.notImplemented.reject', '维护拒绝功能暂未实现'));
	}

	handleComment(maintainer, comment) {
		console.log('添加评论', maintainer, comment);
		// TODO: 实现添加评论逻辑
		alert(this.t('maintainers.notImplemented.comment', '添加评论功能暂未实现'));
	}

	setLoading(loading) {
		this.setState({ loading });
		this.update();
	}

	selectMaintainer(maintainer) {
		this.setState({ selectedMaintainer: maintainer });
		this.update();
	}
}

// 注册组件
window.MaintainersPage = MaintainersPage;
