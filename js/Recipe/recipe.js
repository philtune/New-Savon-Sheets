import {Calculr} from "../Calculr/Calculr.class.js";

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

export const Recipe = new Calculr({
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
					helper.calculate('oils.list','naoh_needed');
					helper.calculate('oils.naoh_needed');
					helper.calculate('oils.list','koh_needed');
					helper.calculate('oils.koh_needed');
				},
				on_calculate: helper =>
					1
					- helper.value('settings.koh_perc')
			},
			'koh_perc': {
				default: 0,
				after_input: helper => {
					helper.calculate('settings.naoh_perc');
				},
				on_calculate: helper =>
					1
					- helper.value('settings.naoh_perc')
			},
			'naoh_purity': {
				default: 1,
				after_input: helper => {
					helper.calculate('oils.list','naoh_needed');
					helper.calculate('oils.naoh_needed');
				}
			},
			'koh_purity': {
				default: 1,
				after_input: helper => {
					helper.calculate('oils.list','koh_needed');
					helper.calculate('oils.koh_needed');
				}
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
					'oil_id': {
						after_input: helper => {
							helper.getSibling('oil').calculate();
							helper.getSibling('naoh_needed').calculate();
							helper.getSibling('koh_needed').calculate();
							helper.calculate('oils.naoh_needed');
							helper.calculate('oils.koh_needed');
						}
					},
					'*oil': {
						on_calculate: helper => oils[helper.getSibling('oil_id').value]
					},
					// 'oil:object': {
					// 	'id:index': {
					// 		after_input: helper => {
					// 			helper.getSibling('name').calculate();
					// 			helper.getSibling('naoh_sap').calculate();
					// 			helper.getSibling('koh_sap').calculate();
					// 			helper.getParent().getSibling('naoh_needed').calculate();
					// 			helper.getParent().getSibling('koh_needed').calculate();
					// 			helper.calculate('oils.naoh_needed');
					// 			helper.calculate('oils.koh_needed');
					// 		}
					// 	},
					// 	'*name:string': {
					// 		on_calculate: helper => oils[helper.getSibling('id').value].name
					// 	},
					// 	'*naoh_sap': {
					// 		on_calculate: helper => oils[helper.getSibling('id').value].naoh_sap
					// 	},
					// 	'*koh_sap': {
					// 		on_calculate: helper => oils[helper.getSibling('id').value].koh_sap
					// 	}
					// },
					'weight:weight': {
						after_input: helper => {
							helper.calculate('oils.weight');
							helper.calculate('oils.list', 'percent');
							helper.calculate('oils.percent');
							helper.getSibling('naoh_needed').calculate();
							helper.getSibling('koh_needed').calculate();
							helper.calculate('oils.naoh_needed');
							helper.calculate('oils.koh_needed');
						},
						on_calculate: helper =>
							helper.value('oils.weight')
							* helper.getSibling('percent').value
					},
					'percent': {
						after_input: helper => {
							helper.calculate('oils.percent');
							helper.getSibling('weight').calculate();
						},
						on_calculate: helper =>
							helper.getSibling('weight').value
							/ helper.value('oils.weight')
					},
					'*naoh_needed:weight': {
						on_calculate: helper =>
							helper.getSibling('oil').value.naoh_sap
							* helper.getSibling('weight').value
							/ helper.value('settings.naoh_purity')
					},
					'*koh_needed:weight': {
						on_calculate: helper =>
							helper.getSibling('oil').value.koh_sap
							* helper.getSibling('weight').value
							/ helper.value('settings.koh_purity')
					}
				}
			},
			'weight:weight': {
				after_input: helper => {
					helper.calculate('oils.list', 'weight');
				},
				on_calculate: helper =>
					helper.sum('oils.list', 'weight')
			},
			'*percent': {
				on_calculate: helper =>
					helper.sum('oils.list', 'percent')
			},
			'*naoh_needed:weight': {
				on_calculate: helper =>
					helper.sum('oils.list', 'naoh_needed')
			},
			'*koh_needed:weight': {
				on_calculate: helper =>
					helper.sum('oils.list', 'koh_needed')
			}
		}
	}
});
