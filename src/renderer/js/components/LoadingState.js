/**
 * 加载状态组件
 * 用于显示加载中的状态
 */
class LoadingState extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			message: props.message || I18nService.t('common.loading'),
			className: props.className || 'loading',
			showSpinner: props.showSpinner !== false,
			spinnerClassName: props.spinnerClassName || 'spinner'
		};
	}

	/**
	 * 渲染加载状态
	 */
	render() {
		const { message, className, showSpinner, spinnerClassName } = this.state;

		const elements = [];

		if (showSpinner) {
			elements.push(this.createElement('div', {
				className: spinnerClassName
			}));
		}

		elements.push(this.createElement('span', {
			className: 'loading-text'
		}, message));

		return this.createElement('div', {
			className: className
		}, elements);
	}

	/**
	 * 更新加载消息
	 * @param {string} message - 新的加载消息
	 */
	setMessage(message) {
		this.setState({ message });
	}

	/**
	 * 设置是否显示旋转器
	 * @param {boolean} showSpinner - 是否显示旋转器
	 */
	setShowSpinner(showSpinner) {
		this.setState({ showSpinner });
	}
}

// 导出加载状态组件
window.LoadingState = LoadingState;
