import {buildChildren} from "./buildChildren.js";
import {InputField} from "./Field/InputField.js";

export class Calculr {

	data = {};
	root = this;
	tags = {};

	constructor(config) {
		this.methods = config.methods || {};
		this.children = buildChildren(this, config.fields);
		buildWatchers(this);
	}

	lifecycle = {
		keys: {},
		set: (key, callback) => {
			this.lifecycle.keys[key] = callback;
			return this;
		},
		get: key => key in this.lifecycle.keys ? this.lifecycle.keys[key] : () => {}
	};

	setLifecycle = options => {
		Object.entries(options).forEach(([key, callback]) => this.lifecycle.set(key, callback));
		return this;
	};

	registry = {};
	search = registry_key => {
		if ( !this.registry.hasOwnProperty(registry_key) ) {
			console.error(`Registry key '${registry_key}' could not be found`);
			return null;
		}
		return this.registry[registry_key];
	};

	static Date = class extends Date {
		constructor() {
			super();
		}

		addDays = days => {
			const date = new Calculr.Date(this.valueOf());
			date.setDate(date.getDate() + days);
			return date;
		};

		static addDays = (date, days) => {
			const new_date = new Calculr.Date(date.valueOf());
			new_date.setDate(new_date.getDate() + days);
			return new_date;
		}
	};

	helper = {
		search: this.search,
		getval: registry_key => this.search(registry_key).value,
		watch: registry_key => this.search(registry_key).value,
		invoke: (method_key, ...rest) => {
			const methodExists = () => method_key in this.methods;
			if ( !methodExists() ) {
				throw new Error(`Method ${method_key} does not exists`);
			}
			return this.methods[method_key](this.helper, ...rest);
		},
		run_calculation: registry_key => this.search(registry_key).calculate(),
		Date: Calculr.Date
	};

	registerNode = (key, node) => {
		this.registry[key] = node;
		return this;
	};

	load = json => {
		this.lifecycle.get('before_load')(this);
		recursiveLoad('', this, json);
		this.lifecycle.get('after_load')(this);
	};

	toJSON = () => JSON.stringify(this.data);

}

const buildWatchers = calc => {
	Object.values(calc.registry).forEach(watcher => {
		if ( watcher instanceof InputField ) {
			watcher.get_calculated({
				...watcher.getHelper(),
				watch: watched_key => {
					const watched = calc.search(watched_key);
					if ( !watched.watchers.includes(watcher) ) {
						watched.watchers.push(watcher);
					}
					return watched.value;
				}
			});
		}
	});
	return calc;
};

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
