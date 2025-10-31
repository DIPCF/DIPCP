// 存储服务 - 真正的实现
window.StorageService = {
	dbName: 'DIPCP_Database',
	dbVersion: 4,

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

				// 创建文件提交状态存储
				if (!db.objectStoreNames.contains('fileSubmissionStatus')) {
					db.createObjectStore('fileSubmissionStatus', { keyPath: 'fileKey' });
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
		const config = localStorage.getItem('dipcp-config');
		return config ? JSON.parse(config) : null;
	},

	saveUserConfig(config) {
		localStorage.setItem('dipcp-config', JSON.stringify(config));
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

	/**
	 * 获取所有删除记录
	 * @returns {Promise<Array>} 删除记录数组，每个记录包含 {path, deletedFrom, deletedAt}
	 */
	async getAllDeletionRecords() {
		try {
			const allFiles = await this.getAllLocalWorkspaceFiles();
			const deletionRecords = [];
			
			for (const file of allFiles) {
				// 检查是否是删除记录（路径以 __deletions__/ 开头）
				if (file.path && file.path.startsWith('__deletions__/')) {
					try {
						// 解析删除记录内容
						const deletionData = file.content ? JSON.parse(file.content) : null;
						if (deletionData && deletionData.path) {
							// 提取实际的文件路径（移除 __deletions__/ 前缀）
							const actualPath = deletionData.path;
							deletionRecords.push({
								path: actualPath,
								deletedFrom: deletionData.deletedFrom || 'local',
								deletedAt: deletionData.deletedAt,
								recordPath: file.path // 保存记录的路径，用于后续清理
							});
						}
					} catch (parseError) {
						console.warn(`解析删除记录失败 ${file.path}:`, parseError);
					}
				}
			}
			
			return deletionRecords;
		} catch (error) {
			console.error('Error getting deletion records:', error);
			return [];
		}
	},

	/**
	 * 清理删除记录（提交成功后调用）
	 * @param {Array<string>} filePaths - 要清理的文件路径数组
	 */
	async clearDeletionRecords(filePaths) {
		try {
			const promises = filePaths.map(filePath => {
				const recordPath = `__deletions__/${filePath}`;
				return this.deleteLocalWorkspaceFile(recordPath).catch(err => {
					console.warn(`清理删除记录失败 ${recordPath}:`, err);
				});
			});
			await Promise.all(promises);
			console.log(`已清理 ${filePaths.length} 个删除记录`);
		} catch (error) {
			console.error('Error clearing deletion records:', error);
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

	// 文件提交状态管理
	async getFileSubmissionStatus(owner, repo, filePath) {
		try {
			const fileKey = `${owner}/${repo}:${filePath}`;
			const result = await this._execute('fileSubmissionStatus', 'get', fileKey);
			return result ? result.hasSubmitted : false;
		} catch (error) {
			console.error('Error getting file submission status:', error);
			return false;
		}
	},

	async setFileSubmissionStatus(owner, repo, filePath, hasSubmitted) {
		try {
			const fileKey = `${owner}/${repo}:${filePath}`;
			await this._execute('fileSubmissionStatus', 'put', {
				fileKey: fileKey,
				hasSubmitted: hasSubmitted,
				timestamp: Date.now()
			});
		} catch (error) {
			console.error('Error setting file submission status:', error);
		}
	},

	async clearFileSubmissionStatus(owner, repo, filePath) {
		try {
			const fileKey = `${owner}/${repo}:${filePath}`;
			await this._execute('fileSubmissionStatus', 'delete', fileKey);
		} catch (error) {
			console.error('Error clearing file submission status:', error);
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
				if (key && key.startsWith('dipcp-')) {
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
		const syncInfo = localStorage.getItem(`dipcp-sync-${projectId}`);
		return syncInfo ? JSON.parse(syncInfo) : null;
	},

	setLastSyncInfo(projectId, syncInfo) {
		localStorage.setItem(`dipcp-sync-${projectId}`, JSON.stringify(syncInfo));
	},

	clearSyncInfo(projectId) {
		localStorage.removeItem(`dipcp-sync-${projectId}`);
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

	// 递归获取所有文件（包括子目录）
	async getAllFiles(octokit, owner, repo, path = '', allFiles = []) {
		try {
			const { data: items } = await octokit.rest.repos.getContent({ owner, repo, path });

			// 收集目录
			const dirs = [];
			const files = [];

			for (const item of items) {
				if (item.type === 'file') {
					files.push(item);
				} else if (item.type === 'dir') {
					dirs.push(item);
				}
			}

			// 添加当前目录下的文件
			allFiles.push(...files);

			// 并发处理子目录
			const dirPromises = dirs.map(dir =>
				this.getAllFiles(octokit, owner, repo, dir.path, allFiles)
			);

			// 等待所有子目录处理完成
			await Promise.all(dirPromises);

			return allFiles;
		} catch (error) {
			console.error(`获取目录 ${path} 失败:`, error);
			return allFiles;
		}
	},

	// 下载单个文件
	async downloadFile(octokit, owner, repo, file) {
		try {
			// 使用Octokit获取文件内容
			const { data: fileData } = await octokit.rest.repos.getContent({
				owner, repo, path: file.path
			});

			// 简化：使用当前时间作为时间戳，不再获取提交历史
			const createdTime = new Date().toISOString();
			const modifiedTime = new Date().toISOString();

			// 检查是否有内容
			if (fileData.content) {
				try {
					// 尝试解码base64内容，使用UTF-8编码
					const binaryString = atob(fileData.content);
					const bytes = new Uint8Array(binaryString.length);
					for (let i = 0; i < binaryString.length; i++) {
						bytes[i] = binaryString.charCodeAt(i);
					}
					const content = new TextDecoder('utf-8').decode(bytes);

					// 计算文件大小（UTF-8字节数）
					const fileSize = new Blob([content]).size;

					// 保存到fileCache
					await window.StorageService._execute('fileCache', 'put', {
						path: file.path,
						content: content,
						sha: fileData.sha,
						created: createdTime,
						modified: modifiedTime,
						isLocal: false,
						size: fileSize,
						type: file.type
					});

					return true;
				} catch (decodeError) {
					// 如果base64解码失败，跳过该文件
					console.log(`跳过无法解码的文件: ${file.path}`, decodeError);
					return false;
				}
			} else {
				// 没有内容，可能是空文件
				console.log(`跳过空文件: ${file.path}`);
				return false;
			}
		} catch (error) {
			console.warn(`下载文件 ${file.path} 失败:`, error);
			return false;
		}
	},

	// 同步仓库数据 - 差量同步，只下载变更的文件
	async syncRepositoryData(owner, repo, token, progressCallback = null) {
		try {
			console.log(`开始差量同步仓库数据: ${owner}/${repo}`);

			// 初始化数据库
			if (window.StorageService) {
				await window.StorageService.initDB();
			}

			// 使用Octokit获取所有文件（包括子目录）
			const octokit = new window.Octokit({ auth: token });
			const allFiles = await this.getAllFiles(octokit, owner, repo);

			console.log(`仓库中共有 ${allFiles.length} 个文件`);

			// 并发获取文件SHA配置
			const CONCURRENCY_CHECK = 20; // 同时检查的文件数
			const filesToDownload = [];

			// 分批检查文件SHA
			for (let i = 0; i < allFiles.length; i += CONCURRENCY_CHECK) {
				const batch = allFiles.slice(i, Math.min(i + CONCURRENCY_CHECK, allFiles.length));

				// 并发检查文件是否已更新
				const checkResults = await Promise.all(
					batch.map(async (file) => {
						try {
							// 获取本地缓存的SHA
							const cachedFile = await window.StorageService._execute('fileCache', 'get', file.path);

							// 如果文件不存在或SHA不匹配，则需要下载
							if (!cachedFile || cachedFile.sha !== file.sha) {
								return file;
							}
							return null;
						} catch (error) {
							// 如果检查失败，也需要下载
							console.warn(`检查文件 ${file.path} 失败:`, error);
							return file;
						}
					})
				);

				// 收集需要下载的文件
				checkResults.forEach(file => {
					if (file) {
						filesToDownload.push(file);
					}
				});

				// 更新进度
				if (progressCallback) {
					const progress = Math.round((i / allFiles.length) * 100);
					progressCallback(progress, i, allFiles.length, null);
				}

				console.log(`已检查 ${Math.min(i + CONCURRENCY_CHECK, allFiles.length)}/${allFiles.length} 个文件`);
			}

			console.log(`需要下载 ${filesToDownload.length} 个文件（${allFiles.length - filesToDownload.length} 个已是最新）`);

			// 并发下载配置
			const CONCURRENCY_DOWNLOAD = 10; // 同时下载的文件数
			const totalFiles = filesToDownload.length;
			let downloadedCount = 0;
			let processedCount = 0;

			// 分批下载文件
			for (let i = 0; i < filesToDownload.length; i += CONCURRENCY_DOWNLOAD) {
				const batch = filesToDownload.slice(i, Math.min(i + CONCURRENCY_DOWNLOAD, filesToDownload.length));

				// 并发下载当前批次
				const results = await Promise.all(
					batch.map(file => this.downloadFile(octokit, owner, repo, file))
				);

				// 统计成功下载的文件数
				results.forEach(success => {
					if (success) {
						downloadedCount++;
					}
					processedCount++;

					// 更新进度（每10个文件更新一次，避免频繁UI更新）
					if (processedCount % 10 === 0 || processedCount === totalFiles) {
						if (progressCallback) {
							const progress = Math.round((processedCount / totalFiles) * 100);
							progressCallback(progress, processedCount, totalFiles, null);
						}
					}
				});

				console.log(`已下载 ${processedCount}/${totalFiles} 个文件`);
			}

			// 检测并删除远程已删除的文件（只删除文件缓存，不删除本地工作空间的文件）
			const remoteFilePaths = new Set(allFiles.map(file => file.path));
			const cachedFiles = await this.getAllFileCacheFiles();
			const filesToDelete = [];
			
			for (const cachedFile of cachedFiles) {
				// 只处理文件缓存中的文件，不处理本地工作空间的文件
				// 并且跳过删除记录（__deletions__/ 开头的路径）
				if (cachedFile.path && 
					!cachedFile.path.startsWith('__deletions__/') &&
					!remoteFilePaths.has(cachedFile.path)) {
					filesToDelete.push(cachedFile.path);
				}
			}

			// 删除本地缓存中已不存在于远程仓库的文件
			let deletedCount = 0;
			if (filesToDelete.length > 0) {
				console.log(`发现 ${filesToDelete.length} 个文件在远程已删除，正在清理本地缓存...`);
				
				const CONCURRENCY_DELETE = 20; // 同时删除的文件数
				for (let i = 0; i < filesToDelete.length; i += CONCURRENCY_DELETE) {
					const batch = filesToDelete.slice(i, Math.min(i + CONCURRENCY_DELETE, filesToDelete.length));
					
					const deleteResults = await Promise.all(
						batch.map(async (filePath) => {
							try {
								await this._execute('fileCache', 'delete', filePath);
								return true;
							} catch (error) {
								console.warn(`删除文件 ${filePath} 失败:`, error);
								return false;
							}
						})
					);
					
					deletedCount += deleteResults.filter(result => result === true).length;
				}
				
				console.log(`已删除 ${deletedCount} 个已不存在于远程仓库的文件`);
			}

			// 最终进度更新
			if (progressCallback) {
				progressCallback(100, totalFiles, totalFiles, null);
			}

			// 保存同步信息
			const syncInfo = {
				lastSync: new Date().toISOString(),
				repo: `${owner}/${repo}`,
				fileCount: allFiles.length,
				downloadedCount: downloadedCount,
				deletedCount: deletedCount
			};
			localStorage.setItem(`dipcp-sync-${repo}`, JSON.stringify(syncInfo));

			console.log(`仓库数据同步完成，共检查 ${allFiles.length} 个文件，下载 ${downloadedCount} 个文件，删除 ${deletedCount} 个文件`);
			return syncInfo;
		} catch (error) {
			console.error('同步仓库数据失败:', error);
			throw error;
		}
	}
};