/**
 * 状态栏组件
 * 用于显示编辑器的状态信息
 */
class StatusBar extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			currentLine: props.currentLine || 1,
			totalLines: props.totalLines || 1,
			fileSize: props.fileSize || '0 B',
			status: props.status || 'saved',
			className: props.className || 'status-bar'
		};
	}

	/**
	 * 渲染状态栏
	 */
	render() {
		const { currentLine, totalLines, fileSize, status, className } = this.state;

		return this.createElement('div', {
			className: className
		}, [
			this.createElement('span', {}, I18nService.t('statusBar.line', { current: currentLine, total: totalLines })),
			this.createElement('span', {}, I18nService.t('statusBar.size', { size: fileSize })),
			this.createElement('span', {}, I18nService.t('statusBar.status', { status: status }))
		]);
	}

	/**
	 * 更新状态信息
	 * @param {Object} statusInfo - 状态信息对象
	 */
	updateStatus(statusInfo) {
		this.setState({
			currentLine: statusInfo.currentLine || this.state.currentLine,
			totalLines: statusInfo.totalLines || this.state.totalLines,
			fileSize: statusInfo.fileSize || this.state.fileSize,
			status: statusInfo.status || this.state.status
		});
	}

	/**
	 * 设置当前行号
	 * @param {number} currentLine - 当前行号
	 */
	setCurrentLine(currentLine) {
		this.setState({ currentLine });
	}

	/**
	 * 设置总行数
	 * @param {number} totalLines - 总行数
	 */
	setTotalLines(totalLines) {
		this.setState({ totalLines });
	}

	/**
	 * 设置文件大小
	 * @param {string} fileSize - 文件大小
	 */
	setFileSize(fileSize) {
		this.setState({ fileSize });
	}

	/**
	 * 设置状态
	 * @param {string} status - 状态 (saved, modified, error, etc.)
	 */
	setStatus(status) {
		this.setState({ status });
	}

	/**
	 * 设置为已保存状态
	 */
	setSaved() {
		this.setStatus(I18nService.t('collaboration.saved'));
	}

	/**
	 * 设置为已修改状态
	 */
	setModified() {
		this.setStatus(I18nService.t('collaboration.modified'));
	}
}

// 导出状态栏组件
window.StatusBar = StatusBar;
