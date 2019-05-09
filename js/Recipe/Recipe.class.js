import {Calculr, MyDate} from "../Calculr/Calculr.class.js";
import {create_uid, getCaller, percround, refreshDOM, round} from "../library.js";

const OLDOilOptions = {
	0: {
		name: 'Olive Oil',
		naoh_sap: 0.135,
		koh_sap: 0.19
	},
	1: {
		name: 'Coconut Oil',
		naoh_sap: 0.183,
		koh_sap: 0.257
	},
	2: {
		name: 'Palm Oil',
		naoh_sap: 0.144
	},
	3: {
		name: 'Shea Butter',
		naoh_sap: 0.128
	},
	4: {
		name: 'Castor Oil',
		naoh_sap: 0.128
	}
};

const OilOptions = {
	0: {
		name: 'Olive Oil',
		naoh_sap: 0.134
	},
	1: {
		name: 'Coconut Oil',
		naoh_sap: 0.178
	},
	2: {
		name: 'Palm Oil',
		naoh_sap: 0.144
	},
	3: {
		name: 'Shea Butter',
		naoh_sap: 0.128
	},
	4: {
		name: 'Castor Oil',
		naoh_sap: 0.128
	}
};

// TODO: move tests outside Calculr

const calculr_config = {
	settings: {},
	// TODO: process tag methods
	tags: {
		'weight': {
			before_input: (self, calc, val) =>
				({
					'kg': () => val * 1000000,
					'lb': () => val * 453592.368,
					'oz': () => val * 28349.523,
					'g': () => val * 1000,
					'mg': () => val
				}[calc.getval('settings.weight_unit')]()),
			output: (self, calc) =>
				({
					'kg': () => self.value * 1 / 1000000,
					'lb': () => self.value * 1 / 453592.368,
					'oz': () => self.value * 1 / 28349.523,
					'g': () => self.value * 1 / 1000,
					'mg': () => self.value
				}[calc.getval('settings.weight_unit')]())
		}
	},
	fields: {
		'settings:group': {
			'weight_unit': {
				type: 'string',
				default: 'mg',
				options: ['mg', 'g', 'oz', 'lb', 'kg']
			},
			'cure_days': {
				type: 'integer',
				test_input: (self, calc) =>
					calc.assert([
						calc.getval('cured_at').getDate(),
						calc.getval('made_at').addDays(self.value).getDate()
					])
			},
			'naoh_percent': {
				type: 'percent',
				default: 1,
				after_input: (self, calc) => {
					calc.invoke('calc_alkali');
				},
				get_calculated: (self, calc) => 1 - calc.watch('settings.koh_percent'),
				test_input: (self, calc) => {
					calc.assert('settings.koh_percent', round(1 - self.value));
					calc.invoke('test_each_oil_naoh_needed');
					calc.invoke('test_each_oil_koh_needed');
				}
			},
			'koh_percent': {
				type: 'percent',
				default: 0,
				after_input: (self, calc) => {
					calc.invoke('calc_alkali');
				},
				get_calculated: (self, calc) => 1 - calc.watch('settings.naoh_percent'),
				test_input: (self, calc) => {
					calc.assert('settings.naoh_percent', round(1 - self.value));
					calc.invoke('test_each_oil_naoh_needed');
					calc.invoke('test_each_oil_koh_needed');
				}
			},
			'naoh_purity': {
				type: 'percent',
				default: 1,
				after_input: (self, calc) => {
					calc.invoke('calc_naoh')
				},
				test_input: (self, calc) => {
					calc.assert('alkali.naoh_needed', round(calc.search('oils.list').sum('naoh_needed')));
				}
			},
			'koh_purity': {
				type: 'percent',
				default: 1,
				after_input: (self, calc) => {
					calc.invoke('calc_koh')
				},
				test_input: (self, calc) => {
					calc.invoke('test_each_oil_koh_needed');
					calc.assert('alkali.koh_needed', round(calc.search('oils.list').sum('koh_needed')));
				}
			},
			'lye_discount': {
				type: 'percent',
				default: .05,
				after_input: (self, calc) => {
					calc.invoke('calc_alkali');
				}
			}
		},
		'made_at': {
			type: 'date',
			after_input: (self, calc) => {
				calc.get_calculated('cured_at');
			},
			test_input: (self, calc) => {
				calc.assert([calc.getval('cured_at').getDate(), self.value.addDays(calc.getval('settings.cure_days')).getDate()])
			}
		},
		'cured_at': {
			type: 'date',
			read_only: true,
			get_calculated: (self, calc) => calc.watch('made_at').addDays(calc.watch('settings.cure_days'))
		},
		'weight': {
			read_only: true,
			get_calculated: (self, calc) =>
				calc.getval('oils.weight') +
				calc.getval('alkali.weight') +
				calc.getval('liquids.weight') +
				calc.getval('additives.weight')
		},
		'additives:group': {
			'weight': {
				read_only: true,
				tags: ['weight'],
				get_calculated: (self, calc) => self.get_sibling('list').sum('weight'),
			},
			'list:collection': {
				on_insert: (self, calc) => {},
				test_insert: (self, calc) => {},
				after_remove: (self, calc) => {},
				test_remove: (self, calc) => {},
				fields: {
					'name:string': {},
					'calculation_type': {
						type: 'string',
						default: 'weight',
						options: [
							'percent_of_oils',
							'weight',
							'custom'
						]
					},
					'percent_of_oils': {
						type: 'percent',
						after_input: (self, calc) => {
							self.get_sibling('calculation_type').input('percent_of_oils');
							self.get_sibling('weight').calculate();
							calc.get_calculated('additives.weight');
							calc.get_calculated('weight');
						}
					},
					'weight': {
						after_input: (self, calc) => {
							self.get_sibling('calculation_type').input('weight');
							calc.get_calculated('additives.weight');
							calc.get_calculated('weight');
						},
						get_calculated: (self, calc) =>
							({
								'custom': () => 0,
								'weight': () => self.value,
								'percent_of_oils': () => self.get_sibling('percent_of_oils').value * calc.getval('oils.weight')
							}[self.get_sibling('calculation_type').value])()
					},
					'custom': {
						type: 'string',
						after_input: (self, calc) => {
							self.get_sibling('calculation_type').input('custom')
						}
					}
				}
			}
		},
		'oils:group': {
			'weight': {
				tags: ['weight'],
				after_input: (self, calc) => calc.search('oils.list').calculate_collection('weight'),
				get_calculated: (self, calc) => calc.search('oils.list').sum('weight'),
				test_input: (self, calc) => {
					calc.search('oils.list').each(oil => {
						calc.assert(oil.findkey('weight'), round(calc.getval('oils.weight') * oil.childval('percent')))
					});
				}
			},
			'*percent:percent': {
				get_calculated: (self, calc) => calc.search('oils.list').sum('percent')
			},
			'list:collection': {
				on_insert: (self, calc) => {},
				test_insert: (self, calc) => {},
				after_remove: (self, calc) => {
					calc.get_calculated('oils.weight');
					calc.get_calculated('oils.percent');
					calc.get_calculated('additives.weight');
					calc.invoke('calculateAlkali');
					calc.get_calculated('weight');
				},
				test_remove: (self, calc) => {
					calc.assert('oils.weight', round(calc.search('oils.list').sum('weight')));
					calc.assert('oils.percent', percround(calc.search('oils.list').sum('percent')));
					calc.invoke('testAlkali');
				},
				fields: {
					'oil_id:integer': {
						after_input: (self, calc) => {
							self.get_sibling('oil').calculate();
							self.get_sibling('naoh_needed').calculate();
							self.get_sibling('koh_needed').calculate();
							calc.invoke('calculateAlkali');
						},
						test_input: (self, calc) => {
							calc.assert(() => typeof self.get_sibling('oil').value === 'object');
							calc.assert(self.get_sibling('naoh_needed').registry_key, round(calc.invoke('getThisOilNaohNeeded', self)));
							calc.assert(self.get_sibling('koh_needed').registry_key, round(calc.invoke('getThisOilKohNeeded', self)));
						}
					},
					'*oil:foreign': {
						get_calculated: (self, calc) => OilOptions[self.get_sibling('oil_id').value]
					},
					'weight': {
						tags: ['weight'],
						after_input: (self, calc) => {
							calc.get_calculated('oils.weight');
							calc.search('oils.list').calculate_collection('percent');
							calc.get_calculated('oils.percent');
							self.get_sibling('naoh_needed').calculate();
							self.get_sibling('koh_needed').calculate();
							calc.invoke('calculateAlkali');
							calc.get_calculated('weight');
						},
						get_calculated: (self, calc) =>
							calc.getval('oils.weight') *
							self.get_sibling('percent').value,
						test_input: (self, calc) => {
							calc.search('oils.list').each(oil => {
								calc.assert(oil.findkey('percent'), percround(oil.childval('weight') / calc.getval('oils.weight')));
							});
							calc.assert(`oils.percent`, 1);
							calc.assert('oils.weight', round(calc.search('oils.list').sum('weight')));
							calc.invoke('testAlkali');
							calc.assert(self.get_sibling('naoh_needed').registry_key, round(calc.invoke('getThisOilNaohNeeded', self)));
							calc.assert(self.get_sibling('koh_needed').registry_key, round(calc.invoke('getThisOilKohNeeded', self)));
						}
					},
					'percent': {
						type: 'percent',
						after_input: (self, calc) => {
							calc.get_calculated('oils.percent');
							self.get_sibling('weight').calculate();
						},
						get_calculated: (self, calc) =>
							self.get_sibling('weight').value /
							calc.getval('oils.weight'),
						test_input: (self, calc) => {
							calc.assert(self.get_sibling('weight').registry_key, round(calc.getval('oils.weight') * self.get_sibling('percent').value));
							calc.assert('oils.percent', percround(calc.search('oils.list').sum('percent')));
						}
					},
					'*naoh_needed': {
						tags: ['weight'],
						get_calculated: (self, calc) => calc.invoke('getThisOilNaohNeeded', self)
					},
					'*koh_needed': {
						tags: ['weight'],
						get_calculated: (self, calc) => calc.invoke('getThisOilKohNeeded', self)
					}
				}
			}
		},
		'alkali:group': {
			'naoh_needed': {
				read_only: true,
				tags: ['weight'],
				get_calculated: (self, calc) => calc.search('oils.list').sum('naoh_needed') * (1 - calc.getval('settings.lye_discount'))
			},
			'koh_needed': {
				read_only: true,
				tags: ['weight'],
				get_calculated: (self, calc) => calc.search('oils.list').sum('koh_needed') * (1 - calc.getval('settings.lye_discount'))
			},
			'weight': {
				read_only: true,
				type: 'weight',
				tags: ['weight'],
				get_calculated: (self, calc) => self.get_sibling('naoh_needed').value + self.get_sibling('koh_needed').value
			}
		},
		'liquids:group': {
			'weight': {
				read_only: true,
				tags: ['weight'],
				get_calculated: (self, calc) => self.get_sibling('list').sum('weight'),
			},
			'percent': {
				type: 'percent',
				read_only: true,
				get_calculated: (self, calc) => self.get_sibling('list').sum('percent')
			},
			'list:collection': {
				on_insert: (self, calc) => {},
				test_insert: (self, calc) => {},
				after_remove: (self, calc) => {},
				test_remove: (self, calc) => {},
				fields: {
					'name:string': {},
					'calculation_type': {
						type: 'string',
						default: 'manual',
						options: [
							'manual',
							'percent_of_alkali',
							'percent_of_oils'
						]
					},
					'percent_of_alkali': {
						type: 'percent',
						after_input: (self, calc) => {
							self.get_sibling('calculation_type').input('percent_of_alkali');
							self.get_sibling('weight').calculate();
							calc.get_calculated('liquids.weight');
							calc.get_calculated('weight');
						}
					},
					'percent_of_oils': {
						type: 'percent',
						after_input: (self, calc) => {
							self.get_sibling('calculation_type').input('percent_of_oils');
							self.get_sibling('weight').calculate();
						}
					},
					'weight': {
						after_input: (self, calc) => {
							self.get_sibling('calculation_type').input('manual');
						},
						get_calculated: (self, calc) =>
							({
								'manual': () => self.value,
								'percent_of_alkali': () => self.get_sibling('percent_of_alkali').value * calc.getval('alkali.weight'),
								'percent_of_oils': () => null
							}[self.get_sibling('calculation_type').value])()
					},
					'percent': {
						type: 'percent',
						default: 1,
						after_input: (self, calc) => {
							calc.get_calculated('liquids.percent');
							self.get_sibling('weight').calculate();
						},
						get_calculated: (self, calc) =>
							self.get_sibling('weight').value /
							calc.getval('liquids.weight'),
					}
				}
			}
		}
	},
	methods: {

		getThisOilNaohNeeded: (calc, self) =>
			( self.get_sibling('oil').value.naoh_sap || 0 ) *
			self.get_sibling('weight').value /
			calc.getval('settings.naoh_purity') *
			calc.getval('settings.naoh_percent'),

		getThisOilKohNeeded: (calc, self) =>
			( self.get_sibling('oil').value.koh_sap || 0 ) *
			self.get_sibling('weight').value /
			calc.getval('settings.koh_purity') *
			calc.getval('settings.koh_percent'),

		calculateAlkali(calc) {
			calc.get_calculated('alkali.naoh_needed');
			calc.get_calculated('alkali.koh_needed');
			calc.get_calculated('alkali.weight');
			calc.get_calculated('weight');
		},

		testAlkali(calc) {
			calc.assert('alkali.naoh_needed', round(calc.search('oils.list').sum('naoh_needed')));
			calc.assert('alkali.koh_needed', round(calc.search('oils.list').sum('koh_needed')));
			calc.assert('alkali.weight', round(calc.getval('alkali.naoh_needed')+calc.getval('alkali.koh_needed')));
		},

		calc_naoh(calc) {
			calc.search('oils.list').calculate_collection('naoh_needed');
			calc.get_calculated('alkali.naoh_needed');
		},

		calc_koh(calc) {
			calc.search('oils.list').calculate_collection('koh_needed');
			calc.get_calculated('alkali.koh_needed');
		},

		calc_alkali(calc) {
			calc.invoke('calc_naoh');
			calc.invoke('calc_koh');
		},

		test_each_oil_naoh_needed(calc) {
			calc.search('oils.list').each(self =>
				calc.assert(self.findkey('naoh_needed'), round(calc.invoke('getThisOilNaohNeeded', self)))
			);
		},

		test_each_oil_koh_needed(calc) {
			calc.search('oils.list').each(self =>
				calc.assert(self.findkey('koh_needed'), round(calc.invoke('getThisOilKohNeeded', self)))
			);
		}

	}
};

window.refreshDOM = refreshDOM;

export class Recipe {

	uid = 'recipe#'+create_uid(3);

	log_all;

	constructor({...config}={}) {
		this.log_all = config.log_all || false;
		let
			insert_start_time,
			remove_start_time,
			input_start_time,
			test_start_time
		;
		this.calc = new Calculr(calculr_config)
			.on('before_insert', calc => {
				insert_start_time = Date.now();
			})
			.on('after_insert', self => {
				if ( this.log_all ) {
					console.warn(`%c ${self.registry_key}.insert_items() @ ${getCaller(6)} `, 'background: #222; color: #bada55');
					self.root.assert([self.parent.getLength(), self.parent.num_items]);
					console.warn('%c took ' + ( Date.now() - insert_start_time ) + 'ms ', 'background: #666; color: #fff');
				}
			})
			.on('before_remove', self => {
				if ( this.log_all ) {
					remove_start_time = Date.now();
				}
			})
			.on('after_remove', self => {
				if ( this.log_all ) {
					console.warn(`%c ${self.registry_key}.remove() @ ${getCaller(5)} `, 'background: #222; color: #bada55');
					self.root.assert(() => self.parent.items.indexOf(self) < 0);
					self.parent.test_remove(self, self.root);
					console.warn('%c took ' + ( Date.now() - remove_start_time ) + 'ms ', 'background: #666; color: #fff');
				}
			})
			.on('before_input', (self, val) => {
				if ( this.log_all ) {
					input_start_time = MyDate.now();
					console.warn(`%c ${self.registry_key}.input(${val}) @ ${getCaller(4)}`, 'background: #222; color: #bada55');
				}
			})
			.on('after_input', (self, val) => {
				if ( this.log_all ) {
					self.root.assert(self.registry_key, val);
					self.test_input(self, self.root);
					console.warn('%c took ' + ( MyDate.now() - input_start_time ) + 'ms ', 'background: #666; color: #fff');
				}
				refreshDOM();
			})
			.on('before_load', calc => {
				console.log('Now loading saved recipe');
			})
			.on('after_load', calc => {
				refreshDOM()
			})
			.on('before_tests', calc => {
				if ( this.log_all ) {
					console.group('tests');
					test_start_time = Date.now();
				}
			})
			.on('passed_assertion', code => {
				if ( this.log_all ) {
					console.warn('%c Passed assert() @ ' + getCaller(6) + ' ', 'background: lightgreen; color: black', code);
				}
			})
			.on('failed_assertion', code => {
				if ( this.log_all ) {
					console.error('%c Failed assert() @ ' + getCaller(6) + ' ', 'background: red; color: white', code);
					throw new Error('Testing Error');
				}
			})
			.on('after_tests', calc => {
				if ( this.log_all ) {
					console.warn('%c all tests took ' + ( Date.now() - test_start_time ) + 'ms ', 'background: #666; color: #fff');
					console.groupEnd();
				}
			});
	}

	save = () => {
		localStorage.setItem(this.uid, this.calc.toJSON());
		return this;
	};

	load = uid => {
		this.uid = uid;
		const json = localStorage.getItem(uid);
		if ( json ) {
			this.loadJSON(json);
		}
		return this;
	};

	loadJSON = json => {
		this.calc.load(JSON.parse(json));
		return this;
	};

}
