/**
 * 服务条款页面组件
 * 完全组件化的服务条款页面
 */
class TermsPage extends BasePage {
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
                <h1 class="legal-title">${this.t('terms.title', '服务条款')}</h1>
                <p class="legal-subtitle">${this.t('terms.subtitle', 'DIPCP (Serverless Project Contribution Platform) 使用协议')}</p>
                <p class="legal-subtitle">${this.t('terms.lastUpdated', '最后更新：2025年10月22日')}</p>
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
                ${this.renderSection12()}
                ${this.renderSection13()}
                ${this.renderSection14()}
            </div>
        `;
	}

	renderImportantNotice() {
		return `
            <div class="highlight">
                <p>
                    <strong>${this.t('terms.importantNoticeTitle', '重要提示：')}</strong>
                    <span>${this.t('terms.importantNoticeContent', 'DIPCP是一个完全透明的无服务器协作平台。所有数据都公开存储在GitHub仓库中，请仔细阅读本使用协议。')}</span>
                </p>
            </div>
        `;
	}

	renderTransparencyPrinciple() {
		return `
            <div class="transparency">
                <p>
                    <strong>${this.t('terms.transparencyPrincipleTitle', '透明度原则：')}</strong>
                    <span>${this.t('terms.transparencyPrincipleContent', 'DIPCP遵循完全透明的设计原则，所有参与者、参与过程、获得的好处全部明文公开，全程可追溯。')}</span>
                </p>
            </div>
        `;
	}

	renderSection1() {
		return `
            <h2>${this.t('terms.section1.title', '1. 平台概述')}</h2>
            <p>${this.t('terms.section1.content1', 'DIPCP（无服务器项目贡献平台）是一个基于GitHub的协作平台，专门用于去中心化的世界构建、内容创作和协作项目。本平台采用完全透明的设计理念，所有数据公开存储。')}</p>
            <p><strong>${this.t('terms.section1.content2', '重要说明：DIPCP本身不提供任何服务，所有服务均由GitHub提供。我们仅提供一个客户端应用程序，帮助用户更好地使用GitHub的协作功能。')}</strong></p>
        `;
	}

	renderSection2() {
		return `
            <h2>${this.t('terms.section2.title', '2. 适用场景')}</h2>
            <h3>${this.t('terms.section2.subtitle1', '2.1 适合的项目类型')}</h3>
            <ul>
                <li>${this.t('terms.section2.content1', '开源软件开发：代码、文档、设计等公开内容')}</li>
                <li>${this.t('terms.section2.content2', '知识分享项目：教程、指南、百科等教育内容')}</li>
                <li>${this.t('terms.section2.content3', '创意协作项目：艺术、文学、音乐等创作内容')}</li>
                <li>${this.t('terms.section2.content4', '社区建设项目：活动策划、社区规则等公开信息')}</li>
                <li>${this.t('terms.section2.content5', '学术研究项目：论文、研究数据等学术内容')}</li>
                <li>${this.t('terms.section2.content6', '世界构建项目：游戏设定、小说世界观等创作内容')}</li>
            </ul>

            <h3>${this.t('terms.section2.subtitle2', '2.2 不适合的项目类型')}</h3>
            <div class="warning">
                <p><strong>${this.t('terms.section2.warningTitle', '重要提醒：')}</strong>${this.t('terms.section2.warningContent', '以下类型的项目不适合使用DIPCP：')}</p>
                <ul>
                    <li>${this.t('terms.section2.warning1', '商业机密项目：涉及商业机密的内部项目')}</li>
                    <li>${this.t('terms.section2.warning2', '个人隐私内容：涉及个人隐私的敏感信息')}</li>
                    <li>${this.t('terms.section2.warning3', '保密项目：需要保密协议的项目')}</li>
                    <li>${this.t('terms.section2.warning4', '内部管理系统：企业内部管理系统')}</li>
                    <li>${this.t('terms.section2.warning5', '医疗健康项目：涉及个人健康信息的项目')}</li>
                    <li>${this.t('terms.section2.warning6', '金融服务项目：涉及财务隐私的项目')}</li>
                </ul>
            </div>
        `;
	}

	renderSection3() {
		return `
            <h2>${this.t('terms.section3.title', '3. 平台功能')}</h2>
            <p>${this.t('terms.section3.content1', 'DIPCP客户端应用程序提供以下功能：')}</p>
            <ul>
                <li>${this.t('terms.section3.feature1', '基于GitHub的版本控制和协作功能')}</li>
                <li>${this.t('terms.section3.feature2', '文件编辑和管理工具（支持Markdown、文本、图片等）')}</li>
                <li>${this.t('terms.section3.feature3', '自动分支管理和提交审核流程')}</li>
                <li>${this.t('terms.section3.feature4', '积分奖励和贡献评估系统')}</li>
                <li>${this.t('terms.section3.feature5', '多平台支持（桌面应用、移动应用、网页版）')}</li>
                <li>${this.t('terms.section3.feature6', '零门槛参与设计（无需学习Git技术）')}</li>
                <li>${this.t('terms.section3.feature7', '完全透明的数据存储和操作记录')}</li>
            </ul>
        `;
	}

	renderSection4() {
		return `
            <h2>${this.t('terms.section4.title', '4. 用户责任')}</h2>
            <h3>${this.t('terms.section4.subtitle1', '4.1 GitHub账户安全')}</h3>
            <p>${this.t('terms.section4.content1', '用户有责任：')}</p>
            <ul>
                <li>${this.t('terms.section4.responsibility1', '保护其GitHub账户的安全')}</li>
                <li>${this.t('terms.section4.responsibility2', '不得与他人共享账户信息')}</li>
                <li>${this.t('terms.section4.responsibility3', '及时报告任何安全漏洞或未授权使用')}</li>
                <li>${this.t('terms.section4.responsibility4', '遵守GitHub的服务条款')}</li>
            </ul>

            <h3>${this.t('terms.section4.subtitle2', '4.2 内容责任')}</h3>
            <p>${this.t('terms.section4.content2', '用户对其创建、编辑或提交的所有内容负责，包括：')}</p>
            <ul>
                <li>${this.t('terms.section4.contentResponsibility1', '确保内容不侵犯他人知识产权')}</li>
                <li>${this.t('terms.section4.contentResponsibility2', '确保内容符合相关法律法规')}</li>
                <li>${this.t('terms.section4.contentResponsibility3', '不得发布违法、有害、威胁、诽谤、骚扰或不当内容')}</li>
                <li>${this.t('terms.section4.contentResponsibility4', '理解并同意所有内容将公开存储，完全透明')}</li>
            </ul>

            <h3>${this.t('terms.section4.subtitle3', '4.3 透明度责任')}</h3>
            <p>${this.t('terms.section4.content3', '用户理解并同意：')}</p>
            <ul>
                <li>${this.t('terms.section4.transparencyResponsibility1', '所有操作记录将公开存储')}</li>
                <li>${this.t('terms.section4.transparencyResponsibility2', '个人贡献历史完全透明')}</li>
                <li>${this.t('terms.section4.transparencyResponsibility3', '积分变化和奖励记录公开可见')}</li>
                <li>${this.t('terms.section4.transparencyResponsibility4', '申请和审核过程完全透明')}</li>
            </ul>
        `;
	}

	renderSection5() {
		return `
            <h2>${this.t('terms.section5.title', '5. 使用限制')}</h2>
            <p>${this.t('terms.section5.content1', '用户不得：')}</p>
            <ul>
                <li>${this.t('terms.section5.restriction1', '滥用或恶意使用平台')}</li>
                <li>${this.t('terms.section5.restriction2', '尝试破坏或干扰平台正常运行')}</li>
                <li>${this.t('terms.section5.restriction3', '使用自动化工具进行不当操作')}</li>
                <li>${this.t('terms.section5.restriction4', '违反GitHub的服务条款')}</li>
                <li>${this.t('terms.section5.restriction5', '上传涉及隐私或机密的内容')}</li>
                <li>${this.t('terms.section5.restriction6', '进行任何可能损害平台透明性的行为')}</li>
            </ul>
        `;
	}

	renderSection6() {
		return `
            <h2>${this.t('terms.section6.title', '6. 知识产权')}</h2>
            <p>${this.t('terms.section6.content1', '用户保留其创建内容的所有知识产权。通过使用DIPCP平台，用户授予我们必要的许可来提供和改善平台功能。所有内容将按照开源协议进行管理。')}</p>
        `;
	}

	renderSection7() {
		return `
            <div class="transparency">
                <h2>${this.t('terms.section7.title', '7. 数据存储与透明度')}</h2>
                <h3>${this.t('terms.section7.subtitle1', '7.1 数据存储方式')}</h3>
                <p>${this.t('terms.section7.content1', '所有数据以明文形式存储在GitHub仓库中，包括：')}</p>
                <ul>
                    <li>${this.t('terms.section7.dataType1', '用户信息和权限数据')}</li>
                    <li>${this.t('terms.section7.dataType2', '项目配置和设置')}</li>
                    <li>${this.t('terms.section7.dataType3', '贡献记录和审核历史')}</li>
                    <li>${this.t('terms.section7.dataType4', '积分变化和奖励记录')}</li>
                    <li>${this.t('terms.section7.dataType5', '操作日志和审计追踪')}</li>
                </ul>

                <h3>${this.t('terms.section7.subtitle2', '7.2 透明度保证')}</h3>
                <p>${this.t('terms.section7.content2', '我们保证：')}</p>
                <ul>
                    <li>${this.t('terms.section7.guarantee1', '所有数据完全公开，任何人都可以查看')}</li>
                    <li>${this.t('terms.section7.guarantee2', '每个操作都有完整的记录和审计追踪')}</li>
                    <li>${this.t('terms.section7.guarantee3', '所有决策过程完全透明')}</li>
                    <li>${this.t('terms.section7.guarantee4', '积分系统完全公开透明')}</li>
                </ul>
            </div>
        `;
	}

	renderSection8() {
		return `
            <h2>${this.t('terms.section8.title', '8. 服务依赖')}</h2>
            <p>${this.t('terms.section8.content1', 'DIPCP平台依赖以下第三方服务：')}</p>
            <ul>
                <li><strong>${this.t('terms.section8.dependency1', 'GitHub服务：所有数据存储、版本控制、协作功能均由GitHub提供')}</strong></li>
                <li><strong>${this.t('terms.section8.dependency2', '网络连接：需要稳定的网络连接访问GitHub')}</strong></li>
                <li><strong>${this.t('terms.section8.dependency3', '浏览器支持：网页版需要现代浏览器支持')}</strong></li>
            </ul>
            <p><strong>${this.t('terms.section8.disclaimer', '免责声明：我们不对第三方服务的可用性、性能或数据丢失承担责任。')}</strong></p>
        `;
	}

	renderSection9() {
		return `
            <h2>${this.t('terms.section9.title', '9. 平台可用性')}</h2>
            <p>${this.t('terms.section9.content1', '我们努力保持DIPCP客户端应用程序的可用性，但不保证应用程序不会出现故障。应用程序可能因以下原因暂时不可用：')}</p>
            <ul>
                <li>${this.t('terms.section9.reason1', '应用程序更新和维护')}</li>
                <li>${this.t('terms.section9.reason2', '技术故障或错误')}</li>
                <li>${this.t('terms.section9.reason3', '依赖的第三方服务不可用')}</li>
                <li>${this.t('terms.section9.reason4', '网络连接问题')}</li>
            </ul>
        `;
	}

	renderSection10() {
		return `
            <div class="warning">
                <h2>${this.t('terms.section10.title', '10. 免责声明')}</h2>
                <p><strong>${this.t('terms.section10.disclaimerTitle', '免责声明：')}</strong>${this.t('terms.section10.disclaimerContent', 'DIPCP客户端应用程序按"现状"提供，不提供任何明示或暗示的保证。我们不承担因使用本应用程序而产生的任何直接或间接损失。由于数据完全公开存储，用户应自行评估隐私风险。')}</p>
            </div>
        `;
	}

	renderSection11() {
		return `
            <h2>${this.t('terms.section11.title', '11. 平台变更')}</h2>
            <p>${this.t('terms.section11.content1', '我们保留随时修改、暂停或终止DIPCP客户端应用程序的权利。重大变更将提前通知用户。所有变更记录将公开存储，确保透明度。')}</p>
        `;
	}

	renderSection12() {
		return `
            <h2>${this.t('terms.section12.title', '12. 争议解决')}</h2>
            <p>${this.t('terms.section12.content1', '因使用DIPCP平台产生的争议，应通过友好协商解决。协商不成的，可向有管辖权的人民法院提起诉讼。所有争议解决过程将保持透明。')}</p>
        `;
	}

	renderSection13() {
		return `
            <h2>${this.t('terms.section13.title', '13. 条款修改')}</h2>
            <p>${this.t('terms.section13.content1', '我们保留随时修改本使用协议的权利。修改后的协议将在平台上公布，继续使用平台即表示接受修改后的协议。所有修改历史将公开记录。')}</p>
        `;
	}

	renderSection14() {
		return `
            <h2>${this.t('terms.section14.title', '14. 联系方式')}</h2>
            <p>${this.t('terms.section14.content1', '如果您对本使用协议有任何疑问，请通过以下方式联系我们：')}</p>
            <ul>
                <li>${this.t('terms.section14.contact1', 'GitHub Issues: https://github.com/your-org/spcp/issues')}</li>
                <li>${this.t('terms.section14.contact2', '项目仓库: https://github.com/your-org/spcp')}</li>
                <li>${this.t('terms.section14.contact3', '邮箱: support@spcp.example.com')}</li>
            </ul>
            <p><strong>${this.t('terms.section14.noteTitle', '注意：')}</strong>${this.t('terms.section14.noteContent', '所有沟通记录将公开存储，确保透明度。')}</p>
        `;
	}

	renderFooter() {
		return `
            <div class="legal-footer">
                <p>${this.t('terms.footer.copyright', '© 2025 DIPCP Platform. 保留所有权利。')}</p>
                <a href="#" class="back-link">${this.t('terms.footer.backLink', '返回登录页面')}</a>
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
		if (window.app && window.app.navigateTo) {
			window.app.navigateTo('/');
		}
	}
}

// 注册组件
window.TermsPage = TermsPage;