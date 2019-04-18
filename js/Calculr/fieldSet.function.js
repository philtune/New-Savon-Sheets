import {ObjectCalc} from "./ObjectCalc.class.js";
import {ArrayCalc} from "./ArrayCalc.class.js";
import {InputCalc} from "./InputCalc.class.js";

export const fieldSet = (config) => {
	config.data = config.data || {};
	const children = {};
	const parent_key =
		config.parent_key !== null ?
			config.parent_key + '.' :
			'';
	Object.keys(config.children_configs).forEach(function(key) {
		let field_config = config.children_configs[key];
		let name_config = key.match(/(\*)?([^:]+):?(.*)?/);
		let
			static_input_indicator = name_config[1],
			name = name_config[2],
			type = name_config[3],
			child_obj
		;

		switch ( type ) {
			case 'object':
				config.data[name] = {};
				child_obj = new ObjectCalc({
					name: name,
					parent: config.parent,
					parent_key: parent_key,
					parent_type: 'object',
					children_configs: field_config,
					registry: config.registry,
					data_parent: config.data,
					closest_array: config.closest_array || null
				});
				break;
			case 'array':
				config.data[name] = [];
				child_obj = new ArrayCalc({
					name: name,
					parent: config.parent,
					parent_key: parent_key,
					array_config: field_config,
					children_configs: field_config.fields,
					registry: config.registry,
					data_parent: config.data,
					closest_array: config.closest_array || null
				});
				break;
			default:
				config.data[name] = null;
				field_config.type = type || field_config.type || 'input';
				child_obj = new InputCalc({
					name: name,
					parent: config.parent,
					parent_key: parent_key,
					field_config: field_config,
					can_input: static_input_indicator === undefined,
					registry: config.registry,
					data_parent: config.data,
					closest_array: config.closest_array || null
				});
				break;
		}

		children[name] = child_obj;
	});
	return children;
};
