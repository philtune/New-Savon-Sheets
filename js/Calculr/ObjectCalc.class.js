import {fieldSet} from "./fieldSet.function.js";

export class ObjectCalc {

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
		this.getParent = _ => config.parent;
		this.getSiblings = _ => config.parent.children;
		this.getSibling = key => config.parent.children[key];
		const children_config = {
			children_configs: config.children_configs,
			parent: this,
			parent_key: this.key,
			registry: config.registry,
			data: this_data
		};
		if ( config.is_array_item ) {
			children_config.closest_array = this.getParent();
		}
		this.children = fieldSet(children_config);

		config.registry[this.key] = this;
	}
}