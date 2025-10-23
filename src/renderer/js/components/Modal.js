/**
 * 通用模态框组件
 * 支持输入模态框、确认模态框、信息模态框三种类型
 */
class Modal extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			show: props.show || false,
			type: props.type || 'info', // 'input', 'confirm', 'info'
			title: props.title || '',
			message: props.message || props.content || '',
			placeholder: props.placeholder || '',
			defaultValue: props.defaultValue || '',
			callback: props.callback || null,
			inputValue: props.defaultValue || '',
			showCancel: props.showCancel !== false,
			confirmText: props.confirmText || '确认',
			cancelText: props.cancelText || '取消'
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
		this.rerender();
		this.bindEvents();
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
		this.rerender();
		this.bindEvents();
	}

	/**
	 * 显示信息模态框
	 * @param {string} title - 标题
	 * @param {string} message - 信息内容
	 */
	showInfo(title, message) {
		this.setState({
			show: true,
			type: 'info',
			title,
			message
		});
		this.rerender();
		this.bindEvents();
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
		} else if (this.state.type === 'confirm' && this.state.callback) {
			this.state.callback(true);
		}
		this.hide();
	}

	/**
	 * 处理取消操作
	 */
	handleCancel() {
		if (this.state.type === 'confirm' && this.state.callback) {
			this.state.callback(false);
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
			return document.createElement('div'); // 返回空div而不是空字符串
		}

		const container = document.createElement('div');
		container.innerHTML = `
			<div class="modal-overlay" id="modal-overlay">
				<div class="modal-content">
					<div class="modal-header">
						<h3>${this.state.title}</h3>
						<button class="btn-close" id="modal-close">×</button>
					</div>
					<div class="modal-body">
						${this.renderBody()}
					</div>
					<div class="modal-footer">
						${this.renderFooter()}
					</div>
				</div>
			</div>
		`;
		return container.firstElementChild; // 返回实际的DOM元素
	}

	/**
	 * 渲染模态框主体内容
	 */
	renderBody() {
		switch (this.state.type) {
			case 'input':
				return `
					<div class="form-group">
						<label for="modal-input">${this.state.message}</label>
						<input
							type="text"
							id="modal-input"
							placeholder="${this.state.placeholder}"
							value="${this.state.inputValue}"
						/>
					</div>
				`;
			case 'confirm':
				return `
					<div class="confirm-message">
						<div class="confirm-icon">⚠️</div>
						<div class="confirm-content">
							<p>${this.state.message}</p>
						</div>
					</div>
				`;
			case 'info':
				return `
					<div class="info-message">
						<div class="info-icon">ℹ️</div>
						<div class="info-content">
							<p>${this.state.message}</p>
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
			case 'confirm':
				return `
					<button class="btn btn-secondary" id="modal-cancel">${t('common.cancel', '取消')}</button>
					<button class="btn btn-danger" id="modal-confirm">${t('common.confirm', '确认')}</button>
				`;
			case 'info':
				return `
					<button class="btn btn-primary" id="modal-close-footer">${t('common.close', '关闭')}</button>
				`;
			default:
				return '';
		}
	}

	bindEvents() {
		if (!this.element) return;

		// 先移除所有现有的事件监听器，避免重复绑定
		this.unbindEvents();

		// 关闭按钮（右上角）
		const closeBtn = this.element.querySelector('#modal-close');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				this.handleCancel();
			});
		}

		// 关闭按钮（底部）
		const closeFooterBtn = this.element.querySelector('#modal-close-footer');
		if (closeFooterBtn) {
			closeFooterBtn.addEventListener('click', () => {
				this.handleCancel();
			});
		}

		// 取消按钮
		const cancelBtn = this.element.querySelector('#modal-cancel');
		if (cancelBtn) {
			cancelBtn.addEventListener('click', () => {
				this.handleCancel();
			});
		}

		// 确认按钮
		const confirmBtn = this.element.querySelector('#modal-confirm');
		if (confirmBtn) {
			confirmBtn.addEventListener('click', () => {
				this.handleConfirm();
			});
		}

		// 输入框
		const input = this.element.querySelector('#modal-input');
		if (input) {
			input.addEventListener('input', (e) => this.handleInputChange(e));
			input.addEventListener('keydown', (e) => this.handleKeyDown(e));
			// 自动聚焦
			setTimeout(() => input.focus(), 100);
		}

		// 遮罩点击
		const overlay = this.element.querySelector('#modal-overlay');
		if (overlay) {
			overlay.addEventListener('click', (e) => this.handleOverlayClick(e));
		}

		// 键盘事件
		document.addEventListener('keydown', (e) => this.handleKeyDown(e));
	}

	unbindEvents() {
		if (!this.element) return;

		// 移除所有事件监听器
		const closeBtn = this.element.querySelector('#modal-close');
		if (closeBtn) {
			closeBtn.removeEventListener('click', () => this.handleCancel());
		}

		const closeFooterBtn = this.element.querySelector('#modal-close-footer');
		if (closeFooterBtn) {
			closeFooterBtn.removeEventListener('click', () => this.handleCancel());
		}

		const cancelBtn = this.element.querySelector('#modal-cancel');
		if (cancelBtn) {
			cancelBtn.removeEventListener('click', () => this.handleCancel());
		}

		const confirmBtn = this.element.querySelector('#modal-confirm');
		if (confirmBtn) {
			confirmBtn.removeEventListener('click', () => this.handleConfirm());
		}

		const input = this.element.querySelector('#modal-input');
		if (input) {
			input.removeEventListener('input', (e) => this.handleInputChange(e));
			input.removeEventListener('keydown', (e) => this.handleKeyDown(e));
		}

		const overlay = this.element.querySelector('#modal-overlay');
		if (overlay) {
			overlay.removeEventListener('click', (e) => this.handleOverlayClick(e));
		}

		// 移除键盘事件监听
		document.removeEventListener('keydown', (e) => this.handleKeyDown(e));
	}

	destroy() {
		this.unbindEvents();
		super.destroy();
	}
}

// 导出组件
window.Modal = Modal;
