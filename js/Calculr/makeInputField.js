import {getHelper} from "./getHelper.js";

export function makeInputField(field_calc, field_config, registry) {
	field_calc.type = field_config.type;
	switch ( field_calc.type ) {
		case 'date':
			field_calc.value = new Date();
			break;
		case 'string':
			field_calc.value = '';
			break;
		default:
			field_calc.value = 0;
			break;
	}

	const helper = getHelper(field_calc, registry);

	if ( field_config.input === undefined || !!field_config.input ) {
		field_calc.input = function(val) {
			switch ( field_calc.type ) {
				case 'date':
					val = new Date(Date.parse(val));
					break;
				case 'string':
					val = val.toString();
					break;
				case 'number':
					val = parseFloat(val);
					break;
			}
			this.value = val;
			if ( typeof field_config.input === 'function' ) {
				field_config.input(val, helper);
			}
			return this;
		};
	}

	if ( typeof field_config.calculated === 'function' ) {
		field_calc.calculate = function(){
			let result = field_config.calculated(helper);
			field_calc.value = result;
			return result;
		};
	}

	return field_calc;
}