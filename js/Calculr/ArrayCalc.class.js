import {ObjectCalc} from "./ObjectCalc.class.js";
import {Calculr} from "./Calculr.class.js";

export class ArrayCalc {

	name;
	type = 'array';
	registry_key;
	collection = [];

	constructor(options) {
		this.getOptions = () => options;
		this.getLength = () => this.collection.length;
	}

	add = () => {

		const
			index = this.getLength(),
			registry_key = this.registry_key + '[' + index + ']',
			item = Object.assign(new ObjectCalc({
				registry_key: registry_key,
				parent: this,
				is_array_item: true,
				registry: this.getOptions().registry,
				children_configs: this.getOptions().children_configs,
				data_parent: this.getOptions().data_parent[this.name],
				root: this.getRoot(),
				data: this.getOptions().data_parent[this.name][index] = {}
			}), {
				name: index,
				key: registry_key,
				getParent: () => this,
				getRoot: () => this.getRoot()
			}),
			helper = Calculr.getHelper(item)
		;

		this.getRoot().registry[item.key] = item;

		this.getOptions().registry[registry_key] = item;
		this.collection.push(item);

		if ( typeof this.getOptions().array_config.on_add === 'function' ) {
			this.getOptions().array_config.on_add(helper);
		}
		return item;
	};

	delete = index => {
		const helper = Calculr.getHelper(this.collection[index]);
		delete this.collection[index];
		delete this.getOptions().data_parent[this.name][index];
		if ( typeof this.getOptions().array_config.on_delete === 'function' ) {
			this.getOptions().array_config.on_delete(helper);
		}
	};

	sum = key => {
		let result = 0;
		this.collection.forEach(function(item) {
			if ( typeof item === 'object' ) {
				result += item.children[key].value || 0;
			}
		});
		return result;
	};

	array_calculate = key => {
		let result = 0;
		this.collection.forEach(function(item) {
			if ( typeof item === 'object' ) {
				result += item.children[key].calculate();
			}
		});
		return result;
	}
}
