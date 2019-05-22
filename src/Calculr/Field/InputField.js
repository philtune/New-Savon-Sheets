import {CalcNode} from "./CalcNode.js";
import {Calculr} from "../Calculr.js";

export class InputField extends CalcNode {

	type = null;
	value;
	input_str;
	input_elem = {};
	output_elem = {};

	constructor({config, type = 'input', ...options}) {
		super(options);
		registerTags(this, config);
		this.type = type;
		this.read_only = options.read_only;
		this.options = config.options || [];

		this.hiddenProperties({
			get_calculated: () => null,
			after_input: () => null,
			watchers: [],
			validate: val => {
				if ( val === '' ) {
					val = this.getDefault();
				}
				switch ( this.type ) {
					case 'date':
						val = new Calculr.Date(Calculr.Date.parse(val));
						if ( val.toString() === 'Invalid Date' ) {
							throw new Error('Invalid Date');
						}
						break;
					case 'string':
						val = val.toString();
						break;
					default:
						if ( typeof val === 'string' && /^[\d/*+-]+$/.test(val) ) {
							val = eval(val);
						} else {
							val = parseFloat(val);
						}
						break;
				}
				const hasOptions = () => this.options.length > 0;
				const valIsValidOption = () => !hasOptions() || this.options.includes(val);
				if ( !valIsValidOption() ) {
					throw new Error(`Value '${val}' is not valid option for '${this.registry_key}'`);
				}
				return val;
			},
			calculateWatchers: () => this.watchers.forEach(watcher => watcher.calculate()),
			load: val => {
				this.value = val;
				this.parent.data[this.name] = val;
				return this;
			}
		}, config);

		this.getDefault = () =>
			'default' in config ?
				config.default :
				(cases =>
					cases.hasOwnProperty(this.type) ?
						cases[this.type] :
						0
				)({
					date: new Calculr.Date(),
					string: ''
				});

		this.set(this.getDefault());
	}

	set = val => {
		this.value = val;
		this.parent.data[this.name] = val;
	};

	getHelper = () => ({
		...this.root.helper,
		self: this,
		get_sibling: this.get_sibling,
		parent: this.parent
	});

	input = val => {
		if ( !this.read_only ) {
			this.root.lifecycle.get('before_item_input')(this, this.root.helper, val);

			this.input_str = String(val);

			val = this.validate(val);
			// TODO: this.getTagMethods().before_input(val);
			this.set(val);
			if ( 'value' in this.input_elem ) {
				this.input_elem.value = this.value;
			}
			if ( 'innerText' in this.output_elem ) {
				this.output_elem.innerText = this.value;
			}
			this.calculateWatchers();
			this.after_input(this.getHelper());

			this.root.lifecycle.get('after_input')(this, val);
			// TODO: this.getTagMethods().output(val);
		}
		return this;
	};

	calculate = () => {
		let result = this.get_calculated(this.getHelper());
		if ( result === null ) {
			return this.value;
		}
		this.set(result);
		return result;
	};
}

const registerTags = (field, {tags = []}) => {
	field.tags = tags;
	const root_tags = field.root.tags;
	tags.forEach(tag => {
		const tagExists = () => tag in root_tags;
		const notAlreadyTagged = () => !Object.values(root_tags[tag]).find(obj => {
			return obj === field;
		});
		if ( !tagExists() ) {
			root_tags[tag] = [];
		}
		if ( notAlreadyTagged() ) {
			root_tags[tag].push(field);
		}
	});
};