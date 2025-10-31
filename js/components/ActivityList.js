/**
 * 活动列表组件
 * 用于显示项目活动列表
 */
class ActivityList extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			activities: props.activities || [],
			className: props.className || 'activity-list',
			itemClassName: props.itemClassName || 'activity-item',
			loading: props.loading || false,
			error: props.error || null,
			maxItems: props.maxItems || 10
		};

		this.activityItems = [];
	}

	/**
	 * 渲染活动列表
	 */
	render() {
		const { className, loading, error, activities } = this.state;

		if (loading) {
			return this.createElement('div', {
				className: 'loading'
			}, I18nService.t('common.loading'));
		}

		if (error) {
			return this.createElement('div', {
				className: 'error'
			}, error);
		}

		if (!activities || activities.length === 0) {
			return this.createElement('div', {
				className: 'empty'
			}, I18nService.t('activityList.noActivities'));
		}

		return this.createElement('div', {
			className: className
		}, this.renderActivityItems());
	}

	/**
	 * 渲染活动项列表
	 */
	renderActivityItems() {
		const { activities, itemClassName, maxItems } = this.state;
		const displayActivities = activities.slice(0, maxItems);

		// 清理之前的活动项
		this.activityItems = [];

		return displayActivities.map((activity, index) => {
			const activityItem = new ActivityItem({
				message: activity.commit.message,
				author: activity.commit.author.name,
				date: this.formatTimeAgo(activity.commit.author.date),
				className: itemClassName
			});

			this.activityItems.push(activityItem);
			return activityItem.render();
		});
	}

	/**
	 * 设置活动列表
	 * @param {Array} activities - 活动列表
	 */
	setActivities(activities) {
		this.setState({
			activities: activities || [],
			loading: false,
			error: null
		});
	}

	/**
	 * 设置加载状态
	 * @param {boolean} loading - 是否正在加载
	 */
	setLoading(loading) {
		this.setState({ loading });
	}

	/**
	 * 设置错误状态
	 * @param {string} error - 错误信息
	 */
	setError(error) {
		this.setState({
			error,
			loading: false,
			activities: []
		});
	}

	/**
	 * 添加新活动
	 * @param {Object} activity - 活动信息
	 */
	addActivity(activity) {
		const newActivities = [activity, ...this.state.activities];
		this.setState({ activities: newActivities });
	}

	/**
	 * 清空活动列表
	 */
	clearActivities() {
		this.setState({
			activities: [],
			error: null,
			loading: false
		});
	}

	/**
	 * 设置最大显示项数
	 * @param {number} maxItems - 最大显示项数
	 */
	setMaxItems(maxItems) {
		this.setState({ maxItems });
	}

	/**
	 * 格式化时间显示
	 * @param {string} dateString - 日期字符串
	 * @returns {string} 格式化后的时间
	 */
	formatTimeAgo(dateString) {
		const now = new Date();
		const date = new Date(dateString);
		const diffInSeconds = Math.floor((now - date) / 1000);

		if (diffInSeconds < 60) {
			return I18nService.t('time.justNow');
		} else if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return I18nService.t('time.minutesAgo', { minutes });
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return I18nService.t('time.hoursAgo', { hours });
		} else if (diffInSeconds < 2592000) {
			const days = Math.floor(diffInSeconds / 86400);
			return I18nService.t('time.daysAgo', { days });
		} else {
			// 根据当前语言设置日期格式
			const currentLanguage = I18nService.getCurrentLanguage();
			const locale = currentLanguage === 'zh-CN' ? 'zh-CN' : 'en-US';
			return date.toLocaleDateString(locale);
		}
	}

	/**
	 * 获取活动总数
	 * @returns {number} 活动总数
	 */
	getActivityCount() {
		return this.state.activities.length;
	}

	/**
	 * 组件挂载后调用
	 */
	componentDidMount() {
		// 如果有活动数据，重新渲染活动项
		if (this.state.activities.length > 0) {
			this.rerender();
		}
	}

	/**
	 * 组件更新后调用
	 */
	componentDidUpdate(prevState, currentState) {
		// 如果活动数据发生变化，重新渲染活动项
		if (prevState.activities !== currentState.activities) {
			this.rerender();
		}
	}
}

// 导出活动列表组件
window.ActivityList = ActivityList;
