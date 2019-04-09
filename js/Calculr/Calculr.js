import {buildFields} from "./buildFields.js";

// input "config", output "calc"
export class Calculr {

	data = {};
	registry = {};
	field_set = {};

	constructor(config) {
		this.field_set = buildFields(config.fields || {}, null, this.registry);
	}

	search = id => {
		if ( !this.registry.hasOwnProperty(id) ) {
			return null;
		}
		return this.registry[id]
	}

}
