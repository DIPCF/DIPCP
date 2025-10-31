/**
 * 统计卡片组件
 * 用于仪表盘显示统计数据
 */
class StatCard extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			title: props.title || '',
			titleKey: props.titleKey || '',
			value: props.value || '0',
			icon: props.icon || '',
			className: props.className || '',
			variant: props.variant || 'default', // default, success, warning, error, info
			trend: props.trend || null, // { direction: 'up'|'down'|'neutral', value: '5%' }
			onClick: props.onClick || null
		};
	}

	render() {
		const classes = this.buildClasses();

		return `
            <div class="stat-card ${classes}">
                <div class="stat-icon">${this.state.icon}</div>
                <div class="stat-content">
                    <h3 class="stat-title" ${this.state.titleKey ? `data-i18n="${this.state.titleKey}"` : ''}>
                        ${this.state.titleKey ? '' : this.state.title}
                    </h3>
                    <p class="stat-number">${this.state.value}</p>
                    ${this.renderTrend()}
                </div>
            </div>
        `;
	}

	buildClasses() {
		const classes = ['stat-card'];

		if (this.state.variant !== 'default') {
			classes.push(`stat-card-${this.state.variant}`);
		}

		if (this.state.className) {
			classes.push(this.state.className);
		}

		return classes.join(' ');
	}

	renderTrend() {
		if (!this.state.trend) {
			return '';
		}

		const trendIcon = this.getTrendIcon();
		const trendClass = `trend-${this.state.trend.direction}`;

		return `
            <div class="stat-trend ${trendClass}">
                <span class="trend-icon">${trendIcon}</span>
                <span class="trend-value">${this.state.trend.value}</span>
            </div>
        `;
	}

	getTrendIcon() {
		switch (this.state.trend.direction) {
			case 'up':
				return '↗';
			case 'down':
				return '↘';
			case 'neutral':
				return '→';
			default:
				return '';
		}
	}

	bindEvents() {
		if (this.state.onClick) {
			this.element.addEventListener('click', this.state.onClick);
		}
	}

	setValue(value) {
		this.setState({ value });
		this.update();
	}

	setTrend(trend) {
		this.setState({ trend });
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
