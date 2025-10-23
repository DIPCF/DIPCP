/**
 * 面包屑导航组件
 * 用于显示文件路径的面包屑导航
 */
class Breadcrumb extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			repoName: props.repoName || '',
			filePath: props.filePath || '',
			className: props.className || 'breadcrumb',
			itemClassName: props.itemClassName || 'breadcrumb-item',
			separator: props.separator || ' > ',
			onItemClick: props.onItemClick || null
		};

		this.breadcrumbItems = [];
	}

	/**
	 * 渲染面包屑导航
	 */
	render() {
		const { repoName, filePath } = this.state;

		// 直接返回面包屑项，不创建容器div
		return this.renderBreadcrumbItems();
	}

	/**
	 * 重写mount方法，处理数组元素
	 * @param {HTMLElement} container - 挂载容器
	 */
	mount(container) {
		const elements = this.render();
		if (container && Array.isArray(elements)) {
			// 清空容器
			container.innerHTML = '';
			// 添加所有元素
			elements.forEach(element => {
				if (element && element.nodeType) {
					container.appendChild(element);
				}
			});
		} else if (container && elements && elements.nodeType) {
			// 单个元素的情况
			container.innerHTML = '';
			container.appendChild(elements);
		}
	}

	/**
	 * 渲染面包屑项列表
	 */
	renderBreadcrumbItems() {
		const { repoName, filePath, itemClassName, separator, onItemClick } = this.state;
		const pathParts = filePath.split('/').filter(part => part);

		// 清理之前的面包屑项
		this.breadcrumbItems = [];

		// 创建仓库根目录项
		const repoItem = new BreadcrumbItem({
			text: repoName,
			path: '',
			icon: '📁',
			clickable: true,
			className: itemClassName,
			onClick: onItemClick
		});
		this.breadcrumbItems.push(repoItem);

		const elements = [repoItem.render()];

		// 创建路径项
		let currentPath = '';
		pathParts.forEach((part, index) => {
			currentPath += (currentPath ? '/' : '') + part;
			const isLast = index === pathParts.length - 1;
			const icon = isLast ? '📄' : '📁';
			const clickable = !isLast;

			// 添加分隔符
			elements.push(this.createElement('span', {
				className: 'breadcrumb-separator'
			}, separator));

			// 创建路径项
			const pathItem = new BreadcrumbItem({
				text: part,
				path: currentPath,
				icon: icon,
				clickable: clickable,
				className: itemClassName,
				onClick: onItemClick
			});
			this.breadcrumbItems.push(pathItem);
			elements.push(pathItem.render());
		});

		return elements;
	}

	/**
	 * 更新面包屑导航
	 * @param {Object} breadcrumbData - 面包屑数据
	 */
	updateBreadcrumb(breadcrumbData) {
		this.setState({
			repoName: breadcrumbData.repoName || this.state.repoName,
			filePath: breadcrumbData.filePath || this.state.filePath,
			onItemClick: breadcrumbData.onItemClick || this.state.onItemClick
		});
	}

	/**
	 * 设置仓库名称
	 * @param {string} repoName - 仓库名称
	 */
	setRepoName(repoName) {
		this.setState({ repoName });
	}

	/**
	 * 设置文件路径
	 * @param {string} filePath - 文件路径
	 */
	setFilePath(filePath) {
		this.setState({ filePath });
	}

	/**
	 * 设置点击回调
	 * @param {Function} onItemClick - 项点击回调函数
	 */
	setOnItemClick(onItemClick) {
		this.setState({ onItemClick });
	}

	/**
	 * 获取当前路径
	 * @returns {string} 当前文件路径
	 */
	getCurrentPath() {
		return this.state.filePath;
	}

	/**
	 * 获取路径部分
	 * @returns {Array<string>} 路径部分数组
	 */
	getPathParts() {
		return this.state.filePath.split('/').filter(part => part);
	}

	/**
	 * 组件挂载后调用
	 */
	componentDidMount() {
		// 如果有路径数据，重新渲染面包屑项
		if (this.state.filePath) {
			this.rerender();
		}
	}

	/**
	 * 组件更新后调用
	 */
	componentDidUpdate(prevState, currentState) {
		// 如果路径数据发生变化，重新渲染面包屑项
		if (prevState.filePath !== currentState.filePath ||
			prevState.repoName !== currentState.repoName) {
			this.rerender();
		}
	}
}

// 导出面包屑组件
window.Breadcrumb = Breadcrumb;
