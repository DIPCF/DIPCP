/**
 * 通用模态框组件
 * 支持输入模态框、确认模态框、信息模态框三种类型
 */
class Modal extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			show: props.show || false,
			type: props.type || 'info', // 'input', 'confirm', 'info', 'cla'
			title: props.title || '',
			message: props.message || props.content || '',
			placeholder: props.placeholder || '',
			defaultValue: props.defaultValue || '',
			callback: props.callback || null,
			inputValue: props.defaultValue || '',
			showCancel: props.showCancel !== false,
			confirmText: props.confirmText || '确认',
			cancelText: props.cancelText || '取消',
			inputLabel: props.inputLabel || '',
			inputPlaceholder: props.inputPlaceholder || '',
			claContent: props.claContent || ''
		};

		// 事件处理器的引用，用于正确移除事件监听器
		this.eventHandlers = {
			handleCancel: () => this.handleCancel(),
			handleConfirm: () => this.handleConfirm(),
			handleInputChange: (e) => this.handleInputChange(e),
			handleKeyDown: (e) => this.handleKeyDown(e),
			handleOverlayClick: (e) => this.handleOverlayClick(e)
		};
	}

	/**
	 * 显示输入模态框
	 * @param {string} title - 标题
	 * @param {string} message - 提示信息
	 * @param {string} placeholder - 输入框占位符
	 * @param {string} defaultValue - 默认值
	 * @param {function} callback - 确认回调函数
	 */
	showInput(title, message, placeholder = '', defaultValue = '', callback = null) {
		this.setState({
			show: true,
			type: 'input',
			title,
			message,
			placeholder,
			defaultValue,
			callback,
			inputValue: defaultValue
		});
		this.updateModal();
	}

	/**
	 * 显示确认模态框
	 * @param {string} title - 标题
	 * @param {string} message - 确认信息
	 * @param {function} callback - 确认回调函数
	 */
	showConfirm(title, message, callback = null) {
		this.setState({
			show: true,
			type: 'confirm',
			title,
			message,
			callback
		});
		this.updateModal();
	}

	/**
	 * 显示信息模态框
	 * @param {string} title - 标题
	 * @param {string} message - 信息内容
	 * @param {Object} [options] - 可选配置
	 * @param {boolean} [options.showCancel=false] - 是否显示取消按钮
	 */
	showInfo(title, message, options = {}) {
		this.setState({
			show: true,
			type: 'info',
			title,
			message,
			showCancel: options.showCancel !== undefined ? options.showCancel : false
		});
		this.updateModal();
	}

	/**
	 * 隐藏模态框
	 */
	hide() {
		// 先清理事件监听器
		this.unbindEvents();

		// 直接从DOM中移除模态框
		if (this.element && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}

		// 清空element引用
		this.element = null;

		// 重置状态
		this.setState({
			show: false,
			type: 'info',
			title: '',
			message: '',
			placeholder: '',
			defaultValue: '',
			callback: null,
			inputValue: ''
		});
	}

	/**
	 * 处理确认操作
	 */
	handleConfirm() {
		if (this.state.type === 'input' && this.state.callback) {
			this.state.callback(this.state.inputValue);
		} else if (this.state.type === 'cla' && this.onConfirm) {
			console.log('🔵 [Modal] 调用 onConfirm 回调, inputValue:', this.state.inputValue);
			this.onConfirm(this.state.inputValue);
		} else if (this.state.type === 'cla' && this.state.callback) {
			this.state.callback(this.state.inputValue);
		} else if (this.state.type === 'confirm' && this.state.callback) {
			this.state.callback(true);
		} else if (this.state.type === 'info' && this.onConfirm) {
			this.onConfirm();
		}
		this.hide();
	}

	/**
	 * 处理取消操作
	 */
	handleCancel() {
		if (this.state.type === 'confirm' && this.state.callback) {
			this.state.callback(false);
		} else if (this.state.type === 'cla' && this.onCancel) {
			this.onCancel();
		} else if (this.state.type === 'info' && this.onCancel) {
			this.onCancel();
		}
		this.hide();
	}

	/**
	 * 处理输入框变化
	 */
	handleInputChange(event) {
		this.setState({ inputValue: event.target.value });
	}

	/**
	 * 处理键盘事件
	 */
	handleKeyDown(event) {
		if (event.key === 'Enter' && this.state.type === 'input') {
			this.handleConfirm();
		} else if (event.key === 'Escape') {
			this.handleCancel();
		}
	}

	/**
	 * 处理遮罩点击
	 */
	handleOverlayClick(event) {
		if (event.target === event.currentTarget) {
			this.handleCancel();
		}
	}

	render() {
		if (!this.state.show) {
			// 返回null，表示不渲染任何内容
			return null;
		}

		const modalElement = document.createElement('div');
		modalElement.className = 'modal-overlay';
		modalElement.innerHTML = `
			<div class="modal-content">
				<div class="modal-header">
					<h3>${this.escapeHtml(this.state.title)}</h3>
					<button class="btn-close" id="modal-close">×</button>
				</div>
				<div class="modal-body">
					${this.renderBody()}
				</div>
				<div class="modal-footer">
					${this.renderFooter()}
				</div>
			</div>
		`;

		// Modal是特殊的，它创建自己的DOM，不通过Component.mount
		// 返回包含content的overlay元素
		return modalElement;
	}


	/**
	 * 渲染模态框主体内容
	 */
	renderBody() {
		switch (this.state.type) {
			case 'input':
				return `
					<div class="form-group">
						<label for="modal-input">${this.escapeHtml(this.state.message)}</label>
						<input
							type="text"
							id="modal-input"
							placeholder="${this.escapeHtmlAttribute(this.state.placeholder)}"
							value="${this.escapeHtmlAttribute(this.state.inputValue)}"
						/>
					</div>
				`;
			case 'cla':
				return `
					<div class="cla-content">
						<div class="cla-message">
							<p>${this.escapeHtml(this.state.message)}</p>
						</div>
					<div class="cla-agreement" id="cla-agreement-container">
						<div class="cla-text" id="cla-markdown-content">${this.markdownToHtml(this.state.claContent)}</div>
					</div>
						<div class="form-group">
							<label for="modal-input">${this.escapeHtml(this.state.inputLabel)}</label>
							<input
								type="text"
								id="modal-input"
								placeholder="${this.escapeHtmlAttribute(this.state.inputPlaceholder)}"
								value="${this.escapeHtmlAttribute(this.state.inputValue)}"
							/>
						</div>
					</div>
				`;
			case 'confirm':
				return `
					<div class="confirm-message">
						<div class="confirm-icon">⚠️</div>
						<div class="confirm-content">
							<p>${this.escapeHtml(this.state.message)}</p>
						</div>
					</div>
				`;
			case 'info':
				return `
					<div class="info-message">
						<div class="info-icon">ℹ️</div>
						<div class="info-content">
							<p>${this.escapeHtml(this.state.message)}</p>
						</div>
					</div>
				`;
			default:
				return '';
		}
	}

	/**
	 * 渲染模态框底部按钮
	 */
	renderFooter() {
		const t = (key, fallback) => {
			if (window.I18nService && window.I18nService.t) {
				return window.I18nService.t(key, fallback);
			}
			return fallback;
		};

		switch (this.state.type) {
			case 'input':
				return `
					<button class="btn btn-secondary" id="modal-cancel">${t('common.cancel', '取消')}</button>
					<button class="btn btn-primary" id="modal-confirm">${t('common.confirm', '确认')}</button>
				`;
			case 'cla':
				return `
				<button class="btn btn-secondary" id="modal-cancel">${this.escapeHtml(this.state.cancelText || t('common.cancel', '取消'))}</button>
				<button class="btn btn-primary" id="modal-confirm" disabled>${this.escapeHtml(this.state.confirmText || t('common.confirm', '确认'))}</button>
			`;
			case 'confirm':
				return `
					<button class="btn btn-secondary" id="modal-cancel">${t('common.cancel', '取消')}</button>
					<button class="btn btn-danger" id="modal-confirm">${t('common.confirm', '确认')}</button>
				`;
			case 'info':
				if (this.state.showCancel) {
					return `
					<button class="btn btn-secondary" id="modal-cancel">${this.escapeHtml(this.state.cancelText || t('common.cancel', '取消'))}</button>
					<button class="btn btn-primary" id="modal-confirm">${this.escapeHtml(this.state.confirmText || t('common.confirm', '确认'))}</button>
				`;
				} else {
					return `
					<button class="btn btn-primary" id="modal-close-footer">${t('common.close', '关闭')}</button>
				`;
				}
			default:
				return '';
		}
	}

	/**
	 * 更新模态框显示
	 */
	updateModal() {
		// 如果模态框元素不存在或不在DOM中，创建新的模态框
		if (!this.element || !this.element.parentNode) {
			const newElement = this.render();
			if (newElement) {
				document.body.appendChild(newElement);
				this.element = newElement;
				this.bindEvents();
			}
			return;
		}

		// 如果模态框已经存在于DOM中，更新内容
		const titleEl = this.element.querySelector('.modal-header h3');
		if (titleEl) {
			// 使用 textContent 而不是 innerHTML，自动防止 XSS
			titleEl.textContent = this.state.title;
		}

		const bodyEl = this.element.querySelector('.modal-body');
		if (bodyEl) {
			bodyEl.innerHTML = this.renderBody();
		}

		const footerEl = this.element.querySelector('.modal-footer');
		if (footerEl) {
			footerEl.innerHTML = this.renderFooter();
		}

		// 重新绑定事件
		this.bindEvents();
	}

	bindEvents() {
		if (!this.element) return;

		// 先移除所有现有的事件监听器，避免重复绑定
		this.unbindEvents();

		// 关闭按钮（右上角）
		const closeBtn = this.element.querySelector('#modal-close');
		if (closeBtn) {
			closeBtn.addEventListener('click', this.eventHandlers.handleCancel);
		}

		// 关闭按钮（底部）
		const closeFooterBtn = this.element.querySelector('#modal-close-footer');
		if (closeFooterBtn) {
			closeFooterBtn.addEventListener('click', this.eventHandlers.handleCancel);
		}

		// 取消按钮
		const cancelBtn = this.element.querySelector('#modal-cancel');
		if (cancelBtn) {
			cancelBtn.addEventListener('click', this.eventHandlers.handleCancel);
		}

		// 确认按钮
		const confirmBtn = this.element.querySelector('#modal-confirm');
		if (confirmBtn) {
			confirmBtn.addEventListener('click', this.eventHandlers.handleConfirm);
		}

		// 输入框
		const input = this.element.querySelector('#modal-input');
		if (input) {
			input.addEventListener('input', this.eventHandlers.handleInputChange);
			input.addEventListener('keydown', this.eventHandlers.handleKeyDown);
			// 自动聚焦
			setTimeout(() => input.focus(), 100);
		}

		// CLA类型：添加滚动监听，检查是否滚动到底部
		if (this.state.type === 'cla') {
			const claContainer = this.element.querySelector('#cla-agreement-container');
			if (claContainer) {
				const checkScroll = () => {
					const scrollTop = claContainer.scrollTop;
					const scrollHeight = claContainer.scrollHeight;
					const clientHeight = claContainer.clientHeight;
					// 允许5px的误差
					const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 5;

					if (confirmBtn) {
						confirmBtn.disabled = !isScrolledToBottom;
					}
				};

				// 绑定滚动事件
				claContainer.addEventListener('scroll', checkScroll);
				// 初始检查（如果内容很短，可能一开始就在底部）
				setTimeout(checkScroll, 100);

				// 保存事件处理器以便后续移除
				this.eventHandlers.handleCLAScroll = checkScroll;
			}
		}

		// 遮罩点击
		this.element.addEventListener('click', this.eventHandlers.handleOverlayClick);

		// 键盘事件
		document.addEventListener('keydown', this.eventHandlers.handleKeyDown);
	}

	unbindEvents() {
		if (!this.element) return;

		// 移除所有事件监听器
		const closeBtn = this.element.querySelector('#modal-close');
		if (closeBtn) {
			closeBtn.removeEventListener('click', this.eventHandlers.handleCancel);
		}

		const closeFooterBtn = this.element.querySelector('#modal-close-footer');
		if (closeFooterBtn) {
			closeFooterBtn.removeEventListener('click', this.eventHandlers.handleCancel);
		}

		const cancelBtn = this.element.querySelector('#modal-cancel');
		if (cancelBtn) {
			cancelBtn.removeEventListener('click', this.eventHandlers.handleCancel);
		}

		const confirmBtn = this.element.querySelector('#modal-confirm');
		if (confirmBtn) {
			confirmBtn.removeEventListener('click', this.eventHandlers.handleConfirm);
		}

		const input = this.element.querySelector('#modal-input');
		if (input) {
			input.removeEventListener('input', this.eventHandlers.handleInputChange);
			input.removeEventListener('keydown', this.eventHandlers.handleKeyDown);
		}

		// 移除CLA滚动事件监听器
		if (this.eventHandlers.handleCLAScroll) {
			const claContainer = this.element.querySelector('#cla-agreement-container');
			if (claContainer) {
				claContainer.removeEventListener('scroll', this.eventHandlers.handleCLAScroll);
			}
			delete this.eventHandlers.handleCLAScroll;
		}

		// 移除遮罩点击事件
		this.element.removeEventListener('click', this.eventHandlers.handleOverlayClick);

		// 移除键盘事件监听
		document.removeEventListener('keydown', this.eventHandlers.handleKeyDown);
	}

	destroy() {
		this.unbindEvents();
		super.destroy();
	}
}

// 导出组件
window.Modal = Modal;
