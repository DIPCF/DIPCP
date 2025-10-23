/**
 * 全局服务加载器
 * 确保全局服务只加载一次，避免重复加载
 */
class GlobalServicesLoader {
	static loaded = false;
	static loading = false;
	static loadPromise = null;

	/**
	 * 加载全局服务
	 * @returns {Promise<void>}
	 */
	static async load() {
		// 如果已经加载完成，直接返回
		if (this.loaded) {
			return Promise.resolve();
		}

		// 如果正在加载中，返回现有的Promise
		if (this.loading && this.loadPromise) {
			return this.loadPromise;
		}

		// 开始加载
		this.loading = true;
		this.loadPromise = this._loadServices();

		try {
			await this.loadPromise;
			this.loaded = true;
			this.loading = false;
			console.log('Global services loaded successfully');
		} catch (error) {
			this.loading = false;
			console.error('Failed to load global services:', error);
			throw error;
		}

		return this.loadPromise;
	}

	/**
	 * 内部方法：加载服务
	 * @private
	 */
	static _loadServices() {
		return new Promise((resolve, reject) => {
			// 检查服务是否已经存在
			if (window.StorageService && window.GitHubService) {
				resolve();
				return;
			}

			// 动态加载服务脚本
			// 根据当前页面路径确定正确的服务路径
			const isInPages = window.location.pathname.includes('/pages/');
			const basePath = isInPages ? '../js/services/' : 'js/services/';

			const services = [
				basePath + 'storage-service.js',
				basePath + 'github-service.js'
			];

			let loadedCount = 0;
			const totalCount = services.length;

			const onLoad = () => {
				loadedCount++;
				if (loadedCount === totalCount) {
					resolve();
				}
			};

			const onError = (error) => {
				reject(error);
			};

			services.forEach(servicePath => {
				const script = document.createElement('script');
				// 添加缓存破坏参数
				script.src = servicePath + '?v=' + Date.now();
				script.onload = onLoad;
				script.onerror = onError;
				document.head.appendChild(script);
			});
		});
	}

	/**
	 * 检查服务是否已加载
	 * @returns {boolean}
	 */
	static isLoaded() {
		return this.loaded && window.StorageService && window.GitHubService;
	}
}

// 自动加载全局服务
document.addEventListener('DOMContentLoaded', () => {
	GlobalServicesLoader.load().catch(error => {
		console.error('Failed to auto-load global services:', error);
	});
});

// 导出到全局
window.GlobalServicesLoader = GlobalServicesLoader;
