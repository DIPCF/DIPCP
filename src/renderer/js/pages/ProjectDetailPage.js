/**
 * 项目详情页面组件
 * 完全组件化的项目详情页面
 */
class ProjectDetailPage extends BasePage {
	constructor(props = {}) {
		super(props);
		this.state = {
			project: props.project || null,
			files: props.files || [],
			selectedFile: null,
			showInfoPanel: false,
			infoPanelContent: null,
			loading: true,
			onFileClick: props.onFileClick || null,
			onFileOpen: props.onFileOpen || null,
			onFileDelete: props.onFileDelete || null,
			onCreateFile: props.onCreateFile || null,
			onCreateDir: props.onCreateDir || null,
			onUploadFile: props.onUploadFile || null,
			onCheckUpdate: props.onCheckUpdate || null,
			// 模态框实例
			modal: null,
			// 功能模块状态缓存
			moduleStates: this.loadModuleStates(),
			// 成员数据缓存
			membersCache: null,
			membersLoading: false
		};
	}

	render() {
		const container = document.createElement('div');
		container.className = 'dashboard';
		container.innerHTML = `
			${this.renderHeader()}
			<main class="project-detail-main">
				${this.renderBreadcrumb()}
				${this.renderToolbar()}
				${this.renderProjectInfo()}
				${this.renderMainContent()}
			</main>
		`;
		return container;
	}

	renderHeader() {
		// 使用BasePage的renderHeader方法
		return super.renderHeader('project-detail', false, null);
	}

	renderBreadcrumb() {
		return `
            <div class="breadcrumb-container">
                <div class="breadcrumb">
                    <span class="breadcrumb-item">
                        📁 <span id="projectTitle">${this.state.project?.name || this.t('common.loading', '载入中...')}</span>
                    </span>
                </div>
                <div class="dropdown">
                    <button class="dropdown-toggle" id="moreInfoBtn">⋯</button>
                    <div class="dropdown-menu" id="moreInfoMenu">
                        <a href="#" class="dropdown-item" data-section="project-info">${this.t('projectDetail.projectInfo', '项目信息')}</a>
                        <a href="#" class="dropdown-item" data-section="members">${this.t('projectDetail.projectMembers', '项目成员')}</a>
                        <a href="#" class="dropdown-item" data-section="activity">${this.t('projectDetail.recentActivity', '最近活动')}</a>
                        <a href="#" class="dropdown-item" data-section="pending">${this.t('projectDetail.pendingReviews', '待审核内容')}</a>
                    </div>
                </div>
            </div>
        `;
	}

	renderToolbar() {
		return `
            <div class="editor-toolbar">
                <div class="editor-toolbar-left">
                    <button class="btn btn-sm" id="createFileBtn">📄 ${this.t('projectDetail.createFile', '创建文件')}</button>
                    <button class="btn btn-sm" id="createDirBtn">📁 ${this.t('projectDetail.createDirectory', '创建目录')}</button>
                    <button class="btn btn-sm" id="uploadFileBtn">📤 ${this.t('projectDetail.uploadFile', '上传文件')}</button>
                    <button class="btn btn-sm" id="checkUpdateBtn">🔄 ${this.t('projectDetail.checkUpdate', '检查更新')}</button>
                </div>
                <div class="editor-toolbar-right">
                    <button class="btn btn-success btn-sm" id="openBtn" style="display: none;">👁 ${this.t('projectDetail.openFile', '打开')}</button>
                    <button class="btn btn-danger btn-sm" id="deleteBtn" style="display: none;">🗑️ ${this.t('projectDetail.deleteFile', '删除')}</button>
                </div>
            </div>
        `;
	}

	renderProjectInfo() {
		const isVisible = this.state.moduleStates.projectInfo;
		return `
            <div class="project-info-card" id="project-info-section" style="display: ${isVisible ? 'block' : 'none'};">
                <h3>${this.t('projectDetail.projectInfo', '项目信息')}</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <label>${this.t('projectDetail.creator', '创建者')}:</label>
                        <span id="creator">${this.state.project?.creator || this.t('common.loading', '载入中...')}</span>
                    </div>
                    <div class="info-item">
                        <label>${this.t('projectDetail.description', '描述')}:</label>
                        <span id="description">${this.state.project?.description || this.t('common.loading', '载入中...')}</span>
                    </div>
                    <div class="info-item">
                        <label>${this.t('projectDetail.contributors', '贡献者')}:</label>
                        <span id="contributors">${this.state.project?.contributors || this.t('common.loading', '载入中...')}</span>
                    </div>
                    <div class="info-item">
                        <label>${this.t('projectDetail.lastUpdated', '最后更新')}:</label>
                        <span id="lastUpdated">${this.state.project?.lastUpdated || this.t('common.loading', '载入中...')}</span>
                    </div>
                    <div class="info-item">
                        <label>${this.t('projectDetail.status', '状态')}:</label>
                        <span class="status active" id="status">${this.state.project?.status || this.t('common.loading', '载入中...')}</span>
                    </div>
                </div>
            </div>
        `;
	}

	renderMainContent() {
		return `
            <div class="main-content" id="mainContent">
                <div class="file-section" id="fileSection">
                    <h3>${this.t('projectDetail.projectFiles', '项目文件')}</h3>
                    <div class="file-tree" id="fileList">
                        ${this.renderFileList()}
                    </div>
                </div>
                <div class="info-panel" id="infoPanel" style="display: ${this.state.showInfoPanel ? 'block' : 'none'};">
                    <div class="info-panel-header">
                        <h3 id="infoPanelTitle">${this.t('projectDetail.details', '详细信息')}</h3>
                        <button class="btn-close" id="closeInfoPanel">×</button>
                    </div>
                    <div class="info-panel-content" id="infoPanelContent">
                        ${this.state.infoPanelContent || ''}
                    </div>
                </div>
            </div>
        `;
	}

	/**
	 * 加载模块状态缓存
	 */
	loadModuleStates() {
		try {
			const cached = localStorage.getItem('spcp-project-module-states');
			const states = cached ? JSON.parse(cached) : {
				projectInfo: false,
				members: false,
				activity: false,
				pending: false
			};
			console.log('加载模块状态缓存:', states);
			return states;
		} catch (error) {
			console.error('加载模块状态缓存失败:', error);
			return {
				projectInfo: false,
				members: false,
				activity: false,
				pending: false
			};
		}
	}

	/**
	 * 保存模块状态缓存
	 */
	saveModuleStates() {
		try {
			localStorage.setItem('spcp-project-module-states', JSON.stringify(this.state.moduleStates));
		} catch (error) {
			console.error('保存模块状态缓存失败:', error);
		}
	}

	/**
	 * 加载成员数据缓存
	 */
	async loadMembersCache() {
		try {
			// 从用户数据中获取仓库信息
			const userData = localStorage.getItem('spcp-user');
			if (!userData) return null;

			const user = JSON.parse(userData);
			const repoInfo = user.repositoryInfo;
			if (!repoInfo) return null;

			// 使用仓库信息生成项目ID
			const projectId = `${repoInfo.owner}/${repoInfo.repo}`;

			const cached = await window.StorageService.getMembersCache(projectId);
			return cached;
		} catch (error) {
			console.error('加载成员数据缓存失败:', error);
			return null;
		}
	}

	/**
	 * 保存成员数据缓存
	 */
	async saveMembersCache(membersData) {
		try {
			// 从用户数据中获取仓库信息
			const userData = localStorage.getItem('spcp-user');
			if (!userData) return;

			const user = JSON.parse(userData);
			const repoInfo = user.repositoryInfo;
			if (!repoInfo) return;

			// 使用仓库信息生成项目ID
			const projectId = `${repoInfo.owner}/${repoInfo.repo}`;

			await window.StorageService.saveMembersCache(projectId, membersData);
		} catch (error) {
			console.error('保存成员数据缓存失败:', error);
		}
	}

	/**
	 * 更新模块状态
	 */
	updateModuleState(moduleName, isOpen) {
		const newModuleStates = {
			...this.state.moduleStates,
			[moduleName]: isOpen
		};
		console.log(`更新模块状态: ${moduleName} = ${isOpen}`, newModuleStates);
		this.setState({ moduleStates: newModuleStates });
		this.saveModuleStates();
	}

	/**
	 * 恢复模块状态
	 */
	restoreModuleStates() {
		// 防止重复调用
		if (this._restoreModuleStatesCalled) {
			console.log('restoreModuleStates 已被调用，跳过');
			return;
		}
		this._restoreModuleStatesCalled = true;

		// 延迟执行，确保DOM已经渲染完成
		setTimeout(() => {
			console.log('恢复模块状态:', this.state.moduleStates);

			if (this.state.moduleStates.projectInfo) {
				console.log('显示项目信息模块');
				this.showProjectInfo();
			}
			if (this.state.moduleStates.members) {
				console.log('显示成员模块');
				this.showMembers();
			}
			if (this.state.moduleStates.activity) {
				console.log('显示活动模块');
				this.showActivity();
			}
			if (this.state.moduleStates.pending) {
				console.log('显示待审核模块');
				this.showPendingReviews();
			}
		}, 200);
	}

	/**
	 * 初始化模态框
	 */
	initModal() {
		if (!this.state.modal) {
			this.state.modal = new Modal();
			const modalElement = this.state.modal.render();
			document.body.appendChild(modalElement);
			this.state.modal.element = modalElement;
			this.state.modal.bindEvents();
		}
	}

	// 模态框辅助方法
	showInputModal(title, message, placeholder = '', defaultValue = '', callback = null) {
		this.initModal();
		this.state.modal.showInput(title, message, placeholder, defaultValue, callback);
	}

	showConfirmModal(title, message, callback = null) {
		this.initModal();
		this.state.modal.showConfirm(title, message, callback);
	}

	showInfoModal(title, message) {
		this.initModal();
		this.state.modal.showInfo(title, message);
	}

	renderFileList() {
		if (this.state.loading) {
			return `<div class="loading">${this.t('common.loading', '载入中...')}</div>`;
		}

		if (this.state.files.length === 0) {
			return `<div class="empty">${this.t('projectDetail.noFiles', '暂无文件')}</div>`;
		}

		// 构建树状结构
		const tree = this.buildFileTree(this.state.files);
		return this.renderFileTree(tree);
	}

	buildFileTree(files) {
		const tree = {};

		// 先按路径长度排序，确保父目录在子目录之前处理
		const sortedFiles = files.sort((a, b) => a.path.split('/').length - b.path.split('/').length);

		// 按路径层级组织文件
		sortedFiles.forEach(file => {
			const pathParts = file.path.split('/').filter(part => part !== '');
			let current = tree;

			// 构建嵌套结构
			for (let i = 0; i < pathParts.length; i++) {
				const part = pathParts[i];
				const isLastPart = i === pathParts.length - 1;

				if (isLastPart) {
					// 最后一个部分，是文件或目录本身
					current[part] = file;
				} else {
					// 中间部分，是目录
					if (!current[part]) {
						// 检查是否有对应的目录文件
						const dirPath = pathParts.slice(0, i + 1).join('/') + '/';
						const dirFile = files.find(f => f.path === dirPath);

						current[part] = {
							type: 'dir',
							children: {},
							path: dirPath,
							name: part,
							selected: dirFile ? dirFile.selected : false,
							isLocal: dirFile ? dirFile.isLocal : true
						};
					}
					// 确保children存在
					if (!current[part].children) {
						current[part].children = {};
					}
					current = current[part].children;
				}
			}
		});

		return tree;
	}

	renderFileTree(tree, level = 0) {
		let html = '';
		const indent = '  '.repeat(level);

		Object.keys(tree).sort().forEach(key => {
			const item = tree[key];

			if (item.type === 'dir') {
				// 目录 - 只显示最后一部分路径
				const displayName = key.split('/').pop() + '/';
				const localIcon = item.isLocal ? '🏠' : '';
				html += `
					<div class="file-item dir-item ${item.selected ? 'selected' : ''}" 
						 data-path="${item.path || key + '/'}" 
						 data-type="dir" 
						 data-local="${item.isLocal || true}"
						 style="padding-left: ${level * 20}px;">
						<span class="file-icon">${localIcon}📁</span>
						<span class="file-name">${displayName}</span>
					</div>
				`;

				// 如果有子项，递归渲染
				if (item.children) {
					html += this.renderFileTree(item.children, level + 1);
				}
			} else if (item.path) {
				// 文件
				const localIcon = item.isLocal ? '🏠' : '';
				html += `
					<div class="file-item file-item ${item.selected ? 'selected' : ''}" 
						 data-path="${item.path}" 
						 data-type="${item.type}" 
						 data-local="${item.isLocal}"
						 style="padding-left: ${level * 20}px;">
						<span class="file-icon">${localIcon}${item.type === 'dir' ? '📁' : '📄'}</span>
						<span class="file-name">${item.name}</span>
					</div>
				`;
			}
		});

		return html;
	}

	mount(container) {
		super.mount(container);

		// 加载项目数据，loadProjectData方法内部会调用bindEvents
		this.loadProjectData();
	}

	async loadProjectData() {
		try {
			// 检查是否有用户数据
			const userData = localStorage.getItem('spcp-user');
			if (!userData) {
				this.setState({
					loading: false,
					files: [],
					project: null
				});
				this.rerender();
				return Promise.resolve();
			}

			// 使用StorageService加载项目数据
			if (window.StorageService) {
				// 初始化数据库
				await window.StorageService.initDB();

				// 同时从localWorkspace和fileCache加载文件数据
				try {
					const [workspaceFiles, cacheFiles] = await Promise.all([
						window.StorageService.getAllLocalWorkspaceFiles().catch(() => []),
						window.StorageService.getAllFileCacheFiles().catch(() => [])
					]);

					// 创建文件映射，优先使用本地工作空间的文件
					const fileMap = new Map();

					// 先添加文件缓存的文件（GitHub原版）
					cacheFiles.forEach(file => {
						const fileInfo = {
							name: file.path.split('/').pop() || file.path,
							path: file.path,
							type: file.path.endsWith('/') ? 'dir' : 'file',
							selected: false,
							isLocal: false
						};
						fileMap.set(file.path, fileInfo);
					});

					// 再添加本地工作空间的文件（用户编辑的版本，会覆盖缓存版本）
					workspaceFiles.forEach(file => {
						const fileInfo = {
							name: file.path.split('/').pop() || file.path,
							path: file.path,
							type: file.path.endsWith('/') ? 'dir' : 'file',
							selected: false,
							isLocal: true
						};
						fileMap.set(file.path, fileInfo);
					});

					// 转换为数组并过滤掉删除记录目录
					const files = Array.from(fileMap.values()).filter(file =>
						!file.path.startsWith('__deletions__/') &&
						!file.path.startsWith('_deletions/')
					);

					this.setState({
						loading: false,
						project: {
							name: 'DPCC',
							url: 'https://github.com/ZelaCreator/DPCC',
							description: this.t('projectDetail.defaultDescription', '项目描述')
						},
						files: files
					});
				} catch (dbError) {
					console.log('Error loading from IndexedDB:', dbError);
					// 如果加载失败，设置空文件列表
					this.setState({
						loading: false,
						project: {
							name: 'DPCC',
							url: 'https://github.com/ZelaCreator/DPCC',
							description: this.t('projectDetail.defaultDescription', '项目描述')
						},
						files: []
					});
				}
			}

			this.rerender();
			// 重新绑定事件，因为文件项是动态生成的
			if (this.element) {
				this.bindEvents();
				// 更新操作按钮状态
				this.updateActionButtons();
			}

			// 根据缓存状态自动显示相应的模块
			this.restoreModuleStates();
		} catch (error) {
			console.error('Error loading project data:', error);

		}
	}

	bindEvents() {
		if (!this.element) {
			console.warn('Cannot bind events: element not mounted');
			return;
		}

		// 绑定Header组件的事件
		this.bindHeaderEvents();
		// 文件点击
		const fileItems = this.element.querySelectorAll('.file-item');
		fileItems.forEach(item => {
			item.addEventListener('click', (e) => {
				const path = e.currentTarget.dataset.path;
				const type = e.currentTarget.dataset.type;

				// 更新选中状态
				fileItems.forEach(f => f.classList.remove('selected'));
				e.currentTarget.classList.add('selected');

				// 从文件列表中查找完整的文件信息
				const fullFileInfo = this.state.files.find(f => f.path === path);
				this.setState({ selectedFile: fullFileInfo || { path, type, name: path.split('/').pop() } });
				this.updateActionButtons();
			});
		});

		// 工具栏按钮
		const createFileBtn = this.element.querySelector('#createFileBtn');
		if (createFileBtn) {
			createFileBtn.addEventListener('click', () => {
				this.handleCreateFile();
			});
		}

		const createDirBtn = this.element.querySelector('#createDirBtn');
		if (createDirBtn) {
			createDirBtn.addEventListener('click', () => {
				this.handleCreateDir();
			});
		}

		const uploadFileBtn = this.element.querySelector('#uploadFileBtn');
		if (uploadFileBtn) {
			uploadFileBtn.addEventListener('click', () => {
				this.handleUploadFile();
			});
		}

		const checkUpdateBtn = this.element.querySelector('#checkUpdateBtn');
		if (checkUpdateBtn) {
			checkUpdateBtn.addEventListener('click', () => {
				this.handleCheckUpdate();
			});
		}

		// 操作按钮
		const openBtn = this.element.querySelector('#openBtn');
		if (openBtn) {
			openBtn.addEventListener('click', () => {
				if (this.state.selectedFile) {
					this.handleFileOpen(this.state.selectedFile);
				}
			});
		}

		const deleteBtn = this.element.querySelector('#deleteBtn');
		if (deleteBtn) {
			deleteBtn.addEventListener('click', () => {
				if (this.state.selectedFile) {
					this.handleFileDelete(this.state.selectedFile);
				}
			});
		}

		// 下拉菜单
		const dropdownToggle = this.element.querySelector('.dropdown-toggle');
		const dropdownMenu = this.element.querySelector('.dropdown-menu');
		if (dropdownToggle && dropdownMenu) {
			dropdownToggle.addEventListener('click', (e) => {
				e.stopPropagation();
				dropdownMenu.classList.toggle('show');
			});
		}

		// 下拉菜单项点击事件
		const dropdownItems = this.element.querySelectorAll('.dropdown-item');
		dropdownItems.forEach(item => {
			item.addEventListener('click', (e) => {
				e.preventDefault();
				const section = e.currentTarget.dataset.section;

				// 关闭下拉菜单
				dropdownMenu.classList.remove('show');

				// 根据section显示相应的信息面板
				if (section === 'project-info') {
					this.toggleProjectInfo();
				} else if (section === 'members') {
					this.toggleMembers();
				} else if (section === 'activity') {
					this.toggleActivity();
				} else if (section === 'pending') {
					this.togglePendingReviews();
				}
			});
		});

		// 关闭信息面板
		const closeInfoPanel = this.element.querySelector('#closeInfoPanel');
		if (closeInfoPanel) {
			closeInfoPanel.addEventListener('click', () => {
				// 检查当前显示的是哪个模块，并调用相应的hide方法
				if (this.state.moduleStates.members) {
					this.hideMembers();
				} else if (this.state.moduleStates.activity) {
					this.hideActivity();
				} else if (this.state.moduleStates.pending) {
					this.hidePendingReviews();
				} else {
					// 默认关闭信息面板
					this.setState({ showInfoPanel: false });
					this.rerender();
					this.bindEvents();
				}
			});
		}

		// 刷新成员按钮
		const refreshMembersBtn = this.element.querySelector('#refreshMembersBtn');
		if (refreshMembersBtn) {
			refreshMembersBtn.addEventListener('click', () => {
				this.showMembers(true); // 强制刷新
			});
		}

		// 模态框事件由Modal组件自己处理
	}

	updateActionButtons() {
		const openBtn = this.element.querySelector('#openBtn');
		const deleteBtn = this.element.querySelector('#deleteBtn');

		if (openBtn && deleteBtn) {
			if (this.state.selectedFile) {
				if (this.state.selectedFile.type === 'file') {
					// 获取文件名（优先使用name，如果没有则从path中提取）
					const fileName = this.state.selectedFile.name || this.state.selectedFile.path.split('/').pop();

					// 检查文件是否可编辑
					if (this.isEditableFile(fileName)) {
						openBtn.style.display = 'block';
						openBtn.textContent = '👁 ' + this.t('projectDetail.openFile', '打开');
					} else if (this.isViewableFile(fileName)) {
						openBtn.style.display = 'block';
						openBtn.textContent = '👁 ' + this.t('projectDetail.viewFile', '查看');
					} else {
						openBtn.style.display = 'none';
					}
					deleteBtn.style.display = 'block';
				} else {
					openBtn.style.display = 'none';
					deleteBtn.style.display = 'block';
				}
			} else {
				openBtn.style.display = 'none';
				deleteBtn.style.display = 'none';
			}
		}
	}

	updateProject(project) {
		this.setState({ project });
		this.rerender();
		this.bindEvents();
	}

	updateFiles(files) {
		this.setState({ files });
		this.rerender();
		this.bindEvents();
	}

	setLoading(loading) {
		this.setState({ loading });
		this.rerender();
		this.bindEvents();
	}

	showInfoPanel(content, title = null) {
		if (!title) {
			title = this.t('projectDetail.details', '详细信息');
		}
		this.setState({
			showInfoPanel: true,
			infoPanelContent: content
		});
		this.rerender();
		this.bindEvents();
	}

	hideInfoPanel() {
		this.setState({ showInfoPanel: false });
		this.rerender();
		this.bindEvents();
	}

	// 下拉菜单相关方法
	toggleProjectInfo() {
		const isCurrentlyVisible = this.state.moduleStates.projectInfo;

		if (!isCurrentlyVisible) {
			this.updateModuleState('projectInfo', true);
			this.showProjectInfo();
		} else {
			this.hideProjectInfo();
		}
	}

	showProjectInfo() {
		// 直接显示项目信息卡片
		const projectInfoSection = this.element.querySelector('#project-info-section');
		if (projectInfoSection) {
			projectInfoSection.style.display = 'block';
		}
	}

	hideProjectInfo() {
		const projectInfoSection = this.element.querySelector('#project-info-section');
		if (projectInfoSection) {
			projectInfoSection.style.display = 'none';
		}
		// 更新状态
		this.updateModuleState('projectInfo', false);
	}

	toggleMembers() {
		const isCurrentlyVisible = this.state.moduleStates.members;

		if (!isCurrentlyVisible) {
			this.updateModuleState('members', true);
			this.showMembers();
		} else {
			this.hideMembers();
		}
	}

	async showMembers(forceRefresh = false) {
		// 如果有缓存且不是强制刷新，直接显示缓存数据
		if (this.state.membersCache && !forceRefresh) {
			const content = this.renderContributorsList(this.state.membersCache);
			this.showInfoPanel(content, this.t('projectDetail.projectMembers', '项目成员'));
			// 重新绑定事件，确保刷新按钮能正常工作
			this.bindEvents();
			return;
		}

		// 尝试从IndexedDB加载缓存
		if (!forceRefresh) {
			const cachedMembers = await this.loadMembersCache();
			if (cachedMembers) {
				this.setState({ membersCache: cachedMembers });
				const content = this.renderContributorsList(cachedMembers);
				this.showInfoPanel(content, this.t('projectDetail.projectMembers', '项目成员'));
				this.bindEvents();
				return;
			}
		}

		try {
			// 设置加载状态
			this.setState({ membersLoading: true });

			// 显示加载状态
			const loadingContent = `
				<div class="info-section">
					<h4>${this.t('projectDetail.projectMembers', '项目成员')}</h4>
					<div class="loading">${this.t('common.loading', '载入中...')}</div>
				</div>
			`;
			this.showInfoPanel(loadingContent, this.t('projectDetail.projectMembers', '项目成员'));

			// 获取用户信息和仓库信息
			const userData = localStorage.getItem('spcp-user');
			if (!userData) {
				throw new Error('用户未登录');
			}

			const user = JSON.parse(userData);
			const repoInfo = user.repositoryInfo;

			if (!repoInfo || !user.token) {
				throw new Error('仓库信息或访问令牌不可用');
			}

			// 获取贡献者列表
			const contributors = await window.GitHubService.getCollaborators(repoInfo.owner, repoInfo.repo, user.token);

			// 缓存数据到IndexedDB
			await this.saveMembersCache(contributors);
			this.setState({
				membersCache: contributors,
				membersLoading: false
			});

			// 渲染贡献者列表
			const content = this.renderContributorsList(contributors);
			this.showInfoPanel(content, this.t('projectDetail.projectMembers', '项目成员'));

		} catch (error) {
			console.error('获取贡献者列表失败:', error);
			this.setState({ membersLoading: false });

			const errorContent = `
				<div class="info-section">
					<h4>${this.t('projectDetail.projectMembers', '项目成员')}</h4>
					<div class="error-message">
						<p>${this.t('projectDetail.membersLoadError', '获取成员列表失败：{error}').replace('{error}', error.message)}</p>
						<p class="error-hint">${this.t('projectDetail.membersLoadHint', '可能的原因：权限不足或网络连接问题')}</p>
						<button class="btn btn-sm btn-primary" id="refreshMembersBtn">${this.t('projectDetail.refreshMembers', '刷新')}</button>
					</div>
				</div>
			`;
			this.showInfoPanel(errorContent, this.t('projectDetail.projectMembers', '项目成员'));
		}
	}

	hideMembers() {
		// 如果成员信息在信息面板中显示，关闭信息面板
		if (this.state.showInfoPanel) {
			this.hideInfoPanel();
		}
		// 更新状态
		this.updateModuleState('members', false);
	}

	/**
	 * 渲染贡献者列表
	 */
	renderContributorsList(contributors) {
		if (!contributors || contributors.length === 0) {
			return `
				<div class="info-section">
					<h4>${this.t('projectDetail.projectMembers', '项目成员')}</h4>
					<div class="empty-state">
						<p>${this.t('projectDetail.noMembers', '暂无项目成员')}</p>
					</div>
				</div>
			`;
		}

		const contributorsHtml = contributors.map(contributor => {
			const avatar = contributor.avatar_url || '👤';
			const name = contributor.login || 'Unknown';
			const role = contributor.permissions?.admin ? 'admin' :
				contributor.permissions?.push ? 'collaborator' : 'read';
			const roleInfo = this.getRoleInfo(role);

			return `
				<div class="stat-card contributor-card" onclick="window.app.router.navigateTo('/user-profile?username=${name}')" style="cursor: pointer;">
					<div class="stat-icon contributor-avatar" style="background-image: url('${avatar}'); background-size: cover; background-position: center;">
						${avatar.startsWith('http') ? '' : avatar}
					</div>
					<div class="stat-content">
						<h3>${name}</h3>
						<p class="stat-number role-badge ${roleInfo.className}">${roleInfo.displayName}</p>
					</div>
				</div>
			`;
		}).join('');

		return `
			<div class="info-section">
				<div class="section-header">
					<h4>${this.t('projectDetail.projectMembers', '项目成员')} (${contributors.length})</h4>
					<button class="btn btn-sm btn-outline" id="refreshMembersBtn">
						${this.state.membersLoading ? '🔄' : '🔄'} ${this.t('projectDetail.refreshMembers', '刷新')}
					</button>
				</div>
				<div class="stats-grid">
					${contributorsHtml}
				</div>
			</div>
		`;
	}

	/**
	 * 获取角色显示名称
	 */
	getRoleDisplayName(role) {
		const roleMap = {
			'admin': this.t('projectDetail.roleAdmin', '管理员'),
			'collaborator': this.t('projectDetail.roleCollaborator', '贡献者'),
			'read': this.t('projectDetail.roleRead', '只读')
		};
		return roleMap[role] || this.t('projectDetail.roleUnknown', '未知');
	}

	/**
	 * 获取角色信息（包含样式类名）
	 */
	getRoleInfo(role) {
		const roleInfo = {
			'admin': {
				displayName: this.t('projectDetail.roleAdmin', '管理员'),
				className: 'role-admin'
			},
			'collaborator': {
				displayName: this.t('projectDetail.roleCollaborator', '贡献者'),
				className: 'role-collaborator'
			},
			'read': {
				displayName: this.t('projectDetail.roleRead', '只读'),
				className: 'role-read'
			}
		};
		return roleInfo[role] || {
			displayName: this.t('projectDetail.roleUnknown', '未知'),
			className: 'role-unknown'
		};
	}

	toggleActivity() {
		const isCurrentlyVisible = this.state.moduleStates.activity;

		if (!isCurrentlyVisible) {
			this.updateModuleState('activity', true);
			this.showActivity();
		} else {
			this.hideActivity();
		}
	}

	showActivity() {
		const content = `
			<div class="info-section">
				<h4>${this.t('projectDetail.recentActivity', '最近活动')}</h4>
				<p>${this.t('projectDetail.activityDescription', '这里显示项目最近的活动记录，包括提交、合并等。')}</p>
			</div>
		`;
		this.showInfoPanel(content, this.t('projectDetail.recentActivity', '最近活动'));
	}

	hideActivity() {
		// 如果活动信息在信息面板中显示，关闭信息面板
		if (this.state.showInfoPanel) {
			this.hideInfoPanel();
		}
		// 更新状态
		this.updateModuleState('activity', false);
	}

	togglePendingReviews() {
		const isCurrentlyVisible = this.state.moduleStates.pending;

		if (!isCurrentlyVisible) {
			this.updateModuleState('pending', true);
			this.showPendingReviews();
		} else {
			this.hidePendingReviews();
		}
	}

	showPendingReviews() {
		const content = `
			<div class="info-section">
				<h4>${this.t('projectDetail.pendingReviews', '待审核内容')}</h4>
				<p>${this.t('projectDetail.pendingDescription', '这里显示待审核的内容列表。')}</p>
			</div>
		`;
		this.showInfoPanel(content, this.t('projectDetail.pendingReviews', '待审核内容'));
	}

	hidePendingReviews() {
		// 如果待审核信息在信息面板中显示，关闭信息面板
		if (this.state.showInfoPanel) {
			this.hideInfoPanel();
		}
		// 更新状态
		this.updateModuleState('pending', false);
	}

	// 页面内处理方法
	async handleCreateFile() {
		// 显示输入模态框让用户输入文件名
		this.showInputModal(
			this.t('projectDetail.fileOperations.modalTitles.createFile', '创建文件'),
			this.t('projectDetail.fileOperations.enterFileName', '请输入文件名（如无扩展名将自动添加.txt）:'),
			this.t('projectDetail.fileOperations.defaultFileName', 'new-file'),
			this.t('projectDetail.fileOperations.defaultFileName', 'new-file'),
			async (fileName) => {
				// 验证文件名
				if (!this.isValidFileName(fileName)) {
					this.showInfoModal(
						this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
						this.t('projectDetail.fileOperations.fileNameInvalid', '文件名无效！请使用字母、数字、下划线、连字符和点号。')
					);
					return;
				}

				// 如果没有扩展名，默认添加.txt
				let finalFileName = fileName;
				if (!fileName.includes('.')) {
					finalFileName = fileName + '.txt';
				}

				try {
					// 确定文件路径 - 如果选中了目录，则在该目录下创建
					let filePath = finalFileName;
					if (this.state.selectedFile && this.state.selectedFile.type === 'dir') {
						// 移除目录路径末尾的斜杠，然后添加文件名
						const dirPath = this.state.selectedFile.path.replace(/\/$/, '');
						filePath = `${dirPath}/${finalFileName}`;
					}

					// 检查文件是否已存在
					const existingFiles = this.state.files.filter(f => f.path === filePath);
					if (existingFiles.length > 0) {
						this.showInfoModal(
							this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
							this.t('projectDetail.fileOperations.fileExists', '文件已存在！')
						);
						return;
					}

					// 创建新文件对象
					const newFile = {
						name: finalFileName,
						path: filePath,
						type: 'file',
						selected: false,
						isLocal: true,
						content: '', // 空内容
						created: new Date().toISOString(),
						modified: new Date().toISOString()
					};

					// 保存到IndexedDB - 只保存到localWorkspace
					if (window.StorageService) {
						await window.StorageService.initDB();

						// 只保存到localWorkspace
						await window.StorageService._execute('localWorkspace', 'put', {
							path: filePath,
							content: '',
							sha: '', // 新文件没有SHA
							created: newFile.created,
							modified: newFile.modified,
							isLocal: true
						});
					}

					// 更新文件列表
					const updatedFiles = [...this.state.files, newFile];
					this.setState({ files: updatedFiles });
					this.rerender();
					this.bindEvents();

					// 自动选中新创建的文件
					this.setState({ selectedFile: newFile });
					this.updateActionButtons();

				} catch (error) {
					console.error('创建文件失败:', error);
					this.showInfoModal(
						this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
						this.t('projectDetail.fileOperations.fileCreateFailed', '创建文件失败：{error}').replace('{error}', error.message)
					);
				}
			}
		);
	}

	isValidFileName(fileName) {
		// 检查文件名是否有效
		if (!fileName || fileName.trim() === '') {
			return false;
		}

		// 检查是否包含非法字符
		const invalidChars = /[<>:"/\\|?*]/;
		if (invalidChars.test(fileName)) {
			return false;
		}

		// 检查是否以点开头（隐藏文件）
		if (fileName.startsWith('.')) {
			return false;
		}

		return true;
	}

	/**
	 * 检查文件是否可编辑（文本类型文件）
	 */
	isEditableFile(fileName) {
		const editableExtensions = [
			// 文本文件
			'txt', 'md', 'markdown', 'rst', 'asciidoc',
			// 配置文件
			'json', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
			// 代码文件
			'js', 'ts', 'jsx', 'tsx', 'vue', 'svelte',
			'html', 'htm', 'css', 'scss', 'sass', 'less',
			'php', 'py', 'rb', 'go', 'rs', 'java', 'kt', 'scala',
			'cpp', 'c', 'h', 'hpp', 'cc', 'cxx',
			'cs', 'vb', 'fs', 'swift', 'dart',
			'sql', 'sh', 'bash', 'zsh', 'fish', 'ps1',
			'xml', 'svg', 'csv', 'log',
			// 其他文本格式
			'diff', 'patch', 'gitignore', 'gitattributes',
			'dockerfile', 'makefile', 'cmake', 'gradle',
			'env', 'properties', 'editorconfig'
		];

		// 常见的无扩展名文本文件
		const commonTextFiles = [
			'LICENSE', 'README', 'CHANGELOG', 'CONTRIBUTING', 'AUTHORS',
			'COPYING', 'INSTALL', 'NEWS', 'TODO', 'HISTORY', 'VERSION'
		];

		// 检查是否是常见的无扩展名文本文件
		if (commonTextFiles.includes(fileName.toUpperCase())) {
			return true;
		}

		// 检查扩展名
		const extension = fileName.split('.').pop()?.toLowerCase();
		return editableExtensions.includes(extension);
	}

	/**
	 * 检查文件是否可查看（图像文件）
	 */
	isViewableFile(fileName) {
		const viewableExtensions = [
			'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
			'ico', 'tiff', 'tif', 'psd', 'ai', 'eps'
		];

		const extension = fileName.split('.').pop()?.toLowerCase();
		return viewableExtensions.includes(extension);
	}

	async handleCreateDir() {
		// 显示输入模态框让用户输入目录名
		this.showInputModal(
			this.t('projectDetail.fileOperations.modalTitles.createDir', '创建目录'),
			this.t('projectDetail.fileOperations.enterDirName', '请输入目录名:'),
			this.t('projectDetail.fileOperations.defaultDirName', 'new-directory'),
			this.t('projectDetail.fileOperations.defaultDirName', 'new-directory'),
			async (dirName) => {
				// 验证目录名
				if (!this.isValidFileName(dirName)) {
					this.showInfoModal(
						this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
						this.t('projectDetail.fileOperations.dirNameInvalid', '目录名无效！请使用字母、数字、下划线、连字符。')
					);
					return;
				}

				try {
					// 确定目录路径 - 如果选中了目录，则在该目录下创建
					let dirPath = dirName + '/';
					if (this.state.selectedFile && this.state.selectedFile.type === 'dir') {
						// 移除目录路径末尾的斜杠，然后添加目录名
						const parentDirPath = this.state.selectedFile.path.replace(/\/$/, '');
						dirPath = `${parentDirPath}/${dirName}/`;
					}

					// 检查目录是否已存在
					const existingDirs = this.state.files.filter(f => f.path === dirPath);
					if (existingDirs.length > 0) {
						this.showInfoModal(
							this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
							this.t('projectDetail.fileOperations.dirExists', '目录已存在！')
						);
						return;
					}

					// 创建新目录对象
					const newDir = {
						name: dirName,
						path: dirPath,
						type: 'dir',
						selected: false,
						isLocal: true,
						created: new Date().toISOString(),
						modified: new Date().toISOString()
					};

					// 保存到IndexedDB - 只保存到localWorkspace
					if (window.StorageService) {
						await window.StorageService.initDB();
						await window.StorageService._execute('localWorkspace', 'put', {
							path: dirPath,
							content: '',
							sha: '', // 目录没有SHA
							created: newDir.created,
							modified: newDir.modified,
							isLocal: true,
							isDirectory: true
						});
					}

					// 更新文件列表
					const updatedFiles = [...this.state.files, newDir];
					this.setState({ files: updatedFiles });
					this.rerender();
					this.bindEvents();

					// 自动选中新创建的目录
					this.setState({ selectedFile: newDir });
					this.updateActionButtons();

				} catch (error) {
					console.error('创建目录失败:', error);
					this.showInfoModal(
						this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
						this.t('projectDetail.fileOperations.dirCreateFailed', '创建目录失败：{error}').replace('{error}', error.message)
					);
				}
			}
		);
	}

	handleUploadFile() {
		console.log('开始上传文件...');
		// 创建文件输入元素
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.multiple = true; // 支持多文件上传
		fileInput.accept = '*/*'; // 接受所有文件类型

		fileInput.addEventListener('change', async (e) => {
			const files = Array.from(e.target.files);
			console.log('选择的文件数量:', files.length);

			if (files.length === 0) {
				console.log('用户取消了文件选择');
				return; // 用户取消
			}

			try {
				let successCount = 0;
				let errorCount = 0;

				for (const file of files) {
					try {
						console.log('处理文件:', file.name, '大小:', file.size);

						// 检查文件大小限制（40MB = 40 * 1024 * 1024 bytes）
						const maxSize = 40 * 1024 * 1024; // 40MB
						if (file.size > maxSize) {
							this.showInfoModal(
								this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
								this.t('projectDetail.fileOperations.fileTooLarge', `文件 "${file.name}" 太大！文件大小不能超过 40MB。当前大小：${(file.size / 1024 / 1024).toFixed(2)}MB`).replace('{fileName}', file.name).replace('{fileSize}', (file.size / 1024 / 1024).toFixed(2))
							);
							errorCount++;
							continue;
						}

						// 读取文件内容
						const content = await this.readFileAsText(file);
						console.log('文件内容长度:', content.length);

						// 确定文件路径 - 如果选中了目录，则在该目录下创建
						let filePath = file.name;
						if (this.state.selectedFile && this.state.selectedFile.type === 'dir') {
							// 移除目录路径末尾的斜杠，然后添加文件名
							const dirPath = this.state.selectedFile.path.replace(/\/$/, '');
							filePath = `${dirPath}/${file.name}`;
						}
						console.log('文件路径:', filePath);

						// 创建文件对象
						const newFile = {
							name: file.name,
							path: filePath,
							type: 'file',
							selected: false,
							isLocal: true,
							content: content,
							created: new Date().toISOString(),
							modified: new Date(file.lastModified).toISOString(),
							size: file.size
						};

						// 检查文件是否已存在
						const existingFiles = this.state.files.filter(f => f.path === filePath);
						if (existingFiles.length > 0) {
							// 询问是否覆盖
							this.showConfirmModal(
								this.t('projectDetail.fileOperations.modalTitles.confirmOverwrite', '确认覆盖'),
								this.t('projectDetail.fileOperations.fileExistsOverwrite', `文件 "${file.name}" 已存在，是否覆盖？`).replace('{fileName}', file.name),
								(confirmed) => {
									if (!confirmed) {
										return;
									}
									// 继续处理文件
									this.processFileUpload(file, content, filePath);
								}
							);
							continue;
						}

						// 保存到IndexedDB - 只保存到localWorkspace
						if (window.StorageService) {
							console.log('保存到IndexedDB...');
							await window.StorageService.initDB();

							// 只保存到localWorkspace
							await window.StorageService._execute('localWorkspace', 'put', {
								path: filePath,
								content: content,
								sha: '', // 上传的文件没有SHA
								created: newFile.created,
								modified: newFile.modified,
								isLocal: true,
								size: file.size
							});
							console.log('文件已保存到localWorkspace:', filePath);
						} else {
							console.error('StorageService不可用');
						}

						// 更新文件列表
						let updatedFiles;
						if (existingFiles.length > 0) {
							// 替换现有文件（按路径匹配）
							updatedFiles = this.state.files.map(f =>
								f.path === filePath ? newFile : f
							);
						} else {
							// 添加新文件
							updatedFiles = [...this.state.files, newFile];
						}

						this.setState({ files: updatedFiles });
						console.log('文件列表已更新，当前文件数量:', updatedFiles.length);
						successCount++;
					} catch (error) {
						console.error(`上传文件 ${file.name} 失败:`, error);
						errorCount++;
					}
				}

				// 重新渲染和绑定事件
				this.rerender();
				this.bindEvents();

				// 显示结果 - 只有失败时才显示对话框
				if (successCount === 0) {
					this.showInfoModal(
						this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
						this.t('projectDetail.fileOperations.uploadFailed', '文件上传失败！')
					);
				}
				// 上传成功无需显示对话框
			} catch (error) {
				this.showInfoModal(
					this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
					this.t('projectDetail.fileOperations.uploadError', '文件上传失败：{error}').replace('{error}', error.message)
				);
			}
		});

		// 触发文件选择
		fileInput.click();
	}

	// 读取文件为文本
	readFileAsText(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = (e) => reject(e);
			reader.readAsText(file);
		});
	}

	async handleCheckUpdate() {
		try {
			// 显示检查中的状态
			const checkBtn = this.element.querySelector('#checkUpdateBtn');
			if (checkBtn) {
				checkBtn.disabled = true;
				checkBtn.textContent = '🔄 ' + this.t('projectDetail.fileOperations.checking', '检查中...');
			}

			// 检查GitHub上的最新提交
			const projectUrl = this.state.project?.url || 'https://github.com/ZelaCreator/DPCC';
			const repoInfo = window.GitHubService.extractRepoInfo(projectUrl);

			if (!repoInfo) {
				throw new Error('无法解析项目URL');
			}

			// 获取GitHub API的最新提交信息
			const latestCommit = await window.GitHubService.getLatestCommit(repoInfo.owner, repoInfo.repo);

			if (!latestCommit) {
				throw new Error('无法获取最新提交信息');
			}

			// 获取本地同步信息
			const syncInfo = localStorage.getItem(`spcp-sync-${repoInfo.repo}`);
			const lastSyncCommit = syncInfo ? JSON.parse(syncInfo).lastCommit : null;

			// 比较提交SHA
			if (lastSyncCommit === latestCommit.sha) {
				this.showInfoModal(
					this.t('projectDetail.fileOperations.modalTitles.info', '信息'),
					this.t('projectDetail.fileOperations.projectUpToDate', '项目已是最新版本！')
				);
			} else {
				// 有新版本，询问是否同步
				this.showConfirmModal(
					this.t('projectDetail.fileOperations.modalTitles.updateAvailable', '发现新版本！'),
					this.t('projectDetail.fileOperations.newVersionFound', '发现新版本！') + '\n\n' +
					this.t('projectDetail.fileOperations.latestCommit', '最新提交：{message}').replace('{message}', latestCommit.message) + '\n' +
					this.t('projectDetail.fileOperations.committer', '提交者：{author}').replace('{author}', latestCommit.author) + '\n' +
					this.t('projectDetail.fileOperations.commitTime', '时间：{time}').replace('{time}', new Date(latestCommit.date).toLocaleString()) + '\n\n' +
					this.t('projectDetail.fileOperations.syncConfirm', '是否立即同步？'),
					async (confirmed) => {
						if (confirmed) {
							await this.syncProject(repoInfo.owner, repoInfo.repo, latestCommit.sha);
						}
					}
				);
			}
		} catch (error) {
			this.showInfoModal(
				this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
				this.t('projectDetail.fileOperations.checkUpdateFailed', '检查更新失败：{error}').replace('{error}', error.message)
			);
		} finally {
			// 恢复按钮状态
			const checkBtn = this.element.querySelector('#checkUpdateBtn');
			if (checkBtn) {
				checkBtn.disabled = false;
				checkBtn.textContent = '🔄 ' + this.t('projectDetail.checkUpdate', '检查更新');
			}
		}
	}


	// 同步项目
	async syncProject(owner, repo, commitSha) {
		try {
			// 显示同步中的状态
			this.showInfoModal(
				this.t('projectDetail.fileOperations.modalTitles.info', '正在同步项目'),
				this.t('projectDetail.fileOperations.syncing', '正在同步项目，请稍候...')
			);

			// 构建仓库URL
			const repositoryUrl = `https://github.com/${owner}/${repo}`;

			// 使用GitHub服务同步仓库数据
			await window.GitHubService.syncRepositoryData(owner, repo);

			// 重新加载项目数据
			await this.loadProjectData();
			this.rerender();
			this.bindEvents();

			// 保存同步信息
			const syncInfo = {
				lastSync: new Date().toISOString(),
				lastCommit: commitSha,
				repo: `${owner}/${repo}`
			};
			localStorage.setItem(`spcp-sync-${repo}`, JSON.stringify(syncInfo));

			// 同步成功，无需显示对话框
		} catch (error) {
			console.error('同步项目失败:', error);
			this.showInfoModal(
				this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
				this.t('projectDetail.fileOperations.syncFailed', '同步失败：{error}').replace('{error}', error.message)
			);
			throw error;
		}
	}

	handleFileOpen(file) {
		// 获取文件名（优先使用name，如果没有则从path中提取）
		const fileName = file.name || file.path.split('/').pop();

		// 检查文件类型
		if (this.isEditableFile(fileName)) {
			// 可编辑文件，跳转到编辑器页面
			if (window.app && window.app.router) {
				const editorUrl = `/editor?file=${encodeURIComponent(file.path)}&mode=edit`;
				window.app.router.navigateTo(editorUrl);
			}
		} else if (this.isViewableFile(fileName)) {
			// 图像文件，跳转到查看模式
			if (window.app && window.app.router) {
				const editorUrl = `/editor?file=${encodeURIComponent(file.path)}&mode=view`;
				window.app.router.navigateTo(editorUrl);
			}
		} else {
			// 不支持的文件类型
			this.showInfoModal(
				this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
				this.t('projectDetail.fileOperations.unsupportedFileType', `不支持的文件类型：${fileName}`).replace('{fileName}', fileName)
			);
		}
	}

	async handleFileDelete(file) {
		if (!file) {
			this.showInfoModal(
				this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
				this.t('projectDetail.fileOperations.selectFileFirst', '请先选择要删除的文件！')
			);
			return;
		}

		// 检查文件是否同时存在于本地工作空间和文件缓存
		const hasLocalVersion = file.isLocal;
		const hasCacheVersion = await this.checkFileInCache(file.path);

		// 确认删除
		let confirmMessage;
		if (hasLocalVersion && hasCacheVersion) {
			confirmMessage = file.type === 'dir'
				? this.t('projectDetail.fileOperations.confirmDeleteBothDir', `确定要删除目录 "${file.name}" 吗？\n\n该目录同时存在于本地工作空间和文件缓存中。\n将分两步删除：先删除本地版本，再删除缓存版本。\n\n注意：删除后无法恢复！`).replace('{dirName}', file.name)
				: this.t('projectDetail.fileOperations.confirmDeleteBothFile', `确定要删除文件 "${file.name}" 吗？\n\n该文件同时存在于本地工作空间和文件缓存中。\n将分两步删除：先删除本地版本，再删除缓存版本。\n\n注意：删除后无法恢复！`).replace('{fileName}', file.name);
		} else {
			confirmMessage = file.type === 'dir'
				? this.t('projectDetail.fileOperations.confirmDeleteDir', `确定要删除目录 "${file.name}" 吗？\n\n注意：目录删除后无法恢复！`).replace('{dirName}', file.name)
				: this.t('projectDetail.fileOperations.confirmDeleteFile', `确定要删除文件 "${file.name}" 吗？\n\n注意：文件删除后无法恢复！`).replace('{fileName}', file.name);
		}

		this.showConfirmModal(
			this.t('projectDetail.fileOperations.modalTitles.confirmDelete', '确认删除'),
			confirmMessage,
			async (confirmed) => {
				if (!confirmed) {
					return;
				}

				try {
					if (window.StorageService) {
						await window.StorageService.initDB();

						if (hasLocalVersion && hasCacheVersion) {
							// 情况1：文件同时存在于本地和缓存中
							// 只删除本地版本，保留缓存版本，文件还在目录树中但去掉本地图标
							await this.deleteFromLocalWorkspace(file);

							// 重新加载项目数据以更新文件列表
							await this.loadProjectData();
							this.rerender();
							this.bindEvents();

							// 清除选中状态
							this.setState({ selectedFile: null });
							this.updateActionButtons();

							// 删除成功，无需显示对话框

						} else if (hasLocalVersion && !hasCacheVersion) {
							// 情况2：只有本地版本，完全删除
							await this.deleteFromLocalWorkspace(file);

							// 从文件列表中移除
							let updatedFiles = this.state.files.filter(f => f.path !== file.path);

							// 如果是删除目录，还需要删除目录下的所有文件
							if (file.type === 'dir') {
								const dirPath = file.path.endsWith('/') ? file.path : file.path + '/';
								updatedFiles = updatedFiles.filter(f => !f.path.startsWith(dirPath));
							}

							this.setState({ files: updatedFiles });
							this.rerender();
							this.bindEvents();

							// 清除选中状态
							this.setState({ selectedFile: null });
							this.updateActionButtons();

							// 删除成功，无需显示对话框

						} else if (!hasLocalVersion && hasCacheVersion) {
							// 情况3：只有缓存版本，删除缓存并记录
							await this.deleteFromFileCache(file);
							await this.recordDeletion(file.path, 'cache');

							// 从文件列表中移除
							let updatedFiles = this.state.files.filter(f => f.path !== file.path);

							// 如果是删除目录，还需要删除目录下的所有文件
							if (file.type === 'dir') {
								const dirPath = file.path.endsWith('/') ? file.path : file.path + '/';
								updatedFiles = updatedFiles.filter(f => !f.path.startsWith(dirPath));
							}

							this.setState({ files: updatedFiles });
							this.rerender();
							this.bindEvents();

							// 清除选中状态
							this.setState({ selectedFile: null });
							this.updateActionButtons();

							// 删除成功，无需显示对话框
						}
					}

				} catch (error) {
					console.error('删除失败:', error);
					this.showInfoModal(
						this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
						this.t('projectDetail.fileOperations.deleteFailed', '删除失败：{error}').replace('{error}', error.message)
					);
				}
			}
		);
	}

	/**
	 * 检查文件是否存在于文件缓存中
	 */
	async checkFileInCache(filePath) {
		try {
			if (window.StorageService) {
				const cachedFile = await window.StorageService._execute('fileCache', 'get', filePath);
				return !!cachedFile;
			}
			return false;
		} catch (error) {
			console.error('检查文件缓存失败:', error);
			return false;
		}
	}

	/**
	 * 从本地工作空间删除文件
	 */
	async deleteFromLocalWorkspace(file) {
		try {
			await window.StorageService._execute('localWorkspace', 'delete', file.path);
			console.log('已从本地工作空间删除:', file.path);
		} catch (error) {
			console.error('从本地工作空间删除失败:', error);
			throw error;
		}
	}

	/**
	 * 从文件缓存删除文件
	 */
	async deleteFromFileCache(file) {
		try {
			await window.StorageService._execute('fileCache', 'delete', file.path);
			console.log('已从文件缓存删除:', file.path);
		} catch (error) {
			console.error('从文件缓存删除失败:', error);
			throw error;
		}
	}

	/**
	 * 记录删除操作到本地工作空间
	 */
	async recordDeletion(filePath, source) {
		try {
			const deletionRecord = {
				path: filePath,
				deletedFrom: source, // 'local' 或 'cache'
				deletedAt: new Date().toISOString(),
				action: 'delete'
			};

			// 保存删除记录到本地工作空间
			await window.StorageService._execute('localWorkspace', 'put', {
				path: `__deletions__/${filePath}`,
				content: JSON.stringify(deletionRecord),
				sha: '',
				created: deletionRecord.deletedAt,
				modified: deletionRecord.deletedAt,
				isLocal: true,
				isDeletionRecord: true
			});

			console.log('已记录删除操作:', deletionRecord);
		} catch (error) {
			console.error('记录删除操作失败:', error);
			// 不抛出错误，因为这只是记录操作
		}
	}

	/**
	 * 完全删除文件（包括本地工作空间和文件缓存）
	 */
	async deleteFileCompletely(file) {
		try {
			const hasLocalVersion = file.isLocal;
			const hasCacheVersion = await this.checkFileInCache(file.path);

			// 删除本地工作空间版本
			if (hasLocalVersion) {
				await this.deleteFromLocalWorkspace(file);
				await this.recordDeletion(file.path, 'local');
			}

			// 删除文件缓存版本
			if (hasCacheVersion) {
				await this.deleteFromFileCache(file);
				await this.recordDeletion(file.path, 'cache');
			}
		} catch (error) {
			console.error('完全删除文件失败:', error);
			throw error;
		}
	}

	// 处理文件上传的辅助方法
	async processFileUpload(file, content, filePath) {
		try {
			// 保存到IndexedDB - 只保存到localWorkspace
			if (window.StorageService) {
				console.log('保存到IndexedDB...');
				await window.StorageService.initDB();

				await window.StorageService._execute('localWorkspace', 'put', {
					path: filePath,
					content: content,
					sha: '', // 新文件没有SHA
					created: new Date().toISOString(),
					modified: new Date().toISOString(),
					isLocal: true,
					size: file.size
				});
			}

			// 创建文件对象
			const newFile = {
				name: file.name,
				path: filePath,
				type: 'file',
				selected: false,
				isLocal: true,
				content: content,
				created: new Date().toISOString(),
				modified: new Date().toISOString(),
				size: file.size
			};

			// 更新文件列表
			const updatedFiles = [...this.state.files];
			const existingIndex = updatedFiles.findIndex(f => f.path === filePath);
			if (existingIndex >= 0) {
				updatedFiles[existingIndex] = newFile;
			} else {
				updatedFiles.push(newFile);
			}

			this.setState({ files: updatedFiles });
			this.rerender();
			this.bindEvents();

			// 自动选中新上传的文件
			this.setState({ selectedFile: newFile });
			this.updateActionButtons();

		} catch (error) {
			console.error('处理文件上传失败:', error);
			this.showInfoModal(
				this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
				this.t('projectDetail.fileOperations.uploadError', '文件上传失败：{error}').replace('{error}', error.message)
			);
		}
	}

	destroy() {
		// 清理模态框
		if (this.state.modal) {
			this.state.modal.destroy();
			this.state.modal = null;
		}

		// 清理事件监听器
		if (this.element) {
			this.element.remove();
		}
	}
}

// 注册组件
window.ProjectDetailPage = ProjectDetailPage;
