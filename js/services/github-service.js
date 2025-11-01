/**
 * GitHub 服务
 * 统一管理所有 GitHub API 请求，包括速率限制处理
 */
window.GitHubService = {
	// Octokit 实例
	_octokit: null,
	// 当前使用的 token
	_token: null,
	// 速率限制状态
	_rateLimitState: null,

	/**
	 * 初始化 GitHub 服务
	 * @param {string} token - GitHub 访问令牌
	 * @returns {Promise<boolean>} 初始化是否成功
	 */
	async init(token) {
		try {
			// 检查 Octokit 是否可用
			if (typeof window.Octokit === 'undefined') {
				console.warn('Octokit 未加载');
				return false;
			}

			if (!token) {
				console.warn('GitHub token 未提供');
				return false;
			}

			// 如果 token 未变化，不需要重新初始化
			if (this._token === token && this._octokit) {
				return true;
			}

			// 创建 Octokit 实例
			this._octokit = new window.Octokit({ auth: token });
			this._token = token;

			console.log('GitHub 服务初始化成功');
			return true;
		} catch (error) {
			console.error('初始化 GitHub 服务失败:', error);
			return false;
		}
	},

	/**
	 * 从用户信息初始化
	 * @param {Object} user - 用户对象，包含 token
	 * @returns {Promise<boolean>}
	 */
	async initFromUser(user) {
		if (!user || !user.token) {
			console.warn('用户信息或 token 缺失');
			return false;
		}
		return await this.init(user.token);
	},

	/**
	 * 检查是否处于 GitHub API 速率限制状态
	 * @returns {boolean} 如果处于限制状态返回 true
	 */
	isRateLimited() {
		try {
			const rateLimitInfo = localStorage.getItem('dipcp-rate-limit');
			if (!rateLimitInfo) {
				return false;
			}

			const { blockedUntil } = JSON.parse(rateLimitInfo);
			const now = Date.now();

			// 如果限制时间已过，清除限制状态
			if (now >= blockedUntil) {
				localStorage.removeItem('dipcp-rate-limit');
				this._rateLimitState = null;
				return false;
			}

			this._rateLimitState = { blockedUntil };
			return true;
		} catch (error) {
			console.error('检查速率限制状态失败:', error);
			return false;
		}
	},

	/**
	 * 获取速率限制剩余时间（毫秒）
	 * @returns {number} 剩余时间，如果未限制则返回 0
	 */
	getRateLimitRemainingTime() {
		if (!this.isRateLimited()) {
			return 0;
		}

		const rateLimitInfo = JSON.parse(localStorage.getItem('dipcp-rate-limit'));
		const now = Date.now();
		return Math.max(0, rateLimitInfo.blockedUntil - now);
	},

	/**
	 * 处理 GitHub API 速率限制错误
	 * @param {Error} error - 错误对象
	 * @returns {boolean} 是否是速率限制错误
	 */
	handleRateLimitError(error) {
		// 检查是否是速率限制错误
		const isRateLimitError = error && (
			(error.message && error.message.includes('API rate limit exceeded')) ||
			(error.status === 403 && error.headers &&
				(error.headers['x-ratelimit-remaining'] === '0' ||
					error.headers['retry-after']))
		);

		if (!isRateLimitError) {
			return false;
		}

		// 设置速率限制状态（1小时 = 3600000 毫秒）
		const blockedUntil = Date.now() + (60 * 60 * 1000);
		localStorage.setItem('dipcp-rate-limit', JSON.stringify({
			blockedUntil,
			timestamp: new Date().toISOString()
		}));
		this._rateLimitState = { blockedUntil };

		// 触发速率限制事件
		if (window.StorageService && window.StorageService._emit) {
			window.StorageService._emit('rate-limit-exceeded', {
				blockedUntil: new Date(blockedUntil).toISOString(),
				remainingTime: 60 * 60 * 1000
			});
		}

		// 显示用户提示
		this.showRateLimitNotification();

		console.warn('GitHub API 速率限制已触发，将暂停 1 小时');
		return true;
	},

	/**
	 * 显示速率限制通知
	 */
	showRateLimitNotification() {
		// 如果 Modal 组件可用，使用它显示通知
		if (window.Modal) {
			const modal = new window.Modal();
			const remainingTime = this.getRateLimitRemainingTime();
			const hours = Math.floor(remainingTime / (60 * 60 * 1000));
			const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

			const message = `
				<div style="line-height: 1.6;">
					<p style="margin-bottom: 15px;">
						⚠️ GitHub API 请求次数已超过限制，系统将暂停 GitHub API 请求 1 小时。
					</p>
					<p style="margin-bottom: 15px;">
						预计恢复时间：${hours} 小时 ${minutes} 分钟后
					</p>
					<p style="margin-bottom: 15px;">
						<strong>建议：</strong>
					</p>
					<ul style="margin-left: 20px; margin-bottom: 15px;">
						<li>加入 <a href="https://github.com/developers" target="_blank" style="color: var(--primary-color);">GitHub Developer Program</a> 以获得更高的 API 请求限制</li>
						<li>等待限制重置后再继续使用</li>
						<li>在此期间，您可以继续使用本地功能</li>
					</ul>
					<p style="font-size: 0.9em; color: var(--text-secondary);">
						如需帮助，请联系 GitHub 支持：<a href="https://support.github.com" target="_blank" style="color: var(--primary-color);">https://support.github.com</a>
					</p>
				</div>
			`;

			modal.showInfo(
				'⚠️ GitHub API 速率限制',
				message,
				{ showCancel: false }
			);
		}
	},

	/**
	 * 公开 API 调用（不需要 token）
	 * 用于访问公开仓库和用户信息
	 * @param {Function} apiCall - 要执行的 API 调用函数（返回 Promise）
	 * @returns {Promise} API 调用的结果
	 */
	async publicCall(apiCall) {
		// 创建无 token 的 Octokit 实例用于公开 API
		const octokitPublic = new window.Octokit();

		try {
			return await apiCall(octokitPublic);
		} catch (error) {
			// 检查是否是速率限制错误
			if (this.handleRateLimitError(error)) {
				const remainingTime = this.getRateLimitRemainingTime();
				const hours = Math.floor(remainingTime / (60 * 60 * 1000));
				const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

				const rateLimitError = new Error(`GitHub API 速率限制中，请等待 ${hours} 小时 ${minutes} 分钟后重试`);
				rateLimitError.isRateLimited = true;
				rateLimitError.remainingTime = remainingTime;
				throw rateLimitError;
			}

			// 如果不是速率限制错误，直接抛出
			throw error;
		}
	},

	/**
	 * 安全的 GitHub API 调用包装器（需要认证）
	 * 自动检查速率限制并处理错误
	 * @param {Function} apiCall - 要执行的 API 调用函数（返回 Promise）
	 * @returns {Promise} API 调用的结果
	 */
	async safeCall(apiCall) {
		// 确保已初始化
		if (!this._octokit) {
			const userInfo = window.app?.getUserFromStorage();
			if (userInfo?.user?.token) {
				await this.initFromUser(userInfo.user);
			} else {
				throw new Error('GitHub 服务未初始化，请先登录');
			}
		}

		// 检查是否处于速率限制状态
		if (this.isRateLimited()) {
			const remainingTime = this.getRateLimitRemainingTime();
			const hours = Math.floor(remainingTime / (60 * 60 * 1000));
			const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

			const error = new Error(`GitHub API 速率限制中，请等待 ${hours} 小时 ${minutes} 分钟后重试`);
			error.isRateLimited = true;
			error.remainingTime = remainingTime;
			throw error;
		}

		try {
			return await apiCall(this._octokit);
		} catch (error) {
			// 检查是否是速率限制错误
			if (this.handleRateLimitError(error)) {
				// 重新抛出错误，让调用者知道是速率限制
				const remainingTime = this.getRateLimitRemainingTime();
				const hours = Math.floor(remainingTime / (60 * 60 * 1000));
				const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

				const rateLimitError = new Error(`GitHub API 速率限制中，请等待 ${hours} 小时 ${minutes} 分钟后重试`);
				rateLimitError.isRateLimited = true;
				rateLimitError.remainingTime = remainingTime;
				throw rateLimitError;
			}

			// 如果不是速率限制错误，直接抛出
			throw error;
		}
	},

	/**
	 * 获取 Octokit 实例（直接访问，不推荐，建议使用 safeCall）
	 * @returns {Object|null} Octokit 实例
	 */
	getOctokit() {
		return this._octokit;
	},

	// ========== Issues API ==========

	/**
	 * 列出仓库的所有 Issues
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {Object} options - 选项 (state, sort, direction等)
	 * @param {boolean} requireAuth - 是否必须使用认证（默认 false，使用公开 API）
	 * @returns {Promise<Array>} Issues 列表
	 */
	async listIssues(owner, repo, options = {}, requireAuth = false) {
		if (requireAuth) {
			return await this.safeCall(async (octokit) => {
				const { data } = await octokit.rest.issues.listForRepo({
					owner,
					repo,
					state: options.state || 'open',
					sort: options.sort || 'created',
					direction: options.direction || 'desc',
					...options
				});
				return data;
			});
		}

		return await this.publicCall(async (octokit) => {
			const { data } = await octokit.rest.issues.listForRepo({
				owner,
				repo,
				state: options.state || 'open',
				sort: options.sort || 'created',
				direction: options.direction || 'desc',
				...options
			});
			return data;
		});
	},

	/**
	 * 获取单个 Issue
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {number} issueNumber - Issue 编号
	 * @param {boolean} requireAuth - 是否必须使用认证（默认 false，使用公开 API）
	 * @returns {Promise<Object>} Issue 对象
	 */
	async getIssue(owner, repo, issueNumber, requireAuth = false) {
		if (requireAuth) {
			return await this.safeCall(async (octokit) => {
				const { data } = await octokit.rest.issues.get({
					owner,
					repo,
					issue_number: issueNumber
				});
				return data;
			});
		}

		return await this.publicCall(async (octokit) => {
			const { data } = await octokit.rest.issues.get({
				owner,
				repo,
				issue_number: issueNumber
			});
			return data;
		});
	},

	/**
	 * 创建 Issue
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {Object} issue - Issue 数据 (title, body, labels等)
	 * @returns {Promise<Object>} 创建的 Issue
	 */
	async createIssue(owner, repo, issue) {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.rest.issues.create({
				owner,
				repo,
				...issue
			});
			return data;
		});
	},

	/**
	 * 列出 Issue 的评论
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {number} issueNumber - Issue 编号
	 * @param {boolean} requireAuth - 是否必须使用认证（默认 false，使用公开 API）
	 * @returns {Promise<Array>} 评论列表
	 */
	async listIssueComments(owner, repo, issueNumber, requireAuth = false) {
		if (requireAuth) {
			return await this.safeCall(async (octokit) => {
				const { data } = await octokit.rest.issues.listComments({
					owner,
					repo,
					issue_number: issueNumber
				});
				return data;
			});
		}

		return await this.publicCall(async (octokit) => {
			const { data } = await octokit.rest.issues.listComments({
				owner,
				repo,
				issue_number: issueNumber
			});
			return data;
		});
	},

	/**
	 * 在 Issue 中添加评论
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {number} issueNumber - Issue 编号
	 * @param {string} body - 评论内容
	 * @returns {Promise<Object>} 创建的评论
	 */
	async createIssueComment(owner, repo, issueNumber, body) {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.rest.issues.createComment({
				owner,
				repo,
				issue_number: issueNumber,
				body
			});
			return data;
		});
	},

	/**
	 * 为 Issue 添加标签
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {number} issueNumber - Issue 编号
	 * @param {Array<string>} labels - 标签列表
	 * @returns {Promise<Object>} 更新后的 Issue
	 */
	async addIssueLabels(owner, repo, issueNumber, labels) {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.rest.issues.addLabels({
				owner,
				repo,
				issue_number: issueNumber,
				labels
			});
			return data;
		});
	},

	// ========== Repositories API ==========

	/**
	 * 获取仓库信息
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {boolean} requireAuth - 是否必须使用认证（默认 false，使用公开 API）
	 * @returns {Promise<Object>} 仓库信息
	 */
	async getRepo(owner, repo, requireAuth = false) {
		if (requireAuth) {
			return await this.safeCall(async (octokit) => {
				const { data } = await octokit.rest.repos.get({
					owner,
					repo
				});
				return data;
			});
		}

		return await this.publicCall(async (octokit) => {
			const { data } = await octokit.rest.repos.get({
				owner,
				repo
			});
			return data;
		});
	},

	/**
	 * 获取仓库文件内容
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} path - 文件路径
	 * @param {boolean} requireAuth - 是否必须使用认证（默认 false，使用公开 API）
	 * @returns {Promise<Object>} 文件内容
	 */
	async getRepoContent(owner, repo, path, requireAuth = false) {
		if (requireAuth) {
			return await this.safeCall(async (octokit) => {
				const { data } = await octokit.rest.repos.getContent({
					owner,
					repo,
					path
				});
				return data;
			});
		}

		return await this.publicCall(async (octokit) => {
			const { data } = await octokit.rest.repos.getContent({
				owner,
				repo,
				path
			});
			return data;
		});
	},

	/**
	 * 获取分支信息
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} branch - 分支名称
	 * @param {boolean} requireAuth - 是否必须使用认证（默认 false，使用公开 API）
	 * @returns {Promise<Object>} 分支信息
	 */
	async getBranch(owner, repo, branch, requireAuth = false) {
		if (requireAuth) {
			return await this.safeCall(async (octokit) => {
				const { data } = await octokit.rest.repos.getBranch({
					owner,
					repo,
					branch
				});
				return data;
			});
		}

		return await this.publicCall(async (octokit) => {
			const { data } = await octokit.rest.repos.getBranch({
				owner,
				repo,
				branch
			});
			return data;
		});
	},

	/**
	 * 列出用户的所有仓库
	 * @param {string} username - 用户名
	 * @returns {Promise<Array>} 仓库列表
	 */
	async listUserRepos(username) {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.rest.repos.listForUser({
				username
			});
			return data;
		});
	},

	// ========== Users API ==========

	/**
	 * 根据用户名获取用户信息（公开 API，不需要 token）
	 * @param {string} username - 用户名
	 * @returns {Promise<Object>} 用户信息
	 */
	async getUserByUsername(username) {
		return await this.publicCall(async (octokit) => {
			const { data } = await octokit.rest.users.getByUsername({
				username
			});
			return data;
		});
	},

	/**
	 * 获取已认证用户的信息
	 * @returns {Promise<Object>} 用户信息
	 */
	async getAuthenticatedUser() {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.rest.users.getAuthenticated();
			return data;
		});
	},

	/**
	 * 列出用户的公开活动
	 * @param {string} username - 用户名
	 * @returns {Promise<Array>} 活动列表
	 */
	async listUserPublicEvents(username) {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.rest.activity.listPublicEventsForUser({
				username
			});
			return data;
		});
	},

	// ========== Pull Requests API ==========

	/**
	 * 获取 Pull Request
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {number} pullNumber - PR 编号
	 * @returns {Promise<Object>} PR 信息
	 */
	async getPullRequest(owner, repo, pullNumber) {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.rest.pulls.get({
				owner,
				repo,
				pull_number: pullNumber
			});
			return data;
		});
	},

	/**
	 * 列出 Pull Requests
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {Object} options - 选项 (state, head, base等)
	 * @returns {Promise<Array>} PR 列表
	 */
	async listPullRequests(owner, repo, options = {}) {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.rest.pulls.list({
				owner,
				repo,
				...options
			});
			return data;
		});
	},

	/**
	 * 列出 PR 的文件
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {number} pullNumber - PR 编号
	 * @returns {Promise<Array>} 文件列表
	 */
	async listPullRequestFiles(owner, repo, pullNumber) {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.rest.pulls.listFiles({
				owner,
				repo,
				pull_number: pullNumber
			});
			return data;
		});
	},

	// ========== GraphQL API ==========

	/**
	 * 执行 GraphQL 查询
	 * @param {string} query - GraphQL 查询字符串
	 * @param {Object} variables - 查询变量
	 * @returns {Promise<Object>} 查询结果
	 */
	async graphql(query, variables = {}) {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.graphql(query, variables);
			return data;
		});
	},

	// ========== Search API ==========

	/**
	 * 搜索 Issues 和 Pull Requests
	 * @param {string} query - 搜索查询字符串
	 * @returns {Promise<Object>} 搜索结果
	 */
	async searchIssuesAndPullRequests(query) {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.rest.search.issuesAndPullRequests({
				q: query
			});
			return data;
		});
	},

	// ========== 其他常用 API ==========

	/**
	 * 执行自定义 API 请求
	 * @param {string} method - HTTP 方法
	 * @param {string} endpoint - API 端点
	 * @param {Object} options - 请求选项
	 * @returns {Promise<Object>} 响应数据
	 */
	async request(method, endpoint, options = {}) {
		return await this.safeCall(async () => {
			const { data } = await this._octokit.request(`${method} ${endpoint}`, options);
			return data;
		});
	}
};

