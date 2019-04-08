import {Lib} from '../library.js';
import {makeInputField} from './makeInputField.js';
import {getHelper} from "./getHelper.js";

// input "config", output "calc"
export function Calculr(config) {

	// Build Calculr instance
	const Calculr = this;

	// index all fields in a registry
	window.registry = this.registry = {};
	// return any indexed field
	this.search = id => {
		if ( !Calculr.registry.hasOwnProperty(id) ) {
			return null;
		}
		return Calculr.registry[id]
	};

	// Build the calculator fields.
	this.fields = buildFields(config.fields || {});

	function buildFields(parent_configs, prefix) {
		const field_set = {};
		prefix = ( prefix !== undefined ) ? prefix + '.' : '';
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
				case 'array':
					field_calc = {
						id: field_id,
						type: 'array',
						parent: field_set,
						collection: [],
						add: function() {
							const collection_item = {
								id: this.id + '[' + this.collection.length + ']',
								type: 'object',
								parent: field_calc
							};
							collection_item.fields = buildFields(field_config.fields, collection_item.id);
							Calculr.registry[collection_item.id] = collection_item;
							this.collection.push(collection_item);
							if ( field_config.hasOwnProperty('on_add') && typeof field_config.on_add === 'function' ) {
								field_config.on_add(getHelper(collection_item, Calculr.registry));
							}
							return collection_item;
						},
						delete: function(index) {
							delete this.collection[index];
							if ( field_config.hasOwnProperty('on_delete') && typeof field_config.on_delete === 'function' ) {
								field_config.on_delete(getHelper(field_calc.collection[index], Calculr.registry));
							}
						},
						sum: function(key) {
							let result = 0;
							Lib.each(field_calc.collection, function(i, item) {
								result += item.fields[key].value;
							});
							return result;
						},
						array_calculate: function(key) {
							let result = 0;
							Lib.each(this.collection, function(i, item) {
								result += item.fields[key].calculate();
							});
							return result;
						}
					};
					break;
				case 'object':
					field_calc = {
						id: field_id,
						type: 'object',
						parent: field_set,
						fields: buildFields(field_config, field_id)
					};
					break;
				default:
					field_config.type = type || field_config.type || 'input';
					field_calc = makeInputField({
						id: field_id,
						type: field_config.type,
						parent: field_set
					}, {
						input: field_config.input || null,
						calculated: field_config.calculated || null
					}, Calculr.registry);
					break;
			}

			Calculr.registry[field_id] = field_calc;
			field_set[name] = field_calc;
		});
		return field_set;
	}

}
