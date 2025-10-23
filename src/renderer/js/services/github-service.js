// 简单的GitHub API服务
window.GitHubService = {
	baseUrl: 'https://api.github.com',

	async verifyUser(username) {
		try {
			const response = await fetch(`${this.baseUrl}/users/${username}`);
			if (!response.ok) {
				throw new Error(`Failed to verify user: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error('Error verifying user:', error);
			throw error;
		}
	},

	async verifyWithToken(token) {
		const response = await fetch(`${this.baseUrl}/user`, {
			method: 'GET',
			headers: {
				'Authorization': `token ${token}`,
				'Accept': 'application/vnd.github.v3+json',
				'User-Agent': 'SPCP-Client'
			}
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new Error('GitHub访问令牌无效或已过期，请检查Token是否正确或重新生成');
			}
			if (response.status === 403) {
				throw new Error('GitHub访问令牌权限不足，请检查Token权限设置');
			}
			throw new Error(`GitHub API错误: ${response.status}`);
		}

		const userData = await response.json();
		return {
			id: userData.id,
			username: userData.login,
			email: userData.email,
			avatarUrl: userData.avatar_url,
			name: userData.name,
			token: token // 保存token用于后续API调用
		};
	},

	async getRepositoryInfo(owner, repo) {
		try {
			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch repository info: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error('Error fetching repository info:', error);
			throw error;
		}
	},

	async getContributors(owner, repo) {
		try {
			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contributors`);
			if (!response.ok) {
				throw new Error(`Failed to fetch contributors: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error('Error fetching contributors:', error);
			throw error;
		}
	},

	async getFileList(owner, repo, path = '') {
		try {
			const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch file list: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error('Error fetching file list:', error);
			throw error;
		}
	},

	async getFileContent(owner, repo, path) {
		try {
			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch file content: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error('Error fetching file content:', error);
			throw error;
		}
	},

	async getCommitHistory(owner, repo, path = '') {
		try {
			let url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
			if (path) {
				url += `?path=${encodeURIComponent(path)}`;
			}
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch commit history: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			console.error('Error fetching commit history:', error);
			throw error;
		}
	},

	parseGitHubUrl(url) {
		try {
			const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
			if (match) {
				return {
					owner: match[1],
					repo: match[2].replace(/\.git$/, '')
				};
			}
			return null;
		} catch (error) {
			console.error('Error parsing GitHub URL:', error);
			return null;
		}
	},

	// 检查用户权限
	async checkUserPermission(owner, repo, username) {
		try {
			// 1. 检查是否为仓库所有者
			const repoInfo = await this.getRepositoryInfo(owner, repo);
			if (repoInfo.owner.login === username) {
				return { role: 'owner', hasPermission: true };
			}

			// 2. 检查是否为协作者
			const collaborators = await this.getCollaborators(owner, repo);
			const isCollaborator = collaborators.some(collab => collab.login === username);
			if (isCollaborator) {
				return { role: 'collaborator', hasPermission: true };
			}

			// 3. 检查是否有待处理的申请
			const pendingApplication = await this.checkPendingApplication(owner, repo, username);
			if (pendingApplication) {
				return { role: 'applicant', hasPermission: false, applicationStatus: 'pending' };
			}

			return { role: 'visitor', hasPermission: false };
		} catch (error) {
			console.error('Error checking user permission:', error);
			return { role: 'visitor', hasPermission: false, error: error.message };
		}
	},

	// 检查是否有待处理的申请
	async checkPendingApplication(owner, repo, username) {
		try {
			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues?state=open&labels=contribution-application&creator=${username}`);
			if (!response.ok) {
				return null;
			}
			const issues = await response.json();
			return issues.find(issue => issue.title.includes(`申请成为贡献者 - ${username}`));
		} catch (error) {
			console.error('Error checking pending application:', error);
			return null;
		}
	},

	// 获取Issues列表
	async getIssues(owner, repo, options = {}) {
		try {
			let url = `${this.baseUrl}/repos/${owner}/${repo}/issues`;
			const params = new URLSearchParams();

			// 添加查询参数
			if (options.state) params.append('state', options.state);
			if (options.labels) params.append('labels', options.labels);
			if (options.creator) params.append('creator', options.creator);
			if (options.sort) params.append('sort', options.sort);
			if (options.direction) params.append('direction', options.direction);
			if (options.per_page) params.append('per_page', options.per_page);

			if (params.toString()) {
				url += '?' + params.toString();
			}

			const response = await fetch(url, {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'User-Agent': 'SPCP-Client'
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch issues: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error fetching issues:', error);
			throw error;
		}
	},

	// 创建贡献者申请
	async createContributionApplication(owner, repo, username, email, reason = '', token = null) {
		try {
			console.log('createContributionApplication called with:', { owner, repo, username, email, reason, token });

			const title = `申请成为贡献者 - ${username}`;
			const body = `## 贡献者申请

**申请人：** ${username}
**邮箱：** ${email}
**申请时间：** ${new Date().toLocaleString('zh-CN')}

**申请理由：**
${reason || '希望为项目贡献代码，参与开发工作。'}

**申请状态：** 待审核

---
*此申请由 SPCP 系统自动创建*`;

			const headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/vnd.github.v3+json'
			};

			// 如果有token，添加认证头
			if (token) {
				headers['Authorization'] = `token ${token}`;
				console.log('Added authorization header with token:', token);
			} else {
				console.log('No token provided, making unauthenticated request');
			}

			console.log('Request headers:', headers);

			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify({
					title: title,
					body: body
					// 暂时移除labels，因为访客账户可能没有权限创建标签
					// labels: ['contribution-application']
				})
			});

			if (!response.ok) {
				// 尝试获取详细的错误信息
				let errorMessage = `Failed to create application: ${response.status}`;
				try {
					const errorData = await response.json();
					console.error('GitHub API Error Response:', errorData);
					if (errorData.message) {
						errorMessage += ` - ${errorData.message}`;
					}
					if (errorData.errors) {
						errorMessage += ` - Errors: ${JSON.stringify(errorData.errors)}`;
					}
				} catch (parseError) {
					console.error('Failed to parse error response:', parseError);
				}
				throw new Error(errorMessage);
			}

			const issue = await response.json();

			// 尝试自动添加协作者（如果token有足够权限）
			if (token) {
				try {
					await this.autoAddCollaborator(owner, repo, username, token);
					console.log(`Successfully added ${username} as collaborator`);

					// 更新issue状态为已批准
					await this.updateIssueStatus(owner, repo, issue.number, 'approved', token);
				} catch (collaboratorError) {
					console.log('Could not auto-add collaborator (insufficient permissions):', collaboratorError.message);
					// 不抛出错误，因为创建issue已经成功了
				}
			}

			return issue;
		} catch (error) {
			console.error('Error creating contribution application:', error);

			// 尝试获取更详细的错误信息
			if (error.response) {
				console.error('Response status:', error.response.status);
				console.error('Response data:', error.response.data);
			}

			throw error;
		}
	},

	// 自动添加协作者
	async autoAddCollaborator(owner, repo, username, token) {
		const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/collaborators/${username}`, {
			method: 'PUT',
			headers: {
				'Authorization': `token ${token}`,
				'Accept': 'application/vnd.github.v3+json'
			},
			body: JSON.stringify({
				permission: 'push' // 给予推送权限
			})
		});

		if (!response.ok) {
			throw new Error(`Failed to add collaborator: ${response.status}`);
		}

		return await response.json();
	},

	// 更新issue状态
	async updateIssueStatus(owner, repo, issueNumber, status, token) {
		const labels = status === 'approved' ? ['approved', 'contribution-approved'] : ['rejected', 'contribution-rejected'];

		// 添加标签
		await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}/labels`, {
			method: 'POST',
			headers: {
				'Authorization': `token ${token}`,
				'Accept': 'application/vnd.github.v3+json'
			},
			body: JSON.stringify({
				labels: labels
			})
		});

		// 关闭issue
		await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${issueNumber}`, {
			method: 'PATCH',
			headers: {
				'Authorization': `token ${token}`,
				'Accept': 'application/vnd.github.v3+json'
			},
			body: JSON.stringify({
				state: 'closed'
			})
		});
	},

	// 获取仓库信息
	async getRepository(owner, repo, token) {
		const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
			headers: {
				'Authorization': `token ${token}`,
				'Accept': 'application/vnd.github.v3+json'
			}
		});

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('仓库不存在，请检查仓库地址是否正确');
			}
			throw new Error(`Failed to fetch repository: ${response.status}`);
		}

		return await response.json();
	},

	// 获取协作者列表
	async getCollaborators(owner, repo, token) {
		const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/collaborators`, {
			headers: {
				'Authorization': `token ${token}`,
				'Accept': 'application/vnd.github.v3+json'
			}
		});

		if (!response.ok) {
			if (response.status === 403) {
				// Token权限不足，无法获取协作者列表，返回空数组表示访客
				return [];
			}
			throw new Error(`Failed to fetch collaborators: ${response.status}`);
		}

		return await response.json();
	},

	// 检查文件是否存在
	async fileExists(owner, repo, path, token) {
		try {
			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
				headers: {
					'Authorization': `token ${token}`,
					'Accept': 'application/vnd.github.v3+json'
				}
			});

			// 404表示文件不存在，这是正常情况，不需要记录错误
			if (response.status === 404) {
				return false;
			}

			// 其他错误才记录
			if (!response.ok) {
				console.error(`Error checking file existence: ${response.status} ${response.statusText}`);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error checking file existence:', error);
			return false;
		}
	},

	// 创建文件
	async createFile(owner, repo, path, content, message, token) {
		try {
			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
				method: 'PUT',
				headers: {
					'Authorization': `token ${token}`,
					'Accept': 'application/vnd.github.v3+json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: message,
					content: btoa(unescape(encodeURIComponent(content))),
					branch: 'main'
				})
			});

			if (!response.ok) {
				throw new Error(`Failed to create file: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error creating file:', error);
			throw error;
		}
	},

	// 获取最新提交信息
	async getLatestCommit(owner, repo) {
		try {
			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/commits?per_page=1`);
			if (!response.ok) {
				throw new Error(`GitHub API错误: ${response.status}`);
			}

			const commits = await response.json();
			if (commits.length === 0) {
				return null;
			}

			const commit = commits[0];
			return {
				sha: commit.sha,
				message: commit.commit.message.split('\n')[0], // 只取第一行
				author: commit.commit.author.name,
				date: commit.commit.author.date
			};
		} catch (error) {
			console.error('获取最新提交失败:', error);
			throw error;
		}
	},

	// 同步仓库数据到本地缓存
	async syncRepositoryData(owner, repo, token, progressCallback = null) {
		try {
			console.log(`开始同步仓库数据: ${owner}/${repo}`);

			// 初始化数据库
			if (window.StorageService) {
				await window.StorageService.initDB();
			}

			// 获取仓库文件列表
			const files = await this.getFileList(owner, repo);
			console.log(`获取到 ${files.length} 个文件`);

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
					const fileData = await this.getFileContent(owner, repo, file.path);

					// 检查是否有内容
					if (fileData.content) {
						try {
							// 尝试解码base64内容
							const content = atob(fileData.content);

							// 保存到fileCache
							await window.StorageService._execute('fileCache', 'put', {
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
	},

	// 提取GitHub仓库信息
	extractRepoInfo(url) {
		const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
		if (match) {
			return {
				owner: match[1],
				repo: match[2].replace('.git', '')
			};
		}
		return null;
	},

	// 检查字符串是否为有效的base64
	isValidBase64(str) {
		try {
			// 检查是否只包含base64字符
			const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
			if (!base64Regex.test(str)) {
				return false;
			}
			// 尝试解码
			atob(str);
			return true;
		} catch (error) {
			return false;
		}
	},

	/**
	 * 删除文件
	 */
	async deleteFile(owner, repo, path, message, token) {
		try {
			// 首先获取文件的SHA
			const fileInfo = await this.getFileContent(owner, repo, path, token);

			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/vnd.github.v3+json',
					'Authorization': `token ${token}`
				},
				body: JSON.stringify({
					message: message || `Delete ${path}`,
					sha: fileInfo.sha
				})
			});

			if (!response.ok) {
				throw new Error(`Failed to delete file: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error deleting file:', error);
			throw error;
		}
	},

	// 轮询检查GitHub Actions工作流状态
	async pollWorkflowStatus(owner, repo, issueNumber, token, maxAttempts = 30) {
		console.log(`开始轮询工作流状态: ${owner}/${repo}, Issue #${issueNumber}`);

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				// 等待5秒
				await new Promise(resolve => setTimeout(resolve, 5000));

				// 检查工作流运行状态
				const workflowRuns = await this.getWorkflowRuns(owner, repo, token);
				const relevantRun = workflowRuns.find(run =>
					run.head_branch === 'main' &&
					run.display_title &&
					run.display_title.includes(`申请成为贡献者`) &&
					run.created_at > new Date(Date.now() - 5 * 60 * 1000).toISOString() // 最近5分钟内的运行
				);

				if (relevantRun) {
					console.log(`找到相关工作流运行: ${relevantRun.status}`);

					if (relevantRun.status === 'completed') {
						if (relevantRun.conclusion === 'success') {
							console.log('工作流执行成功');
							return { success: true, run: relevantRun };
						} else {
							console.log(`工作流执行失败: ${relevantRun.conclusion}`);
							return { success: false, error: `工作流执行失败: ${relevantRun.conclusion}` };
						}
					} else if (relevantRun.status === 'in_progress' || relevantRun.status === 'queued') {
						console.log(`工作流仍在执行中: ${relevantRun.status} (尝试 ${attempt}/${maxAttempts})`);
						continue;
					}
				}

				console.log(`第 ${attempt} 次轮询，未找到相关工作流运行`);

			} catch (error) {
				console.error(`轮询第 ${attempt} 次时出错:`, error);
				if (attempt === maxAttempts) {
					throw error;
				}
			}
		}

		throw new Error('轮询超时，未找到工作流执行结果');
	},

	// 获取工作流运行列表
	async getWorkflowRuns(owner, repo, token) {
		try {
			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/actions/runs`, {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'Authorization': `token ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to get workflow runs: ${response.status}`);
			}

			const data = await response.json();
			return data.workflow_runs || [];
		} catch (error) {
			console.error('Error getting workflow runs:', error);
			throw error;
		}
	},

	// 自动接受协作者邀请
	async acceptCollaboratorInvitation(owner, repo, token) {
		try {
			console.log(`尝试接受协作者邀请: ${owner}/${repo}`);

			// 获取用户自己的邀请列表（不是仓库的邀请列表）
			const invitations = await this.getUserInvitations(token);
			const pendingInvitation = invitations.find(inv =>
				inv.repository.full_name === `${owner}/${repo}` &&
				inv.state === 'pending'
			);

			if (!pendingInvitation) {
				console.log('没有找到待处理的邀请');
				return { success: false, message: '没有找到待处理的邀请' };
			}

			// 接受邀请
			const response = await fetch(`${this.baseUrl}/user/repository_invitations/${pendingInvitation.id}`, {
				method: 'PATCH',
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'Authorization': `token ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to accept invitation: ${response.status}`);
			}

			console.log('协作者邀请已接受');
			return { success: true, invitation: pendingInvitation };
		} catch (error) {
			console.error('Error accepting invitation:', error);
			throw error;
		}
	},

	// 获取用户自己的邀请列表
	async getUserInvitations(token) {
		try {
			console.log('获取用户自己的邀请列表');
			const response = await fetch(`${this.baseUrl}/user/repository_invitations`, {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'Authorization': `token ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to get user invitations: ${response.status}`);
			}

			const invitations = await response.json();
			console.log(`找到 ${invitations.length} 个邀请`);
			return invitations;
		} catch (error) {
			console.error('Error getting user invitations:', error);
			throw error;
		}
	},

	// 获取仓库邀请列表
	async getRepositoryInvitations(owner, repo, token) {
		try {
			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/invitations`, {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'Authorization': `token ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to get invitations: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error getting invitations:', error);
			throw error;
		}
	},

	// 检查用户是否为协作者
	async checkCollaboratorStatus(owner, repo, username, token) {
		try {
			console.log(`检查协作者状态: ${username} 在 ${owner}/${repo}`);

			const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/collaborators/${username}`, {
				headers: {
					'Accept': 'application/vnd.github.v3+json',
					'Authorization': `token ${token}`
				}
			});

			console.log(`协作者状态检查响应: ${response.status}`);

			if (response.ok) {
				console.log(`${username} 是协作者`);
				return true;
			} else if (response.status === 404) {
				console.log(`${username} 不是协作者`);
				return false;
			} else {
				console.log(`协作者状态检查失败: ${response.status}`);
				return false;
			}
		} catch (error) {
			console.error('Error checking collaborator status:', error);
			return false;
		}
	},

	/**
	 * 获取用户信息
	 */
	async getUserInfo(username, token) {
		const response = await fetch(`${this.baseUrl}/users/${username}`, {
			headers: {
				'Authorization': `token ${token}`,
				'Accept': 'application/vnd.github.v3+json'
			}
		});

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('用户不存在');
			}
			throw new Error(`Failed to fetch user info: ${response.status}`);
		}

		return await response.json();
	},

	/**
	 * 获取用户的仓库列表
	 */
	async getUserRepos(username, token) {
		const response = await fetch(`${this.baseUrl}/users/${username}/repos?sort=updated&per_page=100`, {
			headers: {
				'Authorization': `token ${token}`,
				'Accept': 'application/vnd.github.v3+json'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch user repos: ${response.status}`);
		}

		return await response.json();
	},

	/**
	 * 获取用户的事件列表
	 */
	async getUserEvents(username, token) {
		const response = await fetch(`${this.baseUrl}/users/${username}/events?per_page=30`, {
			headers: {
				'Authorization': `token ${token}`,
				'Accept': 'application/vnd.github.v3+json'
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch user events: ${response.status}`);
		}

		return await response.json();
	}
};