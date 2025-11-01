/**
 * 设置页面组件
 * 完全组件化的设置页面，提供语言、主题、账户等设置功能
 * @class SettingsPage
 * @extends {BasePage}
 */
class SettingsPage extends BasePage {
	/**
	 * 构造函数
	 * @param {Object} props - 组件属性
	 * @param {Object} [props.user] - 用户信息对象
	 * @param {string} [props.language] - 语言设置
	 * @param {string} [props.theme] - 主题设置
	 */
	constructor(props = {}) {
		super(props);
		// 从localStorage读取当前语言和主题设置
		const currentLanguage = localStorage.getItem('dipcp-language') || 'zh-CN';
		const currentTheme = localStorage.getItem('dipcp-theme') || 'light';

		// 从 localStorage 获取用户信息
		const userInfo = window.app.getUserFromStorage();

		// 从localStorage读取同步时间间隔（默认30秒）
		const syncInterval = parseInt(localStorage.getItem('dipcp-sync-interval')) || 30;

		this.state = {
			user: userInfo.user,
			userRole: userInfo.userRole,
			permissionInfo: userInfo.permissionInfo,
			language: props.language || currentLanguage,
			theme: props.theme || currentTheme,
			syncInterval: syncInterval, // 同步时间间隔（秒）
		};
	}

	/**
	 * 渲染组件
	 * @returns {HTMLElement} 渲染后的DOM元素
	 */
	render() {
		const container = document.createElement('div');
		container.className = 'dashboard';
		container.innerHTML = `
			${this.renderHeader()}
			<div class="content">
				<div class="settings-container">
					${this.renderLanguageSection()}
					${this.renderThemeSection()}
					${this.renderSyncSection()}
					${this.renderAccountSection()}
				</div>
			</div>
		`;
		return container;
	}

	/**
	 * 渲染页面头部
	 * @returns {string} 头部HTML字符串
	 */
	renderHeader() {
		// 使用BasePage的renderHeader方法
		return super.renderHeader('settings', false, null);
	}

	/**
	 * 渲染语言设置区域
	 * @returns {string} 语言设置HTML字符串
	 */
	renderLanguageSection() {
		// 获取支持的语言列表
		const supportedLanguages = window.I18nService ? window.I18nService.getSupportedLanguages() : ['zh-CN', 'en-US'];

		// 生成语言选项
		const languageOptions = supportedLanguages.map(lang => {
			const displayName = window.I18nService ? window.I18nService.getLanguageDisplayName(lang) : lang;
			const selected = this.state.language === lang ? 'selected' : '';
			return `<option value="${lang}" ${selected}>${displayName}</option>`;
		}).join('');

		return `
            <div class="settings-section">
                <h2>${this.t('settings.language', '语言设置')}</h2>
                <div class="language-settings">
                    <div class="setting-item">
                        <label>${this.t('settings.selectLanguage', '选择语言')}</label>
                        <select id="language-selector" class="language-selector">
                            ${languageOptions}
                        </select>
                    </div>
                </div>
            </div>
        `;
	}

	/**
	 * 渲染主题设置区域
	 * @returns {string} 主题设置HTML字符串
	 */
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

	/**
	 * 渲染同步设置区域
	 * @returns {string} 同步设置HTML字符串
	 */
	renderSyncSection() {
		return `
            <div class="settings-section">
                <h2>${this.t('settings.sync', '同步设置')}</h2>
                <div class="sync-settings">
                    <div class="setting-item">
                        <label for="sync-interval-input">
                            ${this.t('settings.syncInterval', '同步时间间隔（秒）')}
                            <span class="setting-value">${this.state.syncInterval}</span>
                        </label>
                        <input 
                            type="range" 
                            id="sync-interval-input" 
                            min="10" 
                            max="60" 
                            step="10"
                            value="${this.state.syncInterval}" 
                            class="range-input"
                        />
                        <div class="range-info">
                            <span>${this.t('settings.min', '最小')}: 10</span>
                            <span>${this.t('settings.max', '最大')}: 60</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
	}

	/**
	 * 渲染账户设置区域
	 * @returns {string} 账户设置HTML字符串
	 */
	renderAccountSection() {
		// 获取真实用户名
		const realUsername = this.state.user?.username || 'Unknown User';

		return `
            <div class="settings-section">
                <h2>${this.t('settings.account', '账户设置')}</h2>
                <div class="setting-item">
                    <label>${this.t('login.githubUsername', 'GitHub用户名')}: ${realUsername}</label>
                </div>
                <div class="setting-item">
                    <button id="exit-project-btn" class="btn danger">${this.t('dashboard.exitProject', '退出项目')}</button>
                </div>
                <div class="setting-item">
                    <button id="logout-user-btn" class="btn danger">${this.t('settings.logoutUser.button', '退出用户')}</button>
                </div>
            </div>
        `;
	}

	/**
	 * 挂载组件到容器
	 * @param {HTMLElement} container - 挂载容器
	 * @returns {void}
	 */
	mount(container) {
		super.mount(container);

		// 检查并更新用户信息（从 localStorage 读取最新状态）
		this.checkAndUpdateUserInfo();

		// 绑定事件
		this.bindEvents();
	}

	/**
	 * 检查并更新用户信息
	 */
	checkAndUpdateUserInfo() {
		const userInfo = window.app.getUserFromStorage();
		const user = userInfo.user;
		const currentRole = userInfo.userRole;
		const currentPermissionInfo = userInfo.permissionInfo;

		// 如果用户信息、角色或权限信息发生变化，更新状态
		if (this.state.user !== user || this.state.userRole !== currentRole || this.state.permissionInfo !== currentPermissionInfo) {
			this.setState({
				user: user,
				userRole: currentRole,
				permissionInfo: currentPermissionInfo
			});
		}
	}

	/**
	 * 更新语言选择器DOM
	 * @param {string} language - 语言代码
	 * @returns {void}
	 */
	updateLanguageSelectorDOM(language) {
		if (!this.element) return;

		const languageSelector = this.element.querySelector('#language-selector');
		if (languageSelector) {
			languageSelector.value = language;
		}
	}

	/**
	 * 更新主题选择器DOM
	 * @param {string} theme - 主题名称
	 * @returns {void}
	 */
	updateThemeSelectorDOM(theme) {
		if (!this.element) return;

		const themeButtons = this.element.querySelectorAll('.theme-option');
		themeButtons.forEach(btn => {
			const isSelected = btn.dataset.theme === theme;
			btn.classList.toggle('selected', isSelected);
		});
	}

	/**
	 * 更新用户信息DOM
	 * @param {Object} user - 用户信息对象
	 * @returns {void}
	 */
	updateUserInfoDOM(user) {
		if (!this.element) return;

		const realUsername = user?.username || 'Unknown User';
		const usernameLabel = this.element.querySelector('.setting-item label');
		if (usernameLabel) {
			usernameLabel.textContent = `${this.t('login.githubUsername', 'GitHub用户名')}: ${realUsername}`;
		}
	}

	/**
	 * 更新整个设置页面内容（用于语言切换）
	 * @returns {void}
	 */
	updateSettingsContent() {
		if (!this.element) return;

		const content = this.element.querySelector('.content');
		if (content) {
			content.innerHTML = `
				<div class="settings-container">
					${this.renderLanguageSection()}
					${this.renderThemeSection()}
					${this.renderSyncSection()}
					${this.renderAccountSection()}
				</div>
			`;
			// 重新绑定事件
			this.bindEvents();
		}
	}

	/**
	 * 绑定事件监听器
	 * @returns {void}
	 */
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
					// 更新设置页面内容以应用新语言
					this.updateSettingsContent();
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
				if (window.ThemeService) {
					window.ThemeService.setTheme(theme);
				}
			});
		});

		// 同步时间间隔滑块
		const syncIntervalInput = this.element.querySelector('#sync-interval-input');
		if (syncIntervalInput) {
			syncIntervalInput.addEventListener('input', (e) => {
				const interval = parseInt(e.target.value);
				this.setState({ syncInterval: interval });

				// 更新显示的数值
				const valueSpan = this.element.querySelector('.setting-value');
				if (valueSpan) {
					valueSpan.textContent = interval;
				}

				// 保存到localStorage
				localStorage.setItem('dipcp-sync-interval', interval.toString());
			});

			// 只有在用户释放滑块时才保存（避免频繁更新）
			syncIntervalInput.addEventListener('change', (e) => {
				const interval = parseInt(e.target.value);

				// 保存到localStorage
				localStorage.setItem('dipcp-sync-interval', interval.toString());

			});
		}

		// 退出项目按钮
		const exitProjectBtn = this.element.querySelector('#exit-project-btn');
		if (exitProjectBtn) {
			exitProjectBtn.addEventListener('click', () => {
				this.showLogoutModal();
			});
		}

		// 退出用户按钮
		const logoutUserBtn = this.element.querySelector('#logout-user-btn');
		if (logoutUserBtn) {
			logoutUserBtn.addEventListener('click', () => {
				this.showLogoutUserModal();
			});
		}
	}

	/**
	 * 重新渲染组件
	 * @returns {void}
	 */
	rerender() {
		// 更新语言状态从localStorage
		const currentLanguage = localStorage.getItem('dipcp-language') || 'zh-CN';

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
					</div>
				</div>
			`;
		}

		// 重新绑定事件
		this.bindEvents();
	}

	/**
	 * 更新用户信息
	 * @param {Object} user - 用户信息对象
	 * @returns {void}
	 */
	updateUser(user) {
		this.setState({ user });
		this.updateUserInfoDOM(user);
	}

	/**
	 * 更新语言设置
	 * @param {string} language - 语言代码
	 * @returns {void}
	 */
	updateLanguage(language) {
		this.setState({ language });
		this.updateLanguageSelectorDOM(language);
	}

	/**
	 * 更新主题设置
	 * @param {string} theme - 主题名称
	 * @returns {void}
	 */
	updateTheme(theme) {
		this.setState({ theme });
		this.updateThemeSelectorDOM(theme);
	}

	/**
	 * 显示退出项目确认对话框
	 */
	showLogoutModal() {
		// 创建模态框
		const modal = document.createElement('div');
		modal.className = 'modal-overlay';
		modal.innerHTML = `
			<div class="modal-content">
				<div class="modal-header">
					<h3>${this.t('dashboard.logout.confirmTitle', '确认退出项目')}</h3>
				</div>
				<div class="modal-body">
					<p>${this.t('dashboard.logout.warningTitle', '重要提醒')}</p>
					<p>${this.t('dashboard.logout.warningMessage', '退出后，所有未提交的本地数据将被永久删除，包括：')}</p>
					<ul>
						<li>${this.t('dashboard.logout.warningItem1', '• 本地编辑的文件内容')}</li>
						<li>${this.t('dashboard.logout.warningItem2', '• 新建但未提交的文件')}</li>
						<li>${this.t('dashboard.logout.warningItem3', '• 本地工作区的所有修改')}</li>
					</ul>
					<p><strong>${this.t('dashboard.logout.warningNote', '请确保在退出前已保存所有重要修改！')}</strong></p>
				</div>
				<div class="modal-footer">
					<button id="cancel-logout" class="btn secondary">${this.t('common.cancel', '取消')}</button>
					<button id="confirm-logout" class="btn danger">${this.t('dashboard.logout.confirmTitle', '确认退出项目')}</button>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		// 绑定事件
		const cancelBtn = modal.querySelector('#cancel-logout');
		const confirmBtn = modal.querySelector('#confirm-logout');

		cancelBtn.addEventListener('click', () => {
			document.body.removeChild(modal);
		});

		confirmBtn.addEventListener('click', () => {
			document.body.removeChild(modal);
			this.handleLogout();
		});

		// 点击遮罩层关闭
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				document.body.removeChild(modal);
			}
		});
	}

	/**
	 * 处理退出项目
	 */
	handleLogout() {
		// 清除工作区相关的数据，但保留用户信息和设置
		this.clearWorkspaceData();

		// 更新用户信息，移除仓库相关信息但保留登录凭据
		const userInfo = JSON.parse(localStorage.getItem('dipcp-user') || '{}');
		const updatedUserInfo = {
			username: userInfo.username,
			email: userInfo.email,
			avatarUrl: userInfo.avatarUrl,
			name: userInfo.name,
			token: userInfo.token,
			loginTime: userInfo.loginTime
		};
		localStorage.setItem('dipcp-user', JSON.stringify(updatedUserInfo));

		// 重置应用状态，保留用户信息但不保留仓库信息
		window.app.state.user = updatedUserInfo;
		window.app.state.isAuthenticated = true;
		window.app.state.userRole = null;
		window.app.state.permissionInfo = null;

		// 导航到仓库选择页面
		window.app.navigateTo('/repository-selection');
	}

	/**
	 * 清除工作区数据，但保留用户信息和设置
	 */
	clearWorkspaceData() {
		// 清除IndexedDB中的工作区数据（文件缓存等）
		if (window.StorageService) {
			window.StorageService.clearAllCache();
		}

		// 只清除工作区相关的localStorage数据，保留用户信息和设置
		const keysToRemove = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith('dipcp-')) {
				// 保留重要的用户数据和设置
				if (key === 'dipcp-user' ||
					key === 'dipcp-saved-credentials' ||
					key === 'dipcp-language' ||
					key === 'dipcp-theme' ||
					key === 'dipcp-sync-interval' ||
					key === 'dipcp-repository-history') {
					continue; // 跳过这些重要的数据
				}
				keysToRemove.push(key);
			}
		}
		keysToRemove.forEach(key => localStorage.removeItem(key));

		console.log('工作区数据已清除，用户信息和设置已保留');
	}

	/**
	 * 显示退出用户确认对话框
	 */
	showLogoutUserModal() {
		// 创建模态框
		const modal = document.createElement('div');
		modal.className = 'modal-overlay';
		modal.innerHTML = `
			<div class="modal-content">
				<div class="modal-header">
					<h3>${this.t('settings.logoutUser.confirmTitle', '确认退出用户')}</h3>
				</div>
				<div class="modal-body">
					<p>${this.t('settings.logoutUser.warningTitle', '重要提醒')}</p>
					<p>${this.t('settings.logoutUser.warningMessage', '退出用户后，用户相关的数据将被永久删除，包括：')}</p>
					<ul>
						<li>${this.t('settings.logoutUser.warningItem1', '• 用户登录信息')}</li>
						<li>${this.t('settings.logoutUser.warningItem2', '• 保存的登录凭据')}</li>
						<li>${this.t('settings.logoutUser.warningItem3', '• 仓库访问历史')}</li>
						<li>${this.t('settings.logoutUser.warningItem4', '• 所有本地工作区数据')}</li>
					</ul>
					<p><em>${this.t('settings.logoutUser.note', '注意：个人设置（语言、主题等）将被保留')}</em></p>
					<p><strong>${this.t('settings.logoutUser.warningNote', '此操作不可撤销，请谨慎操作！')}</strong></p>
				</div>
				<div class="modal-footer">
					<button id="cancel-logout-user" class="btn secondary">${this.t('common.cancel', '取消')}</button>
					<button id="confirm-logout-user" class="btn danger">${this.t('settings.logoutUser.confirmTitle', '确认退出用户')}</button>
				</div>
			</div>
		`;

		document.body.appendChild(modal);

		// 绑定事件
		const cancelBtn = modal.querySelector('#cancel-logout-user');
		const confirmBtn = modal.querySelector('#confirm-logout-user');

		cancelBtn.addEventListener('click', () => {
			document.body.removeChild(modal);
		});

		confirmBtn.addEventListener('click', () => {
			document.body.removeChild(modal);
			this.handleLogoutUser();
		});

		// 点击遮罩层关闭
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				document.body.removeChild(modal);
			}
		});
	}

	/**
	 * 处理退出用户
	 */
	handleLogoutUser() {
		// 清除所有DIPCP相关的数据
		this.clearAllUserData();

		// 重置应用状态
		window.app.state.user = null;
		window.app.state.isAuthenticated = false;
		window.app.state.userRole = null;
		window.app.state.permissionInfo = null;

		// 导航到登录页面
		window.app.navigateTo('/login');
	}

	/**
	 * 清除所有用户数据
	 */
	clearAllUserData() {
		// 清除IndexedDB中的所有数据
		if (window.StorageService) {
			window.StorageService.clearAllCache();
		}

		// 清除用户相关的localStorage数据，但保留个人设置
		const keysToRemove = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith('dipcp-')) {
				// 保留个人设置相关的数据
				if (key === 'dipcp-language' ||
					key === 'dipcp-theme' ||
					key === 'dipcp-sync-interval') {
					continue; // 跳过这些个人设置数据
				}
				keysToRemove.push(key);
			}
		}
		keysToRemove.forEach(key => localStorage.removeItem(key));

		console.log('用户数据已清除，个人设置已保留');
	}
}

// 注册组件
window.SettingsPage = SettingsPage;
