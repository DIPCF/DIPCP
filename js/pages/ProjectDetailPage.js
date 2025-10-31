/**
 * 项目详情页面组件
 * 完全组件化的项目详情页面，提供文件管理、成员查看、活动记录等功能
 * @class ProjectDetailPage
 * @extends {BasePage}
 */
class ProjectDetailPage extends BasePage {
	/**
	 * 构造函数
	 * @param {Object} props - 组件属性
	 */
	constructor(props = {}) {
		super(props);

		// 从 localStorage 获取用户信息
		const userInfo = window.app.getUserFromStorage();

		// 从本地存储加载项目数据
		const projectData = this.loadProjectDataFromStorage();
		const filesData = this.loadFilesDataFromStorage();

		this.state = {
			project: projectData, // 从本地存储加载
			files: filesData, // 从本地存储加载
			selectedFile: null,
			showInfoPanel: false,
			infoPanelContent: null,
			loading: true,
			user: userInfo.user,
			userRole: userInfo.userRole,
			permissionInfo: userInfo.permissionInfo,
			// 模态框实例
			modal: null,
			// 功能模块状态缓存
			moduleStates: this.loadModuleStates(),
			// 成员数据缓存
			membersCache: null,
			membersLoading: false,
			// 目录折叠状态 - 默认所有目录都折叠
			collapsedDirs: new Set()
		};
	}

	/**
	 * 渲染组件
	 * @returns {HTMLElement} 渲染后的DOM元素
	 */
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

	/**
	 * 渲染页面头部
	 * @returns {string} 头部HTML字符串
	 */
	renderHeader() {
		// 使用BasePage的renderHeader方法
		return super.renderHeader('project-detail', false, null);
	}

	/**
	 * 渲染面包屑导航
	 * @returns {string} 面包屑HTML字符串
	 */
	renderBreadcrumb() {
		console.log('🔵 [ProjectDetailPage] renderBreadcrumb开始执行, state:', this.state);
		return `
            <div class="breadcrumb-container">
                <div class="breadcrumb">
                    <span class="breadcrumb-item">
                        📁 <span id="projectTitle">${this.state.user.repositoryInfo?.owner}/${this.state.user.repositoryInfo?.repo}</span>
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

	/**
	 * 渲染工具栏
	 * @returns {string} 工具栏HTML字符串
	 */
	renderToolbar() {
		// 根据用户角色决定显示哪些按钮
		const userRoles = this.state.permissionInfo?.roles || (this.state.userRole ? [this.state.userRole] : ['visitor']);
		const actualRoles = userRoles.filter(role => role !== 'visitor');
		const canEdit = actualRoles.length > 0; // 只要有实际角色就可以编辑

		return `
            <div class="editor-toolbar">
                <div class="editor-toolbar-left">
                    ${canEdit ? `
                        <button class="btn btn-sm" id="createFileBtn">📄 ${this.t('projectDetail.createFile', '创建文件')}</button>
                        <button class="btn btn-sm" id="createDirBtn">📁 ${this.t('projectDetail.createDirectory', '创建目录')}</button>
                        <button class="btn btn-sm" id="uploadFileBtn">📤 ${this.t('projectDetail.uploadFile', '上传文件')}</button>
                    ` : ''}
                    <button class="btn btn-sm" id="checkUpdateBtn">🔄 ${this.t('projectDetail.checkUpdate', '检查更新')}</button>
                </div>
                <div class="editor-toolbar-right">
                    <button class="btn btn-success btn-sm" id="openBtn" style="display: none;">👁 ${this.t('projectDetail.openFile', '打开')}</button>
                    ${canEdit ? `<button class="btn btn-danger btn-sm" id="deleteBtn" style="display: none;">🗑️ ${this.t('projectDetail.deleteFile', '删除')}</button>` : ''}
                </div>
            </div>
        `;
	}

	/**
	 * 渲染项目信息卡片
	 * @returns {string} 项目信息HTML字符串
	 */
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

	/**
	 * 渲染主要内容区域
	 * @returns {string} 主内容HTML字符串
	 */
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
	 * 从本地存储加载项目数据
	 * @returns {Object|null} 项目数据对象或null
	 */
	loadProjectDataFromStorage() {
		try {
			const cached = localStorage.getItem('dipcp-project-data');
			if (cached) {
				const projectData = JSON.parse(cached);
				return projectData;
			}
		} catch (error) {
			console.error('加载项目数据失败:', error);
		}
		return null;
	}

	/**
	 * 从本地存储加载文件数据
	 * @returns {Array} 文件数据数组
	 */
	loadFilesDataFromStorage() {
		try {
			const cached = localStorage.getItem('dipcp-files-data');
			if (cached) {
				const filesData = JSON.parse(cached);
				return filesData || [];
			}
		} catch (error) {
			console.error('加载文件数据失败:', error);
		}
		return [];
	}

	/**
	 * 加载模块状态缓存
	 * @returns {Object} 模块状态对象
	 */
	loadModuleStates() {
		try {
			const cached = localStorage.getItem('dipcp-project-module-states');
			const states = cached ? JSON.parse(cached) : {
				projectInfo: false,
				members: false,
				activity: false,
				pending: false
			};
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
	 * 保存项目数据到本地存储
	 * @param {Object} project - 项目数据对象
	 * @returns {void}
	 */
	saveProjectDataToStorage(project) {
		try {
			localStorage.setItem('dipcp-project-data', JSON.stringify(project));
		} catch (error) {
			console.error('保存项目数据失败:', error);
		}
	}

	/**
	 * 保存文件数据到本地存储
	 * @param {Array} files - 文件数据数组
	 * @returns {void}
	 */
	saveFilesDataToStorage(files) {
		try {
			localStorage.setItem('dipcp-files-data', JSON.stringify(files));
		} catch (error) {
			console.error('保存文件数据失败:', error);
		}
	}

	/**
	 * 保存模块状态缓存
	 * @returns {void}
	 */
	saveModuleStates() {
		try {
			localStorage.setItem('dipcp-project-module-states', JSON.stringify(this.state.moduleStates));
		} catch (error) {
			console.error('保存模块状态缓存失败:', error);
		}
	}

	/**
	 * 加载成员数据缓存
	 * @returns {Promise<Array|null>} 成员数据数组或null
	 */
	async loadMembersCache() {
		try {
			// 从用户数据中获取仓库信息
			const userData = localStorage.getItem('dipcp-user');
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
	 * @param {Array} membersData - 成员数据数组
	 * @returns {Promise<void>}
	 */
	async saveMembersCache(membersData) {
		try {
			// 从用户数据中获取仓库信息
			const userData = localStorage.getItem('dipcp-user');
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
	 * @param {string} moduleName - 模块名称
	 * @param {boolean} isOpen - 是否打开
	 * @returns {void}
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
	 * @returns {void}
	 */
	restoreModuleStates() {
		// 防止重复调用
		if (this._restoreModuleStatesCalled) {
			return;
		}
		this._restoreModuleStatesCalled = true;

		// 延迟执行，确保DOM已经渲染完成
		setTimeout(() => {

			if (this.state.moduleStates.projectInfo) {
				this.showProjectInfo();
			}
			if (this.state.moduleStates.members) {
				this.showMembers();
			}
			if (this.state.moduleStates.activity) {
				this.showActivity();
			}
			if (this.state.moduleStates.pending) {
				this.showPendingReviews();
			}
		}, 100);
	}

	/**
	 * 初始化模态框
	 * @returns {void}
	 */
	initModal() {
		if (!this.state.modal) {
			this.state.modal = new Modal();
			this.state.modal.element = null;
			// 不在这里渲染，而是在显示时才渲染
		}
	}

	/**
	 * 显示输入模态框
	 * @param {string} title - 标题
	 * @param {string} message - 消息
	 * @param {string} [placeholder=''] - 占位符
	 * @param {string} [defaultValue=''] - 默认值
	 * @param {Function} [callback=null] - 回调函数
	 * @returns {void}
	 */
	showInputModal(title, message, placeholder = '', defaultValue = '', callback = null) {
		this.initModal();

		// 调用showInput来设置状态，如果element不存在会创建
		this.state.modal.showInput(title, message, placeholder, defaultValue, callback);

		// 如果element不存在，说明是第一次创建，需要创建DOM
		if (!this.state.modal.element) {
			const modalElement = this.state.modal.render();
			if (modalElement) {
				document.body.appendChild(modalElement);
				this.state.modal.element = modalElement;
			}
		}
	}

	/**
	 * 显示确认模态框
	 * @param {string} title - 标题
	 * @param {string} message - 消息
	 * @param {Function} [callback=null] - 回调函数
	 * @returns {void}
	 */
	showConfirmModal(title, message, callback = null) {
		this.initModal();

		// 调用showConfirm来设置状态，如果element不存在会创建
		this.state.modal.showConfirm(title, message, callback);

		// 如果element不存在，说明是第一次创建，需要创建DOM
		if (!this.state.modal.element) {
			const modalElement = this.state.modal.render();
			if (modalElement) {
				document.body.appendChild(modalElement);
				this.state.modal.element = modalElement;
			}
		}
	}

	/**
	 * 显示信息模态框
	 * @param {string} title - 标题
	 * @param {string} message - 消息
	 * @returns {void}
	 */
	showInfoModal(title, message) {
		this.initModal();

		// 调用showInfo来设置状态，如果element不存在会创建
		this.state.modal.showInfo(title, message);

		// 如果element不存在，说明是第一次创建，需要创建DOM
		if (!this.state.modal.element) {
			const modalElement = this.state.modal.render();
			if (modalElement) {
				document.body.appendChild(modalElement);
				this.state.modal.element = modalElement;
			}
		}
	}

	/**
	 * 渲染文件列表
	 * @returns {string} 文件列表HTML字符串
	 */
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

	/**
	 * 构建文件树结构
	 * @param {Array} files - 文件数组
	 * @returns {Object} 文件树对象
	 */
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

						// 检查该目录下是否有任何本地文件
						const hasLocalFile = files.some(f => f.path.startsWith(dirPath) && f.isLocal);

						current[part] = {
							type: 'dir',
							children: {},
							path: dirPath,
							name: part,
							selected: dirFile ? dirFile.selected : false,
							isLocal: dirFile ? dirFile.isLocal : hasLocalFile,
							created: dirFile ? dirFile.created : new Date().toISOString(),
							modified: dirFile ? dirFile.modified : new Date().toISOString()
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

	/**
	 * 渲染文件树
	 * @param {Object} tree - 文件树对象
	 * @param {number} [level=0] - 层级深度
	 * @returns {string} 文件树HTML字符串
	 */
	renderFileTree(tree, level = 0) {
		let html = '';
		const indent = '  '.repeat(level);

		Object.keys(tree).sort().forEach(key => {
			const item = tree[key];

			if (item.type === 'dir') {
				// 目录 - 只显示最后一部分路径
				const displayName = key.split('/').pop() + '/';
				const localIcon = item.isLocal ? '🏠' : '';
				const dirPath = item.path || key + '/';
				const isCollapsed = this.state.collapsedDirs.has(dirPath);
				const hasChildren = item.children && Object.keys(item.children).length > 0;
				const toggleIcon = hasChildren ? (isCollapsed ? '▶' : '▼') : '📁';

				// 计算目录内的文件数量
				const fileCount = item.children ? Object.keys(item.children).filter(k => {
					const child = item.children[k];
					return !child || !child.type || child.type !== 'dir';
				}).length : 0;

				html += `
			<div class="file-item dir-item ${item.selected ? 'selected' : ''} ${isCollapsed ? 'collapsed' : 'expanded'}" 
				 data-path="${dirPath}" 
				 data-type="dir" 
				 data-local="${item.isLocal || true}"
				 style="padding-left: ${level * 20}px;">
				<span class="file-icon dir-toggle" data-path="${dirPath}" data-has-children="${hasChildren}">${localIcon}${toggleIcon}</span>
				<span class="file-name">${displayName}</span>
				<span class="file-info">${fileCount} ${this.t('projectDetail.files', '个文件')}</span>
			</div>
		`;

				// 如果有子项且未折叠，递归渲染
				if (item.children && !isCollapsed) {
					html += this.renderFileTree(item.children, level + 1);
				}
			} else if (item.path) {
				// 文件
				const localIcon = item.isLocal ? '🏠' : '';

				// 格式化文件大小（0也合法，只有undefined/null才显示-）
				const fileSize = item.size != null ? this.formatFileSize(item.size) : '-';

				// 格式化创建时间（包含日期和时间）
				const createdTime = item.created ? new Date(item.created).toLocaleString('zh-CN', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				}) : '-';

				html += `
				<div class="file-item file-item ${item.selected ? 'selected' : ''}" 
					 data-path="${item.path}" 
					 data-type="${item.type}" 
					 data-local="${item.isLocal}"
					 style="padding-left: ${level * 20}px;">
					<span class="file-icon">${localIcon}${item.type === 'dir' ? '📁' : '📄'}</span>
					<span class="file-name">${item.name}</span>
					<span class="file-info">${fileSize} • ${createdTime}</span>
				</div>
			`;
			}
		});

		return html;
	}

	/**
	 * 格式化文件大小
	 * @param {number} bytes - 文件大小（字节）
	 * @returns {string} 格式化后的文件大小
	 */
	formatFileSize(bytes) {
		if (!bytes || bytes === 0) return '0 B';

		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	/**
	 * 挂载组件到容器
	 * @param {HTMLElement} container - 容器元素
	 * @returns {void}
	 */
	mount(container) {
		super.mount(container);

		// 检查并更新用户信息（从 localStorage 读取最新状态）
		this.checkAndUpdateUserInfo();

		// 加载项目数据，loadProjectData方法内部会调用bindEvents
		this.loadProjectData();
	}

	/**
	 * 检查并更新用户信息
	 */
	checkAndUpdateUserInfo() {
		const userInfo = window.app.getUserFromStorage();
		const user = userInfo.user;
		const currentRole = userInfo.userRole;
		const currentPermissionInfo = userInfo.permissionInfo;

		// 如果用户信息或角色发生变化，更新状态
		if (this.state.user !== user || this.state.userRole !== currentRole || this.state.permissionInfo !== currentPermissionInfo) {
			this.setState({
				user: user,
				userRole: currentRole,
				permissionInfo: currentPermissionInfo
			});
			// 角色变化后更新工具栏按钮状态
			if (this.updateActionButtons) {
				this.updateActionButtons();
			}
		}
	}


	/**
	 * 加载项目数据
	 * @returns {Promise<void>}
	 */
	async loadProjectData() {
		try {
			// 检查是否有用户数据
			if (!this.state.user) {
				this.setState({
					loading: false,
					files: [],
					project: null,
					userRole: 'visitor', // 确保访客角色
					collapsedDirs: new Set()
				});
				// 不需要 rerender，因为页面已经显示了加载中的状态
				return Promise.resolve();
			}

			console.log('ProjectDetailPage: 当前用户角色为:', this.state.userRole);

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
						// 如果没有创建时间，使用当前时间作为默认值（旧数据）
						const createdTime = file.created || new Date().toISOString();
						const modifiedTime = file.modified || createdTime;

						const fileInfo = {
							name: file.path.split('/').pop() || file.path,
							path: file.path,
							type: file.path.endsWith('/') ? 'dir' : 'file',
							selected: false,
							isLocal: false,
							created: createdTime,
							modified: modifiedTime,
							size: file.size || 0
						};
						fileMap.set(file.path, fileInfo);
					});

					// 再添加本地工作空间的文件（用户编辑的版本，会覆盖缓存版本）
					workspaceFiles.forEach(file => {
						// 如果没有创建时间，使用当前时间作为默认值（旧数据）
						const createdTime = file.created || new Date().toISOString();
						const modifiedTime = file.modified || createdTime;

						const fileInfo = {
							name: file.path.split('/').pop() || file.path,
							path: file.path,
							type: file.path.endsWith('/') ? 'dir' : 'file',
							selected: false,
							isLocal: true,
							created: createdTime,
							modified: modifiedTime,
							size: file.size || 0
						};
						fileMap.set(file.path, fileInfo);
					});

					// 转换为数组并过滤掉删除记录目录
					const files = Array.from(fileMap.values()).filter(file =>
						!file.path.startsWith('__deletions__/') &&
						!file.path.startsWith('_deletions/')
					);

					// 构建文件树以获取所有目录路径
					const tree = this.buildFileTree(files);

					// 收集所有目录路径
					const allCollapsedDirs = new Set();
					const collectDirPaths = (node) => {
						Object.keys(node).forEach(key => {
							const item = node[key];
							if (item && (item.type === 'dir' || item.path.endsWith('/'))) {
								allCollapsedDirs.add(item.path);
								if (item.children) {
									collectDirPaths(item.children);
								}
							}
						});
					};
					collectDirPaths(tree);

					// 从用户数据中获取仓库信息
					const user = this.state.user;
					const repoInfo = user?.repositoryInfo;
					const projectName = repoInfo?.repo || 'Unknown Project';
					const projectOwner = repoInfo?.owner || 'Unknown Owner';
					const projectUrl = `https://github.com/${projectOwner}/${projectName}`;

					const projectData = {
						name: projectName,
						url: projectUrl,
						description: this.t('projectDetail.defaultDescription', '项目描述')
					};

					this.setState({
						loading: false,
						project: projectData,
						files: files,
						collapsedDirs: allCollapsedDirs
					});


				} catch (dbError) {
					console.log('Error loading from IndexedDB:', dbError);
					// 如果加载失败，设置空文件列表
					// 从用户数据中获取仓库信息
					const user = this.state.user;
					const repoInfo = user?.repositoryInfo;
					const projectName = repoInfo?.repo || 'Unknown Project';
					const projectOwner = repoInfo?.owner || 'Unknown Owner';
					const projectUrl = `https://github.com/${projectOwner}/${projectName}`;

					const projectData = {
						name: projectName,
						url: projectUrl,
						description: this.t('projectDetail.defaultDescription', '项目描述')
					};

					this.setState({
						loading: false,
						project: projectData,
						files: [],
						collapsedDirs: new Set()
					});

				}
			}

			// 更新项目信息DOM和文件列表显示
			if (this.element) {
				this.updateProjectInfoDOM(this.state.project);
				this.updateFileListDOM(this.state.files);
				// 更新操作按钮状态
				this.updateActionButtons();
			}

			// 根据缓存状态自动显示相应的模块
			this.restoreModuleStates();

			// 绑定事件
			this.bindEvents();
		} catch (error) {
			console.error('Error loading project data:', error);

		}
	}

	/**
	 * 绑定事件监听器
	 * @returns {void}
	 */
	bindEvents() {
		if (!this.element) {
			console.warn('Cannot bind events: element not mounted');
			return;
		}

		// 绑定Header组件的事件
		this.bindHeaderEvents();
		// 绑定文件项事件
		this.bindFileItemEvents();

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
					this.updateInfoPanelDOM(false);
				}
			});
		}

		// 绑定成员卡片点击事件
		this.bindContributorCardEvents();
	}

	/**
	 * 绑定成员卡片点击事件
	 */
	bindContributorCardEvents() {
		const contributorCards = this.element.querySelectorAll('.contributor-card');
		contributorCards.forEach(card => {
			// 移除旧的事件监听器
			const newCard = card.cloneNode(true);
			card.parentNode.replaceChild(newCard, card);

			// 添加新的点击事件
			newCard.addEventListener('click', () => {
				const username = newCard.dataset.username;
				if (username && window.app && window.app.navigateTo) {
					window.app.navigateTo(`/user-profile?username=${username}`);
				}
			});
		});
	}

	/**
	 * 更新项目信息DOM
	 * @param {Object} project - 项目信息对象
	 * @returns {void}
	 */
	updateProjectInfoDOM(project) {
		if (!this.element) return;

		// 更新项目信息卡片中的各个字段
		const creator = this.element.querySelector('#creator');
		if (creator && project?.creator) {
			creator.textContent = project.creator;
		}

		const description = this.element.querySelector('#description');
		if (description && project?.description) {
			description.textContent = project.description;
		}

		const contributors = this.element.querySelector('#contributors');
		if (contributors && project?.contributors) {
			contributors.textContent = project.contributors;
		}

		const lastUpdated = this.element.querySelector('#lastUpdated');
		if (lastUpdated && project?.lastUpdated) {
			lastUpdated.textContent = project.lastUpdated;
		}

		const status = this.element.querySelector('#status');
		if (status && project?.status) {
			status.textContent = project.status;
		}
	}

	/**
	 * 更新文件列表DOM
	 * @param {Array} files - 文件数组
	 * @returns {void}
	 */
	updateFileListDOM(files) {
		if (!this.element) return;

		const fileList = this.element.querySelector('#fileList');
		if (fileList) {
			if (files.length === 0) {
				fileList.innerHTML = `<div class="empty">${this.t('projectDetail.noFiles', '暂无文件')}</div>`;
			} else {
				// 构建树状结构
				const tree = this.buildFileTree(files);
				fileList.innerHTML = this.renderFileTree(tree);
			}

			// 重新绑定文件项的事件（不重新绑定所有事件，避免重复绑定）
			// 只绑定文件项相关的事件
			this.bindFileItemEventsOnly();
		}
	}

	/**
	 * 更新信息面板DOM
	 * @param {boolean} show - 是否显示
	 * @param {string} [content=''] - 面板内容
	 * @param {string} [title=''] - 面板标题
	 * @returns {void}
	 */
	updateInfoPanelDOM(show, content = '', title = '') {
		if (!this.element) return;

		const infoPanel = this.element.querySelector('#infoPanel');
		const infoPanelContent = this.element.querySelector('#infoPanelContent');
		const infoPanelTitle = this.element.querySelector('#infoPanelTitle');

		if (infoPanel) {
			infoPanel.style.display = show ? 'block' : 'none';
		}

		if (show && content && infoPanelContent) {
			infoPanelContent.innerHTML = content;
		}

		if (show && title && infoPanelTitle) {
			infoPanelTitle.textContent = title;
		}
	}

	/**
	 * 绑定文件项事件
	 * @returns {void}
	 */
	bindFileItemEvents() {
		this.bindFileItemEventsOnly();
	}

	/**
	 * 仅绑定文件项事件（避免重复绑定工具栏按钮等其他事件）
	 * @returns {void}
	 */
	bindFileItemEventsOnly() {
		if (!this.element) return;

		const fileItems = this.element.querySelectorAll('.file-item');
		fileItems.forEach(item => {
			// 移除旧的事件监听器
			item.replaceWith(item.cloneNode(true));
		});

		// 绑定目录展开/折叠事件
		const dirToggles = this.element.querySelectorAll('.dir-toggle');
		dirToggles.forEach(toggle => {
			toggle.addEventListener('click', (e) => {
				e.stopPropagation();
				const path = e.currentTarget.dataset.path;
				const hasChildren = e.currentTarget.dataset.hasChildren === 'true';

				if (hasChildren) {
					// 切换折叠状态
					const newCollapsedDirs = new Set(this.state.collapsedDirs);
					if (newCollapsedDirs.has(path)) {
						newCollapsedDirs.delete(path);
					} else {
						newCollapsedDirs.add(path);
					}

					this.setState({ collapsedDirs: newCollapsedDirs });
					this.updateFileListDOM(this.state.files);
				}
			});
		});

		// 重新获取文件项并绑定事件
		const newFileItems = this.element.querySelectorAll('.file-item');
		newFileItems.forEach(item => {
			item.addEventListener('click', (e) => {
				const path = e.currentTarget.dataset.path;
				const type = e.currentTarget.dataset.type;

				// 更新选中状态
				newFileItems.forEach(f => f.classList.remove('selected'));
				e.currentTarget.classList.add('selected');

				// 从文件列表中查找完整的文件信息
				const fullFileInfo = this.state.files.find(f => f.path === path);
				const selectedFile = fullFileInfo || { path, type, name: path.split('/').pop() };
				this.setState({ selectedFile });
				this.updateActionButtons();
			});
		});
	}

	/**
	 * 更新操作按钮状态
	 * @returns {void}
	 */
	updateActionButtons() {
		const openBtn = this.element.querySelector('#openBtn');
		const deleteBtn = this.element.querySelector('#deleteBtn');

		if (openBtn) {
			if (this.state.selectedFile) {
				if (this.state.selectedFile.type === 'file') {
					// 获取文件名（优先使用name，如果没有则从path中提取）
					const fileName = this.state.selectedFile.name || this.state.selectedFile.path.split('/').pop();

					// 检查文件是否可编辑
					if (this.isEditableFile(fileName)) {
						openBtn.style.display = 'block';
						openBtn.textContent = '👁 ' + this.t('projectDetail.openFile', '打开');
						openBtn.disabled = false;
						openBtn.title = this.t('projectDetail.openFile', '打开文件');
					} else if (this.isViewableFile(fileName)) {
						openBtn.style.display = 'block';
						openBtn.textContent = '👁 ' + this.t('projectDetail.viewFile', '查看');
						openBtn.disabled = false;
						openBtn.title = this.t('projectDetail.viewFile', '查看文件');
					} else {
						// 不可查看的文件，显示提示但禁用按钮
						openBtn.style.display = 'block';
						openBtn.textContent = '🚫 ' + this.t('projectDetail.cannotView', '不可查看');
						openBtn.disabled = true;
						openBtn.title = this.t('projectDetail.cannotViewFile', '此文件类型不可查看');
					}
				} else {
					// 目录，显示不可查看提示
					openBtn.style.display = 'block';
					openBtn.textContent = '🚫 ' + this.t('projectDetail.cannotView', '不可查看');
					openBtn.disabled = true;
					openBtn.title = this.t('projectDetail.cannotViewDirectory', '目录不可查看');
				}
			} else {
				openBtn.style.display = 'none';
			}
		}

		// 只有有编辑权限的用户才显示删除按钮
		if (deleteBtn) {
			if (this.state.selectedFile) {
				// 检查是否是.github目录或其下的文件
				const filePath = this.state.selectedFile.path;
				const isProtectedPath = filePath.startsWith('.github/');

				if (isProtectedPath) {
					deleteBtn.style.display = 'none';
				} else {
					deleteBtn.style.display = 'block';
				}
			} else {
				deleteBtn.style.display = 'none';
			}
		}
	}

	/**
	 * 更新项目信息
	 * @param {Object} project - 项目信息对象
	 * @returns {void}
	 */
	updateProject(project) {
		this.setState({ project });
		this.updateProjectInfoDOM(project);
		// 保存到本地存储
		this.saveProjectDataToStorage(project);
	}

	/**
	 * 更新文件列表
	 * @param {Array} files - 文件数组
	 * @returns {void}
	 */
	updateFiles(files) {
		this.setState({ files });
		this.updateFileListDOM(files);
		// 保存到本地存储
		this.saveFilesDataToStorage(files);
	}

	/**
	 * 显示信息面板
	 * @param {string} content - 面板内容
	 * @param {string} [title=null] - 面板标题
	 * @returns {void}
	 */
	showInfoPanel(content, title = null) {
		if (!title) {
			title = this.t('projectDetail.details', '详细信息');
		}
		this.setState({
			showInfoPanel: true,
			infoPanelContent: content
		});
		this.updateInfoPanelDOM(true, content, title);

		// 延迟滚动，确保DOM已渲染
		setTimeout(() => {
			this.scrollToInfoPanel();
		}, 100);
	}

	/**
	 * 滚动到信息面板
	 * @returns {void}
	 */
	scrollToInfoPanel() {
		const infoPanel = this.element.querySelector('#infoPanel');
		if (infoPanel) {
			// 平滑滚动到信息面板，确保用户能看到新打开的内容
			setTimeout(() => {
				infoPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });

				// 额外滚动，确保内容可见
				window.scrollBy({
					top: window.innerHeight * 0.3, // 再向下滚动30%的视口高度
					behavior: 'smooth'
				});
			}, 50);
		}
	}

	/**
	 * 隐藏信息面板
	 * @returns {void}
	 */
	hideInfoPanel() {
		this.setState({ showInfoPanel: false });
		this.updateInfoPanelDOM(false);
	}

	/**
	 * 切换项目信息显示状态
	 * @returns {void}
	 */
	toggleProjectInfo() {
		const isCurrentlyVisible = this.state.moduleStates.projectInfo;

		if (!isCurrentlyVisible) {
			this.updateModuleState('projectInfo', true);
			this.showProjectInfo();
		} else {
			this.hideProjectInfo();
		}
	}

	/**
	 * 显示项目信息
	 * @returns {void}
	 */
	showProjectInfo() {
		// 直接显示项目信息卡片
		const projectInfoSection = this.element.querySelector('#project-info-section');
		if (projectInfoSection) {
			projectInfoSection.style.display = 'block';
		}
	}

	/**
	 * 隐藏项目信息
	 * @returns {void}
	 */
	hideProjectInfo() {
		const projectInfoSection = this.element.querySelector('#project-info-section');
		if (projectInfoSection) {
			projectInfoSection.style.display = 'none';
		}
		// 更新状态
		this.updateModuleState('projectInfo', false);
	}

	/**
	 * 为成员列表添加角色信息
	 * @async
	 * @param {Array} contributors - 贡献者列表
	 * @returns {Promise<Array>} 包含角色信息的贡献者列表
	 */
	async enrichContributorsWithRoles(contributors) {
		// 使用app.js的统一方法来添加角色信息
		if (window.app && window.app.enrichContributorsWithRoles) {
			return await window.app.enrichContributorsWithRoles(contributors);
		}
		// 如果app.js不可用，返回原始列表
		return contributors;
	}

	/**
	 * 切换成员信息显示状态
	 * @returns {void}
	 */
	toggleMembers() {
		const isCurrentlyVisible = this.state.moduleStates.members;

		if (!isCurrentlyVisible) {
			this.updateModuleState('members', true);
			this.showMembers();
		} else {
			this.hideMembers();
		}
	}

	/**
	 * 显示成员信息
	 * @param {boolean} [forceRefresh=false] - 是否强制刷新
	 * @returns {Promise<void>}
	 */
	async showMembers(forceRefresh = false) {
		console.log('showMembers', forceRefresh);
		// 如果有缓存且不是强制刷新，直接显示缓存数据
		if (this.state.membersCache && !forceRefresh) {
			const content = this.renderContributorsList(this.state.membersCache);
			this.showInfoPanel(content, this.t('projectDetail.projectMembers', '项目成员'));

			// 绑定成员卡片点击事件
			setTimeout(() => {
				this.bindContributorCardEvents();
			}, 100);
			return;
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
			if (!this.state.user) {
				throw new Error(this.t('projectDetail.errors.userNotLoggedIn', '用户未登录'));
			}

			const user = this.state.user;
			const repoInfo = user.repositoryInfo;

			if (!repoInfo || !user.token) {
				throw new Error(this.t('projectDetail.errors.repositoryInfoUnavailable', '仓库信息或访问令牌不可用'));
			}

			// 从 IndexedDB 读取 collaborators.txt 文件
			if (!window.StorageService) {
				throw new Error('StorageService 不可用');
			}

			await window.StorageService.initDB();
			const collaboratorsFile = await window.StorageService._execute('fileCache', 'get', '.github/collaborators.txt');

			if (!collaboratorsFile || !collaboratorsFile.content) {
				throw new Error('无法读取协作者列表文件');
			}

			// 解析 collaborators.txt 文件内容（每行一个用户名）
			const usernames = collaboratorsFile.content
				.split('\n')
				.map(line => line.trim())
				.filter(line => line && !line.startsWith('#'));

			console.log('从 collaborators.txt 读取到的用户名:', usernames);

			// 获取每个用户的详细信息（头像等）
			const octokit = new window.Octokit({ auth: user.token });
			const contributors = [];

			for (const username of usernames) {
				try {
					const { data: userData } = await octokit.rest.users.getByUsername({
						username: username
					});
					contributors.push({
						login: userData.login,
						avatar_url: userData.avatar_url,
						...userData
					});
				} catch (error) {
					console.warn(`获取用户 ${username} 的信息失败:`, error);
					// 即使获取失败，也添加基本信息
					contributors.push({
						login: username,
						avatar_url: '👤'
					});
				}
			}

			// 为每个成员添加角色信息（从角色文件中读取）
			const enrichedContributors = await this.enrichContributorsWithRoles(contributors);

			// 缓存数据
			this.setState({
				membersCache: enrichedContributors,
				membersLoading: false
			});

			// 渲染贡献者列表
			const content = this.renderContributorsList(enrichedContributors);
			this.showInfoPanel(content, this.t('projectDetail.projectMembers', '项目成员'));

			// 绑定成员卡片点击事件（延迟执行，确保DOM已渲染）
			setTimeout(() => {
				this.bindContributorCardEvents();
			}, 100);

		} catch (error) {
			console.error('获取成员列表失败:', error);
			this.setState({ membersLoading: false });

			const errorContent = `
				<div class="info-section">
					<h4>${this.t('projectDetail.projectMembers', '项目成员')}</h4>
					<div class="error-message">
						<p>${this.t('projectDetail.membersLoadError', '获取成员列表失败：{error}').replace('{error}', error.message)}</p>
						<p class="error-hint">${this.t('projectDetail.membersLoadHint', '可能的原因：权限不足或网络连接问题')}</p>
					</div>
				</div>
			`;
			this.showInfoPanel(errorContent, this.t('projectDetail.projectMembers', '项目成员'));
		}
	}

	/**
	 * 隐藏成员信息
	 * @returns {void}
	 */
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
	 * @param {Array} contributors - 贡献者数组
	 * @returns {string} 贡献者列表HTML字符串
	 */
	renderContributorsList(contributors) {
		const contributorsHtml = contributors.map(contributor => {
			const avatar = contributor.avatar_url || '👤';
			const name = contributor.login || 'Unknown';
			// 获取角色的图标
			const roles = contributor.roles || [];
			const roleIcons = roles.map(role => {
				const roleInfo = this.getRoleInfo(role);
				return roleInfo.displayName;
			}).join(' ');

			return `
				<div class="stat-card contributor-card" data-username="${name}" style="cursor: pointer;">
					<div class="stat-icon contributor-avatar" style="background-image: url('${avatar}'); background-size: cover; background-position: center;">
						${avatar.startsWith('http') ? '' : avatar}
					</div>
					<div class="stat-content">
						<h3>${name}</h3>
						<p class="stat-number">${roleIcons}</p>
					</div>
				</div>
			`;
		}).join('');

		return `
			<div class="info-section">
				<div class="section-header">
					<h4>${this.t('projectDetail.projectMembers', '项目成员')} (${contributors.length})</h4>
				</div>
				<div class="stats-grid">
					${contributorsHtml}
				</div>
			</div>
		`;
	}

	/**
	 * 获取角色信息（包含样式类名）
	 * @param {string} role - 角色名称
	 * @returns {Object} 角色信息对象
	 */
	getRoleInfo(role) {
		const roleIcons = {
			'owner': '💼',
			'director': '👑',
			'maintainer': '📝',
			'reviewer': '✨',
			'collaborator': '✏️',
			'visitor': '👤'
		};
		const icon = roleIcons[role] || '❓';
		return { displayName: icon };
	}

	/**
	 * 切换活动信息显示状态
	 * @returns {void}
	 */
	toggleActivity() {
		const isCurrentlyVisible = this.state.moduleStates.activity;

		if (!isCurrentlyVisible) {
			this.updateModuleState('activity', true);
			this.showActivity();
		} else {
			this.hideActivity();
		}
	}

	/**
	 * 显示活动信息
	 * @returns {void}
	 */
	showActivity() {
		const content = `
			<div class="info-section">
				<h4>${this.t('projectDetail.recentActivity', '最近活动')}</h4>
				<p>${this.t('projectDetail.activityDescription', '这里显示项目最近的活动记录，包括提交、合并等。')}</p>
			</div>
		`;
		this.showInfoPanel(content, this.t('projectDetail.recentActivity', '最近活动'));
	}

	/**
	 * 隐藏活动信息
	 * @returns {void}
	 */
	hideActivity() {
		// 如果活动信息在信息面板中显示，关闭信息面板
		if (this.state.showInfoPanel) {
			this.hideInfoPanel();
		}
		// 更新状态
		this.updateModuleState('activity', false);
	}

	/**
	 * 切换待审核内容显示状态
	 * @returns {void}
	 */
	togglePendingReviews() {
		const isCurrentlyVisible = this.state.moduleStates.pending;

		if (!isCurrentlyVisible) {
			this.updateModuleState('pending', true);
			this.showPendingReviews();
		} else {
			this.hidePendingReviews();
		}
	}

	/**
	 * 显示待审核内容
	 * @returns {void}
	 */
	showPendingReviews() {
		const content = `
			<div class="info-section">
				<h4>${this.t('projectDetail.pendingReviews', '待审核内容')}</h4>
				<p>${this.t('projectDetail.pendingDescription', '这里显示待审核的内容列表。')}</p>
			</div>
		`;
		this.showInfoPanel(content, this.t('projectDetail.pendingReviews', '待审核内容'));
	}

	/**
	 * 隐藏待审核内容
	 * @returns {void}
	 */
	hidePendingReviews() {
		// 如果待审核信息在信息面板中显示，关闭信息面板
		if (this.state.showInfoPanel) {
			this.hideInfoPanel();
		}
		// 更新状态
		this.updateModuleState('pending', false);
	}

	/**
	 * 处理创建文件
	 * @returns {Promise<void>}
	 */
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
						modified: new Date().toISOString(),
						size: 0 // 空文件大小为0
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
							isLocal: true,
							size: 0, // 空文件大小为0
							type: 'file' // 添加文件类型
						});
					}

					// 更新文件列表
					const updatedFiles = [...this.state.files, newFile];
					this.setState({ files: updatedFiles });
					this.updateFileListDOM(updatedFiles);

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

	/**
	 * 验证文件名是否有效
	 * @param {string} fileName - 文件名
	 * @returns {boolean} 是否有效
	 */
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
	 * @param {string} fileName - 文件名
	 * @returns {boolean} 是否可编辑
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
			'COPYING', 'INSTALL', 'NEWS', 'TODO', 'HISTORY', 'VERSION',
			'GITIGNORE', 'GITATTRIBUTES', 'DOCKERFILE', 'MAKEFILE'
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
	 * @param {string} fileName - 文件名
	 * @returns {boolean} 是否可查看
	 */
	isViewableFile(fileName) {
		const viewableExtensions = [
			'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
			'ico', 'tiff', 'tif', 'psd', 'ai', 'eps'
		];

		const extension = fileName.split('.').pop()?.toLowerCase();
		return viewableExtensions.includes(extension);
	}

	/**
	 * 处理创建目录
	 * @returns {Promise<void>}
	 */
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
					this.updateFileListDOM(updatedFiles);

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

	/**
	 * 处理文件上传
	 * @returns {void}
	 */
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

				// 更新文件列表显示
				this.updateFileListDOM(this.state.files);

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

	/**
	 * 读取文件为文本
	 * @param {File} file - 文件对象
	 * @returns {Promise<string>} 文件内容
	 */
	readFileAsText(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = (e) => reject(e);
			reader.readAsText(file);
		});
	}

	/**
	 * 处理检查更新
	 * @returns {Promise<void>}
	 */
	async handleCheckUpdate() {
		try {
			// 显示检查中的状态
			const checkBtn = this.element.querySelector('#checkUpdateBtn');
			if (checkBtn) {
				checkBtn.disabled = true;
				checkBtn.textContent = '🔄 ' + this.t('projectDetail.fileOperations.checking', '检查中...');
			}

			// 检查GitHub上的最新提交
			const projectUrl = this.state.project?.url || (() => {
				// 从用户数据中获取仓库信息作为默认值
				const user = this.state.user;
				const repoInfo = user?.repositoryInfo;
				if (repoInfo?.owner && repoInfo?.repo) {
					return `https://github.com/${repoInfo.owner}/${repoInfo.repo}`;
				}
				return 'https://github.com/ZelaCreator/test';
			})();
			const repoInfo = this.extractRepoInfo(projectUrl);

			if (!repoInfo) {
				throw new Error(this.t('projectDetail.errors.cannotParseProjectUrl', '无法解析项目URL'));
			}

			// 获取GitHub API的最新提交信息
			const user = this.state.user;
			if (!user || !user.token) {
				throw new Error(this.t('projectDetail.errors.userNotLoggedInOrTokenUnavailable', '用户未登录或访问令牌不可用'));
			}

			const octokit = new window.Octokit({ auth: user.token });
			const { data: commits } = await octokit.rest.repos.listCommits({
				owner: repoInfo.owner, repo: repoInfo.repo, per_page: 1
			});
			const latestCommit = commits[0];

			if (!latestCommit) {
				throw new Error(this.t('projectDetail.errors.cannotGetLatestCommit', '无法获取最新提交信息'));
			}

			// 解析提交信息
			const commitMessage = latestCommit.commit?.message || '无提交信息';
			const commitAuthor = latestCommit.commit?.author?.name || '未知作者';
			const commitDate = latestCommit.commit?.author?.date || latestCommit.commit?.committer?.date || new Date().toISOString();

			// 获取本地同步信息
			const syncInfo = localStorage.getItem(`dipcp-sync-${repoInfo.repo}`);
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
					this.t('projectDetail.fileOperations.latestCommit', '最新提交：{message}').replace('{message}', commitMessage) + '\n' +
					this.t('projectDetail.fileOperations.committer', '提交者：{author}').replace('{author}', commitAuthor) + '\n' +
					this.t('projectDetail.fileOperations.commitTime', '时间：{time}').replace('{time}', new Date(commitDate).toLocaleString('zh-CN')) + '\n\n' +
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

	/**
	 * 同步项目
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} commitSha - 提交SHA
	 * @returns {Promise<void>}
	 */
	async syncProject(owner, repo, commitSha) {
		try {
			// 显示同步中的状态
			this.showInfoModal(
				this.t('projectDetail.fileOperations.modalTitles.info', '正在同步项目'),
				this.t('projectDetail.fileOperations.syncing', '正在同步项目，请稍候...')
			);

			// 构建仓库URL
			const repositoryUrl = `https://github.com/${owner}/${repo}`;

			// 使用StorageService同步仓库数据
			const user = this.state.user;
			if (!user || !user.token) {
				throw new Error(this.t('projectDetail.errors.userNotLoggedInOrTokenUnavailable', '用户未登录或访问令牌不可用'));
			}

			await window.StorageService.syncRepositoryData(owner, repo, user.token);

			// 重新加载项目数据
			await this.loadProjectData();

			// 更新文件树显示
			this.updateFileListDOM(this.state.files);

			// 保存同步信息
			const syncInfo = {
				lastSync: new Date().toISOString(),
				lastCommit: commitSha,
				repo: `${owner}/${repo}`
			};
			localStorage.setItem(`dipcp-sync-${repo}`, JSON.stringify(syncInfo));

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

	/**
	 * 解析GitHub URL
	 * @param {string} url - GitHub URL
	 * @returns {Object|null} 仓库信息对象或null
	 */
	extractRepoInfo(url) {
		const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
		if (match) {
			return {
				owner: match[1],
				repo: match[2].replace('.git', '')
			};
		}
		return null;
	}

	/**
	 * 处理文件打开
	 * @param {Object} file - 文件对象
	 * @returns {void}
	 */
	handleFileOpen(file) {
		// 获取文件名（优先使用name，如果没有则从path中提取）
		const fileName = file.name || file.path.split('/').pop();

		// 检查文件类型
		if (this.isEditableFile(fileName) || this.isViewableFile(fileName)) {
			// 可编辑或查看文件，跳转到查看模式
			const editorUrl = `/editor?file=${encodeURIComponent(file.path)}&mode=view`;
			if (window.app && window.app.navigateTo) {
				window.app.navigateTo(editorUrl);
			}
		} else {
			// 不支持的文件类型
			this.showInfoModal(
				this.t('projectDetail.fileOperations.modalTitles.error', '错误'),
				this.t('projectDetail.fileOperations.unsupportedFileType', `不支持的文件类型：${fileName}`).replace('{fileName}', fileName)
			);
		}
	}

	/**
	 * 处理文件删除
	 * @param {Object} file - 文件对象
	 * @returns {Promise<void>}
	 */
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
							this.updateFileListDOM(updatedFiles);

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
							this.updateFileListDOM(updatedFiles);

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
	 * @param {string} filePath - 文件路径
	 * @returns {Promise<boolean>} 是否存在
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
	 * @param {Object} file - 文件对象
	 * @returns {Promise<void>}
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
	 * @param {Object} file - 文件对象
	 * @returns {Promise<void>}
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
	 * @param {string} filePath - 文件路径
	 * @param {string} source - 删除来源
	 * @returns {Promise<void>}
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
	 * @param {Object} file - 文件对象
	 * @returns {Promise<void>}
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

	/**
	 * 处理文件上传的辅助方法
	 * @param {File} file - 文件对象
	 * @param {string} content - 文件内容
	 * @param {string} filePath - 文件路径
	 * @returns {Promise<void>}
	 */
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
			this.updateFileListDOM(updatedFiles);

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

	/**
	 * 销毁组件
	 * @returns {void}
	 */
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

/**
 * 注册组件到全局
 * @global
 */
window.ProjectDetailPage = ProjectDetailPage;
