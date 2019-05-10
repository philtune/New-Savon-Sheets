import {buildChildren} from "./buildChildren.js";
import {InputField} from "./Field/InputField.js";

const recursiveLoad = (prefix, calc, loaded_data) => {
	Object.keys(loaded_data).forEach(key => {
		let registry_key = prefix + key;
		let field = calc.search(registry_key);
		switch ( field.type ) {
			case 'group':
				recursiveLoad(registry_key + '.', calc, loaded_data[key]);
				break;
			case 'collection':
				loaded_data[key].forEach((loaded_item) => {
					if ( loaded_item !== null ) {
						let collection_item = field.insert_item();
						recursiveLoad(field.registry_key+'#'+collection_item.name+'.', calc, loaded_item);
					}
				});
				break;
			default:
				field.load(loaded_data[key]);
				break;
		}
	});
};

export class Calculr {

	data = {};
	registry = {};
	methods = {};
	children;
	tags = {};
	watchers = {};

	lifecycle = {
		before_insert: null,
		after_insert: null,
		before_remove: null,
		after_remove: null,
		before_input: null,
		after_input: null,
		before_load: null,
		after_load: null,
		passed_assertion: null,
		failed_assertion: null
	};

	lifecycle_run = (event_str, ...rest) => {
		const event_exists = event_str in this.lifecycle;
		const event_is_function = typeof this.lifecycle[event_str] === 'function';
		if ( event_exists && event_is_function ) {
			this.lifecycle[event_str](...rest);
		}
	};

	constructor(config) {
		this.methods = config.methods || {};
		this.children = buildChildren(this, config.fields);
		Object.values(this.registry).forEach(watcher => {
			const watcherIsInputField = () => watcher instanceof InputField;
			if ( watcherIsInputField() ) {
				watcher.get_calculated(watcher, {
					...this.root,
					watch: watched_key => {
						const watched = this.search(watched_key);
						const beingWatched = () => watched.watchers.includes(watcher);
						if ( !beingWatched() ) {
							watched.watchers.push(watcher);
						}
						return watched.value;
					}
				});
			}
		});
	}

	on = (event_str, callback) => {
		const event_exists = event_str in this.lifecycle;
		if ( event_exists ) {
			this.lifecycle[event_str] = callback;
		}
		return this;
	};

	load = json => {
		this.lifecycle_run('before_load', this);
		recursiveLoad('', this, json);
		this.lifecycle_run('after_load', this);
	};

	toJSON = () => JSON.stringify(this.data);

	root = this;

	search = registry_key => {
		const registryKeyExists = () => this.registry.hasOwnProperty(registry_key);
		if ( !registryKeyExists() ) {
			throw new Error(`Registry key '${registry_key}' could not be found`);
		}
		return this.registry[registry_key];

	};

	getval = registry_key => this.search(registry_key).value;

	watch = registry_key => this.search(registry_key).value;

	get_calculated = registry_key => this.search(registry_key).calculate();

	invoke = (method_key, ...rest) => {
		const methodExists = () => method_key in this.methods;
		if ( !methodExists() ) {
			throw new Error(`Method ${method_key} does not exists`);
		}
		return this.methods[method_key](this, ...rest);
	};

	assert = (input, testVal) => {
		let passed = true, code;
		const inputIsFunction = () => typeof input === 'function';
		const inputIsString = () => typeof input === 'string';
		const inputIsArray = () => Array.isArray(input);

		if ( inputIsFunction() ) {
			code = input;
			passed = input();
		} else {
			if ( inputIsString() ) {
				passed = this.search(input).value === testVal;
				code = `${input} === ${testVal}`;
			} else if ( inputIsArray() ) {
				if ( testVal || false ) {
					passed = input[0] !== input[1];
					code = `${input[0]} !== ${input[1]}`;
				} else {
					passed = input[0] === input[1];
					code = `${input[0]} === ${input[1]}`;
				}
			}
		}
		if ( passed ) {
			this.lifecycle_run('passed_assertion', code);
		} else {
			this.lifecycle_run('failed_assertion', code);
		}
	};

}

export class MyDate extends Date {
	constructor(parse) {
		super(parse);
	}

	addDays = function(days) {
		const date = new MyDate(this.valueOf());
		date.setDate(date.getDate() + days);
		return date;
	};
}
