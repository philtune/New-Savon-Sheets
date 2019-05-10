export class Field {
	constructor(options) {
		this.name = options.name;
		this.registry_key = options.registry_key;
		this.get_sibling = key => options.parent.children[key];
		Object.defineProperty(this, 'hiddenProperties', {enumerable: false, value: (props, config) =>
				Object.keys(props).forEach(key =>
					Object.defineProperty(this, key, {enumerable: false, value: config[key] || props[key]})
				)});
		this.hiddenProperties({
			root: null,
			parent: null,
			siblings: null,
			data: null
		}, options);
		options.root.registry[this.registry_key] = this;
	}
}