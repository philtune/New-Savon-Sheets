import {RecipeCalc} from "./RecipeCalc.js";

export class Recipe {

	uid;
	inputs;
	outputs;

	constructor({log_all=false, getInputs=null, getOutputs=null} = {}) {
		this.log_all = log_all;
		if ( getInputs ) {
			this.set_inputs(getInputs);
		}
		if ( getOutputs ) {
			this.set_outputs(getOutputs);
		}

		this.uid = 'recipe#' + create_uid(3); //FIXME - needs compare_arr
		this.calc = new RecipeCalc();
		this.calc.setLifecycle({
			after_insert: collection_item => {
				if ( this.log_all ) {
					console.warn(`%c ${collection_item.parent.registry_key}.insert_items() @ ${getCaller(5)} `, 'background: #222; color: #bada55');
				}
			},
			after_item_remove: self => {
				if ( this.log_all ) {
					console.warn(`%c ${self.registry_key}.remove() @ ${getCaller(5)} `, 'background: #222; color: #bada55');
					self.root.helper.assert(() => self.parent.items.indexOf(self) < 0);
				}
			},
			before_item_input: (self, val) => {
				if ( this.log_all ) {
					console.warn(`%c ${self.registry_key}.input(${val}) @ ${getCaller(5)}`, 'background: #222; color: #bada55');
				}
			},
			after_input: (self, val) => {
				refreshDOM();
			},
			after_load: calc => {
				refreshDOM();
			}
		});
	}

	save = () => {
		localStorage.setItem(this.uid, this.calc.toJSON());
		return this;
	};

	after_load = callback => {
		domready(e => {
			callback(this);
		});
		return this;
	};

	set_inputs = getInputs => {
		domready(e => {
			this.inputs = getInputs();
			this.inputs.forEach(input_elem => {
				const registry_key = input_elem.getAttribute('data-input');
				const field = this.calc.search(registry_key);
				field.input_elem = input_elem;
				input_elem.addEventListener('input', e => {
					field.input(e.target.value);
				});
				if ( field.input_elem.tagName.toLowerCase() === 'select' ) {
					field.options.forEach(opt_str => {
						let option = document.createElement('option');
						option.innerText = opt_str;
						field.input_elem.appendChild(option);
					});
				} else {
					let value = field.value;
					if ( field.type === 'date' ) {
						value = `${value.getMonth() + 1}/${value.getDate()}/${value.getFullYear()}`;
					}
					field.input_elem.value = value;
				}
			});
		});
	};

	set_outputs = getOutputs => {
		domready(e => {
			this.outputs = getOutputs();
			this.outputs.forEach(output_elem => {
				const registry_key = output_elem.getAttribute('data-output');
				const field = this.calc.search(registry_key);
				field.output_elem = output_elem;
				field.output_elem.innerText = field.value;
			});
		});
	};

	load = uid => {
		this.uid = uid;
		const json = localStorage.getItem(uid);
		if ( json ) {
			this.loadJSON(json);
		}
		return this;
	};

	loadJSON = json => {
		this.calc.load(JSON.parse(json));
		return this;
	};

	runTests = tests_cb => {
		if ( this.log_all ) {
			console.group('tests');
		}
		tests_cb(this.assert, this.calc.helper);
		if ( this.log_all ) {
			console.groupEnd();
		}
		return this;
	};

	assert = input => {
		if ( recipe.log_all ) {
			let code = input;
			if ( input() ) {
				console.warn('%c Passed assert() @ ' + getCaller(4) + ' ', 'background: lightgreen; color: black', code);
			} else {
				console.error('%c Failed assert() @ ' + getCaller(4) + ' ', 'background: red; color: white', code);
				throw new Error('Testing Error');
			}
		}
		return this.assert;
	}

}

const create_uid = (size, compare_arr = []) => {
	let uid = '';
	do {
		uid = ( Array(size + 1).join("0") + ( ( Math.random() * Math.pow(36, size) ) | 0 ).toString(36) ).slice(-size);
	} while ( compare_arr.includes(uid) );
	return uid;
};

const getCaller = stack => {
	function getErrorObject() {
		try {
			throw new Error('')
		} catch ( err ) {
			return err;
		}
	}

	let err = getErrorObject();
	let caller_line = err.stack.split("\n")[stack || 4];
	let index = caller_line.indexOf("at ");
	let clean = caller_line.slice(index + 2, caller_line.length);
	return clean.split('/').pop();
};

const insertHTML = (selector, html) => {
	let elem = document.querySelector(selector);
	elem.innerHTML = '';
	elem.insertAdjacentHTML('afterbegin', html);
};

const colorCode = str => {
	str = str.replace(/("[^"]*")(\s*?[,\n])/g, '<span class="string">$1</span>$2');
	str = str.replace(/"([^"]*)":/g, '<span class="key">$1</span>:');
	str = str.replace(/([-+]?[0-9]*\.?[0-9]+)/g, '<span class="integer">$1</span>');
	return str;
};

const jsonify = obj => {
	let cache = [];
	let result = JSON.stringify(obj, (key, value) => {
		const isNonNullObject = () => typeof value === 'object' && value !== null;
		if ( isNonNullObject() ) {
			if ( cache.includes(value) ) {
				// Duplicate reference found
				try {
					// If this value does not reference a parent it can be deduped
					return JSON.parse(JSON.stringify(value));
				} catch ( error ) {
					// discard key if value cannot be deduped
					return;
				}
			}
			// Store value in our collection
			cache.push(value);
		}
		return value;
	}, 4);
	cache = null;
	return result;
};

const refreshDOM = () => {
	if ( 'recipe' in window ) {
		insertHTML('#output1', colorCode(jsonify(recipe.calc.children)));
		insertHTML('#output2', colorCode(jsonify(recipe.calc.data)));
	}
	if ( 'recipe2' in window ) {
		insertHTML('#output3', colorCode(jsonify(recipe2.calc.data)));
	}
};

const showRecipes = () => {

	let btns_div = document.querySelector('#recipe_btns');
	btns_div.innerHTML = '';
	Object.entries(localStorage).forEach(([key, val]) => {
		let button = document.createElement("button");
		button.innerHTML = key;
		btns_div.appendChild(button);
		button.addEventListener("click", function() {
			alert(val);
		});
	});
};

const domready = callback => {
	document.addEventListener('DOMContentLoaded', callback);
};
