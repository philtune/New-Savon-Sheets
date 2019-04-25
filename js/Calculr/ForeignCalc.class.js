import {fieldSet} from "./fieldSet.function.js";

export class ForeignCalc {

	name;
	key = '';
	getParent = null;
	getSiblings = null;
	type = 'object';
	children;

	constructor(config) {
		const this_data = config.data_parent[config.name] = {};
		this.name = config.name;
		this.key =
			config.parent_type === 'array' ?
				config.parent_key + '[' + config.name + ']' :
				config.parent_key + config.name;
		this.getParent = () => config.parent;
		this.getSiblings = () => config.parent.children;
		this.getSibling = key => config.parent.children[key];
		this.getRoot = () => config.root;
		const children_config = {
			children_configs: config.children_configs,
			parent: this,
			parent_key: this.key,
			registry: config.registry,
			data: this_data,
			root: config.root
		};
		if ( config.is_array_item ) {
			children_config.closest_array = config.parent;
		}
		this.children = fieldSet(children_config);

		this.getRoot().registry[this.key] = this;
	}
}