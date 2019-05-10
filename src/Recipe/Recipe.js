import {Calculr, MyDate} from "../Calculr/Calculr.class.js";
import {colorCode, create_uid, getCaller, jsonify} from "../library.js";
import {calculr_config} from "./calculr_config.js";

// TODO: move tests outside Calculr

export class Recipe {

	log_all;

	uid = 'recipe#'+create_uid(3);

	constructor({...config}={}) {
		this.log_all = config.log_all || false;
		let
			insert_start_time,
			remove_start_time,
			input_start_time
		;
		this.calc = new Calculr(calculr_config)
			.on('before_insert', calc => {
				insert_start_time = Date.now();
			})
			.on('after_insert', self => {
				if ( this.log_all ) {
					console.warn(`%c ${self.registry_key}.insert_items() @ ${getCaller(6)} `, 'background: #222; color: #bada55');
					self.root.assert([self.parent.getLength(), self.parent.num_items]);
					console.warn('%c took ' + ( Date.now() - insert_start_time ) + 'ms ', 'background: #666; color: #fff');
				}
			})
			.on('before_remove', self => {
				if ( this.log_all ) {
					remove_start_time = Date.now();
				}
			})
			.on('after_remove', self => {
				if ( this.log_all ) {
					console.warn(`%c ${self.registry_key}.remove() @ ${getCaller(5)} `, 'background: #222; color: #bada55');
					self.root.assert(() => self.parent.items.indexOf(self) < 0);
					self.parent.test_remove(self, self.root);
					console.warn('%c took ' + ( Date.now() - remove_start_time ) + 'ms ', 'background: #666; color: #fff');
				}
			})
			.on('before_input', (self, val) => {
				if ( this.log_all ) {
					input_start_time = MyDate.now();
					console.warn(`%c ${self.registry_key}.input(${val}) @ ${getCaller(4)}`, 'background: #222; color: #bada55');
				}
			})
			.on('after_input', (self, val) => {
				if ( this.log_all ) {
					self.root.assert(self.registry_key, val);
					self.test_input(self, self.root);
					console.warn('%c took ' + ( MyDate.now() - input_start_time ) + 'ms ', 'background: #666; color: #fff');
				}
				refreshDOM();
			})
			.on('before_load', calc => {
				console.log('Now loading saved recipe');
			})
			.on('after_load', calc => {
				refreshDOM()
			})
			.on('passed_assertion', code => {
				if ( this.log_all ) {
					console.warn('%c Passed assert() @ ' + getCaller(6) + ' ', 'background: lightgreen; color: black', code);
				}
			})
			.on('failed_assertion', code => {
				if ( this.log_all ) {
					console.error('%c Failed assert() @ ' + getCaller(6) + ' ', 'background: red; color: white', code);
					throw new Error('Testing Error');
				}
			})
		;
		showRecipes();
	}

	save = () => {
		localStorage.setItem(this.uid, this.calc.toJSON());
		showRecipes();
		return this;
	};

	load = uid => {
		this.uid = uid;
		const json = localStorage.getItem(uid);
		if ( json ) {
			this.loadJSON(json);
		}
		showRecipes();
		return this;
	};

	loadJSON = json => {
		this.calc.load(JSON.parse(json));
		return this;
	};

	runTests = tests_cb =>  {
		let test_start_time;
		if ( this.log_all ) {
			console.group('tests');
			test_start_time = Date.now();
		}
		tests_cb(this.calc.search);
		if ( this.log_all ) {
			console.warn('%c all tests took ' + ( Date.now() - test_start_time ) + 'ms ', 'background: #666; color: #fff');
			console.groupEnd();
		}
		return this;
	};

}

const insertHTML = (selector, html) => {
	let elem = document.querySelector(selector);
	elem.innerHTML = '';
	elem.insertAdjacentHTML('afterbegin', html);
};

const refreshDOM = window.refreshDOM = () => {
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
		button.addEventListener ("click", function() {
			alert(val);
		});
	});
};
