/**
 * 设置项组件
 * 用于设置页面中的单个设置项
 */
class SettingItem extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			label: props.label || '',
			labelKey: props.labelKey || '',
			type: props.type || 'text', // text, select, checkbox, textarea
			value: props.value || '',
			placeholder: props.placeholder || '',
			placeholderKey: props.placeholderKey || '',
			options: props.options || [], // 用于select类型
			readonly: props.readonly || false,
			required: props.required || false,
			description: props.description || '',
			descriptionKey: props.descriptionKey || '',
			className: props.className || '',
			onChange: props.onChange || null,
			onFocus: props.onFocus || null,
			onBlur: props.onBlur || null
		};
	}

	render() {
		return `
            <div class="setting-item ${this.state.className}">
                ${this.renderLabel()}
                ${this.renderInput()}
                ${this.renderDescription()}
            </div>
        `;
	}

	renderLabel() {
		if (!this.state.label && !this.state.labelKey) {
			return '';
		}

		const labelText = this.state.labelKey ?
			`data-i18n="${this.state.labelKey}"` :
			this.state.label;

		return `
            <label class="setting-label">
                ${labelText}
                ${this.state.required ? '<span class="required">*</span>' : ''}
            </label>
        `;
	}

	renderInput() {
		switch (this.state.type) {
			case 'select':
				return this.renderSelect();
			case 'checkbox':
				return this.renderCheckbox();
			case 'textarea':
				return this.renderTextarea();
			default:
				return this.renderTextInput();
		}
	}

	renderTextInput() {
		const placeholderAttr = this.state.placeholderKey ?
			`data-i18n-placeholder="${this.state.placeholderKey}"` :
			`placeholder="${this.state.placeholder}"`;

		return `
            <input 
                type="${this.state.type}" 
                class="setting-input"
                value="${this.state.value}"
                ${placeholderAttr}
                ${this.state.readonly ? 'readonly' : ''}
                ${this.state.required ? 'required' : ''}
            />
        `;
	}

	renderSelect() {
		const options = this.state.options.map(option => {
			const isSelected = option.value === this.state.value ? 'selected' : '';
			const optionText = option.key ? `data-i18n="${option.key}"` : option.text;
			return `
                <option value="${option.value}" ${isSelected} ${option.key ? '' : ''}>
                    ${optionText}
                </option>
            `;
		}).join('');

		return `
            <select class="setting-select" ${this.state.required ? 'required' : ''}>
                ${options}
            </select>
        `;
	}

	renderTextarea() {
		const placeholderAttr = this.state.placeholderKey ?
			`data-i18n-placeholder="${this.state.placeholderKey}"` :
			`placeholder="${this.state.placeholder}"`;

		return `
            <textarea 
                class="setting-textarea"
                ${placeholderAttr}
                ${this.state.readonly ? 'readonly' : ''}
                ${this.state.required ? 'required' : ''}
            >${this.state.value}</textarea>
        `;
	}

	renderCheckbox() {
		return `
            <label class="checkbox-label">
                <input 
                    type="checkbox" 
                    class="setting-checkbox"
                    ${this.state.value ? 'checked' : ''}
                    ${this.state.required ? 'required' : ''}
                />
                <span class="checkbox-text ${this.state.labelKey ? `data-i18n="${this.state.labelKey}"` : ''}">
                    ${this.state.labelKey ? '' : this.state.label}
                </span>
            </label>
        `;
	}

	renderDescription() {
		if (!this.state.description && !this.state.descriptionKey) {
			return '';
		}

		const descriptionText = this.state.descriptionKey ?
			`data-i18n="${this.state.descriptionKey}"` :
			this.state.description;

		return `
            <div class="setting-description">
                ${descriptionText}
            </div>
        `;
	}

	bindEvents() {
		const input = this.element.querySelector('input, select, textarea');
		if (!input) return;

		if (this.state.onChange) {
			input.addEventListener('change', (e) => {
				this.state.onChange(e.target.value, e);
			});
		}

		if (this.state.onFocus) {
			input.addEventListener('focus', (e) => {
				this.state.onFocus(e);
			});
		}

		if (this.state.onBlur) {
			input.addEventListener('blur', (e) => {
				this.state.onBlur(e);
			});
		}
	}

	getValue() {
		const input = this.element.querySelector('input, select, textarea');
		if (!input) return this.state.value;

		if (input.type === 'checkbox') {
			return input.checked;
		}
		return input.value;
	}

	setValue(value) {
		this.setState({ value });
		const input = this.element.querySelector('input, select, textarea');
		if (input) {
			if (input.type === 'checkbox') {
				input.checked = value;
			} else {
				input.value = value;
			}
		}
	}

	setOptions(options) {
		this.setState({ options });
		this.update();
	}

	setReadonly(readonly) {
		this.setState({ readonly });
		this.update();
	}
}
