/**
 * 历史项组件
 * 用于显示单个提交历史记录
 */
class HistoryItem extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			message: props.message || '',
			author: props.author || '',
			date: props.date || '',
			className: props.className || 'history-item',
			messageClassName: props.messageClassName || 'history-message',
			metaClassName: props.metaClassName || 'history-meta',
			authorClassName: props.authorClassName || 'history-author',
			dateClassName: props.dateClassName || 'history-date'
		};
	}

	/**
	 * 渲染历史项
	 */
	render() {
		const {
			message,
			author,
			date,
			className,
			messageClassName,
			metaClassName,
			authorClassName,
			dateClassName
		} = this.state;

		return this.createElement('div', {
			className: className
		}, [
			this.createElement('div', {
				className: messageClassName
			}, message),
			this.createElement('div', {
				className: metaClassName
			}, [
				this.createElement('span', {
					className: authorClassName
				}, author),
				this.createElement('span', {
					className: dateClassName
				}, date)
			])
		]);
	}

	/**
	 * 更新提交信息
	 * @param {Object} commitData - 提交数据
	 */
	updateCommit(commitData) {
		this.setState({
			message: commitData.message || '',
			author: commitData.author || '',
			date: commitData.date || ''
		});
	}

	/**
	 * 设置提交消息
	 * @param {string} message - 提交消息
	 */
	setMessage(message) {
		this.setState({ message });
	}

	/**
	 * 设置作者信息
	 * @param {string} author - 作者名称
	 */
	setAuthor(author) {
		this.setState({ author });
	}

	/**
	 * 设置日期
	 * @param {string} date - 日期字符串
	 */
	setDate(date) {
		this.setState({ date });
	}
}

// 导出历史项组件
window.HistoryItem = HistoryItem;
