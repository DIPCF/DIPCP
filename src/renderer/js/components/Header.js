/**
 * 页面头部组件
 * 包含Logo、导航菜单和用户信息
 */
class Header extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			title: props.title || 'SPCP',
			showUserInfo: props.showUserInfo || false,
			user: props.user || null,
			currentPage: props.currentPage || '',
			navigationItems: props.navigationItems || [
				{ href: '/', key: 'navigation.dashboard', text: '仪表盘' },
				{ href: '/project-detail', key: 'navigation.projectDetail', text: '项目详情' },
				{ href: '/reviews', key: 'navigation.reviews', text: '审核' },
				{ href: '/settings', key: 'navigation.settings', text: '设置' }
			],
			onLogout: props.onLogout || null,
			onBack: props.onBack || null
		};
	}

	render() {
		const header = document.createElement('header');
		header.className = 'header';
		header.innerHTML = `
            <div class="header-left">
                <h1 class="logo">${this.state.title}</h1>
                <nav class="nav-menu">
                    ${this.renderNavigationItems()}
                </nav>
            </div>
            <div class="header-right">
                ${this.renderUserInfo()}
            </div>
        `;
		return header;
	}

	renderNavigationItems() {
		return this.state.navigationItems.map(item => {
			const isActive = item.href.includes(this.state.currentPage) ? 'active' : '';
			// 使用I18nService获取翻译文本
			const translatedText = window.I18nService && window.I18nService.t ?
				window.I18nService.t(item.key, item.text) : item.text;
			return `
                <a href="${item.href}" class="nav-item ${isActive}">
                    ${translatedText}
                </a>
            `;
		}).join('');
	}

	renderUserInfo() {
		if (!this.state.showUserInfo || !this.state.user) {
			return '';
		}

		// 使用I18nService获取翻译文本
		const logoutText = window.I18nService && window.I18nService.t ?
			window.I18nService.t('dashboard.logout', '退出登录') : '退出登录';
		const backText = window.I18nService && window.I18nService.t ?
			window.I18nService.t('common.back', '返回仪表盘') : '返回仪表盘';

		return `
            <div class="user-info">
                <div class="avatar" id="user-avatar">${this.state.user.username?.charAt(0) || 'U'}</div>
                <span id="username">${this.state.user.username || 'User'}</span>
                ${this.state.onLogout ? `
                    <button id="logout-btn" class="btn danger">${logoutText}</button>
                ` : ''}
            </div>
        `;
	}

	bindEvents() {
		// 绑定导航菜单事件
		const navItems = this.element.querySelectorAll('.nav-item');
		navItems.forEach(item => {
			item.addEventListener('click', (e) => {
				e.preventDefault();

				// 直接使用href属性作为路由
				const route = item.getAttribute('href');

				// 使用路由器导航
				if (window.app && window.app.router) {
					window.app.router.navigateTo(route);
				}
			});
		});

		// 绑定退出登录事件
		if (this.state.onLogout) {
			const logoutBtn = this.element.querySelector('#logout-btn');
			if (logoutBtn) {
				logoutBtn.addEventListener('click', this.state.onLogout);
			}
		}
	}

	updateUser(user) {
		this.setState({ user });
		this.rerender();
		this.bindEvents();
	}

	setCurrentPage(page) {
		this.setState({ currentPage: page });
		this.rerender();
		this.bindEvents();
	}
}

// 导出组件
window.Header = Header;
