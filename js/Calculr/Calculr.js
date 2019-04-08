import {buildFields} from "./buildFields.js";

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
	this.fields = buildFields(config.fields || {}, null, this.registry);

}
