import {fieldSet} from "./fieldSet.function.js";
import {getCaller, headless, headlessError} from "../library.js";

export class Calculr {

	data = {};
	registry = {};
	methods = {};
	children;

	constructor(config) {
		this.children = fieldSet({
			children_configs: config.fields,
			parent: this,
			parent_key: null,
			registry: this.registry,
			data: this.data,
			root: this
		});
		this.methods = config.methods || {};
	}

	search = (registry_key, property) => {
		if ( this.registry.hasOwnProperty(registry_key) ) {
			const obj = this.registry[registry_key];
			switch ( property ) {
				case 'value': return obj.value;
				case 'calculate': return obj.calculate();
				default: return obj;
			}
		}
		return null;
	};

	getval = registry_key => this.search(registry_key, 'value');

	runcalc = registry_key => this.search(registry_key, 'calculate');

	invoke = method_key => {
		if ( method_key in this.methods ) {
			this.methods[method_key](this);
		}
	};

	assert = (input, testVal) => {
		const warn = [console.warn, headless][0];
		const error = [console.error, headlessError][0];
		let passed = true, code;
		if ( typeof input === 'function' ) {
			code = input;
			passed = input();
		} else {
			if ( typeof input === 'string' ) {
				passed = this.search(input).value === testVal;
				code = `${input} === ${testVal}`;
			} else if ( Array.isArray(input) ) {
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
			warn('%c Passed assert() @ '+getCaller()+' ', 'background: lightgreen', code);
		} else {
			error('%c Failed assert() @ '+getCaller()+' ', 'background: red; color: white', code);
			throw new Error('Testing Error');
		}
	};

	runTests = tests_cb =>
		tests_cb(this.search);

}

Date.prototype.addDays = function(days) {
	const date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};
