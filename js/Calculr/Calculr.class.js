import {fieldSet} from "./fieldSet.function.js";
import {getCaller, headless, headlessError, updateDOM} from "../library.js";

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


	static getHelper(field_calc) {
		const registry = field_calc.getRoot().registry;
		const helper = {
			search: key => {
				if ( registry.hasOwnProperty(key) ) {
					return registry[key];
				}
				return null;
			},
			self: field_calc,
			getParent: () => field_calc.getParent(),
			getSiblings: () => field_calc.getParent().children,
			getSibling: key => field_calc.getParent().children[key],
			value: key => helper.search(key).value,
			sum: (array_key, key) => helper.search(array_key).sum(key),
			closest_array: () => field_calc.closest_array,
			calculate: (array_key, key) =>
				( undefined !== key ) ?
					helper.search(array_key).array_calculate(key) :
					helper.search(array_key).calculate(),
			invoke: (key) => {
				if ( key in field_calc.getRoot().methods ) {
					field_calc.getRoot().methods[key](helper);
				}
			}
		};
		return helper;
	}

	search = key => {
		if ( this.registry.hasOwnProperty(key) ) {
			return this.registry[key];
		}
		return null;
	};

	runTests = tests_cb => {
		const warn = [console.warn, headless][0];
		const error = [console.error, headlessError][0];
		const run = (input, val) => {
			let
				code,
				input_calc
			;
			if ( typeof input === 'function' ) {
				code = input;
				input_calc = null;
				input();
			} else {
				if ( typeof input === 'string' && val !== undefined ) {
					input_calc = search(input);
					search(input).input(val);
					code = `${input} = ${val}`;
				}
			}
			warn('%c run() @ '+getCaller()+' ', 'background: #222; color: #bada55', code);
			updateDOM(this);
			return input_calc;
		};
		const search = this.search;
		const assert = (input, testVal) => {
			let passed = true, code;
			if ( typeof input === 'function' ) {
				code = input;
				passed = input();
			} else {
				if ( typeof input === 'string' ) {
					passed = search(input).value === testVal;
					code = `${input} === ${testVal}`;
				}
			}
			if ( passed ) {
				warn('%c Passed assert() @ '+getCaller()+' ', 'background: lightgreen', code);
			} else {
				error('%c Failed assert() @ '+getCaller()+' ', 'background: red; color: white', code);
				throw new Error('Testing Error');
			}
		};
		const getval = key => search(key).value;
		tests_cb(run, assert, search, getval);
	};

}

Date.prototype.addDays = function(days) {
	const date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};
