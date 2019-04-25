import {round} from "../library.js";
import {Calculr} from "./Calculr.class.js";

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

	constructor(options) {
		this.name = options.name;
		this.key = options.parent_key + options.name;
		this.getParent = () => options.parent;
		this.getSibling = key => options.parent.children[key];
		this.type = options.field_config.type;
		this.getConfig = () => options;
		if ( options.closest_array ) {
			this.closest_array = options.closest_array;
		}
		this.getRoot = () => options.root;

		switch ( this.type ) {
			case 'date':
				set(this, 'default' in options.field_config ?
					options.field_config.default : new Date());
				break;
			case 'string':
				set(this, 'default' in options.field_config ?
					options.field_config.default : '');
				break;
			default:
				set(this, 'default' in options.field_config ?
					options.field_config.default : 0);
				break;
		}

		this.getRoot().registry[this.key] = this;

		this.getHelper = () => Calculr.getHelper(this);
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
				this.getConfig().field_config.after_input(this.getHelper());
			}
		}
		return this;
	};

	calculate = () => {
		let result = null;
		if ( typeof this.getConfig().field_config.on_calculate === 'function' ) {
			result = this.getConfig().field_config.on_calculate(this.getHelper());
		}
		set(this, result);
		return result;
	};


}