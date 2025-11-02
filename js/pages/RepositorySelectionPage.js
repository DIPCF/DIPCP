/**
 * 仓库选择页面组件
 * 允许用户选择现有仓库或创建新仓库
 * @class
 * @extends {BasePage}
 */
class RepositorySelectionPage extends BasePage {
	/**
	 * 构造函数
	 * @param {Object} props - 组件属性
	 * @param {Object} props.state - 初始状态
	 */
	constructor(props = {}) {
		super(props);
		this.state = {
			language: window.I18nService ? window.I18nService.currentLanguage : 'zh-CN',
			formData: {
				repositoryUrl: 'https://github.com/DIPCF/DIPCP',
				newRepoName: '',
				newRepoDescription: ''
			},
			loading: false,
			selectedTab: 'recent', // 'recent'、'existing' 或 'create'
			repositoryHistory: [],
			userInfo: null,
			projectsList: [], // 从 Projects.json 获取的仓库列表
			projectsLoading: false, // 是否正在加载仓库列表
			projectsError: null, // 加载错误信息
			currentLoadingItem: null, // 当前正在加载的项目项元素
			currentLoadingIndicator: null // 当前正在加载的项目项的加载指示器
		};

		// 确保主题在RepositorySelectionPage渲染时被应用
		this.initTheme();

		// 加载用户信息和仓库历史
		this.loadUserInfo();
		this.loadRepositoryHistory();
	}

	/**
	 * 初始化主题
	 */
	initTheme() {
		// 如果ThemeService存在，初始化并应用主题
		if (window.ThemeService) {
			window.ThemeService.init();
		}
	}

	/**
	 * 加载用户信息
	 */
	loadUserInfo() {
		try {
			const userInfo = localStorage.getItem('dipcp-user');
			if (userInfo) {
				this.state.userInfo = JSON.parse(userInfo);
			}
		} catch (error) {
			console.warn('加载用户信息失败:', error);
		}
	}

	/**
	 * 加载仓库历史记录
	 */
	loadRepositoryHistory() {
		try {
			const history = localStorage.getItem('dipcp-repository-history');
			if (history) {
				this.state.repositoryHistory = JSON.parse(history);
				console.log('已加载仓库历史记录:', this.state.repositoryHistory.length, '个仓库');
			}
		} catch (error) {
			console.warn('加载仓库历史记录失败:', error);
		}
	}

	/**
	 * 从 GitHub 获取 Projects.json 文件
	 * @async
	 * @param {boolean} forceReload - 是否强制重新加载
	 */
	async loadProjectsList(forceReload = false) {
		// 如果正在加载中，不重复加载
		if (this.state.projectsLoading) {
			return;
		}

		// 如果已经有数据且不是强制重新加载，则不加载
		if (!forceReload && this.state.projectsList.length > 0 && !this.state.projectsError) {
			return;
		}

		this.setState({ projectsLoading: true, projectsError: null });

		try {
			// 从 GitHub raw 内容 URL 获取文件
			const url = 'https://raw.githubusercontent.com/DIPCF/Projects/main/Projects.json';
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();

			// 验证数据格式
			if (!Array.isArray(data)) {
				throw new Error('Projects.json 格式错误：期望数组格式');
			}

			// 解析每个仓库的 owner 和 repo
			const projectsList = data.map(item => {
				const repoMatch = item.repository.match(/github\.com\/([^\/]+)\/([^\/]+)/);
				if (!repoMatch) {
					return null;
				}
				return {
					owner: repoMatch[1],
					repo: repoMatch[2],
					repository: item.repository,
					description: item.description || '',
					createdAt: item.createdAt || ''
				};
			}).filter(item => item !== null); // 过滤掉无效的条目

			this.setState({
				projectsList,
				projectsLoading: false,
				projectsError: null
			});

			// 如果当前选项卡是 existing，更新内容
			if (this.element && this.state.selectedTab === 'existing') {
				this.updateContent();
			}
		} catch (error) {
			console.error('加载 Projects.json 失败:', error);
			this.setState({
				projectsLoading: false,
				projectsError: this.escapeHtml(error.message)
			});

			// 如果当前选项卡是 existing，更新内容以显示错误
			if (this.element && this.state.selectedTab === 'existing') {
				this.updateContent();
			}
		}
	}

	/**
	 * 保存仓库到历史记录
	 * @param {Object} repoInfo - 仓库信息
	 */
	saveToHistory(repoInfo) {
		const history = [...this.state.repositoryHistory];

		// 检查是否已存在
		const existingIndex = history.findIndex(item =>
			item.owner === repoInfo.owner && item.repo === repoInfo.repo
		);

		if (existingIndex >= 0) {
			// 更新访问时间
			history[existingIndex].lastAccessed = new Date().toISOString();
		} else {
			// 添加新记录
			history.unshift({
				...repoInfo,
				lastAccessed: new Date().toISOString(),
				addedAt: new Date().toISOString()
			});
		}

		// 限制历史记录数量
		if (history.length > 10) {
			history.splice(10);
		}

		this.state.repositoryHistory = history;
		localStorage.setItem('dipcp-repository-history', JSON.stringify(history));
	}

	/**
	 * 渲染页面主容器
	 * @returns {HTMLElement} 仓库选择页面的容器元素
	 */
	render() {
		const container = document.createElement('div');
		container.className = 'repository-selection-container';
		container.innerHTML = `
			${this.renderHeader()}
			${this.renderTabs()}
			${this.renderContent()}
		`;
		return container;
	}

	/**
	 * 渲染页面头部
	 * @returns {string} 头部的HTML字符串
	 */
	renderHeader() {
		return `
            <div class="page-header">
                <h1>${this.t('repositorySelection.title', '选择仓库')}</h1>
            </div>
        `;
	}

	/**
	 * 渲染标签页
	 * @returns {string} 标签页的HTML字符串
	 */
	renderTabs() {
		return `
            <div class="tabs">
                <button class="tab-button ${this.state.selectedTab === 'recent' ? 'active' : ''}" 
                        data-tab="recent">
                    <span class="tab-icon">🕒</span>
                    <span class="tab-text">${this.t('repositorySelection.tabs.recent', '最近访问仓库')}</span>
                </button>
                <button class="tab-button ${this.state.selectedTab === 'existing' ? 'active' : ''}" 
                        data-tab="existing">
                    <span class="tab-icon">📁</span>
                    <span class="tab-text">${this.t('repositorySelection.tabs.existing', '选择现有仓库')}</span>
                </button>
                <button class="tab-button ${this.state.selectedTab === 'create' ? 'active' : ''}" 
                        data-tab="create">
                    <span class="tab-icon">➕</span>
                    <span class="tab-text">${this.t('repositorySelection.tabs.create', '创建新仓库')}</span>
                </button>
            </div>
        `;
	}

	/**
	 * 渲染内容区域
	 * @returns {string} 内容区域的HTML字符串
	 */
	renderContent() {
		if (this.state.selectedTab === 'recent') {
			return this.renderRecentRepositoryTab();
		} else if (this.state.selectedTab === 'existing') {
			return this.renderExistingRepositoryTab();
		} else {
			return this.renderCreateRepositoryTab();
		}
	}

	/**
	 * 渲染最近访问仓库标签页
	 * @returns {string} 最近访问仓库标签页的HTML字符串
	 */
	renderRecentRepositoryTab() {
		return `
            <div class="tab-content">
                ${this.renderRepositoryHistory()}
                ${this.renderRepositoryUrlInput()}
                ${this.renderContinueButton()}
            </div>
        `;
	}

	/**
	 * 渲染选择现有仓库标签页
	 * @returns {string} 现有仓库标签页的HTML字符串
	 */
	renderExistingRepositoryTab() {
		// 触发加载 Projects.json（如果还未加载，或者之前加载失败）
		if (!this.state.projectsLoading) {
			if (this.state.projectsList.length === 0 || this.state.projectsError) {
				this.loadProjectsList(!!this.state.projectsError); // 如果有错误，强制重新加载
			}
		}

		return `
            <div class="tab-content">
                ${this.renderProjectsList()}
            </div>
        `;
	}

	/**
	 * 渲染项目列表（从 Projects.json 获取）
	 * @returns {string} 项目列表的HTML字符串
	 */
	renderProjectsList() {
		if (this.state.projectsLoading) {
			return `
                <div class="repository-history">
                    <h3>${this.t('repositorySelection.existing.title', '可用仓库列表')}</h3>
                    <p class="no-history">${this.t('repositorySelection.existing.loading', '正在加载仓库列表...')}</p>
                </div>
            `;
		}

		if (this.state.projectsError) {
			return `
                <div class="repository-history">
                    <h3>${this.t('repositorySelection.existing.title', '可用仓库列表')}</h3>
                    <div class="error-message">
                        <p>${this.t('repositorySelection.existing.error', '加载失败')}: ${this.escapeHtml(this.state.projectsError)}</p>
                        <button class="retry-btn" id="retry-load-projects">${this.t('repositorySelection.existing.retry', '重试')}</button>
                    </div>
                </div>
            `;
		}

		if (this.state.projectsList.length === 0) {
			return `
                <div class="repository-history">
                    <h3>${this.t('repositorySelection.existing.title', '可用仓库列表')}</h3>
                    <p class="no-history">${this.t('repositorySelection.existing.empty', '暂无可用仓库')}</p>
                </div>
            `;
		}

		const projectItems = this.state.projectsList.map((project, index) => `
            <div class="history-item clickable" data-owner="${this.escapeHtmlAttribute(project.owner)}" data-repo="${this.escapeHtmlAttribute(project.repo)}" data-url="${this.escapeHtmlAttribute(project.repository)}">
                <div class="repo-info">
                    <h4>${this.escapeHtml(project.owner)}/${this.escapeHtml(project.repo)}</h4>
                    <p class="repo-description">${this.escapeHtml(project.description || this.t('repositorySelection.existing.noDescription', '无描述'))}</p>
                    ${project.createdAt ? `<p class="last-accessed">${this.t('repositorySelection.existing.createdAt', '创建时间')}: ${this.escapeHtml(this.formatDate(project.createdAt))}</p>` : ''}
                </div>
            </div>
        `).join('');

		return `
            <div class="repository-history">
                <div class="repository-history-header">
                    <h3>${this.t('repositorySelection.existing.title', '可用仓库列表')}</h3>
                    <button class="refresh-btn" id="refresh-projects-btn" title="${this.tAttr('common.refresh', '刷新')}">
                        <span class="refresh-icon">🔄</span>
                    </button>
                </div>
                <div class="history-list">
                    ${projectItems}
                </div>
            </div>
        `;
	}

	/**
	 * 渲染仓库历史记录
	 * @returns {string} 仓库历史记录的HTML字符串
	 */
	renderRepositoryHistory() {
		if (this.state.repositoryHistory.length === 0) {
			return `
                <div class="repository-history">
                    <h3>${this.t('repositorySelection.history.title', '最近访问的仓库')}</h3>
                    <p class="no-history">${this.t('repositorySelection.history.empty', '暂无历史记录')}</p>
                </div>
            `;
		}

		const historyItems = this.state.repositoryHistory.map(repo => `
            <div class="history-item clickable" data-owner="${this.escapeHtmlAttribute(repo.owner)}" data-repo="${this.escapeHtmlAttribute(repo.repo)}">
                <div class="repo-info">
                    <h4>${this.escapeHtml(repo.owner)}/${this.escapeHtml(repo.repo)}</h4>
                    <p class="repo-description">${this.escapeHtml(repo.description || this.t('repositorySelection.history.noDescription', '无描述'))}</p>
                    <p class="last-accessed">${this.t('repositorySelection.history.lastAccessed', '最后访问')}: ${this.escapeHtml(this.formatDate(repo.lastAccessed))}</p>
                </div>
            </div>
        `).join('');

		return `
            <div class="repository-history">
                <h3>${this.t('repositorySelection.history.title', '最近访问的仓库')}</h3>
                <div class="history-list">
                    ${historyItems}
                </div>
            </div>
        `;
	}

	/**
	 * 渲染仓库URL输入
	 * @returns {string} 仓库URL输入的HTML字符串
	 */
	renderRepositoryUrlInput() {
		return `
            <div class="repository-url-input">
                <h3>${this.t('repositorySelection.urlInput.title', '或输入仓库地址')}</h3>
                <div class="form-group">
                    <label for="repository-url">${this.t('repositorySelection.urlInput.label', 'GitHub仓库URL')}</label>
                    <input type="url" id="repository-url" 
                        placeholder="${this.tAttr('repositorySelection.urlInput.placeholder', 'https://github.com/owner/repo')}" 
                        value="${this.escapeHtmlAttribute(this.state.formData.repositoryUrl)}">
                    <p class="help-text">${this.t('repositorySelection.urlInput.help', '请输入完整的GitHub仓库地址')}</p>
                </div>
            </div>
        `;
	}

	/**
	 * 渲染创建仓库标签页
	 * @returns {string} 创建仓库标签页的HTML字符串
	 */
	renderCreateRepositoryTab() {
		return `
            <div class="tab-content">
                <div class="create-repository-form">
                    <h3>${this.t('repositorySelection.create.title', '创建新仓库')}</h3>
                    <div class="form-group">
                        <label for="new-repo-owner">${this.t('repositorySelection.create.ownerLabel', '仓库所有者')}</label>
                        <input type="text" id="new-repo-owner" 
                            placeholder="${this.tAttr('repositorySelection.create.ownerPlaceholder', '用户名或组织名，留空则在个人账户下创建')}" 
                            value="${this.escapeHtmlAttribute(this.state.formData.newRepoOwner || '')}">
                    </div>
                    <div class="form-group">
                        <label for="new-repo-name">${this.t('repositorySelection.create.nameLabel', '仓库名称')}</label>
                        <input type="text" id="new-repo-name" 
                            placeholder="${this.tAttr('repositorySelection.create.namePlaceholder', '英文数字，100字符以内')}" 
                            value="${this.escapeHtmlAttribute(this.state.formData.newRepoName)}" required>
                    </div>
                    <div class="form-group">
                        <label for="new-repo-description">${this.t('repositorySelection.create.descriptionLabel', '仓库描述')}</label>
                        <textarea id="new-repo-description" 
                            placeholder="${this.tAttr('repositorySelection.create.descriptionPlaceholder', '仓库的简短描述，350字符以内')}" 
                            rows="3">${this.escapeHtml(this.state.formData.newRepoDescription)}</textarea>
                    </div>
                </div>
                ${this.renderContinueButton()}
            </div>
        `;
	}

	/**
	 * 渲染继续按钮
	 * @returns {string} 继续按钮的HTML字符串
	 */
	renderContinueButton() {
		const loadingClass = this.state.loading ? 'loading' : '';
		const disabledAttr = this.state.loading ? 'disabled' : '';

		return `
            <div class="continue-button-container">
                <button id="continue-btn" class="btn btn-primary ${loadingClass}" ${disabledAttr}>
                    <span class="btn-text">${this.state.loading ? this.t('repositorySelection.continue.loading', '处理中...') : this.t('repositorySelection.continue.button', '继续')}</span>
                </button>
            </div>
        `;
	}

	/**
	 * 挂载组件到DOM
	 * @param {HTMLElement} element - 挂载的容器元素
	 */
	mount(element) {
		this.element = element;
		this.element.innerHTML = '';
		this.element.appendChild(this.render());
		this.bindEvents();
	}

	/**
	 * 绑定事件监听器
	 */
	bindEvents() {
		// 标签页切换
		const tabButtons = this.element.querySelectorAll('.tab-button');
		tabButtons.forEach(button => {
			button.addEventListener('click', (e) => {
				// 如果正在处理中，阻止切换选项卡
				if (this.state.loading || button.disabled) {
					return;
				}

				const tab = e.currentTarget.dataset.tab;
				this.setState({ selectedTab: tab });
				// 更新选项卡样式
				this.updateTabsActiveState();
				// 更新内容区域
				this.updateContent();
			});
		});

		// 历史记录和项目列表选择（整个区域可点击）
		const historyItems = this.element.querySelectorAll('.history-item.clickable');
		historyItems.forEach(item => {
			item.addEventListener('click', async (e) => {
				// 如果正在加载，阻止重复点击
				if (this.state.loading) {
					return;
				}

				// 检查元素是否已被禁用
				if (item.style.pointerEvents === 'none') {
					return;
				}

				const owner = item.dataset.owner;
				const repo = item.dataset.repo;
				const url = item.dataset.url; // 项目列表中的项有 data-url 属性

				// 构建仓库URL
				const repositoryUrl = url || `https://github.com/${owner}/${repo}`;

				// 设置仓库URL到表单数据
				this.setState({
					formData: {
						...this.state.formData,
						repositoryUrl: repositoryUrl
					}
				});

				// 高亮选中的项
				const allItems = this.element.querySelectorAll('.history-item');
				allItems.forEach(i => {
					i.classList.remove('selected');
					if (i.dataset.owner === owner && i.dataset.repo === repo) {
						i.classList.add('selected');
					}
				});

				// 先改变点击项目的光标状态为等待
				item.style.cursor = 'wait';
				item.style.opacity = '1'; // 恢复点击项的不透明度，让它更突出

				// 在当前项目项中显示加载状态
				const loadingIndicator = document.createElement('span');
				loadingIndicator.className = 'loading-indicator';
				loadingIndicator.textContent = '⏳ ' + this.t('repositorySelection.continue.loading', '处理中...');
				loadingIndicator.style.marginLeft = '10px';
				loadingIndicator.style.color = 'var(--primary-color, #0366d6)';
				loadingIndicator.style.fontWeight = 'bold';
				const repoInfo = item.querySelector('.repo-info');
				if (repoInfo) {
					repoInfo.appendChild(loadingIndicator);
				}

				// 保存当前加载的项目项和指示器引用，以便在同步进度中更新
				this.setState({
					currentLoadingItem: item,
					currentLoadingIndicator: loadingIndicator
				});

				// 禁用所有可点击项，防止重复点击（但要排除当前点击的项目项，保持其可交互以显示等待光标）
				const allClickableItems = this.element.querySelectorAll('.history-item.clickable');
				allClickableItems.forEach(i => {
					if (i !== item) {
						i.style.pointerEvents = 'none';
						i.style.cursor = 'not-allowed';
						i.style.opacity = '0.6';
					}
				});

				// 在整个文档或容器上设置等待光标，确保鼠标悬停时显示
				const container = this.element.closest('.dashboard') || this.element;
				if (container) {
					container.style.cursor = 'wait';
				}

				// 禁用选项卡按钮
				this.disableTabButtons(true);

				// 直接打开项目详情页
				try {
					await this.handleExistingRepository();
				} catch (error) {
					console.error('打开项目失败:', error);
					this.showError(error.message);

					// 移除加载指示器
					loadingIndicator.remove();

					// 恢复容器光标
					const container = this.element.closest('.dashboard') || this.element;
					if (container) {
						container.style.cursor = '';
					}

					// 出错时恢复所有可点击项的状态
					const allClickableItems = this.element.querySelectorAll('.history-item.clickable');
					allClickableItems.forEach(i => {
						i.style.pointerEvents = '';
						i.style.cursor = '';
						i.style.opacity = '';
					});

					// 恢复选项卡按钮
					this.disableTabButtons(false);
				}
				// 注意：如果成功，会导航到其他页面，所以不需要恢复状态
			});
		});

		// 重试加载 Projects.json 按钮
		const retryBtn = this.element.querySelector('#retry-load-projects');
		if (retryBtn) {
			retryBtn.addEventListener('click', () => {
				this.setState({ projectsList: [], projectsError: null });
				this.loadProjectsList(true); // 强制重新加载
			});
		}

		// 刷新项目列表按钮
		const refreshBtn = this.element.querySelector('#refresh-projects-btn');
		if (refreshBtn) {
			refreshBtn.addEventListener('click', () => {
				// 如果正在处理中，阻止刷新
				if (this.state.loading || refreshBtn.disabled) {
					return;
				}
				this.loadProjectsList(true); // 强制重新加载
			});
		}

		// 继续按钮
		const continueBtn = this.element.querySelector('#continue-btn');
		if (continueBtn) {
			continueBtn.addEventListener('click', () => {
				this.handleContinue();
			});
		}

		// 表单输入
		const inputs = this.element.querySelectorAll('input, textarea, select');
		inputs.forEach(input => {
			input.addEventListener('input', (e) => {
				let fieldName = e.target.id.replace('new-repo-', '').replace('repository-', '');
				if (fieldName === 'url') fieldName = 'repositoryUrl';
				if (fieldName === 'name') fieldName = 'newRepoName';
				if (fieldName === 'description') fieldName = 'newRepoDescription';
				if (fieldName === 'owner') fieldName = 'newRepoOwner';
				this.state.formData[fieldName] = e.target.value;
			});
		});
	}

	/**
	 * 更新内容区域
	 */
	updateContent() {
		const contentContainer = this.element.querySelector('.tab-content');
		if (contentContainer) {
			contentContainer.innerHTML = this.renderContent();
			this.bindEvents();
			// 内容更新后也同步一次tab按钮的active状态
			this.updateTabsActiveState();
		}
	}

	/**
	 * 更新选项卡按钮的激活样式
	 */
	updateTabsActiveState() {
		if (!this.element) return;
		const tabButtons = this.element.querySelectorAll('.tab-button');
		tabButtons.forEach(btn => {
			const isActive = btn.dataset.tab === this.state.selectedTab;
			btn.classList.toggle('active', !!isActive);
		});
	}

	/**
	 * 从历史记录选择仓库
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 */
	selectRepositoryFromHistory(owner, repo) {
		const repositoryUrl = `https://github.com/${owner}/${repo}`;
		this.setState({
			formData: {
				...this.state.formData,
				repositoryUrl: repositoryUrl
			}
		});

		// 更新输入框值
		const urlInput = this.element.querySelector('#repository-url');
		if (urlInput) {
			urlInput.value = repositoryUrl;
		}

		// 高亮选中的历史记录项
		const historyItems = this.element.querySelectorAll('.history-item');
		historyItems.forEach(item => {
			item.classList.remove('selected');
			if (item.dataset.owner === owner && item.dataset.repo === repo) {
				item.classList.add('selected');
			}
		});
	}

	/**
	 * 从项目列表选择仓库
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} url - 仓库完整 URL
	 */
	selectRepositoryFromProjects(owner, repo, url) {
		this.setState({
			formData: {
				...this.state.formData,
				repositoryUrl: url
			}
		});

		// 更新输入框值
		const urlInput = this.element.querySelector('#repository-url');
		if (urlInput) {
			urlInput.value = url;
		}

		// 高亮选中的项目项
		const projectItems = this.element.querySelectorAll('.history-item');
		projectItems.forEach(item => {
			item.classList.remove('selected');
			if (item.dataset.owner === owner && item.dataset.repo === repo) {
				item.classList.add('selected');
			}
		});
	}

	/**
	 * 处理继续操作
	 * @async
	 */
	async handleContinue() {
		if (this.state.loading) return;

		try {
			this.setState({ loading: true });
			this.updateContinueButtonState('loading', this.t('repositorySelection.continue.loading', '处理中...'));
			// 禁用选项卡按钮
			this.disableTabButtons(true);

			if (this.state.selectedTab === 'existing' || this.state.selectedTab === 'recent') {
				await this.handleExistingRepository();
			} else {
				await this.handleCreateRepository();
			}
		} catch (error) {
			this.showError(error.message);
			this.updateContinueButtonState('default', this.t('repositorySelection.continue.button', '继续'));
			// 恢复选项卡按钮
			this.disableTabButtons(false);
		} finally {
			this.setState({ loading: false });
		}
	}

	/**
	 * 处理现有仓库
	 * @async
	 */
	async handleExistingRepository() {
		const repositoryUrl = this.state.formData.repositoryUrl;

		if (!repositoryUrl) {
			throw new Error(this.t('repositorySelection.errors.noUrl', '请输入仓库地址'));
		}

		// 解析仓库信息
		const repoInfo = this.parseGitHubUrl(repositoryUrl);
		if (!repoInfo) {
			throw new Error(this.t('repositorySelection.errors.invalidUrl', '无效的GitHub仓库URL'));
		}

		// 检查仓库类型（必须是组织仓库）
		const isOrgRepo = await this.checkRepositoryType(repoInfo.owner, repoInfo.repo);
		if (!isOrgRepo) {
			throw new Error(this.t('repositorySelection.errors.personalRepo', '此应用仅支持组织仓库'));
		}

		// 检查用户权限
		const permissionInfo = await this.checkUserPermissions(repoInfo.owner, repoInfo.repo);

		// 更新用户信息
		this.updateUserInfo(repoInfo, permissionInfo);

		// 检查是否需要签署CLA和设置仓库
		const roles = permissionInfo.roles || (permissionInfo.role ? [permissionInfo.role] : ['visitor']);
		if (roles.includes('owner')) {
			await this.showCLAAgreement(repoInfo, this.state.userInfo, async () => {
				// CLA签署成功后的回调：执行仓库设置
				// 从localStorage获取CLA签署时间
				const userInfoStr = localStorage.getItem('dipcp-user');
				let claSignedTime = new Date().toISOString(); // 默认使用当前时间
				if (userInfoStr) {
					try {
						const userInfo = JSON.parse(userInfoStr);
						if (userInfo.claSignedAt) {
							claSignedTime = userInfo.claSignedAt;
							console.log('✅ [handleContinue] 使用CLA签署时间:', claSignedTime);
						}
					} catch (e) {
						console.warn('解析用户信息失败，使用当前时间:', e);
					}
				}
				await this.setupRepository(repoInfo.owner, repoInfo.repo, this.state.userInfo.token, claSignedTime);
			});
		}

		// 无论是否为所有者，都通过proceedToProject来保存历史记录和跳转
		await this.proceedToProject(repoInfo);
	}

	/**
	 * 处理创建仓库
	 * @async
	 */
	async handleCreateRepository() {
		console.log('🔵 [handleCreateRepository] 开始处理创建仓库请求');
		const { newRepoName, newRepoDescription, newRepoOwner } = this.state.formData;
		console.log('🔵 [handleCreateRepository] 表单数据:', { newRepoName, newRepoDescription, newRepoOwner });

		if (!newRepoName) {
			throw new Error(this.t('repositorySelection.errors.noRepoName', '请输入仓库名称'));
		}

		// 验证仓库名称
		console.log('🔵 [handleCreateRepository] 验证仓库名称...');
		this.validateRepositoryName(newRepoName);

		// 组织名必填，且不支持个人仓库
		if (!newRepoOwner || newRepoOwner.trim().length === 0) {
			throw new Error(this.t('repositorySelection.errors.ownerRequired', '请输入组织名'));
		}

		// 验证仓库描述
		console.log('🔵 [handleCreateRepository] 验证仓库描述...');
		this.validateRepositoryDescription(newRepoDescription);

		// 先显示CLA，同意后才创建仓库
		console.log('🔵 [handleCreateRepository] 准备显示CLA协议...');
		// 构建临时的仓库信息对象用于CLA显示（此时仓库尚未创建）
		const tempRepoInfo = {
			owner: newRepoOwner,
			repo: newRepoName,
			description: newRepoDescription
		};

		await this.showCLAAgreement(tempRepoInfo, this.state.userInfo, async () => {
			console.log('✅ [CLA Callback] CLA签署成功，开始创建仓库...');
			try {
				// 从localStorage获取CLA签署时间
				const userInfoStr = localStorage.getItem('dipcp-user');
				let claSignedTime = new Date().toISOString(); // 默认使用当前时间
				if (userInfoStr) {
					try {
						const userInfo = JSON.parse(userInfoStr);
						if (userInfo.claSignedAt) {
							claSignedTime = userInfo.claSignedAt;
							console.log('✅ [CLA Callback] 使用CLA签署时间:', claSignedTime);
						}
					} catch (e) {
						console.warn('解析用户信息失败，使用当前时间:', e);
					}
				}

				// CLA签署成功后，现在才创建仓库
				console.log('🔵 [CLA Callback] 调用createRepository创建仓库...');
				const repoInfo = await this.createRepository(newRepoName, newRepoDescription, 'public', newRepoOwner);
				console.log('✅ [CLA Callback] 仓库创建成功:', repoInfo);

				// 更新用户信息
				console.log('🔵 [CLA Callback] 更新用户信息...');
				// 仓库创建者拥有所有5种角色
				this.updateUserInfo(repoInfo, {
					roles: ['owner', 'director', 'reviewer', 'maintainer', 'collaborator'],
					hasPermission: true
				});

				// 执行仓库设置，传入CLA签署时间
				await this.setupRepository(repoInfo.owner, repoInfo.repo, this.state.userInfo.token, claSignedTime);
				console.log('✅ [CLA Callback] 仓库设置完成，准备跳转到项目页面...');
				// 设置完成后跳转到项目页面
				await this.proceedToProject(repoInfo);
				console.log('✅ [CLA Callback] 已跳转到项目页面');
			} catch (error) {
				console.error('❌ [CLA Callback] 创建仓库、设置或跳转失败:', error);
				throw error;
			}
		});
		console.log('🔵 [handleCreateRepository] CLA流程已启动');
	}

	/**
	 * 验证仓库名称
	 * @param {string} name - 仓库名称
	 * @throws {Error} 如果验证失败
	 */
	validateRepositoryName(name) {
		// 检查长度
		if (name.length > 100) {
			throw new Error(this.t('repositorySelection.errors.repoNameTooLong', '仓库名称长度不能超过100个字符'));
		}

		// 检查是否只包含英文、数字、下划线和连字符
		const validNameRegex = /^[a-zA-Z0-9_-]+$/;
		if (!validNameRegex.test(name)) {
			throw new Error(this.t('repositorySelection.errors.repoNameInvalid', '仓库名称只能包含英文字母、数字、下划线和连字符'));
		}

		// 检查是否为空
		if (name.trim().length === 0) {
			throw new Error(this.t('repositorySelection.errors.repoNameEmpty', '仓库名称不能为空'));
		}
	}

	/**
	 * 验证仓库描述
	 * @param {string} description - 仓库描述
	 * @throws {Error} 如果验证失败
	 */
	validateRepositoryDescription(description) {
		// 检查长度
		if (description && description.length > 350) {
			throw new Error(this.t('repositorySelection.errors.repoDescriptionTooLong', '仓库描述长度不能超过350个字符'));
		}
	}

	/**
	 * 检查仓库类型（是否组织仓库）
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @returns {Promise<boolean>} 是否为组织仓库
	 */
	async checkRepositoryType(owner, repo) {
		try {
			const repoInfo = await window.GitHubService.getRepo(owner, repo, false);
			return repoInfo.owner.type === 'Organization';
		} catch (error) {
			if (error.status === 404) {
				throw new Error(this.t('repositorySelection.errors.repoNotFound', '仓库不存在或不是公开仓库'));
			}
			throw error;
		}
	}

	/**
	 * 检查用户权限
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @returns {Promise<Object>} 权限信息
	 */
	async checkUserPermissions(owner, repo) {
		if (!this.state.userInfo || !this.state.userInfo.token) {
			return { roles: ['visitor'], hasPermission: false };
		}

		try {
			// 从IndexedDB读取角色文件确定用户角色
			if (!window.StorageService) {
				return { roles: ['visitor'], hasPermission: false };
			}

			await window.StorageService.initDB();
			const username = this.state.userInfo.username.toLowerCase();
			const foundRoles = [];

			// 检查所有角色文件
			const roleFiles = [
				{ path: '.github/directors.txt', role: 'director' },
				{ path: '.github/reviewers.txt', role: 'reviewer' },
				{ path: '.github/maintainers.txt', role: 'maintainer' },
				{ path: '.github/collaborators.txt', role: 'collaborator' }
			];

			for (const { path, role } of roleFiles) {
				try {
					const fileContent = await window.StorageService._execute('fileCache', 'get', path);
					if (fileContent && fileContent.content) {
						const lines = fileContent.content.split('\n');
						for (const line of lines) {
							const trimmedLine = line.trim();
							if (trimmedLine && !trimmedLine.startsWith('#')) {
								if (trimmedLine.toLowerCase() === username) {
									foundRoles.push(role);
									break;
								}
							}
						}
					}
				} catch (error) {
					// 文件不存在或读取失败，继续检查下一个文件
				}
			}

			// 如果找到角色，加上owner角色
			if (foundRoles.length > 0) {
				foundRoles.push('owner');
				return { roles: foundRoles, hasPermission: true };
			}

			return { roles: ['visitor'], hasPermission: false };
		} catch (error) {
			console.log('权限检查失败，默认为访客:', error.message);
			return { roles: ['visitor'], hasPermission: false };
		}
	}

	/**
	 * 获取仓库描述
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @returns {Promise<string>} 仓库描述
	 */
	async getRepositoryDescription(owner, repo) {
		try {
			const repoInfo = await window.GitHubService.getRepo(owner, repo, false);
			return repoInfo.description || '';
		} catch (error) {
			return '';
		}
	}

	/**
	 * 验证组织是否存在且为组织账户
	 * @async
	 * @param {string} owner - 组织名或用户名
	 * @returns {Promise<Object>} 组织信息
	 */
	async validateOwner(owner) {
		if (!owner || owner.trim() === '') {
			throw new Error(this.t('repositorySelection.errors.ownerRequired', '请输入组织名'));
		}

		// 初始化 GitHubService
		await window.GitHubService.initFromUser(this.state.userInfo);

		try {
			// 首先尝试获取用户信息
			const userData = await window.GitHubService.getUserByUsername(owner);

			// 检查是否为组织
			if (userData.type === 'Organization') {
				// 检查用户是否有权限在该组织下创建仓库
				const membership = await window.GitHubService.safeCall(async (octokit) => {
					const { data } = await octokit.rest.orgs.checkMembershipForUser({
						org: owner,
						username: this.state.userInfo.username
					});
					return data;
				});

				return {
					type: 'organization',
					login: owner,
					hasPermission: true
				};
			} else {
				// 个人用户不支持
				throw new Error(this.t('repositorySelection.errors.personalRepo', '此应用仅支持组织仓库'));
			}
		} catch (error) {
			if (error.status === 404) {
				throw new Error(this.t('repositorySelection.errors.ownerNotFound', '指定的用户或组织不存在'));
			}
			if (error.status === 403) {
				throw new Error(this.t('repositorySelection.errors.noOrgPermission', '您没有权限在该组织下创建仓库'));
			}
			throw error;
		}
	}

	/**
	 * 创建仓库
	 * @async
	 * @param {string} name - 仓库名称
	 * @param {string} description - 仓库描述
	 * @param {string} visibility - 可见性
	 * @param {string} owner - 仓库所有者
	 * @returns {Promise<Object>} 仓库信息
	 */
	async createRepository(name, description, visibility, owner = null) {
		console.log('🔵 [createRepository] 开始创建仓库:', { name, description, visibility, owner });
		if (!this.state.userInfo || !this.state.userInfo.token) {
			throw new Error(this.t('repositorySelection.errors.notLoggedIn', '请先登录'));
		}

		// 初始化 GitHubService
		await window.GitHubService.initFromUser(this.state.userInfo);

		try {
			// 验证所有者
			console.log('🔵 [createRepository] 验证所有者:', owner);
			const ownerInfo = await this.validateOwner(owner);
			console.log('✅ [createRepository] 所有者验证完成:', ownerInfo);

			let repo;

			if (ownerInfo.type === 'organization') {
				// 在组织下创建仓库
				console.log('🔵 [createRepository] 在组织下创建仓库:', ownerInfo.login);
				repo = await window.GitHubService.safeCall(async (octokit) => {
					const { data } = await octokit.rest.repos.createInOrg({
						org: ownerInfo.login,
						name,
						description,
						private: visibility === 'private',
						auto_init: true
					});
					return data;
				});
			} else {
				// 在用户个人账户下创建仓库
				console.log('🔵 [createRepository] 在用户账户下创建仓库');
				repo = await window.GitHubService.safeCall(async (octokit) => {
					const { data } = await octokit.rest.repos.createForAuthenticatedUser({
						name,
						description,
						private: visibility === 'private',
						auto_init: true
					});
					return data;
				});
			}
			console.log('✅ [createRepository] 仓库创建成功:', { owner: repo.owner.login, repo: repo.name });

			return {
				owner: repo.owner.login,
				repo: repo.name
			};
		} catch (error) {
			if (error.status === 422) {
				throw new Error(this.t('repositorySelection.errors.repoExists', '仓库名称已存在'));
			}
			if (error.status === 403) {
				throw new Error('没有权限创建仓库，请检查您的GitHub token权限');
			}
			throw error;
		}
	}

	/**
	 * 更新用户信息
	 * @param {Object} repoInfo - 仓库信息
	 * @param {Object} permissionInfo - 权限信息
	 */
	updateUserInfo(repoInfo, permissionInfo) {
		// 支持多重角色，兼容旧格式
		const roles = permissionInfo.roles || (permissionInfo.role ? [permissionInfo.role] : ['visitor']);
		const hasPermission = roles.includes('visitor') ? false : true;

		const updatedPermissionInfo = {
			...permissionInfo,
			roles: roles,
			hasPermission: hasPermission
		};

		const updatedUserInfo = {
			...this.state.userInfo,
			repositoryUrl: `https://github.com/${repoInfo.owner}/${repoInfo.repo}`,
			repositoryInfo: repoInfo,
			permissionInfo: updatedPermissionInfo
		};

		this.state.userInfo = updatedUserInfo;
		localStorage.setItem('dipcp-user', JSON.stringify(updatedUserInfo));

		// 更新app.js的状态
		if (window.app) {
			window.app.state.user = updatedUserInfo;
			window.app.state.isAuthenticated = true;
			window.app.state.userRoles = roles;
			window.app.state.userRole = roles[0] || 'visitor'; // 保持向后兼容
			window.app.state.permissionInfo = updatedPermissionInfo;
		}
	}


	/**
	 * 继续到项目页面
	 * @async
	 * @param {Object} repoInfo - 仓库信息
	 */
	async proceedToProject(repoInfo) {
		console.log('🔵 [proceedToProject] 开始跳转到项目页面:', repoInfo);
		try {
			// 开始同步文件
			console.log('🔵 [proceedToProject] 开始同步文件...');
			const syncingText = this.t('repositorySelection.syncing', '正在同步文件...');
			this.updateContinueButtonState('loading', syncingText);
			// 同时更新项目栏中的加载指示器
			this.updateLoadingIndicator(syncingText);

			// 使用StorageService同步仓库数据
			if (window.StorageService && this.state.userInfo && this.state.userInfo.token) {
				await window.StorageService.syncRepositoryData(
					repoInfo.owner,
					repoInfo.repo,
					this.state.userInfo.token,
					(progress, processed, total, error) => {
						// 更新同步进度
						if (error) {
							console.error('❌ [proceedToProject] 同步文件时出错:', error);
							const errorText = `${this.t('repositorySelection.syncError', '同步出错')}: ${this.escapeHtml(error.message)}`;
							this.updateContinueButtonState('loading', errorText);
							// 同时更新项目栏中的加载指示器
							this.updateLoadingIndicator(errorText);
						} else {
							console.log(`🔵 [proceedToProject] 同步进度: ${progress}% (${processed}/${total})`);
							const progressText = `${this.t('repositorySelection.syncing', '正在同步文件...')} ${progress}% (${processed}/${total})`;
							this.updateContinueButtonState('loading', progressText);
							// 同时更新项目栏中的加载指示器
							this.updateLoadingIndicator(progressText);
						}
					}
				);
			}

			// 同步完成
			console.log('✅ [proceedToProject] 文件同步完成');
			const successText = this.t('repositorySelection.continue.success', '处理完成！');
			this.updateContinueButtonState('success', successText);
			// 同时更新项目栏中的加载指示器
			this.updateLoadingIndicator(successText);

			// 获取并缓存Discussions分类列表（访客也需要）
			console.log('🔵 [proceedToProject] 缓存Discussions分类列表...');
			try {
				// 初始化 GitHubService（如果有token则使用，否则使用公开API）
				if (this.state.userInfo && this.state.userInfo.token) {
					await window.GitHubService.initFromUser(this.state.userInfo);
				}
			} catch (error) {
				console.warn('⚠️ [proceedToProject] 缓存分类列表失败:', error);
				// 不阻止流程继续
			}

			// 保存仓库信息到历史记录（只有在整个流程完成后才保存）
			console.log('🔵 [proceedToProject] 保存历史记录...');
			this.saveToHistory({
				...repoInfo,
				description: repoInfo.description || await this.getRepositoryDescription(repoInfo.owner, repoInfo.repo)
			});


			// 跳转到项目详情页面前，恢复光标状态
			this.restoreCursorState();

			console.log('🔵 [proceedToProject] 正在跳转到项目详情页面...');
			if (window.app && window.app.navigateTo) {
				window.app.navigateTo('/project-detail');
				console.log('✅ [proceedToProject] 已调用导航到项目详情页面');
			}
		} catch (error) {
			console.error('❌ [proceedToProject] 同步文件失败:', error);
			const errorText = `${this.t('repositorySelection.syncFailed', '同步失败')}: ${this.escapeHtml(error.message)}`;
			this.updateContinueButtonState('error', errorText);
			// 同时更新项目栏中的加载指示器
			this.updateLoadingIndicator(errorText);

			// 即使同步失败，也允许用户继续到项目页面
			setTimeout(() => {
				this.updateContinueButtonState('success', this.t('repositorySelection.continue.success', '处理完成！'));
				setTimeout(() => {
					// 跳转前恢复光标状态
					this.restoreCursorState();
					console.log('🔵 [proceedToProject] 错误恢复：跳转到项目页面...');
					if (window.app && window.app.navigateTo) {
						window.app.navigateTo('/project-detail');
					}
				}, 1000);
			}, 2000);
		}
	}

	/**
	 * 禁用或启用选项卡按钮和刷新按钮
	 * @param {boolean} disabled - 是否禁用
	 */
	disableTabButtons(disabled) {
		const tabButtons = this.element?.querySelectorAll('.tab-button');
		if (tabButtons) {
			tabButtons.forEach(btn => {
				if (disabled) {
					btn.disabled = true;
					btn.style.pointerEvents = 'none';
					btn.style.opacity = '0.6';
					btn.style.cursor = 'not-allowed';
				} else {
					btn.disabled = false;
					btn.style.pointerEvents = '';
					btn.style.opacity = '';
					btn.style.cursor = '';
				}
			});
		}

		// 同时禁用/启用刷新按钮
		const refreshBtn = this.element?.querySelector('#refresh-projects-btn');
		if (refreshBtn) {
			if (disabled) {
				refreshBtn.disabled = true;
				refreshBtn.style.pointerEvents = 'none';
				refreshBtn.style.opacity = '0.6';
				refreshBtn.style.cursor = 'not-allowed';
			} else {
				refreshBtn.disabled = false;
				refreshBtn.style.pointerEvents = '';
				refreshBtn.style.opacity = '';
				refreshBtn.style.cursor = '';
			}
		}
	}

	/**
	 * 恢复光标状态
	 */
	restoreCursorState() {
		const container = this.element?.closest('.dashboard') || this.element;
		if (container) {
			container.style.cursor = '';
		}
		// 同时恢复所有项目项的光标
		const allItems = this.element?.querySelectorAll('.history-item.clickable');
		if (allItems) {
			allItems.forEach(i => {
				i.style.cursor = '';
			});
		}
		// 恢复选项卡按钮
		this.disableTabButtons(false);
	}

	/**
	 * 更新加载指示器（项目栏中的加载状态）
	 * @param {string} message - 加载消息
	 */
	updateLoadingIndicator(message) {
		if (this.state.currentLoadingIndicator) {
			this.state.currentLoadingIndicator.textContent = '⏳ ' + message;
		}
	}

	/**
	 * 更新继续按钮状态
	 * @param {string} state - 按钮状态
	 * @param {string} message - 按钮消息
	 */
	updateContinueButtonState(state, message) {
		const continueBtn = this.element.querySelector('#continue-btn');
		if (!continueBtn) return;

		continueBtn.classList.remove('loading', 'success', 'error');

		if (state !== 'default') {
			continueBtn.classList.add(state);
		}

		switch (state) {
			case 'loading':
				continueBtn.disabled = true;
				continueBtn.innerHTML = `⏳ ${this.escapeHtml(message)}`;
				break;
			case 'success':
				continueBtn.disabled = true;
				continueBtn.innerHTML = `✅ ${this.escapeHtml(message)}`;
				break;
			case 'error':
				continueBtn.disabled = true;
				continueBtn.innerHTML = `❌ ${this.escapeHtml(message)}`;
				break;
			default:
				continueBtn.disabled = false;
				continueBtn.innerHTML = `<span class="btn-text">${this.t('repositorySelection.continue.button', '继续')}</span>`;
		}
	}

	/**
	 * 显示错误消息
	 * @param {string} message - 错误消息内容
	 */
	showError(message) {
		const errorDiv = document.createElement('div');
		errorDiv.className = 'error-message';
		errorDiv.textContent = message;
		errorDiv.style.cssText = 'color: red; margin-top: 10px; padding: 10px; background: #ffe6e6; border: 1px solid #ff9999; border-radius: 4px;';
		this.element.querySelector('.tab-content').appendChild(errorDiv);
		setTimeout(() => errorDiv.remove(), 5000);
	}

	/**
	 * 设置仓库初始配置
	 * 包括分支保护、CODEOWNERS、Actions权限、团队权限等
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} token - GitHub访问令牌
	 */
	async setupRepository(owner, repo, token, repositoryCreationTime = null) {
		console.log('🔵 [setupRepository] 开始设置仓库:', { owner, repo, repositoryCreationTime });

		// 初始化 GitHubService
		await window.GitHubService.init(token);

		// 如果没有传入时间，使用当前时间（兼容旧代码）
		if (!repositoryCreationTime) {
			repositoryCreationTime = new Date().toISOString();
			console.log('⚠️ [setupRepository] 未提供创建时间，使用当前时间:', repositoryCreationTime);
		}

		try {
			// 1. 批量创建所有初始文件（工作流、CODEOWNERS、POINT系统、角色定义）
			console.log('🔵 [setupRepository] 步骤1: 创建初始文件...');
			this.updateContinueButtonState('loading', this.t('login.settingUp.initialFiles', '正在创建初始文件...'));
			await this.setupInitialFiles(owner, repo, token, repositoryCreationTime);
			console.log('✅ [setupRepository] 步骤1完成');

			// 2. 设置分支保护
			console.log('🔵 [setupRepository] 步骤2: 设置分支保护...');
			this.updateContinueButtonState('loading', this.t('login.settingUp.branchProtection', '正在设置分支保护...'));
			await this.setupBranchProtection(owner, repo);
			console.log('✅ [setupRepository] 步骤2完成');

			// 3. 设置Actions权限
			console.log('🔵 [setupRepository] 步骤3: 设置Actions权限...');
			this.updateContinueButtonState('loading', this.t('login.settingUp.actionsPermissions', '正在设置Actions权限...'));
			await this.setupActionsPermissions(owner, repo);
			console.log('✅ [setupRepository] 步骤3完成');

			// 4. 设置Workflow权限
			console.log('🔵 [setupRepository] 步骤4: 设置Workflow权限...');
			this.updateContinueButtonState('loading', this.t('login.settingUp.workflowPermissions', '正在设置Workflow权限...'));
			await this.setupWorkflowPermissions(owner, repo);
			console.log('✅ [setupRepository] 步骤4完成');

			// 5. 创建Secrets
			console.log('🔵 [setupRepository] 步骤5: 创建Secrets...');
			this.updateContinueButtonState('loading', this.t('login.settingUp.secrets', '正在创建Secrets...'));
			await this.setupSecrets(owner, repo, token);
			console.log('✅ [setupRepository] 步骤5完成');

			// 6. 设置团队权限
			console.log('🔵 [setupRepository] 步骤6: 设置团队权限...');
			this.updateContinueButtonState('loading', this.t('login.settingUp.teamPermissions', '正在设置团队权限...'));
			await this.setupTeamPermissions(owner, repo);
			console.log('✅ [setupRepository] 步骤6完成');

			// 7. 启用Discussions功能
			console.log('🔵 [setupRepository] 步骤7: 启用Discussions...');
			this.updateContinueButtonState('loading', this.t('login.settingUp.discussions', '正在启用Discussions...'));
			await this.setupDiscussions(owner, repo);
			console.log('✅ [setupRepository] 步骤7完成');

			// 8. 获取并缓存Discussions分类列表
			console.log('🔵 [setupRepository] 步骤8: 缓存Discussions分类列表...');
			this.updateContinueButtonState('loading', this.t('login.settingUp.cachingCategories', '正在缓存分类列表...'));
			await this.cacheDiscussionCategories(owner, repo);
			console.log('✅ [setupRepository] 步骤8完成');

			console.log('✅ [setupRepository] 所有设置完成！');

		} catch (error) {
			console.error('❌ [setupRepository] 设置仓库权限失败:', error);
			throw error;
		}
	}

	/**
	 * 批量创建所有初始文件（一次性提交）
	 * 包括：CODEOWNERS、POINT系统文件、角色定义文件、GitHub Actions工作流
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} token - GitHub访问令牌
	 */
	async setupInitialFiles(owner, repo, token, repositoryCreationTime = null) {
		console.log('正在准备批量创建初始文件...');
		// 使用传入的仓库创建时间，如果没有则使用当前时间（兼容旧代码）
		const time = repositoryCreationTime || new Date().toISOString();
		console.log('📅 [setupInitialFiles] 使用仓库创建时间:', time);

		// 1. CODEOWNERS文件
		const codeOwners = `.github/POINT/ @${owner}/reviewers
.github/reviewers.txt @${owner}/administrators
.github/maintainers.txt @${owner}/administrators
.github/directors.txt @${owner}/administrators
.github/collaborators.txt @${owner}/administrators
.github/CODEOWNERS @${owner}/administrators
.github/workflows/ @${owner}/administrators
`;

		// 3. 收集所有需要创建的文件
		const allFiles = [
			// CODEOWNERS
			{
				path: '.github/CODEOWNERS',
				content: codeOwners
			},
			// POINT目录文件
			{
				path: `.github/POINT/${this.state.userInfo.username}.json`,
				content: `[{"time":"${time}","HP":1000,"RP":1000,"points":1000,"reviewers":"${this.state.userInfo.username}","reason":"创建仓库"}]`
			},
			{
				path: '.github/POINT/points.csv',
				content: `user,HP,RP
${this.state.userInfo.username},1000,1000
`
			},
			// 角色定义文件
			{
				path: '.github/reviewers.txt',
				content: `${this.state.userInfo.username}\n`
			},
			{
				path: '.github/maintainers.txt',
				content: `${this.state.userInfo.username}\n`
			},
			{
				path: '.github/directors.txt',
				content: `${this.state.userInfo.username}\n`
			},
			// 协作者列表文件（由自动批准工作流更新）
			{
				path: '.github/collaborators.txt',
				content: `${this.state.userInfo.username}\n`
			}
		];

		// 4. 加载并添加GitHub Actions工作流文件
		const workflows = [
			'auto-approve-collaborators.yml',
			'accept-invitation.yml',
			'remove-permission.yml',
			'grant-points.yml'
		];

		const workflowPaths = [
			'.github/workflows/auto-approve-collaborators.yml',
			'.github/workflows/accept-invitation.yml',
			'.github/workflows/remove-permission.yml',
			'.github/workflows/grant-points.yml'
		];

		// 加载所有工作流文件内容
		for (let i = 0; i < workflows.length; i++) {
			try {
				const workflowContent = await this.loadFileTemplate(workflows[i]);
				allFiles.push({
					path: workflowPaths[i],
					content: workflowContent
				});
			} catch (error) {
				console.warn(`⚠️ 无法加载工作流模板 ${workflows[i]}:`, error);
				// 即使某个工作流模板加载失败，也继续处理其他文件
			}
		}

		// 5. 批量创建所有文件（一次性提交）
		try {
			await this.batchCreateOrUpdateFiles(
				owner,
				repo,
				allFiles,
				'Initialize project structure: CODEOWNERS, POINT system, role definitions, and GitHub Actions workflows'
			);
			console.log(`✅ 成功批量创建 ${allFiles.length} 个初始文件`);
		} catch (error) {
			console.error('❌ 批量创建初始文件失败:', error);
			throw error;
		}
	}

	/**
	 * 加载文件模板
	 * @async
	 * @param {string} path - 模板文件路径
	 * @returns {Promise<string>} 模板文件内容
	 * @throws {Error} 如果文件加载失败
	 */
	async loadFileTemplate(path) {
		// 从服务器加载文件（使用app.getFullPath处理基础路径）
		const filePath = window.app ? window.app.getFullPath(`/templates/${path}`) : `/templates/${path}`;
		const response = await fetch(filePath);
		if (response.ok) {
			return await response.text();
		} else {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
	}

	/**
	 * 批量创建或更新文件（一次性提交）
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名
	 * @param {Array} files - 文件数组，每个元素包含 {path, content}
	 * @param {string} message - 提交消息
	 */
	async batchCreateOrUpdateFiles(owner, repo, files, message) {
		// 检查仓库是否为空
		let isEmptyRepo = false;

		try {
			await window.GitHubService.safeCall(async (octokit) => {
				const { data: refData } = await octokit.rest.git.getRef({
					owner,
					repo,
					ref: 'heads/main'
				});
				return refData;
			});
		} catch (error) {
			if (error.status === 404 || error.status === 409) {
				isEmptyRepo = true;
			} else {
				throw error;
			}
		}

		// 如果是空仓库，先创建第一个文件建立初始提交
		if (isEmptyRepo) {
			console.log('仓库为空，先创建第一个文件建立初始提交');

			if (files.length > 0) {
				// 创建第一个文件
				await window.GitHubService.safeCall(async (octokit) => {
					await octokit.rest.repos.createOrUpdateFileContents({
						owner,
						repo,
						path: files[0].path,
						message: `Initial commit: ${message}`,
						content: btoa(unescape(encodeURIComponent(files[0].content)))
					});
				});

				console.log(`✅ 已创建第一个文件 ${files[0].path}，建立初始提交`);

				// 如果还有其他文件，使用git操作批量提交
				if (files.length > 1) {
					const remainingFiles = files.slice(1);
					console.log(`继续为剩余的 ${remainingFiles.length} 个文件创建提交`);

					// 使用git操作批量提交剩余文件
					await this.createBatchCommit(owner, repo, remainingFiles, message);
				}
			}
			return 'created';
		}

		// 非空仓库使用git操作批量提交所有文件
		await this.createBatchCommit(owner, repo, files, message);
		return 'created';
	}

	/**
	 * 使用git操作批量创建提交
	 */
	async createBatchCommit(owner, repo, files, message) {
		// 1. 获取当前用户信息
		const userInfo = await window.GitHubService.getAuthenticatedUser();
		const author = {
			name: userInfo.name || userInfo.login,
			email: userInfo.email || `${userInfo.login}@users.noreply.github.com`,
			date: new Date().toISOString()
		};

		// 2. 获取最新的提交SHA
		const refData = await window.GitHubService.safeCall(async (octokit) => {
			const { data } = await octokit.rest.git.getRef({
				owner,
				repo,
				ref: 'heads/main'
			});
			return data;
		});
		const baseTreeSHA = refData.object.sha;

		// 3. 获取基础tree的SHA
		const commitData = await window.GitHubService.safeCall(async (octokit) => {
			const { data } = await octokit.rest.git.getCommit({
				owner,
				repo,
				commit_sha: baseTreeSHA
			});
			return data;
		});
		const treeSha = commitData.tree.sha;

		// 4. 为每个文件创建blob
		const treeItems = await Promise.all(files.map(async (file) => {
			const blobContent = btoa(unescape(encodeURIComponent(file.content)));

			// 创建blob
			const blobData = await window.GitHubService.safeCall(async (octokit) => {
				const { data } = await octokit.rest.git.createBlob({
					owner,
					repo,
					content: blobContent,
					encoding: 'base64'
				});
				return data;
			});

			return {
				path: file.path,
				mode: '100644',
				type: 'blob',
				sha: blobData.sha
			};
		}));

		// 5. 创建新的tree
		const treeData = await window.GitHubService.safeCall(async (octokit) => {
			const { data } = await octokit.rest.git.createTree({
				owner,
				repo,
				base_tree: treeSha,
				tree: treeItems
			});
			return data;
		});

		// 6. 创建新的commit
		const commit = await window.GitHubService.safeCall(async (octokit) => {
			const { data } = await octokit.rest.git.createCommit({
				owner,
				repo,
				message: message,
				tree: treeData.sha,
				parents: [baseTreeSHA],
				author: author,
				committer: author
			});
			return data;
		});

		// 7. 更新引用
		await window.GitHubService.safeCall(async (octokit) => {
			await octokit.rest.git.updateRef({
				owner,
				repo,
				ref: 'heads/main',
				sha: commit.sha
			});
		});
	}

	/**
	 * 设置分支保护规则
	 * 启用CODEOWNERS审查要求，保护受保护的文件
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 */
	async setupBranchProtection(owner, repo) {
		const protectionRules = {
			required_status_checks: {
				strict: false,        // 不要求分支是最新的，允许协作者创建分支
				contexts: []          // 不要求特定的状态检查
			},
			enforce_admins: false,    // 不强制管理员也遵循规则
			required_pull_request_reviews: {
				required_approving_review_count: 1,  // 需要1个审查
				dismiss_stale_reviews: true,         // 新提交时取消过时审查
				require_code_owner_reviews: true     // 要求CODEOWNERS审查（关键！）
			},
			restrictions: null        // 不限制推送用户，让协作者可以推送
		};

		await window.GitHubService.safeCall(async (octokit) => {
			await octokit.rest.repos.updateBranchProtection({
				owner, repo, branch: 'main',
				...protectionRules
			});
		});
	}

	/**
	 * 设置Actions权限
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 */
	async setupActionsPermissions(owner, repo) {
		await window.GitHubService.safeCall(async (octokit) => {
			await octokit.rest.actions.setGithubActionsPermissionsRepository({
				owner, repo,
				enabled: true,
				allowed_actions: 'all'
			});
		});
	}

	/**
	 * 设置Workflow权限
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 */
	async setupWorkflowPermissions(owner, repo) {
		try {
			// 先获取当前权限设置
			const currentActionsPermissions = await window.GitHubService.safeCall(async (octokit) => {
				const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/permissions', {
					owner, repo
				});
				return data;
			});
			console.log('🔍 当前Actions权限设置:', currentActionsPermissions);

			const currentWorkflowPermissions = await window.GitHubService.safeCall(async (octokit) => {
				const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/permissions/workflow', {
					owner, repo
				});
				return data;
			});
			console.log('🔍 当前Workflow权限设置:', currentWorkflowPermissions);

			// 检查第一个权限（Actions）是否已正确设置
			const isActionsCorrectlySet = currentActionsPermissions.enabled && currentActionsPermissions.allowed_actions === 'all';

			if (!isActionsCorrectlySet) {
				// 需要更新，统一设置所有权限

				// 设置Actions权限
				const actionsPermissions = {
					owner, repo,
					enabled: true,
					allowed_actions: 'all'
				};
				console.log('🔄 设置Actions权限参数:', actionsPermissions);
				await window.GitHubService.safeCall(async (octokit) => {
					await octokit.request('PUT /repos/{owner}/{repo}/actions/permissions', actionsPermissions);
				});
				console.log('✅ Actions权限设置成功');

				// 设置Workflow权限
				const workflowPermissions = {
					owner, repo,
					default_workflow_permissions: 'write',
					can_approve_pull_request_reviews: true
				};
				console.log('🔄 设置Workflow权限参数:', workflowPermissions);
				await window.GitHubService.safeCall(async (octokit) => {
					await octokit.request('PUT /repos/{owner}/{repo}/actions/permissions/workflow', workflowPermissions);
				});
				console.log('✅ Workflow权限设置成功');
			} else {
				console.log('ℹ️ 所有权限已正确设置，跳过更新');
			}

		} catch (error) {
			console.error('❌ Workflow权限设置失败:', error);
			throw error;
		}
	}

	/**
	 * 创建GitHub Secrets
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} token - GitHub访问令牌
	 */
	async setupSecrets(owner, repo, token) {
		try {
			// 获取公钥
			const publicKeyData = await window.GitHubService.safeCall(async (octokit) => {
				const { data } = await octokit.rest.actions.getRepoPublicKey({
					owner, repo
				});
				return data;
			});

			console.log('🔑 获取到公钥:', publicKeyData.key_id);

			// 创建COLLABORATOR_TOKEN secret
			const secretValue = token; // 使用当前用户的token作为COLLABORATOR_TOKEN

			// 使用Web Crypto API进行正确的加密
			const encryptedValue = await this.encryptSecret(secretValue, publicKeyData.key);

			await window.GitHubService.safeCall(async (octokit) => {
				await octokit.rest.actions.createOrUpdateRepoSecret({
					owner, repo,
					secret_name: 'COLLABORATOR_TOKEN',
					encrypted_value: encryptedValue,
					key_id: publicKeyData.key_id
				});
			});

			console.log('✅ COLLABORATOR_TOKEN secret创建成功');

			// 验证secret是否创建成功
			try {
				const secrets = await window.GitHubService.safeCall(async (octokit) => {
					const { data } = await octokit.rest.actions.listRepoSecrets({
						owner, repo
					});
					return data;
				});
				console.log('🔍 当前仓库的secrets:', secrets.secrets.map(s => s.name));
			} catch (verifyError) {
				console.log('⚠️ 无法验证secrets列表:', verifyError.message);
			}

		} catch (error) {
			console.error('❌ Secrets创建失败:', error);
			// 不抛出错误，因为secrets创建失败不应该阻止其他设置
			console.log('⚠️ 继续执行其他设置...');
		}
	}

	/**
	 * 使用公钥加密密钥值
	 * @async
	 * @param {string} secretValue - 需要加密的密钥值
	 * @param {string} publicKey - 公钥
	 * @returns {Promise<string>} 加密后的密钥值
	 */
	async encryptSecret(secretValue, publicKey) {
		try {
			// 检查是否有libsodium库
			if (typeof window.sodium !== 'undefined') {
				console.log('🔐 使用libsodium加密secret（GitHub Secrets标准）');
				await window.sodium.ready;

				// 使用标准的atob解码base64，而不是sodium.from_base64
				const keyBytes = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0));
				const messageBytes = new TextEncoder().encode(secretValue);
				const encryptedBytes = window.sodium.crypto_box_seal(messageBytes, keyBytes);
				// 使用标准的btoa编码，而不是sodium.to_base64
				const encryptedBase64 = btoa(String.fromCharCode(...encryptedBytes));

				console.log('✅ libsodium加密成功');
				return encryptedBase64;
			} else {
				throw new Error(this.t('login.errors.libsodiumNotLoaded', 'libsodium库未加载'));
			}
		} catch (error) {
			console.error('❌ libsodium加密失败:', error);
			// 如果加密失败，使用简单的base64编码作为最后的fallback
			console.log('⚠️ 使用base64编码作为最后的fallback');
			return btoa(unescape(encodeURIComponent(secretValue)));
		}
	}

	/**
	 * 设置团队权限
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 */
	async setupTeamPermissions(owner, repo) {
		try {
			// 定义需要创建的团队（根据4个角色：所有者、审核委员、维护者、贡献者）
			const teams = [
				{
					name: 'administrators',
					description: this.t('login.teams.administrators.description', '管理员团队 - 拥有仓库的完全管理权限'),
					permission: 'admin'
				},
				{
					name: 'reviewers',
					description: this.t('login.teams.reviewers.description', '审核委员团队 - 负责审核贡献质量并通过评论授予积分'),
					permission: 'push'
				},
				{
					name: 'maintainers',
					description: this.t('login.teams.maintainers.description', '维护者团队 - 负责合并PR和管理贡献，但受CODEOWNERS限制'),
					permission: 'push'
				}
			];

			for (const team of teams) {
				try {
					// 检查团队是否已存在
					let teamExists = false;
					try {
						await window.GitHubService.safeCall(async (octokit) => {
							await octokit.rest.teams.getByName({
								org: owner,
								team_slug: team.name
							});
						});
						teamExists = true;
						console.log(`✅ 团队 ${team.name} 已存在`);
					} catch (error) {
						if (error.status !== 404) {
							throw error;
						}
						// 团队不存在，继续创建
					}

					// 如果团队不存在，创建团队
					if (!teamExists) {
						await window.GitHubService.safeCall(async (octokit) => {
							const { data: createdTeam } = await octokit.rest.teams.create({
								org: owner,
								name: team.name,
								description: team.description,
								privacy: 'closed'
							});
							console.log(`✅ 创建团队 ${team.name} 成功`);
						});
					}

					// 设置团队仓库权限
					await window.GitHubService.safeCall(async (octokit) => {
						await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
							org: owner,
							team_slug: team.name,
							owner: owner,
							repo: repo,
							permission: team.permission
						});
					});

					console.log(`✅ 设置团队 ${team.name} 权限为 ${team.permission}`);

				} catch (error) {
					console.warn(`⚠️ 设置团队 ${team.name} 失败:`, error);
					// 继续处理其他团队，不中断整个流程
				}
			}

			// 设置分支保护规则，只允许审核委员合并到main分支
			await this.setupBranchProtectionForTeams(owner, repo);

		} catch (error) {
			console.error('❌ 设置团队权限失败:', error);
			throw error;
		}
	}

	/**
	 * 为团队设置分支保护规则
	 * @async
	 * @param {string} owner - 组织名称
	 * @param {string} repo - 仓库名称
	 */
	async setupBranchProtectionForTeams(owner, repo) {
		try {
			// 设置main分支保护规则
			await window.GitHubService.safeCall(async (octokit) => {
				await octokit.rest.repos.updateBranchProtection({
					owner: owner,
					repo: repo,
					branch: 'main',
					required_status_checks: {
						strict: true,
						contexts: []
					},
					enforce_admins: false,
					required_pull_request_reviews: {
						required_approving_review_count: 1,
						dismiss_stale_reviews: true,
						require_code_owner_reviews: true
					},
					restrictions: {
						users: [],
						teams: ['reviewers'], // 只有审核委员可以合并
						apps: []
					},
					allow_force_pushes: false,
					allow_deletions: false
				});
			});

			console.log('✅ 设置main分支保护规则成功 - 只有审核委员可以合并');

		} catch (error) {
			console.warn('⚠️ 设置分支保护规则失败:', error);
			// 不抛出错误，因为这不是关键功能
		}
	}

	/**
	 * 启用Discussions功能
	 * @async
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 */
	async setupDiscussions(owner, repo) {
		try {
			console.log('🔧 正在启用Discussions...');

			// 获取仓库信息以获取repository ID
			const repoInfo = await window.GitHubService.getRepo(owner, repo);

			const repositoryId = repoInfo.node_id; // node_id就是GitHub的ID格式

			if (!repositoryId) {
				console.warn('⚠️ 无法获取仓库ID，跳过Discussions启用');
				return;
			}

			// 使用GraphQL API启用Discussions
			await window.GitHubService.graphql(`
				mutation EnableDiscussions($repoId: ID!) {
					updateRepository(input: {
						repositoryId: $repoId,
						hasDiscussionsEnabled: true
					}) {
						repository {
							id
							name
							hasDiscussionsEnabled
						}
					}
				}
			`, {
				repoId: repositoryId
			});

			console.log('✅ Discussions功能启用成功');

		} catch (error) {
			console.error('❌ 启用Discussions失败:', error);
			// 不抛出错误，因为Discussions不是关键功能，不应该阻止其他设置
			console.log('⚠️ 继续执行后续设置...');
		}
	}

	/**
	 * 格式化日期
	 * @param {string} dateString - 日期字符串
	 * @returns {string} 格式化后的日期
	 */
	formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	/**
	 * 销毁组件
	 * 清理资源并移除DOM元素
	 */
	destroy() {
		// 清理资源
		if (this.element) {
			this.element.innerHTML = '';
		}
	}
}

// 注册组件
window.RepositorySelectionPage = RepositorySelectionPage;

