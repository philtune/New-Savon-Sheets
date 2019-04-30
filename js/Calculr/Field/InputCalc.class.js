import {getCaller, round, updateDOM} from "../../library.js";
import {Calculr} from "../Calculr.class.js";
import {Field} from "./Field.class.js";

/**
 * @param self
 * @param val
 */
function set(self, val) {
	if ( typeof val === 'number' ) {
		val = round(val);
	}
	self.value = val;
	self.getDataParent()[self.name] = val;
}

function testInput(self, val) {
	const tH = Calculr.getTestHelpers(self.getRoot(), self);
	tH.warn('%c run() @ '+getCaller(5)+' ', 'background: #222; color: #bada55', `${self.registry_key} = ${val}`);
	tH.assert(self.registry_key, val);
	if ( typeof self.getTest() === 'function' ) {
		self.getTest()(tH.assert, tH.search, tH.getval, tH.thisval);
	}
}

export class InputCalc extends Field {

	type = null;
	value;

	constructor(options) {
		super(options);
		this.type = options.type;
		this.getTest = () => options.input_config.test;
		this.getOnCalculate = () => options.input_config.on_calculate;
		this.getAfterInput = () => options.input_config.after_input;
		if ( options.closest_array ) {
			this.closest_array = options.closest_array;
		}

		switch ( this.type ) {
			case 'date':
				set(this, 'default' in options.input_config ?
					options.input_config.default : new Date());
				break;
			case 'string':
				set(this, 'default' in options.input_config ?
					options.input_config.default : '');
				break;
			default:
				set(this, 'default' in options.input_config ?
					options.input_config.default : 0);
				break;
		}

		this.getHelper = () => Calculr.getHelper(this);
	}

	/**
	 * @param val
	 * @returns {InputCalc}
	 */
	input = val => {
		if ( !this.can_input ) {
			return this;
		}
		switch ( this.type ) {
			case 'date':
				val = new Date(Date.parse(val));
				break;
			case 'string':
				val = val.toString();
				break;
			default:
				val = parseFloat(val);
				break;
		}
		set(this, val);
		if ( typeof this.getAfterInput() === 'function' ) {
			this.getAfterInput()(this.getHelper());
		}
		updateDOM(this.getRoot());
		testInput(this, val);
		return this;
	};

	calculate = () => {
		let result;
		if ( typeof this.getOnCalculate() === 'function' ) {
			result = this.getOnCalculate()(this.getHelper());
		}
		set(this, result);
		return result;
	};


}