import {getHelper} from "./getHelper.function.js";
import {round} from "../library.js";

function set(self, val) {
	if ( typeof val === 'number' ) {
		val = round(val);
	}
	self.value = val;
	self.getConfig().data_parent[self.name] = val;
}

export class InputCalc {

	name = '';
	key = '';
	getParent = null;
	type = null;
	value;

	constructor(config) {
		this.name = config.name;
		this.key = config.parent_key + config.name;
		this.getParent = _ => config.parent;
		this.getSibling = key => config.parent.children[key];
		this.type = config.field_config.type;
		config.registry[this.key] = this;
		this.getConfig = _ => config;
		if ( config.closest_array ) {
			this.closest_array = config.closest_array;
		}

		switch ( this.type ) {
			case 'date':
				set(this, 'default' in config.field_config ?
					config.field_config.default : new Date());
				break;
			case 'string':
				set(this, 'default' in config.field_config ?
					config.field_config.default : '');
				break;
			default:
				set(this, 'default' in config.field_config ?
					config.field_config.default : 0);
				break;
		}
	}

	input = val => {
		if ( this.getConfig().can_input ) {
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
			if ( typeof this.getConfig().field_config.after_input === 'function' ) {
				this.getConfig().field_config.after_input(getHelper(this, this.getConfig().registry));
			}
		}
		return this;
	};

	calculate = _ => {
		let result = null;
		if ( typeof this.getConfig().field_config.on_calculate === 'function' ) {
			result = this.getConfig().field_config.on_calculate(getHelper(this, this.getConfig().registry));
		}
		set(this, result);
		return result;
	};
}