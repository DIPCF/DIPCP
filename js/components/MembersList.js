/**
 * 成员列表组件
 * 用于显示项目成员列表
 */
class MembersList extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			members: props.members || [],
			className: props.className || 'members-list',
			itemClassName: props.itemClassName || 'member-item',
			loading: props.loading || false,
			error: props.error || null
		};

		this.memberItems = [];
	}

	/**
	 * 渲染成员列表
	 */
	render() {
		const { className, loading, error, members } = this.state;

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

		if (!members || members.length === 0) {
			return this.createElement('div', {
				className: 'empty'
			}, I18nService.t('members.noMembers'));
		}

		return this.createElement('div', {
			className: className
		}, this.renderMemberItems());
	}

	/**
	 * 渲染成员项列表
	 */
	renderMemberItems() {
		const { members, itemClassName } = this.state;

		// 清理之前的成员项
		this.memberItems = [];

		return members.map((member, index) => {
			const memberItem = new MemberItem({
				login: member.login,
				avatarUrl: member.avatar_url,
				contributions: member.contributions,
				className: itemClassName
			});

			this.memberItems.push(memberItem);
			return memberItem.render();
		});
	}

	/**
	 * 设置成员列表
	 * @param {Array} members - 成员列表
	 */
	setMembers(members) {
		this.setState({
			members: members || [],
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
			members: []
		});
	}

	/**
	 * 添加新成员
	 * @param {Object} member - 成员信息
	 */
	addMember(member) {
		const newMembers = [...this.state.members, member];
		this.setState({ members: newMembers });
	}

	/**
	 * 移除成员
	 * @param {string} login - 用户名
	 */
	removeMember(login) {
		const newMembers = this.state.members.filter(member => member.login !== login);
		this.setState({ members: newMembers });
	}

	/**
	 * 清空成员列表
	 */
	clearMembers() {
		this.setState({
			members: [],
			error: null,
			loading: false
		});
	}

	/**
	 * 获取成员总数
	 * @returns {number} 成员总数
	 */
	getMemberCount() {
		return this.state.members.length;
	}

	/**
	 * 获取总贡献数
	 * @returns {number} 总贡献数
	 */
	getTotalContributions() {
		return this.state.members.reduce((total, member) => total + (member.contributions || 0), 0);
	}

	/**
	 * 组件挂载后调用
	 */
	componentDidMount() {
		// 如果有成员数据，重新渲染成员项
		if (this.state.members.length > 0) {
			this.rerender();
		}
	}

	/**
	 * 组件更新后调用
	 */
	componentDidUpdate(prevState, currentState) {
		// 如果成员数据发生变化，重新渲染成员项
		if (prevState.members !== currentState.members) {
			this.rerender();
		}
	}
}

// 导出成员列表组件
window.MembersList = MembersList;
