/**
 * 按钮组件
 * 支持多种样式和状态
 */
class Button extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			text: props.text || '',
			textKey: props.textKey || '',
			type: props.type || 'button', // button, submit, reset
			variant: props.variant || 'primary', // primary, secondary, success, danger, warning, info
			size: props.size || 'md', // sm, md, lg
			icon: props.icon || '',
			disabled: props.disabled || false,
			loading: props.loading || false,
			className: props.className || '',
			onClick: props.onClick || null,
			onMouseEnter: props.onMouseEnter || null,
			onMouseLeave: props.onMouseLeave || null
		};
	}

	render() {
		const classes = this.buildClasses();
		const buttonText = this.renderButtonText();

		return `
            <button 
                type="${this.state.type}" 
                class="${classes}"
                ${this.state.disabled || this.state.loading ? 'disabled' : ''}
                ${this.state.textKey ? `data-i18n="${this.state.textKey}"` : ''}
            >
                ${this.state.loading ? this.renderLoadingSpinner() : ''}
                ${this.state.icon ? `<span class="btn-icon">${this.state.icon}</span>` : ''}
                ${buttonText}
            </button>
        `;
	}

	buildClasses() {
		const classes = ['btn'];

		// 添加变体样式
		if (this.state.variant !== 'primary') {
			classes.push(`btn-${this.state.variant}`);
		}

		// 添加尺寸样式
		if (this.state.size !== 'md') {
			classes.push(`btn-${this.state.size}`);
		}

		// 添加自定义类名
		if (this.state.className) {
			classes.push(this.state.className);
		}

		// 添加状态类名
		if (this.state.loading) {
			classes.push('loading');
		}

		return classes.join(' ');
	}

	renderButtonText() {
		if (this.state.textKey) {
			return this.state.text;
		}
		return this.state.text;
	}

	renderLoadingSpinner() {
		return '<span class="btn-spinner">⏳</span>';
	}

	bindEvents() {
		if (this.state.onClick) {
			this.element.addEventListener('click', (e) => {
				if (!this.state.disabled && !this.state.loading) {
					this.state.onClick(e);
				}
			});
		}

		if (this.state.onMouseEnter) {
			this.element.addEventListener('mouseenter', this.state.onMouseEnter);
		}

		if (this.state.onMouseLeave) {
			this.element.addEventListener('mouseleave', this.state.onMouseLeave);
		}
	}

	setLoading(loading) {
		this.setState({ loading });
		this.update();
	}

	setDisabled(disabled) {
		this.setState({ disabled });
		this.update();
	}

	setText(text) {
		this.setState({ text });
		this.update();
	}

	setIcon(icon) {
		this.setState({ icon });
		this.update();
	}
}
