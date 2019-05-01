import {Calculr} from "../Calculr/Calculr.class.js";
import {round, updateDOM} from "../library.js";
import {tests} from "./tests.js";

const oils = {
	0: {
		id: 0,
		name: 'Olive Oil',
		naoh_sap: 0.135,
		koh_sap: 0.19
	},
	1: {
		id: 1,
		name: 'Coconut Oil',
		naoh_sap: 0.183,
		koh_sap: 0.257
	}
};

export class Recipe {

	constructor() {
		updateDOM(this.calc);
	}

	calc = new Calculr({
		methods: {
			calc_naoh(calc) {
				calc.search('oils.list').array_calc('naoh_needed');
				calc.runcalc('oils.naoh_needed');
			},
			test_naoh(calc) {
				calc.assert('oils.naoh_needed', round(calc.search('oils.list').sum('naoh_needed')));
			},
			calc_koh(calc) {
				calc.search('oils.list').array_calc('koh_needed');
				calc.runcalc('oils.koh_needed');
			},
			test_oils_koh_needed(calc) {
				calc.assert('oils.koh_needed', round(calc.search('oils.list').sum('koh_needed')));
			},
			calc_alkali(calc) {
				calc.invoke('calc_naoh');
				calc.invoke('calc_koh');
			},
			calc_this_alkali(calc) {
				calc.search('oils.naoh_needed').calculate();
				calc.search('oils.koh_needed').calculate();
			},
		},
		fields: {
			'settings:object': {
				'cure_days': {
					after_input: self => self.runcalc('cured_at'),
					test_input: self =>
						self.assert([
							self.getval('cured_at').getDate(),
							self.getval('made_at').addDays(self.value).getDate()
						])
				},
				'naoh_perc': {
					default: 1,
					after_input: self => {
						self.runcalc('settings.koh_perc');
						self.invoke('calc_alkali');
					},
					on_calculate: self => 1 - self.getval('settings.koh_perc'),
					test_input: self => {
						self.assert('settings.koh_perc', round(1 - self.value));
						self.search('oils.list').each((obj, i) => {
							// self.invoke('test_this_alkali');
						})
					}
				},
				'koh_perc': {
					default: 0,
					after_input: self => {
						self.runcalc('settings.naoh_perc');
						self.invoke('calc_alkali');
					},
					on_calculate: self => 1 - self.getval('settings.naoh_perc'),
					test_input: self => {
						self.assert('settings.naoh_perc', round(1 - self.value));
					}
				},
				'naoh_purity': {
					default: 1,
					after_input: self => self.invoke('calc_naoh'),
					test_input: self => self.invoke('test_naoh')
				},
				'koh_purity': {
					default: 1,
					after_input: self => {
						// self.invoke('calc_koh');
						self.search('oils.list').array_calc('koh_needed');
						self.runcalc('oils.koh_needed');
					},
					test_input: self => {
						self.assert('oils.koh_needed', round(self.search('oils.list').sum('koh_needed')));
						self.search('oils.list').each((obj, i) => {
							let oil = (prop, return_str) =>
								return_str ?
									`oils.list[${i}].${prop}` :
									self.getval(`oils.list[${i}].${prop}`);
							self.assert(oil('koh_needed', true), round(
								( oil('oil').koh_sap || 0 ) *
								oil('weight') /
								self.getval('settings.koh_purity') *
								self.getval('settings.koh_perc'))
							)
						});
						self.invoke('test_oils_koh_needed');
					}
				}
			},
			'made_at:date': {
				after_input: self => self.runcalc('cured_at'),
				test_input: self => {
					self.assert([self.getval('cured_at').getDate(), self.value.addDays(self.getval('settings.cure_days')).getDate()])
				}
			},
			'*cured_at:date': {
				on_calculate: self => self.getval('made_at').addDays(self.getval('settings.cure_days'))
			},
			'oils:object': {
				'list:array': {
					on_delete: self => {
						self.runcalc('oils.weight');
						self.runcalc('oils.percent');
						self.runcalc('oils.naoh_needed');
						self.runcalc('oils.koh_needed');
					},
					test_delete: self => {
						self.assert('oils.weight', round(self.search('oils.list').sum('weight')));
						self.assert('oils.percent', round(self.search('oils.list').sum('percent')));
						self.assert('oils.naoh_needed', round(self.search('oils.list').sum('naoh_needed')));
						self.assert('oils.koh_needed', round(self.search('oils.list').sum('koh_needed')));
					},
					fields: {
						'oil_id': {
							after_input: self => {
								self.getSibling('oil').calculate();
								self.getSibling('naoh_needed').calculate();
								self.getSibling('koh_needed').calculate();
								self.invoke('calc_this_alkali');
							},
							test_input: self => {
								self.assert(self.getSibling('naoh_needed').registry_key, round(
									( self.getSibling('oil').value.naoh_sap || 0 ) *
									self.getSibling('weight').value /
									self.getval('settings.naoh_purity') *
									self.getval('settings.naoh_perc')
								));
								self.assert(self.getSibling('koh_needed').registry_key, round(
									( self.getSibling('oil').value.koh_sap || 0 ) *
									self.getSibling('weight').value /
									self.getval('settings.koh_purity') *
									self.getval('settings.koh_perc')
								));
							}
						},
						'*oil': {
							on_calculate: self => oils[self.getSibling('oil_id').value]
						},
						'weight:weight': {
							after_input: self => {
								self.runcalc('oils.weight');
								self.search('oils.list').array_calc('percent');
								self.runcalc('oils.percent');
								self.getSibling('naoh_needed').calculate();
								self.getSibling('koh_needed').calculate();
								self.invoke('calc_this_alkali');
							},
							on_calculate: self =>
								self.getval('oils.weight') *
								self.getSibling('percent').value,
							test_input: self => {
								self.search('oils.list').each((oil, i) => {
									self.assert(oil.findkey('percent'), round(oil.childval('weight') / self.getval('oils.weight')));
								});
								self.assert(`oils.percent`, 1);
								self.assert('oils.weight', round(self.search('oils.list').sum('weight')));
								self.invoke('test_naoh');
								self.assert('oils.koh_needed', round(self.search('oils.list').sum('koh_needed')));
								self.assert(self.getSibling('naoh_needed').registry_key, round(
									( self.getSibling('oil').value.naoh_sap || 0 ) *
									self.getSibling('weight').value /
									self.getval('settings.naoh_purity') *
									self.getval('settings.naoh_perc')
								));
								self.assert(self.getSibling('koh_needed').registry_key, round(
									( self.getSibling('oil').value.koh_sap || 0 ) *
									self.getSibling('weight').value /
									self.getval('settings.koh_purity') *
									self.getval('settings.koh_perc')
								));
							}
						},
						'percent': {
							after_input: self => {
								self.runcalc('oils.percent');
								self.getSibling('weight').calculate();
							},
							on_calculate: self =>
								self.getSibling('weight').value /
								self.getval('oils.weight'),
							test_input: self => {
								self.assert(self.getSibling('weight').registry_key, self.getval('oils.weight') * self.getSibling('percent').value);
								self.assert('oils.percent', self.search('oils.list').sum('percent'));
							}
						},
						'*naoh_needed:weight': {
							on_calculate: self =>
								( self.getSibling('oil').value.naoh_sap || 0 ) *
								self.getSibling('weight').value /
								self.getval('settings.naoh_purity') *
								self.getval('settings.naoh_perc')
						},
						'*koh_needed:weight': {
							on_calculate: self =>
								( self.getSibling('oil').value.koh_sap || 0 ) *
								self.getSibling('weight').value /
								self.getval('settings.koh_purity') *
								self.getval('settings.koh_perc')
						}
					}
				},
				'weight:weight': {
					after_input: self => self.search('oils.list').array_calc('weight'),
					on_calculate: self => self.search('oils.list').sum('weight'),
					test_input: self => {
						self.search('oils.list').each((oil, i) => {
							self.assert(oil.findkey('weight'), self.getval('oils.weight') * oil.childval('percent'))
						});
					}
				},
				'*percent': {
					on_calculate: self => self.search('oils.list').sum('percent')
				},
				'*naoh_needed:weight': {
					on_calculate: self => self.search('oils.list').sum('naoh_needed')
				},
				'*koh_needed:weight': {
					on_calculate: self => self.search('oils.list').sum('koh_needed')
				}
			}
		}
	});

	runTests() {
		this.calc.runTests(tests);
	}
}
