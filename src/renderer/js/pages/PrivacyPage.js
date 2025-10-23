/**
 * 隐私政策页面组件
 * 完全组件化的隐私政策页面
 */
class PrivacyPage extends BasePage {
	constructor(props = {}) {
		super(props);
		this.state = {
			language: props.language || 'zh-CN',
			onBack: props.onBack || null
		};

		// 监听语言变化事件
		this.handleLanguageChange = this.handleLanguageChange.bind(this);
	}

	handleLanguageChange() {
		// 语言变化时重新渲染页面
		this.rerender();
	}

	mount(element) {
		super.mount(element);
		this.bindEvents();

		// 添加语言变化监听器
		document.addEventListener('languageChanged', this.handleLanguageChange);
	}

	destroy() {
		// 移除语言变化监听器
		document.removeEventListener('languageChanged', this.handleLanguageChange);
		super.destroy();
	}

	render() {
		const container = document.createElement('div');
		container.className = 'legal-container';
		container.innerHTML = `
			${this.renderHeader()}
			${this.renderContent()}
			${this.renderFooter()}
		`;
		return container;
	}

	renderHeader() {
		return `
            <div class="legal-header">
                <h1 class="legal-title">${this.t('privacy.title', '隐私政策')}</h1>
                <p class="legal-subtitle">${this.t('privacy.subtitle', 'SPCP (Serverless Project Contribution Platform) 隐私保护说明')}</p>
                <p class="legal-subtitle">${this.t('privacy.lastUpdated', '最后更新：2025年10月22日')}</p>
            </div>
        `;
	}

	renderContent() {
		return `
            <div class="legal-content">
                ${this.renderImportantNotice()}
                ${this.renderTransparencyPrinciple()}
                ${this.renderSection1()}
                ${this.renderSection2()}
                ${this.renderSection3()}
                ${this.renderSection4()}
                ${this.renderSection5()}
                ${this.renderSection6()}
                ${this.renderSection7()}
                ${this.renderSection8()}
                ${this.renderSection9()}
                ${this.renderSection10()}
                ${this.renderSection11()}
            </div>
        `;
	}

	renderImportantNotice() {
		return `
            <div class="highlight">
                <p>
                    <strong>${this.t('privacy.importantNoticeTitle', '重要提示：')}</strong>
                    <span>${this.t('privacy.importantNoticeContent', 'SPCP是一个完全透明的无服务器协作平台。本隐私政策说明了我们如何处理您的信息，以及您在使用平台时的隐私权利。')}</span>
                </p>
            </div>
        `;
	}

	renderTransparencyPrinciple() {
		return `
            <div class="transparency">
                <p>
                    <strong>${this.t('privacy.transparencyPrincipleTitle', '透明度原则：')}</strong>
                    <span>${this.t('privacy.transparencyPrincipleContent', 'SPCP遵循完全透明的设计原则。所有数据都公开存储在GitHub仓库中，这意味着您的信息将对所有人可见。')}</span>
                </p>
            </div>
        `;
	}

	renderSection1() {
		return `
            <h2>${this.t('privacy.section1.title', '1. 信息处理')}</h2>
            <h3>${this.t('privacy.section1.subtitle1', '1.1 我们不收集信息')}</h3>
            <p>${this.t('privacy.section1.content1', 'SPCP是一个纯客户端应用程序，我们不会收集、存储或处理您的任何个人信息。所有数据都在您的设备上本地处理。')}</p>

            <h3>${this.t('privacy.section1.subtitle2', '1.2 本地数据处理')}</h3>
            <p>${this.t('privacy.section1.content2', '应用程序仅在您的设备上处理以下数据：')}</p>
            <ul>
                <li><strong>${this.t('privacy.section1.dataType1', '本地缓存：编辑内容、设置偏好等临时数据')}</strong></li>
                <li><strong>${this.t('privacy.section1.dataType2', 'GitHub数据：通过GitHub API获取的公开信息（不存储）')}</strong></li>
                <li><strong>${this.t('privacy.section1.dataType3', '用户操作：编辑、保存等操作记录（仅本地）')}</strong></li>
            </ul>

            <div class="transparency">
                <p><strong>${this.t('privacy.section1.importantNoteTitle', '重要说明：')}</strong>${this.t('privacy.section1.importantNoteContent', 'SPCP客户端不会向任何服务器发送您的个人信息。所有数据都通过GitHub API直接与GitHub服务交互。')}</p>
            </div>
        `;
	}

	renderSection2() {
		return `
            <h2>${this.t('privacy.section2.title', '2. 数据流向')}</h2>
            <h3>${this.t('privacy.section2.subtitle1', '2.1 数据流向说明')}</h3>
            <p>${this.t('privacy.section2.content1', 'SPCP客户端应用程序的数据流向如下：')}</p>
            <ul>
                <li><strong>${this.t('privacy.section2.flow1', '用户 → 本地设备：编辑内容、设置偏好等数据存储在您的设备上')}</strong></li>
                <li><strong>${this.t('privacy.section2.flow2', '本地设备 → GitHub：通过GitHub API直接与GitHub服务交互')}</strong></li>
                <li><strong>${this.t('privacy.section2.flow3', 'GitHub → 本地设备：获取项目数据、用户信息等公开信息')}</strong></li>
                <li><strong>${this.t('privacy.section2.flow4', '我们：不接收、不存储、不处理任何用户数据')}</strong></li>
            </ul>

            <h3>${this.t('privacy.section2.subtitle2', '2.2 透明度保证')}</h3>
            <div class="transparency">
                <p><strong>${this.t('privacy.section2.importantNoteTitle', '重要说明：')}</strong>${this.t('privacy.section2.importantNoteContent', '由于SPCP的透明设计原则，以下信息将公开存储：')}</p>
                <ul>
                    <li>${this.t('privacy.section2.publicInfo1', '您的贡献记录和操作历史')}</li>
                    <li>${this.t('privacy.section2.publicInfo2', '积分变化和奖励记录')}</li>
                    <li>${this.t('privacy.section2.publicInfo3', '申请和审核过程记录')}</li>
                    <li>${this.t('privacy.section2.publicInfo4', '项目参与和协作记录')}</li>
                </ul>
                <p>${this.t('privacy.section2.noteContent', '这些信息将以明文形式存储在GitHub仓库中，任何人都可以查看。')}</p>
            </div>
        `;
	}

	renderSection3() {
		return `
            <h2>${this.t('privacy.section3.title', '3. 数据存储')}</h2>
            <h3>${this.t('privacy.section3.subtitle1', '3.1 存储位置')}</h3>
            <p>${this.t('privacy.section3.content1', '数据存储在以下位置：')}</p>
            <ul>
                <li><strong>${this.t('privacy.section3.location1', 'GitHub仓库：所有项目相关数据、用户信息、操作记录（由GitHub管理）')}</strong></li>
                <li><strong>${this.t('privacy.section3.location2', '您的本地设备：临时缓存、设置偏好、编辑草稿（由您控制）')}</strong></li>
                <li><strong>${this.t('privacy.section3.location3', '我们的服务器：无（我们不运行任何服务器）')}</strong></li>
            </ul>

            <h3>${this.t('privacy.section3.subtitle2', '3.2 存储控制')}</h3>
            <ul>
                <li><strong>${this.t('privacy.section3.control1', 'GitHub数据：由GitHub的隐私政策和服务条款管理')}</strong></li>
                <li><strong>${this.t('privacy.section3.control2', '本地数据：完全由您控制，可随时删除')}</strong></li>
                <li><strong>${this.t('privacy.section3.control3', '我们：不存储任何用户数据')}</strong></li>
            </ul>
        `;
	}

	renderSection4() {
		return `
            <h2>${this.t('privacy.section4.title', '4. 数据共享')}</h2>
            <h3>${this.t('privacy.section4.subtitle1', '4.1 我们不会共享您的数据')}</h3>
            <p>${this.t('privacy.section4.content1', 'SPCP客户端应用程序不会与任何第三方共享您的数据，因为我们不收集、不存储、不处理任何用户数据。')}</p>

            <h3>${this.t('privacy.section4.subtitle2', '4.2 数据公开说明')}</h3>
            <div class="warning">
                <p><strong>${this.t('privacy.section4.warningTitle', '重要提醒：')}</strong>${this.t('privacy.section4.warningContent', '由于SPCP的透明设计，以下信息将公开存储：')}</p>
                <ul>
                    <li>${this.t('privacy.section4.publicData1', '所有项目内容和协作记录（存储在GitHub仓库中）')}</li>
                    <li>${this.t('privacy.section4.publicData2', '用户贡献历史和积分记录（存储在GitHub仓库中）')}</li>
                    <li>${this.t('privacy.section4.publicData3', '审核过程和决策记录（存储在GitHub仓库中）')}</li>
                </ul>
                <p>${this.t('privacy.section4.noteContent', '这些数据由GitHub管理，受GitHub的隐私政策约束。')}</p>
            </div>
        `;
	}

	renderSection5() {
		return `
            <h2>${this.t('privacy.section5.title', '5. 数据安全')}</h2>
            <h3>${this.t('privacy.section5.subtitle1', '5.1 客户端安全')}</h3>
            <p>${this.t('privacy.section5.content1', 'SPCP客户端应用程序的安全措施：')}</p>
            <ul>
                <li>${this.t('privacy.section5.security1', '使用HTTPS加密与GitHub API通信')}</li>
                <li>${this.t('privacy.section5.security2', '本地数据存储在您的设备上，由您控制')}</li>
                <li>${this.t('privacy.section5.security3', '定期更新应用程序安全补丁')}</li>
                <li>${this.t('privacy.section5.security4', '不向任何服务器发送敏感信息')}</li>
            </ul>

            <h3>${this.t('privacy.section5.subtitle2', '5.2 数据安全说明')}</h3>
            <div class="warning">
                <p><strong>${this.t('privacy.section5.warningTitle', '重要提醒：')}</strong>${this.t('privacy.section5.warningContent', '由于透明设计原则，以下安全限制需要注意：')}</p>
                <ul>
                    <li>${this.t('privacy.section5.limitation1', 'GitHub仓库中的数据以明文形式存储，无加密保护')}</li>
                    <li>${this.t('privacy.section5.limitation2', '任何人都可以访问和查看公开数据')}</li>
                    <li>${this.t('privacy.section5.limitation3', '无法保证数据的完全保密性')}</li>
                    <li>${this.t('privacy.section5.limitation4', '建议不要上传敏感或机密信息')}</li>
                </ul>
            </div>
        `;
	}

	renderSection6() {
		return `
            <h2>${this.t('privacy.section6.title', '6. 您的权利')}</h2>
            <h3>${this.t('privacy.section6.subtitle1', '6.1 访问权')}</h3>
            <p>${this.t('privacy.section6.content1', '您有权：')}</p>
            <ul>
                <li>${this.t('privacy.section6.right1', '查看您的个人信息和贡献记录')}</li>
                <li>${this.t('privacy.section6.right2', '了解数据的使用和存储情况')}</li>
                <li>${this.t('privacy.section6.right3', '获取数据副本和导出功能')}</li>
            </ul>

            <h3>${this.t('privacy.section6.subtitle2', '6.2 控制权')}</h3>
            <p>${this.t('privacy.section6.content2', '您可以：')}</p>
            <ul>
                <li>${this.t('privacy.section6.control1', '通过GitHub设置控制账户信息')}</li>
                <li>${this.t('privacy.section6.control2', '删除本地缓存和临时数据')}</li>
                <li>${this.t('privacy.section6.control3', '选择不参与某些功能')}</li>
                <li>${this.t('privacy.section6.control4', '联系我们处理数据相关问题')}</li>
            </ul>

            <h3>${this.t('privacy.section6.subtitle3', '6.3 限制说明')}</h3>
            <div class="warning">
                <p><strong>${this.t('privacy.section6.warningTitle', '重要说明：')}</strong>${this.t('privacy.section6.warningContent', '由于透明设计原则，以下权利受到限制：')}</p>
                <ul>
                    <li>${this.t('privacy.section6.limitation1', '无法删除已公开的贡献记录')}</li>
                    <li>${this.t('privacy.section6.limitation2', '无法隐藏操作历史和积分记录')}</li>
                    <li>${this.t('privacy.section6.limitation3', '无法撤回已公开的数据')}</li>
                    <li>${this.t('privacy.section6.limitation4', '所有变更都将被记录和公开')}</li>
                </ul>
            </div>
        `;
	}

	renderSection7() {
		return `
            <h2>${this.t('privacy.section7.title', '7. 儿童隐私')}</h2>
            <p>${this.t('privacy.section7.content1', 'SPCP不专门针对13岁以下的儿童设计。如果您是13岁以下的儿童，请在家长或监护人的指导下使用本平台。')}</p>
        `;
	}

	renderSection8() {
		return `
            <h2>${this.t('privacy.section8.title', '8. 国际传输')}</h2>
            <p>${this.t('privacy.section8.content1', '您的信息可能通过GitHub服务传输到其他国家。我们依赖GitHub的数据保护措施来保护您的信息。')}</p>
        `;
	}

	renderSection9() {
		return `
            <h2>${this.t('privacy.section9.title', '9. 隐私政策变更')}</h2>
            <p>${this.t('privacy.section9.content1', '我们可能会不时更新本隐私政策。重大变更将通过以下方式通知：')}</p>
            <ul>
                <li>${this.t('privacy.section9.notification1', '在平台上发布通知')}</li>
                <li>${this.t('privacy.section9.notification2', '更新本页面')}</li>
                <li>${this.t('privacy.section9.notification3', '通过GitHub Issues发布公告')}</li>
            </ul>
        `;
	}

	renderSection10() {
		return `
            <h2>${this.t('privacy.section10.title', '10. 联系我们')}</h2>
            <p>${this.t('privacy.section10.content1', '如果您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：')}</p>
            <ul>
                <li>${this.t('privacy.section10.contact1', 'GitHub Issues: https://github.com/your-org/spcp/issues')}</li>
                <li>${this.t('privacy.section10.contact2', '项目仓库: https://github.com/your-org/spcp')}</li>
                <li>${this.t('privacy.section10.contact3', '邮箱: privacy@spcp.example.com')}</li>
            </ul>
        `;
	}

	renderSection11() {
		return `
            <h2>${this.t('privacy.section11.title', '11. 适用法律')}</h2>
            <p>${this.t('privacy.section11.content1', '本隐私政策受中华人民共和国法律管辖。如果您在欧盟地区，本政策也符合GDPR相关规定。')}</p>
        `;
	}

	renderFooter() {
		return `
            <div class="legal-footer">
                <p>${this.t('privacy.footer.copyright', '© 2025 SPCP Platform. 保留所有权利。')}</p>
                <a href="#" class="back-link">${this.t('privacy.footer.backLink', '返回登录页面')}</a>
            </div>
        `;
	}

	bindEvents() {
		// 返回链接
		const backLink = this.element.querySelector('.back-link');
		if (backLink) {
			backLink.addEventListener('click', (e) => {
				e.preventDefault();
				this.handleBack();
			});
		}
	}

	handleBack() {
		// 返回到登录页面
		if (window.app && window.app.router) {
			window.app.router.navigateTo('/');
		}
	}
}

// 注册组件
window.PrivacyPage = PrivacyPage;