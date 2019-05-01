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

function testInput(helper, self, val) {
	helper.assert(self.registry_key, val);
	if ( typeof self.getTestInput() === 'function' ) {
		self.getTestInput()(helper);
	}
}

function testCalculate(self) {
	const helper = Calculr.getTestHelpers(self.getRoot(), self);
	if ( typeof self.getTestCalculate() === 'function' ) {
		self.getTestCalculate()(helper);
	}
}

export class InputCalc extends Field {

	type = null;
	value;

	constructor(options) {
		super(options);
		this.type = options.type;
		this.getTestInput = () => options.input_config.test_input;
		this.getTestCalculate = () => options.input_config.test_calculate;
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
		const helper = Calculr.getTestHelpers(this.getRoot(), this);
		helper.warn('%c run() @ '+getCaller(4)+' ', 'background: #222; color: #bada55', `${this.registry_key} = ${val}`);
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
		testInput(helper, this, val);
		return this;
	};

	calculate = () => {
		let result;
		if ( typeof this.getOnCalculate() === 'function' ) {
			result = this.getOnCalculate()(this.getHelper());
		}
		set(this, result);
		testCalculate(this, result);
		return result;
	};


}