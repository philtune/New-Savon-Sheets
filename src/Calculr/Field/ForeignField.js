import {Field} from "./Field.js";

export class ForeignField extends Field {

	type = 'foreign';

	constructor(options) {
		super(options);
	}
}