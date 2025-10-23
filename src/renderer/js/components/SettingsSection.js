/**
 * 设置区块组件
 * 用于设置页面的各个设置区域
 */
class SettingsSection extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			title: props.title || '',
			titleKey: props.titleKey || '',
			children: props.children || [],
			className: props.className || '',
			collapsible: props.collapsible || false,
			collapsed: props.collapsed || false,
			onToggle: props.onToggle || null
		};
	}

	render() {
		return `
            <div class="settings-section ${this.state.className}">
                ${this.renderHeader()}
                <div class="settings-content ${this.state.collapsed ? 'collapsed' : ''}">
                    ${this.renderChildren()}
                </div>
            </div>
        `;
	}

	renderHeader() {
		const titleText = this.state.titleKey ?
			`data-i18n="${this.state.titleKey}"` :
			this.state.title;

		const toggleIcon = this.state.collapsible ?
			(this.state.collapsed ? '▶' : '▼') : '';

		return `
            <div class="settings-section-header">
                <h2 ${this.state.titleKey ? '' : ''}>
                    ${titleText}
                </h2>
                ${this.state.collapsible ? `
                    <button class="toggle-btn" type="button">
                        ${toggleIcon}
                    </button>
                ` : ''}
            </div>
        `;
	}

	renderChildren() {
		if (Array.isArray(this.state.children)) {
			return this.state.children.map(child => {
				if (typeof child === 'string') {
					return child;
				}
				if (child && typeof child.render === 'function') {
					return child.render();
				}
				return '';
			}).join('');
		}
		return this.state.children || '';
	}

	bindEvents() {
		if (this.state.collapsible) {
			const toggleBtn = this.element.querySelector('.toggle-btn');
			if (toggleBtn) {
				toggleBtn.addEventListener('click', () => {
					this.toggle();
				});
			}
		}
	}

	toggle() {
		const collapsed = !this.state.collapsed;
		this.setState({ collapsed });
		this.update();

		if (this.state.onToggle) {
			this.state.onToggle(collapsed);
		}
	}

	addChild(child) {
		const children = [...this.state.children, child];
		this.setState({ children });
		this.update();
	}

	removeChild(index) {
		const children = this.state.children.filter((_, i) => i !== index);
		this.setState({ children });
		this.update();
	}

	setTitle(title) {
		this.setState({ title });
		this.update();
	}
}
