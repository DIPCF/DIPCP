/**
 * 编辑历史列表组件
 * 用于显示文件的编辑历史记录列表
 */
class EditHistoryList extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			commits: props.commits || [],
			className: props.className || 'edit-history-list',
			itemClassName: props.itemClassName || 'history-item',
			loading: props.loading || false,
			error: props.error || null
		};

		this.historyItems = [];
	}

	/**
	 * 渲染编辑历史列表
	 */
	render() {
		const { className, loading, error, commits } = this.state;

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

		if (!commits || commits.length === 0) {
			return this.createElement('div', {
				className: 'empty'
			}, I18nService.t('editHistory.noHistory'));
		}

		return this.createElement('div', {
			className: className
		}, this.renderHistoryItems());
	}

	/**
	 * 渲染历史项列表
	 */
	renderHistoryItems() {
		const { commits, itemClassName } = this.state;

		// 清理之前的历史项
		this.historyItems = [];

		return commits.map((commit, index) => {
			const historyItem = new HistoryItem({
				message: commit.commit.message,
				author: commit.commit.author.name,
				date: this.formatTimeAgo(commit.commit.author.date),
				className: itemClassName
			});

			this.historyItems.push(historyItem);
			return historyItem.render();
		});
	}

	/**
	 * 设置提交历史数据
	 * @param {Array} commits - 提交历史数组
	 */
	setCommits(commits) {
		this.setState({
			commits: commits || [],
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
			commits: []
		});
	}

	/**
	 * 添加新的提交记录
	 * @param {Object} commit - 提交记录
	 */
	addCommit(commit) {
		const newCommits = [commit, ...this.state.commits];
		this.setState({ commits: newCommits });
	}

	/**
	 * 清空历史记录
	 */
	clearHistory() {
		this.setState({
			commits: [],
			error: null,
			loading: false
		});
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
	 * 组件挂载后调用
	 */
	componentDidMount() {
		// 如果有提交数据，重新渲染历史项
		if (this.state.commits.length > 0) {
			this.rerender();
		}
	}

	/**
	 * 组件更新后调用
	 */
	componentDidUpdate(prevState, currentState) {
		// 如果提交数据发生变化，重新渲染历史项
		if (prevState.commits !== currentState.commits) {
			this.rerender();
		}
	}
}

// 导出编辑历史列表组件
window.EditHistoryList = EditHistoryList;
