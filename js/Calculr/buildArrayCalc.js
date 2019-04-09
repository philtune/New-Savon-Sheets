import {getHelper} from "./getHelper.js";
import {Lib} from "../library.js";

export function buildArrayCalc(array_calc, array_config, buildFields, registry) {
	array_calc = Object.assign(array_calc, {
		type: 'array',
		collection: [],
		add: function() {
			const collection_item = {
				id: this.id + '[' + this.collection.length + ']',
				type: 'object',
				parent: array_calc
			};
			collection_item.field_set = buildFields(array_config.fields, collection_item.id, registry);
			registry[collection_item.id] = collection_item;
			this.collection.push(collection_item);
			if ( array_config.hasOwnProperty('on_add') && typeof array_config.on_add === 'function' ) {
				array_config.on_add(getHelper(collection_item, registry));
			}
			return collection_item;
		},
		delete: function(index) {
			delete this.collection[index];
			if ( array_config.hasOwnProperty('on_delete') && typeof array_config.on_delete === 'function' ) {
				array_config.on_delete(getHelper(array_calc.collection[index], registry));
			}
		},
		sum: function(key) {
			let result = 0;
			Lib.each(array_calc.collection, function(i, item) {
				if ( typeof item === 'object' ) {
					result += item.field_set[key].value;
				}
			});
			return result;
		},
		array_calculate: function(key) {
			let result = 0;
			Lib.each(this.collection, function(i, item) {
				if ( typeof item === 'object' ) {
					result += item.field_set[key].calculate();
				}
			});
			return result;
		}
	});

	return array_calc;
}
