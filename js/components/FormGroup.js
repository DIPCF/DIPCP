/**
 * 表单组组件
 * 包含标签和输入控件
 */
class FormGroup extends Component {
	constructor(props = {}) {
		super(props);
		this.state = {
			label: props.label || '',
			labelKey: props.labelKey || '',
			type: props.type || 'text',
			name: props.name || '',
			id: props.id || props.name || '',
			placeholder: props.placeholder || '',
			placeholderKey: props.placeholderKey || '',
			value: props.value || '',
			required: props.required || false,
			readonly: props.readonly || false,
			options: props.options || [], // 用于select类型
			className: props.className || '',
			onChange: props.onChange || null,
			onFocus: props.onFocus || null,
			onBlur: props.onBlur || null
		};
	}

	render() {
		return `
            <div class="form-group ${this.state.className}">
                ${this.renderLabel()}
                ${this.renderInput()}
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
            <label for="${this.state.id}" ${this.state.labelKey ? '' : ''}>
                ${labelText}
            </label>
        `;
	}

	renderInput() {
		switch (this.state.type) {
			case 'select':
				return this.renderSelect();
			case 'textarea':
				return this.renderTextarea();
			case 'checkbox':
				return this.renderCheckbox();
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
                id="${this.state.id}" 
                name="${this.state.name}"
                value="${this.state.value}"
                ${placeholderAttr}
                ${this.state.required ? 'required' : ''}
                ${this.state.readonly ? 'readonly' : ''}
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
            <select id="${this.state.id}" name="${this.state.name}" ${this.state.required ? 'required' : ''}>
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
                id="${this.state.id}" 
                name="${this.state.name}"
                ${placeholderAttr}
                ${this.state.required ? 'required' : ''}
                ${this.state.readonly ? 'readonly' : ''}
            >${this.state.value}</textarea>
        `;
	}

	renderCheckbox() {
		return `
            <label class="checkbox-label">
                <input 
                    type="checkbox" 
                    id="${this.state.id}" 
                    name="${this.state.name}"
                    ${this.state.value ? 'checked' : ''}
                    ${this.state.required ? 'required' : ''}
                />
                <span ${this.state.labelKey ? `data-i18n="${this.state.labelKey}"` : ''}>
                    ${this.state.labelKey ? '' : this.state.label}
                </span>
            </label>
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
		return input ? input.value : this.state.value;
	}

	setValue(value) {
		this.setState({ value });
		const input = this.element.querySelector('input, select, textarea');
		if (input) {
			input.value = value;
		}
	}

	setOptions(options) {
		this.setState({ options });
		this.update();
	}
}
