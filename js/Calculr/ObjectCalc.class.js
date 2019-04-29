import {fieldSet} from "./fieldSet.function.js";

export class ObjectCalc {

	name;
	type = 'object';
	children;

	constructor(options) {
		const children_options = {
			children_configs: options.children_configs,
			parent: this,
			parent_key: options.registry_key,
			registry: options.registry,
			data: options.data,
			root: options.root
		};
		if ( options.is_array_item ) {
			children_options.closest_array = options.parent;
		}
		this.children = fieldSet(children_options);
	}
}