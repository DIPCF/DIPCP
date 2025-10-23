const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')
const isDev = process.env.NODE_ENV === 'development'

const execAsync = promisify(exec)

let mainWindow

function createWindow() {
	// 创建浏览器窗口
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false,
			preload: path.join(__dirname, 'preload.js'),
			webSecurity: true,
			allowRunningInsecureContent: false
		},
		titleBarStyle: 'default',
		show: false
	})

	// 加载应用
	if (isDev) {
		mainWindow.loadURL('http://localhost:3000')
		mainWindow.webContents.openDevTools()
	} else {
		mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
	}

	// 窗口准备好后显示
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	})

	// 窗口关闭时的处理
	mainWindow.on('closed', () => {
		mainWindow = null
	})
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
	createWindow()

	// 设置应用菜单
	createMenu()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

// 创建应用菜单
function createMenu() {
	const template = [
		{
			label: '文件',
			submenu: [
				{
					label: '新建项目',
					accelerator: 'CmdOrCtrl+N',
					click: () => {
						mainWindow.webContents.send('menu-new-project')
					}
				},
				{
					label: '打开项目',
					accelerator: 'CmdOrCtrl+O',
					click: () => {
						mainWindow.webContents.send('menu-open-project')
					}
				},
				{ type: 'separator' },
				{
					label: '退出',
					accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
					click: () => {
						app.quit()
					}
				}
			]
		},
		{
			label: '编辑',
			submenu: [
				{ label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
				{ label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
				{ type: 'separator' },
				{ label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
				{ label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
				{ label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
			]
		},
		{
			label: '视图',
			submenu: [
				{ label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
				{ label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
				{ label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
				{ type: 'separator' },
				{ label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
				{ label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
				{ label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
				{ type: 'separator' },
				{ label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
			]
		},
		{
			label: '帮助',
			submenu: [
				{
					label: '关于SPCP',
					click: () => {
						mainWindow.webContents.send('menu-about')
					}
				}
			]
		}
	]

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

// IPC 通信处理
ipcMain.handle('get-app-version', () => {
	return app.getVersion()
})

ipcMain.handle('get-platform', () => {
	return process.platform
})

// 获取Git配置信息
ipcMain.handle('get-git-config', async () => {
	try {
		// 获取Git用户名
		const { stdout: username } = await execAsync('git config --global user.name')

		// 获取Git邮箱
		const { stdout: email } = await execAsync('git config --global user.email')

		// 检查是否配置了Git
		if (!username.trim() || !email.trim()) {
			throw new Error('Git用户信息未配置')
		}

		return {
			username: username.trim(),
			email: email.trim()
		}
	} catch (error) {
		console.error('Failed to get Git config:', error)
		throw new Error('无法获取Git配置信息，请确保已安装并配置Git')
	}
})

// 克隆仓库
ipcMain.handle('clone-repository', async (event, repositoryUrl) => {
	try {
		// 解析仓库URL获取仓库名
		const repoName = repositoryUrl.split('/').pop().replace('.git', '')
		const clonePath = path.join(app.getPath('userData'), 'repositories', repoName)

		// 检查目录是否已存在
		const fs = require('fs')
		if (fs.existsSync(clonePath)) {
			// 如果目录已存在，先删除
			fs.rmSync(clonePath, { recursive: true, force: true })
		}

		// 确保目录存在
		fs.mkdirSync(path.dirname(clonePath), { recursive: true })

		// 克隆仓库
		await execAsync(`git clone ${repositoryUrl} "${clonePath}"`)

		// 配置Git用户信息（如果还没有配置）
		await execAsync(`git config user.name "SPCP User"`, { cwd: clonePath })
		await execAsync(`git config user.email "spcp@example.com"`, { cwd: clonePath })

		return {
			success: true,
			path: clonePath,
			repositoryUrl: repositoryUrl
		}
	} catch (error) {
		console.error('Failed to clone repository:', error)
		throw new Error(`仓库克隆失败：${error.message}`)
	}
})

