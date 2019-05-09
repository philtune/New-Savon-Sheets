const jsonify = window.jsonify = obj => {
	let cache = [];
	let result = JSON.stringify(obj, (key, value) => {
		const isNonNullObject = () => typeof value === 'object' && value !== null;
		if ( isNonNullObject() ) {
			if ( cache.includes(value) ) {
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
};

export const create_uid = (size, compare_arr=[]) => {
	let uid = '';
	do {
		uid = (Array(size+1).join("0") + ((Math.random() * Math.pow(36,size)) | 0).toString(36)).slice(-size);
	} while ( compare_arr.includes(uid) );
	return uid;
};

const colorCode = str => {
	str = str.replace(/("[^"]*")(\s*?[,\n])/g, '<span class="string">$1</span>$2');
	str = str.replace(/"([^"]*)":/g, '<span class="key">$1</span>:');
	str = str.replace(/([-+]?[0-9]*\.?[0-9]+)/g, '<span class="integer">$1</span>');
	return str;
};

const insertHTML = (selector, html) => {
	let elem = document.querySelector(selector);
	elem.innerHTML = '';
	elem.insertAdjacentHTML('afterbegin', html);
};

export const refreshDOM = () => {
	if ( 'recipe' in window ) {
		insertHTML('#output1', colorCode(jsonify(recipe.calc.children)));
		insertHTML('#output2', colorCode(jsonify(recipe.calc.data)));
	}
	if ( 'recipe2' in window ) {
		insertHTML('#output3', colorCode(jsonify(recipe2.calc.data)));
	}
};

export const switchcase = (test, cases) => cases.hasOwnProperty(test) ? cases[test] : (cases.hasOwnProperty('') ? cases[''] : null);

export const round = val => ((val, dig) => Math.round(val*(Math.pow(10, dig)))/Math.pow(10, dig))(val, 14);
export const percround = val => ((val, dig) => Math.round(val*(Math.pow(10, dig)))/Math.pow(10, dig))(val, 14);

export const getCaller = stack => {
	function getErrorObject(){
		try { throw Error('') } catch(err) { return err; }
	}

	let err = getErrorObject();
	let caller_line = err.stack.split("\n")[stack || 4];
	let index = caller_line.indexOf("at ");
	let clean = caller_line.slice(index+2, caller_line.length);
	return clean.split('/').pop();
};
