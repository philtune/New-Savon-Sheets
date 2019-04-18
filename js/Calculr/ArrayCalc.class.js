import {getHelper} from "./getHelper.function.js";
import {ObjectCalc} from "./ObjectCalc.class.js";

export class ArrayCalc {

	name;
	key;
	collection = [];
	getParent = null;
	getSiblings = null;
	type = 'array';

	constructor(config) {
		this.name = config.name;
		this.key = config.parent_key + config.name;
		this.getParent = _ => config.parent;
		this.getSiblings = _ => config.parent.children;
		this.getSibling = key => config.parent.children[key];
		config.registry[this.key] = this;
		this.getConfig = _ => config;
	}

	add = _ => {
		const
			index = this.collection.length,
			field_id = this.key + '[' + index + ']',
			item = new ObjectCalc({
				name: index,
				parent: this,
				is_array_item: true,
				parent_key: this.key,
				parent_type: 'array',
				registry: this.getConfig().registry,
				children_configs: this.getConfig().children_configs,
				data_parent: this.getConfig().data_parent[this.name]
			}),
			helper = getHelper(item, this.getConfig().registry)
		;

		this.getConfig().registry[field_id] = item;
		this.collection.push(item);

		if ( typeof this.getConfig().array_config.on_add === 'function' ) {
			this.getConfig().array_config.on_add(helper);
		}
		return item;
	};

	delete = index => {
		const helper = getHelper(this.collection[index], this.getConfig().registry);
		delete this.collection[index];
		delete this.getConfig().data_parent[this.name][index];
		if ( typeof this.getConfig().array_config.on_delete === 'function' ) {
			this.getConfig().array_config.on_delete(helper);
		}
	};

	sum = key => {
		let result = 0;
		this.collection.forEach(function(obj) {
			if ( typeof obj === 'object' ) {
				result += obj.children[key].value || 0;
			}
		});
		return result;
	};

	array_calculate = key => {
		let result = 0;
		this.collection.forEach(function(obj) {
			if ( typeof obj === 'object' ) {
				result += obj.children[key].calculate();
			}
		});
		return result;
	}
}
