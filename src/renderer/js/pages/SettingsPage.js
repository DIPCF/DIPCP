/**
 * 设置页面组件
 * 完全组件化的设置页面
 */
class SettingsPage extends BasePage {
	constructor(props = {}) {
		super(props);
		// 从localStorage读取当前语言和主题设置
		const currentLanguage = localStorage.getItem('spcp-language') || 'zh-CN';
		const currentTheme = localStorage.getItem('spcp-theme') || 'light';
		this.state = {
			user: props.user || null,
			language: props.language || currentLanguage,
			theme: props.theme || currentTheme,
			notifications: props.notifications || {
				email: true,
				system: true
			}
		};
	}

	render() {
		const container = document.createElement('div');
		container.className = 'dashboard';
		container.innerHTML = `
			${this.renderHeader()}
			<div class="content">
				<div class="settings-container">
					${this.renderLanguageSection()}
					${this.renderThemeSection()}
					${this.renderAccountSection()}
					${this.renderNotificationsSection()}
				</div>
			</div>
		`;
		return container;
	}

	renderHeader() {
		// 使用BasePage的renderHeader方法
		return super.renderHeader('settings', false, null);
	}

	renderLanguageSection() {
		return `
            <div class="settings-section">
                <h2>${this.t('settings.language', '语言设置')}</h2>
                <div class="language-settings">
                    <div class="setting-item">
                        <label>${this.t('settings.selectLanguage', '选择语言')}</label>
                        <select id="language-selector" class="language-selector">
                            <option value="zh-CN" ${this.state.language === 'zh-CN' ? 'selected' : ''}>${this.t('settings.chinese', '中文')}</option>
                            <option value="en-US" ${this.state.language === 'en-US' ? 'selected' : ''}>${this.t('settings.english', 'English')}</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
	}

	renderThemeSection() {
		return `
            <div class="settings-section">
                <h2>${this.t('settings.theme.title', '主题设置')}</h2>
                <div class="theme-settings">
                    <div class="theme-options">
                        <button id="theme-light" class="theme-option ${this.state.theme === 'light' ? 'selected' : ''}" data-theme="light">
                            <div class="theme-preview light-preview"></div>
                            <div class="theme-info">
                                <span class="theme-name">${this.t('common.light', '明亮主题')}</span>
                                <span class="theme-desc">${this.t('settings.theme.lightDesc', '适合日间使用')}</span>
                            </div>
                        </button>
                        <button id="theme-dark" class="theme-option ${this.state.theme === 'dark' ? 'selected' : ''}" data-theme="dark">
                            <div class="theme-preview dark-preview"></div>
                            <div class="theme-info">
                                <span class="theme-name">${this.t('common.dark', '暗黑主题')}</span>
                                <span class="theme-desc">${this.t('settings.theme.darkDesc', '适合夜间使用')}</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;
	}

	renderAccountSection() {
		return `
            <div class="settings-section">
                <h2>${this.t('settings.account', '账户设置')}</h2>
                <div class="setting-item">
                    <label>${this.t('login.githubUsername', 'GitHub用户名')}</label>
                    <input type="text" value="${this.state.user?.username || 'Test User'}" readonly>
                </div>
                <div class="setting-item">
                    <label>${this.t('login.githubEmail', 'GitHub邮箱')}</label>
                    <input type="text" value="${this.state.user?.email || 'testuser@github.com'}" readonly>
                </div>
            </div>
        `;
	}

	renderNotificationsSection() {
		return `
            <div class="settings-section">
                <h2>${this.t('settings.notifications', '通知设置')}</h2>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${this.state.notifications.email ? 'checked' : ''}>
                        <span>${this.t('settings.emailNotifications', '邮件通知')}</span>
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" ${this.state.notifications.system ? 'checked' : ''}>
                        <span>${this.t('settings.systemNotifications', '系统通知')}</span>
                    </label>
                </div>
            </div>
        `;
	}

	mount(container) {
		super.mount(container);

		// 绑定事件
		this.bindEvents();
	}

	bindEvents() {
		// 绑定Header组件的事件
		this.bindHeaderEvents();

		// 语言选择器
		const languageSelector = this.element.querySelector('#language-selector');
		if (languageSelector) {
			languageSelector.addEventListener('change', async (e) => {
				const language = e.target.value;
				this.setState({ language });

				// 直接调用i18n服务
				if (window.I18nService) {
					await window.I18nService.changeLanguage(language);
					// 重新渲染页面以应用新语言
					this.rerender();
					this.bindEvents();
				}
			});
		}

		// 主题选择
		const themeButtons = this.element.querySelectorAll('.theme-option');
		themeButtons.forEach(btn => {
			btn.addEventListener('click', (e) => {
				const theme = e.currentTarget.dataset.theme;
				this.setState({ theme });

				// 更新选中状态
				themeButtons.forEach(b => b.classList.remove('selected'));
				e.currentTarget.classList.add('selected');

				// 直接调用主题管理器
				if (window.themeManager) {
					window.themeManager.setTheme(theme);
				}
			});
		});

		// 通知设置
		const checkboxes = this.element.querySelectorAll('input[type="checkbox"]');
		checkboxes.forEach(checkbox => {
			checkbox.addEventListener('change', (e) => {
				const span = e.target.nextElementSibling;
				const text = span.textContent.trim();

				let notifications = { ...this.state.notifications };
				if (text.includes('邮件') || text.includes('email')) {
					notifications.email = e.target.checked;
				} else if (text.includes('系统') || text.includes('system')) {
					notifications.system = e.target.checked;
				}

				this.setState({ notifications });
				this.handleNotificationChange(notifications);
			});
		});
	}

	rerender() {
		// 更新语言状态从localStorage
		const currentLanguage = localStorage.getItem('spcp-language') || 'zh-CN';

		if (this.state.language !== currentLanguage) {
			this.state.language = currentLanguage; // 直接更新状态，不触发setState
		}

		// 重新渲染整个页面内容
		if (this.element) {
			this.element.innerHTML = `
				${this.renderHeader()}
				<div class="content">
					<div class="settings-container">
						${this.renderLanguageSection()}
						${this.renderThemeSection()}
						${this.renderAccountSection()}
						${this.renderNotificationsSection()}
					</div>
				</div>
			`;
		}

		// 重新绑定事件
		this.bindEvents();
	}

	updateUser(user) {
		this.setState({ user });
		this.rerender();
		this.bindEvents();
	}

	updateLanguage(language) {
		this.setState({ language });
		this.rerender();
		this.bindEvents();
	}

	updateTheme(theme) {
		this.setState({ theme });
		this.rerender();
		this.bindEvents();
	}

	updateNotifications(notifications) {
		this.setState({ notifications });
		this.rerender();
		this.bindEvents();
	}

	handleNotificationChange(notifications) {
		console.log('通知设置变更', notifications);
		// 保存到localStorage
		const config = JSON.parse(localStorage.getItem('spcp-config') || '{}');
		config.notifications = notifications;
		localStorage.setItem('spcp-config', JSON.stringify(config));
	}
}

// 注册组件
window.SettingsPage = SettingsPage;
