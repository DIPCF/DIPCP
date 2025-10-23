const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
	// 应用信息
	getAppVersion: () => ipcRenderer.invoke('get-app-version'),
	getPlatform: () => ipcRenderer.invoke('get-platform'),

	// Git配置
	getGitConfig: () => ipcRenderer.invoke('get-git-config'),

	// 仓库操作
	cloneRepository: (repositoryUrl) => ipcRenderer.invoke('clone-repository', repositoryUrl),

	// 菜单事件监听
	onMenuNewProject: (callback) => ipcRenderer.on('menu-new-project', callback),
	onMenuOpenProject: (callback) => ipcRenderer.on('menu-open-project', callback),
	onMenuAbout: (callback) => ipcRenderer.on('menu-about', callback),

	// 移除监听器
	removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})
