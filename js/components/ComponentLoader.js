/**
 * 组件加载器
 * 负责加载和管理所有自定义组件
 */
class ComponentLoader {
	constructor() {
		this.components = new Map();
		this.loadedComponents = new Set();
	}

	/**
	 * 注册组件
	 * @param {string} name - 组件名称
	 * @param {Function} componentClass - 组件类
	 */
	registerComponent(name, componentClass) {
		if (typeof componentClass === 'undefined') {
			// 静默跳过未定义的组件，不显示警告
			return false;
		}
		this.components.set(name, componentClass);
		console.log(`Component registered: ${name}`);
		return true;
	}

	/**
	 * 创建组件实例
	 * @param {string} name - 组件名称
	 * @param {Object} props - 组件属性
	 * @returns {Component} 组件实例
	 */
	createComponent(name, props = {}) {
		const ComponentClass = this.components.get(name);
		if (!ComponentClass) {
			throw new Error(`Component "${name}" not found. Make sure it's registered.`);
		}
		return new ComponentClass(props);
	}

	/**
	 * 检查组件是否已注册
	 * @param {string} name - 组件名称
	 * @returns {boolean}
	 */
	hasComponent(name) {
		return this.components.has(name);
	}

	/**
	 * 获取所有已注册的组件名称
	 * @returns {Array<string>}
	 */
	getRegisteredComponents() {
		return Array.from(this.components.keys());
	}

	/**
	 * 初始化所有组件
	 * 在页面加载完成后调用
	 */
	init() {
		// 注册内置组件（只注册已加载的组件）
		const componentsToRegister = [
			['StatusIndicator', window.StatusIndicator],
			['CollaborationInfo', window.CollaborationInfo],
			['InfoItem', window.InfoItem],
			['HistoryItem', window.HistoryItem],
			['EditHistoryList', window.EditHistoryList],
			['FileInfo', window.FileInfo],
			['StatusBar', window.StatusBar],
			['BreadcrumbItem', window.BreadcrumbItem],
			['Breadcrumb', window.Breadcrumb],
			['MemberItem', window.MemberItem],
			['MembersList', window.MembersList],
			['ActivityItem', window.ActivityItem],
			['ActivityList', window.ActivityList],
			['FileItem', window.FileItem],
			['LoadingState', window.LoadingState],
			['ErrorState', window.ErrorState],
			['StateDisplay', window.StateDisplay],
			// 新增的布局和表单组件
			['Header', window.Header],
			['FormGroup', window.FormGroup],
			['Button', window.Button],
			['SettingsSection', window.SettingsSection],
			['SettingItem', window.SettingItem],
			['ThemeOption', window.ThemeOption],
			['InfoCard', window.InfoCard],
			['StatCard', window.StatCard],
			['Toolbar', window.Toolbar],
			['Dropdown', window.Dropdown],
			// 新增的页面组件
			['TermsPage', window.TermsPage],
			['PrivacyPage', window.PrivacyPage]
		];

		componentsToRegister.forEach(([name, componentClass]) => {
			this.registerComponent(name, componentClass);
		});

		console.log('ComponentLoader initialized with components:', this.getRegisteredComponents());
	}
}

// 创建全局组件加载器实例
window.ComponentLoader = new ComponentLoader();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
	// 延迟初始化，确保所有组件都已加载
	setTimeout(() => {
		window.ComponentLoader.init();
	}, 100);
});
