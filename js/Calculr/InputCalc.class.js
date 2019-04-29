import {round} from "../library.js";
import {Calculr} from "./Calculr.class.js";

function set(self, val) {
	if ( typeof val === 'number' ) {
		val = round(val);
	}
	self.value = val;
	self.getDataParent()[self.name] = val;
}

export class InputCalc {

	name = '';
	type = null;
	registry_key;
	value;

	constructor(options) {
		this.name = options.name;
		this.type = options.type;
		this.getInputConfig = () => options.input_config;
		this.getDataParent = () => options.data_parent;
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

	input = val => {
		if ( this.can_input ) {
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
			if ( typeof this.getInputConfig().after_input === 'function' ) {
				this.getInputConfig().after_input(this.getHelper());
			}
		}
		return this;
	};

	calculate = () => {
		let result = null;
		if ( typeof this.getInputConfig().on_calculate === 'function' ) {
			result = this.getInputConfig().on_calculate(this.getHelper());
		}
		set(this, result);
		return result;
	};


}