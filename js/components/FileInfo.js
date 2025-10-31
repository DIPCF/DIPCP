/**
 * 文件信息组件
 * 用于显示文件的基本信息
 */
class FileInfo extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			fileName: props.fileName || '',
			fileType: props.fileType || '',
			fileSize: props.fileSize || '',
			lastModified: props.lastModified || '',
			className: props.className || 'file-info-grid',
			itemClassName: props.itemClassName || 'info-item'
		};
	}

	/**
	 * 渲染文件信息
	 */
	render() {
		const { className, fileName, fileType, fileSize, lastModified, itemClassName } = this.state;

		return this.createElement('div', {
			className: className
		}, [
			this.renderInfoItem(I18nService.t('fileInfo.fileName'), fileName, itemClassName),
			this.renderInfoItem(I18nService.t('fileInfo.fileType'), fileType || I18nService.t('fileInfo.unknown'), itemClassName),
			this.renderInfoItem(I18nService.t('fileInfo.fileSize'), fileSize, itemClassName),
			lastModified ? this.renderInfoItem(I18nService.t('fileInfo.lastModified'), lastModified, itemClassName) : null
		].filter(Boolean));
	}

	/**
	 * 渲染信息项
	 * @param {string} label - 标签
	 * @param {string} value - 值
	 * @param {string} className - CSS类名
	 */
	renderInfoItem(label, value, className) {
		return this.createElement('div', {
			className: className
		}, [
			this.createElement('label', {}, label),
			this.createElement('span', {}, value)
		]);
	}

	/**
	 * 更新文件信息
	 * @param {Object} fileInfo - 文件信息对象
	 */
	updateFileInfo(fileInfo) {
		this.setState({
			fileName: fileInfo.fileName || '',
			fileType: fileInfo.fileType || '',
			fileSize: fileInfo.fileSize || '',
			lastModified: fileInfo.lastModified || ''
		});
	}

	/**
	 * 设置文件名
	 * @param {string} fileName - 文件名
	 */
	setFileName(fileName) {
		this.setState({ fileName });
	}

	/**
	 * 设置文件类型
	 * @param {string} fileType - 文件类型
	 */
	setFileType(fileType) {
		this.setState({ fileType });
	}

	/**
	 * 设置文件大小
	 * @param {string} fileSize - 文件大小
	 */
	setFileSize(fileSize) {
		this.setState({ fileSize });
	}

	/**
	 * 设置最后修改时间
	 * @param {string} lastModified - 最后修改时间
	 */
	setLastModified(lastModified) {
		this.setState({ lastModified });
	}
}

// 导出文件信息组件
window.FileInfo = FileInfo;
