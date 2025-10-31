/**
 * 信息项组件
 * 用于显示标签和值的配对信息
 */
class InfoItem extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			label: props.label || '',
			value: props.value || '',
			className: props.className || 'info-item',
			labelClassName: props.labelClassName || '',
			valueClassName: props.valueClassName || ''
		};
	}

	/**
	 * 渲染信息项
	 */
	render() {
		const { label, value, className, labelClassName, valueClassName } = this.state;

		return this.createElement('div', {
			className: className
		}, [
			this.createElement('label', {
				className: labelClassName
			}, label),
			this.createElement('span', {
				className: valueClassName
			}, value)
		]);
	}

	/**
	 * 更新标签
	 * @param {string} label - 新标签
	 */
	setLabel(label) {
		this.setState({ label });
	}

	/**
	 * 更新值
	 * @param {string} value - 新值
	 */
	setValue(value) {
		this.setState({ value });
	}

	/**
	 * 更新标签和值
	 * @param {string} label - 新标签
	 * @param {string} value - 新值
	 */
	update(label, value) {
		this.setState({ label, value });
	}
}

// 导出信息项组件
window.InfoItem = InfoItem;
