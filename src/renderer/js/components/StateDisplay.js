/**
 * 状态显示组件
 * 用于显示各种状态（加载、错误、空状态、成功等）
 */
class StateDisplay extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			type: props.type || 'loading', // loading, error, empty, success, info
			message: props.message || '',
			className: props.className || '',
			showIcon: props.showIcon !== false,
			onRetry: props.onRetry || null,
			onAction: props.onAction || null,
			actionText: props.actionText || I18nService.t('common.retry')
		};
	}

	/**
	 * 渲染状态显示
	 */
	render() {
		const { type, message, className, showIcon, onRetry, onAction, actionText } = this.state;
		const stateClassName = `${type}-state ${className}`.trim();

		const elements = [];

		if (showIcon) {
			elements.push(this.createElement('div', {
				className: `${type}-icon`
			}, this.getIcon(type)));
		}

		elements.push(this.createElement('span', {
			className: `${type}-text`
		}, message));

		if (onRetry || onAction) {
			elements.push(this.createElement('button', {
				className: `${type}-button`,
				onclick: this.handleAction.bind(this)
			}, actionText));
		}

		return this.createElement('div', {
			className: stateClassName
		}, elements);
	}

	/**
	 * 获取状态图标
	 * @param {string} type - 状态类型
	 * @returns {string} 图标
	 */
	getIcon(type) {
		const icons = {
			loading: '⏳',
			error: '⚠️',
			empty: '📭',
			success: '✅',
			info: 'ℹ️'
		};
		return icons[type] || '❓';
	}

	/**
	 * 处理操作点击
	 * @param {Event} event - 点击事件
	 */
	handleAction(event) {
		event.preventDefault();
		if (this.state.onRetry) {
			this.state.onRetry();
		} else if (this.state.onAction) {
			this.state.onAction();
		}
	}

	/**
	 * 设置状态
	 * @param {string} type - 状态类型
	 * @param {string} message - 状态消息
	 */
	setState(type, message) {
		this.setState({ type, message });
	}

	/**
	 * 设置为加载状态
	 * @param {string} message - 加载消息
	 */
	setLoading(message = I18nService.t('common.loading')) {
		this.setState({ type: 'loading', message });
	}

	/**
	 * 设置为错误状态
	 * @param {string} message - 错误消息
	 * @param {Function} onRetry - 重试回调
	 */
	setError(message = I18nService.t('common.error'), onRetry = null) {
		this.setState({ type: 'error', message, onRetry });
	}

	/**
	 * 设置为空状态
	 * @param {string} message - 空状态消息
	 * @param {Function} onAction - 操作回调
	 * @param {string} actionText - 操作按钮文本
	 */
	setEmpty(message = I18nService.t('common.noData'), onAction = null, actionText = I18nService.t('common.refresh')) {
		this.setState({ type: 'empty', message, onAction, actionText });
	}

	/**
	 * 设置为成功状态
	 * @param {string} message - 成功消息
	 */
	setSuccess(message = I18nService.t('common.success')) {
		this.setState({ type: 'success', message });
	}

	/**
	 * 设置为信息状态
	 * @param {string} message - 信息消息
	 */
	setInfo(message = I18nService.t('common.info')) {
		this.setState({ type: 'info', message });
	}

	/**
	 * 更新消息
	 * @param {string} message - 新消息
	 */
	setMessage(message) {
		this.setState({ message });
	}

	/**
	 * 设置操作回调
	 * @param {Function} onAction - 操作回调函数
	 * @param {string} actionText - 操作按钮文本
	 */
	setOnAction(onAction, actionText = I18nService.t('common.action')) {
		this.setState({ onAction, actionText });
	}
}

// 导出状态显示组件
window.StateDisplay = StateDisplay;
