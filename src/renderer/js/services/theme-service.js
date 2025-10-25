/**
 * 主题服务
 * 支持暗黑和明亮两种主题切换
 */
window.ThemeService = {
	currentTheme: 'dark', // 'light', 'dark' - 默认暗黑主题
	listeners: [],

	/**
	 * 初始化主题管理器
	 */
	init() {
		// 从本地存储读取用户设置
		const savedTheme = localStorage.getItem('spcp-theme');
		if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
			this.currentTheme = savedTheme;
		}

		// 应用主题
		this.applyTheme();
	},

	/**
	 * 获取当前主题
	 */
	getCurrentTheme() {
		return this.currentTheme;
	},

	/**
	 * 获取实际生效的主题
	 */
	getEffectiveTheme() {
		return this.currentTheme;
	},

	/**
	 * 设置主题
	 */
	setTheme(theme) {
		if (!['light', 'dark'].includes(theme)) {
			console.warn('Invalid theme:', theme);
			return;
		}

		this.currentTheme = theme;
		localStorage.setItem('spcp-theme', theme);
		this.applyTheme();
		this.notifyListeners();
	},

	/**
	 * 切换主题
	 */
	toggleTheme() {
		const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
		this.setTheme(newTheme);
	},

	/**
	 * 应用主题
	 */
	applyTheme() {
		document.documentElement.setAttribute('data-theme', this.currentTheme);
		document.documentElement.classList.toggle('dark-theme', this.currentTheme === 'dark');
	},


	/**
	 * 添加主题变化监听器
	 */
	addListener(callback) {
		this.listeners.push(callback);
	},

	/**
	 * 移除主题变化监听器
	 */
	removeListener(callback) {
		const index = this.listeners.indexOf(callback);
		if (index > -1) {
			this.listeners.splice(index, 1);
		}
	},

	/**
	 * 通知所有监听器
	 */
	notifyListeners() {
		this.listeners.forEach(callback => {
			try {
				callback(this.currentTheme, this.getEffectiveTheme());
			} catch (error) {
				console.error('Theme listener error:', error);
			}
		});
	},

	/**
	 * 获取主题图标
	 */
	getThemeIcon() {
		return this.currentTheme === 'dark' ? '🌙' : '☀️';
	},

	/**
	 * 获取主题名称
	 */
	getThemeName() {
		return this.currentTheme === 'dark' ? I18nService.t('theme.dark') : I18nService.t('theme.light');
	}

};
