import {Lib} from "../library.js";
import {buildArrayCalc} from "./buildArrayCalc.js";
import {makeInputField} from "./makeInputField.js";

export const buildFields = (parent_configs, prefix, registry) => {
	const field_set = {};
	prefix = ( prefix !== undefined && prefix !== null ) ? prefix + '.' : '';
	Lib.each(parent_configs, function(key, field_config) {
		let name_config = key.match(/(\*)?([^:]+):?(.*)?/);
		let
			indicator = name_config[1],
			name = name_config[2],
			type = name_config[3],
			field_id = prefix + name,
			field_calc
		;
		if ( indicator ) {
			field_config.input = false;
		}
		switch ( type ) {
			case 'object':
				field_calc = {
					id: field_id,
					parent: field_set,
					type: 'object',
					fields: buildFields(field_config, field_id, registry)
				};
				break;
			case 'array':
				field_calc = buildArrayCalc({
					id: field_id,
					parent: field_set
				}, field_config, buildFields, registry);
				break;
			default:
				field_config.type = type || field_config.type || 'input';
				field_calc = makeInputField({
					id: field_id,
					parent: field_set,
					type: field_config.type
				}, field_config, registry);
				break;
		}

		registry[field_id] = field_calc;
		field_set[name] = field_calc;
	});
	return field_set;
};
