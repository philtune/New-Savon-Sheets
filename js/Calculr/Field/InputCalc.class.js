import {getCaller, round, updateDOM} from "../../library.js";
import {Field} from "./Field.class.js";

function set(self, val) {
	if ( typeof val === 'number' ) {
		val = round(val);
	}
	// TODO: immutability?
	self.value = val;
	self.getDataParent()[self.name] = val;
}

function testInput(self, val) {
	self.assert(self.registry_key, val);
	if ( typeof self.getTestInput() === 'function' ) {
		self.getTestInput()(self);
	}
}

export class InputCalc extends Field {

	type = null;
	value;

	constructor({input_config: config, type='input', ...options} = {}) {
		super(options);
		this.type = type;
		this.getTestInput = () => config.test_input;
		this.getOnCalculate = () => config.on_calculate;
		this.getAfterInput = () => config.after_input;
		if ( options.closest_array ) {
			this.closest_array = options.closest_array;
		}

		switch ( this.type ) {
			case 'date':
				set(this, 'default' in config ?
					config.default : new Date());
				break;
			case 'string':
				set(this, 'default' in config ?
					config.default : '');
				break;
			default:
				set(this, 'default' in config ?
					config.default : 0);
				break;
		}
	}

	input = val => {
		let time = Date.now();
		console.warn(`%c ${this.registry_key}.input(${val}) @ ${getCaller(4)}`, 'background: #222; color: #bada55');
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
			this.getAfterInput()(this);
		}
		updateDOM(this.getRoot());
		testInput(this, val);
		console.warn('%c took '+(Date.now()-time)+'ms ', 'background: #666; color: #fff');
		return this;
	};

	calculate = () => {
		let result;
		if ( typeof this.getOnCalculate() === 'function' ) {
			result = this.getOnCalculate()(this);
		}
		set(this, result);
		return result;
	};


}