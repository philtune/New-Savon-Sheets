import {Collection} from "./Field/Collection.js";
import {InputField} from "./Field/InputField.js";
import {Group} from "./Field/Group.js";

export const buildChildren = (parent, {prefix = '', ...children_configs}) =>
	Object.entries(children_configs).reduce((children, [key, config]) => {
		let
			[, shorthand_read_only, shorthand_name, shorthand_type = 'float'] = key.match(/(\*)?([^:]+):?(.*)?/),
			read_only = config.read_only || shorthand_read_only !== undefined,
			name = config.name || shorthand_name,
			type = config.type || shorthand_type,
			child_options = {
				name: name,
				registry_key: prefix + name,
				parent: parent,
				root: parent.root,
				config: config
			}
		;

		switch ( type.toLowerCase() ) {
			case 'group':
				children[name] = new Group({
					...child_options,
					data: parent.data[name] = {}
				});
				break;
			case 'collection':
				children[name] = new Collection({
					...child_options,
					data: parent.data[name] = []
				});
				break;
			default:
				children[name] = new InputField({
					...child_options,
					config: config,
					type: type,
					data: parent.data[name] = null,
					read_only: read_only
				});
				break;
		}
		return children;
	}, {});