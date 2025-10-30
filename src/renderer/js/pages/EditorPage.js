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

		this.state = {
			filePath: props.filePath || '',
			fileName: props.fileName || '',
			content: props.content || '',
			isModified: false,
			hasSubmitted: false, // 将在loadFileContent中异步加载
			previewMode: initialPreviewMode,
			viewMode: viewMode, // 'edit' 或 'view'
			showInfoPanel: false,
			infoPanelContent: null,
			projectName: props.projectName || 'DIPCP',
			repoInfo: userInfo.user.repositoryInfo,
			user: userInfo.user,
			userRole: userInfo.userRole,
			permissionInfo: userInfo.permissionInfo,
			// 功能模块状态缓存
			moduleStates: this.loadModuleStates()
		};
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
				this.togglePreview();
			});
		}

		// 提交审核按钮
		const submitBtn = this.element.querySelector('#submitBtn');
		if (submitBtn) {
			submitBtn.addEventListener('click', () => {
				this.handleSubmitReview();
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
	 * 处理提交审核操作
	 * @returns {void}
	 */
	handleSubmitReview() {
		// 包一层立即执行的异步函数，避免更改对外API签名
		(async () => {
			try {
				// 基础校验
				const user = this.state.user;
				const repoInfo = this.state.repoInfo || (user && user.repositoryInfo);
				const filePath = this.state.filePath;
				if (!user || !user.token) {
					alert(this.t('editor.errors.userNotLoggedInOrTokenUnavailable', '用户未登录或访问令牌不可用'));
					return;
				}
				if (!repoInfo || !repoInfo.owner || !repoInfo.repo) {
					alert(this.t('editor.errors.repositoryInfoUnavailable', '仓库信息不可用'));
					return;
				}
				if (!filePath) {
					alert(this.t('editor.errors.filePathMissing', '文件路径缺失'));
					return;
				}

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

				// 获取默认分支最新提交SHA
				const { data: baseRef } = await octokit.rest.git.getRef({ owner: repoInfo.owner, repo: repoInfo.repo, ref: `heads/${defaultBranch}` });
				const baseSha = baseRef.object.sha;

				// 目标分支命名：spcp/<username>
				const safeUser = (user.login || user.username || 'user').replace(/[^a-zA-Z0-9-_]/g, '-');
				const branchName = `spcp/${safeUser}`;

				// 尝试读取目标分支，不存在则创建
				let branchExists = true;
				try {
					await octokit.rest.git.getRef({ owner: repoInfo.owner, repo: repoInfo.repo, ref: `heads/${branchName}` });
				} catch (err) {
					if (err && err.status === 404) {
						branchExists = false;
					} else {
						throw err;
					}
				}

				if (!branchExists) {
					await octokit.rest.git.createRef({
						owner: repoInfo.owner,
						repo: repoInfo.repo,
						ref: `refs/heads/${branchName}`,
						sha: baseSha
					});
				} else {
					// 分支已存在：可选地快进到最新基线（避免落后）
					await octokit.rest.git.updateRef({
						owner: repoInfo.owner,
						repo: repoInfo.repo,
						ref: `heads/${branchName}`,
						sha: baseSha,
						force: true
					});
				}

				// 读取目标分支上的文件，若存在需要sha以便更新
				let existingSha = undefined;
				try {
					const { data: existing } = await octokit.rest.repos.getContent({
						owner: repoInfo.owner,
						repo: repoInfo.repo,
						path: filePath,
						ref: branchName
					});
					if (existing && !Array.isArray(existing) && existing.sha) {
						existingSha = existing.sha;
					}
				} catch (err) {
					// 404 表示文件不存在于该分支，忽略
					if (!(err && err.status === 404)) {
						throw err;
					}
				}

				// 将当前内容以 Base64 提交
				const content = this.state.content || '';
				const base64Content = btoa(unescape(encodeURIComponent(content)));
				const commitMessage = this.t('editor.commitMessage', '通过DIPCP更新文件：') + (this.state.fileName || this.state.filePath || '文件');

				await octokit.rest.repos.createOrUpdateFileContents({
					owner: repoInfo.owner,
					repo: repoInfo.repo,
					path: filePath,
					message: commitMessage,
					content: base64Content,
					branch: branchName,
					sha: existingSha
				});

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
		this.setState({ filePath });
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
