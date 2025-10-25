/**
 * 基础页面组件
 * 所有页面组件的基类
 */
class BasePage extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			...props
		};
	}

	async render(path) {
		// 子类需要实现此方法
		console.log(`Rendering page: ${this.constructor.name} for path: ${path}`);
	}

	mount(container) {
		super.mount(container);

		// 应用主题
		if (window.ThemeService) {
			window.ThemeService.applyTheme();
		}

		// 应用国际化
		if (window.I18nService) {
			window.I18nService.translatePage();
		}
	}

	// 辅助方法：获取i18n文本，如果服务不可用则返回默认值
	t(key, defaultValue = '') {
		if (window.I18nService && window.I18nService.t) {
			return window.I18nService.t(key, defaultValue);
		}
		return defaultValue;
	}

	// 渲染Header组件
	renderHeader(currentPage = '', showUserInfo = false, user = null, onBack = null) {
		// 使用Header组件
		this.headerComponent = new window.Header({
			title: 'SPCP',
			showUserInfo: showUserInfo,
			user: user,
			currentPage: currentPage,
			onBack: onBack,
			navigationItems: [
				{ href: '/', key: 'navigation.dashboard', text: this.t('navigation.dashboard', '仪表盘') },
				{ href: '/project-detail', key: 'navigation.projectDetail', text: this.t('navigation.projectDetail', '项目详情') },
				{ href: '/reviews', key: 'navigation.reviews', text: this.t('navigation.reviews', '审核') },
				{ href: '/settings', key: 'navigation.settings', text: this.t('navigation.settings', '设置') }
			]
		});

		// 渲染Header组件并返回HTML字符串
		const headerElement = this.headerComponent.render();
		return headerElement.outerHTML;
	}

	// 绑定Header组件的事件
	bindHeaderEvents() {
		if (this.headerComponent && this.element) {
			const headerElement = this.element.querySelector('header');
			if (headerElement) {
				this.headerComponent.element = headerElement;
				this.headerComponent.bindEvents();
			}
		}
	}

	destroy() {
		super.destroy();
	}
}

// 注册组件
window.BasePage = BasePage;
