import {Field} from "./Field.class.js";

export class ForeignCalc extends Field {

	type = 'foreign';

	constructor(options) {
		super(options);
	}
}