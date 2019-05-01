import {ObjectCalc} from "./Field/ObjectCalc.class.js";
import {ArrayCalc} from "./Field/ArrayCalc.class.js";
import {InputCalc} from "./Field/InputCalc.class.js";
import {ForeignCalc} from "./Field/ForeignCalc.class.js";

export function fieldSet(options) {
	options.data = options.data || {};
	const children = {};
	const parent_key =
		options.parent_key !== null ?
			options.parent_key + '.' :
			'';
	Object.keys(options.children_configs).forEach(key => {
		let field_config = options.children_configs[key];
		let name_config = key.match(/(\*)?([^:]+):?(.*)?/);
		let
			static_input_indicator = name_config[1],
			name = name_config[2],
			type = name_config[3],
			child_obj,
			child_options = {
				name: name,
				registry_key: parent_key + name,
				parent: options.parent,
				registry: options.registry,
				data_parent: options.data,
				closest_array: options.closest_array || null,
				root: options.root
			}
		;

		switch ( type ) {
			case 'object':
				child_options.children_configs = field_config;
				child_options.data = options.data[name] = {};
				child_obj = new ObjectCalc(child_options);
				break;
			case 'array':
				child_options.array_config = field_config;
				child_options.children_configs = field_config.fields;
				child_options.data = options.data[name] = [];
				child_obj = new ArrayCalc(child_options);
				break;
			case 'foreign':
				child_obj = new ForeignCalc(child_options);
				break;
			default:
				options.data[name] = null;
				child_options.input_config = field_config;
				child_options.type = type || field_config.type || 'input';
				child_obj = new InputCalc(child_options);
				child_obj.can_input = static_input_indicator === undefined;
				break;
		}

		options.registry[child_obj.registry_key] = child_obj;

		children[name] = child_obj;
	});
	return children;
}
