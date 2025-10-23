/**
 * 协作信息组件
 * 显示文件协作相关的状态信息
 */
class CollaborationInfo extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			isModified: props.isModified || false,
			hasUncommittedChanges: props.hasUncommittedChanges || true,
			className: props.className || 'collaboration-info'
		};

		// 创建子组件
		this.statusIndicator = new StatusIndicator({
			status: this.state.isModified ? 'modified' : 'saved',
			text: this.state.isModified ? I18nService.t('collaboration.modified') : I18nService.t('collaboration.saved')
		});
	}

	/**
	 * 渲染协作信息组件
	 */
	render() {
		const { className, hasUncommittedChanges } = this.state;

		return this.createElement('div', {
			className: className
		}, [
			this.renderStatusItem(),
			this.renderWorkspaceItem(hasUncommittedChanges)
		]);
	}

	/**
	 * 渲染状态项
	 */
	renderStatusItem() {
		const statusItem = new InfoItem({
			label: I18nService.t('collaboration.currentStatus'),
			className: 'collaboration-item'
		});

		// 将状态指示器作为值
		const statusSpan = this.createElement('span', {}, this.statusIndicator.render());
		statusItem.element = this.createElement('div', {
			className: 'collaboration-item'
		}, [
			this.createElement('label', {}, I18nService.t('collaboration.currentStatus')),
			statusSpan
		]);

		return statusItem.element;
	}

	/**
	 * 渲染工作区项
	 * @param {boolean} hasUncommittedChanges - 是否有未提交的修改
	 */
	renderWorkspaceItem(hasUncommittedChanges) {
		const workspaceText = hasUncommittedChanges ? I18nService.t('collaboration.hasUncommittedChanges') : I18nService.t('collaboration.workspaceClean');

		const workspaceItem = new InfoItem({
			label: I18nService.t('collaboration.localWorkspace'),
			value: workspaceText,
			className: 'collaboration-item'
		});

		return workspaceItem.render();
	}

	/**
	 * 更新修改状态
	 * @param {boolean} isModified - 是否已修改
	 */
	setModified(isModified) {
		this.setState({ isModified });
		this.statusIndicator.updateStatus(
			isModified ? 'modified' : 'saved',
			isModified ? I18nService.t('collaboration.modified') : I18nService.t('collaboration.saved')
		);
	}

	/**
	 * 更新未提交修改状态
	 * @param {boolean} hasUncommittedChanges - 是否有未提交的修改
	 */
	setUncommittedChanges(hasUncommittedChanges) {
		this.setState({ hasUncommittedChanges });
	}

	/**
	 * 更新所有状态
	 * @param {Object} state - 状态对象
	 */
	updateState(state) {
		this.setState(state);
		if (state.hasOwnProperty('isModified')) {
			this.statusIndicator.updateStatus(
				state.isModified ? 'modified' : 'saved',
				state.isModified ? I18nService.t('collaboration.modified') : I18nService.t('collaboration.saved')
			);
		}
	}

	/**
	 * 组件挂载后调用
	 */
	componentDidMount() {
		// 挂载子组件
		if (this.element) {
			const statusItem = this.element.querySelector('.collaboration-item:first-child');
			if (statusItem) {
				const statusSpan = statusItem.querySelector('span');
				if (statusSpan) {
					statusSpan.replaceWith(this.statusIndicator.render());
				}
			}
		}
	}
}

// 导出协作信息组件
window.CollaborationInfo = CollaborationInfo;
