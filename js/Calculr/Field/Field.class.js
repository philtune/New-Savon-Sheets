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
	}
}