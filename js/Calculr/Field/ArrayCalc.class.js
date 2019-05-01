import {ObjectCalc} from "./ObjectCalc.class.js";
import {Field} from "./Field.class.js";
import {getCaller} from "../../library.js";

let collection_length = 0;

function testAdd(self) {
	console.warn(`%c ${self.registry_key}.add() @ ${getCaller(5)} `, 'background: #222; color: #bada55');
	self.assert([self.getLength(), ++collection_length]);
}

function testDelete(self, index) {
	console.warn(`%c ${self.registry_key}.delete(${index}) @ ${getCaller(5)} `, 'background: #222; color: #bada55');
	self.assert([self.collection[index], undefined]);
	if ( typeof self.getTestDelete() === 'function' ) {
		self.getTestDelete()(self);
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
		let time = Date.now();
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
			})
		;

		this.getRoot().registry[item.key] = item;

		// TODO: https://medium.com/@cristiansalcescu/learn-immutability-with-javascript-6a67e4a48d7f#f738
		this.collection.push(item);

		testAdd(this);
		console.warn('%c took '+(Date.now()-time)+'ms ', 'background: #666; color: #fff');
		return item;
	};

	delete = index => {
		let time = Date.now();
		// TODO: https://medium.com/@cristiansalcescu/learn-immutability-with-javascript-6a67e4a48d7f#f738
		// const newBooks = [...books.slice(0, index), ...books.slice(index + 1)];
		delete this.collection[index];
		delete this.getDataParent()[this.name][index];
		if ( typeof this.getOptions().array_config.on_delete === 'function' ) {
			this.getOptions().array_config.on_delete(this);
		}
		testDelete(this, index);
		console.warn('%c took '+(Date.now()-time)+'ms ', 'background: #666; color: #fff');
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

	array_calc = key => {
		let result = 0;
		this.each((item, i) => {
			if ( typeof item === 'object' ) {
				result += item.children[key].calculate();
			}
		});
		return result;
	};
}
