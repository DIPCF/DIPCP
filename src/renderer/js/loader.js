/**
 * 动态加载器
 * 在i18n服务完全加载后，动态加载其他所有JS文件
 */

class DynamicLoader {
	constructor() {
		this.loadedScripts = new Set();
		this.loadPromises = new Map();
	}

	/**
	 * 动态加载单个脚本
	 */
	async loadScript(src) {
		if (this.loadedScripts.has(src)) {
			return Promise.resolve();
		}

		if (this.loadPromises.has(src)) {
			return this.loadPromises.get(src);
		}

		const promise = new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = src;
			script.onload = () => {
				this.loadedScripts.add(src);
				resolve();
			};
			script.onerror = () => {
				console.error(`Failed to load script: ${src}`);
				reject(new Error(`Failed to load script: ${src}`));
			};
			document.head.appendChild(script);
		});

		this.loadPromises.set(src, promise);
		return promise;
	}

	/**
	 * 动态加载ES模块
	 */
	async loadESModule(src) {
		if (this.loadedScripts.has(src)) {
			return Promise.resolve();
		}

		if (this.loadPromises.has(src)) {
			return this.loadPromises.get(src);
		}

		const promise = new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.type = 'module';
			script.src = src;
			script.onload = () => {
				this.loadedScripts.add(src);
				resolve();
			};
			script.onerror = () => {
				console.error(`Failed to load ES module: ${src}`);
				reject(new Error(`Failed to load ES module: ${src}`));
			};
			document.head.appendChild(script);
		});

		this.loadPromises.set(src, promise);
		return promise;
	}

	/**
	 * 加载外部库
	 */
	async loadExternalLibraries() {
		// 加载Octokit库并设置到全局
		const octokitScript = document.createElement('script');
		octokitScript.type = 'module';
		octokitScript.innerHTML = `
			import { Octokit } from "https://esm.sh/@octokit/rest";
			window.Octokit = Octokit;
		`;
		document.head.appendChild(octokitScript);

		// 等待Octokit库完全加载并设置到全局
		while (!window.Octokit) {
			await new Promise(resolve => setTimeout(resolve, 10));
		}

		console.log('✅ Octokit库加载完成');

		// 加载libsodium库
		await this.loadLibsodium();
	}

	/**
	 * 加载libsodium库
	 */
	async loadLibsodium() {
		return new Promise((resolve, reject) => {
			const libsodiumScript = document.createElement('script');
			// 使用本地libsodium库
			libsodiumScript.src = 'js/sodium.js';
			libsodiumScript.onload = async () => {
				try {
					await window.sodium.ready;
					window.libsodium = window.sodium;
					console.log('✅ libsodium库（本地）加载完成');
					resolve();
				} catch (error) {
					console.error('❌ libsodium库（本地）初始化失败:', error);
					// 尝试使用Web Crypto API作为fallback
					console.log('⚠️ 将使用Web Crypto API作为fallback');
					resolve();
				}
			};
			libsodiumScript.onerror = (error) => {
				console.warn('⚠️ 本地libsodium库加载失败，将使用Web Crypto API作为fallback');
				resolve();
			};
			document.head.appendChild(libsodiumScript);
		});
	}


	/**
	 * 批量加载脚本（分组并行加载）
	 */
	async loadScripts(scripts) {
		// 定义依赖关系组
		const dependencyGroups = [
			// 第一组：基础服务
			[
				'js/services/storage-service.js',
				'js/services/theme-service.js'
			],
			// 第二组：基础组件类
			[
				'js/components/Component.js',
				'js/components/ComponentLoader.js'
			],
			// 第三组：基础UI组件（依赖Component）
			[
				'js/components/StatusIndicator.js',
				'js/components/InfoItem.js',
				'js/components/HistoryItem.js',
				'js/components/FileInfo.js',
				'js/components/StatusBar.js',
				'js/components/BreadcrumbItem.js',
				'js/components/MemberItem.js',
				'js/components/ActivityItem.js',
				'js/components/FileItem.js',
				'js/components/LoadingState.js',
				'js/components/ErrorState.js',
				'js/components/StateDisplay.js',
				'js/components/CollaborationInfo.js',
				'js/components/Modal.js'
			],
			// 第四组：复合组件（依赖基础组件）
			[
				'js/components/Breadcrumb.js',
				'js/components/MembersList.js',
				'js/components/ActivityList.js',
				'js/components/EditHistoryList.js'
			],
			// 第五组：布局和表单组件
			[
				'js/components/Header.js',
				'js/components/FormGroup.js',
				'js/components/Button.js',
				'js/components/SettingsSection.js',
				'js/components/SettingItem.js',
				'js/components/ThemeOption.js',
				'js/components/InfoCard.js',
				'js/components/StatCard.js',
				'js/components/Toolbar.js',
				'js/components/Dropdown.js'
			],
			// 第六组：页面基类
			[
				'js/pages/BasePage.js'
			],
			// 第七组：页面组件（依赖BasePage）
			[
				'js/pages/LoginPage.js',
				'js/pages/DashboardPage.js',
				'js/pages/ProjectDetailPage.js',
				'js/pages/EditorPage.js',
				'js/pages/SettingsPage.js',
				'js/pages/ReviewsPage.js',
				'js/pages/TermsPage.js',
				'js/pages/PrivacyPage.js',
				'js/pages/UserProfilePage.js'
			],
			// 第八组：应用（依赖所有页面）
			[
				'js/app.js'
			]
		];

		// 按组顺序加载，组内并行加载
		for (const group of dependencyGroups) {
			const promises = group.map(src => this.loadScript(src));
			await Promise.all(promises);
		}
	}

	/**
	 * 等待i18n服务完全加载
	 */
	async waitForI18nReady() {
		// 等待i18n服务对象存在
		while (!window.I18nService) {
			await new Promise(resolve => setTimeout(resolve, 10));
		}

		// 初始化i18n服务
		await window.I18nService.init();

		// 等待翻译数据完全加载
		while (!window.I18nService.translations || Object.keys(window.I18nService.translations).length === 0) {
			await new Promise(resolve => setTimeout(resolve, 10));
		}
	}

	/**
	 * 加载所有应用脚本
	 */
	async loadAllScripts() {
		// 1. 首先加载外部库
		await this.loadExternalLibraries();

		// 2. 等待i18n服务完全加载
		await this.waitForI18nReady();

		// 3. 使用分组加载策略加载应用脚本
		await this.loadScripts();
	}

	/**
	 * 初始化应用
	 */
	async init() {
		try {
			await this.loadAllScripts();

			// 所有脚本加载完成后，初始化应用
			if (window.app && typeof window.app.init === 'function') {
				await window.app.init();
			} else {
				console.error('App not found or init method not available');
			}
		} catch (error) {
			console.error('Failed to load application:', error);
		}
	}
}

// 创建全局加载器实例
window.dynamicLoader = new DynamicLoader();

// 页面加载完成后开始加载
document.addEventListener('DOMContentLoaded', () => {
	window.dynamicLoader.init();
});
