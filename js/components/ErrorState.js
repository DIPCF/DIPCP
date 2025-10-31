/**
 * 错误状态组件
 * 用于显示错误信息
 */
class ErrorState extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			message: props.message || I18nService.t('common.error'),
			className: props.className || 'error',
			showIcon: props.showIcon !== false,
			iconClassName: props.iconClassName || 'error-icon',
			onRetry: props.onRetry || null
		};
	}

	/**
	 * 渲染错误状态
	 */
	render() {
		const { message, className, showIcon, iconClassName, onRetry } = this.state;

		const elements = [];

		if (showIcon) {
			elements.push(this.createElement('div', {
				className: iconClassName
			}, '⚠️'));
		}

		elements.push(this.createElement('span', {
			className: 'error-text'
		}, message));

		if (onRetry) {
			elements.push(this.createElement('button', {
				className: 'retry-button',
				onclick: this.handleRetry.bind(this)
			}, I18nService.t('common.retry')));
		}

		return this.createElement('div', {
			className: className
		}, elements);
	}

	/**
	 * 处理重试点击
	 * @param {Event} event - 点击事件
	 */
	handleRetry(event) {
		event.preventDefault();
		if (this.state.onRetry) {
			this.state.onRetry();
		}
	}

	/**
	 * 更新错误消息
	 * @param {string} message - 新的错误消息
	 */
	setMessage(message) {
		this.setState({ message });
	}

	/**
	 * 设置重试回调
	 * @param {Function} onRetry - 重试回调函数
	 */
	setOnRetry(onRetry) {
		this.setState({ onRetry });
	}

	/**
	 * 设置是否显示图标
	 * @param {boolean} showIcon - 是否显示图标
	 */
	setShowIcon(showIcon) {
		this.setState({ showIcon });
	}
}

// 导出错误状态组件
window.ErrorState = ErrorState;
