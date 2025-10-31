/**
 * 文件项组件
 * 用于显示文件或目录项
 */
class FileItem extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			name: props.name || '',
			path: props.path || props.name || '', // 添加path属性，默认为name
			type: props.type || 'file', // 'file' or 'dir'
			isLocal: props.isLocal || false,
			className: props.className || 'file-item',
			iconClassName: props.iconClassName || 'file-icon',
			nameClassName: props.nameClassName || 'file-name',
			onClick: props.onClick || null
		};
	}

	/**
	 * 渲染文件项
	 */
	render() {
		const { name, type, isLocal, className, iconClassName, nameClassName } = this.state;
		const icon = type === 'dir' ? '📁' : '📄';
		const statusIcon = isLocal ? ' 🆕' : '';

		const element = this.createElement('div', {
			className: className
		}, [
			this.createElement('span', {
				className: iconClassName
			}, icon),
			this.createElement('span', {
				className: nameClassName
			}, name),
			statusIcon ? this.createElement('span', {
				className: 'status-icon'
			}, statusIcon) : null
		].filter(Boolean));

		// 添加点击事件
		if (this.state.onClick) {
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
			this.state.onClick(this.state.path, this.state.type);
		}
	}

	/**
	 * 更新文件项
	 * @param {Object} fileData - 文件数据
	 */
	updateFile(fileData) {
		this.setState({
			name: fileData.name || this.state.name,
			type: fileData.type || this.state.type,
			isLocal: fileData.isLocal !== undefined ? fileData.isLocal : this.state.isLocal
		});
	}

	/**
	 * 设置文件名
	 * @param {string} name - 文件名
	 */
	setName(name) {
		this.setState({ name });
	}

	/**
	 * 设置文件类型
	 * @param {string} type - 文件类型 ('file' or 'dir')
	 */
	setType(type) {
		this.setState({ type });
	}

	/**
	 * 设置本地状态
	 * @param {boolean} isLocal - 是否为本地文件
	 */
	setIsLocal(isLocal) {
		this.setState({ isLocal });
	}

	/**
	 * 设置点击回调
	 * @param {Function} onClick - 点击回调函数
	 */
	setOnClick(onClick) {
		this.setState({ onClick });
	}
}

// 导出文件项组件
window.FileItem = FileItem;
