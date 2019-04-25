import {ObjectCalc} from "./ObjectCalc.class.js";
import {Calculr} from "./Calculr.class.js";

export class ArrayCalc {

	name;
	key;
	collection = [];
	getParent = null;
	getSiblings = null;
	type = 'array';

	constructor(options) {
		this.name = options.name;
		this.key = options.parent_key + options.name;
		this.getParent = () => options.parent;
		this.getSiblings = () => options.parent.children;
		this.getSibling = key => options.parent.children[key];
		this.getConfig = () => options;
		this.getLength = () => this.collection.length;
		this.getRoot = () => options.root;
		this.getRoot().registry[this.key] = this;
	}

	add = () => {
		const
			index = this.getLength(),
			field_id = this.key + '[' + index + ']',
			item = new ObjectCalc({
				name: index,
				parent: this,
				is_array_item: true,
				parent_key: this.key,
				parent_type: 'array',
				registry: this.getConfig().registry,
				children_configs: this.getConfig().children_configs,
				data_parent: this.getConfig().data_parent[this.name],
				root: this.getRoot()
			}),
			helper = Calculr.getHelper(item)
		;

		this.getConfig().registry[field_id] = item;
		this.collection.push(item);

		if ( typeof this.getConfig().array_config.on_add === 'function' ) {
			this.getConfig().array_config.on_add(helper);
		}
		return item;
	};

	delete = index => {
		const helper = Calculr.getHelper(this.collection[index]);
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
