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
	// 速率限制限额
	_rateLimitLimit: null,

	/**
	 * 获取翻译文本
	 * @param {string} key - 翻译键
	 * @param {Object} params - 参数对象（可选）
	 * @returns {string} 翻译后的文本
	 */
	_t(key, params = {}) {
		if (window.I18nService && window.I18nService.t) {
			return window.I18nService.t(key, params);
		}
		// 如果没有 i18n 服务，返回键本身
		return key;
	},

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

			// 设置 Octokit 钩子，拦截所有响应以读取速率限制信息
			this._setupRateLimitHook();

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
	 * 获取速率限制限额
	 * @returns {number|null} 限额，如果未获取则返回 null
	 */
	getRateLimitLimit() {
		return this._rateLimitLimit;
	},

	/**
	 * 检查API速率限制（使用rate_limit API端点）
	 * @returns {Promise<Object>} 速率限制信息 { limit: number, remaining: number }
	 */
	async checkRateLimit() {
		try {
			// 确保已初始化
			if (!this._octokit) {
				const userInfo = window.app?.getUserFromStorage();
				if (userInfo?.user?.token) {
					await this.initFromUser(userInfo.user);
				} else {
					throw new Error('GitHub服务未初始化');
				}
			}

			// 使用专门的rate_limit API端点获取速率限制信息
			const response = await this._octokit.rest.rateLimit.get();
			const { rate } = response.data;

			const limit = rate.limit || 0;
			const remaining = rate.remaining || 0;

			// 保存限额
			if (limit) {
				this._rateLimitLimit = limit;
			}

			return {
				limit: limit,
				remaining: remaining
			};
		} catch (error) {
			console.error('检查速率限制失败:', error);
			throw error;
		}
	},

	/**
	 * 处理 GitHub API 速率限制错误
	 * @param {Error} error - 错误对象
	 * @returns {boolean} 是否是速率限制错误
	 */
	handleRateLimitError(error) {
		// 检查是否是速率限制错误
		let isRateLimitError = false;

		if (!error) {
			return false;
		}

		// 检查错误消息（GraphQL 和 REST）
		if (error.message && (
			error.message.includes('API rate limit exceeded') ||
			error.message.includes('rate limit already exceeded')
		)) {
			isRateLimitError = true;
		}

		// 检查 REST API 错误状态码
		if (error.status === 403 && error.headers &&
			(error.headers['x-ratelimit-remaining'] === '0' ||
				error.headers['retry-after'])) {
			isRateLimitError = true;
		}

		// 检查 GraphQL 错误响应
		if (error.response && error.response.data && error.response.data.errors) {
			const errors = error.response.data.errors;
			for (const gqlError of errors) {
				if (gqlError.message && (
					gqlError.message.includes('API rate limit exceeded') ||
					gqlError.message.includes('rate limit already exceeded')
				)) {
					isRateLimitError = true;
					break;
				}
			}
		}

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

		// 记录速率限制头信息以便调试
		if (error.response && error.response.headers) {
			const limit = error.response.headers['x-ratelimit-limit'];
			console.warn(`⚠️ GitHub API 速率限制已触发，将暂停 1 小时 - 限额: ${limit}/小时`);
		} else {
			console.warn('GitHub API 速率限制已触发，将暂停 1 小时');
		}
		return true;
	},

	/**
	 * 设置 Octokit 钩子以拦截响应头
	 * 在每个 API 调用后自动记录速率限制信息
	 */
	_setupRateLimitHook() {
		if (!this._octokit) {
			return;
		}

		// 使用 Octokit 的钩子系统
		// 拦截所有响应以读取速率限制头部
		this._octokit.hook.before('request', async (options) => {
			// 可以在这里记录请求信息（可选）
		});

		this._octokit.hook.after('request', async (response, options) => {
			// 在所有 API 调用后记录速率限制信息
			//this._logRateLimitInfo(response.headers);
		});

		this._octokit.hook.error('request', async (error, options) => {
			// 错误响应也可能包含速率限制头部
			if (error.response && error.response.headers) {
				this._logRateLimitInfo(error.response.headers);
			}
		});
	},

	/**
	 * 记录速率限制信息到控制台
	 * @param {Object} headers - 响应头对象
	 */
	_logRateLimitInfo(headers) {
		if (!headers) {
			return;
		}

		// 读取速率限制头部
		const remaining = headers['x-ratelimit-remaining'];
		const limit = headers['x-ratelimit-limit'];
		const reset = headers['x-ratelimit-reset'];
		const used = headers['x-ratelimit-used'];

		// 只有在有有效数据时才显示
		if (remaining !== undefined && limit !== undefined && reset !== undefined) {
			// 保存限额
			this._rateLimitLimit = parseInt(limit);

			// 计算重置时间
			const resetDate = new Date(parseInt(reset) * 1000);
			const resetTime = resetDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

			// 计算使用率百分比
			const percentage = ((parseInt(used) / parseInt(limit)) * 100).toFixed(1);

			// 根据剩余次数决定日志级别
			const remainingInt = parseInt(remaining);

			// 如果limit只有60，说明可能没有使用token认证
			if (parseInt(limit) === 60) {
				console.warn(`⚠️ GitHub API 速率限制: ${remaining}/${limit} (${percentage}% 已使用), 重置时间: ${resetTime} - 这可能表示未使用token认证！`);
			} else {
				console.log(`GitHub API 速率限制: ${remaining}/${limit} (${percentage}% 已使用), 重置时间: ${resetTime}`);
			}

		}
	},

	/**
	 * 安全的 GitHub API 调用包装器
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
				throw new Error(this._t('common.serviceNotInitialized'));
			}
		}

		// 检查是否处于速率限制状态
		if (this.isRateLimited()) {
			const remainingTime = this.getRateLimitRemainingTime();
			const hours = Math.floor(remainingTime / (60 * 60 * 1000));
			const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

			const error = new Error(this._t('common.rateLimitExceeded', { hours, minutes }));
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

				const rateLimitError = new Error(this._t('common.rateLimitExceeded', { hours, minutes }));
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
	 * @returns {Promise<Array>} Issues 列表
	 */
	async listIssues(owner, repo, options = {}) {
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
	},

	/**
	 * 获取单个 Issue
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {number} issueNumber - Issue 编号
	 * @returns {Promise<Object>} Issue 对象
	 */
	async getIssue(owner, repo, issueNumber) {
		return await this.safeCall(async (octokit) => {
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
	 * @returns {Promise<Array>} 评论列表
	 */
	async listIssueComments(owner, repo, issueNumber) {
		return await this.safeCall(async (octokit) => {
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
	 * @returns {Promise<Object>} 仓库信息
	 */
	async getRepo(owner, repo) {
		return await this.safeCall(async (octokit) => {
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
	 * @returns {Promise<Object>} 文件内容
	 */
	async getRepoContent(owner, repo, path) {
		return await this.safeCall(async (octokit) => {
			const { data } = await octokit.rest.repos.getContent({
				owner,
				repo,
				path
			});
			return data;
		});
	},

	/**
	 * 检查用户是否已为仓库加星
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @returns {Promise<boolean>} 是否已加星
	 */
	async isStarred(owner, repo) {
		try {
			// 确保已初始化
			if (!this._octokit) {
				const userInfo = window.app?.getUserFromStorage();
				if (userInfo?.user?.token) {
					await this.initFromUser(userInfo.user);
				} else {
					return false; // 未登录，默认未加星
				}
			}

			// 直接调用 API，404 是正常情况（表示未加星）
			await this._octokit.rest.activity.checkRepoIsStarredByAuthenticatedUser({
				owner,
				repo
			});

			// 如果没有抛出异常，说明已加星（返回 204）
			return true;
		} catch (error) {
			// 404 表示未加星，这是正常情况
			if (error.status === 404) {
				return false;
			}
			// 其他错误也返回 false，避免阻塞页面显示
			console.warn('检查加星状态时出错:', error);
			return false;
		}
	},

	/**
	 * 为仓库加星
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @returns {Promise<void>}
	 */
	async starRepo(owner, repo) {
		return await this.safeCall(async (octokit) => {
			await octokit.rest.activity.starRepoForAuthenticatedUser({
				owner,
				repo
			});
		});
	},

	/**
	 * 获取分支信息
	 * @param {string} owner - 仓库所有者
	 * @param {string} repo - 仓库名称
	 * @param {string} branch - 分支名称
	 * @returns {Promise<Object>} 分支信息
	 */
	async getBranch(owner, repo, branch) {
		return await this.safeCall(async (octokit) => {
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
	 * 根据用户名获取用户信息
	 * @param {string} username - 用户名
	 * @returns {Promise<Object>} 用户信息
	 */
	async getUserByUsername(username) {
		return await this.safeCall(async (octokit) => {
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
			try {
				// 尝试直接调用graphql方法
				if (typeof this._octokit.graphql === 'function') {
					const result = await this._octokit.graphql(query, variables);
					// 检查 result 是否存在
					if (!result) {
						console.warn('GraphQL 请求返回了 undefined');
						return null;
					}
					// Octokit.graphql可能返回{data}或直接返回数据
					// 如果返回的是 {data: {...}} 格式，提取 data
					// 如果返回的是直接的数据，直接返回
					if (result.data !== undefined) {
						return result.data;
					}
					return result;
				}

				// 如果graphql方法不存在，使用request方法
				const response = await this._octokit.request('POST /graphql', {
					query,
					variables
				});
				// 检查响应是否存在
				if (!response || !response.data) {
					console.warn('GraphQL 请求返回了无效的响应');
					return null;
				}
				return response.data;
			} catch (error) {
				console.error('GraphQL请求失败:', error);
				// 如果是 GraphQL 错误，检查是否有 data 字段
				if (error.data) {
					console.warn('GraphQL 错误响应包含 data:', error.data);
					return error.data;
				}
				throw error;
			}
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

