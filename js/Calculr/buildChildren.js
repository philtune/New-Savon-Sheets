import {switchcase} from "../library.js";
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
				registry: parent.root.registry,
				root: parent.root,
				config: config
			}
		;

		children[name] = switchcase(type, {
			group: () => new Group({
				...child_options,
				data: parent.data[name] = {}
			}),
			collection: () => new Collection({
				...child_options,
				data: parent.data[name] = []
			}),
			'': () => new InputField({
				...child_options,
				config: config,
				type: type,
				data: parent.data[name] = null,
				read_only: read_only
			})
		})();
		return children;
	}, {});