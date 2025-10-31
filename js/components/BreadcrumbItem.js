/**
 * 面包屑项组件
 * 用于显示面包屑导航中的单个路径项
 */
class BreadcrumbItem extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			text: props.text || '',
			path: props.path || '',
			icon: props.icon || '📁',
			clickable: props.clickable !== false,
			className: props.className || 'breadcrumb-item',
			onClick: props.onClick || null
		};
	}

	/**
	 * 渲染面包屑项
	 */
	render() {
		const { text, path, icon, clickable, className } = this.state;
		const clickableClass = clickable ? 'clickable' : '';
		const fullClassName = `${className} ${clickableClass}`.trim();

		const element = this.createElement('span', {
			className: fullClassName,
			'data-path': path
		}, `${icon} ${text}`);

		// 添加点击事件
		if (clickable && this.state.onClick) {
			this.addEventListener('click', this.handleClick.bind(this), element);
		}

		return element;
	}

	/**
	 * 处理点击事件
	 * @param {Event} event - 点击事件
	 */
	handleClick(event) {
		event.preventDefault();
		if (this.state.onClick) {
			this.state.onClick(this.state.path, this.state.text);
		}
	}

	/**
	 * 更新面包屑项
	 * @param {Object} itemData - 面包屑项数据
	 */
	updateItem(itemData) {
		this.setState({
			text: itemData.text || this.state.text,
			path: itemData.path || this.state.path,
			icon: itemData.icon || this.state.icon,
			clickable: itemData.hasOwnProperty('clickable') ? itemData.clickable : this.state.clickable
		});
	}

	/**
	 * 设置文本
	 * @param {string} text - 文本内容
	 */
	setText(text) {
		this.setState({ text });
	}

	/**
	 * 设置路径
	 * @param {string} path - 路径
	 */
	setPath(path) {
		this.setState({ path });
	}

	/**
	 * 设置图标
	 * @param {string} icon - 图标
	 */
	setIcon(icon) {
		this.setState({ icon });
	}

	/**
	 * 设置是否可点击
	 * @param {boolean} clickable - 是否可点击
	 */
	setClickable(clickable) {
		this.setState({ clickable });
	}

	/**
	 * 设置点击回调
	 * @param {Function} onClick - 点击回调函数
	 */
	setOnClick(onClick) {
		this.setState({ onClick });
	}
}

// 导出面包屑项组件
window.BreadcrumbItem = BreadcrumbItem;
