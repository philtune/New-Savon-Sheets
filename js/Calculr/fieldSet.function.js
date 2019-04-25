import {ObjectCalc} from "./ObjectCalc.class.js";
import {ArrayCalc} from "./ArrayCalc.class.js";
import {InputCalc} from "./InputCalc.class.js";

export function fieldSet(config) {
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
			child_obj,
			child_config = {
				name: name,
				parent: config.parent,
				parent_key: parent_key,
				registry: config.registry,
				data_parent: config.data,
				closest_array: config.closest_array || null,
				root: config.root
			}
		;

		switch ( type ) {
			case 'object':
				config.data[name] = {};
				child_config.parent_type = 'object';
				child_config.children_configs = field_config;
				child_obj = new ObjectCalc(child_config);
				break;
			case 'array':
				config.data[name] = [];
				child_config.array_config = field_config;
				child_config.children_configs = field_config.fields;
				child_obj = new ArrayCalc(child_config);
				break;
			case 'foreign':
				child_obj = new ForeignCalc(child_config);
				break;
			default:
				config.data[name] = null;
				field_config.type = type || field_config.type || 'input';
				child_config.field_config = field_config;
				child_config.can_input = static_input_indicator === undefined;
				child_obj = new InputCalc(child_config);
				break;
		}

		children[name] = child_obj;
	});
	return children;
}
