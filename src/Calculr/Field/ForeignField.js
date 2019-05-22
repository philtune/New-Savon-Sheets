import {CalcNode} from "./CalcNode.js";

export class ForeignField extends CalcNode {

	type = 'foreign';

	constructor(options) {
		super(options);
	}
}