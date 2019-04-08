export const Lib = {
	each: function(iterable, callback) {
		if ( Array.isArray(iterable) ) {
			for ( let i = 0; i < iterable.length; i++ ) {
				callback.call(iterable[i], i, iterable[i]);
			}
		} else if ( typeof iterable === 'object' ) {
			for ( let item in iterable ) {
				if ( iterable.hasOwnProperty(item) ) {
					callback.call(iterable[item], item, iterable[item]);
				}
			}
		}
	},
	jsonify: function(obj) {
		let cache = [];
		let result = JSON.stringify(obj, function(key, value) {
			if (typeof value === 'object' && value !== null) {
				if (cache.indexOf(value) !== -1) {
					// Duplicate reference found
					try {
						// If this value does not reference a parent it can be deduped
						return JSON.parse(JSON.stringify(value));
					} catch (error) {
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
	},
	colorCode: function(str) {
		// str = str.replace(/([\[\]])/g, '<span class="array">$1</span>');
		str = str.replace(/("[^"]*")(\s*?[,\n])/g, '<span class="string">$1</span>$2');
		str = str.replace(/"([^"]*)":/g, '<span class="key">$1</span>:');
		str = str.replace(/([-+]?[0-9]*\.?[0-9]+)/g, '<span class="integer">$1</span>');
		return str;
	},
	insertHTML: function(selector, html) {
		let elem = document.querySelector(selector);
		elem.innerHTML = '';
		elem.insertAdjacentHTML('afterbegin', html);
	},
	testParity: function(tests, repress_error) {
		const parity_elem = document.querySelector('#parity');
		repress_error = repress_error || false;
		const runTest = (test) => {
			let
				first_obj_result,
				second_obj_result,
				parity
			;
			test[0].call(this, generated_calc);
			second_obj_result = Lib.jsonify(generated_calc.fields);
			Lib.insertHTML('#output2', Lib.colorCode(second_obj_result));
			console.log(test[1]());
			if ( !repress_error ) {
				test[0].call(this, manual_calc);
				first_obj_result = Lib.jsonify(manual_calc);
				Lib.insertHTML('#output', Lib.colorCode(first_obj_result));
				parity = first_obj_result === second_obj_result;
				parity_elem.innerHTML = 'Parity: ' + parity;
				parity_elem.classList = parity;
				if ( first_obj_result !== second_obj_result ) {
					throw new Error('Parity error. Check the output.');
				}
			}
		};
		Lib.each(tests, function(i, test) {
			runTest(test);
		});
		if ( !repress_error ) {
			console.log('Tests complete!');
		}
	},
	unit_tests: (calc, tests, log) => {
		const runTest = (test) => {
			console.log('%c '+test[0], 'background: #222; color: #bada55');
			// console.log('Testing:', test[0]);
			test[0](calc.search);
			Lib.insertHTML('#output2', Lib.colorCode(Lib.jsonify(calc.fields)));
			let passed = test[1](calc.search);
			if ( passed ) {
				if ( log ) {
					console.log('%c Passed:', 'background: lightgreen', test[1]);
				}
			} else {
				console.error('%c Failed Assertion:', 'background: red; color: white', test[1]);
				throw new Error();
			}
		};
		Lib.each(tests, (i, test) => runTest(test));
	}
};

Date.prototype.addDays = function(days) {
	const date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};
