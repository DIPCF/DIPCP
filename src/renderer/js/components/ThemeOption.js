/**
 * 主题选择项组件
 * 用于设置页面的主题选择
 */
class ThemeOption extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			theme: props.theme || 'light',
			name: props.name || '',
			nameKey: props.nameKey || '',
			description: props.description || '',
			descriptionKey: props.descriptionKey || '',
			selected: props.selected || false,
			className: props.className || '',
			onClick: props.onClick || null
		};
	}

	render() {
		const classes = this.buildClasses();

		return `
            <button 
                class="${classes}" 
                data-theme="${this.state.theme}"
                ${this.state.nameKey ? `data-i18n="${this.state.nameKey}"` : ''}
            >
                <div class="theme-preview ${this.state.theme}-preview"></div>
                <div class="theme-info">
                    <span class="theme-name" ${this.state.nameKey ? '' : ''}>
                        ${this.state.nameKey ? '' : this.state.name}
                    </span>
                    <span class="theme-desc" ${this.state.descriptionKey ? `data-i18n="${this.state.descriptionKey}"` : ''}>
                        ${this.state.descriptionKey ? '' : this.state.description}
                    </span>
                </div>
            </button>
        `;
	}

	buildClasses() {
		const classes = ['theme-option'];

		if (this.state.selected) {
			classes.push('selected');
		}

		if (this.state.className) {
			classes.push(this.state.className);
		}

		return classes.join(' ');
	}

	bindEvents() {
		if (this.state.onClick) {
			this.element.addEventListener('click', () => {
				this.state.onClick(this.state.theme);
			});
		}
	}

	setSelected(selected) {
		this.setState({ selected });
		this.update();
	}

	setTheme(theme) {
		this.setState({ theme });
		this.update();
	}
}
