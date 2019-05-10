import {methods} from "./methods.js";
import {oils_config} from "./oils_config.js";
import {settings_config} from "./settings_config.js";
import {additives_config} from "./additives_config.js";
import {liquids_config} from "./liquids_config.js";

/* koh_to_naoh_ratio -> 1.403 */

const OilOptions = window.OilOptions = {
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

export const calculr_config = {
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
		'settings:group': settings_config,
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
		'additives:group': additives_config,
		'oils:group': oils_config,
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
		'liquids:group': liquids_config
	},
	methods: methods
};
