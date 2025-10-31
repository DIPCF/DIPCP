/**
 * 登录页面组件
 * 完全组件化的登录页面
 * @class
 * @extends {BasePage}
 */
class LoginPage extends BasePage {
	/**
	 * 构造函数
	 * @param {Object} props - 组件属性
	 * @param {Object} props.state - 初始状态
	 */
	constructor(props = {}) {
		super(props);
		this.state = {
			language: window.I18nService ? window.I18nService.currentLanguage : 'zh-CN',
			formData: {
				username: '',
				accessToken: ''
			},
			loading: false,
		};

		// 确保主题在LoginPage渲染时被应用
		this.initTheme();

		// 加载保存的用户信息
		this.loadSavedCredentials();
	}

	/**
	 * 初始化主题
	 */
	initTheme() {
		// 如果ThemeService存在，初始化并应用主题
		if (window.ThemeService) {
			window.ThemeService.init();
		}
	}

	/**
	 * 渲染页面主容器
	 * @returns {HTMLElement} 登录页面的容器元素
	 */
	render() {
		const container = document.createElement('div');
		container.className = 'login-container';
		container.innerHTML = `
			${this.renderLogo()}
			${this.renderFeatures()}
			${this.renderLoginForm()}
			${this.renderTips()}
		`;
		return container;
	}

	/**
	 * 渲染Logo部分
	 * @returns {string} Logo的HTML字符串
	 */
	renderLogo() {
		return `
            <div class="logo">
                <h1>DIPCP</h1>
                <p class="subtitle">${this.t('login.subtitle')}</p>
            </div>
        `;
	}

	/**
	 * 渲染特性说明部分
	 * @returns {string} 特性说明的HTML字符串
	 */
	renderFeatures() {
		return `
            <div class="features">
                <h3>${this.t('login.whyChoose')}</h3>
                <ul>
                    <li>${this.t('login.feature1')}</li>
                    <li>${this.t('login.feature2')}</li>
                    <li>${this.t('login.feature3')}</li>
                    <li>${this.t('login.feature4')}</li>
                </ul>
            </div>
        `;
	}

	/**
	 * 渲染登录表单
	 * @returns {string} 登录表单的HTML字符串
	 */
	renderLoginForm() {
		return `
            <div class="login-form">
                ${this.renderLanguageSelector()}
                ${this.renderFormGroups()}
                ${this.renderLoginButton()}
            </div>
        `;
	}

	/**
	 * 渲染语言选择器
	 * @returns {string} 语言选择器的HTML字符串
	 */
	renderLanguageSelector() {
		const options = window.I18nService.supportedLanguages.map(lang => {
			const isSelected = this.state.language === lang ? 'selected' : '';
			const displayName = window.I18nService.getLanguageDisplayName(lang);
			return `<option value="${lang}" ${isSelected}>${displayName}</option>`;
		}).join('');

		return `
            <div class="form-group">
                <select id="language-select" aria-label="选择语言">
                    ${options}
                </select>
            </div>
        `;
	}

	/**
	 * 渲染表单输入组
	 * @returns {string} 表单输入组的HTML字符串
	 */
	renderFormGroups() {
		return `
            <div class="form-group">
                <div class="input-with-help">
                    <input type="text" id="github-username" 
                        placeholder="${this.t('login.placeholders.githubUsername')}" 
                        value="${this.state.formData.username}" required>
                    <button type="button" class="help-button" id="register-help-btn">${this.t('login.howToRegister')}</button>
                </div>
            </div>

            <div class="form-group">
                <div class="input-with-help">
                    <input type="password" id="access-token" 
                        placeholder="${this.t('login.placeholders.accessToken')}" 
                        value="${this.state.formData.accessToken}" required>
                    <button type="button" class="help-button" id="token-help-btn">${this.t('login.howToGetToken')}</button>
                </div>
            </div>
        `;
	}


	/**
	 * 渲染登录按钮
	 * @returns {string} 登录按钮的HTML字符串
	 */
	renderLoginButton() {
		const loadingClass = this.state.loading ? 'loading' : '';
		const disabledAttr = this.state.loading ? 'disabled' : '';

		return `
            <div class="login-button-container">
                <button id="login-btn" class="btn btn-primary ${loadingClass}" ${disabledAttr}>
                    <span class="btn-text">${this.state.loading ? this.t('login.loggingIn', '登录中...') : this.t('login.loginButton', '登录')}</span>
                    <span class="btn-loading" style="display: none;">${this.t('login.loggingIn', '登录中...')}</span>
                </button>
            </div>
        `;
	}

	/**
	 * 渲染提示信息
	 * @returns {string} 提示信息的HTML字符串
	 */
	renderTips() {
		return `
            <div class="tips">
                <p>${this.t('login.terms')} <a href="#" id="terms-link">${this.t('login.termsLink')}</a> ${this.t('login.and')} <a href="#" id="privacy-link">${this.t('login.privacyLink')}</a></p>
            </div>
        `;
	}

	/**
	 * 挂载组件到DOM
	 * @param {HTMLElement} element - 挂载的容器元素
	 */
	mount(element) {
		this.element = element;
		this.element.innerHTML = '';
		this.element.appendChild(this.render());
		this.bindEvents();
	}

	/**
	 * 绑定事件监听器
	 */
	bindEvents() {
		// 语言选择
		const languageSelect = this.element.querySelector('#language-select');
		if (languageSelect) {
			languageSelect.addEventListener('change', async (e) => {
				const newLanguage = e.target.value;
				console.log('LoginPage: 语言切换为', newLanguage);
				await this.setLanguage(newLanguage);
			});
		}

		// 登录按钮
		const loginBtn = this.element.querySelector('#login-btn');
		if (loginBtn) {
			loginBtn.addEventListener('click', () => {
				this.handleLogin();
			});
		}

		// 注册帮助按钮
		const registerHelpBtn = this.element.querySelector('#register-help-btn');
		if (registerHelpBtn) {
			registerHelpBtn.addEventListener('click', () => {
				this.showRegisterHelp();
			});
		}

		// Token帮助按钮
		const tokenHelpBtn = this.element.querySelector('#token-help-btn');
		if (tokenHelpBtn) {
			tokenHelpBtn.addEventListener('click', () => {
				this.showTokenHelp();
			});
		}

		// 服务条款和隐私政策链接
		const termsLink = this.element.querySelector('#terms-link');
		if (termsLink) {
			termsLink.addEventListener('click', (e) => {
				e.preventDefault();
				if (window.app && window.app.navigateTo) {
					window.app.navigateTo('/terms');
				}
			});
		}

		const privacyLink = this.element.querySelector('#privacy-link');
		if (privacyLink) {
			privacyLink.addEventListener('click', (e) => {
				e.preventDefault();
				if (window.app && window.app.navigateTo) {
					window.app.navigateTo('/privacy');
				}
			});
		}

		// 表单输入
		const inputs = this.element.querySelectorAll('input');
		inputs.forEach(input => {
			input.addEventListener('input', (e) => {
				let fieldName = e.target.id.replace('github-', '');
				// 处理access-token字段
				if (e.target.id === 'access-token') {
					fieldName = 'accessToken';
				}
				this.state.formData[fieldName] = e.target.value;
			});
		});
	}

	/**
	 * 处理登录操作
	 * @async
	 */
	async handleLogin() {
		if (this.state.loading) return;

		try {
			this.setState({ loading: true });
			// 立即禁用按钮
			this.updateLoginButtonState('loading', this.t('login.loggingIn', '登录中...'));

			// 确保formData存在
			const formData = this.state.formData || {};
			await this.performLogin(formData);
		} catch (error) {
			this.showError(error.message);
			// 登录失败时恢复按钮状态
			this.updateLoginButtonState('default', this.t('login.loginButton', '登录'));
		} finally {
			this.setState({ loading: false });
		}
	}

	/**
	 * 显示错误消息
	 * @param {string} message - 错误消息内容
	 */
	showError(message) {
		const errorDiv = document.createElement('div');
		errorDiv.className = 'error-message';
		errorDiv.textContent = message;
		errorDiv.style.cssText = 'color: red; margin-top: 10px; padding: 10px; background: #ffe6e6; border: 1px solid #ff9999; border-radius: 4px;';
		this.element.querySelector('.login-form').appendChild(errorDiv);
		setTimeout(() => errorDiv.remove(), 5000);
	}

	/**
	 * 显示注册帮助信息
	 */
	showRegisterHelp() {
		const modal = new window.Modal();
		modal.setState({
			show: true,
			type: 'info',
			title: this.t('login.registerHelpTitle'),
			message: this.t('login.registerHelpContent'),
			showCancel: false,
			confirmText: this.t('common.close')
		});
		const modalElement = modal.render();
		modal.element = modalElement; // 设置element引用
		document.body.appendChild(modalElement);
		modal.bindEvents();
	}

	/**
	 * 显示Token获取帮助信息
	 */
	showTokenHelp() {
		const modal = new window.Modal();
		modal.setState({
			show: true,
			type: 'info',
			title: this.t('login.tokenHelpTitle'),
			message: this.t('login.tokenHelpContent'),
			showCancel: false,
			confirmText: this.t('common.close')
		});
		const modalElement = modal.render();
		modal.element = modalElement; // 设置element引用
		document.body.appendChild(modalElement);
		modal.bindEvents();
	}

	/**
	 * 设置语言并重新渲染页面
	 * @async
	 * @param {string} language - 语言代码（如 'zh-CN', 'en-US', 'ja-JP'）
	 */
	async setLanguage(language) {
		// 更新本地状态
		this.setState({ language });

		// 保存语言设置到 localStorage
		localStorage.setItem('dipcp-language', language);

		// 通知 i18n 服务切换语言
		if (window.I18nService) {
			await window.I18nService.changeLanguage(language);
		}

		// 重新挂载页面以更新文本
		if (this.element) {
			// 保存当前表单值
			const formData = { ...this.state.formData };
			const githubUsername = this.element.querySelector('#github-username');
			const accessToken = this.element.querySelector('#access-token');
			const repositoryUrl = this.element.querySelector('#repository-url');

			if (githubUsername) formData.username = githubUsername.value;
			if (accessToken) formData.accessToken = accessToken.value;
			if (repositoryUrl) formData.repositoryUrl = repositoryUrl.value;

			// 更新 state
			this.setState({ formData });

			// 清空容器并重新挂载
			this.element.innerHTML = '';
			this.element.appendChild(this.render());

			// 恢复表单值
			if (formData.username) {
				const usernameInput = this.element.querySelector('#github-username');
				if (usernameInput) usernameInput.value = formData.username;
			}
			if (formData.accessToken) {
				const tokenInput = this.element.querySelector('#access-token');
				if (tokenInput) tokenInput.value = formData.accessToken;
			}
			if (formData.repositoryUrl) {
				const repoInput = this.element.querySelector('#repository-url');
				if (repoInput) repoInput.value = formData.repositoryUrl;
			}

			// 重新绑定事件
			this.bindEvents();
		}
	}

	/**
	 * 执行登录流程
	 * @async
	 * @param {Object} formData - 表单数据
	 * @param {string} formData.username - GitHub用户名
	 * @param {string} formData.accessToken - GitHub访问令牌
	 */
	async performLogin(formData) {
		// 验证必填字段
		if (!formData || !formData.username || !formData.accessToken) {
			throw new Error(this.t('login.validation.formInvalid', '请填写所有必填字段'));
		}

		// 验证GitHub Access Token
		console.log('验证GitHub Access Token...');
		let userInfo;

		// 使用Octokit验证用户
		const octokit = new window.Octokit({ auth: formData.accessToken });
		let data;
		try {
			const response = await octokit.rest.users.getAuthenticated();
			data = response.data;
		} catch (error) {
			if (error.status === 401) {
				throw new Error(this.t('login.validation.invalidToken', 'GitHub Access Token无效或已过期，请检查您的Token是否正确'));
			}
			throw error;
		}
		userInfo = {
			username: data.login,
			email: data.email,
			avatarUrl: data.avatar_url,
			name: data.name
		};

		// 验证用户名是否匹配
		if (userInfo.username !== formData.username) {
			throw new Error(this.t('login.validation.usernameMismatch', `用户名不匹配：Token对应的用户是"${userInfo.username}"，但您输入的是"${formData.username}"`)
				.replace('{tokenUser}', userInfo.username)
				.replace('{inputUser}', formData.username));
		}

		// 保存用户信息
		const userInfoToSave = {
			...userInfo,
			token: formData.accessToken,
			loginTime: new Date().toISOString()
		};
		localStorage.setItem('dipcp-user', JSON.stringify(userInfoToSave));
		console.log('用户信息已保存');

		// 更新app状态
		if (window.app) {
			window.app.state.user = userInfoToSave;
			window.app.state.isAuthenticated = true;
			console.log('App状态已更新');
		}

		// 保存凭据（总是保存）
		this.saveCredentials(formData);

		// 直接跳转到仓库选择页面
		if (window.app && window.app.navigateTo) {
			window.app.navigateTo('/repository-selection');
		}
	}



	/**
	 * 更新登录按钮状态
	 * @param {string} state - 按钮状态（'loading', 'default'等）
	 * @param {string} message - 按钮显示的消息
	 * @returns {void}
	 */
	updateLoginButtonState(state, message) {
		const loginBtn = this.element.querySelector('#login-btn');
		if (!loginBtn) return;

		// 移除之前的状态类
		loginBtn.classList.remove('loading', 'success', 'error');

		// 添加新的状态类
		if (state !== 'default') {
			loginBtn.classList.add(state);
		}

		// 更新按钮文本和状态
		switch (state) {
			case 'loading':
				loginBtn.disabled = true;
				loginBtn.innerHTML = `⏳ ${message}`;
				break;
			case 'success':
				loginBtn.disabled = true;
				loginBtn.innerHTML = `✅ ${message}`;
				break;
			case 'error':
				loginBtn.disabled = true;
				loginBtn.innerHTML = `❌ ${message}`;
				break;
			default:
				loginBtn.disabled = false;
				loginBtn.innerHTML = `<span class="btn-text">${this.t('login.loginButton', '登录')}</span>`;
		}
	}

	/**
	 * 保存用户凭据
	 * @param {Object} formData - 表单数据
	 */
	saveCredentials(formData) {
		const credentials = {
			username: formData.username,
			accessToken: formData.accessToken,
			savedAt: new Date().toISOString()
		};
		localStorage.setItem('dipcp-saved-credentials', JSON.stringify(credentials));
		console.log('用户凭据已保存');
	}


	/**
	 * 加载保存的凭据
	 */
	loadSavedCredentials() {
		try {
			const savedCredentials = localStorage.getItem('dipcp-saved-credentials');
			if (savedCredentials) {
				const credentials = JSON.parse(savedCredentials);
				this.setState({
					formData: {
						username: credentials.username || '',
						accessToken: credentials.accessToken || ''
					}
				});
				console.log('已加载保存的凭据');
			}
		} catch (error) {
			console.warn('加载保存的凭据失败:', error);
		}
	}


	/**
	 * 销毁组件
	 * 清理资源并移除DOM元素
	 */
	destroy() {
		// 清理资源
		if (this.element) {
			this.element.innerHTML = '';
		}
	}
}

// 注册组件
window.LoginPage = LoginPage;
