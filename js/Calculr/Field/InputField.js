import {getCaller, percround, round, switchcase} from "../../library.js";
import {Field} from "./Field.js";
import {MyDate} from "../Calculr.class.js";

const set = (field, val) => {
	const inArray = (test, arr) => arr.includes(test);
	if ( inArray(field.type, ['float']) ) {
		val = round(val);
	}
	if ( inArray(field.type, ['percent']) ) {
		val = percround(val);
	}
	field.value = val;
	field.parent.data[field.name] = val;
};

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

export class InputField extends Field {

	type = null;
	value;
	input_str;

	constructor({config, type = 'input', ...options}) {
		super(options);
		registerTags(this, config);
		this.type = type;
		this.read_only = options.read_only;
		this.options = config.options || [];

		this.hiddenProperties({
			get_calculated: () => null,
			after_input: () => null,
			test_input: () => null,
			watchers: [],
			validate: val => {
				switch ( this.type ) {
					case 'date':
						val = new MyDate(MyDate.parse(val));
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
						val = round(val);
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

		set(this,
			'default' in config ?
				config.default :
				switchcase(this.type, {
					date: new MyDate(),
					string: '',
					'': 0
				})
		);
	}

	input = val => {
		if ( this.read_only ) {
			return this;
		}

		this.root.lifecycle_run('before_input', this, val);

		this.input_str = String(val);

		val = this.validate(val);
		// TODO: this.getTagMethods().before_input(val);
		set(this, val);
		this.calculateWatchers();
		this.after_input(this, this.root);

		this.root.lifecycle_run('after_input', this, val);
		// TODO: this.getTagMethods().output(val);
		return this;
	};

	calculate = () => {
		let result = this.get_calculated(this, this.root);
		if ( result === null ) {
			return this.value;
		}
		set(this, result);
		return result;
	};

}