import {Field} from "./Field.js";
import {buildChildren} from "../buildChildren.js";

export class Group extends Field {

	type = 'group';

	constructor({config, ...options}) {
		super(options);
		this.children = buildChildren(this, {
			...config,
			prefix: this.registry_key + '.'
		});
	}

	find = key => this.root.search(this.registry_key+'.'+key);

	childval = key => this.find(key).value;

	findkey = key => this.find(key).registry_key;
}


export class CollectionItem extends Group {

	type = 'collection_item';

	constructor(options) {
		super(options);
	}

	getIndex = () => this.parent.items.indexOf(this);

	remove = () => {
		this.parent.remove_item(this);
	};
}
