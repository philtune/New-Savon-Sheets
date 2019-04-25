import {Calculr} from "../Calculr/Calculr.class.js";
import {recipe_tests} from "./tests.js";
import {updateDOM} from "../library.js";

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
			calc_koh(helper) {
				helper.calculate('oils.list','koh_needed');
				helper.calculate('oils.koh_needed');
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
			}
		},
		fields: {
			'settings:object': {
				'cure_days': {
					after_input: helper => helper.calculate('cured_at')
				},
				'naoh_perc': {
					default: 1,
					after_input: helper => {
						helper.calculate('settings.koh_perc');
						helper.invoke('calc_alkali');
					},
					on_calculate: helper => 1 - helper.value('settings.koh_perc')
				},
				'koh_perc': {
					default: 0,
					after_input: helper => {
						helper.calculate('settings.naoh_perc');
						helper.invoke('calc_alkali');
					},
					on_calculate: helper => 1 - helper.value('settings.naoh_perc')
				},
				'naoh_purity': {
					default: 1,
					after_input: helper => helper.invoke('calc_naoh')
				},
				'koh_purity': {
					default: 1,
					after_input: helper => helper.invoke('calc_koh')
				}
			},
			'made_at:date': {
				after_input: helper => helper.calculate('cured_at')
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
					fields: {
						'oilForeign:foreign': Oil,
						// TODO: handle foreign resources
						'oil_id': {
							after_input: helper => {
								helper.getSibling('oil').calculate();
								helper.invoke('calc_this_alkali');
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
								helper.getSibling('percent').value
						},
						'percent': {
							after_input: helper => {
								helper.calculate('oils.percent');
								helper.getSibling('weight').calculate();
							},
							on_calculate: helper =>
								helper.getSibling('weight').value /
								helper.value('oils.weight')
						},
						'*naoh_needed:weight': {
							on_calculate: helper =>
								( helper.getSibling('oil').value.naoh_sap || 0 ) *
								helper.getSibling('weight').value /
								helper.value('settings.naoh_purity') *
								helper.value('settings.naoh_perc')
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
					on_calculate: helper => helper.sum('oils.list', 'weight')
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
		// TODO: add unit tests directly to this config
	});
}
