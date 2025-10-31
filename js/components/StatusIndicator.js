/**
 * 状态指示器组件
 * 用于显示各种状态信息，如保存状态、修改状态等
 */
class StatusIndicator extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			status: props.status || 'saved',
			text: props.text || I18nService.t('collaboration.saved'),
			className: props.className || ''
		};
	}

	/**
	 * 渲染状态指示器
	 */
	render() {
		const { status, text, className } = this.state;
		const statusClass = `status ${status} ${className}`.trim();

		return this.createElement('span', {
			className: statusClass
		}, text);
	}

	/**
	 * 更新状态
	 * @param {string} status - 状态类型 (saved, modified, error, warning)
	 * @param {string} text - 状态文本
	 */
	updateStatus(status, text) {
		this.setState({
			status,
			text
		});
	}

	/**
	 * 设置为已保存状态
	 */
	setSaved() {
		this.updateStatus('saved', I18nService.t('collaboration.saved'));
	}

	/**
	 * 设置为已修改状态
	 */
	setModified() {
		this.updateStatus('modified', I18nService.t('collaboration.modified'));
	}

	/**
	 * 设置为错误状态
	 * @param {string} message - 错误信息
	 */
	setError(message = I18nService.t('common.error')) {
		this.updateStatus('error', message);
	}

	/**
	 * 设置为警告状态
	 * @param {string} message - 警告信息
	 */
	setWarning(message = I18nService.t('common.warning')) {
		this.updateStatus('warning', message);
	}
}

// 导出状态指示器组件
window.StatusIndicator = StatusIndicator;
