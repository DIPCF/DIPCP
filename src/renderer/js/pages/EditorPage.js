/**
 * 编辑器页面组件
 * 完全组件化的编辑器页面
 */
class EditorPage extends BasePage {
	constructor(props = {}) {
		super(props);
		this.state = {
			filePath: props.filePath || '',
			fileName: props.fileName || '',
			content: props.content || '',
			isModified: false,
			previewMode: false,
			viewMode: props.mode || 'edit', // 'edit' 或 'view'
			showInfoPanel: false,
			infoPanelContent: null,
			projectName: props.projectName || 'DPCC',
			onSave: props.onSave || null,
			onPreview: props.onPreview || null,
			onSubmitReview: props.onSubmitReview || null,
			// 功能模块状态缓存
			moduleStates: this.loadModuleStates()
		};
	}

	/**
	 * 加载模块状态缓存
	 */
	loadModuleStates() {
		try {
			const cached = localStorage.getItem('spcp-editor-module-states');
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
	 */
	saveModuleStates() {
		try {
			localStorage.setItem('spcp-editor-module-states', JSON.stringify(this.state.moduleStates));
		} catch (error) {
			console.error('保存编辑器模块状态缓存失败:', error);
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
		console.log(`更新编辑器模块状态: ${moduleName} = ${isOpen}`, newModuleStates);
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

	async loadFileContent() {
		if (!this.state.filePath) {
			this.setState({ content: this.t('editor.noContent', '暂无内容') });
			this.rerender();
			return;
		}

		try {
			// 优先从localWorkspace查找（用户编辑的文件）
			if (window.StorageService) {
				await window.StorageService.initDB();

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
					this.rerender();
					return;
				}
			}
			// 如果都失败了，显示默认内容
			this.setState({ content: this.t('editor.noContent', '暂无内容') });
			this.rerender();
		} catch (error) {
			console.error('加载文件内容失败:', error);
			this.setState({ content: this.t('editor.noContent', '暂无内容') });
			this.rerender();
		}

		// 根据缓存状态自动显示相应的模块（只调用一次）
		this.restoreModuleStates();
	}

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

	renderHeader(getText) {
		// 使用BasePage的renderHeader方法
		return super.renderHeader('editor', false, null);
	}

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

	renderToolbar(getText) {
		return `
            <div class="editor-toolbar">
                <div class="editor-toolbar-left">
                    <button class="btn btn-sm" id="saveBtn">${getText('editor.save', '💾 保存')}</button>
                    <button class="btn btn-sm ${this.state.previewMode ? 'active' : ''}" id="previewBtn">
                        ${this.state.previewMode ? getText('editor.edit', '✏️ 编辑') : getText('editor.preview', '👁 预览')}
                    </button>
                </div>
                <div class="editor-toolbar-right">
                    <button class="btn btn-primary btn-sm" id="submitBtn">${getText('editor.submitReview', '📤 提交审核')}</button>
                </div>
            </div>
        `;
	}


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
	 */
	renderTextEditor(getText) {
		return `
			<div class="editor-panel" id="editorPanel" style="display: ${this.state.previewMode ? 'none' : 'block'};">
				<textarea id="markdownEditor" placeholder="${getText('editor.ui.loading', '加载中...')}" ${this.state.viewMode === 'view' ? 'readonly' : ''}>${this.state.content}</textarea>
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

	async mount(container) {
		super.mount(container);

		// 加载文件内容
		await this.loadFileContent();

		// 绑定事件
		this.bindEvents();
	}

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
			editor.addEventListener('input', (e) => {
				this.setState({
					content: e.target.value,
					isModified: true
				});
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
				this.rerender();
				this.bindEvents();
			});
		}
	}

	async handleSave() {
		await this.saveContent();
		this.setState({ isModified: false });
		this.updateSaveButtonState();
	}

	handleSubmitReview() {
		console.log('提交审核功能');
		// TODO: 实现提交审核逻辑
		alert(this.t('editor.submitNotImplemented', '提交审核功能暂未实现'));
	}

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

				// 只保存到localWorkspace（编辑后的文件）
				await window.StorageService._execute('localWorkspace', 'put', {
					path: this.state.filePath,
					content: content,
					sha: '', // 编辑后的文件没有GitHub SHA
					created: new Date().toISOString(),
					modified: new Date().toISOString(),
					isLocal: true,
					isModified: true
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

	togglePreview() {
		const previewMode = !this.state.previewMode;
		this.setState({ previewMode });

		// 更新预览内容
		if (previewMode) {
			this.updatePreviewContent();
		}

		// 重新渲染并绑定事件
		this.rerender();
		this.bindEvents();
	}

	updatePreviewContent() {
		const previewContent = this.element.querySelector('#previewContent');
		if (previewContent) {
			previewContent.innerHTML = this.renderPreviewContent();
		}
	}

	updateSaveButtonState() {
		const saveBtn = this.element.querySelector('#saveBtn');
		if (saveBtn) {
			saveBtn.disabled = !this.state.isModified;
			saveBtn.textContent = this.state.isModified ? '💾 保存*' : '💾 保存';
		}
	}

	setContent(content) {
		this.setState({ content });
		const editor = this.element.querySelector('#markdownEditor');
		if (editor) {
			editor.value = content;
		}
		this.rerender();
		this.bindEvents();
	}

	setFilePath(filePath) {
		this.setState({ filePath });
		this.rerender();
		this.bindEvents();
	}

	setFileName(fileName) {
		this.setState({ fileName });
		this.rerender();
		this.bindEvents();
	}

	showInfoPanel(content, title = '文件信息') {
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


	toggleFileInfo() {
		const isCurrentlyVisible = this.state.moduleStates.fileInfo;

		if (!isCurrentlyVisible) {
			this.updateModuleState('fileInfo', true);
			this.showFileInfo();
		} else {
			this.hideFileInfo();
		}
	}

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

	hideFileInfo() {
		// 如果文件信息在信息面板中显示，关闭信息面板
		if (this.state.showInfoPanel) {
			this.hideInfoPanel();
		}
		// 更新状态
		this.updateModuleState('fileInfo', false);
	}

	toggleEditHistory() {
		const isCurrentlyVisible = this.state.moduleStates.editHistory;

		if (!isCurrentlyVisible) {
			this.updateModuleState('editHistory', true);
			this.showEditHistory();
		} else {
			this.hideEditHistory();
		}
	}

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

	hideEditHistory() {
		// 如果编辑历史在信息面板中显示，关闭信息面板
		if (this.state.showInfoPanel) {
			this.hideInfoPanel();
		}
		// 更新状态
		this.updateModuleState('editHistory', false);
	}

	toggleCollaboration() {
		const isCurrentlyVisible = this.state.moduleStates.collaboration;

		if (!isCurrentlyVisible) {
			this.updateModuleState('collaboration', true);
			this.showCollaboration();
		} else {
			this.hideCollaboration();
		}
	}

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
