import {Calculr} from "../Calculr/Calculr.class.js";
import {recipe_tests} from "./tests.js";
import {round, updateDOM} from "../library.js";

class Oil {

	static get(key) {
		return {
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
		}[key];
	}

}

export class Recipe {

	constructor() {
		updateDOM(this.calc);
	}

	runTests() {
		this.calc.runTests(recipe_tests);
	}

	calc = new Calculr({
		methods: {
			calc_naoh(helper) {
				helper.calculate('oils.list','naoh_needed');
				helper.calculate('oils.naoh_needed');
			},
			test_naoh(helper) {
				helper.assert('oils.naoh_needed', round(helper.search('oils.list').sum('naoh_needed')));
			},
			calc_koh(helper) {
				helper.calculate('oils.list','koh_needed');
				helper.calculate('oils.koh_needed');
			},
			test_koh(helper) {
				helper.assert('oils.koh_needed', round(helper.search('oils.list').sum('koh_needed')));
			},
			calc_alkali(helper) {
				helper.invoke('calc_naoh');
				helper.invoke('calc_koh');
			},
			calc_this_alkali(helper) {
				helper.getSibling('naoh_needed').calculate();
				helper.getSibling('koh_needed').calculate();
				helper.calculate('oils.naoh_needed');
				helper.calculate('oils.koh_needed');
			},
			test_this_alkali(helper) {

			}
		},
		fields: {
			'settings:object': {
				'cure_days': {
					after_input: helper => helper.calculate('cured_at'),
					test_input: helper =>
						helper.assert([
							helper.getval('cured_at').getDate(),
							helper.getval('made_at').addDays(helper.self.value).getDate()
						])
				},
				'naoh_perc': {
					default: 1,
					after_input: helper => {
						helper.calculate('settings.koh_perc');
						helper.invoke('calc_alkali');
					},
					on_calculate: helper => 1 - helper.value('settings.koh_perc'),
					test_input: helper => {
						helper.assert('settings.koh_perc', round(1 - helper.self.value));
					}
				},
				'koh_perc': {
					default: 0,
					after_input: helper => {
						helper.calculate('settings.naoh_perc');
						helper.invoke('calc_alkali');
					},
					on_calculate: helper => 1 - helper.value('settings.naoh_perc'),
					test_input: helper => {
						helper.assert('settings.naoh_perc', round(1 - helper.self.value));
					}
				},
				'naoh_purity': {
					default: 1,
					after_input: helper => helper.invoke('calc_naoh'),
					test_input: helper => helper.invoke('test_naoh')
				},
				'koh_purity': {
					default: 1,
					after_input: helper => helper.invoke('calc_koh'),
					test_input: helper => {
						helper.assert('oils.koh_needed', round(helper.search('oils.list').sum('koh_needed')));
						helper.search('oils.list').each((obj, i) => {
							let oil = (prop, return_str) =>
								return_str ?
									`oils.list[${i}].${prop}` :
									helper.getval(`oils.list[${i}].${prop}`);
							helper.assert(oil('koh_needed', true), round(
								( oil('oil').koh_sap || 0 ) *
								oil('weight') /
								helper.getval('settings.koh_purity') *
								helper.getval('settings.koh_perc'))
							)
						});
						helper.invoke('test_koh');
					}
				}
			},
			'made_at:date': {
				after_input: helper => helper.calculate('cured_at'),
				test_input: helper => {
					helper.assert([helper.getval('cured_at').getDate(), helper.self.value.addDays(helper.getval('settings.cure_days')).getDate()])
				}
			},
			'*cured_at:date': {
				on_calculate: helper => helper.value('made_at').addDays(helper.value('settings.cure_days'))
			},
			'oils:object': {
				'list:array': {
					on_delete(helper) {
						helper.calculate('oils.weight');
						helper.calculate('oils.percent');
						helper.calculate('oils.naoh_needed');
						helper.calculate('oils.koh_needed');
					},
					test_delete: (assert, search, getval, self) => {
						assert('oils.weight', round(search('oils.list').sum('weight')));
						assert('oils.percent', round(search('oils.list').sum('percent')));
						assert('oils.naoh_needed', round(search('oils.list').sum('naoh_needed')));
						assert('oils.koh_needed', round(search('oils.list').sum('koh_needed')));
					},
					fields: {
						'oilForeign:foreign': Oil,
						// TODO: handle foreign resources
						'oil_id': {
							after_input: helper => {
								helper.getSibling('oil').calculate();
								helper.invoke('calc_this_alkali');
							},
							test_input: helper => {
								console.log('oil_id: finish testing alkali');
							}
						},
						'*oil': {
							on_calculate: helper => Oil.get(helper.getSibling('oil_id').value)
						},
						'weight:weight': {
							after_input: helper => {
								helper.calculate('oils.weight');
								helper.calculate('oils.list', 'percent');
								helper.calculate('oils.percent');
								helper.invoke('calc_this_alkali');
							},
							on_calculate: helper =>
								helper.value('oils.weight') *
								helper.getSibling('percent').value,
							test_input: helper => {
								helper.assert(`oils.percent`, 1);
								helper.search('oils.list').each((oil, i) => {
									helper.assert(oil.findkey('percent'), round(oil.getval('weight') / helper.getval('oils.weight')));
								});
								helper.assert('oils.weight', round(helper.search('oils.list').sum('weight')));
								helper.invoke('test_naoh');
								helper.assert('oils.koh_needed', round(helper.search('oils.list').sum('koh_needed')));

								console.log('weight: finish testing alkali');
							}
						},
						'percent': {
							after_input: helper => {
								helper.calculate('oils.percent');
								helper.getSibling('weight').calculate();
							},
							on_calculate: helper =>
								helper.getSibling('weight').value /
								helper.value('oils.weight'),
							test_input: helper => {
								helper.assert(helper.self.getSibling('weight').registry_key, helper.getval('oils.weight') * helper.self.getSibling('percent').value);
								helper.assert('oils.percent', helper.search('oils.list').sum('percent'));
							}
						},
						'*naoh_needed:weight': {
							on_calculate: helper =>
								( helper.getSibling('oil').value.naoh_sap || 0 ) *
								helper.getSibling('weight').value /
								helper.value('settings.naoh_purity') *
								helper.value('settings.naoh_perc'),
							test_calculate: helper => {
								helper.assert(helper.self.registry_key, round(
									( helper.self.getSibling('oil').value.naoh_sap || 0 ) *
									helper.self.getSibling('weight').value /
									helper.getval('settings.naoh_purity') *
									helper.getval('settings.naoh_perc'))
								)
							}
						},
						'*koh_needed:weight': {
							on_calculate: helper =>
								( helper.getSibling('oil').value.koh_sap || 0 ) *
								helper.getSibling('weight').value /
								helper.value('settings.koh_purity') *
								helper.value('settings.koh_perc')
						}
					}
				},
				'weight:weight': {
					after_input: helper => helper.calculate('oils.list', 'weight'),
					on_calculate: helper => helper.sum('oils.list', 'weight'),
					test_input: helper => {
						helper.search('oils.list').each((oil, i) => {
							helper.assert(oil.findkey('weight'), helper.getval('oils.weight') * oil.getval('percent'))
						});
					}
				},
				'*percent': {
					on_calculate: helper => helper.sum('oils.list', 'percent')
				},
				'*naoh_needed:weight': {
					on_calculate: helper => helper.sum('oils.list', 'naoh_needed')
				},
				'*koh_needed:weight': {
					on_calculate: helper => helper.sum('oils.list', 'koh_needed')
				}
			}
		}
	});
}
