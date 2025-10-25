// 存储服务 - 真正的实现
window.StorageService = {
	dbName: 'SPCP_Database',
	dbVersion: 3,

	// 初始化IndexedDB
	async initDB() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);

			request.onupgradeneeded = (event) => {
				const db = event.target.result;

				// 创建项目数据存储
				if (!db.objectStoreNames.contains('projects')) {
					db.createObjectStore('projects', { keyPath: 'id' });
				}

				// 创建本地工作区存储
				if (!db.objectStoreNames.contains('localWorkspace')) {
					db.createObjectStore('localWorkspace', { keyPath: 'path' });
				}

				// 创建文件缓存存储
				if (!db.objectStoreNames.contains('fileCache')) {
					db.createObjectStore('fileCache', { keyPath: 'path' });
				}

				// 创建成员数据缓存存储
				if (!db.objectStoreNames.contains('membersCache')) {
					db.createObjectStore('membersCache', { keyPath: 'projectId' });
				}
			};
		});
	},

	// 执行IndexedDB操作
	async _execute(storeName, operation, ...args) {
		const db = await this.initDB();
		const transaction = db.transaction([storeName], 'readwrite');
		const store = transaction.objectStore(storeName);

		return new Promise((resolve, reject) => {
			const request = store[operation](...args);
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	},

	// 用户配置相关
	getUserConfig() {
		const config = localStorage.getItem('spcp-config');
		return config ? JSON.parse(config) : null;
	},

	saveUserConfig(config) {
		localStorage.setItem('spcp-config', JSON.stringify(config));
	},

	// 项目数据相关 - 真正的实现
	async getProjectData(projectId) {
		try {
			const result = await this._execute('projects', 'get', projectId);
			return result ? result.data : null;
		} catch (error) {
			console.error('Error getting project data:', error);
			return null;
		}
	},

	async saveProjectData(projectId, data) {
		try {
			await this._execute('projects', 'put', {
				id: projectId,
				data: data,
				timestamp: Date.now()
			});
		} catch (error) {
			console.error('Error saving project data:', error);
			throw error;
		}
	},

	// 本地工作区相关 - 真正的实现
	async getAllLocalWorkspaceFiles() {
		try {
			const files = await this._execute('localWorkspace', 'getAll');
			return files || [];
		} catch (error) {
			console.error('Error getting local workspace files:', error);
			return [];
		}
	},

	async saveLocalWorkspaceFile(path, data) {
		try {
			await this._execute('localWorkspace', 'put', {
				path,
				...data,
				timestamp: Date.now()
			});
		} catch (error) {
			console.error('Error saving local workspace file:', error);
			throw error;
		}
	},

	async deleteLocalWorkspaceFile(path) {
		try {
			await this._execute('localWorkspace', 'delete', path);
		} catch (error) {
			console.error('Error deleting local workspace file:', error);
			throw error;
		}
	},

	// 文件缓存相关 - 真正的实现
	async getCachedFileContent(filePath) {
		try {
			const result = await this._execute('fileCache', 'get', filePath);
			return result ? result.content : null;
		} catch (error) {
			console.error('Error getting cached file content:', error);
			return null;
		}
	},

	async cacheFileContent(filePath, content) {
		try {
			await this._execute('fileCache', 'put', {
				path: filePath,
				content: content,
				timestamp: Date.now()
			});
		} catch (error) {
			console.error('Error caching file content:', error);
		}
	},

	async getAllFileCacheFiles() {
		try {
			const files = await this._execute('fileCache', 'getAll');
			return files || [];
		} catch (error) {
			console.error('Error getting file cache files:', error);
			return [];
		}
	},

	async clearAllCache() {
		try {
			const stores = ['projects', 'localWorkspace', 'fileCache'];
			const promises = stores.map(store => this._execute(store, 'clear'));
			await Promise.all(promises);
		} catch (error) {
			console.error('Error clearing cache:', error);
		}
	},

	// 清除用户数据
	async clearUserData() {
		try {
			// 清除IndexedDB中的所有数据
			await this.clearAllCache();

			// 清除localStorage中的用户相关数据
			const keysToRemove = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith('spcp-')) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach(key => localStorage.removeItem(key));

			console.log('User data cleared successfully');
		} catch (error) {
			console.error('Error clearing user data:', error);
			throw error;
		}
	},

	// 同步信息管理
	getLastSyncInfo(projectId) {
		const syncInfo = localStorage.getItem(`spcp-sync-${projectId}`);
		return syncInfo ? JSON.parse(syncInfo) : null;
	},

	setLastSyncInfo(projectId, syncInfo) {
		localStorage.setItem(`spcp-sync-${projectId}`, JSON.stringify(syncInfo));
	},

	clearSyncInfo(projectId) {
		localStorage.removeItem(`spcp-sync-${projectId}`);
	},

	// 文件内容相关方法
	async getFileContent(filePath) {
		try {
			// 优先从文件缓存获取
			const cachedFile = await this._execute('fileCache', 'get', filePath);
			if (cachedFile) {
				return cachedFile;
			}

			// 从本地工作区获取
			const localFile = await this._execute('localWorkspace', 'get', filePath);
			if (localFile) {
				return localFile;
			}

			return null;
		} catch (error) {
			console.error('Failed to get file content:', error);
			return null;
		}
	},

	async saveFileContent(filePath, fileData) {
		try {
			// 保存到文件缓存
			await this._execute('fileCache', 'put', {
				path: filePath,
				...fileData,
				timestamp: Date.now()
			});
			return true;
		} catch (error) {
			console.error('Failed to save file content:', error);
			return false;
		}
	},

	// 成员数据缓存相关方法
	async getMembersCache(projectId) {
		try {
			const result = await this._execute('membersCache', 'get', projectId);
			return result ? result.data : null;
		} catch (error) {
			console.error('Error getting members cache:', error);
			return null;
		}
	},

	async saveMembersCache(projectId, membersData) {
		try {
			await this._execute('membersCache', 'put', {
				projectId: projectId,
				data: membersData,
				timestamp: Date.now()
			});
		} catch (error) {
			console.error('Error saving members cache:', error);
			throw error;
		}
	},

	async clearMembersCache(projectId) {
		try {
			await this._execute('membersCache', 'delete', projectId);
		} catch (error) {
			console.error('Error clearing members cache:', error);
		}
	},

	// 同步仓库数据 - 使用Octokit
	async syncRepositoryData(owner, repo, token, progressCallback = null) {
		try {
			console.log(`开始同步仓库数据: ${owner}/${repo}`);

			// 初始化数据库
			await this.initDB();

			// 使用Octokit获取仓库文件列表
			const octokit = new window.Octokit({ auth: token });
			const { data: files } = await octokit.rest.repos.getContent({ owner, repo, path: '' });

			// 过滤掉.github目录的文件
			const validFiles = files.filter(file =>
				!(file.path.startsWith('.github/') || file.path === '.github') &&
				file.type === 'file'
			);

			console.log(`需要下载 ${validFiles.length} 个文件`);

			// 下载所有文件到fileCache
			let downloadedCount = 0;
			for (const file of validFiles) {
				try {
					const { data: fileData } = await octokit.rest.repos.getContent({
						owner, repo, path: file.path
					});

					// 检查是否有内容
					if (fileData.content) {
						try {
							// 尝试解码base64内容
							const content = atob(fileData.content);

							// 保存到fileCache
							await this._execute('fileCache', 'put', {
								path: file.path,
								content: content,
								sha: fileData.sha,
								created: fileData.created_at,
								modified: fileData.updated_at,
								isLocal: false,
								size: content.length,
								type: file.type
							});

							downloadedCount++;

							// 调用进度回调
							if (progressCallback) {
								const progress = Math.round((downloadedCount / validFiles.length) * 100);
								progressCallback(progress, downloadedCount, validFiles.length, file.path);
							}
						} catch (decodeError) {
							// 如果base64解码失败，跳过该文件
							console.log(`跳过无法解码的文件: ${file.path}`);
						}
					} else {
						// 没有内容，可能是空文件
						console.log(`跳过空文件: ${file.path}`);
					}
				} catch (error) {
					console.warn(`下载文件 ${file.path} 失败:`, error);
				}
			}

			// 保存同步信息
			const syncInfo = {
				lastSync: new Date().toISOString(),
				repo: `${owner}/${repo}`,
				fileCount: downloadedCount
			};
			localStorage.setItem(`spcp-sync-${repo}`, JSON.stringify(syncInfo));

			console.log(`仓库数据同步完成，共下载 ${downloadedCount} 个文件`);
			return syncInfo;
		} catch (error) {
			console.error('同步仓库数据失败:', error);
			throw error;
		}
	}
};