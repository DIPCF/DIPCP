/**
 * 设置页面组件示例
 * 展示如何使用新的组件系统重构settings.html
 */
class SettingsPageExample extends Component {
    constructor(props = {}) {
        super(props);
        this.state = {
            user: props.user || null,
            language: props.language || 'zh-CN',
            theme: props.theme || 'light',
            onLanguageChange: props.onLanguageChange || null,
            onThemeChange: props.onThemeChange || null,
            onLogout: props.onLogout || null
        };
    }

    render() {
        return `
            <div class="dashboard">
                ${this.renderHeader()}
                <div class="content">
                    <div class="settings-container">
                        ${this.renderLanguageSection()}
                        ${this.renderThemeSection()}
                        ${this.renderAccountSection()}
                        ${this.renderNotificationsSection()}
                    </div>
                </div>
            </div>
        `;
    }

    renderHeader() {
        const headerComponent = new Header({
            title: 'SPCP',
            showUserInfo: true,
            user: this.state.user,
            currentPage: 'settings',
            onLogout: this.state.onLogout,
            onBack: () => window.location.href = 'dashboard.html'
        });
        return headerComponent.render();
    }

    renderLanguageSection() {
        const languageSection = new SettingsSection({
            titleKey: 'settings.language',
            children: [
                new SettingItem({
                    labelKey: 'settings.selectLanguage',
                    type: 'select',
                    value: this.state.language,
                    options: [
                        { value: 'zh-CN', text: '中文', key: 'settings.chinese' },
                        { value: 'en-US', text: 'English', key: 'settings.english' }
                    ],
                    onChange: (value) => {
                        this.setState({ language: value });
                        if (this.state.onLanguageChange) {
                            this.state.onLanguageChange(value);
                        }
                    }
                })
            ]
        });
        return languageSection.render();
    }

    renderThemeSection() {
        const themeSection = new SettingsSection({
            titleKey: 'settings.theme.title',
            children: [
                new ThemeOption({
                    theme: 'light',
                    nameKey: 'common.light',
                    descriptionKey: 'settings.theme.lightDesc',
                    selected: this.state.theme === 'light',
                    onClick: (theme) => {
                        this.setState({ theme });
                        if (this.state.onThemeChange) {
                            this.state.onThemeChange(theme);
                        }
                    }
                }),
                new ThemeOption({
                    theme: 'dark',
                    nameKey: 'common.dark',
                    descriptionKey: 'settings.theme.darkDesc',
                    selected: this.state.theme === 'dark',
                    onClick: (theme) => {
                        this.setState({ theme });
                        if (this.state.onThemeChange) {
                            this.state.onThemeChange(theme);
                        }
                    }
                })
            ]
        });
        return themeSection.render();
    }

    renderAccountSection() {
        const accountSection = new SettingsSection({
            titleKey: 'settings.account',
            children: [
                new SettingItem({
                    labelKey: 'login.githubUsername',
                    type: 'text',
                    value: this.state.user?.username || '',
                    readonly: true
                }),
                new SettingItem({
                    labelKey: 'login.githubEmail',
                    type: 'text',
                    value: this.state.user?.email || '',
                    readonly: true
                })
            ]
        });
        return accountSection.render();
    }

    renderNotificationsSection() {
        const notificationsSection = new SettingsSection({
            titleKey: 'settings.notifications',
            children: [
                new SettingItem({
                    type: 'checkbox',
                    labelKey: 'settings.emailNotifications',
                    value: true
                }),
                new SettingItem({
                    type: 'checkbox',
                    labelKey: 'settings.systemNotifications',
                    value: true
                })
            ]
        });
        return notificationsSection.render();
    }

    bindEvents() {
        // 组件内部的事件绑定由各个子组件处理
        // 这里可以添加页面级别的事件绑定
    }

    updateUser(user) {
        this.setState({ user });
        this.update();
    }

    updateLanguage(language) {
        this.setState({ language });
        this.update();
    }

    updateTheme(theme) {
        this.setState({ theme });
        this.update();
    }
}
