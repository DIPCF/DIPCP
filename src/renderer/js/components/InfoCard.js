/**
 * 信息卡片组件
 * 用于显示各种信息卡片
 */
class InfoCard extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			title: props.title || '',
			titleKey: props.titleKey || '',
			content: props.content || '',
			icon: props.icon || '',
			className: props.className || '',
			variant: props.variant || 'default', // default, success, warning, error, info
			collapsible: props.collapsible || false,
			collapsed: props.collapsed || false,
			onClick: props.onClick || null,
			onToggle: props.onToggle || null
		};
	}

	render() {
		const classes = this.buildClasses();

		return `
            <div class="info-card ${classes}">
                ${this.renderHeader()}
                <div class="info-card-content ${this.state.collapsed ? 'collapsed' : ''}">
                    ${this.renderContent()}
                </div>
            </div>
        `;
	}

	buildClasses() {
		const classes = ['info-card'];

		if (this.state.variant !== 'default') {
			classes.push(`info-card-${this.state.variant}`);
		}

		if (this.state.className) {
			classes.push(this.state.className);
		}

		return classes.join(' ');
	}

	renderHeader() {
		const titleText = this.state.titleKey ?
			`data-i18n="${this.state.titleKey}"` :
			this.state.title;

		const toggleIcon = this.state.collapsible ?
			(this.state.collapsed ? '▶' : '▼') : '';

		return `
            <div class="info-card-header">
                ${this.state.icon ? `<span class="info-card-icon">${this.state.icon}</span>` : ''}
                <h3 class="info-card-title" ${this.state.titleKey ? '' : ''}>
                    ${titleText}
                </h3>
                ${this.state.collapsible ? `
                    <button class="info-card-toggle" type="button">
                        ${toggleIcon}
                    </button>
                ` : ''}
            </div>
        `;
	}

	renderContent() {
		if (typeof this.state.content === 'string') {
			return this.state.content;
		}

		if (this.state.content && typeof this.state.content.render === 'function') {
			return this.state.content.render();
		}

		return '';
	}

	bindEvents() {
		if (this.state.onClick) {
			this.element.addEventListener('click', (e) => {
				// 避免在点击切换按钮时触发
				if (!e.target.closest('.info-card-toggle')) {
					this.state.onClick(e);
				}
			});
		}

		if (this.state.collapsible) {
			const toggleBtn = this.element.querySelector('.info-card-toggle');
			if (toggleBtn) {
				toggleBtn.addEventListener('click', (e) => {
					e.stopPropagation();
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

	setContent(content) {
		this.setState({ content });
		this.update();
	}

	setTitle(title) {
		this.setState({ title });
		this.update();
	}

	setIcon(icon) {
		this.setState({ icon });
		this.update();
	}
}
