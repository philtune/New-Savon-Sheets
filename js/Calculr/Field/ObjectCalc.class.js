import {fieldSet} from "../fieldSet.function.js";
import {Field} from "./Field.class.js";

export class ObjectCalc extends Field {

	type = 'object';
	children;

	constructor(options) {
		super(options);
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

	search = key => this.children[key];

	getval = key => this.children[key].value;
}