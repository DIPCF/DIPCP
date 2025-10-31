/**
 * 工具栏组件
 * 用于页面顶部的操作工具栏
 */
class Toolbar extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			leftItems: props.leftItems || [],
			rightItems: props.rightItems || [],
			className: props.className || '',
			variant: props.variant || 'default' // default, editor, project
		};
	}

	render() {
		const classes = this.buildClasses();

		return `
            <div class="toolbar ${classes}">
                <div class="toolbar-left">
                    ${this.renderItems(this.state.leftItems)}
                </div>
                <div class="toolbar-right">
                    ${this.renderItems(this.state.rightItems)}
                </div>
            </div>
        `;
	}

	buildClasses() {
		const classes = ['toolbar'];

		if (this.state.variant !== 'default') {
			classes.push(`toolbar-${this.state.variant}`);
		}

		if (this.state.className) {
			classes.push(this.state.className);
		}

		return classes.join(' ');
	}

	renderItems(items) {
		return items.map(item => {
			if (typeof item === 'string') {
				return item;
			}

			if (item && typeof item.render === 'function') {
				return item.render();
			}

			// 如果是简单的按钮配置对象
			if (item && typeof item === 'object') {
				return this.renderButton(item);
			}

			return '';
		}).join('');
	}

	renderButton(config) {
		const {
			text = '',
			textKey = '',
			icon = '',
			variant = 'primary',
			size = 'sm',
			disabled = false,
			loading = false,
			onClick = null,
			className = ''
		} = config;

		const classes = ['btn', `btn-${variant}`, `btn-${size}`, className].filter(Boolean).join(' ');

		return `
            <button 
                class="${classes}"
                ${disabled || loading ? 'disabled' : ''}
                ${textKey ? `data-i18n="${textKey}"` : ''}
                ${onClick ? 'data-action="click"' : ''}
            >
                ${loading ? '<span class="btn-spinner">⏳</span>' : ''}
                ${icon ? `<span class="btn-icon">${icon}</span>` : ''}
                ${textKey ? '' : text}
            </button>
        `;
	}

	bindEvents() {
		// 绑定按钮点击事件
		const buttons = this.element.querySelectorAll('[data-action="click"]');
		buttons.forEach(button => {
			const config = this.findButtonConfig(button);
			if (config && config.onClick) {
				button.addEventListener('click', config.onClick);
			}
		});
	}

	findButtonConfig(button) {
		// 查找对应的按钮配置
		const allItems = [...this.state.leftItems, ...this.state.rightItems];
		return allItems.find(item =>
			item && typeof item === 'object' && item.onClick
		);
	}

	addLeftItem(item) {
		const leftItems = [...this.state.leftItems, item];
		this.setState({ leftItems });
		this.update();
	}

	addRightItem(item) {
		const rightItems = [...this.state.rightItems, item];
		this.setState({ rightItems });
		this.update();
	}

	removeLeftItem(index) {
		const leftItems = this.state.leftItems.filter((_, i) => i !== index);
		this.setState({ leftItems });
		this.update();
	}

	removeRightItem(index) {
		const rightItems = this.state.rightItems.filter((_, i) => i !== index);
		this.setState({ rightItems });
		this.update();
	}

	updateButtonState(index, side, updates) {
		const items = side === 'left' ? this.state.leftItems : this.state.rightItems;
		const newItems = [...items];

		if (newItems[index] && typeof newItems[index] === 'object') {
			newItems[index] = { ...newItems[index], ...updates };

			if (side === 'left') {
				this.setState({ leftItems: newItems });
			} else {
				this.setState({ rightItems: newItems });
			}
			this.update();
		}
	}
}
