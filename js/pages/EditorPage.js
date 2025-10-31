/**
 * 编辑器页面组件
 * 完全组件化的编辑器页面，提供文件编辑、预览、保存等功能
 * @class EditorPage
 * @extends {BasePage}
 */
class EditorPage extends BasePage {
	/**
	 * 构造函数
	 * @param {Object} props - 组件属性
	 * @param {string} [props.filePath] - 文件路径
	 * @param {string} [props.fileName] - 文件名
	 * @param {string} [props.content] - 文件内容
	 * @param {string} [props.mode] - 编辑模式 ('edit' 或 'view')
	 * @param {string} [props.projectName] - 项目名称
	 */
	constructor(props = {}) {
		super(props);

		// 从 localStorage 获取用户信息
		const userInfo = window.app.getUserFromStorage();

		// 根据mode决定初始预览模式：默认为预览模式，只有在明确传入mode=edit时才进入编辑模式
		const viewMode = props.mode || 'view';
		const initialPreviewMode = viewMode === 'view';

		const filePath = props.filePath || '';
		const readonly = this.isGithubProtectedFile(filePath);

		this.state = {
			filePath: filePath,
			fileName: props.fileName || '',
			content: props.content || '',
			isModified: false,
			hasSubmitted: false, // 将在loadFileContent中异步加载
			previewMode: initialPreviewMode || readonly, // .github 文件强制预览模式
			viewMode: readonly ? 'view' : viewMode, // .github 文件强制 view 模式
			readonly: readonly, // 是否只读
			showInfoPanel: false,
			infoPanelContent: null,
			projectName: props.projectName || 'DIPCP',
			repoInfo: userInfo.user.repositoryInfo,
			user: userInfo.user,
			userRole: userInfo.userRole,
			permissionInfo: userInfo.permissionInfo,
			// 功能模块状态缓存
			moduleStates: this.loadModuleStates(),
			// 模态框实例
			modal: null
		};
	}

	/**
	 * 检查是否是 .github 目录中的受保护文件
	 * @param {string} filePath - 文件路径
	 * @returns {boolean} 是否是受保护文件
	 */
	isGithubProtectedFile(filePath) {
		if (!filePath) return false;
		// 检查路径是否以 .github/ 开头
		return filePath.startsWith('.github/') || filePath.startsWith('/.github/');
	}

	/**
	 * 加载模块状态缓存
	 * @returns {Object} 模块状态对象
	 */
	loadModuleStates() {
		try {
			const cached = localStorage.getItem('dipcp-editor-module-states');
			const states = cached ? JSON.parse(cached) : {
				fileInfo: false,
				editHistory: false,
				collaboration: false
			};
			console.log('加载编辑器模块状态缓存:', states);
			return states;
		} catch (error) {
			console.error('加载编辑器模块状态缓存失败:', error);
			return {
				fileInfo: false,
				editHistory: false,
				collaboration: false
			};
		}
	}

	/**
	 * 保存模块状态缓存
	 * @returns {void}
	 */
	saveModuleStates() {
		try {
			localStorage.setItem('dipcp-editor-module-states', JSON.stringify(this.state.moduleStates));
		} catch (error) {
			console.error('保存编辑器模块状态缓存失败:', error);
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
		console.log(`更新编辑器模块状态: ${moduleName} = ${isOpen}`, newModuleStates);
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
			console.log('restoreModuleStates 已被调用，跳过');
			return;
		}
		this._restoreModuleStatesCalled = true;

		// 延迟执行，确保DOM已经渲染完成
		setTimeout(() => {
			console.log('恢复编辑器模块状态:', this.state.moduleStates);

			if (this.state.moduleStates.fileInfo) {
				console.log('显示文件信息模块');
				this.showFileInfo();
			}
			if (this.state.moduleStates.editHistory) {
				console.log('显示编辑历史模块');
				this.showEditHistory();
			}
			if (this.state.moduleStates.collaboration) {
				console.log('显示协作信息模块');
				this.showCollaboration();
			}
		}, 200);
	}

	/**
	 * 加载文件内容
	 * @returns {Promise<void>}
	 */
	async loadFileContent() {
		if (!this.state.filePath) {
			this.setState({ content: this.t('editor.noContent', '暂无内容') });
			this.updateContentDOM(this.state.content);
			return;
		}

		try {
			// 优先从localWorkspace查找（用户编辑的文件）
			if (window.StorageService) {
				await window.StorageService.initDB();

				// 加载文件提交状态
				const repoInfo = this.state.repoInfo || (this.state.user && this.state.user.repositoryInfo);
				if (repoInfo && this.state.filePath) {
					const hasSubmitted = await window.StorageService.getFileSubmissionStatus(
						repoInfo.owner,
						repoInfo.repo,
						this.state.filePath
					);
					this.setState({ hasSubmitted });
					// 更新提交按钮状态
					if (this.element) {
						this.updateSubmitButtonState();
					}
				}

				// 先尝试从localWorkspace获取（用户编辑的文件）
				let fileData = await window.StorageService._execute('localWorkspace', 'get', this.state.filePath);

				// 如果localWorkspace中没有，再从fileCache获取（GitHub原版文件）
				if (!fileData) {
					fileData = await window.StorageService._execute('fileCache', 'get', this.state.filePath);
				}

				if (fileData && fileData.content) {
					// 如果content是base64编码的字符串，需要解码
					let content = fileData.content;
					if (typeof content === 'string' && content.includes('base64')) {
						// 这是GitHub API返回的base64编码内容
						content = atob(content);
					} else if (fileData.content.content) {
						// 这是GitHub API返回的对象，content字段包含base64编码的内容
						content = atob(fileData.content.content);
					}
					this.setState({ content: content });
					this.updateContentDOM(content);
					return;
				}
			}
			// 如果都失败了，显示默认内容
			this.setState({ content: this.t('editor.noContent', '暂无内容') });
			this.updateContentDOM(this.state.content);
		} catch (error) {
			console.error('加载文件内容失败:', error);
			this.setState({ content: this.t('editor.noContent', '暂无内容') });
			this.updateContentDOM(this.state.content);
		}

		// 根据缓存状态自动显示相应的模块（只调用一次）
		this.restoreModuleStates();
	}

	/**
	 * 渲染组件
	 * @returns {HTMLElement} 渲染后的DOM元素
	 */
	render() {
		const container = document.createElement('div');
		container.className = 'dashboard';

		// 检查I18nService是否可用，如果不可用则使用默认值
		const getText = (key, defaultValue) => {
			if (window.I18nService && window.I18nService.t) {
				const translated = window.I18nService.t(key);
				// 如果返回的是键本身，说明翻译失败，使用默认值
				return translated === key ? defaultValue : translated;
			}
			return defaultValue;
		};

		container.innerHTML = `
			${this.renderHeader(getText)}
			<main class="project-detail-main">
				${this.renderBackButton(getText)}
				${this.renderToolbar(getText)}
				${this.renderMainContent(getText)}
			</main>
		`;
		return container;
	}

	/**
	 * 渲染页面头部
	 * @param {Function} getText - 文本获取函数
	 * @returns {string} 头部HTML字符串
	 */
	renderHeader(getText) {
		// 使用BasePage的renderHeader方法
		return super.renderHeader('editor', false, null);
	}

	/**
	 * 渲染返回按钮和面包屑
	 * @param {Function} getText - 文本获取函数
	 * @returns {string} 返回按钮HTML字符串
	 */
	renderBackButton(getText) {
		return `
            <div class="breadcrumb-container">
                <div class="breadcrumb">
                    <span class="breadcrumb-item">
                        📄 <span id="fileName">${this.state.fileName || getText('common.loading', '载入中...')}</span>
                    </span>
                </div>
                <div class="dropdown">
                    <button class="dropdown-toggle" id="moreInfoBtn">⋯</button>
                    <div class="dropdown-menu" id="moreInfoMenu">
                        <a href="#" class="dropdown-item" data-section="file-info">${getText('editor.fileInfo', '文件信息')}</a>
                        <a href="#" class="dropdown-item" data-section="edit-history">${getText('editor.editHistory', '编辑历史')}</a>
                        <a href="#" class="dropdown-item" data-section="collaboration">${getText('editor.collaboration', '协作信息')}</a>
                    </div>
                </div>
            </div>
        `;
	}

	/**
	 * 渲染工具栏
	 * @param {Function} getText - 文本获取函数
	 * @returns {string} 工具栏HTML字符串
	 */
	renderToolbar(getText) {
		// 如果是 .github 目录中的文件，不显示保存和提交按钮
		if (this.state.readonly) {
			return '';
		}

		return `
            <div class="editor-toolbar">
                <div class="editor-toolbar-left">
                    <button class="btn btn-sm" id="saveBtn" disabled style="${this.state.previewMode ? 'display: none;' : ''}">${getText('editor.save', '💾 保存')}</button>
                    <button class="btn btn-sm ${this.state.previewMode ? 'active' : ''}" id="previewBtn">
                        ${this.state.previewMode ? getText('editor.edit', '✏️ 编辑') : getText('editor.preview', '👁 预览')}
                    </button>
                </div>
                <div class="editor-toolbar-right">
					<button class="btn btn-primary btn-sm" id="submitBtn" style="${(this.state.isModified || this.state.hasSubmitted) ? 'display: none;' : ''}">${getText('editor.submitReview', '📤 提交审核')}</button>
                </div>
            </div>
        `;
	}


	/**
	 * 渲染主要内容区域
	 * @param {Function} getText - 文本获取函数
	 * @returns {string} 主内容HTML字符串
	 */
	renderMainContent(getText) {
		// 检查是否为图像文件
		const isImageFile = this.isImageFile(this.state.fileName);

		return `
            <div class="main-content" id="mainContent">
                <div class="editor-section" id="editorSection">
                    <div class="editor-container">
                        <div class="editor-content">
                            ${isImageFile ? this.renderImageViewer(getText) : this.renderTextEditor(getText)}
                        </div>
                    </div>
                </div>
                <div class="info-panel" id="infoPanel" style="display: ${this.state.showInfoPanel ? 'block' : 'none'};">
                    <div class="info-panel-header">
                        <h3 id="infoPanelTitle">${getText('editor.fileInfo', '文件信息')}</h3>
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
	 * 渲染文本编辑器
	 * @param {Function} getText - 文本获取函数
	 * @returns {string} 文本编辑器HTML字符串
	 */
	renderTextEditor(getText) {
		// 根据viewMode和previewMode决定是否readonly
		// viewMode='view'时默认readonly，除非用户点击了编辑按钮（previewMode=false）
		const readonly = this.state.viewMode === 'view' && this.state.previewMode;

		return `
			<div class="editor-panel" id="editorPanel" style="display: ${this.state.previewMode ? 'none' : 'block'};">
				<textarea id="markdownEditor" placeholder="${getText('editor.ui.loading', '加载中...')}" ${readonly ? 'readonly' : ''}>${this.state.content}</textarea>
			</div>
			<div class="preview-panel" id="previewPanel" style="display: ${this.state.previewMode ? 'flex' : 'none'};">
				<div class="preview-content" id="previewContent">
					${this.renderPreviewContent(getText)}
				</div>
			</div>
		`;
	}

	/**
	 * 渲染图像查看器
	 * @param {Function} getText - 文本获取函数
	 * @returns {string} 图像查看器HTML字符串
	 */
	renderImageViewer(getText) {
		return `
			<div class="image-viewer" id="imageViewer">
				<div class="image-container">
					<img id="imageDisplay" src="${this.getImageDataUrl()}" alt="${this.state.fileName}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
				</div>
				<div class="image-info">
					<p><strong>${getText('editor.image.fileName', '文件名')}:</strong> ${this.state.fileName}</p>
					<p><strong>${getText('editor.image.filePath', '路径')}:</strong> ${this.state.filePath}</p>
					<p><strong>${getText('editor.image.mode', '模式')}:</strong> ${getText('editor.image.viewOnly', '仅查看')}</p>
				</div>
			</div>
		`;
	}

	/**
	 * 检查是否为图像文件
	 * @param {string} fileName - 文件名
	 * @returns {boolean} 是否为图像文件
	 */
	isImageFile(fileName) {
		const imageExtensions = [
			'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg',
			'ico', 'tiff', 'tif', 'psd', 'ai', 'eps'
		];
		const extension = fileName.split('.').pop()?.toLowerCase();
		return imageExtensions.includes(extension);
	}

	/**
	 * 获取图像的数据URL
	 * @returns {string} 图像数据URL
	 */
	getImageDataUrl() {
		// 如果content是base64编码的，直接使用
		if (this.state.content.startsWith('data:')) {
			return this.state.content;
		}
		// 否则创建data URL
		const extension = this.state.fileName.split('.').pop()?.toLowerCase();
		const mimeType = this.getMimeType(extension);
		return `data:${mimeType};base64,${this.state.content}`;
	}

	/**
	 * 根据文件扩展名获取MIME类型
	 * @param {string} extension - 文件扩展名
	 * @returns {string} MIME类型
	 */
	getMimeType(extension) {
		const mimeTypes = {
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'png': 'image/png',
			'gif': 'image/gif',
			'bmp': 'image/bmp',
			'webp': 'image/webp',
			'svg': 'image/svg+xml',
			'ico': 'image/x-icon',
			'tiff': 'image/tiff',
			'tif': 'image/tiff',
			'psd': 'image/vnd.adobe.photoshop',
			'ai': 'application/postscript',
			'eps': 'application/postscript'
		};
		return mimeTypes[extension] || 'image/jpeg';
	}

	/**
	 * 渲染编辑器工具栏
	 * @returns {string} 编辑器工具栏HTML字符串
	 */
	renderEditorToolbar() {
		const isImageFile = this.isImageFile(this.state.fileName);

		return `
            <div class="editor-toolbar">
                <div class="editor-toolbar-left">
                    ${!isImageFile ? `
                        <button class="btn btn-sm" id="saveBtn">💾 ${this.t('editor.save', '保存')}</button>
                        <button class="btn btn-sm ${this.state.previewMode ? 'active' : ''}" id="previewBtn">
                            ${this.state.previewMode ? this.t('editor.edit', '编辑') : this.t('editor.preview', '预览')}
                        </button>
                    ` : `
                        <span class="btn btn-sm disabled">👁 ${this.t('editor.image.viewOnly', '仅查看')}</span>
                    `}
                </div>
                <div class="editor-toolbar-right">
                    ${!isImageFile ? `
                        <button class="btn btn-primary btn-sm" id="submitBtn">📤 ${this.t('editor.submitReview', '提交审核')}</button>
                    ` : ''}
                </div>
            </div>
        `;
	}

	/**
	 * 渲染预览内容
	 * @param {Function} getText - 文本获取函数
	 * @returns {string} 预览内容HTML字符串
	 */
	renderPreviewContent(getText) {
		if (!this.state.content || typeof this.state.content !== 'string') {
			return `<div class="empty-preview">${getText('editor.noContent', '暂无内容')}</div>`;
		}

		// 简单的Markdown渲染
		return this.state.content
			.replace(/\n/g, '<br>')
			.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
			.replace(/  /g, '&nbsp;&nbsp;');
	}

	/**
	 * 渲染信息面板
	 * @returns {string} 信息面板HTML字符串
	 */
	renderInfoPanel() {
		return `
            <div class="info-panel" id="infoPanel" style="display: ${this.state.showInfoPanel ? 'block' : 'none'};">
                <div class="info-panel-header">
                    <h3 id="infoPanelTitle">${this.t('editor.fileInfo', '文件信息')}</h3>
                    <button class="btn-close" id="closeInfoPanel">×</button>
                </div>
                <div class="info-panel-content" id="infoPanelContent">
                    ${this.state.infoPanelContent || ''}
                </div>
            </div>
        `;
	}

	/**
	 * 挂载组件到容器
	 * @param {HTMLElement} container - 挂载容器
	 * @returns {Promise<void>}
	 */
	async mount(container) {
		super.mount(container);

		// 加载文件内容
		await this.loadFileContent();

		// 绑定事件
		this.bindEvents();
	}

	/**
	 * 绑定事件监听器
	 * @returns {void}
	 */
	bindEvents() {
		if (!this.element) {
			return;
		}

		// 绑定Header组件的事件
		this.bindHeaderEvents();
		// 保存按钮
		const saveBtn = this.element.querySelector('#saveBtn');
		if (saveBtn) {
			saveBtn.addEventListener('click', () => {
				this.handleSave();
			});
		}

		// 预览按钮
		const previewBtn = this.element.querySelector('#previewBtn');
		if (previewBtn) {
			previewBtn.addEventListener('click', () => {
				// 如果是只读文件，不允许切换编辑模式
				if (this.state.readonly) {
					return;
				}
				this.togglePreview();
			});
		}

		// 提交审核按钮
		const submitBtn = this.element.querySelector('#submitBtn');
		if (submitBtn) {
			submitBtn.addEventListener('click', () => {
				this.showSubmitModal();
			});
		}

		// 编辑器内容变化
		const editor = this.element.querySelector('#markdownEditor');
		if (editor) {
			editor.addEventListener('input', async (e) => {
				this.setState({
					content: e.target.value,
					isModified: true,
					hasSubmitted: false
				});

				// 清除已提交状态（通过StorageService）
				try {
					if (window.StorageService) {
						const repoInfo = this.state.repoInfo || (this.state.user && this.state.user.repositoryInfo);
						if (repoInfo && this.state.filePath) {
							await window.StorageService.clearFileSubmissionStatus(
								repoInfo.owner,
								repoInfo.repo,
								this.state.filePath
							);
						}
					}
				} catch (e) { /* noop */ }

				this.updateSaveButtonState();
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
				if (section === 'file-info') {
					this.toggleFileInfo();
				} else if (section === 'edit-history') {
					this.toggleEditHistory();
				} else if (section === 'collaboration') {
					this.toggleCollaboration();
				}
			});
		});

		// 点击其他地方关闭下拉菜单
		document.addEventListener('click', (e) => {
			if (dropdownMenu && !dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
				dropdownMenu.classList.remove('show');
			}
		});

		// 关闭信息面板
		const closeInfoPanel = this.element.querySelector('#closeInfoPanel');
		if (closeInfoPanel) {
			closeInfoPanel.addEventListener('click', () => {
				this.setState({ showInfoPanel: false });
				this.updateInfoPanelDOM(false);
			});
		}
	}

	/**
	 * 处理保存操作
	 * @returns {Promise<void>}
	 */
	async handleSave() {
		await this.saveContent();
		this.setState({ isModified: false });
		this.updateSaveButtonState();
	}

	/**
	 * 显示提交审核模态框
	 * @returns {Promise<void>}
	 */
	async showSubmitModal() {
		// 显示输入模态框
		if (!this.state.modal) {
			this.state.modal = new window.Modal();
		}

		this.state.modal.showInput(
			this.t('editor.submitModal.title', '提交审核'),
			this.t('editor.submitModal.message', '请输入给维护者的留言（可选）:'),
			this.t('editor.submitModal.placeholder', '请输入留言...'),
			'',
			(message) => {
				// 用户确认后，执行提交
				this.handleSubmitReview(message);
			}
		);

		// 如果模态框元素不存在，创建并添加到 DOM
		if (!this.state.modal.element) {
			const modalElement = this.state.modal.render();
			if (modalElement) {
				document.body.appendChild(modalElement);
				this.state.modal.element = modalElement;
			}
		}
	}

	/**
	 * 处理提交审核操作
	 * @param {string} userMessage - 用户输入的留言
	 * @returns {void}
	 */
	handleSubmitReview(userMessage = '') {
		// 包一层立即执行的异步函数，避免更改对外API签名
		(async () => {
			try {
				// 基础校验
				const user = this.state.user;
				const repoInfo = this.state.repoInfo || (user && user.repositoryInfo);
				const filePath = this.state.filePath;

				// 禁用提交按钮，防止重复点击
				const submitBtn = this.element && this.element.querySelector('#submitBtn');
				if (submitBtn) {
					submitBtn.disabled = true;
					submitBtn.textContent = '⏳ ' + this.t('editor.submitting', '正在提交...');
				}

				// 初始化 Octokit
				const octokit = new window.Octokit({ auth: user.token });

				// 获取仓库信息，确认默认分支
				const { data: repo } = await octokit.rest.repos.get({ owner: repoInfo.owner, repo: repoInfo.repo });
				const defaultBranch = repo.default_branch || 'main';

				// 目标分支命名：spcp/<username>
				const safeUser = (user.login || user.username || 'user').replace(/[^a-zA-Z0-9-_]/g, '-');
				const branchName = `spcp/${safeUser}`;

				// 获取本地工作空间中的所有删除记录
				const deletionRecords = await window.StorageService.getAllDeletionRecords();
				const filesToDelete = new Set(); // 用于存储需要删除的文件路径

				if (deletionRecords && deletionRecords.length > 0) {
					console.log(`发现 ${deletionRecords.length} 个待删除的文件记录`);
					deletionRecords.forEach(record => {
						filesToDelete.add(record.path);
					});
				}

				// 检查是否有未处理的 PR（从用户分支到默认分支的打开状态的 PR）
				// 并收集这些 PR 中修改的所有文件和留言
				const filesToInclude = new Map(); // 用于存储需要包含的文件路径和内容
				const previousMessages = []; // 用于存储之前未审核 PR 的留言（排除有maintaining标签的）

				try {
					const { data: existingPRs } = await octokit.rest.pulls.list({
						owner: repoInfo.owner,
						repo: repoInfo.repo,
						state: 'open',
						head: `${repoInfo.owner}:${branchName}`,
						base: defaultBranch
					});

					// 如果有未处理的 PR，先获取它们修改的所有文件和留言，同时标记需要关闭的 PR（排除有maintaining标签的 PR）
					const prsToClose = [];
					if (existingPRs && existingPRs.length > 0) {
						console.log(`发现 ${existingPRs.length} 个未处理的 PR，正在获取文件列表...`);

						for (const pr of existingPRs) {
							// 检查 PR 是否有"maintaining"标签
							let hasMaintainingLabel = false;
							try {
								const { data: prLabels } = await octokit.rest.issues.listLabelsOnIssue({
									owner: repoInfo.owner,
									repo: repoInfo.repo,
									issue_number: pr.number
								});
								hasMaintainingLabel = prLabels.some(label =>
									label.name.toLowerCase() === 'maintaining'
								);
							} catch (labelErr) {
								console.warn(`获取 PR #${pr.number} 的标签失败:`, labelErr);
							}

							// 如果有maintaining标签，跳过这个 PR（不收集文件、留言，也不关闭）
							if (hasMaintainingLabel) {
								console.log(`PR #${pr.number} 有maintaining标签，跳过收集文件、留言和关闭操作`);
								continue;
							}

							// 标记这个 PR 需要关闭
							prsToClose.push(pr);

							// 收集没有maintaining标签的 PR 的留言
							if (pr.body && pr.body.trim()) {
								previousMessages.push(pr.body.trim());
							}

							try {
								// 获取 PR 中修改的文件列表
								const { data: prFiles } = await octokit.rest.pulls.listFiles({
									owner: repoInfo.owner,
									repo: repoInfo.repo,
									pull_number: pr.number
								});

								// 从旧 PR 的分支中读取这些文件的内容
								for (const file of prFiles) {
									if (file.status !== 'removed' && !filesToInclude.has(file.filename)) {
										try {
											// 从 PR 的 head 分支（用户分支）读取文件内容
											const { data: fileContent } = await octokit.rest.repos.getContent({
												owner: repoInfo.owner,
												repo: repoInfo.repo,
												path: file.filename,
												ref: branchName
											});

											if (fileContent && !Array.isArray(fileContent) && fileContent.content) {
												// 解码 Base64 内容
												const content = decodeURIComponent(escape(atob(fileContent.content.replace(/\s/g, ''))));
												filesToInclude.set(file.filename, {
													path: file.filename,
													content: content,
													sha: fileContent.sha,
													status: file.status
												});
											}
										} catch (fileErr) {
											console.warn(`读取文件 ${file.filename} 失败:`, fileErr);
											// 继续处理其他文件
										}
									}
								}
							} catch (prErr) {
								console.warn(`获取 PR #${pr.number} 的文件列表失败:`, prErr);
								// 继续处理其他 PR
							}
						}

						if (prsToClose.length > 0) {
							console.log(`正在关闭 ${prsToClose.length} 个旧 PR（已排除 ${existingPRs.length - prsToClose.length} 个维护中的 PR）...`);
							for (const pr of prsToClose) {
								try {
									await octokit.rest.pulls.update({
										owner: repoInfo.owner,
										repo: repoInfo.repo,
										pull_number: pr.number,
										state: 'closed'
									});
									console.log(`已关闭 PR #${pr.number}`);
								} catch (err) {
									console.warn(`关闭 PR #${pr.number} 失败:`, err);
									// 继续处理其他 PR，不中断流程
								}
							}
						}
					}
				} catch (err) {
					console.warn('检查现有 PR 失败:', err);
					// 即使检查失败，也继续提交流程
				}

				// 获取默认分支最新提交SHA
				const { data: baseRef } = await octokit.rest.git.getRef({ owner: repoInfo.owner, repo: repoInfo.repo, ref: `heads/${defaultBranch}` });
				const baseSha = baseRef.object.sha;

				// 尝试读取目标分支，不存在则创建
				let branchExists = true;
				let branchHeadSha = baseSha; // 保存分支当前的 HEAD SHA
				try {
					const { data: branchRef } = await octokit.rest.git.getRef({ owner: repoInfo.owner, repo: repoInfo.repo, ref: `heads/${branchName}` });
					branchHeadSha = branchRef.object.sha;
				} catch (err) {
					if (err && err.status === 404) {
						branchExists = false;
					} else {
						throw err;
					}
				}

				// 如果分支不存在，创建它
				if (!branchExists) {
					await octokit.rest.git.createRef({
						owner: repoInfo.owner,
						repo: repoInfo.repo,
						ref: `refs/heads/${branchName}`,
						sha: baseSha
					});
				} else {
					// 由于我们已经从旧 PR 中收集了文件，可以重置分支
					if (filesToInclude.size > 0) {
						// 有旧文件需要保留，先重置分支到基线（后面会重新提交所有文件）
						await octokit.rest.git.updateRef({
							owner: repoInfo.owner,
							repo: repoInfo.repo,
							ref: `heads/${branchName}`,
							sha: baseSha,
							force: true
						});
					} else {
						// 没有旧文件，保持分支现状或重置到基线
						await octokit.rest.git.updateRef({
							owner: repoInfo.owner,
							repo: repoInfo.repo,
							ref: `heads/${branchName}`,
							sha: baseSha,
							force: true
						});
					}
				}

				// 将当前编辑的文件也添加到待提交文件列表中
				// 如果旧 PR 中已经有这个文件，会被当前内容覆盖
				const content = this.state.content || '';

				// 如果这个文件不在旧文件中，需要获取它在分支上的 SHA（如果存在）
				if (!filesToInclude.has(filePath)) {
					let fileSha = undefined;
					try {
						const { data: existing } = await octokit.rest.repos.getContent({
							owner: repoInfo.owner,
							repo: repoInfo.repo,
							path: filePath,
							ref: branchName
						});
						if (existing && !Array.isArray(existing) && existing.sha) {
							fileSha = existing.sha;
						}
					} catch (err) {
						// 404 表示文件不存在于该分支，忽略
						if (err.status !== 404) {
							throw err;
						}
					}
					filesToInclude.set(filePath, {
						path: filePath,
						content: content,
						sha: fileSha,
						status: 'modified'
					});
				} else {
					// 如果文件已经在旧 PR 中，用当前内容覆盖
					const existingFile = filesToInclude.get(filePath);
					existingFile.content = content;
					// SHA 会在提交时重新获取
				}

				// 批量提交所有文件（包括删除的文件）
				const fileCount = filesToInclude.size;
				const deleteCount = filesToDelete.size;
				console.log(`准备提交 ${fileCount} 个文件，删除 ${deleteCount} 个文件...`);

				// 构建提交消息
				const filePathsList = Array.from(filesToInclude.keys());
				const deletePathsList = Array.from(filesToDelete);
				const allPathsList = [...filePathsList, ...deletePathsList.map(p => `删除: ${p}`)];
				const commitMessage = `Update files via DIPCP: ${allPathsList.join(', ')}`;

				// 收集所有文件路径用于PR标题和描述
				const allFilePaths = Array.from(filesToInclude.keys());

				// 转换文件格式为批量提交所需格式
				const files = Array.from(filesToInclude.entries()).map(([path, fileInfo]) => ({
					path: path,
					content: fileInfo.content
				}));

				// 添加删除的文件（使用 null SHA 表示删除）
				const filesToDeleteList = Array.from(filesToDelete).map(path => ({
					path: path,
					content: null, // null 表示删除
					isDeleted: true
				}));

				// 合并所有文件（包括删除的文件）
				const allFilesToCommit = [...files, ...filesToDeleteList];

				// 如果分支是新创建的（分支不存在），需要先提交第一个非删除文件建立初始提交
				if (!branchExists && allFilesToCommit.length > 0) {
					// 找到第一个非删除的文件
					const firstNonDeletedFile = allFilesToCommit.find(f => !f.isDeleted && f.content !== null);
					if (firstNonDeletedFile) {
						const base64Content = btoa(unescape(encodeURIComponent(firstNonDeletedFile.content)));
						await octokit.rest.repos.createOrUpdateFileContents({
							owner: repoInfo.owner,
							repo: repoInfo.repo,
							path: firstNonDeletedFile.path,
							message: `Initial commit: ${commitMessage}`,
							content: base64Content,
							branch: branchName
						});
						console.log(`✅ 已创建第一个文件 ${firstNonDeletedFile.path}，建立初始提交`);

						// 如果还有其他文件，使用批量提交
						const remainingFiles = allFilesToCommit.filter(f => f.path !== firstNonDeletedFile.path);
						if (remainingFiles.length > 0) {
							await this.createBatchCommit(octokit, repoInfo.owner, repoInfo.repo, remainingFiles, commitMessage, branchName);
							console.log(`✅ 已批量提交剩余的 ${remainingFiles.length} 个文件（包括 ${filesToDeleteList.length} 个删除）`);
						}
					} else {
						// 如果只有删除操作，也需要创建初始提交（使用批量提交）
						await this.createBatchCommit(octokit, repoInfo.owner, repoInfo.repo, allFilesToCommit, commitMessage, branchName);
						console.log(`✅ 已批量提交 ${allFilesToCommit.length} 个文件（包括 ${filesToDeleteList.length} 个删除）`);
					}
				} else {
					// 分支已存在，直接使用批量提交所有文件（包括删除的文件）
					await this.createBatchCommit(octokit, repoInfo.owner, repoInfo.repo, allFilesToCommit, commitMessage, branchName);
					console.log(`✅ 已批量提交 ${files.length} 个文件，删除 ${filesToDeleteList.length} 个文件`);
				}

				// 提交成功后，清理已删除文件的记录
				if (filesToDelete.size > 0) {
					await window.StorageService.clearDeletionRecords(Array.from(filesToDelete));
					console.log(`✅ 已清理 ${filesToDelete.size} 个删除记录`);
				}

				// 文件提交成功后，创建新的 Pull Request
				try {
					// 合并用户输入的留言和之前收集的留言
					let prBody = userMessage || '';
					if (previousMessages.length > 0) {
						const mergedMessages = previousMessages.join('\n\n---\n\n');
						if (prBody.trim()) {
							prBody = `${prBody}\n\n---\n\n${mergedMessages}`;
						} else {
							prBody = mergedMessages;
						}
					}

					const { data: newPR } = await octokit.rest.pulls.create({
						owner: repoInfo.owner,
						repo: repoInfo.repo,
						title: 'Submit file update',
						body: prBody,
						head: branchName,
						base: defaultBranch
					});

					// 添加提交者名字标签（c_用户名）
					try {
						const committerName = user.username || user.login || '';
						if (committerName) {
							await octokit.rest.issues.addLabels({
								owner: repoInfo.owner,
								repo: repoInfo.repo,
								issue_number: newPR.number,
								labels: [`c_${committerName}`]
							});
							console.log(`为 PR #${newPR.number} 添加提交者标签 c_${committerName}`);
						}
					} catch (labelError) {
						// 如果标签不存在或添加失败，只记录警告，不影响主流程
						console.warn('添加提交者标签失败:', labelError);
					}

					console.log(`成功创建 PR #${newPR.number}: ${newPR.html_url}`);

				} catch (prError) {
					console.error('创建 Pull Request 失败:', prError);
				}

				// 提交成功，提示并更新状态（标记已提交以隐藏提交按钮）
				this.setState({ isModified: false, hasSubmitted: true });
				this.updateSaveButtonState();

				// 持久化提交状态到StorageService
				try {
					if (window.StorageService) {
						await window.StorageService.setFileSubmissionStatus(
							repoInfo.owner,
							repoInfo.repo,
							filePath,
							true
						);
					}
				} catch (e) {
					console.error('保存提交状态失败:', e);
				}
			} catch (error) {
				console.error('提交审核失败:', error);
			} finally {
				const submitBtnFinal = this.element && this.element.querySelector('#submitBtn');
				if (submitBtnFinal) {
					submitBtnFinal.disabled = false;
					submitBtnFinal.textContent = this.t('editor.submitReview', '📤 提交审核');
				}
			}
		})();
	}

	/**
	 * 保存文件内容
	 * @returns {Promise<void>}
	 */
	async saveContent() {
		console.log('保存文件功能');

		if (!this.state.filePath) {
			alert(this.t('editor.saveFailed', '保存失败：文件路径不存在'));
			return;
		}

		try {
			// 获取编辑器内容
			const textarea = this.element.querySelector('#editorTextarea');
			const content = textarea ? textarea.value : this.state.content;

			// 保存到localWorkspace
			if (window.StorageService) {
				await window.StorageService.initDB();

				// 计算文件大小（UTF-8字节数）
				const fileSize = new Blob([content]).size;

				// 只保存到localWorkspace（编辑后的文件）
				await window.StorageService._execute('localWorkspace', 'put', {
					path: this.state.filePath,
					content: content,
					sha: '', // 编辑后的文件没有GitHub SHA
					created: new Date().toISOString(),
					modified: new Date().toISOString(),
					isLocal: true,
					isModified: true,
					size: fileSize, // 使用UTF-8字节数
					type: 'file' // 添加文件类型
				});

				// 更新状态
				this.setState({
					content: content,
					isModified: false
				});

				// 更新保存按钮状态
				this.updateSaveButtonState();

				console.log('文件保存成功');
			}
		} catch (error) {
			console.error('保存文件失败:', error);
			alert(this.t('editor.saveFailed', '保存失败：{error}').replace('{error}', error.message));
		}
	}

	/**
	 * 使用git操作批量创建提交
	 * @async
	 * @param {Object} octokit - GitHub API客户端
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {Array} files - 文件数组，每个元素包含 {path, content}
	 * @param {string} message - 提交消息
	 * @param {string} branchName - 分支名称
	 */
	async createBatchCommit(octokit, owner, repo, files, message, branchName) {
		// 1. 获取当前用户信息
		const { data: userInfo } = await octokit.rest.users.getAuthenticated();
		const author = {
			name: userInfo.name || userInfo.login,
			email: userInfo.email || `${userInfo.login}@users.noreply.github.com`,
			date: new Date().toISOString()
		};

		// 2. 获取分支最新的提交SHA
		const { data: refData } = await octokit.rest.git.getRef({
			owner,
			repo,
			ref: `heads/${branchName}`
		});
		const baseTreeSHA = refData.object.sha;

		// 3. 获取基础tree的SHA
		const { data: commitData } = await octokit.rest.git.getCommit({
			owner,
			repo,
			commit_sha: baseTreeSHA
		});
		const treeSha = commitData.tree.sha;

		// 4. 为每个文件创建blob（或标记为删除）
		const treeItems = await Promise.all(files.map(async (file) => {
			// 如果是删除操作（content 为 null 或 isDeleted 为 true）
			if (file.isDeleted || file.content === null) {
				// 对于删除操作，需要获取当前分支中该文件的 SHA
				let fileSha = null;
				try {
					const { data: existingFile } = await octokit.rest.repos.getContent({
						owner,
						repo,
						path: file.path,
						ref: `heads/${branchName}`
					});
					if (existingFile && !Array.isArray(existingFile) && existingFile.sha) {
						fileSha = existingFile.sha;
					}
				} catch (err) {
					// 如果文件不存在（404），说明已经删除，跳过
					if (err.status !== 404) {
						console.warn(`获取文件 ${file.path} 的 SHA 失败:`, err);
					}
				}

				// 如果找不到文件，说明已经不存在，不需要在 tree 中删除
				if (!fileSha) {
					return null;
				}

				// 返回删除标记（sha 为 null 表示删除）
				return {
					path: file.path,
					mode: '100644',
					type: 'blob',
					sha: null // null SHA 表示删除文件
				};
			} else {
				// 正常文件，创建 blob
				const blobContent = btoa(unescape(encodeURIComponent(file.content)));

				// 创建blob
				const { data: blobData } = await octokit.rest.git.createBlob({
					owner,
					repo,
					content: blobContent,
					encoding: 'base64'
				});

				return {
					path: file.path,
					mode: '100644',
					type: 'blob',
					sha: blobData.sha
				};
			}
		}));

		// 过滤掉 null 值（文件不存在，无需删除）
		const validTreeItems = treeItems.filter(item => item !== null);

		// 5. 创建新的tree（包含添加、修改和删除的文件）
		const { data: treeData } = await octokit.rest.git.createTree({
			owner,
			repo,
			base_tree: treeSha,
			tree: validTreeItems
		});

		// 6. 创建新的commit
		const { data: commit } = await octokit.rest.git.createCommit({
			owner,
			repo,
			message: message,
			tree: treeData.sha,
			parents: [baseTreeSHA],
			author: author,
			committer: author
		});

		// 7. 更新引用（使用 force，因为我们已经重置了分支或这是新的提交）
		try {
			await octokit.rest.git.updateRef({
				owner,
				repo,
				ref: `heads/${branchName}`,
				sha: commit.sha,
				force: false // 首先尝试非强制更新（fast-forward）
			});
		} catch (error) {
			// 如果不是 fast-forward，使用强制更新
			if (error.status === 422 && error.message && error.message.includes('not a fast forward')) {
				console.warn('非 fast-forward 更新，使用强制更新');
				await octokit.rest.git.updateRef({
					owner,
					repo,
					ref: `heads/${branchName}`,
					sha: commit.sha,
					force: true
				});
			} else {
				throw error;
			}
		}
	}

	/**
	 * 切换预览模式
	 * @returns {void}
	 */
	togglePreview() {
		const previewMode = !this.state.previewMode;
		this.setState({ previewMode });

		// 更新预览模式DOM
		this.updatePreviewModeDOM(previewMode);
	}

	/**
	 * 更新预览内容
	 * @returns {void}
	 */
	updatePreviewContent() {
		const previewContent = this.element.querySelector('#previewContent');
		if (previewContent) {
			previewContent.innerHTML = this.renderPreviewContent();
		}
	}

	/**
	 * 更新保存按钮状态
	 * @returns {void}
	 */
	updateSaveButtonState() {
		const saveBtn = this.element.querySelector('#saveBtn');
		if (saveBtn) {
			saveBtn.disabled = !this.state.isModified;
			saveBtn.textContent = this.state.isModified ? '💾 保存*' : '💾 保存';
		}

		// 同时更新提交按钮的显示
		this.updateSubmitButtonState();
	}

	/**
	 * 更新提交按钮状态
	 * @returns {void}
	 */
	updateSubmitButtonState() {
		const submitBtn = this.element.querySelector('#submitBtn');
		if (submitBtn) {
			submitBtn.style.display = (this.state.isModified || this.state.hasSubmitted) ? 'none' : 'inline-block';
		}
	}

	/**
	 * 更新文件内容DOM
	 * @param {string} content - 文件内容
	 * @returns {void}
	 */
	updateContentDOM(content) {
		if (!this.element) return;

		const editor = this.element.querySelector('#markdownEditor');
		if (editor) {
			editor.value = content;
		}

		// 更新预览内容
		if (this.state.previewMode) {
			this.updatePreviewContent();
		}
	}

	/**
	 * 更新预览模式DOM
	 * @param {boolean} previewMode - 是否预览模式
	 * @returns {void}
	 */
	updatePreviewModeDOM(previewMode) {
		if (!this.element) return;

		const editorPanel = this.element.querySelector('#editorPanel');
		const previewPanel = this.element.querySelector('#previewPanel');
		const previewBtn = this.element.querySelector('#previewBtn');
		const editor = this.element.querySelector('#markdownEditor');
		const saveBtn = this.element.querySelector('#saveBtn');

		if (editorPanel) {
			editorPanel.style.display = previewMode ? 'none' : 'block';
		}

		if (previewPanel) {
			previewPanel.style.display = previewMode ? 'flex' : 'none';
		}

		if (previewBtn) {
			previewBtn.textContent = previewMode ? '✏️ 编辑' : '👁 预览';
			previewBtn.classList.toggle('active', previewMode);
		}

		// 更新编辑器readonly状态
		if (editor) {
			// 如果是viewMode='view'且是预览模式，才设置为readonly
			editor.readOnly = this.state.viewMode === 'view' && previewMode;
		}

		// 更新保存按钮的显示/隐藏
		if (saveBtn) {
			saveBtn.style.display = previewMode ? 'none' : 'inline-block';
		}

		// 更新保存按钮和提交按钮的状态
		this.updateSaveButtonState();

		// 如果切换到预览模式，更新预览内容
		if (previewMode) {
			this.updatePreviewContent();
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
	 * 更新文件名DOM
	 * @param {string} fileName - 文件名
	 * @returns {void}
	 */
	updateFileNameDOM(fileName) {
		if (!this.element) return;

		const fileNameElement = this.element.querySelector('#fileName');
		if (fileNameElement) {
			fileNameElement.textContent = fileName;
		}
	}

	/**
	 * 设置文件内容
	 * @param {string} content - 文件内容
	 * @returns {void}
	 */
	setContent(content) {
		this.setState({ content });
		this.updateContentDOM(content);
	}

	/**
	 * 设置文件路径
	 * @param {string} filePath - 文件路径
	 * @returns {void}
	 */
	setFilePath(filePath) {
		const readonly = this.isGithubProtectedFile(filePath);
		this.setState({
			filePath,
			readonly,
			previewMode: readonly || this.state.previewMode, // .github 文件强制预览模式
			viewMode: readonly ? 'view' : this.state.viewMode // .github 文件强制 view 模式
		});
		// 文件路径变化时，需要重新加载内容
		this.loadFileContent();
	}

	/**
	 * 设置文件名
	 * @param {string} fileName - 文件名
	 * @returns {void}
	 */
	setFileName(fileName) {
		this.setState({ fileName });
		this.updateFileNameDOM(fileName);
	}

	/**
	 * 显示信息面板
	 * @param {string} content - 面板内容
	 * @param {string} [title='文件信息'] - 面板标题
	 * @returns {void}
	 */
	showInfoPanel(content, title = '文件信息') {
		this.setState({
			showInfoPanel: true,
			infoPanelContent: content
		});
		this.updateInfoPanelDOM(true, content, title);
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
	 * 切换文件信息显示状态
	 * @returns {void}
	 */
	toggleFileInfo() {
		const isCurrentlyVisible = this.state.moduleStates.fileInfo;

		if (!isCurrentlyVisible) {
			this.updateModuleState('fileInfo', true);
			this.showFileInfo();
		} else {
			this.hideFileInfo();
		}
	}

	/**
	 * 显示文件信息
	 * @returns {void}
	 */
	showFileInfo() {
		const fileInfo = `
			<div class="info-item">
				<label>${this.t('editor.infoPanel.fileName', '文件名')}:</label>
				<span>${this.state.fileName || 'README.md'}</span>
			</div>
			<div class="info-item">
				<label>${this.t('editor.infoPanel.filePath', '文件路径')}:</label>
				<span>${this.state.filePath || '/README.md'}</span>
			</div>
			<div class="info-item">
				<label>${this.t('editor.infoPanel.fileSize', '文件大小')}:</label>
				<span>${this.state.content ? this.state.content.length : 0} ${this.t('editor.infoPanel.characters', '字符')}</span>
			</div>
			<div class="info-item">
				<label>${this.t('editor.infoPanel.lastModified', '最后修改')}:</label>
				<span>${new Date().toLocaleString()}</span>
			</div>
		`;
		this.showInfoPanel(fileInfo, this.t('editor.fileInfo', '文件信息'));
	}

	/**
	 * 隐藏文件信息
	 * @returns {void}
	 */
	hideFileInfo() {
		// 如果文件信息在信息面板中显示，关闭信息面板
		if (this.state.showInfoPanel) {
			this.hideInfoPanel();
		}
		// 更新状态
		this.updateModuleState('fileInfo', false);
	}

	/**
	 * 切换编辑历史显示状态
	 * @returns {void}
	 */
	toggleEditHistory() {
		const isCurrentlyVisible = this.state.moduleStates.editHistory;

		if (!isCurrentlyVisible) {
			this.updateModuleState('editHistory', true);
			this.showEditHistory();
		} else {
			this.hideEditHistory();
		}
	}

	/**
	 * 显示编辑历史
	 * @returns {void}
	 */
	showEditHistory() {
		const editHistory = `
			<div class="history-item">
				<div class="history-time">${new Date().toLocaleString()}</div>
				<div class="history-action">${this.t('editor.infoPanel.createFile', '创建文件')}</div>
			</div>
			<div class="history-item">
				<div class="history-time">${new Date(Date.now() - 3600000).toLocaleString()}</div>
				<div class="history-action">${this.t('editor.infoPanel.editContent', '编辑内容')}</div>
			</div>
		`;
		this.showInfoPanel(editHistory, this.t('editor.editHistory', '编辑历史'));
	}

	/**
	 * 隐藏编辑历史
	 * @returns {void}
	 */
	hideEditHistory() {
		// 如果编辑历史在信息面板中显示，关闭信息面板
		if (this.state.showInfoPanel) {
			this.hideInfoPanel();
		}
		// 更新状态
		this.updateModuleState('editHistory', false);
	}

	/**
	 * 切换协作信息显示状态
	 * @returns {void}
	 */
	toggleCollaboration() {
		const isCurrentlyVisible = this.state.moduleStates.collaboration;

		if (!isCurrentlyVisible) {
			this.updateModuleState('collaboration', true);
			this.showCollaboration();
		} else {
			this.hideCollaboration();
		}
	}

	/**
	 * 显示协作信息
	 * @returns {void}
	 */
	showCollaboration() {
		const collaboration = `
			<div class="collaboration-item">
				<div class="collaborator">👤 minne100</div>
				<div class="collaborator-status">${this.t('editor.infoPanel.online', '在线')}</div>
			</div>
			<div class="collaboration-item">
				<div class="collaborator">👤 ${this.t('editor.infoPanel.otherUsers', '其他用户')}</div>
				<div class="collaborator-status">${this.t('editor.infoPanel.offline', '离线')}</div>
			</div>
		`;
		this.showInfoPanel(collaboration, this.t('editor.collaboration', '协作信息'));
	}

	/**
	 * 隐藏协作信息
	 * @returns {void}
	 */
	hideCollaboration() {
		// 如果协作信息在信息面板中显示，关闭信息面板
		if (this.state.showInfoPanel) {
			this.hideInfoPanel();
		}
		// 更新状态
		this.updateModuleState('collaboration', false);
	}
}

// 注册组件
window.EditorPage = EditorPage;
