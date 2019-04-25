function jsonify(obj) {
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
}

function colorCode(str) {
	// str = str.replace(/([\[\]])/g, '<span class="array">$1</span>');
	str = str.replace(/("[^"]*")(\s*?[,\n])/g, '<span class="string">$1</span>$2');
	str = str.replace(/"([^"]*)":/g, '<span class="key">$1</span>:');
	str = str.replace(/([-+]?[0-9]*\.?[0-9]+)/g, '<span class="integer">$1</span>');
	return str;
}

function insertHTML(selector, html) {
	let elem = document.querySelector(selector);
	elem.innerHTML = '';
	elem.insertAdjacentHTML('afterbegin', html);
}

export function updateDOM(calc) {
	insertHTML('#output2', colorCode(jsonify(calc.children)));
	insertHTML('#output1', colorCode(jsonify(calc.data)));
}

window.updateDOM = updateDOM;

export function round(val) { return ((val, dig) => Math.round(val*(Math.pow(10, dig)))/Math.pow(10, dig))(val, 8); }

export function getCaller() {
	function getErrorObject(){
		try { throw Error('') } catch(err) { return err; }
	}

	let err = getErrorObject();
	let caller_line = err.stack.split("\n")[4];
	let index = caller_line.indexOf("at ");
	let clean = caller_line.slice(index+2, caller_line.length);
	return clean.split('/').pop();
}

export function headless(...args) {
	setTimeout(console.warn.bind(console, ...args));
}

export function headlessError(...args) {
	setTimeout(console.error.bind(console, ...args));
}