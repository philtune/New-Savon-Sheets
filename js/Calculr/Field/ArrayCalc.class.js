import {ObjectCalc} from "./ObjectCalc.class.js";
import {Calculr} from "../Calculr.class.js";
import {Field} from "./Field.class.js";
import {getCaller} from "../../library.js";

let collection_length = 0;

function testAdd(self) {
	const tH = Calculr.getTestHelpers(self.getRoot(), self);
	tH.warn('%c run() @ '+getCaller(5)+' ', 'background: #222; color: #bada55', `'${self.registry_key}'.add()`);
	tH.assert([self.getLength(), ++collection_length]);
}

function testDelete(array, index) {
	const tH = Calculr.getTestHelpers(array.getRoot(), array);
	tH.warn('%c run() @ '+getCaller(5)+' ', 'background: #222; color: #bada55', `'${array.registry_key}'.delete(${index})`);
	tH.assert([array.collection[index], undefined]);
	if ( typeof array.getTestDelete() === 'function' ) {
		array.getTestDelete()(tH.assert, tH.search, tH.getval, array);
	}
}

export class ArrayCalc extends Field {

	type = 'array';
	collection = [];

	constructor(options) {
		super(options);
		this.getTestDelete = () => options.array_config.test_delete;
	}

	getLength = () => this.collection.length;

	add = () => {
		const
			index = this.getLength(),
			registry_key = this.registry_key + '[' + index + ']',
			item = new ObjectCalc({
				name: index,
				registry_key: registry_key,
				parent: this,
				is_array_item: true,
				registry: this.getOptions().registry,
				children_configs: this.getOptions().children_configs,
				data_parent: this.getDataParent()[this.name],
				root: this.getRoot(),
				data: this.getDataParent()[this.name][index] = {}
			}),
			helper = Calculr.getHelper(item)
		;

		this.getRoot().registry[item.key] = item;

		this.collection.push(item);

		if ( typeof this.getOptions().array_config.on_add === 'function' ) {
			this.getOptions().array_config.on_add(helper);
		}
		testAdd(this);
		return item;
	};

	delete = index => {
		const helper = Calculr.getHelper(this.collection[index]);
		delete this.collection[index];
		delete this.getDataParent()[this.name][index];
		if ( typeof this.getOptions().array_config.on_delete === 'function' ) {
			this.getOptions().array_config.on_delete(helper);
		}
		testDelete(this, index);
	};

	each = cb => {
		this.collection.forEach((obj, i) =>cb(obj, i));
	};

	sum = key => {
		let result = 0;
		this.each((item, i) => {
			if ( typeof item === 'object' ) {
				result += item.children[key].value || 0;
			}
		});
		return result;
	};

	array_calculate = key => {
		let result = 0;
		this.each((item, i) => {
			if ( typeof item === 'object' ) {
				result += item.children[key].calculate();
			}
		});
		return result;
	};
}
