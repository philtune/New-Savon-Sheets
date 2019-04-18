import {fieldSet} from "./fieldSet.function.js";
import {getHelper} from "../Calculr/getHelper.function.js";
import {updateDOM} from "../library.js";

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
			data: this.data
		});
		this.methods = config.methods || {};
	}

	search = key => {
		if ( !this.registry.hasOwnProperty(key) ) {
			return null;
		}
		return this.registry[key]
	};

	runTests = cb => {
		const run = cb => {
			console.log('%c '+cb, 'background: #222; color: #bada55');
			cb();
			updateDOM();
		};
		const search = getHelper(this, this.registry).search;
		const assert = (input, testVal) => {
			let passed, code;
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
				console.log('%c '+code, 'background: lightgreen');
			} else {
				console.error('%c Failed Assertion:', 'background: red; color: white', code);
				throw new Error();
			}
		};
		cb(run, assert, search);
	};

	unit_tests = (tests, log) => {
		const runTest = (key,test) => {
			console.log('%c '+key+': '+test[0], 'background: #222; color: #bada55');
			test[0](this.search);
			updateDOM();
			if ( test.length > 1 ) {
				let passed = test[1](this.search);
				if ( passed ) {
					if ( log ) {
						console.log('%c Passed:', 'background: lightgreen', test[1]);
					}
				} else {
					console.error('%c Failed Assertion:', 'background: red; color: white', test[1]);
					throw new Error();
				}
			}
		};
		Object.keys(tests).forEach((key) => runTest(key,tests[key]));
	};

}

Date.prototype.addDays = function(days) {
	const date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};
