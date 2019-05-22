import {Calculr} from "../Calculr/Calculr.js";

/* koh_to_naoh_ratio -> 1.403 */

// export const round = val => ((val, dig) => Math.round(val*(Math.pow(10, dig)))/Math.pow(10, dig))(val, 14);
const round = val => val;

const OilOptions = {
	0: {
		name: 'Olive Oil',
		naoh_sap: 0.135,
		koh_sap: 0.189
	},
	1: {
		name: 'Coconut Oil',
		naoh_sap: 0.183,
		koh_sap: 0.257
	},
	2: {
		name: 'Palm Oil',
		naoh_sap: 0.144,
		koh_sap: 0.202
	},
	3: {
		name: 'Shea Butter',
		naoh_sap: 0.128,
		koh_sap: 0.180
	},
	4: {
		name: 'Castor Oil',
		naoh_sap: 0.128,
		koh_sap: 0.180
	}
};

export class RecipeCalc extends Calculr {
	constructor() {
		super({
			settings: {},
			// TODO: process tag methods
			tags: {
				'weight': {
					before_input: (helper, val) =>
						( {
							'kg': () => val * 1000000,
							'lb': () => val * 453592.368,
							'oz': () => val * 28349.523,
							'g': () => val * 1000,
							'mg': () => val
						}[helper.getval('settings.weight_unit')]() ),
					output: helper =>
						( {
							'kg': () => helper.self.value * 1 / 1000000,
							'lb': () => helper.self.value * 1 / 453592.368,
							'oz': () => helper.self.value * 1 / 28349.523,
							'g': () => helper.self.value * 1 / 1000,
							'mg': () => helper.self.value
						}[helper.getval('settings.weight_unit')]() )
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
						type: 'whole'
					},
					'naoh_percent': {
						type: 'percent',
						default: 1,
						after_input: helper => {
							helper.invoke('calc_alkali');
						},
						get_calculated: helper => 1 - helper.watch('settings.koh_percent')
					},
					'koh_percent': {
						type: 'percent',
						default: 0,
						after_input: helper => {
							helper.invoke('calc_alkali');
						},
						get_calculated: helper => 1 - helper.watch('settings.naoh_percent')
					},
					'naoh_purity': {
						type: 'percent',
						default: 1,
						after_input: helper => {
							helper.invoke('calc_naoh')
						}
					},
					'koh_purity': {
						type: 'percent',
						default: 1,
						after_input: helper => {
							helper.invoke('calc_koh')
						}
					},
					'lye_discount': {
						type: 'percent',
						default: .05,
						after_input: helper => {
							helper.invoke('calc_alkali');
						}
					}
				},
				'made_at': {
					type: 'date',
					after_input: helper => {
						helper.run_calculation('cured_at');
					}
				},
				'cured_at': {
					type: 'date',
					read_only: true,
					get_calculated: helper => helper.watch('made_at').addDays(helper.watch('settings.cure_days'))
				},
				'weight': {
					read_only: true,
					get_calculated: helper =>
						helper.getval('oils.weight') +
						helper.getval('alkali.weight') +
						helper.getval('liquids.weight') +
						helper.getval('additives.weight')
				},
				'additives:group': {
					'weight': {
						read_only: true,
						tags: ['weight'],
						get_calculated: helper => helper.get_sibling('list').sum('weight'),
					},
					'list:collection': {
						on_insert: helper => {},
						after_remove: helper => {},
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
								after_input: helper => {
									helper.get_sibling('calculation_type').input('percent_of_oils');
									helper.get_sibling('weight').calculate();
									helper.run_calculation('additives.weight');
									helper.run_calculation('weight');
								}
							},
							'weight': {
								after_input: helper => {
									helper.get_sibling('calculation_type').input('weight');
									helper.run_calculation('additives.weight');
									helper.run_calculation('weight');
								},
								get_calculated: helper =>
									({
										'custom': () => 0,
										'weight': () => helper.self.value,
										'percent_of_oils': () => helper.get_sibling('percent_of_oils').value * helper.getval('oils.weight')
									}[helper.get_sibling('calculation_type').value])()
							},
							'custom': {
								type: 'string',
								after_input: helper => {
									helper.get_sibling('calculation_type').input('custom')
								}
							}
						}
					}
				},
				'oils:group': {
					'weight': {
						tags: ['weight'],
						after_input: helper => helper.search('oils.list').calculate_collection('weight'),
						get_calculated: helper => helper.search('oils.list').sum('weight')
					},
					'*percent:percent': {
						get_calculated: helper => helper.search('oils.list').sum('percent')
					},
					'list:collection': {
						on_insert: helper => {},
						after_remove: helper => {
							helper.run_calculation('oils.weight');
							helper.run_calculation('oils.percent');
							helper.run_calculation('additives.weight');
							helper.invoke('calculateAlkali');
							helper.run_calculation('weight');
						},
						fields: {
							'oil_id:integer': {
								after_input: helper => {
									helper.get_sibling('oil').calculate();
									helper.get_sibling('naoh_needed').calculate();
									helper.get_sibling('koh_needed').calculate();
									helper.invoke('calculateAlkali');
								}
							},
							'*oil:foreign': {
								get_calculated: helper => OilOptions[helper.get_sibling('oil_id').value]
							},
							'weight': {
								tags: ['weight'],
								after_input: helper => {
									helper.run_calculation('oils.weight');
									helper.search('oils.list').calculate_collection('percent');
									helper.run_calculation('oils.percent');
									helper.get_sibling('naoh_needed').calculate();
									helper.get_sibling('koh_needed').calculate();
									helper.invoke('calculateAlkali');
									helper.run_calculation('weight');
								},
								get_calculated: helper =>
									helper.getval('oils.weight') *
									helper.get_sibling('percent').value
							},
							'percent': {
								type: 'percent',
								after_input: helper => {
									helper.run_calculation('oils.percent');
									helper.get_sibling('weight').calculate();
								},
								get_calculated: helper =>
									helper.get_sibling('weight').value /
									helper.getval('oils.weight')
							},
							'*naoh_needed': {
								tags: ['weight'],
								get_calculated: helper =>
									( helper.parent.find('oil').value.naoh_sap || 0 ) *
									helper.parent.find('weight').value /
									helper.getval('settings.naoh_purity') *
									helper.getval('settings.naoh_percent')
							},
							'*koh_needed': {
								tags: ['weight'],
								get_calculated: helper =>
									( helper.parent.find('oil').value.koh_sap || 0 ) *
									helper.parent.find('weight').value /
									helper.getval('settings.koh_purity') *
									helper.getval('settings.koh_percent')
							}
						}
					}
				},
				'alkali:group': {
					'naoh_needed': {
						read_only: true,
						tags: ['weight'],
						get_calculated: helper => helper.search('oils.list').sum('naoh_needed') * ( 1 - helper.getval('settings.lye_discount') )
					},
					'koh_needed': {
						read_only: true,
						tags: ['weight'],
						get_calculated: helper => helper.search('oils.list').sum('koh_needed') * ( 1 - helper.getval('settings.lye_discount') )
					},
					'weight': {
						read_only: true,
						type: 'weight',
						tags: ['weight'],
						get_calculated: helper => helper.get_sibling('naoh_needed').value + helper.get_sibling('koh_needed').value
					}
				},
				'liquids:group': {
					'weight': {
						read_only: true,
						tags: ['weight'],
						get_calculated: helper => helper.get_sibling('list').sum('weight'),
					},
					'percent': {
						type: 'percent',
						read_only: true,
						get_calculated: helper => helper.get_sibling('list').sum('percent')
					},
					'list:collection': {
						on_insert: helper => {},
						after_remove: helper => {},
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
								after_input: helper => {
									helper.get_sibling('calculation_type').input('percent_of_alkali');
									helper.get_sibling('weight').calculate();
									helper.run_calculation('liquids.weight');
									helper.run_calculation('weight');
								}
							},
							'percent_of_oils': {
								type: 'percent',
								after_input: helper => {
									helper.get_sibling('calculation_type').input('percent_of_oils');
									helper.get_sibling('weight').calculate();
								}
							},
							'weight': {
								after_input: helper => {
									helper.get_sibling('calculation_type').input('manual');
								},
								get_calculated: helper =>
									({
										'manual': () => helper.self.value,
										'percent_of_alkali': () => helper.get_sibling('percent_of_alkali').value * helper.getval('alkali.weight'),
										'percent_of_oils': () => null
									}[helper.get_sibling('calculation_type').value])()
							},
							'percent': {
								type: 'percent',
								default: 1,
								after_input: helper => {
									helper.run_calculation('liquids.percent');
									helper.get_sibling('weight').calculate();
								},
								get_calculated: helper =>
									helper.get_sibling('weight').value /
									helper.getval('liquids.weight'),
							}
						}
					}
				}
			},
			methods: {

				calculateAlkali: helper => {
					helper.run_calculation('alkali.naoh_needed');
					helper.run_calculation('alkali.koh_needed');
					helper.run_calculation('alkali.weight');
					helper.run_calculation('weight');
				},

				calc_naoh: helper => {
					helper.search('oils.list').calculate_collection('naoh_needed');
					helper.run_calculation('alkali.naoh_needed');
				},

				calc_koh: helper => {
					helper.search('oils.list').calculate_collection('koh_needed');
					helper.run_calculation('alkali.koh_needed');
				},

				calc_alkali: helper => {
					helper.invoke('calc_naoh');
					helper.invoke('calc_koh');
				}

			}
		});
	}
}
