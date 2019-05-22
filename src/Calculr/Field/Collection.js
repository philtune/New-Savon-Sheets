import {CalcNode} from "./CalcNode.js";
import {CollectionItem} from "./Group.js";

const create_uid = (size, compare_arr=[]) => {
	let uid = '';
	do {
		uid = (Array(size+1).join("0") + ((Math.random() * Math.pow(36,size)) | 0).toString(36)).slice(-size);
	} while ( compare_arr.includes(uid) );
	return uid;
};

const item_names = [];

export class Collection extends CalcNode {

	type = 'collection';
	items = [];
	num_items = 0;

	constructor({config, ...options} = {}) {
		super(options);
		config.children_configs = config.fields;
		this.hiddenProperties({
			after_remove: () => null,
			children_configs: {}
		}, config);
	}

	getLength = () => this.items.length;

	insert_item = () => {
		this.root.lifecycle.get('before_insert')(this);

		const item_data = {};

		const
			name = create_uid(3, item_names),
			item = new CollectionItem({
				name: name,
				registry_key: this.registry_key + '#' + name,
				parent: this,
				config: this.children_configs,
				root: this.root,
				data: item_data
			})
		;

		item_names.push(name);

		this.items.push(item);
		this.data.push(item_data);
		this.num_items++;

		this.root.lifecycle.get('after_insert')(item);
		return item;
	};

	remove_item = item => {
		this.root.lifecycle.get('before_remove')(item);

		const index = item.getIndex();
		delete this.items[index];
		delete this.parent.data[this.name][index];
		this.after_remove(item.getHelper());

		this.root.lifecycle.get('after_item_remove')(item);
	};

	unload_item = item => {
		const index = item.getIndex();
		delete this.items[index];
		delete this.parent.data[this.name][index];
	};

	each = cb => {
		this.items.forEach((obj, i) =>cb(obj, i));
	};

	sum = key =>
		this.items.reduce((a, b) => a + (b.children[key].value || 0), 0);

	calculate_collection = key =>
		this.items.reduce((a, b) => a + b.children[key].calculate(), 0);
}
