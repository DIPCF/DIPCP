/**
 * 自定义组件基类
 * 提供组件生命周期管理和事件处理
 */
class Component {
	constructor(props = {}) {
		this.props = props;
		this.state = {};
		this.element = null;
		this.eventListeners = new Map();
	}

	/**
	 * 渲染组件
	 * 子类必须实现此方法
	 */
	render() {
		throw new Error('Component must implement render method');
	}

	/**
	 * 挂载组件到DOM
	 * @param {HTMLElement} container - 挂载容器
	 * @param {any} path - 路径参数（可选）
	 */
	mount(container, path = null) {
		this.element = path ? this.render(path) : this.render();
		if (container) {
			container.appendChild(this.element);
		}
		this.componentDidMount();
		return this.element;
	}

	/**
	 * 更新组件状态
	 * @param {Object} newState - 新状态
	 */
	setState(newState) {
		const prevState = { ...this.state };
		this.state = { ...this.state, ...newState };
		this.componentDidUpdate(prevState, this.state);
		// 不自动触发rerender，让组件自己决定是否需要重新渲染
	}

	/**
	 * 添加事件监听器
	 * @param {string} event - 事件类型
	 * @param {Function} handler - 事件处理函数
	 * @param {HTMLElement} target - 目标元素，默认为组件根元素
	 */
	addEventListener(event, handler, target = null) {
		const element = target || this.element;
		if (element) {
			element.addEventListener(event, handler);
			if (!this.eventListeners.has(element)) {
				this.eventListeners.set(element, []);
			}
			this.eventListeners.get(element).push({ event, handler });
		}
	}

	/**
	 * 移除事件监听器
	 * @param {string} event - 事件类型
	 * @param {Function} handler - 事件处理函数
	 * @param {HTMLElement} target - 目标元素，默认为组件根元素
	 */
	removeEventListener(event, handler, target = null) {
		const element = target || this.element;
		if (element) {
			element.removeEventListener(event, handler);
			if (this.eventListeners.has(element)) {
				const listeners = this.eventListeners.get(element);
				const index = listeners.findIndex(l => l.event === event && l.handler === handler);
				if (index > -1) {
					listeners.splice(index, 1);
				}
			}
		}
	}

	/**
	 * 组件挂载后调用
	 */
	componentDidMount() {
		// 子类可重写
	}

	/**
	 * 组件更新后调用
	 * @param {Object} prevState - 之前的状态
	 * @param {Object} currentState - 当前状态
	 */
	componentDidUpdate(prevState, currentState) {
		// 子类可重写
	}

	/**
	 * 组件销毁前调用
	 */
	componentWillUnmount() {
		// 清理事件监听器
		for (const [element, listeners] of this.eventListeners) {
			listeners.forEach(({ event, handler }) => {
				element.removeEventListener(event, handler);
			});
		}
		this.eventListeners.clear();
	}

	/**
	 * 销毁组件
	 */
	destroy() {
		this.componentWillUnmount();
		if (this.element && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}
		this.element = null;
	}

	/**
	 * 创建DOM元素
	 * @param {string} tag - 标签名
	 * @param {Object} attributes - 属性
	 * @param {string|HTMLElement|Array} children - 子元素
	 * @returns {HTMLElement}
	 */
	createElement(tag, attributes = {}, children = []) {
		const element = document.createElement(tag);

		// 设置属性
		Object.keys(attributes).forEach(key => {
			if (key === 'className') {
				element.className = attributes[key];
			} else if (key === 'innerHTML') {
				element.innerHTML = attributes[key];
			} else if (key.startsWith('data-')) {
				element.setAttribute(key, attributes[key]);
			} else {
				element[key] = attributes[key];
			}
		});

		// 添加子元素
		if (typeof children === 'string') {
			element.textContent = children;
		} else if (children instanceof HTMLElement) {
			element.appendChild(children);
		} else if (Array.isArray(children)) {
			children.forEach(child => {
				if (typeof child === 'string') {
					element.appendChild(document.createTextNode(child));
				} else if (child instanceof HTMLElement) {
					element.appendChild(child);
				}
			});
		}

		return element;
	}

	/**
	 * 简单的Markdown转HTML转换器
	 * 注意：这是一个简化版本，仅处理基本的Markdown语法
	 * @param {string} markdown - Markdown文本
	 * @returns {string} HTML文本
	 */
	markdownToHtml(markdown) {
		if (!markdown) return '';

		let html = markdown;

		// 处理标题
		html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
		html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
		html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

		// 处理粗体
		html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

		// 处理斜体
		html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

		// 处理链接
		html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

		// 处理无序列表
		html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');

		// 包裹列表项
		let inList = false;
		const lines = html.split('\n');
		const processedLines = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.trim().startsWith('<li>')) {
				if (!inList) {
					processedLines.push('<ul>');
					inList = true;
				}
				processedLines.push(line);
			} else {
				if (inList) {
					processedLines.push('</ul>');
					inList = false;
				}
				processedLines.push(line);
			}
		}

		if (inList) {
			processedLines.push('</ul>');
		}

		html = processedLines.join('\n');

		// 处理段落
		const paragraphs = html.split('\n\n');
		html = paragraphs
			.filter(p => p.trim())
			.map(p => {
				// 如果已经是HTML标签，不添加<p>标签
				if (p.trim().startsWith('<')) {
					return p;
				}
				return `<p>${p}</p>`;
			})
			.join('\n');

		// 处理水平线
		html = html.replace(/^---$/gim, '<hr>');

		// 处理代码块（简单处理）
		html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');

		// 处理行内代码
		html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

		return html;
	}
}

// 导出组件基类
window.Component = Component;
