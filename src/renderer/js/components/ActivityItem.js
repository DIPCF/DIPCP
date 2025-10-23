/**
 * 活动项组件
 * 用于显示单个活动记录
 */
class ActivityItem extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			message: props.message || '',
			author: props.author || '',
			date: props.date || '',
			className: props.className || 'activity-item',
			messageClassName: props.messageClassName || 'activity-message',
			metaClassName: props.metaClassName || 'activity-meta',
			authorClassName: props.authorClassName || 'activity-author',
			dateClassName: props.dateClassName || 'activity-date'
		};
	}

	/**
	 * 渲染活动项
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
	 * 更新活动信息
	 * @param {Object} activityData - 活动数据
	 */
	updateActivity(activityData) {
		this.setState({
			message: activityData.message || this.state.message,
			author: activityData.author || this.state.author,
			date: activityData.date || this.state.date
		});
	}

	/**
	 * 设置消息
	 * @param {string} message - 活动消息
	 */
	setMessage(message) {
		this.setState({ message });
	}

	/**
	 * 设置作者
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

// 导出活动项组件
window.ActivityItem = ActivityItem;
