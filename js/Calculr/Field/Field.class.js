export class Field {
	constructor(options) {
		this.name = options.name;
		this.registry_key = options.registry_key;
		this.getParent = () => options.parent;
		this.getSiblings = () => options.parent.children;
		this.getSibling = key => options.parent.children[key];
		this.getRoot = () => options.root;
		this.getDataParent = () => options.data_parent;
		this.getOptions = () => options;
		this.search = this.getRoot().search;
		this.getval = this.getRoot().getval;
		this.runcalc = this.getRoot().runcalc;
		this.invoke = this.getRoot().invoke;
		this.assert = this.getRoot().assert;
	}
}