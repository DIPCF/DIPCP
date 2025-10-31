/**
 * 成员项组件
 * 用于显示项目成员信息
 */
class MemberItem extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			login: props.login || '',
			avatarUrl: props.avatarUrl || '',
			contributions: props.contributions || 0,
			className: props.className || 'member-item',
			avatarClassName: props.avatarClassName || 'member-avatar',
			infoClassName: props.infoClassName || 'member-info',
			nameClassName: props.nameClassName || 'member-name',
			contributionsClassName: props.contributionsClassName || 'member-contributions'
		};
	}

	/**
	 * 渲染成员项
	 */
	render() {
		const {
			login,
			avatarUrl,
			contributions,
			className,
			avatarClassName,
			infoClassName,
			nameClassName,
			contributionsClassName
		} = this.state;

		return this.createElement('div', {
			className: className
		}, [
			this.createElement('img', {
				src: avatarUrl,
				alt: login,
				className: avatarClassName
			}),
			this.createElement('div', {
				className: infoClassName
			}, [
				this.createElement('div', {
					className: nameClassName
				}, login),
				this.createElement('div', {
					className: contributionsClassName
				}, I18nService.t('member.contributions', { count: contributions }))
			])
		]);
	}

	/**
	 * 更新成员信息
	 * @param {Object} memberData - 成员数据
	 */
	updateMember(memberData) {
		this.setState({
			login: memberData.login || this.state.login,
			avatarUrl: memberData.avatar_url || memberData.avatarUrl || this.state.avatarUrl,
			contributions: memberData.contributions || this.state.contributions
		});
	}

	/**
	 * 设置用户名
	 * @param {string} login - 用户名
	 */
	setLogin(login) {
		this.setState({ login });
	}

	/**
	 * 设置头像URL
	 * @param {string} avatarUrl - 头像URL
	 */
	setAvatarUrl(avatarUrl) {
		this.setState({ avatarUrl });
	}

	/**
	 * 设置贡献次数
	 * @param {number} contributions - 贡献次数
	 */
	setContributions(contributions) {
		this.setState({ contributions });
	}
}

// 导出成员项组件
window.MemberItem = MemberItem;
